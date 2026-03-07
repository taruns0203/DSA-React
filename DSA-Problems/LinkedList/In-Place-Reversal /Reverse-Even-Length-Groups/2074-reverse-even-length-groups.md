# 2074. Reverse Nodes in Even Length Groups — From Brute-Force to Optimal (In-Place One-Pass)

---

## 1. High-Level Interpretation

**What the problem asks:** Given a singly linked list, partition the nodes into sequential groups of sizes 1, 2, 3, 4, … (the last group may be smaller if there aren't enough nodes). For each group whose **actual** length is even, reverse the nodes in that group. Return the modified list head.

**Why it matters:** This combines group partitioning logic with in-place linked list reversal — a common pattern in FAANG interviews. It builds on LeetCode 92 (Reverse Linked List II) by adding dynamic group boundaries.

**Hidden traps:**
- **Last group truncation:** Group `g` expects `g` nodes, but the last group may have fewer. Its *actual* length determines even/odd, not its group number. E.g., if the last group is group 5 but only has 4 nodes → length 4 is even → reverse it.
- **Group 1 is always odd (length 1):** Never reversed, but your code should handle it generically.
- **Reconnection after reversal:** After reversing a group, the node before the group must point to the new head of the reversed segment, and the old head (now tail) must point to the start of the next group.
- **Off-by-one:** Counting nodes per group while simultaneously tracking pointers requires careful bookkeeping.

---

## 2. Brute-Force Approach — Array Extraction

### 2.1 Idea in Plain Words

Walk the entire linked list, copy all values into an array. Determine the group boundaries (1, 2, 3, …), reverse the values in each even-length group within the array. Then walk the list again and write the modified values back.

### 2.2 Pseudocode

```
function reverseEvenLengthGroups(head):
    // Step 1: Extract all values
    vals = []
    node = head
    while node != null:
        vals.push(node.val)
        node = node.next

    // Step 2: Process groups
    n = vals.length
    idx = 0
    groupNum = 1
    while idx < n:
        groupLen = min(groupNum, n - idx)   // actual length
        if groupLen % 2 == 0:
            reverse vals[idx .. idx + groupLen - 1]
        idx += groupLen
        groupNum++

    // Step 3: Write values back
    node = head
    for i = 0 to n - 1:
        node.val = vals[i]
        node = node.next

    return head
```

### 2.3 JavaScript Implementation

```javascript
function reverseEvenLengthGroups(head) {
    const vals = [];
    let node = head;
    while (node) { vals.push(node.val); node = node.next; }

    const n = vals.length;
    let idx = 0, g = 1;
    while (idx < n) {
        const len = Math.min(g, n - idx);
        if (len % 2 === 0) {
            let l = idx, r = idx + len - 1;
            while (l < r) { [vals[l], vals[r]] = [vals[r], vals[l]]; l++; r--; }
        }
        idx += len;
        g++;
    }

    node = head;
    for (let i = 0; i < n; i++) { node.val = vals[i]; node = node.next; }
    return head;
}
```

### 2.4 Time & Space Complexity

| Metric | Value | Derivation |
|--------|-------|------------|
| **Time** | **O(n)** | Two traversals (extract + write-back) + O(n) total reversal work across all groups. |
| **Space** | **O(n)** | The `vals` array stores all n values. |

### 2.5 Dry Run

**Input:** `head = [5,2,6,3,9,1,7,3,8,4]`

**Step 1:** `vals = [5,2,6,3,9,1,7,3,8,4]`, n=10

**Step 2:** Process groups:

| groupNum | idx | groupLen = min(g, n−idx) | Even? | Action | vals after |
|----------|-----|--------------------------|-------|--------|------------|
| 1 | 0 | min(1,10)=1 | No | skip | `[5,2,6,3,9,1,7,3,8,4]` |
| 2 | 1 | min(2,9)=2 | Yes | reverse [1..2] | `[5,6,2,3,9,1,7,3,8,4]` |
| 3 | 3 | min(3,7)=3 | No | skip | `[5,6,2,3,9,1,7,3,8,4]` |
| 4 | 6 | min(4,4)=4 | Yes | reverse [6..9] | `[5,6,2,3,9,1,4,8,3,7]` |
| 5 | 10 | — | — | idx≥n, exit | — |

**Step 3:** Write back → `5→6→2→3→9→1→4→8→3→7` ✅

### 2.6 Why This Is Not Ideal

- **O(n) extra space** for the values array.
- **Modifies values, not links** — interviewers typically expect link manipulation.
- Two full passes over the list.

---

## 3. Improved Approach — Per-Group Node Collection + Value Swap

### 3.1 What Changed & Why

Instead of extracting *all* values upfront, we process one group at a time:
1. For each group `g`, walk forward and collect references to the group's nodes in a small array.
2. If the group's actual length is even, swap values from both ends using two pointers on the collected array.
3. Move to the next group.

This reduces space from O(n) to O(g_max) where g_max ≈ √(2n) (since 1+2+…+g ≈ n → g ≈ √(2n)).

### 3.2 Pseudocode

```
function reverseEvenLengthGroups(head):
    curr = head
    groupNum = 1

    while curr != null:
        // Collect this group's nodes
        groupNodes = []
        temp = curr
        for i = 0 to groupNum - 1:
            if temp == null: break
            groupNodes.push(temp)
            temp = temp.next

        actualLen = groupNodes.length

        // If even length, swap values from ends
        if actualLen % 2 == 0:
            l = 0, r = actualLen - 1
            while l < r:
                swap(groupNodes[l].val, groupNodes[r].val)
                l++; r--

        // Advance to next group
        curr = temp
        groupNum++

    return head
```

### 3.3 JavaScript Implementation

```javascript
function reverseEvenLengthGroups(head) {
    let curr = head;
    let g = 1;

    while (curr) {
        const groupNodes = [];
        let temp = curr;
        for (let i = 0; i < g && temp; i++) {
            groupNodes.push(temp);
            temp = temp.next;
        }

        const len = groupNodes.length;
        if (len % 2 === 0) {
            let l = 0, r = len - 1;
            while (l < r) {
                [groupNodes[l].val, groupNodes[r].val] = [groupNodes[r].val, groupNodes[l].val];
                l++; r--;
            }
        }

        curr = temp;
        g++;
    }

    return head;
}
```

### 3.4 Time & Space Complexity

| Metric | Value | Derivation |
|--------|-------|------------|
| **Time** | **O(n)** | Each node is visited exactly once across all groups. |
| **Space** | **O(√n)** | The `groupNodes` array stores at most g_max ≈ √(2n) nodes for the largest group. |

### 3.5 Dry Run

**Input:** `head = [5,2,6,3,9,1,7,3,8,4]`

| g | curr starts at | Nodes collected | actualLen | Even? | After swap | curr moves to |
|---|----------------|-----------------|-----------|-------|------------|---------------|
| 1 | node(5) | [5] | 1 | No | no change | node(2) |
| 2 | node(2) | [2,6] | 2 | Yes | swap 2↔6 → [6,2] | node(3) |
| 3 | node(3) | [3,9,1] | 3 | No | no change | node(7) |
| 4 | node(7) | [7,3,8,4] | 4 | Yes | swap: 7↔4, 3↔8 → [4,8,3,7] | null |

**Result:** `5→6→2→3→9→1→4→8→3→7` ✅

### 3.6 Trade-offs

| Pros | Cons |
|------|------|
| Processes one group at a time (streaming) | Still swaps values, not links |
| O(√n) space — much better than O(n) | Collects node references per group |
| Simple to implement | Interviewers may want pure pointer reversal |

---

## 4. Optimal / Best Approach — In-Place Pointer Reversal (O(1) Space)

### 4.1 Intuition

We process groups one at a time without any auxiliary arrays. For each group `g`:

1. **Count:** Walk forward from the current position to count how many nodes actually belong to this group (could be less than `g` if it's the last group).
2. **Decide:** If the actual count is even → reverse.
3. **Reverse in-place:** Use the "head insertion" technique from LeetCode 92:
   - Save `prevGroupTail` (the last node of the previous group).
   - `tail = prevGroupTail.next` (first node of current group — will become tail after reversal).
   - Repeatedly extract the node after `tail` and insert it after `prevGroupTail`.
4. **Advance:** If the count was odd (no reversal), simply walk `prevGroupTail` forward by `actualLen` nodes.

**Key insight:** We maintain a single pointer `prevGroupTail` that always points to the last node of the previously processed group. This gives us the "hook" to stitch in reversals.

### 4.2 Pseudocode

```
function reverseEvenLengthGroups(head):
    dummy = new ListNode(0, head)
    prevTail = dummy
    groupNum = 1

    while prevTail.next != null:
        // Count actual nodes in this group
        count = 0
        temp = prevTail.next
        for i = 0 to groupNum - 1:
            if temp == null: break
            count++
            temp = temp.next

        if count % 2 == 0:
            // Reverse 'count' nodes after prevTail using head insertion
            tail = prevTail.next    // will become tail after reversal
            for i = 0 to count - 2:
                moveNode = tail.next
                tail.next = moveNode.next
                moveNode.next = prevTail.next
                prevTail.next = moveNode
            prevTail = tail         // tail is now the last node of reversed group
        else:
            // Skip: advance prevTail by 'count' nodes
            for i = 0 to count - 1:
                prevTail = prevTail.next

        groupNum++

    return dummy.next
```

### 4.3 JavaScript Implementation

```javascript
function reverseEvenLengthGroups(head) {
    const dummy = new ListNode(0, head);
    let prevTail = dummy;
    let g = 1;

    while (prevTail.next) {
        // Count actual nodes in group g
        let count = 0;
        let temp = prevTail.next;
        for (let i = 0; i < g && temp; i++) {
            count++;
            temp = temp.next;
        }

        if (count % 2 === 0) {
            // Reverse using head insertion
            const tail = prevTail.next;
            for (let i = 0; i < count - 1; i++) {
                const moveNode = tail.next;
                tail.next = moveNode.next;
                moveNode.next = prevTail.next;
                prevTail.next = moveNode;
            }
            prevTail = tail;
        } else {
            // Skip — advance prevTail by count
            for (let i = 0; i < count; i++) {
                prevTail = prevTail.next;
            }
        }

        g++;
    }

    return dummy.next;
}
```

### 4.4 Correctness Proof

**Loop invariant:** At the start of each iteration for group `g`:
- `prevTail` points to the last node of the previously processed group (or dummy if g=1).
- All groups 1 through g−1 have been correctly processed (even-length ones reversed, odd-length ones untouched).
- `prevTail.next` is the first node of group g.

**Base case (g=1):** `prevTail = dummy`, `dummy.next = head` = first node of group 1. ✓

**Inductive step:** For group g:
- We count `count = min(g, remaining nodes)`. This correctly handles the last group truncation.
- If even: head insertion reverses exactly `count` nodes after `prevTail`, then `prevTail = tail` (the old first node, now last). After reversal, `prevTail.next` is the first node of group g+1. ✓
- If odd: we advance `prevTail` by `count` nodes, landing on the last node of group g. `prevTail.next` is the first of group g+1. ✓

**Termination:** `prevTail.next == null` means all nodes processed. ✓

### 4.5 Dry Run — Example 1

**Input:** `head = [5,2,6,3,9,1,7,3,8,4]` (n=10)

```
Initial: D → 5 → 2 → 6 → 3 → 9 → 1 → 7 → 3 → 8 → 4
         prevTail
```

---

**Group 1 (g=1):**

| Step | Variable | Value |
|------|----------|-------|
| Count | count | 1 (min(1, 10)) |
| Even? | 1 % 2 | No → skip |
| Advance | prevTail | → node(5) |

```
D → 5 → 2 → 6 → 3 → 9 → 1 → 7 → 3 → 8 → 4
     prevTail
```

---

**Group 2 (g=2):**

| Step | Variable | Value |
|------|----------|-------|
| Count | count | 2 (min(2, 9)) |
| Even? | 2 % 2 | Yes → reverse |
| tail = | prevTail.next | node(2) |

Head insertion (count−1 = 1 iteration):

| i | moveNode | tail.next= | moveNode.next= | prevTail.next= | List |
|---|----------|------------|-----------------|----------------|------|
| 0 | node(6) | node(3) | node(2) | node(6) | D→5→**6→2**→3→9→1→7→3→8→4 |

prevTail = tail = node(2)

```
D → 5 → 6 → 2 → 3 → 9 → 1 → 7 → 3 → 8 → 4
              prevTail
```

---

**Group 3 (g=3):**

| Step | Variable | Value |
|------|----------|-------|
| Count | count | 3 (min(3, 7)) |
| Even? | 3 % 2 | No → skip |
| Advance | prevTail | → node(3) → node(9) → node(1) |

```
D → 5 → 6 → 2 → 3 → 9 → 1 → 7 → 3 → 8 → 4
                             prevTail
```

---

**Group 4 (g=4):**

| Step | Variable | Value |
|------|----------|-------|
| Count | count | 4 (min(4, 4)) |
| Even? | 4 % 2 | Yes → reverse |
| tail = | prevTail.next | node(7) |

Head insertion (count−1 = 3 iterations):

| i | moveNode | Operation | List after |
|---|----------|-----------|------------|
| 0 | node(3) | Extract 3, insert after node(1) | D→5→6→2→3→9→1→**3→7**→8→4 |
| 1 | node(8) | Extract 8, insert after node(1) | D→5→6→2→3→9→1→**8→3→7**→4 |
| 2 | node(4) | Extract 4, insert after node(1) | D→5→6→2→3→9→1→**4→8→3→7** |

prevTail = tail = node(7)

```
D → 5 → 6 → 2 → 3 → 9 → 1 → 4 → 8 → 3 → 7
                                            prevTail
```

prevTail.next = null → exit.

**Result:** `5→6→2→3→9→1→4→8→3→7` ✅

---

### 4.6 Dry Run — Example 2

**Input:** `head = [1,1,0,6]` (n=4)

| Group g | count | Even? | Action | List after | prevTail |
|---------|-------|-------|--------|------------|----------|
| 1 | 1 | No | skip, advance | D→1→1→0→6 | node(1) [first] |
| 2 | 2 | Yes | reverse: insert node(0) before node(1) | D→1→**0→1**→6 | node(1) [second] |
| 3 | 1 | No | skip (only 1 node left) | D→1→0→1→6 | node(6) |

**Result:** `1→0→1→6` ✅

---

### 4.7 Dry Run — Edge Case: Last Group Truncated to Even

**Input:** `head = [1,2,3,4,5,6,7]` (n=7)

Groups expected: 1, 2, 3, 4 → but only 1 node left for group 4.

| Group g | count = min(g, remaining) | Even? | Action | prevTail after |
|---------|---------------------------|-------|--------|----------------|
| 1 | 1 | No | skip | node(1) |
| 2 | 2 | Yes | reverse [2,3] → [3,2] | node(2) |
| 3 | 3 | No | skip | node(5) |
| 4 | min(4,1) = 1 | No | skip | node(7) |

**Result:** `1→3→2→4→5→6→7` (only group 2 reversed) ✅

---

### 4.8 Time & Space Complexity

| Metric | Value | Derivation |
|--------|-------|------------|
| **Time** | **O(n)** | Each node is visited at most twice: once during the count phase, once during reversal/skip. Total work across all groups: Σ min(g, remaining) = n for counting, plus at most n for reversals. |
| **Space** | **O(1)** | Only pointer variables: dummy, prevTail, tail, moveNode, temp. No arrays. |

**Practical performance:** With n ≤ 10⁵, this runs in well under 1ms. The constant factor is minimal since we only use pointer swaps.

### 4.9 Comparison of All Approaches

| Approach | Time | Space | Passes | Reversal Method |
|----------|------|-------|--------|-----------------|
| Brute-force (array) | O(n) | O(n) | 2 | Value swap in array |
| Per-group collection | O(n) | O(√n) | 1 | Value swap via node refs |
| **In-place pointer reversal** | **O(n)** | **O(1)** | **1** | **Head insertion (pointer surgery)** |

---

## 5. Edge Cases

| Input | Expected | Why |
|-------|----------|-----|
| `[1]` | `[1]` | Single node, group 1 has length 1 (odd) |
| `[0,4]` | `[0,4]` | Group 1: [0] (odd→skip), Group 2: [4] actual len=1 (odd→skip) |
| `[1,2,3]` | `[1,3,2]` | Group 1: [1] skip, Group 2: [2,3] even→reverse |
| `[1,2,3,4,5,6]` | `[1,3,2,4,5,6]` | Group 1: [1] skip, Group 2: [2,3] reverse, Group 3: [4,5,6] skip |

---

## 6. Interview-Ready Verbal Explanation (60–90 seconds)

> "I process the list group by group, where group g should have g nodes. I use a `prevTail` pointer that tracks the last node of the previous group — this is my 'hook' for stitching in reversals.
>
> For each group, I first count how many nodes actually exist (the last group might be shorter). If the actual count is even, I reverse the group in-place using head insertion: I save the first node as `tail`, then repeatedly extract the node after `tail` and insert it right after `prevTail`. After reversal, `tail` naturally becomes the last node, so I set `prevTail = tail`.
>
> If the count is odd, I simply advance `prevTail` forward by `count` nodes.
>
> It's O(n) time — each node is counted once and manipulated at most once. O(1) space — just a handful of pointers. The dummy node handles the edge case where group 1 gets reversed (won't happen since length 1 is odd, but it keeps the code uniform)."

---

## 7. Visual Diagram — Group Processing Flow

```
Input: [5, 2, 6, 3, 9, 1, 7, 3, 8, 4]

Groups:  |1|  |2 |  |3    |  |4          |
         [5] [2,6] [3,9,1] [7,3,8,4]
Len:      1    2     3       4
Even?:    ✗    ✓     ✗       ✓

Processing:
  Group 1 (len=1, odd):  [5]       → skip    → [5]
  Group 2 (len=2, even): [2,6]     → reverse → [6,2]
  Group 3 (len=3, odd):  [3,9,1]   → skip    → [3,9,1]
  Group 4 (len=4, even): [7,3,8,4] → reverse → [4,8,3,7]

Result: [5, 6, 2, 3, 9, 1, 4, 8, 3, 7]

Head Insertion Detail (Group 4):
  prevTail = node(1)

  Start:   ...1 → [7] → 3 → 8 → 4 → null
                   tail

  i=0:     ...1 → [3] → [7] → 8 → 4    (move 3 to front)
  i=1:     ...1 → [8] → 3 → [7] → 4    (move 8 to front)
  i=2:     ...1 → [4] → 8 → 3 → [7]    (move 4 to front)
                                  tail=prevTail

  3 pointer moves per iteration:
  ┌────────────────────────────────────────────┐
  │  tail.next     = moveNode.next   (bypass)  │
  │  moveNode.next = prevTail.next   (link)    │
  │  prevTail.next = moveNode        (front)   │
  └────────────────────────────────────────────┘
```

---

*Guide complete. Three approaches — array extraction O(n)/O(n), per-group node collection O(n)/O(√n), and in-place pointer reversal O(n)/O(1) — with the optimal approach reusing the head insertion technique from LeetCode 92, processing each group with a count phase followed by an optional reversal phase.*
