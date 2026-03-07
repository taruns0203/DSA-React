# 525. Contiguous Array

---

## High-Level Interpretation

Given a binary array (only 0s and 1s), find the **longest contiguous subarray** that has an **equal number of 0s and 1s**. For example, `[0,1,1,0]` is valid (two 0s, two 1s) but `[0,1,1]` is not (one 0, two 1s). The answer is the **length** of this longest subarray.

**Hidden traps:**
- The entire array might be the answer (e.g., `[0,1]`).
- Multiple equal-length valid subarrays can exist — we only need the length, not the subarray itself.
- The trick that makes this O(n) is **not** obvious: it involves replacing 0s with −1s and reducing the problem to "longest subarray with sum = 0" — essentially the same pattern as LeetCode 560 (Subarray Sum Equals K).
- Off-by-one errors are common when computing subarray length from index boundaries.

---

## 1. Brute-Force Approach — Check Every Subarray

### 1.1 Idea in Plain Words

Try every possible contiguous subarray. For each one, count the number of 0s and 1s. If they're equal, record the length. Return the maximum length found.

### 1.2 Pseudocode

```
function findMaxLength(nums):
    n = nums.length
    maxLen = 0

    for i from 0 to n-1:               // start index
        zeros = 0
        ones  = 0
        for j from i to n-1:           // end index
            if nums[j] == 0: zeros++
            else:             ones++
            if zeros == ones:
                maxLen = max(maxLen, j - i + 1)

    return maxLen
```

### 1.3 JavaScript

```javascript
var findMaxLength = function(nums) {
    const n = nums.length;
    let maxLen = 0;

    for (let i = 0; i < n; i++) {
        let zeros = 0, ones = 0;
        for (let j = i; j < n; j++) {
            if (nums[j] === 0) zeros++;
            else ones++;
            if (zeros === ones) {
                maxLen = Math.max(maxLen, j - i + 1);
            }
        }
    }

    return maxLen;
};
```

### 1.4 Time & Space Complexity

| Metric | Value | Derivation |
|---|---|---|
| **Time** | O(n²) | Two nested loops: for each of n starts, we scan up to n elements. Total = n(n+1)/2. |
| **Space** | O(1) | Only a few integer variables. |

### 1.5 Dry Run — Example 1: `nums = [0, 1]`

| i | j | nums[j] | zeros | ones | zeros==ones? | maxLen |
|---|---|---|---|---|---|---|
| 0 | 0 | 0 | 1 | 0 | ❌ | 0 |
| 0 | 1 | 1 | 1 | 1 | ✅ len=2 | **2** |
| 1 | 1 | 1 | 0 | 1 | ❌ | 2 |

**Result: `2`** ✅

### 1.6 Dry Run — Example 2: `nums = [0, 1, 0]`

| i | j | nums[j] | zeros | ones | zeros==ones? | maxLen |
|---|---|---|---|---|---|---|
| 0 | 0 | 0 | 1 | 0 | ❌ | 0 |
| 0 | 1 | 1 | 1 | 1 | ✅ len=2 | **2** |
| 0 | 2 | 0 | 2 | 1 | ❌ | 2 |
| 1 | 1 | 1 | 0 | 1 | ❌ | 2 |
| 1 | 2 | 0 | 1 | 1 | ✅ len=2 | 2 |
| 2 | 2 | 0 | 1 | 0 | ❌ | 2 |

**Result: `2`** ✅ — Both `[0,1]` (indices 0–1) and `[1,0]` (indices 1–2) work.

### 1.7 Why This Approach is Slow

With `n = 10⁵`, O(n²) = 10¹⁰ operations — **far too slow** (would take ~10 seconds). We need O(n).

---

## 2. Improved Approach — Transform to Sum Problem (Running Count)

### 2.1 The Key Insight: Replace 0 with −1

If we treat every `0` as `−1`, then:
- A subarray with equal 0s and 1s has **sum = 0** (the +1s and −1s cancel out).

**Example:** `[0, 1, 0, 1]` → `[-1, +1, -1, +1]` → sum = 0 ✓

This transforms the problem into: **"Find the longest subarray with sum = 0."**

