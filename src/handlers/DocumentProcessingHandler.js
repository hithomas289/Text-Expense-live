const { USER_STATES } = require('../models/database/Session');
const MediaService = require('../services/MediaService');
const OCRService = require('../services/OCRService');
const AIService = require('../services/AIService');
const CurrencyService = require('../services/CurrencyService');
const SafeUsageWrapper = require('../services/SafeUsageWrapper');

class DocumentProcessingHandler {
  constructor(whatsAppService, sessionManager) {
    this.whatsAppService = whatsAppService;
    this.sessionManager = sessionManager;
    
    // Initialize services
    this.mediaService = new MediaService(whatsAppService);
    this.ocrService = new OCRService();
    this.aiService = new AIService();
    this.currencyService = new CurrencyService();
  }

  async initialize() {
    await this.mediaService.initialize();
  }

  // Helper method to generate appropriate limit messages for different plan types
  generateLimitMessage(planType, remainingReceipts, usedReceipts) {
    const { formatPrice } = require('../utils/priceFormatter');
    const liteLimit = parseInt(process.env.LITE_RECEIPT_LIMIT);
    const proLimit = parseInt(process.env.PRO_RECEIPT_LIMIT);
    const litePrice = formatPrice(parseInt(process.env.LITE_PLAN_PRICE) || 299);
    const proPrice = formatPrice(parseInt(process.env.PRO_PLAN_PRICE) || 499);

    switch(planType) {
      case 'trial':
        return `🔥 *You're getting the hang of this!*

*Ready to keep going?*

💡 Lite: ${litePrice}/month (${liteLimit} receipts)
🚀 Pro: ${proPrice}/month (${proLimit} receipts)`;

      case 'free':
        return `📋 *UPGRADE TO PROCESS RECEIPTS*

You're on the FREE plan (0 receipts/month).

*TO CONTINUE:*
💡 Lite: ${litePrice}/month (${liteLimit} receipts)
🚀 Pro: ${proPrice}/month (${proLimit} receipts)

Your previous data is safe and accessible.`;

      case 'lite':
        return `❌ *MONTHLY LIMIT REACHED*

You've used all ${liteLimit} receipts this month (for processing and saving combined).

Upgrade to PRO for ${proLimit} receipts/month?`;

      case 'pro':
        return `❌ *PRO LIMIT REACHED*

You've used all ${proLimit} receipts this month (for processing and saving combined).

Limit resets next month.`;

      default:
        return `❌ *LIMIT REACHED*

You've reached your total receipts limit (for processing and saving combined).

Upgrade to continue using TextExpense.`;
    }
  }

  // Helper method to get appropriate limit buttons for different plan types
  getLimitButtons(planType) {
    const { formatPrice } = require('../utils/priceFormatter');
    const proPrice = formatPrice(parseInt(process.env.PRO_PLAN_PRICE) || 499);

    switch(planType) {
      case 'trial':
        return [
          { id: 'upgrade_lite', text: 'Choose Lite Plan' },
          { id: 'upgrade_pro', text: 'Choose Pro Plan' },
          { id: 'generate_report', text: 'Generate Report' }
        ];

      case 'free':
        return [
          { id: 'upgrade_lite', text: 'Upgrade to Lite' },
          { id: 'upgrade_pro', text: 'Upgrade to PRO' },
          { id: 'main_menu', text: 'Main Menu' }
        ];

      case 'lite':
        return [
          { id: 'upgrade_pro', text: `Upgrade to PRO ${proPrice}/month` },
          { id: 'main_menu', text: 'Main Menu' }
        ];

      case 'pro':
        return [
          { id: 'main_menu', text: 'Main Menu' }
        ];

      default:
        return [
          { id: 'upgrade_account', text: 'Upgrade Plan' },
          { id: 'main_menu', text: 'Main Menu' }
        ];
    }
  }

