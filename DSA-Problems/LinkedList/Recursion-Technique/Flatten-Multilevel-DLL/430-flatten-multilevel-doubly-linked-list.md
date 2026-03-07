# 430. Flatten a Multilevel Doubly Linked List

---

## 1. High-Level Interpretation

You are given a **doubly linked list** where each node has three pointers: `prev`, `next`, and `child`. The `child` pointer can point to an entirely separate doubly linked list, which itself may have children — creating a **tree-like, multilevel structure**.

Your job is to **flatten** this multilevel structure into a **single-level** doubly linked list. The rule for ordering is: when a node has a child list, the entire child sub-list (recursively flattened) must be **inserted between that node and its `.next` node**. After flattening, every node's `.child` pointer must be set to `null`.

**Why it matters:** This problem tests your ability to manipulate linked-list pointers in-place, handle recursive/nested structures, and think about how a depth-first traversal naturally produces the correct ordering.

### Hidden traps & edge cases:
- **Deep nesting:** A child can have a child that has a child… You must handle arbitrary depth.
- **Null head:** The list can be empty (`head = null`).
- **Child at the tail:** The node with a child might be the last node on its level (i.e., `node.next === null`). You must handle reconnecting correctly.
- **Pointer hygiene:** You must set **all** `.child` pointers to `null` and ensure every `.prev` pointer is correctly wired.

---

## 2. Node Definition

```javascript
class Node {
    constructor(val, prev, next, child) {
        this.val = val;
        this.prev = prev || null;
        this.next = next || null;
        this.child = child || null;
    }
}
```

---

## 3. Brute-Force Approach — Collect & Rebuild

### 3.1 Idea in Plain Words

The simplest way to think about this: **traverse the entire multilevel structure in the correct order** (depth-first), **collect all node values into an array**, then **build a brand-new single-level doubly linked list** from that array.

This is brute-force because:
1. We throw away the existing list structure.
2. We use **O(n) extra space** for the array.
3. We create entirely new connections instead of rewiring in-place.

### 3.2 Pseudocode

```
function flatten(head):
    if head is null: return null

    values = []
    dfs(head, values)

    // Rebuild a single-level DLL from values[]
    newHead = new Node(values[0])
    current = newHead
    for i = 1 to values.length - 1:
        newNode = new Node(values[i])
        current.next = newNode
        newNode.prev = current
        current = newNode

    return newHead

function dfs(node, values):
    while node is not null:
        values.push(node.val)
        if node.child is not null:
            dfs(node.child, values)   // go deeper first
        node = node.next
```

### 3.3 JavaScript Implementation

```javascript
var flatten = function(head) {
    if (!head) return null;

    const values = [];

    // DFS to collect values in the correct flattened order
    function dfs(node) {
        while (node) {
            values.push(node.val);
            if (node.child) {
                dfs(node.child);
            }
            node = node.next;
        }
    }

    dfs(head);

    // Rebuild a fresh single-level DLL
    const newHead = new Node(values[0]);
    let current = newHead;
    for (let i = 1; i < values.length; i++) {
        const newNode = new Node(values[i]);
        current.next = newNode;
        newNode.prev = current;
        current = newNode;
    }

    return newHead;
};
```

### 3.4 Time & Space Complexity

| Metric | Value | Derivation |
|--------|-------|------------|
| **Time** | **O(n)** | We visit every node exactly once during DFS, then iterate through the array once to rebuild → O(n) + O(n) = O(n) |
| **Space** | **O(n)** | The `values` array stores all n node values. The DFS call stack can go up to O(d) deep where d is the nesting depth, but d ≤ n, so worst case O(n) total |

### 3.5 Dry Run

**Input:**
```
 1---2---3---4---5---6--NULL
         |
         7---8---9---10--NULL
             |
             11--12--NULL
```

