# 61. Rotate List

---

## 1. High-Level Interpretation

You are given a singly linked list and a non-negative integer `k`. Your job is to **rotate the list to the right by k positions** — meaning the last k nodes move to the front, and everything else shifts right. The key insight is that rotating by `n` (the list length) gives back the original list, so only `k % n` matters.

### Hidden Traps
- **k can be enormous** (up to 2 × 10⁹) while the list has at most 500 nodes — you **must** reduce k modulo n first.
- **k ≥ n** — rotating by exactly n returns the same list. Naive simulation would TLE.
- **Empty list / single node** — return immediately.
- **k = 0 or k % n = 0** — no rotation needed.
- The "right rotation by k" is equivalent to splitting the list at position `n - k` from the head and moving the suffix to the front.

---

## 2. Node Definition

```javascript
class ListNode {
    constructor(val, next) {
        this.val = (val === undefined ? 0 : val);
        this.next = (next === undefined ? null : next);
    }
}
```

---

## 3. Brute-Force Approach — Simulate k Single Rotations

### 3.1 Idea in Plain Words

Perform k one-position right rotations. Each single rotation:
1. Walk to the **second-to-last** node.
2. Detach the **last node**.
3. Place the last node at the **front** (new head).

Repeat k times.

### 3.2 Pseudocode

```
function rotateRight(head, k):
    if head is null or head.next is null or k == 0:
        return head

    for i = 0 to k-1:
        // Find second-to-last node
        prev = head
        while prev.next.next is not null:
            prev = prev.next

        // Detach last node
        last = prev.next
        prev.next = null

        // Move last to front
        last.next = head
        head = last

    return head
```

### 3.3 JavaScript Implementation

```javascript
var rotateRight = function(head, k) {
    if (!head || !head.next || k === 0) return head;

    for (let i = 0; i < k; i++) {
        let prev = head;
        while (prev.next.next) {
            prev = prev.next;
        }
        const last = prev.next;
        prev.next = null;
        last.next = head;
        head = last;
    }
    return head;
};
```

### 3.4 Time & Space Complexity

| Metric | Value | Derivation |
|--------|-------|------------|
| **Time** | **O(k × n)** | Each of k rotations walks nearly all n nodes to find the tail. |
| **Space** | **O(1)** | Only pointer variables. |

### 3.5 Dry Run

**Input:** `head = [1,2,3,4,5]`, `k = 2`

| Rotation | List Before | 2nd-to-last | Last | List After |
|----------|-------------|-------------|------|------------|
| 1 | 1→2→3→4→5 | node(4) | node(5) | 5→1→2→3→4 |
| 2 | 5→1→2→3→4 | node(3) | node(4) | 4→5→1→2→3 |

✅ Output: `[4,5,1,2,3]`

### 3.6 Why This Fails

- **k can be up to 2 × 10⁹.** With n = 500, that's 10⁹ × 500 = **5 × 10¹¹ operations** → instant TLE.
- Most of the work is wasted because rotating by n returns the original list — we never exploit this.

---

## 4. Improved Approach — Reduce k mod n, Then Simulate

### 4.1 What Changed

**Observation:** Rotating by n gives the same list, so we only need `k % n` rotations. This reduces k from 2 × 10⁹ to at most 499.

### 4.2 Pseudocode

```
function rotateRight(head, k):
    if head is null or head.next is null: return head

    // Count length
    n = 0; curr = head
    while curr: n++; curr = curr.next

    k = k % n
    if k == 0: return head

    // Simulate k single rotations
    for i = 0 to k-1:
        prev = head
        while prev.next.next: prev = prev.next
        last = prev.next
        prev.next = null
        last.next = head
        head = last

    return head
```

### 4.3 JavaScript Implementation

```javascript
var rotateRight = function(head, k) {
    if (!head || !head.next) return head;

    // Count length
    let n = 0, curr = head;
    while (curr) { n++; curr = curr.next; }

    k = k % n;
    if (k === 0) return head;

    // Simulate k rotations
    for (let i = 0; i < k; i++) {
        let prev = head;
        while (prev.next.next) prev = prev.next;
        const last = prev.next;
        prev.next = null;
        last.next = head;
        head = last;
    }
    return head;
};
```

