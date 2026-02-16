import { listTechniqueProblems } from "./problems";

const fastAndSlow = listTechniqueProblems(
  "linked-list",
  "fast-slow-pointers",
).map((problem) => ({
  name: problem.title,
  href: `/linked-list/fast-slow-pointers/${problem.problemSlug}`,
}));

console.log("Fast & Slow Pointers Problems:", fastAndSlow);

export const linkedListTechniques = [
  {
    id: "fast-slow-pointers",
    icon: "👆👆",
    iconClass: "pointers",
    title: "Fast & Slow Pointers",
    desc: "Use two indices moving at different speeds — eliminates nested loops for O(n) solutions.",
    link: "/linked-list/fast-slow-pointers",
    problems: [...fastAndSlow],
  },
];
