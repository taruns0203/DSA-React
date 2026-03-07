# 56. Merge Intervals - Complete Explanation

## High-Level Interpretation

Given a collection of intervals (start, end pairs), combine all overlapping intervals into non-overlapping intervals that cover the same range. Two intervals overlap if one starts before or when the other ends.

**Why It Matters:**
- Calendar scheduling (merge meeting blocks)
- Time range compression
- Memory allocation (merging free blocks)
- Database query optimization

**Hidden Traps:**
- **Touching intervals**: [1,4] and [4,5] **are** overlapping (share endpoint)
- **Nested intervals**: [1,10] and [2,5] merge to [1,10]
- **Unsorted input**: Intervals may come in any order
- **Single interval**: Should return as-is
- **Duplicate intervals**: Handle gracefully

---

## 1. Brute-Force Approach: Compare Every Pair

### Idea

For each interval, check against all others. If any overlap, merge them and start over. Repeat until no more merges possible.

### Pseudocode

```
function mergeIntervals(intervals):
    result = copy of intervals
    
    changed = true
    while changed:
        changed = false
        for i = 0 to result.length:
            for j = i+1 to result.length:
                if overlaps(result[i], result[j]):
                    merged = merge(result[i], result[j])
                    remove result[i] and result[j]
                    add merged to result
                    changed = true
                    break both loops
    
    return result

function overlaps(a, b):
    return a.start <= b.end AND b.start <= a.end

function merge(a, b):
    return [min(a.start, b.start), max(a.end, b.end)]
```

### JavaScript Implementation

```javascript
function merge(intervals) {
    if (intervals.length <= 1) return intervals;
    
    let result = [...intervals.map(i => [...i])];
    
    let changed = true;
    while (changed) {
        changed = false;
        outer:
        for (let i = 0; i < result.length; i++) {
            for (let j = i + 1; j < result.length; j++) {
                // Check if overlapping
                if (result[i][0] <= result[j][1] && result[j][0] <= result[i][1]) {
                    // Merge
                    const merged = [
                        Math.min(result[i][0], result[j][0]),
                        Math.max(result[i][1], result[j][1])
                    ];
                    result.splice(j, 1);
                    result.splice(i, 1);
                    result.push(merged);
                    changed = true;
                    break outer;
                }
            }
        }
    }
    
    return result;
}
```

### Complexity

- **Time**: O(n³) worst case — n intervals, each pass is O(n²), up to n passes
- **Space**: O(n) — for result array

### Dry Run: Example 1

```
intervals = [[1,3],[2,6],[8,10],[15,18]]

Pass 1:
  Compare [1,3] and [2,6]:
    1 ≤ 6 ✓ AND 2 ≤ 3 ✓ → OVERLAP!
    Merge → [1,6]
  result = [[8,10],[15,18],[1,6]]
  changed = true

Pass 2:
  Compare [8,10] and [15,18]: 8 ≤ 18 ✓ AND 15 ≤ 10 ✗ → No overlap
  Compare [8,10] and [1,6]: 8 ≤ 6 ✗ → No overlap
  Compare [15,18] and [1,6]: 15 ≤ 6 ✗ → No overlap
  changed = false → DONE

Result: [[8,10],[15,18],[1,6]] (order may vary)
```

### Why This Approach Is Slow

- **Quadratic per pass**: Comparing all pairs is O(n²)
- **Multiple passes**: After each merge, must restart
- **Inefficient**: Doesn't leverage any ordering
- **Repeated work**: Same pairs compared multiple times

---

## 2. Improved Approach: Union-Find (Disjoint Set)

### What Changed?

Use Union-Find to group overlapping intervals. Intervals in the same group get merged.

### Pseudocode

```
function mergeIntervals(intervals):
    n = intervals.length
    parent = [0, 1, 2, ..., n-1]
    
    // Union overlapping intervals
    for i = 0 to n:
        for j = i+1 to n:
            if overlaps(intervals[i], intervals[j]):
                union(i, j)
    
    // Group by root and merge
    groups = {}
    for i = 0 to n:
        root = find(i)
        groups[root].push(intervals[i])
    
    // Merge each group
    result = []
    for each group in groups:
        merged = [min of all starts, max of all ends]
        result.push(merged)
    
    return result
```

### JavaScript Implementation

```javascript
function merge(intervals) {
    const n = intervals.length;
    if (n <= 1) return intervals;
    
    // Union-Find
    const parent = Array.from({ length: n }, (_, i) => i);
    
    function find(x) {
        if (parent[x] !== x) parent[x] = find(parent[x]);
        return parent[x];
    }
    
    function union(x, y) {
        parent[find(x)] = find(y);
    }
    
    function overlaps(a, b) {
        return a[0] <= b[1] && b[0] <= a[1];
    }
    
    // Union overlapping pairs
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            if (overlaps(intervals[i], intervals[j])) {
                union(i, j);
            }
        }
    }
    
    // Group by root
    const groups = new Map();
    for (let i = 0; i < n; i++) {
        const root = find(i);
        if (!groups.has(root)) groups.set(root, []);
        groups.get(root).push(intervals[i]);
    }
    
    // Merge each group
    const result = [];
    for (const group of groups.values()) {
        let start = Infinity, end = -Infinity;
        for (const [s, e] of group) {
            start = Math.min(start, s);
            end = Math.max(end, e);
        }
        result.push([start, end]);
    }
    
    return result;
}
```

