import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ═══════════════════════════════════════════════════════════════════════════
// Sliding Window Visualizer — Multi-Mode, Step-by-Step, Interview-Demo Ready
// Self-contained React component. No external dependencies.
// Aesthetic: Crystalline ocean-teal with warm peach accents.
// ═══════════════════════════════════════════════════════════════════════════

// ─── Problem Modes ──────────────────────────────────────────────────────────

const MODES = {
  maxSum: {
    name: "Max Sum (Fixed)",
    subtitle: "Maximum sum subarray of size k",
    icon: "∑",
    accent: "#0891B2",
    gradient: "linear-gradient(135deg, #06B6D4, #0891B2)",
    lightBg: "#ECFEFF",
    time: "O(n)",
    space: "O(1)",
    description:
      "Slide a fixed-size window of k elements across the array. At each position, compute the sum by adding the new right element and removing the old left element. Track the maximum.",
  },
  minSubarray: {
    name: "Min Length ≥ Target",
    subtitle: "Shortest subarray with sum ≥ target",
    icon: "≥",
    accent: "#D97706",
    gradient: "linear-gradient(135deg, #F59E0B, #D97706)",
    lightBg: "#FFFBEB",
    time: "O(n)",
    space: "O(1)",
    description:
      "Expand right to grow the sum. Once sum ≥ target, shrink from left to find the minimum valid window. Each pointer moves at most n times → O(n) amortized.",
  },
  longestUnique: {
    name: "Longest Unique",
    subtitle: "Longest subarray with all distinct elements",
    icon: "∞",
    accent: "#7C3AED",
    gradient: "linear-gradient(135deg, #A78BFA, #7C3AED)",
    lightBg: "#F5F3FF",
    time: "O(n)",
    space: "O(k)",
    description:
      "Expand right, adding elements to a set. If a duplicate enters, shrink from left until the duplicate is removed. Track the maximum window size.",
  },
};

const DEFAULT_ARRAY = "2, 1, 5, 1, 3, 2";
const DEFAULT_K = "3";
const DEFAULT_TARGET = "7";

// ─── Cell States & Colors ───────────────────────────────────────────────────

const CELL_STATES = {
  idle: { bg: "#F1F5F9", border: "#CBD5E1", text: "#64748B" },
  inWindow: { bg: "#CFFAFE", border: "#06B6D4", text: "#0E7490" },
  entering: { bg: "#FEF3C7", border: "#F59E0B", text: "#92400E" },
  leaving: { bg: "#FFE4E6", border: "#FB7185", text: "#BE123C" },
  best: { bg: "#D1FAE5", border: "#10B981", text: "#065F46" },
  pointer: { bg: "#E0E7FF", border: "#6366F1", text: "#3730A3" },
};

// ─── Step Generators ────────────────────────────────────────────────────────

function generateMaxSumSteps(arr, k) {
  const n = arr.length;
  if (k > n)
    return [
      {
        array: arr,
        left: 0,
        right: 0,
        windowState: {},
        highlights: {},
        title: "Error",
        detail: `k=${k} exceeds array length ${n}.`,
        bestRange: null,
      },
    ];
  const steps = [];
  let sum = 0;

  steps.push({
    array: [...arr],
    left: 0,
    right: -1,
    windowState: { sum: 0 },
    highlights: {},
    title: "Initialize",
    detail: `We need to find the maximum sum of any contiguous subarray of size ${k}. Start by computing the sum of the first window.`,
    bestRange: null,
  });

  // Build first window
  for (let i = 0; i < k; i++) {
    sum += arr[i];
    const hl = {};
    for (let j = 0; j <= i; j++) hl[j] = "inWindow";
    hl[i] = "entering";
    steps.push({
      array: [...arr],
      left: 0,
      right: i,
      windowState: { sum },
      highlights: hl,
      title: `Build Window: Add arr[${i}]=${arr[i]}`,
      detail: `Adding ${arr[i]} to the initial window. Window sum = ${sum}. ${i < k - 1 ? `Need ${k - 1 - i} more elements.` : "First window complete!"}`,
      bestRange: null,
    });
  }

  let maxSum = sum;
  let bestStart = 0;

  steps.push({
    array: [...arr],
    left: 0,
    right: k - 1,
    windowState: { sum, maxSum },
    highlights: Object.fromEntries(
      Array.from({ length: k }, (_, i) => [i, "best"]),
    ),
    title: `First Window Sum = ${sum}`,
    detail: `Initial window [0..${k - 1}] has sum ${sum}. This is our best so far. Now slide the window right.`,
    bestRange: [0, k - 1],
  });

  // Slide
  for (let i = k; i < n; i++) {
    const outgoing = arr[i - k];
    const incoming = arr[i];

    // Show comparison
    const hl1 = {};
    for (let j = i - k; j <= i; j++) {
      if (j === i - k) hl1[j] = "leaving";
      else if (j === i) hl1[j] = "entering";
      else hl1[j] = "inWindow";
    }
    steps.push({
      array: [...arr],
      left: i - k + 1,
      right: i,
      windowState: { sum, maxSum, removing: outgoing, adding: incoming },
      highlights: hl1,
      title: `Slide: Remove ${outgoing}, Add ${incoming}`,
      detail: `Window slides right. Remove arr[${i - k}]=${outgoing} from the left. Add arr[${i}]=${incoming} on the right. New sum = ${sum} - ${outgoing} + ${incoming} = ${sum - outgoing + incoming}.`,
      bestRange: [bestStart, bestStart + k - 1],
    });

    sum = sum - outgoing + incoming;

    const hl2 = {};
    for (let j = i - k + 1; j <= i; j++) hl2[j] = "inWindow";

    if (sum > maxSum) {
      maxSum = sum;
      bestStart = i - k + 1;
      for (let j = i - k + 1; j <= i; j++) hl2[j] = "best";
      steps.push({
        array: [...arr],
        left: i - k + 1,
        right: i,
        windowState: { sum, maxSum },
        highlights: hl2,
        title: `New Maximum! Sum = ${sum}`,
        detail: `Window [${i - k + 1}..${i}] has sum ${sum} > previous best ${maxSum - (sum - maxSum)}. Updated max to ${maxSum}.`,
        bestRange: [bestStart, bestStart + k - 1],
      });
    } else {
      steps.push({
        array: [...arr],
        left: i - k + 1,
        right: i,
        windowState: { sum, maxSum },
        highlights: hl2,
        title: `Sum = ${sum} (max still ${maxSum})`,
        detail: `Window [${i - k + 1}..${i}] has sum ${sum}. Not better than our best of ${maxSum}. Continue sliding.`,
        bestRange: [bestStart, bestStart + k - 1],
      });
    }
  }

  const finalHl = {};
  for (let j = bestStart; j < bestStart + k; j++) finalHl[j] = "best";
  steps.push({
    array: [...arr],
    left: bestStart,
    right: bestStart + k - 1,
    windowState: { sum: maxSum, maxSum },
    highlights: finalHl,
    title: `Complete! Max Sum = ${maxSum}`,
    detail: `The maximum sum subarray of size ${k} is [${arr.slice(bestStart, bestStart + k).join(", ")}] at indices [${bestStart}..${bestStart + k - 1}] with sum ${maxSum}.`,
    bestRange: [bestStart, bestStart + k - 1],
  });

  return steps;
}

