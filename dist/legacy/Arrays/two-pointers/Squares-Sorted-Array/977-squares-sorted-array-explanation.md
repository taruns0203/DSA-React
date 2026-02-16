# 977. Squares of a Sorted Array - Complete Explanation

## High-Level Interpretation

Given a **sorted** array (may contain negatives), return an array of squares of each element, also **sorted**. The key insight is that negative numbers become positive when squared, potentially becoming larger than positive numbers.

**Key Points:**
- Input is already sorted in non-decreasing order
- Squaring changes the relative order (negatives flip)
- Output must be sorted in non-decreasing order
- The largest squares are at the **ends** (most negative or most positive)

**Hidden Traps:**
- **Negative numbers**: -4 squared is 16, larger than 3² = 9
- **Mixed array**: Negatives at left, positives at right
- **All same sign**: Still works, but simpler case
- **Zeros**: 0² = 0, smallest possible square

---

## 1. Brute-Force Approach: Square and Sort

### Idea

Square each element, then sort the result. Simple and correct but doesn't use the sorted property of input.

### Pseudocode

```
function sortedSquares(nums):
    result = []
    for each num in nums:
        result.push(num * num)
    sort(result)
    return result
```

### JavaScript Implementation

```javascript
function sortedSquares(nums) {
    const result = nums.map(num => num * num);
    result.sort((a, b) => a - b);
    return result;
}
```

### Complexity Analysis

- **Time**: O(n log n) — mapping is O(n), sorting is O(n log n)
- **Space**: O(n) — for the result array (required by problem)

### Dry Run: Example 1

```
nums = [-4, -1, 0, 3, 10]

Step 1: Square each element
[-4, -1, 0, 3, 10] → [16, 1, 0, 9, 100]

Step 2: Sort
[16, 1, 0, 9, 100] → [0, 1, 9, 16, 100]

Result: [0, 1, 9, 16, 100]
```

### Why This Approach Is Suboptimal

- Doesn't leverage the **sorted property** of input
- O(n log n) sorting when O(n) is achievable
- The follow-up explicitly asks for O(n) solution

---

## 2. Improved Approach: Find Pivot, Merge Two Halves

### What Changed?

The sorted input means:
- Left side (negatives) → squares in **decreasing** order
- Right side (positives) → squares in **increasing** order

Find where negatives end, then merge like merge sort.

### Pseudocode

```
function sortedSquares(nums):
    n = nums.length
    
    // Find pivot: first non-negative index
    pivot = 0
    while pivot < n and nums[pivot] < 0:
        pivot++
    
    // Two pointers: left goes backward, right goes forward
    left = pivot - 1
    right = pivot
    result = []
    
    while left >= 0 and right < n:
        leftSq = nums[left] * nums[left]
        rightSq = nums[right] * nums[right]
        if leftSq < rightSq:
            result.push(leftSq)
            left--
        else:
            result.push(rightSq)
            right++
    
    // Remaining elements
    while left >= 0:
        result.push(nums[left] * nums[left])
        left--
    while right < n:
        result.push(nums[right] * nums[right])
        right++
    
    return result
```

### JavaScript Implementation

```javascript
function sortedSquares(nums) {
    const n = nums.length;
    
    // Find pivot: first non-negative
    let pivot = 0;
    while (pivot < n && nums[pivot] < 0) {
        pivot++;
    }
    
    // Merge two halves
    let left = pivot - 1;
    let right = pivot;
    const result = [];
    
    while (left >= 0 && right < n) {
        const leftSq = nums[left] * nums[left];
        const rightSq = nums[right] * nums[right];
        
        if (leftSq < rightSq) {
            result.push(leftSq);
            left--;
        } else {
            result.push(rightSq);
            right++;
        }
    }
    
    while (left >= 0) {
        result.push(nums[left] * nums[left]);
        left--;
    }
    
    while (right < n) {
        result.push(nums[right] * nums[right]);
        right++;
    }
    
    return result;
}
```

### Complexity

