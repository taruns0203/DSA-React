import React, { useState, useEffect, useCallback, useRef } from "react";

/**
 * String Algorithms Complete Visualizer
 * =====================================
 * A comprehensive educational tool for understanding String algorithms
 *
 * Featured Algorithms:
 * 1. Naive Pattern Search - Basic O(n*m) approach
 * 2. KMP Algorithm - With LPS array visualization
 * 3. Rabin-Karp - Rolling hash technique
 * 4. Z-Algorithm - Z-array computation
 * 5. Palindrome Check - Two pointer approach
 * 6. Longest Palindromic Substring - Expand around center
 * 7. Anagram Check - Character frequency
 * 8. Reverse String - In-place two pointer
 *
 * Key Concepts:
 * - Pattern matching
 * - Two pointer technique
 * - Sliding window
 * - Hash functions
 * - Prefix functions
 */

// ============================================
// STRING ALGORITHM IMPLEMENTATIONS
// ============================================

// Naive Pattern Search
function naivePatternSearch(text, pattern) {
  const steps = [];
  const n = text.length;
  const m = pattern.length;
  const matches = [];
  let comparisons = 0;

  steps.push({
    type: "init",
    message: `Search for pattern "${pattern}" in text "${text}"`,
    text,
    pattern,
    textIdx: -1,
    patternIdx: -1,
    windowStart: 0,
    comparisons: 0,
    matches: [],
    code: `// Naive: Check pattern at each position`,
  });

  for (let i = 0; i <= n - m; i++) {
    steps.push({
      type: "window-start",
      message: `Try matching pattern starting at text index ${i}`,
      text,
      pattern,
      textIdx: i,
      patternIdx: 0,
      windowStart: i,
      windowEnd: i + m - 1,
      comparisons,
      matches: [...matches],
      code: `for (i = ${i}; i <= ${n - m}; i++)`,
    });

    let j = 0;
    while (j < m && text[i + j] === pattern[j]) {
      comparisons++;
      steps.push({
        type: "compare-match",
        message: `Match! text[${i + j}] = '${text[i + j]}' == pattern[${j}] = '${pattern[j]}'`,
        text,
        pattern,
        textIdx: i + j,
        patternIdx: j,
        windowStart: i,
        comparing: { textIdx: i + j, patternIdx: j },
        matched: true,
        comparisons,
        matches: [...matches],
        code: `text[${i + j}] == pattern[${j}] ✓`,
      });
      j++;
    }

    if (j === m) {
      matches.push(i);
      steps.push({
        type: "pattern-found",
        message: `Pattern found at index ${i}!`,
        text,
        pattern,
        textIdx: i,
        patternIdx: j - 1,
        windowStart: i,
        foundAt: i,
        comparisons,
        matches: [...matches],
        code: `// Found at index ${i}!`,
      });
    } else if (j < m && i + j < n) {
      comparisons++;
      steps.push({
        type: "compare-mismatch",
        message: `Mismatch! text[${i + j}] = '${text[i + j]}' != pattern[${j}] = '${pattern[j]}'`,
        text,
        pattern,
        textIdx: i + j,
        patternIdx: j,
        windowStart: i,
        comparing: { textIdx: i + j, patternIdx: j },
        matched: false,
        comparisons,
        matches: [...matches],
        code: `text[${i + j}] != pattern[${j}] ✗`,
      });
    }
  }

  steps.push({
    type: "complete",
    message:
      matches.length > 0
        ? `Found ${matches.length} occurrence(s) at indices: [${matches.join(", ")}]`
        : `Pattern not found in text`,
    text,
    pattern,
    textIdx: -1,
    patternIdx: -1,
    comparisons,
    matches,
    code: `return [${matches.join(", ")}]; // ${comparisons} comparisons`,
  });

  return { steps, matches, comparisons };
}

