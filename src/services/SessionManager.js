const { UserSession, USER_STATES } = require('../models/UserSession');
const User = require('../models/database/User');

class SessionManager {
  constructor(whatsAppService = null) {
    // In-memory storage for now (will move to Redis/Database later)
    this.sessions = new Map();
    this.cleanupInterval = null;
    this.whatsAppService = whatsAppService;

    // Start cleanup task
    this.startCleanupTask();
  }

  // Set WhatsApp service for sending notifications
  setWhatsAppService(whatsAppService) {
    this.whatsAppService = whatsAppService;
    console.log('📱 WhatsApp service connected to SessionManager');
  }

  // Get or create user session
  async getSession(phoneNumber) {
    if (!this.sessions.has(phoneNumber)) {
      const session = new UserSession(phoneNumber);

      // Load user subscription data from database
      await this.loadUserSubscriptionData(session, phoneNumber);

      this.sessions.set(phoneNumber, session);
      console.log(`Created new session for user: ${phoneNumber}`);
    }

    const session = this.sessions.get(phoneNumber);

    // CRITICAL FIX: Check if session expired BEFORE updating lastActivity
    // If session expired (>30 min idle), clear unsaved receipt automatically
    if (session.isExpired(30) && session.currentReceipt) {
      console.log(`🧹 Session expired for ${phoneNumber}, clearing unsaved receipt`);
      session.currentReceipt = null;
      session.metadata = { ...session.metadata, receiptClearedDueToExpiry: true };
    }

    session.lastActivity = new Date(); // Update activity timestamp
    return session;
  }

  // Load user subscription data from database
  async loadUserSubscriptionData(session, phoneNumber) {
    try {
      const user = await User.findByPhoneNumber(phoneNumber);
      
      if (user) {
        // Update session with database subscription info
        session.subscription = {
          planType: user.planType,
          status: user.subscriptionStatus,
          customerId: user.stripeCustomerId,
          subscriptionId: user.stripeSubscriptionId,
          updatedAt: new Date()
        };
        
        // Set plan limits based on database
        const planLimits = {
          trial: { maxReceipts: parseInt(process.env.TRIAL_RECEIPT_LIMIT) || 5, historyMonths: 1, priorityProcessing: false },
          lite: { maxReceipts: parseInt(process.env.LITE_RECEIPT_LIMIT) || 5, historyMonths: 1, priorityProcessing: false },
          pro: { maxReceipts: parseInt(process.env.PRO_RECEIPT_LIMIT) || 25, historyMonths: 3, priorityProcessing: true }
        };

        session.planLimits = planLimits[user.planType] || planLimits.trial;

        // Update receipt usage from database
        session.receiptsUsedThisMonth = user.receiptsUsedThisMonth;
        
        console.log(`📊 Loaded ${user.planType.toUpperCase()} plan for ${phoneNumber}`);
      } else {
        // Default trial plan for new users
        session.subscription = {
          planType: 'trial',
          status: null,
          customerId: null,
          subscriptionId: null
        };
        
        session.planLimits = {
          maxReceipts: 5,
          historyMonths: 1,
          priorityProcessing: false
        };
      }
    } catch (error) {
      console.error('Error loading user subscription data:', error);
      // Fallback to trial plan on error
      session.subscription = { planType: 'trial', status: null };
      session.planLimits = { maxReceipts: 5, historyMonths: 1, priorityProcessing: false };
    }
  }

  // Update user state
  async updateUserState(phoneNumber, newState, data = {}) {
    const session = await this.getSession(phoneNumber);
    session.updateState(newState, data);
    return session;
  }

  // Refresh subscription data for a user
  async refreshUserSubscription(phoneNumber) {
    const session = await this.getSession(phoneNumber);
    await this.loadUserSubscriptionData(session, phoneNumber);
    return session;
  }

