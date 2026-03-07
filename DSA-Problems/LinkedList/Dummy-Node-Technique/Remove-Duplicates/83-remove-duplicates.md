# 83. Remove Duplicates from Sorted List — From Brute-Force to Optimal In-Place

---

## 1. High-Level Interpretation

**What the problem asks:** Given a sorted linked list, remove all duplicate nodes so that each value appears only once. Return the modified list (still sorted).

**Why it matters:** This is a fundamental linked list manipulation problem that tests your ability to modify pointers in-place. It teaches the pattern of exploiting sorted order to simplify duplicate detection — a pattern reused in arrays (LeetCode 26), strings, and more complex linked list problems (LeetCode 82: remove ALL duplicate nodes).

**Hidden traps:**
- **Empty list:** `head` can be `null` — handle before doing anything.
- **All duplicates:** `[1,1,1,1]` → `[1]`. Must handle runs of any length.
- **No duplicates:** `[1,2,3]` → `[1,2,3]`. Don't break a clean list.
- **The list is already sorted** — this is the key insight. Duplicates are always adjacent, so you never need to "search" for them.
- **Memory leaks (in languages with manual memory):** Skipped nodes should be freed. In JavaScript, garbage collection handles this.

---

## 2. Brute-Force Approach — Hash Set (Ignore Sorted Property)

### 2.1 Idea in Plain Words

Traverse the linked list. Maintain a **hash set** of values we've already seen. For each node:
- If its value is in the set → it's a duplicate, remove it by relinking the previous node's `next`.
- If its value is NOT in the set → add it and keep the node.

This works for **any** linked list (sorted or not), but wastes space by ignoring the sorted guarantee.

### 2.2 Pseudocode

```
function deleteDuplicates(head):
    if head == null: return head
    seen = empty HashSet
    seen.add(head.val)
    current = head
    while current.next != null:
        if current.next.val is in seen:
            current.next = current.next.next   // skip duplicate
        else:
            seen.add(current.next.val)
            current = current.next
    return head
```

### 2.3 JavaScript Implementation

```javascript
function deleteDuplicates(head) {
    if (!head) return head;
    const seen = new Set();
    seen.add(head.val);
    let current = head;
    while (current.next) {
        if (seen.has(current.next.val)) {
            current.next = current.next.next;
        } else {
            seen.add(current.next.val);
            current = current.next;
        }
    }
    return head;
}
```

### 2.4 Time & Space Complexity

| Metric | Value | Derivation |
|--------|-------|------------|
| **Time** | **O(n)** | Single pass through all n nodes. Set operations are O(1) average. |
| **Space** | **O(n)** | Set stores up to n unique values. |

### 2.5 Dry Run

**Input:** `[1, 1, 2, 3, 3]`

| Step | current.val | current.next.val | In set? | Action | List state | seen |
|------|------------|-----------------|---------|--------|------------|------|
| init | 1 | 1 | — | add 1 | `1→1→2→3→3` | {1} |
| 1 | 1 | 1 | Yes | skip next | `1→2→3→3` | {1} |
| 2 | 1 | 2 | No  | add 2, advance | `1→2→3→3` | {1,2} |
| 3 | 2 | 3 | No  | add 3, advance | `1→2→3→3` | {1,2,3} |
| 4 | 3 | 3 | Yes | skip next | `1→2→3` | {1,2,3} |
| 5 | 3 | null | —  | exit loop | `1→2→3` | {1,2,3} |

**Output:** `[1, 2, 3]` ✅

### 2.6 Why Not Ideal

- Uses **O(n) extra space** for the set.
- The list is **sorted** — duplicates are always adjacent. We don't need a set to detect them.
- Like using a telescope to read a book in front of you — overkill.

---

## 3. Improved Approach — Recursive Deduplication

### 3.1 What Changed & Why

Instead of iteration + set, use **recursion**: solve the subproblem for the rest of the list, then decide whether the current node is a duplicate of the next. The sorted property means we only compare adjacent nodes.

This eliminates the set but uses O(n) call stack space.

### 3.2 Pseudocode