- **Time**: O(n) — single pass to find pivot + single pass to merge
- **Space**: O(n) — for result array

### Dry Run: Example 1

```
nums = [-4, -1, 0, 3, 10]

Step 1: Find pivot (first non-negative)
pivot = 2 (nums[2] = 0)

Initial: left = 1, right = 2
Squares: [...-1²=1, 0²=0, 3²=9, ...]

| Step | left | right | leftSq | rightSq | Pick | result |
|------|------|-------|--------|---------|------|--------|
| 1    | 1    | 2     | 1      | 0       | R    | [0]    |
| 2    | 1    | 3     | 1      | 9       | L    | [0,1]  |
| 3    | 0    | 3     | 16     | 9       | R    | [0,1,9]|
| 4    | 0    | 4     | 16     | 100     | L    | [0,1,9,16] |
| 5    | -1   | 4     | -      | 100     | R    | [0,1,9,16,100] |

Result: [0, 1, 9, 16, 100]
```

### Trade-offs

- ✓ O(n) time
- ✓ Correct and efficient
- ✗ Slightly more complex with pivot finding
- ✗ Multiple while loops

---

## 3. Optimal Approach: Two Pointers from Ends

### Intuition

The largest squares are at the **ends** of the sorted array:
- Most negative number (left end) has large absolute value
- Most positive number (right end) has large absolute value

Start with pointers at both ends, compare squares, fill result from **right to left** (largest to smallest).

### Why This Is Better

- No pivot finding needed
- Single elegant while loop
- Works for all cases (all negative, all positive, mixed)

### Pseudocode

```
function sortedSquares(nums):
    n = nums.length
    result = new array of size n
    
    left = 0
    right = n - 1
    pos = n - 1  // Fill from end
    
    while left <= right:
        leftSq = nums[left] * nums[left]
        rightSq = nums[right] * nums[right]
        
        if leftSq > rightSq:
            result[pos] = leftSq
            left++
        else:
            result[pos] = rightSq
            right--
        pos--
    
    return result
```

### JavaScript Implementation

```javascript
function sortedSquares(nums) {
    const n = nums.length;
    const result = new Array(n);
    
    let left = 0;
    let right = n - 1;
    let pos = n - 1;  // Fill from the end (largest first)
    
    while (left <= right) {
        const leftSq = nums[left] * nums[left];
        const rightSq = nums[right] * nums[right];
        
        if (leftSq > rightSq) {
            result[pos] = leftSq;
            left++;
        } else {
            result[pos] = rightSq;
            right--;
        }
        pos--;
    }
    
    return result;
}
```

### Correctness Proof

**Invariant**: After each iteration, result[pos+1 ... n-1] contains the (n-1-pos) largest squared values in sorted order.

**Proof**:
1. **Base case**: Initially pos = n-1, no values filled, invariant trivially holds
2. **Inductive step**: We compare the two candidates for largest remaining square (at ends). The larger one is placed at result[pos]. Both candidates are the max of their respective regions because:
   - Left region squares decrease as we move right (toward 0)
   - Right region squares increase as we move right (away from 0)
3. **Termination**: When left > right, all elements processed, pos = -1, result is fully filled ∎

### Dry Run: Example 1

```
nums = [-4, -1, 0, 3, 10]
result = [_, _, _, _, _], pos = 4

| Step | left | right | leftSq | rightSq | Pick | pos | result |
|------|------|-------|--------|---------|------|-----|--------|
| 1    | 0    | 4     | 16     | 100     | R    | 4→3 | [_,_,_,_,100] |
| 2    | 0    | 3     | 16     | 9       | L    | 3→2 | [_,_,_,16,100] |
| 3    | 1    | 3     | 1      | 9       | R    | 2→1 | [_,_,9,16,100] |
| 4    | 1    | 2     | 1      | 0       | L    | 1→0 | [_,1,9,16,100] |
| 5    | 2    | 2     | 0      | 0       | R    | 0→-1| [0,1,9,16,100] |

left=2, right=1: exit (left > right)
Result: [0, 1, 9, 16, 100] ✓
```

