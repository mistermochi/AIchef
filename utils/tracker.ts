
import { Timestamp } from 'firebase/firestore';
import { MULTIPLIERS, KEYWORD_MAP } from '../constants/app';

export { STORES, CATEGORIES, CATEGORY_EMOJIS, UNITS, MULTIPLIERS, UNIT_TYPES } from '../constants/app';

/**
 * Formats a number as a USD currency string.
 * @param {number} num - The number to format.
 * @returns {string} Formatted currency string.
 */
export const fmtCurrency = (num: number) => 
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);

/**
 * Normalizes various date formats (Firestore Timestamp, Date, string) into a Javascript Date.
 * @param {Timestamp|Date|string|null|undefined} d - The date-like object.
 * @returns {Date} Normalized Date object.
 */
export const toDate = (d: Timestamp | Date | string | null | undefined): Date => {
  if (!d) return new Date();
  if (d instanceof Date) return d;
  if (d && typeof (d as any).toDate === 'function') return (d as any).toDate();
  const _d = new Date(d as string | number | Date);
  return isNaN(_d.getTime()) ? new Date() : _d;
};

/**
 * Formats a Firestore Timestamp or Date object into a short date string (e.g., "Jan 1").
 * @param {Timestamp|Date|string|null|undefined} d - The date or timestamp to format.
 * @returns {string} Short date string.
 */
export const fmtDate = (d: Timestamp | Date | string | null | undefined) => {
  const _d = toDate(d);
  return _d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

/**
 * Formats a date for use in an HTML date input (YYYY-MM-DD).
 * @param {Timestamp|Date|string|null|undefined} d - The date or timestamp to format.
 * @returns {string} Date string in YYYY-MM-DD format.
 */
export const fmtDateInput = (d: Timestamp | Date | string | null | undefined) => {
  const _d = toDate(d);
  if (isNaN(_d.getTime())) return new Date().toISOString().split('T')[0];
  const year = _d.getFullYear();
  const month = String(_d.getMonth() + 1).padStart(2, '0');
  const day = String(_d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * CORE LOGIC: Calculates a comparable price score across different units.
 * Converts input quantity to a Base Unit (g, ml, pcs) before dividing.
 * Returns Price Per Base Unit.
 */
export const calcNormalizedPrice = (price: number, quantity: number, unit: string) => {
  if (!price || !quantity) return 0;
  const multiplier = MULTIPLIERS[unit.toLowerCase()] || 1;
  const totalBaseUnits = quantity * multiplier;
  return totalBaseUnits > 0 ? price / totalBaseUnits : 0;
};

/**
 * Calculates the price per single item in a purchase for UI Display.
 * Returns { price, label }.
 * Example: $60 for 6x500ml -> returns { price: 10, label: '500ml' }
 */
export const getPerItemPrice = (p: { price: number, count?: number, singleQty?: number, quantity?: number, unit: string }) => {
  const count = (p.count && p.count > 0) ? p.count : 1;
  const pricePerItem = p.price / count;
  
  let size = p.singleQty;
  if (!size && p.quantity) {
     size = p.quantity / count;
  }
  if (!size) size = 1;
  
  const label = `${Number(size)}${p.unit}`;
  return { price: pricePerItem, label };
};

/**
 * Heuristically determines the category of a product based on its name.
 * Uses a keyword map for common grocery items.
 * @param {string} name - The product name.
 * @returns {string} The determined category name, or 'General' if no match.
 */
export const getCategory = (name: string): string => {
  if (!name) return 'General';
  const n = name.toLowerCase();
  
  let bestCat = 'General';
  let maxLen = 0;

  for (const [cat, keywords] of Object.entries(KEYWORD_MAP)) {
    for (const k of keywords) {
      if (n.includes(k) && k.length > maxLen) {
        maxLen = k.length;
        bestCat = cat;
      }
    }
  }
  return bestCat;
};
