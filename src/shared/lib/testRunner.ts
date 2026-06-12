
export type TestResult = {
  description: string;
  passed: boolean;
  error?: string;
  duration: number;
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
});
