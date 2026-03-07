# 327. Count of Range Sum — Complete Explanation

---

## High-Level Interpretation

You are given an integer array `nums` and two bounds `lower` and `upper`. You must count how many **contiguous subarray sums** fall within `[lower, upper]` inclusive. A range sum `S(i,j) = nums[i] + nums[i+1] + … + nums[j]`. The problem is essentially: **count all pairs (i,j) with i ≤ j such that lower ≤ S(i,j) ≤ upper**.

**Hidden traps:**
- Numbers can be very large (up to 2³¹ − 1) and negative — prefix sums can overflow 32-bit integers, so use `BigInt` or ensure your language supports 64-bit.
- `n` up to 10⁵ means O(N²) is borderline; we need O(N log N).
- The "range sum" is really **prefix[j+1] − prefix[i]**, so the problem reduces to counting prefix-sum pairs.

---

## 1. Brute-Force Approach: Check Every Pair — O(N²)

### Idea

Try every possible subarray `(i, j)`. Compute its sum and check if it lies in `[lower, upper]`.

### Pseudocode

```
function countRangeSum(nums, lower, upper):
    n = nums.length
    count = 0
    for i = 0 to n-1:
        sum = 0
        for j = i to n-1:
            sum += nums[j]
            if lower <= sum <= upper:
                count++
    return count
```

### JavaScript Implementation

```javascript
var countRangeSum = function(nums, lower, upper) {
    const n = nums.length;
    let count = 0;
    for (let i = 0; i < n; i++) {
        let sum = 0;
        for (let j = i; j < n; j++) {
            sum += nums[j];
            if (sum >= lower && sum <= upper) count++;
        }
    }
    return count;
};
```

### Complexity

| | Value | Reasoning |
|---|---|---|
| **Time** | O(N²) | Two nested loops over N elements |
| **Space** | O(1) | Only a running sum variable |

### Dry Run — `nums = [-2, 5, -1], lower = -2, upper = 2`

| i | j | sum | In [−2, 2]? | count |
|---|---|-----|-------------|-------|
| 0 | 0 | −2  | ✅ Yes      | 1     |
| 0 | 1 | 3   | ❌ No       | 1     |
| 0 | 2 | 2   | ✅ Yes      | 2     |
| 1 | 1 | 5   | ❌ No       | 2     |
| 1 | 2 | 4   | ❌ No       | 2     |
| 2 | 2 | −1  | ✅ Yes      | 3     |

**Result: 3** ✅

### Why It's Too Slow

With `n = 10⁵`, this does ~5 × 10⁹ operations — far too slow.

---

## 2. Improved Approach: Prefix Sums + Reframing — O(N²) time but cleaner

### Key Insight

Build prefix sums: `prefix[0] = 0`, `prefix[k] = nums[0] + … + nums[k−1]`.

Then `S(i, j) = prefix[j+1] − prefix[i]`.

The problem becomes: **count pairs (i, j) with i < j such that `lower ≤ prefix[j] − prefix[i] ≤ upper`**.

Equivalently: for each `j`, count how many earlier `prefix[i]` satisfy:
```
prefix[j] − upper  ≤  prefix[i]  ≤  prefix[j] − lower
```

This reframing doesn't change the time complexity yet, but it sets up the optimal solution.

### Pseudocode

```
function countRangeSum(nums, lower, upper):
    n = nums.length
    prefix = array of size n+1, prefix[0] = 0
    for k = 0 to n-1:
        prefix[k+1] = prefix[k] + nums[k]

    count = 0
    for j = 1 to n:
        for i = 0 to j-1:
            if lower <= prefix[j] - prefix[i] <= upper:
                count++
    return count
```

### JavaScript Implementation

```javascript
var countRangeSum = function(nums, lower, upper) {
    const n = nums.length;
    const prefix = new Array(n + 1);
    prefix[0] = 0;
    for (let k = 0; k < n; k++) {
        prefix[k + 1] = prefix[k] + nums[k];
    }

    let count = 0;
    for (let j = 1; j <= n; j++) {
        for (let i = 0; i < j; i++) {
            const diff = prefix[j] - prefix[i];
            if (diff >= lower && diff <= upper) count++;
        }
    }
    return count;
};
```

