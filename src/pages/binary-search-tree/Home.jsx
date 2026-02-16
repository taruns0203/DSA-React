import { useState, useEffect, useRef, useCallback } from "react";
import { binarySearchTreeTechniques } from "../../data/binarySearchTreeTechniques";

/* ================================================================
   BINARY TREE & BST — DSA Visualizer Platform Topic Page

   Aesthetic: "Organic Botanical / Living Forest"
   - Deep moss-olive base with warm golden-amber accents
   - Animated SVG binary tree hero with BFS traversal glow
   - Glassmorphism technique accordions
   - Dark / Light theme with smooth CSS-variable transitions
   - 6 technique categories, ~40 total problems
   ================================================================ */

// ─── THEME PALETTES ──────────────────────────────────────────────
const PALETTES = {
  dark: {
    "--bg-root": "#080c08",
    "--bg-hero": "#0a100a",
    "--bg-section": "#0c120c",
    "--bg-card": "rgba(16, 26, 16, 0.6)",
    "--bg-card-hover": "rgba(22, 36, 22, 0.78)",
    "--bg-glass": "rgba(16, 28, 16, 0.48)",
    "--bg-tag": "rgba(202, 168, 62, 0.07)",
    "--bg-problem": "rgba(202, 168, 62, 0.025)",
    "--bg-problem-hover": "rgba(202, 168, 62, 0.06)",
    "--text-1": "#e2e8da",
    "--text-2": "#8a9a78",
    "--text-3": "#586848",
    "--accent": "#caa83e",
    "--accent-2": "#6ab04c",
    "--accent-3": "#e06050",
    "--accent-4": "#48b8d0",
    "--accent-5": "#c084fc",
    "--border": "rgba(202, 168, 62, 0.06)",
    "--border-card": "rgba(202, 168, 62, 0.09)",
    "--border-hover": "rgba(202, 168, 62, 0.22)",
    "--glow": "rgba(202, 168, 62, 0.05)",
    "--glow-strong": "rgba(202, 168, 62, 0.16)",
    "--shadow-card": "0 8px 44px rgba(0,0,0,0.38)",
    "--shadow-hover": "0 14px 52px rgba(202,168,62,0.06)",
    "--node-fill": "#141e14",
    "--node-stroke": "rgba(202, 168, 62, 0.3)",
    "--node-active-stroke": "#caa83e",
    "--node-active-fill": "rgba(202, 168, 62, 0.12)",
    "--node-text": "#caa83e",
    "--edge-color": "rgba(106, 176, 76, 0.18)",
    "--edge-active": "rgba(106, 176, 76, 0.55)",
    "--grid-line": "rgba(106, 176, 76, 0.018)",
    "--overlay": "rgba(8, 12, 8, 0.9)",
    "--good": "#6ab04c",
    "--mid": "#caa83e",
    "--bad": "#e06050",
  },
  light: {
    "--bg-root": "#f6f7f2",
    "--bg-hero": "#eff2ea",
    "--bg-section": "#f1f4ed",
    "--bg-card": "rgba(255, 255, 255, 0.72)",
    "--bg-card-hover": "rgba(255, 255, 255, 0.9)",
    "--bg-glass": "rgba(255, 255, 255, 0.58)",
    "--bg-tag": "rgba(140, 110, 20, 0.06)",
    "--bg-problem": "rgba(140, 110, 20, 0.025)",
    "--bg-problem-hover": "rgba(140, 110, 20, 0.06)",
    "--text-1": "#1a2414",
    "--text-2": "#5a7044",
    "--text-3": "#94a884",
    "--accent": "#9a7a10",
    "--accent-2": "#3a8a2a",
    "--accent-3": "#c03830",
    "--accent-4": "#1a8898",
    "--accent-5": "#8844cc",
    "--border": "rgba(140, 110, 20, 0.07)",
    "--border-card": "rgba(140, 110, 20, 0.1)",
    "--border-hover": "rgba(140, 110, 20, 0.26)",
    "--glow": "rgba(140, 110, 20, 0.035)",
    "--glow-strong": "rgba(140, 110, 20, 0.09)",
    "--shadow-card": "0 8px 44px rgba(20,30,10,0.06)",
    "--shadow-hover": "0 14px 52px rgba(140,110,20,0.05)",
    "--node-fill": "#ffffff",
    "--node-stroke": "rgba(140, 110, 20, 0.28)",
    "--node-active-stroke": "#9a7a10",
    "--node-active-fill": "rgba(140, 110, 20, 0.08)",
    "--node-text": "#9a7a10",
    "--edge-color": "rgba(58, 138, 42, 0.18)",
    "--edge-active": "rgba(58, 138, 42, 0.5)",
    "--grid-line": "rgba(58, 138, 42, 0.025)",
    "--overlay": "rgba(246, 247, 242, 0.92)",
    "--good": "#3a8a2a",
    "--mid": "#9a7a10",
    "--bad": "#c03830",
  },
};

