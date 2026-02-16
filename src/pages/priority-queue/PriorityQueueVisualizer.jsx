import React, { useState, useEffect, useCallback, useRef } from "react";

/**
 * Priority Queue (Binary Heap) Complete Visualizer
 * ================================================
 * A comprehensive educational tool for understanding Priority Queues
 *
 * Implementation: Binary Heap (can toggle between Min-Heap and Max-Heap)
 *
 * Heap Property:
 * - Min-Heap: Parent <= Children (smallest at root)
 * - Max-Heap: Parent >= Children (largest at root)
 *
 * Key Index Relationships (0-indexed):
 * - Parent of i: Math.floor((i - 1) / 2)
 * - Left child of i: 2 * i + 1
 * - Right child of i: 2 * i + 2
 *
 * Features:
 * - Insert with bubble-up (heapify-up)
 * - Extract with bubble-down (heapify-down)
 * - Peek (view top element)
 * - Build heap from array
 * - Heap sort demonstration
 */

// ============================================
// PRIORITY QUEUE CLASS (Binary Heap)
// ============================================
class PriorityQueue {
  constructor(isMinHeap = true) {
    this.heap = [];
    this.isMinHeap = isMinHeap;
  }

  // Clone the priority queue
  clone() {
    const newPQ = new PriorityQueue(this.isMinHeap);
    newPQ.heap = [...this.heap];
    return newPQ;
  }

  // Comparison function based on heap type
  compare(a, b) {
    return this.isMinHeap ? a < b : a > b;
  }

  // Get parent index
  getParentIndex(i) {
    return Math.floor((i - 1) / 2);
  }

  // Get left child index
  getLeftChildIndex(i) {
    return 2 * i + 1;
  }

  // Get right child index
  getRightChildIndex(i) {
    return 2 * i + 2;
  }

  // Check if index has parent
  hasParent(i) {
    return this.getParentIndex(i) >= 0;
  }

  // Check if index has left child
  hasLeftChild(i) {
    return this.getLeftChildIndex(i) < this.heap.length;
  }

  // Check if index has right child
  hasRightChild(i) {
    return this.getRightChildIndex(i) < this.heap.length;
  }

  // ==========================================
  // INSERT OPERATION (with bubble-up)
  // ==========================================
  insert(value) {
    const steps = [];

    // Step 1: Add to end of array
    this.heap.push(value);
    const insertIndex = this.heap.length - 1;

    steps.push({
      type: "insert",
      heap: [...this.heap],
      message: `Step 1: Insert ${value} at the end of the array (index ${insertIndex})`,
      highlighted: [insertIndex],
      comparing: [],
      swapping: [],
      code: `heap.push(${value}); // Add to end`,
    });

    // Step 2: Bubble up to maintain heap property
    let currentIndex = insertIndex;

    while (this.hasParent(currentIndex)) {
      const parentIndex = this.getParentIndex(currentIndex);
      const parent = this.heap[parentIndex];
      const current = this.heap[currentIndex];

      steps.push({
        type: "compare",
        heap: [...this.heap],
        message: `Compare ${current} (index ${currentIndex}) with parent ${parent} (index ${parentIndex})`,
        highlighted: [],
        comparing: [currentIndex, parentIndex],
        swapping: [],
        code: `if (heap[${currentIndex}] ${this.isMinHeap ? "<" : ">"} heap[${parentIndex}]) swap();`,
      });

      if (this.compare(current, parent)) {
        // Swap
        [this.heap[currentIndex], this.heap[parentIndex]] = [
          this.heap[parentIndex],
          this.heap[currentIndex],
        ];

        steps.push({
          type: "swap",
          heap: [...this.heap],
          message: `${current} ${this.isMinHeap ? "<" : ">"} ${parent} → Swap! ${current} bubbles up to index ${parentIndex}`,
          highlighted: [],
          comparing: [],
          swapping: [currentIndex, parentIndex],
          code: `swap(heap[${currentIndex}], heap[${parentIndex}]);`,
        });

        currentIndex = parentIndex;
      } else {
        steps.push({
          type: "no-swap",
          heap: [...this.heap],
          message: `${current} ${this.isMinHeap ? ">=" : "<="} ${parent} → Heap property satisfied! Stop.`,
          highlighted: [currentIndex],
          comparing: [],
          swapping: [],
          code: `// Heap property satisfied`,
        });
        break;
      }
    }

    if (currentIndex === 0 && steps[steps.length - 1]?.type === "swap") {
      steps.push({
        type: "complete",
        heap: [...this.heap],
        message: `Reached root! ${this.heap[0]} is now the ${this.isMinHeap ? "minimum" : "maximum"}.`,
        highlighted: [0],
        comparing: [],
        swapping: [],
        code: `// Bubble-up complete`,
      });
    }

    return steps;
  }

