const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const SavedReceipt = sequelize.define('SavedReceipt', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
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
  category: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Save receipt category (Warranty & Returns, Medical & Insurance, etc.)'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'User-provided description of the receipt'
  },
  originalFilename: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Original filename of uploaded receipt'
  },
  s3Key: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: 'S3 key for the stored receipt file'
  },
  s3Bucket: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'S3 bucket name'
  },
  fileSize: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'File size in bytes'
  },
  mimeType: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'MIME type of the uploaded file'
  },
  downloadUrl: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Pre-signed S3 URL for downloading the receipt'
  },
  uploadDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Date when the receipt was uploaded'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Whether the saved receipt is active (not deleted)'
  },
  planType: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Plan type when receipt was saved (trial/lite/pro)'
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Additional metadata for the saved receipt (e.g., preUpgrade flag)'
  }
}, {
  tableName: 'saved_receipts',
  timestamps: true,
  paranoid: true, // Enables soft delete
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['category']
    },
    {
      fields: ['uploadDate']
    },
    {
      fields: ['userId', 'category']
    },
    {
      fields: ['userId', 'uploadDate']
    }
  ]
});

// Instance methods
SavedReceipt.prototype.toSavedReceiptData = function() {
  return {
    id: this.id,
    category: this.category,
    description: this.description,
    originalFilename: this.originalFilename,
    s3Key: this.s3Key,
    s3Bucket: this.s3Bucket,
    fileSize: this.fileSize,
    mimeType: this.mimeType,
    downloadUrl: this.downloadUrl,
    uploadDate: this.uploadDate,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Static methods
SavedReceipt.getUserSavedReceipts = async function(userId, options = {}) {
  const {
    category = null,
    startDate = null,
    endDate = null,
    limit = null,
    offset = 0
  } = options;

  const whereClause = {
    userId: userId,
    isActive: true
  };

  if (category) {
    whereClause.category = category;
  }

  if (startDate || endDate) {
    whereClause.uploadDate = {};
    if (startDate) {
      whereClause.uploadDate[require('sequelize').Op.gte] = startDate;
    }
    if (endDate) {
      whereClause.uploadDate[require('sequelize').Op.lte] = endDate;
    }
  }

  const queryOptions = {
    where: whereClause,
    order: [['uploadDate', 'DESC']],
    offset: offset
  };

  if (limit) {
    queryOptions.limit = limit;
  }

  return await this.findAll(queryOptions);
};

SavedReceipt.getUserSavedReceiptsCount = async function(userId, category = null) {
  const whereClause = {
    userId: userId,
    isActive: true
  };

  if (category) {
    whereClause.category = category;
  }

  return await this.count({ where: whereClause });
};

SavedReceipt.getUserMonthlySavedReceipts = async function(userId, year, month) {
  const startDate = new Date(year, month - 1, 1); // month is 0-indexed
  const endDate = new Date(year, month, 0, 23, 59, 59); // Last day of month

  return await this.getUserSavedReceipts(userId, {
    startDate: startDate,
    endDate: endDate
  });
};

SavedReceipt.getUserMonthlySavedReceiptsCount = async function(userId, year, month) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  return await this.count({
    where: {
      userId: userId,
      isActive: true,
      uploadDate: {
        [require('sequelize').Op.between]: [startDate, endDate]
      }
    }
  });
};

SavedReceipt.getCategorySummary = async function(userId, options = {}) {
  const {
    startDate = null,
    endDate = null
  } = options;

  const whereClause = {
    userId: userId,
    isActive: true
  };

  if (startDate || endDate) {
    whereClause.uploadDate = {};
    if (startDate) {
      whereClause.uploadDate[require('sequelize').Op.gte] = startDate;
    }
    if (endDate) {
      whereClause.uploadDate[require('sequelize').Op.lte] = endDate;
    }
  }

  return await this.findAll({
    attributes: [
      'category',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    where: whereClause,
    group: ['category'],
    order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']]
  });
};

module.exports = SavedReceipt;