// ─── TREE STRUCTURE FOR HERO SVG ─────────────────────────────────
// A balanced BST with 15 nodes, laid out as a complete binary tree
const TREE_NODES = [
  { id: 0, val: 40, x: 240, y: 32 },
  { id: 1, val: 20, x: 130, y: 90 },
  { id: 2, val: 60, x: 350, y: 90 },
  { id: 3, val: 10, x: 74, y: 148 },
  { id: 4, val: 30, x: 186, y: 148 },
  { id: 5, val: 50, x: 294, y: 148 },
  { id: 6, val: 70, x: 406, y: 148 },
  { id: 7, val: 5, x: 42, y: 206 },
  { id: 8, val: 15, x: 106, y: 206 },
  { id: 9, val: 25, x: 154, y: 206 },
  { id: 10, val: 35, x: 218, y: 206 },
  { id: 11, val: 45, x: 262, y: 206 },
  { id: 12, val: 55, x: 326, y: 206 },
  { id: 13, val: 65, x: 374, y: 206 },
  { id: 14, val: 75, x: 438, y: 206 },
];

const TREE_EDGES = [
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

// BFS order for traversal animation
const BFS_ORDER = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

// ─── TECHNIQUES DATA ─────────────────────────────────────────────
const TECHNIQUES = binarySearchTreeTechniques;

const COMPLEXITIES = [
  { op: "Search (BST)", val: "O(log n)", tier: "good" },
  { op: "Insert (BST)", val: "O(log n)", tier: "good" },
  { op: "Delete (BST)", val: "O(log n)", tier: "good" },
  { op: "Traversal", val: "O(n)", tier: "mid" },
  { op: "Search (BT)", val: "O(n)", tier: "bad" },
  { op: "Space", val: "O(n)", tier: "mid" },
];

const INFO_CARDS = [
  {
    icon: "🌳",
    title: "What is a Binary Tree?",
    text: "A hierarchical data structure where each node has at most two children — left and right. A BST adds the constraint that left < parent < right.",
  },
  {
    icon: "🧠",
    title: "Memory Model",
    text: "Nodes are heap-allocated objects linked by pointers. Each node stores a value and two references (left, right child). Null pointers mark leaf boundaries.",
  },
  {
    icon: "⚡",
    title: "When to Use",
    text: "BSTs for ordered data with O(log n) search/insert. Binary trees for hierarchical modelling, expression parsing, Huffman encoding, and divide-and-conquer recursion.",
  },
  {
    icon: "⚠️",
    title: "Trade-offs",
    text: "Unbalanced BSTs degrade to O(n). No cache locality compared to arrays. Self-balancing variants (AVL, Red-Black) add rotational complexity to maintain O(log n) guarantees.",
  },
];

const TOTAL_PROBLEMS = TECHNIQUES.reduce((s, t) => s + t.problems.length, 0);

// ─── STYLES ──────────────────────────────────────────────────────
const css = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes orbDrift {
    0%, 100% { transform: translate(0,0) scale(1); }
    33% { transform: translate(18px,-24px) scale(1.05); }
    66% { transform: translate(-14px,16px) scale(0.95); }
  }
  @keyframes nodeGlow {
    0%, 100% { filter: drop-shadow(0 0 0px transparent); }
    50% { filter: drop-shadow(0 0 10px var(--glow-strong)); }
  }
  @keyframes edgePulse {
    0% { stroke-dashoffset: 60; }
    100% { stroke-dashoffset: 0; }
  }
  @keyframes leafFall {
    0% { opacity: 0; transform: translateY(-8px) rotate(0deg); }
    50% { opacity: 0.6; }
    100% { opacity: 0; transform: translateY(14px) rotate(40deg); }
  }

  *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }

  .bt-root {
    font-family: Cambria, 'Hoefler Text', 'Liberation Serif', Georgia, serif;
    background: var(--bg-root);
    color: var(--text-1);
    min-height: 100vh;
    overflow-x: hidden;
    line-height: 1.65;
    transition: background 0.5s cubic-bezier(0.4,0,0.2,1), color 0.5s cubic-bezier(0.4,0,0.2,1);
    position: relative;
  }
  .bt-root::before {
    content: '';
    position: fixed; inset: 0;
    background:
      linear-gradient(var(--grid-line) 1px, transparent 1px),
      linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
    background-size: 50px 50px;
    pointer-events: none; z-index: 0;
  }

  .bt-ui { font-family: 'Segoe UI', system-ui, sans-serif; }
  .bt-mono { font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace; }

  /* ─── TOPBAR ─── */
  .bt-topbar {
    position:fixed; top:0; left:0; right:0; z-index:999;
    height:60px; display:flex; align-items:center; justify-content:space-between;
    padding:0 clamp(1rem,4vw,3rem);
    background:var(--overlay);
    backdrop-filter:blur(24px); -webkit-backdrop-filter:blur(24px);
    border-bottom:1px solid var(--border);
    transition:background 0.5s ease;
  }
  .bt-brand {
    display:flex; align-items:center; gap:10px;
    font-family:'Segoe UI',system-ui,sans-serif;
    font-weight:700; font-size:0.95rem; cursor:pointer;
  }
  .bt-logo {
    width:32px; height:32px; border-radius:8px;
    background:linear-gradient(135deg, var(--accent), var(--accent-2));
    display:grid; place-items:center;
    font-size:0.7rem; font-weight:800; color:#fff; position:relative;
  }
  .bt-logo::after {
    content:''; position:absolute; inset:0; border-radius:8px;
    background:linear-gradient(135deg,transparent 50%,rgba(255,255,255,0.15));
  }
  .bt-sep { color:var(--text-3); font-weight:300; margin:0 2px; }
  .bt-topic-lbl { color:var(--accent); }
  .bt-actions { display:flex; align-items:center; gap:14px; }
  .bt-back {
    display:flex; align-items:center; gap:5px;
    padding:5px 14px; border-radius:8px;
    background:var(--bg-glass); border:1px solid var(--border-card);
    color:var(--text-2); font-family:'Segoe UI',system-ui,sans-serif;
    font-size:0.78rem; font-weight:600; cursor:pointer;
    transition:all 0.3s ease;
  }
  .bt-back:hover { color:var(--text-1); border-color:var(--border-hover); }
  .bt-toggle {
    width:50px; height:26px; border-radius:20px;
    background:var(--bg-glass); border:1.5px solid var(--border-card);
    cursor:pointer; position:relative; transition:all 0.3s ease; flex-shrink:0;
  }
  .bt-toggle:hover { border-color:var(--border-hover); }
  .bt-knob {
    position:absolute; top:2px; left:2px;
    width:18px; height:18px; border-radius:50%;
    background:linear-gradient(135deg, var(--accent), var(--accent-2));
    transition:transform 0.4s cubic-bezier(0.34,1.56,0.64,1);
    display:grid; place-items:center; font-size:10px;
  }
  .bt-knob.on { transform:translateX(24px); }

  /* ─── HERO ─── */
  .bt-hero {
    position:relative; min-height:92vh;
    display:flex; align-items:center; justify-content:center;
    padding:100px clamp(1.5rem,5vw,4rem) 4rem;
    overflow:hidden;
  }
  .bt-hero-bg { position:absolute; inset:0; z-index:0; transition:background 0.5s ease; }
  .bt-orb {
    position:absolute; border-radius:50%; filter:blur(100px);
    pointer-events:none; z-index:1;
  }
  .bt-hero-inner {
    position:relative; z-index:2;
    max-width:1060px; width:100%;
    display:grid; grid-template-columns:1fr 1fr;
    gap:3rem; align-items:center;
  }
  @media(max-width:880px) {
    .bt-hero-inner { grid-template-columns:1fr; gap:2.5rem; }
    .bt-hero-text { text-align:center; align-items:center; }
  }
  .bt-hero-text {
    display:flex; flex-direction:column; align-items:flex-start; gap:1.1rem;
  }
  .bt-crumb {
    display:inline-flex; align-items:center; gap:6px;
    font-family:'Segoe UI',system-ui,sans-serif;
    font-size:0.7rem; font-weight:600;
    text-transform:uppercase; letter-spacing:0.14em;
    color:var(--text-3); animation:fadeUp 0.7s ease both;
  }
  .bt-crumb .s { opacity:0.4; }
  .bt-crumb .c { color:var(--accent); }
  .bt-title {
    font-family:'Segoe UI',system-ui,sans-serif;
    font-size:clamp(2.2rem,5vw,3.6rem);
    font-weight:800; letter-spacing:-0.04em; line-height:1.08;
    animation:fadeUp 0.7s ease 0.08s both;
  }
  .bt-title .amp {
    background:linear-gradient(135deg, var(--accent), var(--accent-2));
    -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
  }
  .bt-title .thin { font-weight:300; color:var(--text-2); }
  .bt-desc {
    font-size:clamp(0.9rem,1.6vw,1.02rem);
    color:var(--text-2); line-height:1.78; max-width:460px;
    animation:fadeUp 0.7s ease 0.16s both;
  }
  .bt-cta {
    display:inline-flex; align-items:center; gap:10px;
    padding:14px 34px; border-radius:14px;
    background:linear-gradient(135deg, var(--accent), var(--accent-2));
    color:#fff; font-family:'Segoe UI',system-ui,sans-serif;
    font-weight:700; font-size:0.95rem;
    border:none; cursor:pointer; position:relative; overflow:hidden;
    transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease;
    animation:fadeUp 0.7s ease 0.28s both; text-decoration:none;
  }
  .bt-cta::before {
    content:''; position:absolute; inset:0;
    background:linear-gradient(135deg,transparent 40%,rgba(255,255,255,0.14));
  }
  .bt-cta:hover {
    transform:translateY(-3px) scale(1.02);
    box-shadow:0 10px 44px rgba(202,168,62,0.18);
  }
  .bt-cta .ar { transition:transform 0.3s ease; }
  .bt-cta:hover .ar { transform:translateX(5px); }

  /* ─── SVG TREE ─── */
  .bt-tree-wrap {
    display:flex; flex-direction:column; align-items:center; gap:0.6rem;
    animation:fadeUp 0.8s ease 0.25s both;
  }
  .bt-tree-label {
    font-family:'Cascadia Code','Fira Code',Consolas,monospace;
    font-size:0.6rem; color:var(--text-3);
    text-transform:uppercase; letter-spacing:0.14em;
  }
  .bt-tree-svg {
    width:100%; max-width:480px; height:auto;
  }
  .bt-tree-edge {
    stroke:var(--edge-color);
    stroke-width:1.5;
    fill:none;
    transition:stroke 0.4s ease;
  }
  .bt-tree-edge.active {
    stroke:var(--edge-active);
    stroke-width:2.2;
  }
  .bt-tree-node-circle {
    fill:var(--node-fill);
    stroke:var(--node-stroke);
    stroke-width:1.8;
    transition:all 0.4s ease;
  }
  .bt-tree-node-circle.active {
    fill:var(--node-active-fill);
    stroke:var(--node-active-stroke);
    stroke-width:2.4;
    filter:drop-shadow(0 0 8px var(--glow-strong));
  }
  .bt-tree-node-circle.visited {
    fill:var(--node-active-fill);
    stroke:var(--accent-2);
    stroke-width:2;
    opacity:0.7;
  }
  .bt-tree-node-text {
    fill:var(--node-text);
    font-family:'Cascadia Code','Fira Code',Consolas,monospace;
    font-size:10px;
    font-weight:700;
    text-anchor:middle;
    dominant-baseline:central;
    pointer-events:none;
    transition:fill 0.4s ease;
  }

  /* Complexity chips */
  .bt-chips {
    display:flex; flex-wrap:wrap; gap:5px; justify-content:center;
    animation:fadeUp 0.7s ease 0.5s both; margin-top:0.5rem;
  }
  .bt-chip {
    display:flex; align-items:center; gap:4px;
    padding:3px 10px; border-radius:18px;
    background:var(--bg-glass); border:1px solid var(--border-card);
    font-family:'Cascadia Code','Fira Code',Consolas,monospace;
    font-size:0.58rem; font-weight:600;
    backdrop-filter:blur(8px);
    transition:background 0.5s ease, border-color 0.5s ease;
  }
  .bt-chip .op { color:var(--text-3); text-transform:uppercase; letter-spacing:0.05em; }
  .bt-chip .v { font-weight:700; }
  .bt-chip .v.good { color:var(--good); }
  .bt-chip .v.mid { color:var(--mid); }
  .bt-chip .v.bad { color:var(--bad); }

  /* ─── INFO STRIP ─── */
  .bt-info-strip { position:relative; z-index:1; padding:0 clamp(1.5rem,5vw,4rem); }
  .bt-info-grid {
    max-width:980px; margin:-2rem auto 0;
    display:grid; grid-template-columns:repeat(auto-fit, minmax(210px, 1fr)); gap:1rem;
  }
  .bt-info-card {
    background:var(--bg-card);
    backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px);
    border:1px solid var(--border-card); border-radius:14px;
    padding:1.2rem 1.3rem; transition:all 0.35s ease;
  }
  .bt-info-card:hover {
    border-color:var(--border-hover); box-shadow:var(--shadow-hover); transform:translateY(-2px);
  }
  .bt-ic-icon { font-size:1.3rem; margin-bottom:0.5rem; }
  .bt-ic-title { font-family:'Segoe UI',system-ui,sans-serif; font-size:0.8rem; font-weight:700; margin-bottom:0.2rem; }
  .bt-ic-text { font-size:0.76rem; color:var(--text-2); line-height:1.55; }

  /* ─── SECTION ─── */
  .bt-section { padding:5rem clamp(1.5rem,5vw,4rem); position:relative; z-index:1; }
  .bt-section-inner { max-width:980px; margin:0 auto; }
  .bt-eyebrow {
    font-family:'Segoe UI',system-ui,sans-serif;
    font-size:0.68rem; font-weight:700; text-transform:uppercase;
    letter-spacing:0.16em; color:var(--accent); margin-bottom:0.5rem;
  }
  .bt-sec-title {
    font-family:'Segoe UI',system-ui,sans-serif;
    font-size:clamp(1.3rem,3.5vw,1.85rem);
    font-weight:800; letter-spacing:-0.03em;
  }
  .bt-sec-sub { color:var(--text-2); font-size:0.9rem; margin-top:0.4rem; max-width:600px; }

  /* ─── TECHNIQUE CARDS ─── */
  .bt-tech-list { display:flex; flex-direction:column; gap:0.9rem; margin-top:2.5rem; }
  .bt-tc {
    background:var(--bg-card);
    border:1px solid var(--border-card); border-radius:14px;
    backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px);
    overflow:hidden;
    transition:background 0.5s ease, border-color 0.3s ease, box-shadow 0.3s ease;
  }
  .bt-tc:hover, .bt-tc.open { border-color:var(--border-hover); box-shadow:var(--shadow-hover); }
  .bt-tc-hdr {
    display:flex; align-items:center; gap:14px;
    padding:1.15rem 1.4rem; cursor:pointer; user-select:none;
    transition:background 0.25s ease;
  }
  .bt-tc-hdr:hover { background:var(--glow); }
  .bt-tc-icon {
    width:42px; height:42px; border-radius:10px;
    display:grid; place-items:center; font-size:1.05rem; flex-shrink:0;
    transition:transform 0.35s cubic-bezier(0.34,1.56,0.64,1);
  }
  .bt-tc:hover .bt-tc-icon, .bt-tc.open .bt-tc-icon { transform:scale(1.08) rotate(-4deg); }
  .bt-tc-mid { flex:1; min-width:0; }
  .bt-tc-name { font-family:'Segoe UI',system-ui,sans-serif; font-size:0.98rem; font-weight:700; }
  .bt-tc-desc { font-size:0.76rem; color:var(--text-2); margin-top:2px; line-height:1.5; }
  .bt-tc-cnt {
    font-family:'Cascadia Code','Fira Code',Consolas,monospace;
    font-size:0.62rem; color:var(--text-3);
    padding:3px 9px; border-radius:20px; background:var(--bg-tag);
    flex-shrink:0; white-space:nowrap;
  }
  .bt-chev {
    width:18px; height:18px; flex-shrink:0;
    transition:transform 0.4s cubic-bezier(0.34,1.56,0.64,1), color 0.3s ease;
    color:var(--text-3);
  }
  .bt-tc.open .bt-chev { transform:rotate(180deg); color:var(--accent); }
  .bt-tc-body { max-height:0; overflow:hidden; transition:max-height 0.5s cubic-bezier(0.4,0,0.2,1); }
  .bt-tc.open .bt-tc-body { max-height:900px; }
  .bt-tc-body-in {
    padding:0 1.4rem 1.3rem; opacity:0; transform:translateY(-8px);
    transition:opacity 0.35s ease 0.1s, transform 0.35s ease 0.1s;
  }
  .bt-tc.open .bt-tc-body-in { opacity:1; transform:translateY(0); }
  .bt-div { height:1px; background:var(--border); margin-bottom:0.7rem; }
  .bt-pl { display:flex; flex-direction:column; gap:3px; }
  .bt-plink {
    display:flex; align-items:center; gap:10px;
    padding:8px 14px; border-radius:8px;
    background:var(--bg-problem);
    transition:all 0.25s ease; cursor:pointer;
    text-decoration:none; color:var(--text-1);
    position:relative; overflow:hidden;
  }
  .bt-plink::before {
    content:''; position:absolute; left:0; top:0; bottom:0;
    width:3px; background:linear-gradient(180deg, var(--accent), var(--accent-2));
    opacity:0; transition:opacity 0.25s ease;
  }
  .bt-plink:hover { background:var(--bg-problem-hover); transform:translateX(4px); }
  .bt-plink:hover::before { opacity:1; }
  .bt-pn {
    font-family:'Cascadia Code','Fira Code',Consolas,monospace;
    font-size:0.62rem; color:var(--text-3); font-weight:600;
    width:22px; text-align:center; flex-shrink:0;
  }
  .bt-pname { font-family:'Segoe UI',system-ui,sans-serif; font-size:0.82rem; font-weight:600; flex:1; }
  .bt-parr {
    color:var(--text-3); opacity:0; transform:translateX(-6px);
    transition:all 0.25s ease; font-family:'Segoe UI',system-ui,sans-serif; font-size:0.76rem;
  }
  .bt-plink:hover .bt-parr { opacity:1; transform:translateX(0); color:var(--accent); }

  /* ─── FOOTER ─── */
  .bt-footer {
    position:relative; z-index:1;
    padding:2.5rem clamp(1.5rem,5vw,4rem);
    text-align:center; border-top:1px solid var(--border);
    font-family:'Segoe UI',system-ui,sans-serif;
    font-size:0.74rem; color:var(--text-3);
    transition:border-color 0.5s ease;
  }
  .bt-footer a { color:var(--accent); text-decoration:none; }

  @media(max-width:640px) {
    .bt-hero { min-height:auto; padding-top:85px; padding-bottom:2rem; }
    .bt-tree-svg { max-width:320px; }
    .bt-info-grid { grid-template-columns:1fr 1fr; }
    .bt-tc-desc { display:none; }
    .bt-tc-hdr { padding:1rem 1.1rem; gap:10px; }
  }
