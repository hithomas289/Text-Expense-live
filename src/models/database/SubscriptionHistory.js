const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const SubscriptionHistory = sequelize.define('SubscriptionHistory', {
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
  
  // Subscription details
  planType: {
    type: DataTypes.ENUM('trial', 'lite', 'pro'),
    allowNull: false
  },
  stripeSubscriptionId: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  stripeEventType: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'webhook event type'
  },
  
  // Billing information
  amountPaid: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: true
  },
  billingPeriodStart: {
    type: DataTypes.DATE,
    allowNull: true
  },
  billingPeriodEnd: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  // Event tracking
  eventData: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Full Stripe webhook payload'
  },
  processedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
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
  tableName: 'subscription_history',
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['stripeSubscriptionId']
    },
    {
      fields: ['stripeEventType']
    },
    {
      fields: ['planType']
    },
    {
      fields: ['processedAt']
    }
  ]
});

// Class methods
SubscriptionHistory.logEvent = async function(userId, eventData) {
  return await this.create({
    userId,
    planType: eventData.planType,
    stripeSubscriptionId: eventData.stripeSubscriptionId,
    stripeEventType: eventData.eventType,
    amountPaid: eventData.amountPaid,
    currency: eventData.currency,
    billingPeriodStart: eventData.billingPeriodStart,
    billingPeriodEnd: eventData.billingPeriodEnd,
    eventData: eventData,
    processedAt: new Date()
  });
};

SubscriptionHistory.getRecentEvents = async function(userId, limit = 10) {
  return await this.findAll({
    where: { userId },
    order: [['processedAt', 'DESC']],
    limit
  });
};

module.exports = SubscriptionHistory;