function generateMinSubarraySteps(arr, target) {
  const n = arr.length;
  const steps = [];
  let left = 0,
    sum = 0,
    minLen = Infinity,
    bestL = -1,
    bestR = -1;

  steps.push({
    array: [...arr],
    left: 0,
    right: -1,
    windowState: { sum: 0, target, minLen: "∞" },
    highlights: {},
    title: "Initialize",
    detail: `Find the shortest subarray with sum ≥ ${target}. Use a variable window: expand right to grow sum, shrink left when sum ≥ target.`,
    bestRange: null,
  });

  for (let right = 0; right < n; right++) {
    sum += arr[right];

    const hl = {};
    for (let j = left; j <= right; j++) hl[j] = "inWindow";
    hl[right] = "entering";
    steps.push({
      array: [...arr],
      left,
      right,
      windowState: { sum, target, minLen: minLen === Infinity ? "∞" : minLen },
      highlights: hl,
      title: `Expand: Add arr[${right}]=${arr[right]}`,
      detail: `Added ${arr[right]}. Window [${left}..${right}], sum = ${sum}. ${sum >= target ? `Sum ≥ ${target} — try shrinking!` : `Sum < ${target} — keep expanding.`}`,
      bestRange: bestL >= 0 ? [bestL, bestR] : null,
    });

    while (sum >= target) {
      const windowLen = right - left + 1;
      if (windowLen < minLen) {
        minLen = windowLen;
        bestL = left;
        bestR = right;
      }

      const hlS = {};
      for (let j = left; j <= right; j++)
        hlS[j] = windowLen <= minLen ? "best" : "inWindow";
      hlS[left] = "leaving";
      steps.push({
        array: [...arr],
        left,
        right,
        windowState: { sum, target, minLen, windowLen },
        highlights: hlS,
        title: `Shrink: sum=${sum} ≥ ${target}`,
        detail: `Window [${left}..${right}] has length ${windowLen}, sum ${sum} ≥ ${target}. ${windowLen <= minLen ? `New minimum length = ${minLen}!` : `Length ${windowLen} ≥ best ${minLen}.`} Remove arr[${left}]=${arr[left]} from left.`,
        bestRange: [bestL, bestR],
      });

      sum -= arr[left];
      left++;
    }
  }

  if (bestL >= 0) {
    const finalHl = {};
    for (let j = bestL; j <= bestR; j++) finalHl[j] = "best";
    steps.push({
      array: [...arr],
      left: bestL,
      right: bestR,
      windowState: { minLen, target },
      highlights: finalHl,
      title: `Complete! Min Length = ${minLen}`,
      detail: `Shortest subarray with sum ≥ ${target} is [${arr.slice(bestL, bestR + 1).join(", ")}] at indices [${bestL}..${bestR}] with length ${minLen}.`,
      bestRange: [bestL, bestR],
    });
  } else {
    steps.push({
      array: [...arr],
      left: 0,
      right: n - 1,
      windowState: { minLen: "∞", target },
      highlights: {},
      title: "No Valid Subarray",
      detail: `No subarray has sum ≥ ${target}. Return 0.`,
      bestRange: null,
    });
  }

  return steps;
}