| Step | Node Visited | Action | `values[]` |
|------|-------------|--------|------------|
| 1 | 1 | Push 1, no child, move next | `[1]` |
| 2 | 2 | Push 2, no child, move next | `[1,2]` |
| 3 | 3 | Push 3, **has child → recurse** | `[1,2,3]` |
| 4 | ↳ 7 | Push 7, no child, move next | `[1,2,3,7]` |
| 5 | ↳ 8 | Push 8, **has child → recurse** | `[1,2,3,7,8]` |
| 6 | ↳↳ 11 | Push 11, no child, move next | `[1,2,3,7,8,11]` |
| 7 | ↳↳ 12 | Push 12, no child, next=null → return | `[1,2,3,7,8,11,12]` |
| 8 | ↳ 9 | Push 9, no child, move next | `[1,2,3,7,8,11,12,9]` |
| 9 | ↳ 10 | Push 10, no child, next=null → return | `[1,2,3,7,8,11,12,9,10]` |
| 10 | 4 | Push 4, no child, move next | `[1,2,3,7,8,11,12,9,10,4]` |
| 11 | 5 | Push 5, no child, move next | `[1,2,3,7,8,11,12,9,10,4,5]` |
| 12 | 6 | Push 6, no child, next=null → done | `[1,2,3,7,8,11,12,9,10,4,5,6]` |

**Rebuild:** Create DLL: `1⇄2⇄3⇄7⇄8⇄11⇄12⇄9⇄10⇄4⇄5⇄6`

✅ Output: `[1,2,3,7,8,11,12,9,10,4,5,6]` — matches expected!

### 3.6 Why This Approach Is Suboptimal

- **Extra O(n) space** for the values array — wasteful when we could rewire in-place.
- **Destroys original node objects** — in some contexts (e.g., if nodes carry extra metadata), rebuilding from scratch is not acceptable.
- The traversal itself is O(n) which is optimal, but we can do better on **space**.

---

## 4. Improved Approach — Recursive DFS with In-Place Pointer Rewiring

### 4.1 What Changed and Why

Instead of collecting values and rebuilding, we **rewire the pointers in-place** during a recursive DFS. When we encounter a node with a child:

1. **Recursively flatten** the child list first (this returns a single-level list).
2. **Splice** the flattened child list between `node` and `node.next`.
3. Set `node.child = null`.

The key insight: if we can recursively flatten any child list into a regular DLL, then inserting it is just pointer manipulation.

We need to find the **tail** of the flattened child list to connect it to `node.next`.

### 4.2 Pseudocode

```
function flatten(head):
    if head is null: return null
    flattenDFS(head)
    return head

function flattenDFS(head):
    // Returns the TAIL of the flattened list starting at head
    current = head
    last = head

    while current is not null:
        next = current.next    // save next before we modify pointers

        if current.child is not null:
            childTail = flattenDFS(current.child)  // flatten child, get its tail

            // Splice child list after current
            current.next = current.child
            current.child.prev = current

            // Connect tail of child list to saved next
            childTail.next = next
            if next is not null:
                next.prev = childTail

            // Clear child pointer
            current.child = null

            last = childTail    // update last to the deepest point we've reached
        else:
            last = current

        current = next          // move to original next (now after the spliced child)

    return last
```

### 4.3 JavaScript Implementation

```javascript
var flatten = function(head) {
    if (!head) return null;

    function flattenDFS(node) {
        let curr = node;
        let last = node;

        while (curr) {
            const next = curr.next; // save original next

            if (curr.child) {
                const childTail = flattenDFS(curr.child); // recursively flatten

                // Splice: curr -> [child list] -> next
                curr.next = curr.child;
                curr.child.prev = curr;

                childTail.next = next;
                if (next) {
                    next.prev = childTail;
                }

                curr.child = null; // clear child pointer
                last = childTail;
            } else {
                last = curr;
            }

            curr = next; // advance using saved pointer
        }

        return last; // return tail of this flattened segment
    }

    flattenDFS(head);
    return head;
};
```

### 4.4 Time & Space Complexity

