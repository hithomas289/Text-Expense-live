require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const config = require('./src/config/config');
const { testConnection, initializeDatabase, closeConnection } = require('./src/config/database');
const WebhookController = require('./src/controllers/WebhookController');
const PaymentController = require('./src/payments/PaymentController');

// Initialize Express app
const app = express();
const port = config.server.port;

// Trust proxy for rate limiting (needed for ngrok and production)
app.set('trust proxy', 1);

// Initialize controllers
const webhookController = new WebhookController();
const paymentController = new PaymentController();

// Security middleware with CSP configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'", // Allow inline scripts for pricing functionality
        "'unsafe-hashes'", // Allow inline event handlers (onclick, etc.)
        "https://www.googletagmanager.com", // Google Analytics
        "https://www.google-analytics.com", // Google Analytics
        "https://js.stripe.com", // Stripe checkout
        "https://checkout.stripe.com" // Stripe checkout
      ],
      "script-src-attr": ["'unsafe-inline'"], // Allow inline event handlers
      styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles
      imgSrc: ["'self'", "data:", "https:"], // Allow images from anywhere
      connectSrc: [
        "'self'",
        "https://www.google-analytics.com", // Google Analytics
        "https://region1.google-analytics.com", // Google Analytics regional
        "https://*.google-analytics.com", // Google Analytics wildcard
        "https://analytics.google.com", // Google Analytics
        "https://stats.g.doubleclick.net", // Google Analytics
        "https://api.stripe.com", // Stripe API
        "https://checkout.stripe.com" // Stripe checkout
      ],
      frameSrc: [
        "'self'",
        "https://checkout.stripe.com", // Stripe checkout iframe
        "https://js.stripe.com" // Stripe elements
      ],
      fontSrc: ["'self'", "https:", "data:"], // Allow web fonts
    },
  },
}));
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware - Stripe webhook needs special handling
// CRITICAL: Raw middleware for webhook MUST come before any JSON parsing
app.use('/payment/webhook', express.raw({type: 'application/json'}));

// JSON parsing for all other routes (excludes webhook due to specific middleware above)
app.use((req, res, next) => {
  if (req.path === '/payment/webhook') {
    return next(); // Skip JSON parsing for webhook
  }
  express.json({ limit: '10mb' })(req, res, next);
});

