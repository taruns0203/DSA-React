import React, { useState, useEffect, useCallback, useRef } from "react";

/**
 * Binary Search Complete Visualizer
 * ==================================
 * A comprehensive educational tool for understanding Binary Search
 *
 * Featured Variants:
 * 1. Standard Binary Search - Find exact element
 * 2. Find First Occurrence - Leftmost target
 * 3. Find Last Occurrence - Rightmost target
 * 4. Lower Bound - First element >= target
 * 5. Upper Bound - First element > target
 * 6. Search in Rotated Array - Classic interview question
 * 7. Find Peak Element - Local maximum
 * 8. Find Minimum in Rotated Array
 *
 * Key Concepts:
 * - Divide and conquer
 * - Search space reduction
 * - Loop invariants
 * - Boundary conditions
 */

// ============================================
// BINARY SEARCH IMPLEMENTATIONS
// ============================================

// Standard Binary Search
function standardBinarySearch(arr, target) {
  const steps = [];
  let left = 0;
  let right = arr.length - 1;
  let comparisons = 0;

  steps.push({
    type: "init",
    message: `Search for ${target} in sorted array [${arr.join(", ")}]`,
    left,
    right,
    mid: null,
    array: [...arr],
    target,
    comparisons: 0,
    code: `left = 0, right = ${arr.length - 1}`,
  });

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    comparisons++;

    steps.push({
      type: "calculate-mid",
      message: `Calculate mid = ⌊(${left} + ${right}) / 2⌋ = ${mid}`,
      left,
      right,
      mid,
      array: [...arr],
      target,
      comparisons,
      code: `mid = (${left} + ${right}) / 2 = ${mid}`,
    });

    steps.push({
      type: "compare",
      message: `Compare arr[${mid}] = ${arr[mid]} with target ${target}`,
      left,
      right,
      mid,
      array: [...arr],
      target,
      comparisons,
      comparing: mid,
      code: `if (arr[${mid}] == ${target}) ?`,
    });

    if (arr[mid] === target) {
      steps.push({
        type: "found",
        message: `Found! arr[${mid}] = ${target}. Return index ${mid}.`,
        left,
        right,
        mid,
        array: [...arr],
        target,
        comparisons,
        found: mid,
        code: `return ${mid}; // Found!`,
      });
      return { steps, result: mid, comparisons };
    } else if (arr[mid] < target) {
      steps.push({
        type: "go-right",
        message: `${arr[mid]} < ${target} → Target is in RIGHT half. Move left = mid + 1 = ${mid + 1}`,
        left: mid + 1,
        right,
        mid,
        array: [...arr],
        target,
        comparisons,
        eliminated: { start: left, end: mid },
        code: `left = mid + 1 = ${mid + 1}`,
      });
      left = mid + 1;
    } else {
      steps.push({
        type: "go-left",
        message: `${arr[mid]} > ${target} → Target is in LEFT half. Move right = mid - 1 = ${mid - 1}`,
        left,
        right: mid - 1,
        mid,
        array: [...arr],
        target,
        comparisons,
        eliminated: { start: mid, end: right },
        code: `right = mid - 1 = ${mid - 1}`,
      });
      right = mid - 1;
    }
  }

  steps.push({
    type: "not-found",
    message: `left (${left}) > right (${right}). Search space exhausted. Target ${target} not found.`,
    left,
    right,
    mid: null,
    array: [...arr],
    target,
    comparisons,
    code: `return -1; // Not found`,
  });

  return { steps, result: -1, comparisons };
}

// Find First Occurrence
function findFirstOccurrence(arr, target) {
  const steps = [];
  let left = 0;
  let right = arr.length - 1;
  let result = -1;
  let comparisons = 0;

  steps.push({
    type: "init",
    message: `Find FIRST occurrence of ${target} in [${arr.join(", ")}]`,
    left,
    right,
    mid: null,
    array: [...arr],
    target,
    result: -1,
    comparisons: 0,
    code: `left = 0, right = ${arr.length - 1}, result = -1`,
  });

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    comparisons++;

    steps.push({
      type: "calculate-mid",
      message: `mid = ${mid}, arr[mid] = ${arr[mid]}`,
      left,
      right,
      mid,
      array: [...arr],
      target,
      result,
      comparisons,
      code: `mid = ${mid}`,
    });

    if (arr[mid] === target) {
      result = mid;
      steps.push({
        type: "found-continue",
        message: `Found ${target} at index ${mid}! But continue searching LEFT for earlier occurrence.`,
        left,
        right: mid - 1,
        mid,
        array: [...arr],
        target,
        result: mid,
        comparisons,
        potentialResult: mid,
        code: `result = ${mid}; right = mid - 1 // Keep searching left`,
      });
      right = mid - 1;
    } else if (arr[mid] < target) {
      steps.push({
        type: "go-right",
        message: `${arr[mid]} < ${target} → Move right: left = ${mid + 1}`,
        left: mid + 1,
        right,
        mid,
        array: [...arr],
        target,
        result,
        comparisons,
        code: `left = ${mid + 1}`,
      });
      left = mid + 1;
    } else {
      steps.push({
        type: "go-left",
        message: `${arr[mid]} > ${target} → Move left: right = ${mid - 1}`,
        left,
        right: mid - 1,
        mid,
        array: [...arr],
        target,
        result,
        comparisons,
        code: `right = ${mid - 1}`,
      });
      right = mid - 1;
    }
  }

  steps.push({
    type: result !== -1 ? "complete" : "not-found",
    message:
      result !== -1
        ? `First occurrence of ${target} is at index ${result}`
        : `${target} not found in array`,
    left,
    right,
    mid: null,
    array: [...arr],
    target,
    result,
    comparisons,
    found: result !== -1 ? result : null,
    code: `return ${result};`,
  });

  return { steps, result, comparisons };
}

