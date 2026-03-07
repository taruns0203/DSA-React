# 1004. Max Consecutive Ones III — Complete Guide

---

## 1. High-Level Interpretation

You have a binary array (`0`s and `1`s) and a budget `k` – the maximum number of `0`s you're allowed to **flip** to `1`. Your goal is to find the **longest contiguous subarray of all `1`s** achievable after performing at most `k` flips. In other words: find the **longest subarray that contains at most `k` zeros**.

**Hidden traps to watch for:**
- You're **not** actually flipping anything — this is a reframing into "longest subarray with at most `k` zeros," which is a classic sliding window pattern.
- `k` can be **0** (no flips allowed — just find the longest run of existing `1`s).
- `k` can equal `nums.length` (flip everything — answer is just `n`).
- Window length is `right − left + 1`, not `right − left` (off-by-one).
- The array only contains `0` and `1` — no negatives, no other values. This simplifies bookkeeping.

---

## 2. Brute-Force Approach

### 2.1 Idea in Plain Words

Try **every possible subarray** `[i, j]`. For each one, count how many `0`s it contains. If that count is ≤ `k`, it's a valid window (we could flip those zeros). Track the longest such valid subarray.

### 2.2 Pseudocode

```
function longestOnes_BruteForce(nums, k):
    n = nums.length
    maxLen = 0

    for i from 0 to n - 1:            // start of subarray
        zeroCount = 0
        for j from i to n - 1:        // end of subarray
            if nums[j] == 0:
                zeroCount += 1
            if zeroCount > k:
                break                  // too many zeros, extending won't help
            maxLen = max(maxLen, j - i + 1)

    return maxLen
```

### 2.3 Time & Space Complexity

| Metric | Value | Derivation |
|--------|-------|------------|
| **Time** | **O(n²)** | Outer loop runs `n` times. Inner loop runs up to `n` times for each `i`. Worst-case (all `1`s or large `k`) means `j` runs to the end every time → `n × n / 2` operations. |
| **Space** | **O(1)** | Only a few integer variables (`zeroCount`, `maxLen`). No extra data structures. |

### 2.4 Dry Run — `nums = [1,1,1,0,0,0,1,1,1,1,0], k = 2`

We'll show key starting indices rather than all 11:

| `i` | `j` journey | `zeroCount` at each `j` | Break point | Best `j−i+1` this round |
|-----|-------------|-------------------------|-------------|-------------------------|
| 0 | j=0→0, j=1→0, j=2→0, j=3→**1**, j=4→**2**, j=5→**3** → break | 0,0,0,1,2,3 | j=5 (3rd zero) | **5** (subarray [0..4]) |
| 1 | j=1→0, j=2→0, j=3→**1**, j=4→**2**, j=5→**3** → break | 0,0,1,2,3 | j=5 | **4** |
| 2 | j=2→0, j=3→**1**, j=4→**2**, j=5→**3** → break | 0,1,2,3 | j=5 | **3** |
| 3 | j=3→**1**, j=4→**2**, j=5→3→break… but wait, let's continue: j=5→**3** → break | 1,2,3 | j=5 | **2** |
| 4 | j=4→**1**, j=5→**2**, j=6→2, j=7→2, j=8→2, j=9→2, j=10→**3** → break | 1,2,2,2,2,2,3 | j=10 | **6** ← best! |
| 5 | j=5→**1**, j=6→1, j=7→1, j=8→1, j=9→1, j=10→**2** → end | 1,1,1,1,1,2 | end | **6** |
| 6..10 | Smaller windows | — | — | ≤ 5 |

**Global max = 6** ✅ (subarray `[0,0,1,1,1,1,0]` at indices [4..9] with 2 zeros flipped, or equivalently indices [5..10])

### 2.5 Why This Fails at Scale

With `n = 10⁵`, worst case is **~5 × 10⁹** iterations (e.g., `k = n` means the inner loop always runs to the end). This is far too slow.

---

## 3. Improved Approach — Sliding Window (Standard Shrink)

### 3.1 What Changed and Why

Instead of restarting from scratch for each `i`, maintain a **sliding window `[left, right]`** and a running count of zeros inside it:

1. **Expand** `right` — if `nums[right] == 0`, increment `zeroCount`.
2. **If `zeroCount > k`**, shrink from `left`: if `nums[left] == 0`, decrement `zeroCount`; advance `left`.
3. After restoring validity, the window `[left, right]` has ≤ `k` zeros. Record its length.

**Why it's faster:** each element is added once (by `right`) and removed at most once (by `left`). Total work: **2n** operations → O(n).

### 3.2 Pseudocode

