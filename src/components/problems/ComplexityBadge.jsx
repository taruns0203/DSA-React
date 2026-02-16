import { v } from "../../theme/token";

/* ================================================================
   ComplexityBadge
   ================================================================
   Compact badge showing a complexity metric with semantic color.

   Props:
     label  — "Time" | "Space" | custom string
     value  — "O(n)" | "O(n²)" | etc.
     type   — "good" | "warning" | "bad" | "neutral"
   ================================================================ */
export default function ComplexityBadge({ label, value, type = "neutral" }) {
  const colorMap = {
    good: {
      bg: v("--c-success-soft"),
      text: v("--c-success"),
      border: "transparent",
    },
    warning: {
      bg: v("--c-accent-soft"),
      text: v("--c-accent"),
      border: "transparent",
    },
    bad: {
      bg: v("--c-danger-soft"),
      text: v("--c-danger"),
      border: "transparent",
    },
    neutral: {
      bg: v("--c-bg-inset"),
      text: v("--c-text"),
      border: v("--c-border"),
    },
  };

  const c = colorMap[type] || colorMap.neutral;

  return (
    <div
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "10px 18px",
        borderRadius: 10,
        background: c.bg,
        border: `1px solid ${c.border}`,
        gap: 2,
        minWidth: 100,
      }}
    >
      <span
        style={{
          fontSize: ".65rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: 1.1,
          color: v("--c-text-tertiary"),
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: ".92rem",
          fontWeight: 700,
          color: c.text,
        }}
      >
        {value}
      </span>
    </div>
  );
}
