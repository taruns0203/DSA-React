# 237. Delete Node in a Linked List

---

## 1. High-Level Interpretation

You are given a **pointer to a node** inside a singly linked list and asked to delete it — but you **do not have access to the head** or any previous node. This is the central twist: in a normal linked list deletion you'd update `prev.next = node.next`, but here you have no `prev`. The problem guarantees the node is **not the tail** (so `node.next` always exists) and all values are unique.

### Hidden Traps
- **No head pointer** — you cannot traverse from the beginning. Forget everything you know about "normal" deletion.
- **Not removing from memory** — you just need to make the linked list *look like* the node was removed (values and order preserved).
- **Not the tail** — the problem guarantees this, which is critical because the trick used here *cannot* work on the last node (there's no next node to copy from).
- This is a **trick problem** — there's essentially one elegant idea, but we can still explore a shift-based approach first.

---

## 2. Node Definition

```javascript
class ListNode {
    constructor(val) {
        this.val = val;
        this.next = null;
    }
}
```

---

## 3. Brute-Force Approach — Shift All Values Left

### 3.1 Idea in Plain Words

Since we can't unlink the node directly (no previous pointer), we **shift every subsequent node's value one position to the left**, overwriting the node-to-delete with the next value, the next node with the one after, and so on. Then we **remove the last node** by finding the second-to-last node and setting its `.next = null`.

Think of it like deleting an element from the middle of an array by shifting everything left by one.

### 3.2 Pseudocode

```
function deleteNode(node):
    curr = node

    // Shift values left: each node takes its successor's value
    while curr.next.next is not null:
        curr.val = curr.next.val
        curr = curr.next

    // curr is now the second-to-last node
    // Copy last node's value into curr
    curr.val = curr.next.val

    // Remove the (now duplicate) last node
    curr.next = null
```

### 3.3 JavaScript Implementation

```javascript
/**
 * @param {ListNode} node
 * @return {void} Do not return anything, modify node in-place instead.
 */
var deleteNode = function(node) {
    let curr = node;

    // Shift every subsequent value one position left
    while (curr.next.next) {
        curr.val = curr.next.val;
        curr = curr.next;
    }

    // Handle the last pair
    curr.val = curr.next.val;
    curr.next = null;
};
```

### 3.4 Time & Space Complexity

| Metric | Value | Derivation |
|--------|-------|------------|
| **Time** | **O(n)** | In the worst case (deleting the first node), we shift n−1 values. |
| **Space** | **O(1)** | Only pointer variables. |

### 3.5 Dry Run

**Input:** `head = [4,5,1,9]`, delete node with value `5` (i.e., node points to `5`)

| Step | Action | curr | List State |
|------|--------|------|------------|
| 0 | Start | node(5) | 4 → **5** → 1 → 9 |
| 1 | curr.val = curr.next.val (5←1) | node(now 1) | 4 → **1** → 1 → 9 |
| 2 | curr = curr.next | node(1) [2nd] | 4 → 1 → **1** → 9 |
| 3 | curr.val = curr.next.val (1←9) | node(now 9) | 4 → 1 → **9** → 9 |
| 4 | curr.next = null | — | 4 → 1 → 9 → ∅ |

✅ Output: `[4,1,9]`

### 3.6 Why This Is Suboptimal

- **O(n) time** to shift all values when we could solve it in O(1).
- **Touches every node** from the deleted position to the end — wasteful.
- Modifying values of many nodes is conceptually messy and error-prone.

---

## 4. Optimal Approach — Copy-and-Skip (The Trick)

### 4.1 Key Insight

Instead of trying to unlink the current node (impossible without `prev`), we **make the current node become its successor**:

1. **Copy** the next node's value into the current node.
2. **Skip** the next node by pointing `node.next` to `node.next.next`.

We're not truly deleting `node` from memory — we're deleting `node.next` and making `node` impersonate it. The result is the same: the value is gone, the list is one shorter, and order is preserved.

```
Before:  ... → A → [node: B] → C → D → ...
                      ↓
Step 1:  Copy C's value into node
         ... → A → [node: C] → C → D → ...
                      ↓
Step 2:  Skip the next node
         ... → A → [node: C] ──────→ D → ...

Result:  ... → A → C → D → ...     (B is gone!)
```

### 4.2 Pseudocode

```
function deleteNode(node):
    node.val  = node.next.val      // Copy successor's value
    node.next = node.next.next     // Skip successor
```

That's it. Two lines.

### 4.3 JavaScript Implementation

```javascript
/**
 * @param {ListNode} node
 * @return {void} Do not return anything, modify node in-place instead.
 */
var deleteNode = function(node) {
    node.val  = node.next.val;
    node.next = node.next.next;
};
```

### 4.4 Correctness Proof

**Claim:** After `deleteNode(node)`, the linked list contains all original values except `node.val`, in the same relative order.

**Proof:**

1. **Before the operation**, the list around `node` looks like:
   `... → prev → node(V) → next(W) → rest → ...`

2. After `node.val = node.next.val`:
   `... → prev → node(W) → next(W) → rest → ...`
   → `node` now holds `W`, the next node's value.

3. After `node.next = node.next.next`:
   `... → prev → node(W) → rest → ...`
   → The original `next` node is bypassed.

4. **Values before `node`** are untouched (we never modified `prev` or anything before it). ✓
5. **Value `V`** (the original node's value) no longer exists in the list. ✓
6. **Values after `node`** (`rest`) are in the same order and reachable via `node.next`. ✓
7. **Node count** decreased by one (the original `next` node is orphaned). ✓

All four deletion criteria are satisfied. ∎

### 4.5 Dry Run — Example 1

**Input:** `head = [4,5,1,9]`, delete node with value `5`

| Step | Action | node.val | node.next | List State |
|------|--------|----------|-----------|------------|
| 0 | Start | 5 | →node(1) | 4 → **5** → 1 → 9 |
| 1 | node.val = node.next.val | **1** | →node(1) | 4 → **1** → 1 → 9 |
| 2 | node.next = node.next.next | 1 | →node(9) | 4 → **1** → 9 |

✅ Output: `[4,1,9]`

### 4.6 Dry Run — Example 2

**Input:** `head = [4,5,1,9]`, delete node with value `1`

| Step | Action | node.val | node.next | List State |
|------|--------|----------|-----------|------------|
| 0 | Start | 1 | →node(9) | 4 → 5 → **1** → 9 |
| 1 | node.val = node.next.val | **9** | →node(9) | 4 → 5 → **9** → 9 |
| 2 | node.next = node.next.next | 9 | →null | 4 → 5 → **9** |

✅ Output: `[4,5,9]`

### 4.7 Time & Space Complexity

| Metric | Value | Derivation |
|--------|-------|------------|
| **Time** | **O(1)** | Exactly 2 assignments, regardless of list size. |
| **Space** | **O(1)** | No extra data structures, only reassignment. |

This is **tight** — you must read `node.next` at minimum, so Ω(1) is the lower bound.

### 4.8 Visual Diagram (ASCII)

```
DELETE node(5) from  4 → 5 → 1 → 9

Step 1 — Copy next value:
    4 → [5→1] → 1 → 9
         ↓ copy
    4 → [1]  → 1 → 9

Step 2 — Skip next node:
    4 → [1] ──┐
              ╳  1 (orphaned)
    4 → [1] ──→ 9

Result:  4 → 1 → 9
```

---

## 5. Approach Comparison Summary

| Approach | Time | Space | Key Idea | Lines of Code |
|----------|------|-------|----------|---------------|
| Brute-Force (shift left) | O(n) | O(1) | Shift all subsequent values left, delete tail | ~8 |
| **Optimal (copy & skip)** | **O(1)** | **O(1)** | Copy next value, skip next node | **2** |

---

## 6. Why This Problem Exists

This problem is a classic **interview trick question** designed to test whether you:
1. Realize that you can't do a "normal" deletion without `prev`.
2. Think creatively — instead of removing `node`, remove `node.next` and make `node` impersonate it.
3. Understand pointer manipulation deeply.

### Limitations of This Trick
- **Cannot delete the last node** — there's no `node.next` to copy from. The problem explicitly guarantees the node is not the tail.
- **External references break** — if another part of the program holds a reference to `node.next`, that reference is now dangling (the node is orphaned). In a real system, this could cause bugs.
- **Not a true deletion** — the node object that was "deleted" is actually still in the list; it's `node.next` that's orphaned. This matters in languages with manual memory management (C/C++).

---

## 7. Interview-Ready Explanation (60–90 seconds)

> *"This problem gives us a node to delete but no access to the head or previous node. Normally, to delete a node from a singly linked list, you'd set prev.next to node.next — but we don't have prev.*
>
> *The trick is: instead of removing the current node, we make it impersonate its next node. We copy node.next.val into node.val, then set node.next to node.next.next. This effectively 'deletes' the next node while making the current node take on its value.*
>
> *The result is that the value we wanted to remove is gone, the list is one node shorter, and all values maintain their relative order. It's O(1) time and O(1) space — just two assignments.*
>
> *The only caveat is this won't work on the last node, since there's no next node to copy from. But the problem guarantees the node isn't the tail."*

---

## 8. Assumptions

1. `node` is guaranteed to not be the tail (problem constraint).
2. `node` is a valid node in the list.
3. All values are unique (given in constraints, though the algorithm works without this).
4. We're not concerned with external references to `node.next` becoming invalid.