### Complexity

| | Value | Reasoning |
|---|---|---|
| **Time** | O(N²) | Still checking all pairs of prefix values |
| **Space** | O(N) | The prefix array |

### Dry Run — `nums = [-2, 5, -1], lower = -2, upper = 2`

**Build prefix:** `[0, -2, 3, 2]`

| j | i | prefix[j] − prefix[i] | In [−2, 2]? | count |
|---|---|------------------------|-------------|-------|
| 1 | 0 | −2 − 0 = −2           | ✅          | 1     |
| 2 | 0 | 3 − 0 = 3             | ❌          | 1     |
| 2 | 1 | 3 − (−2) = 5          | ❌          | 1     |
| 3 | 0 | 2 − 0 = 2             | ✅          | 2     |
| 3 | 1 | 2 − (−2) = 4          | ❌          | 2     |
| 3 | 2 | 2 − 3 = −1            | ✅          | 3     |

**Result: 3** ✅

### Trade-Offs
- Same time complexity as brute force, but the **prefix-pair** framing is the gateway to O(N log N).

---

## 3. Optimal Approach: Merge Sort on Prefix Sums — O(N log N)

### Intuition

We need to count, for each `prefix[j]`, how many earlier `prefix[i]` satisfy:
```
prefix[j] − upper  ≤  prefix[i]  ≤  prefix[j] − lower
```

**Merge sort** is perfect here:
1. During the **merge** step, the left half contains "earlier" indices and the right half contains "later" indices.
2. Because both halves are **sorted**, we can use **two pointers** to count valid pairs in O(N) per merge.
3. After counting, we merge normally to maintain sorted order for future levels.

This is the same "count across halves" trick from **315. Count of Smaller Numbers After Self**, but here we count prefix-sum pairs in a range.

### The Counting Step (Heart of the Algorithm)

At each merge of `sorted_left` and `sorted_right`:
- For each `prefix[j]` in `sorted_right`, find the window in `sorted_left` where `prefix[i]` satisfies `prefix[j] − upper ≤ prefix[i] ≤ prefix[j] − lower`.
- Since both halves are sorted and `j` increases monotonically, the window boundaries `lo` and `hi` only move forward — giving O(N) total work per level.

```
        [0, -2, 3, 2]   ← prefix sums
           /         \
      [0, -2]      [3, 2]     ← split
          ↓            ↓
     [-2, 0]       [2, 3]     ← sorted halves

  Count: for each right value r, find how many l in left satisfy
         r − upper ≤ l ≤ r − lower

  r=2: need −2 ≤ l ≤ 0 → both −2 and 0 qualify → +2
  r=3: need −2+3=1 ≤ l ≤ 3+2=5 ... wait let me recompute:
       need 3−2=1 ≤ l ≤ 3−(−2)=5 → no l qualifies → +0

  Plus counts from earlier recursion levels: 1 (from left sub-problem)

  Total = 1 + 2 + 0 = 3 ✅
```

### Pseudocode

```
function countRangeSum(nums, lower, upper):
    n = nums.length
    prefix = array of size n+1
    prefix[0] = 0
    for k = 0 to n-1:
        prefix[k+1] = prefix[k] + nums[k]

    return mergeSort(prefix, 0, n, lower, upper)

function mergeSort(arr, left, right, lower, upper):
    if left >= right: return 0
    mid = (left + right) / 2
    count = mergeSort(arr, left, mid, lower, upper)
          + mergeSort(arr, mid+1, right, lower, upper)

    // Count valid pairs across halves
    lo = mid + 1      // pointer for lower bound
    hi = mid + 1      // pointer for upper bound
    for j = left to mid:
        while lo <= right AND arr[lo] - arr[j] < lower:
            lo++
        while hi <= right AND arr[hi] - arr[j] <= upper:
            hi++
        count += hi - lo

    // Standard merge
    merge(arr, left, mid, right)
    return count
```

