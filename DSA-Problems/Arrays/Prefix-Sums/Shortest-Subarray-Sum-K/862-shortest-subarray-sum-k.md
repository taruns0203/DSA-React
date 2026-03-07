# 862. Shortest Subarray with Sum at Least K

---

## High-Level Interpretation

Given an integer array `nums` (which **can contain negatives**) and a positive integer `k`, find the **shortest contiguous subarray** whose sum is **≥ k**. Return its length, or −1 if no such subarray exists.

**Hidden traps:**
- **Negative numbers** make this drastically harder than the positive-only version (LeetCode 209). With negatives, the sliding window technique breaks because shrinking the window doesn't guarantee the sum decreases.
- **Very large k** (up to 10⁹) means we need to handle potential overshoots and long prefixes.
- The answer could be a single element (if `nums[i] ≥ k`).
- Elements range to ±10⁵ with array length up to 10⁵, so prefix sums can reach ~10¹⁰ — use regular JS numbers (safe up to ~9×10¹⁵).
- Off-by-one: the subarray from index `j+1` to `i` has length `i − j`, not `i − j + 1`.

---

## 1. Brute-Force Approach — Try Every Subarray

### 1.1 Idea

Enumerate every pair `(i, j)` with `i ≤ j`, compute the subarray sum, and if it's ≥ k, track the minimum length.

### 1.2 Pseudocode

```
function shortestSubarray(nums, k):
    n = nums.length
    minLen = Infinity

    for i from 0 to n-1:
        sum = 0
        for j from i to n-1:
            sum += nums[j]
            if sum >= k:
                minLen = min(minLen, j - i + 1)
                break   // extending further only makes it longer

    return minLen == Infinity ? -1 : minLen
```

### 1.3 JavaScript

```javascript
var shortestSubarray = function(nums, k) {
    const n = nums.length;
    let minLen = Infinity;

    for (let i = 0; i < n; i++) {
        let sum = 0;
        for (let j = i; j < n; j++) {
            sum += nums[j];
            if (sum >= k) {
                minLen = Math.min(minLen, j - i + 1);
                break;
            }
        }
    }

    return minLen === Infinity ? -1 : minLen;
};
```

### 1.4 Complexity

| Metric | Value | Derivation |
|---|---|---|
| **Time** | O(n²) | Two nested loops. The `break` helps on average but worst case is still O(n²). |
| **Space** | O(1) | Only a few variables. |

### 1.5 Dry Run — `nums = [1], k = 1`

| i | j | sum | sum ≥ 1? | minLen |
|---|---|---|---|---|
| 0 | 0 | 1 | ✅ | **1** |

**Result: `1`** ✅

### 1.6 Dry Run — `nums = [1, 2], k = 4`

| i | j | sum | sum ≥ 4? | minLen |
|---|---|---|---|---|
| 0 | 0 | 1 | ❌ | ∞ |
| 0 | 1 | 3 | ❌ | ∞ |
| 1 | 1 | 2 | ❌ | ∞ |

**Result: `-1`** ✅

### 1.7 Why This Fails

⚠️ **Important:** The `break` optimisation above is **wrong** when negatives exist! Consider `nums = [2, -1, 2]` with `k = 3`. Starting at `i=0`: sum at `j=0` is 2 (no), `j=1` is 1 (no), `j=2` is 3 (yes, len=3). But there's no shorter. The break is fine here, but consider `nums = [84, -37, 32, 40, 95]`, `k = 167` — if we break early at a long subarray, we might miss that a later prefix sum dip + recovery gives a shorter one. The fundamental issue: **with negatives, reaching sum ≥ k early doesn't mean all shorter subarrays have been considered** (they could have negative middle portions). Correct brute force should NOT break (removing the break makes it truly O(n²)). Either way, O(n²) is too slow for n = 10⁵.

---

## 2. Improved Approach — Prefix Sums + Sorted Search

### 2.1 Key Insight

Define prefix sums: `P[0] = 0`, `P[i] = nums[0] + nums[1] + ... + nums[i-1]`.

The sum of subarray `[j, i-1]` = `P[i] − P[j]`.

We want: `P[i] − P[j] ≥ k`, i.e., `P[j] ≤ P[i] − k`, with `j < i`, minimising `i − j`.

**Idea:** For each `i`, binary search for the largest `j < i` such that `P[j] ≤ P[i] − k`. But this requires `P[j]` values to be **sorted**, which they aren't when negatives exist.

We can use a balanced BST / sorted structure to maintain the prefix sums we've seen, and for each new `P[i]`, query for entries ≤ `P[i] − k`.

### 2.2 Pseudocode

