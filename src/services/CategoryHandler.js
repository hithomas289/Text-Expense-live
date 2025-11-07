const { EXPENSE_CATEGORIES, USER_STATES } = require('../models/database/Session');
const CurrencyService = require('./CurrencyService');

class CategoryHandler {
  constructor(sessionManager, whatsAppService, messageRouter) {
    this.sessionManager = sessionManager;
    this.whatsAppService = whatsAppService;
    this.messageRouter = messageRouter; // For accessing methods like handleCategorySelection
    this.currencyService = new CurrencyService();
  }

  // Show category selection menu
  async showCategoryMenu(phoneNumber, customMessage = null) {
    const categoryMessage = customMessage || `🏷️ *SELECT EXPENSE CATEGORY:*

1️⃣ Business Expense
2️⃣ Meals & Entertainment
3️⃣ Travel & Accommodation
4️⃣ Office & Supplies
5️⃣ Subscriptions & Software
6️⃣ Medical & Healthcare
7️⃣ Home & Utilities
8️⃣ Shopping & Personal
9️⃣ Custom Category ✏️


Don't worry if something needs fixing
You can edit *ALL DETAILS* in the next step!

Reply with number (1-9):`;

    await this.whatsAppService.sendMessage(phoneNumber, categoryMessage);
  }

  // Validate category input (1-9)
  validateCategoryInput(input) {
    if (!/^[1-9]$/.test(input)) {
      return { valid: false, error: 'Invalid input format' };
    }

    const categoryId = parseInt(input);
    const category = EXPENSE_CATEGORIES.find(c => c.id === categoryId);
    
    if (!category) {
      return { valid: false, error: 'Category not found' };
    }

    return { valid: true, category: category.name };
  }

  // Handle category input from user
  async handleCategoryInput(phoneNumber, input) {
    const session = await this.sessionManager.getSession(phoneNumber);
    console.log(`🔍 CategoryHandler: Session retrieved for ${phoneNumber}, currentReceipt exists: ${!!session.currentReceipt}`);

    // STATE VALIDATION: Check if user is in correct state to select category
    if (session.state !== USER_STATES.WAITING_FOR_CATEGORY) {
      console.log(`⚠️ [CategoryHandler] User ${phoneNumber} tried to select category but state is ${session.state}, not WAITING_FOR_CATEGORY`);
      await this.whatsAppService.sendMessage(phoneNumber,
        `⚠️ *Please wait for the category menu*

I'm still processing your previous action. Please wait for the category options to appear before making a selection.`);
      return;
    }

    // Check if we're in custom category mode (after selecting "Custom Category")
    if (session.metadata?.customCategoryMode) {
      // But first check if input is a valid category number (1-9)
      // This handles cases where customCategoryMode got stuck from previous interaction
      const categoryValidation = this.validateCategoryInput(input);
      if (categoryValidation.valid) {
        // Clear custom category mode and handle as normal category selection
        await this.sessionManager.updateUserState(phoneNumber, session.state, {
          customCategoryMode: false
        });
        console.log(`🔄 Clearing stuck customCategoryMode, treating "${input}" as category selection`);
      } else {
        await this.handleCustomCategoryInput(phoneNumber, input, session);
        return;
      }
    }

    const validation = this.validateCategoryInput(input);

    if (!validation.valid) {
      await this.sendCategoryError(phoneNumber);
      return;
    }

    // Check if we're editing a category
    if (session.metadata?.editingField === 'category') {
      await this.handleCategoryEdit(phoneNumber, validation.category, session);
    } else {
      // Normal category selection flow - handle directly
      await this.handleCategorySelection(phoneNumber, validation.category, session);
    }
  }

