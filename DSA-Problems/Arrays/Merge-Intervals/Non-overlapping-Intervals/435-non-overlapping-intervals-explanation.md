# 435. Non-overlapping Intervals - Complete Explanation

## High-Level Interpretation

Given a collection of intervals, find the **minimum number of intervals to remove** so that no two remaining intervals overlap. Intervals that merely touch (e.g., [1,2] and [2,3]) are considered non-overlapping.

**Why It Matters:**
- Activity selection / scheduling
- Resource allocation (meeting rooms)
- Job scheduling with deadlines
- Classic greedy algorithm example

**Hidden Traps:**
- **Negative numbers**: Start can be negative (-5×10⁴)
- **Same start, different ends**: [1,3] vs [1,2] — which to keep?
- **Touching intervals are OK**: [1,2] and [2,3] don't overlap
- **Duplicates**: Multiple identical intervals
- **Alternative framing**: Equivalent to "find max non-overlapping intervals" then subtract from n

---

## Key Insight: Equivalent Problem

**Minimum removals = n - Maximum non-overlapping intervals**

Finding max non-overlapping intervals is the classic **Activity Selection Problem** (greedy).

---

## 1. Brute-Force Approach: Try All Subsets

### Idea

Generate all possible subsets of intervals. For each subset, check if all intervals are non-overlapping. Track the largest valid subset.

### Pseudocode

```
function minRemovals(intervals):
    n = intervals.length
    maxKeep = 0
    
    for each subset of intervals:
        if isNonOverlapping(subset):
            maxKeep = max(maxKeep, subset.size)
    
    return n - maxKeep

function isNonOverlapping(intervals):
    sort by start
    for i = 1 to length:
        if intervals[i].start < intervals[i-1].end:
            return false
    return true
```

### JavaScript Implementation

```javascript
function eraseOverlapIntervals(intervals) {
    const n = intervals.length;
    let maxKeep = 0;
    
    // Generate all 2^n subsets
    for (let mask = 0; mask < (1 << n); mask++) {
        const subset = [];
        for (let i = 0; i < n; i++) {
            if (mask & (1 << i)) {
                subset.push(intervals[i]);
            }
        }
        
        if (isNonOverlapping(subset)) {
            maxKeep = Math.max(maxKeep, subset.length);
        }
    }
    
    return n - maxKeep;
}

function isNonOverlapping(intervals) {
    if (intervals.length <= 1) return true;
    intervals.sort((a, b) => a[0] - b[0]);
    for (let i = 1; i < intervals.length; i++) {
        if (intervals[i][0] < intervals[i-1][1]) {
            return false;
        }
    }
    return true;
}
```

### Complexity

- **Time**: O(2ⁿ × n log n) — 2ⁿ subsets, each needs sort + check
- **Space**: O(n) — for subset storage

### Dry Run: Example 1

```
intervals = [[1,2],[2,3],[3,4],[1,3]]
n = 4

Subsets (showing only relevant ones):
- {[1,2],[2,3],[3,4]}: sorted = [[1,2],[2,3],[3,4]]
  check: 2≥2 ✓, 3≥3 ✓ → valid, size=3
- {[1,2],[2,3],[1,3]}: sorted = [[1,2],[1,3],[2,3]]
  check: 1<2 ✗ → invalid
- {[2,3],[3,4],[1,3]}: sorted = [[1,3],[2,3],[3,4]]
  check: 2<3 ✗ → invalid
- ...

maxKeep = 3
Return: 4 - 3 = 1 ✓
```

### Why This Approach Fails

- **Exponential**: 2¹⁰⁵ subsets is astronomically large
- **Infeasible**: Cannot work for n up to 10⁵
- **Redundant**: Many subsets are checked unnecessarily

---

## 2. Improved Approach: Dynamic Programming

### What Changed?

After sorting, use DP to find the maximum number of non-overlapping intervals.

`dp[i]` = max non-overlapping intervals ending at or before interval i

### Pseudocode

```
function minRemovals(intervals):
    sort intervals by start
    n = intervals.length
    dp = array of size n, all 1s (each interval alone)
    
    for i = 1 to n:
        for j = 0 to i-1:
            if intervals[j].end <= intervals[i].start:
                dp[i] = max(dp[i], dp[j] + 1)
    
    return n - max(dp)
```

### JavaScript Implementation

```javascript
function eraseOverlapIntervals(intervals) {
    if (intervals.length <= 1) return 0;
    
    intervals.sort((a, b) => a[0] - b[0]);
    const n = intervals.length;
    const dp = new Array(n).fill(1);
    
    for (let i = 1; i < n; i++) {
        for (let j = 0; j < i; j++) {
            if (intervals[j][1] <= intervals[i][0]) {
                dp[i] = Math.max(dp[i], dp[j] + 1);
            }
        }
    }
    
    return n - Math.max(...dp);
}
```

### Complexity

- **Time**: O(n²) — nested loops
- **Space**: O(n) — for dp array

### Dry Run: Example 1