// KMP Algorithm
function kmpSearch(text, pattern) {
  const steps = [];
  const n = text.length;
  const m = pattern.length;
  const matches = [];
  let comparisons = 0;

  // Build LPS array
  const lps = new Array(m).fill(0);

  steps.push({
    type: "init",
    message: `KMP Search: Build LPS (Longest Proper Prefix which is also Suffix) array first`,
    text,
    pattern,
    lps: [...lps],
    phase: "building-lps",
    code: `// Step 1: Build LPS array`,
  });

  // Compute LPS
  let len = 0;
  let i = 1;

  while (i < m) {
    steps.push({
      type: "lps-compare",
      message: `LPS: Compare pattern[${i}]='${pattern[i]}' with pattern[${len}]='${pattern[len]}'`,
      text,
      pattern,
      lps: [...lps],
      lpsI: i,
      lpsLen: len,
      phase: "building-lps",
      code: `if (pattern[${i}] == pattern[${len}])`,
    });

    if (pattern[i] === pattern[len]) {
      len++;
      lps[i] = len;
      steps.push({
        type: "lps-match",
        message: `Match! lps[${i}] = ${len}`,
        text,
        pattern,
        lps: [...lps],
        lpsI: i,
        lpsLen: len,
        phase: "building-lps",
        code: `lps[${i}] = ++len = ${len}`,
      });
      i++;
    } else {
      if (len !== 0) {
        steps.push({
          type: "lps-fallback",
          message: `No match, fallback: len = lps[${len - 1}] = ${lps[len - 1]}`,
          text,
          pattern,
          lps: [...lps],
          lpsI: i,
          lpsLen: len,
          phase: "building-lps",
          code: `len = lps[${len - 1}] = ${lps[len - 1]}`,
        });
        len = lps[len - 1];
      } else {
        lps[i] = 0;
        steps.push({
          type: "lps-zero",
          message: `No match and len=0, so lps[${i}] = 0`,
          text,
          pattern,
          lps: [...lps],
          lpsI: i,
          lpsLen: len,
          phase: "building-lps",
          code: `lps[${i}] = 0`,
        });
        i++;
      }
    }
  }

  steps.push({
    type: "lps-complete",
    message: `LPS array complete: [${lps.join(", ")}]`,
    text,
    pattern,
    lps: [...lps],
    phase: "searching",
    code: `// LPS = [${lps.join(", ")}]`,
  });

  // Search phase
  i = 0;
  let j = 0;

  while (i < n) {
    comparisons++;

    if (text[i] === pattern[j]) {
      steps.push({
        type: "search-match",
        message: `Match! text[${i}]='${text[i]}' == pattern[${j}]='${pattern[j]}'`,
        text,
        pattern,
        lps: [...lps],
        textIdx: i,
        patternIdx: j,
        comparing: { textIdx: i, patternIdx: j },
        matched: true,
        phase: "searching",
        comparisons,
        matches: [...matches],
        code: `text[${i}] == pattern[${j}] ✓`,
      });
      i++;
      j++;
    }

    if (j === m) {
      matches.push(i - j);
      steps.push({
        type: "pattern-found",
        message: `Pattern found at index ${i - j}! Use LPS: j = lps[${j - 1}] = ${lps[j - 1]}`,
        text,
        pattern,
        lps: [...lps],
        textIdx: i - 1,
        patternIdx: j - 1,
        foundAt: i - j,
        phase: "searching",
        comparisons,
        matches: [...matches],
        code: `// Found! j = lps[${j - 1}] = ${lps[j - 1]}`,
      });
      j = lps[j - 1];
    } else if (i < n && text[i] !== pattern[j]) {
      steps.push({
        type: "search-mismatch",
        message: `Mismatch! text[${i}]='${text[i]}' != pattern[${j}]='${pattern[j]}'`,
        text,
        pattern,
        lps: [...lps],
        textIdx: i,
        patternIdx: j,
        comparing: { textIdx: i, patternIdx: j },
        matched: false,
        phase: "searching",
        comparisons,
        matches: [...matches],
        code: `text[${i}] != pattern[${j}] ✗`,
      });

      if (j !== 0) {
        steps.push({
          type: "use-lps",
          message: `Use LPS to skip: j = lps[${j - 1}] = ${lps[j - 1]} (skip ${j - lps[j - 1]} comparisons!)`,
          text,
          pattern,
          lps: [...lps],
          textIdx: i,
          patternIdx: j,
          skipTo: lps[j - 1],
          phase: "searching",
          comparisons,
          matches: [...matches],
          code: `j = lps[${j - 1}] = ${lps[j - 1]}`,
        });
        j = lps[j - 1];
      } else {
        i++;
      }
    }
  }

  steps.push({
    type: "complete",
    message:
      matches.length > 0
        ? `KMP found ${matches.length} occurrence(s) at: [${matches.join(", ")}] with ${comparisons} comparisons`
        : `Pattern not found`,
    text,
    pattern,
    lps: [...lps],
    comparisons,
    matches,
    code: `return [${matches.join(", ")}];`,
  });

  return { steps, matches, comparisons, lps };
}

// Palindrome Check
function checkPalindrome(str) {
  const steps = [];
  let left = 0;
  let right = str.length - 1;
  let isPalindrome = true;
  let comparisons = 0;

  steps.push({
    type: "init",
    message: `Check if "${str}" is a palindrome using two pointers`,
    str,
    left,
    right,
    comparisons: 0,
    code: `left = 0, right = ${str.length - 1}`,
  });

  while (left < right) {
    comparisons++;

    steps.push({
      type: "compare",
      message: `Compare str[${left}]='${str[left]}' with str[${right}]='${str[right]}'`,
      str,
      left,
      right,
      comparing: { left, right },
      comparisons,
      code: `str[${left}] == str[${right}] ?`,
    });

    if (str[left] !== str[right]) {
      isPalindrome = false;
      steps.push({
        type: "mismatch",
        message: `Mismatch! '${str[left]}' != '${str[right]}'. NOT a palindrome.`,
        str,
        left,
        right,
        matched: false,
        comparisons,
        code: `// Mismatch found - not palindrome`,
      });
      break;
    }

    steps.push({
      type: "match",
      message: `Match! '${str[left]}' == '${str[right]}'. Move pointers inward.`,
      str,
      left,
      right,
      matched: true,
      comparisons,
      code: `left++; right--; // Move inward`,
    });

    left++;
    right--;
  }

  if (isPalindrome) {
    steps.push({
      type: "complete",
      message: `"${str}" IS a palindrome! ✓`,
      str,
      left,
      right,
      isPalindrome: true,
      comparisons,
      code: `return true; // Palindrome!`,
    });
  } else {
    steps.push({
      type: "complete",
      message: `"${str}" is NOT a palindrome ✗`,
      str,
      left,
      right,
      isPalindrome: false,
      comparisons,
      code: `return false; // Not palindrome`,
    });
  }

  return { steps, isPalindrome, comparisons };
}

// Longest Palindromic Substring (Expand Around Center)
function longestPalindromicSubstring(str) {
  const steps = [];
  let maxLen = 1;
  let start = 0;
  const n = str.length;

  steps.push({
    type: "init",
    message: `Find longest palindromic substring in "${str}" using expand-around-center`,
    str,
    currentBest: { start: 0, len: 1, substr: str[0] },
    code: `// Try each center, expand outward`,
  });

  const expandAroundCenter = (left, right, centerType) => {
    steps.push({
      type: "try-center",
      message: `Try ${centerType} center at ${centerType === "odd" ? left : `${left}-${right}`}`,
      str,
      expandLeft: left,
      expandRight: right,
      centerType,
      currentBest: {
        start,
        len: maxLen,
        substr: str.substring(start, start + maxLen),
      },
      code: `// Expand from center`,
    });

    while (left >= 0 && right < n && str[left] === str[right]) {
      steps.push({
        type: "expand",
        message: `Expanding: str[${left}]='${str[left]}' == str[${right}]='${str[right]}'`,
        str,
        expandLeft: left,
        expandRight: right,
        expanding: true,
        currentPalindrome: str.substring(left, right + 1),
        currentBest: {
          start,
          len: maxLen,
          substr: str.substring(start, start + maxLen),
        },
        code: `// "${str.substring(left, right + 1)}" is palindrome`,
      });

      if (right - left + 1 > maxLen) {
        maxLen = right - left + 1;
        start = left;
        steps.push({
          type: "new-best",
          message: `New best! "${str.substring(left, right + 1)}" (length ${maxLen})`,
          str,
          expandLeft: left,
          expandRight: right,
          newBest: true,
          currentBest: {
            start,
            len: maxLen,
            substr: str.substring(start, start + maxLen),
          },
          code: `maxLen = ${maxLen}, start = ${left}`,
        });
      }

      left--;
      right++;
    }
  };

  for (let i = 0; i < n; i++) {
    // Odd length palindromes
    expandAroundCenter(i, i, "odd");
    // Even length palindromes
    if (i < n - 1) {
      expandAroundCenter(i, i + 1, "even");
    }
  }

  const result = str.substring(start, start + maxLen);
  steps.push({
    type: "complete",
    message: `Longest palindromic substring: "${result}" (length ${maxLen})`,
    str,
    result,
    resultStart: start,
    resultLen: maxLen,
    code: `return "${result}"; // Length ${maxLen}`,
  });

  return { steps, result, start, length: maxLen };
}

