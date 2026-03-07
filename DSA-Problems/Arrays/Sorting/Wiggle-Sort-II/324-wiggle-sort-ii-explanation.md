# 324. Wiggle Sort II - Complete Explanation

## High-Level Interpretation

You are given an integer array `nums` and asked to reorder it such that `nums[0] < nums[1] > nums[2] < nums[3] ...`.
This property is called a **wiggle property**: elements at even indices must be smaller than their adjacent odd neighbors, and elements at odd indices must be larger than their even neighbors.

**Why It Matters:**
- Tests your understanding of array manipulation and median finding.
- Shows how to map logical indices to physical indices (Virtual Indexing) to solve problems in-place.
- A stricter version of Wiggle Sort I (where `nums[i] <= nums[i+1]`), as this requires strictly greater/smaller relations.

**Hidden Traps:**
- **Strict Inequality**: Adjacent elements cannot be equal. If the input allows it (guaranteed answer exists), you must separate duplicates.
- **Duplicates**: The main challenge. If you have many duplicate median elements, simply sorting might leave some adjacent. You need a strategy to spread them out.
- **In-Place Constraint**: The follow-up asks for O(1) extra space, which is significantly harder than O(N) space.

---

## 1. Brute-Force Approach: Sort and Interleave

### Idea

If we sort the array, we have the smallest elements at the beginning and largest at the end.
To ensure `small < large > small < large`, we can split the sorted array into two halves:
- `Small` half: `0` to `n/2`
- `Large` half: `n/2` to `n`

Then we iterate and place them: `Small, Large, Small, Large...`
**Crucial Detail**: To avoid duplicates being adjacent (e.g., `[1, 2, 2, 3]` -> `Small:[1,2], Large:[2,3]`), we should fill the slots **backwards** (from largest valid to smallest) from each half. This generally keeps duplicates far apart.

### Pseudocode

```
function wiggleSort(nums):
    sort(nums)
    n = nums.length
    copy = new Array(n)
    mid = (n + 1) / 2
    
    // Pointers for the two halves, starting from the end of each half
    left = mid - 1
    right = n - 1
    
    for i from 0 to n:
        if i is even:
            copy[i] = nums[left]
            left--
        else:
            copy[i] = nums[right]
            right--
            
    // Copy back to original
    for i from 0 to n:
        nums[i] = copy[i]
```

### Complexity

- **Time**: O(N log N) because of sorting.
- **Space**: O(N) for the copy array.

### Dry Run

Input: `[1, 5, 1, 1, 6, 4]`

1. **Sort**: `[1, 1, 1, 4, 5, 6]`
   - `n = 6`, `mid = 3`
   - `Small` half (indices 0-2): `[1, 1, 1]`
   - `Large` half (indices 3-5): `[4, 5, 6]`

2. **Interleave (Values)**:
   - `i=0` (even): take from Small end (`left=2`, val=`1`). State: `[1, _, _, _, _, _]`
   - `i=1` (odd): take from Large end (`right=5`, val=`6`). State: `[1, 6, _, _, _, _]`
   - `i=2` (even): take from Small end (`left=1`, val=`1`). State: `[1, 6, 1, _, _, _]`
   - `i=3` (odd): take from Large end (`right=4`, val=`5`). State: `[1, 6, 1, 5, _, _]`
   - `i=4` (even): take from Small end (`left=0`, val=`1`). State: `[1, 6, 1, 5, 1, _]`
   - `i=5` (odd): take from Large end (`right=3`, val=`4`). State: `[1, 6, 1, 5, 1, 4]`

**Result**: `[1, 6, 1, 5, 1, 4]` (Valid Wiggle)

### Why Fails/Slow?
It works and passes checks! But it uses O(N) space and O(N log N) time. The follow-up asks for O(1) space and O(N) time.

---

## 2. Optimal Approach: Virtual Indexing (3-Way Partition)

### Intuition

To satisfy `nums[0] < nums[1] > nums[2] < nums[3]...`, we effectively want:
- Odd indices (1, 3, 5...) to have elements **larger** than the median.
- Even indices (0, 2, 4...) to have elements **smaller** than the median.

This looks like the **Dutch National Flag** problem (Sort Colors), but with a twist:
- Instead of sorting `0, 1, 2` to `[0,0, ..., 1,1, ..., 2,2]`.
- We want to put `Large` elements at odd positions `[..., L, ..., L]`.
- We want to put `Small` elements at even positions `[S, ..., S, ...]`.

We can define a **Virtual Indexing** mapping `A(i)` that maps logical indices (0, 1, 2...) to the physical required pattern (1, 3, 5, ..., 0, 2, 4...).
Then we run the standard Dutch National Flag algorithm (3-way partition) on these virtual indices.

**Algorithm**:
1. Find the **Median** element in O(N) using QuickSelect (or sort for simplicity if O(N log N) is allowed).
2. Use 3-way partition to put elements > median in the "first" virtual spots (odd indices), and elements < median in the "last" virtual spots (even indices).

**Virtual Mapping**:
`A(i) = (1 + 2*i) % (n | 1)`
This maps:
0 -> 1
1 -> 3
2 -> 5
... wrapping around to even numbers.