### 4.4 Time & Space Complexity

| Metric | Value | Derivation |
|--------|-------|------------|
| **Time** | **O(n × (k % n))** | Length counting: O(n). Then (k%n) rotations × O(n) each. Worst case: O(n²). |
| **Space** | **O(1)** | Only pointers. |

### 4.5 Dry Run

**Input:** `head = [0,1,2]`, `k = 4`

| Step | Action | Value |
|------|--------|-------|
| 1 | Count length | n = 3 |
| 2 | Reduce k | k = 4 % 3 = **1** |
| 3 | Rotation 1: find tail | prev = node(1), last = node(2) |
| 4 | Detach & prepend | 2→0→1 |

✅ Output: `[2,0,1]`

### 4.6 Trade-offs

| Advantage | Disadvantage |
|-----------|-------------|
| Handles huge k correctly | Still O(n²) worst case when k%n ≈ n/2 |
| Simple to understand | Multiple traversals (k walks to the tail) |

---

## 5. Optimal Approach — Circular Link & Break

### 5.1 Intuition

Instead of simulating rotations one at a time, observe that **right rotation by k is just splitting the list at a specific point**:

```
Original:  1 → 2 → 3 → 4 → 5      k = 2, n = 5

Split at position (n - k) = 3:
  First part:  1 → 2 → 3
  Second part: 4 → 5

Result: second part + first part = 4 → 5 → 1 → 2 → 3
```

**Algorithm:**
1. Walk the list to find `n` (length) and the **tail** node (last node).
2. Reduce: `k = k % n`. If 0, return head.
3. **Make circular:** connect `tail.next = head`.
4. Walk `n - k` steps from the head to find the **new tail**.
5. The node after the new tail is the **new head**.
6. **Break the circle:** `newTail.next = null`.

### 5.2 Pseudocode

```
function rotateRight(head, k):
    if head is null or head.next is null or k == 0:
        return head

    // Step 1: Find length and tail
    n = 1
    tail = head
    while tail.next is not null:
        n++
        tail = tail.next

    // Step 2: Reduce k
    k = k % n
    if k == 0: return head

    // Step 3: Make circular
    tail.next = head

    // Step 4: Walk (n - k) steps to find new tail
    stepsToNewTail = n - k
    newTail = head
    for i = 1 to stepsToNewTail - 1:
        newTail = newTail.next

    // Step 5: New head is right after new tail
    newHead = newTail.next

    // Step 6: Break circle
    newTail.next = null

    return newHead
```

### 5.3 JavaScript Implementation

```javascript
/**
 * @param {ListNode} head
 * @param {number} k
 * @return {ListNode}
 */
var rotateRight = function(head, k) {
    if (!head || !head.next || k === 0) return head;

    // Step 1: Find length and tail
    let n = 1;
    let tail = head;
    while (tail.next) {
        n++;
        tail = tail.next;
    }

    // Step 2: Reduce k
    k = k % n;
    if (k === 0) return head;

    // Step 3: Make circular
    tail.next = head;

    // Step 4: Walk (n - k) steps to find new tail
    const stepsToNewTail = n - k;
    let newTail = head;
    for (let i = 1; i < stepsToNewTail; i++) {
        newTail = newTail.next;
    }

    // Step 5: New head
    const newHead = newTail.next;

    // Step 6: Break circle
    newTail.next = null;

    return newHead;
};
```

### 5.4 Correctness Proof

**Claim:** Rotating right by k is equivalent to making the list circular and breaking at position `n - k`.

**Proof:**

1. Right rotation by 1: the last element moves to the front. The new head is at index `n - 1` (0-indexed), and the new tail is at index `n - 2`. The break point is at index `n - 1 - 1 = n - 2`, which is `n - k = n - 1` steps from head (to land on index `n - 1 - 1`). ✓

2. Generalizing: right rotation by k means the last k elements move to the front. The new head is the node at original index `n - k`. To reach the node just *before* it (the new tail), we walk `n - k - 1` steps from head (indices 0 through `n-k-1`). That's `n - k` nodes from head through new tail, so `n - k - 1` hops. ✓

3. After making the list circular (tail.next = head), all indices are accessible. Breaking at newTail gives us `[n-k, n-k+1, ..., n-1, 0, 1, ..., n-k-1]`, which is exactly the right rotation by k. ✓ ∎

