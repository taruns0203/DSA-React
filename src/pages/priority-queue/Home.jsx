import { useState, useEffect, useRef, useCallback } from "react";

/* ================================================================
   PRIORITY QUEUES — DSA Visualizer Platform Topic Page

   Aesthetic: "Crystalline Observatory / Midnight Prism"
   - Deep midnight-sapphire base with prismatic magenta-rose
     and electric cyan accents
   - Animated min-heap SVG with bubble-up pulse animation
   - Glassmorphism technique accordions (7 categories)
   - Dark / Light theme with smooth CSS-variable transitions
   ================================================================ */

// ─── THEME PALETTES ──────────────────────────────────────────────
const PAL = {
  dark: {
    "--bg-root": "#07060e",
    "--bg-hero": "#0a0816",
    "--bg-section": "#0c0a18",
    "--bg-card": "rgba(16, 14, 34, 0.6)",
    "--bg-card-hover": "rgba(24, 20, 50, 0.78)",
    "--bg-glass": "rgba(18, 14, 38, 0.48)",
    "--bg-tag": "rgba(236, 72, 153, 0.07)",
    "--bg-problem": "rgba(236, 72, 153, 0.025)",
    "--bg-problem-hover": "rgba(236, 72, 153, 0.06)",
    "--text-1": "#e8e4f4",
    "--text-2": "#908aa8",
    "--text-3": "#5a5472",
    "--accent": "#ec4899",
    "--accent-2": "#22d3ee",
    "--accent-3": "#f59e0b",
    "--accent-4": "#a78bfa",
    "--accent-5": "#34d399",
    "--border": "rgba(236, 72, 153, 0.06)",
    "--border-card": "rgba(236, 72, 153, 0.09)",
    "--border-hover": "rgba(236, 72, 153, 0.24)",
    "--glow": "rgba(236, 72, 153, 0.05)",
    "--glow-strong": "rgba(236, 72, 153, 0.18)",
    "--shadow-card": "0 8px 44px rgba(0,0,0,0.4)",
    "--shadow-hover": "0 14px 52px rgba(236,72,153,0.06)",
    "--node-fill": "#110e22",
    "--node-stroke": "rgba(236, 72, 153, 0.28)",
    "--node-active-stroke": "#ec4899",
    "--node-active-fill": "rgba(236, 72, 153, 0.14)",
    "--node-visited-stroke": "#22d3ee",
    "--node-visited-fill": "rgba(34, 211, 238, 0.08)",
    "--node-text": "#ec4899",
    "--edge-color": "rgba(34, 211, 238, 0.14)",
    "--edge-active": "rgba(34, 211, 238, 0.5)",
    "--grid-line": "rgba(236, 72, 153, 0.016)",
    "--overlay": "rgba(7, 6, 14, 0.9)",
    "--good": "#34d399",
    "--mid": "#f59e0b",
    "--bad": "#ef4444",
  },
  light: {
    "--bg-root": "#f8f6fb",
    "--bg-hero": "#f2eef8",
    "--bg-section": "#f4f0f9",
    "--bg-card": "rgba(255, 255, 255, 0.72)",
    "--bg-card-hover": "rgba(255, 255, 255, 0.9)",
    "--bg-glass": "rgba(255, 255, 255, 0.58)",
    "--bg-tag": "rgba(190, 24, 93, 0.06)",
    "--bg-problem": "rgba(190, 24, 93, 0.025)",
    "--bg-problem-hover": "rgba(190, 24, 93, 0.06)",
    "--text-1": "#1c1628",
    "--text-2": "#6a5e82",
    "--text-3": "#a098b2",
    "--accent": "#be185d",
    "--accent-2": "#0891b2",
    "--accent-3": "#d97706",
    "--accent-4": "#7c3aed",
    "--accent-5": "#059669",
    "--border": "rgba(190, 24, 93, 0.07)",
    "--border-card": "rgba(190, 24, 93, 0.1)",
    "--border-hover": "rgba(190, 24, 93, 0.28)",
    "--glow": "rgba(190, 24, 93, 0.035)",
    "--glow-strong": "rgba(190, 24, 93, 0.09)",
    "--shadow-card": "0 8px 44px rgba(28,22,40,0.06)",
    "--shadow-hover": "0 14px 52px rgba(190,24,93,0.05)",
    "--node-fill": "#ffffff",
    "--node-stroke": "rgba(190, 24, 93, 0.25)",
    "--node-active-stroke": "#be185d",
    "--node-active-fill": "rgba(190, 24, 93, 0.08)",
    "--node-visited-stroke": "#0891b2",
    "--node-visited-fill": "rgba(8, 145, 178, 0.06)",
    "--node-text": "#be185d",
    "--edge-color": "rgba(8, 145, 178, 0.15)",
    "--edge-active": "rgba(8, 145, 178, 0.45)",
    "--grid-line": "rgba(190, 24, 93, 0.022)",
    "--overlay": "rgba(248, 246, 251, 0.92)",
    "--good": "#059669",
    "--mid": "#d97706",
    "--bad": "#dc2626",
  },
};