### Pseudocode

```
function wiggleSort(nums):
    median = findKthLargest(nums, n/2)
    
    // Index Mapping Macro
    A(i) => nums[(1 + 2*i) % (n | 1)]
    
    i = 0, j = 0, k = n - 1
    
    // Dutch National Flag Logic
    // "Red" = Large (> median) -> Put at front (Odd indices)
    // "White" = Median
    // "Blue" = Small (< median) -> Put at back (Even indices)
    
    while j <= k:
        if A(j) > median:
            swap(A(i), A(j))
            i++, j++
        else if A(j) < median:
            swap(A(j), A(k))
            k--
        else:
            j++
```

### JavaScript Implementation

```javascript
/**
 * @param {number[]} nums
 * @return {void} Do not return anything, modify nums in-place.
 */
var wiggleSort = function(nums) {
    const n = nums.length;
    // Step 1: Find Median (For standard leetcode, sorting is often fine and simpler)
    // To strictly meet O(N), use QuickSelect. Here we sort for clarity/practicality.
    // Copy to sort so we don't mess up in-place partitioning
    const sorted = [...nums].sort((a,b) => a-b);
    const median = sorted[Math.floor((n-1)/2)];
    
    // Index Mapping Function
    // Maps logical index i to physical index for Wiggle Property
    const map = (i) => (1 + 2 * i) % (n | 1);
    
    let left = 0;
    let i = 0;
    let right = n - 1;
    
    while (i <= right) {
        // We act as if we are sorting accessing array A[i]
        // But physically we access nums[map(i)]
        
        let val = nums[map(i)];
        
        if (val > median) {
            // "Large" -> move to virtual beginning (Odd indices)
            swap(nums, map(i), map(left));
            left++;
            i++;
        } else if (val < median) {
            // "Small" -> move to virtual end (Even indices)
            swap(nums, map(i), map(right));
            right--;
        } else {
            // "Median" -> leave in middle
            i++;
        }
    }
};

function swap(arr, i, j) {
    let temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
}
```

### Correctness Proof

- **Invariants**:
  - `0 to left-1` (Virtual): elements > median.
  - `left to i-1` (Virtual): elements == median.
  - `right+1 to n-1` (Virtual): elements < median.
- The mapping `(1 + 2*i) % (n | 1)` fills odd indices first (1, 3, 5...), then wraps to even indices (0, 2, 4...).
- By putting "Large" elements at the beginning of the virtual array (Odd physical indices) and "Small" elements at the end (Even physical indices), we naturally separate them.

### Dry Run

Input: `[1, 5, 1, 1, 6, 4]`, n=6. `Median = 1`.
Mapping `n|1 = 7`.
- i=0 -> map(0) = 1
- i=1 -> map(1) = 3
- i=2 -> map(2) = 5
- i=3 -> map(3) = 0
- i=4 -> map(4) = 2
- i=5 -> map(5) = 4

Virtual Array Concept: `[Large... | Median... | Small...]`

Execution (Virtual View):
- `A(0)` (index 1) is 5 (>1). Logic: "Large". Swap `A(0)` with `A(left=0)`. `left++, i++`.
- `A(1)` (index 3) is 1 (=1). Logic: "Median". `i++`.
... (process continues) ...

Result is reordered in-place.

### Complexity

- **Time**: O(N) average if using QuickSelect for median finding. (O(N log N) if sorting).
- **Space**: O(1) extra space (excluding recursion stack for quickselect).

### Practical Performance

Finding the median in true O(N) is complex and has high constant factors. For `N=50,000`, O(N log N) sort + O(N) rewrite is often faster and much easier to implement correctly. The Virtual Indexing approach is primarily a theoretical challenge or for extremely constrained memory environments.

---

## Interview-Ready Explanation (60-90 seconds)

> "The problem requires a specific `small-large-small-large` pattern.
>
> The most straightforward way is to **sort the array** (O(N log N)), cut it into two halves (small half and large half), and **interleave** them. To avoid edge cases with duplicates, we interleave backwards: picking largest from the small half, then largest from the large half. This takes O(N) space.
>
> To do this in **O(N) time and O(1) space**, we use the idea of **Virtual Indexing**. First, find the median in O(N) using QuickSelect. Then, we perform a **3-way Partition (Dutch National Flag)**.
> Instead of grouping `0,1,2` linearly, we map the indices. We treat odd indices (1, 3, 5...) as the 'start' where we put elements **larger** than median, and even indices (0, 2, 4...) as the 'end' where we put elements **smaller** than median. This effectively wiggles the array in-place."

---

## Visual Diagram (Interleaving)

```
Sorted: [S1, S2, S3, L1, L2, L3]
          ^           ^
       Small Half   Large Half

Result Slot 0 (Even): S3  (Take largest Small)
Result Slot 1 (Odd) : L3  (Take largest Large)
Result Slot 2 (Even): S2
Result Slot 3 (Odd) : L2
Result Slot 4 (Even): S1
Result Slot 5 (Odd) : L1

Result: [S3, L3, S2, L2, S1, L1]
```