### 5.5 Dry Run — Example 1

**Input:** `head = [1,2,3,4,5]`, `k = 2`

| Step | Action | State |
|------|--------|-------|
| 1 | Find length & tail | `n = 5`, `tail = node(5)` |
| 2 | Reduce k | `k = 2 % 5 = 2` |
| 3 | Make circular | `5.next → 1` (circle: 1→2→3→4→5→1→...) |
| 4 | Walk `n - k = 3` steps | `stepsToNewTail = 3` |
| 4a | Start: `newTail = node(1)` | hop 0 |
| 4b | `newTail = node(2)` | hop 1 |
| 4c | `newTail = node(3)` | hop 2 (done: walked 3-1=2 hops) |
| 5 | New head | `newHead = newTail.next = node(4)` |
| 6 | Break circle | `node(3).next = null` |
| — | Result | `4 → 5 → 1 → 2 → 3 → null` |

✅ Output: `[4,5,1,2,3]`

### 5.6 Dry Run — Example 2

**Input:** `head = [0,1,2]`, `k = 4`

| Step | Action | State |
|------|--------|-------|
| 1 | Find length & tail | `n = 3`, `tail = node(2)` |
| 2 | Reduce k | `k = 4 % 3 = 1` |
| 3 | Make circular | `2.next → 0` (circle: 0→1→2→0→...) |
| 4 | Walk `n - k = 2` steps | `stepsToNewTail = 2` |
| 4a | Start: `newTail = node(0)` | hop 0 |
| 4b | `newTail = node(1)` | hop 1 (done) |
| 5 | New head | `newHead = newTail.next = node(2)` |
| 6 | Break circle | `node(1).next = null` |
| — | Result | `2 → 0 → 1 → null` |

✅ Output: `[2,0,1]`

### 5.7 Time & Space Complexity

| Metric | Value | Derivation |
|--------|-------|------------|
| **Time** | **O(n)** | Walk to find tail: O(n). Walk n-k steps to find new tail: O(n). Total: O(n). This is tight — reading all nodes is Ω(n). |
| **Space** | **O(1)** | Only pointer variables: `tail`, `newTail`, `newHead`. No arrays, no recursion. |

### 5.8 Visual Diagram (ASCII)

```
Original:   1 → 2 → 3 → 4 → 5 → null     k=2, n=5

Step 3 — Make circular:
          ┌──────────────────────────┐
          ↓                          |
          1 → 2 → 3 → 4 → 5 ────────┘

Step 4 — Walk n-k = 3 steps from head to find newTail:
          1 → 2 → 3    [newTail = node(3)]
                    ↓
          newHead = 4

Step 6 — Break circle at newTail:
          4 → 5 → 1 → 2 → 3 → null
          \_____/   \_________/
          moved      stayed
          to front   in order
```

---

## 6. Approach Comparison Summary

| Approach | Time | Space | Key Idea |
|----------|------|-------|----------|
| Brute-Force (simulate k times) | O(k × n) | O(1) | Pop tail, prepend to head — k times |
| Improved (reduce k, simulate) | O(n²) worst | O(1) | k ← k%n first, then simulate |
| **Optimal (circular + break)** | **O(n)** | **O(1)** | Make circular, walk n-k, break |

---

## 7. Interview-Ready Explanation (60–90 seconds)

> *"To rotate a linked list right by k, I observe that rotation by the list length n gives back the same list, so I first reduce k to k mod n.*
>
> *My approach: I walk to the end to find the length n and the tail node. Then I make the list circular by connecting the tail to the head. Now I need to find the new break point: the new tail is at position n minus k from the head. I walk n minus k minus 1 hops to land on it. The node after it becomes the new head, and I break the circle by setting newTail.next to null.*
>
> *This gives O(n) time with two passes — one to find length, one to find the break point — and O(1) space since I only use pointer variables. The key insight is that right rotation is just cutting the list at position n minus k and swapping the two halves."*

---

## 8. Assumptions

1. `ListNode` has `val` and `next` properties.
2. An empty list or single-node list returns as-is.
3. `k = 0` returns the original list unchanged.
4. "Right rotation by k" means the last k elements wrap around to the front.
