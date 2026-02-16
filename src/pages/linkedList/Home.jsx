import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { linkedListTechniques } from "../../data/linkedListTechniques";

/* ================================================================
   LINKED LIST — DSA Visualizer Platform Topic Page
   
   Aesthetic: "Circuit Board / Neural Pathway"
   - Deep emerald + warm amber palette
   - Animated node chain hero visual
   - Glassmorphism technique cards with expand/collapse
   - Dark / Light theme with smooth transitions
   ================================================================ */

// ─── THEME DEFINITIONS ───────────────────────────────────────────
const themes = {
  dark: {
    "--bg-root": "#060d0b",
    "--bg-hero": "#071210",
    "--bg-section": "#081410",
    "--bg-card": "rgba(12, 28, 22, 0.6)",
    "--bg-card-hover": "rgba(16, 38, 28, 0.75)",
    "--bg-glass": "rgba(12, 32, 24, 0.5)",
    "--bg-tag": "rgba(52, 211, 153, 0.07)",
    "--bg-problem": "rgba(52, 211, 153, 0.03)",
    "--bg-problem-hover": "rgba(52, 211, 153, 0.08)",
    "--text-1": "#e0efe8",
    "--text-2": "#7a9e8e",
    "--text-3": "#4a6e5c",
    "--accent": "#34d399",
    "--accent-2": "#f59e0b",
    "--accent-3": "#ec4899",
    "--accent-4": "#06b6d4",
    "--border": "rgba(52, 211, 153, 0.08)",
    "--border-card": "rgba(52, 211, 153, 0.1)",
    "--border-hover": "rgba(52, 211, 153, 0.25)",
    "--glow": "rgba(52, 211, 153, 0.06)",
    "--glow-strong": "rgba(52, 211, 153, 0.18)",
    "--shadow-card": "0 8px 40px rgba(0,0,0,0.35)",
    "--shadow-hover": "0 12px 48px rgba(52,211,153,0.07)",
    "--node-bg": "rgba(52, 211, 153, 0.06)",
    "--node-border": "rgba(52, 211, 153, 0.3)",
    "--node-active": "rgba(52, 211, 153, 0.15)",
    "--link-color": "rgba(52, 211, 153, 0.25)",
    "--link-active": "rgba(52, 211, 153, 0.6)",
    "--grid-line": "rgba(52, 211, 153, 0.025)",
    "--overlay": "rgba(6, 13, 11, 0.9)",
    "--good": "#34d399",
    "--mid": "#fbbf24",
    "--bad": "#f43f5e",
  },
  light: {
    "--bg-root": "#f4f9f6",
    "--bg-hero": "#ebf5f0",
    "--bg-section": "#eef6f2",
    "--bg-card": "rgba(255, 255, 255, 0.7)",
    "--bg-card-hover": "rgba(255, 255, 255, 0.88)",
    "--bg-glass": "rgba(255, 255, 255, 0.55)",
    "--bg-tag": "rgba(5, 150, 105, 0.06)",
    "--bg-problem": "rgba(5, 150, 105, 0.03)",
    "--bg-problem-hover": "rgba(5, 150, 105, 0.07)",
    "--text-1": "#0f2b1e",
    "--text-2": "#4a7a62",
    "--text-3": "#8aaa98",
    "--accent": "#059669",
    "--accent-2": "#d97706",
    "--accent-3": "#db2777",
    "--accent-4": "#0891b2",
    "--border": "rgba(5, 150, 105, 0.08)",
    "--border-card": "rgba(5, 150, 105, 0.12)",
    "--border-hover": "rgba(5, 150, 105, 0.3)",
    "--glow": "rgba(5, 150, 105, 0.04)",
    "--glow-strong": "rgba(5, 150, 105, 0.1)",
    "--shadow-card": "0 8px 40px rgba(15,50,35,0.06)",
    "--shadow-hover": "0 12px 48px rgba(5,150,105,0.06)",
    "--node-bg": "rgba(5, 150, 105, 0.05)",
    "--node-border": "rgba(5, 150, 105, 0.28)",
    "--node-active": "rgba(5, 150, 105, 0.12)",
    "--link-color": "rgba(5, 150, 105, 0.2)",
    "--link-active": "rgba(5, 150, 105, 0.55)",
    "--grid-line": "rgba(5, 150, 105, 0.03)",
    "--overlay": "rgba(244, 249, 246, 0.92)",
    "--good": "#059669",
    "--mid": "#d97706",
    "--bad": "#dc2649",
  },
};

