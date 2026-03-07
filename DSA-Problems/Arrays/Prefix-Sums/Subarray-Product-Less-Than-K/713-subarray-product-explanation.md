# 713. Subarray Product Less Than K — Complete Explanation

---

## High-Level Interpretation

You are given an array of **positive** integers `nums` and an integer `k`. You must count how many contiguous subarrays have a **product strictly less than `k`**. For example, `[5, 2, 6]` has product 60, which is < 100, so it counts.

**Hidden traps:**
- All elements are **≥ 1**, so products never decrease as the window expands — this is what makes sliding window work.
- When `k ≤ 1`, no subarray can have product < k (since all products are ≥ 1). Return 0 immediately.
- The problem says "strictly less than", not "less than or equal to" — watch the comparison operator.
- Products can be large (up to 1000³⁰⁰⁰⁰), but with sliding window we divide as we shrink, so overflow isn't an issue in JavaScript (numbers are 64-bit floats, and we keep products reasonable).

---

## 1. Brute-Force Approach: Check Every Subarray — O(N²)

### Idea

Try every possible subarray `(i, j)`. Maintain a running product and check if it's strictly less than `k`.

### Pseudocode

```
function numSubarrayProductLessThanK(nums, k):
    if k <= 1: return 0
    n = nums.length
    count = 0
    for i = 0 to n-1:
        product = 1
        for j = i to n-1:
            product *= nums[j]
            if product < k:
                count++
            else:
                break      // product only grows, so stop early
    return count
```

> The `break` is an optimization: since all `nums[i] ≥ 1`, once the product reaches `≥ k`, it can never drop below `k` again by extending `j`.

### JavaScript Implementation

```javascript
var numSubarrayProductLessThanK = function(nums, k) {
    if (k <= 1) return 0;
    const n = nums.length;
    let count = 0;
    for (let i = 0; i < n; i++) {
        let product = 1;
        for (let j = i; j < n; j++) {
            product *= nums[j];
            if (product < k) {
                count++;
            } else {
                break;
            }
        }
    }
    return count;
};
```

### Complexity

| | Value | Reasoning |
|---|---|---|
| **Time** | O(N²) | Two nested loops; early break helps average case but worst case is still quadratic (e.g. all 1s with large k) |
| **Space** | O(1) | Only a running product variable |

### Dry Run — `nums = [10, 5, 2, 6], k = 100`

| i | j | product | < 100? | count | Notes |
|---|---|---------|--------|-------|-------|
| 0 | 0 | 10      | ✅     | 1     | [10] |
| 0 | 1 | 50      | ✅     | 2     | [10,5] |
| 0 | 2 | 100     | ❌     | 2     | break — 100 is NOT < 100 |
| 1 | 1 | 5       | ✅     | 3     | [5] |
| 1 | 2 | 10      | ✅     | 4     | [5,2] |
| 1 | 3 | 60      | ✅     | 5     | [5,2,6] |
| 2 | 2 | 2       | ✅     | 6     | [2] |
| 2 | 3 | 12      | ✅     | 7     | [2,6] |
| 3 | 3 | 6       | ✅     | 8     | [6] |

**Result: 8** ✅

### Why It Can Be Slow

With `n = 3×10⁴` and small elements (like all 1s) with large `k`, every subarray is valid → O(N²) ≈ 9×10⁸ operations — too slow.

---

## 2. Improved Approach: Logarithms + Prefix Sums + Binary Search — O(N log N)

### Key Insight

Take the **logarithm** of both sides:
```
nums[i] × nums[i+1] × … × nums[j] < k
⟺  log(nums[i]) + log(nums[i+1]) + … + log(nums[j]) < log(k)
```

This transforms a product problem into a **sum problem**. Build a prefix sum of logs, then for each starting index `i`, binary search for the farthest `j` where the sum is still `< log(k)`.

### Pseudocode

```
function numSubarrayProductLessThanK(nums, k):
    if k <= 1: return 0
    n = nums.length
    logK = log(k)
    logPrefix = array of size n+1, logPrefix[0] = 0
    for i = 0 to n-1:
        logPrefix[i+1] = logPrefix[i] + log(nums[i])

    count = 0
    for i = 0 to n-1:
        // Binary search for largest j where logPrefix[j+1] - logPrefix[i] < logK
        lo = i, hi = n
        while lo <= hi:
            mid = (lo + hi) / 2
            if logPrefix[mid+1] - logPrefix[i] < logK - 1e-9:
                lo = mid + 1
            else:
                hi = mid - 1
        // hi is the farthest valid j
        count += hi - i + 1
    return count
```

