import { useState, useCallback, useRef, useEffect } from "react";
import ProblemLayout from "../../../../components/problems/ProblemLayout";
const THEME = {
  light: {
    "--c-bg": "#FAF9F7",
    "--c-bg-raised": "#FFFFFF",
    "--c-bg-inset": "#F3F1ED",
    "--c-bg-code": "#1C1917",
    "--c-text": "#1C1917",
    "--c-text-secondary": "#78716C",
    "--c-text-tertiary": "#A8A29E",
    "--c-text-inverse": "#FAF9F7",
    "--c-border": "#E7E5E4",
    "--c-border-focus": "#D97706",
    "--c-accent": "#D97706",
    "--c-accent-soft": "rgba(217,119,6,.10)",
    "--c-accent-med": "rgba(217,119,6,.18)",
    "--c-success": "#059669",
    "--c-success-soft": "rgba(5,150,105,.10)",
    "--c-danger": "#DC2626",
    "--c-danger-soft": "rgba(220,38,38,.10)",
    "--c-info": "#2563EB",
    "--c-info-soft": "rgba(37,99,235,.10)",
    "--c-tag-bg": "#F5F0EB",
    "--c-tag-text": "#92400E",
    "--c-card-shadow":
      "0 1px 3px rgba(28,25,23,.04), 0 4px 16px rgba(28,25,23,.03)",
    "--c-card-hover":
      "0 2px 8px rgba(28,25,23,.06), 0 8px 32px rgba(28,25,23,.06)",
    "--c-code-header": "#292524",
    "--c-code-line": "#A8A29E",
    "--c-code-text": "#E7E5E4",
    "--c-code-keyword": "#F59E0B",
    "--c-code-string": "#34D399",
    "--c-code-comment": "#78716C",
    "--c-code-number": "#FB923C",
  },
  dark: {
    "--c-bg": "#0C0A09",
    "--c-bg-raised": "#1C1917",
    "--c-bg-inset": "#292524",
    "--c-bg-code": "#0C0A09",
    "--c-text": "#FAF9F7",
    "--c-text-secondary": "#A8A29E",
    "--c-text-tertiary": "#78716C",
    "--c-text-inverse": "#1C1917",
    "--c-border": "#292524",
    "--c-border-focus": "#F59E0B",
    "--c-accent": "#F59E0B",
    "--c-accent-soft": "rgba(245,158,11,.12)",
    "--c-accent-med": "rgba(245,158,11,.22)",
    "--c-success": "#34D399",
    "--c-success-soft": "rgba(52,211,153,.12)",
    "--c-danger": "#F87171",
    "--c-danger-soft": "rgba(248,113,113,.12)",
    "--c-info": "#60A5FA",
    "--c-info-soft": "rgba(96,165,250,.12)",
    "--c-tag-bg": "rgba(245,158,11,.12)",
    "--c-tag-text": "#F59E0B",
    "--c-card-shadow": "0 1px 3px rgba(0,0,0,.2), 0 4px 16px rgba(0,0,0,.15)",
    "--c-card-hover": "0 2px 8px rgba(0,0,0,.3), 0 8px 32px rgba(0,0,0,.2)",
    "--c-code-header": "#1C1917",
    "--c-code-line": "#57534E",
    "--c-code-text": "#D6D3D1",
    "--c-code-keyword": "#F59E0B",
    "--c-code-string": "#34D399",
    "--c-code-comment": "#78716C",
    "--c-code-number": "#FB923C",
  },
};

const v = (name) => `var(${name})`;

/* ================================================================
   📋  pages/TwoSum.jsx  —  PROBLEM DATA
   All approach data lives here. Swap this file for a new problem.
   ================================================================ */
