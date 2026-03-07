# 628. Maximum Product of Three Numbers

## High-Level Interpretation

**What the problem asks:** Given an array of integers, find any three numbers from the array such that their product (multiplication) is the maximum possible, and return that maximum product.

**Why it matters:** This problem tests your understanding of how negative numbers interact with multiplication and your ability to optimize from brute-force to linear time. It appears in interviews to assess whether candidates consider edge cases (negatives, zeros) rather than jumping to naive solutions.

**Hidden Traps:**
1. **Negative numbers are the key trap!** Two negative numbers multiplied together produce a positive number. So `(-100) × (-99) × 5 = 49,500` is much larger than `3 × 4 × 5 = 60`.
2. **You cannot simply take the three largest numbers.** This only works if all numbers are positive.
3. **Zeros can neutralize large products** — be aware of arrays with zeros.
4. **Duplicates are allowed** — no special handling needed, but don't assume uniqueness.

---

## 1. Brute-Force Approach

### 1.1 Plain-English Description

The most straightforward approach: **check every possible combination of three numbers** in the array. For each triplet, compute their product and keep track of the maximum product seen so far.

This is exhaustive — we leave no stone unturned — but extremely slow for large inputs.

### 1.2 Pseudocode

```
function maxProductBruteForce(nums):
    n = length of nums
    maxProduct = -INFINITY
    
    for i from 0 to n-3:
        for j from i+1 to n-2:
            for k from j+1 to n-1:
                product = nums[i] * nums[j] * nums[k]
                maxProduct = max(maxProduct, product)
    
    return maxProduct
```

### 1.3 JavaScript Implementation

```javascript
function maximumProductBruteForce(nums) {
    const n = nums.length;
    let maxProduct = -Infinity;
    
    for (let i = 0; i < n - 2; i++) {
        for (let j = i + 1; j < n - 1; j++) {
            for (let k = j + 1; k < n; k++) {
                const product = nums[i] * nums[j] * nums[k];
                maxProduct = Math.max(maxProduct, product);
            }
        }
    }
    
    return maxProduct;
}
```

### 1.4 Time & Space Complexity

| Complexity | Value | Derivation |
|------------|-------|------------|
| **Time** | O(n³) | Three nested loops, each iterating up to n times. Total iterations ≈ n × n × n = n³. More precisely: C(n,3) = n(n-1)(n-2)/6 ≈ n³/6, still O(n³). |
| **Space** | O(1) | Only using a few variables (`maxProduct`, loop indices). No extra data structures. |

### 1.5 Dry Run

**Input:** `nums = [1, 2, 3, 4]`

| Step | i | j | k | nums[i] | nums[j] | nums[k] | Product | maxProduct |
|------|---|---|---|---------|---------|---------|---------|------------|
| 1 | 0 | 1 | 2 | 1 | 2 | 3 | 6 | 6 |
| 2 | 0 | 1 | 3 | 1 | 2 | 4 | 8 | 8 |
| 3 | 0 | 2 | 3 | 1 | 3 | 4 | 12 | 12 |
| 4 | 1 | 2 | 3 | 2 | 3 | 4 | 24 | **24** |

**Result:** `24` ✓

**Another dry run with negatives:** `nums = [-4, -3, 1, 2, 5]`

| Step | Triplet | Product | maxProduct |
|------|---------|---------|------------|
| 1 | (-4, -3, 1) | 12 | 12 |
| 2 | (-4, -3, 2) | 24 | 24 |
| 3 | (-4, -3, 5) | 60 | **60** |
| 4 | (-4, 1, 2) | -8 | 60 |
| 5 | (-4, 1, 5) | -20 | 60 |
| 6 | (-4, 2, 5) | -40 | 60 |
| 7 | (-3, 1, 2) | -6 | 60 |
| 8 | (-3, 1, 5) | -15 | 60 |
| 9 | (-3, 2, 5) | -30 | 60 |
| 10 | (1, 2, 5) | 10 | 60 |

**Result:** `60` — Notice the maximum comes from two negatives × one positive!

### 1.6 Why This Approach Fails at Scale

Given the constraint `3 <= nums.length <= 10⁴`:
- For n = 10,000: iterations ≈ 10,000³ = **10¹² operations**
- At ~10⁸ operations/second, this takes ~10,000 seconds ≈ **2.7 hours**
- **Verdict: TLE (Time Limit Exceeded)** — completely impractical

---

## 2. Improved Approach: Sorting

### 2.1 Key Insight

After **sorting** the array, we have a crucial property:
- The **three largest** numbers are at the end: `nums[n-3], nums[n-2], nums[n-1]`
- The **two smallest** (most negative) numbers are at the start: `nums[0], nums[1]`