  // Add receipt to user and update database
  async addReceipt(phoneNumber, receiptData) {
    try {
      const session = await this.getSession(phoneNumber);
      
      // Add to session
      session.addReceipt(receiptData);
      
      // Update database usage - SHARED LIMIT SYSTEM
      try {
        const { User, SubscriptionV2, UsageLimitV2 } = require('../models/database/indexV2');
        const user = await User.findOne({ where: { phoneNumber } });

        if (user) {
          const subscription = await SubscriptionV2.findByUserId(user.id) ||
                              await SubscriptionV2.createFreeSubscription(user.id);
          const planLimits = subscription.getMonthlyLimits();
          const usageLimit = await UsageLimitV2.findOrCreateForCurrentMonth(user.id, planLimits);

          // Increment shared counter for expense processing
          await usageLimit.incrementExpenseUsage();

          const totalUsed = await usageLimit.getActualTotalReceipts();
          session.receiptsUsedThisMonth = totalUsed;

          console.log(`📊 Shared usage: ${totalUsed}/${usageLimit.receiptsLimit} total receipts for ${phoneNumber}`);
        }
      } catch (error) {
        console.error('❌ Failed to update shared usage, falling back to legacy:', error);
        // Fallback to legacy system
        const user = await User.findByPhoneNumber(phoneNumber);
        if (user) {
          await user.incrementReceiptUsage();
          session.receiptsUsedThisMonth = user.receiptsUsedThisMonth;
          const maxReceipts = user.planType === 'pro' ? (parseInt(process.env.PRO_RECEIPT_LIMIT) || 25) :
                             user.planType === 'lite' ? (parseInt(process.env.LITE_RECEIPT_LIMIT) || 5) :
                             (parseInt(process.env.TRIAL_RECEIPT_LIMIT) || 5);
          console.log(`📊 Legacy usage: ${user.receiptsUsedThisMonth}/${maxReceipts} for ${phoneNumber}`);
        }
      }
      
      return session;
    } catch (error) {
      console.error('Error adding receipt to database:', error);
      throw error;
    }
  }

  // Check if user has reached their plan limit - UPDATED FOR SHARED LIMITS
  async checkPlanLimits(phoneNumber) {
    console.log('🚀 ==== SessionManager VERSION: 1.0.1-fix-plan-display ====');
    const session = await this.getSession(phoneNumber);

    try {
      console.log('🔍 SessionManager.checkPlanLimits START for:', phoneNumber);
      // Use UnifiedUsageService for accurate limit checking (handles upgrade logic)
      const UnifiedUsageService = require('./UnifiedUsageService');
      const User = require('../models/database/User');

      const user = await User.findByPhoneNumber(phoneNumber);
      console.log('👤 User found:', user ? user.id : 'NOT FOUND');

      if (!user) {
        throw new Error('User not found');
      }

      // Use UnifiedUsageService which correctly handles plan upgrades
      console.log(`🔍 SessionManager calling UnifiedUsageService for user: ${user.id}`);
      const result = await UnifiedUsageService.canProcessReceipt(user.id);

      const canProcess = result.canProcess;
      const remaining = result.remaining;
      const planType = result.planType || 'trial';

      const isPro = planType === 'pro' && (user.subscriptionStatus === 'active' || user.subscriptionStatus === 'canceling');
      const isLite = planType === 'lite' && (user.subscriptionStatus === 'active' || user.subscriptionStatus === 'canceling');
      const isOnTrial = planType === 'trial';

      console.log(`📊 SessionManager result: ${!canProcess ? 'BLOCKED' : 'OK'}, used=${result.used}, remaining=${remaining}, limit=${result.limit}, plan=${planType}`);
      console.log(`📊 SessionManager flags: isPro=${isPro}, isLite=${isLite}, isOnTrial=${isOnTrial}`);

      const returnValue = {
        hasReachedLimit: !canProcess,
        remainingReceipts: remaining,
        usedReceipts: result.used,
        planType: planType,
        isPro: isPro,
        isLite: isLite,
        isOnTrial: isOnTrial
      };

      console.log('📊 SessionManager returning:', JSON.stringify(returnValue));
      return returnValue;

    } catch (error) {
      console.error('❌ Shared limit check failed, falling back to legacy:', error);

      // Fallback to legacy system
      const user = await User.findByPhoneNumber(phoneNumber);

      if (user) {
        return {
          hasReachedLimit: user.hasReachedLimit(),
          remainingReceipts: user.getRemainingReceipts(),
          usedReceipts: user.receiptsUsedThisMonth || 0,
          planType: user.planType,
          isPro: user.planType === 'pro' && (user.subscriptionStatus === 'active' || user.subscriptionStatus === 'canceling'),
          isLite: user.planType === 'lite' && (user.subscriptionStatus === 'active' || user.subscriptionStatus === 'canceling'),
          isOnTrial: user.planType === 'trial'
        };
      }

      return {
        hasReachedLimit: true,
        remainingReceipts: 0,
        usedReceipts: 0,
        planType: 'trial',
        isPro: false,
        isLite: false,
        isOnTrial: true
      };
    }
  }

  // Get all sessions (for admin/debugging)
  getAllSessions() {
    return Array.from(this.sessions.values());
  }

  // Get session count
  getSessionCount() {
    return this.sessions.size;
  }

  // Get active sessions (not expired)
  getActiveSessions(maxIdleMinutes = 30) {
    const activeSessions = [];
    for (const session of this.sessions.values()) {
      if (!session.isExpired(maxIdleMinutes)) {
        activeSessions.push(session);
      }
    }
    return activeSessions;
  }

