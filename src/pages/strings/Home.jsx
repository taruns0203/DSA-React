import { useState, useEffect, useRef, useCallback } from "react";
import { stringTechniques } from "../../data/stringTechniques";
import { Link } from "react-router-dom";

/* ================================================================
   STRINGS — DSA Visualizer Platform Topic Page

   Aesthetic: "Typewriter / Editorial Manuscript"
   - Warm sepia-ink tones with deep burgundy & antique gold
   - Animated two-pointer palindrome check on character array
   - Glassmorphism technique accordions (6 categories)
   - Dark / Light theme with smooth CSS-variable transitions
   ================================================================ */

// ─── PALETTES ────────────────────────────────────────────────────
const PAL = {
  dark: {
    "--bg-root": "#0c0a08",
    "--bg-hero": "#0e0c0a",
    "--bg-section": "#100e0c",
    "--bg-card": "rgba(24, 18, 12, 0.6)",
    "--bg-card-hover": "rgba(36, 28, 18, 0.78)",
    "--bg-glass": "rgba(24, 20, 14, 0.48)",
    "--bg-tag": "rgba(168, 50, 50, 0.07)",
    "--bg-problem": "rgba(168, 50, 50, 0.02)",
    "--bg-problem-hover": "rgba(168, 50, 50, 0.06)",
    "--text-1": "#e8e0d4",
    "--text-2": "#9a8e78",
    "--text-3": "#665c4a",
    "--accent": "#c0392b",
    "--accent-2": "#d4a843",
    "--accent-3": "#2e86ab",
    "--accent-4": "#8e44ad",
    "--accent-5": "#27ae60",
    "--accent-6": "#e67e22",
    "--border": "rgba(168, 50, 50, 0.06)",
    "--border-card": "rgba(168, 50, 50, 0.09)",
    "--border-hover": "rgba(168, 50, 50, 0.24)",
    "--glow": "rgba(168, 50, 50, 0.04)",
    "--glow-strong": "rgba(168, 50, 50, 0.14)",
    "--shadow-card": "0 8px 44px rgba(0,0,0,0.42)",
    "--shadow-hover": "0 14px 52px rgba(168,50,50,0.06)",
    "--char-bg": "rgba(212, 168, 67, 0.03)",
    "--char-border": "rgba(212, 168, 67, 0.14)",
    "--char-text": "rgba(212, 168, 67, 0.4)",
    "--char-active-bg": "rgba(212, 168, 67, 0.1)",
    "--char-active-border": "#d4a843",
    "--char-active-text": "#d4a843",
    "--char-match-bg": "rgba(39, 174, 96, 0.08)",
    "--char-match-border": "rgba(39, 174, 96, 0.35)",
    "--char-match-text": "#27ae60",
    "--char-mid-bg": "rgba(192, 57, 43, 0.08)",
    "--char-mid-border": "rgba(192, 57, 43, 0.35)",
    "--char-mid-text": "#c0392b",
    "--ptr-left": "#d4a843",
    "--ptr-right": "#c0392b",
    "--grid-line": "rgba(212, 168, 67, 0.01)",
    "--overlay": "rgba(12, 10, 8, 0.92)",
    "--good": "#27ae60",
    "--mid": "#d4a843",
    "--bad": "#c0392b",
    "--ruled": "rgba(212, 168, 67, 0.022)",
    "--margin-line": "rgba(192, 57, 43, 0.06)",
  },
  light: {
    "--bg-root": "#faf6f0",
    "--bg-hero": "#f4ede2",
    "--bg-section": "#f6f0e6",
    "--bg-card": "rgba(255,255,255,0.72)",
    "--bg-card-hover": "rgba(255,255,255,0.9)",
    "--bg-glass": "rgba(255,255,255,0.58)",
    "--bg-tag": "rgba(140, 30, 30, 0.06)",
    "--bg-problem": "rgba(140, 30, 30, 0.02)",
    "--bg-problem-hover": "rgba(140, 30, 30, 0.05)",
    "--text-1": "#2a2018",
    "--text-2": "#6e5e48",
    "--text-3": "#a89a84",
    "--accent": "#a02020",
    "--accent-2": "#a08020",
    "--accent-3": "#1a6a8a",
    "--accent-4": "#6a2e8a",
    "--accent-5": "#1a7a44",
    "--accent-6": "#c06010",
    "--border": "rgba(140, 30, 30, 0.07)",
    "--border-card": "rgba(140, 30, 30, 0.1)",
    "--border-hover": "rgba(140, 30, 30, 0.26)",
    "--glow": "rgba(140, 30, 30, 0.03)",
    "--glow-strong": "rgba(140, 30, 30, 0.08)",
    "--shadow-card": "0 8px 44px rgba(42,32,24,0.06)",
    "--shadow-hover": "0 14px 52px rgba(140,30,30,0.04)",
    "--char-bg": "rgba(160, 128, 32, 0.03)",
    "--char-border": "rgba(160, 128, 32, 0.14)",
    "--char-text": "rgba(160, 128, 32, 0.4)",
    "--char-active-bg": "rgba(160, 128, 32, 0.08)",
    "--char-active-border": "#a08020",
    "--char-active-text": "#a08020",
    "--char-match-bg": "rgba(26, 122, 68, 0.06)",
    "--char-match-border": "rgba(26, 122, 68, 0.3)",
    "--char-match-text": "#1a7a44",
    "--char-mid-bg": "rgba(160, 32, 32, 0.06)",
    "--char-mid-border": "rgba(160, 32, 32, 0.3)",
    "--char-mid-text": "#a02020",
    "--ptr-left": "#a08020",
    "--ptr-right": "#a02020",
    "--grid-line": "rgba(160, 128, 32, 0.014)",
    "--overlay": "rgba(250, 246, 240, 0.92)",
    "--good": "#1a7a44",
    "--mid": "#a08020",
    "--bad": "#a02020",
    "--ruled": "rgba(160, 128, 32, 0.03)",
    "--margin-line": "rgba(160, 32, 32, 0.06)",
  },
};

