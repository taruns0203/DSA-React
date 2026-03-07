# 986. Interval List Intersections - Complete Explanation

## High-Level Interpretation

You are given two lists of intervals. Each list is already **sorted** by start time, and within each list, the intervals are **disjoint** (meaning no two intervals in `firstList` overlap with each other, and same for `secondList`).

Your task is to find all the **overlapping segments** (intersections) between intervals from `firstList` and intervals from `secondList`.

**Why It Matters:**
- **Scheduling**: Finding common free time slots between two people's calendars.
- **Resource Management**: Identifying time periods where two processes are simultaneously active.
- **Geometry**: Intersection of line segments on a 1D line.

**Hidden Traps:**
- **Touching Intervals**: Intervals like `[1, 2]` and `[2, 3]` touch at `2`. The intersection is `[2, 2]`. This is a valid interval and must be included.
- **Empty Output**: It's possible to have no intersections at all.
- **One Inside Another**: `[1, 10]` and `[2, 3]` intersect at `[2, 3]`.
- **Lists of Different Lengths**: One list might be much shorter than the other.

---

## 1. Brute-Force Approach: Compare Every Pair

### Idea

Since we want to find intersections between the two lists, the simplest approach is to check every interval in `firstList` against every interval in `secondList`. If a pair overlaps, we calculate the intersection and adding it to our result.

### Pseudocode

```
function intervalIntersection(firstList, secondList):
    result = []
    
    for each interval A in firstList:
        for each interval B in secondList:
            // Check if A and B overlap
            // Overlap condition: start of one <= end of other
            // More simply: largest start <= smallest end
            
            lo = max(A.start, B.start)
            hi = min(A.end, B.end)
            
            if lo <= hi:
                result.push([lo, hi])
                
    // Since input lists are sorted, iterating in order produces sorted output
    return result
```

### Complexity

- **Time**: O(N × M), where N and M are the lengths of the two lists. We compare every possible pair.
- **Space**: O(1) extra space (excluding the result list).

### Dry Run

```
firstList = [[1,3]]
secondList = [[2,4], [5,6]]

1. Compare [1,3] with [2,4]:
   lo = max(1, 2) = 2
   hi = min(3, 4) = 3
   lo <= hi (2 <= 3) -> Intersection [2, 3]. Add to result.

2. Compare [1,3] with [5,6]:
   lo = max(1, 5) = 5
   hi = min(3, 6) = 3
   lo > hi (5 > 3) -> No intersection.

Result: [[2, 3]]
```

### Why Fails/Slow?
- **Redundant Checks**: Most pairs do not overlap. For example, if `firstList[0]` is `[1,2]` and `secondList[99]` is `[1000, 1001]`, checking them is a waste of time.
- **Constraints**: With N, M up to 1000, N×M is 10⁶, which is actually acceptable. However, if N and M were 10⁵ (common in such problems), O(N×M) would time out.
- **Ignoring Structure**: This approach completely ignores the fact that the input lists are **already sorted and disjoint**.

---

## 2. Optimal Approach: Two Pointers (Merge Process)

### Intuition

Since both lists are **sorted**, we can traverse them linearly, similar to the "merge" step in Merge Sort.

We maintain two pointers, `i` for `firstList` and `j` for `secondList`. At each step, we look at `firstList[i]` and `secondList[j]`.

1. **Check Intersection**: Any overlap between two intervals `[start1, end1]` and `[start2, end2]` is purely `[max(start1, start2), min(end1, end2)]`. If `maxStart <= minEnd`, we have a valid intersection.

2. **Move Pointers**: After processing the pair, we need to decide which interval to discard (move past).
   - The interval that **ends first** cannot possibly intersect with any *subsequent* interval in the other list (because the other list is sorted).
   - So, we discard the interval with the smaller end time by incrementing its pointer.

### Pseudocode

```
function intervalIntersection(firstList, secondList):
    i = 0, j = 0
    result = []
    
    while i < firstList.length AND j < secondList.length:
        lo = max(firstList[i].start, secondList[j].start)
        hi = min(firstList[i].end, secondList[j].end)
        
        if lo <= hi:
            result.push([lo, hi])
            
        // Move the pointer of the interval that ends first
        if firstList[i].end < secondList[j].end:
            i++
        else:
            j++
            
    return result
```

### JavaScript Implementation

```javascript
/**
 * @param {number[][]} firstList
 * @param {number[][]} secondList
 * @return {number[][]}
 */
var intervalIntersection = function(firstList, secondList) {
    let result = [];
    let i = 0;
    let j = 0;
    
    while (i < firstList.length && j < secondList.length) {
        // Let's unpack for clarity
        const [start1, end1] = firstList[i];
        const [start2, end2] = secondList[j];
        
        // Compute the intersection boundaries
        const lo = Math.max(start1, start2);
        const hi = Math.min(end1, end2);
        
        // If it's a valid interval, add to result
        if (lo <= hi) {
            result.push([lo, hi]);
        }
        
        // Remove the interval with the smallest endpoint
        if (end1 < end2) {
            i++;
        } else {
            j++;
        }
    }
    
    return result;
};
```