```
intervals = [[1,2],[2,3],[3,4],[1,3]]
After sort: [[1,2],[1,3],[2,3],[3,4]]
            idx 0    1     2     3

dp = [1, 1, 1, 1]

i=1 ([1,3]):
  j=0: [1,2].end=2 <= 1? No
  dp[1] = 1

i=2 ([2,3]):
  j=0: [1,2].end=2 <= 2? Yes → dp[2] = max(1, 1+1) = 2
  j=1: [1,3].end=3 <= 2? No
  dp[2] = 2

i=3 ([3,4]):
  j=0: [1,2].end=2 <= 3? Yes → dp[3] = max(1, 1+1) = 2
  j=1: [1,3].end=3 <= 3? Yes → dp[3] = max(2, 1+1) = 2
  j=2: [2,3].end=3 <= 3? Yes → dp[3] = max(2, 2+1) = 3

dp = [1, 1, 2, 3]
maxKeep = 3
Return: 4 - 3 = 1 ✓
```

### Trade-offs

- ✓ Polynomial time
- ✗ Still O(n²) — too slow for n = 10⁵
- ✗ Binary search could optimize to O(n log n)

---

## 3. Improved Approach: DP with Binary Search

### What Changed?

Use binary search to find the latest non-overlapping interval, reducing inner loop from O(n) to O(log n).

### JavaScript Implementation

```javascript
function eraseOverlapIntervals(intervals) {
    if (intervals.length <= 1) return 0;
    
    intervals.sort((a, b) => a[0] - b[0]);
    const n = intervals.length;
    const dp = new Array(n).fill(1);
    const ends = [intervals[0][1]]; // Track ends for binary search
    
    for (let i = 1; i < n; i++) {
        // Binary search for latest interval ending <= intervals[i][0]
        const target = intervals[i][0];
        let lo = 0, hi = i;
        while (lo < hi) {
            const mid = Math.floor((lo + hi) / 2);
            if (intervals[mid][1] <= target) {
                lo = mid + 1;
            } else {
                hi = mid;
            }
        }
        
        if (lo > 0) {
            dp[i] = dp[lo - 1] + 1;
        }
        dp[i] = Math.max(dp[i], i > 0 ? dp[i-1] : 1);
    }
    
    return n - dp[n - 1];
}
```

### Complexity

- **Time**: O(n log n)
- **Space**: O(n)

---

## 4. Optimal Approach: Greedy (Sort by End)

### Intuition

This is the classic **Activity Selection Problem**. The greedy strategy:

1. Sort intervals by **end time**
2. Always pick the interval that ends earliest (leaves most room for future intervals)
3. Skip any interval that overlaps with the last picked

**Why sort by end?** An interval that ends earlier leaves more room for subsequent intervals, maximizing the count we can keep.

### Pseudocode

```
function minRemovals(intervals):
    sort intervals by end time
    
    count = 0  // intervals to keep
    prevEnd = -infinity
    
    for each interval in intervals:
        if interval.start >= prevEnd:
            // No overlap, keep this interval
            count++
            prevEnd = interval.end
        // else: skip (remove) this interval
    
    return n - count
```

### JavaScript Implementation

```javascript
function eraseOverlapIntervals(intervals) {
    if (intervals.length <= 1) return 0;
    
    // Sort by end time
    intervals.sort((a, b) => a[1] - b[1]);
    
    let count = 1; // Keep first interval
    let prevEnd = intervals[0][1];
    
    for (let i = 1; i < intervals.length; i++) {
        if (intervals[i][0] >= prevEnd) {
            // No overlap, keep this interval
            count++;
            prevEnd = intervals[i][1];
        }
        // else: overlap, skip (implicitly remove)
    }
    
    return intervals.length - count;
}
```

### Correctness Proof

**Greedy Choice Property**: Choosing the interval with the earliest end time is always part of some optimal solution.

