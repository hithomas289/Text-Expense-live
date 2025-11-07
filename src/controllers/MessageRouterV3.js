const { USER_STATES, EXPENSE_CATEGORIES } = require('../models/database/Session');
const { MESSAGE_COMMANDS, NUMERIC_TO_COMMAND_MAPPING } = require('../config/commands');

// Import handlers
const ConfirmationHandler = require('../handlers/ConfirmationHandler');
const EditDetailsHandler = require('../handlers/EditDetailsHandler');
const CategoryHandler = require('../services/CategoryHandler');
const ShareService = require('../services/ShareService');

// Import additional handlers
const DocumentProcessingHandler = require('../handlers/DocumentProcessingHandler');
const MenuHandler = require('../handlers/MenuHandler');
const SaveReceiptHandler = require('../handlers/SaveReceiptHandler');

class MessageRouterV3 {
  constructor(whatsAppService, sessionManager) {
    this.whatsAppService = whatsAppService;
    this.sessionManager = sessionManager;
    
    // Initialize handlers
    this.confirmationHandler = new ConfirmationHandler(whatsAppService, sessionManager);
    this.editDetailsHandler = new EditDetailsHandler(whatsAppService, sessionManager);
    this.categoryHandler = new CategoryHandler(sessionManager, whatsAppService, this);
    this.menuHandler = new MenuHandler(whatsAppService, sessionManager);
    this.documentHandler = new DocumentProcessingHandler(whatsAppService, sessionManager);
    this.shareService = new ShareService(whatsAppService, sessionManager);
    this.saveReceiptHandler = new SaveReceiptHandler(whatsAppService, sessionManager);
    
    // Session timeout tracking
    this.sessionTimeouts = new Map();
    this.startTimeoutMonitoring();
  }

  async initialize() {
    await this.documentHandler.initialize();
    await this.saveReceiptHandler.initialize();
    console.log('MessageRouterV3 initialized with modular handlers');
  }

  // CLEAN MAIN ROUTING - MUCH SIMPLER!
  async routeMessage(phoneNumber, message) {
    try {
      const session = await this.sessionManager.getSession(phoneNumber);
      this.resetTimeout(phoneNumber, session.state);
      
      const messageText = message.text?.body?.trim();
      
      // Check for old button clicks and ignore them
      if (await this.isOldButtonClick(phoneNumber, message, session)) {
        return;
      }
      
      // 1. Handle non-text messages - ROUTE TO DOCUMENT HANDLER
      if (message.type === 'image') {
        await this.documentHandler.handleImageUpload(phoneNumber, message);
        return;
      }
      
      if (message.type === 'document') {
        await this.documentHandler.handleDocumentUpload(phoneNumber, message);
        return;
      }
      
      // 2. Handle interactive messages (button clicks)
      if (message.type === 'interactive') {
        const buttonId = message.interactive?.button_reply?.id ||
                        message.interactive?.list_reply?.id;

        if (buttonId) {
          console.log(`🔘 BUTTON CLICKED: ${buttonId} by ${phoneNumber}`);
          const command = this.parseCommand(buttonId, session);
          if (command) {
            await this.handleDescriptiveCommand(phoneNumber, command, session);
            return;
          }
        }
      }

      // 3. Handle text messages
      if (message.type === 'text' && messageText) {
        
        // Global commands - ROUTE TO MENU HANDLER
        if (this.isGlobalCommand(messageText.toLowerCase())) {
          await this.menuHandler.handleGlobalCommand(phoneNumber, messageText.toLowerCase());
          return;
        }
        
        // Payment completion messages
        if (this.isPaymentMessage(messageText.toLowerCase())) {
          await this.handlePaymentMessage(phoneNumber, messageText, session);
          return;
        }
        
        // Greetings - ROUTE TO MENU HANDLER
        if (this.isGreeting(messageText.toLowerCase())) {
          await this.menuHandler.handleGreeting(phoneNumber, session);
          return;
        }
        
        // Descriptive commands
        const command = this.parseCommand(messageText, session);
        console.log(`🔍 PARSE RESULT: "${messageText}" → Command: ${command}, State: ${session.state}, Metadata:`, session.metadata);
        if (command) {
          await this.handleDescriptiveCommand(phoneNumber, command, session);
          return;
        }
        
        // Legacy numeric handling
        await this.handleStateSpecificInput(phoneNumber, messageText.toLowerCase(), session);
        return;
      }
      
      await this.whatsAppService.sendMessage(phoneNumber, 
        `I can process text messages, images, and PDF documents. Please send a receipt or type "help".`);
        
    } catch (error) {
      console.error('Error in message routing:', error);
      await this.whatsAppService.sendMessage(phoneNumber, 
        'Sorry, something went wrong. Please try again.');
      await this.sessionManager.updateUserState(phoneNumber, USER_STATES.IDLE);
    }
  }

