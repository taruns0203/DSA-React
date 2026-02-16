import { useState, useEffect, useRef, useCallback } from "react";
import { recursionTechniques } from "../../data/recursionTechniques";
import { Link } from "react-router-dom";

/* ================================================================
   RECURSION — DSA Visualizer Platform Topic Page

   Aesthetic: "Fractal / Infinite Mirror"
   - Deep violet-obsidian base with warm coral & electric teal
   - Animated call-stack hero: factorial(5) expand + collapse
   - Glassmorphism technique accordions (6 categories)
   - Dark / Light theme with smooth CSS-variable transitions
   ================================================================ */

// ─── PALETTES ────────────────────────────────────────────────────
const PAL = {
  dark: {
    "--bg-root": "#0a070e",
    "--bg-hero": "#0c0812",
    "--bg-section": "#0e0a14",
    "--bg-card": "rgba(20, 14, 32, 0.6)",
    "--bg-card-hover": "rgba(30, 22, 48, 0.78)",
    "--bg-glass": "rgba(22, 14, 36, 0.48)",
    "--bg-tag": "rgba(251, 113, 133, 0.07)",
    "--bg-problem": "rgba(251, 113, 133, 0.02)",
    "--bg-problem-hover": "rgba(251, 113, 133, 0.055)",
    "--text-1": "#e8e0f4",
    "--text-2": "#9488aa",
    "--text-3": "#5e4e78",
    "--accent": "#fb7185",
    "--accent-2": "#2dd4bf",
    "--accent-3": "#fbbf24",
    "--accent-4": "#818cf8",
    "--accent-5": "#f472b6",
    "--accent-6": "#38bdf8",
    "--border": "rgba(251, 113, 133, 0.06)",
    "--border-card": "rgba(251, 113, 133, 0.09)",
    "--border-hover": "rgba(251, 113, 133, 0.24)",
    "--glow": "rgba(251, 113, 133, 0.04)",
    "--glow-strong": "rgba(251, 113, 133, 0.16)",
    "--shadow-card": "0 8px 44px rgba(0,0,0,0.42)",
    "--shadow-hover": "0 14px 52px rgba(251,113,133,0.06)",
    "--stack-bg": "rgba(251, 113, 133, 0.04)",
    "--stack-border": "rgba(251, 113, 133, 0.15)",
    "--stack-active-bg": "rgba(251, 113, 133, 0.12)",
    "--stack-active-border": "#fb7185",
    "--stack-return-bg": "rgba(45, 212, 191, 0.08)",
    "--stack-return-border": "rgba(45, 212, 191, 0.3)",
    "--stack-text": "#fb7185",
    "--stack-return-text": "#2dd4bf",
    "--grid-line": "rgba(251, 113, 133, 0.012)",
    "--overlay": "rgba(10, 7, 14, 0.92)",
    "--good": "#2dd4bf",
    "--mid": "#fbbf24",
    "--bad": "#fb7185",
    "--fractal-a": "rgba(251, 113, 133, 0.04)",
    "--fractal-b": "rgba(45, 212, 191, 0.03)",
  },
  light: {
    "--bg-root": "#faf7fc",
    "--bg-hero": "#f4eef8",
    "--bg-section": "#f6f0fa",
    "--bg-card": "rgba(255,255,255,0.72)",
    "--bg-card-hover": "rgba(255,255,255,0.9)",
    "--bg-glass": "rgba(255,255,255,0.58)",
    "--bg-tag": "rgba(190, 18, 60, 0.06)",
    "--bg-problem": "rgba(190, 18, 60, 0.02)",
    "--bg-problem-hover": "rgba(190, 18, 60, 0.05)",
    "--text-1": "#1e122a",
    "--text-2": "#6e5a82",
    "--text-3": "#a494b6",
    "--accent": "#be123c",
    "--accent-2": "#0d9488",
    "--accent-3": "#b45309",
    "--accent-4": "#4f46e5",
    "--accent-5": "#db2777",
    "--accent-6": "#0284c7",
    "--border": "rgba(190, 18, 60, 0.07)",
    "--border-card": "rgba(190, 18, 60, 0.1)",
    "--border-hover": "rgba(190, 18, 60, 0.26)",
    "--glow": "rgba(190, 18, 60, 0.03)",
    "--glow-strong": "rgba(190, 18, 60, 0.08)",
    "--shadow-card": "0 8px 44px rgba(30,18,42,0.05)",
    "--shadow-hover": "0 14px 52px rgba(190,18,60,0.04)",
    "--stack-bg": "rgba(190, 18, 60, 0.03)",
    "--stack-border": "rgba(190, 18, 60, 0.12)",
    "--stack-active-bg": "rgba(190, 18, 60, 0.08)",
    "--stack-active-border": "#be123c",
    "--stack-return-bg": "rgba(13, 148, 136, 0.06)",
    "--stack-return-border": "rgba(13, 148, 136, 0.25)",
    "--stack-text": "#be123c",
    "--stack-return-text": "#0d9488",
    "--grid-line": "rgba(190, 18, 60, 0.018)",
    "--overlay": "rgba(250, 247, 252, 0.92)",
    "--good": "#0d9488",
    "--mid": "#b45309",
    "--bad": "#be123c",
    "--fractal-a": "rgba(190, 18, 60, 0.025)",
    "--fractal-b": "rgba(13, 148, 136, 0.02)",
  },
};

