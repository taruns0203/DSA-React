# 86. Partition List

---

## 1. High-Level Interpretation

You are given a **singly linked list** and a value `x`. Your task is to **rearrange** the list so that every node with a value **less than `x`** appears **before** every node with a value **greater than or equal to `x`**. Crucially, you must **preserve the original relative order** within each partition — this is what makes it a **stable partition**, not just any rearrangement.

**Why it matters:** This is the linked-list analogue of the partition step in quicksort, but with a stability requirement. It tests your ability to manipulate list pointers cleanly without losing nodes or creating cycles.

### Hidden traps & edge cases:
- **Empty list** (`head = null`) — must return null.
- **All nodes < x** or **all nodes ≥ x** — the list doesn't change.
- **Duplicates** — nodes equal to `x` must go to the "≥ x" group, and their order must be preserved.
- **Cycle creation** — if you don't null-terminate the "≥ x" tail, you create an infinite loop.
- **Single node** — trivially correct, but code must handle it.

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

## 3. Brute-Force Approach — Collect, Separate, Rebuild

### 3.1 Idea in Plain Words

The simplest approach: traverse the list, **collect all values into an array**, split the array into two groups (values < x and values ≥ x while preserving order), concatenate the two groups, then **rebuild a new linked list** from the resulting array.

### 3.2 Pseudocode

```
function partition(head, x):
    if head is null: return null

    // Step 1: Collect all values
    values = []
    curr = head
    while curr is not null:
        values.push(curr.val)
        curr = curr.next

    // Step 2: Separate into two groups (order preserved)
    less = values.filter(v => v < x)
    greaterEq = values.filter(v => v >= x)

    // Step 3: Merge
    merged = less.concat(greaterEq)

    // Step 4: Rebuild linked list
    dummy = new ListNode(0)
    curr = dummy
    for each val in merged:
        curr.next = new ListNode(val)
        curr = curr.next

    return dummy.next
```

### 3.3 JavaScript Implementation

```javascript
var partition = function(head, x) {
    if (!head) return null;

    // Collect all values
    const values = [];
    let curr = head;
    while (curr) {
        values.push(curr.val);
        curr = curr.next;
    }

    // Separate into two groups preserving order
    const less = values.filter(v => v < x);
    const greaterEq = values.filter(v => v >= x);

    // Merge and rebuild
    const merged = less.concat(greaterEq);
    const dummy = new ListNode(0);
    curr = dummy;
    for (const val of merged) {
        curr.next = new ListNode(val);
        curr = curr.next;
    }

    return dummy.next;
};
```

### 3.4 Time & Space Complexity

| Metric | Value | Derivation |
|--------|-------|------------|
| **Time** | **O(n)** | One pass to collect (O(n)) + two filter passes (O(n) each) + one pass to rebuild (O(n)) = O(n) |
| **Space** | **O(n)** | `values`, `less`, `greaterEq`, and `merged` arrays + new nodes = O(n) total |

### 3.5 Dry Run

**Input:** `head = [1, 4, 3, 2, 5, 2]`, `x = 3`

| Step | Action | State |
|------|--------|-------|
| 1 | Collect values | `values = [1, 4, 3, 2, 5, 2]` |
| 2 | Filter < 3 | `less = [1, 2, 2]` |
| 3 | Filter ≥ 3 | `greaterEq = [4, 3, 5]` |
| 4 | Concatenate | `merged = [1, 2, 2, 4, 3, 5]` |
| 5 | Rebuild list | `1 → 2 → 2 → 4 → 3 → 5 → null` |

✅ Output: `[1, 2, 2, 4, 3, 5]` — matches expected!

### 3.6 Why This Approach Is Suboptimal

- **O(n) extra space** for arrays — completely unnecessary for a linked-list problem.
- **Creates entirely new nodes** instead of rewiring existing ones.
- Multiple passes over the data (filter creates separate iterations).
- Doesn't leverage the fact that linked lists make pointer manipulation free.

---

## 4. Improved Approach — Single-Pass with Two Auxiliary Lists (Using Original Nodes)

