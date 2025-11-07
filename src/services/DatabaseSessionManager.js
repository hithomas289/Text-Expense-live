const { User, Session, USER_STATES, ExpenseV2 } = require('../models/database/indexV2');
const SubscriptionHistory = require('../models/database/SubscriptionHistory');
const { sequelize } = require('../config/database');
const CurrencyService = require('./CurrencyService');
const sessionLockManager = require('./SessionLockManager');

class DatabaseSessionManager {
  constructor(whatsAppService = null) {
    this.cleanupInterval = null;
    this.currencyService = new CurrencyService();
    this.whatsAppService = whatsAppService;
    // Start cleanup task
    this.startCleanupTask();
  }

  // Set WhatsApp service for sending notifications
  setWhatsAppService(whatsAppService) {
    this.whatsAppService = whatsAppService;
    console.log('📱 WhatsApp service connected to DatabaseSessionManager');
  }

  // Get or create user session with database-level locking
  async getSession(phoneNumber) {
    return await sessionLockManager.withSessionLock(phoneNumber, 'getSession', async () => {
      const transaction = await sequelize.transaction();

      try {
        // Get or create user with database lock
        const { user } = await User.getOrCreate(phoneNumber, { transaction });

        // Get or create session with database lock - DATABASE IS PRIMARY SOURCE
        const { session, created } = await Session.getOrCreateByUserId(user.id, {
          transaction,
          lock: transaction.LOCK.UPDATE  // Row-level lock for race condition protection
        });

        // Add user reference for convenience
        session._user = user;

        // Load subscription data directly onto database session
        await this.loadUserSubscriptionData(session, user, { transaction });

        // Debug logging for currentReceipt
        console.log(`🔍 DatabaseSessionManager.getSession: Retrieved session for ${phoneNumber}, currentReceipt exists: ${!!session.currentReceipt}, state: ${session.state}`);

        await transaction.commit();
        return session;
      } catch (error) {
        await transaction.rollback();
        console.error(`Error getting session for ${phoneNumber}:`, error);
        throw error;
      }
    });
  }

  // Update user state - DATABASE PRIMARY
  async updateUserState(phoneNumber, newState, data = {}) {
    return await sessionLockManager.withSessionLock(phoneNumber, 'updateUserState', async () => {
      const transaction = await sequelize.transaction();

      try {
        // Get or create user with database lock (skip session lock since we already have it)
        const { user } = await User.getOrCreate(phoneNumber, { transaction });

        // Get or create session with database lock
        const { session } = await Session.getOrCreateByUserId(user.id, {
          transaction,
          lock: transaction.LOCK.UPDATE
        });

        // Add user reference for convenience
        session._user = user;

        // Load subscription data
        await this.loadUserSubscriptionData(session, user, { transaction });

        // DATABASE IS PRIMARY - update database within transaction
        await session.updateState(newState, data, { transaction });

        await transaction.commit();
        return session;
      } catch (error) {
        await transaction.rollback();
        console.error(`Error updating state for ${phoneNumber}:`, error);
        throw error;
      }
    });
  }