// ─── CALL STACK ANIMATION DATA ───────────────────────────────────
// factorial(5) → frames show stack growing then unwinding
const CALL_FRAMES = [
  // Phase 0: expanding — each step pushes a frame
  { label: "factorial(5)", depth: 0, phase: "call" },
  { label: "factorial(4)", depth: 1, phase: "call" },
  { label: "factorial(3)", depth: 2, phase: "call" },
  { label: "factorial(2)", depth: 3, phase: "call" },
  { label: "factorial(1)", depth: 4, phase: "call" },
  { label: "factorial(0)", depth: 5, phase: "base" },
  // Phase 1: collapsing — each step pops with return value
  { label: "return 1", depth: 5, phase: "return" },
  { label: "return 1", depth: 4, phase: "return" },
  { label: "return 2", depth: 3, phase: "return" },
  { label: "return 6", depth: 2, phase: "return" },
  { label: "return 24", depth: 1, phase: "return" },
  { label: "return 120", depth: 0, phase: "return" },
];

// The full stack state at each animation step
function buildStackStates() {
  const states = [];
  const stack = [];
  const names = [
    "factorial(5)",
    "factorial(4)",
    "factorial(3)",
    "factorial(2)",
    "factorial(1)",
    "factorial(0)",
  ];
  const returns = [120, 24, 6, 2, 1, 1];

  // Expansion: push each call
  for (let i = 0; i < 6; i++) {
    stack.push({ name: names[i], status: "active", ret: null });
    states.push({
      frames: stack.map((f, j) => ({
        ...f,
        status: j === stack.length - 1 ? "active" : "waiting",
      })),
      log: `Call: ${names[i]}`,
      activeIdx: stack.length - 1,
    });
  }

  // Collapse: pop each with return value
  for (let i = 5; i >= 0; i--) {
    const ret = returns[i];
    states.push({
      frames: stack.slice(0, i + 1).map((f, j) => ({
        ...f,
        status: j === i ? "returning" : j === i - 1 ? "active" : "waiting",
        ret: j === i ? ret : null,
      })),
      log:
        i === 5
          ? "Base case! return 1"
          : `${names[i]} → ${i + 1} × ${returns[i + 1]} = ${ret}`,
      activeIdx: i,
    });
  }

  // Final: empty stack
  states.push({ frames: [], log: "✓ Result: 120", activeIdx: -1 });

  return states;
}

const STACK_STATES = buildStackStates();

// ─── TECHNIQUES DATA ─────────────────────────────────────────────
const TECHNIQUES = recursionTechniques;

const COMPLEXITIES = [
  { op: "Linear (single call)", val: "O(n)", tier: "good" },
  { op: "Binary (split)", val: "O(log n)", tier: "good" },
  { op: "Tree (two calls)", val: "O(2ⁿ)", tier: "bad" },
  { op: "With memo", val: "O(states)", tier: "mid" },
  { op: "Stack space", val: "O(depth)", tier: "mid" },
];

