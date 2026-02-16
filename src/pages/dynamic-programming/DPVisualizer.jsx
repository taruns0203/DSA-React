import React, { useState, useEffect, useCallback, useRef } from "react";

/**
 * Dynamic Programming Complete Visualizer
 * =======================================
 * A comprehensive educational tool for understanding Dynamic Programming
 *
 * Featured Problems:
 * 1. Fibonacci Numbers - Basic DP introduction
 * 2. Climbing Stairs - Count ways problem
 * 3. Coin Change - Classic optimization
 * 4. Longest Common Subsequence (LCS) - String DP
 * 5. 0/1 Knapsack - Subset selection
 * 6. Edit Distance - String transformation
 *
 * Key Concepts:
 * - Optimal Substructure
 * - Overlapping Subproblems
 * - Memoization (Top-Down)
 * - Tabulation (Bottom-Up)
 */

// ============================================
// DP PROBLEM IMPLEMENTATIONS
// ============================================

// FIBONACCI
function solveFibonacci(n) {
  const steps = [];
  const dp = new Array(n + 1).fill(null);

  steps.push({
    type: "init",
    dp: [...dp],
    message: `Initialize DP array of size ${n + 1} with null values`,
    current: -1,
    dependencies: [],
    code: `dp = new Array(${n + 1}).fill(null);`,
  });

  // Base cases
  dp[0] = 0;
  steps.push({
    type: "base",
    dp: [...dp],
    message: "Base case: F(0) = 0",
    current: 0,
    dependencies: [],
    code: "dp[0] = 0; // Base case",
  });

  if (n >= 1) {
    dp[1] = 1;
    steps.push({
      type: "base",
      dp: [...dp],
      message: "Base case: F(1) = 1",
      current: 1,
      dependencies: [],
      code: "dp[1] = 1; // Base case",
    });
  }

  // Fill DP table
  for (let i = 2; i <= n; i++) {
    steps.push({
      type: "compute-start",
      dp: [...dp],
      message: `Computing F(${i}) = F(${i - 1}) + F(${i - 2}) = ${dp[i - 1]} + ${dp[i - 2]}`,
      current: i,
      dependencies: [i - 1, i - 2],
      code: `dp[${i}] = dp[${i - 1}] + dp[${i - 2}];`,
    });

    dp[i] = dp[i - 1] + dp[i - 2];

    steps.push({
      type: "compute-end",
      dp: [...dp],
      message: `F(${i}) = ${dp[i]}`,
      current: i,
      dependencies: [],
      code: `// dp[${i}] = ${dp[i]}`,
    });
  }

  steps.push({
    type: "complete",
    dp: [...dp],
    message: `Complete! F(${n}) = ${dp[n]}`,
    current: n,
    dependencies: [],
    result: dp[n],
    code: `return dp[${n}]; // ${dp[n]}`,
  });

  return { steps, result: dp[n], dp };
}

// CLIMBING STAIRS
function solveClimbingStairs(n) {
  const steps = [];
  const dp = new Array(n + 1).fill(null);

  steps.push({
    type: "init",
    dp: [...dp],
    message: `How many ways to climb ${n} stairs? (1 or 2 steps at a time)`,
    current: -1,
    dependencies: [],
    code: `dp = new Array(${n + 1}).fill(null);`,
  });

  dp[0] = 1; // 1 way to stay at ground
  dp[1] = 1; // 1 way to reach step 1

  steps.push({
    type: "base",
    dp: [...dp],
    message: "Base cases: dp[0] = 1 (at ground), dp[1] = 1 (one way to step 1)",
    current: 1,
    dependencies: [],
    code: "dp[0] = 1; dp[1] = 1;",
  });

  for (let i = 2; i <= n; i++) {
    steps.push({
      type: "compute-start",
      dp: [...dp],
      message: `Step ${i}: Can come from step ${i - 1} (1 step) or step ${i - 2} (2 steps)`,
      current: i,
      dependencies: [i - 1, i - 2],
      code: `dp[${i}] = dp[${i - 1}] + dp[${i - 2}];`,
    });

    dp[i] = dp[i - 1] + dp[i - 2];

    steps.push({
      type: "compute-end",
      dp: [...dp],
      message: `Ways to reach step ${i} = ${dp[i - 1]} + ${dp[i - 2]} = ${dp[i]}`,
      current: i,
      dependencies: [],
      code: `// dp[${i}] = ${dp[i]}`,
    });
  }

  steps.push({
    type: "complete",
    dp: [...dp],
    message: `Complete! ${dp[n]} ways to climb ${n} stairs`,
    current: n,
    dependencies: [],
    result: dp[n],
    code: `return dp[${n}]; // ${dp[n]}`,
  });

  return { steps, result: dp[n], dp };
}

// COIN CHANGE
function solveCoinChange(coins, amount) {
  const steps = [];
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;

  steps.push({
    type: "init",
    dp: dp.map((v) => (v === Infinity ? "∞" : v)),
    message: `Find minimum coins for amount ${amount}. Coins: [${coins.join(", ")}]`,
    current: -1,
    dependencies: [],
    coins,
    code: `dp = new Array(${amount + 1}).fill(Infinity); dp[0] = 0;`,
  });

  for (let i = 1; i <= amount; i++) {
    const deps = [];
    let minCoins = Infinity;
    let usedCoin = null;

    for (const coin of coins) {
      if (coin <= i && dp[i - coin] + 1 < minCoins) {
        minCoins = dp[i - coin] + 1;
        usedCoin = coin;
        deps.push(i - coin);
      }
    }

    steps.push({
      type: "compute-start",
      dp: dp.map((v) => (v === Infinity ? "∞" : v)),
      message: `Amount ${i}: Check each coin. Best: ${usedCoin ? `use coin ${usedCoin}, need ${minCoins} coins` : "impossible"}`,
      current: i,
      dependencies: deps,
      code: `for (coin of [${coins.join(",")}]) dp[${i}] = min(dp[${i}], dp[${i}-coin]+1);`,
    });

    dp[i] = minCoins;

    steps.push({
      type: "compute-end",
      dp: dp.map((v) => (v === Infinity ? "∞" : v)),
      message: `dp[${i}] = ${dp[i] === Infinity ? "∞ (impossible)" : dp[i]}`,
      current: i,
      dependencies: [],
      code: `// dp[${i}] = ${dp[i] === Infinity ? "∞" : dp[i]}`,
    });
  }

  const result = dp[amount] === Infinity ? -1 : dp[amount];
  steps.push({
    type: "complete",
    dp: dp.map((v) => (v === Infinity ? "∞" : v)),
    message: `Complete! Minimum coins for ${amount}: ${result === -1 ? "impossible" : result}`,
    current: amount,
    dependencies: [],
    result,
    code: `return dp[${amount}] === Infinity ? -1 : dp[${amount}]; // ${result}`,
  });

  return { steps, result, dp: dp.map((v) => (v === Infinity ? "∞" : v)) };
}

