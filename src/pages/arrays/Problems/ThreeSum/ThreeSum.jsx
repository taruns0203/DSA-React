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
// const THREE_SUM_DATA = {
//   breadcrumb: ["Arrays", "Two Pointers", "Three Sum"],
//   title: "Three Sum",
//   difficulty: "Medium",
//   problemSlug: "three-sum",
//   categoryPath: "arrays/two-pointers",
//   tags: ["Array", "Hash Map", "Two Pointers", "Sorting"],
//   description:
//     "Given an integer array, find all unique triplets that sum to zero. Unlike Two Sum, this problem requires finding multiple solutions while avoiding duplicate triplets..",
//   examples: [],
//   constraints: [],
//   approaches: [
//     /* ============ 1. Brute Force ============ */
//     {
//       title: "Brute Force — Three Nested Loops + Set",
//       badge: "Brute Force",
//       intuition:
//         "Check every combination of three elements. If they sum to zero, add to result. Use a set to avoid duplicates by sorting each triplet.",
//       code: `function threeSum(nums) {
//     const n = nums.length;
//     const set = new Set();

//     for (let i = 0; i < n - 2; i++) {
//         for (let j = i + 1; j < n - 1; j++) {
//             for (let k = j + 1; k < n; k++) {
//                 if (nums[i] + nums[j] + nums[k] === 0) {
//                     const triplet = [nums[i], nums[j], nums[k]].sort((a, b) => a - b);
//                     set.add(triplet.join(','));
//                 }
//             }
//         }
//     }

//     return Array.from(set).map(s => s.split(',').map(Number));
// }`,
//       steps: [],
//       talkingPoints: [],
//       pros: [],
//       cons: [],
//       language: "javascript",
//       timeComplexity: "O(n^3)",
//       timeType: "bad",
//       spaceComplexity: "O(1)",
//       spaceType: "good",
//       visualLink:
//         "/legacy/Arrays/two-pointers/Three-Sum/1-bruteforce-visualization.html",
//       notesLink: "",
//     },
//     /* ============ 2. Hash Set for Third Element ============ */
//     {
//       title: "Hash Set for Third Element",
//       badge: "Improved",
//       intuition:
//         "Fix two elements (i, j), then use a hash set to find if -(nums[i] + nums[j]) exists. Reduces from O(n³) to O(n²)",
//       steps: [],
//       code: `function threeSum(nums) {
//     const n = nums.length;
//     const result = new Set();

//     for (let i = 0; i < n - 1; i++) {
//         const seen = new Set();

//         for (let j = i + 1; j < n; j++) {
//             const complement = -(nums[i] + nums[j]);

//             if (seen.has(complement)) {
//                 const triplet = [nums[i], nums[j], complement].sort((a, b) => a - b);
//                 result.add(triplet.join(','));
//             }

//             seen.add(nums[j]);
//         }
//     }

//     return Array.from(result).map(s => s.split(',').map(Number));
// }`,
//       language: "javascript",
//       timeComplexity: "O(n²)",
//       timeType: "warning",
//       spaceComplexity: "O(n)",
//       spaceType: "warning",
//       pros: [],
//       cons: [],
//       talkingPoints: [],
//       visualLink:
//         "/legacy/Arrays/two-pointers/Three-Sum/2-hashset-visualization.html",
//       notesLink: "",
//     },
//     /* ============ 3. Sort + Two Pointers ============ */
//     {
//       title: "Sort + Two Pointers",
//       badge: "Optimal",
//       intuition:
//         "First, sort the array so that you can efficiently apply the two-pointer technique and easily skip duplicates. Then, fix the first element and apply the Two Sum II (two-pointer) approach to the remaining elements. At each level, skip duplicate values to ensure that no duplicate triplets are included in the result.",
//       steps: [],
//       code: `function threeSum(nums) {
//     nums.sort((a, b) => a - b);
//     const result = [];
//     const n = nums.length;

//     for (let i = 0; i < n - 2; i++) {
//         // Skip duplicate first elements
//         if (i > 0 && nums[i] === nums[i - 1]) continue;

//         // Early termination: smallest positive means no more solutions
//         if (nums[i] > 0) break;

//         let left = i + 1;
//         let right = n - 1;
//         const target = -nums[i];

