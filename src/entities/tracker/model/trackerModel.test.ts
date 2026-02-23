import { calcNormalizedPrice, getPerItemPrice, getCategory } from './trackerModel';

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

    it('should handle all supported units', () => {
      // 1L = 1000ml. $10 for 1L -> 0.01 per ml
      expect(calcNormalizedPrice(10, 1, 'l')).toBe(0.01);
      // 1kg = 1000g. $20 for 1kg -> 0.02 per g
      expect(calcNormalizedPrice(20, 1, 'kg')).toBe(0.02);
      // 1lb = 453.592g. $10 for 1lb -> 10 / 453.592
      expect(calcNormalizedPrice(10, 1, 'lb')).toBeCloseTo(0.022, 3);
      // 1 jin = 604.8g. $30 for 1 jin -> 30 / 604.8
      expect(calcNormalizedPrice(30, 1, 'jin')).toBeCloseTo(0.0496, 4);
      // pcs is 1:1
      expect(calcNormalizedPrice(5, 10, 'pcs')).toBe(0.5);
    });

    it('should handle negative values by returning 0', () => {
      expect(calcNormalizedPrice(-10, 100, 'g')).toBe(0);
      expect(calcNormalizedPrice(10, -100, 'g')).toBe(0);
    });

    it('should fallback to 1:1 for unknown units', () => {
      expect(calcNormalizedPrice(10, 10, 'unknown')).toBe(1);
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

    it('should be case insensitive', () => {
      expect(getCategory('fresh MILK')).toBe('Dairy');
    });

    it('should handle empty or null input', () => {
      expect(getCategory('')).toBe('General');
      expect(getCategory(null as any)).toBe('General');
    });

    it('should match the longest keyword', () => {
      // 'frozen' is 6 chars, 'pizza' is 5 chars. If both are present, 'frozen' wins?
      // Actually KEYWORD_MAP has 'frozen' in 'Frozen' category.
      expect(getCategory('Frozen Pizza')).toBe('Frozen');
    });
  });
});
