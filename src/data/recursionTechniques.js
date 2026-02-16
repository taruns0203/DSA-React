import { getTechniqueData } from "./problems";

const TECHNIQUE_ORDER = [
  {
    id: "basic",
    icon: "🔄",
    title: "Basic Recursion & Base Cases",
    accent: "var(--accent)",
  },
  {
    id: "backtrack",
    icon: "🧭",
    title: "Backtracking",
    accent: "var(--accent-2)",
  },
  {
    id: "divide",
    icon: "✂️",
    title: "Divide & Conquer",
    accent: "var(--accent-3)",
  },
  {
    id: "tree",
    icon: "🌳",
    title: "Tree Recursion",
    accent: "var(--accent-4)",
  },
  {
    id: "memo",
    icon: "📝",
    title: "Recursion with Memoization",
    accent: "var(--accent-5)",
  },
  {
    id: "advanced",
    icon: "🧬",
    title: "Advanced Recursion",
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
  const technique = getTechniqueData("recursions", base.id);
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

export const recursionTechniques = TECHNIQUE_ORDER.map(normalizeTechnique).filter(
  Boolean,
);