// ─── HEAP DATA (Min-Heap for hero visual) ────────────────────────
// A 15-node min-heap laid out as a complete binary tree
const HEAP = [
  { id: 0, val: 1, x: 240, y: 34 },
  { id: 1, val: 3, x: 130, y: 94 },
  { id: 2, val: 2, x: 350, y: 94 },
  { id: 3, val: 5, x: 74, y: 154 },
  { id: 4, val: 8, x: 186, y: 154 },
  { id: 5, val: 4, x: 294, y: 154 },
  { id: 6, val: 7, x: 406, y: 154 },
  { id: 7, val: 12, x: 42, y: 214 },
  { id: 8, val: 9, x: 106, y: 214 },
  { id: 9, val: 15, x: 154, y: 214 },
  { id: 10, val: 11, x: 218, y: 214 },
  { id: 11, val: 6, x: 262, y: 214 },
  { id: 12, val: 10, x: 326, y: 214 },
  { id: 13, val: 13, x: 374, y: 214 },
  { id: 14, val: 14, x: 438, y: 214 },
];

const HEAP_EDGES = [
  [0, 1],
  [0, 2],
  [1, 3],
  [1, 4],
  [2, 5],
  [2, 6],
  [3, 7],
  [3, 8],
  [4, 9],
  [4, 10],
  [5, 11],
  [5, 12],
  [6, 13],
  [6, 14],
];

// Bubble-up path: simulate inserting a new min (0) at position 14,
// which bubbles: 14 -> 6 -> 2 -> 0. We cycle through highlighting this.
const BUBBLE_PATH = [14, 6, 2, 0];

// ─── TECHNIQUES DATA ─────────────────────────────────────────────
const TECHNIQUES = [
  {
    id: "kth",
    icon: "🏅",
    title: "Finding Kth Largest/Smallest",
    desc: "Use a min-heap of size K to efficiently track the Kth largest element in a stream, or a max-heap for the Kth smallest — O(n log k) vs sorting's O(n log n).",
    accent: "var(--accent)",
    problems: [
      {
        name: "Kth Largest Element in an Array",
        slug: "kth-largest-element-in-an-array",
      },
      {
        name: "Kth Smallest Element in a Sorted Matrix",
        slug: "kth-smallest-element-in-a-sorted-matrix",
      },
      {
        name: "Find Median from Data Stream",
        slug: "find-median-from-data-stream",
      },
      {
        name: "K Closest Points to Origin",
        slug: "k-closest-points-to-origin",
      },
      {
        name: "Kth Largest Element in a Stream",
        slug: "kth-largest-element-in-a-stream",
      },
    ],
  },
  {
    id: "topk",
    icon: "📊",
    title: "Top K Frequent Elements",
    desc: "Combine frequency counting with a heap to extract the K most (or least) frequent items — a pattern bridging hash maps and priority queues.",
    accent: "var(--accent-2)",
    problems: [
      { name: "Top K Frequent Elements", slug: "top-k-frequent-elements" },
      {
        name: "Sort Characters By Frequency",
        slug: "sort-characters-by-frequency",
      },
      { name: "Top K Frequent Words", slug: "top-k-frequent-words" },
      {
        name: "Top K Frequent Elements in Sorted Matrix",
        slug: "top-k-frequent-elements-in-sorted-matrix",
      },
      { name: "Maximum Frequency Stack", slug: "maximum-frequency-stack" },
      { name: "Task Scheduler", slug: "task-scheduler" },
      {
        name: "Sort Array by Increasing Frequency",
        slug: "sort-array-by-increasing-frequency",
      },
    ],
  },
  {
    id: "merge",
    icon: "🔀",
    title: "Merge K Lists",
    desc: "Maintain a min-heap of K list heads to always extract the global minimum — merging K sorted sequences in O(N log K) total time.",
    accent: "var(--accent-3)",
    problems: [
      { name: "Merge K Sorted Lists", slug: "merge-k-sorted-lists" },
      { name: "Merge Sorted Array", slug: "merge-sorted-array" },
      { name: "Merge Intervals", slug: "merge-intervals" },
      {
        name: "Find Smallest Common Number",
        slug: "find-smallest-common-number",
      },
      {
        name: "Smallest Range Covering Elements from K Lists",
        slug: "smallest-range-covering-elements-from-k-lists",
      },
      { name: "Kth Smallest Value", slug: "kth-smallest-value" },
      {
        name: "K Pairs with Smallest Sums",
        slug: "k-pairs-with-smallest-sums",
      },
    ],
  },
  {
    id: "sliding",
    icon: "🪟",
    title: "Sliding Window Maximum/Minimum",
    desc: "Use a monotonic deque or heap to track the current window's extremum as it slides — achieving amortised O(1) per element for range queries.",
    accent: "var(--accent-4)",
    problems: [
      { name: "Sliding Window Maximum", slug: "sliding-window-maximum" },
      {
        name: "Maximum Sum of Subarray of Size K",
        slug: "maximum-sum-of-subarray-of-size-k",
      },
      { name: "Minimum Window Substring", slug: "minimum-window-substring" },
      { name: "Max Consecutive Ones III", slug: "max-consecutive-ones-iii" },
      {
        name: "Longest Continuous Subarray With Absolute Diff ≤ Limit",
        slug: "longest-continuous-subarray-with-absolute-diff-less-than-or-equal-to-limit",
      },
    ],
  },
  {
    id: "design",
    icon: "🏗️",
    title: "Design Problems",
    desc: "Architect systems using heaps as the scheduling backbone — leaderboards, feed ranking, hit counting, and priority-driven game state.",
    accent: "var(--accent-5)",
    problems: [
      { name: "Design Twitter", slug: "design-twitter" },
      { name: "Design Hit Counter", slug: "design-hit-counter" },
      { name: "Design Browser History", slug: "design-browser-history" },
      { name: "Design Snake Game", slug: "design-snake-game" },
      { name: "Design a Leaderboard", slug: "design-a-leaderboard" },
      { name: "Design Food Rating System", slug: "design-food-rating-system" },
    ],
  },
  {
    id: "construct",
    icon: "🧩",
    title: "Construction & Manipulation",
    desc: "Rearrange sequences by greedily extracting the highest-frequency character from a max-heap — ensuring spacing constraints and lexicographic order.",
    accent: "var(--accent)",
    problems: [
      {
        name: "Rearrange String K Distance Apart",
        slug: "rearrange-string-k-distance-apart",
      },
      { name: "Reorganize String", slug: "reorganize-string" },
      {
        name: "Rearrange Words in a Sentence",
        slug: "rearrange-words-in-a-sentence",
      },
    ],
  },
  {
    id: "graphs",
    icon: "🗺️",
    title: "With Graphs",
    desc: "Priority queues power Dijkstra's and best-first graph traversals — always expanding the most promising frontier node for shortest-path problems.",
    accent: "var(--accent-2)",
    problems: [
      {
        name: "Path with Maximum Probability",
        slug: "path-with-maximum-probability",
      },
      { name: "The Maze II", slug: "the-maze-ii" },
      {
        name: "Kth Smallest Element in a Sorted Matrix",
        slug: "kth-smallest-element-in-a-sorted-matrix-graph",
      },
    ],
  },
];