app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving for uploaded files and reports
// Use absolute paths based on current working directory
const path = require('path');
const uploadsPath = path.join(process.cwd(), 'uploads');
const reportsPath = path.join(process.cwd(), 'reports');
console.log(`📁 Server serving uploads from: ${uploadsPath}`);
console.log(`📊 Server serving reports from: ${reportsPath}`);
console.log(`📂 Current working directory: ${process.cwd()}`);
console.log(`🔧 NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
app.use('/uploads', express.static(uploadsPath));

// Custom route for Excel reports with proper headers for iOS/Android compatibility
app.get('/reports/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(reportsPath, filename);

    // Security: Prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }

    // Check if file exists
    const fs = require('fs').promises;
    try {
      await fs.access(filePath);
    } catch (error) {
      console.error(`📊 Report file not found: ${filePath}`);
      return res.status(404).json({ error: 'Report not found' });
    }

    // Set proper headers for iOS Numbers and Android Excel compatibility
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache');

    console.log(`📊 Serving Excel report: ${filename} with iOS/Android compatible headers`);

    // Send file
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error serving report:', error);
    res.status(500).json({ error: 'Failed to serve report' });
  }
});

// Proxy endpoint for iOS Numbers compatibility - serves receipt files from S3 with proper headers
app.get('/receipt-download/:encodedKey', async (req, res) => {
  try {
    const encodedKey = req.params.encodedKey;

    // Decode the S3 key from base64
    const s3Key = Buffer.from(encodedKey, 'base64').toString('utf-8');

    console.log(`📎 iOS-compatible receipt download request for: ${s3Key}`);

    // Get file from S3
    const AWS = require('aws-sdk');
    const s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1'
    });

    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: s3Key
    };

    // Get S3 object
    const s3Object = await s3.getObject(params).promise();

    // Extract filename from S3 key (last part after /)
    const filename = s3Key.split('/').pop() || 'receipt';

    // Determine content type based on file extension
    let contentType = 'application/octet-stream';
    if (filename.match(/\.(jpg|jpeg)$/i)) {
      contentType = 'image/jpeg';
    } else if (filename.match(/\.png$/i)) {
      contentType = 'image/png';
    } else if (filename.match(/\.pdf$/i)) {
      contentType = 'application/pdf';
    }

    // Set headers for iOS/Android compatibility
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', s3Object.ContentLength);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year cache

    console.log(`✅ Serving receipt: ${filename} (${contentType}) for iOS/Android`);

    // Send file
    res.send(s3Object.Body);

  } catch (error) {
    console.error('❌ Error serving receipt from S3:', error);
    res.status(404).json({ error: 'Receipt not found or expired' });
  }
});

// Serve frontend static files
app.use(express.static('frontend'));

// Add request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Add ngrok bypass header for development
app.use((req, res, next) => {
  res.setHeader('ngrok-skip-browser-warning', 'true');
  next();
});

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'TextExpense WhatsApp Bot API',
    version: '1.0.1',
    environment: config.server.nodeEnv,
    timestamp: new Date().toISOString(),
    reportsPath: path.join(process.cwd(), 'reports')
  });
});

// Health check route - simple version for Railway
app.get('/health', async (req, res) => {
  try {
    // Try the full health check first
    if (webhookController && typeof webhookController.healthCheck === 'function') {
      return await webhookController.healthCheck(req, res);
    }
    // Fallback simple health check
    res.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      message: 'TextExpense Bot is running'
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// UNIFIED API endpoint for all frontend configuration (plans, pricing, WhatsApp number)
app.get('/api/config', (req, res) => {
  const litePrice = parseInt(process.env.LITE_PLAN_PRICE) || 299;
  const proPrice = parseInt(process.env.PRO_PLAN_PRICE) || 499;
  const trialLimit = parseInt(process.env.TRIAL_RECEIPT_LIMIT) || 5;
  const liteLimit = parseInt(process.env.LITE_RECEIPT_LIMIT) || 6;
  const proLimit = parseInt(process.env.PRO_RECEIPT_LIMIT) || 25;

  res.json({
    success: true,
    whatsappBotNumber: config.whatsapp.botNumber,
    plans: {
      trial: {
        receiptLimit: trialLimit,
        price: 0,
        priceFormatted: 'Free',
        historyMonths: 0
      },
      lite: {
        receiptLimit: liteLimit,
        price: litePrice,
        priceFormatted: `$${(litePrice / 100).toFixed(2)}`,
        historyMonths: 1
      },
      pro: {
        receiptLimit: proLimit,
        price: proPrice,
        priceFormatted: `$${(proPrice / 100).toFixed(2)}`,
        historyMonths: 3
      }
    }
  });
});

// Database migration endpoint
// const { runColumnMigration } = require('./scripts/migrate-endpoint');
// app.get('/migrate-db-column', runColumnMigration);

// Session enum update endpoint
// const { updateSessionEnum } = require('./scripts/update-session-enum');
app.get('/update-session-enum', async (req, res) => {
  try {
    // await updateSessionEnum();
    res.json({
      success: false,
      message: 'Migration script not available'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test SavedReceipt creation endpoint
// const { testSavedReceiptCreation } = require('./scripts/test-saved-receipt');
app.get('/test-saved-receipt', async (req, res) => {
  try {
    // await testSavedReceiptCreation();
    res.json({
      success: false,
      message: 'Test script not available'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.stack
    });
  }
});

// Duplicate endpoint removed - using unified /api/config above

// Debug endpoint to check environment variables
app.get('/debug/env', (req, res) => {
  res.json({
    hasWhatsAppToken: !!process.env.WHATSAPP_ACCESS_TOKEN,
    hasPhoneNumberId: !!process.env.WHATSAPP_PHONE_NUMBER_ID,
    hasWebhookToken: !!process.env.WEBHOOK_VERIFY_TOKEN,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    databaseUrlPrefix: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 20) + '...' : 'not set',
    nodeEnv: process.env.NODE_ENV,
    railwayEnv: process.env.RAILWAY_ENVIRONMENT || 'not set',
    whatsappBotNumber: config.whatsapp.botNumber
  });
});

// Debug endpoint to inspect database
app.get('/debug/database', async (req, res) => {
  try {
    const { sequelize } = require('./src/config/database');
    const phoneNumber = '+919603216152';

    // Check if database is connected
    await sequelize.authenticate();

    // Get user
    const { User } = require('./src/models/database/indexV2');
    const user = await User.findByPhoneNumber(phoneNumber);

    if (!user) {
      return res.json({ error: 'User not found', phoneNumber });
    }

    // Check expenses
    const Expense = require('./src/models/database/Expense');
    const receipts = await Expense.findAll({
      where: { userId: user.id, status: { [require('sequelize').Op.ne]: 'deleted' } },
      attributes: ['id', 'merchantName', 'totalAmount', 'status', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });

    // Check usage limits
    const UsageLimitV2 = require('./src/models/database/UsageLimitV2');
    const usageLimits = await UsageLimitV2.findAll({
      where: { userId: user.id },
      attributes: ['expensesProcessed', 'expensesLimit', 'monthYear', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });

    // Count current month receipts
    const { Op } = require('sequelize');
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const monthlyReceiptCount = await Receipt.count({
      where: {
        userId: user.id,
        status: 'completed',
        createdAt: {
          [Op.gte]: monthStart,
          [Op.lte]: monthEnd
        }
      }
    });

    res.json({
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        planType: user.planType,
        receiptsUsedThisMonth: user.receiptsUsedThisMonth
      },
      receipts: {
        total: receipts.length,
        data: receipts
      },
      usageLimits: {
        total: usageLimits.length,
        data: usageLimits
      },
      analysis: {
        monthlyReceiptCount,
        usageCounter: usageLimits[0]?.expensesProcessed || 0,
        discrepancy: (usageLimits[0]?.expensesProcessed || 0) - monthlyReceiptCount
      }
    });

  } catch (error) {
    res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
});

// Debug endpoint to list reports directory
app.get('/debug/reports', async (req, res) => {
  try {
    const fs = require('fs').promises;
    const path = require('path');

    const reportsPath = path.join(process.cwd(), 'reports');

    console.log(`📊 Checking reports directory: ${reportsPath}`);

    try {
      const files = await fs.readdir(reportsPath);
      const fileDetails = await Promise.all(
        files.map(async (file) => {
          const filePath = path.join(reportsPath, file);
          const stats = await fs.stat(filePath);
          return {
            name: file,
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime
          };
        })
      );

      res.json({
        success: true,
        reportsPath,
        filesCount: files.length,
        files: fileDetails
      });
    } catch (dirError) {
      res.json({
        success: false,
        reportsPath,
        error: `Directory error: ${dirError.message}`,
        exists: false
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Quick fix endpoint to reset usage counter
app.post('/debug/fix-counts', async (req, res) => {
  try {
    console.log('🔧 Quick fix: Resetting usage counter to match actual receipts...');

    const { sequelize } = require('./src/config/database');
    const { User } = require('./src/models/database/indexV2');
    const Receipt = require('./src/models/database/Receipt');
    const UsageLimitV2 = require('./src/models/database/UsageLimitV2');

    await sequelize.authenticate();

    // Find your user
    const phoneNumber = '+919603216152';
    const user = await User.findByPhoneNumber(phoneNumber);

    if (!user) {
      return res.json({ error: 'User not found' });
    }

    // Count actual receipts this month
    const { Op } = require('sequelize');
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const actualReceiptCount = await Receipt.count({
      where: {
        userId: user.id,
        status: 'completed',
        createdAt: {
          [Op.gte]: monthStart,
          [Op.lte]: monthEnd
        }
      }
    });

    // Get current usage limit
    const usageLimit = await UsageLimitV2.findOne({
      where: { userId: user.id },
      order: [['createdAt', 'DESC']]
    });

    if (!usageLimit) {
      return res.json({ error: 'No usage limit record found' });
    }

    const oldCount = usageLimit.expensesProcessed;

    // Fix the counter
    usageLimit.expensesProcessed = actualReceiptCount;
    await usageLimit.save();

    res.json({
      success: true,
      message: 'Count discrepancy fixed!',
      details: {
        actualReceiptCount,
        oldUsageCounter: oldCount,
        newUsageCounter: actualReceiptCount,
        discrepancyFixed: oldCount - actualReceiptCount
      }
    });

  } catch (error) {
    res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
});

// Reset saved receipt usage endpoint
// const { resetSavedUsage } = require('./scripts/reset-saved-usage');
app.get('/reset-saved-usage', async (req, res) => {
  try {
    // await resetSavedUsage();
    res.json({
      success: false,
      message: 'Reset script not available'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.stack
    });
  }
});


// Webhook routes
app.get('/webhook', webhookController.verifyWebhook.bind(webhookController));
app.post('/webhook', webhookController.handleIncomingMessage.bind(webhookController));

// Admin/utility routes
app.post('/add-contact', webhookController.addContact.bind(webhookController));
app.get('/stats', webhookController.getSessionStats.bind(webhookController));
app.delete('/session/:phoneNumber', webhookController.resetUserSession.bind(webhookController));

// Payment routes
app.use('/payment', paymentController.getRouter());

// Share redirect route for automatic WhatsApp sharing
app.get('/share-redirect', (req, res) => {
  try {
    const { url, phone } = req.query;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameter: url'
      });
    }
    
    // Decode the WhatsApp share URL
    const decodedUrl = decodeURIComponent(url);
    
    // Log the share action for analytics
    console.log(`📱 Share redirect requested by ${phone || 'unknown'}: ${decodedUrl}`);
    
    // Create HTML page that automatically redirects to WhatsApp sharing
    const redirectHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sharing TextExpense...</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
            padding: 20px;
        }
        .container {
            background: rgba(255, 255, 255, 0.1);
            padding: 30px;
            border-radius: 15px;
            backdrop-filter: blur(10px);
            max-width: 400px;
            width: 100%;
        }
        .icon {
            font-size: 60px;
            margin-bottom: 20px;
        }
        h1 {
            margin: 0 0 10px 0;
            font-size: 24px;
        }
        p {
            margin: 0 0 30px 0;
            opacity: 0.9;
            line-height: 1.6;
        }
        .share-button {
            background: #25D366;
            color: white;
            padding: 15px 30px;
            border: none;
            border-radius: 25px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 10px;
            transition: background-color 0.3s;
        }
        .share-button:hover {
            background: #1ea952;
        }
        .loading {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid rgba(255,255,255,.3);
            border-radius: 50%;
            border-top-color: #fff;
            animation: spin 1s ease-in-out infinite;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        .auto-redirect {
            margin-top: 20px;
            font-size: 12px;
            opacity: 0.7;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">📱</div>
        <h1>Share TextExpense</h1>
        <p>Sharing your expense tracking tool with colleagues...</p>
        
        <div id="redirect-content">
            <div class="loading"></div>
            <p style="margin-top: 15px;">Opening WhatsApp...</p>
        </div>
        
        <div id="manual-fallback" style="display: none;">
            <p>If WhatsApp doesn't open automatically:</p>
            <a href="${decodedUrl}" class="share-button" target="_blank">
                📱 Open WhatsApp Share
            </a>
        </div>
        
        <div class="auto-redirect">
            Redirecting automatically in <span id="countdown">3</span> seconds...
        </div>
    </div>

    <script>
        let countdown = 3;
        const countdownElement = document.getElementById('countdown');
        const redirectContent = document.getElementById('redirect-content');
        const manualFallback = document.getElementById('manual-fallback');
        
        // Update countdown
        const timer = setInterval(() => {
            countdown--;
            countdownElement.textContent = countdown;
            
            if (countdown <= 0) {
                clearInterval(timer);
                // Attempt automatic redirect
                window.location.href = '${decodedUrl}';
                
                // Show manual fallback after a delay
                setTimeout(() => {
                    redirectContent.style.display = 'none';
                    manualFallback.style.display = 'block';
                }, 2000);
            }
        }, 1000);
        
        // Also redirect on page load for mobile browsers
        setTimeout(() => {
            window.location.href = '${decodedUrl}';
        }, 3000);
    </script>
</body>
</html>`;
    
    res.setHeader('Content-Type', 'text/html');
    res.send(redirectHtml);
    
  } catch (error) {
    console.error('Error in share redirect:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing share redirect',
      error: error.message
    });
  }
});

