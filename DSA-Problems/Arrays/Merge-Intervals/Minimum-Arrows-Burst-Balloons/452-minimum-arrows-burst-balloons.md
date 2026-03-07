# 452. Minimum Number of Arrows to Burst Balloons

---

## 1. High-Level Interpretation

We are given a list of balloons, each described by an interval `[xstart, xend]` on the x-axis. We can shoot vertical arrows at any x-coordinate, and an arrow at position `x` bursts every balloon whose interval contains `x` (i.e., `xstart <= x <= xend`). **The goal: find the minimum number of arrows needed to burst every balloon.**

This is fundamentally an **interval scheduling / greedy problem**: we want to find the **minimum number of points** such that every interval contains at least one of those points. It is closely related to "Non-Overlapping Intervals" (LC 435) and "Merge Intervals" (LC 56).

### Hidden Traps

| Trap | Why it matters |
|------|---------------|
| **Touching intervals count as overlap** | `[1,2]` and `[2,3]` share the point `x = 2`, so ONE arrow bursts both. Off-by-one errors are common here. |
| **Huge coordinate range** | `xstart` and `xend` can be up to `±2³¹`. Sorting must use a comparator (not subtraction), or you risk integer overflow. |
| **Up to 10⁵ balloons** | Any approach worse than O(n log n) will likely TLE. |
| **Negative coordinates** | Don't assume coordinates are positive. |

---

## 2. Brute-Force Approach — Check Every Subset of Points

### 2.1 Idea in Plain Words

The absolute brute-force asks: *"What is the smallest set of x-coordinates such that every balloon interval contains at least one of them?"*

One way to think about it:
1. Every "useful" arrow position is at some `xstart` or `xend` value (or anywhere inside an interval), but we can restrict candidate points to the distinct `xstart`/`xend` values without loss of generality.
2. Enumerate all subsets of these candidate points, from smallest to largest.
3. For each subset, check if every balloon is hit by at least one point in the subset.
4. Return the size of the first (smallest) valid subset.

This is essentially a **Set Cover** problem — which is NP-hard in general.

### 2.2 Pseudocode

```
function minArrowsBruteForce(points):
    candidates = set of all distinct xstart and xend values
    n = candidates.length

    for size = 1 to n:
        for each subset S of candidates with |S| = size:
            if every balloon is hit by at least one value in S:
                return size

    return points.length   // worst case: one arrow per balloon
```

### 2.3 "Checking every balloon is hit":

```
function allBurst(points, arrowSet):
    for each [xstart, xend] in points:
        hit = false
        for each arrow in arrowSet:
            if xstart <= arrow <= xend:
                hit = true
                break
        if not hit:
            return false
    return true
```

### 2.4 Time & Space Complexity

| | Value | Derivation |
|---|---|---|
| **Time** | O(2ⁿ × n × m) | `2ⁿ` subsets of `n` candidate points, each subset checked against `m` balloons, each check scans the subset |
| **Space** | O(n) | To store the candidate set and current subset |

Where `n` = number of distinct endpoints (at most `2m`), `m` = number of balloons.

**This is exponential** — completely unusable for `m = 10⁵`.

### 2.5 Dry Run — Example 1: `[[10,16],[2,8],[1,6],[7,12]]`

Candidates: `{1, 2, 6, 7, 8, 10, 12, 16}` → 8 values.

| Subset size | Sample subsets tried | All burst? |
|---|---|---|
| 1 | `{1}` → misses `[10,16]`, `[7,12]` | ❌ |
| 1 | `{6}` → hits `[2,8]` and `[1,6]`, misses `[10,16]`, `[7,12]` | ❌ |
| 1 | `{10}` → misses `[2,8]`, `[1,6]` | ❌ |
| … | … | ❌ |
| 2 | `{6, 10}` → `[1,6]`✅ `[2,8]`✅ `[10,16]`✅ `[7,12]`✅ | ✅ **Answer = 2** |

### 2.6 Why This Fails

- **Exponential time** makes it infeasible for even small inputs.
- With `10⁵` balloons → up to `2 × 10⁵` candidates → `2^(200000)` subsets. Completely impossible.
- We need a fundamentally different strategy.

