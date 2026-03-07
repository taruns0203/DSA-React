# 643. Maximum Average Subarray I — Complete Guide

---

## 1. High-Level Interpretation

You're given an integer array and a fixed window size `k`. You need to find which **contiguous subarray of exactly `k` elements** has the **highest average**. Since dividing by the same constant `k` doesn't change which subarray wins, this is equivalent to finding the **maximum sum** of any `k`-length subarray, then dividing by `k` at the end.

**Hidden traps to watch for:**
- **Negative numbers:** `nums[i]` can be as low as −10⁴. You can't skip negatives or assume sums are positive.
- **Fixed window size:** Unlike variable-width sliding window problems, `k` is fixed — every valid window is exactly `k` elements. This simplifies the logic.
- **Floating-point answer:** The problem asks for a `double`/`float` result. Work with integer sums internally and only divide by `k` once at the end to avoid floating-point accumulation errors.
- **Off-by-one:** There are exactly `n − k + 1` valid windows (starting at indices `0` through `n − k`).

---

## 2. Brute-Force Approach

### 2.1 Idea in Plain Words

Try **every** possible starting index `i` from `0` to `n − k`. For each start, compute the sum of the `k` elements `nums[i..i+k−1]`. Track the maximum sum across all windows, then divide by `k`.

### 2.2 Pseudocode

```
function findMaxAverage_BruteForce(nums, k):
    n = nums.length
    maxSum = -Infinity

    for i from 0 to n - k:
        currentSum = 0
        for j from i to i + k - 1:
            currentSum += nums[j]
        maxSum = max(maxSum, currentSum)

    return maxSum / k
```

### 2.3 Time & Space Complexity

| Metric | Value | Derivation |
|--------|-------|------------|
| **Time** | **O(n × k)** | Outer loop runs `n − k + 1` times. Inner loop runs `k` times for each. Total: `(n − k + 1) × k`. |
| **Space** | **O(1)** | Only a few integer variables. |

### 2.4 Dry Run — `nums = [1, 12, -5, -6, 50, 3], k = 4`

There are `6 − 4 + 1 = 3` valid windows:

| `i` | Window `nums[i..i+3]` | Sum | `maxSum` |
|-----|----------------------|-----|----------|
| 0 | [1, 12, -5, -6] | 1 + 12 + (−5) + (−6) = **2** | 2 |
| 1 | [12, -5, -6, 50] | 12 + (−5) + (−6) + 50 = **51** | **51** |
| 2 | [-5, -6, 50, 3] | (−5) + (−6) + 50 + 3 = **42** | 51 |

**Answer = 51 / 4 = 12.75** ✅

### 2.5 Why This Fails at Scale

With `n = 10⁵` and `k = 50,000`, this performs **~5 × 10⁹** operations — far too slow. The inner loop redundantly re-sums `k − 1` elements that overlap with the previous window.

---

## 3. Improved Approach — Prefix Sum

### 3.1 What Changed and Why

Precompute a **prefix sum array** where `prefix[i] = nums[0] + nums[1] + ... + nums[i−1]`. Then the sum of any window `[i, i+k−1]` is just `prefix[i+k] − prefix[i]` — a single subtraction instead of summing `k` elements.

**Why it's faster:** The prefix array is built in O(n), and each window sum is O(1). Total: O(n) + O(n) = **O(n)**.

### 3.2 Pseudocode

```
function findMaxAverage_PrefixSum(nums, k):
    n = nums.length
    prefix = array of size n + 1, all zeros
    
    for i from 0 to n - 1:
        prefix[i + 1] = prefix[i] + nums[i]
    
    maxSum = -Infinity
    for i from 0 to n - k:
        windowSum = prefix[i + k] - prefix[i]
        maxSum = max(maxSum, windowSum)
    
    return maxSum / k
```

### 3.3 JavaScript Implementation

