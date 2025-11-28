const { USER_STATES } = require('../models/database/Session');
const { MESSAGE_COMMANDS } = require('../config/commands');

class MenuHandler {
  constructor(whatsAppService, sessionManager) {
    this.whatsAppService = whatsAppService;
    this.sessionManager = sessionManager;
  }

  // Get consistent subscription information across all displays - DYNAMIC VERSION
  async getSubscriptionInfo(phoneNumber) {
    try {
      const session = await this.sessionManager.getSession(phoneNumber);
      const subscription = session.subscription;

      // Get user from database for billing cycle dates
      const { User } = require('../models/database/indexV2');
      const user = await User.findByPhoneNumber(phoneNumber);

      // Get plan configuration from environment variables
      const planType = subscription?.planType || user?.planType || 'trial';

      let planPrice, planName, benefits, limits;

      // Configure based on plan type
      if (planType === 'pro') {
        planPrice = parseInt(process.env.PRO_PLAN_PRICE);
        planName = 'TextExpense PRO';
        limits = parseInt(process.env.PRO_RECEIPT_LIMIT);
        benefits = [
          `${limits} receipts per month`,
          '3-months expense history',
          'Priority processing',
          'Email support'
        ];
      } else if (planType === 'lite') {
        planPrice = parseInt(process.env.LITE_PLAN_PRICE);
        planName = 'TextExpense Lite';
        limits = parseInt(process.env.LITE_RECEIPT_LIMIT);
        benefits = [
          `${limits} receipts per month`,
          '1-month expense history',
          'Standard processing',
          'WhatsApp support'
        ];
      } else {
        planPrice = 0;
        planName = 'Free Trial';
        limits = parseInt(process.env.TRIAL_RECEIPT_LIMIT);
        benefits = [
          `${limits} uploads (one-time trial)`,
          'Basic processing',
          'WhatsApp support'
        ];
      }

      let nextBilling = 'Unknown';
      let status = 'Active';

      console.log(`🔍 Getting billing info for ${phoneNumber}:`, {
        hasUser: !!user,
        hasBillingCycleEnd: !!user?.billingCycleEnd,
        billingCycleEnd: user?.billingCycleEnd,
        subscriptionStatus: user?.subscriptionStatus,
        stripeSubscriptionId: user?.stripeSubscriptionId || subscription?.stripeSubscriptionId
      });

      // Check if subscription is cancelled/canceling
      const isCancelled = user?.subscriptionStatus === 'canceling' || user?.subscriptionStatus === 'canceled';

      // Priority 1: Use billingCycleEnd from database (most reliable)
      if (user?.billingCycleEnd) {
        nextBilling = new Date(user.billingCycleEnd).toDateString();
        console.log(`✅ Using billingCycleEnd from database: ${nextBilling}`);
      } else if (subscription?.stripeSubscriptionId || user?.stripeSubscriptionId) {
        // Priority 2: Try to get from Stripe API
        const stripeSubId = user?.stripeSubscriptionId || subscription?.stripeSubscriptionId;
        const StripeService = require('../payments/stripe/StripeService');
        const stripeService = new StripeService();
        const stripeData = await stripeService.getSubscriptionStatus(stripeSubId);

        if (stripeData.success) {
          nextBilling = stripeData.currentPeriodEnd.toDateString();
          status = stripeData.status === 'active' ? 'Active ✅' : stripeData.status;
          console.log(`✅ Using Stripe API data: ${nextBilling}`);
        } else {
          console.warn(`⚠️ Failed to get from Stripe: ${stripeData.error}`);
        }
      } else if (user?.billingCycleStart) {
        // Priority 3: Calculate from billing cycle start
        const cycleStart = new Date(user.billingCycleStart);
        nextBilling = new Date(cycleStart.getTime() + 30 * 24 * 60 * 60 * 1000).toDateString();
        console.log(`✅ Calculated from billingCycleStart: ${nextBilling}`);
      } else if (subscription?.endDate) {
        // Priority 4: Fallback to stored endDate
        nextBilling = new Date(subscription.endDate).toDateString();
        console.log(`✅ Using subscription.endDate: ${nextBilling}`);
      } else if (subscription?.startDate) {
        // Priority 5: Final fallback - calculate from start date
        nextBilling = new Date(new Date(subscription.startDate).getTime() + 30 * 24 * 60 * 60 * 1000).toDateString();
        console.log(`✅ Calculated from subscription.startDate: ${nextBilling}`);
      } else {
        console.warn(`⚠️ No billing date source found, returning Unknown`);
      }

      // Handle trial status
      if (planType === 'trial') {
        status = subscription?.isTrialExpired ? 'Trial Expired' : 'Trial Active';
        nextBilling = 'N/A (One-time trial)';
      } else if (isCancelled) {
        // Handle cancelled subscriptions
        status = 'Cancelling';
        nextBilling = `Expires: ${nextBilling}`;
      }

      const currencySymbol = process.env.CURRENCY_SYMBOL;
      const price = planPrice === 0 ? 'Free' : `${currencySymbol}${(planPrice / 100).toFixed(2)}/mo`;

      return {
        status,
        nextBilling,
        planName,
        planType,
        price,
        benefits
      };
    } catch (error) {
      console.error('Error getting subscription info:', error);
      // Fallback to trial defaults
      return {
        status: 'Trial Active',
        nextBilling: 'N/A',
        planName: 'Free Trial',
        planType: 'trial',
        price: 'Free',
        benefits: [
          '5 uploads (one-time trial)',
          'Basic processing',
          'WhatsApp support'
        ]
      };
    }
  }

  // Handle main menu display and flow - WHATSAPP LIST
  async handleMainMenuFlow(phoneNumber, session = null) {
    if (!session) {
      session = await this.sessionManager.getSession(phoneNumber);
    }

    // FIRST: Check for unsaved receipt before showing main menu
    if (session.currentReceipt) {
      await this.sendUnsavedReceiptWarning(phoneNumber, session.currentReceipt);
      return;
    }

    // Check user's current plan
    const planLimits = await this.sessionManager.checkPlanLimits(phoneNumber);
    const subscriptionInfo = await this.getSubscriptionInfo(phoneNumber);
    const currentPlan = subscriptionInfo.planType;

    const menuMessage = `What would you like to do?`;

    const menuOptions = [
      { id: 'process_document', title: 'Process Receipts', description: 'Upload receipts/documents' },
      { id: 'generate_report', title: 'Generate Report', description: 'All your receipts in one place' },
      { id: 'view_summary', title: 'View Summary', description: 'See overview' },
      { id: 'set_currency', title: '💱 Set Default Currency', description: 'Choose your preferred currency' },
      { id: 'share_colleagues', title: '🚀Share the Secret', description: 'Share TextExpense with others' },
      { id: 'how_it_works', title: 'How It Works', description: 'Learn how to use TextExpense' },
      { id: 'contact_support', title: 'Support', description: 'Get help with issues' }
    ];

    // Add upgrade/management options based on current plan
    if (currentPlan === 'trial') {
      menuOptions.push({ id: 'upgrade_account', title: 'Upgrade Plan', description: 'Choose Lite or PRO plan to continue' });
    } else if (currentPlan === 'free') {
      menuOptions.push({ id: 'upgrade_account', title: 'Upgrade Plan', description: 'Get Lite or PRO to process receipts' });
    } else if (currentPlan === 'lite') {
      const proLimit = parseInt(process.env.PRO_RECEIPT_LIMIT) || 25;
      menuOptions.push({ id: 'upgrade_to_pro', title: 'Upgrade to PRO', description: `${proLimit} receipts/month + more features` });
      menuOptions.push({ id: 'manage_subscription', title: 'Manage Subscription', description: 'View your Lite plan details' });
    } else if (currentPlan === 'pro') {
      menuOptions.push({ id: 'manage_subscription', title: 'Manage Subscription', description: 'View your PRO plan details and billing' });
    } else {
      // Fallback for unknown plan types
      menuOptions.push({ id: 'upgrade_account', title: 'Upgrade Plan', description: 'Upgrade to continue using TextExpense' });
    }

    const response = await this.whatsAppService.sendInteractiveList(phoneNumber, menuMessage, menuOptions, 'Main Menu Options', 'MAIN MENU');
    
    // Reset session state to IDLE and clear all editing metadata to prevent "Edit Details" issues
    await this.sessionManager.updateUserState(phoneNumber, USER_STATES.IDLE, { 
      menuContext: 'main_menu',
      editingMode: false,
      continueEditing: false,
      editingField: null,
      originalReceipt: null,
      postReceiptMenu: false,
      latestMessageId: response?.latestMessageId
    });
  }

  // Handle idle state input
  async handleIdleInput(phoneNumber, input, session) {
    // Check if it's a post-receipt menu context
    if (session.metadata?.postReceiptMenu) {
      await this.handlePostReceiptInput(phoneNumber, input, session);
      return;
    }

    // Handle main menu navigation - button/list IDs only
    const menuActions = {
      // List IDs (descriptive)
      'process_document': 'process_document',
      'generate_report': 'generate_report',
      'view_summary': 'view_summary',
      'set_currency': 'set_currency',
      'share_colleagues': 'share_colleagues',
      'how_it_works': 'how_it_works',
      'contact_support': 'contact_support',
      'upgrade_account': 'upgrade_account',
      'upgrade_to_pro': 'upgrade_to_pro',
      'view_menu': 'main_menu', // From welcome screen

      // Button IDs from sub-menus
      'main_menu': 'main_menu',
      'upgrade_lite': 'upgrade_lite',
      'upgrade_pro': 'upgrade_pro',
      'manage_subscription': 'manage_subscription',
      'cancel_subscription': 'cancel_subscription',
      'confirm_cancel': 'confirm_cancel',
      'reactivate_lite': 'reactivate_lite',
      'reactivate_pro': 'reactivate_pro',
      'downgrade_to_lite': 'downgrade_to_lite',

      // Report generation button IDs
      'report_1': 'report_this_month',
      'report_2': 'report_last_2_months',
      'report_3': 'report_last_3_months',
      'report_4': 'report_all_time',

      // Duplicate handling
      'continue': 'continue_override'
    };

    const action = menuActions[input.toLowerCase()];
    if (action === 'main_menu') {
      await this.handleMainMenuFlow(phoneNumber, session);
    } else if (action) {
      await this.handleMenuAction(phoneNumber, action);
    } else {
      await this.handleUnknownInput(phoneNumber);
    }
  }

  // Handle post-receipt menu input
  async handlePostReceiptInput(phoneNumber, input, session) {
    // Check if user is PRO to handle different menu structures
    const planLimits = await this.sessionManager.checkPlanLimits(phoneNumber);
    const isPro = planLimits.isPro;

    switch (input) {
      case '1': // Get Excel file
        await this.handleReportCommand(phoneNumber);
        break;
      case '2': // Quick overview
        await this.handleSummaryCommand(phoneNumber);
        break;
      case '3': // Send another receipt
        const DocumentProcessingHandler = require('./DocumentProcessingHandler');
        const docHandler = new DocumentProcessingHandler(this.whatsAppService, this.sessionManager);
        await docHandler.handleProcessDocumentCommand(phoneNumber);
        break;
      case '4': 
        if (isPro) {
          // For PRO users, option 4 is Main Menu
          await this.handleMainMenuFlow(phoneNumber, session);
        } else {
          // For non-PRO users, option 4 is Upgrade Plan
          await this.handleUpgradeCommand(phoneNumber);
        }
        break;
      case '5':
        if (!isPro) {
          // For non-PRO users only, option 5 is Main Menu
          await this.handleMainMenuFlow(phoneNumber, session);
        } else {
          // For PRO users, 5 is invalid - treat as unknown input
          await this.handleUnknownInput(phoneNumber);
        }
        break;
      default:
        // For unknown input, show the standard "I didn't understand that" message with buttons
        await this.handleUnknownInput(phoneNumber);
    }
  }

