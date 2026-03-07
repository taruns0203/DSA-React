# 725. Split Linked List in Parts — From Brute-Force to Optimal (In-Place Split)

---

## 1. High-Level Interpretation

**What the problem asks:** Given a singly linked list of `n` nodes and an integer `k`, split the list into `k` consecutive sub-lists such that their sizes differ by at most 1, with earlier parts having sizes ≥ later parts. Return an array of `k` heads (some may be `null` if `k > n`).

**Why it matters:** This is a clean "division with remainder" problem dressed up in linked-list clothing. It tests whether you can handle modular arithmetic (`n / k` with remainder distribution) *and* pointer manipulation (cutting a list into segments) in one solution.

**Hidden traps:**
- **k > n:** Some parts must be `null` (empty). You can't just divide — you also need empty slots.
- **Off-by-one in cutting:** After walking `partSize` nodes, you must cut *after* the last node of the current part (save `.next`, then set `.next = null`).
- **Remainder distribution:** The first `n % k` parts get one extra node. Getting this wrong distributes sizes unevenly.
- **n = 0 (empty list):** All k parts should be `null`.

---

## 2. Brute-Force Approach — Extract to Array, Slice, Rebuild

### 2.1 Idea in Plain Words

Walk the entire list and collect all node values into a plain array. Then use math to figure out how many elements each of the k parts should have (`base = floor(n/k)`, plus 1 extra for the first `n % k` parts). Slice the array into k groups and rebuild k separate linked lists from those slices.

### 2.2 Pseudocode

```
function splitListToParts(head, k):
    // Step 1: Extract all values
    values = []
    curr = head
    while curr != null:
        values.push(curr.val)
        curr = curr.next
    n = values.length

    // Step 2: Compute part sizes
    base = floor(n / k)
    remainder = n % k
    sizes = []
    for i = 0 to k-1:
        sizes[i] = base + (1 if i < remainder else 0)

    // Step 3: Build k linked lists from slices
    result = []
    idx = 0
    for i = 0 to k-1:
        if sizes[i] == 0:
            result.push(null)
        else:
            head = new ListNode(values[idx])
            curr = head
            for j = 1 to sizes[i]-1:
                curr.next = new ListNode(values[idx + j])
                curr = curr.next
            idx += sizes[i]
            result.push(head)
    return result
```

### 2.3 JavaScript Implementation

```javascript
function splitListToParts(head, k) {
    // Extract values
    const values = [];
    let curr = head;
    while (curr) { values.push(curr.val); curr = curr.next; }
    const n = values.length;

    // Compute sizes
    const base = Math.floor(n / k);
    const remainder = n % k;

    // Rebuild k lists
    const result = [];
    let idx = 0;
    for (let i = 0; i < k; i++) {
        const size = base + (i < remainder ? 1 : 0);
        if (size === 0) { result.push(null); continue; }
        const partHead = new ListNode(values[idx]);
        let node = partHead;
        for (let j = 1; j < size; j++) {
            node.next = new ListNode(values[idx + j]);
            node = node.next;
        }
        idx += size;
        result.push(partHead);
    }
    return result;
}
```

### 2.4 Time & Space Complexity

| Metric | Value | Derivation |
|--------|-------|------------|
| **Time** | **O(n)** | One pass to extract + one pass to rebuild = O(n). |
| **Space** | **O(n)** | The `values` array stores all n values + new nodes created. |

### 2.5 Dry Run

**Input:** `head = [1,2,3,4,5,6,7,8,9,10]`, `k = 3`

**Step 1:** `values = [1,2,3,4,5,6,7,8,9,10]`, `n = 10`

**Step 2:** `base = floor(10/3) = 3`, `remainder = 10 % 3 = 1`

| Part i | size = base + (i < remainder ? 1 : 0) |
|--------|---------------------------------------|
| 0 | 3 + 1 = **4** (i=0 < 1) |
| 1 | 3 + 0 = **3** (i=1 ≥ 1) |
| 2 | 3 + 0 = **3** (i=2 ≥ 1) |

`sizes = [4, 3, 3]` — total = 10 ✓

**Step 3:** Build:

| Part | idx range | Nodes | Result |
|------|-----------|-------|--------|
| 0 | [0..3] | 1→2→3→4 | `[1,2,3,4]` |
| 1 | [4..6] | 5→6→7 | `[5,6,7]` |
| 2 | [7..9] | 8→9→10 | `[8,9,10]` |