// Debug route to check database data
app.get('/debug/:phoneNumber', async (req, res) => {
  try {
    const { User, Session, Receipt } = require('./src/models/database');
    const phoneNumber = req.params.phoneNumber;
    
    const user = await User.findOne({
      where: { phoneNumber },
      include: [
        { model: Session, as: 'session' },
        { model: Receipt, as: 'receipts', limit: 5 }
      ]
    });
    
    res.json({
      success: true,
      data: user,
      currentReceipt: user?.session?.currentReceipt || null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Receipt Flow Debug endpoint  
app.get('/debug-receipt', async (req, res) => {
  try {
    console.log('🔍 Receipt debug endpoint called');
    // const { debugReceiptFlow } = require('./debug-receipt-flow');
    
    // Capture console output
    const originalLog = console.log;
    const originalError = console.error;
    const logs = [];
    
    console.log = (...args) => {
      logs.push({ type: 'log', message: args.join(' ') });
      originalLog(...args);
    };
    
    console.error = (...args) => {
      logs.push({ type: 'error', message: args.join(' ') });
      originalError(...args);
    };
    
    try {
      // await debugReceiptFlow();
      logs.push({ type: 'log', message: 'Debug script not available' });
    } finally {
      // Restore console
      console.log = originalLog;
      console.error = originalError;
    }
    
    res.json({
      success: true,
      message: 'Receipt flow debug completed',
      logs: logs,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Receipt debug endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Receipt debug failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// S3 Debug endpoint for production troubleshooting
app.get('/debug-s3', async (req, res) => {
  try {
    console.log('🔧 S3 Debug endpoint called');
    // const { debugS3Production } = require('./debug-s3-production');
    
    // Capture console output
    const originalLog = console.log;
    const originalError = console.error;
    const logs = [];
    
    console.log = (...args) => {
      logs.push({ type: 'log', message: args.join(' ') });
      originalLog(...args);
    };
    
    console.error = (...args) => {
      logs.push({ type: 'error', message: args.join(' ') });
      originalError(...args);
    };
    
    try {
      // await debugS3Production();
      logs.push({ type: 'log', message: 'S3 Debug script not available' });
    } finally {
      // Restore console
      console.log = originalLog;
      console.error = originalError;
    }
    
    res.json({
      success: true,
      message: 'S3 debug completed',
      logs: logs,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('S3 debug endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'S3 debug failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Receipt count debug endpoint
app.get('/debug-count', async (req, res) => {
  try {
    const phoneNumber = req.query.phone || '+919603216152';
    const { User, ExpenseV2 } = require('./src/models/database/indexV2');
    const Expense = require('./src/models/database/Expense');

    // Get user
    const user = await User.findByPhoneNumber(phoneNumber);
    if (!user) {
      return res.json({ error: 'User not found', phoneNumber });
    }

    // Count all tables
    const results = {
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        plan: user.plan || user.planType || 'unknown'
      },
      counts: {}
    };

    // Count ExpenseV2
    try {
      const expenseV2Count = await ExpenseV2.count({ where: { userId: user.id } });
      results.counts.expenseV2 = expenseV2Count;

      if (expenseV2Count > 0) {
        const expenseV2Records = await ExpenseV2.findAll({
          where: { userId: user.id },
          attributes: ['id', 'merchantName', 'totalAmount', 'expenseDate', 'createdAt'],
          order: [['createdAt', 'DESC']]
        });
        results.expenseV2Records = expenseV2Records.map(r => ({
          id: r.id,
          merchant: r.merchantName,
          amount: r.totalAmount,
          date: r.expenseDate,
          created: r.createdAt
        }));
      }
    } catch (e) {
      results.counts.expenseV2 = `ERROR: ${e.message}`;
    }

    // Count Receipt
    try {
      const receiptCount = await Expense.count({ where: { userId: user.id, status: { [require('sequelize').Op.ne]: 'deleted' } } });
      results.counts.receipt = receiptCount;

      if (receiptCount > 0) {
        const receiptRecords = await Expense.findAll({
          where: { userId: user.id, status: { [require('sequelize').Op.ne]: 'deleted' } },
          attributes: ['id', 'merchantName', 'totalAmount', 'expenseDate', 'createdAt'],
          order: [['createdAt', 'DESC']]
        });
        results.receiptRecords = receiptRecords.map(r => ({
          id: r.id,
          merchant: r.merchantName,
          amount: r.totalAmount,
          date: r.expenseDate,
          created: r.createdAt
        }));
      }
    } catch (e) {
      results.counts.receipt = `ERROR: ${e.message}`;
    }

    res.json(results);

  } catch (error) {
    res.json({ error: error.message, stack: error.stack });
  }
});

// Fix null planType values endpoint (run once to fix existing data)
app.get('/fix-plantypes', async (req, res) => {
  try {
    const { sequelize } = require('./src/config/database');

    console.log('🔧 Fixing null planType values...');

    // Update expenses with null planType to 'lite'
    const [expensesResult] = await sequelize.query(`
      UPDATE expenses
      SET "planType" = 'lite'
      WHERE "userId" = (SELECT id FROM users WHERE "phoneNumber" LIKE '%9603216152')
        AND "planType" IS NULL
    `);

    console.log('✅ Updated expenses:', expensesResult);

    // Update saved_receipts with null planType to 'lite'
    const [savedResult] = await sequelize.query(`
      UPDATE saved_receipts
      SET "planType" = 'lite'
      WHERE "userId" = (SELECT id FROM users WHERE "phoneNumber" LIKE '%9603216152')
        AND "planType" IS NULL
    `);

    console.log('✅ Updated saved receipts:', savedResult);

    // Verify the update
    const verifyExpenses = await sequelize.query(`
      SELECT "planType", COUNT(*) as count
      FROM expenses
      WHERE "userId" = (SELECT id FROM users WHERE "phoneNumber" LIKE '%9603216152')
      GROUP BY "planType"
    `, { type: sequelize.QueryTypes.SELECT });

    const verifySaved = await sequelize.query(`
      SELECT "planType", COUNT(*) as count
      FROM saved_receipts
      WHERE "userId" = (SELECT id FROM users WHERE "phoneNumber" LIKE '%9603216152')
      GROUP BY "planType"
    `, { type: sequelize.QueryTypes.SELECT });

    res.json({
      success: true,
      message: 'Fixed null planType values',
      updated: {
        expenses: expensesResult,
        savedReceipts: savedResult
      },
      currentBreakdown: {
        expenses: verifyExpenses,
        savedReceipts: verifySaved
      }
    });

  } catch (error) {
    console.error('❌ Error fixing planTypes:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Serve privacy and terms pages without .html extension
app.get('/privacy', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'privacy.html'));
});

app.get('/terms', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'terms.html'));
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: config.server.nodeEnv === 'development' ? error.message : undefined
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  console.error('Stack:', error.stack);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
});

// Graceful shutdown handlers
let paymentFlagCleaner;

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  webhookController.shutdown();
  if (paymentFlagCleaner) paymentFlagCleaner.stop();
  await closeConnection();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  webhookController.shutdown();
  if (paymentFlagCleaner) paymentFlagCleaner.stop();
  await closeConnection();
  process.exit(0);
});

// Start server
const server = app.listen(port, async () => {
  console.log(`🚀 TextExpense Bot Server running on port ${port}`);
  console.log(`📝 Environment: ${config.server.nodeEnv}`);
  console.log(`📞 WhatsApp Phone ID: ${config.whatsapp.phoneNumberId || 'Not set'}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
  console.log(`🔧 Process PID: ${process.pid}`);
  console.log(`💾 Memory usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`);
  
  // Initialize database and services (don't exit on failure)
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('❌ Failed to connect to database, continuing without it...');
      console.error('ℹ️  Set DATABASE_URL environment variable to enable database features');
      return; // Continue running without database
    }
    
    // Initialize database (create/sync tables)
    await initializeDatabase();

    // Initialize file cleanup manager
    const FileCleanupManager = require('./src/services/FileCleanupManager');
    const fileCleanupManager = new FileCleanupManager();
    fileCleanupManager.startCleanupTask();

    // Initialize payment flag cleanup job
    const CleanupPaymentFlags = require('./src/jobs/CleanupPaymentFlags');
    paymentFlagCleaner = new CleanupPaymentFlags();
    paymentFlagCleaner.start(15); // Run every 15 minutes

    // Initialize webhook controller
    await webhookController.initialize();
    console.log('✅ Database and all services initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing services:', error);
    console.error('ℹ️  Server is still running but some features may not work');
    // Don't exit - keep server running for health checks
  }
  
  if (config.server.nodeEnv === 'development') {
    console.log(`🔗 Local URL: http://localhost:${port}`);
    console.log(`🔍 Health check: http://localhost:${port}/health`);
  }
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${port} is already in use`);
    process.exit(1);
  } else {
    console.error('❌ Server error:', error);
    process.exit(1);
  }
});