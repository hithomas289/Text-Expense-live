/**
 * Formats price from cents to dollars without rounding
 * Example: 299 -> "$2.99", 499 -> "$4.99", 1999 -> "$19.99"
 *
 * @param {number} priceInCents - Price in cents (e.g., 299, 499)
 * @param {string} symbol - Currency symbol (default: '$')
 * @returns {string} Formatted price (e.g., "$2.99")
 */
function formatPrice(priceInCents, symbol = '$') {
  if (!priceInCents || isNaN(priceInCents)) {
    return `${symbol}0.00`;
  }

  // Convert cents to dollars: divide by 100
  // Example: 299 / 100 = 2.99, 499 / 100 = 4.99
  const dollars = priceInCents / 100;

  // Format with exactly 2 decimal places, no rounding
  const formatted = dollars.toFixed(2);

  return `${symbol}${formatted}`;
}

/**
 * Extracts numeric price from formatted string
 * Example: "$2.99" -> 2.99, "$4.99/month" -> 4.99
 *
 * @param {string} formattedPrice - Formatted price string
 * @returns {number} Numeric price value
 */
function parsePrice(formattedPrice) {
  const match = formattedPrice.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
}

module.exports = {
  formatPrice,
  parsePrice
};
