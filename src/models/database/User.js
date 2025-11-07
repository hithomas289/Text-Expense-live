const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  phoneNumber: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  countryCode: {
    type: DataTypes.STRING(5),
    allowNull: false,
    defaultValue: '+1'
  },
  countryName: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  defaultCurrency: {
    type: DataTypes.STRING(3),
    allowNull: true
  },
  currencySymbol: {
    type: DataTypes.STRING(5),
    allowNull: true
  },
  displayName: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  planType: {
    type: DataTypes.ENUM('trial', 'free', 'lite', 'pro'),
    defaultValue: 'trial',
    allowNull: false
  },
  isTrialExpired: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  subscriptionStatus: {
    type: DataTypes.ENUM('active', 'canceled', 'canceling', 'past_due', 'trialing', 'pending'),
    allowNull: true
  },
  stripeCustomerId: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: true
  },
  stripeSubscriptionId: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  referralCode: {
    type: DataTypes.STRING(20),
    unique: true,
    allowNull: true
  },
  referredBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  bonusUploadsEarned: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  bonusUploadsUsed: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  lastActiveAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  
  // Legacy fields for backward compatibility
  receiptsUsedThisMonth: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  receiptsUsedTotal: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
    comment: 'Total lifetime receipts processed (for trial tracking)'
  },
  monthlyUsageResetDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  billingCycleStart: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Stripe billing cycle start date (current_period_start)'
  },
  billingCycleEnd: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Stripe billing cycle end date (current_period_end) - usage resets on this date'
  },
  planUpgradedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Date when user upgraded from trial to a paid plan (lite/pro)'
  },

  // Saved receipts tracking
  savedReceiptsUsedThisMonth: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
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
  tableName: 'users',
  indexes: [
    {
      unique: true,
      fields: ['phoneNumber']
    },
    {
      fields: ['planType']
    },
    {
      fields: ['createdAt']
    }
  ]
});

// Instance methods

// Plan and subscription methods
User.prototype.isPro = function() {
  return this.planType === 'pro' && (this.subscriptionStatus === 'active' || this.subscriptionStatus === 'canceling');
};

User.prototype.isLite = function() {
  return this.planType === 'lite' && (this.subscriptionStatus === 'active' || this.subscriptionStatus === 'canceling');
};

User.prototype.isOnTrial = function() {
  return this.planType === 'trial' && !this.isTrialExpired;
};

User.prototype.getMonthlyLimits = function() {
  const envLimits = {
    trial: parseInt(process.env.TRIAL_RECEIPT_LIMIT) || 5,
    free: 0, // FREE plan = 0 receipts, must upgrade
    lite: parseInt(process.env.LITE_RECEIPT_LIMIT) || 6,
    pro: parseInt(process.env.PRO_RECEIPT_LIMIT) || 25
  };

  return {
    expenses: envLimits[this.planType] || 0,
    receipts: envLimits[this.planType] || 0
  };
};

User.prototype.hasReachedLimit = async function() {
  try {
    // Use UnifiedUsageService for accurate plan-specific limit checking
    const UnifiedUsageService = require('../../services/UnifiedUsageService');
    const result = await UnifiedUsageService.canProcessReceipt(this.id);

    // canProcess=false means limit reached
    return !result.canProcess;
  } catch (error) {
    console.error('❌ User.hasReachedLimit failed:', error);
    // Fallback to basic calculation
    const limits = this.getMonthlyLimits();
    if (this.planType === 'trial') {
      return this.receiptsUsedTotal >= limits.expenses;
    } else {
      return this.receiptsUsedThisMonth >= limits.expenses;
    }
  }
};

User.prototype.getRemainingReceipts = async function() {
  try {
    // Use UnifiedUsageService (handles trial all-time vs paid monthly logic)
    const UnifiedUsageService = require('../../services/UnifiedUsageService');
    const result = await UnifiedUsageService.canProcessReceipt(this.id);
    return result.remaining;
  } catch (error) {
    console.error('❌ User.getRemainingReceipts failed:', error);
    // Fallback to basic calculation
    const limits = this.getMonthlyLimits();
    if (this.planType === 'trial') {
      return Math.max(0, limits.expenses - this.receiptsUsedTotal);
    } else {
      return Math.max(0, limits.expenses - this.receiptsUsedThisMonth);
    }
  }
};

