const libphonenumber = require('libphonenumber-js');

class PhoneNumberService {
  constructor() {
    // Country mappings for currency detection
    this.countryMappings = {
      'IN': { name: 'India', currency: 'INR', symbol: '₹' },
      'US': { name: 'United States', currency: 'USD', symbol: '$' },
      'GB': { name: 'United Kingdom', currency: 'GBP', symbol: '£' },
      'CA': { name: 'Canada', currency: 'CAD', symbol: 'C$' },
      'AU': { name: 'Australia', currency: 'AUD', symbol: 'A$' },
      'DE': { name: 'Germany', currency: 'EUR', symbol: '€' },
      'FR': { name: 'France', currency: 'EUR', symbol: '€' },
      'JP': { name: 'Japan', currency: 'JPY', symbol: '¥' },
      'CN': { name: 'China', currency: 'CNY', symbol: '¥' },
      'HK': { name: 'Hong Kong', currency: 'HKD', symbol: 'HK$' },
      'AE': { name: 'United Arab Emirates', currency: 'AED', symbol: 'د.إ' },
      'SG': { name: 'Singapore', currency: 'SGD', symbol: 'S$' }
    };
  }

  /*
   * Parse and format phone number properly
   * @param {string} phoneNumber - Raw phone number from WhatsApp
   * @returns {object} Formatted phone data
   */
  parsePhoneNumber(phoneNumber) {
    try {
      console.log(`📞 Parsing phone number: ${phoneNumber}`);
      
      // Handle WhatsApp format (no + prefix)
      let numberToParse = phoneNumber;
      if (!phoneNumber.startsWith('+')) {
        numberToParse = '+' + phoneNumber;
      }
      
      // Parse with libphonenumber
      const parsed = libphonenumber.parsePhoneNumber(numberToParse);
      
      if (!parsed || !parsed.isValid()) {
        console.warn(`⚠️ Invalid phone number: ${phoneNumber}`);
        return this.getFallbackPhoneData(phoneNumber);
      }
      
      const countryCode = parsed.country;
      const nationalNumber = parsed.nationalNumber;
      const countryCallingCode = parsed.countryCallingCode;
      
      // Format properly
      const formattedInternational = parsed.formatInternational(); // +91 96032 16152
      const formattedNational = parsed.formatNational(); // (096032) 16152
      const e164Format = parsed.format('E.164'); // +919603216152
      
      // Get country info
      const countryInfo = this.getCountryInfo(countryCode);
      
      console.log(`✅ Parsed phone: ${e164Format} (${countryInfo.name}, ${countryInfo.currency})`);
      
      return {
        original: phoneNumber,
        formatted: e164Format, // This will be stored in DB
        international: formattedInternational,
        national: formattedNational,
        countryCode: countryCode,
        countryCallingCode: `+${countryCallingCode}`,
        nationalNumber: nationalNumber,
        isValid: true,
        country: countryInfo
      };
      
    } catch (error) {
      console.error(`❌ Error parsing phone number ${phoneNumber}:`, error);
      return this.getFallbackPhoneData(phoneNumber);
    }
  }
  
  /*
   * Get country information
   * @param {string} countryCode - ISO country code (e.g., 'IN', 'US')
   * @returns {object} Country info
   */
  getCountryInfo(countryCode) {
    if (this.countryMappings[countryCode]) {
      return this.countryMappings[countryCode];
    }

    // Fallback to INR for unrecognized phone numbers
    // This is rare - most phone numbers will be detected by country code
    return {
      name: 'Unknown',
      currency: 'INR',
      symbol: '₹'
    };
  }
  
  
  /*
   * Fallback phone data for invalid numbers
   * @param {string} phoneNumber - Original phone number
   * @returns {object} Fallback data
   */
  getFallbackPhoneData(phoneNumber) {
    // Try to extract country code manually
    let countryCode = '+1'; // Default to US
    let countryInfo = this.countryMappings.US;

    if (phoneNumber.startsWith('91') || phoneNumber.startsWith('+91')) {
      countryCode = '+91';
      countryInfo = this.countryMappings.IN;
    } else {
      // If we can't detect country, default to INR
      countryInfo = {
        name: 'Unknown',
        currency: 'INR',
        symbol: '₹'
      };
    }

    return {
      original: phoneNumber,
      formatted: phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`,
      international: phoneNumber,
      national: phoneNumber,
      countryCode: countryCode.replace('+', ''),
      countryCallingCode: countryCode,
      nationalNumber: phoneNumber.replace(/^\+?91/, ''),
      isValid: false,
      country: countryInfo
    };
  }
  
  /*
   * Validate phone number format
   * @param {string} phoneNumber - Phone number to validate
   * @returns {boolean} Is valid
   */
  isValidPhoneNumber(phoneNumber) {
    try {
      const numberToParse = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      const parsed = libphonenumber.parsePhoneNumber(numberToParse);
      return parsed && parsed.isValid();
    } catch (error) {
      return false;
    }
  }
  
  /*
   * Convert WhatsApp format to E.164 format
   * @param {string} whatsappNumber - Number from WhatsApp (919603216152)
   * @returns {string} E.164 format (+919603216152)
   */
  whatsappToE164(whatsappNumber) {
    const parsed = this.parsePhoneNumber(whatsappNumber);
    return parsed.formatted;
  }
  
  /*
   * Convert E.164 format to WhatsApp format
   * @param {string} e164Number - E.164 format (+919603216152)
   * @returns {string} WhatsApp format (919603216152)
   */
  e164ToWhatsapp(e164Number) {
    return e164Number.replace(/^\+/, '');
  }

  /*
   * Get user's default currency from phone number
   * @param {string} phoneNumber - Phone number
   * @returns {object} Currency info
   */
  getUserCurrency(phoneNumber) {
    const phoneData = this.parsePhoneNumber(phoneNumber);
    return {
      currency: phoneData.country.currency,
      symbol: phoneData.country.symbol,
      country: phoneData.country.name
    };
  }
}

module.exports = PhoneNumberService;