---

## 3. Improved Approach — Greedy with Sort by Start

### 3.1 Key Insight: Sorting Helps Us Process Balloons Left-to-Right

Instead of brute-forcing subsets, we notice:

> If we sort balloons by their **start** coordinate, overlapping balloons will be adjacent. We can greedily merge overlapping groups and fire one arrow per group.

**How it works:**
1. Sort balloons by `xstart`.
2. Track the **current overlap region** as we scan left-to-right.
3. For each next balloon:
   - If it overlaps with the current region, **shrink** the region to the intersection.
   - If it doesn't overlap, fire an arrow for the previous group and start a new region.
4. Fire one last arrow for the final group.

### 3.2 What "shrink the region" means

If the current overlap is `[overlapStart, overlapEnd]` and the new balloon is `[xstart, xend]`:
- **Overlaps?** `xstart <= overlapEnd`
- **New overlap region:** `[max(overlapStart, xstart), min(overlapEnd, xend)]`

This is essentially tracking the **intersection** of all balloons in the current group.

### 3.3 Pseudocode

```
function minArrows(points):
    if points is empty: return 0

    sort points by xstart (ascending)

    arrows = 1
    overlapStart = points[0].xstart
    overlapEnd   = points[0].xend

    for i = 1 to points.length - 1:
        [curStart, curEnd] = points[i]

        if curStart <= overlapEnd:          // overlaps
            overlapStart = max(overlapStart, curStart)
            overlapEnd   = min(overlapEnd, curEnd)
        else:                               // no overlap → new group
            arrows += 1
            overlapStart = curStart
            overlapEnd   = curEnd

    return arrows
```

### 3.4 JavaScript Implementation

```javascript
/**
 * @param {number[][]} points
 * @return {number}
 */
var findMinArrowShots = function(points) {
    if (points.length === 0) return 0;

    // Sort by start coordinate
    points.sort((a, b) => a[0] - b[0] || a[1] - b[1]);

    let arrows = 1;
    let overlapStart = points[0][0];
    let overlapEnd   = points[0][1];

    for (let i = 1; i < points.length; i++) {
        const [curStart, curEnd] = points[i];

        if (curStart <= overlapEnd) {
            // Balloon overlaps — shrink the overlap window
            overlapStart = Math.max(overlapStart, curStart);
            overlapEnd   = Math.min(overlapEnd, curEnd);
        } else {
            // No overlap — need a new arrow
            arrows++;
            overlapStart = curStart;
            overlapEnd   = curEnd;
        }
    }

    return arrows;
};
```

### 3.5 Time & Space Complexity

| | Value | Derivation |
|---|---|---|
| **Time** | O(n log n) | Sorting dominates; the single scan is O(n) |
| **Space** | O(1) extra | Sorting is in-place (or O(log n) for sort stack); only a few variables |

### 3.6 Dry Run — Example 1: `[[10,16],[2,8],[1,6],[7,12]]`

**After sorting by `xstart`:**

| Index | Balloon |
|---|---|
| 0 | [1, 6] |
| 1 | [2, 8] |
| 2 | [7, 12] |
| 3 | [10, 16] |

| Step | Balloon | curStart ≤ overlapEnd? | Action | overlapStart | overlapEnd | arrows |
|---|---|---|---|---|---|---|
| Init | [1, 6] | — | Start first group | 1 | 6 | 1 |
| i=1 | [2, 8] | 2 ≤ 6 → YES | Shrink: max(1,2)=2, min(6,8)=6 | 2 | 6 | 1 |
| i=2 | [7, 12] | 7 ≤ 6 → NO | New group! | 7 | 12 | 2 |
| i=3 | [10, 16] | 10 ≤ 12 → YES | Shrink: max(7,10)=10, min(12,16)=12 | 10 | 12 | 2 |

**Result: `2` ✅**

### 3.7 Dry Run — Example 2: `[[1,2],[3,4],[5,6],[7,8]]`

Already sorted.