**The maximum product must be one of exactly two candidates:**

| Candidate | Description | When it wins |
|-----------|-------------|--------------|
| `nums[n-1] × nums[n-2] × nums[n-3]` | Three largest numbers | All positives, or mixed with fewer/smaller negatives |
| `nums[0] × nums[1] × nums[n-1]` | Two smallest + largest | Two large-magnitude negatives make a big positive |

**Why only these two?** Any other combination will either:
- Include a smaller positive (reducing the product)
- Include only one negative (making it negative or less positive)
- Miss the largest number (definitely suboptimal)

### 2.2 Pseudocode

```
function maxProductSorting(nums):
    sort nums in ascending order
    n = length of nums
    
    // Candidate 1: Three largest
    candidate1 = nums[n-1] * nums[n-2] * nums[n-3]
    
    // Candidate 2: Two smallest (most negative) + largest
    candidate2 = nums[0] * nums[1] * nums[n-1]
    
    return max(candidate1, candidate2)
```

### 2.3 JavaScript Implementation

```javascript
function maximumProductSorting(nums) {
    // Sort in ascending order
    nums.sort((a, b) => a - b);
    
    const n = nums.length;
    
    // Candidate 1: Product of three largest
    const candidate1 = nums[n - 1] * nums[n - 2] * nums[n - 3];
    
    // Candidate 2: Product of two smallest + largest
    const candidate2 = nums[0] * nums[1] * nums[n - 1];
    
    return Math.max(candidate1, candidate2);
}
```

### 2.4 Time & Space Complexity

| Complexity | Value | Derivation |
|------------|-------|------------|
| **Time** | O(n log n) | Dominated by the sorting step. The comparisons afterward are O(1). |
| **Space** | O(1) to O(n) | Depends on sorting algorithm. In-place sorts like heapsort: O(1). JavaScript's `.sort()` typically uses O(log n) to O(n) auxiliary space. |

### 2.5 Dry Run

**Input:** `nums = [-4, -3, 1, 2, 5]`

| Step | Action | Array State | Variables |
|------|--------|-------------|-----------|
| 1 | Initial | `[-4, -3, 1, 2, 5]` | — |
| 2 | Sort (already sorted) | `[-4, -3, 1, 2, 5]` | n = 5 |
| 3 | Compute candidate1 | — | `5 × 2 × 1 = 10` |
| 4 | Compute candidate2 | — | `(-4) × (-3) × 5 = 60` |
| 5 | Return max | — | `max(10, 60) = 60` ✓ |

**Input:** `nums = [1, 2, 3, 4]`

| Step | Action | Array State | Variables |
|------|--------|-------------|-----------|
| 1 | Sort | `[1, 2, 3, 4]` | n = 4 |
| 2 | candidate1 | — | `4 × 3 × 2 = 24` |
| 3 | candidate2 | — | `1 × 2 × 4 = 8` |
| 4 | Return max | — | `max(24, 8) = 24` ✓ |

### 2.6 Trade-offs

| Aspect | Assessment |
|--------|------------|
| **Speed** | O(n log n) — much better than O(n³), handles n=10⁴ easily |
| **Simplicity** | Very clean, easy to understand and implement |
| **Downside** | Modifies input array (can clone first if needed: +O(n) space) |
| **Downside** | Not optimal — we're doing more work than necessary |

---

## 3. Optimal Approach: Single Pass (O(n))

### 3.1 Intuition

We don't need to sort the entire array. We only need **5 specific values**:
1. **max1** — the largest number
2. **max2** — the second largest
3. **max3** — the third largest
4. **min1** — the smallest number (most negative)
5. **min2** — the second smallest

**Why these 5?** The maximum product is guaranteed to be:
```
max(max1 × max2 × max3, min1 × min2 × max1)
```

We can find all 5 values in a **single pass** through the array.

### 3.2 Why This Is Correct (Proof)

**Claim:** The maximum product of three numbers is always `max(top3_product, bottom2_with_top1_product)`.

**Proof by case analysis:**

**Case 1: All numbers are non-negative**
- Maximum product = three largest = `max1 × max2 × max3`
- `min1 × min2 × max1` might be smaller or equal (if min1, min2 ≥ 0)
- Winner: Could be either, `max()` handles it ✓

**Case 2: All numbers are non-positive (≤ 0)**
- To maximize, we want the product closest to zero (least negative)
- Three largest (closest to zero) = `max1 × max2 × max3`
- This is less negative than any other triple
- `min1 × min2 × max1` would involve more negative magnitude
- Winner: `max1 × max2 × max3` ✓

