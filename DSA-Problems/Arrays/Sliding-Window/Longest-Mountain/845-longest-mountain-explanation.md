# 845. Longest Mountain in Array - Complete Explanation

## High-Level Interpretation

You are given an array of integers `arr`. You need to find the length of the **longest contiguous subarray** that forms a "mountain".
A mountain is defined as a sequence of at least 3 elements that strictly increases to a peak and then strictly decreases.
`[1, 4, 7, 3, 2]` is a mountain. `[1, 2, 3]` is not (no decrease). `[3, 2, 1]` is not (no increase). `[2, 2, 2]` is not (flat).

**Why It Matters:**
- Tests your ability to handle strict conditions (strictly increasing then decreasing).
- A classic "state-based" array iteration problem.
- Can be solved with multiple approaches (expansion, precomputation, one-pass).

**Hidden Traps:**
- **Minimum Length**: A mountain must be at least length 3.
- **Strict Inequality**: `arr[i] == arr[i+1]` breaks the mountain.
- **Boundaries**: Peaks cannot be the first or last element (must have left and right neighbors).

---

## 1. Brute-Force Approach: Try Every Peak

### Idea

A mountain is defined by its peak. The peak must be strictly greater than its left and right neighbors.
We can iterate through every index `i` from `1` to `N-2` (potential peaks).
If `arr[i]` is a peak (`arr[i-1] < arr[i] > arr[i+1]`), we expand outwards:
- Go left while `arr[left-1] < arr[left]`.
- Go right while `arr[right] > arr[right+1]`.
- The length is `right - left + 1`. We track the maximum length found.

### Pseudocode

```
function longestMountain(arr):
    n = arr.length
    maxLen = 0
    
    for i from 1 to n-2:
        // Check if `i` is a peak
        if arr[i-1] < arr[i] AND arr[i] > arr[i+1]:
            left = i - 1
            right = i + 1
            
            // Expand Left
            while left > 0 AND arr[left-1] < arr[left]:
                left--
                
            // Expand Right
            while right < n-1 AND arr[right] > arr[right+1]:
                right++
                
            currentLen = right - left + 1
            maxLen = max(maxLen, currentLen)
            
    return maxLen
```

### Complexity

- **Time**: O(N^2). In the worst case (e.g., repeating pattern `1, 2, 1, 2, 1...`), we might expand significantly for many peaks, though rigorous analysis shows it's closer to O(N) because segments don't overlap in a valid mountain way that causes quadratic re-scanning of the *same* mountain parts. But conceptually, we re-scan.
- **Space**: O(1).

### Dry Run

`arr = [2, 1, 4, 7, 3, 2, 5]`

- `i=1` (1): Not peak (`2 > 1`). Skip.
- `i=2` (4): Not peak (`1 < 4`, but `4 < 7`). Skip.
- `i=3` (7): Peak! (`4 < 7 > 3`).
  - Expand Left: `4 > 1` (ok), `1 < 2` (stop). Left ends at index 1 (val 1).
  - Expand Right: `3 > 2` (ok), `2 < 5` (stop). Right ends at index 5 (val 2).
  - Length: `5 - 1 + 1 = 5`. `maxLen = 5`.
- `i=4` (3): Not peak.
- ...

Result: 5.

### Why Fails/Slow?
It effectively re-processes elements. For example, in expanding the left side of a peak, we re-verify the increasing sequence we might have just seen.

---

## 2. Improved Approach: Two Pass (Precomputation)

### Idea

We can compute the length of the increasing sequence ending at `i` (`up[i]`) and the decreasing sequence starting at `i` (`down[i]`).
- **Pass 1 (Left to Right)**: If `arr[i] > arr[i-1]`, then `up[i] = up[i-1] + 1`. Else `up[i] = 0`.
- **Pass 2 (Right to Left)**: If `arr[i] > arr[i+1]`, then `down[i] = down[i+1] + 1`. Else `down[i] = 0`.

A "peak" at `i` exists if `up[i] > 0` AND `down[i] > 0`.
The length of the mountain with peak at `i` is `up[i] + down[i] + 1`.

### Pseudocode

```
function longestMountain(arr):
    n = arr.length
    up = new Array(n).fill(0)
    down = new Array(n).fill(0)
    
    for i from 1 to n-1:
        if arr[i] > arr[i-1]: up[i] = up[i-1] + 1
        
    for i from n-2 to 0:
        if arr[i] > arr[i+1]: down[i] = down[i+1] + 1
        
    maxLen = 0
    for i from 0 to n-1:
        if up[i] > 0 AND down[i] > 0:
            maxLen = max(maxLen, up[i] + down[i] + 1)
            
    return maxLen
```

### Complexity
- **Time**: O(N). Three distinct passes.
- **Space**: O(N). Two auxiliary arrays.

---

## 3. Optimal Approach: One Pass (State Machine / Two Pointers)

### Intuition

We can solve this in one pass with O(1) space by tracking the current mountain's state.
We traverse the array and count the length of the increasing phase (`up`) and decreasing phase (`down`).

**Logic:**
1. While moving, if we are strictly increasing, increment `up`.
2. If we encounter a peak (transition from up to down), start counting `down`.
3. If we are strictly decreasing, increment `down`.
4. If the sequence breaks (flat or goes up again):
   - If we had both `up` and `down`, we found a valid mountain. Record length.
   - Reset `up` and `down` based on the current transition.

Actually, a simpler one-pass logic uses a `while` loop to identify the mountain structure `local_start ... peak ... local_end`.
- Find the start of an increasing segment.
- Walk up to the peak.
- Walk down to the end.
- Record length.
- The end of this mountain becomes the potential start of the next (or earlier if flat).

### Pseudocode

