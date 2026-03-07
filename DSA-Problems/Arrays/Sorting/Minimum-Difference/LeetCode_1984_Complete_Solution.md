# LeetCode 1984: Minimum Difference Between Highest and Lowest of K Scores
## Complete Step-by-Step Solution Guide

---

## 1. High-Level Interpretation

**What the problem asks:**
You're given an array of student scores and need to select exactly `k` students such that the difference between the highest and lowest score among your selection is as small as possible. Think of it as grouping students with similar performance levels.

**Why it matters:**
This is a classic optimization problem that tests your understanding of sorting, sliding windows, and greedy algorithms. It appears in real-world scenarios like forming balanced teams, creating fair groupings, or clustering similar data points.

**Hidden traps to watch for:**
- **Edge case:** When `k = 1`, the difference is always 0 (only one element selected)
- **Misunderstanding:** You might think you need to find k consecutive indices in the original array, but you can pick ANY k students
- **Sorting insight:** The problem doesn't require maintaining original order, which is the key unlock
- **Off-by-one:** When sliding the window, ensure you're checking exactly k elements
- No negative numbers (constraint: `0 <= nums[i] <= 10^5`), so no sign handling needed

---

## 2. Brute-Force Approach

### 2.1 Plain-English Description

The most straightforward approach is to try every possible combination of `k` students:
1. Generate all possible ways to choose `k` students from `n` total students (combinations)
2. For each combination, find the maximum and minimum scores
3. Calculate the difference (max - min)
4. Track the minimum difference seen across all combinations
5. Return the minimum difference

This is guaranteed to find the correct answer because we exhaustively check every possibility.

### 2.2 Pseudocode

```
function minimumDifferenceBruteForce(nums, k):
    n = length of nums
    minDiff = INFINITY

    // Generate all combinations of k elements
    function generateCombinations(start, currentCombo):
        if length of currentCombo == k:
            // Found a complete combination
            maxScore = max of currentCombo
            minScore = min of currentCombo
            difference = maxScore - minScore
            minDiff = min(minDiff, difference)
            return

        // Try including each remaining element
        for i from start to n-1:
            add nums[i] to currentCombo
            generateCombinations(i+1, currentCombo)
            remove last element from currentCombo

    generateCombinations(0, empty array)
    return minDiff
```

### 2.3 Time & Space Complexity

**Time Complexity: O(C(n,k) × k)**
- We generate all combinations: C(n,k) = n!/(k!(n-k)!)
- For each combination, we find min and max: O(k)
- For n=1000, k=500: C(1000,500) ≈ 2.7 × 10^299 operations (completely infeasible!)

**Space Complexity: O(k)**
- Recursion depth: O(k) for the combination generation
- Storage for current combination: O(k)
- Total: O(k)

**Derivation:**
- The number of ways to choose k items from n items is the binomial coefficient C(n,k)
- This grows exponentially and quickly becomes unmanageable
- Even for moderate inputs (n=20, k=10), we'd have 184,756 combinations

### 2.4 Dry Run (Example 2: nums = [9,4,1,7], k = 2)

| Step | Current Combo | Max | Min | Difference | MinDiff So Far |
|------|---------------|-----|-----|------------|----------------|
| 1    | [9, 4]        | 9   | 4   | 5          | 5              |
| 2    | [9, 1]        | 9   | 1   | 8          | 5              |
| 3    | [9, 7]        | 9   | 7   | 2          | **2**          |
| 4    | [4, 1]        | 4   | 1   | 3          | 2              |
| 5    | [4, 7]        | 7   | 4   | 3          | 2              |
| 6    | [1, 7]        | 7   | 1   | 6          | 2              |

**Final Answer:** 2

### 2.5 Why This Fails

Given the constraints (n ≤ 1000, k ≤ n), the brute-force approach is computationally infeasible:
- For n=1000, k=500: We'd need to check ~10^299 combinations
- Even modern computers at 10^9 operations/second would take longer than the age of the universe
- LeetCode typically has 1-2 second time limits
- **Verdict:** We need a fundamentally different approach that doesn't enumerate all combinations

---

## 3. Improved Approach: Sorting + Sliding Window

### 3.1 Key Insight

**The breakthrough realization:** If we want to minimize the difference between the max and min of k elements, we should pick elements that are **close together in value**.

**Why sorting helps:**
- After sorting, elements close in value are positioned next to each other
- Any k consecutive elements in a sorted array will have the minimum possible difference for those specific k elements
- To minimize max - min, we want max to be as small as possible and min to be as large as possible
- This happens when we pick elements clustered together in the sorted array

