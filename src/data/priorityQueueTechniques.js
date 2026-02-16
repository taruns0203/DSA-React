import { getTechniqueData } from "./problems";

const TECHNIQUE_ORDER = [
  {
    id: "kth",
    icon: "🏅",
    title: "Finding Kth Largest/Smallest",
    accent: "var(--accent)",
  },
  {
    id: "topk",
    icon: "📊",
    title: "Top K Frequent Elements",
    accent: "var(--accent-2)",
  },
  {
    id: "merge",
    icon: "🔀",
    title: "Merge K Lists",
    accent: "var(--accent-3)",
  },
  {
    id: "sliding",
    icon: "🪟",
    title: "Sliding Window Maximum/Minimum",
    accent: "var(--accent-4)",
  },
  {
    id: "design",
    icon: "🏗️",
    title: "Design Problems",
    accent: "var(--accent-5)",
  },
  {
    id: "construct",
    icon: "🧩",
    title: "Construction & Manipulation",
    accent: "var(--accent)",
  },
  {
    id: "graphs",
    icon: "🗺️",
    title: "With Graphs",
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
  const technique = getTechniqueData("priority-queue", base.id);
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

export const priorityQueueTechniques = TECHNIQUE_ORDER.map(
  normalizeTechnique,
).filter(Boolean);