| Metric | Value | Derivation |
|--------|-------|------------|
| **Time** | **O(n)** | Every node is visited exactly once. The recursive calls collectively cover all nodes without revisiting. |
| **Space** | **O(d)** | Where d = maximum nesting depth. The recursion stack goes as deep as the deepest child chain. In the worst case (every node has a child but no next), d = n → O(n). Average/typical case: O(d) where d ≪ n. |

### 4.5 Dry Run

**Input:**
```
 1---2---3---4---5---6--NULL
         |
         7---8---9---10--NULL
             |
             11--12--NULL
```

**Call: `flattenDFS(1)`**

| Step | `curr` | `curr.child?` | Action | List State |
|------|--------|-------------|--------|------------|
| 1 | 1 | No | last=1, move to 2 | `1⇄2⇄3⇄4⇄5⇄6` (children still attached) |
| 2 | 2 | No | last=2, move to 3 | (same) |
| 3 | 3 | **Yes (→7)** | Save next=4. Call `flattenDFS(7)` ↓ | — |

**Call: `flattenDFS(7)`**

| Step | `curr` | `curr.child?` | Action | List State |
|------|--------|-------------|--------|------------|
| 3a | 7 | No | last=7, move to 8 | `7⇄8⇄9⇄10` (child 11 still attached) |
| 3b | 8 | **Yes (→11)** | Save next=9. Call `flattenDFS(11)` ↓ | — |

**Call: `flattenDFS(11)`**

| Step | `curr` | `curr.child?` | Action |
|------|--------|-------------|--------|
| 3b-i | 11 | No | last=11, move to 12 |
| 3b-ii | 12 | No | last=12, next=null → **return 12** |

**Back in `flattenDFS(7)` at step 3b:**

| Step | Action | Resulting connections |
|------|--------|---------------------|
| 3c | childTail=12. Splice: 8→11⇄12→9. Clear 8.child. last=12 | `7⇄8⇄11⇄12⇄9⇄10` |
| 3d | curr=9, no child, last=9 | — |
| 3e | curr=10, no child, last=10, next=null → **return 10** | — |

**Back in `flattenDFS(1)` at step 3:**

| Step | Action | Resulting connections |
|------|--------|---------------------|
| 4 | childTail=10. Splice: 3→7⇄8⇄11⇄12⇄9⇄10→4. Clear 3.child. last=10 | `1⇄2⇄3⇄7⇄8⇄11⇄12⇄9⇄10⇄4⇄5⇄6` |
| 5 | curr=4, no child, last=4 | — |
| 6 | curr=5, no child, last=5 | — |
| 7 | curr=6, no child, last=6 → **return 6** | — |

✅ Final: `1⇄2⇄3⇄7⇄8⇄11⇄12⇄9⇄10⇄4⇄5⇄6`

### 4.6 Trade-offs

| Advantage | Disadvantage |
|-----------|-------------|
| In-place rewiring — no extra array | Recursive call stack uses O(d) space |
| Preserves original node objects | Slightly harder to reason about pointer correctness |
| Clean separation of concerns (flatten child, then splice) | Worst-case O(n) stack depth if list is "all children, no nexts" |

---

## 5. Optimal Approach — Iterative In-Place Flattening (No Recursion)

### 5.1 Intuition — Why It's Correct

The key insight is beautifully simple:

> **When you encounter a node with a child, find the tail of that child list, then splice the child list between that node and its next. Continue walking forward.**

By doing this **iteratively** (no recursion), you naturally handle nested children because after you splice a child list in, any deeper children that were in that child list are now part of the main list ahead of you — you'll encounter them as you keep walking forward!

Think of it like **unrolling a scroll**: every time you hit a child, you unroll it into the main path. If that unrolled section has further child scrolls, you'll reach them later on your single linear pass.

**This is essentially a DFS traversal, but done iteratively by modifying the list structure as we go.**

### 5.2 Visual Diagram (ASCII)