### JavaScript Implementation

```javascript
var numSubarrayProductLessThanK = function(nums, k) {
    if (k <= 1) return 0;
    const n = nums.length;
    const logK = Math.log(k);
    const logPrefix = new Array(n + 1);
    logPrefix[0] = 0;
    for (let i = 0; i < n; i++) {
        logPrefix[i + 1] = logPrefix[i] + Math.log(nums[i]);
    }

    let count = 0;
    for (let i = 0; i < n; i++) {
        let lo = i + 1, hi = n + 1;
        while (lo < hi) {
            const mid = (lo + hi) >> 1;
            if (logPrefix[mid] - logPrefix[i] < logK - 1e-9) {
                lo = mid + 1;
            } else {
                hi = mid;
            }
        }
        count += lo - 1 - i;
    }
    return count;
};
```

### Complexity

| | Value | Reasoning |
|---|---|---|
| **Time** | O(N log N) | One pass to build prefix (O(N)), then for each of N elements, a binary search (O(log N)) |
| **Space** | O(N) | The log-prefix array |

### Dry Run — `nums = [10, 5, 2, 6], k = 100`

**logK = log(100) ≈ 4.605**

| Index | nums[i] | log(nums[i]) | logPrefix |
|-------|---------|-------------|-----------|
| 0     | -       | -           | 0.000     |
| 1     | 10      | 2.303       | 2.303     |
| 2     | 5       | 1.609       | 3.912     |
| 3     | 2       | 0.693       | 4.605     |
| 4     | 6       | 1.792       | 6.397     |

| i | Binary search for largest j | logPrefix[j+1]−logPrefix[i] < 4.605? | Valid subarrays | count added |
|---|---|---|---|---|
| 0 | j=1 valid (3.912<4.605), j=2 not (4.605≮4.605) | farthest j=1 | [10],[10,5] | 2 |
| 1 | j=3 valid (6.397−2.303=4.094<4.605), all 3 valid | farthest j=3 | [5],[5,2],[5,2,6] | 3 |
| 2 | j=3 valid (6.397−3.912=2.485<4.605), both valid | farthest j=3 | [2],[2,6] | 2 |
| 3 | j=3 valid (6.397−4.605=1.792<4.605) | farthest j=3 | [6] | 1 |

**Total: 2 + 3 + 2 + 1 = 8** ✅

### Trade-Offs
- ⚠️ **Floating-point precision**: log comparison can have rounding issues — we use a small epsilon (1e-9) to handle edge cases.
- Better than brute force but sliding window (below) avoids floating point entirely.

---

## 3. Optimal Approach: Sliding Window — O(N)

### Intuition

Since all `nums[i] ≥ 1`, the product of a window **only grows** when we expand right and **only shrinks** when we shrink from the left. This monotonic behavior is perfect for a **two-pointer / sliding window**.

Maintain a window `[left, right]` with running product:
- **Expand** right pointer → multiply `product` by `nums[right]`.
- If `product ≥ k`, **shrink** from left → divide `product` by `nums[left]`, advance `left`.
- After adjusting, every subarray ending at `right` and starting at any index from `left` to `right` is valid. That's **`right − left + 1`** new subarrays.

### Why `right − left + 1`?

When the window is `[left, right]`, the valid subarrays ending at `right` are:
```
[right, right], [right-1, right], [right-2, right], ..., [left, right]
```
That's `right − left + 1` subarrays. Since we process each `right` exactly once, we count every valid subarray exactly once.

### Pseudocode

```
function numSubarrayProductLessThanK(nums, k):
    if k <= 1: return 0
    n = nums.length
    product = 1
    left = 0
    count = 0

    for right = 0 to n-1:
        product *= nums[right]
        while product >= k:
            product /= nums[left]
            left++
        count += right - left + 1

    return count
```

### JavaScript Implementation

```javascript
var numSubarrayProductLessThanK = function(nums, k) {
    if (k <= 1) return 0;
    const n = nums.length;
    let product = 1;
    let left = 0;
    let count = 0;

    for (let right = 0; right < n; right++) {
        product *= nums[right];
        while (product >= k) {
            product /= nums[left];
            left++;
        }
        count += right - left + 1;
    }
    return count;
};
```

