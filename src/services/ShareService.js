class ShareService {
  constructor(whatsAppService, sessionManager) {
    this.whatsAppService = whatsAppService;
    this.sessionManager = sessionManager;
  }

  // Generate share URL for WhatsApp
  generateWhatsAppShareUrl(shareText) {
    return `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  }

  // Get the default share message
  getDefaultShareMessage() {
    const rawBotNumber = process.env.WHATSAPP_BOT_NUMBER ;
    // Clean the bot number: remove spaces, parentheses, and + signs for URL
    const botNumber = rawBotNumber.replace(/[\s\(\)\+\-]/g, '');
    return `
Found something you need

Click here: https://wa.me/17654792054?text=Hi

Share any receipt you have`;
  }

  // Handle share TextExpense flow
  async showShareOptions(phoneNumber) {
    const { USER_STATES } = require('../models/database/Session');
    
    const shareMessage = `📱 *SHARE TEXTEXPENSE*

Help others discover TextExpense!`;

    const shareOptions = [
      { id: 'share_1', text: 'Share WhatsApp Link' },
      { id: 'share_2', text: 'Main Menu' }
    ];

    await this.whatsAppService.sendOptions(phoneNumber, shareMessage, shareOptions, 'share');
    // Set menu context so text inputs work correctly
    await this.sessionManager.updateUserState(phoneNumber, USER_STATES.IDLE, { menuContext: 'share' });
  }

  // Handle WhatsApp link sharing
  async handleWhatsAppShare(phoneNumber) {
    const shareText = this.getDefaultShareMessage();
    const shareUrl = this.generateWhatsAppShareUrl(shareText);
    
    const shareMessage = `📱 *SHARE WITH FRIENDS*

Click the link below to share TextExpense with your contacts:

${shareUrl}

This will open WhatsApp where you can select friends to share with!

Thanks for sharing TextExpense! 🚀`;

    await this.whatsAppService.sendMessage(phoneNumber, shareMessage);
    
    // Show completion options
    const mainMenuOptions = [
      { id: 'share_done_1', text: 'Main Menu', emoji: '🏠' }
    ];
    
    await this.whatsAppService.sendOptions(phoneNumber, 'What would you like to do next?', mainMenuOptions, 'share_done');
  }

  // Handle different share types (can be extended for other platforms)
  async handleShareAction(phoneNumber, shareType) {
    switch (shareType) {
      case 'whatsapp':
        await this.handleWhatsAppShare(phoneNumber);
        break;
      default:
        await this.handleWhatsAppShare(phoneNumber);
    }
  }
}

module.exports = ShareService;