**Case 3: Mix of positive and negative**
- If we use exactly 0 negatives: product = `max1 × max2 × max3`
- If we use exactly 2 negatives: best is `min1 × min2 × max1` (two most negative × largest positive)
- If we use 1 or 3 negatives: product is negative, never maximum when positives exist
- Winner: One of our two candidates ✓

**Invariant:** At the end of iteration i, `max1, max2, max3` hold the three largest among `nums[0..i]`, and `min1, min2` hold the two smallest.

### 3.3 Pseudocode

```
function maxProductOptimal(nums):
    // Initialize with extreme values
    max1 = max2 = max3 = -INFINITY
    min1 = min2 = +INFINITY
    
    for each num in nums:
        // Update maximums (maintain max1 >= max2 >= max3)
        if num >= max1:
            max3 = max2
            max2 = max1
            max1 = num
        else if num >= max2:
            max3 = max2
            max2 = num
        else if num > max3:
            max3 = num
        
        // Update minimums (maintain min1 <= min2)
        if num <= min1:
            min2 = min1
            min1 = num
        else if num < min2:
            min2 = num
    
    return max(max1 * max2 * max3, min1 * min2 * max1)
```

### 3.4 JavaScript Implementation

```javascript
function maximumProduct(nums) {
    // Initialize: 3 largest and 2 smallest
    let max1 = -Infinity, max2 = -Infinity, max3 = -Infinity;
    let min1 = Infinity, min2 = Infinity;
    
    for (const num of nums) {
        // Update the three maximum values
        if (num >= max1) {
            max3 = max2;
            max2 = max1;
            max1 = num;
        } else if (num >= max2) {
            max3 = max2;
            max2 = num;
        } else if (num > max3) {
            max3 = num;
        }
        
        // Update the two minimum values
        if (num <= min1) {
            min2 = min1;
            min1 = num;
        } else if (num < min2) {
            min2 = num;
        }
    }
    
    // Return max of two candidates
    return Math.max(
        max1 * max2 * max3,      // Three largest
        min1 * min2 * max1       // Two smallest × largest
    );
}
```

### 3.5 Time & Space Complexity

| Complexity | Value | Derivation |
|------------|-------|------------|
| **Time** | O(n) | Single pass through the array. Each element: O(1) comparisons and updates. Total: n × O(1) = O(n). |
| **Space** | O(1) | Only 5 variables regardless of input size. No additional data structures. |

**Practical Performance:**
- For n = 10,000: approximately 10,000 operations
- Executes in microseconds
- This is **asymptotically optimal** — we must read every element at least once

### 3.6 Detailed Dry Run

**Input:** `nums = [-4, -3, 1, 2, 5]`

| Step | num | max1 | max2 | max3 | min1 | min2 | Action |
|------|-----|------|------|------|------|------|--------|
| Init | — | -∞ | -∞ | -∞ | +∞ | +∞ | Initialize variables |
| 1 | -4 | **-4** | -∞ | -∞ | **-4** | +∞ | -4 > -∞, becomes max1; -4 < +∞, becomes min1 |
| 2 | -3 | **-3** | -4 | -∞ | -4 | **-3** | -3 > -4, shift and new max1; -3 > -4 but < +∞, becomes min2 |
| 3 | 1 | **1** | -3 | -4 | -4 | -3 | 1 > -3, shift and new max1 |
| 4 | 2 | **2** | 1 | -3 | -4 | -3 | 2 > 1, shift and new max1 |
| 5 | 5 | **5** | 2 | 1 | -4 | -3 | 5 > 2, shift and new max1 |

**Final State:**
```
max1 = 5,  max2 = 2,  max3 = 1
min1 = -4, min2 = -3
```

**Compute Result:**
```
candidate1 = max1 × max2 × max3 = 5 × 2 × 1 = 10
candidate2 = min1 × min2 × max1 = (-4) × (-3) × 5 = 60
result = max(10, 60) = 60 ✓
```

---

**Second Dry Run:** `nums = [1, 2, 3, 4]`

| Step | num | max1 | max2 | max3 | min1 | min2 |
|------|-----|------|------|------|------|------|
| Init | — | -∞ | -∞ | -∞ | +∞ | +∞ |
| 1 | 1 | 1 | -∞ | -∞ | 1 | +∞ |
| 2 | 2 | 2 | 1 | -∞ | 1 | 2 |
| 3 | 3 | 3 | 2 | 1 | 1 | 2 |
| 4 | 4 | 4 | 3 | 2 | 1 | 2 |

