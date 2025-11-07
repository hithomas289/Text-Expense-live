const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

/*
 * UsageLimitV2 Model - Normalized Usage Tracking
 *
 * Track monthly usage limits separately from user data.
 * Handles both expense processing and receipt vault usage.
 */
const UsageLimitV2 = sequelize.define('UsageLimitV2', {
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
    onDelete: 'CASCADE',
    field: 'user_id'
  },

  monthYear: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'First day of month (YYYY-MM-01)',
    field: 'month_year'
  },

  // Shared receipt limits (processing + saving combined)
  totalReceipts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'total_receipts',
    comment: 'Total receipts used this month (processed + saved combined)'
  },
  receiptsLimit: {
    type: DataTypes.INTEGER,
    defaultValue: 5,
    field: 'receipts_limit',
    comment: 'Monthly total receipts limit (shared between processing and saving)'
  },

  // Legacy fields - kept for backward compatibility and reporting
  expensesProcessed: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'expenses_processed',
    comment: 'Legacy: Number of expenses processed (for reporting only)'
  },
  receiptsSaved: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'receipts_saved',
    comment: 'Legacy: Number of receipts saved (for reporting only)'
  },

  // Referral bonuses
  bonusUploadsEarned: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'bonus_uploads_earned',
    comment: 'Bonus uploads earned from referrals'
  },
  bonusUploadsUsed: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'bonus_uploads_used',
    comment: 'Bonus uploads consumed'
  },

  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'updated_at'
  }
}, {
  tableName: 'usage_limits',
  underscored: true,
  timestamps: true,
  indexes: [
    {
      name: 'unique_user_month',
      fields: ['user_id', 'month_year'],
      unique: true
    },
    {
      name: 'idx_usage_current_month',
      fields: ['user_id', 'month_year']
    }
  ]
});

// Instance methods - SHARED LIMIT APPROACH
UsageLimitV2.prototype.canProcessExpense = async function() {
  const totalAllowed = this.receiptsLimit + (this.bonusUploadsEarned - this.bonusUploadsUsed);

  // Use shared counter instead of separate counters
  const actualTotalCount = await this.getActualTotalReceipts();
  return actualTotalCount < totalAllowed;
};

UsageLimitV2.prototype.canSaveReceipt = async function() {
  // Same logic as canProcessExpense - shared limit
  const totalAllowed = this.receiptsLimit + (this.bonusUploadsEarned - this.bonusUploadsUsed);

  const actualTotalCount = await this.getActualTotalReceipts();
  return actualTotalCount < totalAllowed;
};

UsageLimitV2.prototype.getRemainingReceipts = async function() {
  const totalAllowed = this.receiptsLimit + (this.bonusUploadsEarned - this.bonusUploadsUsed);

  // Count actual total receipts instead of separate counters
  const actualTotalCount = await this.getActualTotalReceipts();
  return Math.max(0, totalAllowed - actualTotalCount);
};

// Backward compatibility - same as getRemainingReceipts
UsageLimitV2.prototype.getRemainingExpenses = async function() {
  return await this.getRemainingReceipts();
};

// Count actual total receipts (processed + saved) for this month
UsageLimitV2.prototype.getActualTotalReceipts = async function() {
  try {
    const { Op } = require('sequelize');
    const monthStart = new Date(this.monthYear);
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0, 23, 59, 59);

    let processedCount = 0;
    let savedCount = 0;

    // Count processed expenses
    try {
      const ExpenseV2 = require('./ExpenseV2');
      processedCount = await ExpenseV2.count({
        where: {
          userId: this.userId,
          createdAt: {
            [Op.gte]: monthStart,
            [Op.lte]: monthEnd
          }
        }
      });
    } catch (expenseError) {
      // Receipt model fallback removed - using expenses table only
    }

    // Count saved receipts
    try {
      const SavedReceipt = require('./SavedReceipt');
      savedCount = await SavedReceipt.count({
        where: {
          userId: this.userId,
          isActive: true,
          uploadDate: {
            [Op.gte]: monthStart,
            [Op.lte]: monthEnd
          }
        }
      });
    } catch (savedError) {
      savedCount = this.receiptsSaved; // fallback to counter
    }

    const totalCount = processedCount + savedCount;
    console.log(`✅ User ${this.userId} total receipts in ${monthStart.toISOString().slice(0, 7)}: ${processedCount} processed + ${savedCount} saved = ${totalCount} total`);

    return totalCount;

  } catch (error) {
    console.error('Error counting total receipts:', error);
    // Fallback to legacy counters
    return this.expensesProcessed + this.receiptsSaved;
  }
};

