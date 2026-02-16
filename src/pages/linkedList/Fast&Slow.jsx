import { useState, useEffect, useRef, useCallback, useMemo } from "react";

/* ═══════════════════════════════════════════════════════════════════════════════
   Fast & Slow Pointers — LinkedList Visualizer
   ─────────────────────────────────────────────────────────────────────────────
   Covers three classic algorithms:
     1. Find Middle of Linked List
     2. Detect Cycle (Floyd's Tortoise & Hare)
     3. Find Cycle Start Node
   
   Fully self-contained React component. No external dependencies.
   Designed for FAANG interview preparation & educational demos.
   ═══════════════════════════════════════════════════════════════════════════════ */

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1: Constants, Color Palette & Styling
// ─────────────────────────────────────────────────────────────────────────────

const ALGORITHMS = [
  { id: "findMiddle", label: "Find Middle Node", icon: "◎" },
  { id: "detectCycle", label: "Detect Cycle", icon: "⟳" },
  { id: "findCycleStart", label: "Find Cycle Start", icon: "⊕" },
];

const COMPLEXITY = {
  findMiddle: {
    time: "O(n)",
    space: "O(1)",
    description: "Single pass — slow reaches middle when fast reaches end",
  },
  detectCycle: {
    time: "O(n)",
    space: "O(1)",
    description: "If cycle exists, pointers meet within n steps",
  },
  findCycleStart: {
    time: "O(n)",
    space: "O(1)",
    description: "Phase 1: detect cycle. Phase 2: find entry point",
  },
};

const INTUITION = {
  findMiddle: `Imagine two runners on a track — one runs at 2× speed. When the fast runner finishes, the slow one is at the halfway mark. That's exactly how this works: slow moves 1 node, fast moves 2 nodes. When fast hits null, slow is at the middle.`,
  detectCycle: `Floyd's classic insight: if there's a loop, a fast pointer will eventually "lap" the slow one — like a fast car on a circular track always catches a slower car. If fast hits null instead, there's no cycle.`,
  findCycleStart: `Two phases: First, detect the cycle using tortoise & hare. Then reset one pointer to head and move both at speed 1. They meet at the cycle's entry — this works because of the mathematical relationship between the distances traveled.`,
};

const EDGE_CASES = {
  findMiddle: [
    "Empty list",
    "Single node",
    "Even vs odd length (returns 2nd middle for even)",
    "Two nodes",
  ],
  detectCycle: [
    "Empty list",
    "Single node with self-loop",
    "No cycle",
    "Cycle at head",
    "Cycle at tail",
  ],
  findCycleStart: [
    "No cycle exists",
    "Cycle starts at head",
    "Cycle starts at tail node",
    "Single node self-loop",
  ],
};