// ─── TECHNIQUES DATA ─────────────────────────────────────────────
const TECHNIQUE_COLORS = [
  "var(--accent)",
  "var(--accent-2)",
  "var(--accent-4)",
  "var(--accent-3)",
];

const TECHNIQUES = (linkedListTechniques || []).map((technique, index) => ({
  id: technique.id || `technique-${index}`,
  icon: technique.icon || "🔗",
  title: technique.title || technique.id || `Technique ${index + 1}`,
  desc: technique.desc || "",
  color: technique.color || TECHNIQUE_COLORS[index % TECHNIQUE_COLORS.length],
  problems: (technique.problems || []).map((problem) => ({
    name:
      problem.name ||
      problem.title ||
      problem.problemSlug ||
      problem.slug ||
      "Problem",
    slug: problem.problemSlug || problem.slug || "",
    href: problem.href || problem.visualLink || "/linked-list/visualizer",
  })),
}));

// ─── COMPLEXITY DATA ─────────────────────────────────────────────
const COMPLEXITIES = [
  { op: "Access", val: "O(n)", tier: "bad" },
  { op: "Search", val: "O(n)", tier: "bad" },
  { op: "Insert (head)", val: "O(1)", tier: "good" },
  { op: "Delete (head)", val: "O(1)", tier: "good" },
  { op: "Insert (mid)", val: "O(n)", tier: "mid" },
  { op: "Delete (mid)", val: "O(n)", tier: "mid" },
];

// ─── INFO CARDS DATA ─────────────────────────────────────────────
const INFO_CARDS = [
  {
    icon: "🔗",
    title: "What is a Linked List?",
    text: "A linear collection of nodes where each node stores data and a pointer to the next node. Unlike arrays, elements are not stored contiguously.",
  },
  {
    icon: "🧠",
    title: "Memory Model",
    text: "Nodes are scattered across heap memory. Each node holds a value and a reference (pointer) to the next — enabling dynamic size without reallocation.",
  },
  {
    icon: "⚡",
    title: "When to Use",
    text: "When frequent insertions/deletions at head or middle are needed, size is unknown, or you need a queue/stack with O(1) push/pop operations.",
  },
  {
    icon: "⚠️",
    title: "Trade-offs",
    text: "No O(1) random access — traversal is sequential. Extra memory per node for pointers. Poor cache locality compared to arrays.",
  },
];

// ─── NODE CHAIN HERO VISUAL DATA ─────────────────────────────────
const HERO_NODES = [
  { val: 7, label: "HEAD" },
  { val: 14 },
  { val: 23 },
  { val: 35 },
  { val: 42, label: "TAIL" },
];