**Proof sketch:**
Suppose we have a sorted array and we pick k elements. If our selection is NOT consecutive (we skip an element), we could replace the largest element with the skipped element (which is smaller) to get a smaller or equal difference. Thus, optimal selections are always consecutive after sorting.

### 3.2 Algorithm Description

1. **Sort the array** in ascending order: O(n log n)
2. **Slide a window** of size k across the sorted array
3. For each window position, the difference is `nums[i+k-1] - nums[i]`
   - `nums[i]` is the minimum (leftmost element of window)
   - `nums[i+k-1]` is the maximum (rightmost element of window)
4. Track the minimum difference across all windows
5. Return the minimum difference

### 3.3 Pseudocode

```
function minimumDifference(nums, k):
    if k == 1:
        return 0

    // Sort the array
    sort nums in ascending order

    minDiff = INFINITY

    // Slide window of size k
    for i from 0 to (length of nums - k):
        difference = nums[i + k - 1] - nums[i]
        minDiff = min(minDiff, difference)

    return minDiff
```

### 3.4 JavaScript Implementation

```javascript
/**
 * @param {number[]} nums
 * @param {number} k
 * @return {number}
 */
function minimumDifference(nums, k) {
    // Edge case: only one student to pick
    if (k === 1) return 0;

    // Sort the scores in ascending order
    nums.sort((a, b) => a - b);

    let minDiff = Infinity;

    // Slide a window of size k across the sorted array
    for (let i = 0; i <= nums.length - k; i++) {
        // Difference between max (rightmost) and min (leftmost) in window
        const currentDiff = nums[i + k - 1] - nums[i];
        minDiff = Math.min(minDiff, currentDiff);
    }

    return minDiff;
}
```

### 3.5 Time & Space Complexity

**Time Complexity: O(n log n)**
- Sorting: O(n log n)
- Sliding window: O(n - k + 1) = O(n)
- Total: O(n log n + n) = **O(n log n)**

**Space Complexity: O(1) or O(log n)**
- If we can modify the input array: O(1) auxiliary space
- Sorting typically uses O(log n) space for the recursion stack (depends on sort implementation)
- No additional data structures needed
- **Practically O(1)** - meets the follow-up requirement!

**Derivation:**
- Array.sort() in JavaScript uses Timsort (hybrid of merge sort and insertion sort)
- Worst-case time: O(n log n)
- Space: O(n) in worst case for merge sort, but typically O(log n) for recursion
- The sliding window is a single pass: O(n)

### 3.6 Dry Run (Example 2: nums = [9,4,1,7], k = 2)

**Initial state:**
```
nums = [9, 4, 1, 7]
k = 2
minDiff = Infinity
```

**Step-by-step execution:**

| Step | Action | Array State | i | Window | Difference | minDiff |
|------|--------|-------------|---|--------|------------|---------|
| 0    | Initial | [9,4,1,7] | - | - | - | ∞ |
| 1    | Sort | [1,4,7,9] | - | - | - | ∞ |
| 2    | Window at i=0 | [**1,4**,7,9] | 0 | [1,4] | 4-1=3 | **3** |
| 3    | Window at i=1 | [1,**4,7**,9] | 1 | [4,7] | 7-4=3 | 3 |
| 4    | Window at i=2 | [1,4,**7,9**] | 2 | [7,9] | 9-7=2 | **2** |
| 5    | Loop ends | [1,4,7,9] | - | - | - | 2 |

**Detailed trace:**
```
After sorting: [1, 4, 7, 9]

i=0: Window [1, 4]
     nums[0+2-1] - nums[0] = nums[1] - nums[0] = 4 - 1 = 3
     minDiff = min(∞, 3) = 3

i=1: Window [4, 7]
     nums[1+2-1] - nums[1] = nums[2] - nums[1] = 7 - 4 = 3
     minDiff = min(3, 3) = 3

i=2: Window [7, 9]
     nums[2+2-1] - nums[2] = nums[3] - nums[2] = 9 - 7 = 2
     minDiff = min(3, 2) = 2

Return 2
```

**Final Answer:** 2 ✓

### 3.7 Trade-offs

**Advantages:**
- Dramatically faster: O(n log n) vs exponential
- Simple to understand and implement
- Meets the O(1) space follow-up (if we can modify input)
- No complex data structures needed

**Disadvantages:**
- Modifies the input array (can be avoided with a copy, but costs O(n) space)
- Doesn't preserve original order (not needed for this problem)

---

## 4. Optimal Approach (Same as Improved)

The sorting + sliding window approach **IS** the optimal solution. There's no known better algorithm because:
1. We must examine all elements at least once: Ω(n)
2. We need to identify the k closest elements, which requires sorting or equivalent: Ω(n log n)
3. The sliding window is optimal for finding the minimum window difference: O(n)

