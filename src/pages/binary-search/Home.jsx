import { useState, useEffect, useRef, useCallback } from "react";
import { binarySearchTechniques } from "../../data/binarySearchTechniques";
import { Link } from "react-router-dom";

/* ================================================================
   BINARY SEARCH — DSA Visualizer Platform Topic Page

   Aesthetic: "Precision Optics / Laser Focus"
   - Deep charcoal-steel base with electric cyan & warm amber
   - Animated binary search hero: sorted array with lo/mid/hi
     pointers narrowing onto target step by step
   - Glassmorphism technique accordions (5 categories)
   - Dark / Light theme with smooth CSS-variable transitions
   ================================================================ */

// ─── PALETTES ────────────────────────────────────────────────────
const PAL = {
  dark: {
    "--bg-root": "#08090c",
    "--bg-hero": "#0a0c10",
    "--bg-section": "#0c0e14",
    "--bg-card": "rgba(14, 18, 28, 0.6)",
    "--bg-card-hover": "rgba(22, 28, 42, 0.78)",
    "--bg-glass": "rgba(14, 20, 32, 0.48)",
    "--bg-tag": "rgba(6, 182, 212, 0.07)",
    "--bg-problem": "rgba(6, 182, 212, 0.02)",
    "--bg-problem-hover": "rgba(6, 182, 212, 0.055)",
    "--text-1": "#dce6f0",
    "--text-2": "#7a8ea8",
    "--text-3": "#4a5c72",
    "--accent": "#06b6d4",
    "--accent-2": "#f59e0b",
    "--accent-3": "#10b981",
    "--accent-4": "#8b5cf6",
    "--accent-5": "#f43f5e",
    "--border": "rgba(6, 182, 212, 0.06)",
    "--border-card": "rgba(6, 182, 212, 0.09)",
    "--border-hover": "rgba(6, 182, 212, 0.24)",
    "--glow": "rgba(6, 182, 212, 0.04)",
    "--glow-strong": "rgba(6, 182, 212, 0.16)",
    "--shadow-card": "0 8px 44px rgba(0,0,0,0.42)",
    "--shadow-hover": "0 14px 52px rgba(6,182,212,0.06)",
    "--arr-bg": "rgba(6, 182, 212, 0.03)",
    "--arr-border": "rgba(6, 182, 212, 0.12)",
    "--arr-text": "rgba(6, 182, 212, 0.35)",
    "--arr-elim": "rgba(6, 182, 212, 0.08)",
    "--arr-elim-text": "rgba(6, 182, 212, 0.15)",
    "--lo-color": "#10b981",
    "--mid-color": "#06b6d4",
    "--hi-color": "#f59e0b",
    "--found-color": "#06b6d4",
    "--found-bg": "rgba(6, 182, 212, 0.15)",
    "--ptr-bg": "rgba(6, 182, 212, 0.06)",
    "--grid-line": "rgba(6, 182, 212, 0.012)",
    "--overlay": "rgba(8, 9, 12, 0.92)",
    "--good": "#10b981",
    "--mid": "#f59e0b",
    "--bad": "#f43f5e",
    "--crosshair": "rgba(6, 182, 212, 0.04)",
  },
  light: {
    "--bg-root": "#f5f7fa",
    "--bg-hero": "#ecf0f6",
    "--bg-section": "#eef2f8",
    "--bg-card": "rgba(255,255,255,0.72)",
    "--bg-card-hover": "rgba(255,255,255,0.9)",
    "--bg-glass": "rgba(255,255,255,0.58)",
    "--bg-tag": "rgba(8, 145, 178, 0.06)",
    "--bg-problem": "rgba(8, 145, 178, 0.02)",
    "--bg-problem-hover": "rgba(8, 145, 178, 0.05)",
    "--text-1": "#0f1a28",
    "--text-2": "#4a6480",
    "--text-3": "#94a8b8",
    "--accent": "#0891b2",
    "--accent-2": "#d97706",
    "--accent-3": "#059669",
    "--accent-4": "#7c3aed",
    "--accent-5": "#e11d48",
    "--border": "rgba(8, 145, 178, 0.07)",
    "--border-card": "rgba(8, 145, 178, 0.1)",
    "--border-hover": "rgba(8, 145, 178, 0.26)",
    "--glow": "rgba(8, 145, 178, 0.03)",
    "--glow-strong": "rgba(8, 145, 178, 0.08)",
    "--shadow-card": "0 8px 44px rgba(10,20,30,0.05)",
    "--shadow-hover": "0 14px 52px rgba(8,145,178,0.04)",
    "--arr-bg": "rgba(8, 145, 178, 0.03)",
    "--arr-border": "rgba(8, 145, 178, 0.12)",
    "--arr-text": "rgba(8, 145, 178, 0.35)",
    "--arr-elim": "rgba(8, 145, 178, 0.04)",
    "--arr-elim-text": "rgba(8, 145, 178, 0.14)",
    "--lo-color": "#059669",
    "--mid-color": "#0891b2",
    "--hi-color": "#d97706",
    "--found-color": "#0891b2",
    "--found-bg": "rgba(8, 145, 178, 0.1)",
    "--ptr-bg": "rgba(8, 145, 178, 0.04)",
    "--grid-line": "rgba(8, 145, 178, 0.018)",
    "--overlay": "rgba(245, 247, 250, 0.92)",
    "--good": "#059669",
    "--mid": "#d97706",
    "--bad": "#e11d48",
    "--crosshair": "rgba(8, 145, 178, 0.025)",
  },
};

