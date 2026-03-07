# 179. Largest Number

---

## 1. High-Level Interpretation

Given an array of non-negative integers, we must **concatenate them in some order** so that the resulting string represents the **largest possible number**. The answer is returned as a string because the number can be astronomically large (up to 100 numbers each up to 10⁹).

**Why it matters:** This is a classic **custom-sort / greedy** problem that tests whether you can define a non-obvious ordering relation. It appears in interviews to check your understanding of comparators and string manipulation.

**Hidden traps:**

- **Leading zeros:** If every element is `0` (e.g., `[0, 0, 0]`), the answer is `"0"`, not `"000"`.
- **Same-prefix numbers:** Comparing `3`, `30`, and `34` is tricky — simple lexicographic or numeric sort won't work. `"3"` must come before `"30"` (since `330 > 303`) but after `"34"` (since `343 > 334`).
- **All elements are single values:** No negative numbers to worry about (constraints say non-negative), but zero-only edge case is critical.

---

## 2. Brute-Force Approach

### 2.1 Idea in Plain Words

Generate **every possible permutation** of the numbers, concatenate each permutation into a string, and pick the **lexicographically / numerically largest** one.

### 2.2 Pseudocode

```
function largestNumber_bruteForce(nums):
    strNums = convert each num in nums to a string
    best = "0"

    for each permutation P of strNums:
        candidate = concatenate all elements of P into one string
        if candidate is larger than best:
            best = candidate

    return best
```

