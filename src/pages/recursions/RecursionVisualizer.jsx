import React, { useState, useEffect, useCallback, useRef } from "react";

/**
 * Recursion Tree Complete Visualizer
 * ===================================
 * A comprehensive educational tool for understanding Recursion
 *
 * Featured Problems:
 * 1. Fibonacci - Classic overlapping subproblems
 * 2. Factorial - Simple linear recursion
 * 3. Binary Search - Divide and conquer
 * 4. Merge Sort - Tree structure visualization
 * 5. Sum of Array - Basic recursion
 * 6. Power Function - Efficient recursion
 * 7. Tower of Hanoi - Multi-branch recursion
 *
 * Concepts:
 * - Call Stack visualization
 * - Recursion Tree building
 * - Memoization comparison
 * - Base case vs Recursive case
 * - Time/Space complexity analysis
 */

// ============================================
// RECURSION TREE NODE
// ============================================
class TreeNode {
  constructor(id, label, args, depth, parent = null) {
    this.id = id;
    this.label = label;
    this.args = args;
    this.depth = depth;
    this.parent = parent;
    this.children = [];
    this.result = null;
    this.status = "pending"; // pending, active, computing, returning, complete, memoized
    this.x = 0;
    this.y = 0;
  }
}

// ============================================
// RECURSION SOLVERS
// ============================================

// FIBONACCI
function solveFibonacci(n, useMemo = false) {
  const steps = [];
  const memo = new Map();
  let nodeId = 0;
  const root = new TreeNode(nodeId++, "fib", [n], 0);

  steps.push({
    type: "init",
    message: `Starting Fibonacci(${n})${useMemo ? " with memoization" : ""}`,
    tree: cloneTree(root),
    stack: [`fib(${n})`],
    activeNode: root.id,
    code: `function fib(${n}) {`,
  });

  function fib(n, node) {
    node.status = "active";
    steps.push({
      type: "call",
      message: `Calling fib(${n})`,
      tree: cloneTree(root),
      stack: getCallStack(node),
      activeNode: node.id,
      code: `fib(${n}) called`,
    });

    // Check memo
    if (useMemo && memo.has(n)) {
      node.result = memo.get(n);
      node.status = "memoized";
      steps.push({
        type: "memoized",
        message: `Found fib(${n}) = ${node.result} in memo! Skipping computation.`,
        tree: cloneTree(root),
        stack: getCallStack(node),
        activeNode: node.id,
        code: `// memo hit: fib(${n}) = ${node.result}`,
      });
      return node.result;
    }

    // Base cases
    if (n <= 1) {
      node.result = n;
      node.status = "complete";
      if (useMemo) memo.set(n, n);
      steps.push({
        type: "base",
        message: `Base case: fib(${n}) = ${n}`,
        tree: cloneTree(root),
        stack: getCallStack(node),
        activeNode: node.id,
        code: `if (n <= 1) return ${n}; // base case`,
      });
      return n;
    }

    // Create children
    const leftChild = new TreeNode(
      nodeId++,
      "fib",
      [n - 1],
      node.depth + 1,
      node,
    );
    const rightChild = new TreeNode(
      nodeId++,
      "fib",
      [n - 2],
      node.depth + 1,
      node,
    );
    node.children = [leftChild, rightChild];

    node.status = "computing";
    steps.push({
      type: "recurse",
      message: `fib(${n}) = fib(${n - 1}) + fib(${n - 2})`,
      tree: cloneTree(root),
      stack: getCallStack(node),
      activeNode: node.id,
      code: `return fib(${n - 1}) + fib(${n - 2});`,
    });

    const left = fib(n - 1, leftChild);
    const right = fib(n - 2, rightChild);

    node.result = left + right;
    node.status = "complete";
    if (useMemo) memo.set(n, node.result);

    steps.push({
      type: "return",
      message: `Returning fib(${n}) = ${left} + ${right} = ${node.result}`,
      tree: cloneTree(root),
      stack: getCallStack(node),
      activeNode: node.id,
      code: `return ${left} + ${right}; // = ${node.result}`,
    });

    return node.result;
  }

  const result = fib(n, root);

  steps.push({
    type: "complete",
    message: `Complete! Fibonacci(${n}) = ${result}`,
    tree: cloneTree(root),
    stack: [],
    activeNode: null,
    result,
    code: `// Result: ${result}`,
  });

  return { steps, result, tree: root };
}

// FACTORIAL
function solveFactorial(n) {
  const steps = [];
  let nodeId = 0;
  const root = new TreeNode(nodeId++, "fact", [n], 0);

  steps.push({
    type: "init",
    message: `Starting Factorial(${n})`,
    tree: cloneTree(root),
    stack: [`fact(${n})`],
    activeNode: root.id,
    code: `function factorial(${n}) {`,
  });

  function factorial(n, node) {
    node.status = "active";
    steps.push({
      type: "call",
      message: `Calling factorial(${n})`,
      tree: cloneTree(root),
      stack: getCallStack(node),
      activeNode: node.id,
      code: `factorial(${n}) called`,
    });

    if (n <= 1) {
      node.result = 1;
      node.status = "complete";
      steps.push({
        type: "base",
        message: `Base case: factorial(${n}) = 1`,
        tree: cloneTree(root),
        stack: getCallStack(node),
        activeNode: node.id,
        code: `if (n <= 1) return 1; // base case`,
      });
      return 1;
    }

    const child = new TreeNode(nodeId++, "fact", [n - 1], node.depth + 1, node);
    node.children = [child];

    node.status = "computing";
    steps.push({
      type: "recurse",
      message: `factorial(${n}) = ${n} × factorial(${n - 1})`,
      tree: cloneTree(root),
      stack: getCallStack(node),
      activeNode: node.id,
      code: `return ${n} * factorial(${n - 1});`,
    });

    const subResult = factorial(n - 1, child);
    node.result = n * subResult;
    node.status = "complete";

    steps.push({
      type: "return",
      message: `Returning factorial(${n}) = ${n} × ${subResult} = ${node.result}`,
      tree: cloneTree(root),
      stack: getCallStack(node),
      activeNode: node.id,
      code: `return ${n} * ${subResult}; // = ${node.result}`,
    });

    return node.result;
  }

  const result = factorial(n, root);

  steps.push({
    type: "complete",
    message: `Complete! Factorial(${n}) = ${result}`,
    tree: cloneTree(root),
    stack: [],
    activeNode: null,
    result,
    code: `// Result: ${result}`,
  });

  return { steps, result, tree: root };
}

