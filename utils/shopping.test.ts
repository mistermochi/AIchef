import { consolidateShoppingList } from './shopping';

describe('shopping utils', () => {
  describe('consolidateShoppingList', () => {
    it('should merge g and kg units', () => {
      const input: any[] = [
        { id: '1', scalingFactor: 1, ingredients: [{ name: 'Beef', quantity: 500, unit: 'g' }] },
        { id: '2', scalingFactor: 1, ingredients: [{ name: 'Beef', quantity: 1, unit: 'kg' }] }
      ];
      const res = consolidateShoppingList(input);
      const beef = res.find(i => i.name === 'Beef');
      expect(beef?.quantity).toBe(1.5);
      expect(beef?.unit).toBe('kg');
    });

    it('should merge ml and l units', () => {
      const input: any[] = [
        { id: '3', scalingFactor: 1, ingredients: [{ name: 'Milk', quantity: 500, unit: 'ml' }] },
        { id: '4', scalingFactor: 2, ingredients: [{ name: 'Milk', quantity: 1, unit: 'l' }] }
      ];
      const res = consolidateShoppingList(input);
      const milk = res.find(i => i.name === 'Milk');
      expect(milk?.quantity).toBe(2.5);
      expect(milk?.unit).toBe('l');
    });

    it('should handle zero quantity', () => {
      const input: any[] = [
        { id: '5', scalingFactor: 1, ingredients: [{ name: 'Salt', quantity: 0, unit: 'g' }] }
      ];
      const res = consolidateShoppingList(input);
      expect(res[0].quantity).toBe(0);
    });

    it('should handle negative scaling factor', () => {
      const input: any[] = [
        { id: '6', scalingFactor: -1, ingredients: [{ name: 'Sugar', quantity: 100, unit: 'g' }] }
      ];
      const res = consolidateShoppingList(input);
      // It multiplies it, so it might be negative. Let's see how it behaves.
      expect(res[0].quantity).toBe(-100);
    });

    it('should handle empty cart', () => {
      const res = consolidateShoppingList([]);
      expect(res).toEqual([]);
    });
  });
});
