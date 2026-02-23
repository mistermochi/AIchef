
/**
 * @module Constants
 * @description Centralized application constants and configuration.
 */

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

export const KEYWORD_MAP: Record<string, string[]> = {
  'Meat': ['pork', 'fish', 'chicken', 'beef', 'lamb', 'sausage', 'steak', 'meat'],
  'Fruit': ['apple', 'banana', 'orange', 'grape', 'berry', 'melon', 'pear', 'fruit', 'lemon', 'lime', 'mango', 'peach', 'plum', 'cherry', 'strawberry', 'blueberry'],
  'Pantry': ['soy', 'sauce', 'salt', 'sugar', 'oil', 'flour', 'noodle', 'rice', 'pasta', 'cereal'],
  'Vegetables': ['vegetable', 'veggie', 'cabbage', 'tomato', 'potato', 'carrot', 'onion', 'garlic', 'broccoli', 'kale', 'spinach', 'pepper'],
  'Dairy': ['cheese', 'egg', 'yogurt', 'milk', 'butter', 'cream'],
  'Alcohol': ['beer', 'wine', 'sake', 'alcohol', 'whiskey', 'vodka'],
  'Snacks': ['chip', 'cookie', 'biscuit', 'chocolate', 'snack', 'candy'],
  'Beverages': ['tea', 'coffee', 'juice', 'soda', 'water', 'coke'],
  'Frozen': ['frozen', 'ice cream', 'pizza', 'nuggets']
};

export const APPLIANCE_LIST = ['Air Fryer', 'Instant Pot', 'Blender', 'Slow Cooker', 'Sous Vide', 'Food Processor', 'Wok'];
export const DIETARY_LIST = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Keto', 'Low Carb', 'Dairy-Free', 'Nut-Free'];
