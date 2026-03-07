# 92. Reverse Linked List II — From Brute-Force to Optimal (In-Place One-Pass)

---

## 1. High-Level Interpretation

**What the problem asks:** Given a singly linked list and two 1-indexed positions `left` and `right`, reverse only the nodes from position `left` to position `right` (inclusive), leaving the rest of the list intact, and return the head.

**Why it matters:** This tests your ability to manipulate linked list pointers precisely under partial-range constraints. It's a staple "pointer surgery" interview question at FAANG. Unlike reversing an entire list, you must carefully reconnect the reversed segment to both its predecessor and successor.

**Hidden traps:**
- **left = 1:** The head itself may change. You need a sentinel/dummy node or special handling.
- **left = right:** No actual reversal needed (single node "reversed" is itself). Must handle gracefully.
- **Off-by-one on positions:** Positions are 1-indexed, not 0-indexed. Counting to the right node requires care.
- **Reconnection:** After reversing the middle segment, you must stitch 4 boundaries: the node before `left` → new start of reversed segment, and the old start of reversed segment (now tail) → the node after `right`.

---

## 2. Brute-Force Approach — Extract to Array, Reverse, Rebuild

### 2.1 Idea in Plain Words

Walk the entire list, copy all node values into an array. Reverse the subarray from index `left-1` to `right-1`. Then walk the list again and overwrite each node's value from the array. This avoids pointer manipulation entirely.

### 2.2 Pseudocode

```
function reverseBetween(head, left, right):
    // Step 1: Extract values
    vals = []
    node = head
    while node != null:
        vals.push(node.val)
        node = node.next

    // Step 2: Reverse the subarray in-place
    i = left - 1, j = right - 1
    while i < j:
        swap(vals[i], vals[j])
        i++; j--

    // Step 3: Write values back to nodes
    node = head
    idx = 0
    while node != null:
        node.val = vals[idx]
        idx++
        node = node.next

    return head
```

### 2.3 JavaScript Implementation

```javascript
function reverseBetween(head, left, right) {
    const vals = [];
    let node = head;
    while (node) { vals.push(node.val); node = node.next; }

    let i = left - 1, j = right - 1;
    while (i < j) {
        [vals[i], vals[j]] = [vals[j], vals[i]];
        i++; j--;
    }

    node = head;
    let idx = 0;
    while (node) { node.val = vals[idx++]; node = node.next; }

    return head;
}
```

### 2.4 Time & Space Complexity

| Metric | Value | Derivation |
|--------|-------|------------|
| **Time** | **O(n)** | Two full traversals of the list (extract + write-back), plus O(right − left) for the subarray reversal. |
| **Space** | **O(n)** | The `vals` array stores all n node values. |

### 2.5 Dry Run

**Input:** `head = [1,2,3,4,5]`, `left = 2`, `right = 4`

| Step | Action | vals | List |
|------|--------|------|------|
| 1 | Extract all values | `[1,2,3,4,5]` | 1→2→3→4→5 |
| 2 | Reverse vals[1..3]: swap(1,3) | `[1,4,3,2,5]` | — |
| 3 | Write back to list | — | 1→4→3→2→5 |

**Result:** `[1,4,3,2,5]` ✅

### 2.6 Why This Is Not Ideal

- **O(n) extra space** — wasteful when we only need to reverse a segment in-place.
- **Modifies values, not structure** — many interviewers specifically ask you to reverse the links, not overwrite values (since in real systems, nodes may carry complex data).
- The problem is a "pointer manipulation" exercise; this sidesteps the core challenge.

---

## 3. Improved Approach — Two-Pass In-Place Reversal

### 3.1 What Changed & Why

Instead of copying values, we manipulate the `next` pointers directly:
1. **Pass 1 (Navigate):** Walk to node `left-1` (the node just before the reversal zone). Call it `pre`.
2. **Pass 2 (Reverse):** Starting from `pre.next`, reverse `right - left + 1` nodes using the standard three-pointer reversal (prev, curr, next).
3. **Reconnect:** Stitch `pre.next` to the new head of the reversed segment, and the old head (now tail) to the node after the reversed segment.

