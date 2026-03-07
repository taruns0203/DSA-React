# 904. Fruit Into Baskets — Complete Guide

---

## 1. High-Level Interpretation

You have a row of fruit trees. Each tree produces **one type** of fruit (represented by an integer). You carry **exactly two baskets**, and each basket can hold **unlimited quantity** of exactly **one** fruit type. You pick a **contiguous starting point**, walk right, and you **must** pick one fruit from every tree you pass — you stop only when you encounter a **third** distinct fruit type that has no basket. The goal is to **maximise the number of fruits picked** (i.e., find the **longest contiguous subarray** that contains **at most 2 distinct values**).

**Hidden traps to watch for:**
- The problem is really just **"longest subarray with at most 2 distinct elements"** in disguise — recognising this reframing is half the battle.
- Fruit types can **repeat** (e.g. `[1,2,1,2,1]` is one long valid window), so you can't just track "the last two types seen."
- Off-by-one: the window length is `right − left + 1`, not `right − left`.
- `fruits.length` can reach **10⁵**, so anything worse than O(n log n) will likely TLE.

---

## 2. Brute-Force Approach

### 2.1 Idea in Plain Words

Try **every possible starting index `i`**. From each `i`, walk right and collect fruit types in a set. The moment the set grows beyond size 2, stop — the length of this run is a candidate answer. Track the global maximum.

### 2.2 Pseudocode

```
function maxFruits_BruteForce(fruits):
    n = fruits.length
    maxPicked = 0

    for i from 0 to n - 1:                 // try every start
        basket = empty Set
        count = 0
        for j from i to n - 1:             // extend rightward
            basket.add(fruits[j])
            if basket.size > 2:
                break                       // can't pick this fruit
            count += 1
        maxPicked = max(maxPicked, count)

    return maxPicked
```

### 2.3 Time & Space Complexity

| Metric | Value | Derivation |
|--------|-------|------------|
| **Time** | **O(n²)** | Two nested loops: outer picks start (n), inner extends (up to n). |
| **Space** | **O(1)** | The Set holds at most 3 elements before we break → constant. |

### 2.4 Dry Run — `fruits = [1, 2, 3, 2, 2]`

| `i` | `j` journey | `basket` states | `count` when stopped | Notes |
|-----|-------------|-----------------|----------------------|-------|
| 0 | j=0 → {1}, j=1 → {1,2}, j=2 → {1,2,3} → **break** | {1,2,3} | **2** | 3rd type forces stop |
| 1 | j=1 → {2}, j=2 → {2,3}, j=3 → {2,3} …wait, fruits[3]=2 already in set, j=4 → {2,3} | {2,3} | **4** | All remaining trees fit |
| 2 | j=2 → {3}, j=3 → {3,2}, j=4 → {3,2} | {3,2} | **3** | |
| 3 | j=3 → {2}, j=4 → {2} | {2} | **2** | |
| 4 | j=4 → {2} | {2} | **1** | |

**Global max = 4** ✅ (subarray `[2, 3, 2, 2]` starting at index 1)

### 2.5 Why This Fails at Scale

With `n = 10⁵`, the worst case is **~5 × 10⁹** operations (e.g., an array with only 2 distinct values means the inner loop runs to the end every time). This is far too slow for typical online judges (~10⁸ ops/sec).

---

## 3. Improved Approach — Sliding Window with HashMap

### 3.1 What Changed and Why

Instead of restarting from scratch for every `i`, we keep a **sliding window `[left, right]`**:

1. **Expand** `right` — add `fruits[right]` to a frequency map.
2. If the map now has **> 2 keys** (distinct types), **shrink** from the left: decrement counts, delete keys that reach 0, and advance `left`.
3. After shrinking, the window `[left, right]` is valid again. Record its length.

> **Key insight:** when a window `[left, right]` has > 2 types, the *optimal* new left can never be *before* the current left — so we never move `left` backwards. Each element is added and removed **at most once**, giving **O(n)** total.

### 3.2 Pseudocode

