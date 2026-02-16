import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════════════════════
   Recursion Technique — LinkedList Visualizer
   ─────────────────────────────────────────────────────────────────────────────
   Demonstrates recursion on linked lists with a VISUAL CALL STACK.
   Algorithms:
     1. Recursive Reverse
     2. Recursive Search
     3. Recursive Palindrome Check
     4. Recursive Remove by Value
   
   The call stack is the star — it grows during descent and shrinks during
   unwind, showing exactly how recursion works under the hood.
   
   Aesthetic: Blueprint / technical-drawing — navy, rose, gold on light cream.
   Self-contained React. No external dependencies.
   ═══════════════════════════════════════════════════════════════════════════════ */

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1: Palette & Constants
// ─────────────────────────────────────────────────────────────────────────────

const K = {
  bg: "linear-gradient(150deg, #faf8f5 0%, #f5f2ee 30%, #f0eef8 65%, #f8f5f0 100%)",
  card: "#ffffff",
  border: "#e4ddd4",
  shadow: "0 4px 24px rgba(40, 30, 60, 0.07), 0 1px 3px rgba(0,0,0,0.03)",

  navy: "#2b3a67",
  navyLt: "#4a6fa5",
  navyPale: "rgba(43,58,103,0.07)",
  rose: "#d64161",
  roseLt: "#e8758a",
  rosePale: "rgba(214,65,97,0.08)",
  gold: "#c49b2a",
  goldLt: "#e6c85e",
  goldPale: "rgba(196,155,42,0.08)",
  teal: "#1a936f",
  tealLt: "#4ecdc4",
  plum: "#7b2d8e",
  plumLt: "#b565d9",

  gDefault: "linear-gradient(135deg, #2b3a67 0%, #4a6fa5 100%)",
  gActive: "linear-gradient(135deg, #d64161 0%, #e8758a 100%)",
  gBase: "linear-gradient(135deg, #c49b2a 0%, #e6c85e 100%)",
  gDone: "linear-gradient(135deg, #1a936f 0%, #4ecdc4 100%)",
  gReturn: "linear-gradient(135deg, #7b2d8e 0%, #b565d9 100%)",
  gVisited: "linear-gradient(135deg, #c4bbb0 0%, #ddd6cc 100%)",
  gRemoved: "linear-gradient(135deg, #d64161 0%, #ff8fa3 100%)",
  gNull: "linear-gradient(135deg, #d5cfc7 0%, #e9e4dc 100%)",

  // Call stack frame colors — alternating for depth visual
  stackColors: [
    "#2b3a67",
    "#d64161",
    "#c49b2a",
    "#1a936f",
    "#7b2d8e",
    "#4a6fa5",
    "#e8758a",
    "#e6c85e",
  ],

  text: "#2b2520",
  textMid: "#5a524a",
  textFade: "#8a8279",
  white: "#ffffff",
};

const MONO = "'Consolas', 'SF Mono', 'Fira Code', 'Source Code Pro', monospace";
const DISP = "'Bodoni Moda', 'Didot', 'Playfair Display', Georgia, serif";
const SANS =
  "'Avenir', 'Gill Sans', 'Century Gothic', 'Trebuchet MS', sans-serif";

const ALGOS = [
  { id: "reverse", label: "Recursive Reverse", icon: "↻" },
  { id: "search", label: "Recursive Search", icon: "🔍" },
  { id: "palindrome", label: "Palindrome Check", icon: "⟐" },
  { id: "remove", label: "Recursive Remove", icon: "✕" },
];

const COMPLEXITY = {
  reverse: {
    time: "O(n)",
    space: "O(n)",
    note: "n stack frames — each recursive call adds one frame. This is the hidden cost of recursion vs iteration.",
  },
  search: {
    time: "O(n)",
    space: "O(n)",
    note: "Worst case traverses all n nodes. Stack depth = n. Iterative search uses O(1) space.",
  },
  palindrome: {
    time: "O(n)",
    space: "O(n)",
    note: "Recurse to end (n frames), then compare from outside-in during unwind. The left pointer advances via closure.",
  },
  remove: {
    time: "O(n)",
    space: "O(n)",
    note: "Each node gets a stack frame. Removal happens on return by skipping the target node.",
  },
};

const INTUITION = {
  reverse: `The key insight: assume the rest of the list is already reversed by the recursive call. Then you just need to make the next node point back to you, and set your own next to null. The base case is a single node or null — already "reversed."`,
  search: `Recursion decomposes the problem: "Is this node the target? No → search the rest." Each call handles one node and delegates the remainder. The base case is null (not found) or a match (found).`,
  palindrome: `The elegant trick: recurse to the end of the list. During the UNWIND phase, compare with a "left" pointer that starts at the head and advances after each comparison. Recursion naturally gives us right-to-left traversal during unwind!`,
  remove: `Instead of tracking a "prev" pointer, recursion handles it naturally: each call returns the correct next pointer. If current.val equals target, return current.next (skip it). Otherwise, set current.next = recurse(current.next), then return current.`,
};

const EDGES = {
  reverse: ["Empty list", "Single node", "Two nodes", "Already reversed"],
  search: [
    "Empty list",
    "Target at head",
    "Target at tail",
    "Target not found",
    "Multiple matches (finds first)",
  ],
  palindrome: [
    "Empty list",
    "Single node (palindrome)",
    "Even length",
    "Odd length",
    "Not a palindrome",
  ],
  remove: [
    "Empty list",
    "Remove head",
    "Remove tail",
    "Remove all (consecutive)",
    "Value not found",
    "Multiple occurrences",
  ],
};

const KEYFRAMES = `
@keyframes stackSlideIn { from { opacity: 0; transform: translateX(-20px) scaleY(0.8); } to { opacity: 1; transform: translateX(0) scaleY(1); } }
@keyframes stackSlideOut { from { opacity: 1; transform: scaleY(1); } to { opacity: 0; transform: scaleY(0.5); } }
@keyframes pulseGlow { 0%,100% { box-shadow: 0 0 0 0 rgba(214,65,97,0.3); } 50% { box-shadow: 0 0 0 8px rgba(214,65,97,0); } }
@keyframes fadeSlide { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
@keyframes depthPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.03); } }
`;

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2: Styles
// ─────────────────────────────────────────────────────────────────────────────

