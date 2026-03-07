# 315. Count of Smaller Numbers After Self — Complete Explanation

---

## High-Level Interpretation

You are given an integer array `nums`. For **every** element `nums[i]`, you must count how many elements to its **right** (indices `i+1` to `n−1`) are **strictly smaller** than `nums[i]`. Return these counts as an array.

**Why it matters**: This is a classic "inversions counting" variant — it appears in ranking, sorting analysis, and computational geometry. It tests your ability to go beyond O(N²) brute force by leveraging divide-and-conquer (merge sort) or augmented data structures (BIT / BST).

**Hidden traps**:
- **Negative numbers**: Values range from −10⁴ to 10⁴, so any index-based structure (like a BIT) needs coordinate compression or an offset.
- **Duplicates**: "Strictly smaller" means equal elements don't count. Be careful with `<=` vs `<`.
- **Stability**: When using merge sort, you need to track the original indices because elements move during sorting.
- **N up to 10⁵**: O(N²) will TLE. You need O(N log N).

---

## 1. Brute-Force Approach: Check Every Pair

### Idea

For each index `i`, scan every index `j > i` and count how many `nums[j] < nums[i]`.

### Pseudocode

```
function countSmaller(nums):
    n = nums.length
    counts = array of size n, all zeros
    
    for i from 0 to n-1:
        for j from i+1 to n-1:
            if nums[j] < nums[i]:
                counts[i]++
    
    return counts
```

### Complexity

| Metric | Value | Derivation |
|---|---|---|
| **Time** | O(N²) | Two nested loops. For each `i`, scan up to `n−i−1` elements. Total = (n−1) + (n−2) + … + 0 = N(N−1)/2 |
| **Space** | O(N) | Output array `counts[]`. |

### Dry Run

`nums = [5, 2, 6, 1]`

| i | j scanned | nums[j] < nums[i]? | counts[i] |
|---|---|---|---|
| 0 | j=1: 2<5 ✓, j=2: 6<5 ✗, j=3: 1<5 ✓ | 2 hits | **2** |
| 1 | j=2: 6<2 ✗, j=3: 1<2 ✓ | 1 hit | **1** |
| 2 | j=3: 1<6 ✓ | 1 hit | **1** |
| 3 | no j | 0 hits | **0** |

Result: `[2, 1, 1, 0]` ✅

### Why It's Slow

With N up to 10⁵, O(N²) = 10¹⁰ operations — **far too slow** (TLE). We need O(N log N).

---

## 2. Improved Approach: Binary Indexed Tree (BIT / Fenwick Tree)

### What Changed

Instead of scanning all elements to the right, we process from **right to left** and maintain a frequency data structure. When we process `nums[i]`:
1. **Query**: "How many numbers already inserted (to the right of `i`) are < nums[i]?" → prefix sum query on `[0, nums[i]−1]`.
2. **Update**: Insert `nums[i]` into the structure.

A **BIT** supports both operations in O(log M) where M is the value range.

Since values can be negative (−10⁴ to 10⁴), we use **coordinate compression**: sort the unique values, map them to ranks 1..k.

### Pseudocode

```
function countSmaller(nums):
    n = nums.length
    // Coordinate compression
    sorted = sorted unique values of nums
    rank = map each value to its 1-based rank in sorted
    
    BIT = array of size (sorted.length + 1), all zeros
    counts = array of size n
    
    for i from n-1 down to 0:
        r = rank[nums[i]]
        counts[i] = query(BIT, r - 1)    // prefix sum [1..r-1]
        update(BIT, r, +1)                // add 1 at rank r
    
    return counts

function update(BIT, i, delta):
    while i < BIT.length:
        BIT[i] += delta
        i += i & (-i)

function query(BIT, i):
    sum = 0
    while i > 0:
        sum += BIT[i]
        i -= i & (-i)
    return sum
```

### JavaScript

```javascript
var countSmaller = function(nums) {
    const n = nums.length;
    
    // Coordinate compression
    const sorted = [...new Set(nums)].sort((a, b) => a - b);
    const rank = new Map();
    sorted.forEach((v, i) => rank.set(v, i + 1)); // 1-indexed
    
    const size = sorted.length + 2;
    const bit = new Array(size).fill(0);
    
    function update(i) {
        for (; i < size; i += i & (-i)) bit[i]++;
    }
    function query(i) {
        let s = 0;
        for (; i > 0; i -= i & (-i)) s += bit[i];
        return s;
    }
    
    const counts = new Array(n);
    for (let i = n - 1; i >= 0; i--) {
        const r = rank.get(nums[i]);
        counts[i] = query(r - 1); // how many inserted values have rank < r
        update(r);
    }
    
    return counts;
};
```