function generateLongestUniqueSteps(arr) {
  const n = arr.length;
  const steps = [];
  let left = 0,
    maxLen = 0,
    bestL = 0,
    bestR = -1;
  const seen = new Map();

  steps.push({
    array: [...arr],
    left: 0,
    right: -1,
    windowState: { maxLen: 0, distinct: 0 },
    highlights: {},
    title: "Initialize",
    detail: `Find the longest subarray where all elements are unique. Expand right, and if a duplicate enters, shrink left past the previous occurrence.`,
    bestRange: null,
  });

  for (let right = 0; right < n; right++) {
    const val = arr[right];

    if (seen.has(val) && seen.get(val) >= left) {
      const prevIdx = seen.get(val);
      const hlD = {};
      for (let j = left; j <= right; j++) hlD[j] = "inWindow";
      hlD[right] = "entering";
      hlD[prevIdx] = "leaving";
      steps.push({
        array: [...arr],
        left,
        right,
        windowState: { maxLen, duplicate: val, prevIndex: prevIdx },
        highlights: hlD,
        title: `Duplicate! ${val} at index ${prevIdx}`,
        detail: `arr[${right}]=${val} already exists at index ${prevIdx} in our window. Must shrink left past index ${prevIdx} to remove the duplicate.`,
        bestRange: bestR >= 0 ? [bestL, bestR] : null,
      });

      left = prevIdx + 1;
    }

    seen.set(val, right);
    const windowLen = right - left + 1;

    const hl = {};
    for (let j = left; j <= right; j++) hl[j] = "inWindow";
    hl[right] = "entering";

    if (windowLen > maxLen) {
      maxLen = windowLen;
      bestL = left;
      bestR = right;
      for (let j = left; j <= right; j++) hl[j] = "best";
      steps.push({
        array: [...arr],
        left,
        right,
        windowState: { maxLen, windowLen },
        highlights: hl,
        title: `New Best! Length = ${maxLen}`,
        detail: `Window [${left}..${right}] = [${arr.slice(left, right + 1).join(", ")}] has ${windowLen} unique elements. New maximum!`,
        bestRange: [bestL, bestR],
      });
    } else {
      steps.push({
        array: [...arr],
        left,
        right,
        windowState: { maxLen, windowLen },
        highlights: hl,
        title: `Window Length = ${windowLen}`,
        detail: `Window [${left}..${right}] = [${arr.slice(left, right + 1).join(", ")}] has ${windowLen} unique elements. Best remains ${maxLen}.`,
        bestRange: bestR >= 0 ? [bestL, bestR] : null,
      });
    }
  }

  const finalHl = {};
  for (let j = bestL; j <= bestR; j++) finalHl[j] = "best";
  steps.push({
    array: [...arr],
    left: bestL,
    right: bestR,
    windowState: { maxLen },
    highlights: finalHl,
    title: `Complete! Longest = ${maxLen}`,
    detail: `Longest subarray with all unique elements is [${arr.slice(bestL, bestR + 1).join(", ")}] at indices [${bestL}..${bestR}] with length ${maxLen}.`,
    bestRange: [bestL, bestR],
  });

  return steps;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function parseArray(str) {
  try {
    const nums = str.split(",").map((s) => {
      const n = parseInt(s.trim(), 10);
      if (isNaN(n)) throw 0;
      return n;
    });
    return nums.length >= 2 ? nums.slice(0, 18) : null;
  } catch {
    return null;
  }
}

// ─── Array Cell Component ───────────────────────────────────────────────────

function Cell({ value, index, state, isLeft, isRight, total }) {
  const s = CELL_STATES[state] || CELL_STATES.idle;
  const size = total > 12 ? 44 : total > 8 ? 52 : 58;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
      }}
    >
      {/* Pointer labels */}
      <div
        style={{
          height: 20,
          display: "flex",
          gap: 4,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isLeft && (
          <span
            style={{
              fontSize: 9,
              fontWeight: 800,
              color: "#0891B2",
              background: "#ECFEFF",
              padding: "1px 6px",
              borderRadius: 4,
              letterSpacing: 0.5,
              fontFamily: "'IBM Plex Mono', monospace",
              animation: "fadeDown 0.3s ease",
            }}
          >
            L
          </span>
        )}
        {isRight && (
          <span
            style={{
              fontSize: 9,
              fontWeight: 800,
              color: "#D97706",
              background: "#FFFBEB",
              padding: "1px 6px",
              borderRadius: 4,
              letterSpacing: 0.5,
              fontFamily: "'IBM Plex Mono', monospace",
              animation: "fadeDown 0.3s ease",
            }}
          >
            R
          </span>
        )}
      </div>

      {/* Cell box */}
      <div
        style={{
          width: size,
          height: size,
          borderRadius: 10,
          background: s.bg,
          border: `2.5px solid ${s.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.35s cubic-bezier(0.4,0,0.2,1)",
          boxShadow:
            state === "best"
              ? "0 0 0 3px #10B98130, 0 4px 12px #10B98120"
              : state === "entering"
                ? "0 0 0 3px #F59E0B30, 0 4px 12px #F59E0B20"
                : state === "leaving"
                  ? "0 0 0 3px #FB718530, 0 4px 12px #FB718520"
                  : state === "inWindow"
                    ? "0 2px 8px rgba(6,182,212,0.12)"
                    : "0 1px 3px rgba(0,0,0,0.04)",
          transform:
            state === "entering"
              ? "scale(1.08)"
              : state === "leaving"
                ? "scale(0.94)"
                : "scale(1)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {(state === "entering" || state === "leaving" || state === "best") && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 60%)",
              borderRadius: 8,
            }}
          />
        )}
        <span
          style={{
            fontSize: total > 12 ? 14 : 17,
            fontWeight: 800,
            color: s.text,
            fontFamily: "'IBM Plex Mono', monospace",
            position: "relative",
            zIndex: 1,
          }}
        >
          {value}
        </span>
      </div>

      {/* Index */}
      <span
        style={{
          fontSize: 10,
          color: "#94A3B8",
          fontFamily: "'IBM Plex Mono', monospace",
          fontWeight: 500,
        }}
      >
        {index}
      </span>
    </div>
  );
}

// ─── Window Overlay (the sliding frame) ─────────────────────────────────────

function WindowOverlay({ left, right, total, accent, cellSize }) {
  if (left < 0 || right < 0 || right < left) return null;
  const gap = total > 12 ? 6 : total > 8 ? 8 : 10;
  const unit = cellSize + gap;
  const x = left * unit;
  const w = (right - left + 1) * unit - gap + 4;

  return (
    <div
      style={{
        position: "absolute",
        left: x - 2,
        top: -4,
        width: w,
        height: cellSize + 8,
        border: `2.5px solid ${accent}`,
        borderRadius: 14,
        background: `${accent}08`,
        transition: "all 0.4s cubic-bezier(0.4,0,0.2,1)",
        pointerEvents: "none",
        zIndex: 5,
        boxShadow: `0 0 20px ${accent}15`,
      }}
    >
      {/* Corner accents */}
      <div
        style={{
          position: "absolute",
          top: -2,
          left: -2,
          width: 8,
          height: 8,
          borderTop: `3px solid ${accent}`,
          borderLeft: `3px solid ${accent}`,
          borderRadius: "6px 0 0 0",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: -2,
          right: -2,
          width: 8,
          height: 8,
          borderTop: `3px solid ${accent}`,
          borderRight: `3px solid ${accent}`,
          borderRadius: "0 6px 0 0",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -2,
          left: -2,
          width: 8,
          height: 8,
          borderBottom: `3px solid ${accent}`,
          borderLeft: `3px solid ${accent}`,
          borderRadius: "0 0 0 6px",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -2,
          right: -2,
          width: 8,
          height: 8,
          borderBottom: `3px solid ${accent}`,
          borderRight: `3px solid ${accent}`,
          borderRadius: "0 0 6px 0",
        }}
      />
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function SlidingWindowVisualizer() {
  const [mode, setMode] = useState("maxSum");
  const [input, setInput] = useState(DEFAULT_ARRAY);
  const [kVal, setKVal] = useState(DEFAULT_K);
  const [targetVal, setTargetVal] = useState(DEFAULT_TARGET);
  const [steps, setSteps] = useState([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);
  const [error, setError] = useState("");
  const timerRef = useRef(null);

  const m = MODES[mode];
  const step = steps[stepIdx] || null;

  // Auto-play
  useEffect(() => {
    if (isPlaying && stepIdx < steps.length - 1) {
      timerRef.current = setTimeout(() => setStepIdx((s) => s + 1), speed);
      return () => clearTimeout(timerRef.current);
    } else if (isPlaying) setIsPlaying(false);
  }, [isPlaying, stepIdx, steps.length, speed]);

  const handleStart = useCallback(() => {
    const arr = parseArray(input);
    if (!arr) {
      setError("Enter 2–18 comma-separated integers");
      return;
    }
    setError("");
    let newSteps;
    if (mode === "maxSum") {
      const k = parseInt(kVal, 10);
      if (isNaN(k) || k < 1 || k > arr.length) {
        setError(`k must be between 1 and ${arr.length}`);
        return;
      }
      newSteps = generateMaxSumSteps(arr, k);
    } else if (mode === "minSubarray") {
      const t = parseInt(targetVal, 10);
      if (isNaN(t) || t < 1) {
        setError("Target must be a positive integer");
        return;
      }
      newSteps = generateMinSubarraySteps(arr, t);
    } else {
      newSteps = generateLongestUniqueSteps(arr);
    }
    setSteps(newSteps);
    setStepIdx(0);
    setIsPlaying(false);
  }, [input, mode, kVal, targetVal]);

  const handleReset = () => {
    setSteps([]);
    setStepIdx(0);
    setIsPlaying(false);
    clearTimeout(timerRef.current);
  };
  const handlePlay = () => {
    if (stepIdx >= steps.length - 1) setStepIdx(0);
    setIsPlaying(true);
  };

  const getCellState = (idx) => {
    if (!step) return "idle";
    return step.highlights[idx] || "idle";
  };

  const cellSize = useMemo(() => {
    if (!step) return 58;
    const t = step.array.length;
    return t > 12 ? 44 : t > 8 ? 52 : 58;
  }, [step]);

  const cellGap = useMemo(() => {
    if (!step) return 10;
    const t = step.array.length;
    return t > 12 ? 6 : t > 8 ? 8 : 10;
  }, [step]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(155deg, #F0FDFA 0%, #FFFFFF 30%, #FFF7ED 60%, #FEFEFE 100%)",
        fontFamily: "'Libre Franklin', 'Segoe UI', system-ui, sans-serif",
        padding: "22px 14px 48px",
        boxSizing: "border-box",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=Libre+Franklin:wght@300;400;500;600;700;800;900&family=Libre+Baskerville:wght@400;700&display=swap');
        @keyframes fadeDown { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideReveal { from { opacity: 0; transform: translateX(-12px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes gentlePulse { 0%,100% { opacity: 1; } 50% { opacity: 0.7; } }
        * { box-sizing: border-box; }
        input:focus { outline: 2px solid #0891B2; outline-offset: 1px; }
        button { cursor: pointer; border: none; font-family: inherit; }
        button:active { transform: scale(0.97) !important; }
      `}</style>

      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        {/* ═══ Header ═══════════════════════════════════════════════ */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 14,
            marginBottom: 22,
          }}
        >
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 13,
              background: m.gradient,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 6px 20px ${m.accent}30`,
              fontSize: 22,
              color: "#fff",
              fontWeight: 700,
              transition: "all 0.4s",
              fontFamily: "'IBM Plex Mono', monospace",
            }}
          >
            {m.icon}
          </div>
          <div>
            <h1
              style={{
                fontFamily: "'Libre Baskerville', serif",
                fontSize: 28,
                fontWeight: 700,
                margin: 0,
                background: "linear-gradient(135deg, #134E4A, #0F766E)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.3px",
              }}
            >
              Sliding Window
            </h1>
            <p
              style={{
                fontSize: 13,
                color: "#94A3B8",
                margin: 0,
                fontWeight: 500,
              }}
            >
              Interactive step-by-step visualizer
            </p>
          </div>
        </div>

        {/* ═══ Mode Selector ════════════════════════════════════════ */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 8,
            marginBottom: 16,
          }}
        >
          {Object.entries(MODES).map(([key, md]) => {
            const active = mode === key;
            return (
              <button
                key={key}
                onClick={() => {
                  setMode(key);
                  if (steps.length) handleReset();
                }}
                style={{
                  padding: "11px 14px",
                  borderRadius: 12,
                  textAlign: "left",
                  background: active ? md.gradient : "#fff",
                  color: active ? "#fff" : "#64748B",
                  border: active ? "none" : "1.5px solid #E2E8F0",
                  boxShadow: active
                    ? `0 5px 18px ${md.accent}30`
                    : "0 1px 3px rgba(0,0,0,0.04)",
                  transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
                  transform: active ? "translateY(-1px)" : "none",
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>
                  {md.name}
                </div>
                <div style={{ fontSize: 10, opacity: 0.8, fontWeight: 500 }}>
                  {md.subtitle}
                </div>
              </button>
            );
          })}
        </div>

        {/* ═══ Input Panel ══════════════════════════════════════════ */}
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: "18px 22px",
            boxShadow:
              "0 1px 3px rgba(0,0,0,0.03), 0 6px 24px rgba(0,0,0,0.025)",
            border: "1px solid #F1F5F9",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              alignItems: "flex-end",
            }}
          >
            <div style={{ flex: 2, minWidth: 180 }}>
              <label
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#94A3B8",
                  textTransform: "uppercase",
                  letterSpacing: 1.2,
                  display: "block",
                  marginBottom: 5,
                }}
              >
                Array
              </label>
              <input
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setError("");
                }}
                placeholder="2, 1, 5, 1, 3, 2"
                onKeyDown={(e) => e.key === "Enter" && handleStart()}
                style={{
                  width: "100%",
                  padding: "9px 13px",
                  borderRadius: 10,
                  border: error ? "2px solid #EF4444" : "2px solid #E2E8F0",
                  fontSize: 14,
                  fontFamily: "'IBM Plex Mono', monospace",
                  background: "#F8FAFC",
                  color: "#334155",
                }}
              />
            </div>

            {mode === "maxSum" && (
              <div style={{ minWidth: 70 }}>
                <label
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#94A3B8",
                    textTransform: "uppercase",
                    letterSpacing: 1.2,
                    display: "block",
                    marginBottom: 5,
                  }}
                >
                  k (size)
                </label>
                <input
                  value={kVal}
                  onChange={(e) => setKVal(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 13px",
                    borderRadius: 10,
                    border: "2px solid #E2E8F0",
                    fontSize: 14,
                    fontFamily: "'IBM Plex Mono', monospace",
                    background: "#F8FAFC",
                    color: "#334155",
                  }}
                />
              </div>
            )}

            {mode === "minSubarray" && (
              <div style={{ minWidth: 80 }}>
                <label
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#94A3B8",
                    textTransform: "uppercase",
                    letterSpacing: 1.2,
                    display: "block",
                    marginBottom: 5,
                  }}
                >
                  Target
                </label>
                <input
                  value={targetVal}
                  onChange={(e) => setTargetVal(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 13px",
                    borderRadius: 10,
                    border: "2px solid #E2E8F0",
                    fontSize: 14,
                    fontFamily: "'IBM Plex Mono', monospace",
                    background: "#F8FAFC",
                    color: "#334155",
                  }}
                />
              </div>
            )}

            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={handleStart}
                style={{
                  padding: "9px 20px",
                  borderRadius: 10,
                  background: m.gradient,
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 13,
                  boxShadow: `0 4px 14px ${m.accent}30`,
                }}
              >
                ▶ Visualize
              </button>
              {steps.length > 0 && (
                <button
                  onClick={handleReset}
                  style={{
                    padding: "9px 14px",
                    borderRadius: 10,
                    background: "#FEF2F2",
                    color: "#EF4444",
                    fontWeight: 600,
                    fontSize: 13,
                    border: "1.5px solid #FECACA",
                  }}
                >
                  ↺ Reset
                </button>
              )}
            </div>
          </div>
          {error && (
            <p
              style={{
                color: "#EF4444",
                fontSize: 12,
                margin: "6px 0 0",
                fontWeight: 600,
              }}
            >
              {error}
            </p>
          )}

          {/* Presets */}
          <div
            style={{
              display: "flex",
              gap: 6,
              marginTop: 10,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 10, color: "#94A3B8", fontWeight: 700 }}>
              TRY:
            </span>
            {(mode === "maxSum"
              ? [
                  { label: "Classic", arr: "2, 1, 5, 1, 3, 2", k: "3" },
                  { label: "Monotone", arr: "1, 2, 3, 4, 5, 6", k: "4" },
                  { label: "Spiky", arr: "1, 9, 1, 9, 1, 9, 1", k: "2" },
                ]
              : mode === "minSubarray"
                ? [
                    { label: "Classic", arr: "2, 3, 1, 2, 4, 3", t: "7" },
                    { label: "Large Target", arr: "1, 1, 1, 1, 1, 8", t: "8" },
                    { label: "All Big", arr: "5, 4, 6, 3, 7, 2", t: "10" },
                  ]
                : [
                    { label: "Classic", arr: "2, 1, 5, 1, 3, 2" },
                    { label: "All Unique", arr: "4, 2, 7, 1, 9, 3" },
                    { label: "Lots of Dupes", arr: "1, 2, 1, 3, 2, 3, 1, 4" },
                  ]
            ).map((p, i) => (
              <button
                key={i}
                onClick={() => {
                  setInput(p.arr);
                  if (p.k) setKVal(p.k);
                  if (p.t) setTargetVal(p.t);
                  setError("");
                }}
                style={{
                  padding: "3px 10px",
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 600,
                  background: input === p.arr ? m.lightBg : "#F8FAFC",
                  color: input === p.arr ? m.accent : "#94A3B8",
                  border:
                    input === p.arr
                      ? `1px solid ${m.accent}30`
                      : "1px solid transparent",
                  transition: "all 0.2s",
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* ═══ Visualization ════════════════════════════════════════ */}
        {steps.length > 0 && step && (
          <div style={{ animation: "fadeUp 0.4s ease" }}>
            {/* ── Playback Controls ── */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 12,
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={() => setStepIdx(0)}
                disabled={stepIdx === 0}
                style={{
                  padding: "6px 10px",
                  borderRadius: 8,
                  background: stepIdx === 0 ? "#F1F5F9" : "#fff",
                  color: stepIdx === 0 ? "#CBD5E1" : "#64748B",
                  fontWeight: 700,
                  fontSize: 14,
                  border: "1.5px solid #E2E8F0",
                }}
              >
                ⟨⟨
              </button>
              <button
                onClick={() => setStepIdx((s) => Math.max(0, s - 1))}
                disabled={stepIdx === 0}
                style={{
                  padding: "6px 12px",
                  borderRadius: 8,
                  background: stepIdx === 0 ? "#F1F5F9" : "#fff",
                  color: stepIdx === 0 ? "#CBD5E1" : "#64748B",
                  fontWeight: 700,
                  fontSize: 16,
                  border: "1.5px solid #E2E8F0",
                }}
              >
                ‹
              </button>
              <button
                onClick={isPlaying ? () => setIsPlaying(false) : handlePlay}
                style={{
                  padding: "6px 20px",
                  borderRadius: 8,
                  background: isPlaying
                    ? "linear-gradient(135deg, #FB7185, #E11D48)"
                    : m.gradient,
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 13,
                  boxShadow: isPlaying
                    ? "0 3px 10px #E11D4830"
                    : `0 3px 10px ${m.accent}30`,
                }}
              >
                {isPlaying ? "⏸ Pause" : "▶ Play"}
              </button>
              <button
                onClick={() =>
                  setStepIdx((s) => Math.min(steps.length - 1, s + 1))
                }
                disabled={stepIdx >= steps.length - 1}
                style={{
                  padding: "6px 12px",
                  borderRadius: 8,
                  background: stepIdx >= steps.length - 1 ? "#F1F5F9" : "#fff",
                  color: stepIdx >= steps.length - 1 ? "#CBD5E1" : "#64748B",
                  fontWeight: 700,
                  fontSize: 16,
                  border: "1.5px solid #E2E8F0",
                }}
              >
                ›
              </button>
              <button
                onClick={() => setStepIdx(steps.length - 1)}
                disabled={stepIdx >= steps.length - 1}
                style={{
                  padding: "6px 10px",
                  borderRadius: 8,
                  background: stepIdx >= steps.length - 1 ? "#F1F5F9" : "#fff",
                  color: stepIdx >= steps.length - 1 ? "#CBD5E1" : "#64748B",
                  fontWeight: 700,
                  fontSize: 14,
                  border: "1.5px solid #E2E8F0",
                }}
              >
                ⟩⟩
              </button>

              <div
                style={{
                  marginLeft: "auto",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span
                  style={{ fontSize: 10, color: "#94A3B8", fontWeight: 700 }}
                >
                  SPEED
                </span>
                <input
                  type="range"
                  min={100}
                  max={1600}
                  step={25}
                  value={1700 - speed}
                  onChange={(e) => setSpeed(1700 - Number(e.target.value))}
                  style={{ width: 70, accentColor: m.accent }}
                />
              </div>
              <span
                style={{
                  fontSize: 12,
                  fontFamily: "'IBM Plex Mono', monospace",
                  color: "#94A3B8",
                  fontWeight: 500,
                }}
              >
                {stepIdx + 1}/{steps.length}
              </span>
            </div>

            {/* ── Progress Bar ── */}
            <div
              style={{
                height: 4,
                borderRadius: 2,
                background: "#F1F5F9",
                marginBottom: 16,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  borderRadius: 2,
                  width: `${((stepIdx + 1) / steps.length) * 100}%`,
                  background: m.gradient,
                  transition: "width 0.35s ease",
                }}
              />
            </div>

            {/* ── Explanation Card ── */}
            <div
              style={{
                background: "#fff",
                borderRadius: 14,
                padding: "14px 18px",
                boxShadow:
                  "0 1px 3px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.02)",
                border: "1px solid #F1F5F9",
                borderLeft: `4px solid ${m.accent}`,
                marginBottom: 16,
                animation: "slideReveal 0.3s ease",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: 16,
                    fontWeight: 700,
                    fontFamily: "'Libre Baskerville', serif",
                    color: "#1E293B",
                  }}
                >
                  {step.title}
                </h3>
                {step.title.includes("Complete") && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: 6,
                      background: "#ECFDF5",
                      color: "#059669",
                    }}
                  >
                    ✓ DONE
                  </span>
                )}
              </div>
              <p
                style={{
                  margin: "6px 0 0",
                  fontSize: 13.5,
                  color: "#475569",
                  lineHeight: 1.65,
                }}
              >
                {step.detail}
              </p>
            </div>

            {/* ═══ ARRAY VISUALIZATION ══════════════════════════════════ */}
            <div
              style={{
                background: "#fff",
                borderRadius: 16,
                padding: "28px 22px 20px",
                boxShadow:
                  "0 1px 3px rgba(0,0,0,0.03), 0 8px 30px rgba(0,0,0,0.025)",
                border: "1px solid #F1F5F9",
                marginBottom: 16,
                overflowX: "auto",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  gap: cellGap,
                  position: "relative",
                  padding: "4px 2px",
                  minWidth: "100%",
                  justifyContent:
                    step.array.length <= 10 ? "center" : "flex-start",
                }}
              >
                {/* Window overlay frame */}
                {step.left >= 0 &&
                  step.right >= 0 &&
                  step.right >= step.left && (
                    <WindowOverlay
                      left={step.left}
                      right={step.right}
                      total={step.array.length}
                      accent={m.accent}
                      cellSize={cellSize}
                    />
                  )}

                {step.array.map((val, idx) => (
                  <Cell
                    key={idx}
                    value={val}
                    index={idx}
                    state={getCellState(idx)}
                    isLeft={idx === step.left && step.right >= step.left}
                    isRight={idx === step.right && step.right >= step.left}
                    total={step.array.length}
                  />
                ))}
              </div>
            </div>

            {/* ═══ Window State Panel ═══════════════════════════════════ */}
            {step.windowState && Object.keys(step.windowState).length > 0 && (
              <div
                style={{
                  background: "#1E293B",
                  borderRadius: 14,
                  padding: "14px 18px",
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#FB7185",
                    }}
                  />
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#FBBF24",
                    }}
                  />
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#34D399",
                    }}
                  />
                  <span
                    style={{
                      marginLeft: 6,
                      fontSize: 11,
                      color: "#475569",
                      fontFamily: "'IBM Plex Mono', monospace",
                    }}
                  >
                    window state
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 16,
                    flexWrap: "wrap",
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 13,
                  }}
                >
                  {Object.entries(step.windowState).map(([k, v]) => (
                    <div
                      key={k}
                      style={{ display: "flex", gap: 6, alignItems: "center" }}
                    >
                      <span style={{ color: "#64748B" }}>{k}:</span>
                      <span
                        style={{
                          color:
                            k.includes("max") ||
                            k.includes("min") ||
                            k === "target"
                              ? "#34D399"
                              : k.includes("sum") || k.includes("window")
                                ? "#67E8F9"
                                : k.includes("remov") ||
                                    k.includes("leav") ||
                                    k.includes("duplicate")
                                  ? "#FCA5A5"
                                  : k.includes("add") || k.includes("enter")
                                    ? "#FDE68A"
                                    : "#CBD5E1",
                          fontWeight: 600,
                        }}
                      >
                        {String(v)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ═══ Bottom Grid ══════════════════════════════════════════ */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: 14,
              }}
            >
              {/* Complexity Card */}
              <div
                style={{
                  background: "#fff",
                  borderRadius: 14,
                  padding: "16px 18px",
                  boxShadow:
                    "0 1px 3px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.02)",
                  border: "1px solid #F1F5F9",
                }}
              >
                <h4
                  style={{
                    margin: "0 0 10px",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#94A3B8",
                    textTransform: "uppercase",
                    letterSpacing: 1.2,
                  }}
                >
                  Complexity — {m.name}
                </h4>
                <div style={{ display: "flex", gap: 10 }}>
                  <div
                    style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: 10,
                      background: "#ECFEFF",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: "#0891B2",
                        marginBottom: 2,
                      }}
                    >
                      TIME
                    </div>
                    <div
                      style={{
                        fontSize: 20,
                        fontWeight: 800,
                        color: "#0E7490",
                        fontFamily: "'IBM Plex Mono', monospace",
                      }}
                    >
                      {m.time}
                    </div>
                    <div
                      style={{ fontSize: 10, color: "#67E8F9", marginTop: 2 }}
                    >
                      each pointer ≤ n moves
                    </div>
                  </div>
                  <div
                    style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: 10,
                      background: "#F5F3FF",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: "#7C3AED",
                        marginBottom: 2,
                      }}
                    >
                      SPACE
                    </div>
                    <div
                      style={{
                        fontSize: 20,
                        fontWeight: 800,
                        color: "#5B21B6",
                        fontFamily: "'IBM Plex Mono', monospace",
                      }}
                    >
                      {m.space}
                    </div>
                    <div
                      style={{ fontSize: 10, color: "#A78BFA", marginTop: 2 }}
                    >
                      {m.space === "O(1)"
                        ? "only pointers + vars"
                        : "hash set / map"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Legend Card */}
              <div
                style={{
                  background: "#fff",
                  borderRadius: 14,
                  padding: "16px 18px",
                  boxShadow:
                    "0 1px 3px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.02)",
                  border: "1px solid #F1F5F9",
                }}
              >
                <h4
                  style={{
                    margin: "0 0 10px",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#94A3B8",
                    textTransform: "uppercase",
                    letterSpacing: 1.2,
                  }}
                >
                  Visual Legend
                </h4>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "7px 14px",
                  }}
                >
                  {[
                    { state: "idle", label: "Outside window" },
                    { state: "inWindow", label: "In window" },
                    { state: "entering", label: "Entering (right)" },
                    { state: "leaving", label: "Leaving (left)" },
                    { state: "best", label: "Best answer" },
                  ].map((item) => (
                    <div
                      key={item.state}
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <div
                        style={{
                          width: 22,
                          height: 16,
                          borderRadius: 5,
                          background: CELL_STATES[item.state].bg,
                          border: `2px solid ${CELL_STATES[item.state].border}`,
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontSize: 12,
                          color: "#64748B",
                          fontWeight: 500,
                        }}
                      >
                        {item.label}
                      </span>
                    </div>
                  ))}
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <div
                      style={{
                        width: 22,
                        height: 16,
                        borderRadius: 5,
                        background: "transparent",
                        border: `2px solid ${m.accent}`,
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontSize: 12,
                        color: "#64748B",
                        fontWeight: 500,
                      }}
                    >
                      Window frame
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Algorithm description */}
            <div
              style={{
                marginTop: 14,
                padding: "14px 18px",
                borderRadius: 14,
                background: "linear-gradient(135deg, #F0FDFA, #F0F9FF)",
                border: "1px solid #E0F2FE",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "flex-start", gap: 10 }}
              >
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 6,
                    background: m.gradient,
                    color: "#fff",
                    letterSpacing: 0.5,
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  {m.name.toUpperCase()}
                </span>
                <span
                  style={{ fontSize: 13, color: "#475569", lineHeight: 1.55 }}
                >
                  {m.description}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ═══ Empty State ══════════════════════════════════════════ */}
        {steps.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "48px 20px",
              background: "#fff",
              borderRadius: 16,
              boxShadow:
                "0 1px 3px rgba(0,0,0,0.03), 0 8px 30px rgba(0,0,0,0.025)",
              border: "1px solid #F1F5F9",
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 18,
                margin: "0 auto 16px",
                background: m.gradient,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 8px 28px ${m.accent}20`,
                transition: "all 0.4s",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Animated sliding frame inside icon */}
              <div
                style={{
                  position: "absolute",
                  top: 12,
                  width: 20,
                  height: 48,
                  borderRadius: 6,
                  border: "2.5px solid rgba(255,255,255,0.6)",
                  animation: "slideIcon 3s ease-in-out infinite",
                }}
              />
              <style>{`
                @keyframes slideIcon {
                  0%, 100% { left: 8px; }
                  50% { left: 42px; }
                }
              `}</style>
            </div>
            <h3
              style={{
                fontFamily: "'Libre Baskerville', serif",
                fontSize: 22,
                fontWeight: 700,
                color: "#134E4A",
                margin: "0 0 6px",
              }}
            >
              Ready to Slide
            </h3>
            <p
              style={{
                fontSize: 14,
                color: "#94A3B8",
                maxWidth: 440,
                margin: "0 auto",
                lineHeight: 1.65,
              }}
            >
              Choose a problem type above, enter your array, and hit{" "}
              <strong style={{ color: m.accent }}>Visualize</strong> to watch
              the sliding window expand, contract, and glide step by step.
            </p>

            {/* Concept cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
                gap: 10,
                marginTop: 24,
                textAlign: "left",
              }}
            >
              {[
                {
                  icon: "◻",
                  title: "Fixed Window",
                  desc: "Constant size k. Slide one position each step.",
                  color: "#0891B2",
                  bg: "#ECFEFF",
                },
                {
                  icon: "↔",
                  title: "Variable Window",
                  desc: "Expand right, shrink left. Size adapts to constraints.",
                  color: "#D97706",
                  bg: "#FFFBEB",
                },
                {
                  icon: "⚡",
                  title: "O(n) Always",
                  desc: "Each pointer moves at most n times. No nested scans.",
                  color: "#7C3AED",
                  bg: "#F5F3FF",
                },
              ].map((c, i) => (
                <div
                  key={i}
                  style={{
                    padding: "14px 16px",
                    borderRadius: 12,
                    background: c.bg,
                    border: `1px solid ${c.color}15`,
                  }}
                >
                  <div style={{ fontSize: 20, marginBottom: 6 }}>{c.icon}</div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: c.color,
                      marginBottom: 3,
                    }}
                  >
                    {c.title}
                  </div>
                  <div
                    style={{ fontSize: 11, color: "#64748B", lineHeight: 1.5 }}
                  >
                    {c.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
