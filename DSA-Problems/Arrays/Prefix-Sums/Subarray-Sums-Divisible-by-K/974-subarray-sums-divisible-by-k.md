# 974. Subarray Sums Divisible by K

## Table of Contents
1. [High-Level Interpretation](#high-level-interpretation)
2. [Brute-Force Approach](#brute-force-approach)
3. [Improved Approach (Prefix Sum O(n²))](#improved-approach-prefix-sum-on²)
4. [Optimal Approach (Prefix Sum + Remainder Counting)](#optimal-approach-prefix-sum--remainder-counting)
5. [Interview-Ready Explanation](#interview-ready-explanation)
6. [Visual Diagram](#visual-diagram)

---

## High-Level Interpretation

**What the problem is asking:**
Given an array of integers and a divisor k, count how many contiguous subarrays have a sum that is evenly divisible by k (i.e., sum % k == 0).

**Why it matters:**
This problem appears in financial systems (finding transaction sequences that balance to multiples of a unit), resource allocation (finding segments that evenly divide resources), and data processing (grouping elements by periodicity). It's a classic application of modular arithmetic with prefix sums.

**Hidden traps and edge cases:**
1. **Negative numbers:** Array elements can be negative, and in many languages, the modulo of a negative number is negative (e.g., `-1 % 5 = -1` in JavaScript). We must normalize remainders to be non-negative.
2. **Zero in array:** `0` is always divisible by k, so single `0` elements count as valid subarrays.
3. **Empty prefix = remainder 0:** We need to count the case where the entire prefix sum is divisible by k.
4. **Modulo property:** If `prefix[j] % k == prefix[i] % k`, then `(prefix[j] - prefix[i]) % k == 0`, meaning the subarray sum is divisible by k.

**Key insight:** Two prefix sums with the **same remainder** when divided by k form a subarray divisible by k.

---

## Brute-Force Approach

### 💡 The Idea (Plain Words)
Check every possible subarray:
1. For each starting index i
2. For each ending index j ≥ i
3. Calculate the sum of elements from i to j
4. If sum % k == 0, increment count

### 📝 Pseudocode
```
function subarraysDivByK_BruteForce(nums, k):
    n = nums.length
    count = 0
    
    for i from 0 to n-1:
        for j from i to n-1:
            sum = 0
            for idx from i to j:
                sum += nums[idx]
            if sum % k == 0:
                count++
    
    return count
```

### 💻 JavaScript Implementation
```javascript
/**
 * Brute Force - Triple nested loop
 * Time: O(n³)
 * Space: O(1)
 */
function subarraysDivByK_BruteForce(nums, k) {
    const n = nums.length;
    let count = 0;
    
    for (let i = 0; i < n; i++) {
        for (let j = i; j < n; j++) {
            let sum = 0;
            for (let idx = i; idx <= j; idx++) {
                sum += nums[idx];
            }
            if (sum % k === 0) {
                count++;
            }
        }
    }
    
    return count;
}
```

### ⏱️ Time & Space Complexity

| Complexity | Value | Derivation |
|------------|-------|------------|
| **Time** | O(n³) | n² pairs × O(n) to compute each sum |
| **Space** | O(1) | Only using a few variables |

For n = 30,000: O(30,000³) = 2.7 × 10¹³ — **way too slow!**

### 🔍 Dry Run

**Example:** `nums = [4, 5, 0, -2, -3, 1], k = 5`

Let's trace a few subarrays:

| i | j | Subarray | Sum | Sum % 5 | Divisible? |
|---|---|----------|-----|---------|------------|
| 0 | 0 | [4] | 4 | 4 | ❌ |
| 0 | 1 | [4,5] | 9 | 4 | ❌ |
| 0 | 5 | [4,5,0,-2,-3,1] | 5 | 0 | ✅ |
| 1 | 1 | [5] | 5 | 0 | ✅ |
| 1 | 2 | [5,0] | 5 | 0 | ✅ |
| 1 | 4 | [5,0,-2,-3] | 0 | 0 | ✅ |
| 2 | 2 | [0] | 0 | 0 | ✅ |
| 2 | 4 | [0,-2,-3] | -5 | 0 | ✅ |
| 3 | 4 | [-2,-3] | -5 | 0 | ✅ |

**Total valid subarrays: 7** ✅

### ❌ Why This Approach Fails
- O(n³) is far too slow for n = 30,000
- Recalculating sums from scratch is wasteful

---

## Improved Approach (Prefix Sum O(n²))

### 💡 Key Observation
Using a running sum eliminates the innermost loop:

```
sum(i, j) = sum(i, j-1) + nums[j]
```

### 📝 Pseudocode
```
function subarraysDivByK_Improved(nums, k):
    n = nums.length
    count = 0
    
    for i from 0 to n-1:
        sum = 0
        for j from i to n-1:
            sum += nums[j]
            if sum % k == 0:
                count++
    
    return count
```

### 💻 JavaScript Implementation
```javascript
/**
 * Improved - Running sum
 * Time: O(n²)
 * Space: O(1)
 */
function subarraysDivByK_Improved(nums, k) {
    const n = nums.length;
    let count = 0;
    
    for (let i = 0; i < n; i++) {
        let sum = 0;
        for (let j = i; j < n; j++) {
            sum += nums[j];
            if (sum % k === 0) {
                count++;
            }
        }
    }
    
    return count;
}
```

### ⏱️ Complexity Comparison

| Approach | Time | Space |
|----------|------|-------|
| Brute Force | O(n³) | O(1) |
| **Running Sum** | **O(n²)** | **O(1)** |

For n = 30,000: O(9 × 10⁸) — still potentially TLE.

### 🔍 Dry Run

**Example:** `nums = [4, 5, 0, -2, -3, 1], k = 5`

| i | j | sum (running) | sum % 5 | Valid? | Count |
|---|---|---------------|---------|--------|-------|
| 0 | 0 | 4 | 4 | ❌ | 0 |
| 0 | 1 | 9 | 4 | ❌ | 0 |
| 0 | 2 | 9 | 4 | ❌ | 0 |
| 0 | 3 | 7 | 2 | ❌ | 0 |
| 0 | 4 | 4 | 4 | ❌ | 0 |
| 0 | 5 | 5 | 0 | ✅ | 1 |
| 1 | 1 | 5 | 0 | ✅ | 2 |
| 1 | 2 | 5 | 0 | ✅ | 3 |
| 1 | 3 | 3 | 3 | ❌ | 3 |
| 1 | 4 | 0 | 0 | ✅ | 4 |
| ... | ... | ... | ... | ... | ... |

**Final: 7** ✅

---

## Optimal Approach (Prefix Sum + Remainder Counting)

### 💡 The Key Insight

**Mathematical Property:**
```
If prefix[j] % k == prefix[i] % k
Then (prefix[j] - prefix[i]) % k == 0
Therefore, sum(i+1, j) is divisible by k
```

**Why?** Because subtracting two numbers with the same remainder cancels the remainder:
- Let `prefix[i] = a*k + r` and `prefix[j] = b*k + r`
- Then `prefix[j] - prefix[i] = (b-a)*k` which is divisible by k

**Algorithm:**
1. Track prefix sum as we iterate
2. Compute `remainder = prefix % k` (normalize for negatives)
3. Count how many previous prefix sums had the same remainder
4. Use a HashMap (or array since k ≤ 10⁴) to store remainder frequencies

### 📝 Pseudocode
```
function subarraysDivByK(nums, k):
    count = 0
    prefixSum = 0
    remainderCount = new Map with {0: 1}  // Empty prefix has sum 0
    
    for num in nums:
        prefixSum += num
        
        // Normalize remainder to be non-negative
        remainder = ((prefixSum % k) + k) % k
        
        // Count previous prefixes with same remainder
        if remainderCount.has(remainder):
            count += remainderCount.get(remainder)
        
        // Update remainder count
        remainderCount.set(remainder, remainderCount.get(remainder, 0) + 1)
    
    return count
```

### 💻 JavaScript Implementation
```javascript
/**
 * Optimal - Prefix Sum + Remainder Counting
 * Time: O(n)
 * Space: O(k)
 */
function subarraysDivByK(nums, k) {
    let count = 0;
    let prefixSum = 0;
    
    // Map to count occurrences of each remainder
    // Initialize with {0: 1} for the empty prefix case
    const remainderCount = new Map();
    remainderCount.set(0, 1);
    
    for (const num of nums) {
        prefixSum += num;
        
        // Normalize remainder to be non-negative
        // In JavaScript, -1 % 5 = -1, but we want 4
        let remainder = prefixSum % k;
        if (remainder < 0) {
            remainder += k;
        }
        
        // If we've seen this remainder before, those form valid subarrays
        if (remainderCount.has(remainder)) {
            count += remainderCount.get(remainder);
        }
        
        // Update the count for this remainder
        remainderCount.set(remainder, (remainderCount.get(remainder) || 0) + 1);
    }
    
    return count;
}
```

### Alternative: Using Array (slightly faster)
```javascript
/**
 * Optimal - Using Array instead of Map
 * Time: O(n)
 * Space: O(k)
 */
function subarraysDivByK_Array(nums, k) {
    let count = 0;
    let prefixSum = 0;
    
    // Array to count remainders (indices 0 to k-1)
    const remainderCount = new Array(k).fill(0);
    remainderCount[0] = 1;  // Empty prefix
    
    for (const num of nums) {
        prefixSum += num;
        
        // Normalize remainder
        let remainder = prefixSum % k;
        if (remainder < 0) {
            remainder += k;
        }
        
        count += remainderCount[remainder];
        remainderCount[remainder]++;
    }
    
    return count;
}
```

### ✅ Proof of Correctness

**Claim:** If `prefix[i] % k == prefix[j] % k` for i < j, then `sum(i+1, j) % k == 0`.

**Proof:**
1. Let `prefix[i] = q₁ * k + r` where `r = prefix[i] % k`
2. Let `prefix[j] = q₂ * k + r` where `r = prefix[j] % k` (same remainder)
3. `sum(i+1, j) = prefix[j] - prefix[i] = (q₂ * k + r) - (q₁ * k + r) = (q₂ - q₁) * k`
4. This is a multiple of k, hence divisible by k ✓

**Why we initialize {0: 1}:**
- Counts subarrays starting from index 0
- If `prefix[j] % k == 0`, the subarray from 0 to j is divisible by k
- The empty prefix (with sum 0) has remainder 0

**Why we normalize negative remainders:**
- `-1 % 5 = -1` in JavaScript, but mathematically `-1 ≡ 4 (mod 5)`
- `-1` and `4` should be treated as the same remainder class
- Formula: `((x % k) + k) % k` always gives non-negative result

### 🔍 Dry Run

**Example:** `nums = [4, 5, 0, -2, -3, 1], k = 5`

| Index | num | prefixSum | remainder | remainderCount[r] | count | remainderCount after |
|-------|-----|-----------|-----------|-------------------|-------|---------------------|
| - | - | 0 | - | - | 0 | {0:1} |
| 0 | 4 | 4 | 4 | 0 | 0 | {0:1, 4:1} |
| 1 | 5 | 9 | 4 | 1 | 1 | {0:1, 4:2} |
| 2 | 0 | 9 | 4 | 2 | 3 | {0:1, 4:3} |
| 3 | -2 | 7 | 2 | 0 | 3 | {0:1, 4:3, 2:1} |
| 4 | -3 | 4 | 4 | 3 | 6 | {0:1, 4:4, 2:1} |
| 5 | 1 | 5 | 0 | 1 | 7 | {0:2, 4:4, 2:1} |

**Final count: 7** ✅

**Breaking down the valid subarrays found:**

| Step | Found Because | Subarrays Added |
|------|---------------|-----------------|
| i=1 | r=4 seen 1× before (at i=0) | [5] |
| i=2 | r=4 seen 2× before (at i=0,1) | [5,0], [0] |
| i=4 | r=4 seen 3× before (at i=0,1,2) | [5,0,-2,-3], [0,-2,-3], [-2,-3] |
| i=5 | r=0 seen 1× before (at start) | [4,5,0,-2,-3,1] |

### ⏱️ Time & Space Complexity

| Complexity | Value | Derivation |
|------------|-------|------------|
| **Time** | O(n) | Single pass through array |
| **Space** | O(k) | At most k distinct remainders |

For n = 30,000, k = 10,000: O(30,000) operations — **very fast!**

---

## Interview-Ready Explanation

> **(60-90 second verbal explanation)**
>
> "This problem asks for subarrays with sums divisible by k. The key insight is based on modular arithmetic.
>
> If two prefix sums have the same remainder when divided by k, then their difference — which is a subarray sum — is divisible by k.
>
> So I maintain a running prefix sum and compute its remainder mod k. I use a HashMap to count how many times I've seen each remainder before. When I encounter a remainder I've seen c times, that means there are c previous prefix sums that would form a valid subarray with the current position.
>
> There's one gotcha: in JavaScript, modulo of negative numbers can be negative. So I normalize remainders to be non-negative using the formula `((x % k) + k) % k`.
>
> I also initialize the HashMap with {0: 1} to count subarrays that start from index 0 and are themselves divisible by k.
>
> Time complexity is O(n) for a single pass, space is O(k) for storing at most k different remainders."

---

## Visual Diagram

### The Core Insight

```
Prefix Sums:      0    4    9    9    7    4    5
Index:           [-1]  0    1    2    3    4    5

Remainders (mod 5):
                  0    4    4    4    2    4    0
                  ↑    ↑    ↑    ↑         ↑    ↑
                  │    └────┴────┴─────────┘    │
                  │         Same remainder      │
                  │         = Valid pairs!      │
                  └─────────────────────────────┘
                            Same remainder
```

### How Matching Remainders Form Valid Subarrays

```
prefix[0] = 0 (remainder 0)    ─┐
prefix[1] = 4 (remainder 4)    ─┼─ These 4 positions with r=4
prefix[2] = 9 (remainder 4)    ─┤  form C(4,2) = 6 pairs
prefix[3] = 9 (remainder 4)    ─┤  
prefix[4] = 7 (remainder 2)    ─┘  
prefix[5] = 4 (remainder 4)    ─┤  
prefix[6] = 5 (remainder 0)    ─┘  This with prefix[0] = 1 pair

Valid subarrays from remainders:
r=4: pairs are (0,1), (0,2), (0,4), (1,2), (1,4), (2,4) → 6 subarrays
r=0: pair is (−1, 5) → 1 subarray (entire prefix to index 5)

Total: 6 + 1 = 7 subarrays ✓
```

### Counting Formula

```
For each remainder r, if it appears c times:
Number of valid pairs = C(c, 2) = c × (c-1) / 2

Alternative (what our algorithm does):
As we see each remainder:
  - 1st time: adds 0 (no previous match)
  - 2nd time: adds 1 (matches 1 previous)
  - 3rd time: adds 2 (matches 2 previous)
  - nth time: adds n-1 (matches n-1 previous)

Total = 0 + 1 + 2 + ... + (c-1) = c × (c-1) / 2 ✓
```

### Algorithm Flow

```
┌─────────────────────────────────────────────────────────┐
│                    ALGORITHM                            │
│                                                         │
│  remainderCount = {0: 1}                               │
│  prefixSum = 0                                          │
│  count = 0                                              │
│                                                         │
│  for each num in nums:                                 │
│    ┌─────────────────────────────────────────────┐     │
│    │  prefixSum += num                            │     │
│    │                                              │     │
│    │  remainder = normalize(prefixSum % k)        │     │
│    │                                              │     │
│    │  ┌─────────────────────────────────────┐    │     │
│    │  │ count += remainderCount[remainder]   │    │     │
│    │  │         ↑                            │    │     │
│    │  │  How many previous prefixes have     │    │     │
│    │  │  the same remainder?                 │    │     │
│    │  └─────────────────────────────────────┘    │     │
│    │                                              │     │
│    │  remainderCount[remainder]++                 │     │
│    └─────────────────────────────────────────────┘     │
│                                                         │
│  return count                                           │
└─────────────────────────────────────────────────────────┘
```

---

## Summary Comparison

| Approach | Time | Space | Notes |
|----------|------|-------|-------|
| Brute Force | O(n³) | O(1) | Triple loop, recalculates sums |
| Running Sum | O(n²) | O(1) | Double loop, running sum |
| **Remainder Counting** | **O(n)** | **O(k)** | **Optimal using modular arithmetic** |

---

## Edge Cases Checklist

| Edge Case | Example | Expected | Notes |
|-----------|---------|----------|-------|
| Single element divisible | `[5], k=5` | `1` | 5 % 5 = 0 |
| Single element not divisible | `[5], k=9` | `0` | 5 % 9 ≠ 0 |
| All zeros | `[0,0,0], k=5` | `6` | Every subarray sums to 0 |
| Negative elements | `[-1,-1,-1], k=3` | `1` | Only [-1,-1,-1] sums to -3 |
| Large array | 30,000 elements | - | O(n) handles well |

---

## Common Mistakes

1. **Forgetting to normalize negative remainders**
   ```javascript
   // WRONG in JavaScript
   let r = sum % k;  // Could be negative!
   
   // CORRECT
   let r = ((sum % k) + k) % k;  // Always non-negative
   ```

2. **Not initializing remainder count with {0: 1}**
   - Misses subarrays that start at index 0 and are divisible by k

3. **Using HashMap when array is more efficient**
   - Since remainders are in [0, k-1], an array of size k is faster

4. **Confusing "sum equals k" with "sum divisible by k"**
   - This problem is about divisibility (remainder 0), not equality

5. **Off-by-one in subarray formation**
   - If prefix[i] and prefix[j] have same remainder, the subarray is [i+1, j]

---

## Complete Solution (Copy-Paste Ready)

```javascript
/**
 * 974. Subarray Sums Divisible by K
 * Time: O(n)
 * Space: O(k)
 */
var subarraysDivByK = function(nums, k) {
    let count = 0;
    let prefixSum = 0;
    
    // Array for remainder counts (faster than Map)
    const remainderCount = new Array(k).fill(0);
    remainderCount[0] = 1;  // Empty prefix has remainder 0
    
    for (const num of nums) {
        prefixSum += num;
        
        // Normalize remainder to [0, k-1]
        let remainder = prefixSum % k;
        if (remainder < 0) remainder += k;
        
        // Add count of previous prefixes with same remainder
        count += remainderCount[remainder];
        
        // Update remainder count
        remainderCount[remainder]++;
    }
    
    return count;
};
```

---

## Related Problems

| Problem | Similarity |
|---------|------------|
| 560. Subarray Sum Equals K | Same prefix sum + HashMap pattern |
| 523. Continuous Subarray Sum | Divisibility + length ≥ 2 constraint |
| 1590. Make Sum Divisible by P | Find minimum removal for divisibility |
| 1497. Check If Array Pairs Are Divisible by k | Pair matching with remainders |
| 1010. Pairs of Songs With Total Durations Divisible by 60 | Similar remainder counting |
