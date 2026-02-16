import { useState, useRef, useEffect } from "react";
import { v } from "../../theme/token";
import CodeBlock from "./CodeBlock";
import ComplexityBadge from "./ComplexityBadge";
import ActionButton from "./ActionButton";

/* ================================================================
   ApproachCard
   ================================================================
   Expandable card displaying a single approach to a DSA problem.
   Fully data-driven — pass any approach object and it renders.

   Props:
     approach      — Approach data object (see shape below)
     problemSlug   — e.g. "two-sum"
     categoryPath  — e.g. "arrays/two-pointers"
     index         — 0-based index (first card auto-expands)

   Approach object shape:
   {
     title, badge, intuition, steps[], code, language,
     timeComplexity, spaceComplexity, timeType, spaceType,
     pros[], cons[], talkingPoints[]
   }
   ================================================================ */
export default function ApproachCard({
  approach,
  problemSlug,
  categoryPath,
  index,
}) {
  const [expanded, setExpanded] = useState(index === 0);
  const contentRef = useRef(null);
  const [contentHeight, setContentHeight] = useState(0);

  /* Recalculate height when toggled or data changes */
  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [expanded, approach]);

  const {
    title,
    badge,
    intuition,
    steps,
    code,
    language,
    timeComplexity,
    spaceComplexity,
    timeType,
    spaceType,
    pros,
    cons,
    talkingPoints,
    visualLink,
  } = approach;

  /* Build routes from slugified approach title */
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const vizRoute =
    visualLink?.trim() || `/visualizer/${categoryPath}/${problemSlug}/${slug}`;
  const noteRoute = `/notes/${categoryPath}/${problemSlug}/${slug}`;

  /* Badge color by category */
  const badgeColors = {
    "Brute Force": { bg: v("--c-danger-soft"), text: v("--c-danger") },
    Improved: { bg: v("--c-accent-soft"), text: v("--c-accent") },
    Optimal: { bg: v("--c-success-soft"), text: v("--c-success") },
  };
  const bc = badgeColors[badge] || badgeColors["Improved"];

  return (
    <div
      style={{
        background: v("--c-bg-raised"),
        borderRadius: 14,
        border: `1px solid ${expanded ? v("--c-border-focus") : v("--c-border")}`,
        boxShadow: expanded ? v("--c-card-hover") : v("--c-card-shadow"),
        transition: "all .35s cubic-bezier(.4,0,.2,1)",
        overflow: "hidden",
      }}
    >
      {/* ============ Header (always visible) ============ */}
      <button
        onClick={() => setExpanded((p) => !p)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "20px 24px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          fontFamily: "inherit",
        }}
      >
        {/* Step number */}
        <span
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: expanded ? v("--c-accent") : v("--c-bg-inset"),
            color: expanded ? v("--c-text-inverse") : v("--c-text-secondary"),
            fontSize: ".85rem",
            fontWeight: 800,
            transition: "all .3s",
          }}
        >
          {index + 1}
        </span>

        {/* Title + badge + complexity summary */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontSize: "1.05rem",
                fontWeight: 700,
                color: v("--c-text"),
              }}
            >
              {title}
            </span>
            <span
              style={{
                padding: "2px 10px",
                borderRadius: 20,
                fontSize: ".68rem",
                fontWeight: 700,
                background: bc.bg,
                color: bc.text,
                letterSpacing: 0.4,
              }}
            >
              {badge}
            </span>
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
            <span
              style={{
                fontSize: ".78rem",
                color: v("--c-text-tertiary"),
                fontFamily: "'DM Mono', monospace",
              }}
            >
              Time: {timeComplexity}
            </span>
            <span
              style={{
                fontSize: ".78rem",
                color: v("--c-text-tertiary"),
                fontFamily: "'DM Mono', monospace",
              }}
            >
              Space: {spaceComplexity}
            </span>
          </div>
        </div>

        {/* Chevron */}
        <span
          style={{
            fontSize: "1.1rem",
            color: v("--c-text-tertiary"),
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform .3s ease",
            flexShrink: 0,
          }}
        >
          ▾
        </span>
      </button>

      {/* ============ Expandable content ============ */}
      <div
        style={{
          maxHeight: expanded ? contentHeight + 60 : 0,
          opacity: expanded ? 1 : 0,
          overflow: "hidden",
          transition:
            "max-height .45s cubic-bezier(.4,0,.2,1), opacity .3s ease",
        }}
      >
        <div ref={contentRef} style={{ padding: "0 24px 24px" }}>
          <div
            style={{ height: 1, background: v("--c-border"), marginBottom: 22 }}
          />

          {/* Intuition */}
          <SectionHeading>Intuition</SectionHeading>
          <p style={bodyStyle}>{intuition}</p>

          {/* Steps */}
          {steps.length > 0 && <SectionHeading>Step-by-Step</SectionHeading>}
          <ol
            style={{
              ...bodyStyle,
              paddingLeft: 20,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            {steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>

          {/* Code */}
          <SectionHeading>Implementation</SectionHeading>
          <CodeBlock code={code} language={language || "javascript"} />

          {/* Complexity badges */}
          <SectionHeading>Complexity</SectionHeading>
          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              marginBottom: 22,
            }}
          >
            <ComplexityBadge
              label="Time"
              value={timeComplexity}
              type={timeType}
            />
            <ComplexityBadge
              label="Space"
              value={spaceComplexity}
              type={spaceType}
            />
          </div>

          {/* Pros / Cons */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 14,
              marginBottom: 22,
            }}
          >
            {pros.length > 0 && (
              <ProsConsList
                title="Pros"
                items={pros}
                color={v("--c-success")}
                bg={v("--c-success-soft")}
                icon="✓"
              />
            )}
            {cons.length > 0 && (
              <ProsConsList
                title="Cons"
                items={cons}
                color={v("--c-danger")}
                bg={v("--c-danger-soft")}
                icon="✗"
              />
            )}
          </div>

          {/* Interview talking points */}
          {talkingPoints && talkingPoints.length > 0 && (
            <SectionHeading>Interview Talking Points</SectionHeading>
          )}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              marginBottom: 22,
            }}
          >
            {talkingPoints &&
              talkingPoints.length > 0 &&
              talkingPoints.map((tp, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "flex-start",
                    padding: "10px 14px",
                    borderRadius: 8,
                    background: v("--c-accent-soft"),
                  }}
                >
                  <span
                    style={{
                      color: v("--c-accent"),
                      fontWeight: 800,
                      flexShrink: 0,
                      fontSize: ".85rem",
                    }}
                  >
                    💬
                  </span>
                  <span
                    style={{
                      fontSize: ".84rem",
                      lineHeight: 1.55,
                      color: v("--c-text"),
                    }}
                  >
                    {tp}
                  </span>
                </div>
              ))}
          </div>

          {/* Action buttons */}
          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              paddingTop: 4,
            }}
          >
            <ActionButton
              label="Visualize"
              route={vizRoute}
              variant="primary"
              icon="▶"
            />
            <ActionButton
              label="View Notes"
              route={noteRoute}
              variant="secondary"
              icon="📝"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---- Internal helpers ---- */

function SectionHeading({ children }) {
  return (
    <h4
      style={{
        fontSize: ".7rem",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: 1.4,
        color: v("--c-text-tertiary"),
        marginBottom: 10,
        marginTop: 22,
      }}
    >
      {children}
    </h4>
  );
}

function ProsConsList({ title, items, color, bg, icon }) {
  return (
    <div style={{ padding: 14, borderRadius: 10, background: bg }}>
      <h5
        style={{
          fontSize: ".7rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: 1,
          color,
          marginBottom: 8,
        }}
      >
        {title}
      </h5>
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "flex",
          flexDirection: "column",
          gap: 5,
        }}
      >
        {items.map((item, i) => (
          <li
            key={i}
            style={{
              fontSize: ".8rem",
              color: v("--c-text"),
              display: "flex",
              gap: 6,
              lineHeight: 1.45,
            }}
          >
            <span style={{ color, fontWeight: 700, flexShrink: 0 }}>
              {icon}
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

const bodyStyle = {
  fontSize: ".88rem",
  color: v("--c-text-secondary"),
  lineHeight: 1.65,
  marginBottom: 0,
};