  // Handle normal category selection (not editing)
  async handleCategorySelection(phoneNumber, category, session) {
    try {
      // Special handling for "Custom Category" - allow manual entry
      // Check if category contains "Custom"
      if (category.includes('Custom')) {
        await this.whatsAppService.sendMessage(phoneNumber,
          `🏷️ *CUSTOM CATEGORY*

Type any category you want!

*Examples:*
• Medical Expenses
• Education
• Equipment
• Office Supplies

*Type your custom category:*`);

        // Set state to wait for custom category input
        await this.sessionManager.updateUserState(phoneNumber, USER_STATES.WAITING_FOR_CATEGORY, {
          customCategoryMode: true
        });
        return;
      }
      
      // Check if we have a current receipt to set category on
      if (!session.currentReceipt) {
        await this.whatsAppService.sendMessage(phoneNumber,
          `❌ *SESSION EXPIRED*

Your receipt session has expired. Please upload a new receipt to continue.`);

        // Send buttons for next action
        const sessionExpiredOptions = [
          { id: 'process_document', text: 'Process New Expense' },
          { id: 'main_menu', text: 'Main Menu' }
        ];
        await this.whatsAppService.sendInteractiveButtons(phoneNumber, 'What would you like to do?', sessionExpiredOptions, 'session_expired');

        // Reset to idle state
        await this.sessionManager.updateUserState(phoneNumber, 'idle');
        return;
      }

      // Normal category handling for predefined categories
      console.log('Setting category:', category, 'Type:', typeof category);
      const selectedCategory = typeof category === 'string' ? category : category.name || 'Other';
      session.currentReceipt.category = selectedCategory;
      await this.sessionManager.setCurrentReceipt(phoneNumber, session.currentReceipt);

      // Send category confirmation message
      await this.whatsAppService.sendMessage(phoneNumber, `✅ *Selected: ${selectedCategory}*`);

      // Move to confirmation state
      await this.sessionManager.updateUserState(phoneNumber, USER_STATES.WAITING_FOR_CONFIRMATION);

      // Import and use ConfirmationHandler to display receipt details
      const ConfirmationHandler = require('../handlers/ConfirmationHandler');
      const confirmationHandler = new ConfirmationHandler(this.whatsAppService, this.sessionManager);

      // Debug: Log receipt structure
      console.log(`📋 Receipt structure before displayReceiptDetails:`, {
        hasDate: !!session.currentReceipt.date,
        hasMerchant: !!session.currentReceipt.merchantName,
        hasTotal: !!session.currentReceipt.totalAmount,
        category: session.currentReceipt.category,
        keys: Object.keys(session.currentReceipt)
      });

      await confirmationHandler.displayReceiptDetails(phoneNumber, session.currentReceipt);

    } catch (error) {
      console.error('❌ Error handling category selection:', error);
      console.error('Error stack:', error.stack);
      console.error('Receipt data:', session.currentReceipt);

      // CRITICAL: Clear currentReceipt on error to prevent stuck state
      try {
        console.log(`🧹 [CategoryHandler] Clearing currentReceipt due to category selection error`);
        await this.sessionManager.updateUserState(phoneNumber, USER_STATES.IDLE, {
          metadata: {},
          currentReceipt: null
        });
      } catch (clearError) {
        console.error('❌ [CategoryHandler] Failed to clear currentReceipt:', clearError);
      }

      await this.whatsAppService.sendMessage(phoneNumber,
        '⚠️ Sorry, something went wrong. Your receipt was not saved. Please try uploading again.');
    }
  }

