import { useState, useEffect, useRef, useCallback } from "react";
import { graphTechniques } from "../../data/graphTechniques";
import { Link } from "react-router-dom";

/* ================================================================
   GRAPH — DSA Visualizer Platform Topic Page

   Aesthetic: "Constellation / Star Map"
   - Deep space-navy base with electric white-blue & warm nebula
   - Animated SVG graph with live BFS wave traversal
   - Glassmorphism technique accordions (7 categories)
   - Dark / Light theme with smooth CSS-variable transitions
   ================================================================ */

// ─── THEME PALETTES ──────────────────────────────────────────────
const PAL = {
  dark: {
    "--bg-root": "#05060c",
    "--bg-hero": "#070814",
    "--bg-section": "#080a16",
    "--bg-card": "rgba(12, 16, 36, 0.6)",
    "--bg-card-hover": "rgba(18, 24, 52, 0.78)",
    "--bg-glass": "rgba(12, 18, 40, 0.48)",
    "--bg-tag": "rgba(96, 165, 250, 0.07)",
    "--bg-problem": "rgba(96, 165, 250, 0.02)",
    "--bg-problem-hover": "rgba(96, 165, 250, 0.055)",
    "--text-1": "#dce4f8",
    "--text-2": "#7888b0",
    "--text-3": "#4a5678",
    "--accent": "#60a5fa",
    "--accent-2": "#f472b6",
    "--accent-3": "#facc15",
    "--accent-4": "#34d399",
    "--accent-5": "#a78bfa",
    "--accent-6": "#fb923c",
    "--border": "rgba(96, 165, 250, 0.06)",
    "--border-card": "rgba(96, 165, 250, 0.09)",
    "--border-hover": "rgba(96, 165, 250, 0.24)",
    "--glow": "rgba(96, 165, 250, 0.04)",
    "--glow-strong": "rgba(96, 165, 250, 0.18)",
    "--shadow-card": "0 8px 44px rgba(0,0,0,0.42)",
    "--shadow-hover": "0 14px 52px rgba(96,165,250,0.06)",
    "--node-fill": "#0c1024",
    "--node-stroke": "rgba(96, 165, 250, 0.3)",
    "--node-active-fill": "rgba(96, 165, 250, 0.18)",
    "--node-active-stroke": "#60a5fa",
    "--node-visited-fill": "rgba(244, 114, 182, 0.1)",
    "--node-visited-stroke": "#f472b6",
    "--node-text": "#60a5fa",
    "--edge-color": "rgba(96, 165, 250, 0.1)",
    "--edge-active": "rgba(96, 165, 250, 0.5)",
    "--edge-visited": "rgba(244, 114, 182, 0.3)",
    "--grid-line": "rgba(96, 165, 250, 0.012)",
    "--overlay": "rgba(5, 6, 12, 0.92)",
    "--good": "#34d399",
    "--mid": "#facc15",
    "--bad": "#f87171",
    "--star-color": "rgba(96, 165, 250, 0.08)",
  },
  light: {
    "--bg-root": "#f5f7fc",
    "--bg-hero": "#ecf0fa",
    "--bg-section": "#eef2fb",
    "--bg-card": "rgba(255,255,255,0.72)",
    "--bg-card-hover": "rgba(255,255,255,0.9)",
    "--bg-glass": "rgba(255,255,255,0.58)",
    "--bg-tag": "rgba(37, 99, 235, 0.06)",
    "--bg-problem": "rgba(37, 99, 235, 0.02)",
    "--bg-problem-hover": "rgba(37, 99, 235, 0.05)",
    "--text-1": "#111827",
    "--text-2": "#4b5e80",
    "--text-3": "#94a3b8",
    "--accent": "#2563eb",
    "--accent-2": "#db2777",
    "--accent-3": "#ca8a04",
    "--accent-4": "#059669",
    "--accent-5": "#7c3aed",
    "--accent-6": "#ea580c",
    "--border": "rgba(37, 99, 235, 0.07)",
    "--border-card": "rgba(37, 99, 235, 0.1)",
    "--border-hover": "rgba(37, 99, 235, 0.26)",
    "--glow": "rgba(37, 99, 235, 0.03)",
    "--glow-strong": "rgba(37, 99, 235, 0.08)",
    "--shadow-card": "0 8px 44px rgba(10,15,30,0.05)",
    "--shadow-hover": "0 14px 52px rgba(37,99,235,0.04)",
    "--node-fill": "#ffffff",
    "--node-stroke": "rgba(37, 99, 235, 0.25)",
    "--node-active-fill": "rgba(37, 99, 235, 0.1)",
    "--node-active-stroke": "#2563eb",
    "--node-visited-fill": "rgba(219, 39, 119, 0.08)",
    "--node-visited-stroke": "#db2777",
    "--node-text": "#2563eb",
    "--edge-color": "rgba(37, 99, 235, 0.1)",
    "--edge-active": "rgba(37, 99, 235, 0.45)",
    "--edge-visited": "rgba(219, 39, 119, 0.25)",
    "--grid-line": "rgba(37, 99, 235, 0.018)",
    "--overlay": "rgba(245, 247, 252, 0.92)",
    "--good": "#059669",
    "--mid": "#ca8a04",
    "--bad": "#dc2626",
    "--star-color": "rgba(37, 99, 235, 0.04)",
  },
};

