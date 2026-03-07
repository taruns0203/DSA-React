# 1423. Maximum Points You Can Obtain from Cards — Complete Explanation

---

## High-Level Interpretation

You have a row of cards with point values. You must pick **exactly `k` cards**, but each pick must come from the **left end or the right end** of the remaining row. You want to **maximise the total points**.

Because every card you take is from an edge, the `k` chosen cards always form a **prefix of length `left`** plus a **suffix of length `right = k − left`** (with `0 ≤ left ≤ k`). Recognising this structure is the key insight — it converts a seemingly combinatorial problem into a simple enumeration of "how many from the left, how many from the right".

**Hidden traps:**
- You might think you can pick any combination of cards — you can't; only endpoints.
- `k` can equal `n` (take all cards).
- All values are positive (`≥ 1`), so there are no negative-value tricks.

---

## 1. Brute-Force Approach: Recursion / Try All Combinations

### Idea

At each of the `k` steps we have two choices: take the leftmost remaining card or the rightmost remaining card. We try **every** combination recursively and return the maximum sum.

### Pseudocode

```
function maxScore(cards, k):
    return solve(cards, 0, cards.length - 1, k)

function solve(cards, left, right, remaining):
    if remaining == 0:
        return 0
    takeLeft  = cards[left]  + solve(cards, left+1, right,   remaining-1)
    takeRight = cards[right] + solve(cards, left,   right-1, remaining-1)
    return max(takeLeft, takeRight)
```

### Complexity

| Metric | Value | Derivation |
|---|---|---|
| **Time** | O(2^k) | Each of `k` steps branches into 2 choices → binary tree of depth `k`. |
| **Space** | O(k) | Recursion stack depth. |

### Dry Run

`cardPoints = [1, 2, 3, 4, 5, 6, 1], k = 3`

```
solve(0, 6, 3)
├─ take left (1):  solve(1, 6, 2)
│   ├─ take left (2):  solve(2, 6, 1)
│   │   ├─ take left (3):  0 → sum = 3
│   │   └─ take right(1):  0 → sum = 1
│   │   → max = 3.  Total path = 1+2+3 = 6
│   └─ take right(1):  solve(1, 5, 1)
│       ├─ take left (2):  0 → sum = 2
│       └─ take right(6):  0 → sum = 6
│       → max = 6.  Total path = 1+1+6 = 8
│   → max(6, 8) = 8
└─ take right(1):  solve(0, 5, 2)
    ├─ take left (1):  solve(1, 5, 1)
    │   ├─ take left (2):  0 → sum = 2
    │   └─ take right(6):  0 → sum = 6
    │   → max = 6.  Total path = 1+1+6 = 8
    └─ take right(6):  solve(0, 4, 1)
        ├─ take left (1):  0 → sum = 1
        └─ take right(5):  0 → sum = 5
        → max = 5.  Total path = 1+6+5 = 12
    → max(8, 12) = 12
→ max(8, 12) = 12  ✅
```

### Why It's Slow

With `k` up to 10^5, **O(2^k)** is astronomically large. Even with memoisation (which brings it to O(k^2) due to unique `(left, remaining)` states), it's too slow. We need a fundamentally different approach.

---

## 2. Improved Approach: Prefix Sums (Enumerate All Splits)

### What Changed

Instead of recursion, we observe that our final selection is always:
- **`left` cards from the front** + **`k − left` cards from the back**.
- `left` ranges from `0` to `k`.

We precompute **prefix sums** so we can compute any front/back sum in O(1), then enumerate all `k + 1` splits.

### Pseudocode

