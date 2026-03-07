# 25. Reverse Nodes in k-Group — From Brute-Force to Optimal (O(1) Space)

---

## 1. High-Level Interpretation

**What the problem asks:** Given a singly linked list and an integer `k`, reverse every consecutive group of `k` nodes. If the final group has fewer than `k` nodes, leave it unchanged. You must rearrange the *nodes themselves* — swapping values is not allowed.

**Why it matters:** This is a flagship hard linked-list problem that tests your ability to manage multiple pointers, handle boundary conditions, and connect reversed segments back together. It combines "reverse a sub-list" with "group identification" and "boundary stitching."

**Hidden traps:**
- **The last group:** If the remaining nodes are < k, you must leave them alone. You need to *check first* before reversing.
- **Reconnecting groups:** After reversing a group, the old head becomes the new tail. You must connect the *previous group's tail* → *current group's new head*, and *current group's new tail* → *next group's head*.
- **Off-by-one:** The boundary pointers (`groupPrev`, `groupNext`) are extremely easy to get wrong.
- **k = 1:** No reversal — the list should be returned as-is. Must work without special-casing.
- **k = n:** Reverse the entire list.

---

## 2. Brute-Force Approach — Extract to Array, Reverse Groups, Rebuild

### 2.1 Idea in Plain Words

Walk the entire list and copy all values into an array. In the array, reverse every consecutive block of `k` elements (skip the final block if it has fewer than `k`). Then walk the original list again and overwrite each node's `.val` with the rearranged values.

> **Note:** This technically violates the constraint "do not alter the values." We use it only to understand the grouping logic before moving to in-place solutions.

### 2.2 Pseudocode

```
function reverseKGroup(head, k):
    // Step 1: Extract values
    values = []
    curr = head
    while curr != null:
        values.push(curr.val)
        curr = curr.next

    // Step 2: Reverse groups of k in the array
    n = values.length
    for i = 0 to n-1 step k:
        if i + k <= n:             // only if full group
            reverse values[i..i+k-1]

    // Step 3: Write back
    curr = head; idx = 0
    while curr != null:
        curr.val = values[idx++]
        curr = curr.next

    return head
```

### 2.3 JavaScript Implementation

```javascript
function reverseKGroup(head, k) {
    const values = [];
    let curr = head;
    while (curr) { values.push(curr.val); curr = curr.next; }

    const n = values.length;
    for (let i = 0; i + k <= n; i += k) {
        let l = i, r = i + k - 1;
        while (l < r) {
            [values[l], values[r]] = [values[r], values[l]];
            l++; r--;
        }
    }

    curr = head; let idx = 0;
    while (curr) { curr.val = values[idx++]; curr = curr.next; }
    return head;
}
```

### 2.4 Time & Space Complexity

| Metric | Value | Derivation |
|--------|-------|------------|
| **Time** | **O(n)** | Extract O(n) + reverse groups O(n) + write back O(n) = O(n). |
| **Space** | **O(n)** | `values[]` array stores all n values. |

### 2.5 Dry Run

**Input:** `head = [1,2,3,4,5]`, `k = 2`

**Step 1:** `values = [1,2,3,4,5]`, `n = 5`

**Step 2:** Reverse groups of 2:

| i | Range | Full group? | Action | values |
|---|-------|------------|--------|--------|
| 0 | [0,1] | 0+2≤5 ✓ | swap(1,2) | [**2,1**,3,4,5] |
| 2 | [2,3] | 2+2≤5 ✓ | swap(3,4) | [2,1,**4,3**,5] |
| 4 | [4,4] | 4+2≤5 ✗ | skip | [2,1,4,3,**5**] |

**Step 3:** Write back → `[2,1,4,3,5]` ✅

### 2.6 Dry Run — Example 2

**Input:** `head = [1,2,3,4,5]`, `k = 3`

`values = [1,2,3,4,5]`, `n = 5`

| i | Range | Full group? | Action | values |
|---|-------|------------|--------|--------|
| 0 | [0,2] | 0+3≤5 ✓ | reverse(1,2,3) | [**3,2,1**,4,5] |
| 3 | [3,4] | 3+3≤5 ✗ | skip | [3,2,1,**4,5**] |

**Output:** `[3,2,1,4,5]` ✅

### 2.7 Why Not Ideal

- **O(n) extra space** for the values array.
- **Alters values** — violates the problem constraint.
- Doesn't demonstrate the pointer manipulation interviewers want.

---

## 3. Improved Approach — Recursive Reversal

### 3.1 What Changed & Why

Instead of extracting to an array, we reverse each k-group **in-place** using a recursive approach:

1. **Check:** Does the current position have at least `k` nodes ahead? If not, return `head` unchanged.
2. **Reverse:** Reverse the first `k` nodes (standard iterative linked-list reversal).
3. **Recurse:** After reversal, the old head is now the tail of this group. Set `oldHead.next = reverseKGroup(nextGroupHead, k)` to handle the rest.
4. **Return:** The new head of this reversed group.