  // Add receipt to user
  async addReceipt(phoneNumber, receiptData) {
    return await sessionLockManager.withSessionLock(phoneNumber, 'addReceipt', async () => {
      try {
        // Get session directly without nested lock (we're already inside withSessionLock)
        const transaction = await sequelize.transaction();
        const { user } = await User.getOrCreate(phoneNumber, { transaction });
        const { session } = await Session.getOrCreateByUserId(user.id, {
          transaction,
          lock: transaction.LOCK.UPDATE
        });
        await transaction.commit();

        if (!user) {
          throw new Error('User not found for receipt creation');
        }
        // Use the provided original file URL (which could be S3 URL or local URL)
        const baseUrl = process.env.BASE_URL || 'https://web-production-0178dc.up.railway.app';
        const fileUrl = receiptData.originalFileUrl || `${baseUrl}/uploads/${phoneNumber}/${receiptData.originalFilename || 'receipt'}`;
      
      // Create expense in unified ExpenseV2 table
      const expenseCreateData = {
        userId: user.id,
        merchantName: receiptData.merchantName,
        expenseDate: receiptData.receiptDate || receiptData.date || receiptData.extractedData?.date || new Date(),
        totalAmount: receiptData.totalAmount,
        subtotal: receiptData.subtotal || 0,
        taxAmount: receiptData.tax || 0,
        miscellaneousAmount: receiptData.miscellaneous || 0,
        originalCurrency: receiptData.currency || 'INR',
        category: receiptData.category || 'Uncategorized',
        items: receiptData.items || [],
        ocrText: receiptData.ocrText,
        aiExtractedData: receiptData.extractedData || receiptData.aiExtractedData,
        ocrConfidenceScore: receiptData.ocrConfidence || receiptData.confidence,
        status: 'draft',
        billNumber: receiptData.billNumber,
        invoiceNumber: receiptData.invoiceNumber,
        receiptDate: receiptData.receiptDate ? new Date(receiptData.receiptDate) : (receiptData.date ? new Date(receiptData.date) : null)
      };

      // Add file handling fields for ExpenseV2
      if (receiptData.originalFilename) expenseCreateData.originalFilename = receiptData.originalFilename;
      if (receiptData.fileType) expenseCreateData.fileFormat = receiptData.fileType;
      if (receiptData.fileSize) expenseCreateData.originalFileSizeMb = receiptData.fileSize;

        // Handle S3 data for ExpenseV2 - store S3 key, bucket, and URL
        const s3Data = receiptData.s3Data || receiptData.extractedData?.s3Data;
        if (s3Data && (s3Data.success || s3Data.s3Bucket)) {
          if (s3Data.s3Key) expenseCreateData.s3Key = s3Data.s3Key;
          if (s3Data.s3Bucket) expenseCreateData.s3Bucket = s3Data.s3Bucket;
          if (s3Data.url) expenseCreateData.originalDocumentUrl = s3Data.url;
        }

        // ALL OPERATIONS IN SINGLE TRANSACTION to prevent race conditions
        const outerTransaction = await sequelize.transaction();
        let expense;

        try {
          expense = await ExpenseV2.create(expenseCreateData, { transaction: outerTransaction });

          // ATOMIC: Update user receipt count within same transaction
          await user.incrementReceiptUsage({ transaction: outerTransaction });

          // ATOMIC: Clear current receipt in session within same transaction
          await session.clearCurrentReceipt({ transaction: outerTransaction });
          await session.updateState(USER_STATES.IDLE, {}, { transaction: outerTransaction });

          // Commit all operations atomically
          await outerTransaction.commit();

        } catch (dbError) {
          await outerTransaction.rollback();
          console.error('❌ Database transaction failed:', dbError);
          throw new Error(`Failed to save receipt: ${dbError.message}`);
        }

        return expense;
      } catch (error) {
        console.error(`Error adding receipt for ${phoneNumber}:`, error);
        throw error;
      }
    });
  }

  // Set current receipt being processed - DATABASE PRIMARY
  async setCurrentReceipt(phoneNumber, receiptData) {
    return await sessionLockManager.withSessionLock(phoneNumber, 'setCurrentReceipt', async () => {
      const transaction = await sequelize.transaction();

      try {
        // Get session directly without nested lock (we're already inside withSessionLock)
        const { user } = await User.getOrCreate(phoneNumber, { transaction });
        const { session } = await Session.getOrCreateByUserId(user.id, {
          transaction,
          lock: transaction.LOCK.UPDATE
        });

        // DATABASE IS PRIMARY - update within transaction
        await session.setCurrentReceipt(receiptData, { transaction });

        await transaction.commit();
        return receiptData;
      } catch (error) {
        await transaction.rollback();
        console.error(`Error setting current receipt for ${phoneNumber}:`, error);
        // Don't throw, just log and continue to maintain functionality
        return receiptData;
      }
    });
  }

  // Get all active sessions (for admin/debugging)
  async getAllSessions() {
    try {
      const sessions = await Session.findAll({
        include: [{
          model: User,
          as: 'user'
        }],
        order: [['lastActivity', 'DESC']]
      });
      
      return sessions;
    } catch (error) {
      console.error('Error getting all sessions:', error);
      return [];
    }
  }