// ─── GRAPH STRUCTURE FOR HERO ────────────────────────────────────
// An interesting undirected graph with 10 nodes
const NODES = [
  { id: 0, label: "A", x: 240, y: 30 },
  { id: 1, label: "B", x: 120, y: 90 },
  { id: 2, label: "C", x: 360, y: 80 },
  { id: 3, label: "D", x: 56, y: 170 },
  { id: 4, label: "E", x: 180, y: 175 },
  { id: 5, label: "F", x: 310, y: 165 },
  { id: 6, label: "G", x: 424, y: 155 },
  { id: 7, label: "H", x: 100, y: 248 },
  { id: 8, label: "I", x: 250, y: 252 },
  { id: 9, label: "J", x: 390, y: 240 },
];

const EDGES = [
  [0, 1],
  [0, 2],
  [1, 3],
  [1, 4],
  [2, 5],
  [2, 6],
  [3, 7],
  [4, 5],
  [4, 8],
  [5, 9],
  [6, 9],
  [7, 8],
  [8, 9],
];

// Adjacency list for BFS
const ADJ = {};
NODES.forEach((n) => (ADJ[n.id] = []));
EDGES.forEach(([u, v]) => {
  ADJ[u].push(v);
  ADJ[v].push(u);
});

// BFS order starting from node 0
function bfsOrder(start) {
  const visited = new Set();
  const queue = [start];
  const order = [];
  const edgeOrder = [];
  visited.add(start);
  while (queue.length > 0) {
    const cur = queue.shift();
    order.push(cur);
    for (const nb of ADJ[cur]) {
      if (!visited.has(nb)) {
        visited.add(nb);
        queue.push(nb);
        edgeOrder.push([cur, nb]);
      }
    }
  }
  return { order, edgeOrder };
}
const BFS = bfsOrder(0);

// ─── TECHNIQUES DATA (GRAPH-SPECIFIC) ───────────────────────────
const TECHNIQUES = graphTechniques;

const COMPLEXITIES = [
  { op: "BFS / DFS", val: "O(V+E)", tier: "good" },
  { op: "Dijkstra", val: "O((V+E)logV)", tier: "mid" },
  { op: "Topo Sort", val: "O(V+E)", tier: "good" },
  { op: "Union-Find", val: "~O(α(n))", tier: "good" },
  { op: "Adj. List Space", val: "O(V+E)", tier: "mid" },
  { op: "Adj. Matrix Space", val: "O(V²)", tier: "bad" },
];