**Output:** `[[1,2,3,4], [5,6,7], [8,9,10]]` ✅

### 2.6 Dry Run — Example 2 (k > n)

**Input:** `head = [1,2,3]`, `k = 5`

`n = 3`, `base = floor(3/5) = 0`, `remainder = 3 % 5 = 3`

| Part i | size |
|--------|------|
| 0 | 0 + 1 = **1** |
| 1 | 0 + 1 = **1** |
| 2 | 0 + 1 = **1** |
| 3 | 0 + 0 = **0** → null |
| 4 | 0 + 0 = **0** → null |

**Output:** `[[1], [2], [3], [], []]` ✅

### 2.7 Why Not Ideal

- **O(n) extra space** for the values array + creating brand-new nodes.
- **Creates new nodes** instead of reusing the original ones — wasteful and doesn't meet the spirit of "splitting" the original list.
- Interviewers want in-place pointer manipulation.

---

## 3. Improved Approach — Two-Pass with Pre-Computed Sizes Array

### 3.1 What Changed & Why

Instead of extracting to an array and rebuilding, we:
1. **First pass:** Count `n`.
2. **Compute sizes:** Build an explicit `sizes[]` array of length `k`.
3. **Second pass:** Walk the original list, cutting it at the boundaries defined by `sizes[]`.

This reuses the original nodes (no new nodes created) and only needs a `sizes[]` array of length `k` (not `n`).

### 3.2 Pseudocode

```
function splitListToParts(head, k):
    // Count
    n = 0; curr = head
    while curr: n++; curr = curr.next

    // Build sizes array
    base = floor(n / k), remainder = n % k
    sizes = array of k elements
    for i = 0 to k-1: sizes[i] = base + (1 if i < remainder else 0)

    // Walk and cut
    result = array of k elements
    curr = head
    for i = 0 to k-1:
        result[i] = curr
        for j = 1 to sizes[i] - 1:
            curr = curr.next     // walk to last node of this part
        if curr != null:
            next = curr.next
            curr.next = null     // cut
            curr = next
    return result
```

### 3.3 JavaScript Implementation

```javascript
function splitListToParts(head, k) {
    // Count
    let n = 0, curr = head;
    while (curr) { n++; curr = curr.next; }

    // Build sizes
    const base = Math.floor(n / k);
    const remainder = n % k;
    const sizes = [];
    for (let i = 0; i < k; i++) sizes.push(base + (i < remainder ? 1 : 0));

    // Walk and cut
    const result = [];
    curr = head;
    for (let i = 0; i < k; i++) {
        result.push(curr);
        for (let j = 1; j < sizes[i]; j++) {
            curr = curr.next;
        }
        if (curr) {
            const next = curr.next;
            curr.next = null;
            curr = next;
        }
    }
    return result;
}
```

### 3.4 Time & Space Complexity

| Metric | Value | Derivation |
|--------|-------|------------|
| **Time** | **O(n)** | Count pass O(n) + split pass O(n) = O(n). |
| **Space** | **O(k)** | `sizes[]` array of length k + `result[]` of length k = O(k). |

### 3.5 Dry Run

**Input:** `head = [1,2,3,4,5,6,7,8,9,10]`, `k = 3`

`n = 10`, `base = 3`, `remainder = 1`, `sizes = [4, 3, 3]`

**Walk and cut:**

| Part i | sizes[i] | curr starts at | Walk j steps | Cut after | result[i] |
|--------|----------|----------------|-------------|-----------|-----------|
| 0 | 4 | node(1) | 1→2→3→4 | 4.next=null, curr=5 | 1→2→3→4 |
| 1 | 3 | node(5) | 5→6→7 | 7.next=null, curr=8 | 5→6→7 |
| 2 | 3 | node(8) | 8→9→10 | 10.next=null, curr=null | 8→9→10 |

**Output:** `[[1,2,3,4], [5,6,7], [8,9,10]]` ✅

### 3.6 Trade-offs

| Pros | Cons |
|------|------|
| Reuses original nodes (no new allocations) | Still uses an explicit `sizes[]` array |
| Easy to debug — sizes are visible | Extra O(k) space for sizes array |
| Clear separation of logic | Two-pass (acceptable — list is singly-linked) |

