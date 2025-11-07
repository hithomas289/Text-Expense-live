const fs = require('fs').promises;
const path = require('path');

class CSVReportService {
  constructor() {
    this.reportsDir = './reports';
    this.ensureReportsDirectory();
  }

  async ensureReportsDirectory() {
    try {
      await fs.access(this.reportsDir);
    } catch (error) {
      await fs.mkdir(this.reportsDir, { recursive: true });
    }
  }

  async generateReceiptReport(receipts, phoneNumber = 'user') {
    try {
      console.log(`Generating CSV report for ${receipts.length} receipts...`);

      const timestamp = new Date().toISOString().slice(0, 16).replace(/[:-]/g, '');
      const filename = `Expense Report.csv`;
      const filePath = path.join(this.reportsDir, filename);

      const csvData = this.prepareCSVData(receipts);
      const csvContent = this.arrayToCSV(csvData);

      await fs.writeFile(filePath, csvContent, 'utf8');
      
      console.log(`CSV report generated: ${filename}`);
      
      // Create public URL for WhatsApp sharing
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? process.env.BASE_URL || 'https://your-domain.com'
        : 'https://web-production-0178dc.up.railway.app'; // Your ngrok URL
      
      const publicUrl = `${baseUrl}/reports/${filename}`;
      
      return {
        success: true,
        filename,
        filePath,
        publicUrl, // Add public URL for WhatsApp
        totalReceipts: receipts.length,
        totalAmount: this.calculateTotalAmount(receipts),
        reportDate: new Date().toISOString()
      };

    } catch (error) {
      console.error('CSV report generation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  prepareCSVData(receipts) {
    const headers = [
      'File URL',
      'File Name', 
      'Category',
      'Invoice/Bill Number',
      'Merchant/Biller',
      'Total Amount',
      'Tax Amount',
      'Date'
    ];

    const rows = receipts.map((receipt, index) => {
      // Handle both database receipt format and legacy format
      const data = receipt.extractedData || receipt;
      
      // Create file URL
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? process.env.BASE_URL || 'https://your-domain.com'
        : 'https://web-production-0178dc.up.railway.app';
      
      const fileUrl = receipt.originalFileUrl || 
                     data.originalFileUrl || 
                     `${baseUrl}/uploads/${receipt.phoneNumber || 'unknown'}/${receipt.fileName || data.originalFilename || 'receipt'}`;
      
      const fileName = receipt.originalFilename || 
                      receipt.fileName || 
                      data.originalFilename || 
                      `receipt_${index + 1}`;
      
      const category = (receipt.category || data.category || 'Other').replace(/_/g, ' ').toUpperCase();
      
      const invoiceNumber = receipt.serialNumber || 
                           receipt.billNumber || 
                           receipt.invoiceNumber ||
                           data.serialNumber || 
                           data.billNumber || 
                           data.invoiceNumber || 
                           data.receiptId || 
                           `RCP-${Date.now()}-${index + 1}`;
      
      const merchant = receipt.merchantName || 
                      data.merchant || 
                      data.merchantName || 
                      'Unknown';
      
      const totalAmount = (receipt.totalAmount || data.totalAmount || 0);
      const formattedTotal = typeof totalAmount === 'number' ? totalAmount.toFixed(2) : '0.00';
      
      const taxAmount = (receipt.tax || data.tax || data.taxAmount || 0);
      const formattedTax = typeof taxAmount === 'number' ? taxAmount.toFixed(2) : '0.00';
      
      const receiptDate = (receipt.receiptDate || receipt.date || data.date || data.receiptDate || 'Not detected');
      const formattedDate = receiptDate instanceof Date ? receiptDate.toISOString().split('T')[0] : receiptDate;
      
      return [
        fileUrl,
        fileName,
        category,
        invoiceNumber,
        merchant,
        formattedTotal,
        formattedTax,
        formattedDate
      ];
    });

    return [headers, ...rows];
  }

  arrayToCSV(data) {
    return data.map(row => 
      row.map(field => {
        // Handle fields that might contain commas or quotes
        const stringField = String(field);
        if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
          return `"${stringField.replace(/"/g, '""')}"`;
        }
        return stringField;
      }).join(',')
    ).join('\n');
  }

  calculateTotalAmount(receipts) {
    return receipts.reduce((total, receipt) => {
      return total + (receipt.extractedData.totalAmount || 0);
    }, 0);
  }

  async generateSummaryReport(receipts, phoneNumber = 'user') {
    try {
      const categoryTotals = {};
      const merchantTotals = {};
      let totalAmount = 0;

      // Group totals by currency
      const currencyTotals = {};

      receipts.forEach(receipt => {
        const data = receipt.extractedData;
        const amount = data.totalAmount || 0;
        const category = data.category || 'other';
        const merchant = data.merchant || 'Unknown';
        const currency = data.currency || receipt.originalCurrency || 'INR';

        totalAmount += amount;
        currencyTotals[currency] = (currencyTotals[currency] || 0) + amount;
        
        categoryTotals[category] = (categoryTotals[category] || 0) + amount;
        merchantTotals[merchant] = (merchantTotals[merchant] || 0) + amount;
      });

      const timestamp = new Date().toISOString().slice(0, 16).replace(/[:-]/g, '');
      const filename = `expense_summary_${phoneNumber}_${timestamp}.csv`;
      const filePath = path.join(this.reportsDir, filename);

      const summaryData = [
        ['EXPENSE SUMMARY'],
        ['Total Receipts', receipts.length],
        ['Total Amount (All Currencies)', totalAmount.toFixed(2)],
        [''],
        ['TOTALS BY CURRENCY'],
        ['Currency', 'Amount']
      ];

      Object.entries(currencyTotals).forEach(([currency, amt]) => {
        summaryData.push([currency, amt.toFixed(2)]);
      });

      summaryData.push(['']);
      summaryData.push(['BY CATEGORY']);
      summaryData.push(['Category', 'Amount', 'Count']);

      Object.entries(categoryTotals)
        .sort(([,a], [,b]) => b - a)
        .forEach(([category, amount]) => {
          const count = receipts.filter(r => (r.extractedData.category || 'other') === category).length;
          summaryData.push([
            category.replace('_', ' ').toUpperCase(),
            amount.toFixed(2),
            count
          ]);
        });

      summaryData.push(['']);
      summaryData.push(['TOP MERCHANTS']);
      summaryData.push(['Merchant', 'Amount', 'Count']);

      Object.entries(merchantTotals)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .forEach(([merchant, amount]) => {
          const count = receipts.filter(r => (r.extractedData.merchant || 'Unknown') === merchant).length;
          summaryData.push([
            merchant,
            amount.toFixed(2),
            count
          ]);
        });

      const csvContent = this.arrayToCSV(summaryData);
      await fs.writeFile(filePath, csvContent, 'utf8');

      return {
        success: true,
        filename,
        filePath,
        totalReceipts: receipts.length,
        totalAmount,
        reportDate: new Date().toISOString()
      };

    } catch (error) {
      console.error('Summary report generation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getReportStats() {
    try {
      const files = await fs.readdir(this.reportsDir);
      const csvFiles = files.filter(file => file.endsWith('.csv'));
      
      return {
        totalReports: csvFiles.length,
        recentReports: csvFiles.slice(-5),
        reportsDirectory: this.reportsDir
      };
    } catch (error) {
      return {
        totalReports: 0,
        recentReports: [],
        reportsDirectory: this.reportsDir
      };
    }
  }

  async cleanupOldReports(daysOld = 30) {
    try {
      const files = await fs.readdir(this.reportsDir);
      const now = new Date();
      let deletedCount = 0;

      for (const file of files) {
        if (file.endsWith('.csv')) {
          const filePath = path.join(this.reportsDir, file);
          const stats = await fs.stat(filePath);
          const ageInDays = (now - stats.mtime) / (1000 * 60 * 60 * 24);

          if (ageInDays > daysOld) {
            await fs.unlink(filePath);
            deletedCount++;
          }
        }
      }

      console.log(`Cleaned up ${deletedCount} old CSV report files`);
      return { deletedCount };
    } catch (error) {
      console.error('Report cleanup failed:', error);
      return { deletedCount: 0, error: error.message };
    }
  }
}

module.exports = CSVReportService;