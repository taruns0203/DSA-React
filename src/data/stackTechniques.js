import { getTechniqueData } from "./problems";

const TECHNIQUE_ORDER = [
  {
    id: "design",
    icon: "🏗️",
    title: "Design Problems",
    accent: "var(--accent)",
  },
  {
    id: "monotonic",
    icon: "📈",
    title: "Monotonic Stack",
    accent: "var(--accent-3)",
  },
  {
    id: "expression",
    icon: "🧮",
    title: "Expression Evaluation",
    accent: "var(--accent-4)",
  },
  {
    id: "sliding",
    icon: "🪟",
    title: "Sliding Window & Monotonic Queue",
    accent: "var(--accent-5)",
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
  const technique = getTechniqueData("stack-queues", base.id);
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

export const stackTechniques = TECHNIQUE_ORDER.map(normalizeTechnique).filter(
  Boolean,
);