```
function maxFruits_SlidingWindow(fruits):
    n = fruits.length
    freq = empty HashMap          // fruit_type → count
    left = 0
    maxPicked = 0

    for right from 0 to n - 1:
        freq[fruits[right]] += 1              // expand window

        while freq.size > 2:                  // too many types
            freq[fruits[left]] -= 1
            if freq[fruits[left]] == 0:
                delete freq[fruits[left]]
            left += 1

        maxPicked = max(maxPicked, right - left + 1)

    return maxPicked
```

### 3.3 JavaScript Implementation

```javascript
/**
 * @param {number[]} fruits
 * @return {number}
 */
function totalFruit(fruits) {
    const freq = new Map();
    let left = 0;
    let maxPicked = 0;

    for (let right = 0; right < fruits.length; right++) {
        // Expand: add right fruit to basket
        freq.set(fruits[right], (freq.get(fruits[right]) || 0) + 1);

        // Shrink: while more than 2 fruit types
        while (freq.size > 2) {
            const leftFruit = fruits[left];
            freq.set(leftFruit, freq.get(leftFruit) - 1);
            if (freq.get(leftFruit) === 0) {
                freq.delete(leftFruit);
            }
            left++;
        }

        // Record best valid window
        maxPicked = Math.max(maxPicked, right - left + 1);
    }

    return maxPicked;
}
```

### 3.4 Time & Space Complexity

| Metric | Value | Derivation |
|--------|-------|------------|
| **Time** | **O(n)** | `right` moves n times; `left` moves ≤ n times total across the entire run. Each element is added/removed from the map at most once → 2n operations. |
| **Space** | **O(1)** | The map holds **at most 3 keys** (briefly, before we shrink) → constant extra space. |

### 3.5 Dry Run — `fruits = [1, 2, 3, 2, 2]`

| Step | `right` | `fruits[right]` | `freq` after expand | `freq.size > 2`? | Shrink action | `left` | Window | `maxPicked` |
|------|---------|-----------------|---------------------|-------------------|---------------|--------|--------|-------------|
| 1 | 0 | 1 | {1:1} | No | — | 0 | [0,0] len=1 | 1 |
| 2 | 1 | 2 | {1:1, 2:1} | No | — | 0 | [0,1] len=2 | 2 |
| 3 | 2 | 3 | {1:1, 2:1, 3:1} | **Yes** | remove fruits[0]=1 → {2:1,3:1}, left→1 | 1 | [1,2] len=2 | 2 |
| 4 | 3 | 2 | {2:2, 3:1} | No | — | 1 | [1,3] len=3 | 3 |
| 5 | 4 | 2 | {2:3, 3:1} | No | — | 1 | [1,4] len=4 | **4** |

**Result = 4** ✅

### 3.6 Trade-offs

- **Pros:** O(n) time, O(1) space, easy to generalise to "at most K distinct" values.
- **Cons:** Uses a HashMap with hashing overhead; the `while` loop makes reasoning slightly harder than a pure for-loop. In practice, negligible.

---

## 4. Optimal / Best Approach — Sliding Window (Same as Above)

The sliding window with a frequency map **is** the optimal approach for this problem. There is no way to do better than O(n) because we must inspect every element at least once. The O(1) space (constant-bounded map with ≤ 3 keys) is also optimal.

However, there is a **leaner variant** that avoids the HashMap entirely by tracking only the **last two fruit types and the index where the second type's contiguous run started**. This can be marginally faster in practice.

### 4.1 Intuition — The "Last-Two-Types" Trick

At any moment, the valid window's **rightmost portion** is a contiguous run of some fruit type `b`. Before that run, the window may contain a mix of types `a` and `b`. When a **third type `c`** appears:
- We **must** drop type `a` entirely.
- The new window starts right after the last occurrence of `a`, which is exactly `secondLastStart` — the index where `b`'s most recent contiguous run began.

We only need to track:
- `typeA`, `typeB` — the two current fruit types.
- `secondLastStart` — where `typeB`'s latest contiguous block began (this becomes `left` when we evict `typeA`).
- `left` — current window start.

### 4.2 Pseudocode

