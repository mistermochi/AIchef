import { calcNormalizedPrice, getPerItemPrice, getCategory } from './tracker';

describe('tracker utils', () => {
  describe('calcNormalizedPrice', () => {
    it('should calculate price per 1ml correctly', () => {
      // $10 for 500ml -> 0.02 per ml
      expect(calcNormalizedPrice(10, 500, 'ml')).toBe(0.02);
    });

    it('should calculate multipack price correctly', () => {
      // $100 for 1000ml (2x500ml) -> 0.1 per ml
      expect(calcNormalizedPrice(100, 1000, 'ml')).toBe(0.1);
    });

    it('should return 0 for zero quantity', () => {
      expect(calcNormalizedPrice(10, 0, 'ml')).toBe(0);
    });
  });

  describe('getPerItemPrice', () => {
    it('should handle multipack display labels', () => {
      const input = { price: 60, count: 6, singleQty: 330, unit: 'ml', quantity: 1980 };
      const res = getPerItemPrice(input);
      expect(res.price).toBe(10);
      expect(res.label).toBe('330ml');
    });
  });

  describe('getCategory', () => {
    it('should detect Dairy for milk', () => {
      expect(getCategory('Fresh Milk')).toBe('Dairy');
    });

    it('should detect Meat for chicken', () => {
      expect(getCategory('Chicken Breast')).toBe('Meat');
    });

    it('should fallback to General', () => {
      expect(getCategory('Random Item')).toBe('General');
    });
  });
});
