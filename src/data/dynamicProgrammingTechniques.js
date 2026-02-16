import { getTechniqueData } from "./problems";

const TECHNIQUE_ORDER = [
  {
    id: "1d",
    icon: "📏",
    title: "1D Dynamic Programming",
    accent: "var(--accent)",
  },
  {
    id: "2d",
    icon: "🔲",
    title: "2D Dynamic Programming",
    accent: "var(--accent-2)",
  },
  {
    id: "knapsack",
    icon: "🎒",
    title: "Knapsack Patterns",
    accent: "var(--accent-6)",
  },
  {
    id: "string",
    icon: "🔤",
    title: "String DP",
    accent: "var(--accent-4)",
  },
  {
    id: "interval",
    icon: "📐",
    title: "Interval & Range DP",
    accent: "var(--accent-5)",
  },
  {
    id: "tree",
    icon: "🌲",
    title: "Tree DP",
    accent: "var(--accent-3)",
  },
  {
    id: "state",
    icon: "🎭",
    title: "State Machine DP",
    accent: "var(--accent)",
  },
  {
    id: "bitmask",
    icon: "🧬",
    title: "Bitmask DP",
    accent: "var(--accent-2)",
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
  const technique = getTechniqueData("dynamic-programming", base.id);
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

export const dynamicProgrammingTechniques = TECHNIQUE_ORDER.map(
  normalizeTechnique,
).filter(Boolean);
