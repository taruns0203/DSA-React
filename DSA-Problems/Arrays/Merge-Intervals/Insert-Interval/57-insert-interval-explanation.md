# 57. Insert Interval - Complete Explanation

## High-Level Interpretation

Given a **sorted, non-overlapping** list of intervals and a new interval to insert, merge the new interval with any existing intervals it overlaps with, and return the resulting list that remains sorted and non-overlapping.

**Why It Matters:**
- Calendar scheduling (adding a new event)
- Database range queries (inserting new ranges)
- Memory management (allocating new blocks)
- Real-time interval management

**Hidden Traps:**
- **Empty intervals list**: Just return [newInterval]
- **newInterval at beginning**: Insert before all others
- **newInterval at end**: Insert after all others
- **Overlaps multiple**: May merge with many intervals at once
- **Touching intervals**: [1,3] and [3,5] → [1,5] (they overlap)
- **Nested intervals**: New interval may be inside an existing one

---

## 1. Brute-Force Approach: Add, Then Merge All

### Idea

Simply add the new interval to the list, then use the standard "Merge Intervals" algorithm (sort + linear merge).

### Pseudocode

```
function insertInterval(intervals, newInterval):
    intervals.push(newInterval)
    sort intervals by start
    
    merged = [intervals[0]]
    for i = 1 to intervals.length:
        current = intervals[i]
        last = merged[last]
        if current.start <= last.end:
            last.end = max(last.end, current.end)
        else:
            merged.push(current)
    
    return merged
```

### JavaScript Implementation

```javascript
function insert(intervals, newInterval) {
    intervals.push(newInterval);
    intervals.sort((a, b) => a[0] - b[0]);
    
    const merged = [intervals[0]];
    
    for (let i = 1; i < intervals.length; i++) {
        const current = intervals[i];
        const last = merged[merged.length - 1];
        
        if (current[0] <= last[1]) {
            last[1] = Math.max(last[1], current[1]);
        } else {
            merged.push(current);
        }
    }
    
    return merged;
}
```

### Complexity

- **Time**: O(n log n) — sorting dominates
- **Space**: O(n) — for merged array

### Dry Run: Example 1

```
intervals = [[1,3],[6,9]], newInterval = [2,5]

Step 1: Add newInterval
[[1,3],[6,9],[2,5]]

Step 2: Sort by start
[[1,3],[2,5],[6,9]]

Step 3: Merge
merged = [[1,3]]
- [2,5]: 2 ≤ 3 → extend to [1,5], merged = [[1,5]]
- [6,9]: 6 > 5 → add new, merged = [[1,5],[6,9]]

Result: [[1,5],[6,9]]
```

### Why This Approach Is Suboptimal

- **Ignores sorted property**: Input is already sorted
- **Unnecessary sorting**: O(n log n) when O(n) is possible
- **Doesn't leverage structure**: Could do single pass

---

## 2. Improved Approach: Insert at Correct Position, Then Merge

### What Changed?

Since intervals is sorted, binary search for insertion position, then merge linearly. Avoids full sort.

### Pseudocode

```
function insertInterval(intervals, newInterval):
    // Binary search for insertion position
    pos = binarySearchInsertPosition(intervals, newInterval.start)
    
    // Insert new interval at correct position
    intervals.splice(pos, 0, newInterval)
    
    // Now merge (same as Merge Intervals)
    merged = [intervals[0]]
    for i = 1 to intervals.length:
        current = intervals[i]
        last = merged[merged.length - 1]
        if current.start <= last.end:
            last.end = max(last.end, current.end)
        else:
            merged.push(current)
    
    return merged
```

### JavaScript Implementation

```javascript
function insert(intervals, newInterval) {
    // Binary search for insertion position
    let left = 0, right = intervals.length;
    while (left < right) {
        const mid = Math.floor((left + right) / 2);
        if (intervals[mid][0] < newInterval[0]) {
            left = mid + 1;
        } else {
            right = mid;
        }
    }
    
    // Insert at position
    intervals.splice(left, 0, newInterval);
    
    // Merge all
    const merged = [intervals[0]];
    for (let i = 1; i < intervals.length; i++) {
        const current = intervals[i];
        const last = merged[merged.length - 1];
        
        if (current[0] <= last[1]) {
            last[1] = Math.max(last[1], current[1]);
        } else {
            merged.push(current);
        }
    }
    
    return merged;
}
```

### Complexity

- **Time**: O(n) — binary search is O(log n), splice is O(n), merge is O(n)
- **Space**: O(n) — for merged array

### Dry Run: Example 1