  // Handle descriptive commands
  async handleDescriptiveCommand(phoneNumber, command, session) {
    console.log(`🎯 DESCRIPTIVE COMMAND: ${command} for ${phoneNumber} (State: ${session.state})`);

    try {
      switch (command) {
        // Confirmation Commands - ROUTE TO HANDLER
        case MESSAGE_COMMANDS.EDIT_DETAILS:
          return await this.editDetailsHandler.handleEditDetailsRequest(phoneNumber);
        case MESSAGE_COMMANDS.RETAKE_DOCUMENT:
          return await this.confirmationHandler.handleRetakeRequest(phoneNumber);

        // Receipt Conflict Commands
        case MESSAGE_COMMANDS.SAVE_RECEIPT:
          return await this.documentHandler.handleSaveReceipt(phoneNumber);
        case MESSAGE_COMMANDS.CANCEL_RECEIPT:
          return await this.documentHandler.handleCancelReceipt(phoneNumber);

        // Unsaved Receipt Warning Commands
        case MESSAGE_COMMANDS.SAVE_CURRENT_RECEIPT:
          return await this.handleSaveCurrentReceipt(phoneNumber);
        case MESSAGE_COMMANDS.CANCEL_CURRENT_RECEIPT:
          return await this.handleCancelCurrentReceipt(phoneNumber);
        case MESSAGE_COMMANDS.VIEW_CURRENT_RECEIPT:
          return await this.handleViewCurrentReceipt(phoneNumber);

        // Missing File Handling Commands
        case MESSAGE_COMMANDS.UPLOAD_NEW_RECEIPT:
          return await this.handleUploadNewReceipt(phoneNumber);

        // Edit Menu Commands - ROUTE TO HANDLER
        case MESSAGE_COMMANDS.EDIT_MERCHANT_NAME:
          await this.editDetailsHandler.startMerchantEdit(phoneNumber, session);
          break;
        case MESSAGE_COMMANDS.EDIT_DATE:
          await this.editDetailsHandler.startDateEdit(phoneNumber, session);
          break;
        case MESSAGE_COMMANDS.EDIT_TOTAL_AMOUNT:
          await this.editDetailsHandler.startAmountEdit(phoneNumber, session);
          break;
        case MESSAGE_COMMANDS.EDIT_CATEGORY:
          await this.editDetailsHandler.startCategoryEdit(phoneNumber, session);
          break;
        case MESSAGE_COMMANDS.EDIT_TAX_AMOUNT:
          await this.editDetailsHandler.startTaxEdit(phoneNumber, session);
          break;
        case MESSAGE_COMMANDS.CHANGE_CURRENCY:
          await this.editDetailsHandler.handleCurrencyChange(phoneNumber, session);
          break;
        case MESSAGE_COMMANDS.DONE_EDITING:
          return await this.editDetailsHandler.finishEditing(phoneNumber, session);

        // Continue Editing Commands (Post-Edit Flow)
        case MESSAGE_COMMANDS.EDIT_MORE_DETAILS:
          return await this.confirmationHandler.handleContinueEditingInput(phoneNumber, 'edit_more_details', session);
        case MESSAGE_COMMANDS.SAVE_CHANGES:
          return await this.confirmationHandler.handleContinueEditingInput(phoneNumber, 'save_changes', session);
        case MESSAGE_COMMANDS.CANCEL_CHANGES:
          return await this.confirmationHandler.handleContinueEditingInput(phoneNumber, 'cancel_changes', session);

        // Category Selection Commands (9 categories for Extract flow)
        case MESSAGE_COMMANDS.CATEGORY_TRAVEL_ACCOMMODATION:
          await this.categoryHandler.handleCategoryInput(phoneNumber, '1');
          break;
        case MESSAGE_COMMANDS.CATEGORY_OFFICE_SUPPLIES:
          await this.categoryHandler.handleCategoryInput(phoneNumber, '2');
          break;
        case MESSAGE_COMMANDS.CATEGORY_TECHNOLOGY_SOFTWARE:
          await this.categoryHandler.handleCategoryInput(phoneNumber, '3');
          break;
        case MESSAGE_COMMANDS.CATEGORY_MEDICAL_HEALTHCARE:
          await this.categoryHandler.handleCategoryInput(phoneNumber, '4');
          break;
        case MESSAGE_COMMANDS.CATEGORY_CHILDCARE:
          await this.categoryHandler.handleCategoryInput(phoneNumber, '5');
          break;
        case MESSAGE_COMMANDS.CATEGORY_HOME_UTILITIES:
          await this.categoryHandler.handleCategoryInput(phoneNumber, '6');
          break;
        case MESSAGE_COMMANDS.CATEGORY_SHOPPING:
          await this.categoryHandler.handleCategoryInput(phoneNumber, '7');
          break;
        case MESSAGE_COMMANDS.CATEGORY_FOOD_GROCERIES:
          await this.categoryHandler.handleCategoryInput(phoneNumber, '8');
          break;
        case MESSAGE_COMMANDS.CATEGORY_CUSTOM:
          await this.categoryHandler.handleCategoryInput(phoneNumber, '9');
          break;

        // Save Receipt Category Commands (9 categories for Save flow) - ROUTE TO SAVE HANDLER
        case MESSAGE_COMMANDS.SAVE_CATEGORY_INSURANCE:
          await this.saveReceiptHandler.handleSaveCategorySelection(phoneNumber, '1', session);
          break;
        case MESSAGE_COMMANDS.SAVE_CATEGORY_WARRANTY:
          await this.saveReceiptHandler.handleSaveCategorySelection(phoneNumber, '2', session);
          break;
        case MESSAGE_COMMANDS.SAVE_CATEGORY_TAX:
          await this.saveReceiptHandler.handleSaveCategorySelection(phoneNumber, '3', session);
          break;
        case MESSAGE_COMMANDS.SAVE_CATEGORY_MEDICAL_RECORDS:
          await this.saveReceiptHandler.handleSaveCategorySelection(phoneNumber, '4', session);
          break;
        case MESSAGE_COMMANDS.SAVE_CATEGORY_APPLIANCE:
          await this.saveReceiptHandler.handleSaveCategorySelection(phoneNumber, '5', session);
          break;
        case MESSAGE_COMMANDS.SAVE_CATEGORY_TRANSPORTATION:
          await this.saveReceiptHandler.handleSaveCategorySelection(phoneNumber, '6', session);
          break;
        case MESSAGE_COMMANDS.SAVE_CATEGORY_TICKETS:
          await this.saveReceiptHandler.handleSaveCategorySelection(phoneNumber, '7', session);
          break;
        case MESSAGE_COMMANDS.SAVE_CATEGORY_MEDICAL_HEALTHCARE:
          await this.saveReceiptHandler.handleSaveCategorySelection(phoneNumber, '8', session);
          break;
        case MESSAGE_COMMANDS.SAVE_CATEGORY_CUSTOM:
          await this.saveReceiptHandler.handleSaveCategorySelection(phoneNumber, '9', session);
          break;

        // Receipt Choice Commands - ROUTE TO HANDLERS
        case MESSAGE_COMMANDS.PROCESS_EXPENSE:
          await this.documentHandler.processReceiptForExpenseTracking(phoneNumber);
          break;
        case MESSAGE_COMMANDS.SAVE_EXPENSE:
          await this.saveReceiptHandler.handleSaveDocumentCommand(phoneNumber, session);
          break;
        case MESSAGE_COMMANDS.SAVE_THIS_EXPENSE:
          {
            const session = await this.sessionManager.getSession(phoneNumber);
            await this.confirmationHandler.saveExpense(phoneNumber, session);
          }
          break;

        // Main Menu Commands - ROUTE TO HANDLERS
        case MESSAGE_COMMANDS.PROCESS_DOCUMENT:
          await this.documentHandler.handleProcessDocumentCommand(phoneNumber);
          break;
        case MESSAGE_COMMANDS.SAVE_DOCUMENT:
          await this.saveReceiptHandler.handleSaveDocumentCommand(phoneNumber);
          break;
        case MESSAGE_COMMANDS.GENERATE_REPORT:
          await this.menuHandler.handleReportCommand(phoneNumber);
          break;
        case MESSAGE_COMMANDS.VIEW_SUMMARY:
          await this.menuHandler.handleSummaryCommand(phoneNumber);
          break;
        case MESSAGE_COMMANDS.SHARE_WITH_COLLEAGUES:
          await this.menuHandler.handleShareCommand(phoneNumber);
          break;
        case MESSAGE_COMMANDS.HOW_IT_WORKS:
          await this.menuHandler.handleHowItWorksCommand(phoneNumber);
          break;
        case MESSAGE_COMMANDS.CONTACT_SUPPORT:
          await this.menuHandler.handleSupportCommand(phoneNumber);
          break;
        case MESSAGE_COMMANDS.UPGRADE_ACCOUNT:
          await this.menuHandler.handleUpgradeCommand(phoneNumber);
          break;
        case MESSAGE_COMMANDS.MANAGE_SUBSCRIPTION:
          await this.menuHandler.handleManageSubscriptionCommand(phoneNumber);
          break;

        // Report Generation Commands
        case MESSAGE_COMMANDS.REPORT_THIS_MONTH:
          await this.handleReportGeneration(phoneNumber, 'this_month');
          break;
        case MESSAGE_COMMANDS.REPORT_LAST_2_MONTHS:
          await this.handleReportGeneration(phoneNumber, 'last_2_months');
          break;
        case MESSAGE_COMMANDS.REPORT_LAST_3_MONTHS:
          await this.handleReportGeneration(phoneNumber, 'last_3_months');
          break;
        case MESSAGE_COMMANDS.REPORT_ALL_TIME:
          await this.handleReportGeneration(phoneNumber, 'all_time');
          break;

        // Navigation Commands
        case MESSAGE_COMMANDS.MAIN_MENU:
          await this.menuHandler.handleMainMenuFlow(phoneNumber, session);
          break;

        // Duplicate handling
        case 'continue_override':
          await this.menuHandler.handleDuplicateOverride(phoneNumber);
          break;

        // Upgrade buttons from monthly limit messages
        case 'upgrade_lite':
          await this.menuHandler.handleUpgradeAction(phoneNumber, 'lite');
          break;
        case 'upgrade_pro':
          await this.menuHandler.handleUpgradeProAction(phoneNumber);
          break;

        // Subscription Management
        case 'manage_subscription':
          await this.menuHandler.handleManageSubscriptionCommand(phoneNumber);
          break;
        case 'cancel_subscription':
          await this.menuHandler.handleCancelSubscriptionCommand(phoneNumber);
          break;
        case 'confirm_cancel':
          await this.menuHandler.handleConfirmCancelSubscription(phoneNumber);
          break;

        // Post Receipt Commands
        case MESSAGE_COMMANDS.GET_EXCEL_FILE:
          console.log(`🔍 DEBUG: Executing handleReportCommand for ${phoneNumber}`);
          await this.menuHandler.handleReportCommand(phoneNumber);
          console.log(`✅ DEBUG: handleReportCommand completed for ${phoneNumber}`);
          break;
        case MESSAGE_COMMANDS.QUICK_OVERVIEW:
          await this.menuHandler.handleSummaryCommand(phoneNumber);
          break;
        case MESSAGE_COMMANDS.SEND_ANOTHER_RECEIPT:
          await this.documentHandler.handleProcessDocumentCommand(phoneNumber);
          break;
        case MESSAGE_COMMANDS.UPGRADE_PRO_PLAN:
        case MESSAGE_COMMANDS.UPGRADE_TO_PRO:
          await this.menuHandler.handleUpgradeCommand(phoneNumber);
          break;

        // Save Receipt Flow Commands - ROUTE TO SAVE HANDLER
        case MESSAGE_COMMANDS.ADD_ANOTHER_RECEIPT:
          await this.saveReceiptHandler.handlePostSaveVaultChoice(phoneNumber, MESSAGE_COMMANDS.ADD_ANOTHER_RECEIPT);
          break;
        case MESSAGE_COMMANDS.DOWNLOAD_EXCEL_NOW:
          await this.saveReceiptHandler.handlePostSaveVaultChoice(phoneNumber, MESSAGE_COMMANDS.DOWNLOAD_EXCEL_NOW);
          break;

        default:
          console.log(`⚠️ Unhandled descriptive command: ${command}`);
          await this.menuHandler.handleMainMenuFlow(phoneNumber, session);
      }
    } catch (error) {
      console.error(`Error handling descriptive command ${command}:`, error);
      await this.whatsAppService.sendMessage(phoneNumber, 
        'Sorry, something went wrong. Please try again.');
    }
  }

