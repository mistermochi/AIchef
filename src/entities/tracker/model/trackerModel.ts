
import { MULTIPLIERS, KEYWORD_MAP } from '../../../shared/config/app';

/**
 * CORE LOGIC: Calculates a comparable price score across different units.
 * Converts input quantity to a Base Unit (g, ml, pcs) before dividing.
 * Returns Price Per Base Unit.
 */
export const calcNormalizedPrice = (price: number, quantity: number, unit: string) => {
  if (!price || !quantity || price < 0 || quantity < 0) return 0;
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