  // Handle image upload processing
  async handleImageUpload(phoneNumber, message) {
    try {
      // IMMEDIATE ACKNOWLEDGMENT - Send right away so user knows we received it
      console.log(`📸 Image received from ${phoneNumber}, sending acknowledgment...`);
      await this.whatsAppService.sendMessage(phoneNumber, 'Processing started..');

      // FIRST: CHECK RECEIPT LIMITS WITH UNIFIED SYSTEM
      const session = await this.sessionManager.getSession(phoneNumber);
      const user = session._user;

      if (!user) {
        await this.whatsAppService.sendMessage(phoneNumber, '❌ User not found. Please start with /start');
        return;
      }

      const usageCheck = await SafeUsageWrapper.validateCanProcess(user.id);
      if (!usageCheck.allowed) {
        const planType = usageCheck.usage?.planType || 'trial';

        console.log(`🚫 UPLOAD BLOCKED: User ${phoneNumber} has reached ${planType} limit: ${usageCheck.reason}`);

        const limitMessage = this.generateLimitMessage(planType, usageCheck.usage?.remaining || 0, usageCheck.usage?.used || 0);
        const buttons = this.getLimitButtons(planType);

        await this.whatsAppService.sendInteractiveButtons(phoneNumber, limitMessage, buttons, 'monthly_limit');
        return;
      }

      // SECOND: Check for receipt conflicts after limits are OK
      // (session already fetched above)

      // Block if user has currentReceipt (regardless of state) - means receipt not saved yet
      // Check both session.currentReceipt AND session.metadata.currentReceipt for safety
      const existingReceipt = session.currentReceipt || session.metadata?.currentReceipt;
      if (existingReceipt) {
        console.log(`⚠️ [handleReceiptUpload] Receipt conflict detected - user has unsaved receipt`);
        const hasRealConflict = await this.sendReceiptConflictMessage(phoneNumber, existingReceipt);
        if (hasRealConflict) {
          return; // Stop here only if there's a real conflict (file still exists)
        }
        // If no real conflict (expired file), continue processing the new image below
        console.log(`✅ [handleReceiptUpload] Expired receipt cleared, continuing with new upload`);
      }

      console.log(`✅ [handleReceiptUpload] No conflict - proceeding with new receipt upload`);

      // First download and save the media, then show Process vs Save choice
      let mediaInfo;
      if (this.ocrService.testingMode) {
        // Create mock media info for testing
        mediaInfo = {
          filename: 'test-receipt.jpg',
          filePath: '/mock/path/test-receipt.jpg',
          mimeType: 'image/jpeg',
          size: 12345,
          s3Data: null // No S3 upload yet - will happen when expense is saved
        };
      } else {
        // Production mode: Download and process the actual image
        mediaInfo = await this.mediaService.downloadAndSaveMedia(message, phoneNumber);

        if (!mediaInfo || !mediaInfo.filePath) {
          throw new Error('Failed to download image');
        }

        // Schedule cleanup for uploaded file (60 minutes from now)
        this.scheduleFileCleanup(mediaInfo.filePath, 60);
      }

      // Check if multiple images were detected (abort if true)
      const sessionCheck = await this.sessionManager.getSession(phoneNumber);
      if (sessionCheck.metadata?.multipleImagesDetected) {
        console.log(`🚫 Aborting image processing - multiple images detected for ${phoneNumber}`);
        return; // Silently abort - error message already sent by WebhookController
      }

      // Store raw media info in session for later processing
      // Don't process the receipt yet - wait for user choice
      // CRITICAL: Use setCurrentReceipt to update the top-level currentReceipt column
      await this.sessionManager.setCurrentReceipt(phoneNumber, {
        // Store basic media info without processing yet
        originalFilename: mediaInfo.filename,
        filePath: mediaInfo.filePath,
        fileType: mediaInfo.mimeType,
        fileSize: mediaInfo.size,
        s3Data: null // No S3 upload yet - will happen when expense is saved
      });

      // Update state and metadata separately
      await this.sessionManager.updateUserState(phoneNumber, USER_STATES.IDLE, {
        menuContext: 'receipt_choice',
        awaitingReceiptChoice: true
      });

      // Final check before showing menu
      const finalCheck = await this.sessionManager.getSession(phoneNumber);
      if (finalCheck.metadata?.multipleImagesDetected) {
        console.log(`🚫 Aborting menu display - multiple images detected for ${phoneNumber}`);
        return; // Silently abort
      }

      // Show Process vs Save choice menu (acknowledgment already sent at start)
      await this.showReceiptChoiceMenu(phoneNumber);

    } catch (error) {
      console.error('Error processing image:', error);
      
      // Handle file size errors specifically
      if (error.message.includes('File size exceeds 20MB limit')) {
        await this.whatsAppService.sendMessage(phoneNumber, `❌ *FILE TOO LARGE*

Your file exceeds the 20MB size limit.

*please try again:*
• Smaller image size
• Compressed image
• Different document format

*Send a new photo or document*`);
      } else {
        await this.sendProcessingError(phoneNumber, 'Image processing failed');
      }
    }
  }

  // Handle document upload processing
  async handleDocumentUpload(phoneNumber, message) {
    try {
      // IMMEDIATE ACKNOWLEDGMENT - Send right away so user knows we received it
      console.log(`📄 Document received from ${phoneNumber}, sending acknowledgment...`);
      await this.whatsAppService.sendMessage(phoneNumber, '📄 Processing your document...');

      // FIRST: CHECK RECEIPT LIMITS WITH UNIFIED SYSTEM
      const session = await this.sessionManager.getSession(phoneNumber);
      const user = session._user;

      if (!user) {
        await this.whatsAppService.sendMessage(phoneNumber, '❌ User not found. Please start with /start');
        return;
      }

      const usageCheck = await SafeUsageWrapper.validateCanProcess(user.id);
      if (!usageCheck.allowed) {
        const planType = usageCheck.usage?.planType || 'trial';

        console.log(`🚫 UPLOAD BLOCKED: User ${phoneNumber} tried to upload document but has reached ${planType} limit: ${usageCheck.reason}`);

        const limitMessage = this.generateLimitMessage(planType, usageCheck.usage?.remaining || 0, usageCheck.usage?.used || 0);
        const buttons = this.getLimitButtons(planType);

        await this.whatsAppService.sendInteractiveButtons(phoneNumber, limitMessage, buttons, 'limit_reached');
        return;
      }

      // SECOND: Check for receipt conflicts after limits are OK
      // (session already fetched above)
      console.log(`🔍 [handleDocumentUpload] Checking for receipt conflict. session.currentReceipt:`, session.currentReceipt ? 'EXISTS' : 'NULL');
      console.log(`📋 [handleDocumentUpload] Session state: ${session.state}, awaitingReceiptChoice: ${session.metadata?.awaitingReceiptChoice}`);

      // Block if user has currentReceipt (regardless of state) - means receipt not saved yet
      // Check both session.currentReceipt AND session.metadata.currentReceipt for safety
      const existingReceipt = session.currentReceipt || session.metadata?.currentReceipt;
      if (existingReceipt) {
        console.log(`⚠️ [handleDocumentUpload] CONFLICT DETECTED: User has unsaved receipt, showing conflict message`);
        await this.sendReceiptConflictMessage(phoneNumber, existingReceipt);
        return;
      }

      console.log(`✅ [handleDocumentUpload] No conflict - proceeding with new receipt upload`);

      if (!this.whatsAppService.isReceiptDocument(message)) {
        await this.whatsAppService.sendMessage(phoneNumber,
          `I can only process receipt images and PDFs. Please send a receipt photo or PDF.`);
        return;
      }

      // First download and save the media, then show Process vs Save choice
      // (acknowledgment already sent at start)
      let mediaInfo;
      if (this.ocrService.testingMode) {
        // Create mock media info for testing
        mediaInfo = {
          filename: 'test-document.pdf',
          filePath: '/mock/path/test-document.pdf',
          mimeType: 'application/pdf',
          size: 12345,
          s3Data: null // No S3 upload yet - will happen when expense is saved
        };
      } else {
        // Production mode: Download the actual document (no OCR yet)
        mediaInfo = await this.mediaService.downloadAndSaveMedia(message, phoneNumber);

        if (!mediaInfo || !mediaInfo.filePath) {
          throw new Error('Failed to download document');
        }

        // Schedule cleanup for uploaded file (60 minutes from now)
        this.scheduleFileCleanup(mediaInfo.filePath, 60);
      }

      // Store raw media info in session for later processing
      // Don't process the receipt yet - wait for user choice
      // CRITICAL: Use setCurrentReceipt to update the top-level currentReceipt column
      await this.sessionManager.setCurrentReceipt(phoneNumber, {
        // Store basic media info without processing yet
        originalFilename: mediaInfo.filename,
        filePath: mediaInfo.filePath,
        fileType: mediaInfo.mimeType,
        fileSize: mediaInfo.size,
        s3Data: mediaInfo.s3Data
      });

      // Update state and metadata separately
      await this.sessionManager.updateUserState(phoneNumber, USER_STATES.IDLE, {
        menuContext: 'receipt_choice',
        awaitingReceiptChoice: true
      });

      // Show Process vs Save choice menu
      await this.showReceiptChoiceMenu(phoneNumber);

    } catch (error) {
      console.error('Error processing document:', error);
      
      // Handle file size errors specifically
      if (error.message.includes('File size exceeds 20MB limit')) {
        await this.whatsAppService.sendMessage(phoneNumber, `❌ *FILE TOO LARGE*

Your file exceeds the 20MB size limit.

*please try again:*
• Smaller document size
• Compressed PDF
• Different file format

*Send a new document*`);
      } else {
        await this.sendProcessingError(phoneNumber, 'Document processing failed');
      }
    }
  }