---

## 4. Optimal / Best Approach — Inline Size Computation + In-Place Split

### 4.1 Intuition

We don't need a separate `sizes[]` array. We can compute each part's size **inline** during the split pass using the formula:

```
partSize = base + (i < remainder ? 1 : 0)
```

This eliminates the `sizes[]` array, reducing auxiliary space to O(1) beyond the required `result[]` output.

**The key math:**
- `base = Math.floor(n / k)` — every part gets at least this many nodes.
- `remainder = n % k` — these many "leftover" nodes get distributed one each to the **first** `remainder` parts.
- So part `i` has size `base + 1` if `i < remainder`, else `base`.
- This guarantees: (1) sizes differ by at most 1, and (2) earlier parts are larger. ✓

### 4.2 Pseudocode

```
function splitListToParts(head, k):
    n = 0; curr = head
    while curr: n++; curr = curr.next

    base = floor(n / k)
    remainder = n % k
    result = array of k nulls
    curr = head

    for i = 0 to k-1:
        result[i] = curr
        partSize = base + (1 if i < remainder else 0)

        // Walk (partSize - 1) steps to reach last node of this part
        for j = 1 to partSize - 1:
            curr = curr.next

        // Cut
        if curr != null:
            next = curr.next
            curr.next = null
            curr = next

    return result
```

### 4.3 JavaScript Implementation

```javascript
function splitListToParts(head, k) {
    // Count nodes
    let n = 0, curr = head;
    while (curr) { n++; curr = curr.next; }

    const base = Math.floor(n / k);
    const remainder = n % k;
    const result = new Array(k).fill(null);
    curr = head;

    for (let i = 0; i < k; i++) {
        result[i] = curr;
        const partSize = base + (i < remainder ? 1 : 0);

        // Walk to the last node of this part
        for (let j = 1; j < partSize; j++) {
            curr = curr.next;
        }

        // Cut the link
        if (curr) {
            const next = curr.next;
            curr.next = null;
            curr = next;
        }
    }
    return result;
}
```

### 4.4 Correctness Proof

**Claim:** The algorithm produces k parts with sizes differing by at most 1, earlier ≥ later, totaling n nodes.

**Proof:**

1. **Total nodes distributed:**
   - First `remainder` parts: each gets `base + 1` = `remainder × (base + 1)` nodes.
   - Remaining `k − remainder` parts: each gets `base` = `(k − remainder) × base` nodes.
   - Total: `remainder × base + remainder + k × base − remainder × base = k × base + remainder = n`. ✓

2. **Size difference ≤ 1:**
   - Parts have size `base + 1` or `base`. Difference = 1. ✓

3. **Earlier ≥ later:**
   - All `base + 1` parts come first (indices 0..remainder−1), all `base` parts come after. ✓

4. **Cutting correctness (loop invariant):**
   - At the start of iteration `i`, `curr` points to the first node of part `i`.
   - We walk `partSize − 1` steps to reach the last node.
   - We save `curr.next`, cut, and set `curr` to the saved next.
   - At the start of iteration `i+1`, `curr` points to the first node of part `i+1`. ✓

### 4.5 Dry Run — Example 1

**Input:** `head = [1,2,3,4,5,6,7,8,9,10]`, `k = 3`

`n = 10`, `base = 3`, `remainder = 1`

| i | partSize | curr at start | Walk steps | Last node | Cut after | result[i] |
|---|----------|---------------|-----------|-----------|-----------|-----------|
| 0 | 3+1=**4** | node(1) | 1→2→3→4 | node(4) | 4.next=null, curr→5 | `[1,2,3,4]` |
| 1 | 3+0=**3** | node(5) | 5→6→7 | node(7) | 7.next=null, curr→8 | `[5,6,7]` |
| 2 | 3+0=**3** | node(8) | 8→9→10 | node(10) | 10.next=null, curr→null | `[8,9,10]` |

**Output:** `[[1,2,3,4], [5,6,7], [8,9,10]]` ✅

### 4.6 Dry Run — Example 2 (k > n)

**Input:** `head = [1,2,3]`, `k = 5`

`n = 3`, `base = 0`, `remainder = 3`