  // State-specific input handling - ROUTE TO HANDLERS
  async handleStateSpecificInput(phoneNumber, input, session) {
    switch (session.state) {
      case USER_STATES.IDLE:
        // ROUTE TO MENU HANDLER
        await this.menuHandler.handleIdleInput(phoneNumber, input, session);
        break;
        
      case USER_STATES.WAITING_FOR_CATEGORY:
        console.log(`🏷️ ROUTING TO CATEGORY HANDLER: ${phoneNumber} input: "${input}"`);
        // Validate numeric input for category selection (unless in custom category mode)
        if (/^[1-9]$/.test(input) || session.metadata?.customCategoryMode) {
          await this.categoryHandler.handleCategoryInput(phoneNumber, input);
        } else if (!session.metadata?.customCategoryMode) {
          // Non-numeric input during category selection (and not in custom mode)
          await this.whatsAppService.sendMessage(phoneNumber,
            `⚠️ *Please select a category number*

I'm waiting for you to select a category (1-9). Please wait for the category menu to appear, then reply with the number.`);
        } else {
          // In custom category mode, allow any text input
          await this.categoryHandler.handleCategoryInput(phoneNumber, input);
        }
        break;
        
      case USER_STATES.WAITING_FOR_CONFIRMATION:
        // ROUTE TO CONFIRMATION HANDLER
        const result = await this.confirmationHandler.handleConfirmationInput(phoneNumber, input, session);
        if (result?.routeTo) {
          return await this.routeToHandler(result);
        }
        break;
        
      case USER_STATES.WAITING_FOR_MERCHANT_NAME:
        // ROUTE TO EDIT DETAILS HANDLER (legacy merchant editing)
        await this.editDetailsHandler.handleFieldInput(phoneNumber, input, session);
        break;
        
      case USER_STATES.EDITING_DETAILS:
        // ROUTE TO EDIT DETAILS HANDLER (all field editing)
        await this.editDetailsHandler.handleFieldInput(phoneNumber, input, session);
        break;

      case USER_STATES.WAITING_FOR_SAVE_CATEGORY:
        // ROUTE TO SAVE RECEIPT HANDLER (save category selection)
        // Validate numeric input for category selection
        if (/^[1-9]$/.test(input)) {
          await this.saveReceiptHandler.handleSaveCategorySelection(phoneNumber, input);
        } else {
          // Non-numeric input during category selection
          await this.whatsAppService.sendMessage(phoneNumber,
            `⚠️ *Please select a category number*

I'm waiting for you to select a category (1-9). Please wait for the category menu to appear, then reply with the number.`);
        }
        break;

      case USER_STATES.WAITING_FOR_CUSTOM_SAVE_CATEGORY:
        // ROUTE TO SAVE RECEIPT HANDLER (custom save category input)
        await this.saveReceiptHandler.handleCustomSaveCategoryInput(phoneNumber, input);
        break;

      case USER_STATES.WAITING_FOR_RECEIPT_DESCRIPTION:
        // ROUTE TO SAVE RECEIPT HANDLER (description input)
        console.log(`🔍 DEBUG: Routing to SaveReceiptHandler.handleDescriptionInput for ${phoneNumber} with input: "${input}"`);
        await this.saveReceiptHandler.handleDescriptionInput(phoneNumber, input);
        console.log(`✅ DEBUG: SaveReceiptHandler.handleDescriptionInput completed for ${phoneNumber}`);
        break;

      case USER_STATES.WAITING_FOR_CURRENCY_SELECTION:
        // ROUTE TO MENU HANDLER (currency selection)
        console.log(`💱 Routing to MenuHandler for currency selection: ${phoneNumber} input: "${input}"`);
        await this.menuHandler.handleCurrencySelection(phoneNumber, input);
        break;

      default:
        // ROUTE TO MENU HANDLER
        await this.menuHandler.handleMainMenuFlow(phoneNumber, session);
    }
  }

