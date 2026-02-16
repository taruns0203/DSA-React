import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════════════════════
   Dummy Node Technique — LinkedList Visualizer
   ─────────────────────────────────────────────────────────────────────────────
   Demonstrates the sentinel / dummy head pattern across four classic problems:
     1. Merge Two Sorted Lists
     2. Remove Elements by Value
     3. Partition List around x
     4. Remove All Duplicates (LeetCode 82 style)
   
   Self-contained React component. No external dependencies.
   Aesthetic: Editorial mint + coral with clean card layout.
   ═══════════════════════════════════════════════════════════════════════════════ */

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1: Palette, Constants & Style System
// ─────────────────────────────────────────────────────────────────────────────

const P = {
  bg: "linear-gradient(155deg, #f0faf7 0%, #f7fdfb 30%, #fef5f2 65%, #fdf0f5 100%)",
  card: "#ffffff",
  cardBorder: "#e0ece8",
  shadow: "0 5px 30px rgba(16, 120, 96, 0.07), 0 1px 3px rgba(0,0,0,0.03)",

  // Primary duo
  mint: "#0d9373",
  mintLt: "#38d9a9",
  mintPale: "rgba(13,147,115,0.08)",
  coral: "#e8456b",
  coralLt: "#ff8fa3",
  coralPale: "rgba(232,69,107,0.08)",

  // Accents
  indigo: "#4263eb",
  indigoLt: "#748ffc",
  indigoPale: "rgba(66,99,235,0.08)",
  amber: "#e67700",
  amberLt: "#ffc078",
  amberPale: "rgba(230,119,0,0.08)",
  slate: "#495057",
  slateLt: "#868e96",

  // Node gradients
  gDefault: "linear-gradient(135deg, #495057 0%, #868e96 100%)",
  gDummy: "linear-gradient(135deg, #e67700 0%, #ffc078 100%)",
  gActive: "linear-gradient(135deg, #0d9373 0%, #38d9a9 100%)",
  gCompare: "linear-gradient(135deg, #4263eb 0%, #748ffc 100%)",
  gPicked: "linear-gradient(135deg, #0d9373 0%, #69db7c 100%)",
  gRemoved: "linear-gradient(135deg, #e8456b 0%, #ff8fa3 100%)",
  gResult: "linear-gradient(135deg, #087f5b 0%, #20c997 100%)",
  gVisited: "linear-gradient(135deg, #ced4da 0%, #e9ecef 100%)",
  gNull: "linear-gradient(135deg, #dee2e6 0%, #f1f3f5 100%)",
  gListA: "linear-gradient(135deg, #4263eb 0%, #748ffc 100%)",
  gListB: "linear-gradient(135deg, #e8456b 0%, #ff8fa3 100%)",

  text: "#212529",
  textMid: "#495057",
  textFade: "#868e96",
  white: "#ffffff",
};

const FONT = "'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif";
const SANS = "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans', sans-serif";

const ALGOS = [
  { id: "mergeSorted", label: "Merge Two Sorted Lists", icon: "⇄" },
  { id: "removeValue", label: "Remove by Value", icon: "✂" },
  { id: "partition", label: "Partition List", icon: "⫼" },
  { id: "removeDuplicates", label: "Remove All Duplicates", icon: "≠" },
];

const COMPLEXITY = {
  mergeSorted: {
    time: "O(n + m)",
    space: "O(1)",
    note: "n, m = lengths of both lists. Only pointer manipulation, no new nodes.",
  },
  removeValue: {
    time: "O(n)",
    space: "O(1)",
    note: "Single pass. Dummy node eliminates head-removal special case.",
  },
  partition: {
    time: "O(n)",
    space: "O(1)",
    note: "Single pass using two dummy-headed chains, then concatenated.",
  },
  removeDuplicates: {
    time: "O(n)",
    space: "O(1)",
    note: "Single pass. Dummy handles case where head itself is a duplicate.",
  },
};

const INTUITION = {
  mergeSorted: `The dummy node acts as a "staging area" — a guaranteed starting point for the merged result. We compare heads of both lists, attach the smaller one to our growing chain, and advance. Without a dummy, we'd need a special case to initialize the result head.`,
  removeValue: `When removing nodes, the head itself might need removal. A dummy node before the head means we never have to special-case head deletion — the algorithm treats every node uniformly. At the end, dummy.next is the true head.`,
  partition: `We build two separate chains: one for nodes < x, one for nodes ≥ x. Each chain uses its own dummy head. After one pass, we stitch them together. Two dummy nodes = zero edge cases for empty partitions.`,
  removeDuplicates: `For sorted lists, duplicates cluster together. A dummy node lets us skip entire runs of duplicates without worrying if they include the head. We keep a "prev" pointer at the last confirmed unique node.`,
};

const EDGES = {
  mergeSorted: [
    "One or both lists empty",
    "All elements of one list smaller",
    "Interleaved values",
    "Lists of different lengths",
    "Equal values in both",
  ],
  removeValue: [
    "Empty list",
    "All nodes match (result is empty)",
    "No matches",
    "Head is target",
    "Consecutive targets",
    "Target at tail",
  ],
  partition: [
    "Empty list",
    "All nodes < x",
    "All nodes ≥ x",
    "x smaller than all",
    "x larger than all",
    "Single node",
  ],
  removeDuplicates: [
    "Empty list",
    "No duplicates",
    "All duplicates (result empty)",
    "Duplicates at head",
    "Duplicates at tail",
    "Single node",
  ],
};

// ── Style helpers ──

