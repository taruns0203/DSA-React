# 203. Remove Linked List Elements — From Brute-Force to Dummy Node

---

## 1. High-Level Interpretation

**What the problem asks:** Given a linked list and a target integer `val`, remove all nodes whose value equals `val` and return the head of the modified list.

**Why it matters:** This is the quintessential pointer manipulation problem. It highlights the classic "first node deletion" edge case — removing the first node requires different pointer logic than removing a middle node. This tests your ability to adapt list operations elegantly and safely.

**Hidden traps:**
- **Empty list:** `head` can be `null`.
- **Entire list matches:** e.g., `[6,6,6]` with `val=6` should return `[]`.
- **Head matches but later nodes don't:** `[6,1,2]`.
- **Tail matches:** `[1,2,6]`.
- **Consecutive matches:** `[1,6,6,2]`. If you skip the first `6`, the *new* `next` node is *also* a `6`. You must check again before advancing your pointer.

---

## 2. Brute-Force Approach — Create a New List

### 2.1 Idea in Plain Words

Instead of modifying the list in place (which involves tricky pointer relinking), create a completely new linked list. Traverse the original list node by node. If a node's value is *not* the target `val`, create a new node with that value and append it to the new list. If it *is* the target `val`, safely ignore it.

### 2.2 Pseudocode

```
function removeElements(head, val):
    newHead = null
    newTail = null
    current = head
    
    while current != null:
        if current.val != val:
            newNode = new Node(current.val)
            if newHead == null:
                newHead = newNode
                newTail = newNode
            else:
                newTail.next = newNode
                newTail = newTail.next
        current = current.next
        
    return newHead
```

### 2.3 JavaScript Implementation

```javascript
function removeElements(head, val) {
    let newHead = null;
    let newTail = null;
    let current = head;
    
    while (current !== null) {
        if (current.val !== val) {
            const newNode = new ListNode(current.val);
            if (newHead === null) {
                newHead = newNode;
                newTail = newNode;
            } else {
                newTail.next = newNode;
                newTail = newTail.next;
            }
        }
        current = current.next;
    }
    
    return newHead;
}
```

### 2.4 Time & Space Complexity

| Metric | Value | Derivation |
|--------|-------|------------|
| **Time** | **O(n)** | We traverse the given linked list of length `n` exactly once. |
| **Space** | **O(n)** | In the worst case (no elements removed), we allocate `n` brand-new nodes for the new linked list. |

### 2.5 Dry Run

**Input:** `[1, 2, 6]`, `val = 6`

| Step | current.val | Action | newHead | newTail | List State |
|------|-------------|--------|---------|---------|------------|
| 1 | 1 | 1 != 6. Add Node(1) | Node(1) | Node(1) | `1` |
| 2 | 2 | 2 != 6. Add Node(2) | Node(1) | Node(2) | `1 -> 2` |
| 3 | 6 | 6 == 6. Ignore | Node(1) | Node(2) | `1 -> 2` |
| 4 | null | Loop ends | Node(1) | Node(2) | `1 -> 2` |

**Output:** `[1, 2]`

### 2.6 Why Not Ideal

Constructing a completely new list defeats the purpose of linked lists. The major advantage of a linked list is the ability to perform O(1) in-place insertions and deletions by merely updating references. Copying nodes takes unnecessary O(n) memory and triggers the memory allocator.

---

## 3. Improved Approach — In-Place (Handle Head Separately)

### 3.1 What Changed & Why

We update the pointers *in-place*. 
Removing a middle node is straightforward: if `current.next.val == val`, we just say `current.next = current.next.next` to bypass it.
**The problem:** What if the very first node (the `head`) needs to be removed? The head has no `current` before it to relink! 
**The solution:** Write entirely separate logic for the head. First, chop off matching nodes from the front of the list using a `while` loop (`head = head.next`). Once the head is clean (or `null`), cleanly apply the `current.next` bypassing logic for the remainder of the list.

