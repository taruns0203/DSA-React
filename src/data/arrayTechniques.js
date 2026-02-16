import { listTechniqueProblems } from "./problems";

const twoPointersProblems = listTechniqueProblems("arrays", "two-pointers").map(
  (problem) => ({
    name: problem.title,
    href: `/arrays/two-pointers/${problem.problemSlug}`,
  }),
);

const mergeIntervalsProblems = listTechniqueProblems(
  "arrays",
  "merge-intervals",
).map((problem) => ({
  name: problem.title,
  href: `/arrays/merge-intervals/${problem.problemSlug}`,
}));

const sortingProblems = listTechniqueProblems("arrays", "sorting").map(
  (problem) => ({
    name: problem.title,
    href: `/arrays/sorting/${problem.problemSlug}`,
  }),
);

const slidingWindowProblems = listTechniqueProblems(
  "arrays",
  "sliding-window",
).map((problem) => ({
  name: problem.title,
  href: `/arrays/sliding-window/${problem.problemSlug}`,
}));

const prefixSumProblems = listTechniqueProblems("arrays", "prefix-sum").map(
  (problem) => ({
    name: problem.title,
    href: `/arrays/prefix-sum/${problem.problemSlug}`,
  }),
);

console.log("Two Pointers Problems:", twoPointersProblems);
console.log("Merge Intervals Problems:", mergeIntervalsProblems);
console.log("Sorting Problems:", sortingProblems);
export const arrayTechniques = [
  {
    id: "two-pointers",
    icon: "👆👆",
    iconClass: "pointers",
    title: "Two Pointers",
    desc: "Use two indices to scan from opposite ends or at different speeds — eliminates nested loops for O(n) solutions.",
    link: "/arrays/two-pointers",
    problems: [...twoPointersProblems],
  },
  {
    id: "merge-intervals",
    icon: "📐",
    iconClass: "intervals",
    title: "Merge Intervals",
    desc: "Sort intervals by start time, then merge overlapping ranges — a classic sweep-line approach for range problems.",
    link: "/arrays/merge-intervals",
    problems: [...mergeIntervalsProblems],
  },
  {
    id: "sorting",
    icon: "🔀",
    iconClass: "sorting",
    title: "Sorting",
    desc: "Leverage sorting as a preprocessing step to unlock efficient greedy, binary search, and partitioning strategies.",
    link: "/arrays/sorting",
    problems: [...sortingProblems],
  },
  {
    id: "sliding-window",
    icon: "🧱",
    iconClass: "window",
    title: "Sliding Window",
    desc: "Maintain a fixed-size window over an array to efficiently compute subarray properties like sum, max, min — useful for optimization problems.",
    link: "/arrays/sliding-window",
    problems: [...slidingWindowProblems],
  },
  {
    id: "prefix-sum",
    icon: "➕",
    iconClass: "prefix-sum",
    title: "Prefix Sum",
    desc: "Precompute cumulative sums to answer range sum queries in O(1) time — a powerful technique for subarray sum problems.",
    link: "/arrays/prefix-sum",
    problems: [...prefixSumProblems],
  },
];
