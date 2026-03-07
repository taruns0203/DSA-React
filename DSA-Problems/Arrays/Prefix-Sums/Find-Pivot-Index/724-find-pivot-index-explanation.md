# 724. Find Pivot Index - Complete Walkthrough

## High-Level Interpretation

**What the problem asks:** Find the leftmost index where the sum of elements to its left equals the sum of elements to its right. Return -1 if no such index exists.

**Why it matters:** This is a classic **prefix sum** problem that demonstrates how pre-computation can reduce time complexity from O(n²) to O(n).

**Hidden traps:**
1. **Edge indices:** Left/right sums are 0 if there are no elements on that side
2. **Leftmost pivot:** Multiple valid pivots may exist; return the first one
3. **Negative numbers:** Array can contain negative integers, affecting sum calculations
4. **Zero pivot index:** Index 0 can be a valid pivot if right sum equals 0 (or total sum is 0)

---

## 1. Brute-Force Approach: Calculate Sums for Each Index

### Idea in Plain Words
For each index i, calculate the sum of all elements to its left (0 to i-1) and all elements to its right (i+1 to n-1). If they're equal, return i. If no index satisfies this, return -1.

### Pseudocode
```
function pivotIndex(nums):
    n = nums.length
    
    for i from 0 to n-1:
        leftSum = 0
        for j from 0 to i-1:
            leftSum += nums[j]
        
        rightSum = 0
        for k from i+1 to n-1:
            rightSum += nums[k]
        
        if leftSum == rightSum:
            return i
    
    return -1
```

### Time & Space Complexity

| Complexity | Value | Derivation |
|------------|-------|------------|
| **Time** | O(n²) | For each of n indices, we sum up to n elements |
| **Space** | O(1) | Only using variables leftSum and rightSum |

### Dry Run: Example 1

```
nums = [1, 7, 3, 6, 5, 6]
```

| i | leftSum Calculation | leftSum | rightSum Calculation | rightSum | Equal? | Action |
|---|---------------------|---------|---------------------|----------|--------|--------|
| 0 | (none) | 0 | 7+3+6+5+6 | 27 | No | Continue |
| 1 | 1 | 1 | 3+6+5+6 | 20 | No | Continue |
| 2 | 1+7 | 8 | 6+5+6 | 17 | No | Continue |
| 3 | 1+7+3 | 11 | 5+6 | 11 | **Yes** | **Return 3** |

**Result:** 3 ✓

### Dry Run: Example 2

```
nums = [1, 2, 3]
```

| i | leftSum | rightSum | Equal? |
|---|---------|----------|--------|
| 0 | 0 | 5 | No |
| 1 | 1 | 3 | No |
| 2 | 3 | 0 | No |

**Result:** -1 ✓

### Why Brute Force Is Slow
- Recalculates sums from scratch for each index
- For n=10,000 (max constraint), performs up to 100 million operations
- Doesn't leverage the relationship between consecutive pivot candidates

---

## 2. Optimal Approach: Single Pass with Running Sums

### Key Insight
Instead of recalculating sums for each index, observe that:
- **Total Sum** = leftSum + nums[i] + rightSum
- **Rearranging:** rightSum = totalSum - leftSum - nums[i]

We can:
1. Calculate total sum once: O(n)
2. Iterate through array maintaining leftSum
3. For each index, compute rightSum using the formula
4. Check if leftSum == rightSum

### Why This Works
- **leftSum** accumulates as we move right
- **rightSum** can be derived without iteration: `rightSum = total - leftSum - nums[i]`
- This eliminates the inner loops entirely

### Pseudocode
```
function pivotIndex(nums):
    totalSum = sum of all elements in nums
    leftSum = 0
    
    for i from 0 to nums.length-1:
        rightSum = totalSum - leftSum - nums[i]
        
        if leftSum == rightSum:
            return i
        
        leftSum += nums[i]
    
    return -1
```

### JavaScript Implementation (Optimal)
```javascript
/**
 * @param {number[]} nums
 * @return {number}
 */
function pivotIndex(nums) {
    // Calculate total sum
    const totalSum = nums.reduce((sum, num) => sum + num, 0);
    
    let leftSum = 0;
    
    for (let i = 0; i < nums.length; i++) {
        // Right sum = total - left - current
        const rightSum = totalSum - leftSum - nums[i];
        
        // Check if pivot
        if (leftSum === rightSum) {
            return i;
        }
        
        // Update left sum for next iteration
        leftSum += nums[i];
    }
    
    return -1;
}
```

### Alternative Clean Implementation
```javascript
function pivotIndex(nums) {
    const total = nums.reduce((a, b) => a + b, 0);
    let left = 0;
    
    for (let i = 0; i < nums.length; i++) {
        if (left === total - left - nums[i]) return i;
        left += nums[i];
    }
    
    return -1;
}
```

### Proof of Correctness

**Claim:** This algorithm finds the leftmost pivot index or correctly returns -1.

**Proof:**
1. **Invariant:** At iteration i, `leftSum` = sum of nums[0..i-1], `totalSum` = sum of all elements

2. **Correctness of rightSum formula:**
   - Total = Left + Current + Right
   - Right = Total - Left - Current ✓

3. **Leftmost guarantee:** We iterate left-to-right, returning immediately on first match

4. **Completeness:** If no pivot exists, we check all indices and return -1 ✓

### Detailed Dry Run: Example 1

```
nums = [1, 7, 3, 6, 5, 6]
totalSum = 1 + 7 + 3 + 6 + 5 + 6 = 28
```

