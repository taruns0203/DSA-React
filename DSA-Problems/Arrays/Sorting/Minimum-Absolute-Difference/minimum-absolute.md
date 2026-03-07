# LeetCode 1200 — Minimum Absolute Difference

---

## 1. High-Level Interpretation

We are given an array of **distinct** integers and must find **every pair** of elements whose absolute difference equals the **smallest** absolute difference found across all possible pairs. Each pair `[a, b]` must satisfy `a < b`, and the final list must be sorted in ascending order.

**Why it matters:** This is a classic "sort-then-scan" pattern that appears constantly in interviews — it tests whether you recognise that sorting transforms an O(n²) pairwise comparison into an O(n) adjacent-element scan.

**Hidden traps to watch for:**

- **Negative numbers** — the array can contain values down to −10⁶. Using `b - a` (not `Math.abs(b - a)`) is safe only *after* you guarantee `a < b`, which sorting gives you for free.
- **Multiple pairs** — you must collect *all* pairs that share the minimum difference, not just the first one.
- **"Ascending order of pairs"** — sorting the input naturally produces pairs in ascending order, so no extra sort of the result is needed. Missing this insight leads to unnecessary work.
- **No duplicates** — the problem guarantees distinct elements, so you never face `b - a = 0`. One less edge case to worry about.

---

## 2. Brute-Force Approach

### 2.1 Idea (Plain English)

Check **every possible pair** `(arr[i], arr[j])` where `i < j`. Track the minimum difference seen so far. Once you've examined all pairs, make a second pass (or collect along the way) to gather every pair whose difference equals that minimum.

### 2.2 Pseudocode

```
function minAbsDiffBrute(arr):
    n = arr.length
    minDiff = Infinity
    
    // Pass 1: find the minimum absolute difference
    for i = 0 to n-2:
        for j = i+1 to n-1:
            diff = |arr[i] - arr[j]|
            if diff < minDiff:
                minDiff = diff
    
    // Pass 2: collect all pairs with that difference
    result = []
    for i = 0 to n-2:
        for j = i+1 to n-1:
            if |arr[i] - arr[j]| == minDiff:
                a = min(arr[i], arr[j])
                b = max(arr[i], arr[j])
                result.append([a, b])
    
    // Sort result by first element, then second
    sort result
    return result
```

### 2.3 JavaScript Implementation

```javascript
function minimumAbsDifference(arr) {
    const n = arr.length;
    let minDiff = Infinity;

    // Pass 1 — find minimum difference
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            minDiff = Math.min(minDiff, Math.abs(arr[i] - arr[j]));
        }
    }

    // Pass 2 — collect matching pairs
    const result = [];
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            if (Math.abs(arr[i] - arr[j]) === minDiff) {
                const a = Math.min(arr[i], arr[j]);
                const b = Math.max(arr[i], arr[j]);
                result.push([a, b]);
            }
        }
    }

    result.sort((x, y) => x[0] - y[0] || x[1] - y[1]);
    return result;
}
```

### 2.4 Time & Space Complexity

| Metric | Value | Derivation |
|--------|-------|------------|
| **Time** | **O(n²)** | Two nested loops each iterating over all pairs → n(n−1)/2 comparisons, done twice → O(n²). The final sort is at most O(n log n) on the result, dominated by O(n²). |
| **Space** | **O(n)** | The result array can hold at most n−1 pairs (when all adjacent sorted elements share the same difference). |

### 2.5 Dry Run — `arr = [4, 2, 1, 3]`

**Pass 1: Finding minDiff**

| i | j | arr[i] | arr[j] | \|diff\| | minDiff |
|---|---|--------|--------|----------|---------|
| 0 | 1 | 4 | 2 | 2 | 2 |
| 0 | 2 | 4 | 1 | 3 | 2 |
| 0 | 3 | 4 | 3 | 1 | **1** |
| 1 | 2 | 2 | 1 | 1 | 1 |
| 1 | 3 | 2 | 3 | 1 | 1 |
| 2 | 3 | 1 | 3 | 2 | 1 |

**minDiff = 1**

