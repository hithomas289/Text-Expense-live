const { USER_STATES, SAVE_RECEIPT_CATEGORIES } = require('../models/database/Session');
const { MESSAGE_COMMANDS } = require('../config/commands');
const { User } = require('../models/database/indexV2');
const SavedReceipt = require('../models/database/SavedReceipt');
const { sequelize } = require('../config/database');
const S3Service = require('../services/S3Service');

class SaveReceiptHandler {
  constructor(whatsAppService, sessionManager) {
    this.whatsAppService = whatsAppService;
    this.sessionManager = sessionManager;
    this.s3Service = new S3Service();
  }

  async initialize() {
    console.log('SaveReceiptHandler initialized');
  }

  // Handle Save Document command from receipt choice
  async handleSaveDocumentCommand(phoneNumber, session = null) {
    console.log(`🚀 [SaveReceiptHandler] handleSaveDocumentCommand called for ${phoneNumber}`);
    try {
      // Get or use provided session
      if (!session) {
        console.log(`📌 [SaveReceiptHandler] No session provided, fetching new session`);
        session = await this.sessionManager.getSession(phoneNumber);
      } else {
        console.log(`📌 [SaveReceiptHandler] Using provided session, state: ${session.state}`);
      }

      console.log(`📝 [SaveReceiptHandler] Updating session state to WAITING_FOR_SAVE_CATEGORY`);
      // Update session state directly (avoid re-acquiring lock)
      // Clear awaitingReceiptChoice flag since user has made their choice
      session.updateState(USER_STATES.WAITING_FOR_SAVE_CATEGORY, {
        awaitingReceiptChoice: false,
        metadata: {
          menuContext: 'save_category_selection',
          saveMode: true
        }
      });

      console.log(`📤 [SaveReceiptHandler] Sending category list to user`);
      // Show save receipt categories
      await this.showSaveCategories(phoneNumber);
      console.log(`✅ [SaveReceiptHandler] handleSaveDocumentCommand completed successfully`);

    } catch (error) {
      console.error('❌ [SaveReceiptHandler] Error in handleSaveDocumentCommand:', error);

      // CRITICAL: Clear currentReceipt on error to prevent stuck state
      try {
        console.log(`🧹 [SaveReceiptHandler] Clearing currentReceipt due to error`);
        await this.sessionManager.updateUserState(phoneNumber, USER_STATES.IDLE, {
          metadata: {},
          currentReceipt: null
        });
      } catch (clearError) {
        console.error('❌ [SaveReceiptHandler] Failed to clear currentReceipt:', clearError);
      }

      await this.whatsAppService.sendMessage(phoneNumber,
        '⚠️ Sorry, something went wrong. Your receipt was not saved. Please try uploading again.');
    }
  }

  // Show save receipt categories
  async showSaveCategories(phoneNumber) {
    const message = `🏷️ *SELECT CATEGORY:*`;

    // Use text-based options since we have 7 categories
    const categoryOptions = SAVE_RECEIPT_CATEGORIES.map((cat, index) => ({
      emoji: cat.emoji,
      name: cat.name,
      text: cat.name
    }));

    await this.whatsAppService.sendTextOptions(phoneNumber, message, categoryOptions);
  }

