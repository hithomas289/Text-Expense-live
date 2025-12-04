/*
 * Currency Conversion Service
 *
 * Handles dynamic currency conversion for international users
 * Converts base price (₹699) to user's local currency for Stripe
 */

class CurrencyConversionService {
  constructor() {
    // Base currency and prices from Railway environment
    // NOTE: Env vars are in paise (69900 = ₹699), convert to base units
    this.baseCurrency = process.env.CURRENCY_CODE;
    this.basePrices = {
      lite: parseFloat(process.env.LITE_PLAN_PRICE) / 100, // Convert paise to rupees (69900 → 699)
      pro: parseFloat(process.env.PRO_PLAN_PRICE) / 100    // Convert paise to rupees (249900 → 2499)
    };

    // Currency mappings based on phone number patterns
    this.currencyMappings = {
      // India
      '+91': { currency: 'INR', symbol: '₹', stripeCode: 'inr' },
      // US/Canada
      '+1': { currency: 'USD', symbol: '$', stripeCode: 'usd' },
      // UK
      '+44': { currency: 'GBP', symbol: '£', stripeCode: 'gbp' },
      // European countries
      '+49': { currency: 'EUR', symbol: '€', stripeCode: 'eur' }, // Germany
      '+33': { currency: 'EUR', symbol: '€', stripeCode: 'eur' }, // France
      '+39': { currency: 'EUR', symbol: '€', stripeCode: 'eur' }, // Italy
      '+34': { currency: 'EUR', symbol: '€', stripeCode: 'eur' }, // Spain
      // Australia
      '+61': { currency: 'AUD', symbol: 'A$', stripeCode: 'aud' },
      // Singapore
      '+65': { currency: 'SGD', symbol: 'S$', stripeCode: 'sgd' },
      // UAE
      '+971': { currency: 'AED', symbol: 'د.إ', stripeCode: 'aed' },
    };

    // Exchange rates (you can make this dynamic with a real API)
    this.exchangeRates = {
      'INR_TO_USD': 0.012,  // ₹699 → $8.39
      'INR_TO_GBP': 0.0096, // ₹699 → £6.71
      'INR_TO_EUR': 0.011,  // ₹699 → €7.69
      'INR_TO_AUD': 0.018,  // ₹699 → A$12.58
      'INR_TO_SGD': 0.016,  // ₹699 → S$11.18
      'INR_TO_AED': 0.044,  // ₹699 → د.إ30.76
    };
  }

  /*
   * Get user's currency based on phone number
   */
  getUserCurrency(phoneNumber) {
    // Clean phone number
    const cleanNumber = phoneNumber.replace(/\s+/g, '');

    // Find matching country code
    for (const [countryCode, currencyInfo] of Object.entries(this.currencyMappings)) {
      if (cleanNumber.startsWith(countryCode)) {
        return currencyInfo;
      }
    }

    // Default to INR for unrecognized numbers
    return { currency: 'INR', symbol: '₹', stripeCode: 'inr' };
  }

  /*
   * Convert base price to user's currency
   */
  convertPrice(phoneNumber, planType = 'lite') {
    const userCurrency = this.getUserCurrency(phoneNumber);
    const basePrice = this.basePrices[planType] || this.basePrices.lite;

    // If user is Indian, use base price
    if (userCurrency.currency === this.baseCurrency) {
      return {
        amount: basePrice,
        currency: userCurrency.currency,
        symbol: userCurrency.symbol,
        stripeCode: userCurrency.stripeCode,
        displayPrice: `${userCurrency.symbol}${basePrice}/mo`,
        stripeAmount: Math.round(basePrice * 100), // Stripe expects paise/cents
        country: this.getCountryFromPhone(phoneNumber)
      };
    }

    // Convert to user's currency
    const conversionKey = `${this.baseCurrency}_TO_${userCurrency.currency}`;
    const exchangeRate = this.exchangeRates[conversionKey];

    if (!exchangeRate) {
      console.warn(`No exchange rate found for ${conversionKey}, using base price in INR`);
      return {
        amount: basePrice,
        currency: 'INR',
        symbol: '₹',
        stripeCode: 'inr',
        displayPrice: `₹${basePrice}/mo`,
        stripeAmount: Math.round(basePrice * 100), // Stripe expects paise/cents
        country: this.getCountryFromPhone(phoneNumber)
      };
    }

    const convertedAmount = basePrice * exchangeRate;
    const roundedAmount = this.roundToNearestFriendlyPrice(convertedAmount, userCurrency.currency);

    return {
      amount: roundedAmount,
      currency: userCurrency.currency,
      symbol: userCurrency.symbol,
      stripeCode: userCurrency.stripeCode,
      displayPrice: `${userCurrency.symbol}${roundedAmount}/mo`,
      stripeAmount: Math.round(roundedAmount * 100), // Stripe expects cents
      originalAmount: basePrice,
      originalCurrency: this.baseCurrency,
      exchangeRate: exchangeRate,
      country: this.getCountryFromPhone(phoneNumber)
    };
  }

