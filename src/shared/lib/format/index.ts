
/**
 * Formats a number as a USD currency string.
 * @param {number} num - The number to format.
 * @returns {string} Formatted currency string.
 */
export const fmtCurrency = (num: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
