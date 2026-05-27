export type ExerciseData = {
  functionName: string;
  tests: {
    input: any;
    expected: any;
  }[];
  idx: number;
  timeout: number;
}

export const exerciseData: Array<Array<ExerciseData>> = [
  [
    {
      functionName: "greet",
      tests: [ {input: {}, expected: "Hello, World!"} ],
      idx: 0,
      timeout: 1000
    },
    {
      functionName: "isPalindrome",
      tests: [
        { input: "racecar", expected: true },
        { input: "waterproof", expected: false },
        { input: "radar", expected: true },
        { input: "hello", expected: false }
      ],
      idx: 1,
      timeout: 1000
    },
    {
      functionName: "sumArray",
      tests: [
        { input: [1, 2, 3, 4], expected: 10 },
        { input: [10, -5, 5], expected: 10 },
        { input: [], expected: 0 },
        { input: [42], expected: 42 }
      ],
      idx: 2,
      timeout: 3000
    },
    {
      functionName: "mergeSort",
      tests: [
        { input: [3, 1, 4, 1, 5, 9, 2, 6, 5], expected: [1, 1, 2, 3, 4, 5, 5, 6, 9] },
        { input: [10, -1, 2, 5, 0], expected: [-1, 0, 2, 5, 10] },
        { input: [], expected: [] },
        { input: [42], expected: [42] }
      ],
      idx: 3,
      timeout: 5000
    }
  ]
];