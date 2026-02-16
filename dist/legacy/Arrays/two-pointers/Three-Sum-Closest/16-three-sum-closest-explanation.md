# 16. 3Sum Closest - Complete Explanation

## High-Level Interpretation

Given an integer array and a target, find three numbers whose sum is **closest** to the target. Return the **sum** (not indices). Unlike 3Sum which finds exact matches to 0, this finds the closest approximation to any target.

**Key Points:**
- Return the **sum itself**, not indices or triplet
- Exactly one solution exists (no ties to handle)
- "Closest" means minimum absolute difference |sum - target|
- Can be exact match (difference = 0) or approximation

**Hidden Traps:**
- Negative numbers affect how we track "closeness"
- Must track actual sum, not just difference
- Need to update best sum whenever we find closer one
- Early termination possible when exact match found

---

## 1. Brute-Force Approach: Three Nested Loops

### Idea

Check every triplet. For each, compute sum and track the one closest to target.

### Pseudocode

```
function threeSumClosest(nums, target):
    n = nums.length
    closestSum = nums[0] + nums[1] + nums[2]
    
    for i from 0 to n-3:
        for j from i+1 to n-2:
            for k from j+1 to n-1:
                sum = nums[i] + nums[j] + nums[k]
                if |sum - target| < |closestSum - target|:
                    closestSum = sum
    
    return closestSum
```

### JavaScript Implementation

```javascript
function threeSumClosest(nums, target) {
    const n = nums.length;
    let closestSum = nums[0] + nums[1] + nums[2];
    
    for (let i = 0; i < n - 2; i++) {
        for (let j = i + 1; j < n - 1; j++) {
            for (let k = j + 1; k < n; k++) {
                const sum = nums[i] + nums[j] + nums[k];
                if (Math.abs(sum - target) < Math.abs(closestSum - target)) {
                    closestSum = sum;
                }
            }
        }
    }
    
    return closestSum;
}
```

### Complexity Analysis

- **Time**: O(n³) — three nested loops
- **Space**: O(1) — only tracking closestSum

### Dry Run: Example 1

```
nums = [-1, 2, 1, -4], target = 1
Initial closestSum = -1 + 2 + 1 = 2

| i | j | k | sum | |sum-1| | |closest-1| | Update? |
|---|---|---|-----|--------|-------------|---------|
| 0 | 1 | 2 | 2   | 1      | 1           | No      |
| 0 | 1 | 3 | -3  | 4      | 1           | No      |
| 0 | 2 | 3 | -4  | 5      | 1           | No      |
| 1 | 2 | 3 | -1  | 2      | 1           | No      |

closestSum = 2 (difference = 1)
Result: 2
```

### Why This Is Slow

- O(n³) with n = 500 means 125 million operations
- Doesn't exploit any structure or ordering
- Can't prune or terminate early

---

## 2. Improved Approach: Sort + Binary Search

### What Changed?

Sort the array. Fix two elements (i, j), then binary search for the third value closest to (target - nums[i] - nums[j]).

### Pseudocode

```
function threeSumClosest(nums, target):
    sort(nums)
    n = nums.length
    closestSum = nums[0] + nums[1] + nums[2]
    
    for i from 0 to n-3:
        for j from i+1 to n-2:
            need = target - nums[i] - nums[j]
            // Binary search for value closest to 'need' in nums[j+1...n-1]
            k = binarySearchClosest(nums, j+1, n-1, need)
            sum = nums[i] + nums[j] + nums[k]
            if |sum - target| < |closestSum - target|:
                closestSum = sum
    
    return closestSum
```

### JavaScript Implementation

```javascript
function threeSumClosest(nums, target) {
    nums.sort((a, b) => a - b);
    const n = nums.length;
    let closestSum = nums[0] + nums[1] + nums[2];
    
    for (let i = 0; i < n - 2; i++) {
        for (let j = i + 1; j < n - 1; j++) {
            const need = target - nums[i] - nums[j];
            
            // Binary search for closest value to 'need'
            let lo = j + 1, hi = n - 1;
            while (lo < hi) {
                const mid = Math.floor((lo + hi) / 2);
                if (nums[mid] < need) lo = mid + 1;
                else hi = mid;
            }
            
            // Check both lo and lo-1 (if valid)
            for (let k of [lo, lo - 1]) {
                if (k > j && k < n) {
                    const sum = nums[i] + nums[j] + nums[k];
                    if (Math.abs(sum - target) < Math.abs(closestSum - target)) {
                        closestSum = sum;
                    }
                }
            }
        }
    }
    
    return closestSum;
}
```

### Complexity

- **Time**: O(n² log n) — two loops + binary search
- **Space**: O(1) or O(n) for sort

### Trade-offs

- ✓ Slightly better than O(n³)
- ✗ Binary search adds complexity
- ✗ Still not as clean as two-pointer approach

---

## 3. Optimal Approach: Sort + Two Pointers

### Intuition

Same as 3Sum! Sort the array, fix one element, use two pointers for the remaining two. Track the closest sum as we go.

**Key insight**: After sorting, for fixed i with pointers L and R:
- If sum < target → move L right (increase sum)
- If sum > target → move R left (decrease sum)
- If sum == target → return immediately (perfect match!)

### Pseudocode

```
function threeSumClosest(nums, target):
    sort(nums)
    n = nums.length
    closestSum = nums[0] + nums[1] + nums[2]
    
    for i from 0 to n-3:
        left = i + 1
        right = n - 1
        
        while left < right:
            sum = nums[i] + nums[left] + nums[right]
            
            // Update closest if better
            if |sum - target| < |closestSum - target|:
                closestSum = sum
            
            // Perfect match - can't do better
            if sum == target:
                return sum
            
            // Move pointers
            if sum < target:
                left++
            else:
                right--
    
    return closestSum
```