// SUM OF ARRAY
function solveSumArray(arr) {
  const steps = [];
  let nodeId = 0;
  const root = new TreeNode(nodeId++, "sum", [0, arr.length - 1], 0);

  steps.push({
    type: "init",
    message: `Starting sum of array [${arr.join(", ")}]`,
    tree: cloneTree(root),
    stack: [`sum(0, ${arr.length - 1})`],
    activeNode: root.id,
    array: [...arr],
    code: `function sum(arr, left, right) {`,
  });

  function sum(left, right, node) {
    node.status = "active";
    steps.push({
      type: "call",
      message: `Calling sum(${left}, ${right}) for subarray [${arr.slice(left, right + 1).join(", ")}]`,
      tree: cloneTree(root),
      stack: getCallStack(node),
      activeNode: node.id,
      array: [...arr],
      highlight: { left, right },
      code: `sum(${left}, ${right})`,
    });

    if (left === right) {
      node.result = arr[left];
      node.status = "complete";
      steps.push({
        type: "base",
        message: `Base case: single element arr[${left}] = ${arr[left]}`,
        tree: cloneTree(root),
        stack: getCallStack(node),
        activeNode: node.id,
        array: [...arr],
        highlight: { left, right },
        code: `if (left == right) return arr[${left}]; // ${arr[left]}`,
      });
      return arr[left];
    }

    const mid = Math.floor((left + right) / 2);
    const leftChild = new TreeNode(
      nodeId++,
      "sum",
      [left, mid],
      node.depth + 1,
      node,
    );
    const rightChild = new TreeNode(
      nodeId++,
      "sum",
      [mid + 1, right],
      node.depth + 1,
      node,
    );
    node.children = [leftChild, rightChild];

    node.status = "computing";
    steps.push({
      type: "recurse",
      message: `Divide: sum(${left}, ${mid}) + sum(${mid + 1}, ${right})`,
      tree: cloneTree(root),
      stack: getCallStack(node),
      activeNode: node.id,
      array: [...arr],
      highlight: { left, right, mid },
      code: `mid = ${mid}; return sum(${left}, ${mid}) + sum(${mid + 1}, ${right});`,
    });

    const leftSum = sum(left, mid, leftChild);
    const rightSum = sum(mid + 1, right, rightChild);

    node.result = leftSum + rightSum;
    node.status = "complete";

    steps.push({
      type: "return",
      message: `Returning sum(${left}, ${right}) = ${leftSum} + ${rightSum} = ${node.result}`,
      tree: cloneTree(root),
      stack: getCallStack(node),
      activeNode: node.id,
      array: [...arr],
      code: `return ${leftSum} + ${rightSum}; // = ${node.result}`,
    });

    return node.result;
  }

  const result = sum(0, arr.length - 1, root);

  steps.push({
    type: "complete",
    message: `Complete! Sum = ${result}`,
    tree: cloneTree(root),
    stack: [],
    activeNode: null,
    result,
    array: [...arr],
    code: `// Result: ${result}`,
  });

  return { steps, result, tree: root };
}

// POWER FUNCTION
function solvePower(base, exp) {
  const steps = [];
  let nodeId = 0;
  const root = new TreeNode(nodeId++, "pow", [base, exp], 0);

  steps.push({
    type: "init",
    message: `Starting Power(${base}, ${exp}) - computing ${base}^${exp}`,
    tree: cloneTree(root),
    stack: [`pow(${base}, ${exp})`],
    activeNode: root.id,
    code: `function pow(${base}, ${exp}) {`,
  });

  function pow(base, exp, node) {
    node.status = "active";
    steps.push({
      type: "call",
      message: `Calling pow(${base}, ${exp})`,
      tree: cloneTree(root),
      stack: getCallStack(node),
      activeNode: node.id,
      code: `pow(${base}, ${exp}) called`,
    });

    if (exp === 0) {
      node.result = 1;
      node.status = "complete";
      steps.push({
        type: "base",
        message: `Base case: ${base}^0 = 1`,
        tree: cloneTree(root),
        stack: getCallStack(node),
        activeNode: node.id,
        code: `if (exp == 0) return 1; // base case`,
      });
      return 1;
    }

    if (exp === 1) {
      node.result = base;
      node.status = "complete";
      steps.push({
        type: "base",
        message: `Base case: ${base}^1 = ${base}`,
        tree: cloneTree(root),
        stack: getCallStack(node),
        activeNode: node.id,
        code: `if (exp == 1) return ${base}; // base case`,
      });
      return base;
    }

    const halfExp = Math.floor(exp / 2);
    const child = new TreeNode(
      nodeId++,
      "pow",
      [base, halfExp],
      node.depth + 1,
      node,
    );
    node.children = [child];

    node.status = "computing";

    if (exp % 2 === 0) {
      steps.push({
        type: "recurse",
        message: `Even exp: ${base}^${exp} = (${base}^${halfExp})²`,
        tree: cloneTree(root),
        stack: getCallStack(node),
        activeNode: node.id,
        code: `half = pow(${base}, ${halfExp}); return half * half;`,
      });

      const half = pow(base, halfExp, child);
      node.result = half * half;
    } else {
      steps.push({
        type: "recurse",
        message: `Odd exp: ${base}^${exp} = ${base} × (${base}^${halfExp})²`,
        tree: cloneTree(root),
        stack: getCallStack(node),
        activeNode: node.id,
        code: `half = pow(${base}, ${halfExp}); return ${base} * half * half;`,
      });

      const half = pow(base, halfExp, child);
      node.result = base * half * half;
    }

    node.status = "complete";

    steps.push({
      type: "return",
      message: `Returning pow(${base}, ${exp}) = ${node.result}`,
      tree: cloneTree(root),
      stack: getCallStack(node),
      activeNode: node.id,
      code: `return ${node.result};`,
    });

    return node.result;
  }

  const result = pow(base, exp, root);

  steps.push({
    type: "complete",
    message: `Complete! ${base}^${exp} = ${result}`,
    tree: cloneTree(root),
    stack: [],
    activeNode: null,
    result,
    code: `// Result: ${result}`,
  });

  return { steps, result, tree: root };
}