A **dummy node** before `head` simplifies edge cases where `left = 1`.

### 3.2 Pseudocode

```
function reverseBetween(head, left, right):
    dummy = new ListNode(0, head)
    pre = dummy

    // Step 1: Move pre to position (left - 1)
    for i = 1 to left - 1:
        pre = pre.next

    // Step 2: Reverse (right - left + 1) nodes starting from pre.next
    prev = null
    curr = pre.next
    for i = 0 to (right - left):
        next = curr.next
        curr.next = prev
        prev = curr
        curr = next

    // Step 3: Reconnect
    // pre.next is the old head of reversed segment (now the TAIL)
    pre.next.next = curr    // tail → node after reversed segment
    pre.next = prev         // pre → new head of reversed segment

    return dummy.next
```

### 3.3 JavaScript Implementation

```javascript
function reverseBetween(head, left, right) {
    const dummy = new ListNode(0, head);
    let pre = dummy;

    // Navigate to the node just before 'left'
    for (let i = 1; i < left; i++) pre = pre.next;

    // Reverse 'right - left + 1' nodes
    let prev = null, curr = pre.next;
    for (let i = 0; i <= right - left; i++) {
        const next = curr.next;
        curr.next = prev;
        prev = curr;
        curr = next;
    }

    // Reconnect
    pre.next.next = curr;  // old left-node (now tail) → node after right
    pre.next = prev;       // pre → old right-node (now head of reversed)

    return dummy.next;
}
```

### 3.4 Time & Space Complexity

| Metric | Value | Derivation |
|--------|-------|------------|
| **Time** | **O(n)** | At most `left-1` steps to navigate + `right-left+1` steps to reverse = at most `n` steps total. |
| **Space** | **O(1)** | Only a fixed number of pointers: dummy, pre, prev, curr, next. |

### 3.5 Dry Run

**Input:** `head = [1,2,3,4,5]`, `left = 2`, `right = 4`

**Step 1: Navigate to pre (position left-1 = 1)**

| i | pre |
|---|-----|
| start | dummy(0) |
| i=1 | node(1) |

Now: `pre = node(1)`, `pre.next = node(2)`

**Step 2: Reverse 3 nodes (right-left+1 = 3)**

| i | curr | next | Action | prev | curr after |
|---|------|------|--------|------|------------|
| 0 | node(2) | node(3) | 2→null | node(2) | node(3) |
| 1 | node(3) | node(4) | 3→2 | node(3) | node(4) |
| 2 | node(4) | node(5) | 4→3 | node(4) | node(5) |

Now: `prev = node(4)` (new head), `curr = node(5)` (first node after reversed segment)

**Step 3: Reconnect**

- `pre.next` is still `node(2)` (old left, now tail) → `pre.next.next = curr` → `node(2).next = node(5)`
- `pre.next = prev` → `node(1).next = node(4)`

**Final list:** `1 → 4 → 3 → 2 → 5` ✅

### 3.6 Trade-Offs

| Pros | Cons |
|------|------|
| O(1) space — true in-place reversal | Conceptually two passes: one to navigate, one to reverse |
| Clean separation of navigate + reverse + reconnect | Need to save `pre.next` before overwriting it |
| Easy to understand step-by-step | Requires a dummy node for left=1 edge case |

---

## 4. Optimal / Best Approach — One-Pass "Head Insertion" Method

### 4.1 Intuition

Instead of reversing the entire sublist at once, we **build the reversal incrementally** as we scan:

1. Navigate to `pre` (the node just before position `left`). Let `tail` = `pre.next` — this is the node at position `left`, which will become the **tail** of the reversed segment.
2. For each subsequent node in the reversal zone, **extract it** from its current position and **insert it right after `pre`** (at the front of the growing reversed segment).

After `right - left` such insertions, the segment is reversed. The beauty: we never go back — it's a **single left-to-right pass**.

### 4.2 How It Works — Visual