```
BEFORE:
  1 ⇄ 2 ⇄ 3 ⇄ 4 ⇄ 5 ⇄ 6
              |
              7 ⇄ 8 ⇄ 9 ⇄ 10
                  |
                  11 ⇄ 12

STEP 1: curr=3 has child. Find tail of child list (10).
         Splice 7..10 between 3 and 4.

  1 ⇄ 2 ⇄ 3 ⇄ 7 ⇄ 8 ⇄ 9 ⇄ 10 ⇄ 4 ⇄ 5 ⇄ 6
                    |
                    11 ⇄ 12

STEP 2: Continue walking. curr=8 has child. Find tail of child list (12).
         Splice 11..12 between 8 and 9.

  1 ⇄ 2 ⇄ 3 ⇄ 7 ⇄ 8 ⇄ 11 ⇄ 12 ⇄ 9 ⇄ 10 ⇄ 4 ⇄ 5 ⇄ 6

DONE! No more children. Single-level list achieved.
```

### 5.3 Pseudocode

```
function flatten(head):
    if head is null: return null

    curr = head

    while curr is not null:
        if curr.child is not null:
            // 1. Find the tail of the child sub-list
            tail = curr.child
            while tail.next is not null:
                tail = tail.next

            // 2. Connect tail to curr.next
            tail.next = curr.next
            if curr.next is not null:
                curr.next.prev = tail

            // 3. Connect curr to child
            curr.next = curr.child
            curr.child.prev = curr

            // 4. Clear child pointer
            curr.child = null

        curr = curr.next

    return head
```

### 5.4 JavaScript Implementation

```javascript
/**
 * @param {Node} head
 * @return {Node}
 */
var flatten = function(head) {
    if (!head) return null;

    let curr = head;

    while (curr) {
        if (curr.child) {
            // Step 1: Find the tail of the child sub-list
            let tail = curr.child;
            while (tail.next) {
                tail = tail.next;
            }

            // Step 2: Connect tail of child list to curr.next
            tail.next = curr.next;
            if (curr.next) {
                curr.next.prev = tail;
            }

            // Step 3: Connect curr to the child list head
            curr.next = curr.child;
            curr.child.prev = curr;

            // Step 4: Remove the child pointer
            curr.child = null;
        }

        // Move to next node (which may now be the former child head)
        curr = curr.next;
    }

    return head;
};
```

### 5.5 Correctness Proof

**Invariant:** At any point during the iteration, all nodes before `curr` form a valid, single-level doubly linked list with no child pointers.

**Proof by induction on the position of `curr`:**

1. **Base case:** Before the loop starts, `curr = head`. No nodes are before `curr`, so the invariant holds vacuously.