// BINARY SEARCH
function solveBinarySearch(arr, target) {
  const steps = [];
  let nodeId = 0;
  const sortedArr = [...arr].sort((a, b) => a - b);
  const root = new TreeNode(nodeId++, "search", [0, sortedArr.length - 1], 0);

  steps.push({
    type: "init",
    message: `Binary Search for ${target} in [${sortedArr.join(", ")}]`,
    tree: cloneTree(root),
    stack: [`search(0, ${sortedArr.length - 1})`],
    activeNode: root.id,
    array: [...sortedArr],
    target,
    code: `function binarySearch(arr, target, left, right) {`,
  });

  function search(left, right, node) {
    node.status = "active";
    steps.push({
      type: "call",
      message: `Searching in range [${left}, ${right}]: [${sortedArr.slice(left, right + 1).join(", ")}]`,
      tree: cloneTree(root),
      stack: getCallStack(node),
      activeNode: node.id,
      array: [...sortedArr],
      target,
      highlight: { left, right },
      code: `search(${left}, ${right})`,
    });

    if (left > right) {
      node.result = -1;
      node.status = "complete";
      steps.push({
        type: "base",
        message: `Base case: left > right, target not found`,
        tree: cloneTree(root),
        stack: getCallStack(node),
        activeNode: node.id,
        array: [...sortedArr],
        target,
        code: `if (left > right) return -1; // not found`,
      });
      return -1;
    }

    const mid = Math.floor((left + right) / 2);

    steps.push({
      type: "compare",
      message: `Compare: arr[${mid}] = ${sortedArr[mid]} vs target ${target}`,
      tree: cloneTree(root),
      stack: getCallStack(node),
      activeNode: node.id,
      array: [...sortedArr],
      target,
      highlight: { left, right, mid },
      code: `mid = ${mid}; // arr[mid] = ${sortedArr[mid]}`,
    });

    if (sortedArr[mid] === target) {
      node.result = mid;
      node.status = "complete";
      steps.push({
        type: "found",
        message: `Found! arr[${mid}] = ${target}`,
        tree: cloneTree(root),
        stack: getCallStack(node),
        activeNode: node.id,
        array: [...sortedArr],
        target,
        highlight: { left, right, mid, found: true },
        code: `if (arr[mid] == target) return ${mid}; // found!`,
      });
      return mid;
    }

    let child;
    if (sortedArr[mid] < target) {
      child = new TreeNode(
        nodeId++,
        "search",
        [mid + 1, right],
        node.depth + 1,
        node,
      );
      node.children = [child];

      node.status = "computing";
      steps.push({
        type: "recurse",
        message: `${sortedArr[mid]} < ${target}, search right half [${mid + 1}, ${right}]`,
        tree: cloneTree(root),
        stack: getCallStack(node),
        activeNode: node.id,
        array: [...sortedArr],
        target,
        highlight: { left: mid + 1, right },
        code: `// ${sortedArr[mid]} < ${target}, go right`,
      });

      node.result = search(mid + 1, right, child);
    } else {
      child = new TreeNode(
        nodeId++,
        "search",
        [left, mid - 1],
        node.depth + 1,
        node,
      );
      node.children = [child];

      node.status = "computing";
      steps.push({
        type: "recurse",
        message: `${sortedArr[mid]} > ${target}, search left half [${left}, ${mid - 1}]`,
        tree: cloneTree(root),
        stack: getCallStack(node),
        activeNode: node.id,
        array: [...sortedArr],
        target,
        highlight: { left, right: mid - 1 },
        code: `// ${sortedArr[mid]} > ${target}, go left`,
      });

      node.result = search(left, mid - 1, child);
    }

    node.status = "complete";

    steps.push({
      type: "return",
      message: `Returning from search(${left}, ${right}): ${node.result === -1 ? "not found" : "found at " + node.result}`,
      tree: cloneTree(root),
      stack: getCallStack(node),
      activeNode: node.id,
      array: [...sortedArr],
      target,
      code: `return ${node.result};`,
    });

    return node.result;
  }

  const result = search(0, sortedArr.length - 1, root);

  steps.push({
    type: "complete",
    message:
      result === -1
        ? `Complete! ${target} not found`
        : `Complete! Found ${target} at index ${result}`,
    tree: cloneTree(root),
    stack: [],
    activeNode: null,
    result,
    array: [...sortedArr],
    target,
    code: `// Result: ${result}`,
  });

  return { steps, result, tree: root, array: sortedArr };
}