```
function maxScore(cardPoints, k):
    n = cardPoints.length
    
    // Build prefix sum (prefixSum[i] = sum of first i cards)
    prefixSum = new Array(n+1).fill(0)
    for i from 0 to n-1:
        prefixSum[i+1] = prefixSum[i] + cardPoints[i]
    
    totalSum = prefixSum[n]
    maxPoints = 0
    
    // Try taking `left` from front, `k - left` from back
    for left from 0 to k:
        right = k - left
        frontSum = prefixSum[left]                    // sum of first `left` cards
        backSum  = totalSum - prefixSum[n - right]    // sum of last `right` cards
        maxPoints = max(maxPoints, frontSum + backSum)
        
    return maxPoints
```

### JavaScript

```javascript
var maxScore = function(cardPoints, k) {
    const n = cardPoints.length;
    
    // Build prefix sum
    const prefixSum = new Array(n + 1).fill(0);
    for (let i = 0; i < n; i++) {
        prefixSum[i + 1] = prefixSum[i] + cardPoints[i];
    }
    
    const totalSum = prefixSum[n];
    let maxPoints = 0;
    
    // Enumerate: take `left` from front, `k - left` from back
    for (let left = 0; left <= k; left++) {
        const right = k - left;
        const frontSum = prefixSum[left];
        const backSum = totalSum - prefixSum[n - right];
        maxPoints = Math.max(maxPoints, frontSum + backSum);
    }
    
    return maxPoints;
};
```

### Complexity

| Metric | Value |
|---|---|
| **Time** | O(N) — one pass to build prefix sums + O(k) enumeration |
| **Space** | O(N) — the prefix sum array |

### Dry Run

`cardPoints = [1, 2, 3, 4, 5, 6, 1], k = 3`

**Prefix Sum**: `[0, 1, 3, 6, 10, 15, 21, 22]`  
**totalSum = 22**

| left | right | frontSum | backSum | Sum | maxPoints |
|---|---|---|---|---|---|
| 0 | 3 | `prefix[0]=0` | `22 - prefix[4]=22-10=12` | 12 | 12 |
| 1 | 2 | `prefix[1]=1` | `22 - prefix[5]=22-15=7` | 8 | 12 |
| 2 | 1 | `prefix[2]=3` | `22 - prefix[6]=22-21=1` | 4 | 12 |
| 3 | 0 | `prefix[3]=6` | `22 - prefix[7]=22-22=0` | 6 | 12 |

Result: **12** ✅

### Trade-offs
- Simple and correct.
- Uses O(N) extra space for the prefix sum array. Can we avoid that?

---

## 3. Optimal Approach: Sliding Window (Minimum Window Sum)

### Intuition

If we take `k` cards from the edges (some from front, some from back), then the **remaining `n − k` cards form a contiguous subarray in the middle**.

→ **Maximising the sum of `k` edge cards** is equivalent to **minimising the sum of the `n − k` contiguous middle cards** (because `edgeSum = totalSum − middleSum`).

So we slide a window of size `n − k` across the array, find the **minimum window sum**, and subtract it from the total.

```
Visual:
  [  left cards  |   middle window (n-k)   |  right cards  ]
  ← we keep these →   ← we discard this →   ← we keep these →

  maxScore = totalSum - min(window sum of size n-k)
```

### Pseudocode

```
function maxScore(cardPoints, k):
    n = cardPoints.length
    windowSize = n - k
    
    // Edge case: take all cards
    if windowSize == 0:
        return sum(cardPoints)
    
    // Compute total sum
    totalSum = sum(cardPoints)
    
    // Compute initial window sum (first `windowSize` elements)
    windowSum = sum(cardPoints[0 ... windowSize-1])
    minWindowSum = windowSum
    
    // Slide the window
    for i from windowSize to n-1:
        windowSum += cardPoints[i]              // add new element entering window
        windowSum -= cardPoints[i - windowSize] // remove element leaving window
        minWindowSum = min(minWindowSum, windowSum)
        
    return totalSum - minWindowSum
```

### JavaScript

