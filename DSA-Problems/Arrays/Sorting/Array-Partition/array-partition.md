# 561. Array Partition — Complete Problem Breakdown

## 1. High-Level Interpretation

**What the problem is asking:** Given `2n` integers, you must form `n` pairs. For each pair, you take the *minimum* of the two values. Your goal is to maximize the *sum* of all these minimums.

**Why it matters:** This problem tests your ability to recognize that **pairing strategy matters**. When you pair two numbers, the larger one is "wasted" (not counted). The challenge is figuring out how to minimize this waste across all pairs.

**Hidden traps to watch for:**
- **Negative numbers:** Values range from `-10⁴` to `10⁴`. Your solution must handle negatives correctly.
- **Duplicates:** The array can have repeated values (see Example 2 with two 6s and two 2s).
- **Even-length guarantee:** The array always has `2n` elements, so you don't need to handle odd-length cases.
- **The "waste" insight:** Many people miss that this is fundamentally about minimizing what you *lose*, not directly maximizing what you *gain*.

---

## 2. Brute-Force Approach

### 2.1 The Idea in Plain Words

Try **every possible way** to pair the numbers. For each pairing configuration:
1. Calculate the sum of minimums
2. Track the maximum sum seen

This is essentially generating all permutations and grouping consecutive elements into pairs.

### 2.2 Pseudocode

```
function arrayPairSumBruteForce(nums):
    maxSum = -infinity
    
    for each permutation P of nums:
        currentSum = 0
        for i = 0 to length(P) - 1, step by 2:
            currentSum += min(P[i], P[i+1])
        maxSum = max(maxSum, currentSum)
    
    return maxSum
```

### 2.3 Time & Space Complexity

| Complexity | Value | Derivation |
|------------|-------|------------|
| **Time** | O((2n)! × n) | There are `(2n)!` permutations. For each permutation, we iterate through `n` pairs to compute the sum. |
| **Space** | O(n) | We need space to store one permutation at a time (recursion stack or explicit array). |

**Why this is terrible:** For `n = 10⁴`, we have `2n = 20,000` elements. `20,000!` is astronomically large—way beyond any computation possible in the universe's lifetime.

### 2.4 Dry Run: nums = [1, 4, 3, 2]

Let's trace through unique pairings (not all permutations, but the distinct pair groupings):

| Step | Pairing | Calculation | Sum |
|------|---------|-------------|-----|
| 1 | (1,4), (3,2) | min(1,4) + min(3,2) = 1 + 2 | **3** |
| 2 | (1,3), (4,2) | min(1,3) + min(4,2) = 1 + 2 | **3** |
| 3 | (1,2), (4,3) | min(1,2) + min(4,3) = 1 + 3 | **4** ✓ |

**Maximum sum found: 4**

### 2.5 Why This Fails

The constraint says `n` can be up to `10⁴`, meaning arrays up to 20,000 elements. The brute-force generates a factorial number of configurations—completely infeasible. We need a **polynomial-time** solution.

---

## 3. Insight: The "Waste Minimization" Perspective

Before jumping to the optimal solution, let's build intuition.

### The Key Observation