### Complexity

- **Time**: O(n² α(n)) ≈ O(n²) — pairwise comparison dominates
- **Space**: O(n) — for parent array and groups

### Dry Run: Example 1

```
intervals = [[1,3],[2,6],[8,10],[15,18]]
           idx 0    1      2       3

Initial parent = [0, 1, 2, 3]

Compare pairs:
  (0,1): [1,3] overlaps [2,6]? 1≤6 ✓, 2≤3 ✓ → union(0,1) → parent[0]=1
  (0,2): [1,3] overlaps [8,10]? 1≤10 ✓, 8≤3 ✗ → No
  (0,3): [1,3] overlaps [15,18]? 1≤18 ✓, 15≤3 ✗ → No
  (1,2): [2,6] overlaps [8,10]? 2≤10 ✓, 8≤6 ✗ → No
  (1,3): [2,6] overlaps [15,18]? 2≤18 ✓, 15≤6 ✗ → No
  (2,3): [8,10] overlaps [15,18]? 8≤18 ✓, 15≤10 ✗ → No

parent = [1, 1, 2, 3]

Groups:
  root 1: [0,1] → [[1,3],[2,6]] → merge [1,6]
  root 2: [2] → [[8,10]] → [8,10]
  root 3: [3] → [[15,18]] → [15,18]

Result: [[1,6],[8,10],[15,18]]
```

### Trade-offs

- ✓ Single pass of comparisons
- ✓ No restart needed after merges
- ✗ Still O(n²) for comparisons
- ✗ Extra space for Union-Find structure

---

## 3. Optimal Approach: Sort + Linear Merge

### Intuition

**Key Insight**: If intervals are sorted by start time, overlapping intervals are always **consecutive**.

After sorting:
- If current interval overlaps with last merged, extend the last merged
- Otherwise, add current as new merged interval

### Why Sorting Works

```
Sorted by start: [1,3], [2,6], [8,10], [15,18]
                  ├───┤
                    ├─────┤
                              ├───┤
                                      ├────┤

Overlapping intervals are ADJACENT after sorting!
```

### Pseudocode

```
function mergeIntervals(intervals):
    sort intervals by start time
    
    merged = [intervals[0]]
    
    for i = 1 to intervals.length:
        current = intervals[i]
        last = merged[merged.length - 1]
        
        if current.start <= last.end:
            // Overlapping - extend last
            last.end = max(last.end, current.end)
        else:
            // Not overlapping - add new
            merged.push(current)
    
    return merged
```

### JavaScript Implementation

```javascript
function merge(intervals) {
    if (intervals.length <= 1) return intervals;
    
    // Sort by start time
    intervals.sort((a, b) => a[0] - b[0]);
    
    const merged = [intervals[0]];
    
    for (let i = 1; i < intervals.length; i++) {
        const current = intervals[i];
        const last = merged[merged.length - 1];
        
        if (current[0] <= last[1]) {
            // Overlapping - extend
            last[1] = Math.max(last[1], current[1]);
        } else {
            // Not overlapping - add new
            merged.push(current);
        }
    }
    
    return merged;
}
```

### Correctness Proof

**Loop Invariant**: After processing intervals[0..i], `merged` contains the correctly merged result for those intervals.

**Proof**:
1. **Base case**: merged = [intervals[0]] is trivially correct for one interval
2. **Inductive step**: For interval i:
   - If it overlaps with last merged (current.start ≤ last.end), they must merge (extending end is correct because current.start ≥ last.start due to sorting)
   - If no overlap (current.start > last.end), it can't overlap with any earlier merged interval (they end before last.end)
3. **Termination**: All intervals processed → complete solution ∎

### Dry Run: Example 1

```
intervals = [[1,3],[2,6],[8,10],[15,18]]

After sort: [[1,3],[2,6],[8,10],[15,18]] (already sorted)

Initial: merged = [[1,3]]

| Step | current | last   | Overlap? | Action        | merged                    |
|------|---------|--------|----------|---------------|---------------------------|
| 1    | [2,6]   | [1,3]  | 2≤3 ✓   | Extend to [1,6]| [[1,6]]                  |
| 2    | [8,10]  | [1,6]  | 8≤6 ✗   | Add new       | [[1,6],[8,10]]           |
| 3    | [15,18] | [8,10] | 15≤10 ✗ | Add new       | [[1,6],[8,10],[15,18]]   |

Result: [[1,6],[8,10],[15,18]] ✓
```

### Dry Run: Example 2