User.prototype.incrementReceiptUsage = async function(options = {}) {
  const UsageLimitV2 = require('./UsageLimitV2');
  const limits = this.getMonthlyLimits();

  try {
    // Use UsageLimitV2 as single source of truth
    const usageLimit = await UsageLimitV2.findOrCreateForCurrentMonth(this.id, limits);
    await usageLimit.incrementReceiptUsage(options);

    // Also update User table for backwards compatibility (but don't use for limits)
    this.receiptsUsedThisMonth += 1;
    this.receiptsUsedTotal += 1;

    // Mark trial as expired if limit reached (using UsageLimitV2 data)
    if (this.planType === 'trial' && usageLimit.totalReceipts >= limits.expenses) {
      this.isTrialExpired = true;
    }

    await this.save(options);
  } catch (error) {
    console.error('Error incrementing receipt usage:', error);
    // Fallback to old system if UsageLimitV2 fails
    this.receiptsUsedThisMonth += 1;
    this.receiptsUsedTotal += 1;

    if (this.planType === 'trial' && this.receiptsUsedTotal >= limits.expenses) {
      this.isTrialExpired = true;
    }

    await this.save(options);
  }
};

User.prototype.shouldResetMonthlyUsage = function() {
  const now = new Date();

  // For paid plans (lite/pro), use Stripe billing cycle if available
  if (this.planType !== 'trial' && this.billingCycleEnd) {
    return now >= new Date(this.billingCycleEnd);
  }

  // Fallback to calendar month for trial users or if billing cycle not set
  const lastReset = new Date(this.monthlyUsageResetDate);
  return now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear();
};

User.prototype.resetMonthlyUsage = async function() {
  // Only reset monthly usage for lite/pro plans, not trial total usage
  if (this.planType !== 'trial') {
    this.receiptsUsedThisMonth = 0;
    this.savedReceiptsUsedThisMonth = 0;
    this.monthlyUsageResetDate = new Date();
    await this.save();
  }
};

// Saved receipts quota methods
User.prototype.hasReachedSavedReceiptsLimit = function() {
  const limits = this.getMonthlyLimits();
  const used = this.savedReceiptsUsedThisMonth || 0;
  return used >= limits.receipts;
};

User.prototype.getRemainingSavedReceipts = function() {
  const limits = this.getMonthlyLimits();
  const used = this.savedReceiptsUsedThisMonth || 0;
  return Math.max(0, limits.receipts - used);
};

User.prototype.incrementSavedReceiptUsage = async function() {
  const currentUsage = this.savedReceiptsUsedThisMonth || 0;
  this.savedReceiptsUsedThisMonth = currentUsage + 1;
  await this.save();
};

// Mark current month's expenses and saved receipts as pre-upgrade
User.prototype.markExpensesAsPreUpgrade = async function() {
  const { sequelize } = require('../../config/database');
  const currentMonth = new Date();
  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0, 23, 59, 59);

  const transaction = await sequelize.transaction();

  try {
    // Mark expenses as pre-upgrade
    await sequelize.query(`
      UPDATE expenses
      SET metadata = COALESCE(metadata, '{}') || '{"preUpgrade": true, "originalPlan": "trial"}'
      WHERE "userId" = :userId
      AND "createdAt" >= :monthStart
      AND "createdAt" <= :monthEnd
    `, {
      replacements: { userId: this.id, monthStart, monthEnd },
      transaction
    });

    // Mark saved receipts as pre-upgrade
    await sequelize.query(`
      UPDATE saved_receipts
      SET metadata = COALESCE(metadata, '{}') || '{"preUpgrade": true, "originalPlan": "trial"}'
      WHERE "userId" = :userId
      AND "createdAt" >= :monthStart
      AND "createdAt" <= :monthEnd
    `, {
      replacements: { userId: this.id, monthStart, monthEnd },
      transaction
    });

    await transaction.commit();
    console.log(`📝 Marked current month's records as pre-upgrade for user ${this.id}`);
  } catch (error) {
    await transaction.rollback();
    console.error('Error marking records as pre-upgrade:', error);
    throw error;
  }
};

