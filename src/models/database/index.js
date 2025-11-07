const { sequelize } = require('../../config/database');
const User = require('./User');
const Expense = require('./Expense');
const { Session, USER_STATES } = require('./Session');
const UsageTracking = require('./UsageTracking');
const DocumentUpload = require('./DocumentUpload');
const Referral = require('./Referral');
const SubscriptionHistory = require('./SubscriptionHistory');
const GeneratedReport = require('./GeneratedReport');
const SavedReceipt = require('./SavedReceipt');

// Define associations

// User associations
User.hasMany({ 
  foreignKey: 'userId',
  as: 'receipts',
  onDelete: 'CASCADE'
});

User.hasMany(Expense, {
  foreignKey: 'userId',
  as: 'legacyExpenses', // Changed alias to avoid conflict
  onDelete: 'CASCADE'
});

User.hasOne(Session, {
  foreignKey: 'userId',
  as: 'legacySession', // Changed from 'session' to avoid conflict with indexV2
  onDelete: 'CASCADE'
});

User.hasMany(UsageTracking, {
  foreignKey: 'userId',
  as: 'usageTracking',
  onDelete: 'CASCADE'
});

User.hasMany(DocumentUpload, {
  foreignKey: 'userId',
  as: 'documentUploads',
  onDelete: 'CASCADE'
});

User.hasMany(Referral, {
  foreignKey: 'referrerId',
  as: 'legacyReferralsSent', // Changed to avoid conflict
  onDelete: 'CASCADE'
});

User.hasMany(Referral, {
  foreignKey: 'referredUserId',
  as: 'legacyReferralReceived', // Changed to avoid conflict
  onDelete: 'CASCADE'
});

User.hasMany(SubscriptionHistory, {
  foreignKey: 'userId',
  as: 'legacySubscriptionHistory', // Changed to avoid conflict
  onDelete: 'CASCADE'
});

User.hasMany(GeneratedReport, {
  foreignKey: 'userId',
  as: 'legacyGeneratedReports', // Changed to avoid conflict
  onDelete: 'CASCADE'
});

User.hasMany(SavedReceipt, {
  foreignKey: 'userId',
  as: 'savedReceipts',
  onDelete: 'CASCADE'
});

// Self-referential association for referrals
User.belongsTo(User, {
  foreignKey: 'referredBy',
  as: 'legacyReferrer' // Changed to avoid conflict
});

// associations (legacy)
.belongsTo(User, {
  foreignKey: 'userId',
  as: 'legacyUser' // Changed to avoid conflict
});

// Expense associations
Expense.belongsTo(User, {
  foreignKey: 'userId',
  as: 'legacyExpenseUser' // Changed to avoid conflict
});

Expense.belongsTo(Expense, {
  foreignKey: 'duplicateOf',
  as: 'legacyOriginalExpense' // Changed to avoid conflict
});

// Session associations
Session.belongsTo(User, {
  foreignKey: 'userId',
  as: 'legacySessionUser' // Changed to avoid conflict
});

// UsageTracking associations
UsageTracking.belongsTo(User, {
  foreignKey: 'userId',
  as: 'legacyTrackingUser' // Changed to avoid conflict
});

// DocumentUpload associations
DocumentUpload.belongsTo(User, {
  foreignKey: 'userId',
  as: 'legacyUploadUser' // Changed to avoid conflict
});

DocumentUpload.belongsTo(Expense, {
  foreignKey: 'expenseId',
  as: 'legacyExpense' // Changed to avoid conflict
});

// Referral associations
Referral.belongsTo(User, {
  foreignKey: 'referrerId',
  as: 'legacyReferrerUser' // Changed to avoid conflict
});

Referral.belongsTo(User, {
  foreignKey: 'referredUserId',
  as: 'legacyReferredUser' // Changed to avoid conflict
});

// SubscriptionHistory associations
SubscriptionHistory.belongsTo(User, {
  foreignKey: 'userId',
  as: 'legacySubscriptionUser' // Changed to avoid conflict
});

