import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import ProblemLayout from "../../../components/problems/ProblemLayout";
import NotFound from "../../NotFound";
import { getProblemData } from "../../../data/problems";

const THEME = {
  light: {
    "--c-bg": "#FAF9F7",
    "--c-bg-raised": "#FFFFFF",
    "--c-bg-inset": "#F3F1ED",
    "--c-bg-code": "#1C1917",
    "--c-text": "#1C1917",
    "--c-text-secondary": "#78716C",
    "--c-text-tertiary": "#A8A29E",
    "--c-text-inverse": "#FAF9F7",
    "--c-border": "#E7E5E4",
    "--c-border-focus": "#D97706",
    "--c-accent": "#D97706",
    "--c-accent-soft": "rgba(217,119,6,.10)",
    "--c-accent-med": "rgba(217,119,6,.18)",
    "--c-success": "#059669",
    "--c-success-soft": "rgba(5,150,105,.10)",
    "--c-danger": "#DC2626",
    "--c-danger-soft": "rgba(220,38,38,.10)",
    "--c-info": "#2563EB",
    "--c-info-soft": "rgba(37,99,235,.10)",
    "--c-tag-bg": "#F5F0EB",
    "--c-tag-text": "#92400E",
    "--c-card-shadow": "0 1px 3px rgba(28,25,23,.04), 0 4px 16px rgba(28,25,23,.03)",
    "--c-card-hover": "0 2px 8px rgba(28,25,23,.06), 0 8px 32px rgba(28,25,23,.06)",
    "--c-code-header": "#292524",
    "--c-code-line": "#A8A29E",
    "--c-code-text": "#E7E5E4",
    "--c-code-keyword": "#F59E0B",
    "--c-code-string": "#34D399",
    "--c-code-comment": "#78716C",
    "--c-code-number": "#FB923C"
  },
  dark: {
    "--c-bg": "#0C0A09",
    "--c-bg-raised": "#1C1917",
    "--c-bg-inset": "#292524",
    "--c-bg-code": "#0C0A09",
    "--c-text": "#FAF9F7",
    "--c-text-secondary": "#A8A29E",
    "--c-text-tertiary": "#78716C",
    "--c-text-inverse": "#1C1917",
    "--c-border": "#292524",
    "--c-border-focus": "#F59E0B",
    "--c-accent": "#F59E0B",
    "--c-accent-soft": "rgba(245,158,11,.12)",
    "--c-accent-med": "rgba(245,158,11,.22)",
    "--c-success": "#34D399",
    "--c-success-soft": "rgba(52,211,153,.12)",
    "--c-danger": "#F87171",
    "--c-danger-soft": "rgba(248,113,113,.12)",
    "--c-info": "#60A5FA",
    "--c-info-soft": "rgba(96,165,250,.12)",
    "--c-tag-bg": "rgba(245,158,11,.12)",
    "--c-tag-text": "#F59E0B",
    "--c-card-shadow": "0 1px 3px rgba(0,0,0,.2), 0 4px 16px rgba(0,0,0,.15)",
    "--c-card-hover": "0 2px 8px rgba(0,0,0,.3), 0 8px 32px rgba(0,0,0,.2)",
    "--c-code-header": "#1C1917",
    "--c-code-line": "#57534E",
    "--c-code-text": "#D6D3D1",
    "--c-code-keyword": "#F59E0B",
    "--c-code-string": "#34D399",
    "--c-code-comment": "#78716C",
    "--c-code-number": "#FB923C"
  }
};

export default function ProblemPage() {
  const { dsaSlug, techniqueSlug, problemSlug } = useParams();
  const [theme, setTheme] = useState("light");

  const problem = useMemo(
    () => getProblemData(dsaSlug, techniqueSlug, problemSlug),
    [dsaSlug, techniqueSlug, problemSlug]
  );

  if (!problem) {
    return <NotFound />;
  }

  const toggleTheme = () => setTheme((value) => (value === "light" ? "dark" : "light"));
  const themeVars = THEME[theme];

  return (
    <div style={{ ...themeVars }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: 'DM Sans', sans-serif; }
        ::selection { background: rgba(217,119,6,.25); }
        @media (max-width: 640px) {
          .approach-proscons { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <ProblemLayout
        {...problem}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    </div>
  );
}
