const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

/*
 * ExpenseV2 Model - Normalized Database Structure
 *
 * This replaces the old Receipt + Expense dual model with a single, clean expense model.
 * All processed expenses from the "Process Expense" flow are stored here.
 */
const ExpenseV2 = sequelize.define('ExpenseV2', {
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

  // Receipt data
  invoiceNumber: {
    type: DataTypes.STRING(100),
    comment: 'Invoice/serial number from receipt'
  },
  billNumber: {
    type: DataTypes.STRING(100),
    comment: 'Bill/reference number'
  },
  referenceNumber: {
    type: DataTypes.STRING(255),
    comment: 'Consolidated reference number (replaces invoiceNumber/billNumber)'
  },
  expenseDate: {
    type: DataTypes.STRING(50),  // Changed from DATEONLY to STRING to support partial dates like "Oct 19", "Oct 2023"
    allowNull: false,
    comment: 'Date from receipt (not upload date) - can be full date (YYYY-MM-DD) or partial (Oct 19, Oct 2023)'
  },
  merchantName: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: 'Merchant/vendor name'
  },

  // Financial breakdown
  subtotal: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Amount before tax'
  },
  taxAmount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
    comment: 'Tax amount'
  },
  miscellaneousAmount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
    comment: 'Service charges, misc fees'
  },
  totalAmount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    comment: 'Total amount including all fees'
  },
  originalCurrency: {
    type: DataTypes.STRING(3),
    defaultValue: 'INR',
    comment: 'ISO currency code'
  },

  // Categorization
  category: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'User-selected expense category'
  },
  customDescription: {
    type: DataTypes.TEXT,
    comment: 'User-added notes/description'
  },

  // File storage (S3)
  originalFilename: {
    type: DataTypes.STRING(255),
    comment: 'Original filename from WhatsApp upload'
  },
  s3Key: {
    type: DataTypes.STRING(500),
    comment: 'S3 object key for the receipt file'
  },
  s3Bucket: {
    type: DataTypes.STRING(100),
    comment: 'S3 bucket name'
  },
  originalDocumentUrl: {
    type: DataTypes.STRING(500),
    comment: 'S3 URL for original document'
  },
  fileFormat: {
    type: DataTypes.STRING(10),
    comment: 'MIME type of file'
  },
  originalFileSizeMb: {
    type: DataTypes.DECIMAL,
    comment: 'File size in bytes'
  },
  compressedDocumentUrl: {
    type: DataTypes.STRING(500),
    comment: 'S3 bucket name'
  },
  compressedFileSizeMb: {
    type: DataTypes.DECIMAL,
    comment: 'S3 object key'
  },

  // Processing metadata
  ocrConfidenceScore: {
    type: DataTypes.DECIMAL,
    comment: 'OCR confidence score (0.000-1.000)'
  },
  processingTimeSeconds: {
    type: DataTypes.DECIMAL,
    comment: 'Processing time in seconds'
  },
  manualCorrections: {
    type: DataTypes.JSONB,
    comment: 'User corrections to OCR data'
  },
  items: {
    type: DataTypes.JSONB,
    defaultValue: [],
    comment: 'Itemized line items'
  },
  ocrText: {
    type: DataTypes.TEXT,
    comment: 'Raw OCR extracted text'
  },
  aiExtractedData: {
    type: DataTypes.JSONB,
    comment: 'AI structured data'
  },
  receiptDate: {
    type: DataTypes.DATE,
    comment: 'Receipt timestamp'
  },

  // Status tracking
  status: {
    type: DataTypes.ENUM('draft'),
    defaultValue: 'draft',
    comment: 'All expenses in this table are confirmed'
  },
  isDuplicate: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Marked as duplicate expense'
  },
  duplicateOf: {
    type: DataTypes.UUID,
    references: {
      model: 'expenses',
      key: 'id'
    },
    comment: 'Reference to original expense if duplicate'
  },

  // Plan tracking
  planType: {
    type: DataTypes.STRING(20),
    comment: 'User plan type when expense was created (trial/lite/pro)'
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Additional metadata for the expense (e.g., preUpgrade flag)'
  },

  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'expenses',
  underscored: false,
  timestamps: true,
  indexes: [
    {
      name: 'idx_expenses_user_date',
      fields: ['userId', 'expenseDate']
    },
    {
      name: 'idx_expenses_category',
      fields: ['category']
    },
    {
      name: 'idx_expenses_merchant',
      fields: ['merchantName']
    }
  ]
});