  // Request category selection for processed receipt
  async requestCategorySelection(phoneNumber, receiptData) {
    // Get currency symbol from CurrencyService
    const currency = receiptData.currency || 'INR';
    console.log(`💰 DEBUG requestCategorySelection: receiptData.currency=${receiptData.currency}, using currency=${currency}`);
    const currencySymbol = this.currencyService.getCurrencySymbol(currency);

    const categoryMessage = `🏷️ *EXPENSE PROCESSED!*

📋 *EXPENSE SUMMARY:*
• Invoice No: ${receiptData.invoiceNumber || receiptData.billNumber || 'Not available'}
• Date: ${receiptData.date || 'Not detected'}
• Merchant: ${receiptData.merchantName || receiptData.merchant || 'Not detected'}
• Subtotal: ${currencySymbol}${receiptData.subtotal?.toFixed(2) || (receiptData.totalAmount - (receiptData.taxAmount || receiptData.tax || 0)).toFixed(2)}
• Tax: ${currencySymbol}${(receiptData.taxAmount || receiptData.tax)?.toFixed(2) || '0.00'}
• Miscellaneous: ${currencySymbol}${(receiptData.miscellaneous || 0).toFixed(2)}
• *Total: ${currencySymbol}${receiptData.totalAmount?.toFixed(2) || '0.00'}*

*SELECT EXPENSE CATEGORY:*

1️⃣ Business Expense
2️⃣ Meals & Entertainment
3️⃣ Travel & Accommodation
4️⃣ Office & Supplies
5️⃣ Subscriptions & Software
6️⃣ Medical & Healthcare
7️⃣ Home & Utilities
8️⃣ Shopping & Personal
9️⃣ Custom Category ✏️


Don't worry if something needs fixing
You can edit *ALL DETAILS* in the next step!

Reply with number (1-9):`;

    await this.whatsAppService.sendMessage(phoneNumber, categoryMessage);
  }

  // Handle processing errors
  // Service completely unavailable (OCR/AI backend issues)
  async sendServiceUnavailableMessage(phoneNumber) {
    const serviceMessage = `🔧 *SERVICE TEMPORARILY UNAVAILABLE*

We're experiencing technical difficulties and are working to fix this quickly.

⏰ *PLEASE TRY AGAIN IN A FEW MINUTES*

This is temporary - your image quality is fine, it's our processing service that needs a moment.

*Send a new expense when ready.*`;

    const serviceOptions = [
      { id: 'process_document', text: '📸 Process New Expense' },
      { id: 'main_menu', text: '🏠 Main Menu' }
    ];

    await this.whatsAppService.sendMessage(phoneNumber, serviceMessage);
    await this.whatsAppService.sendInteractiveButtons(phoneNumber, 'Choose an option:', serviceOptions, 'service_unavailable');

    // Reset session and clear current receipt
    await this.sessionManager.updateUserState(phoneNumber, USER_STATES.IDLE);
    await this.sessionManager.setCurrentReceipt(phoneNumber, null);
  }

  // Image quality issues (existing behavior)
  async sendProcessingError(phoneNumber, errorType) {
    let errorMessage = `❌ *PROCESSING FAILED*

${errorType}. please try again:

📸 *QUALITY TIPS:*
• Good lighting
• Clear, straight image
• Full receipt visible
• Avoid shadows/glare

*SUPPORTED FORMATS:*
📄 PDF, JPG, JPEG, PNG, DOCX, WebP

*Send a new photo or document*`;

    await this.whatsAppService.sendMessage(phoneNumber, errorMessage);
    await this.sessionManager.updateUserState(phoneNumber, USER_STATES.IDLE);
  }

