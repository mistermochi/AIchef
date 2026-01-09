
export type TestResult = {
  description: string;
  passed: boolean;
  error?: string;
  duration: number;
};

export type TestSuite = {
  name: string;
  tests: (() => Promise<TestResult>)[];
};

export class TestContext {
  results: TestResult[] = [];

  async run(description: string, testFn: () => Promise<void> | void): Promise<TestResult> {
    const start = performance.now();
    let result: TestResult;
    try {
      await testFn();
      const end = performance.now();
      result = { description, passed: true, duration: end - start };
    } catch (e: any) {
      const end = performance.now();
      result = { description, passed: false, error: e.message, duration: end - start };
    }
    this.results.push(result);
    return result;
  }
}

export const expect = (actual: any) => ({
  toBe: (expected: any) => {
    if (actual !== expected) throw new Error(`Expected ${expected} but got ${actual}`);
  },
  toEqual: (expected: any) => {
    const isEq = JSON.stringify(actual) === JSON.stringify(expected);
    if (!isEq) throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
  },
  toBeTruthy: () => {
    if (!actual) throw new Error(`Expected value to be truthy`);
  },
  toBeGreaterThan: (expected: number) => {
    if (actual <= expected) throw new Error(`Expected ${actual} to be greater than ${expected}`);
  },
  toContain: (item: any) => {
    if (Array.isArray(actual)) {
       if (!actual.includes(item)) throw new Error(`Array did not contain ${item}`);
    } else if (typeof actual === 'string') {
       if (!actual.includes(item)) throw new Error(`String did not contain substring "${item}"`);
    } else {
       throw new Error(`toContain only works on Arrays and Strings`);
    }
  }
});