// LONGEST COMMON SUBSEQUENCE
function solveLCS(str1, str2) {
  const steps = [];
  const m = str1.length;
  const n = str2.length;
  const dp = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  steps.push({
    type: "init",
    dp: dp.map((row) => [...row]),
    message: `Find LCS of "${str1}" and "${str2}"`,
    current: [-1, -1],
    dependencies: [],
    str1,
    str2,
    code: `dp = Array(${m + 1}).fill().map(() => Array(${n + 1}).fill(0));`,
  });

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const char1 = str1[i - 1];
      const char2 = str2[j - 1];

      if (char1 === char2) {
        steps.push({
          type: "match",
          dp: dp.map((row) => [...row]),
          message: `Match! '${char1}' == '${char2}' at (${i},${j}). LCS extends: dp[${i}][${j}] = dp[${i - 1}][${j - 1}] + 1`,
          current: [i, j],
          dependencies: [[i - 1, j - 1]],
          code: `if (str1[${i - 1}] == str2[${j - 1}]) dp[${i}][${j}] = dp[${i - 1}][${j - 1}] + 1;`,
        });
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        steps.push({
          type: "no-match",
          dp: dp.map((row) => [...row]),
          message: `No match: '${char1}' != '${char2}'. Take max of excluding either character.`,
          current: [i, j],
          dependencies: [
            [i - 1, j],
            [i, j - 1],
          ],
          code: `dp[${i}][${j}] = max(dp[${i - 1}][${j}], dp[${i}][${j - 1}]);`,
        });
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }

      steps.push({
        type: "compute-end",
        dp: dp.map((row) => [...row]),
        message: `dp[${i}][${j}] = ${dp[i][j]}`,
        current: [i, j],
        dependencies: [],
        code: `// dp[${i}][${j}] = ${dp[i][j]}`,
      });
    }
  }

  // Backtrack to find the actual LCS
  let lcs = "";
  let i = m,
    j = n;
  while (i > 0 && j > 0) {
    if (str1[i - 1] === str2[j - 1]) {
      lcs = str1[i - 1] + lcs;
      i--;
      j--;
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }

  steps.push({
    type: "complete",
    dp: dp.map((row) => [...row]),
    message: `Complete! LCS length: ${dp[m][n]}, LCS: "${lcs}"`,
    current: [m, n],
    dependencies: [],
    result: dp[m][n],
    lcs,
    code: `return dp[${m}][${n}]; // ${dp[m][n]}, LCS = "${lcs}"`,
  });

  return { steps, result: dp[m][n], dp, lcs };
}

// 0/1 KNAPSACK
function solveKnapsack(weights, values, capacity) {
  const steps = [];
  const n = weights.length;
  const dp = Array(n + 1)
    .fill(null)
    .map(() => Array(capacity + 1).fill(0));

  steps.push({
    type: "init",
    dp: dp.map((row) => [...row]),
    message: `Knapsack: ${n} items, capacity ${capacity}. Weights: [${weights.join(",")}], Values: [${values.join(",")}]`,
    current: [-1, -1],
    dependencies: [],
    weights,
    values,
    capacity,
    code: `dp = Array(${n + 1}).fill().map(() => Array(${capacity + 1}).fill(0));`,
  });

  for (let i = 1; i <= n; i++) {
    const w = weights[i - 1];
    const v = values[i - 1];

    for (let j = 0; j <= capacity; j++) {
      if (w > j) {
        // Can't include item
        dp[i][j] = dp[i - 1][j];
        steps.push({
          type: "skip",
          dp: dp.map((row) => [...row]),
          message: `Item ${i} (w=${w}, v=${v}): Weight ${w} > capacity ${j}. Skip item.`,
          current: [i, j],
          dependencies: [[i - 1, j]],
          code: `dp[${i}][${j}] = dp[${i - 1}][${j}]; // Can't fit`,
        });
      } else {
        // Choose max of include or exclude
        const exclude = dp[i - 1][j];
        const include = dp[i - 1][j - w] + v;

        steps.push({
          type: "choice",
          dp: dp.map((row) => [...row]),
          message: `Item ${i} (w=${w}, v=${v}), cap=${j}: Exclude=${exclude}, Include=${include}`,
          current: [i, j],
          dependencies: [
            [i - 1, j],
            [i - 1, j - w],
          ],
          code: `dp[${i}][${j}] = max(dp[${i - 1}][${j}], dp[${i - 1}][${j - w}] + ${v});`,
        });

        dp[i][j] = Math.max(exclude, include);

        steps.push({
          type: "compute-end",
          dp: dp.map((row) => [...row]),
          message: `dp[${i}][${j}] = ${dp[i][j]} (${dp[i][j] === include ? "include" : "exclude"} item)`,
          current: [i, j],
          dependencies: [],
          code: `// dp[${i}][${j}] = ${dp[i][j]}`,
        });
      }
    }
  }

  steps.push({
    type: "complete",
    dp: dp.map((row) => [...row]),
    message: `Complete! Maximum value: ${dp[n][capacity]}`,
    current: [n, capacity],
    dependencies: [],
    result: dp[n][capacity],
    code: `return dp[${n}][${capacity}]; // ${dp[n][capacity]}`,
  });

  return { steps, result: dp[n][capacity], dp };
}