// Subscription management methods
User.prototype.upgradeToPlan = async function(planType, stripeCustomerId, stripeSubscriptionId, billingCycleDates = null) {
  const updateData = {
    planType: planType,
    subscriptionStatus: 'active',
    updatedAt: new Date()
  };

  // Add Stripe data if provided
  if (stripeCustomerId) updateData.stripeCustomerId = stripeCustomerId;
  if (stripeSubscriptionId) updateData.stripeSubscriptionId = stripeSubscriptionId;

  // Store old billing cycle end for Lite → Pro upgrades (to keep Lite receipts valid)
  const oldBillingCycleEnd = this.billingCycleEnd;
  const oldPlanType = this.planType;

  // Set billing cycle dates if provided (from Stripe subscription)
  if (billingCycleDates) {
    updateData.billingCycleStart = billingCycleDates.start;
    updateData.billingCycleEnd = billingCycleDates.end;
  } else if (planType !== 'trial') {
    // If no billing cycle provided but upgrading to paid plan, set default 30-day cycle
    const now = new Date();
    const cycleEnd = new Date(now);
    cycleEnd.setDate(cycleEnd.getDate() + 30);
    updateData.billingCycleStart = now;
    updateData.billingCycleEnd = cycleEnd;
  }

  // Handle plan upgrades differently based on source plan
  const isUpgradingPlans = this.planType !== planType && planType !== 'trial';

  if (isUpgradingPlans) {
    console.log(`🔄 Upgrading from ${this.planType} to ${planType}`);

    // Set planUpgradedAt to track when the user upgraded (for usage filtering)
    updateData.planUpgradedAt = new Date();

    // Special handling for Lite → Pro upgrade: Keep existing receipts, add new limit
    if (oldPlanType === 'lite' && planType === 'pro') {
      console.log(`📊 Lite → Pro upgrade: Preserving existing ${this.receiptsUsedThisMonth} receipts and extending limits`);

      // Store metadata about the upgrade to track dual billing cycles
      updateData.metadata = {
        ...this.metadata,
        liteProUpgrade: {
          upgradedAt: new Date(),
          liteReceiptsUsed: this.receiptsUsedThisMonth,
          liteBillingCycleEnd: oldBillingCycleEnd,
          proBillingCycleEnd: updateData.billingCycleEnd
        }
      };

      // DON'T reset usage counters - keep existing receipts counted
      // The UnifiedUsageService will calculate remaining as:
      // (Lite limit - Lite receipts used) + Pro limit

    } else {
      // For trial → paid upgrades, DON'T reset usage counters
      // receiptsUsedThisMonth tracks ALL receipts this month for display purposes
      // Limit checking uses plan-specific counters in UnifiedUsageService

      // REMOVED: updateData.receiptsUsedThisMonth = 0;
      // REMOVED: updateData.savedReceiptsUsedThisMonth = 0;

      updateData.monthlyUsageResetDate = new Date();

      if (this.planType === 'trial') {
        updateData.isTrialExpired = false;
      }

      // Mark current month's records as "pre-upgrade" in database
      try {
        const UnifiedUsageService = require('../../services/UnifiedUsageService');
        await this.markExpensesAsPreUpgrade();
        await UnifiedUsageService.validateAndFixSync(this.id);
        console.log(`✅ Successfully reset usage tracking for user ${this.id} after upgrading from ${this.planType} to ${planType}`);
      } catch (error) {
        console.error(`⚠️  Failed to reset usage tracking during plan upgrade:`, error);
      }
    }
  }

  await this.update(updateData);
  return this;
};

// Keep backward compatibility
User.prototype.upgradeToPro = async function(stripeCustomerId, stripeSubscriptionId) {
  return this.upgradeToPlan('pro', stripeCustomerId, stripeSubscriptionId);
};

User.prototype.cancelSubscription = async function() {
  // Revert to FREE plan (not trial - trial is one-time only)
  // FREE plan = 0 receipts, user must upgrade to use service
  await this.update({
    planType: 'free', // NOT 'trial' - free has 0 receipts
    subscriptionStatus: 'canceled',
    stripeSubscriptionId: null, // Clear subscription ID
    stripeCustomerId: null, // Keep customer ID for potential resubscription? Or null?
    billingCycleStart: null,
    billingCycleEnd: null,
    updatedAt: new Date()
  });
  return this;
};

