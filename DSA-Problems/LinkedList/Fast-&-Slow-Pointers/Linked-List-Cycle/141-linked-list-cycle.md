# 141. Linked List Cycle — From Brute-Force to Floyd's Tortoise & Hare

---

## 1. High-Level Interpretation

**What the problem asks:** Given the head of a linked list, determine whether the list contains a cycle — a node whose `next` pointer connects back to a previous node, creating an infinite loop. Return `true` if a cycle exists, `false` otherwise.

**Why it matters:** Cycle detection is fundamental in computer science. It appears in deadlock detection, infinite loop detection, finding loops in graphs, and even mathematical problems (duplicate number detection). Floyd's algorithm introduced here is one of the most elegant O(1)-space algorithms.

**Hidden traps:**
- **Empty list:** `head` can be `null` — return `false` immediately.
- **Single node, no cycle:** `head.next === null` — no cycle.
- **Single node with self-loop:** `head.next === head` — cycle of length 1.
- **You can't use `pos`** — it's for illustration only, not passed to your function. You must detect the cycle purely by traversal.
- **Node values can repeat** — you can't identify nodes by value, only by reference (identity).

---

## 2. Brute-Force Approach — Hash Set (Track Visited Nodes)

### 2.1 Idea in Plain Words

Walk through the list node by node. Store each visited node in a hash set. Before processing each node, check if it's already in the set:
- **Yes →** we've visited this node before, so there's a cycle.
- **No →** add it and move on.
- **Reached `null` →** no cycle.

### 2.2 Pseudocode

```
function hasCycle(head):
    visited = empty HashSet  (stores node references)
    current = head
    while current != null:
        if current is in visited:
            return true       // cycle!
        visited.add(current)
        current = current.next
    return false              // reached end, no cycle
```

### 2.3 JavaScript Implementation

```javascript
function hasCycle(head) {
    const visited = new Set();
    let current = head;
    while (current !== null) {
        if (visited.has(current)) return true;
        visited.add(current);
        current = current.next;
    }
    return false;
}
```

### 2.4 Time & Space Complexity

| Metric | Value | Derivation |
|--------|-------|------------|
| **Time** | **O(n)** | Visit each node at most once before finding cycle or reaching `null`. |
| **Space** | **O(n)** | Set stores up to n node references. |

### 2.5 Dry Run

**Input:** `[3, 2, 0, -4]`, pos = 1 (tail connects to node at index 1)

```
3 → 2 → 0 → -4
    ↑           |
    └───────────┘
```

| Step | current | current.val | In visited? | Action | visited (vals) |
|------|---------|-------------|------------|--------|----------------|
| 1 | node0 | 3 | No | Add | {3} |
| 2 | node1 | 2 | No | Add | {3, 2} |
| 3 | node2 | 0 | No | Add | {3, 2, 0} |
| 4 | node3 | -4 | No | Add | {3, 2, 0, -4} |
| 5 | node1 | 2 | **Yes!** | **return true** | — |

**Output:** `true` ✅

### 2.6 No-cycle Example

**Input:** `[1, 2]`, pos = -1 (no cycle)

```
1 → 2 → null
```

| Step | current | In visited? | Action |
|------|---------|------------|--------|
| 1 | node0 (1) | No | Add |
| 2 | node1 (2) | No | Add |
| 3 | null | — | **return false** |

**Output:** `false` ✅

### 2.7 Why Not Ideal

- Uses **O(n) extra space** — storing every node reference.
- For very large linked lists (millions of nodes), the hash set becomes memory-heavy.
- Can we detect a cycle without storing any visited history? → Yes, with Floyd's algorithm.

---

## 3. Improved Approach — Node Marking (Destructive)

### 3.1 What Changed & Why

Instead of an external set, **mark each visited node** by modifying its value to a sentinel (e.g., `Infinity`). If we encounter a node with the sentinel value, we've visited it before.

This uses O(1) space but **destroys the original data** — a significant trade-off. Useful when the list is disposable.

### 3.2 Pseudocode

```
function hasCycle(head):
    SENTINEL = Infinity
    current = head
    while current != null:
        if current.val === SENTINEL:
            return true
        current.val = SENTINEL
        current = current.next
    return false
```

### 3.3 JavaScript Implementation