// ─── BINARY SEARCH ANIMATION DATA ───────────────────────────────
const SORTED_ARR = [2, 5, 8, 12, 16, 23, 38, 42, 56, 72, 85, 91];
const TARGET = 42;

function computeSearchSteps(arr, target) {
  const steps = [];
  let lo = 0,
    hi = arr.length - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const cmp =
      arr[mid] === target
        ? "found"
        : arr[mid] < target
          ? "go-right"
          : "go-left";
    steps.push({ lo, hi, mid, cmp, log: formatLog(arr, lo, hi, mid, cmp) });
    if (cmp === "found") break;
    if (cmp === "go-right") lo = mid + 1;
    else hi = mid - 1;
  }
  return steps;
}

function formatLog(arr, lo, hi, mid, cmp) {
  if (cmp === "found") return `arr[${mid}] = ${arr[mid]} ✓ Target found!`;
  if (cmp === "go-right")
    return `arr[${mid}] = ${arr[mid]} < ${TARGET} → search right half`;
  return `arr[${mid}] = ${arr[mid]} > ${TARGET} → search left half`;
}

const SEARCH_STEPS = computeSearchSteps(SORTED_ARR, TARGET);

// ─── TECHNIQUES DATA ─────────────────────────────────────────────
const TECHNIQUES = binarySearchTechniques;

const COMPLEXITIES = [
  { op: "Search (sorted)", val: "O(log n)", tier: "good" },
  { op: "Lower / Upper Bound", val: "O(log n)", tier: "good" },
  { op: "On Answer Space", val: "O(log R · f(n))", tier: "mid" },
  { op: "2D Matrix", val: "O(log(m·n))", tier: "good" },
  { op: "Space", val: "O(1)", tier: "good" },
];