This uses the **call stack** for O(n/k) recursion depth.

### 3.2 Pseudocode

```
function reverseKGroup(head, k):
    // Check if k nodes exist
    curr = head
    count = 0
    while curr != null AND count < k:
        curr = curr.next
        count++
    if count < k:
        return head    // not enough nodes, leave as-is

    // Reverse first k nodes
    prev = null, curr = head
    for i = 0 to k-1:
        next = curr.next
        curr.next = prev
        prev = curr
        curr = next

    // head is now the tail of this group
    // curr points to the start of the next group
    head.next = reverseKGroup(curr, k)

    return prev    // prev is the new head of this group
```

### 3.3 JavaScript Implementation

```javascript
function reverseKGroup(head, k) {
    // Check if k nodes exist
    let check = head, count = 0;
    while (check && count < k) { check = check.next; count++; }
    if (count < k) return head;

    // Reverse first k nodes
    let prev = null, curr = head;
    for (let i = 0; i < k; i++) {
        const next = curr.next;
        curr.next = prev;
        prev = curr;
        curr = next;
    }

    // Recurse for the rest; head is now the tail of this group
    head.next = reverseKGroup(curr, k);

    return prev; // new head of this reversed group
}
```

### 3.4 Time & Space Complexity

| Metric | Value | Derivation |
|--------|-------|------------|
| **Time** | **O(n)** | Each node is visited at most twice: once for the k-check, once for reversal. ⌊n/k⌋ groups × k work each = O(n). |
| **Space** | **O(n/k)** | Recursion depth = number of groups = ⌊n/k⌋. Each frame uses O(1) → O(n/k) stack space. |

### 3.5 Dry Run

**Input:** `head = [1,2,3,4,5]`, `k = 2`

**Call 1:** `reverseKGroup(1→2→3→4→5, 2)`
- Check: count from node(1), reaches 2 → enough ✓
- Reverse 2 nodes: `1→2` becomes `2→1`
  - `prev=null, curr=1`: next=2, 1.next=null, prev=1, curr=2
  - `prev=1, curr=2`: next=3, 2.next=1, prev=2, curr=3
- `prev=2` (new head), `curr=3` (next group start)
- `head(1).next = reverseKGroup(3→4→5, 2)`

**Call 2:** `reverseKGroup(3→4→5, 2)`
- Check: count from node(3), reaches 2 → enough ✓
- Reverse: `3→4` becomes `4→3`
- `head(3).next = reverseKGroup(5, 2)`

**Call 3:** `reverseKGroup(5, 2)`
- Check: count from node(5), only 1 < 2 → return `5` unchanged

**Unwinding:**
- Call 2: `3.next = 5` → group is `4→3→5`, return `4`
- Call 1: `1.next = 4` → list is `2→1→4→3→5`, return `2`

**Output:** `[2,1,4,3,5]` ✅

### 3.6 Dry Run — Example 2

**Input:** `head = [1,2,3,4,5]`, `k = 3`

**Call 1:** Check 3 nodes from 1 → ✓. Reverse `1→2→3`:
- 1.next=null, 2.next=1, 3.next=2 → `3→2→1`, prev=3, curr=4
- `head(1).next = reverseKGroup(4→5, 3)`

**Call 2:** Check 3 nodes from 4 → only 2, return `4→5` unchanged.

**Unwinding:** `1.next = 4` → list is `3→2→1→4→5`

**Output:** `[3,2,1,4,5]` ✅

### 3.7 Trade-offs

| Pros | Cons |
|------|------|
| In-place reversal — no value swapping | O(n/k) stack space from recursion |
| Clean, elegant code | Hard to debug stack-based logic |
| Handles the "leave last group" rule naturally | Not O(1) space |

---

## 4. Optimal / Best Approach — Iterative with Dummy Node (O(1) Space)

### 4.1 Intuition

We replicate the recursive logic iteratively using a **dummy node** and careful pointer management:

1. **Dummy node:** Insert a dummy node before `head`. This handles edge cases where the first group's head changes.
2. **groupPrev:** Always points to the node *just before* the current group. Initially it's `dummy`.
3. **For each group:**
   - Walk `k` nodes ahead to verify the group exists. If not, stop.
   - **Reverse** the `k` nodes in-place (standard prev/curr reversal).
   - **Reconnect:** `groupPrev.next` → new head of reversed group; old head (now tail) → first node of next group.
   - **Advance:** `groupPrev` = old head (which is now the tail).

**Why it works:** At each iteration, `groupPrev` is the last node of the already-processed portion. We reverse the next `k` nodes and stitch them in. No recursion, no extra data structures.