| Step | Balloon | curStart ≤ overlapEnd? | Action | overlapEnd | arrows |
|---|---|---|---|---|---|
| Init | [1,2] | — | Start | 2 | 1 |
| i=1 | [3,4] | 3 ≤ 2 → NO | New group | 4 | 2 |
| i=2 | [5,6] | 5 ≤ 4 → NO | New group | 6 | 3 |
| i=3 | [7,8] | 7 ≤ 6 → NO | New group | 8 | 4 |

**Result: `4` ✅**

### 3.8 Dry Run — Example 3: `[[1,2],[2,3],[3,4],[4,5]]`

Already sorted.

| Step | Balloon | curStart ≤ overlapEnd? | Action | overlapStart | overlapEnd | arrows |
|---|---|---|---|---|---|---|
| Init | [1,2] | — | Start | 1 | 2 | 1 |
| i=1 | [2,3] | 2 ≤ 2 → YES | Shrink: max(1,2)=2, min(2,3)=2 | 2 | 2 | 1 |
| i=2 | [3,4] | 3 ≤ 2 → NO | New group | 3 | 4 | 2 |
| i=3 | [4,5] | 4 ≤ 4 → YES | Shrink: max(3,4)=4, min(4,5)=4 | 4 | 4 | 2 |

**Result: `2` ✅** — Arrow at x=2 bursts [1,2] and [2,3]; arrow at x=4 bursts [3,4] and [4,5].

### 3.9 Trade-offs

| Pros | Cons |
|---|---|
| O(n log n) — fast | Tracks both `overlapStart` and `overlapEnd` (slightly more bookkeeping than needed) |
| Easy to understand with "merging" mental model | Sort by start can lead to subtle bugs if you forget to shrink the end |

> **Note:** We actually don't need `overlapStart` at all — we only ever compare against `overlapEnd`. This leads us to the cleanest optimal approach.

---

## 4. Optimal Approach — Greedy with Sort by End

### 4.1 The Core Intuition

> **"Always shoot at the rightmost possible point of the earliest-ending balloon."**

Here's why this is optimal:

1. **Sort all balloons by their end coordinate** (`xend`).
2. The balloon that ends earliest is the most "urgent" — it gives us the smallest window of opportunity.
3. **Shoot an arrow at that balloon's end point.** This arrow will also burst any subsequent balloon whose start overlaps with that end point.
4. Skip all balloons hit by this arrow. Repeat from the next un-burst balloon.

This is a classic **greedy interval point-cover** algorithm.

### 4.2 Why Sort by End (not Start)?

Sorting by **end** means we always commit to the latest possible shot for the most constrained balloon. This **maximizes the chance** of the arrow also hitting later balloons, because their starts might fall before our arrow position.

```
Balloon A: [1, ████6]         ← ends earliest, shoot at 6
Balloon B:    [2, ████████8]  ← start 2 ≤ 6, also burst!
Balloon C:          [7, ██████12] ← start 7 > 6, need new arrow
```

### 4.3 Pseudocode

```
function minArrows(points):
    if points is empty: return 0

    sort points by xend (ascending)

    arrows = 1
    arrowPos = points[0].xend       // shoot at end of first balloon

    for i = 1 to points.length - 1:
        if points[i].xstart > arrowPos:     // this balloon is NOT hit
            arrows += 1
            arrowPos = points[i].xend       // shoot at end of this balloon

    return arrows
```

Just **4 lines of logic** inside the loop! No need to track overlap start or min/max — just one variable `arrowPos`.

### 4.4 JavaScript Implementation

```javascript
/**
 * 452. Minimum Number of Arrows to Burst Balloons
 * Greedy — sort by end, shoot at rightmost point of earliest-ending balloon
 *
 * @param {number[][]} points
 * @return {number}
 */
var findMinArrowShots = function(points) {
    if (points.length === 0) return 0;

    // Sort by END coordinate (ascending)
    // Using comparator to avoid integer overflow with subtraction
    points.sort((a, b) => {
        if (a[1] < b[1]) return -1;
        if (a[1] > b[1]) return  1;
        return 0;
    });

    let arrows  = 1;
    let arrowPos = points[0][1];  // shoot at end of first (earliest-ending) balloon

    for (let i = 1; i < points.length; i++) {
        if (points[i][0] > arrowPos) {
            // This balloon starts AFTER the last arrow — can't be hit
            arrows++;
            arrowPos = points[i][1];  // new arrow at this balloon's end
        }
        // else: this balloon is already burst by the previous arrow
    }

    return arrows;
};
```