  // Handle specific menu actions
  async handleMenuAction(phoneNumber, action) {
    switch (action) {
      case 'process_document':
        const DocumentProcessingHandler = require('./DocumentProcessingHandler');
        const docHandler = new DocumentProcessingHandler(this.whatsAppService, this.sessionManager);
        await docHandler.handleProcessDocumentCommand(phoneNumber);
        break;
      case 'generate_report':
        await this.handleReportCommand(phoneNumber);
        break;
      case 'report_this_month':
        await this.handleReportGeneration(phoneNumber, 'this_month');
        break;
      case 'report_last_2_months':
        await this.handleReportGeneration(phoneNumber, 'last_2_months');
        break;
      case 'report_last_3_months':
        await this.handleReportGeneration(phoneNumber, 'last_3_months');
        break;
      case 'report_all_time':
        await this.handleReportGeneration(phoneNumber, 'all_time');
        break;
      case 'view_summary':
        await this.handleSummaryCommand(phoneNumber);
        break;
      case 'set_currency':
        await this.handleSetCurrencyCommand(phoneNumber);
        break;
      case 'share_colleagues':
        await this.handleShareCommand(phoneNumber);
        break;
      case 'how_it_works':
        await this.handleHowItWorksCommand(phoneNumber);
        break;
      case 'contact_support':
        await this.handleSupportCommand(phoneNumber);
        break;
      case 'upgrade_account':
      case 'upgrade_to_pro':
        await this.handleUpgradeCommand(phoneNumber);
        break;
      case 'upgrade_lite':
        await this.handleUpgradeAction(phoneNumber, 'lite');
        break;
      case 'upgrade_pro':
        await this.handleUpgradeAction(phoneNumber, 'pro');
        break;
      case 'manage_subscription':
        await this.handleManageSubscriptionCommand(phoneNumber);
        break;
      case 'billing_support':
        await this.handleBillingSupportCommand(phoneNumber);
        break;
      case 'cancel_subscription':
        await this.handleCancelSubscriptionCommand(phoneNumber);
        break;
      case 'billing_question':
        await this.whatsAppService.sendMessage(phoneNumber, 
          `💬 *ASK YOUR QUESTION*

Please describe your billing issue in detail and we'll respond within 24 hours.

Our support team will help with:
• Payment problems
• Billing inquiries  
• Refund requests
• Account changes

Go ahead and send your message!`);
        break;
      case 'confirm_cancel':
        await this.handleConfirmCancelSubscription(phoneNumber);
        break;
      case 'reactivate_lite':
        await this.handleReactivateSubscription(phoneNumber, 'lite');
        break;
      case 'reactivate_pro':
        await this.handleReactivateSubscription(phoneNumber, 'pro');
        break;
      case 'downgrade_to_lite':
        await this.handleDowngradeToLite(phoneNumber);
        break;
      case 'continue_override':
        await this.handleDuplicateOverride(phoneNumber);
        break;
    }
  }

  // Handle global commands that work from any state
  async handleGlobalCommand(phoneNumber, command) {
    switch (command) {
      case 'info':
        await this.handleInfoCommand(phoneNumber);
        break;
      case 'summary':
        await this.handleSummaryCommand(phoneNumber);
        break;
      case 'report':
      case 'reports':
      case 'excel':
        await this.handleReportCommand(phoneNumber);
        break;
      case 'usage':
        await this.handleUsageCommand(phoneNumber);
        break;
      case 'upgrade':
        await this.handleUpgradeCommand(phoneNumber);
        break;
      case 'reset':
        await this.handleResetCommand(phoneNumber);
        break;
      case 'continue_override':
        await this.handleDuplicateOverride(phoneNumber);
        break;
      default:
        await this.handleMainMenuFlow(phoneNumber);
    }
  }

  // Handle greeting
  async handleGreeting(phoneNumber, session) {
    // FIRST: Check for unsaved receipt before any interaction
    if (!session) {
      session = await this.sessionManager.getSession(phoneNumber);
    }

    if (session.currentReceipt) {
      await this.sendUnsavedReceiptWarning(phoneNumber, session.currentReceipt);
      return;
    }

    // Check if user is PRO
    const planLimits = await this.sessionManager.checkPlanLimits(phoneNumber);
    const isPro = planLimits.isPro;
    const isLite = planLimits.isLite;


    if (isPro) {
      // PRO user welcome - dynamic receipt limit from env vars
      const proLimit = parseInt(process.env.PRO_RECEIPT_LIMIT) || 25;
      const remainingReceipts = planLimits.remainingReceipts || 0;
      const usedReceipts = proLimit - remainingReceipts;

      // Get subscription info for status and next billing
      const subscriptionInfo = await this.getSubscriptionInfo(phoneNumber);

      const proWelcomeMessage = `👋 *Welcome back to TextExpense!*

🚀 *PRO PLAN STATUS:*

📸 *${remainingReceipts} remaining* (${usedReceipts}/${proLimit} used)

📅 *Resets on ${subscriptionInfo.nextBilling}*

*Share your receipt or choose from option below*`;

      const proStartOptions = [
        { id: 'process_document', text: 'Process New Expense' },
        { id: 'share_colleagues', text: 'Share TextExpense' },
        { id: 'main_menu', text: 'Main Menu' }
      ];

      await this.whatsAppService.sendInteractiveButtons(phoneNumber, proWelcomeMessage, proStartOptions, 'pro_welcome');
    } else if (isLite) {
      // LITE user welcome - dynamic receipt limit from env vars
      const liteLimit = parseInt(process.env.LITE_RECEIPT_LIMIT) || 6;
      const remainingReceipts = planLimits.remainingReceipts || 0;
      const usedReceipts = liteLimit - remainingReceipts;

      // Get subscription info for status and next billing
      const subscriptionInfo = await this.getSubscriptionInfo(phoneNumber);

      const liteWelcomeMessage = `👋 *Welcome back to TextExpense!*

💡 *LITE PLAN STATUS:*

📸 *${remainingReceipts} remaining* (${usedReceipts}/${liteLimit} used)

📅 *Resets on ${subscriptionInfo.nextBilling}*

*Share your receipt or choose from option below*`;

      const liteStartOptions = [
        { id: 'process_document', text: 'Process New Expense' },
        { id: 'share_colleagues', text: 'Share TextExpense' },
        { id: 'main_menu', text: 'Main Menu' }
      ];

      await this.whatsAppService.sendInteractiveButtons(phoneNumber, liteWelcomeMessage, liteStartOptions, 'lite_welcome');
    } else {
      // FREE TRIAL user welcome (5 receipts one-time)
      const welcomeMessage = `👋 Welcome to Text Expense!

*I'M LIKE DROPBOX FOR YOUR RECEIPTS - BUT SMARTER!*

*TWO WAYS I HELP YOU:*

📊 *EXPENSE TRACKING*
Auto generate expense reports for 
TAX, WORK, BUSINESS…..

📁 *SAVE IT*
Never lose a receipt again 

*THE MAGIC:*
You: 📸 Send any receipt
Me: 💾 Save forever + Extract details
You: 📥 DOWNLOAD Excel with ALL receipts as clickable links

🎁 *TRY FOR FREE!*
Experience the magic - no payment required

📄 I accept: PDF, JPG, PNG, DOCX, WebP

Send me any receipt to start!`;

      const startOptions = [
        { id: 'process_document', text: 'Process New Expense' },
        { id: 'how_it_works', text: 'See how it works' },
        { id: 'upgrade_account', text: 'Upgrade' }
      ];

      await this.whatsAppService.sendInteractiveButtons(phoneNumber, welcomeMessage, startOptions, 'welcome');
    }
    
    await this.sessionManager.updateUserState(phoneNumber, USER_STATES.IDLE, { menuContext: 'welcome' });
  }

  // Command implementations
  async handleReportCommand(phoneNumber) {
    // Check user's plan type to determine report options
    const planLimits = await this.sessionManager.checkPlanLimits(phoneNumber);
    const planType = planLimits.planType;
    const isPro = planLimits.isPro;

    // For trial and lite plans: Generate "This Month" report directly
    if (planType === 'trial' || planType === 'lite') {
      await this.handleReportGeneration(phoneNumber, 'this_month');
      return;
    }

    // For Pro plan: Show monthly filter options
    const reportMessage = `📊 *GENERATE EXPENSE REPORT*

Select time period for your report:`;

    const { MESSAGE_COMMANDS } = require('../config/commands');
    const reportOptions = [
      { id: MESSAGE_COMMANDS.REPORT_THIS_MONTH, text: 'This Month' },
      { id: MESSAGE_COMMANDS.REPORT_LAST_2_MONTHS, text: 'Last 2 Months' },
      { id: MESSAGE_COMMANDS.REPORT_LAST_3_MONTHS, text: 'Last 3 Months' },
      { id: MESSAGE_COMMANDS.REPORT_ALL_TIME, text: 'All Time' }
    ];

    // Use text-based menu since WhatsApp buttons only support max 3 options
    const textOptions = `1️⃣ This Month
2️⃣ Last 2 Months
3️⃣ Last 3 Months
4️⃣ All Time
5️⃣ Main Menu

Reply with number 1-5`;

    await this.whatsAppService.sendMessage(phoneNumber, `${reportMessage}

${textOptions}`);

    await this.sessionManager.updateUserState(phoneNumber, USER_STATES.IDLE, {
      currentReceipt: null,
      metadata: {
        menuContext: 'report_generation',
        postReceiptMenu: false,
        postSaveVault: false
      }
    });
  }

