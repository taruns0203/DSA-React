# 209. Minimum Size Subarray Sum - Complete Explanation

## High-Level Interpretation

Given an array of positive integers `nums` and a positive integer `target`, you need to find the **minimal length** of a contiguous subarray whose sum is greater than or equal to `target`. If no such subarray exists, return 0.

**Why It Matters:**
- Tests your ability to work with **contiguous subarrays**.
- A classic introduction to **Sliding Window** technique.
- Differentiates between brute-force (O(N^2)) and optimal linear (O(N)) solutions.
- The constraints and follow-up (O(N log N)) test knowledge of **Prefix Sums** and **Binary Search**.

**Hidden Traps:**
- **Positive Integers**: The problem guarantees positive numbers. If negatives were allowed, the sliding window approach wouldn't work (monotonicity breaks).
- **Target Not Reached**: It's possible the sum of the entire array is less than `target`. Return 0.
- **Single Element**: A single element might be >= target.

---

## 1. Brute-Force Approach: Try All Subarrays

### Idea

We can iterate through every possible starting position `i` and every possible ending position `j`. 
For each pair `(i, j)`, we calculate the sum. If the sum >= target, we record the length `j - i + 1` and update the minimum length found so far.

### Pseudocode

```
function minSubArrayLen(target, nums):
    n = nums.length
    minLen = infinity
    
    for i from 0 to n-1:
        currentSum = 0
        for j from i to n-1:
            currentSum += nums[j]
            if currentSum >= target:
                minLen = min(minLen, j - i + 1)
                break // Optimization: no need to expand further from i
                
    return (minLen == infinity) ? 0 : minLen
```

### Complexity

- **Time**: O(N^2). We have nested loops. In the worst case (sum < target), we check almost all pairs.
- **Space**: O(1). Only a few variables are used.

### Dry Run

`target = 7`, `nums = [2, 3, 1, 2, 4, 3]`

- `i=0` (val 2):
  - `j=0` sum=2
  - `j=1` sum=5
  - `j=2` sum=6
  - `j=3` sum=8 (>=7). Length=4. `minLen=4`. Break.
- `i=1` (val 3):
  - `j=1` sum=3
  - `j=2` sum=4
  - `j=3` sum=6
  - `j=4` sum=10 (>=7). Length=4. `minLen=4`. Break.
...
- `i=4` (val 4):
  - `j=4` sum=4
  - `j=5` sum=7 (>=7). Length=2. `minLen=2`. Break.

Result: 2.

### Why Fails/Slow?
Constraints say `nums.length` up to 10^5. O(N^2) is 10^10 operations, which will Time Limit Exceed (TLE). We need something faster.

---

## 2. Improved Approach: Prefix Sum + Binary Search (O(N log N))

### Idea

The follow-up asks for O(N log N).
We can precompute **Prefix Sums** where `sums[i]` is the sum of `nums[0...i-1]`.
Then the sum of any subarray from `i` to `j` is `sums[j+1] - sums[i]`.
We want `sums[j+1] - sums[i] >= target`, or `sums[j+1] >= target + sums[i]`.

Since `nums` contains only positive integers, `sums` is strictly increasing (sorted!).
For each starting index `i`, we can use **Binary Search** to find the smallest index `end` such that `sums[end] >= target + sums[i]`.

### Pseudocode

```
function minSubArrayLen(target, nums):
    n = nums.length
    sums = new Array(n + 1)
    sums[0] = 0
    for i from 0 to n-1:
        sums[i+1] = sums[i] + nums[i]
        
    minLen = infinity
    
    for i from 0 to n-1:
        required = target + sums[i]
        // Binary Search for smallest index 'end' in sums where sums[end] >= required
        end = lower_bound(sums, required)
        
        if end <= n:
            length = end - i
            minLen = min(minLen, length)
            
    return (minLen == infinity) ? 0 : minLen
```

### JavaScript Implementation

```javascript
/**
 * @param {number} target
 * @param {number[]} nums
 * @return {number}
 */
var minSubArrayLen = function(target, nums) {
    const n = nums.length;
    const sums = new Array(n + 1).fill(0);
    
    // Build prefix sums
    for (let i = 0; i < n; i++) {
        sums[i + 1] = sums[i] + nums[i];
    }
    
    let minLen = Infinity;
    
    for (let i = 0; i < n; i++) {
        const required = target + sums[i];
        
        // Binary Search (Lower Bound)
        let l = i + 1;
        let r = n;
        let foundIdx = -1;
        
        while (l <= r) {
            const mid = Math.floor((l + r) / 2);
            if (sums[mid] >= required) {
                foundIdx = mid;
                r = mid - 1; // Try smaller length
            } else {
                l = mid + 1;
            }
        }
        
        if (foundIdx !== -1) {
            minLen = Math.min(minLen, foundIdx - i);
        }
    }
    
    return minLen === Infinity ? 0 : minLen;
};
```

### Complexity

- **Time**: O(N log N). building sums is O(N), loop runs N times, binary search is O(log N).
- **Space**: O(N) for `sums` array.

---

## 3. Optimal Approach: Sliding Window (Two Pointers)

### Intuition

