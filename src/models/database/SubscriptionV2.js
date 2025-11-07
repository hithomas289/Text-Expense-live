const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

/*
 * SubscriptionV2 Model - Normalized Subscription Management
 *
 * Separate subscription data from user table for better normalization.
 * Handles Stripe integration and plan management.
 */
const SubscriptionV2 = sequelize.define('SubscriptionV2', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    unique: true,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE',
    field: 'user_id'
  },

  // Plan information
  planType: {
    type: DataTypes.ENUM('trial', 'lite', 'pro'),
    defaultValue: 'trial',
    allowNull: false,
    field: 'plan_type'
  },
  status: {
    type: DataTypes.ENUM('active', 'canceled', 'past_due', 'trialing'),
    comment: 'Current subscription status'
  },

  // Stripe integration
  stripeCustomerId: {
    type: DataTypes.STRING(100),
    unique: true,
    field: 'stripe_customer_id',
    comment: 'Stripe customer ID'
  },
  stripeSubscriptionId: {
    type: DataTypes.STRING(100),
    unique: true,
    field: 'stripe_subscription_id',
    comment: 'Stripe subscription ID'
  },

  // Billing periods
  trialStart: {
    type: DataTypes.DATE,
    field: 'trial_start',
    comment: 'Trial period start'
  },
  trialEnd: {
    type: DataTypes.DATE,
    field: 'trial_end',
    comment: 'Trial period end'
  },
  currentPeriodStart: {
    type: DataTypes.DATE,
    field: 'current_period_start',
    comment: 'Current billing period start'
  },
  currentPeriodEnd: {
    type: DataTypes.DATE,
    field: 'current_period_end',
    comment: 'Current billing period end'
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
  tableName: 'subscriptions',
  underscored: true,
  timestamps: true,
  indexes: [
    {
      name: 'idx_subscriptions_stripe_customer',
      fields: ['stripe_customer_id']
    },
    {
      name: 'idx_subscriptions_plan_status',
      fields: ['plan_type', 'status']
    }
  ]
});

// Instance methods
SubscriptionV2.prototype.isPro = function() {
  return this.planType === 'pro' && ['active', 'trialing'].includes(this.status);
};

SubscriptionV2.prototype.isLite = function() {
  return this.planType === 'lite' && ['active', 'trialing'].includes(this.status);
};

SubscriptionV2.prototype.isOnTrial = function() {
  return this.planType === 'trial';
};

SubscriptionV2.prototype.isActive = function() {
  return ['active', 'trialing'].includes(this.status);
};

SubscriptionV2.prototype.isInTrial = function() {
  return this.status === 'trialing' &&
         this.trialEnd &&
         new Date() <= new Date(this.trialEnd);
};

SubscriptionV2.prototype.getMonthlyLimits = function() {
  const envLimits = {
    trial: parseInt(process.env.TRIAL_RECEIPT_LIMIT) || 5,
    lite: parseInt(process.env.LITE_RECEIPT_LIMIT) || 5,
    pro: parseInt(process.env.PRO_RECEIPT_LIMIT) || 25
  };

  return {
    expenses: envLimits[this.planType] || 5,
    savedReceipts: envLimits[this.planType] || 5
  };
};

// Class methods
SubscriptionV2.createTrialSubscription = async function(userId) {
  return await this.create({
    userId,
    planType: 'trial',
    status: 'active'
  });
};

// Keep backward compatibility
SubscriptionV2.createFreeSubscription = async function(userId) {
  return await this.createTrialSubscription(userId);
};

SubscriptionV2.findByStripeCustomerId = async function(stripeCustomerId) {
  return await this.findOne({
    where: { stripeCustomerId }
  });
};

SubscriptionV2.findByUserId = async function(userId) {
  return await this.findOne({
    where: { userId }
  });
};

module.exports = SubscriptionV2;