**Compute Result:**
```
candidate1 = 4 × 3 × 2 = 24
candidate2 = 1 × 2 × 4 = 8
result = max(24, 8) = 24 ✓
```

---

## 4. Visual Diagram

```
Input Array: [-4, -3, 1, 2, 5]

After single pass, we extract:

        Most Negative          Most Positive
        ←───────────────────────────────────→
        
        min1  min2             max3  max2  max1
        ↓     ↓                ↓     ↓     ↓
       [-4]  [-3]    ...      [1]   [2]   [5]
        └──────┘                     └──────┘
            │                            │
            │                            │
            ▼                            ▼
    Two most negative            Three largest
    
    
    Candidate 1: max1 × max2 × max3 = 5 × 2 × 1 = 10
                 └─────────────────────────────────┘
                        Three largest numbers
    
    Candidate 2: min1 × min2 × max1 = (-4) × (-3) × 5 = 60
                 └─────────┘   └───┘
                 Two negatives  × Largest positive
                 (become positive)
    
    Result: max(10, 60) = 60 ✓
```

---

## 5. Algorithm Comparison Summary

| Approach | Time | Space | Pros | Cons |
|----------|------|-------|------|------|
| Brute Force | O(n³) | O(1) | Simple, obvious | Far too slow |
| Sorting | O(n log n) | O(1)-O(n) | Clean code | Modifies input, not optimal |
| **Single Pass** | **O(n)** | **O(1)** | **Optimal, no mutation** | Slightly more code |

---

## 6. Interview-Ready Verbal Explanation

> **60-90 Second Script:**
>
> "The key insight for this problem is that negative numbers can produce large positive products when multiplied together. So the maximum product isn't necessarily the three largest numbers.
>
> After analyzing the cases, I realized there are only two possible candidates for the maximum product:
> 1. The product of the three largest numbers, or
> 2. The product of the two smallest (most negative) numbers times the largest number.
>
> A naive approach would sort the array in O(n log n), but we can do better. We only need 5 values: the three largest and two smallest numbers.
>
> I can find these in a single pass through the array by maintaining 5 variables and updating them as I encounter each element. This gives us O(n) time and O(1) space.
>
> At the end, I return the maximum of the two candidates. This handles all edge cases: all positive, all negative, or mixed arrays."

---

## 7. Edge Cases to Consider

| Case | Example | Expected | Notes |
|------|---------|----------|-------|
| All positive | `[1, 2, 3]` | 6 | Three largest |
| All negative | `[-1, -2, -3]` | -6 | Three "largest" (closest to 0) |
| Two large negatives | `[-100, -99, 1, 2, 3]` | 29700 | `(-100)×(-99)×3` |
| Contains zero | `[-5, 0, 5]` | 0 | Best we can do |
| Minimum size | `[a, b, c]` | a×b×c | Only one option |
| All same | `[5, 5, 5, 5]` | 125 | Duplicates OK |

---

## 8. Complete Solution Code

```javascript
/**
 * 628. Maximum Product of Three Numbers
 * 
 * @param {number[]} nums - Array of integers (length >= 3)
 * @return {number} - Maximum product of any three numbers
 * 
 * Time: O(n) - Single pass
 * Space: O(1) - Five variables
 */
function maximumProduct(nums) {
    // Track 3 largest and 2 smallest
    let max1 = -Infinity, max2 = -Infinity, max3 = -Infinity;
    let min1 = Infinity, min2 = Infinity;
    
    for (const num of nums) {
        // Update maximums (cascading shift)
        if (num >= max1) {
            [max3, max2, max1] = [max2, max1, num];
        } else if (num >= max2) {
            [max3, max2] = [max2, num];
        } else if (num > max3) {
            max3 = num;
        }
        
        // Update minimums (cascading shift)
        if (num <= min1) {
            [min2, min1] = [min1, num];
        } else if (num < min2) {
            min2 = num;
        }
    }
    
    // Two candidates for maximum product
    return Math.max(
        max1 * max2 * max3,      // Three largest
        min1 * min2 * max1       // Two smallest × largest
    );
}
```

---

## 9. Related Problems

| Problem | Similarity |
|---------|------------|
| [152. Maximum Product Subarray](https://leetcode.com/problems/maximum-product-subarray/) | Negative number handling |
| [414. Third Maximum Number](https://leetcode.com/problems/third-maximum-number/) | Finding k-th largest |
| [747. Largest Number At Least Twice of Others](https://leetcode.com/problems/largest-number-at-least-twice-of-others/) | Tracking maximums |

---

*Last updated: February 2026*