We can now use a **running sum** (prefix sum). If `prefixSum[i] == prefixSum[j]` for some `i < j`, then `sum(i+1 to j) = 0`, meaning the subarray from index `i+1` to `j` has equal 0s and 1s.

### 2.2 Why Same Prefix Sum = Sum Zero?

```
prefixSum[j] - prefixSum[i] = 0
⟹ sum of elements from i+1 to j = 0
⟹ equal number of +1s and -1s in that range
⟹ equal number of 1s and 0s in the original array
```

**So the question becomes:** Find the two **farthest-apart** indices with the **same prefix sum**.

### 2.3 Pseudocode (Still O(n²) — intermediate step)

```
function findMaxLength(nums):
    n = nums.length
    maxLen = 0

    for i from 0 to n-1:
        runningSum = 0
        for j from i to n-1:
            runningSum += (nums[j] == 0 ? -1 : 1)
            if runningSum == 0:
                maxLen = max(maxLen, j - i + 1)

    return maxLen
```

### 2.4 JavaScript

```javascript
var findMaxLength = function(nums) {
    const n = nums.length;
    let maxLen = 0;

    for (let i = 0; i < n; i++) {
        let sum = 0;
        for (let j = i; j < n; j++) {
            sum += nums[j] === 0 ? -1 : 1;
            if (sum === 0) {
                maxLen = Math.max(maxLen, j - i + 1);
            }
        }
    }

    return maxLen;
};
```

### 2.5 Time & Space Complexity

| Metric | Value |
|---|---|
| **Time** | O(n²) — same as brute-force asymptotically |
| **Space** | O(1) |

**This approach isn't faster yet**, but the insight (transform 0→−1, find sum=0) is the stepping stone to the O(n) solution.

### 2.6 Trade-offs

The conceptual shift to "sum = 0 subarray" opens the door for the HashMap trick. By itself, this approach is still O(n²), but it simplifies the logic and sets up the optimal solution.

---

## 3. Optimal Approach — Prefix Sum + HashMap

### 3.1 Intuition

From the improved approach, we know:
- Replace 0 with −1.
- Find the longest subarray with sum = 0.
- `sum(i+1..j) = 0` iff `prefixSum[j] == prefixSum[i]`.

**Key idea:** As we compute the running prefix sum, store the **first time** we see each sum value in a HashMap. If we see the same sum again later, the subarray between those two indices has sum = 0. We want the **longest** such subarray, so we only store the **first** occurrence of each sum (never overwrite).

```
If prefixSum at index i == prefixSum at index j  (i < j)
Then subarray [i+1 ... j] has sum 0
Length = j - i
```

### 3.2 Why Store First Occurrence Only?

Because we want the **maximum** length. If a sum `s` first appeared at index 3, and appears again at indices 7 and 10:
- Using index 3: length = 10 − 3 = 7 ✅ (longest)
- Using index 7: length = 10 − 7 = 3 (shorter)

So we always keep the earliest index for each sum.

### 3.3 Why Initialize HashMap with `{0: −1}`?

The prefix sum before any element is 0 (the "empty prefix"). We set its index to −1 so that if the prefix sum returns to 0 at index `j`, the length is `j − (−1) = j + 1`, which correctly represents the subarray from index 0 to j.

### 3.4 Pseudocode

```
function findMaxLength(nums):
    maxLen = 0
    prefixSum = 0
    firstSeen = HashMap { 0: -1 }     // sum 0 first seen "before index 0"

    for i from 0 to nums.length - 1:
        prefixSum += (nums[i] == 0 ? -1 : 1)

        if prefixSum in firstSeen:
            length = i - firstSeen[prefixSum]
            maxLen = max(maxLen, length)
        else:
            firstSeen[prefixSum] = i    // store FIRST occurrence only

    return maxLen
```

### 3.5 JavaScript