User.prototype.updateSubscriptionStatus = async function(status) {
  await this.update({
    subscriptionStatus: status,
    updatedAt: new Date()
  });
  return this;
};

// Get user's default currency (prefer database, fallback to phone parsing)
User.prototype.getDefaultCurrency = function() {
  // If we have currency data in database, use it (faster)
  if (this.defaultCurrency && this.currencySymbol) {
    return {
      currency: this.defaultCurrency,
      symbol: this.currencySymbol,
      country: this.countryName || 'Unknown'
    };
  }
  
  // Fallback to phone number parsing if database fields are empty
  const PhoneNumberService = require('../../services/PhoneNumberService');
  const phoneService = new PhoneNumberService();
  
  try {
    const phoneData = phoneService.parsePhoneNumber(this.phoneNumber);
    return {
      currency: phoneData.country.currency,
      symbol: phoneData.country.symbol,
      country: phoneData.country.name
    };
  } catch (error) {
    // Final fallback to USD if everything fails
    return {
      currency: 'USD',
      symbol: '$',
      country: 'Unknown'
    };
  }
};

// Class methods
User.findByPhoneNumber = async function(phoneNumber) {
  // Try to find with formatted phone number first
  const PhoneNumberService = require('../../services/PhoneNumberService');
  const phoneService = new PhoneNumberService();
  const phoneData = phoneService.parsePhoneNumber(phoneNumber);
  
  // Try formatted number first
  let user = await this.findOne({ where: { phoneNumber: phoneData.formatted } });
  
  // If not found, try original format for backward compatibility
  if (!user) {
    user = await this.findOne({ where: { phoneNumber: phoneNumber } });
    
    // If found with old format, update to new format
    if (user) {
      console.log(`📞 Migrating phone number format for user: ${phoneNumber} → ${phoneData.formatted}`);
      await user.update({
        phoneNumber: phoneData.formatted,
        countryCode: phoneData.countryCallingCode,
        countryName: phoneData.country.name,
        defaultCurrency: phoneData.country.currency,
        currencySymbol: phoneData.country.symbol,
        metadata: {
          ...user.metadata,
          phoneData: phoneData,
          migratedFrom: phoneNumber
        }
      });
    }
  }
  
  return user;
};

User.getOrCreate = async function(phoneNumber) {
  // Parse and format phone number with geocoding
  const PhoneNumberService = require('../../services/PhoneNumberService');
  const phoneService = new PhoneNumberService();
  const phoneData = phoneService.parsePhoneNumber(phoneNumber);
  
  console.log(`📞 Creating/finding user with phone data:`, {
    original: phoneData.original,
    formatted: phoneData.formatted,
    country: phoneData.country.name,
    currency: phoneData.country.currency
  });
  
  // Use formatted E.164 number for database storage
  const formattedPhone = phoneData.formatted;
  
  let [user, created] = await this.findOrCreate({
    where: { phoneNumber: formattedPhone },
    defaults: {
      phoneNumber: formattedPhone,
      countryCode: phoneData.countryCallingCode,
      countryName: phoneData.country?.name || null,
      defaultCurrency: phoneData.country?.currency || 'INR',
      currencySymbol: phoneData.country?.currencySymbol || '₹',
      planType: 'trial',
      receiptsUsedThisMonth: 0,
      receiptsUsedTotal: 0,
      isTrialExpired: false,
      monthlyUsageResetDate: new Date(),
      isActive: true,
      metadata: {
        phoneData: phoneData // Store full phone data for reference
      }
    }
  });

  // Update metadata and currency data for existing users who don't have it cached
  if (!created && (!user.defaultCurrency || !user.metadata?.phoneData)) {
    await user.update({
      countryCode: phoneData.countryCallingCode,
      countryName: phoneData.country?.name || user.countryName,
      defaultCurrency: phoneData.country?.currency || user.defaultCurrency || 'INR',
      currencySymbol: phoneData.country?.currencySymbol || user.currencySymbol || '₹',
      metadata: {
        ...user.metadata,
        phoneData: phoneData
      }
    });
    console.log(`📱 Updated phone and currency data for existing user: ${formattedPhone}`);
  }

  // Reset monthly usage if needed
  if (user.shouldResetMonthlyUsage()) {
    await user.resetMonthlyUsage();
  }

  return { user, created };
};

module.exports = User;