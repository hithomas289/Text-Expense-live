const { USER_STATES } = require('../models/database/Session');
const User = require('../models/database/User');
const { MESSAGE_COMMANDS } = require('../config/commands');
const S3Service = require('../services/S3Service');
const CurrencyService = require('../services/CurrencyService');

class ConfirmationHandler {
  constructor(whatsAppService, sessionManager) {
    this.whatsAppService = whatsAppService;
    this.sessionManager = sessionManager;
    this.s3Service = new S3Service();
    this.currencyService = new CurrencyService();
  }

  // Main confirmation display - NEW 3-BUTTON FLOW
  async displayReceiptDetails(phoneNumber, receipt) {
    try {
      // Validate receipt data
      if (!receipt) {
        throw new Error('Receipt data is missing');
      }

      console.log(`📋 displayReceiptDetails called with receipt:`, {
        hasDate: !!receipt.date,
        hasMerchant: !!receipt.merchantName,
        hasTotal: !!receipt.totalAmount,
        hasCategory: !!receipt.category,
        category: receipt.category
      });

      // Ensure category is a string - handle all possible cases
      let categoryDisplay = 'Other';
      if (typeof receipt.category === 'string') {
        categoryDisplay = receipt.category;
      } else if (receipt.category?.name) {
        categoryDisplay = receipt.category.name;
      } else if (receipt.category) {
        categoryDisplay = String(receipt.category);
      }

      // Get user's default currency if receipt currency is not detected
      let currency = receipt.currency;
      if (!currency) {
        const user = await User.findOne({ where: { phoneNumber } });
        currency = user?.defaultCurrency || 'INR';
        console.log(`💰 No currency in receipt, using user default: ${currency}`);
      }
      console.log(`💰 DEBUG displayReceiptDetails: receipt.currency=${receipt.currency}, using currency=${currency}`);
      const currencySymbol = this.currencyService.getCurrencySymbol(currency);

      const details = `📋 *EXPENSE SUMMARY*
• Invoice No: ${receipt.invoiceNumber || 'Not available'}
• Date: ${receipt.date}
• Merchant: ${receipt.merchantName}
• Category: ${categoryDisplay}
• Subtotal: ${currencySymbol}${receipt.subtotal?.toFixed(2) || (receipt.totalAmount - (receipt.taxAmount || 0)).toFixed(2)}
• Tax: ${currencySymbol}${receipt.taxAmount?.toFixed(2) || '0.00'}
• Miscellaneous: ${currencySymbol}${(receipt.miscellaneous || 0).toFixed(2)}
• Total: ${currencySymbol}${receipt.totalAmount?.toFixed(2) || '0.00'}

Don't worry if something needs fixing
You can edit *ALL DETAILS* in the next step!`;

      console.log(`📤 Sending expense summary to ${phoneNumber}`);
      await this.whatsAppService.sendMessage(phoneNumber, details);

      const confirmationOptions = [
        { id: 'save_this_expense', text: 'Save This Expense' },
        { id: 'edit_details', text: 'Edit Details' },
        { id: 'try_new_expense', text: 'Process New Expense' }
      ];

      console.log(`📤 Sending confirmation buttons to ${phoneNumber}`);
      await this.whatsAppService.sendInteractiveButtons(phoneNumber, 'Choose an option:', confirmationOptions, 'confirm');
      console.log(`✅ Successfully displayed receipt details to ${phoneNumber}`);

    } catch (error) {
      console.error(`❌ Error in displayReceiptDetails for ${phoneNumber}:`, error);
      console.error('Receipt data:', JSON.stringify(receipt, null, 2));

      // Try to send a simplified error message to user
      try {
        await this.whatsAppService.sendMessage(phoneNumber,
          '❌ Sorry, there was an error displaying your receipt. Please try again or contact support.');
      } catch (sendError) {
        console.error('❌ Failed to send error message:', sendError);
      }

      throw error; // Re-throw so calling function knows it failed
    }
  }