const css = {
  page: {
    minHeight: "100vh",
    background: P.bg,
    fontFamily: FONT,
    color: P.text,
    padding: "20px 16px 56px",
    boxSizing: "border-box",
  },
  wrap: { maxWidth: 1220, margin: "0 auto" },
  header: { textAlign: "center", marginBottom: 22 },
  title: {
    fontSize: 31,
    fontWeight: 900,
    margin: 0,
    background: "linear-gradient(135deg, #0d9373, #e8456b)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    letterSpacing: "-0.3px",
  },
  sub: {
    fontSize: 14,
    color: P.textFade,
    marginTop: 3,
    fontFamily: SANS,
    fontWeight: 500,
  },

  card: {
    background: P.card,
    borderRadius: 14,
    boxShadow: P.shadow,
    padding: "18px 22px",
    marginBottom: 16,
    border: `1px solid ${P.cardBorder}`,
  },
  label: (c) => ({
    fontSize: 11,
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "1.1px",
    marginBottom: 13,
    color: c,
    fontFamily: SANS,
  }),
  row: { display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" },

  // Pill buttons
  pill: (on) => ({
    padding: "8px 17px",
    borderRadius: 10,
    border: on ? `2px solid ${P.mint}` : "2px solid #dee2e6",
    background: on ? P.mintPale : "#fff",
    color: on ? P.mint : P.textMid,
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s",
    fontFamily: SANS,
    whiteSpace: "nowrap",
  }),

  input: {
    padding: "9px 14px",
    borderRadius: 10,
    border: "2px solid #dee2e6",
    fontSize: 13,
    outline: "none",
    fontWeight: 600,
    fontFamily: SANS,
    transition: "border-color 0.2s",
  },

  btn: (bg, fg = "#fff") => ({
    padding: "9px 20px",
    borderRadius: 10,
    border: "none",
    fontSize: 13,
    fontWeight: 700,
    color: fg,
    background: bg,
    cursor: "pointer",
    transition: "transform 0.12s, box-shadow 0.12s",
    boxShadow: `0 3px 12px ${bg}33`,
    fontFamily: SANS,
    whiteSpace: "nowrap",
  }),
  btnOff: { opacity: 0.42, pointerEvents: "none" },

  slider: { width: 88, accentColor: P.mint, cursor: "pointer" },
  sliderLbl: {
    fontSize: 12,
    fontWeight: 700,
    color: P.textFade,
    fontFamily: SANS,
  },

  // Visualization
  vizScroll: { overflowX: "auto", padding: "12px 4px 8px", minHeight: 90 },
  vizRow: { display: "flex", alignItems: "center", minWidth: "fit-content" },
  vizLabel: (c) => ({
    fontSize: 11,
    fontWeight: 800,
    color: c,
    marginRight: 10,
    fontFamily: SANS,
    letterSpacing: "0.5px",
    flexShrink: 0,
    minWidth: 56,
  }),

  node: (grad, sc = 1, ring = false) => ({
    width: 56,
    height: 56,
    borderRadius: 12,
    background: grad,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: 800,
    fontSize: 18,
    flexShrink: 0,
    fontFamily: SANS,
    transition:
      "transform 0.38s cubic-bezier(.34,1.56,.64,1), box-shadow 0.3s, opacity 0.3s",
    transform: `scale(${sc})`,
    boxShadow: ring
      ? `0 0 0 4px ${P.mint}44, 0 5px 18px rgba(0,0,0,0.13)`
      : "0 3px 12px rgba(0,0,0,0.09)",
    position: "relative",
    zIndex: ring ? 3 : 1,
  }),
  nodeIdx: {
    fontSize: 8,
    fontWeight: 700,
    opacity: 0.7,
    marginTop: 1,
    letterSpacing: "0.4px",
  },

  badge: (bg, pos = "top") => ({
    position: "absolute",
    ...(pos === "top" ? { top: -22 } : { bottom: -22 }),
    left: "50%",
    transform: "translateX(-50%)",
    padding: "2px 9px",
    borderRadius: 6,
    fontSize: 9,
    fontWeight: 800,
    background: bg,
    color: "#fff",
    whiteSpace: "nowrap",
    letterSpacing: "0.5px",
    fontFamily: SANS,
    boxShadow: `0 2px 8px ${bg}55`,
  }),

  arrow: (c) => ({
    width: 28,
    height: 3,
    background: c,
    position: "relative",
    flexShrink: 0,
    borderRadius: 2,
    transition: "background 0.3s",
  }),
  arrowTip: (c) => ({
    position: "absolute",
    right: -5,
    top: -4.5,
    width: 0,
    height: 0,
    borderTop: "5.5px solid transparent",
    borderBottom: "5.5px solid transparent",
    borderLeft: `7px solid ${c}`,
    transition: "border-left-color 0.3s",
  }),

  nullBox: {
    width: 42,
    height: 32,
    borderRadius: 8,
    background: P.gNull,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#868e96",
    fontSize: 10,
    fontWeight: 800,
    flexShrink: 0,
    fontFamily: SANS,
  },

  // Explanation
  expl: {
    padding: "14px 18px",
    borderRadius: 11,
    background: "linear-gradient(135deg, #f0faf7, #fef5f2)",
    border: `1px solid ${P.cardBorder}`,
    fontSize: 14,
    lineHeight: 1.75,
    color: P.text,
    minHeight: 42,
  },
  tag: (bg) => ({
    display: "inline-block",
    padding: "2px 10px",
    borderRadius: 6,
    background: bg,
    color: "#fff",
    fontSize: 11,
    fontWeight: 800,
    marginRight: 7,
    fontFamily: SANS,
    letterSpacing: "0.4px",
  }),

  // Legend
  legend: { display: "flex", flexWrap: "wrap", gap: 12, marginTop: 8 },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 11,
    fontWeight: 600,
    color: P.textFade,
    fontFamily: SANS,
  },
  legendDot: (bg) => ({
    width: 13,
    height: 13,
    borderRadius: 4,
    background: bg,
    flexShrink: 0,
  }),

  // Edu
  eduGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))",
    gap: 14,
  },
  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,
    fontSize: 13,
    fontWeight: 600,
    fontFamily: SANS,
  },
  th: {
    textAlign: "left",
    padding: "8px 12px",
    background: P.mintPale,
    color: P.mint,
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: "0.6px",
    textTransform: "uppercase",
  },
  td: { padding: "8px 12px", borderBottom: "1px solid #f1f3f5", color: P.text },

  phase: (bg) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "5px 14px",
    borderRadius: 8,
    background: bg,
    color: "#fff",
    fontSize: 11,
    fontWeight: 800,
    fontFamily: SANS,
    letterSpacing: "0.3px",
  }),
  empty: {
    textAlign: "center",
    padding: "32px 0",
    color: P.textFade,
    fontSize: 14,
    fontWeight: 600,
    fontFamily: SANS,
  },
};

const KEYFRAMES = `
@keyframes dummyPulse { 0%,100%{box-shadow:0 0 0 0 rgba(230,119,0,0.35)} 50%{box-shadow:0 0 0 8px rgba(230,119,0,0)} }
@keyframes fadeUp { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
`;

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2: Helpers
// ─────────────────────────────────────────────────────────────────────────────

let _id = 1;
const nid = () => _id++;
const parse = (s) =>
  s
    .split(",")
    .map((x) => parseInt(x.trim(), 10))
    .filter((n) => !isNaN(n));
const randSorted = (len) => {
  let v = [];
  let c = Math.floor(Math.random() * 5) + 1;
  for (let i = 0; i < len; i++) {
    c += Math.floor(Math.random() * 8) + 1;
    v.push(c);
  }
  return v;
};
const randArr = (lo, hi, len) =>
  Array.from(
    { length: len },
    () => lo + Math.floor(Math.random() * (hi - lo + 1)),
  );

// Build display node array: [{id, val, source?, isDummy?}]
const mkNodes = (vals, source = null) =>
  vals.map((v, i) => ({ id: nid(), val: v, idx: i, source }));

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3: Step Generators
// ─────────────────────────────────────────────────────────────────────────────

