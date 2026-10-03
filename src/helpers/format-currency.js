/**
 * Formats currencies for display as strings
 *
 * @export formatCurrency
 * @param {number} value - The numeric value to format.
 * @param {string} locale - The locale code for formatting.
 * @param {string} currency - The currency code.
 * @returns {string} The formatted currency string.
 */
export default function formatCurrency(value, locale, currency) {
  const formatter = new Intl.NumberFormat(locale, { style: 'currency', currency });
  return formatter.format(value);
}
