import { listTechniqueProblems } from "./problems";

const fastAndSlow = listTechniqueProblems(
  "linked-list",
  "fast-slow-pointers",
).map((problem) => ({
  name: problem.title,
  href: `/linked-list/fast-slow-pointers/${problem.problemSlug}`,
}));

const dummyNode = listTechniqueProblems("linked-list", "dummy-node").map(
  (problem) => ({
    name: problem.title,
    href: `/linked-list/dummy-node/${problem.problemSlug}`,
  }),
);

const recursion = listTechniqueProblems("linked-list", "recursion").map(
  (problem) => ({
    name: problem.title,
    href: `/linked-list/recursion/${problem.problemSlug}`,
  }),
);

const inPlaceReversal = listTechniqueProblems(
  "linked-list",
  "in-place-reversal",
).map((problem) => ({
  name: problem.title,
  href: `/linked-list/in-place-reversal/${problem.problemSlug}`,
}));

console.log("Fast & Slow Pointers Problems:", fastAndSlow);
console.log("In-Place Reversal Problems:", inPlaceReversal);

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
  {
    id: "dummy-node",
    icon: "🧱",
    iconClass: "dummy",
    title: "Dummy Node",
    desc: "Use a dummy node to simplify edge cases in linked list operations.",
    link: "/linked-list/dummy-node",
    problems: [...dummyNode],
  },
  {
    id: "recursion",
    icon: "�",
    iconClass: "recursion",
    title: "Recursion",
    desc: "Use recursive calls to solve linked list problems — often more intuitive than iterative approaches.",
    link: "/linked-list/recursion",
    problems: [...recursion],
  },
  {
    id: "in-place-reversal",
    icon: "�",
    iconClass: "reverse",
    title: "In-Place Reversal",
    desc: "Reverse a linked list in-place without using extra memory.",
    link: "/linked-list/in-place-reversal",
    problems: [...inPlaceReversal],
  },
];