```javascript
/**
 * 525. Contiguous Array
 * Optimal: Prefix Sum + HashMap
 *
 * @param {number[]} nums
 * @return {number}
 */
var findMaxLength = function(nums) {
    let maxLen = 0;
    let prefixSum = 0;
    const firstSeen = new Map();

    // "Empty prefix" has sum 0 at virtual index -1
    firstSeen.set(0, -1);

    for (let i = 0; i < nums.length; i++) {
        // Treat 0 as -1
        prefixSum += nums[i] === 0 ? -1 : 1;

        if (firstSeen.has(prefixSum)) {
            // Same sum seen before → subarray between has sum 0
            const length = i - firstSeen.get(prefixSum);
            maxLen = Math.max(maxLen, length);
        } else {
            // First time seeing this sum — record the index
            firstSeen.set(prefixSum, i);
        }
    }

    return maxLen;
};
```

### 3.6 Proof of Correctness

**Claim:** The algorithm returns the length of the longest subarray with equal 0s and 1s.

**Proof:**

1. **Transformation is valid:** Replacing 0→−1 means a subarray has equal 0s and 1s iff its sum is 0.

2. **Prefix sum property:** `sum(i+1..j) = prefixSum[j] − prefixSum[i]`. So `sum = 0` iff `prefixSum[j] == prefixSum[i]`.

3. **First-occurrence guarantee:** By storing only the first index for each prefix sum, we ensure `i` is as small as possible for any given `prefixSum[j]`, thus `j − i` is maximized.

4. **The `{0: −1}` initialization:** Correctly handles subarrays starting at index 0. If `prefixSum[j] = 0`, then the subarray `[0..j]` has sum 0 and length `j − (−1) = j + 1`.

5. **We check every index `j`:** So every possible ending position is considered.

6. **Invariant:** After processing index `i`, `firstSeen` contains the earliest index where each observed prefix sum value was first encountered, and `maxLen` is the longest valid subarray ending at or before index `i`. ∎

### 3.7 Dry Run — Example 1: `nums = [0, 1]`

| i | nums[i] | delta | prefixSum | In map? | Action | maxLen | firstSeen |
|---|---|---|---|---|---|---|---|
| — | — | — | 0 | — | Init | 0 | `{0: -1}` |
| 0 | 0 | −1 | −1 | No | Store −1→0 | 0 | `{0:-1, -1:0}` |
| 1 | 1 | +1 | 0 | Yes (idx −1) | len = 1−(−1) = 2 | **2** | `{0:-1, -1:0}` |

**Result: `2`** ✅ — The entire array `[0,1]` has equal 0s and 1s.

### 3.8 Dry Run — Example 2: `nums = [0, 1, 0]`

| i | nums[i] | delta | prefixSum | In map? | Action | maxLen | firstSeen |
|---|---|---|---|---|---|---|---|
| — | — | — | 0 | — | Init | 0 | `{0: -1}` |
| 0 | 0 | −1 | −1 | No | Store −1→0 | 0 | `{0:-1, -1:0}` |
| 1 | 1 | +1 | 0 | Yes (idx −1) | len = 1−(−1) = 2 | **2** | `{0:-1, -1:0}` |
| 2 | 0 | −1 | −1 | Yes (idx 0) | len = 2−0 = 2 | 2 | `{0:-1, -1:0}` |

**Result: `2`** ✅

Two valid subarrays of length 2: `[0,1]` (indices 0–1) and `[1,0]` (indices 1–2).

### 3.9 Dry Run — Longer Example: `nums = [0, 0, 1, 0, 0, 0, 1, 1]`

| i | nums[i] | delta | prefixSum | In map? | Action | maxLen | firstSeen (new entries) |
|---|---|---|---|---|---|---|---|
| — | — | — | 0 | — | Init | 0 | `{0:-1}` |
| 0 | 0 | −1 | −1 | No | Store | 0 | `{…, -1:0}` |
| 1 | 0 | −1 | −2 | No | Store | 0 | `{…, -2:1}` |
| 2 | 1 | +1 | −1 | Yes (idx 0) | len=2−0=2 | **2** | — |
| 3 | 0 | −1 | −2 | Yes (idx 1) | len=3−1=2 | 2 | — |
| 4 | 0 | −1 | −3 | No | Store | 2 | `{…, -3:4}` |
| 5 | 0 | −1 | −4 | No | Store | 2 | `{…, -4:5}` |
| 6 | 1 | +1 | −3 | Yes (idx 4) | len=6−4=2 | 2 | — |
| 7 | 1 | +1 | −2 | Yes (idx 1) | len=7−1=**6** | **6** | — |

