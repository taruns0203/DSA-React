import { useState, useEffect, useRef, useCallback } from "react";
import { dynamicProgrammingTechniques } from "../../data/dynamicProgrammingTechniques";
import { Link } from "react-router-dom";

/* ================================================================
   DYNAMIC PROGRAMMING — DSA Visualizer Platform Topic Page

   Aesthetic: "Retro Terminal / Phosphor Matrix"
   - Deep void-black base with phosphor green & warm amber
   - Animated DP memoization grid hero (Fibonacci table fill)
   - Glassmorphism technique accordions (8 categories)
   - Dark / Light theme with smooth CSS-variable transitions
   ================================================================ */

// ─── THEME PALETTES ──────────────────────────────────────────────
const PAL = {
  dark: {
    "--bg-root": "#050805",
    "--bg-hero": "#060a06",
    "--bg-section": "#081008",
    "--bg-card": "rgba(10, 22, 10, 0.6)",
    "--bg-card-hover": "rgba(16, 32, 16, 0.78)",
    "--bg-glass": "rgba(10, 24, 10, 0.48)",
    "--bg-tag": "rgba(74, 222, 128, 0.07)",
    "--bg-problem": "rgba(74, 222, 128, 0.02)",
    "--bg-problem-hover": "rgba(74, 222, 128, 0.055)",
    "--text-1": "#d0e8d0",
    "--text-2": "#6a9a6a",
    "--text-3": "#3a6a3a",
    "--accent": "#4ade80",
    "--accent-2": "#fbbf24",
    "--accent-3": "#f87171",
    "--accent-4": "#38bdf8",
    "--accent-5": "#c084fc",
    "--accent-6": "#fb923c",
    "--border": "rgba(74, 222, 128, 0.06)",
    "--border-card": "rgba(74, 222, 128, 0.09)",
    "--border-hover": "rgba(74, 222, 128, 0.24)",
    "--glow": "rgba(74, 222, 128, 0.04)",
    "--glow-strong": "rgba(74, 222, 128, 0.16)",
    "--shadow-card": "0 8px 44px rgba(0,0,0,0.42)",
    "--shadow-hover": "0 14px 52px rgba(74,222,128,0.05)",
    "--cell-bg": "rgba(74, 222, 128, 0.03)",
    "--cell-border": "rgba(74, 222, 128, 0.12)",
    "--cell-active-bg": "rgba(74, 222, 128, 0.14)",
    "--cell-active-border": "#4ade80",
    "--cell-filled-bg": "rgba(74, 222, 128, 0.06)",
    "--cell-filled-border": "rgba(74, 222, 128, 0.2)",
    "--cell-text": "#4ade80",
    "--cell-dim": "rgba(74, 222, 128, 0.35)",
    "--grid-line": "rgba(74, 222, 128, 0.014)",
    "--overlay": "rgba(5, 8, 5, 0.92)",
    "--good": "#4ade80",
    "--mid": "#fbbf24",
    "--bad": "#f87171",
    "--scanline": "rgba(74, 222, 128, 0.015)",
  },
  light: {
    "--bg-root": "#f5f8f5",
    "--bg-hero": "#edf4ed",
    "--bg-section": "#f0f6f0",
    "--bg-card": "rgba(255,255,255,0.72)",
    "--bg-card-hover": "rgba(255,255,255,0.9)",
    "--bg-glass": "rgba(255,255,255,0.58)",
    "--bg-tag": "rgba(22,101,52,0.06)",
    "--bg-problem": "rgba(22,101,52,0.02)",
    "--bg-problem-hover": "rgba(22,101,52,0.055)",
    "--text-1": "#0f2a0f",
    "--text-2": "#3a6a3a",
    "--text-3": "#88aa88",
    "--accent": "#16a34a",
    "--accent-2": "#ca8a04",
    "--accent-3": "#dc2626",
    "--accent-4": "#0284c7",
    "--accent-5": "#9333ea",
    "--accent-6": "#ea580c",
    "--border": "rgba(22,101,52,0.07)",
    "--border-card": "rgba(22,101,52,0.1)",
    "--border-hover": "rgba(22,101,52,0.26)",
    "--glow": "rgba(22,101,52,0.03)",
    "--glow-strong": "rgba(22,101,52,0.08)",
    "--shadow-card": "0 8px 44px rgba(10,30,10,0.05)",
    "--shadow-hover": "0 14px 52px rgba(22,101,52,0.04)",
    "--cell-bg": "rgba(22,101,52,0.03)",
    "--cell-border": "rgba(22,101,52,0.12)",
    "--cell-active-bg": "rgba(22,101,52,0.1)",
    "--cell-active-border": "#16a34a",
    "--cell-filled-bg": "rgba(22,101,52,0.05)",
    "--cell-filled-border": "rgba(22,101,52,0.18)",
    "--cell-text": "#16a34a",
    "--cell-dim": "rgba(22,101,52,0.3)",
    "--grid-line": "rgba(22,101,52,0.02)",
    "--overlay": "rgba(245,248,245,0.92)",
    "--good": "#16a34a",
    "--mid": "#ca8a04",
    "--bad": "#dc2626",
    "--scanline": "rgba(22,101,52,0.008)",
  },
};