// 🎨 Warm playful palette — distinct from the previous purple/teal visualizer
const C = {
  // Backgrounds
  pageBg:
    "linear-gradient(145deg, #fef9f0 0%, #fdf2e9 35%, #fce8d5 70%, #f0f4ff 100%)",
  cardBg: "#ffffff",
  cardBorder: "#f0e6d8",
  cardShadow: "0 6px 28px rgba(180, 130, 80, 0.08), 0 1px 4px rgba(0,0,0,0.04)",

  // Primaries
  flame: "#e8590c",
  flameLt: "#ff922b",
  flameGlow: "rgba(232, 89, 12, 0.10)",
  ocean: "#1971c2",
  oceanLt: "#4dabf7",
  oceanGlow: "rgba(25, 113, 194, 0.10)",
  forest: "#2b8a3e",
  forestLt: "#51cf66",

  // Status
  found: "linear-gradient(135deg, #2b8a3e 0%, #51cf66 100%)",
  danger: "linear-gradient(135deg, #e03131 0%, #ff6b6b 100%)",
  warning: "#f08c00",

  // Node gradients
  nodeDefault: "linear-gradient(135deg, #495057 0%, #868e96 100%)",
  nodeSlow: "linear-gradient(135deg, #e8590c 0%, #ff922b 100%)",
  nodeFast: "linear-gradient(135deg, #1971c2 0%, #4dabf7 100%)",
  nodeBoth: "linear-gradient(135deg, #7048e8 0%, #b197fc 100%)",
  nodeFound: "linear-gradient(135deg, #2b8a3e 0%, #69db7c 100%)",
  nodeVisited: "linear-gradient(135deg, #ced4da 0%, #e9ecef 100%)",
  nodeCycle: "linear-gradient(135deg, #f08c00 0%, #ffd43b 100%)",
  nodeNull: "linear-gradient(135deg, #dee2e6 0%, #f1f3f5 100%)",

  // Text
  text: "#343a40",
  textMed: "#495057",
  textLight: "#868e96",
  white: "#ffffff",
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2: Style Objects
// ─────────────────────────────────────────────────────────────────────────────

const sty = {
  page: {
    minHeight: "100vh",
    background: C.pageBg,
    fontFamily: "'Georgia', 'Cambria', 'Times New Roman', serif",
    color: C.text,
    padding: "20px 16px 60px",
    boxSizing: "border-box",
  },
  wrap: { maxWidth: 1200, margin: "0 auto" },

  /* Header */
  header: { textAlign: "center", marginBottom: 24, padding: "8px 0" },
  titleRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    flexWrap: "wrap",
  },
  tortoise: {
    fontSize: 38,
    display: "inline-block",
    animation: "tortoiseBob 2s ease-in-out infinite",
  },
  hare: {
    fontSize: 38,
    display: "inline-block",
    animation: "hareBob 1s ease-in-out infinite",
  },
  title: {
    fontSize: 30,
    fontWeight: 900,
    margin: 0,
    background: "linear-gradient(135deg, #e8590c, #1971c2)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    fontFamily: "'Georgia', serif",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    fontSize: 14,
    color: C.textLight,
    marginTop: 4,
    fontWeight: 500,
    fontFamily: "system-ui, -apple-system, sans-serif",
  },

  /* Cards */
  card: {
    background: C.cardBg,
    borderRadius: 14,
    boxShadow: C.cardShadow,
    padding: "18px 22px",
    marginBottom: 16,
    border: `1px solid ${C.cardBorder}`,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "1.2px",
    marginBottom: 14,
    fontFamily: "system-ui, -apple-system, sans-serif",
  },

  /* Controls */
  row: { display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" },

  pill: (active) => ({
    padding: "9px 18px",
    borderRadius: 10,
    border: active ? "2px solid #e8590c" : "2px solid #dee2e6",
    background: active ? C.flameGlow : "#fff",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    color: active ? C.flame : C.textMed,
    transition: "all 0.2s",
    fontFamily: "system-ui, sans-serif",
    whiteSpace: "nowrap",
  }),

  input: {
    padding: "9px 14px",
    borderRadius: 10,
    border: "2px solid #dee2e6",
    fontSize: 13,
    width: 200,
    outline: "none",
    fontWeight: 600,
    fontFamily: "system-ui, sans-serif",
    transition: "border-color 0.2s",
  },
  inputSmall: {
    padding: "9px 14px",
    borderRadius: 10,
    border: "2px solid #dee2e6",
    fontSize: 13,
    width: 60,
    outline: "none",
    fontWeight: 600,
    fontFamily: "system-ui, sans-serif",
    textAlign: "center",
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
    fontFamily: "system-ui, sans-serif",
    whiteSpace: "nowrap",
  }),
  btnOff: { opacity: 0.45, pointerEvents: "none" },

  slider: {
    width: 90,
    accentColor: C.flame,
    cursor: "pointer",
  },
  sliderLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: C.textLight,
    fontFamily: "system-ui, sans-serif",
  },

  /* Viz area */
  vizScroll: {
    overflowX: "auto",
    padding: "28px 8px 20px",
    minHeight: 160,
  },
  vizRow: {
    display: "flex",
    alignItems: "center",
    minWidth: "fit-content",
  },

  /* Node */
  node: (gradient, scale = 1, ring = false) => ({
    width: 60,
    height: 60,
    borderRadius: 13,
    background: gradient,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: 800,
    fontSize: 19,
    flexShrink: 0,
    transition:
      "transform 0.4s cubic-bezier(.34,1.56,.64,1), box-shadow 0.35s, opacity 0.35s",
    transform: `scale(${scale})`,
    boxShadow: ring
      ? "0 0 0 4px rgba(232,89,12,0.3), 0 6px 20px rgba(0,0,0,0.15)"
      : "0 4px 14px rgba(0,0,0,0.10)",
    position: "relative",
    zIndex: ring ? 4 : 1,
    fontFamily: "system-ui, sans-serif",
  }),
  nodeIdx: {
    fontSize: 9,
    fontWeight: 700,
    opacity: 0.75,
    marginTop: 1,
    letterSpacing: "0.4px",
  },

  /* Pointer badges above / below nodes */
  badge: (bg, position = "top") => ({
    position: "absolute",
    ...(position === "top" ? { top: -24 } : { bottom: -24 }),
    left: "50%",
    transform: "translateX(-50%)",
    padding: "2px 10px",
    borderRadius: 7,
    fontSize: 10,
    fontWeight: 800,
    background: bg,
    color: "#fff",
    whiteSpace: "nowrap",
    letterSpacing: "0.5px",
    fontFamily: "system-ui, sans-serif",
    boxShadow: `0 2px 8px ${bg}44`,
  }),

  /* Arrows */
  arrow: (color) => ({
    width: 32,
    height: 3,
    background: color,
    position: "relative",
    flexShrink: 0,
    borderRadius: 2,
    transition: "background 0.3s",
  }),
  arrowTip: (color) => ({
    position: "absolute",
    right: -5,
    top: -5,
    width: 0,
    height: 0,
    borderTop: "6px solid transparent",
    borderBottom: "6px solid transparent",
    borderLeft: `8px solid ${color}`,
    transition: "border-left-color 0.3s",
  }),

  /* Cycle arrow (curved back-edge) */
  cycleArrowWrap: {
    position: "relative",
    marginTop: 8,
  },

  /* Null box */
  nullBox: {
    width: 46,
    height: 36,
    borderRadius: 9,
    background: C.nodeNull,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#868e96",
    fontSize: 11,
    fontWeight: 800,
    flexShrink: 0,
    letterSpacing: "0.5px",
    fontFamily: "system-ui, sans-serif",
  },

  /* Explanation */
  explanation: {
    padding: "14px 18px",
    borderRadius: 11,
    background: "linear-gradient(135deg, #fef9f0, #f0f4ff)",
    border: `1px solid ${C.cardBorder}`,
    fontSize: 14,
    lineHeight: 1.75,
    color: C.text,
    minHeight: 44,
    fontWeight: 500,
  },
  stepTag: (bg) => ({
    display: "inline-block",
    padding: "2px 11px",
    borderRadius: 7,
    fontSize: 11,
    fontWeight: 800,
    color: "#fff",
    background: bg,
    marginRight: 8,
    letterSpacing: "0.5px",
    fontFamily: "system-ui, sans-serif",
  }),

  /* Legend */
  legend: { display: "flex", flexWrap: "wrap", gap: 14, marginTop: 10 },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    fontSize: 12,
    fontWeight: 600,
    color: C.textLight,
    fontFamily: "system-ui, sans-serif",
  },
  legendDot: (bg) => ({
    width: 14,
    height: 14,
    borderRadius: 5,
    background: bg,
    flexShrink: 0,
  }),

  /* Edu grid */
  eduGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))",
    gap: 16,
  },
  tag: (bg) => ({
    display: "inline-block",
    padding: "3px 11px",
    borderRadius: 7,
    background: bg,
    color: "#fff",
    fontSize: 12,
    fontWeight: 700,
    marginRight: 6,
    marginBottom: 5,
    fontFamily: "system-ui, sans-serif",
  }),

  /* Table */
  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,
    fontSize: 13,
    fontWeight: 600,
    fontFamily: "system-ui, sans-serif",
  },
  th: {
    textAlign: "left",
    padding: "8px 12px",
    background: C.flameGlow,
    color: C.flame,
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: "0.6px",
    textTransform: "uppercase",
    borderRadius: "8px 8px 0 0",
  },
  td: { padding: "8px 12px", borderBottom: "1px solid #f1f3f5", color: C.text },

  /* Phase indicator */
  phaseBar: (bg) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 16px",
    borderRadius: 9,
    background: bg,
    color: "#fff",
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: "0.4px",
    fontFamily: "system-ui, sans-serif",
  }),

  /* Empty */
  empty: {
    textAlign: "center",
    padding: "40px 0",
    color: C.textLight,
    fontSize: 15,
    fontWeight: 600,
    fontFamily: "system-ui, sans-serif",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3: Keyframe Animations (injected once)
// ─────────────────────────────────────────────────────────────────────────────

const KEYFRAMES = `
@keyframes tortoiseBob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
@keyframes hareBob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
@keyframes pulseRing {
  0%, 100% { box-shadow: 0 0 0 0 rgba(232,89,12,0.4); }
  50% { box-shadow: 0 0 0 10px rgba(232,89,12,0); }
}
@keyframes fadeSlideIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
`;

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 4: Linked List Utilities
// ─────────────────────────────────────────────────────────────────────────────

let _uid = 1;
const uid = () => _uid++;

/** Parse comma-separated values into an array of numbers */
const parseInput = (str) => {
  return str
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n));
};