// Find Last Occurrence
function findLastOccurrence(arr, target) {
  const steps = [];
  let left = 0;
  let right = arr.length - 1;
  let result = -1;
  let comparisons = 0;

  steps.push({
    type: "init",
    message: `Find LAST occurrence of ${target} in [${arr.join(", ")}]`,
    left,
    right,
    mid: null,
    array: [...arr],
    target,
    result: -1,
    comparisons: 0,
    code: `left = 0, right = ${arr.length - 1}, result = -1`,
  });

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    comparisons++;

    steps.push({
      type: "calculate-mid",
      message: `mid = ${mid}, arr[mid] = ${arr[mid]}`,
      left,
      right,
      mid,
      array: [...arr],
      target,
      result,
      comparisons,
      code: `mid = ${mid}`,
    });

    if (arr[mid] === target) {
      result = mid;
      steps.push({
        type: "found-continue",
        message: `Found ${target} at index ${mid}! Continue searching RIGHT for later occurrence.`,
        left: mid + 1,
        right,
        mid,
        array: [...arr],
        target,
        result: mid,
        comparisons,
        potentialResult: mid,
        code: `result = ${mid}; left = mid + 1 // Keep searching right`,
      });
      left = mid + 1;
    } else if (arr[mid] < target) {
      steps.push({
        type: "go-right",
        message: `${arr[mid]} < ${target} → Move right: left = ${mid + 1}`,
        left: mid + 1,
        right,
        mid,
        array: [...arr],
        target,
        result,
        comparisons,
        code: `left = ${mid + 1}`,
      });
      left = mid + 1;
    } else {
      steps.push({
        type: "go-left",
        message: `${arr[mid]} > ${target} → Move left: right = ${mid - 1}`,
        left,
        right: mid - 1,
        mid,
        array: [...arr],
        target,
        result,
        comparisons,
        code: `right = ${mid - 1}`,
      });
      right = mid - 1;
    }
  }

  steps.push({
    type: result !== -1 ? "complete" : "not-found",
    message:
      result !== -1
        ? `Last occurrence of ${target} is at index ${result}`
        : `${target} not found in array`,
    left,
    right,
    mid: null,
    array: [...arr],
    target,
    result,
    comparisons,
    found: result !== -1 ? result : null,
    code: `return ${result};`,
  });

  return { steps, result, comparisons };
}

// Lower Bound (first element >= target)
function lowerBound(arr, target) {
  const steps = [];
  let left = 0;
  let right = arr.length;
  let comparisons = 0;

  steps.push({
    type: "init",
    message: `Find Lower Bound: first index where arr[i] >= ${target}`,
    left,
    right,
    mid: null,
    array: [...arr],
    target,
    comparisons: 0,
    code: `left = 0, right = ${arr.length} // Note: right = n`,
  });

  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    comparisons++;

    steps.push({
      type: "calculate-mid",
      message: `mid = ${mid}, arr[mid] = ${arr[mid]}`,
      left,
      right,
      mid,
      array: [...arr],
      target,
      comparisons,
      code: `mid = ${mid}`,
    });

    if (arr[mid] >= target) {
      steps.push({
        type: "go-left",
        message: `${arr[mid]} >= ${target} → Potential answer! Search left: right = ${mid}`,
        left,
        right: mid,
        mid,
        array: [...arr],
        target,
        comparisons,
        potentialResult: mid,
        code: `right = mid = ${mid} // Could be answer`,
      });
      right = mid;
    } else {
      steps.push({
        type: "go-right",
        message: `${arr[mid]} < ${target} → Too small. Search right: left = ${mid + 1}`,
        left: mid + 1,
        right,
        mid,
        array: [...arr],
        target,
        comparisons,
        code: `left = mid + 1 = ${mid + 1}`,
      });
      left = mid + 1;
    }
  }

  const result = left < arr.length ? left : -1;
  steps.push({
    type: "complete",
    message:
      left < arr.length
        ? `Lower bound at index ${left}: arr[${left}] = ${arr[left]} >= ${target}`
        : `No element >= ${target} found`,
    left,
    right,
    mid: null,
    array: [...arr],
    target,
    comparisons,
    found: result !== -1 ? result : null,
    code: `return ${left}; // Lower bound`,
  });

  return { steps, result, comparisons };
}

// Upper Bound (first element > target)
function upperBound(arr, target) {
  const steps = [];
  let left = 0;
  let right = arr.length;
  let comparisons = 0;

  steps.push({
    type: "init",
    message: `Find Upper Bound: first index where arr[i] > ${target}`,
    left,
    right,
    mid: null,
    array: [...arr],
    target,
    comparisons: 0,
    code: `left = 0, right = ${arr.length}`,
  });

  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    comparisons++;

    steps.push({
      type: "calculate-mid",
      message: `mid = ${mid}, arr[mid] = ${arr[mid]}`,
      left,
      right,
      mid,
      array: [...arr],
      target,
      comparisons,
      code: `mid = ${mid}`,
    });

    if (arr[mid] > target) {
      steps.push({
        type: "go-left",
        message: `${arr[mid]} > ${target} → Potential answer! Search left: right = ${mid}`,
        left,
        right: mid,
        mid,
        array: [...arr],
        target,
        comparisons,
        potentialResult: mid,
        code: `right = mid = ${mid}`,
      });
      right = mid;
    } else {
      steps.push({
        type: "go-right",
        message: `${arr[mid]} <= ${target} → Need larger. Search right: left = ${mid + 1}`,
        left: mid + 1,
        right,
        mid,
        array: [...arr],
        target,
        comparisons,
        code: `left = mid + 1 = ${mid + 1}`,
      });
      left = mid + 1;
    }
  }

  const result = left < arr.length ? left : -1;
  steps.push({
    type: "complete",
    message:
      left < arr.length
        ? `Upper bound at index ${left}: arr[${left}] = ${arr[left]} > ${target}`
        : `No element > ${target} found`,
    left,
    right,
    mid: null,
    array: [...arr],
    target,
    comparisons,
    found: result !== -1 ? result : null,
    code: `return ${left}; // Upper bound`,
  });

  return { steps, result, comparisons };
}

