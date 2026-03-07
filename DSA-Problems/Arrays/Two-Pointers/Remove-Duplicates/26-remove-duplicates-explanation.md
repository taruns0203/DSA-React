# 26. Remove Duplicates from Sorted Array - Complete Explanation

## High-Level Interpretation

Given a **sorted** array, remove duplicate elements **in-place** so each value appears only once. Return the count of unique elements k. The first k positions must contain the unique values in sorted order.

**Key Points:**
- Array is already **sorted** (crucial for the optimal solution)
- Must modify **in-place** (no extra array allowed)
- Return count k of unique elements
- Elements after position k-1 don't matter (can be garbage)
- Order must be preserved

**Hidden Traps:**
- **In-place requirement**: Can't use extra array
- **Return value**: Must return count, not the array
- **Off-by-one**: Carefully track write position
- **Empty array**: Edge case (but constraints say n ≥ 1)

---

## 1. Brute-Force Approach: Use Extra Array

### Idea

Create a new array. Iterate through original, adding each element only if it differs from the previous one. Copy back to original.

**Note**: This violates the in-place requirement but helps understand the problem.

### Pseudocode

```
function removeDuplicates(nums):
    if nums is empty: return 0
    
    unique = [nums[0]]
    
    for i from 1 to n-1:
        if nums[i] != nums[i-1]:
            unique.add(nums[i])
    
    // Copy back
    for i from 0 to unique.length - 1:
        nums[i] = unique[i]
    
    return unique.length
```

### JavaScript Implementation

```javascript
function removeDuplicates(nums) {
    if (nums.length === 0) return 0;
    
    const unique = [nums[0]];
    
    for (let i = 1; i < nums.length; i++) {
        if (nums[i] !== nums[i - 1]) {
            unique.push(nums[i]);
        }
    }
    
    // Copy back to original array
    for (let i = 0; i < unique.length; i++) {
        nums[i] = unique[i];
    }
    
    return unique.length;
}
```

### Complexity Analysis

- **Time**: O(n) — single pass + copy
- **Space**: O(n) — extra array for unique elements

### Dry Run: Example 1

```
nums = [1, 1, 2]

unique starts as [1]

i=1: nums[1]=1, nums[0]=1, equal → skip
i=2: nums[2]=2, nums[1]=1, different → unique = [1, 2]

Copy back: nums = [1, 2, 2]
Return 2
```

### Why This Approach Fails

- Uses O(n) extra space, violating **in-place** requirement
- Unnecessary when we can modify the array directly

---

## 2. Improved Approach: Shift Elements (Slow Two Pointers)

### What Changed?

When we find a duplicate, shift all remaining elements left by one position to overwrite the duplicate.

### Pseudocode

```
function removeDuplicates(nums):
    k = nums.length
    i = 1
    
    while i < k:
        if nums[i] == nums[i-1]:
            // Shift all elements from i+1 to end left by 1
            for j from i to k-2:
                nums[j] = nums[j+1]
            k--
            // Don't increment i, check new element at position i
        else:
            i++
    
    return k
```

### JavaScript Implementation

```javascript
function removeDuplicates(nums) {
    let k = nums.length;
    let i = 1;
    
    while (i < k) {
        if (nums[i] === nums[i - 1]) {
            // Shift elements left
            for (let j = i; j < k - 1; j++) {
                nums[j] = nums[j + 1];
            }
            k--;
        } else {
            i++;
        }
    }
    
    return k;
}
```

### Complexity

- **Time**: O(n²) — each duplicate causes O(n) shift
- **Space**: O(1) — in-place

### Dry Run: Example 1

```
nums = [1, 1, 2], k = 3

i=1: nums[1]=1 == nums[0]=1 (duplicate)
  Shift: [1, 2, 2], k=2
  i stays 1

i=1: nums[1]=2 != nums[0]=1 → i=2

i=2 >= k=2: exit

Return k=2, nums = [1, 2, _]
```

### Trade-offs

- ✓ In-place (O(1) space)
- ✗ O(n²) time — too slow for large arrays
- ✗ Many unnecessary element movements

---

## 3. Optimal Approach: Fast & Slow Pointers

### Intuition

Use two pointers:
- **Slow pointer (write position)**: Points to where next unique element should go
- **Fast pointer (read position)**: Scans through array looking for unique elements

