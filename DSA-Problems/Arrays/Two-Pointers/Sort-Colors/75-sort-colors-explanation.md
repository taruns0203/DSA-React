# 75. Sort Colors - Complete Explanation

## High-Level Interpretation

This problem asks you to sort an array containing only three distinct values: 0 (Red), 1 (White), and 2 (Blue). The goal is to group all 0s together, followed by all 1s, and then all 2s.

**Why It Matters:**
- This is a classic example of the **Dutch National Flag Problem** proposed by Edsger Dijkstra.
- It tests your ability to manipulate array pointers *in-place*.
- It's a specific case of sorting with a very small range of keys, where we can beat the standard O(N log N) sorting time.

**Hidden Traps:**
- **In-Place Requirement**: You cannot create a new array to return; you must modify the input array directly.
- **No Library Sort**: You are explicitly forbidden from using `Array.prototype.sort()` because that would be trivial O(N log N). We need something faster (O(N)).

---

## 1. Brute-Force Approach: Two-Pass Counting Sort

### Idea

Since we know there are only three possible values (0, 1, 2), we can simply count how many 0s, 1s, and 2s appear in the array. 
After counting, we can overwrite the original array: first fill it with the counted number of 0s, then the 1s, then the 2s.

### Pseudocode

```
function sortColors(nums):
    count0 = 0
    count1 = 0
    count2 = 0
    
    // Pass 1: Count frequencies
    for num in nums:
        if num == 0: count0++
        else if num == 1: count1++
        else: count2++
        
    // Pass 2: Overwrite array
    for i from 0 to count0-1:
        nums[i] = 0
        
    for i from count0 to count0+count1-1:
        nums[i] = 1
        
    for i from count0+count1 to end:
        nums[i] = 2
```

### Complexity

- **Time**: O(N). We iterate through the array twice (2N steps).
- **Space**: O(1). We only need three integer variables for counting.

### Dry Run

Input: `[2, 0, 2, 1, 1, 0]`

**Pass 1 (Counting):**
- count0 = 2 (indices 1, 5)
- count1 = 2 (indices 3, 4)
- count2 = 2 (indices 0, 2)

**Pass 2 (Overwriting):**
- Write 0s: `nums[0]=0`, `nums[1]=0`
- State: `[0, 0, 2, 1, 1, 0]`
- Write 1s: `nums[2]=1`, `nums[3]=1`
- State: `[0, 0, 1, 1, 1, 0]`
- Write 2s: `nums[4]=2`, `nums[5]=2`
- Final: `[0, 0, 1, 1, 2, 2]`

### Why This is "Slow" (relatively)
It's actually O(N) which is very fast! However, the problem statement often asks for a **one-pass** solution. This approach requires iterating through the array twice. In very large systems or streaming data, a single pass is preferred.

---

## 2. Optimal Approach: One-Pass (Dutch National Flag)

### Intuition

We can solve this in a single pass using **three pointers**:
1. `low`: The boundary for 0s (Red). Everything *before* `low` is a 0.
2. `high`: The boundary for 2s (Blue). Everything *after* `high` is a 2.
3. `i` (or `mid`): The current element we are examining.

The idea is to sweep `i` through the array involves:
- If we see a **0**: Swap it to the `low` region and advance both `low` and `i`.
- If we see a **1**: It's in the correct middle place, just advance `i`.
- If we see a **2**: Swap it to the `high` region and shrink `high`. **Do not advance `i` yet**, because the element we swapped in from `high` hasn't been examined yet!

### Pseudocode

```
function sortColors(nums):
    low = 0
    high = nums.length - 1
    i = 0
    
    while i <= high:
        if nums[i] == 0:
            swap(nums[i], nums[low])
            low++
            i++
        else if nums[i] == 1:
            i++
        else: // nums[i] == 2
            swap(nums[i], nums[high])
            high--
            // i is NOT incremented
```

### JavaScript Implementation

