import { useState, useEffect, useRef, useCallback } from "react";
import { stackTechniques } from "../../data/stackTechniques";

/* ================================================================
   STACK & QUEUES — DSA Visualizer Platform Topic Page

   Aesthetic: "Warm Industrial / The Forge"
   - Deep slate-indigo base with warm copper & amber accents
   - Dual animated Stack (LIFO) + Queue (FIFO) hero visual
   - Glassmorphism technique accordions
   - Dark / Light theme with smooth CSS-variable transitions
   ================================================================ */

// ─── THEME PALETTES ──────────────────────────────────────────────
const PALETTES = {
  dark: {
    "--bg-root": "#08080e",
    "--bg-hero": "#0a0a14",
    "--bg-section": "#0c0c16",
    "--bg-card": "rgba(18, 18, 32, 0.6)",
    "--bg-card-hover": "rgba(24, 24, 44, 0.78)",
    "--bg-glass": "rgba(18, 18, 36, 0.48)",
    "--bg-tag": "rgba(232, 160, 72, 0.07)",
    "--bg-problem": "rgba(232, 160, 72, 0.025)",
    "--bg-problem-hover": "rgba(232, 160, 72, 0.06)",
    "--text-1": "#e6e4f0",
    "--text-2": "#8886a0",
    "--text-3": "#55546a",
    "--accent": "#e8a048",
    "--accent-2": "#c06efc",
    "--accent-3": "#f05868",
    "--accent-4": "#44d4e8",
    "--accent-5": "#58d898",
    "--border": "rgba(232, 160, 72, 0.06)",
    "--border-card": "rgba(232, 160, 72, 0.09)",
    "--border-hover": "rgba(232, 160, 72, 0.22)",
    "--glow": "rgba(232, 160, 72, 0.05)",
    "--glow-strong": "rgba(232, 160, 72, 0.14)",
    "--shadow-card": "0 8px 44px rgba(0,0,0,0.38)",
    "--shadow-hover": "0 14px 52px rgba(232,160,72,0.06)",
    "--stack-color": "#e8a048",
    "--stack-bg": "rgba(232, 160, 72, 0.06)",
    "--stack-border": "rgba(232, 160, 72, 0.28)",
    "--stack-glow": "rgba(232, 160, 72, 0.16)",
    "--queue-color": "#c06efc",
    "--queue-bg": "rgba(192, 110, 252, 0.06)",
    "--queue-border": "rgba(192, 110, 252, 0.28)",
    "--queue-glow": "rgba(192, 110, 252, 0.16)",
    "--grid-line": "rgba(232, 160, 72, 0.018)",
    "--overlay": "rgba(8, 8, 14, 0.9)",
    "--good": "#58d898",
    "--mid": "#e8a048",
    "--bad": "#f05868",
  },
  light: {
    "--bg-root": "#f7f6f3",
    "--bg-hero": "#f0eeea",
    "--bg-section": "#f2f0ec",
    "--bg-card": "rgba(255, 255, 255, 0.72)",
    "--bg-card-hover": "rgba(255, 255, 255, 0.9)",
    "--bg-glass": "rgba(255, 255, 255, 0.58)",
    "--bg-tag": "rgba(180, 100, 20, 0.06)",
    "--bg-problem": "rgba(180, 100, 20, 0.025)",
    "--bg-problem-hover": "rgba(180, 100, 20, 0.06)",
    "--text-1": "#1a1824",
    "--text-2": "#68667a",
    "--text-3": "#9a98a8",
    "--accent": "#b46a14",
    "--accent-2": "#8844cc",
    "--accent-3": "#cc3344",
    "--accent-4": "#0a8e9e",
    "--accent-5": "#1a9960",
    "--border": "rgba(180, 100, 20, 0.07)",
    "--border-card": "rgba(180, 100, 20, 0.1)",
    "--border-hover": "rgba(180, 100, 20, 0.26)",
    "--glow": "rgba(180, 100, 20, 0.035)",
    "--glow-strong": "rgba(180, 100, 20, 0.09)",
    "--shadow-card": "0 8px 44px rgba(30,20,10,0.06)",
    "--shadow-hover": "0 14px 52px rgba(180,100,20,0.05)",
    "--stack-color": "#b46a14",
    "--stack-bg": "rgba(180, 106, 20, 0.05)",
    "--stack-border": "rgba(180, 106, 20, 0.25)",
    "--stack-glow": "rgba(180, 106, 20, 0.1)",
    "--queue-color": "#8844cc",
    "--queue-bg": "rgba(136, 68, 204, 0.05)",
    "--queue-border": "rgba(136, 68, 204, 0.25)",
    "--queue-glow": "rgba(136, 68, 204, 0.1)",
    "--grid-line": "rgba(180, 100, 20, 0.025)",
    "--overlay": "rgba(247, 246, 243, 0.92)",
    "--good": "#1a9960",
    "--mid": "#b46a14",
    "--bad": "#cc3344",
  },
};

