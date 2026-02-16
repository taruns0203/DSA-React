import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ═══════════════════════════════════════════════════════════════════════════
// Sorting Visualizer — Multi-Algorithm, Step-by-Step, Interview-Demo Ready
// Self-contained React component. No external dependencies.
// ═══════════════════════════════════════════════════════════════════════════

// ─── Algorithm Metadata ─────────────────────────────────────────────────────

const ALGORITHMS = {
  bubble: {
    name: "Bubble Sort",
    time: { best: "O(n)", avg: "O(n²)", worst: "O(n²)" },
    space: "O(1)",
    stable: true,
    description:
      "Repeatedly steps through the list, compares adjacent elements, and swaps them if they're in the wrong order. Like bubbles rising to the surface.",
    color: {
      primary: "#E74C3C",
      gradient: "linear-gradient(135deg, #FF6B6B, #EE5A24)",
    },
  },
  selection: {
    name: "Selection Sort",
    time: { best: "O(n²)", avg: "O(n²)", worst: "O(n²)" },
    space: "O(1)",
    stable: false,
    description:
      "Finds the minimum element from the unsorted portion and places it at the beginning. Selects the best candidate each pass.",
    color: {
      primary: "#2E86C1",
      gradient: "linear-gradient(135deg, #48DBFB, #0ABDE3)",
    },
  },
  insertion: {
    name: "Insertion Sort",
    time: { best: "O(n)", avg: "O(n²)", worst: "O(n²)" },
    space: "O(1)",
    stable: true,
    description:
      "Builds the sorted array one element at a time by inserting each element into its correct position, like sorting a hand of cards.",
    color: {
      primary: "#0F9B58",
      gradient: "linear-gradient(135deg, #55E6C1, #1DD1A1)",
    },
  },
  quick: {
    name: "Quick Sort",
    time: { best: "O(n log n)", avg: "O(n log n)", worst: "O(n²)" },
    space: "O(log n)",
    stable: false,
    description:
      "Picks a pivot, partitions elements around it (smaller left, larger right), then recursively sorts each side. The king of practical sorting.",
    color: {
      primary: "#8E44AD",
      gradient: "linear-gradient(135deg, #A29BFE, #6C5CE7)",
    },
  },
};

// ─── Bar Color Scheme ───────────────────────────────────────────────────────

const BAR_STATES = {
  default: {
    gradient: "linear-gradient(180deg, #CBD5E1, #94A3B8)",
    shadow: "0 2px 6px rgba(0,0,0,0.06)",
  },
  comparing: {
    gradient: "linear-gradient(180deg, #FBBF24, #F59E0B)",
    shadow: "0 0 18px rgba(251,191,36,0.45)",
  },
  swapping: {
    gradient: "linear-gradient(180deg, #F87171, #EF4444)",
    shadow: "0 0 18px rgba(239,68,68,0.45)",
  },
  sorted: {
    gradient: "linear-gradient(180deg, #34D399, #10B981)",
    shadow: "0 2px 10px rgba(16,185,129,0.25)",
  },
  pivot: {
    gradient: "linear-gradient(180deg, #C084FC, #A855F7)",
    shadow: "0 0 18px rgba(168,85,247,0.45)",
  },
  active: {
    gradient: "linear-gradient(180deg, #60A5FA, #3B82F6)",
    shadow: "0 0 18px rgba(59,130,246,0.4)",
  },
  minimum: {
    gradient: "linear-gradient(180deg, #FB923C, #F97316)",
    shadow: "0 0 18px rgba(249,115,22,0.45)",
  },
};

// ─── Step Generation: Bubble Sort ───────────────────────────────────────────

