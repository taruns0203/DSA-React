import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ═══════════════════════════════════════════════════════════════════════════
// Prefix Sums Visualizer — Multi-Mode, Step-by-Step, Interview-Demo Ready
// Self-contained React component. No external dependencies.
// Aesthetic: Earthy terracotta + sage green — "geological strata" concept.
// ═══════════════════════════════════════════════════════════════════════════

// ─── Mode Definitions ───────────────────────────────────────────────────────

const MODES = {
  build: {
    name: "Build Prefix Array",
    subtitle: "Construct cumulative sums",
    icon: "Σ",
    accent: "#B45309",
    gradient: "linear-gradient(135deg, #D97706, #B45309)",
    light: "#FFFBEB",
    time: "O(n)",
    space: "O(n)",
    desc: "Build P[i] = P[i-1] + arr[i-1] from left to right. Each prefix entry stores the cumulative sum of all preceding elements. P[0] = 0 is the sentinel.",
  },
  rangeQuery: {
    name: "Range Sum Query",
    subtitle: "Answer sum(i,j) in O(1)",
    icon: "⊟",
    accent: "#047857",
    gradient: "linear-gradient(135deg, #059669, #047857)",
    light: "#ECFDF5",
    time: "O(1) per query",
    space: "O(n)",
    desc: "After building the prefix array, any range sum is: sum(i, j) = P[j+1] − P[i]. Two lookups, one subtraction — constant time regardless of range size.",
  },
  subarrayK: {
    name: "Subarray Sum = K",
    subtitle: "Count subarrays via hash map",
    icon: "#",
    accent: "#7C2D12",
    gradient: "linear-gradient(135deg, #C2410C, #7C2D12)",
    light: "#FFF7ED",
    time: "O(n)",
    space: "O(n)",
    desc: "At each position, check if (prefixSum − k) exists in the hash map. If so, there's a subarray ending here with sum k. The sentinel {0:1} catches subarrays starting at index 0.",
  },
};

const DEFAULT_ARR = "3, 1, 4, 1, 5, 9";
const DEFAULT_QUERY = "1, 3";
const DEFAULT_K = "5";

// ─── Step Generators ────────────────────────────────────────────────────────

function genBuildSteps(arr) {
  const n = arr.length;
  const steps = [];
  const prefix = [0];

  steps.push({
    arr: [...arr],
    prefix: [0],
    builtUpTo: 0,
    activeArr: -1,
    activePrefix: 0,
    hl: {},
    prefixHl: { 0: "sentinel" },
    title: "Initialize Sentinel",
    detail: `P[0] = 0 — the sentinel. It represents the sum of zero elements. This eliminates special-casing when a range starts at index 0.`,
    formula: "P[0] = 0",
  });

  for (let i = 1; i <= n; i++) {
    const val = prefix[i - 1] + arr[i - 1];
    prefix.push(val);

    const pHl = {};
    for (let j = 0; j <= i; j++)
      pHl[j] = j === i ? "building" : j === i - 1 ? "source" : "done";

    steps.push({
      arr: [...arr],
      prefix: [...prefix],
      builtUpTo: i,
      activeArr: i - 1,
      activePrefix: i,
      hl: { [i - 1]: "active" },
      prefixHl: pHl,
      title: `Build P[${i}]`,
      detail: `P[${i}] = P[${i - 1}] + arr[${i - 1}] = ${prefix[i - 1]} + ${arr[i - 1]} = ${val}. This stores the sum of elements arr[0..${i - 1}].`,
      formula: `P[${i}] = ${prefix[i - 1]} + ${arr[i - 1]} = ${val}`,
    });
  }

  const allDone = {};
  for (let j = 0; j <= n; j++) allDone[j] = "done";
  steps.push({
    arr: [...arr],
    prefix: [...prefix],
    builtUpTo: n,
    activeArr: -1,
    activePrefix: -1,
    hl: {},
    prefixHl: allDone,
    title: "Prefix Array Complete!",
    detail: `Built in O(n). Now any range sum query is O(1): sum(i,j) = P[j+1] − P[i]. The array P = [${prefix.join(", ")}].`,
    formula: "sum(i, j) = P[j+1] − P[i]",
  });

  return steps;
}