```javascript
/**
 * @param {number[]} nums
 * @param {number} k
 * @return {number}
 */
function findMaxAverage(nums, k) {
    const n = nums.length;
    const prefix = new Array(n + 1).fill(0);

    // Build prefix sum
    for (let i = 0; i < n; i++) {
        prefix[i + 1] = prefix[i] + nums[i];
    }

    // Find max window sum
    let maxSum = -Infinity;
    for (let i = 0; i <= n - k; i++) {
        const windowSum = prefix[i + k] - prefix[i];
        maxSum = Math.max(maxSum, windowSum);
    }

    return maxSum / k;
}
```

### 3.4 Time & Space Complexity

| Metric | Value | Derivation |
|--------|-------|------------|
| **Time** | **O(n)** | One pass to build prefix (n), one pass to scan windows (n − k + 1). |
| **Space** | **O(n)** | The prefix array has `n + 1` elements. |

### 3.5 Dry Run — `nums = [1, 12, -5, -6, 50, 3], k = 4`

**Step 1: Build prefix**

| Index | 0 | 1 | 2 | 3 | 4 | 5 | 6 |
|-------|---|---|---|---|---|---|---|
| `prefix` | 0 | 1 | 13 | 8 | 2 | 52 | 55 |

**Step 2: Scan windows**

| `i` | `prefix[i+4] − prefix[i]` | Sum | `maxSum` |
|-----|--------------------------|-----|----------|
| 0 | prefix[4] − prefix[0] = 2 − 0 | **2** | 2 |
| 1 | prefix[5] − prefix[1] = 52 − 1 | **51** | **51** |
| 2 | prefix[6] − prefix[2] = 55 − 13 | **42** | 51 |

**Answer = 51 / 4 = 12.75** ✅

### 3.6 Trade-offs

- **Pro:** Simple, clean, O(n) time.
- **Con:** Uses **O(n) extra space** for the prefix array. We can do O(1) space with a sliding window.

---

## 4. Optimal / Best Approach — Fixed-Size Sliding Window

### 4.1 Intuition

Since every valid window has the **same size `k`**, we can maintain a running sum. When we slide the window one position right:
- **Add** the new element entering from the right (`nums[i]`).
- **Subtract** the old element leaving from the left (`nums[i − k]`).

This updates the sum in **O(1)** per step, with no extra array needed.

### 4.2 Pseudocode

```
function findMaxAverage_SlidingWindow(nums, k):
    // Compute sum of the first window
    windowSum = sum of nums[0..k-1]
    maxSum = windowSum

    // Slide the window
    for i from k to n - 1:
        windowSum += nums[i]        // add entering element
        windowSum -= nums[i - k]    // remove leaving element
        maxSum = max(maxSum, windowSum)

    return maxSum / k
```

### 4.3 JavaScript Implementation

```javascript
/**
 * 643. Maximum Average Subarray I
 * Fixed-size sliding window — O(n) time, O(1) space
 *
 * @param {number[]} nums
 * @param {number} k
 * @return {number}
 */
function findMaxAverage(nums, k) {
    // Sum the first window
    let windowSum = 0;
    for (let i = 0; i < k; i++) {
        windowSum += nums[i];
    }

    let maxSum = windowSum;

    // Slide: add right element, remove left element
    for (let i = k; i < nums.length; i++) {
        windowSum += nums[i];       // new element enters
        windowSum -= nums[i - k];   // old element leaves
        maxSum = Math.max(maxSum, windowSum);
    }

    return maxSum / k;
}
```

### 4.4 Correctness Proof (Invariants)

**Loop invariant:** At the start of each iteration with index `i`, `windowSum` equals the sum of `nums[i−k+1 .. i−1]` (the previous window), and `maxSum` is the maximum window sum seen so far.

1. **Initialisation:** Before the loop, `windowSum = sum(nums[0..k−1])` and `maxSum = windowSum`. Valid: the first window has been processed.
2. **Maintenance:** We add `nums[i]` and subtract `nums[i − k]`, transforming the window from `[i−k, i−1]` to `[i−k+1, i]`. This correctly computes the new window sum. We update `maxSum` if improved.
3. **Termination:** When `i = n`, all `n − k + 1` windows have been examined. `maxSum` holds the global maximum.