### 4.2 Pseudocode

```
function reverseKGroup(head, k):
    dummy = new ListNode(0)
    dummy.next = head
    groupPrev = dummy

    while true:
        // Check if k nodes exist after groupPrev
        kth = groupPrev
        for i = 0 to k-1:
            kth = kth.next
            if kth == null: return dummy.next    // fewer than k, done

        groupNext = kth.next    // save start of next group

        // Reverse k nodes: from groupPrev.next to kth
        prev = groupNext        // after reversal, tail points to groupNext
        curr = groupPrev.next
        for i = 0 to k-1:
            next = curr.next
            curr.next = prev
            prev = curr
            curr = next

        // Reconnect
        tail = groupPrev.next   // old head = new tail
        groupPrev.next = prev   // prev = new head (kth node)

        // Advance
        groupPrev = tail
```

### 4.3 JavaScript Implementation

```javascript
function reverseKGroup(head, k) {
    const dummy = new ListNode(0);
    dummy.next = head;
    let groupPrev = dummy;

    while (true) {
        // Find the kth node from groupPrev
        let kth = groupPrev;
        for (let i = 0; i < k; i++) {
            kth = kth.next;
            if (!kth) return dummy.next; // fewer than k nodes remain
        }

        const groupNext = kth.next; // first node of next group

        // Reverse the group: curr starts at groupPrev.next
        let prev = groupNext; // tail of reversed group points to groupNext
        let curr = groupPrev.next;
        for (let i = 0; i < k; i++) {
            const next = curr.next;
            curr.next = prev;
            prev = curr;
            curr = next;
        }

        // Reconnect: groupPrev → new head, advance groupPrev to new tail
        const tail = groupPrev.next; // the old head is now the tail
        groupPrev.next = prev;       // prev is the new head (was kth)
        groupPrev = tail;            // advance for next iteration
    }
}
```

### 4.4 Correctness Proof

**Loop invariant:** At the start of each iteration, `groupPrev` is the last node of the fully processed (reversed) portion. All nodes before `groupPrev.next` are in their final correct positions.

**Per iteration:**

1. **k-check:** We verify `k` nodes exist after `groupPrev`. If not, we return — the remaining < k nodes stay unchanged. ✓
2. **Reversal:** We reverse exactly `k` nodes using standard iterative reversal. The key trick: we initialize `prev = groupNext` so that after reversal, the old first node (now tail) automatically points to `groupNext`. ✓
3. **Reconnection:** `groupPrev.next = prev` links the previous section to the new head. `tail` (old first node) is now the last node of this group. ✓
4. **Progress:** `groupPrev = tail` advances past the processed group, maintaining the invariant. ✓

**Termination:** Each iteration processes exactly `k` nodes, so after ⌊n/k⌋ iterations, we've processed all complete groups. The k-check terminates the loop for any remaining nodes. ✓

### 4.5 Dry Run — Example 1

**Input:** `head = [1,2,3,4,5]`, `k = 2`

```
Initial: dummy → 1 → 2 → 3 → 4 → 5
         groupPrev = dummy
```

**Iteration 1:**

| Step | Action | State |
|------|--------|-------|
| k-check | Walk 2 from dummy → kth = node(2) | kth = 2, groupNext = 3 |
| Reverse | prev=3, curr=1 | |
| | i=0: next=2, 1.next=3, prev=1, curr=2 | 1→3 |
| | i=1: next=3, 2.next=1, prev=2, curr=3 | 2→1→3 |
| Reconnect | tail = dummy.next = node(1) | |
| | dummy.next = prev = node(2) | dummy→**2→1**→3→4→5 |
| Advance | groupPrev = node(1) | |

```
After: dummy → 2 → 1 → 3 → 4 → 5
                    ↑ groupPrev
```

**Iteration 2:**

| Step | Action | State |
|------|--------|-------|
| k-check | Walk 2 from node(1) → kth = node(4) | kth = 4, groupNext = 5 |
| Reverse | prev=5, curr=3 | |
| | i=0: next=4, 3.next=5, prev=3, curr=4 | 3→5 |
| | i=1: next=5, 4.next=3, prev=4, curr=5 | 4→3→5 |
| Reconnect | tail = node(1).next = node(3) | |
| | node(1).next = node(4) | ...1→**4→3**→5 |
| Advance | groupPrev = node(3) | |

```
After: dummy → 2 → 1 → 4 → 3 → 5
                              ↑ groupPrev
```

**Iteration 3:**

| Step | Action | State |
|------|--------|-------|
| k-check | Walk 2 from node(3) → only 1 node (5) | kth = null! Return. |

**Output:** `[2,1,4,3,5]` ✅

### 4.6 Dry Run — Example 2

**Input:** `head = [1,2,3,4,5]`, `k = 3`

