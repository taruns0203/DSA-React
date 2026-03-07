# 307. Range Sum Query – Mutable — Complete Explanation

---

## High-Level Interpretation

You need to build a data structure over an integer array that supports two operations efficiently: **point update** (change a single element) and **range sum query** (return the sum of elements from index `left` to `right`). The challenge is that up to 3×10⁴ calls can mix updates and queries, so any approach that is O(N) per operation can hit ~10⁹ total work.

**Hidden traps**:
- **Off-by-one**: Queries are inclusive on both ends (`left` to `right`).
- **Update replaces, not adds**: `update(i, val)` sets `nums[i] = val` (not `+= val`). For data structures like BIT that work with deltas, you must compute `delta = val − oldVal`.
- **Negative values** are allowed (−100 to 100), so no positivity shortcuts.

---

## 1. Brute-Force Approach: Raw Array

### Idea

Store the array directly. For `update`, change the element in O(1). For `sumRange`, loop from `left` to `right` and sum.

### Pseudocode

```
class NumArray:
    constructor(nums):
        this.nums = copy of nums
    
    update(index, val):
        this.nums[index] = val          // O(1)
    
    sumRange(left, right):
        sum = 0
        for i from left to right:
            sum += this.nums[i]
        return sum                      // O(N)
```

### Complexity

| Operation | Time | Space |
|---|---|---|
| Constructor | O(N) | O(N) |
| update | **O(1)** | - |
| sumRange | **O(N)** | - |
| Q operations total | **O(Q·N)** | O(N) |

With N, Q both ≤ 3×10⁴: worst case 9×10⁸ — **too slow**.

### Dry Run

```
nums = [1, 3, 5]
```

| Operation | Action | Result | nums after |
|---|---|---|---|
| NumArray([1,3,5]) | store array | - | [1, 3, 5] |
| sumRange(0, 2) | 1+3+5 | **9** | [1, 3, 5] |
| update(1, 2) | nums[1] = 2 | - | [1, 2, 5] |
| sumRange(0, 2) | 1+2+5 | **8** | [1, 2, 5] |

### Why It's Slow

Each `sumRange` scans up to N elements. With 3×10⁴ queries and N = 3×10⁴, that's ~10⁹ operations.

---

## 2. Improved Approach: Prefix Sum Array

### What Changed

Precompute a prefix sum array so that `sumRange` becomes O(1): `prefix[right+1] − prefix[left]`. But now `update` is expensive — when you change one element, every prefix from that index onward must be updated.

### Pseudocode

```
class NumArray:
    constructor(nums):
        this.nums = copy of nums
        this.prefix = array of size n+1
        this.prefix[0] = 0
        for i from 0 to n-1:
            this.prefix[i+1] = this.prefix[i] + nums[i]
    
    update(index, val):
        delta = val - this.nums[index]
        this.nums[index] = val
        for i from index+1 to n:         // O(N)
            this.prefix[i] += delta
    
    sumRange(left, right):
        return this.prefix[right+1] - this.prefix[left]  // O(1)
```

### Complexity

| Operation | Time |
|---|---|
| Constructor | O(N) |
| update | **O(N)** |
| sumRange | **O(1)** |

### Dry Run

```
nums = [1, 3, 5]  →  prefix = [0, 1, 4, 9]
```

| Operation | Action | Result |
|---|---|---|
| sumRange(0,2) | prefix[3] − prefix[0] = 9 − 0 | **9** |
| update(1, 2) | delta = 2−3 = −1; prefix[2]−=1→3, prefix[3]−=1→8 | prefix = [0,1,3,8] |
| sumRange(0,2) | prefix[3] − prefix[0] = 8 − 0 | **8** |

### Trade-off
Flips the bottleneck: queries are O(1) but updates are O(N). Still O(Q·N) worst case.

---

## 3. Better Approach: Binary Indexed Tree (Fenwick Tree)

### What Changed

A BIT gives **O(log N) for both operations** using a clever partial-sum tree encoded in an array. Each index `i` stores the sum of a specific range of elements, determined by the lowest set bit of `i`.

### Pseudocode

```
class NumArray:
    constructor(nums):
        this.n = nums.length
        this.nums = copy of nums
        this.bit = array of size n+1, all zeros
        for i from 0 to n-1:
            bitUpdate(i+1, nums[i])     // 1-indexed
    
    bitUpdate(i, delta):
        while i <= n:
            bit[i] += delta
            i += i & (-i)              // move to parent
    
    bitQuery(i):                        // prefix sum [1..i]
        sum = 0
        while i > 0:
            sum += bit[i]
            i -= i & (-i)              // move to predecessor
        return sum
    
    update(index, val):
        delta = val - nums[index]
        nums[index] = val
        bitUpdate(index + 1, delta)     // O(log N)
    
    sumRange(left, right):
        return bitQuery(right + 1) - bitQuery(left)  // O(log N)
```

### JavaScript