  // Handle save category selection
  async handleSaveCategorySelection(phoneNumber, categoryIndex, session = null) {
    try {
      // Get or use provided session
      if (!session) {
        session = await this.sessionManager.getSession(phoneNumber);
      }

      // STATE VALIDATION: Check if user is in correct state to select category
      if (session.state !== USER_STATES.WAITING_FOR_SAVE_CATEGORY) {
        console.log(`⚠️ [SaveReceiptHandler] User ${phoneNumber} tried to select category but state is ${session.state}, not WAITING_FOR_SAVE_CATEGORY`);
        await this.whatsAppService.sendMessage(phoneNumber,
          `⚠️ *Please wait for the category menu*

I'm still processing your previous action. Please wait for the category options to appear before making a selection.`);
        return;
      }

      const categoryNum = parseInt(categoryIndex);
      if (isNaN(categoryNum) || categoryNum < 1 || categoryNum > SAVE_RECEIPT_CATEGORIES.length) {
        await this.whatsAppService.sendMessage(phoneNumber,
          `❌ *INVALID CHOICE*

🏷️ *SELECT CATEGORY:*
1️⃣ Insurance Claims
2️⃣ Warranty & Returns
3️⃣ Tax Deductions
4️⃣ Medical Records/Bills
5️⃣ Appliance Maintenance Records
6️⃣ Transportation Pass
7️⃣ Tickets & Reservations
8️⃣ Childcare Records
9️⃣ Custom Category ✏️


Reply with number (1-9):`);
        return;
      }

      const selectedCategory = SAVE_RECEIPT_CATEGORIES[categoryNum - 1];

      // Check if user selected "Custom Category" (category 9) - handles "Custom Category"
      if (categoryNum === 9 || selectedCategory.name.includes('Custom')) {

        await this.whatsAppService.sendMessage(phoneNumber,
          `🏷️ *CUSTOM CATEGORY*

Type any category you want!

*Examples:*
• Legal Documents
• Educational Records
• Investment Papers
• Important Documents

*Type your custom category:*`);

        // Set state to wait for custom category input (use session directly)
        session.updateState(USER_STATES.WAITING_FOR_CUSTOM_SAVE_CATEGORY, {
          metadata: {
            saveMode: true
          }
        });
        return;
      }

      await this.whatsAppService.sendMessage(phoneNumber,
        `✅ Category: ${selectedCategory.name}`);

      // Store selected category and ask for description (use session directly)
      session.updateState(USER_STATES.WAITING_FOR_RECEIPT_DESCRIPTION, {
        metadata: {
          saveMode: true,
          selectedCategory: selectedCategory.name
        }
      });

      // Ask for description
      await this.askForDescription(phoneNumber);

    } catch (error) {
      console.error('Error in handleSaveCategorySelection:', error);

      // CRITICAL: Clear currentReceipt on error to prevent stuck state
      try {
        console.log(`🧹 [SaveReceiptHandler] Clearing currentReceipt due to category selection error`);
        await this.sessionManager.updateUserState(phoneNumber, USER_STATES.IDLE, {
          metadata: {},
          currentReceipt: null
        });
      } catch (clearError) {
        console.error('❌ [SaveReceiptHandler] Failed to clear currentReceipt:', clearError);
      }

      await this.whatsAppService.sendMessage(phoneNumber,
        '⚠️ Sorry, something went wrong. Your receipt was not saved. Please try uploading again.');
    }
  }

  // Handle custom save category input (when user types their own category after selecting "Other")
  async handleCustomSaveCategoryInput(phoneNumber, input) {
    try {
      // Validate custom category input
      const customCategory = input.trim();
      if (!customCategory || customCategory.length < 2) {
        await this.whatsAppService.sendMessage(phoneNumber,
          `❌ Category name too short. Please enter at least 2 characters.

*Type your custom category:*`);
        return;
      }

      if (customCategory.length > 50) {
        await this.whatsAppService.sendMessage(phoneNumber,
          `❌ Category name too long. Please keep it under 50 characters.

*Type your custom category:*`);
        return;
      }

      // Convert to title case for consistency
      const formattedCategory = customCategory.charAt(0).toUpperCase() + customCategory.slice(1).toLowerCase();


      await this.whatsAppService.sendMessage(phoneNumber,
        `✅ *CUSTOM CATEGORY SET*

Category: "${formattedCategory}"`);

      // Store custom category and move to description input
      await this.sessionManager.updateUserState(phoneNumber, USER_STATES.WAITING_FOR_RECEIPT_DESCRIPTION, {
        metadata: {
          saveMode: true,
          selectedCategory: formattedCategory
        }
      });

      // Ask for description
      await this.askForDescription(phoneNumber);

    } catch (error) {
      console.error('Error handling custom save category input:', error);

      // CRITICAL: Clear currentReceipt on error to prevent stuck state
      try {
        console.log(`🧹 [SaveReceiptHandler] Clearing currentReceipt due to custom category error`);
        await this.sessionManager.updateUserState(phoneNumber, USER_STATES.IDLE, {
          metadata: {},
          currentReceipt: null
        });
      } catch (clearError) {
        console.error('❌ [SaveReceiptHandler] Failed to clear currentReceipt:', clearError);
      }

      await this.whatsAppService.sendMessage(phoneNumber,
        '⚠️ Sorry, something went wrong. Your receipt was not saved. Please try uploading again.');
    }
  }

  // Ask user for receipt description
  async askForDescription(phoneNumber) {
    const message = `*WHAT'S THIS RECEIPT?*

(write description for you to remember later)

Examples:
- "Laptop 2-year warranty"
- "Fridge extended protection"
- "iPhone AppleCare"

*Type description:*`;

    await this.whatsAppService.sendMessage(phoneNumber, message);
  }