Since array is sorted, duplicates are **adjacent**. When fast finds a new unique value (different from slow's position), copy it to slow+1 and advance slow.

### Why This Works

1. Everything at indices ≤ slow is unique and in order
2. Fast scans ahead looking for the next unique value
3. When found, we write it to slow+1 (next available slot)
4. No need to shift — we only write where needed

### Pseudocode

```
function removeDuplicates(nums):
    if nums is empty: return 0
    
    slow = 0  // Last position of unique element
    
    for fast from 1 to n-1:
        if nums[fast] != nums[slow]:
            slow++
            nums[slow] = nums[fast]
    
    return slow + 1  // Count of unique elements
```

### JavaScript Implementation

```javascript
function removeDuplicates(nums) {
    if (nums.length === 0) return 0;
    
    let slow = 0;  // Points to last unique element position
    
    for (let fast = 1; fast < nums.length; fast++) {
        if (nums[fast] !== nums[slow]) {
            slow++;
            nums[slow] = nums[fast];
        }
    }
    
    return slow + 1;  // Number of unique elements
}
```

### Correctness Proof

**Invariant**: After processing index fast, positions 0 to slow contain all unique values seen so far, in sorted order.

**Proof by induction**:
1. **Base case**: Initially slow=0, nums[0] is trivially unique
2. **Inductive step**: If nums[fast] differs from nums[slow] (the last unique), it's a new unique value. We place it at slow+1, maintaining the invariant.
3. **Termination**: After processing all elements, positions 0 to slow contain k unique values ∎

### Dry Run: Example 1

```
nums = [1, 1, 2]

Initial: slow = 0

| fast | nums[fast] | nums[slow] | Different? | Action | slow | nums |
|------|------------|------------|------------|--------|------|------|
| 1    | 1          | 1          | No         | skip   | 0    | [1,1,2] |
| 2    | 2          | 1          | Yes        | copy   | 1    | [1,2,2] |

Return slow + 1 = 2
nums = [1, 2, _]
```

### Dry Run: Example 2

```
nums = [0, 0, 1, 1, 1, 2, 2, 3, 3, 4]

Initial: slow = 0

| fast | nums[fast] | nums[slow] | Different? | Action | slow | nums |
|------|------------|------------|------------|--------|------|------|
| 1    | 0          | 0          | No         | skip   | 0    | [0,0,1,1,1,2,2,3,3,4] |
| 2    | 1          | 0          | Yes        | copy   | 1    | [0,1,1,1,1,2,2,3,3,4] |
| 3    | 1          | 1          | No         | skip   | 1    | ... |
| 4    | 1          | 1          | No         | skip   | 1    | ... |
| 5    | 2          | 1          | Yes        | copy   | 2    | [0,1,2,1,1,2,2,3,3,4] |
| 6    | 2          | 2          | No         | skip   | 2    | ... |
| 7    | 3          | 2          | Yes        | copy   | 3    | [0,1,2,3,1,2,2,3,3,4] |
| 8    | 3          | 3          | No         | skip   | 3    | ... |
| 9    | 4          | 3          | Yes        | copy   | 4    | [0,1,2,3,4,2,2,3,3,4] |

Return slow + 1 = 5
nums = [0, 1, 2, 3, 4, _, _, _, _, _]
```

### Complexity

- **Time**: O(n) — single pass through array
- **Space**: O(1) — only two pointers, no extra array

### Practical Performance

- Optimal for this problem
- Simple to implement and understand
- No unnecessary element movements
- Works for any sorted array with duplicates

---

## Interview-Ready Explanation (60-90 seconds)

> "For removing duplicates from a sorted array in-place, I use the two-pointer technique — a slow pointer and a fast pointer.
>
> The slow pointer tracks where the next unique element should be placed. The fast pointer scans through the array looking for new unique values.
>
> Since the array is sorted, duplicates are always adjacent. When fast finds an element different from what slow points to, it's a new unique value. I increment slow and write that value there.
>
> For example, with [1,1,2], slow starts at 0. Fast=1 sees another 1, so we skip. Fast=2 sees 2, which differs from nums[slow]=1, so I write it to position 1.
>
> At the end, slow+1 gives the count of unique elements, and positions 0 to slow contain them in order.
>
> Time complexity is O(n) for a single pass, space is O(1) since we modify in-place with just two pointers."

---

## Visual Diagram

### Two Pointer Movement

```
Initial: nums = [0, 0, 1, 1, 1, 2, 2, 3, 3, 4]
                 S  F

Step 1: nums[F]=0 == nums[S]=0, skip
         [0, 0, 1, 1, 1, 2, 2, 3, 3, 4]
          S     F

Step 2: nums[F]=1 != nums[S]=0, copy!
         [0, 1, 1, 1, 1, 2, 2, 3, 3, 4]
             S  F

Step 3-4: nums[F]=1 == nums[S]=1, skip
         [0, 1, 1, 1, 1, 2, 2, 3, 3, 4]
             S        F

Step 5: nums[F]=2 != nums[S]=1, copy!
         [0, 1, 2, 1, 1, 2, 2, 3, 3, 4]
                S     F

... continue ...

Final:   [0, 1, 2, 3, 4, _, _, _, _, _]
                      S              F
         
Return: S + 1 = 5
```

### Key Insight

```
Before: [0, 0, 1, 1, 1, 2, 2, 3, 3, 4]
         ↑  ↑  ↑  ↑  ↑  ↑  ↑  ↑  ↑  ↑
         k  d  k  d  d  k  d  k  d  k
         
k = keep (unique), d = duplicate

After:  [0, 1, 2, 3, 4, ?, ?, ?, ?, ?]
         ↑  ↑  ↑  ↑  ↑
         All unique values, in order
```

---

## Comparison of Approaches

| Approach | Time | Space | Notes |
|----------|------|-------|-------|
| Extra Array | O(n) | O(n) | ❌ Not in-place |
| Shift Elements | O(n²) | O(1) | ❌ Too slow |
| **Two Pointers** | **O(n)** | **O(1)** | **✓ Optimal** |

---

## Key Takeaways

1. **Two pointers for in-place**: Slow writes, fast reads
2. **Sorted property is crucial**: Duplicates are adjacent
3. **Compare with slow, not fast-1**: Ensures we check against last unique
4. **Write at slow+1**: Next available position for unique
5. **Return slow+1**: Count, not index
6. **No shifting needed**: Just overwrite, ignore garbage after k
7. **Works with all same elements**: [1,1,1,1] → [1], k=1
8. **Works with all unique**: [1,2,3,4] → [1,2,3,4], k=4
9. **Template pattern**: Same for "Remove Element", "Move Zeroes"
10. **Edge case**: Single element → always returns 1
