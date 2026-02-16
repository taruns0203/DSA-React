import arraysProblems from "./arrays.json";
import binarySearchTreeProblems from "./binary-search-tree.json";
import linkedListProblems from "./linked-list.json";
import stackQueuesProblems from "./stack-queues.json";

const dsaDataMap = {
  [arraysProblems.slug]: arraysProblems,
  [binarySearchTreeProblems.slug]: binarySearchTreeProblems,
  [linkedListProblems.slug]: linkedListProblems,
  [stackQueuesProblems.slug]: stackQueuesProblems,
};

function normalizeTechnique(technique) {
  return {
    title: technique?.title || "",
    description: technique?.description || "",
    problems: technique?.problems || {},
  };
}

export function getDsaData(dsaSlug) {
  return dsaDataMap[dsaSlug] || null;
}

export function getTechniqueData(dsaSlug, techniqueSlug) {
  const dsa = getDsaData(dsaSlug);
  if (!dsa) return null;
  const technique = dsa.techniques?.[techniqueSlug];
  return technique ? normalizeTechnique(technique) : null;
}

export function getProblemData(dsaSlug, techniqueSlug, problemSlug) {
  const technique = getTechniqueData(dsaSlug, techniqueSlug);
  if (!technique) return null;
  const directMatch = technique.problems?.[problemSlug];
  if (directMatch) return directMatch;

  // Fallback: resolve by the canonical slug field in case object keys differ.
  return (
    Object.values(technique.problems || {}).find(
      (problem) => problem?.problemSlug === problemSlug
    ) || null
  );
}

export function listTechniqueProblems(dsaSlug, techniqueSlug) {
  const technique = getTechniqueData(dsaSlug, techniqueSlug);
  if (!technique) return [];
  return Object.values(technique.problems || {});
}