// Search in Rotated Sorted Array
function searchRotated(arr, target) {
  const steps = [];
  let left = 0;
  let right = arr.length - 1;
  let comparisons = 0;

  steps.push({
    type: "init",
    message: `Search ${target} in rotated sorted array [${arr.join(", ")}]`,
    left,
    right,
    mid: null,
    array: [...arr],
    target,
    comparisons: 0,
    code: `// Array is sorted but rotated at some pivot`,
  });

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    comparisons++;

    steps.push({
      type: "calculate-mid",
      message: `mid = ${mid}, arr[mid] = ${arr[mid]}`,
      left,
      right,
      mid,
      array: [...arr],
      target,
      comparisons,
      code: `mid = ${mid}`,
    });

    if (arr[mid] === target) {
      steps.push({
        type: "found",
        message: `Found ${target} at index ${mid}!`,
        left,
        right,
        mid,
        array: [...arr],
        target,
        comparisons,
        found: mid,
        code: `return ${mid}; // Found!`,
      });
      return { steps, result: mid, comparisons };
    }

    // Check which half is sorted
    if (arr[left] <= arr[mid]) {
      // Left half is sorted
      steps.push({
        type: "check-sorted",
        message: `Left half [${left}..${mid}] is sorted (${arr[left]} <= ${arr[mid]})`,
        left,
        right,
        mid,
        array: [...arr],
        target,
        comparisons,
        sortedHalf: "left",
        code: `// Left half is sorted`,
      });

      if (arr[left] <= target && target < arr[mid]) {
        steps.push({
          type: "go-left",
          message: `Target ${target} is in sorted left half [${arr[left]}..${arr[mid - 1]}]`,
          left,
          right: mid - 1,
          mid,
          array: [...arr],
          target,
          comparisons,
          code: `right = mid - 1`,
        });
        right = mid - 1;
      } else {
        steps.push({
          type: "go-right",
          message: `Target ${target} must be in right half`,
          left: mid + 1,
          right,
          mid,
          array: [...arr],
          target,
          comparisons,
          code: `left = mid + 1`,
        });
        left = mid + 1;
      }
    } else {
      // Right half is sorted
      steps.push({
        type: "check-sorted",
        message: `Right half [${mid}..${right}] is sorted (${arr[mid]} <= ${arr[right]})`,
        left,
        right,
        mid,
        array: [...arr],
        target,
        comparisons,
        sortedHalf: "right",
        code: `// Right half is sorted`,
      });

      if (arr[mid] < target && target <= arr[right]) {
        steps.push({
          type: "go-right",
          message: `Target ${target} is in sorted right half [${arr[mid + 1]}..${arr[right]}]`,
          left: mid + 1,
          right,
          mid,
          array: [...arr],
          target,
          comparisons,
          code: `left = mid + 1`,
        });
        left = mid + 1;
      } else {
        steps.push({
          type: "go-left",
          message: `Target ${target} must be in left half`,
          left,
          right: mid - 1,
          mid,
          array: [...arr],
          target,
          comparisons,
          code: `right = mid - 1`,
        });
        right = mid - 1;
      }
    }
  }

  steps.push({
    type: "not-found",
    message: `Target ${target} not found in rotated array`,
    left,
    right,
    mid: null,
    array: [...arr],
    target,
    comparisons,
    code: `return -1; // Not found`,
  });

  return { steps, result: -1, comparisons };
}

// Find Peak Element
function findPeakElement(arr) {
  const steps = [];
  let left = 0;
  let right = arr.length - 1;
  let comparisons = 0;

  steps.push({
    type: "init",
    message: `Find a peak element in [${arr.join(", ")}]. Peak: arr[i] > arr[i-1] and arr[i] > arr[i+1]`,
    left,
    right,
    mid: null,
    array: [...arr],
    comparisons: 0,
    code: `// Peak is greater than neighbors`,
  });

  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    comparisons++;

    steps.push({
      type: "calculate-mid",
      message: `mid = ${mid}, arr[mid] = ${arr[mid]}, arr[mid+1] = ${arr[mid + 1]}`,
      left,
      right,
      mid,
      array: [...arr],
      comparisons,
      code: `mid = ${mid}`,
    });

    if (arr[mid] > arr[mid + 1]) {
      steps.push({
        type: "go-left",
        message: `${arr[mid]} > ${arr[mid + 1]} → Peak is at mid or LEFT. Move right = ${mid}`,
        left,
        right: mid,
        mid,
        array: [...arr],
        comparisons,
        direction: "descending",
        code: `right = mid = ${mid} // Peak in left half`,
      });
      right = mid;
    } else {
      steps.push({
        type: "go-right",
        message: `${arr[mid]} < ${arr[mid + 1]} → Peak is on RIGHT. Move left = ${mid + 1}`,
        left: mid + 1,
        right,
        mid,
        array: [...arr],
        comparisons,
        direction: "ascending",
        code: `left = mid + 1 = ${mid + 1} // Peak in right half`,
      });
      left = mid + 1;
    }
  }

  steps.push({
    type: "complete",
    message: `Peak found at index ${left}: arr[${left}] = ${arr[left]}`,
    left,
    right,
    mid: null,
    array: [...arr],
    comparisons,
    found: left,
    code: `return ${left}; // Peak element`,
  });

  return { steps, result: left, comparisons };
}