```
Initial:   ... → pre → [2] → [3] → [4] → [5] → ...
                         tail

Step 1: Extract [3], insert after pre:
           ... → pre → [3] → [2] → [4] → [5] → ...
                                tail ──┘

Step 2: Extract [4], insert after pre:
           ... → pre → [4] → [3] → [2] → [5] → ...
                                     tail ──┘

Done! Reversed segment: 4 → 3 → 2, tail.next = 5
```

**Key pointer moves per iteration:**
```
tail.next = moveNode.next     // bypass moveNode
moveNode.next = pre.next      // moveNode points to current front
pre.next = moveNode           // pre now points to moveNode (new front)
```

### 4.3 Pseudocode

```
function reverseBetween(head, left, right):
    dummy = new ListNode(0, head)
    pre = dummy

    // Navigate to position left - 1
    for i = 1 to left - 1:
        pre = pre.next

    tail = pre.next    // node at position left (will be tail of reversed)

    // Perform right - left insertions
    for i = 0 to (right - left - 1):
        moveNode = tail.next          // the node to extract
        tail.next = moveNode.next     // bypass moveNode
        moveNode.next = pre.next      // moveNode → current front of reversed
        pre.next = moveNode           // pre → moveNode (new front)

    return dummy.next
```

### 4.4 JavaScript Implementation

```javascript
function reverseBetween(head, left, right) {
    const dummy = new ListNode(0, head);
    let pre = dummy;

    for (let i = 1; i < left; i++) pre = pre.next;

    const tail = pre.next;  // will become tail of reversed segment

    for (let i = 0; i < right - left; i++) {
        const moveNode = tail.next;
        tail.next = moveNode.next;
        moveNode.next = pre.next;
        pre.next = moveNode;
    }

    return dummy.next;
}
```

### 4.5 Correctness Proof

**Loop invariant:** After `k` iterations of the insertion loop (k = 0 .. right−left−1):
- `pre.next` points to the node that was originally at position `left + k` (the new front).
- The reversed segment `pre.next → ... → tail` contains the first `k+1` nodes of the original `[left..right]` range in reversed order.
- `tail.next` points to the node originally at position `left + k + 1`.

**Base case (k=0):** Before any iterations, `pre.next = tail = node at position left`. The "reversed segment" has 1 node. ✓

**Inductive step:** On iteration `k`, we extract `moveNode = tail.next` (originally at position `left+k+1`), place it at `pre.next`. Now the reversed segment has `k+2` nodes in reversed order, and `tail.next` advances to the next unprocessed node. ✓

**Termination:** After `right − left` iterations, the reversed segment contains all `right − left + 1` nodes from the original range in reversed order. `tail.next` correctly points to the node originally at position `right + 1` (or null). ✓

### 4.6 Dry Run — Example 1

**Input:** `head = [1,2,3,4,5]`, `left = 2`, `right = 4`

**Navigate:** `pre = node(1)`, `tail = node(2)`

| i | moveNode | tail.next = | moveNode.next = | pre.next = | List state |
|---|----------|-------------|-----------------|------------|------------|
| — | — | — | — | — | D→1→2→3→4→5 |
| 0 | node(3) | node(4) | node(2) | node(3) | D→1→**3→2**→4→5 |
| 1 | node(4) | node(5) | node(3) | node(4) | D→1→**4→3→2**→5 |

**Final:** `dummy.next` → `1 → 4 → 3 → 2 → 5` ✅

---

### 4.7 Dry Run — Edge Case: left = 1

**Input:** `head = [1,2,3,4,5]`, `left = 1`, `right = 3`

**Navigate:** `pre = dummy(0)`, `tail = node(1)`

| i | moveNode | Operation | List state |
|---|----------|-----------|------------|
| 0 | node(2) | Extract 2, insert after dummy | D→**2→1**→3→4→5 |
| 1 | node(3) | Extract 3, insert after dummy | D→**3→2→1**→4→5 |

**Final:** `dummy.next` → `3 → 2 → 1 → 4 → 5` ✅ (head changed from 1 to 3)

---

### 4.8 Dry Run — Edge Case: left = right

**Input:** `head = [5]`, `left = 1`, `right = 1`

- `pre = dummy`, `tail = node(5)`
- Loop runs `right - left = 0` times → no operations.
- Return `dummy.next` = `node(5)` ✅