//         while (left < right) {
//             const sum = nums[left] + nums[right];

//             if (sum === target) {
//                 result.push([nums[i], nums[left], nums[right]]);

//                 // Skip duplicates for left and right
//                 while (left < right && nums[left] === nums[left + 1]) left++;
//                 while (left < right && nums[right] === nums[right - 1]) right--;

//                 left++;
//                 right--;
//             } else if (sum < target) {
//                 left++;
//             } else {
//                 right--;
//             }
//         }
//     }

//     return result;
// }`,
//       language: "javascript",
//       timeComplexity: "O(n²) — O(n log n) sort + O(n) × O(n) two pointers",
//       timeType: "good",
//       spaceComplexity: "O(1) or O(n) depending on sort implementation",
//       spaceType: "warning",
//       pros: [],
//       cons: [],
//       talkingPoints: [],
//       visualLink:
//         "/legacy/Arrays/two-pointers/Three-Sum/3-twopointers-visualization.html",
//       notesLink: "",
//     },
//   ],
// };

const THREE_SUM_DATA = {
  breadcrumb: ["Arrays", "Two Pointers", "Three Sum"],
  title: "Three Sum",
  difficulty: "Medium",
  problemSlug: "three-sum",
  categoryPath: "arrays/two-pointers",
  tags: ["Array", "Hash Set", "Two Pointers", "Sorting"],
  description:
    "Given an integer array nums, return all unique triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0. The solution set must not contain duplicate triplets.",
  examples: [
    {
      input: "nums = [-1,0,1,2,-1,-4]",
      output: "[[-1,-1,2],[-1,0,1]]",
      explanation:
        "After removing duplicates, the valid triplets that sum to zero are [-1,-1,2] and [-1,0,1].",
    },
    {
      input: "nums = [0,1,1]",
      output: "[]",
      explanation: "No three numbers sum to 0.",
    },
    {
      input: "nums = [0,0,0]",
      output: "[[0,0,0]]",
      explanation: "Only one valid triplet exists.",
    },
  ],
  constraints: ["3 ≤ nums.length ≤ 3000", "-10⁵ ≤ nums[i] ≤ 10⁵"],
  approaches: [
    /* ============ 1. Brute Force ============ */
    {
      title: "Brute Force — Three Nested Loops + Set",
      badge: "Brute Force",
      intuition:
        "Check every possible combination of three elements. If their sum is zero, store the sorted triplet in a Set to automatically avoid duplicates.",
      steps: [
        "Iterate i from 0 to n-3.",
        "Iterate j from i+1 to n-2.",
        "Iterate k from j+1 to n-1.",
        "If nums[i] + nums[j] + nums[k] === 0, sort the triplet.",
        "Store the sorted triplet in a Set to avoid duplicates.",
        "Convert Set back to array at the end.",
      ],
      code: `function threeSum(nums) {
    const n = nums.length;
    const set = new Set();

    for (let i = 0; i < n - 2; i++) {
        for (let j = i + 1; j < n - 1; j++) {
            for (let k = j + 1; k < n; k++) {
                if (nums[i] + nums[j] + nums[k] === 0) {
                    const triplet = [nums[i], nums[j], nums[k]].sort((a, b) => a - b);
                    set.add(triplet.join(','));
                }
            }
        }
    }

    return Array.from(set).map(s => s.split(',').map(Number));
}`,
      language: "javascript",
      timeComplexity: "O(n³)",
      timeType: "bad",
      spaceComplexity: "O(n)",
      spaceType: "warning",
      pros: ["Very straightforward logic", "Easy to reason about correctness"],
      cons: [
        "Cubic time complexity",
        "Sorting each triplet adds extra overhead",
      ],
      talkingPoints: [
        '"This guarantees correctness but is too slow for n up to 3000."',
        '"We need to eliminate one loop to improve performance."',
      ],
      visualLink:
        "/legacy/Arrays/two-pointers/Three-Sum/1-bruteforce-visualization.html",
      notesLink: "",
    },

    /* ============ 2. Improved ============ */
    {
      title: "Improved — Fix Two + Hash Set",
      badge: "Improved",
      intuition:
        "Fix the first element i. For each second element j, compute the required third value as -(nums[i] + nums[j]). Use a Hash Set to check in O(1) time whether it exists in the remaining part of the array.",
      steps: [
        "Iterate i from 0 to n-2.",
        "For each i, create an empty Hash Set.",
        "Iterate j from i+1 to n-1.",
        "Compute third = -(nums[i] + nums[j]).",
        "If third exists in the set, store the sorted triplet.",
        "Add nums[j] to the set.",
        "Use a global Set to avoid duplicate triplets.",
      ],
      code: `function threeSum(nums) {
    const n = nums.length;
    const result = new Set();

    for (let i = 0; i < n - 1; i++) {
        const seen = new Set();

        for (let j = i + 1; j < n; j++) {
            const complement = -(nums[i] + nums[j]);

            if (seen.has(complement)) {
                const triplet = [nums[i], nums[j], complement].sort((a, b) => a - b);
                result.add(triplet.join(','));
            }

            seen.add(nums[j]);
        }
    }

    return Array.from(result).map(s => s.split(',').map(Number));
}`,
      language: "javascript",
      timeComplexity: "O(n²)",
      timeType: "warning",
      spaceComplexity: "O(n)",
      spaceType: "warning",
      pros: [
        "Reduces time from O(n³) to O(n²)",
        "Cleaner than brute force",
        "Uses Hash Set for faster lookup",
      ],
      cons: [
        "Still needs a Set to remove duplicate triplets",
        "Extra space usage",
      ],
      talkingPoints: [
        '"We eliminated one loop by using a Hash Set for the third element."',
        '"Time complexity drops to O(n²), which is acceptable."',
        '"Duplicate handling still needs attention."',
      ],
      visualLink:
        "/legacy/Arrays/two-pointers/Three-Sum/2-hashset-visualization.html",
      notesLink: "",
    },

    /* ============ 3. Optimal ============ */
    {
      title: "Optimal — Sort + Two Pointers",
      badge: "Optimal",
      intuition:
        "Sort the array first. Fix the first element, then reduce the problem to Two Sum using two pointers on the remaining portion. Skipping duplicates at each level ensures unique triplets.",
      steps: [
        "Sort the array in ascending order.",
        "Iterate i from 0 to n-3.",
        "Skip duplicate values for i.",
        "Set left = i+1 and right = n-1.",
        "While left < right:",
        "If sum === 0 → add triplet and skip duplicates.",
        "If sum < 0 → move left pointer right.",
        "If sum > 0 → move right pointer left.",
      ],
      code: `function threeSum(nums) {
    nums.sort((a, b) => a - b);
    const result = [];
    const n = nums.length;

    for (let i = 0; i < n - 2; i++) {
        // Skip duplicate first elements
        if (i > 0 && nums[i] === nums[i - 1]) continue;

        // Early termination: smallest positive means no more solutions
        if (nums[i] > 0) break;

        let left = i + 1;
        let right = n - 1;
        const target = -nums[i];

        while (left < right) {
            const sum = nums[left] + nums[right];

            if (sum === target) {
                result.push([nums[i], nums[left], nums[right]]);

                // Skip duplicates for left and right
                while (left < right && nums[left] === nums[left + 1]) left++;
                while (left < right && nums[right] === nums[right - 1]) right--;

                left++;
                right--;
            } else if (sum < target) {
                left++;
            } else {
                right--;
            }
        }
    }

    return result;
}`,
      language: "javascript",
      timeComplexity: "O(n²)",
      timeType: "good",
      spaceComplexity: "O(1) (excluding output)",
      spaceType: "good",
      pros: [
        "Clean duplicate handling",
        "No extra hash structures required",
        "Interview-standard optimal solution",
      ],
      cons: ["Requires sorting first"],
      talkingPoints: [
        '"Sorting helps because duplicates become adjacent and easy to skip."',
        '"For each fixed number, I reduce the problem to Two Sum II."',
        '"This gives O(n²) time with constant extra space."',
      ],
      visualLink:
        "/legacy/Arrays/two-pointers/Three-Sum/3-twopointers-visualization.html",
      notesLink: "",
    },
  ],
};

/* ================================================================
   🎬  ROOT COMPONENT — wires theme + renders page
   ================================================================ */
export default function ThreeSumPage() {
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
        {...THREE_SUM_DATA}
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
