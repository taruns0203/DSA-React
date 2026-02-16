import { getTechniqueData } from "./problems";

const TECHNIQUE_ORDER = [
  {
    id: "bfs",
    icon: "🌊",
    title: "BFS — Breadth-First Search",
    accent: "var(--accent)",
  },
  {
    id: "dfs",
    icon: "🔦",
    title: "DFS — Depth-First Search",
    accent: "var(--accent-2)",
  },
  {
    id: "dijkstra",
    icon: "⚖️",
    title: "Dijkstra & Shortest Paths",
    accent: "var(--accent-3)",
  },
  {
    id: "topo",
    icon: "📐",
    title: "Topological Sort",
    accent: "var(--accent-4)",
  },
  {
    id: "union",
    icon: "🔗",
    title: "Union-Find / Disjoint Sets",
    accent: "var(--accent-5)",
  },
  {
    id: "mst",
    icon: "🌉",
    title: "Minimum Spanning Tree",
    accent: "var(--accent-6)",
  },
  {
    id: "advanced",
    icon: "🧬",
    title: "Advanced Graph",
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
  const technique = getTechniqueData("graphs", base.id);
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

export const graphTechniques = TECHNIQUE_ORDER.map(normalizeTechnique).filter(
  Boolean,
);