/*  Step shape:
 *  {
 *    listA: [{id,val}],         — top list (for merge) or main list
 *    listB: [{id,val}],         — second list (merge only)
 *    result: [{id,val,isDummy}],— growing result chain with dummy at [0]
 *    resultB: [{id,val,isDummy}], — second result chain (partition only)
 *    highlights: { listA: {idx:type}, listB: {idx:type}, result: {idx:type}, resultB: {idx:type} },
 *    pointers: { name: {list, idx} },
 *    explanation: string,
 *    phase: string | null,
 *    done: boolean,
 *  }
 */

// ── 3a. Merge Two Sorted Lists ──
function* genMergeSorted(valsA, valsB) {
  const A = mkNodes(valsA, "A");
  const B = mkNodes(valsB, "B");
  const dummy = { id: nid(), val: "D", isDummy: true };
  const result = [dummy];

  yield {
    listA: A,
    listB: B,
    result: [...result],
    resultB: [],
    highlights: { listA: {}, listB: {}, result: { 0: "dummy" }, resultB: {} },
    pointers: {},
    explanation: `Create a dummy node as the anchor for our merged result. We'll build the merged list by comparing heads of List A and List B.`,
    phase: "Setup",
    done: false,
  };

  let iA = 0,
    iB = 0;

  yield {
    listA: A,
    listB: B,
    result: [...result],
    resultB: [],
    highlights: {
      listA: iA < A.length ? { [iA]: "compare" } : {},
      listB: iB < B.length ? { [iB]: "compare" } : {},
      result: { 0: "dummy" },
      resultB: {},
    },
    pointers: {
      ...(iA < A.length ? { pA: { list: "listA", idx: iA } } : {}),
      ...(iB < B.length ? { pB: { list: "listB", idx: iB } } : {}),
      tail: { list: "result", idx: result.length - 1 },
    },
    explanation: `Initialize pointers: pA at List A head${A.length ? ` (${A[0].val})` : ""}, pB at List B head${B.length ? ` (${B[0].val})` : ""}. Tail pointer tracks end of merged chain.`,
    phase: "Compare",
    done: false,
  };

  while (iA < A.length && iB < B.length) {
    const pickA = A[iA].val <= B[iB].val;
    const picked = pickA ? A[iA] : B[iB];

    yield {
      listA: A,
      listB: B,
      result: [...result],
      resultB: [],
      highlights: {
        listA: { [iA]: pickA ? "picked" : "compare" },
        listB: { [iB]: pickA ? "compare" : "picked" },
        result: { 0: "dummy", [result.length - 1]: "active" },
        resultB: {},
      },
      pointers: {
        pA: { list: "listA", idx: iA },
        pB: { list: "listB", idx: iB },
        tail: { list: "result", idx: result.length - 1 },
      },
      explanation: `Compare A[${iA}]=${A[iA].val} vs B[${iB}]=${B[iB].val}. ${pickA ? `A is smaller (or equal)` : `B is smaller`} → attach ${picked.val} to result.`,
      phase: "Compare",
      done: false,
    };

    result.push({ id: picked.id, val: picked.val, source: pickA ? "A" : "B" });
    if (pickA) iA++;
    else iB++;

    yield {
      listA: A,
      listB: B,
      result: [...result],
      resultB: [],
      highlights: {
        listA: iA < A.length ? { [iA]: "compare" } : {},
        listB: iB < B.length ? { [iB]: "compare" } : {},
        result: { 0: "dummy", [result.length - 1]: "picked" },
        resultB: {},
      },
      pointers: {
        ...(iA < A.length ? { pA: { list: "listA", idx: iA } } : {}),
        ...(iB < B.length ? { pB: { list: "listB", idx: iB } } : {}),
        tail: { list: "result", idx: result.length - 1 },
      },
      explanation: `Attached ${picked.val}. Advance pointer. ${iA < A.length && iB < B.length ? `Next: A[${iA}]=${A[iA].val} vs B[${iB}]=${B[iB].val}.` : "One list exhausted — append remainder."}`,
      phase: "Attach",
      done: false,
    };
  }

  // Append remainder
  const rem = iA < A.length ? A.slice(iA) : B.slice(iB);
  const remName = iA < A.length ? "A" : "B";
  if (rem.length > 0) {
    yield {
      listA: A,
      listB: B,
      result: [...result],
      resultB: [],
      highlights: {
        listA:
          iA < A.length
            ? Object.fromEntries(A.slice(iA).map((_, j) => [iA + j, "picked"]))
            : {},
        listB:
          iB < B.length
            ? Object.fromEntries(B.slice(iB).map((_, j) => [iB + j, "picked"]))
            : {},
        result: { 0: "dummy" },
        resultB: {},
      },
      pointers: {},
      explanation: `List ${remName === "A" ? "B" : "A"} exhausted. Append remaining ${rem.length} node(s) from List ${remName}: [${rem.map((n) => n.val).join(", ")}].`,
      phase: "Append Rest",
      done: false,
    };
    rem.forEach((n) => result.push({ id: n.id, val: n.val, source: remName }));
  }

  // Final
  const resHL = { 0: "dummy" };
  for (let i = 1; i < result.length; i++) resHL[i] = "result";
  yield {
    listA: A,
    listB: B,
    result: [...result],
    resultB: [],
    highlights: { listA: {}, listB: {}, result: resHL, resultB: {} },
    pointers: {},
    explanation: `✅ Merge complete! Return dummy.next as the merged head. Result: [${result
      .slice(1)
      .map((n) => n.val)
      .join(" → ")}]. The dummy node is discarded.`,
    phase: "Done",
    done: true,
  };
}