function generateBubbleSteps(inputArr) {
  const arr = [...inputArr];
  const n = arr.length;
  const steps = [];
  const sortedIndices = new Set();

  steps.push({
    array: [...arr],
    highlights: {},
    sortedSet: new Set(),
    title: "Start Bubble Sort",
    detail: `Array has ${n} elements. We'll make up to ${n - 1} passes, bubbling the largest unsorted element to the end each time.`,
  });

  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - 1 - i; j++) {
      // Compare step
      steps.push({
        array: [...arr],
        highlights: { [j]: "comparing", [j + 1]: "comparing" },
        sortedSet: new Set(sortedIndices),
        title: `Pass ${i + 1}: Compare`,
        detail: `Comparing arr[${j}]=${arr[j]} and arr[${j + 1}]=${arr[j + 1]}. ${arr[j] > arr[j + 1] ? `${arr[j]} > ${arr[j + 1]}, so we swap.` : "Already in order, move on."}`,
      });

      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swapped = true;
        steps.push({
          array: [...arr],
          highlights: { [j]: "swapping", [j + 1]: "swapping" },
          sortedSet: new Set(sortedIndices),
          title: `Pass ${i + 1}: Swap!`,
          detail: `Swapped → arr[${j}]=${arr[j]}, arr[${j + 1}]=${arr[j + 1]}. The larger value bubbles one position right.`,
        });
      }
    }
    sortedIndices.add(n - 1 - i);

    if (!swapped) {
      for (let k = 0; k < n - i; k++) sortedIndices.add(k);
      steps.push({
        array: [...arr],
        highlights: {},
        sortedSet: new Set(sortedIndices),
        title: `Early Termination!`,
        detail: `No swaps in pass ${i + 1} — the array is already sorted! This is the best-case O(n) optimization.`,
      });
      break;
    }

    steps.push({
      array: [...arr],
      highlights: { [n - 1 - i]: "sorted" },
      sortedSet: new Set(sortedIndices),
      title: `Pass ${i + 1} Complete`,
      detail: `Element ${arr[n - 1 - i]} has bubbled to its final position at index ${n - 1 - i}. ${n - 2 - i} unsorted elements remain.`,
    });
  }

  for (let k = 0; k < n; k++) sortedIndices.add(k);
  steps.push({
    array: [...arr],
    highlights: {},
    sortedSet: new Set(sortedIndices),
    title: "Bubble Sort Complete!",
    detail: `Sorted ${n} elements. Bubble Sort is simple but O(n²) — good for small or nearly-sorted arrays.`,
  });

  return steps;
}

// ─── Step Generation: Selection Sort ────────────────────────────────────────

function generateSelectionSteps(inputArr) {
  const arr = [...inputArr];
  const n = arr.length;
  const steps = [];
  const sortedIndices = new Set();

  steps.push({
    array: [...arr],
    highlights: {},
    sortedSet: new Set(),
    title: "Start Selection Sort",
    detail: `Array has ${n} elements. For each position i, we'll find the minimum in the unsorted portion [i..n-1] and swap it into position i.`,
  });

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;

    steps.push({
      array: [...arr],
      highlights: { [i]: "active", [minIdx]: "minimum" },
      sortedSet: new Set(sortedIndices),
      title: `Round ${i + 1}: Find Minimum`,
      detail: `Looking for the smallest element in positions [${i}..${n - 1}]. Starting with arr[${i}]=${arr[i]} as the current minimum.`,
    });

    for (let j = i + 1; j < n; j++) {
      steps.push({
        array: [...arr],
        highlights: { [i]: "active", [minIdx]: "minimum", [j]: "comparing" },
        sortedSet: new Set(sortedIndices),
        title: `Round ${i + 1}: Scanning`,
        detail: `Comparing arr[${j}]=${arr[j]} with current min arr[${minIdx}]=${arr[minIdx]}. ${arr[j] < arr[minIdx] ? `${arr[j]} < ${arr[minIdx]} — new minimum found!` : "Not smaller, continue."}`,
      });

      if (arr[j] < arr[minIdx]) {
        minIdx = j;
      }
    }

    if (minIdx !== i) {
      steps.push({
        array: [...arr],
        highlights: { [i]: "swapping", [minIdx]: "swapping" },
        sortedSet: new Set(sortedIndices),
        title: `Round ${i + 1}: Swap`,
        detail: `Minimum is arr[${minIdx}]=${arr[minIdx]}. Swapping with arr[${i}]=${arr[i]} to place it at position ${i}.`,
      });
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
    }

    sortedIndices.add(i);
    steps.push({
      array: [...arr],
      highlights: { [i]: "sorted" },
      sortedSet: new Set(sortedIndices),
      title: `Round ${i + 1} Complete`,
      detail: `Position ${i} now holds ${arr[i]} — its final sorted value. ${n - i - 2} positions remaining.`,
    });
  }

  sortedIndices.add(n - 1);
  steps.push({
    array: [...arr],
    highlights: {},
    sortedSet: new Set(sortedIndices),
    title: "Selection Sort Complete!",
    detail: `Sorted ${n} elements. Selection Sort always does O(n²) comparisons but only O(n) swaps — good when swaps are expensive.`,
  });

  return steps;
}

