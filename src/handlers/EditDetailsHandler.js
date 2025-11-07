const { USER_STATES, EXPENSE_CATEGORIES } = require('../models/database/Session');
const { MESSAGE_COMMANDS } = require('../config/commands');
const CurrencyService = require('../services/CurrencyService');

class EditDetailsHandler {
  constructor(whatsAppService, sessionManager) {
    this.whatsAppService = whatsAppService;
    this.sessionManager = sessionManager;
    this.currencyService = new CurrencyService();
  }

  // Get currency with proper fallback to user's default
  async getCurrencyWithFallback(phoneNumber, session) {
    // Priority 1: Receipt's detected currency
    if (session.currentReceipt?.currency) {
      return session.currentReceipt.currency;
    }

    // Priority 2: User's saved default currency from database
    const userCurrency = await this.currencyService.getUserDefaultCurrency(phoneNumber);
    return userCurrency.currency;
  }

  // Main edit details request - WHATSAPP LIST FLOW
  async handleEditDetailsRequest(phoneNumber) {
    const session = await this.sessionManager.getSession(phoneNumber);
    
    const editMessage = `What would you like to edit?`;
    
    const editOptions = [
      { id: 'edit_merchant', title: 'Merchant Name', description: 'Change the merchant name' },
      { id: 'edit_date', title: 'Date', description: 'Update the date' },
      { id: 'edit_amount', title: 'Total Amount', description: 'Modify the total amount' },
      { id: 'edit_subtotal', title: 'Subtotal', description: 'Update subtotal amount' },
      { id: 'edit_tax', title: 'Tax Amount', description: 'Update tax amount' },
      { id: 'edit_misc', title: 'Miscellaneous', description: 'Update miscellaneous amount' },
      { id: 'edit_category', title: 'Category', description: 'Change expense category' },
      { id: 'edit_currency', title: 'Change Currency', description: 'Currency Symbol updated' }
      
    ];
    
    await this.whatsAppService.sendInteractiveList(phoneNumber, editMessage, editOptions, 'Edit Options', 'Edit Details');
    
    // Create backup of current receipt for cancel functionality
    const originalReceipt = JSON.parse(JSON.stringify(session.currentReceipt));
    
    // Use metadata to track editing mode with original receipt backup
    await this.sessionManager.updateUserState(phoneNumber, USER_STATES.WAITING_FOR_CONFIRMATION, { 
      editingMode: true, 
      continueEditing: false, 
      editingField: null,
      originalReceipt: originalReceipt  // Store original state for cancel
    });
  }

  // Handle editing menu input
  async handleEditingInput(phoneNumber, input, session) {
    const editActions = {
      // WhatsApp list IDs (from editOptions)
      'edit_merchant': 'merchant',
      'edit_date': 'date',
      'edit_amount': 'amount',
      'edit_subtotal': 'subtotal',
      'edit_tax': 'tax',
      'edit_misc': 'misc',
      'edit_category': 'category',
      'edit_currency': 'currency',
      // Legacy uppercase keys for backward compatibility
      'EDIT_MERCHANT_NAME': 'merchant',
      'EDIT_DATE': 'date',
      'EDIT_TOTAL_AMOUNT': 'amount',
      'EDIT_SUBTOTAL': 'subtotal',
      'EDIT_TAX_AMOUNT': 'tax',
      'EDIT_MISC': 'misc',
      'EDIT_CATEGORY': 'category',
      'CHANGE_CURRENCY': 'currency',
      'DONE_EDITING': 'done',
      // Number keys for fallback
      '1': 'merchant',
      '2': 'date',
      '3': 'amount',
      '4': 'subtotal',
      '5': 'tax',
      '6': 'misc',
      '7': 'category',
      '8': 'currency',
      '9': 'done'
    };
    
    const action = editActions[input.toUpperCase()] || editActions[input];
    
    if (action) {
      try {
        switch (action) {
          case 'merchant':
            await this.startMerchantEdit(phoneNumber, session);
            break;
          case 'date':
            await this.startDateEdit(phoneNumber, session);
            break;
          case 'amount':
            await this.startAmountEdit(phoneNumber, session);
            break;
          case 'subtotal':
            await this.startSubtotalEdit(phoneNumber, session);
            break;
          case 'tax':
            await this.startTaxEdit(phoneNumber, session);
            break;
          case 'misc':
            await this.startMiscEdit(phoneNumber, session);
            break;
          case 'category':
            await this.startCategoryEdit(phoneNumber, session);
            break;
          case 'currency':
            await this.handleCurrencyChange(phoneNumber, session);
            break;
          case 'done':
            return await this.finishEditing(phoneNumber, session);
        }
      } catch (error) {
        await this.whatsAppService.sendMessage(phoneNumber, 
          `❌ Error processing edit request. Please try again.`);
        await this.sendEditingError(phoneNumber);
      }
    } else {
      await this.sendEditingError(phoneNumber);
    }
  }