// ─── DP TECHNIQUES DATA ──────────────────────────────────────────
const TECHNIQUES = dynamicProgrammingTechniques;

// ─── DP TABLE DATA (Fibonacci for hero animation) ────────────────
// We animate filling a 2-row table: top = index, bottom = fib value
const FIB_N = 12;
const FIB_VALS = [];
{
  let a = 0,
    b = 1;
  for (let i = 0; i < FIB_N; i++) {
    FIB_VALS.push(a);
    [a, b] = [b, a + b];
  }
}

const COMPLEXITIES = [
  { op: "Top-Down (memo)", val: "O(states)", tier: "good" },
  { op: "Bottom-Up (tab)", val: "O(states)", tier: "good" },
  { op: "Space (naive)", val: "O(states)", tier: "mid" },
  { op: "Space (optimised)", val: "O(1)–O(n)", tier: "good" },
  { op: "Recurrence", val: "Exponential", tier: "bad" },
];

const INFO_CARDS = [
  {
    icon: "🧩",
    title: "What is Dynamic Programming?",
    text: "A method for solving complex problems by breaking them into overlapping sub-problems, solving each once, and storing results to avoid redundant computation.",
  },
  {
    icon: "🧠",
    title: "Memoization vs Tabulation",
    text: "Top-down (memoization) uses recursion + cache. Bottom-up (tabulation) fills a table iteratively. Both achieve the same optimal substructure exploitation.",
  },
  {
    icon: "⚡",
    title: "When to Use",
    text: "When a problem has optimal substructure (optimal solution contains optimal sub-solutions) and overlapping sub-problems (same sub-problems recur many times).",
  },
  {
    icon: "⚠️",
    title: "Trade-offs",
    text: "Trades space for time — O(states) memory. State definition is the hard part. Some problems require bitmask or interval states that balloon exponentially.",
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
    33% { transform:translate(18px,-22px) scale(1.04); }
    66% { transform:translate(-14px,16px) scale(0.96); }
  }
  @keyframes cellFill {
    0% { background:transparent; color:transparent; border-color:var(--cell-active-border); box-shadow:0 0 12px var(--glow-strong); }
    50% { background:var(--cell-active-bg); color:var(--cell-text); border-color:var(--cell-active-border); box-shadow:0 0 12px var(--glow-strong); }
    100% { background:var(--cell-filled-bg); color:var(--cell-text); border-color:var(--cell-filled-border); box-shadow:none; }
  }
  @keyframes cursorBlink {
    0%,100% { opacity:1; }
    50% { opacity:0; }
  }
  @keyframes scanline {
    0% { transform:translateY(-100%); }
    100% { transform:translateY(100vh); }
  }

  *,*::before,*::after { margin:0; padding:0; box-sizing:border-box; }

  .dp-root {
    font-family: 'Courier New', 'Courier', monospace;
    background:var(--bg-root);
    color:var(--text-1);
    min-height:100vh;
    overflow-x:hidden;
    line-height:1.65;
    transition:background 0.5s cubic-bezier(0.4,0,0.2,1), color 0.5s cubic-bezier(0.4,0,0.2,1);
    position:relative;
  }
  /* Grid bg */
  .dp-root::before {
    content:'';
    position:fixed; inset:0;
    background:
      linear-gradient(var(--grid-line) 1px, transparent 1px),
      linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
    background-size:48px 48px;
    pointer-events:none; z-index:0;
  }
  /* Scanline effect */
  .dp-root::after {
    content:'';
    position:fixed; inset:0;
    background:repeating-linear-gradient(
      0deg,
      var(--scanline) 0px, var(--scanline) 1px,
      transparent 1px, transparent 3px
    );
    pointer-events:none; z-index:10000; opacity:0.4;
  }

  .dp-ui { font-family:'Segoe UI',system-ui,sans-serif; }
  .dp-mono { font-family:'Cascadia Code','Fira Code','Courier New',monospace; }

  /* ─── TOPBAR ─── */
  .dp-topbar {
    position:fixed; top:0; left:0; right:0; z-index:999;
    height:60px; display:flex; align-items:center; justify-content:space-between;
    padding:0 clamp(1rem,4vw,3rem);
    background:var(--overlay);
    backdrop-filter:blur(24px); -webkit-backdrop-filter:blur(24px);
    border-bottom:1px solid var(--border);
    transition:background 0.5s ease;
  }
  .dp-brand {
    display:flex; align-items:center; gap:10px;
    font-family:'Segoe UI',system-ui,sans-serif;
    font-weight:700; font-size:0.95rem; cursor:pointer;
  }
  .dp-logo {
    width:32px; height:32px; border-radius:8px;
    background:linear-gradient(135deg, var(--accent), var(--accent-2));
    display:grid; place-items:center;
    font-size:0.7rem; font-weight:800; color:#fff; position:relative;
  }
  .dp-logo::after {
    content:''; position:absolute; inset:0; border-radius:8px;
    background:linear-gradient(135deg,transparent 50%,rgba(255,255,255,0.15));
  }
  .dp-sep { color:var(--text-3); font-weight:300; margin:0 2px; }
  .dp-topic-lbl { color:var(--accent); }
  .dp-actions { display:flex; align-items:center; gap:14px; }
  .dp-back {
    display:flex; align-items:center; gap:5px;
    padding:5px 14px; border-radius:8px;
    background:var(--bg-glass); border:1px solid var(--border-card);
    color:var(--text-2); font-family:'Segoe UI',system-ui,sans-serif;
    font-size:0.78rem; font-weight:600; cursor:pointer; transition:all 0.3s ease;
  }
  .dp-back:hover { color:var(--text-1); border-color:var(--border-hover); }
  .dp-toggle {
    width:50px; height:26px; border-radius:20px;
    background:var(--bg-glass); border:1.5px solid var(--border-card);
    cursor:pointer; position:relative; transition:all 0.3s ease; flex-shrink:0;
  }
  .dp-toggle:hover { border-color:var(--border-hover); }
  .dp-knob {
    position:absolute; top:2px; left:2px;
    width:18px; height:18px; border-radius:50%;
    background:linear-gradient(135deg, var(--accent), var(--accent-2));
    transition:transform 0.4s cubic-bezier(0.34,1.56,0.64,1);
    display:grid; place-items:center; font-size:10px;
  }
  .dp-knob.on { transform:translateX(24px); }

  /* ─── HERO ─── */
  .dp-hero {
    position:relative; min-height:92vh;
    display:flex; align-items:center; justify-content:center;
    padding:100px clamp(1.5rem,5vw,4rem) 4rem;
    overflow:hidden;
  }
  .dp-hero-bg { position:absolute; inset:0; z-index:0; transition:background 0.5s ease; }
  .dp-orb { position:absolute; border-radius:50%; filter:blur(100px); pointer-events:none; z-index:1; }
  .dp-hero-inner {
    position:relative; z-index:2;
    max-width:1060px; width:100%;
    display:grid; grid-template-columns:1fr 1fr;
    gap:3rem; align-items:center;
  }
  @media(max-width:880px) {
    .dp-hero-inner { grid-template-columns:1fr; gap:2.5rem; }
    .dp-hero-text { text-align:center; align-items:center; }
  }
  .dp-hero-text {
    display:flex; flex-direction:column; align-items:flex-start; gap:1.1rem;
  }
  .dp-crumb {
    display:inline-flex; align-items:center; gap:6px;
    font-family:'Segoe UI',system-ui,sans-serif;
    font-size:0.7rem; font-weight:600;
    text-transform:uppercase; letter-spacing:0.14em;
    color:var(--text-3); animation:fadeUp 0.7s ease both;
  }
  .dp-crumb .s { opacity:0.4; }
  .dp-crumb .c { color:var(--accent); }
  .dp-h1 {
    font-family:'Segoe UI',system-ui,sans-serif;
    font-size:clamp(2.4rem,5.5vw,3.8rem);
    font-weight:800; letter-spacing:-0.04em; line-height:1.08;
    animation:fadeUp 0.7s ease 0.08s both;
  }
  .dp-h1 .grad {
    background:linear-gradient(135deg, var(--accent), var(--accent-2));
    -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
  }
  .dp-h1 .thin { font-weight:300; color:var(--text-2); }
  .dp-desc {
    font-family: Georgia, 'Times New Roman', serif;
    font-size:clamp(0.9rem,1.6vw,1.02rem);
    color:var(--text-2); line-height:1.78; max-width:460px;
    animation:fadeUp 0.7s ease 0.16s both;
  }
  .dp-cta {
    display:inline-flex; align-items:center; gap:10px;
    padding:14px 34px; border-radius:14px;
    background:linear-gradient(135deg, var(--accent), var(--accent-2));
    color:#000; font-family:'Segoe UI',system-ui,sans-serif;
    font-weight:700; font-size:0.95rem;
    border:none; cursor:pointer; position:relative; overflow:hidden;
    transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease;
    animation:fadeUp 0.7s ease 0.28s both; text-decoration:none;
  }
  .dp-cta::before {
    content:''; position:absolute; inset:0;
    background:linear-gradient(135deg,transparent 40%,rgba(255,255,255,0.18));
  }
  .dp-cta:hover {
    transform:translateY(-3px) scale(1.02);
    box-shadow:0 10px 44px var(--glow-strong);
  }
  .dp-cta .ar { transition:transform 0.3s ease; }
  .dp-cta:hover .ar { transform:translateX(5px); }

  /* ─── DP TABLE VISUAL ─── */
  .dp-viz-wrap {
    display:flex; flex-direction:column; align-items:center; gap:0.8rem;
    animation:fadeUp 0.8s ease 0.25s both;
  }
  .dp-viz-label {
    font-family:'Cascadia Code','Fira Code',Consolas,monospace;
    font-size:0.6rem; color:var(--text-3);
    text-transform:uppercase; letter-spacing:0.14em;
  }
  .dp-viz-code {
    font-family:'Cascadia Code','Fira Code',Consolas,monospace;
    font-size:0.62rem; color:var(--text-3); line-height:1.8;
    padding:12px 16px;
    background:var(--bg-card);
    border:1px solid var(--border-card);
    border-radius:10px;
    width:100%; max-width:420px;
    backdrop-filter:blur(8px);
    transition:background 0.5s ease, border-color 0.5s ease;
    overflow:hidden;
  }
  .dp-viz-code .kw { color:var(--accent-5); }
  .dp-viz-code .fn { color:var(--accent-2); }
  .dp-viz-code .cm { color:var(--text-3); font-style:italic; }
  .dp-viz-code .num { color:var(--accent-6); }
  .dp-viz-code .str { color:var(--accent); }
  .dp-viz-code .cur {
    display:inline-block; width:7px; height:14px;
    background:var(--accent); vertical-align:middle;
    animation:cursorBlink 1s step-end infinite; margin-left:2px;
  }

  /* Table grid */
  .dp-table-wrap {
    display:flex; flex-direction:column; gap:0; align-items:center;
    width:100%; max-width:420px;
  }
  .dp-table-row {
    display:flex; gap:0;
  }
  .dp-table-hdr {
    font-family:'Cascadia Code','Fira Code',Consolas,monospace;
    font-size:0.5rem; font-weight:700; color:var(--text-3);
    width:36px; text-align:center; padding:2px 0;
    letter-spacing:0.04em;
  }
  .dp-cell {
    width:36px; height:36px;
    border:1px solid var(--cell-border);
    background:var(--cell-bg);
    display:grid; place-items:center;
    font-family:'Cascadia Code','Fira Code',Consolas,monospace;
    font-size:0.68rem; font-weight:700;
    color:transparent;
    transition:background 0.4s ease, border-color 0.4s ease, color 0.3s ease, box-shadow 0.3s ease;
  }
  .dp-cell:first-child { border-radius:6px 0 0 6px; }
  .dp-cell:last-child { border-radius:0 6px 6px 0; }
  .dp-cell:not(:first-child) { border-left:none; }
  .dp-cell.filled {
    background:var(--cell-filled-bg);
    border-color:var(--cell-filled-border);
    color:var(--cell-dim);
  }
  .dp-cell.active {
    background:var(--cell-active-bg);
    border-color:var(--cell-active-border);
    color:var(--cell-text);
    box-shadow:0 0 14px var(--glow-strong);
    z-index:1;
  }
  .dp-cell.done {
    color:var(--cell-text);
  }

  /* Recurrence display */
  .dp-recurrence {
    font-family:'Cascadia Code','Fira Code',Consolas,monospace;
    font-size:0.6rem;
    color:var(--text-2);
    text-align:center;
    padding:6px 14px;
    border-radius:8px;
    background:var(--bg-glass);
    border:1px solid var(--border-card);
    transition:all 0.5s ease;
    min-height:24px;
    backdrop-filter:blur(8px);
  }
  .dp-recurrence .hl { color:var(--accent); font-weight:700; }

  /* Chips */
  .dp-chips {
    display:flex; flex-wrap:wrap; gap:5px; justify-content:center;
    animation:fadeUp 0.7s ease 0.55s both; margin-top:0.4rem;
  }
  .dp-chip {
    display:flex; align-items:center; gap:4px;
    padding:3px 10px; border-radius:18px;
    background:var(--bg-glass); border:1px solid var(--border-card);
    font-family:'Cascadia Code','Fira Code',Consolas,monospace;
    font-size:0.56rem; font-weight:600;
    backdrop-filter:blur(8px);
    transition:background 0.5s ease, border-color 0.5s ease;
  }
  .dp-chip .op { color:var(--text-3); text-transform:uppercase; letter-spacing:0.05em; }
  .dp-chip .v { font-weight:700; }
  .dp-chip .v.good { color:var(--good); }
  .dp-chip .v.mid { color:var(--mid); }
  .dp-chip .v.bad { color:var(--bad); }

  /* ─── INFO ─── */
  .dp-info-strip { position:relative; z-index:1; padding:0 clamp(1.5rem,5vw,4rem); }
  .dp-info-grid {
    max-width:980px; margin:-2rem auto 0;
    display:grid; grid-template-columns:repeat(auto-fit,minmax(210px,1fr)); gap:1rem;
  }
  .dp-icard {
    background:var(--bg-card);
    backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px);
    border:1px solid var(--border-card); border-radius:14px;
    padding:1.2rem 1.3rem; transition:all 0.35s ease;
  }
  .dp-icard:hover { border-color:var(--border-hover); box-shadow:var(--shadow-hover); transform:translateY(-2px); }
  .dp-icard-icon { font-size:1.3rem; margin-bottom:0.5rem; }
  .dp-icard-title { font-family:'Segoe UI',system-ui,sans-serif; font-size:0.8rem; font-weight:700; margin-bottom:0.2rem; }
  .dp-icard-text { font-family:Georgia,'Times New Roman',serif; font-size:0.76rem; color:var(--text-2); line-height:1.55; }

  /* ─── SECTION ─── */
  .dp-section { padding:5rem clamp(1.5rem,5vw,4rem); position:relative; z-index:1; }
  .dp-section-inner { max-width:980px; margin:0 auto; }
  .dp-eyebrow {
    font-family:'Segoe UI',system-ui,sans-serif;
    font-size:0.68rem; font-weight:700; text-transform:uppercase;
    letter-spacing:0.16em; color:var(--accent); margin-bottom:0.5rem;
  }
  .dp-sec-title {
    font-family:'Segoe UI',system-ui,sans-serif;
    font-size:clamp(1.3rem,3.5vw,1.85rem);
    font-weight:800; letter-spacing:-0.03em;
  }
  .dp-sec-sub { font-family:Georgia,'Times New Roman',serif; color:var(--text-2); font-size:0.9rem; margin-top:0.4rem; max-width:600px; }

  /* ─── TECH CARDS ─── */
  .dp-tlist { display:flex; flex-direction:column; gap:0.9rem; margin-top:2.5rem; }
  .dp-tc {
    background:var(--bg-card);
    border:1px solid var(--border-card); border-radius:14px;
    backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px);
    overflow:hidden;
    transition:background 0.5s ease, border-color 0.3s ease, box-shadow 0.3s ease;
  }
  .dp-tc:hover,.dp-tc.open { border-color:var(--border-hover); box-shadow:var(--shadow-hover); }
  .dp-tc-hdr {
    display:flex; align-items:center; gap:14px;
    padding:1.15rem 1.4rem; cursor:pointer; user-select:none;
    transition:background 0.25s ease;
  }
  .dp-tc-hdr:hover { background:var(--glow); }
  .dp-tc-icon {
    width:42px; height:42px; border-radius:10px;
    display:grid; place-items:center; font-size:1.05rem; flex-shrink:0;
    transition:transform 0.35s cubic-bezier(0.34,1.56,0.64,1);
  }
  .dp-tc:hover .dp-tc-icon,.dp-tc.open .dp-tc-icon { transform:scale(1.08) rotate(-4deg); }
  .dp-tc-mid { flex:1; min-width:0; }
  .dp-tc-name { font-family:'Segoe UI',system-ui,sans-serif; font-size:0.98rem; font-weight:700; }
  .dp-tc-desc { font-family:Georgia,'Times New Roman',serif; font-size:0.76rem; color:var(--text-2); margin-top:2px; line-height:1.5; }
  .dp-tc-cnt {
    font-family:'Cascadia Code','Fira Code',Consolas,monospace;
    font-size:0.62rem; color:var(--text-3);
    padding:3px 9px; border-radius:20px; background:var(--bg-tag);
    flex-shrink:0; white-space:nowrap;
  }
  .dp-chev {
    width:18px; height:18px; flex-shrink:0;
    transition:transform 0.4s cubic-bezier(0.34,1.56,0.64,1), color 0.3s ease;
    color:var(--text-3);
  }
  .dp-tc.open .dp-chev { transform:rotate(180deg); color:var(--accent); }
  .dp-tc-body { max-height:0; overflow:hidden; transition:max-height 0.5s cubic-bezier(0.4,0,0.2,1); }
  .dp-tc.open .dp-tc-body { max-height:800px; }
  .dp-tc-body-in {
    padding:0 1.4rem 1.3rem; opacity:0; transform:translateY(-8px);
    transition:opacity 0.35s ease 0.1s, transform 0.35s ease 0.1s;
  }
  .dp-tc.open .dp-tc-body-in { opacity:1; transform:translateY(0); }
  .dp-div { height:1px; background:var(--border); margin-bottom:0.7rem; }
  .dp-pl { display:flex; flex-direction:column; gap:3px; }
  .dp-plink {
    display:flex; align-items:center; gap:10px;
    padding:8px 14px; border-radius:8px;
    background:var(--bg-problem);
    transition:all 0.25s ease; cursor:pointer;
    text-decoration:none; color:var(--text-1);
    position:relative; overflow:hidden;
  }
  .dp-plink::before {
    content:''; position:absolute; left:0; top:0; bottom:0;
    width:3px; background:linear-gradient(180deg, var(--accent), var(--accent-2));
    opacity:0; transition:opacity 0.25s ease;
  }
  .dp-plink:hover { background:var(--bg-problem-hover); transform:translateX(4px); }
  .dp-plink:hover::before { opacity:1; }
  .dp-pn {
    font-family:'Cascadia Code','Fira Code',Consolas,monospace;
    font-size:0.62rem; color:var(--text-3); font-weight:600;
    width:22px; text-align:center; flex-shrink:0;
  }
  .dp-pname { font-family:'Segoe UI',system-ui,sans-serif; font-size:0.82rem; font-weight:600; flex:1; }
  .dp-parr {
    color:var(--text-3); opacity:0; transform:translateX(-6px);
    transition:all 0.25s ease; font-size:0.76rem;
  }
  .dp-plink:hover .dp-parr { opacity:1; transform:translateX(0); color:var(--accent); }

  /* ─── FOOTER ─── */
  .dp-footer {
    position:relative; z-index:1;
    padding:2.5rem clamp(1.5rem,5vw,4rem);
    text-align:center; border-top:1px solid var(--border);
    font-family:'Segoe UI',system-ui,sans-serif;
    font-size:0.74rem; color:var(--text-3);
    transition:border-color 0.5s ease;
  }
  .dp-footer a { color:var(--accent); text-decoration:none; }

  @media(max-width:640px) {
    .dp-hero { min-height:auto; padding-top:85px; padding-bottom:2rem; }
    .dp-cell { width:28px; height:28px; font-size:0.55rem; }
    .dp-table-hdr { width:28px; font-size:0.42rem; }
    .dp-viz-code { font-size:0.52rem; padding:8px 10px; }
    .dp-info-grid { grid-template-columns:1fr 1fr; }
    .dp-tc-desc { display:none; }
    .dp-tc-hdr { padding:1rem 1.1rem; gap:10px; }
  }