const INFO_CARDS = [
  {
    icon: "🕸️",
    title: "What is a Graph?",
    text: "A set of vertices (nodes) connected by edges. Graphs can be directed or undirected, weighted or unweighted, cyclic or acyclic — the most general relational data structure.",
  },
  {
    icon: "🧠",
    title: "Representations",
    text: "Adjacency list (array of neighbours) for sparse graphs, adjacency matrix (V×V grid) for dense graphs, or edge list for algorithms like Kruskal's MST.",
  },
  {
    icon: "⚡",
    title: "When to Use",
    text: "Social networks, road maps, dependency resolution, network routing, web crawling, recommendation engines — any problem with entities and relationships.",
  },
  {
    icon: "⚠️",
    title: "Trade-offs",
    text: "Adjacency matrices waste space on sparse graphs. Many problems are NP-hard (TSP, graph colouring). Choosing BFS vs DFS vs Dijkstra depends on edge weights and goals.",
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
  @keyframes starTwinkle {
    0%,100% { opacity:0.2; }
    50% { opacity:0.8; }
  }
  @keyframes ringPulse {
    0% { r:18; opacity:0.6; }
    100% { r:32; opacity:0; }
  }
  @keyframes edgeTravel {
    0% { stroke-dashoffset:20; }
    100% { stroke-dashoffset:0; }
  }
  @keyframes wavePulse {
    0%,100% { transform:scale(1); opacity:1; }
    50% { transform:scale(1.12); opacity:0.85; }
  }

  *,*::before,*::after { margin:0; padding:0; box-sizing:border-box; }

  .gr-root {
    font-family: 'Garamond', 'EB Garamond', 'Baskerville', 'Times New Roman', serif;
    background:var(--bg-root);
    color:var(--text-1);
    min-height:100vh;
    overflow-x:hidden;
    line-height:1.65;
    transition:background 0.5s cubic-bezier(0.4,0,0.2,1), color 0.5s cubic-bezier(0.4,0,0.2,1);
    position:relative;
  }
  .gr-root::before {
    content:'';
    position:fixed; inset:0;
    background:
      radial-gradient(circle 1px at 15% 25%, var(--star-color) 1px, transparent 1px),
      radial-gradient(circle 1px at 45% 12%, var(--star-color) 1px, transparent 1px),
      radial-gradient(circle 1px at 78% 35%, var(--star-color) 1px, transparent 1px),
      radial-gradient(circle 1px at 92% 68%, var(--star-color) 1px, transparent 1px),
      radial-gradient(circle 1px at 28% 72%, var(--star-color) 1px, transparent 1px),
      radial-gradient(circle 1px at 65% 85%, var(--star-color) 1px, transparent 1px),
      radial-gradient(circle 1px at 8% 90%, var(--star-color) 1px, transparent 1px),
      radial-gradient(circle 1px at 55% 55%, var(--star-color) 1px, transparent 1px),
      radial-gradient(circle 1.5px at 35% 42%, var(--star-color) 1.5px, transparent 1.5px),
      radial-gradient(circle 1.5px at 82% 18%, var(--star-color) 1.5px, transparent 1.5px),
      linear-gradient(var(--grid-line) 1px, transparent 1px),
      linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
    background-size:100% 100%,100% 100%,100% 100%,100% 100%,100% 100%,100% 100%,100% 100%,100% 100%,100% 100%,100% 100%,52px 52px,52px 52px;
    pointer-events:none; z-index:0;
  }

  .gr-ui { font-family:'Segoe UI',system-ui,sans-serif; }
  .gr-mono { font-family:'Cascadia Code','Fira Code',Consolas,monospace; }

  /* ─── TOPBAR ─── */
  .gr-topbar {
    position:fixed; top:0; left:0; right:0; z-index:999;
    height:60px; display:flex; align-items:center; justify-content:space-between;
    padding:0 clamp(1rem,4vw,3rem);
    background:var(--overlay);
    backdrop-filter:blur(24px); -webkit-backdrop-filter:blur(24px);
    border-bottom:1px solid var(--border);
    transition:background 0.5s ease;
  }
  .gr-brand {
    display:flex; align-items:center; gap:10px;
    font-family:'Segoe UI',system-ui,sans-serif;
    font-weight:700; font-size:0.95rem; cursor:pointer;
  }
  .gr-logo {
    width:32px; height:32px; border-radius:8px;
    background:linear-gradient(135deg, var(--accent), var(--accent-2));
    display:grid; place-items:center;
    font-size:0.7rem; font-weight:800; color:#fff; position:relative;
  }
  .gr-logo::after {
    content:''; position:absolute; inset:0; border-radius:8px;
    background:linear-gradient(135deg,transparent 50%,rgba(255,255,255,0.15));
  }
  .gr-sep { color:var(--text-3); font-weight:300; margin:0 2px; }
  .gr-topic-lbl { color:var(--accent); }
  .gr-actions { display:flex; align-items:center; gap:14px; }
  .gr-back {
    display:flex; align-items:center; gap:5px;
    padding:5px 14px; border-radius:8px;
    background:var(--bg-glass); border:1px solid var(--border-card);
    color:var(--text-2); font-family:'Segoe UI',system-ui,sans-serif;
    font-size:0.78rem; font-weight:600; cursor:pointer; transition:all 0.3s ease;
  }
  .gr-back:hover { color:var(--text-1); border-color:var(--border-hover); }
  .gr-toggle {
    width:50px; height:26px; border-radius:20px;
    background:var(--bg-glass); border:1.5px solid var(--border-card);
    cursor:pointer; position:relative; transition:all 0.3s ease; flex-shrink:0;
  }
  .gr-toggle:hover { border-color:var(--border-hover); }
  .gr-knob {
    position:absolute; top:2px; left:2px;
    width:18px; height:18px; border-radius:50%;
    background:linear-gradient(135deg, var(--accent), var(--accent-2));
    transition:transform 0.4s cubic-bezier(0.34,1.56,0.64,1);
    display:grid; place-items:center; font-size:10px;
  }
  .gr-knob.on { transform:translateX(24px); }

  /* ─── HERO ─── */
  .gr-hero {
    position:relative; min-height:92vh;
    display:flex; align-items:center; justify-content:center;
    padding:100px clamp(1.5rem,5vw,4rem) 4rem;
    overflow:hidden;
  }
  .gr-hero-bg { position:absolute; inset:0; z-index:0; transition:background 0.5s ease; }
  .gr-orb { position:absolute; border-radius:50%; filter:blur(100px); pointer-events:none; z-index:1; }
  .gr-hero-inner {
    position:relative; z-index:2;
    max-width:1060px; width:100%;
    display:grid; grid-template-columns:1fr 1fr;
    gap:3rem; align-items:center;
  }
  @media(max-width:880px) {
    .gr-hero-inner { grid-template-columns:1fr; gap:2.5rem; }
    .gr-hero-text { text-align:center; align-items:center; }
  }
  .gr-hero-text {
    display:flex; flex-direction:column; align-items:flex-start; gap:1.1rem;
  }
  .gr-crumb {
    display:inline-flex; align-items:center; gap:6px;
    font-family:'Segoe UI',system-ui,sans-serif;
    font-size:0.7rem; font-weight:600;
    text-transform:uppercase; letter-spacing:0.14em;
    color:var(--text-3); animation:fadeUp 0.7s ease both;
  }
  .gr-crumb .s { opacity:0.4; }
  .gr-crumb .c { color:var(--accent); }
  .gr-h1 {
    font-family:'Segoe UI',system-ui,sans-serif;
    font-size:clamp(2.6rem,6vw,4rem);
    font-weight:800; letter-spacing:-0.04em; line-height:1.08;
    animation:fadeUp 0.7s ease 0.08s both;
  }
  .gr-h1 .grad {
    background:linear-gradient(135deg, var(--accent), var(--accent-2));
    -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
  }
  .gr-h1 .thin { font-weight:300; color:var(--text-2); }
  .gr-desc {
    font-size:clamp(0.9rem,1.6vw,1.02rem);
    color:var(--text-2); line-height:1.78; max-width:460px;
    animation:fadeUp 0.7s ease 0.16s both;
  }
  .gr-cta {
    display:inline-flex; align-items:center; gap:10px;
    padding:14px 34px; border-radius:14px;
    background:linear-gradient(135deg, var(--accent), var(--accent-2));
    color:#fff; font-family:'Segoe UI',system-ui,sans-serif;
    font-weight:700; font-size:0.95rem;
    border:none; cursor:pointer; position:relative; overflow:hidden;
    transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease;
    animation:fadeUp 0.7s ease 0.28s both; text-decoration:none;
  }
  .gr-cta::before {
    content:''; position:absolute; inset:0;
    background:linear-gradient(135deg,transparent 40%,rgba(255,255,255,0.14));
  }
  .gr-cta:hover {
    transform:translateY(-3px) scale(1.02);
    box-shadow:0 10px 44px var(--glow-strong);
  }
  .gr-cta .ar { transition:transform 0.3s ease; }
  .gr-cta:hover .ar { transform:translateX(5px); }

  /* ─── GRAPH SVG ─── */
  .gr-viz-wrap {
    display:flex; flex-direction:column; align-items:center; gap:0.7rem;
    animation:fadeUp 0.8s ease 0.25s both;
  }
  .gr-viz-label {
    font-family:'Cascadia Code','Fira Code',Consolas,monospace;
    font-size:0.6rem; color:var(--text-3);
    text-transform:uppercase; letter-spacing:0.14em;
  }
  .gr-svg { width:100%; max-width:480px; height:auto; }

  .gr-edge {
    stroke:var(--edge-color); stroke-width:1.5; fill:none;
    transition:stroke 0.5s ease, stroke-width 0.3s ease;
  }
  .gr-edge.active {
    stroke:var(--edge-active); stroke-width:2.5;
    stroke-dasharray:6 3;
    animation:edgeTravel 0.6s linear infinite;
  }
  .gr-edge.visited {
    stroke:var(--edge-visited); stroke-width:2;
  }

  .gr-node-c {
    fill:var(--node-fill); stroke:var(--node-stroke); stroke-width:1.8;
    transition:all 0.4s ease;
  }
  .gr-node-c.active {
    fill:var(--node-active-fill); stroke:var(--node-active-stroke); stroke-width:2.8;
    filter:drop-shadow(0 0 10px var(--glow-strong));
  }
  .gr-node-c.visited {
    fill:var(--node-visited-fill); stroke:var(--node-visited-stroke); stroke-width:2.2;
  }
  .gr-node-t {
    fill:var(--node-text);
    font-family:'Cascadia Code','Fira Code',Consolas,monospace;
    font-size:11px; font-weight:700;
    text-anchor:middle; dominant-baseline:central;
    pointer-events:none; transition:fill 0.4s ease;
  }
  .gr-pulse {
    fill:none; stroke:var(--accent); stroke-width:1.5; opacity:0;
  }
  .gr-pulse.active { animation:ringPulse 1.2s ease-out infinite; }

  /* BFS log strip */
  .gr-bfs-log {
    display:flex; align-items:center; gap:4px; flex-wrap:wrap; justify-content:center;
    min-height:28px;
    padding:6px 14px; border-radius:8px;
    background:var(--bg-glass); border:1px solid var(--border-card);
    font-family:'Cascadia Code','Fira Code',Consolas,monospace;
    font-size:0.6rem; color:var(--text-3);
    backdrop-filter:blur(8px); transition:all 0.5s ease;
  }
  .gr-bfs-tag {
    padding:2px 8px; border-radius:4px;
    font-weight:700; transition:all 0.3s ease;
  }
  .gr-bfs-tag.active {
    background:var(--node-active-fill); color:var(--accent);
    border:1px solid var(--node-active-stroke);
  }
  .gr-bfs-tag.visited {
    background:var(--node-visited-fill); color:var(--accent-2);
    border:1px solid var(--node-visited-stroke);
    opacity:0.7;
  }
  .gr-bfs-tag.pending {
    opacity:0.3; border:1px solid var(--border-card);
  }

  /* Chips */
  .gr-chips {
    display:flex; flex-wrap:wrap; gap:5px; justify-content:center;
    animation:fadeUp 0.7s ease 0.55s both; margin-top:0.3rem;
  }
  .gr-chip {
    display:flex; align-items:center; gap:4px;
    padding:3px 10px; border-radius:18px;
    background:var(--bg-glass); border:1px solid var(--border-card);
    font-family:'Cascadia Code','Fira Code',Consolas,monospace;
    font-size:0.56rem; font-weight:600;
    backdrop-filter:blur(8px);
    transition:background 0.5s ease, border-color 0.5s ease;
  }
  .gr-chip .op { color:var(--text-3); text-transform:uppercase; letter-spacing:0.05em; }
  .gr-chip .v { font-weight:700; }
  .gr-chip .v.good { color:var(--good); }
  .gr-chip .v.mid { color:var(--mid); }
  .gr-chip .v.bad { color:var(--bad); }

  /* ─── INFO ─── */
  .gr-info-strip { position:relative; z-index:1; padding:0 clamp(1.5rem,5vw,4rem); }
  .gr-info-grid {
    max-width:980px; margin:-2rem auto 0;
    display:grid; grid-template-columns:repeat(auto-fit,minmax(210px,1fr)); gap:1rem;
  }
  .gr-icard {
    background:var(--bg-card);
    backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px);
    border:1px solid var(--border-card); border-radius:14px;
    padding:1.2rem 1.3rem; transition:all 0.35s ease;
  }
  .gr-icard:hover { border-color:var(--border-hover); box-shadow:var(--shadow-hover); transform:translateY(-2px); }
  .gr-icard-icon { font-size:1.3rem; margin-bottom:0.5rem; }
  .gr-icard-title { font-family:'Segoe UI',system-ui,sans-serif; font-size:0.8rem; font-weight:700; margin-bottom:0.2rem; }
  .gr-icard-text { font-size:0.76rem; color:var(--text-2); line-height:1.55; }

  /* ─── SECTION ─── */
  .gr-section { padding:5rem clamp(1.5rem,5vw,4rem); position:relative; z-index:1; }
  .gr-section-inner { max-width:980px; margin:0 auto; }
  .gr-eyebrow {
    font-family:'Segoe UI',system-ui,sans-serif;
    font-size:0.68rem; font-weight:700; text-transform:uppercase;
    letter-spacing:0.16em; color:var(--accent); margin-bottom:0.5rem;
  }
  .gr-sec-title {
    font-family:'Segoe UI',system-ui,sans-serif;
    font-size:clamp(1.3rem,3.5vw,1.85rem);
    font-weight:800; letter-spacing:-0.03em;
  }
  .gr-sec-sub { color:var(--text-2); font-size:0.9rem; margin-top:0.4rem; max-width:600px; }

  /* ─── TECH CARDS ─── */
  .gr-tlist { display:flex; flex-direction:column; gap:0.9rem; margin-top:2.5rem; }
  .gr-tc {
    background:var(--bg-card);
    border:1px solid var(--border-card); border-radius:14px;
    backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px);
    overflow:hidden;
    transition:background 0.5s ease, border-color 0.3s ease, box-shadow 0.3s ease;
  }
  .gr-tc:hover,.gr-tc.open { border-color:var(--border-hover); box-shadow:var(--shadow-hover); }
  .gr-tc-hdr {
    display:flex; align-items:center; gap:14px;
    padding:1.15rem 1.4rem; cursor:pointer; user-select:none;
    transition:background 0.25s ease;
  }
  .gr-tc-hdr:hover { background:var(--glow); }
  .gr-tc-icon {
    width:42px; height:42px; border-radius:10px;
    display:grid; place-items:center; font-size:1.05rem; flex-shrink:0;
    transition:transform 0.35s cubic-bezier(0.34,1.56,0.64,1);
  }
  .gr-tc:hover .gr-tc-icon,.gr-tc.open .gr-tc-icon { transform:scale(1.08) rotate(-4deg); }
  .gr-tc-mid { flex:1; min-width:0; }
  .gr-tc-name { font-family:'Segoe UI',system-ui,sans-serif; font-size:0.98rem; font-weight:700; }
  .gr-tc-desc { font-size:0.76rem; color:var(--text-2); margin-top:2px; line-height:1.5; }
  .gr-tc-cnt {
    font-family:'Cascadia Code','Fira Code',Consolas,monospace;
    font-size:0.62rem; color:var(--text-3);
    padding:3px 9px; border-radius:20px; background:var(--bg-tag);
    flex-shrink:0; white-space:nowrap;
  }
  .gr-chev {
    width:18px; height:18px; flex-shrink:0;
    transition:transform 0.4s cubic-bezier(0.34,1.56,0.64,1), color 0.3s ease;
    color:var(--text-3);
  }
  .gr-tc.open .gr-chev { transform:rotate(180deg); color:var(--accent); }
  .gr-tc-body { max-height:0; overflow:hidden; transition:max-height 0.5s cubic-bezier(0.4,0,0.2,1); }
  .gr-tc.open .gr-tc-body { max-height:700px; }
  .gr-tc-body-in {
    padding:0 1.4rem 1.3rem; opacity:0; transform:translateY(-8px);
    transition:opacity 0.35s ease 0.1s, transform 0.35s ease 0.1s;
  }
  .gr-tc.open .gr-tc-body-in { opacity:1; transform:translateY(0); }
  .gr-div { height:1px; background:var(--border); margin-bottom:0.7rem; }
  .gr-pl { display:flex; flex-direction:column; gap:3px; }
  .gr-plink {
    display:flex; align-items:center; gap:10px;
    padding:8px 14px; border-radius:8px;
    background:var(--bg-problem);
    transition:all 0.25s ease; cursor:pointer;
    text-decoration:none; color:var(--text-1);
    position:relative; overflow:hidden;
  }
  .gr-plink::before {
    content:''; position:absolute; left:0; top:0; bottom:0;
    width:3px; background:linear-gradient(180deg, var(--accent), var(--accent-2));
    opacity:0; transition:opacity 0.25s ease;
  }
  .gr-plink:hover { background:var(--bg-problem-hover); transform:translateX(4px); }
  .gr-plink:hover::before { opacity:1; }
  .gr-pn {
    font-family:'Cascadia Code','Fira Code',Consolas,monospace;
    font-size:0.62rem; color:var(--text-3); font-weight:600;
    width:22px; text-align:center; flex-shrink:0;
  }
  .gr-pname { font-family:'Segoe UI',system-ui,sans-serif; font-size:0.82rem; font-weight:600; flex:1; }
  .gr-parr {
    color:var(--text-3); opacity:0; transform:translateX(-6px);
    transition:all 0.25s ease; font-size:0.76rem;
  }
  .gr-plink:hover .gr-parr { opacity:1; transform:translateX(0); color:var(--accent); }

  /* ─── FOOTER ─── */
  .gr-footer {
    position:relative; z-index:1;
    padding:2.5rem clamp(1.5rem,5vw,4rem);
    text-align:center; border-top:1px solid var(--border);
    font-family:'Segoe UI',system-ui,sans-serif;
    font-size:0.74rem; color:var(--text-3);
    transition:border-color 0.5s ease;
  }
  .gr-footer a { color:var(--accent); text-decoration:none; }

  @media(max-width:640px) {
    .gr-hero { min-height:auto; padding-top:85px; padding-bottom:2rem; }
    .gr-svg { max-width:340px; }
    .gr-info-grid { grid-template-columns:1fr 1fr; }
    .gr-tc-desc { display:none; }
    .gr-tc-hdr { padding:1rem 1.1rem; gap:10px; }
  }