// ─── Step Generation: Insertion Sort ────────────────────────────────────────

function generateInsertionSteps(inputArr) {
  const arr = [...inputArr];
  const n = arr.length;
  const steps = [];
  const sortedIndices = new Set([0]);

  steps.push({
    array: [...arr],
    highlights: { 0: "sorted" },
    sortedSet: new Set(sortedIndices),
    title: "Start Insertion Sort",
    detail: `The first element [${arr[0]}] is trivially "sorted". We'll insert each remaining element into its correct position in the sorted portion.`,
  });

  for (let i = 1; i < n; i++) {
    const key = arr[i];

    steps.push({
      array: [...arr],
      highlights: { [i]: "active" },
      sortedSet: new Set(sortedIndices),
      title: `Insert Element ${i}`,
      detail: `Picking up arr[${i}]=${key}. We need to find where it belongs in the sorted portion [0..${i - 1}] and shift elements right to make room.`,
    });

    let j = i - 1;
    while (j >= 0 && arr[j] > key) {
      steps.push({
        array: [...arr],
        highlights: { [j]: "comparing", [j + 1]: "active" },
        sortedSet: new Set(sortedIndices),
        title: `Shifting Right`,
        detail: `arr[${j}]=${arr[j]} > ${key}, so shift arr[${j}] one position right to arr[${j + 1}].`,
      });

      arr[j + 1] = arr[j];
      j--;

      steps.push({
        array: [...arr],
        highlights: { [j + 1]: "swapping", [j + 2]: "swapping" },
        sortedSet: new Set(sortedIndices),
        title: `Shifted`,
        detail: `Shifted. ${j >= 0 ? `Next: compare with arr[${j}]=${arr[j]}.` : `Reached the beginning of the array.`}`,
      });
    }

    arr[j + 1] = key;
    sortedIndices.add(i);

    steps.push({
      array: [...arr],
      highlights: { [j + 1]: "sorted" },
      sortedSet: new Set(sortedIndices),
      title: `Inserted at Position ${j + 1}`,
      detail: `Placed ${key} at index ${j + 1}. The sorted portion [0..${i}] is now: [${arr.slice(0, i + 1).join(", ")}].`,
    });
  }

  steps.push({
    array: [...arr],
    highlights: {},
    sortedSet: new Set(sortedIndices),
    title: "Insertion Sort Complete!",
    detail: `Sorted ${n} elements. Insertion Sort is O(n) on nearly-sorted data and O(n²) worst case. Stable and in-place.`,
  });

  return steps;
}

// ─── Step Generation: Quick Sort ────────────────────────────────────────────