  // Check sessions for expiry notifications
  async checkSessionNotifications() {
    if (!this.whatsAppService) {
      return; // Can't send notifications without WhatsApp service
    }

    let warningsSent = 0;
    let expiredSent = 0;

    for (const [phoneNumber, session] of this.sessions.entries()) {
      try {
        // Send 28-minute warning
        if (session.shouldSend28MinWarning()) {
          await this.send28MinuteWarning(phoneNumber, session);
          warningsSent++;
        }

        // Send 30-minute expiry notification
        if (session.shouldSend30MinExpiry()) {
          await this.send30MinuteExpiry(phoneNumber, session);
          expiredSent++;
        }
      } catch (error) {
        console.error(`Failed to send notification to ${phoneNumber}:`, error.message);
      }
    }

    if (warningsSent > 0 || expiredSent > 0) {
      console.log(`📨 Sent ${warningsSent} warnings, ${expiredSent} expiry notifications`);
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
    session.markNotificationSent('warning');

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

    // Clear the unsaved receipt and reset session
    session.currentReceipt = null;
    session.metadata = { ...session.metadata, receiptClearedDueToExpiry: true };
    session.markNotificationSent('expired');

    console.log(`💀 Sent 30-minute expiry notification to ${phoneNumber}`);
  }

  // Clean up expired sessions
  cleanupExpiredSessions(maxIdleMinutes = 30) {
    let cleanedCount = 0;

    for (const [phoneNumber, session] of this.sessions.entries()) {
      if (session.isExpired(maxIdleMinutes)) {
        this.sessions.delete(phoneNumber);
        cleanedCount++;
        console.log(`Cleaned up expired session for user: ${phoneNumber}`);
      }
    }

    if (cleanedCount > 0) {
      console.log(`Cleaned up ${cleanedCount} expired sessions`);
    }

    return cleanedCount;
  }

  // Start periodic cleanup task
  startCleanupTask(intervalMinutes = 10) {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    
    this.cleanupInterval = setInterval(() => {
      this.checkSessionNotifications(); // Check for expiry notifications
      this.cleanupExpiredSessions();
      this.enforceSessionLimits(); // Add session limits
    }, intervalMinutes * 60 * 1000);
    
    console.log(`Started session cleanup task (every ${intervalMinutes} minutes)`);
  }

  // Add session count limits for production
  enforceSessionLimits() {
    const maxSessions = 10000; // Limit to prevent memory issues
    
    if (this.sessions.size > maxSessions) {
      console.warn(`⚠️ Session count (${this.sessions.size}) exceeding limit (${maxSessions})`);
      
      // Remove oldest sessions first
      const sessionEntries = Array.from(this.sessions.entries())
        .sort((a, b) => a[1].lastActivity - b[1].lastActivity)
        .slice(0, this.sessions.size - maxSessions + 1000); // Remove 1000 oldest
      
      sessionEntries.forEach(([phoneNumber]) => {
        this.sessions.delete(phoneNumber);
      });
      
      console.log(`🧹 Cleaned up ${sessionEntries.length} oldest sessions`);
    }
  }

  // Stop cleanup task
  stopCleanupTask() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      console.log('Stopped session cleanup task');
    }
  }

  // Reset user session (useful for testing)
  resetSession(phoneNumber) {
    if (this.sessions.has(phoneNumber)) {
      this.sessions.delete(phoneNumber);
      console.log(`Reset session for user: ${phoneNumber}`);
      return true;
    }
    return false;
  }

  // Save session to persistent storage (to be implemented)
  async saveSession(phoneNumber) {
    const session = this.getSession(phoneNumber);
    // TODO: Implement database save
    console.log(`Saving session for user: ${phoneNumber}`);
    return session;
  }

  // Load session from persistent storage (to be implemented)
  async loadSession(phoneNumber) {
    // TODO: Implement database load
    console.log(`Loading session for user: ${phoneNumber}`);
    return this.getSession(phoneNumber);
  }

  // Get session statistics
  getSessionStats() {
    const sessions = Array.from(this.sessions.values());
    const now = new Date();
    
    const stats = {
      total: sessions.length,
      active: 0,
      expired: 0,
      byState: {},
      byPlan: { trial: 0, lite: 0, pro: 0 },
      totalReceipts: 0,
      totalExpenses: 0
    };

    sessions.forEach(session => {
      // Active vs expired
      if (session.isExpired()) {
        stats.expired++;
      } else {
        stats.active++;
      }

      // By state
      if (!stats.byState[session.state]) {
        stats.byState[session.state] = 0;
      }
      stats.byState[session.state]++;

      // By plan
      const planType = session.subscription?.planType || 'trial';
      if (stats.byPlan[planType] !== undefined) {
        stats.byPlan[planType]++;
      }

      // Totals
      stats.totalReceipts += session.receipts.length;
      stats.totalExpenses += session.getTotalExpenses();
    });

    return stats;
  }

  // Shutdown cleanup
  shutdown() {
    this.stopCleanupTask();
    console.log('SessionManager shutdown complete');
  }
}

module.exports = SessionManager;