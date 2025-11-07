const axios = require('axios');
const config = require('../config/config');
const { USER_STATES } = require('../models/database/Session');

class WhatsAppService {
  constructor() {
    this.accessToken = config.whatsapp.accessToken;
    this.phoneNumberId = config.whatsapp.phoneNumberId;
    this.apiVersion = config.whatsapp.apiVersion;
    this.baseUrl = `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}`;
  }

  // Add contact to allowed list
  async addContact(phoneNumber) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/contacts`,
        {
          blocking: 'wait',
          contacts: [phoneNumber]
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error adding contact:', error.response?.data || error.message);
      return null;
    }
  }

  // Send text message
  async sendMessage(to, message) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/messages`,
        {
          messaging_product: 'whatsapp',
          to: to,
          type: 'text',
          text: { body: message }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error.response?.data || error.message);
      throw error;
    }
  }

  // Send image message
  async sendImage(to, imageUrl, caption = '') {
    try {
      const response = await axios.post(
        `${this.baseUrl}/messages`,
        {
          messaging_product: 'whatsapp',
          to: to,
          type: 'image',
          image: {
            link: imageUrl,
            caption: caption
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error sending image:', error.response?.data || error.message);
      throw error;
    }
  }

  // Send document/file
  async sendDocument(to, documentUrl, filename, caption = '') {
    try {
      console.log('📤 WhatsAppService.sendDocument called with:', {
        to,
        documentUrl,
        filename,
        captionLength: caption?.length
      });

      const response = await axios.post(
        `${this.baseUrl}/messages`,
        {
          messaging_product: 'whatsapp',
          to: to,
          type: 'document',
          document: {
            link: documentUrl,
            filename: filename,
            caption: caption
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ WhatsApp API response for sendDocument:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error sending document:', error.response?.data || error.message);
      console.error('Full error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      // If document send fails, send the URL as text message instead
      await this.sendMessage(to, `📊 *EXPENSE REPORT READY*

Your Excel report is ready! Download it from:
${documentUrl}

${caption}`);
      
      return { fallback: true, url: documentUrl };
    }
  }

  // Download media file from WhatsApp
  async downloadMedia(mediaId) {
    try {
      // First, get the media URL
      const mediaInfoResponse = await axios.get(
        `https://graph.facebook.com/${this.apiVersion}/${mediaId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      const mediaUrl = mediaInfoResponse.data.url;
      const mimeType = mediaInfoResponse.data.mime_type;

      // Then download the actual file
      const fileResponse = await axios.get(mediaUrl, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        },
        responseType: 'stream'
      });

      return {
        stream: fileResponse.data,
        mimeType: mimeType,
        size: mediaInfoResponse.data.file_size
      };
    } catch (error) {
      console.error('Error downloading media:', error.response?.data || error.message);
      throw error;
    }
  }

  // Parse incoming webhook message
  parseWebhookMessage(body) {
    if (!body.entry || !body.entry[0] || !body.entry[0].changes || !body.entry[0].changes[0]) {
      return null;
    }

    const change = body.entry[0].changes[0];
    if (!change.value || !change.value.messages || !change.value.messages[0]) {
      return null;
    }

    // Check if multiple images/documents sent at once
    const messages = change.value.messages;
    if (messages.length > 1) {
      // Count how many are images or documents
      const mediaMessages = messages.filter(msg => msg.type === 'image' || msg.type === 'document');

      if (mediaMessages.length > 1) {
        return {
          multipleImages: true,
          count: mediaMessages.length,
          from: messages[0].from,
          messageId: messages[0].id
        };
      }
    }

    const message = change.value.messages[0];
    const contact = change.value.contacts ? change.value.contacts[0] : null;

    // Handle interactive button and list responses
    if (message.type === 'interactive' && message.interactive) {
      const buttonReply = message.interactive.button_reply;
      const listReply = message.interactive.list_reply;
      
      if (buttonReply) {
        // Convert button response to text for compatibility
        message.text = { body: this.mapButtonResponseToText(buttonReply.id) };
        message.type = 'text';
        message.isInteractiveReply = true;
      } else if (listReply) {
        // Convert list response to text for compatibility
        message.text = { body: this.mapListResponseToText(listReply.id) };
        message.type = 'text';
        message.isInteractiveReply = true;
      }
    }

    return {
      messageId: message.id,
      from: message.from,
      timestamp: message.timestamp,
      type: message.type,
      message: message,
      contact: contact
    };
  }

  // Map button response IDs to text responses for backward compatibility
  mapButtonResponseToText(buttonId) {
    const buttonMap = {
      // Category buttons
      'category_1': '1',
      'category_2': '2', 
      'category_3': '3',
      'category_4': '4',
      'category_5': '5',
      'category_6': '6',
      
      // Receipt choice buttons
      'process_expense': 'PROCESS_EXPENSE',

      // Confirmation buttons (NEW 3-BUTTON FLOW)
      'save_this_expense': 'SAVE_THIS_EXPENSE',
      'save_expense': 'SAVE_EXPENSE',
      'edit_details': 'EDIT_DETAILS',
      'retake_document': 'RETAKE_DOCUMENT',
      'confirm_1': '1',
      'confirm_2': '2',
      'confirm_3': '3',
      
      // Receipt conflict buttons
      'save_receipt': 'SAVE_RECEIPT',
      'cancel_receipt': 'CANCEL_RECEIPT',

      // Duplicate handling buttons
      'continue_override': 'continue_override',
      
      // Post-cancel buttons
      'try_new_expense': 'PROCESS_DOCUMENT',

      // Post-receipt buttons
      'generate_excel_report': 'GENERATE_REPORT',
      'quick_summary': 'VIEW_SUMMARY',

      // Navigation Commands
      'main_menu': 'MAIN_MENU',
      'how_it_works': 'HOW_IT_WORKS',

      // Upgrade buttons
      'upgrade_pro': 'upgrade_pro',

      // Main menu buttons
      'menu_process': '1',
      'menu_report': '2', 
      'menu_summary': '3',
      'menu_refer': '4',
      'menu_how_works': '5',
      'menu_support': '6',
      'menu_upgrade': '7',
      
      // Welcome buttons
      'welcome_1': '1',
      'welcome_2': '2',
      'welcome_3': '3',
      
      // Edit buttons
      'edit_1': '1',
      'edit_2': '2',
      'edit_3': '3',
      'edit_4': '4',
      'edit_5': '5',
      'edit_6': '6',
      'edit_7': '7',
      'edit_8': '8',
      
      // Refer buttons
      'refer_1': '1',
      'refer_2': '2',
      'refer_3': '3',
      'refer_4': '4',
      'refer_track_1': '1',
      'refer_track_2': '2',
      'refer_dash_1': '1',
      'refer_dash_2': '2',
      'refer_ready_1': '1',
      'refer_ready_2': '2',

      // Share buttons
      'share_1': '1',
      'share_2': '2',

      // Generic buttons (pattern: type_number)
      'generic_1': '1',
      'generic_2': '2',
      'generic_3': '3',
      'generic_4': '4',
      'generic_5': '5',
      'generic_6': '6',
      'generic_7': '7',
      
      // Legacy compatibility
      'confirm_yes': 'yes',
      'confirm_retake': 'retake'
    };
    
    // If not in map, try to extract number from pattern like 'type_1' -> '1'
    // BUT exclude share_done_ buttons which should be handled as button IDs
    if (!buttonMap[buttonId] && buttonId.includes('_') && !buttonId.startsWith('share_done_')) {
      const parts = buttonId.split('_');
      const lastPart = parts[parts.length - 1];
      if (/^\d+$/.test(lastPart)) {
        return lastPart;
      }
    }
    
    return buttonMap[buttonId] || buttonId;
  }

  // Map WhatsApp list responses to text commands
  mapListResponseToText(listId) {
    const listMap = {
      // Edit Details List Options
      'edit_merchant': 'EDIT_MERCHANT_NAME',
      'edit_date': 'EDIT_DATE', 
      'edit_amount': 'EDIT_TOTAL_AMOUNT',
      'edit_category': 'EDIT_CATEGORY',
      'edit_tax': 'EDIT_TAX_AMOUNT',
      'edit_currency': 'CHANGE_CURRENCY',
      'edit_done': 'DONE_EDITING',
      
      // Legacy numeric mapping for backward compatibility
      'list_1': '1',
      'list_2': '2',
      'list_3': '3',
      'list_4': '4',
      'list_5': '5',
      'list_6': '6',
      'list_7': '7'
    };
    
    return listMap[listId] || listId;
  }

  // Detect message type for routing
  detectMessageType(message, userState = null) {
    if (message.type === 'image') return 'image';
    if (message.type === 'document') return 'document';
    
    if (message.type === 'text') {
      const text = message.text.body.toLowerCase().trim();
      
      // Command detection
      if (['help', 'info', 'summary', 'report', 'reports', 'excel', 'usage', 'upgrade', 'reset'].includes(text)) {
        return 'command';
      }
      
      // Context-aware number detection - ALL numbers should be handled as 'text' by command system
      if (/^[1-6]$/.test(text)) {
        // All numbered inputs are now handled by the command-based routing system
        // Return 'text' so they go through the command translation system
        return 'text';
      }
      
      // Confirmation responses - also handled by command system now
      if (['yes', 'no', 'retake', 'save', 'edit', 'retake_photo'].includes(text)) {
        return 'text'; // Let command system handle these too
      }
      
      return 'text';
    }
    
    return 'unknown';
  }

  // Check if document is a receipt (PDF or image)
  isReceiptDocument(message) {
    if (message.type !== 'document') return false;
    
    const document = message.document;
    if (!document) return false;
    
    const mimeType = document.mime_type;
    const filename = document.filename ? document.filename.toLowerCase() : '';
    
    // Check if it's a PDF or image
    const validMimeTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/jpg'
    ];
    
    const validExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'];
    
    return validMimeTypes.includes(mimeType) || 
           validExtensions.some(ext => filename.endsWith(ext));
  }

  // Send interactive buttons for category selection
  async sendCategoryButtons(to, message, categories) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/messages`,
        {
          messaging_product: 'whatsapp',
          to: to,
          type: 'interactive',
          interactive: {
            type: 'button',
            body: { text: message },
            action: {
              buttons: categories.map((cat, index) => ({
                type: 'reply',
                reply: {
                  id: `category_${index + 1}`,
                  title: `${cat.emoji} ${cat.name}`
                }
              }))
            }
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error sending category buttons:', error.response?.data || error.message);
      // Fallback to text message with numbered options
      const fallbackMessage = `${message}\n\n` + categories.map((cat, index) => 
        `${index + 1}️⃣ ${cat.name}`
      ).join('\n') + '\n\nReply with number (1-6):';
      
      return await this.sendMessage(to, fallbackMessage);
    }
  }

  // Send confirmation buttons (Save, Edit, Retake, Change Currency)
  async sendConfirmationButtons(to, message) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/messages`,
        {
          messaging_product: 'whatsapp',
          to: to,
          type: 'interactive',
          interactive: {
            type: 'button',
            body: { text: message },
            action: {
              buttons: [
                {
                  type: 'reply',
                  reply: {
                    id: 'save_expense',
                    title: 'Save This Expense'
                  }
                },
                {
                  type: 'reply',
                  reply: {
                    id: 'edit_details',
                    title: 'Edit Details'
                  }
                },
                {
                  type: 'reply',
                  reply: {
                    id: 'retake_document',
                    title: 'Retake Document'
                  }
                }
              ]
            }
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error sending confirmation buttons:', error.response?.data || error.message);
      // Fallback to text message
      return await this.sendMessage(to, `${message}\n\n[Save This Expense] [Edit Details] [Retake Document]\n\nUse the buttons above to continue.`);
    }
  }

  // Send main menu buttons
  async sendMainMenuButtons(to, message) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/messages`,
        {
          messaging_product: 'whatsapp',
          to: to,
          type: 'interactive',
          interactive: {
            type: 'button',
            body: { text: message },
            action: {
              buttons: [
                {
                  type: 'reply',
                  reply: {
                    id: 'menu_process',
                    title: '1️⃣ Process Document'
                  }
                },
                {
                  type: 'reply',
                  reply: {
                    id: 'menu_report',
                    title: '2️⃣ Generate Report'
                  }
                },
                {
                  type: 'reply',
                  reply: {
                    id: 'menu_summary',
                    title: '3️⃣ View Summary'
                  }
                }
              ]
            }
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error sending main menu buttons:', error.response?.data || error.message);
      // Fallback to text message
      const fallbackMessage = `${message}\n\n1️⃣ Process Document\n2️⃣ Generate Report\n3️⃣ View Summary\n\nReply with number 1-3:`;
      return await this.sendMessage(to, fallbackMessage);
    }
  }

  // Universal method to send options - uses buttons for ≤3 options, text for 4+
  async sendOptions(to, message, options, optionType = 'generic') {
    const optionCount = options.length;
    
    if (optionCount <= 3) {
      // Use interactive buttons for 3 or fewer options
      return await this.sendInteractiveButtons(to, message, options, optionType);
    } else {
      // Use text-based options for 4 or more options
      return await this.sendTextOptions(to, message, options);
    }
  }

  // Send interactive buttons (for ≤3 options)
  async sendInteractiveButtons(to, message, options, optionType = 'generic') {
    try {
      // Validate inputs
      if (!options || options.length === 0) {
        console.error('❌ No options provided for interactive buttons');
        return await this.sendMessage(to, message);
      }
      
      if (options.length > 3) {
        console.error('❌ Too many options for interactive buttons:', options.length);
        return await this.sendTextOptions(to, message, options);
      }

      const buttons = options.map((option, index) => {
        const title = option.title || option.name || option.text || `Option ${index + 1}`;
        // WhatsApp button title must be 1-20 characters
        const truncatedTitle = title.length > 20 ? title.substring(0, 20) : title;
        return {
          type: 'reply',
          reply: {
            id: option.id || `${optionType}_${index + 1}`,
            title: truncatedTitle
          }
        };
      }).filter(button => button.reply.title && button.reply.title.trim() !== '');
      
      if (buttons.length === 0) {
        console.error('❌ No valid buttons after filtering');
        return await this.sendMessage(to, message);
      }

      // WhatsApp interactive message body must be 1-1024 characters
      const truncatedMessage = message.length > 1024 ? message.substring(0, 1024) : message;

      const response = await axios.post(
        `${this.baseUrl}/messages`,
        {
          messaging_product: 'whatsapp',
          to: to,
          type: 'interactive',
          interactive: {
            type: 'button',
            body: { text: truncatedMessage },
            action: { buttons }
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Store the message ID for tracking latest interactive message
      if (response.data && response.data.messages && response.data.messages[0]) {
        const messageId = response.data.messages[0].id;
        return { ...response.data, latestMessageId: messageId };
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Interactive buttons failed:', error.response?.data || error.message);
      console.error('📱 Button data:', { to, message, options, optionType });
      console.error('🔧 Generated buttons:', buttons);
      // Fallback to text options
      console.log('⚠️ Falling back to text options');
      return await this.sendTextOptions(to, message, options);
    }
  }

  // Send text-based options (for 4+ options or fallback)
  async sendTextOptions(to, message, options) {
    const optionsText = options.map((option, index) => {
      const number = index + 1;
      const emoji = option.emoji || `${number}️⃣`;
      const text = option.name || option.text || option.title;
      return `${emoji} ${text}`;
    }).join('\n');

    const fullMessage = `${message}\n\n${optionsText}\n\n*Reply with number 1-${options.length}*`;
    return await this.sendMessage(to, fullMessage);
  }

  // Send WhatsApp List for edit details menu (4+ options)
  async sendInteractiveList(to, message, options, listTitle = "Choose an option", headerText = "Options") {
    try {
      const rows = options.map((option, index) => ({
        id: option.id || `list_${index + 1}`,
        title: option.title || option.text || option.name,
        description: option.description || ''
      }));

      const response = await axios.post(
        `${this.baseUrl}/messages`,
        {
          messaging_product: 'whatsapp',
          to: to,
          type: 'interactive',
          interactive: {
            type: 'list',
            header: {
              type: 'text',
              text: headerText
            },
            body: {
              text: message
            },
            action: {
              button: 'Select Option',
              sections: [
                {
                  title: listTitle,
                  rows: rows
                }
              ]
            }
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Store the message ID for tracking latest interactive message
      if (response.data && response.data.messages && response.data.messages[0]) {
        const messageId = response.data.messages[0].id;
        return { ...response.data, latestMessageId: messageId };
      }
      
      return response.data;
    } catch (error) {
      console.error('Error sending interactive list:', error.response?.data || error.message);
      // Fallback to text options
      return await this.sendTextOptions(to, message, options);
    }
  }

  // Format category options message (fallback for when buttons don't work)
  formatCategoryOptions(categories) {
    return categories.map(cat => 
      `${cat.emoji} ${cat.name}`
    ).join('\n');
  }
  /*
   * Send payment button with Stripe checkout URL
   */
  async sendPaymentButton(to, message, checkoutUrl, buttonText = 'Pay Now', headerText = '💎 TextExpense PRO') {
    try {
      const response = await axios.post(
        `${this.baseUrl}/messages`,
        {
          messaging_product: 'whatsapp',
          to: to,
          type: 'interactive',
          interactive: {
            type: 'cta_url',
            header: {
              type: 'text',
              text: headerText
            },
            body: {
              text: message
            },
            action: {
              name: 'cta_url',
              parameters: {
                display_text: buttonText,
                url: checkoutUrl
              }
            }
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        messageId: response.data.messages[0].id,
        checkoutUrl: checkoutUrl
      };
    } catch (error) {
      console.error('Error sending payment button:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  /*
   * Send payment confirmation with portal link
   */
  async sendPaymentConfirmationWithPortal(to, message, portalUrl) {
    try {
      // First send the confirmation message
      await this.sendMessage(to, message);

      // Then send portal access button if URL provided
      if (portalUrl) {
        const portalMessage = `Manage your subscription, update payment methods, or view invoices.`;
        
        const response = await axios.post(
          `${this.baseUrl}/messages`,
          {
            messaging_product: 'whatsapp',
            to: to,
            type: 'interactive',
            interactive: {
              type: 'cta_url',
              header: {
                type: 'text',
                text: '⚙️ Manage Subscription'
              },
              body: {
                text: portalMessage
              },
              action: {
                name: 'cta_url',
                parameters: {
                  display_text: 'Manage Subscription',
                  url: portalUrl
                }
              }
            }
          },
          {
            headers: {
              'Authorization': `Bearer ${this.accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        return {
          success: true,
          messageId: response.data.messages[0].id
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Error sending payment confirmation with portal:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }
}

module.exports = WhatsAppService;