```javascript
function hasCycle(head) {
    const SENTINEL = Infinity;
    let current = head;
    while (current !== null) {
        if (current.val === SENTINEL) return true;
        current.val = SENTINEL;
        current = current.next;
    }
    return false;
}
```

### 3.4 Time & Space Complexity

| Metric | Value | Derivation |
|--------|-------|------------|
| **Time** | **O(n)** | Visit each node once. |
| **Space** | **O(1)** | No extra data structures. |

### 3.5 Dry Run

**Input:** `[3, 2, 0, -4]`, pos = 1

| Step | current.val | === ∞? | Action | List state (vals) |
|------|------------|--------|--------|-------------------|
| 1 | 3 | No | Mark ∞ | [∞, 2, 0, -4] |
| 2 | 2 | No | Mark ∞ | [∞, ∞, 0, -4] |
| 3 | 0 | No | Mark ∞ | [∞, ∞, ∞, -4] |
| 4 | -4 | No | Mark ∞ | [∞, ∞, ∞, ∞] |
| 5 | ∞ | **Yes!** | **return true** | — |

### 3.6 Trade-offs

| Pros | Cons |
|------|------|
| O(1) space — no set needed | **Mutates the list** — data destroyed |
| Simple implementation | Fails if sentinel value occurs naturally in data |
| | Can't recover original values |
| | Not viable in production / interviews (typically) |

> **Interviewers will flag this approach** as destructive and ask for a non-destructive O(1) solution → Floyd's algorithm.

---

## 4. Optimal / Best Approach — Floyd's Cycle Detection (Tortoise & Hare)

### 4.1 Intuition

Use **two pointers** moving at different speeds:
- 🐢 **Slow pointer (tortoise):** moves 1 step per iteration.
- 🐇 **Fast pointer (hare):** moves 2 steps per iteration.

**If there's no cycle:** the fast pointer reaches `null` and we return `false`.

**If there's a cycle:** the fast pointer enters the cycle first and "laps" the slow pointer. They **must** eventually meet inside the cycle.

**Analogy:** Two runners on a circular track. The faster one will always lap the slower one.

### 4.2 Pseudocode

```
function hasCycle(head):
    if head == null: return false
    slow = head
    fast = head
    while fast != null AND fast.next != null:
        slow = slow.next          // 1 step
        fast = fast.next.next     // 2 steps
        if slow === fast:
            return true           // they met → cycle!
    return false                  // fast reached end → no cycle
```

### 4.3 JavaScript Implementation

```javascript
function hasCycle(head) {
    if (!head) return false;
    let slow = head;
    let fast = head;
    while (fast !== null && fast.next !== null) {
        slow = slow.next;
        fast = fast.next.next;
        if (slow === fast) return true;
    }
    return false;
}
```

### 4.4 Correctness Proof

**Claim:** If a cycle exists, slow and fast will meet.

1. **Fast enters the cycle first.** When slow enters the cycle at some step, fast is already inside it, some distance ahead.

2. **Relative speed:** In each iteration, fast gains 1 step on slow (fast moves 2, slow moves 1). So the gap between them **decreases by 1** each step.

3. **Gap shrinks to 0:** If fast is `d` steps ahead of slow inside the cycle (measured in the cycle direction), after `d` iterations the gap becomes 0 — they meet.

4. **Fast can't skip over slow:** Since the gap decreases by exactly 1 each step, it must pass through 0. They can't miss each other. ✓

**If no cycle:** Fast reaches `null` → while-loop exits → return `false`. ✓

### 4.5 Dry Run — Cycle Exists

**Input:** `[3, 2, 0, -4]`, pos = 1

```
Index:  0    1    2    3
        3 → 2 → 0 → -4
            ↑          |
            └──────────┘
```

| Step | slow (val) | fast (val) | slow === fast? |
|------|-----------|-----------|----------------|
| start | node0 (3) | node0 (3) | — (skip first check) |
| 1 | node1 (2) | node2 (0) | No |
| 2 | node2 (0) | node1 (2)* | No |
| 3 | node3 (-4) | node3 (-4)* | **Yes! → return true** |

*fast at step 2: was at node2, goes to node3.next = node1, then node1.next = node2 → node2? Let me redo carefully:

| Step | slow → | slow now | fast → → | fast now | Meet? |
|------|--------|----------|----------|----------|-------|
| 0 | — | node0(3) | — | node0(3) | skip |
| 1 | .next | node1(2) | .next.next | node2(0) | No |
| 2 | .next | node2(0) | .next.next | node1(2)† | No |
| 3 | .next | node3(-4) | .next.next | node3(-4)†† | **Yes!** |

