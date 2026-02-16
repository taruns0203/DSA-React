import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════════════════════
   In-Place Reversal Technique — LinkedList Visualizer
   ─────────────────────────────────────────────────────────────────────────────
   Demonstrates the 3-pointer (prev/curr/next) in-place reversal pattern.
   Algorithms:
     1. Reverse Entire List
     2. Reverse Sublist (between positions left..right)
     3. Reverse in K-Groups
     4. Swap Pairs (K=2 special case)

   Aesthetic: Electric geometric — blue/magenta/emerald on ice.
   Key feature: live variable-state tracker + arrow direction indicators.
   Self-contained React. No external dependencies.
   ═══════════════════════════════════════════════════════════════════════════════ */

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1: Palette & Constants
// ─────────────────────────────────────────────────────────────────────────────

const C = {
  bg: "linear-gradient(160deg, #f0f6ff 0%, #f5f0ff 35%, #fff0f6 65%, #f0fff8 100%)",
  card: "#ffffff",
  border: "#e2e8f0",
  shadow: "0 4px 24px rgba(0,50,120,0.06), 0 1px 3px rgba(0,0,0,0.03)",

  blue: "#0066ff",
  blueLt: "#5c9aff",
  bluePale: "rgba(0,102,255,0.07)",
  mag: "#d63384",
  magLt: "#e685b5",
  magPale: "rgba(214,51,132,0.07)",
  em: "#10b981",
  emLt: "#6ee7b7",
  emPale: "rgba(16,185,129,0.07)",
  amber: "#f59e0b",
  amberLt: "#fcd34d",
  slate: "#475569",
  slateLt: "#94a3b8",

  gDefault: "linear-gradient(135deg, #475569 0%, #94a3b8 100%)",
  gPrev: "linear-gradient(135deg, #d63384 0%, #e685b5 100%)",
  gCurr: "linear-gradient(135deg, #0066ff 0%, #5c9aff 100%)",
  gNext: "linear-gradient(135deg, #f59e0b 0%, #fcd34d 100%)",
  gReversed: "linear-gradient(135deg, #10b981 0%, #6ee7b7 100%)",
  gActive: "linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)",
  gZone: "linear-gradient(135deg, #0066ff 0%, #d63384 100%)",
  gVisited: "linear-gradient(135deg, #cbd5e1 0%, #e2e8f0 100%)",
  gNull: "linear-gradient(135deg, #e2e8f0 0%, #f1f5f9 100%)",

  text: "#1e293b",
  textMid: "#475569",
  textFade: "#94a3b8",
  white: "#ffffff",
};

const GEO =
  "'Century Gothic', 'Futura', 'Avant Garde', 'Gill Sans', sans-serif";
const MONO =
  "'Cascadia Code', 'Fira Code', 'JetBrains Mono', 'Consolas', monospace";

const ALGOS = [
  { id: "reverseAll", label: "Reverse Entire List", icon: "⟲" },
  { id: "reverseSub", label: "Reverse Sublist", icon: "⟦⟧" },
  { id: "reverseK", label: "Reverse K-Groups", icon: "⟨K⟩" },
  { id: "swapPairs", label: "Swap Pairs", icon: "⇌" },
];

const COMPLEXITY = {
  reverseAll: {
    time: "O(n)",
    space: "O(1)",
    note: "Single pass. Only 3 pointer variables — no extra data structures.",
  },
  reverseSub: {
    time: "O(n)",
    space: "O(1)",
    note: "One traversal to find left position, then reverse (right-left+1) nodes in-place.",
  },
  reverseK: {
    time: "O(n)",
    space: "O(1)",
    note: "Process n/k groups. Each node visited exactly once. Constant extra pointers.",
  },
  swapPairs: {
    time: "O(n)",
    space: "O(1)",
    note: "Special case of k=2. Each pair swapped with pointer rewiring.",
  },
};

const INTUITION = {
  reverseAll: `The 3-pointer technique is the backbone of in-place reversal. At each step: save next, reverse current's pointer to prev, then slide all three pointers forward. When curr hits null, prev IS the new head. Zero extra space — just 3 variables doing a synchronized dance.`,
  reverseSub: `Think of it as: walk to position "left-1" (the connection point), then do a bounded reversal for (right-left) iterations. The trick is saving the "before" and "first" pointers to reconnect the reversed segment back into the main list.`,
  reverseK: `Process the list in chunks of k. For each group: check if k nodes remain, reverse them in-place, then connect the reversed group to the previous tail. If fewer than k nodes remain, leave them as-is. This is a favorite FAANG hard problem.`,
  swapPairs: `The simplest group-reversal: k=2. For each pair, swap by rewiring: prev.next → second, first.next → second.next, second.next → first. Then advance prev to first (which is now second in position).`,
};

const EDGES = {
  reverseAll: ["Empty list", "Single node", "Two nodes", "Already reversed"],
  reverseSub: [
    "left=1 (includes head)",
    "left=right (no change)",
    "right=length (includes tail)",
    "Entire list (left=1, right=n)",
    "Invalid bounds",
  ],
  reverseK: [
    "k=1 (no change)",
    "k=n (reverse all)",
    "k > n (no change)",
    "n not divisible by k (last group stays)",
    "Single node",
  ],
  swapPairs: [
    "Empty list",
    "Single node (no pair)",
    "Odd length (last node stays)",
    "Two nodes",
    "Even length",
  ],
};

const KF = `
@keyframes arrowFlash { 0%,100%{opacity:0.3} 50%{opacity:1} }
@keyframes nodeEnter { from{opacity:0;transform:scale(0.7)} to{opacity:1;transform:scale(1)} }
@keyframes fadeSlide { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }
@keyframes pointerPulse { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
`;

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2: Styles
// ─────────────────────────────────────────────────────────────────────────────