const COMPLEXITIES = [
  { op: "Insert", val: "O(log n)", tier: "good" },
  { op: "Extract Min/Max", val: "O(log n)", tier: "good" },
  { op: "Peek", val: "O(1)", tier: "good" },
  { op: "Delete", val: "O(log n)", tier: "mid" },
  { op: "Search", val: "O(n)", tier: "bad" },
  { op: "Heapify", val: "O(n)", tier: "mid" },
];

const INFO_CARDS = [
  {
    icon: "⛰️",
    title: "What is a Priority Queue?",
    text: "An abstract data type where each element has a priority. The highest-priority element is always dequeued first, regardless of insertion order — typically backed by a binary heap.",
  },
  {
    icon: "🧠",
    title: "Memory Model",
    text: "Usually implemented as a complete binary tree stored in a flat array. Parent at index i has children at 2i+1 and 2i+2. This array layout ensures excellent cache locality.",
  },
  {
    icon: "⚡",
    title: "When to Use",
    text: "Dijkstra's algorithm, K-way merges, task schedulers, event-driven simulations, median finding, Huffman coding — anywhere you repeatedly need the min or max element.",
  },
  {
    icon: "⚠️",
    title: "Trade-offs",
    text: "O(n) search — heaps are not designed for arbitrary lookups. Decrease-key requires index tracking. For sorted iteration, a BST may be more appropriate.",
  },
];

const TOTAL = TECHNIQUES.reduce((s, t) => s + t.problems.length, 0);