### Correctness Proof

**Invariant**: At any step `(i, j)`, all intersections between intervals before index `i` in `firstList` and intervals before index `j` in `secondList` have already been found.

**Induction step**:
Consider two intervals A and B from the respective lists.
Suppose `A.end < B.end`.
- Could A intersect with `next(B)` (the interval after B)?
- `next(B).start > B.end` (intervals are disjoint and sorted)
- `next(B).start > B.end > A.end`
- So A ends strictly before `next(B)` starts.
- Thus, A cannot intersect with `next(B)` or any subsequent interval in list B.
- Therefore, we can safely discard A (increment `i`) without missing any future intersections involving A.

This logic holds symmetrically if `B.end < A.end`.

### Dry Run (Example 1)

`firstList = [[0,2], [5,10], [13,23], [24,25]]`
`secondList = [[1,5], [8,12], [15,24], [25,26]]`

| Step | i | j | A (`first`) | B (`second`) | `lo = max(s1,s2)` | `hi = min(e1,e2)` | `lo <= hi`? | Result | Action (Move) |
| :--- | :- | :- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | 0 | 0 | **[0,2]** | [1,5] | max(0,1)=**1** | min(2,5)=**2** | **Yes** | `[[1,2]]` | A ends (2) < B ends (5) → **i++** |
| 2 | 1 | 0 | **[5,10]** | [1,5] | max(5,1)=**5** | min(10,5)=**5** | **Yes** | `[[1,2], [5,5]]` | B ends (5) < A ends (10) → **j++** |
| 3 | 1 | 1 | [5,10] | **[8,12]** | max(5,8)=**8** | min(10,12)=**10** | **Yes** | `...[8,10]]` | A ends (10) < B ends (12) → **i++** |
| 4 | 2 | 1 | **[13,23]** | [8,12] | max(13,8)=**13** | min(23,12)=**12** | **No** | (No change) | B ends (12) < A ends (23) → **j++** |
| 5 | 2 | 2 | [13,23] | **[15,24]** | max(13,15)=**15** | min(23,24)=**23** | **Yes** | `...[15,23]]` | A ends (23) < B ends (24) → **i++** |
| 6 | 3 | 2 | **[24,25]** | [15,24] | max(24,15)=**24** | min(25,24)=**24** | **Yes** | `...[24,24]]` | B ends (24) < A ends (25) → **j++** |
| 7 | 3 | 3 | [24,25] | **[25,26]** | max(24,25)=**25** | min(25,26)=**25** | **Yes** | `...[25,25]]` | A ends (25) < B ends (26) → **i++** |

`i` reaches end of list (4). Loop terminates.

**Final Result**: `[[1,2],[5,5],[8,10],[15,23],[24,24],[25,25]]`
Matches example output.

### Complexity

- **Time**: O(N + M). We perform a constant amount of work for each interval in both lists. Each increment advances one pointer, and we stop when one list is exhausted.
- **Space**: O(1) if we ignore the output list space. The algorithm itself only uses a few variables.

### Practical Performance

This approach is extremely efficient. It traverses the data exactly once (Single Pass). It is cache-friendly as it accesses elements sequentially.

---

## Interview-Ready Explanation (60-90 seconds)

> "This problem asks for the intersection of two sorted, disjoint interval lists.
>
> The brute-force way would be to compare every pair, taking O(N*M). But since the lists are sorted, we can use a **Two Pointer** (coordinate sweep) approach to do this in linear **O(N + M)** time.
>
> We use two pointers, `i` and `j`, starting at the beginning of each list. At each step, we check the two current intervals.
>
> An intersection exists if the maximum of the start times is less than or equal to the minimum of the end times. If so, we add `[maxStart, minEnd]` to our result.
>
> Then, the crucial step is deciding which pointer to advance: we always move the pointer of the interval that **ends first**. The logic is that an interval ending at `T` cannot possibly overlap with any future interval in the other list that starts after `T`, so we are done with it. We repeat this until one list is exhausted."

---

## Visual Diagram

**A. Start of Loop:**
```
List A: [   A0   ]      [ A1 ]
List B:    [     B0     ]
Time:   0--1--2--3--4--5--6--7
```

**B. Intersection Logic:**
```
A0: [1, 3]
B0:    [2, 5]

lo = max(1, 2) = 2
hi = min(3, 5) = 3
Result: [2, 3]
```

**C. Moving Pointers:**
```
A0 ends at 3.
B0 ends at 5.
3 < 5, so A0 is "finished". We increment i.

Why?
Next interval in A (A1) starts after A0 ends (e.g., at 6).
B0 is still active extending to 5.
It's possible A1 intersects B0.
But A0 cannot intersect B1 (which starts after B0, i.e., > 5), because A0 ends at 3.
So we are safe to discard A0.
```