### Complexity

| Metric | Value |
|---|---|
| **Time** | O(N log N) — N elements, each doing O(log N) BIT operations. |
| **Space** | O(N) — BIT array + rank map. |

### Dry Run

`nums = [5, 2, 6, 1]`

**Coordinate compression**: sorted unique = `[1, 2, 5, 6]` → ranks: `{1→1, 2→2, 5→3, 6→4}`

Processing right to left:

| i | nums[i] | rank | query(rank−1) | counts[i] | BIT state after update |
|---|---|---|---|---|---|
| 3 | 1 | 1 | query(0) = 0 | **0** | BIT[1]=1 |
| 2 | 6 | 4 | query(3) = 1 | **1** | BIT[1]=1, BIT[4]=1 |
| 1 | 2 | 2 | query(1) = 1 | **1** | BIT[1]=1, BIT[2]=1, BIT[4]=1 |
| 0 | 5 | 3 | query(2) = 2 | **2** | BIT[1]=1, BIT[2]=2, BIT[4]=2 |

Result: `[2, 1, 1, 0]` ✅

### Trade-offs
- **Pros**: Simple to code once you know BIT, O(N log N).
- **Cons**: Requires coordinate compression for negative or large values. BIT is an extra data structure to understand.

---

## 3. Optimal Approach: Merge Sort with Index Tracking

### Intuition

**Key insight**: Counting smaller elements to the right is the same as counting **inversions** — pairs `(i, j)` where `i < j` but `nums[i] > nums[j]`.

Merge sort naturally counts inversions during the **merge** step:
- When merging two sorted halves `left` and `right`, if `left[p] > right[q]`, then `left[p]` is greater than `right[q]` **and** all remaining elements in `right` from `q` onward — but we need per-element counts, not a global count.

**Per-element counting trick**: We track each element's **original index**. During the merge, when an element from the left half is placed, every element from the right half that was already placed before it is smaller and was originally to its right. So:

> When placing `left[p]` into the merged array, add the number of right-half elements already placed (= `q − rightStart`) to `counts[originalIndex of left[p]]`.

### Pseudocode

```
function countSmaller(nums):
    n = nums.length
    counts = array of zeros, size n
    indices = [0, 1, 2, ..., n-1]   // track original positions
    
    mergeSort(nums, indices, counts, 0, n - 1)
    return counts

function mergeSort(nums, indices, counts, lo, hi):
    if lo >= hi: return
    mid = (lo + hi) / 2
    mergeSort(nums, indices, counts, lo, mid)
    mergeSort(nums, indices, counts, mid + 1, hi)
    merge(nums, indices, counts, lo, mid, hi)

function merge(nums, indices, counts, lo, mid, hi):
    left = indices[lo..mid]       // copy
    right = indices[mid+1..hi]    // copy
    p = 0, q = 0, k = lo
    rightCount = 0                // how many from right placed so far
    
    while p < left.length AND q < right.length:
        if nums[left[p]] > nums[right[q]]:
            // right element is smaller, place it
            rightCount++
            indices[k++] = right[q++]
        else:
            // place left element; rightCount right-elements were smaller
            counts[left[p]] += rightCount
            indices[k++] = left[p++]
    
    // remaining left elements
    while p < left.length:
        counts[left[p]] += rightCount
        indices[k++] = left[p++]
    
    // remaining right elements
    while q < right.length:
        indices[k++] = right[q++]
```

### JavaScript

```javascript
/**
 * @param {number[]} nums
 * @return {number[]}
 */
var countSmaller = function(nums) {
    const n = nums.length;
    const counts = new Array(n).fill(0);
    const indices = nums.map((_, i) => i); // track original indices
    
    function mergeSort(lo, hi) {
        if (lo >= hi) return;
        const mid = (lo + hi) >> 1;
        mergeSort(lo, mid);
        mergeSort(mid + 1, hi);
        merge(lo, mid, hi);
    }
    
    function merge(lo, mid, hi) {
        const left = indices.slice(lo, mid + 1);
        const right = indices.slice(mid + 1, hi + 1);
        
        let p = 0, q = 0, k = lo;
        let rightCount = 0; // right-half elements placed so far
        
        while (p < left.length && q < right.length) {
            if (nums[left[p]] > nums[right[q]]) {
                rightCount++;
                indices[k++] = right[q++];
            } else {
                counts[left[p]] += rightCount;
                indices[k++] = left[p++];
            }
        }
        
        while (p < left.length) {
            counts[left[p]] += rightCount;
            indices[k++] = left[p++];
        }
        
        while (q < right.length) {
            indices[k++] = right[q++];
        }
    }
    
    mergeSort(0, n - 1);
    return counts;
};
```

