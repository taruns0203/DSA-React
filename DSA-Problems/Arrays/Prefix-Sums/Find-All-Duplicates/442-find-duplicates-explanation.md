# 442. Find All Duplicates in an Array — Complete Explanation

---

## High-Level Interpretation

You are given an array `nums` of length `n` where every value is in `[1, n]` and each integer appears **at most twice**. Return all integers that appear **exactly twice**. The critical constraint: you must do it in **O(n) time** with **O(1) auxiliary space** (the output array doesn't count).

**Hidden traps:**
- The range `[1, n]` maps perfectly to array indices `[0, n-1]` — this is the key to the O(1) space trick.
- "At most twice" means some values appear once, some twice — you need to distinguish them.
- The problem specifically excludes the output from the space budget, so returning a result array is fine.
- Watch the off-by-one: value `v` maps to index `v - 1`.

---

## 1. Brute-Force Approach: Check Every Pair — O(N²)

### Idea

For each element, scan the rest of the array to see if it appears again. If it does (and we haven't already recorded it), add it to the result.

### Pseudocode

```
function findDuplicates(nums):
    result = []
    n = nums.length
    for i = 0 to n-1:
        for j = i+1 to n-1:
            if nums[i] == nums[j] AND nums[i] not in result:
                result.push(nums[i])
    return result
```

### JavaScript Implementation

```javascript
var findDuplicates = function(nums) {
    const result = [];
    const n = nums.length;
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            if (nums[i] === nums[j] && !result.includes(nums[i])) {
                result.push(nums[i]);
            }
        }
    }
    return result;
};
```

### Complexity

| | Value | Reasoning |
|---|---|---|
| **Time** | O(N²) | Nested loops checking all pairs |
| **Space** | O(1) aux | Only the output array (excluded from budget) |

### Dry Run — `nums = [4,3,2,7,8,2,3,1]`

| i | j | nums[i]==nums[j]? | result |
|---|---|-------------------|--------|
| 0 (4) | 1–7 | No match for 4 | [] |
| 1 (3) | 6 | 3==3 ✅ | [3] |
| 2 (2) | 5 | 2==2 ✅ | [3, 2] |
| 3 (7) | 4–7 | No match for 7 | [3, 2] |
| 4 (8) | 5–7 | No match for 8 | [3, 2] |
| 5 (2) | 6–7 | Already found 2 | [3, 2] |
| 6 (3) | 7 | Already found 3 | [3, 2] |

**Result: [3, 2]** ✅ (order may vary)

### Why It's Too Slow

With `n = 10⁵`, this does ~5 × 10⁹ operations — far too slow. Also, `result.includes()` adds another O(N) per check.

---

## 2. Improved Approach: Hash Set — O(N) time, O(N) space

### Key Insight

Use a **Set** to track which values we've seen. If we encounter a value already in the set, it's a duplicate.

### Pseudocode

```
function findDuplicates(nums):
    seen = new Set()
    result = []
    for each num in nums:
        if num in seen:
            result.push(num)
        else:
            seen.add(num)
    return result
```

### JavaScript Implementation

```javascript
var findDuplicates = function(nums) {
    const seen = new Set();
    const result = [];
    for (const num of nums) {
        if (seen.has(num)) {
            result.push(num);
        } else {
            seen.add(num);
        }
    }
    return result;
};
```

### Complexity

| | Value | Reasoning |
|---|---|---|
| **Time** | O(N) | Single pass, O(1) set operations |
| **Space** | O(N) | The Set stores up to N values |

### Dry Run — `nums = [4,3,2,7,8,2,3,1]`

| Step | num | seen (before) | In seen? | Action | result |
|------|-----|---------------|----------|--------|--------|
| 1    | 4   | {}            | No       | add 4  | [] |
| 2    | 3   | {4}           | No       | add 3  | [] |
| 3    | 2   | {4,3}         | No       | add 2  | [] |
| 4    | 7   | {4,3,2}       | No       | add 7  | [] |
| 5    | 8   | {4,3,2,7}     | No       | add 8  | [] |
| 6    | 2   | {4,3,2,7,8}   | ✅ Yes   | push 2 | [2] |
| 7    | 3   | {4,3,2,7,8}   | ✅ Yes   | push 3 | [2, 3] |
| 8    | 1   | {4,3,2,7,8}   | No       | add 1  | [2, 3] |

**Result: [2, 3]** ✅

### Trade-Offs
- ✅ Fast — O(N) time.
- ❌ Uses O(N) extra space — doesn't meet the O(1) space constraint.

---

## 3. Improved Approach: Sorting — O(N log N) time, O(1) space

### Key Insight

Sort the array, then scan for adjacent duplicates.

### Pseudocode

```
function findDuplicates(nums):
    sort(nums)
    result = []
    for i = 1 to n-1:
        if nums[i] == nums[i-1]:
            result.push(nums[i])
    return result
```

### JavaScript Implementation

```javascript
var findDuplicates = function(nums) {
    nums.sort((a, b) => a - b);
    const result = [];
    for (let i = 1; i < nums.length; i++) {
        if (nums[i] === nums[i - 1]) {
            result.push(nums[i]);
        }
    }
    return result;
};
```

### Complexity

| | Value | Reasoning |
|---|---|---|
| **Time** | O(N log N) | Sorting dominates |
| **Space** | O(1) aux | In-place sort (modifies input) |

### Dry Run — `nums = [4,3,2,7,8,2,3,1]`

After sort: `[1, 2, 2, 3, 3, 4, 7, 8]`

| i | nums[i] | nums[i-1] | Equal? | result |
|---|---------|-----------|--------|--------|
| 1 | 2       | 1         | No     | [] |
| 2 | 2       | 2         | ✅ Yes | [2] |
| 3 | 3       | 2         | No     | [2] |
| 4 | 3       | 3         | ✅ Yes | [2, 3] |
| 5 | 4       | 3         | No     | [2, 3] |
| 6 | 7       | 4         | No     | [2, 3] |
| 7 | 8       | 7         | No     | [2, 3] |

**Result: [2, 3]** ✅

### Trade-Offs
- ✅ O(1) auxiliary space.
- ❌ O(N log N) time — not O(N).
- ❌ Modifies the input array.

---

## 4. Optimal Approach: Index-as-Hash (Negation Trick) — O(N), O(1) space

### Intuition

Since every value is in `[1, n]`, value `v` maps to index `v - 1`. We can use the **sign of the element at that index** as a visited flag:

1. For each value `v = |nums[i]|`, go to index `v - 1`.
2. If `nums[v-1]` is **already negative**, we've seen `v` before → it's a duplicate.
3. Otherwise, **negate** `nums[v-1]` to mark `v` as seen.

This uses the array itself as a hash map — no extra space!

### Pseudocode

```
function findDuplicates(nums):
    result = []
    for i = 0 to n-1:
        val = |nums[i]|           // take absolute value (may already be negated)
        idx = val - 1             // map value to index
        if nums[idx] < 0:         // already visited → duplicate!
            result.push(val)
        else:
            nums[idx] = -nums[idx]  // mark as visited by negating
    return result
```

### JavaScript Implementation

```javascript
var findDuplicates = function(nums) {
    const result = [];
    for (let i = 0; i < nums.length; i++) {
        const val = Math.abs(nums[i]);
        const idx = val - 1;
        if (nums[idx] < 0) {
            result.push(val);
        } else {
            nums[idx] = -nums[idx];
        }
    }
    return result;
};
```

### Correctness Proof

**Invariant:** After processing element `i`, for every value `v` we've seen so far, `nums[v-1]` is negative.

1. **First occurrence of value `v`:** We visit index `v-1`. Since `v` hasn't been seen before, `nums[v-1]` is positive. We negate it → marks `v` as seen.
2. **Second occurrence of value `v`:** We visit index `v-1` again. It's already negative (from step 1) → we know `v` is a duplicate, so we add it to the result.
3. **No false positives:** A value can only appear at most twice, so we never add the same duplicate more than once (the second time is the only time we find a negative).
4. **No index out of bounds:** Since `1 ≤ v ≤ n`, index `v-1` is always in `[0, n-1]`.

### Dry Run — `nums = [4,3,2,7,8,2,3,1]`

| i | nums[i] | val = \|nums[i]\| | idx = val−1 | nums[idx] | < 0? | Action | nums (after) | result |
|---|---------|-------------------|-------------|-----------|------|--------|-------------|--------|
| 0 | 4 | 4 | 3 | 7 | No | negate nums[3] | [4,3,2,**-7**,8,2,3,1] | [] |
| 1 | 3 | 3 | 2 | 2 | No | negate nums[2] | [4,3,**-2**,-7,8,2,3,1] | [] |
| 2 | -2 | 2 | 1 | 3 | No | negate nums[1] | [4,**-3**,-2,-7,8,2,3,1] | [] |
| 3 | -7 | 7 | 6 | 3 | No | negate nums[6] | [4,-3,-2,-7,8,2,**-3**,1] | [] |
| 4 | 8 | 8 | 7 | 1 | No | negate nums[7] | [4,-3,-2,-7,8,2,-3,**-1**] | [] |
| 5 | 2 | 2 | 1 | -3 | ✅ Yes | push 2 | [4,-3,-2,-7,8,2,-3,-1] | [2] |
| 6 | 3 | 3 | 2 | -2 | ✅ Yes | push 3 | [4,-3,-2,-7,8,2,-3,-1] | [2, 3] |
| 7 | -1 | 1 | 0 | 4 | No | negate nums[0] | [**-4**,-3,-2,-7,8,2,-3,-1] | [2, 3] |

**Result: [2, 3]** ✅

### Complexity

| | Value | Reasoning |
|---|---|---|
| **Time** | O(N) | Single pass through the array |
| **Space** | O(1) aux | Only uses the input array for marking (output excluded) |

### Practical Performance

- Extremely fast — single pass, no hash overhead.
- Cache-friendly — accesses are within the same array.
- Caveat: modifies the input array. If this is unacceptable, you can restore it with a second pass (negate all negative values back).

---

## Interview-Ready Summary (60–90 seconds)

> "The key insight is that every value is in the range `[1, n]`, so each value maps directly to a valid array index. I use the **sign of the element** at that index as a visited flag. For each element, I take its absolute value to get the original number, compute index `val - 1`, and check: if the value at that index is already negative, I've seen this number before — it's a duplicate. Otherwise, I negate the value at that index to mark it as seen.
>
> This gives me O(N) time with O(1) auxiliary space because I'm using the array itself as a hash map. The trick works because values are bounded by `n`, each appears at most twice, and the sign bit gives us one bit of extra storage per position."

---

## ASCII Diagram — The Negation Trick

```
  Values:  [4, 3, 2, 7, 8, 2, 3, 1]
  Indices:  0  1  2  3  4  5  6  7

  Value v maps to index v-1:
  v=4 → idx 3    v=3 → idx 2    v=2 → idx 1    ...

  Step by step (showing signs):

  Process 4: nums[3] = 7 → flip to -7        ✓ first visit
              [4, 3, 2, -7, 8, 2, 3, 1]

  Process 3: nums[2] = 2 → flip to -2        ✓ first visit
              [4, 3, -2, -7, 8, 2, 3, 1]

  Process 2: nums[1] = 3 → flip to -3        ✓ first visit
              [4, -3, -2, -7, 8, 2, 3, 1]

  ...

  Process 2: nums[1] = -3 → already negative! ★ DUPLICATE → push 2
  Process 3: nums[2] = -2 → already negative! ★ DUPLICATE → push 3

  Each index acts as a "bucket" for its value.
  Sign = visited flag.  Negative = seen before.
```

---

## Summary Table

| Approach | Time | Space | Meets Constraints? |
|----------|------|-------|--------------------|
| Brute Force (all pairs) | O(N²) | O(1) | ❌ Too slow |
| Hash Set | O(N) | O(N) | ❌ Extra space |
| Sorting | O(N log N) | O(1) | ❌ Too slow |
| **Negation Trick** | **O(N)** | **O(1)** | **✅ Both constraints met** |
