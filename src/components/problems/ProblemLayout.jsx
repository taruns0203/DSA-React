import { v } from "../../theme/token";
import ApproachCard from "./ApproachCard";

/* ================================================================
   ProblemLayout
   ================================================================
   Reusable page layout for any DSA problem. Receives all content
   as props — zero hardcoded logic. Swap the data and you get a
   completely different problem page.

   Props:
     breadcrumb    — ["Arrays", "Two Pointers", "Two Sum"]
     title         — Problem name
     difficulty    — "Easy" | "Medium" | "Hard"
     tags          — ["Array", "Hash Map", ...]
     description   — Problem statement string
     examples      — [{ input, output, explanation? }]
     constraints   — ["2 ≤ n ≤ 10⁴", ...]
     approaches    — Array of approach objects (see ApproachCard)
     problemSlug   — URL-safe slug, e.g. "two-sum"
     categoryPath  — URL path segment, e.g. "arrays/two-pointers"
     theme         — "light" | "dark"
     onToggleTheme — Callback to switch themes
   ================================================================ */
export default function ProblemLayout({
  breadcrumb,
  title,
  difficulty,
  tags,
  description,
  examples,
  constraints,
  approaches,
  problemSlug,
  categoryPath,
  theme,
  onToggleTheme,
}) {
  const diffColors = {
    Easy: { bg: v("--c-success-soft"), text: v("--c-success") },
    Medium: { bg: v("--c-accent-soft"), text: v("--c-accent") },
    Hard: { bg: v("--c-danger-soft"), text: v("--c-danger") },
  };
  const dc = diffColors[difficulty] || diffColors.Medium;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: v("--c-bg"),
        color: v("--c-text"),
        fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
        lineHeight: 1.6,
        transition: "background .4s, color .4s",
      }}
    >
      {/* ============ Top navigation bar ============ */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: v("--c-bg-raised"),
          borderBottom: `1px solid ${v("--c-border")}`,
          backdropFilter: "blur(12px)",
          padding: "0 24px",
        }}
      >
        <div
          style={{
            maxWidth: 960,
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            height: 52,
          }}
        >
          {/* Breadcrumb */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: ".82rem",
              flexWrap: "wrap",
            }}
          >
            {breadcrumb.map((item, i) => (
              <span
                key={i}
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                {i > 0 && (
                  <span style={{ color: v("--c-text-tertiary") }}>/</span>
                )}
                <span
                  style={{
                    color:
                      i === breadcrumb.length - 1
                        ? v("--c-accent")
                        : v("--c-text-secondary"),
                    fontWeight: i === breadcrumb.length - 1 ? 700 : 500,
                    cursor: i < breadcrumb.length - 1 ? "pointer" : "default",
                  }}
                >
                  {item}
                </span>
              </span>
            ))}
          </div>

          {/* Theme toggle */}
          <button
            onClick={onToggleTheme}
            style={{
              background: v("--c-bg-inset"),
              border: `1px solid ${v("--c-border")}`,
              borderRadius: 8,
              width: 36,
              height: 36,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.05rem",
              transition: "all .3s",
            }}
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
        </div>
      </nav>

      {/* ============ Main content ============ */}
      <main
        style={{ maxWidth: 960, margin: "0 auto", padding: "32px 24px 80px" }}
      >
        {/* ---- Problem description card ---- */}
        <div
          style={{
            background: v("--c-bg-raised"),
            borderRadius: 16,
            border: `1px solid ${v("--c-border")}`,
            boxShadow: v("--c-card-shadow"),
            padding: "28px 28px 24px",
            marginBottom: 28,
          }}
        >
          {/* Title + difficulty badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
              marginBottom: 6,
            }}
          >
            <h1
              style={{
                fontSize: "1.55rem",
                fontWeight: 800,
                letterSpacing: "-.02em",
                margin: 0,
              }}
            >
              {title}
            </h1>
            <span
              style={{
                padding: "3px 12px",
                borderRadius: 20,
                fontSize: ".72rem",
                fontWeight: 700,
                background: dc.bg,
                color: dc.text,
              }}
            >
              {difficulty}
            </span>
          </div>

          {/* Tags */}
          <div
            style={{
              display: "flex",
              gap: 6,
              flexWrap: "wrap",
              marginBottom: 18,
            }}
          >
            {tags.map((t, i) => (
              <span
                key={i}
                style={{
                  padding: "3px 10px",
                  borderRadius: 6,
                  fontSize: ".72rem",
                  fontWeight: 600,
                  background: v("--c-tag-bg"),
                  color: v("--c-tag-text"),
                }}
              >
                {t}
              </span>
            ))}
          </div>

          {/* Description */}
          <p
            style={{
              fontSize: ".92rem",
              color: v("--c-text-secondary"),
              lineHeight: 1.65,
              marginBottom: 20,
            }}
          >
            {description}
          </p>

          {/* Examples */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              marginBottom: 20,
            }}
          >
            {examples.map((ex, i) => (
              <div
                key={i}
                style={{
                  padding: "14px 18px",
                  borderRadius: 10,
                  background: v("--c-bg-inset"),
                  border: `1px solid ${v("--c-border")}`,
                }}
              >
                <div
                  style={{
                    fontSize: ".72rem",
                    fontWeight: 700,
                    color: v("--c-text-tertiary"),
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    marginBottom: 8,
                  }}
                >
                  Example {i + 1}
                </div>
                <div
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: ".84rem",
                    lineHeight: 1.7,
                  }}
                >
                  <div>
                    <span style={{ color: v("--c-text-tertiary") }}>
                      Input:{" "}
                    </span>
                    <span style={{ color: v("--c-text") }}>{ex.input}</span>
                  </div>
                  <div>
                    <span style={{ color: v("--c-text-tertiary") }}>
                      Output:{" "}
                    </span>
                    <span style={{ color: v("--c-accent"), fontWeight: 700 }}>
                      {ex.output}
                    </span>
                  </div>
                  {ex.explanation && (
                    <div
                      style={{
                        marginTop: 4,
                        fontSize: ".8rem",
                        color: v("--c-text-secondary"),
                        fontFamily: "inherit",
                      }}
                    >
                      {ex.explanation}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Constraints */}
          <div>
            <div
              style={{
                fontSize: ".72rem",
                fontWeight: 700,
                color: v("--c-text-tertiary"),
                textTransform: "uppercase",
                letterSpacing: 1,
                marginBottom: 8,
              }}
            >
              Constraints
            </div>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              {constraints.map((c, i) => (
                <li
                  key={i}
                  style={{
                    fontSize: ".84rem",
                    color: v("--c-text-secondary"),
                    fontFamily: "'DM Mono', monospace",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span style={{ color: v("--c-accent"), fontSize: ".65rem" }}>
                    ●
                  </span>
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ---- Approaches section ---- */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 18,
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <h2
            style={{
              fontSize: "1.15rem",
              fontWeight: 800,
              letterSpacing: "-.01em",
              margin: 0,
            }}
          >
            Approaches
          </h2>
          <span
            style={{
              fontSize: ".78rem",
              color: v("--c-text-tertiary"),
              fontWeight: 600,
            }}
          >
            {approaches.length} approaches — click to expand
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {approaches.map((a, i) => (
            <ApproachCard
              key={i}
              index={i}
              approach={a}
              problemSlug={problemSlug}
              categoryPath={categoryPath}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