// ── 3b. Remove Elements by Value ──
function* genRemoveValue(vals, target) {
  const nodes = mkNodes(vals);
  const dummy = { id: nid(), val: "D", isDummy: true };
  const resultIds = new Set(nodes.map((n) => n.id));

  yield {
    listA: [],
    listB: [],
    result: [dummy, ...nodes],
    resultB: [],
    highlights: { listA: {}, listB: {}, result: { 0: "dummy" }, resultB: {} },
    pointers: {},
    explanation: `Create dummy node before the head. This way, even if the head needs removal, we handle it uniformly. Target to remove: ${target}.`,
    phase: "Setup",
    done: false,
  };

  // Walk with prev
  let removed = [];
  let current = [dummy, ...nodes];
  let prev = 0;
  let cur = 1;

  yield {
    listA: [],
    listB: [],
    result: [...current],
    resultB: [],
    highlights: {
      listA: {},
      listB: {},
      result: { 0: "dummy", [cur]: "compare" },
      resultB: {},
    },
    pointers: {
      prev: { list: "result", idx: prev },
      curr: { list: "result", idx: cur },
    },
    explanation: `prev points to dummy (index 0). curr points to first real node (index 1${current[cur] ? `, value ${current[cur].val}` : ""}).`,
    phase: "Scan",
    done: false,
  };

  while (cur < current.length) {
    const node = current[cur];
    const isTarget = node.val === target;

    yield {
      listA: [],
      listB: [],
      result: [...current],
      resultB: [],
      highlights: {
        listA: {},
        listB: {},
        result: {
          0: "dummy",
          [cur]: isTarget ? "removed" : "compare",
          [prev]: "active",
        },
        resultB: {},
      },
      pointers: {
        prev: { list: "result", idx: prev },
        curr: { list: "result", idx: cur },
      },
      explanation: isTarget
        ? `Node at index ${cur} has value ${node.val} == ${target}. Remove it! Set prev.next = curr.next to skip this node.`
        : `Node at index ${cur} has value ${node.val} ≠ ${target}. Keep it. Advance prev to curr.`,
      phase: isTarget ? "Remove" : "Keep",
      done: false,
    };

    if (isTarget) {
      // Remove: skip this node
      current = [...current.slice(0, cur), ...current.slice(cur + 1)];
      // cur stays the same (now points to next node), prev stays
    } else {
      prev = cur;
      cur++;
    }

    // Show state after operation
    if (cur <= current.length) {
      const resHL = { 0: "dummy" };
      if (prev < current.length) resHL[prev] = "active";
      if (cur < current.length) resHL[cur] = "compare";
      yield {
        listA: [],
        listB: [],
        result: [...current],
        resultB: [],
        highlights: { listA: {}, listB: {}, result: resHL, resultB: {} },
        pointers: {
          prev: { list: "result", idx: prev },
          ...(cur < current.length
            ? { curr: { list: "result", idx: cur } }
            : {}),
        },
        explanation:
          cur < current.length
            ? `After operation. Next: check index ${cur}${current[cur] ? ` (value ${current[cur].val})` : ""}.`
            : `Reached end of list. Scan complete.`,
        phase: "Scan",
        done: false,
      };
    }
  }

  const resHL = { 0: "dummy" };
  for (let i = 1; i < current.length; i++) resHL[i] = "result";
  yield {
    listA: [],
    listB: [],
    result: [...current],
    resultB: [],
    highlights: { listA: {}, listB: {}, result: resHL, resultB: {} },
    pointers: {},
    explanation: `✅ All nodes with value ${target} removed! Return dummy.next. Result: [${current
      .slice(1)
      .map((n) => n.val)
      .join(" → ")}]${current.length === 1 ? " (empty list)" : ""}.`,
    phase: "Done",
    done: true,
  };
}

// ── 3c. Partition List ──
function* genPartition(vals, x) {
  const nodes = mkNodes(vals);
  const dummyLess = { id: nid(), val: "D", isDummy: true };
  const dummyGeq = { id: nid(), val: "D", isDummy: true };
  const lessChain = [dummyLess];
  const geqChain = [dummyGeq];

  yield {
    listA: nodes,
    listB: [],
    result: [...lessChain],
    resultB: [...geqChain],
    highlights: {
      listA: {},
      listB: {},
      result: { 0: "dummy" },
      resultB: { 0: "dummy" },
    },
    pointers: {},
    explanation: `Partition around x = ${x}. Create TWO dummy nodes: one heads the "less than" chain, the other heads the "≥" chain. We'll scan the original list and distribute nodes.`,
    phase: "Setup",
    done: false,
  };

  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    const goesLeft = n.val < x;

    yield {
      listA: nodes,
      listB: [],
      result: [...lessChain],
      resultB: [...geqChain],
      highlights: {
        listA: { [i]: goesLeft ? "picked" : "removed" },
        listB: {},
        result: { 0: "dummy", [lessChain.length - 1]: "active" },
        resultB: { 0: "dummy", [geqChain.length - 1]: "active" },
      },
      pointers: { curr: { list: "listA", idx: i } },
      explanation: `Node ${n.val} ${goesLeft ? `< ${x}` : `≥ ${x}`} → goes to ${goesLeft ? '"less" chain' : '"greater-or-equal" chain'}.`,
      phase: goesLeft ? "< x" : "≥ x",
      done: false,
    };

    if (goesLeft) lessChain.push({ ...n });
    else geqChain.push({ ...n });

    yield {
      listA: nodes,
      listB: [],
      result: [...lessChain],
      resultB: [...geqChain],
      highlights: {
        listA: { [i]: "visited" },
        listB: {},
        result: {
          0: "dummy",
          [lessChain.length - 1]: goesLeft ? "picked" : undefined,
        },
        resultB: {
          0: "dummy",
          [geqChain.length - 1]: !goesLeft ? "picked" : undefined,
        },
      },
      pointers: {},
      explanation: `Attached ${n.val} to ${goesLeft ? "less" : "geq"} chain.${i < nodes.length - 1 ? ` Next: node ${nodes[i + 1].val}.` : " All nodes distributed."}`,
      phase: "Attached",
      done: false,
    };
  }

  // Stitch
  const merged = [...lessChain, ...geqChain.slice(1)]; // skip geq dummy
  const mergedHL = { 0: "dummy" };
  for (let i = 1; i < merged.length; i++) mergedHL[i] = "result";
  yield {
    listA: [],
    listB: [],
    result: merged,
    resultB: [],
    highlights: { listA: {}, listB: {}, result: mergedHL, resultB: {} },
    pointers: {},
    explanation: `✅ Stitch chains: less.tail.next → geq.head (skip geq dummy). geq.tail.next → null. Result: [${merged
      .slice(1)
      .map((n) => n.val)
      .join(" → ")}]. Both dummy nodes discarded.`,
    phase: "Done",
    done: true,
  };
}

