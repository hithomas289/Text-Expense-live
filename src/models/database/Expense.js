const { DataTypes, Op } = require('sequelize');
const { sequelize } = require('../../config/database');

const Expense = sequelize.define('Expense', {
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
  
  // Core expense data
  invoiceNumber: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Serial/invoice number from receipt'
  },
  expenseDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'Date from receipt'
  },
  merchantName: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  billNumber: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Bill/reference number (If applicable)'
  },
  referenceNumber: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Consolidated reference number (replaces invoiceNumber/billNumber)'
  },
  
  // Financial breakdown
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Amount before tax'
  },
  taxAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    allowNull: false
  },
  tipAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    allowNull: false
  },
  miscellaneousAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    allowNull: false,
    comment: 'Service charges, etc.'
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  originalCurrency: {
    type: DataTypes.STRING(3),
    defaultValue: 'INR',
    allowNull: false,
    comment: 'ISO currency code'
  },
  
  // Categorization
  category: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'User-selected category'
  },
  customDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: "User's custom notes/purpose"
  },
  
  // Processing metadata
  ocrConfidenceScore: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    validate: {
      min: 0.00,
      max: 1.00
    },
    comment: '0.00 to 1.00'
  },
  processingTimeSeconds: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: true
  },
  manualCorrections: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Track what user manually corrected'
  },
  
  // Document storage
  originalDocumentUrl: {
    type: DataTypes.STRING(2000),
    allowNull: true,
    comment: 'Original uploaded file'
  },
  compressedDocumentUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Compressed version for storage'
  },
  originalFileSizeMb: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: true
  },
  compressedFileSizeMb: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: true
  },
  fileFormat: {
    type: DataTypes.STRING(10),
    allowNull: true,
    comment: 'jpg, pdf, png, etc.'
  },
  
  // S3 storage fields - CRITICAL for Excel report hyperlinks
  originalFilename: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Original filename from WhatsApp upload'
  },
  s3Key: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'S3 object key for the receipt file'
  },
  s3Bucket: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'S3 bucket name'
  },
  
  // Status tracking
  status: {
    type: DataTypes.ENUM('draft', 'confirmed', 'deleted'),
    defaultValue: 'draft',
    allowNull: false
  },
  planType: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'User plan type when receipt was processed (trial/lite/pro)'
  },
  isDuplicate: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  duplicateOf: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'expenses',
      key: 'id'
    },
    comment: 'If marked as duplicate'
  },
  
  // Legacy fields for backward compatibility with existing code
  receiptDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Legacy field - mapped to expenseDate'
  },
  items: {
    type: DataTypes.JSONB,
    defaultValue: [],
    comment: 'Line items from receipt'
  },
  ocrText: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Raw OCR output'
  },
  aiExtractedData: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Full AI processing result'
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
  tableName: 'expenses',
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['merchantName']
    },
    {
      fields: ['expenseDate']
    },
    {
      fields: ['category']
    },
    {
      fields: ['status']
    },
    {
      fields: ['createdAt']
    },
    {
      fields: ['isDuplicate']
    },
    {
      fields: ['duplicateOf']
    }
  ]
});

// Instance methods
Expense.prototype.getFileUrl = async function() {
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

  // Fallback to stored URLs (might be expired)
  if (this.originalDocumentUrl) {
    return this.originalDocumentUrl;
  }

  if (this.compressedDocumentUrl) {
    return this.compressedDocumentUrl;
  }

  return null;
};

Expense.prototype.toReceiptData = function() {
  // Backward compatibility method for existing code
  return {
    id: this.id,
    merchantName: this.merchantName,
    date: this.expenseDate || this.receiptDate,
    totalAmount: parseFloat(this.totalAmount) || 0,
    subtotal: parseFloat(this.subtotal) || 0,
    tax: parseFloat(this.taxAmount) || 0,
    tip: parseFloat(this.tipAmount) || 0,
    miscellaneous: parseFloat(this.miscellaneousAmount) || 0,
    currency: this.originalCurrency,
    category: this.category,
    items: this.items || [],
    confidenceScore: parseFloat(this.ocrConfidenceScore) || 0,
    createdAt: this.createdAt,
    billNumber: this.billNumber,
    invoiceNumber: this.invoiceNumber,
    referenceNumber: this.referenceNumber,
    customDescription: this.customDescription,
    status: this.status
  };
};

Expense.prototype.updateFromAIExtraction = async function(extractedData) {
  this.merchantName = extractedData.merchantName;
  this.expenseDate = extractedData.date ? new Date(extractedData.date) : null;
  this.receiptDate = this.expenseDate; // Keep legacy field in sync
  this.totalAmount = extractedData.totalAmount;
  this.subtotal = extractedData.subtotal;
  this.taxAmount = extractedData.tax || 0;
  this.tipAmount = extractedData.tip || 0;
  this.miscellaneousAmount = extractedData.miscellaneous || 0;
  this.originalCurrency = extractedData.currency || 'INR';
  this.items = extractedData.items || [];
  this.aiExtractedData = extractedData;
  this.ocrConfidenceScore = extractedData.confidence;
  this.invoiceNumber = extractedData.invoiceNumber;
  this.billNumber = extractedData.billNumber;
  this.referenceNumber = extractedData.referenceNumber || extractedData.invoiceNumber || extractedData.billNumber;
  this.status = 'confirmed';
  
  await this.save();
};

Expense.prototype.markAsConfirmed = async function() {
  this.status = 'confirmed';
  await this.save();
};

Expense.prototype.markAsDuplicate = async function(originalExpenseId) {
  this.isDuplicate = true;
  this.duplicateOf = originalExpenseId;
  this.status = 'deleted';
  await this.save();
};

// Class methods
Expense.findByUserId = async function(userId, options = {}) {
  return await this.findAll({
    where: { 
      userId,
      status: { [Op.ne]: 'deleted' }
    },
    order: [['createdAt', 'DESC']],
    ...options
  });
};

Expense.getExpensesByCategory = async function(userId) {
  const expenses = await this.findByUserId(userId);
  const categories = {};
  
  expenses.forEach(expense => {
    if (expense.category) {
      if (!categories[expense.category]) {
        categories[expense.category] = { count: 0, total: 0 };
      }
      categories[expense.category].count++;
      categories[expense.category].total += parseFloat(expense.totalAmount) || 0;
    }
  });
  
  return categories;
};

Expense.getTotalExpenses = async function(userId) {
  const expenses = await this.findByUserId(userId);
  return expenses.reduce((sum, expense) => sum + (parseFloat(expense.totalAmount) || 0), 0);
};

Expense.findDuplicates = async function(userId, merchantName, totalAmount, expenseDate) {
  return await this.findAll({
    where: {
      userId,
      merchantName,
      totalAmount,
      expenseDate,
      status: { [Op.ne]: 'deleted' }
    }
  });
};

module.exports = Expense;