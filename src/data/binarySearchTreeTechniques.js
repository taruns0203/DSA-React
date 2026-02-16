import { getTechniqueData } from "./problems";

const TECHNIQUE_ORDER = [
  {
    id: "traversal",
    icon: "🚶",
    title: "Traversal",
    accent: "var(--accent)",
  },
  {
    id: "construction",
    icon: "🏗️",
    title: "Construction",
    accent: "var(--accent-2)",
  },
  {
    id: "mirror",
    icon: "🪞",
    title: "Mirror & Symmetry",
    accent: "var(--accent-5)",
  },
  {
    id: "pathsum",
    icon: "🛤️",
    title: "Path Sum & Root to Leaf",
    accent: "var(--accent-3)",
  },
  {
    id: "search",
    icon: "🔍",
    title: "Ancestor & Search",
    accent: "var(--accent-4)",
  },
  {
    id: "validation",
    icon: "✅",
    title: "Validation & Properties",
    accent: "var(--accent)",
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
  const technique = getTechniqueData("binary-search-tree", base.id);
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

export const binarySearchTreeTechniques = TECHNIQUE_ORDER.map(
  normalizeTechnique,
).filter(Boolean);
