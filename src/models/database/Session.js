const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');
const FileUtils = require('../../utils/fileUtils');

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
  { id: 1, name: 'Business Expense', emoji: '1️⃣' },
  { id: 2, name: 'Meals & Entertainment', emoji: '2️⃣' },
  { id: 3, name: 'Travel & Accommodation', emoji: '3️⃣' },
  { id: 4, name: 'Office & Supplies', emoji: '4️⃣' },
  { id: 5, name: 'Subscriptions & Software', emoji: '5️⃣' },
  { id: 6, name: 'Medical & Healthcare', emoji: '6️⃣' },
  { id: 7, name: 'Home & Utilities', emoji: '7️⃣' },
  { id: 8, name: 'Shopping & Personal', emoji: '8️⃣' },
  { id: 9, name: 'Custom Category', emoji: '9️⃣' }
];

// Save Receipt categories (different from expense processing)
const SAVE_RECEIPT_CATEGORIES = [
  { id: 1, name: 'Insurance Claims', emoji: '1️⃣' },
  { id: 2, name: 'Warranty & Returns', emoji: '2️⃣' },
  { id: 3, name: 'Tax Deductions', emoji: '3️⃣' },
  { id: 4, name: 'Medical Records/Bills', emoji: '4️⃣' },
  { id: 5, name: 'Appliance Maintenance Records', emoji: '5️⃣' },
  { id: 6, name: 'Transportation Pass', emoji: '6️⃣' },
  { id: 7, name: 'Tickets & Reservations', emoji: '7️⃣' },
  { id: 8, name: 'Childcare Records', emoji: '8️⃣' },
  { id: 9, name: 'Custom Category', emoji: '9️⃣' }
];




const Session = sequelize.define('Session', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  
  // Session state
  state: {
    type: DataTypes.ENUM(...Object.values(USER_STATES)),
    defaultValue: USER_STATES.IDLE,
    allowNull: false
  },
  
  // Current receipt being processed
  currentReceipt: {
    type: DataTypes.JSONB,
    defaultValue: null
  },
  
  // Session metadata
  lastActivity: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  },
  
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },

  // Session expiry notification flags
  warningAt28MinSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    field: 'warning_at_28_min_sent',
    comment: 'Whether 28-minute warning has been sent for current receipt'
  },
  expiredAt30MinSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    field: 'expired_at_30_min_sent',
    comment: 'Whether 30-minute expiry notification has been sent'
  },
  
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'sessions',
  indexes: [
    {
      unique: true,
      fields: ['userId']
    },
    {
      fields: ['state']
    },
    {
      fields: ['lastActivity']
    }
  ]
});

// Instance methods
Session.prototype.updateState = async function(newState, data = {}, options = {}) {
  this.state = newState;
  this.lastActivity = new Date();

  // Reset notification flags when user is active
  this.warningAt28MinSent = false;
  this.expiredAt30MinSent = false;

  // Merge any additional data into metadata
  if (Object.keys(data).length > 0) {
    // Sanitize data to remove null bytes that PostgreSQL JSONB cannot handle
    const sanitizedData = FileUtils.sanitizeForJsonb(data);
    this.metadata = { ...this.metadata, ...sanitizedData };
  }

  await this.save(options);
};

Session.prototype.isIdle = function() {
  return this.state === USER_STATES.IDLE;
};

Session.prototype.isExpired = function(maxIdleMinutes = 30) {
  const now = new Date();
  const diffMinutes = (now - this.lastActivity) / (1000 * 60);
  return diffMinutes > maxIdleMinutes;
};

Session.prototype.setCurrentReceipt = async function(receiptData, options = {}) {
  // Sanitize receipt data to remove null bytes that PostgreSQL JSONB cannot handle
  const sanitizedData = FileUtils.sanitizeForJsonb(receiptData);

  this.currentReceipt = sanitizedData;
  // Also store in metadata as backup
  this.metadata = { ...this.metadata, currentReceipt: sanitizedData };
  this.lastActivity = new Date();
  await this.save(options);
};

Session.prototype.clearCurrentReceipt = async function(options = {}) {
  this.currentReceipt = null;
  // Also clear from metadata to prevent conflict detection bugs
  if (this.metadata && this.metadata.currentReceipt) {
    this.metadata = { ...this.metadata, currentReceipt: null };
  }
  this.lastActivity = new Date();
  await this.save(options);
};

// Class methods
Session.findByUserId = async function(userId) {
  return await this.findOne({ where: { userId } });
};

Session.getOrCreateByUserId = async function(userId) {
  const [session, created] = await this.findOrCreate({
    where: { userId },
    defaults: {
      userId,
      state: USER_STATES.IDLE,
      currentReceipt: null,
      lastActivity: new Date(),
      metadata: {}
    }
  });
  
  return { session, created };
};

Session.cleanupExpiredSessions = async function(maxIdleMinutes = 60) { // Increased from 30 to 60 minutes
  const cutoffTime = new Date(Date.now() - maxIdleMinutes * 60 * 1000);
  
  const expiredSessions = await this.findAll({
    where: {
      lastActivity: {
        [sequelize.Sequelize.Op.lt]: cutoffTime
      },
      state: {
        [sequelize.Sequelize.Op.ne]: USER_STATES.IDLE
      }
    }
  });
  
  // Only reset sessions that don't have active receipts being processed
  const resetPromises = expiredSessions.map(session => {
    // If session has currentReceipt, give it more time (don't reset yet)
    if (session.currentReceipt) {
      console.log(`⏳ Preserving session ${session.userId} with active receipt`);
      return Promise.resolve();
    }
    return session.updateState(USER_STATES.IDLE, { expiredAndReset: true });
  });
  
  await Promise.all(resetPromises);
  
  console.log(`Reset ${expiredSessions.length} expired sessions to IDLE state`);
  return expiredSessions.length;
};

module.exports = {
  Session,
  USER_STATES,
  EXPENSE_CATEGORIES,
  SAVE_RECEIPT_CATEGORIES
};