```
function longestOnes_SlidingWindow(nums, k):
    left = 0
    zeroCount = 0
    maxLen = 0

    for right from 0 to n - 1:
        if nums[right] == 0:
            zeroCount += 1

        while zeroCount > k:          // too many zeros — shrink
            if nums[left] == 0:
                zeroCount -= 1
            left += 1

        maxLen = max(maxLen, right - left + 1)

    return maxLen
```

### 3.3 JavaScript Implementation

```javascript
/**
 * @param {number[]} nums
 * @param {number} k
 * @return {number}
 */
function longestOnes(nums, k) {
    let left = 0;
    let zeroCount = 0;
    let maxLen = 0;

    for (let right = 0; right < nums.length; right++) {
        // Expand: include nums[right]
        if (nums[right] === 0) {
            zeroCount++;
        }

        // Shrink: while too many zeros
        while (zeroCount > k) {
            if (nums[left] === 0) {
                zeroCount--;
            }
            left++;
        }

        // Window [left..right] has ≤ k zeros — record length
        maxLen = Math.max(maxLen, right - left + 1);
    }

    return maxLen;
}
```

### 3.4 Time & Space Complexity

| Metric | Value | Derivation |
|--------|-------|------------|
| **Time** | **O(n)** | `right` increments `n` times. `left` increments at most `n` times total across all iterations. Each element enters/leaves window at most once → **≤ 2n** operations. |
| **Space** | **O(1)** | Three integer variables. No additional data structures. |

### 3.5 Dry Run — `nums = [1,1,1,0,0,0,1,1,1,1,0], k = 2`

| Step | `right` | `nums[r]` | `zeroCount` after add | Shrink? | `left` after | Window `[l..r]` | Length | `maxLen` |
|------|---------|-----------|----------------------|---------|--------------|-----------------|--------|----------|
| 1 | 0 | 1 | 0 | No | 0 | [0..0] | 1 | 1 |
| 2 | 1 | 1 | 0 | No | 0 | [0..1] | 2 | 2 |
| 3 | 2 | 1 | 0 | No | 0 | [0..2] | 3 | 3 |
| 4 | 3 | 0 | **1** | No | 0 | [0..3] | 4 | 4 |
| 5 | 4 | 0 | **2** | No | 0 | [0..4] | 5 | 5 |
| 6 | 5 | 0 | **3** | **Yes**: nums[0]=1→skip, left=1; nums[1]=1→skip, left=2; nums[2]=1→skip, left=3; nums[3]=0→zc=2, left=4 | 4 | [4..5] | 2 | 5 |
| 7 | 6 | 1 | 2 | No | 4 | [4..6] | 3 | 5 |
| 8 | 7 | 1 | 2 | No | 4 | [4..7] | 4 | 5 |
| 9 | 8 | 1 | 2 | No | 4 | [4..8] | 5 | 5 |
| 10 | 9 | 1 | 2 | No | 4 | [4..9] | **6** | **6** |
| 11 | 10 | 0 | **3** | **Yes**: nums[4]=0→zc=2, left=5 | 5 | [5..10] | **6** | **6** |

**Result = 6** ✅

### 3.6 Trade-offs

- **Pros:** O(n) time, O(1) space, extremely clean and easy to reason about.
- **Cons:** None meaningful — this is already optimal. The `while` loop can be replaced with an `if` for a "non-shrinking" variant (see below).

---

## 4. Optimal / Best Approach — Non-Shrinking Sliding Window

### 4.1 Intuition

The standard sliding window above **is** already optimal at O(n) time, O(1) space. But there's an elegant variant: instead of shrinking the window until it's valid, we **never shrink** — the window either **grows** (when the new element keeps us ≤ k zeros) or **slides** (both `left` and `right` advance by 1, maintaining the same size).

**Key insight:** once we've found a window of size `W`, there's no point having a *smaller* window — we only care about *longer* ones. So when we encounter a violation (`zeroCount > k`), we just slide the window forward by 1 (move both `left` and `right`). The window never shrinks below the best size we've found.

At the end, the answer is simply `right - left` (since `right = n` after the loop and `left` is wherever it ended up).

### 4.2 Pseudocode

```
function longestOnes_NonShrink(nums, k):
    left = 0
    zeroCount = 0

    for right from 0 to n - 1:
        if nums[right] == 0:
            zeroCount += 1

        if zeroCount > k:             // NOTE: 'if', not 'while'
            if nums[left] == 0:
                zeroCount -= 1
            left += 1

    return n - left                   // final window size
```

### 4.3 JavaScript Implementation (Non-Shrinking Variant)

```javascript
/**
 * 1004. Max Consecutive Ones III
 * Non-shrinking sliding window — O(n) time, O(1) space
 *
 * @param {number[]} nums
 * @param {number} k
 * @return {number}
 */
function longestOnes(nums, k) {
    let left = 0;
    let zeroCount = 0;
    const n = nums.length;

    for (let right = 0; right < n; right++) {
        // Expand: include nums[right]
        if (nums[right] === 0) {
            zeroCount++;
        }

        // Slide (not shrink): if too many zeros, move left by 1
        if (zeroCount > k) {
            if (nums[left] === 0) {
                zeroCount--;
            }
            left++;
        }
    }

    // The window size at the end is the answer
    return n - left;
}
```