const S = {
  page: {
    minHeight: "100vh",
    background: K.bg,
    fontFamily: SANS,
    color: K.text,
    padding: "20px 16px 56px",
    boxSizing: "border-box",
  },
  wrap: { maxWidth: 1260, margin: "0 auto" },

  header: { textAlign: "center", marginBottom: 20 },
  title: {
    fontSize: 32,
    fontWeight: 900,
    margin: 0,
    fontFamily: DISP,
    background: "linear-gradient(135deg, #2b3a67, #d64161, #c49b2a)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    letterSpacing: "0.5px",
  },
  sub: {
    fontSize: 14,
    color: K.textFade,
    marginTop: 3,
    fontFamily: MONO,
    fontWeight: 500,
    letterSpacing: "0.3px",
  },

  card: {
    background: K.card,
    borderRadius: 14,
    boxShadow: K.shadow,
    padding: "18px 22px",
    marginBottom: 16,
    border: `1px solid ${K.border}`,
  },
  label: (c) => ({
    fontSize: 11,
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "1.2px",
    marginBottom: 12,
    color: c,
    fontFamily: MONO,
  }),
  row: { display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" },

  pill: (on) => ({
    padding: "8px 16px",
    borderRadius: 9,
    border: on ? `2px solid ${K.navy}` : "2px solid #d5cfc7",
    background: on ? K.navyPale : "#fff",
    color: on ? K.navy : K.textMid,
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s",
    fontFamily: SANS,
    whiteSpace: "nowrap",
  }),

  input: {
    padding: "9px 14px",
    borderRadius: 9,
    border: "2px solid #d5cfc7",
    fontSize: 13,
    outline: "none",
    fontWeight: 600,
    fontFamily: MONO,
    transition: "border-color 0.2s",
  },

  btn: (bg, fg = "#fff") => ({
    padding: "9px 20px",
    borderRadius: 9,
    border: "none",
    fontSize: 13,
    fontWeight: 700,
    color: fg,
    background: bg,
    cursor: "pointer",
    transition: "transform 0.12s, box-shadow 0.15s",
    boxShadow: `0 3px 14px ${bg}33`,
    fontFamily: SANS,
    whiteSpace: "nowrap",
  }),
  btnOff: { opacity: 0.4, pointerEvents: "none" },

  slider: { width: 90, accentColor: K.rose, cursor: "pointer" },
  sliderLbl: {
    fontSize: 11,
    fontWeight: 700,
    color: K.textFade,
    fontFamily: MONO,
  },

  // ── Visualization ──
  vizSplit: {
    display: "grid",
    gridTemplateColumns: "1fr 320px",
    gap: 18,
    alignItems: "start",
  },
  vizSplitMobile: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 14,
  },
  vizScroll: { overflowX: "auto", padding: "20px 6px 12px", minHeight: 100 },
  vizRow: { display: "flex", alignItems: "center", minWidth: "fit-content" },

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
    fontFamily: MONO,
    transition: "transform 0.4s cubic-bezier(.34,1.56,.64,1), box-shadow 0.35s",
    transform: `scale(${sc})`,
    boxShadow: ring
      ? `0 0 0 4px ${K.rose}44, 0 5px 18px rgba(0,0,0,0.14)`
      : "0 3px 12px rgba(0,0,0,0.09)",
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
    ...(pos === "top" ? { top: -21 } : { bottom: -21 }),
    left: "50%",
    transform: "translateX(-50%)",
    padding: "2px 8px",
    borderRadius: 6,
    fontSize: 9,
    fontWeight: 800,
    background: bg,
    color: "#fff",
    whiteSpace: "nowrap",
    letterSpacing: "0.5px",
    fontFamily: MONO,
    boxShadow: `0 2px 8px ${bg}44`,
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
    background: K.gNull,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#8a8279",
    fontSize: 10,
    fontWeight: 800,
    flexShrink: 0,
    fontFamily: MONO,
  },

  // ── Call Stack ──
  stackWrap: {
    background: "linear-gradient(180deg, #faf8f5 0%, #f0eef8 100%)",
    border: `2px solid ${K.border}`,
    borderRadius: 12,
    padding: "14px 16px",
    minHeight: 120,
    maxHeight: 450,
    overflowY: "auto",
  },
  stackTitle: {
    fontSize: 11,
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "1.2px",
    color: K.navy,
    fontFamily: MONO,
    marginBottom: 10,
    textAlign: "center",
  },
  stackFrame: (color, isActive, isUnwinding) => ({
    padding: "8px 12px",
    borderRadius: 8,
    background: isActive
      ? `linear-gradient(135deg, ${color}18, ${color}10)`
      : isUnwinding
        ? `linear-gradient(135deg, ${color}0d, ${color}06)`
        : "#faf8f5",
    border: `2px solid ${isActive ? color : isUnwinding ? color + "66" : "#e4ddd4"}`,
    marginBottom: 6,
    fontFamily: MONO,
    fontSize: 12,
    transition: "all 0.3s",
    animation: "stackSlideIn 0.35s ease",
    ...(isActive
      ? { boxShadow: `0 0 0 3px ${color}22, 0 3px 12px ${color}18` }
      : {}),
  }),
  stackFn: (color) => ({
    fontWeight: 800,
    color,
    fontSize: 11,
    letterSpacing: "0.3px",
  }),
  stackArg: { color: K.textMid, fontSize: 11, marginTop: 2 },
  stackRet: (color) => ({ color, fontWeight: 800, fontSize: 11, marginTop: 3 }),
  stackDepthBadge: (color) => ({
    display: "inline-block",
    padding: "1px 7px",
    borderRadius: 5,
    background: color,
    color: "#fff",
    fontSize: 9,
    fontWeight: 800,
    marginRight: 6,
    fontFamily: MONO,
  }),

  // ── Explanation ──
  expl: {
    padding: "14px 18px",
    borderRadius: 11,
    background: "linear-gradient(135deg, #faf8f5, #f0eef8)",
    border: `1px solid ${K.border}`,
    fontSize: 14,
    lineHeight: 1.75,
    color: K.text,
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
    fontFamily: MONO,
    letterSpacing: "0.4px",
  }),

  legend: { display: "flex", flexWrap: "wrap", gap: 12, marginTop: 8 },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 11,
    fontWeight: 600,
    color: K.textFade,
    fontFamily: SANS,
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
    fontFamily: SANS,
  },
  th: {
    textAlign: "left",
    padding: "8px 12px",
    background: K.navyPale,
    color: K.navy,
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: "0.6px",
    textTransform: "uppercase",
  },
  td: { padding: "8px 12px", borderBottom: "1px solid #e9e4dc", color: K.text },

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
    fontFamily: MONO,
    letterSpacing: "0.3px",
  }),
  empty: {
    textAlign: "center",
    padding: "32px 0",
    color: K.textFade,
    fontSize: 14,
    fontWeight: 600,
    fontFamily: SANS,
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
const mkNodes = (vals) => vals.map((v, i) => ({ id: uid(), val: v, idx: i }));
const randArr = (lo, hi, len) =>
  Array.from(
    { length: len },
    () => lo + Math.floor(Math.random() * (hi - lo + 1)),
  );

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 4: Step Generators
// ─────────────────────────────────────────────────────────────────────────────

/*
  Each step:
  {
    nodes: [{id, val, idx}],           — current list state
    highlights: { [idx]: type },       — node highlighting
    callStack: [{ depth, fnName, args, returnVal, state }],
    explanation: string,
    phase: "descend" | "base" | "unwind" | "done",
    done: boolean,
  }
  
  state can be: "active" | "waiting" | "returning" | "popped"
*/

// ── 4a: Recursive Reverse ──
function* genReverse(vals) {
  const nodes = mkNodes(vals);
  const n = nodes.length;

  yield {
    nodes,
    highlights: {},
    callStack: [],
    explanation: `Recursive Reverse: We'll recurse to the end of the list, then rewire pointers on the way back up (unwind). Each stack frame handles one node.`,
    phase: "setup",
    done: false,
  };

  if (n === 0) {
    yield {
      nodes,
      highlights: {},
      callStack: [],
      explanation: `✅ Empty list is already reversed. Return null.`,
      phase: "done",
      done: true,
    };
    return;
  }
  if (n === 1) {
    yield {
      nodes,
      highlights: { 0: "done" },
      callStack: [
        {
          depth: 0,
          fnName: "reverse",
          args: `node=${nodes[0].val}`,
          returnVal: `${nodes[0].val}`,
          state: "returning",
        },
      ],
      explanation: `✅ Single node — base case. Already reversed.`,
      phase: "done",
      done: true,
    };
    return;
  }

  // ── Descent phase: push stack frames ──
  const stack = [];
  for (let i = 0; i < n; i++) {
    stack.push({
      depth: i,
      fnName: "reverse",
      args: `node=${nodes[i].val}`,
      returnVal: null,
      state: "active",
    });

    // Mark previous frames as waiting
    const stackSnap = stack.map((f, fi) => ({
      ...f,
      state: fi === stack.length - 1 ? "active" : "waiting",
    }));

    const hl = {};
    for (let j = 0; j <= i; j++) hl[j] = j === i ? "active" : "visited";

    const isLast = i === n - 1;

    yield {
      nodes,
      highlights: hl,
      callStack: stackSnap,
      explanation: isLast
        ? `DESCENT depth ${i}: reverse(${nodes[i].val}). node.next is null — BASE CASE reached! This node becomes the new head. Start unwinding.`
        : `DESCENT depth ${i}: reverse(${nodes[i].val}). Not null and has next → recurse on node.next (${nodes[i + 1].val}).`,
      phase: isLast ? "base" : "descend",
      done: false,
    };
  }

  // ── Unwind phase: pop stack frames, rewire ──
  const reversed = [...nodes].reverse();

  for (let i = n - 1; i >= 0; i--) {
    // Mark returning
    stack[i].state = "returning";
    if (i === n - 1) {
      stack[i].returnVal = `newHead=${nodes[i].val}`;
    } else {
      stack[i].returnVal =
        `${nodes[i + 1].val}.next → ${nodes[i].val}; ${nodes[i].val}.next → null`;
    }

    const stackSnap = stack
      .filter((f) => f.state !== "popped")
      .map((f, fi) => ({ ...f }));

    // Build visual: show partially reversed state
    const hl = {};
    // Nodes from i+1 to n-1 are "done" (reversed part)
    for (let j = n - 1; j > i; j--) hl[j] = "done";
    // Current node being processed
    hl[i] = "return";
    // Remaining nodes below
    for (let j = 0; j < i; j++) hl[j] = "visited";

    yield {
      nodes,
      highlights: hl,
      callStack: stackSnap,
      explanation:
        i === n - 1
          ? `UNWIND depth ${i}: Base case returns. Node ${nodes[i].val} is the new head of reversed list.`
          : `UNWIND depth ${i}: Set ${nodes[i + 1].val}.next → ${nodes[i].val} (reverse the pointer). Set ${nodes[i].val}.next → null (break old link). Return newHead up.`,
      phase: "unwind",
      done: false,
    };

    stack[i].state = "popped";
  }

  // Final result
  const resultHL = {};
  for (let i = 0; i < n; i++) resultHL[i] = "done";
  yield {
    nodes: reversed,
    highlights: resultHL,
    callStack: [],
    explanation: `✅ Reverse complete! All stack frames popped. Result: [${reversed.map((nd) => nd.val).join(" → ")}]. Used ${n} stack frames (O(n) space).`,
    phase: "done",
    done: true,
  };
}

// ── 4b: Recursive Search ──
function* genSearch(vals, target) {
  const nodes = mkNodes(vals);
  const n = nodes.length;

  yield {
    nodes,
    highlights: {},
    callStack: [],
    explanation: `Recursive Search for value ${target}. Each call checks one node and delegates to the rest.`,
    phase: "setup",
    done: false,
  };

  const stack = [];
  let foundIdx = -1;

  for (let i = 0; i < n; i++) {
    const found = nodes[i].val === target;
    stack.push({
      depth: i,
      fnName: "search",
      args: `node=${nodes[i].val}, target=${target}`,
      returnVal: null,
      state: "active",
    });

    const stackSnap = stack.map((f, fi) => ({
      ...f,
      state: fi === stack.length - 1 ? "active" : "waiting",
    }));

    const hl = {};
    for (let j = 0; j < i; j++) hl[j] = "visited";
    hl[i] = found ? "done" : "active";

    yield {
      nodes,
      highlights: hl,
      callStack: stackSnap,
      explanation: found
        ? `DESCENT depth ${i}: node.val = ${nodes[i].val} == ${target}. FOUND! Base case — return true. Begin unwinding.`
        : `DESCENT depth ${i}: node.val = ${nodes[i].val} ≠ ${target}. Recurse on next${i + 1 < n ? ` (${nodes[i + 1].val})` : " (null)"}.`,
      phase: found ? "base" : "descend",
      done: false,
    };

    if (found) {
      foundIdx = i;
      break;
    }
  }

  // Not found — hit null
  if (foundIdx === -1) {
    stack.push({
      depth: n,
      fnName: "search",
      args: `node=null, target=${target}`,
      returnVal: "false (null)",
      state: "active",
    });
    yield {
      nodes,
      highlights: Object.fromEntries(nodes.map((_, i) => [i, "visited"])),
      callStack: stack.map((f) => ({ ...f })),
      explanation: `DESCENT depth ${n}: node is null — BASE CASE. Value ${target} not found. Return false. Begin unwinding.`,
      phase: "base",
      done: false,
    };
    stack[stack.length - 1].state = "popped";
  }

  // Unwind
  const result = foundIdx >= 0;
  for (let i = stack.length - 1; i >= 0; i--) {
    if (stack[i].state === "popped") continue;
    stack[i].state = "returning";
    stack[i].returnVal = result ? "true ↑" : "false ↑";

    const activeStack = stack.filter((f) => f.state !== "popped");
    const hl = {};
    for (let j = 0; j < nodes.length; j++) {
      if (j === foundIdx) hl[j] = "done";
      else if (j === i) hl[j] = "return";
      else hl[j] = "visited";
    }

    yield {
      nodes,
      highlights: hl,
      callStack: activeStack,
      explanation: `UNWIND depth ${i}: Passing result ${result ? "true" : "false"} back to caller.`,
      phase: "unwind",
      done: false,
    };
    stack[i].state = "popped";
  }

  const finalHL = {};
  for (let i = 0; i < n; i++) finalHL[i] = i === foundIdx ? "done" : "visited";
  yield {
    nodes,
    highlights: finalHL,
    callStack: [],
    explanation: result
      ? `✅ Search complete! Value ${target} found at index ${foundIdx}. All ${stack.length} frames popped.`
      : `❌ Search complete! Value ${target} not found. Traversed all ${n} nodes + 1 null base case.`,
    phase: "done",
    done: true,
  };
}

// ── 4c: Recursive Palindrome Check ──
function* genPalindrome(vals) {
  const nodes = mkNodes(vals);
  const n = nodes.length;

  yield {
    nodes,
    highlights: {},
    callStack: [],
    explanation: `Palindrome Check: Recurse to the end (descent), then compare with a "left" pointer advancing from head during unwind. If all pairs match, it's a palindrome!`,
    phase: "setup",
    done: false,
  };

  if (n <= 1) {
    yield {
      nodes,
      highlights: n === 1 ? { 0: "done" } : {},
      callStack: [],
      explanation: `✅ ${n === 0 ? "Empty" : "Single node"} list is always a palindrome.`,
      phase: "done",
      done: true,
    };
    return;
  }

  // Descent
  const stack = [];
  for (let i = 0; i < n; i++) {
    stack.push({
      depth: i,
      fnName: "check",
      args: `right=${nodes[i].val}`,
      returnVal: null,
      state: "active",
    });

    const stackSnap = stack.map((f, fi) => ({
      ...f,
      state: fi === stack.length - 1 ? "active" : "waiting",
    }));
    const hl = {};
    for (let j = 0; j <= i; j++) hl[j] = j === i ? "active" : "visited";
    const isEnd = i === n - 1;

    yield {
      nodes,
      highlights: hl,
      callStack: stackSnap,
      explanation: isEnd
        ? `DESCENT depth ${i}: right=${nodes[i].val}, next is null — BASE CASE. Start unwinding with left pointer at index 0 (value ${nodes[0].val}).`
        : `DESCENT depth ${i}: right=${nodes[i].val}. Recurse deeper to reach the end.`,
      phase: isEnd ? "base" : "descend",
      done: false,
    };
  }

  // Unwind: compare left[leftIdx] with right[i] as we pop
  let leftIdx = 0;
  let isPalin = true;

  for (let i = n - 1; i >= 0; i--) {
    const leftVal = nodes[leftIdx].val;
    const rightVal = nodes[i].val;
    const match = leftVal === rightVal;

    stack[i].state = "returning";
    stack[i].returnVal = match
      ? `${leftVal}==${rightVal} ✓`
      : `${leftVal}≠${rightVal} ✗`;

    const activeStack = stack.filter((f) => f.state !== "popped");
    const hl = {};
    hl[leftIdx] = match ? "done" : "removed";
    hl[i] = match ? "done" : "removed";
    for (let j = 0; j < n; j++) {
      if (j !== leftIdx && j !== i) {
        if (j < leftIdx || j > i) hl[j] = "done";
        else hl[j] = "visited";
      }
    }

    yield {
      nodes,
      highlights: hl,
      callStack: activeStack,
      explanation: match
        ? `UNWIND depth ${i}: Compare left[${leftIdx}]=${leftVal} with right[${i}]=${rightVal} — MATCH ✓. Advance left pointer.`
        : `UNWIND depth ${i}: Compare left[${leftIdx}]=${leftVal} with right[${i}]=${rightVal} — MISMATCH ✗! Not a palindrome.`,
      phase: "unwind",
      done: false,
    };

    if (!match) isPalin = false;
    stack[i].state = "popped";
    leftIdx++;

    // Optimization: stop early if mismatch or past middle
    if (!isPalin || leftIdx > i) break;
  }

  const finalHL = {};
  for (let i = 0; i < n; i++) finalHL[i] = isPalin ? "done" : "visited";
  yield {
    nodes,
    highlights: finalHL,
    callStack: [],
    explanation: isPalin
      ? `✅ Palindrome confirmed! [${vals.join(", ")}] reads the same forwards and backwards.`
      : `❌ Not a palindrome. [${vals.join(", ")}] has mismatched pairs.`,
    phase: "done",
    done: true,
  };
}

// ── 4d: Recursive Remove ──
function* genRemove(vals, target) {
  const nodes = mkNodes(vals);
  const n = nodes.length;

  yield {
    nodes: [...nodes],
    highlights: {},
    callStack: [],
    explanation: `Recursive Remove: Remove ALL nodes with value ${target}. Each call returns the correct "next" pointer — if current matches, return next (skip); otherwise return current.`,
    phase: "setup",
    done: false,
  };

  // Descent
  const stack = [];
  for (let i = 0; i < n; i++) {
    const isTarget = nodes[i].val === target;
    stack.push({
      depth: i,
      fnName: "remove",
      args: `node=${nodes[i].val}, t=${target}`,
      returnVal: null,
      state: "active",
    });

    const stackSnap = stack.map((f, fi) => ({
      ...f,
      state: fi === stack.length - 1 ? "active" : "waiting",
    }));
    const hl = {};
    for (let j = 0; j < i; j++) hl[j] = "visited";
    hl[i] = "active";

    yield {
      nodes: [...nodes],
      highlights: hl,
      callStack: stackSnap,
      explanation: `DESCENT depth ${i}: node=${nodes[i].val}. ${i < n - 1 ? `First recurse on next (${nodes[i + 1].val}) to process the rest.` : `Next is null — deepest call. Process this node on return.`}`,
      phase: "descend",
      done: false,
    };
  }

  // Null base case
  stack.push({
    depth: n,
    fnName: "remove",
    args: `node=null`,
    returnVal: "null",
    state: "active",
  });
  yield {
    nodes: [...nodes],
    highlights: Object.fromEntries(nodes.map((_, i) => [i, "visited"])),
    callStack: stack.map((f) => ({ ...f })),
    explanation: `DESCENT depth ${n}: node=null — BASE CASE. Return null. Begin unwinding.`,
    phase: "base",
    done: false,
  };
  stack[stack.length - 1].state = "popped";

  // Unwind: decide keep or remove
  const kept = [];
  const removedIdxs = new Set();

  for (let i = n - 1; i >= 0; i--) {
    const isTarget = nodes[i].val === target;
    stack[i].state = "returning";
    stack[i].returnVal = isTarget
      ? `SKIP ${nodes[i].val} → return next`
      : `KEEP ${nodes[i].val} → return self`;

    const activeStack = stack.filter((f) => f.state !== "popped");
    const hl = {};
    for (let j = 0; j < n; j++) {
      if (j === i) hl[j] = isTarget ? "removed" : "return";
      else if (j > i) hl[j] = removedIdxs.has(j) ? "removed" : "done";
      else hl[j] = "visited";
    }

    yield {
      nodes: [...nodes],
      highlights: hl,
      callStack: activeStack,
      explanation: isTarget
        ? `UNWIND depth ${i}: node.val=${nodes[i].val} == ${target} → REMOVE! Return node.next (skip this node).`
        : `UNWIND depth ${i}: node.val=${nodes[i].val} ≠ ${target} → KEEP. Set node.next = recursive result. Return this node.`,
      phase: "unwind",
      done: false,
    };

    if (isTarget) removedIdxs.add(i);
    else kept.unshift(nodes[i]);
    stack[i].state = "popped";
  }

  const finalHL = {};
  kept.forEach((_, i) => {
    finalHL[i] = "done";
  });

  yield {
    nodes: kept,
    highlights: finalHL,
    callStack: [],
    explanation: `✅ Removal complete! Removed ${removedIdxs.size} node(s) with value ${target}. Result: [${kept.length ? kept.map((nd) => nd.val).join(" → ") : "empty"}]. Used ${n + 1} stack frames.`,
    phase: "done",
    done: true,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 5: Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function LinkedListRecursionVisualizer() {
  useEffect(() => {
    const id = "rec-kf";
    if (!document.getElementById(id)) {
      const s = document.createElement("style");
      s.id = id;
      s.textContent = KEYFRAMES;
      document.head.appendChild(s);
    }
  }, []);

  const [algo, setAlgo] = useState("reverse");
  const [inputStr, setInputStr] = useState("1, 3, 5, 3, 1");
  const [targetStr, setTargetStr] = useState("3");
  const [speed, setSpeed] = useState(800);
  const [steps, setSteps] = useState([]);
  const [stepIdx, setStepIdx] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [running, setRunning] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const playRef = useRef(false);
  const step = stepIdx >= 0 && stepIdx < steps.length ? steps[stepIdx] : null;

  const needsTarget = algo === "search" || algo === "remove";

  // Responsive check
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 800);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    switch (algo) {
      case "reverse":
        setInputStr("4, 8, 15, 16, 23");
        break;
      case "search":
        setInputStr("7, 14, 21, 28, 35");
        setTargetStr("21");
        break;
      case "palindrome":
        setInputStr("1, 3, 5, 3, 1");
        break;
      case "remove":
        setInputStr("1, 2, 6, 3, 4, 5, 6");
        setTargetStr("6");
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
      const t = parseInt(targetStr, 10) || 0;
      let gen;
      switch (algo) {
        case "reverse":
          gen = genReverse(vals);
          break;
        case "search":
          gen = genSearch(vals, t);
          break;
        case "palindrome":
          gen = genPalindrome(vals);
          break;
        case "remove":
          gen = genRemove(vals, t);
          break;
        default:
          return;
      }
      const all = [...gen];
      setSteps(all);
      setStepIdx(0);
      setRunning(true);
    }, 60);
  }, [algo, inputStr, targetStr, resetViz]);

  const randomize = () => {
    switch (algo) {
      case "reverse":
        setInputStr(
          randArr(1, 50, 5 + Math.floor(Math.random() * 3)).join(", "),
        );
        break;
      case "search": {
        const arr = randArr(1, 30, 6);
        setInputStr(arr.join(", "));
        setTargetStr(String(arr[Math.floor(Math.random() * arr.length)]));
        break;
      }
      case "palindrome": {
        const half = randArr(1, 9, 2 + Math.floor(Math.random() * 2));
        const isPalin = Math.random() > 0.3;
        if (isPalin) {
          const full = [
            ...half,
            half[Math.floor(Math.random() * half.length)],
            ...[...half].reverse(),
          ];
          setInputStr(full.join(", "));
        } else {
          setInputStr(randArr(1, 9, 5).join(", "));
        }
        break;
      }
      case "remove": {
        const arr = randArr(1, 8, 7);
        setInputStr(arr.join(", "));
        setTargetStr(String(arr[Math.floor(Math.random() * arr.length)]));
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

  // ── Rendering helpers ──
  const gradFor = (type) => {
    switch (type) {
      case "active":
        return K.gActive;
      case "done":
        return K.gDone;
      case "return":
        return K.gReturn;
      case "removed":
        return K.gRemoved;
      case "visited":
        return K.gVisited;
      default:
        return K.gDefault;
    }
  };
  const scaleFor = (t) =>
    t === "active" || t === "return" || t === "removed"
      ? 1.1
      : t === "done"
        ? 1.04
        : t === "visited"
          ? 0.92
          : 1;
  const ringFor = (t) =>
    t === "active" || t === "return" || t === "removed" || t === "done";

  const cx = COMPLEXITY[algo];
  const isDone = step?.done;

  const phaseColor = (p) => {
    if (p === "descend") return K.navy;
    if (p === "base") return K.gold;
    if (p === "unwind") return K.plum;
    if (p === "done") return K.teal;
    return K.textFade;
  };

  const phaseLabel = (p) => {
    if (p === "descend") return "📥 DESCENDING";
    if (p === "base") return "🎯 BASE CASE";
    if (p === "unwind") return "📤 UNWINDING";
    if (p === "done") return "✅ COMPLETE";
    if (p === "setup") return "⚙️ SETUP";
    return p;
  };

  // ── Call stack renderer ──
  const renderStack = () => {
    const frames = step?.callStack || [];
    return (
      <div style={S.stackWrap}>
        <div style={S.stackTitle}>
          📚 Call Stack{" "}
          {frames.length > 0 &&
            `(${frames.length} frame${frames.length > 1 ? "s" : ""})`}
        </div>
        {frames.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              color: K.textFade,
              fontSize: 12,
              padding: "16px 0",
              fontFamily: MONO,
            }}
          >
            {step?.done ? "All frames popped ✓" : "Stack is empty"}
          </div>
        ) : (
          // Render from bottom to top (deepest = most recently pushed)
          [...frames].reverse().map((frame, vi) => {
            const color = K.stackColors[frame.depth % K.stackColors.length];
            const isTop = vi === 0;
            const isUnwinding = frame.state === "returning";
            return (
              <div
                key={`${frame.depth}-${frame.fnName}-${vi}`}
                style={S.stackFrame(color, isTop, isUnwinding)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={S.stackDepthBadge(color)}>D{frame.depth}</span>
                  <span style={S.stackFn(color)}>{frame.fnName}()</span>
                  {isTop && (
                    <span
                      style={{ fontSize: 9, color: K.rose, fontWeight: 800 }}
                    >
                      ← TOP
                    </span>
                  )}
                </div>
                <div style={S.stackArg}>{frame.args}</div>
                {frame.returnVal && (
                  <div style={S.stackRet(isUnwinding ? K.plum : K.teal)}>
                    ↩ {frame.returnVal}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    );
  };

  // ── Node list renderer ──
  const renderNodes = () => {
    const nodes =
      step?.nodes || parse(inputStr).map((v, i) => ({ id: i, val: v, idx: i }));
    const highlights = step?.highlights || {};

    if (nodes.length === 0) {
      return <div style={S.empty}>∅ Empty list</div>;
    }

    return (
      <div style={S.vizRow}>
        {nodes.map((nd, i) => {
          const hl = highlights[i];
          const grad = gradFor(hl);
          const sc = scaleFor(hl);
          const ring = ringFor(hl);
          const arrowColor =
            hl === "done"
              ? K.teal
              : hl === "active"
                ? K.rose
                : hl === "return"
                  ? K.plum
                  : hl === "removed"
                    ? K.rose
                    : "#c4bbb0";

          return (
            <div
              key={`${nd.id}-${i}`}
              style={{ display: "flex", alignItems: "center" }}
            >
              <div style={{ position: "relative" }}>
                {i === 0 && <div style={S.badge(K.navy, "top")}>HEAD</div>}
                {hl === "removed" && (
                  <div style={S.badge(K.rose, "bottom")}>SKIP</div>
                )}
                {hl === "return" && (
                  <div style={S.badge(K.plum, "bottom")}>RETURN</div>
                )}
                <div style={S.node(grad, sc, ring)}>
                  <span>{nd.val}</span>
                  <span style={S.nodeIdx}>idx {i}</span>
                </div>
              </div>
              {i < nodes.length - 1 && (
                <div style={S.arrow(arrowColor)}>
                  <div style={S.arrowTip(arrowColor)} />
                </div>
              )}
            </div>
          );
        })}
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={S.arrow("#c4bbb0")}>
            <div style={S.arrowTip("#c4bbb0")} />
          </div>
          <div style={S.nullBox}>NULL</div>
        </div>
      </div>
    );
  };

  return (
    <div style={S.page}>
      <div style={S.wrap}>
        {/* ═══ HEADER ═══ */}
        <div style={S.header}>
          <h1 style={S.title}>🔄 Recursion on Linked Lists</h1>
          <p style={S.sub}>{"// visualize the call stack, descent & unwind"}</p>
        </div>

        {/* ═══ ALGORITHM SELECTOR ═══ */}
        <div style={S.card}>
          <div style={S.label(K.navy)}>{">"} Select Algorithm</div>
          <div style={S.row}>
            {ALGOS.map((a) => (
              <button
                key={a.id}
                style={S.pill(algo === a.id)}
                onClick={() => setAlgo(a.id)}
              >
                {a.icon} {a.label}
              </button>
            ))}
          </div>
        </div>

        {/* ═══ CONTROLS ═══ */}
        <div style={S.card}>
          <div style={S.label(K.rose)}>{">"} Controls</div>
          <div style={S.row}>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <label
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: K.textFade,
                  fontFamily: MONO,
                }}
              >
                node values
              </label>
              <input
                style={{ ...S.input, width: 200 }}
                value={inputStr}
                onChange={(e) => {
                  setInputStr(e.target.value);
                  resetViz();
                }}
              />
            </div>

            {needsTarget && (
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <label
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: K.textFade,
                    fontFamily: MONO,
                  }}
                >
                  target
                </label>
                <input
                  style={{ ...S.input, width: 60, textAlign: "center" }}
                  value={targetStr}
                  onChange={(e) => {
                    setTargetStr(e.target.value);
                    resetViz();
                  }}
                  type="number"
                />
              </div>
            )}

            <button style={S.btn(K.navy)} onClick={execute} disabled={playing}>
              ▶ Execute
            </button>
            <button style={S.btn("#5a524a")} onClick={randomize}>
              🎲 Random
            </button>
            <button style={S.btn(K.rose)} onClick={resetViz}>
              ↻ Reset
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={S.sliderLbl}>slow</span>
              <input
                style={S.slider}
                type="range"
                min={100}
                max={1500}
                step={50}
                value={1600 - speed}
                onChange={(e) => setSpeed(1600 - +e.target.value)}
              />
              <span style={S.sliderLbl}>fast</span>
              <span style={{ ...S.sliderLbl, minWidth: 46 }}>{speed}ms</span>
            </div>
          </div>

          {running && (
            <div style={{ ...S.row, marginTop: 12 }}>
              <button
                style={{
                  ...S.btn(K.navyLt),
                  ...(stepIdx <= 0 || playing ? S.btnOff : {}),
                }}
                onClick={stepBack}
              >
                ◀ Prev
              </button>
              <button
                style={S.btn(
                  playing ? K.gold : K.teal,
                  playing ? "#2b2520" : "#fff",
                )}
                onClick={togglePlay}
              >
                {playing ? "⏸ Pause" : "⏵ Auto"}
              </button>
              <button
                style={{
                  ...S.btn(K.navyLt),
                  ...(stepIdx >= steps.length - 1 || playing ? S.btnOff : {}),
                }}
                onClick={stepFwd}
              >
                Next ▶
              </button>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: K.textFade,
                  fontFamily: MONO,
                }}
              >
                {stepIdx + 1}/{steps.length}
              </span>
              {step?.phase && (
                <span style={S.phase(phaseColor(step.phase))}>
                  {phaseLabel(step.phase)}
                </span>
              )}
            </div>
          )}
        </div>

        {/* ═══ VISUALIZATION — Split: List + Call Stack ═══ */}
        <div style={isMobile ? S.vizSplitMobile : S.vizSplit}>
          {/* Left: Linked List */}
          <div style={S.card}>
            <div style={S.label(K.teal)}>{">"} Linked List</div>
            <div style={S.vizScroll}>{renderNodes()}</div>
            <div style={S.legend}>
              <div style={S.legendItem}>
                <div style={S.legendDot(K.gDefault)} /> Default
              </div>
              <div style={S.legendItem}>
                <div style={S.legendDot(K.gActive)} /> Active (Descending)
              </div>
              <div style={S.legendItem}>
                <div style={S.legendDot(K.gReturn)} /> Returning (Unwinding)
              </div>
              <div style={S.legendItem}>
                <div style={S.legendDot(K.gDone)} /> Processed / Match
              </div>
              <div style={S.legendItem}>
                <div style={S.legendDot(K.gRemoved)} /> Removed / Mismatch
              </div>
              <div style={S.legendItem}>
                <div style={S.legendDot(K.gVisited)} /> Visited
              </div>
            </div>
          </div>

          {/* Right: Call Stack */}
          <div style={S.card}>
            <div style={S.label(K.plum)}>{">"} Call Stack</div>
            {renderStack()}
          </div>
        </div>

        {/* ═══ EXPLANATION ═══ */}
        <div style={S.card}>
          <div style={S.label(K.gold)}>{">"} Step Explanation</div>
          <div style={S.expl}>
            {step ? (
              <div style={{ animation: "fadeSlide 0.25s ease" }} key={stepIdx}>
                <span style={S.tag(phaseColor(step.phase))}>
                  STEP {stepIdx + 1}
                </span>
                {step.explanation}
              </div>
            ) : (
              <span style={{ color: K.textFade, fontFamily: MONO }}>
                {"// select an algorithm and press Execute"}
              </span>
            )}
          </div>
        </div>

        {/* ═══ EDUCATIONAL PANELS ═══ */}
        <div style={S.eduGrid}>
          {/* Intuition */}
          <div style={S.card}>
            <div style={S.label(K.navy)}>💡 Intuition</div>
            <p
              style={{
                fontSize: 14,
                lineHeight: 1.75,
                margin: 0,
                fontFamily: SANS,
                color: K.textMid,
              }}
            >
              {INTUITION[algo]}
            </p>
          </div>

          {/* Complexity */}
          <div style={S.card}>
            <div style={S.label(K.rose)}>⏱ Complexity</div>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.th}>Metric</th>
                  <th style={S.th}>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ ...S.td, fontWeight: 700 }}>Time</td>
                  <td style={S.td}>
                    <span style={S.tag(K.navy)}>{cx.time}</span>
                  </td>
                </tr>
                <tr>
                  <td style={{ ...S.td, fontWeight: 700 }}>Space</td>
                  <td style={S.td}>
                    <span style={S.tag(K.rose)}>{cx.space}</span>
                  </td>
                </tr>
                <tr>
                  <td
                    style={{ ...S.td, fontWeight: 700, borderBottom: "none" }}
                  >
                    Note
                  </td>
                  <td style={{ ...S.td, borderBottom: "none" }}>{cx.note}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Edge Cases */}
          <div style={S.card}>
            <div style={S.label(K.gold)}>⚠️ Edge Cases</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {EDGES[algo].map((e, i) => (
                <span key={i} style={S.tag("#5a524a")}>
                  {e}
                </span>
              ))}
            </div>
          </div>

          {/* Reference Table */}
          <div style={S.card}>
            <div style={S.label(K.teal)}>📊 All Algorithms</div>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.th}>Algorithm</th>
                  <th style={S.th}>Time</th>
                  <th style={S.th}>Space</th>
                </tr>
              </thead>
              <tbody>
                {ALGOS.map((a) => (
                  <tr
                    key={a.id}
                    style={a.id === algo ? { background: K.navyPale } : {}}
                  >
                    <td
                      style={{ ...S.td, fontWeight: a.id === algo ? 800 : 500 }}
                    >
                      {a.icon} {a.label}
                    </td>
                    <td style={S.td}>{COMPLEXITY[a.id].time}</td>
                    <td style={S.td}>{COMPLEXITY[a.id].space}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Core Pattern — Full Width */}
          <div style={{ ...S.card, gridColumn: "1 / -1" }}>
            <div style={S.label(K.plum)}>
              🧠 Recursion on Linked Lists — The Mental Model
            </div>
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
                  background: "linear-gradient(135deg, #f0eef8, #ece8f4)",
                  border: "1px solid #d8d0e8",
                }}
              >
                <div style={{ fontSize: 26, marginBottom: 6 }}>📥</div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: K.navy,
                    marginBottom: 5,
                    fontFamily: MONO,
                  }}
                >
                  Descent Phase
                </div>
                <div
                  style={{
                    fontSize: 13,
                    lineHeight: 1.65,
                    color: K.textMid,
                    fontFamily: SANS,
                  }}
                >
                  Each recursive call processes <strong>one node</strong> and
                  delegates the rest. Stack frames accumulate — one per node.
                  This is the "trust the recursion" phase.
                </div>
              </div>
              <div
                style={{
                  padding: "16px 18px",
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #fdf8ed, #f8f0d8)",
                  border: "1px solid #e8ddb8",
                }}
              >
                <div style={{ fontSize: 26, marginBottom: 6 }}>🎯</div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: K.gold,
                    marginBottom: 5,
                    fontFamily: MONO,
                  }}
                >
                  Base Case
                </div>
                <div
                  style={{
                    fontSize: 13,
                    lineHeight: 1.65,
                    color: K.textMid,
                    fontFamily: SANS,
                  }}
                >
                  The deepest call hits <strong>null</strong> or a single node.
                  This is where recursion stops diving and starts returning.
                  Every recursive function MUST have this.
                </div>
              </div>
              <div
                style={{
                  padding: "16px 18px",
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #f8f0f8, #f0e4f0)",
                  border: "1px solid #dcc8e0",
                }}
              >
                <div style={{ fontSize: 26, marginBottom: 6 }}>📤</div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: K.plum,
                    marginBottom: 5,
                    fontFamily: MONO,
                  }}
                >
                  Unwind Phase
                </div>
                <div
                  style={{
                    fontSize: 13,
                    lineHeight: 1.65,
                    color: K.textMid,
                    fontFamily: SANS,
                  }}
                >
                  The magic phase! As each call returns, it can{" "}
                  <strong>modify pointers</strong>,{" "}
                  <strong>build results</strong>, or{" "}
                  <strong>compare values</strong>. Reverse rewires here.
                  Palindrome compares here.
                </div>
              </div>
              <div
                style={{
                  padding: "16px 18px",
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #fef0f0, #fce4e4)",
                  border: "1px solid #f0c8c8",
                }}
              >
                <div style={{ fontSize: 26, marginBottom: 6 }}>⚠️</div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: K.rose,
                    marginBottom: 5,
                    fontFamily: MONO,
                  }}
                >
                  The Hidden Cost
                </div>
                <div
                  style={{
                    fontSize: 13,
                    lineHeight: 1.65,
                    color: K.textMid,
                    fontFamily: SANS,
                  }}
                >
                  Recursion uses <strong>O(n) stack space</strong> — one frame
                  per node. For very long lists, this causes{" "}
                  <strong>stack overflow</strong>. Always mention this trade-off
                  in interviews.
                </div>
              </div>
            </div>
          </div>

          {/* Interview Tips */}
          <div style={{ ...S.card, gridColumn: "1 / -1" }}>
            <div style={S.label(K.rose)}>🎯 Interview Tips</div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: 12,
              }}
            >
              {[
                {
                  q: "When to use recursion?",
                  a: "When the problem has natural substructure (reverse = reverse-rest + rewire). When the unwind phase does useful work. When code clarity matters more than space efficiency.",
                },
                {
                  q: "Recursion vs Iteration?",
                  a: 'Every recursive LL solution can be made iterative. Recursion uses O(n) space (stack); iteration uses O(1). Interviewers often ask: "Can you do it iteratively?" after a recursive solution.',
                },
                {
                  q: "How to explain recursion?",
                  a: '"Assume the recursive call solves the subproblem correctly. My job is just to handle this one node and combine the result." This is the core of the "trust the recursion" mindset.',
                },
                {
                  q: "Common mistakes",
                  a: "Forgetting the base case (infinite recursion). Not returning from the base case. Modifying pointers in the wrong phase (descent vs unwind). Not breaking the old .next pointer in reverse.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    padding: "13px 16px",
                    borderRadius: 10,
                    background:
                      i % 2 === 0
                        ? "linear-gradient(135deg, #faf8f5, #f0eef8)"
                        : "linear-gradient(135deg, #fef5f0, #faf0ea)",
                    border: `1px solid ${K.border}`,
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 800,
                      color: K.text,
                      marginBottom: 5,
                      fontFamily: MONO,
                    }}
                  >
                    {item.q}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      lineHeight: 1.65,
                      color: K.textMid,
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
            color: K.textFade,
            fontWeight: 600,
            fontFamily: MONO,
          }}
        >
          {"// recursion-technique-visualizer • built for FAANG interview prep"}
        </div>
      </div>
    </div>
  );
}