// ─── TECHNIQUES DATA ─────────────────────────────────────────────
const TECHNIQUES = stackTechniques;

// ─── HERO DATA ───────────────────────────────────────────────────
const STACK_VALS = ["A", "B", "C", "D"];
const QUEUE_VALS = ["1", "2", "3", "4"];

const COMPLEXITIES = [
  { struct: "Stack", op: "Push", val: "O(1)", tier: "good" },
  { struct: "Stack", op: "Pop", val: "O(1)", tier: "good" },
  { struct: "Stack", op: "Peek", val: "O(1)", tier: "good" },
  { struct: "Queue", op: "Enqueue", val: "O(1)", tier: "good" },
  { struct: "Queue", op: "Dequeue", val: "O(1)", tier: "good" },
  { struct: "Queue", op: "Peek", val: "O(1)", tier: "good" },
];

const INFO_CARDS = [
  {
    icon: "📚",
    title: "What are Stacks & Queues?",
    text: "Abstract data types governing insertion/removal order. Stacks enforce LIFO (Last-In, First-Out); queues enforce FIFO (First-In, First-Out).",
  },
  {
    icon: "🧠",
    title: "Memory Model",
    text: "Typically backed by arrays (circular buffer for queues) or linked lists. Both allow O(1) push/pop and enqueue/dequeue at their designated ends.",
  },
  {
    icon: "⚡",
    title: "When to Use",
    text: "Stacks: recursion, undo/redo, parsing, DFS. Queues: BFS, scheduling, buffering, level-order traversal, producer-consumer pipelines.",
  },
  {
    icon: "⚠️",
    title: "Trade-offs",
    text: "No random access — only the top (stack) or front (queue) is visible. Array-backed variants may need resizing; list-backed variants use extra pointer memory.",
  },
];