### 3.2 Pseudocode

```
function removeElements(head, val):
    // 1. Remove all matching nodes from the front
    while head != null AND head.val == val:
        head = head.next
        
    // 2. Head is either null or does NOT equal val
    current = head
    while current != null AND current.next != null:
        if current.next.val == val:
            // Bypass the next node
            current.next = current.next.next
        else:
            // Move forward
            current = current.next
            
    return head
```

### 3.3 JavaScript Implementation

```javascript
function removeElements(head, val) {
    // Phase 1: Clean the head
    while (head !== null && head.val === val) {
        head = head.next;
    }
    
    // Phase 2: Clean the rest of the list
    let current = head;
    while (current !== null && current.next !== null) {
        if (current.next.val === val) {
            current.next = current.next.next; // Skip the node
        } else {
            current = current.next; // Advance ONLY if we didn't delete
        }
    }
    
    return head;
}
```

### 3.4 Time & Space Complexity

| Metric | Value | Derivation |
|--------|-------|------------|
| **Time** | **O(n)** | Every node is visited exactly once (either by advancing `head` or by checking `current.next`). |
| **Space** | **O(1)** | We only modify existing pointers, using zero extra allocated memory. |

### 3.5 Dry Run

**Input:** `[6, 6, 1, 2, 6]`, `val = 6`

**Phase 1: Clean Head**
- `head.val` is 6 -> `head` becomes node(6)
- `head.val` is 6 -> `head` becomes node(1)
- `head.val` is 1 != 6 -> Loop ends. `head` is definitively node(1).

**Phase 2: Clean Rest**
`current` starts at node(1). The list visually is `[1 -> 2 -> 6]`

| Step | current.val | current.next.val | Equal 6? | Action | List State |
|------|-------------|------------------|----------|--------|------------|
| 1 | 1 | 2 | No | current = current.next | `1 -> 2 -> 6` (cur at 2) |
| 2 | 2 | 6 | Yes! | cur.next = cur.next.next | `1 -> 2 -> null` (cur at 2) |
| 3 | 2 | null | - | Loop ends | `1 -> 2 -> null` |

**Output:** `[1, 2]`

### 3.6 Trade-offs

It achieves O(1) space, but the code has two distinct `while` loops handling the exact same logic. It’s slightly repetitive and requires strict management of edge cases. There is a cleaner architectural way.

---

## 4. Optimal / Best Approach — Dummy Node Technique

### 4.1 Intuition

Why did the previous approach need two loops? Because the `head` node is a special edge case: it has no "previous" node pointing to it.
We can elegantly eliminate this special case by **creating an artificial previous node**, known as a **Dummy Node** (or Sentinel Node), and pointing its `next` to the real `head`.
Now, *every* real node in the list (including the original head) is guaranteed to be a `current.next` of some valid node.
We run the standard skipping logic `current.next = current.next.next` starting from the Dummy Node. If the original head needs to be deleted, the Dummy Node natively bypasses it.

### 4.2 Pseudocode

```
function removeElements(head, val):
    dummy = new Node(0)
    dummy.next = head
    current = dummy
    
    while current.next != null:
        if current.next.val == val:
            current.next = current.next.next // skip
        else:
            current = current.next // advance
            
    // The true head is whatever currently follows the dummy node
    return dummy.next
```

### 4.3 JavaScript Implementation

```javascript
function removeElements(head, val) {
    // Create a dummy node pointing to head
    const dummy = new ListNode(-1);
    dummy.next = head;
    
    let current = dummy;
    
    while (current.next !== null) {
        if (current.next.val === val) {
            // Found target: bypass it. Do NOT advance current yet.
            current.next = current.next.next;
        } else {
            // Not target: safe to advance current.
            current = current.next;
        }
    }
    
    // Return the new head (dummy.next accommodates if original head was deleted)
    return dummy.next;
}
```

### 4.4 Correctness Proof