`;

// ─── CHEVRON ─────────────────────────────────────────────────────
const Chev = () => (
  <svg
    className="dp-chev"
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

// ─── MAIN COMPONENT ─────────────────────────────────────────────
export default function DynamicProgrammingPage() {
  const [theme, setTheme] = useState("dark");
  const [openTech, setOpenTech] = useState(null);
  const [filledIdx, setFilledIdx] = useState(-1); // how many cells are filled
  const [activeIdx, setActiveIdx] = useState(-1); // currently computing
  const [recText, setRecText] = useState("");
  const rootRef = useRef(null);

  // Apply CSS variables
  useEffect(() => {
    const vars = PAL[theme];
    const root = rootRef.current;
    if (!root) return;
    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
  }, [theme]);

  // DP table fill animation — simulates computing Fibonacci bottom-up
  useEffect(() => {
    let step = -1;
    let phase = 0; // 0=filling, 1=pause

    const tick = () => {
      if (phase === 0) {
        step++;
        if (step < FIB_N) {
          setActiveIdx(step);
          setFilledIdx(step - 1);
          if (step === 0) {
            setRecText("Base case: dp[0] = 0");
          } else if (step === 1) {
            setRecText("Base case: dp[1] = 1");
          } else {
            setRecText(
              `dp[${step}] = dp[${step - 1}] + dp[${step - 2}] = ${FIB_VALS[step - 1]} + ${FIB_VALS[step - 2]} = ${FIB_VALS[step]}`,
            );
          }
        } else {
          setFilledIdx(FIB_N - 1);
          setActiveIdx(-1);
          setRecText("✓ Table complete — O(n) time, O(n) space");
          phase = 1;
          step = 0;
        }
      } else {
        // Reset
        setFilledIdx(-1);
        setActiveIdx(-1);
        setRecText("");
        phase = 0;
        step = -1;
      }
    };

    const id = setInterval(tick, 800);
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
      <div className="dp-root" ref={rootRef}>
        {/* ── TOPBAR ── */}
        <nav className="dp-topbar">
          <div className="dp-brand">
            <div className="dp-logo">DS</div>
            <span className="dp-ui">DSA Visualizer</span>
            <span className="dp-sep">/</span>
            <span className="dp-topic-lbl dp-ui">Dynamic Programming</span>
          </div>
          <div className="dp-actions">
            <button
              className="dp-back"
              onClick={() => (window.location.href = "index.html")}
            >
              ← Dashboard
            </button>
            <div
              className="dp-toggle"
              onClick={toggleTheme}
              role="button"
              tabIndex={0}
              onKeyDown={(e) =>
                (e.key === "Enter" || e.key === " ") && toggleTheme()
              }
              aria-label="Toggle theme"
            >
              <div className={`dp-knob${theme === "light" ? " on" : ""}`}>
                {theme === "dark" ? "🌙" : "☀️"}
              </div>
            </div>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section className="dp-hero">
          <div
            className="dp-hero-bg"
            style={{
              background:
                theme === "dark"
                  ? "radial-gradient(ellipse 65% 50% at 22% 20%, #0a140a 0%, transparent 70%), radial-gradient(ellipse 55% 55% at 80% 75%, #141008 0%, transparent 60%), #050805"
                  : "radial-gradient(ellipse 65% 50% at 22% 20%, #e4ece4 0%, transparent 70%), radial-gradient(ellipse 55% 55% at 80% 75%, #f0ece0 0%, transparent 60%), #f5f8f5",
            }}
          />
          <div
            className="dp-orb"
            style={{
              width: 420,
              height: 420,
              background: "var(--accent)",
              opacity: 0.05,
              top: "-10%",
              right: "-5%",
              animation: "orbDrift 18s ease-in-out infinite",
            }}
          />
          <div
            className="dp-orb"
            style={{
              width: 280,
              height: 280,
              background: "var(--accent-2)",
              opacity: 0.04,
              bottom: "-4%",
              left: "-3%",
              animation: "orbDrift 22s ease-in-out infinite reverse",
            }}
          />

          <div className="dp-hero-inner">
            <div className="dp-hero-text">
              <div className="dp-crumb">
                <span>DSA</span>
                <span className="s">›</span>
                <span>Algorithms</span>
                <span className="s">›</span>
                <span className="c">Dynamic Programming</span>
              </div>
              <h1 className="dp-h1 dp-ui">
                Dynamic
                <br />
                <span className="grad">Programming</span>
                <br />
                <span className="thin">Memoize & Conquer</span>
              </h1>
              <p className="dp-desc">
                Solve complex problems by decomposing them into overlapping
                sub-problems, computing each once, and caching results. Whether
                top-down with memoization or bottom-up with tabulation, DP
                transforms exponential brute-force into polynomial elegance —
                the single most important technique for interviews.
              </p>
              <Link to="/dynamic-programming/dp-visualizer" className="dp-cta">
                Open Visualizer <span className="ar">→</span>
              </Link>
              {/* <a href="dynamic-programming-visualizer.html" className="dp-cta">
                Open Visualizer <span className="ar">→</span>
              </a> */}
            </div>

            {/* DP Table Visual */}
            <div className="dp-viz-wrap">
              <div className="dp-viz-label dp-mono">
                Bottom-Up Tabulation · Fibonacci
              </div>

              {/* Pseudocode snippet */}
              <div className="dp-viz-code">
                <span className="kw">for</span> i ={" "}
                <span className="num">2</span> → n:
                <br />
                {"  "}dp[i] = dp[i<span className="num">-1</span>] + dp[i
                <span className="num">-2</span>]<span className="cur" />
              </div>

              {/* Index headers */}
              <div className="dp-table-wrap">
                <div className="dp-table-row" style={{ marginBottom: 2 }}>
                  {FIB_VALS.map((_, i) => (
                    <div className="dp-table-hdr" key={i}>
                      {i}
                    </div>
                  ))}
                </div>
                {/* Value cells */}
                <div className="dp-table-row">
                  {FIB_VALS.map((val, i) => {
                    let cls = "dp-cell";
                    if (i === activeIdx) cls += " active";
                    else if (i <= filledIdx) cls += " filled done";
                    return (
                      <div className={cls} key={i}>
                        {i <= filledIdx || i === activeIdx ? val : ""}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Live recurrence */}
              <div className="dp-recurrence dp-mono">
                {recText ? (
                  <span
                    dangerouslySetInnerHTML={{
                      __html: recText
                        .replace(
                          /dp\[(\d+)\]/g,
                          '<span class="hl">dp[$1]</span>',
                        )
                        .replace(/= (\d+)$/g, '= <span class="hl">$1</span>')
                        .replace("✓", '<span class="hl">✓</span>'),
                    }}
                  />
                ) : (
                  <span style={{ opacity: 0.4 }}>Waiting to begin...</span>
                )}
              </div>

              {/* Complexity chips */}
              <div className="dp-chips">
                {COMPLEXITIES.map((c, i) => (
                  <div className="dp-chip" key={i}>
                    <span className="op">{c.op}</span>
                    <span className={`v ${c.tier}`}>{c.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── INFO CARDS ── */}
        <div className="dp-info-strip">
          <div className="dp-info-grid">
            {INFO_CARDS.map((c, i) => (
              <div
                className="dp-icard"
                key={i}
                style={{
                  animation: `fadeUp 0.6s ease ${0.5 + i * 0.08}s both`,
                }}
              >
                <div className="dp-icard-icon">{c.icon}</div>
                <div className="dp-icard-title dp-ui">{c.title}</div>
                <div className="dp-icard-text">{c.text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── TECHNIQUES ── */}
        <section className="dp-section">
          <div className="dp-section-inner">
            <div
              style={{
                marginBottom: "0.5rem",
                animation: "fadeUp 0.6s ease both",
              }}
            >
              <div className="dp-eyebrow">Explore · {TOTAL} Problems</div>
              <h2 className="dp-sec-title dp-ui">
                Dynamic Programming Techniques & Patterns
              </h2>
              <p className="dp-sec-sub">
                Master these eight fundamental DP paradigms to systematically
                decompose any optimisation or counting problem into tractable
                sub-problems.
              </p>
            </div>

            <div className="dp-tlist">
              {TECHNIQUES.map((tech, ti) => {
                const isOpen = openTech === tech.id;
                return (
                  <div
                    className={`dp-tc${isOpen ? " open" : ""}`}
                    key={tech.id}
                    style={{
                      animation: `fadeUp 0.6s ease ${0.05 + ti * 0.06}s both`,
                    }}
                  >
                    <div
                      className="dp-tc-hdr"
                      onClick={() => toggleTech(tech.id)}
                    >
                      <div
                        className="dp-tc-icon"
                        style={{
                          background: `color-mix(in srgb, ${tech.accent} 10%, transparent)`,
                        }}
                      >
                        {tech.icon}
                      </div>
                      <div className="dp-tc-mid">
                        <div className="dp-tc-name dp-ui">{tech.title}</div>
                        <div className="dp-tc-desc">{tech.desc}</div>
                      </div>
                      <div className="dp-tc-cnt dp-mono">
                        {tech.problems.length}
                      </div>
                      <Chev />
                    </div>
                    <div className="dp-tc-body">
                      <div className="dp-tc-body-in">
                        <div className="dp-div" />
                        <div className="dp-pl">
                          {tech.problems.map((p, pi) => (
                            <a
                              key={pi}
                              href={p.href || `${p.slug}-visualizer.html`}
                              className="dp-plink"
                            >
                              <span className="dp-pn dp-mono">
                                {String(pi + 1).padStart(2, "0")}
                              </span>
                              <span className="dp-pname dp-ui">{p.name}</span>
                              <span className="dp-parr">→</span>
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
        <footer className="dp-footer">
          DSA Visualizer Platform — Built for learners.{" "}
          <a href="index.html">Back to Dashboard</a>
        </footer>
      </div>
    </>
  );
}
