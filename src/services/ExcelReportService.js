const XLSX = require('xlsx-js-style');
const fs = require('fs').promises;
const path = require('path');
const CurrencyService = require('./CurrencyService');

class ExcelReportService {
  constructor() {
    // Use absolute path based on current working directory
    // This works in both development and production (Railway)
    this.reportsDir = path.join(process.cwd(), 'reports');
    console.log(`📊 ExcelReportService using reports directory: ${this.reportsDir}`);
    console.log(`📂 Current working directory: ${process.cwd()}`);
    console.log(`🔧 NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
    this.currencyService = new CurrencyService();
    this.ensureReportsDirectory();
  }

  async ensureReportsDirectory() {
    try {
      await fs.access(this.reportsDir);
    } catch (error) {
      await fs.mkdir(this.reportsDir, { recursive: true });
    }
  }

  // Transform session receipt data to expected format for Excel generation
  async transformReceiptData(receipts, phoneNumber) {
    // Get user's currency for formatting
    const userCurrency = await this.currencyService.getUserDefaultCurrency(phoneNumber);
    
    
    return receipts.map((receipt, index) => {
      // Always transform receipts to ensure consistent format, regardless of source
      // Database receipts and session receipts may have different field structures

      // Handle Sequelize models - access dataValues if available
      const receiptData = receipt.dataValues || receipt;
      const existingExtractedData = receiptData.aiExtractedData || receiptData.extractedData;

      
      return {
        // Include original ID for tracking
        id: receiptData.id,
        // Primary data in extractedData (what ExcelReportService expects)
        extractedData: {
          merchantName: receiptData.merchantName || existingExtractedData?.merchantName,
          merchant: receiptData.merchantName || existingExtractedData?.merchant, // ExcelReportService uses both
          totalAmount: receiptData.totalAmount || existingExtractedData?.totalAmount,
          subtotal: receiptData.subtotal || existingExtractedData?.subtotal || 0,
          taxAmount: receiptData.taxAmount || receiptData.tax || existingExtractedData?.taxAmount,
          tax: receiptData.taxAmount || receiptData.tax || existingExtractedData?.tax, // ExcelReportService also checks for 'tax'
          date: receiptData.expenseDate || receiptData.receiptDate || receiptData.date || existingExtractedData?.date,
          category: receiptData.category || existingExtractedData?.category,
          currency: receiptData.currency || userCurrency.currency,
          items: receiptData.items || existingExtractedData?.items || [],
          originalFilename: receiptData.originalFilename || `receipt_${receiptData.id || Date.now()}.jpg`,
          // Invoice numbers from database fields
          invoiceNumber: receiptData.invoiceNumber || existingExtractedData?.invoiceNumber,
          billNumber: receiptData.billNumber || existingExtractedData?.billNumber,
          serialNumber: receiptData.serialNumber || existingExtractedData?.serialNumber,
          // Additional amounts - check all possible field names
          miscAmount: receiptData.miscellaneousAmount || receiptData.miscellaneous || existingExtractedData?.miscAmount || 0,
          // S3 data from existing extracted data or metadata
          s3Data: existingExtractedData?.s3Data || receiptData.metadata?.s3Data
        },
        // Fallback properties at root level (ExcelReportService has fallbacks)
        merchantName: receiptData.merchantName || existingExtractedData?.merchantName,
        totalAmount: receiptData.totalAmount || existingExtractedData?.totalAmount,
        subtotal: receiptData.subtotal || existingExtractedData?.subtotal || 0,
        taxAmount: receiptData.taxAmount || receiptData.tax || existingExtractedData?.taxAmount,
        tax: receiptData.taxAmount || receiptData.tax || existingExtractedData?.tax,
        expenseDate: receiptData.expenseDate, // Add expenseDate directly for easy access
        date: receiptData.expenseDate || receiptData.receiptDate || receiptData.date || existingExtractedData?.date,
        // FIX: Preserve originalCurrency from database, fallback to extracted currency
        originalCurrency: receiptData.originalCurrency || userCurrency.currency,
        category: receiptData.category || existingExtractedData?.category,
        currency: receiptData.currency || userCurrency.currency,
        receiptDate: receiptData.expenseDate || receiptData.receiptDate || receiptData.date || existingExtractedData?.date,
        serialNumber: receiptData.serialNumber || existingExtractedData?.serialNumber || null,
        billNumber: receiptData.billNumber || existingExtractedData?.billNumber || null,
        invoiceNumber: receiptData.invoiceNumber || existingExtractedData?.invoiceNumber || null,
        miscellaneous: receiptData.miscellaneousAmount || receiptData.miscellaneous || existingExtractedData?.miscAmount || 0,
        // File information - extract original filename from various sources
        originalFilename: this.extractOriginalFilename(receiptData, existingExtractedData),
        originalFileUrl: receiptData.originalFileUrl,
        fileType: receiptData.fileType,
        fileSize: receiptData.fileSize,
        phoneNumber: phoneNumber,
        fileName: this.extractOriginalFilename(receiptData, existingExtractedData) || `receipt_${receiptData.id || Date.now()}.jpg`,
        // CRITICAL: Preserve S3 data from original receipt for hyperlink generation
        s3Key: receiptData.s3Key,
        s3Bucket: receiptData.s3Bucket,
        originalDocumentUrl: receiptData.originalDocumentUrl,
        compressedDocumentUrl: receiptData.compressedDocumentUrl,
        // Preserve the original Sequelize model instance methods
        getFileUrl: receipt.getFileUrl && typeof receipt.getFileUrl === 'function' ? receipt.getFileUrl.bind(receipt) : null,
        metadata: {
          confidence: receiptData.ocrConfidence || receiptData.confidenceScore || 0.9,
          s3Data: receiptData.metadata?.s3Data
        },
        createdAt: receiptData.createdAt || new Date()
      };
    });
  }

  async generateReceiptReport(receipts, phoneNumber = 'user', dateFilter = null) {
    try {

      // Get user's default currency
      const userCurrency = await this.currencyService.getUserDefaultCurrency(phoneNumber);

      // Transform receipts to expected format if they come from session data
      const transformedReceipts = await this.transformReceiptData(receipts, phoneNumber);

      const workbook = XLSX.utils.book_new();

      // Get saved receipts data for vault analysis (filtered by dateFilter period)
      const vaultData = await this.prepareReceiptVaultData(phoneNumber, dateFilter);

      // 1. Summary Sheet - Overview of processed expenses and receipt vault
      const summaryData = this.prepareEnhancedSummary(transformedReceipts, vaultData);
      const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Summary');
      this.formatWorksheet(summaryWorksheet);
      this.addFooterMessages(summaryWorksheet);

      // 2. Create monthly sheets for processed expenses by month
      const processedByMonth = this.groupReceiptsByMonth(transformedReceipts);
      for (const [monthYear, monthReceipts] of Object.entries(processedByMonth)) {
        const monthlyData = await this.prepareMonthlyDetailsData(monthReceipts);
        const monthlyWorksheet = XLSX.utils.json_to_sheet(monthlyData);
        const shortMonth = this.getShortMonthName(monthYear);
        XLSX.utils.book_append_sheet(workbook, monthlyWorksheet, `${shortMonth} (Processed)`);
        this.formatWorksheet(monthlyWorksheet);
        this.addFooterMessages(monthlyWorksheet);
      }

      // 3. Create monthly sheets for saved vault by month
      console.log(`🔍 VAULT SHEETS DEBUG: Processing ${vaultData.length} vault items`);
      const vaultByMonth = this.groupVaultDataByMonth(vaultData);
      console.log(`📁 Vault groups by month:`, Object.keys(vaultByMonth));

      Object.entries(vaultByMonth).forEach(([monthYear, monthFiles]) => {
        console.log(`📊 Creating sheet for ${monthYear}: ${monthFiles.length} files`);
        const monthlyWorksheet = XLSX.utils.json_to_sheet(monthFiles);
        const shortMonth = this.getShortMonthName(monthYear);
        const sheetName = `${shortMonth} (Saved)`;
        console.log(`📋 Adding sheet: ${sheetName}`);
        XLSX.utils.book_append_sheet(workbook, monthlyWorksheet, sheetName);
        this.formatWorksheet(monthlyWorksheet);
        this.addFooterMessages(monthlyWorksheet);
      });

      // 4. Category Breakdown (Processed) - Categories from processed receipts
      // COMMENTED OUT: Categories sheets removed from report
      // const processedCategoryData = this.prepareProcessedCategoryBreakdown(transformedReceipts);
      // const processedCategoryWorksheet = XLSX.utils.json_to_sheet(processedCategoryData);
      // XLSX.utils.book_append_sheet(workbook, processedCategoryWorksheet, 'Categories (Processed)');
      // this.formatWorksheet(processedCategoryWorksheet);

      // 5. Category Breakdown (Saved Vault) - Categories from saved files
      // COMMENTED OUT: Categories sheets removed from report
      // const vaultCategoryData = this.prepareVaultCategoryBreakdown(vaultData);
      // const vaultCategoryWorksheet = XLSX.utils.json_to_sheet(vaultCategoryData);
      // XLSX.utils.book_append_sheet(workbook, vaultCategoryWorksheet, 'Categories (Saved)');
      // this.formatWorksheet(vaultCategoryWorksheet);

      const timestamp = new Date().toISOString().slice(0, 16).replace(/[:-]/g, '');
      const filename = `Expense Report (${timestamp}).xlsx`;
      const filePath = path.join(this.reportsDir, filename);

      console.log(`📝 Writing Excel file to: ${filePath}`);
      XLSX.writeFile(workbook, filePath, {
        cellStyles: true,
        bookSST: true  // Enable shared string table for better compatibility
      });

      // Verify file was created
      try {
        const stats = await fs.stat(filePath);
        console.log(`✅ Excel file written successfully: ${filePath} (${stats.size} bytes)`);
      } catch (statError) {
        console.error(`❌ Failed to verify file creation: ${filePath}`, statError);
        throw new Error(`File creation verification failed: ${statError.message}`);
      }

      // Create public URL for WhatsApp sharing
      const baseUrl = process.env.BASE_URL ||
                      'https://web-production-0178dc.up.railway.app';

      // Encode filename to handle spaces and special characters
      const encodedFilename = encodeURIComponent(filename);
      const publicUrl = `${baseUrl}/reports/${encodedFilename}`;

      console.log(`🔗 Public URL created: ${publicUrl}`);
      
      
      // Calculate currency totals for better reporting
      const currencyTotals = this.calculateCurrencyTotals(transformedReceipts);

      // Debug currency calculation
      console.log('🔍 CURRENCY TOTALS DEBUG:', {
        currencyTotals,
        receiptsCount: transformedReceipts.length,
        sampleReceipt: transformedReceipts[0] ? {
          id: transformedReceipts[0].id,
          originalCurrency: transformedReceipts[0].originalCurrency,
          totalAmount: transformedReceipts[0].totalAmount
        } : null
      });

      // Debug the values being returned
      console.log('🔍 ExcelReportService returning:', {
        totalReceipts: transformedReceipts.length,
        totalSavedReceipts: vaultData.length,
        vaultDataSample: vaultData.slice(0, 2).map(item => ({
          uploadDate: item?.['Upload Date'],
          category: item?.['Category'],
          description: item?.['Description'],
          hasReceiptURL: !!item?.['Receipt URL']
        })),
        filename
      });

      // DEBUGGING: Explicit vault count check
      const vaultCount = Array.isArray(vaultData) ? vaultData.length : 0;
      console.log(`📁 VAULT COUNT DEBUG: ${vaultCount} (type: ${typeof vaultData})`);

      return {
        success: true,
        filename,
        filePath,
        publicUrl, // Add public URL for WhatsApp
        totalReceipts: transformedReceipts.length,
        totalSavedReceipts: vaultCount, // FIX: Use explicit count to avoid undefined issues
        totalAmount: this.calculateTotalAmount(transformedReceipts),
        currencyTotals, // Add currency breakdown
        reportDate: new Date().toISOString()
      };

    } catch (error) {
      console.error('Excel report generation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }


  async prepareDetailedData(receipts) {
    const detailedData = [];
    
    for (const [index, receipt] of receipts.entries()) {
      // Handle both database receipt format and legacy format
      const data = receipt.extractedData || receipt;
      
      // Generate iOS-compatible proxy URL for the receipt file
      let fileUrl = 'No File Available';

      try {
        const S3Service = require('./S3Service');
        const s3Service = new S3Service();

        // Get S3 key from various sources
        let s3Key = null;

        if (receipt.s3Key) {
          s3Key = receipt.s3Key;
          console.log('🔗 Using s3Key from database');
        } else if (receipt.metadata?.s3Data?.s3Key) {
          s3Key = receipt.metadata.s3Data.s3Key;
          console.log('🔗 Using s3Key from metadata');
        } else if (data.s3Data?.s3Key || data.s3Data?.key) {
          s3Key = data.s3Data.s3Key || data.s3Data.key;
          console.log('🔗 Using s3Key from extractedData');
        }

        // Generate iOS-compatible proxy URL
        if (s3Key) {
          fileUrl = s3Service.generateProxyUrl(s3Key);
          console.log('✅ Generated iOS-compatible proxy URL for Excel hyperlink');
        } else {
          console.log('⚠️ No S3 key found, using fallback');
          fileUrl = `Receipt ID: ${receipt.id}`;
        }
      } catch (error) {
        console.error('Error generating proxy URL:', error);
        fileUrl = `Receipt ID: ${receipt.id}`;
      }
      
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
      
      const currency = receipt.originalCurrency || data.currency || 'INR';
      const currencySymbol = this.currencyService.getCurrencySymbol(currency);

      const totalAmount = parseFloat(receipt.totalAmount || data.totalAmount || 0);
      const formattedTotal = isNaN(totalAmount) ? `${currencySymbol}0.00` : `${currencySymbol}${totalAmount.toFixed(2)}`;

      const taxAmount = parseFloat(receipt.taxAmount || data.taxAmount || receipt.tax || data.tax || 0);
      const formattedTax = isNaN(taxAmount) ? `${currencySymbol}0.00` : `${currencySymbol}${taxAmount.toFixed(2)}`;

      const receiptDate = (receipt.expenseDate || data.date || data.receiptDate || receipt.receiptDate || receipt.date || 'Not detected');
      const formattedDate = receiptDate instanceof Date ? receiptDate.toISOString().split('T')[0] : receiptDate;

      const miscellaneousAmount = parseFloat(receipt.miscellaneous || data.miscellaneous || 0);
      const formattedMiscellaneous = isNaN(miscellaneousAmount) ? `${currencySymbol}0.00` : `${currencySymbol}${miscellaneousAmount.toFixed(2)}`;
      
      detailedData.push({
        'File URL': fileUrl,
        'File Name': fileName,
        'Category': category,
        'Invoice/Bill Number': invoiceNumber,
        'Merchant/Biller': merchant,
        'Total Amount': formattedTotal,
        'Tax Amount': formattedTax,
        'Miscellaneous': formattedMiscellaneous,
        'Date': formattedDate
      });
    }
    
    return detailedData;
  }

  formatWorksheets(summaryWs, detailedWs) {
    const summaryRange = XLSX.utils.decode_range(summaryWs['!ref']);
    const detailedRange = XLSX.utils.decode_range(detailedWs['!ref']);

    summaryWs['!cols'] = [
      { width: 25 },
      { width: 15 },
      { width: 10 }
    ];

    detailedWs['!cols'] = [
      { width: 40 },  // File URL
      { width: 25 },  // File Name
      { width: 15 },  // Category
      { width: 20 },  // Invoice/Bill Number
      { width: 25 },  // Merchant/Biller
      { width: 12 },  // Total Amount
      { width: 12 },  // Tax Amount
      { width: 12 },  // Miscellaneous
      { width: 12 }   // Date
    ];
  }

  calculateTotalAmount(receipts) {
    return receipts.reduce((total, receipt) => {
      const amount = parseFloat(receipt.extractedData.totalAmount || 0);
      return total + (isNaN(amount) ? 0 : amount);
    }, 0);
  }

  async getReportStats() {
    try {
      const files = await fs.readdir(this.reportsDir);
      const xlsxFiles = files.filter(file => file.endsWith('.xlsx'));
      
      return {
        totalReports: xlsxFiles.length,
        recentReports: xlsxFiles.slice(-5),
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
        if (file.endsWith('.xlsx')) {
          const filePath = path.join(this.reportsDir, file);
          const stats = await fs.stat(filePath);
          const ageInDays = (now - stats.mtime) / (1000 * 60 * 60 * 24);

          if (ageInDays > daysOld) {
            await fs.unlink(filePath);
            deletedCount++;
          }
        }
      }

      return { deletedCount };
    } catch (error) {
      console.error('Report cleanup failed:', error);
      return { deletedCount: 0, error: error.message };
    }
  }
  // Group receipts by month-year (based on UPLOAD date to TextExpense, not invoice date)
  groupReceiptsByMonth(receipts) {
    const receiptsByMonth = {};
    
    receipts.forEach(receipt => {
      // Use upload date (createdAt) for grouping, NOT invoice date
      const uploadDate = new Date(receipt.createdAt || receipt.updatedAt || new Date());
      const monthYear = uploadDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      
      if (!receiptsByMonth[monthYear]) {
        receiptsByMonth[monthYear] = [];
      }
      receiptsByMonth[monthYear].push(receipt);
    });
    
    return receiptsByMonth;
  }

  // Calculate currency totals for multi-currency support
  calculateCurrencyTotals(receipts) {
    const currencyGroups = {};

    if (!receipts || receipts.length === 0) {
      // Default to INR instead of USD for Indian users
      return { INR: { total: 0, count: 0, symbol: '₹', tax: 0 } };
    }

    receipts.forEach(receipt => {
      const data = receipt.extractedData || receipt;

      // FIX: Prioritize originalCurrency (database field) over currency (which doesn't exist in expenses table)
      // Priority: originalCurrency (DB) > extractedData.currency (AI/OCR) > fallback to INR
      let currency = receipt.originalCurrency || data.currency || 'INR';

      // Debug currency detection
      console.log('🔍 Currency detection for receipt:', {
        id: receipt.id,
        dataCurrency: data.currency,
        originalCurrency: receipt.originalCurrency, // This is the correct field from DB
        finalCurrency: currency
      });

      // Currency should now be correctly read from originalCurrency field

      const amount = parseFloat(data.totalAmount || receipt.totalAmount || 0);
      const tax = parseFloat(data.taxAmount || receipt.taxAmount || data.tax || receipt.tax || 0);


      if (!currencyGroups[currency]) {
        // Get proper currency symbol
        const symbol = this.currencyService.getCurrencySymbol(currency);
        currencyGroups[currency] = {
          total: 0,
          count: 0,
          symbol: symbol,
          tax: 0
        };
      }

      currencyGroups[currency].total += (isNaN(amount) ? 0 : amount);
      currencyGroups[currency].tax += (isNaN(tax) ? 0 : tax);
      currencyGroups[currency].count += 1;
    });

    return currencyGroups;
  }

  // New method: 1. Summary Sheet - Overview of processed expenses only
  prepareProcessedExpensesSummary(receipts) {
    if (receipts.length === 0) {
      return [{ Metric: 'No Processed Receipts', Value: 'Upload receipts to see summary' }];
    }

    const receiptsByMonth = this.groupReceiptsByMonth(receipts);
    const overallCurrencyTotals = this.calculateCurrencyTotals(receipts);

    // Get all unique currencies used
    const allCurrencies = Object.keys(overallCurrencyTotals);

    const summaryData = [];

    // Add monthly breakdown with separate columns for each currency
    Object.entries(receiptsByMonth).forEach(([monthYear, monthReceipts]) => {
      const monthlyCurrencyTotals = this.calculateCurrencyTotals(monthReceipts);

      const row = {
        'Month': monthYear,
        'Receipts': monthReceipts.length
      };

      // Add a column for each currency that actually exists
      allCurrencies.forEach(currency => {
        const totals = monthlyCurrencyTotals[currency];
        if (totals && totals.count > 0) {
          row[`Total (${currency})`] = `${totals.symbol}${totals.total.toFixed(2)}`;
        } else {
          row[`Total (${currency})`] = '';
        }
      });

      summaryData.push(row);
    });

    // Add overall totals row
    const overallRow = {
      'Month': 'OVERALL TOTALS',
      'Receipts': receipts.length
    };

    allCurrencies.forEach(currency => {
      const totals = overallCurrencyTotals[currency];
      if (totals && totals.count > 0) {
        overallRow[`Total (${currency})`] = `${totals.symbol}${totals.total.toFixed(2)}`;
      } else {
        overallRow[`Total (${currency})`] = '';
      }
    });

    summaryData.push(overallRow);

    return summaryData;
  }

  // Enhanced Summary Sheet - Shows both Processed Expenses and Receipt Vault counts
  prepareEnhancedSummary(receipts, vaultData) {
    const receiptsByMonth = this.groupReceiptsByMonth(receipts);
    const vaultByMonth = this.groupVaultDataByMonth(vaultData);
    const overallCurrencyTotals = this.calculateCurrencyTotals(receipts);

    // Get all unique currencies used
    const allCurrencies = Object.keys(overallCurrencyTotals);

    // Get all months from both data sources
    const allMonths = new Set([
      ...Object.keys(receiptsByMonth),
      ...Object.keys(vaultByMonth)
    ]);

    const summaryData = [];

    // Add monthly breakdown
    Array.from(allMonths).sort().forEach(monthYear => {
      const monthReceipts = receiptsByMonth[monthYear] || [];
      const monthVault = vaultByMonth[monthYear] || [];
      const monthlyCurrencyTotals = this.calculateCurrencyTotals(monthReceipts);

      const row = {
        'Month': monthYear,
        'Processed Expenses': monthReceipts.length,
        'Receipt Vault': monthVault.length
      };

      // Add currency columns
      allCurrencies.forEach(currency => {
        const totals = monthlyCurrencyTotals[currency];
        if (totals && totals.count > 0) {
          row[`Total (${currency})`] = `${totals.symbol}${totals.total.toFixed(2)}`;
        } else {
          row[`Total (${currency})`] = '';
        }
      });

      summaryData.push(row);
    });

    // Add overall totals row
    const overallRow = {
      'Month': 'OVERALL TOTALS',
      'Processed Expenses': receipts.length,
      'Receipt Vault': vaultData.length
    };

    allCurrencies.forEach(currency => {
      const totals = overallCurrencyTotals[currency];
      if (totals && totals.count > 0) {
        overallRow[`Total (${currency})`] = `${totals.symbol}${totals.total.toFixed(2)}`;
      } else {
        overallRow[`Total (${currency})`] = '';
      }
    });

    summaryData.push(overallRow);

    return summaryData;
  }

  // New method: 2. Monthly Expenses (Processed) - Month-by-month processed receipts
  prepareProcessedMonthlyData(receipts) {
    const monthlyData = [];
    const receiptsByMonth = this.groupReceiptsByMonth(receipts);

    Object.entries(receiptsByMonth).forEach(([monthYear, monthReceipts]) => {
      monthReceipts.forEach(receipt => {
        const data = receipt.extractedData || receipt;
        monthlyData.push({
          Month: monthYear,
          'Date of Invoice': this.formatDate(receipt.expenseDate || data.date || receipt.createdAt),
          Merchant: data.merchantName || data.merchant || 'Unknown',
          Amount: this.formatCurrency(data.totalAmount, data.currency || 'USD'),
          Tax: this.formatCurrency(data.taxAmount || data.tax || 0, data.currency || 'USD'),
          Category: data.category || 'Uncategorized'
        });
      });
    });

    return monthlyData;
  }

  // New method: 3. Monthly Expenses (Saved Vault) - Month-by-month saved files
  prepareVaultMonthlyData(vaultData) {
    const monthlyData = [];

    vaultData.forEach(item => {
      const uploadDate = new Date(item['Upload Date']);
      const monthYear = uploadDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

      monthlyData.push({
        Month: monthYear,
        'Upload Date': item['Upload Date'],
        Category: item.Category,
        Description: item.Description,
        'Download Receipt': item['Download Receipt']
      });
    });

    return monthlyData;
  }

  // New method: 4. Category Breakdown (Processed) - Categories from processed receipts
  prepareProcessedCategoryBreakdown(receipts) {
    const categoryTotals = {};

    receipts.forEach(receipt => {
      const data = receipt.extractedData || receipt;
      const category = data.category || 'Uncategorized';
      const amount = parseFloat(data.totalAmount) || 0;
      const currency = data.currency || 'USD';

      if (!categoryTotals[category]) {
        categoryTotals[category] = { count: 0, currencies: {} };
      }

      categoryTotals[category].count++;
      if (!categoryTotals[category].currencies[currency]) {
        categoryTotals[category].currencies[currency] = 0;
      }
      categoryTotals[category].currencies[currency] += amount;
    });

    const categoryData = [];
    Object.entries(categoryTotals).forEach(([category, data]) => {
      Object.entries(data.currencies).forEach(([currency, total]) => {
        categoryData.push({
          Category: category,
          'Receipt Count': data.count,
          Currency: currency,
          'Total Amount': this.formatCurrency(total, currency)
        });
      });
    });

    return categoryData;
  }

  // New method: 5. Category Breakdown (Saved Vault) - Categories from saved files
  prepareVaultCategoryBreakdown(vaultData) {
    const categoryTotals = {};

    vaultData.forEach(item => {
      const category = item.Category || 'Uncategorized';

      if (!categoryTotals[category]) {
        categoryTotals[category] = { count: 0 };
      }

      categoryTotals[category].count++;
    });

    const categoryData = [];
    Object.entries(categoryTotals).forEach(([category, data]) => {
      categoryData.push({
        Category: category,
        'File Count': data.count
      });
    });

    return categoryData;
  }

  // Helper method to get date range
  getDateRange(receipts) {
    if (receipts.length === 0) return 'No receipts';

    const dates = receipts.map(r => {
      const data = r.extractedData || r;
      return new Date(data.date || r.createdAt);
    }).filter(d => !isNaN(d));

    if (dates.length === 0) return 'No valid dates';

    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));

    return `${this.formatDate(minDate)} to ${this.formatDate(maxDate)}`;
  }

  // Prepare monthly summary data (Sheet 1) with multi-currency support - separate columns per currency
  prepareMonthlySummaryData(receipts) {
    const receiptsByMonth = this.groupReceiptsByMonth(receipts);
    const overallCurrencyTotals = this.calculateCurrencyTotals(receipts);

    // Get all unique currencies used
    const allCurrencies = Object.keys(overallCurrencyTotals);

    const summaryData = [];

    // Add monthly breakdown with separate columns for each currency
    Object.entries(receiptsByMonth).forEach(([monthYear, monthReceipts]) => {
      const monthlyCurrencyTotals = this.calculateCurrencyTotals(monthReceipts);

      const row = {
        'Month': monthYear,
        'Receipts': monthReceipts.length
      };

      // Add a column for each currency
      allCurrencies.forEach(currency => {
        const totals = monthlyCurrencyTotals[currency];
        if (totals && totals.count > 0) {
          row[`Total (${currency})`] = `${totals.symbol}${totals.total.toFixed(2)}`;
        } else {
          row[`Total (${currency})`] = '';
        }
      });

      summaryData.push(row);
    });

    // Add separator
    const separatorRow = { 'Month': '', 'Receipts': '' };
    allCurrencies.forEach(currency => {
      separatorRow[`Total (${currency})`] = '';
    });
    summaryData.push(separatorRow);

    // Add overall totals
    const overallTotalRow = { 'Month': 'OVERALL TOTALS', 'Receipts': '' };
    allCurrencies.forEach(currency => {
      overallTotalRow[`Total (${currency})`] = '';
    });
    summaryData.push(overallTotalRow);

    // Add final totals row
    const finalTotalRow = {
      'Month': 'Grand Total',
      'Receipts': receipts.length
    };

    allCurrencies.forEach(currency => {
      const totals = overallCurrencyTotals[currency];
      finalTotalRow[`Total (${currency})`] = `${totals.symbol}${totals.total.toFixed(2)}`;
    });

    summaryData.push(finalTotalRow);

    return summaryData;
  }

  // Prepare monthly detail data (individual sheets)
  async prepareMonthlyData(receipts) {
    const monthlyData = [];
    
    for (const receipt of receipts) {
      const data = receipt.extractedData || receipt;
      
      // Generate iOS-compatible proxy URL for the receipt file
      let fileUrl = 'No File Available';

      try {
        const S3Service = require('./S3Service');
        const s3Service = new S3Service();

        // Get S3 key from various sources
        let s3Key = null;

        if (receipt.s3Key) {
          s3Key = receipt.s3Key;
          console.log('🔗 Using s3Key from database');
        } else if (receipt.metadata?.s3Data?.s3Key) {
          s3Key = receipt.metadata.s3Data.s3Key;
          console.log('🔗 Using s3Key from metadata');
        } else if (data.s3Data?.s3Key || data.s3Data?.key) {
          s3Key = data.s3Data.s3Key || data.s3Data.key;
          console.log('🔗 Using s3Key from extractedData');
        }

        // Generate iOS-compatible proxy URL
        if (s3Key) {
          fileUrl = s3Service.generateProxyUrl(s3Key);
          console.log('✅ Generated iOS-compatible proxy URL for Excel hyperlink');
        } else {
          console.log('⚠️ No S3 key found, using fallback');
          fileUrl = `Receipt ID: ${receipt.id}`;
        }
      } catch (error) {
        console.error('Error generating proxy URL:', error);
        fileUrl = `Receipt ID: ${receipt.id}`;
      }

      
      // Extract data from both database receipt and extractedData
      const merchant = receipt.merchantName || data.merchant || data.merchantName || 'Unknown';
      const category = receipt.category || data.category || 'Other';
      const totalAmount = receipt.totalAmount || data.totalAmount || 0;
      const taxAmount = receipt.taxAmount || data.taxAmount || receipt.tax || data.tax || 0;
      const miscAmount = receipt.miscellaneousAmount || receipt.miscellaneous || data.miscellaneous || data.miscAmount || 0;
      const receiptDate = new Date(receipt.createdAt).toLocaleDateString(); // Use upload date for grouping
      
      // Get invoice/bill number from database fields first, then fallback to extractedData
      const invoiceNumber = receipt.invoiceNumber || 
                           receipt.billNumber || 
                           receipt.serialNumber ||
                           data.invoiceNumber || 
                           data.billNumber || 
                           data.serialNumber || 
                           'N/A';

      monthlyData.push({
        'Date of Invoice (MM/DD/YYYY)': receiptDate,
        'Merchant': merchant,
        'Amount': `${this.currencyService.getCurrencySymbol(receipt.originalCurrency || data.currency || 'INR')}${(parseFloat(totalAmount) || 0).toFixed(2)}`,
        'Category': category,
        'Bill No.': invoiceNumber,
        'Tax': `${this.currencyService.getCurrencySymbol(receipt.originalCurrency || data.currency || 'INR')}${(parseFloat(taxAmount) || 0).toFixed(2)}`,
        'Miscellaneous': `${this.currencyService.getCurrencySymbol(receipt.originalCurrency || data.currency || 'INR')}${(parseFloat(miscAmount) || 0).toFixed(2)}`,
        'Receipt File': this.extractFilenameFromUrl(fileUrl, receipt.originalFilename || data.originalFilename)
      });
    }
    
    return monthlyData;
  }

  // Prepare category breakdown data with separate columns for different currencies
  prepareCategoryBreakdownData(receipts) {
    const categoryTotals = {};
    const overallCurrencyTotals = this.calculateCurrencyTotals(receipts);
    const allCurrencies = Object.keys(overallCurrencyTotals);

    // Group by category only (not by currency)
    receipts.forEach(receipt => {
      const data = receipt.extractedData || receipt;
      const category = data.category || 'Other';
      const currency = receipt.originalCurrency || data.currency || 'INR';
      const amount = parseFloat(data.totalAmount || receipt.totalAmount || 0);

      if (!categoryTotals[category]) {
        categoryTotals[category] = {
          totalCount: 0,
          currencies: {}
        };
      }

      if (!categoryTotals[category].currencies[currency]) {
        categoryTotals[category].currencies[currency] = {
          count: 0,
          total: 0,
          symbol: this.currencyService.getCurrencySymbol(currency)
        };
      }

      categoryTotals[category].totalCount++;
      categoryTotals[category].currencies[currency].count++;
      categoryTotals[category].currencies[currency].total += (isNaN(amount) ? 0 : amount);
    });

    // Convert to array format with separate currency columns
    return Object.entries(categoryTotals)
      .sort(([,a], [,b]) => {
        // Sort by total count first, then by total amount in primary currency
        const aTotalAmount = Object.values(a.currencies).reduce((sum, curr) => sum + curr.total, 0);
        const bTotalAmount = Object.values(b.currencies).reduce((sum, curr) => sum + curr.total, 0);
        return bTotalAmount - aTotalAmount;
      })
      .map(([category, stats]) => {
        const row = {
          'Category': category.replace(/_/g, ' ').toUpperCase(),
          'Total Count': stats.totalCount
        };

        // Add columns for each currency
        allCurrencies.forEach(currency => {
          const currencyStats = stats.currencies[currency];
          if (currencyStats && currencyStats.count > 0) {
            row[`Total (${currency})`] = `${currencyStats.symbol}${currencyStats.total.toFixed(2)}`;
            row[`Count (${currency})`] = currencyStats.count;
            row[`Avg (${currency})`] = `${currencyStats.symbol}${(currencyStats.total / currencyStats.count).toFixed(2)}`;
          } else {
            row[`Total (${currency})`] = '';
            row[`Count (${currency})`] = '';
            row[`Avg (${currency})`] = '';
          }
        });

        return row;
      });
  }

  // Prepare Receipt Vault data
  async prepareReceiptVaultData(phoneNumber, period = null) {
    try {
      // Get saved receipts from database using direct query for fresh data
      const { User } = require('../models/database/indexV2');
      const sequelize = require('../models/database/indexV2').sequelize;
      const { QueryTypes } = require('sequelize');

      // Get user
      console.log(`🔍 Looking up user for phone number: ${phoneNumber}`);
      const user = await User.findByPhoneNumber(phoneNumber);
      if (!user) {
          console.log(`❌ No user found for phone number: ${phoneNumber}`);
          return [];
      }
      console.log(`✅ User found: ${user.id} for phone: ${user.phoneNumber}`);

      // Calculate date range based on period
      let dateFilter = '';
      const now = new Date();

      if (period === 'this_month') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        dateFilter = `AND sr."createdAt" >= '${startOfMonth.toISOString()}'`;
      } else if (period === 'last_3_months') {
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        dateFilter = `AND sr."createdAt" >= '${threeMonthsAgo.toISOString()}'`;
      }
      // If no period specified, return all receipts (for backward compatibility)

      console.log(`📅 Period filter: ${period || 'all time'}, Date filter: ${dateFilter || 'none'}`);

      // Query directly from saved_receipts table to ensure fresh data
      const savedReceipts = await sequelize.query(`
        SELECT sr.*, u."phoneNumber"
        FROM saved_receipts sr
        JOIN users u ON sr."userId" = u.id
        WHERE sr."userId" = :userId
          AND sr."isActive" = true
          ${dateFilter}
        ORDER BY sr."createdAt" DESC
      `, {
        replacements: { userId: user.id },
        type: QueryTypes.SELECT
      });

      console.log(`🔍 Vault data fetch: Found ${savedReceipts.length} saved receipts for user ${phoneNumber} (period: ${period || 'all'})`);

      // DEBUG: Log sample of what was found
      if (savedReceipts.length > 0) {
        console.log('📁 Sample vault data:', savedReceipts.slice(0, 2).map(item => ({
          id: item.id,
          category: item.category,
          isActive: item.isActive,
          filename: item.originalFilename
        })));
      }

      if (!savedReceipts || savedReceipts.length === 0) {
        console.log('❌ No saved receipts found, returning empty array');
        return [];
      }


      const vaultData = [];

      for (const savedReceipt of savedReceipts) {
        // Apply intelligent filename generation for saved receipts
        const improvedFileName = this.createBetterFilename(savedReceipt.originalFilename, {
          merchantName: savedReceipt.category, // Use category as merchant name for saved receipts
          expenseDate: savedReceipt.uploadDate || savedReceipt.createdAt,
          totalAmount: null, // Saved receipts don't have amount data
          originalCurrency: 'INR', // Default currency
          fileType: savedReceipt.originalFilename ? this.getFileExtension(savedReceipt.originalFilename, savedReceipt) : '.jpg'
        });

        console.log('🔍 VAULT S3 DEBUG - savedReceipt data:', {
          id: savedReceipt.id,
          hasDownloadUrl: !!savedReceipt.downloadUrl,
          s3Key: savedReceipt.s3Key,
          originalFilename: savedReceipt.originalFilename,
          improvedFileName: improvedFileName
        });

        // Generate iOS-compatible proxy URL for vault receipts
        let fileUrl = 'No File Available';

        if (savedReceipt.s3Key) {
          const S3Service = require('./S3Service');
          const s3Service = new S3Service();
          fileUrl = s3Service.generateProxyUrl(savedReceipt.s3Key);
          console.log('✅ Generated iOS-compatible proxy URL for vault receipt');
        } else {
          console.log('⚠️ No S3 key for vault item:', savedReceipt.id);
        }

        vaultData.push({
          'Upload Date': savedReceipt.uploadDate ? savedReceipt.uploadDate.toLocaleDateString() : savedReceipt.createdAt.toLocaleDateString(),
          'Category': savedReceipt.category,
          'Description': savedReceipt.description,
          'Download Receipt': (() => {
            console.log('🔗 Final fileUrl for hyperlink:', { fileUrl, fileName: improvedFileName });
            return this.createHyperlink(fileUrl, 'Download');
          })()
        });
      }

      console.log(`📁 FINAL VAULT DATA: Returning ${vaultData.length} processed items`);
      if (vaultData.length > 0) {
        console.log('📋 Sample processed vault item:', {
          category: vaultData[0]['Category'],
          description: vaultData[0]['Description'],
          uploadDate: vaultData[0]['Upload Date'],
          hasURL: !!vaultData[0]['Download Receipt']
        });
      }

      return vaultData;

    } catch (error) {
      console.error('Error preparing Receipt Vault data:', error);
      return [];
    }
  }

  // Add footer messages to worksheet
  addFooterMessages(worksheet) {
    if (!worksheet['!ref']) return;

    const range = XLSX.utils.decode_range(worksheet['!ref']);
    const lastDataRow = range.e.r;

    // Start adding messages 5 rows after the last data entry
    let currentRow = lastDataRow + 6;

    // Message 1: Receipt Downloads compatibility (line 1)
    const message1 = '📥 Receipt Downloads: Works on computers (Mac/Windows), Android & Google Sheets.';
    const cell1Address = XLSX.utils.encode_cell({ r: currentRow, c: 0 });
    worksheet[cell1Address] = {
      v: message1,
      t: 's',
      s: {
        alignment: { wrapText: false, vertical: 'top' }
      }
    };

    // Message 1 continuation: iOS users (line 2)
    currentRow += 1;
    const message1b = 'iOS users: Transfer file to computer or open in Google Sheets to access receipts.';
    const cell1bAddress = XLSX.utils.encode_cell({ r: currentRow, c: 0 });
    worksheet[cell1bAddress] = {
      v: message1b,
      t: 's',
      s: {
        alignment: { wrapText: false, vertical: 'top' }
      }
    };

    // Message 2: Download links expiration (2 rows after message 1)
    currentRow += 2;
    const message2 = '⏰ Download links expire in 7 days. Generate new report from Main Menu anytime.';
    const cell2Address = XLSX.utils.encode_cell({ r: currentRow, c: 0 });
    worksheet[cell2Address] = {
      v: message2,
      t: 's',
      s: {
        alignment: { wrapText: false, vertical: 'top' }
      }
    };

    // Message 3: TextExpense branding (3 rows after message 2)
    currentRow += 3;
    const message3 = 'Generated by TextExpense - Never lose a receipt again';
    const cell3Address = XLSX.utils.encode_cell({ r: currentRow, c: 0 });
    worksheet[cell3Address] = {
      v: message3,
      t: 's',
      s: {
        font: { bold: true },
        alignment: { vertical: 'top' }
      }
    };

    // URL hyperlink (next row after message 3)
    currentRow += 1;
    const urlAddress = XLSX.utils.encode_cell({ r: currentRow, c: 0 });
    worksheet[urlAddress] = {
      v: 'https://www.textexpense.com/',
      l: { Target: 'https://www.textexpense.com/', Tooltip: 'Visit TextExpense' },
      t: 's',
      s: {
        font: { color: { rgb: "0563C1" }, underline: true }
      }
    };

    // Update worksheet range to include footer messages
    range.e.r = currentRow;
    worksheet['!ref'] = XLSX.utils.encode_range(range);
  }

  // Format individual worksheet with dynamic column sizing and bold headers
  formatWorksheet(worksheet) {
    if (!worksheet['!ref']) return;

    const range = XLSX.utils.decode_range(worksheet['!ref']);
    const numCols = range.e.c + 1;
    const numRows = range.e.r + 1;

    // Dynamic column widths based on number of columns
    const columnWidths = [];

    for (let i = 0; i < numCols; i++) {
      if (i === 0) {
        columnWidths.push({ width: 20 }); // First column (Month/Date/Category)
      } else if (i === 1) {
        columnWidths.push({ width: 15 }); // Second column (Receipts/Count)
      } else if (i === numCols - 1 && numCols > 8) {
        columnWidths.push({ width: 25 }); // Last column might be Receipt File
      } else {
        columnWidths.push({ width: 14 }); // Currency columns
      }
    }

    worksheet['!cols'] = columnWidths;

    // Apply bold formatting to headers (first row)
    for (let col = 0; col < numCols; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!worksheet[cellAddress]) continue;

      // Ensure cell has proper style object structure with text wrapping
      worksheet[cellAddress].s = {
        font: { bold: true, sz: 11 },
        fill: { fgColor: { rgb: "E0E0E0" } },
        alignment: { horizontal: "center", vertical: "center", wrapText: true }
      };
    }

    // Apply bold formatting to "OVERALL TOTALS" row
    for (let row = 0; row < numRows; row++) {
      const firstCellAddress = XLSX.utils.encode_cell({ r: row, c: 0 });
      if (worksheet[firstCellAddress] && worksheet[firstCellAddress].v === 'OVERALL TOTALS') {
        for (let col = 0; col < numCols; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
          if (!worksheet[cellAddress]) continue;

          // Bold the OVERALL TOTALS row
          worksheet[cellAddress].s = {
            font: { bold: true, sz: 11 },
            fill: { fgColor: { rgb: "F0F0F0" } }
          };
        }
        break;
      }
    }
  }

  // Helper method to extract original filename from various sources
  extractOriginalFilename(receiptData, existingExtractedData) {
    // Priority 1: Direct originalFilename field
    if (receiptData.originalFilename) {
      // Check if it's a WhatsApp-generated filename and create a better one
      const whatsappFilename = this.createBetterFilename(receiptData.originalFilename, receiptData);
      if (whatsappFilename !== receiptData.originalFilename) {
        return whatsappFilename;
      }
      return receiptData.originalFilename;
    }

    // Priority 2: Extract from S3 metadata
    const s3Data = existingExtractedData?.s3Data || receiptData.metadata?.s3Data;
    if (s3Data?.metadata?.['original-filename']) {
      return this.createBetterFilename(s3Data.metadata['original-filename'], receiptData);
    }

    // Priority 3: Extract from originalDocumentUrl (database field)
    if (receiptData.originalDocumentUrl) {
      return this.extractFilenameFromUrl(receiptData.originalDocumentUrl);
    }

    // Priority 4: Extract from originalFileUrl
    if (receiptData.originalFileUrl) {
      return this.extractFilenameFromUrl(receiptData.originalFileUrl);
    }

    // Priority 5: Extract from S3 URL in s3Data
    if (s3Data?.url) {
      return this.extractFilenameFromUrl(s3Data.url);
    }

    // Fallback: generate a meaningful filename based on receipt data
    return this.createBetterFilename(null, receiptData);
  }

  // Helper method to create better filenames
  createBetterFilename(originalFilename, receiptData) {
    // First, try to extract clean filename from UUID-prefixed filenames
    if (originalFilename) {
      const cleanFilename = this.extractCleanFilename(originalFilename);
      // If extraction was successful (filename changed), use the clean version
      if (cleanFilename !== originalFilename) {
        return cleanFilename;
      }
    }

    // If we have a meaningful original filename (not WhatsApp-generated), use it
    if (originalFilename && !this.isWhatsAppGeneratedFilename(originalFilename)) {
      return originalFilename;
    }

    // Create a meaningful filename based on receipt data
    const merchant = receiptData.merchantName || receiptData.extractedData?.merchantName || 'Receipt';
    const date = receiptData.expenseDate || receiptData.extractedData?.date || receiptData.createdAt;
    const amount = receiptData.totalAmount || receiptData.extractedData?.totalAmount;
    
    // Clean merchant name for filename
    const cleanMerchant = merchant
      .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .substring(0, 20); // Limit length
    
    // Format date
    let dateStr = '';
    if (date) {
      try {
        const dateObj = new Date(date);
        dateStr = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD format
      } catch (error) {
        dateStr = new Date().toISOString().split('T')[0];
      }
    } else {
      dateStr = new Date().toISOString().split('T')[0];
    }
    
    // Add amount if available
    let amountStr = '';
    if (amount && !isNaN(parseFloat(amount))) {
      const currency = receiptData.originalCurrency || receiptData.extractedData?.currency || 'INR';
      const symbol = this.currencyService.getCurrencySymbol(currency);
      amountStr = `_${symbol}${parseFloat(amount).toFixed(0)}`;
    }
    
    // Determine file extension
    const extension = this.getFileExtension(originalFilename, receiptData);
    
    return `${cleanMerchant}_${dateStr}${amountStr}${extension}`;
  }

  // Helper method to check if filename is WhatsApp-generated
  isWhatsAppGeneratedFilename(filename) {
    if (!filename) return false;
    
    // WhatsApp generates filenames like: 1759583224300_e447a366-f978-4550-bc11-5846d8be54e7_image.jpg
    const whatsappPattern = /^\d+_[a-f0-9-]+_(image|document)\./i;
    return whatsappPattern.test(filename);
  }

  // Helper method to get file extension
  getFileExtension(originalFilename, receiptData) {
    if (originalFilename) {
      const ext = originalFilename.split('.').pop();
      if (ext && ext.length <= 5) { // Reasonable extension length
        return `.${ext}`;
      }
    }
    
    // Default to .jpg for images, .pdf for documents
    const fileType = receiptData.fileType || receiptData.extractedData?.fileType;
    if (fileType && fileType.includes('pdf')) {
      return '.pdf';
    }
    
    return '.jpg'; // Default for images
  }

  // Helper method to extract filename from URL
  extractFilenameFromUrl(url, originalFilename = null) {
    if (!url) return 'No File';

    // If we have original filename, extract the clean part
    if (originalFilename) {
      return this.extractCleanFilename(originalFilename);
    }

    // Extract filename from URL
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const filename = pathname.split('/').pop() || 'receipt';

      // If it's an S3 URL with encoded filename, try to decode
      const decodedFilename = filename.includes('%') ? decodeURIComponent(filename) : filename;

      // Extract clean filename from technical filename
      return this.extractCleanFilename(decodedFilename);
    } catch (error) {
      // If URL parsing fails, try simple extraction
      const parts = url.split('/');
      const filename = parts[parts.length - 1] || 'receipt.file';
      return this.extractCleanFilename(filename);
    }
  }

  // Helper method to extract clean filename from technical filenames
  // Converts: 1759742196496_17c2c8a9-b3fb-4c1d-8db2-d7203355b274_WhatsApp_Image_2025-09-05_at_7.49.48_PM.jpeg.jpg
  // Or: 1759749462803_9d68e151-1529-48bd-a786-efa8e6aaf8f7_what.jpg.jpg
  // To: WhatsApp_Image_2025-09-05_at_7.49.48_PM.jpeg or what.jpg
  extractCleanFilename(filename) {
    if (!filename) return 'receipt';

    // Pattern 1: timestamp_uuid_actualfilename.extension (UUID with hyphens)
    // Match: [timestamp]_[uuid with hyphens]_[actual filename].[ext]
    const uuidWithHyphensPattern = /^\d+_[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}_(.+)$/i;
    let match = filename.match(uuidWithHyphensPattern);

    if (match && match[1]) {
      // Extract the actual filename part and remove duplicate extensions
      let cleanName = match[1];

      // Remove duplicate extension if exists (e.g., .jpeg.jpg -> .jpeg, .jpg.jpg -> .jpg)
      cleanName = cleanName.replace(/\.(jpg|jpeg|png|pdf)\.(jpg|jpeg|png|pdf)$/i, '.$1');

      return cleanName;
    }

    // Pattern 2: timestamp_shortuuid_actualfilename (UUID without hyphens)
    const uuidWithoutHyphensPattern = /^\d+_[a-f0-9]{32}_(.+)$/i;
    match = filename.match(uuidWithoutHyphensPattern);

    if (match && match[1]) {
      let cleanName = match[1];
      cleanName = cleanName.replace(/\.(jpg|jpeg|png|pdf)\.(jpg|jpeg|png|pdf)$/i, '.$1');
      return cleanName;
    }

    // If no UUID pattern found, return as-is
    return filename;
  }

  // Helper method to format file size
  formatFileSize(bytes) {
    if (!bytes || bytes === 0) return '0 KB';

    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));

    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  // Helper method to format dates
  formatDate(date) {
    if (!date) return 'Unknown';

    try {
      // Check if it's a partial date (no year) - return as-is
      // Patterns: "Oct 19", "Oct 2023", "19, 2023"
      const partialDatePatterns = [
        /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}$/i,  // "Oct 19"
        /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}$/i,    // "Oct 2023"
        /^\d{1,2},\s+\d{4}$/                                                 // "19, 2023"
      ];

      for (const pattern of partialDatePatterns) {
        if (pattern.test(date)) {
          // It's a partial date, return as-is without parsing
          return date;
        }
      }

      // Try to parse as full date
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return date; // Return original if can't parse

      // Format date with short month name (Oct, Dec, Nov) instead of numbers
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',  // Changed from '2-digit' to 'short' for Oct, Dec, Nov
        day: '2-digit'
      });
    } catch (error) {
      return date; // Return original date string on error
    }
  }

  // Helper method to format currency
  formatCurrency(amount, currency = 'USD') {
    if (!amount || isNaN(amount)) return `${this.currencyService.getCurrencySymbol(currency)}0.00`;

    const numAmount = parseFloat(amount);
    const symbol = this.currencyService.getCurrencySymbol(currency);

    return `${symbol}${numAmount.toFixed(2)}`;
  }

  // Helper method to get short month name (under 31 chars for sheet names)
  getShortMonthName(monthYear) {
    try {
      // monthYear format is typically "September 2025" or similar
      const parts = monthYear.split(' ');
      const month = parts[0];
      const year = parts[1];

      // Shorten month names if needed
      const shortMonths = {
        'January': 'Jan',
        'February': 'Feb',
        'March': 'Mar',
        'April': 'Apr',
        'May': 'May',
        'June': 'Jun',
        'July': 'Jul',
        'August': 'Aug',
        'September': 'Sep',
        'October': 'Oct',
        'November': 'Nov',
        'December': 'Dec'
      };

      const shortMonth = shortMonths[month] || month;
      return `${shortMonth} ${year}`;
    } catch (error) {
      return monthYear.substring(0, 15); // Fallback: truncate to safe length
    }
  }

  // Helper method to group vault data by month
  groupVaultDataByMonth(vaultData) {
    const grouped = {};

    vaultData.forEach(item => {
      const uploadDate = new Date(item['Upload Date']);
      const monthYear = uploadDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }

      grouped[monthYear].push({
        'Upload Date': item['Upload Date'],
        'Category': item['Category'],
        'Description': item['Description'],
        'Download Receipt': item['Download Receipt']
      });
    });

    return grouped;
  }

  // Helper method to prepare monthly details data (replacement for prepareProcessedMonthlyData)
  async prepareMonthlyDetailsData(receipts) {
    const monthlyData = [];

    for (const receipt of receipts) {
      const data = receipt.extractedData || receipt;

      // Generate iOS-compatible proxy URL for the receipt file
      let receiptFileUrl = 'No File Available';

      try {
        const S3Service = require('./S3Service');
        const s3Service = new S3Service();

        // Get S3 key from various sources
        let s3Key = null;

        console.log('🔍 PROCESSED EXPENSE S3 DEBUG - receipt data:', {
          id: receipt.id,
          hasS3Key: !!receipt.s3Key,
          hasMetadataS3Data: !!receipt.metadata?.s3Data,
          hasExtractedDataS3Data: !!data.s3Data,
          hasOriginalDocumentUrl: !!receipt.originalDocumentUrl,
          hasCompressedDocumentUrl: !!receipt.compressedDocumentUrl,
          s3Key: receipt.s3Key?.substring(0, 50) || 'null',
          originalDocumentUrl: receipt.originalDocumentUrl?.substring(0, 80) || 'null'
        });

        if (receipt.s3Key) {
          s3Key = receipt.s3Key;
          console.log('🔗 Using s3Key from database');
        } else if (receipt.metadata?.s3Data?.s3Key) {
          s3Key = receipt.metadata.s3Data.s3Key;
          console.log('🔗 Using s3Key from metadata');
        } else if (data.s3Data?.s3Key || data.s3Data?.key) {
          s3Key = data.s3Data.s3Key || data.s3Data.key;
          console.log('🔗 Using s3Key from extractedData');
        } else if (receipt.originalDocumentUrl) {
          // Try to extract S3 key from originalDocumentUrl for old records
          const extractedKey = this.extractS3KeyFromUrl(receipt.originalDocumentUrl);
          if (extractedKey) {
            s3Key = extractedKey;
            console.log('🔗 Extracted s3Key from originalDocumentUrl');
          }
        } else if (receipt.compressedDocumentUrl) {
          // Try compressed URL as fallback
          const extractedKey = this.extractS3KeyFromUrl(receipt.compressedDocumentUrl);
          if (extractedKey) {
            s3Key = extractedKey;
            console.log('🔗 Extracted s3Key from compressedDocumentUrl');
          }
        }

        // Generate iOS-compatible proxy URL
        if (s3Key) {
          receiptFileUrl = s3Service.generateProxyUrl(s3Key);
          console.log('✅ Generated iOS-compatible proxy URL for processed expense');
        } else {
          receiptFileUrl = `Receipt ID: ${receipt.id}`;
          console.log('⚠️ No S3 key found for processed expense, using Receipt ID fallback');
        }
      } catch (error) {
        console.error('Error generating proxy URL:', error);
        receiptFileUrl = `Receipt ID: ${receipt.id}`;
      }

      // Get subtotal (totalAmount - tax) or from database subtotal field
      const totalAmount = parseFloat(data.totalAmount || receipt.totalAmount || 0);
      const taxAmount = parseFloat(data.taxAmount || receipt.taxAmount || data.tax || receipt.tax || 0);
      const subtotalAmount = data.subtotal || receipt.subtotal || (totalAmount - taxAmount);

      // Create meaningful filename - use improvement logic for WhatsApp-generated filenames
      const originalFilename = receipt.originalFilename || data.originalFilename;
      const fileName = this.createBetterFilename(originalFilename, receipt);

      // Get miscellaneous amount - check all possible field names
      const miscAmount = parseFloat(
        receipt.miscellaneousAmount ||
        data.miscAmount ||
        data.miscellaneous ||
        receipt.miscellaneous ||
        0
      );

      // Get currency - prioritize database field
      const currency = receipt.originalCurrency || data.currency || 'USD';

      monthlyData.push({
        'Date of Invoice (MM/DD/YYYY)': this.formatDate(receipt.expenseDate || data.date || data.receiptDate || receipt.receiptDate || receipt.createdAt),
        Merchant: data.merchantName || data.merchant || 'Unknown',
        'Subtotal Amount': this.formatCurrency(subtotalAmount, currency),
        Tax: this.formatCurrency(data.taxAmount || data.tax || 0, currency),
        'Miscellaneous': this.formatCurrency(miscAmount, currency),
        'Total Amount': this.formatCurrency(data.totalAmount, currency),
        Category: data.category || 'Uncategorized',
        'Download Receipt': this.createHyperlink(receiptFileUrl, 'Download')
      });
    }

    return monthlyData;
  }

  // Helper method to create Excel hyperlinks (Excel only, no Google Sheets)
  createHyperlink(url, displayText = 'Download') {
    if (!url || url.startsWith('Receipt ID:') || url === 'No File Available') {
      // Return plain text for invalid URLs
      return 'No File';
    }

    // Use ONLY Excel native hyperlink format (no formula to avoid corruption)
    // The 'l' property creates a real clickable hyperlink in Excel
    return {
      v: 'Download',                               // Display text
      l: { Target: url, Tooltip: 'Click to download receipt' }, // Excel hyperlink
      t: 's',                                      // String type
      s: {                                         // Cell style for blue underlined text
        font: {
          color: { rgb: "0563C1" },               // Blue color
          underline: true                          // Underlined
        }
      }
    };
  }

  // Helper method to extract S3 key from S3 URL (for backward compatibility with old records)
  extractS3KeyFromUrl(url) {
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
  }
}

module.exports = ExcelReportService;