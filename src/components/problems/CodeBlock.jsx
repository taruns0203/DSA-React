import { useState, useMemo } from "react";
import { v } from "../../theme/token";
import useHighlight from "../../hooks/useHighlight";

export default function CodeBlock({
  code,
  language = "javascript",
  fileName = null,
}) {
  const [copied, setCopied] = useState(false);
  const { highlight } = useHighlight();

  // highlight.js does the work — fallback to escaped plain text
  const html = useMemo(() => {
    const result = highlight(code, language);
    if (result) return result;
    return code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }, [code, language, highlight]);

  const lines = html.split("\n");
  const digits = String(lines.length).length;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = code;
      ta.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const LABELS = {
    javascript: "JavaScript",
    typescript: "TypeScript",
    python: "Python",
    java: "Java",
    cpp: "C++",
    go: "Go",
    rust: "Rust",
  };

  return (
    <div style={S.wrapper}>
      {/* Header */}
      <div style={S.header}>
        <div style={S.headerLeft}>
          <div style={S.dots}>
            <span style={{ ...S.dot, background: "#FF5F57" }} />
            <span style={{ ...S.dot, background: "#FEBC2E" }} />
            <span style={{ ...S.dot, background: "#28C840" }} />
          </div>
          <span style={S.label}>
            {fileName || LABELS[language] || language}
          </span>
        </div>
        <button
          onClick={handleCopy}
          style={{
            ...S.copyBtn,
            color: copied ? "#28C840" : "rgba(255,255,255,.5)",
            borderColor: copied
              ? "rgba(40,200,64,.25)"
              : "rgba(255,255,255,.08)",
            background: copied
              ? "rgba(40,200,64,.08)"
              : "rgba(255,255,255,.04)",
          }}
        >
          {copied ? "✓ Copied!" : "Copy"}
        </button>
      </div>

      {/* Code body */}
      <div style={S.body}>
        <table style={S.table} role="presentation">
          <tbody>
            {lines.map((ln, i) => (
              <tr key={i}>
                <td style={{ ...S.lineNum, width: digits * 9 + 28 }}>
                  {i + 1}
                </td>
                <td
                  style={S.lineCode}
                  dangerouslySetInnerHTML={{ __html: ln || "&nbsp;" }}
                />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* Styles — unchanged from before */
const S = {
  wrapper: {
    borderRadius: 12,
    overflow: "hidden",
    border: `1px solid ${v("--c-border")}`,
    boxShadow: "0 2px 20px rgba(0,0,0,.12)",
    fontFamily: "'DM Mono','Fira Code',monospace",
    fontSize: ".82rem",
    lineHeight: 1.75,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 16px",
    background: "#1A1816",
    borderBottom: "1px solid rgba(255,255,255,.05)",
  },
  headerLeft: { display: "flex", alignItems: "center", gap: 12 },
  dots: { display: "flex", gap: 7 },
  dot: { width: 11, height: 11, borderRadius: "50%", display: "inline-block" },
  label: {
    fontSize: ".72rem",
    color: "rgba(255,255,255,.35)",
    fontWeight: 600,
    letterSpacing: 0.5,
  },
  copyBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "5px 14px",
    borderRadius: 7,
    border: "1px solid rgba(255,255,255,.08)",
    fontSize: ".72rem",
    fontWeight: 600,
    fontFamily: "'DM Sans',sans-serif",
    cursor: "pointer",
    transition: "all .2s",
  },
  body: { background: "#0F0D0B", padding: "12px 0", overflowX: "auto" },
  table: { borderCollapse: "collapse", width: "100%" },
  lineNum: {
    textAlign: "right",
    paddingRight: 16,
    paddingLeft: 16,
    userSelect: "none",
    color: "rgba(255,255,255,.16)",
    fontSize: ".75rem",
    fontWeight: 500,
    verticalAlign: "top",
    borderRight: "1px solid rgba(255,255,255,.04)",
    whiteSpace: "nowrap",
  },
  lineCode: {
    paddingLeft: 18,
    paddingRight: 20,
    color: "#E7E5E4",
    whiteSpace: "pre",
    verticalAlign: "top",
  },
};