  // Get session count
  async getSessionCount() {
    try {
      return await Session.count();
    } catch (error) {
      console.error('Error getting session count:', error);
      return 0;
    }
  }

  // Get active sessions (not expired)
  async getActiveSessions(maxIdleMinutes = 30) {
    try {
      const cutoffTime = new Date(Date.now() - maxIdleMinutes * 60 * 1000);
      
      const activeSessions = await Session.findAll({
        where: {
          lastActivity: {
            [Session.sequelize.Sequelize.Op.gte]: cutoffTime
          }
        },
        include: [{
          model: User,
          as: 'user'
        }]
      });
      
      return activeSessions;
    } catch (error) {
      console.error('Error getting active sessions:', error);
      return [];
    }
  }

  // Clean up expired sessions
  async cleanupExpiredSessions(maxIdleMinutes = 30) {
    try {
      const cleanedCount = await Session.cleanupExpiredSessions(maxIdleMinutes);
      return cleanedCount;
    } catch (error) {
      console.error('Error cleaning up expired sessions:', error);
      return 0;
    }
  }

  // Clean up 24-hour old unsaved receipts
  async cleanup24HourOldReceipts() {
    try {

      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      let cleanedCount = 0;

      // Find sessions with currentReceipt older than 24 hours
      const sessions = await Session.findAll({
        where: {
          currentReceipt: {
            [sequelize.Sequelize.Op.ne]: null
          }
        }
      });

      for (const session of sessions) {
        if (session.currentReceipt && session.currentReceipt.uploadedAt) {
          const uploadTime = new Date(session.currentReceipt.uploadedAt);

          if (uploadTime < twentyFourHoursAgo) {
            // Delete the local file if it exists
            if (session.currentReceipt.filePath) {
              try {
                const FileUtils = require('../utils/fileUtils');
                await FileUtils.deleteFile(session.currentReceipt.filePath);
              } catch (fileError) {
                console.warn(`⚠️ Could not delete file ${session.currentReceipt.filePath}:`, fileError.message);
              }
            }

            // Clear the currentReceipt from session
            await session.setCurrentReceipt(null);
            await session.updateUserState('idle');

            cleanedCount++;
          }
        }
      }

      return cleanedCount;
    } catch (error) {
      console.error('Error cleaning up 24-hour old receipts:', error);
      return 0;
    }
  }

  // Check active sessions for expiry notifications
  async checkSessionNotifications() {
    if (!this.whatsAppService) {
      return; // Can't send notifications without WhatsApp service
    }

    try {
      let warningsSent = 0;
      let expiredSent = 0;

      // Get all active sessions with unsaved receipts
      const sessions = await Session.findAll({
        where: {
          currentReceipt: {
            [require('sequelize').Op.ne]: null
          }
        },
        include: [{
          model: User,
          as: 'user',
          required: true
        }]
      });

      for (const session of sessions) {
        try {
          const phoneNumber = session.user.phoneNumber;
          const inactiveMinutes = (new Date() - session.lastActivity) / (1000 * 60);

          // Skip timeout notifications if payment is in progress
          const metadata = session.metadata || {};
          if (metadata.paymentInProgress) {
            const paymentStartTime = metadata.paymentStartTime ? new Date(metadata.paymentStartTime) : null;
            const paymentMinutes = paymentStartTime ? (new Date() - paymentStartTime) / (1000 * 60) : 0;

            // Allow up to 10 minutes for payment completion
            if (paymentMinutes < 10) {
              console.log(`⏸️ Skipping timeout for ${phoneNumber} - payment in progress (${paymentMinutes.toFixed(1)} min)`);
              continue;
            }
          }

          // Send 28-minute warning
          if (inactiveMinutes >= 28 && inactiveMinutes < 30 && !session.warningAt28MinSent) {
            await this.send28MinuteWarning(phoneNumber, session);
            warningsSent++;
          }

          // Send 30-minute expiry notification
          if (inactiveMinutes >= 30 && !session.expiredAt30MinSent) {
            await this.send30MinuteExpiry(phoneNumber, session);
            expiredSent++;
          }

        } catch (error) {
          console.error(`Failed to send notification to ${session.user?.phoneNumber}:`, error.message);
        }
      }

      if (warningsSent > 0 || expiredSent > 0) {
        console.log(`📨 Sent ${warningsSent} warnings, ${expiredSent} expiry notifications`);
      }

    } catch (error) {
      console.error('Error checking session notifications:', error);
    }
  }

