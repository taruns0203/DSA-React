# LeetCode 363: Max Sum of Rectangle No Larger Than K - Complete Guide

## Table of Contents
1. [High-Level Interpretation](#1-high-level-interpretation)
2. [Brute-Force Approach: Enumerate All Rectangles](#2-brute-force-approach-enumerate-all-rectangles)
3. [Improved Approach: 2D Prefix Sum](#3-improved-approach-2d-prefix-sum)
4. [Optimal Approach: Column Compression + Sorted Set](#4-optimal-approach-column-compression--sorted-set)
5. [Interview-Ready Explanation](#5-interview-ready-explanation)
6. [Visual Diagram](#6-visual-diagram)

---

## 1. High-Level Interpretation

### What the Problem is Asking

Find the maximum sum of any rectangular subarray in a 2D matrix such that the sum is ≤ k. Return this maximum sum.

### Why This Problem Matters

- Combines 2D array techniques with 1D subarray sum optimization
- Teaches prefix sum reduction (2D → 1D)
- Binary search tree application for constraint satisfaction

### Hidden Traps & Edge Cases

| Trap | Example | Explanation |
|------|---------|-------------|
| **Negative values** | [[-1,-2],[-3,-4]], k=-1 | Max valid sum is -1 |
| **Exact match** | [[2]], k=2 | Answer is exactly k |
| **All exceed k** | [[5,6]], k=3 | Look for larger negative sums |
| **Single cell** | [[3]], k=5 | Rectangle can be 1×1 |

---

## 2. Brute-Force Approach: Enumerate All Rectangles

### 2.1 Idea in Plain Words

Enumerate all possible rectangles by choosing top-left (r1, c1) and bottom-right (r2, c2) corners. Calculate sum for each rectangle, keep track of max sum ≤ k.

### 2.2 Pseudocode

```
function maxSumSubmatrix(matrix, k):
    m = rows, n = cols
    result = -infinity
    
    for r1 from 0 to m-1:
        for c1 from 0 to n-1:
            for r2 from r1 to m-1:
                for c2 from c1 to n-1:
                    sum = calculateSum(r1, c1, r2, c2)
                    if sum <= k:
                        result = max(result, sum)
    
    return result
```

### 2.3 JavaScript Implementation

```javascript
/**
 * Brute Force: O(m²n²) enumeration × O(mn) sum = O(m³n³)
 */
function maxSumSubmatrixBruteForce(matrix, k) {
    const m = matrix.length;
    const n = matrix[0].length;
    let result = -Infinity;
    
    for (let r1 = 0; r1 < m; r1++) {
        for (let c1 = 0; c1 < n; c1++) {
            for (let r2 = r1; r2 < m; r2++) {
                for (let c2 = c1; c2 < n; c2++) {
                    // Calculate sum of rectangle (r1,c1) to (r2,c2)
                    let sum = 0;
                    for (let i = r1; i <= r2; i++) {
                        for (let j = c1; j <= c2; j++) {
                            sum += matrix[i][j];
                        }
                    }
                    if (sum <= k) {
                        result = Math.max(result, sum);
                    }
                }
            }
        }
    }
    
    return result;
}
```

### 2.4 Time & Space Complexity

| Metric | Complexity | Reason |
|--------|------------|--------|
| **Time** | O(m³n³) | O(m²n²) rectangles × O(mn) sum each |
| **Space** | O(1) | No extra storage |

### 2.5 Dry Run

**Input:** matrix = [[1,0,1],[0,-2,3]], k = 2

| r1,c1 | r2,c2 | Rectangle | Sum | ≤k? | result |
|-------|-------|-----------|-----|-----|--------|
| 0,0 | 0,0 | [[1]] | 1 | ✓ | 1 |
| 0,0 | 0,1 | [[1,0]] | 1 | ✓ | 1 |
| 0,0 | 0,2 | [[1,0,1]] | 2 | ✓ | 2 |
| 0,1 | 1,2 | [[0,1],[-2,3]] | 2 | ✓ | **2** |
| ... | ... | ... | ... | ... | ... |

**Output:** 2 ✓

### 2.6 Why This Approach is Slow

- For m=n=100: 100³ × 100³ = 10¹² operations
- Far too slow for constraints

---

## 3. Improved Approach: 2D Prefix Sum

### 3.1 What Changed

Precompute 2D prefix sum array to calculate any rectangle sum in O(1).

**Prefix sum formula:**
```
prefixSum[i][j] = sum of all elements in (0,0) to (i-1,j-1)
rectangleSum(r1,c1,r2,c2) = prefix[r2+1][c2+1] - prefix[r1][c2+1] 
                           - prefix[r2+1][c1] + prefix[r1][c1]
```

### 3.2 JavaScript Implementation

```javascript
/**
 * Improved: 2D Prefix Sum - O(m²n²)
 */
function maxSumSubmatrixPrefixSum(matrix, k) {
    const m = matrix.length;
    const n = matrix[0].length;
    
    // Build 2D prefix sum
    const prefix = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            prefix[i][j] = matrix[i-1][j-1] 
                         + prefix[i-1][j] 
                         + prefix[i][j-1] 
                         - prefix[i-1][j-1];
        }
    }
    
    let result = -Infinity;
    
    // Enumerate all rectangles - O(m²n²)
    for (let r1 = 0; r1 < m; r1++) {
        for (let c1 = 0; c1 < n; c1++) {
            for (let r2 = r1; r2 < m; r2++) {
                for (let c2 = c1; c2 < n; c2++) {
                    // O(1) rectangle sum
                    const sum = prefix[r2+1][c2+1] - prefix[r1][c2+1] 
                              - prefix[r2+1][c1] + prefix[r1][c1];
                    if (sum <= k) {
                        result = Math.max(result, sum);
                    }
                }
            }
        }
    }
    
    return result;
}
```

### 3.3 Time & Space Complexity

| Metric | Complexity | Reason |
|--------|------------|--------|
| **Time** | O(m²n²) | Enumerate all rectangles |
| **Space** | O(mn) | Prefix sum array |

### 3.4 Trade-offs

- ✓ Much faster than brute force (O(mn) factor improvement)
- ✗ Still O(m²n²) = 10⁸ for m=n=100 - borderline acceptable

---

## 4. Optimal Approach: Column Compression + Sorted Set

### 4.1 Key Intuition

**Reduce 2D problem to 1D:**
1. Fix left column `c1` and right column `c2`
2. Compress columns into a 1D array of row sums
3. Find max subarray sum ≤ k in 1D array using prefix sum + sorted set

**1D subarray sum ≤ k problem:**
- For prefix sum array `S`, we want: `S[j] - S[i] ≤ k` where `i < j`
- Rearrange: `S[i] ≥ S[j] - k`
- Use sorted set to find smallest `S[i] ≥ S[j] - k` for each `S[j]`

### 4.2 Pseudocode

```
function maxSumSubmatrix(matrix, k):
    m = rows, n = cols
    result = -infinity
    
    // Fix left and right columns
    for c1 from 0 to n-1:
        rowSum = array of m zeros
        
        for c2 from c1 to n-1:
            // Add column c2 to rowSum
            for r from 0 to m-1:
                rowSum[r] += matrix[r][c2]
            
            // Now find max subarray sum <= k in rowSum (1D problem)
            result = max(result, maxSumSubarrayNoLargerThanK(rowSum, k))
    
    return result

function maxSumSubarrayNoLargerThanK(arr, k):
    sortedSet = new SortedSet()
    sortedSet.add(0)  // prefix sum before first element
    
    prefixSum = 0
    maxSum = -infinity
    
    for num in arr:
        prefixSum += num
        
        // Find smallest prefix >= prefixSum - k
        target = prefixSum - k
        ceiling = sortedSet.ceiling(target)  // smallest value >= target
        
        if ceiling exists:
            maxSum = max(maxSum, prefixSum - ceiling)
        
        sortedSet.add(prefixSum)
    
    return maxSum
```

### 4.3 JavaScript Implementation

```javascript
/**
 * Optimal: Column Compression + Binary Search
 * Time: O(min(m,n)² × max(m,n) × log(max(m,n)))
 */
function maxSumSubmatrix(matrix, k) {
    const m = matrix.length;
    const n = matrix[0].length;
    let result = -Infinity;
    
    // Optimization: iterate over the smaller dimension for outer loops
    // This makes complexity O(min(m,n)² × max(m,n) × log(max(m,n)))
    
    // Fix left and right columns
    for (let c1 = 0; c1 < n; c1++) {
        // rowSum[r] = sum of matrix[r][c1..c2]
        const rowSum = new Array(m).fill(0);
        
        for (let c2 = c1; c2 < n; c2++) {
            // Add column c2 to rowSum
            for (let r = 0; r < m; r++) {
                rowSum[r] += matrix[r][c2];
            }
            
            // Find max subarray sum <= k in 1D array rowSum
            const maxSubarraySum = maxSumNoLargerThanK(rowSum, k);
            result = Math.max(result, maxSubarraySum);
            
            // Early termination if we found exact match
            if (result === k) return k;
        }
    }
    
    return result;
}

/**
 * Find max subarray sum <= k in 1D array
 * Uses prefix sum + sorted array with binary search
 */
function maxSumNoLargerThanK(arr, k) {
    // First try Kadane's algorithm for max subarray sum
    // If result <= k, we're done!
    let kadaneSum = kadaneMax(arr);
    if (kadaneSum <= k) return kadaneSum;
    
    // Otherwise, use prefix sum + binary search
    let maxSum = -Infinity;
    let prefixSum = 0;
    const sortedPrefixes = [0];  // Sorted array of seen prefix sums
    
    for (const num of arr) {
        prefixSum += num;
        
        // Find smallest prefix >= prefixSum - k
        // This gives us sum = prefixSum - prefix <= k
        const target = prefixSum - k;
        const idx = lowerBound(sortedPrefixes, target);
        
        if (idx < sortedPrefixes.length) {
            maxSum = Math.max(maxSum, prefixSum - sortedPrefixes[idx]);
        }
        
        // Insert prefixSum into sorted array (maintain sorted order)
        insertSorted(sortedPrefixes, prefixSum);
    }
    
    return maxSum;
}

function kadaneMax(arr) {
    let maxEndingHere = arr[0];
    let maxSoFar = arr[0];
    
    for (let i = 1; i < arr.length; i++) {
        maxEndingHere = Math.max(arr[i], maxEndingHere + arr[i]);
        maxSoFar = Math.max(maxSoFar, maxEndingHere);
    }
    
    return maxSoFar;
}

function lowerBound(arr, target) {
    let lo = 0, hi = arr.length;
    while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (arr[mid] < target) lo = mid + 1;
        else hi = mid;
    }
    return lo;
}

function insertSorted(arr, val) {
    const idx = lowerBound(arr, val);
    arr.splice(idx, 0, val);
}
```

### 4.4 Optimized for Rows > Columns

```javascript
/**
 * Follow-up: What if rows >> cols?
 * Transpose if m > n, so we iterate over smaller dimension
 */
function maxSumSubmatrixOptimized(matrix, k) {
    let m = matrix.length;
    let n = matrix[0].length;
    
    // Transpose if more rows than columns
    if (m > n) {
        const transposed = [];
        for (let j = 0; j < n; j++) {
            transposed.push([]);
            for (let i = 0; i < m; i++) {
                transposed[j].push(matrix[i][j]);
            }
        }
        matrix = transposed;
        [m, n] = [n, m];
    }
    
    return maxSumSubmatrix(matrix, k);
}
```

### 4.5 Proof of Correctness

**1D Subarray Sum ≤ k:**

For prefix sums S₀, S₁, ..., Sₙ where S₀ = 0:
- Subarray sum from i+1 to j = Sⱼ - Sᵢ
- We want max(Sⱼ - Sᵢ) where Sⱼ - Sᵢ ≤ k
- Rearranging: Sᵢ ≥ Sⱼ - k
- Finding smallest Sᵢ ≥ Sⱼ - k maximizes Sⱼ - Sᵢ while keeping it ≤ k

**2D Reduction:**
- By fixing columns c1, c2 and compressing to row sums, we reduce to finding max 1D subarray sum in the compressed array
- This is equivalent to finding the max rectangle sum with those column bounds

### 4.6 Dry Run

**Input:** matrix = [[1,0,1],[0,-2,3]], k = 2

**Columns c1=0, c2=0:**
- rowSum = [1, 0]
- Kadane max = 1 ≤ k ✓, result = 1

**Columns c1=0, c2=1:**
- rowSum = [1+0, 0+(-2)] = [1, -2]
- Kadane max = 1 ≤ k ✓, result = 1

**Columns c1=0, c2=2:**
- rowSum = [1+0+1, 0+(-2)+3] = [2, 1]
- Kadane max = 3 > k, use binary search:
  - prefixes: [0]
  - i=0: prefixSum=2, target=2-2=0, ceiling(0)=0, sum=2-0=2 ≤ k ✓
  - result = 2

**Columns c1=1, c2=2:**
- rowSum = [0+1, -2+3] = [1, 1]
- Kadane max = 2 ≤ k ✓, result = 2

**Output:** 2 ✓

### 4.7 Time & Space Complexity

| Metric | Complexity | Reason |
|--------|------------|--------|
| **Time** | O(n² × m × log m) | n² column pairs × m row operations × log m binary search |
| **Space** | O(m) | rowSum array + sorted prefixes |

**If rows >> cols (follow-up):** Transpose → O(m² × n × log n)

**General:** O(min(m,n)² × max(m,n) × log(max(m,n)))

---

## 5. Interview-Ready Explanation

### 60-90 Second Verbal Summary

> "Max Sum Rectangle No Larger Than K asks for the maximum rectangular subarray sum that doesn't exceed k.
>
> The key insight is to **reduce 2D to 1D**. I fix left and right columns, then compress each row into a single sum. This gives me a 1D array where I need to find the max subarray sum ≤ k.
>
> For the 1D problem, if Kadane's max is ≤ k, we're done. Otherwise, I use **prefix sums with binary search**:
> - For each prefix sum Sⱼ, I want the smallest previous prefix Sᵢ where Sᵢ ≥ Sⱼ - k
> - This gives the maximum valid subarray sum ending at j
> - I maintain a sorted array of prefix sums and use binary search to find the ceiling
>
> Time complexity is O(n² × m × log m) for n columns and m rows. If rows >> cols, I transpose the matrix first to get O(min(m,n)² × max(m,n) × log(max(m,n)))."

---

## 6. Visual Diagram

### Column Compression

```
matrix = [[1, 0, 1],
          [0,-2, 3]]

Fix c1=1, c2=2:

  col 1  col 2
    ↓      ↓
  [ 0,     1 ]  → rowSum[0] = 0+1 = 1
  [-2,     3 ]  → rowSum[1] = -2+3 = 1

rowSum = [1, 1]

Now find max subarray sum ≤ k in [1, 1]
```

### Prefix Sum + Binary Search

```
arr = [2, 1], k = 2
S = prefix sums

Step 1: prefixSum = 2
  sortedPrefixes = [0]
  target = 2 - 2 = 0
  ceiling(0) = 0 ✓
  sum = 2 - 0 = 2 ≤ k ✓
  sortedPrefixes = [0, 2]

Step 2: prefixSum = 3
  sortedPrefixes = [0, 2]
  target = 3 - 2 = 1
  ceiling(1) = 2 ✓
  sum = 3 - 2 = 1 ≤ k ✓
  
Max valid sum = 2
```

### Algorithm Flow

```
┌─────────────────────────────────────────────┐
│           2D Matrix (m × n)                 │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│  Fix columns (c1, c2): O(n²) pairs          │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│  Compress to 1D rowSum array: O(m)          │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│  Kadane's algorithm: O(m)                   │
│  If max ≤ k → done!                         │
└─────────────────────────────────────────────┘
                    │ (if max > k)
                    ▼
┌─────────────────────────────────────────────┐
│  Prefix Sum + Binary Search: O(m log m)     │
│  For each prefix, find ceiling(prefix - k)  │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│  Result: max valid sum ≤ k                  │
└─────────────────────────────────────────────┘
```

---

## Summary Comparison

| Approach | Time | Space | Notes |
|----------|------|-------|-------|
| Brute Force | O(m³n³) | O(1) | Way too slow |
| 2D Prefix Sum | O(m²n²) | O(mn) | Borderline |
| **Column Compress + Binary Search** | **O(n²m log m)** | **O(m)** | Optimal |

> [!TIP]
> **Pattern Recognition:** 2D subarray problems → Fix two dimensions, solve reduced 1D problem!
>
> Related problems:
> - Maximum Sum Submatrix (no constraint) - 2D Kadane
> - Number of Submatrices That Sum to Target (1074)
> - Range Sum Query 2D (304)