| i | partSize | i < remainder? | curr at start | Walk | Cut | result[i] |
|---|----------|---------------|---------------|------|-----|-----------|
| 0 | 0+1=**1** | 0<3 yes | node(1) | (0 steps) | 1.next=null, curr→2 | `[1]` |
| 1 | 0+1=**1** | 1<3 yes | node(2) | (0 steps) | 2.next=null, curr→3 | `[2]` |
| 2 | 0+1=**1** | 2<3 yes | node(3) | (0 steps) | 3.next=null, curr→null | `[3]` |
| 3 | 0+0=**0** | 3<3 no | null | — | — | `null` |
| 4 | 0+0=**0** | 4<3 no | null | — | — | `null` |

**Output:** `[[1], [2], [3], [], []]` ✅

### 4.7 Time & Space Complexity

| Metric | Value | Derivation |
|--------|-------|------------|
| **Time** | **O(n)** | Count pass: O(n). Split pass: each node visited exactly once across all iterations. Total: O(n). |
| **Space** | **O(1)** aux | Only `base`, `remainder`, `i`, `j`, `curr`, `next` — constant pointers. The `result[]` of length k is required output, not auxiliary. |

**Practical performance:** With n ≤ 1000, k ≤ 50, this runs in microseconds. Two passes with zero allocations beyond the output array.

### 4.8 Comparison of All Approaches

| Approach | Time | Aux Space | Creates New Nodes? | Passes |
|----------|------|-----------|-------------------|--------|
| Array extraction + rebuild | O(n) | O(n) | Yes | 2 |
| Pre-computed sizes + cut | O(n) | O(k) | No | 2 |
| **Inline sizes + in-place cut** | **O(n)** | **O(1)** | **No** | **2** |

---

## 5. Edge Cases

| Input | Expected | Why |
|-------|----------|-----|
| `head = [], k = 3` | `[null, null, null]` | Empty list → all parts null |
| `head = [1], k = 1` | `[[1]]` | Single node, single part |
| `head = [1], k = 3` | `[[1], null, null]` | One node, three parts |
| `head = [1,2,3], k = 1` | `[[1,2,3]]` | Keep entire list as one part |
| `head = [1,2,3,4], k = 2` | `[[1,2], [3,4]]` | Even split — remainder = 0 |

---

## 6. Interview-Ready Verbal Explanation (60–90 seconds)

> "The key insight is that this is a division-with-remainder problem. If we have n nodes and k parts, each part gets at least `Math.floor(n/k)` nodes, and the first `n % k` parts each get one extra.
>
> My approach is two passes:
>
> **Pass 1:** Count n by walking the list.
>
> **Pass 2:** Walk the list again, splitting it into k parts. For each part i, I compute its size inline as `base + (i < remainder ? 1 : 0)`. I walk that many nodes, save the next pointer, cut the link by setting `.next = null`, and move to the next part.
>
> This runs in O(n) time with O(1) auxiliary space — just pointer variables and the required output array. No extra arrays, no new nodes — pure in-place splitting."

---

## 7. Visual Diagram

```
Input: [1] → [2] → [3] → [4] → [5] → [6] → [7] → [8] → [9] → [10]
k = 3,  n = 10

Math:  base = floor(10/3) = 3
       remainder = 10 % 3 = 1
       First 1 part gets 4 nodes, remaining 2 parts get 3 nodes.

       sizes:  [4, 3, 3]

Pass 2: Walk and cut

  Part 0 (size 4):
  [1] → [2] → [3] → [4] ✂ [5] → [6] → ...
                          ↑ cut here

  Part 1 (size 3):
  [5] → [6] → [7] ✂ [8] → [9] → [10]
                     ↑ cut here

  Part 2 (size 3):
  [8] → [9] → [10]
                   ↑ already null

Result: [ [1,2,3,4], [5,6,7], [8,9,10] ]


When k > n  (e.g., k=5, n=3):

  base = 0, remainder = 3
  sizes: [1, 1, 1, 0, 0]

  [1] ✂ [2] ✂ [3]                null    null
   ↑      ↑     ↑                 ↑        ↑
  Part0  Part1  Part2            Part3   Part4

Result: [ [1], [2], [3], [], [] ]
```

---

*Guide complete. The core insight is simple: `n / k` gives the base size, `n % k` gives how many parts get +1. Then walk-and-cut does the rest in O(n) time and O(1) auxiliary space.*