  // Handle confirmation input
  async handleConfirmationInput(phoneNumber, input, session) {
    
    // Check if we're in continue editing mode FIRST (most specific)
    if (session.metadata?.continueEditing) {
      return await this.handleContinueEditingInput(phoneNumber, input, session);
    }
    
    // Check if we're in edit menu mode (after continue editing check)
    if (session.metadata?.editingMode && !session.metadata?.continueEditing) {
      // This should route to EditDetailsHandler
      return { routeTo: 'EditDetailsHandler', method: 'handleEditingInput', params: [phoneNumber, input, session] };
    }
    
    // Normal confirmation flow
    const confirmActions = {
      'SAVE_EXPENSE': 'save',
      'EDIT_DETAILS': 'edit',
      'TRY_NEW_EXPENSE': 'retake',
      'RETAKE_DOCUMENT': 'retake', // Legacy support
      '1': 'save',
      '2': 'edit',
      '3': 'retake',
      'yes': 'save',
      'save': 'save',
      'edit': 'edit',
      'retake': 'retake'
    };
    
    const action = confirmActions[input.toUpperCase()] || confirmActions[input];

    if (action) {
      switch (action) {
        case 'save':
          // Get fresh session data to ensure we have the latest updates
          const freshSession = await this.sessionManager.getSession(phoneNumber);
          return await this.saveExpense(phoneNumber, freshSession);
        case 'edit':
          // Route to EditDetailsHandler
          return { routeTo: 'EditDetailsHandler', method: 'handleEditDetailsRequest', params: [phoneNumber] };
        case 'retake':
          return await this.handleRetakeRequest(phoneNumber);
      }
    } else {
      // Unrecognized input - show main menu
      await this.whatsAppService.sendMessage(phoneNumber,
        `I didn't understand that. Here are your options:`);

      const MenuHandler = require('./MenuHandler');
      const menuHandler = new MenuHandler(this.whatsAppService, this.sessionManager);
      return await menuHandler.handleMainMenuFlow(phoneNumber, session);
    }
  }

  // Handle continue editing input
  async handleContinueEditingInput(phoneNumber, input, session) {
    // Handle both new button IDs and legacy numeric inputs
    let action = null;
    
    // New button IDs (descriptive)
    if (input === 'edit_more_details' || input === 'EDIT_MORE_DETAILS') {
      action = 'edit_more';
    } else if (input === 'save_changes' || input === 'SAVE_CHANGES') {
      action = 'save';
    } else if (input === 'cancel_changes' || input === 'CANCEL_CHANGES') {
      action = 'cancel';
    }
    // Legacy numeric inputs (backward compatibility)
    else if (input === '1') {
      action = 'edit_more';
    } else if (input === '2') {
      action = 'save';
    } else if (input === '3') {
      action = 'cancel';
    }
    
    switch (action) {
      case 'edit_more': // Edit More Details
        // Clear the editingField metadata and go back to edit menu
        await this.sessionManager.updateUserState(phoneNumber, USER_STATES.WAITING_FOR_CONFIRMATION, { 
          editingMode: true, 
          continueEditing: false, 
          editingField: null 
        });
        return { routeTo: 'EditDetailsHandler', method: 'handleEditDetailsRequest', params: [phoneNumber] };
        
      case 'save': // Save Changes
        await this.whatsAppService.sendMessage(phoneNumber, '✅ *Changes saved successfully!*');
        // Clear all editing metadata including backup and show FINAL updated confirmation screen
        await this.sessionManager.updateUserState(phoneNumber, USER_STATES.WAITING_FOR_CONFIRMATION, { 
          continueEditing: false, 
          editingMode: false, 
          editingField: null,
          originalReceipt: null  // Clear backup since changes are saved
        });
        // Show updated receipt summary with all changes applied
        await this.displayReceiptDetails(phoneNumber, session.currentReceipt);
        break;
        
      case 'cancel': // Cancel Changes  
        await this.whatsAppService.sendMessage(phoneNumber, '❌ *Changes cancelled*');
        
        // Restore original receipt if we have a backup
        if (session.metadata?.originalReceipt) {
          await this.sessionManager.setCurrentReceipt(phoneNumber, session.metadata.originalReceipt);
          session.currentReceipt = session.metadata.originalReceipt;
        }
        
        // Clear all editing metadata and show original receipt summary
        await this.sessionManager.updateUserState(phoneNumber, USER_STATES.WAITING_FOR_CONFIRMATION, { 
          continueEditing: false, 
          editingMode: false, 
          editingField: null,
          originalReceipt: null  // Clear backup
        });
        
        // Show original receipt summary (restored from backup)
        await this.displayReceiptDetails(phoneNumber, session.currentReceipt);
        break;

      default:
        // Unrecognized input - show main menu
        await this.whatsAppService.sendMessage(phoneNumber,
          `I didn't understand that. Here are your options:`);

        const MenuHandler = require('./MenuHandler');
        const menuHandler = new MenuHandler(this.whatsAppService, this.sessionManager);
        return await menuHandler.handleMainMenuFlow(phoneNumber, session);
    }
  }