```javascript
/**
 * @param {number[]} cardPoints
 * @param {number} k
 * @return {number}
 */
var maxScore = function(cardPoints, k) {
    const n = cardPoints.length;
    const windowSize = n - k;
    
    // Total sum
    let totalSum = 0;
    for (let i = 0; i < n; i++) {
        totalSum += cardPoints[i];
    }
    
    // Edge case: take all cards
    if (windowSize === 0) return totalSum;
    
    // Initial window sum
    let windowSum = 0;
    for (let i = 0; i < windowSize; i++) {
        windowSum += cardPoints[i];
    }
    let minWindowSum = windowSum;
    
    // Slide the window
    for (let i = windowSize; i < n; i++) {
        windowSum += cardPoints[i];
        windowSum -= cardPoints[i - windowSize];
        minWindowSum = Math.min(minWindowSum, windowSum);
    }
    
    return totalSum - minWindowSum;
};
```

### Correctness Proof

**Claim**: The optimal `k` edge cards always correspond to removing a contiguous block of `n − k` cards from the middle.

**Proof**:
1. Every valid selection takes some prefix of length `left` and suffix of length `k − left`. What remains is `cardPoints[left ... n − 1 − (k − left)]`, a contiguous block of size `n − k`.
2. Conversely, every contiguous block of size `n − k` defines a unique valid selection (the cards outside the block).
3. There is a bijection between valid selections and contiguous blocks. Maximising edge sum ↔ minimising middle block sum. ∎

### Dry Run

`cardPoints = [1, 2, 3, 4, 5, 6, 1], k = 3`

- `n = 7`, `windowSize = 7 - 3 = 4`
- `totalSum = 1+2+3+4+5+6+1 = 22`

**Initial window** `[1, 2, 3, 4]`: `windowSum = 10`, `minWindowSum = 10`

| i | Add | Remove | windowSum | minWindowSum |
|---|---|---|---|---|
| 4 | +5 (idx 4) | −1 (idx 0) | `10+5−1=14` | 10 |
| 5 | +6 (idx 5) | −2 (idx 1) | `14+6−2=18` | 10 |
| 6 | +1 (idx 6) | −3 (idx 2) | `18+1−3=16` | 10 |

**Result**: `22 − 10 = 12` ✅

The minimum window `[1, 2, 3, 4]` means we take the remaining `[5, 6, 1]` = 12.

### Complexity

| Metric | Value | Comment |
|---|---|---|
| **Time** | O(N) | Two linear passes (sum + slide). |
| **Space** | O(1) | Only a few integer variables. |

### Practical Performance
Extremely efficient. Single-pass sliding window with no allocations, highly cache-friendly. Easily handles `N = 10^5`.

---

## Interview-Ready Explanation (60–90 seconds)

> "The key insight is that taking `k` cards from the edges is equivalent to leaving `n − k` contiguous cards in the middle.
> 
> So I flip the problem: instead of maximising what I take, I **minimise the sum of the `n − k` contiguous cards I leave behind**.
> 
> I compute the total sum of the array. Then I slide a window of size `n − k` across the array, tracking the minimum window sum. The answer is `totalSum − minWindowSum`.
> 
> This is O(N) time and O(1) space — just a single sliding window pass."

---

## Visual Diagram

```
Array:  [ 1 | 2 | 3 | 4 | 5 | 6 | 1 ]
                                        k = 3, so window = 4

Window positions:
  [1  2  3  4] 5  6  1   → windowSum = 10  ← MIN
   1 [2  3  4  5] 6  1   → windowSum = 14
   1  2 [3  4  5  6] 1   → windowSum = 18
   1  2  3 [4  5  6  1]  → windowSum = 16

Best: leave [1,2,3,4] → take [5,6,1] = 12 ✅

Equivalently:
  left=0, right=3  →  0 + (5+6+1) = 12   ← matches!
  left=1, right=2  →  1 + (6+1)   = 8
  left=2, right=1  →  3 + (1)     = 4
  left=3, right=0  →  6 + 0       = 6
```
