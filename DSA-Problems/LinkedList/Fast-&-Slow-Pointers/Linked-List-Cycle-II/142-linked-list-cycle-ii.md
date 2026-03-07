# 142. Linked List Cycle II

## High-Level Interpretation

Given the head of a singly linked list, determine whether it contains a **cycle** and, if so, return the **exact node** where the cycle begins. If there's no cycle, return `null`. A cycle exists when some node's `next` pointer points back to an earlier node, creating an infinite loop.

This problem is a classic **two-pointer / mathematical reasoning** problem. It appears simple on the surface but the optimal solution requires a non-obvious mathematical insight (Floyd's algorithm).

**Hidden Traps**:
* **Empty list / single node**: `head` can be `null`, or a single node with no cycle.
* **Cycle at head**: The tail might point back to the very first node (pos = 0).
* **Don't modify the list**: You can't mark visited nodes by changing `next` pointers.
* **Duplicate values**: Node *values* can repeat (e.g., `[1, 1, 1]`), so you must track node *references*, not values.
* **Return the node, not the index**: The function returns a `ListNode` reference, not a position number.

---

## Brute-Force Approach: Nested Traversal

### Description
For each node `A` in the list, start a second traversal from `head` and check if any node from `head` up to (but not including) `A` is the same node that `A.next` points to. If `A.next` points to a node we've already passed, that node is the cycle start.

Alternatively (simpler brute-force): for each node, walk up to `n` steps forward and see if you return to the same node.

The simplest brute-force is: keep a count of nodes seen. If we visit more than `n` nodes total, there must be a cycle. But finding the *start* of the cycle this way requires the second approach below.

### Pseudocode
```text
function detectCycle(head):
    // For each node, check if it's the target of some later node's next
    nodeA = head
    posA = 0
    
    while nodeA != null:
        // Check: does any node after nodeA eventually loop back to nodeA?
        // Walk from nodeA.next and see if we revisit nodeA
        nodeB = nodeA.next
        steps = 0
        
        while nodeB != null AND nodeB != nodeA:
            nodeB = nodeB.next
            steps++
            if steps > 10^4:   // exceeded max possible nodes → no cycle through nodeA
                break
        
        if nodeB == nodeA:
            return nodeA       // cycle starts at nodeA
        
        nodeA = nodeA.next
        posA++
        if posA > 10^4:
            return null        // safety: no cycle
    
    return null                // reached end → no cycle
```

### Time & Space Complexity
* **Time**: O(n²). For each of the n nodes, we potentially walk up to n steps to check for a cycle back to it.
* **Space**: O(1). No extra data structures.

### Dry Run — `head = [3,2,0,-4], pos = 1`

```
List structure: 3 → 2 → 0 → -4 → (back to 2)
```

| nodeA (posA) | Walk from nodeA.next | Reaches nodeA? | Result |
|-------------|---------------------|----------------|--------|
| 3 (pos 0) | 2→0→-4→2→0→-4→… never hits 3 | No (exceeds limit) | continue |
| 2 (pos 1) | 0→-4→**2** ← found it! | **Yes** | **return node 2** ✓ |

### Why This Is Slow
O(n²) worst case. For n = 10,000, that's ~10⁸ operations. It works but is inefficient. More importantly, it's clunky — there's a much cleaner approach.

---

## Improved Approach: HashSet of Visited Nodes

### What Changed
Instead of nested traversal, use a **HashSet** to record every node we've visited. As we traverse the list, the **first node we encounter twice** is the cycle start.

### Why This Works
In a linked list with a cycle:
```
head → … → cycleStart → … → tail → cycleStart (loop)
```
We walk linearly through the list. Every node before the cycle start is visited exactly once. The cycle start node is the first node we visit that's **already in the set**.

### Pseudocode
```text
function detectCycle(head):
    visited = empty HashSet
    current = head
    
    while current != null:
        if current is in visited:
            return current       // first revisited node = cycle start
        visited.add(current)
        current = current.next
    
    return null                  // reached end → no cycle
```

### JavaScript Implementation
```javascript
function detectCycle(head) {
    const visited = new Set();
    let current = head;
    
    while (current !== null) {
        if (visited.has(current)) {
            return current;  // cycle start
        }
        visited.add(current);
        current = current.next;
    }
    
    return null;
}
```

### Dry Run — `head = [3,2,0,-4], pos = 1`

```
List: 3 → 2 → 0 → -4 → (back to 2)
```

| Step | current | In visited? | Action | visited (node values) |
|------|---------|-------------|--------|-----------------------|
| 1 | 3 | No | Add 3 | {3} |
| 2 | 2 | No | Add 2 | {3, 2} |
| 3 | 0 | No | Add 0 | {3, 2, 0} |
| 4 | -4 | No | Add -4 | {3, 2, 0, -4} |
| 5 | **2** | **Yes** ✓ | **return node 2** | — |

**Output: node with value 2** ✓ (the cycle start)

### Dry Run — `head = [1,2], pos = 0`

```
List: 1 → 2 → (back to 1)
```

| Step | current | In visited? | Action | visited |
|------|---------|-------------|--------|---------|
| 1 | 1 | No | Add | {1} |
| 2 | 2 | No | Add | {1, 2} |
| 3 | **1** | **Yes** ✓ | **return node 1** | — |

**Output: node with value 1** ✓

### Time & Space Complexity
* **Time**: O(n). Single traversal, each node visited at most once before detection.
* **Space**: O(n). The HashSet stores up to n node references.

### Trade-Offs
* ✅ Simple, clean, easy to understand.
* ❌ O(n) extra memory. The follow-up asks for O(1) memory.

---

## Optimal Approach: Floyd's Cycle Detection (Tortoise and Hare)

### Intuition

Floyd's algorithm works in **two phases**:

**Phase 1 — Detect the cycle**: Use two pointers, `slow` (moves 1 step) and `fast` (moves 2 steps). If there's a cycle, they will eventually **meet** inside the cycle.

**Phase 2 — Find the cycle start**: Once they meet, place one pointer back at `head` and keep the other at the meeting point. Move both at **speed 1**. The point where they meet again is the **cycle start**.

### Why Phase 2 Works — The Math

Let's define:
* `F` = distance from head to cycle start (the "tail" length)
* `C` = cycle length
* `a` = distance from cycle start to the meeting point (within the cycle)

```
head ——F——→ cycleStart ——a——→ meetingPoint
                  ↑                    |
                  |←—— (C - a) ————————|
```

**When slow and fast meet:**
* `slow` has traveled: `F + a` steps
* `fast` has traveled: `F + a + k·C` steps (for some integer k ≥ 1, fast looped k times)
* Since fast moves at 2× speed: `2(F + a) = F + a + k·C`
* Simplifying: **`F + a = k·C`**, which means **`F = k·C - a`**
* Rearranging: **`F = (k-1)·C + (C - a)`**

This tells us: if you walk `F` steps from the meeting point, you arrive at the cycle start (since `(C - a)` is the remaining distance to complete the cycle, and `(k-1)·C` is full loops that don't change position).

And `F` steps from `head` is… the cycle start!

So both pointers, one from `head` and one from the meeting point, meet at the **cycle start** after exactly `F` steps.

### Pseudocode
```text
function detectCycle(head):
    // Phase 1: Detect cycle
    slow = head
    fast = head
    
    while fast != null AND fast.next != null:
        slow = slow.next
        fast = fast.next.next
        
        if slow == fast:     // cycle detected
            // Phase 2: Find cycle start
            entry = head
            while entry != slow:
                entry = entry.next
                slow = slow.next
            return entry     // both meet at cycle start
    
    return null              // no cycle
```

### JavaScript Implementation
```javascript
/**
 * @param {ListNode} head
 * @return {ListNode}
 */
function detectCycle(head) {
    let slow = head;
    let fast = head;
    
    // Phase 1: Find meeting point inside cycle
    while (fast !== null && fast.next !== null) {
        slow = slow.next;
        fast = fast.next.next;
        
        if (slow === fast) {
            // Phase 2: Find cycle start
            let entry = head;
            while (entry !== slow) {
                entry = entry.next;
                slow = slow.next;
            }
            return entry;
        }
    }
    
    return null; // no cycle
}
```

### Correctness Proof

**Claim**: The algorithm returns the cycle start node, or `null` if no cycle exists.

**Proof**:

1. **If no cycle**: `fast` reaches `null` → loop exits → returns `null`. ✓

2. **If cycle exists**: We prove the two pointers meet:
   - Once `slow` enters the cycle, both pointers are in a finite loop.
   - The gap between fast and slow changes by 1 each step (fast gains 1 relative to slow).
   - Since the cycle has length C, the gap reduces mod C, so they **must** meet within C steps. ✓

3. **Meeting point is correct**: From the math above:
   - `F = (k-1)·C + (C - a)`, where `a` = meeting point offset from cycle start.
   - Walking `F` steps from meeting point: covers `(C - a)` to reach cycle start, then `(k-1)` full loops = still at cycle start.
   - Walking `F` steps from head: arrives at cycle start.
   - Both arrive at cycle start simultaneously. ✓ ∎

### Dry Run — `head = [3,2,0,-4], pos = 1`

```
Indices:  0   1   2   3
Values:   3 → 2 → 0 → -4
              ↑         |
              └─────────┘
F = 1 (head to cycle start)
C = 3 (cycle length: 2→0→-4→2)
```

**Phase 1: Find meeting point**

| Step | slow (node val) | fast (node val) | Meet? |
|------|----------------|-----------------|-------|
| init | 3 (idx 0) | 3 (idx 0) | — |
| 1 | 2 (idx 1) | 0 (idx 2) | No |
| 2 | 0 (idx 2) | 2 (idx 1*) | No |
| 3 | -4 (idx 3) | -4 (idx 3) | **Yes!** |

*fast went: 0 → -4 → 2 → 0 → -4 (two steps: -4 then 2... let me redo carefully)*

Let me trace carefully using node references:
```
Nodes: N0(3) → N1(2) → N2(0) → N3(-4) → N1(2) → …
```

| Step | slow | fast | Meet? |
|------|------|------|-------|
| init | N0 | N0 | — |
| 1 | slow=N0.next=**N1** | fast=N0.next.next=**N2** | No |
| 2 | slow=N1.next=**N2** | fast=N2.next.next=N3.next=**N1** | No |
| 3 | slow=N2.next=**N3** | fast=N1.next.next=N2.next=**N3** | **Yes!** |

Meeting point: **N3** (value -4), which is at offset `a = 2` from cycle start N1.

**Verify math**: F=1, a=2, C=3. `F + a = 3 = 1·C`. ✓ So `F = C - a = 3 - 2 = 1`. ✓

**Phase 2: Find cycle start**

| Step | entry (from head) | slow (from meeting) | Meet? |
|------|-------------------|---------------------|-------|
| init | N0 (val 3) | N3 (val -4) | No |
| 1 | N0.next = **N1** (val 2) | N3.next = **N1** (val 2) | **Yes!** |

**Return N1** (value 2) ✓ — the cycle start!

### Dry Run — `head = [1,2], pos = 0`

```
Nodes: N0(1) → N1(2) → N0(1) → …
F = 0, C = 2
```

**Phase 1:**

| Step | slow | fast | Meet? |
|------|------|------|-------|
| init | N0 | N0 | — |
| 1 | N1 | N1 | **Yes!** |

(fast: N0.next.next = N1.next = N0... wait, fast = N0.next.next = N1.next = N0. But slow = N0.next = N1. Not equal.)

Let me redo:
```
N0(1) → N1(2) → N0(1) → N1(2) → …
```

| Step | slow | fast | Meet? |
|------|------|------|-------|
| init | N0 | N0 | — |
| 1 | slow=N1 | fast=N0.next.next=N1.next=**N0** | No (N1≠N0) |
| 2 | slow=N1.next=**N0** | fast=N0.next.next=N1.next=**N0** | **Yes!** |

Meeting at **N0**.

**Phase 2**: entry = head = N0, slow = N0. They're already equal!

**Return N0** (value 1) ✓

### Time & Space Complexity
* **Time**: O(n).
  - Phase 1: At most O(n) steps. Once slow enters the cycle, fast catches up within C steps. Total ≤ F + C ≤ n.
  - Phase 2: Exactly F steps. F ≤ n.
  - Total: O(n).
* **Space**: O(1). Only two pointers. No extra storage.

### Practical Performance
| Approach | Time | Space | Notes |
|:---|:---|:---|:---|
| Nested traversal | O(n²) | O(1) | Slow and clunky |
| HashSet | O(n) | O(n) | Simple but uses memory |
| **Floyd's** | **O(n)** | **O(1)** | Optimal in both dimensions |

Floyd's is both time-optimal and space-optimal. In practice it's extremely fast with minimal cache misses (just pointer chasing).

---

## Visual Diagram — Floyd's Algorithm

```
THE LINKED LIST WITH A CYCLE
═════════════════════════════

  ┌─── F ───┐┌────── C ──────┐
  head       cycleStart       │
   │          │               │
   ▼          ▼               │
  [3] ──→ [2] ──→ [0] ──→ [-4]
            ↑                 │
            └─────────────────┘

  F = 1 (tail length)
  C = 3 (cycle length)


PHASE 1: DETECT CYCLE (slow=1x, fast=2x)
═════════════════════════════════════════

  Step 0:  S,F at [3]
  Step 1:  S→[2]     F→[0]
  Step 2:  S→[0]     F→[2]  (fast lapped)
  Step 3:  S→[-4]    F→[-4]  ← MEET! ✓

        meeting point
            ↓
  [3] ──→ [2] ──→ [0] ──→ [-4]
            ↑        a=2      │
            └─────────────────┘


PHASE 2: FIND CYCLE START
═════════════════════════

  Place "entry" at head, keep "slow" at meeting point.
  Move both at speed 1.

  Step 0:  entry=[3]   slow=[-4]
  Step 1:  entry=[2]   slow=[2]  ← MEET! ✓
                ↑
           cycle start!


THE MATH BEHIND IT
══════════════════

  When S and F meet:
    slow traveled:  F + a          = 1 + 2 = 3
    fast traveled:  F + a + k·C   = 1 + 2 + 1·3 = 6
    fast = 2 × slow:  6 = 2 × 3  ✓

  Therefore:  F + a = k·C
              F = k·C - a = 3 - 2 = 1

  Walk F=1 step from meeting point → arrive at cycle start ✓
  Walk F=1 step from head          → arrive at cycle start ✓
```

---

## Comparison of Approaches

| Approach | Time | Space | Key Idea |
|:---|:---|:---|:---|
| Nested traversal | O(n²) | O(1) | For each node, walk forward to check for return |
| **HashSet** | O(n) | O(n) | First re-visited node = cycle start |
| **Floyd's Tortoise & Hare** | **O(n)** | **O(1)** | Two-phase: detect meeting point, then find start |

---

## Interview-Ready Summary (60 Seconds)

"I use Floyd's Tortoise and Hare algorithm in two phases.

**Phase 1**: I use a slow pointer moving 1 step and a fast pointer moving 2 steps. If there's a cycle, fast will lap slow and they'll eventually meet inside the cycle. If fast reaches null, there's no cycle.

**Phase 2** is the clever part: once they meet, I place a new pointer at the head and keep the slow pointer at the meeting point. I advance both at speed 1. The node where they meet is the **cycle start**.

The math behind it: when slow and fast first meet, slow has traveled `F + a` steps where `F` is the tail length and `a` is the offset into the cycle. Fast traveled `2(F + a)` steps. The difference `F + a` must be a multiple of the cycle length `C`. This means `F = kC - a`, so walking `F` steps from the meeting point brings you back to the cycle start — the same distance as walking from the head.

Time is O(n), space is O(1) — optimal in both dimensions."