`;

// ─── CHEVRON ─────────────────────────────────────────────────────
const Chev = () => (
  <svg
    className="gr-chev"
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

// ─── EDGE KEY HELPER ─────────────────────────────────────────────
function edgeKey(u, v) {
  return u < v ? `${u}-${v}` : `${v}-${u}`;
}

// ─── GRAPH SVG COMPONENT ─────────────────────────────────────────
function GraphVisual({ activeId, visitedNodes, activeEdges, visitedEdges }) {
  return (
    <svg
      className="gr-svg"
      viewBox="0 0 480 280"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Edges */}
      {EDGES.map(([u, v]) => {
        const nu = NODES[u],
          nv = NODES[v];
        const ek = edgeKey(u, v);
        const isActive = activeEdges.has(ek);
        const isVisited = visitedEdges.has(ek);
        return (
          <line
            key={ek}
            className={`gr-edge${isActive ? " active" : ""}${isVisited && !isActive ? " visited" : ""}`}
            x1={nu.x}
            y1={nu.y}
            x2={nv.x}
            y2={nv.y}
          />
        );
      })}
      {/* Nodes */}
      {NODES.map((node) => {
        const isActive = activeId === node.id;
        const isVisited = visitedNodes.has(node.id) && !isActive;
        return (
          <g key={node.id}>
            <circle
              className={`gr-pulse${isActive ? " active" : ""}`}
              cx={node.x}
              cy={node.y}
              r={18}
            />
            <circle
              className={`gr-node-c${isActive ? " active" : ""}${isVisited ? " visited" : ""}`}
              cx={node.x}
              cy={node.y}
              r={18}
            />
            <text className="gr-node-t" x={node.x} y={node.y}>
              {node.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────
export default function GraphPage() {
  const [theme, setTheme] = useState("dark");
  const [openTech, setOpenTech] = useState(null);
  const [activeId, setActiveId] = useState(-1);
  const [visitedNodes, setVisitedNodes] = useState(new Set());
  const [activeEdges, setActiveEdges] = useState(new Set());
  const [visitedEdges, setVisitedEdges] = useState(new Set());
  const rootRef = useRef(null);

  // Apply CSS variables
  useEffect(() => {
    const vars = PAL[theme];
    const root = rootRef.current;
    if (!root) return;
    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
  }, [theme]);

  // BFS wave animation
  useEffect(() => {
    let nodeStep = 0;
    let edgeStep = 0;
    let phase = 0; // 0 = nodes expanding, 1 = pause, 2 = reset
    let tick_count = 0;
    const vn = new Set();
    const ae = new Set();
    const ve = new Set();

    const tick = () => {
      tick_count++;

      if (phase === 0) {
        if (nodeStep < BFS.order.length) {
          const nid = BFS.order[nodeStep];
          vn.add(nid);
          setActiveId(nid);
          setVisitedNodes(new Set(vn));

          // Activate the edge that discovered this node
          if (edgeStep < BFS.edgeOrder.length && nodeStep > 0) {
            const [eu, ev] = BFS.edgeOrder[edgeStep];
            const ek = edgeKey(eu, ev);
            // Move previous active edge to visited
            ae.forEach((k) => ve.add(k));
            ae.clear();
            ae.add(ek);
            setActiveEdges(new Set(ae));
            setVisitedEdges(new Set(ve));
            edgeStep++;
          }
          nodeStep++;
        } else {
          // All nodes visited — show complete state
          ae.forEach((k) => ve.add(k));
          ae.clear();
          setActiveId(-1);
          setActiveEdges(new Set());
          setVisitedEdges(new Set(ve));
          phase = 1;
        }
      } else if (phase === 1) {
        // Pause for 2 ticks
        if (tick_count % 3 === 0) {
          phase = 2;
        }
      } else {
        // Reset
        vn.clear();
        ae.clear();
        ve.clear();
        nodeStep = 0;
        edgeStep = 0;
        phase = 0;
        setActiveId(-1);
        setVisitedNodes(new Set());
        setActiveEdges(new Set());
        setVisitedEdges(new Set());
      }
    };

    const id = setInterval(tick, 700);
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
      <div className="gr-root" ref={rootRef}>
        {/* ── TOPBAR ── */}
        <nav className="gr-topbar">
          <div className="gr-brand">
            <div className="gr-logo">DS</div>
            <span className="gr-ui">DSA Visualizer</span>
            <span className="gr-sep">/</span>
            <span className="gr-topic-lbl gr-ui">Graph</span>
          </div>
          <div className="gr-actions">
            <button
              className="gr-back"
              onClick={() => (window.location.href = "index.html")}
            >
              ← Dashboard
            </button>
            <div
              className="gr-toggle"
              onClick={toggleTheme}
              role="button"
              tabIndex={0}
              onKeyDown={(e) =>
                (e.key === "Enter" || e.key === " ") && toggleTheme()
              }
              aria-label="Toggle theme"
            >
              <div className={`gr-knob${theme === "light" ? " on" : ""}`}>
                {theme === "dark" ? "🌙" : "☀️"}
              </div>
            </div>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section className="gr-hero">
          <div
            className="gr-hero-bg"
            style={{
              background:
                theme === "dark"
                  ? "radial-gradient(ellipse 65% 50% at 22% 18%, #0c0e28 0%, transparent 70%), radial-gradient(ellipse 55% 55% at 82% 74%, #140a1e 0%, transparent 60%), #05060c"
                  : "radial-gradient(ellipse 65% 50% at 22% 18%, #dde4f8 0%, transparent 70%), radial-gradient(ellipse 55% 55% at 82% 74%, #f4e8f0 0%, transparent 60%), #f5f7fc",
            }}
          />
          <div
            className="gr-orb"
            style={{
              width: 440,
              height: 440,
              background: "var(--accent)",
              opacity: 0.05,
              top: "-10%",
              right: "-5%",
              animation: "orbDrift 18s ease-in-out infinite",
            }}
          />
          <div
            className="gr-orb"
            style={{
              width: 300,
              height: 300,
              background: "var(--accent-2)",
              opacity: 0.04,
              bottom: "-4%",
              left: "-3%",
              animation: "orbDrift 22s ease-in-out infinite reverse",
            }}
          />
          <div
            className="gr-orb"
            style={{
              width: 160,
              height: 160,
              background: "var(--accent-5)",
              opacity: 0.03,
              top: "55%",
              left: "50%",
              animation: "orbDrift 14s ease-in-out 2s infinite",
            }}
          />

          <div className="gr-hero-inner">
            <div className="gr-hero-text">
              <div className="gr-crumb">
                <span>DSA</span>
                <span className="s">›</span>
                <span>Data Structures</span>
                <span className="s">›</span>
                <span className="c">Graph</span>
              </div>
              <h1 className="gr-h1 gr-ui">
                <span className="grad">Graph</span>
                <br />
                Algorithms
                <br />
                <span className="thin">& Traversals</span>
              </h1>
              <p className="gr-desc">
                Graphs model relationships between entities as vertices and
                edges — directed or undirected, weighted or unweighted. From BFS
                shortest paths to Dijkstra's algorithm, topological sort to
                union-find, graph theory underpins networking, routing, social
                analysis, and the majority of competitive programming problems.
              </p>
              <Link to="/graphs/graph-visualizer" className="gr-cta">
                Open Visualizer <span className="ar">→</span>
              </Link>

              {/* <a href="graph-visualizer.html" className="gr-cta">
                Open Visualizer <span className="ar">→</span>
              </a> */}
            </div>

            {/* Animated Graph Visual */}
            <div className="gr-viz-wrap">
              <div className="gr-viz-label gr-mono">
                Undirected Graph · BFS Wave from A
              </div>
              <GraphVisual
                activeId={activeId}
                visitedNodes={visitedNodes}
                activeEdges={activeEdges}
                visitedEdges={visitedEdges}
              />

              {/* BFS traversal log */}
              <div className="gr-bfs-log">
                <span style={{ marginRight: 4, opacity: 0.5 }}>BFS:</span>
                {BFS.order.map((nid, i) => {
                  const isActive = activeId === nid;
                  const isVisited = visitedNodes.has(nid) && !isActive;
                  return (
                    <span
                      key={nid}
                      className={`gr-bfs-tag${isActive ? " active" : ""}${isVisited ? " visited" : ""}${!isActive && !isVisited ? " pending" : ""}`}
                    >
                      {NODES[nid].label}
                    </span>
                  );
                })}
              </div>

              {/* Complexity chips */}
              <div className="gr-chips">
                {COMPLEXITIES.map((c, i) => (
                  <div className="gr-chip" key={i}>
                    <span className="op">{c.op}</span>
                    <span className={`v ${c.tier}`}>{c.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── INFO CARDS ── */}
        <div className="gr-info-strip">
          <div className="gr-info-grid">
            {INFO_CARDS.map((c, i) => (
              <div
                className="gr-icard"
                key={i}
                style={{
                  animation: `fadeUp 0.6s ease ${0.5 + i * 0.08}s both`,
                }}
              >
                <div className="gr-icard-icon">{c.icon}</div>
                <div className="gr-icard-title gr-ui">{c.title}</div>
                <div className="gr-icard-text">{c.text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── TECHNIQUES ── */}
        <section className="gr-section">
          <div className="gr-section-inner">
            <div
              style={{
                marginBottom: "0.5rem",
                animation: "fadeUp 0.6s ease both",
              }}
            >
              <div className="gr-eyebrow">Explore · {TOTAL} Problems</div>
              <h2 className="gr-sec-title gr-ui">
                Graph Techniques & Patterns
              </h2>
              <p className="gr-sec-sub">
                Master these seven foundational graph paradigms — from basic
                traversals to advanced structural analysis — to tackle the full
                range of graph problems.
              </p>
            </div>

            <div className="gr-tlist">
              {TECHNIQUES.map((tech, ti) => {
                const isOpen = openTech === tech.id;
                return (
                  <div
                    className={`gr-tc${isOpen ? " open" : ""}`}
                    key={tech.id}
                    style={{
                      animation: `fadeUp 0.6s ease ${0.05 + ti * 0.06}s both`,
                    }}
                  >
                    <div
                      className="gr-tc-hdr"
                      onClick={() => toggleTech(tech.id)}
                    >
                      <div
                        className="gr-tc-icon"
                        style={{
                          background: `color-mix(in srgb, ${tech.accent} 10%, transparent)`,
                        }}
                      >
                        {tech.icon}
                      </div>
                      <div className="gr-tc-mid">
                        <div className="gr-tc-name gr-ui">{tech.title}</div>
                        <div className="gr-tc-desc">{tech.desc}</div>
                      </div>
                      <div className="gr-tc-cnt gr-mono">
                        {tech.problems.length}
                      </div>
                      <Chev />
                    </div>
                    <div className="gr-tc-body">
                      <div className="gr-tc-body-in">
                        <div className="gr-div" />
                        <div className="gr-pl">
                          {tech.problems.map((p, pi) => (
                            <a
                              key={pi}
                              href={p.href || `${p.slug}-visualizer.html`}
                              className="gr-plink"
                            >
                              <span className="gr-pn gr-mono">
                                {String(pi + 1).padStart(2, "0")}
                              </span>
                              <span className="gr-pname gr-ui">{p.name}</span>
                              <span className="gr-parr">→</span>
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
        <footer className="gr-footer">
          DSA Visualizer Platform — Built for learners.{" "}
          <a href="index.html">Back to Dashboard</a>
        </footer>
      </div>
    </>
  );
}
