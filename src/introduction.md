---
author: https://www.github.com/DikieDick
sheetId: 0
sheetTitle: Welcome to Waterproof JavaScript
---

# Waterproof JavaScript - Learn JavaScript using Waterproof

Welcome to **Waterproof JavaScript**! 

This tool was originally built as a demonstration for the [`waterproof-editor` project](https://www.github.com/impermeable/waterproof-editor),
which is built as part of the larger [Waterproof project](https://impermeable.github.io).

The Waterproof editor aims to bring an educational friendly editing experience.
It’s customizable, supports Markdown and $\LaTeX$, and only lets the user edit parts of a document that are meant to be edited.

Jump into the exercises below to see how it feels, start editing the code, press the `Check.` button, and see if you got it right!
If you ever get stuck, check the accompanying hints or the solution.

Happy learning!

## Example: Greet the World
Create a function that returns the famous "Hello, World!" greeting. (Using JavaScript)

<hint title="💡 Hint">
In JavaScript we can do something like:
```js
function greet() {
    return "Hello, World!";
}
```
</hint><input-area>
```js
function greet() {
    /* Your code here */
}
```
</input-area>
<hint title="🔍 Example Solution">
```js
function greet() {
    return "Hello, World!";
}
```
</hint>

## Exercise: Palindrome Checker
Write a function `isPalindrome` that checks if a given string is a palindrome (it reads the same forwards as backwards).

<hint title="💡 Hint">
You can reverse a string in JavaScript by splitting it into an array, reversing the array, and then joining it back together!
</hint><input-area>
```js
function isPalindrome(str) {
    /* Your code here */
}
```
</input-area>
<hint title="🔍 Example Solution">
```js
function isPalindrome(str) {
    const reversed = str.split('').reverse().join('');
    return str === reversed;
}
```
</hint>

## Exercise: Sum of an Array
Write a function `sumArray` that takes an array of numbers and returns their sum. If the array is empty, return $0$.

<hint title="💡 Hint">
You can iterate over the array with a simple `for` loop, or use the array `.reduce()` method if you're feeling fancy.
</hint><input-area>
```js
function sumArray(arr) {
    /* Your code here */
}
```
</input-area>
<hint title="🔍 Example Solution">
```js
function sumArray(arr) {
    return arr.reduce((sum, num) => sum + num, 0);
}
// Alternatively, using a for loop:
function sumArrayAlt(arr) {
    let sum = 0;
    for (let num of arr) {
        sum += num;
    }
    return sum;
}
```
</hint>

## Exercise: Merge Sort
Now for something a bit more challenging.
Let's implement **Merge Sort**, the classic divide-and-conquer algorithm. Merge Sort sorts an array by recursively splitting it into halves, sorting them, and then merging the sorted halves back together.

Complete the skeleton below in two steps:
1. First, implement the `merge` function to combine two already sorted arrays into a single sorted array.
2. Then, implement the `mergeSort` function which splits the array in half, recursively sorts both halves, and calls `merge` to bring them together.

<hint title="💡 Hint">
**Step 1:** Use two pointers (one for each array) to compare elements and push the smaller one into a result array. Don't forget to append any remaining elements from either array!
**Step 2:** The base case for the recursion is when the array has 1 or fewer elements (it's already sorted). Otherwise, find the middle point, slice the array into `left` and `right` parts, call `mergeSort` on both, and return the result of `merge(leftSorted, rightSorted)`.
</hint><input-area>
```js
function merge(left, right) {
    // Step 1: Implement the merge logic for two sorted arrays
    let result = [];
    /* Your code here */
    return result;
}

function mergeSort(arr) {
    // Step 2: Implement the recursive splitting and call merge
    if (arr.length <= 1) return arr;
    /* Your code here */
}
```
</input-area>
<hint title="🔍 Example Solution">
```js
function merge(left, right) {
    let result = [];
    let i = 0, j = 0;

    while (i < left.length && j < right.length) {
        if (left[i] < right[j]) {
            result.push(left[i]);
            i++;
        } else {
            result.push(right[j]);
            j++;
        }
    }

    while (i < left.length) {
        result.push(left[i]);
        i++;
    }

    while (j < right.length) {
        result.push(right[j]);
        j++;
    }

    return result;
}

function mergeSort(arr) {
    if (arr.length <= 1) return arr;

    const middle = Math.floor(arr.length / 2);
    const left = arr.slice(0, middle);
    const right = arr.slice(middle);

    const sortedLeft = mergeSort(left);
    const sortedRight = mergeSort(right);

    return merge(sortedLeft, sortedRight);
}
```
</hint>