  async handleSummaryCommand(phoneNumber) {
    const session = await this.sessionManager.getSession(phoneNumber);

    // Get user information
    const { User, ExpenseV2, UsageLimitV2 } = require('../models/database/indexV2');
    const user = await User.findByPhoneNumber(phoneNumber);

    let receiptCount = 0;
    let databaseReceipts = [];

    if (user) {
      // Get actual receipt count using UnifiedUsageService (counts both expenses + saved)
      try {
        const UnifiedUsageService = require('../services/UnifiedUsageService');
        const actualUsage = await UnifiedUsageService.getActualUsage(user.id);
        receiptCount = actualUsage.total; // Total receipts (expenses + saved)
      } catch (error) {
        console.error('Error getting receipt count:', error);
        receiptCount = 0;
      }

      // Get expenses AND saved receipts from this month for plan breakdown
      try {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;
        const startDate = new Date(currentYear, currentMonth - 1, 1);
        const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59);

        const expenses = await ExpenseV2.findAll({
          where: {
            userId: user.id,
            createdAt: {
              [require('sequelize').Op.gte]: startDate,
              [require('sequelize').Op.lte]: endDate
            }
          },
          order: [['expenseDate', 'DESC']] // Most recent first
        });

        // Also get saved receipts for plan breakdown
        const SavedReceipt = require('../models/database/SavedReceipt');
        const savedReceipts = await SavedReceipt.findAll({
          where: {
            userId: user.id,
            createdAt: {
              [require('sequelize').Op.gte]: startDate,
              [require('sequelize').Op.lte]: endDate
            }
          },
          order: [['createdAt', 'DESC']]
        });

        // Combine both for plan breakdown (expenses contribute to currency totals, saved don't)
        databaseReceipts = [
          ...expenses.map(expense => ({
            id: expense.id,
            merchantName: expense.merchantName,
            totalAmount: expense.totalAmount,
            originalCurrency: expense.originalCurrency || 'INR',
            receiptDate: expense.expenseDate,
            category: expense.category,
            createdAt: expense.createdAt,
            planType: expense.planType,
            type: 'expense'
          })),
          ...savedReceipts.map(saved => ({
            id: saved.id,
            merchantName: null,
            totalAmount: 0,
            originalCurrency: null,
            receiptDate: saved.createdAt,
            category: saved.category,
            createdAt: saved.createdAt,
            planType: saved.planType,
            type: 'saved'
          }))
        ];

      } catch (expenseError) {

        // Fallback to Receipt table
        const Expense = require('../models/database/Expense');
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;
        const startDate = new Date(currentYear, currentMonth - 1, 1);
        const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59);

        databaseReceipts = await Expense.findAll({
          where: {
            userId: user.id,
            status: 'confirmed',
            expenseDate: {
              [require('sequelize').Op.gte]: startDate,
              [require('sequelize').Op.lte]: endDate
            }
          },
          order: [['expenseDate', 'DESC']]
        });
      }
    }

    // Group expenses by currency and calculate separate totals (only count expenses, not saved receipts)
    const expensesOnly = (databaseReceipts || []).filter(r => r.type === 'expense');
    const currencyTotals = this.calculateCurrencyTotals(expensesOnly);

    // Get plan information
    console.log('🔍 MenuHandler: Getting plan limits from SessionManager');
    const planLimits = await this.sessionManager.checkPlanLimits(phoneNumber);
    console.log('📊 MenuHandler received planLimits:', {
      isPro: planLimits.isPro,
      isLite: planLimits.isLite,
      isOnTrial: planLimits.isOnTrial,
      planType: planLimits.planType,
      remaining: planLimits.remainingReceipts
    });

    const isPro = planLimits.isPro;
    const isLite = planLimits.isLite;
    const isOnTrial = planLimits.isOnTrial;

    // Determine plan display name
    let planType;
    if (isPro) {
      planType = 'PRO';
    } else if (isLite) {
      planType = 'LITE';
    } else if (isOnTrial) {
      planType = 'TRIAL';
    } else {
      planType = 'Free';
    }

    console.log('🎯 MenuHandler: Final plan display name:', planType);

    // Get usage breakdown from UnifiedUsageService
    const UnifiedUsageService = require('../services/UnifiedUsageService');
    const usageData = await UnifiedUsageService.canProcessReceipt(user.id);

    const totalExpenses = usageData.breakdown.expenses || 0;
    const totalSaved = usageData.breakdown.saved || 0;
    const byPlan = usageData.breakdown.byPlan || {};

    // Build receipt breakdown by plan
    let receiptBreakdown = '';

    // Show breakdown by plan for paid users
    if (isPro) {
      const liteLimit = parseInt(process.env.LITE_RECEIPT_LIMIT) || 6;
      const proLimit = parseInt(process.env.PRO_RECEIPT_LIMIT) || 25;

      // Show Trial receipts if any (no remaining count - trial doesn't carry forward)
      if (byPlan.trial && byPlan.trial.total > 0) {
        receiptBreakdown += `• TRIAL receipts: ${byPlan.trial.total}\n`;
      }

      // Check for Lite → Pro upgrade
      if (user.metadata?.liteProUpgrade) {
        // Use ACTUAL database count from byPlan, not the metadata counter
        // The metadata counter can be incorrect due to counting TRIAL receipts
        const liteUsed = byPlan.lite?.total || 0;
        const liteCycleEnd = user.metadata.liteProUpgrade.liteBillingCycleEnd ? new Date(user.metadata.liteProUpgrade.liteBillingCycleEnd) : null;
        const liteCycleValid = liteCycleEnd && new Date() < liteCycleEnd;

        if (liteUsed > 0) {
          if (liteCycleValid) {
            receiptBreakdown += `• LITE receipts: ${liteUsed} of ${liteLimit} used\n`;
          } else {
            receiptBreakdown += `• LITE receipts: ${liteUsed} of ${liteLimit} used (plan expired)\n`;
          }
        }
      }

      // Always show Pro usage
      const proUsed = byPlan.pro?.total || 0;
      const proRemaining = Math.max(0, proLimit - proUsed);
      const remainingText = proRemaining > 0 ? ` (${proRemaining} remaining)` : '';
      receiptBreakdown += `• PRO receipts: ${proUsed} of ${proLimit} used${remainingText}\n`;
    } else if (isLite) {
      const liteLimit = parseInt(process.env.LITE_RECEIPT_LIMIT) || 6;

      // Show Trial receipts if any were used this month (before upgrading to Lite)
      if (byPlan.trial && byPlan.trial.total > 0) {
        receiptBreakdown += `• TRIAL receipts: ${byPlan.trial.total}\n`;
      }

      // Show Lite receipts
      const liteUsed = byPlan.lite?.total || 0;
      const liteRemaining = Math.max(0, liteLimit - liteUsed);
      const remainingText = liteRemaining > 0 ? ` (${liteRemaining} remaining)` : '';
      receiptBreakdown += `• LITE receipts: ${liteUsed} of ${liteLimit} used${remainingText}\n`;
    } else {
      // Trial users - simple count
      const trialLimit = parseInt(process.env.TRIAL_RECEIPT_LIMIT) || 5;
      const trialUsed = receiptCount;
      const trialRemaining = Math.max(0, trialLimit - trialUsed);
      const remainingText = trialRemaining > 0 ? ` (${trialRemaining} remaining)` : '';
      receiptBreakdown = `• TRIAL receipts: ${trialUsed} of ${trialLimit} used${remainingText}\n`;
    }

    let summaryMessage = `📈 *YOUR EXPENSE SUMMARY*

📊 *THIS MONTH:*
${receiptBreakdown}
*Breakdown:*
• Expenses: ${totalExpenses}
• Receipt Vault: ${totalSaved}`;

    // Removed sections per user request:
    // - SAVED DOCUMENTS
    // - RECENT EXPENSES

    const summaryOptions = [
      { id: 'generate_report', text: 'Generate Report' },
      { id: 'process_document', text: 'Process New Expense' },
      { id: 'main_menu', text: 'Main Menu' }
    ];

    await this.whatsAppService.sendMessage(phoneNumber, summaryMessage);
    await this.whatsAppService.sendInteractiveButtons(phoneNumber, 'What would you like to do next?', summaryOptions, 'summary');
  }

  async handleSetCurrencyCommand(phoneNumber) {
    // Get user's current currency
    const session = await this.sessionManager.getSession(phoneNumber);
    const user = session._user;
    const currentCurrency = user?.defaultCurrency || 'INR';

    const currencyMessage = `💱 *SET YOUR DEFAULT CURRENCY*

Your current currency: *${currentCurrency}*

This currency will be used as fallback when no currency is detected in your receipts.

*SELECT A CURRENCY:*

1️⃣ USD ($) - US Dollar
2️⃣ EUR (€) - Euro
3️⃣ JPY (¥) - Japanese Yen
4️⃣ GBP (£) - British Pound
5️⃣ CNH (¥) - Chinese Renminbi
6️⃣ AUD (A$) - Australian Dollar
7️⃣ HKD (HK$) - Hong Kong Dollar
8️⃣ INR (₹) - Indian Rupee

*Reply with the number (1-8):*`;

    await this.whatsAppService.sendMessage(phoneNumber, currencyMessage);

    // Set session state to await currency selection
    await this.sessionManager.updateUserState(phoneNumber, USER_STATES.WAITING_FOR_CURRENCY_SELECTION, {
      menuContext: 'currency_selection'
    });
  }

  async handleCurrencySelection(phoneNumber, input) {
    // Currency mappings - same order as in edit details
    const currencyMap = {
      '1': { code: 'USD', symbol: '$', name: 'US Dollar' },
      '2': { code: 'EUR', symbol: '€', name: 'Euro' },
      '3': { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
      '4': { code: 'GBP', symbol: '£', name: 'British Pound' },
      '5': { code: 'CNH', symbol: '¥', name: 'Chinese Renminbi' },
      '6': { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
      '7': { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
      '8': { code: 'INR', symbol: '₹', name: 'Indian Rupee' }
    };

    const selection = currencyMap[input.trim()];

    if (!selection) {
      await this.whatsAppService.sendMessage(phoneNumber,
        `❌ Invalid selection. Please reply with a number from 1-8.`);
      return;
    }

    // Update user's default currency in database
    const { User } = require('../models/database/indexV2');
    try {
      const user = await User.findByPhoneNumber(phoneNumber);
      if (user) {
        await user.update({
          defaultCurrency: selection.code,
          currencySymbol: selection.symbol
        });

        console.log(`💰 Updated default currency for ${phoneNumber}: ${selection.code} (${selection.symbol})`);

        await this.whatsAppService.sendMessage(phoneNumber,
          `✅ *CURRENCY UPDATED!*

Your default currency is now: *${selection.name}* (${selection.symbol})

This will be used as fallback when currency is not detected in your receipts.`);

        // Reset state to IDLE
        await this.sessionManager.updateUserState(phoneNumber, USER_STATES.IDLE);

        // Show main menu
        await this.handleMainMenuFlow(phoneNumber);
      } else {
        throw new Error('User not found');
      }
    } catch (error) {
      console.error('Error updating currency:', error);
      await this.whatsAppService.sendMessage(phoneNumber,
        `❌ Failed to update currency. Please try again.`);
      await this.sessionManager.updateUserState(phoneNumber, USER_STATES.IDLE);
    }
  }

  async handleShareCommand(phoneNumber) {
    const rawBotNumber = process.env.WHATSAPP_BOT_NUMBER;
    // Clean the bot number: remove spaces, parentheses, and + signs for URL
    const botNumber = rawBotNumber.replace(/[\s\(\)\+\-]/g, '');
    const shareMessage = ` 
Found something you need

Click here: https://wa.me/17654792054?text=Hi

Share any receipt you have`;

    const responseMessage = `📱 *Share with Friends/Colleagues*

Copy/Forward below message:`;

    // Send sharing instructions
    await this.whatsAppService.sendMessage(phoneNumber, responseMessage);

    // Send the share message separately
    await this.whatsAppService.sendMessage(phoneNumber, shareMessage);
    
    // Clear post-receipt menu metadata and return to main menu
    await this.sessionManager.updateUserState(phoneNumber, USER_STATES.IDLE, { 
      postReceiptMenu: false,
      menuContext: 'main_menu' 
    });
    
    // Show main menu after sharing
    await this.handleMainMenuFlow(phoneNumber);
  }

  async handleHowItWorksCommand(phoneNumber) {
    const howMessage = `ℹ️ *HOW TEXTEXPENSE WORKS*

*STEP 1: SEND RECEIPT* 📸
Just send any receipt photo, PDF, or document
• Send ONE image/file at a time for processing
• We accept all common formats
• No app downloads needed

*STEP 2: CHOOSE YOUR NEED* 🎯
Pick what you want:
• Full Details = Extract amounts, dates, totals (for expenses)
• Just Save = Quick storage (for warranties, records)

*STEP 3: CATEGORIZE* 🏷️
Select a category and add description
• Helps you find receipts later
• Organizes your Excel reports

*STEP 4: ACCESS FOREVER* 📂
Get Excel reports with all receipts
• Every receipt has its own downloadable link
• Access anytime, anywhere
• Never lose a receipt again`;

    // Check if user is on PRO plan
    const subscriptionInfo = await this.getSubscriptionInfo(phoneNumber);
    const isPro = subscriptionInfo.planType === 'pro';

    // Only show Upgrade button if user is NOT on PRO plan
    const howOptions = [
      { id: 'process_document', text: 'Try It Now' }
    ];

    if (!isPro) {
      howOptions.push({ id: 'upgrade_account', text: 'Upgrade' });
    }

    howOptions.push({ id: 'main_menu', text: 'Main Menu' });

    await this.whatsAppService.sendMessage(phoneNumber, howMessage);
    await this.whatsAppService.sendInteractiveButtons(phoneNumber, 'What would you like to do?', howOptions, 'how_it_works');
  }

  async handleSupportCommand(phoneNumber) {
    const supportMessage = `📞 *CONTACT SUPPORT*

Need help? We're here for you!

📧 *EMAIL SUPPORT:*
support@textexpense.com

*WHEN CONTACTING US:*
Please include:
- Your phone number
- Description of the issue
- Screenshots if applicable`;

    const supportOptions = [
      { id: 'main_menu', text: 'Main Menu' }
    ];

    await this.whatsAppService.sendMessage(phoneNumber, supportMessage);
    await this.whatsAppService.sendInteractiveButtons(phoneNumber, 'Choose an option:', supportOptions, 'support');
  }

  async handleUpgradeCommand(phoneNumber) {
    // Get current subscription info
    const planLimits = await this.sessionManager.checkPlanLimits(phoneNumber);
    const subscriptionInfo = await this.getSubscriptionInfo(phoneNumber);
    const currentPlan = subscriptionInfo.planType;

    if (planLimits.isPro) {
      await this.handleExistingSubscription(phoneNumber);
      return;
    }

    // Get plan configurations from environment variables
    const { formatPrice } = require('../utils/priceFormatter');
    const trialLimit = parseInt(process.env.TRIAL_RECEIPT_LIMIT);
    const litePrice = `${formatPrice(parseInt(process.env.LITE_PLAN_PRICE) || 299)}/mo`;
    const liteLimit = parseInt(process.env.LITE_RECEIPT_LIMIT);
    const proPrice = `${formatPrice(parseInt(process.env.PRO_PLAN_PRICE) || 499)}/mo`;
    const proLimit = parseInt(process.env.PRO_RECEIPT_LIMIT);

    if (currentPlan === 'trial') {
      // Show simplified plan selection for trial users
      const upgradeMessage = `Choose your plan:

💡 Lite: ${litePrice} (${liteLimit} receipts)
🚀 Pro: ${proPrice} (${proLimit} receipts)`;

      const upgradeOptions = [
        { id: 'upgrade_lite', text: 'Choose Lite Plan' },
        { id: 'upgrade_pro', text: 'Choose Pro Plan' },
        { id: 'main_menu', text: 'Main Menu' }
      ];

      await this.whatsAppService.sendInteractiveButtons(phoneNumber, upgradeMessage, upgradeOptions, 'upgrade');

    } else if (currentPlan === 'lite') {
      // Show only pro upgrade option for lite users
      const upgradeMessage = `🚀 *UPGRADE TO PRO*

*CURRENT:* Lite Plan (${liteLimit} receipts/month)

⭐⭐ *PRO PLAN* - ${proPrice}
• ${proLimit} receipts per month
• 3-months history 
• Priority processing
• Email support

*SECURE PAYMENT:*
• Powered by Stripe
• Cancel anytime
• Instant activation`;

      const upgradeOptions = [
        { id: 'upgrade_pro', text: `Upgrade to PRO` },
        { id: 'main_menu', text: 'Main Menu' }
      ];

      await this.whatsAppService.sendMessage(phoneNumber, upgradeMessage);
      await this.whatsAppService.sendInteractiveButtons(phoneNumber, 'Choose an option:', upgradeOptions, 'upgrade');

    } else {
      // Fallback for unknown plan types - show both options
      const upgradeMessage = `🚀 *CHOOSE YOUR PLAN*

⭐ *LITE PLAN* - ${litePrice}
• ${liteLimit} receipts per month
• 1-month history
• Standard processing
• WhatsApp support

⭐⭐ *PRO PLAN* - ${proPrice}
• ${proLimit} receipts per month
• 3-months history
• Priority processing
• Email support

*SECURE PAYMENT:*
• Powered by Stripe
• Cancel anytime
• Instant activation`;

      const upgradeOptions = [
        { id: 'upgrade_lite', text: `Choose Lite ${litePrice}` },
        { id: 'upgrade_pro', text: `Choose PRO ${proPrice}` },
        { id: 'main_menu', text: 'Main Menu' }
      ];

      await this.whatsAppService.sendMessage(phoneNumber, upgradeMessage);
      await this.whatsAppService.sendInteractiveButtons(phoneNumber, 'Choose your plan:', upgradeOptions, 'upgrade');
    }
  }

  // Handle existing subscription
  async handleExistingSubscription(phoneNumber) {
    // Get fresh plan data from database
    const planLimits = await this.sessionManager.checkPlanLimits(phoneNumber);
    const subInfo = await this.getSubscriptionInfo(phoneNumber);
    
    const subscriptionMessage = `✅ *YOU'RE ALREADY PRO!*

*CURRENT PLAN:* PRO (${subInfo.price})
*STATUS:* ${subInfo.status}

*YOUR PRO BENEFITS:*
• ${parseInt(process.env.PRO_RECEIPT_LIMIT) || 25} receipts per month${planLimits.remainingReceipts > 0 ? ` (${planLimits.remainingReceipts} remaining)` : ''}
• ${subInfo.benefits[1]}
• ${subInfo.benefits[2]}
• ${subInfo.benefits[3]}`;

    const subscriptionOptions = [
      { id: 'manage_subscription', text: 'Manage Subscription' },
      { id: 'main_menu', text: 'Main Menu' }
    ];

    await this.whatsAppService.sendMessage(phoneNumber, subscriptionMessage);
    await this.whatsAppService.sendInteractiveButtons(phoneNumber, 'Choose an option:', subscriptionOptions, 'subscription_active');
  }

  // Handle subscription management for PRO users
  async handleManageSubscriptionCommand(phoneNumber) {
    const session = await this.sessionManager.getSession(phoneNumber);
    const planLimits = await this.sessionManager.checkPlanLimits(phoneNumber);

    // Trial users should see upgrade options
    if (planLimits.isOnTrial) {
      await this.handleUpgradeCommand(phoneNumber);
      return;
    }

    // Get actual usage from database
    const { User } = require('../models/database/indexV2');
    const user = await User.findByPhoneNumber(phoneNumber);
    const UnifiedUsageService = require('../services/UnifiedUsageService');
    const actualUsage = await UnifiedUsageService.getActualUsage(user.id);
    const planLimitsInfo = await UnifiedUsageService.getPlanLimits(user.id);

    const subInfo = await this.getSubscriptionInfo(phoneNumber);
    const liteLimit = parseInt(process.env.LITE_RECEIPT_LIMIT);
    const proLimit = parseInt(process.env.PRO_RECEIPT_LIMIT);

    let manageMessage;

    if (planLimits.isLite) {
      // Lite subscription details
      const usedForLimit = actualUsage.currentPlanTotal !== undefined ? actualUsage.currentPlanTotal : actualUsage.total;
      const remaining = Math.max(0, planLimitsInfo.limit - usedForLimit);
      const billingLabel = subInfo.status === 'Cancelling' ? '*EXPIRES ON:*' : '*NEXT BILLING:*';

      // Build breakdown by plan
      let usageBreakdown = '';
      const byPlan = actualUsage.byPlan || {};
      if (byPlan.trial && byPlan.trial.total > 0) {
        usageBreakdown += `• Trial receipts: ${byPlan.trial.total}\n`;
      }
      if (byPlan.lite && byPlan.lite.total > 0) {
        usageBreakdown += `• Lite receipts: ${byPlan.lite.total}\n`;
      }

      manageMessage = `⚙️ *SUBSCRIPTION MANAGEMENT*

*CURRENT PLAN:* Lite
*STATUS:* ${subInfo.status}
*PRICE:* ${subInfo.price}
${billingLabel} ${subInfo.nextBilling}

*USAGE THIS MONTH:*
${usageBreakdown}• Remaining: ${remaining}/${liteLimit}

*LITE BENEFITS:*
✅ ${liteLimit} receipts per month
✅ 1-month expense history
✅ Standard processing
✅ WhatsApp support

*WANT MORE?*
Upgrade to Pro for ${proLimit} receipts/month and 3-month history.

*NEED HELP?*
Contact support for billing questions or cancellation requests.`;
    } else if (planLimits.isPro) {
      // Pro subscription details
      const usedForLimit = actualUsage.currentPlanTotal !== undefined ? actualUsage.currentPlanTotal : actualUsage.total;
      const remaining = Math.max(0, planLimitsInfo.limit - usedForLimit);
      const billingLabel = subInfo.status === 'Cancelling' ? '*EXPIRES ON:*' : '*NEXT BILLING:*';

      // Build breakdown by plan with separate remaining counts
      let usageBreakdown = '';
      const byPlan = actualUsage.byPlan || {};

      // Show Trial receipts if any (no remaining count - trial doesn't carry forward)
      if (byPlan.trial && byPlan.trial.total > 0) {
        usageBreakdown += `• TRIAL receipts: ${byPlan.trial.total}\n`;
      }

      // Check if user has Lite receipts from before upgrading to Pro
      const liteUsed = user.metadata?.liteProUpgrade?.liteReceiptsUsed || 0;
      const hasLiteReceipts = liteUsed > 0;

      if (hasLiteReceipts) {
        // Check if Lite billing cycle is still valid (from metadata)
        const hasValidLiteCycle = user.metadata?.liteProUpgrade?.liteBillingCycleEnd;
        const liteCycleEnd = hasValidLiteCycle ? new Date(user.metadata.liteProUpgrade.liteBillingCycleEnd) : null;
        const liteCycleValid = liteCycleEnd && new Date() < liteCycleEnd;

        if (liteCycleValid) {
          usageBreakdown += `• LITE receipts: ${liteUsed} of ${liteLimit} used\n`;
        } else {
          usageBreakdown += `• LITE receipts: ${liteUsed} of ${liteLimit} used (plan expired)\n`;
        }
      }

      // Always show Pro usage
      const proUsed = byPlan.pro?.total || 0;
      const proRemaining = Math.max(0, proLimit - proUsed);
      const remainingText = proRemaining > 0 ? ` (${proRemaining} remaining)` : '';
      usageBreakdown += `• PRO receipts: ${proUsed} of ${proLimit} used${remainingText}\n`;

      // Check if downgrade is scheduled
      const isDowngradeScheduled = user?.metadata?.scheduledDowngrade?.targetPlan === 'lite';

      // Build next billing info with plan type
      let nextBillingInfo = `${billingLabel} ${subInfo.nextBilling}`;
      if (isDowngradeScheduled) {
        const currencySymbol = process.env.CURRENCY_SYMBOL || '₹';
        const litePrice = `${currencySymbol}${(parseInt(process.env.LITE_PLAN_PRICE) / 100).toFixed(2)}`;
        // Use billingCycleEnd date (which is the downgrade effective date)
        const downgradeDate = user.billingCycleEnd ? new Date(user.billingCycleEnd).toLocaleDateString() : subInfo.nextBilling;
        nextBillingInfo += `\n*SCHEDULED CHANGE:* Downgrade to Lite (${litePrice}/mo) on ${downgradeDate}`;
      } else if (subInfo.status === 'Cancelling') {
        nextBillingInfo += `\n*NEXT BILLING:* No charge (subscription ends)`;
      } else {
        nextBillingInfo += `\n*NEXT BILLING PLAN:* PRO`;
      }

      manageMessage = `⚙️ *SUBSCRIPTION MANAGEMENT*

*CURRENT PLAN:* PRO
*STATUS:* ${subInfo.status}
*PRICE:* ${subInfo.price}
${nextBillingInfo}

*USAGE THIS MONTH:*
${usageBreakdown}
*PRO BENEFITS:*
✅ ${proLimit} receipts per month
✅ 3-month expense history
✅ Priority processing
✅ Email support

*NEED HELP?*
Contact support for billing questions or cancellation requests.`;
    } else {
      // Fallback for FREE plan users (subscription ended)
      const liteLimit = parseInt(process.env.LITE_RECEIPT_LIMIT) || 6;
      const proLimit = parseInt(process.env.PRO_RECEIPT_LIMIT) || 25;

      manageMessage = `⚙️ *SUBSCRIPTION MANAGEMENT*

*CURRENT PLAN:* FREE
*STATUS:* No active subscription
*MONTHLY LIMIT:* 0 receipts

Your paid subscription has ended. You're on the FREE plan.

*TO PROCESS RECEIPTS:*
Upgrade to LITE (${liteLimit} receipts/mo) or PRO (${proLimit} receipts/mo)

*YOUR DATA:*
All your existing receipts and reports are safe and accessible.`;
    }

    const manageOptions = [];

    // Check if subscription is canceled/canceling
    const isCanceled = user?.subscriptionStatus === 'canceling' || user?.subscriptionStatus === 'canceled';
    const isCanceling = user?.subscriptionStatus === 'canceling';

    // Check if downgrade is already scheduled
    const isDowngradeScheduled = user?.metadata?.scheduledDowngrade?.targetPlan === 'lite';

    // Get user's actual plan type (for canceled users who are still on paid plan until billing end)
    const actualPlanType = user?.planType;

    if (isCanceling) {
      // User clicked cancel but still has benefits until billing end
      // Show reactivate button for their current plan
      if (actualPlanType === 'lite') {
        manageOptions.push({ id: 'reactivate_lite', text: 'Reactivate Lite' });
        manageOptions.push({ id: 'upgrade_pro', text: 'Upgrade to Pro' });
      } else if (actualPlanType === 'pro') {
        manageOptions.push({ id: 'reactivate_pro', text: 'Reactivate Pro' });
        // Don't show "Switch to Lite" if already scheduled downgrade
        if (!isDowngradeScheduled) {
          manageOptions.push({ id: 'downgrade_to_lite', text: 'Switch to Lite' });
        }
      }
    } else if (actualPlanType === 'free') {
      // User on FREE plan (subscription fully ended) - show upgrade options
      manageOptions.push({ id: 'upgrade_lite', text: 'Upgrade to Lite' });
      manageOptions.push({ id: 'upgrade_pro', text: 'Upgrade to Pro' });
    } else {
      // Show normal options for active users
      if (planLimits.isLite) {
        manageOptions.push({ id: 'upgrade_pro', text: 'Upgrade to Pro' });
      } else if (planLimits.isPro) {
        // If downgrade is already scheduled, show "Reactivate PRO" to cancel the downgrade
        if (isDowngradeScheduled) {
          manageOptions.push({ id: 'reactivate_pro', text: 'Reactivate PRO' });
        } else {
          manageOptions.push({ id: 'downgrade_to_lite', text: 'Switch to Lite' });
        }
      }
      // Add cancel subscription button only for active paid users
      if (planLimits.isLite || planLimits.isPro) {
        manageOptions.push({ id: 'cancel_subscription', text: 'Cancel Subscription' });
      }
    }

    manageOptions.push({ id: 'main_menu', text: 'Main Menu' });

    await this.whatsAppService.sendMessage(phoneNumber, manageMessage);
    await this.whatsAppService.sendInteractiveButtons(phoneNumber, 'Choose an option:', manageOptions, 'subscription_manage');
  }


  async handleInfoCommand(phoneNumber) {
    await this.whatsAppService.sendMessage(phoneNumber, 
      `ℹ️ *TEXTEXPENSE INFO*\n\nAI-powered expense tracking via WhatsApp\nVersion 3.0 | Modular Architecture`);
  }

  async handleUsageCommand(phoneNumber) {
    const session = await this.sessionManager.getSession(phoneNumber);
    const receiptCount = session.receipts?.length || 0;
    const remaining = session.getRemainingReceipts();
    
    await this.whatsAppService.sendMessage(phoneNumber, 
      `📊 *USAGE STATISTICS*\n\n• Receipts this month: ${receiptCount}\n• Remaining free receipts: ${remaining}\n• Account type: Free`);
  }

  async handleResetCommand(phoneNumber) {
    await this.sessionManager.resetSession(phoneNumber);
    await this.whatsAppService.sendMessage(phoneNumber, 
      `🔄 *SESSION RESET*\n\nAll data cleared. Starting fresh!`);
    await this.handleMainMenuFlow(phoneNumber);
  }

  async handleUnknownInput(phoneNumber) {
    const session = await this.sessionManager.getSession(phoneNumber);
    const context = session.metadata?.menuContext;

    let contextualMessage;

    if (context === 'report_generation') {
      contextualMessage = ` *RETURNING TO MAIN MENU*

Explore more options from the main menu!`;
    } else {
      contextualMessage = `I didn't understand that. Here are your options:`;
    }

    const unknownOptions = [
      { id: 'main_menu', text: 'Main Menu' },
      { id: 'how_it_works', text: 'How It Works' },
      { id: 'share_colleagues', text: 'Share TextExpense' }
    ];

    await this.whatsAppService.sendMessage(phoneNumber, contextualMessage);
    await this.whatsAppService.sendInteractiveButtons(phoneNumber, 'Choose an option:', unknownOptions, 'unknown_command');
  }


  // Handle Upgrade Action for any plan type (lite or pro)
  async handleUpgradeAction(phoneNumber, planType) {
    try {
      // Check if user has an existing active subscription (LITE upgrading to PRO)
      const { User } = require('../models/database/indexV2');
      const user = await User.findByPhoneNumber(phoneNumber);

      // If user has active subscription, update it instead of creating new one
      if (user && user.stripeSubscriptionId && user.subscriptionStatus === 'active' && user.planType === 'lite' && planType === 'pro') {
        // This is LITE → PRO upgrade, update existing subscription
        await this.handleLiteToProUpgrade(phoneNumber);
        return;
      }

      // Create Stripe checkout session (for new subscriptions or trial users)
      const StripeService = require('../payments/stripe/StripeService');
      const stripeService = new StripeService();

      const planNames = {
        lite: 'Lite',
        pro: 'PRO'
      };

      const currencySymbol = process.env.CURRENCY_SYMBOL;
      const planPrices = {
        lite: parseInt(process.env.LITE_PLAN_PRICE),
        pro: parseInt(process.env.PRO_PLAN_PRICE)
      };

      const planLimits = {
        lite: parseInt(process.env.LITE_RECEIPT_LIMIT),
        pro: parseInt(process.env.PRO_RECEIPT_LIMIT)
      };

      const planName = planNames[planType];
      const price = planPrices[planType];
      const limit = planLimits[planType];
      const { formatPrice } = require('../utils/priceFormatter');
      const priceFormatted = formatPrice(price, currencySymbol || '$');

      await this.whatsAppService.sendMessage(phoneNumber,
        `💎 *CREATING PAYMENT LINK...*

Please wait while we prepare your secure checkout.`);

      const result = await stripeService.createCheckoutSession(phoneNumber, planType);

      if (result.success) {
        const planFeatures = planType === 'pro'
          ? `• ${limit} receipts per month\n• 3-months history\n• Priority processing\n• Email support`
          : `• ${limit} receipts per month\n• 1-month history\n• Standard processing\n• WhatsApp support`;

        const paymentMessage = `💎 *READY TO UPGRADE!*

*${planName.toUpperCase()} PLAN:* ${priceFormatted}/month
${planFeatures}
• Cancel anytime

*SECURE PAYMENT:*
Click the button below for secure checkout powered by Stripe.`;

        const headerText = planType === 'lite' ? '💡 TextExpense Lite' : '💎 TextExpense PRO';

        await this.whatsAppService.sendPaymentButton(
          phoneNumber,
          paymentMessage,
          result.checkoutUrl,
          `Pay Now`,
          headerText
        );

      } else {
        await this.whatsAppService.sendMessage(phoneNumber,
          `❌ *PAYMENT SETUP FAILED*

Sorry, we couldn't create the payment link. Please try again later or contact support.

*WANT TO TRY AGAIN?*`);

        const retryOptions = [
          { id: 'upgrade_account', text: 'Try Again' },
          { id: 'main_menu', text: 'Main Menu' }
        ];

        await this.whatsAppService.sendInteractiveButtons(phoneNumber, 'What would you like to do?', retryOptions, 'payment_retry');
      }

    } catch (error) {
      console.error(`Error in handleUpgradeAction for ${planType}:`, error);
      console.error('Full error stack:', error.stack);
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        planType,
        phoneNumber
      });

      await this.whatsAppService.sendMessage(phoneNumber,
        `❌ *UPGRADE ERROR*

Something went wrong. Please try again later or contact support.

Error: ${error.message || 'Unknown error'}`);

      await this.handleMainMenuFlow(phoneNumber);
    }
  }

// Handle Upgrade Pro button action (legacy - kept for backward compatibility)
  async handleUpgradeProAction(phoneNumber) {
    try {
      // Update session activity to prevent timeout during payment (keep current state)
      const session = await this.sessionManager.getSession(phoneNumber);
      await this.sessionManager.updateUserState(phoneNumber, session.state, {
        paymentInProgress: true,
        paymentStartTime: new Date()
      });

      // Create Stripe checkout session
      const StripeService = require('../payments/stripe/StripeService');
      const stripeService = new StripeService();

      await this.whatsAppService.sendMessage(phoneNumber,
        `💎 *CREATING PAYMENT LINK...*

Please wait while we prepare your secure checkout.`);

      const result = await stripeService.createCheckoutSession(phoneNumber, 'pro');

      if (result.success) {
        const { formatPrice } = require('../utils/priceFormatter');
        const proPrice = formatPrice(parseInt(process.env.PRO_PLAN_PRICE) || 499);
        const proLimit = parseInt(process.env.PRO_RECEIPT_LIMIT);

        const paymentMessage = `💎 *READY TO UPGRADE!*

*PRO PLAN:* ${proPrice}/month
• ${proLimit} receipts per month
• 3-months history
• Priority processing
• Cancel anytime

*SECURE PAYMENT:*
Click the button below for secure checkout powered by Stripe.`;

        await this.whatsAppService.sendPaymentButton(
          phoneNumber,
          paymentMessage,
          result.checkoutUrl,
          `Pay ${proPrice}/month`
        );

      } else {
        await this.whatsAppService.sendMessage(phoneNumber, 
          `❌ *PAYMENT SETUP FAILED*

Sorry, we couldn't create the payment link. Please try again later or contact support.

Error: ${result.error || 'Unknown error'}`);
        
        await this.handleMainMenuFlow(phoneNumber);
      }
      
    } catch (error) {
      console.error('Error in handleUpgradeProAction:', error);
      
      await this.whatsAppService.sendMessage(phoneNumber, 
        `❌ *UPGRADE ERROR*

Something went wrong. Please try again later or contact support.`);
        
      await this.handleMainMenuFlow(phoneNumber);
    }
  }

  // Handle actual report generation for specific period
  async handleReportGeneration(phoneNumber, period) {
    try {
      await this.whatsAppService.sendMessage(phoneNumber,
        `📊 *GENERATING ${period.toUpperCase().replaceAll('_', ' ')} REPORT*\n\nPlease wait while we prepare your Excel report...`);
      
      // Import ExcelReportService for report generation
      const ExcelReportService = require('../services/ExcelReportService');
      const reportService = new ExcelReportService();
      
      // Get user receipts from session for the specified period
      const receipts = await this.getUserReceiptsForPeriod(phoneNumber, period);

      // Check if user has saved receipts even if no processed expenses
      const { User } = require('../models/database/indexV2');
      const sequelize = require('../models/database/indexV2').sequelize;
      const user = await User.findByPhoneNumber(phoneNumber);

      let savedReceiptsCount = 0;
      if (user) {
        const [countResult] = await sequelize.query(`
          SELECT COUNT(*) as count
          FROM saved_receipts
          WHERE "userId" = :userId
            AND "isActive" = true
        `, {
          replacements: { userId: user.id },
          type: sequelize.QueryTypes.SELECT
        });
        savedReceiptsCount = parseInt(countResult.count) || 0;
      }

      // Only show error if BOTH processed expenses AND saved receipts are empty
      if ((!receipts || receipts.length === 0) && savedReceiptsCount === 0) {
        await this.whatsAppService.sendMessage(phoneNumber,
          `📊 *NO RECEIPTS FOUND*\n\nYou don't have any processed expenses or saved receipts for ${period.replace('_', ' ')}.\n\nAdd some receipts first!`);

        // Show options to user instead of forcing main menu
        const noReceiptsOptions = [
          { id: 'process_document', text: 'Add Receipt' },
          { id: 'main_menu', text: 'Main Menu' }
        ];
        await this.whatsAppService.sendInteractiveButtons(phoneNumber, 'What would you like to do?', noReceiptsOptions, 'no_receipts');
        return;
      }
      
      // Generate the report using ExcelReportService  
      const reportResult = await reportService.generateReceiptReport(receipts, phoneNumber, period);
      
      if (reportResult.success) {
        // Send Excel file directly to WhatsApp instead of just link
        // Use currency-aware formatting for total amount
        const currencyTotals = reportResult.currencyTotals || {};
        console.log('🔍 Currency totals received:', currencyTotals);
        console.log('📊 Report result publicUrl:', reportResult.publicUrl);
        console.log('📄 Report result filename:', reportResult.filename);
        let totalDisplay = '$0.00';

        if (Object.keys(currencyTotals).length === 1) {
          // Single currency
          const currency = Object.keys(currencyTotals)[0];
          const info = currencyTotals[currency];
          totalDisplay = `${info.symbol}${info.total.toFixed(2)}`;
        } else if (Object.keys(currencyTotals).length > 1) {
          // Multiple currencies - show all
          const totals = Object.entries(currencyTotals).map(([currency, info]) =>
            `💰 ${info.symbol}${info.total.toFixed(2)} ${currency}`
          ).join('\n');
          totalDisplay = totals;
        } else {
          // Fallback to single total with default currency
          totalDisplay = `$${reportResult.totalAmount.toFixed(2)}`;
        }

        // Debug the report result values
        console.log('🔍 Report result for WhatsApp message:', {
          totalReceipts: reportResult.totalReceipts,
          totalExpenses: reportResult.totalExpenses,
          totalSavedReceipts: reportResult.totalSavedReceipts,
          success: reportResult.success
        });

        const caption = `📊 *${period.toUpperCase().replace(/_/g, ' ')} EXPENSE REPORT*\n\n📁 *File:* ${reportResult.filename}\n📊 *Expenses:* ${reportResult.totalExpenses || reportResult.totalReceipts || 0}\n📁 *Receipt Vault:* ${reportResult.totalSavedReceipts || 0}\n\n*TOTALS:*\n${totalDisplay}`;

        console.log('📤 About to send document to WhatsApp:', {
          phoneNumber,
          publicUrl: reportResult.publicUrl,
          filename: reportResult.filename
        });

        await this.whatsAppService.sendDocument(phoneNumber, reportResult.publicUrl, reportResult.filename, caption);

        console.log('✅ Document sent successfully to WhatsApp');

        // Send a button for user to return to menu when ready instead of automatic timeout
        const postReportOptions = [
          { id: 'main_menu', text: 'Back to Main Menu' }
        ];

        setTimeout(async () => {
          await this.whatsAppService.sendInteractiveButtons(phoneNumber, 'What would you like to do next?', postReportOptions, 'post_report');
        }, 1000);
      } else {
        await this.whatsAppService.sendMessage(phoneNumber, 
          `❌ *REPORT GENERATION FAILED*\n\n${reportResult.error || 'Unable to generate report. Please try again.'}`);
        
        // Show options instead of forcing main menu
        const errorOptions = [
          { id: 'generate_report', text: 'Try Again' },
          { id: 'main_menu', text: 'Main Menu' }
        ];
        await this.whatsAppService.sendInteractiveButtons(phoneNumber, 'What would you like to do?', errorOptions, 'report_error');
      }
      
    } catch (error) {
      console.error('Error generating report:', error);
      await this.whatsAppService.sendMessage(phoneNumber, 
        `❌ *ERROR GENERATING REPORT*\n\nSomething went wrong. Please try again later.`);
      
      // Show options instead of forcing main menu
      const errorOptions = [
        { id: 'generate_report', text: 'Try Again' },
        { id: 'main_menu', text: 'Main Menu' }
      ];
      await this.whatsAppService.sendInteractiveButtons(phoneNumber, 'What would you like to do?', errorOptions, 'report_error');
    }
  }

  // Get user receipts for specified period
  async getUserReceiptsForPeriod(phoneNumber, period) {
    try {
      // Use modern ExpenseV2 model instead of legacy Receipt model
      const { User, ExpenseV2 } = require('../models/database/indexV2');

      // Find user first
      const user = await User.findByPhoneNumber(phoneNumber);
      if (!user) {
        return [];
      }

      // Get expenses from current unified expenses table using Sequelize model
      // Use Sequelize model to get expenses with all model methods available
      const allReceipts = await ExpenseV2.findAll({
        where: {
          userId: user.id,
          status: { [require('sequelize').Op.ne]: 'deleted' }
        },
        order: [['createdAt', 'DESC']]
      });

      console.log(`🔍 Report data fetch: Found ${allReceipts.length} expenses for user ${phoneNumber}`);

      
      const now = new Date();
      let startDate;
      
      switch (period) {
        case 'this_month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'last_2_months':
          startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
          break;
        case 'last_3_months':
          startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
          break;
        case 'all_time':
          return allReceipts; // Return all receipts
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      console.log(`Date filtering: period=${period}, startDate=${startDate ? startDate.toISOString() : 'none'}, allReceipts=${allReceipts.length}`);

      // Filter receipts by UPLOAD date to TextExpense (not invoice date)
      const filteredReceipts = allReceipts.filter(receipt => {
        const uploadDate = new Date(receipt.createdAt || receipt.updatedAt || new Date());
        const isInPeriod = uploadDate >= startDate;

        // Debug logging for missing 5th receipt issue
        console.log(`Receipt ${receipt.id}: uploadDate=${uploadDate.toISOString()}, startDate=${startDate.toISOString()}, isInPeriod=${isInPeriod}`);

        return isInPeriod;
      });

      console.log(`After filtering: ${filteredReceipts.length} receipts remaining`);

      return filteredReceipts;
      
    } catch (error) {
      console.error('Error getting receipts for period:', error);
      return [];
    }
  }

  // Get saved documents summary for current month
  async getSavedDocumentsSummary(phoneNumber) {
    try {
      const { User } = require('../models/database/indexV2');
      const SavedReceipt = require('../models/database/SavedReceipt');

      // Get user
      const user = await User.findByPhoneNumber(phoneNumber);
      if (!user) {
        return { totalCount: 0, categorySummary: '' };
      }

      // Get current month saved receipts
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1; // getMonth() returns 0-11

      const monthlyCount = await SavedReceipt.getUserMonthlySavedReceiptsCount(user.id, currentYear, currentMonth);

      if (monthlyCount === 0) {
        return { totalCount: 0, categorySummary: '' };
      }

      // Get category breakdown for current month
      const startDate = new Date(currentYear, currentMonth - 1, 1);
      const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59);

      const categorySummary = await SavedReceipt.getCategorySummary(user.id, {
        startDate: startDate,
        endDate: endDate
      });

      const summaryLines = categorySummary.map(item =>
        `- ${item.get ? item.get('category') : item.category}: ${item.get ? item.get('count') : item.count} receipt${(item.get ? item.get('count') : item.count) > 1 ? 's' : ''}`
      );

      return {
        totalCount: monthlyCount,
        categorySummary: summaryLines.join('\n')
      };

    } catch (error) {
      console.error('Error getting saved documents summary:', error);
      return { totalCount: 0, categorySummary: '' };
    }
  }

  // Helper methods
  formatRecentExpenses(receipts) {
    if (!receipts || receipts.length === 0) {
      return '• No expenses yet';
    }

    const recent = receipts.slice(-3).reverse(); // Last 3 receipts
    return recent.map(receipt => {
      // Handle both Sequelize instances and plain objects
      const merchantName = receipt.get ? receipt.get('merchantName') : receipt.merchantName;
      const totalAmountRaw = receipt.get ? receipt.get('totalAmount') : receipt.totalAmount;
      const currency = receipt.get ? receipt.get('originalCurrency') : receipt.originalCurrency;
      const category = receipt.get ? receipt.get('category') : receipt.category;

      // Parse totalAmount since Sequelize DECIMAL fields return as strings
      const totalAmount = parseFloat(totalAmountRaw) || 0;

      // Import CurrencyService to get proper currency symbol
      const CurrencyService = require('../services/CurrencyService');
      const currencyService = new CurrencyService();
      const symbol = currencyService.getCurrencySymbol(currency || 'INR');

      return `• ${merchantName || 'Unknown'} - ${symbol}${totalAmount.toFixed(2)} (${category || 'Other'})`;
    }).join('\n');
  }

  // Handle billing support
  async handleBillingSupportCommand(phoneNumber) {
    const supportMessage = `💳 *BILLING SUPPORT*

*NEED HELP WITH:*
• Payment issues
• Billing questions
• Subscription changes
• Refund requests

*CONTACT OPTIONS:*
📧 Email: support@textexpense.com
📱 WhatsApp: Just reply here with your question

*RESPONSE TIME:*
• WhatsApp: Within 24 hours
• Email: Within 48 hours

What specific billing issue can we help with?`;

    const supportOptions = [
      { id: 'billing_question', text: ' Ask Question' },
      { id: 'main_menu', text: ' Main Menu' }
    ];

    await this.whatsAppService.sendMessage(phoneNumber, supportMessage);
    await this.whatsAppService.sendInteractiveButtons(phoneNumber, 'Choose an option:', supportOptions, 'billing_support');
  }

  // Calculate currency totals for multi-currency support
  calculateCurrencyTotals(receipts) {
    const currencyGroups = {};

    if (!receipts || receipts.length === 0) {
      // Default to INR for Indian users when no receipts exist
      return { INR: { total: 0, count: 0, symbol: '₹' } };
    }

    receipts.forEach(receipt => {
      // Handle both Sequelize instances and plain objects
      // FIX: Read 'originalCurrency' field instead of 'currency' (which doesn't exist in expenses table)
      const currency = (receipt.get ? receipt.get('originalCurrency') : receipt.originalCurrency) || 'INR'; // Default to INR instead of USD
      const amount = parseFloat(receipt.get ? receipt.get('totalAmount') : receipt.totalAmount) || 0;

      if (!currencyGroups[currency]) {
        // Import CurrencyService to get proper symbols
        const CurrencyService = require('../services/CurrencyService');
        const currencyService = new CurrencyService();
        const symbol = currencyService.getCurrencySymbol(currency);

        currencyGroups[currency] = {
          total: 0,
          count: 0,
          symbol: symbol
        };
      }

      currencyGroups[currency].total += amount;
      currencyGroups[currency].count += 1;
    });

    return currencyGroups;
  }

  // Handle cancel subscription
  async handleCancelSubscriptionCommand(phoneNumber) {
    const cancelMessage = `❌ *CANCEL SUBSCRIPTION*

We're sorry to see you go!

*WHAT HAPPENS IF YOU CANCEL:*
• Your benefits continue until your next billing date
• No refunds for the current billing period
• Your subscription won't auto-renew
• All your data will be preserved for 90 days

*ARE YOU SURE?*
This action cannot be undone.`;

    const cancelOptions = [
      { id: 'confirm_cancel', text: 'Continue Cancel' },
      { id: 'main_menu', text: 'Go Back' }
    ];

    await this.whatsAppService.sendMessage(phoneNumber, cancelMessage);
    await this.whatsAppService.sendInteractiveButtons(phoneNumber, 'Choose an option:', cancelOptions, 'cancel_subscription');
  }

  // Handle confirmed subscription cancellation
  async handleConfirmCancelSubscription(phoneNumber) {
    try {
      const { User } = require('../models/database/indexV2');
      const user = await User.findByPhoneNumber(phoneNumber);

      if (!user || !user.stripeSubscriptionId) {
        await this.whatsAppService.sendMessage(phoneNumber,
          `❌ *ERROR*

No active subscription found.`);
        await this.handleMainMenuFlow(phoneNumber);
        return;
      }

      // Get subscription info before canceling
      const subInfo = await this.getSubscriptionInfo(phoneNumber);
      const currentPlan = user.planType.toUpperCase();

      // Cancel the Stripe subscription at period end
      const StripeService = require('../payments/stripe/StripeService');
      const stripeService = new StripeService();

      await this.whatsAppService.sendMessage(phoneNumber, '⏳ Processing cancellation...');

      const canceledSubscription = await stripeService.stripe.subscriptions.update(
        user.stripeSubscriptionId,
        { cancel_at_period_end: true }
      );

      // Get the actual end date from Stripe subscription
      const periodEnd = canceledSubscription.current_period_end
        ? new Date(canceledSubscription.current_period_end * 1000)
        : user.billingCycleEnd || new Date();

      const formattedEndDate = periodEnd.toDateString();

      // Update user subscription status to canceling (NOT canceled - keeps active until period end)
      await user.update({
        subscriptionStatus: 'canceling', // NOT 'canceled' - keeps benefits active until billing end
        billingCycleEnd: periodEnd // Update with confirmed date from Stripe
      });

      console.log(`✅ Subscription ${user.stripeSubscriptionId} set to cancel at period end (${formattedEndDate}) for user ${user.id}`);

      await this.whatsAppService.sendMessage(phoneNumber,
        `✅ *SUBSCRIPTION CANCELED*

Your subscription has been canceled.

*WHAT'S NEXT:*
• Your ${currentPlan} benefits continue until ${formattedEndDate}
• No further charges after ${formattedEndDate}
• You can reactivate anytime before ${formattedEndDate}

*CHANGED YOUR MIND?*
Reactivate your subscription anytime from the Manage Subscription menu.

Thank you for using TextExpense! `);

      setTimeout(async () => {
        await this.handleMainMenuFlow(phoneNumber);
      }, 3000);

    } catch (error) {
      console.error('Error canceling subscription:', error);
      await this.whatsAppService.sendMessage(phoneNumber,
        `❌ *CANCELLATION FAILED*

Sorry, we couldn't cancel your subscription right now.

Please try again later or contact support if the issue persists.`);
      await this.handleMainMenuFlow(phoneNumber);
    }
  }

  // Handle downgrade to Lite (scheduled for next billing cycle)
  async handleDowngradeToLite(phoneNumber) {
    try {
      const { User } = require('../models/database/indexV2');
      const user = await User.findByPhoneNumber(phoneNumber);

      if (!user || !user.stripeSubscriptionId) {
        await this.whatsAppService.sendMessage(phoneNumber,
          `❌ *ERROR*

No active subscription found.`);
        await this.handleMainMenuFlow(phoneNumber);
        return;
      }

      // Verify user is on Pro plan
      if (user.planType !== 'pro') {
        await this.whatsAppService.sendMessage(phoneNumber,
          `❌ *ERROR*

You must be on Pro plan to downgrade to Lite.`);
        await this.handleMainMenuFlow(phoneNumber);
        return;
      }

      const StripeService = require('../payments/stripe/StripeService');
      const stripeService = new StripeService();

      await this.whatsAppService.sendMessage(phoneNumber, '⏳ Scheduling downgrade to Lite plan...');

      // Get current subscription details with expanded data
      const currentSubscription = await stripeService.stripe.subscriptions.retrieve(
        user.stripeSubscriptionId,
        { expand: ['latest_invoice'] }
      );

      console.log(`📋 Current subscription status: ${currentSubscription.status}`);
      console.log(`📋 Current period end from Stripe: ${currentSubscription.current_period_end}`);
      console.log(`📋 User billingCycleEnd from DB: ${user.billingCycleEnd}`);

      // Validate subscription is in a valid state for downgrade
      if (currentSubscription.status !== 'active' && currentSubscription.status !== 'trialing') {
        throw new Error(`Cannot schedule downgrade. Subscription status is: ${currentSubscription.status}`);
      }

      // Determine billing cycle end date - use Stripe first, fallback to DB, then calculate
      let billingCycleEndTimestamp;
      if (currentSubscription.current_period_end) {
        billingCycleEndTimestamp = currentSubscription.current_period_end;
      } else if (user.billingCycleEnd) {
        // Fallback to user's billingCycleEnd from database
        billingCycleEndTimestamp = Math.floor(new Date(user.billingCycleEnd).getTime() / 1000);
        console.log(`⚠️ Using billingCycleEnd from database as fallback: ${billingCycleEndTimestamp}`);
      } else {
        // Calculate from updatedAt + 30 days as last resort
        const calculatedEnd = new Date(user.updatedAt);
        calculatedEnd.setDate(calculatedEnd.getDate() + 30);
        billingCycleEndTimestamp = Math.floor(calculatedEnd.getTime() / 1000);
        console.log(`⚠️ Calculated billingCycleEnd from updatedAt: ${billingCycleEndTimestamp}`);
      }

      // Get user's current subscription currency (match what they're already paying in)
      const userCurrency = currentSubscription.currency || user.currency || 'inr';

      // Get Lite plan pricing - match user's subscription currency
      const stripeLitePrice = await stripeService.stripe.prices.create({
        currency: userCurrency,
        unit_amount: parseInt(process.env.LITE_PLAN_PRICE),
        recurring: { interval: 'month' },
        product_data: {
          name: process.env.LITE_PLAN_NAME || 'TextExpense Lite',
          metadata: {
            plan_type: 'lite'
          }
        }
      });

      // Schedule downgrade at end of current billing period
      // Stripe will automatically switch at period end with no proration
      const updatedSubscription = await stripeService.stripe.subscriptions.update(
        user.stripeSubscriptionId,
        {
          items: [{
            id: currentSubscription.items.data[0].id,
            price: stripeLitePrice.id
          }],
          proration_behavior: 'none', // No proration - change takes effect at period end
          billing_cycle_anchor: 'unchanged', // Keep current billing cycle
          metadata: {
            scheduled_downgrade: 'lite',
            downgrade_scheduled_at: new Date().toISOString()
          }
        }
      );

      // Calculate effective date using the validated billingCycleEndTimestamp
      const effectiveDate = new Date(billingCycleEndTimestamp * 1000);

      // Validate the date is valid
      if (isNaN(effectiveDate.getTime())) {
        throw new Error('Invalid billing cycle end date');
      }

      const formattedDate = effectiveDate.toDateString();
      const { formatPrice } = require('../utils/priceFormatter');
      const litePrice = formatPrice(parseInt(process.env.LITE_PLAN_PRICE) || 299);

      // Store the scheduled downgrade in user metadata
      // DON'T change planType yet - keep user on Pro until billing cycle ends
      const updatedMetadata = {
        scheduledDowngrade: {
          targetPlan: 'lite',
          scheduledAt: new Date().toISOString(),
          effectiveDate: effectiveDate.toISOString()
        }
      };

      // Update metadata column directly to avoid circular reference
      await user.sequelize.query(
        'UPDATE users SET metadata = :metadata WHERE id = :userId',
        {
          replacements: {
            metadata: JSON.stringify(updatedMetadata),
            userId: user.id
          }
        }
      );

      console.log(`📝 Stored scheduled downgrade in metadata, planType remains '${user.planType}' until ${formattedDate}`);

      console.log(`✅ Downgrade to Lite scheduled for user ${user.id}, effective ${formattedDate}`);

      await this.whatsAppService.sendMessage(phoneNumber,
        `✅ *DOWNGRADE COMPLETED*

You've scheduled a switch to the Lite plan.

*WHAT HAPPENS NEXT:*
• Your PRO benefits remain active until ${formattedDate}

Want to switch back? You can upgrade to PRO anytime.
You can cancel this downgrade anytime before ${formattedDate} by reactivating PRO from Manage Subscription.`);

      setTimeout(async () => {
        await this.handleMainMenuFlow(phoneNumber);
      }, 3000);

    } catch (error) {
      console.error('Error scheduling downgrade:', error);
      await this.whatsAppService.sendMessage(phoneNumber,
        `❌ *DOWNGRADE FAILED*

Sorry, we couldn't schedule your downgrade right now.

Error: ${error.message || 'Unknown error'}

Please try again later or contact support if the issue persists.`);
      await this.handleMainMenuFlow(phoneNumber);
    }
  }

  // Handle LITE to PRO upgrade - updates existing subscription
  async handleLiteToProUpgrade(phoneNumber) {
    try {
      const { User } = require('../models/database/indexV2');
      const user = await User.findByPhoneNumber(phoneNumber);

      if (!user || !user.stripeSubscriptionId) {
        await this.whatsAppService.sendMessage(phoneNumber,
          `❌ *ERROR*

No active subscription found. Please try upgrading from the main menu.`);
        return;
      }

      await this.whatsAppService.sendMessage(phoneNumber, '⏳ Upgrading your subscription to PRO...');

      const StripeService = require('../payments/stripe/StripeService');
      const stripeService = new StripeService();

      // Get current subscription from Stripe
      const currentSubscription = await stripeService.stripe.subscriptions.retrieve(user.stripeSubscriptionId);

      // Get user's current subscription currency
      const userCurrency = currentSubscription.currency || user.currency || 'inr';

      // Create a new Stripe Price object for the PRO plan - match user's currency
      const stripeProPrice = await stripeService.stripe.prices.create({
        currency: userCurrency,
        unit_amount: parseInt(process.env.PRO_PLAN_PRICE),
        recurring: { interval: 'month' },
        product_data: {
          name: process.env.PRO_PLAN_NAME || 'TextExpense PRO',
          metadata: {
            plan_type: 'pro'
          }
        }
      });

      // Update subscription to PRO pricing immediately
      const updatedSubscription = await stripeService.stripe.subscriptions.update(
        user.stripeSubscriptionId,
        {
          items: [{
            id: currentSubscription.items.data[0].id,
            price: stripeProPrice.id
          }],
          proration_behavior: 'create_prorations', // Prorate the difference
          billing_cycle_anchor: 'unchanged', // Keep current billing date
          metadata: {
            upgraded_from: 'lite',
            upgraded_at: new Date().toISOString()
          }
        }
      );

      // Store LITE upgrade info in user metadata
      const liteUpgradeInfo = {
        liteReceiptsUsed: user.receiptsUsedThisMonth || 0,
        liteBillingCycleEnd: user.billingCycleEnd,
        upgradedAt: new Date().toISOString(),
        previousPlanType: 'lite'
      };

      // Update user in database
      await user.update({
        planType: 'pro',
        subscriptionStatus: 'active',
        metadata: {
          ...(user.metadata || {}),
          liteProUpgrade: liteUpgradeInfo
        }
      });

      console.log(`✅ Successfully upgraded user ${user.id} from LITE to PRO`);

      const currencySymbol = process.env.CURRENCY_SYMBOL || '₹';
      const proPrice = `${currencySymbol}${(parseInt(process.env.PRO_PLAN_PRICE) / 100).toFixed(2)}`;
      const proLimit = parseInt(process.env.PRO_RECEIPT_LIMIT);
      const liteLimit = parseInt(process.env.LITE_RECEIPT_LIMIT);
      const liteUsed = liteUpgradeInfo.liteReceiptsUsed;

      await this.whatsAppService.sendMessage(phoneNumber,
        `✅ *UPGRADE COMPLETED*

You've been upgraded to PRO!

*NEW BENEFITS:*
• ${proLimit} receipts per month (was ${liteLimit})
• 3-month expense history (was 1-month)
• Priority processing
• Email support

*LITE RECEIPTS PRESERVED:*
• Your ${liteUsed} LITE receipts this month still count
• You now have ${proLimit - liteUsed} PRO receipts available

*BILLING:*
• New rate: ${proPrice}/month
• Prorated charge applied for upgrade
• Next billing: ${user.billingCycleEnd ? new Date(user.billingCycleEnd).toLocaleDateString() : 'Unknown'}

Welcome to PRO! 🎉`);

      setTimeout(async () => {
        await this.handleMainMenuFlow(phoneNumber);
      }, 3000);

    } catch (error) {
      console.error('Error upgrading LITE to PRO:', error);
      await this.whatsAppService.sendMessage(phoneNumber,
        `❌ *UPGRADE FAILED*

Sorry, we couldn't upgrade your subscription right now.

Error: ${error.message || 'Unknown error'}

Please contact support for assistance.`);
    }
  }

  // Handle reactivate subscription - removes cancel_at_period_end flag
  async handleReactivateSubscription(phoneNumber, planType) {
    try {
      const { User } = require('../models/database/indexV2');
      const user = await User.findByPhoneNumber(phoneNumber);

      if (!user || !user.stripeSubscriptionId) {
        await this.whatsAppService.sendMessage(phoneNumber,
          `❌ *ERROR*

No subscription found to reactivate.`);
        await this.handleMainMenuFlow(phoneNumber);
        return;
      }

      // Verify the user is on the correct plan
      if (user.planType !== planType) {
        await this.whatsAppService.sendMessage(phoneNumber,
          `❌ *ERROR*

You cannot reactivate a ${planType} plan while on ${user.planType} plan.`);
        await this.handleMainMenuFlow(phoneNumber);
        return;
      }

      // Check if subscription is canceled OR if downgrade is scheduled
      const isCanceled = user.subscriptionStatus === 'canceling' || user.subscriptionStatus === 'canceled';
      const isDowngradeScheduled = user?.metadata?.scheduledDowngrade?.targetPlan === 'lite';

      // If subscription is active and no downgrade scheduled, nothing to reactivate
      if (!isCanceled && !isDowngradeScheduled) {
        await this.whatsAppService.sendMessage(phoneNumber,
          `ℹ️ *ALREADY ACTIVE*

Your subscription is already active. No need to reactivate!`);
        await this.handleManageSubscriptionCommand(phoneNumber);
        return;
      }

      const StripeService = require('../payments/stripe/StripeService');
      const stripeService = new StripeService();

      await this.whatsAppService.sendMessage(phoneNumber, '⏳ Reactivating your subscription...');

      // Get current subscription from Stripe
      const currentSubscription = await stripeService.stripe.subscriptions.retrieve(user.stripeSubscriptionId);

      // If downgrade is scheduled, we need to revert to Pro plan pricing
      let reactivatedSubscription;
      if (isDowngradeScheduled && planType === 'pro') {
        // Get user's current subscription currency
        const userCurrency = currentSubscription.currency || user.currency || 'inr';

        // Create a new Stripe Price object for the Pro plan - match user's currency
        const stripeProPrice = await stripeService.stripe.prices.create({
          currency: userCurrency,
          unit_amount: parseInt(process.env.PRO_PLAN_PRICE),
          recurring: { interval: 'month' },
          product_data: {
            name: process.env.PRO_PLAN_NAME || 'TextExpense PRO',
            metadata: {
              plan_type: 'pro'
            }
          }
        });

        // Update subscription back to Pro pricing
        reactivatedSubscription = await stripeService.stripe.subscriptions.update(
          user.stripeSubscriptionId,
          {
            items: [{
              id: currentSubscription.items.data[0].id,
              price: stripeProPrice.id
            }],
            cancel_at_period_end: false,
            proration_behavior: 'none',
            metadata: {
              scheduled_downgrade: null, // Clear the scheduled downgrade
              downgrade_canceled_at: new Date().toISOString()
            }
          }
        );

        console.log(`✅ Canceled scheduled downgrade and reverted to Pro pricing for user ${user.id}`);
      } else {
        // Just remove cancel_at_period_end flag
        reactivatedSubscription = await stripeService.stripe.subscriptions.update(
          user.stripeSubscriptionId,
          { cancel_at_period_end: false }
        );
      }

      // Update user subscription status to active and billing dates from Stripe
      const cycleEnd = reactivatedSubscription.current_period_end
        ? new Date(reactivatedSubscription.current_period_end * 1000)
        : user.billingCycleEnd || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      // Clear scheduled downgrade from metadata if it was scheduled
      if (isDowngradeScheduled) {
        await user.sequelize.query(
          'UPDATE users SET "subscriptionStatus" = :status, "billingCycleEnd" = :cycleEnd, metadata = :metadata WHERE id = :userId',
          {
            replacements: {
              status: 'active',
              cycleEnd: cycleEnd,
              metadata: JSON.stringify({}),
              userId: user.id
            }
          }
        );
      } else {
        await user.update({
          subscriptionStatus: 'active',
          billingCycleEnd: cycleEnd
        });
      }

      console.log(`✅ Subscription ${user.stripeSubscriptionId} reactivated for user ${user.id}`);

      const planNames = {
        lite: 'Lite',
        pro: 'PRO'
      };

      const planPrices = {
        lite: parseInt(process.env.LITE_PLAN_PRICE) || 299,
        pro: parseInt(process.env.PRO_PLAN_PRICE) || 499
      };

      const currencySymbol = process.env.CURRENCY_SYMBOL || '$';
      const { formatPrice } = require('../utils/priceFormatter');
      const planName = planNames[planType];
      const price = formatPrice(planPrices[planType], currencySymbol);
      const nextBillingDate = cycleEnd.toDateString();

      // Build message with additional info if downgrade was canceled
      let reactivationMessage = `✅ *SUBSCRIPTION REACTIVATED!*

Your ${planName} subscription has been successfully reactivated.`;

      if (isDowngradeScheduled) {
        reactivationMessage += `\n\n*SCHEDULED DOWNGRADE CANCELED*\nYour scheduled downgrade to Lite has been canceled.`;
      }

      reactivationMessage += `

*DETAILS:*
• Plan: ${planName} (${price}/month)
• Status: Active ✅
• Next billing: ${nextBillingDate}

Welcome back! 🎉`;

      await this.whatsAppService.sendMessage(phoneNumber, reactivationMessage);

      setTimeout(async () => {
        await this.handleMainMenuFlow(phoneNumber);
      }, 3000);

    } catch (error) {
      console.error('Error reactivating subscription:', error);
      await this.whatsAppService.sendMessage(phoneNumber,
        `❌ *REACTIVATION FAILED*

Sorry, we couldn't reactivate your subscription right now.

Error: ${error.message || 'Unknown error'}

Please try again later or contact support if the issue persists.`);
      await this.handleMainMenuFlow(phoneNumber);
    }
  }

  // Handle duplicate override - continue with processing and create new separate entry
  async handleDuplicateOverride(phoneNumber) {
    try {
      const session = await this.sessionManager.getSession(phoneNumber);

      // Check if we have duplicate handling data
      if (!session.metadata?.duplicateHandling || !session.metadata?.newReceiptData) {
        await this.whatsAppService.sendMessage(phoneNumber, 'Session expired. Please upload your receipt again.');
        await this.handleMainMenuFlow(phoneNumber);
        return;
      }

      const newReceiptData = session.metadata.newReceiptData;
      const existingReceiptId = session.metadata.existingReceiptId;

      // Show confirmation message
      await this.whatsAppService.sendMessage(phoneNumber,
        `✅ *CONTINUING*

Creating a new expense entry...`);

      // FIX: If newReceiptData lacks S3 info, copy from existing duplicate receipt
      let receiptDataWithMedia = { ...newReceiptData };

      // Check if media info is missing (happens when duplicate detected before S3 upload)
      if (!receiptDataWithMedia.s3Data && !receiptDataWithMedia.originalFileUrl && existingReceiptId) {
        console.log(`🔍 [handleDuplicateOverride] S3 data missing, fetching from existing receipt ${existingReceiptId}`);

        try {
          const ExpenseV2 = require('../models/database/ExpenseV2');
          const existingReceipt = await ExpenseV2.findByPk(existingReceiptId);

          if (existingReceipt && existingReceipt.originalDocumentUrl) {
            // Copy S3 data from existing receipt (same file, reuse URL)
            receiptDataWithMedia.originalFileUrl = existingReceipt.originalDocumentUrl;
            receiptDataWithMedia.s3Data = {
              success: true,
              url: existingReceipt.originalDocumentUrl,
              s3Key: existingReceipt.s3Key,     // CRITICAL: Use s3Key not key
              s3Bucket: existingReceipt.s3Bucket // CRITICAL: Use s3Bucket not bucket
            };
            receiptDataWithMedia.originalFilename = existingReceipt.originalFilename || receiptDataWithMedia.originalFilename;
            receiptDataWithMedia.fileType = existingReceipt.fileFormat || receiptDataWithMedia.fileType;

            console.log(`✅ [handleDuplicateOverride] Copied S3 data from existing receipt:`, {
              url: existingReceipt.originalDocumentUrl,
              s3Key: existingReceipt.s3Key,
              s3Bucket: existingReceipt.s3Bucket
            });
          } else {
            console.warn(`⚠️ [handleDuplicateOverride] Existing receipt ${existingReceiptId} has no S3 URL`);
          }
        } catch (error) {
          console.error(`❌ [handleDuplicateOverride] Failed to fetch existing receipt:`, error);
          // Continue anyway - fallback upload will be attempted during save
        }
      }

      await this.sessionManager.setCurrentReceipt(phoneNumber, receiptDataWithMedia);

      // Clear duplicate handling state and continue with category selection
      const { USER_STATES } = require('../models/database/Session');
      await this.sessionManager.updateUserState(phoneNumber, USER_STATES.WAITING_FOR_CATEGORY, {
        duplicateHandling: false,
        editingField: null,
        newReceiptData: null,
        existingReceiptId: null
        // DON'T clear customCategoryMode - let it preserve existing state
      });

      // Continue with category selection
      const DocumentProcessingHandler = require('./DocumentProcessingHandler');
      const docHandler = new DocumentProcessingHandler(this.whatsAppService, this.sessionManager);
      await docHandler.requestCategorySelection(phoneNumber, receiptDataWithMedia);

    } catch (error) {
      console.error('Error handling duplicate override:', error);
      await this.whatsAppService.sendMessage(phoneNumber, 'Sorry, something went wrong. Please try uploading your receipt again.');
      await this.handleMainMenuFlow(phoneNumber);
    }
  }

  // Send unsaved receipt warning - called before any user interaction
  async sendUnsavedReceiptWarning(phoneNumber, currentReceipt) {
    const { MESSAGE_COMMANDS } = require('../config/commands');

    const warningMessage = `⚠️ *You have an unsaved receipt*

Please save or cancel your current receipt before continuing.`;

    const warningOptions = [
      { id: MESSAGE_COMMANDS.SAVE_CURRENT_RECEIPT, text: 'Save Receipt' },
      { id: MESSAGE_COMMANDS.CANCEL_CURRENT_RECEIPT, text: 'Cancel Receipt' },
      { id: MESSAGE_COMMANDS.VIEW_CURRENT_RECEIPT, text: 'View Receipt' }
    ];

    await this.whatsAppService.sendInteractiveButtons(phoneNumber, warningMessage, warningOptions, 'unsaved_receipt_warning');
  }
}

module.exports = MenuHandler;
