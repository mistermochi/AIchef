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
  });
});