// ─── PALINDROME CHECK ANIMATION ──────────────────────────────────
const PALINDROME = "RACECAR";
const CHARS = PALINDROME.split("");

// Steps: L and R move inward, matching pairs
function buildPalinSteps(chars) {
  const steps = [];
  let l = 0,
    r = chars.length - 1;
  while (l < r) {
    steps.push({
      l,
      r,
      matched: Array.from({ length: chars.length }, (_, i) =>
        i < l || i > r ? true : false,
      ),
      log: `Compare '${chars[l]}' at [${l}] with '${chars[r]}' at [${r}]`,
      phase: "compare",
    });
    steps.push({
      l,
      r,
      matched: Array.from({ length: chars.length }, (_, i) =>
        i < l || i > r || i === l || i === r ? true : false,
      ),
      log: `'${chars[l]}' = '${chars[r]}' ✓ Match!`,
      phase: "match",
    });
    l++;
    r--;
  }
  // Middle char (odd length)
  if (l === r) {
    steps.push({
      l,
      r: l,
      matched: Array.from({ length: chars.length }, () => true),
      log: `Middle char '${chars[l]}' — palindrome verified!`,
      phase: "center",
    });
  }
  // Final
  steps.push({
    l: -1,
    r: -1,
    matched: Array.from({ length: chars.length }, () => true),
    log: `✓ "${chars.join("")}" is a palindrome!`,
    phase: "done",
  });
  return steps;
}

const PALIN_STEPS = buildPalinSteps(CHARS);

// ─── TECHNIQUES DATA ─────────────────────────────────────────────
const TECHNIQUES = stringTechniques;

const COMPLEXITIES = [
  { op: "Access char", val: "O(1)", tier: "good" },
  { op: "Search substr", val: "O(n·m)", tier: "bad" },
  { op: "KMP / Rabin-Karp", val: "O(n+m)", tier: "good" },
  { op: "Sliding window", val: "O(n)", tier: "good" },
  { op: "String DP", val: "O(n·m)", tier: "mid" },
  { op: "Immutable concat", val: "O(n)", tier: "mid" },
];