  // ==========================================
  // EXTRACT OPERATION (with bubble-down)
  // ==========================================
  extract() {
    const steps = [];

    if (this.heap.length === 0) {
      steps.push({
        type: "empty",
        heap: [],
        message: "Priority Queue is empty! Nothing to extract.",
        highlighted: [],
        comparing: [],
        swapping: [],
        code: "if (heap.length === 0) throw Error;",
      });
      return { value: null, steps };
    }

    const extractedValue = this.heap[0];

    steps.push({
      type: "extract-start",
      heap: [...this.heap],
      message: `Extract ${this.isMinHeap ? "minimum" : "maximum"}: ${extractedValue} (root element)`,
      highlighted: [0],
      comparing: [],
      swapping: [],
      extractedValue,
      code: `const ${this.isMinHeap ? "min" : "max"} = heap[0]; // ${extractedValue}`,
    });

    if (this.heap.length === 1) {
      this.heap.pop();
      steps.push({
        type: "complete",
        heap: [...this.heap],
        message: `Removed the only element. Queue is now empty.`,
        highlighted: [],
        comparing: [],
        swapping: [],
        extractedValue,
        code: "heap.pop(); // Only element",
      });
      return { value: extractedValue, steps };
    }

    // Move last element to root
    const lastValue = this.heap.pop();
    this.heap[0] = lastValue;

    steps.push({
      type: "move-last",
      heap: [...this.heap],
      message: `Move last element ${lastValue} to root position`,
      highlighted: [0],
      comparing: [],
      swapping: [],
      extractedValue,
      code: `heap[0] = heap.pop(); // Move ${lastValue} to root`,
    });

    // Bubble down
    let currentIndex = 0;

    while (this.hasLeftChild(currentIndex)) {
      const leftIndex = this.getLeftChildIndex(currentIndex);
      const rightIndex = this.getRightChildIndex(currentIndex);

      // Find the child to potentially swap with
      let targetChildIndex = leftIndex;

      if (this.hasRightChild(currentIndex)) {
        const leftChild = this.heap[leftIndex];
        const rightChild = this.heap[rightIndex];

        steps.push({
          type: "find-child",
          heap: [...this.heap],
          message: `Find ${this.isMinHeap ? "smaller" : "larger"} child: Left=${leftChild}, Right=${rightChild}`,
          highlighted: [],
          comparing: [leftIndex, rightIndex],
          swapping: [],
          extractedValue,
          code: `// Compare children to find ${this.isMinHeap ? "smaller" : "larger"}`,
        });

        if (this.compare(rightChild, leftChild)) {
          targetChildIndex = rightIndex;
        }
      }

      const current = this.heap[currentIndex];
      const targetChild = this.heap[targetChildIndex];

      steps.push({
        type: "compare",
        heap: [...this.heap],
        message: `Compare ${current} (index ${currentIndex}) with ${this.isMinHeap ? "smaller" : "larger"} child ${targetChild} (index ${targetChildIndex})`,
        highlighted: [],
        comparing: [currentIndex, targetChildIndex],
        swapping: [],
        extractedValue,
        code: `if (heap[${currentIndex}] ${this.isMinHeap ? ">" : "<"} heap[${targetChildIndex}]) swap();`,
      });

      if (this.compare(targetChild, current)) {
        // Swap
        [this.heap[currentIndex], this.heap[targetChildIndex]] = [
          this.heap[targetChildIndex],
          this.heap[currentIndex],
        ];

        steps.push({
          type: "swap",
          heap: [...this.heap],
          message: `${current} ${this.isMinHeap ? ">" : "<"} ${targetChild} → Swap! ${current} bubbles down to index ${targetChildIndex}`,
          highlighted: [],
          comparing: [],
          swapping: [currentIndex, targetChildIndex],
          extractedValue,
          code: `swap(heap[${currentIndex}], heap[${targetChildIndex}]);`,
        });

        currentIndex = targetChildIndex;
      } else {
        steps.push({
          type: "no-swap",
          heap: [...this.heap],
          message: `${current} ${this.isMinHeap ? "<=" : ">="} ${targetChild} → Heap property satisfied! Stop.`,
          highlighted: [currentIndex],
          comparing: [],
          swapping: [],
          extractedValue,
          code: `// Heap property satisfied`,
        });
        break;
      }
    }

    if (
      !this.hasLeftChild(currentIndex) &&
      steps[steps.length - 1]?.type === "swap"
    ) {
      steps.push({
        type: "complete",
        heap: [...this.heap],
        message: `Reached leaf level! Bubble-down complete.`,
        highlighted: [currentIndex],
        comparing: [],
        swapping: [],
        extractedValue,
        code: `// Bubble-down complete`,
      });
    }

    return { value: extractedValue, steps };
  }

  // ==========================================
  // PEEK OPERATION
  // ==========================================
  peek() {
    const steps = [];

    if (this.heap.length === 0) {
      steps.push({
        type: "empty",
        heap: [],
        message: "Priority Queue is empty! Nothing to peek.",
        highlighted: [],
        comparing: [],
        swapping: [],
        code: "if (heap.length === 0) return null;",
      });
      return { value: null, steps };
    }

    steps.push({
      type: "peek",
      heap: [...this.heap],
      message: `Peek: The ${this.isMinHeap ? "minimum" : "maximum"} element is ${this.heap[0]} at root (index 0)`,
      highlighted: [0],
      comparing: [],
      swapping: [],
      code: `return heap[0]; // ${this.heap[0]}`,
    });

    return { value: this.heap[0], steps };
  }

  // ==========================================
  // BUILD HEAP FROM ARRAY (Heapify)
  // ==========================================
  buildHeap(array) {
    const steps = [];
    this.heap = [...array];

    steps.push({
      type: "init",
      heap: [...this.heap],
      message: `Initialize array: [${this.heap.join(", ")}]. Now heapify from last non-leaf node.`,
      highlighted: [],
      comparing: [],
      swapping: [],
      code: `heap = [${array.join(", ")}];`,
    });

    // Start from last non-leaf node and heapify down
    const lastNonLeaf = Math.floor(this.heap.length / 2) - 1;

    steps.push({
      type: "start-heapify",
      heap: [...this.heap],
      message: `Last non-leaf node is at index ${lastNonLeaf}. Heapify from here backwards.`,
      highlighted: [lastNonLeaf],
      comparing: [],
      swapping: [],
      code: `for (i = ${lastNonLeaf}; i >= 0; i--) heapifyDown(i);`,
    });

    for (let i = lastNonLeaf; i >= 0; i--) {
      this.heapifyDown(i, steps);
    }

    steps.push({
      type: "complete",
      heap: [...this.heap],
      message: `Build heap complete! Valid ${this.isMinHeap ? "Min" : "Max"}-Heap: [${this.heap.join(", ")}]`,
      highlighted: [0],
      comparing: [],
      swapping: [],
      code: `// Build heap complete - O(n) time!`,
    });

    return steps;
  }