  // Save expense
  async saveExpense(phoneNumber, session) {
    if (session.currentReceipt) {
      // S3 upload should have already happened during receipt processing
      // Use existing S3 data (lazy cleanup approach)
      let s3Data = session.currentReceipt.s3Data;

      if (!s3Data && !session.currentReceipt.originalFileUrl) {
        // Fallback: try to upload now if somehow S3 data is missing
        console.warn(`⚠️ No S3 data found for ${phoneNumber}, attempting fallback upload`);

        if (session.currentReceipt.filePath) {
          try {
            const fs = require('fs').promises;
            await fs.access(session.currentReceipt.filePath);
            const fileBuffer = await fs.readFile(session.currentReceipt.filePath);

            s3Data = await this.s3Service.uploadReceiptFile(
              phoneNumber,
              fileBuffer,
              session.currentReceipt.originalFilename || session.currentReceipt.filename,
              session.currentReceipt.fileType || session.currentReceipt.mimeType
            );

            if (s3Data && s3Data.success) {
              session.currentReceipt.s3Data = s3Data;
              session.currentReceipt.originalFileUrl = s3Data.url;
              console.log(`✅ Fallback S3 upload successful for ${phoneNumber}`);
            }
          } catch (error) {
            console.error(`❌ Fallback S3 upload failed for ${phoneNumber}:`, error.message);
            // Continue without S3 - receipt can still be saved
          }
        }

        if (!s3Data) {
          console.warn(`⚠️ No S3 data available for ${phoneNumber}, saving without file reference`);
        }
      } else {
        console.log(`✅ Using existing S3 data for ${phoneNumber}: ${session.currentReceipt.originalFileUrl || 'S3 upload completed'}`);
      }

      // Save expense using Expense model (consolidated table)
      const { User, UsageLimitV2 } = require('../models/database/indexV2');
      const Expense = require('../models/database/Expense');
      const { sequelize } = require('../config/database');

      const transaction = await sequelize.transaction();

      try {
        // Get user first - try both formats
        let user = await User.findOne({ where: { phoneNumber } }, { transaction });

        // If not found with original format, try with E.164 format
        if (!user && !phoneNumber.startsWith('+')) {
          const formattedPhone = '+' + phoneNumber;
          user = await User.findOne({ where: { phoneNumber: formattedPhone } }, { transaction });
        }

        if (!user) {
          await transaction.rollback();
          console.error(`User not found for phone number: ${phoneNumber}`);
          throw new Error('User not found');
        }

        // Check usage limits using UnifiedUsageService (handles upgrade logic, counts both expenses + saved)
        const UnifiedUsageService = require('../services/UnifiedUsageService');
        const usageCheck = await UnifiedUsageService.canProcessReceipt(user.id);

        if (!usageCheck.canProcess) {
          await transaction.rollback();

          const planType = usageCheck.planType || 'trial';
          const planLimit = usageCheck.limit;

          const message = `❌ *MONTHLY LIMIT REACHED*

You've used all ${planLimit} receipts for this ${planType === 'trial' ? 'trial' : 'month'}.

*UPGRADE TO PRO FOR MORE RECEIPTS*

📋 *PRO Plan Benefits:*
• ${parseInt(process.env.PRO_RECEIPT_LIMIT) || 25} receipts per month
• 3-month expense history
• Priority processing

${planType === 'trial' ? 'Trial is one-time only.' : 'Your limit resets on the 1st of next month.'}`;

          const buttons = [
            { id: 'upgrade_pro', text: 'Upgrade to PRO' },
            { id: 'main_menu', text: 'Main Menu' }
          ];

          await this.whatsAppService.sendInteractiveButtons(phoneNumber, message, buttons, 'monthly_limit');
          return;
        }

        // Create new expense record using consolidated Expense model

        // DEBUG: Log the date and planType being saved
        console.log('🔍 EXPENSE SAVE DEBUG:', {
          'user.planType': user.planType,
          'user.id': user.id,
          'phoneNumber': phoneNumber,
          'session.currentReceipt.date': session.currentReceipt.date,
          'session.currentReceipt.receiptDate': session.currentReceipt.receiptDate,
          'aiExtractedData.date': session.currentReceipt.aiExtractedData?.date,
          'fallback': new Date().toISOString().split('T')[0]
        });

        const expenseData = {
          userId: user.id,
          invoiceNumber: session.currentReceipt.invoiceNumber || session.currentReceipt.billNumber || null,
          billNumber: session.currentReceipt.billNumber || null,
          expenseDate: session.currentReceipt.date || session.currentReceipt.receiptDate || session.currentReceipt.aiExtractedData?.date || new Date().toISOString().split('T')[0],
          merchantName: session.currentReceipt.merchantName || session.currentReceipt.merchant || 'Unknown',
          totalAmount: parseFloat(session.currentReceipt.totalAmount) || 0,
          subtotal: parseFloat(session.currentReceipt.subtotal) || 0,
          taxAmount: parseFloat(session.currentReceipt.taxAmount || session.currentReceipt.tax) || 0,
          tipAmount: parseFloat(session.currentReceipt.tipAmount || session.currentReceipt.tip) || 0,
          miscellaneousAmount: parseFloat(session.currentReceipt.miscellaneous) || 0,
          originalCurrency: session.currentReceipt.currency || 'USD',
          category: session.currentReceipt.category || 'Other',
          ocrConfidenceScore: session.currentReceipt.overallConfidence || session.currentReceipt.confidence || 0.9,
          originalFilename: session.currentReceipt.originalFilename || null,
          originalFileUrl: session.currentReceipt.originalFileUrl || null,
          fileType: session.currentReceipt.fileType || null,
          fileSize: session.currentReceipt.fileSize || null,
          paymentMethod: session.currentReceipt.paymentMethod || null,
          items: session.currentReceipt.items || [],
          ocrText: session.currentReceipt.originalText || null,
          aiExtractedData: session.currentReceipt.aiExtractedData || null,
          status: 'confirmed',
          planType: await UnifiedUsageService.getPlanTypeToConsume(user.id), // Consume Lite first for Lite→Pro upgrades

          // S3 data fields - CRITICAL for Excel report hyperlinks
          s3Key: session.currentReceipt.s3Data?.s3Key || null,
          s3Bucket: session.currentReceipt.s3Data?.s3Bucket || null,
          originalDocumentUrl: session.currentReceipt.s3Data?.url || session.currentReceipt.originalFileUrl || null
        };

        // STRICT VALIDATION: planType must NEVER be null/undefined
        if (!expenseData.planType) {
          console.error(`❌ CRITICAL: planType is NULL for user ${user.id}! Setting to 'trial' as fallback.`);
          expenseData.planType = 'trial';
        }

        console.log(`✅ Saving expense with planType: ${expenseData.planType}`);

        // Save to expenses table with transaction
        let savedExpense;

        // Check if this is an override of an existing expense
        if (session.currentReceipt.overrideExistingId) {
          // Update existing record instead of creating new one
          const [updatedRowsCount] = await Expense.update(expenseData, {
            where: { id: session.currentReceipt.overrideExistingId },
            transaction
          });

          if (updatedRowsCount > 0) {
            savedExpense = await Expense.findByPk(session.currentReceipt.overrideExistingId, { transaction });
          } else {
            savedExpense = await Expense.create(expenseData, { transaction });
          }
        } else {
          // Normal flow - create new record
          savedExpense = await Expense.create(expenseData, { transaction });
        }

        // Increment usage counter (only for new records, not overrides)
        if (!session.currentReceipt.overrideExistingId) {
          // Update User table counters for consistency
          // UnifiedUsageService will count from actual database records
          await user.incrementReceiptUsage({ transaction });

          // Metadata counter removed - we now query database directly for accurate counts
          console.log(`📊 Expense saved with planType=${expenseData.planType}`);
        }

        // CRITICAL: Clear currentReceipt WITHIN transaction to prevent race conditions
        await this.sessionManager.setCurrentReceipt(phoneNumber, null);

        // Commit transaction
        await transaction.commit();

      } catch (error) {
        // Check if transaction is still active before rolling back
        if (transaction && !transaction.finished) {
          await transaction.rollback();
        }
        console.error('❌ Database transaction failed:', error);

        await this.whatsAppService.sendMessage(phoneNumber,
          `❌ *SAVE FAILED*\n\nSorry, there was a problem saving your expense. Please try again.\n\n*Error:* Database transaction failed`);

        // Reset session to allow retry
        await this.sessionManager.updateUserState(phoneNumber, USER_STATES.WAITING_FOR_CONFIRMATION);
        return;
      }

      // Success message generation - separate try-catch to avoid affecting successful save
      try {
        // Get accurate receipt count using User model (plan info moved to User after migration)
        let user = await User.findOne({ where: { phoneNumber } });

        // If not found with original format, try with E.164 format
        if (!user && !phoneNumber.startsWith('+')) {
          const formattedPhone = '+' + phoneNumber;
          user = await User.findOne({ where: { phoneNumber: formattedPhone } });
        }

        if (!user) {
          throw new Error(`User not found for success message: ${phoneNumber}`);
        }

        // Verify user object has required methods
        if (!user.getMonthlyLimits || typeof user.getMonthlyLimits !== 'function') {
          throw new Error(`User model missing getMonthlyLimits method for: ${phoneNumber}`);
        }

        // Get fresh usage count directly from database AFTER the expense was saved
        const UnifiedUsageService = require('../services/UnifiedUsageService');
        const actualUsage = await UnifiedUsageService.getActualUsage(user.id);
        const planLimits = await UnifiedUsageService.getPlanLimits(user.id);

        // Get total monthly count (across all plans) for continuous receipt numbering
        const { sequelize } = require('../config/database');
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        const [totalMonthlyResult] = await sequelize.query(`
          SELECT
            (SELECT COUNT(*) FROM expenses WHERE "userId" = :userId AND "createdAt" >= :monthStart AND "createdAt" <= :monthEnd) +
            (SELECT COUNT(*) FROM saved_receipts WHERE "userId" = :userId AND "createdAt" >= :monthStart AND "createdAt" <= :monthEnd) as total
        `, {
          replacements: { userId: user.id, monthStart, monthEnd },
          type: sequelize.QueryTypes.SELECT
        });

        const usedTotal = parseInt(totalMonthlyResult.total) || actualUsage.total; // Total receipts this month (continuous count)
        // Use currentPlanTotal for remaining calculation (only current plan receipts count toward limit)
        const usedForLimit = actualUsage.currentPlanTotal !== undefined ? actualUsage.currentPlanTotal : actualUsage.total;
        const remainingReceipts = Math.max(0, planLimits.limit - usedForLimit); // Remaining on current plan only
        const isPro = user.isPro();
        const planType = isPro ? 'PRO' : user.planType.toUpperCase();

      let successMessage;

      if (isPro) {
        // Build usage breakdown for Pro users (may include Trial/Lite receipts)
        const byPlan = actualUsage.byPlan || {};
        const liteLimit = parseInt(process.env.LITE_RECEIPT_LIMIT) || 6;
        const proLimit = parseInt(process.env.PRO_RECEIPT_LIMIT) || 25;

        let usageDetails = '\n\n📊 THIS MONTH:';

        // Show Trial receipts if any (no remaining count - trial doesn't carry forward)
        const trialUsed = byPlan.trial?.total || 0;
        if (trialUsed > 0) {
          usageDetails += `\n• TRIAL receipts: ${trialUsed}`;
        }

        // Check for Lite → Pro upgrade
        if (user.metadata?.liteProUpgrade) {
          // Use ACTUAL database count from byPlan, not the metadata counter
          // The metadata counter can be incorrect due to counting TRIAL receipts
          const liteUsed = byPlan.lite?.total || 0;
          const liteRemaining = Math.max(0, liteLimit - liteUsed);
          const liteCycleEnd = user.metadata.liteProUpgrade.liteBillingCycleEnd ? new Date(user.metadata.liteProUpgrade.liteBillingCycleEnd) : null;
          const liteCycleValid = liteCycleEnd && new Date() < liteCycleEnd;

          // Show Lite usage only if there are Lite receipts this month
          if (liteUsed > 0) {
            if (liteCycleValid) {
              usageDetails += `\n• LITE receipts: ${liteUsed} of ${liteLimit} used`;
            } else {
              usageDetails += `\n• LITE receipts: ${liteUsed} of ${liteLimit} used (plan expired)`;
            }
          }
        }

        // Always show Pro usage
        const proUsed = byPlan.pro?.total || 0;
        const proRemaining = Math.max(0, proLimit - proUsed);
        const remainingText = proRemaining > 0 ? ` (${proRemaining} remaining)` : '';
        usageDetails += `\n• PRO receipts: ${proUsed} of ${proLimit} used${remainingText}`;

        successMessage = `💾 *RECEIPT SAVED!*

This is receipt #${usedTotal} this month.${usageDetails}`;
      } else if (user.planType === 'trial') {
        successMessage = `💾 *EXPENSE SAVED!*

This is your ${usedTotal}${this.getOrdinalSuffix(usedTotal)} receipt overall.

Your ${planType} plan: ${remainingReceipts} receipts remaining total.`;
      } else {
        // Lite plan
        successMessage = `💾 *EXPENSE SAVED!*

This is your receipt #${usedTotal} this month.

Your ${planType} plan: ${remainingReceipts} receipts remaining.`;
      }

      await this.whatsAppService.sendMessage(phoneNumber, successMessage);

      // Check if this was the LAST receipt - show upgrade prompt
      if (remainingReceipts === 0) {
        // Update session state to IDLE BEFORE showing upgrade buttons
        // This ensures button clicks are properly routed
        await this.sessionManager.updateUserState(phoneNumber, USER_STATES.IDLE, {
          currentReceipt: null,
          metadata: {
            menuContext: 'upgrade_prompt',
            postReceiptMenu: false
          }
        });

        if (user.planType === 'trial') {
          // Trial exhausted - show both Lite and Pro upgrade options
          const { formatPrice } = require('../utils/priceFormatter');
          const liteLimit = parseInt(process.env.LITE_RECEIPT_LIMIT);
          const proLimit = parseInt(process.env.PRO_RECEIPT_LIMIT);
          const litePrice = formatPrice(parseInt(process.env.LITE_PLAN_PRICE) || 299);
          const proPrice = formatPrice(parseInt(process.env.PRO_PLAN_PRICE) || 499);

          const upgradeMessage = `🔥 *You're getting the hang of this!*

Ready to keep going? Choose your plan:

💡 *Lite:* ${litePrice}/month (${liteLimit} receipts)
🚀 *Pro:* ${proPrice}/month (${proLimit} receipts)`;

          const upgradeButtons = [
            { id: 'upgrade_lite', text: '💡 Upgrade to Lite' },
            { id: 'upgrade_pro', text: '🚀 Upgrade to Pro' },
            { id: 'main_menu', text: 'Main Menu' }
          ];

          await this.whatsAppService.sendInteractiveButtons(phoneNumber, upgradeMessage, upgradeButtons, 'trial_exhausted_upgrade');

        } else if (user.planType === 'lite') {
          // Lite exhausted - show Pro upgrade only
          const currencySymbol = process.env.CURRENCY_SYMBOL;
          const proLimit = parseInt(process.env.PRO_RECEIPT_LIMIT);
          const proPrice = (parseInt(process.env.PRO_PLAN_PRICE) / 100).toFixed(2);

          const upgradeMessage = `🔥 *Ready for more?*

Upgrade to *Pro:* ${currencySymbol}${proPrice}/month (${proLimit} receipts) 🚀`;

          const upgradeButtons = [
            { id: 'upgrade_pro', text: '🚀 Upgrade to Pro' }
          ];

          await this.whatsAppService.sendInteractiveButtons(phoneNumber, upgradeMessage, upgradeButtons, 'lite_exhausted_upgrade');

        } else if (isPro) {
          // Pro limit reached - just inform them
          const proLimit = parseInt(process.env.PRO_RECEIPT_LIMIT) || 25;
          const limitMessage = `⚠️ *USAGE LIMIT REACHED*

You've used all ${proLimit} receipts this month.

Your limit resets on the 1st of next month.`;

          await this.whatsAppService.sendMessage(phoneNumber, limitMessage);
        }

        // Don't show regular post-receipt menu when limit is reached
        return;
      }

      // Show regular post-receipt buttons if receipts remaining
      const postReceiptOptions = [
        { id: 'generate_report', text: 'Generate Report' },
        { id: 'process_document', text: 'Process New Expense' },
        { id: 'main_menu', text: 'Main Menu' }
      ];

      await this.whatsAppService.sendInteractiveButtons(phoneNumber, 'What would you like to do next?', postReceiptOptions, 'post_receipt');
      await this.sessionManager.updateUserState(phoneNumber, USER_STATES.IDLE, {
        postReceiptMenu: true,
        // Clear receipt choice metadata to prevent context confusion
        awaitingReceiptChoice: false,
        metadata: {
          menuContext: 'post_receipt',
          postReceiptMenu: true
        }
      });

      // currentReceipt already cleared within transaction above

      } catch (successError) {
        // If success message fails, still notify user that save was successful
        console.error('❌ Success message generation failed:', successError);
        await this.whatsAppService.sendMessage(phoneNumber,
          `💾 *EXPENSE SAVED!*\n\nYour expense has been saved successfully.`);
        await this.sessionManager.updateUserState(phoneNumber, USER_STATES.IDLE);
      }
    }
  }

  // Handle retake request
  async handleRetakeRequest(phoneNumber) {
    // Clear current receipt before allowing new upload
    await this.sessionManager.setCurrentReceipt(phoneNumber, null);
    await this.sessionManager.updateUserState(phoneNumber, USER_STATES.IDLE);

    await this.whatsAppService.sendMessage(phoneNumber,
      `📸 *READY FOR NEW EXPENSE*

Please send a new photo or document following the quality tips.

*SUPPORTED FORMATS:*
📄 PDF, JPG, JPEG, PNG, DOCX, WebP`);
  }

  // Error message for confirmation
  async sendConfirmationError(phoneNumber) {
    await this.whatsAppService.sendMessage(phoneNumber,
      `❌ Please use the buttons provided:

[Save This Expense] [Edit Details] [Process New Expense]`);
  }

  // Helper method for ordinal suffix
  getOrdinalSuffix(number) {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const remainder = number % 100;
    return suffixes[(remainder - 20) % 10] || suffixes[remainder] || suffixes[0];
  }
}

module.exports = ConfirmationHandler;