### Dry Run: Example 2

```
nums = [-7, -3, 2, 3, 11]
result = [_, _, _, _, _], pos = 4

| Step | left | right | leftSq | rightSq | Pick | pos | result |
|------|------|-------|--------|---------|------|-----|--------|
| 1    | 0    | 4     | 49     | 121     | R    | 4→3 | [_,_,_,_,121] |
| 2    | 0    | 3     | 49     | 9       | L    | 3→2 | [_,_,_,49,121] |
| 3    | 1    | 3     | 9      | 9       | R    | 2→1 | [_,_,9,49,121] |
| 4    | 1    | 2     | 9      | 4       | L    | 1→0 | [_,9,9,49,121] |
| 5    | 2    | 2     | 4      | 4       | R    | 0→-1| [4,9,9,49,121] |

Result: [4, 9, 9, 49, 121] ✓
```

### Complexity

- **Time**: O(n) — single pass, each element visited once
- **Space**: O(n) — for result array (required by problem)

### Practical Performance

- Single clean while loop
- No branching for special cases
- Works uniformly for all input patterns
- Cache-friendly sequential access

---

## Interview-Ready Explanation (60-90 seconds)

> "For squares of a sorted array, the key insight is that after squaring, the largest values are at the ends — either the most negative number on the left or the largest positive on the right.
>
> I use two pointers starting at both ends. I compare the squares of the left and right elements. Whichever is larger goes into the result array, filling from the end backwards.
>
> For example, with [-4, -1, 0, 3, 10]: I compare 16 and 100. 100 is larger, so it goes at the last position. Then I compare 16 and 9, 16 is larger, and so on.
>
> I keep moving the pointers inward — left moves right when its square is picked, right moves left otherwise. When the pointers cross, I'm done.
>
> Time complexity is O(n) since each element is visited exactly once. Space is O(n) for the result array, which is required by the problem."

---

## Visual Diagram

### Two Pointers from Ends

```
nums = [-4, -1, 0, 3, 10]
        L              R
       16             100
       
Compare: 16 vs 100 → 100 wins
result = [_, _, _, _, 100]
                      ↑pos

nums = [-4, -1, 0, 3, 10]
        L          R
       16          9
       
Compare: 16 vs 9 → 16 wins
result = [_, _, _, 16, 100]
                  ↑pos

nums = [-4, -1, 0, 3, 10]
            L      R
            1      9
            
Compare: 1 vs 9 → 9 wins
result = [_, _, 9, 16, 100]
              ↑pos

... continue until L > R ...
```

### Why Ends Have Largest Squares

```
Original sorted: [-4, -1, 0, 3, 10]
                  ←──────┬──────→
                   neg   │   pos
                         0
                         
Squares:          [16,  1, 0, 9, 100]
                   ↑              ↑
                 large          large
                 (from -4)    (from 10)
                 
The middle (near 0) has smallest squares!
```

---

## Comparison of Approaches

| Approach | Time | Space | Notes |
|----------|------|-------|-------|
| Square + Sort | O(n log n) | O(n) | ❌ Doesn't use sorted property |
| Pivot + Merge | O(n) | O(n) | ✓ Good, but more complex |
| **Two Pointers from Ends** | **O(n)** | **O(n)** | **✓ Optimal & elegant** |

---

## Key Takeaways

1. **Sorted input is key**: Largest absolute values at ends
2. **Fill from end**: Place largest first, work backwards
3. **Two pointers converge**: Left moves right, right moves left
4. **No pivot needed**: Works for any sign distribution
5. **Single while loop**: Clean and efficient
6. **Compare squares, not values**: Negative handling automatic
7. **O(n) achievable**: Follow-up asks for this specifically
8. **Template pattern**: Similar to merge step in merge sort
9. **Edge cases handled**: All positive, all negative, single element
10. **Space is required**: O(n) for result (not extra overhead)