```
function deleteDuplicates(head):
    if head == null OR head.next == null:
        return head
    head.next = deleteDuplicates(head.next)   // solve rest first
    if head.val === head.next.val:
        return head.next    // skip current (duplicate of next)
    return head             // keep current
```

### 3.3 JavaScript Implementation

```javascript
function deleteDuplicates(head) {
    if (!head || !head.next) return head;
    head.next = deleteDuplicates(head.next);
    return head.val === head.next.val ? head.next : head;
}
```

### 3.4 Time & Space Complexity

| Metric | Value | Derivation |
|--------|-------|------------|
| **Time** | **O(n)** | Visit each node once during recursion. |
| **Space** | **O(n)** | Call stack depth = n in worst case (no duplicates). |

### 3.5 Dry Run

**Input:** `[1, 1, 2]`

```
Call stack (unwinding from end):

deleteDuplicates(node2=2)
  → next is null → return node2(2)

deleteDuplicates(node1=1)
  → head.next = deleteDuplicates(node2) = node2(2)
  → head.val(1) ≠ head.next.val(2) → return node1(1→2)

deleteDuplicates(node0=1)
  → head.next = deleteDuplicates(node1) = node1(1→2)
  → head.val(1) === head.next.val(1) → return head.next = node1(1→2)

Final: node1(1) → node2(2)  →  [1, 2] ✅
```

### 3.6 Trade-offs

| Pros | Cons |
|------|------|
| Elegant, concise code | O(n) stack space — can stack overflow for large lists |
| No explicit set needed | Harder to debug than iterative |
| Uses sorted property | Not O(1) space |

---

## 4. Optimal / Best Approach — Single-Pass In-Place (Two-Pointer)

### 4.1 Intuition

Since the list is **sorted**, all duplicates are **adjacent**. We only need one pointer:

- Walk through the list with `current`.
- Compare `current.val` with `current.next.val`:
  - **Equal →** duplicate! Skip `current.next` by setting `current.next = current.next.next`.
  - **Different →** no duplicate, advance `current = current.next`.
- That's it. One pass, no extra space.

### 4.2 Pseudocode

```
function deleteDuplicates(head):
    current = head
    while current != null AND current.next != null:
        if current.val === current.next.val:
            current.next = current.next.next   // skip duplicate
        else:
            current = current.next             // advance
    return head
```

### 4.3 JavaScript Implementation

```javascript
function deleteDuplicates(head) {
    let current = head;
    while (current && current.next) {
        if (current.val === current.next.val) {
            current.next = current.next.next;
        } else {
            current = current.next;
        }
    }
    return head;
}
```

### 4.4 Correctness Proof

**Invariant:** At each step, all nodes from `head` up to (and including) `current` contain unique values in sorted order.

1. **Base:** Before the loop, `current = head`. A single node is trivially unique. ✓
2. **Maintenance:** If `current.val === current.next.val`, we skip the duplicate — the invariant holds since we removed the offending node. If values differ, advancing `current` extends the unique prefix. ✓
3. **Termination:** The loop ends when `current` or `current.next` is `null`. At that point, the entire remaining list has been processed. ✓

**Key subtlety:** When we find a duplicate, we do NOT advance `current`. We stay at the same node because `current.next` just changed — the new `current.next` might also be a duplicate (e.g., `[1,1,1]`).

### 4.5 Dry Run — Example 1

**Input:** `[1, 1, 2]`

```
1 → 1 → 2 → null
```

| Step | current.val | current.next.val | Equal? | Action | List |
|------|------------|-----------------|--------|--------|------|
| 1 | 1 | 1 | Yes | skip: 1.next = 2 | `1→2→null` |
| 2 | 1 | 2 | No | advance | `1→2→null` |
| 3 | 2 | null | — | exit | `1→2→null` |

**Output:** `[1, 2]` ✅

### 4.6 Dry Run — Example 2

**Input:** `[1, 1, 2, 3, 3]`

```
1 → 1 → 2 → 3 → 3 → null
```