> **Wait — careful with the direction!** We fix each element in the left half and sweep through the right half. Since the left half has earlier prefix indices and the right half has later ones, we want `arr[right_elem] − arr[left_elem]` in `[lower, upper]`.

### JavaScript Implementation

```javascript
var countRangeSum = function(nums, lower, upper) {
    const n = nums.length;
    const prefix = new Array(n + 1);
    prefix[0] = 0;
    for (let k = 0; k < n; k++) {
        prefix[k + 1] = prefix[k] + nums[k];
    }
    return mergeSort(prefix, 0, n, lower, upper);
};

function mergeSort(arr, left, right, lower, upper) {
    if (left >= right) return 0;
    const mid = (left + right) >> 1;

    let count = mergeSort(arr, left, mid, lower, upper)
              + mergeSort(arr, mid + 1, right, lower, upper);

    // Count: for each j in left half, count how many k in right half satisfy
    //        lower <= arr[k] - arr[j] <= upper
    let lo = mid + 1;
    let hi = mid + 1;
    for (let j = left; j <= mid; j++) {
        // Move lo to first position where arr[lo] - arr[j] >= lower
        while (lo <= right && arr[lo] - arr[j] < lower) lo++;
        // Move hi to first position where arr[hi] - arr[j] > upper
        while (hi <= right && arr[hi] - arr[j] <= upper) hi++;
        count += hi - lo;
    }

    // Standard merge
    const temp = [];
    let p = left, q = mid + 1;
    while (p <= mid && q <= right) {
        if (arr[p] <= arr[q]) temp.push(arr[p++]);
        else temp.push(arr[q++]);
    }
    while (p <= mid) temp.push(arr[p++]);
    while (q <= right) temp.push(arr[q++]);
    for (let i = 0; i < temp.length; i++) {
        arr[left + i] = temp[i];
    }

    return count;
}
```

### Correctness Proof

**Invariant:** After `mergeSort(arr, l, r)` returns, `arr[l..r]` is sorted AND the return value equals the number of valid pairs `(i, j)` with `l ≤ i < j ≤ r` where `lower ≤ prefix_original[j] − prefix_original[i] ≤ upper`.

**Base case:** A single element has 0 pairs. ✅

**Inductive step:**
1. Recursive calls count all pairs *within* each half.
2. The two-pointer counting step counts all pairs *across* halves (left element is "earlier" prefix, right element is "later" prefix).
3. Since both halves are sorted after recursion, the two-pointer window only moves right → O(N) per level.
4. Sorting doesn't change which values exist, only their order — and we only care about value differences, not positions (positions are already guaranteed correct by the split).

**Total = within-left + within-right + across** = all valid pairs. ✅

### Dry Run — `nums = [-2, 5, -1], lower = -2, upper = 2`

**prefix = [0, −2, 3, 2]** (indices 0–3)