// Anagram Check
function checkAnagram(str1, str2) {
  const steps = [];
  const freq1 = {};
  const freq2 = {};

  steps.push({
    type: "init",
    message: `Check if "${str1}" and "${str2}" are anagrams`,
    str1,
    str2,
    freq1: {},
    freq2: {},
    code: `// Count character frequencies`,
  });

  // Check lengths
  if (str1.length !== str2.length) {
    steps.push({
      type: "length-mismatch",
      message: `Different lengths (${str1.length} vs ${str2.length}). Cannot be anagrams.`,
      str1,
      str2,
      isAnagram: false,
      code: `if (len1 != len2) return false;`,
    });
    return { steps, isAnagram: false };
  }

  // Count frequencies for str1
  for (let i = 0; i < str1.length; i++) {
    const char = str1[i].toLowerCase();
    freq1[char] = (freq1[char] || 0) + 1;
    steps.push({
      type: "count-str1",
      message: `str1: Count '${char}' → freq1['${char}'] = ${freq1[char]}`,
      str1,
      str2,
      currentIdx: i,
      currentChar: char,
      freq1: { ...freq1 },
      freq2: { ...freq2 },
      processing: "str1",
      code: `freq1['${char}'] = ${freq1[char]}`,
    });
  }

  // Count frequencies for str2
  for (let i = 0; i < str2.length; i++) {
    const char = str2[i].toLowerCase();
    freq2[char] = (freq2[char] || 0) + 1;
    steps.push({
      type: "count-str2",
      message: `str2: Count '${char}' → freq2['${char}'] = ${freq2[char]}`,
      str1,
      str2,
      currentIdx: i,
      currentChar: char,
      freq1: { ...freq1 },
      freq2: { ...freq2 },
      processing: "str2",
      code: `freq2['${char}'] = ${freq2[char]}`,
    });
  }

  // Compare frequencies
  let isAnagram = true;
  for (const char in freq1) {
    steps.push({
      type: "compare-freq",
      message: `Compare '${char}': freq1=${freq1[char]}, freq2=${freq2[char] || 0}`,
      str1,
      str2,
      comparingChar: char,
      freq1: { ...freq1 },
      freq2: { ...freq2 },
      code: `freq1['${char}'] == freq2['${char}'] ?`,
    });

    if (freq1[char] !== freq2[char]) {
      isAnagram = false;
      steps.push({
        type: "freq-mismatch",
        message: `Mismatch for '${char}'! Not anagrams.`,
        str1,
        str2,
        mismatchChar: char,
        freq1: { ...freq1 },
        freq2: { ...freq2 },
        isAnagram: false,
        code: `// Frequencies don't match`,
      });
      break;
    }
  }

  steps.push({
    type: "complete",
    message: isAnagram
      ? `"${str1}" and "${str2}" ARE anagrams! ✓`
      : `"${str1}" and "${str2}" are NOT anagrams ✗`,
    str1,
    str2,
    freq1,
    freq2,
    isAnagram,
    code: `return ${isAnagram};`,
  });

  return { steps, isAnagram, freq1, freq2 };
}

// Reverse String (Two Pointer)
function reverseString(str) {
  const steps = [];
  const arr = str.split("");
  let left = 0;
  let right = arr.length - 1;

  steps.push({
    type: "init",
    message: `Reverse "${str}" in-place using two pointers`,
    original: str,
    arr: [...arr],
    left,
    right,
    code: `left = 0, right = ${arr.length - 1}`,
  });

  while (left < right) {
    steps.push({
      type: "swap-prep",
      message: `Swap arr[${left}]='${arr[left]}' with arr[${right}]='${arr[right]}'`,
      original: str,
      arr: [...arr],
      left,
      right,
      swapping: { left, right },
      code: `swap(arr[${left}], arr[${right}])`,
    });

    // Swap
    [arr[left], arr[right]] = [arr[right], arr[left]];

    steps.push({
      type: "swap-done",
      message: `After swap: "${arr.join("")}"`,
      original: str,
      arr: [...arr],
      left,
      right,
      swapped: { left, right },
      code: `// Swapped, move pointers`,
    });

    left++;
    right--;
  }

  const result = arr.join("");
  steps.push({
    type: "complete",
    message: `Reversed! "${str}" → "${result}"`,
    original: str,
    arr: [...arr],
    result,
    code: `return "${result}";`,
  });

  return { steps, result };
}