  // Route to specific handler based on result
  async routeToHandler(result) {
    const { routeTo, method, params } = result;
    
    switch (routeTo) {
      case 'EditDetailsHandler':
        return await this.editDetailsHandler[method](...params);
      case 'ConfirmationHandler':
        return await this.confirmationHandler[method](...params);
      default:
        console.log(`Unknown route: ${routeTo}`);
    }
  }

  // HELPER METHODS (keep essential ones only)

  isGlobalCommand(messageText) {
    return ['info', 'summary', 'report', 'reports', 'excel', 'usage', 'upgrade', 'reset'].includes(messageText);
  }

  isGreeting(messageText) {
    return ['hi', 'hello', 'hey', 'start'].includes(messageText) || messageText.includes('tell me about text expense');
  }

  parseCommand(messageText, session) {
    if (Object.values(MESSAGE_COMMANDS).includes(messageText)) {
      return messageText;
    }

    // Handle common text variations
    const textVariations = {
      'upgrade to pro': MESSAGE_COMMANDS.UPGRADE_TO_PRO,
      'upgrade pro': MESSAGE_COMMANDS.UPGRADE_TO_PRO,
      'upgrade to pro plan': MESSAGE_COMMANDS.UPGRADE_PRO_PLAN,
      'upgrade plan': MESSAGE_COMMANDS.UPGRADE_PRO_PLAN,
      'get pro': MESSAGE_COMMANDS.UPGRADE_TO_PRO,
      'buy pro': MESSAGE_COMMANDS.UPGRADE_TO_PRO
    };

    if (textVariations[messageText.toLowerCase()]) {
      return textVariations[messageText.toLowerCase()];
    }

    // Handle WhatsApp List IDs and Button IDs
    const listIdToCommand = {
      // Main menu list IDs
      'process_document': MESSAGE_COMMANDS.PROCESS_DOCUMENT,
      'generate_report': MESSAGE_COMMANDS.GENERATE_REPORT,
      'view_summary': MESSAGE_COMMANDS.VIEW_SUMMARY,
      'share_colleagues': MESSAGE_COMMANDS.SHARE_WITH_COLLEAGUES,
      'how_it_works': MESSAGE_COMMANDS.HOW_IT_WORKS,
      'contact_support': MESSAGE_COMMANDS.CONTACT_SUPPORT,
      'upgrade_account': MESSAGE_COMMANDS.UPGRADE_ACCOUNT,
      'manage_subscription': MESSAGE_COMMANDS.MANAGE_SUBSCRIPTION,
      'manage subscription': MESSAGE_COMMANDS.MANAGE_SUBSCRIPTION,
      'billing_support': 'billing_support',
      'cancel_subscription': 'cancel_subscription',
      'billing_question': 'billing_question',
      'confirm_cancel': 'confirm_cancel',
      // Upgrade buttons
      'upgrade_lite': 'upgrade_lite',
      'upgrade_pro': 'upgrade_pro',
      // Edit details list IDs
      'edit_currency': MESSAGE_COMMANDS.CHANGE_CURRENCY,
      // Receipt choice button IDs
      'process_expense': MESSAGE_COMMANDS.PROCESS_EXPENSE,
      'save_expense': MESSAGE_COMMANDS.SAVE_EXPENSE,
      // Navigation button IDs
      'main_menu': MESSAGE_COMMANDS.MAIN_MENU,
      // Duplicate handling button IDs and text
      'continue': 'continue_override',
      'continue_override': 'continue_override'
    };

    if (listIdToCommand[messageText.toLowerCase()]) {
      return listIdToCommand[messageText.toLowerCase()];
    }

    if (/^[1-9]$/.test(messageText)) {
      const context = this.getContextFromState(session.state, session.metadata);
      if (context && NUMERIC_TO_COMMAND_MAPPING[context]) {
        const command = NUMERIC_TO_COMMAND_MAPPING[context][messageText];
        if (command) {
          return command;
        }
      }

      // If numeric input doesn't map to any command in current state, it's premature/invalid
      // Return null so it can be handled gracefully
      console.log(`⚠️ [parseCommand] Numeric input "${messageText}" not valid for state ${session.state}, context: ${context}`);
    }

    return null;
  }