### Correctness Proof

**Invariant:** At the end of each iteration for `right`, `product` equals the product of `nums[left..right]`, and `product < k`.

1. **After expanding right:** `product *= nums[right]` — may cause `product ≥ k`.
2. **While loop shrinks:** divides out `nums[left]` and advances `left` until `product < k` (or `left > right`, making `product = 1`).
3. **Every subarray ending at `right`** from `left` to `right` has product < k — because removing elements from the left only makes the product smaller (all elements ≥ 1), so if `[left, right]` is valid, so is `[left+1, right]`, etc.
4. **No double-counting:** each `right` contributes exactly once, and we count subarrays ending at `right` that we haven't counted before.

### Dry Run — `nums = [10, 5, 2, 6], k = 100`

| right | nums[right] | product (after ×) | Shrink? | left (after) | product (after shrink) | right−left+1 | count |
|-------|-------------|-------------------|---------|-------------|----------------------|-------------|-------|
| 0     | 10          | 1×10 = 10         | No      | 0           | 10                   | 0−0+1 = 1   | 1     |
| 1     | 5           | 10×5 = 50         | No      | 0           | 50                   | 1−0+1 = 2   | 3     |
| 2     | 2           | 50×2 = 100        | Yes! ≥100 | 0→1       | 100/10 = 10          | 2−1+1 = 2   | 5     |
| 3     | 6           | 10×6 = 60         | No      | 1           | 60                   | 3−1+1 = 3   | 8     |

**Step-by-step detail:**

1. **right=0:** product=10 < 100. Window=[10]. New subarrays: [10]. count=1.
2. **right=1:** product=50 < 100. Window=[10,5]. New subarrays: [5], [10,5]. count=3.
3. **right=2:** product=100 ≥ 100! Shrink: divide by nums[0]=10 → product=10, left=1. Now product=10 < 100. Window=[5,2]. New subarrays: [2], [5,2]. count=5.
4. **right=3:** product=60 < 100. Window=[5,2,6]. New subarrays: [6], [2,6], [5,2,6]. count=8.

**Result: 8** ✅

### Complexity

| | Value | Reasoning |
|---|---|---|
| **Time** | O(N) | Both `left` and `right` advance at most N times total — amortized O(1) per step |
| **Space** | O(1) | Only `product`, `left`, `count` variables |

### Practical Performance

- Extremely fast — single pass, no division issues (all elements are positive integers).
- No extra memory.
- Handles the constraint `n ≤ 3×10⁴` easily.

---

## Interview-Ready Summary (60–90 seconds)

> "Since all elements are positive integers, the product of a window can only grow when we expand and shrink when we contract. I use a **sliding window** with two pointers: I advance `right` one step at a time, multiplying the product by `nums[right]`. If the product reaches `k` or above, I shrink from the left by dividing out `nums[left]`. After adjusting, every subarray ending at `right` — from `[left, right]` down to `[right, right]` — has product less than `k`. That gives `right − left + 1` new valid subarrays at each step. Both pointers only move forward, so total work is O(N) time, O(1) space."

---

## ASCII Diagram — Sliding Window in Action

```
  nums = [10,  5,  2,  6]     k = 100

  Step 1:  [10]                    product=10  < 100  → +1 subarray
            L,R

  Step 2:  [10,  5]                product=50  < 100  → +2 subarrays
            L    R

  Step 3:  [10,  5,  2]           product=100 ≥ 100  → SHRINK!
            L        R
           ──▶
                [5,  2]            product=10  < 100  → +2 subarrays
                L    R

  Step 4:       [5,  2,  6]       product=60  < 100  → +3 subarrays
                L        R

  Total = 1 + 2 + 2 + 3 = 8 ✅

  Key insight: left never moves backward.
  Both pointers traverse the array once → O(N).
```

---

## Summary Table

| Approach | Time | Space | Notes |
|----------|------|-------|-------|
| Brute Force (all pairs) | O(N²) | O(1) | Early break optimization possible |
| Log Prefix + Binary Search | O(N log N) | O(N) | Floating-point precision risk |
| **Sliding Window** | **O(N)** | **O(1)** | **Optimal — monotonic product property** |