// ─── STYLES ──────────────────────────────────────────────────────
const css = `
  @keyframes fadeUp {
    from { opacity:0; transform:translateY(24px); }
    to { opacity:1; transform:translateY(0); }
  }
  @keyframes orbDrift {
    0%,100% { transform:translate(0,0) scale(1); }
    33% { transform:translate(20px,-26px) scale(1.06); }
    66% { transform:translate(-16px,18px) scale(0.94); }
  }
  @keyframes bubbleGlow {
    0%,100% { filter:drop-shadow(0 0 0px transparent); }
    50% { filter:drop-shadow(0 0 14px var(--glow-strong)); }
  }
  @keyframes prismShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  @keyframes ringPulse {
    0% { r:16; opacity:1; }
    100% { r:28; opacity:0; }
  }

  *,*::before,*::after { margin:0; padding:0; box-sizing:border-box; }

  .pq-root {
    font-family: 'Didot', 'Bodoni MT', 'Noto Serif Display', 'Times New Roman', serif;
    background:var(--bg-root);
    color:var(--text-1);
    min-height:100vh;
    overflow-x:hidden;
    line-height:1.65;
    transition:background 0.5s cubic-bezier(0.4,0,0.2,1), color 0.5s cubic-bezier(0.4,0,0.2,1);
    position:relative;
  }
  .pq-root::before {
    content:'';
    position:fixed; inset:0;
    background:
      linear-gradient(var(--grid-line) 1px, transparent 1px),
      linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
    background-size:54px 54px;
    pointer-events:none; z-index:0;
  }

  .pq-ui { font-family:'Segoe UI',system-ui,sans-serif; }
  .pq-mono { font-family:'Cascadia Code','Fira Code',Consolas,monospace; }

  /* ─── TOPBAR ─── */
  .pq-topbar {
    position:fixed; top:0; left:0; right:0; z-index:999;
    height:60px; display:flex; align-items:center; justify-content:space-between;
    padding:0 clamp(1rem,4vw,3rem);
    background:var(--overlay);
    backdrop-filter:blur(24px); -webkit-backdrop-filter:blur(24px);
    border-bottom:1px solid var(--border);
    transition:background 0.5s ease;
  }
  .pq-brand {
    display:flex; align-items:center; gap:10px;
    font-family:'Segoe UI',system-ui,sans-serif;
    font-weight:700; font-size:0.95rem; cursor:pointer;
  }
  .pq-logo {
    width:32px; height:32px; border-radius:8px;
    background:linear-gradient(135deg, var(--accent), var(--accent-2));
    display:grid; place-items:center;
    font-size:0.7rem; font-weight:800; color:#fff; position:relative;
  }
  .pq-logo::after {
    content:''; position:absolute; inset:0; border-radius:8px;
    background:linear-gradient(135deg,transparent 50%,rgba(255,255,255,0.15));
  }
  .pq-sep { color:var(--text-3); font-weight:300; margin:0 2px; }
  .pq-topic-lbl { color:var(--accent); }
  .pq-actions { display:flex; align-items:center; gap:14px; }
  .pq-back {
    display:flex; align-items:center; gap:5px;
    padding:5px 14px; border-radius:8px;
    background:var(--bg-glass); border:1px solid var(--border-card);
    color:var(--text-2); font-family:'Segoe UI',system-ui,sans-serif;
    font-size:0.78rem; font-weight:600; cursor:pointer; transition:all 0.3s ease;
  }
  .pq-back:hover { color:var(--text-1); border-color:var(--border-hover); }
  .pq-toggle {
    width:50px; height:26px; border-radius:20px;
    background:var(--bg-glass); border:1.5px solid var(--border-card);
    cursor:pointer; position:relative; transition:all 0.3s ease; flex-shrink:0;
  }
  .pq-toggle:hover { border-color:var(--border-hover); }
  .pq-knob {
    position:absolute; top:2px; left:2px;
    width:18px; height:18px; border-radius:50%;
    background:linear-gradient(135deg, var(--accent), var(--accent-2));
    transition:transform 0.4s cubic-bezier(0.34,1.56,0.64,1);
    display:grid; place-items:center; font-size:10px;
  }
  .pq-knob.on { transform:translateX(24px); }

  /* ─── HERO ─── */
  .pq-hero {
    position:relative; min-height:92vh;
    display:flex; align-items:center; justify-content:center;
    padding:100px clamp(1.5rem,5vw,4rem) 4rem;
    overflow:hidden;
  }
  .pq-hero-bg { position:absolute; inset:0; z-index:0; transition:background 0.5s ease; }
  .pq-orb { position:absolute; border-radius:50%; filter:blur(100px); pointer-events:none; z-index:1; }
  .pq-hero-inner {
    position:relative; z-index:2;
    max-width:1060px; width:100%;
    display:grid; grid-template-columns:1fr 1fr;
    gap:3rem; align-items:center;
  }
  @media(max-width:880px) {
    .pq-hero-inner { grid-template-columns:1fr; gap:2.5rem; }
    .pq-hero-text { text-align:center; align-items:center; }
  }
  .pq-hero-text {
    display:flex; flex-direction:column; align-items:flex-start; gap:1.1rem;
  }
  .pq-crumb {
    display:inline-flex; align-items:center; gap:6px;
    font-family:'Segoe UI',system-ui,sans-serif;
    font-size:0.7rem; font-weight:600;
    text-transform:uppercase; letter-spacing:0.14em;
    color:var(--text-3); animation:fadeUp 0.7s ease both;
  }
  .pq-crumb .s { opacity:0.4; }
  .pq-crumb .c { color:var(--accent); }
  .pq-h1 {
    font-family:'Segoe UI',system-ui,sans-serif;
    font-size:clamp(2.4rem,5.5vw,3.8rem);
    font-weight:800; letter-spacing:-0.04em; line-height:1.08;
    animation:fadeUp 0.7s ease 0.08s both;
  }
  .pq-h1 .grad {
    background:linear-gradient(135deg, var(--accent), var(--accent-2));
    -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
  }
  .pq-h1 .thin { font-weight:300; color:var(--text-2); }
  .pq-desc {
    font-size:clamp(0.9rem,1.6vw,1.02rem);
    color:var(--text-2); line-height:1.78; max-width:460px;
    animation:fadeUp 0.7s ease 0.16s both;
  }
  .pq-cta {
    display:inline-flex; align-items:center; gap:10px;
    padding:14px 34px; border-radius:14px;
    background:linear-gradient(135deg, var(--accent), var(--accent-2));
    background-size:200% 200%; animation:fadeUp 0.7s ease 0.28s both, prismShift 6s ease infinite;
    color:#fff; font-family:'Segoe UI',system-ui,sans-serif;
    font-weight:700; font-size:0.95rem;
    border:none; cursor:pointer; position:relative; overflow:hidden;
    transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease;
    text-decoration:none;
  }
  .pq-cta::before {
    content:''; position:absolute; inset:0;
    background:linear-gradient(135deg,transparent 40%,rgba(255,255,255,0.14));
  }
  .pq-cta:hover {
    transform:translateY(-3px) scale(1.02);
    box-shadow:0 10px 44px rgba(236,72,153,0.2);
  }
  .pq-cta .ar { transition:transform 0.3s ease; }
  .pq-cta:hover .ar { transform:translateX(5px); }

  /* ─── HEAP SVG ─── */
  .pq-heap-wrap {
    display:flex; flex-direction:column; align-items:center; gap:0.7rem;
    animation:fadeUp 0.8s ease 0.25s both;
  }
  .pq-heap-label {
    font-family:'Cascadia Code','Fira Code',Consolas,monospace;
    font-size:0.6rem; color:var(--text-3);
    text-transform:uppercase; letter-spacing:0.14em;
  }
  .pq-heap-sub {
    font-family:'Cascadia Code','Fira Code',Consolas,monospace;
    font-size:0.52rem; color:var(--text-3); opacity:0.7;
  }
  .pq-heap-svg { width:100%; max-width:480px; height:auto; }

  .pq-edge {
    stroke:var(--edge-color); stroke-width:1.5; fill:none;
    transition:stroke 0.4s ease;
  }
  .pq-edge.active { stroke:var(--edge-active); stroke-width:2.2; }

  .pq-node-c {
    fill:var(--node-fill); stroke:var(--node-stroke); stroke-width:1.8;
    transition:all 0.4s ease;
  }
  .pq-node-c.active {
    fill:var(--node-active-fill); stroke:var(--node-active-stroke); stroke-width:2.6;
    filter:drop-shadow(0 0 10px var(--glow-strong));
  }
  .pq-node-c.visited {
    fill:var(--node-visited-fill); stroke:var(--node-visited-stroke); stroke-width:2;
  }
  .pq-node-t {
    fill:var(--node-text);
    font-family:'Cascadia Code','Fira Code',Consolas,monospace;
    font-size:10px; font-weight:700;
    text-anchor:middle; dominant-baseline:central;
    pointer-events:none; transition:fill 0.4s ease;
  }
  .pq-pulse-ring {
    fill:none; stroke:var(--accent); stroke-width:1.5;
    opacity:0;
  }
  .pq-pulse-ring.active {
    animation:ringPulse 1.2s ease-out infinite;
  }

  /* Array representation */
  .pq-arr-row {
    display:flex; gap:0; justify-content:center;
    animation:fadeUp 0.7s ease 0.45s both;
    margin-top:0.3rem;
  }
  .pq-arr-cell {
    width:32px; height:32px;
    border:1px solid var(--border-card);
    background:var(--bg-glass);
    display:grid; place-items:center;
    font-family:'Cascadia Code','Fira Code',Consolas,monospace;
    font-size:0.6rem; font-weight:700; color:var(--text-2);
    transition:all 0.3s ease;
  }
  .pq-arr-cell:first-child { border-radius:6px 0 0 6px; }
  .pq-arr-cell:last-child { border-radius:0 6px 6px 0; }
  .pq-arr-cell:not(:first-child) { border-left:none; }
  .pq-arr-cell.active {
    background:var(--node-active-fill);
    color:var(--accent);
    border-color:var(--accent);
    box-shadow:0 0 10px var(--glow);
    z-index:1;
  }
  .pq-arr-cell.visited {
    color:var(--accent-2);
    border-color:var(--node-visited-stroke);
    background:var(--node-visited-fill);
  }

  /* Chips */
  .pq-chips {
    display:flex; flex-wrap:wrap; gap:5px; justify-content:center;
    animation:fadeUp 0.7s ease 0.55s both; margin-top:0.5rem;
  }
  .pq-chip {
    display:flex; align-items:center; gap:4px;
    padding:3px 10px; border-radius:18px;
    background:var(--bg-glass); border:1px solid var(--border-card);
    font-family:'Cascadia Code','Fira Code',Consolas,monospace;
    font-size:0.58rem; font-weight:600;
    backdrop-filter:blur(8px);
    transition:background 0.5s ease, border-color 0.5s ease;
  }
  .pq-chip .op { color:var(--text-3); text-transform:uppercase; letter-spacing:0.05em; }
  .pq-chip .v { font-weight:700; }
  .pq-chip .v.good { color:var(--good); }
  .pq-chip .v.mid { color:var(--mid); }
  .pq-chip .v.bad { color:var(--bad); }

  /* ─── INFO ─── */
  .pq-info-strip { position:relative; z-index:1; padding:0 clamp(1.5rem,5vw,4rem); }
  .pq-info-grid {
    max-width:980px; margin:-2rem auto 0;
    display:grid; grid-template-columns:repeat(auto-fit,minmax(210px,1fr)); gap:1rem;
  }
  .pq-icard {
    background:var(--bg-card);
    backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px);
    border:1px solid var(--border-card); border-radius:14px;
    padding:1.2rem 1.3rem; transition:all 0.35s ease;
  }
  .pq-icard:hover { border-color:var(--border-hover); box-shadow:var(--shadow-hover); transform:translateY(-2px); }
  .pq-icard-icon { font-size:1.3rem; margin-bottom:0.5rem; }
  .pq-icard-title { font-family:'Segoe UI',system-ui,sans-serif; font-size:0.8rem; font-weight:700; margin-bottom:0.2rem; }
  .pq-icard-text { font-size:0.76rem; color:var(--text-2); line-height:1.55; }

  /* ─── SECTION ─── */
  .pq-section { padding:5rem clamp(1.5rem,5vw,4rem); position:relative; z-index:1; }
  .pq-section-inner { max-width:980px; margin:0 auto; }
  .pq-eyebrow {
    font-family:'Segoe UI',system-ui,sans-serif;
    font-size:0.68rem; font-weight:700; text-transform:uppercase;
    letter-spacing:0.16em; color:var(--accent); margin-bottom:0.5rem;
  }
  .pq-sec-title {
    font-family:'Segoe UI',system-ui,sans-serif;
    font-size:clamp(1.3rem,3.5vw,1.85rem);
    font-weight:800; letter-spacing:-0.03em;
  }
  .pq-sec-sub { color:var(--text-2); font-size:0.9rem; margin-top:0.4rem; max-width:600px; }

  /* ─── TECH CARDS ─── */
  .pq-tlist { display:flex; flex-direction:column; gap:0.9rem; margin-top:2.5rem; }
  .pq-tc {
    background:var(--bg-card);
    border:1px solid var(--border-card); border-radius:14px;
    backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px);
    overflow:hidden;
    transition:background 0.5s ease, border-color 0.3s ease, box-shadow 0.3s ease;
  }
  .pq-tc:hover,.pq-tc.open { border-color:var(--border-hover); box-shadow:var(--shadow-hover); }
  .pq-tc-hdr {
    display:flex; align-items:center; gap:14px;
    padding:1.15rem 1.4rem; cursor:pointer; user-select:none;
    transition:background 0.25s ease;
  }
  .pq-tc-hdr:hover { background:var(--glow); }
  .pq-tc-icon {
    width:42px; height:42px; border-radius:10px;
    display:grid; place-items:center; font-size:1.05rem; flex-shrink:0;
    transition:transform 0.35s cubic-bezier(0.34,1.56,0.64,1);
  }
  .pq-tc:hover .pq-tc-icon,.pq-tc.open .pq-tc-icon { transform:scale(1.08) rotate(-4deg); }
  .pq-tc-mid { flex:1; min-width:0; }
  .pq-tc-name { font-family:'Segoe UI',system-ui,sans-serif; font-size:0.98rem; font-weight:700; }
  .pq-tc-desc { font-size:0.76rem; color:var(--text-2); margin-top:2px; line-height:1.5; }
  .pq-tc-cnt {
    font-family:'Cascadia Code','Fira Code',Consolas,monospace;
    font-size:0.62rem; color:var(--text-3);
    padding:3px 9px; border-radius:20px; background:var(--bg-tag);
    flex-shrink:0; white-space:nowrap;
  }
  .pq-chev {
    width:18px; height:18px; flex-shrink:0;
    transition:transform 0.4s cubic-bezier(0.34,1.56,0.64,1), color 0.3s ease;
    color:var(--text-3);
  }
  .pq-tc.open .pq-chev { transform:rotate(180deg); color:var(--accent); }
  .pq-tc-body { max-height:0; overflow:hidden; transition:max-height 0.5s cubic-bezier(0.4,0,0.2,1); }
  .pq-tc.open .pq-tc-body { max-height:700px; }
  .pq-tc-body-in {
    padding:0 1.4rem 1.3rem; opacity:0; transform:translateY(-8px);
    transition:opacity 0.35s ease 0.1s, transform 0.35s ease 0.1s;
  }
  .pq-tc.open .pq-tc-body-in { opacity:1; transform:translateY(0); }
  .pq-div { height:1px; background:var(--border); margin-bottom:0.7rem; }
  .pq-pl { display:flex; flex-direction:column; gap:3px; }
  .pq-plink {
    display:flex; align-items:center; gap:10px;
    padding:8px 14px; border-radius:8px;
    background:var(--bg-problem);
    transition:all 0.25s ease; cursor:pointer;
    text-decoration:none; color:var(--text-1);
    position:relative; overflow:hidden;
  }
  .pq-plink::before {
    content:''; position:absolute; left:0; top:0; bottom:0;
    width:3px; background:linear-gradient(180deg, var(--accent), var(--accent-2));
    opacity:0; transition:opacity 0.25s ease;
  }
  .pq-plink:hover { background:var(--bg-problem-hover); transform:translateX(4px); }
  .pq-plink:hover::before { opacity:1; }
  .pq-pn {
    font-family:'Cascadia Code','Fira Code',Consolas,monospace;
    font-size:0.62rem; color:var(--text-3); font-weight:600;
    width:22px; text-align:center; flex-shrink:0;
  }
  .pq-pname { font-family:'Segoe UI',system-ui,sans-serif; font-size:0.82rem; font-weight:600; flex:1; }
  .pq-parr {
    color:var(--text-3); opacity:0; transform:translateX(-6px);
    transition:all 0.25s ease; font-size:0.76rem;
  }
  .pq-plink:hover .pq-parr { opacity:1; transform:translateX(0); color:var(--accent); }

  /* ─── FOOTER ─── */
  .pq-footer {
    position:relative; z-index:1;
    padding:2.5rem clamp(1.5rem,5vw,4rem);
    text-align:center; border-top:1px solid var(--border);
    font-family:'Segoe UI',system-ui,sans-serif;
    font-size:0.74rem; color:var(--text-3);
    transition:border-color 0.5s ease;
  }
  .pq-footer a { color:var(--accent); text-decoration:none; }

  @media(max-width:640px) {
    .pq-hero { min-height:auto; padding-top:85px; padding-bottom:2rem; }
    .pq-heap-svg { max-width:320px; }
    .pq-arr-cell { width:24px; height:24px; font-size:0.5rem; }
    .pq-info-grid { grid-template-columns:1fr 1fr; }
    .pq-tc-desc { display:none; }
    .pq-tc-hdr { padding:1rem 1.1rem; gap:10px; }
  }
`;

