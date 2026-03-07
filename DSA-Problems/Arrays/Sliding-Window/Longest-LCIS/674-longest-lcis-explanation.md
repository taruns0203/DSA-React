# 674. Longest Continuous Increasing Subsequence - Complete Explanation

## High-Level Interpretation

You are given an unsorted array of integers `nums`. You need to find the length of the **longest contiguous subarray** where the elements are strictly increasing. 
Basically, you want to find the longest "uphill" run in the data.

**Why It Matters:**
- Tests basic array iteration and state tracking.
- Fundamental building block for more complex problems (like Longest Increasing Subsequence non-contiguous, or mountain arrays).
- Emphasizes the difference between "Subarray" (contiguous) and "Subsequence" (non-contiguous). Here we need contiguous.

**Hidden Traps:**
- **Strictly Increasing**: `[2, 2]` is length 1, not 2.
- **Single Element**: An array of length 1 has answer 1.
- **Empty Array**: Length 0.

---

## 1. Brute-Force Approach: Try Every Start

### Idea

We can check every possible subarray `nums[i...j]` to see if it's strictly increasing.
Actually, we can optimize slightly: for every starting position `i`, we try to extend `j` as far right as possible until the increasing condition breaks.
We record the length `j - i + 1` and update our maximum.

### Pseudocode

```
function findLengthOfLCIS(nums):
    n = nums.length
    if n == 0 return 0
    maxLen = 0
    
    // Try every start position i
    for i from 0 to n-1:
        currentLen = 1
        // Try to extend to the right
        for j from i+1 to n-1:
            if nums[j] > nums[j-1]:
                currentLen++
            else:
                break // Sequence broke
        
        maxLen = max(maxLen, currentLen)
        
    return maxLen
```

### Complexity

- **Time**: O(N^2). In the worst case (e.g., `[1, 2, 3, 4, 5]`), for `i=0` we scan N steps, for `i=1` we scan N-1 steps... Sum is N*(N+1)/2.
- **Space**: O(1).

### Dry Run

`nums = [1, 3, 5, 4, 7]`

| i | Start Val | Scan | Length Found | MaxLen |
|---|---|---|---|---|
| 0 | 1 | `1 < 3` (ok), `3 < 5` (ok), `5 > 4` (break) | 3 ([1,3,5]) | 3 |
| 1 | 3 | `3 < 5` (ok), `5 > 4` (break) | 2 ([3,5]) | 3 |
| 2 | 5 | `5 > 4` (break immediately) | 1 ([5]) | 3 |
| 3 | 4 | `4 < 7` (ok) | 2 ([4,7]) | 3 |
| 4 | 7 | End of array | 1 ([7]) | 3 |

Result: 3.

### Why Fails/Slow?
It repeats work. When we found `[1, 3, 5]` is increasing, and then `[3, 5]` is part of it, we re-scanned `3, 5` when starting from index 1. We don't need to re-scan parts of a known increasing sequence if we just want the *longest* one.

---

## 2. Optimal Approach: Sliding Window / Greedy

### Intuition

We can iterate through the array once. We keep track of the current increasing sequence's length (`currentLen`) or its start index (`anchor`).
- If `nums[i] > nums[i-1]`, the sequence continues. Increment length.
- If `nums[i] <= nums[i-1]`, the sequence breaks. The new sequence must start at `i`. Reset length to 1.

This is a **Greedy** approach because we always extend the current sequence as much as possible. Since we only care about the *longest* one, we never need to look back after a break.

### Pseudocode

```
function findLengthOfLCIS(nums):
    if nums.length == 0 return 0
    
    maxLen = 1
    currentLen = 1
    
    for i from 1 to nums.length - 1:
        if nums[i] > nums[i-1]:
            currentLen++
        else:
            // Sequence broke, reset
            currentLen = 1
            
        maxLen = max(maxLen, currentLen)
        
    return maxLen
```

### JavaScript Implementation

```javascript
/**
 * @param {number[]} nums
 * @return {number}
 */
var findLengthOfLCIS = function(nums) {
    if (nums.length === 0) return 0;
    
    let maxLen = 1;
    let currentLen = 1;
    
    for (let i = 1; i < nums.length; i++) {
        if (nums[i] > nums[i-1]) {
            currentLen++;
        } else {
            currentLen = 1;
        }
        maxLen = Math.max(maxLen, currentLen);
    }
    
    return maxLen;
};
```

### Correctness Logic
- **Invariant**: At index `i`, `currentLen` correctly stores the length of the continuous increasing subsequence ending at `i`.
- **Induction**:
  - Base case: `i=0`, length is 1.
  - Step: If `nums[i] > nums[i-1]`, the sequence ending at `i` is just the one ending at `i-1` plus `nums[i]`. So `len(i) = len(i-1) + 1`.
  - If `nums[i] <= nums[i-1]`, no sequence ending at `i-1` can be extended. The longest sequence ending at `i` is just `[nums[i]]` itself. `len(i) = 1`.
- Since we track `maxMean`, we eventually find the global maximum.

### Dry Run

`nums = [1, 3, 5, 4, 7]`

| i | Val | Prev | Condition | currentLen | maxLen |
|---|---|---|---|---|---|
| - | - | - | Init | 1 | 1 |
| 1 | 3 | 1 | `3 > 1` (True) | 2 | 2 |
| 2 | 5 | 3 | `5 > 3` (True) | 3 | 3 |
| 3 | 4 | 5 | `4 > 5` (False) | 1 | 3 |
| 4 | 7 | 4 | `7 > 4` (True) | 2 | 3 |

Result: 3.

### Complexity

- **Time**: O(N). We pass through the array exactly once.
- **Space**: O(1). Only two integer variables used.

### Practical Performance
Extremely fast. No memory allocation, linear scan, highly cache-friendly.

---

## Interview-Ready Explanation (60 second summary)

> "The problem asks for the longest contiguous strictly increasing subarray.
> 
> A brute-force approach checks every start index and extends as far as possible, taking O(N^2) time.
> 
> The optimal approach uses a single pass (greedy/sliding window). We maintain a `currentLength` counter.
> - As we iterate, if `nums[i] > nums[i-1]`, we extend the current sequence (`currentLength++`).
> - If `nums[i] <= nums[i-1]`, the sequence breaks, so we reset `currentLength` to 1.
> - We update `maxLength` at every step.
> 
> This runs in **O(N)** time with **O(1)** space and handles all edge cases like single elements or duplicates correctly."