// Find Minimum in Rotated Sorted Array
function findMinRotated(arr) {
  const steps = [];
  let left = 0;
  let right = arr.length - 1;
  let comparisons = 0;

  steps.push({
    type: "init",
    message: `Find minimum in rotated sorted array [${arr.join(", ")}]`,
    left,
    right,
    mid: null,
    array: [...arr],
    comparisons: 0,
    code: `// Minimum is at the rotation point`,
  });

  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    comparisons++;

    steps.push({
      type: "calculate-mid",
      message: `mid = ${mid}, arr[mid] = ${arr[mid]}, arr[right] = ${arr[right]}`,
      left,
      right,
      mid,
      array: [...arr],
      comparisons,
      code: `mid = ${mid}`,
    });

    if (arr[mid] > arr[right]) {
      steps.push({
        type: "go-right",
        message: `${arr[mid]} > ${arr[right]} → Minimum is in RIGHT half (after rotation point)`,
        left: mid + 1,
        right,
        mid,
        array: [...arr],
        comparisons,
        code: `left = mid + 1 = ${mid + 1}`,
      });
      left = mid + 1;
    } else {
      steps.push({
        type: "go-left",
        message: `${arr[mid]} <= ${arr[right]} → Minimum is at mid or LEFT`,
        left,
        right: mid,
        mid,
        array: [...arr],
        comparisons,
        code: `right = mid = ${mid}`,
      });
      right = mid;
    }
  }

  steps.push({
    type: "complete",
    message: `Minimum found at index ${left}: arr[${left}] = ${arr[left]}`,
    left,
    right,
    mid: null,
    array: [...arr],
    comparisons,
    found: left,
    code: `return ${left}; // Minimum element`,
  });

  return { steps, result: left, comparisons };
}