We can improve to O(N) using two pointers (`left`, `right`) to represent a window.
1. Expand the window by moving `right` and adding `nums[right]` to `currentSum`.
2. While `currentSum >= target`:
   - Valid window found! Update `minLen`.
   - Shrink window from the left by subtracting `nums[left]` and moving `left` forward.
   
Since `nums` are positive, shrinking simply reduces the sum, and expanding increases it. This monotonicity allows standard sliding window.

### Pseudocode

```
function minSubArrayLen(target, nums):
    n = nums.length
    left = 0
    right = 0
    sum = 0
    minLen = infinity
    
    while right < n:
        sum += nums[right]
        
        while sum >= target:
            minLen = min(minLen, right - left + 1)
            sum -= nums[left]
            left++
            
        right++
        
    return (minLen == infinity) ? 0 : minLen
```

### JavaScript Implementation

```javascript
/**
 * @param {number} target
 * @param {number[]} nums
 * @return {number}
 */
var minSubArrayLen = function(target, nums) {
    let n = nums.length;
    let minLen = Infinity;
    let left = 0;
    let sum = 0;
    
    for (let right = 0; right < n; right++) {
        sum += nums[right];
        
        while (sum >= target) {
            minLen = Math.min(minLen, right - left + 1);
            sum -= nums[left];
            left++;
        }
    }
    
    return minLen === Infinity ? 0 : minLen;
};
```

### Correctness Proof

- **Invariant**: At any point, `sum` represents the sum of subarray `nums[left...right]`.
- We explore all valid ending positions `right`. For each `right`, we find the smallest valid window by advancing `left` as much as possible while `sum >= target`.
- Since `left` and `right` each visit every element at most once (increment only), it's linear.

### Dry Run

`target = 7`, `nums = [2, 3, 1, 2, 4, 3]`

| Step | Left | Right | Val | Sum | Action | MinLen |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | 0 | 0 | 2 | 2 | sum < 7. Continue. | Inf |
| 2 | 0 | 1 | 3 | 5 | sum < 7. Continue. | Inf |
| 3 | 0 | 2 | 1 | 6 | sum < 7. Continue. | Inf |
| 4 | 0 | 3 | 2 | 8 | sum >= 7. **Shrink**. | 4 |
| 4a | 1 | 3 | - | 6 | (8 - nums[0] = 6). sum < 7. Stop shrink. | 4 |
| 5 | 1 | 4 | 4 | 10 | sum >= 7. **Shrink**. | 4 |
| 5a | 2 | 4 | - | 7 | (10 - nums[1] = 7). **Shrink**. MinLen = min(4, 3) = 3 | 3 |
| 5b | 3 | 4 | - | 6 | (7 - nums[2] = 6). sum < 7. Stop shrink. | 3 |
| 6 | 3 | 5 | 3 | 9 | sum >= 7. **Shrink**. | 3 |
| 6a | 4 | 5 | - | 7 | (9 - nums[3] = 7). **Shrink**. MinLen = min(3, 2) = 2 | 2 |
| 6b | 5 | 5 | - | 3 | (7 - nums[4] = 3). sum < 7. Stop shrink. | 2 |

Loop ends. Return 2.

### Complexity

- **Time**: O(N). Each element is added once (via `right`) and removed at most once (via `left`). Total operations ~2N.
- **Space**: O(1). Only variables `left`, `right`, `sum`, `minLen` used.

### Practical Performance

This O(N) solution is optimal for time and space. It processes large arrays efficiently with a single pass logic.

---

## Interview-Ready Explanation (60-90 seconds)

> "The problem asks for the minimal contiguous subarray length with a sum of at least `target`.
> 
> A brute-force check of all subarrays is O(N^2), which is too slow.
> 
> The optimal approach uses the **Sliding Window** technique, since the numbers are positive (adding extends sum, removing shrinks sum).
> We maintain a window `[left, right]` and a running `sum`.
> 1. We expand `right` to include elements until `sum >= target`.
> 2. Once valid, we try to shrink from `left` to minimize the length while producing a valid sum. We update our result `minLen` during this shrinking phase.
> 
> This runs in **O(N)** time because consecutive `left` and `right` increments visit each element at most twice.
> Space complexity is **O(1)**.
> 
> (If needed: The O(N log N) approach uses Prefix Sums + Binary Search for each starting index, which is useful if numbers could be negative but prefix sums were monotonic, or for different constraints, but O(N) is best here.)"

---

## Visual Diagram (Sliding Window)

`target = 7`, `nums = [2, 3, 1, 2, 4, 3]`

```
[2, 3, 1, 2] 4, 3   -> Sum 8 (>=7). Len 4. Shrink left (remove 2).
 ^        ^
 L        R

 2 [3, 1, 2, 4] 3   -> Sum 10 (>=7). Shrink left (remove 3).
    ^        ^
    L        R

 2, 3 [1, 2, 4] 3   -> Sum 7 (>=7). Len 3. Shrink left (remove 1).
       ^     ^
       L     R

 2, 3, 1 [2, 4, 3]  -> Sum 9 (>=7). Shrink left (remove 2).
          ^     ^
          L     R

 2, 3, 1, 2 [4, 3]  -> Sum 7 (>=7). Len 2. Shrink left (remove 4).
             ^  ^
             L  R
```