**Invariant:** At any step, the sublist from `dummy` up to (and including) `current` is completely free of nodes with value `val`.
1. **Base Case:** `current = dummy`. The dummy node value is arbitrarily -1 (doesn't equal `val`), so the prefix up to `current` is clean.
2. **Maintenance:** We examine `current.next.val`. 
   - If it equals `val`, we re-route `current.next` to skip the bad node. We keep `current` exactly where it is, so the invariant trivially continues to hold. 
   - If it does *not* equal `val`, the node is verified to be clean. We advance `current = current.next`, adding one clean node to our prefix. The invariant holds.
3. **Termination:** When `current.next` is `null`, the entire list has been checked and cleaned. Since `dummy.next` always points to the start of the genuinely valid list, returning it is perfectly safe, even if the original list was completely obliterated (empty).

### 4.5 Dry Run

**Input:** `[6, 1, 6]`, `val = 6`

Create dummy: `D(-1) -> 6 -> 1 -> 6 -> null`.
`current` starts at `D(-1)`.

| Step | current.val | current.next.val | Equal 6? | Action | List State |
|------|-------------|------------------|----------|--------|------------|
| 1 | D(-1) | 6 (head) | Yes! | cur.next = cur.next.next | `D(-1) -> 1 -> 6 -> null` (cur at D) |
| 2 | D(-1) | 1 | No   | current = current.next | `D(-1) -> 1 -> 6 -> null` (cur at 1) |
| 3 | 1 | 6 | Yes! | cur.next = cur.next.next | `D(-1) -> 1 -> null` (cur at 1) |
| 4 | 1 | null | - | Loop ends | `D(-1) -> 1 -> null` |

**Return:** `dummy.next`, which is node(1). `[1]` ✅

### 4.6 Time & Space Complexity

| Metric | Value | Derivation |
|--------|-------|------------|
| **Time** | **O(n)** | We traverse the list exactly once via the `current` pointer checking each node. |
| **Space** | **O(1)** | We only allocate one extra `dummy` node, requiring constant memory regardless of list size. |

### 4.7 Interview-Ready Verbal Explanation (60–90 seconds)

> "To remove nodes in-place, the core logic is standard: if `current.next` contains the target value, we bypass it by setting `current.next = current.next.next`. However, this requires a 'previous' node, which creates an annoying edge case for the very first node (the head) since it has no previous node.
> 
> To elegantly solve this, I'll use the Dummy Node pattern. I instantiate a dummy node and point its `next` pointer to the actual `head`. Then, I start my `current` pointer at the dummy node. Now, *every* node, including the original head, is treated uniformly as `current.next`.
> 
> We traverse the list: if `current.next.val == target`, we skip it without advancing `current`. Otherwise, we advance `current`. Once the loop breaks, the list is completely clean, and I simply return `dummy.next`. This guarantees an optimal O(n) time complexity with O(1) space, and perfectly handles all edge cases like an entirely matched list or an empty list with no extra conditional logic."

---

## 5. Visual Diagram

```
The Dummy Node Pattern (Bypassing the Head Edge Case)
Input: [6, 2, 6], val = 6

1. Initialization
   Dummy(-1)  ──→  Node[6]  ──→  Node[2]  ──→  Node[6]  ──→  null
   ↑current        ↑current.next = 6 (Target!)

2. current.next.val == 6. Bypass it!
   Dummy(-1)  ────────────────→  Node[2]  ──→  Node[6]  ──→  null
   ↑current (stays here)         ↑current.next = 2

3. current.next.val is 2. Safe! Advance current.
   Dummy(-1)  ────────────────→  Node[2]  ──→  Node[6]  ──→  null
                                 ↑current      ↑current.next = 6 (Target!)

4. current.next.val == 6. Bypass it!
   Dummy(-1)  ────────────────→  Node[2]  ────────────────→  null
                                 ↑current                    ↑current.next = null

5. Done. return Dummy(-1).next 
   Output: [2]
```