| i | nums[i] | leftSum (before) | rightSum = 28 - leftSum - nums[i] | Equal? | leftSum (after) | Action |
|---|---------|------------------|-----------------------------------|--------|-----------------|--------|
| 0 | 1 | 0 | 28 - 0 - 1 = 27 | No | 1 | Continue |
| 1 | 7 | 1 | 28 - 1 - 7 = 20 | No | 8 | Continue |
| 2 | 3 | 8 | 28 - 8 - 3 = 17 | No | 11 | Continue |
| 3 | 6 | 11 | 28 - 11 - 6 = 11 | **Yes** | - | **Return 3** |

**Result:** 3 ✓

### Detailed Dry Run: Example 2

```
nums = [1, 2, 3]
totalSum = 6
```

| i | nums[i] | leftSum | rightSum | Equal? | leftSum (after) |
|---|---------|---------|----------|--------|-----------------|
| 0 | 1 | 0 | 6 - 0 - 1 = 5 | No | 1 |
| 1 | 2 | 1 | 6 - 1 - 2 = 3 | No | 3 |
| 2 | 3 | 3 | 6 - 3 - 3 = 0 | No | 6 |

**Result:** -1 ✓

### Time & Space Complexity

| Complexity | Value | Derivation |
|------------|-------|------------|
| **Time** | **O(n)** | One pass to calculate total (O(n)) + one pass to find pivot (O(n)) = O(n) |
| **Space** | **O(1)** | Only using variables totalSum, leftSum, rightSum |

**Practical Performance:**
- For n=10,000: ~20,000 operations vs 100,000,000 for brute force
- **5,000x faster** in practice

---

## 3. Visual Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        PIVOT INDEX                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Array: [1, 7, 3, 6, 5, 6]                                      │
│                                                                  │
│  Pivot at index 3:                                               │
│                                                                  │
│    Left Side     Pivot    Right Side                             │
│    ┌───┬───┬───┐   ┌───┐   ┌───┬───┐                            │
│    │ 1 │ 7 │ 3 │   │ 6 │   │ 5 │ 6 │                            │
│    └───┴───┴───┘   └───┘   └───┴───┘                            │
│       ↓                        ↓                                 │
│    Sum = 11                 Sum = 11   ✓ Equal!                 │
│                                                                  │
│  ═══════════════════════════════════════════════════════════    │
│                                                                  │
│  Optimal Approach - Running Sum:                                 │
│                                                                  │
│  Total Sum = 28                                                  │
│                                                                  │
│  i=0: left=0,  right=28-0-1=27   ✗                              │
│  i=1: left=1,  right=28-1-7=20   ✗                              │
│  i=2: left=8,  right=28-8-3=17   ✗                              │
│  i=3: left=11, right=28-11-6=11  ✓ FOUND!                       │
│                                                                  │
│  Formula: rightSum = totalSum - leftSum - nums[i]                │
│                                                                  │
│  Visual Flow:                                                    │
│  ┌─────────────────────────────────────┐                        │
│  │  Total = 28                         │                        │
│  │  ─────────────────────────────────  │                        │
│  │  Left | Current | Right             │                        │
│  │  ─────┼─────────┼─────────          │                        │
│  │   11  │    6    │   11              │ ← Balanced!            │
│  └─────────────────────────────────────┘                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Interview-Ready Explanation (60-90 seconds)

> "Find Pivot Index asks us to find an index where the left sum equals the right sum.
>
> **Brute-force approach** would be to calculate left and right sums independently for each index, giving us O(n²) time.
>
> **Optimal approach** uses a key insight: if we know the total sum, we can calculate the right sum without iteration using the formula: `rightSum = totalSum - leftSum - currentElement`.
>
> **Algorithm:**
> 1. Calculate total sum of the array in one pass
> 2. Iterate through the array maintaining a running `leftSum`
> 3. For each index, compute `rightSum = total - leftSum - nums[i]`
> 4. If `leftSum == rightSum`, we found our pivot
> 5. Update `leftSum` by adding current element before moving to next index
>
> **Time: O(n)** — two passes through the array
> **Space: O(1)** — only storing three variables
>
> The key trick is avoiding recalculation by deriving the right sum from values we already know."

---

## 5. Edge Cases

```javascript
// Single element - pivot at index 0
pivotIndex([1])
// → 0 (left=0, right=0)

// All zeros
pivotIndex([0, 0, 0])
// → 0 (any index works, return leftmost)

// Negative numbers
pivotIndex([-1, -1, -1, 0, 1, 1])
// → 0 (left=0, right=-1+-1+-1+0+1+1=0)

// No pivot exists
pivotIndex([1, 2, 3])
// → -1

// Pivot at start
pivotIndex([2, 1, -1])
// → 0 (left=0, right=1+(-1)=0)

// Pivot at end
pivotIndex([-1, 1, 2])
// → 2 (left=-1+1=0, right=0)

// Multiple pivots (return first)
pivotIndex([0, 0, 0, 0])
// → 0
```

---

## 6. Comparison Summary

| Approach | Time | Space | When to Use |
|----------|------|-------|-------------|
| Brute Force | O(n²) | O(1) | Never (educational only) |
| **Optimal (Prefix Sum)** | **O(n)** | **O(1)** | **Always - this is the standard solution** |

---

## 7. Common Mistakes to Avoid

1. **Forgetting to handle edge indices:** Index 0 and n-1 are valid pivots
2. **Off-by-one in sum calculations:** Don't include nums[i] in left or right sum
3. **Not updating leftSum:** Must add nums[i] to leftSum *after* checking
4. **Integer overflow:** For constraints given (-1000 to 1000, max 10^4 elements), max sum is 10^7, safe in JavaScript

---

## 8. Related Problems

- **560. Subarray Sum Equals K** - Similar prefix sum technique
- **525. Contiguous Array** - Prefix sum with hash map
- **1991. Find the Middle Index in Array** - Identical problem
- **2219. Maximum Sum Score of Array** - Extension of pivot concept