```
function shortestSubarray(nums, k):
    n = nums.length
    P = prefix sums array of length n+1 (P[0] = 0)
    minLen = Infinity

    // Use a sorted structure (e.g., TreeMap) storing (prefixSum → index)
    sortedPrefixSums = new SortedSet/TreeMap

    for i from 0 to n:
        target = P[i] - k
        // Find all j's in sortedPrefixSums where P[j] <= target
        // Among those, we want the LARGEST j (closest to i) to minimise length
        // That means: find the entry with max index among those with value <= target

        // Actually: we want the max j such that P[j] <= P[i] - k
        // We need to query all entries <= target and find nearest to i

        // Simpler: for each j in sorted set where P[j] <= target, len = i - j
        // We want min len, so max j.

        // Insert P[i] with index i into sorted structure
        sortedPrefixSums.insert(P[i], i)

    return minLen == Infinity ? -1 : minLen
```

### 2.3 Complexity

| Metric | Value |
|---|---|
| **Time** | O(n log n) — each insert/query on balanced BST is O(log n). |
| **Space** | O(n) — for the sorted structure. |

### 2.4 Trade-offs

This O(n log n) approach works but is **complex to implement correctly** (need a balanced BST that supports range queries with max-index tracking). In JavaScript, there's no built-in TreeMap. This is an intermediate stepping stone — the optimal approach avoids the log factor entirely.

---

## 3. Optimal Approach — Prefix Sum + Monotonic Deque

### 3.1 The Core Intuition

We have prefix sums `P[0..n]` where `P[0] = 0` and `P[i] = P[i-1] + nums[i-1]`.

For each index `i`, we want the **largest** `j < i` such that `P[j] ≤ P[i] − k` (this means `sum(j..i-1) ≥ k`).

**Two key observations:**

1. **If `P[j1] ≥ P[j2]` and `j1 < j2`:** Then `j1` is **useless** — any `i` for which `P[j1] ≤ P[i] − k` would also have `P[j2] ≤ P[i] − k`, and `j2` gives a **shorter** subarray (since `j2 > j1`, so `i - j2 < i - j1`). So we only need to keep prefix sums that are **strictly increasing** from left to right → **monotonic increasing deque of indices**.

2. **Once a `j` satisfies `P[j] ≤ P[i] − k`:** We can **pop `j`** from the front because no future `i' > i` could use `j` for a shorter subarray (since `i' - j > i - j`).

These two observations give us a **monotonic deque** algorithm:

### 3.2 Algorithm

```
1. Compute prefix sums P[0..n].
2. Maintain a deque of indices into P, kept in increasing order of P-values.
3. For each i from 0 to n:
   a. POP FRONT: While deque is non-empty and P[i] - P[deque.front] >= k:
      - Record length i - deque.front, update minLen.
      - Pop front (this j is consumed — no future i can do better).
   b. POP BACK: While deque is non-empty and P[i] <= P[deque.back]:
      - Pop back (deque.back is now useless — dominated by i).
   c. Push i to back of deque.
4. Return minLen or -1.
```

### 3.3 Pseudocode

```
function shortestSubarray(nums, k):
    n = nums.length
    P = new Array(n + 1)
    P[0] = 0
    for i from 1 to n:
        P[i] = P[i-1] + nums[i-1]

    minLen = Infinity
    deque = []   // stores indices into P, with P-values increasing

    for i from 0 to n:
        // Pop front: while front gives sum >= k, record and pop
        while deque not empty AND P[i] - P[deque.front] >= k:
            minLen = min(minLen, i - deque.popFront())

        // Pop back: maintain increasing property
        while deque not empty AND P[i] <= P[deque.back]:
            deque.popBack()

        deque.pushBack(i)

    return minLen == Infinity ? -1 : minLen
```

### 3.4 JavaScript

```javascript
/**
 * 862. Shortest Subarray with Sum at Least K
 * Optimal: Prefix Sum + Monotonic Deque
 *
 * @param {number[]} nums
 * @param {number} k
 * @return {number}
 */
var shortestSubarray = function(nums, k) {
    const n = nums.length;

    // Build prefix sums
    const P = new Array(n + 1);
    P[0] = 0;
    for (let i = 1; i <= n; i++) {
        P[i] = P[i - 1] + nums[i - 1];
    }

    let minLen = Infinity;

    // Monotonic deque (increasing P-values), stores indices into P
    const deque = [];
    let head = 0; // deque front pointer (for O(1) pop front)

    for (let i = 0; i <= n; i++) {
        // Pop front: while P[i] - P[front] >= k → valid subarray
        while (head < deque.length && P[i] - P[deque[head]] >= k) {
            minLen = Math.min(minLen, i - deque[head]);
            head++;
        }

        // Pop back: maintain monotonic increasing P-values
        while (deque.length > head && P[i] <= P[deque[deque.length - 1]]) {
            deque.pop();
        }

        deque.push(i);
    }

    return minLen === Infinity ? -1 : minLen;
};
```