function genRangeSteps(arr, qLeft, qRight) {
  const n = arr.length;
  const prefix = [0];
  for (let i = 0; i < n; i++) prefix.push(prefix[i] + arr[i]);

  const steps = [];

  // Show pre-built prefix
  const allDone = {};
  for (let j = 0; j <= n; j++) allDone[j] = "done";
  steps.push({
    arr: [...arr],
    prefix: [...prefix],
    hl: {},
    prefixHl: allDone,
    qLeft,
    qRight,
    phase: "ready",
    title: "Prefix Array Ready",
    detail: `P = [${prefix.join(", ")}]. We want sum(${qLeft}, ${qRight}) — the sum of arr[${qLeft}..${qRight}].`,
    formula: `sum(${qLeft}, ${qRight}) = P[${qRight + 1}] − P[${qLeft}]`,
  });

  // Highlight the range in original array
  const rangeHl = {};
  for (let j = qLeft; j <= qRight; j++) rangeHl[j] = "inRange";
  steps.push({
    arr: [...arr],
    prefix: [...prefix],
    hl: rangeHl,
    prefixHl: allDone,
    qLeft,
    qRight,
    phase: "showRange",
    title: `Query: sum(${qLeft}, ${qRight})`,
    detail: `We need the sum of the highlighted elements: [${arr.slice(qLeft, qRight + 1).join(", ")}]. Brute force would sum them one by one in O(k). With prefix sums, it's O(1).`,
    formula: `arr[${qLeft}..${qRight}] = [${arr.slice(qLeft, qRight + 1).join(", ")}]`,
  });

  // Show P[j+1]
  const pHl1 = { ...allDone, [qRight + 1]: "queryRight" };
  steps.push({
    arr: [...arr],
    prefix: [...prefix],
    hl: rangeHl,
    prefixHl: pHl1,
    qLeft,
    qRight,
    phase: "lookupRight",
    title: `Lookup P[${qRight + 1}] = ${prefix[qRight + 1]}`,
    detail: `P[${qRight + 1}] = ${prefix[qRight + 1]} — this is the sum of all elements from arr[0] to arr[${qRight}].`,
    formula: `P[${qRight + 1}] = ${prefix[qRight + 1]}`,
  });

  // Show P[i]
  const pHl2 = { ...allDone, [qRight + 1]: "queryRight", [qLeft]: "queryLeft" };
  steps.push({
    arr: [...arr],
    prefix: [...prefix],
    hl: rangeHl,
    prefixHl: pHl2,
    qLeft,
    qRight,
    phase: "lookupLeft",
    title: `Lookup P[${qLeft}] = ${prefix[qLeft]}`,
    detail: `P[${qLeft}] = ${prefix[qLeft]} — this is the sum of elements arr[0] to arr[${qLeft - 1}] (the part we DON'T want).`,
    formula: `P[${qLeft}] = ${prefix[qLeft]}`,
  });

  // Subtraction
  const result = prefix[qRight + 1] - prefix[qLeft];
  steps.push({
    arr: [...arr],
    prefix: [...prefix],
    hl: rangeHl,
    prefixHl: pHl2,
    qLeft,
    qRight,
    phase: "subtract",
    title: `Result: ${prefix[qRight + 1]} − ${prefix[qLeft]} = ${result}`,
    detail: `sum(${qLeft}, ${qRight}) = P[${qRight + 1}] − P[${qLeft}] = ${prefix[qRight + 1]} − ${prefix[qLeft]} = ${result}. Verified: ${arr.slice(qLeft, qRight + 1).join(" + ")} = ${result}. One subtraction — O(1)!`,
    formula: `${prefix[qRight + 1]} − ${prefix[qLeft]} = ${result}`,
    result,
  });

  return steps;
}

