const { DataTypes, Op } = require('sequelize');
const { sequelize } = require('../../config/database');

const DocumentUpload = sequelize.define('DocumentUpload', {
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
  expenseId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'expenses',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  
  // Upload details
  whatsappMediaId: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: "WhatsApp's media ID"
  },
  originalFilename: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  fileSizeBytes: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  mimeType: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  
  // Processing pipeline tracking
  ocrStatus: {
    type: DataTypes.ENUM('pending', 'processing', 'success', 'failed'),
    defaultValue: 'pending',
    allowNull: false
  },
  ocrRawText: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Raw OCR output'
  },
  aiProcessingStatus: {
    type: DataTypes.ENUM('pending', 'processing', 'success', 'failed'),
    defaultValue: 'pending',
    allowNull: false
  },
  aiStructuredData: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'GPT-4 structured output'
  },
  
  // Quality metrics
  imageQualityScore: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    validate: {
      min: 0.00,
      max: 1.00
    },
    comment: '0.00 to 1.00'
  },
  confidenceScore: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    validate: {
      min: 0.00,
      max: 1.00
    },
    comment: 'Overall processing confidence'
  },
  
  // Error handling
  errorType: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: "low_quality, ocr_failed, ai_failed, etc."
  },
  errorMessage: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  retryCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  
  uploadedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  processedAt: {
    type: DataTypes.DATE,
    allowNull: true
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
  tableName: 'document_uploads',
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['expenseId']
    },
    {
      fields: ['ocrStatus']
    },
    {
      fields: ['aiProcessingStatus']
    },
    {
      fields: ['uploadedAt']
    },
    {
      unique: true,
      fields: ['whatsappMediaId'],
      where: {
        whatsappMediaId: {
          [Op.ne]: null
        }
      }
    }
  ]
});

// Instance methods
DocumentUpload.prototype.isProcessingComplete = function() {
  return this.ocrStatus === 'success' && this.aiProcessingStatus === 'success';
};

DocumentUpload.prototype.hasFailed = function() {
  return this.ocrStatus === 'failed' || this.aiProcessingStatus === 'failed';
};

DocumentUpload.prototype.canRetry = function() {
  return this.retryCount < 3 && this.hasFailed();
};

DocumentUpload.prototype.markAsProcessing = async function() {
  this.ocrStatus = 'processing';
  this.aiProcessingStatus = 'processing';
  await this.save();
};

DocumentUpload.prototype.markAsCompleted = async function(structuredData) {
  this.ocrStatus = 'success';
  this.aiProcessingStatus = 'success';
  this.aiStructuredData = structuredData;
  this.processedAt = new Date();
  await this.save();
};

DocumentUpload.prototype.markAsFailed = async function(errorType, errorMessage) {
  this.ocrStatus = 'failed';
  this.aiProcessingStatus = 'failed';
  this.errorType = errorType;
  this.errorMessage = errorMessage;
  this.retryCount += 1;
  await this.save();
};

// Class methods
DocumentUpload.findPendingProcessing = async function() {
  return await this.findAll({
    where: {
      ocrStatus: 'pending'
    },
    order: [['createdAt', 'ASC']],
    limit: 10
  });
};

module.exports = DocumentUpload;