// Legacy method - kept for backward compatibility
UsageLimitV2.prototype.getActualExpenseCount = async function() {
  const totalCount = await this.getActualTotalReceipts();
  console.log(`⚠️ getActualExpenseCount called - using shared total: ${totalCount}`);
  return totalCount;
};

UsageLimitV2.prototype.incrementExpenseUsage = async function(options = {}) {
  // Increment shared counter
  this.totalReceipts += 1;

  // Also increment legacy counter for reporting
  this.expensesProcessed += 1;

  // Use bonus uploads first if available
  if (this.bonusUploadsEarned > this.bonusUploadsUsed) {
    this.bonusUploadsUsed += 1;
  }

  return await this.save(options);
};

UsageLimitV2.prototype.incrementReceiptUsage = async function(options = {}) {
  // Increment shared counter
  this.totalReceipts += 1;

  // Also increment legacy counter for reporting
  this.receiptsSaved += 1;

  return await this.save(options);
};

UsageLimitV2.prototype.addBonusUploads = async function(count) {
  this.bonusUploadsEarned += count;
  return await this.save();
};

// Class methods
UsageLimitV2.getCurrentMonthDate = function() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
};

UsageLimitV2.findOrCreateForCurrentMonth = async function(userId, planLimits = {}) {
  const monthYear = this.getCurrentMonthDate();

  const [usageLimit, created] = await this.findOrCreate({
    where: {
      userId,
      monthYear
    },
    defaults: {
      userId,
      monthYear,
      receiptsLimit: planLimits.expenses || planLimits.savedReceipts || 5, // Use shared limit
      totalReceipts: 0, // New shared counter
      expensesProcessed: 0, // Legacy counter
      receiptsSaved: 0, // Legacy counter
      bonusUploadsEarned: 0,
      bonusUploadsUsed: 0
    }
  });

  // Update shared limit if it has changed (e.g., user upgraded plan)
  const newLimit = planLimits.expenses || planLimits.savedReceipts;
  if (!created && newLimit && usageLimit.receiptsLimit !== newLimit) {
    usageLimit.receiptsLimit = newLimit;
    await usageLimit.save();
    console.log(`📊 Updated shared receipts limit for user ${userId}: ${newLimit}`);
  }

  return usageLimit;
};

UsageLimitV2.getUserCurrentUsage = async function(userId) {
  const monthYear = this.getCurrentMonthDate();

  return await this.findOne({
    where: {
      userId,
      monthYear
    }
  });
};

UsageLimitV2.resetMonthlyUsage = async function() {
  // This would be called by a cron job on the 1st of each month
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  lastMonth.setDate(1);

  const lastMonthUsage = await this.findAll({
    where: {
      monthYear: lastMonth
    }
  });

  console.log(`🔄 Monthly usage reset: Found ${lastMonthUsage.length} users to reset`);

  // Reset all usage counters (shared + legacy)
  for (const usage of lastMonthUsage) {
    await usage.update({
      totalReceipts: 0, // New shared counter
      expensesProcessed: 0, // Legacy counter
      receiptsSaved: 0, // Legacy counter
      bonusUploadsUsed: 0
    });
  }

  return lastMonthUsage.length;
};

module.exports = UsageLimitV2;