> ⚠️ **Important:** We use an explicit comparator (`< / >`) instead of `a[1] - b[1]` because the coordinates can go up to `2³¹ - 1`, and subtraction would overflow JavaScript's safe integer range for 32-bit edge cases.

### 4.5 Proof of Correctness

**Claim:** The greedy algorithm produces the minimum number of arrows.

**Proof (by Exchange Argument):**

1. Let `G` be our greedy solution with `k` arrows, and let `O` be any optimal solution with `k*` arrows. We want to show `k ≤ k*`.

2. **Greedy creates disjoint groups:** After sorting by `xend`, each time we fire a new arrow, it's because the current balloon's `xstart > arrowPos`. This means the current balloon does not overlap with any balloon in the previous group. Therefore, our `k` groups are **mutually non-overlapping**.

3. **Each group needs at least one arrow in any solution:** Since the groups are non-overlapping, no single arrow can hit balloons from two different groups. Therefore, any valid solution needs at least `k` arrows.

4. **Conclusion:** `k* ≥ k`, and since our greedy solution uses exactly `k` arrows and is valid, `k* = k`. ∎

**Invariant maintained at each step:** After processing balloon `i`, all balloons `0..i` are burst, and `arrowPos` is the x-coordinate of the most recently fired arrow.

### 4.6 Dry Run — Example 1: `[[10,16],[2,8],[1,6],[7,12]]`

**After sorting by `xend`:**

| Index | Balloon | xend |
|---|---|---|
| 0 | [1, 6] | 6 |
| 1 | [2, 8] | 8 |
| 2 | [7, 12] | 12 |
| 3 | [10, 16] | 16 |

| Step | Balloon | xstart > arrowPos? | Action | arrowPos | arrows |
|---|---|---|---|---|---|
| Init | [1, 6] | — | Shoot at x=6 | 6 | 1 |
| i=1 | [2, 8] | 2 > 6? → NO | Already burst ✅ | 6 | 1 |
| i=2 | [7, 12] | 7 > 6? → YES | New arrow at x=12 | 12 | 2 |
| i=3 | [10, 16] | 10 > 12? → NO | Already burst ✅ | 12 | 2 |

**Result: `2` ✅**

Arrows fired at x=6 (bursts [1,6] and [2,8]) and x=12 (bursts [7,12] and [10,16]).

### 4.7 Dry Run — Example 2: `[[1,2],[3,4],[5,6],[7,8]]`

Already sorted by `xend`.

| Step | Balloon | xstart > arrowPos? | Action | arrowPos | arrows |
|---|---|---|---|---|---|
| Init | [1,2] | — | Shoot at x=2 | 2 | 1 |
| i=1 | [3,4] | 3 > 2? → YES | New arrow at x=4 | 4 | 2 |
| i=2 | [5,6] | 5 > 4? → YES | New arrow at x=6 | 6 | 3 |
| i=3 | [7,8] | 7 > 6? → YES | New arrow at x=8 | 8 | 4 |

**Result: `4` ✅** — No overlaps, each balloon needs its own arrow.

### 4.8 Dry Run — Example 3: `[[1,2],[2,3],[3,4],[4,5]]`

Already sorted by `xend`.

| Step | Balloon | xstart > arrowPos? | Action | arrowPos | arrows |
|---|---|---|---|---|---|
| Init | [1,2] | — | Shoot at x=2 | 2 | 1 |
| i=1 | [2,3] | 2 > 2? → NO | Already burst ✅ | 2 | 1 |
| i=2 | [3,4] | 3 > 2? → YES | New arrow at x=4 | 4 | 2 |
| i=3 | [4,5] | 4 > 4? → NO | Already burst ✅ | 4 | 2 |

