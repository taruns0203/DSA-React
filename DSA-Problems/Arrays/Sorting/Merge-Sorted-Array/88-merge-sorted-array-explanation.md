# 88. Merge Sorted Array - Complete Explanation

## High-Level Interpretation

You are given two sorted arrays, `nums1` and `nums2`.
Your task is to merge `nums2` into `nums1` so that the result is still sorted.
The catch is that `nums1` has extra empty space (zeros) at the end equal to the length of `nums2`. You must do this **in-place** in `nums1`.

**Why It Matters:**
- A fundamental operation in Merge Sort.
- Tests your ability to work with **two pointers**.
- Tests your ability to manipulate arrays in-place without overwriting data you still need.

**Hidden Traps:**
- **Overwriting Data**: If you merge from the front (index 0), you might overwrite elements in `nums1` that haven't been processed yet.
- **Empty Arrays**: `m=0` or `n=0`.
- **Remaining Elements**: If `nums1` is exhausted but `nums2` still has elements, you need to copy them.

---

## 1. Brute-Force Approach: Merge and Sort

### Idea

Since `nums1` has enough space, we can simply copy all elements from `nums2` into the empty space at the end of `nums1`.
After copying, `nums1` contains all elements but they are not sorted. So, we just sort `nums1`.

### Pseudocode

```
function merge(nums1, m, nums2, n):
    // Copy nums2 into nums1 starting at index m
    for i from 0 to n-1:
        nums1[m + i] = nums2[i]
        
    // Sort the entire array
    sort(nums1)
```

### Complexity

- **Time**: O((M+N) log(M+N)) because of the sorting step.
- **Space**: O(1) or O(log(M+N)) depending on the sorting implementation (ignoring the space occupied by inputs).

### Dry Run

Input: `nums1 = [1, 2, 3, 0, 0, 0]`, `m=3`, `nums2 = [2, 5, 6]`, `n=3`.

1. **Copy**:
   - `nums1[3] = nums2[0] (2)` -> `[1, 2, 3, 2, 0, 0]`
   - `nums1[4] = nums2[1] (5)` -> `[1, 2, 3, 2, 5, 0]`
   - `nums1[5] = nums2[2] (6)` -> `[1, 2, 3, 2, 5, 6]`

2. **Sort**:
   - `sort([1, 2, 3, 2, 5, 6])` -> `[1, 2, 2, 3, 5, 6]`

### Why Fails/Slow?
It's not "slow" for small N, but O((M+N) log(M+N)) is suboptimal when the input arrays are **already sorted**. We should leverage the sorted property to achieve O(M+N).

---


---

## 2. Intermediate Approach: Two Pointers (With Extra Space)

### Idea

We can iterate through both arrays with two pointers (like in Merge Sort). 
The problem is that if we write directly to `nums1`, we might overwrite elements we haven't read yet.
A simple fix is to **make a copy** of the valid part of `nums1` (first `m` elements) into a new array.
Then we can read from this copy and `nums2`, and write safely into `nums1`.

### Pseudocode

```
function merge(nums1, m, nums2, n):
    nums1Copy = new Array(m)
    for i from 0 to m-1:
        nums1Copy[i] = nums1[i]
        
    p1 = 0  // pointer for nums1Copy
    p2 = 0  // pointer for nums2
    p = 0   // pointer for nums1 (write)
    
    while p1 < m and p2 < n:
        if nums1Copy[p1] <= nums2[p2]:
            nums1[p] = nums1Copy[p1]
            p1++
        else:
            nums1[p] = nums2[p2]
            p2++
        p++
        
    // Copy remaining elements
    while p1 < m:
        nums1[p] = nums1Copy[p1]
        p++, p1++
        
    while p2 < n:
        nums1[p] = nums2[p2]
        p++, p2++
```

### Complexity

- **Time**: O(M + N). We traverse each array once.
- **Space**: O(M). We allocate space for the copy of `nums1`.

### Trade-offs
This is much faster than the brute-force (O(M+N) instead of O((M+N)log(M+N))). 
However, it uses O(M) extra memory. The problem asks if we can do it in-place (O(1) space).

---

## 3. Optimal Approach: Two Pointers (From End)

### Intuition

We know both arrays are sorted. We want to place the **largest** elements at the **end** of `nums1`.
If we start comparing from the beginning (index 0), we'd need to shift elements to make room, which is O(N^2) or requires O(N) extra space.

**Key Insight**: `nums1` has empty space at the *end*. This space is safe to write into!
So, let's work **backwards**.
- Compare the largest valid element of `nums1` (at `m-1`) with the largest element of `nums2` (at `n-1`).
- Place the larger of the two at the very end of `nums1` (at `m+n-1`).
- Decrement the pointers.

By working backwards, we guarantee that we never overwrite an element in `nums1` that we haven't read yet.