  getContextFromState(state, metadata) {
    // State takes priority over metadata to fix category selection bug
    if (state === USER_STATES.WAITING_FOR_CATEGORY) {
      return 'category_selection';
    }
    if (state === USER_STATES.WAITING_FOR_SAVE_CATEGORY) {
      return 'save_category_selection';
    }
    if (state === USER_STATES.WAITING_FOR_CONFIRMATION) {
      if (metadata?.editingMode && !metadata?.continueEditing) {
        return 'edit_menu';
      }
      if (metadata?.continueEditing) {
        return 'continue_editing';
      }
      return 'confirmation';
    }
    if (state === USER_STATES.IDLE) {
      // Check nested metadata first for specific contexts like report generation
      const nestedContext = metadata?.metadata?.menuContext;
      const topLevelContext = metadata?.menuContext;

      // Prioritize specific contexts over general ones
      if (nestedContext && nestedContext !== 'welcome') {
        return nestedContext;
      }
      if (topLevelContext && topLevelContext !== 'welcome') {
        return topLevelContext;
      }

      // Check for receipt choice context (check both levels)
      if (metadata?.awaitingReceiptChoice || metadata?.metadata?.awaitingReceiptChoice) {
        return 'receipt_choice';
      }
      // Check for post-receipt menu context (check both levels) - lower priority
      if (metadata?.postReceiptMenu || metadata?.metadata?.postReceiptMenu) {
        return 'post_receipt';
      }

      // If we only have 'welcome', check if nested has something better
      if (nestedContext) {
        return nestedContext;
      }
      return topLevelContext || 'main_menu';
    }
    return null;
  }