  // Send 28-minute warning notification
  async send28MinuteWarning(phoneNumber, session) {
    const message = `⏰ *SESSION EXPIRING SOON*

You have an unsaved receipt that will be lost in 2 minutes.

*What to do:*
• Process your receipt for expense tracking
• Save to Receipt Vault for storage
• Or send a quick message to keep session active

*Don't lose your receipt!*`;

    await this.whatsAppService.sendMessage(phoneNumber, message);

    // Mark warning as sent in database
    await session.update({ warningAt28MinSent: true });

    console.log(`⚠️ Sent 28-minute warning to ${phoneNumber}`);
  }

  // Send 30-minute expiry notification with main menu
  async send30MinuteExpiry(phoneNumber, session) {
    const message = `❌ *SESSION EXPIRED*

Your session has expired and any unsaved receipt has been cleared.

*Ready to process new receipts?*`;

    const buttons = [
      { id: 'main_menu', text: 'Main Menu' },
      { id: 'process_document', text: 'Process New Expense' }
    ];

    await this.whatsAppService.sendMessage(phoneNumber, message);
    await this.whatsAppService.sendInteractiveButtons(
      phoneNumber,
      'Explore more features:',
      buttons,
      'session_expired'
    );

    // Clear unsaved receipt and mark expiry notification sent
    await session.update({
      currentReceipt: null,
      userState: 'idle',
      expiredAt30MinSent: true
    });

    console.log(`💀 Sent 30-minute expiry notification to ${phoneNumber}`);
  }

  // Start periodic cleanup task
  startCleanupTask(intervalMinutes = 10) {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    this.cleanupInterval = setInterval(async () => {
      await this.checkSessionNotifications(); // Check for expiry notifications
      await this.cleanupExpiredSessions();
      await this.cleanup24HourOldReceipts();
    }, intervalMinutes * 60 * 1000);

    console.log(`Started database session cleanup task (every ${intervalMinutes} minutes)`);
  }

