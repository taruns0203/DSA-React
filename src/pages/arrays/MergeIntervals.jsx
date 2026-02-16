import { useState, useEffect, useRef, useCallback } from "react";

// ─── Merge Intervals Visualizer ─────────────────────────────────────────────
// A self-contained, animated, step-by-step visualizer for the Merge Intervals
// DSA technique. Designed for FAANG interview demos with a warm editorial aesthetic.

// ─── Constants & Helpers ────────────────────────────────────────────────────

const INTERVAL_COLORS = [
  {
    bg: "linear-gradient(135deg, #FF6B6B, #EE5A24)",
    border: "#EE5A24",
    text: "#fff",
    label: "Coral",
  },
  {
    bg: "linear-gradient(135deg, #48DBFB, #0ABDE3)",
    border: "#0ABDE3",
    text: "#fff",
    label: "Cyan",
  },
  {
    bg: "linear-gradient(135deg, #FECA57, #FF9F43)",
    border: "#FF9F43",
    text: "#fff",
    label: "Amber",
  },
  {
    bg: "linear-gradient(135deg, #A29BFE, #6C5CE7)",
    border: "#6C5CE7",
    text: "#fff",
    label: "Violet",
  },
  {
    bg: "linear-gradient(135deg, #55E6C1, #1DD1A1)",
    border: "#1DD1A1",
    text: "#fff",
    label: "Mint",
  },
  {
    bg: "linear-gradient(135deg, #FDA7DF, #D980FA)",
    border: "#D980FA",
    text: "#fff",
    label: "Pink",
  },
  {
    bg: "linear-gradient(135deg, #F8A5C2, #E66767)",
    border: "#E66767",
    text: "#fff",
    label: "Rose",
  },
  {
    bg: "linear-gradient(135deg, #82CCDD, #3DC1D3)",
    border: "#3DC1D3",
    text: "#fff",
    label: "Teal",
  },
];

const MERGED_GRADIENT = "linear-gradient(135deg, #0F9B58, #34A853)";
const MERGED_BORDER = "#0F9B58";

const DEFAULT_INPUT = "[[1,3],[2,6],[8,10],[15,18]]";