```
intervals = [[1,4],[4,5]]

After sort: [[1,4],[4,5]] (already sorted)

Initial: merged = [[1,4]]

| Step | current | last   | Overlap? | Action        | merged    |
|------|---------|--------|----------|---------------|-----------|
| 1    | [4,5]   | [1,4]  | 4≤4 ✓   | Extend to [1,5]| [[1,5]]  |

Result: [[1,5]] ✓
```

### Dry Run: Nested Intervals

```
intervals = [[1,10],[2,3],[4,5]]

After sort: [[1,10],[2,3],[4,5]]

Initial: merged = [[1,10]]

| Step | current | last    | Overlap?  | Action         | merged    |
|------|---------|---------|-----------|----------------|-----------|
| 1    | [2,3]   | [1,10]  | 2≤10 ✓   | max(10,3)=10   | [[1,10]]  |
| 2    | [4,5]   | [1,10]  | 4≤10 ✓   | max(10,5)=10   | [[1,10]]  |

Result: [[1,10]] ✓ (nested intervals absorbed)
```

### Complexity

- **Time**: O(n log n) — sorting dominates, linear merge is O(n)
- **Space**: O(n) — for result (O(log n) for sort in-place)

### Practical Performance

- Sorting is well-optimized in practice
- Linear pass is cache-friendly
- Simple, minimal branching
- In-place modification possible (mutates input)

---

## Interview-Ready Explanation (60-90 seconds)

> "To merge overlapping intervals, I first sort them by start time. This ensures overlapping intervals are consecutive.
>
> Then I iterate through sorted intervals, maintaining a 'merged' result. For each interval, I check if it overlaps with the last merged interval by comparing its start with the last's end.
>
> If they overlap — meaning current start is at or before last end — I extend the last interval's end to cover both. Otherwise, I add the current interval as a new entry in merged.
>
> For example, [1,3] and [2,6]: after sorting, 2 ≤ 3, so they overlap. I extend to [1,6].
>
> Time complexity is O(n log n) for sorting plus O(n) for the linear pass. Space is O(n) for the result.
>
> The key insight is that sorting makes overlapping intervals adjacent, so we only need to compare with the most recently merged interval."

---

## Visual Diagram

### Before Sorting (intervals may be scattered)

```
Input: [[8,10],[1,3],[2,6],[15,18]]

Timeline:
0──1──2──3──4──5──6──7──8──9──10──11──12──13──14──15──16──17──18
   [───]           interval [1,3]
      [─────────]  interval [2,6]
                        [────]   interval [8,10]
                                         [──────] interval [15,18]
```

### After Sorting

```
Sorted by start: [[1,3],[2,6],[8,10],[15,18]]

Processing:
[1,3]  → merged = [[1,3]]
[2,6]  → 2 ≤ 3? Yes → extend → merged = [[1,6]]
[8,10] → 8 ≤ 6? No  → add new → merged = [[1,6],[8,10]]
[15,18]→ 15≤10? No → add new → merged = [[1,6],[8,10],[15,18]]

Result:
0──1──2──3──4──5──6──7──8──9──10──11──12──13──14──15──16──17──18
   [───────────]  merged [1,6]
                        [────]   [8,10]
                                         [──────] [15,18]
```

### Overlap Detection Logic

```
Two intervals [a,b] and [c,d] overlap if:
  a ≤ d AND c ≤ b

After sorting by start (a ≤ c), simplifies to:
  c ≤ b  (current.start ≤ last.end)

   last:  [a─────b]
current:      [c─────d]   c ≤ b → OVERLAP

   last:  [a─────b]
current:            [c─────d]   c > b → NO OVERLAP
```

---

## Comparison of Approaches

| Approach | Time | Space | Notes |
|----------|------|-------|-------|
| Brute Force | O(n³) | O(n) | ❌ Repeated restarts |
| Union-Find | O(n²) | O(n) | ❌ Still pairwise compares |
| **Sort + Merge** | **O(n log n)** | **O(n)** | ✓ **Optimal** |

---

## Edge Cases

1. **Single interval**: Return as-is
2. **All overlapping**: Returns one merged interval
3. **No overlapping**: Returns sorted input
4. **Adjacent**: [1,4],[4,5] → [1,5] (touching = overlap)
5. **Nested**: [1,10],[2,5] → [1,10] (inner absorbed)
6. **Same interval twice**: [[1,3],[1,3]] → [[1,3]]

---

## Key Takeaways

1. **Sort first**: Makes overlapping intervals consecutive
2. **Compare with last**: Only need to check last merged
3. **Extend or add**: Two simple operations
4. **Touching = overlap**: a.end = b.start means overlap
5. **Use max for end**: Handles nested intervals correctly
6. **O(n log n)**: Sorting is the bottleneck
7. **Linear pass**: After sorting, single O(n) scan
8. **No extra data structures**: Simple array suffices
9. **In-place possible**: Can mutate input array
10. **Template pattern**: Sort + greedy merge applies to many interval problems