// GeneratedReport associations
GeneratedReport.belongsTo(User, {
  foreignKey: 'userId',
  as: 'legacyReportUser' // Changed to avoid conflict
});

// SavedReceipt associations
SavedReceipt.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// Import the expense categories from the original model
const EXPENSE_CATEGORIES = [
  { id: 1, name: 'Business Meal', emoji: '1️⃣' },
  { id: 2, name: 'Personal Dining', emoji: '2️⃣' },
  { id: 3, name: 'Client Entertainment', emoji: '3️⃣' },
  { id: 4, name: 'Travel Expense', emoji: '4️⃣' },
  { id: 5, name: 'Office Supplies', emoji: '5️⃣' },
  { id: 6, name: 'Others', emoji: '6️⃣' }
];

// Helper function to get full user data with associations
const getUserWithAssociations = async (phoneNumber) => {
  try {
    // Temporarily get user without receipts to avoid schema errors
    return await User.findOne({
      where: { phoneNumber },
      include: [
        {
          model: Session,
          as: 'legacySession'
        }
      ],
      timeout: 5000 // 5 second timeout
    });
  } catch (error) {
    console.error('Error in getUserWithAssociations:', error);
    // Fallback: get user without associations
    return await User.findOne({ where: { phoneNumber } });
  }
};

// Helper function to create user session data compatible with existing UserSession class
const createLegacySessionData = async (phoneNumber) => {
  const userData = await getUserWithAssociations(phoneNumber);
  if (!userData) return null;

  const sessionData = userData.legacySession || {};

  // Only log essential session info to reduce log noise
  console.log(`🔍 DEBUG: createLegacySessionData for session ${sessionData.id}, current:`, sessionData.current? 'HAS DATA' : 'NULL');
  if (sessionData.current) {
    console.log('Session has current:', {
      imageId: sessionData.current.imageId,
      merchantName: sessionData.current.merchantName,
      totalAmount: sessionData.current.totalAmount,
      category: sessionData.current.category,
      hasOcrResult: !!sessionData.current.ocrResult
    });
  } else {
    console.log('Session data from DB: No current');
    // Check metadata backup
    if (sessionData.metadata?.current) {
      console.log('📋 DEBUG: Found currentin metadata backup');
    } else {
      console.log('📋 DEBUG: No currentin metadata either');
    }
  }

  // Safely get expenses directly from database to avoid association issues
  let receipts = [];
  try {
    const Expense = require('./Expense');
    receipts = await Expense.findAll({
      where: { userId: userData.id, status: { [require('sequelize').Op.ne]: 'deleted' } },
      order: [['createdAt', 'DESC']]
    });
  } catch (error) {
    console.log('Unable to load expenses, continuing without them:', error.message);
  }

  return {
    phoneNumber: userData.phoneNumber,
    state: sessionData.state || USER_STATES.IDLE,
    current: sessionData.current|| sessionData.metadata?.current|| null,
    receipts: receipts.map(r => r.toData ? r.toData() : {
      id: r.id,
      merchantName: r.merchantName,
      date: r.receiptDate,
      totalAmount: parseFloat(r.totalAmount) || 0,
      category: r.category,
      createdAt: r.createdAt
    }),
    plan: userData.planType,
    receiptsUsedThisMonth: userData.receiptsUsedThisMonth,
    createdAt: userData.createdAt,
    lastActivity: sessionData.lastActivity || userData.updatedAt,
    metadata: sessionData.metadata || {}
  };
};

module.exports = {
  sequelize,
  User,
  // Legacy model for backward compatibility
  Expense, // New primary expense model
  Session,
  UsageTracking,
  DocumentUpload,
  Referral,
  SubscriptionHistory,
  GeneratedReport,
  SavedReceipt, // New saved receipts model
  USER_STATES,
  EXPENSE_CATEGORIES,
  getUserWithAssociations,
  createLegacySessionData
};