† fast was at node2(0), goes to node3(-4), then node1(2)
†† fast was at node1(2), goes to node2(0), then node3(-4)

**Output:** `true` ✅

### 4.6 Dry Run — No Cycle

**Input:** `[1, 2]`, pos = -1

```
1 → 2 → null
```

| Step | slow | fast | fast.next? |
|------|------|------|-----------|
| 0 | node0(1) | node0(1) | node1 ✓ |
| 1 | node1(2) | null (node1.next=null, so fast=null) | fast===null → exit |

**Output:** `false` ✅

### 4.7 Time & Space Complexity

| Metric | Value | Derivation |
|--------|-------|------------|
| **Time** | **O(n)** | Without cycle: fast reaches null in n/2 steps. With cycle: once slow enters the cycle, fast catches up within at most one full cycle length. Total ≤ n + C where C ≤ n. |
| **Space** | **O(1)** | Only two pointer variables. |

### 4.8 Comparison of All Approaches

| Approach | Time | Space | Destructive? | Interview-ready? |
|----------|------|-------|-------------|-----------------|
| Hash Set | O(n) | O(n) | No | ✅ Good starting point |
| Node Marking | O(n) | O(1) | **Yes** | ❌ Avoid |
| **Floyd's (Two Pointers)** | **O(n)** | **O(1)** | **No** | **✅ Optimal** |

---

## 5. Edge Cases

| Input | Expected | Why |
|-------|----------|-----|
| `null` | `false` | Empty list |
| Single node, no cycle | `false` | `head.next === null` |
| Single node, self-loop | `true` | `head.next === head` |
| Two nodes, cycle | `true` | `A → B → A` |
| Very long list, no cycle | `false` | Fast reaches null |
| Cycle at the very end | `true` | Tail points back |

---

## 6. Interview-Ready Verbal Explanation (60–90 seconds)

> "I use Floyd's cycle detection — the tortoise and hare algorithm. Two pointers start at head: slow moves 1 step, fast moves 2 steps.
>
> If there's no cycle, fast reaches null and we return false. If there is a cycle, the fast pointer enters it first and keeps going. Once the slow pointer enters the cycle too, the fast pointer gains 1 step per iteration on the slow, so the gap between them shrinks by 1 each step. It must eventually reach zero, meaning they meet — we return true.
>
> The key insight is that they can't skip past each other since the gap decreases by exactly 1. Time is O(n) — at most two full traversals — and space is O(1), just two pointers. This is optimal because any algorithm must at least read the list, which is Ω(n)."

---

## 7. Visual Diagram

```
Example: [3, 2, 0, -4], pos = 1

    3 ──→ 2 ──→ 0 ──→ -4
          ↑              |
          └──────────────┘

Step 0:   S,F
          3 ──→ 2 ──→ 0 ──→ -4
                ↑              |
                └──────────────┘

Step 1:         S     F
          3 ──→ 2 ──→ 0 ──→ -4
                ↑              |
                └──────────────┘

Step 2:               S  F(→-4→2)
          3 ──→ 2 ──→ 0 ──→ -4
                ↑     ↑F       |
                └──────────────┘

Step 3:                    S,F  ← MEET!
          3 ──→ 2 ──→ 0 ──→ -4
                ↑              |
                └──────────────┘

Why they must meet (inside cycle):
┌──────────────────────────────────────┐
│  Cycle of length C                   │
│  Fast is d steps ahead of slow       │
│                                      │
│  Each iteration: gap decreases by 1  │
│  d → d-1 → d-2 → ... → 1 → 0       │
│                          MEET!       │
│                                      │
│  Max d = C-1, so at most C-1 steps   │
│  to meet after slow enters cycle     │
└──────────────────────────────────────┘
```

---

## 8. Follow-Up: 142 — Find Cycle Start Node

Floyd's algorithm extends to find **where** the cycle begins (LeetCode 142). After slow and fast meet:
1. Move one pointer back to `head`.
2. Advance both at speed 1.
3. They meet at the **cycle start**.

This works due to a mathematical property: the distance from head to cycle start equals the distance from meeting point to cycle start (going around the cycle). This is a common follow-up in interviews.
