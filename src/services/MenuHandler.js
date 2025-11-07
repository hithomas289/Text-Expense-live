class MenuHandler {
  constructor(whatsAppService, sessionManager) {
    this.whatsAppService = whatsAppService;
    this.sessionManager = sessionManager;
  }

  // Main menu options definition
  getMainMenuOptions(isFreePlan) {
    const options = [
      { id: 'main_1', text: 'Process Document' },
      { id: 'main_2', text: 'Generate Report' },
      { id: 'main_3', text: 'View Summary' },
      { id: 'main_4', text: 'Share TextExpense' },
      { id: 'main_5', text: 'How It Works' },
      { id: 'main_6', text: 'Contact Support' }
    ];

    // Only add Upgrade option for free users
    if (isFreePlan) {
      options.push({ id: 'main_7', text: 'Upgrade Account' });
    }

    return options;
  }

  // Display main menu
  async showMainMenu(phoneNumber) {
    const mainMenuMessage = `I didn't understand that. Here are your options:

  *MAIN MENU:*`;

    const session = await this.sessionManager.getSession(phoneNumber);
    const isFreePlan = session.plan !== 'pro';
    const mainMenuOptions = this.getMainMenuOptions(isFreePlan);

    await this.whatsAppService.sendOptions(phoneNumber, mainMenuMessage, mainMenuOptions, 'main');
  }

  // Route main menu selections
  async handleMainMenuSelection(phoneNumber, option, handlers) {
    try {
      switch (option) {
        case '1': // Process Document
          const processMessage = `📸 *SEND YOUR EXPENSE*

*SUPPORTED FORMATS:*
📄 PDF, JPG, JPEG, PNG, DOCX, WebP

*TIPS FOR BEST RESULTS:*
✅ Good lighting, no shadows
✅ Hold device steady
✅ Flat surface
✅ All text visible

*Resend your document now*`;
          await this.whatsAppService.sendMessage(phoneNumber, processMessage);
          break;
          
        case '2': // Generate Report
          console.log('🔍 MenuHandler calling handleReportCommand');
          if (!handlers.handleReportCommand) {
            throw new Error('handleReportCommand handler not found');
          }
          await handlers.handleReportCommand(phoneNumber);
          break;
          
        case '3': // View Summary
          console.log('🔍 MenuHandler calling handleSummaryCommand');
          if (!handlers.handleSummaryCommand) {
            throw new Error('handleSummaryCommand handler not found');
          }
          await handlers.handleSummaryCommand(phoneNumber);
          break;
          
        case '4': // Share TextExpense
          console.log('🔍 MenuHandler calling handleShareTextExpenseFlow');
          if (!handlers.handleShareTextExpenseFlow) {
            throw new Error('handleShareTextExpenseFlow handler not found');
          }
          await handlers.handleShareTextExpenseFlow(phoneNumber);
          break;
          
        case '5': // How It Works
          console.log('🔍 MenuHandler calling handleHowItWorksFlow');
          if (!handlers.handleHowItWorksFlow) {
            throw new Error('handleHowItWorksFlow handler not found');
          }
          await handlers.handleHowItWorksFlow(phoneNumber);
          break;
          
        case '6': // Contact Support
          console.log('🔍 MenuHandler calling handleContactSupportFlow');
          if (!handlers.handleContactSupportFlow) {
            throw new Error('handleContactSupportFlow handler not found');
          }
          await handlers.handleContactSupportFlow(phoneNumber);
          break;
          
        case '7': // Upgrade Account
          console.log('🔍 MenuHandler calling handleUpgradeAccountFlow');
          const session = await this.sessionManager.getSession(phoneNumber);
          if (session.plan !== 'pro') {
            if (!handlers.handleUpgradeAccountFlow) {
              throw new Error('handleUpgradeAccountFlow handler not found');
            }
            await handlers.handleUpgradeAccountFlow(phoneNumber);
          } else {
            await this.whatsAppService.sendMessage(phoneNumber, 
              'Please select 1-6 for menu options.');
          }
          break;
          
        default:
          const session2 = await this.sessionManager.getSession(phoneNumber);
          const isFreePlan = session2.plan !== 'pro';
          const maxOption = isFreePlan ? 7 : 6;
          await this.whatsAppService.sendMessage(phoneNumber, 
            `Please select 1-${maxOption} for menu options.`);
      }
    } catch (error) {
      console.error(`❌ Error in MenuHandler.handleMainMenuSelection for option ${option}:`, error);
      throw error; // Re-throw to let MessageRouter handle it
    }
  }


  // Handle post-receipt menu (for users who just saved receipts)
  async handlePostReceiptMenu(phoneNumber, option, handlers) {
    try {
      switch (option) {
        case '1': // Get Excel file
          // Clear post-receipt flag and handle report
          await this.sessionManager.updateUserState(phoneNumber, 'idle', { postReceiptMenu: false });
          await handlers.handleReportCommand(phoneNumber);
          break;
        case '2': // Quick overview
          // Clear post-receipt flag and handle summary
          await this.sessionManager.updateUserState(phoneNumber, 'idle', { postReceiptMenu: false });
          await handlers.handleSummaryCommand(phoneNumber);
          break;
        case '3': // Send another receipt
          // Clear post-receipt flag and show message for new receipt
          await this.sessionManager.updateUserState(phoneNumber, 'idle', { postReceiptMenu: false });
          const helpMessage = `📸 *SEND ANOTHER RECEIPT*

Simply send me:
• Receipt photo (JPG, PNG, WebP)
• PDF document
• Any clear receipt image

I'll process it automatically!`;
          await this.whatsAppService.sendMessage(phoneNumber, helpMessage);
          break;
        case '4': // All commands (help)
          // Clear post-receipt flag and show help
          await this.sessionManager.updateUserState(phoneNumber, 'idle', { postReceiptMenu: false });
          await handlers.handleHelpCommand(phoneNumber);
          break;
        default:
          // For invalid options in post-receipt context, show the main menu
          await this.sessionManager.updateUserState(phoneNumber, 'idle', { postReceiptMenu: false });
          await this.handleMainMenuSelection(phoneNumber, option, handlers);
      }
    } catch (error) {
      console.error(`❌ Error in MenuHandler.handlePostReceiptMenu for option ${option}:`, error);
      throw error;
    }
  }

  // Determine which menu context to use based on user state
  async determineMenuContext(phoneNumber) {
    const session = await this.sessionManager.getSession(phoneNumber);
    
    // Check if user is in post-receipt menu context
    if (session.metadata && session.metadata.postReceiptMenu) {
      return 'post_receipt';
    }
    
    return 'main_menu';
  }

  // Main entry point for handling menu selections
  async handleMenuSelection(phoneNumber, input, handlers) {
    const menuContext = await this.determineMenuContext(phoneNumber);
    
    if (menuContext === 'post_receipt') {
      await this.handlePostReceiptMenu(phoneNumber, input, handlers);
    } else {
      await this.handleMainMenuSelection(phoneNumber, input, handlers);
    }
  }
}

module.exports = MenuHandler;