// EDIT DISTANCE
function solveEditDistance(str1, str2) {
  const steps = [];
  const m = str1.length;
  const n = str2.length;
  const dp = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  // Initialize base cases
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  steps.push({
    type: "init",
    dp: dp.map((row) => [...row]),
    message: `Edit Distance: "${str1}" → "${str2}". Base cases: converting to/from empty string.`,
    current: [-1, -1],
    dependencies: [],
    str1,
    str2,
    code: `dp[i][0] = i; dp[0][j] = j; // Delete all or insert all`,
  });

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const char1 = str1[i - 1];
      const char2 = str2[j - 1];

      if (char1 === char2) {
        dp[i][j] = dp[i - 1][j - 1];
        steps.push({
          type: "match",
          dp: dp.map((row) => [...row]),
          message: `'${char1}' == '${char2}': No operation needed. dp[${i}][${j}] = dp[${i - 1}][${j - 1}] = ${dp[i][j]}`,
          current: [i, j],
          dependencies: [[i - 1, j - 1]],
          code: `if (str1[${i - 1}] == str2[${j - 1}]) dp[${i}][${j}] = dp[${i - 1}][${j - 1}];`,
        });
      } else {
        const replace = dp[i - 1][j - 1] + 1;
        const del = dp[i - 1][j] + 1;
        const insert = dp[i][j - 1] + 1;
        const min = Math.min(replace, del, insert);
        const op =
          min === replace ? "replace" : min === del ? "delete" : "insert";

        steps.push({
          type: "operation",
          dp: dp.map((row) => [...row]),
          message: `'${char1}' != '${char2}': Replace=${replace}, Delete=${del}, Insert=${insert}. Best: ${op}`,
          current: [i, j],
          dependencies: [
            [i - 1, j - 1],
            [i - 1, j],
            [i, j - 1],
          ],
          code: `dp[${i}][${j}] = 1 + min(dp[${i - 1}][${j - 1}], dp[${i - 1}][${j}], dp[${i}][${j - 1}]);`,
        });

        dp[i][j] = min;

        steps.push({
          type: "compute-end",
          dp: dp.map((row) => [...row]),
          message: `dp[${i}][${j}] = ${dp[i][j]} (${op})`,
          current: [i, j],
          dependencies: [],
          code: `// dp[${i}][${j}] = ${dp[i][j]}`,
        });
      }
    }
  }

  steps.push({
    type: "complete",
    dp: dp.map((row) => [...row]),
    message: `Complete! Edit distance: ${dp[m][n]} operations`,
    current: [m, n],
    dependencies: [],
    result: dp[m][n],
    code: `return dp[${m}][${n}]; // ${dp[m][n]}`,
  });

  return { steps, result: dp[m][n], dp };
}

