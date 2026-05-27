import { ExerciseData } from "./exerciseData";

type CheckMessageType = ExerciseData & {code:  string};

self.onmessage = function (e) {
  const { code, tests, idx, functionName } = e.data as CheckMessageType;
  try {
    // Create a function wrapper
    const userFunc = new Function(`
      "use strict";
      ${code}
      return ${functionName};
    `)();

    if (typeof userFunc !== "function") {
      throw new Error(`${functionName} is not defined`);
    }

    const results = tests.map(test => {
      const output = userFunc(test.input);
      return {
        input: test.input,
        expected: test.expected,
        output,
        pass: deepEqual(output, test.expected)
      };
    });

    self.postMessage({ success: true, results, idx });
  } catch (err: any) {
    self.postMessage({ success: false, error: err.message });
  }
};

function deepEqual(a: Object, b: Object): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}