  // Handle process document command
  async handleProcessDocumentCommand(phoneNumber) {
    // Clear any existing receipt data and duplicate handling state
    // This ensures a clean slate when user wants to process a new expense
    const session = await this.sessionManager.getSession(phoneNumber);
    if (session.metadata?.duplicateHandling || session.currentReceipt) {
      console.log(`🧹 Clearing duplicate handling state and current receipt for ${phoneNumber}`);
      await this.sessionManager.setCurrentReceipt(phoneNumber, null);
      await this.sessionManager.updateUserState(phoneNumber, USER_STATES.IDLE, {
        duplicateHandling: false,
        newReceiptData: null,
        existingReceiptId: null
      });
    }

    // Check if user has reached limit before allowing upload
    const planLimits = await this.sessionManager.checkPlanLimits(phoneNumber);
    if (planLimits.hasReachedLimit) {
      const session = await this.sessionManager.getSession(phoneNumber);
      const planType = session.subscription?.planType || 'trial';

      if (planType === 'trial') {
        // Trial users who've exhausted their trial
        const currencySymbol = process.env.CURRENCY_SYMBOL;
        const liteLimit = parseInt(process.env.LITE_RECEIPT_LIMIT);
        const proLimit = parseInt(process.env.PRO_RECEIPT_LIMIT);
        const litePrice = (parseInt(process.env.LITE_PLAN_PRICE) / 100).toFixed(2);
        const proPrice = (parseInt(process.env.PRO_PLAN_PRICE) / 100).toFixed(2);

        const returningMessage = `⏸️ *CHOOSE YOUR PLAN TO CONTINUE*

*Ready to keep organizing your receipts?*

💡 Lite Plan: ${currencySymbol}${litePrice}/month - ${liteLimit} receipts, basic reports
🚀 Pro Plan: ${currencySymbol}${proPrice}/month - ${proLimit} receipts, advanced features ⭐ RECOMMENDED`;

        const returningButtons = [
          { id: 'upgrade_lite', text: '1️⃣ Start Lite Plan' },
          { id: 'upgrade_pro', text: '2️⃣ Start Pro Plan' },
          { id: 'generate_report', text: '3️⃣ Generate Report' }
        ];

        await this.whatsAppService.sendInteractiveButtons(phoneNumber, returningMessage, returningButtons, 'returning_trial_expired');
        return;
      } else if (planType === 'free') {
        // FREE plan users (after subscription cancellation) - cannot process any receipts
        const currencySymbol = process.env.CURRENCY_SYMBOL;
        const liteLimit = parseInt(process.env.LITE_RECEIPT_LIMIT);
        const proLimit = parseInt(process.env.PRO_RECEIPT_LIMIT);
        const litePrice = (parseInt(process.env.LITE_PLAN_PRICE) / 100).toFixed(2);
        const proPrice = (parseInt(process.env.PRO_PLAN_PRICE) / 100).toFixed(2);

        const freeMessage = `📋 *UPGRADE TO PROCESS RECEIPTS*

You're on the FREE plan (0 receipts/month).

*CHOOSE A PLAN:*
💡 Lite: ${currencySymbol}${litePrice}/month - ${liteLimit} receipts/month
🚀 Pro: ${currencySymbol}${proPrice}/month - ${proLimit} receipts/month

Your previous data is safe and accessible!`;

        const freeButtons = [
          { id: 'upgrade_lite', text: 'Upgrade to Lite' },
          { id: 'upgrade_pro', text: 'Upgrade to PRO' },
          { id: 'main_menu', text: 'Main Menu' }
        ];

        await this.whatsAppService.sendInteractiveButtons(phoneNumber, freeMessage, freeButtons, 'free_plan_limit');
        return;
      } else {
        // Other plan types (lite, pro) - show regular limit message
        const limitMessage = this.generateLimitMessage(planType, planLimits.remainingReceipts, planLimits.usedReceipts);
        const buttons = this.getLimitButtons(planType);
        await this.whatsAppService.sendInteractiveButtons(phoneNumber, limitMessage, buttons, 'monthly_limit');
        return;
      }
    }

    const processMessage = `📸 *SEND YOUR EXPENSE*

*SUPPORTED FORMATS:*
📄 PDF, JPG, JPEG, PNG, DOCX, WebP`;

    await this.whatsAppService.sendMessage(phoneNumber, processMessage);
  }

  // Handle receipt conflict when user tries to upload new receipt with unsaved one
  async sendReceiptConflictMessage(phoneNumber, currentReceipt) {
    // FIRST: Check if the receipt file actually exists
    // If file expired, clear the session and don't show conflict message
    if (currentReceipt.filePath) {
      try {
        const fs = require('fs').promises;
        await fs.access(currentReceipt.filePath);
        // File exists, continue with conflict message
      } catch (error) {
        if (error.code === 'ENOENT') {
          // File expired - clear the session and return false (no real conflict)
          console.log(`⏰ [sendReceiptConflictMessage] Receipt file expired, clearing session for ${phoneNumber}`);
          await this.sessionManager.updateUserState(phoneNumber, USER_STATES.IDLE, {
            currentReceipt: null,
            metadata: { receiptFileExpired: true }
          });
          return false; // Return false = no real conflict, caller should continue
        }
        throw error; // Re-throw other errors
      }
    }

    // Calculate how long ago the receipt was uploaded
    let timeAgo = '';
    if (currentReceipt.uploadedAt) {
      const uploadTime = new Date(currentReceipt.uploadedAt);
      const now = new Date();
      const hoursAgo = Math.floor((now - uploadTime) / (1000 * 60 * 60));

      if (hoursAgo < 1) {
        const minutesAgo = Math.floor((now - uploadTime) / (1000 * 60));
        timeAgo = `${minutesAgo} minute${minutesAgo !== 1 ? 's' : ''} ago`;
      } else {
        timeAgo = `${hoursAgo} hour${hoursAgo !== 1 ? 's' : ''} ago`;
      }
    }

    // const receiptInfo = currentReceipt.merchantName || 'Unknown merchant';
    // const amount = currentReceipt.totalAmount ? `₹${currentReceipt.totalAmount.toFixed(2)}` : 'Amount pending';

    const conflictMessage = `⚠️ *YOU HAVE AN UNSAVED RECEIPT*

*What would you like to do?*

*Resume:* Continue with the current receipt
*Cancel:* Discard current receipt and start fresh

*Note: Receipt files are automatically deleted after 60 minutes.*`;

    const conflictOptions = [
      { id: 'save_receipt', text: 'Resume Processing' },
      { id: 'cancel_receipt', text: 'Start Fresh' }
    ];

    await this.whatsAppService.sendInteractiveButtons(phoneNumber, conflictMessage, conflictOptions, 'receipt_conflict');
    return true; // Return true = real conflict shown to user
  }