### Correctness Proof

**Invariant**: After `mergeSort(lo, hi)` completes, `counts[originalIdx]` has been incremented by the number of right-side-smaller elements within the range `[lo, hi]`.

**Reasoning**:
1. **Base case**: A single element has 0 smaller elements to its right within its range. ✓
2. **Inductive step**: After sorting each half, the merge combines them. When we place a right-half element before a left-half element, that right element was originally to the right and is smaller — exactly the pair we need to count.
3. `rightCount` tracks how many right-half elements have been placed. When a left-half element is finally placed, all those `rightCount` elements are smaller and were to its right. ✓
4. The total count for any element accumulates across all merge levels (each level contributes inversions between its two halves). By induction across all levels of recursion, the final `counts[]` is correct. ∎

### Dry Run

`nums = [5, 2, 6, 1]`, `indices = [0, 1, 2, 3]`

```
mergeSort(0, 3)
├── mergeSort(0, 1)
│   ├── mergeSort(0, 0)  → base case
│   ├── mergeSort(1, 1)  → base case
│   └── merge(0, 0, 1)
│       left=[0] (nums: 5), right=[1] (nums: 2)
│       5 > 2 → place right[1], rightCount=1
│       place left[0], counts[0] += 1 → counts=[1,0,0,0]
│       indices=[1,0,2,3]
│
├── mergeSort(2, 3)
│   ├── mergeSort(2, 2)  → base case
│   ├── mergeSort(3, 3)  → base case
│   └── merge(2, 2, 3)
│       left=[2] (nums: 6), right=[3] (nums: 1)
│       6 > 1 → place right[3], rightCount=1
│       place left[2], counts[2] += 1 → counts=[1,0,1,0]
│       indices=[1,0,3,2]
│
└── merge(0, 1, 3)
    left=[1,0] (nums: 2,5), right=[3,2] (nums: 1,6)
    
    Step 1: nums[1]=2 > nums[3]=1 → place 3, rightCount=1
    Step 2: nums[1]=2 ≤ nums[2]=6 → place 1, counts[1] += 1 → counts=[1,1,1,0]
    Step 3: nums[0]=5 ≤ nums[2]=6 → place 0, counts[0] += 1 → counts=[2,1,1,0]
    Step 4: remaining right → place 2
    indices=[3,1,0,2]
```

Result: `counts = [2, 1, 1, 0]` ✅

### Complexity

| Metric | Value | Comment |
|---|---|---|
| **Time** | O(N log N) | Standard merge sort. Each level does O(N) work across all merges. There are log N levels. |
| **Space** | O(N) | Temporary arrays during merge + indices array. |

### Practical Performance
- Very fast — same as merge sort itself.
- In-place counting means no extra data structures beyond what merge sort already uses.
- Handles negatives and duplicates naturally (no coordinate compression needed).
- The BIT approach (Section 2) is equally valid and sometimes preferred for its simplicity.

---

## Interview-Ready Explanation (60–90 seconds)

> "Counting smaller elements to the right of each element is an inversion-counting problem. The brute force is O(N²), but I can use **merge sort** to do it in O(N log N).
> 
> The key idea: during the merge step, when I'm merging the left and right halves, if I place an element from the right half before an element from the left half, that right element is smaller and was originally to the right — exactly the pair I need to count.
> 
> I maintain a `rightCount` variable: every time I place a right-half element, I increment it. When I place a left-half element, I add `rightCount` to that element's count — because all those right-half elements are smaller and were to its right.
> 
> I track original indices throughout so I can map counts back to the right positions.
> 
> This runs in **O(N log N) time** and **O(N) space**."

---

## Visual Diagram

```
Original:     [5,  2,  6,  1]
Indices:      [0,  1,  2,  3]

Level 1 splits:
    [5, 2]          [6, 1]
    [0, 1]          [2, 3]

Level 2 splits:
  [5] [2]         [6] [1]
  [0] [1]         [2] [3]

Merge level 2:
  [2, 5]  → 5>2, so counts[0]+=1     [1, 6]  → 6>1, so counts[2]+=1
  [1, 0]                               [3, 2]

Merge level 1:
  Merging [2,5] with [1,6]
  
  right=1 < left=2 → rightCount=1, place 1
  left=2 ≤ right=6 → counts[1]+=1, place 2
  left=5 ≤ right=6 → counts[0]+=1, place 5
  place 6
  
  Result: [1, 2, 5, 6]

Final counts: [1+1, 0+1, 1+0, 0] = [2, 1, 1, 0]  ✅
```