```javascript
var NumArray = function(nums) {
    this.n = nums.length;
    this.nums = [...nums];
    this.bit = new Array(this.n + 1).fill(0);
    for (let i = 0; i < this.n; i++) {
        this._update(i + 1, nums[i]);
    }
};

NumArray.prototype._update = function(i, delta) {
    for (; i <= this.n; i += i & (-i))
        this.bit[i] += delta;
};

NumArray.prototype._query = function(i) {
    let s = 0;
    for (; i > 0; i -= i & (-i))
        s += this.bit[i];
    return s;
};

NumArray.prototype.update = function(index, val) {
    const delta = val - this.nums[index];
    this.nums[index] = val;
    this._update(index + 1, delta);
};

NumArray.prototype.sumRange = function(left, right) {
    return this._query(right + 1) - this._query(left);
};
```

### Complexity

| Operation | Time |
|---|---|
| Constructor | O(N log N) |
| update | **O(log N)** |
| sumRange | **O(log N)** |

### Dry Run

```
nums = [1, 3, 5]
BIT (1-indexed): after construction
  bit[1] = 1 (covers index 1)
  bit[2] = 4 (covers indices 1-2: 1+3)
  bit[3] = 5 (covers index 3)
```

| Operation | Action | Result |
|---|---|---|
| sumRange(0,2) | query(3) − query(0) = (bit[3]+bit[2]) − 0 = 5+4 = 9 | **9** |
| update(1, 2) | delta = 2−3 = −1; bit[2]−=1→3 | bit = [0,1,3,5] |
| sumRange(0,2) | query(3) − query(0) = 5+3 = 8 | **8** |

### Trade-off
Very fast and simple code. Uses only an array. However, it's harder to extend to lazy propagation for range-update problems.

---

## 4. Optimal Approach: Segment Tree

### Intuition

A **segment tree** is a complete binary tree where:
- Each **leaf** stores one element of the array.
- Each **internal node** stores the sum of its children's ranges.
- The root stores the sum of the entire array.

To query a range, we recursively visit only nodes whose ranges overlap the query — at most O(log N) nodes per level. To update, we change a leaf and propagate the change up — O(log N) nodes.

### Why it's the "textbook optimal"

Both BIT and Segment Tree give O(log N) per operation. However, the segment tree is more general — it can handle **range updates with lazy propagation**, min/max queries, and other associative operations. For this problem, BIT suffices, but the segment tree is the canonical teaching solution.

### Pseudocode

```
class NumArray:
    constructor(nums):
        n = nums.length
        tree = array of size 4*n       // safe over-allocation
        build(nums, tree, 1, 0, n-1)
    
    build(nums, tree, node, start, end):
        if start == end:
            tree[node] = nums[start]
            return
        mid = (start + end) / 2
        build(nums, tree, 2*node, start, mid)
        build(nums, tree, 2*node+1, mid+1, end)
        tree[node] = tree[2*node] + tree[2*node+1]
    
    update(index, val):
        _update(tree, 1, 0, n-1, index, val)
    
    _update(tree, node, start, end, idx, val):
        if start == end:
            tree[node] = val
            return
        mid = (start + end) / 2
        if idx <= mid:
            _update(tree, 2*node, start, mid, idx, val)
        else:
            _update(tree, 2*node+1, mid+1, end, idx, val)
        tree[node] = tree[2*node] + tree[2*node+1]
    
    sumRange(left, right):
        return _query(tree, 1, 0, n-1, left, right)
    
    _query(tree, node, start, end, l, r):
        if r < start or end < l:
            return 0                    // no overlap
        if l <= start and end <= r:
            return tree[node]           // total overlap
        mid = (start + end) / 2
        return _query(tree, 2*node, start, mid, l, r) +
               _query(tree, 2*node+1, mid+1, end, l, r)
```

### JavaScript

```javascript
var NumArray = function(nums) {
    this.n = nums.length;
    this.tree = new Array(4 * this.n).fill(0);
    if (this.n > 0) this._build(nums, 1, 0, this.n - 1);
};

NumArray.prototype._build = function(nums, node, start, end) {
    if (start === end) {
        this.tree[node] = nums[start];
        return;
    }
    const mid = (start + end) >> 1;
    this._build(nums, 2 * node, start, mid);
    this._build(nums, 2 * node + 1, mid + 1, end);
    this.tree[node] = this.tree[2 * node] + this.tree[2 * node + 1];
};

NumArray.prototype.update = function(index, val) {
    this._update(1, 0, this.n - 1, index, val);
};

NumArray.prototype._update = function(node, start, end, idx, val) {
    if (start === end) {
        this.tree[node] = val;
        return;
    }
    const mid = (start + end) >> 1;
    if (idx <= mid)
        this._update(2 * node, start, mid, idx, val);
    else
        this._update(2 * node + 1, mid + 1, end, idx, val);
    this.tree[node] = this.tree[2 * node] + this.tree[2 * node + 1];
};

NumArray.prototype.sumRange = function(left, right) {
    return this._query(1, 0, this.n - 1, left, right);
};

NumArray.prototype._query = function(node, start, end, l, r) {
    if (r < start || end < l) return 0;           // no overlap
    if (l <= start && end <= r) return this.tree[node]; // total overlap
    const mid = (start + end) >> 1;
    return this._query(2 * node, start, mid, l, r) +
           this._query(2 * node + 1, mid + 1, end, l, r);
};
```

