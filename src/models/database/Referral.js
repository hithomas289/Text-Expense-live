const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Referral = sequelize.define('Referral', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  referrerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  referredUserId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  
  // Referral tracking
  referralCodeUsed: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  signupSource: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'whatsapp_link, qr_code, etc.'
  },
  
  // Rewards tracking
  bonusUploadsAwarded: {
    type: DataTypes.INTEGER,
    defaultValue: 5,
    allowNull: false
  },
  bonusUploadsClaimed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  
  // Status
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'expired'),
    defaultValue: 'pending',
    allowNull: false
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When referred user first uploaded'
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
  tableName: 'referrals',
  indexes: [
    {
      fields: ['referrerId']
    },
    {
      fields: ['referredUserId']
    },
    {
      fields: ['referralCodeUsed']
    },
    {
      fields: ['status']
    },
    {
      unique: true,
      fields: ['referrerId', 'referredUserId']
    }
  ]
});

// Instance methods
Referral.prototype.complete = async function() {
  this.status = 'completed';
  this.completedAt = new Date();
  this.bonusUploadsClaimed = true;
  await this.save();
};

Referral.prototype.expire = async function() {
  this.status = 'expired';
  await this.save();
};

// Class methods
Referral.generateReferralCode = function() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

Referral.findByReferrer = async function(referrerId) {
  return await this.findAll({
    where: { referrerId },
    order: [['createdAt', 'DESC']]
  });
};

Referral.countSuccessfulReferrals = async function(referrerId) {
  return await this.count({
    where: {
      referrerId,
      status: 'completed'
    }
  });
};

module.exports = Referral;