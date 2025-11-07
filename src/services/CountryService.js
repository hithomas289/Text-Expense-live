class CountryService {
  constructor() {
    this.countryMappings = {
      // India
      '91': { code: 'IN', name: 'India', currency: 'INR', symbol: '₹' },
      
      // USA & Canada (NANP)
      '1': { code: 'US', name: 'United States', currency: 'USD', symbol: '$' },
      
      // UK
      '44': { code: 'GB', name: 'United Kingdom', currency: 'GBP', symbol: '£' },
      
      // Germany
      '49': { code: 'DE', name: 'Germany', currency: 'EUR', symbol: '€' },
      
      // France
      '33': { code: 'FR', name: 'France', currency: 'EUR', symbol: '€' },
      
      // Australia
      '61': { code: 'AU', name: 'Australia', currency: 'AUD', symbol: 'A$' },
      
      // Japan
      '81': { code: 'JP', name: 'Japan', currency: 'JPY', symbol: '¥' },
      
      // China
      '86': { code: 'CN', name: 'China', currency: 'CNY', symbol: '¥' },
      
      // UAE
      '971': { code: 'AE', name: 'United Arab Emirates', currency: 'AED', symbol: 'د.إ' },
      
      // Singapore
      '65': { code: 'SG', name: 'Singapore', currency: 'SGD', symbol: 'S$' }
    };
  }

  /*
   * Extract country code from phone number
   */
  extractCountryCodeFromPhone(phoneNumber) {
    // Remove any non-digits
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Try different country code lengths (1-4 digits)
    for (let len = 4; len >= 1; len--) {
      const countryCode = cleaned.substring(0, len);
      if (this.countryMappings[countryCode]) {
        return countryCode;
      }
    }
    
    return null;
  }

  /*
   * Get country info from phone number
   */
  getCountryFromPhone(phoneNumber) {
    const countryCode = this.extractCountryCodeFromPhone(phoneNumber);
    
    if (countryCode && this.countryMappings[countryCode]) {
      return {
        countryCode,
        ...this.countryMappings[countryCode]
      };
    }
    
    // Fallback to INR for unrecognized countries
    return {
      countryCode: null,
      code: 'UNKNOWN',
      name: 'Unknown',
      currency: 'INR',
      symbol: '₹'
    };
  }

  /*
   * Detect country from receipt content
   */
  detectCountryFromReceipt(text, receiptData) {
    const textLower = text.toLowerCase();
    
    // Currency symbol detection
    if (text.includes('₹') || /rs\.?\s*\d+/i.test(text) || /rupee/i.test(text)) {
      return { code: 'IN', name: 'India', currency: 'INR', symbol: '₹' };
    }
    
    if (text.includes('$') && !text.includes('₹')) {
      // Could be USD, AUD, CAD, SGD - need more context
      if (/gst|hst/i.test(text)) {
        return { code: 'CA', name: 'Canada', currency: 'CAD', symbol: 'C$' };
      }
      if (/abn|acn|gst/i.test(text)) {
        return { code: 'AU', name: 'Australia', currency: 'AUD', symbol: 'A$' };
      }
      return { code: 'US', name: 'United States', currency: 'USD', symbol: '$' };
    }
    
    if (text.includes('£')) {
      return { code: 'GB', name: 'United Kingdom', currency: 'GBP', symbol: '£' };
    }
    
    if (text.includes('€')) {
      // Could be any EU country - check for specific indicators
      if (/deutschland|germany/i.test(text)) {
        return { code: 'DE', name: 'Germany', currency: 'EUR', symbol: '€' };
      }
      if (/france|français/i.test(text)) {
        return { code: 'FR', name: 'France', currency: 'EUR', symbol: '€' };
      }
      return { code: 'EU', name: 'European Union', currency: 'EUR', symbol: '€' };
    }
    
    // GST patterns for specific countries
    if (/cgst|sgst|igst/i.test(text)) {
      return { code: 'IN', name: 'India', currency: 'INR', symbol: '₹' };
    }
    
    if (/vat.*\d+%/i.test(text)) {
      return { code: 'GB', name: 'United Kingdom', currency: 'GBP', symbol: '£' };
    }
    
    // Business name patterns
    if (/pvt\.?\s*ltd|private limited/i.test(text)) {
      return { code: 'IN', name: 'India', currency: 'INR', symbol: '₹' };
    }
    
    if (/inc\.|llc|corp\./i.test(text)) {
      return { code: 'US', name: 'United States', currency: 'USD', symbol: '$' };
    }
    
    if (/ltd\.|limited/i.test(text)) {
      return { code: 'GB', name: 'United Kingdom', currency: 'GBP', symbol: '£' };
    }
    
    // Default to unknown
    return null;
  }

  /*
   * Check if receipt country matches user country
   */
  checkCountryMismatch(userCountry, receiptCountry) {
    if (!receiptCountry) return null;
    
    if (userCountry.code !== receiptCountry.code) {
      return {
        mismatch: true,
        userCountry: userCountry.name,
        receiptCountry: receiptCountry.name,
        userCurrency: userCountry.currency,
        receiptCurrency: receiptCountry.currency
      };
    }
    
    return { mismatch: false };
  }

  /*
   * Format currency amount
   */
  formatCurrency(amount, currencyCode, countryCode) {
    const country = Object.values(this.countryMappings).find(c => c.currency === currencyCode);
    const symbol = country ? country.symbol : currencyCode;
    
    // Handle Indian number formatting
    if (currencyCode === 'INR' && amount >= 1000) {
      return `${symbol}${this.formatIndianNumber(amount)}`;
    }
    
    return `${symbol}${amount.toFixed(2)}`;
  }

  /*
   * Format numbers in Indian style (lakhs, crores)
   */
  formatIndianNumber(num) {
    return num.toLocaleString('en-IN');
  }
}

module.exports = CountryService;