### 3.5 Correctness Proof

**Claim:** The algorithm finds the shortest subarray with sum ≥ k.

**Why popping from the front is safe (Observation 2):**
When we pop index `j` from the front because `P[i] − P[j] ≥ k`, any future `i' > i` would give `i' − j > i − j`. So `j` cannot contribute to a shorter answer. It's safe to discard.

**Why popping from the back is safe (Observation 1):**
If `P[i] ≤ P[deque.back]` for some index at the back, then `deque.back` is dominated:
- For any future `i'`, if `P[deque.back] ≤ P[i'] − k`, then `P[i] ≤ P[i'] − k` too.
- And `i > deque.back`, so `i' − i < i' − deque.back` (shorter subarray).
- Thus `deque.back` can never produce a better answer than `i`. Safe to remove.

**Invariant:** The deque always contains indices in increasing order with strictly increasing P-values. Every valid `(j, i)` pair where j would give the minimum length is considered before j is discarded. ∎

### 3.6 Dry Run — `nums = [2, -1, 2], k = 3`

**Prefix sums:** `P = [0, 2, 1, 3]`

| i | P[i] | Pop front? | Pop back? | Deque (indices) | Deque P-values | minLen |
|---|---|---|---|---|---|---|
| 0 | 0 | — | — | [0] | [0] | ∞ |
| 1 | 2 | P[1]−P[0]=2 < 3 → no | P[1]=2 > P[0]=0 → no | [0, 1] | [0, 2] | ∞ |
| 2 | 1 | P[2]−P[0]=1 < 3 → no | P[2]=1 ≤ P[1]=2 → pop 1 | [0, 2] | [0, 1] | ∞ |
| 3 | 3 | P[3]−P[0]=3 ≥ 3 → **yes!** len=3−0=3, pop 0 | P[3]−P[2]=2 < 3 → stop | [2, 3] | [1, 3] | **3** |
|   |   | P[3]−P[2]=2 < 3 → stop |  |  |  |  |

**Result: `3`** ✅ — subarray `[2, -1, 2]` has sum 3.

### 3.7 Dry Run — `nums = [1], k = 1`

**Prefix sums:** `P = [0, 1]`

| i | P[i] | Pop front? | Pop back? | Deque | minLen |
|---|---|---|---|---|---|
| 0 | 0 | — | — | [0] | ∞ |
| 1 | 1 | P[1]−P[0]=1 ≥ 1 → **yes!** len=1, pop 0 | — | [1] | **1** |

**Result: `1`** ✅

### 3.8 Dry Run — `nums = [1, 2], k = 4`

**Prefix sums:** `P = [0, 1, 3]`

| i | P[i] | Pop front? | Pop back? | Deque | minLen |
|---|---|---|---|---|---|
| 0 | 0 | — | — | [0] | ∞ |
| 1 | 1 | 1−0=1 < 4 → no | 1 > 0 → no | [0, 1] | ∞ |
| 2 | 3 | 3−0=3 < 4 → no | 3 > 1 → no | [0, 1, 2] | ∞ |

**Result: `-1`** ✅

### 3.9 Dry Run — `nums = [84, -37, 32, 40, 95], k = 167`

**Prefix sums:** `P = [0, 84, 47, 79, 119, 214]`

| i | P[i] | Pop front (P[i]−P[front] ≥ 167?) | Pop back (P[i] ≤ P[back]?) | Deque (idx) | Deque P-vals | minLen |
|---|---|---|---|---|---|---|
| 0 | 0 | — | — | [0] | [0] | ∞ |
| 1 | 84 | 84−0=84 < 167 → no | 84>0 → no | [0,1] | [0,84] | ∞ |
| 2 | 47 | 47−0=47 < 167 → no | 47≤84 → pop 1 | [0,2] | [0,47] | ∞ |
| 3 | 79 | 79−0=79 < 167 → no | 79>47 → no | [0,2,3] | [0,47,79] | ∞ |
| 4 | 119 | 119−0=119 < 167 → no | 119>79 → no | [0,2,3,4] | [0,47,79,119] | ∞ |
| 5 | 214 | 214−0=214 ≥ 167 → **yes!** len=5−0=5, pop 0 | — | [2,3,4,5] | [47,79,119,214] | **5** |
|   |   | 214−47=167 ≥ 167 → **yes!** len=5−2=3, pop 2 | |  |  | **3** |
|   |   | 214−79=135 < 167 → stop | 214>119 → no | [3,4,5] | [79,119,214] | 3 |

**Result: `3`** ✅ — subarray `[32, 40, 95]` (indices 2–4) has sum 167.

### 3.10 Complexity

| Metric | Value | Notes |
|---|---|---|
| **Time** | **O(n)** | Each index enters and leaves the deque at most once → total operations = 2n. |
| **Space** | **O(n)** | Prefix sum array + deque, each up to n+1 entries. |