// ─── STYLES ──────────────────────────────────────────────────────
const css = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(22px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes nodeAppear {
    from { opacity: 0; transform: scale(0.4); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes linkGrow {
    from { transform: scaleX(0); opacity: 0; }
    to { transform: scaleX(1); opacity: 1; }
  }
  @keyframes pulseGlow {
    0%, 100% { box-shadow: 0 0 0 0 var(--glow-strong); }
    50% { box-shadow: 0 0 24px 4px var(--glow-strong); }
  }
  @keyframes orbDrift {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(20px, -30px) scale(1.05); }
    66% { transform: translate(-18px, 15px) scale(0.95); }
  }
  @keyframes traversePulse {
    0% { background: var(--node-bg); border-color: var(--node-border); }
    50% { background: var(--node-active); border-color: var(--accent); box-shadow: 0 0 20px var(--glow-strong); }
    100% { background: var(--node-bg); border-color: var(--node-border); }
  }
  @keyframes pointerBounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  .ll-root {
    font-family: Georgia, 'Times New Roman', serif;
    background: var(--bg-root);
    color: var(--text-1);
    min-height: 100vh;
    overflow-x: hidden;
    line-height: 1.65;
    transition: background 0.5s cubic-bezier(0.4,0,0.2,1), color 0.5s cubic-bezier(0.4,0,0.2,1);
    position: relative;
  }

  /* Grid background */
  .ll-root::before {
    content: '';
    position: fixed;
    inset: 0;
    background:
      linear-gradient(var(--grid-line) 1px, transparent 1px),
      linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
    background-size: 52px 52px;
    pointer-events: none;
    z-index: 0;
  }

  .ll-heading { font-family: 'Segoe UI', system-ui, sans-serif; }
  .ll-mono { font-family: 'Cascadia Code', 'Fira Code', 'Consolas', monospace; }

  /* ── TOPBAR ── */
  .ll-topbar {
    position: fixed; top: 0; left: 0; right: 0; z-index: 999;
    height: 60px; display: flex; align-items: center; justify-content: space-between;
    padding: 0 clamp(1rem, 4vw, 3rem);
    background: var(--overlay);
    backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
    border-bottom: 1px solid var(--border);
    transition: background 0.5s ease;
  }
  .ll-topbar-brand {
    display: flex; align-items: center; gap: 10px;
    font-family: 'Segoe UI', system-ui, sans-serif;
    font-weight: 700; font-size: 0.95rem; cursor: pointer;
  }
  .ll-topbar-logo {
    width: 32px; height: 32px; border-radius: 8px;
    background: linear-gradient(135deg, var(--accent), var(--accent-2));
    display: grid; place-items: center;
    font-size: 0.7rem; font-weight: 800; color: #fff;
    position: relative;
  }
  .ll-topbar-logo::after {
    content: ''; position: absolute; inset: 0; border-radius: 8px;
    background: linear-gradient(135deg, transparent 50%, rgba(255,255,255,0.15));
  }
  .ll-topbar-sep { color: var(--text-3); font-weight: 300; margin: 0 2px; }
  .ll-topbar-topic { color: var(--accent); }

  .ll-topbar-actions { display: flex; align-items: center; gap: 14px; }

  .ll-back-btn {
    display: flex; align-items: center; gap: 5px;
    padding: 5px 14px; border-radius: 8px;
    background: var(--bg-glass); border: 1px solid var(--border-card);
    color: var(--text-2); font-family: 'Segoe UI', system-ui, sans-serif;
    font-size: 0.78rem; font-weight: 600; cursor: pointer;
    transition: all 0.3s ease;
  }
  .ll-back-btn:hover { color: var(--text-1); border-color: var(--border-hover); }

  /* Theme toggle */
  .ll-theme-toggle {
    width: 50px; height: 26px; border-radius: 20px;
    background: var(--bg-glass); border: 1.5px solid var(--border-card);
    cursor: pointer; position: relative; transition: all 0.3s ease; flex-shrink: 0;
  }
  .ll-theme-toggle:hover { border-color: var(--border-hover); }
  .ll-toggle-knob {
    position: absolute; top: 2px; left: 2px;
    width: 18px; height: 18px; border-radius: 50%;
    background: linear-gradient(135deg, var(--accent), var(--accent-2));
    transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1);
    display: grid; place-items: center; font-size: 10px;
  }
  .ll-toggle-knob.light { transform: translateX(24px); }

  /* ── HERO ── */
  .ll-hero {
    position: relative; min-height: 90vh;
    display: flex; align-items: center; justify-content: center;
    padding: 100px clamp(1.5rem, 5vw, 4rem) 4rem;
    overflow: hidden;
  }
  .ll-hero-bg {
    position: absolute; inset: 0; z-index: 0;
    transition: background 0.5s ease;
  }
  .ll-hero-orb {
    position: absolute; border-radius: 50%; filter: blur(90px); pointer-events: none; z-index: 1;
  }
  .ll-hero-content {
    position: relative; z-index: 2;
    max-width: 1020px; width: 100%;
    display: flex; flex-direction: column; align-items: center;
    gap: 3rem;
  }
  .ll-hero-text {
    display: flex; flex-direction: column; align-items: center;
    gap: 1rem; text-align: center; max-width: 600px;
  }

  .ll-breadcrumb {
    display: inline-flex; align-items: center; gap: 6px;
    font-family: 'Segoe UI', system-ui, sans-serif;
    font-size: 0.7rem; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.14em; color: var(--text-3);
    animation: fadeUp 0.7s ease both;
  }
  .ll-breadcrumb .sep { opacity: 0.4; }
  .ll-breadcrumb .current { color: var(--accent); }

  .ll-hero-title {
    font-family: 'Segoe UI', system-ui, sans-serif;
    font-size: clamp(2.6rem, 6vw, 4.2rem);
    font-weight: 800; letter-spacing: -0.045em; line-height: 1.05;
    animation: fadeUp 0.7s ease 0.08s both;
  }
  .ll-hero-title .thin { font-weight: 300; color: var(--text-2); }

  .ll-hero-desc {
    font-size: clamp(0.92rem, 1.8vw, 1.06rem);
    color: var(--text-2); line-height: 1.75; max-width: 520px;
    animation: fadeUp 0.7s ease 0.16s both;
  }

  .ll-hero-cta {
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
  .ll-hero-cta::before {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.15));
  }
  .ll-hero-cta:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: 0 10px 40px rgba(52,211,153,0.2);
  }
  .ll-hero-cta .arrow { transition: transform 0.3s ease; }
  .ll-hero-cta:hover .arrow { transform: translateX(5px); }

  /* ── NODE CHAIN VISUAL ── */
  .ll-chain-wrap {
    animation: fadeUp 0.8s ease 0.3s both;
    display: flex; flex-direction: column; align-items: center; gap: 0.8rem;
    width: 100%;
  }
  .ll-chain-label {
    font-family: 'Cascadia Code', 'Fira Code', 'Consolas', monospace;
    font-size: 0.62rem; color: var(--text-3);
    text-transform: uppercase; letter-spacing: 0.15em;
  }
  .ll-chain {
    display: flex; align-items: center; gap: 0;
    flex-wrap: wrap; justify-content: center;
  }
  .ll-chain-node {
    display: flex; align-items: center;
  }
  .ll-node-box {
    width: 68px; height: 68px;
    border: 1.5px solid var(--node-border); border-radius: 14px;
    background: var(--node-bg);
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    position: relative;
    transition: all 0.4s ease;
  }
  .ll-node-box.active {
    background: var(--node-active);
    border-color: var(--accent);
    box-shadow: 0 0 20px var(--glow-strong);
  }
  .ll-node-val {
    font-family: 'Cascadia Code', 'Fira Code', 'Consolas', monospace;
    font-weight: 700; font-size: 1.1rem; color: var(--accent);
  }
  .ll-node-ptr {
    font-family: 'Cascadia Code', 'Fira Code', 'Consolas', monospace;
    font-size: 0.52rem; color: var(--text-3); margin-top: 2px; opacity: 0.7;
  }
  .ll-node-label {
    position: absolute; top: -20px;
    font-family: 'Cascadia Code', 'Fira Code', 'Consolas', monospace;
    font-size: 0.58rem; font-weight: 700; color: var(--accent);
    text-transform: uppercase; letter-spacing: 0.08em;
  }
  .ll-chain-arrow-wrap {
    display: flex; align-items: center; position: relative;
    width: 44px; height: 2px;
    transform-origin: left center;
  }
  .ll-chain-arrow {
    width: 100%; height: 2px;
    background: var(--link-color);
    position: relative;
    transition: background 0.4s ease;
  }
  .ll-chain-arrow.active { background: var(--link-active); }
  .ll-chain-arrow::after {
    content: ''; position: absolute; right: -1px; top: -4px;
    border: 5px solid transparent; border-left: 7px solid var(--link-color);
    transition: border-color 0.4s ease;
  }
  .ll-chain-arrow.active::after { border-left-color: var(--link-active); }
  .ll-null-box {
    padding: 6px 10px; border-radius: 8px;
    border: 1.5px dashed var(--text-3);
    font-family: 'Cascadia Code', 'Fira Code', 'Consolas', monospace;
    font-size: 0.65rem; color: var(--text-3); font-weight: 700;
    opacity: 0.5;
  }

  /* Complexity chips */
  .ll-complexity-strip {
    display: flex; gap: 6px; flex-wrap: wrap; justify-content: center;
    animation: fadeUp 0.7s ease 0.5s both; margin-top: 0.4rem;
  }
  .ll-complexity-chip {
    display: flex; align-items: center; gap: 5px;
    padding: 4px 12px; border-radius: 20px;
    background: var(--bg-glass); border: 1px solid var(--border-card);
    font-family: 'Cascadia Code', 'Fira Code', 'Consolas', monospace;
    font-size: 0.62rem; font-weight: 600;
    backdrop-filter: blur(8px);
    transition: background 0.5s ease, border-color 0.5s ease;
  }
  .ll-complexity-chip .op { color: var(--text-3); text-transform: uppercase; letter-spacing: 0.06em; }
  .ll-complexity-chip .val { font-weight: 700; }
  .ll-complexity-chip .val.good { color: var(--good); }
  .ll-complexity-chip .val.mid { color: var(--mid); }
  .ll-complexity-chip .val.bad { color: var(--bad); }

  /* ── INFO STRIP ── */
  .ll-info-strip {
    position: relative; z-index: 1;
    padding: 0 clamp(1.5rem, 5vw, 4rem);
  }
  .ll-info-grid {
    max-width: 960px; margin: -2rem auto 0;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }
  .ll-info-card {
    background: var(--bg-card);
    backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
    border: 1px solid var(--border-card); border-radius: 14px;
    padding: 1.25rem 1.3rem;
    transition: all 0.35s ease;
  }
  .ll-info-card:hover {
    border-color: var(--border-hover);
    box-shadow: var(--shadow-hover);
    transform: translateY(-2px);
  }
  .ll-info-icon { font-size: 1.3rem; margin-bottom: 0.5rem; }
  .ll-info-title {
    font-family: 'Segoe UI', system-ui, sans-serif;
    font-size: 0.8rem; font-weight: 700; margin-bottom: 0.25rem;
  }
  .ll-info-text { font-size: 0.76rem; color: var(--text-2); line-height: 1.55; }

  /* ── SECTION ── */
  .ll-section {
    padding: 5rem clamp(1.5rem, 5vw, 4rem);
    position: relative; z-index: 1;
  }
  .ll-section-inner { max-width: 960px; margin: 0 auto; }
  .ll-section-eyebrow {
    font-family: 'Segoe UI', system-ui, sans-serif;
    font-size: 0.68rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.16em;
    color: var(--accent); margin-bottom: 0.5rem;
  }
  .ll-section-title {
    font-family: 'Segoe UI', system-ui, sans-serif;
    font-size: clamp(1.5rem, 3.5vw, 2rem);
    font-weight: 800; letter-spacing: -0.035em;
  }
  .ll-section-subtitle {
    color: var(--text-2); font-size: 0.92rem;
    margin-top: 0.4rem; max-width: 560px;
  }

  /* ── TECHNIQUE CARDS ── */
  .ll-techniques-list {
    display: flex; flex-direction: column; gap: 1rem; margin-top: 2.5rem;
  }
  .ll-tech-card {
    background: var(--bg-card);
    border: 1px solid var(--border-card);
    border-radius: 14px;
    backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
    overflow: hidden;
    transition: background 0.5s ease, border-color 0.3s ease, box-shadow 0.3s ease;
  }
  .ll-tech-card:hover, .ll-tech-card.open {
    border-color: var(--border-hover);
    box-shadow: var(--shadow-hover);
  }
  .ll-tech-header {
    display: flex; align-items: center; gap: 14px;
    padding: 1.25rem 1.4rem; cursor: pointer; user-select: none;
    transition: background 0.25s ease;
  }
  .ll-tech-header:hover { background: var(--glow); }

  .ll-tech-icon {
    width: 44px; height: 44px; border-radius: 10px;
    display: grid; place-items: center; font-size: 1.1rem; flex-shrink: 0;
    transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1);
  }
  .ll-tech-card:hover .ll-tech-icon,
  .ll-tech-card.open .ll-tech-icon { transform: scale(1.08) rotate(-4deg); }

  .ll-tech-info { flex: 1; min-width: 0; }
  .ll-tech-name {
    font-family: 'Segoe UI', system-ui, sans-serif;
    font-size: 1.02rem; font-weight: 700;
  }
  .ll-tech-desc {
    font-size: 0.8rem; color: var(--text-2); margin-top: 2px; line-height: 1.5;
  }
  .ll-tech-count {
    font-family: 'Cascadia Code', 'Fira Code', 'Consolas', monospace;
    font-size: 0.66rem; color: var(--text-3);
    padding: 3px 10px; border-radius: 20px; background: var(--bg-tag); flex-shrink: 0;
  }
  .ll-tech-chevron {
    width: 20px; height: 20px; flex-shrink: 0;
    transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1), color 0.3s ease;
    color: var(--text-3);
  }
  .ll-tech-card.open .ll-tech-chevron { transform: rotate(180deg); color: var(--accent); }

  .ll-tech-body {
    max-height: 0; overflow: hidden;
    transition: max-height 0.5s cubic-bezier(0.4,0,0.2,1);
  }
  .ll-tech-card.open .ll-tech-body { max-height: 500px; }

  .ll-tech-body-inner {
    padding: 0 1.4rem 1.4rem;
    opacity: 0; transform: translateY(-8px);
    transition: opacity 0.35s ease 0.1s, transform 0.35s ease 0.1s;
  }
  .ll-tech-card.open .ll-tech-body-inner { opacity: 1; transform: translateY(0); }

  .ll-problems-divider {
    height: 1px; background: var(--border); margin-bottom: 0.8rem;
  }
  .ll-problems-list { display: flex; flex-direction: column; gap: 4px; }

  .ll-problem-link {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 14px; border-radius: 8px;
    background: var(--bg-problem);
    transition: all 0.25s ease; cursor: pointer;
    text-decoration: none; color: var(--text-1);
    position: relative; overflow: hidden;
  }
  .ll-problem-link::before {
    content: ''; position: absolute; left: 0; top: 0; bottom: 0;
    width: 3px; background: linear-gradient(180deg, var(--accent), var(--accent-2));
    opacity: 0; transition: opacity 0.25s ease;
  }
  .ll-problem-link:hover {
    background: var(--bg-problem-hover);
    transform: translateX(4px);
  }
  .ll-problem-link:hover::before { opacity: 1; }

  .ll-problem-num {
    font-family: 'Cascadia Code', 'Fira Code', 'Consolas', monospace;
    font-size: 0.66rem; color: var(--text-3); font-weight: 600;
    width: 22px; text-align: center; flex-shrink: 0;
  }
  .ll-problem-name {
    font-family: 'Segoe UI', system-ui, sans-serif;
    font-size: 0.86rem; font-weight: 600; flex: 1;
  }
  .ll-problem-arrow {
    color: var(--text-3); opacity: 0; transform: translateX(-6px);
    transition: all 0.25s ease;
    font-family: 'Segoe UI', system-ui, sans-serif; font-size: 0.8rem;
  }
  .ll-problem-link:hover .ll-problem-arrow {
    opacity: 1; transform: translateX(0); color: var(--accent);
  }

  /* ── FOOTER ── */
  .ll-footer {
    position: relative; z-index: 1;
    padding: 2.5rem clamp(1.5rem, 5vw, 4rem);
    text-align: center; border-top: 1px solid var(--border);
    font-family: 'Segoe UI', system-ui, sans-serif;
    font-size: 0.75rem; color: var(--text-3);
    transition: border-color 0.5s ease;
  }
  .ll-footer a { color: var(--accent); text-decoration: none; }

  /* ── RESPONSIVE ── */
  @media (max-width: 640px) {
    .ll-hero { min-height: auto; padding-top: 85px; padding-bottom: 2rem; }
    .ll-node-box { width: 52px; height: 52px; }
    .ll-node-val { font-size: 0.9rem; }
    .ll-chain-arrow-wrap { width: 28px; }
    .ll-info-grid { grid-template-columns: 1fr 1fr; }
    .ll-tech-header { padding: 1rem 1.1rem; gap: 10px; }
    .ll-tech-desc { display: none; }
  }