// ─── STYLES ──────────────────────────────────────────────────────
const css = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes orbFloat {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(22px, -28px) scale(1.06); }
    66% { transform: translate(-16px, 20px) scale(0.94); }
  }
  @keyframes stackPush {
    from { opacity: 0; transform: translateY(-28px) scale(0.7); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes stackPop {
    from { opacity: 1; transform: translateY(0) scale(1); }
    to { opacity: 0; transform: translateY(-28px) scale(0.7); }
  }
  @keyframes queueEnter {
    from { opacity: 0; transform: translateX(32px) scale(0.7); }
    to { opacity: 1; transform: translateX(0) scale(1); }
  }
  @keyframes queueExit {
    from { opacity: 1; transform: translateX(0) scale(1); }
    to { opacity: 0; transform: translateX(-32px) scale(0.7); }
  }
  @keyframes pulseRing {
    0% { box-shadow: 0 0 0 0 var(--stack-glow); }
    70% { box-shadow: 0 0 0 8px transparent; }
    100% { box-shadow: 0 0 0 0 transparent; }
  }
  @keyframes flowArrow {
    0% { opacity: 0.2; }
    50% { opacity: 1; }
    100% { opacity: 0.2; }
  }

  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

  .sq-root {
    font-family: Palatino, 'Palatino Linotype', 'Book Antiqua', Georgia, serif;
    background: var(--bg-root);
    color: var(--text-1);
    min-height: 100vh;
    overflow-x: hidden;
    line-height: 1.65;
    transition: background 0.5s cubic-bezier(0.4,0,0.2,1), color 0.5s cubic-bezier(0.4,0,0.2,1);
    position: relative;
  }
  .sq-root::before {
    content: '';
    position: fixed; inset: 0;
    background:
      linear-gradient(var(--grid-line) 1px, transparent 1px),
      linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
    background-size: 56px 56px;
    pointer-events: none; z-index: 0;
  }

  .sq-ui { font-family: 'Segoe UI', system-ui, sans-serif; }
  .sq-mono { font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace; }

  /* ─── TOPBAR ─── */
  .sq-topbar {
    position: fixed; top: 0; left: 0; right: 0; z-index: 999;
    height: 60px; display: flex; align-items: center; justify-content: space-between;
    padding: 0 clamp(1rem, 4vw, 3rem);
    background: var(--overlay);
    backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
    border-bottom: 1px solid var(--border);
    transition: background 0.5s ease;
  }
  .sq-topbar-brand {
    display: flex; align-items: center; gap: 10px;
    font-family: 'Segoe UI', system-ui, sans-serif;
    font-weight: 700; font-size: 0.95rem; cursor: pointer;
  }
  .sq-topbar-logo {
    width: 32px; height: 32px; border-radius: 8px;
    background: linear-gradient(135deg, var(--accent), var(--accent-2));
    display: grid; place-items: center;
    font-size: 0.7rem; font-weight: 800; color: #fff;
    position: relative;
  }
  .sq-topbar-logo::after {
    content: ''; position: absolute; inset: 0; border-radius: 8px;
    background: linear-gradient(135deg, transparent 50%, rgba(255,255,255,0.15));
  }
  .sq-sep { color: var(--text-3); font-weight: 300; margin: 0 2px; }
  .sq-topic { color: var(--accent); }
  .sq-topbar-actions { display: flex; align-items: center; gap: 14px; }
  .sq-back-btn {
    display: flex; align-items: center; gap: 5px;
    padding: 5px 14px; border-radius: 8px;
    background: var(--bg-glass); border: 1px solid var(--border-card);
    color: var(--text-2); font-family: 'Segoe UI', system-ui, sans-serif;
    font-size: 0.78rem; font-weight: 600; cursor: pointer;
    transition: all 0.3s ease;
  }
  .sq-back-btn:hover { color: var(--text-1); border-color: var(--border-hover); }
  .sq-theme-toggle {
    width: 50px; height: 26px; border-radius: 20px;
    background: var(--bg-glass); border: 1.5px solid var(--border-card);
    cursor: pointer; position: relative; transition: all 0.3s ease; flex-shrink: 0;
  }
  .sq-theme-toggle:hover { border-color: var(--border-hover); }
  .sq-knob {
    position: absolute; top: 2px; left: 2px;
    width: 18px; height: 18px; border-radius: 50%;
    background: linear-gradient(135deg, var(--accent), var(--accent-2));
    transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1);
    display: grid; place-items: center; font-size: 10px;
  }
  .sq-knob.on { transform: translateX(24px); }

  /* ─── HERO ─── */
  .sq-hero {
    position: relative; min-height: 92vh;
    display: flex; align-items: center; justify-content: center;
    padding: 100px clamp(1.5rem, 5vw, 4rem) 4rem;
    overflow: hidden;
  }
  .sq-hero-bg {
    position: absolute; inset: 0; z-index: 0;
    transition: background 0.5s ease;
  }
  .sq-orb {
    position: absolute; border-radius: 50%; filter: blur(100px);
    pointer-events: none; z-index: 1;
  }
  .sq-hero-inner {
    position: relative; z-index: 2;
    max-width: 1060px; width: 100%;
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 3.5rem; align-items: center;
  }
  @media (max-width: 850px) {
    .sq-hero-inner { grid-template-columns: 1fr; gap: 2.5rem; }
    .sq-hero-text { text-align: center; align-items: center; }
  }
  .sq-hero-text {
    display: flex; flex-direction: column; align-items: flex-start; gap: 1.1rem;
  }
  .sq-breadcrumb {
    display: inline-flex; align-items: center; gap: 6px;
    font-family: 'Segoe UI', system-ui, sans-serif;
    font-size: 0.7rem; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.14em;
    color: var(--text-3); animation: fadeUp 0.7s ease both;
  }
  .sq-breadcrumb .sep { opacity: 0.4; }
  .sq-breadcrumb .cur { color: var(--accent); }
  .sq-hero-title {
    font-family: 'Segoe UI', system-ui, sans-serif;
    font-size: clamp(2.4rem, 5.5vw, 3.8rem);
    font-weight: 800; letter-spacing: -0.04em; line-height: 1.08;
    animation: fadeUp 0.7s ease 0.08s both;
  }
  .sq-hero-title .amp {
    background: linear-gradient(135deg, var(--accent), var(--accent-2));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .sq-hero-title .thin { font-weight: 300; color: var(--text-2); }
  .sq-hero-desc {
    font-size: clamp(0.92rem, 1.6vw, 1.04rem);
    color: var(--text-2); line-height: 1.78; max-width: 460px;
    animation: fadeUp 0.7s ease 0.16s both;
  }
  .sq-hero-cta {
    display: inline-flex; align-items: center; gap: 10px;
    padding: 14px 34px; border-radius: 14px;
    background: linear-gradient(135deg, var(--accent), var(--accent-2));
    color: #fff; font-family: 'Segoe UI', system-ui, sans-serif;
    font-weight: 700; font-size: 0.95rem;
    border: none; cursor: pointer; position: relative; overflow: hidden;
    transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease;
    animation: fadeUp 0.7s ease 0.28s both;
    text-decoration: none;
  }
  .sq-hero-cta::before {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.14));
  }
  .sq-hero-cta:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: 0 10px 44px rgba(232,160,72,0.18);
  }
  .sq-hero-cta .arr { transition: transform 0.3s ease; }
  .sq-hero-cta:hover .arr { transform: translateX(5px); }

  /* ─── DUAL VISUAL ─── */
  .sq-dual-viz {
    display: flex; gap: 2rem; justify-content: center; align-items: flex-end;
    animation: fadeUp 0.8s ease 0.3s both;
  }
  @media (max-width: 480px) { .sq-dual-viz { gap: 1rem; } }

  .sq-viz-col {
    display: flex; flex-direction: column; align-items: center; gap: 0.6rem;
  }
  .sq-viz-label {
    font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
    font-size: 0.6rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.15em;
  }
  .sq-viz-label.stk { color: var(--stack-color); }
  .sq-viz-label.que { color: var(--queue-color); }

  .sq-viz-sublabel {
    font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
    font-size: 0.52rem; color: var(--text-3); letter-spacing: 0.08em;
  }

  /* Stack container */
  .sq-stack-box {
    display: flex; flex-direction: column-reverse;
    align-items: center; gap: 5px;
    min-height: 220px; justify-content: flex-start;
    padding: 10px;
    border-bottom: 3px solid var(--stack-border);
    border-left: 1.5px solid var(--stack-border);
    border-right: 1.5px solid var(--stack-border);
    border-radius: 0 0 10px 10px;
    width: 110px;
    position: relative;
    transition: border-color 0.4s ease;
  }
  .sq-stack-item {
    width: 88px; padding: 10px 0;
    border-radius: 8px; text-align: center;
    font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
    font-weight: 700; font-size: 1rem;
    background: var(--stack-bg); border: 1.5px solid var(--stack-border);
    color: var(--stack-color);
    transition: all 0.35s ease;
  }
  .sq-stack-item.top {
    border-color: var(--accent);
    box-shadow: 0 0 16px var(--stack-glow);
    animation: pulseRing 2s ease-in-out infinite;
  }
  .sq-stack-item.entering { animation: stackPush 0.4s cubic-bezier(0.34,1.56,0.64,1) both; }
  .sq-stack-item.exiting { animation: stackPop 0.4s ease both; }

  .sq-stack-flow {
    display: flex; flex-direction: column; align-items: center; gap: 2px;
    margin-top: 4px;
  }
  .sq-flow-arrow {
    font-family: 'Segoe UI', system-ui, sans-serif;
    font-size: 0.65rem; font-weight: 700; color: var(--text-3);
    animation: flowArrow 2s ease-in-out infinite;
  }
  .sq-flow-arrow.stk { color: var(--stack-color); }
  .sq-flow-arrow.que { color: var(--queue-color); }

  /* Queue container */
  .sq-queue-box {
    display: flex; flex-direction: row;
    align-items: center; gap: 5px;
    min-width: 110px; min-height: 70px;
    padding: 10px;
    border: 1.5px solid var(--queue-border);
    border-radius: 10px;
    position: relative;
    transition: border-color 0.4s ease;
  }
  .sq-queue-item {
    width: 48px; height: 48px;
    border-radius: 8px; text-align: center;
    display: grid; place-items: center;
    font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
    font-weight: 700; font-size: 0.95rem;
    background: var(--queue-bg); border: 1.5px solid var(--queue-border);
    color: var(--queue-color); flex-shrink: 0;
    transition: all 0.35s ease;
  }
  .sq-queue-item.front {
    border-color: var(--accent-2);
    box-shadow: 0 0 14px var(--queue-glow);
  }
  .sq-queue-item.entering { animation: queueEnter 0.4s cubic-bezier(0.34,1.56,0.64,1) both; }
  .sq-queue-item.exiting { animation: queueExit 0.4s ease both; }

  .sq-queue-marker {
    position: absolute;
    font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
    font-size: 0.5rem; font-weight: 700; color: var(--queue-color);
    text-transform: uppercase; letter-spacing: 0.06em;
  }
  .sq-queue-marker.front-m { left: 10px; top: -16px; }
  .sq-queue-marker.rear-m { right: 10px; top: -16px; }

  .sq-queue-flow {
    display: flex; align-items: center; gap: 6px; margin-top: 6px;
  }

  /* Complexity chips */
  .sq-chips {
    display: flex; flex-wrap: wrap; gap: 5px; justify-content: center;
    animation: fadeUp 0.7s ease 0.5s both; margin-top: 0.8rem;
  }
  .sq-chip {
    display: flex; align-items: center; gap: 4px;
    padding: 3px 10px; border-radius: 18px;
    background: var(--bg-glass); border: 1px solid var(--border-card);
    font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
    font-size: 0.58rem; font-weight: 600;
    backdrop-filter: blur(8px);
    transition: background 0.5s ease, border-color 0.5s ease;
  }
  .sq-chip .lbl { color: var(--text-3); text-transform: uppercase; letter-spacing: 0.05em; }
  .sq-chip .v { font-weight: 700; }
  .sq-chip .v.good { color: var(--good); }
  .sq-chip .sn { color: var(--text-3); opacity: 0.5; margin-right: 2px; font-size: 0.5rem; }

  /* ─── INFO STRIP ─── */
  .sq-info-strip {
    position: relative; z-index: 1;
    padding: 0 clamp(1.5rem, 5vw, 4rem);
  }
  .sq-info-grid {
    max-width: 980px; margin: -2rem auto 0;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
    gap: 1rem;
  }
  .sq-info-card {
    background: var(--bg-card);
    backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
    border: 1px solid var(--border-card); border-radius: 14px;
    padding: 1.2rem 1.3rem;
    transition: all 0.35s ease;
  }
  .sq-info-card:hover {
    border-color: var(--border-hover);
    box-shadow: var(--shadow-hover);
    transform: translateY(-2px);
  }
  .sq-info-icon { font-size: 1.3rem; margin-bottom: 0.5rem; }
  .sq-info-title {
    font-family: 'Segoe UI', system-ui, sans-serif;
    font-size: 0.8rem; font-weight: 700; margin-bottom: 0.2rem;
  }
  .sq-info-text { font-size: 0.76rem; color: var(--text-2); line-height: 1.55; }

  /* ─── SECTION ─── */
  .sq-section {
    padding: 5rem clamp(1.5rem, 5vw, 4rem);
    position: relative; z-index: 1;
  }
  .sq-section-inner { max-width: 980px; margin: 0 auto; }
  .sq-eyebrow {
    font-family: 'Segoe UI', system-ui, sans-serif;
    font-size: 0.68rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.16em;
    color: var(--accent); margin-bottom: 0.5rem;
  }
  .sq-section-title {
    font-family: 'Segoe UI', system-ui, sans-serif;
    font-size: clamp(1.4rem, 3.5vw, 1.9rem);
    font-weight: 800; letter-spacing: -0.03em;
  }
  .sq-section-sub {
    color: var(--text-2); font-size: 0.92rem;
    margin-top: 0.4rem; max-width: 580px;
  }

  /* ─── TECHNIQUE CARDS ─── */
  .sq-tech-list {
    display: flex; flex-direction: column; gap: 1rem; margin-top: 2.5rem;
  }
  .sq-tech-card {
    background: var(--bg-card);
    border: 1px solid var(--border-card);
    border-radius: 14px;
    backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
    overflow: hidden;
    transition: background 0.5s ease, border-color 0.3s ease, box-shadow 0.3s ease;
  }
  .sq-tech-card:hover, .sq-tech-card.open {
    border-color: var(--border-hover);
    box-shadow: var(--shadow-hover);
  }
  .sq-tech-hdr {
    display: flex; align-items: center; gap: 14px;
    padding: 1.2rem 1.4rem; cursor: pointer; user-select: none;
    transition: background 0.25s ease;
  }
  .sq-tech-hdr:hover { background: var(--glow); }
  .sq-tech-icon {
    width: 44px; height: 44px; border-radius: 10px;
    display: grid; place-items: center; font-size: 1.1rem; flex-shrink: 0;
    transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1);
  }
  .sq-tech-card:hover .sq-tech-icon,
  .sq-tech-card.open .sq-tech-icon { transform: scale(1.08) rotate(-4deg); }
  .sq-tech-body-content { flex: 1; min-width: 0; }
  .sq-tech-name {
    font-family: 'Segoe UI', system-ui, sans-serif;
    font-size: 1rem; font-weight: 700;
  }
  .sq-tech-desc { font-size: 0.78rem; color: var(--text-2); margin-top: 2px; line-height: 1.5; }
  .sq-tech-count {
    font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
    font-size: 0.64rem; color: var(--text-3);
    padding: 3px 10px; border-radius: 20px; background: var(--bg-tag);
    flex-shrink: 0; white-space: nowrap;
    transition: background 0.5s ease;
  }
  .sq-chevron {
    width: 20px; height: 20px; flex-shrink: 0;
    transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1), color 0.3s ease;
    color: var(--text-3);
  }
  .sq-tech-card.open .sq-chevron { transform: rotate(180deg); color: var(--accent); }
  .sq-tech-body {
    max-height: 0; overflow: hidden;
    transition: max-height 0.5s cubic-bezier(0.4,0,0.2,1);
  }
  .sq-tech-card.open .sq-tech-body { max-height: 800px; }
  .sq-tech-body-inner {
    padding: 0 1.4rem 1.4rem;
    opacity: 0; transform: translateY(-8px);
    transition: opacity 0.35s ease 0.1s, transform 0.35s ease 0.1s;
  }
  .sq-tech-card.open .sq-tech-body-inner { opacity: 1; transform: translateY(0); }
  .sq-divider { height: 1px; background: var(--border); margin-bottom: 0.8rem; }
  .sq-prob-list { display: flex; flex-direction: column; gap: 3px; }
  .sq-prob-link {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 14px; border-radius: 8px;
    background: var(--bg-problem);
    transition: all 0.25s ease; cursor: pointer;
    text-decoration: none; color: var(--text-1);
    position: relative; overflow: hidden;
  }
  .sq-prob-link::before {
    content: ''; position: absolute; left: 0; top: 0; bottom: 0;
    width: 3px; background: linear-gradient(180deg, var(--accent), var(--accent-2));
    opacity: 0; transition: opacity 0.25s ease;
  }
  .sq-prob-link:hover {
    background: var(--bg-problem-hover); transform: translateX(4px);
  }
  .sq-prob-link:hover::before { opacity: 1; }
  .sq-prob-num {
    font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
    font-size: 0.64rem; color: var(--text-3); font-weight: 600;
    width: 22px; text-align: center; flex-shrink: 0;
  }
  .sq-prob-name {
    font-family: 'Segoe UI', system-ui, sans-serif;
    font-size: 0.84rem; font-weight: 600; flex: 1;
  }
  .sq-prob-arr {
    color: var(--text-3); opacity: 0; transform: translateX(-6px);
    transition: all 0.25s ease;
    font-family: 'Segoe UI', system-ui, sans-serif; font-size: 0.78rem;
  }
  .sq-prob-link:hover .sq-prob-arr {
    opacity: 1; transform: translateX(0); color: var(--accent);
  }

  /* ─── FOOTER ─── */
  .sq-footer {
    position: relative; z-index: 1;
    padding: 2.5rem clamp(1.5rem, 5vw, 4rem);
    text-align: center; border-top: 1px solid var(--border);
    font-family: 'Segoe UI', system-ui, sans-serif;
    font-size: 0.74rem; color: var(--text-3);
    transition: border-color 0.5s ease;
  }
  .sq-footer a { color: var(--accent); text-decoration: none; }

  @media (max-width: 640px) {
    .sq-hero { min-height: auto; padding-top: 85px; padding-bottom: 2rem; }
    .sq-stack-box { width: 80px; min-height: 180px; }
    .sq-stack-item { width: 64px; padding: 7px 0; font-size: 0.85rem; }
    .sq-queue-item { width: 38px; height: 38px; font-size: 0.8rem; }
    .sq-info-grid { grid-template-columns: 1fr 1fr; }
    .sq-tech-desc { display: none; }
    .sq-dual-viz { flex-direction: column; align-items: center; gap: 2rem; }
  }