  // Handle save receipt action - Resume processing the current receipt
  async handleSaveReceipt(phoneNumber) {
    try {
      const session = await this.sessionManager.getSession(phoneNumber);

      // Check both currentReceipt and metadata.currentReceipt (fallback)
      const currentReceipt = session.currentReceipt || session.metadata?.currentReceipt;

      if (!currentReceipt) {
        // Receipt has expired or been cleared
        await this.whatsAppService.sendMessage(phoneNumber,
          `❌ *SESSION EXPIRED*

Your receipt session has expired and any unsaved receipt has been cleared.

Ready to process new receipts?`);

        // Show options for next action
        const sessionExpiredOptions = [
          { id: 'process_document', text: 'Upload New Receipt' },
          { id: 'main_menu', text: 'Main Menu' }
        ];

        await this.whatsAppService.sendInteractiveButtons(phoneNumber, 'What would you like to do?', sessionExpiredOptions, 'session_expired');

        // Reset to idle state
        await this.sessionManager.updateUserState(phoneNumber, USER_STATES.IDLE);
        return;
      }

      console.log(`🔄 Resuming receipt processing for ${phoneNumber}, state: ${session.state}, awaitingReceiptChoice: ${session.metadata?.awaitingReceiptChoice}`);

      // Resume the flow based on current state
      const CategoryHandler = require('../services/CategoryHandler');
      const categoryHandler = new CategoryHandler(this.sessionManager, this.whatsAppService);

      const ConfirmationHandler = require('./ConfirmationHandler');
      const confirmationHandler = new ConfirmationHandler(this.whatsAppService, this.sessionManager);

      // PRIORITY: Check actual processing states FIRST (these take precedence)
      // === PROCESS EXPENSE FLOW STATES ===
      if (session.state === USER_STATES.WAITING_FOR_CATEGORY) {
        // Check if custom category mode
        if (session.metadata?.customCategoryMode) {
          console.log(`🏷️ Resuming custom category input for ${phoneNumber}`);
          await this.whatsAppService.sendMessage(phoneNumber,
            `🏷️ *CUSTOM CATEGORY*

Type any category you want!

Examples:
• Fuel & Transportation
• Groceries & Household
• Office Supplies

*Type your custom category:*`);
        } else {
          // Resume expense category selection
          console.log(`📋 Resuming expense category selection for ${phoneNumber}`);
          await categoryHandler.showCategoryMenu(phoneNumber);
        }
      } else if (session.state === USER_STATES.WAITING_FOR_CONFIRMATION) {
        // Resume expense confirmation step
        console.log(`✅ Resuming expense confirmation for ${phoneNumber}`);
        await confirmationHandler.displayReceiptDetails(phoneNumber, currentReceipt);
      } else if (session.state === USER_STATES.EDITING_DETAILS) {
        // Resume edit details menu
        console.log(`✏️ Resuming edit details for ${phoneNumber}`);
        const EditDetailsHandler = require('./EditDetailsHandler');
        const editHandler = new EditDetailsHandler(this.whatsAppService, this.sessionManager);
        await editHandler.sendEditDetailsMenu(phoneNumber, currentReceipt);
      } else if (session.state === USER_STATES.WAITING_FOR_MERCHANT_NAME) {
        // Resume merchant name input
        console.log(`🏪 Resuming merchant name input for ${phoneNumber}`);
        await this.whatsAppService.sendMessage(phoneNumber,
          `📝 *ENTER MERCHANT NAME*\n\nType the merchant/store name:`);
      }
      // === SAVE RECEIPT (VAULT) FLOW STATES ===
      else if (session.state === USER_STATES.WAITING_FOR_SAVE_CATEGORY) {
        // Resume save receipt category selection
        console.log(`📁 Resuming save receipt category selection for ${phoneNumber}`);
        const SaveReceiptHandler = require('./SaveReceiptHandler');
        const saveHandler = new SaveReceiptHandler(this.whatsAppService, this.sessionManager);
        await saveHandler.showSaveCategories(phoneNumber);
      } else if (session.state === USER_STATES.WAITING_FOR_RECEIPT_DESCRIPTION) {
        // Resume save receipt description input
        console.log(`📝 Resuming receipt description input for ${phoneNumber}`);
        const SaveReceiptHandler = require('./SaveReceiptHandler');
        const saveHandler = new SaveReceiptHandler(this.whatsAppService, this.sessionManager);
        const selectedCategory = session.metadata?.selectedCategory || 'Other';
        await this.whatsAppService.sendMessage(phoneNumber,
          `✅ Category: ${selectedCategory}\n\n📝 *WHAT'S THIS RECEIPT?*\n\n(write description for you to remember later)\n\nExamples:\n- "Laptop 2-year warranty"\n- "Fridge extended protection"\n- "iPhone AppleCare"\n\nType description:`);
      } else if (session.state === USER_STATES.WAITING_FOR_CUSTOM_SAVE_CATEGORY) {
        // Resume custom category input for save receipt
        console.log(`✏️ Resuming custom category input for ${phoneNumber}`);
        await this.whatsAppService.sendMessage(phoneNumber,
          `📝 *ENTER CUSTOM CATEGORY*\n\nType your custom category name:`);
      }
      // === FALLBACK: Check if user was at "Process or Save?" choice screen ===
      else if (session.state === USER_STATES.IDLE && session.metadata?.awaitingReceiptChoice) {
        // User uploaded receipt but hasn't chosen Process or Save yet
        console.log(`🔄 Resuming at receipt choice menu (Process or Save?) - user was at idle choice screen`);
        await this.showReceiptChoiceMenu(phoneNumber);
      }
      // === UNKNOWN STATE ===
      else {
        // Unknown state - show receipt choice menu as safest fallback
        console.log(`⚠️ Unknown state ${session.state} (awaitingReceiptChoice: ${session.metadata?.awaitingReceiptChoice}), defaulting to receipt choice menu`);
        await this.showReceiptChoiceMenu(phoneNumber);
      }

    } catch (error) {
      console.error('Error resuming receipt processing:', error);
      await this.whatsAppService.sendMessage(phoneNumber, "❌ Failed to resume processing. Please try again.");
    }
  }

