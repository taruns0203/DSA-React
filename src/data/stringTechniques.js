import { getTechniqueData } from "./problems";

const TECHNIQUE_ORDER = [
  {
    id: "basic",
    icon: "🔤",
    title: "String Fundamentals",
    accent: "var(--accent-2)",
  },
  {
    id: "window",
    icon: "🪟",
    title: "Sliding Window on Strings",
    accent: "var(--accent-3)",
  },
  {
    id: "twoptr",
    icon: "👈👉",
    title: "Two Pointers & Palindromes",
    accent: "var(--accent)",
  },
  {
    id: "dp",
    icon: "📐",
    title: "String Dynamic Programming",
    accent: "var(--accent-4)",
  },
  {
    id: "pattern",
    icon: "🔎",
    title: "Pattern Matching",
    accent: "var(--accent-5)",
  },
  {
    id: "build",
    icon: "🏗️",
    title: "Construction & Transformation",
    accent: "var(--accent-6)",
  },
];

function normalizeProblem(problem) {
  const slug = problem.problemSlug || problem.slug || "";
  return {
    name: problem.title || problem.name || slug || "Problem",
    slug,
    href: problem.visualLink || `${slug}-visualizer.html`,
  };
}

function normalizeTechnique(base) {
  const technique = getTechniqueData("strings", base.id);
  if (!technique) return null;
  return {
    id: base.id,
    icon: base.icon,
    title: technique.title || base.title,
    desc: technique.description || "",
    accent: technique.color || base.accent,
    problems: Object.values(technique.problems || {}).map(normalizeProblem),
  };
}

export const stringTechniques = TECHNIQUE_ORDER.map(normalizeTechnique).filter(
  Boolean,
);