| Step | current.val | current.next.val | Equal? | Action | List |
|------|------------|-----------------|--------|--------|------|
| 1 | 1 | 1 | Yes | skip | `1→2→3→3→null` |
| 2 | 1 | 2 | No | advance | `1→2→3→3→null` |
| 3 | 2 | 3 | No | advance | `1→2→3→3→null` |
| 4 | 3 | 3 | Yes | skip | `1→2→3→null` |
| 5 | 3 | null | — | exit | `1→2→3→null` |

**Output:** `[1, 2, 3]` ✅

### 4.7 Time & Space Complexity

| Metric | Value | Derivation |
|--------|-------|------------|
| **Time** | **O(n)** | Each node is visited at most once. When we skip, we never revisit the skipped node. When we advance, we move forward. Total = n-1 comparisons at most. |
| **Space** | **O(1)** | Only one pointer variable. No extra data structures. |

### 4.8 Comparison of All Approaches

| Approach | Time | Space | Uses sorted? | Modifies original? |
|----------|------|-------|-------------|-------------------|
| Hash Set | O(n) | O(n) | ❌ No | ✅ Yes (in-place) |
| Recursive | O(n) | O(n) stack | ✅ Yes | ✅ Yes |
| **In-Place (optimal)** | **O(n)** | **O(1)** | **✅ Yes** | **✅ Yes** |

---

## 5. Edge Cases

| Input | Expected | Why |
|-------|----------|-----|
| `null` | `null` | Empty list |
| `[1]` | `[1]` | Single node, no duplicates possible |
| `[1,1,1,1]` | `[1]` | All same — stay at node 0 and keep skipping |
| `[1,2,3]` | `[1,2,3]` | No duplicates — just advance through |
| `[-1,-1,0,0,1]` | `[-1,0,1]` | Negative values work fine |

---

## 6. Interview-Ready Verbal Explanation (60–90 seconds)

> "Since the list is sorted, duplicates are always adjacent. I walk through with a single pointer `current`. At each step, I compare `current.val` with `current.next.val`. If they're equal, it's a duplicate — I skip the next node by setting `current.next = current.next.next`. If they're different, I simply advance `current` forward.
>
> The key detail: when I find a duplicate and skip, I do NOT advance the pointer. I stay at the same node because the new next might also be a duplicate — for example, in `[1,1,1]`, after removing the second 1, I need to check the third 1 against the first.
>
> This gives O(n) time — one pass — and O(1) space, just one pointer. It works because the sorted property guarantees duplicates are contiguous."

---

## 7. Visual Diagram

```
Input: 1 → 1 → 2 → 3 → 3 → null

Step 1: current at [1], next is [1] → EQUAL → skip!
        1 ──→ 2 → 3 → 3 → null
        ↑cur  (1 removed)

Step 2: current at [1], next is [2] → different → advance
        1 → 2 → 3 → 3 → null
            ↑cur

Step 3: current at [2], next is [3] → different → advance
        1 → 2 → 3 → 3 → null
                ↑cur

Step 4: current at [3], next is [3] → EQUAL → skip!
        1 → 2 → 3 → null
                ↑cur (3 removed)

Step 5: current at [3], next is null → done!
        1 → 2 → 3 → null  ✅

Key insight — don't advance when you skip:
┌──────────────────────────────────────┐
│  1 → 1 → 1 → 2                     │
│  ↑                                   │
│  cur.val === cur.next.val            │
│  → skip: cur.next = cur.next.next   │
│                                      │
│  1 ──→ 1 → 2                        │
│  ↑                                   │
│  STILL at cur! Check again!         │
│  cur.val === cur.next.val again!    │
│  → skip again: cur.next = 2         │
│                                      │
│  1 ──→ 2                            │
│  ↑                                   │
│  Now different → advance ✓          │
└──────────────────────────────────────┘
```

---

## 8. Follow-Up: LeetCode 82 — Remove Duplicates II

Problem 82 asks to remove **all** nodes that have duplicates (keep none of them). For `[1,1,2,3,3]` → `[2]`. This requires a **dummy head** and a different pointer strategy since even the first occurrence gets removed. The pattern changes from "skip next" to "skip entire runs."
