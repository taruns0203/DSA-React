# 581. Shortest Unsorted Continuous Subarray

---

## 1. High-Level Interpretation

**What the problem asks:** Given an array `nums`, find the shortest continuous subarray that, if sorted, makes the entire array sorted in non-decreasing order. Return the length of that subarray (0 if already sorted).

**Why it matters:** This is a classic problem that tests your understanding of sorted-order invariants and boundary detection. It appears in stream processing (finding corruption windows), data validation, and undo systems.

**Hidden traps:**

| Trap | Detail |
|---|---|
| **Already sorted** | Must return 0, not the full length. |
| **Duplicates** | `[1, 3, 2, 2, 2]` — the unsorted window includes all the 2s. |
| **Unsorted at edges** | `[2, 1]` — the entire array is the answer. |
| **Plateau then drop** | `[1, 3, 2, 3, 3]` — tricky: the 3 at index 1 is "too big" even though 3 appears later. |
| **Single element** | Always sorted → return 0. |
| **Off-by-one** | The boundaries are inclusive — don't miss the first or last displaced element. |

---

## 2. Brute-Force Approach — Sort & Compare

### 2.1 Idea in Plain Words

> Sort a copy of the array. Compare the original with the sorted version. The **first** index where they differ is the left boundary of the unsorted subarray. The **last** index where they differ is the right boundary. The length is `right - left + 1`.
>
> If they never differ, the array is already sorted → return 0.

### 2.2 Pseudocode

```
function findUnsortedSubarray(nums):
    sorted = copy of nums, sorted in non-decreasing order
    left = -1
    right = -1

    for i from 0 to n-1:
        if nums[i] != sorted[i]:
            if left == -1:
                left = i
            right = i

    if left == -1:
        return 0
    return right - left + 1
```

### 2.3 JavaScript Implementation

```javascript
function findUnsortedSubarray(nums) {
  const sorted = [...nums].sort((a, b) => a - b);
  let left = -1, right = -1;

  for (let i = 0; i < nums.length; i++) {
    if (nums[i] !== sorted[i]) {
      if (left === -1) left = i;
      right = i;
    }
  }

  return left === -1 ? 0 : right - left + 1;
}
```

### 2.4 Time & Space Complexity

| Metric | Value | Derivation |
|---|---|---|
| **Time** | **O(n log n)** | Sorting dominates. Comparison is O(n). |
| **Space** | **O(n)** | Copy of the array for sorting. |

### 2.5 Dry Run — `nums = [2, 6, 4, 8, 10, 9, 15]`

| Index | nums[i] | sorted[i] | Match? | left | right |
|---|---|---|---|---|---|
| 0 | 2 | 2 | ✅ | -1 | -1 |
| 1 | 6 | 4 | ❌ | **1** | **1** |
| 2 | 4 | 6 | ❌ | 1 | **2** |
| 3 | 8 | 8 | ✅ | 1 | 2 |
| 4 | 10 | 9 | ❌ | 1 | **4** |
| 5 | 9 | 10 | ❌ | 1 | **5** |
| 6 | 15 | 15 | ✅ | 1 | 5 |

**Result:** `right - left + 1 = 5 - 1 + 1 =` **5** ✅

### Dry Run — `nums = [1, 2, 3, 4]`

All elements match their sorted counterpart → `left = -1` → return **0** ✅

### 2.6 Why This Approach Is Sub-Optimal

O(n log n) time and O(n) space. The follow-up asks for O(n) time. We can avoid sorting entirely by reasoning about which elements are "out of place."

---

## 3. Improved Approach — Monotonic Stack

### 3.1 What Changed and Why

Instead of sorting, we use a **monotonic stack** to find the left and right boundaries directly:

1. **Left boundary:** Scan left-to-right with an increasing stack. When we find an element smaller than the stack top, the elements being popped are "out of place." The smallest index popped gives us `left`.
2. **Right boundary:** Scan right-to-left with a decreasing stack. When we find an element larger than the stack top, the largest index popped gives us `right`.

This avoids the O(n log n) sort while being very intuitive: the stack detects where the sorted order is violated.

### 3.2 Pseudocode

```
function findUnsortedSubarray(nums):
    n = length(nums)
    left = n, right = 0
    stack = []

    // Find left boundary (scan L→R, increasing stack)
    for i from 0 to n-1:
        while stack is not empty and nums[stack.top] > nums[i]:
            left = min(left, stack.pop())
        stack.push(i)

    stack = []

    // Find right boundary (scan R→L, decreasing stack)
    for i from n-1 down to 0:
        while stack is not empty and nums[stack.top] < nums[i]:
            right = max(right, stack.pop())
        stack.push(i)

    if right > left:
        return right - left + 1
    return 0
```

### 3.3 JavaScript Implementation

