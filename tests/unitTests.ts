
import { expect, TestContext } from '../utils/testRunner';
import { calcNormalizedPrice, getPerItemPrice } from '../utils/tracker';
import { formatQty } from '../utils/helpers';
import { parseDurationToSeconds, findDurationInText } from '../utils/parsers';
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

  await ctx.run('Helpers: formatQty', () => {
    expect(formatQty(1.2345)).toBe(1.23);
    expect(formatQty(5)).toBe(5);
  });

  return ctx.results;
};

export const runParserTests = async () => {
  const ctx = new TestContext();

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

  return ctx.results;
};

// Legacy single entry point (if needed)
export const runUnitTests = async () => {
    const math = await runMathTests();
    const parser = await runParserTests();
    const shopping = await runShoppingTests();
    return [...math, ...parser, ...shopping];
};