### 4.1 Proof of Correctness

**Claim:** After sorting, the minimum difference is always achieved by selecting k consecutive elements.

**Proof by contradiction:**

Assume the optimal selection S contains k elements that are NOT consecutive in the sorted array. This means there exists some element e in the sorted array that lies between two elements in S but is not in S.

Let:
- max(S) = maximum element in S
- min(S) = minimum element in S
- e = the skipped element

Since the array is sorted and e lies between elements of S:
- min(S) < e < max(S)

Now consider a new selection S' where we:
- Remove max(S) from S
- Add e to S

For S':
- max(S') = max(S \ {max(S)}) or e, whichever is larger
- Since e < max(S), we have max(S') ≤ max(S)
- min(S') = min(S) (unchanged, or possibly larger if we removed min)

The difference for S': 
- diff(S') = max(S') - min(S') ≤ max(S) - min(S) = diff(S)

This contradicts our assumption that S was optimal. Therefore, the optimal selection must be consecutive in the sorted array. **QED**

### 4.2 Why This Works (Invariant)

**Loop Invariant:** After checking the first i windows, `minDiff` contains the minimum difference among all those windows.

**Initialization:** Before the loop, minDiff = ∞, trivially true.

**Maintenance:** At each iteration, we update minDiff if the current window has a smaller difference.

**Termination:** After checking all n-k+1 windows, minDiff contains the global minimum.

### 4.3 Complete JavaScript Implementation

```javascript
/**
 * Finds the minimum difference between highest and lowest scores
 * when selecting exactly k students
 * 
 * @param {number[]} nums - Array of student scores
 * @param {number} k - Number of students to select
 * @return {number} - Minimum possible difference
 * 
 * Time Complexity: O(n log n) - dominated by sorting
 * Space Complexity: O(1) - constant extra space (excluding sort space)
 */
function minimumDifference(nums, k) {
    // Edge case: selecting only one student means no difference
    if (k === 1) return 0;

    // Sort scores in ascending order
    // After sorting, similar scores are adjacent
    nums.sort((a, b) => a - b);

    let minDiff = Infinity;

    // Slide a window of size k across the sorted array
    // Each window represents a valid selection of k students
    // The difference for each window is: rightmost - leftmost
    for (let i = 0; i <= nums.length - k; i++) {
        const windowDiff = nums[i + k - 1] - nums[i];
        minDiff = Math.min(minDiff, windowDiff);
    }

    return minDiff;
}

// Test cases
console.log(minimumDifference([90], 1));           // Output: 0
console.log(minimumDifference([9,4,1,7], 2));      // Output: 2
console.log(minimumDifference([87063,61094,44530,21297,95857,93551,9918], 6)); // Output: 74560
```

### 4.4 Detailed Dry Run (Example 2: nums = [9,4,1,7], k = 2)

**Variable Initialization:**
```
Input: nums = [9, 4, 1, 7], k = 2
minDiff = Infinity
```

**Execution Trace:**

```
Step 1: Check edge case
k === 1? No, k = 2
Continue...

Step 2: Sort the array
Before: [9, 4, 1, 7]
After:  [1, 4, 7, 9]

Step 3: Sliding window loop
Total windows to check: nums.length - k + 1 = 4 - 2 + 1 = 3

Window 1 (i = 0):
    Elements: nums[0] to nums[1] = [1, 4]
    Left boundary: nums[0] = 1
    Right boundary: nums[0 + 2 - 1] = nums[1] = 4
    windowDiff = 4 - 1 = 3
    minDiff = min(Infinity, 3) = 3

Window 2 (i = 1):
    Elements: nums[1] to nums[2] = [4, 7]
    Left boundary: nums[1] = 4
    Right boundary: nums[1 + 2 - 1] = nums[2] = 7
    windowDiff = 7 - 4 = 3
    minDiff = min(3, 3) = 3

Window 3 (i = 2):
    Elements: nums[2] to nums[3] = [7, 9]
    Left boundary: nums[2] = 7
    Right boundary: nums[2 + 2 - 1] = nums[3] = 9
    windowDiff = 9 - 7 = 2
    minDiff = min(3, 2) = 2

Loop termination condition: i = 3 > nums.length - k = 2
Exit loop

Step 4: Return result
Return minDiff = 2
```

**Answer: 2** ✓

### 4.5 Complexity Analysis (Tight Bounds)

**Time Complexity: Θ(n log n)**
- **Best case:** Θ(n log n) - must sort regardless of input
- **Average case:** Θ(n log n) - sorting dominates
- **Worst case:** Θ(n log n) - sorting is the bottleneck
- The sliding window is Θ(n) in all cases
- Combined: Θ(n log n + n) = Θ(n log n)

**Space Complexity: O(1) auxiliary**
- We modify the input array in-place
- Only store: minDiff (1 variable), loop counter (1 variable), windowDiff (1 variable)
- Sorting space: O(log n) for recursion stack (implementation dependent)
- **Practical answer for interviews:** O(1) auxiliary space

**Practical Performance:**
- For n = 1000 (max constraint): ~10,000 operations (very fast)
- For n = 100,000: ~1,600,000 operations (still under 1 second)
- Memory: ~4KB for array of 1000 integers

---

## 5. Interview-Ready 60-90 Second Explanation

> "This problem asks us to select k students from an array such that the difference between the highest and lowest score is minimized. 
>
> The key insight is that after sorting the array, any k elements that are close in value will be positioned consecutively. To minimize the max-minus-min difference, we want to pick elements clustered together.
>
> My approach is: First, sort the array in O(n log n) time. Then, slide a window of size k across the sorted array. For each window position, the difference is simply the rightmost element minus the leftmost element. We track the minimum difference across all windows and return it.
>
> The total time complexity is O(n log n) due to sorting, and the space complexity is O(1) since we only use a constant amount of extra memory. This is optimal because we can't do better than n log n for a comparison-based solution that requires identifying closest elements."

---

## 6. Visual Diagram (ASCII)

### How Sorting + Sliding Window Works

```
Original Array: [9, 4, 1, 7]     k = 2
                 Random order

                    ↓ SORT ↓

Sorted Array:   [1, 4, 7, 9]
                 Ascending order - similar values are adjacent

Now slide a window of size k=2:

Window 1:       [1, 4] 7  9      Diff = 4-1 = 3  ← Current min
                 └─┬─┘
                 min max

Window 2:        1 [4, 7] 9      Diff = 7-4 = 3  ← Still min
                    └─┬─┘
                    min max

Window 3:        1  4 [7, 9]     Diff = 9-7 = 2  ← NEW min! ✓
                       └─┬─┘
                       min max

Answer: 2
```

### Why Non-Consecutive Elements Don't Help

```
Sorted: [1, 4, 7, 9]

If we skip elements:
Select [1, 7]:  Diff = 7-1 = 6  ❌ Worse!
Select [1, 9]:  Diff = 9-1 = 8  ❌ Much worse!
Select [4, 9]:  Diff = 9-4 = 5  ❌ Worse!

Consecutive elements always minimize the difference!
```

---

## 7. Additional Test Cases & Edge Cases

```javascript
// Edge Cases
console.log(minimumDifference([1], 1));                    // 0 (single element)
console.log(minimumDifference([1, 1, 1, 1], 3));          // 0 (all same)
console.log(minimumDifference([1, 2, 3, 4, 5], 5));       // 4 (all elements)

// Larger Inputs
console.log(minimumDifference([9,4,1,7], 2));             // 2 (from examples)
console.log(minimumDifference([9,4,1,7], 3));             // 6 ([1,4,7] or [4,7,9])
console.log(minimumDifference([10, 20, 30, 40], 2));      // 10 (uniform spacing)

// Unsorted with duplicates
console.log(minimumDifference([100, 50, 50, 100], 2));    // 0 ([50,50])
```

---

## 8. Summary Comparison

| Approach | Time | Space | Feasible? | Key Idea |
|----------|------|-------|-----------|----------|
| Brute Force | O(C(n,k) × k) | O(k) | ❌ No | Try all combinations |
| Sorting + Window | O(n log n) | O(1) | ✅ Yes | Consecutive elements after sorting |

---

## 9. Key Takeaways

1. **Sorting transforms** hard problems into tractable ones
2. **Sliding window** is efficient for checking all consecutive subarrays
3. **Greedy insight:** For minimizing range, pick clustered values
4. Always consider: Can sorting help simplify the problem?
5. The "select k elements" phrase doesn't mean consecutive in original array!

---

## 10. Related Problems

- **LeetCode 239:** Sliding Window Maximum (similar window technique)
- **LeetCode 1499:** Max Value of Equation (sliding window with optimization)
- **LeetCode 658:** Find K Closest Elements (similar sorting + selection)

---

**Problem Link:** [LeetCode 1984](https://leetcode.com/problems/minimum-difference-between-highest-and-lowest-of-k-scores/)

**Difficulty:** Easy

**Topics:** Array, Sorting, Sliding Window

---

*Document created: February 18, 2026*