// ─── CHEVRON ─────────────────────────────────────────────────────
const Chev = () => (
  <svg
    className="pq-chev"
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="5 7.5 10 12.5 15 7.5" />
  </svg>
);

// ─── HEAP SVG VISUAL ─────────────────────────────────────────────
function HeapVisual({ activeIdx, visitedSet }) {
  return (
    <svg
      className="pq-heap-svg"
      viewBox="0 0 480 248"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Edges */}
      {HEAP_EDGES.map(([pi, ci]) => {
        const p = HEAP[pi],
          c = HEAP[ci];
        const isActive = visitedSet.has(pi) && visitedSet.has(ci);
        return (
          <line
            key={`e${pi}-${ci}`}
            className={`pq-edge${isActive ? " active" : ""}`}
            x1={p.x}
            y1={p.y}
            x2={c.x}
            y2={c.y}
          />
        );
      })}
      {/* Nodes */}
      {HEAP.map((node) => {
        const isActive = activeIdx === node.id;
        const isVisited = visitedSet.has(node.id) && !isActive;
        return (
          <g key={node.id}>
            {/* Pulse ring for active node */}
            <circle
              className={`pq-pulse-ring${isActive ? " active" : ""}`}
              cx={node.x}
              cy={node.y}
              r={16}
            />
            <circle
              className={`pq-node-c${isActive ? " active" : ""}${isVisited ? " visited" : ""}`}
              cx={node.x}
              cy={node.y}
              r={16}
            />
            <text className="pq-node-t" x={node.x} y={node.y}>
              {node.val}
            </text>
          </g>
        );
      })}
      {/* Min label at root */}
      <text
        x={240}
        y={10}
        textAnchor="middle"
        fill="var(--text-3)"
        fontFamily="'Cascadia Code','Fira Code',Consolas,monospace"
        fontSize="7"
        fontWeight="700"
        letterSpacing="0.08em"
        textTransform="uppercase"
      >
        MIN
      </text>
    </svg>
  );
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────
export default function PriorityQueuePage() {
  const [theme, setTheme] = useState("dark");
  const [openTech, setOpenTech] = useState(null);
  const [activeNode, setActiveNode] = useState(-1);
  const [visited, setVisited] = useState(new Set());
  const rootRef = useRef(null);

  // Apply CSS variables
  useEffect(() => {
    const vars = PAL[theme];
    const root = rootRef.current;
    if (!root) return;
    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
  }, [theme]);

  // Bubble-up animation: cycles through BUBBLE_PATH showing a value
  // rising from leaf to root, then resets
  useEffect(() => {
    let step = 0;
    let phase = 0; // 0 = bubble-up, 1 = pause/reset
    const visited_acc = new Set();

    const tick = () => {
      if (phase === 0) {
        if (step < BUBBLE_PATH.length) {
          const nid = BUBBLE_PATH[step];
          visited_acc.add(nid);
          setActiveNode(nid);
          setVisited(new Set(visited_acc));
          step++;
        } else {
          phase = 1;
          step = 0;
        }
      } else {
        // Reset after pause
        visited_acc.clear();
        setActiveNode(-1);
        setVisited(new Set());
        phase = 0;
      }
    };

    const id = setInterval(tick, 900);
    return () => clearInterval(id);
  }, []);

  const toggleTheme = useCallback(
    () => setTheme((t) => (t === "dark" ? "light" : "dark")),
    [],
  );
  const toggleTech = useCallback(
    (id) => setOpenTech((p) => (p === id ? null : id)),
    [],
  );

  return (
    <>
      <style>{css}</style>
      <div className="pq-root" ref={rootRef}>
        {/* ── TOPBAR ── */}
        <nav className="pq-topbar">
          <div className="pq-brand">
            <div className="pq-logo">DS</div>
            <span className="pq-ui">DSA Visualizer</span>
            <span className="pq-sep">/</span>
            <span className="pq-topic-lbl pq-ui">Priority Queues</span>
          </div>
          <div className="pq-actions">
            <button
              className="pq-back"
              onClick={() => (window.location.href = "index.html")}
            >
              ← Dashboard
            </button>
            <div
              className="pq-toggle"
              onClick={toggleTheme}
              role="button"
              tabIndex={0}
              onKeyDown={(e) =>
                (e.key === "Enter" || e.key === " ") && toggleTheme()
              }
              aria-label="Toggle theme"
            >
              <div className={`pq-knob${theme === "light" ? " on" : ""}`}>
                {theme === "dark" ? "🌙" : "☀️"}
              </div>
            </div>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section className="pq-hero">
          <div
            className="pq-hero-bg"
            style={{
              background:
                theme === "dark"
                  ? "radial-gradient(ellipse 65% 50% at 25% 22%, #140a22 0%, transparent 70%), radial-gradient(ellipse 55% 55% at 80% 72%, #0a1418 0%, transparent 60%), #07060e"
                  : "radial-gradient(ellipse 65% 50% at 25% 22%, #f0e8f8 0%, transparent 70%), radial-gradient(ellipse 55% 55% at 80% 72%, #e8f4f8 0%, transparent 60%), #f8f6fb",
            }}
          />
          <div
            className="pq-orb"
            style={{
              width: 440,
              height: 440,
              background: "var(--accent)",
              opacity: 0.06,
              top: "-10%",
              right: "-5%",
              animation: "orbDrift 18s ease-in-out infinite",
            }}
          />
          <div
            className="pq-orb"
            style={{
              width: 300,
              height: 300,
              background: "var(--accent-2)",
              opacity: 0.05,
              bottom: "-4%",
              left: "-3%",
              animation: "orbDrift 22s ease-in-out infinite reverse",
            }}
          />
          <div
            className="pq-orb"
            style={{
              width: 160,
              height: 160,
              background: "var(--accent-4)",
              opacity: 0.04,
              top: "50%",
              left: "48%",
              animation: "orbDrift 14s ease-in-out 2s infinite",
            }}
          />

          <div className="pq-hero-inner">
            <div className="pq-hero-text">
              <div className="pq-crumb">
                <span>DSA</span>
                <span className="s">›</span>
                <span>Data Structures</span>
                <span className="s">›</span>
                <span className="c">Priority Queues</span>
              </div>
              <h1 className="pq-h1 pq-ui">
                Priority
                <br />
                <span className="grad">Queues</span>
                <br />
                <span className="thin">& Binary Heaps</span>
              </h1>
              <p className="pq-desc">
                A priority queue serves elements by priority rather than arrival
                order, backed by a binary heap stored as a flat array. Insert
                and extract-min/max in O(log n), peek in O(1) — the workhorse
                behind Dijkstra, task scheduling, K-way merges, and median
                tracking.
              </p>
              <a href="priority-queue-visualizer.html" className="pq-cta">
                Open Visualizer <span className="ar">→</span>
              </a>
            </div>

            {/* Heap visual + array representation */}
            <div className="pq-heap-wrap">
              <div className="pq-heap-label pq-mono">
                Min-Heap · Bubble-Up Animation
              </div>
              <HeapVisual activeIdx={activeNode} visitedSet={visited} />

              {/* Flat array representation */}
              <div className="pq-heap-sub pq-mono">
                Array backing: parent(i) = ⌊(i−1)/2⌋
              </div>
              <div className="pq-arr-row">
                {HEAP.map((node) => (
                  <div
                    key={node.id}
                    className={`pq-arr-cell${activeNode === node.id ? " active" : ""}${visited.has(node.id) && activeNode !== node.id ? " visited" : ""}`}
                  >
                    {node.val}
                  </div>
                ))}
              </div>

              {/* Complexity chips */}
              <div className="pq-chips">
                {COMPLEXITIES.map((c, i) => (
                  <div className="pq-chip" key={i}>
                    <span className="op">{c.op}</span>
                    <span className={`v ${c.tier}`}>{c.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── INFO CARDS ── */}
        <div className="pq-info-strip">
          <div className="pq-info-grid">
            {INFO_CARDS.map((c, i) => (
              <div
                className="pq-icard"
                key={i}
                style={{
                  animation: `fadeUp 0.6s ease ${0.5 + i * 0.08}s both`,
                }}
              >
                <div className="pq-icard-icon">{c.icon}</div>
                <div className="pq-icard-title pq-ui">{c.title}</div>
                <div className="pq-icard-text">{c.text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── TECHNIQUES ── */}
        <section className="pq-section">
          <div className="pq-section-inner">
            <div
              style={{
                marginBottom: "0.5rem",
                animation: "fadeUp 0.6s ease both",
              }}
            >
              <div className="pq-eyebrow">Explore · {TOTAL} Problems</div>
              <h2 className="pq-sec-title pq-ui">
                Priority Queues Techniques & Patterns
              </h2>
              <p className="pq-sec-sub">
                Master these seven fundamental heap patterns to solve the full
                spectrum of priority-queue-based problems in interviews and
                competitions.
              </p>
            </div>

            <div className="pq-tlist">
              {TECHNIQUES.map((tech, ti) => {
                const isOpen = openTech === tech.id;
                return (
                  <div
                    className={`pq-tc${isOpen ? " open" : ""}`}
                    key={tech.id}
                    style={{
                      animation: `fadeUp 0.6s ease ${0.05 + ti * 0.06}s both`,
                    }}
                  >
                    <div
                      className="pq-tc-hdr"
                      onClick={() => toggleTech(tech.id)}
                    >
                      <div
                        className="pq-tc-icon"
                        style={{
                          background: `color-mix(in srgb, ${tech.accent} 10%, transparent)`,
                        }}
                      >
                        {tech.icon}
                      </div>
                      <div className="pq-tc-mid">
                        <div className="pq-tc-name pq-ui">{tech.title}</div>
                        <div className="pq-tc-desc">{tech.desc}</div>
                      </div>
                      <div className="pq-tc-cnt pq-mono">
                        {tech.problems.length}
                      </div>
                      <Chev />
                    </div>
                    <div className="pq-tc-body">
                      <div className="pq-tc-body-in">
                        <div className="pq-div" />
                        <div className="pq-pl">
                          {tech.problems.map((p, pi) => (
                            <a
                              key={pi}
                              href={`${p.slug}-visualizer.html`}
                              className="pq-plink"
                            >
                              <span className="pq-pn pq-mono">
                                {String(pi + 1).padStart(2, "0")}
                              </span>
                              <span className="pq-pname pq-ui">{p.name}</span>
                              <span className="pq-parr">→</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="pq-footer">
          DSA Visualizer Platform — Built for learners.{" "}
          <a href="index.html">Back to Dashboard</a>
        </footer>
      </div>
    </>
  );
}