  heapifyDown(index, steps) {
    let currentIndex = index;

    while (this.hasLeftChild(currentIndex)) {
      const leftIndex = this.getLeftChildIndex(currentIndex);
      const rightIndex = this.getRightChildIndex(currentIndex);

      let targetChildIndex = leftIndex;

      if (
        this.hasRightChild(currentIndex) &&
        this.compare(this.heap[rightIndex], this.heap[leftIndex])
      ) {
        targetChildIndex = rightIndex;
      }

      if (this.compare(this.heap[targetChildIndex], this.heap[currentIndex])) {
        steps.push({
          type: "heapify-swap",
          heap: [...this.heap],
          message: `Heapifying index ${currentIndex}: Swap ${this.heap[currentIndex]} with ${this.heap[targetChildIndex]}`,
          highlighted: [],
          comparing: [],
          swapping: [currentIndex, targetChildIndex],
          code: `swap(heap[${currentIndex}], heap[${targetChildIndex}]);`,
        });

        [this.heap[currentIndex], this.heap[targetChildIndex]] = [
          this.heap[targetChildIndex],
          this.heap[currentIndex],
        ];

        currentIndex = targetChildIndex;
      } else {
        break;
      }
    }
  }

  // ==========================================
  // CHANGE PRIORITY
  // ==========================================
  changePriority(index, newValue) {
    const steps = [];

    if (index < 0 || index >= this.heap.length) {
      steps.push({
        type: "error",
        heap: [...this.heap],
        message: `Invalid index ${index}. Must be between 0 and ${this.heap.length - 1}.`,
        highlighted: [],
        comparing: [],
        swapping: [],
        code: `// Invalid index`,
      });
      return steps;
    }

    const oldValue = this.heap[index];
    this.heap[index] = newValue;

    steps.push({
      type: "change",
      heap: [...this.heap],
      message: `Changed priority at index ${index}: ${oldValue} → ${newValue}`,
      highlighted: [index],
      comparing: [],
      swapping: [],
      code: `heap[${index}] = ${newValue}; // Was ${oldValue}`,
    });

    // Determine direction to bubble
    if (this.isMinHeap ? newValue < oldValue : newValue > oldValue) {
      // Bubble up
      steps.push({
        type: "direction",
        heap: [...this.heap],
        message: `New value is ${this.isMinHeap ? "smaller" : "larger"} → Bubble UP`,
        highlighted: [index],
        comparing: [],
        swapping: [],
        code: `// Bubble up needed`,
      });

      let currentIndex = index;
      while (this.hasParent(currentIndex)) {
        const parentIndex = this.getParentIndex(currentIndex);
        if (this.compare(this.heap[currentIndex], this.heap[parentIndex])) {
          steps.push({
            type: "swap",
            heap: [...this.heap],
            message: `Swap ${this.heap[currentIndex]} with parent ${this.heap[parentIndex]}`,
            highlighted: [],
            comparing: [],
            swapping: [currentIndex, parentIndex],
            code: `swap(heap[${currentIndex}], heap[${parentIndex}]);`,
          });
          [this.heap[currentIndex], this.heap[parentIndex]] = [
            this.heap[parentIndex],
            this.heap[currentIndex],
          ];
          currentIndex = parentIndex;
        } else {
          break;
        }
      }
    } else {
      // Bubble down
      steps.push({
        type: "direction",
        heap: [...this.heap],
        message: `New value is ${this.isMinHeap ? "larger" : "smaller"} → Bubble DOWN`,
        highlighted: [index],
        comparing: [],
        swapping: [],
        code: `// Bubble down needed`,
      });

      let currentIndex = index;
      while (this.hasLeftChild(currentIndex)) {
        const leftIndex = this.getLeftChildIndex(currentIndex);
        const rightIndex = this.getRightChildIndex(currentIndex);
        let targetIndex = leftIndex;

        if (
          this.hasRightChild(currentIndex) &&
          this.compare(this.heap[rightIndex], this.heap[leftIndex])
        ) {
          targetIndex = rightIndex;
        }

        if (this.compare(this.heap[targetIndex], this.heap[currentIndex])) {
          steps.push({
            type: "swap",
            heap: [...this.heap],
            message: `Swap ${this.heap[currentIndex]} with child ${this.heap[targetIndex]}`,
            highlighted: [],
            comparing: [],
            swapping: [currentIndex, targetIndex],
            code: `swap(heap[${currentIndex}], heap[${targetIndex}]);`,
          });
          [this.heap[currentIndex], this.heap[targetIndex]] = [
            this.heap[targetIndex],
            this.heap[currentIndex],
          ];
          currentIndex = targetIndex;
        } else {
          break;
        }
      }
    }

    steps.push({
      type: "complete",
      heap: [...this.heap],
      message: `Change priority complete! Heap property restored.`,
      highlighted: [],
      comparing: [],
      swapping: [],
      code: `// Change priority complete`,
    });

    return steps;
  }

  // Get size
  size() {
    return this.heap.length;
  }

  // Check if empty
  isEmpty() {
    return this.heap.length === 0;
  }
}