  // Handle cancel receipt action
  async handleCancelReceipt(phoneNumber) {
    try {
      // Clear current receipt
      await this.sessionManager.setCurrentReceipt(phoneNumber, null);
      await this.sessionManager.updateUserState(phoneNumber, USER_STATES.IDLE);
      
      // Cancel message with buttons
      const cancelMessage = "🗑️ *Receipt processing cancelled*";
      
      const cancelOptions = [
        { id: 'try_new_expense', text: 'Process New Expense' },
        { id: 'main_menu', text: 'Main Menu' }
      ];

      await this.whatsAppService.sendInteractiveButtons(phoneNumber, cancelMessage, cancelOptions, 'post_cancel');
      
    } catch (error) {
      console.error('Error cancelling receipt:', error);
      await this.whatsAppService.sendMessage(phoneNumber, "❌ Error occurred. Please try again.");
    }
  }

  // Show Process vs Save choice menu after receipt upload
  async showReceiptChoiceMenu(phoneNumber) {
    const choiceMessage = `*WHAT DO YOU NEED?*`;

    const options = [
      { id: 'process_expense', text: 'Scan Expense' },
      { id: 'save_expense', text: 'Save It' }
    ];

    await this.whatsAppService.sendInteractiveButtons(phoneNumber, choiceMessage, options, 'receipt_choice');
  }