const INFO_CARDS = [
  {
    icon: "🎯",
    title: "What is Binary Search?",
    text: "An O(log n) algorithm that finds a target in sorted data by repeatedly halving the search range — comparing the middle element and eliminating half each step.",
  },
  {
    icon: "📐",
    title: "The Invariant",
    text: "Maintain lo ≤ answer ≤ hi. At each step, compute mid, test a condition, and shrink the window. Correctness depends on preserving this invariant through every branch.",
  },
  {
    icon: "⚡",
    title: "When to Use",
    text: "Sorted arrays, monotonic predicates, optimisation-to-feasibility reduction, rotated arrays, answer-space search, and any problem where half the candidates can be eliminated per step.",
  },
  {
    icon: "⚠️",
    title: "Trade-offs",
    text: "Requires sorted or monotonic structure. Off-by-one errors are the #1 bug source. Integer overflow in (lo+hi)/2 — use lo + (hi-lo)/2. Floating-point variants need epsilon termination.",
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
    33% { transform:translate(18px,-22px) scale(1.05); }
    66% { transform:translate(-14px,16px) scale(0.95); }
  }
  @keyframes ptrBounce {
    0%,100% { transform:translateY(0); }
    50% { transform:translateY(-3px); }
  }
  @keyframes foundPulse {
    0%,100% { box-shadow:0 0 0 0 transparent; }
    50% { box-shadow:0 0 18px 4px var(--glow-strong); }
  }
  @keyframes scanH {
    0% { left:-40px; opacity:0; }
    10% { opacity:0.6; }
    90% { opacity:0.6; }
    100% { left:calc(100% + 40px); opacity:0; }
  }

  *,*::before,*::after { margin:0; padding:0; box-sizing:border-box; }

  .bs-root {
    font-family: 'Lucida Console', 'Monaco', 'Menlo', monospace;
    background:var(--bg-root);
    color:var(--text-1);
    min-height:100vh;
    overflow-x:hidden;
    line-height:1.65;
    transition:background 0.5s cubic-bezier(0.4,0,0.2,1), color 0.5s cubic-bezier(0.4,0,0.2,1);
    position:relative;
  }
  /* Crosshair background */
  .bs-root::before {
    content:'';
    position:fixed; inset:0;
    background:
      linear-gradient(var(--grid-line) 1px, transparent 1px),
      linear-gradient(90deg, var(--grid-line) 1px, transparent 1px),
      radial-gradient(circle at 50% 50%, var(--crosshair) 0px, transparent 1px);
    background-size:52px 52px, 52px 52px, 4px 4px;
    pointer-events:none; z-index:0;
  }

  .bs-ui { font-family:'Segoe UI',system-ui,sans-serif; }
  .bs-mono { font-family:'Cascadia Code','Fira Code',Consolas,monospace; }

  /* ─── TOPBAR ─── */
  .bs-topbar {
    position:fixed; top:0; left:0; right:0; z-index:999;
    height:60px; display:flex; align-items:center; justify-content:space-between;
    padding:0 clamp(1rem,4vw,3rem);
    background:var(--overlay);
    backdrop-filter:blur(24px); -webkit-backdrop-filter:blur(24px);
    border-bottom:1px solid var(--border);
    transition:background 0.5s ease;
  }
  .bs-brand {
    display:flex; align-items:center; gap:10px;
    font-family:'Segoe UI',system-ui,sans-serif;
    font-weight:700; font-size:0.95rem; cursor:pointer;
  }
  .bs-logo {
    width:32px; height:32px; border-radius:8px;
    background:linear-gradient(135deg, var(--accent), var(--accent-2));
    display:grid; place-items:center;
    font-size:0.7rem; font-weight:800; color:#fff; position:relative;
  }
  .bs-logo::after {
    content:''; position:absolute; inset:0; border-radius:8px;
    background:linear-gradient(135deg,transparent 50%,rgba(255,255,255,0.15));
  }
  .bs-sep { color:var(--text-3); font-weight:300; margin:0 2px; }
  .bs-topic-lbl { color:var(--accent); }
  .bs-actions { display:flex; align-items:center; gap:14px; }
  .bs-back {
    display:flex; align-items:center; gap:5px;
    padding:5px 14px; border-radius:8px;
    background:var(--bg-glass); border:1px solid var(--border-card);
    color:var(--text-2); font-family:'Segoe UI',system-ui,sans-serif;
    font-size:0.78rem; font-weight:600; cursor:pointer; transition:all 0.3s ease;
  }
  .bs-back:hover { color:var(--text-1); border-color:var(--border-hover); }
  .bs-toggle {
    width:50px; height:26px; border-radius:20px;
    background:var(--bg-glass); border:1.5px solid var(--border-card);
    cursor:pointer; position:relative; transition:all 0.3s ease; flex-shrink:0;
  }
  .bs-toggle:hover { border-color:var(--border-hover); }
  .bs-knob {
    position:absolute; top:2px; left:2px;
    width:18px; height:18px; border-radius:50%;
    background:linear-gradient(135deg, var(--accent), var(--accent-2));
    transition:transform 0.4s cubic-bezier(0.34,1.56,0.64,1);
    display:grid; place-items:center; font-size:10px;
  }
  .bs-knob.on { transform:translateX(24px); }

  /* ─── HERO ─── */
  .bs-hero {
    position:relative; min-height:92vh;
    display:flex; align-items:center; justify-content:center;
    padding:100px clamp(1.5rem,5vw,4rem) 4rem;
    overflow:hidden;
  }
  .bs-hero-bg { position:absolute; inset:0; z-index:0; transition:background 0.5s ease; }
  .bs-orb { position:absolute; border-radius:50%; filter:blur(100px); pointer-events:none; z-index:1; }
  .bs-hero-inner {
    position:relative; z-index:2;
    max-width:1060px; width:100%;
    display:flex; flex-direction:column; align-items:center;
    gap:3.5rem;
  }
  .bs-hero-top {
    display:grid; grid-template-columns:1fr 1fr;
    gap:3rem; align-items:center; width:100%;
  }
  @media(max-width:880px) {
    .bs-hero-top { grid-template-columns:1fr; gap:2rem; }
    .bs-hero-text { text-align:center; align-items:center; }
  }
  .bs-hero-text {
    display:flex; flex-direction:column; align-items:flex-start; gap:1.1rem;
  }
  .bs-crumb {
    display:inline-flex; align-items:center; gap:6px;
    font-family:'Segoe UI',system-ui,sans-serif;
    font-size:0.7rem; font-weight:600;
    text-transform:uppercase; letter-spacing:0.14em;
    color:var(--text-3); animation:fadeUp 0.7s ease both;
  }
  .bs-crumb .s { opacity:0.4; }
  .bs-crumb .c { color:var(--accent); }
  .bs-h1 {
    font-family:'Segoe UI',system-ui,sans-serif;
    font-size:clamp(2.4rem,5.5vw,3.8rem);
    font-weight:800; letter-spacing:-0.04em; line-height:1.08;
    animation:fadeUp 0.7s ease 0.08s both;
  }
  .bs-h1 .grad {
    background:linear-gradient(135deg, var(--accent), var(--accent-2));
    -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
  }
  .bs-h1 .thin { font-weight:300; color:var(--text-2); }
  .bs-desc {
    font-family: Georgia, 'Times New Roman', serif;
    font-size:clamp(0.9rem,1.6vw,1.02rem);
    color:var(--text-2); line-height:1.78; max-width:460px;
    animation:fadeUp 0.7s ease 0.16s both;
  }
  .bs-cta {
    display:inline-flex; align-items:center; gap:10px;
    padding:14px 34px; border-radius:14px;
    background:linear-gradient(135deg, var(--accent), var(--accent-2));
    color:#fff; font-family:'Segoe UI',system-ui,sans-serif;
    font-weight:700; font-size:0.95rem;
    border:none; cursor:pointer; position:relative; overflow:hidden;
    transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease;
    animation:fadeUp 0.7s ease 0.28s both; text-decoration:none;
  }
  .bs-cta::before {
    content:''; position:absolute; inset:0;
    background:linear-gradient(135deg,transparent 40%,rgba(255,255,255,0.14));
  }
  .bs-cta:hover {
    transform:translateY(-3px) scale(1.02);
    box-shadow:0 10px 44px var(--glow-strong);
  }
  .bs-cta .ar { transition:transform 0.3s ease; }
  .bs-cta:hover .ar { transform:translateX(5px); }

  /* ─── SEARCH VISUAL ─── */
  .bs-viz-wrap {
    display:flex; flex-direction:column; align-items:center; gap:0.7rem;
    animation:fadeUp 0.8s ease 0.2s both;
  }
  .bs-viz-label {
    font-family:'Cascadia Code','Fira Code',Consolas,monospace;
    font-size:0.6rem; color:var(--text-3);
    text-transform:uppercase; letter-spacing:0.14em;
  }

  /* Array row */
  .bs-arr-wrap {
    display:flex; flex-direction:column; gap:0; align-items:center;
    width:100%; max-width:620px;
  }
  .bs-idx-row,.bs-val-row,.bs-ptr-row {
    display:flex; gap:0; justify-content:center;
  }
  .bs-idx-cell {
    width:48px; text-align:center; padding:2px 0;
    font-family:'Cascadia Code','Fira Code',Consolas,monospace;
    font-size:0.48rem; color:var(--text-3); letter-spacing:0.04em;
  }
  .bs-val-cell {
    width:48px; height:48px;
    border:1.5px solid var(--arr-border);
    background:var(--arr-bg);
    display:grid; place-items:center;
    font-family:'Cascadia Code','Fira Code',Consolas,monospace;
    font-size:0.78rem; font-weight:700;
    color:var(--arr-text);
    transition:all 0.4s ease;
    position:relative;
  }
  .bs-val-cell:first-child { border-radius:8px 0 0 8px; }
  .bs-val-cell:last-child { border-radius:0 8px 8px 0; }
  .bs-val-cell:not(:first-child) { border-left:none; }
  .bs-val-cell.in-range {
    color:var(--text-1);
    background:var(--arr-bg);
    border-color:var(--accent);
  }
  .bs-val-cell.eliminated {
    background:var(--arr-elim);
    color:var(--arr-elim-text);
    border-color:var(--arr-border);
  }
  .bs-val-cell.mid-cell {
    background:var(--found-bg);
    color:var(--mid-color);
    border-color:var(--mid-color);
    box-shadow:0 0 10px var(--glow);
    z-index:2;
  }
  .bs-val-cell.found-cell {
    background:var(--found-bg);
    color:var(--found-color);
    border-color:var(--found-color);
    animation:foundPulse 1.2s ease infinite;
    z-index:3;
  }

  /* Pointer row */
  .bs-ptr-cell {
    width:48px; text-align:center;
    padding:4px 0 0;
    font-family:'Cascadia Code','Fira Code',Consolas,monospace;
    font-size:0.5rem; font-weight:700;
    transition:opacity 0.3s ease;
  }
  .bs-ptr-cell .ptr-tag {
    display:inline-block;
    padding:1px 6px; border-radius:4px;
    transition:all 0.3s ease;
  }
  .bs-ptr-cell .ptr-tag.lo { background:rgba(16,185,129,0.12); color:var(--lo-color); border:1px solid rgba(16,185,129,0.25); }
  .bs-ptr-cell .ptr-tag.mid { background:rgba(6,182,212,0.12); color:var(--mid-color); border:1px solid rgba(6,182,212,0.25); animation:ptrBounce 1s ease infinite; }
  .bs-ptr-cell .ptr-tag.hi { background:rgba(245,158,11,0.12); color:var(--hi-color); border:1px solid rgba(245,158,11,0.25); }
  .bs-ptr-cell .ptr-tag.found { background:var(--found-bg); color:var(--found-color); border:1px solid var(--found-color); animation:ptrBounce 0.6s ease infinite; }

  /* Range bracket */
  .bs-range-bar {
    display:flex; align-items:center; justify-content:center; gap:6px;
    padding:6px 14px; border-radius:8px;
    background:var(--bg-glass); border:1px solid var(--border-card);
    font-family:'Cascadia Code','Fira Code',Consolas,monospace;
    font-size:0.6rem; color:var(--text-2);
    text-align:center; min-height:28px;
    backdrop-filter:blur(8px);
    transition:all 0.5s ease;
  }
  .bs-range-bar .hl { color:var(--accent); font-weight:700; }
  .bs-range-bar .lo-t { color:var(--lo-color); font-weight:700; }
  .bs-range-bar .hi-t { color:var(--hi-color); font-weight:700; }
  .bs-range-bar .mid-t { color:var(--mid-color); font-weight:700; }
  .bs-range-bar .found-t { color:var(--found-color); font-weight:700; }

  /* Step counter */
  .bs-step-row {
    display:flex; align-items:center; gap:10px;
    font-family:'Cascadia Code','Fira Code',Consolas,monospace;
    font-size:0.58rem; color:var(--text-3);
  }
  .bs-step-dot {
    width:8px; height:8px; border-radius:50%;
    border:1.5px solid var(--border-card);
    background:transparent;
    transition:all 0.3s ease;
  }
  .bs-step-dot.done { background:var(--accent); border-color:var(--accent); }
  .bs-step-dot.active { background:var(--accent-2); border-color:var(--accent-2); box-shadow:0 0 6px var(--accent-2); }

  /* Chips */
  .bs-chips {
    display:flex; flex-wrap:wrap; gap:5px; justify-content:center;
    animation:fadeUp 0.7s ease 0.55s both; margin-top:0.3rem;
  }
  .bs-chip {
    display:flex; align-items:center; gap:4px;
    padding:3px 10px; border-radius:18px;
    background:var(--bg-glass); border:1px solid var(--border-card);
    font-family:'Cascadia Code','Fira Code',Consolas,monospace;
    font-size:0.56rem; font-weight:600;
    backdrop-filter:blur(8px);
    transition:background 0.5s ease, border-color 0.5s ease;
  }
  .bs-chip .op { color:var(--text-3); text-transform:uppercase; letter-spacing:0.05em; }
  .bs-chip .v { font-weight:700; }
  .bs-chip .v.good { color:var(--good); }
  .bs-chip .v.mid { color:var(--mid); }
  .bs-chip .v.bad { color:var(--bad); }

  /* ─── INFO ─── */
  .bs-info-strip { position:relative; z-index:1; padding:0 clamp(1.5rem,5vw,4rem); }
  .bs-info-grid {
    max-width:980px; margin:-2rem auto 0;
    display:grid; grid-template-columns:repeat(auto-fit,minmax(210px,1fr)); gap:1rem;
  }
  .bs-icard {
    background:var(--bg-card);
    backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px);
    border:1px solid var(--border-card); border-radius:14px;
    padding:1.2rem 1.3rem; transition:all 0.35s ease;
  }
  .bs-icard:hover { border-color:var(--border-hover); box-shadow:var(--shadow-hover); transform:translateY(-2px); }
  .bs-icard-icon { font-size:1.3rem; margin-bottom:0.5rem; }
  .bs-icard-title { font-family:'Segoe UI',system-ui,sans-serif; font-size:0.8rem; font-weight:700; margin-bottom:0.2rem; }
  .bs-icard-text { font-family:Georgia,'Times New Roman',serif; font-size:0.76rem; color:var(--text-2); line-height:1.55; }

  /* ─── SECTION ─── */
  .bs-section { padding:5rem clamp(1.5rem,5vw,4rem); position:relative; z-index:1; }
  .bs-section-inner { max-width:980px; margin:0 auto; }
  .bs-eyebrow {
    font-family:'Segoe UI',system-ui,sans-serif;
    font-size:0.68rem; font-weight:700; text-transform:uppercase;
    letter-spacing:0.16em; color:var(--accent); margin-bottom:0.5rem;
  }
  .bs-sec-title {
    font-family:'Segoe UI',system-ui,sans-serif;
    font-size:clamp(1.3rem,3.5vw,1.85rem);
    font-weight:800; letter-spacing:-0.03em;
  }
  .bs-sec-sub { font-family:Georgia,'Times New Roman',serif; color:var(--text-2); font-size:0.9rem; margin-top:0.4rem; max-width:600px; }

  /* ─── TECH CARDS ─── */
  .bs-tlist { display:flex; flex-direction:column; gap:0.9rem; margin-top:2.5rem; }
  .bs-tc {
    background:var(--bg-card);
    border:1px solid var(--border-card); border-radius:14px;
    backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px);
    overflow:hidden;
    transition:background 0.5s ease, border-color 0.3s ease, box-shadow 0.3s ease;
  }
  .bs-tc:hover,.bs-tc.open { border-color:var(--border-hover); box-shadow:var(--shadow-hover); }
  .bs-tc-hdr {
    display:flex; align-items:center; gap:14px;
    padding:1.15rem 1.4rem; cursor:pointer; user-select:none;
    transition:background 0.25s ease;
  }
  .bs-tc-hdr:hover { background:var(--glow); }
  .bs-tc-icon {
    width:42px; height:42px; border-radius:10px;
    display:grid; place-items:center; font-size:1.05rem; flex-shrink:0;
    transition:transform 0.35s cubic-bezier(0.34,1.56,0.64,1);
  }
  .bs-tc:hover .bs-tc-icon,.bs-tc.open .bs-tc-icon { transform:scale(1.08) rotate(-4deg); }
  .bs-tc-mid { flex:1; min-width:0; }
  .bs-tc-name { font-family:'Segoe UI',system-ui,sans-serif; font-size:0.98rem; font-weight:700; }
  .bs-tc-desc { font-family:Georgia,'Times New Roman',serif; font-size:0.76rem; color:var(--text-2); margin-top:2px; line-height:1.5; }
  .bs-tc-cnt {
    font-family:'Cascadia Code','Fira Code',Consolas,monospace;
    font-size:0.62rem; color:var(--text-3);
    padding:3px 9px; border-radius:20px; background:var(--bg-tag);
    flex-shrink:0; white-space:nowrap;
  }
  .bs-chev {
    width:18px; height:18px; flex-shrink:0;
    transition:transform 0.4s cubic-bezier(0.34,1.56,0.64,1), color 0.3s ease;
    color:var(--text-3);
  }
  .bs-tc.open .bs-chev { transform:rotate(180deg); color:var(--accent); }
  .bs-tc-body { max-height:0; overflow:hidden; transition:max-height 0.5s cubic-bezier(0.4,0,0.2,1); }
  .bs-tc.open .bs-tc-body { max-height:700px; }
  .bs-tc-body-in {
    padding:0 1.4rem 1.3rem; opacity:0; transform:translateY(-8px);
    transition:opacity 0.35s ease 0.1s, transform 0.35s ease 0.1s;
  }
  .bs-tc.open .bs-tc-body-in { opacity:1; transform:translateY(0); }
  .bs-div { height:1px; background:var(--border); margin-bottom:0.7rem; }
  .bs-pl { display:flex; flex-direction:column; gap:3px; }
  .bs-plink {
    display:flex; align-items:center; gap:10px;
    padding:8px 14px; border-radius:8px;
    background:var(--bg-problem);
    transition:all 0.25s ease; cursor:pointer;
    text-decoration:none; color:var(--text-1);
    position:relative; overflow:hidden;
  }
  .bs-plink::before {
    content:''; position:absolute; left:0; top:0; bottom:0;
    width:3px; background:linear-gradient(180deg, var(--accent), var(--accent-2));
    opacity:0; transition:opacity 0.25s ease;
  }
  .bs-plink:hover { background:var(--bg-problem-hover); transform:translateX(4px); }
  .bs-plink:hover::before { opacity:1; }
  .bs-pn {
    font-family:'Cascadia Code','Fira Code',Consolas,monospace;
    font-size:0.62rem; color:var(--text-3); font-weight:600;
    width:22px; text-align:center; flex-shrink:0;
  }
  .bs-pname { font-family:'Segoe UI',system-ui,sans-serif; font-size:0.82rem; font-weight:600; flex:1; }
  .bs-parr {
    color:var(--text-3); opacity:0; transform:translateX(-6px);
    transition:all 0.25s ease; font-size:0.76rem;
  }
  .bs-plink:hover .bs-parr { opacity:1; transform:translateX(0); color:var(--accent); }

  /* ─── FOOTER ─── */
  .bs-footer {
    position:relative; z-index:1;
    padding:2.5rem clamp(1.5rem,5vw,4rem);
    text-align:center; border-top:1px solid var(--border);
    font-family:'Segoe UI',system-ui,sans-serif;
    font-size:0.74rem; color:var(--text-3);
    transition:border-color 0.5s ease;
  }
  .bs-footer a { color:var(--accent); text-decoration:none; }

  @media(max-width:700px) {
    .bs-hero { min-height:auto; padding-top:85px; padding-bottom:2rem; }
    .bs-val-cell,.bs-idx-cell,.bs-ptr-cell { width:36px; }
    .bs-val-cell { height:36px; font-size:0.62rem; }
    .bs-idx-cell { font-size:0.4rem; }
    .bs-ptr-cell { font-size:0.42rem; }
    .bs-ptr-cell .ptr-tag { padding:1px 3px; font-size:0.4rem; }
    .bs-info-grid { grid-template-columns:1fr 1fr; }
    .bs-tc-desc { display:none; }
    .bs-tc-hdr { padding:1rem 1.1rem; gap:10px; }
  }