```
function longestMountain(arr):
    n = arr.length
    maxLen = 0
    i = 0
    
    while i < n - 1:
        // Skip flat or decreasing starts
        if arr[i+1] <= arr[i]:
            i++
            continue
            
        // Climb Up
        up = 0
        while i < n - 1 AND arr[i+1] > arr[i]:
            up++
            i++
            
        // Climb Down
        down = 0
        while i < n - 1 AND arr[i+1] < arr[i]:
            down++
            i++
            
        // Check if valid mountain
        if up > 0 AND down > 0:
            maxLen = max(maxLen, up + down + 1)
            // Important: 'i' is now at the end of the descent.
            // In the next iteration, we shouldn't increment 'i' blindly, 
            // but the outer loop continues. Note: due to 'down' loop, 
            // 'i' is already at the "valley" or end.
            // But wait, the valley element could be start of new up?
            // Yes, so we decrement i to let the next iteration check it as start?
            // Actually, my while loop structure naturally handles it. 
            // The item at 'i' (valley) is smaller than 'i-1'. 
            // In next iter, we check arr[i+1] > arr[i]. Perfect.
            
            // Correction: One edge case. If we ended because of flat `arr[i] == arr[i+1]`,
            // we effectively need to start search from i+1.
            // If we ended because `arr[i+1] > arr[i]`, `i` is the start of new mountain.
            // So we can just let loop continue? 
            // Actually, standard implementation ensures `i` moves correctly.
            // Let's use a simpler pointer logic:
            
    return maxLen
```

**Refined Logic (Standard Two-Pointer):**
Iterate `i` from 1 to `N-2`.
Identify peak `arr[i-1] < arr[i] > arr[i+1]`.
Expand left (already known from scan? No) and right.
Wait, that is brute force.

**True One-Pass Logic (Enumerating Boundaries):**
We walk `i` through the array. 
For each `i`, check if it's the start of a mountain base? No, check peak.
Actually, the simplest O(N) O(1) is the "Up and Down" Counters.

```
maxLen = 0
up = 0
down = 0

for i from 1 to n-1:
    if (down > 0 and arr[i] > arr[i-1]) or arr[i] == arr[i-1]:
        // Reset if we were going down and now go up (valley found) OR flat
        up = 0
        down = 0
        
    if arr[i] > arr[i-1]:
        up++
    else if arr[i] < arr[i-1]:
        down++
        
    if up > 0 and down > 0:
        maxLen = max(maxLen, up + down + 1)
```
Wait, if `arr[i] > arr[i-1]` (going up), we increment `up`. If we were going down previously, that means a valley. We reset.
Wait, if we reset `up`, we should set it to 1? No, `up` is length of increasing part *ending* at `i`.
Let's trace:
`[1, 2, 3]` -> `up` becomes 1, 2.
`3 -> 2` -> `down` becomes 1. MaxLen updated (up=2, down=1 -> 4).
`2 -> 4` -> `arr[i] > arr[i-1]`. `down` was > 0. Reset `up=0, down=0`. Then `up++` (up=1). Correct.

### JavaScript Implementation

```javascript
/**
 * @param {number[]} arr
 * @return {number}
 */
var longestMountain = function(arr) {
    let maxLen = 0;
    let up = 0;
    let down = 0;
    
    for (let i = 1; i < arr.length; i++) {
        // If we encounter a valley (was going down, now going up) or flat surface
        if ((down > 0 && arr[i] > arr[i-1]) || arr[i] === arr[i-1]) {
            up = 0;
            down = 0;
        }
        
        if (arr[i] > arr[i-1]) {
            up++;
        } else if (arr[i] < arr[i-1]) {
            down++;
        }
        
        // If we have both an up component and a down component, it's a mountain
        if (up > 0 && down > 0) {
            maxLen = Math.max(maxLen, up + down + 1);
        }
    }
    
    return maxLen;
};
```

### Dry Run

`arr = [2, 1, 4, 7, 3, 2, 5]`

| i | Val | Prev | Action | Up | Down | MaxLen |
|---|---|---|---|---|---|---|
| 1 | 1 | 2 | Decrease. `down++`? But `up` is 0. So just `down++` (1). | 0 | 1 | 0 (up is 0) |
| 2 | 4 | 1 | Increase. `down`>0 -> Reset. `up++` (1). | 1 | 0 | 0 |
| 3 | 7 | 4 | Increase. `up++` (2). | 2 | 0 | 0 |
| 4 | 3 | 7 | Decrease. `down++` (1). Valid(up>0, down>0). | 2 | 1 | 4 (2+1+1) |
| 5 | 2 | 3 | Decrease. `down++` (2). Valid. | 2 | 2 | 5 (2+2+1) |
| 6 | 5 | 2 | Increase. `down`>0 -> Reset. `up++`. | 1 | 0 | 5 |

Result: 5.

### Complexity
- **Time**: O(N). Single pass.
- **Space**: O(1). Only counting variables.

### Practical Performance
Simple logic, cache friendly, minimal overhead.

---

## Interview-Ready Explanation (60-90 seconds)

> "The problem is to find the longest subarray that strictly increases then strictly decreases.
> 
> A brute-force check of every peak is O(N^2) (or O(N) amortized but complex).
> 
> We can do better. A **Two-Pass** approach precomputes 'increasing length ending at i' and 'decreasing length starting at i', then combines them. This is O(N) time and space.
> 
> The **Optimal** approach is a **One-Pass** state machine. We maintain `up` and `down` counters as we iterate.
> - If current > prev: we are climbing. If we were descending before, it's a new mountain start, so reset counters. Increment `up`.
> - If current < prev: we are descending. Increment `down`. If `up > 0`, we have a valid mountain, so update `maxLen`.
> - If equal: reset both.
> 
> This runs in **O(N)** time and **O(1)** space."