  // Handle report generation - ROUTE TO MENU HANDLER
  async handleReportGeneration(phoneNumber, period) {
    // Delegate to MenuHandler which will use ExcelReportService
    await this.menuHandler.handleReportGeneration(phoneNumber, period);
  }

  // All functionality now handled by specialized handlers
  // This router is now purely for message routing and coordination

  resetTimeout(phoneNumber, state) {
    // TODO: Implement timeout reset
  }

  startTimeoutMonitoring() {
    // TODO: Implement timeout monitoring
  }

  // Check if this is an old button click that should be ignored
  async isOldButtonClick(phoneNumber, message, session) {
    // Only check for button/list clicks, not regular text messages
    if (!message.isInteractiveReply) {
      return false;
    }

    // If no latest message ID stored, allow the click (first time)
    if (!session.metadata?.latestMessageId) {
      return false;
    }

    // Check if message has context (reply to another message)
    if (message.context?.messageId) {
      const contextMessageId = message.context.messageId;
      const latestMessageId = session.metadata.latestMessageId;
      
      // If context message ID doesn't match latest interactive message ID, it's old
      if (contextMessageId !== latestMessageId) {
        await this.whatsAppService.sendMessage(phoneNumber, 
          `⚠️ Please use the latest options provided above.`);
        return true;
      }
    }

    return false;
  }

