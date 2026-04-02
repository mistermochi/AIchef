import { parseDurationToSeconds, findDurationInText, parseFuzzyNumber } from './parsers';

describe('parsers utils', () => {
  describe('parseFuzzyNumber', () => {
    it('should parse simple Chinese numbers', () => {
      expect(parseFuzzyNumber('十二')).toBe(12);
      expect(parseFuzzyNumber('一百零五')).toBe(105);
      expect(parseFuzzyNumber('兩百三十')).toBe(230);
    });

    it('should parse "半" as 0.5', () => {
      expect(parseFuzzyNumber('半')).toBe(0.5);
    });

    it('should handle invalid input', () => {
      expect(parseFuzzyNumber('')).toBe(0);
      expect(parseFuzzyNumber('abc')).toBe(0);
    });
  });

  describe('parseDurationToSeconds', () => {
    it('should parse simple minutes', () => {
      expect(parseDurationToSeconds('45', 'mins')).toBe(2700);
    });

    it('should parse fuzzy hours', () => {
      expect(parseDurationToSeconds('半', 'hour')).toBe(1800);
    });
  });

  describe('findDurationInText', () => {
    it('should find duration in English text', () => {
      const found = findDurationInText("Bake for 45 mins at 200C");
      expect(found?.seconds).toBe(2700);
      expect(found?.label).toBe("45 mins");
    });

    it('should find duration in Chinese text', () => {
      const found = findDurationInText("蒸三十分鐘");
      expect(found?.seconds).toBe(1800);
    });

    it('should handle missing units', () => {
      expect(findDurationInText("Bake for 45 at 200C")).toBeNull();
    });

    it('should handle empty string', () => {
      expect(findDurationInText("")).toBeNull();
    });
  });

  describe('evaluateArithmetic', () => {
    const { evaluateArithmetic } = require('./parsers');

    it('should evaluate simple expressions', () => {
      expect(evaluateArithmetic('10+5')).toBe('15');
      expect(evaluateArithmetic('10-5')).toBe('5');
      expect(evaluateArithmetic('10*5')).toBe('50');
      expect(evaluateArithmetic('10/5')).toBe('2');
    });

    it('should handle visual operators', () => {
      expect(evaluateArithmetic('10x5')).toBe('50');
      expect(evaluateArithmetic('10×5')).toBe('50');
      expect(evaluateArithmetic('10÷2')).toBe('5');
    });

    it('should handle parentheses and precedence', () => {
      expect(evaluateArithmetic('10+5*2')).toBe('20');
      expect(evaluateArithmetic('(10+5)*2')).toBe('30');
    });

    it('should round to 2 decimal places', () => {
      expect(evaluateArithmetic('10/3')).toBe('3.33');
      expect(evaluateArithmetic('0.1+0.2')).toBe('0.3');
      expect(evaluateArithmetic('18.0x2-3.1')).toBe('32.9');
    });

    it('should return null for no operators', () => {
      expect(evaluateArithmetic('100')).toBeNull();
      expect(evaluateArithmetic('abc')).toBeNull();
    });

    it('should return null for errors', () => {
      expect(evaluateArithmetic('10/0')).toBeNull();
      expect(evaluateArithmetic('10+/2')).toBeNull();
    });
  });
});
