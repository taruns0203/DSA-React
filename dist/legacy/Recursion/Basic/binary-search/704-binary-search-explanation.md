# 704. Binary Search - Complete Walkthrough

## High-Level Interpretation

**What the problem asks:** Given a **sorted** array of unique integers and a target value, find the index where the target exists, or return -1 if it doesn't exist. The key constraint is that we must achieve O(log n) runtime.

**Why it matters:** This is the foundational divide-and-conquer searching algorithm. Every interview expects you to know this cold. It's also the basis for more complex algorithms (binary search on answer, finding boundaries, etc.).

**Hidden traps to watch for:**
1. **Off-by-one errors:** The most common bug—getting `left`, `right`, and `mid` boundaries wrong
2. **Integer overflow:** `(left + right) / 2` can overflow in some languages (not JS, but important to know)
3. **Infinite loops:** Wrong update logic can cause the loop to never terminate
4. **Inclusive vs exclusive bounds:** Different valid implementations exist; mixing conventions causes bugs

---

## 1. Brute-Force Approach: Linear Search

### Idea in Plain Words
Simply scan through every element from left to right. When we find the target, return its index. If we reach the end without finding it, return -1.

This completely ignores the fact that the array is sorted—we're treating it like an unsorted array.

### Pseudocode
```
function linearSearch(nums, target):
    for i from 0 to nums.length - 1:
        if nums[i] == target:
            return i
    return -1
```

### JavaScript Implementation
```javascript
function searchBruteForce(nums, target) {
    for (let i = 0; i < nums.length; i++) {
        if (nums[i] === target) {
            return i;
        }
    }
    return -1;
}
```

### Time & Space Complexity

| Complexity | Value | Derivation |
|------------|-------|------------|
| **Time** | O(n) | We potentially check every element once. Worst case: target is last or doesn't exist. |
| **Space** | O(1) | Only using a single loop variable `i`. No extra data structures. |

### Dry Run: Example 1
**Input:** `nums = [-1, 0, 3, 5, 9, 12]`, `target = 9`

| Step | i | nums[i] | nums[i] === 9? | Action |
|------|---|---------|----------------|--------|
| 1 | 0 | -1 | No | Continue |
| 2 | 1 | 0 | No | Continue |
| 3 | 2 | 3 | No | Continue |
| 4 | 3 | 5 | No | Continue |
| 5 | 4 | 9 | ✅ Yes | **Return 4** |

**Result:** `4` ✓

### Dry Run: Example 2
**Input:** `nums = [-1, 0, 3, 5, 9, 12]`, `target = 2`

| Step | i | nums[i] | nums[i] === 2? | Action |
|------|---|---------|----------------|--------|
| 1 | 0 | -1 | No | Continue |
| 2 | 1 | 0 | No | Continue |
| 3 | 2 | 3 | No | Continue |
| 4 | 3 | 5 | No | Continue |
| 5 | 4 | 9 | No | Continue |
| 6 | 5 | 12 | No | Continue |
| 7 | - | - | Loop ends | **Return -1** |

**Result:** `-1` ✓

### Why This Approach Fails
- **Ignores sorted property:** We're given a sorted array but not using that information at all
- **Too slow for constraints:** With n up to 10^4, linear search works but is inefficient
- **Doesn't meet requirements:** Problem explicitly requires O(log n), and this is O(n)

---

## 2. Optimal Approach: Binary Search

### The Key Insight

Since the array is **sorted**, we can eliminate **half** of the remaining elements with each comparison:

1. Look at the **middle** element
2. If it equals target → found it!
3. If target is **smaller** → it must be in the **left half** (discard right half)
4. If target is **larger** → it must be in the **right half** (discard left half)
5. Repeat until found or no elements remain

**Why it's correct:** In a sorted array, all elements to the left of any element are smaller, and all to the right are larger. So comparing with the middle tells us exactly which half to search.

### Visual Diagram (ASCII)

```
Initial: [-1, 0, 3, 5, 9, 12]    target = 9
          ↑           ↑
         left        right
              ↑
             mid (index 2, value 3)
         
         3 < 9, so target is in RIGHT half
         
Step 2:  [-1, 0, 3, 5, 9, 12]
                    ↑     ↑
                   left  right
                       ↑
                      mid (index 4, value 9)
         
         9 === 9 ✓ FOUND at index 4!
```

### Pseudocode
```
function binarySearch(nums, target):
    left = 0
    right = nums.length - 1
    
    while left <= right:
        mid = left + floor((right - left) / 2)  // Avoids overflow
        
        if nums[mid] == target:
            return mid           // Found!
        else if nums[mid] < target:
            left = mid + 1       // Search right half
        else:
            right = mid - 1      // Search left half
    
    return -1                    // Not found
```

### JavaScript Implementation
```javascript
function search(nums, target) {
    let left = 0;
    let right = nums.length - 1;
    
    while (left <= right) {
        // Calculate mid (avoids potential overflow in other languages)
        const mid = left + Math.floor((right - left) / 2);
        
        if (nums[mid] === target) {
            return mid;          // Found the target
        } else if (nums[mid] < target) {
            left = mid + 1;      // Target is in right half
        } else {
            right = mid - 1;     // Target is in left half
        }
    }
    
    return -1;  // Target not found
}
```

### Proof of Correctness

**Loop Invariant:** At the start of each iteration, if target exists in nums, it must be in the range `[left, right]` (inclusive).

**Proof by Induction:**
1. **Base case:** Initially `left = 0`, `right = n-1`. The entire array is in range, so invariant holds.
2. **Inductive step:** 
   - If `nums[mid] === target`: We return immediately (correct answer)
   - If `nums[mid] < target`: Since array is sorted, target can't be at indices `0` to `mid`. Setting `left = mid + 1` maintains invariant.
   - If `nums[mid] > target`: Since array is sorted, target can't be at indices `mid` to `n-1`. Setting `right = mid - 1` maintains invariant.