```javascript
function findUnsortedSubarray(nums) {
  const n = nums.length;
  let left = n, right = 0;
  const stack = [];

  // Left boundary: increasing stack, scan L→R
  for (let i = 0; i < n; i++) {
    while (stack.length && nums[stack[stack.length - 1]] > nums[i]) {
      left = Math.min(left, stack.pop());
    }
    stack.push(i);
  }

  stack.length = 0;

  // Right boundary: decreasing stack, scan R→L
  for (let i = n - 1; i >= 0; i--) {
    while (stack.length && nums[stack[stack.length - 1]] < nums[i]) {
      right = Math.max(right, stack.pop());
    }
    stack.push(i);
  }

  return right > left ? right - left + 1 : 0;
}
```

### 3.4 Time & Space Complexity

| Metric | Value | Derivation |
|---|---|---|
| **Time** | **O(n)** | Each element pushed/popped at most once per pass. Two passes = O(2n) = O(n). |
| **Space** | **O(n)** | Stack can hold up to n elements. |

### 3.5 Dry Run — `nums = [2, 6, 4, 8, 10, 9, 15]`

**Pass 1 (L→R, increasing stack → find left):**

| i | nums[i] | Stack (indices) | Pop? | left |
|---|---|---|---|---|
| 0 | 2 | [0] | — | 7 |
| 1 | 6 | [0,1] | — | 7 |
| 2 | 4 | [0,1] → pop 1 → [0,2] | pop idx 1 | **1** |
| 3 | 8 | [0,2,3] | — | 1 |
| 4 | 10 | [0,2,3,4] | — | 1 |
| 5 | 9 | [0,2,3,4] → pop 4 → [0,2,3,5] | pop idx 4 | 1 |
| 6 | 15 | [0,2,3,5,6] | — | 1 |

`left = 1`

**Pass 2 (R→L, decreasing stack → find right):**

| i | nums[i] | Stack (indices) | Pop? | right |
|---|---|---|---|---|
| 6 | 15 | [6] | — | 0 |
| 5 | 9 | [6,5] | — | 0 |
| 4 | 10 | [6,5] → pop 5 → [6,4] | pop idx 5 | **5** |
| 3 | 8 | [6,4,3] | — | 5 |
| 2 | 4 | [6,4,3,2] | — | 5 |
| 1 | 6 | [6,4,3,2] → pop 2 → [6,4,3,1] | pop idx 2 | 5 |
| 0 | 2 | [6,4,3,1,0] | — | 5 |

`right = 5`

**Result:** `5 - 1 + 1 =` **5** ✅

### 3.6 Trade-offs

- **Pro:** O(n) time, very clear "violation detection" logic.
- **Con:** O(n) space for the stack. Can we do O(1) space?

---

## 4. Optimal Approach — Two-Pass Min/Max Scan (O(1) Space)

### 4.1 Intuition

The key insight comes from asking: **what makes an element "displaced"?**

- An element is displaced if it can't stay at its current position in a sorted array.
- **From the right:** If we scan left-to-right and track the running `max`, any element **less than** the running max is out of place (something bigger came before it). The **last** such position is the **right boundary**.
- **From the left:** If we scan right-to-left and track the running `min`, any element **greater than** the running min is out of place (something smaller comes after it). The **last** such position (first from left) is the **left boundary**.

```
nums = [2, 6, 4, 8, 10, 9, 15]

L→R max scan:  2  6  6  8  10  10  15
               ✓  ✓  ✗  ✓   ✓   ✗   ✓
                      ↑               ↑
                   4 < 6           9 < 10
                                   right = 5

R→L min scan: 2  4  4  8   9   9  15
              ✓  ✗  ✓  ✓   ✓   ✓   ✓
                 ↑
              6 > 4
              left = 1
```

### 4.2 Pseudocode

```
function findUnsortedSubarray(nums):
    n = length(nums)
    maxSeen = -Infinity
    minSeen = Infinity
    right = -1
    left = -1

    // Pass 1: L→R, track max, find right boundary
    for i from 0 to n-1:
        if nums[i] < maxSeen:
            right = i
        else:
            maxSeen = nums[i]

    // Pass 2: R→L, track min, find left boundary
    for i from n-1 down to 0:
        if nums[i] > minSeen:
            left = i
        else:
            minSeen = nums[i]

    if right == -1:
        return 0
    return right - left + 1
```

### 4.3 JavaScript Implementation

```javascript
/**
 * @param {number[]} nums
 * @return {number}
 */
function findUnsortedSubarray(nums) {
  const n = nums.length;
  let maxSeen = -Infinity, minSeen = Infinity;
  let left = -1, right = -1;

  // L→R: any element < maxSeen is displaced → rightmost is right boundary
  for (let i = 0; i < n; i++) {
    if (nums[i] < maxSeen) {
      right = i;
    } else {
      maxSeen = nums[i];
    }
  }

  // R→L: any element > minSeen is displaced → leftmost is left boundary
  for (let i = n - 1; i >= 0; i--) {
    if (nums[i] > minSeen) {
      left = i;
    } else {
      minSeen = nums[i];
    }
  }

  return right === -1 ? 0 : right - left + 1;
}
```

### 4.4 Correctness Proof

**Claim:** The algorithm correctly finds the shortest subarray whose sorting makes the entire array sorted.