const Z = {
  page: {
    minHeight: "100vh",
    background: C.bg,
    fontFamily: GEO,
    color: C.text,
    padding: "20px 16px 56px",
    boxSizing: "border-box",
  },
  wrap: { maxWidth: 1280, margin: "0 auto" },
  header: { textAlign: "center", marginBottom: 20 },
  title: {
    fontSize: 30,
    fontWeight: 900,
    margin: 0,
    background:
      "linear-gradient(135deg, #0066ff 0%, #d63384 50%, #10b981 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    letterSpacing: "0.2px",
  },
  sub: {
    fontSize: 13,
    color: C.textFade,
    marginTop: 4,
    fontFamily: MONO,
    fontWeight: 500,
  },

  card: {
    background: C.card,
    borderRadius: 16,
    boxShadow: C.shadow,
    padding: "18px 22px",
    marginBottom: 16,
    border: `1px solid ${C.border}`,
  },
  label: (c) => ({
    fontSize: 10,
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "1.5px",
    marginBottom: 12,
    color: c,
    fontFamily: GEO,
  }),
  row: { display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" },

  pill: (on) => ({
    padding: "8px 16px",
    borderRadius: 10,
    border: on ? `2px solid ${C.blue}` : "2px solid #e2e8f0",
    background: on ? C.bluePale : "#fff",
    color: on ? C.blue : C.textMid,
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s",
    fontFamily: GEO,
    whiteSpace: "nowrap",
  }),

  input: {
    padding: "9px 14px",
    borderRadius: 10,
    border: "2px solid #e2e8f0",
    fontSize: 13,
    outline: "none",
    fontWeight: 600,
    fontFamily: MONO,
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
    transition: "transform 0.12s, box-shadow 0.15s",
    boxShadow: `0 3px 14px ${bg}30`,
    fontFamily: GEO,
    whiteSpace: "nowrap",
  }),
  btnOff: { opacity: 0.4, pointerEvents: "none" },

  slider: { width: 90, accentColor: C.blue, cursor: "pointer" },
  sliderLbl: {
    fontSize: 11,
    fontWeight: 700,
    color: C.textFade,
    fontFamily: GEO,
  },

  /* Visualization area */
  vizScroll: { overflowX: "auto", padding: "24px 6px 16px", minHeight: 110 },
  vizRow: { display: "flex", alignItems: "center", minWidth: "fit-content" },

  node: (grad, sc = 1, ring = false, inZone = false) => ({
    width: 58,
    height: 58,
    borderRadius: 13,
    background: grad,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: 800,
    fontSize: 18,
    flexShrink: 0,
    fontFamily: MONO,
    transition: "transform 0.4s cubic-bezier(.34,1.56,.64,1), box-shadow 0.35s",
    transform: `scale(${sc})`,
    boxShadow: ring
      ? `0 0 0 4px ${C.blue}33, 0 5px 18px rgba(0,0,0,0.14)`
      : inZone
        ? `0 0 0 3px ${C.mag}22, 0 3px 12px rgba(0,0,0,0.08)`
        : "0 3px 12px rgba(0,0,0,0.08)",
    position: "relative",
    zIndex: ring ? 3 : 1,
  }),
  nodeIdx: {
    fontSize: 8,
    fontWeight: 700,
    opacity: 0.7,
    marginTop: 1,
    letterSpacing: "0.5px",
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
    fontFamily: GEO,
    boxShadow: `0 2px 8px ${bg}44`,
    animation: "pointerPulse 1.5s ease infinite",
  }),

  arrow: (c, reversed = false) => ({
    width: 30,
    height: 3,
    background: c,
    position: "relative",
    flexShrink: 0,
    borderRadius: 2,
    transition: "background 0.3s",
    transform: reversed ? "scaleX(-1)" : "none",
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
    background: C.gNull,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#94a3b8",
    fontSize: 10,
    fontWeight: 800,
    flexShrink: 0,
    fontFamily: MONO,
  },

  /* Reversal direction indicator */
  dirIndicator: (reversed) => ({
    fontSize: 11,
    fontWeight: 800,
    color: reversed ? C.em : C.blue,
    fontFamily: MONO,
    padding: "3px 10px",
    borderRadius: 6,
    background: reversed ? C.emPale : C.bluePale,
    position: "absolute",
    top: -10,
    left: "50%",
    transform: "translateX(-50%)",
    whiteSpace: "nowrap",
    zIndex: 5,
    letterSpacing: "0.5px",
    animation: reversed ? "arrowFlash 1s ease infinite" : "none",
  }),

  /* Variable State Tracker */
  statePanel: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
    gap: 10,
    marginTop: 12,
  },
  stateBox: (borderColor) => ({
    padding: "10px 14px",
    borderRadius: 10,
    border: `2px solid ${borderColor}`,
    background: `${borderColor}08`,
    textAlign: "center",
  }),
  stateLabel: (c) => ({
    fontSize: 10,
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "1px",
    color: c,
    fontFamily: GEO,
    marginBottom: 4,
  }),
  stateValue: {
    fontSize: 16,
    fontWeight: 800,
    fontFamily: MONO,
    color: C.text,
  },

  /* Explanation */
  expl: {
    padding: "14px 18px",
    borderRadius: 12,
    background: "linear-gradient(135deg, #f0f6ff, #fff0f6)",
    border: `1px solid ${C.border}`,
    fontSize: 14,
    lineHeight: 1.75,
    color: C.text,
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
    fontFamily: GEO,
    letterSpacing: "0.4px",
  }),

  legend: { display: "flex", flexWrap: "wrap", gap: 12, marginTop: 10 },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 11,
    fontWeight: 600,
    color: C.textFade,
    fontFamily: GEO,
  },
  legendDot: (bg) => ({
    width: 13,
    height: 13,
    borderRadius: 4,
    background: bg,
    flexShrink: 0,
  }),

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
    fontFamily: GEO,
  },
  th: {
    textAlign: "left",
    padding: "8px 12px",
    background: C.bluePale,
    color: C.blue,
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: "0.6px",
    textTransform: "uppercase",
  },
  td: { padding: "8px 12px", borderBottom: "1px solid #f1f5f9", color: C.text },

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
    fontFamily: GEO,
    letterSpacing: "0.3px",
  }),
  empty: {
    textAlign: "center",
    padding: "32px 0",
    color: C.textFade,
    fontSize: 14,
    fontWeight: 600,
    fontFamily: GEO,
  },

  /* Zone overlay */
  zoneBar: {
    position: "absolute",
    bottom: -6,
    height: 4,
    borderRadius: 2,
    background: "linear-gradient(90deg, #0066ff, #d63384)",
    transition: "left 0.3s, width 0.3s",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3: Helpers
// ─────────────────────────────────────────────────────────────────────────────

let _uid = 1;
const uid = () => _uid++;
const parse = (s) =>
  s
    .split(",")
    .map((x) => parseInt(x.trim(), 10))
    .filter((n) => !isNaN(n));
const mkN = (vals) => vals.map((v, i) => ({ id: uid(), val: v, idx: i }));
const randA = (lo, hi, len) =>
  Array.from(
    { length: len },
    () => lo + Math.floor(Math.random() * (hi - lo + 1)),
  );

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 4: Step Generators
// ─────────────────────────────────────────────────────────────────────────────

/*
  Step shape:
  {
    nodes: [{id,val}],            — current node order
    highlights: { [idx]: type },  — "prev"|"curr"|"next"|"reversed"|"zone"|"visited"
    vars: { prev, curr, next, ...extra },  — variable state values (display)
    arrowStates: { [idx]: "normal"|"reversed"|"broken" },
    explanation: string,
    phase: string,
    done: boolean,
  }
*/

// ── 4a: Reverse Entire List ──
function* genReverseAll(vals) {
  let nodes = mkN(vals);
  const n = nodes.length;

  yield {
    nodes: [...nodes],
    highlights: {},
    vars: { prev: "null", curr: nodes[0]?.val ?? "null", next: "—" },
    arrowStates: {},
    explanation: `In-place reversal uses 3 pointers: prev (starts null), curr (starts at head), next (temp save). Each iteration reverses one link.`,
    phase: "Setup",
    done: false,
  };

  if (n <= 1) {
    yield {
      nodes: [...nodes],
      highlights: n ? { 0: "reversed" } : {},
      vars: { prev: "null", curr: nodes[0]?.val ?? "null", next: "null" },
      arrowStates: {},
      explanation: `✅ List has ${n} node(s) — already reversed!`,
      phase: "Done",
      done: true,
    };
    return;
  }

  // Build reversed order step by step
  let prevIdx = -1; // -1 means null
  let currIdx = 0;

  for (let iter = 0; iter < n; iter++) {
    const nextIdx = currIdx + 1 < n ? currIdx + 1 : -1;
    const nextVal = nextIdx >= 0 ? nodes[nextIdx].val : "null";

    // Step 1: Save next
    const hl1 = {};
    if (prevIdx >= 0) hl1[prevIdx] = "prev";
    hl1[currIdx] = "curr";
    if (nextIdx >= 0) hl1[nextIdx] = "next";
    for (let j = 0; j < currIdx; j++) if (!hl1[j]) hl1[j] = "reversed";

    const arrows1 = {};
    for (let j = 0; j < currIdx; j++) arrows1[j] = "reversed";

    yield {
      nodes: [...nodes],
      highlights: hl1,
      vars: {
        prev: prevIdx >= 0 ? nodes[prevIdx].val : "null",
        curr: nodes[currIdx].val,
        next: nextVal,
      },
      arrowStates: arrows1,
      explanation: `Iteration ${iter + 1}: Save next = ${nextVal}. Now reverse: set curr (${nodes[currIdx].val}).next → prev (${prevIdx >= 0 ? nodes[prevIdx].val : "null"}).`,
      phase: "Reverse Link",
      done: false,
    };

    // Step 2: Show the reversal
    const hl2 = { ...hl1 };
    hl2[currIdx] = "curr";
    const arrows2 = { ...arrows1 };
    arrows2[currIdx] = "reversed"; // this arrow is now reversed

    yield {
      nodes: [...nodes],
      highlights: hl2,
      vars: {
        prev: prevIdx >= 0 ? nodes[prevIdx].val : "null",
        curr: nodes[currIdx].val,
        next: nextVal,
      },
      arrowStates: arrows2,
      explanation: `Link reversed! Arrow at index ${currIdx} now points backward. Advance: prev ← curr, curr ← next.`,
      phase: "Advance",
      done: false,
    };

    // Advance
    prevIdx = currIdx;
    currIdx = nextIdx;

    if (currIdx < 0) break; // reached end
  }

  // Final: show reversed list
  const reversed = [...nodes].reverse();
  const finalHL = {};
  for (let i = 0; i < n; i++) finalHL[i] = "reversed";

  yield {
    nodes: reversed,
    highlights: finalHL,
    vars: { prev: `${nodes[n - 1].val} (new head)`, curr: "null", next: "—" },
    arrowStates: {},
    explanation: `✅ Reversal complete! prev is the new head (${nodes[n - 1].val}). Result: [${reversed.map((nd) => nd.val).join(" → ")}]. O(1) space — only 3 pointers used.`,
    phase: "Done",
    done: true,
  };
}

// ── 4b: Reverse Sublist ──
function* genReverseSub(vals, left, right) {
  let nodes = mkN(vals);
  const n = nodes.length;

  if (left < 1 || right > n || left >= right) {
    yield {
      nodes: [...nodes],
      highlights: {},
      vars: {},
      arrowStates: {},
      explanation: `⚠️ Invalid bounds: left=${left}, right=${right}, length=${n}. Need 1 ≤ left < right ≤ n.`,
      phase: "Error",
      done: true,
    };
    return;
  }

  // Mark the zone
  const zoneHL = {};
  for (let i = left - 1; i < right; i++) zoneHL[i] = "zone";
  yield {
    nodes: [...nodes],
    highlights: zoneHL,
    vars: { left, right, "zone size": right - left + 1 },
    arrowStates: {},
    explanation: `Reverse nodes from position ${left} to ${right} (1-indexed). Highlighted zone = ${right - left + 1} nodes. First, walk to position ${left - 1} to find the connection point.`,
    phase: "Setup",
    done: false,
  };

  // Walk to position left-1
  for (let i = 0; i < left - 1; i++) {
    const hl = { ...zoneHL, [i]: "visited" };
    yield {
      nodes: [...nodes],
      highlights: hl,
      vars: { position: i + 1, target: `pos ${left - 1}` },
      arrowStates: {},
      explanation: `Walking to connection point... at position ${i + 1} (value ${nodes[i].val}).${i + 1 === left - 1 ? " Found the node before the reversal zone!" : ""}`,
      phase: "Walk",
      done: false,
    };
  }

  // Reverse within zone
  const beforeIdx = left - 2; // -1 if left=1
  const firstOfZone = left - 1; // will become last after reversal

  let prevVal = "null";
  let prevI = -1;

  for (let iter = 0; iter < right - left + 1; iter++) {
    const ci = left - 1 + iter;
    const ni = ci + 1 < right ? ci + 1 : -1;

    const hl = {};
    for (let j = 0; j < left - 1; j++) hl[j] = "visited";
    for (let j = left - 1; j < right; j++) hl[j] = "zone";
    if (prevI >= 0) hl[prevI] = "prev";
    hl[ci] = "curr";
    if (ni >= 0) hl[ni] = "next";

    // Show reversed arrows within zone
    const arrs = {};
    for (let j = left - 1; j < ci; j++) arrs[j] = "reversed";

    yield {
      nodes: [...nodes],
      highlights: hl,
      vars: {
        prev: prevVal,
        curr: nodes[ci].val,
        next: ni >= 0 ? nodes[ni].val : "null",
        iteration: `${iter + 1}/${right - left + 1}`,
      },
      arrowStates: arrs,
      explanation: `Zone reversal ${iter + 1}: curr=${nodes[ci].val}. Reverse link: ${nodes[ci].val}.next → ${prevVal}. Save next, advance pointers.`,
      phase: "Reverse Zone",
      done: false,
    };

    prevVal = String(nodes[ci].val);
    prevI = ci;
  }

  // Reconnect: build final array
  const before = nodes.slice(0, left - 1);
  const zone = nodes.slice(left - 1, right);
  const after = nodes.slice(right);
  const reversed = [...before, ...zone.reverse(), ...after];

  const finalHL = {};
  for (let i = 0; i < reversed.length; i++) {
    if (i >= left - 1 && i < right) finalHL[i] = "reversed";
    else finalHL[i] = "visited";
  }

  yield {
    nodes: reversed,
    highlights: finalHL,
    vars: {
      before: beforeIdx >= 0 ? nodes[beforeIdx].val : "head",
      after: after.length ? after[0].val : "null",
    },
    arrowStates: {},
    explanation: `✅ Sublist reversed! Reconnected: ${beforeIdx >= 0 ? `node ${nodes[beforeIdx].val}` : "head"} → ${zone[zone.length - 1].val} (new zone start) and ${zone[0].val} → ${after.length ? after[0].val : "null"} (zone end). Result: [${reversed.map((nd) => nd.val).join(" → ")}].`,
    phase: "Done",
    done: true,
  };
}

// ── 4c: Reverse K-Groups ──
function* genReverseK(vals, k) {
  let nodes = mkN(vals);
  const n = nodes.length;

  if (k <= 1 || n === 0) {
    yield {
      nodes: [...nodes],
      highlights: {},
      vars: { k },
      arrowStates: {},
      explanation: k <= 1 ? `k=${k}: no reversal needed.` : `Empty list.`,
      phase: "Done",
      done: true,
    };
    return;
  }

  const totalGroups = Math.floor(n / k);
  const remainder = n % k;

  yield {
    nodes: [...nodes],
    highlights: {},
    vars: { k, groups: totalGroups, remainder },
    arrowStates: {},
    explanation: `Reverse in groups of k=${k}. Total: ${totalGroups} full group(s)${remainder > 0 ? ` + ${remainder} remaining node(s) (not reversed)` : ""}. Process each group left-to-right.`,
    phase: "Setup",
    done: false,
  };

  let result = [];
  let groupNum = 0;

  for (let g = 0; g < totalGroups; g++) {
    groupNum++;
    const start = g * k;
    const end = start + k;
    const group = nodes.slice(start, end);

    // Highlight current group
    const hl = {};
    for (let i = 0; i < result.length; i++) hl[i] = "reversed";
    for (let i = start; i < end; i++) hl[i] = "zone";
    for (let i = end; i < n; i++) hl[i] = i < (g + 1) * k ? "zone" : "";

    yield {
      nodes: [...nodes],
      highlights: hl,
      vars: { group: groupNum, range: `[${start}..${end - 1}]`, k },
      arrowStates: {},
      explanation: `Group ${groupNum}: nodes at indices ${start}–${end - 1} → [${group.map((nd) => nd.val).join(", ")}]. Reversing this segment in-place.`,
      phase: `Group ${groupNum}`,
      done: false,
    };

    // Show reversal within group
    for (let iter = 0; iter < k; iter++) {
      const ci = start + iter;
      const hlInner = {};
      for (let i = 0; i < start; i++) hlInner[i] = "reversed";
      for (let i = start; i < end; i++) hlInner[i] = "zone";
      hlInner[ci] = "curr";
      if (iter > 0) hlInner[ci - 1] = "prev";
      if (ci + 1 < end) hlInner[ci + 1] = "next";

      const arrs = {};
      for (let i = start; i < ci; i++) arrs[i] = "reversed";

      yield {
        nodes: [...nodes],
        highlights: hlInner,
        vars: {
          prev: iter > 0 ? nodes[ci - 1].val : "null",
          curr: nodes[ci].val,
          next: ci + 1 < end ? nodes[ci + 1].val : "null",
        },
        arrowStates: arrs,
        explanation: `Group ${groupNum}, step ${iter + 1}/${k}: Reversing node ${nodes[ci].val}. Point backward.`,
        phase: `Reversing G${groupNum}`,
        done: false,
      };
    }

    result.push(...group.reverse());
  }

  // Append remainder
  if (remainder > 0) {
    const remNodes = nodes.slice(totalGroups * k);
    result.push(...remNodes);

    yield {
      nodes: [...nodes],
      highlights: Object.fromEntries([
        ...result
          .slice(0, result.length - remainder)
          .map((_, i) => [i, "reversed"]),
        ...remNodes.map((_, i) => [totalGroups * k + i, "visited"]),
      ]),
      vars: { remainder, action: "keep as-is" },
      arrowStates: {},
      explanation: `${remainder} node(s) remaining (less than k=${k}). Keep them in original order: [${remNodes.map((nd) => nd.val).join(", ")}].`,
      phase: "Remainder",
      done: false,
    };
  }

  const finalHL = {};
  for (let i = 0; i < result.length; i++)
    finalHL[i] = i < totalGroups * k ? "reversed" : "visited";

  yield {
    nodes: result,
    highlights: finalHL,
    vars: { groups_reversed: totalGroups, total_nodes: n },
    arrowStates: {},
    explanation: `✅ K-group reversal complete! ${totalGroups} group(s) of ${k} reversed. Result: [${result.map((nd) => nd.val).join(" → ")}].`,
    phase: "Done",
    done: true,
  };
}

// ── 4d: Swap Pairs ──
function* genSwapPairs(vals) {
  let nodes = mkN(vals);
  const n = nodes.length;

  yield {
    nodes: [...nodes],
    highlights: {},
    vars: {
      pairs: Math.floor(n / 2),
      odd_leftover: n % 2 === 1 ? "yes" : "no",
    },
    arrowStates: {},
    explanation: `Swap every two adjacent nodes. ${Math.floor(n / 2)} pair(s) to swap${n % 2 ? " + 1 leftover node" : ""}. This is the k=2 special case of k-group reversal.`,
    phase: "Setup",
    done: false,
  };

  let result = [];
  let pairNum = 0;

  for (let i = 0; i < n - 1; i += 2) {
    pairNum++;
    const first = nodes[i];
    const second = nodes[i + 1];

    // Highlight pair
    const hl = {};
    for (let j = 0; j < i; j++) hl[j] = "reversed";
    hl[i] = "curr";
    hl[i + 1] = "next";

    yield {
      nodes: [...nodes],
      highlights: hl,
      vars: { pair: pairNum, first: first.val, second: second.val },
      arrowStates: {},
      explanation: `Pair ${pairNum}: nodes [${first.val}, ${second.val}]. Swap their positions: second comes first.`,
      phase: `Swap Pair ${pairNum}`,
      done: false,
    };

    // Show swap
    const hl2 = { ...hl };
    hl2[i] = "next";
    hl2[i + 1] = "curr";
    yield {
      nodes: [...nodes],
      highlights: hl2,
      vars: { pair: pairNum, action: `${second.val} ⇌ ${first.val}` },
      arrowStates: { [i]: "reversed" },
      explanation: `Rewire: prev.next → ${second.val}, ${second.val}.next → ${first.val}, ${first.val}.next → (next pair or null). Pair swapped!`,
      phase: `Rewiring`,
      done: false,
    };

    result.push(second, first);
  }

  // Leftover odd node
  if (n % 2 === 1) {
    result.push(nodes[n - 1]);
    yield {
      nodes: [...nodes],
      highlights: {
        ...Object.fromEntries(
          result.slice(0, -1).map((_, i) => [i, "reversed"]),
        ),
        [n - 1]: "visited",
      },
      vars: { leftover: nodes[n - 1].val },
      arrowStates: {},
      explanation: `Odd node ${nodes[n - 1].val} has no pair — stays in place.`,
      phase: "Leftover",
      done: false,
    };
  }

  const finalHL = {};
  for (let i = 0; i < result.length; i++) finalHL[i] = "reversed";

  yield {
    nodes: result,
    highlights: finalHL,
    vars: { swaps: pairNum },
    arrowStates: {},
    explanation: `✅ All pairs swapped! ${pairNum} swap(s) performed. Result: [${result.map((nd) => nd.val).join(" → ")}].`,
    phase: "Done",
    done: true,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 5: Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function InPlaceReversalVisualizer() {
  useEffect(() => {
    const id = "ipr-kf";
    if (!document.getElementById(id)) {
      const s = document.createElement("style");
      s.id = id;
      s.textContent = KF;
      document.head.appendChild(s);
    }
  }, []);

  const [algo, setAlgo] = useState("reverseAll");
  const [inputStr, setInputStr] = useState("3, 7, 12, 9, 5, 18");
  const [paramA, setParamA] = useState("2"); // left or k
  const [paramB, setParamB] = useState("5"); // right
  const [speed, setSpeed] = useState(750);
  const [steps, setSteps] = useState([]);
  const [stepIdx, setStepIdx] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [running, setRunning] = useState(false);

  const playRef = useRef(false);
  const step = stepIdx >= 0 && stepIdx < steps.length ? steps[stepIdx] : null;

  const needsLR = algo === "reverseSub";
  const needsK = algo === "reverseK";

  useEffect(() => {
    switch (algo) {
      case "reverseAll":
        setInputStr("3, 7, 12, 9, 5, 18");
        break;
      case "reverseSub":
        setInputStr("1, 2, 3, 4, 5, 6, 7");
        setParamA("2");
        setParamB("5");
        break;
      case "reverseK":
        setInputStr("1, 2, 3, 4, 5, 6, 7, 8");
        setParamA("3");
        break;
      case "swapPairs":
        setInputStr("1, 2, 3, 4, 5, 6, 7");
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
      const vals = parse(inputStr);
      const a = parseInt(paramA, 10) || 0;
      const b = parseInt(paramB, 10) || 0;
      let gen;
      switch (algo) {
        case "reverseAll":
          gen = genReverseAll(vals);
          break;
        case "reverseSub":
          gen = genReverseSub(vals, a, b);
          break;
        case "reverseK":
          gen = genReverseK(vals, a);
          break;
        case "swapPairs":
          gen = genSwapPairs(vals);
          break;
        default:
          return;
      }
      const all = [...gen];
      setSteps(all);
      setStepIdx(0);
      setRunning(true);
    }, 60);
  }, [algo, inputStr, paramA, paramB, resetViz]);

  const randomize = () => {
    const len = 5 + Math.floor(Math.random() * 4);
    const vals = randA(1, 50, len);
    setInputStr(vals.join(", "));
    if (needsLR) {
      const l = 1 + Math.floor(Math.random() * Math.max(1, len - 2));
      const r = l + 1 + Math.floor(Math.random() * (len - l));
      setParamA(String(l));
      setParamB(String(Math.min(r, len)));
    }
    if (needsK) setParamA(String(2 + Math.floor(Math.random() * 3)));
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

  // ── Render helpers ──
  const gradFor = (type) => {
    switch (type) {
      case "prev":
        return C.gPrev;
      case "curr":
        return C.gCurr;
      case "next":
        return C.gNext;
      case "reversed":
        return C.gReversed;
      case "zone":
        return C.gZone;
      case "active":
        return C.gActive;
      case "visited":
        return C.gVisited;
      default:
        return C.gDefault;
    }
  };
  const scaleFor = (t) =>
    t === "curr" || t === "prev" || t === "next"
      ? 1.1
      : t === "reversed" || t === "zone"
        ? 1.04
        : t === "visited"
          ? 0.93
          : 1;
  const ringFor = (t) =>
    t === "curr" || t === "prev" || t === "next" || t === "zone";

  const arrowColor = (idx) => {
    if (!step) return "#cbd5e1";
    const as = step.arrowStates?.[idx];
    if (as === "reversed") return C.mag;
    const hl = step.highlights?.[idx];
    if (hl === "reversed") return C.em;
    if (hl === "curr") return C.blue;
    if (hl === "zone") return C.mag;
    return "#cbd5e1";
  };

  const isArrowReversed = (idx) => step?.arrowStates?.[idx] === "reversed";

  const cx = COMPLEXITY[algo];
  const isDone = step?.done;

  const phaseColor = (p) => {
    if (!p) return C.textFade;
    if (p === "Done") return C.em;
    if (p.includes("Reverse") || p.includes("Rewir") || p.includes("Swap"))
      return C.mag;
    if (p.includes("Group") || p.includes("G")) return C.blue;
    if (p === "Error") return C.mag;
    return C.blue;
  };

  const renderNodes = () => {
    const nodes =
      step?.nodes || parse(inputStr).map((v, i) => ({ id: i, val: v, idx: i }));
    const highlights = step?.highlights || {};
    if (nodes.length === 0) return <div style={Z.empty}>∅ Empty list</div>;

    return (
      <div style={Z.vizRow}>
        {nodes.map((nd, i) => {
          const hl = highlights[i];
          const grad = gradFor(hl);
          const sc = scaleFor(hl);
          const ring = ringFor(hl);
          const inZone = hl === "zone";
          const ac = arrowColor(i);
          const isRev = isArrowReversed(i);

          // Pointer badges
          const isPrev = hl === "prev";
          const isCurr = hl === "curr";
          const isNext = hl === "next";

          return (
            <div
              key={`${nd.id}-${i}`}
              style={{
                display: "flex",
                alignItems: "center",
                position: "relative",
              }}
            >
              <div style={{ position: "relative" }}>
                {isPrev && <div style={Z.badge(C.mag, "top")}>prev</div>}
                {isCurr && <div style={Z.badge(C.blue, "top")}>curr</div>}
                {isNext && <div style={Z.badge(C.amber, "top")}>next</div>}
                {i === 0 && !isPrev && !isCurr && !isNext && (
                  <div style={Z.badge(C.slate, "top")}>HEAD</div>
                )}

                <div style={Z.node(grad, sc, ring, inZone)}>
                  <span>{nd.val}</span>
                  <span style={Z.nodeIdx}>#{i}</span>
                </div>
              </div>

              {i < nodes.length - 1 && (
                <div
                  style={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {isRev && (
                    <div
                      style={{
                        position: "absolute",
                        top: -14,
                        left: "50%",
                        transform: "translateX(-50%)",
                        fontSize: 9,
                        fontWeight: 800,
                        color: C.mag,
                        fontFamily: MONO,
                        animation: "arrowFlash 1s ease infinite",
                        whiteSpace: "nowrap",
                      }}
                    >
                      ← REV
                    </div>
                  )}
                  <div style={Z.arrow(ac, isRev)}>
                    <div style={Z.arrowTip(ac)} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={Z.arrow("#cbd5e1")}>
            <div style={Z.arrowTip("#cbd5e1")} />
          </div>
          <div style={Z.nullBox}>NULL</div>
        </div>
      </div>
    );
  };

  // Variable state tracker
  const renderVars = () => {
    const vars = step?.vars || {};
    const entries = Object.entries(vars);
    if (entries.length === 0) return null;

    const varColors = {
      prev: C.mag,
      curr: C.blue,
      next: C.amber,
      k: C.em,
      left: C.blue,
      right: C.mag,
      group: C.blue,
      pair: C.em,
      iteration: C.slate,
    };

    return (
      <div style={Z.statePanel}>
        {entries.map(([key, val]) => {
          const color = varColors[key] || C.slate;
          return (
            <div key={key} style={Z.stateBox(color)}>
              <div style={Z.stateLabel(color)}>{key}</div>
              <div style={Z.stateValue}>{String(val)}</div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={Z.page}>
      <div style={Z.wrap}>
        {/* ═══ HEADER ═══ */}
        <div style={Z.header}>
          <h1 style={Z.title}>⟲ In-Place Reversal Technique</h1>
          <p style={Z.sub}>{"prev → curr → next  //  the 3-pointer dance"}</p>
        </div>

        {/* ═══ ALGORITHM SELECTOR ═══ */}
        <div style={Z.card}>
          <div style={Z.label(C.blue)}>Algorithm</div>
          <div style={Z.row}>
            {ALGOS.map((a) => (
              <button
                key={a.id}
                style={Z.pill(algo === a.id)}
                onClick={() => setAlgo(a.id)}
              >
                {a.icon} {a.label}
              </button>
            ))}
          </div>
        </div>

        {/* ═══ CONTROLS ═══ */}
        <div style={Z.card}>
          <div style={Z.label(C.mag)}>Controls</div>
          <div style={Z.row}>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <label
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: C.textFade,
                  fontFamily: GEO,
                }}
              >
                node values
              </label>
              <input
                style={{ ...Z.input, width: needsLR ? 180 : 220 }}
                value={inputStr}
                onChange={(e) => {
                  setInputStr(e.target.value);
                  resetViz();
                }}
              />
            </div>

            {needsLR && (
              <>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 3 }}
                >
                  <label
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: C.textFade,
                      fontFamily: GEO,
                    }}
                  >
                    left (1-idx)
                  </label>
                  <input
                    style={{ ...Z.input, width: 56, textAlign: "center" }}
                    value={paramA}
                    onChange={(e) => {
                      setParamA(e.target.value);
                      resetViz();
                    }}
                    type="number"
                    min={1}
                  />
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 3 }}
                >
                  <label
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: C.textFade,
                      fontFamily: GEO,
                    }}
                  >
                    right
                  </label>
                  <input
                    style={{ ...Z.input, width: 56, textAlign: "center" }}
                    value={paramB}
                    onChange={(e) => {
                      setParamB(e.target.value);
                      resetViz();
                    }}
                    type="number"
                    min={1}
                  />
                </div>
              </>
            )}

            {needsK && (
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <label
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: C.textFade,
                    fontFamily: GEO,
                  }}
                >
                  k (group size)
                </label>
                <input
                  style={{ ...Z.input, width: 56, textAlign: "center" }}
                  value={paramA}
                  onChange={(e) => {
                    setParamA(e.target.value);
                    resetViz();
                  }}
                  type="number"
                  min={1}
                />
              </div>
            )}

            <button style={Z.btn(C.blue)} onClick={execute} disabled={playing}>
              ▶ Execute
            </button>
            <button style={Z.btn(C.slate)} onClick={randomize}>
              🎲 Random
            </button>
            <button style={Z.btn(C.mag)} onClick={resetViz}>
              ↻ Reset
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={Z.sliderLbl}>slow</span>
              <input
                style={Z.slider}
                type="range"
                min={100}
                max={1500}
                step={50}
                value={1600 - speed}
                onChange={(e) => setSpeed(1600 - +e.target.value)}
              />
              <span style={Z.sliderLbl}>fast</span>
              <span style={{ ...Z.sliderLbl, minWidth: 46 }}>{speed}ms</span>
            </div>
          </div>

          {running && (
            <div style={{ ...Z.row, marginTop: 12 }}>
              <button
                style={{
                  ...Z.btn(C.blue),
                  ...(stepIdx <= 0 || playing ? Z.btnOff : {}),
                }}
                onClick={stepBack}
              >
                ◀ Prev
              </button>
              <button
                style={Z.btn(
                  playing ? C.amber : C.em,
                  playing ? "#1e293b" : "#fff",
                )}
                onClick={togglePlay}
              >
                {playing ? "⏸ Pause" : "⏵ Auto"}
              </button>
              <button
                style={{
                  ...Z.btn(C.blue),
                  ...(stepIdx >= steps.length - 1 || playing ? Z.btnOff : {}),
                }}
                onClick={stepFwd}
              >
                Next ▶
              </button>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: C.textFade,
                  fontFamily: MONO,
                }}
              >
                {stepIdx + 1}/{steps.length}
              </span>
              {step?.phase && (
                <span style={Z.phase(phaseColor(step.phase))}>
                  {step.phase}
                </span>
              )}
            </div>
          )}
        </div>

        {/* ═══ VISUALIZATION ═══ */}
        <div style={Z.card}>
          <div style={Z.label(C.em)}>Linked List</div>
          <div style={Z.vizScroll}>{renderNodes()}</div>

          {/* Variable State Tracker */}
          {step && renderVars()}

          {/* Legend */}
          <div style={Z.legend}>
            <div style={Z.legendItem}>
              <div style={Z.legendDot(C.gDefault)} /> Default
            </div>
            <div style={Z.legendItem}>
              <div style={Z.legendDot(C.gPrev)} /> prev
            </div>
            <div style={Z.legendItem}>
              <div style={Z.legendDot(C.gCurr)} /> curr
            </div>
            <div style={Z.legendItem}>
              <div style={Z.legendDot(C.gNext)} /> next / temp
            </div>
            <div style={Z.legendItem}>
              <div style={Z.legendDot(C.gReversed)} /> Reversed
            </div>
            <div style={Z.legendItem}>
              <div style={Z.legendDot(C.gZone)} /> Reversal Zone
            </div>
            <div style={Z.legendItem}>
              <div style={Z.legendDot(C.gVisited)} /> Visited
            </div>
          </div>
        </div>

        {/* ═══ EXPLANATION ═══ */}
        <div style={Z.card}>
          <div style={Z.label(C.blue)}>Step Explanation</div>
          <div style={Z.expl}>
            {step ? (
              <div style={{ animation: "fadeSlide 0.25s ease" }} key={stepIdx}>
                <span style={Z.tag(isDone ? C.em : phaseColor(step.phase))}>
                  STEP {stepIdx + 1}
                </span>
                {step.explanation}
              </div>
            ) : (
              <span style={{ color: C.textFade, fontFamily: MONO }}>
                Select an algorithm and press Execute to begin.
              </span>
            )}
          </div>
        </div>

        {/* ═══ EDUCATIONAL PANELS ═══ */}
        <div style={Z.eduGrid}>
          <div style={Z.card}>
            <div style={Z.label(C.mag)}>💡 Intuition</div>
            <p
              style={{
                fontSize: 14,
                lineHeight: 1.75,
                margin: 0,
                fontFamily: GEO,
                color: C.textMid,
              }}
            >
              {INTUITION[algo]}
            </p>
          </div>

          <div style={Z.card}>
            <div style={Z.label(C.blue)}>⏱ Complexity</div>
            <table style={Z.table}>
              <thead>
                <tr>
                  <th style={Z.th}>Metric</th>
                  <th style={Z.th}>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ ...Z.td, fontWeight: 700 }}>Time</td>
                  <td style={Z.td}>
                    <span style={Z.tag(C.blue)}>{cx.time}</span>
                  </td>
                </tr>
                <tr>
                  <td style={{ ...Z.td, fontWeight: 700 }}>Space</td>
                  <td style={Z.td}>
                    <span style={Z.tag(C.mag)}>{cx.space}</span>
                  </td>
                </tr>
                <tr>
                  <td
                    style={{ ...Z.td, fontWeight: 700, borderBottom: "none" }}
                  >
                    Note
                  </td>
                  <td style={{ ...Z.td, borderBottom: "none" }}>{cx.note}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={Z.card}>
            <div style={Z.label(C.amber)}>⚠️ Edge Cases</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {EDGES[algo].map((e, i) => (
                <span key={i} style={Z.tag(C.slate)}>
                  {e}
                </span>
              ))}
            </div>
          </div>

          <div style={Z.card}>
            <div style={Z.label(C.em)}>📊 All Algorithms</div>
            <table style={Z.table}>
              <thead>
                <tr>
                  <th style={Z.th}>Algorithm</th>
                  <th style={Z.th}>Time</th>
                  <th style={Z.th}>Space</th>
                </tr>
              </thead>
              <tbody>
                {ALGOS.map((a) => (
                  <tr
                    key={a.id}
                    style={a.id === algo ? { background: C.bluePale } : {}}
                  >
                    <td
                      style={{ ...Z.td, fontWeight: a.id === algo ? 800 : 500 }}
                    >
                      {a.icon} {a.label}
                    </td>
                    <td style={Z.td}>{COMPLEXITY[a.id].time}</td>
                    <td style={Z.td}>{COMPLEXITY[a.id].space}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Core Pattern */}
          <div style={{ ...Z.card, gridColumn: "1 / -1" }}>
            <div style={Z.label(C.blue)}>🧠 The 3-Pointer Pattern</div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
                gap: 14,
              }}
            >
              <div
                style={{
                  padding: "16px 18px",
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #fdf2f8, #fce7f3)",
                  border: "1px solid #f9a8d4",
                }}
              >
                <div style={{ fontSize: 26, marginBottom: 6 }}>🔴</div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: C.mag,
                    marginBottom: 5,
                    fontFamily: GEO,
                  }}
                >
                  prev — The Anchor
                </div>
                <div
                  style={{
                    fontSize: 13,
                    lineHeight: 1.65,
                    color: C.textMid,
                    fontFamily: GEO,
                  }}
                >
                  Starts at <strong>null</strong>. After reversal, prev becomes
                  the <strong>new head</strong>. It's where reversed links point
                  TO.
                </div>
              </div>
              <div
                style={{
                  padding: "16px 18px",
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #eff6ff, #dbeafe)",
                  border: "1px solid #93c5fd",
                }}
              >
                <div style={{ fontSize: 26, marginBottom: 6 }}>🔵</div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: C.blue,
                    marginBottom: 5,
                    fontFamily: GEO,
                  }}
                >
                  curr — The Worker
                </div>
                <div
                  style={{
                    fontSize: 13,
                    lineHeight: 1.65,
                    color: C.textMid,
                    fontFamily: GEO,
                  }}
                >
                  The node being processed RIGHT NOW. Its{" "}
                  <strong>.next gets flipped</strong> to point at prev instead
                  of forward.
                </div>
              </div>
              <div
                style={{
                  padding: "16px 18px",
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #fffbeb, #fef3c7)",
                  border: "1px solid #fcd34d",
                }}
              >
                <div style={{ fontSize: 26, marginBottom: 6 }}>🟡</div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: C.amber,
                    marginBottom: 5,
                    fontFamily: GEO,
                  }}
                >
                  next — The Lifeline
                </div>
                <div
                  style={{
                    fontSize: 13,
                    lineHeight: 1.65,
                    color: C.textMid,
                    fontFamily: GEO,
                  }}
                >
                  Saved BEFORE reversing curr's link. Without it, we'd lose the
                  rest of the list. It's the "bookmark" that lets us continue.
                </div>
              </div>
              <div
                style={{
                  padding: "16px 18px",
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #ecfdf5, #d1fae5)",
                  border: "1px solid #6ee7b7",
                }}
              >
                <div style={{ fontSize: 26, marginBottom: 6 }}>🔁</div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: C.em,
                    marginBottom: 5,
                    fontFamily: GEO,
                  }}
                >
                  The Loop — 4 Steps
                </div>
                <div
                  style={{
                    fontSize: 13,
                    lineHeight: 1.65,
                    color: C.textMid,
                    fontFamily: GEO,
                  }}
                >
                  <strong>1.</strong> next = curr.next
                  <br />
                  <strong>2.</strong> curr.next = prev
                  <br />
                  <strong>3.</strong> prev = curr
                  <br />
                  <strong>4.</strong> curr = next
                </div>
              </div>
            </div>
          </div>

          {/* Interview Tips */}
          <div style={{ ...Z.card, gridColumn: "1 / -1" }}>
            <div style={Z.label(C.mag)}>🎯 Interview Strategies</div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: 12,
              }}
            >
              {[
                {
                  q: '"Reverse a linked list" — the #1 warm-up',
                  a: "Write the iterative 3-pointer version first (O(1) space). If asked for recursive, mention O(n) stack space trade-off. Practice both until they're muscle memory.",
                },
                {
                  q: "Reverse sublist follow-up",
                  a: "Key insight: save 'connection' (node before range) and 'tail' (first node of range, becomes last). After reversing, stitch: connection.next → new_start, tail.next → node_after_range.",
                },
                {
                  q: "K-groups — the hard version",
                  a: "Count remaining nodes before each group. If < k, stop. Reverse k nodes, connect group to previous tail. The tricky part is maintaining prev_group_tail across iterations.",
                },
                {
                  q: "Common bugs to watch for",
                  a: "Forgetting to save next BEFORE reversing (loses list). Off-by-one on sublist boundaries. Not handling k > n for k-groups. Not reconnecting reversed segment back to the main list.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    padding: "13px 16px",
                    borderRadius: 10,
                    background:
                      i % 2 === 0
                        ? "linear-gradient(135deg, #f0f6ff, #eff6ff)"
                        : "linear-gradient(135deg, #fdf2f8, #fef5f0)",
                    border: `1px solid ${C.border}`,
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 800,
                      color: C.text,
                      marginBottom: 5,
                      fontFamily: GEO,
                    }}
                  >
                    {item.q}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      lineHeight: 1.65,
                      color: C.textMid,
                      fontFamily: GEO,
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
            color: C.textFade,
            fontWeight: 600,
            fontFamily: MONO,
          }}
        >
          in-place-reversal-visualizer // prev → curr → next // O(1) space
        </div>
      </div>
    </div>
  );
}