const INFO_CARDS = [
  {
    icon: "🔄",
    title: "What is Recursion?",
    text: "A function that calls itself with a smaller input until it reaches a base case. Each call creates a stack frame, forming a chain of deferred computations that unwind on return.",
  },
  {
    icon: "📚",
    title: "The Call Stack",
    text: "Each recursive call pushes a frame onto the call stack with its own local variables. Stack overflow occurs when depth exceeds limits (~10K frames). Tail-call optimisation can help in some languages.",
  },
  {
    icon: "⚡",
    title: "When to Use",
    text: "Problems with self-similar structure: trees, graphs (DFS), divide-and-conquer, backtracking, permutation generation, and any problem naturally expressed as f(n) = g(f(n-1)).",
  },
  {
    icon: "⚠️",
    title: "Trade-offs",
    text: "Stack overhead per frame. Exponential blowup without memoization. Iterative conversion is always possible but often less readable. Space complexity equals recursion depth.",
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
  @keyframes framePush {
    from { opacity:0; transform:translateX(-18px) scaleY(0.6); }
    to { opacity:1; transform:translateX(0) scaleY(1); }
  }
  @keyframes framePop {
    from { opacity:1; transform:translateX(0); }
    to { opacity:0; transform:translateX(18px); }
  }
  @keyframes returnGlow {
    0%,100% { box-shadow:0 0 0 0 transparent; }
    50% { box-shadow:0 0 16px 2px var(--glow-strong); }
  }
  @keyframes depthPulse {
    0%,100% { opacity:0.3; }
    50% { opacity:0.7; }
  }

  *,*::before,*::after { margin:0; padding:0; box-sizing:border-box; }

  .rc-root {
    font-family: 'Optima', 'Candara', 'Trebuchet MS', sans-serif;
    background:var(--bg-root);
    color:var(--text-1);
    min-height:100vh;
    overflow-x:hidden;
    line-height:1.65;
    transition:background 0.5s cubic-bezier(0.4,0,0.2,1), color 0.5s cubic-bezier(0.4,0,0.2,1);
    position:relative;
  }
  /* Fractal-inspired background: nested diamonds */
  .rc-root::before {
    content:'';
    position:fixed; inset:0;
    background:
      linear-gradient(45deg, var(--fractal-a) 25%, transparent 25%) -20px 0,
      linear-gradient(-45deg, var(--fractal-a) 25%, transparent 25%) -20px 0,
      linear-gradient(45deg, transparent 75%, var(--fractal-b) 75%),
      linear-gradient(-45deg, transparent 75%, var(--fractal-b) 75%);
    background-size:40px 40px;
    pointer-events:none; z-index:0; opacity:0.6;
  }

  .rc-ui { font-family:'Segoe UI',system-ui,sans-serif; }
  .rc-mono { font-family:'Cascadia Code','Fira Code',Consolas,monospace; }

  /* ─── TOPBAR ─── */
  .rc-topbar {
    position:fixed; top:0; left:0; right:0; z-index:999;
    height:60px; display:flex; align-items:center; justify-content:space-between;
    padding:0 clamp(1rem,4vw,3rem);
    background:var(--overlay);
    backdrop-filter:blur(24px); -webkit-backdrop-filter:blur(24px);
    border-bottom:1px solid var(--border);
    transition:background 0.5s ease;
  }
  .rc-brand {
    display:flex; align-items:center; gap:10px;
    font-family:'Segoe UI',system-ui,sans-serif;
    font-weight:700; font-size:0.95rem; cursor:pointer;
  }
  .rc-logo {
    width:32px; height:32px; border-radius:8px;
    background:linear-gradient(135deg, var(--accent), var(--accent-2));
    display:grid; place-items:center;
    font-size:0.7rem; font-weight:800; color:#fff; position:relative;
  }
  .rc-logo::after {
    content:''; position:absolute; inset:0; border-radius:8px;
    background:linear-gradient(135deg,transparent 50%,rgba(255,255,255,0.15));
  }
  .rc-sep { color:var(--text-3); font-weight:300; margin:0 2px; }
  .rc-topic-lbl { color:var(--accent); }
  .rc-actions { display:flex; align-items:center; gap:14px; }
  .rc-back {
    display:flex; align-items:center; gap:5px;
    padding:5px 14px; border-radius:8px;
    background:var(--bg-glass); border:1px solid var(--border-card);
    color:var(--text-2); font-family:'Segoe UI',system-ui,sans-serif;
    font-size:0.78rem; font-weight:600; cursor:pointer; transition:all 0.3s ease;
  }
  .rc-back:hover { color:var(--text-1); border-color:var(--border-hover); }
  .rc-toggle {
    width:50px; height:26px; border-radius:20px;
    background:var(--bg-glass); border:1.5px solid var(--border-card);
    cursor:pointer; position:relative; transition:all 0.3s ease; flex-shrink:0;
  }
  .rc-toggle:hover { border-color:var(--border-hover); }
  .rc-knob {
    position:absolute; top:2px; left:2px;
    width:18px; height:18px; border-radius:50%;
    background:linear-gradient(135deg, var(--accent), var(--accent-2));
    transition:transform 0.4s cubic-bezier(0.34,1.56,0.64,1);
    display:grid; place-items:center; font-size:10px;
  }
  .rc-knob.on { transform:translateX(24px); }

  /* ─── HERO ─── */
  .rc-hero {
    position:relative; min-height:92vh;
    display:flex; align-items:center; justify-content:center;
    padding:100px clamp(1.5rem,5vw,4rem) 4rem;
    overflow:hidden;
  }
  .rc-hero-bg { position:absolute; inset:0; z-index:0; transition:background 0.5s ease; }
  .rc-orb { position:absolute; border-radius:50%; filter:blur(100px); pointer-events:none; z-index:1; }
  .rc-hero-inner {
    position:relative; z-index:2;
    max-width:1060px; width:100%;
    display:grid; grid-template-columns:1fr 1fr;
    gap:3rem; align-items:center;
  }
  @media(max-width:880px) {
    .rc-hero-inner { grid-template-columns:1fr; gap:2.5rem; }
    .rc-hero-text { text-align:center; align-items:center; }
  }
  .rc-hero-text {
    display:flex; flex-direction:column; align-items:flex-start; gap:1.1rem;
  }
  .rc-crumb {
    display:inline-flex; align-items:center; gap:6px;
    font-family:'Segoe UI',system-ui,sans-serif;
    font-size:0.7rem; font-weight:600;
    text-transform:uppercase; letter-spacing:0.14em;
    color:var(--text-3); animation:fadeUp 0.7s ease both;
  }
  .rc-crumb .s { opacity:0.4; }
  .rc-crumb .c { color:var(--accent); }
  .rc-h1 {
    font-family:'Segoe UI',system-ui,sans-serif;
    font-size:clamp(2.6rem,6vw,4rem);
    font-weight:800; letter-spacing:-0.04em; line-height:1.08;
    animation:fadeUp 0.7s ease 0.08s both;
  }
  .rc-h1 .grad {
    background:linear-gradient(135deg, var(--accent), var(--accent-2));
    -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
  }
  .rc-h1 .thin { font-weight:300; color:var(--text-2); }
  .rc-desc {
    font-size:clamp(0.9rem,1.6vw,1.02rem);
    color:var(--text-2); line-height:1.78; max-width:460px;
    animation:fadeUp 0.7s ease 0.16s both;
  }
  .rc-cta {
    display:inline-flex; align-items:center; gap:10px;
    padding:14px 34px; border-radius:14px;
    background:linear-gradient(135deg, var(--accent), var(--accent-2));
    color:#fff; font-family:'Segoe UI',system-ui,sans-serif;
    font-weight:700; font-size:0.95rem;
    border:none; cursor:pointer; position:relative; overflow:hidden;
    transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease;
    animation:fadeUp 0.7s ease 0.28s both; text-decoration:none;
  }
  .rc-cta::before {
    content:''; position:absolute; inset:0;
    background:linear-gradient(135deg,transparent 40%,rgba(255,255,255,0.14));
  }
  .rc-cta:hover {
    transform:translateY(-3px) scale(1.02);
    box-shadow:0 10px 44px var(--glow-strong);
  }
  .rc-cta .ar { transition:transform 0.3s ease; }
  .rc-cta:hover .ar { transform:translateX(5px); }

  /* ─── CALL STACK VISUAL ─── */
  .rc-viz-wrap {
    display:flex; flex-direction:column; align-items:center; gap:0.8rem;
    animation:fadeUp 0.8s ease 0.25s both;
  }
  .rc-viz-label {
    font-family:'Cascadia Code','Fira Code',Consolas,monospace;
    font-size:0.6rem; color:var(--text-3);
    text-transform:uppercase; letter-spacing:0.14em;
  }

  .rc-stack-container {
    display:flex; flex-direction:column;
    gap:4px; width:100%; max-width:340px;
    min-height:270px;
    padding:16px;
    background:var(--bg-card);
    border:1px solid var(--border-card);
    border-radius:14px;
    backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px);
    transition:background 0.5s ease, border-color 0.5s ease;
    position:relative;
  }
  .rc-stack-title {
    font-family:'Cascadia Code','Fira Code',Consolas,monospace;
    font-size:0.54rem; font-weight:700; color:var(--text-3);
    text-transform:uppercase; letter-spacing:0.12em;
    margin-bottom:4px;
    display:flex; align-items:center; justify-content:space-between;
  }
  .rc-stack-depth {
    font-size:0.52rem; color:var(--text-3); opacity:0.6;
    animation:depthPulse 2s ease infinite;
  }

  .rc-frame {
    display:flex; align-items:center; gap:8px;
    padding:8px 12px; border-radius:8px;
    background:var(--stack-bg);
    border:1.5px solid var(--stack-border);
    font-family:'Cascadia Code','Fira Code',Consolas,monospace;
    font-size:0.72rem; font-weight:600;
    color:var(--text-2);
    transition:all 0.35s ease;
    animation:framePush 0.35s cubic-bezier(0.34,1.56,0.64,1) both;
  }
  .rc-frame.active {
    background:var(--stack-active-bg);
    border-color:var(--stack-active-border);
    color:var(--stack-text);
    box-shadow:0 0 12px var(--glow);
  }
  .rc-frame.returning {
    background:var(--stack-return-bg);
    border-color:var(--stack-return-border);
    color:var(--stack-return-text);
    animation:returnGlow 1.2s ease infinite;
  }
  .rc-frame.waiting {
    opacity:0.5;
  }

  .rc-frame-indent {
    width:16px; height:1px;
    background:var(--border-card);
    flex-shrink:0;
    opacity:0.5;
  }
  .rc-frame-label { flex:1; }
  .rc-frame-ret {
    font-size:0.6rem; color:var(--stack-return-text);
    font-weight:700; flex-shrink:0;
    padding:2px 7px; border-radius:4px;
    background:var(--stack-return-bg);
    border:1px solid var(--stack-return-border);
  }
  .rc-frame-arrow {
    color:var(--text-3); opacity:0.4; flex-shrink:0; font-size:0.6rem;
  }

  /* Log line */
  .rc-log {
    padding:8px 14px; border-radius:8px;
    background:var(--bg-glass); border:1px solid var(--border-card);
    font-family:'Cascadia Code','Fira Code',Consolas,monospace;
    font-size:0.62rem; color:var(--text-2);
    text-align:center; min-height:30px;
    display:flex; align-items:center; justify-content:center;
    backdrop-filter:blur(8px);
    transition:all 0.5s ease;
  }
  .rc-log .hl { color:var(--accent); font-weight:700; }
  .rc-log .ret { color:var(--stack-return-text); font-weight:700; }

  /* Chips */
  .rc-chips {
    display:flex; flex-wrap:wrap; gap:5px; justify-content:center;
    animation:fadeUp 0.7s ease 0.55s both; margin-top:0.3rem;
  }
  .rc-chip {
    display:flex; align-items:center; gap:4px;
    padding:3px 10px; border-radius:18px;
    background:var(--bg-glass); border:1px solid var(--border-card);
    font-family:'Cascadia Code','Fira Code',Consolas,monospace;
    font-size:0.56rem; font-weight:600;
    backdrop-filter:blur(8px);
    transition:background 0.5s ease, border-color 0.5s ease;
  }
  .rc-chip .op { color:var(--text-3); text-transform:uppercase; letter-spacing:0.05em; }
  .rc-chip .v { font-weight:700; }
  .rc-chip .v.good { color:var(--good); }
  .rc-chip .v.mid { color:var(--mid); }
  .rc-chip .v.bad { color:var(--bad); }

  /* ─── INFO ─── */
  .rc-info-strip { position:relative; z-index:1; padding:0 clamp(1.5rem,5vw,4rem); }
  .rc-info-grid {
    max-width:980px; margin:-2rem auto 0;
    display:grid; grid-template-columns:repeat(auto-fit,minmax(210px,1fr)); gap:1rem;
  }
  .rc-icard {
    background:var(--bg-card);
    backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px);
    border:1px solid var(--border-card); border-radius:14px;
    padding:1.2rem 1.3rem; transition:all 0.35s ease;
  }
  .rc-icard:hover { border-color:var(--border-hover); box-shadow:var(--shadow-hover); transform:translateY(-2px); }
  .rc-icard-icon { font-size:1.3rem; margin-bottom:0.5rem; }
  .rc-icard-title { font-family:'Segoe UI',system-ui,sans-serif; font-size:0.8rem; font-weight:700; margin-bottom:0.2rem; }
  .rc-icard-text { font-size:0.76rem; color:var(--text-2); line-height:1.55; }

  /* ─── SECTION ─── */
  .rc-section { padding:5rem clamp(1.5rem,5vw,4rem); position:relative; z-index:1; }
  .rc-section-inner { max-width:980px; margin:0 auto; }
  .rc-eyebrow {
    font-family:'Segoe UI',system-ui,sans-serif;
    font-size:0.68rem; font-weight:700; text-transform:uppercase;
    letter-spacing:0.16em; color:var(--accent); margin-bottom:0.5rem;
  }
  .rc-sec-title {
    font-family:'Segoe UI',system-ui,sans-serif;
    font-size:clamp(1.3rem,3.5vw,1.85rem);
    font-weight:800; letter-spacing:-0.03em;
  }
  .rc-sec-sub { color:var(--text-2); font-size:0.9rem; margin-top:0.4rem; max-width:600px; }

  /* ─── TECH CARDS ─── */
  .rc-tlist { display:flex; flex-direction:column; gap:0.9rem; margin-top:2.5rem; }
  .rc-tc {
    background:var(--bg-card);
    border:1px solid var(--border-card); border-radius:14px;
    backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px);
    overflow:hidden;
    transition:background 0.5s ease, border-color 0.3s ease, box-shadow 0.3s ease;
  }
  .rc-tc:hover,.rc-tc.open { border-color:var(--border-hover); box-shadow:var(--shadow-hover); }
  .rc-tc-hdr {
    display:flex; align-items:center; gap:14px;
    padding:1.15rem 1.4rem; cursor:pointer; user-select:none;
    transition:background 0.25s ease;
  }
  .rc-tc-hdr:hover { background:var(--glow); }
  .rc-tc-icon {
    width:42px; height:42px; border-radius:10px;
    display:grid; place-items:center; font-size:1.05rem; flex-shrink:0;
    transition:transform 0.35s cubic-bezier(0.34,1.56,0.64,1);
  }
  .rc-tc:hover .rc-tc-icon,.rc-tc.open .rc-tc-icon { transform:scale(1.08) rotate(-4deg); }
  .rc-tc-mid { flex:1; min-width:0; }
  .rc-tc-name { font-family:'Segoe UI',system-ui,sans-serif; font-size:0.98rem; font-weight:700; }
  .rc-tc-desc { font-size:0.76rem; color:var(--text-2); margin-top:2px; line-height:1.5; }
  .rc-tc-cnt {
    font-family:'Cascadia Code','Fira Code',Consolas,monospace;
    font-size:0.62rem; color:var(--text-3);
    padding:3px 9px; border-radius:20px; background:var(--bg-tag);
    flex-shrink:0; white-space:nowrap;
  }
  .rc-chev {
    width:18px; height:18px; flex-shrink:0;
    transition:transform 0.4s cubic-bezier(0.34,1.56,0.64,1), color 0.3s ease;
    color:var(--text-3);
  }
  .rc-tc.open .rc-chev { transform:rotate(180deg); color:var(--accent); }
  .rc-tc-body { max-height:0; overflow:hidden; transition:max-height 0.5s cubic-bezier(0.4,0,0.2,1); }
  .rc-tc.open .rc-tc-body { max-height:900px; }
  .rc-tc-body-in {
    padding:0 1.4rem 1.3rem; opacity:0; transform:translateY(-8px);
    transition:opacity 0.35s ease 0.1s, transform 0.35s ease 0.1s;
  }
  .rc-tc.open .rc-tc-body-in { opacity:1; transform:translateY(0); }
  .rc-div { height:1px; background:var(--border); margin-bottom:0.7rem; }
  .rc-pl { display:flex; flex-direction:column; gap:3px; }
  .rc-plink {
    display:flex; align-items:center; gap:10px;
    padding:8px 14px; border-radius:8px;
    background:var(--bg-problem);
    transition:all 0.25s ease; cursor:pointer;
    text-decoration:none; color:var(--text-1);
    position:relative; overflow:hidden;
  }
  .rc-plink::before {
    content:''; position:absolute; left:0; top:0; bottom:0;
    width:3px; background:linear-gradient(180deg, var(--accent), var(--accent-2));
    opacity:0; transition:opacity 0.25s ease;
  }
  .rc-plink:hover { background:var(--bg-problem-hover); transform:translateX(4px); }
  .rc-plink:hover::before { opacity:1; }
  .rc-pn {
    font-family:'Cascadia Code','Fira Code',Consolas,monospace;
    font-size:0.62rem; color:var(--text-3); font-weight:600;
    width:22px; text-align:center; flex-shrink:0;
  }
  .rc-pname { font-family:'Segoe UI',system-ui,sans-serif; font-size:0.82rem; font-weight:600; flex:1; }
  .rc-parr {
    color:var(--text-3); opacity:0; transform:translateX(-6px);
    transition:all 0.25s ease; font-size:0.76rem;
  }
  .rc-plink:hover .rc-parr { opacity:1; transform:translateX(0); color:var(--accent); }

  /* ─── FOOTER ─── */
  .rc-footer {
    position:relative; z-index:1;
    padding:2.5rem clamp(1.5rem,5vw,4rem);
    text-align:center; border-top:1px solid var(--border);
    font-family:'Segoe UI',system-ui,sans-serif;
    font-size:0.74rem; color:var(--text-3);
    transition:border-color 0.5s ease;
  }
  .rc-footer a { color:var(--accent); text-decoration:none; }

  @media(max-width:640px) {
    .rc-hero { min-height:auto; padding-top:85px; padding-bottom:2rem; }
    .rc-stack-container { max-width:280px; min-height:220px; padding:12px; }
    .rc-frame { font-size:0.62rem; padding:6px 8px; }
    .rc-info-grid { grid-template-columns:1fr 1fr; }
    .rc-tc-desc { display:none; }
    .rc-tc-hdr { padding:1rem 1.1rem; gap:10px; }
  }