  // Handle receipt description input
  async handleDescriptionInput(phoneNumber, description) {
    try {
      const session = await this.sessionManager.getSession(phoneNumber);

      // VALIDATION: Check if description is meaningful (at least 2 characters, not just special chars)
      const trimmedDescription = description.trim();
      if (!trimmedDescription || trimmedDescription.length < 2) {
        await this.whatsAppService.sendMessage(phoneNumber,
          `❌ *Description too short*

Please provide a meaningful description (at least 2 characters).

Examples:
- "Laptop 2-year warranty"
- "Fridge extended protection"
- "iPhone AppleCare"

*Type description:*`);
        return;
      }

      // Check if description is just special characters or single letter
      if (/^[^\w\s]+$/.test(trimmedDescription) || /^[?!.@#$%^&*()]+$/.test(trimmedDescription)) {
        await this.whatsAppService.sendMessage(phoneNumber,
          `❌ *Invalid description*

Please provide a meaningful description, not just special characters.

Examples:
- "Laptop 2-year warranty"
- "Fridge extended protection"
- "iPhone AppleCare"

*Type description:*`);
        return;
      }

      // Check both levels for metadata (might be nested)
      const saveMode = session.metadata?.saveMode || session.metadata?.metadata?.saveMode;
      const selectedCategory = session.metadata?.selectedCategory || session.metadata?.metadata?.selectedCategory;


      if (!saveMode || !selectedCategory) {
        await this.whatsAppService.sendMessage(phoneNumber,
          'Sorry, something went wrong. Please start over.');
        return;
      }

      // Check both locations for currentReceipt (might be nested in metadata)
      const currentReceipt = session.currentReceipt || session.metadata?.currentReceipt;

      if (!currentReceipt || !currentReceipt.filePath) {
        await this.whatsAppService.sendMessage(phoneNumber,
          'No receipt file found. Please upload a receipt first.');
        return;
      }


      // Check saved receipts quota using UnifiedUsageService (handles upgrade logic)
      try {
        const UnifiedUsageService = require('../services/UnifiedUsageService');
        const User = require('../models/database/User');

        // Get user first - try both formats
        let user = await User.findByPhoneNumber(phoneNumber);

        if (!user) {
          throw new Error('User not found');
        }

        // Use UnifiedUsageService for accurate limit checking (respects upgrades)
        const usageCheck = await UnifiedUsageService.canProcessReceipt(user.id);

        if (!usageCheck.canProcess) {
          // Get user's plan type for appropriate messaging
          const planType = usageCheck.planType || 'trial';
          const currencySymbol = process.env.CURRENCY_SYMBOL;
          const trialLimit = parseInt(process.env.TRIAL_RECEIPT_LIMIT);
          const liteLimit = parseInt(process.env.LITE_RECEIPT_LIMIT);
          const proLimit = parseInt(process.env.PRO_RECEIPT_LIMIT);
          const litePrice = (parseInt(process.env.LITE_PLAN_PRICE) / 100).toFixed(2);
          const proPrice = (parseInt(process.env.PRO_PLAN_PRICE) / 100).toFixed(2);

          let limitMessage, buttons;

          if (planType === 'trial') {
            limitMessage = `❌ *TRIAL EXPIRED*

You've used your ${trialLimit} free trial receipts (for processing and saving combined).

Upgrade to continue:
• Lite: ${currencySymbol}${litePrice}/month (${liteLimit} receipts total)
• PRO: ${currencySymbol}${proPrice}/month (${proLimit} receipts total)`;

            buttons = [
              { id: 'upgrade_lite', text: `Upgrade to Lite ${currencySymbol}${litePrice}/month` },
              { id: 'upgrade_pro', text: `Upgrade to PRO ${currencySymbol}${proPrice}/month` },
              { id: 'main_menu', text: 'Main Menu' }
            ];
          } else if (planType === 'lite') {
            limitMessage = `❌ *MONTHLY LIMIT REACHED*

You've used all ${liteLimit} receipts this month (for processing and saving combined).

Upgrade to PRO for ${proLimit} receipts/month?`;

            buttons = [
              { id: 'upgrade_pro', text: `Upgrade to PRO ${currencySymbol}${proPrice}/month` },
              { id: 'main_menu', text: 'Main Menu' }
            ];
          } else {
            limitMessage = `❌ *PRO LIMIT REACHED*

You've used all ${proLimit} receipts this month (for processing and saving combined).

Limit resets next month.`;

            buttons = [
              { id: 'main_menu', text: 'Main Menu' }
            ];
          }

          await this.whatsAppService.sendMessage(phoneNumber, limitMessage);
          await this.whatsAppService.sendInteractiveButtons(phoneNumber, 'What would you like to do?', buttons, 'save_limit_reached');

          await this.sessionManager.updateUserState(phoneNumber, USER_STATES.IDLE);
          return;
        }

        // No need to store references - UnifiedUsageService queries database directly

      } catch (error) {
        console.error('❌ Failed to check quota with unified system, falling back to User model:', error);
        // Fallback to User model hasReachedLimit (which uses UsageLimitV2)
        const userData = await User.findByPhoneNumber(phoneNumber);
        if (await userData.hasReachedLimit()) {
          // Get user's plan type for appropriate messaging
          const planType = userData.planType || 'trial';

          let limitMessage, buttons;

          const currencySymbol = process.env.CURRENCY_SYMBOL;
          const trialLimit = parseInt(process.env.TRIAL_RECEIPT_LIMIT);
          const liteLimit = parseInt(process.env.LITE_RECEIPT_LIMIT);
          const proLimit = parseInt(process.env.PRO_RECEIPT_LIMIT);
          const litePrice = (parseInt(process.env.LITE_PLAN_PRICE) / 100).toFixed(2);
          const proPrice = (parseInt(process.env.PRO_PLAN_PRICE) / 100).toFixed(2);

          if (planType === 'trial') {
            limitMessage = `❌ *TRIAL EXPIRED*

You've used your ${trialLimit} free trial saved receipts.

Upgrade to continue:
• Lite: ${currencySymbol}${litePrice}/month (${liteLimit} saved receipts)
• PRO: ${currencySymbol}${proPrice}/month (${proLimit} saved receipts)`;

            buttons = [
              { id: 'upgrade_lite', text: `Upgrade to Lite ${currencySymbol}${litePrice}/month` },
              { id: 'upgrade_pro', text: `Upgrade to PRO ${currencySymbol}${proPrice}/month` },
              { id: 'main_menu', text: 'Main Menu' }
            ];
          } else if (planType === 'lite') {
            limitMessage = `❌ *MONTHLY LIMIT REACHED*

You've used all ${liteLimit} Lite saved receipts this month.

Upgrade to PRO for ${proLimit} saved receipts/month?`;

            buttons = [
              { id: 'upgrade_pro', text: `Upgrade to PRO ${currencySymbol}${proPrice}/month` },
              { id: 'main_menu', text: 'Main Menu' }
            ];
          } else {
            const proLimit = parseInt(process.env.PRO_RECEIPT_LIMIT) || 25;
            limitMessage = `❌ *PRO LIMIT REACHED*

You've used all ${proLimit} saved receipts this month.

Limit resets next month.`;

            buttons = [
              { id: 'main_menu', text: 'Main Menu' }
            ];
          }

          await this.whatsAppService.sendMessage(phoneNumber, limitMessage);
          await this.whatsAppService.sendInteractiveButtons(phoneNumber, 'What would you like to do?', buttons, 'save_limit_reached');

          await this.sessionManager.updateUserState(phoneNumber, USER_STATES.IDLE);
          return;
        }
      }

      // Save receipt to database
      await this.saveReceiptToVault(phoneNumber, selectedCategory, description.trim(), currentReceipt);

    } catch (error) {
      console.error('Error in handleDescriptionInput:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        phoneNumber,
        description
      });
      await this.whatsAppService.sendMessage(phoneNumber,
        `Sorry, something went wrong: ${error.message}. Please try again.`);
    }
  }