  // Handle custom category input (when user types their own category after selecting "Custom Category")
  async handleCustomCategoryInput(phoneNumber, input, session) {
    try {
      // Validate custom category input
      const customCategory = input.trim();
      if (!customCategory || customCategory.length < 2) {
        await this.whatsAppService.sendMessage(phoneNumber, 
          `❌ *CATEGORY TOO SHORT*
          
Please enter a valid category name (at least 2 characters):

*Examples:*
• Medical Expenses
• Education 
• Equipment
• Office Supplies

*Type your custom category:*`);
        return;
      }
      
      if (customCategory.length > 30) {
        await this.whatsAppService.sendMessage(phoneNumber, 
          `❌ *CATEGORY TOO LONG*
          
Please keep category name under 30 characters:

*Type your custom category:*`);
        return;
      }
      
      // Check if we have a current receipt to set category on
      if (!session.currentReceipt) {
        await this.whatsAppService.sendMessage(phoneNumber,
          `❌ *SESSION EXPIRED*

Your receipt session has expired. Please upload a new receipt to continue.`);

        // Send buttons for next action
        const sessionExpiredOptions = [
          { id: 'process_document', text: 'Process New Expense' },
          { id: 'main_menu', text: 'Main Menu' }
        ];
        await this.whatsAppService.sendInteractiveButtons(phoneNumber, 'What would you like to do?', sessionExpiredOptions, 'session_expired');

        // Clear custom category mode and reset to idle
        await this.sessionManager.updateUserState(phoneNumber, 'idle', {
          customCategoryMode: false
        });
        return;
      }

      // Set the custom category
      session.currentReceipt.category = customCategory;
      await this.sessionManager.setCurrentReceipt(phoneNumber, session.currentReceipt);

      // Check if we're in editing mode
      if (session.metadata?.editingField === 'category') {
        // Editing flow - show update confirmation and expense summary
        await this.whatsAppService.sendMessage(phoneNumber, `✅ *UPDATED!*
Category: ${customCategory}`);

        // Show complete updated expense summary
        const currency = session.currentReceipt?.currency || 'INR';
        const currencySymbol = this.currencyService.getCurrencySymbol(currency);

        const details = `📋 *EXPENSE SUMMARY*

• Invoice No: ${session.currentReceipt.invoiceNumber || 'Not available'}
• Date: ${session.currentReceipt.date}
• Merchant: ${session.currentReceipt.merchantName}
• Category: ${session.currentReceipt.category}
• Subtotal: ${currencySymbol}${session.currentReceipt.subtotal?.toFixed(2) || (session.currentReceipt.totalAmount - (session.currentReceipt.taxAmount || 0)).toFixed(2)}
• Tax: ${currencySymbol}${session.currentReceipt.taxAmount?.toFixed(2) || '0.00'}
• Miscellaneous: ${currencySymbol}${(session.currentReceipt.miscellaneous || 0).toFixed(2)}
• *Total: ${currencySymbol}${session.currentReceipt.totalAmount?.toFixed(2) || '0.00'}*`;

        await this.whatsAppService.sendMessage(phoneNumber, details);

        // Show continue editing options
        const continueEditingOptions = [
          { id: 'edit_more_details', text: 'Edit More Details' },
          { id: 'save_changes', text: 'Save Changes' },
          { id: 'cancel_changes', text: 'Cancel Changes' }
        ];

        await this.whatsAppService.sendInteractiveButtons(phoneNumber, '*CONTINUE EDITING?*', continueEditingOptions, 'continue_editing');

        // Clear custom category mode and set to continue editing state
        await this.sessionManager.updateUserState(phoneNumber, USER_STATES.WAITING_FOR_CONFIRMATION, {
          customCategoryMode: false,
          continueEditing: true
        });
      } else {
        // Normal category selection flow
        await this.whatsAppService.sendMessage(phoneNumber, `✅ *Selected: ${customCategory}*`);

        // Clear custom category mode and move to confirmation
        await this.sessionManager.updateUserState(phoneNumber, USER_STATES.WAITING_FOR_CONFIRMATION, {
          customCategoryMode: false
        });

        // Show receipt details for confirmation
        const ConfirmationHandler = require('../handlers/ConfirmationHandler');
        const confirmationHandler = new ConfirmationHandler(this.whatsAppService, this.sessionManager);
        await confirmationHandler.displayReceiptDetails(phoneNumber, session.currentReceipt);
      }

    } catch (error) {
      console.error('Error handling custom category input:', error);

      // CRITICAL: Clear currentReceipt on error to prevent stuck state
      try {
        console.log(`🧹 [CategoryHandler] Clearing currentReceipt due to custom category error`);
        await this.sessionManager.updateUserState(phoneNumber, USER_STATES.IDLE, {
          metadata: {},
          currentReceipt: null
        });
      } catch (clearError) {
        console.error('❌ [CategoryHandler] Failed to clear currentReceipt:', clearError);
      }

      await this.whatsAppService.sendMessage(phoneNumber,
        '⚠️ Sorry, something went wrong. Your receipt was not saved. Please try uploading again.');
    }
  }