`;

const Chev = () => (
  <svg
    className="bs-chev"
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
export default function BinarySearchPage() {
  const [theme, setTheme] = useState("dark");
  const [openTech, setOpenTech] = useState(null);
  const [stepIdx, setStepIdx] = useState(0);
  const rootRef = useRef(null);

  useEffect(() => {
    const vars = PAL[theme];
    const root = rootRef.current;
    if (!root) return;
    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
  }, [theme]);

  // Binary search step animation
  useEffect(() => {
    let step = 0;
    let paused = 0;
    const id = setInterval(() => {
      if (paused > 0) {
        paused--;
        return;
      }
      if (step < SEARCH_STEPS.length) {
        setStepIdx(step);
        if (SEARCH_STEPS[step].cmp === "found") {
          paused = 3;
        }
        step++;
      } else {
        step = 0;
        paused = 1;
        setStepIdx(0);
      }
    }, 1200);
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

  const cur = SEARCH_STEPS[stepIdx];
  const isFound = cur.cmp === "found";

  return (
    <>
      <style>{css}</style>
      <div className="bs-root" ref={rootRef}>
        <nav className="bs-topbar">
          <div className="bs-brand">
            <div className="bs-logo">DS</div>
            <span className="bs-ui">DSA Visualizer</span>
            <span className="bs-sep">/</span>
            <span className="bs-topic-lbl bs-ui">Binary Search</span>
          </div>
          <div className="bs-actions">
            <button
              className="bs-back"
              onClick={() => (window.location.href = "index.html")}
            >
              ← Dashboard
            </button>
            <div
              className="bs-toggle"
              onClick={toggleTheme}
              role="button"
              tabIndex={0}
              onKeyDown={(e) =>
                (e.key === "Enter" || e.key === " ") && toggleTheme()
              }
              aria-label="Toggle theme"
            >
              <div className={`bs-knob${theme === "light" ? " on" : ""}`}>
                {theme === "dark" ? "🌙" : "☀️"}
              </div>
            </div>
          </div>
        </nav>

        <section className="bs-hero">
          <div
            className="bs-hero-bg"
            style={{
              background:
                theme === "dark"
                  ? "radial-gradient(ellipse 65% 50% at 20% 18%, #0c1220 0%, transparent 70%), radial-gradient(ellipse 55% 55% at 82% 74%, #14100a 0%, transparent 60%), #08090c"
                  : "radial-gradient(ellipse 65% 50% at 20% 18%, #dce8f6 0%, transparent 70%), radial-gradient(ellipse 55% 55% at 82% 74%, #f6f0e4 0%, transparent 60%), #f5f7fa",
            }}
          />
          <div
            className="bs-orb"
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
            className="bs-orb"
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

          <div className="bs-hero-inner">
            <div className="bs-hero-top">
              <div className="bs-hero-text">
                <div className="bs-crumb">
                  <span>DSA</span>
                  <span className="s">›</span>
                  <span>Algorithms</span>
                  <span className="s">›</span>
                  <span className="c">Binary Search</span>
                </div>
                <h1 className="bs-h1 bs-ui">
                  <span className="grad">Binary</span>
                  <br />
                  Search
                  <br />
                  <span className="thin">Divide & Eliminate</span>
                </h1>
                <p className="bs-desc">
                  The quintessential O(log n) algorithm — halve the search space
                  with each comparison. Binary search isn't just for sorted
                  arrays; it applies anywhere a monotonic predicate splits the
                  domain into true/false regions. Master the invariant, master
                  the boundaries, and a universe of problems opens up.
                </p>
                <Link to="/binary-search/visualizer" className="bs-cta">
                  Open Visualizer <span className="ar">→</span>
                </Link>
                {/* <a href="binary-search-visualizer.html" className="bs-cta">
                  Open Visualizer <span className="ar">→</span>
                </a> */}
              </div>

              {/* Animated search visual */}
              <div className="bs-viz-wrap">
                <div className="bs-viz-label bs-mono">
                  Searching for{" "}
                  <span style={{ color: "var(--accent)", fontWeight: 700 }}>
                    {TARGET}
                  </span>{" "}
                  in sorted array
                </div>

                <div className="bs-arr-wrap">
                  {/* Index row */}
                  <div className="bs-idx-row">
                    {SORTED_ARR.map((_, i) => (
                      <div className="bs-idx-cell" key={i}>
                        {i}
                      </div>
                    ))}
                  </div>
                  {/* Value cells */}
                  <div className="bs-val-row">
                    {SORTED_ARR.map((val, i) => {
                      const inRange = i >= cur.lo && i <= cur.hi;
                      const isMid = i === cur.mid;
                      const isFoundCell = isMid && isFound;
                      let cls = "bs-val-cell";
                      if (isFoundCell) cls += " found-cell";
                      else if (isMid) cls += " mid-cell";
                      else if (inRange) cls += " in-range";
                      else cls += " eliminated";
                      return (
                        <div className={cls} key={i}>
                          {val}
                        </div>
                      );
                    })}
                  </div>
                  {/* Pointer row */}
                  <div className="bs-ptr-row">
                    {SORTED_ARR.map((_, i) => {
                      const tags = [];
                      if (i === cur.lo && !isFound) tags.push("lo");
                      if (i === cur.mid) tags.push(isFound ? "found" : "mid");
                      if (i === cur.hi && !isFound) tags.push("hi");
                      return (
                        <div className="bs-ptr-cell" key={i}>
                          {tags.map((t) => (
                            <span key={t} className={`ptr-tag ${t}`}>
                              {t === "found" ? "✓" : t}
                            </span>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Log line */}
                <div className="bs-range-bar">
                  {isFound ? (
                    <span>
                      <span className="found-t">
                        ✓ Found {TARGET} at index {cur.mid}
                      </span>
                    </span>
                  ) : (
                    <span>
                      <span className="mid-t">
                        arr[{cur.mid}]={SORTED_ARR[cur.mid]}
                      </span>
                      {cur.cmp === "go-right" ? " < " : " > "}
                      <span className="hl">{TARGET}</span>
                      {cur.cmp === "go-right" ? " → search " : " → search "}
                      <span
                        className={cur.cmp === "go-right" ? "hi-t" : "lo-t"}
                      >
                        {cur.cmp === "go-right" ? "right" : "left"}
                      </span>
                    </span>
                  )}
                </div>

                {/* Step dots */}
                <div className="bs-step-row">
                  <span>Step:</span>
                  {SEARCH_STEPS.map((_, i) => (
                    <div
                      key={i}
                      className={`bs-step-dot${i < stepIdx ? " done" : ""}${i === stepIdx ? " active" : ""}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Complexity chips — below hero grid */}
            <div className="bs-chips">
              {COMPLEXITIES.map((c, i) => (
                <div className="bs-chip" key={i}>
                  <span className="op">{c.op}</span>
                  <span className={`v ${c.tier}`}>{c.val}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Info cards */}
        <div className="bs-info-strip">
          <div className="bs-info-grid">
            {INFO_CARDS.map((c, i) => (
              <div
                className="bs-icard"
                key={i}
                style={{
                  animation: `fadeUp 0.6s ease ${0.5 + i * 0.08}s both`,
                }}
              >
                <div className="bs-icard-icon">{c.icon}</div>
                <div className="bs-icard-title bs-ui">{c.title}</div>
                <div className="bs-icard-text">{c.text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Techniques */}
        <section className="bs-section">
          <div className="bs-section-inner">
            <div
              style={{
                marginBottom: "0.5rem",
                animation: "fadeUp 0.6s ease both",
              }}
            >
              <div className="bs-eyebrow">Explore · {TOTAL} Problems</div>
              <h2 className="bs-sec-title bs-ui">
                Binary Search Techniques & Patterns
              </h2>
              <p className="bs-sec-sub">
                Master these five fundamental binary search paradigms — from
                classic sorted-array lookup to searching abstract answer spaces
                — the key to unlocking O(log n) everywhere.
              </p>
            </div>

            <div className="bs-tlist">
              {TECHNIQUES.map((tech, ti) => {
                const isOpen = openTech === tech.id;
                return (
                  <div
                    className={`bs-tc${isOpen ? " open" : ""}`}
                    key={tech.id}
                    style={{
                      animation: `fadeUp 0.6s ease ${0.05 + ti * 0.06}s both`,
                    }}
                  >
                    <div
                      className="bs-tc-hdr"
                      onClick={() => toggleTech(tech.id)}
                    >
                      <div
                        className="bs-tc-icon"
                        style={{
                          background: `color-mix(in srgb, ${tech.accent} 10%, transparent)`,
                        }}
                      >
                        {tech.icon}
                      </div>
                      <div className="bs-tc-mid">
                        <div className="bs-tc-name bs-ui">{tech.title}</div>
                        <div className="bs-tc-desc">{tech.desc}</div>
                      </div>
                      <div className="bs-tc-cnt bs-mono">
                        {tech.problems.length}
                      </div>
                      <Chev />
                    </div>
                    <div className="bs-tc-body">
                      <div className="bs-tc-body-in">
                        <div className="bs-div" />
                        <div className="bs-pl">
                          {tech.problems.map((p, pi) => (
                            <a
                              key={pi}
                              href={p.href || `${p.slug}-visualizer.html`}
                              className="bs-plink"
                            >
                              <span className="bs-pn bs-mono">
                                {String(pi + 1).padStart(2, "0")}
                              </span>
                              <span className="bs-pname bs-ui">{p.name}</span>
                              <span className="bs-parr">→</span>
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

        <footer className="bs-footer">
          DSA Visualizer Platform — Built for learners.{" "}
          <a href="index.html">Back to Dashboard</a>
        </footer>
      </div>
    </>
  );
}