`;

// ─── CHEVRON ─────────────────────────────────────────────────────
const Chev = () => (
  <svg
    className="rc-chev"
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
export default function RecursionPage() {
  const [theme, setTheme] = useState("dark");
  const [openTech, setOpenTech] = useState(null);
  const [stateIdx, setStateIdx] = useState(0);
  const rootRef = useRef(null);

  // Apply CSS variables
  useEffect(() => {
    const vars = PAL[theme];
    const root = rootRef.current;
    if (!root) return;
    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
  }, [theme]);

  // Call stack animation cycle
  useEffect(() => {
    const id = setInterval(() => {
      setStateIdx((prev) => (prev + 1) % STACK_STATES.length);
    }, 900);
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

  const currentState = STACK_STATES[stateIdx];
  const currentDepth = currentState.frames.length;

  // Colorize log
  const logHtml = currentState.log
    .replace(/Call:\s/g, '<span class="hl">Call: </span>')
    .replace(/Base case!/g, '<span class="ret">Base case!</span>')
    .replace(/return\s\d+/g, (m) => `<span class="ret">${m}</span>`)
    .replace(/→/g, '<span class="hl">→</span>')
    .replace(/= (\d+)/g, '= <span class="ret">$1</span>')
    .replace("✓", '<span class="ret">✓</span>')
    .replace("Result: 120", 'Result: <span class="ret">120</span>');

  return (
    <>
      <style>{css}</style>
      <div className="rc-root" ref={rootRef}>
        {/* ── TOPBAR ── */}
        <nav className="rc-topbar">
          <div className="rc-brand">
            <div className="rc-logo">DS</div>
            <span className="rc-ui">DSA Visualizer</span>
            <span className="rc-sep">/</span>
            <span className="rc-topic-lbl rc-ui">Recursion</span>
          </div>
          <div className="rc-actions">
            <button
              className="rc-back"
              onClick={() => (window.location.href = "index.html")}
            >
              ← Dashboard
            </button>
            <div
              className="rc-toggle"
              onClick={toggleTheme}
              role="button"
              tabIndex={0}
              onKeyDown={(e) =>
                (e.key === "Enter" || e.key === " ") && toggleTheme()
              }
              aria-label="Toggle theme"
            >
              <div className={`rc-knob${theme === "light" ? " on" : ""}`}>
                {theme === "dark" ? "🌙" : "☀️"}
              </div>
            </div>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section className="rc-hero">
          <div
            className="rc-hero-bg"
            style={{
              background:
                theme === "dark"
                  ? "radial-gradient(ellipse 65% 50% at 22% 18%, #160a24 0%, transparent 70%), radial-gradient(ellipse 55% 55% at 82% 74%, #0a1414 0%, transparent 60%), #0a070e"
                  : "radial-gradient(ellipse 65% 50% at 22% 18%, #f0e4f8 0%, transparent 70%), radial-gradient(ellipse 55% 55% at 82% 74%, #e4f4f2 0%, transparent 60%), #faf7fc",
            }}
          />
          <div
            className="rc-orb"
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
            className="rc-orb"
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
            className="rc-orb"
            style={{
              width: 160,
              height: 160,
              background: "var(--accent-4)",
              opacity: 0.03,
              top: "55%",
              left: "50%",
              animation: "orbDrift 14s ease-in-out 2s infinite",
            }}
          />

          <div className="rc-hero-inner">
            <div className="rc-hero-text">
              <div className="rc-crumb">
                <span>DSA</span>
                <span className="s">›</span>
                <span>Algorithms</span>
                <span className="s">›</span>
                <span className="c">Recursion</span>
              </div>
              <h1 className="rc-h1 rc-ui">
                <span className="grad">Recursion</span>
                <br />& Backtracking
                <br />
                <span className="thin">Think in Layers</span>
              </h1>
              <p className="rc-desc">
                A function calling itself to solve progressively smaller
                instances of the same problem. Each call pushes a frame onto the
                stack; base cases halt the descent; return values cascade back
                up. Recursion is the engine behind backtracking,
                divide-and-conquer, tree traversal, and memoized dynamic
                programming.
              </p>
              <Link
                to="/recursions/recursion-tree-visualizer"
                className="rc-cta"
              >
                Open Visualizer <span className="ar">→</span>
              </Link>

              {/* <a href="recursion-visualizer.html" className="rc-cta">
                Open Visualizer <span className="ar">→</span>
              </a> */}
            </div>

            {/* Animated Call Stack */}
            <div className="rc-viz-wrap">
              <div className="rc-viz-label rc-mono">
                Call Stack · factorial(5)
              </div>

              <div className="rc-stack-container">
                <div className="rc-stack-title">
                  <span>CALL STACK</span>
                  <span className="rc-stack-depth">depth: {currentDepth}</span>
                </div>

                {currentState.frames.length === 0 ? (
                  <div
                    style={{
                      display: "grid",
                      placeItems: "center",
                      flex: 1,
                      fontFamily:
                        "'Cascadia Code','Fira Code',Consolas,monospace",
                      fontSize: "0.65rem",
                      color: "var(--text-3)",
                      opacity: 0.5,
                    }}
                  >
                    — stack empty —
                  </div>
                ) : (
                  currentState.frames.map((frame, i) => (
                    <div
                      key={`${i}-${frame.name}`}
                      className={`rc-frame ${frame.status}`}
                      style={{
                        marginLeft: `${i * 10}px`,
                        animationDelay: `${i * 0.05}s`,
                      }}
                    >
                      <span className="rc-frame-arrow">
                        {frame.status === "returning" ? "←" : "→"}
                      </span>
                      <span className="rc-frame-label">{frame.name}</span>
                      {frame.ret !== null && (
                        <span className="rc-frame-ret">= {frame.ret}</span>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Log line */}
              <div
                className="rc-log"
                dangerouslySetInnerHTML={{ __html: logHtml }}
              />

              {/* Complexity chips */}
              <div className="rc-chips">
                {COMPLEXITIES.map((c, i) => (
                  <div className="rc-chip" key={i}>
                    <span className="op">{c.op}</span>
                    <span className={`v ${c.tier}`}>{c.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── INFO CARDS ── */}
        <div className="rc-info-strip">
          <div className="rc-info-grid">
            {INFO_CARDS.map((c, i) => (
              <div
                className="rc-icard"
                key={i}
                style={{
                  animation: `fadeUp 0.6s ease ${0.5 + i * 0.08}s both`,
                }}
              >
                <div className="rc-icard-icon">{c.icon}</div>
                <div className="rc-icard-title rc-ui">{c.title}</div>
                <div className="rc-icard-text">{c.text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── TECHNIQUES ── */}
        <section className="rc-section">
          <div className="rc-section-inner">
            <div
              style={{
                marginBottom: "0.5rem",
                animation: "fadeUp 0.6s ease both",
              }}
            >
              <div className="rc-eyebrow">Explore · {TOTAL} Problems</div>
              <h2 className="rc-sec-title rc-ui">
                Recursion Techniques & Patterns
              </h2>
              <p className="rc-sec-sub">
                Master these six recursive paradigms — from basic base-case
                thinking to advanced constraint satisfaction — to build an
                intuition for decomposing any problem into self-similar layers.
              </p>
            </div>

            <div className="rc-tlist">
              {TECHNIQUES.map((tech, ti) => {
                const isOpen = openTech === tech.id;
                return (
                  <div
                    className={`rc-tc${isOpen ? " open" : ""}`}
                    key={tech.id}
                    style={{
                      animation: `fadeUp 0.6s ease ${0.05 + ti * 0.06}s both`,
                    }}
                  >
                    <div
                      className="rc-tc-hdr"
                      onClick={() => toggleTech(tech.id)}
                    >
                      <div
                        className="rc-tc-icon"
                        style={{
                          background: `color-mix(in srgb, ${tech.accent} 10%, transparent)`,
                        }}
                      >
                        {tech.icon}
                      </div>
                      <div className="rc-tc-mid">
                        <div className="rc-tc-name rc-ui">{tech.title}</div>
                        <div className="rc-tc-desc">{tech.desc}</div>
                      </div>
                      <div className="rc-tc-cnt rc-mono">
                        {tech.problems.length}
                      </div>
                      <Chev />
                    </div>
                    <div className="rc-tc-body">
                      <div className="rc-tc-body-in">
                        <div className="rc-div" />
                        <div className="rc-pl">
                          {tech.problems.map((p, pi) => (
                            <a
                              key={pi}
                              href={p.href || `${p.slug}-visualizer.html`}
                              className="rc-plink"
                            >
                              <span className="rc-pn rc-mono">
                                {String(pi + 1).padStart(2, "0")}
                              </span>
                              <span className="rc-pname rc-ui">{p.name}</span>
                              <span className="rc-parr">→</span>
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
        <footer className="rc-footer">
          DSA Visualizer Platform — Built for learners.{" "}
          <a href="index.html">Back to Dashboard</a>
        </footer>
      </div>
    </>
  );
}