**Pass 2: Collecting pairs where |diff| == 1**

| i | j | arr[i] | arr[j] | \|diff\| | Collected as |
|---|---|--------|--------|----------|--------------|
| 0 | 3 | 4 | 3 | 1 | [3, 4] |
| 1 | 2 | 2 | 1 | 1 | [1, 2] |
| 1 | 3 | 2 | 3 | 1 | [2, 3] |

**After sorting:** `[[1,2], [2,3], [3,4]]` ✅

### 2.6 Why This Fails at Scale

With `n` up to 10⁵, the brute force performs ~5 × 10⁹ operations (n²/2). This will **TLE** (Time Limit Exceeded) on any judge. We need to eliminate the O(n²) pair enumeration.

---

## 3. Improved Approach — Sort + Two Passes

### 3.1 Key Insight: What Changed and Why

> **The minimum absolute difference in an array always occurs between two elements that are adjacent when the array is sorted.**

**Proof by contradiction:** Suppose the minimum difference is between `arr[i]` and `arr[k]` where `k > i + 1` in the sorted array. Then there exists `arr[j]` with `i < j < k` such that `arr[i] ≤ arr[j] ≤ arr[k]`. This means `arr[j] - arr[i] ≤ arr[k] - arr[i]` and `arr[k] - arr[j] ≤ arr[k] - arr[i]`. So at least one of the adjacent differences is ≤ our supposed minimum — a contradiction.

This means after sorting, we only need to check **n − 1 adjacent pairs** instead of **n(n−1)/2 total pairs**. That's the jump from O(n²) to O(n log n).

### 3.2 Algorithm (Two-Pass Variant)

```
function minAbsDiffSorted(arr):
    sort(arr)                          // O(n log n)
    
    // Pass 1: find minimum adjacent difference
    minDiff = Infinity
    for i = 0 to n-2:
        diff = arr[i+1] - arr[i]      // always ≥ 0 after sort
        if diff < minDiff:
            minDiff = diff
    
    // Pass 2: collect all adjacent pairs with that difference
    result = []
    for i = 0 to n-2:
        if arr[i+1] - arr[i] == minDiff:
            result.append([arr[i], arr[i+1]])
    
    return result
```

### 3.3 JavaScript Implementation

```javascript
function minimumAbsDifference(arr) {
    arr.sort((a, b) => a - b);
    const n = arr.length;

    // Pass 1 — find the minimum adjacent difference
    let minDiff = Infinity;
    for (let i = 0; i < n - 1; i++) {
        minDiff = Math.min(minDiff, arr[i + 1] - arr[i]);
    }

    // Pass 2 — collect pairs
    const result = [];
    for (let i = 0; i < n - 1; i++) {
        if (arr[i + 1] - arr[i] === minDiff) {
            result.push([arr[i], arr[i + 1]]);
        }
    }

    return result;
}
```

### 3.4 Complexity

| Metric | Value | Derivation |
|--------|-------|------------|
| **Time** | **O(n log n)** | Dominated by the sort. The two linear scans are O(n) each. |
| **Space** | **O(1) extra** | Beyond the output array, we use only a few variables. (The sort may use O(log n) stack space internally.) |

### 3.5 Dry Run — `arr = [4, 2, 1, 3]`

**After sorting:** `[1, 2, 3, 4]`

**Pass 1: Finding minDiff**

| i | arr[i] | arr[i+1] | diff | minDiff |
|---|--------|----------|------|---------|
| 0 | 1 | 2 | 1 | **1** |
| 1 | 2 | 3 | 1 | 1 |
| 2 | 3 | 4 | 1 | 1 |

**minDiff = 1**

**Pass 2: Collecting pairs**

| i | arr[i] | arr[i+1] | diff | Action |
|---|--------|----------|------|--------|
| 0 | 1 | 2 | 1 == 1 | push [1, 2] |
| 1 | 2 | 3 | 1 == 1 | push [2, 3] |
| 2 | 3 | 4 | 1 == 1 | push [3, 4] |

**Result:** `[[1,2], [2,3], [3,4]]` ✅

### 3.6 Trade-offs

