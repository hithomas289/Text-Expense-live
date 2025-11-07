const PhoneNumberService = require('./PhoneNumberService');
const User = require('../models/database/User');

class CurrencyService {
  constructor() {
    this.phoneService = new PhoneNumberService();
  }

  /*
   * Get user's default currency from database or phone number
   * @param {string} phoneNumber - User's phone number
   * @returns {object} Currency info
   */
  async getUserDefaultCurrency(phoneNumber) {
    try {
      // PRIORITY 1: Get user's saved default currency from database
      const user = await User.findByPhoneNumber(phoneNumber);

      if (user && user.defaultCurrency) {
        console.log(`💰 Using stored default currency for ${phoneNumber}: ${user.defaultCurrency}`);
        return {
          currency: user.defaultCurrency,
          symbol: user.currencySymbol,
          country: user.countryName
        };
      }

      // PRIORITY 2: Fallback to phone number-based country detection
      console.log(`💰 No saved currency - detecting from phone number: ${phoneNumber}`);
      return this.phoneService.getUserCurrency(phoneNumber);

    } catch (error) {
      console.error('Error getting user currency:', error);
      // Last resort: Use phone number service which will return INR as default
      // This should rarely happen as phone number detection is very robust
      return this.phoneService.getUserCurrency(phoneNumber);
    }
  }

  /*
   * Set default currency in receipt data based on user's country
   * @param {string} phoneNumber - User's phone number
   * @param {object} receiptData - Receipt data to update
   * @returns {object} Updated receipt data with user's currency
   */
  async setReceiptCurrency(phoneNumber, receiptData) {
    const userCurrency = await this.getUserDefaultCurrency(phoneNumber);
    
    // Set currency to user's default
    receiptData.currency = userCurrency.currency;
    
    console.log(`💰 Set receipt currency to ${userCurrency.currency} for ${phoneNumber}`);
    
    return receiptData;
  }

  /*
   * Format amount with user's default currency
   * @param {number} amount - Amount to format
   * @param {string} phoneNumber - User's phone number
   * @returns {string} Formatted amount
   */
  async formatAmountForUser(amount, phoneNumber) {
    const userCurrency = await this.getUserDefaultCurrency(phoneNumber);
    return this.formatAmount(amount, userCurrency.currency, userCurrency.symbol);
  }

  /*
   * Format amount with specific currency
   * @param {number} amount - Amount to format
   * @param {string} currency - Currency code (INR, USD, etc.)
   * @param {string} symbol - Currency symbol (₹, $, etc.)
   * @returns {string} Formatted amount
   */
  formatAmount(amount, currency, symbol) {
    if (!amount || isNaN(amount)) return `${symbol}0.00`;
    
    // Handle Indian number formatting
    if (currency === 'INR' && amount >= 1000) {
      return `${symbol}${this.formatIndianNumber(amount)}`;
    }
    
    // Standard formatting
    return `${symbol}${parseFloat(amount).toFixed(2)}`;
  }

  /*
   * Format numbers in Indian style (lakhs, crores)
   * @param {number} num - Number to format
   * @returns {string} Formatted number
   */
  formatIndianNumber(num) {
    return num.toLocaleString('en-IN');
  }

  /*
   * Get currency symbol from currency code
   * @param {string} currency - Currency code
   * @returns {string} Currency symbol
   */
  getCurrencySymbol(currency) {
    const symbols = {
      'INR': '₹',
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'CAD': 'C$',
      'AUD': 'A$',
      'JPY': '¥',
      'CNY': '¥',
      'CNH': '¥',
      'AED': 'د.إ',
      'SGD': 'S$',
      'HKD': 'HK$',
      'NZD': 'NZ$',
      'CHF': 'CHF',
      'SEK': 'kr',
      'NOK': 'kr',
      'DKK': 'kr',
      'MYR': 'RM',
      'THB': '฿',
      'PHP': '₱',
      'IDR': 'Rp',
      'VND': '₫',
      'KRW': '₩',
      'ZAR': 'R',
      'BRL': 'R$',
      'MXN': 'MX$',
      'RUB': '₽',
      'TRY': '₺',
      'SAR': 'SR',
      'QAR': 'QR',
      'KWD': 'KD',
      'BHD': 'BD',
      'OMR': 'OMR',
      'ILS': '₪',
      'PLN': 'zł',
      'CZK': 'Kč',
      'HUF': 'Ft'
    };

    return symbols[currency] || currency;
  }

  /*
   * Convert receipt data to user's default currency format
   * @param {object} receiptData - Original receipt data
   * @param {string} phoneNumber - User's phone number
   * @returns {object} Receipt data with user's currency
   */
  async normalizeReceiptCurrency(receiptData, phoneNumber) {
    const userCurrency = await this.getUserDefaultCurrency(phoneNumber);
    
    // Update all amount fields to use user's currency
    const normalizedData = { ...receiptData };
    
    normalizedData.currency = userCurrency.currency;
    
    // Format amounts with user's currency symbol
    if (normalizedData.totalAmount) {
      normalizedData.formattedTotal = this.formatAmount(
        normalizedData.totalAmount, 
        userCurrency.currency, 
        userCurrency.symbol
      );
    }
    
    if (normalizedData.subtotal) {
      normalizedData.formattedSubtotal = this.formatAmount(
        normalizedData.subtotal, 
        userCurrency.currency, 
        userCurrency.symbol
      );
    }
    
    if (normalizedData.tax) {
      normalizedData.formattedTax = this.formatAmount(
        normalizedData.tax, 
        userCurrency.currency, 
        userCurrency.symbol
      );
    }
    
    console.log(`💰 Normalized receipt currency to ${userCurrency.currency} for ${phoneNumber}`);
    
    return normalizedData;
  }
}

module.exports = CurrencyService;