### JavaScript Implementation

```javascript
function threeSumClosest(nums, target) {
    nums.sort((a, b) => a - b);
    const n = nums.length;
    let closestSum = nums[0] + nums[1] + nums[2];
    
    for (let i = 0; i < n - 2; i++) {
        let left = i + 1;
        let right = n - 1;
        
        while (left < right) {
            const sum = nums[i] + nums[left] + nums[right];
            
            // Update closest if this sum is closer to target
            if (Math.abs(sum - target) < Math.abs(closestSum - target)) {
                closestSum = sum;
            }
            
            // Early termination: exact match
            if (sum === target) {
                return sum;
            }
            
            // Move pointers
            if (sum < target) {
                left++;
            } else {
                right--;
            }
        }
    }
    
    return closestSum;
}
```

### Correctness Proof

**Claim**: Two pointers explore all necessary pairs for finding closest sum.

**Proof**:
1. For fixed i, sorted subarray allows binary-search-like narrowing
2. If sum < target, moving L right is the only way to increase sum (since array is sorted)
3. If sum > target, moving R left is the only way to decrease sum
4. We check every sum before moving, so we never miss a closer value
5. When L crosses R, all pairs have been considered or pruned ∎

### Dry Run: Example 1

```
nums = [-1, 2, 1, -4], target = 1
sorted = [-4, -1, 1, 2]

Initial closestSum = -4 + (-1) + 1 = -4

i=0, nums[i]=-4, L=1, R=3:
  sum = -4 + (-1) + 2 = -3
  |−3−1| = 4 < |−4−1| = 5 → closestSum = -3
  sum < target → L++
  
  L=2, R=3:
  sum = -4 + 1 + 2 = -1
  |−1−1| = 2 < |−3−1| = 4 → closestSum = -1
  sum < target → L++
  
  L=3, R=3: exit while

i=1, nums[i]=-1, L=2, R=3:
  sum = -1 + 1 + 2 = 2
  |2−1| = 1 < |−1−1| = 2 → closestSum = 2
  sum > target → R--
  
  L=2, R=2: exit while

i=2: only one element left, skip

Result: 2 ✓
```

### Dry Run: Example 2

```
nums = [0, 0, 0], target = 1
sorted = [0, 0, 0]

Initial closestSum = 0 + 0 + 0 = 0

i=0, L=1, R=2:
  sum = 0 + 0 + 0 = 0
  |0−1| = 1, closestSum = 0
  sum < target → L++
  
  L=2, R=2: exit while

Result: 0 ✓
```

### Complexity

- **Time**: O(n²) — O(n log n) sort + O(n) × O(n) two pointers
- **Space**: O(1) or O(n) depending on sort implementation

### Practical Performance

- Very efficient for the given constraints (n ≤ 500)
- Early termination when exact match found
- No hash set or extra data structures needed
- Same pattern as 3Sum, easy to remember

---

## Interview-Ready Explanation (60-90 seconds)

> "For 3Sum Closest, I use the same sort plus two-pointer technique as regular 3Sum. First, I sort the array. Then I fix one element with index i and use two pointers — left starting after i, right at the end.
>
> For each configuration, I calculate the sum and check if it's closer to the target than my current best. If the sum equals the target, I return immediately since we can't do better.
>
> If the sum is less than target, I move left right to increase the sum. If greater, I move right left to decrease. This works because the array is sorted.
>
> The key difference from regular 3Sum is we track the closest sum seen so far, updating whenever we find something closer.
>
> Time complexity is O(n²) — the sort is O(n log n), and for each of n elements, the two-pointer scan is O(n). Space is O(1) excluding sort overhead."

---

## Visual Diagram

### Two-Pointer Search for Closest

```
sorted = [-4, -1, 1, 2], target = 1

i=1, nums[i]=-1, target=1
     ┌─────────────────────┐
     │   -4  -1   1   2    │
     │        ↑   L   R    │
     │        i            │
     └─────────────────────┘
     sum = -1 + 1 + 2 = 2
     |2 - 1| = 1  ← CLOSEST!
     
     sum > target → R--
     
     ┌─────────────────────┐
     │   -4  -1   1   2    │
     │        ↑   L        │
     │        i   R        │
     └─────────────────────┘
     L == R, exit while
```

### Difference from 3Sum

```
3Sum:          Find sum == 0 exactly
3Sum Closest:  Find sum closest to target

Same technique, different goal:
- 3Sum: collect all triplets where sum == 0
- Closest: track minimum |sum - target|
```

---

## Comparison of Approaches

| Approach | Time | Space | Notes |
|----------|------|-------|-------|
| Three Loops | O(n³) | O(1) | ❌ Too slow |
| Sort + Binary Search | O(n² log n) | O(1) | ⚠️ Slight improvement |
| **Sort + Two Pointers** | **O(n²)** | **O(1)** | **✓ Optimal** |

---

## Key Takeaways

1. **Same pattern as 3Sum**: Sort + fix one + two pointers
2. **Track closest, not exact**: Update whenever |sum - target| decreases
3. **Early termination**: Return immediately if sum == target
4. **Two-pointer logic**: sum < target → L++, sum > target → R--
5. **Return sum, not indices**: Sorting is safe
6. **No duplicate handling needed**: We want closest, not all unique
7. **Guaranteed solution**: Always at least one triplet exists
8. **Works with negatives**: Absolute difference handles all cases
9. **Initialize carefully**: Start with first three elements
10. **Template extends**: Same for 4Sum Closest, kSum variations