const INFO_CARDS = [
  {
    icon: "📜",
    title: "What is a String?",
    text: "An immutable sequence of characters, typically stored as a contiguous array of bytes or UTF-16 code units. In most languages, strings are objects with O(1) index access but O(n) modification.",
  },
  {
    icon: "🧠",
    title: "Memory Model",
    text: "Stored as a contiguous character array plus length metadata. Immutability means every concat or slice creates a new allocation — use StringBuilder/buffer patterns for O(n) total construction.",
  },
  {
    icon: "⚡",
    title: "When to Use",
    text: "Text processing, parsing, pattern matching, encoding/decoding, tokenisation, bioinformatics (DNA sequences), URL routing, and virtually every web and systems programming task.",
  },
  {
    icon: "⚠️",
    title: "Trade-offs",
    text: "Immutability makes naive concatenation O(n²). Unicode handling adds complexity (surrogate pairs, grapheme clusters). Hash collisions affect Rabin-Karp. Tries use O(Σ·n) space.",
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
    33% { transform:translate(16px,-20px) scale(1.04); }
    66% { transform:translate(-12px,14px) scale(0.96); }
  }
  @keyframes matchFlash {
    0% { box-shadow:0 0 0 0 transparent; }
    40% { box-shadow:0 0 16px 3px var(--glow-strong); }
    100% { box-shadow:0 0 0 0 transparent; }
  }
  @keyframes ptrBob {
    0%,100% { transform:translateY(0); }
    50% { transform:translateY(-3px); }
  }
  @keyframes cursorBlink {
    0%,100% { opacity:1; }
    50% { opacity:0; }
  }
  @keyframes typeIn {
    from { width:0; }
    to { width:100%; }
  }

  *,*::before,*::after { margin:0; padding:0; box-sizing:border-box; }

  .st-root {
    font-family:'Palatino Linotype', Palatino, 'Book Antiqua', Georgia, serif;
    background:var(--bg-root);
    color:var(--text-1);
    min-height:100vh;
    overflow-x:hidden;
    line-height:1.7;
    transition:background 0.5s cubic-bezier(0.4,0,0.2,1), color 0.5s cubic-bezier(0.4,0,0.2,1);
    position:relative;
  }
  /* Ruled-paper background with margin line */
  .st-root::before {
    content:'';
    position:fixed; inset:0;
    background:
      repeating-linear-gradient(
        0deg,
        transparent 0px, transparent 31px,
        var(--ruled) 31px, var(--ruled) 32px
      ),
      linear-gradient(90deg, transparent 79px, var(--margin-line) 79px, var(--margin-line) 80px, transparent 80px);
    pointer-events:none; z-index:0;
  }

  .st-ui { font-family:'Segoe UI',system-ui,sans-serif; }
  .st-mono { font-family:'Cascadia Code','Fira Code',Consolas,monospace; }

  /* ─── TOPBAR ─── */
  .st-topbar {
    position:fixed; top:0; left:0; right:0; z-index:999;
    height:60px; display:flex; align-items:center; justify-content:space-between;
    padding:0 clamp(1rem,4vw,3rem);
    background:var(--overlay);
    backdrop-filter:blur(24px); -webkit-backdrop-filter:blur(24px);
    border-bottom:1px solid var(--border);
    transition:background 0.5s ease;
  }
  .st-brand {
    display:flex; align-items:center; gap:10px;
    font-family:'Segoe UI',system-ui,sans-serif;
    font-weight:700; font-size:0.95rem; cursor:pointer;
  }
  .st-logo {
    width:32px; height:32px; border-radius:8px;
    background:linear-gradient(135deg, var(--accent), var(--accent-2));
    display:grid; place-items:center;
    font-size:0.7rem; font-weight:800; color:#fff; position:relative;
  }
  .st-logo::after {
    content:''; position:absolute; inset:0; border-radius:8px;
    background:linear-gradient(135deg,transparent 50%,rgba(255,255,255,0.15));
  }
  .st-sep { color:var(--text-3); font-weight:300; margin:0 2px; }
  .st-topic-lbl { color:var(--accent); }
  .st-actions { display:flex; align-items:center; gap:14px; }
  .st-back {
    display:flex; align-items:center; gap:5px;
    padding:5px 14px; border-radius:8px;
    background:var(--bg-glass); border:1px solid var(--border-card);
    color:var(--text-2); font-family:'Segoe UI',system-ui,sans-serif;
    font-size:0.78rem; font-weight:600; cursor:pointer; transition:all 0.3s ease;
  }
  .st-back:hover { color:var(--text-1); border-color:var(--border-hover); }
  .st-toggle {
    width:50px; height:26px; border-radius:20px;
    background:var(--bg-glass); border:1.5px solid var(--border-card);
    cursor:pointer; position:relative; transition:all 0.3s ease; flex-shrink:0;
  }
  .st-toggle:hover { border-color:var(--border-hover); }
  .st-knob {
    position:absolute; top:2px; left:2px;
    width:18px; height:18px; border-radius:50%;
    background:linear-gradient(135deg, var(--accent), var(--accent-2));
    transition:transform 0.4s cubic-bezier(0.34,1.56,0.64,1);
    display:grid; place-items:center; font-size:10px;
  }
  .st-knob.on { transform:translateX(24px); }

  /* ─── HERO ─── */
  .st-hero {
    position:relative; min-height:92vh;
    display:flex; align-items:center; justify-content:center;
    padding:100px clamp(1.5rem,5vw,4rem) 4rem;
    overflow:hidden;
  }
  .st-hero-bg { position:absolute; inset:0; z-index:0; transition:background 0.5s ease; }
  .st-orb { position:absolute; border-radius:50%; filter:blur(100px); pointer-events:none; z-index:1; }
  .st-hero-inner {
    position:relative; z-index:2;
    max-width:1060px; width:100%;
    display:flex; flex-direction:column; gap:3rem; align-items:center;
  }
  .st-hero-top {
    display:grid; grid-template-columns:1fr 1fr;
    gap:3rem; align-items:center; width:100%;
  }
  @media(max-width:880px) {
    .st-hero-top { grid-template-columns:1fr; gap:2rem; }
    .st-hero-text { text-align:center; align-items:center; }
  }
  .st-hero-text {
    display:flex; flex-direction:column; align-items:flex-start; gap:1.1rem;
  }
  .st-crumb {
    display:inline-flex; align-items:center; gap:6px;
    font-family:'Segoe UI',system-ui,sans-serif;
    font-size:0.7rem; font-weight:600;
    text-transform:uppercase; letter-spacing:0.14em;
    color:var(--text-3); animation:fadeUp 0.7s ease both;
  }
  .st-crumb .s { opacity:0.4; }
  .st-crumb .c { color:var(--accent); }
  .st-h1 {
    font-family:'Segoe UI',system-ui,sans-serif;
    font-size:clamp(2.6rem,6vw,4rem);
    font-weight:800; letter-spacing:-0.04em; line-height:1.08;
    animation:fadeUp 0.7s ease 0.08s both;
  }
  .st-h1 .grad {
    background:linear-gradient(135deg, var(--accent), var(--accent-2));
    -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
  }
  .st-h1 .thin { font-weight:300; color:var(--text-2); }
  .st-desc {
    font-size:clamp(0.9rem,1.6vw,1.02rem);
    color:var(--text-2); line-height:1.78; max-width:460px;
    animation:fadeUp 0.7s ease 0.16s both;
  }
  .st-cta {
    display:inline-flex; align-items:center; gap:10px;
    padding:14px 34px; border-radius:14px;
    background:linear-gradient(135deg, var(--accent), var(--accent-2));
    color:#fff; font-family:'Segoe UI',system-ui,sans-serif;
    font-weight:700; font-size:0.95rem;
    border:none; cursor:pointer; position:relative; overflow:hidden;
    transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease;
    animation:fadeUp 0.7s ease 0.28s both; text-decoration:none;
  }
  .st-cta::before {
    content:''; position:absolute; inset:0;
    background:linear-gradient(135deg,transparent 40%,rgba(255,255,255,0.14));
  }
  .st-cta:hover {
    transform:translateY(-3px) scale(1.02);
    box-shadow:0 10px 44px var(--glow-strong);
  }
  .st-cta .ar { transition:transform 0.3s ease; }
  .st-cta:hover .ar { transform:translateX(5px); }

  /* ─── PALINDROME VIZ ─── */
  .st-viz-wrap {
    display:flex; flex-direction:column; align-items:center; gap:0.7rem;
    animation:fadeUp 0.8s ease 0.2s both;
    width:100%; max-width:460px;
  }
  .st-viz-label {
    font-family:'Cascadia Code','Fira Code',Consolas,monospace;
    font-size:0.6rem; color:var(--text-3);
    text-transform:uppercase; letter-spacing:0.14em;
  }

  .st-quote-box {
    padding:14px 20px; border-radius:12px;
    background:var(--bg-card);
    border:1px solid var(--border-card);
    backdrop-filter:blur(12px); width:100%;
    display:flex; flex-direction:column; align-items:center; gap:10px;
    transition:background 0.5s ease, border-color 0.5s ease;
  }
  .st-quote-title {
    font-family:'Cascadia Code','Fira Code',Consolas,monospace;
    font-size:0.52rem; color:var(--text-3); font-weight:700;
    text-transform:uppercase; letter-spacing:0.12em;
    width:100%; display:flex; justify-content:space-between;
  }
  .st-algo-tag {
    padding:1px 8px; border-radius:10px;
    background:var(--bg-tag);
    color:var(--accent); font-size:0.5rem; font-weight:700;
  }

  /* Pointer row */
  .st-ptr-row, .st-char-row, .st-idx-row {
    display:flex; gap:0; justify-content:center;
  }
  .st-idx-cell {
    width:52px; text-align:center; padding:2px 0;
    font-family:'Cascadia Code','Fira Code',Consolas,monospace;
    font-size:0.46rem; color:var(--text-3); letter-spacing:0.04em;
  }
  .st-char-cell {
    width:52px; height:52px;
    border:1.5px solid var(--char-border);
    background:var(--char-bg);
    display:grid; place-items:center;
    font-family:'Cascadia Code','Fira Code',Consolas,monospace;
    font-size:1.1rem; font-weight:700;
    color:var(--char-text);
    transition:all 0.4s ease;
    position:relative;
  }
  .st-char-cell:first-child { border-radius:8px 0 0 8px; }
  .st-char-cell:last-child { border-radius:0 8px 8px 0; }
  .st-char-cell:not(:first-child) { border-left:none; }
  .st-char-cell.active-l {
    background:var(--char-active-bg);
    border-color:var(--ptr-left);
    color:var(--ptr-left);
    box-shadow:0 0 10px rgba(212,168,67,0.12);
    z-index:2;
  }
  .st-char-cell.active-r {
    background:var(--char-active-bg);
    border-color:var(--ptr-right);
    color:var(--ptr-right);
    box-shadow:0 0 10px rgba(192,57,43,0.12);
    z-index:2;
  }
  .st-char-cell.matched {
    background:var(--char-match-bg);
    border-color:var(--char-match-border);
    color:var(--char-match-text);
  }
  .st-char-cell.center {
    background:var(--char-mid-bg);
    border-color:var(--char-mid-border);
    color:var(--char-mid-text);
  }

  .st-ptr-cell {
    width:52px; text-align:center; padding:4px 0 0;
    font-family:'Cascadia Code','Fira Code',Consolas,monospace;
    font-size:0.52rem; font-weight:700;
  }
  .st-ptr-tag {
    display:inline-block;
    padding:1px 7px; border-radius:4px;
    transition:all 0.3s ease;
  }
  .st-ptr-tag.left { background:rgba(212,168,67,0.12); color:var(--ptr-left); border:1px solid rgba(212,168,67,0.25); animation:ptrBob 1.2s ease infinite; }
  .st-ptr-tag.right { background:rgba(192,57,43,0.12); color:var(--ptr-right); border:1px solid rgba(192,57,43,0.25); animation:ptrBob 1.2s ease 0.3s infinite; }
  .st-ptr-tag.done { background:var(--char-match-bg); color:var(--char-match-text); border:1px solid var(--char-match-border); }

  .st-log {
    padding:8px 14px; border-radius:8px;
    background:var(--bg-glass); border:1px solid var(--border-card);
    font-family:'Cascadia Code','Fira Code',Consolas,monospace;
    font-size:0.62rem; color:var(--text-2);
    text-align:center; min-height:28px;
    display:flex; align-items:center; justify-content:center;
    backdrop-filter:blur(8px); width:100%;
    transition:all 0.5s ease;
  }
  .st-log .hl { color:var(--accent-2); font-weight:700; }
  .st-log .ok { color:var(--good); font-weight:700; }
  .st-log .ac { color:var(--accent); font-weight:700; }

  /* Chips */
  .st-chips {
    display:flex; flex-wrap:wrap; gap:5px; justify-content:center;
    animation:fadeUp 0.7s ease 0.55s both;
  }
  .st-chip {
    display:flex; align-items:center; gap:4px;
    padding:3px 10px; border-radius:18px;
    background:var(--bg-glass); border:1px solid var(--border-card);
    font-family:'Cascadia Code','Fira Code',Consolas,monospace;
    font-size:0.56rem; font-weight:600;
    backdrop-filter:blur(8px);
    transition:background 0.5s ease, border-color 0.5s ease;
  }
  .st-chip .op { color:var(--text-3); text-transform:uppercase; letter-spacing:0.05em; }
  .st-chip .v { font-weight:700; }
  .st-chip .v.good { color:var(--good); }
  .st-chip .v.mid { color:var(--mid); }
  .st-chip .v.bad { color:var(--bad); }

  /* ─── INFO ─── */
  .st-info-strip { position:relative; z-index:1; padding:0 clamp(1.5rem,5vw,4rem); }
  .st-info-grid {
    max-width:980px; margin:-2rem auto 0;
    display:grid; grid-template-columns:repeat(auto-fit,minmax(210px,1fr)); gap:1rem;
  }
  .st-icard {
    background:var(--bg-card);
    backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px);
    border:1px solid var(--border-card); border-radius:14px;
    padding:1.2rem 1.3rem; transition:all 0.35s ease;
  }
  .st-icard:hover { border-color:var(--border-hover); box-shadow:var(--shadow-hover); transform:translateY(-2px); }
  .st-icard-icon { font-size:1.3rem; margin-bottom:0.5rem; }
  .st-icard-title { font-family:'Segoe UI',system-ui,sans-serif; font-size:0.8rem; font-weight:700; margin-bottom:0.2rem; }
  .st-icard-text { font-size:0.76rem; color:var(--text-2); line-height:1.55; }

  /* ─── SECTION ─── */
  .st-section { padding:5rem clamp(1.5rem,5vw,4rem); position:relative; z-index:1; }
  .st-section-inner { max-width:980px; margin:0 auto; }
  .st-eyebrow {
    font-family:'Segoe UI',system-ui,sans-serif;
    font-size:0.68rem; font-weight:700; text-transform:uppercase;
    letter-spacing:0.16em; color:var(--accent); margin-bottom:0.5rem;
  }
  .st-sec-title {
    font-family:'Segoe UI',system-ui,sans-serif;
    font-size:clamp(1.3rem,3.5vw,1.85rem);
    font-weight:800; letter-spacing:-0.03em;
  }
  .st-sec-sub { color:var(--text-2); font-size:0.9rem; margin-top:0.4rem; max-width:600px; }

  /* ─── TECH CARDS ─── */
  .st-tlist { display:flex; flex-direction:column; gap:0.9rem; margin-top:2.5rem; }
  .st-tc {
    background:var(--bg-card);
    border:1px solid var(--border-card); border-radius:14px;
    backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px);
    overflow:hidden;
    transition:background 0.5s ease, border-color 0.3s ease, box-shadow 0.3s ease;
  }
  .st-tc:hover,.st-tc.open { border-color:var(--border-hover); box-shadow:var(--shadow-hover); }
  .st-tc-hdr {
    display:flex; align-items:center; gap:14px;
    padding:1.15rem 1.4rem; cursor:pointer; user-select:none;
    transition:background 0.25s ease;
  }
  .st-tc-hdr:hover { background:var(--glow); }
  .st-tc-icon {
    width:42px; height:42px; border-radius:10px;
    display:grid; place-items:center; font-size:1.05rem; flex-shrink:0;
    transition:transform 0.35s cubic-bezier(0.34,1.56,0.64,1);
  }
  .st-tc:hover .st-tc-icon,.st-tc.open .st-tc-icon { transform:scale(1.08) rotate(-4deg); }
  .st-tc-mid { flex:1; min-width:0; }
  .st-tc-name { font-family:'Segoe UI',system-ui,sans-serif; font-size:0.98rem; font-weight:700; }
  .st-tc-desc { font-size:0.76rem; color:var(--text-2); margin-top:2px; line-height:1.5; }
  .st-tc-cnt {
    font-family:'Cascadia Code','Fira Code',Consolas,monospace;
    font-size:0.62rem; color:var(--text-3);
    padding:3px 9px; border-radius:20px; background:var(--bg-tag);
    flex-shrink:0; white-space:nowrap;
  }
  .st-chev {
    width:18px; height:18px; flex-shrink:0;
    transition:transform 0.4s cubic-bezier(0.34,1.56,0.64,1), color 0.3s ease;
    color:var(--text-3);
  }
  .st-tc.open .st-chev { transform:rotate(180deg); color:var(--accent); }
  .st-tc-body { max-height:0; overflow:hidden; transition:max-height 0.5s cubic-bezier(0.4,0,0.2,1); }
  .st-tc.open .st-tc-body { max-height:700px; }
  .st-tc-body-in {
    padding:0 1.4rem 1.3rem; opacity:0; transform:translateY(-8px);
    transition:opacity 0.35s ease 0.1s, transform 0.35s ease 0.1s;
  }
  .st-tc.open .st-tc-body-in { opacity:1; transform:translateY(0); }
  .st-div { height:1px; background:var(--border); margin-bottom:0.7rem; }
  .st-pl { display:flex; flex-direction:column; gap:3px; }
  .st-plink {
    display:flex; align-items:center; gap:10px;
    padding:8px 14px; border-radius:8px;
    background:var(--bg-problem);
    transition:all 0.25s ease; cursor:pointer;
    text-decoration:none; color:var(--text-1);
    position:relative; overflow:hidden;
  }
  .st-plink::before {
    content:''; position:absolute; left:0; top:0; bottom:0;
    width:3px; background:linear-gradient(180deg, var(--accent), var(--accent-2));
    opacity:0; transition:opacity 0.25s ease;
  }
  .st-plink:hover { background:var(--bg-problem-hover); transform:translateX(4px); }
  .st-plink:hover::before { opacity:1; }
  .st-pn {
    font-family:'Cascadia Code','Fira Code',Consolas,monospace;
    font-size:0.62rem; color:var(--text-3); font-weight:600;
    width:22px; text-align:center; flex-shrink:0;
  }
  .st-pname { font-family:'Segoe UI',system-ui,sans-serif; font-size:0.82rem; font-weight:600; flex:1; }
  .st-parr {
    color:var(--text-3); opacity:0; transform:translateX(-6px);
    transition:all 0.25s ease; font-size:0.76rem;
  }
  .st-plink:hover .st-parr { opacity:1; transform:translateX(0); color:var(--accent); }

  /* ─── FOOTER ─── */
  .st-footer {
    position:relative; z-index:1;
    padding:2.5rem clamp(1.5rem,5vw,4rem);
    text-align:center; border-top:1px solid var(--border);
    font-family:'Segoe UI',system-ui,sans-serif;
    font-size:0.74rem; color:var(--text-3);
    transition:border-color 0.5s ease;
  }
  .st-footer a { color:var(--accent); text-decoration:none; }

  @media(max-width:700px) {
    .st-hero { min-height:auto; padding-top:85px; padding-bottom:2rem; }
    .st-char-cell,.st-idx-cell,.st-ptr-cell { width:40px; }
    .st-char-cell { height:40px; font-size:0.88rem; }
    .st-info-grid { grid-template-columns:1fr 1fr; }
    .st-tc-desc { display:none; }
    .st-tc-hdr { padding:1rem 1.1rem; gap:10px; }
  }