const TWO_SUM_DATA = {
  breadcrumb: ["Arrays", "Two Pointers", "Two Sum"],
  title: "Two Sum",
  difficulty: "Easy",
  problemSlug: "two-sum",
  categoryPath: "arrays/two-pointers",
  tags: ["Array", "Hash Map", "Two Pointers", "Sorting"],
  description:
    "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.",
  examples: [
    {
      input: "nums = [2,7,11,15], target = 9",
      output: "[0,1]",
      explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
    },
    {
      input: "nums = [3,2,4], target = 6",
      output: "[1,2]",
      explanation: "Because nums[1] + nums[2] == 6, we return [1, 2].",
    },
    { input: "nums = [3,3], target = 6", output: "[0,1]", explanation: null },
  ],
  constraints: [
    "2 ≤ nums.length ≤ 10⁴",
    "-10⁹ ≤ nums[i] ≤ 10⁹",
    "-10⁹ ≤ target ≤ 10⁹",
    "Only one valid answer exists.",
  ],
  approaches: [
    /* ============ 1. Brute Force ============ */
    {
      title: "Brute Force — Nested Loops",
      badge: "Brute Force",
      intuition:
        "The simplest approach: for every element, scan every other element to see if they add up to the target. This checks all possible pairs exhaustively — easy to understand, easy to code, but slow on large inputs because it does redundant work.",
      steps: [
        "Iterate through the array with index i from 0 to n-2.",
        "For each i, iterate with index j from i+1 to n-1.",
        "If nums[i] + nums[j] equals target, return [i, j].",
        "If no pair found after all iterations, return an empty array.",
      ],
      code: `function twoSum(nums, target) {
  const n = nums.length;

  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) {
      if (nums[i] + nums[j] === target) {
        return [i, j];
      }
    }
  }

  return []; // no pair found
}`,
      language: "javascript",
      timeComplexity: "O(n²)",
      timeType: "bad",
      spaceComplexity: "O(1)",
      spaceType: "good",
      pros: [
        "Extremely simple to implement and explain",
        "No extra memory needed — O(1) space",
        "Works on unsorted arrays without preprocessing",
      ],
      cons: [
        "Quadratic time makes it impractical for large n",
        "Redundant comparisons — every pair checked twice conceptually",
        "Interviewers expect you to improve beyond this",
      ],
      talkingPoints: [
        '"My first instinct is brute force — check every pair. That\'s O(n²) time but O(1) space. Let me optimize."',
        '"The nested loop checks n*(n-1)/2 pairs. We can do better by trading space for time."',
        '"This establishes correctness. Now I\'ll look for a way to eliminate the inner loop."',
      ],
      visualLink:
        "/legacy/Arrays/two-pointers/Two-Sum/1-bruteforce-visualization.html",
      notesLink: "",
    },
    /* ============ 2. Sort + Two Pointers ============ */
    {
      title: "Sort + Two Pointers",
      badge: "Improved",
      intuition:
        "If the array were sorted, we could use two pointers converging from both ends: if the sum is too small, advance the left pointer; if too big, retreat the right. Sorting costs O(n log n) but the scan is O(n). The catch: sorting destroys original indices, so we must store them beforehand.",
      steps: [
        "Create an array of [value, originalIndex] pairs.",
        "Sort this array by value in ascending order.",
        "Place left pointer at index 0, right pointer at the last index.",
        "While left < right: compute sum of values at both pointers.",
        "If sum === target → return original indices.",
        "If sum < target → move left pointer right (need larger value).",
        "If sum > target → move right pointer left (need smaller value).",
      ],
      code: `function twoSum(nums, target) {
  // Preserve original indices before sorting
  const indexed = nums.map((val, idx) => [val, idx]);
  indexed.sort((a, b) => a[0] - b[0]);

  let left = 0;
  let right = indexed.length - 1;

  while (left < right) {
    const sum = indexed[left][0] + indexed[right][0];

    if (sum === target) {
      return [indexed[left][1], indexed[right][1]];
    } else if (sum < target) {
      left++;   // need a larger sum
    } else {
      right--;  // need a smaller sum
    }
  }

  return [];
}`,
      language: "javascript",
      timeComplexity: "O(n log n)",
      timeType: "warning",
      spaceComplexity: "O(n)",
      spaceType: "warning",
      pros: [
        "Demonstrates the Two Pointers pattern explicitly",
        "Efficient scan after sorting — linear pass",
        "Great for follow-up: 'what if you need all pairs?'",
      ],
      cons: [
        "Sorting adds O(n log n) overhead",
        "Requires O(n) extra space to preserve indices",
        "Not optimal for this specific problem — HashMap is faster",
      ],
      talkingPoints: [
        '"Sorting enables the Two Pointers technique — I can shrink the search space from both ends in O(n)."',
        '"The total is O(n log n) for sort + O(n) for scan. Better than brute force but not optimal."',
        '"I need to preserve original indices since sorting rearranges the array — I\'ll use index pairs."',
      ],
      visualLink:
        "/legacy/Arrays/two-pointers/Two-Sum/1-hashmap-visualization.html",
      notesLink: "",
    },
    /* ============ 3. Hash Map ============ */
    {
      title: "Hash Map — One Pass",
      badge: "Optimal",
      intuition:
        "For each element, we know exactly what complement we need: target - nums[i]. Instead of scanning the entire array to find it, we ask a Hash Map in O(1). As we iterate, we build the map simultaneously — checking if the complement exists, then storing the current value. One pass, one lookup per element.",
      steps: [
        "Create an empty Hash Map: value → index.",
        "Iterate through the array with index i.",
        "Compute complement = target - nums[i].",
        "Check if complement exists in the map.",
        "If yes → return [map.get(complement), i] — pair found!",
        "If no → store nums[i] → i in the map for future lookups.",
        "Continue until pair is found.",
      ],
      code: `function twoSum(nums, target) {
  const map = new Map(); // value -> index

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];

    if (map.has(complement)) {
      return [map.get(complement), i];
    }

    map.set(nums[i], i);
  }

  return []; // guaranteed to find, per constraints
}`,
      language: "javascript",
      timeComplexity: "O(n)",
      timeType: "good",
      spaceComplexity: "O(n)",
      spaceType: "warning",
      pros: [
        "Optimal time complexity — single linear pass",
        "Clean, elegant, and easy to explain",
        "No sorting needed — preserves original indices naturally",
        "Works with unsorted, negative, and duplicate values",
      ],
      cons: [
        "Uses O(n) extra space for the Hash Map",
        "Hash collisions could degrade to O(n) lookup in theory (rare)",
        "Doesn't directly demonstrate Two Pointers (but shows trade-off awareness)",
      ],
      talkingPoints: [
        '"I can trade O(n) space for O(n) time by using a Hash Map to store seen values."',
        '"For each element, I check if its complement already exists in the map — that\'s an O(1) lookup."',
        '"Building the map as I go means I only need one pass — each element is processed exactly once."',
        '"This is the standard optimal solution interviewers expect for Two Sum."',
      ],
      visualLink:
        "/legacy/Arrays/two-pointers/Two-Sum/1-twopointers-visualization.html",
      notesLink: "",
    },
  ],
};

/* ================================================================
   🎬  ROOT COMPONENT — wires theme + renders page
   ================================================================ */
export default function TwoSumPage() {
  const [theme, setTheme] = useState("light");
  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  /* Apply theme variables to a wrapper */
  const themeVars = THEME[theme];

  return (
    <div style={{ ...themeVars }}>
      {/* Load DM Sans + DM Mono from Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: 'DM Sans', sans-serif; }
        ::selection { background: rgba(217,119,6,.25); }
        @media (max-width: 640px) {
          .approach-proscons { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <ProblemLayout
        {...TWO_SUM_DATA}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    </div>
  );
}

/* ================================================================
   Shared text styles
   ================================================================ */
const styles = {
  body: {
    fontSize: ".88rem",
    color: v("--c-text-secondary"),
    lineHeight: 1.65,
  },
};