**Proof by Exchange Argument**:
1. Let OPT be an optimal solution
2. Let G be the first interval in our greedy solution (earliest end)
3. If G ∈ OPT, we're done for this step
4. If G ∉ OPT, let F be the first interval in OPT
5. Since G ends earliest, G.end ≤ F.end
6. Replacing F with G in OPT gives a valid solution (G doesn't conflict with more intervals than F)
7. The new solution has same size → still optimal

**Induction**: After each greedy choice, the remaining problem has optimal substructure ∎

### Dry Run: Example 1

```
intervals = [[1,2],[2,3],[3,4],[1,3]]

Sort by END: [[1,2],[2,3],[1,3],[3,4]]
             end=2  end=3  end=3  end=4

count = 1, prevEnd = 2 (start with first)

| i | interval | start >= prevEnd? | Action      | count | prevEnd |
|---|----------|-------------------|-------------|-------|---------|
| 1 | [2,3]    | 2 >= 2? Yes       | Keep        | 2     | 3       |
| 2 | [1,3]    | 1 >= 3? No        | Skip/Remove | 2     | 3       |
| 3 | [3,4]    | 3 >= 3? Yes       | Keep        | 3     | 4       |

count = 3 (kept)
Return: 4 - 3 = 1 ✓

Kept: [1,2], [2,3], [3,4]
Removed: [1,3]
```

### Dry Run: Example 2

```
intervals = [[1,2],[1,2],[1,2]]

Sort by END: [[1,2],[1,2],[1,2]] (all same)

count = 1, prevEnd = 2

| i | interval | start >= prevEnd? | Action      | count | prevEnd |
|---|----------|-------------------|-------------|-------|---------|
| 1 | [1,2]    | 1 >= 2? No        | Skip/Remove | 1     | 2       |
| 2 | [1,2]    | 1 >= 2? No        | Skip/Remove | 1     | 2       |

count = 1
Return: 3 - 1 = 2 ✓
```

### Complexity

- **Time**: O(n log n) — sorting dominates, single pass is O(n)
- **Space**: O(1) — only constant extra space (sort is in-place or O(log n))

### Practical Performance

- Sorting is well-optimized
- Single pass is cache-friendly
- Minimal branching
- Very simple implementation

---

## Alternative: Greedy (Sort by Start, Keep Smaller End)

### Idea

Sort by start, and when overlapping, keep the one with smaller end.

```javascript
function eraseOverlapIntervals(intervals) {
    if (intervals.length <= 1) return 0;
    
    intervals.sort((a, b) => a[0] - b[0]);
    
    let removals = 0;
    let prevEnd = intervals[0][1];
    
    for (let i = 1; i < intervals.length; i++) {
        if (intervals[i][0] < prevEnd) {
            // Overlap: remove the one with LARGER end
            removals++;
            prevEnd = Math.min(prevEnd, intervals[i][1]);
        } else {
            prevEnd = intervals[i][1];
        }
    }
    
    return removals;
}
```

This is equivalent but directly counts removals instead of keeps.

---

## Interview-Ready Explanation (60-90 seconds)

> "To find minimum intervals to remove for non-overlapping, I recognize this as the Activity Selection Problem.
>
> I sort intervals by end time. Then I greedily select intervals: for each interval, if it starts at or after the previous interval ends, I keep it and update my end pointer. Otherwise, I skip it.
>
> The key insight is that choosing the interval ending earliest leaves maximum room for future intervals, maximizing what we keep.
>
> For example, with [[1,2],[2,3],[3,4],[1,3]]: sorting by end gives [[1,2],[2,3],[1,3],[3,4]]. I keep [1,2], [2,3], skip [1,3] (overlaps), keep [3,4]. Total kept is 3, so remove 4-3=1.
>
> Time is O(n log n) for sorting, O(n) for the pass. Space is O(1) extra. The greedy choice is provably optimal via exchange argument."

---

## Visual Diagram

### Sort by End Strategy

```
Original: [[1,2],[2,3],[3,4],[1,3]]

Sort by END:
[1,2]  end=2  ←── Earliest end, pick first
[2,3]  end=3
[1,3]  end=3  ←── Same end as above, but starts earlier (more conflict potential)
[3,4]  end=4

Timeline after sorting:
0──1──2──3──4──5
   [─]           [1,2] ✓ Keep (first)
      [─]        [2,3] ✓ 2 >= 2
   [────]        [1,3] ✗ 1 < 3 (overlaps!)
         [─]     [3,4] ✓ 3 >= 3

Kept: ───────────
      [─][─][─]  (3 intervals, non-overlapping)
```

### Why End Time Matters

```
Compare two intervals with same start:
[1,─────5]  ends at 5
[1,──3]     ends at 3

The shorter one [1,3] is BETTER because:
- Leaves room for [3,4], [4,5], etc.
- The longer one blocks more future intervals

Sorting by end ensures we prefer shorter intervals
when they start around the same time.
```

---

## Comparison of Approaches

| Approach | Time | Space | Notes |
|----------|------|-------|-------|
| Brute Force (all subsets) | O(2ⁿ × n log n) | O(n) | ❌ Exponential |
| DP (O(n²)) | O(n²) | O(n) | ❌ Too slow for 10⁵ |
| DP + Binary Search | O(n log n) | O(n) | ✓ Works |
| **Greedy (Sort by End)** | **O(n log n)** | **O(1)** | ✓ **Optimal** |

---

## Edge Cases

1. **Single interval**: Return 0
2. **All identical**: Keep 1, remove n-1
3. **No overlaps**: Return 0
4. **All overlap with first**: Keep 1 (the one ending earliest)
5. **Negative starts**: Algorithm handles correctly
6. **Touching intervals**: [1,2] and [2,3] are OK (2 >= 2)

---

## Key Takeaways

1. **Reframe problem**: Min removals = n - max keeps
2. **Activity Selection**: Classic greedy problem
3. **Sort by end**: Earliest end leaves most room
4. **Greedy works**: Exchange argument proves optimality
5. **Compare start with prevEnd**: `start >= prevEnd` means no overlap
6. **Touching is OK**: `>=` not `>`
7. **O(n log n)**: Sorting dominates
8. **O(1) space**: Only need prevEnd tracker
9. **Alternative**: Sort by start, keep smaller end when overlap
10. **Don't overthink**: Greedy is simpler than DP here