// ============================================
// MAIN VISUALIZER COMPONENT
// ============================================
export default function DPVisualizer() {
  // State
  const [problem, setProblem] = useState("fibonacci");
  const [inputValues, setInputValues] = useState({ n: 8 });
  const [animationSteps, setAnimationSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(600);
  const [displayDp, setDisplayDp] = useState([]);
  const [currentCell, setCurrentCell] = useState(null);
  const [dependencies, setDependencies] = useState([]);
  const [explanation, setExplanation] = useState(
    "Welcome to Dynamic Programming Visualizer! Select a problem and click Execute.",
  );
  const [codeSnippet, setCodeSnippet] = useState("");
  const [result, setResult] = useState(null);
  const [showEducation, setShowEducation] = useState(true);
  const [extraData, setExtraData] = useState({});

  const animationRef = useRef(null);

  // Problem configurations
  const problems = [
    { value: "fibonacci", label: "🔢 Fibonacci Numbers", type: "1D" },
    { value: "climbing", label: "🪜 Climbing Stairs", type: "1D" },
    { value: "coinChange", label: "💰 Coin Change", type: "1D" },
    { value: "lcs", label: "🔤 Longest Common Subsequence", type: "2D" },
    { value: "knapsack", label: "🎒 0/1 Knapsack", type: "2D" },
    { value: "editDistance", label: "✏️ Edit Distance", type: "2D" },
  ];

  // Problem-specific complexity info
  const complexityInfo = {
    fibonacci: {
      time: "O(n)",
      space: "O(n) or O(1)",
      recurrence: "F(n) = F(n-1) + F(n-2)",
      bruteForce: "O(2^n)",
    },
    climbing: {
      time: "O(n)",
      space: "O(n) or O(1)",
      recurrence: "dp[i] = dp[i-1] + dp[i-2]",
      bruteForce: "O(2^n)",
    },
    coinChange: {
      time: "O(n × amount)",
      space: "O(amount)",
      recurrence: "dp[i] = min(dp[i], dp[i-coin] + 1)",
      bruteForce: "O(amount^n)",
    },
    lcs: {
      time: "O(m × n)",
      space: "O(m × n) or O(min(m,n))",
      recurrence:
        "dp[i][j] = dp[i-1][j-1]+1 if match, else max(dp[i-1][j], dp[i][j-1])",
      bruteForce: "O(2^(m+n))",
    },
    knapsack: {
      time: "O(n × W)",
      space: "O(n × W) or O(W)",
      recurrence: "dp[i][w] = max(dp[i-1][w], dp[i-1][w-wt[i]] + val[i])",
      bruteForce: "O(2^n)",
    },
    editDistance: {
      time: "O(m × n)",
      space: "O(m × n) or O(min(m,n))",
      recurrence: "dp[i][j] = min(replace, insert, delete) + 1",
      bruteForce: "O(3^(m+n))",
    },
  };

  // Problem descriptions
  const problemDescriptions = {
    fibonacci:
      "Find the nth Fibonacci number. Each number is the sum of the two preceding ones.",
    climbing:
      "Count distinct ways to climb n stairs, taking 1 or 2 steps at a time.",
    coinChange:
      "Find minimum coins needed to make up an amount using given coin denominations.",
    lcs: "Find the longest subsequence common to two strings (characters in order, not necessarily contiguous).",
    knapsack:
      "Maximize value of items in a knapsack without exceeding weight capacity. Each item used at most once.",
    editDistance:
      "Find minimum operations (insert, delete, replace) to transform one string into another.",
  };

  // Handle input changes
  const handleInputChange = (key, value) => {
    setInputValues((prev) => ({ ...prev, [key]: value }));
  };

  // Execute problem
  const executeOperation = useCallback(() => {
    let result;

    switch (problem) {
      case "fibonacci":
        result = solveFibonacci(Math.min(parseInt(inputValues.n) || 8, 15));
        break;
      case "climbing":
        result = solveClimbingStairs(
          Math.min(parseInt(inputValues.n) || 8, 15),
        );
        break;
      case "coinChange": {
        const coins = (inputValues.coins || "1,2,5")
          .split(",")
          .map((c) => parseInt(c.trim()))
          .filter((c) => !isNaN(c));
        const amount = Math.min(parseInt(inputValues.amount) || 11, 20);
        result = solveCoinChange(coins, amount);
        setExtraData({ coins });
        break;
      }
      case "lcs": {
        const str1 = (inputValues.str1 || "ABCD").substring(0, 8);
        const str2 = (inputValues.str2 || "AEBD").substring(0, 8);
        result = solveLCS(str1, str2);
        setExtraData({ str1, str2 });
        break;
      }
      case "knapsack": {
        const weights = (inputValues.weights || "2,3,4,5")
          .split(",")
          .map((w) => parseInt(w.trim()))
          .filter((w) => !isNaN(w))
          .slice(0, 6);
        const values = (inputValues.values || "3,4,5,6")
          .split(",")
          .map((v) => parseInt(v.trim()))
          .filter((v) => !isNaN(v))
          .slice(0, 6);
        const capacity = Math.min(parseInt(inputValues.capacity) || 8, 12);
        result = solveKnapsack(weights, values, capacity);
        setExtraData({ weights, values, capacity });
        break;
      }
      case "editDistance": {
        const str1 = (inputValues.str1 || "HORSE").substring(0, 6);
        const str2 = (inputValues.str2 || "ROS").substring(0, 6);
        result = solveEditDistance(str1, str2);
        setExtraData({ str1, str2 });
        break;
      }
      default:
        return;
    }

    setAnimationSteps(result.steps);
    setCurrentStep(-1);
    setDisplayDp([]);
    setCurrentCell(null);
    setDependencies([]);
    setResult(null);
    setCodeSnippet("");
    setExplanation('🎬 Ready to animate! Click "Step" or "Play" to begin.');
  }, [problem, inputValues]);

  // Animation step handler
  useEffect(() => {
    if (currentStep >= 0 && currentStep < animationSteps.length) {
      const step = animationSteps[currentStep];
      setDisplayDp(step.dp);
      setCurrentCell(step.current);
      setDependencies(step.dependencies || []);
      setExplanation(step.message);
      setCodeSnippet(step.code || "");
      if (step.result !== undefined) {
        setResult(step.result);
      }
      if (step.lcs) {
        setExtraData((prev) => ({ ...prev, lcs: step.lcs }));
      }
    }
  }, [currentStep, animationSteps]);

  // Auto-play handler
  useEffect(() => {
    if (isPlaying && currentStep < animationSteps.length - 1) {
      animationRef.current = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, speed);
    } else if (currentStep >= animationSteps.length - 1) {
      setIsPlaying(false);
    }

    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [isPlaying, currentStep, animationSteps.length, speed]);

  // Control handlers
  const handleStep = () => {
    if (currentStep < animationSteps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePlay = () => {
    if (currentStep >= animationSteps.length - 1) {
      setCurrentStep(-1);
    }
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(-1);
    setDisplayDp([]);
    setCurrentCell(null);
    setDependencies([]);
    setResult(null);
    setCodeSnippet("");
    setExplanation("🔄 Reset. Ready to run again.");
  };

  const generateRandom = () => {
    switch (problem) {
      case "fibonacci":
      case "climbing":
        setInputValues({ n: Math.floor(Math.random() * 10) + 5 });
        break;
      case "coinChange":
        setInputValues({
          coins: "1,2,5",
          amount: Math.floor(Math.random() * 15) + 5,
        });
        break;
      case "lcs":
      case "editDistance": {
        const chars = "ABCDEFGH";
        const str1 = Array(4)
          .fill(0)
          .map(() => chars[Math.floor(Math.random() * chars.length)])
          .join("");
        const str2 = Array(4)
          .fill(0)
          .map(() => chars[Math.floor(Math.random() * chars.length)])
          .join("");
        setInputValues({ str1, str2 });
        break;
      }
      case "knapsack": {
        const n = Math.floor(Math.random() * 3) + 3;
        const weights = Array(n)
          .fill(0)
          .map(() => Math.floor(Math.random() * 5) + 1);
        const values = Array(n)
          .fill(0)
          .map(() => Math.floor(Math.random() * 8) + 2);
        setInputValues({
          weights: weights.join(","),
          values: values.join(","),
          capacity: Math.floor(Math.random() * 8) + 5,
        });
        break;
      }
      default:
        break;
    }
    setExplanation("🎲 Random input generated! Click Execute to run.");
  };

  // Check if cell is current
  const isCurrent = (i, j) => {
    if (Array.isArray(currentCell)) {
      return currentCell[0] === i && currentCell[1] === j;
    }
    return currentCell === i && j === undefined;
  };

  // Check if cell is dependency
  const isDependency = (i, j) => {
    if (!dependencies.length) return false;
    if (Array.isArray(dependencies[0])) {
      return dependencies.some((d) => d[0] === i && d[1] === j);
    }
    return dependencies.includes(i) && j === undefined;
  };

  // Get cell style
  const getCellStyle = (i, j, value) => {
    let bg = "#f1f5f9";
    let color = "#334155";
    let border = "2px solid #e2e8f0";
    let transform = "scale(1)";

    if (isCurrent(i, j)) {
      bg = "linear-gradient(135deg, #10b981, #059669)";
      color = "white";
      border = "2px solid #059669";
      transform = "scale(1.1)";
    } else if (isDependency(i, j)) {
      bg = "linear-gradient(135deg, #f59e0b, #d97706)";
      color = "white";
      border = "2px solid #d97706";
    } else if (value !== null && value !== "∞" && value !== 0) {
      bg = "linear-gradient(135deg, #6366f1, #8b5cf6)";
      color = "white";
    }

    return {
      ...styles.cell,
      background: bg,
      color,
      border,
      transform,
      transition: "all 0.3s ease",
    };
  };

  const currentProblem = problems.find((p) => p.value === problem);
  const is2D = currentProblem?.type === "2D";

  // Render input fields based on problem
  const renderInputs = () => {
    switch (problem) {
      case "fibonacci":
      case "climbing":
        return (
          <div style={styles.inputGroup}>
            <label style={styles.label}>n (target)</label>
            <input
              type="number"
              style={styles.input}
              value={inputValues.n || ""}
              onChange={(e) => handleInputChange("n", e.target.value)}
              placeholder="e.g., 8"
              min="1"
              max="15"
            />
          </div>
        );
      case "coinChange":
        return (
          <>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Coins (comma-separated)</label>
              <input
                type="text"
                style={styles.input}
                value={inputValues.coins || ""}
                onChange={(e) => handleInputChange("coins", e.target.value)}
                placeholder="e.g., 1,2,5"
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Target Amount</label>
              <input
                type="number"
                style={styles.input}
                value={inputValues.amount || ""}
                onChange={(e) => handleInputChange("amount", e.target.value)}
                placeholder="e.g., 11"
                min="1"
                max="20"
              />
            </div>
          </>
        );
      case "lcs":
      case "editDistance":
        return (
          <>
            <div style={styles.inputGroup}>
              <label style={styles.label}>String 1</label>
              <input
                type="text"
                style={styles.input}
                value={inputValues.str1 || ""}
                onChange={(e) =>
                  handleInputChange("str1", e.target.value.toUpperCase())
                }
                placeholder="e.g., ABCD"
                maxLength="8"
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>String 2</label>
              <input
                type="text"
                style={styles.input}
                value={inputValues.str2 || ""}
                onChange={(e) =>
                  handleInputChange("str2", e.target.value.toUpperCase())
                }
                placeholder="e.g., AEBD"
                maxLength="8"
              />
            </div>
          </>
        );
      case "knapsack":
        return (
          <>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Weights (comma-sep)</label>
              <input
                type="text"
                style={styles.input}
                value={inputValues.weights || ""}
                onChange={(e) => handleInputChange("weights", e.target.value)}
                placeholder="e.g., 2,3,4,5"
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Values (comma-sep)</label>
              <input
                type="text"
                style={styles.input}
                value={inputValues.values || ""}
                onChange={(e) => handleInputChange("values", e.target.value)}
                placeholder="e.g., 3,4,5,6"
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Capacity</label>
              <input
                type="number"
                style={styles.input}
                value={inputValues.capacity || ""}
                onChange={(e) => handleInputChange("capacity", e.target.value)}
                placeholder="e.g., 8"
                min="1"
                max="12"
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  // Render DP table
  const renderDPTable = () => {
    if (!displayDp.length) {
      return (
        <div style={styles.emptyState}>
          <p>DP table will appear here after execution</p>
        </div>
      );
    }

    if (is2D) {
      return (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.headerCell}></th>
                {problem === "knapsack" ? (
                  Array(displayDp[0].length)
                    .fill(0)
                    .map((_, j) => (
                      <th key={j} style={styles.headerCell}>
                        w={j}
                      </th>
                    ))
                ) : (
                  <>
                    <th style={styles.headerCell}>ε</th>
                    {(extraData.str2 || "").split("").map((c, j) => (
                      <th key={j} style={styles.headerCell}>
                        {c}
                      </th>
                    ))}
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {displayDp.map((row, i) => (
                <tr key={i}>
                  <th style={styles.headerCell}>
                    {problem === "knapsack"
                      ? i === 0
                        ? "0"
                        : `i=${i}`
                      : i === 0
                        ? "ε"
                        : (extraData.str1 || "")[i - 1]}
                  </th>
                  {row.map((val, j) => (
                    <td key={j} style={getCellStyle(i, j, val)}>
                      {val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } else {
      return (
        <div style={styles.array1D}>
          <div style={styles.arrayHeader}>
            {displayDp.map((_, i) => (
              <div key={i} style={styles.indexLabel}>
                {i}
              </div>
            ))}
          </div>
          <div style={styles.arrayRow}>
            {displayDp.map((val, i) => (
              <div key={i} style={getCellStyle(i, undefined, val)}>
                {val === null ? "-" : val}
              </div>
            ))}
          </div>
        </div>
      );
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.title}>🧩 Dynamic Programming Visualizer</h1>
        <p style={styles.subtitle}>
          Master DP through interactive step-by-step visualization
        </p>
      </header>

      <div style={styles.mainContent}>
        {/* Left Panel */}
        <div style={styles.leftPanel}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>⚙️ Control Panel</h2>

            {/* Problem Selector */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Select Problem</label>
              <select
                style={styles.select}
                value={problem}
                onChange={(e) => {
                  setProblem(e.target.value);
                  setAnimationSteps([]);
                  setCurrentStep(-1);
                  setDisplayDp([]);
                  setResult(null);
                  // Set default inputs
                  const p = e.target.value;
                  if (p === "fibonacci" || p === "climbing") {
                    setInputValues({ n: 8 });
                  } else if (p === "coinChange") {
                    setInputValues({ coins: "1,2,5", amount: 11 });
                  } else if (p === "lcs") {
                    setInputValues({ str1: "ABCD", str2: "AEBD" });
                  } else if (p === "knapsack") {
                    setInputValues({
                      weights: "2,3,4,5",
                      values: "3,4,5,6",
                      capacity: 8,
                    });
                  } else if (p === "editDistance") {
                    setInputValues({ str1: "HORSE", str2: "ROS" });
                  }
                }}
              >
                {problems.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Problem-specific inputs */}
            {renderInputs()}

            {/* Execute Button */}
            <button
              style={{
                ...styles.button,
                ...styles.primaryButton,
                width: "100%",
                marginTop: "8px",
              }}
              onClick={executeOperation}
            >
              ▶ Execute
            </button>

            {/* Animation Controls */}
            <div style={styles.controlSection}>
              <label style={styles.label}>Animation</label>
              <div style={styles.buttonGroup}>
                <button
                  style={{
                    ...styles.button,
                    ...styles.secondaryButton,
                    flex: 1,
                  }}
                  onClick={handleStep}
                  disabled={
                    currentStep >= animationSteps.length - 1 ||
                    animationSteps.length === 0
                  }
                >
                  ⏭ Step
                </button>
                {isPlaying ? (
                  <button
                    style={{
                      ...styles.button,
                      ...styles.warningButton,
                      flex: 1,
                    }}
                    onClick={handlePause}
                  >
                    ⏸ Pause
                  </button>
                ) : (
                  <button
                    style={{
                      ...styles.button,
                      ...styles.successButton,
                      flex: 1,
                    }}
                    onClick={handlePlay}
                    disabled={animationSteps.length === 0}
                  >
                    ▶ Play
                  </button>
                )}
              </div>
              <div style={styles.buttonGroup}>
                <button
                  style={{
                    ...styles.button,
                    ...styles.secondaryButton,
                    flex: 1,
                  }}
                  onClick={handleReset}
                >
                  ↺ Reset
                </button>
                <button
                  style={{ ...styles.button, ...styles.accentButton, flex: 1 }}
                  onClick={generateRandom}
                >
                  🎲 Random
                </button>
              </div>
            </div>

            {/* Speed Control */}
            <div style={styles.controlSection}>
              <label style={styles.label}>
                Speed:{" "}
                {speed <= 300 ? "Fast" : speed <= 600 ? "Medium" : "Slow"}
              </label>
              <input
                type="range"
                min="100"
                max="1200"
                value={1300 - speed}
                onChange={(e) => setSpeed(1300 - parseInt(e.target.value))}
                style={styles.slider}
              />
            </div>

            {/* Progress */}
            {animationSteps.length > 0 && (
              <div style={styles.progressContainer}>
                <div style={styles.progressLabel}>
                  Step {Math.max(0, currentStep + 1)} / {animationSteps.length}
                </div>
                <div style={styles.progressBar}>
                  <div
                    style={{
                      ...styles.progressFill,
                      width: `${((currentStep + 1) / animationSteps.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Legend */}
          <div style={{ ...styles.card, marginTop: "16px" }}>
            <h3 style={styles.cardTitle}>🎨 Color Legend</h3>
            <div style={styles.legend}>
              <div style={styles.legendItem}>
                <div
                  style={{
                    ...styles.legendDot,
                    background: "linear-gradient(135deg, #10b981, #059669)",
                  }}
                />
                <span>Current Cell</span>
              </div>
              <div style={styles.legendItem}>
                <div
                  style={{
                    ...styles.legendDot,
                    background: "linear-gradient(135deg, #f59e0b, #d97706)",
                  }}
                />
                <span>Dependencies</span>
              </div>
              <div style={styles.legendItem}>
                <div
                  style={{
                    ...styles.legendDot,
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  }}
                />
                <span>Computed</span>
              </div>
              <div style={styles.legendItem}>
                <div
                  style={{
                    ...styles.legendDot,
                    background: "#f1f5f9",
                    border: "2px solid #e2e8f0",
                  }}
                />
                <span>Not Yet Computed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Panel */}
        <div style={styles.centerPanel}>
          <div style={styles.card}>
            <div style={styles.vizHeader}>
              <h2 style={styles.cardTitle}>📊 DP Table Visualization</h2>
              <span style={styles.typeBadge}>{is2D ? "2D DP" : "1D DP"}</span>
            </div>

            {/* DP Table */}
            <div style={styles.tableContainer}>{renderDPTable()}</div>

            {/* Result Display */}
            {result !== null && (
              <div style={styles.resultBox}>
                <strong>🎯 Result: {result}</strong>
                {extraData.lcs && (
                  <span style={styles.lcsResult}>
                    {" "}
                    | LCS: "{extraData.lcs}"
                  </span>
                )}
              </div>
            )}

            {/* Explanation */}
            <div style={styles.explanationBox}>
              <div style={styles.explanationHeader}>
                <span style={styles.stepBadge}>
                  Step {Math.max(0, currentStep + 1)}
                </span>
                <span style={styles.problemBadge}>{currentProblem?.label}</span>
              </div>
              <p style={styles.explanationText}>{explanation}</p>
              {codeSnippet && (
                <div style={styles.codeBox}>
                  <code style={styles.codeText}>{codeSnippet}</code>
                </div>
              )}
            </div>

            {/* Recurrence Relation */}
            <div style={styles.recurrenceBox}>
              <h4 style={styles.recurrenceTitle}>📐 Recurrence Relation</h4>
              <code style={styles.recurrenceCode}>
                {complexityInfo[problem]?.recurrence}
              </code>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div style={styles.rightPanel}>
          <div style={styles.card}>
            <div style={styles.educationHeader}>
              <h2 style={styles.cardTitle}>📚 Learning Center</h2>
              <button
                style={styles.toggleBtn}
                onClick={() => setShowEducation(!showEducation)}
              >
                {showEducation ? "▲" : "▼"}
              </button>
            </div>

            {showEducation && (
              <>
                {/* Problem Description */}
                <div style={styles.educationSection}>
                  <h3 style={styles.sectionTitle}>💡 Problem</h3>
                  <p style={styles.sectionContent}>
                    {problemDescriptions[problem]}
                  </p>
                </div>

                {/* DP Concepts */}
                <div style={styles.educationSection}>
                  <h3 style={styles.sectionTitle}>🔑 Key DP Concepts</h3>
                  <div style={styles.conceptBox}>
                    <p style={styles.conceptItem}>
                      <strong>Optimal Substructure:</strong> Solution built from
                      optimal solutions to subproblems
                    </p>
                    <p style={styles.conceptItem}>
                      <strong>Overlapping Subproblems:</strong> Same subproblems
                      solved multiple times
                    </p>
                  </div>
                </div>

                {/* Complexity */}
                <div style={styles.educationSection}>
                  <h3 style={styles.sectionTitle}>📊 Complexity</h3>
                  <table style={styles.complexityTable}>
                    <tbody>
                      <tr>
                        <td style={styles.tableLabel}>Time (DP)</td>
                        <td style={styles.tableValue}>
                          {complexityInfo[problem]?.time}
                        </td>
                      </tr>
                      <tr>
                        <td style={styles.tableLabel}>Space</td>
                        <td style={styles.tableValue}>
                          {complexityInfo[problem]?.space}
                        </td>
                      </tr>
                      <tr>
                        <td style={styles.tableLabel}>Brute Force</td>
                        <td style={{ ...styles.tableValue, color: "#ef4444" }}>
                          {complexityInfo[problem]?.bruteForce}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Approaches */}
                <div style={styles.educationSection}>
                  <h3 style={styles.sectionTitle}>🔧 Two Approaches</h3>
                  <div style={styles.approachBox}>
                    <div style={styles.approach}>
                      <strong style={{ color: "#0891b2" }}>
                        Top-Down (Memoization)
                      </strong>
                      <p>Recursive + cache results</p>
                    </div>
                    <div style={styles.approach}>
                      <strong style={{ color: "#7c3aed" }}>
                        Bottom-Up (Tabulation)
                      </strong>
                      <p>Iterative, fill table (shown here)</p>
                    </div>
                  </div>
                </div>

                {/* Tips */}
                <div style={styles.educationSection}>
                  <h3 style={styles.sectionTitle}>💡 Interview Tips</h3>
                  <ul style={styles.tipsList}>
                    <li>Identify the state (what changes)</li>
                    <li>Define the recurrence relation</li>
                    <li>Determine base cases</li>
                    <li>Decide iteration order</li>
                    <li>Consider space optimization</li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// STYLES
// ============================================
const styles = {
  container: {
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    background:
      "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 50%, #ede9fe 100%)",
    minHeight: "100vh",
    padding: "16px",
    boxSizing: "border-box",
  },
  header: {
    textAlign: "center",
    marginBottom: "20px",
  },
  title: {
    fontSize: "2.25rem",
    fontWeight: "800",
    background:
      "linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #c084fc 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    margin: "0 0 6px 0",
  },
  subtitle: {
    fontSize: "1rem",
    color: "#6b21a8",
    margin: 0,
    fontWeight: "500",
  },
  mainContent: {
    display: "grid",
    gridTemplateColumns: "280px 1fr 280px",
    gap: "16px",
    maxWidth: "1500px",
    margin: "0 auto",
  },
  leftPanel: {},
  centerPanel: {},
  rightPanel: {},
  card: {
    background: "white",
    borderRadius: "16px",
    padding: "18px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06)",
    border: "1px solid #f3e8ff",
  },
  cardTitle: {
    fontSize: "1rem",
    fontWeight: "700",
    color: "#581c87",
    marginBottom: "14px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  inputGroup: {
    marginBottom: "12px",
  },
  label: {
    display: "block",
    fontSize: "0.8rem",
    fontWeight: "600",
    color: "#6b21a8",
    marginBottom: "6px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    fontSize: "0.95rem",
    border: "2px solid #e9d5ff",
    borderRadius: "10px",
    outline: "none",
    boxSizing: "border-box",
  },
  select: {
    width: "100%",
    padding: "10px 12px",
    fontSize: "0.95rem",
    border: "2px solid #e9d5ff",
    borderRadius: "10px",
    outline: "none",
    background: "white",
    cursor: "pointer",
    boxSizing: "border-box",
  },
  controlSection: {
    marginTop: "14px",
  },
  buttonGroup: {
    display: "flex",
    gap: "8px",
    marginTop: "8px",
  },
  button: {
    padding: "10px 14px",
    fontSize: "0.85rem",
    fontWeight: "600",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
  },
  primaryButton: {
    background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
    color: "white",
    boxShadow: "0 2px 8px rgba(124, 58, 237, 0.3)",
  },
  secondaryButton: {
    background: "#f3e8ff",
    color: "#6b21a8",
  },
  successButton: {
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: "white",
  },
  warningButton: {
    background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    color: "white",
  },
  accentButton: {
    background: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)",
    color: "white",
  },
  slider: {
    width: "100%",
    height: "6px",
    borderRadius: "3px",
    background: "#e9d5ff",
    outline: "none",
    cursor: "pointer",
    marginTop: "8px",
  },
  progressContainer: {
    marginTop: "14px",
  },
  progressLabel: {
    fontSize: "0.75rem",
    color: "#6b21a8",
    marginBottom: "6px",
    fontWeight: "500",
  },
  progressBar: {
    height: "6px",
    background: "#f3e8ff",
    borderRadius: "3px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(135deg, #7c3aed, #a855f7)",
    borderRadius: "3px",
    transition: "width 0.3s ease",
  },
  legend: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "0.85rem",
    color: "#6b21a8",
  },
  legendDot: {
    width: "18px",
    height: "18px",
    borderRadius: "6px",
    flexShrink: 0,
  },
  vizHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  typeBadge: {
    fontSize: "0.75rem",
    fontWeight: "600",
    color: "#7c3aed",
    background: "#f3e8ff",
    padding: "4px 10px",
    borderRadius: "6px",
  },
  tableContainer: {
    overflowX: "auto",
    padding: "16px",
    background: "#faf5ff",
    borderRadius: "12px",
    marginBottom: "16px",
  },
  tableWrapper: {
    display: "inline-block",
    minWidth: "100%",
  },
  table: {
    borderCollapse: "separate",
    borderSpacing: "4px",
    margin: "0 auto",
  },
  headerCell: {
    padding: "8px 12px",
    background: "#e9d5ff",
    color: "#581c87",
    fontWeight: "600",
    fontSize: "0.8rem",
    borderRadius: "6px",
    textAlign: "center",
    minWidth: "40px",
  },
  cell: {
    padding: "10px 14px",
    borderRadius: "8px",
    textAlign: "center",
    fontWeight: "600",
    fontSize: "0.9rem",
    minWidth: "40px",
  },
  array1D: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
  },
  arrayHeader: {
    display: "flex",
    gap: "4px",
  },
  indexLabel: {
    width: "50px",
    textAlign: "center",
    fontSize: "0.75rem",
    color: "#6b21a8",
    fontWeight: "600",
  },
  arrayRow: {
    display: "flex",
    gap: "4px",
  },
  emptyState: {
    textAlign: "center",
    padding: "40px",
    color: "#6b21a8",
  },
  resultBox: {
    padding: "14px",
    background: "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)",
    borderRadius: "10px",
    marginBottom: "16px",
    textAlign: "center",
    fontSize: "1.1rem",
    color: "#166534",
  },
  lcsResult: {
    fontFamily: "monospace",
    color: "#0f766e",
  },
  explanationBox: {
    padding: "14px",
    background: "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)",
    borderRadius: "12px",
    border: "1px solid #e9d5ff",
    marginBottom: "16px",
  },
  explanationHeader: {
    display: "flex",
    gap: "8px",
    marginBottom: "8px",
    flexWrap: "wrap",
  },
  stepBadge: {
    fontSize: "0.75rem",
    fontWeight: "700",
    color: "#7c3aed",
    background: "white",
    padding: "3px 8px",
    borderRadius: "6px",
  },
  problemBadge: {
    fontSize: "0.75rem",
    fontWeight: "600",
    color: "#9333ea",
    background: "white",
    padding: "3px 8px",
    borderRadius: "6px",
  },
  explanationText: {
    fontSize: "0.9rem",
    color: "#581c87",
    margin: 0,
    lineHeight: "1.5",
  },
  codeBox: {
    marginTop: "10px",
    padding: "10px",
    background: "#1e1b4b",
    borderRadius: "8px",
  },
  codeText: {
    fontSize: "0.8rem",
    color: "#c4b5fd",
    fontFamily: "'Fira Code', monospace",
  },
  recurrenceBox: {
    padding: "14px",
    background: "#fef3c7",
    borderRadius: "10px",
    border: "1px solid #fcd34d",
  },
  recurrenceTitle: {
    fontSize: "0.85rem",
    fontWeight: "600",
    color: "#92400e",
    margin: "0 0 8px 0",
  },
  recurrenceCode: {
    fontSize: "0.85rem",
    color: "#78350f",
    fontFamily: "'Fira Code', monospace",
    wordBreak: "break-all",
  },
  educationHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  toggleBtn: {
    background: "#f3e8ff",
    border: "none",
    borderRadius: "6px",
    padding: "4px 10px",
    cursor: "pointer",
    fontSize: "0.8rem",
    color: "#6b21a8",
  },
  educationSection: {
    marginBottom: "16px",
  },
  sectionTitle: {
    fontSize: "0.85rem",
    fontWeight: "700",
    color: "#581c87",
    marginBottom: "8px",
  },
  sectionContent: {
    fontSize: "0.8rem",
    color: "#6b21a8",
    lineHeight: "1.6",
    margin: 0,
  },
  conceptBox: {
    background: "#faf5ff",
    borderRadius: "10px",
    padding: "12px",
    border: "1px solid #e9d5ff",
  },
  conceptItem: {
    fontSize: "0.8rem",
    color: "#6b21a8",
    margin: "0 0 8px 0",
    lineHeight: "1.5",
  },
  complexityTable: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "0.75rem",
  },
  tableLabel: {
    padding: "8px",
    background: "#faf5ff",
    color: "#6b21a8",
    fontWeight: "600",
    borderBottom: "1px solid #e9d5ff",
    width: "40%",
  },
  tableValue: {
    padding: "8px",
    color: "#581c87",
    borderBottom: "1px solid #e9d5ff",
    fontFamily: "monospace",
  },
  approachBox: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  approach: {
    background: "#faf5ff",
    borderRadius: "8px",
    padding: "10px",
    fontSize: "0.8rem",
    color: "#6b21a8",
  },
  tipsList: {
    fontSize: "0.8rem",
    color: "#6b21a8",
    paddingLeft: "18px",
    margin: "0",
    lineHeight: "1.8",
  },
};