**How to compare two huge number-strings?**
- If they differ in length, the longer one is larger (unless it has leading zeros, which can't happen here since we pick the largest).
- If same length, compare lexicographically (works because digits are ASCII-ordered).

### 2.3 Time & Space Complexity

| Aspect | Value | Derivation |
|--------|-------|------------|
| **Permutations** | n! | There are n! orderings of n elements |
| **Concatenation cost per permutation** | O(L) where L = total digit length | We join all strings |
| **Total Time** | **O(n! × L)** | For each permutation, build and compare a string |
| **Space** | O(n × L) | Storing current permutation + candidate string |

For `n = 100`, `100!` is absurdly large (~10¹⁵⁸). This is completely infeasible.

### 2.4 Dry Run — Example: `nums = [3, 30, 34, 5, 9]`

We have 5! = 120 permutations. Here are a few key ones:

| Step | Permutation | Concatenated String | Is New Best? |
|------|-------------|---------------------|--------------|
| 1 | [3, 30, 34, 5, 9] | "3303459" | Yes (first) |
| 2 | [3, 30, 34, 9, 5] | "3303495" | Yes |
| ... | ... | ... | ... |
| 47 | [9, 5, 34, 3, 30] | "9534330" | Yes |
| ... | ... | ... | ... |
| 120 | [9, 5, 34, 30, 3] | "9534303" | No |

After all 120 permutations → **best = "9534330"**.

### 2.5 Why This Fails

- **n! blowup**: Even for n = 12, we get ~479 million permutations. For n = 100 (the constraint), it's impossible.
- We need a way to determine the correct order **without trying every arrangement**.

---

## 3. Improved Approach — Greedy with Pairwise Comparison

### 3.1 Key Insight: What Changed

Instead of trying all permutations, observe this:

> **For any two numbers `a` and `b`, we only need to decide: should `a` come before `b`, or `b` before `a`?**

We can answer this by comparing the two possible concatenations:
- `ab` (a followed by b)
- `ba` (b followed by a)

If `ab >= ba`, then `a` should come first (or at least not after `b`).

**Example:** `a = "3"`, `b = "30"`
- `ab = "330"`, `ba = "303"`
- `330 > 303` → `3` should come before `30` ✓

This means we can define a **custom comparator** and simply **sort** the array.

### 3.2 Why This Works (Correctness Sketch)

The comparator defines a **total order** that is:
1. **Transitive:** If `a` should come before `b` and `b` before `c`, then `a` should come before `c`. (This can be proven because string-concatenation comparison preserves transitivity.)
2. **Antisymmetric:** If `ab >= ba` and `ba >= ab`, then `ab == ba` (they're interchangeable).

By sorting with this comparator, we place every element in its optimal relative position. Since the comparator is transitive, the globally optimal arrangement is the sorted order. (A formal proof uses contradiction: if there existed a better arrangement, swapping any adjacent out-of-order pair would improve it, contradicting that we sorted.)

### 3.3 Pseudocode

```
function largestNumber(nums):
    strNums = convert each num in nums to a string

    sort strNums using comparator:
        compare(a, b): return (b + a) compared to (a + b)
        // If b+a > a+b, then b should come first → b is "greater"

    result = concatenate all elements of sorted strNums

    // Edge case: if result starts with '0', the entire number is 0
    if result[0] == '0':
        return "0"

    return result
```

### 3.4 JavaScript Implementation

```javascript
/**
 * @param {number[]} nums
 * @return {string}
 */
function largestNumber(nums) {
    // Step 1: Convert all numbers to strings
    const strNums = nums.map(String);

    // Step 2: Sort with custom comparator
    //   For two strings a, b:
    //     if b+a > a+b  →  b should come before a  →  return positive
    //     if a+b > b+a  →  a should come before a  →  return negative
    strNums.sort((a, b) => {
        const order1 = a + b; // a before b
        const order2 = b + a; // b before a
        if (order2 > order1) return 1;   // b+a is bigger → b first
        if (order1 > order2) return -1;  // a+b is bigger → a first
        return 0;
    });

    // Step 3: Concatenate
    const result = strNums.join('');

    // Step 4: Edge case — all zeros
    if (result[0] === '0') return '0';

    return result;
}
```

### 3.5 Time & Space Complexity

| Aspect | Value | Derivation |
|--------|-------|------------|
| **Sorting** | O(n log n) comparisons | Standard sort |
| **Each comparison** | O(L/n) average, O(L) worst | Comparing two concatenated strings where L = total digits |
| **Total Time** | **O(n × L × log n)** worst case, but practically **O(n log n)** since each number has at most 10 digits | Each comparison is O(d) where d ≤ 20 (two numbers ≤ 10 digits each) |
| **Space** | **O(n + L)** | Storing string versions + sorted array |

With `n ≤ 100` and each number ≤ 10 digits, this is lightning fast.

### 3.6 Dry Run — Example: `nums = [3, 30, 34, 5, 9]`

**Step 1 — Convert to strings:**

```
strNums = ["3", "30", "34", "5", "9"]
```

**Step 2 — Sort with custom comparator (showing key comparisons):**

| Comparison | a + b | b + a | Winner (comes first) |
|------------|-------|-------|----------------------|
| "3" vs "30" | "330" | "303" | "3" (330 > 303) |
| "3" vs "34" | "334" | "343" | "34" (343 > 334) |
| "3" vs "5"  | "35"  | "53"  | "5" (53 > 35) |
| "3" vs "9"  | "39"  | "93"  | "9" (93 > 39) |
| "30" vs "34"| "3034"| "3430"| "34" (3430 > 3034) |
| "5" vs "9"  | "59"  | "95"  | "9" (95 > 59) |
| "5" vs "34" | "534" | "345" | "5" (534 > 345) |
| "34" vs "3" | "343" | "334" | "34" (343 > 334) |

**Sorted order (descending by our comparator):**

```
["9", "5", "34", "3", "30"]
```

**Step 3 — Concatenate:**

```
result = "9" + "5" + "34" + "3" + "30" = "9534330"
```

**Step 4 — Leading zero check:** `result[0] = '9'` → No issue.

**Output: `"9534330"` ✓**

### 3.7 Dry Run — Example: `nums = [10, 2]`

| Step | State |
|------|-------|
| Convert | `strNums = ["10", "2"]` |
| Compare "10" vs "2" | `"102"` vs `"210"` → `210 > 102` → "2" first |
| Sorted | `["2", "10"]` |
| Join | `"210"` |
| Leading zero? | No |
| **Output** | **"210" ✓** |

### 3.8 Edge Case Dry Run: `nums = [0, 0]`

| Step | State |
|------|-------|
| Convert | `strNums = ["0", "0"]` |
| Compare "0" vs "0" | `"00"` vs `"00"` → equal, no swap |
| Sorted | `["0", "0"]` |
| Join | `"00"` |
| Leading zero? | **Yes** → return `"0"` |
| **Output** | **"0" ✓** |

---

## 4. Optimal / Best Approach

The approach in Section 3 **is** the optimal approach. There is no known algorithm that solves this faster than O(n log n) because:

1. We must examine every element at least once → Ω(n).
2. The problem reduces to sorting with a custom comparator → Ω(n log n) lower bound for comparison-based sorting.

### 4.1 Final Optimized JavaScript Code

```javascript
/**
 * 179. Largest Number
 * @param {number[]} nums
 * @return {string}
 */
var largestNumber = function(nums) {
    const strs = nums.map(String);

    strs.sort((a, b) => {
        // Compare concatenations as strings (lexicographic works
        // because both a+b and b+a have the same length)
        const ab = a + b;
        const ba = b + a;
        // We want descending order: larger concatenation first
        if (ba > ab) return 1;
        if (ab > ba) return -1;
        return 0;
    });

    // All zeros edge case
    if (strs[0] === '0') return '0';

    return strs.join('');
};
```

### 4.2 Correctness Proof (by Contradiction)

**Claim:** Sorting with the comparator `(a, b) => compare(b+a, a+b)` produces the largest number.

**Proof:**

1. Suppose the sorted array `S` does **not** form the largest number.
2. Then there exists some other arrangement `S'` that forms a larger number.
3. Since `S'` differs from `S`, there must exist two **adjacent** elements `x, y` in `S'` where `x` appears before `y`, but our comparator says `y` should come before `x` (i.e., `yx > xy`).
4. Swapping `x` and `y` in `S'` gives a **larger** number (since `yx > xy`, replacing the `...xy...` segment with `...yx...` increases the value).
5. We can keep making such swaps (bubble sort style) until we reach `S`.
6. Each swap increases or maintains the value → `S` is at least as large as `S'`.
7. **Contradiction** with our assumption that `S'` is larger. ∎

**Transitivity of comparator** (required for sort correctness):

If `ab ≥ ba` and `bc ≥ cb`, then `ac ≥ ca`. This can be proven by treating the concatenations as numbers: if `a` has `p` digits and `b` has `q` digits, then `ab = a × 10^q + b`. The algebraic manipulation confirms transitivity.

### 4.3 Detailed Dry Run — `nums = [3, 30, 34, 5, 9]`

```
Initial:  strNums = ["3", "30", "34", "5", "9"]

── Sorting (conceptual view of final comparisons) ──

  "9" vs all:  "9X" > "X9" for X ∈ {3,30,34,5}  →  "9" is first
  "5" vs remaining:  "5X" > "X5" for X ∈ {3,30,34}  →  "5" is second
  "34" vs {3, 30}:
      "34"+"3"  = "343"  vs  "3"+"34"  = "334"  →  343>334  →  "34" before "3"
      "34"+"30" = "3430" vs  "30"+"34" = "3034" →  3430>3034 → "34" before "30"
      → "34" is third
  "3" vs "30":
      "3"+"30" = "330" vs "30"+"3" = "303" → 330>303 → "3" before "30"
      → "3" is fourth, "30" is fifth

Sorted:  ["9", "5", "34", "3", "30"]

── Variable states after sort ──
  strs[0] = "9"
  strs[1] = "5"
  strs[2] = "34"
  strs[3] = "3"
  strs[4] = "30"

── Concatenation ──
  result = "9" + "5" + "34" + "3" + "30"
         = "9534330"

── Edge case check ──
  strs[0] = "9" ≠ "0"  →  no all-zeros issue

OUTPUT: "9534330"
```

### 4.4 Tight Complexity Analysis

| Metric | Complexity | Notes |
|--------|-----------|-------|
| **Time** | **O(n · d · log n)** | `n` = array length, `d` = max digits per number (≤ 10). Each comparison concatenates two strings of length ≤ 10 and compares them → O(d). Sort does O(n log n) comparisons. |
| **Space** | **O(n · d)** | String array of n elements, each up to 10 chars. Join at end creates one string of length ≤ n·d. |

**Practical performance for n = 100, d = 10:**
- Comparisons: ~100 × log₂(100) ≈ 664
- Each comparison: ~20 character operations
- Total: ~13,000 operations → **sub-millisecond**

---

## 5. Interview-Ready Verbal Summary (60–90 seconds)

> "The key insight is that this is a **sorting problem with a custom comparator**. For any two numbers `a` and `b`, I compare the two possible concatenations: `a+b` versus `b+a` as strings. If `b+a` is larger, then `b` should come before `a`. This works because both concatenations have the **same length**, so string comparison equals numeric comparison.
>
> I convert all numbers to strings, sort them with this comparator in descending order, then join them. The one edge case is when all elements are zero — I check if the first element after sorting is `'0'` and return `'0'` instead of `'000...'`.
>
> **Correctness** relies on the comparator being transitive, which it is — you can prove this algebraically. The proof by contradiction shows that any arrangement different from the sorted one can be improved by swapping an adjacent out-of-order pair.
>
> **Time complexity** is O(n · d · log n) where d is the max digit count (at most 10), so effectively O(n log n). **Space** is O(n) for the string array. This is optimal since we need at least n log n to sort."

---

## 6. Visual Diagram — How the Algorithm Works

```
INPUT:  [3, 30, 34, 5, 9]

Step 1: Convert to strings
        ┌───┬────┬────┬───┬───┐
        │"3"│"30"│"34"│"5"│"9"│
        └───┴────┴────┴───┴───┘

Step 2: Custom sort — pairwise concatenation comparison
        ┌─────────────────────────────────────┐
        │  For each pair (a, b):              │
        │    Compare  a+b  vs  b+a            │
        │    Put the "winner" first            │
        │                                     │
        │  "9" + "5" = "95"  vs  "59"  → 9,5 │
        │  "5" + "34"= "534" vs "345" → 5,34 │
        │  "34"+ "3" = "343" vs "334" → 34,3 │
        │  "3" + "30"= "330" vs "303" → 3,30 │
        └─────────────────────────────────────┘

        Sorted (descending):
        ┌───┬───┬────┬───┬────┐
        │"9"│"5"│"34"│"3"│"30"│
        └───┴───┴────┴───┴────┘

Step 3: Concatenate
        "9" + "5" + "34" + "3" + "30"
         │     │     │      │     │
         └──┬──┘     │      │     │
          "95"       │      │     │
            └───┬────┘      │     │
             "9534"         │     │
               └─────┬──────┘     │
                "95343"           │
                   └────┬─────────┘
                    "9534330"

Step 4: Edge case check → first char ≠ '0' → OK

OUTPUT: "9534330"
```

---

## 7. Summary of All Approaches

| # | Approach | Time | Space | Feasible for n=100? |
|---|----------|------|-------|---------------------|
| 1 | Brute-force (all permutations) | O(n! × L) | O(n + L) | ❌ No |
| 2 | **Custom comparator sort (optimal)** | **O(n · d · log n)** | **O(n · d)** | **✅ Yes** |

The problem only has **one real jump**: from brute-force permutations to the sorting insight. Once you realize that pairwise concatenation comparison defines a valid total order, sorting gives you the answer directly.