### Correctness Proof

**Invariant**: `tree[node]` = sum of `nums[start..end]` where `(start, end)` is the range assigned to `node`.

**Build** (induction on tree height):
- Base: leaf node → `tree[node] = nums[start]`. ✓
- Inductive: `tree[node] = tree[left_child] + tree[right_child]` = sum of left range + sum of right range = sum of full range. ✓

**Update**: Only the path from root to the target leaf is modified. Each node on the path is recomputed as the sum of its children, preserving the invariant. ∎

**Query**: Any range `[l, r]` is decomposed into at most O(log N) disjoint nodes that exactly cover `[l, r]`. Their sum equals `sum(nums[l..r])`. ∎

### Dry Run

```
nums = [1, 3, 5]      n = 3

Build segment tree (node: range → value):
  node 1: [0,2] → 9
  node 2: [0,1] → 4      node 3: [2,2] → 5
  node 4: [0,0] → 1      node 5: [1,1] → 3

tree[] = [_, 9, 4, 5, 1, 3, _, _]  (index 0 unused)
```

**sumRange(0, 2)**:

| Recursion | node | range | action |
|---|---|---|---|
| query(1, [0,2], 0, 2) | 1 | [0,2] | total overlap → return 9 |

Result: **9** ✅

**update(1, 2)** — set nums[1] = 2:

| Recursion | node | range | action |
|---|---|---|---|
| _update(1, [0,2], idx=1) | 1 | [0,2] | idx ≤ mid=1 → go left |
| _update(2, [0,1], idx=1) | 2 | [0,1] | idx > mid=0 → go right |
| _update(5, [1,1], idx=1) | 5 | [1,1] | leaf, tree[5] = 2 |
| backtrack | 2 | [0,1] | tree[2] = tree[4]+tree[5] = 1+2 = 3 |
| backtrack | 1 | [0,2] | tree[1] = tree[2]+tree[3] = 3+5 = 8 |

tree[] = [_, **8**, **3**, 5, 1, **2**, _, _]

**sumRange(0, 2)**:

| Recursion | node | range | action |
|---|---|---|---|
| query(1, [0,2], 0, 2) | 1 | [0,2] | total overlap → return 8 |

Result: **8** ✅

### Complexity

| Operation | Time | Comment |
|---|---|---|
| Constructor | O(N) | Build via recursion visits 2N−1 nodes. |
| update | O(log N) | Path from leaf to root. |
| sumRange | O(log N) | At most 2 nodes visited per level, O(log N) levels. |
| Space | O(N) | Array of size 4N. |

### Practical Performance
- Both BIT and Segment Tree run in O(log N) per operation.
- BIT has smaller constants and simpler code.
- Segment Tree is more versatile (lazy propagation, min/max queries).
- For this problem specifically, BIT is slightly faster in practice.

---

## Interview-Ready Explanation (60–90 seconds)

> "Range Sum Query Mutable requires both point updates and range sum queries, so a simple prefix sum won't work — updates would be O(N).
>
> I use a **Segment Tree**: a binary tree where each leaf holds one array element, and each internal node holds the sum of its children's ranges. Building takes O(N). For a sum query, I recursively visit only nodes whose ranges overlap the query — at most O(log N) nodes. For an update, I change the leaf and propagate the new sum up to the root — again O(log N).
>
> Alternatively, a **Binary Indexed Tree (Fenwick Tree)** achieves the same O(log N) per operation with simpler code and lower constants, but the Segment Tree is more general.
>
> Both use O(N) space. Total for Q operations: **O(Q log N)**."

---

## Visual Diagram

```
nums = [1, 3, 5]

Segment Tree:
                 ┌──────────┐
                 │ node 1   │
                 │ [0..2]=9 │
                 └────┬─────┘
              ┌───────┴───────┐
         ┌────┴────┐     ┌────┴────┐
         │ node 2  │     │ node 3  │
         │[0..1]=4 │     │[2..2]=5 │
         └────┬────┘     └─────────┘
       ┌──────┴──────┐
  ┌────┴────┐   ┌────┴────┐
  │ node 4  │   │ node 5  │
  │[0..0]=1 │   │[1..1]=3 │
  └─────────┘   └─────────┘

sumRange(0,2) → node 1 fully covers [0,2] → return 9

update(1, 2):
  node 5: 3→2
  node 2: 4→3 (1+2)
  node 1: 9→8 (3+5)

After update:
                 ┌──────────┐
                 │ node 1   │
                 │ [0..2]=8 │
                 └────┬─────┘
              ┌───────┴───────┐
         ┌────┴────┐     ┌────┴────┐
         │ node 2  │     │ node 3  │
         │[0..1]=3 │     │[2..2]=5 │
         └────┬────┘     └─────────┘
       ┌──────┴──────┐
  ┌────┴────┐   ┌────┴────┐
  │ node 4  │   │ node 5  │
  │[0..0]=1 │   │[1..1]=2 │
  └─────────┘   └─────────┘
```