// ── 3d. Remove All Duplicates (LeetCode 82) ──
function* genRemoveDuplicates(vals) {
  const nodes = mkNodes(vals);
  const dummy = { id: nid(), val: "D", isDummy: true };
  let current = [dummy, ...nodes];

  yield {
    listA: [],
    listB: [],
    result: [...current],
    resultB: [],
    highlights: { listA: {}, listB: {}, result: { 0: "dummy" }, resultB: {} },
    pointers: {},
    explanation: `Remove ALL nodes that have duplicate values (not just extra copies). Dummy node protects against head removal. List must be sorted.`,
    phase: "Setup",
    done: false,
  };

  let prev = 0; // index of prev (starts at dummy)
  let cur = 1;

  while (cur < current.length) {
    // Check if current starts a duplicate run
    let runEnd = cur;
    while (
      runEnd + 1 < current.length &&
      current[runEnd + 1].val === current[cur].val
    ) {
      runEnd++;
    }

    const isDup = runEnd > cur;

    if (isDup) {
      // Highlight the duplicate run
      const runHL = { 0: "dummy", [prev]: "active" };
      for (let r = cur; r <= runEnd; r++) runHL[r] = "removed";
      yield {
        listA: [],
        listB: [],
        result: [...current],
        resultB: [],
        highlights: { listA: {}, listB: {}, result: runHL, resultB: {} },
        pointers: { prev: { list: "result", idx: prev } },
        explanation: `Duplicate run found! Value ${current[cur].val} appears ${runEnd - cur + 1} times (indices ${cur}–${runEnd}). Remove ALL of them by setting prev.next to skip the entire run.`,
        phase: "Duplicate Run",
        done: false,
      };

      // Remove the run
      current = [...current.slice(0, cur), ...current.slice(runEnd + 1)];
      // prev stays, cur stays (now points to element after run)
    } else {
      yield {
        listA: [],
        listB: [],
        result: [...current],
        resultB: [],
        highlights: {
          listA: {},
          listB: {},
          result: { 0: "dummy", [prev]: "active", [cur]: "compare" },
          resultB: {},
        },
        pointers: {
          prev: { list: "result", idx: prev },
          curr: { list: "result", idx: cur },
        },
        explanation: `Value ${current[cur].val} is unique (no adjacent duplicate). Keep it. Advance prev to curr.`,
        phase: "Unique",
        done: false,
      };
      prev = cur;
      cur++;
    }

    // Show updated state
    const stHL = { 0: "dummy" };
    if (prev < current.length) stHL[prev] = "active";
    if (cur < current.length) stHL[cur] = "compare";
    yield {
      listA: [],
      listB: [],
      result: [...current],
      resultB: [],
      highlights: { listA: {}, listB: {}, result: stHL, resultB: {} },
      pointers: {
        prev: { list: "result", idx: prev },
        ...(cur < current.length ? { curr: { list: "result", idx: cur } } : {}),
      },
      explanation:
        cur < current.length
          ? `Checking next: index ${cur} (value ${current[cur].val}).`
          : `Scan complete.`,
      phase: "Scan",
      done: false,
    };
  }

  const resHL = { 0: "dummy" };
  for (let i = 1; i < current.length; i++) resHL[i] = "result";
  yield {
    listA: [],
    listB: [],
    result: [...current],
    resultB: [],
    highlights: { listA: {}, listB: {}, result: resHL, resultB: {} },
    pointers: {},
    explanation: `✅ All duplicate values eliminated! Return dummy.next. Result: [${current
      .slice(1)
      .map((n) => n.val)
      .join(" → ")}]${current.length === 1 ? " (empty)" : ""}.`,
    phase: "Done",
    done: true,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 4: Rendering Helpers
// ─────────────────────────────────────────────────────────────────────────────

const gradientFor = (type) => {
  switch (type) {
    case "dummy":
      return P.gDummy;
    case "active":
      return P.gActive;
    case "compare":
      return P.gCompare;
    case "picked":
      return P.gPicked;
    case "removed":
      return P.gRemoved;
    case "result":
      return P.gResult;
    case "visited":
      return P.gVisited;
    default:
      return P.gDefault;
  }
};

const scaleFor = (type) => {
  if (type === "picked" || type === "removed" || type === "result") return 1.08;
  if (type === "dummy") return 1.04;
  if (type === "active" || type === "compare") return 1.06;
  if (type === "visited") return 0.92;
  return 1;
};

const ringFor = (type) =>
  type === "active" ||
  type === "picked" ||
  type === "removed" ||
  type === "dummy" ||
  type === "result";

const arrowColorFor = (type) => {
  if (type === "picked" || type === "result" || type === "active")
    return P.mint;
  if (type === "removed") return P.coral;
  if (type === "compare") return P.indigo;
  if (type === "dummy") return P.amber;
  return "#ced4da";
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 5: NodeChain — reusable list renderer sub-component
// ─────────────────────────────────────────────────────────────────────────────

function NodeChain({
  label,
  labelColor,
  nodes,
  highlights,
  pointers,
  showNull = true,
}) {
  if (!nodes || nodes.length === 0) return null;

  // Build pointer lookup: idx -> [names]
  const ptrLookup = {};
  if (pointers) {
    Object.entries(pointers).forEach(([name, loc]) => {
      if (loc.list === label) {
        if (!ptrLookup[loc.idx]) ptrLookup[loc.idx] = [];
        ptrLookup[loc.idx].push(name);
      }
    });
  }

  const ptrColor = {
    prev: P.mint,
    curr: P.indigo,
    tail: P.amber,
    pA: P.indigo,
    pB: P.coral,
    lessT: P.mint,
    geqT: P.coral,
  };

  return (
    <div style={{ marginBottom: 10 }}>
      {labelColor && (
        <div style={css.vizLabel(labelColor)}>
          {label === "result"
            ? "Result"
            : label === "resultB"
              ? "≥ x chain"
              : label === "listA"
                ? "List A"
                : label === "listB"
                  ? "List B"
                  : label}
        </div>
      )}
      <div style={css.vizRow}>
        {nodes.map((nd, i) => {
          const hl = highlights?.[i];
          const grad = gradientFor(hl);
          const sc = scaleFor(hl);
          const ring = ringFor(hl);
          const ac = arrowColorFor(hl);
          const ptrs = ptrLookup[i] || [];

          return (
            <div
              key={nd.id + "-" + i}
              style={{ display: "flex", alignItems: "center" }}
            >
              <div style={{ position: "relative" }}>
                {/* Top badge */}
                {ptrs.length > 0 && (
                  <div style={css.badge(ptrColor[ptrs[0]] || P.mint, "top")}>
                    {ptrs[0]}
                  </div>
                )}
                {/* Bottom badge for 2nd pointer */}
                {ptrs.length > 1 && (
                  <div
                    style={css.badge(ptrColor[ptrs[1]] || P.indigo, "bottom")}
                  >
                    {ptrs[1]}
                  </div>
                )}
                {/* Dummy label */}
                {nd.isDummy && ptrs.length === 0 && (
                  <div style={css.badge(P.amber, "top")}>DUMMY</div>
                )}

                <div
                  style={{
                    ...css.node(grad, sc, ring),
                    ...(nd.isDummy
                      ? {
                          borderRadius: "50%",
                          width: 52,
                          height: 52,
                          animation: "dummyPulse 2.5s ease infinite",
                        }
                      : {}),
                  }}
                >
                  <span>{nd.isDummy ? "D" : nd.val}</span>
                  {!nd.isDummy && (
                    <span style={css.nodeIdx}>
                      {nd.source ? nd.source : `#${i}`}
                    </span>
                  )}
                </div>
              </div>

              {/* Arrow */}
              {i < nodes.length - 1 && (
                <div style={css.arrow(ac)}>
                  <div style={css.arrowTip(ac)} />
                </div>
              )}
            </div>
          );
        })}

        {/* Null terminator */}
        {showNull && (
          <>
            <div style={css.arrow("#ced4da")}>
              <div style={css.arrowTip("#ced4da")} />
            </div>
            <div style={css.nullBox}>NULL</div>
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 6: Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function DummyNodeVisualizer() {
  // Inject keyframes
  useEffect(() => {
    const id = "dn-kf";
    if (!document.getElementById(id)) {
      const s = document.createElement("style");
      s.id = id;
      s.textContent = KEYFRAMES;
      document.head.appendChild(s);
    }
  }, []);

  // ── State ──
  const [algo, setAlgo] = useState("mergeSorted");
  const [inputA, setInputA] = useState("1, 3, 5, 9, 14");
  const [inputB, setInputB] = useState("2, 4, 6, 8, 11");
  const [target, setTarget] = useState("3");
  const [speed, setSpeed] = useState(750);
  const [steps, setSteps] = useState([]);
  const [stepIdx, setStepIdx] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [running, setRunning] = useState(false);

  const playRef = useRef(false);
  const step = stepIdx >= 0 && stepIdx < steps.length ? steps[stepIdx] : null;

  const needsTwo = algo === "mergeSorted";
  const needsTarget = algo === "removeValue" || algo === "partition";

  // Default inputs per algo
  useEffect(() => {
    switch (algo) {
      case "mergeSorted":
        setInputA("1, 3, 5, 9, 14");
        setInputB("2, 4, 6, 8, 11");
        break;
      case "removeValue":
        setInputA("1, 2, 6, 3, 4, 5, 6");
        setTarget("6");
        break;
      case "partition":
        setInputA("1, 4, 3, 2, 5, 2");
        setTarget("3");
        break;
      case "removeDuplicates":
        setInputA("1, 2, 3, 3, 4, 4, 5");
        break;
    }
    resetViz();
  }, [algo]);

  const resetViz = useCallback(() => {
    playRef.current = false;
    setSteps([]);
    setStepIdx(-1);
    setPlaying(false);
    setRunning(false);
  }, []);

  const execute = useCallback(() => {
    resetViz();
    setTimeout(() => {
      const a = parse(inputA);
      const b = parse(inputB);
      const t = parseInt(target, 10) || 0;
      let gen;
      switch (algo) {
        case "mergeSorted":
          gen = genMergeSorted(a, b);
          break;
        case "removeValue":
          gen = genRemoveValue(a, t);
          break;
        case "partition":
          gen = genPartition(a, t);
          break;
        case "removeDuplicates":
          gen = genRemoveDuplicates(a);
          break;
        default:
          return;
      }
      const all = [...gen];
      setSteps(all);
      setStepIdx(0);
      setRunning(true);
    }, 60);
  }, [algo, inputA, inputB, target, resetViz]);

  const randomize = () => {
    switch (algo) {
      case "mergeSorted":
        setInputA(randSorted(randArr(4, 6, 1)[0]).join(", "));
        setInputB(randSorted(randArr(4, 6, 1)[0]).join(", "));
        break;
      case "removeValue": {
        const arr = randArr(1, 9, 8);
        setInputA(arr.join(", "));
        setTarget(String(arr[Math.floor(Math.random() * arr.length)]));
        break;
      }
      case "partition": {
        const arr = randArr(1, 15, 7);
        setInputA(arr.join(", "));
        setTarget(String(arr[Math.floor(Math.random() * arr.length)]));
        break;
      }
      case "removeDuplicates": {
        const s = randSorted(7);
        // inject some duplicates
        const idx = 1 + Math.floor(Math.random() * (s.length - 2));
        s.splice(idx, 0, s[idx]);
        if (s.length > 4) {
          const j = 3 + Math.floor(Math.random() * (s.length - 4));
          s.splice(j, 0, s[j]);
        }
        setInputA(s.join(", "));
        break;
      }
    }
    resetViz();
  };

  const stepFwd = () => setStepIdx((i) => Math.min(i + 1, steps.length - 1));
  const stepBack = () => setStepIdx((i) => Math.max(i - 1, 0));
  const togglePlay = () => {
    if (playing) {
      playRef.current = false;
      setPlaying(false);
    } else {
      if (stepIdx >= steps.length - 1) setStepIdx(0);
      setPlaying(true);
    }
  };

  useEffect(() => {
    if (!playing) return;
    playRef.current = true;
    let t;
    const adv = () => {
      if (!playRef.current) return;
      setStepIdx((i) => {
        if (i + 1 >= steps.length) {
          playRef.current = false;
          setPlaying(false);
          return i;
        }
        t = setTimeout(adv, speed);
        return i + 1;
      });
    };
    t = setTimeout(adv, speed);
    return () => {
      playRef.current = false;
      clearTimeout(t);
    };
  }, [playing, steps, speed]);

  const cx = COMPLEXITY[algo];
  const isDone = step?.done;

  // ── Pointer lookup normalization ──
  const ptrs = step?.pointers || {};
  const ptrForList = (listName) => {
    const out = {};
    Object.entries(ptrs).forEach(([name, loc]) => {
      if (loc.list === listName) {
        if (!out[loc.idx]) out[loc.idx] = [];
        out[loc.idx].push(name);
      }
    });
    return out; // not used directly — we pass pointers to NodeChain
  };

  return (
    <div style={css.page}>
      <div style={css.wrap}>
        {/* ═══ HEADER ═══ */}
        <div style={css.header}>
          <h1 style={css.title}>🛡️ Dummy Node Technique</h1>
          <p style={css.sub}>
            The sentinel pattern that eliminates edge cases in LinkedList
            operations
          </p>
        </div>

        {/* ═══ ALGORITHM SELECTOR ═══ */}
        <div style={css.card}>
          <div style={css.label(P.mint)}>🔬 Algorithm</div>
          <div style={css.row}>
            {ALGOS.map((a) => (
              <button
                key={a.id}
                style={css.pill(algo === a.id)}
                onClick={() => setAlgo(a.id)}
              >
                {a.icon} {a.label}
              </button>
            ))}
          </div>
        </div>

        {/* ═══ CONTROLS ═══ */}
        <div style={css.card}>
          <div style={css.label(P.coral)}>⚙️ Controls</div>
          <div style={css.row}>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <label
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: P.textFade,
                  fontFamily: SANS,
                }}
              >
                {needsTwo ? "List A (sorted)" : "List values"}
              </label>
              <input
                style={{ ...css.input, width: needsTwo ? 160 : 220 }}
                value={inputA}
                onChange={(e) => {
                  setInputA(e.target.value);
                  resetViz();
                }}
              />
            </div>

            {needsTwo && (
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <label
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: P.textFade,
                    fontFamily: SANS,
                  }}
                >
                  List B (sorted)
                </label>
                <input
                  style={{ ...css.input, width: 160 }}
                  value={inputB}
                  onChange={(e) => {
                    setInputB(e.target.value);
                    resetViz();
                  }}
                />
              </div>
            )}

            {needsTarget && (
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <label
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: P.textFade,
                    fontFamily: SANS,
                  }}
                >
                  {algo === "partition" ? "Pivot x" : "Target"}
                </label>
                <input
                  style={{ ...css.input, width: 60, textAlign: "center" }}
                  value={target}
                  onChange={(e) => {
                    setTarget(e.target.value);
                    resetViz();
                  }}
                  type="number"
                />
              </div>
            )}

            <button
              style={css.btn(P.mint)}
              onClick={execute}
              disabled={playing}
            >
              ▶ Execute
            </button>
            <button style={css.btn(P.slate)} onClick={randomize}>
              🎲 Random
            </button>
            <button style={css.btn(P.coral)} onClick={resetViz}>
              ↻ Reset
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={css.sliderLbl}>Slow</span>
              <input
                style={css.slider}
                type="range"
                min={100}
                max={1500}
                step={50}
                value={1600 - speed}
                onChange={(e) => setSpeed(1600 - +e.target.value)}
              />
              <span style={css.sliderLbl}>Fast</span>
              <span style={{ ...css.sliderLbl, minWidth: 46 }}>{speed}ms</span>
            </div>
          </div>

          {running && (
            <div style={{ ...css.row, marginTop: 12 }}>
              <button
                style={{
                  ...css.btn(P.indigo),
                  ...(stepIdx <= 0 || playing ? css.btnOff : {}),
                }}
                onClick={stepBack}
              >
                ◀ Prev
              </button>
              <button
                style={css.btn(
                  playing ? P.amber : P.mint,
                  playing ? "#333" : "#fff",
                )}
                onClick={togglePlay}
              >
                {playing ? "⏸ Pause" : "⏵ Auto-play"}
              </button>
              <button
                style={{
                  ...css.btn(P.indigo),
                  ...(stepIdx >= steps.length - 1 || playing ? css.btnOff : {}),
                }}
                onClick={stepFwd}
              >
                Next ▶
              </button>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: P.textFade,
                  fontFamily: SANS,
                }}
              >
                Step {stepIdx + 1} / {steps.length}
              </span>
              {step?.phase && (
                <span
                  style={css.phase(
                    isDone
                      ? step.phase === "Done"
                        ? P.mint
                        : "#e03131"
                      : P.indigo,
                  )}
                >
                  {step.phase}
                </span>
              )}
            </div>
          )}
        </div>

        {/* ═══ VISUALIZATION ═══ */}
        <div style={css.card}>
          <div style={css.label(P.amber)}>🔗 Visualization</div>

          {!step ? (
            <div style={css.empty}>
              Select an algorithm and press <strong>Execute</strong> to begin
            </div>
          ) : (
            <div style={css.vizScroll}>
              {/* List A (source — for merge or partition scan) */}
              {step.listA?.length > 0 && (
                <NodeChain
                  label="listA"
                  labelColor={P.indigo}
                  nodes={step.listA}
                  highlights={step.highlights?.listA}
                  pointers={step.pointers}
                  showNull
                />
              )}

              {/* List B (merge only) */}
              {step.listB?.length > 0 && (
                <NodeChain
                  label="listB"
                  labelColor={P.coral}
                  nodes={step.listB}
                  highlights={step.highlights?.listB}
                  pointers={step.pointers}
                  showNull
                />
              )}

              {/* Result chain (with dummy) */}
              {step.result?.length > 0 && (
                <NodeChain
                  label="result"
                  labelColor={P.mint}
                  nodes={step.result}
                  highlights={step.highlights?.result}
                  pointers={step.pointers}
                  showNull
                />
              )}

              {/* Second result chain (partition ≥ x) */}
              {step.resultB?.length > 0 && (
                <NodeChain
                  label="resultB"
                  labelColor={P.coral}
                  nodes={step.resultB}
                  highlights={step.highlights?.resultB}
                  pointers={step.pointers}
                  showNull
                />
              )}
            </div>
          )}

          {/* Legend */}
          <div style={css.legend}>
            <div style={css.legendItem}>
              <div style={css.legendDot(P.gDummy)} /> Dummy Node
            </div>
            <div style={css.legendItem}>
              <div style={css.legendDot(P.gDefault)} /> Default
            </div>
            <div style={css.legendItem}>
              <div style={css.legendDot(P.gActive)} /> Active / Prev
            </div>
            <div style={css.legendItem}>
              <div style={css.legendDot(P.gCompare)} /> Comparing
            </div>
            <div style={css.legendItem}>
              <div style={css.legendDot(P.gPicked)} /> Picked / Kept
            </div>
            <div style={css.legendItem}>
              <div style={css.legendDot(P.gRemoved)} /> Removed / Skipped
            </div>
            <div style={css.legendItem}>
              <div style={css.legendDot(P.gResult)} /> Final Result
            </div>
          </div>
        </div>

        {/* ═══ EXPLANATION ═══ */}
        <div style={css.card}>
          <div style={css.label(P.mint)}>💬 Step Explanation</div>
          <div style={css.expl}>
            {step ? (
              <div style={{ animation: "fadeUp 0.25s ease" }} key={stepIdx}>
                <span style={css.tag(isDone ? P.mint : P.indigo)}>
                  STEP {stepIdx + 1}
                </span>
                {step.explanation}
              </div>
            ) : (
              <span style={{ color: P.textFade }}>
                Explanation will appear here as you step through the algorithm.
              </span>
            )}
          </div>
        </div>

        {/* ═══ EDUCATIONAL PANELS ═══ */}
        <div style={css.eduGrid}>
          {/* Intuition */}
          <div style={css.card}>
            <div style={css.label(P.indigo)}>💡 Why Use a Dummy Node?</div>
            <p
              style={{
                fontSize: 14,
                lineHeight: 1.75,
                margin: 0,
                fontFamily: SANS,
                color: P.textMid,
              }}
            >
              {INTUITION[algo]}
            </p>
          </div>

          {/* Complexity */}
          <div style={css.card}>
            <div style={css.label(P.coral)}>⏱ Complexity</div>
            <table style={css.table}>
              <thead>
                <tr>
                  <th style={css.th}>Metric</th>
                  <th style={css.th}>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ ...css.td, fontWeight: 700 }}>Time</td>
                  <td style={css.td}>
                    <span style={css.tag(P.mint)}>{cx.time}</span>
                  </td>
                </tr>
                <tr>
                  <td style={{ ...css.td, fontWeight: 700 }}>Space</td>
                  <td style={css.td}>
                    <span style={css.tag(P.indigo)}>{cx.space}</span>
                  </td>
                </tr>
                <tr>
                  <td
                    style={{ ...css.td, fontWeight: 700, borderBottom: "none" }}
                  >
                    Note
                  </td>
                  <td style={{ ...css.td, borderBottom: "none" }}>{cx.note}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Edge Cases */}
          <div style={css.card}>
            <div style={css.label(P.amber)}>⚠️ Edge Cases</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {EDGES[algo].map((e, i) => (
                <span key={i} style={css.tag(P.slate)}>
                  {e}
                </span>
              ))}
            </div>
          </div>

          {/* All Algorithms */}
          <div style={css.card}>
            <div style={css.label(P.mint)}>📊 Technique Reference</div>
            <table style={css.table}>
              <thead>
                <tr>
                  <th style={css.th}>Problem</th>
                  <th style={css.th}>Time</th>
                  <th style={css.th}>Space</th>
                </tr>
              </thead>
              <tbody>
                {ALGOS.map((a) => (
                  <tr
                    key={a.id}
                    style={a.id === algo ? { background: P.mintPale } : {}}
                  >
                    <td
                      style={{
                        ...css.td,
                        fontWeight: a.id === algo ? 800 : 500,
                      }}
                    >
                      {a.icon} {a.label}
                    </td>
                    <td style={css.td}>{COMPLEXITY[a.id].time}</td>
                    <td style={css.td}>{COMPLEXITY[a.id].space}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Core Pattern Explanation */}
          <div style={{ ...css.card, gridColumn: "1 / -1" }}>
            <div style={css.label(P.coral)}>🧠 The Dummy Node Pattern</div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: 14,
              }}
            >
              <div
                style={{
                  padding: "16px 18px",
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #fff8f0, #fff0e6)",
                  border: "1px solid #ffe0cc",
                }}
              >
                <div style={{ fontSize: 26, marginBottom: 6 }}>🛡️</div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: P.amber,
                    marginBottom: 5,
                    fontFamily: SANS,
                  }}
                >
                  What Is It?
                </div>
                <div
                  style={{
                    fontSize: 13,
                    lineHeight: 1.65,
                    color: P.textMid,
                    fontFamily: SANS,
                  }}
                >
                  A <strong>sentinel node</strong> placed before the actual
                  head. It's never part of the final result — it's scaffolding
                  that simplifies pointer manipulation.
                </div>
              </div>
              <div
                style={{
                  padding: "16px 18px",
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #f0faf7, #e6f7ef)",
                  border: "1px solid #c3e6d5",
                }}
              >
                <div style={{ fontSize: 26, marginBottom: 6 }}>✨</div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: P.mint,
                    marginBottom: 5,
                    fontFamily: SANS,
                  }}
                >
                  Why Use It?
                </div>
                <div
                  style={{
                    fontSize: 13,
                    lineHeight: 1.65,
                    color: P.textMid,
                    fontFamily: SANS,
                  }}
                >
                  Eliminates special-case logic for <strong>empty lists</strong>{" "}
                  and <strong>head modifications</strong>. Every node —
                  including the first — has a predecessor to rewire.
                </div>
              </div>
              <div
                style={{
                  padding: "16px 18px",
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #f0f4ff, #e8edff)",
                  border: "1px solid #c5d0f0",
                }}
              >
                <div style={{ fontSize: 26, marginBottom: 6 }}>📝</div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: P.indigo,
                    marginBottom: 5,
                    fontFamily: SANS,
                  }}
                >
                  The Template
                </div>
                <div
                  style={{
                    fontSize: 13,
                    lineHeight: 1.65,
                    color: P.textMid,
                    fontFamily: SANS,
                  }}
                >
                  <code
                    style={{
                      background: "#f1f3f5",
                      padding: "2px 6px",
                      borderRadius: 4,
                      fontSize: 12,
                    }}
                  >
                    dummy = new Node(0);{"\n"}dummy.next = head;{"\n"}
                    ...manipulate...{"\n"}return dummy.next;
                  </code>
                </div>
              </div>
              <div
                style={{
                  padding: "16px 18px",
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #fef5f2, #fce8e8)",
                  border: "1px solid #f5c6c6",
                }}
              >
                <div style={{ fontSize: 26, marginBottom: 6 }}>🎯</div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: P.coral,
                    marginBottom: 5,
                    fontFamily: SANS,
                  }}
                >
                  Interview Signal
                </div>
                <div
                  style={{
                    fontSize: 13,
                    lineHeight: 1.65,
                    color: P.textMid,
                    fontFamily: SANS,
                  }}
                >
                  Using a dummy node shows the interviewer you understand clean
                  code patterns. It reduces bugs, shortens code, and
                  demonstrates <strong>structural thinking</strong>.
                </div>
              </div>
            </div>
          </div>

          {/* When to Use — Interview Tips */}
          <div style={{ ...css.card, gridColumn: "1 / -1" }}>
            <div style={css.label("#7048e8")}>
              🎯 When to Reach for a Dummy Node
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: 12,
              }}
            >
              {[
                {
                  q: "Head might change",
                  a: "Insertions/deletions at the front, removing head if it matches a condition, merging where the result head isn't known upfront.",
                },
                {
                  q: "Building a new list from scratch",
                  a: "Merge two lists, partition, filter — any time you're constructing a result by appending nodes. Dummy gives you a guaranteed tail to attach to.",
                },
                {
                  q: "Multiple output chains",
                  a: "Partition uses TWO dummy nodes — one per chain. Odd/even split, separating positive/negative — same pattern.",
                },
                {
                  q: "Uniform deletion logic",
                  a: "Without dummy, deleting head requires if(head==target) head=head.next. With dummy, the loop handles everything. Zero special cases.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    padding: "13px 16px",
                    borderRadius: 10,
                    background:
                      i % 2 === 0
                        ? "linear-gradient(135deg, #f0faf7, #f7fdfb)"
                        : "linear-gradient(135deg, #fef5f2, #fdf0f5)",
                    border: `1px solid ${P.cardBorder}`,
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 800,
                      color: P.text,
                      marginBottom: 5,
                      fontFamily: SANS,
                    }}
                  >
                    {item.q}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      lineHeight: 1.65,
                      color: P.textMid,
                      fontFamily: SANS,
                    }}
                  >
                    {item.a}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            marginTop: 22,
            fontSize: 12,
            color: P.textFade,
            fontWeight: 600,
            fontFamily: SANS,
          }}
        >
          Dummy Node Technique Visualizer — Sentinel Pattern for LinkedList —
          FAANG Interview Prep
        </div>
      </div>
    </div>
  );
}