`;

// ─── CHEVRON ─────────────────────────────────────────────────────
const Chev = () => (
  <svg
    className="bt-chev"
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

// ─── ANIMATED SVG TREE ───────────────────────────────────────────
function TreeVisual({ activeIdx, visitedSet }) {
  return (
    <svg
      className="bt-tree-svg"
      viewBox="0 0 480 240"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Edges */}
      {TREE_EDGES.map(([pIdx, cIdx]) => {
        const p = TREE_NODES[pIdx];
        const c = TREE_NODES[cIdx];
        const isActive =
          activeIdx === pIdx ||
          activeIdx === cIdx ||
          (visitedSet.has(pIdx) && visitedSet.has(cIdx));
        return (
          <line
            key={`${pIdx}-${cIdx}`}
            className={`bt-tree-edge ${isActive ? "active" : ""}`}
            x1={p.x}
            y1={p.y}
            x2={c.x}
            y2={c.y}
          />
        );
      })}
      {/* Nodes */}
      {TREE_NODES.map((node) => {
        const isActive = activeIdx === node.id;
        const isVisited = visitedSet.has(node.id) && !isActive;
        return (
          <g key={node.id}>
            <circle
              className={`bt-tree-node-circle ${isActive ? "active" : ""} ${isVisited ? "visited" : ""}`}
              cx={node.x}
              cy={node.y}
              r={16}
            />
            <text className="bt-tree-node-text" x={node.x} y={node.y}>
              {node.val}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────
export default function BinaryTreeBSTPage() {
  const [theme, setTheme] = useState("dark");
  const [openTech, setOpenTech] = useState(null);
  const [activeNode, setActiveNode] = useState(-1);
  const [visited, setVisited] = useState(new Set());
  const rootRef = useRef(null);
  const animRef = useRef(null);

  // Apply theme CSS variables
  useEffect(() => {
    const vars = PALETTES[theme];
    const root = rootRef.current;
    if (!root) return;
    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
  }, [theme]);

  // BFS traversal animation cycling through the tree
  useEffect(() => {
    let step = 0;
    const tick = () => {
      if (step < BFS_ORDER.length) {
        const nodeId = BFS_ORDER[step];
        setActiveNode(nodeId);
        setVisited((prev) => {
          const next = new Set(prev);
          next.add(nodeId);
          return next;
        });
        step++;
      } else {
        // Reset after a pause
        step = 0;
        setActiveNode(-1);
        setVisited(new Set());
      }
    };
    animRef.current = setInterval(tick, 700);
    return () => clearInterval(animRef.current);
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
      <div className="bt-root" ref={rootRef}>
        {/* ── TOPBAR ── */}
        <nav className="bt-topbar">
          <div className="bt-brand">
            <div className="bt-logo">DS</div>
            <span className="bt-ui">DSA Visualizer</span>
            <span className="bt-sep">/</span>
            <span className="bt-topic-lbl bt-ui">Binary Tree & BST</span>
          </div>
          <div className="bt-actions">
            <button
              className="bt-back"
              onClick={() => (window.location.href = "index.html")}
            >
              ← Dashboard
            </button>
            <div
              className="bt-toggle"
              onClick={toggleTheme}
              role="button"
              tabIndex={0}
              onKeyDown={(e) =>
                (e.key === "Enter" || e.key === " ") && toggleTheme()
              }
              aria-label="Toggle theme"
            >
              <div className={`bt-knob ${theme === "light" ? "on" : ""}`}>
                {theme === "dark" ? "🌙" : "☀️"}
              </div>
            </div>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section className="bt-hero">
          <div
            className="bt-hero-bg"
            style={{
              background:
                theme === "dark"
                  ? "radial-gradient(ellipse 65% 50% at 28% 22%, #141e0e 0%, transparent 70%), radial-gradient(ellipse 55% 55% at 78% 72%, #1a1808 0%, transparent 60%), #080c08"
                  : "radial-gradient(ellipse 65% 50% at 28% 22%, #e4ecd6 0%, transparent 70%), radial-gradient(ellipse 55% 55% at 78% 72%, #f4f0e0 0%, transparent 60%), #f6f7f2",
            }}
          />
          <div
            className="bt-orb"
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
            className="bt-orb"
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
            className="bt-orb"
            style={{
              width: 160,
              height: 160,
              background: "var(--accent-5)",
              opacity: 0.04,
              top: "50%",
              left: "48%",
              animation: "orbDrift 14s ease-in-out 2s infinite",
            }}
          />

          <div className="bt-hero-inner">
            <div className="bt-hero-text">
              <div className="bt-crumb">
                <span>DSA</span>
                <span className="s">›</span>
                <span>Data Structures</span>
                <span className="s">›</span>
                <span className="c">Binary Tree & BST</span>
              </div>
              <h1 className="bt-title bt-ui">
                Binary Tree
                <br />
                <span className="amp">&</span> BST
                <br />
                <span className="thin">Fundamentals</span>
              </h1>
              <p className="bt-desc">
                Hierarchical structures where each node branches into at most
                two children. Binary Trees model recursive decomposition; Binary
                Search Trees add the ordering invariant left &lt; parent &lt;
                right for O(log n) search, insert, and delete — the foundation
                of balanced trees, heaps, and segment trees.
              </p>
              <a href="binary-tree-bst-visualizer.html" className="bt-cta">
                Open Visualizer <span className="ar">→</span>
              </a>
            </div>

            {/* Animated SVG Tree */}
            <div className="bt-tree-wrap">
              <div className="bt-tree-label bt-mono">
                BST · Level-Order Traversal
              </div>
              <TreeVisual activeIdx={activeNode} visitedSet={visited} />
              <div className="bt-chips">
                {COMPLEXITIES.map((c, i) => (
                  <div className="bt-chip" key={i}>
                    <span className="op">{c.op}</span>
                    <span className={`v ${c.tier}`}>{c.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── INFO CARDS ── */}
        <div className="bt-info-strip">
          <div className="bt-info-grid">
            {INFO_CARDS.map((c, i) => (
              <div
                className="bt-info-card"
                key={i}
                style={{
                  animation: `fadeUp 0.6s ease ${0.5 + i * 0.08}s both`,
                }}
              >
                <div className="bt-ic-icon">{c.icon}</div>
                <div className="bt-ic-title bt-ui">{c.title}</div>
                <div className="bt-ic-text">{c.text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── TECHNIQUES ── */}
        <section className="bt-section">
          <div className="bt-section-inner">
            <div
              style={{
                marginBottom: "0.5rem",
                animation: "fadeUp 0.6s ease both",
              }}
            >
              <div className="bt-eyebrow">
                Explore · {TOTAL_PROBLEMS} Problems
              </div>
              <h2 className="bt-sec-title bt-ui">
                Binary Tree & BST Techniques & Patterns
              </h2>
              <p className="bt-sec-sub">
                Master these six fundamental patterns to solve the full range of
                tree-based interview and competitive programming problems.
              </p>
            </div>

            <div className="bt-tech-list">
              {TECHNIQUES.map((tech, ti) => {
                const isOpen = openTech === tech.id;
                return (
                  <div
                    className={`bt-tc ${isOpen ? "open" : ""}`}
                    key={tech.id}
                    style={{
                      animation: `fadeUp 0.6s ease ${0.05 + ti * 0.06}s both`,
                    }}
                  >
                    <div
                      className="bt-tc-hdr"
                      onClick={() => toggleTech(tech.id)}
                    >
                      <div
                        className="bt-tc-icon"
                        style={{
                          background: `color-mix(in srgb, ${tech.accent} 10%, transparent)`,
                        }}
                      >
                        {tech.icon}
                      </div>
                      <div className="bt-tc-mid">
                        <div className="bt-tc-name bt-ui">{tech.title}</div>
                        <div className="bt-tc-desc">{tech.desc}</div>
                      </div>
                      <div className="bt-tc-cnt bt-mono">
                        {tech.problems.length}
                      </div>
                      <Chev />
                    </div>
                    <div className="bt-tc-body">
                      <div className="bt-tc-body-in">
                        <div className="bt-div" />
                        <div className="bt-pl">
                          {tech.problems.map((p, pi) => (
                            <a
                              key={pi}
                              href={p.href || `${p.slug}-visualizer.html`}
                              className="bt-plink"
                            >
                              <span className="bt-pn bt-mono">
                                {String(pi + 1).padStart(2, "0")}
                              </span>
                              <span className="bt-pname bt-ui">{p.name}</span>
                              <span className="bt-parr">→</span>
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
        <footer className="bt-footer">
          DSA Visualizer Platform — Built for learners.{" "}
          <a href="index.html">Back to Dashboard</a>
        </footer>
      </div>
    </>
  );
}