```javascript
/**
 * @param {number[]} nums
 * @return {void} Do not return anything, modify nums in-place.
 */
var sortColors = function(nums) {
    let low = 0;
    let high = nums.length - 1;
    let i = 0;
    
    while (i <= high) {
        if (nums[i] === 0) {
            // Found a 0: swap to the front
            [nums[i], nums[low]] = [nums[low], nums[i]];
            low++;
            i++;
        } else if (nums[i] === 2) {
            // Found a 2: swap to the back
            [nums[i], nums[high]] = [nums[high], nums[i]];
            high--;
            // IMPORTANT: do i++ here? NO.
            // The value swapped from index 'high' is unknown.
            // We must re-check nums[i] in the next iteration.
        } else {
            // Found a 1: leave it in the middle
            i++;
        }
    }
};
```

### Correctness Proof (Invariant)

We maintain three regions based on our pointers:
1. `[0 ... low-1]`: All **0**s.
2. `[low ... i-1]`: All **1**s.
3. `[high+1 ... end]`: All **2**s.
4. `[i ... high]`: Unknown (Unsorted area).

Initially, `i=0` and `high=n-1`, so the whole array is "Unknown".
As `i` meets `high`, the "Unknown" region shrinks to zero, leaving the array fully sorted.

### Dry Run

Input: `grams = [2, 0, 2, 1, 1, 0]` i=0, low=0, high=5

| Step | i | low | high | Array State | Action |
| :--- | :- | :- | :- | :--- | :--- |
| 1 | 0 | 0 | 5 | `[2, 0, 2, 1, 1, 0]` | `nums[0]` is **2**. Swap with `nums[5]` (0). `high--`. |
| 2 | 0 | 0 | 4 | `[0, 0, 2, 1, 1, 2]` | `nums[0]` is now **0**. Swap with `nums[0]` (itself). `low++`, `i++`. |
| 3 | 1 | 1 | 4 | `[0, 0, 2, 1, 1, 2]` | `nums[1]` is **0**. Swap with `nums[1]` (itself). `low++`, `i++`. |
| 4 | 2 | 2 | 4 | `[0, 0, 2, 1, 1, 2]` | `nums[2]` is **2**. Swap with `nums[4]` (1). `high--`. |
| 5 | 2 | 2 | 3 | `[0, 0, 1, 1, 2, 2]` | `nums[2]` is now **1**. Just `i++`. |
| 6 | 3 | 2 | 3 | `[0, 0, 1, 1, 2, 2]` | `nums[3]` is **1**. Just `i++`. |
| 7 | 4 | 2 | 3 | `[0, 0, 1, 1, 2, 2]` | `i > high` (4 > 3). Loop ends. |

**Result**: `[0, 0, 1, 1, 2, 2]`

### Complexity

- **Time**: O(N). We visit each element at most once. The `i` pointer advances in 2 out of 3 cases, and `high` shrinks in the 3rd case, so the total operations are linear.
- **Space**: O(1). In-place with constant extra variables.

### Practical Performance

This is the standard algorithm used in libraries for "partitioning" steps (like inside QuickSort). For only 3 keys, it's optimal.

---

## Interview-Ready Explanation (60-90 seconds)

> "To sort the colors (0, 1, 2) in-place and in one pass, I use the **Dutch National Flag algorithm**.
>
> We use **three pointers**: `low` for the boundary of 0s, `high` for the boundary of 2s, and `i` as a current iterator.
>
> We iterate through the array with `i`:
> 1. If we encounter a **0**, we swap it with the element at `low`, and increment both `low` and `i`, expanding the 0s region.
> 2. If we encounter a **2**, we swap it with the element at `high` and decrement `high`. Importantly, we **do not** increment `i` yet, because the swapped element from `high` is new and needs checking.
> 3. If we see a **1**, we leave it alone and just increment `i`, effectively keeping it in the middle.
>
> This sorts the array in O(N) time with O(1) space, satisfying the optimal follow-up constraints."

---

## Visual Diagram

```
[ 0, 0, 0, | 1, 1, 1, | ?, ?, ? | 2, 2, 2 ]
           ^          ^         ^
          low         i        high
```

- **Left of `low`**: Definitely 0
- **Between `low` and `i`**: Definitely 1
- **Between `i` and `high`**: Unknown (to be processed)
- **Right of `high`**: Definitely 2