---

### 4.9 Time & Space Complexity

| Metric | Value | Derivation |
|--------|-------|------------|
| **Time** | **O(n)** | Navigate: `left − 1` steps. Insertion loop: `right − left` steps. Total ≤ `right − 1 ≤ n − 1` = O(n). |
| **Space** | **O(1)** | Only pointers: dummy, pre, tail, moveNode. No arrays, no recursion. |

**Practical performance:** With n ≤ 500, this runs in microseconds. The single-pass nature means minimal cache misses.

### 4.10 Comparison of All Approaches

| Approach | Time | Space | Passes | Key Idea |
|----------|------|-------|--------|----------|
| Brute-force (array) | O(n) | O(n) | 2 | Copy values, reverse subarray, copy back |
| Two-pass in-place | O(n) | O(1) | ~2 | Navigate to pre, then standard 3-pointer reversal |
| **One-pass head insertion** | **O(n)** | **O(1)** | **1** | **Extract + insert at front, one node at a time** |

---

## 5. Edge Cases

| Input | Expected | Why |
|-------|----------|-----|
| `[5]`, left=1, right=1 | `[5]` | Single node, no reversal needed |
| `[1,2]`, left=1, right=2 | `[2,1]` | Head changes |
| `[1,2,3,4,5]`, left=1, right=5 | `[5,4,3,2,1]` | Full list reversal |
| `[1,2,3]`, left=2, right=2 | `[1,2,3]` | Single-node "segment" — unchanged |
| `[3,5]`, left=1, right=2 | `[5,3]` | Two-element reversal at head |

---

## 6. Interview-Ready Verbal Explanation (60–90 seconds)

> "I use a dummy node to handle the edge case where `left = 1`. I walk to the node just before position `left` — call it `pre`. The node at position `left` will become the tail of the reversed segment, so I save it as `tail`.
>
> Then I do `right - left` iterations. In each iteration, I take the node right after `tail`, extract it by bypassing it in the list, and insert it right after `pre` — at the front of the growing reversed segment.
>
> After all iterations, the segment `[left..right]` is reversed in-place, with `tail.next` naturally pointing to the node after position `right`.
>
> It's O(n) time because I traverse at most `right - 1` nodes. O(1) space — just a few pointers, no extra data structures. And it's a single pass."

---

## 7. Visual Diagram — One-Pass Head Insertion

```
Example: [1, 2, 3, 4, 5], left=2, right=4

SETUP:
  dummy → 1 → 2 → 3 → 4 → 5 → null
          pre  tail

ITERATION 0 (move node 3):
  moveNode = tail.next = [3]

  ① tail.next = moveNode.next        tail bypasses [3]
      dummy → 1 → 2 ──→ 4 → 5
                   tail   ↑
             [3] ────────┘ (still points to 4)

  ② moveNode.next = pre.next         [3] → [2]
  ③ pre.next = moveNode              [1] → [3]

  Result:
      dummy → 1 → 3 → 2 → 4 → 5
              pre       tail

ITERATION 1 (move node 4):
  moveNode = tail.next = [4]

  ① tail.next = moveNode.next        tail bypasses [4]
      dummy → 1 → 3 → 2 ──→ 5
                        tail
  ② moveNode.next = pre.next         [4] → [3]
  ③ pre.next = moveNode              [1] → [4]

  Result:
      dummy → 1 → 4 → 3 → 2 → 5
              pre            tail

FINAL: [1, 4, 3, 2, 5] ✅

The 3 pointer moves per iteration:
  ┌──────────────────────────────────────────┐
  │  tail.next     = moveNode.next  (bypass) │
  │  moveNode.next = pre.next       (link)   │
  │  pre.next      = moveNode       (front)  │
  └──────────────────────────────────────────┘
  pre and tail NEVER move — only moveNode changes.
```

---

*Guide complete. Three approaches — array extraction O(n)/O(n), two-pass in-place reversal O(n)/O(1), and one-pass head insertion O(n)/O(1) — with the optimal approach performing exactly 3 pointer reassignments per iteration, using a dummy node to unify edge cases.*