2. **Inductive step:** Assume all nodes before `curr` are correctly flattened. When we process `curr`:
   - **If `curr.child` is null:** `curr` itself has no child, so it's already flat. We advance `curr = curr.next`. The invariant still holds (we added one more flat node to the "before curr" region).
   - **If `curr.child` is not null:** We splice the entire child sub-list between `curr` and `curr.next`. After splicing:
     - `curr.child` is nulled → `curr` is now flat.
     - The child sub-list is now in the main list ahead of us. Any nested children within it will be encountered and processed in future iterations.
     - We advance `curr = curr.next` (which is now the child list's head).
     - The invariant holds: everything before the new `curr` is flat.

3. **Termination:** The loop terminates when `curr = null`. At this point, all nodes are behind `curr`, meaning the entire list is flat. ∎

### 5.6 Dry Run

**Input:**
```
 1---2---3---4---5---6--NULL
         |
         7---8---9---10--NULL
             |
             11--12--NULL
```

| Step | `curr` | Has child? | Action | List State After |
|------|--------|-----------|--------|-----------------|
| 1 | 1 | No | Advance | `1⇄2⇄3(↓7)⇄4⇄5⇄6` |
| 2 | 2 | No | Advance | (same) |
| 3 | 3 | **Yes (→7)** | Find tail of child: 7→8→9→**10**. Splice: `3→7..10→4`. Null child. | `1⇄2⇄3⇄7⇄8(↓11)⇄9⇄10⇄4⇄5⇄6` |
| 4 | 7 | No | Advance | (same) |
| 5 | 8 | **Yes (→11)** | Find tail of child: 11→**12**. Splice: `8→11..12→9`. Null child. | `1⇄2⇄3⇄7⇄8⇄11⇄12⇄9⇄10⇄4⇄5⇄6` |
| 6 | 11 | No | Advance | (same) |
| 7 | 12 | No | Advance | (same) |
| 8 | 9 | No | Advance | (same) |
| 9 | 10 | No | Advance | (same) |
| 10 | 4 | No | Advance | (same) |
| 11 | 5 | No | Advance | (same) |
| 12 | 6 | No | Advance → curr=null → **DONE** | (same) |

✅ **Output:** `1⇄2⇄3⇄7⇄8⇄11⇄12⇄9⇄10⇄4⇄5⇄6`

### 5.7 Dry Run on Example 2

**Input:**
```
 1---2---NULL
 |
 3
```
(Node 1 has child=3, and next=2)

| Step | `curr` | Has child? | Action | List State After |
|------|--------|-----------|--------|-----------------|
| 1 | 1 | **Yes (→3)** | Tail of child: **3** (single node). Splice: `1→3→2`. Null child. | `1⇄3⇄2` |
| 2 | 3 | No | Advance | (same) |
| 3 | 2 | No | Advance → null → **DONE** | (same) |

✅ **Output:** `[1, 3, 2]`

### 5.8 Time & Space Complexity

| Metric | Value | Derivation |
|--------|-------|------------|
| **Time** | **O(n)** | Each node is visited at most **twice**: once when `curr` walks over it, and potentially once when we traverse it to find a child tail. Every node can only be a "tail-finding target" once (after splicing, its child pointer is cleared, so we never re-traverse it for tail-finding). Total work: at most 2n → **O(n)**. |
| **Space** | **O(1)** | Only a constant number of pointers (`curr`, `tail`). No recursion, no extra data structures. |

**Practical performance:** This is the best possible — O(n) time is a lower bound (we must visit every node at least once), and O(1) space means zero overhead beyond the input itself.

---

## 6. Approach Comparison Summary

| Approach | Time | Space | In-Place? | Key Idea |
|----------|------|-------|-----------|----------|
| Brute-Force (Collect & Rebuild) | O(n) | O(n) | ❌ | DFS to array, rebuild DLL |
| Recursive DFS (In-Place) | O(n) | O(d) | ✅ | Recursively flatten child, splice, return tail |
| **Iterative (Optimal)** | **O(n)** | **O(1)** | **✅** | Walk forward, splice children inline, nested children appear ahead |

---

## 7. Interview-Ready Explanation (60–90 seconds)

> *"This problem asks us to flatten a multilevel doubly linked list into a single level. The key insight is that we can do this iteratively in a single pass.*
>
> *I walk through the list node by node. Whenever I find a node that has a child, I do three things: first, I traverse to the tail of that child sub-list. Then I splice the entire child sub-list between the current node and its next node — connecting current to the child head, and the child tail to the original next. Finally, I null out the child pointer.*
>
> *The beautiful part is that if the child list itself contained deeper children, those are now part of the main list ahead of me, so I'll naturally process them as I keep walking forward. This means I handle arbitrary nesting depth without recursion.*
>
> *Time complexity is O(n) because each node is visited at most twice — once by the main traversal pointer and at most once during a tail-finding scan. Space is O(1) since I only use a couple of pointer variables, no recursion stack, and no auxiliary data structures."*

---

## 8. Assumptions

1. The `Node` class has `val`, `prev`, `next`, and `child` properties as defined in the problem.
2. An empty list (`head = null`) should return `null`.
3. All child pointers not explicitly set are already `null`.
4. The output should preserve the original node objects (not create copies) — this is satisfied by both the improved and optimal approaches.