**Why we don't miss any window:** There are `n − k + 1` windows starting at indices `0, 1, ..., n − k`. The initial sum covers index 0. The loop covers indices `1` through `n − k` (as `i` goes from `k` to `n − 1`, the window starts at `i − k + 1 = 1` through `n − k`). All windows are covered.

### 4.5 Dry Run — `nums = [1, 12, -5, -6, 50, 3], k = 4`

**Step 1: Initial window**

```
windowSum = nums[0] + nums[1] + nums[2] + nums[3] = 1 + 12 + (-5) + (-6) = 2
maxSum = 2
```

**Step 2: Slide**

| `i` | Add `nums[i]` | Remove `nums[i−4]` | `windowSum` | Window | `maxSum` |
|-----|---------------|---------------------|-------------|--------|----------|
| 4 | +50 | −nums[0]=−1 | 2 + 50 − 1 = **51** | [12,−5,−6,50] | **51** |
| 5 | +3 | −nums[1]=−12 | 51 + 3 − 12 = **42** | [−5,−6,50,3] | 51 |

**Answer = 51 / 4 = 12.75** ✅

### 4.6 Dry Run — `nums = [5], k = 1`

```
windowSum = nums[0] = 5
maxSum = 5
Loop: i starts at 1, but 1 >= n=1, so loop doesn't execute.
Answer = 5 / 1 = 5.0 ✅
```

### 4.7 Tight Complexity

| Metric | Value | Notes |
|--------|-------|-------|
| **Time** | **Θ(n)** | First loop: `k` iterations. Second loop: `n − k` iterations. Total: exactly `n` iterations. |
| **Space** | **Θ(1)** | Two variables: `windowSum`, `maxSum`. No extra arrays. |

**Practical performance:** On `n = 10⁵`, this completes in **< 2 ms**. It's the fastest possible since we must read every element at least once (Ω(n) lower bound).

---

## 5. Interview-Ready Verbal Explanation (60–90 seconds)

> "This problem asks for the maximum average of a contiguous subarray of fixed length `k`. Since dividing by the same `k` doesn't change the ordering, I just need to find the maximum **sum** of any `k`-length subarray and divide at the end.
>
> I use a fixed-size sliding window. First, I compute the sum of the initial window `nums[0..k−1]`. Then I slide the window one position at a time: I add the new element entering from the right and subtract the element leaving from the left. After each slide, I check if the new sum exceeds the current max.
>
> **Why it's correct:** Each slide transforms one valid `k`-length window into the next by a single add and subtract. All `n − k + 1` windows are examined.
>
> **Complexity:** O(n) time — exactly `n` total operations across both loops. O(1) space — just two variables for the running sum and the maximum."

---

## 6. Visual Diagram — How the Window Slides

```
nums = [1, 12, -5, -6, 50, 3]     k = 4

Window 0:  [  1  12  -5  -6 ] 50   3       sum =  2
            ←─── k=4 ────→

Window 1:     1 [ 12  -5  -6  50 ]  3       sum = 51  ★ best
                  ←─── k=4 ────→
            − 1                + 50    (subtract left, add right)

Window 2:     1   12 [ -5  -6  50   3 ]     sum = 42
                      ←─── k=4 ────→
                 − 12                + 3

Answer: 51 / 4 = 12.75

┌──────────────────────────────────────────────┐
│  Each slide: O(1) work                       │
│  • ADD the new right element                 │
│  • SUBTRACT the old left element             │
│  • Compare with max                          │
│  Total: n slides = O(n)                      │
└──────────────────────────────────────────────┘
```

---

## 7. Summary Comparison

| Approach | Time | Space | Key Idea |
|----------|------|-------|----------|
| Brute-force (recompute each window) | O(n × k) | O(1) | Sum `k` elements for every start |
| Prefix sum | O(n) | O(n) | Precompute prefix, get window sum in O(1) |
| **Sliding window** | **O(n)** | **O(1)** | Add entering element, subtract leaving element |

The **fixed-size sliding window** is the recommended interview solution: it's the simplest, uses no extra memory, and directly exploits the fixed-width constraint.