  // Start merchant edit
  async startMerchantEdit(phoneNumber, session) {
    const currentMerchant = session.currentReceipt?.merchantName || 'Unknown';
    await this.whatsAppService.sendMessage(phoneNumber, 
      `✏️ *EDIT MERCHANT NAME*

Current: ${currentMerchant}

*NEW MERCHANT NAME:*
Type the correct merchant name:`);
    
    await this.sessionManager.updateUserState(phoneNumber, USER_STATES.EDITING_DETAILS, {
      editingField: 'merchant',
      editingMode: false,  // Clear editingMode to prevent routing conflicts
      continueEditing: false
    });
  }

  // Start date edit
  async startDateEdit(phoneNumber, session) {
    try {
      const currentDate = session.currentReceipt?.date || 'Not set';
      
      await this.whatsAppService.sendMessage(phoneNumber, 
        `✏️ *EDIT DATE*

Current: ${currentDate}

*NEW DATE:*
Type the date (YYYY-MM-DD or MM/DD/YYYY):`);
      
      await this.sessionManager.updateUserState(phoneNumber, USER_STATES.EDITING_DETAILS, {
      editingField: 'date',
      editingMode: false,  // Clear editingMode to prevent routing conflicts
      continueEditing: false
    });
    } catch (error) {
      throw error;
    }
  }

  // Start amount edit
  async startAmountEdit(phoneNumber, session) {
    const currentAmount = session.currentReceipt?.totalAmount?.toFixed(2) || '0.00';
    const currency = await this.getCurrencyWithFallback(phoneNumber, session);
    const currencySymbol = this.currencyService.getCurrencySymbol(currency);

    await this.whatsAppService.sendMessage(phoneNumber,
      `✏️ *EDIT TOTAL AMOUNT*

Current: ${currencySymbol}${currentAmount}

*NEW AMOUNT:*
Type the correct amount (numbers only):`);

    await this.sessionManager.updateUserState(phoneNumber, USER_STATES.EDITING_DETAILS, {
      editingField: 'amount',
      editingMode: false,  // Clear editingMode to prevent routing conflicts
      continueEditing: false
    });
  }

  // Start subtotal edit
  async startSubtotalEdit(phoneNumber, session) {
    const currentSubtotal = session.currentReceipt?.subtotal?.toFixed(2) || '0.00';
    const currency = await this.getCurrencyWithFallback(phoneNumber, session);
    const currencySymbol = this.currencyService.getCurrencySymbol(currency);

    await this.whatsAppService.sendMessage(phoneNumber,
      `✏️ *EDIT SUBTOTAL AMOUNT*

Current: ${currencySymbol}${currentSubtotal}

*NEW SUBTOTAL AMOUNT:*
Type the correct subtotal amount (numbers only):`);

    await this.sessionManager.updateUserState(phoneNumber, USER_STATES.EDITING_DETAILS, {
      editingField: 'subtotal',
      editingMode: false,  // Clear editingMode to prevent routing conflicts
      continueEditing: false
    });
  }

  // Start tax edit
  async startTaxEdit(phoneNumber, session) {
    const currentTax = session.currentReceipt?.taxAmount?.toFixed(2) || '0.00';
    const currency = await this.getCurrencyWithFallback(phoneNumber, session);
    const currencySymbol = this.currencyService.getCurrencySymbol(currency);

    await this.whatsAppService.sendMessage(phoneNumber,
      `✏️ *EDIT TAX AMOUNT*

Current: ${currencySymbol}${currentTax}

*NEW TAX AMOUNT:*
Type the correct tax amount (numbers only):`);

    await this.sessionManager.updateUserState(phoneNumber, USER_STATES.EDITING_DETAILS, {
      editingField: 'tax',
      editingMode: false,  // Clear editingMode to prevent routing conflicts
      continueEditing: false
    });
  }