// Z-Algorithm
function zAlgorithm(str) {
  const steps = [];
  const n = str.length;
  const z = new Array(n).fill(0);
  z[0] = n;
  let l = 0,
    r = 0;

  steps.push({
    type: "init",
    message: `Build Z-array for "${str}". Z[i] = length of longest substring starting at i that matches prefix`,
    str,
    z: [...z],
    l,
    r,
    code: `Z[0] = ${n} (entire string)`,
  });

  for (let i = 1; i < n; i++) {
    if (i > r) {
      l = r = i;
      steps.push({
        type: "outside-box",
        message: `i=${i} is outside Z-box [${l}, ${r}]. Start fresh comparison.`,
        str,
        z: [...z],
        currentI: i,
        l,
        r,
        code: `// Outside Z-box, compare naively`,
      });

      while (r < n && str[r - l] === str[r]) {
        steps.push({
          type: "extend",
          message: `Extending: str[${r - l}]='${str[r - l]}' == str[${r}]='${str[r]}'`,
          str,
          z: [...z],
          currentI: i,
          comparing: { prefix: r - l, current: r },
          l,
          r,
          code: `str[${r - l}] == str[${r}] ✓`,
        });
        r++;
      }
      z[i] = r - l;
      r--;

      steps.push({
        type: "set-z",
        message: `Z[${i}] = ${z[i]}`,
        str,
        z: [...z],
        currentI: i,
        l,
        r,
        code: `Z[${i}] = ${z[i]}`,
      });
    } else {
      const k = i - l;
      steps.push({
        type: "inside-box",
        message: `i=${i} is inside Z-box [${l}, ${r}]. k = i - l = ${k}. Z[k] = ${z[k]}`,
        str,
        z: [...z],
        currentI: i,
        k,
        l,
        r,
        code: `// Inside Z-box, use previous Z values`,
      });

      if (z[k] < r - i + 1) {
        z[i] = z[k];
        steps.push({
          type: "copy-z",
          message: `Z[${k}] = ${z[k]} < remaining box length ${r - i + 1}. Copy: Z[${i}] = ${z[k]}`,
          str,
          z: [...z],
          currentI: i,
          l,
          r,
          code: `Z[${i}] = Z[${k}] = ${z[k]}`,
        });
      } else {
        l = i;
        steps.push({
          type: "extend-box",
          message: `Z[${k}] >= remaining. Need to extend beyond box.`,
          str,
          z: [...z],
          currentI: i,
          l,
          r,
          code: `l = ${i}, extend r`,
        });

        while (r < n && str[r - l] === str[r]) {
          r++;
        }
        z[i] = r - l;
        r--;

        steps.push({
          type: "set-z",
          message: `Z[${i}] = ${z[i]}`,
          str,
          z: [...z],
          currentI: i,
          l,
          r,
          code: `Z[${i}] = ${z[i]}`,
        });
      }
    }
  }

  steps.push({
    type: "complete",
    message: `Z-array complete: [${z.join(", ")}]`,
    str,
    z: [...z],
    code: `return [${z.join(", ")}];`,
  });

  return { steps, z };
}