```
mergeSort(arr, 0, 3)
├── mergeSort(arr, 0, 1)          ← left half: prefix[0..1] = [0, -2]
│   ├── mergeSort(arr, 0, 0) → 0  (single element)
│   ├── mergeSort(arr, 1, 1) → 0  (single element)
│   │
│   │   Count across: j=0 (arr[0]=0), right half = [arr[1]=−2]
│   │     arr[1]−arr[0] = −2−0 = −2 → in [−2,2]? YES → lo=1, hi=2, count += 1
│   │   cross_count = 1
│   │
│   │   Merge [0] and [−2] → [−2, 0]
│   └── return 0 + 0 + 1 = 1
│
├── mergeSort(arr, 2, 3)          ← right half: prefix[2..3] = [3, 2]
│   ├── mergeSort(arr, 2, 2) → 0
│   ├── mergeSort(arr, 3, 3) → 0
│   │
│   │   Count across: j=2 (arr[2]=3), right half = [arr[3]=2]
│   │     arr[3]−arr[2] = 2−3 = −1 → in [−2,2]? YES → count += 1
│   │   cross_count = 1
│   │
│   │   Merge [3] and [2] → [2, 3]
│   └── return 0 + 0 + 1 = 1
│
│   NOW: arr = [−2, 0, 2, 3]  (both halves sorted)
│
│   Count across halves:
│     Left half (sorted): [−2, 0]   (indices 0–1)
│     Right half (sorted): [2, 3]   (indices 2–3)
│
│     j=0, arr[0]=−2:
│       lo: arr[2]−(−2)=4 > 2 → lo stays at 2
│       hi: arr[2]−(−2)=4 > 2 → hi stays at 2
│       count += 2−2 = 0
│
│     j=1, arr[1]=0:
│       lo: arr[2]−0=2 ≥ −2 → lo=2
│       hi: arr[2]−0=2 ≤ 2 → hi=3; arr[3]−0=3 > 2 → hi=3
│       count += 3−2 = 1
│
│   cross_count = 0 + 1 = 1
│
│   Merge [−2, 0] and [2, 3] → [−2, 0, 2, 3]
│
└── return 1 + 1 + 1 = 3   ✅
```

### Complexity

| | Value | Reasoning |
|---|---|---|
| **Time** | O(N log N) | Merge sort depth is log N; at each level, counting is O(N) (two pointers only move right) and merging is O(N) |
| **Space** | O(N) | Prefix array + temp merge buffer |

### Practical Performance

- Very fast in practice — merge sort has excellent cache locality.
- The constant factor is small since the counting step is just pointer sliding.
- No coordinate compression needed (unlike BIT approach).

---

## 4. Alternative Optimal: BIT / Segment Tree Approach (Sketch)

You can also solve this with a **BIT on coordinate-compressed prefix sums**:

1. Build prefix array.
2. Coordinate-compress all prefix values.
3. Process prefixes left to right. For each `prefix[j]`:
   - Query BIT for count of values in `[prefix[j] − upper, prefix[j] − lower]`.
   - Insert `prefix[j]` into BIT.

This also gives O(N log N) but requires coordinate compression and is slightly more complex.

---

## Interview-Ready Summary (60–90 seconds)

> "The key insight is to convert range sums into prefix-sum differences. We build a prefix array where `prefix[j] − prefix[i]` gives `sum(i..j−1)`. We need to count pairs where this difference falls in `[lower, upper]`.
>
> I use **merge sort** on the prefix array. During the merge step, the left half contains earlier prefix indices and the right half contains later ones. Since both halves are sorted, I use two pointers to count how many right-half elements minus each left-half element fall in the target range — this takes O(N) per merge level.
>
> After counting, I merge normally to keep the array sorted for future levels. Total: O(N log N) time, O(N) space. It's essentially the same technique as counting inversions, but counting elements within a range instead of just smaller elements."

---

## ASCII Diagram — How Merge Sort Counts Pairs

```
  prefix = [0, -2, 3, 2]

  Level 0:  [0, -2, 3, 2]
              /          \
  Level 1: [0, -2]    [3, 2]
             ↓           ↓
  Sorted:  [-2, 0]    [2, 3]    ← count across each half
             \_________/
  Level 0:  [-2, 0, 2, 3]      ← count across the two sorted halves
                                   using two-pointer window

  For each left element L, find right elements R where:
      lower ≤ R − L ≤ upper

  Because both sides are sorted, the window [lo, hi) only
  slides right → O(N) per level, O(N log N) total.
```

---

## Summary Table

| Approach | Time | Space | Notes |
|----------|------|-------|-------|
| Brute Force (all pairs) | O(N²) | O(1) | TLE for N=10⁵ |
| Prefix Sum pairs | O(N²) | O(N) | Still quadratic, but sets up optimal |
| **Merge Sort on Prefix** | **O(N log N)** | **O(N)** | **Optimal — two-pointer counting during merge** |
| BIT + Coord Compression | O(N log N) | O(N) | Alternative, slightly more complex |