`;

// ─── CHEVRON SVG COMPONENT ──────────────────────────────────────
function Chevron() {
  return (
    <svg
      className="ll-tech-chevron"
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
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────
export default function LinkedListTopicPage() {
  const [theme, setTheme] = useState("dark");
  const [openTech, setOpenTech] = useState(null);
  const [activeNode, setActiveNode] = useState(-1);
  const rootRef = useRef(null);
  const animRef = useRef(null);

  // ── Apply theme CSS variables to root ──
  useEffect(() => {
    const vars = themes[theme];
    const root = rootRef.current;
    if (!root) return;
    Object.entries(vars).forEach(([key, val]) => {
      root.style.setProperty(key, val);
    });
  }, [theme]);

  // ── Animate node traversal in hero ──
  useEffect(() => {
    let idx = 0;
    const tick = () => {
      setActiveNode(idx);
      idx = (idx + 1) % HERO_NODES.length;
    };
    tick();
    animRef.current = setInterval(tick, 1400);
    return () => clearInterval(animRef.current);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }, []);

  const toggleTech = useCallback((id) => {
    setOpenTech((prev) => (prev === id ? null : id));
  }, []);

  return (
    <>
      <style>{css}</style>
      <div className="ll-root" ref={rootRef}>
        {/* ── TOPBAR ── */}
        <nav className="ll-topbar">
          <div className="ll-topbar-brand">
            <div className="ll-topbar-logo">DS</div>
            <span className="ll-heading">DSA Visualizer</span>
            <span className="ll-topbar-sep">/</span>
            <span className="ll-topbar-topic ll-heading">Linked List</span>
          </div>
          <div className="ll-topbar-actions">
            <button
              className="ll-back-btn"
              onClick={() => (window.location.href = "index.html")}
            >
              ← Dashboard
            </button>
            <div
              className="ll-theme-toggle"
              onClick={toggleTheme}
              role="button"
              tabIndex={0}
              onKeyDown={(e) =>
                (e.key === "Enter" || e.key === " ") && toggleTheme()
              }
            >
              <div
                className={`ll-toggle-knob ${theme === "light" ? "light" : ""}`}
              >
                {theme === "dark" ? "🌙" : "☀️"}
              </div>
            </div>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section className="ll-hero">
          <div
            className="ll-hero-bg"
            style={{
              background:
                theme === "dark"
                  ? "radial-gradient(ellipse 70% 50% at 30% 20%, #0c1e18 0%, transparent 70%), radial-gradient(ellipse 60% 60% at 80% 70%, #100820 0%, transparent 60%), #060d0b"
                  : "radial-gradient(ellipse 70% 50% at 30% 20%, #ddf0e6 0%, transparent 70%), radial-gradient(ellipse 60% 60% at 80% 70%, #f0eaf8 0%, transparent 60%), #f4f9f6",
            }}
          />
          <div
            className="ll-hero-orb"
            style={{
              width: 450,
              height: 450,
              background: "var(--accent)",
              opacity: 0.07,
              top: "-12%",
              right: "-6%",
              animation: "orbDrift 16s ease-in-out infinite",
            }}
          />
          <div
            className="ll-hero-orb"
            style={{
              width: 300,
              height: 300,
              background: "var(--accent-2)",
              opacity: 0.06,
              bottom: "-4%",
              left: "-5%",
              animation: "orbDrift 20s ease-in-out infinite reverse",
            }}
          />
          <div
            className="ll-hero-orb"
            style={{
              width: 180,
              height: 180,
              background: "var(--accent-4)",
              opacity: 0.05,
              top: "50%",
              left: "55%",
              animation: "orbDrift 14s ease-in-out 3s infinite",
            }}
          />

          <div className="ll-hero-content">
            {/* Text */}
            <div className="ll-hero-text">
              <div className="ll-breadcrumb">
                <span>DSA</span>
                <span className="sep">›</span>
                <span>Data Structures</span>
                <span className="sep">›</span>
                <span className="current">Linked List</span>
              </div>
              <h1 className="ll-hero-title ll-heading">
                Linked List
                <br />
                <span className="thin">Fundamentals</span>
              </h1>
              <p className="ll-hero-desc">
                A dynamic, pointer-based data structure where each node holds
                data and a reference to the next. Unlike arrays, linked lists
                offer O(1) insertion at the head and never need reallocation —
                trading random access for structural flexibility.
              </p>
              <Link to="/linked-list/visualizer" className="ll-hero-cta">
                Open Visualizer <span className="arrow">→</span>
              </Link>
            </div>

            {/* Animated Node Chain */}
            <div className="ll-chain-wrap">
              <div className="ll-chain-label">
                Singly Linked List — Traversal Animation
              </div>
              <div className="ll-chain">
                {HERO_NODES.map((node, i) => (
                  <div
                    className="ll-chain-node"
                    key={i}
                    style={{
                      animation: `nodeAppear 0.45s cubic-bezier(0.34,1.56,0.64,1) ${0.4 + i * 0.1}s both`,
                    }}
                  >
                    <div
                      className={`ll-node-box ${activeNode === i ? "active" : ""}`}
                    >
                      {node.label && (
                        <span className="ll-node-label">{node.label}</span>
                      )}
                      <span className="ll-node-val">{node.val}</span>
                      <span className="ll-node-ptr">next →</span>
                    </div>
                    {i < HERO_NODES.length - 1 && (
                      <div
                        className="ll-chain-arrow-wrap"
                        style={{
                          animation: `linkGrow 0.35s ease ${0.5 + i * 0.1}s both`,
                        }}
                      >
                        <div
                          className={`ll-chain-arrow ${activeNode === i ? "active" : ""}`}
                        />
                      </div>
                    )}
                  </div>
                ))}
                {/* NULL terminator */}
                <div
                  className="ll-chain-node"
                  style={{
                    animation: `nodeAppear 0.45s ease ${0.4 + HERO_NODES.length * 0.1}s both`,
                  }}
                >
                  <div
                    className="ll-chain-arrow-wrap"
                    style={{
                      animation: `linkGrow 0.35s ease ${0.5 + (HERO_NODES.length - 1) * 0.1}s both`,
                    }}
                  >
                    <div className="ll-chain-arrow" />
                  </div>
                  <div className="ll-null-box">NULL</div>
                </div>
              </div>

              {/* Complexity chips */}
              <div className="ll-complexity-strip">
                {COMPLEXITIES.map((c, i) => (
                  <div className="ll-complexity-chip" key={i}>
                    <span className="op">{c.op}</span>
                    <span className={`val ${c.tier}`}>{c.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── INFO CARDS ── */}
        <div className="ll-info-strip">
          <div className="ll-info-grid">
            {INFO_CARDS.map((card, i) => (
              <div
                className="ll-info-card"
                key={i}
                style={{
                  animation: `fadeUp 0.6s ease ${0.5 + i * 0.08}s both`,
                }}
              >
                <div className="ll-info-icon">{card.icon}</div>
                <div className="ll-info-title ll-heading">{card.title}</div>
                <div className="ll-info-text">{card.text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── TECHNIQUES SECTION ── */}
        <section className="ll-section">
          <div className="ll-section-inner">
            <div
              style={{
                marginBottom: "0.5rem",
                animation: "fadeUp 0.6s ease both",
              }}
            >
              <div className="ll-section-eyebrow">Explore</div>
              <h2 className="ll-section-title ll-heading">
                Linked List Techniques & Patterns
              </h2>
              <p className="ll-section-subtitle">
                Master these core pointer-manipulation patterns to solve the
                majority of linked list interview problems.
              </p>
            </div>

            <div className="ll-techniques-list">
              {TECHNIQUES.map((tech, ti) => {
                const isOpen = openTech === tech.id;
                return (
                  <div
                    className={`ll-tech-card ${isOpen ? "open" : ""}`}
                    key={tech.id}
                    style={{
                      animation: `fadeUp 0.6s ease ${0.05 + ti * 0.07}s both`,
                    }}
                  >
                    <div
                      className="ll-tech-header"
                      onClick={() => toggleTech(tech.id)}
                    >
                      <div
                        className="ll-tech-icon"
                        style={{
                          background: `color-mix(in srgb, ${tech.color} 10%, transparent)`,
                        }}
                      >
                        {tech.icon}
                      </div>
                      <div className="ll-tech-info">
                        <div className="ll-tech-name ll-heading">
                          {tech.title}
                        </div>
                        <div className="ll-tech-desc">{tech.desc}</div>
                      </div>
                      <div className="ll-tech-count">
                        {tech.problems.length} problems
                      </div>
                      <Chevron />
                    </div>
                    <div className="ll-tech-body">
                      <div className="ll-tech-body-inner">
                        <div className="ll-problems-divider" />
                        <div className="ll-problems-list">
                          {tech.problems.map((p, pi) => (
                            <a
                              key={pi}
                              href={p.href}
                              className="ll-problem-link"
                            >
                              <span className="ll-problem-num">
                                {String(pi + 1).padStart(2, "0")}
                              </span>
                              <span className="ll-problem-name ll-heading">
                                {p.name}
                              </span>
                              <span className="ll-problem-arrow">→</span>
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
        <footer className="ll-footer">
          DSA Visualizer Platform — Built for learners.{" "}
          <a href="index.html">Back to Dashboard</a>
        </footer>
      </div>
    </>
  );
}
