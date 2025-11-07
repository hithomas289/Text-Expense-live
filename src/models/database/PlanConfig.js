const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

/*
 * PlanConfig Model - Dynamic Plan Configuration
 *
 * This model stores configurable plan details including pricing,
 * limits, and features that can be updated without code changes.
 */
const PlanConfig = sequelize.define('PlanConfig', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  planType: {
    type: DataTypes.ENUM('trial', 'lite', 'pro', 'enterprise'),
    allowNull: false,
    unique: true
  },
  planName: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Display name for the plan'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Price in dollars (e.g., 4.99 for $4.99)'
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'USD',
    comment: 'Currency code (USD, INR, EUR, etc.)'
  },
  currencySymbol: {
    type: DataTypes.STRING(5),
    allowNull: false,
    defaultValue: '$',
    comment: 'Currency symbol for display'
  },
  billingCycle: {
    type: DataTypes.ENUM('monthly', 'yearly', 'lifetime'),
    allowNull: false,
    defaultValue: 'monthly'
  },
  stripeProductId: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Stripe product ID for payment processing'
  },
  stripePriceId: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Stripe price ID for subscription'
  },
  features: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
    comment: 'Array of feature descriptions'
  },
  limits: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {},
    comment: 'Plan limits (expenses, savedReceipts, etc.)'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Whether this plan is available for new subscriptions'
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Display order for plans'
  }
}, {
  tableName: 'plan_configs',
  timestamps: true,
  indexes: [
    {
      fields: ['planType'],
      unique: true
    },
    {
      fields: ['isActive', 'sortOrder']
    }
  ]
});

// Instance methods
PlanConfig.prototype.getDisplayPrice = function() {
  // PRIORITY: Environment variables override database values
  let price = parseFloat(this.price);

  // Check environment variables first (Railway web service variables)
  if (this.planType === 'pro') {
    const envPrice = process.env.PRO_PLAN_PRICE;
    if (envPrice && !isNaN(parseFloat(envPrice / 100))) {
      price = parseFloat(envPrice / 100); // Convert paise to rupees
      console.log(`💰 Using environment PRO price: ${process.env.CURRENCY_SYMBOL}${price} (was ${this.price} in DB)`);
    }
  } else if (this.planType === 'lite') {
    const envPrice = process.env.LITE_PLAN_PRICE;
    if (envPrice && !isNaN(parseFloat(envPrice / 100))) {
      price = parseFloat(envPrice / 100); // Convert paise to rupees
      console.log(`💰 Using environment LITE price: ${process.env.CURRENCY_SYMBOL}${price} (was ${this.price} in DB)`);
    }
  } else if (this.planType === 'trial') {
    price = 0; // Trial is always free
  }

  if (price === 0) {
    return 'Free';
  }

  const formattedPrice = price % 1 === 0 ? price.toString() : price.toFixed(2);
  const cycle = this.billingCycle === 'monthly' ? '/mo' :
                this.billingCycle === 'yearly' ? '/year' : '';

  return `${this.currencySymbol}${formattedPrice}${cycle}`;
};

PlanConfig.prototype.getFeaturesList = function() {
  // Generate dynamic features based on current limits
  const limits = this.getLimits();
  const baseFeatures = this.features || [];

  // Create dynamic features based on environment variables
  const dynamicFeatures = [];

  if (this.planType === 'pro') {
    dynamicFeatures.push(`${limits.expenses} receipts per month`);
    dynamicFeatures.push('3-months history');
    dynamicFeatures.push('Priority processing');
    dynamicFeatures.push('Email support');
  } else if (this.planType === 'lite') {
    dynamicFeatures.push(`${limits.expenses} receipts per month`);
    dynamicFeatures.push('1-month history');
    dynamicFeatures.push('Standard processing');
    dynamicFeatures.push('WhatsApp support');
  } else if (this.planType === 'trial') {
    dynamicFeatures.push(`${limits.expenses} uploads (one-time trial)`);
    dynamicFeatures.push('Basic processing');
    dynamicFeatures.push('WhatsApp support');
  }

  // Return dynamic features if available, otherwise use stored features
  return dynamicFeatures.length > 0 ? dynamicFeatures : baseFeatures;
};