// Instance methods
ExpenseV2.prototype.getFileUrl = async function() {
  // If we have S3 key, generate fresh pre-signed URL
  if (this.s3Key && this.s3Bucket) {
    try {
      const S3Service = require('../../services/S3Service');
      const s3Service = new S3Service();
      return await s3Service.generateExcelReportUrl(this.s3Key, this.originalFilename || 'receipt.jpg');
    } catch (error) {
      console.error('Failed to generate pre-signed URL for expense:', error);
    }
  }

  // BACKWARD COMPATIBILITY: Extract s3Key from existing originalDocumentUrl for old records
  if (this.originalDocumentUrl && !this.s3Key) {
    try {
      const S3Service = require('../../services/S3Service');
      const s3Service = new S3Service();

      // Extract S3 key from URL
      const s3Key = this.extractS3KeyFromUrl(this.originalDocumentUrl);

      if (s3Key) {
        // Generate fresh pre-signed URL
        return await s3Service.generateExcelReportUrl(s3Key, this.originalFilename || 'receipt.jpg');
      }
    } catch (error) {
      console.error('Failed to extract S3 key or generate URL:', error);
    }
  }

  // Fallback to stored URLs (might be expired)
  if (this.originalDocumentUrl) {
    return this.originalDocumentUrl;
  }

  if (this.compressedDocumentUrl) {
    return this.compressedDocumentUrl;
  }

  return null;
};

// Helper method to extract S3 key from S3 URL
ExpenseV2.prototype.extractS3KeyFromUrl = function(url) {
  if (!url) return null;

  try {
    // Match patterns like:
    // https://textexpense.s3.amazonaws.com/receipts/user123/file.jpg
    // https://textexpense.s3.us-east-1.amazonaws.com/receipts/user123/file.jpg
    // https://d1234.cloudfront.net/receipts/user123/file.jpg

    const patterns = [
      /amazonaws\.com\/(.+)$/,  // S3 URLs
      /cloudfront\.net\/(.+)$/  // CloudFront URLs
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return decodeURIComponent(match[1]);
      }
    }

    return null;
  } catch (error) {
    console.error('Error extracting S3 key from URL:', error);
    return null;
  }
};

ExpenseV2.prototype.isStoredInS3 = function() {
  return !!(this.originalDocumentUrl || this.compressedDocumentUrl);
};

ExpenseV2.prototype.toExcelData = function() {
  return {
    id: this.id,
    merchantName: this.merchantName,
    expenseDate: this.expenseDate,
    totalAmount: this.totalAmount,
    taxAmount: this.taxAmount,
    miscellaneousAmount: this.miscellaneousAmount,
    subtotal: this.subtotal,
    category: this.category,
    originalCurrency: this.originalCurrency,
    invoiceNumber: this.invoiceNumber,
    billNumber: this.billNumber,
    referenceNumber: this.referenceNumber,
    originalDocumentUrl: this.originalDocumentUrl,
    fileFormat: this.fileFormat,
    originalFileSizeMb: this.originalFileSizeMb,
    compressedDocumentUrl: this.compressedDocumentUrl,
    ocrConfidenceScore: this.ocrConfidenceScore,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Class methods
ExpenseV2.getUserExpenses = async function(userId, options = {}) {
  const whereClause = { userId };

  // Date range filter
  if (options.startDate && options.endDate) {
    whereClause.expenseDate = {
      [require('sequelize').Op.between]: [options.startDate, options.endDate]
    };
  }

  // Category filter
  if (options.categories && options.categories.length > 0) {
    whereClause.category = {
      [require('sequelize').Op.in]: options.categories
    };
  }

  return await this.findAll({
    where: whereClause,
    order: [['expenseDate', 'DESC'], ['createdAt', 'DESC']]
  });
};

ExpenseV2.getUserExpenseStats = async function(userId) {
  const { Op, fn, col } = require('sequelize');

  const stats = await this.findAll({
    where: { userId },
    attributes: [
      'category',
      [fn('COUNT', col('id')), 'count'],
      [fn('SUM', col('totalAmount')), 'total'],
      [fn('AVG', col('totalAmount')), 'average'],
      [fn('SUM', col('taxAmount')), 'totalTax']
    ],
    group: ['category'],
    order: [[fn('SUM', col('totalAmount')), 'DESC']]
  });

  return stats;
};

module.exports = ExpenseV2;