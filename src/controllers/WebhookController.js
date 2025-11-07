const config = require('../config/config');
const WhatsAppService = require('../services/WhatsAppService');
const DatabaseSessionManager = require('../services/DatabaseSessionManager');
const MessageRouterV3 = require('./MessageRouterV3');

class WebhookController {
  constructor() {
    this.whatsAppService = new WhatsAppService();
    this.sessionManager = new DatabaseSessionManager();

    // Connect WhatsApp service to session manager for notifications
    this.sessionManager.setWhatsAppService(this.whatsAppService);

    this.messageRouter = new MessageRouterV3(this.whatsAppService, this.sessionManager);

    // Duplicate message prevention cache (stores message IDs for 5 minutes)
    this.processedMessages = new Map();
    this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    // Multiple image detection - tracks image uploads per user
    this.imageUploads = new Map(); // phoneNumber -> { timestamps: [], errorShown: boolean }
    this.IMAGE_WINDOW = 5000; // 5 seconds window to detect multiple images
  }

  async initialize() {
    await this.messageRouter.initialize();
  }

  // Clear image upload tracking for a user (called when they click action buttons)
  clearImageUploadTracking(phoneNumber) {
    if (this.imageUploads.has(phoneNumber)) {
      this.imageUploads.delete(phoneNumber);
      console.log(`🧹 Cleared image upload tracking for ${phoneNumber}`);
    }
  }