PlanConfig.prototype.getLimits = function() {
  let limits = {
    expenses: this.limits?.expenses || 0,
    savedReceipts: this.limits?.savedReceipts || 0,
    ...this.limits
  };

  // PRIORITY: Environment variables override database limits
  if (this.planType === 'pro') {
    const envReceiptLimit = process.env.PRO_RECEIPT_LIMIT;

    if (envReceiptLimit && !isNaN(parseInt(envReceiptLimit))) {
      limits.expenses = parseInt(envReceiptLimit);
      limits.savedReceipts = parseInt(envReceiptLimit);
      console.log(`📊 Using environment PRO receipt limit: ${limits.expenses} (was ${this.limits?.expenses} in DB)`);
    }
  } else if (this.planType === 'lite') {
    const envReceiptLimit = process.env.LITE_RECEIPT_LIMIT;

    if (envReceiptLimit && !isNaN(parseInt(envReceiptLimit))) {
      limits.expenses = parseInt(envReceiptLimit);
      limits.savedReceipts = parseInt(envReceiptLimit);
      console.log(`📊 Using environment LITE receipt limit: ${limits.expenses} (was ${this.limits?.expenses} in DB)`);
    }
  } else if (this.planType === 'trial') {
    const envReceiptLimit = process.env.TRIAL_RECEIPT_LIMIT;

    if (envReceiptLimit && !isNaN(parseInt(envReceiptLimit))) {
      limits.expenses = parseInt(envReceiptLimit);
      limits.savedReceipts = parseInt(envReceiptLimit);
      console.log(`📊 Using environment TRIAL receipt limit: ${limits.expenses} (was ${this.limits?.expenses} in DB)`);
    }
  }

  return limits;
};

// Class methods
PlanConfig.getPlanByType = async function(planType) {
  try {
    return await this.findOne({
      where: {
        planType,
        isActive: true
      }
    });
  } catch (error) {
    console.error(`Error getting plan config for ${planType}:`, error);
    return null;
  }
};

PlanConfig.getAllActivePlans = async function() {
  try {
    return await this.findAll({
      where: { isActive: true },
      order: [['sortOrder', 'ASC'], ['price', 'ASC']]
    });
  } catch (error) {
    console.error('Error getting active plans:', error);
    return [];
  }
};

PlanConfig.getUpgradeOptions = async function(currentPlanType = 'free') {
  try {
    const currentPlan = await this.getPlanByType(currentPlanType);
    const currentPrice = currentPlan ? parseFloat(currentPlan.price) : 0;

    return await this.findAll({
      where: {
        isActive: true,
        price: {
          [require('sequelize').Op.gt]: currentPrice
        }
      },
      order: [['price', 'ASC'], ['sortOrder', 'ASC']]
    });
  } catch (error) {
    console.error('Error getting upgrade options:', error);
    return [];
  }
};

// Initialize default plans
PlanConfig.initializeDefaultPlans = async function() {
  try {
    console.log('🔄 Initializing default plan configurations...');

    // Load all values from environment variables with fallbacks
    const trialLimit = parseInt(process.env.TRIAL_RECEIPT_LIMIT) || 5;
    const liteLimit = parseInt(process.env.LITE_RECEIPT_LIMIT) || 6;
    const proLimit = parseInt(process.env.PRO_RECEIPT_LIMIT) || 25;
    const litePrice = parseInt(process.env.LITE_PLAN_PRICE) || 299;
    const proPrice = parseInt(process.env.PRO_PLAN_PRICE) || 499;

    const plans = [
      {
        planType: 'trial',
        planName: 'Free Trial',
        price: 0,
        currency: 'USD',
        currencySymbol: '$',
        billingCycle: 'monthly',
        features: [
          `${trialLimit} receipts (one-time trial)`,
          'Basic processing',
          'WhatsApp support'
        ],
        limits: {
          expenses: trialLimit,
          savedReceipts: trialLimit
        },
        isActive: true,
        sortOrder: 1
      },
      {
        planType: 'lite',
        planName: 'TextExpense Lite',
        price: litePrice / 100,
        currency: 'USD',
        currencySymbol: '$',
        billingCycle: 'monthly',
        stripeProductId: process.env.STRIPE_LITE_PRODUCT_ID || null,
        stripePriceId: process.env.STRIPE_LITE_PRICE_ID || null,
        features: [
          `${liteLimit} receipts per month`,
          '1-month history',
          'Standard processing',
          'WhatsApp support'
        ],
        limits: {
          expenses: liteLimit,
          savedReceipts: liteLimit
        },
        isActive: true,
        sortOrder: 2
      },
      {
        planType: 'pro',
        planName: 'TextExpense PRO',
        price: proPrice / 100,
        currency: 'USD',
        currencySymbol: '$',
        billingCycle: 'monthly',
        stripeProductId: process.env.STRIPE_PRO_PRODUCT_ID || null,
        stripePriceId: process.env.STRIPE_PRO_PRICE_ID || null,
        features: [
          `${proLimit} receipts per month`,
          '3-months history',
          'Priority processing',
          'Email support'
        ],
        limits: {
          expenses: proLimit,
          savedReceipts: proLimit
        },
        isActive: true,
        sortOrder: 3
      }
    ];

    for (const planData of plans) {
      const [plan, created] = await this.findOrCreate({
        where: { planType: planData.planType },
        defaults: planData
      });

      if (created) {
        console.log(`✅ Created ${planData.planType} plan configuration`);
      } else {
        console.log(`📋 ${planData.planType} plan configuration already exists`);
        // Update existing plan with new data if needed
        await plan.update(planData);
        console.log(`🔄 Updated ${planData.planType} plan configuration`);
      }
    }

    console.log('✅ Plan configurations initialized');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize plan configurations:', error);
    return false;
  }
};

module.exports = PlanConfig;