  // Check if message is payment-related
  isPaymentMessage(text) {
    const paymentKeywords = [
      'payment completed successfully',
      'payment was cancelled',
      'payment success',
      'payment failed',
      'payment complete'
    ];
    
    return paymentKeywords.some(keyword => text.includes(keyword));
  }

  // Handle payment-related messages
  async handlePaymentMessage(phoneNumber, messageText, session) {
    try {
      // Refresh user subscription data from database
      await this.sessionManager.refreshUserSubscription(phoneNumber);
      
      if (messageText.includes('payment completed successfully') || messageText.includes('payment success')) {
        // Clear payment progress flag and restore receipt context if exists
        const metadata = session.metadata || {};
        const hasUnsavedReceipt = session.currentReceipt && Object.keys(session.currentReceipt).length > 0;

        await this.sessionManager.updateUserState(phoneNumber, null, {
          ...metadata,
          paymentInProgress: false,
          paymentStartTime: null,
          upgradeCompleted: true,
          upgradeCompletedAt: new Date()
        });

        // Payment successful
        await this.whatsAppService.sendMessage(phoneNumber,
          `🎉 *WELCOME TO TEXTEXPENSE PRO!*

Your payment has been processed and your PRO subscription is now active!

✅ *ACTIVATED BENEFITS:*
• ${parseInt(process.env.PRO_RECEIPT_LIMIT) || 25} receipts per month
• 3-months expense history
• Priority processing
• Email support

Ready to process more expenses? Let's get started!`);

        // Check if user had an unsaved receipt before payment
        if (hasUnsavedReceipt) {
          setTimeout(async () => {
            await this.whatsAppService.sendMessage(phoneNumber,
              `📄 *RESUMING YOUR RECEIPT*

You had an unsaved receipt before upgrading. Since you're now on PRO, you can save it!`);

            // Show the unsaved receipt warning again so user can save it
            await this.menuHandler.sendUnsavedReceiptWarning(phoneNumber, session.currentReceipt);
          }, 2000);
        } else {
          // Show main menu after a brief pause
          setTimeout(async () => {
            await this.menuHandler.handleMainMenuFlow(phoneNumber);
          }, 2000);
        }
        
      } else if (messageText.includes('payment was cancelled') || messageText.includes('payment cancel')) {
        // Payment cancelled
        await this.whatsAppService.sendMessage(phoneNumber, 
          `💰 *PAYMENT CANCELLED*

No worries! Your payment was cancelled and no charges were made.

You can upgrade to PRO anytime from the main menu when you're ready.`);
        
        // Show main menu
        setTimeout(async () => {
          await this.menuHandler.handleMainMenuFlow(phoneNumber);
        }, 1500);
      }
      
    } catch (error) {
      console.error('Error handling payment message:', error);
      await this.whatsAppService.sendMessage(phoneNumber,
        `Thanks for the update! Let me show you the main menu.`);
      await this.menuHandler.handleMainMenuFlow(phoneNumber);
    }
  }