```
Initial: dummy → 1 → 2 → 3 → 4 → 5
         groupPrev = dummy
```

**Iteration 1:**

| Step | Detail |
|------|--------|
| k-check | Walk 3: dummy→1→2→3, kth=3, groupNext=4 |
| Reverse | prev=4, curr=1 |
| i=0 | next=2, 1.next=4, prev=1, curr=2 |
| i=1 | next=3, 2.next=1, prev=2, curr=3 |
| i=2 | next=4, 3.next=2, prev=3, curr=4 |
| Reconnect | tail=node(1), dummy.next=node(3) |
| Advance | groupPrev=node(1) |

```
After: dummy → 3 → 2 → 1 → 4 → 5
                         ↑ groupPrev
```

**Iteration 2:**

| Step | Detail |
|------|--------|
| k-check | Walk 3 from node(1): 1→4→5→null. Only 2! Return. |

**Output:** `[3,2,1,4,5]` ✅

### 4.7 Time & Space Complexity

| Metric | Value | Derivation |
|--------|-------|------------|
| **Time** | **O(n)** | Each node visited at most 2× per group: once for k-check, once for reversal. ⌊n/k⌋ groups × k = O(n). |
| **Space** | **O(1)** | Only pointer variables: `dummy`, `groupPrev`, `kth`, `groupNext`, `prev`, `curr`, `next`, `tail`. No recursion, no arrays. |

**Practical performance:** With n ≤ 5000, this runs in microseconds. Zero allocations beyond the dummy node.

### 4.8 Comparison of All Approaches

| Approach | Time | Space | Alters Values? | Technique |
|----------|------|-------|---------------|-----------|
| Array extract + rebuild | O(n) | O(n) | Yes ❌ | Array reversal |
| Recursive in-place | O(n) | O(n/k) | No ✓ | Recursion + reversal |
| **Iterative + dummy node** | **O(n)** | **O(1)** | **No ✓** | **Iterative reversal + stitching** |

---

## 5. Edge Cases

| Input | Expected | Why |
|-------|----------|-----|
| `head = [1], k = 1` | `[1]` | k=1 → no reversal needed |
| `head = [1,2], k = 2` | `[2,1]` | Entire list is one group |
| `head = [1,2,3], k = 4` | `[1,2,3]` | k > n → no reversal |
| `head = [1,2,3,4], k = 2` | `[2,1,4,3]` | Even split, all groups reversed |
| `head = [1,2,3,4,5,6], k = 3` | `[3,2,1,6,5,4]` | Two full groups, none left over |

---

## 6. Interview-Ready Verbal Explanation (60–90 seconds)

> "I use an iterative approach with a dummy node. I maintain a pointer `groupPrev` that always points to the node just before the current group.
>
> For each group, I first walk `k` steps to verify the group exists. If fewer than `k` nodes remain, I'm done.
>
> If the group is valid, I reverse its `k` nodes in-place using the standard prev/curr technique. The trick is I initialize `prev` to `groupNext` — the first node *after* the group — so after reversal, the tail naturally points to the next group.
>
> Then I reconnect: `groupPrev.next` points to the new head, and I advance `groupPrev` to the new tail (which is the old head before reversal).
>
> This runs in O(n) time — each node is visited at most twice — and O(1) space — just pointer variables, no recursion, no arrays."

---

## 7. Visual Diagram

```
Input: [1] → [2] → [3] → [4] → [5],  k = 2

Step 1: dummy → [1] → [2] → [3] → [4] → [5]
        gP=dummy       kth=2       gN=3

        Reverse [1,2] with prev starting at gN=3:
          1.next → 3,  2.next → 1
          Result: [2] → [1] → [3] → [4] → [5]

        Reconnect: dummy.next = 2
        Advance:   gP = 1

Step 2: dummy → [2] → [1] → [3] → [4] → [5]
                        gP         kth=4  gN=5

        Reverse [3,4] with prev starting at gN=5:
          3.next → 5,  4.next → 3
          Result: [4] → [3] → [5]

        Reconnect: 1.next = 4
        Advance:   gP = 3

Step 3: dummy → [2] → [1] → [4] → [3] → [5]
                                     gP    only 1 node → STOP

Output: [2] → [1] → [4] → [3] → [5]  ✅


The "prev = groupNext" trick visualized:

  Before reversal of [1, 2]:
    prev = 3 (groupNext)
    curr = 1

  After reversal:
    [2] → [1] → [3]     ← tail (node 1) automatically points to 3!
     ↑ new head = prev

  This eliminates a separate "connect tail to next group" step.
```

---

*Guide complete. The optimal solution's key insight is the `prev = groupNext` initialization during reversal — this makes the reversed group's tail automatically point to the next group, avoiding a separate reconnection step. Combined with the dummy node and `groupPrev` tracking, we get clean O(1) space iterative reversal.*