`;

// ─── CHEVRON ICON ────────────────────────────────────────────────
const Chev = () => (
  <svg
    className="sq-chevron"
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

// ─── ANIMATED STACK COMPONENT ────────────────────────────────────
function AnimStack({ items, activeIdx }) {
  return (
    <div className="sq-viz-col">
      <div className="sq-viz-label stk sq-mono">Stack · LIFO</div>
      <div className="sq-stack-flow">
        <span className="sq-flow-arrow stk" style={{ animationDelay: "0s" }}>
          ↓ push
        </span>
        <span className="sq-flow-arrow stk" style={{ animationDelay: "1s" }}>
          ↑ pop
        </span>
      </div>
      <div className="sq-stack-box">
        {items.map((v, i) => (
          <div
            key={`${v}-${i}`}
            className={`sq-stack-item ${i === items.length - 1 ? "top" : ""} ${i === activeIdx ? "entering" : ""}`}
            style={{ animationDelay: `${0.4 + i * 0.1}s` }}
          >
            {v}
          </div>
        ))}
      </div>
      <div className="sq-viz-sublabel sq-mono">← top</div>
    </div>
  );
}

// ─── ANIMATED QUEUE COMPONENT ────────────────────────────────────
function AnimQueue({ items, activeIdx }) {
  return (
    <div className="sq-viz-col">
      <div className="sq-viz-label que sq-mono">Queue · FIFO</div>
      <div className="sq-queue-flow">
        <span className="sq-flow-arrow que" style={{ animationDelay: "0.5s" }}>
          ← dequeue
        </span>
        <span className="sq-flow-arrow que" style={{ animationDelay: "1.5s" }}>
          enqueue →
        </span>
      </div>
      <div className="sq-queue-box">
        <span className="sq-queue-marker front-m">front</span>
        <span className="sq-queue-marker rear-m">rear</span>
        {items.map((v, i) => (
          <div
            key={`${v}-${i}`}
            className={`sq-queue-item ${i === 0 ? "front" : ""} ${i === activeIdx ? "entering" : ""}`}
            style={{ animationDelay: `${0.5 + i * 0.1}s` }}
          >
            {v}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────
export default function StackQueuesTopicPage() {
  const [theme, setTheme] = useState("dark");
  const [openTech, setOpenTech] = useState(null);
  const [stackItems, setStackItems] = useState([...STACK_VALS]);
  const [queueItems, setQueueItems] = useState([...QUEUE_VALS]);
  const [stackActive, setStackActive] = useState(-1);
  const [queueActive, setQueueActive] = useState(-1);
  const rootRef = useRef(null);
  const animRef = useRef(null);
  const cycleRef = useRef(0);

  // Apply theme CSS variables
  useEffect(() => {
    const vars = PALETTES[theme];
    const root = rootRef.current;
    if (!root) return;
    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
  }, [theme]);

  // Animated cycle: push/pop on stack, enqueue/dequeue on queue
  useEffect(() => {
    const extras = ["E", "F"];
    const qExtras = ["5", "6"];
    let phase = 0;

    const tick = () => {
      phase = (phase + 1) % 8;

      if (phase === 1) {
        // push E
        setStackItems((p) => [...p, extras[0]]);
        setStackActive(STACK_VALS.length);
      } else if (phase === 2) {
        // push F
        setStackItems((p) => [...p, extras[1]]);
        setStackActive(STACK_VALS.length + 1);
      } else if (phase === 3) {
        // pop F
        setStackItems((p) => p.slice(0, -1));
        setStackActive(-1);
      } else if (phase === 4) {
        // pop E
        setStackItems((p) => p.slice(0, -1));
        setStackActive(-1);
      } else if (phase === 5) {
        // enqueue 5
        setQueueItems((p) => [...p, qExtras[0]]);
        setQueueActive(QUEUE_VALS.length);
      } else if (phase === 6) {
        // enqueue 6
        setQueueItems((p) => [...p, qExtras[1]]);
        setQueueActive(QUEUE_VALS.length + 1);
      } else if (phase === 7) {
        // dequeue 1
        setQueueItems((p) => p.slice(1));
        setQueueActive(-1);
      } else {
        // reset
        setStackItems([...STACK_VALS]);
        setQueueItems([...QUEUE_VALS]);
        setStackActive(-1);
        setQueueActive(-1);
      }
    };

    animRef.current = setInterval(tick, 1400);
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
      <div className="sq-root" ref={rootRef}>
        {/* ── TOPBAR ── */}
        <nav className="sq-topbar">
          <div className="sq-topbar-brand">
            <div className="sq-topbar-logo">DS</div>
            <span className="sq-ui">DSA Visualizer</span>
            <span className="sq-sep">/</span>
            <span className="sq-topic sq-ui">Stack & Queues</span>
          </div>
          <div className="sq-topbar-actions">
            <button
              className="sq-back-btn"
              onClick={() => (window.location.href = "index.html")}
            >
              ← Dashboard
            </button>
            <div
              className="sq-theme-toggle"
              onClick={toggleTheme}
              role="button"
              tabIndex={0}
              onKeyDown={(e) =>
                (e.key === "Enter" || e.key === " ") && toggleTheme()
              }
              aria-label="Toggle theme"
            >
              <div className={`sq-knob ${theme === "light" ? "on" : ""}`}>
                {theme === "dark" ? "🌙" : "☀️"}
              </div>
            </div>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section className="sq-hero">
          <div
            className="sq-hero-bg"
            style={{
              background:
                theme === "dark"
                  ? "radial-gradient(ellipse 65% 50% at 25% 25%, #14122a 0%, transparent 70%), radial-gradient(ellipse 55% 55% at 80% 75%, #1a1008 0%, transparent 60%), #08080e"
                  : "radial-gradient(ellipse 65% 50% at 25% 25%, #e8e4f4 0%, transparent 70%), radial-gradient(ellipse 55% 55% at 80% 75%, #f4ece0 0%, transparent 60%), #f7f6f3",
            }}
          />
          <div
            className="sq-orb"
            style={{
              width: 420,
              height: 420,
              background: "var(--accent)",
              opacity: 0.06,
              top: "-10%",
              right: "-6%",
              animation: "orbFloat 17s ease-in-out infinite",
            }}
          />
          <div
            className="sq-orb"
            style={{
              width: 320,
              height: 320,
              background: "var(--accent-2)",
              opacity: 0.05,
              bottom: "-5%",
              left: "-4%",
              animation: "orbFloat 21s ease-in-out infinite reverse",
            }}
          />
          <div
            className="sq-orb"
            style={{
              width: 180,
              height: 180,
              background: "var(--accent-4)",
              opacity: 0.04,
              top: "55%",
              left: "50%",
              animation: "orbFloat 13s ease-in-out 2s infinite",
            }}
          />

          <div className="sq-hero-inner">
            {/* Text column */}
            <div className="sq-hero-text">
              <div className="sq-breadcrumb">
                <span>DSA</span>
                <span className="sep">›</span>
                <span>Data Structures</span>
                <span className="sep">›</span>
                <span className="cur">Stack & Queues</span>
              </div>
              <h1 className="sq-hero-title sq-ui">
                Stack <span className="amp">&</span> Queues
                <br />
                <span className="thin">Fundamentals</span>
              </h1>
              <p className="sq-hero-desc">
                Two foundational abstract data types that govern order of
                access. Stacks enforce Last-In-First-Out for recursion, parsing,
                and undo systems. Queues enforce First-In-First-Out for
                scheduling, BFS, and buffering — together they underpin nearly
                every algorithmic pattern.
              </p>
              <a href="stack-queues-visualizer.html" className="sq-hero-cta">
                Open Visualizer <span className="arr">→</span>
              </a>
            </div>

            {/* Dual animated visual */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              <div className="sq-dual-viz">
                <AnimStack items={stackItems} activeIdx={stackActive} />
                <AnimQueue items={queueItems} activeIdx={queueActive} />
              </div>

              {/* Complexity chips */}
              <div className="sq-chips">
                {COMPLEXITIES.map((c, i) => (
                  <div className="sq-chip" key={i}>
                    <span className="sn">
                      {c.struct === "Stack" ? "S" : "Q"}
                    </span>
                    <span className="lbl">{c.op}</span>
                    <span className={`v ${c.tier}`}>{c.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── INFO CARDS ── */}
        <div className="sq-info-strip">
          <div className="sq-info-grid">
            {INFO_CARDS.map((c, i) => (
              <div
                className="sq-info-card"
                key={i}
                style={{
                  animation: `fadeUp 0.6s ease ${0.5 + i * 0.08}s both`,
                }}
              >
                <div className="sq-info-icon">{c.icon}</div>
                <div className="sq-info-title sq-ui">{c.title}</div>
                <div className="sq-info-text">{c.text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── TECHNIQUES SECTION ── */}
        <section className="sq-section">
          <div className="sq-section-inner">
            <div
              style={{
                marginBottom: "0.5rem",
                animation: "fadeUp 0.6s ease both",
              }}
            >
              <div className="sq-eyebrow">Explore</div>
              <h2 className="sq-section-title sq-ui">
                Stack & Queues Techniques & Patterns
              </h2>
              <p className="sq-section-sub">
                Master these core patterns to tackle the full range of stack-
                and queue-based interview and competitive programming problems.
              </p>
            </div>

            <div className="sq-tech-list">
              {TECHNIQUES.map((tech, ti) => {
                const isOpen = openTech === tech.id;
                return (
                  <div
                    className={`sq-tech-card ${isOpen ? "open" : ""}`}
                    key={tech.id}
                    style={{
                      animation: `fadeUp 0.6s ease ${0.05 + ti * 0.07}s both`,
                    }}
                  >
                    <div
                      className="sq-tech-hdr"
                      onClick={() => toggleTech(tech.id)}
                    >
                      <div
                        className="sq-tech-icon"
                        style={{
                          background: `color-mix(in srgb, ${tech.accent} 10%, transparent)`,
                        }}
                      >
                        {tech.icon}
                      </div>
                      <div className="sq-tech-body-content">
                        <div className="sq-tech-name sq-ui">{tech.title}</div>
                        <div className="sq-tech-desc">{tech.desc}</div>
                      </div>
                      <div className="sq-tech-count sq-mono">
                        {tech.problems.length} problems
                      </div>
                      <Chev />
                    </div>
                    <div className="sq-tech-body">
                      <div className="sq-tech-body-inner">
                        <div className="sq-divider" />
                        <div className="sq-prob-list">
                          {tech.problems.map((p, pi) => (
                            <a
                              key={pi}
                              href={p.href || `${p.slug}-visualizer.html`}
                              className="sq-prob-link"
                            >
                              <span className="sq-prob-num sq-mono">
                                {String(pi + 1).padStart(2, "0")}
                              </span>
                              <span className="sq-prob-name sq-ui">
                                {p.name}
                              </span>
                              <span className="sq-prob-arr">→</span>
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
        <footer className="sq-footer">
          DSA Visualizer Platform — Built for learners.{" "}
          <a href="index.html">Back to Dashboard</a>
        </footer>
      </div>
    </>
  );
}
