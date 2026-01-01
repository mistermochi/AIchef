
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

// Base Multipliers to convert TO the smallest common unit (ml, g, pcs)
export const MULTIPLIERS: Record<string, number> = { 
  'ml': 1, 
  'l': 1000, 
  'g': 1, 
  'kg': 1000, 
  'lb': 453.592, 
  'jin': 604.8, 
  'pcs': 1 
};

// Unit Types for safe aggregation
export const UNIT_TYPES: Record<string, 'volume' | 'mass' | 'count'> = {
  'ml': 'volume',
  'l': 'volume',
  'g': 'mass',
  'kg': 'mass',
  'lb': 'mass',
  'jin': 'mass',
  'pcs': 'count'
};

export const fmtCurrency = (num: number) => 
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);

export const fmtDate = (d: any) => {
  if (!d) return '?';
  const _d = d?.toDate ? d.toDate() : new Date(d);
  return isNaN(_d.getTime()) ? '?' : _d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const fmtDateInput = (d: any) => {
  if (!d) return new Date().toISOString().split('T')[0];
  const _d = d.toDate ? d.toDate() : new Date(d);
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