  // Process receipt when user chooses "Process Expense"
  async processReceiptForExpenseTracking(phoneNumber) {
    try {
      // Limits already checked during upload - proceed with processing
      const session = await this.sessionManager.getSession(phoneNumber);

      // Clear awaitingReceiptChoice flag since user has made their choice
      await this.sessionManager.updateUserState(phoneNumber, session.state, {
        awaitingReceiptChoice: false
      });

      // Check for currentReceipt in both locations (top level and metadata)
      const currentReceipt = session.currentReceipt || session.metadata?.currentReceipt;

      if (!currentReceipt || !currentReceipt.filePath) {
        await this.whatsAppService.sendMessage(phoneNumber,
          'No receipt found. Please upload a receipt first.');
        return;
      }

      // Check if receipt has already been processed (has OCR data)
      // This prevents duplicate processing from duplicate webhooks or old button clicks
      if (currentReceipt.extractedData || currentReceipt.ocrText) {
        console.log(`⚠️ Receipt already processed for ${phoneNumber}, skipping duplicate OCR processing`);
        // Receipt already has data, skip to category selection
        await this.sessionManager.updateUserState(phoneNumber, USER_STATES.WAITING_FOR_CATEGORY, {
          customCategoryMode: false,
          editingField: null
        });
        await this.requestCategorySelection(phoneNumber, currentReceipt);
        return;
      }

      const mediaInfo = currentReceipt;

      // Show processing message when OCR starts
      await this.whatsAppService.sendMessage(phoneNumber, '📄 Processing your receipt...\nThis may take up to a minute');

      // Verify file exists before OCR processing
      if (!this.ocrService.testingMode) {
        const fs = require('fs').promises;
        try {
          await fs.access(mediaInfo.filePath);
        } catch (fileError) {
          console.error(`❌ File not found before OCR: ${mediaInfo.filePath}`);
          await this.whatsAppService.sendMessage(phoneNumber,
            `❌ *FILE NOT AVAILABLE*\n\nYour file was uploaded but is no longer accessible. This can happen if the server restarted.\n\n*Please try uploading again.*`);
          await this.cleanupFailedReceipt(phoneNumber, mediaInfo.filePath);
          return;
        }
      }

      // Process receipt with OCR + AI extraction with error recovery
      let ocrResult;
      try {
        // Get user for currency context
        const session = await this.sessionManager.getSession(phoneNumber);
        const userCurrency = session?._user?.defaultCurrency || 'INR';

        if (this.ocrService.testingMode) {
          ocrResult = await this.ocrService.processReceiptImage(null, null, { userCurrency });
        } else {
          ocrResult = await this.ocrService.processReceiptImage(mediaInfo.filePath, mediaInfo.fileType, { userCurrency });
        }

        if (!ocrResult.success) {
          // Clean up failed receipt before showing error
          await this.cleanupFailedReceipt(phoneNumber, mediaInfo.filePath);

          // Check if it's a service failure (not image quality issue)
          if (ocrResult.errorType === 'service_failure') {
            await this.sendServiceUnavailableMessage(phoneNumber);
          } else {
            await this.sendProcessingError(phoneNumber, 'OCR extraction failed');
          }
          return;
        }
      } catch (error) {
        console.error('OCR processing error:', error);

        // Check if it's a file not found error
        if (error.message && error.message.includes('File not found')) {
          await this.whatsAppService.sendMessage(phoneNumber,
            `❌ *FILE LOST DURING PROCESSING*\n\nThe file became unavailable while processing. This can happen if the server restarted.\n\n*Please upload your receipt again.*`);
          await this.cleanupFailedReceipt(phoneNumber, mediaInfo.filePath);
          return;
        }

        // Clean up failed receipt and file
        await this.cleanupFailedReceipt(phoneNumber, mediaInfo.filePath);
        await this.sendProcessingError(phoneNumber, 'Receipt processing failed');
        return;
      }

      if (!ocrResult.enhancedExtraction || !ocrResult.receiptData) {
        // Check if AI extraction failed due to service issues
        if (ocrResult.aiExtraction && ocrResult.aiExtraction.errorType === 'service_failure') {
          await this.sendServiceUnavailableMessage(phoneNumber);
        } else {
          await this.sendProcessingError(phoneNumber, 'Receipt data extraction failed');
        }
        return;
      }

      // Compress image after OCR to save storage space and update session
      let finalMediaInfo = { ...mediaInfo };
      try {
        const compressionResult = await this.mediaService.compressImageAfterOCR(mediaInfo);

        if (compressionResult.success && compressionResult.compressedPath) {

          // Update file reference to compressed version
          finalMediaInfo.filePath = compressionResult.compressedPath;
          finalMediaInfo.filename = compressionResult.compressedFilename;
          finalMediaInfo.originalPath = mediaInfo.filePath; // Keep reference to original
          finalMediaInfo.compressed = true;

        } else {
          // Keep using original file
        }
      } catch (compressionError) {
        // Continue with original file if compression fails
      }

      // Correct currency based on user's stored preference (phone number)
      let correctedReceiptData = { ...ocrResult.receiptData };

      // If no currency was detected in receipt, use user's default currency
      // Only override if currency is missing, NOT if it's a valid detected currency (including INR)
      if (!correctedReceiptData.currency) {
        correctedReceiptData = await this.currencyService.setReceiptCurrency(phoneNumber, correctedReceiptData);
      }

      // CHECK FOR DUPLICATE INVOICE/BILL NUMBERS
      const duplicateCheck = await this.checkForDuplicateInvoice(phoneNumber, correctedReceiptData);
      if (duplicateCheck.isDuplicate) {
        await this.handleDuplicateDetection(phoneNumber, correctedReceiptData, duplicateCheck.existingReceipt);
        return;
      }

      // Store processed receipt data in session - S3 upload happens only when user saves
      const receiptDataWithMedia = {
        ...correctedReceiptData,
        // Add media information for later S3 upload (uses compressed file if available)
        originalFilename: finalMediaInfo.originalFilename || finalMediaInfo.filename,
        filePath: finalMediaInfo.filePath, // Points to compressed file if compression succeeded
        fileType: finalMediaInfo.fileType || finalMediaInfo.mimeType,
        fileSize: finalMediaInfo.fileSize || finalMediaInfo.size,
        compressed: finalMediaInfo.compressed || false, // Track if file was compressed
        originalPath: finalMediaInfo.originalPath, // Keep reference to original (will be deleted in 30s)
        s3Data: null, // Will be populated after S3 upload below
        uploadedAt: new Date().toISOString() // Add timestamp for 24-hour cleanup
      };

      console.log(`💰 DEBUG: Currency in receiptDataWithMedia: ${receiptDataWithMedia.currency}`);

      // Upload file to S3 immediately after processing (lazy cleanup approach)
      let s3Data = null;
      try {
        const S3Service = require('../services/S3Service');
        const s3Service = new S3Service();
        const fs = require('fs').promises;


        // Check if file exists before trying to read it
        await fs.access(finalMediaInfo.filePath);
        const fileBuffer = await fs.readFile(finalMediaInfo.filePath);

        s3Data = await s3Service.uploadReceiptFile(
          phoneNumber,
          fileBuffer,
          finalMediaInfo.originalFilename || finalMediaInfo.filename,
          finalMediaInfo.fileType || finalMediaInfo.mimeType
        );

        if (s3Data && s3Data.success) {
          receiptDataWithMedia.s3Data = s3Data;
          receiptDataWithMedia.originalFileUrl = s3Data.url;
        } else {
        }
      } catch (s3Error) {
        // Continue without S3 upload - file will still be available locally for save process
      }

      await this.sessionManager.setCurrentReceipt(phoneNumber, receiptDataWithMedia);

      // Check for category assignment
      if (ocrResult.receiptData.category) {
        // Category already assigned, go to confirmation
        await this.sessionManager.updateUserState(phoneNumber, USER_STATES.WAITING_FOR_CONFIRMATION);

        // Import ConfirmationHandler dynamically to avoid circular dependency
        const ConfirmationHandler = require('./ConfirmationHandler');
        const confirmationHandler = new ConfirmationHandler(this.whatsAppService, this.sessionManager);
        await confirmationHandler.displayReceiptDetails(phoneNumber, receiptDataWithMedia);
      } else {
        // No category assigned, ask user to select one
        await this.sessionManager.updateUserState(phoneNumber, USER_STATES.WAITING_FOR_CATEGORY, {
          customCategoryMode: false,
          editingField: null
        });
        await this.requestCategorySelection(phoneNumber, receiptDataWithMedia);
      }

    } catch (error) {
      console.error('Error processing receipt for expense tracking:', error);
      await this.sendProcessingError(phoneNumber, 'Receipt processing failed');
    }
  }

  // Check for duplicate invoice/bill numbers in user's existing receipts
  async checkForDuplicateInvoice(phoneNumber, receiptData) {
    try {
      const { User } = require('../models/database/indexV2');
      const ExpenseV2 = require('../models/database/ExpenseV2');
      const { Op } = require('sequelize');

      // Get user ID
      const user = await User.findByPhoneNumber(phoneNumber);
      if (!user) {
        console.log(`🔍 [DUPLICATE CHECK] User not found for phone: ${phoneNumber}`);
        return { isDuplicate: false };
      }

      console.log(`🔍 [DUPLICATE CHECK] Starting check for userId: ${user.id}`);

      const isValidInvoiceNumber = (value) => {
        if (!value) return false;
        const normalized = value.toString().trim().toLowerCase();

        const invalidValues = ['unknown', 'n/a', 'na', 'not available', 'not detected', 'none', 'null', '-'];
        return !invalidValues.includes(normalized) && normalized.length > 0;
      };


      const newInvoiceNumber = receiptData.invoiceNumber;
      console.log(`🔍 [DUPLICATE CHECK] Invoice number from new receipt: "${newInvoiceNumber}"`);

      // ned to check invoic no.
      if (!isValidInvoiceNumber(newInvoiceNumber)) {
        console.log(`⏭️ [DUPLICATE CHECK] Skipping - no valid invoice number found`);
        return { isDuplicate: false };
      }

      console.log(`✅ [DUPLICATE CHECK] Invoice number is valid, searching database...`);

      const whereConditions = {
        userId: user.id,
        invoiceNumber: newInvoiceNumber
      };

      console.log(`🔍 [DUPLICATE CHECK] Query conditions:`, whereConditions);

      const existingReceipt = await ExpenseV2.findOne({
        where: whereConditions,
        order: [['createdAt', 'DESC']]
      });

      if (existingReceipt) {
        console.log(`🚨 [DUPLICATE CHECK] DUPLICATE FOUND! Existing receipt ID: ${existingReceipt.id}, Invoice: ${existingReceipt.invoiceNumber}, Created: ${existingReceipt.createdAt}`);
        return {
          isDuplicate: true,
          existingReceipt: existingReceipt
        };
      }

      console.log(`✅ [DUPLICATE CHECK] No duplicate found - this is a new receipt`);
      return { isDuplicate: false };

    } catch (error) {
      console.error('Error checking for duplicate invoice:', error);
      return { isDuplicate: false }; // Continue processing if check fails
    }
  }