function generateQuickSteps(inputArr) {
  const arr = [...inputArr];
  const steps = [];
  const sortedIndices = new Set();

  steps.push({
    array: [...arr],
    highlights: {},
    sortedSet: new Set(),
    title: "Start Quick Sort",
    detail: `Array has ${arr.length} elements. We pick a pivot, partition so smaller elements go left and larger go right, then recurse on each side.`,
  });

  function qsort(lo, hi) {
    if (lo >= hi) {
      if (lo === hi) {
        sortedIndices.add(lo);
        steps.push({
          array: [...arr],
          highlights: { [lo]: "sorted" },
          sortedSet: new Set(sortedIndices),
          title: "Base Case",
          detail: `Single element arr[${lo}]=${arr[lo]} is already in its sorted position.`,
        });
      }
      return;
    }

    const pivotVal = arr[hi];
    steps.push({
      array: [...arr],
      highlights: { [hi]: "pivot" },
      sortedSet: new Set(sortedIndices),
      title: `Partition [${lo}..${hi}]`,
      detail: `Pivot = arr[${hi}] = ${pivotVal}. We'll rearrange so everything < ${pivotVal} is left and everything ≥ ${pivotVal} is right.`,
    });

    let i = lo - 1;
    for (let j = lo; j < hi; j++) {
      const hl = { [hi]: "pivot", [j]: "comparing" };
      if (i >= lo) hl[i] = "active";

      steps.push({
        array: [...arr],
        highlights: hl,
        sortedSet: new Set(sortedIndices),
        title: `Scanning: arr[${j}]=${arr[j]}`,
        detail: `Is arr[${j}]=${arr[j]} ≤ pivot ${pivotVal}? ${arr[j] <= pivotVal ? `Yes — swap into the "small" section.` : `No — leave it in the "large" section.`}`,
      });

      if (arr[j] <= pivotVal) {
        i++;
        if (i !== j) {
          [arr[i], arr[j]] = [arr[j], arr[i]];
          steps.push({
            array: [...arr],
            highlights: { [hi]: "pivot", [i]: "swapping", [j]: "swapping" },
            sortedSet: new Set(sortedIndices),
            title: `Swap arr[${i}] ↔ arr[${j}]`,
            detail: `Swapped ${arr[i]} and ${arr[j]} to grow the "small" partition.`,
          });
        }
      }
    }

    const pivotFinal = i + 1;
    if (pivotFinal !== hi) {
      [arr[pivotFinal], arr[hi]] = [arr[hi], arr[pivotFinal]];
    }
    sortedIndices.add(pivotFinal);

    steps.push({
      array: [...arr],
      highlights: { [pivotFinal]: "sorted" },
      sortedSet: new Set(sortedIndices),
      title: `Pivot Placed at Index ${pivotFinal}`,
      detail: `${pivotVal} is now at its final sorted position. Left: [${lo}..${pivotFinal - 1}], Right: [${pivotFinal + 1}..${hi}].`,
    });

    qsort(lo, pivotFinal - 1);
    qsort(pivotFinal + 1, hi);
  }

  qsort(0, arr.length - 1);

  for (let k = 0; k < arr.length; k++) sortedIndices.add(k);
  steps.push({
    array: [...arr],
    highlights: {},
    sortedSet: new Set(sortedIndices),
    title: "Quick Sort Complete!",
    detail: `Sorted ${arr.length} elements. Quick Sort averages O(n log n) — the fastest general-purpose sort in practice.`,
  });

  return steps;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const GENERATORS = {
  bubble: generateBubbleSteps,
  selection: generateSelectionSteps,
  insertion: generateInsertionSteps,
  quick: generateQuickSteps,
};

function parseInput(str) {
  try {
    const nums = str
      .split(",")
      .map((s) => {
        const n = parseInt(s.trim(), 10);
        if (isNaN(n)) throw new Error();
        return n;
      })
      .filter((_, i, a) => i < 20);
    if (nums.length < 2) return null;
    return nums;
  } catch {
    return null;
  }
}

function randomArray(size = 10, max = 50) {
  return Array.from(
    { length: size },
    () => Math.floor(Math.random() * max) + 1,
  );
}

// ─── Bar Component ──────────────────────────────────────────────────────────

function Bar({ value, maxVal, state, index, total }) {
  const heightPct = Math.max((value / maxVal) * 100, 8);
  const barStyle = BAR_STATES[state] || BAR_STATES.default;
  const width = Math.min(Math.max(100 / total - 1.5, 2), 48);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: `${width}%`,
        minWidth: 16,
        transition: "all 0.1s ease",
      }}
    >
      <span
        style={{
          fontSize: total > 14 ? 9 : 11,
          fontWeight: 700,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          color:
            state === "sorted"
              ? "#059669"
              : state === "default"
                ? "#94A3B8"
                : "#1E293B",
          marginBottom: 4,
          transition: "color 0.3s",
          opacity: total > 18 ? 0.7 : 1,
        }}
      >
        {value}
      </span>
      <div
        style={{
          width: "100%",
          height: `${heightPct}%`,
          minHeight: 12,
          background: barStyle.gradient,
          borderRadius: "6px 6px 3px 3px",
          boxShadow: barStyle.shadow,
          transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
          transform:
            state === "swapping"
              ? "scaleY(1.06)"
              : state === "comparing"
                ? "scaleY(1.03)"
                : "scaleY(1)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Shimmer effect on active bars */}
        {(state === "comparing" ||
          state === "swapping" ||
          state === "pivot") && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.2s linear infinite",
            }}
          />
        )}
      </div>
      <span
        style={{
          fontSize: 9,
          fontFamily: "'JetBrains Mono', monospace",
          color: "#CBD5E1",
          marginTop: 3,
          opacity: total > 16 ? 0 : 0.6,
        }}
      >
        {index}
      </span>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function SortingVisualizer() {
  const [algorithm, setAlgorithm] = useState("bubble");
  const [input, setInput] = useState("38, 27, 43, 3, 9, 82, 10");
  const [steps, setSteps] = useState([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(600);
  const [error, setError] = useState("");
  const timerRef = useRef(null);

  const step = steps[stepIdx] || null;
  const algo = ALGORITHMS[algorithm];
  const maxVal = useMemo(() => {
    if (!step) return 50;
    return Math.max(...step.array, 1);
  }, [step]);

  // Auto-play
  useEffect(() => {
    if (isPlaying && stepIdx < steps.length - 1) {
      timerRef.current = setTimeout(() => setStepIdx((s) => s + 1), speed);
      return () => clearTimeout(timerRef.current);
    } else if (isPlaying && stepIdx >= steps.length - 1) {
      setIsPlaying(false);
    }
  }, [isPlaying, stepIdx, steps.length, speed]);

  const handleStart = useCallback(() => {
    const parsed = parseInput(input);
    if (!parsed) {
      setError("Enter 2–20 comma-separated integers");
      return;
    }
    setError("");
    const newSteps = GENERATORS[algorithm](parsed);
    setSteps(newSteps);
    setStepIdx(0);
    setIsPlaying(false);
  }, [input, algorithm]);

  const handleRandom = () => {
    const arr = randomArray(10, 60);
    setInput(arr.join(", "));
    setError("");
  };

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

  // Determine bar state for each index
  const getBarState = (idx) => {
    if (!step) return "default";
    if (step.highlights[idx]) return step.highlights[idx];
    if (step.sortedSet && step.sortedSet.has(idx)) return "sorted";
    return "default";
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(160deg, #FFFBF5 0%, #FFFFFF 35%, #F0F6FF 65%, #FEFEFE 100%)",
        fontFamily: "'Outfit', 'Segoe UI', system-ui, sans-serif",
        padding: "20px 14px 40px",
        boxSizing: "border-box",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Outfit:wght@300;400;500;600;700;800;900&family=Fraunces:opsz,wght@9..144,700;9..144,900&display=swap');
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        * { box-sizing: border-box; }
        input:focus, button:focus-visible { outline: 2px solid #3B82F6; outline-offset: 2px; }
        button { cursor: pointer; border: none; font-family: inherit; }
        button:active { transform: scale(0.97) !important; }
        ::-webkit-scrollbar { height: 4px; }
        ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 4px; }
      `}</style>

      <div style={{ maxWidth: 940, margin: "0 auto" }}>
        {/* ═══ Header ═══════════════════════════════════════════════ */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 14,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: algo.color.gradient,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 4px 16px ${algo.color.primary}40`,
              fontSize: 21,
              transition: "all 0.4s",
            }}
          >
            ◐
          </div>
          <div>
            <h1
              style={{
                fontFamily: "'Fraunces', serif",
                fontSize: 30,
                fontWeight: 900,
                margin: 0,
                letterSpacing: "-0.5px",
                background: "linear-gradient(135deg, #1E293B, #475569)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Sorting Visualizer
            </h1>
            <p
              style={{
                fontSize: 13,
                color: "#94A3B8",
                margin: 0,
                fontWeight: 500,
              }}
            >
              Step-by-step algorithm animations
            </p>
          </div>
        </div>

        {/* ═══ Algorithm Selector ════════════════════════════════════ */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: 8,
            marginBottom: 16,
          }}
        >
          {Object.entries(ALGORITHMS).map(([key, a]) => {
            const isActive = algorithm === key;
            return (
              <button
                key={key}
                onClick={() => {
                  setAlgorithm(key);
                  if (steps.length) handleReset();
                }}
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  background: isActive ? a.color.gradient : "#fff",
                  color: isActive ? "#fff" : "#64748B",
                  fontWeight: 700,
                  fontSize: 13,
                  border: isActive ? "none" : "1.5px solid #E2E8F0",
                  boxShadow: isActive
                    ? `0 4px 16px ${a.color.primary}35`
                    : "0 1px 3px rgba(0,0,0,0.04)",
                  transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
                  transform: isActive ? "translateY(-1px)" : "none",
                }}
              >
                {a.name}
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
              "0 1px 3px rgba(0,0,0,0.04), 0 6px 24px rgba(0,0,0,0.03)",
            border: "1px solid #F1F5F9",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <div style={{ flex: 1, minWidth: 200 }}>
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
                Array Elements (comma-separated)
              </label>
              <input
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setError("");
                }}
                placeholder="38, 27, 43, 3, 9, 82, 10"
                onKeyDown={(e) => e.key === "Enter" && handleStart()}
                style={{
                  width: "100%",
                  padding: "9px 14px",
                  borderRadius: 10,
                  border: error ? "2px solid #EF4444" : "2px solid #E2E8F0",
                  fontSize: 14,
                  fontFamily: "'JetBrains Mono', monospace",
                  background: "#F8FAFC",
                  color: "#334155",
                  transition: "border 0.3s",
                }}
              />
              {error && (
                <p
                  style={{
                    color: "#EF4444",
                    fontSize: 12,
                    margin: "4px 0 0",
                    fontWeight: 500,
                  }}
                >
                  {error}
                </p>
              )}
            </div>
            <div
              style={{
                display: "flex",
                gap: 8,
                alignSelf: "flex-end",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={handleRandom}
                style={{
                  padding: "9px 16px",
                  borderRadius: 10,
                  background: "#F8FAFC",
                  color: "#64748B",
                  fontWeight: 600,
                  fontSize: 13,
                  border: "1.5px solid #E2E8F0",
                }}
              >
                🎲 Random
              </button>
              <button
                onClick={handleStart}
                style={{
                  padding: "9px 20px",
                  borderRadius: 10,
                  background: algo.color.gradient,
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 13,
                  boxShadow: `0 4px 14px ${algo.color.primary}30`,
                  transition: "transform 0.2s, box-shadow 0.2s",
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
            <span
              style={{
                fontSize: 10,
                color: "#94A3B8",
                fontWeight: 700,
                letterSpacing: 0.5,
              }}
            >
              TRY:
            </span>
            {[
              { label: "Nearly Sorted", val: "1, 2, 4, 3, 5, 7, 6, 8" },
              { label: "Reversed", val: "50, 40, 30, 20, 10" },
              { label: "Duplicates", val: "5, 3, 8, 3, 9, 1, 5, 8" },
              {
                label: "Large",
                val: "23, 7, 45, 12, 67, 3, 89, 34, 56, 1, 78, 22",
              },
            ].map((p) => (
              <button
                key={p.label}
                onClick={() => {
                  setInput(p.val);
                  setError("");
                }}
                style={{
                  padding: "3px 10px",
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 600,
                  background:
                    input === p.val ? `${algo.color.primary}12` : "#F8FAFC",
                  color: input === p.val ? algo.color.primary : "#94A3B8",
                  border:
                    input === p.val
                      ? `1px solid ${algo.color.primary}30`
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
                    ? "linear-gradient(135deg, #F87171, #EF4444)"
                    : algo.color.gradient,
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 13,
                  boxShadow: isPlaying
                    ? "0 3px 10px rgba(239,68,68,0.3)"
                    : `0 3px 10px ${algo.color.primary}30`,
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
                  min={80}
                  max={1500}
                  step={20}
                  value={1580 - speed}
                  onChange={(e) => setSpeed(1580 - Number(e.target.value))}
                  style={{ width: 70, accentColor: algo.color.primary }}
                />
              </div>
              <span
                style={{
                  fontSize: 12,
                  fontFamily: "'JetBrains Mono', monospace",
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
                  background: algo.color.gradient,
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
                  "0 1px 3px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.025)",
                border: "1px solid #F1F5F9",
                borderLeft: `4px solid ${algo.color.primary}`,
                marginBottom: 16,
                animation: "scaleIn 0.3s ease",
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
                    fontFamily: "'Fraunces', serif",
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
                      letterSpacing: 0.5,
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
                  lineHeight: 1.6,
                }}
              >
                {step.detail}
              </p>
            </div>

            {/* ═══ BAR CHART ═══════════════════════════════════════════ */}
            <div
              style={{
                background: "#fff",
                borderRadius: 16,
                padding: "20px 18px 16px",
                boxShadow:
                  "0 1px 3px rgba(0,0,0,0.04), 0 8px 30px rgba(0,0,0,0.03)",
                border: "1px solid #F1F5F9",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  gap: step.array.length > 14 ? 2 : 4,
                  height: 220,
                  padding: "0 4px",
                }}
              >
                {step.array.map((val, idx) => (
                  <Bar
                    key={idx}
                    value={val}
                    maxVal={maxVal}
                    state={getBarState(idx)}
                    index={idx}
                    total={step.array.length}
                  />
                ))}
              </div>
            </div>

            {/* ═══ Array State ═════════════════════════════════════════ */}
            <div
              style={{
                background: "#1E293B",
                borderRadius: 14,
                padding: "14px 18px",
                marginBottom: 16,
                overflowX: "auto",
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
                    background: "#F87171",
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
                    fontSize: 11,
                    color: "#475569",
                    fontFamily: "'JetBrains Mono', monospace",
                    marginLeft: 6,
                  }}
                >
                  array state
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 6,
                  flexWrap: "wrap",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                <span style={{ color: "#64748B" }}>[</span>
                {step.array.map((val, idx) => {
                  const st = getBarState(idx);
                  const colors = {
                    default: "#CBD5E1",
                    sorted: "#34D399",
                    comparing: "#FBBF24",
                    swapping: "#F87171",
                    pivot: "#C084FC",
                    active: "#60A5FA",
                    minimum: "#FB923C",
                  };
                  return (
                    <span
                      key={idx}
                      style={{
                        color: colors[st] || "#CBD5E1",
                        fontWeight: st !== "default" ? 700 : 400,
                        fontSize: 14,
                        transition: "color 0.3s",
                      }}
                    >
                      {val}
                      {idx < step.array.length - 1 ? "," : ""}
                    </span>
                  );
                })}
                <span style={{ color: "#64748B" }}>]</span>
              </div>
            </div>

            {/* ═══ Bottom Grid: Complexity + Legend ════════════════════ */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: 14,
              }}
            >
              {/* ── Complexity Card ── */}
              <div
                style={{
                  background: "#fff",
                  borderRadius: 14,
                  padding: "16px 18px",
                  boxShadow:
                    "0 1px 3px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.025)",
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
                  {algo.name} Complexity
                </h4>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 8,
                    marginBottom: 10,
                  }}
                >
                  {[
                    {
                      label: "BEST",
                      val: algo.time.best,
                      bg: "#ECFDF5",
                      color: "#059669",
                    },
                    {
                      label: "AVG",
                      val: algo.time.avg,
                      bg: "#EFF6FF",
                      color: "#2563EB",
                    },
                    {
                      label: "WORST",
                      val: algo.time.worst,
                      bg: "#FEF2F2",
                      color: "#DC2626",
                    },
                  ].map((c) => (
                    <div
                      key={c.label}
                      style={{
                        padding: "8px 6px",
                        borderRadius: 8,
                        background: c.bg,
                        textAlign: "center",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          color: c.color,
                          marginBottom: 2,
                        }}
                      >
                        {c.label}
                      </div>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 800,
                          color: c.color,
                          fontFamily: "'JetBrains Mono', monospace",
                        }}
                      >
                        {c.val}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <div
                    style={{
                      flex: 1,
                      padding: "6px 8px",
                      borderRadius: 8,
                      background: "#F5F3FF",
                      textAlign: "center",
                    }}
                  >
                    <span
                      style={{ fontSize: 9, fontWeight: 700, color: "#7C3AED" }}
                    >
                      SPACE{" "}
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 800,
                        color: "#7C3AED",
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      {algo.space}
                    </span>
                  </div>
                  <div
                    style={{
                      flex: 1,
                      padding: "6px 8px",
                      borderRadius: 8,
                      background: "#FFFBEB",
                      textAlign: "center",
                    }}
                  >
                    <span
                      style={{ fontSize: 9, fontWeight: 700, color: "#D97706" }}
                    >
                      STABLE{" "}
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 800,
                        color: "#D97706",
                      }}
                    >
                      {algo.stable ? "Yes ✓" : "No ✗"}
                    </span>
                  </div>
                </div>
              </div>

              {/* ── Legend Card ── */}
              <div
                style={{
                  background: "#fff",
                  borderRadius: 14,
                  padding: "16px 18px",
                  boxShadow:
                    "0 1px 3px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.025)",
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
                    { state: "default", label: "Unsorted" },
                    { state: "comparing", label: "Comparing" },
                    { state: "swapping", label: "Swapping" },
                    { state: "sorted", label: "Sorted / Final" },
                    { state: "pivot", label: "Pivot (Quick)" },
                    { state: "active", label: "Active / Pointer" },
                    { state: "minimum", label: "Current Min" },
                  ].map((item) => (
                    <div
                      key={item.state}
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <div
                        style={{
                          width: 20,
                          height: 12,
                          borderRadius: 3,
                          background: BAR_STATES[item.state].gradient,
                          boxShadow: BAR_STATES[item.state].shadow,
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
                </div>
              </div>
            </div>

            {/* ── Algorithm Description ── */}
            <div
              style={{
                marginTop: 14,
                padding: "14px 18px",
                borderRadius: 14,
                background: "linear-gradient(135deg, #F8FAFC, #F1F5F9)",
                border: "1px solid #E2E8F0",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 6,
                    background: algo.color.gradient,
                    color: "#fff",
                    letterSpacing: 0.5,
                  }}
                >
                  {algo.name.toUpperCase()}
                </span>
                <span
                  style={{ fontSize: 13, color: "#475569", lineHeight: 1.5 }}
                >
                  {algo.description}
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
              padding: "52px 20px",
              background: "#fff",
              borderRadius: 16,
              boxShadow:
                "0 1px 3px rgba(0,0,0,0.03), 0 8px 30px rgba(0,0,0,0.03)",
              border: "1px solid #F1F5F9",
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                margin: "0 auto 14px",
                background: algo.color.gradient,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 8px 24px ${algo.color.primary}25`,
                fontSize: 28,
                transition: "all 0.4s",
              }}
            >
              ▥
            </div>
            <h3
              style={{
                fontFamily: "'Fraunces', serif",
                fontSize: 22,
                fontWeight: 700,
                color: "#1E293B",
                margin: "0 0 6px",
              }}
            >
              Ready to Sort
            </h3>
            <p
              style={{
                fontSize: 14,
                color: "#94A3B8",
                maxWidth: 420,
                margin: "0 auto",
                lineHeight: 1.6,
              }}
            >
              Choose an algorithm above, enter your array, and hit{" "}
              <strong style={{ color: algo.color.primary }}>Visualize</strong>{" "}
              to watch sorting happen step by step.
            </p>

            {/* Quick comparison table */}
            <div
              style={{
                marginTop: 24,
                display: "inline-grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 1,
                background: "#E2E8F0",
                borderRadius: 12,
                overflow: "hidden",
                fontSize: 12,
                textAlign: "center",
              }}
            >
              {["Algorithm", "Average", "Space", "Stable"].map((h) => (
                <div
                  key={h}
                  style={{
                    background: "#F1F5F9",
                    padding: "8px 14px",
                    fontWeight: 700,
                    color: "#64748B",
                    fontSize: 10,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  {h}
                </div>
              ))}
              {Object.entries(ALGORITHMS)
                .map(([key, a]) => [
                  <div
                    key={`${key}-n`}
                    style={{
                      background: "#fff",
                      padding: "8px 12px",
                      fontWeight: 600,
                      color: a.color.primary,
                    }}
                  >
                    {a.name}
                  </div>,
                  <div
                    key={`${key}-t`}
                    style={{
                      background: "#fff",
                      padding: "8px 12px",
                      fontFamily: "'JetBrains Mono', monospace",
                      color: "#475569",
                      fontWeight: 500,
                    }}
                  >
                    {a.time.avg}
                  </div>,
                  <div
                    key={`${key}-s`}
                    style={{
                      background: "#fff",
                      padding: "8px 12px",
                      fontFamily: "'JetBrains Mono', monospace",
                      color: "#475569",
                      fontWeight: 500,
                    }}
                  >
                    {a.space}
                  </div>,
                  <div
                    key={`${key}-st`}
                    style={{
                      background: "#fff",
                      padding: "8px 12px",
                      color: a.stable ? "#059669" : "#DC2626",
                      fontWeight: 600,
                    }}
                  >
                    {a.stable ? "Yes" : "No"}
                  </div>,
                ])
                .flat()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