**Result: `2` ✅**

### 4.9 Time & Space Complexity

| | Value | Notes |
|---|---|---|
| **Time** | **O(n log n)** | Sorting: O(n log n). Single scan: O(n). Total: O(n log n). |
| **Space** | **O(1) extra** | In-place sort + 2 variables (`arrows`, `arrowPos`). Sort uses O(log n) stack space. |

**Practical performance:** This runs in ~50–80ms on LeetCode for n = 10⁵, well within limits.

---

## 5. Visual Diagram — How the Algorithm Works

```
Input (unsorted):  [10,16]  [2,8]  [1,6]  [7,12]

Step 1: Sort by xend
──────────────────────────────────────────────────────────────
x-axis:  1   2   3   4   5   6   7   8   9  10  11  12  13  14  15  16

[1,─────────────6]                               xend = 6  (earliest)
    [2,─────────────8]                            xend = 8
                        [7,──────────12]          xend = 12
                                [10,─────────────16]  xend = 16

Step 2: Shoot arrow at x = 6 (end of earliest-ending balloon)
──────────────────────────────────────────────────────────────
                        ↓ Arrow #1 at x=6
[1,═════════════6] ← BURST ✅
    [2,═════════════8] ← BURST ✅ (2 ≤ 6 ≤ 8)
                        [7,──────────12]  ← NOT hit (7 > 6)
                                [10,─────────────16]

Step 3: Shoot arrow at x = 12 (end of next un-burst balloon)
──────────────────────────────────────────────────────────────
                                    ↓ Arrow #2 at x=12
                        [7,══════════12] ← BURST ✅
                                [10,═════════════16] ← BURST ✅ (10 ≤ 12 ≤ 16)

Total arrows: 2 ✅
```

---

## 6. Approach Comparison Summary

| Approach | Time | Space | Key Idea |
|---|---|---|---|
| Brute-force (subset enum) | O(2ⁿ × n × m) | O(n) | Try all subsets of candidate points |
| Sort by start + track overlap | O(n log n) | O(1) | Merge overlapping intervals, shrink window |
| **Sort by end + greedy** ⭐ | **O(n log n)** | **O(1)** | Shoot at end of earliest-ending balloon |

The "sort by start" and "sort by end" approaches have the same asymptotic complexity, but **sort by end** has:
- Simpler code (one comparison, one variable)
- Cleaner correctness proof
- Fewer edge-case bugs

---

## 7. Interview-Ready Explanation (60–90 seconds)

> *"This is a classic greedy interval problem. The key insight is: if we sort all balloons by their **ending** coordinate, the balloon that ends earliest is the most constrained — it gives us the smallest window to shoot. So we fire our arrow at that balloon's end point, which is the latest position that still hits it. This maximizes the chance of also hitting subsequent balloons.*
>
> *After sorting, we iterate once. We keep track of the arrow position. For each balloon, if its start is beyond the current arrow, it wasn't hit, so we fire a new arrow at this balloon's end. Otherwise, it's already burst.*
>
> *This works because our greedy groups are non-overlapping — no single arrow can serve two different groups — so any solution needs at least as many arrows as we use. Time complexity is O(n log n) for sorting plus O(n) for the scan, so O(n log n) total, and O(1) extra space."*

---

## 8. Edge Cases to Watch

| Case | Expected | Why |
|---|---|---|
| Single balloon `[[1,5]]` | 1 | One arrow always suffices |
| All identical `[[1,5],[1,5],[1,5]]` | 1 | All overlap perfectly |
| Touching at a point `[[1,2],[2,3]]` | 1 | `2 ≤ 2`, so one arrow at x=2 works |
| Maximum range `[[-2³¹, 2³¹-1]]` | 1 | Beware of overflow in comparator |
| Fully nested `[[1,10],[2,5],[3,4]]` | 1 | The innermost interval constrains the group |
| Alternating overlap `[[1,4],[2,6],[5,8]]` | 2 | [1,4]&[2,6] share overlap, but [5,8] does not overlap with [1,4]'s end (4) → two arrows |