### 4.4 JavaScript Implementation (Standard While-Shrink — Interview Recommended)

```javascript
/**
 * Standard sliding window — clearer to explain in an interview.
 *
 * @param {number[]} nums
 * @param {number} k
 * @return {number}
 */
function longestOnes(nums, k) {
    let left = 0;
    let zeroCount = 0;
    let maxLen = 0;

    for (let right = 0; right < nums.length; right++) {
        if (nums[right] === 0) zeroCount++;

        while (zeroCount > k) {
            if (nums[left] === 0) zeroCount--;
            left++;
        }

        maxLen = Math.max(maxLen, right - left + 1);
    }

    return maxLen;
}
```

### 4.5 Correctness Proof (Invariants)

**Loop invariant (while-shrink version):** At the end of every iteration, the window `[left, right]` contains **at most `k` zeros**, and `maxLen` equals the length of the longest such window seen so far.

1. **Initialisation:** Before the loop, the window is empty, `zeroCount = 0 ≤ k`, `maxLen = 0`. Trivially valid.
2. **Maintenance:** Adding `nums[right]` may push `zeroCount` above `k`. The `while` loop advances `left` (decrementing `zeroCount` when a zero leaves) until `zeroCount ≤ k`. The invariant is restored. Then `maxLen` is updated.
3. **Termination:** After `right = n − 1`, every ending position has been considered. Because `left` only moves forward, all valid windows are covered.

**Why no valid window is missed (by contradiction):**
Suppose the optimal answer is `[L*, R*]` with ≤ k zeros, and we report a smaller value. When `right = R*`, our `left ≤ L*` (since `left` only advances when forced by too many zeros). So `right - left + 1 ≥ R* - L* + 1`, and we'd have recorded at least that length. Contradiction.

### 4.6 Dry Run — `nums = [1,1,1,0,0,0,1,1,1,1,0], k = 2` (Non-shrinking variant)