```
function maxFruits_Optimal(fruits):
    n = fruits.length
    if n == 0: return 0

    maxPicked = 0
    left = 0
    lastFruit = -1           // most recent fruit type
    secondLastStart = 0      // start of lastFruit's current contiguous run

    // We'll use the HashMap version as it's cleaner and equally optimal.
    // The "last-two" variant is shown below for educational value.

    freq = {}
    for right from 0 to n - 1:
        freq[fruits[right]] = (freq[fruits[right]] or 0) + 1

        while keys(freq).length > 2:
            freq[fruits[left]] -= 1
            if freq[fruits[left]] == 0:
                delete freq[fruits[left]]
            left += 1

        maxPicked = max(maxPicked, right - left + 1)

    return maxPicked
```

### 4.3 JavaScript Implementation (Clean HashMap Version — Interview Ready)

```javascript
/**
 * 904. Fruit Into Baskets
 * Optimal Sliding Window — O(n) time, O(1) space
 *
 * @param {number[]} fruits
 * @return {number}
 */
function totalFruit(fruits) {
    const freq = new Map();   // fruit_type → count in window
    let left = 0;
    let maxPicked = 0;

    for (let right = 0; right < fruits.length; right++) {
        // 1. Expand window: include fruits[right]
        freq.set(fruits[right], (freq.get(fruits[right]) || 0) + 1);

        // 2. Contract window: while we have > 2 distinct types
        while (freq.size > 2) {
            const lf = fruits[left];
            freq.set(lf, freq.get(lf) - 1);
            if (freq.get(lf) === 0) freq.delete(lf);
            left++;
        }

        // 3. Window [left..right] is valid — update answer
        maxPicked = Math.max(maxPicked, right - left + 1);
    }

    return maxPicked;
}
```

### 4.4 JavaScript Implementation (Lean "Last-Two-Types" Variant)

```javascript
/**
 * Lean O(n) variant — no HashMap, just track last two types.
 * Slightly faster in practice due to no hashing.
 *
 * @param {number[]} fruits
 * @return {number}
 */
function totalFruitLean(fruits) {
    const n = fruits.length;
    if (n <= 2) return n;

    let maxPicked = 1;
    let left = 0;

    // Track the start of the latest contiguous run of one fruit type
    let runStart = 0;

    // The two fruit types currently in our baskets
    let typeA = fruits[0];
    let typeB = -1;           // sentinel: not yet assigned

    for (let right = 1; right < n; right++) {
        const cur = fruits[right];

        if (cur !== typeA && cur !== typeB) {
            // Third type found — evict the older type
            // New window starts at runStart (beginning of previous contiguous block)
            left = runStart;
            typeA = fruits[right - 1]; // the type just before current
            typeB = cur;
        }

        // Update runStart whenever fruit type changes from previous tree
        if (cur !== fruits[right - 1]) {
            runStart = right;
        }

        maxPicked = Math.max(maxPicked, right - left + 1);
    }

    return maxPicked;
}
```

### 4.5 Correctness Proof (Invariants)

**Loop invariant (HashMap version):** At the end of each iteration, the window `[left, right]` contains **at most 2 distinct fruit types**, and `maxPicked` holds the length of the longest such window seen so far.

