const USER_STATES = {
  IDLE: 'idle',
  WAITING_FOR_IMAGE: 'waiting_for_image',
  PROCESSING_IMAGE: 'processing_image',
  WAITING_FOR_CATEGORY: 'waiting_for_category',
  WAITING_FOR_CONFIRMATION: 'waiting_for_confirmation',
  WAITING_FOR_MERCHANT_NAME: 'waiting_for_merchant_name',
  EDITING_DETAILS: 'editing_details',
  GENERATING_REPORT: 'generating_report',
  WAITING_FOR_CURRENCY_SELECTION: 'waiting_for_currency_selection',
  SAVING_RECEIPT: 'saving_receipt',
  WAITING_FOR_SAVE_CATEGORY: 'waiting_for_save_category',
  WAITING_FOR_CUSTOM_SAVE_CATEGORY: 'waiting_for_custom_save_category',
  WAITING_FOR_RECEIPT_DESCRIPTION: 'waiting_for_receipt_description'
};

// Text-based categories (no button limits)
const EXPENSE_CATEGORIES = [
  { id: 1, name: 'Business Meal', emoji: '1️⃣' },
  { id: 2, name: 'Personal Dining', emoji: '2️⃣' },
  { id: 3, name: 'Client Entertainment', emoji: '3️⃣' },
  { id: 4, name: 'Travel Expense', emoji: '4️⃣' },
  { id: 5, name: 'Office Supplies', emoji: '5️⃣' },
  { id: 6, name: 'Others', emoji: '6️⃣' }
];

// Save Receipt categories (different from expense processing)
const SAVE_RECEIPT_CATEGORIES = [
  { id: 1, name: 'Warranty & Returns', emoji: '1️⃣' },
  { id: 2, name: 'Medical & Insurance', emoji: '2️⃣' },
  { id: 3, name: 'Tax Documents', emoji: '3️⃣' },
  { id: 4, name: 'Home & Property', emoji: '4️⃣' },
  { id: 5, name: 'Auto & Vehicle', emoji: '5️⃣' },
  { id: 6, name: 'Shopping Records', emoji: '6️⃣' },
  { id: 7, name: 'Other', emoji: '7️⃣' }
];

class UserSession {
  constructor(phoneNumber) {
    this.phoneNumber = phoneNumber;
    this.state = USER_STATES.IDLE;
    this.currentReceipt = null;
    this.receipts = [];
    this.plan = 'free'; // free, pro
    this.receiptsUsedThisMonth = 0;
    this.createdAt = new Date();
    this.lastActivity = new Date();
    this.metadata = {};
    this.notificationsSent = {
      warningAt28Min: false,
      expiredAt30Min: false,
      lastWarningAt: null,
      lastExpiredAt: null
    };
  }

  // State management
  updateState(newState, data = {}) {
    this.state = newState;
    this.lastActivity = new Date();
    
    // Merge any additional data
    Object.assign(this, data);
    
    console.log(`User ${this.phoneNumber} state changed to: ${newState}`);
  }

  isIdle() {
    return this.state === USER_STATES.IDLE;
  }

  // Receipt management
  addReceipt(receipt) {
    this.receipts.push(receipt);
    this.receiptsUsedThisMonth++;
    this.currentReceipt = null;
    this.updateState(USER_STATES.IDLE);
  }

  hasReachedLimit() {
    // Use planLimits if available (from database), otherwise fallback to old plan field
    const proLimit = parseInt(process.env.PRO_RECEIPT_LIMIT) || 25;
    const trialLimit = parseInt(process.env.TRIAL_RECEIPT_LIMIT) || 5;
    const limit = this.planLimits?.maxReceipts || (this.plan === 'pro' ? proLimit : trialLimit);
    return this.receiptsUsedThisMonth >= limit;
  }

  getRemainingReceipts() {
    // Use planLimits if available (from database), otherwise fallback to old plan field
    const proLimit = parseInt(process.env.PRO_RECEIPT_LIMIT) || 25;
    const trialLimit = parseInt(process.env.TRIAL_RECEIPT_LIMIT) || 5;
    const limit = this.planLimits?.maxReceipts || (this.plan === 'pro' ? proLimit : trialLimit);
    return Math.max(0, limit - this.receiptsUsedThisMonth);
  }

  // Statistics
  getTotalExpenses() {
    return this.receipts.reduce((sum, receipt) => sum + (receipt.totalAmount || 0), 0);
  }

  getReceiptsByCategory() {
    const categories = {};
    this.receipts.forEach(receipt => {
      if (receipt.category) {
        if (!categories[receipt.category]) {
          categories[receipt.category] = { count: 0, total: 0 };
        }
        categories[receipt.category].count++;
        categories[receipt.category].total += receipt.totalAmount || 0;
      }
    });
    return categories;
  }

  // Session validation
  isExpired(maxIdleMinutes = 30) {
    const now = new Date();
    const diffMinutes = (now - this.lastActivity) / (1000 * 60);
    return diffMinutes > maxIdleMinutes;
  }

  // Check if 28-minute warning should be sent
  shouldSend28MinWarning() {
    if (this.notificationsSent.warningAt28Min) {
      return false; // Already sent
    }

    const now = new Date();
    const diffMinutes = (now - this.lastActivity) / (1000 * 60);

    // Send warning between 28 and 30 minutes
    return diffMinutes >= 28 && diffMinutes < 30 && this.currentReceipt !== null;
  }

  // Check if 30-minute expiry notification should be sent
  shouldSend30MinExpiry() {
    if (this.notificationsSent.expiredAt30Min) {
      return false; // Already sent
    }

    const now = new Date();
    const diffMinutes = (now - this.lastActivity) / (1000 * 60);

    // Send expiry notification at 30+ minutes
    return diffMinutes >= 30 && this.currentReceipt !== null;
  }

  // Mark notification as sent
  markNotificationSent(type) {
    if (type === 'warning') {
      this.notificationsSent.warningAt28Min = true;
      this.notificationsSent.lastWarningAt = new Date();
    } else if (type === 'expired') {
      this.notificationsSent.expiredAt30Min = true;
      this.notificationsSent.lastExpiredAt = new Date();
    }
  }

  // Serialization
  toJSON() {
    return {
      phoneNumber: this.phoneNumber,
      state: this.state,
      currentReceipt: this.currentReceipt,
      receipts: this.receipts,
      plan: this.plan,
      receiptsUsedThisMonth: this.receiptsUsedThisMonth,
      createdAt: this.createdAt,
      lastActivity: this.lastActivity,
      metadata: this.metadata
    };
  }

  static fromJSON(data) {
    const session = new UserSession(data.phoneNumber);
    session.state = data.state || USER_STATES.IDLE;
    session.currentReceipt = data.currentReceipt;
    session.receipts = data.receipts || [];
    session.plan = data.plan || 'free';
    session.receiptsUsedThisMonth = data.receiptsUsedThisMonth || 0;
    session.createdAt = new Date(data.createdAt);
    session.lastActivity = new Date(data.lastActivity);
    session.metadata = data.metadata || {};
    session.notificationsSent = data.notificationsSent || {
      warningAt28Min: false,
      expiredAt30Min: false
    };
    return session;
  }
}

module.exports = {
  UserSession,
  USER_STATES,
  EXPENSE_CATEGORIES,
  SAVE_RECEIPT_CATEGORIES
};