- **Pro:** Simple, clean, easy to explain.
- **Con:** Two passes over the array (minor). The sort mutates the input — if that's not allowed, you'd need to clone first (O(n) extra space).

---

## 4. Optimal Approach — Sort + Single Pass

### 4.1 Intuition

We can merge both passes into **one** by maintaining the current minimum difference and the result list simultaneously. Whenever we find a *smaller* difference, we **reset** the result list. Whenever we find an *equal* difference, we **append** to it.

This doesn't change the asymptotic complexity (still O(n log n) due to sort), but it's the cleanest and most interview-ready solution — fewer lines, one pass, and easy to reason about correctness.

### 4.2 Pseudocode

```
function minAbsDiffOptimal(arr):
    sort(arr)
    minDiff = Infinity
    result = []
    
    for i = 0 to n-2:
        diff = arr[i+1] - arr[i]
        
        if diff < minDiff:
            minDiff = diff
            result = [[arr[i], arr[i+1]]]    // reset — everything collected before was wrong
        else if diff == minDiff:
            result.append([arr[i], arr[i+1]]) // another pair with the same min diff
        // else diff > minDiff: skip
    
    return result
```

### 4.3 JavaScript Implementation

```javascript
/**
 * @param {number[]} arr
 * @return {number[][]}
 */
function minimumAbsDifference(arr) {
    arr.sort((a, b) => a - b);

    let minDiff = Infinity;
    let result = [];

    for (let i = 0; i < arr.length - 1; i++) {
        const diff = arr[i + 1] - arr[i];

        if (diff < minDiff) {
            minDiff = diff;
            result = [[arr[i], arr[i + 1]]];   // reset
        } else if (diff === minDiff) {
            result.push([arr[i], arr[i + 1]]);  // accumulate
        }
    }

    return result;
}
```

### 4.4 Correctness Proof

**Invariant:** After processing index `i`, `result` contains exactly the set of adjacent pairs in `arr[0..i+1]` whose difference equals the minimum adjacent difference in `arr[0..i+1]`.

**Base case (i = 0):** We compute `diff = arr[1] - arr[0]`. Since `minDiff` starts at `Infinity`, `diff < minDiff` is true, so `result = [[arr[0], arr[1]]]` and `minDiff = diff`. The invariant holds — with only one pair, it's trivially the minimum.

**Inductive step:** Assume the invariant holds after index `i−1`. At index `i`, we compute `diff = arr[i+1] - arr[i]`.

- **Case `diff < minDiff`:** A new, smaller difference is found. All previously collected pairs had a larger difference, so they're invalid. Resetting `result` to contain only the new pair and updating `minDiff` maintains the invariant.
- **Case `diff == minDiff`:** This pair ties with the current minimum. Appending it preserves the invariant.
- **Case `diff > minDiff`:** This pair isn't part of the minimum set. Skipping it preserves the invariant.

**Termination:** After the loop ends at `i = n-2`, the invariant covers all adjacent pairs in the sorted array. Since the minimum absolute difference *must* occur between adjacent sorted elements (proven in §3.1), this is the complete answer.

**Ascending order guarantee:** The array is sorted, so adjacent pairs are naturally produced in ascending order of `a`, then `b`. No extra sort needed.

### 4.5 Dry Run — `arr = [3, 8, -10, 23, 19, -4, -14, 27]`

**After sorting:** `[-14, -10, -4, 3, 8, 19, 23, 27]`

| Step | i | arr[i] | arr[i+1] | diff | vs minDiff | Action | minDiff | result |
|------|---|--------|----------|------|------------|--------|---------|--------|
| 1 | 0 | -14 | -10 | 4 | 4 < ∞ | **reset** | 4 | `[[-14,-10]]` |
| 2 | 1 | -10 | -4 | 6 | 6 > 4 | skip | 4 | `[[-14,-10]]` |
| 3 | 2 | -4 | 3 | 7 | 7 > 4 | skip | 4 | `[[-14,-10]]` |
| 4 | 3 | 3 | 8 | 5 | 5 > 4 | skip | 4 | `[[-14,-10]]` |
| 5 | 4 | 8 | 19 | 11 | 11 > 4 | skip | 4 | `[[-14,-10]]` |
| 6 | 5 | 19 | 23 | 4 | 4 == 4 | **append** | 4 | `[[-14,-10],[19,23]]` |
| 7 | 6 | 23 | 27 | 4 | 4 == 4 | **append** | 4 | `[[-14,-10],[19,23],[23,27]]` |