```
intervals = [[1,3],[6,9]], newInterval = [2,5]

Step 1: Binary search for position
Looking for where to insert start=2
- mid=0: intervals[0][0]=1 < 2 → left=1
- left=1, right=2, mid=1: intervals[1][0]=6 >= 2 → right=1
Position = 1

Step 2: Insert at position 1
[[1,3],[2,5],[6,9]]

Step 3: Merge
Result: [[1,5],[6,9]]
```

### Trade-offs

- ✓ Avoids O(n log n) sort
- ✓ Leverages sorted property
- ✗ Still requires full merge pass
- ✗ splice() modifies input

---

## 3. Optimal Approach: Three-Part Single Pass

### Intuition

The input is already sorted and non-overlapping. We can process in three phases:

1. **Before**: Add all intervals that end before newInterval starts
2. **Merge**: Merge all overlapping intervals with newInterval
3. **After**: Add all intervals that start after newInterval ends

Single pass, no sorting needed.

### Key Insight

An interval `[a,b]` overlaps with `[c,d]` if `a ≤ d AND c ≤ b`.

For our case:
- **No overlap before**: `interval.end < newInterval.start`
- **No overlap after**: `interval.start > newInterval.end`
- **Overlapping**: Everything else

### Pseudocode

```
function insertInterval(intervals, newInterval):
    result = []
    i = 0
    n = intervals.length
    
    // Phase 1: Add all intervals ending before newInterval starts
    while i < n AND intervals[i].end < newInterval.start:
        result.push(intervals[i])
        i++
    
    // Phase 2: Merge all overlapping intervals with newInterval
    while i < n AND intervals[i].start <= newInterval.end:
        newInterval.start = min(newInterval.start, intervals[i].start)
        newInterval.end = max(newInterval.end, intervals[i].end)
        i++
    result.push(newInterval)
    
    // Phase 3: Add all remaining intervals
    while i < n:
        result.push(intervals[i])
        i++
    
    return result
```

### JavaScript Implementation

```javascript
function insert(intervals, newInterval) {
    const result = [];
    let i = 0;
    const n = intervals.length;
    
    // Phase 1: Add all intervals that end before newInterval starts
    while (i < n && intervals[i][1] < newInterval[0]) {
        result.push(intervals[i]);
        i++;
    }
    
    // Phase 2: Merge all overlapping intervals with newInterval
    while (i < n && intervals[i][0] <= newInterval[1]) {
        newInterval[0] = Math.min(newInterval[0], intervals[i][0]);
        newInterval[1] = Math.max(newInterval[1], intervals[i][1]);
        i++;
    }
    result.push(newInterval);
    
    // Phase 3: Add all remaining intervals
    while (i < n) {
        result.push(intervals[i]);
        i++;
    }
    
    return result;
}
```

### Correctness Proof

**Loop Invariants**:
1. After Phase 1: `result` contains all intervals with `end < newInterval.start` (no overlap possible)
2. After Phase 2: `newInterval` has been expanded to cover all overlapping intervals
3. After Phase 3: All remaining intervals (with `start > newInterval.end`) are added

**Proof**:
- Phase 1 terminates when we find first interval that could overlap (ends at or after newInterval starts)
- Phase 2 keeps expanding newInterval while there's overlap (`intervals[i].start <= newInterval.end`)
- After Phase 2, all remaining intervals start after newInterval ends (no overlap)
- Result is sorted because we process in order ∎

### Dry Run: Example 1

```
intervals = [[1,3],[6,9]], newInterval = [2,5]
n = 2, i = 0, result = []

Phase 1: Add intervals ending before newInterval starts (< 2)
- i=0: [1,3].end=3 < 2? No → stop Phase 1
result = []

Phase 2: Merge overlapping intervals
- i=0: [1,3].start=1 ≤ 5? Yes → merge
  newInterval = [min(2,1), max(5,3)] = [1,5]
  i = 1
- i=1: [6,9].start=6 ≤ 5? No → stop Phase 2
result.push([1,5]) → result = [[1,5]]

Phase 3: Add remaining
- i=1: result.push([6,9]) → result = [[1,5],[6,9]]

Result: [[1,5],[6,9]] ✓
```

### Dry Run: Example 2