  // Start miscellaneous edit
  async startMiscEdit(phoneNumber, session) {
    const currentMisc = session.currentReceipt?.miscellaneous?.toFixed(2) || '0.00';
    const currency = await this.getCurrencyWithFallback(phoneNumber, session);
    const currencySymbol = this.currencyService.getCurrencySymbol(currency);

    await this.whatsAppService.sendMessage(phoneNumber,
      `✏️ *EDIT MISCELLANEOUS AMOUNT*

Current: ${currencySymbol}${currentMisc}

*NEW MISCELLANEOUS AMOUNT:*
Type the correct miscellaneous amount (numbers only):`);

    await this.sessionManager.updateUserState(phoneNumber, USER_STATES.EDITING_DETAILS, {
      editingField: 'misc',
      editingMode: false,  // Clear editingMode to prevent routing conflicts
      continueEditing: false
    });
  }

  // Start category edit
  async startCategoryEdit(phoneNumber, session) {
    await this.whatsAppService.sendMessage(phoneNumber, 
      `✏️ *EDIT CATEGORY*

Current: ${session.currentReceipt?.category || 'Not set'}

*SELECT NEW CATEGORY:*`);
    
    await this.whatsAppService.sendCategoryButtons(phoneNumber, 'Select new category:', EXPENSE_CATEGORIES);
    await this.sessionManager.updateUserState(phoneNumber, USER_STATES.WAITING_FOR_CATEGORY, { editingField: 'category' });
  }

  // Handle currency change - show currency selection menu
  async handleCurrencyChange(phoneNumber, session) {
    const currentCurrency = await this.getCurrencyWithFallback(phoneNumber, session);

    const currencyMessage = `💱 *SELECT NEW CURRENCY:*

Current: ${currentCurrency}

1️⃣ $ US Dollar (USD)
2️⃣ € Euro (EUR)
3️⃣ ¥ Japanese Yen (JPY)
4️⃣ £ British Pound (GBP)
5️⃣ ¥ Chinese Renminbi (CNH)
6️⃣ A$ Australian Dollar (AUD)
7️⃣ HK$ Hong Kong Dollar (HKD)
8️⃣ ₹ Indian Rupee (INR)
9️⃣ Back to Edit Details

*Reply with number 1-9*`;

    await this.whatsAppService.sendMessage(phoneNumber, currencyMessage);
    await this.sessionManager.updateUserState(phoneNumber, USER_STATES.EDITING_DETAILS, { editingField: 'currency' });
  }

