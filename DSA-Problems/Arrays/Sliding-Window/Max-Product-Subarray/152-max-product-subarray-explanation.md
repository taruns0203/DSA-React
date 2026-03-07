# 152. Maximum Product Subarray — Complete Explanation

---

## High-Level Interpretation

You are given an integer array `nums`. You need to find a **contiguous subarray** whose elements, when multiplied together, give the **largest product**. Return that product.

**Why it's tricky (hidden traps):**
- **Negative numbers flip signs**: Two negatives multiply to a positive, so a very negative running product can suddenly become the maximum if it meets another negative.
- **Zeros reset everything**: Any subarray containing 0 has product 0, splitting the array into independent segments.
- **Single element counts**: `[-3]` → answer is `-3`.
- This is NOT the same as Maximum Sum Subarray (Kadane's). You can't just track one running value because of the sign-flip behaviour.

---

## 1. Brute-Force Approach: Try Every Subarray

### Idea

Enumerate every possible contiguous subarray `nums[i..j]`, compute its product, and track the maximum.

### Pseudocode

```
function maxProduct(nums):
    n = nums.length
    maxProd = -Infinity
    
    for i from 0 to n-1:           // start index
        currentProduct = 1
        for j from i to n-1:       // end index
            currentProduct *= nums[j]
            maxProd = max(maxProd, currentProduct)
    
    return maxProd
```

### Complexity

| Metric | Value | Derivation |
|---|---|---|
| **Time** | O(N²) | Two nested loops. For each `i`, we extend `j` from `i` to `n−1`. Total iterations = N + (N−1) + … + 1 = N(N+1)/2. |
| **Space** | O(1) | Only a few integer variables. |

### Dry Run

`nums = [2, 3, -2, 4]`

| i | j | nums[j] | currentProduct | maxProd |
|---|---|---|---|---|
| 0 | 0 | 2 | 2 | 2 |
| 0 | 1 | 3 | 6 | 6 |
| 0 | 2 | -2 | -12 | 6 |
| 0 | 3 | 4 | -48 | 6 |
| 1 | 1 | 3 | 3 | 6 |
| 1 | 2 | -2 | -6 | 6 |
| 1 | 3 | 4 | -24 | 6 |
| 2 | 2 | -2 | -2 | 6 |
| 2 | 3 | 4 | -8 | 6 |
| 3 | 3 | 4 | 4 | 6 |

Result: **6** ✅ ← from subarray `[2, 3]`.

### Why It's Slow
O(N²) with N up to 2×10⁴ gives ~200 million operations. It passes but barely. We can do much better.

---

## 2. Improved Approach: Prefix & Suffix Products

### What Changed

**Key insight**: The maximum product subarray is either a prefix-product or a suffix-product (or both), unless a zero splits the array. Here's why:

- If the subarray has an **even number of negatives**, the product is positive and including more elements makes it bigger → it extends to an edge.
- If **odd negatives**, the best subarray is either everything to the left of the last negative or everything to the right of the first negative → one end touches an array boundary.
- **Zeros** reset the running product to 0, but we restart from 1 right after.

So we sweep left-to-right tracking a prefix product and right-to-left tracking a suffix product, resetting to 1 after zeros.

### Pseudocode

```
function maxProduct(nums):
    n = nums.length
    maxProd = -Infinity
    prefix = 1
    suffix = 1
    
    for i from 0 to n-1:
        prefix *= nums[i]
        suffix *= nums[n - 1 - i]
        maxProd = max(maxProd, prefix, suffix)
        if prefix == 0: prefix = 1    // reset after zero
        if suffix == 0: suffix = 1
    
    return maxProd
```

### JavaScript

```javascript
var maxProduct = function(nums) {
    const n = nums.length;
    let maxProd = -Infinity;
    let prefix = 1;
    let suffix = 1;
    
    for (let i = 0; i < n; i++) {
        prefix *= nums[i];
        suffix *= nums[n - 1 - i];
        maxProd = Math.max(maxProd, prefix, suffix);
        if (prefix === 0) prefix = 1;
        if (suffix === 0) suffix = 1;
    }
    
    return maxProd;
};
```

### Complexity

| Metric | Value |
|---|---|
| **Time** | O(N) — single pass. |
| **Space** | O(1) — two running products. |

### Dry Run

`nums = [2, 3, -2, 4]`

| i | n-1-i | prefix prod | suffix prod | maxProd |
|---|---|---|---|---|
| 0 | 3 | `1*2=2` | `1*4=4` | 4 |
| 1 | 2 | `2*3=6` | `4*(-2)=-8` | 6 |
| 2 | 1 | `6*(-2)=-12` | `-8*3=-24` | 6 |
| 3 | 0 | `-12*4=-48` | `-24*2=-48` | 6 |

Result: **6** ✅

`nums = [-2, 0, -1]`

| i | n-1-i | prefix | suffix | maxProd |
|---|---|---|---|---|
| 0 | 2 | `-2` | `-1` | -1 |
| 1 | 1 | `0` → reset to 1 | `0` → reset to 1 | **0** |
| 2 | 0 | `1*(-1)=-1` | `1*(-2)=-2` | 0 |

Result: **0** ✅

### Trade-offs
Very elegant and O(N)/O(1), but the correctness reasoning is subtle. Let's also look at the classic DP approach which is more intuitive.

---

## 3. Optimal Approach: DP — Track Min and Max Products

### Intuition

At each position `i`, we want to know the **maximum product** of any subarray ending at `i`. The challenge is that multiplying by a negative number flips the sign — a minimum suddenly becomes a maximum.

**Solution**: Track **both** the running `maxProduct` and `minProduct` ending at each index.

At each step, `nums[i]` can:
1. **Start a new subarray**: just `nums[i]` itself.
2. **Extend the best (maxProduct) subarray**: `maxProduct * nums[i]`.
3. **Extend the worst (minProduct) subarray**: `minProduct * nums[i]` — this becomes the new max if `nums[i]` is negative!

```
newMax = max(nums[i],  prevMax * nums[i],  prevMin * nums[i])
newMin = min(nums[i],  prevMax * nums[i],  prevMin * nums[i])
```

### Pseudocode

```
function maxProduct(nums):
    maxProd = nums[0]
    curMax = nums[0]
    curMin = nums[0]
    
    for i from 1 to nums.length - 1:
        candidates = [nums[i], curMax * nums[i], curMin * nums[i]]
        curMax = max(candidates)
        curMin = min(candidates)
        maxProd = max(maxProd, curMax)
    
    return maxProd
```

### JavaScript

```javascript
/**
 * @param {number[]} nums
 * @return {number}
 */
var maxProduct = function(nums) {
    let maxProd = nums[0];
    let curMax = nums[0];
    let curMin = nums[0];
    
    for (let i = 1; i < nums.length; i++) {
        const a = nums[i];
        const b = curMax * nums[i];
        const c = curMin * nums[i];
        
        curMax = Math.max(a, b, c);
        curMin = Math.min(a, b, c);
        
        maxProd = Math.max(maxProd, curMax);
    }
    
    return maxProd;
};
```

### Correctness Proof

**Invariant**: After processing index `i`:
- `curMax` = maximum product of any subarray ending exactly at `i`.
- `curMin` = minimum product of any subarray ending exactly at `i`.

**Induction**:
- **Base** (`i = 0`): The only subarray ending at index 0 is `[nums[0]]`. So `curMax = curMin = nums[0]`. ✓
- **Step**: For index `i`, any subarray ending at `i` is either:
  - Just `[nums[i]]` alone, OR
  - Some subarray ending at `i−1` extended by `nums[i]`.
  - The best extension is `curMax(i−1) × nums[i]` or `curMin(i−1) × nums[i]` (because negative × negative = positive).
  - So `curMax(i) = max(nums[i], curMax(i−1)×nums[i], curMin(i−1)×nums[i])`. ✓

Since we update `maxProd` at every step, it contains the global maximum. ∎

### Dry Run

`nums = [2, 3, -2, 4]`

| i | nums[i] | candidates (a, b, c) | curMax | curMin | maxProd |
|---|---|---|---|---|---|
| 0 | 2 | init | 2 | 2 | 2 |
| 1 | 3 | `3, 2×3=6, 2×3=6` | **6** | 3 | **6** |
| 2 | -2 | `-2, 6×(-2)=-12, 3×(-2)=-6` | **-2** | **-12** | 6 |
| 3 | 4 | `4, (-2)×4=-8, (-12)×4=-48` | **4** | **-48** | 6 |

Result: **6** ✅

`nums = [-2, 0, -1]`

| i | nums[i] | candidates (a, b, c) | curMax | curMin | maxProd |
|---|---|---|---|---|---|
| 0 | -2 | init | -2 | -2 | -2 |
| 1 | 0 | `0, (-2)×0=0, (-2)×0=0` | **0** | **0** | **0** |
| 2 | -1 | `-1, 0×(-1)=0, 0×(-1)=0` | **0** | **-1** | 0 |

Result: **0** ✅

### Complexity

| Metric | Value | Comment |
|---|---|---|
| **Time** | O(N) | Single pass through the array. |
| **Space** | O(1) | Three integer variables. |

### Practical Performance
Extremely fast. Constant extra memory, single-pass, cache-friendly. Handles all edge cases: zeros, all negatives, single element.

---

## Interview-Ready Explanation (60–90 seconds)

> "The tricky part of Maximum Product Subarray is that negative numbers can flip signs — a very negative product becomes very positive after hitting another negative.
> 
> My approach is a modified Kadane's algorithm. Instead of tracking just a running maximum, I track **both the maximum and minimum** products of subarrays ending at the current index.
> 
> At each element, the new maximum is the largest of three choices: the element alone, the previous max times the element, or the previous min times the element (catches the double-negative flip). Similarly for the new minimum.
> 
> I update my global answer at every step.
> 
> This runs in **O(N) time** and **O(1) space** — just a single pass with three variables."

---

## Visual Diagram

```
nums:   [ 2,    3,   -2,    4 ]

curMax:   2  →  6  → -2  →  4
curMin:   2  →  3  → -12 → -48
maxProd:  2  →  6  →  6  →  6    ← answer = 6

How negatives flip:
  At index 2 (value = -2):
    prevMax = 6,  prevMin = 3
    6 × (-2) = -12  ← old max becomes very negative
    3 × (-2) = -6
    The element alone (-2) is the BEST option → curMax = -2
    The 6 × (-2) = -12 is the WORST        → curMin = -12

  At index 3 (value = 4):
    curMin = -12 is "saved" in case another negative comes,
    but 4 alone beats -2 × 4 = -8   → curMax = 4
    -12 × 4 = -48                   → curMin = -48 (disaster, but kept)
```
