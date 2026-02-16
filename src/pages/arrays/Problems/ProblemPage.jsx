import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import ProblemLayout from "../../../components/problems/ProblemLayout";
import NotFound from "../../NotFound";
import { getProblemData } from "../../../data/problems";

const THEME = {
  light: {
    // Backgrounds - Warm cream with subtle pink undertone
    "--c-bg":
      "linear-gradient(135deg, #FAFAFF 0%, #FBCFE8 30%, #BFDBFE 60%, #DDD6FE 100%)",
    "--c-bg-raised":
      "linear-gradient(135deg, #FFFFFF 0%, #FCE7F3 60%, #F5F3FF 100%)",
    "--c-bg-inset": "#FFF5F0",
    "--c-bg-code": "#2D2B55",

    // Text - Rich, warm tones
    "--c-text": "#2D2A3E",
    "--c-text-secondary": "#6B6584",
    "--c-text-tertiary": "#9D97B5",
    "--c-text-inverse": "#FFFBF8",

    // Borders - Soft coral tint
    "--c-border": "#F5E6E0",
    "--c-border-focus": "#F43F5E",

    // Accent - Vibrant coral rose
    "--c-accent": "#F43F5E",
    "--c-accent-soft": "rgba(244,63,94,.08)",
    "--c-accent-med": "rgba(244,63,94,.15)",
    "--c-accent-hover": "#E11D48",

    // Secondary accent - Teal for contrast
    "--c-accent-secondary": "#14B8A6",
    "--c-accent-secondary-soft": "rgba(20,184,166,.10)",

    // Semantic colors - Punchy and vibrant
    "--c-success": "#10B981",
    "--c-success-soft": "rgba(16,185,129,.12)",
    "--c-success-bold": "#059669",
    "--c-danger": "#F43F5E",
    "--c-danger-soft": "rgba(244,63,94,.12)",
    "--c-warning": "#F59E0B",
    "--c-warning-soft": "rgba(245,158,11,.12)",
    "--c-info": "#0EA5E9",
    "--c-info-soft": "rgba(14,165,233,.12)",

    // Tags - Playful gradient-ready
    "--c-tag-bg": "linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 100%)",
    "--c-tag-text": "#BE123C",
    "--c-tag-bg-alt": "linear-gradient(135deg, #ECFEFF 0%, #CFFAFE 100%)",
    "--c-tag-text-alt": "#0E7490",

    // Cards - Warm shadows with color
    "--c-card-shadow":
      "0 1px 3px rgba(244,63,94,.06), 0 6px 24px rgba(244,63,94,.08)",
    "--c-card-hover":
      "0 4px 12px rgba(244,63,94,.10), 0 20px 48px rgba(244,63,94,.12)",

    // Code - Shades of Purple / Dracula inspired
    "--c-code-header": "#1E1B38",
    "--c-code-line": "#7C78A3",
    "--c-code-text": "#E9E8F2",
    "--c-code-keyword": "#FF79C6",
    "--c-code-string": "#50FA7B",
    "--c-code-comment": "#6272A4",
    "--c-code-number": "#FFB86C",
    "--c-code-function": "#8BE9FD",
    "--c-code-variable": "#BD93F9",

    // Gradients - Vibrant and playful
    "--c-gradient-primary": "linear-gradient(135deg, #F43F5E 0%, #FB923C 100%)",
    "--c-gradient-secondary":
      "linear-gradient(135deg, #14B8A6 0%, #0EA5E9 100%)",
    "--c-gradient-accent": "linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)",
    "--c-gradient-warm": "linear-gradient(135deg, #FBBF24 0%, #F43F5E 100%)",
    "--c-gradient-cool": "linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)",
    "--c-gradient-fresh": "linear-gradient(135deg, #10B981 0%, #14B8A6 100%)",

    // Decorative - For backgrounds and accents
    "--c-decoration-1": "#FDF2F8",
    "--c-decoration-2": "#ECFEFF",
    "--c-decoration-3": "#FEF3C7",

    // Interactive states
    "--c-focus-ring": "0 0 0 3px rgba(244,63,94,.25)",
    "--c-active-bg": "rgba(244,63,94,.08)",
  },
  dark: {
    // Backgrounds - Deep, rich tones
    "--c-bg": "#0F0F1A",
    "--c-bg-raised": "#1A1A2E",
    "--c-bg-inset": "#252542",
    "--c-bg-code": "#0F0F1A",

    // Text - Crisp, high contrast
    "--c-text": "#F4F4F8",
    "--c-text-secondary": "#A0A0BC",
    "--c-text-tertiary": "#6C6C8A",
    "--c-text-inverse": "#0F0F1A",

    // Borders - Subtle purple glow
    "--c-border": "#2D2D4A",
    "--c-border-focus": "#A78BFA",

    // Accent - Glowing violet
    "--c-accent": "#A78BFA",
    "--c-accent-soft": "rgba(167,139,250,.12)",
    "--c-accent-med": "rgba(167,139,250,.20)",
    "--c-accent-hover": "#C4B5FD",

    // Secondary accent
    "--c-accent-secondary": "#2DD4BF",
    "--c-accent-secondary-soft": "rgba(45,212,191,.12)",

    // Semantic colors - Neon-inspired
    "--c-success": "#34D399",
    "--c-success-soft": "rgba(52,211,153,.12)",
    "--c-success-bold": "#10B981",
    "--c-danger": "#FB7185",
    "--c-danger-soft": "rgba(251,113,133,.12)",
    "--c-warning": "#FBBF24",
    "--c-warning-soft": "rgba(251,191,36,.12)",
    "--c-info": "#60A5FA",
    "--c-info-soft": "rgba(96,165,250,.12)",

    // Tags - Glowing effect
    "--c-tag-bg": "rgba(167,139,250,.15)",
    "--c-tag-text": "#C4B5FD",
    "--c-tag-bg-alt": "rgba(45,212,191,.15)",
    "--c-tag-text-alt": "#5EEAD4",

    // Cards - Dramatic depth with glow
    "--c-card-shadow": "0 2px 8px rgba(0,0,0,.4), 0 8px 32px rgba(0,0,0,.3)",
    "--c-card-hover":
      "0 4px 16px rgba(167,139,250,.15), 0 16px 48px rgba(0,0,0,.4)",

    // Code - Vibrant syntax highlighting
    "--c-code-header": "#1A1A2E",
    "--c-code-line": "#4C4C6D",
    "--c-code-text": "#E4E4F0",
    "--c-code-keyword": "#C4B5FD",
    "--c-code-string": "#6EE7B7",
    "--c-code-comment": "#6C6C8A",
    "--c-code-number": "#FDBA74",
    "--c-code-function": "#67E8F9",
    "--c-code-variable": "#F9A8D4",

    // Gradients
    "--c-gradient-primary": "linear-gradient(135deg, #A78BFA 0%, #F472B6 100%)",
    "--c-gradient-secondary":
      "linear-gradient(135deg, #2DD4BF 0%, #60A5FA 100%)",
    "--c-gradient-accent": "linear-gradient(135deg, #F472B6 0%, #A78BFA 100%)",
    "--c-gradient-warm": "linear-gradient(135deg, #FBBF24 0%, #FB7185 100%)",
    "--c-gradient-cool": "linear-gradient(135deg, #22D3EE 0%, #A78BFA 100%)",
    "--c-gradient-fresh": "linear-gradient(135deg, #34D399 0%, #2DD4BF 100%)",

    // Decorative
    "--c-decoration-1": "rgba(167,139,250,.08)",
    "--c-decoration-2": "rgba(45,212,191,.08)",
    "--c-decoration-3": "rgba(251,191,36,.08)",

    // Interactive states
    "--c-focus-ring": "0 0 0 3px rgba(167,139,250,.35)",
    "--c-active-bg": "rgba(167,139,250,.12)",
  },
};

export default function ProblemPage() {
  const { dsaSlug, techniqueSlug, problemSlug } = useParams();
  const [theme, setTheme] = useState("light");

  const problem = useMemo(
    () => getProblemData(dsaSlug, techniqueSlug, problemSlug),
    [dsaSlug, techniqueSlug, problemSlug],
  );

  if (!problem) {
    return <NotFound />;
  }

  const toggleTheme = () =>
    setTheme((value) => (value === "light" ? "dark" : "light"));
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
      <ProblemLayout {...problem} theme={theme} onToggleTheme={toggleTheme} />
    </div>
  );
}