### 4.1 What Changed and Why

Instead of collecting into arrays and rebuilding, we **reuse the original nodes**. We maintain two separate linked lists as we walk through:

1. **`less` list** — collects nodes with values < x
2. **`greaterEq` list** — collects nodes with values ≥ x

At the end, we **concatenate** the two lists. We use **dummy heads** to simplify insertion logic (no special cases for empty lists).

**This eliminates the array overhead and avoids creating new nodes.**

### 4.2 Pseudocode

```
function partition(head, x):
    lessDummy = new ListNode(0)     // dummy head for < x list
    geqDummy  = new ListNode(0)     // dummy head for ≥ x list
    lessPtr = lessDummy
    geqPtr  = geqDummy

    curr = head
    while curr is not null:
        if curr.val < x:
            lessPtr.next = curr
            lessPtr = lessPtr.next
        else:
            geqPtr.next = curr
            geqPtr = geqPtr.next
        curr = curr.next

    // CRITICAL: null-terminate the ≥x list to avoid cycles
    geqPtr.next = null

    // Concatenate: less list → ≥x list
    lessPtr.next = geqDummy.next

    return lessDummy.next
```

### 4.3 JavaScript Implementation

```javascript
var partition = function(head, x) {
    const lessDummy = new ListNode(0);  // dummy for < x
    const geqDummy  = new ListNode(0);  // dummy for >= x
    let lessPtr = lessDummy;
    let geqPtr  = geqDummy;

    let curr = head;
    while (curr) {
        if (curr.val < x) {
            lessPtr.next = curr;
            lessPtr = lessPtr.next;
        } else {
            geqPtr.next = curr;
            geqPtr = geqPtr.next;
        }
        curr = curr.next;
    }

    // CRITICAL: prevent cycle
    geqPtr.next = null;

    // Concatenate
    lessPtr.next = geqDummy.next;

    return lessDummy.next;
};
```

### 4.4 Time & Space Complexity

| Metric | Value | Derivation |
|--------|-------|------------|
| **Time** | **O(n)** | Single pass through all n nodes. Each node does O(1) work (pointer assignment). |
| **Space** | **O(1)** | Only 2 dummy nodes and a few pointers. We reuse original nodes, no extra data structures. |

### 4.5 Dry Run

**Input:** `head = [1, 4, 3, 2, 5, 2]`, `x = 3`

| Step | `curr` | `curr.val < 3?` | Action | `less` list | `geq` list |
|------|--------|-----------------|--------|-------------|------------|
| 1 | 1 | ✅ Yes | Append to less | `→1` | `(empty)` |
| 2 | 4 | ❌ No | Append to geq | `→1` | `→4` |
| 3 | 3 | ❌ No (3 ≥ 3) | Append to geq | `→1` | `→4→3` |
| 4 | 2 | ✅ Yes | Append to less | `→1→2` | `→4→3` |
| 5 | 5 | ❌ No | Append to geq | `→1→2` | `→4→3→5` |
| 6 | 2 | ✅ Yes | Append to less | `→1→2→2` | `→4→3→5` |
| 7 | null | — | Loop ends | — | — |
| 8 | — | — | `geqPtr.next = null` | — | `→4→3→5→∅` |
| 9 | — | — | `lessPtr.next = geqDummy.next` | `→1→2→2→4→3→5→∅` | — |

✅ Output: `[1, 2, 2, 4, 3, 5]` — matches expected!

### 4.6 Visual Diagram (ASCII)

```
Input:  1 → 4 → 3 → 2 → 5 → 2 → null     x = 3

During traversal, nodes are sorted into two chains:

  less chain:    D → 1 → 2 → 2
                 ↑                ↑
              lessDummy        lessPtr

  geq chain:    D → 4 → 3 → 5
                ↑                ↑
              geqDummy        geqPtr

After concatenation:

  1 → 2 → 2 → 4 → 3 → 5 → null
  \_________/   \_________/
   vals < 3      vals ≥ 3
```

### 4.7 Trade-offs

