# 1. Two Sum - Complete Explanation

## High-Level Interpretation

Given an array of integers and a target sum, find **two different indices** whose elements add up exactly to the target. Return these indices in any order. The problem guarantees exactly one solution exists.

**Key Points:**
- Return **indices**, not values
- Cannot use the same element twice (indices must be different)
- Exactly one valid answer exists (no need to handle multiple solutions)
- Negative numbers are allowed
- Array is **not sorted**

**Hidden Traps:**
- Don't return the same index twice (e.g., if target=6 and nums=[3], can't use index 0 twice)
- Duplicates in array are allowed (e.g., [3,3], target=6 → valid)
- Answer order doesn't matter

---

## 1. Brute-Force Approach: Nested Loops

### Idea

Check every pair of elements (i, j) where i < j. If nums[i] + nums[j] equals target, return [i, j].

### Pseudocode

```
function twoSum(nums, target):
    n = nums.length
    
    for i from 0 to n-2:
        for j from i+1 to n-1:
            if nums[i] + nums[j] == target:
                return [i, j]
    
    return []  // No solution (won't happen per constraints)
```

### JavaScript Implementation

```javascript
function twoSum(nums, target) {
    const n = nums.length;
    
    for (let i = 0; i < n - 1; i++) {
        for (let j = i + 1; j < n; j++) {
            if (nums[i] + nums[j] === target) {
                return [i, j];
            }
        }
    }
    
    return [];
}
```

### Complexity Analysis

- **Time**: O(n²) — nested loops, each up to n iterations
- **Space**: O(1) — only uses a few variables

### Dry Run: Example 1

```
nums = [2, 7, 11, 15], target = 9

i=0, j=1: nums[0] + nums[1] = 2 + 7 = 9 == target ✓
Return [0, 1]
```

### Dry Run: Example 2

```
nums = [3, 2, 4], target = 6

i=0, j=1: 3 + 2 = 5 ≠ 6
i=0, j=2: 3 + 4 = 7 ≠ 6
i=1, j=2: 2 + 4 = 6 == target ✓
Return [1, 2]
```

### Why This Is Slow

- With n up to 10,000, O(n²) means up to 100 million comparisons
- We're checking pairs redundantly without leveraging any data structure
- For each element, we linearly search for its complement

---

## 2. Improved Approach: Sort + Two Pointers

### What Changed?

Sort the array and use two pointers from both ends. If sum < target, move left pointer right. If sum > target, move right pointer left.

**Problem**: Sorting destroys original indices! We need to track them.

### Pseudocode

```
function twoSum(nums, target):
    indexed = [(nums[i], i) for i in range(len(nums))]
    indexed.sort by value
    
    left = 0
    right = len(nums) - 1
    
    while left < right:
        sum = indexed[left].value + indexed[right].value
        if sum == target:
            return [indexed[left].index, indexed[right].index]
        else if sum < target:
            left++
        else:
            right--
    
    return []
```

### JavaScript Implementation

```javascript
function twoSum(nums, target) {
    // Create array of [value, originalIndex]
    const indexed = nums.map((val, idx) => [val, idx]);
    
    // Sort by value
    indexed.sort((a, b) => a[0] - b[0]);
    
    let left = 0;
    let right = indexed.length - 1;
    
    while (left < right) {
        const sum = indexed[left][0] + indexed[right][0];
        
        if (sum === target) {
            return [indexed[left][1], indexed[right][1]];
        } else if (sum < target) {
            left++;
        } else {
            right--;
        }
    }
    
    return [];
}
```

### Complexity

- **Time**: O(n log n) — sorting dominates
- **Space**: O(n) — storing indexed pairs

### Dry Run: Example 2

```
nums = [3, 2, 4], target = 6

Step 1: Create indexed array
  indexed = [[3,0], [2,1], [4,2]]

Step 2: Sort by value
  indexed = [[2,1], [3,0], [4,2]]

Step 3: Two pointers
  left=0, right=2: 2 + 4 = 6 == target ✓
  Return [indexed[0][1], indexed[2][1]] = [1, 2]
```

### Trade-offs

- ✓ Better time complexity O(n log n) vs O(n²)
- ✗ Requires O(n) extra space for index tracking
- ✗ Sorting adds overhead
- ✗ More complex than hash map approach

---

## 3. Optimal Approach: Hash Map (One Pass)

### Intuition

For each element nums[i], we need to find if (target - nums[i]) exists elsewhere in the array. A hash map gives O(1) lookup!

**Key Insight**: As we iterate, we've already seen some elements. Store them in a map: `value → index`. For current element, check if its **complement** (target - current) exists in the map.