**Result:** `[[-14,-10], [19,23], [23,27]]` ✅

### 4.6 Complexity Analysis

| Metric | Value | Notes |
|--------|-------|-------|
| **Time** | **O(n log n)** | Sort = O(n log n). Single scan = O(n). Total = O(n log n). |
| **Space** | **O(1) extra** | Only `minDiff` and the output array. No auxiliary data structures. (Sort uses O(log n) internally.) |
| **Practical** | Very fast | JavaScript's `.sort()` uses TimSort (hybrid merge/insertion sort), which is cache-friendly and handles nearly-sorted data well. For n = 10⁵, this completes in < 50ms. |

**Is O(n) possible?** Only if we avoid comparison-based sorting. With the constraint `|arr[i]| ≤ 10⁶`, a counting sort / radix sort would give O(n + k) where k = 2 × 10⁶. In practice, for this problem's constraints, comparison sort is simpler and fast enough.

---

## 5. Interview-Ready Verbal Summary (60–90 seconds)

> "The key observation is that the minimum absolute difference between any two elements in an array must occur between elements that are **adjacent after sorting**. Here's why: if two non-adjacent sorted elements had the smallest difference, then one of the elements between them would form an even smaller difference with one of them — a contradiction.
>
> So the algorithm is: **sort the array**, then make a **single pass** over adjacent pairs. I maintain the current minimum difference and a result list. If I find a smaller difference, I reset the result. If I find an equal difference, I append the pair. If it's larger, I skip.
>
> Since the array is sorted, the pairs come out in ascending order automatically — no extra sort needed.
>
> **Time complexity is O(n log n)** dominated by the sort; the scan is O(n). **Space is O(1)** beyond the output. This comfortably handles the constraint of n up to 10⁵."

---

## 6. Visual Diagram — How Sorting Reduces the Search Space

```
UNSORTED:  [3, 8, -10, 23, 19, -4, -14, 27]

  All pairs (brute force):  n(n-1)/2 = 28 comparisons
  ┌────────────────────────────────────────────┐
  │  (3,8) (3,-10) (3,23) (3,19) (3,-4) ...   │
  │  28 pairs to check                         │
  └────────────────────────────────────────────┘

          │  sort ↓  O(n log n)

SORTED:   [-14, -10, -4, 3, 8, 19, 23, 27]

  Adjacent pairs only:  n-1 = 7 comparisons
  ┌──────────────────────────────────────────────────────────┐
  │  -14──-10──-4──3──8──19──23──27                          │
  │    4    6   7  5  11   4   4       ← adjacent diffs      │
  │    ▲              ▲   ▲   ▲                              │
  │    └──────────────┴───┴───┘                              │
  │         all diffs = 4 (minimum)                          │
  └──────────────────────────────────────────────────────────┘

  Result: [[-14,-10], [19,23], [23,27]]
```

**Why non-adjacent pairs can't beat adjacent ones:**

```
  Sorted: ... A ≤ B ≤ C ...

  diff(A, C) = (C - B) + (B - A)
             = diff(B,C) + diff(A,B)
             ≥ max(diff(A,B), diff(B,C))

  ∴ At least one adjacent diff ≤ diff(A,C).
     Non-adjacent pairs can never be the minimum.
```

---

## 7. Summary Comparison Table

| Approach | Time | Space | Passes | Interview-Ready? |
|----------|------|-------|--------|-------------------|
| Brute Force | O(n²) | O(n) | 2 × n² | ❌ Too slow |
| Sort + Two Pass | O(n log n) | O(1) | Sort + 2n | ✅ Good |
| **Sort + Single Pass** | **O(n log n)** | **O(1)** | **Sort + n** | **✅ Best** |