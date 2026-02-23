
import { expect, TestContext } from '../utils/testRunner';
import { calcNormalizedPrice, getPerItemPrice, getCategory } from '../utils/tracker';
import { formatQty } from '../utils/helpers';
import { parseDurationToSeconds, findDurationInText, parseFuzzyNumber } from '../utils/parsers';
import { consolidateShoppingList } from '../utils/shopping';

export const runMathTests = async () => {
  const ctx = new TestContext();
  
  await ctx.run('Tracker: calcNormalizedPrice (Volume)', () => {
    // $10 for 500ml -> price per 1ml should be 0.02
    const res = calcNormalizedPrice(10, 500, 'ml');
    expect(res).toBe(0.02);
  });

  await ctx.run('Tracker: calcNormalizedPrice (Multipack)', () => {
    // $100 for 2 packs of 500ml (total 1000ml) -> 0.1 per ml
    const res = calcNormalizedPrice(100, 500 * 2, 'ml');
    expect(res).toBe(0.1);
  });

  await ctx.run('Tracker: getPerItemPrice (Multipack Display)', () => {
    const input = { price: 60, count: 6, singleQty: 330, unit: 'ml', quantity: 1980 };
    const res = getPerItemPrice(input);
    expect(res.price).toBe(10); // $60 / 6
    expect(res.label).toBe('330ml');
  });

  await ctx.run('Tracker: getCategory (Keywords)', () => {
    expect(getCategory('Fresh Milk')).toBe('Dairy');
    expect(getCategory('Chicken Breast')).toBe('Meat');
    expect(getCategory('Frozen Peas')).toBe('Frozen'); // Wait, Frozen is a category but depends on keyword?
    // Let's check keywords for Frozen
  });

  await ctx.run('Helpers: formatQty', () => {
    expect(formatQty(1.2345)).toBe(1.23);
    expect(formatQty(5)).toBe(5);
  });

  return ctx.results;
};

export const runParserTests = async () => {
  const ctx = new TestContext();

  await ctx.run('Parser: parseFuzzyNumber (Chinese)', () => {
    expect(parseFuzzyNumber('十二')).toBe(12);
    expect(parseFuzzyNumber('一百零五')).toBe(105);
    expect(parseFuzzyNumber('兩百三十')).toBe(230);
  });

  await ctx.run('Parser: Simple Minutes', () => {
    expect(parseDurationToSeconds('45', 'mins')).toBe(2700);
  });

  await ctx.run('Parser: Mixed Text (English)', () => {
    const found = findDurationInText("Bake for 45 mins at 200C");
    expect(found?.seconds).toBe(2700);
    expect(found?.label).toBe("45 mins");
  });
  
  await ctx.run('Parser: Mixed Text (Chinese)', () => {
    const found = findDurationInText("蒸三十分鐘");
    expect(found?.seconds).toBe(1800);
  });
  
  await ctx.run('Parser: Fuzzy Number (Half)', () => {
    expect(parseDurationToSeconds('半', 'hour')).toBe(1800);
  });

  return ctx.results;
};

export const runShoppingTests = async () => {
  const ctx = new TestContext();

  await ctx.run('Shopping: Unit Consolidation (g + kg)', () => {
    const input: any[] = [
        { id: '1', scalingFactor: 1, ingredients: [{ name: 'Beef', quantity: 500, unit: 'g' }] },
        { id: '2', scalingFactor: 1, ingredients: [{ name: 'Beef', quantity: 1, unit: 'kg' }] }
    ];
    const res = consolidateShoppingList(input);
    const beef = res.find(i => i.name === 'Beef');
    expect(beef?.quantity).toBe(1.5);
    expect(beef?.unit).toBe('kg');
  });

  await ctx.run('Shopping: Unit Consolidation (ml + l)', () => {
    const input: any[] = [
        { id: '3', scalingFactor: 1, ingredients: [{ name: 'Milk', quantity: 500, unit: 'ml' }] },
        { id: '4', scalingFactor: 2, ingredients: [{ name: 'Milk', quantity: 1, unit: 'l' }] }
    ];
    const res = consolidateShoppingList(input);
    const milk = res.find(i => i.name === 'Milk');
    expect(milk?.quantity).toBe(2.5);
    expect(milk?.unit).toBe('l');
  });

  return ctx.results;
};

// Legacy single entry point (if needed)
export const runUnitTests = async () => {
    const math = await runMathTests();
    const parser = await runParserTests();
    const shopping = await runShoppingTests();
    return [...math, ...parser, ...shopping];
};