1. **Initialisation:** Before the loop, the window is empty (`left = 0`, `right` hasn't started), `maxPicked = 0`. Trivially valid.
2. **Maintenance:** When `fruits[right]` is added, if `freq.size` becomes 3, the `while` loop advances `left` and removes counts until `freq.size ≤ 2`. So the invariant is restored before we update `maxPicked`.
3. **Termination:** When the loop ends (`right = n`), every possible ending index has been considered. Because `left` only moves forward, and every valid window is a subarray ending at some `right` with `left ≤ start`, we never miss a valid window. Therefore `maxPicked` is the global optimum.

**Why we never miss the optimal window (by contradiction):** Suppose the optimal window is `[L*, R*]` with at most 2 types, and our algorithm reports a smaller answer. When `right = R*`, our `left` must satisfy `left ≤ L*` (since we only advance `left` when forced). So `right - left + 1 ≥ R* - L* + 1`, meaning we would have recorded at least that length. Contradiction.

### 4.6 Dry Run — `fruits = [0, 1, 2, 2]`

| Step | `right` | `fruits[right]` | `freq` after add | Shrink? | `left` | Window contents | Length | `maxPicked` |
|------|---------|-----------------|------------------|---------|--------|-----------------|--------|-------------|
| 1 | 0 | 0 | {0:1} | No | 0 | [0] | 1 | 1 |
| 2 | 1 | 1 | {0:1, 1:1} | No | 0 | [0,1] | 2 | 2 |
| 3 | 2 | 2 | {0:1, 1:1, 2:1} | **Yes**: remove 0→{}, left→1 → {1:1, 2:1} | 1 | [1,2] | 2 | 2 |
| 4 | 3 | 2 | {1:1, 2:2} | No | 1 | [1,2,2] | 3 | **3** |

**Result = 3** ✅ (subarray `[1, 2, 2]`)

### 4.7 Dry Run — `fruits = [1, 2, 3, 2, 2]`

| Step | `right` | `fruits[right]` | `freq` after add | Shrink? | `left` | Window | Length | `maxPicked` |
|------|---------|-----------------|------------------|---------|--------|--------|--------|-------------|
| 1 | 0 | 1 | {1:1} | No | 0 | [1] | 1 | 1 |
| 2 | 1 | 2 | {1:1,2:1} | No | 0 | [1,2] | 2 | 2 |
| 3 | 2 | 3 | {1:1,2:1,3:1} | **Yes**: remove 1→{}, left→1 → {2:1,3:1} | 1 | [2,3] | 2 | 2 |
| 4 | 3 | 2 | {2:2,3:1} | No | 1 | [2,3,2] | 3 | 3 |
| 5 | 4 | 2 | {2:3,3:1} | No | 1 | [2,3,2,2] | 4 | **4** |

**Result = 4** ✅

### 4.8 Tight Complexity

| Metric | Value | Notes |
|--------|-------|-------|
| **Time** | **Θ(n)** | Each element is visited by `right` exactly once (+1) and by `left` at most once (+1) → **≤ 2n** operations total. |
| **Space** | **Θ(1)** | The frequency map never holds more than 3 entries. No other data structures grow with `n`. |

**Practical performance:** On `n = 10⁵`, this processes in **< 5 ms** on modern hardware. The HashMap version has a small constant due to hashing; the "last-two-types" variant avoids this but is harder to generalise.

---

## 5. Interview-Ready Verbal Explanation (60–90 seconds)

> "This problem asks for the longest contiguous subarray with at most two distinct values — that's just the sliding window pattern.
>
> I maintain a window `[left, right]` and a frequency map tracking how many of each fruit type are inside the window. I expand `right` one step at a time. Each time I add a new fruit, if the map grows beyond two keys — meaning I've seen a third type — I shrink from the left: I decrement counts and delete zero-count entries until I'm back to two types or fewer.
>
> After ensuring the window is valid, I update my answer with the current window length `right − left + 1`.
>
> **Why it's correct:** `left` never moves backwards, so every valid subarray ending at each `right` is considered. The `while` loop guarantees the invariant that the window always has at most two distinct types.
>
> **Complexity:** O(n) time — each element enters and leaves the window at most once, so it's 2n operations total. O(1) space — the map holds at most three entries at any moment."

---

## 6. Visual Diagram — How the Window Slides

```
fruits = [1, 2, 3, 2, 2]

Step 1:  [ 1 ] 2   3   2   2       window = {1}       len = 1
          L,R

Step 2:  [ 1   2 ] 3   2   2       window = {1,2}     len = 2
          L    R

Step 3:    1 [ 2   3 ] 2   2       window = {2,3}     len = 2
               L   R
          ↑ evicted '1' — 3rd type '3' forced shrink

Step 4:    1 [ 2   3   2 ] 2       window = {2,3}     len = 3
               L       R

Step 5:    1 [ 2   3   2   2 ]     window = {2,3}     len = 4  ★ answer
               L           R

The window stretches as far right as possible,
only shrinking from the left when a 3rd fruit type appears.
```

---

## 7. Summary Comparison

| Approach | Time | Space | Key Idea |
|----------|------|-------|----------|
| Brute-force (all starts) | O(n²) | O(1) | Try every starting index, walk right until 3rd type |
| Sliding Window + HashMap | **O(n)** | **O(1)** | Expand right, shrink left when > 2 types |
| Lean Last-Two-Types | **O(n)** | **O(1)** | Track only last two types + run start (no HashMap) |

The **sliding window with frequency map** is the recommended interview solution: it's clean, correct, and trivially generalises to "at most K distinct types" by changing the `> 2` check to `> K`.