function parseIntervals(str) {
  try {
    const cleaned = str.replace(/\s/g, "");
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed)) return null;
    for (const item of parsed) {
      if (!Array.isArray(item) || item.length !== 2) return null;
      if (typeof item[0] !== "number" || typeof item[1] !== "number")
        return null;
      if (item[0] > item[1]) return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

// Generate all algorithm steps for the merge intervals algorithm
function generateSteps(intervals) {
  if (!intervals || intervals.length === 0) return [];

  const steps = [];
  const original = intervals.map((iv, i) => ({
    val: [...iv],
    colorIdx: i % INTERVAL_COLORS.length,
    id: i,
  }));

  // Step 0: Show original unsorted intervals
  steps.push({
    type: "initial",
    title: "Input Intervals",
    description:
      "These are the raw intervals as provided. Our goal is to merge all overlapping intervals into non-overlapping groups.",
    intervals: original.map((o) => ({ ...o })),
    sorted: null,
    merged: [],
    activeIdx: -1,
    compareIdx: -1,
    phase: "input",
  });

  // Step 1: Sort by start time
  const sorted = [...original].sort((a, b) => a.val[0] - b.val[0]);
  steps.push({
    type: "sort",
    title: "Sort by Start Time",
    description:
      "We sort all intervals by their start value in ascending order. This guarantees that overlapping intervals become adjacent, allowing a single linear scan.",
    intervals: original.map((o) => ({ ...o })),
    sorted: sorted.map((s) => ({ ...s })),
    merged: [],
    activeIdx: -1,
    compareIdx: -1,
    phase: "sort",
  });

  // Step 2+: Process each interval
  const merged = [
    {
      val: [...sorted[0].val],
      sources: [sorted[0].id],
      colorIdx: sorted[0].colorIdx,
    },
  ];

  steps.push({
    type: "init-merged",
    title: "Initialize with First Interval",
    description: `We start the merged list with the first sorted interval [${sorted[0].val[0]}, ${sorted[0].val[1]}]. This becomes the "current" interval we compare against.`,
    intervals: original.map((o) => ({ ...o })),
    sorted: sorted.map((s) => ({ ...s })),
    merged: merged.map((m) => ({
      ...m,
      val: [...m.val],
      sources: [...m.sources],
    })),
    activeIdx: 0,
    compareIdx: -1,
    phase: "process",
  });

  for (let i = 1; i < sorted.length; i++) {
    const curr = sorted[i];
    const last = merged[merged.length - 1];

    if (curr.val[0] <= last.val[1]) {
      // Overlap
      steps.push({
        type: "compare-overlap",
        title: `Overlap Detected!`,
        description: `Comparing [${curr.val[0]}, ${curr.val[1]}] with last merged [${last.val[0]}, ${last.val[1]}]: Since ${curr.val[0]} ≤ ${last.val[1]}, they overlap! We extend the end to max(${last.val[1]}, ${curr.val[1]}) = ${Math.max(last.val[1], curr.val[1])}.`,
        intervals: original.map((o) => ({ ...o })),
        sorted: sorted.map((s) => ({ ...s })),
        merged: merged.map((m) => ({
          ...m,
          val: [...m.val],
          sources: [...m.sources],
        })),
        activeIdx: i,
        compareIdx: merged.length - 1,
        phase: "overlap",
        overlapResult: true,
      });

      last.val[1] = Math.max(last.val[1], curr.val[1]);
      last.sources.push(curr.id);

      steps.push({
        type: "after-merge",
        title: "Merged!",
        description: `The merged interval is now [${last.val[0]}, ${last.val[1]}], absorbing ${last.sources.length} original intervals.`,
        intervals: original.map((o) => ({ ...o })),
        sorted: sorted.map((s) => ({ ...s })),
        merged: merged.map((m) => ({
          ...m,
          val: [...m.val],
          sources: [...m.sources],
        })),
        activeIdx: i,
        compareIdx: merged.length - 1,
        phase: "merged",
      });
    } else {
      // No overlap
      steps.push({
        type: "compare-no-overlap",
        title: "No Overlap — New Group",
        description: `Comparing [${curr.val[0]}, ${curr.val[1]}] with last merged [${last.val[0]}, ${last.val[1]}]: Since ${curr.val[0]} > ${last.val[1]}, there's a gap. We start a new merged group.`,
        intervals: original.map((o) => ({ ...o })),
        sorted: sorted.map((s) => ({ ...s })),
        merged: merged.map((m) => ({
          ...m,
          val: [...m.val],
          sources: [...m.sources],
        })),
        activeIdx: i,
        compareIdx: merged.length - 1,
        phase: "no-overlap",
        overlapResult: false,
      });

      merged.push({
        val: [...curr.val],
        sources: [curr.id],
        colorIdx: curr.colorIdx,
      });

      steps.push({
        type: "after-new-group",
        title: "New Group Added",
        description: `[${curr.val[0]}, ${curr.val[1]}] starts a new group in the merged result. We now have ${merged.length} merged intervals.`,
        intervals: original.map((o) => ({ ...o })),
        sorted: sorted.map((s) => ({ ...s })),
        merged: merged.map((m) => ({
          ...m,
          val: [...m.val],
          sources: [...m.sources],
        })),
        activeIdx: i,
        compareIdx: merged.length - 1,
        phase: "new-group",
      });
    }
  }

  // Final result
  steps.push({
    type: "done",
    title: "Algorithm Complete!",
    description: `Merged ${original.length} intervals into ${merged.length} non-overlapping intervals. Time: O(n log n) for sorting + O(n) scan. Space: O(n) for the output.`,
    intervals: original.map((o) => ({ ...o })),
    sorted: sorted.map((s) => ({ ...s })),
    merged: merged.map((m) => ({
      ...m,
      val: [...m.val],
      sources: [...m.sources],
    })),
    activeIdx: -1,
    compareIdx: -1,
    phase: "done",
  });

  return steps;
}

// ─── Sub-Components ─────────────────────────────────────────────────────────

function TimelineBar({
  interval,
  min,
  max,
  color,
  isActive,
  isMerged,
  isCompare,
  opacity,
  label,
  animate,
}) {
  const range = max - min || 1;
  const left = ((interval[0] - min) / range) * 100;
  const width = Math.max(((interval[1] - interval[0]) / range) * 100, 2);

  return (
    <div
      style={{
        position: "relative",
        height: 36,
        margin: "3px 0",
        transition: "all 0.5s cubic-bezier(0.4,0,0.2,1)",
        opacity: opacity ?? 1,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: `${left}%`,
          width: `${width}%`,
          height: "100%",
          background: isMerged ? MERGED_GRADIENT : color.bg,
          borderRadius: 8,
          border: `2.5px solid ${isActive ? "#FF6348" : isCompare ? MERGED_BORDER : isMerged ? MERGED_BORDER : color.border}`,
          boxShadow: isActive
            ? "0 0 0 3px rgba(255,99,72,0.3), 0 4px 15px rgba(255,99,72,0.25)"
            : isCompare
              ? "0 0 0 3px rgba(15,155,88,0.3), 0 4px 15px rgba(15,155,88,0.25)"
              : isMerged
                ? "0 2px 10px rgba(15,155,88,0.2)"
                : "0 2px 8px rgba(0,0,0,0.08)",
          transition: "all 0.5s cubic-bezier(0.4,0,0.2,1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          transform: isActive
            ? "scale(1.04)"
            : isCompare
              ? "scale(1.02)"
              : "scale(1)",
          animation: animate
            ? "slideIn 0.5s cubic-bezier(0.4,0,0.2,1)"
            : undefined,
        }}
      >
        <span
          style={{
            color: "#fff",
            fontSize: 13,
            fontWeight: 700,
            fontFamily: "'DM Mono', 'Fira Code', monospace",
            textShadow: "0 1px 3px rgba(0,0,0,0.3)",
            whiteSpace: "nowrap",
            letterSpacing: "-0.3px",
          }}
        >
          [{interval[0]}, {interval[1]}]
        </span>
      </div>
      {label && (
        <span
          style={{
            position: "absolute",
            left: `${left}%`,
            top: -16,
            fontSize: 10,
            fontWeight: 600,
            color: isActive ? "#FF6348" : "#888",
            fontFamily: "'DM Mono', monospace",
            transform: "translateX(4px)",
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
}

function TickAxis({ min, max }) {
  const range = max - min || 1;
  const step = Math.max(1, Math.ceil(range / 20));
  const ticks = [];
  for (let v = min; v <= max; v += step) ticks.push(v);
  if (ticks[ticks.length - 1] !== max) ticks.push(max);

  return (
    <div style={{ position: "relative", height: 22, marginTop: 4 }}>
      {ticks.map((t) => {
        const left = ((t - min) / range) * 100;
        return (
          <span
            key={t}
            style={{
              position: "absolute",
              left: `${left}%`,
              transform: "translateX(-50%)",
              fontSize: 10,
              color: "#aaa",
              fontFamily: "'DM Mono', monospace",
              fontWeight: 500,
            }}
          >
            {t}
          </span>
        );
      })}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 1,
          background:
            "linear-gradient(90deg, transparent, #ddd 5%, #ddd 95%, transparent)",
        }}
      />
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function MergeIntervalsVisualizer() {
  const [input, setInput] = useState(DEFAULT_INPUT);
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1200);
  const [error, setError] = useState("");
  const timerRef = useRef(null);

  const step = steps[currentStep] || null;

  // Compute global min/max for consistent timeline scale
  const globalRange =
    steps.length > 0
      ? (() => {
          const allVals = steps[0].intervals.flatMap((iv) => iv.val);
          return {
            min: Math.min(...allVals) - 1,
            max: Math.max(...allVals) + 1,
          };
        })()
      : { min: 0, max: 10 };

  // Auto-play logic
  useEffect(() => {
    if (isPlaying && currentStep < steps.length - 1) {
      timerRef.current = setTimeout(() => setCurrentStep((s) => s + 1), speed);
      return () => clearTimeout(timerRef.current);
    } else if (isPlaying && currentStep >= steps.length - 1) {
      setIsPlaying(false);
    }
  }, [isPlaying, currentStep, steps.length, speed]);

  const handleStart = useCallback(() => {
    const parsed = parseIntervals(input);
    if (!parsed || parsed.length === 0) {
      setError("Invalid input. Use format: [[1,3],[2,6],[8,10]]");
      return;
    }
    setError("");
    const newSteps = generateSteps(parsed);
    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(false);
  }, [input]);

  const handleReset = () => {
    setSteps([]);
    setCurrentStep(0);
    setIsPlaying(false);
    clearTimeout(timerRef.current);
  };

  const handlePlay = () => {
    if (currentStep >= steps.length - 1) setCurrentStep(0);
    setIsPlaying(true);
  };

  // Phase badge colors
  const phaseColors = {
    input: { bg: "#EBF5FB", color: "#2E86C1", label: "INPUT" },
    sort: { bg: "#FDF2E9", color: "#E67E22", label: "SORTING" },
    process: { bg: "#F4ECF7", color: "#8E44AD", label: "PROCESSING" },
    overlap: { bg: "#FDEDEC", color: "#E74C3C", label: "OVERLAP" },
    merged: { bg: "#EAFAF1", color: "#0F9B58", label: "MERGED" },
    "no-overlap": { bg: "#FEF9E7", color: "#F39C12", label: "GAP" },
    "new-group": { bg: "#EBF5FB", color: "#2E86C1", label: "NEW GROUP" },
    done: { bg: "#EAFAF1", color: "#0F9B58", label: "COMPLETE" },
  };

  const currentPhase = step
    ? phaseColors[step.phase] || phaseColors.input
    : phaseColors.input;

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(170deg, #FFF9F0 0%, #FFF 30%, #F0F7FF 70%, #FEFEFE 100%)",
        fontFamily: "'Source Sans 3', 'Segoe UI', system-ui, sans-serif",
        padding: "24px 16px",
        boxSizing: "border-box",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Source+Sans+3:wght@300;400;600;700;900&family=Playfair+Display:wght@700;900&display=swap');
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(8px) scaleY(0.9); }
          to { opacity: 1; transform: translateY(0) scaleY(1); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255,99,72,0.2); }
          50% { box-shadow: 0 0 0 8px rgba(255,99,72,0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        * { box-sizing: border-box; }
        input:focus { outline: none; }
        button { cursor: pointer; border: none; }
        button:active { transform: scale(0.97) !important; }
      `}</style>

      {/* ── Header ───────────────────────────────────────────── */}
      <div style={{ maxWidth: 900, margin: "0 auto 28px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 4,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "linear-gradient(135deg, #FF6348, #FF9F43)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 14px rgba(255,99,72,0.3)",
              fontSize: 20,
            }}
          >
            ⚡
          </div>
          <div>
            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 28,
                fontWeight: 900,
                margin: 0,
                background: "linear-gradient(135deg, #2C3E50, #E74C3C)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.5px",
              }}
            >
              Merge Intervals
            </h1>
            <p
              style={{
                fontSize: 13,
                color: "#888",
                margin: 0,
                fontWeight: 500,
              }}
            >
              Interactive Step-by-Step Visualizer
            </p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {/* ── Input Panel ────────────────────────────────────── */}
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: "20px 24px",
            boxShadow:
              "0 1px 3px rgba(0,0,0,0.04), 0 8px 30px rgba(0,0,0,0.04)",
            border: "1px solid #f0ebe4",
            marginBottom: 20,
          }}
        >
          <label
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#999",
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Intervals Input
          </label>
          <div
            style={{ display: "flex", gap: 10, marginTop: 8, flexWrap: "wrap" }}
          >
            <input
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setError("");
              }}
              placeholder="[[1,3],[2,6],[8,10],[15,18]]"
              style={{
                flex: 1,
                minWidth: 220,
                padding: "10px 14px",
                borderRadius: 10,
                border: error ? "2px solid #E74C3C" : "2px solid #eee",
                fontSize: 15,
                fontFamily: "'DM Mono', monospace",
                background: "#FAFAFA",
                transition: "border 0.3s",
                color: "#333",
              }}
              onKeyDown={(e) => e.key === "Enter" && handleStart()}
            />
            <button
              onClick={handleStart}
              style={{
                padding: "10px 22px",
                borderRadius: 10,
                background: "linear-gradient(135deg, #FF6348, #FF9F43)",
                color: "#fff",
                fontWeight: 700,
                fontSize: 14,
                boxShadow: "0 4px 14px rgba(255,99,72,0.3)",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
            >
              ▶ Start
            </button>
            {steps.length > 0 && (
              <button
                onClick={handleReset}
                style={{
                  padding: "10px 18px",
                  borderRadius: 10,
                  background: "#f5f5f5",
                  color: "#666",
                  fontWeight: 600,
                  fontSize: 14,
                  transition: "background 0.2s",
                }}
              >
                ↺ Reset
              </button>
            )}
          </div>
          {error && (
            <p
              style={{
                color: "#E74C3C",
                fontSize: 13,
                marginTop: 6,
                fontWeight: 500,
              }}
            >
              {error}
            </p>
          )}

          {/* Preset examples */}
          <div
            style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}
          >
            <span
              style={{
                fontSize: 11,
                color: "#aaa",
                fontWeight: 600,
                alignSelf: "center",
              }}
            >
              TRY:
            </span>
            {[
              { label: "Basic", val: "[[1,3],[2,6],[8,10],[15,18]]" },
              { label: "All Overlap", val: "[[1,4],[2,5],[3,6],[4,8]]" },
              { label: "Nested", val: "[[1,10],[2,5],[3,7],[6,8]]" },
              { label: "No Overlap", val: "[[1,2],[4,5],[7,8],[10,11]]" },
              { label: "Touching", val: "[[1,3],[3,5],[5,7],[7,9]]" },
            ].map((ex) => (
              <button
                key={ex.label}
                onClick={() => {
                  setInput(ex.val);
                  setError("");
                }}
                style={{
                  padding: "4px 12px",
                  borderRadius: 20,
                  background: input === ex.val ? "#FF634820" : "#f7f3ee",
                  color: input === ex.val ? "#FF6348" : "#777",
                  fontSize: 12,
                  fontWeight: 600,
                  border:
                    input === ex.val
                      ? "1px solid #FF634840"
                      : "1px solid transparent",
                  transition: "all 0.2s",
                }}
              >
                {ex.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Visualization Area ─────────────────────────────── */}
        {steps.length > 0 && step && (
          <div style={{ animation: "fadeUp 0.5s ease" }}>
            {/* Controls Bar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 16,
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
                disabled={currentStep === 0}
                style={{
                  padding: "7px 14px",
                  borderRadius: 8,
                  background: currentStep === 0 ? "#f0f0f0" : "#fff",
                  color: currentStep === 0 ? "#ccc" : "#555",
                  fontWeight: 700,
                  fontSize: 16,
                  border: "1px solid #eee",
                  transition: "all 0.2s",
                }}
              >
                ‹
              </button>
              <button
                onClick={isPlaying ? () => setIsPlaying(false) : handlePlay}
                style={{
                  padding: "7px 20px",
                  borderRadius: 8,
                  background: isPlaying
                    ? "linear-gradient(135deg, #E74C3C, #C0392B)"
                    : "linear-gradient(135deg, #0F9B58, #34A853)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 13,
                  boxShadow: isPlaying
                    ? "0 3px 10px rgba(231,76,60,0.3)"
                    : "0 3px 10px rgba(15,155,88,0.3)",
                }}
              >
                {isPlaying ? "⏸ Pause" : "▶ Play"}
              </button>
              <button
                onClick={() =>
                  setCurrentStep((s) => Math.min(steps.length - 1, s + 1))
                }
                disabled={currentStep >= steps.length - 1}
                style={{
                  padding: "7px 14px",
                  borderRadius: 8,
                  background:
                    currentStep >= steps.length - 1 ? "#f0f0f0" : "#fff",
                  color: currentStep >= steps.length - 1 ? "#ccc" : "#555",
                  fontWeight: 700,
                  fontSize: 16,
                  border: "1px solid #eee",
                  transition: "all 0.2s",
                }}
              >
                ›
              </button>

              <div
                style={{
                  marginLeft: "auto",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 11, color: "#aaa", fontWeight: 600 }}>
                  SPEED
                </span>
                <input
                  type="range"
                  min={300}
                  max={2500}
                  step={100}
                  value={2800 - speed}
                  onChange={(e) => setSpeed(2800 - Number(e.target.value))}
                  style={{ width: 80, accentColor: "#FF6348" }}
                />
              </div>

              <div
                style={{
                  padding: "4px 12px",
                  borderRadius: 20,
                  background: currentPhase.bg,
                  color: currentPhase.color,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 0.8,
                }}
              >
                {currentPhase.label}
              </div>

              <span
                style={{
                  fontSize: 12,
                  color: "#aaa",
                  fontFamily: "'DM Mono', monospace",
                  fontWeight: 500,
                }}
              >
                {currentStep + 1}/{steps.length}
              </span>
            </div>

            {/* Step Progress Bar */}
            <div
              style={{
                height: 4,
                borderRadius: 2,
                background: "#f0ebe4",
                marginBottom: 20,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  borderRadius: 2,
                  width: `${((currentStep + 1) / steps.length) * 100}%`,
                  background:
                    "linear-gradient(90deg, #FF6348, #FF9F43, #0F9B58)",
                  transition: "width 0.4s ease",
                }}
              />
            </div>

            {/* Explanation Card */}
            <div
              style={{
                background: "#fff",
                borderRadius: 14,
                padding: "16px 20px",
                boxShadow:
                  "0 1px 3px rgba(0,0,0,0.03), 0 4px 20px rgba(0,0,0,0.03)",
                border: `1.5px solid ${currentPhase.color}20`,
                marginBottom: 20,
                borderLeft: `4px solid ${currentPhase.color}`,
              }}
            >
              <h3
                style={{
                  margin: "0 0 6px",
                  fontSize: 17,
                  fontWeight: 700,
                  color: "#2C3E50",
                  fontFamily: "'Playfair Display', serif",
                }}
              >
                {step.title}
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  color: "#555",
                  lineHeight: 1.6,
                }}
              >
                {step.description}
              </p>
            </div>

            {/* Main Visualization Grid */}
            <div
              style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}
            >
              {/* Original / Sorted Intervals Timeline */}
              <div
                style={{
                  background: "#fff",
                  borderRadius: 14,
                  padding: "16px 20px",
                  boxShadow:
                    "0 1px 3px rgba(0,0,0,0.03), 0 4px 20px rgba(0,0,0,0.03)",
                  border: "1px solid #f0ebe4",
                }}
              >
                <h4
                  style={{
                    margin: "0 0 8px",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#bbb",
                    textTransform: "uppercase",
                    letterSpacing: 1.2,
                  }}
                >
                  {step.sorted ? "Sorted Intervals" : "Original Intervals"}
                </h4>
                <div style={{ padding: "4px 0" }}>
                  {(step.sorted || step.intervals).map((iv, idx) => (
                    <TimelineBar
                      key={`sorted-${iv.id}`}
                      interval={iv.val}
                      min={globalRange.min}
                      max={globalRange.max}
                      color={INTERVAL_COLORS[iv.colorIdx]}
                      isActive={step.activeIdx === idx && step.sorted}
                      isCompare={false}
                      isMerged={false}
                      label={step.sorted ? `#${idx}` : null}
                      animate={step.type === "sort"}
                    />
                  ))}
                  <TickAxis min={globalRange.min} max={globalRange.max} />
                </div>
              </div>

              {/* Merged Result Timeline */}
              {step.merged && step.merged.length > 0 && (
                <div
                  style={{
                    background: "#fff",
                    borderRadius: 14,
                    padding: "16px 20px",
                    boxShadow:
                      "0 1px 3px rgba(0,0,0,0.03), 0 4px 20px rgba(0,0,0,0.03)",
                    border:
                      step.phase === "done"
                        ? "1.5px solid #0F9B5830"
                        : "1px solid #f0ebe4",
                    animation: "fadeUp 0.4s ease",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    }}
                  >
                    <h4
                      style={{
                        margin: 0,
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#0F9B58",
                        textTransform: "uppercase",
                        letterSpacing: 1.2,
                      }}
                    >
                      Merged Result
                    </h4>
                    <span
                      style={{
                        fontSize: 11,
                        fontFamily: "'DM Mono', monospace",
                        color: "#0F9B58",
                        fontWeight: 600,
                        padding: "2px 8px",
                        borderRadius: 6,
                        background: "#0F9B5810",
                      }}
                    >
                      {step.merged.length} interval
                      {step.merged.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div style={{ padding: "4px 0" }}>
                    {step.merged.map((m, idx) => (
                      <TimelineBar
                        key={`merged-${idx}-${m.val[0]}-${m.val[1]}`}
                        interval={m.val}
                        min={globalRange.min}
                        max={globalRange.max}
                        color={INTERVAL_COLORS[0]}
                        isActive={false}
                        isCompare={
                          step.compareIdx === idx &&
                          (step.phase === "overlap" ||
                            step.phase === "no-overlap")
                        }
                        isMerged={true}
                        label={`M${idx}`}
                        animate={
                          step.type === "after-merge" ||
                          step.type === "after-new-group"
                        }
                      />
                    ))}
                    <TickAxis min={globalRange.min} max={globalRange.max} />
                  </div>
                </div>
              )}
            </div>

            {/* Comparison Detail Card (shown during overlap checks) */}
            {(step.phase === "overlap" || step.phase === "no-overlap") && (
              <div
                style={{
                  marginTop: 16,
                  borderRadius: 14,
                  padding: "16px 20px",
                  background:
                    step.phase === "overlap"
                      ? "linear-gradient(135deg, #FDEDEC, #FFF5F5)"
                      : "linear-gradient(135deg, #FEF9E7, #FFFDF0)",
                  border:
                    step.phase === "overlap"
                      ? "1px solid #E74C3C20"
                      : "1px solid #F39C1220",
                  animation: "fadeUp 0.4s ease",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 16,
                    flexWrap: "wrap",
                  }}
                >
                  <div
                    style={{
                      padding: "8px 16px",
                      borderRadius: 10,
                      background: MERGED_GRADIENT,
                      color: "#fff",
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 15,
                      fontWeight: 700,
                      boxShadow: "0 2px 8px rgba(15,155,88,0.2)",
                    }}
                  >
                    [{step.merged[step.merged.length - 1]?.val[0]},{" "}
                    {step.merged[step.merged.length - 1]?.val[1]}]
                  </div>
                  <span
                    style={{
                      fontSize: 22,
                      fontWeight: 700,
                      color: step.phase === "overlap" ? "#E74C3C" : "#F39C12",
                    }}
                  >
                    {step.phase === "overlap" ? "∩" : "∤"}
                  </span>
                  <div
                    style={{
                      padding: "8px 16px",
                      borderRadius: 10,
                      background:
                        INTERVAL_COLORS[
                          step.sorted[step.activeIdx]?.colorIdx || 0
                        ].bg,
                      color: "#fff",
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 15,
                      fontWeight: 700,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      border: "2px solid #FF6348",
                      animation: "pulseGlow 1.5s ease infinite",
                    }}
                  >
                    [{step.sorted[step.activeIdx]?.val[0]},{" "}
                    {step.sorted[step.activeIdx]?.val[1]}]
                  </div>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: step.phase === "overlap" ? "#E74C3C" : "#F39C12",
                      padding: "4px 12px",
                      borderRadius: 20,
                      background:
                        step.phase === "overlap" ? "#E74C3C15" : "#F39C1215",
                    }}
                  >
                    {step.phase === "overlap"
                      ? `${step.sorted[step.activeIdx]?.val[0]} ≤ ${step.merged[step.merged.length - 1]?.val[1]} → OVERLAP`
                      : `${step.sorted[step.activeIdx]?.val[0]} > ${step.merged[step.merged.length - 1]?.val[1]} → GAP`}
                  </span>
                </div>
              </div>
            )}

            {/* Bottom Info Row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: 16,
                marginTop: 20,
              }}
            >
              {/* Complexity Card */}
              <div
                style={{
                  background: "#fff",
                  borderRadius: 14,
                  padding: "16px 20px",
                  boxShadow:
                    "0 1px 3px rgba(0,0,0,0.03), 0 4px 20px rgba(0,0,0,0.03)",
                  border: "1px solid #f0ebe4",
                }}
              >
                <h4
                  style={{
                    margin: "0 0 12px",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#bbb",
                    textTransform: "uppercase",
                    letterSpacing: 1.2,
                  }}
                >
                  Complexity
                </h4>
                <div style={{ display: "flex", gap: 12 }}>
                  <div
                    style={{
                      flex: 1,
                      padding: "10px 14px",
                      borderRadius: 10,
                      background: "linear-gradient(135deg, #EBF5FB, #D6EAF8)",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        color: "#2E86C1",
                        fontWeight: 600,
                        marginBottom: 2,
                      }}
                    >
                      TIME
                    </div>
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 900,
                        color: "#1A5276",
                        fontFamily: "'DM Mono', monospace",
                      }}
                    >
                      O(n log n)
                    </div>
                    <div
                      style={{ fontSize: 10, color: "#5DADE2", marginTop: 2 }}
                    >
                      sorting dominates
                    </div>
                  </div>
                  <div
                    style={{
                      flex: 1,
                      padding: "10px 14px",
                      borderRadius: 10,
                      background: "linear-gradient(135deg, #F4ECF7, #E8DAEF)",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        color: "#8E44AD",
                        fontWeight: 600,
                        marginBottom: 2,
                      }}
                    >
                      SPACE
                    </div>
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 900,
                        color: "#4A235A",
                        fontFamily: "'DM Mono', monospace",
                      }}
                    >
                      O(n)
                    </div>
                    <div
                      style={{ fontSize: 10, color: "#AF7AC5", marginTop: 2 }}
                    >
                      output array
                    </div>
                  </div>
                </div>
              </div>

              {/* Legend Card */}
              <div
                style={{
                  background: "#fff",
                  borderRadius: 14,
                  padding: "16px 20px",
                  boxShadow:
                    "0 1px 3px rgba(0,0,0,0.03), 0 4px 20px rgba(0,0,0,0.03)",
                  border: "1px solid #f0ebe4",
                }}
              >
                <h4
                  style={{
                    margin: "0 0 12px",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#bbb",
                    textTransform: "uppercase",
                    letterSpacing: 1.2,
                  }}
                >
                  Legend
                </h4>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "8px 16px",
                  }}
                >
                  {[
                    {
                      color: "linear-gradient(135deg, #48DBFB, #0ABDE3)",
                      border: "#0ABDE3",
                      label: "Original Interval",
                    },
                    {
                      color: MERGED_GRADIENT,
                      border: MERGED_BORDER,
                      label: "Merged Interval",
                    },
                    {
                      color: "#fff",
                      border: "#FF6348",
                      label: "Active (current)",
                      glow: true,
                    },
                    {
                      color: "#fff",
                      border: "#0F9B58",
                      label: "Comparing Against",
                      glow2: true,
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <div
                        style={{
                          width: 22,
                          height: 14,
                          borderRadius: 4,
                          background: item.color,
                          border: `2px solid ${item.border}`,
                          boxShadow: item.glow
                            ? "0 0 0 2px rgba(255,99,72,0.25)"
                            : item.glow2
                              ? "0 0 0 2px rgba(15,155,88,0.25)"
                              : "none",
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{ fontSize: 12, color: "#666", fontWeight: 500 }}
                      >
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Algorithm Code Card */}
            <div
              style={{
                background: "#1E272E",
                borderRadius: 14,
                padding: "16px 20px",
                marginTop: 16,
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: "#FF6B6B",
                  }}
                />
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: "#FECA57",
                  }}
                />
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: "#55E6C1",
                  }}
                />
                <span
                  style={{
                    marginLeft: 8,
                    fontSize: 11,
                    color: "#666",
                    fontFamily: "'DM Mono', monospace",
                  }}
                >
                  merge-intervals.js
                </span>
              </div>
              <pre
                style={{
                  margin: 0,
                  fontSize: 13,
                  lineHeight: 1.55,
                  fontFamily: "'DM Mono', 'Fira Code', monospace",
                  color: "#D2DAE2",
                  overflow: "auto",
                }}
              >
                {`function merge(intervals) {
  intervals.sort((a, b) => a[0] - b[0]);`}
                <span
                  style={{
                    color: step.phase === "sort" ? "#FECA57" : "#546E7A",
                  }}
                >{`  // ← ${step.phase === "sort" ? "EXECUTING" : "sort by start"}`}</span>
                {`
  const merged = [intervals[0]];`}
                <span
                  style={{
                    color: step.phase === "process" ? "#FECA57" : "#546E7A",
                  }}
                >{`          // ← ${step.phase === "process" ? "EXECUTING" : "init"}`}</span>
                {`
  for (let i = 1; i < intervals.length; i++) {
    const last = merged[merged.length - 1];
    if (intervals[i][0] <= last[1]) {`}
                <span
                  style={{
                    color:
                      step.phase === "overlap" || step.phase === "merged"
                        ? "#55E6C1"
                        : "#546E7A",
                  }}
                >{`  // ← ${step.phase === "overlap" ? "YES → OVERLAP" : step.phase === "merged" ? "MERGED!" : "overlap?"}`}</span>
                {`
      last[1] = Math.max(last[1], intervals[i][1]);
    } else {`}
                <span
                  style={{
                    color:
                      step.phase === "no-overlap" || step.phase === "new-group"
                        ? "#FF6B6B"
                        : "#546E7A",
                  }}
                >{`                             // ← ${step.phase === "no-overlap" ? "NO OVERLAP" : step.phase === "new-group" ? "NEW GROUP" : "new group"}`}</span>
                {`
      merged.push(intervals[i]);
    }
  }
  return merged;
}`}
              </pre>
            </div>
          </div>
        )}

        {/* ── Empty State ────────────────────────────────────── */}
        {steps.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              background: "#fff",
              borderRadius: 16,
              boxShadow:
                "0 1px 3px rgba(0,0,0,0.03), 0 8px 30px rgba(0,0,0,0.03)",
              border: "1px solid #f0ebe4",
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
            <h3
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 22,
                fontWeight: 700,
                color: "#2C3E50",
                margin: "0 0 8px",
              }}
            >
              Ready to Visualize
            </h3>
            <p
              style={{
                fontSize: 14,
                color: "#999",
                maxWidth: 400,
                margin: "0 auto",
                lineHeight: 1.6,
              }}
            >
              Enter intervals in the input above and press{" "}
              <strong style={{ color: "#FF6348" }}>Start</strong> to watch the
              merge intervals algorithm work step by step.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
