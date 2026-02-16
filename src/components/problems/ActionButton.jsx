import { useState } from "react";
import { v } from "../../theme/token";

/* ================================================================
   ActionButton
   ================================================================
   Reusable button component for navigation actions.

   Props:
     label    — Button text
     route    — URL hash or path to navigate to
     variant  — "primary" | "secondary" | "ghost"
     icon     — Optional emoji/icon string
     onClick  — Optional custom click handler (overrides route)

   Features:
     ✓ Hover elevation micro-animation
     ✓ Light/dark mode via CSS variables
     ✓ Three visual variants
   ================================================================ */
export default function ActionButton({
  label,
  route,
  variant = "primary",
  icon,
  onClick,
}) {
  const [hovered, setHovered] = useState(false);

  const base = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 20px",
    borderRadius: 10,
    fontSize: ".84rem",
    fontWeight: 650,
    fontFamily: "inherit",
    cursor: "pointer",
    border: "none",
    textDecoration: "none",
    transition: "all .25s cubic-bezier(.4,0,.2,1)",
    transform: hovered ? "translateY(-1px)" : "translateY(0)",
  };

  const variants = {
    primary: {
      background: v("--c-accent"),
      color: v("--c-text-inverse"),
      boxShadow: hovered
        ? `0 4px 20px ${v("--c-accent-med")}`
        : `0 2px 8px ${v("--c-accent-soft")}`,
    },
    secondary: {
      background: v("--c-bg-inset"),
      color: v("--c-text"),
      border: `1.5px solid ${v("--c-border")}`,
      boxShadow: hovered ? v("--c-card-hover") : "none",
    },
    ghost: {
      background: "transparent",
      color: v("--c-accent"),
      padding: "8px 12px",
    },
  };

  const handleClick = () => {
    if (onClick) return onClick();
    if (!route) return;
    window.location.assign(route);
  };

  return (
    <button
      style={{ ...base, ...variants[variant] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
      title={route ? `Navigate to ${route}` : ""}
    >
      {icon && (
        <span style={{ fontSize: "1.05em", lineHeight: 1 }}>{icon}</span>
      )}
      {label}
    </button>
  );
}