### Pseudocode

```
function merge(nums1, m, nums2, n):
    p1 = m - 1          // Pointer for nums1 (data end)
    p2 = n - 1          // Pointer for nums2 (data end)
    p = m + n - 1       // Pointer for write position (total end)
    
    while p2 >= 0:      // While elements remain in nums2
        if p1 >= 0 and nums1[p1] > nums2[p2]:
            nums1[p] = nums1[p1]
            p1--
        else:
            nums1[p] = nums2[p2]
            p2--
        p--
```

### JavaScript Implementation

```javascript
/**
 * @param {number[]} nums1
 * @param {number} m
 * @param {number[]} nums2
 * @param {number} n
 * @return {void} Do not return anything, modify nums1 in-place.
 */
var merge = function(nums1, m, nums2, n) {
    let p1 = m - 1;
    let p2 = n - 1;
    let p = m + n - 1;
    
    while (p2 >= 0) {
        // If nums1 has elements AND nums1's element is larger
        if (p1 >= 0 && nums1[p1] > nums2[p2]) {
            nums1[p] = nums1[p1];
            p1--;
        } else {
            // Otherwise, take from nums2
            nums1[p] = nums2[p2];
            p2--;
        }
        p--;
    }
};
```

### Correctness Proof (Invariant)

- **Invariant**: The subarray `nums1[p+1 ... end]` contains the `(m+n-1 - p)` largest elements from the original `nums1` and `nums2`, in sorted order.
- At each step, we pick the largest remaining element from `nums1` or `nums2` and place it at `p`.
- Since we write to `p` (which starts at `m+n-1`) and read from `p1` (starts at `m-1`), `p` is always >= `p1`. Thus, we never overwrite `nums1[p1]` before reading it.

### Dry Run

`nums1 = [1, 2, 3, 0, 0, 0]`, `m=3`
`nums2 = [2, 5, 6]`, `n=3`

Init: `p1=2 (val 3)`, `p2=2 (val 6)`, `p=5`

1. `nums1[2] (3)` vs `nums2[2] (6)`. `6 > 3`.
   - `nums1[5] = 6`. `p2=1`, `p=4`. State: `[1, 2, 3, 0, 0, 6]`

2. `nums1[2] (3)` vs `nums2[1] (5)`. `5 > 3`.
   - `nums1[4] = 5`. `p2=0`, `p=3`. State: `[1, 2, 3, 0, 5, 6]`

3. `nums1[2] (3)` vs `nums2[0] (2)`. `3 > 2`.
   - `nums1[3] = 3`. `p1=1`, `p=2`. State: `[1, 2, 3, 3, 5, 6]`

4. `nums1[1] (2)` vs `nums2[0] (2)`. `2 <= 2`.
   - `nums1[2] = 2`. `p2=-1`, `p=1`. State: `[1, 2, 2, 3, 5, 6]`

Loop ends because `p2 < 0`.

**Result**: `[1, 2, 2, 3, 5, 6]`

### Complexity

- **Time**: O(M + N). We process each element exactly once.
- **Space**: O(1). We operate strictly in-place.

### Practical Performance

This is the standard optimal solution. It is extremely fast and cache-friendly (mostly sequential access, though reverse).

---

## Interview-Ready Explanation (60-90 seconds)

> "The goal is to merge two sorted arrays `nums1` and `nums2` into `nums1`.
> 
> The brute-force way is to copy `nums2` into `nums1` and sort, which is O((M+N)log(M+N)).
> 
> A better approach is to use the fact that they are already sorted. However, traversing from the front is tricky because we'd overwrite elements in `nums1` that we need.
> 
> The **optimal solution** is to traverse **backwards**. We use two pointers, `p1` at the end of valid `nums1` data (`m-1`) and `p2` at the end of `nums2` (`n-1`). We also have a write pointer `p` at the very end of the array (`m+n-1`).
> 
> At each step, we compare `nums1[p1]` and `nums2[p2]`, placing the **larger** one at `nums1[p]` and decrementing the corresponding pointer.
> We repeat this until `nums2` is exhausted. If `nums1` runs out first, the remaining `nums2` elements are simply copied over.
> This runs in linear **O(M+N)** time and **O(1)** space."

---

## Visual Diagram (Backwards Merge)

```
Start:
nums1: [ 1, 3, 5, _, _, _ ]  (m=3)
               ^     ^
              p1     p

nums2: [ 2, 4, 6 ]  (n=3)
               ^
              p2
```

1. Compare `5` vs `6`. `6` is bigger. Write `6` at `p`. Decrement `p2`, `p`.
2. Compare `5` vs `4`. `5` is bigger. Write `5` at `p`. Decrement `p1`, `p`.
3. Compare `3` vs `4`. `4` is bigger. Write `4` at `p`. Decrement `p2`, `p`.
...and so on.