**Practical performance:** Handles n = 10⁵ in milliseconds. The deque operations are cache-friendly. This is the fastest known approach.

---

## 4. Approach Comparison

| Approach | Time | Space | Handles Negatives? | Key Structure |
|---|---|---|---|---|
| Brute force | O(n²) | O(1) | ✅ (if no early break) | Nested loops |
| Prefix + BST | O(n log n) | O(n) | ✅ | Balanced BST |
| Sliding window | O(n) | O(1) | ❌ Positive-only | Two pointers |
| **Prefix + Mono Deque** ⭐ | **O(n)** | **O(n)** | **✅** | **Monotonic deque** |

---

## 5. Interview-Ready Explanation (60–90 seconds)

> *"This problem asks for the shortest subarray with sum at least k, and the array can contain negative numbers, which rules out a simple sliding window.*
>
> *I use prefix sums: P[i] = sum of the first i elements. Then the sum of subarray from j to i−1 is P[i] − P[j]. I need P[i] − P[j] ≥ k with i − j minimised.*
>
> *I maintain a monotonic deque of indices into the prefix sum array, keeping them in increasing order of P-values. Two key operations:*
>
> *First, at the front: while P[i] − P[front] ≥ k, I record the length and pop the front — that index can never give a shorter answer for any future i.*
>
> *Second, at the back: if P[i] is less than or equal to P[back], I pop the back — it's dominated by i, which has a higher index and equal-or-smaller prefix sum.*
>
> *Each index enters and exits the deque at most once, so the total time is O(n). Space is O(n) for the prefix sums and the deque."*

---

## 6. Visual Diagram

```
nums:          [84,  -37,   32,   40,   95]
               idx 0  idx 1  idx 2  idx 3  idx 4

Prefix sums P: [0,    84,    47,    79,   119,   214]
               P[0]  P[1]   P[2]   P[3]  P[4]   P[5]

Monotonic Deque evolution (stores indices, kept increasing by P-value):

i=0: push 0          deque = [0]           P-vals: [0]
i=1: push 1          deque = [0, 1]        P-vals: [0, 84]
i=2: P[2]=47 ≤ P[1]=84 → pop back (1)
     push 2          deque = [0, 2]        P-vals: [0, 47]
i=3: push 3          deque = [0, 2, 3]     P-vals: [0, 47, 79]
i=4: push 4          deque = [0, 2, 3, 4]  P-vals: [0, 47, 79, 119]
i=5: P[5]-P[0]=214 ≥ 167 → pop front (0)! len=5  minLen=5
     P[5]-P[2]=167 ≥ 167 → pop front (2)! len=3  minLen=3
     P[5]-P[3]=135 < 167 → stop
     push 5          deque = [3, 4, 5]     P-vals: [79, 119, 214]

Answer: 3 (subarray indices 2..4 = [32, 40, 95], sum = 167)

Why pop BACK works (Observation 1):
  When P[2]=47 ≤ P[1]=84, index 1 is dominated by index 2:
  ┌────────────────────────────────────────────┐
  │  For any future i:                         │
  │  If P[1]=84 ≤ P[i]-k  (1 qualifies)       │
  │  Then P[2]=47 ≤ P[i]-k too  (2 qualifies) │
  │  And i-2 < i-1  (2 gives shorter answer)  │
  │  So index 1 is useless. Pop it.            │
  └────────────────────────────────────────────┘

Why pop FRONT works (Observation 2):
  Once P[5]-P[0] ≥ k, any future i'>5 would give i'-0 > 5-0.
  So index 0 can never give a shorter answer. Pop it.
```

---

## 7. Edge Cases

| Case | Input | Expected | Notes |
|---|---|---|---|
| Single element ≥ k | `[5], k=5` | 1 | The element itself |
| Single element < k | `[3], k=5` | −1 | Not enough |
| All negatives | `[-1,-2], k=1` | −1 | Impossible |
| Large negative then large positive | `[-100, 200], k=150` | 1 | `[200]` alone suffices |
| Sum equals k exactly | `[1,2,3], k=6` | 3 | Whole array |
| Negative in middle | `[2,-1,2], k=3` | 3 | Must take all three |

---

## 8. Common Mistakes

1. **Using sliding window:** Doesn't work with negatives — shrinking the window can increase the sum.
2. **Forgetting `P[0] = 0`:** The empty prefix is critical; without it, subarrays starting at index 0 are missed.
3. **Not popping the back of the deque:** Without this, the deque isn't monotonic and correctness breaks.
4. **Using a regular array for deque with shift():** `Array.shift()` in JS is O(n). Use a head pointer instead for O(1) front pops.
5. **Off-by-one in subarray mapping:** `P[i] − P[j]` = sum of `nums[j..i-1]`, length = `i − j`.