  // Handle currency selection input
  async handleCurrencySelection(phoneNumber, input, session) {
    const currencyOptions = {
      '1': { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1 },
      '2': { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.85 },
      '3': { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rate: 149 },
      '4': { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.75 },
      '5': { code: 'CNH', symbol: '¥', name: 'Chinese Renminbi', rate: 7.24 },
      '6': { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rate: 1.52 },
      '7': { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', rate: 7.82 },
      '8': { code: 'INR', symbol: '₹', name: 'Indian Rupee', rate: 83 },
      '9': 'back_to_edit'
    };

    const selection = currencyOptions[input];

    if (selection === 'back_to_edit') {
      // Go back to edit details menu
      await this.sessionManager.updateUserState(phoneNumber, USER_STATES.WAITING_FOR_CONFIRMATION, {
        editingMode: true,
        continueEditing: false,
        editingField: null
      });
      return await this.handleEditDetailsRequest(phoneNumber);
    }
    
    if (selection) {
      const currentCurrency = await this.getCurrencyWithFallback(phoneNumber, session);
      const newCurrency = selection.code;
      
      if (currentCurrency === newCurrency) {
        await this.whatsAppService.sendMessage(phoneNumber, 
          `✅ Currency is already ${selection.symbol} ${newCurrency}`);
        
        // Show continue editing options even when no change
        const continueEditingOptions = [
          { id: 'edit_more_details', text: 'Edit More Details' },
          { id: 'save_changes', text: 'Save Changes' },
          { id: 'cancel_changes', text: 'Cancel Changes' }
        ];
        
        await this.whatsAppService.sendInteractiveButtons(phoneNumber, '*CONTINUE EDITING?*', continueEditingOptions, 'continue_editing');
        await this.sessionManager.updateUserState(phoneNumber, USER_STATES.WAITING_FOR_CONFIRMATION, { continueEditing: true });
        return;
      }
      
      // Only update currency symbol, keep amounts unchanged
      session.currentReceipt.currency = newCurrency;
      
      await this.sessionManager.setCurrentReceipt(phoneNumber, session.currentReceipt);
      
      // First show currency change confirmation
      await this.whatsAppService.sendMessage(phoneNumber,
        `✅ *UPDATED!*
Currency: ${selection.symbol} ${selection.name}`);

      // Then show complete updated expense summary with new currency
      const details = `📋 *EXPENSE SUMMARY*

• Invoice No: ${session.currentReceipt.invoiceNumber || 'Not available'}
• Date: ${session.currentReceipt.date}
• Merchant: ${session.currentReceipt.merchantName}
• Category: ${session.currentReceipt.category}
• Subtotal: ${selection.symbol}${session.currentReceipt.subtotal?.toFixed(2) || (session.currentReceipt.totalAmount - (session.currentReceipt.taxAmount || 0)).toFixed(2)}
• Tax: ${selection.symbol}${session.currentReceipt.taxAmount?.toFixed(2) || '0.00'}
• Miscellaneous: ${selection.symbol}${(session.currentReceipt.miscellaneous || 0).toFixed(2)}
• *Total: ${selection.symbol}${session.currentReceipt.totalAmount?.toFixed(2) || '0.00'}*`;

      await this.whatsAppService.sendMessage(phoneNumber, details);
      
      // Show continue editing options like other fields
      const continueEditingOptions = [
        { id: 'edit_more_details', text: 'Edit More Details' },
        { id: 'save_changes', text: 'Save Changes' },
        { id: 'cancel_changes', text: 'Cancel Changes' }
      ];
      
      await this.whatsAppService.sendInteractiveButtons(phoneNumber, '*CONTINUE EDITING?*', continueEditingOptions, 'continue_editing');
      
      await this.sessionManager.updateUserState(phoneNumber, USER_STATES.WAITING_FOR_CONFIRMATION, { continueEditing: true });
    } else {
      await this.whatsAppService.sendMessage(phoneNumber,
        `❌ Please select 1-9 from the currency options.`);
    }
  }

  // Helper to get currency conversion rates (USD base)
  getCurrencyRate(currency) {
    const rates = {
      'USD': 1,
      'EUR': 0.85,
      'JPY': 149,
      'GBP': 0.75,
      'CNH': 7.24,
      'CNY': 7.24,
      'AUD': 1.52,
      'HKD': 7.82,
      'INR': 83
    };
    return rates[currency] || 1;
  }

  // Finish editing
  async finishEditing(phoneNumber, session) {
    await this.sessionManager.updateUserState(phoneNumber, USER_STATES.WAITING_FOR_CONFIRMATION, {
      editingMode: false,
      continueEditing: false,
      editingField: null
    });

    const currency = await this.getCurrencyWithFallback(phoneNumber, session);
    const currencySymbol = this.currencyService.getCurrencySymbol(currency);

    const details = `✅ *UPDATED EXPENSE DETAILS*

📋 *FINAL SUMMARY:*
• Invoice No: ${session.currentReceipt.invoiceNumber || 'Not available'}
• Date: ${new Date(session.currentReceipt.date).toLocaleDateString()}
• Merchant: ${session.currentReceipt.merchantName || 'Unknown'}
• Category: ${session.currentReceipt.category}
• Subtotal: ${currencySymbol}${session.currentReceipt.subtotal?.toFixed(2) || (session.currentReceipt.totalAmount - (session.currentReceipt.taxAmount || 0)).toFixed(2)}
• Tax: ${currencySymbol}${session.currentReceipt.taxAmount?.toFixed(2) || '0.00'}
• Miscellaneous: ${currencySymbol}${(session.currentReceipt.miscellaneous || 0).toFixed(2)}
• *Total: ${currencySymbol}${session.currentReceipt.totalAmount?.toFixed(2) || '0.00'}*`;
    
    await this.whatsAppService.sendMessage(phoneNumber, details);
    
    const confirmationOptions = [
      { id: 'save_this_expense', text: 'Save This Expense' },
      { id: 'edit_details', text: 'Edit Details' },
      { id: 'retake_document', text: 'Retake Document' }
    ];
    
    await this.whatsAppService.sendInteractiveButtons(phoneNumber, 'Choose an option:', confirmationOptions, 'confirm');
  }

  // Handle field input (merchant name, date, amount, tax, currency)
  async handleFieldInput(phoneNumber, input, session) {
    const editingField = session.metadata?.editingField || 'merchant';
    
    // Handle currency selection separately
    if (editingField === 'currency') {
      await this.handleCurrencySelection(phoneNumber, input, session);
      return;
    }
    
    // Update the appropriate field
    switch (editingField) {
      case 'merchant':
        session.currentReceipt.merchantName = input;
        break;
      case 'date':
        if (this.isValidDate(input)) {
          session.currentReceipt.date = input;
        } else {
          await this.whatsAppService.sendMessage(phoneNumber, 
            `❌ Invalid date format. Please use YYYY-MM-DD or MM/DD/YYYY format.`);
          return;
        }
        break;
      case 'amount':
        const amount = parseFloat(input);
        if (!isNaN(amount) && amount >= 0) {
          session.currentReceipt.totalAmount = amount;
        } else {
          await this.whatsAppService.sendMessage(phoneNumber, 
            `❌ Invalid amount. Please enter a valid number.`);
          return;
        }
        break;
      case 'subtotal':
        const subtotal = parseFloat(input);
        if (!isNaN(subtotal) && subtotal >= 0) {
          session.currentReceipt.subtotal = subtotal;
          // Do NOT recalculate total - keep it as is from OCR data
        } else {
          await this.whatsAppService.sendMessage(phoneNumber,
            `❌ Invalid subtotal amount. Please enter a valid number.`);
          return;
        }
        break;
      case 'tax':
        const tax = parseFloat(input);
        if (!isNaN(tax) && tax >= 0) {
          session.currentReceipt.taxAmount = tax;
          // Do NOT recalculate total - keep it as is from OCR data
        } else {
          await this.whatsAppService.sendMessage(phoneNumber,
            `❌ Invalid tax amount. Please enter a valid number.`);
          return;
        }
        break;
      case 'misc':
        const misc = parseFloat(input);
        if (!isNaN(misc) && misc >= 0) {
          session.currentReceipt.miscellaneous = misc;
          // Do NOT recalculate total - keep it as is from OCR data
        } else {
          await this.whatsAppService.sendMessage(phoneNumber,
            `❌ Invalid miscellaneous amount. Please enter a valid number.`);
          return;
        }
        break;
    }
    
    await this.sessionManager.setCurrentReceipt(phoneNumber, session.currentReceipt);
    
    const fieldName = editingField === 'merchant' ? 'Merchant' :
                     editingField === 'date' ? 'Date' :
                     editingField === 'amount' ? 'Total Amount' :
                     editingField === 'subtotal' ? 'Subtotal' :
                     editingField === 'tax' ? 'Tax Amount' :
                     editingField === 'misc' ? 'Miscellaneous' : 'Field';
    
    const isAmountField = ['amount', 'subtotal', 'tax', 'misc'].includes(editingField);
    const currency = await this.getCurrencyWithFallback(phoneNumber, session);
    const currencySymbol = this.currencyService.getCurrencySymbol(currency);

    // First show the quick update confirmation
    await this.whatsAppService.sendMessage(phoneNumber,
      `✅ *UPDATED!*
${fieldName}: ${isAmountField ? currencySymbol + parseFloat(input).toFixed(2) : input}`);

    // Then show complete updated expense summary
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
    
    // Show continue editing options as WhatsApp buttons (no numbers!)
    const continueEditingOptions = [
      { id: 'edit_more_details', text: 'Edit More Details' },
      { id: 'save_changes', text: 'Save Changes' },
      { id: 'cancel_changes', text: 'Cancel Changes' }
    ];
    
    await this.whatsAppService.sendInteractiveButtons(phoneNumber, '*CONTINUE EDITING?*', continueEditingOptions, 'continue_editing');
    
    await this.sessionManager.updateUserState(phoneNumber, USER_STATES.WAITING_FOR_CONFIRMATION, { continueEditing: true });
  }

  // Helper to validate date format
  isValidDate(dateString) {
    // Check YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const date = new Date(dateString);
      return date instanceof Date && !isNaN(date);
    }
    
    // Check MM/DD/YYYY format
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
      const date = new Date(dateString);
      return date instanceof Date && !isNaN(date);
    }
    
    return false;
  }

  // Error message for editing
  async sendEditingError(phoneNumber) {
    await this.whatsAppService.sendMessage(phoneNumber, 
      `❌ Please select an option from the edit menu list provided.`);
  }
}

module.exports = EditDetailsHandler;