| Step | `right` | `nums[r]` | `zeroCount` | `zc > k`? | Action | `left` | Window size `r−l+1` |
|------|---------|-----------|-------------|-----------|--------|--------|---------------------|
| 1 | 0 | 1 | 0 | No | — | 0 | 1 |
| 2 | 1 | 1 | 0 | No | — | 0 | 2 |
| 3 | 2 | 1 | 0 | No | — | 0 | 3 |
| 4 | 3 | 0 | 1 | No | — | 0 | 4 |
| 5 | 4 | 0 | 2 | No | — | 0 | 5 |
| 6 | 5 | 0 | **3** | **Yes** | nums[0]=1, left→1 | 1 | 5 (window slides, doesn't grow) |
| 7 | 6 | 1 | 3 | **Yes** | nums[1]=1, left→2 | 2 | 5 |
| 8 | 7 | 1 | 3 | **Yes** | nums[2]=1, left→3 | 3 | 5 |
| 9 | 8 | 1 | 3 | **Yes** | nums[3]=0→zc=**2**, left→4 | 4 | 5 |
| 10 | 9 | 1 | 2 | No | — | 4 | **6** (window grows!) |
| 11 | 10 | 0 | **3** | **Yes** | nums[4]=0→zc=**2**, left→5 | 5 | **6** |

**`n - left = 11 - 5 = 6`** ✅

> Notice: in the non-shrinking variant, the window **never decreased** below size 5 once it reached 5, then grew to 6 and stayed there.

### 4.7 Dry Run — `nums = [0,0,1,1,0,0,1,1,1,0,1,1,0,0,0,1,1,1,1], k = 3`

| Step | `r` | `nums[r]` | `zc` | `zc>3`? | `left` | Window |
|------|-----|-----------|------|---------|--------|--------|
| 1 | 0 | 0 | 1 | No | 0 | 1 |
| 2 | 1 | 0 | 2 | No | 0 | 2 |
| 3 | 2 | 1 | 2 | No | 0 | 3 |
| 4 | 3 | 1 | 2 | No | 0 | 4 |
| 5 | 4 | 0 | 3 | No | 0 | 5 |
| 6 | 5 | 0 | **4** | **Yes** → nums[0]=0, zc=3, left→1 | 1 | 5 |
| 7 | 6 | 1 | 3 | No | 1 | 6 |
| 8 | 7 | 1 | 3 | No | 1 | 7 |
| 9 | 8 | 1 | 3 | No | 1 | 8 |
| 10 | 9 | 0 | **4** | **Yes** → nums[1]=0, zc=3, left→2 | 2 | 8 |
| 11 | 10 | 1 | 3 | No | 2 | 9 |
| 12 | 11 | 1 | 3 | No | 2 | **10** |
| 13 | 12 | 0 | **4** | **Yes** → nums[2]=1, left→3 | 3 | 10 |
| 14 | 13 | 0 | **5** | **Yes** → nums[3]=1, left→4 | 4 | 10 |
| 15 | 14 | 0 | **6** | **Yes** → nums[4]=0, zc=5, left→5 | 5 | 10 |
| 16 | 15 | 1 | 5 | **Yes** → nums[5]=0, zc=4, left→6 | 6 | 10 |
| 17 | 16 | 1 | 4 | **Yes** → nums[6]=1, left→7 | 7 | 10 |
| 18 | 17 | 1 | 4 | **Yes** → nums[7]=1, left→8 | 8 | 10 |
| 19 | 18 | 1 | 4 | **Yes** → nums[8]=1, left→9 | 9 | 10 |

**`n - left = 19 - 9 = 10`** ✅

### 4.8 Tight Complexity

| Metric | Value | Notes |
|--------|-------|-------|
| **Time** | **Θ(n)** | `right` visits each element once. `left` moves at most `n` times total (while-shrink) or exactly once per step (non-shrink). Either way: ≤ **2n** operations. |
| **Space** | **Θ(1)** | Only `left`, `zeroCount`, `maxLen` — constant extra space. |

**Practical performance:** On `n = 10⁵`, this runs in **< 3 ms**. The non-shrinking variant is marginally faster (no inner loop, strictly one comparison per step) but both are excellent.

---

## 5. Interview-Ready Verbal Explanation (60–90 seconds)

> "This problem asks for the longest subarray of all ones if we can flip at most `k` zeros. The key reframing is: find the **longest subarray containing at most `k` zeros**.
>
> I use a sliding window with two pointers, `left` and `right`, and a counter `zeroCount` tracking how many zeros are in the current window.
>
> I expand `right` one step at a time. If `nums[right]` is 0, I increment `zeroCount`. Whenever `zeroCount` exceeds `k`, I shrink from the left: if `nums[left]` is 0, I decrement `zeroCount`, then advance `left`. This ensures the window always has at most `k` zeros.
>
> After each adjustment, I update `maxLen = max(maxLen, right − left + 1)`.
>
> **Why it's correct:** `left` never moves backward, so every valid subarray ending at each `right` is considered. The while loop restores the invariant that the window has at most `k` zeros.
>
> **Complexity:** O(n) time — each element enters and exits the window at most once. O(1) space — just three integer variables."

---

## 6. Visual Diagram — How the Window Slides

```
nums = [1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0]    k = 2
         0  1  2  3  4  5  6  7  8  9  10

Step 5:  [1  1  1  0  0] 0  1  1  1  1  0     zeros=2  len=5  ✓ valid
          L           R

Step 6:  [1  1  1  0  0  0] ← 3 zeros! Must shrink
          L              R
         → shrink left past the first zero:
             1  1  1 [0  0  0] still 3 zeros, need more
                      L     R
         → continue...
                   1  1 [0  0] ← wait, we shrink one at a time:
         Actually with while loop, left jumps to 4:
                         [0  0] still 2 zeros ← but left moves to first zero
          After shrink:
                      1 [0  0] ← no, let me redo clearly:

         nums[0]=1 → left=1 (zc stays 3)
         nums[1]=1 → left=2 (zc stays 3)  
         nums[2]=1 → left=3 (zc stays 3)
         nums[3]=0 → left=4 (zc drops to 2) ← STOP shrinking
                         [0  0] window = [4..5], len=2
                          L  R

Step 10:                  [0  0  1  1  1  1] zeros=2  len=6  ★ BEST
                           L              R

Step 11:                     [0  1  1  1  1  0] zeros=2  len=6  ★ tied
                              L              R

Answer: 6

Window visualization over time:
┌─────────────────────────────────────────────────┐
│ The window grows until it hits too many zeros,  │
│ then slides right (shrinking from left) until   │
│ valid, then grows again. It never needs to      │
│ restart from scratch!                           │
└─────────────────────────────────────────────────┘
```

---

## 7. Summary Comparison

| Approach | Time | Space | Key Idea |
|----------|------|-------|----------|
| Brute-force (all subarrays) | O(n²) | O(1) | Try every `[i,j]`, count zeros |
| Sliding Window (while-shrink) | **O(n)** | **O(1)** | Expand right, shrink left when zeros > k |
| Sliding Window (non-shrink) | **O(n)** | **O(1)** | Window only grows or slides — never shrinks |

The **while-shrink sliding window** is the recommended interview answer: it's clean, easy to explain, and trivially generalises (e.g., "at most k of some element," or "at most k distinct characters").