// ============================================
// MAIN VISUALIZER COMPONENT
// ============================================
export default function BinarySearchVisualizer() {
  const [algorithm, setAlgorithm] = useState("standard");
  const [inputArray, setInputArray] = useState(
    "1, 3, 5, 7, 9, 11, 13, 15, 17, 19",
  );
  const [target, setTarget] = useState(11);
  const [animationSteps, setAnimationSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);
  const [displayArray, setDisplayArray] = useState([]);
  const [left, setLeft] = useState(null);
  const [right, setRight] = useState(null);
  const [mid, setMid] = useState(null);
  const [found, setFound] = useState(null);
  const [eliminated, setEliminated] = useState(null);
  const [potentialResult, setPotentialResult] = useState(null);
  const [explanation, setExplanation] = useState(
    "Welcome to Binary Search Visualizer! Select an algorithm and execute.",
  );
  const [codeSnippet, setCodeSnippet] = useState("");
  const [comparisons, setComparisons] = useState(0);
  const [result, setResult] = useState(null);
  const [showEducation, setShowEducation] = useState(true);

  const animationRef = useRef(null);

  // Algorithms config
  const algorithms = [
    {
      value: "standard",
      label: "🔍 Standard Binary Search",
      needsTarget: true,
    },
    {
      value: "firstOccurrence",
      label: "⬅️ Find First Occurrence",
      needsTarget: true,
    },
    {
      value: "lastOccurrence",
      label: "➡️ Find Last Occurrence",
      needsTarget: true,
    },
    { value: "lowerBound", label: "📉 Lower Bound (>=)", needsTarget: true },
    { value: "upperBound", label: "📈 Upper Bound (>)", needsTarget: true },
    {
      value: "rotatedSearch",
      label: "🔄 Search in Rotated Array",
      needsTarget: true,
    },
    { value: "peakElement", label: "⛰️ Find Peak Element", needsTarget: false },
    {
      value: "minRotated",
      label: "📍 Min in Rotated Array",
      needsTarget: false,
    },
  ];

  // Complexity info
  const complexityInfo = {
    standard: {
      time: "O(log n)",
      space: "O(1)",
      description: "Halve search space each iteration",
    },
    firstOccurrence: {
      time: "O(log n)",
      space: "O(1)",
      description: "Continue left after finding target",
    },
    lastOccurrence: {
      time: "O(log n)",
      space: "O(1)",
      description: "Continue right after finding target",
    },
    lowerBound: {
      time: "O(log n)",
      space: "O(1)",
      description: "First position where element >= target",
    },
    upperBound: {
      time: "O(log n)",
      space: "O(1)",
      description: "First position where element > target",
    },
    rotatedSearch: {
      time: "O(log n)",
      space: "O(1)",
      description: "Determine which half is sorted",
    },
    peakElement: {
      time: "O(log n)",
      space: "O(1)",
      description: "Move toward increasing direction",
    },
    minRotated: {
      time: "O(log n)",
      space: "O(1)",
      description: "Find rotation pivot point",
    },
  };

  // Execute search
  const executeSearch = useCallback(() => {
    let arr = inputArray
      .split(",")
      .map((x) => parseInt(x.trim()))
      .filter((x) => !isNaN(x));

    // Sort for standard algorithms (except rotated)
    if (!["rotatedSearch", "minRotated", "peakElement"].includes(algorithm)) {
      arr.sort((a, b) => a - b);
    }

    let searchResult;

    switch (algorithm) {
      case "standard":
        searchResult = standardBinarySearch(arr, target);
        break;
      case "firstOccurrence":
        searchResult = findFirstOccurrence(arr, target);
        break;
      case "lastOccurrence":
        searchResult = findLastOccurrence(arr, target);
        break;
      case "lowerBound":
        searchResult = lowerBound(arr, target);
        break;
      case "upperBound":
        searchResult = upperBound(arr, target);
        break;
      case "rotatedSearch":
        searchResult = searchRotated(arr, target);
        break;
      case "peakElement":
        searchResult = findPeakElement(arr);
        break;
      case "minRotated":
        searchResult = findMinRotated(arr);
        break;
      default:
        return;
    }

    setAnimationSteps(searchResult.steps);
    setCurrentStep(-1);
    setDisplayArray(arr);
    setLeft(null);
    setRight(null);
    setMid(null);
    setFound(null);
    setEliminated(null);
    setPotentialResult(null);
    setComparisons(0);
    setResult(null);
    setExplanation('🎬 Ready! Click "Step" or "Play" to begin.');
  }, [algorithm, inputArray, target]);

  // Animation handler
  useEffect(() => {
    if (currentStep >= 0 && currentStep < animationSteps.length) {
      const step = animationSteps[currentStep];
      setLeft(step.left);
      setRight(step.right);
      setMid(step.mid);
      setFound(step.found ?? null);
      setEliminated(step.eliminated ?? null);
      setPotentialResult(step.potentialResult ?? null);
      setExplanation(step.message);
      setCodeSnippet(step.code || "");
      setComparisons(step.comparisons || 0);
      if (
        step.type === "found" ||
        step.type === "complete" ||
        step.type === "not-found"
      ) {
        setResult(
          animationSteps[animationSteps.length - 1].result ?? step.found ?? -1,
        );
      }
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
    setLeft(null);
    setRight(null);
    setMid(null);
    setFound(null);
    setEliminated(null);
    setPotentialResult(null);
    setComparisons(0);
    setResult(null);
    setExplanation("🔄 Reset. Ready to search again.");
  };

  const generateRandom = () => {
    const size = 10 + Math.floor(Math.random() * 6);
    const arr = [];
    let val = Math.floor(Math.random() * 5) + 1;
    for (let i = 0; i < size; i++) {
      arr.push(val);
      val += Math.floor(Math.random() * 5) + 1;
    }

    if (["rotatedSearch", "minRotated"].includes(algorithm)) {
      // Rotate array
      const pivot = Math.floor(Math.random() * (size - 2)) + 1;
      const rotated = [...arr.slice(pivot), ...arr.slice(0, pivot)];
      setInputArray(rotated.join(", "));
      setTarget(rotated[Math.floor(Math.random() * size)]);
    } else if (algorithm === "peakElement") {
      // Create array with peak
      const peak = arr[Math.floor(arr.length / 2)];
      const peakArr = arr
        .slice(0, arr.length / 2)
        .concat(arr.slice(arr.length / 2).reverse());
      setInputArray(peakArr.join(", "));
    } else {
      // Add some duplicates for occurrence searches
      if (["firstOccurrence", "lastOccurrence"].includes(algorithm)) {
        const dupVal = arr[Math.floor(arr.length / 2)];
        arr.splice(Math.floor(arr.length / 2), 0, dupVal, dupVal);
        setTarget(dupVal);
      } else {
        setTarget(arr[Math.floor(Math.random() * arr.length)]);
      }
      setInputArray(arr.join(", "));
    }
    setExplanation("🎲 Random array generated!");
  };

  // Get cell style
  const getCellStyle = (index) => {
    let bg = "#f1f5f9";
    let borderColor = "#e2e8f0";
    let scale = 1;
    let textColor = "#334155";

    if (found === index) {
      bg = "linear-gradient(135deg, #10b981, #059669)";
      borderColor = "#059669";
      textColor = "white";
      scale = 1.15;
    } else if (potentialResult === index) {
      bg = "linear-gradient(135deg, #8b5cf6, #7c3aed)";
      borderColor = "#7c3aed";
      textColor = "white";
      scale = 1.1;
    } else if (mid === index) {
      bg = "linear-gradient(135deg, #f59e0b, #d97706)";
      borderColor = "#d97706";
      textColor = "white";
      scale = 1.1;
    } else if (
      eliminated &&
      index >= eliminated.start &&
      index <= eliminated.end
    ) {
      bg = "#fee2e2";
      borderColor = "#fca5a5";
      textColor = "#991b1b";
    } else if (
      left !== null &&
      right !== null &&
      index >= left &&
      index <= right
    ) {
      bg = "linear-gradient(135deg, #dbeafe, #bfdbfe)";
      borderColor = "#3b82f6";
    }

    return {
      ...styles.arrayCell,
      background: bg,
      borderColor,
      color: textColor,
      transform: `scale(${scale})`,
      transition: "all 0.3s ease",
    };
  };

  // Get pointer indicators
  const getPointers = (index) => {
    const pointers = [];
    if (left === index) pointers.push({ label: "L", color: "#3b82f6" });
    if (right === index) pointers.push({ label: "R", color: "#ef4444" });
    if (mid === index) pointers.push({ label: "M", color: "#f59e0b" });
    return pointers;
  };

  const currentAlgo = algorithms.find((a) => a.value === algorithm);

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.title}>🔍 Binary Search Visualizer</h1>
        <p style={styles.subtitle}>
          Master the art of divide and conquer with O(log n) efficiency
        </p>
      </header>

      <div style={styles.mainContent}>
        {/* Left Panel */}
        <div style={styles.leftPanel}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>⚙️ Control Panel</h2>

            {/* Algorithm Selector */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Algorithm</label>
              <select
                style={styles.select}
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value)}
              >
                {algorithms.map((a) => (
                  <option key={a.value} value={a.value}>
                    {a.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Array Input */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Array (comma-separated)</label>
              <input
                style={styles.input}
                value={inputArray}
                onChange={(e) => setInputArray(e.target.value)}
                placeholder="1, 3, 5, 7, 9, 11"
              />
            </div>

            {/* Target Input */}
            {currentAlgo?.needsTarget && (
              <div style={styles.inputGroup}>
                <label style={styles.label}>Target Value</label>
                <input
                  type="number"
                  style={styles.input}
                  value={target}
                  onChange={(e) => setTarget(parseInt(e.target.value) || 0)}
                />
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
              onClick={executeSearch}
            >
              ▶ Execute Search
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
                    background: "linear-gradient(135deg, #dbeafe, #bfdbfe)",
                    border: "2px solid #3b82f6",
                  }}
                />
                <span>Search Space</span>
              </div>
              <div style={styles.legendItem}>
                <div
                  style={{
                    ...styles.legendDot,
                    background: "linear-gradient(135deg, #f59e0b, #d97706)",
                  }}
                />
                <span>Mid (comparing)</span>
              </div>
              <div style={styles.legendItem}>
                <div
                  style={{
                    ...styles.legendDot,
                    background: "linear-gradient(135deg, #10b981, #059669)",
                  }}
                />
                <span>Found</span>
              </div>
              <div style={styles.legendItem}>
                <div
                  style={{
                    ...styles.legendDot,
                    background: "#fee2e2",
                    border: "2px solid #fca5a5",
                  }}
                />
                <span>Eliminated</span>
              </div>
              <div style={styles.legendItem}>
                <div
                  style={{
                    ...styles.legendDot,
                    background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
                  }}
                />
                <span>Potential Result</span>
              </div>
            </div>
            <div style={styles.pointerLegend}>
              <span style={{ ...styles.pointerBadge, background: "#3b82f6" }}>
                L
              </span>{" "}
              Left
              <span
                style={{
                  ...styles.pointerBadge,
                  background: "#ef4444",
                  marginLeft: "12px",
                }}
              >
                R
              </span>{" "}
              Right
              <span
                style={{
                  ...styles.pointerBadge,
                  background: "#f59e0b",
                  marginLeft: "12px",
                }}
              >
                M
              </span>{" "}
              Mid
            </div>
          </div>
        </div>

        {/* Center Panel */}
        <div style={styles.centerPanel}>
          <div style={styles.card}>
            <div style={styles.vizHeader}>
              <h2 style={styles.cardTitle}>📊 Array Visualization</h2>
              <div style={styles.statsBar}>
                <span style={styles.stat}>
                  Comparisons: <strong>{comparisons}</strong>
                </span>
                <span style={styles.stat}>
                  Size: <strong>{displayArray.length}</strong>
                </span>
                <span style={styles.stat}>
                  Max Steps:{" "}
                  <strong>
                    ⌈log₂({displayArray.length})⌉ ={" "}
                    {Math.ceil(Math.log2(displayArray.length || 1))}
                  </strong>
                </span>
              </div>
            </div>

            {/* Array Display */}
            <div style={styles.arrayContainer}>
              {displayArray.length === 0 ? (
                <div style={styles.emptyState}>
                  Execute to visualize the search
                </div>
              ) : (
                <div style={styles.arrayWrapper}>
                  {displayArray.map((val, idx) => (
                    <div key={idx} style={styles.cellContainer}>
                      {/* Pointers */}
                      <div style={styles.pointerRow}>
                        {getPointers(idx).map((p, i) => (
                          <span
                            key={i}
                            style={{ ...styles.pointer, background: p.color }}
                          >
                            {p.label}
                          </span>
                        ))}
                      </div>
                      {/* Cell */}
                      <div style={getCellStyle(idx)}>{val}</div>
                      {/* Index */}
                      <div style={styles.indexLabel}>{idx}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Search Space Indicator */}
            {left !== null && right !== null && displayArray.length > 0 && (
              <div style={styles.searchSpaceInfo}>
                <span>
                  Search Space: indices [{left}...{right}] = {right - left + 1}{" "}
                  element{right - left !== 0 ? "s" : ""}
                </span>
                {mid !== null && (
                  <span style={styles.midInfo}>
                    Mid index: {mid}, Value: {displayArray[mid]}
                  </span>
                )}
              </div>
            )}

            {/* Result Display */}
            {result !== null && currentStep === animationSteps.length - 1 && (
              <div
                style={{
                  ...styles.resultBox,
                  background:
                    result === -1
                      ? "linear-gradient(135deg, #fee2e2, #fecaca)"
                      : "linear-gradient(135deg, #dcfce7, #bbf7d0)",
                  borderColor: result === -1 ? "#fca5a5" : "#86efac",
                }}
              >
                {result === -1 ? (
                  <span style={{ color: "#991b1b" }}>❌ Target not found</span>
                ) : (
                  <span style={{ color: "#166534" }}>
                    ✅ Result: index {result}{" "}
                    {currentAlgo?.needsTarget
                      ? `(value = ${displayArray[result]})`
                      : `(${displayArray[result]})`}
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
                <span style={styles.algoBadge}>{currentAlgo?.label}</span>
              </div>
              <p style={styles.explanationText}>{explanation}</p>
              {codeSnippet && (
                <div style={styles.codeBox}>
                  <code style={styles.codeText}>{codeSnippet}</code>
                </div>
              )}
            </div>

            {/* Visual Formula */}
            <div style={styles.formulaBox}>
              <div style={styles.formula}>
                <span style={styles.formulaLabel}>Mid Calculation:</span>
                <code style={styles.formulaCode}>
                  mid = ⌊(left + right) / 2⌋
                </code>
              </div>
              <div style={styles.formula}>
                <span style={styles.formulaLabel}>Iterations:</span>
                <code style={styles.formulaCode}>≤ ⌈log₂(n)⌉ comparisons</code>
              </div>
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
                  <h3 style={styles.sectionTitle}>🔑 Key Insight</h3>
                  <div style={styles.insightBox}>
                    <p style={styles.insightText}>
                      Binary search exploits <strong>sorted order</strong> to
                      eliminate half the search space with each comparison.
                    </p>
                    <p style={styles.insightFormula}>
                      n → n/2 → n/4 → ... → 1<br />
                      Takes log₂(n) steps
                    </p>
                  </div>
                </div>

                <div style={styles.educationSection}>
                  <h3 style={styles.sectionTitle}>
                    🔧 {currentAlgo?.label.replace(/[^\w\s]/g, "")}
                  </h3>
                  <p style={styles.sectionContent}>
                    {algorithm === "standard" &&
                      "Classic binary search: compare mid with target, eliminate half each time."}
                    {algorithm === "firstOccurrence" &&
                      "Find leftmost target: when found, continue searching left (right = mid - 1)."}
                    {algorithm === "lastOccurrence" &&
                      "Find rightmost target: when found, continue searching right (left = mid + 1)."}
                    {algorithm === "lowerBound" &&
                      "Find first index i where arr[i] >= target. Used in C++ STL."}
                    {algorithm === "upperBound" &&
                      "Find first index i where arr[i] > target. Upper - Lower = count of target."}
                    {algorithm === "rotatedSearch" &&
                      "One half is always sorted. Check if target is in sorted half, else search other half."}
                    {algorithm === "peakElement" &&
                      "Compare mid with mid+1. Move toward the increasing direction to find peak."}
                    {algorithm === "minRotated" &&
                      "Minimum is at rotation point. Compare mid with right to determine direction."}
                  </p>
                </div>

                <div style={styles.educationSection}>
                  <h3 style={styles.sectionTitle}>📊 Complexity</h3>
                  <table style={styles.complexityTable}>
                    <tbody>
                      <tr>
                        <td style={styles.tableLabel}>Time</td>
                        <td style={styles.tableValue}>
                          {complexityInfo[algorithm]?.time}
                        </td>
                      </tr>
                      <tr>
                        <td style={styles.tableLabel}>Space</td>
                        <td style={styles.tableValue}>
                          {complexityInfo[algorithm]?.space}
                        </td>
                      </tr>
                      <tr>
                        <td style={styles.tableLabel}>Key</td>
                        <td style={styles.tableValue}>
                          {complexityInfo[algorithm]?.description}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div style={styles.educationSection}>
                  <h3 style={styles.sectionTitle}>⚠️ Common Pitfalls</h3>
                  <ul style={styles.pitfallList}>
                    <li>
                      <strong>Integer overflow:</strong> Use left + (right -
                      left) / 2
                    </li>
                    <li>
                      <strong>Infinite loop:</strong> Ensure search space
                      shrinks
                    </li>
                    <li>
                      <strong>Off-by-one:</strong> Carefully handle boundaries
                    </li>
                    <li>
                      <strong>Unsorted array:</strong> Binary search requires
                      sorted input
                    </li>
                  </ul>
                </div>

                <div style={styles.educationSection}>
                  <h3 style={styles.sectionTitle}>💡 Loop Templates</h3>
                  <div style={styles.templateBox}>
                    <code style={styles.templateCode}>
                      {`// Template 1: left <= right
while (left <= right) {
  mid = (left + right) / 2;
  if (found) return mid;
  if (go_left) right = mid - 1;
  else left = mid + 1;
}`}
                    </code>
                  </div>
                  <div style={{ ...styles.templateBox, marginTop: "8px" }}>
                    <code style={styles.templateCode}>
                      {`// Template 2: left < right
while (left < right) {
  mid = (left + right) / 2;
  if (condition) right = mid;
  else left = mid + 1;
}
return left; // Converges`}
                    </code>
                  </div>
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
      "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 50%, #a7f3d0 100%)",
    minHeight: "100vh",
    padding: "16px",
    boxSizing: "border-box",
  },
  header: { textAlign: "center", marginBottom: "20px" },
  title: {
    fontSize: "2.25rem",
    fontWeight: "800",
    background:
      "linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    margin: "0 0 6px 0",
  },
  subtitle: {
    fontSize: "1rem",
    color: "#065f46",
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
    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
    border: "1px solid #d1fae5",
  },
  cardTitle: {
    fontSize: "1rem",
    fontWeight: "700",
    color: "#065f46",
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
    color: "#065f46",
    marginBottom: "6px",
    textTransform: "uppercase",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    fontSize: "0.95rem",
    border: "2px solid #a7f3d0",
    borderRadius: "10px",
    outline: "none",
    boxSizing: "border-box",
  },
  select: {
    width: "100%",
    padding: "10px 12px",
    fontSize: "0.95rem",
    border: "2px solid #a7f3d0",
    borderRadius: "10px",
    background: "white",
    cursor: "pointer",
    boxSizing: "border-box",
  },
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
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "white",
  },
  secondaryButton: { background: "#d1fae5", color: "#065f46" },
  successButton: {
    background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
    color: "white",
  },
  warningButton: {
    background: "linear-gradient(135deg, #f59e0b, #d97706)",
    color: "white",
  },
  accentButton: {
    background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
    color: "white",
  },
  slider: {
    width: "100%",
    height: "6px",
    borderRadius: "3px",
    background: "#a7f3d0",
    cursor: "pointer",
    marginTop: "8px",
  },
  progressContainer: { marginTop: "14px" },
  progressLabel: { fontSize: "0.75rem", color: "#065f46", marginBottom: "6px" },
  progressBar: {
    height: "6px",
    background: "#d1fae5",
    borderRadius: "3px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(135deg, #10b981, #059669)",
    borderRadius: "3px",
    transition: "width 0.3s",
  },
  legend: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginBottom: "12px",
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "0.8rem",
    color: "#065f46",
  },
  legendDot: {
    width: "20px",
    height: "20px",
    borderRadius: "4px",
    flexShrink: 0,
  },
  pointerLegend: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "0.8rem",
    color: "#065f46",
    marginTop: "8px",
  },
  pointerBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "20px",
    height: "20px",
    borderRadius: "4px",
    color: "white",
    fontWeight: "700",
    fontSize: "0.7rem",
  },
  vizHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "8px",
    marginBottom: "16px",
  },
  statsBar: {
    display: "flex",
    gap: "16px",
    fontSize: "0.8rem",
    color: "#065f46",
  },
  stat: { background: "#ecfdf5", padding: "4px 10px", borderRadius: "6px" },
  arrayContainer: {
    minHeight: "150px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    background: "#f8fafc",
    borderRadius: "12px",
    marginBottom: "16px",
    overflowX: "auto",
  },
  emptyState: { color: "#9ca3af", fontSize: "1rem" },
  arrayWrapper: { display: "flex", gap: "8px", alignItems: "flex-end" },
  cellContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
  },
  pointerRow: { height: "24px", display: "flex", gap: "2px" },
  pointer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "20px",
    height: "20px",
    borderRadius: "4px",
    color: "white",
    fontWeight: "700",
    fontSize: "0.7rem",
  },
  arrayCell: {
    width: "48px",
    height: "48px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "10px",
    fontWeight: "700",
    fontSize: "1rem",
    border: "2px solid",
  },
  indexLabel: { fontSize: "0.7rem", color: "#6b7280", fontWeight: "500" },
  searchSpaceInfo: {
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "8px",
    padding: "10px 14px",
    background: "#ecfdf5",
    borderRadius: "8px",
    marginBottom: "16px",
    fontSize: "0.85rem",
    color: "#065f46",
  },
  midInfo: { fontWeight: "600", color: "#d97706" },
  resultBox: {
    padding: "14px",
    borderRadius: "10px",
    marginBottom: "16px",
    textAlign: "center",
    fontSize: "1rem",
    fontWeight: "600",
    border: "2px solid",
  },
  explanationBox: {
    padding: "14px",
    background: "linear-gradient(135deg, #ecfdf5, #d1fae5)",
    borderRadius: "12px",
    border: "1px solid #a7f3d0",
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
    color: "#065f46",
    background: "white",
    padding: "3px 8px",
    borderRadius: "6px",
  },
  algoBadge: {
    fontSize: "0.75rem",
    fontWeight: "600",
    color: "#059669",
    background: "white",
    padding: "3px 8px",
    borderRadius: "6px",
  },
  explanationText: {
    fontSize: "0.9rem",
    color: "#064e3b",
    margin: 0,
    lineHeight: "1.5",
  },
  codeBox: {
    marginTop: "10px",
    padding: "10px",
    background: "#1f2937",
    borderRadius: "8px",
  },
  codeText: { fontSize: "0.8rem", color: "#6ee7b7", fontFamily: "monospace" },
  formulaBox: { display: "flex", gap: "16px", flexWrap: "wrap" },
  formula: {
    flex: 1,
    minWidth: "200px",
    padding: "12px",
    background: "#f0fdf4",
    borderRadius: "10px",
    border: "1px solid #bbf7d0",
  },
  formulaLabel: {
    display: "block",
    fontSize: "0.75rem",
    color: "#065f46",
    fontWeight: "600",
    marginBottom: "4px",
  },
  formulaCode: {
    fontSize: "0.85rem",
    color: "#059669",
    fontFamily: "monospace",
  },
  educationHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  toggleBtn: {
    background: "#d1fae5",
    border: "none",
    borderRadius: "6px",
    padding: "4px 10px",
    cursor: "pointer",
    color: "#065f46",
  },
  educationSection: { marginBottom: "16px" },
  sectionTitle: {
    fontSize: "0.85rem",
    fontWeight: "700",
    color: "#064e3b",
    marginBottom: "8px",
  },
  sectionContent: {
    fontSize: "0.8rem",
    color: "#065f46",
    lineHeight: "1.6",
    margin: 0,
  },
  insightBox: {
    background: "#ecfdf5",
    borderRadius: "10px",
    padding: "12px",
    border: "1px solid #a7f3d0",
  },
  insightText: { fontSize: "0.8rem", color: "#065f46", margin: "0 0 8px 0" },
  insightFormula: {
    fontSize: "0.85rem",
    color: "#059669",
    fontFamily: "monospace",
    margin: 0,
    textAlign: "center",
    fontWeight: "600",
  },
  complexityTable: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "0.75rem",
  },
  tableLabel: {
    padding: "8px",
    background: "#ecfdf5",
    color: "#065f46",
    fontWeight: "600",
    borderBottom: "1px solid #a7f3d0",
    width: "30%",
  },
  tableValue: {
    padding: "8px",
    color: "#064e3b",
    borderBottom: "1px solid #d1fae5",
  },
  pitfallList: {
    fontSize: "0.8rem",
    color: "#065f46",
    paddingLeft: "18px",
    margin: 0,
    lineHeight: "1.8",
  },
  templateBox: {
    background: "#1f2937",
    borderRadius: "8px",
    padding: "10px",
    overflow: "auto",
  },
  templateCode: {
    fontSize: "0.7rem",
    color: "#6ee7b7",
    fontFamily: "monospace",
    whiteSpace: "pre",
    lineHeight: "1.5",
  },
};