  // Handle duplicate detection - show options to user
  async handleDuplicateDetection(phoneNumber, newReceiptData, existingReceipt) {
    try {
      // Format existing receipt details
      const existingDate = existingReceipt.receiptDate ?
        new Date(existingReceipt.receiptDate).toLocaleDateString() : 'Not detected';
      const existingAmount = existingReceipt.totalAmount ?
        parseFloat(existingReceipt.totalAmount).toFixed(2) : '0.00';
      const existingCurrency = existingReceipt.currency || 'INR';
      const currencySymbol = this.currencyService.getCurrencySymbol(existingCurrency);
      const invoiceRef = existingReceipt.invoiceNumber || existingReceipt.billNumber || 'N/A';

      const duplicateMessage = `🔍 *DUPLICATE DETECTED!*

This document matches an existing expense:
• Merchant: ${existingReceipt.merchantName || 'Unknown'}
• Date: ${existingDate}
• Invoice #${invoiceRef}
• Total: ${currencySymbol}${existingAmount}
• Category: ${existingReceipt.category || 'Not set'}

*WHAT WOULD YOU LIKE TO DO?*`;

      const duplicateOptions = [
        { id: 'continue_override', text: 'Continue' },
        { id: 'process_document', text: 'Process New Expense' },
        { id: 'main_menu', text: 'Main Menu' }
      ];

      // Store both receipts in session for potential override
      const { USER_STATES } = require('../models/database/Session');

      // CRITICAL: Keep currentReceipt available for category handling
      await this.sessionManager.setCurrentReceipt(phoneNumber, newReceiptData);

      await this.sessionManager.updateUserState(phoneNumber, USER_STATES.IDLE, {
        newReceiptData: newReceiptData, // Backup copy
        existingReceiptId: existingReceipt.id,
        duplicateHandling: true
      });

      await this.whatsAppService.sendMessage(phoneNumber, duplicateMessage);
      await this.whatsAppService.sendInteractiveButtons(phoneNumber, 'Choose an option:', duplicateOptions, 'duplicate_detection');

    } catch (error) {
      console.error('Error handling duplicate detection:', error);
      // If error, continue with normal processing
      await this.processReceiptForExpenseTracking(phoneNumber);
    }
  }

  // Clean up failed receipt processing
  async cleanupFailedReceipt(phoneNumber, filePath) {
    try {
      console.log(`🧹 Cleaning up failed receipt for ${phoneNumber}`);

      // Clear current receipt from session
      await this.sessionManager.setCurrentReceipt(phoneNumber, null);

      // Reset session state to idle
      const { USER_STATES } = require('../models/database/Session');
      await this.sessionManager.updateUserState(phoneNumber, USER_STATES.IDLE, {
        processingError: true,
        lastError: new Date()
      });

      // Clean up file if it exists
      if (filePath && !this.ocrService.testingMode) {
        await this.safeDeleteFile(filePath);
      }

      console.log(`✅ Cleanup completed for ${phoneNumber}`);
    } catch (error) {
      console.error(`❌ Error during cleanup for ${phoneNumber}:`, error);
      // Don't throw - cleanup failure shouldn't break the flow
    }
  }

  // Safely delete file without throwing errors
  async safeDeleteFile(filePath) {
    try {
      const fs = require('fs').promises;
      const path = require('path');

      // Only delete if file exists and is in our upload directory
      if (await this.fileExists(filePath) && filePath.includes('uploads/')) {
        await fs.unlink(filePath);
        console.log(`🗑️ Deleted file: ${path.basename(filePath)}`);
      }
    } catch (error) {
      console.error(`❌ Failed to delete file ${filePath}:`, error);
      // Don't throw - file deletion failure is not critical
    }
  }

  // Check if file exists
  async fileExists(filePath) {
    try {
      const fs = require('fs').promises;
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  // Schedule cleanup for uploaded file
  scheduleFileCleanup(filePath, delayMinutes = 60) {
    if (!filePath || this.ocrService.testingMode) {
      return; // Don't schedule cleanup in test mode
    }

    setTimeout(async () => {
      try {
        const FileCleanupManager = require('../services/FileCleanupManager');
        const fileCleanupManager = new FileCleanupManager();

        // Check if file still exists and is orphaned
        if (await this.fileExists(filePath)) {
          const path = require('path');
          const fileName = path.basename(filePath);
          const isOrphaned = await fileCleanupManager.isFileOrphaned(filePath, fileName);

          if (isOrphaned) {
            await this.safeDeleteFile(filePath);
            console.log(`🧹 Scheduled cleanup: deleted orphaned file ${fileName}`);
          }
        }
      } catch (error) {
        console.error(`❌ Scheduled cleanup failed for ${filePath}:`, error);
      }
    }, delayMinutes * 60 * 1000);

    console.log(`⏲️ Scheduled cleanup for ${require('path').basename(filePath)} in ${delayMinutes} minutes`);
  }
}

module.exports = DocumentProcessingHandler;