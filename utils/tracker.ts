
export const STORES = [
  'ParknShop', 'Wellcome', 'Market (Wet/Local)', 'AEON', 'HKTVmall', 
  '759 Store', 'Circle K', '7-11', 'Costco', 'Don Don Donki', 'Other'
];

export const CATEGORIES = [
  'General', 'Alcohol', 'Dairy', 'Meat', 'Fruit', 'Vegetables', 
  'Pantry', 'Snacks', 'Beverages', 'Household', 'Frozen'
];

export const CATEGORY_EMOJIS: Record<string, string> = {
  'General': '🏷️',
  'Alcohol': '🍷',
  'Dairy': '🥛',
  'Meat': '🥩',
  'Fruit': '🍎',
  'Vegetables': '🥦',
  'Pantry': '🥫',
  'Snacks': '🍪',
  'Beverages': '🥤',
  'Household': '🧻',
  'Frozen': '🧊'
};

export const UNITS = ['ml', 'l', 'g', 'kg', 'lb', 'jin', 'pcs'];

export const MULTIPLIERS: Record<string, number> = { 
  'ml': 1, 'l': 1000, 'g': 1, 'kg': 1000, 
  'lb': 453.592, 'jin': 604.8, 'pcs': 1 
};

export const normalize = (qty: number, unit: string) => qty * (MULTIPLIERS[unit] || 1);

export const fmtCurrency = (num: number) => 
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);

export const fmtDate = (d: any) => {
  if (!d) return '?';
  const _d = d?.toDate ? d.toDate() : new Date(d);
  return isNaN(_d.getTime()) ? '?' : _d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

/**
 * Formats a date for <input type="date"> (YYYY-MM-DD).
 * Uses local timezone components to ensure the selected date doesn't shift due to UTC conversions.
 */
export const fmtDateInput = (d: any) => {
  if (!d) return new Date().toISOString().split('T')[0];
  
  const _d = d.toDate ? d.toDate() : new Date(d);
  if (isNaN(_d.getTime())) return new Date().toISOString().split('T')[0];
  
  const year = _d.getFullYear();
  const month = String(_d.getMonth() + 1).padStart(2, '0');
  const day = String(_d.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

const UNIT_DISPLAY_CONFIG: Record<string, { multiplier: number, label: string }> = {
  'kg': { multiplier: 1000, label: 'kg' },
  'l': { multiplier: 1000, label: 'l' },
  'g': { multiplier: 100, label: '100g' },
  'lb': { multiplier: 100, label: '100g' },
  'jin': { multiplier: 100, label: '100g' },
  'ml': { multiplier: 100, label: '100ml' },
  'pcs': { multiplier: 1, label: 'pc' }
};

export const getPriceDisplayContext = (normalizedPrice: number, unit: string) => {
  const config = UNIT_DISPLAY_CONFIG[unit] || { multiplier: 1, label: unit };
  return {
    price: normalizedPrice * config.multiplier,
    unit: config.label
  };
};

/**
 * Calculates the price per single item in a purchase (e.g. one can in a 6-pack, or one bag).
 * Returns { price, label }.
 * Example: $60 for 6x500ml -> returns { price: 10, label: '500ml' }
 */
export const getPerItemPrice = (p: { price: number, count?: number, singleQty?: number, quantity?: number, unit: string }) => {
  const count = (p.count && p.count > 0) ? p.count : 1;
  const pricePerItem = p.price / count;
  
  // Use singleQty if available. If not, try to derive from quantity/count.
  // Fallback to 1 if missing.
  let size = p.singleQty;
  if (!size && p.quantity) {
     size = p.quantity / count;
  }
  if (!size) size = 1;
  
  // Format number to remove unnecessary decimals (e.g. 52.0 -> 52)
  const label = `${Number(size)}${p.unit}`;
  return { price: pricePerItem, label };
};

/**
 * Calculates the price for a specific quantity based on the normalized price (price per 1 unit/ml/g)
 */
export const getPriceByQuantity = (normalizedPrice: number, quantity: number, unit: string) => {
  const baseQty = normalize(quantity, unit);
  return {
    price: normalizedPrice * baseQty,
    unit: `${quantity}${unit}`
  };
};

const KEYWORD_MAP: Record<string, string[]> = {
  'Meat': ['pork', 'fish', 'chicken', 'beef', 'lamb', 'sausage', 'steak', 'meat'],
  'Fruit': ['apple', 'banana', 'orange', 'grape', 'berry', 'melon', 'pear', 'fruit', 'lemon', 'lime', 'mango', 'peach', 'plum', 'cherry', 'strawberry', 'blueberry'],
  'Pantry': ['soy', 'sauce', 'salt', 'sugar', 'oil', 'flour', 'noodle', 'rice', 'pasta', 'cereal'],
  'Vegetables': ['vegetable', 'veggie', 'cabbage', 'tomato', 'potato', 'carrot', 'onion', 'garlic', 'broccoli', 'kale', 'spinach', 'pepper'],
  'Dairy': ['cheese', 'egg', 'yogurt', 'milk', 'butter', 'cream'],
  'Alcohol': ['beer', 'wine', 'sake', 'alcohol', 'whiskey', 'vodka'],
  'Snacks': ['chip', 'cookie', 'biscuit', 'chocolate', 'snack', 'candy'],
  'Beverages': ['tea', 'coffee', 'juice', 'soda', 'water', 'coke']
};

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