```
intervals = [[1,2],[3,5],[6,7],[8,10],[12,16]], newInterval = [4,8]
n = 5, i = 0, result = []

Phase 1: Add intervals ending before 4
- i=0: [1,2].end=2 < 4? Yes → result = [[1,2]], i=1
- i=1: [3,5].end=5 < 4? No → stop Phase 1

Phase 2: Merge overlapping
- i=1: [3,5].start=3 ≤ 8? Yes → newInterval = [min(4,3), max(8,5)] = [3,8], i=2
- i=2: [6,7].start=6 ≤ 8? Yes → newInterval = [min(3,6), max(8,7)] = [3,8], i=3
- i=3: [8,10].start=8 ≤ 8? Yes → newInterval = [min(3,8), max(8,10)] = [3,10], i=4
- i=4: [12,16].start=12 ≤ 10? No → stop Phase 2
result.push([3,10]) → result = [[1,2],[3,10]]

Phase 3: Add remaining
- i=4: result.push([12,16]) → result = [[1,2],[3,10],[12,16]]

Result: [[1,2],[3,10],[12,16]] ✓
```

### Complexity

- **Time**: O(n) — single pass through all intervals
- **Space**: O(n) — for result array (required by problem)

### Practical Performance

- Single pass, no sorting
- No binary search needed
- Simple three-phase logic
- Cache-friendly sequential access
- Minimal branching

---

## Interview-Ready Explanation (60-90 seconds)

> "For inserting an interval into a sorted, non-overlapping list, I use a three-phase single-pass approach.
>
> First, I add all intervals that end before the new interval starts — these can't possibly overlap.
>
> Second, I merge all intervals that overlap with the new interval. An interval overlaps if its start is at or before the new interval's end. During merging, I update the new interval's boundaries to be the min of starts and max of ends.
>
> Third, I add all remaining intervals, which start after the new interval ends.
>
> For example, with [[1,3],[6,9]] and newInterval [2,5]: [1,3] overlaps because 1 ≤ 5, so we merge to [1,5]. Then [6,9] doesn't overlap (6 > 5), so we add it as-is.
>
> Time complexity is O(n) since we do a single pass. Space is O(n) for the result array."

---

## Visual Diagram

### Three-Phase Processing

```
intervals = [[1,2], [3,5], [6,7], [8,10], [12,16]]
newInterval = [4,8]

Timeline:
0──1──2──3──4──5──6──7──8──9──10──11──12──13──14──15──16
   [─]                                          Phase 1: end < 4
         [───]  [──]  [────]                    Phase 2: start ≤ 8
                                    [────────]  Phase 3: start > 10

         new: [────────]
              4        8

Phase 1: [[1,2]] → result
Phase 2: [3,5], [6,7], [8,10] → merge with [4,8] → [3,10]
Phase 3: [[12,16]] → result

Result: [[1,2], [3,10], [12,16]]
```

### Overlap Detection

```
Does [a,b] overlap with [c,d]?

Case 1: No overlap (before)
[a───b]
            [c───d]
b < c → No overlap

Case 2: Overlap (various types)
[a─────b]
    [c───d]     → overlap (c ≤ b)

    [a───b]
[c─────d]       → overlap (a ≤ d)

[a───────b]
  [c───d]       → overlap (contained)

Case 3: No overlap (after)
            [a───b]
[c───d]
a > d → No overlap

For our algorithm:
- Phase 1: interval.end < newInterval.start (Case 1)
- Phase 2: interval.start <= newInterval.end (Case 2)
- Phase 3: interval.start > newInterval.end (Case 3)
```

---

## Edge Cases

1. **Empty intervals**: Return [newInterval]
2. **Insert at beginning**: [5,7] into [[10,12]] → [[5,7],[10,12]]
3. **Insert at end**: [20,25] into [[1,5]] → [[1,5],[20,25]]
4. **newInterval covers all**: [0,100] into [[5,10],[15,20]] → [[0,100]]
5. **No overlaps**: [4,4] into [[1,2],[6,8]] → [[1,2],[4,4],[6,8]]
6. **Touching intervals**: [3,4] into [[1,3],[4,6]] → [[1,6]]

---

## Comparison of Approaches

| Approach | Time | Space | Notes |
|----------|------|-------|-------|
| Add + Sort + Merge | O(n log n) | O(n) | ❌ Ignores sorted input |
| Binary Insert + Merge | O(n) | O(n) | Okay, but two passes |
| **Three-Phase Single Pass** | **O(n)** | **O(n)** | ✓ **Optimal** |

---

## Key Takeaways

1. **Sorted input**: Don't sort again — O(n) is achievable
2. **Three phases**: Before, Merge, After
3. **Phase 1 condition**: `interval.end < newInterval.start`
4. **Phase 2 condition**: `interval.start <= newInterval.end`
5. **Merge during Phase 2**: Update newInterval boundaries
6. **Single pointer**: Just increment i through all phases
7. **No binary search needed**: Linear scan is O(n) anyway
8. **Edge cases**: Empty input, no overlaps, full coverage
9. **Touching = overlap**: [1,3] and [3,5] merge
10. **Clean three-loop structure**: Easy to implement and verify