/** Build a list from values array + optional cyclePos (index that tail connects to) */
const buildList = (vals, cyclePos = -1) => {
  if (!vals.length) return { nodes: [], cycleIdx: -1 };
  const nodes = vals.map((v, i) => ({ id: uid(), val: v, idx: i }));
  const cIdx = cyclePos >= 0 && cyclePos < nodes.length ? cyclePos : -1;
  return { nodes, cycleIdx: cIdx };
};

const randList = (minLen = 5, maxLen = 8) => {
  const len = minLen + Math.floor(Math.random() * (maxLen - minLen + 1));
  return Array.from({ length: len }, () => Math.floor(Math.random() * 90) + 10);
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 5: Step Generators for Each Algorithm
// ─────────────────────────────────────────────────────────────────────────────

/*
  Each step yields:
  {
    slow: index | null,      — slow pointer position
    fast: index | null,      — fast pointer position
    highlights: { [index]: "slow"|"fast"|"both"|"found"|"visited"|"cycle" },
    explanation: string,
    phase: string | null,    — for multi-phase algorithms
    done: boolean,
    found: index | null,     — result node index
  }
*/

function* genFindMiddle(nodes) {
  const n = nodes.length;
  if (n === 0) {
    yield {
      slow: null,
      fast: null,
      highlights: {},
      explanation: "List is empty — no middle to find.",
      phase: null,
      done: true,
      found: null,
    };
    return;
  }

  yield {
    slow: 0,
    fast: 0,
    highlights: { 0: "both" },
    explanation: `Initialize both pointers at head (index 0, value ${nodes[0].val}). Slow moves 1 step, fast moves 2 steps per iteration.`,
    phase: "Initialize",
    done: false,
    found: null,
  };

  let s = 0,
    f = 0;
  let iteration = 0;

  while (f < n - 1 && f + 1 < n) {
    iteration++;
    // Fast can move?
    const canFastMove2 = f + 2 < n;
    const newF = canFastMove2 ? f + 2 : f + 1;
    const newS = s + 1;

    // Build visited set from previous positions
    const hl = {};
    for (let i = 0; i < newS; i++) hl[i] = "visited";
    hl[newS] = newS === newF ? "both" : "slow";
    if (newS !== newF) hl[newF] = "fast";

    const fastHitEnd = newF >= n - 1;
    yield {
      slow: newS,
      fast: newF,
      highlights: hl,
      explanation: `Iteration ${iteration}: Slow → index ${newS} (${nodes[newS].val}), Fast → index ${newF} (${nodes[newF].val}).${fastHitEnd ? " Fast has reached the end!" : ""}`,
      phase: "Traverse",
      done: false,
      found: null,
    };

    s = newS;
    f = newF;
    if (fastHitEnd) break;
  }

  // Result
  const hl = {};
  for (let i = 0; i < n; i++) hl[i] = "visited";
  hl[s] = "found";
  yield {
    slow: s,
    fast: f,
    highlights: hl,
    explanation: `✅ Middle found! Index ${s}, value ${nodes[s].val}. (List length = ${n}${n % 2 === 0 ? ", returned 2nd middle" : ""})`,
    phase: "Result",
    done: true,
    found: s,
  };
}

function* genDetectCycle(nodes, cycleIdx) {
  const n = nodes.length;
  if (n === 0) {
    yield {
      slow: null,
      fast: null,
      highlights: {},
      explanation: "List is empty — no cycle.",
      phase: null,
      done: true,
      found: null,
    };
    return;
  }

  // Mark cycle nodes for background coloring
  const cycleSet = new Set();
  if (cycleIdx >= 0) {
    for (let i = cycleIdx; i < n; i++) cycleSet.add(i);
  }

  const baseHl = () => {
    const h = {};
    cycleSet.forEach((i) => {
      h[i] = "cycle";
    });
    return h;
  };

  yield {
    slow: 0,
    fast: 0,
    highlights: { ...baseHl(), 0: "both" },
    explanation: `Initialize slow and fast at head. ${cycleIdx >= 0 ? `Cycle exists: tail connects back to index ${cycleIdx} (value ${nodes[cycleIdx].val}).` : "No cycle in this list."}`,
    phase: "Initialize",
    done: false,
    found: null,
  };

  let s = 0,
    f = 0;
  let iteration = 0;

  // Simulate movement with cycle
  const nextIdx = (i) => {
    if (i === n - 1) return cycleIdx >= 0 ? cycleIdx : -1; // -1 means null
    return i + 1;
  };

  while (true) {
    iteration++;
    // Move slow 1 step
    const ns = nextIdx(s);
    if (ns < 0) {
      // Slow hit null — no cycle
      const hl = baseHl();
      for (let i = 0; i <= s; i++) if (!cycleSet.has(i)) hl[i] = "visited";
      yield {
        slow: null,
        fast: null,
        highlights: hl,
        explanation: `❌ Slow pointer reached null. No cycle detected!`,
        phase: "Result",
        done: true,
        found: null,
      };
      return;
    }

    // Move fast 2 steps
    const f1 = nextIdx(f);
    if (f1 < 0) {
      const hl = baseHl();
      yield {
        slow: ns,
        fast: null,
        highlights: { ...hl, [ns]: "slow" },
        explanation: `❌ Fast pointer reached null. No cycle detected!`,
        phase: "Result",
        done: true,
        found: null,
      };
      return;
    }
    const f2 = nextIdx(f1);
    if (f2 < 0) {
      const hl = baseHl();
      yield {
        slow: ns,
        fast: null,
        highlights: { ...hl, [ns]: "slow" },
        explanation: `❌ Fast pointer reached null after one hop. No cycle detected!`,
        phase: "Result",
        done: true,
        found: null,
      };
      return;
    }

    const hl = baseHl();
    hl[ns] = ns === f2 ? "both" : "slow";
    if (ns !== f2) hl[f2] = "fast";

    if (ns === f2) {
      yield {
        slow: ns,
        fast: f2,
        highlights: { ...hl, [ns]: "found" },
        explanation: `✅ Cycle detected! Slow and fast meet at index ${ns} (value ${nodes[ns].val}) after ${iteration} iteration(s). This proves a cycle exists.`,
        phase: "Cycle Found!",
        done: true,
        found: ns,
      };
      return;
    }

    yield {
      slow: ns,
      fast: f2,
      highlights: hl,
      explanation: `Iteration ${iteration}: Slow → index ${ns} (${nodes[ns].val}), Fast → index ${f2} (${nodes[f2].val}). Not equal, continue.`,
      phase: "Chase",
      done: false,
      found: null,
    };

    s = ns;
    f = f2;

    // Safety: prevent infinite loop in generator (max reasonable iterations)
    if (iteration > n * 3) {
      yield {
        slow: s,
        fast: f,
        highlights: baseHl(),
        explanation: "⚠️ Max iterations reached. Stopping.",
        phase: "Timeout",
        done: true,
        found: null,
      };
      return;
    }
  }
}

function* genFindCycleStart(nodes, cycleIdx) {
  const n = nodes.length;
  if (n === 0) {
    yield {
      slow: null,
      fast: null,
      highlights: {},
      explanation: "List is empty.",
      phase: null,
      done: true,
      found: null,
    };
    return;
  }

  const cycleSet = new Set();
  if (cycleIdx >= 0) for (let i = cycleIdx; i < n; i++) cycleSet.add(i);

  const baseHl = () => {
    const h = {};
    cycleSet.forEach((i) => {
      h[i] = "cycle";
    });
    return h;
  };

  const nextIdx = (i) => {
    if (i === n - 1) return cycleIdx >= 0 ? cycleIdx : -1;
    return i + 1;
  };

  yield {
    slow: 0,
    fast: 0,
    highlights: { ...baseHl(), 0: "both" },
    explanation: `Phase 1 — Detect cycle. Both pointers start at head. ${cycleIdx >= 0 ? `Cycle: tail → index ${cycleIdx}.` : "No cycle."}`,
    phase: "Phase 1: Detect",
    done: false,
    found: null,
  };

  // ─── Phase 1: Find meeting point ───
  let s = 0,
    f = 0,
    iter = 0;
  let meetIdx = -1;

  while (true) {
    iter++;
    const ns = nextIdx(s);
    if (ns < 0) {
      yield {
        slow: null,
        fast: null,
        highlights: baseHl(),
        explanation:
          "❌ No cycle — slow reached null. Cannot find cycle start.",
        phase: "Result",
        done: true,
        found: null,
      };
      return;
    }
    const f1 = nextIdx(f);
    if (f1 < 0) {
      yield {
        slow: ns,
        fast: null,
        highlights: { ...baseHl(), [ns]: "slow" },
        explanation: "❌ No cycle detected. Fast reached null.",
        phase: "Result",
        done: true,
        found: null,
      };
      return;
    }
    const f2 = nextIdx(f1);
    if (f2 < 0) {
      yield {
        slow: ns,
        fast: null,
        highlights: { ...baseHl(), [ns]: "slow" },
        explanation: "❌ No cycle. Fast reached null.",
        phase: "Result",
        done: true,
        found: null,
      };
      return;
    }

    const hl = baseHl();
    hl[ns] = ns === f2 ? "both" : "slow";
    if (ns !== f2) hl[f2] = "fast";

    if (ns === f2) {
      meetIdx = ns;
      yield {
        slow: ns,
        fast: f2,
        highlights: { ...hl, [ns]: "found" },
        explanation: `Phase 1 complete — pointers meet at index ${ns} (${nodes[ns].val}). Now entering Phase 2: reset slow to head, move both at speed 1.`,
        phase: "Phase 1: Met!",
        done: false,
        found: null,
      };
      s = ns;
      f = f2;
      break;
    }

    yield {
      slow: ns,
      fast: f2,
      highlights: hl,
      explanation: `Phase 1, iteration ${iter}: Slow → ${ns} (${nodes[ns].val}), Fast → ${f2} (${nodes[f2].val}).`,
      phase: "Phase 1: Detect",
      done: false,
      found: null,
    };

    s = ns;
    f = f2;
    if (iter > n * 3) {
      yield {
        slow: s,
        fast: f,
        highlights: baseHl(),
        explanation: "⚠️ Max iterations.",
        phase: "Timeout",
        done: true,
        found: null,
      };
      return;
    }
  }

  // ─── Phase 2: Find start ───
  // Reset slow to head, keep fast at meeting point. Both move at speed 1.
  s = 0;
  // f stays at meetIdx

  const hl2 = baseHl();
  hl2[0] = 0 === f ? "both" : "slow";
  if (0 !== f) hl2[f] = "fast";

  yield {
    slow: 0,
    fast: f,
    highlights: hl2,
    explanation: `Phase 2 — Slow reset to head (index 0). Fast stays at meeting point (index ${f}). Both move 1 step at a time until they meet.`,
    phase: "Phase 2: Find Start",
    done: false,
    found: null,
  };

  iter = 0;
  while (s !== f) {
    iter++;
    s = nextIdx(s);
    f = nextIdx(f);

    const hl = baseHl();
    hl[s] = s === f ? "found" : "slow";
    if (s !== f) hl[f] = "fast";

    if (s === f) {
      yield {
        slow: s,
        fast: f,
        highlights: { ...hl, [s]: "found" },
        explanation: `✅ Pointers meet at index ${s} (value ${nodes[s].val}) — this is the cycle start node!`,
        phase: "Result: Cycle Start Found!",
        done: true,
        found: s,
      };
      return;
    }

    yield {
      slow: s,
      fast: f,
      highlights: hl,
      explanation: `Phase 2, step ${iter}: Slow → ${s} (${nodes[s].val}), Fast → ${f} (${nodes[f].val}). Not equal, continue.`,
      phase: "Phase 2: Find Start",
      done: false,
      found: null,
    };

    if (iter > n * 3) {
      yield {
        slow: s,
        fast: f,
        highlights: baseHl(),
        explanation: "⚠️ Max iterations.",
        phase: "Timeout",
        done: true,
        found: null,
      };
      return;
    }
  }

  // Edge case: they started at the same position
  yield {
    slow: s,
    fast: f,
    highlights: { ...baseHl(), [s]: "found" },
    explanation: `✅ Cycle starts at index ${s} (value ${nodes[s].val})!`,
    phase: "Result: Cycle Start Found!",
    done: true,
    found: s,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 6: Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function FastSlowVisualizer() {
  // ─── Inject keyframes ───
  useEffect(() => {
    const id = "fs-keyframes";
    if (!document.getElementById(id)) {
      const style = document.createElement("style");
      style.id = id;
      style.textContent = KEYFRAMES;
      document.head.appendChild(style);
    }
  }, []);

  // ─── State ───
  const [algo, setAlgo] = useState("findMiddle");
  const [inputStr, setInputStr] = useState("3, 7, 12, 25, 18, 9, 31");
  const [cyclePos, setCyclePos] = useState("3"); // for cycle algorithms
  const [speed, setSpeed] = useState(700);
  const [steps, setSteps] = useState([]);
  const [stepIdx, setStepIdx] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [running, setRunning] = useState(false);

  // Current list data (derived from input, stable between runs)
  const [listData, setListData] = useState(() =>
    buildList(parseInput("3, 7, 12, 25, 18, 9, 31")),
  );

  const playRef = useRef(false);
  const currentStep =
    stepIdx >= 0 && stepIdx < steps.length ? steps[stepIdx] : null;

  const hasCycle = algo === "detectCycle" || algo === "findCycleStart";

  // ─── Actions ───
  const rebuildList = useCallback(() => {
    const vals = parseInput(inputStr);
    const cp = hasCycle ? parseInt(cyclePos, 10) : -1;
    setListData(buildList(vals, isNaN(cp) ? -1 : cp));
  }, [inputStr, cyclePos, hasCycle]);

  // Rebuild list when input changes
  useEffect(() => {
    rebuildList();
  }, [rebuildList]);

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
      const { nodes, cycleIdx } = listData;
      let gen;
      switch (algo) {
        case "findMiddle":
          gen = genFindMiddle(nodes);
          break;
        case "detectCycle":
          gen = genDetectCycle(nodes, cycleIdx);
          break;
        case "findCycleStart":
          gen = genFindCycleStart(nodes, cycleIdx);
          break;
        default:
          return;
      }
      const all = [...gen];
      setSteps(all);
      setStepIdx(0);
      setRunning(true);
    }, 60);
  }, [algo, listData, resetViz]);

  const randomize = () => {
    const vals = randList(5, 8);
    setInputStr(vals.join(", "));
    if (hasCycle) {
      setCyclePos(
        String(Math.floor(Math.random() * Math.max(1, vals.length - 2))),
      );
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

  // ─── Auto-play effect ───
  useEffect(() => {
    if (!playing) return;
    playRef.current = true;
    let timer;
    const advance = () => {
      if (!playRef.current) return;
      setStepIdx((i) => {
        if (i + 1 >= steps.length) {
          playRef.current = false;
          setPlaying(false);
          return i;
        }
        timer = setTimeout(advance, speed);
        return i + 1;
      });
    };
    timer = setTimeout(advance, speed);
    return () => {
      playRef.current = false;
      clearTimeout(timer);
    };
  }, [playing, steps, speed]);

  // ─── Derived render data ───
  const { nodes, cycleIdx } = listData;

  const getNodeGradient = (idx) => {
    if (!currentStep) return C.nodeDefault;
    const hl = currentStep.highlights?.[idx];
    switch (hl) {
      case "slow":
        return C.nodeSlow;
      case "fast":
        return C.nodeFast;
      case "both":
        return C.nodeBoth;
      case "found":
        return C.nodeFound;
      case "visited":
        return C.nodeVisited;
      case "cycle":
        return C.nodeCycle;
      default:
        return C.nodeDefault;
    }
  };

  const getNodeScale = (idx) => {
    if (!currentStep) return 1;
    const hl = currentStep.highlights?.[idx];
    if (hl === "found") return 1.15;
    if (hl === "both" || hl === "slow" || hl === "fast") return 1.08;
    if (hl === "visited") return 0.93;
    return 1;
  };

  const getNodeRing = (idx) => {
    if (!currentStep) return false;
    const hl = currentStep.highlights?.[idx];
    return hl === "found" || hl === "both" || hl === "slow" || hl === "fast";
  };

  const getArrowColor = (fromIdx) => {
    if (!currentStep) return "#ced4da";
    const hl = currentStep.highlights?.[fromIdx];
    if (hl === "slow" || hl === "both") return C.flame;
    if (hl === "fast") return C.ocean;
    if (hl === "cycle") return C.warning;
    return "#ced4da";
  };

  const cx = COMPLEXITY[algo];
  const isDone = currentStep?.done;

  // ─── Render ───
  return (
    <div style={sty.page}>
      <div style={sty.wrap}>
        {/* ═══ HEADER ═══ */}
        <div style={sty.header}>
          <div style={sty.titleRow}>
            <span style={sty.tortoise}>🐢</span>
            <h1 style={sty.title}>Fast & Slow Pointers</h1>
            <span style={sty.hare}>🐇</span>
          </div>
          <p style={sty.subtitle}>
            Interactive visualization of the Tortoise & Hare technique on Linked
            Lists
          </p>
        </div>

        {/* ═══ ALGORITHM SELECTOR ═══ */}
        <div style={sty.card}>
          <div style={{ ...sty.cardLabel, color: C.flame }}>🔬 Algorithm</div>
          <div style={sty.row}>
            {ALGORITHMS.map((a) => (
              <button
                key={a.id}
                style={sty.pill(algo === a.id)}
                onClick={() => {
                  setAlgo(a.id);
                  resetViz();
                }}
              >
                {a.icon} {a.label}
              </button>
            ))}
          </div>
        </div>

        {/* ═══ INPUT & CONTROLS ═══ */}
        <div style={sty.card}>
          <div style={{ ...sty.cardLabel, color: C.ocean }}>⚙️ Controls</div>
          <div style={sty.row}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: C.textLight,
                  fontFamily: "system-ui, sans-serif",
                }}
              >
                Node values (comma-separated)
              </label>
              <input
                style={sty.input}
                value={inputStr}
                onChange={(e) => {
                  setInputStr(e.target.value);
                  resetViz();
                }}
                placeholder="e.g. 3, 7, 12, 25"
              />
            </div>

            {hasCycle && (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: C.textLight,
                    fontFamily: "system-ui, sans-serif",
                  }}
                >
                  Cycle to index (-1 = none)
                </label>
                <input
                  style={sty.inputSmall}
                  value={cyclePos}
                  onChange={(e) => {
                    setCyclePos(e.target.value);
                    resetViz();
                  }}
                  type="number"
                  min={-1}
                />
              </div>
            )}

            <button
              style={sty.btn(C.flame)}
              onClick={execute}
              disabled={playing}
            >
              ▶ Execute
            </button>
            <button style={sty.btn("#495057")} onClick={randomize}>
              🎲 Random
            </button>
            <button
              style={sty.btn("#868e96")}
              onClick={() => {
                setInputStr("3, 7, 12, 25, 18, 9, 31");
                setCyclePos("3");
                resetViz();
              }}
            >
              ↻ Reset
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={sty.sliderLabel}>🐢</span>
              <input
                style={sty.slider}
                type="range"
                min={100}
                max={1500}
                step={50}
                value={1600 - speed}
                onChange={(e) => setSpeed(1600 - +e.target.value)}
              />
              <span style={sty.sliderLabel}>🐇</span>
              <span style={{ ...sty.sliderLabel, minWidth: 48 }}>
                {speed}ms
              </span>
            </div>
          </div>

          {/* Step navigation */}
          {running && (
            <div style={{ ...sty.row, marginTop: 14 }}>
              <button
                style={{
                  ...sty.btn(C.ocean),
                  ...(stepIdx <= 0 || playing ? sty.btnOff : {}),
                }}
                onClick={stepBack}
              >
                ◀ Prev
              </button>
              <button
                style={sty.btn(
                  playing ? C.warning : C.forest,
                  playing ? "#333" : "#fff",
                )}
                onClick={togglePlay}
              >
                {playing ? "⏸ Pause" : "⏵ Auto-play"}
              </button>
              <button
                style={{
                  ...sty.btn(C.ocean),
                  ...(stepIdx >= steps.length - 1 || playing ? sty.btnOff : {}),
                }}
                onClick={stepFwd}
              >
                Next ▶
              </button>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: C.textLight,
                  fontFamily: "system-ui, sans-serif",
                }}
              >
                Step {stepIdx + 1} / {steps.length}
              </span>
              {currentStep?.phase && (
                <span
                  style={sty.phaseBar(
                    isDone
                      ? currentStep.found != null
                        ? C.forest
                        : "#e03131"
                      : C.ocean,
                  )}
                >
                  {currentStep.phase}
                </span>
              )}
            </div>
          )}
        </div>

        {/* ═══ VISUALIZATION ═══ */}
        <div style={sty.card}>
          <div style={{ ...sty.cardLabel, color: C.forest }}>
            🔗 Linked List
          </div>

          <div style={sty.vizScroll}>
            {nodes.length === 0 ? (
              <div style={sty.empty}>
                <span style={{ fontSize: 36 }}>∅</span>
                <br />
                Empty list — enter values above
              </div>
            ) : (
              <div style={sty.vizRow}>
                {nodes.map((nd, i) => {
                  const gradient = getNodeGradient(i);
                  const scale = getNodeScale(i);
                  const ring = getNodeRing(i);
                  const arrowColor = getArrowColor(i);

                  // Determine badges
                  const isSlow = currentStep?.slow === i;
                  const isFast = currentStep?.fast === i;
                  const isFound = currentStep?.found === i && currentStep?.done;
                  const isBothPointer = isSlow && isFast;

                  return (
                    <div
                      key={nd.id}
                      style={{ display: "flex", alignItems: "center" }}
                    >
                      {/* Node */}
                      <div style={{ position: "relative" }}>
                        {/* Head badge */}
                        {i === 0 && !isBothPointer && !isSlow && (
                          <div style={sty.badge("#495057", "top")}>HEAD</div>
                        )}
                        {/* Slow badge */}
                        {isSlow && !isBothPointer && (
                          <div style={sty.badge(C.flame, "top")}>🐢 SLOW</div>
                        )}
                        {/* Fast badge */}
                        {isFast && !isBothPointer && (
                          <div style={sty.badge(C.ocean, "bottom")}>
                            🐇 FAST
                          </div>
                        )}
                        {/* Both badge */}
                        {isBothPointer && (
                          <>
                            <div style={sty.badge("#7048e8", "top")}>
                              🐢 SLOW
                            </div>
                            <div style={sty.badge("#7048e8", "bottom")}>
                              🐇 FAST
                            </div>
                          </>
                        )}
                        {/* Found result badge */}
                        {isFound && !isSlow && !isFast && (
                          <div style={sty.badge(C.forest, "top")}>✓ RESULT</div>
                        )}
                        {/* Cycle target marker */}
                        {hasCycle &&
                          cycleIdx === i &&
                          !isSlow &&
                          !isFast &&
                          !isFound &&
                          i !== 0 && (
                            <div style={sty.badge(C.warning, "top")}>
                              ⟳ CYCLE
                            </div>
                          )}

                        <div style={sty.node(gradient, scale, ring)}>
                          <span>{nd.val}</span>
                          <span style={sty.nodeIdx}>idx {i}</span>
                        </div>
                      </div>

                      {/* Arrow to next node */}
                      {i < nodes.length - 1 && (
                        <div style={sty.arrow(arrowColor)}>
                          <div style={sty.arrowTip(arrowColor)} />
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Tail arrow: null or cycle-back */}
                {hasCycle && cycleIdx >= 0 ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      marginLeft: 4,
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        padding: "4px 12px",
                        borderRadius: 8,
                        background: "linear-gradient(135deg, #f08c00, #ffd43b)",
                        color: "#fff",
                        fontSize: 11,
                        fontWeight: 800,
                        fontFamily: "system-ui, sans-serif",
                        boxShadow: "0 2px 10px rgba(240,140,0,0.3)",
                      }}
                    >
                      ⟳ → idx {cycleIdx}
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div style={sty.arrow("#ced4da")}>
                      <div style={sty.arrowTip("#ced4da")} />
                    </div>
                    <div style={sty.nullBox}>NULL</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Legend */}
          <div style={sty.legend}>
            <div style={sty.legendItem}>
              <div style={sty.legendDot(C.nodeDefault)} /> Default
            </div>
            <div style={sty.legendItem}>
              <div style={sty.legendDot(C.nodeSlow)} /> Slow (🐢)
            </div>
            <div style={sty.legendItem}>
              <div style={sty.legendDot(C.nodeFast)} /> Fast (🐇)
            </div>
            <div style={sty.legendItem}>
              <div style={sty.legendDot(C.nodeBoth)} /> Both Pointers
            </div>
            <div style={sty.legendItem}>
              <div style={sty.legendDot(C.nodeFound)} /> Found / Result
            </div>
            <div style={sty.legendItem}>
              <div style={sty.legendDot(C.nodeVisited)} /> Visited
            </div>
            {hasCycle && (
              <div style={sty.legendItem}>
                <div style={sty.legendDot(C.nodeCycle)} /> In Cycle
              </div>
            )}
          </div>
        </div>

        {/* ═══ EXPLANATION PANEL ═══ */}
        <div style={sty.card}>
          <div style={{ ...sty.cardLabel, color: C.flame }}>
            💬 Step-by-Step Explanation
          </div>
          <div style={sty.explanation}>
            {currentStep ? (
              <div style={{ animation: "fadeSlideIn 0.3s ease" }}>
                <span
                  style={sty.stepTag(
                    isDone
                      ? currentStep.found != null
                        ? C.forest
                        : "#e03131"
                      : C.flame,
                  )}
                >
                  STEP {stepIdx + 1}
                </span>
                {currentStep.explanation}
              </div>
            ) : (
              <span style={{ color: C.textLight }}>
                Choose an algorithm, enter list values, and press{" "}
                <strong>Execute</strong> to begin the step-by-step walkthrough.
              </span>
            )}
          </div>
        </div>

        {/* ═══ EDUCATIONAL PANELS ═══ */}
        <div style={sty.eduGrid}>
          {/* Intuition */}
          <div style={sty.card}>
            <div style={{ ...sty.cardLabel, color: C.ocean }}>💡 Intuition</div>
            <p
              style={{
                fontSize: 14,
                lineHeight: 1.75,
                margin: 0,
                color: C.text,
                fontFamily: "system-ui, sans-serif",
              }}
            >
              {INTUITION[algo]}
            </p>
          </div>

          {/* Complexity */}
          <div style={sty.card}>
            <div style={{ ...sty.cardLabel, color: C.flame }}>⏱ Complexity</div>
            <table style={sty.table}>
              <thead>
                <tr>
                  <th style={sty.th}>Metric</th>
                  <th style={sty.th}>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ ...sty.td, fontWeight: 700 }}>Time</td>
                  <td style={sty.td}>
                    <span style={sty.tag(C.flame)}>{cx.time}</span>
                  </td>
                </tr>
                <tr>
                  <td style={{ ...sty.td, fontWeight: 700 }}>Space</td>
                  <td style={sty.td}>
                    <span style={sty.tag(C.ocean)}>{cx.space}</span>
                  </td>
                </tr>
                <tr>
                  <td
                    style={{ ...sty.td, fontWeight: 700, borderBottom: "none" }}
                  >
                    Why?
                  </td>
                  <td
                    style={{ ...sty.td, borderBottom: "none", fontWeight: 500 }}
                  >
                    {cx.description}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Edge Cases */}
          <div style={sty.card}>
            <div style={{ ...sty.cardLabel, color: C.forest }}>
              ⚠️ Edge Cases
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {EDGE_CASES[algo].map((e, i) => (
                <span key={i} style={sty.tag("#495057")}>
                  {e}
                </span>
              ))}
            </div>
          </div>

          {/* All Algorithms Comparison */}
          <div style={sty.card}>
            <div style={{ ...sty.cardLabel, color: "#7048e8" }}>
              📊 Technique Reference
            </div>
            <table style={sty.table}>
              <thead>
                <tr>
                  <th style={sty.th}>Algorithm</th>
                  <th style={sty.th}>Time</th>
                  <th style={sty.th}>Space</th>
                </tr>
              </thead>
              <tbody>
                {ALGORITHMS.map((a) => (
                  <tr
                    key={a.id}
                    style={a.id === algo ? { background: C.flameGlow } : {}}
                  >
                    <td
                      style={{
                        ...sty.td,
                        fontWeight: a.id === algo ? 800 : 500,
                      }}
                    >
                      {a.icon} {a.label}
                    </td>
                    <td style={sty.td}>{COMPLEXITY[a.id].time}</td>
                    <td style={sty.td}>{COMPLEXITY[a.id].space}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* How It Works — the core insight */}
          <div style={{ ...sty.card, gridColumn: "1 / -1" }}>
            <div style={{ ...sty.cardLabel, color: C.flame }}>
              🧠 The Core Pattern
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 16,
              }}
            >
              {/* Pointer Speed Card */}
              <div
                style={{
                  padding: "16px 20px",
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #fff5f5, #ffe3e3)",
                  border: "1px solid #ffc9c9",
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 6 }}>🐢 → 🐇</div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: C.flame,
                    marginBottom: 6,
                    fontFamily: "system-ui, sans-serif",
                  }}
                >
                  Speed Difference
                </div>
                <div
                  style={{
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: C.textMed,
                    fontFamily: "system-ui, sans-serif",
                  }}
                >
                  Slow moves <strong>1 node</strong> per step. Fast moves{" "}
                  <strong>2 nodes</strong>. This 2:1 ratio is the key to all
                  three algorithms.
                </div>
              </div>

              {/* Middle Insight */}
              <div
                style={{
                  padding: "16px 20px",
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #f3f0ff, #e5dbff)",
                  border: "1px solid #d0bfff",
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 6 }}>◎</div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#7048e8",
                    marginBottom: 6,
                    fontFamily: "system-ui, sans-serif",
                  }}
                >
                  Finding Middle
                </div>
                <div
                  style={{
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: C.textMed,
                    fontFamily: "system-ui, sans-serif",
                  }}
                >
                  When fast reaches the end, slow is at exactly{" "}
                  <strong>n/2</strong>. One pass, O(1) space. No need to count
                  length first!
                </div>
              </div>

              {/* Cycle Insight */}
              <div
                style={{
                  padding: "16px 20px",
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #e7f5ff, #d0ebff)",
                  border: "1px solid #a5d8ff",
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 6 }}>⟳</div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: C.ocean,
                    marginBottom: 6,
                    fontFamily: "system-ui, sans-serif",
                  }}
                >
                  Cycle Detection
                </div>
                <div
                  style={{
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: C.textMed,
                    fontFamily: "system-ui, sans-serif",
                  }}
                >
                  In a cycle, the gap between pointers shrinks by 1 each step.
                  They <strong>must meet</strong> within one full loop of the
                  cycle.
                </div>
              </div>

              {/* Cycle Start Math */}
              <div
                style={{
                  padding: "16px 20px",
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #ebfbee, #d3f9d8)",
                  border: "1px solid #b2f2bb",
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 6 }}>⊕</div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: C.forest,
                    marginBottom: 6,
                    fontFamily: "system-ui, sans-serif",
                  }}
                >
                  Why Phase 2 Works
                </div>
                <div
                  style={{
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: C.textMed,
                    fontFamily: "system-ui, sans-serif",
                  }}
                >
                  Let <em>a</em> = distance to cycle start, <em>b</em> =
                  distance from start to meeting point inside the cycle, and{" "}
                  <em>c</em> = cycle length. At the meeting point: fast traveled
                  2(a+b) and slow traveled a+b. The difference a+b = kc for some
                  integer k, so a = kc − b. Moving a pointer from head and
                  another from the meeting point by 1 step at a time, they meet
                  at the cycle start.
                </div>
              </div>
            </div>
          </div>

          {/* Interview Tips */}
          <div style={{ ...sty.card, gridColumn: "1 / -1" }}>
            <div style={{ ...sty.cardLabel, color: "#7048e8" }}>
              🎯 Interview Tips
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: 14,
              }}
            >
              {[
                {
                  q: "When to use Fast & Slow?",
                  a: "Cycle detection, finding middle, finding kth-from-end, detecting palindrome linked list, finding intersection of two lists.",
                },
                {
                  q: "Common follow-up questions",
                  a: '"Can you prove why phase 2 works mathematically?" — walk through the a + b = kc relationship. Show the distance equation.',
                },
                {
                  q: "Pitfalls to avoid",
                  a: "Always check fast AND fast.next before advancing (avoid null pointer). Handle empty list and single node. For even-length lists, clarify which middle.",
                },
                {
                  q: "Variations",
                  a: "Fast moves 3× for cycle length. Slow at 1× and fast at k× to find n/k position. Two pointers at different start points for intersection.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    padding: "14px 18px",
                    borderRadius: 11,
                    background:
                      i % 2 === 0
                        ? "linear-gradient(135deg, #fef9f0, #fdf2e9)"
                        : "linear-gradient(135deg, #f0f4ff, #e7f5ff)",
                    border: `1px solid ${C.cardBorder}`,
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 800,
                      color: C.text,
                      marginBottom: 6,
                      fontFamily: "system-ui, sans-serif",
                    }}
                  >
                    {item.q}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      lineHeight: 1.65,
                      color: C.textMed,
                      fontFamily: "system-ui, sans-serif",
                    }}
                  >
                    {item.a}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══ FOOTER ═══ */}
        <div
          style={{
            textAlign: "center",
            marginTop: 24,
            fontSize: 12,
            color: C.textLight,
            fontWeight: 600,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          Fast & Slow Pointers Visualizer — Tortoise & Hare Technique — Built
          for FAANG interview prep
        </div>
      </div>
    </div>
  );
}
