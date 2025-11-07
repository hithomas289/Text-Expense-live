const { DataTypes, Op } = require('sequelize');
const { sequelize } = require('../../config/database');

const GeneratedReport = sequelize.define('GeneratedReport', {
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
  
  // Report parameters
  reportType: {
    type: DataTypes.ENUM('monthly', 'multi_month', 'custom_range', 'category_filter'),
    allowNull: false
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  categoryFilter: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'If filtering by specific category'
  },
  
  // File details
  filename: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  fileUrl: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: 'S3 download URL'
  },
  fileSizeMb: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: true
  },
  
  // Content summary
  totalExpensesIncluded: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  currenciesIncluded: {
    type: DataTypes.ARRAY(DataTypes.STRING(3)),
    allowNull: true,
    comment: 'Array of currency codes'
  },
  
  // Access control
  downloadCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: '7-day expiry'
  },
  lastDownloadedAt: {
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
  tableName: 'generated_reports',
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['reportType']
    },
    {
      fields: ['expiresAt']
    },
    {
      fields: ['createdAt']
    }
  ]
});

// Instance methods
GeneratedReport.prototype.isExpired = function() {
  return new Date() > this.expiresAt;
};

GeneratedReport.prototype.recordDownload = async function() {
  this.downloadCount += 1;
  this.lastDownloadedAt = new Date();
  await this.save();
};

// Class methods
GeneratedReport.createReport = async function(userId, reportParams) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7-day expiry
  
  return await this.create({
    userId,
    reportType: reportParams.reportType,
    startDate: reportParams.startDate,
    endDate: reportParams.endDate,
    categoryFilter: reportParams.categoryFilter,
    filename: reportParams.filename,
    fileUrl: reportParams.fileUrl,
    fileSizeMb: reportParams.fileSizeMb,
    totalExpensesIncluded: reportParams.totalExpensesIncluded,
    totalAmount: reportParams.totalAmount,
    currenciesIncluded: reportParams.currenciesIncluded,
    expiresAt
  });
};

GeneratedReport.cleanupExpiredReports = async function() {
  const expiredReports = await this.findAll({
    where: {
      expiresAt: {
        [Op.lt]: new Date()
      }
    }
  });
  
  // Delete files and database records
  for (const report of expiredReports) {
    // TODO: Delete file from storage (S3/local)
    await report.destroy();
  }
  
  return expiredReports.length;
};

module.exports = GeneratedReport;