**Result: `6`** ✅ — Subarray indices 2–7: `[1,0,0,0,1,1]` = three 0s, three 1s.

### 3.10 Time & Space Complexity

| Metric | Value | Notes |
|---|---|---|
| **Time** | **O(n)** | Single pass. HashMap get/set are O(1) amortized. |
| **Space** | **O(n)** | HashMap stores at most n+1 distinct prefix sums (range: −n to +n). |

**Practical performance:** Handles `n = 10⁵` easily in a few milliseconds. The HashMap will hold at most n+1 entries.

---

## 4. Approach Comparison

| Approach | Time | Space | Key Idea |
|---|---|---|---|
| Brute-force (count 0s/1s) | O(n²) | O(1) | Check every subarray |
| Running sum (0→−1) | O(n²) | O(1) | Transform to sum=0 problem |
| **Prefix Sum + HashMap** ⭐ | **O(n)** | **O(n)** | First occurrence of each prefix sum |

---

## 5. Interview-Ready Explanation (60–90 seconds)

> *"The key insight is to transform the problem: replace every 0 with −1. Now a subarray with equal 0s and 1s has sum exactly 0.*
>
> *I use a prefix sum as I scan left to right. If the prefix sum at index j equals the prefix sum at some earlier index i, then the subarray from i+1 to j has sum 0 — meaning equal 0s and 1s.*
>
> *To find the longest such subarray, I use a HashMap that stores the first index where each prefix sum value was seen. When I see the same sum again, I compute the length as current index minus the stored index. I only store the first occurrence because that gives the maximum length.*
>
> *I initialize the map with sum 0 at index −1 to handle cases where the valid subarray starts from index 0.*
>
> *Time complexity is O(n) — single pass with O(1) HashMap lookups. Space is O(n) for the HashMap."*

---

## 6. Visual Diagram

```
Original:     [ 0,   1,   0,   1,   0 ]
Transform:    [-1,  +1,  -1,  +1,  -1 ]

Prefix Sum:
Index:    -1    0    1    2    3    4
Sum:       0   -1    0   -1    0   -1
           ↑         ↑         ↑
           └─────────┴─────────┘
           Same sum 0 at indices -1, 1, 3
           Longest: index -1 to 3 → length 3-(-1) = 4

           Also: sum -1 at indices 0, 2, 4
                 Longest: index 0 to 4 → length 4-0 = 4

           Answer: 4 (subarray [1,0,1,0] or [0,1,0,1])

 How the HashMap works:
 ┌──────────────────────────────────────┐
 │  prefixSum     firstSeen[sum]        │
 │     0       →    -1                  │
 │    -1       →     0   ← stored first │
 │     0       → already at -1, skip    │
 │    -1       → already at 0, skip     │
 │     0       → already at -1, skip    │
 │    -1       → already at 0, skip     │
 │                                      │
 │  At i=4: sum=-1, firstSeen[-1]=0     │
 │  length = 4 - 0 = 4  ← ANSWER       │
 └──────────────────────────────────────┘
```

---

## 7. Edge Cases

| Case | Input | Expected | Notes |
|---|---|---|---|
| All zeros | `[0,0,0]` | 0 | No 1s → can't have equal count |
| All ones | `[1,1,1]` | 0 | No 0s → can't have equal count |
| Single element | `[0]` | 0 | Can't form a pair |
| Perfect balance | `[0,1]` | 2 | Entire array |
| Alternating | `[0,1,0,1]` | 4 | Entire array |
| Balance at end | `[1,1,1,0,0,0]` | 6 | Whole array: three 1s, three 0s |

---

## 8. Connection to Related Problems

| Problem | Relationship |
|---|---|
| 560. Subarray Sum Equals K | Same prefix-sum + HashMap pattern, but counts subarrays instead of max length |
| 930. Binary Subarrays With Sum | Counting subarrays with specific sum in binary array |
| 523. Continuous Subarray Sum | Prefix sum with modular arithmetic |
| 974. Subarray Sums Divisible by K | Prefix sum mod k + HashMap |

The "replace 0 with −1, then prefix sum + HashMap" trick is a **reusable pattern** that appears frequently in subarray problems involving binary or balanced conditions.