> **Right boundary (L→R scan):**
> - `maxSeen` tracks the maximum of `nums[0..i]`.
> - If `nums[i] < maxSeen`, then there exists some earlier element > `nums[i]`, so `nums[i]` is displaced (would need to move left in a sorted array). We must include it in the subarray.
> - The **last** such index gives the right boundary: everything after this point is already in correct relative order.
>
> **Left boundary (R→L scan):**
> - `minSeen` tracks the minimum of `nums[i..n-1]`.
> - If `nums[i] > minSeen`, then there exists some later element < `nums[i]`, so `nums[i]` is displaced (would need to move right in a sorted array).
> - The **last** such index (from R→L, so leftmost) gives the left boundary.
>
> **Minimality:** Any subarray shorter than `[left, right]` would leave at least one displaced element outside the sorted range, which contradicts correctness.
>
> **Already sorted:** If no element violates `nums[i] < maxSeen`, then `right` stays `-1` → return 0. ∎

### 4.5 Dry Run — `nums = [2, 6, 4, 8, 10, 9, 15]`

**Pass 1 (L→R):**

| i | nums[i] | maxSeen | nums[i] < maxSeen? | right |
|---|---|---|---|---|
| 0 | 2 | 2 | ❌ (update max) | -1 |
| 1 | 6 | 6 | ❌ (update max) | -1 |
| 2 | 4 | 6 | ✅ (4 < 6) | **2** |
| 3 | 8 | 8 | ❌ (update max) | 2 |
| 4 | 10 | 10 | ❌ (update max) | 2 |
| 5 | 9 | 10 | ✅ (9 < 10) | **5** |
| 6 | 15 | 15 | ❌ (update max) | 5 |

`right = 5`

**Pass 2 (R→L):**

| i | nums[i] | minSeen | nums[i] > minSeen? | left |
|---|---|---|---|---|
| 6 | 15 | 15 | ❌ (update min) | -1 |
| 5 | 9 | 9 | ❌ (update min) | -1 |
| 4 | 10 | 9 | ✅ (10 > 9) | **4** |
| 3 | 8 | 8 | ❌ (update min) | 4 |
| 2 | 4 | 4 | ❌ (update min) | 4 |
| 1 | 6 | 4 | ✅ (6 > 4) | **1** |
| 0 | 2 | 2 | ❌ (update min) | 1 |

`left = 1`

**Result:** `5 - 1 + 1 =` **5** ✅

### Dry Run — `nums = [1, 2, 3, 4]`

Pass 1: maxSeen goes 1→2→3→4, no element < maxSeen → `right = -1` → return **0** ✅

### Dry Run — `nums = [2, 1]`

Pass 1: max=2, nums[1]=1 < 2 → right=1. Pass 2: min=1, nums[0]=2 > 1 → left=0. Result: `1 - 0 + 1 =` **2** ✅

### 4.6 Time & Space Complexity

| Metric | Value | Detail |
|---|---|---|
| **Time** | **O(n)** | Two passes through the array. |
| **Space** | **O(1)** | Only 4 extra variables. |

---

## 5. Comparison of All Approaches

| Approach | Time | Space | Key Idea |
|---|---|---|---|
| Sort & compare | O(n log n) | O(n) | Compare with sorted copy |
| Monotonic stack | O(n) | O(n) | Stack detects order violations |
| **Min/Max scan** | **O(n)** | **O(1)** | Running max (L→R) + running min (R→L) |

---

## 6. Interview-Ready Explanation (60–90 seconds)

> "I use two passes with O(1) space. The key insight is that an element is 'displaced' if a larger element exists before it or a smaller element exists after it.
>
> In the first pass, I scan left-to-right tracking the running max. Any element smaller than the running max is out of place — the rightmost such index is the right boundary.
>
> In the second pass, I scan right-to-left tracking the running min. Any element larger than the running min is out of place — the leftmost such index is the left boundary.
>
> The answer is `right - left + 1`. If no element is displaced, the array is already sorted and I return 0.
>
> This runs in O(n) time and O(1) space — two passes, four variables."

---

## 7. Visual Diagram — Two-Pass Scan

```
nums = [2, 6, 4, 8, 10, 9, 15]
         0  1  2  3   4  5   6

═══ Pass 1: L→R — track maxSeen, find RIGHT boundary ═══

  maxSeen: 2  6  6  8  10  10  15
           ↓  ↓  ↓  ↓   ↓   ↓   ↓
  nums:    2  6  4  8  10   9  15
                 ✗           ✗
                 4<6         9<10
                             right=5

═══ Pass 2: R→L — track minSeen, find LEFT boundary ═══

  minSeen: 2  4  4  8   9   9  15
           ↓  ↓  ↓  ↓   ↓   ↓   ↓
  nums:    2  6  4  8  10   9  15
              ✗          ✗
              6>4       10>9
              left=1

═══ Answer ═══

  [ 2, | 6,  4,  8, 10,  9, | 15 ]
       ↑                     ↑
     left=1              right=5

  Length = 5 - 1 + 1 = 5

  Sort only the middle → [2, 4, 6, 8, 9, 10, 15] ✅
```