  // Webhook verification (GET request)
  async verifyWebhook(req, res) {
    try {
      const VERIFY_TOKEN = config.whatsapp.webhookVerifyToken;
      
      const mode = req.query['hub.mode'];
      const token = req.query['hub.verify_token'];
      const challenge = req.query['hub.challenge'];
      
      
      if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
          res.status(200).send(challenge);
        } else {
          res.sendStatus(403);
        }
      } else {
        res.sendStatus(400);
      }
    } catch (error) {
      console.error('Error in webhook verification:', error);
      res.sendStatus(500);
    }
  }

  // Handle incoming messages (POST request)
  async handleIncomingMessage(req, res) {

    try {
      const body = req.body;

      if (body.object) {
        const messageData = this.whatsAppService.parseWebhookMessage(body);

        if (messageData) {
          const { from, message, messageId } = messageData;

          // Check if multiple images/documents were sent at once (single webhook with array)
          if (messageData.multipleImages) {
            console.log(`⚠️ Multiple images in single webhook detected: ${messageData.count} images from ${from}`);

            const errorMessage = `⚠️ Please send one image/file at a time for processing.

I can only process a single receipt image or document in each message.`;

            const buttons = [
              { id: 'process_document', text: 'Process New Expense' },
              { id: 'main_menu', text: 'Main Menu' },
              { id: 'how_it_works', text: 'How It Works' }
            ];

            await this.whatsAppService.sendInteractiveButtons(from, errorMessage, buttons, 'multiple_images_error');
            res.status(200).send('MULTIPLE_IMAGES_REJECTED');
            return;
          }

          // Check for multiple images sent rapidly (separate webhooks within time window)
          if (message.type === 'image' || message.type === 'document') {
            const now = Date.now();

            // Get or create tracking data for this user
            if (!this.imageUploads.has(from)) {
              this.imageUploads.set(from, { timestamps: [], errorShown: false });
            }

            const userData = this.imageUploads.get(from);

            // Remove timestamps older than the window
            userData.timestamps = userData.timestamps.filter(ts => now - ts < this.IMAGE_WINDOW);

            // Add current timestamp
            userData.timestamps.push(now);

            // If this is the 2nd+ image within the window
            if (userData.timestamps.length > 1) {
              console.log(`⚠️ Multiple images detected in time window: ${userData.timestamps.length} images from ${from}`);

              // Mark session to abort any ongoing processing - get current session first
              const currentSession = await this.sessionManager.getSession(from);
              await this.sessionManager.updateUserState(from, currentSession.state, {
                ...currentSession.metadata,
                multipleImagesDetected: true,
                multipleImagesTimestamp: now
              });

              // Show error only once per batch
              if (!userData.errorShown) {
                const errorMessage = `⚠️Please send one image/file at a time for processing.

I can only process a single receipt image or document in each message.`;

                const buttons = [
                  { id: 'process_document', text: 'Process New Expense' },
                  { id: 'main_menu', text: 'Main Menu' },
                  { id: 'how_it_works', text: 'How It Works' }
                ];

                await this.whatsAppService.sendInteractiveButtons(from, errorMessage, buttons, 'multiple_images_error');
                userData.errorShown = true;

                // Reset error flag after window expires
                setTimeout(() => {
                  if (this.imageUploads.has(from)) {
                    this.imageUploads.get(from).errorShown = false;
                  }
                }, this.IMAGE_WINDOW);

                // Clear the flag after window expires
                setTimeout(async () => {
                  try {
                    const session = await this.sessionManager.getSession(from);
                    await this.sessionManager.updateUserState(from, session.state, {
                      ...session.metadata,
                      multipleImagesDetected: false,
                      multipleImagesTimestamp: null
                    });
                    console.log(`✅ Cleared multipleImagesDetected flag for ${from}`);
                  } catch (error) {
                    console.error('Error clearing multipleImagesDetected flag:', error);
                  }
                }, this.IMAGE_WINDOW);
              }

              res.status(200).send('MULTIPLE_IMAGES_REJECTED');
              return;
            }

            // Reset errorShown flag for new upload session
            userData.errorShown = false;

            // Clean up old entries after window expires
            setTimeout(() => {
              if (this.imageUploads.has(from)) {
                const data = this.imageUploads.get(from);
                data.timestamps = data.timestamps.filter(ts => Date.now() - ts < this.IMAGE_WINDOW);
                if (data.timestamps.length === 0) {
                  this.imageUploads.delete(from);
                }
              }
            }, this.IMAGE_WINDOW);
          }

          // Clear image upload tracking and multipleImagesDetected flag when user interacts
          if (message.type === 'interactive' || message.type === 'text') {
            this.clearImageUploadTracking(from);

            // Clear the multipleImagesDetected flag on any interaction
            try {
              const session = await this.sessionManager.getSession(from);
              if (session.metadata?.multipleImagesDetected) {
                await this.sessionManager.updateUserState(from, session.state, {
                  ...session.metadata,
                  multipleImagesDetected: false,
                  multipleImagesTimestamp: null
                });
                console.log(`🧹 Cleared multipleImagesDetected flag for ${from} on user interaction`);
              }
            } catch (error) {
              console.error('Error clearing multipleImagesDetected flag on interaction:', error);
            }
          }

          // Check for duplicate message
          if (messageId && this.processedMessages.has(messageId)) {
            console.log(`⚠️ Duplicate message detected: ${messageId} from ${from} - skipping`);
            res.status(200).send('DUPLICATE_SKIPPED');
            return;
          }

          // Mark message as processed
          if (messageId) {
            this.processedMessages.set(messageId, Date.now());
            // Clean up old entries (older than 5 minutes)
            const now = Date.now();
            for (const [id, timestamp] of this.processedMessages.entries()) {
              if (now - timestamp > this.CACHE_DURATION) {
                this.processedMessages.delete(id);
              }
            }
          }

          // Auto-add contact removed - was causing performance and permission issues

          // Route message through the message router
          await this.messageRouter.routeMessage(from, message);
        }

        res.status(200).send('EVENT_RECEIVED');
      } else {
        res.sendStatus(404);
      }
    } catch (error) {
      console.error('Error handling incoming message:', error);
      console.error('Error stack:', error.stack);
      res.status(500).send('Internal Server Error');
    }
  }

  // Manual contact addition endpoint
  async addContact(req, res) {
    try {
      const { phoneNumber } = req.body;
      
      if (!phoneNumber) {
        return res.status(400).json({ 
          success: false, 
          error: 'Phone number is required' 
        });
      }
      
      const result = await this.whatsAppService.addContact(phoneNumber);
      
      if (result) {
        res.json({ 
          success: true, 
          message: 'Contact added successfully', 
          data: result 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: 'Failed to add contact' 
        });
      }
    } catch (error) {
      console.error('Error adding contact:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error',
        error: error.message 
      });
    }
  }

  // Get session statistics (for admin/debugging)
  async getSessionStats(req, res) {
    try {
      const stats = await this.sessionManager.getSessionStats();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error getting session stats:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Reset user session (for testing)
  async resetUserSession(req, res) {
    try {
      const { phoneNumber } = req.params;
      
      if (!phoneNumber) {
        return res.status(400).json({
          success: false,
          error: 'Phone number is required'
        });
      }
      
      const result = await this.sessionManager.resetSession(phoneNumber);
      
      res.json({
        success: true,
        message: result ? 'Session reset successfully' : 'Session not found',
        data: { phoneNumber, reset: result }
      });
    } catch (error) {
      console.error('Error resetting session:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Health check endpoint
  async healthCheck(req, res) {
    try {
      const stats = await this.sessionManager.getSessionStats();
      res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        environment: config.server.nodeEnv,
        sessions: {
          total: stats.total,
          active: stats.active
        }
      });
    } catch (error) {
      console.error('Health check error:', error);
      res.status(500).json({
        success: false,
        status: 'unhealthy',
        error: error.message
      });
    }
  }

  // Graceful shutdown
  shutdown() {
    this.sessionManager.shutdown();
  }
}

module.exports = WebhookController;