  // Stop cleanup task
  stopCleanupTask() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  // Reset user session
  async resetSession(phoneNumber) {
    try {
      const user = await User.findByPhoneNumber(phoneNumber);
      if (user) {
        const session = await Session.findByUserId(user.id);
        if (session) {
          await session.updateState(USER_STATES.IDLE);
          await session.clearCurrentReceipt();
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error(`Error resetting session for ${phoneNumber}:`, error);
      return false;
    }
  }

  // Get session statistics
  async getSessionStats() {
    try {
      const totalUsers = await User.count();
      const totalReceipts = await ExpenseV2.count();
      const totalSessions = await Session.count();
      
      const activeSessionsCount = await Session.count({
        where: {
          lastActivity: {
            [Session.sequelize.Sequelize.Op.gte]: new Date(Date.now() - 30 * 60 * 1000)
          }
        }
      });
      
      const sessionsByState = await Session.findAll({
        attributes: [
          'state',
          [Session.sequelize.fn('COUNT', Session.sequelize.col('state')), 'count']
        ],
        group: ['state'],
        raw: true
      });
      
      const usersByPlan = await User.findAll({
        attributes: [
          'planType',
          [User.sequelize.fn('COUNT', User.sequelize.col('planType')), 'count']
        ],
        group: ['planType'],
        raw: true
      });
      
      const totalExpenses = await ExpenseV2.sum('totalAmount') || 0;
      
      const byState = {};
      sessionsByState.forEach(item => {
        byState[item.state] = parseInt(item.count);
      });
      
      const byPlan = { free: 0, pro: 0 };
      usersByPlan.forEach(item => {
        byPlan[item.planType] = parseInt(item.count);
      });
      
      return {
        totalUsers,
        totalSessions,
        totalReceipts,
        active: activeSessionsCount,
        expired: totalSessions - activeSessionsCount,
        byState,
        byPlan,
        totalExpenses: parseFloat(totalExpenses)
      };
    } catch (error) {
      console.error('Error getting session stats:', error);
      return {
        totalUsers: 0,
        totalSessions: 0,
        totalReceipts: 0,
        active: 0,
        expired: 0,
        byState: {},
        byPlan: { free: 0, pro: 0 },
        totalExpenses: 0
      };
    }
  }

  // Load user subscription data from database
  async loadUserSubscriptionData(session, user) {
    try {
      if (user) {
        // Update session with database subscription info
        session.subscription = {
          planType: user.planType,
          status: user.subscriptionStatus,
          customerId: user.stripeCustomerId,
          subscriptionId: user.stripeSubscriptionId,
          updatedAt: new Date()
        };

        // Set plan limits based on environment variables
        const limits = user.getMonthlyLimits();
        session.planLimits = {
          maxReceipts: limits.expenses,
          historyMonths: user.isPro() ? 3 : 1,
          priorityProcessing: user.isPro()
        };

        // Update receipt usage from database
        session.receiptsUsedThisMonth = user.receiptsUsedThisMonth;
      } else {
        // Default free plan for new users
        session.subscription = {
          planType: 'free',
          status: null,
          customerId: null,
          subscriptionId: null
        };

        const trialLimit = parseInt(process.env.TRIAL_RECEIPT_LIMIT) || 5;
        session.planLimits = {
          maxReceipts: trialLimit,
          historyMonths: 1,
          priorityProcessing: false
        };
      }
    } catch (error) {
      console.error('Error loading user subscription data:', error);
      // Fallback to free plan on error
      const trialLimit = parseInt(process.env.TRIAL_RECEIPT_LIMIT) || 5;
      session.subscription = { planType: 'free', status: null };
      session.planLimits = { maxReceipts: trialLimit, historyMonths: 1, priorityProcessing: false };
    }
  }

  // Refresh subscription data for a user
  async refreshUserSubscription(phoneNumber) {
    const session = await this.getSession(phoneNumber);
    const user = await User.findByPhoneNumber(phoneNumber);
    await this.loadUserSubscriptionData(session, user);
    return session;
  }

  // Check if user has reached their plan limit
  async checkPlanLimits(phoneNumber) {
    try {
      const user = await User.findByPhoneNumber(phoneNumber);

      if (user) {
        // Use User model with UsageLimitV2 for plan limits
        const isPro = user.isPro();
        const isLite = user.isLite();
        const hasReachedLimit = await user.hasReachedLimit(); // Now async
        const remainingReceipts = await user.getRemainingReceipts(); // Now async

        return {
          hasReachedLimit,
          remainingReceipts,
          planType: user.planType,
          isPro,
          isLite,
          isOnTrial: user.planType === 'trial'
        };
      }

      return {
        hasReachedLimit: true,
        remainingReceipts: 0,
        planType: 'trial', // Default to trial instead of 'free'
        isPro: false,
        isLite: false,
        isOnTrial: true
      };
    } catch (error) {
      console.error(`❌ Error in checkPlanLimits for ${phoneNumber}:`, error);
      return {
        hasReachedLimit: true,
        remainingReceipts: 0,
        planType: 'trial', // Default to trial instead of 'free'
        isPro: false,
        isLite: false,
        isOnTrial: true
      };
    }
  }

  // Get user's default currency
  async getUserCurrency(phoneNumber) {
    return await this.currencyService.getUserDefaultCurrency(phoneNumber);
  }

  // Format amount for user
  async formatAmountForUser(amount, phoneNumber) {
    return await this.currencyService.formatAmountForUser(amount, phoneNumber);
  }

  // Shutdown cleanup
  shutdown() {
    this.stopCleanupTask();
  }
}

module.exports = DatabaseSessionManager;