// TOWER OF HANOI
function solveTowerOfHanoi(n) {
  const steps = [];
  let nodeId = 0;
  const root = new TreeNode(nodeId++, "hanoi", [n, "A", "C", "B"], 0);
  const moves = [];

  steps.push({
    type: "init",
    message: `Tower of Hanoi: Move ${n} disks from A to C using B`,
    tree: cloneTree(root),
    stack: [`hanoi(${n}, A→C)`],
    activeNode: root.id,
    moves: [],
    code: `function hanoi(n, from, to, aux) {`,
  });

  function hanoi(n, from, to, aux, node) {
    node.status = "active";
    steps.push({
      type: "call",
      message: `hanoi(${n}, ${from}→${to}, aux=${aux})`,
      tree: cloneTree(root),
      stack: getCallStack(node),
      activeNode: node.id,
      moves: [...moves],
      code: `hanoi(${n}, "${from}", "${to}", "${aux}")`,
    });

    if (n === 1) {
      moves.push({ disk: 1, from, to });
      node.result = `${from}→${to}`;
      node.status = "complete";
      steps.push({
        type: "base",
        message: `Base case: Move disk 1 from ${from} to ${to}`,
        tree: cloneTree(root),
        stack: getCallStack(node),
        activeNode: node.id,
        moves: [...moves],
        code: `if (n == 1) move(${from}, ${to}); // move disk 1`,
      });
      return;
    }

    // Move n-1 disks from 'from' to 'aux'
    const child1 = new TreeNode(
      nodeId++,
      "hanoi",
      [n - 1, from, aux, to],
      node.depth + 1,
      node,
    );
    // Move disk n from 'from' to 'to'
    const child2 = new TreeNode(
      nodeId++,
      "move",
      [n, from, to],
      node.depth + 1,
      node,
    );
    // Move n-1 disks from 'aux' to 'to'
    const child3 = new TreeNode(
      nodeId++,
      "hanoi",
      [n - 1, aux, to, from],
      node.depth + 1,
      node,
    );
    node.children = [child1, child2, child3];

    node.status = "computing";
    steps.push({
      type: "recurse",
      message: `Recursively: 1) Move ${n - 1} disks ${from}→${aux}, 2) Move disk ${n} ${from}→${to}, 3) Move ${n - 1} disks ${aux}→${to}`,
      tree: cloneTree(root),
      stack: getCallStack(node),
      activeNode: node.id,
      moves: [...moves],
      code: `hanoi(${n - 1}, ${from}, ${aux}); move(${n}); hanoi(${n - 1}, ${aux}, ${to});`,
    });

    hanoi(n - 1, from, aux, to, child1);

    // Move disk n
    moves.push({ disk: n, from, to });
    child2.result = `${from}→${to}`;
    child2.status = "complete";
    steps.push({
      type: "move",
      message: `Move disk ${n} from ${from} to ${to}`,
      tree: cloneTree(root),
      stack: getCallStack(node),
      activeNode: child2.id,
      moves: [...moves],
      code: `move(disk ${n}, ${from}, ${to});`,
    });

    hanoi(n - 1, aux, to, from, child3);

    node.status = "complete";
    node.result = "done";

    steps.push({
      type: "return",
      message: `Completed hanoi(${n}, ${from}→${to})`,
      tree: cloneTree(root),
      stack: getCallStack(node),
      activeNode: node.id,
      moves: [...moves],
      code: `// hanoi(${n}) complete`,
    });
  }

  hanoi(n, "A", "C", "B", root);

  steps.push({
    type: "complete",
    message: `Complete! Total moves: ${moves.length} (2^${n} - 1 = ${Math.pow(2, n) - 1})`,
    tree: cloneTree(root),
    stack: [],
    activeNode: null,
    moves: [...moves],
    result: moves.length,
    code: `// Total: ${moves.length} moves`,
  });

  return { steps, result: moves.length, tree: root, moves };
}

// Helper functions
function cloneTree(node) {
  if (!node) return null;
  const clone = new TreeNode(node.id, node.label, [...node.args], node.depth);
  clone.result = node.result;
  clone.status = node.status;
  clone.children = node.children.map((child) => cloneTree(child));
  return clone;
}

function getCallStack(node) {
  const stack = [];
  let current = node;
  while (current) {
    stack.unshift(`${current.label}(${current.args.join(", ")})`);
    current = current.parent;
  }
  return stack;
}