function genSubarrayKSteps(arr, k) {
  const n = arr.length;
  const steps = [];
  const map = new Map([[0, 1]]);
  let prefix = 0,
    count = 0;

  steps.push({
    arr: [...arr],
    prefixSum: 0,
    k,
    map: new Map([[0, 1]]),
    count: 0,
    hl: {},
    activeIdx: -1,
    phase: "init",
    title: "Initialize Hash Map",
    detail: `Set prefixSum = 0, count = 0, and map = {0: 1}. The sentinel {0: 1} means "the empty prefix sum of 0 has been seen once." This catches subarrays starting at index 0.`,
    formula: "map = {0: 1}",
    found: false,
  });

  for (let i = 0; i < n; i++) {
    prefix += arr[i];
    const complement = prefix - k;
    const foundCount = map.get(complement) || 0;

    // Check step
    const hl = {};
    for (let j = 0; j <= i; j++) hl[j] = j === i ? "active" : "scanned";

    steps.push({
      arr: [...arr],
      prefixSum: prefix,
      k,
      map: new Map(map),
      count,
      complement,
      hl,
      activeIdx: i,
      phase: "check",
      title: `Index ${i}: Check Complement`,
      detail: `Added arr[${i}]=${arr[i]}. prefixSum = ${prefix}. Complement = ${prefix} − ${k} = ${complement}. ${foundCount > 0 ? `Found ${complement} in map ${foundCount} time(s) → ${foundCount} new subarray(s)!` : `${complement} not in map — no new subarrays ending here.`}`,
      formula: `complement = ${prefix} − ${k} = ${complement}`,
      found: foundCount > 0,
      foundCount,
    });

    if (foundCount > 0) {
      count += foundCount;
      steps.push({
        arr: [...arr],
        prefixSum: prefix,
        k,
        map: new Map(map),
        count,
        complement,
        hl,
        activeIdx: i,
        phase: "found",
        title: `+${foundCount} Subarray(s) Found!`,
        detail: `count += ${foundCount} → count = ${count}. Each occurrence of complement ${complement} in the map represents a starting index where the subarray from there to index ${i} sums to ${k}.`,
        formula: `count = ${count}`,
        found: true,
        foundCount,
      });
    }

    // Insert step
    map.set(prefix, (map.get(prefix) || 0) + 1);
    steps.push({
      arr: [...arr],
      prefixSum: prefix,
      k,
      map: new Map(map),
      count,
      hl,
      activeIdx: i,
      phase: "insert",
      title: `Record prefixSum = ${prefix}`,
      detail: `Added ${prefix} to the map. Map now has ${map.size} unique prefix sum values. This enables future positions to find subarrays ending at them.`,
      formula: `map[${prefix}] = ${map.get(prefix)}`,
      found: false,
    });
  }

  steps.push({
    arr: [...arr],
    prefixSum: prefix,
    k,
    map: new Map(map),
    count,
    hl: {},
    activeIdx: -1,
    phase: "done",
    title: `Complete! Count = ${count}`,
    detail: `Found ${count} subarray(s) with sum = ${k}. Single O(n) pass with O(n) space for the hash map. Works with negative numbers — sliding window cannot do this.`,
    formula: `Total subarrays with sum ${k}: ${count}`,
    found: false,
  });

  return steps;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function parseArr(s) {
  try {
    const a = s.split(",").map((x) => {
      const n = parseInt(x.trim(), 10);
      if (isNaN(n)) throw 0;
      return n;
    });
    return a.length >= 2 ? a.slice(0, 16) : null;
  } catch {
    return null;
  }
}

function parseQuery(s) {
  try {
    const p = s.split(",").map((x) => parseInt(x.trim(), 10));
    return p.length === 2 && !isNaN(p[0]) && !isNaN(p[1]) ? p : null;
  } catch {
    return null;
  }
}

// ─── Cell Colors ────────────────────────────────────────────────────────────

const CELL_COLORS = {
  idle: { bg: "#F5F0EB", border: "#D6CFC7", text: "#78716C" },
  active: { bg: "#FEF3C7", border: "#F59E0B", text: "#92400E" },
  scanned: { bg: "#E7E2DC", border: "#C4BAB0", text: "#78716C" },
  inRange: { bg: "#D1FAE5", border: "#10B981", text: "#065F46" },
  sentinel: { bg: "#FEE2E2", border: "#F87171", text: "#991B1B" },
  done: { bg: "#ECFDF5", border: "#34D399", text: "#047857" },
  building: { bg: "#FDE68A", border: "#D97706", text: "#78350F" },
  source: { bg: "#BFDBFE", border: "#3B82F6", text: "#1E3A5F" },
  queryLeft: { bg: "#FECACA", border: "#EF4444", text: "#991B1B" },
  queryRight: { bg: "#BBF7D0", border: "#22C55E", text: "#14532D" },
};

// ─── Array Row Component ────────────────────────────────────────────────────

function ArrayRow({ label, values, highlights, labelColor, total }) {
  const size = total > 10 ? 46 : total > 7 ? 54 : 62;
  return (
    <div style={{ marginBottom: 8 }}>
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: labelColor || "#A8A29E",
          textTransform: "uppercase",
          letterSpacing: 1.3,
          marginBottom: 6,
          fontFamily: "'Victor Mono', monospace",
        }}
      >
        {label}
      </div>
      <div
        style={{
          display: "flex",
          gap: total > 10 ? 4 : 6,
          flexWrap: "nowrap",
          overflowX: "auto",
          paddingBottom: 4,
        }}
      >
        {values.map((val, idx) => {
          const state = (highlights && highlights[idx]) || "idle";
          const c = CELL_COLORS[state] || CELL_COLORS.idle;
          return (
            <div
              key={idx}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: size,
                  height: size,
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: c.bg,
                  border: `2.5px solid ${c.border}`,
                  transition: "all 0.4s cubic-bezier(0.4,0,0.2,1)",
                  boxShadow:
                    state === "building" ||
                    state === "active" ||
                    state === "queryLeft" ||
                    state === "queryRight"
                      ? `0 0 0 3px ${c.border}30, 0 4px 12px ${c.border}20`
                      : state === "inRange"
                        ? "0 0 0 3px #10B98125, 0 4px 12px #10B98115"
                        : "0 1px 3px rgba(0,0,0,0.04)",
                  transform:
                    state === "building" || state === "active"
                      ? "scale(1.07)"
                      : "scale(1)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {(state === "building" ||
                  state === "queryLeft" ||
                  state === "queryRight") && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(135deg, rgba(255,255,255,0.5), transparent 60%)",
                      borderRadius: 8,
                    }}
                  />
                )}
                <span
                  style={{
                    fontSize: total > 10 ? 13 : 16,
                    fontWeight: 800,
                    color: c.text,
                    fontFamily: "'Victor Mono', monospace",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  {val}
                </span>
              </div>
              <span
                style={{
                  fontSize: 9,
                  color: "#A8A29E",
                  fontFamily: "'Victor Mono', monospace",
                  fontWeight: 500,
                }}
              >
                {idx}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Hash Map Display ───────────────────────────────────────────────────────

function HashMapDisplay({ map, complement, found }) {
  if (!map) return null;
  const entries = [...map.entries()].sort((a, b) => a[0] - b[0]);

  return (
    <div
      style={{
        background: "#292524",
        borderRadius: 14,
        padding: "14px 18px",
        marginBottom: 14,
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
            marginLeft: 6,
            fontSize: 11,
            color: "#57534E",
            fontFamily: "'Victor Mono', monospace",
          }}
        >
          prefixSum → frequency
        </span>
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {entries.map(([key, val]) => {
          const isComplement = key === complement;
          return (
            <div
              key={key}
              style={{
                padding: "6px 12px",
                borderRadius: 8,
                background:
                  isComplement && found
                    ? "linear-gradient(135deg, #F59E0B, #D97706)"
                    : isComplement
                      ? "#44403C"
                      : "#1C1917",
                border:
                  isComplement && found
                    ? "2px solid #FBBF24"
                    : isComplement
                      ? "2px solid #78716C"
                      : "1.5px solid #44403C",
                transition: "all 0.35s",
                transform: isComplement && found ? "scale(1.08)" : "scale(1)",
                boxShadow:
                  isComplement && found ? "0 0 12px #F59E0B40" : "none",
              }}
            >
              <span
                style={{
                  fontFamily: "'Victor Mono', monospace",
                  fontSize: 13,
                  color: isComplement && found ? "#fff" : "#A8A29E",
                  fontWeight: 600,
                }}
              >
                {key}
                <span
                  style={{
                    color: isComplement && found ? "#FEF3C7" : "#57534E",
                    margin: "0 4px",
                  }}
                >
                  :
                </span>
                <span
                  style={{
                    color: isComplement && found ? "#fff" : "#D6D3D1",
                    fontWeight: 700,
                  }}
                >
                  {val}
                </span>
              </span>
            </div>
          );
        })}
      </div>
      {complement !== undefined && (
        <div
          style={{
            marginTop: 8,
            fontSize: 11,
            fontFamily: "'Victor Mono', monospace",
            color: found ? "#FBBF24" : "#78716C",
          }}
        >
          Looking for complement: <strong>{complement}</strong>
          {found ? " → FOUND ✓" : " → not found"}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function PrefixSumsVisualizer() {
  const [mode, setMode] = useState("build");
  const [input, setInput] = useState(DEFAULT_ARR);
  const [queryInput, setQueryInput] = useState(DEFAULT_QUERY);
  const [kInput, setKInput] = useState(DEFAULT_K);
  const [steps, setSteps] = useState([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(900);
  const [error, setError] = useState("");
  const timerRef = useRef(null);

  const md = MODES[mode];
  const step = steps[stepIdx] || null;

  useEffect(() => {
    if (isPlaying && stepIdx < steps.length - 1) {
      timerRef.current = setTimeout(() => setStepIdx((s) => s + 1), speed);
      return () => clearTimeout(timerRef.current);
    } else if (isPlaying) setIsPlaying(false);
  }, [isPlaying, stepIdx, steps.length, speed]);

  const handleStart = useCallback(() => {
    const arr = parseArr(input);
    if (!arr) {
      setError("Enter 2–16 comma-separated integers");
      return;
    }
    setError("");
    let s;
    if (mode === "build") {
      s = genBuildSteps(arr);
    } else if (mode === "rangeQuery") {
      const q = parseQuery(queryInput);
      if (!q || q[0] < 0 || q[1] >= arr.length || q[0] > q[1]) {
        setError(`Query indices must be valid: 0 ≤ i ≤ j < ${arr.length}`);
        return;
      }
      s = genRangeSteps(arr, q[0], q[1]);
    } else {
      const k = parseInt(kInput, 10);
      if (isNaN(k)) {
        setError("k must be an integer");
        return;
      }
      s = genSubarrayKSteps(arr, k);
    }
    setSteps(s);
    setStepIdx(0);
    setIsPlaying(false);
  }, [input, mode, queryInput, kInput]);

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

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(160deg, #FEFBF6 0%, #FFFFFF 30%, #FBF7F0 55%, #F5F0EB 100%)",
        fontFamily: "'Sora', 'Segoe UI', system-ui, sans-serif",
        padding: "22px 14px 48px",
        boxSizing: "border-box",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bitter:wght@400;700;900&family=Sora:wght@300;400;500;600;700;800&family=Victor+Mono:wght@400;500;600;700&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes popIn { from { opacity:0; transform:scale(0.9); } to { opacity:1; transform:scale(1); } }
        @keyframes glowPulse { 0%,100%{box-shadow:0 0 0 0 rgba(217,119,6,0.2)} 50%{box-shadow:0 0 0 8px rgba(217,119,6,0)} }
        * { box-sizing:border-box; }
        input:focus { outline:2px solid #B45309; outline-offset:1px; }
        button { cursor:pointer; border:none; font-family:inherit; }
        button:active { transform:scale(0.97)!important; }
        ::-webkit-scrollbar { height:4px; } ::-webkit-scrollbar-thumb { background:#D6CFC7; border-radius:4px; }
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
              borderRadius: 12,
              background: md.gradient,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 6px 20px ${md.accent}30`,
              fontSize: 22,
              color: "#fff",
              fontWeight: 700,
              transition: "all 0.4s",
              fontFamily: "'Victor Mono', monospace",
            }}
          >
            {md.icon}
          </div>
          <div>
            <h1
              style={{
                fontFamily: "'Bitter', serif",
                fontSize: 28,
                fontWeight: 900,
                margin: 0,
                letterSpacing: "-0.3px",
                background: "linear-gradient(135deg, #44403C, #78716C)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Prefix Sums
            </h1>
            <p
              style={{
                fontSize: 13,
                color: "#A8A29E",
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
            gridTemplateColumns: "repeat(auto-fit, minmax(155px, 1fr))",
            gap: 8,
            marginBottom: 16,
          }}
        >
          {Object.entries(MODES).map(([key, m]) => {
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
                  background: active ? m.gradient : "#fff",
                  color: active ? "#fff" : "#78716C",
                  border: active ? "none" : "1.5px solid #E7E5E4",
                  boxShadow: active
                    ? `0 5px 18px ${m.accent}30`
                    : "0 1px 3px rgba(0,0,0,0.04)",
                  transition: "all 0.3s",
                  transform: active ? "translateY(-1px)" : "none",
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>
                  {m.name}
                </div>
                <div style={{ fontSize: 10, opacity: 0.8, fontWeight: 500 }}>
                  {m.subtitle}
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
              "0 1px 3px rgba(0,0,0,0.03), 0 6px 24px rgba(0,0,0,0.02)",
            border: "1px solid #F5F0EB",
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
                  color: "#A8A29E",
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
                placeholder="3, 1, 4, 1, 5, 9"
                onKeyDown={(e) => e.key === "Enter" && handleStart()}
                style={{
                  width: "100%",
                  padding: "9px 13px",
                  borderRadius: 10,
                  border: error ? "2px solid #EF4444" : "2px solid #E7E5E4",
                  fontSize: 14,
                  fontFamily: "'Victor Mono', monospace",
                  background: "#FAFAF9",
                  color: "#44403C",
                }}
              />
            </div>

            {mode === "rangeQuery" && (
              <div style={{ minWidth: 90 }}>
                <label
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#A8A29E",
                    textTransform: "uppercase",
                    letterSpacing: 1.2,
                    display: "block",
                    marginBottom: 5,
                  }}
                >
                  i, j (range)
                </label>
                <input
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  placeholder="1, 3"
                  style={{
                    width: "100%",
                    padding: "9px 13px",
                    borderRadius: 10,
                    border: "2px solid #E7E5E4",
                    fontSize: 14,
                    fontFamily: "'Victor Mono', monospace",
                    background: "#FAFAF9",
                    color: "#44403C",
                  }}
                />
              </div>
            )}

            {mode === "subarrayK" && (
              <div style={{ minWidth: 70 }}>
                <label
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#A8A29E",
                    textTransform: "uppercase",
                    letterSpacing: 1.2,
                    display: "block",
                    marginBottom: 5,
                  }}
                >
                  k (target)
                </label>
                <input
                  value={kInput}
                  onChange={(e) => setKInput(e.target.value)}
                  placeholder="5"
                  style={{
                    width: "100%",
                    padding: "9px 13px",
                    borderRadius: 10,
                    border: "2px solid #E7E5E4",
                    fontSize: 14,
                    fontFamily: "'Victor Mono', monospace",
                    background: "#FAFAF9",
                    color: "#44403C",
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
                  background: md.gradient,
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 13,
                  boxShadow: `0 4px 14px ${md.accent}30`,
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

          <div
            style={{
              display: "flex",
              gap: 6,
              marginTop: 10,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 10, color: "#A8A29E", fontWeight: 700 }}>
              TRY:
            </span>
            {(mode === "build"
              ? [
                  { label: "Classic", v: "3, 1, 4, 1, 5, 9" },
                  { label: "Negatives", v: "2, -1, 3, -2, 4" },
                  { label: "Zeros", v: "0, 5, 0, 3, 0, 2" },
                ]
              : mode === "rangeQuery"
                ? [
                    { label: "Middle", v: "3, 1, 4, 1, 5, 9", q: "1, 3" },
                    { label: "Full Range", v: "3, 1, 4, 1, 5, 9", q: "0, 5" },
                    { label: "Single", v: "3, 1, 4, 1, 5, 9", q: "2, 2" },
                  ]
                : [
                    { label: "k=5", v: "3, 1, 4, 1, 5, 9", k: "5" },
                    { label: "k=0 (neg)", v: "1, -1, 2, -2, 3, -3", k: "0" },
                    { label: "k=3", v: "1, 2, 1, -1, 1, 2", k: "3" },
                  ]
            ).map((p, i) => (
              <button
                key={i}
                onClick={() => {
                  setInput(p.v);
                  if (p.q) setQueryInput(p.q);
                  if (p.k) setKInput(p.k);
                  setError("");
                }}
                style={{
                  padding: "3px 10px",
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 600,
                  background: input === p.v ? md.light : "#FAFAF9",
                  color: input === p.v ? md.accent : "#A8A29E",
                  border:
                    input === p.v
                      ? `1px solid ${md.accent}30`
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
            {/* Playback Controls */}
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
                  background: stepIdx === 0 ? "#F5F0EB" : "#fff",
                  color: stepIdx === 0 ? "#D6CFC7" : "#78716C",
                  fontWeight: 700,
                  fontSize: 14,
                  border: "1.5px solid #E7E5E4",
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
                  background: stepIdx === 0 ? "#F5F0EB" : "#fff",
                  color: stepIdx === 0 ? "#D6CFC7" : "#78716C",
                  fontWeight: 700,
                  fontSize: 16,
                  border: "1.5px solid #E7E5E4",
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
                    ? "linear-gradient(135deg, #F87171, #DC2626)"
                    : md.gradient,
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 13,
                  boxShadow: isPlaying
                    ? "0 3px 10px #DC262630"
                    : `0 3px 10px ${md.accent}30`,
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
                  background: stepIdx >= steps.length - 1 ? "#F5F0EB" : "#fff",
                  color: stepIdx >= steps.length - 1 ? "#D6CFC7" : "#78716C",
                  fontWeight: 700,
                  fontSize: 16,
                  border: "1.5px solid #E7E5E4",
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
                  background: stepIdx >= steps.length - 1 ? "#F5F0EB" : "#fff",
                  color: stepIdx >= steps.length - 1 ? "#D6CFC7" : "#78716C",
                  fontWeight: 700,
                  fontSize: 14,
                  border: "1.5px solid #E7E5E4",
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
                  style={{ fontSize: 10, color: "#A8A29E", fontWeight: 700 }}
                >
                  SPEED
                </span>
                <input
                  type="range"
                  min={100}
                  max={1800}
                  step={25}
                  value={1900 - speed}
                  onChange={(e) => setSpeed(1900 - Number(e.target.value))}
                  style={{ width: 70, accentColor: md.accent }}
                />
              </div>
              <span
                style={{
                  fontSize: 12,
                  fontFamily: "'Victor Mono', monospace",
                  color: "#A8A29E",
                  fontWeight: 500,
                }}
              >
                {stepIdx + 1}/{steps.length}
              </span>
            </div>

            {/* Progress Bar */}
            <div
              style={{
                height: 4,
                borderRadius: 2,
                background: "#F5F0EB",
                marginBottom: 16,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  borderRadius: 2,
                  width: `${((stepIdx + 1) / steps.length) * 100}%`,
                  background: md.gradient,
                  transition: "width 0.35s ease",
                }}
              />
            </div>

            {/* Explanation Card */}
            <div
              style={{
                background: "#fff",
                borderRadius: 14,
                padding: "14px 18px",
                boxShadow:
                  "0 1px 3px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.02)",
                border: "1px solid #F5F0EB",
                borderLeft: `4px solid ${md.accent}`,
                marginBottom: 16,
                animation: "popIn 0.3s ease",
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
                    fontFamily: "'Bitter', serif",
                    color: "#292524",
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
                {step.found && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: 6,
                      background: "#FEF3C7",
                      color: "#B45309",
                      animation: "glowPulse 1.5s ease infinite",
                    }}
                  >
                    MATCH
                  </span>
                )}
              </div>
              <p
                style={{
                  margin: "6px 0 0",
                  fontSize: 13.5,
                  color: "#57534E",
                  lineHeight: 1.65,
                }}
              >
                {step.detail}
              </p>
              {step.formula && (
                <div
                  style={{
                    marginTop: 8,
                    padding: "8px 14px",
                    borderRadius: 8,
                    background: "#FAFAF9",
                    border: "1px solid #E7E5E4",
                    fontFamily: "'Victor Mono', monospace",
                    fontSize: 14,
                    color: "#44403C",
                    fontWeight: 600,
                    display: "inline-block",
                  }}
                >
                  {step.formula}
                </div>
              )}
            </div>

            {/* ═══ Array Visualization ══════════════════════════════ */}
            <div
              style={{
                background: "#fff",
                borderRadius: 16,
                padding: "20px 22px 16px",
                boxShadow:
                  "0 1px 3px rgba(0,0,0,0.03), 0 8px 30px rgba(0,0,0,0.02)",
                border: "1px solid #F5F0EB",
                marginBottom: 16,
                overflowX: "auto",
              }}
            >
              {/* Original array */}
              <ArrayRow
                label="arr[]"
                values={step.arr}
                highlights={step.hl}
                labelColor="#78716C"
                total={step.arr.length}
              />

              {/* Connection arrow */}
              {(mode === "build" || mode === "rangeQuery") && step.prefix && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "4px 0",
                    color: "#D6CFC7",
                    fontSize: 16,
                  }}
                >
                  ↓ cumulative sum ↓
                </div>
              )}

              {/* Prefix sum array */}
              {(mode === "build" || mode === "rangeQuery") && step.prefix && (
                <ArrayRow
                  label={`P[] — prefix sums (length ${step.prefix.length})`}
                  values={step.prefix}
                  highlights={step.prefixHl}
                  labelColor={md.accent}
                  total={step.prefix.length}
                />
              )}

              {/* Range query bracket visualization */}
              {mode === "rangeQuery" && step.phase === "subtract" && (
                <div
                  style={{
                    marginTop: 8,
                    padding: "12px 16px",
                    borderRadius: 10,
                    background: "linear-gradient(135deg, #ECFDF5, #F0FDF4)",
                    border: "1px solid #BBF7D020",
                    textAlign: "center",
                    animation: "popIn 0.4s ease",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Victor Mono', monospace",
                      fontSize: 20,
                      fontWeight: 800,
                      color: "#047857",
                    }}
                  >
                    <span style={{ color: "#22C55E" }}>
                      P[{step.qRight + 1}]
                    </span>
                    <span style={{ color: "#78716C", margin: "0 8px" }}>−</span>
                    <span style={{ color: "#EF4444" }}>P[{step.qLeft}]</span>
                    <span style={{ color: "#78716C", margin: "0 8px" }}>=</span>
                    <span style={{ color: "#22C55E" }}>
                      {step.prefix[step.qRight + 1]}
                    </span>
                    <span style={{ color: "#78716C", margin: "0 8px" }}>−</span>
                    <span style={{ color: "#EF4444" }}>
                      {step.prefix[step.qLeft]}
                    </span>
                    <span style={{ color: "#78716C", margin: "0 8px" }}>=</span>
                    <span
                      style={{
                        background: md.gradient,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        fontSize: 24,
                      }}
                    >
                      {step.result}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Hash Map (subarrayK mode) */}
            {mode === "subarrayK" && step.map && (
              <HashMapDisplay
                map={step.map}
                complement={step.complement}
                found={step.found}
              />
            )}

            {/* Running State for subarrayK */}
            {mode === "subarrayK" &&
              step.phase !== "init" &&
              step.phase !== "done" && (
                <div
                  style={{
                    background: "#292524",
                    borderRadius: 14,
                    padding: "12px 18px",
                    marginBottom: 14,
                    display: "flex",
                    gap: 20,
                    flexWrap: "wrap",
                    fontFamily: "'Victor Mono', monospace",
                    fontSize: 13,
                  }}
                >
                  <div>
                    <span style={{ color: "#78716C" }}>prefixSum: </span>
                    <span style={{ color: "#67E8F9", fontWeight: 700 }}>
                      {step.prefixSum}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: "#78716C" }}>k: </span>
                    <span style={{ color: "#FBBF24", fontWeight: 700 }}>
                      {step.k}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: "#78716C" }}>complement: </span>
                    <span
                      style={{
                        color: step.found ? "#FBBF24" : "#A8A29E",
                        fontWeight: 700,
                      }}
                    >
                      {step.complement ?? "—"}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: "#78716C" }}>count: </span>
                    <span style={{ color: "#34D399", fontWeight: 700 }}>
                      {step.count}
                    </span>
                  </div>
                </div>
              )}

            {/* ═══ Bottom Grid ════════════════════════════════════════ */}
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
                  border: "1px solid #F5F0EB",
                }}
              >
                <h4
                  style={{
                    margin: "0 0 10px",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#A8A29E",
                    textTransform: "uppercase",
                    letterSpacing: 1.2,
                  }}
                >
                  Complexity — {md.name}
                </h4>
                <div style={{ display: "flex", gap: 10 }}>
                  <div
                    style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: 10,
                      background: "#FFFBEB",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: "#B45309",
                        marginBottom: 2,
                      }}
                    >
                      TIME
                    </div>
                    <div
                      style={{
                        fontSize: 20,
                        fontWeight: 800,
                        color: "#78350F",
                        fontFamily: "'Victor Mono', monospace",
                      }}
                    >
                      {md.time}
                    </div>
                    <div
                      style={{ fontSize: 10, color: "#D97706", marginTop: 2 }}
                    >
                      {mode === "rangeQuery"
                        ? "after O(n) build"
                        : "single pass"}
                    </div>
                  </div>
                  <div
                    style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: 10,
                      background: "#ECFDF5",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: "#047857",
                        marginBottom: 2,
                      }}
                    >
                      SPACE
                    </div>
                    <div
                      style={{
                        fontSize: 20,
                        fontWeight: 800,
                        color: "#064E3B",
                        fontFamily: "'Victor Mono', monospace",
                      }}
                    >
                      {md.space}
                    </div>
                    <div
                      style={{ fontSize: 10, color: "#059669", marginTop: 2 }}
                    >
                      {mode === "subarrayK" ? "hash map" : "prefix array"}
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
                  border: "1px solid #F5F0EB",
                }}
              >
                <h4
                  style={{
                    margin: "0 0 10px",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#A8A29E",
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
                    gap: "6px 14px",
                  }}
                >
                  {(mode === "build"
                    ? [
                        { s: "sentinel", label: "Sentinel P[0]=0" },
                        { s: "source", label: "Source P[i-1]" },
                        { s: "building", label: "Building P[i]" },
                        { s: "active", label: "Current arr[i]" },
                        { s: "done", label: "Completed" },
                      ]
                    : mode === "rangeQuery"
                      ? [
                          { s: "inRange", label: "Query range" },
                          { s: "queryRight", label: "P[j+1] lookup" },
                          { s: "queryLeft", label: "P[i] lookup" },
                          { s: "done", label: "Prefix array" },
                        ]
                      : [
                          { s: "active", label: "Current element" },
                          { s: "scanned", label: "Already processed" },
                          { s: "idle", label: "Not yet visited" },
                        ]
                  ).map((item) => (
                    <div
                      key={item.s}
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <div
                        style={{
                          width: 20,
                          height: 14,
                          borderRadius: 4,
                          background: CELL_COLORS[item.s].bg,
                          border: `2px solid ${CELL_COLORS[item.s].border}`,
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontSize: 12,
                          color: "#78716C",
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

            {/* Algorithm description */}
            <div
              style={{
                marginTop: 14,
                padding: "14px 18px",
                borderRadius: 14,
                background: "linear-gradient(135deg, #FEFBF6, #FBF7F0)",
                border: "1px solid #E7E5E4",
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
                    background: md.gradient,
                    color: "#fff",
                    letterSpacing: 0.5,
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  {md.name.toUpperCase()}
                </span>
                <span
                  style={{ fontSize: 13, color: "#57534E", lineHeight: 1.55 }}
                >
                  {md.desc}
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
                "0 1px 3px rgba(0,0,0,0.03), 0 8px 30px rgba(0,0,0,0.02)",
              border: "1px solid #F5F0EB",
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 18,
                margin: "0 auto 16px",
                background: md.gradient,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 8px 28px ${md.accent}20`,
                fontSize: 32,
                color: "#fff",
                fontWeight: 900,
                fontFamily: "'Victor Mono', monospace",
                transition: "all 0.4s",
              }}
            >
              {md.icon}
            </div>
            <h3
              style={{
                fontFamily: "'Bitter', serif",
                fontSize: 22,
                fontWeight: 700,
                color: "#292524",
                margin: "0 0 6px",
              }}
            >
              Ready to Accumulate
            </h3>
            <p
              style={{
                fontSize: 14,
                color: "#A8A29E",
                maxWidth: 460,
                margin: "0 auto",
                lineHeight: 1.65,
              }}
            >
              Choose a mode above, enter your array, and hit{" "}
              <strong style={{ color: md.accent }}>Visualize</strong> to watch
              prefix sums build, query, and find subarrays step by step.
            </p>

            {/* Core formula card */}
            <div
              style={{
                marginTop: 24,
                padding: "20px 24px",
                borderRadius: 14,
                background: "#292524",
                display: "inline-block",
                textAlign: "left",
                maxWidth: 440,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#78716C",
                  textTransform: "uppercase",
                  letterSpacing: 1.2,
                  marginBottom: 10,
                }}
              >
                Core Formulas
              </div>
              {[
                {
                  label: "Build",
                  formula: "P[i] = P[i-1] + arr[i-1]",
                  color: "#FBBF24",
                },
                {
                  label: "Query",
                  formula: "sum(i,j) = P[j+1] − P[i]",
                  color: "#34D399",
                },
                {
                  label: "Find k",
                  formula: "complement = prefixSum − k",
                  color: "#FB923C",
                },
              ].map((f, i) => (
                <div
                  key={i}
                  style={{
                    marginBottom: 6,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      padding: "2px 6px",
                      borderRadius: 4,
                      background: `${f.color}20`,
                      color: f.color,
                      fontFamily: "'Victor Mono', monospace",
                      minWidth: 44,
                      textAlign: "center",
                    }}
                  >
                    {f.label}
                  </span>
                  <span
                    style={{
                      fontFamily: "'Victor Mono', monospace",
                      fontSize: 14,
                      color: "#D6D3D1",
                      fontWeight: 600,
                    }}
                  >
                    {f.formula}
                  </span>
                </div>
              ))}
              <div
                style={{
                  marginTop: 10,
                  padding: "6px 10px",
                  borderRadius: 6,
                  background: "#44403C",
                  fontSize: 11,
                  color: "#A8A29E",
                  fontFamily: "'Victor Mono', monospace",
                }}
              >
                ⚠ Always init with{" "}
                <span style={{ color: "#FBBF24", fontWeight: 700 }}>
                  P[0] = 0
                </span>{" "}
                or{" "}
                <span style={{ color: "#FBBF24", fontWeight: 700 }}>
                  {"map{0:1}"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