| Advantage | Disadvantage |
|-----------|-------------|
| O(1) space — truly in-place | Requires careful null-termination (cycle trap!) |
| Single pass — optimal time | Must handle dummy node pattern |
| Preserves original node objects | — |
| Clean, readable code | — |

---

## 5. Optimal / Best Approach

### 5.1 Why the Improved Approach IS the Optimal

The improved approach (two-pointer partition with dummy heads) **is already optimal**:

- **O(n) time** is a lower bound — we must examine every node at least once.
- **O(1) space** is the best possible — we only use a constant number of pointer variables.
- **Single pass** — no redundant work.
- **Stable** — relative order is preserved in both partitions because we process nodes in their original order.

There is no asymptotically better approach. However, let's present it cleanly as the final, polished solution.

### 5.2 Intuition — Why It's Correct

Think of it as **sorting mail into two bins**:

1. Walk through the linked list one node at a time.
2. If the current node's value is less than `x`, drop it into the "small" bin.
3. Otherwise, drop it into the "big" bin.
4. When done, tape the "big" bin's chain onto the end of the "small" bin's chain.

Because we process nodes **in order** and append them to the **tail** of each bin, the relative order within each bin matches the original list. The dummy heads eliminate edge cases for empty bins.

### 5.3 Final Pseudocode

```
function partition(head, x):
    // Create two dummy-headed chains
    smallDummy = new ListNode(0)
    bigDummy   = new ListNode(0)
    small = smallDummy
    big   = bigDummy

    // Single pass: route each node to the correct chain
    curr = head
    while curr ≠ null:
        if curr.val < x:
            small.next = curr
            small = small.next
        else:
            big.next = curr
            big = big.next
        curr = curr.next

    // CRITICAL: null-terminate big chain (prevents cycle!)
    big.next = null

    // Concatenate: small chain → big chain
    small.next = bigDummy.next

    return smallDummy.next
```

### 5.4 Final JavaScript Implementation

```javascript
/**
 * @param {ListNode} head
 * @param {number} x
 * @return {ListNode}
 */
var partition = function(head, x) {
    // Two dummy-headed chains
    const smallDummy = new ListNode(0);
    const bigDummy   = new ListNode(0);
    let small = smallDummy;
    let big   = bigDummy;

    // Route each node
    let curr = head;
    while (curr) {
        if (curr.val < x) {
            small.next = curr;
            small = small.next;
        } else {
            big.next = curr;
            big = big.next;
        }
        curr = curr.next;
    }

    // Prevent cycle: null-terminate the big chain
    big.next = null;

    // Concatenate small → big
    small.next = bigDummy.next;

    return smallDummy.next;
};
```

### 5.5 Correctness Proof

**Invariant:** After processing the first k nodes:
1. The `small` chain contains all nodes with val < x among the first k nodes, in their original relative order.
2. The `big` chain contains all nodes with val ≥ x among the first k nodes, in their original relative order.

**Proof by induction:**

- **Base case (k = 0):** Both chains are empty (only dummy heads). The invariant holds vacuously.

- **Inductive step:** Assume the invariant holds after processing k nodes. When we process node k+1:
  - If `node.val < x`: it's appended to the tail of `small`. All previous small nodes remain in order, and this node comes after them — preserving the original order among all (k+1) small nodes. ✓
  - If `node.val ≥ x`: it's appended to the tail of `big`. Same reasoning. ✓

- **Termination:** After all n nodes are processed, `small` has all < x nodes in order, `big` has all ≥ x nodes in order. Concatenating `small → big` produces the correct partition. Setting `big.next = null` prevents cycles from lingering `.next` pointers. ∎

### 5.6 Dry Run — Example 1

**Input:** `head = [1, 4, 3, 2, 5, 2]`, `x = 3`