  // Save receipt to vault
  async saveReceiptToVault(phoneNumber, category, description, receiptData) {
    const transaction = await sequelize.transaction();

    try {
      // Get user data
      const userData = await User.findByPhoneNumber(phoneNumber);
      if (!userData) {
        throw new Error('User not found');
      }

      // Validate receipt data
      if (!receiptData || !receiptData.filePath) {
        throw new Error('No receipt file found to upload');
      }

      let s3Data = null;

      try {
        // Upload file to S3 now that receipt is being saved to vault
        const fs = require('fs').promises;

        // Check if file exists before trying to read it
        try {
          await fs.access(receiptData.filePath);
        } catch (accessError) {
          if (accessError.code === 'ENOENT') {
            await transaction.rollback();

            // For Excel functionality, every receipt MUST have S3 URL
            // Show user-friendly error message asking for re-upload
            await this.whatsAppService.sendMessage(phoneNumber,
              `⏰ *Receipt File Expired*

Your receipt file has expired and was removed from our server.

*What happened?*
Receipt files are kept for 60 minutes. If not saved within that time, they're automatically deleted.

*Please upload your receipt again.*`);

            // Set up for new upload with command options
            const message = `*Choose what to do:*`;
            const options = [
              { id: 'process_document', text: 'Upload New Receipt' },
              { id: 'main_menu', text: 'Main Menu' }
            ];

            await this.whatsAppService.sendInteractiveButtons(phoneNumber, message, options, 'missing_file_handling');

            // Update state to wait for file upload and clear the expired receipt
            await this.sessionManager.updateUserState(phoneNumber, USER_STATES.IDLE, {
              currentReceipt: null,
              metadata: {
                menuContext: 'missing_file_handling',
                awaitingFileUpload: true
              }
            });

            return; // Stop processing
          }
          throw accessError;
        }

        const fileBuffer = await fs.readFile(receiptData.filePath);

        s3Data = await this.s3Service.uploadReceiptFile(
          phoneNumber,
          fileBuffer,
          receiptData.originalFilename || receiptData.filename,
          receiptData.fileType || receiptData.mimeType
        );

        if (!s3Data || !s3Data.success) {
          throw new Error(`S3 upload failed: ${s3Data?.error || 'Unknown error'}`);
        }
      } catch (uploadError) {
        await transaction.rollback();
        throw new Error(`Failed to upload receipt to S3: ${uploadError.message}`);
      }

      try {
        // Determine which plan quota to consume (Lite first for Lite→Pro upgrades)
        const UnifiedUsageService = require('../services/UnifiedUsageService');
        let planTypeToConsume = await UnifiedUsageService.getPlanTypeToConsume(userData.id);

        // STRICT VALIDATION: planType must NEVER be null/undefined
        if (!planTypeToConsume) {
          console.error(`❌ CRITICAL: planType is NULL for user ${userData.id}! Setting to 'trial' as fallback.`);
          planTypeToConsume = 'trial';
        }

        console.log(`✅ Saving receipt with planType: ${planTypeToConsume}`);

        // Save to database using the new S3 data
        const savedReceipt = await SavedReceipt.create({
          userId: userData.id,
          category: category,
          description: description,
          originalFilename: receiptData.originalFilename || 'receipt.pdf',
          s3Key: s3Data.s3Key,
          s3Bucket: s3Data.s3Bucket,
          fileSize: receiptData.fileSize || 0,
          mimeType: receiptData.fileType || 'application/pdf',
          downloadUrl: s3Data.url,
          uploadDate: new Date(),
          isActive: true,
          planType: planTypeToConsume // Consume Lite first for Lite→Pro upgrades
        }, { transaction });

        // Increment usage counter for saved receipts
        // NOTE: SaveReceipt flow is different - no OCR/AI processing, just file storage
        // Usage is counted here when document is successfully saved
        await userData.incrementReceiptUsage({ transaction });

        // Metadata counter removed - we now query database directly for accurate counts
        console.log(`📊 Receipt saved to vault with planType=${planTypeToConsume} - User ${userData.id} usage incremented`);

        // Commit transaction
        await transaction.commit();

      } catch (dbError) {
        await transaction.rollback();
        throw new Error(`Failed to save receipt to database: ${dbError.message}`);
      }

      // Show success message
      await this.showSaveSuccessMessage(phoneNumber, category, description, userData);

      // Clear current receipt from top-level column
      await this.sessionManager.setCurrentReceipt(phoneNumber, null);

      // Update state to SAME as process expense
      await this.sessionManager.updateUserState(phoneNumber, USER_STATES.IDLE, {
        metadata: {
          postReceiptMenu: true,
          menuContext: 'post_receipt'
        }
      });

    } catch (error) {
      console.error('Error saving receipt to vault:', error);
      console.error('Vault save error details:', {
        message: error.message,
        stack: error.stack,
        phoneNumber,
        category,
        description,
        receiptData
      });
      await this.whatsAppService.sendMessage(phoneNumber,
        `Sorry, failed to save receipt: ${error.message}`);
      throw error; // Re-throw to be caught by handleDescriptionInput
    }
  }

