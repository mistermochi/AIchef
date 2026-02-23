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
  });
});