// ============================================
// MAIN VISUALIZER COMPONENT
// ============================================
export default function PriorityQueueVisualizer() {
  // State
  const [pq, setPq] = useState(new PriorityQueue(true));
  const [isMinHeap, setIsMinHeap] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [indexValue, setIndexValue] = useState("");
  const [operation, setOperation] = useState("insert");
  const [animationSteps, setAnimationSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);
  const [highlightedIndices, setHighlightedIndices] = useState([]);
  const [comparingIndices, setComparingIndices] = useState([]);
  const [swappingIndices, setSwappingIndices] = useState([]);
  const [explanation, setExplanation] = useState(
    "Welcome to Priority Queue Visualizer! A Priority Queue is implemented using a Binary Heap.",
  );
  const [codeSnippet, setCodeSnippet] = useState("");
  const [extractedValue, setExtractedValue] = useState(null);
  const [displayHeap, setDisplayHeap] = useState([]);
  const [showEducation, setShowEducation] = useState(true);

  const animationRef = useRef(null);

  // Update display heap when pq changes
  useEffect(() => {
    setDisplayHeap([...pq.heap]);
  }, [pq]);

  // Operations configuration
  const operations = [
    {
      value: "insert",
      label: "➕ Insert",
      needsValue: true,
      needsIndex: false,
    },
    {
      value: "extract",
      label: "⬆️ Extract " + (isMinHeap ? "Min" : "Max"),
      needsValue: false,
      needsIndex: false,
    },
    { value: "peek", label: "👁️ Peek", needsValue: false, needsIndex: false },
    {
      value: "changePriority",
      label: "✏️ Change Priority",
      needsValue: true,
      needsIndex: true,
    },
    {
      value: "buildHeap",
      label: "🔨 Build Heap",
      needsValue: true,
      needsIndex: false,
    },
  ];

  // Complexity information
  const complexityInfo = {
    insert: {
      time: "O(log n)",
      space: "O(1)",
      description: "Add to end, bubble up at most log(n) levels",
    },
    extract: {
      time: "O(log n)",
      space: "O(1)",
      description: "Remove root, move last to root, bubble down log(n) levels",
    },
    peek: {
      time: "O(1)",
      space: "O(1)",
      description: "Simply return root element",
    },
    changePriority: {
      time: "O(log n)",
      space: "O(1)",
      description: "Change value, bubble up or down as needed",
    },
    buildHeap: {
      time: "O(n)",
      space: "O(1)",
      description: "Heapify from last non-leaf - NOT O(n log n)!",
    },
  };

  // Toggle heap type
  const toggleHeapType = () => {
    const newIsMinHeap = !isMinHeap;
    setIsMinHeap(newIsMinHeap);
    const newPq = new PriorityQueue(newIsMinHeap);
    setPq(newPq);
    setDisplayHeap([]);
    setAnimationSteps([]);
    setCurrentStep(-1);
    setExplanation(
      `Switched to ${newIsMinHeap ? "Min" : "Max"}-Heap. ${newIsMinHeap ? "Smallest" : "Largest"} element will be at root.`,
    );
  };

  // Execute operation
  const executeOperation = useCallback(() => {
    const newPq = pq.clone();
    let steps = [];

    switch (operation) {
      case "insert": {
        const value = parseInt(inputValue);
        if (isNaN(value)) {
          setExplanation("⚠️ Please enter a valid integer");
          return;
        }
        steps = newPq.insert(value);
        setPq(newPq);
        break;
      }
      case "extract": {
        const result = newPq.extract();
        steps = result.steps;
        setPq(newPq);
        break;
      }
      case "peek": {
        const result = newPq.peek();
        steps = result.steps;
        break;
      }
      case "changePriority": {
        const index = parseInt(indexValue);
        const value = parseInt(inputValue);
        if (isNaN(index) || isNaN(value)) {
          setExplanation("⚠️ Please enter valid index and value");
          return;
        }
        steps = newPq.changePriority(index, value);
        setPq(newPq);
        break;
      }
      case "buildHeap": {
        const values = inputValue
          .split(",")
          .map((v) => parseInt(v.trim()))
          .filter((v) => !isNaN(v));
        if (values.length === 0) {
          setExplanation(
            "⚠️ Please enter comma-separated integers (e.g., 5,3,8,1,9)",
          );
          return;
        }
        steps = newPq.buildHeap(values);
        setPq(newPq);
        break;
      }
      default:
        break;
    }

    setAnimationSteps(steps);
    setCurrentStep(-1);
    setHighlightedIndices([]);
    setComparingIndices([]);
    setSwappingIndices([]);
    setExtractedValue(null);
    setCodeSnippet("");

    if (steps.length > 0) {
      setExplanation('🎬 Ready to animate. Click "Step" or "Play" to begin.');
    }
  }, [pq, operation, inputValue, indexValue]);

  // Animation step handler
  useEffect(() => {
    if (currentStep >= 0 && currentStep < animationSteps.length) {
      const step = animationSteps[currentStep];
      setDisplayHeap(step.heap || []);
      setHighlightedIndices(step.highlighted || []);
      setComparingIndices(step.comparing || []);
      setSwappingIndices(step.swapping || []);
      setExplanation(step.message);
      setCodeSnippet(step.code || "");
      if (step.extractedValue !== undefined) {
        setExtractedValue(step.extractedValue);
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
    setHighlightedIndices([]);
    setComparingIndices([]);
    setSwappingIndices([]);
    setExtractedValue(null);
    setCodeSnippet("");
    setDisplayHeap([...pq.heap]);
    setExplanation("🔄 Animation reset. Ready for next operation.");
  };

  const handleClear = () => {
    const newPq = new PriorityQueue(isMinHeap);
    setPq(newPq);
    setDisplayHeap([]);
    setAnimationSteps([]);
    setCurrentStep(-1);
    setHighlightedIndices([]);
    setComparingIndices([]);
    setSwappingIndices([]);
    setExtractedValue(null);
    setCodeSnippet("");
    setExplanation("🗑️ Priority Queue cleared. Start fresh!");
  };

  const generateRandom = () => {
    const newPq = new PriorityQueue(isMinHeap);
    const count = Math.floor(Math.random() * 5) + 5;
    const values = [];
    for (let i = 0; i < count; i++) {
      values.push(Math.floor(Math.random() * 99) + 1);
    }
    newPq.buildHeap(values);
    setPq(newPq);
    setDisplayHeap([...newPq.heap]);
    setAnimationSteps([]);
    setCurrentStep(-1);
    setExplanation(
      `🎲 Generated random ${isMinHeap ? "Min" : "Max"}-Heap with ${count} elements!`,
    );
  };

  // Calculate tree positions
  const calculateTreePositions = useCallback(() => {
    const nodes = [];
    const edges = [];

    if (displayHeap.length === 0) return { nodes, edges };

    const levels = Math.ceil(Math.log2(displayHeap.length + 1));
    const width = 700;
    const height = 280;
    const verticalGap = height / (levels + 1);

    displayHeap.forEach((value, index) => {
      const level = Math.floor(Math.log2(index + 1));
      const posInLevel = index - (Math.pow(2, level) - 1);
      const nodesInLevel = Math.pow(2, level);
      const horizontalGap = width / (nodesInLevel + 1);

      const x = horizontalGap * (posInLevel + 1);
      const y = verticalGap * (level + 1);

      nodes.push({
        index,
        value,
        x,
        y,
        isHighlighted: highlightedIndices.includes(index),
        isComparing: comparingIndices.includes(index),
        isSwapping: swappingIndices.includes(index),
      });

      // Add edge to parent
      if (index > 0) {
        const parentIndex = Math.floor((index - 1) / 2);
        const parentLevel = Math.floor(Math.log2(parentIndex + 1));
        const parentPosInLevel = parentIndex - (Math.pow(2, parentLevel) - 1);
        const parentNodesInLevel = Math.pow(2, parentLevel);
        const parentHorizontalGap = width / (parentNodesInLevel + 1);

        const parentX = parentHorizontalGap * (parentPosInLevel + 1);
        const parentY = verticalGap * (parentLevel + 1);

        edges.push({
          id: `${parentIndex}-${index}`,
          x1: parentX,
          y1: parentY + 20,
          x2: x,
          y2: y - 20,
        });
      }
    });

    return { nodes, edges };
  }, [displayHeap, highlightedIndices, comparingIndices, swappingIndices]);

  const { nodes: treeNodes, edges: treeEdges } = calculateTreePositions();
  const currentOp = operations.find((op) => op.value === operation);

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.title}>⚡ Priority Queue Visualizer</h1>
        <p style={styles.subtitle}>
          Binary Heap Implementation • {isMinHeap ? "Min-Heap" : "Max-Heap"}{" "}
          Mode
        </p>
      </header>

      <div style={styles.mainContent}>
        {/* Left Panel - Controls */}
        <div style={styles.leftPanel}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>⚙️ Control Panel</h2>

            {/* Heap Type Toggle */}
            <div style={styles.toggleContainer}>
              <span style={styles.toggleLabel}>Heap Type:</span>
              <button
                style={{
                  ...styles.toggleButton,
                  ...(isMinHeap ? styles.toggleActive : styles.toggleInactive),
                }}
                onClick={() => !isMinHeap && toggleHeapType()}
              >
                Min-Heap
              </button>
              <button
                style={{
                  ...styles.toggleButton,
                  ...(!isMinHeap ? styles.toggleActive : styles.toggleInactive),
                }}
                onClick={() => isMinHeap && toggleHeapType()}
              >
                Max-Heap
              </button>
            </div>

            {/* Operation Selector */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Operation</label>
              <select
                style={styles.select}
                value={operation}
                onChange={(e) => setOperation(e.target.value)}
              >
                {operations.map((op) => (
                  <option key={op.value} value={op.value}>
                    {op.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Value Input */}
            {currentOp?.needsValue && (
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  {operation === "buildHeap"
                    ? "Values (comma-separated)"
                    : "Value"}
                </label>
                <input
                  type="text"
                  style={styles.input}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={
                    operation === "buildHeap"
                      ? "e.g., 5,3,8,1,9"
                      : "Enter integer..."
                  }
                  onKeyDown={(e) => e.key === "Enter" && executeOperation()}
                />
              </div>
            )}

            {/* Index Input */}
            {currentOp?.needsIndex && (
              <div style={styles.inputGroup}>
                <label style={styles.label}>Index</label>
                <input
                  type="number"
                  style={styles.input}
                  value={indexValue}
                  onChange={(e) => setIndexValue(e.target.value)}
                  placeholder="Enter index..."
                />
              </div>
            )}

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
              ▶ Execute {currentOp?.label.replace(/[^\w\s]/g, "").trim()}
            </button>

            {/* Animation Controls */}
            <div style={styles.controlSection}>
              <label style={styles.label}>Animation Controls</label>
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
                  style={{ ...styles.button, ...styles.dangerButton, flex: 1 }}
                  onClick={handleClear}
                >
                  🗑 Clear
                </button>
              </div>
            </div>

            {/* Random Generator */}
            <button
              style={{
                ...styles.button,
                ...styles.accentButton,
                width: "100%",
                marginTop: "12px",
              }}
              onClick={generateRandom}
            >
              🎲 Generate Random Heap
            </button>

            {/* Speed Control */}
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
            <h3 style={styles.cardTitle}>🎨 Color Legend</h3>
            <div style={styles.legend}>
              <div style={styles.legendItem}>
                <div
                  style={{
                    ...styles.legendDot,
                    background: "linear-gradient(135deg, #06b6d4, #0891b2)",
                  }}
                />
                <span>Normal Node</span>
              </div>
              <div style={styles.legendItem}>
                <div
                  style={{
                    ...styles.legendDot,
                    background: "linear-gradient(135deg, #10b981, #059669)",
                  }}
                />
                <span>Highlighted / Complete</span>
              </div>
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
                    background: "linear-gradient(135deg, #ec4899, #db2777)",
                  }}
                />
                <span>Swapping</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Panel - Visualization */}
        <div style={styles.centerPanel}>
          <div style={styles.card}>
            <div style={styles.visualizationHeader}>
              <h2 style={styles.cardTitle}>🌳 Heap Visualization</h2>
              <span style={styles.heapTypeBadge}>
                {isMinHeap
                  ? "↓ Min-Heap: Parent ≤ Children"
                  : "↑ Max-Heap: Parent ≥ Children"}
              </span>
            </div>

            {/* Tree Visualization */}
            <div style={styles.treeArea}>
              <svg style={styles.svg} viewBox="0 0 700 300">
                <defs>
                  <linearGradient
                    id="normalGradPQ"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#0891b2" />
                  </linearGradient>
                  <linearGradient
                    id="highlightGradPQ"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                  <linearGradient
                    id="compareGradPQ"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#d97706" />
                  </linearGradient>
                  <linearGradient
                    id="swapGradPQ"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#ec4899" />
                    <stop offset="100%" stopColor="#db2777" />
                  </linearGradient>
                  <filter
                    id="nodeShadowPQ"
                    x="-30%"
                    y="-30%"
                    width="160%"
                    height="160%"
                  >
                    <feDropShadow
                      dx="0"
                      dy="2"
                      stdDeviation="3"
                      floodOpacity="0.15"
                    />
                  </filter>
                </defs>

                <rect width="100%" height="100%" fill="#f8fafc" rx="8" />

                {/* Edges */}
                {treeEdges.map((edge) => (
                  <line
                    key={edge.id}
                    x1={edge.x1}
                    y1={edge.y1}
                    x2={edge.x2}
                    y2={edge.y2}
                    stroke="#94a3b8"
                    strokeWidth="2"
                  />
                ))}

                {/* Nodes */}
                {treeNodes.map((node) => {
                  let gradient = "url(#normalGradPQ)";
                  if (node.isSwapping) gradient = "url(#swapGradPQ)";
                  else if (node.isComparing) gradient = "url(#compareGradPQ)";
                  else if (node.isHighlighted)
                    gradient = "url(#highlightGradPQ)";

                  const isActive =
                    node.isHighlighted || node.isComparing || node.isSwapping;

                  return (
                    <g key={node.index}>
                      {isActive && (
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r="28"
                          fill={
                            node.isSwapping
                              ? "#ec489933"
                              : node.isComparing
                                ? "#f59e0b33"
                                : "#10b98133"
                          }
                        />
                      )}
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r="22"
                        fill={gradient}
                        filter="url(#nodeShadowPQ)"
                        style={{
                          transition: "all 0.3s ease",
                          transform: isActive ? "scale(1.1)" : "scale(1)",
                          transformOrigin: `${node.x}px ${node.y}px`,
                        }}
                      />
                      <text
                        x={node.x}
                        y={node.y}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="white"
                        fontSize="13"
                        fontWeight="700"
                      >
                        {node.value}
                      </text>
                      <text
                        x={node.x}
                        y={node.y + 35}
                        textAnchor="middle"
                        fill="#64748b"
                        fontSize="10"
                        fontWeight="500"
                      >
                        [{node.index}]
                      </text>
                    </g>
                  );
                })}

                {displayHeap.length === 0 && (
                  <text
                    x="350"
                    y="150"
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="16"
                  >
                    Priority Queue is empty. Insert elements to begin!
                  </text>
                )}
              </svg>
            </div>

            {/* Array Representation */}
            <div style={styles.arraySection}>
              <h3 style={styles.arrayTitle}>📊 Array Representation</h3>
              <div style={styles.arrayContainer}>
                {displayHeap.length === 0 ? (
                  <span style={styles.emptyArray}>[ Empty ]</span>
                ) : (
                  displayHeap.map((value, index) => {
                    let bg = "#e2e8f0";
                    let color = "#334155";
                    if (swappingIndices.includes(index)) {
                      bg = "linear-gradient(135deg, #ec4899, #db2777)";
                      color = "white";
                    } else if (comparingIndices.includes(index)) {
                      bg = "linear-gradient(135deg, #f59e0b, #d97706)";
                      color = "white";
                    } else if (highlightedIndices.includes(index)) {
                      bg = "linear-gradient(135deg, #10b981, #059669)";
                      color = "white";
                    }

                    return (
                      <div key={index} style={styles.arrayCell}>
                        <div
                          style={{
                            ...styles.arrayCellValue,
                            background: bg,
                            color: color,
                          }}
                        >
                          {value}
                        </div>
                        <div style={styles.arrayCellIndex}>{index}</div>
                      </div>
                    );
                  })
                )}
              </div>
              {displayHeap.length > 0 && (
                <div style={styles.indexFormulas}>
                  <span>Parent(i) = ⌊(i-1)/2⌋</span>
                  <span>Left(i) = 2i+1</span>
                  <span>Right(i) = 2i+2</span>
                </div>
              )}
            </div>

            {/* Explanation Box */}
            <div style={styles.explanationBox}>
              <div style={styles.explanationHeader}>
                <span style={styles.stepBadge}>
                  Step {Math.max(0, currentStep + 1)}
                </span>
                {extractedValue !== null && (
                  <span style={styles.extractedBadge}>
                    Extracted: {extractedValue}
                  </span>
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

        {/* Right Panel - Education */}
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
                {/* Heap Property */}
                <div style={styles.educationSection}>
                  <h3 style={styles.sectionTitle}>🔑 Heap Property</h3>
                  <div style={styles.propertyBox}>
                    <p style={styles.propertyText}>
                      <strong
                        style={{ color: isMinHeap ? "#0891b2" : "#dc2626" }}
                      >
                        {isMinHeap ? "Min-Heap" : "Max-Heap"}:
                      </strong>
                      <br />
                      {isMinHeap
                        ? "Every parent ≤ its children\nSmallest element at root"
                        : "Every parent ≥ its children\nLargest element at root"}
                    </p>
                  </div>
                </div>

                {/* Index Relationships */}
                <div style={styles.educationSection}>
                  <h3 style={styles.sectionTitle}>🔢 Index Math (0-indexed)</h3>
                  <div style={styles.formulaBox}>
                    <div style={styles.formula}>
                      <span style={styles.formulaLabel}>Parent:</span>
                      <code style={styles.formulaCode}>⌊(i-1)/2⌋</code>
                    </div>
                    <div style={styles.formula}>
                      <span style={styles.formulaLabel}>Left Child:</span>
                      <code style={styles.formulaCode}>2i + 1</code>
                    </div>
                    <div style={styles.formula}>
                      <span style={styles.formulaLabel}>Right Child:</span>
                      <code style={styles.formulaCode}>2i + 2</code>
                    </div>
                  </div>
                </div>

                {/* Current Operation */}
                <div style={styles.educationSection}>
                  <h3 style={styles.sectionTitle}>
                    🔧 {currentOp?.label.replace(/[^\w\s]/g, "")}
                  </h3>
                  <p style={styles.sectionContent}>
                    {operation === "insert" &&
                      "Add element at end of array, then bubble UP by swapping with parent until heap property is satisfied."}
                    {operation === "extract" &&
                      `Remove root (${isMinHeap ? "min" : "max"}), move last element to root, then bubble DOWN by swapping with ${isMinHeap ? "smaller" : "larger"} child until heap property is satisfied.`}
                    {operation === "peek" &&
                      `Simply return the root element. This is always the ${isMinHeap ? "minimum" : "maximum"} in the heap.`}
                    {operation === "changePriority" &&
                      "Update value at index, then bubble UP or DOWN depending on whether new value is better or worse than old value."}
                    {operation === "buildHeap" &&
                      "Start from last non-leaf node, heapify each node downward. This is O(n), not O(n log n)!"}
                  </p>
                </div>

                {/* Complexity */}
                <div style={styles.educationSection}>
                  <h3 style={styles.sectionTitle}>📊 Complexity</h3>
                  <table style={styles.complexityTable}>
                    <tbody>
                      <tr>
                        <td style={styles.tableLabel}>Time</td>
                        <td style={styles.tableValue}>
                          {complexityInfo[operation]?.time}
                        </td>
                      </tr>
                      <tr>
                        <td style={styles.tableLabel}>Space</td>
                        <td style={styles.tableValue}>
                          {complexityInfo[operation]?.space}
                        </td>
                      </tr>
                      <tr>
                        <td style={styles.tableLabel}>Why?</td>
                        <td style={styles.tableValue}>
                          {complexityInfo[operation]?.description}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Use Cases */}
                <div style={styles.educationSection}>
                  <h3 style={styles.sectionTitle}>💡 Common Use Cases</h3>
                  <ul style={styles.useCaseList}>
                    <li>Dijkstra's shortest path algorithm</li>
                    <li>Huffman encoding</li>
                    <li>Task scheduling by priority</li>
                    <li>K-th largest/smallest element</li>
                    <li>Merge K sorted lists</li>
                    <li>Median maintenance</li>
                  </ul>
                </div>

                {/* Edge Cases */}
                <div style={styles.educationSection}>
                  <h3 style={styles.sectionTitle}>⚠️ Edge Cases</h3>
                  <ul style={styles.edgeCaseList}>
                    <li>Extract from empty heap</li>
                    <li>Single element heap</li>
                    <li>All elements equal</li>
                    <li>Inserting duplicate priorities</li>
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
      "linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 50%, #e0f2fe 100%)",
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
      "linear-gradient(135deg, #0891b2 0%, #06b6d4 50%, #14b8a6 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    margin: "0 0 6px 0",
  },
  subtitle: {
    fontSize: "1rem",
    color: "#0f766e",
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
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.08)",
    border: "1px solid #e2e8f0",
  },
  cardTitle: {
    fontSize: "1rem",
    fontWeight: "700",
    color: "#134e4a",
    marginBottom: "14px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  toggleContainer: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "16px",
    padding: "4px",
    background: "#f1f5f9",
    borderRadius: "10px",
  },
  toggleLabel: {
    fontSize: "0.8rem",
    fontWeight: "600",
    color: "#475569",
    padding: "0 8px",
  },
  toggleButton: {
    flex: 1,
    padding: "8px 12px",
    fontSize: "0.85rem",
    fontWeight: "600",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  toggleActive: {
    background: "linear-gradient(135deg, #06b6d4, #0891b2)",
    color: "white",
    boxShadow: "0 2px 8px rgba(6, 182, 212, 0.3)",
  },
  toggleInactive: {
    background: "transparent",
    color: "#64748b",
  },
  inputGroup: {
    marginBottom: "12px",
  },
  label: {
    display: "block",
    fontSize: "0.8rem",
    fontWeight: "600",
    color: "#475569",
    marginBottom: "6px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    fontSize: "0.95rem",
    border: "2px solid #e2e8f0",
    borderRadius: "10px",
    outline: "none",
    boxSizing: "border-box",
  },
  select: {
    width: "100%",
    padding: "10px 12px",
    fontSize: "0.95rem",
    border: "2px solid #e2e8f0",
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
    background: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
    color: "white",
    boxShadow: "0 2px 8px rgba(6, 182, 212, 0.3)",
  },
  secondaryButton: {
    background: "#f1f5f9",
    color: "#475569",
  },
  successButton: {
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: "white",
  },
  warningButton: {
    background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    color: "white",
  },
  dangerButton: {
    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
    color: "white",
  },
  accentButton: {
    background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
    color: "white",
  },
  slider: {
    width: "100%",
    height: "6px",
    borderRadius: "3px",
    background: "#e2e8f0",
    outline: "none",
    cursor: "pointer",
    marginTop: "8px",
  },
  progressContainer: {
    marginTop: "14px",
  },
  progressLabel: {
    fontSize: "0.75rem",
    color: "#64748b",
    marginBottom: "6px",
    fontWeight: "500",
  },
  progressBar: {
    height: "6px",
    background: "#e2e8f0",
    borderRadius: "3px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(135deg, #06b6d4, #0891b2)",
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
    color: "#475569",
  },
  legendDot: {
    width: "18px",
    height: "18px",
    borderRadius: "6px",
    flexShrink: 0,
  },
  visualizationHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "8px",
  },
  heapTypeBadge: {
    fontSize: "0.75rem",
    fontWeight: "600",
    color: "#0891b2",
    background: "#cffafe",
    padding: "4px 10px",
    borderRadius: "6px",
  },
  treeArea: {
    background: "#f8fafc",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    overflow: "hidden",
    marginBottom: "16px",
  },
  svg: {
    width: "100%",
    height: "300px",
  },
  arraySection: {
    marginBottom: "16px",
  },
  arrayTitle: {
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "#334155",
    marginBottom: "10px",
  },
  arrayContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    padding: "12px",
    background: "#f8fafc",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
  },
  emptyArray: {
    color: "#94a3b8",
    fontSize: "0.9rem",
    fontStyle: "italic",
  },
  arrayCell: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
  },
  arrayCellValue: {
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "8px",
    fontSize: "0.9rem",
    fontWeight: "700",
    transition: "all 0.3s ease",
  },
  arrayCellIndex: {
    fontSize: "0.7rem",
    color: "#64748b",
    fontWeight: "500",
  },
  indexFormulas: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    marginTop: "10px",
    fontSize: "0.75rem",
    color: "#64748b",
    fontFamily: "monospace",
  },
  explanationBox: {
    padding: "14px",
    background: "linear-gradient(135deg, #ecfeff 0%, #cffafe 100%)",
    borderRadius: "12px",
    border: "1px solid #a5f3fc",
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
    color: "#0e7490",
    background: "white",
    padding: "3px 8px",
    borderRadius: "6px",
  },
  extractedBadge: {
    fontSize: "0.75rem",
    fontWeight: "700",
    color: "#059669",
    background: "#d1fae5",
    padding: "3px 8px",
    borderRadius: "6px",
  },
  explanationText: {
    fontSize: "0.9rem",
    color: "#0e7490",
    margin: 0,
    lineHeight: "1.5",
  },
  codeBox: {
    marginTop: "10px",
    padding: "10px",
    background: "#1e293b",
    borderRadius: "8px",
  },
  codeText: {
    fontSize: "0.8rem",
    color: "#5eead4",
    fontFamily: "'Fira Code', monospace",
  },
  educationHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  toggleBtn: {
    background: "#f1f5f9",
    border: "none",
    borderRadius: "6px",
    padding: "4px 10px",
    cursor: "pointer",
    fontSize: "0.8rem",
    color: "#64748b",
  },
  educationSection: {
    marginBottom: "16px",
  },
  sectionTitle: {
    fontSize: "0.85rem",
    fontWeight: "700",
    color: "#334155",
    marginBottom: "8px",
  },
  sectionContent: {
    fontSize: "0.8rem",
    color: "#64748b",
    lineHeight: "1.6",
    margin: 0,
  },
  propertyBox: {
    background: "linear-gradient(135deg, #ecfeff 0%, #cffafe 100%)",
    borderRadius: "10px",
    padding: "12px",
    border: "1px solid #a5f3fc",
  },
  propertyText: {
    fontSize: "0.8rem",
    color: "#0e7490",
    margin: 0,
    lineHeight: "1.6",
    whiteSpace: "pre-line",
  },
  formulaBox: {
    background: "#f8fafc",
    borderRadius: "10px",
    padding: "12px",
    border: "1px solid #e2e8f0",
  },
  formula: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "6px 0",
    borderBottom: "1px solid #e2e8f0",
  },
  formulaLabel: {
    fontSize: "0.8rem",
    color: "#475569",
    fontWeight: "500",
  },
  formulaCode: {
    fontSize: "0.8rem",
    color: "#0891b2",
    fontFamily: "monospace",
    background: "#ecfeff",
    padding: "2px 6px",
    borderRadius: "4px",
  },
  complexityTable: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "0.75rem",
  },
  tableLabel: {
    padding: "8px",
    background: "#f8fafc",
    color: "#475569",
    fontWeight: "600",
    borderBottom: "1px solid #e2e8f0",
    width: "30%",
  },
  tableValue: {
    padding: "8px",
    color: "#64748b",
    borderBottom: "1px solid #e2e8f0",
  },
  useCaseList: {
    fontSize: "0.8rem",
    color: "#64748b",
    paddingLeft: "18px",
    margin: "0",
    lineHeight: "1.8",
  },
  edgeCaseList: {
    fontSize: "0.8rem",
    color: "#64748b",
    paddingLeft: "18px",
    margin: "0",
    lineHeight: "1.8",
  },
};
