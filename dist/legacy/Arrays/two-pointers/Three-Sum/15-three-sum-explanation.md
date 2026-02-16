# 15. 3Sum - Complete Explanation

## High-Level Interpretation

Given an integer array, find **all unique triplets** that sum to zero. Unlike Two Sum, this problem requires finding **multiple solutions** while avoiding **duplicate triplets**.

**Key Points:**
- Return **values**, not indices
- All three indices must be different (i ≠ j ≠ k)
- No duplicate triplets in output (e.g., can't have [-1,0,1] twice)
- Triplet order doesn't matter: [-1,0,1] = [0,1,-1]

**Hidden Traps:**
- **Duplicates in input**: Array may contain duplicate values
- **Duplicate triplets**: Must avoid adding same triplet multiple times
- **Negative numbers**: Sum to 0 requires both positive and negative values (or all zeros)
- **Output order**: Any order is acceptable

---

## 1. Brute-Force Approach: Three Nested Loops + Set

### Idea

Check every combination of three elements. If they sum to zero, add to result. Use a set to avoid duplicates by sorting each triplet.

### Pseudocode

```
function threeSum(nums):
    n = nums.length
    result = Set()
    
    for i from 0 to n-3:
        for j from i+1 to n-2:
            for k from j+1 to n-1:
                if nums[i] + nums[j] + nums[k] == 0:
                    triplet = sort([nums[i], nums[j], nums[k]])
                    result.add(triplet)
    
    return result.toArray()
```

### JavaScript Implementation

```javascript
function threeSum(nums) {
    const n = nums.length;
    const set = new Set();
    
    for (let i = 0; i < n - 2; i++) {
        for (let j = i + 1; j < n - 1; j++) {
            for (let k = j + 1; k < n; k++) {
                if (nums[i] + nums[j] + nums[k] === 0) {
                    const triplet = [nums[i], nums[j], nums[k]].sort((a, b) => a - b);
                    set.add(triplet.join(','));
                }
            }
        }
    }
    
    return Array.from(set).map(s => s.split(',').map(Number));
}
```

### Complexity Analysis

- **Time**: O(n³) — three nested loops
- **Space**: O(n) for the set of triplets

### Dry Run: Example 1

```
nums = [-1, 0, 1, 2, -1, -4]

All triplet combinations checked:
i=0,j=1,k=2: -1+0+1 = 0 ✓ → add [-1,0,1]
i=0,j=1,k=3: -1+0+2 = 1
i=0,j=1,k=4: -1+0+(-1) = -2
i=0,j=1,k=5: -1+0+(-4) = -5
i=0,j=2,k=3: -1+1+2 = 2
i=0,j=2,k=4: -1+1+(-1) = -1
i=0,j=2,k=5: -1+1+(-4) = -4
i=0,j=3,k=4: -1+2+(-1) = 0 ✓ → add [-1,-1,2]
i=0,j=3,k=5: -1+2+(-4) = -3
i=0,j=4,k=5: -1+(-1)+(-4) = -6
... (continue for all combinations)

Result: [[-1,0,1], [-1,-1,2]]
```

### Why This Is Slow

- O(n³) with n up to 3000 means up to 27 billion operations
- Set operations add overhead for duplicate detection
- Doesn't exploit any structure in the problem

---

## 2. Improved Approach: Hash Set for Third Element

### What Changed?

Fix two elements (i, j), then use a hash set to find if -(nums[i] + nums[j]) exists. Reduces from O(n³) to O(n²).

### Pseudocode

```
function threeSum(nums):
    n = nums.length
    result = Set()
    
    for i from 0 to n-2:
        seen = new Set()
        for j from i+1 to n-1:
            complement = -(nums[i] + nums[j])
            
            if complement in seen:
                triplet = sort([nums[i], nums[j], complement])
                result.add(triplet)
            
            seen.add(nums[j])
    
    return result.toArray()
```

### JavaScript Implementation

```javascript
function threeSum(nums) {
    const n = nums.length;
    const result = new Set();
    
    for (let i = 0; i < n - 1; i++) {
        const seen = new Set();
        
        for (let j = i + 1; j < n; j++) {
            const complement = -(nums[i] + nums[j]);
            
            if (seen.has(complement)) {
                const triplet = [nums[i], nums[j], complement].sort((a, b) => a - b);
                result.add(triplet.join(','));
            }
            
            seen.add(nums[j]);
        }
    }
    
    return Array.from(result).map(s => s.split(',').map(Number));
}
```

### Complexity

- **Time**: O(n²) — two nested loops with O(1) hash lookup
- **Space**: O(n) for seen set + O(n) for result set

### Dry Run: Example 1

```
nums = [-1, 0, 1, 2, -1, -4]

i=0 (nums[i]=-1):
  j=1: complement = -(-1+0) = 1, seen={}, not found, add 0
  j=2: complement = -(-1+1) = 0, seen={0}, FOUND! triplet [-1,0,1]
  j=3: complement = -(-1+2) = -1, seen={0,1}, not found, add 2
  j=4: complement = -(-1+(-1)) = 2, seen={0,1,2}, FOUND! triplet [-1,-1,2]
  j=5: complement = -(-1+(-4)) = 5, not found

i=1 (nums[i]=0):
  j=2: complement = -(0+1) = -1, seen={}, not found
  j=3: complement = -(0+2) = -2, not found
  j=4: complement = -(0+(-1)) = 1, seen={1,2}, FOUND! triplet [-1,0,1] (dup)
  ...

Result: [[-1,0,1], [-1,-1,2]]
```

### Trade-offs

- ✓ Better time: O(n²) vs O(n³)
- ✗ Still uses sets for duplicate detection
- ✗ Sorting triplets adds overhead
- ✗ Less elegant than two-pointer approach

---

## 3. Optimal Approach: Sort + Two Pointers

### Intuition

1. **Sort the array first**: This allows using two pointers and easy duplicate skipping
2. **Fix first element**, then use Two Sum II (two pointers) on the rest
3. **Skip duplicates** at each level to avoid duplicate triplets

### Why Sorting Helps

- Duplicate values become adjacent → easy to skip
- Two-pointer technique works on sorted arrays
- Target for inner loop: find two numbers that sum to -(first number)

### Pseudocode

```
function threeSum(nums):
    sort(nums)
    result = []
    n = nums.length
    
    for i from 0 to n-3:
        // Skip duplicate first elements
        if i > 0 AND nums[i] == nums[i-1]:
            continue
        
        // Early termination: if smallest is positive, no solution
        if nums[i] > 0:
            break
        
        // Two pointers for remaining elements
        left = i + 1
        right = n - 1
        target = -nums[i]
        
        while left < right:
            sum = nums[left] + nums[right]
            
            if sum == target:
                result.add([nums[i], nums[left], nums[right]])
                
                // Skip duplicates
                while left < right AND nums[left] == nums[left+1]:
                    left++
                while left < right AND nums[right] == nums[right-1]:
                    right--
                
                left++
                right--
            
            else if sum < target:
                left++
            else:
                right--
    
    return result
```

### JavaScript Implementation

```javascript
function threeSum(nums) {
    nums.sort((a, b) => a - b);
    const result = [];
    const n = nums.length;
    
    for (let i = 0; i < n - 2; i++) {
        // Skip duplicate first elements
        if (i > 0 && nums[i] === nums[i - 1]) continue;
        
        // Early termination: smallest positive means no more solutions
        if (nums[i] > 0) break;
        
        let left = i + 1;
        let right = n - 1;
        const target = -nums[i];
        
        while (left < right) {
            const sum = nums[left] + nums[right];
            
            if (sum === target) {
                result.push([nums[i], nums[left], nums[right]]);
                
                // Skip duplicates for left and right
                while (left < right && nums[left] === nums[left + 1]) left++;
                while (left < right && nums[right] === nums[right - 1]) right--;
                
                left++;
                right--;
            } else if (sum < target) {
                left++;
            } else {
                right--;
            }
        }
    }
    
    return result;
}
```

### Correctness Proof

**Claim**: The algorithm finds all unique triplets summing to zero.

**Proof**:
1. **Completeness**: For any valid triplet (a, b, c) with a ≤ b ≤ c:
   - When i points to a, two pointers explore all pairs (b, c)
   - Two pointers find all pairs summing to -a due to sorted order
   
2. **No duplicates**: 
   - Skip same value for i: `if nums[i] == nums[i-1]`
   - Skip same values for left/right after finding triplet
   
3. **Correctness of two pointers**: On sorted array, if sum < target, only moving left can increase sum; if sum > target, only moving right can decrease it ∎

### Dry Run: Example 1

```
nums = [-1, 0, 1, 2, -1, -4]
sorted = [-4, -1, -1, 0, 1, 2]

i=0, nums[i]=-4, target=4:
  left=1, right=5: -1+2=1 < 4 → left++
  left=2, right=5: -1+2=1 < 4 → left++
  left=3, right=5: 0+2=2 < 4 → left++
  left=4, right=5: 1+2=3 < 4 → left++
  left=5, right=5: exit while

i=1, nums[i]=-1, target=1:
  left=2, right=5: -1+2=1 == 1 ✓ add [-1,-1,2]
    skip dups: left→3, right→4
  left=3, right=4: 0+1=1 == 1 ✓ add [-1,0,1]
    skip dups: left→4, right→3
  left=4, right=3: exit while

i=2, nums[i]=-1: SKIP (duplicate of i=1)

i=3, nums[i]=0: target=0
  left=4, right=5: 1+2=3 > 0 → right--
  left=4, right=4: exit while

i=4, nums[i]=1 > 0: BREAK (early termination)

Result: [[-1,-1,2], [-1,0,1]]
```

### Complexity

- **Time**: O(n²) — O(n log n) sort + O(n) × O(n) two pointers
- **Space**: O(1) or O(n) depending on sort implementation

### Practical Performance

- Very efficient for real-world inputs
- Early termination when first element is positive
- Skip duplicates efficiently due to sorting
- No hash set overhead

---

## Interview-Ready Explanation (60-90 seconds)

> "For 3Sum, I sort the array first, then use a two-pointer technique. The key insight is that after sorting, I fix one element and reduce the problem to Two Sum II.
>
> I iterate through the array with index i as the first element. For each i, I set a target of negative nums[i] and use two pointers — left starting after i, right at the end — to find pairs summing to that target.
>
> If the sum equals target, I add the triplet. If less, I move left right to increase the sum. If more, I move right left to decrease it.
>
> To avoid duplicates, I skip repeated values at each level: if nums[i] equals the previous value, I continue. After finding a triplet, I skip duplicate left and right values.
>
> Time complexity is O(n²) — the sort is O(n log n), and for each of n elements, the two-pointer scan is O(n). Space is O(1) excluding the output."

---

## Visual Diagram

### Two-Pointer Search

```
sorted = [-4, -1, -1, 0, 1, 2]
          ↑
          i=1, target = -(-1) = 1
          
          [-4, -1, -1, 0, 1, 2]
                    L        R
                    ↓        ↓
          sum = -1 + 2 = 1 == target ✓
          Found: [-1, -1, 2]
          
          Skip duplicates, move pointers:
          [-4, -1, -1, 0, 1, 2]
                       L  R
                       ↓  ↓
          sum = 0 + 1 = 1 == target ✓
          Found: [-1, 0, 1]
```

### Duplicate Skipping Logic

```
nums = [0, 0, 0, 0]
sorted = [0, 0, 0, 0]

i=0: target=0
  left=1, right=3: 0+0=0 ✓ add [0,0,0]
  Skip dup left: 1→2→3
  Skip dup right: 3→2→1
  left >= right: exit

i=1: nums[1]==nums[0], SKIP
i=2: nums[2]==nums[1], SKIP

Result: [[0,0,0]] (only one triplet, no duplicates!)
```

---

## Comparison of Approaches

| Approach | Time | Space | Notes |
|----------|------|-------|-------|
| Three Loops + Set | O(n³) | O(n) | ❌ Too slow |
| Hash Set | O(n²) | O(n) | ⚠️ Works but complex |
| **Sort + Two Pointers** | **O(n²)** | **O(1)** | **✓ Optimal** |

---

## Key Takeaways

1. **Sort first**: Enables two pointers and duplicate skipping
2. **Reduce to Two Sum II**: Fix one element, find pair for remainder
3. **Skip duplicates at each level**: When i changes, skip same values
4. **Two-pointer invariant**: Move left if sum too small, right if too big
5. **Early termination**: If first element > 0, no solution possible
6. **Skip after finding**: Move both pointers and skip duplicates
7. **Return values, not indices**: Sorting doesn't lose information
8. **Handle all zeros**: [0,0,0] is valid if array has 3+ zeros
9. **Negatives required**: Need both positive and negative (or all zeros)
10. **Template for kSum**: Same pattern extends to 4Sum, 5Sum, etc.