### Why One Pass Works

We only need to find ONE pair. When we reach the second element of the pair, the first element is already in the map. So we'll find it.

### Pseudocode

```
function twoSum(nums, target):
    map = {}  // value → index
    
    for i from 0 to nums.length - 1:
        complement = target - nums[i]
        
        if complement exists in map:
            return [map[complement], i]
        
        map[nums[i]] = i
    
    return []
```

### JavaScript Implementation

```javascript
function twoSum(nums, target) {
    const map = new Map();  // value → index
    
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        
        map.set(nums[i], i);
    }
    
    return [];
}
```

### Correctness Proof

**Claim**: If a solution [i, j] exists with i < j, we will find it.

**Proof**:
1. When we process index j, we look for complement = target - nums[j] = nums[i]
2. Since i < j, we've already processed index i
3. So map contains nums[i] → i
4. We find it and return [i, j] ∎

### Dry Run: Example 1

```
nums = [2, 7, 11, 15], target = 9

| i | nums[i] | complement | map (before) | Found? | Action |
|---|---------|------------|--------------|--------|--------|
| 0 | 2       | 9-2=7      | {}           | No     | map[2]=0 |
| 1 | 7       | 9-7=2      | {2:0}        | Yes!   | Return [0,1] |

Result: [0, 1]
```

### Dry Run: Example 2

```
nums = [3, 2, 4], target = 6

| i | nums[i] | complement | map (before) | Found? | Action |
|---|---------|------------|--------------|--------|--------|
| 0 | 3       | 6-3=3      | {}           | No     | map[3]=0 |
| 1 | 2       | 6-2=4      | {3:0}        | No     | map[2]=1 |
| 2 | 4       | 6-4=2      | {3:0,2:1}    | Yes!   | Return [1,2] |

Result: [1, 2]
```

### Complexity

- **Time**: O(n) — single pass, O(1) hash operations
- **Space**: O(n) — hash map stores up to n entries

### Practical Performance

- Fastest possible for this problem (must see each element at least once)
- Hash map provides average O(1) lookups
- Works with negative numbers (no issue with hash maps)
- Handles duplicates correctly (we check before inserting)

---

## Interview-Ready Explanation (60-90 seconds)

> "For Two Sum, I use a hash map for O(n) time. The key insight is that for each element, I need to find if its complement — target minus current value — exists in the array.
>
> I iterate through the array once. For each element, I calculate its complement and check if it's already in my hash map. If yes, I found my pair and return both indices. If not, I add the current value and its index to the map.
>
> This works because when I reach the second element of the valid pair, the first element is already stored in the map from an earlier iteration.
>
> Time complexity is O(n) for a single pass with O(1) hash lookups. Space is O(n) for the hash map. This is optimal since we must examine each element at least once."

---

## Visual Diagram

### Hash Map Building Process

```
nums = [2, 7, 11, 15], target = 9

Step 0: i=0, nums[0]=2
  ┌───────────────────────┐
  │ Looking for: 9-2 = 7  │
  │ Map: {}               │  → Not found
  │ Add: 2 → 0            │
  └───────────────────────┘
  Map: {2: 0}

Step 1: i=1, nums[1]=7
  ┌───────────────────────┐
  │ Looking for: 9-7 = 2  │
  │ Map: {2: 0}           │  → FOUND at index 0!
  └───────────────────────┘
  Return [0, 1]
```

### Comparison of Approaches

```
Input size: n = 10,000

Brute Force O(n²):    ~100,000,000 operations ❌
Sort + Pointers O(n log n): ~130,000 operations ⚠️
Hash Map O(n):        ~10,000 operations ✓
```

---

## Comparison of Approaches

| Approach | Time | Space | Notes |
|----------|------|-------|-------|
| Brute Force | O(n²) | O(1) | ❌ Too slow |
| Sort + Two Pointers | O(n log n) | O(n) | ⚠️ Sorting overhead |
| **Hash Map** | **O(n)** | **O(n)** | **✓ Optimal** |

---

## Key Takeaways

1. **Hash map for complement lookup**: O(1) vs O(n) linear search
2. **One-pass solution**: Check + insert in same loop
3. **Store value → index**: Map values to their positions
4. **Check before insert**: Ensures we don't use same index twice
5. **Works with negatives**: Hash maps handle any integer keys
6. **Handles duplicates**: First occurrence is stored, second can find it
7. **Classic interview pattern**: "Find pair with property X" → hash map
8. **Trade space for time**: O(n) space enables O(n) time
9. **Complement pattern**: target - current = what we need
10. **Guaranteed solution**: No edge case handling for "not found"