3. **Termination:** Each iteration, the range shrinks by at least half. Eventually `left > right`, meaning range is empty → target doesn't exist → return -1.

### Dry Run: Example 1
**Input:** `nums = [-1, 0, 3, 5, 9, 12]`, `target = 9`

| Iteration | left | right | mid | nums[mid] | Comparison | Action |
|-----------|------|-------|-----|-----------|------------|--------|
| 1 | 0 | 5 | 2 | 3 | 3 < 9 | left = 3 |
| 2 | 3 | 5 | 4 | 9 | 9 === 9 | **Return 4** ✅ |

**Result:** `4` ✓ (Only 2 comparisons vs 5 in brute force!)

### Dry Run: Example 2
**Input:** `nums = [-1, 0, 3, 5, 9, 12]`, `target = 2`

| Iteration | left | right | mid | nums[mid] | Comparison | Action |
|-----------|------|-------|-----|-----------|------------|--------|
| 1 | 0 | 5 | 2 | 3 | 3 > 2 | right = 1 |
| 2 | 0 | 1 | 0 | -1 | -1 < 2 | left = 1 |
| 3 | 1 | 1 | 1 | 0 | 0 < 2 | left = 2 |
| 4 | 2 | 1 | - | - | left > right | **Return -1** ✅ |

**Result:** `-1` ✓ (Only 3 comparisons vs 6 in brute force!)

### Time & Space Complexity

| Complexity | Value | Derivation |
|------------|-------|------------|
| **Time** | O(log n) | Each iteration halves the search space. Starting with n elements, after k iterations we have n/2^k elements. Loop ends when n/2^k < 1, i.e., k > log₂(n). |
| **Space** | O(1) | Only using 3 variables: `left`, `right`, `mid`. No recursion, no extra arrays. |

**Practical Performance:**
- For n = 10,000 → at most ⌈log₂(10000)⌉ = 14 comparisons
- For n = 1,000,000 → at most 20 comparisons
- For n = 1 billion → at most 30 comparisons

This is why binary search is so powerful!

---

## 3. Alternative Implementation: Recursive Binary Search

For completeness, here's the recursive version (same complexity):

```javascript
function searchRecursive(nums, target, left = 0, right = nums.length - 1) {
    // Base case: empty range
    if (left > right) return -1;
    
    const mid = left + Math.floor((right - left) / 2);
    
    if (nums[mid] === target) {
        return mid;
    } else if (nums[mid] < target) {
        return searchRecursive(nums, target, mid + 1, right);
    } else {
        return searchRecursive(nums, target, left, mid - 1);
    }
}
```

**Trade-offs:**
- ✅ More intuitive for some people
- ❌ O(log n) space due to call stack (iterative is O(1))
- ❌ Slightly slower due to function call overhead

---

## 4. Common Mistakes & Edge Cases

### Mistake 1: Wrong mid calculation
```javascript
// ❌ Can overflow in some languages (not JS)
const mid = (left + right) / 2;

// ✅ Safe version
const mid = left + Math.floor((right - left) / 2);
```

### Mistake 2: Wrong boundary updates
```javascript
// ❌ WRONG - causes infinite loop
left = mid;      // Should be mid + 1
right = mid;     // Should be mid - 1

// ✅ CORRECT
left = mid + 1;
right = mid - 1;
```

### Mistake 3: Wrong loop condition
```javascript
// ❌ WRONG - misses single-element case
while (left < right)

// ✅ CORRECT - includes case where left === right
while (left <= right)
```

### Edge Cases to Test
| Case | Input | Expected |
|------|-------|----------|
| Single element (found) | `[5]`, target=5 | 0 |
| Single element (not found) | `[5]`, target=3 | -1 |
| Target at start | `[1,2,3]`, target=1 | 0 |
| Target at end | `[1,2,3]`, target=3 | 2 |
| Two elements | `[1,2]`, target=2 | 1 |
| Negative numbers | `[-5,-3,-1]`, target=-3 | 1 |

---

## 5. Interview-Ready Explanation (60-90 seconds)

> "For binary search, I'll use the classic iterative approach with two pointers.
> 
> I maintain a `left` and `right` pointer representing the current search range. In each iteration, I calculate the middle index and compare the middle element with the target.
> 
> If they're equal, I've found it and return the index. If the target is larger, I know it must be in the right half since the array is sorted, so I move `left` to `mid + 1`. If the target is smaller, I search the left half by moving `right` to `mid - 1`.
> 
> I continue until the pointers cross, meaning the target doesn't exist, and I return -1.
> 
> **Time complexity is O(log n)** because I halve the search space each iteration. **Space is O(1)** since I only use a few variables.
> 
> The key insight is that sorting lets us eliminate half the remaining elements with each comparison, giving us logarithmic time instead of linear."

---

## 6. Summary Comparison

| Approach | Time | Space | Notes |
|----------|------|-------|-------|
| Brute Force (Linear) | O(n) | O(1) | Ignores sorted property |
| **Binary Search (Iterative)** | **O(log n)** | **O(1)** | **Optimal** ✅ |
| Binary Search (Recursive) | O(log n) | O(log n) | Stack space overhead |

---

## 7. Key Takeaways

1. **Always use sorted property** - If an array is sorted, binary search should be your first thought
2. **Watch for off-by-one errors** - Use `left <= right` and `mid ± 1` consistently
3. **Avoid overflow** - Use `left + (right - left) / 2` instead of `(left + right) / 2`
4. **Prefer iterative** - Same time complexity, better space complexity than recursive
5. **Test edge cases** - Single element, target at boundaries, not found
