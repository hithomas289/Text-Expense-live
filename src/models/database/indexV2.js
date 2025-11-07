const { sequelize } = require('../../config/database');

// Import all models (simplified after migration)
const User = require('./User');
const ExpenseV2 = require('./ExpenseV2');
const SavedReceipt = require('./SavedReceipt');
const UsageLimitV2 = require('./UsageLimitV2');
const GeneratedReport = require('./GeneratedReport');
const { Session, USER_STATES } = require('./Session');

// Note: Removed after database simplification migration:
// - SubscriptionV2: Plan info moved to User model
// - Referral: Feature simplified
// - PlanConfig: Moved to environment variables

/*
 * Database Index V2 - Normalized Structure
 *
 * This replaces the old index.js with a clean, normalized structure:
 * - Single ExpenseV2 model (replaces + Expense)
 * - Separate SubscriptionV2 and UsageLimitV2 models
 * - Clean associations
 * - Better performance and maintainability
 */

// Define associations

// User associations
User.hasMany(ExpenseV2, {
  foreignKey: 'userId',
  as: 'expenses',
  onDelete: 'CASCADE'
});

User.hasMany(SavedReceipt, {
  foreignKey: 'userId',
  as: 'savedReceipts',
  onDelete: 'CASCADE'
});

User.hasMany(UsageLimitV2, {
  foreignKey: 'userId',
  as: 'usageLimits',
  onDelete: 'CASCADE'
});

User.hasOne(Session, {
  foreignKey: 'userId',
  as: 'session',
  onDelete: 'CASCADE'
});

User.hasMany(GeneratedReport, {
  foreignKey: 'userId',
  as: 'generatedReports',
  onDelete: 'CASCADE'
});

// User self-referral association (simplified)
User.belongsTo(User, {
  foreignKey: 'referredBy',
  as: 'referrer'
});

// Expense associations
ExpenseV2.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

ExpenseV2.belongsTo(ExpenseV2, {
  foreignKey: 'duplicateOf',
  as: 'originalExpense'
});

// SavedReceipt associations
SavedReceipt.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// UsageLimit associations
UsageLimitV2.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// Session associations
Session.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// GeneratedReport associations
GeneratedReport.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// Note: Referral associations removed after simplification

// Expense categories (from original model)
const EXPENSE_CATEGORIES = [
  { id: 1, name: 'Business Meal', emoji: '1️⃣' },
  { id: 2, name: 'Personal Dining', emoji: '2️⃣' },
  { id: 3, name: 'Client Entertainment', emoji: '3️⃣' },
  { id: 4, name: 'Travel Expense', emoji: '4️⃣' },
  { id: 5, name: 'Office Supplies', emoji: '5️⃣' },
  { id: 6, name: 'Others', emoji: '6️⃣' }
];

// Helper functions for backward compatibility

/*
 * Get user with all related data (normalized structure)
 */
const getUserWithAssociations = async (phoneNumber) => {
  try {
    return await User.findOne({
      where: { phoneNumber },
      include: [
        {
          model: Session,
          as: 'session'
        }
      ],
      timeout: 5000
    });
  } catch (error) {
    console.error('Error in getUserWithAssociations:', error);
    // Fallback: get user without associations
    return await User.findOne({ where: { phoneNumber } });
  }
};

/*
 * Create session data compatible with existing UserSession class
 * Updated for normalized structure
 */
const createLegacySessionData = async (phoneNumber) => {
  const userData = await getUserWithAssociations(phoneNumber);
  if (!userData) return null;

  const sessionData = userData.session || {};

  // Get recent expenses directly
  let expenses = [];
  try {
    expenses = await ExpenseV2.findAll({
      where: { userId: userData.id },
      order: [['createdAt', 'DESC']],
      limit: 10
    });
  } catch (error) {
    console.log('Unable to load expenses, continuing without them:', error.message);
  }

  return {
    phoneNumber: userData.phoneNumber,
    state: sessionData.state || USER_STATES.IDLE,
    current: sessionData.current|| sessionData.metadata?.current|| null,
    receipts: expenses.map(expense => ({
      id: expense.id,
      merchantName: expense.merchantName,
      date: expense.expenseDate,
      totalAmount: parseFloat(expense.totalAmount) || 0,
      category: expense.category,
      createdAt: expense.createdAt
    })),
    plan: userData.planType || 'free', // Use User model directly
    receiptsUsedThisMonth: userData.receiptsUsedThisMonth || 0,
    createdAt: userData.createdAt,
    lastActivity: sessionData.lastActivity || userData.updatedAt,
    metadata: sessionData.metadata || {},
    _dbSession: sessionData
  };
};

/*
 * Get user's current usage and limits (simplified after migration)
 */
const getUserUsageInfo = async (phoneNumber) => {
  try {
    const user = await User.findOne({ where: { phoneNumber } });
    if (!user) return null;

    // Use User model directly for plan info
    const planLimits = user.getMonthlyLimits();

    // Get current month usage
    const usageLimit = await UsageLimitV2.findOrCreateForCurrentMonth(user.id, planLimits);

    return {
      userId: user.id,
      phoneNumber: user.phoneNumber,
      planType: user.planType,
      isPro: user.isPro(),
      limits: planLimits,
      currentUsage: {
        expenses: await usageLimit.getActualExpenseCount(),
        saveds: usageLimit.receiptsSaved,
        bonusUploads: usageLimit.bonusUploadsEarned - usageLimit.bonusUploadsUsed
      },
      remaining: {
        expenses: user.getRemainings(),
        saveds: user.getRemainingSaveds()
      }
    };
  } catch (error) {
    console.error('Error getting usage info:', error);
    return null;
  }
};

/*
 * Initialize database with proper associations
 */
const initializeDatabase = async () => {
  try {
    console.log('🔄 Initializing normalized database structure...');

    // Sync all models (create tables if they don't exist)
    await sequelize.sync({ alter: false }); // Don't alter existing tables

    console.log('✅ Database initialized with normalized structure');
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return false;
  }
};

module.exports = {
  sequelize,

  // Core models (simplified after migration)
  User,
  ExpenseV2,
  SavedReceipt,
  UsageLimitV2,
  Session,
  GeneratedReport,

  // Legacy models (kept for backward compatibility)
  Expense: require('./Expense'), // Keep for legacy references

  // Constants
  USER_STATES,
  EXPENSE_CATEGORIES,

  // Helper functions
  getUserWithAssociations,
  createLegacySessionData,
  getUserUsageInfo,
  initializeDatabase
};