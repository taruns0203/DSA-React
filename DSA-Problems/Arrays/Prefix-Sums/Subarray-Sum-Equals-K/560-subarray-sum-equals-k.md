# 560. Subarray Sum Equals K

## Table of Contents
1. [High-Level Interpretation](#high-level-interpretation)
2. [Brute-Force Approach](#brute-force-approach)
3. [Improved Approach (Prefix Sum)](#improved-approach-prefix-sum)
4. [Optimal Approach (Prefix Sum + HashMap)](#optimal-approach-prefix-sum--hashmap)
5. [Interview-Ready Explanation](#interview-ready-explanation)
6. [Visual Diagram](#visual-diagram)

---

## High-Level Interpretation

**What the problem is asking:**
Given an array of integers and a target sum `k`, count **how many contiguous subarrays** have elements that sum to exactly `k`. A subarray must be contiguous (no gaps) and non-empty.

**Why it matters:**
This is a fundamental problem that appears in many real-world scenarios: finding time windows with a specific total, identifying transaction patterns that sum to a target, sliding window analytics, and as a building block for more complex algorithms like finding subarrays with sum divisible by k.

**Hidden traps and edge cases:**
1. **Negative numbers:** The array can contain negative integers! This means:
   - The sliding window technique (used for positive-only arrays) won't work
   - A longer subarray might have a smaller sum than a shorter one
   - There can be multiple ways to reach the same sum
2. **Zero values:** An element could be 0, meaning extending the subarray doesn't change the sum
3. **Entire array as subarray:** The whole array might be a valid answer
4. **Multiple overlapping subarrays:** Different starting/ending points can give the same sum
5. **k = 0:** Need to handle subarrays that sum to zero
6. **Single element = k:** Each element equal to k is a valid subarray of length 1

---

## Brute-Force Approach

### 💡 The Idea (Plain Words)
The simplest approach is to check **every possible subarray**:
1. For each starting index `i`
2. For each ending index `j` (where `j >= i`)
3. Calculate the sum of elements from `i` to `j`
4. If the sum equals `k`, increment our count

This generates all possible subarrays and checks each one.

### 📝 Pseudocode
```
function subarraySum_BruteForce(nums, k):
    count = 0
    n = length(nums)
    
    for i from 0 to n-1:              // starting index
        for j from i to n-1:           // ending index
            sum = 0
            for m from i to j:         // calculate sum
                sum += nums[m]
            if sum == k:
                count++
    
    return count
```

### 💻 JavaScript Implementation
```javascript
/**
 * Brute Force Approach - Triple Nested Loop
 * Time Complexity: O(n³)
 * Space Complexity: O(1)
 */
function subarraySum_BruteForce(nums, k) {
    let count = 0;
    const n = nums.length;
    
    for (let i = 0; i < n; i++) {           // start
        for (let j = i; j < n; j++) {       // end
            let sum = 0;
            for (let m = i; m <= j; m++) {  // calculate sum
                sum += nums[m];
            }
            if (sum === k) {
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
| **Time** | O(n³) | Three nested loops: O(n) × O(n) × O(n) |
| **Space** | O(1) | Only using a few variables |

**Why O(n³)?**
- Outer loop runs `n` times
- Middle loop runs up to `n` times
- Inner loop (sum calculation) runs up to `n` times
- Total: approximately n × n × n / 6 = O(n³)

### 🔍 Dry Run

**Example 1:** `nums = [1, 1, 1], k = 2`

| Start (i) | End (j) | Subarray | Sum | Sum == 2? | Count |
|-----------|---------|----------|-----|-----------|-------|
| 0 | 0 | [1] | 1 | ❌ | 0 |
| 0 | 1 | [1,1] | 2 | ✅ | **1** |
| 0 | 2 | [1,1,1] | 3 | ❌ | 1 |
| 1 | 1 | [1] | 1 | ❌ | 1 |
| 1 | 2 | [1,1] | 2 | ✅ | **2** |
| 2 | 2 | [1] | 1 | ❌ | 2 |

**Result:** `2` ✅

---

**Example 2:** `nums = [1, 2, 3], k = 3`

| Start (i) | End (j) | Subarray | Sum | Sum == 3? | Count |
|-----------|---------|----------|-----|-----------|-------|
| 0 | 0 | [1] | 1 | ❌ | 0 |
| 0 | 1 | [1,2] | 3 | ✅ | **1** |
| 0 | 2 | [1,2,3] | 6 | ❌ | 1 |
| 1 | 1 | [2] | 2 | ❌ | 1 |
| 1 | 2 | [2,3] | 5 | ❌ | 1 |
| 2 | 2 | [3] | 3 | ✅ | **2** |

**Result:** `2` ✅

### ❌ Why This Approach is Slow

- For `n = 20,000` (max constraint), O(n³) = 8 × 10¹² operations
- This would take **hours** to complete
- We're recalculating the sum from scratch for every subarray

**The key waste:** When moving from subarray [i...j] to [i...j+1], we recalculate the entire sum instead of just adding `nums[j+1]`.

---

## Improved Approach (Prefix Sum)

### 💡 Key Observation: Cumulative Sum

Instead of recalculating sums from scratch, we can use a **running sum**:
- When extending a subarray from [i...j] to [i...j+1], just add `nums[j+1]`

This eliminates the innermost loop!

### 📝 Pseudocode
```
function subarraySum_PrefixSum(nums, k):
    count = 0
    n = length(nums)
    
    for i from 0 to n-1:              // starting index
        sum = 0
        for j from i to n-1:           // ending index
            sum += nums[j]             // running sum instead of recalculating
            if sum == k:
                count++
    
    return count
```

### 💻 JavaScript Implementation
```javascript
/**
 * Improved Approach - Cumulative Sum (Double Loop)
 * Time Complexity: O(n²)
 * Space Complexity: O(1)
 */
function subarraySum_PrefixSum(nums, k) {
    let count = 0;
    const n = nums.length;
    
    for (let i = 0; i < n; i++) {
        let sum = 0;
        for (let j = i; j < n; j++) {
            sum += nums[j];  // Running sum - just add next element!
            if (sum === k) {
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
| **Time** | O(n²) | Two nested loops: O(n) × O(n) |
| **Space** | O(1) | Only using a few variables |

**Improvement:** From O(n³) to O(n²) — a **10,000x speedup** for n = 10,000!

### 🔍 Dry Run

**Example:** `nums = [1, 2, 3], k = 3`

| Start (i) | End (j) | Current nums[j] | Running Sum | Sum == 3? | Count |
|-----------|---------|-----------------|-------------|-----------|-------|
| 0 | 0 | 1 | 1 | ❌ | 0 |
| 0 | 1 | 2 | 1+2=3 | ✅ | **1** |
| 0 | 2 | 3 | 3+3=6 | ❌ | 1 |
| 1 | 1 | 2 | 2 | ❌ | 1 |
| 1 | 2 | 3 | 2+3=5 | ❌ | 1 |
| 2 | 2 | 3 | 3 | ✅ | **2** |

**Result:** `2` ✅

### 📊 Trade-offs

| Aspect | Brute Force O(n³) | Prefix Sum O(n²) |
|--------|-------------------|------------------|
| Time | Extremely slow | Better but still slow |
| Space | O(1) | O(1) |
| For n=20000 | ~8×10¹² ops | ~4×10⁸ ops |

**Still not good enough!** For n = 20,000, O(n²) = 400 million operations. We need O(n).

---

## Optimal Approach (Prefix Sum + HashMap)

### 💡 The Intuition

**Key Mathematical Insight:**

Let `prefixSum[i]` = sum of elements from index 0 to i.

The sum of subarray from index `j+1` to `i` is:
```
sum(j+1 to i) = prefixSum[i] - prefixSum[j]
```

**If we want `sum(j+1 to i) = k`, then:**
```
prefixSum[i] - prefixSum[j] = k
prefixSum[j] = prefixSum[i] - k
```

**Translation:** At any index `i`, we need to count how many times we've seen a prefix sum equal to `(currentPrefixSum - k)` before!

This turns our problem into: "For each position, how many previous prefix sums equal `currentSum - k`?"

We can use a **HashMap** to store prefix sum frequencies!

### 📝 Pseudocode
```
function subarraySum_Optimal(nums, k):
    count = 0
    currentSum = 0
    prefixSumCount = new HashMap()
    prefixSumCount[0] = 1  // Empty prefix (sum = 0) exists once
    
    for each num in nums:
        currentSum += num
        
        // How many previous prefix sums equal (currentSum - k)?
        target = currentSum - k
        if target in prefixSumCount:
            count += prefixSumCount[target]
        
        // Record current prefix sum
        prefixSumCount[currentSum] = prefixSumCount.getOrDefault(currentSum, 0) + 1
    
    return count
```

### 💻 JavaScript Implementation
```javascript
/**
 * Optimal Approach - Prefix Sum + HashMap
 * Time Complexity: O(n)
 * Space Complexity: O(n)
 */
function subarraySum(nums, k) {
    let count = 0;
    let currentSum = 0;
    const prefixSumCount = new Map();
    
    // Important: empty prefix (sum = 0) exists once
    // This handles the case when currentSum itself equals k
    prefixSumCount.set(0, 1);
    
    for (const num of nums) {
        currentSum += num;
        
        // How many previous prefix sums equal (currentSum - k)?
        const target = currentSum - k;
        if (prefixSumCount.has(target)) {
            count += prefixSumCount.get(target);
        }
        
        // Record current prefix sum frequency
        prefixSumCount.set(
            currentSum, 
            (prefixSumCount.get(currentSum) || 0) + 1
        );
    }
    
    return count;
}
```

### ✅ Proof of Correctness

**Why does this work?**

1. **Prefix Sum Property:**
   - `prefixSum[i]` = sum of all elements from index 0 to i
   - Sum of subarray [j+1 ... i] = prefixSum[i] - prefixSum[j]

2. **Our Goal:** Find all pairs (j, i) where j < i and:
   ```
   prefixSum[i] - prefixSum[j] = k
   ```

3. **Rearranging:**
   ```
   prefixSum[j] = prefixSum[i] - k
   ```

4. **For each index i,** we count how many j's satisfy this equation by looking up `(prefixSum[i] - k)` in our HashMap.

5. **Why initialize with `{0: 1}`?**
   - This represents the "empty prefix" before index 0
   - Handles the case when the subarray starts from index 0
   - Example: `[3], k=3` — prefixSum=3, target=3-3=0, and we've seen 0 once (the empty prefix)

**Loop Invariant:** Before processing index i, the HashMap contains the frequency of all prefix sums from indices 0 to i-1.

### 🔍 Dry Run

**Example 1:** `nums = [1, 1, 1], k = 2`

| Index | num | currentSum | target (currentSum-k) | Map lookup | count | Map after |
|-------|-----|------------|----------------------|------------|-------|-----------|
| init | — | 0 | — | — | 0 | {0: 1} |
| 0 | 1 | 1 | 1-2=-1 | -1 not found | 0 | {0:1, 1:1} |
| 1 | 1 | 2 | 2-2=0 | 0 found! (freq=1) | **1** | {0:1, 1:1, 2:1} |
| 2 | 1 | 3 | 3-2=1 | 1 found! (freq=1) | **2** | {0:1, 1:1, 2:1, 3:1} |

**Result:** `2` ✅

**Explanation:**
- At index 1: prefixSum=2, looking for 0. Found! Means subarray [0...1] sums to 2 ✓
- At index 2: prefixSum=3, looking for 1. Found! Means subarray [1...2] sums to 2 ✓

---

**Example 2:** `nums = [1, 2, 3], k = 3`

| Index | num | currentSum | target (currentSum-k) | Map lookup | count | Map after |
|-------|-----|------------|----------------------|------------|-------|-----------|
| init | — | 0 | — | — | 0 | {0: 1} |
| 0 | 1 | 1 | 1-3=-2 | -2 not found | 0 | {0:1, 1:1} |
| 1 | 2 | 3 | 3-3=0 | 0 found! (freq=1) | **1** | {0:1, 1:1, 3:1} |
| 2 | 3 | 6 | 6-3=3 | 3 found! (freq=1) | **2** | {0:1, 1:1, 3:1, 6:1} |

**Result:** `2` ✅

**Explanation:**
- At index 1: prefixSum=3, looking for 0. Found! Means subarray [0...1] = [1,2] sums to 3 ✓
- At index 2: prefixSum=6, looking for 3. Found! Means subarray from after prefixSum=3, which is [2] = [3] sums to 3 ✓

---

**Example with negatives:** `nums = [1, -1, 1, 1], k = 2`

| Index | num | currentSum | target | Map lookup | count | Map after |
|-------|-----|------------|--------|------------|-------|-----------|
| init | — | 0 | — | — | 0 | {0: 1} |
| 0 | 1 | 1 | -1 | not found | 0 | {0:1, 1:1} |
| 1 | -1 | 0 | -2 | not found | 0 | {0:2, 1:1} |
| 2 | 1 | 1 | -1 | not found | 0 | {0:2, 1:2} |
| 3 | 1 | 2 | 0 | found! (freq=2) | **2** | {0:2, 1:2, 2:1} |

**Result:** `2` ✅

**Subarrays:** [1,-1,1,1] and [1,1] (last two elements)

### ⏱️ Time & Space Complexity

| Complexity | Value | Derivation |
|------------|-------|------------|
| **Time** | O(n) | Single pass through the array, O(1) HashMap operations |
| **Space** | O(n) | HashMap can store up to n different prefix sums |

**Practical Performance:**
- For `n = 20,000`: Only 20,000 operations (vs 400 million for O(n²))
- This is a **20,000x speedup** over the improved approach!

---

## Interview-Ready Explanation

> **(60-90 second verbal explanation)**
>
> "This problem asks us to count subarrays with sum equal to k. The key insight is using prefix sums with a HashMap.
>
> The sum of any subarray from index j+1 to i equals prefixSum[i] minus prefixSum[j]. So if we want that difference to be k, we're looking for a previous prefix sum equal to currentPrefixSum minus k.
>
> I use a HashMap to store the frequency of each prefix sum I've seen so far. As I iterate through the array, I maintain a running prefix sum. At each position, I check how many times I've seen a prefix sum equal to currentSum minus k — that's how many valid subarrays end at this position.
>
> I initialize the map with {0: 1} to handle subarrays starting from index 0. After checking, I add the current prefix sum to the map.
>
> This works even with negative numbers because I'm not using a sliding window — I'm just counting prefix sum occurrences. Time complexity is O(n) with one pass, and space is O(n) for the HashMap."

---

## Visual Diagram

### Prefix Sum Concept

```
Array:         [1,    2,    3]
Index:          0     1     2
                
Prefix Sum:     1     3     6
                ↑     ↑     ↑
              sum   sum   sum
             [0:0] [0:1] [0:2]

Subarray sum from index 1 to 2:
= prefixSum[2] - prefixSum[0]
= 6 - 1 = 5 ✓ (which is 2 + 3)
```

### HashMap Approach Visualization

```
nums = [1, 2, 3], k = 3

Step-by-step:

Index 0: num = 1
┌─────────────────────────────────────────────┐
│ currentSum = 1                              │
│ Looking for: 1 - 3 = -2                     │
│ HashMap: {0: 1} → -2 not found              │
│ Update: {0: 1, 1: 1}                        │
│ count = 0                                   │
└─────────────────────────────────────────────┘

Index 1: num = 2
┌─────────────────────────────────────────────┐
│ currentSum = 3                              │
│ Looking for: 3 - 3 = 0                      │
│ HashMap: {0: 1, 1: 1} → 0 found! (count=1)  │
│ → Subarray [0...1] = [1,2] sums to 3 ✓     │
│ Update: {0: 1, 1: 1, 3: 1}                  │
│ count = 1                                   │
└─────────────────────────────────────────────┘

Index 2: num = 3
┌─────────────────────────────────────────────┐
│ currentSum = 6                              │
│ Looking for: 6 - 3 = 3                      │
│ HashMap: {0:1, 1:1, 3:1} → 3 found! (cnt=1) │
│ → Subarray [2...2] = [3] sums to 3 ✓       │
│ Update: {0: 1, 1: 1, 3: 1, 6: 1}            │
│ count = 2                                   │
└─────────────────────────────────────────────┘

Final Answer: 2
```

### Why We Need {0: 1} Initialization

```
nums = [3], k = 3

Without {0: 1}:
- currentSum = 3
- Looking for: 3 - 3 = 0
- HashMap: {} → 0 not found!
- count = 0 ❌ WRONG!

With {0: 1}:
- currentSum = 3
- Looking for: 3 - 3 = 0
- HashMap: {0: 1} → 0 found!
- count = 1 ✓ CORRECT!

The "empty prefix" with sum 0 represents 
the start before any elements.
```

---

## Summary Comparison

| Approach | Time | Space | Key Insight |
|----------|------|-------|-------------|
| Brute Force (3 loops) | O(n³) | O(1) | Check all subarrays, recalculate sums |
| Prefix Sum (2 loops) | O(n²) | O(1) | Running sum eliminates inner loop |
| **HashMap + Prefix Sum** | **O(n)** | **O(n)** | **Count prefix sum occurrences** |

---

## Edge Cases Checklist

| Edge Case | Input | Expected | Notes |
|-----------|-------|----------|-------|
| Single element = k | `[5], k=5` | `1` | Element itself is subarray |
| Single element ≠ k | `[5], k=3` | `0` | No valid subarray |
| All same elements | `[2,2,2], k=4` | `2` | [2,2] at indices 0-1 and 1-2 |
| Contains zero | `[1,0,1], k=1` | `3` | [1], [1,0], [0,1], [1] |
| Negative numbers | `[1,-1,0], k=0` | `3` | [1,-1], [-1,0,1 extra], [0], [1,-1,0] |
| k = 0 | `[1,-1,2,-2], k=0` | `3` | Multiple zero-sum subarrays |
| Large negative k | `[-1,-1,-1], k=-2` | `2` | Two subarrays of two -1s |
| Entire array | `[1,2], k=3` | `1` | Whole array sums to k |

---

## Common Mistakes

1. **Forgetting `{0: 1}` initialization**
   - Misses subarrays starting from index 0

2. **Using sliding window**
   - Doesn't work with negative numbers
   - Sum can decrease even as window expands

3. **Updating map before checking**
   - Would count the same element twice
   - Must check first, then update

4. **Not handling negative prefix sums**
   - HashMap keys can be negative — that's fine!

---

## Complete Solution (Copy-Paste Ready)

```javascript
/**
 * 560. Subarray Sum Equals K
 * 
 * @param {number[]} nums - Array of integers
 * @param {number} k - Target sum
 * @return {number} - Count of subarrays with sum = k
 * 
 * Time Complexity: O(n)
 * Space Complexity: O(n)
 */
var subarraySum = function(nums, k) {
    let count = 0;
    let currentSum = 0;
    const prefixSumCount = new Map();
    
    // Empty prefix with sum 0 exists once
    prefixSumCount.set(0, 1);
    
    for (const num of nums) {
        currentSum += num;
        
        // Count subarrays ending here with sum = k
        const target = currentSum - k;
        if (prefixSumCount.has(target)) {
            count += prefixSumCount.get(target);
        }
        
        // Record this prefix sum
        prefixSumCount.set(
            currentSum,
            (prefixSumCount.get(currentSum) || 0) + 1
        );
    }
    
    return count;
};
```

---

## Related Problems

| Problem | Similarity |
|---------|------------|
| 523. Continuous Subarray Sum | Prefix sum + modulo |
| 974. Subarray Sums Divisible by K | Prefix sum mod k |
| 325. Maximum Size Subarray Sum Equals k | Find longest, not count |
| 862. Shortest Subarray with Sum at Least K | Monotonic deque |
| 1. Two Sum | Same HashMap pattern |
