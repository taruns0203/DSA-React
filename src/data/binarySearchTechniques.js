import { getTechniqueData } from "./problems";

const TECHNIQUE_ORDER = [
  {
    id: "classic",
    icon: "🎯",
    title: "Classic Binary Search",
    accent: "var(--accent)",
  },
  {
    id: "boundary",
    icon: "📏",
    title: "Boundary Finding",
    accent: "var(--accent-2)",
  },
  {
    id: "answer",
    icon: "🔍",
    title: "Binary Search on Answer",
    accent: "var(--accent-3)",
  },
  {
    id: "matrix",
    icon: "🔲",
    title: "Matrix & 2D Search",
    accent: "var(--accent-4)",
  },
  {
    id: "advanced",
    icon: "🧬",
    title: "Advanced Applications",
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
  const technique = getTechniqueData("binary-search", base.id);
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

export const binarySearchTechniques = TECHNIQUE_ORDER.map(
  normalizeTechnique,
).filter(Boolean);