| Step | `curr` | `val` | `< x?` | `small` chain | `big` chain | Action |
|------|--------|-------|--------|---------------|-------------|--------|
| 0 | — | — | — | `D→` | `D→` | Init dummies |
| 1 | node(1) | 1 | ✅ | `D→1` | `D→` | 1 → small |
| 2 | node(4) | 4 | ❌ | `D→1` | `D→4` | 4 → big |
| 3 | node(3) | 3 | ❌ | `D→1` | `D→4→3` | 3 → big (3 ≥ 3) |
| 4 | node(2) | 2 | ✅ | `D→1→2` | `D→4→3` | 2 → small |
| 5 | node(5) | 5 | ❌ | `D→1→2` | `D→4→3→5` | 5 → big |
| 6 | node(2) | 2 | ✅ | `D→1→2→2` | `D→4→3→5` | 2 → small |
| 7 | null | — | — | — | — | Loop ends |
| — | — | — | — | — | `D→4→3→5→∅` | `big.next = null` |
| — | — | — | — | `D→1→2→2→4→3→5→∅` | — | Concatenate |

✅ **Output:** `[1, 2, 2, 4, 3, 5]`

### 5.7 Dry Run — Example 2

**Input:** `head = [2, 1]`, `x = 2`

| Step | `curr` | `val` | `< 2?` | `small` chain | `big` chain |
|------|--------|-------|--------|---------------|-------------|
| 0 | — | — | — | `D→` | `D→` |
| 1 | node(2) | 2 | ❌ | `D→` | `D→2` |
| 2 | node(1) | 1 | ✅ | `D→1` | `D→2` |
| 3 | null | — | — | — | — |
| — | — | — | — | `D→1→2→∅` | — |

✅ **Output:** `[1, 2]`

### 5.8 Time & Space Complexity

| Metric | Value | Derivation |
|--------|-------|------------|
| **Time** | **O(n)** | We visit each of the n nodes exactly once. Each visit does O(1) pointer work. This is tight — Ω(n) is a lower bound. |
| **Space** | **O(1)** | Only 4 pointer variables (`smallDummy`, `bigDummy`, `small`, `big`) plus `curr`. No arrays, no recursion, no extra nodes beyond 2 dummies. |

**Practical performance:** This is as fast and memory-efficient as it gets. On LeetCode, it runs in 0-1ms.

---

## 6. The Critical Trap: Why `big.next = null`?

This is the **#1 mistake** people make. Consider what happens without it:

```
Input: [1, 4, 3, 2, 5, 2], x = 3

After the loop:
  small chain: D → 1 → 2 → 2
  big chain:   D → 4 → 3 → 5

BUT node 2 (the last node appended to small) still has its
ORIGINAL .next pointing to... node 5!  (from the original list)

And node 5 (last in big) still has its .next pointing to
node 2 (from the original list).

This creates: ... → 5 → 2 → ... → 5 → 2 → ...  (INFINITE CYCLE!)
```

The fix `big.next = null` breaks this cycle by explicitly terminating the big chain.

---

## 7. Approach Comparison Summary

| Approach | Time | Space | In-Place? | Key Idea |
|----------|------|-------|-----------|----------|
| Brute-Force (Array) | O(n) | O(n) | ❌ | Collect to array, filter, rebuild |
| **Optimal (Two Chains)** | **O(n)** | **O(1)** | **✅** | Two dummy-headed chains, single pass, concatenate |

---

## 8. Interview-Ready Explanation (60–90 seconds)

> *"This problem asks me to partition a linked list around a value x, keeping relative order stable.*
>
> *My approach uses two dummy-headed chains: one for nodes less than x, one for nodes greater than or equal to x. I walk through the original list once. For each node, I compare its value to x and append it to the appropriate chain's tail.*
>
> *After the loop, I do two things: first, I null-terminate the 'big' chain to prevent cycles — this is critical because the last node in the big chain might still point to a node that's now in the small chain. Second, I concatenate by pointing the small chain's tail to the big chain's head.*
>
> *This gives me O(n) time since I visit each node once, and O(1) space since I only use pointer variables — no arrays, no recursion. The relative order is preserved because I process nodes in their original sequence and always append to the tail."*

---

## 9. Assumptions

1. The `ListNode` class has `val` and `next` properties as defined in the problem.
2. An empty list (`head = null`) should return `null`.
3. The partition is **stable** — relative order within each group matches the original list.
4. Nodes with `val === x` go into the "≥ x" group.