When you pair numbers `a` and `b` where `a ≤ b`:
- You **keep**: `a` (the minimum)
- You **waste**: `b - a` (the difference that's "lost")

**Goal reframed:** Minimize total waste across all pairs.

### What Minimizes Waste?

Pair numbers that are **as close as possible** in value!

```
Example: [1, 2, 3, 4]

Pairing (1,4) and (2,3):
  - Waste from (1,4): 4-1 = 3
  - Waste from (2,3): 3-2 = 1
  - Total waste: 4

Pairing (1,2) and (3,4):
  - Waste from (1,2): 2-1 = 1
  - Waste from (3,4): 4-3 = 1
  - Total waste: 2  ← BETTER!
```

### The Sorting Insight

If we **sort** the array and pair **adjacent elements**, we guarantee minimum waste because sorted adjacent elements have the smallest possible differences.

---

## 4. Optimal Approach: Sorting

### 4.1 Intuition

1. **Sort** the array in ascending order
2. After sorting, pair element at index 0 with index 1, index 2 with index 3, etc.
3. In each pair `(nums[2i], nums[2i+1])`, the minimum is always `nums[2i]` (the smaller, even-indexed element)
4. **Sum all even-indexed elements**

### 4.2 Why This Is Correct (Proof)

**Claim:** Sorting and taking every other element (starting from index 0) gives the maximum sum of minimums.

**Proof by exchange argument:**

1. Let the sorted array be `[a₀, a₁, a₂, a₃, ..., a₂ₙ₋₁]` where `a₀ ≤ a₁ ≤ ... ≤ a₂ₙ₋₁`

2. **Observation:** `a₀` (the smallest element) MUST be a minimum in its pair regardless of what it's paired with. So we lose nothing by pairing it with `a₁` (second smallest).

3. **After removing** `a₀` and `a₁`, we have a subproblem with `2(n-1)` elements. By induction, the same logic applies: pair `a₂` with `a₃`, and so on.

4. **Invariant:** At each step, we pair the two smallest remaining elements. The smaller one contributes to our sum, and we "waste" only the minimal possible amount.

**Alternative view (greedy stays ahead):** Any deviation from sorted-adjacent pairing would pair a small element with a larger element, increasing waste.

### 4.3 Pseudocode

```
function arrayPairSum(nums):
    sort(nums)               // ascending order
    sum = 0
    for i = 0 to length(nums) - 1, step by 2:
        sum += nums[i]       // add every even-indexed element
    return sum
```

### 4.4 JavaScript Implementation

```javascript
/**
 * @param {number[]} nums
 * @return {number}
 */
function arrayPairSum(nums) {
    // Step 1: Sort the array in ascending order
    nums.sort((a, b) => a - b);
    
    // Step 2: Sum elements at even indices (0, 2, 4, ...)
    let sum = 0;
    for (let i = 0; i < nums.length; i += 2) {
        sum += nums[i];
    }
    
    return sum;
}
```

**Cleaner one-liner (for reference):**

```javascript
function arrayPairSum(nums) {
    return nums
        .sort((a, b) => a - b)
        .filter((_, i) => i % 2 === 0)
        .reduce((sum, val) => sum + val, 0);
}
```

### 4.5 Dry Run: nums = [1, 4, 3, 2]

| Step | Action | Array State | Variables |
|------|--------|-------------|-----------|
| 0 | Initial | `[1, 4, 3, 2]` | `sum = 0` |
| 1 | Sort array | `[1, 2, 3, 4]` | `sum = 0` |
| 2 | i=0: add nums[0] | `[1, 2, 3, 4]` | `sum = 0 + 1 = 1` |
| 3 | i=2: add nums[2] | `[1, 2, 3, 4]` | `sum = 1 + 3 = 4` |
| 4 | i=4: exit loop | — | **return 4** |

**Pairs formed:** (1,2) and (3,4)  
**Mins:** 1 + 3 = **4** ✓

### 4.6 Dry Run: nums = [6, 2, 6, 5, 1, 2]

| Step | Action | Array State | Variables |
|------|--------|-------------|-----------|
| 0 | Initial | `[6, 2, 6, 5, 1, 2]` | `sum = 0` |
| 1 | Sort array | `[1, 2, 2, 5, 6, 6]` | `sum = 0` |
| 2 | i=0: add nums[0] | `[1, 2, 2, 5, 6, 6]` | `sum = 0 + 1 = 1` |
| 3 | i=2: add nums[2] | `[1, 2, 2, 5, 6, 6]` | `sum = 1 + 2 = 3` |
| 4 | i=4: add nums[4] | `[1, 2, 2, 5, 6, 6]` | `sum = 3 + 6 = 9` |
| 5 | i=6: exit loop | — | **return 9** |

**Pairs formed:** (1,2), (2,5), (6,6)  
**Mins:** 1 + 2 + 6 = **9** ✓

### 4.7 Time & Space Complexity

| Complexity | Value | Explanation |
|------------|-------|-------------|
| **Time** | O(n log n) | Dominated by sorting. The summation loop is O(n). |
| **Space** | O(1) or O(n) | Depends on sort implementation. In-place sorts use O(1) auxiliary space; JavaScript's `.sort()` may use O(n). |

**Practical performance:** Extremely fast. For `n = 10⁴` (array of 20,000 elements), sorting takes ~20,000 × log₂(20,000) ≈ 300,000 operations—trivial for modern CPUs.

---

## 5. Further Optimization: Counting Sort

### 5.1 When This Helps

The constraint `-10⁴ ≤ nums[i] ≤ 10⁴` means values span a **bounded range** of 20,001 integers. When the range is comparable to or smaller than `n log n`, **counting sort** beats comparison-based sorting.

### 5.2 The Idea

1. Create a frequency array of size 20,001 (indices represent values -10,000 to +10,000)
2. Iterate through frequencies in ascending order
3. For each value, "assign" elements to pairs, summing every other one

### 5.3 JavaScript Implementation

```javascript
function arrayPairSum(nums) {
    const OFFSET = 10000;  // Shift range [-10000, 10000] to [0, 20000]
    const count = new Array(20001).fill(0);
    
    // Count frequencies
    for (const num of nums) {
        count[num + OFFSET]++;
    }
    
    let sum = 0;
    let needPair = false;  // Are we looking for the second element of a pair?
    
    // Iterate through all possible values in sorted order
    for (let val = -10000; val <= 10000; val++) {
        const freq = count[val + OFFSET];
        
        if (freq === 0) continue;
        
        // How many of this value contribute to the sum?
        // If needPair is false, positions 0, 2, 4... contribute
        // If needPair is true, positions 1, 3, 5... contribute
        
        if (!needPair) {
            // We start fresh: add ceil(freq / 2) of this value
            sum += val * Math.ceil(freq / 2);
        } else {
            // We need to complete a pair first (skip one), then add
            sum += val * Math.floor(freq / 2);
        }
        
        // Update needPair: odd frequency toggles the state
        if (freq % 2 === 1) {
            needPair = !needPair;
        }
    }
    
    return sum;
}
```

### 5.4 Dry Run: nums = [1, 4, 3, 2]

**Step 1: Build frequency array**

| Value | -10000 ... 0 | 1 | 2 | 3 | 4 | 5 ... 10000 |
|-------|--------------|---|---|---|---|--------------|
| Count | 0 | 1 | 1 | 1 | 1 | 0 |

**Step 2: Iterate through values**

| val | freq | needPair (before) | Contribution | sum | needPair (after) |
|-----|------|-------------------|--------------|-----|------------------|
| 1 | 1 | false | ceil(1/2) × 1 = 1 | 1 | true |
| 2 | 1 | true | floor(1/2) × 2 = 0 | 1 | false |
| 3 | 1 | false | ceil(1/2) × 3 = 3 | 4 | true |
| 4 | 1 | true | floor(1/2) × 4 = 0 | 4 | false |

**Return: 4** ✓

### 5.5 Time & Space Complexity

| Complexity | Value | Explanation |
|------------|-------|-------------|
| **Time** | O(n + k) | O(n) to count, O(k) to iterate range. Here k = 20,001. |
| **Space** | O(k) | The frequency array of size 20,001. |

**Trade-off:** Uses more space (20KB for the array) but achieves O(n) time when `k < n log n`.

For `n = 10,000`: n log n ≈ 130,000, but k = 20,001. So counting sort is faster.  
For smaller n, the overhead of the 20,001-element array may not be worth it.

---

## 6. Visual Diagram: How Sorting Minimizes Waste

```
Original array:  [1, 4, 3, 2]

                 ┌─────────────────────────────────────┐
                 │     Visualizing Pairing Options     │
                 └─────────────────────────────────────┘

Option A: Pair (1,4) and (2,3)
  
  1 ─────────────────────● 4     │ min = 1, waste = 3
                                 │
  2 ───────● 3                   │ min = 2, waste = 1
                                 │
  Total waste: 4                 │ Sum of mins: 3
  ═══════════════════════════════╪═══════════════════════


Option B: Pair (1,2) and (3,4)   [SORTED ADJACENT]
  
  1 ─● 2                         │ min = 1, waste = 1
                                 │
  3 ─● 4                         │ min = 3, waste = 1
                                 │
  Total waste: 2                 │ Sum of mins: 4  ← MAXIMUM!
  ═══════════════════════════════╪═══════════════════════

┌─────────────────────────────────────────────────────────┐
│  KEY INSIGHT: Shorter lines = less waste = higher sum   │
│  Sorting guarantees adjacent elements are closest!      │
└─────────────────────────────────────────────────────────┘
```

---

## 7. Interview-Ready Explanation (60-90 seconds)

> "This problem asks us to pair 2n numbers and maximize the sum of the minimum of each pair.
> 
> The key insight is that when we pair two numbers, we 'waste' the larger one—it doesn't contribute to our sum. So to maximize the sum of minimums, we need to minimize total waste.
> 
> How do we minimize waste? By pairing numbers that are close together in value. The closer two numbers are, the smaller the difference we lose.
> 
> This leads to a simple greedy approach: sort the array, then pair adjacent elements. After sorting, element at index 0 pairs with index 1, index 2 pairs with index 3, and so on. In each pair, the minimum is always the even-indexed element.
> 
> So the algorithm is: sort the array, sum all even-indexed elements.
> 
> Time complexity is O(n log n) for sorting—the sum is just O(n). Space is O(1) if we sort in-place.
> 
> There's also an O(n) counting sort solution since values are bounded to ±10,000, but for most inputs the standard sorting approach is clean and efficient."

---

## 8. Summary Table

| Approach | Time | Space | When to Use |
|----------|------|-------|-------------|
| Brute Force | O((2n)! × n) | O(n) | Never (only for understanding) |
| **Sorting** | O(n log n) | O(1)* | **Default choice** |
| Counting Sort | O(n + k) | O(k) | When k (value range) is small |

*Depends on sort implementation

---

## 9. Common Mistakes to Avoid

1. **Forgetting the comparator in JavaScript sort:**
   ```javascript
   // WRONG: sorts lexicographically
   [10, 2, 1].sort()  // → [1, 10, 2]
   
   // CORRECT: numeric sort
   [10, 2, 1].sort((a, b) => a - b)  // → [1, 2, 10]
   ```

2. **Summing odd indices instead of even:**
   After sorting, even indices (0, 2, 4...) hold the minimums.

3. **Overcomplicating the pairing logic:**
   You don't need to explicitly create pairs—just sum every other element.

4. **Edge case with negatives:**
   The algorithm works identically; negatives sort correctly with `a - b`.

---

## 10. Related Problems

- **976. Largest Perimeter Triangle** — Also uses sorting with a greedy selection
- **455. Assign Cookies** — Greedy pairing after sorting
- **870. Advantage Shuffle** — Optimal pairing with sorting (more complex)