  // Show save success message
  async showSaveSuccessMessage(phoneNumber, category, description, userData) {
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Get remaining receipts using UnifiedUsageService (handles upgrade logic)
    let remaining;
    let usedCount;
    let monthlyReceiptNumber;
    let usageDetails;
    try {
      const UnifiedUsageService = require('../services/UnifiedUsageService');
      const User = require('../models/database/User');
      const { sequelize } = require('../config/database');

      let user = await User.findByPhoneNumber(userData.phoneNumber);

      if (!user) {
        throw new Error('User not found');
      }

      // Get fresh usage count directly from database AFTER the receipt was saved
      const actualUsage = await UnifiedUsageService.getActualUsage(user.id);
      const planLimits = await UnifiedUsageService.getPlanLimits(user.id);

      // Get total monthly count (across all plans) for continuous receipt numbering
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

      monthlyReceiptNumber = parseInt(totalMonthlyResult.total) || actualUsage.total;

      // Build usage breakdown message
      const byPlan = actualUsage.byPlan || {};
      const liteLimit = parseInt(process.env.LITE_RECEIPT_LIMIT) || 6;
      const proLimit = parseInt(process.env.PRO_RECEIPT_LIMIT) || 25;

      usageDetails = '';

      // Check for Pro plan (may include Trial/Lite receipts)
      if (user.planType === 'pro') {
        usageDetails = '\n\n📊 THIS MONTH:';

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
      } else {
        // Regular plan - no upgrade scenario
        const usedForLimit = actualUsage.currentPlanTotal !== undefined ? actualUsage.currentPlanTotal : actualUsage.total;
        remaining = Math.max(0, planLimits.limit - usedForLimit);
        usageDetails = `\nYour ${userData.planType.toUpperCase()} plan: ${remaining} receipts remaining.`;
      }

      usedCount = actualUsage.total;
    } catch (error) {
      // Fallback to User model
      remaining = await userData.getRemainingReceipts();
      usedCount = (await userData.getMonthlyLimits()).expenses - remaining;
      monthlyReceiptNumber = usedCount;
      usageDetails = `\nYour ${userData.planType.toUpperCase()} plan: ${remaining} receipts remaining.`;
    }

    // Show continuous monthly count with current plan remaining
    const message = `💾 *RECEIPT SAVED TO YOUR VAULT!*

This is receipt #${monthlyReceiptNumber} this month.
${usageDetails || `\nYour ${userData.planType.toUpperCase()} plan: ${remaining} receipts remaining`}`;

    await this.whatsAppService.sendMessage(phoneNumber, message);

    // Check if this was the LAST receipt - show upgrade prompt
    if (remaining === 0) {
      const User = require('../models/database/User');
      const user = await User.findByPhoneNumber(phoneNumber);

      // Update session state to IDLE BEFORE showing upgrade buttons
      // This ensures button clicks are properly routed
      await this.sessionManager.updateUserState(phoneNumber, USER_STATES.IDLE, {
        currentReceipt: null,
        metadata: {
          menuContext: 'upgrade_prompt',
          postReceiptMenu: false
        }
      });

      if (user && user.planType === 'trial') {
        // Trial exhausted - show both Lite and Pro upgrade options
        const { formatPrice } = require('../utils/priceFormatter');
        const liteLimit = parseInt(process.env.LITE_RECEIPT_LIMIT) || 5;
        const proLimit = parseInt(process.env.PRO_RECEIPT_LIMIT) || 25;
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

      } else if (user && user.planType === 'lite') {
        // Lite exhausted - show Pro upgrade only
        const proLimit = parseInt(process.env.PRO_RECEIPT_LIMIT) || 25;
        const proPrice = (parseInt(process.env.PRO_PLAN_PRICE) / 100).toFixed(2);

        const upgradeMessage = `🔥 *Ready for more?*

Upgrade to *Pro:* $${proPrice}/month (${proLimit} receipts) 🚀`;

        const upgradeButtons = [
          { id: 'upgrade_pro', text: '🚀 Upgrade to Pro' }
        ];

        await this.whatsAppService.sendInteractiveButtons(phoneNumber, upgradeMessage, upgradeButtons, 'lite_exhausted_upgrade');

      } else if (user && user.isPro && user.isPro()) {
        // Pro limit reached - just inform them
        const limitMessage = `⚠️ *USAGE LIMIT REACHED*

You've used all ${totalLimit} receipts this month.

Your limit resets on the 1st of next month.`;

        await this.whatsAppService.sendMessage(phoneNumber, limitMessage);
      }

      // Don't show regular post-receipt menu when limit is reached
      return;
    }

    // Use SAME post-receipt options as process expense if receipts remaining
    await this.showPostReceiptOptions(phoneNumber);
  }