`;

const Chev = () => (
  <svg
    className="st-chev"
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
export default function StringsPage() {
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

  // Palindrome step animation
  useEffect(() => {
    let step = 0;
    let pause = 0;
    const id = setInterval(() => {
      if (pause > 0) {
        pause--;
        return;
      }
      setStepIdx(step);
      if (PALIN_STEPS[step].phase === "done") {
        pause = 3;
        step = 0;
      } else step++;
    }, 1000);
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

  const cur = PALIN_STEPS[stepIdx];
  const isDone = cur.phase === "done";

  // Colorize log
  const logHtml = cur.log
    .replace(/✓/g, '<span class="ok">✓</span>')
    .replace(/Match!/g, '<span class="ok">Match!</span>')
    .replace(
      /palindrome verified!/g,
      '<span class="ok">palindrome verified!</span>',
    )
    .replace(/is a palindrome!/g, '<span class="ok">is a palindrome!</span>')
    .replace(/'([A-Z])'/g, "'<span class=\"hl\">$1</span>'")
    .replace(/\[(\d+)\]/g, '[<span class="ac">$1</span>]');

  return (
    <>
      <style>{css}</style>
      <div className="st-root" ref={rootRef}>
        <nav className="st-topbar">
          <div className="st-brand">
            <div className="st-logo">DS</div>
            <span className="st-ui">DSA Visualizer</span>
            <span className="st-sep">/</span>
            <span className="st-topic-lbl st-ui">Strings</span>
          </div>
          <div className="st-actions">
            <button
              className="st-back"
              onClick={() => (window.location.href = "index.html")}
            >
              ← Dashboard
            </button>
            <div
              className="st-toggle"
              onClick={toggleTheme}
              role="button"
              tabIndex={0}
              onKeyDown={(e) =>
                (e.key === "Enter" || e.key === " ") && toggleTheme()
              }
              aria-label="Toggle theme"
            >
              <div className={`st-knob${theme === "light" ? " on" : ""}`}>
                {theme === "dark" ? "🌙" : "☀️"}
              </div>
            </div>
          </div>
        </nav>

        <section className="st-hero">
          <div
            className="st-hero-bg"
            style={{
              background:
                theme === "dark"
                  ? "radial-gradient(ellipse 65% 50% at 20% 18%, #1a140e 0%, transparent 70%), radial-gradient(ellipse 55% 55% at 82% 74%, #0e0a10 0%, transparent 60%), #0c0a08"
                  : "radial-gradient(ellipse 65% 50% at 20% 18%, #f0e8d8 0%, transparent 70%), radial-gradient(ellipse 55% 55% at 82% 74%, #f4eef0 0%, transparent 60%), #faf6f0",
            }}
          />
          <div
            className="st-orb"
            style={{
              width: 440,
              height: 440,
              background: "var(--accent)",
              opacity: 0.04,
              top: "-10%",
              right: "-5%",
              animation: "orbDrift 18s ease-in-out infinite",
            }}
          />
          <div
            className="st-orb"
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

          <div className="st-hero-inner">
            <div className="st-hero-top">
              <div className="st-hero-text">
                <div className="st-crumb">
                  <span>DSA</span>
                  <span className="s">›</span>
                  <span>Data Structures</span>
                  <span className="s">›</span>
                  <span className="c">Strings</span>
                </div>
                <h1 className="st-h1 st-ui">
                  <span className="grad">Strings</span>
                  <br />& Text
                  <br />
                  <span className="thin">Character by Character</span>
                </h1>
                <p className="st-desc">
                  Immutable sequences of characters — the most ubiquitous data
                  type in programming. Master sliding windows for substring
                  search, two pointers for palindromes, DP tables for edit
                  distance, and KMP/Rabin-Karp for O(n+m) pattern matching.
                  Strings bridge data structures and algorithms like nothing
                  else.
                </p>
                <Link to="/strings/visualizer" className="st-cta">
                  Open Visualizer <span className="ar">→</span>
                </Link>
              </div>

              {/* Palindrome animation */}
              <div className="st-viz-wrap">
                <div className="st-viz-label st-mono">
                  Two-Pointer Palindrome Check
                </div>

                <div className="st-quote-box">
                  <div className="st-quote-title">
                    <span>"{PALINDROME}"</span>
                    <span className="st-algo-tag">Two Pointers</span>
                  </div>

                  {/* Index row */}
                  <div className="st-idx-row">
                    {CHARS.map((_, i) => (
                      <div className="st-idx-cell" key={i}>
                        {i}
                      </div>
                    ))}
                  </div>
                  {/* Char cells */}
                  <div className="st-char-row">
                    {CHARS.map((ch, i) => {
                      let cls = "st-char-cell";
                      if (isDone || cur.matched[i]) {
                        if (
                          i === Math.floor(CHARS.length / 2) &&
                          CHARS.length % 2 === 1 &&
                          (cur.phase === "center" || isDone)
                        ) {
                          cls += " center";
                        } else {
                          cls += " matched";
                        }
                      }
                      if (!isDone && cur.phase !== "center") {
                        if (i === cur.l) cls += " active-l";
                        if (i === cur.r) cls += " active-r";
                      }
                      return (
                        <div className={cls} key={i}>
                          {ch}
                        </div>
                      );
                    })}
                  </div>
                  {/* Pointer row */}
                  <div className="st-ptr-row">
                    {CHARS.map((_, i) => {
                      const tags = [];
                      if (!isDone && cur.phase !== "center") {
                        if (i === cur.l) tags.push("left");
                        if (i === cur.r) tags.push("right");
                      }
                      if (isDone && i === 0) tags.push("done");
                      return (
                        <div className="st-ptr-cell" key={i}>
                          {tags.map((t) => (
                            <span key={t} className={`st-ptr-tag ${t}`}>
                              {t === "left" ? "L" : t === "right" ? "R" : "✓"}
                            </span>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Log */}
                <div
                  className="st-log"
                  dangerouslySetInnerHTML={{ __html: logHtml }}
                />
              </div>
            </div>

            {/* Chips */}
            <div className="st-chips">
              {COMPLEXITIES.map((c, i) => (
                <div className="st-chip" key={i}>
                  <span className="op">{c.op}</span>
                  <span className={`v ${c.tier}`}>{c.val}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Info cards */}
        <div className="st-info-strip">
          <div className="st-info-grid">
            {INFO_CARDS.map((c, i) => (
              <div
                className="st-icard"
                key={i}
                style={{
                  animation: `fadeUp 0.6s ease ${0.5 + i * 0.08}s both`,
                }}
              >
                <div className="st-icard-icon">{c.icon}</div>
                <div className="st-icard-title st-ui">{c.title}</div>
                <div className="st-icard-text">{c.text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Techniques */}
        <section className="st-section">
          <div className="st-section-inner">
            <div
              style={{
                marginBottom: "0.5rem",
                animation: "fadeUp 0.6s ease both",
              }}
            >
              <div className="st-eyebrow">Explore · {TOTAL} Problems</div>
              <h2 className="st-sec-title st-ui">
                Strings Techniques & Patterns
              </h2>
              <p className="st-sec-sub">
                Master these six fundamental string paradigms — from basic
                manipulation to advanced pattern matching — the essential
                toolkit for text-processing interview problems.
              </p>
            </div>

            <div className="st-tlist">
              {TECHNIQUES.map((tech, ti) => {
                const isOpen = openTech === tech.id;
                return (
                  <div
                    className={`st-tc${isOpen ? " open" : ""}`}
                    key={tech.id}
                    style={{
                      animation: `fadeUp 0.6s ease ${0.05 + ti * 0.06}s both`,
                    }}
                  >
                    <div
                      className="st-tc-hdr"
                      onClick={() => toggleTech(tech.id)}
                    >
                      <div
                        className="st-tc-icon"
                        style={{
                          background: `color-mix(in srgb, ${tech.accent} 10%, transparent)`,
                        }}
                      >
                        {tech.icon}
                      </div>
                      <div className="st-tc-mid">
                        <div className="st-tc-name st-ui">{tech.title}</div>
                        <div className="st-tc-desc">{tech.desc}</div>
                      </div>
                      <div className="st-tc-cnt st-mono">
                        {tech.problems.length}
                      </div>
                      <Chev />
                    </div>
                    <div className="st-tc-body">
                      <div className="st-tc-body-in">
                        <div className="st-div" />
                        <div className="st-pl">
                          {tech.problems.map((p, pi) => (
                            <a
                              key={pi}
                              href={p.href || `${p.slug}-visualizer.html`}
                              className="st-plink"
                            >
                              <span className="st-pn st-mono">
                                {String(pi + 1).padStart(2, "0")}
                              </span>
                              <span className="st-pname st-ui">{p.name}</span>
                              <span className="st-parr">→</span>
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

        <footer className="st-footer">
          DSA Visualizer Platform — Built for learners.{" "}
          <a href="index.html">Back to Dashboard</a>
        </footer>
      </div>
    </>
  );
}