// ============================================
// MAIN VISUALIZER COMPONENT
// ============================================
export default function RecursionTreeVisualizer() {
  const [problem, setProblem] = useState("fibonacci");
  const [inputN, setInputN] = useState(5);
  const [inputArr, setInputArr] = useState("3,1,4,1,5,9");
  const [inputTarget, setInputTarget] = useState(4);
  const [inputBase, setInputBase] = useState(2);
  const [inputExp, setInputExp] = useState(10);
  const [useMemo, setUseMemo] = useState(false);
  const [animationSteps, setAnimationSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);
  const [displayTree, setDisplayTree] = useState(null);
  const [callStack, setCallStack] = useState([]);
  const [activeNode, setActiveNode] = useState(null);
  const [explanation, setExplanation] = useState(
    "Welcome to Recursion Tree Visualizer! Select a problem and execute.",
  );
  const [codeSnippet, setCodeSnippet] = useState("");
  const [result, setResult] = useState(null);
  const [extraData, setExtraData] = useState({});
  const [showEducation, setShowEducation] = useState(true);

  const animationRef = useRef(null);

  // Problems config
  const problems = [
    { value: "fibonacci", label: "🔢 Fibonacci", hasMemo: true },
    { value: "factorial", label: "❗ Factorial", hasMemo: false },
    { value: "sumArray", label: "➕ Sum of Array", hasMemo: false },
    { value: "power", label: "⚡ Power Function", hasMemo: false },
    { value: "binarySearch", label: "🔍 Binary Search", hasMemo: false },
    { value: "hanoi", label: "🗼 Tower of Hanoi", hasMemo: false },
  ];

  // Complexity info
  const complexityInfo = {
    fibonacci: {
      time: useMemo ? "O(n)" : "O(2^n)",
      space: useMemo ? "O(n)" : "O(n)",
      recurrence: "T(n) = T(n-1) + T(n-2) + O(1)",
      note: useMemo
        ? "Memoization eliminates redundant calls"
        : "Exponential due to overlapping subproblems",
    },
    factorial: {
      time: "O(n)",
      space: "O(n)",
      recurrence: "T(n) = T(n-1) + O(1)",
      note: "Linear recursion - each subproblem called once",
    },
    sumArray: {
      time: "O(n)",
      space: "O(log n)",
      recurrence: "T(n) = 2T(n/2) + O(1)",
      note: "Divide and conquer - balanced tree",
    },
    power: {
      time: "O(log n)",
      space: "O(log n)",
      recurrence: "T(n) = T(n/2) + O(1)",
      note: "Fast exponentiation by squaring",
    },
    binarySearch: {
      time: "O(log n)",
      space: "O(log n)",
      recurrence: "T(n) = T(n/2) + O(1)",
      note: "Eliminates half the search space each step",
    },
    hanoi: {
      time: "O(2^n)",
      space: "O(n)",
      recurrence: "T(n) = 2T(n-1) + O(1)",
      note: "Minimum moves = 2^n - 1",
    },
  };

  // Execute
  const executeOperation = useCallback(() => {
    let result;

    switch (problem) {
      case "fibonacci":
        result = solveFibonacci(Math.min(inputN, 8), useMemo);
        break;
      case "factorial":
        result = solveFactorial(Math.min(inputN, 10));
        break;
      case "sumArray": {
        const arr = inputArr
          .split(",")
          .map((x) => parseInt(x.trim()))
          .filter((x) => !isNaN(x))
          .slice(0, 8);
        result = solveSumArray(arr);
        break;
      }
      case "power":
        result = solvePower(inputBase, Math.min(inputExp, 16));
        break;
      case "binarySearch": {
        const arr = inputArr
          .split(",")
          .map((x) => parseInt(x.trim()))
          .filter((x) => !isNaN(x))
          .slice(0, 10);
        result = solveBinarySearch(arr, inputTarget);
        break;
      }
      case "hanoi":
        result = solveTowerOfHanoi(Math.min(inputN, 4));
        break;
      default:
        return;
    }

    setAnimationSteps(result.steps);
    setCurrentStep(-1);
    setDisplayTree(null);
    setCallStack([]);
    setActiveNode(null);
    setResult(null);
    setExtraData({});
    setExplanation('🎬 Ready! Click "Step" or "Play" to begin.');
  }, [problem, inputN, inputArr, inputTarget, inputBase, inputExp, useMemo]);

  // Animation handler
  useEffect(() => {
    if (currentStep >= 0 && currentStep < animationSteps.length) {
      const step = animationSteps[currentStep];
      setDisplayTree(step.tree);
      setCallStack(step.stack || []);
      setActiveNode(step.activeNode);
      setExplanation(step.message);
      setCodeSnippet(step.code || "");
      if (step.result !== undefined) setResult(step.result);
      if (step.moves) setExtraData((prev) => ({ ...prev, moves: step.moves }));
      if (step.array) setExtraData((prev) => ({ ...prev, array: step.array }));
      if (step.highlight)
        setExtraData((prev) => ({ ...prev, highlight: step.highlight }));
      if (step.target !== undefined)
        setExtraData((prev) => ({ ...prev, target: step.target }));
    }
  }, [currentStep, animationSteps]);

  // Auto-play
  useEffect(() => {
    if (isPlaying && currentStep < animationSteps.length - 1) {
      animationRef.current = setTimeout(
        () => setCurrentStep((p) => p + 1),
        speed,
      );
    } else if (currentStep >= animationSteps.length - 1) {
      setIsPlaying(false);
    }
    return () => clearTimeout(animationRef.current);
  }, [isPlaying, currentStep, animationSteps.length, speed]);

  // Controls
  const handleStep = () =>
    currentStep < animationSteps.length - 1 && setCurrentStep((p) => p + 1);
  const handlePlay = () => {
    if (currentStep >= animationSteps.length - 1) setCurrentStep(-1);
    setIsPlaying(true);
  };
  const handlePause = () => setIsPlaying(false);
  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(-1);
    setDisplayTree(null);
    setCallStack([]);
    setActiveNode(null);
    setResult(null);
    setExtraData({});
    setExplanation("🔄 Reset. Ready to run again.");
  };

  // Calculate tree positions
  const calculateTreeLayout = useCallback(
    (node, x, y, level, horizontalSpacing) => {
      if (!node) return [];

      const nodes = [];
      const edges = [];

      node.x = x;
      node.y = y;
      nodes.push(node);

      const childCount = node.children.length;
      if (childCount > 0) {
        const totalWidth = (childCount - 1) * horizontalSpacing;
        let startX = x - totalWidth / 2;

        node.children.forEach((child, i) => {
          const childX = startX + i * horizontalSpacing;
          const childY = y + 70;

          edges.push({
            from: node,
            to: child,
            fromX: x,
            fromY: y + 20,
            toX: childX,
            toY: childY - 20,
          });

          const childResult = calculateTreeLayout(
            child,
            childX,
            childY,
            level + 1,
            horizontalSpacing / 2,
          );
          nodes.push(...childResult.nodes);
          edges.push(...childResult.edges);
        });
      }

      return { nodes, edges };
    },
    [],
  );

  const treeLayout = displayTree
    ? calculateTreeLayout(displayTree, 350, 40, 0, 120)
    : { nodes: [], edges: [] };

  // Get node color
  const getNodeColor = (node) => {
    if (node.id === activeNode) return "url(#activeGrad)";
    switch (node.status) {
      case "complete":
        return "url(#completeGrad)";
      case "memoized":
        return "url(#memoGrad)";
      case "computing":
        return "url(#computingGrad)";
      case "active":
        return "url(#activeGrad)";
      default:
        return "url(#pendingGrad)";
    }
  };

  const currentProblem = problems.find((p) => p.value === problem);

  // Render inputs
  const renderInputs = () => {
    switch (problem) {
      case "fibonacci":
      case "factorial":
      case "hanoi":
        return (
          <div style={styles.inputGroup}>
            <label style={styles.label}>n</label>
            <input
              type="number"
              style={styles.input}
              value={inputN}
              onChange={(e) => setInputN(parseInt(e.target.value) || 0)}
              min="1"
              max={problem === "hanoi" ? 4 : problem === "fibonacci" ? 8 : 10}
            />
          </div>
        );
      case "sumArray":
        return (
          <div style={styles.inputGroup}>
            <label style={styles.label}>Array (comma-separated)</label>
            <input
              style={styles.input}
              value={inputArr}
              onChange={(e) => setInputArr(e.target.value)}
              placeholder="3,1,4,1,5"
            />
          </div>
        );
      case "power":
        return (
          <>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Base</label>
              <input
                type="number"
                style={styles.input}
                value={inputBase}
                onChange={(e) => setInputBase(parseInt(e.target.value) || 0)}
                min="1"
                max="10"
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Exponent</label>
              <input
                type="number"
                style={styles.input}
                value={inputExp}
                onChange={(e) => setInputExp(parseInt(e.target.value) || 0)}
                min="0"
                max="16"
              />
            </div>
          </>
        );
      case "binarySearch":
        return (
          <>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Array</label>
              <input
                style={styles.input}
                value={inputArr}
                onChange={(e) => setInputArr(e.target.value)}
                placeholder="1,3,5,7,9"
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Target</label>
              <input
                type="number"
                style={styles.input}
                value={inputTarget}
                onChange={(e) => setInputTarget(parseInt(e.target.value) || 0)}
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.title}>🌳 Recursion Tree Visualizer</h1>
        <p style={styles.subtitle}>
          Understand recursion through visual call trees and stack frames
        </p>
      </header>

      <div style={styles.mainContent}>
        {/* Left Panel */}
        <div style={styles.leftPanel}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>⚙️ Control Panel</h2>

            {/* Problem Selector */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Problem</label>
              <select
                style={styles.select}
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
              >
                {problems.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Dynamic Inputs */}
            {renderInputs()}

            {/* Memoization Toggle */}
            {currentProblem?.hasMemo && (
              <div style={styles.toggleContainer}>
                <span style={styles.toggleLabel}>Memoization:</span>
                <button
                  style={{
                    ...styles.toggleButton,
                    ...(!useMemo ? styles.toggleActive : styles.toggleInactive),
                  }}
                  onClick={() => setUseMemo(false)}
                >
                  Off
                </button>
                <button
                  style={{
                    ...styles.toggleButton,
                    ...(useMemo ? styles.toggleActive : styles.toggleInactive),
                  }}
                  onClick={() => setUseMemo(true)}
                >
                  On
                </button>
              </div>
            )}

            {/* Execute */}
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
                    !animationSteps.length
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
                    disabled={!animationSteps.length}
                  >
                    ▶ Play
                  </button>
                )}
              </div>
              <button
                style={{
                  ...styles.button,
                  ...styles.secondaryButton,
                  width: "100%",
                  marginTop: "8px",
                }}
                onClick={handleReset}
              >
                ↺ Reset
              </button>
            </div>

            {/* Speed */}
            <div style={styles.controlSection}>
              <label style={styles.label}>
                Speed:{" "}
                {speed <= 400 ? "Fast" : speed <= 800 ? "Medium" : "Slow"}
              </label>
              <input
                type="range"
                min="200"
                max="1500"
                value={1700 - speed}
                onChange={(e) => setSpeed(1700 - parseInt(e.target.value))}
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
            <h3 style={styles.cardTitle}>🎨 Legend</h3>
            <div style={styles.legend}>
              <div style={styles.legendItem}>
                <div
                  style={{
                    ...styles.legendDot,
                    background: "linear-gradient(135deg, #f59e0b, #d97706)",
                  }}
                />
                <span>Active</span>
              </div>
              <div style={styles.legendItem}>
                <div
                  style={{
                    ...styles.legendDot,
                    background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                  }}
                />
                <span>Computing</span>
              </div>
              <div style={styles.legendItem}>
                <div
                  style={{
                    ...styles.legendDot,
                    background: "linear-gradient(135deg, #10b981, #059669)",
                  }}
                />
                <span>Complete</span>
              </div>
              <div style={styles.legendItem}>
                <div
                  style={{
                    ...styles.legendDot,
                    background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
                  }}
                />
                <span>Memoized</span>
              </div>
              <div style={styles.legendItem}>
                <div style={{ ...styles.legendDot, background: "#e2e8f0" }} />
                <span>Pending</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Panel */}
        <div style={styles.centerPanel}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>🌳 Recursion Tree</h2>

            {/* Tree SVG */}
            <div style={styles.treeArea}>
              <svg style={styles.svg} viewBox="0 0 700 350">
                <defs>
                  <linearGradient
                    id="pendingGrad"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#e2e8f0" />
                    <stop offset="100%" stopColor="#cbd5e1" />
                  </linearGradient>
                  <linearGradient
                    id="activeGrad"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#d97706" />
                  </linearGradient>
                  <linearGradient
                    id="computingGrad"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#1d4ed8" />
                  </linearGradient>
                  <linearGradient
                    id="completeGrad"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                  <linearGradient
                    id="memoGrad"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#7c3aed" />
                  </linearGradient>
                  <filter
                    id="shadow"
                    x="-20%"
                    y="-20%"
                    width="140%"
                    height="140%"
                  >
                    <feDropShadow
                      dx="0"
                      dy="2"
                      stdDeviation="2"
                      floodOpacity="0.15"
                    />
                  </filter>
                </defs>

                <rect width="100%" height="100%" fill="#fafafa" rx="8" />

                {/* Edges */}
                {treeLayout.edges.map((edge, i) => (
                  <line
                    key={i}
                    x1={edge.fromX}
                    y1={edge.fromY}
                    x2={edge.toX}
                    y2={edge.toY}
                    stroke="#94a3b8"
                    strokeWidth="2"
                  />
                ))}

                {/* Nodes */}
                {treeLayout.nodes.map((node) => {
                  const isActive = node.id === activeNode;
                  return (
                    <g key={node.id}>
                      {isActive && (
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r="28"
                          fill="#f59e0b33"
                        />
                      )}
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r="22"
                        fill={getNodeColor(node)}
                        filter="url(#shadow)"
                        style={{ transition: "all 0.3s" }}
                      />
                      <text
                        x={node.x}
                        y={node.y - 4}
                        textAnchor="middle"
                        fill="white"
                        fontSize="10"
                        fontWeight="700"
                      >
                        {node.label}
                      </text>
                      <text
                        x={node.x}
                        y={node.y + 8}
                        textAnchor="middle"
                        fill="white"
                        fontSize="9"
                        fontWeight="500"
                      >
                        ({node.args.join(",")})
                      </text>
                      {node.result !== null && node.status === "complete" && (
                        <text
                          x={node.x}
                          y={node.y + 38}
                          textAnchor="middle"
                          fill="#059669"
                          fontSize="11"
                          fontWeight="700"
                        >
                          ={node.result}
                        </text>
                      )}
                    </g>
                  );
                })}

                {!displayTree && (
                  <text
                    x="350"
                    y="175"
                    textAnchor="middle"
                    fill="#9ca3af"
                    fontSize="16"
                  >
                    Execute to see the recursion tree
                  </text>
                )}
              </svg>
            </div>

            {/* Call Stack */}
            <div style={styles.stackSection}>
              <h4 style={styles.stackTitle}>📚 Call Stack</h4>
              <div style={styles.stackContainer}>
                {callStack.length === 0 ? (
                  <div style={styles.emptyStack}>Empty</div>
                ) : (
                  callStack
                    .map((call, i) => (
                      <div
                        key={i}
                        style={{
                          ...styles.stackFrame,
                          background:
                            i === callStack.length - 1
                              ? "linear-gradient(135deg, #f59e0b, #d97706)"
                              : "#e2e8f0",
                          color:
                            i === callStack.length - 1 ? "white" : "#475569",
                        }}
                      >
                        {call}
                      </div>
                    ))
                    .reverse()
                )}
              </div>
            </div>

            {/* Array visualization for relevant problems */}
            {extraData.array && (
              <div style={styles.arraySection}>
                <h4 style={styles.stackTitle}>📊 Array</h4>
                <div style={styles.arrayContainer}>
                  {extraData.array.map((val, i) => {
                    const hl = extraData.highlight || {};
                    let bg = "#f1f5f9";
                    if (hl.found && hl.mid === i) bg = "#10b981";
                    else if (hl.mid === i) bg = "#f59e0b";
                    else if (i >= (hl.left ?? -1) && i <= (hl.right ?? -1))
                      bg = "#dbeafe";
                    return (
                      <div
                        key={i}
                        style={{
                          ...styles.arrayCell,
                          background: bg,
                          color:
                            bg === "#10b981" || bg === "#f59e0b"
                              ? "white"
                              : "#334155",
                        }}
                      >
                        <div style={styles.arrayCellValue}>{val}</div>
                        <div style={styles.arrayCellIndex}>{i}</div>
                      </div>
                    );
                  })}
                </div>
                {extraData.target !== undefined && (
                  <div style={styles.targetLabel}>
                    Target: {extraData.target}
                  </div>
                )}
              </div>
            )}

            {/* Hanoi moves */}
            {extraData.moves && extraData.moves.length > 0 && (
              <div style={styles.movesSection}>
                <h4 style={styles.stackTitle}>
                  🗼 Moves ({extraData.moves.length})
                </h4>
                <div style={styles.movesContainer}>
                  {extraData.moves.slice(-8).map((m, i) => (
                    <span key={i} style={styles.move}>
                      Disk {m.disk}: {m.from}→{m.to}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Explanation */}
            <div style={styles.explanationBox}>
              <div style={styles.explanationHeader}>
                <span style={styles.stepBadge}>
                  Step {Math.max(0, currentStep + 1)}
                </span>
                {result !== null && (
                  <span style={styles.resultBadge}>Result: {result}</span>
                )}
              </div>
              <p style={styles.explanationText}>{explanation}</p>
              {codeSnippet && (
                <div style={styles.codeBox}>
                  <code style={styles.codeText}>{codeSnippet}</code>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div style={styles.rightPanel}>
          <div style={styles.card}>
            <div style={styles.educationHeader}>
              <h2 style={styles.cardTitle}>📚 Learning</h2>
              <button
                style={styles.toggleBtn}
                onClick={() => setShowEducation(!showEducation)}
              >
                {showEducation ? "▲" : "▼"}
              </button>
            </div>

            {showEducation && (
              <>
                <div style={styles.educationSection}>
                  <h3 style={styles.sectionTitle}>🔑 Recursion Basics</h3>
                  <div style={styles.conceptBox}>
                    <p style={styles.conceptItem}>
                      <strong>Base Case:</strong> Condition to stop recursion
                    </p>
                    <p style={styles.conceptItem}>
                      <strong>Recursive Case:</strong> Break problem into
                      smaller subproblems
                    </p>
                    <p style={styles.conceptItem}>
                      <strong>Call Stack:</strong> Tracks active function calls
                    </p>
                  </div>
                </div>

                <div style={styles.educationSection}>
                  <h3 style={styles.sectionTitle}>
                    🔧 {currentProblem?.label}
                  </h3>
                  <p style={styles.sectionContent}>
                    {problem === "fibonacci" &&
                      "Classic example of overlapping subproblems. Without memoization, same values computed multiple times."}
                    {problem === "factorial" &&
                      "Simple linear recursion. n! = n × (n-1)! with base case 0! = 1! = 1."}
                    {problem === "sumArray" &&
                      "Divide array in half, sum each half recursively. Demonstrates divide and conquer."}
                    {problem === "power" &&
                      "Fast exponentiation: x^n = (x^(n/2))² for even n. Reduces O(n) to O(log n)."}
                    {problem === "binarySearch" &&
                      "Eliminate half the search space each step. Classic O(log n) algorithm."}
                    {problem === "hanoi" &&
                      "Move n disks: move n-1 to aux, move largest to target, move n-1 from aux to target."}
                  </p>
                </div>

                <div style={styles.educationSection}>
                  <h3 style={styles.sectionTitle}>📊 Complexity</h3>
                  <table style={styles.complexityTable}>
                    <tbody>
                      <tr>
                        <td style={styles.tableLabel}>Time</td>
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
                        <td style={styles.tableLabel}>Recurrence</td>
                        <td style={styles.tableValue}>
                          {complexityInfo[problem]?.recurrence}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <p
                    style={{
                      ...styles.sectionContent,
                      marginTop: "8px",
                      fontSize: "0.75rem",
                      fontStyle: "italic",
                    }}
                  >
                    {complexityInfo[problem]?.note}
                  </p>
                </div>

                <div style={styles.educationSection}>
                  <h3 style={styles.sectionTitle}>💡 Key Insights</h3>
                  <ul style={styles.tipsList}>
                    <li>Always define clear base case(s)</li>
                    <li>Ensure recursion moves toward base case</li>
                    <li>Watch for stack overflow with deep recursion</li>
                    <li>Consider memoization for overlapping subproblems</li>
                    <li>Tail recursion can be optimized by compilers</li>
                  </ul>
                </div>

                <div style={styles.educationSection}>
                  <h3 style={styles.sectionTitle}>⚠️ Common Pitfalls</h3>
                  <ul style={styles.edgeCaseList}>
                    <li>Missing or incorrect base case</li>
                    <li>Infinite recursion</li>
                    <li>Stack overflow for large inputs</li>
                    <li>Redundant computations</li>
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
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    background:
      "linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fcd34d 100%)",
    minHeight: "100vh",
    padding: "16px",
    boxSizing: "border-box",
  },
  header: { textAlign: "center", marginBottom: "20px" },
  title: {
    fontSize: "2.25rem",
    fontWeight: "800",
    background:
      "linear-gradient(135deg, #d97706 0%, #f59e0b 50%, #fbbf24 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    margin: "0 0 6px 0",
  },
  subtitle: {
    fontSize: "1rem",
    color: "#92400e",
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
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    border: "1px solid #fde68a",
  },
  cardTitle: {
    fontSize: "1rem",
    fontWeight: "700",
    color: "#92400e",
    marginBottom: "14px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  inputGroup: { marginBottom: "12px" },
  label: {
    display: "block",
    fontSize: "0.8rem",
    fontWeight: "600",
    color: "#92400e",
    marginBottom: "6px",
    textTransform: "uppercase",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    fontSize: "0.95rem",
    border: "2px solid #fde68a",
    borderRadius: "10px",
    outline: "none",
    boxSizing: "border-box",
  },
  select: {
    width: "100%",
    padding: "10px 12px",
    fontSize: "0.95rem",
    border: "2px solid #fde68a",
    borderRadius: "10px",
    background: "white",
    cursor: "pointer",
    boxSizing: "border-box",
  },
  toggleContainer: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "12px",
    padding: "4px",
    background: "#fef3c7",
    borderRadius: "10px",
  },
  toggleLabel: {
    fontSize: "0.8rem",
    fontWeight: "600",
    color: "#92400e",
    padding: "0 8px",
  },
  toggleButton: {
    flex: 1,
    padding: "8px 12px",
    fontSize: "0.8rem",
    fontWeight: "600",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  toggleActive: {
    background: "linear-gradient(135deg, #f59e0b, #d97706)",
    color: "white",
  },
  toggleInactive: { background: "transparent", color: "#92400e" },
  controlSection: { marginTop: "14px" },
  buttonGroup: { display: "flex", gap: "8px", marginTop: "8px" },
  button: {
    padding: "10px 14px",
    fontSize: "0.85rem",
    fontWeight: "600",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
  },
  primaryButton: {
    background: "linear-gradient(135deg, #f59e0b, #d97706)",
    color: "white",
  },
  secondaryButton: { background: "#fef3c7", color: "#92400e" },
  successButton: {
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "white",
  },
  warningButton: {
    background: "linear-gradient(135deg, #ef4444, #dc2626)",
    color: "white",
  },
  slider: {
    width: "100%",
    height: "6px",
    borderRadius: "3px",
    background: "#fde68a",
    cursor: "pointer",
    marginTop: "8px",
  },
  progressContainer: { marginTop: "14px" },
  progressLabel: { fontSize: "0.75rem", color: "#92400e", marginBottom: "6px" },
  progressBar: {
    height: "6px",
    background: "#fef3c7",
    borderRadius: "3px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(135deg, #f59e0b, #d97706)",
    borderRadius: "3px",
    transition: "width 0.3s",
  },
  legend: { display: "flex", flexDirection: "column", gap: "8px" },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "0.85rem",
    color: "#92400e",
  },
  legendDot: { width: "16px", height: "16px", borderRadius: "4px" },
  treeArea: {
    background: "#fafafa",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    marginBottom: "12px",
  },
  svg: { width: "100%", height: "350px" },
  stackSection: { marginBottom: "12px" },
  stackTitle: {
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "#92400e",
    marginBottom: "8px",
  },
  stackContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    maxHeight: "120px",
    overflowY: "auto",
  },
  emptyStack: {
    color: "#9ca3af",
    fontSize: "0.85rem",
    fontStyle: "italic",
    padding: "8px",
  },
  stackFrame: {
    padding: "8px 12px",
    borderRadius: "6px",
    fontSize: "0.8rem",
    fontFamily: "monospace",
    fontWeight: "500",
  },
  arraySection: { marginBottom: "12px" },
  arrayContainer: { display: "flex", gap: "6px", flexWrap: "wrap" },
  arrayCell: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    borderRadius: "6px",
    padding: "6px 10px",
  },
  arrayCellValue: { fontWeight: "700", fontSize: "0.9rem" },
  arrayCellIndex: { fontSize: "0.65rem", color: "#6b7280" },
  targetLabel: {
    marginTop: "8px",
    fontSize: "0.85rem",
    color: "#92400e",
    fontWeight: "500",
  },
  movesSection: { marginBottom: "12px" },
  movesContainer: { display: "flex", flexWrap: "wrap", gap: "6px" },
  move: {
    padding: "4px 8px",
    background: "#fef3c7",
    borderRadius: "4px",
    fontSize: "0.75rem",
    color: "#92400e",
  },
  explanationBox: {
    padding: "14px",
    background: "linear-gradient(135deg, #fef3c7, #fde68a)",
    borderRadius: "12px",
    border: "1px solid #fcd34d",
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
    color: "#92400e",
    background: "white",
    padding: "3px 8px",
    borderRadius: "6px",
  },
  resultBadge: {
    fontSize: "0.75rem",
    fontWeight: "700",
    color: "#059669",
    background: "#dcfce7",
    padding: "3px 8px",
    borderRadius: "6px",
  },
  explanationText: {
    fontSize: "0.9rem",
    color: "#78350f",
    margin: 0,
    lineHeight: "1.5",
  },
  codeBox: {
    marginTop: "10px",
    padding: "10px",
    background: "#1f2937",
    borderRadius: "8px",
  },
  codeText: { fontSize: "0.8rem", color: "#fcd34d", fontFamily: "monospace" },
  educationHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  toggleBtn: {
    background: "#fef3c7",
    border: "none",
    borderRadius: "6px",
    padding: "4px 10px",
    cursor: "pointer",
    color: "#92400e",
  },
  educationSection: { marginBottom: "16px" },
  sectionTitle: {
    fontSize: "0.85rem",
    fontWeight: "700",
    color: "#78350f",
    marginBottom: "8px",
  },
  sectionContent: {
    fontSize: "0.8rem",
    color: "#92400e",
    lineHeight: "1.6",
    margin: 0,
  },
  conceptBox: {
    background: "#fef3c7",
    borderRadius: "10px",
    padding: "12px",
    border: "1px solid #fde68a",
  },
  conceptItem: { fontSize: "0.8rem", color: "#92400e", margin: "0 0 6px 0" },
  complexityTable: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "0.75rem",
  },
  tableLabel: {
    padding: "8px",
    background: "#fef3c7",
    color: "#92400e",
    fontWeight: "600",
    borderBottom: "1px solid #fde68a",
    width: "35%",
  },
  tableValue: {
    padding: "8px",
    color: "#78350f",
    borderBottom: "1px solid #fde68a",
    fontFamily: "monospace",
    fontSize: "0.7rem",
  },
  tipsList: {
    fontSize: "0.8rem",
    color: "#92400e",
    paddingLeft: "18px",
    margin: 0,
    lineHeight: "1.8",
  },
  edgeCaseList: {
    fontSize: "0.8rem",
    color: "#92400e",
    paddingLeft: "18px",
    margin: 0,
    lineHeight: "1.8",
  },
};