  // Use SAME post-receipt options as process expense with interactive buttons
  async showPostReceiptOptions(phoneNumber) {
    const postReceiptOptions = [
      { id: 'generate_report', text: 'Generate Report' },
      { id: 'process_document', text: 'Process New Expense' },
      { id: 'main_menu', text: 'Main Menu' }
    ];

    await this.whatsAppService.sendInteractiveButtons(phoneNumber, 'What would you like to do next?', postReceiptOptions, 'post_receipt_vault');
  }


  // Handle document upload for save mode
  async handleDocumentUploadForSave(phoneNumber, message) {
    try {
      // FIRST: Check for receipt conflict - block if user has unsaved receipt
      const session = await this.sessionManager.getSession(phoneNumber);
      console.log(`🔍 [SaveReceipt] Checking for receipt conflict. session.currentReceipt:`, session.currentReceipt ? 'EXISTS' : 'NULL');

      if (session.currentReceipt) {
        console.log(`⚠️ [SaveReceipt] CONFLICT DETECTED: User has unsaved receipt, showing conflict message`);
        // Call DocumentProcessingHandler's conflict method
        const DocumentProcessingHandler = require('./DocumentProcessingHandler');
        const docHandler = new DocumentProcessingHandler(this.whatsAppService, this.sessionManager);
        await docHandler.sendReceiptConflictMessage(phoneNumber, session.currentReceipt);
        return;
      }

      console.log(`✅ [SaveReceipt] No conflict - proceeding with save flow`);

      // SECOND: Check shared quota using UnifiedUsageService (handles upgrade logic)
      try {
        const UnifiedUsageService = require('../services/UnifiedUsageService');
        const User = require('../models/database/User');

        // Get user
        let user = await User.findByPhoneNumber(phoneNumber);

        if (!user) {
          throw new Error('User not found');
        }

        // Use UnifiedUsageService for accurate limit checking (respects upgrades)
        const usageCheck = await UnifiedUsageService.canProcessReceipt(user.id);

        if (!usageCheck.canProcess) {
          // Get user's plan type for appropriate messaging
          const planType = usageCheck.planType || 'trial';
          const currencySymbol = process.env.CURRENCY_SYMBOL;
          const trialLimit = parseInt(process.env.TRIAL_RECEIPT_LIMIT);
          const liteLimit = parseInt(process.env.LITE_RECEIPT_LIMIT);
          const proLimit = parseInt(process.env.PRO_RECEIPT_LIMIT);
          const litePrice = (parseInt(process.env.LITE_PLAN_PRICE) / 100).toFixed(2);
          const proPrice = (parseInt(process.env.PRO_PLAN_PRICE) / 100).toFixed(2);

          let limitMessage, buttons;

          if (planType === 'trial') {
            limitMessage = `❌ *TRIAL EXPIRED*

You've used your ${trialLimit} free trial receipts (for processing and saving combined).

Upgrade to continue:
• Lite: ${currencySymbol}${litePrice}/month (${liteLimit} receipts total)
• PRO: ${currencySymbol}${proPrice}/month (${proLimit} receipts total)`;

            buttons = [
              { id: 'upgrade_lite', text: `Upgrade to Lite ${currencySymbol}${litePrice}/month` },
              { id: 'upgrade_pro', text: `Upgrade to PRO ${currencySymbol}${proPrice}/month` },
              { id: 'main_menu', text: 'Main Menu' }
            ];
          } else if (planType === 'lite') {
            limitMessage = `❌ *MONTHLY LIMIT REACHED*

You've used all ${liteLimit} receipts this month (for processing and saving combined).

Upgrade to PRO for ${proLimit} receipts/month?`;

            buttons = [
              { id: 'upgrade_pro', text: `Upgrade to PRO ${currencySymbol}${proPrice}/month` },
              { id: 'main_menu', text: 'Main Menu' }
            ];
          } else {
            limitMessage = `❌ *PRO LIMIT REACHED*

You've used all ${proLimit} receipts this month (for processing and saving combined).

Limit resets next month.`;

            buttons = [
              { id: 'main_menu', text: 'Main Menu' }
            ];
          }

          await this.whatsAppService.sendMessage(phoneNumber, limitMessage);
          await this.whatsAppService.sendInteractiveButtons(phoneNumber, 'What would you like to do?', buttons, 'save_limit_reached');
          return;
        }

      } catch (error) {
        console.error('❌ Failed to check shared quota, falling back to legacy:', error);
        // Fallback to User model hasReachedLimit (which uses UsageLimitV2)
        const userData = await User.findByPhoneNumber(phoneNumber);
        if (await userData.hasReachedLimit()) {
        // Get user's plan type for appropriate messaging
        const planType = userData.planType || 'trial';

        let limitMessage, buttons;

        if (planType === 'trial') {
          const trialLimit = parseInt(process.env.TRIAL_RECEIPT_LIMIT) || 5;
          const liteLimit = parseInt(process.env.LITE_RECEIPT_LIMIT) || 6;
          const proLimit = parseInt(process.env.PRO_RECEIPT_LIMIT) || 25;
          const { formatPrice } = require('../utils/priceFormatter');
          const litePrice = formatPrice(parseInt(process.env.LITE_PLAN_PRICE) || 299);
          const proPrice = formatPrice(parseInt(process.env.PRO_PLAN_PRICE) || 499);

          limitMessage = `❌ *TRIAL EXPIRED*

You've used your ${trialLimit} free trial saved receipts.

Upgrade to continue:
• Lite: ${litePrice}/month (${liteLimit} saved receipts)
• PRO: ${proPrice}/month (${proLimit} saved receipts)`;

          buttons = [
            { id: 'upgrade_lite', text: `Upgrade to Lite ${litePrice}/month` },
            { id: 'upgrade_pro', text: `Upgrade to PRO ${proPrice}/month` },
            { id: 'main_menu', text: 'Main Menu' }
          ];
        } else if (planType === 'lite') {
          const liteLimit = parseInt(process.env.LITE_RECEIPT_LIMIT) || 6;
          const proLimit = parseInt(process.env.PRO_RECEIPT_LIMIT) || 25;
          const { formatPrice } = require('../utils/priceFormatter');
          const proPrice = formatPrice(parseInt(process.env.PRO_PLAN_PRICE) || 499);

          limitMessage = `❌ *MONTHLY LIMIT REACHED*

You've used all ${liteLimit} Lite saved receipts this month.

Upgrade to PRO for ${proLimit} saved receipts/month?`;

          buttons = [
            { id: 'upgrade_pro', text: `Upgrade to PRO ${proPrice}/month` },
            { id: 'main_menu', text: 'Main Menu' }
          ];
        } else {
          const proLimit = parseInt(process.env.PRO_RECEIPT_LIMIT) || 25;

          limitMessage = `❌ *PRO LIMIT REACHED*

You've used all ${proLimit} saved receipts this month.

Limit resets next month.`;

          buttons = [
            { id: 'main_menu', text: 'Main Menu' }
          ];
        }

        await this.whatsAppService.sendMessage(phoneNumber, limitMessage);
        await this.whatsAppService.sendInteractiveButtons(phoneNumber, 'What would you like to do?', buttons, 'save_limit_reached');
        return;
        }
      }

      // Show receipt choice menu
      await this.showReceiptChoiceMenu(phoneNumber, message);

    } catch (error) {
      console.error('Error in handleDocumentUploadForSave:', error);
      await this.whatsAppService.sendMessage(phoneNumber,
        'Sorry, something went wrong processing your document.');
    }
  }

  // Show Process vs Save choice menu after receipt upload
  async showReceiptChoiceMenu(phoneNumber, message) {
    const choiceMessage = `📄 Got your receipt!

*WHAT DO YOU NEED?*`;

    const options = [
      { name: '1️⃣ Process Expense', id: 'process_expense' },
      { name: '2️⃣ Save Expense', id: 'save_expense' }
    ];

    await this.whatsAppService.sendOptions(phoneNumber, choiceMessage, options, 'receipt_choice');

    // Update session to wait for choice
    await this.sessionManager.updateUserState(phoneNumber, USER_STATES.IDLE, {
      metadata: {
        menuContext: 'receipt_choice',
        awaitingReceiptChoice: true
      }
    });
  }
}

module.exports = SaveReceiptHandler;