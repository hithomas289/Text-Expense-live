const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const UsageTracking = sequelize.define('UsageTracking', {
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
  
  // Time period tracking
  trackingMonth: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'First day of month (2025-01-01)'
  },
  
  // Usage counters
  documentsProcessed: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  documentsSuccessful: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  documentsFailed: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  
  // Breakdown by source
  uploadsFromReferrals: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
    comment: 'Bonus uploads used'
  },
  uploadsFromPlan: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
    comment: 'Regular plan uploads'
  },
  
  // Limits and allowances
  monthlyLimit: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Based on plan (5 for free, 25 for pro)'
  },
  bonusLimit: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
    comment: 'Additional from referrals'
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
  tableName: 'usage_tracking',
  indexes: [
    {
      unique: true,
      fields: ['userId', 'trackingMonth']
    },
    {
      fields: ['trackingMonth']
    },
    {
      fields: ['userId']
    }
  ]
});

// Instance methods
UsageTracking.prototype.getTotalUploadsUsed = function() {
  return this.uploadsFromPlan + this.uploadsFromReferrals;
};

UsageTracking.prototype.getTotalLimit = function() {
  return this.monthlyLimit + this.bonusLimit;
};

UsageTracking.prototype.hasReachedLimit = function() {
  return this.getTotalUploadsUsed() >= this.getTotalLimit();
};

UsageTracking.prototype.getRemainingUploads = function() {
  return Math.max(0, this.getTotalLimit() - this.getTotalUploadsUsed());
};

// Class methods
UsageTracking.getCurrentMonth = function() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
};

UsageTracking.getOrCreateForUser = async function(userId, planType = 'trial') {
  const trackingMonth = this.getCurrentMonth();
  const monthlyLimit = planType === 'pro' ?
    (parseInt(process.env.PRO_RECEIPT_LIMIT) || 25) :
    planType === 'lite' ?
      (parseInt(process.env.LITE_RECEIPT_LIMIT) || 5) :
      (parseInt(process.env.TRIAL_RECEIPT_LIMIT) || 5);
  
  const [usage, created] = await this.findOrCreate({
    where: { 
      userId, 
      trackingMonth 
    },
    defaults: {
      userId,
      trackingMonth,
      documentsProcessed: 0,
      documentsSuccessful: 0,
      documentsFailed: 0,
      uploadsFromReferrals: 0,
      uploadsFromPlan: 0,
      monthlyLimit,
      bonusLimit: 0
    }
  });
  
  return { usage, created };
};

module.exports = UsageTracking;