  /*
   * Round to friendly pricing (e.g., 8.39 → 8.99, 6.71 → 6.99)
   */
  roundToNearestFriendlyPrice(amount, currency) {
    // Common friendly price endings
    const friendlyEndings = {
      'USD': [0.99, 4.99, 9.99],
      'EUR': [0.99, 4.99, 9.99],
      'GBP': [0.99, 4.99, 9.99],
      'AUD': [0.99, 4.99, 9.99],
      'SGD': [0.99, 4.99, 9.99],
      'AED': [0.99, 4.99, 9.99]
    };

    const endings = friendlyEndings[currency] || [0.99, 4.99, 9.99];
    const baseAmount = Math.floor(amount);

    // Find the best friendly ending
    for (const ending of endings) {
      const friendlyPrice = baseAmount + ending;
      if (friendlyPrice >= amount) {
        return friendlyPrice;
      }
    }

    // Fallback: round up to next .99
    return Math.ceil(amount) + 0.99;
  }

  /*
   * Get country name from phone number
   */
  getCountryFromPhone(phoneNumber) {
    const countryMap = {
      '+91': 'India',
      '+1': 'United States',
      '+44': 'United Kingdom',
      '+49': 'Germany',
      '+33': 'France',
      '+39': 'Italy',
      '+34': 'Spain',
      '+61': 'Australia',
      '+65': 'Singapore',
      '+971': 'UAE'
    };

    const cleanNumber = phoneNumber.replace(/\s+/g, '');
    for (const [code, country] of Object.entries(countryMap)) {
      if (cleanNumber.startsWith(code)) {
        return country;
      }
    }

    return 'Unknown';
  }

  /*
   * Get Stripe-compatible pricing for checkout
   */
  getStripePricing(planType = 'lite') {
    // Get the price directly in USD cents from environment variables
    const priceInCents = planType === 'pro' ? 
      process.env.PRO_PLAN_PRICE : 
      process.env.LITE_PLAN_PRICE;
    
    // Convert cents to dollars for display
    const usdPrice = parseFloat(priceInCents) / 100; // For display purposes
    const usdPriceInCents = parseInt(priceInCents);

    const planNames = {
      lite: process.env.LITE_PLAN_NAME || 'TextExpense Lite',
      pro: process.env.PRO_PLAN_NAME || 'TextExpense PRO'
    };

    const liteLimit = parseInt(process.env.LITE_RECEIPT_LIMIT) || 6;
    const proLimit = parseInt(process.env.PRO_RECEIPT_LIMIT) || 25;

    const planDescriptions = {
      lite: `${liteLimit} receipts per month - Lite Plan`,
      pro: `${proLimit} receipts per month - PRO Plan`
    };

    return {
      currency: 'usd',
      amount: usdPriceInCents,
      displayAmount: `$${usdPrice.toFixed(2)}/mo`,
      priceData: {
        currency: 'usd',
        product_data: {
          name: planNames[planType],
          description: planDescriptions[planType]
        },
        unit_amount: usdPriceInCents, // Already in cents
        recurring: {
          interval: 'month'
        }
      }
    };
  }

  /*
   * Update exchange rates (call this periodically or use a real API)
   */
  async updateExchangeRates() {
    try {
      // You can integrate with a real exchange rate API here
      // For now, using static rates
      console.log('💱 Exchange rates updated');
      return true;
    } catch (error) {
      console.error('Failed to update exchange rates:', error);
      return false;
    }
  }

  /*
   * Get pricing comparison for admin
   */
  getPricingComparison() {
    const currencies = Object.keys(this.exchangeRates).map(key => key.split('_TO_')[1]);
    const comparison = [];

    // Add base currency for both plans
    comparison.push({
      country: 'India',
      currency: 'INR',
      symbol: '₹',
      amount: this.basePrices.lite,
      displayPrice: `₹${this.basePrices.lite}/mo`,
      plan: 'lite'
    });

    comparison.push({
      country: 'India',
      currency: 'INR',
      symbol: '₹',
      amount: this.basePrices.pro,
      displayPrice: `₹${this.basePrices.pro}/mo`,
      plan: 'pro'
    });

    // Add converted currencies for both plans
    currencies.forEach(currency => {
      const rate = this.exchangeRates[`INR_TO_${currency}`];
      if (rate) {
        const symbol = Object.values(this.currencyMappings).find(c => c.currency === currency)?.symbol || currency;

        // Lite plan
        const liteAmount = this.roundToNearestFriendlyPrice(this.basePrices.lite * rate, currency);
        comparison.push({
          country: this.getCurrencyCountry(currency),
          currency: currency,
          symbol: symbol,
          amount: liteAmount,
          displayPrice: `${symbol}${liteAmount}/mo`,
          exchangeRate: rate,
          plan: 'lite'
        });

        // Pro plan
        const proAmount = this.roundToNearestFriendlyPrice(this.basePrices.pro * rate, currency);
        comparison.push({
          country: this.getCurrencyCountry(currency),
          currency: currency,
          symbol: symbol,
          amount: proAmount,
          displayPrice: `${symbol}${proAmount}/mo`,
          exchangeRate: rate,
          plan: 'pro'
        });
      }
    });

    return comparison;
  }

  getCurrencyCountry(currency) {
    const map = {
      'USD': 'United States',
      'GBP': 'United Kingdom',
      'EUR': 'Europe',
      'AUD': 'Australia',
      'SGD': 'Singapore',
      'AED': 'UAE'
    };
    return map[currency] || currency;
  }
}

module.exports = CurrencyConversionService;