// ============================================
// MAIN VISUALIZER COMPONENT
// ============================================
export default function StringVisualizer() {
  const [algorithm, setAlgorithm] = useState("naive");
  const [inputText, setInputText] = useState("ABABDABACDABABCABAB");
  const [inputPattern, setInputPattern] = useState("ABABCABAB");
  const [inputStr2, setInputStr2] = useState("listen");
  const [animationSteps, setAnimationSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(600);
  const [displayData, setDisplayData] = useState({});
  const [explanation, setExplanation] = useState(
    "Welcome to String Algorithms Visualizer! Select an algorithm and execute.",
  );
  const [codeSnippet, setCodeSnippet] = useState("");
  const [result, setResult] = useState(null);
  const [showEducation, setShowEducation] = useState(true);

  const animationRef = useRef(null);

  // Algorithms
  const algorithms = [
    { value: "naive", label: "🔍 Naive Pattern Search", type: "pattern" },
    { value: "kmp", label: "⚡ KMP Algorithm", type: "pattern" },
    { value: "zAlgorithm", label: "📊 Z-Algorithm", type: "single" },
    { value: "palindrome", label: "🔄 Palindrome Check", type: "single" },
    {
      value: "longestPalindrome",
      label: "📏 Longest Palindromic Substring",
      type: "single",
    },
    { value: "anagram", label: "🔀 Anagram Check", type: "double" },
    { value: "reverse", label: "↔️ Reverse String", type: "single" },
  ];

  // Complexity info
  const complexityInfo = {
    naive: {
      time: "O(n × m)",
      space: "O(1)",
      description: "Check pattern at each position",
    },
    kmp: {
      time: "O(n + m)",
      space: "O(m)",
      description: "Use LPS array to skip comparisons",
    },
    zAlgorithm: {
      time: "O(n)",
      space: "O(n)",
      description: "Linear time Z-array construction",
    },
    palindrome: {
      time: "O(n)",
      space: "O(1)",
      description: "Two pointer from both ends",
    },
    longestPalindrome: {
      time: "O(n²)",
      space: "O(1)",
      description: "Expand around each center",
    },
    anagram: {
      time: "O(n)",
      space: "O(k)",
      description: "k = character set size (26 for lowercase)",
    },
    reverse: {
      time: "O(n)",
      space: "O(1)",
      description: "In-place two pointer swap",
    },
  };

  // Execute
  const executeAlgorithm = useCallback(() => {
    let searchResult;

    switch (algorithm) {
      case "naive":
        searchResult = naivePatternSearch(inputText, inputPattern);
        break;
      case "kmp":
        searchResult = kmpSearch(inputText, inputPattern);
        break;
      case "zAlgorithm":
        searchResult = zAlgorithm(inputText);
        break;
      case "palindrome":
        searchResult = checkPalindrome(inputText);
        break;
      case "longestPalindrome":
        searchResult = longestPalindromicSubstring(inputText);
        break;
      case "anagram":
        searchResult = checkAnagram(inputText, inputStr2);
        break;
      case "reverse":
        searchResult = reverseString(inputText);
        break;
      default:
        return;
    }

    setAnimationSteps(searchResult.steps);
    setCurrentStep(-1);
    setDisplayData({});
    setResult(null);
    setExplanation('🎬 Ready! Click "Step" or "Play" to begin.');
  }, [algorithm, inputText, inputPattern, inputStr2]);

  // Animation handler
  useEffect(() => {
    if (currentStep >= 0 && currentStep < animationSteps.length) {
      const step = animationSteps[currentStep];
      setDisplayData(step);
      setExplanation(step.message);
      setCodeSnippet(step.code || "");
      if (step.type === "complete") {
        setResult(step);
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
    setDisplayData({});
    setResult(null);
    setExplanation("🔄 Reset. Ready to run again.");
  };

  const generateRandom = () => {
    const chars = "ABCD";
    const textLen = 15 + Math.floor(Math.random() * 10);
    const patternLen = 3 + Math.floor(Math.random() * 4);

    let text = "";
    let pattern = "";

    for (let i = 0; i < textLen; i++) {
      text += chars[Math.floor(Math.random() * chars.length)];
    }
    for (let i = 0; i < patternLen; i++) {
      pattern += chars[Math.floor(Math.random() * chars.length)];
    }

    setInputText(text);
    setInputPattern(pattern);

    if (algorithm === "anagram") {
      const word = ["listen", "silent", "heart", "earth", "angel", "glean"][
        Math.floor(Math.random() * 6)
      ];
      setInputText(word);
      setInputStr2(
        word
          .split("")
          .sort(() => Math.random() - 0.5)
          .join(""),
      );
    }

    setExplanation("🎲 Random input generated!");
  };

  const currentAlgo = algorithms.find((a) => a.value === algorithm);

  // Render string with highlighting
  const renderString = (str, highlights = {}, label) => {
    const {
      textIdx,
      patternIdx,
      windowStart,
      windowEnd,
      comparing,
      foundAt,
      left,
      right,
      expandLeft,
      expandRight,
      swapping,
      swapped,
      currentIdx,
      processing,
    } = highlights;

    return (
      <div style={styles.stringContainer}>
        {label && <div style={styles.stringLabel}>{label}</div>}
        <div style={styles.stringChars}>
          {str.split("").map((char, idx) => {
            let bg = "#f1f5f9";
            let borderColor = "#e2e8f0";
            let color = "#334155";
            let scale = 1;
            let pointers = [];

            // Pattern matching highlights
            if (
              foundAt !== undefined &&
              idx >= foundAt &&
              idx < foundAt + (highlights.pattern?.length || 0)
            ) {
              bg = "linear-gradient(135deg, #10b981, #059669)";
              color = "white";
              borderColor = "#059669";
            } else if (
              comparing?.textIdx === idx ||
              comparing?.patternIdx === idx
            ) {
              bg =
                comparing.textIdx === idx
                  ? "linear-gradient(135deg, #f59e0b, #d97706)"
                  : "linear-gradient(135deg, #3b82f6, #1d4ed8)";
              color = "white";
              scale = 1.1;
            } else if (
              windowStart !== undefined &&
              windowEnd !== undefined &&
              idx >= windowStart &&
              idx <= windowEnd
            ) {
              bg = "linear-gradient(135deg, #dbeafe, #bfdbfe)";
              borderColor = "#3b82f6";
            }

            // Palindrome highlights
            if (left !== undefined && right !== undefined) {
              if (idx === left || idx === right) {
                bg = "linear-gradient(135deg, #f59e0b, #d97706)";
                color = "white";
                scale = 1.1;
              }
              if (idx === left) pointers.push({ label: "L", color: "#3b82f6" });
              if (idx === right)
                pointers.push({ label: "R", color: "#ef4444" });
            }

            // Expand around center highlights
            if (expandLeft !== undefined && expandRight !== undefined) {
              if (idx >= expandLeft && idx <= expandRight) {
                bg = "linear-gradient(135deg, #8b5cf6, #7c3aed)";
                color = "white";
              }
            }

            // Reverse/swap highlights
            if (swapping && (idx === swapping.left || idx === swapping.right)) {
              bg = "linear-gradient(135deg, #ec4899, #db2777)";
              color = "white";
              scale = 1.1;
            }
            if (swapped && (idx === swapped.left || idx === swapped.right)) {
              bg = "linear-gradient(135deg, #10b981, #059669)";
              color = "white";
            }

            // Anagram highlights
            if (currentIdx === idx && processing) {
              bg =
                processing === "str1"
                  ? "linear-gradient(135deg, #3b82f6, #1d4ed8)"
                  : "linear-gradient(135deg, #8b5cf6, #7c3aed)";
              color = "white";
              scale = 1.1;
            }

            return (
              <div key={idx} style={styles.charContainer}>
                <div style={styles.pointerRow}>
                  {pointers.map((p, i) => (
                    <span
                      key={i}
                      style={{ ...styles.pointer, background: p.color }}
                    >
                      {p.label}
                    </span>
                  ))}
                </div>
                <div
                  style={{
                    ...styles.charCell,
                    background: bg,
                    borderColor,
                    color,
                    transform: `scale(${scale})`,
                  }}
                >
                  {char}
                </div>
                <div style={styles.indexLabel}>{idx}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render pattern with alignment
  const renderPattern = (pattern, textIdx, patternIdx, windowStart) => {
    const offset = windowStart || 0;

    return (
      <div style={styles.patternContainer}>
        <div style={styles.stringLabel}>Pattern:</div>
        <div style={{ ...styles.stringChars, marginLeft: `${offset * 52}px` }}>
          {pattern.split("").map((char, idx) => {
            let bg = "#fef3c7";
            let color = "#92400e";

            if (displayData.comparing?.patternIdx === idx) {
              bg = "linear-gradient(135deg, #3b82f6, #1d4ed8)";
              color = "white";
            }

            return (
              <div key={idx} style={styles.charContainer}>
                <div
                  style={{
                    ...styles.charCell,
                    background: bg,
                    color,
                    borderColor: "#fcd34d",
                  }}
                >
                  {char}
                </div>
                <div style={styles.indexLabel}>{idx}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render LPS or Z array
  const renderArray = (arr, label, currentIdx) => {
    return (
      <div style={styles.arrayContainer}>
        <div style={styles.arrayLabel}>{label}:</div>
        <div style={styles.arrayValues}>
          {arr.map((val, idx) => (
            <div
              key={idx}
              style={{
                ...styles.arrayCell,
                background:
                  idx === currentIdx
                    ? "linear-gradient(135deg, #f59e0b, #d97706)"
                    : "#e0f2fe",
                color: idx === currentIdx ? "white" : "#0369a1",
              }}
            >
              {val}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render frequency table
  const renderFreqTable = (freq1, freq2) => {
    const allChars = new Set([
      ...Object.keys(freq1 || {}),
      ...Object.keys(freq2 || {}),
    ]);

    return (
      <div style={styles.freqContainer}>
        <table style={styles.freqTable}>
          <thead>
            <tr>
              <th style={styles.freqHeader}>Char</th>
              <th style={{ ...styles.freqHeader, background: "#dbeafe" }}>
                Str1
              </th>
              <th style={{ ...styles.freqHeader, background: "#e9d5ff" }}>
                Str2
              </th>
              <th style={styles.freqHeader}>Match</th>
            </tr>
          </thead>
          <tbody>
            {[...allChars].sort().map((char) => {
              const f1 = freq1?.[char] || 0;
              const f2 = freq2?.[char] || 0;
              const match = f1 === f2;
              return (
                <tr key={char}>
                  <td style={styles.freqCell}>'{char}'</td>
                  <td style={{ ...styles.freqCell, background: "#eff6ff" }}>
                    {f1}
                  </td>
                  <td style={{ ...styles.freqCell, background: "#faf5ff" }}>
                    {f2}
                  </td>
                  <td
                    style={{
                      ...styles.freqCell,
                      background: match ? "#dcfce7" : "#fee2e2",
                    }}
                  >
                    {match ? "✓" : "✗"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.title}>🔤 String Algorithms Visualizer</h1>
        <p style={styles.subtitle}>
          Master pattern matching, palindromes, and string manipulation
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

            {/* Input Text */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                {currentAlgo?.type === "double" ? "String 1" : "Text/String"}
              </label>
              <input
                style={styles.input}
                value={inputText}
                onChange={(e) => setInputText(e.target.value.toUpperCase())}
                placeholder="Enter text..."
              />
            </div>

            {/* Pattern Input */}
            {currentAlgo?.type === "pattern" && (
              <div style={styles.inputGroup}>
                <label style={styles.label}>Pattern</label>
                <input
                  style={styles.input}
                  value={inputPattern}
                  onChange={(e) =>
                    setInputPattern(e.target.value.toUpperCase())
                  }
                  placeholder="Enter pattern..."
                />
              </div>
            )}

            {/* Second String for Anagram */}
            {currentAlgo?.type === "double" && (
              <div style={styles.inputGroup}>
                <label style={styles.label}>String 2</label>
                <input
                  style={styles.input}
                  value={inputStr2}
                  onChange={(e) => setInputStr2(e.target.value.toLowerCase())}
                  placeholder="Enter second string..."
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
              onClick={executeAlgorithm}
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
            <h3 style={styles.cardTitle}>🎨 Legend</h3>
            <div style={styles.legend}>
              <div style={styles.legendItem}>
                <div
                  style={{
                    ...styles.legendDot,
                    background: "linear-gradient(135deg, #f59e0b, #d97706)",
                  }}
                />
                <span>Comparing</span>
              </div>
              <div style={styles.legendItem}>
                <div
                  style={{
                    ...styles.legendDot,
                    background: "linear-gradient(135deg, #10b981, #059669)",
                  }}
                />
                <span>Match/Found</span>
              </div>
              <div style={styles.legendItem}>
                <div
                  style={{
                    ...styles.legendDot,
                    background: "linear-gradient(135deg, #dbeafe, #bfdbfe)",
                  }}
                />
                <span>Current Window</span>
              </div>
              <div style={styles.legendItem}>
                <div
                  style={{
                    ...styles.legendDot,
                    background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
                  }}
                />
                <span>Palindrome</span>
              </div>
              <div style={styles.legendItem}>
                <div
                  style={{
                    ...styles.legendDot,
                    background: "#fef3c7",
                    border: "2px solid #fcd34d",
                  }}
                />
                <span>Pattern</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Panel */}
        <div style={styles.centerPanel}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>📊 String Visualization</h2>

            {/* String Display */}
            <div style={styles.visualizationArea}>
              {displayData.text &&
                renderString(displayData.text, displayData, "Text:")}
              {displayData.str &&
                renderString(displayData.str, displayData, "String:")}
              {displayData.str1 &&
                renderString(
                  displayData.str1,
                  {
                    ...displayData,
                    processing:
                      displayData.processing === "str1" ? "str1" : null,
                  },
                  "String 1:",
                )}
              {displayData.str2 &&
                renderString(
                  displayData.str2,
                  {
                    ...displayData,
                    processing:
                      displayData.processing === "str2" ? "str2" : null,
                  },
                  "String 2:",
                )}
              {displayData.arr &&
                renderString(displayData.arr.join(""), displayData, "Array:")}
              {displayData.original && displayData.arr && (
                <div style={styles.originalLabel}>
                  Original: "{displayData.original}"
                </div>
              )}

              {/* Pattern alignment */}
              {displayData.pattern &&
                displayData.windowStart !== undefined &&
                renderPattern(
                  displayData.pattern,
                  displayData.textIdx,
                  displayData.patternIdx,
                  displayData.windowStart,
                )}

              {/* LPS Array for KMP */}
              {displayData.lps &&
                renderArray(displayData.lps, "LPS Array", displayData.lpsI)}

              {/* Z Array */}
              {displayData.z &&
                renderArray(displayData.z, "Z Array", displayData.currentI)}

              {/* Frequency tables for anagram */}
              {displayData.freq1 &&
                Object.keys(displayData.freq1).length > 0 &&
                renderFreqTable(displayData.freq1, displayData.freq2)}

              {/* Current best palindrome */}
              {displayData.currentBest && (
                <div style={styles.currentBest}>
                  <strong>Current Best:</strong> "
                  {displayData.currentBest.substr}" (length:{" "}
                  {displayData.currentBest.len})
                </div>
              )}

              {!displayData.text &&
                !displayData.str &&
                !displayData.str1 &&
                !displayData.arr && (
                  <div style={styles.emptyState}>
                    Execute to visualize the algorithm
                  </div>
                )}
            </div>

            {/* Results */}
            {result && (
              <div
                style={{
                  ...styles.resultBox,
                  background:
                    result.matches?.length > 0 ||
                    result.isPalindrome ||
                    result.isAnagram ||
                    result.result
                      ? "linear-gradient(135deg, #dcfce7, #bbf7d0)"
                      : "linear-gradient(135deg, #fee2e2, #fecaca)",
                }}
              >
                {result.matches !== undefined && (
                  <span>
                    Found {result.matches.length} match(es)
                    {result.matches.length > 0
                      ? ` at indices: [${result.matches.join(", ")}]`
                      : ""}
                  </span>
                )}
                {result.isPalindrome !== undefined && (
                  <span>
                    {result.isPalindrome
                      ? "✓ Is a palindrome!"
                      : "✗ Not a palindrome"}
                  </span>
                )}
                {result.isAnagram !== undefined && (
                  <span>
                    {result.isAnagram ? "✓ Are anagrams!" : "✗ Not anagrams"}
                  </span>
                )}
                {result.result && !result.matches && (
                  <span>Result: "{result.result}"</span>
                )}
                {result.z && <span>Z-array: [{result.z.join(", ")}]</span>}
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
                  <h3 style={styles.sectionTitle}>
                    🔧 {currentAlgo?.label.replace(/[^\w\s]/g, "")}
                  </h3>
                  <p style={styles.sectionContent}>
                    {algorithm === "naive" &&
                      "Check pattern at every position in text. Simple but inefficient for large inputs."}
                    {algorithm === "kmp" &&
                      "Build LPS (Longest Proper Prefix which is also Suffix) array to skip redundant comparisons."}
                    {algorithm === "zAlgorithm" &&
                      "Z[i] = length of longest substring starting at i that matches prefix of string."}
                    {algorithm === "palindrome" &&
                      "Use two pointers from both ends, moving inward while characters match."}
                    {algorithm === "longestPalindrome" &&
                      "Try each position as center, expand outward while palindrome property holds."}
                    {algorithm === "anagram" &&
                      "Two strings are anagrams if they have the same character frequencies."}
                    {algorithm === "reverse" &&
                      "Swap characters from both ends, moving inward until pointers meet."}
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
                        <td style={styles.tableLabel}>Note</td>
                        <td style={styles.tableValue}>
                          {complexityInfo[algorithm]?.description}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {algorithm === "kmp" && (
                  <div style={styles.educationSection}>
                    <h3 style={styles.sectionTitle}>📐 LPS Array</h3>
                    <p style={styles.sectionContent}>
                      LPS[i] = length of longest proper prefix of pattern[0..i]
                      which is also a suffix.
                      <br />
                      <br />
                      <strong>Example:</strong> "AABAACAABAA"
                      <br />
                      LPS = [0,1,0,1,2,0,1,2,3,4,5]
                    </p>
                  </div>
                )}

                {algorithm === "zAlgorithm" && (
                  <div style={styles.educationSection}>
                    <h3 style={styles.sectionTitle}>📐 Z-Box Optimization</h3>
                    <p style={styles.sectionContent}>
                      Maintain Z-box [L, R] where R is rightmost position
                      reached. If current i is inside box, use previously
                      computed values!
                    </p>
                  </div>
                )}

                <div style={styles.educationSection}>
                  <h3 style={styles.sectionTitle}>💡 Key Insights</h3>
                  <ul style={styles.tipsList}>
                    {algorithm === "naive" && (
                      <>
                        <li>Worst case: pattern like "AAAA" in "AAAAA...B"</li>
                        <li>Good for small inputs or one-time searches</li>
                      </>
                    )}
                    {algorithm === "kmp" && (
                      <>
                        <li>Never backtracks in text (i never decreases)</li>
                        <li>LPS captures pattern's self-similarity</li>
                        <li>Used in many text editors</li>
                      </>
                    )}
                    {algorithm === "zAlgorithm" && (
                      <>
                        <li>
                          Can be used for pattern matching: concat pattern + $ +
                          text
                        </li>
                        <li>Z[i] == len(pattern) means match at i - len - 1</li>
                      </>
                    )}
                    {algorithm === "palindrome" && (
                      <>
                        <li>Handle odd/even length separately if needed</li>
                        <li>Skip non-alphanumeric for "valid palindrome"</li>
                      </>
                    )}
                    {algorithm === "longestPalindrome" && (
                      <>
                        <li>Manacher's algorithm does this in O(n)</li>
                        <li>n^2 is often acceptable in interviews</li>
                      </>
                    )}
                    {algorithm === "anagram" && (
                      <>
                        <li>Sorting both strings also works: O(n log n)</li>
                        <li>For sliding window anagram: use freq array</li>
                      </>
                    )}
                    {algorithm === "reverse" && (
                      <>
                        <li>Base for many string manipulations</li>
                        <li>Used in "reverse words in string"</li>
                      </>
                    )}
                  </ul>
                </div>

                <div style={styles.educationSection}>
                  <h3 style={styles.sectionTitle}>⚠️ Edge Cases</h3>
                  <ul style={styles.edgeCaseList}>
                    <li>Empty string</li>
                    <li>Single character</li>
                    <li>Pattern longer than text</li>
                    <li>All same characters</li>
                    <li>Case sensitivity</li>
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
      "linear-gradient(135deg, #fdf4ff 0%, #fae8ff 50%, #f5d0fe 100%)",
    minHeight: "100vh",
    padding: "16px",
    boxSizing: "border-box",
  },
  header: { textAlign: "center", marginBottom: "20px" },
  title: {
    fontSize: "2.25rem",
    fontWeight: "800",
    background:
      "linear-gradient(135deg, #a855f7 0%, #d946ef 50%, #ec4899 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    margin: "0 0 6px 0",
  },
  subtitle: {
    fontSize: "1rem",
    color: "#86198f",
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
    border: "1px solid #f5d0fe",
  },
  cardTitle: {
    fontSize: "1rem",
    fontWeight: "700",
    color: "#86198f",
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
    color: "#86198f",
    marginBottom: "6px",
    textTransform: "uppercase",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    fontSize: "0.95rem",
    border: "2px solid #f5d0fe",
    borderRadius: "10px",
    outline: "none",
    boxSizing: "border-box",
  },
  select: {
    width: "100%",
    padding: "10px 12px",
    fontSize: "0.95rem",
    border: "2px solid #f5d0fe",
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
    background: "linear-gradient(135deg, #d946ef, #a855f7)",
    color: "white",
  },
  secondaryButton: { background: "#fae8ff", color: "#86198f" },
  successButton: {
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "white",
  },
  warningButton: {
    background: "linear-gradient(135deg, #f59e0b, #d97706)",
    color: "white",
  },
  accentButton: {
    background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
    color: "white",
  },
  slider: {
    width: "100%",
    height: "6px",
    borderRadius: "3px",
    background: "#f5d0fe",
    cursor: "pointer",
    marginTop: "8px",
  },
  progressContainer: { marginTop: "14px" },
  progressLabel: { fontSize: "0.75rem", color: "#86198f", marginBottom: "6px" },
  progressBar: {
    height: "6px",
    background: "#fae8ff",
    borderRadius: "3px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(135deg, #d946ef, #a855f7)",
    borderRadius: "3px",
    transition: "width 0.3s",
  },
  legend: { display: "flex", flexDirection: "column", gap: "8px" },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "0.8rem",
    color: "#86198f",
  },
  legendDot: {
    width: "20px",
    height: "20px",
    borderRadius: "4px",
    flexShrink: 0,
  },
  visualizationArea: {
    minHeight: "200px",
    padding: "16px",
    background: "#fdf4ff",
    borderRadius: "12px",
    marginBottom: "16px",
  },
  emptyState: { color: "#9ca3af", textAlign: "center", padding: "40px" },
  stringContainer: { marginBottom: "16px" },
  stringLabel: {
    fontSize: "0.85rem",
    fontWeight: "600",
    color: "#86198f",
    marginBottom: "8px",
  },
  stringChars: {
    display: "flex",
    flexWrap: "wrap",
    gap: "4px",
    transition: "margin 0.3s",
  },
  charContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "2px",
  },
  pointerRow: { height: "20px", display: "flex", gap: "2px" },
  pointer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "18px",
    height: "18px",
    borderRadius: "4px",
    color: "white",
    fontWeight: "700",
    fontSize: "0.65rem",
  },
  charCell: {
    width: "36px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "8px",
    fontWeight: "700",
    fontSize: "1rem",
    fontFamily: "monospace",
    border: "2px solid #e2e8f0",
    transition: "all 0.3s ease",
  },
  indexLabel: { fontSize: "0.65rem", color: "#9ca3af" },
  patternContainer: { marginTop: "8px", marginBottom: "16px" },
  arrayContainer: {
    marginTop: "16px",
    padding: "12px",
    background: "#f8fafc",
    borderRadius: "10px",
  },
  arrayLabel: {
    fontSize: "0.8rem",
    fontWeight: "600",
    color: "#64748b",
    marginBottom: "8px",
  },
  arrayValues: { display: "flex", gap: "4px", flexWrap: "wrap" },
  arrayCell: {
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "6px",
    fontWeight: "600",
    fontSize: "0.85rem",
  },
  freqContainer: { marginTop: "16px", overflowX: "auto" },
  freqTable: { borderCollapse: "collapse", fontSize: "0.8rem", width: "100%" },
  freqHeader: {
    padding: "8px",
    background: "#f1f5f9",
    fontWeight: "600",
    color: "#475569",
    border: "1px solid #e2e8f0",
  },
  freqCell: {
    padding: "8px",
    border: "1px solid #e2e8f0",
    textAlign: "center",
  },
  currentBest: {
    marginTop: "12px",
    padding: "10px",
    background: "#fef3c7",
    borderRadius: "8px",
    fontSize: "0.85rem",
    color: "#92400e",
  },
  originalLabel: {
    marginTop: "8px",
    fontSize: "0.85rem",
    color: "#64748b",
    fontStyle: "italic",
  },
  resultBox: {
    padding: "14px",
    borderRadius: "10px",
    marginBottom: "16px",
    textAlign: "center",
    fontSize: "1rem",
    fontWeight: "600",
  },
  explanationBox: {
    padding: "14px",
    background: "linear-gradient(135deg, #fdf4ff, #fae8ff)",
    borderRadius: "12px",
    border: "1px solid #f5d0fe",
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
    color: "#86198f",
    background: "white",
    padding: "3px 8px",
    borderRadius: "6px",
  },
  algoBadge: {
    fontSize: "0.75rem",
    fontWeight: "600",
    color: "#a855f7",
    background: "white",
    padding: "3px 8px",
    borderRadius: "6px",
  },
  explanationText: {
    fontSize: "0.9rem",
    color: "#701a75",
    margin: 0,
    lineHeight: "1.5",
  },
  codeBox: {
    marginTop: "10px",
    padding: "10px",
    background: "#1f2937",
    borderRadius: "8px",
  },
  codeText: { fontSize: "0.8rem", color: "#f0abfc", fontFamily: "monospace" },
  educationHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  toggleBtn: {
    background: "#fae8ff",
    border: "none",
    borderRadius: "6px",
    padding: "4px 10px",
    cursor: "pointer",
    color: "#86198f",
  },
  educationSection: { marginBottom: "16px" },
  sectionTitle: {
    fontSize: "0.85rem",
    fontWeight: "700",
    color: "#701a75",
    marginBottom: "8px",
  },
  sectionContent: {
    fontSize: "0.8rem",
    color: "#86198f",
    lineHeight: "1.6",
    margin: 0,
  },
  complexityTable: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "0.75rem",
  },
  tableLabel: {
    padding: "8px",
    background: "#fdf4ff",
    color: "#86198f",
    fontWeight: "600",
    borderBottom: "1px solid #f5d0fe",
    width: "30%",
  },
  tableValue: {
    padding: "8px",
    color: "#701a75",
    borderBottom: "1px solid #fae8ff",
  },
  tipsList: {
    fontSize: "0.8rem",
    color: "#86198f",
    paddingLeft: "18px",
    margin: 0,
    lineHeight: "1.8",
  },
  edgeCaseList: {
    fontSize: "0.8rem",
    color: "#86198f",
    paddingLeft: "18px",
    margin: 0,
    lineHeight: "1.8",
  },
};
