
import { Ingredient, ShoppingListItem } from '../model/types';
import { MULTIPLIERS, UNIT_TYPES } from '../config/app';

export const consolidateShoppingList = (cart: ShoppingListItem[]): Ingredient[] => {
  const list: Record<string, Ingredient> = {};
  
  cart.forEach(item => {
    item.ingredients.forEach(ing => {
      const rawName = ing.name.toLowerCase().trim();
      const rawUnit = ing.unit.toLowerCase().trim();
      const qty = (Number(ing.quantity) || 0) * (Number(item.scalingFactor) || 1);

      // Unit-Aware Normalization
      let groupingKey = `${rawName}|${rawUnit}`;
      let normalizedQty = qty;
      let finalUnit = ing.unit;

      const type = UNIT_TYPES[rawUnit];
      const multiplier = MULTIPLIERS[rawUnit];

      // If we know the type and multiplier, normalize to base unit for grouping
      if (type && multiplier) {
         const baseUnit = type === 'mass' ? 'g' : (type === 'volume' ? 'ml' : 'pcs');
         // Key is now name + TYPE (e.g. "sugar|mass") so "kg" and "g" merge
         groupingKey = `${rawName}|${type}`;
         normalizedQty = qty * multiplier;
         finalUnit = baseUnit; 
      }

      if (list[groupingKey]) {
        list[groupingKey].quantity += normalizedQty;
      } else {
        list[groupingKey] = { 
           name: ing.name, // Keep original casing of first item
           quantity: normalizedQty, 
           unit: finalUnit 
        };
      }
    });
  });

  // Formatting Pass: Convert back to readable units if large
  return Object.values(list).map(item => {
      // Simple heuristic: If > 1000g, show as kg. If > 1000ml, show as l.
      if (item.unit === 'g' && item.quantity >= 1000) {
          return { ...item, quantity: item.quantity / 1000, unit: 'kg' };
      }
      if (item.unit === 'ml' && item.quantity >= 1000) {
          return { ...item, quantity: item.quantity / 1000, unit: 'l' };
      }
      return item;
  }).sort((a, b) => {
    const nameA = a.name.toLowerCase();
    const nameB = b.name.toLowerCase();
    return nameA.localeCompare(nameB);
  });
};