  // Handle unsaved receipt warning button clicks
  async handleSaveCurrentReceipt(phoneNumber) {
    try {
      const session = await this.sessionManager.getSession(phoneNumber);

      if (!session.currentReceipt) {
        await this.whatsAppService.sendMessage(phoneNumber,
          `No receipt found to save. Let me show you the main menu.`);
        return await this.menuHandler.handleMainMenuFlow(phoneNumber);
      }

      // Route to confirmation handler to save the current receipt
      return await this.confirmationHandler.saveExpense(phoneNumber, session);
    } catch (error) {
      console.error('Error saving current receipt:', error);
      await this.whatsAppService.sendMessage(phoneNumber,
        `Sorry, something went wrong. Please try again.`);
      await this.menuHandler.handleMainMenuFlow(phoneNumber);
    }
  }

  async handleCancelCurrentReceipt(phoneNumber) {
    try {
      // Clear the current receipt and show main menu
      await this.sessionManager.setCurrentReceipt(phoneNumber, null);
      await this.sessionManager.updateUserState(phoneNumber, USER_STATES.IDLE);

      await this.whatsAppService.sendMessage(phoneNumber,
        `✅ Receipt cancelled. You can now upload a new receipt.`);

      await this.menuHandler.handleMainMenuFlow(phoneNumber);
    } catch (error) {
      console.error('Error cancelling current receipt:', error);
      await this.whatsAppService.sendMessage(phoneNumber,
        `Sorry, something went wrong. Please try again.`);
      await this.menuHandler.handleMainMenuFlow(phoneNumber);
    }
  }

  async handleViewCurrentReceipt(phoneNumber) {
    try {
      const session = await this.sessionManager.getSession(phoneNumber);

      if (!session.currentReceipt) {
        await this.whatsAppService.sendMessage(phoneNumber,
          `No receipt found to view. Let me show you the main menu.`);
        return await this.menuHandler.handleMainMenuFlow(phoneNumber);
      }

      // Route to confirmation handler to display the current receipt
      return await this.confirmationHandler.displayReceiptDetails(phoneNumber, session.currentReceipt);
    } catch (error) {
      console.error('Error viewing current receipt:', error);
      await this.whatsAppService.sendMessage(phoneNumber,
        `Sorry, something went wrong. Please try again.`);
      await this.menuHandler.handleMainMenuFlow(phoneNumber);
    }
  }

  async handleUploadNewReceipt(phoneNumber) {
    try {
      // Clear the current receipt and reset to idle state
      await this.sessionManager.setCurrentReceipt(phoneNumber, null);
      await this.sessionManager.updateUserState(phoneNumber, USER_STATES.IDLE);

      await this.whatsAppService.sendMessage(phoneNumber,
        `✅ *Ready for New Receipt*

Please upload your receipt image or PDF document now.

I'll extract all the details (merchant, amount, date, etc.) and let you save it properly with file reference for Excel downloads.`);

      // Show main menu so user can choose to process document
      await this.menuHandler.handleMainMenuFlow(phoneNumber);
    } catch (error) {
      console.error('Error handling upload new receipt:', error);
      await this.whatsAppService.sendMessage(phoneNumber,
        `Sorry, something went wrong. Please try again.`);
      await this.menuHandler.handleMainMenuFlow(phoneNumber);
    }
  }
}

module.exports = MessageRouterV3;