  // Handle category editing
  async handleCategoryEdit(phoneNumber, category, session) {
    // Special handling for "Custom Category" - allow custom entry during editing too
    // Check if category contains "Custom"
    if (category.includes('Custom')) {
      await this.whatsAppService.sendMessage(phoneNumber,
        `🏷️ *CUSTOM CATEGORY*

Type any category you want!

*Examples:*
• Medical Expenses
• Education
• Equipment
• Office Supplies

*Type your custom category:*`);

      // Set state to wait for custom category input with editing context
      await this.sessionManager.updateUserState(phoneNumber, USER_STATES.WAITING_FOR_CATEGORY, {
        customCategoryMode: true,
        editingField: 'category'
      });
      return;
    }

    // Update the category in current receipt
    // category is already the string name from validateCategoryInput
    session.currentReceipt.category = category;
    await this.sessionManager.setCurrentReceipt(phoneNumber, session.currentReceipt);

    // First show quick update confirmation
    await this.whatsAppService.sendMessage(phoneNumber,
      `✅ *UPDATED!*
Category: ${category}`);

    // Then show complete updated expense summary
    const currency = session.currentReceipt?.currency || 'INR';
    const currencySymbol = this.currencyService.getCurrencySymbol(currency);

    const details = `📋 *EXPENSE SUMMARY*

• Invoice No: ${session.currentReceipt.invoiceNumber || 'Not available'}
• Date: ${session.currentReceipt.date}
• Merchant: ${session.currentReceipt.merchantName}
• Category: ${session.currentReceipt.category}
• Subtotal: ${currencySymbol}${session.currentReceipt.subtotal?.toFixed(2) || (session.currentReceipt.totalAmount - (session.currentReceipt.taxAmount || 0)).toFixed(2)}
• Tax: ${currencySymbol}${session.currentReceipt.taxAmount?.toFixed(2) || '0.00'}
• Miscellaneous: ${currencySymbol}${(session.currentReceipt.miscellaneous || 0).toFixed(2)}
• *Total: ${currencySymbol}${session.currentReceipt.totalAmount?.toFixed(2) || '0.00'}*`;

    await this.whatsAppService.sendMessage(phoneNumber, details);

    // Show continue editing options as WhatsApp buttons (consistent with EditDetailsHandler)
    const continueEditingOptions = [
      { id: 'edit_more_details', text: 'Edit More Details' },
      { id: 'save_changes', text: 'Save Changes' },
      { id: 'cancel_changes', text: 'Cancel Changes' }
    ];

    await this.whatsAppService.sendInteractiveButtons(phoneNumber, '*CONTINUE EDITING?*', continueEditingOptions, 'continue_editing');

    await this.sessionManager.updateUserState(phoneNumber, USER_STATES.WAITING_FOR_CONFIRMATION, {
      continueEditing: true
    });
  }

  // Send category error message
  async sendCategoryError(phoneNumber) {
    await this.whatsAppService.sendMessage(phoneNumber,
      `❌ *INVALID CHOICE*

🏷️ *SELECT EXPENSE CATEGORY:*
1️⃣ Business Expense
2️⃣ Meals & Entertainment
3️⃣ Travel & Accommodation
4️⃣ Office & Supplies
5️⃣ Subscriptions & Software
6️⃣ Medical & Healthcare
7️⃣ Home & Utilities
8️⃣ Shopping & Personal
9️⃣ Custom Category ✏️


Don't worry if something needs fixing
You can edit *ALL DETAILS* in the next step!

Reply with number (1-9):`);
  }


  // Get all available categories
  getAllCategories() {
    return EXPENSE_CATEGORIES;
  }

  // Get category by ID
  getCategoryById(id) {
    return EXPENSE_CATEGORIES.find(c => c.id === parseInt(id));
  }

  // Get category by name
  getCategoryByName(name) {
    return EXPENSE_CATEGORIES.find(c => c.name.toLowerCase() === name.toLowerCase());
  }
}

module.exports = CategoryHandler;