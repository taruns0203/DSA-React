/**
 * Queue Complete Visualizer
 * A polished educational tool for understanding Queue data structure
 * Features: Interactive operations, step-by-step execution, animations
 * Suitable for FAANG interview preparation
 */

import React, { useState, useEffect, useRef } from "react";

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const MAX_ELEMENTS = 10;
const DEFAULT_SPEED = 1000;

// Color palette for vibrant UI
const COLORS = {
  primary: "#10b981", // Emerald (main queue color)
  secondary: "#06b6d4", // Cyan
  success: "#22c55e", // Green
  warning: "#f59e0b", // Amber
  danger: "#ef4444", // Red
  info: "#3b82f6", // Blue
  highlight: "#fbbf24", // Yellow
  purple: "#8b5cf6", // Purple
  queueGradient: ["#34d399", "#10b981", "#059669"],
};

// Operations available for Queue
const OPERATIONS = [
  {
    id: "enqueue",
    name: "Enqueue",
    description: "Add element to rear",
    needsInput: true,
  },
  {
    id: "dequeue",
    name: "Dequeue",
    description: "Remove element from front",
    needsInput: false,
  },
  {
    id: "front",
    name: "Front/Peek",
    description: "View front element",
    needsInput: false,
  },
  {
    id: "rear",
    name: "Rear",
    description: "View rear element",
    needsInput: false,
  },
  {
    id: "isEmpty",
    name: "Is Empty",
    description: "Check if queue is empty",
    needsInput: false,
  },
  {
    id: "isFull",
    name: "Is Full",
    description: "Check if queue is full",
    needsInput: false,
  },
  {
    id: "search",
    name: "Search",
    description: "Find element in queue",
    needsInput: true,
  },
  {
    id: "size",
    name: "Size",
    description: "Get queue size",
    needsInput: false,
  },
];

// Complexity information for each operation
const COMPLEXITY = {
  enqueue: {
    time: "O(1)",
    space: "O(1)",
    description: "Direct insertion at rear",
  },
  dequeue: {
    time: "O(1)",
    space: "O(1)",
    description: "Direct removal from front",
  },
  front: { time: "O(1)", space: "O(1)", description: "Direct access to front" },
  rear: { time: "O(1)", space: "O(1)", description: "Direct access to rear" },
  isEmpty: {
    time: "O(1)",
    space: "O(1)",
    description: "Check size or pointers",
  },
  isFull: {
    time: "O(1)",
    space: "O(1)",
    description: "Check size vs capacity",
  },
  search: {
    time: "O(n)",
    space: "O(1)",
    description: "Linear search through queue",
  },
  size: { time: "O(1)", space: "O(1)", description: "Return stored count" },
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function QueueVisualizer() {
  // State management
  const [elements, setElements] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [selectedOperation, setSelectedOperation] = useState("enqueue");
  const [isAnimating, setIsAnimating] = useState(false);
  const [speed, setSpeed] = useState(DEFAULT_SPEED);
  const [explanation, setExplanation] = useState(
    "Welcome! Select an operation and click Execute to begin learning about Queues.",
  );
  const [highlightedIndex, setHighlightedIndex] = useState(null);
  const [animatingElement, setAnimatingElement] = useState(null);
  const [animationType, setAnimationType] = useState(null);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [searchingIndex, setSearchingIndex] = useState(-1);
  const [showCode, setShowCode] = useState(false);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // Generate random value between 1 and 99
  const generateRandomValue = () => Math.floor(Math.random() * 99) + 1;

  // Generate random dataset
  const generateRandomData = () => {
    if (isAnimating) return;
    const count = Math.floor(Math.random() * 5) + 3; // 3-7 elements
    const newElements = Array.from({ length: count }, (_, i) => ({
      value: generateRandomValue(),
      id: Date.now() + i,
    }));
    setElements(newElements);
    setExplanation(`🎲 Generated ${count} random elements in the queue.`);
    setResult(null);
    setHighlightedIndex(null);
    setSearchingIndex(-1);
  };

  // Reset visualization
  const resetVisualization = () => {
    setElements([]);
    setInputValue("");
    setExplanation("🔄 Queue reset. Ready for new operations!");
    setHighlightedIndex(null);
    setAnimatingElement(null);
    setAnimationType(null);
    setResult(null);
    setHistory([]);
    setSearchingIndex(-1);
    setIsAnimating(false);
  };

  // Add to history
  const addToHistory = (operation, value, success) => {
    const timestamp = new Date().toLocaleTimeString();
    setHistory((prev) => [
      ...prev.slice(-9),
      { operation, value, success, timestamp },
    ]);
  };

  // ============================================================================
  // QUEUE OPERATIONS
  // ============================================================================

  const queueEnqueue = async (value) => {
    if (elements.length >= MAX_ELEMENTS) {
      setExplanation(
        "❌ Queue Overflow! Cannot enqueue - queue has reached maximum capacity.",
      );
      setResult({ success: false, message: "Queue Overflow" });
      addToHistory("enqueue", value, false);
      return;
    }

    // Step 1: Show incoming element
    setExplanation(
      `📥 Step 1: Preparing to add ${value} to the rear of the queue...`,
    );
    setAnimatingElement({ value, id: Date.now() });
    setAnimationType("enqueue-prepare");

    await sleep(speed * 0.4);

    // Step 2: Animate insertion
    setExplanation(`📥 Step 2: Inserting ${value} at the rear position...`);
    setAnimationType("enqueue-insert");

    await sleep(speed * 0.4);

    // Step 3: Complete
    const newElement = { value, id: Date.now() };
    setElements((prev) => [...prev, newElement]);
    setAnimatingElement(null);
    setAnimationType(null);
    setHighlightedIndex(elements.length);

    await sleep(speed * 0.3);

    setExplanation(
      `✅ Successfully enqueued ${value}. It is now at the rear of the queue.`,
    );
    setResult({ success: true, message: `Enqueued ${value}` });
    addToHistory("enqueue", value, true);

    await sleep(speed * 0.3);
    setHighlightedIndex(null);
  };

  const queueDequeue = async () => {
    if (elements.length === 0) {
      setExplanation("❌ Queue Underflow! Cannot dequeue - queue is empty.");
      setResult({ success: false, message: "Queue Underflow" });
      addToHistory("dequeue", null, false);
      return;
    }

    const frontElement = elements[0];

    // Step 1: Highlight front element
    setHighlightedIndex(0);
    setExplanation(
      `📤 Step 1: Identifying front element: ${frontElement.value}`,
    );

    await sleep(speed * 0.4);

    // Step 2: Animate removal
    setExplanation(
      `📤 Step 2: Removing ${frontElement.value} from the front...`,
    );
    setAnimationType("dequeue");

    await sleep(speed * 0.5);

    // Step 3: Shift remaining elements
    setExplanation(`📤 Step 3: Shifting remaining elements forward...`);
    setElements((prev) => prev.slice(1));
    setAnimationType("shift");

    await sleep(speed * 0.3);

    setAnimationType(null);
    setHighlightedIndex(null);

    setExplanation(
      `✅ Successfully dequeued ${frontElement.value}. The next element is now at front.`,
    );
    setResult({
      success: true,
      message: `Dequeued ${frontElement.value}`,
      value: frontElement.value,
    });
    addToHistory("dequeue", frontElement.value, true);
  };

  const queueFront = async () => {
    if (elements.length === 0) {
      setExplanation("❌ Queue is empty! No front element to peek.");
      setResult({ success: false, message: "Queue Empty" });
      addToHistory("front", null, false);
      return;
    }

    const frontElement = elements[0];

    // Step 1: Locate front
    setExplanation(`👁️ Step 1: Locating the front element...`);
    await sleep(speed * 0.3);

    // Step 2: Highlight
    setHighlightedIndex(0);
    setExplanation(`👁️ Step 2: Front element found: ${frontElement.value}`);

    await sleep(speed * 0.6);

    setExplanation(
      `✅ Front element is ${frontElement.value}. Queue remains unchanged (peek operation).`,
    );
    setResult({
      success: true,
      message: `Front: ${frontElement.value}`,
      value: frontElement.value,
    });
    addToHistory("front", frontElement.value, true);

    await sleep(speed * 0.4);
    setHighlightedIndex(null);
  };

  const queueRear = async () => {
    if (elements.length === 0) {
      setExplanation("❌ Queue is empty! No rear element.");
      setResult({ success: false, message: "Queue Empty" });
      addToHistory("rear", null, false);
      return;
    }

    const rearElement = elements[elements.length - 1];

    // Step 1: Locate rear
    setExplanation(`👁️ Step 1: Locating the rear element...`);
    await sleep(speed * 0.3);

    // Step 2: Highlight
    setHighlightedIndex(elements.length - 1);
    setExplanation(`👁️ Step 2: Rear element found: ${rearElement.value}`);

    await sleep(speed * 0.6);

    setExplanation(
      `✅ Rear element is ${rearElement.value}. Queue remains unchanged.`,
    );
    setResult({
      success: true,
      message: `Rear: ${rearElement.value}`,
      value: rearElement.value,
    });
    addToHistory("rear", rearElement.value, true);

    await sleep(speed * 0.4);
    setHighlightedIndex(null);
  };

  const queueSearch = async (value) => {
    if (elements.length === 0) {
      setExplanation("❌ Queue is empty! Nothing to search.");
      setResult({ success: false, message: "Queue Empty" });
      addToHistory("search", value, false);
      return;
    }

    setExplanation(
      `🔍 Starting linear search for ${value} from front to rear...`,
    );
    await sleep(speed * 0.3);

    // Search from front to rear
    for (let i = 0; i < elements.length; i++) {
      setHighlightedIndex(i);
      setSearchingIndex(i);
      setExplanation(
        `🔍 Checking position ${i + 1}: value = ${elements[i].value} ${elements[i].value === value ? "✓ MATCH!" : "✗ No match"}`,
      );

      await sleep(speed * 0.5);

      if (elements[i].value === value) {
        setExplanation(
          `✅ Found ${value} at position ${i + 1} from front! (0-indexed: ${i})`,
        );
        setResult({
          success: true,
          message: `Found at position ${i + 1}`,
          value,
        });
        addToHistory("search", value, true);

        await sleep(speed * 0.5);
        setHighlightedIndex(null);
        setSearchingIndex(-1);
        return;
      }
    }

    setHighlightedIndex(null);
    setSearchingIndex(-1);
    setExplanation(
      `❌ ${value} not found in queue after checking all ${elements.length} elements.`,
    );
    setResult({ success: false, message: "Not Found" });
    addToHistory("search", value, false);
  };

  const checkIsEmpty = async () => {
    const isEmpty = elements.length === 0;

    setExplanation(`🔍 Checking if queue is empty...`);
    await sleep(speed * 0.3);

    if (isEmpty) {
      setExplanation(`✅ Queue IS empty. Size = 0.`);
    } else {
      // Briefly highlight all elements
      for (let i = 0; i < elements.length; i++) {
        setHighlightedIndex(i);
        await sleep(speed * 0.15);
      }
      setHighlightedIndex(null);
      setExplanation(
        `✅ Queue is NOT empty. Contains ${elements.length} element(s).`,
      );
    }

    setResult({
      success: true,
      message: isEmpty ? "True (Empty)" : "False (Not Empty)",
      value: isEmpty,
    });
    addToHistory("isEmpty", isEmpty, true);
  };

  const checkIsFull = async () => {
    const isFull = elements.length >= MAX_ELEMENTS;

    setExplanation(
      `🔍 Checking if queue is full (capacity: ${MAX_ELEMENTS})...`,
    );
    await sleep(speed * 0.4);

    setExplanation(
      isFull
        ? `✅ Queue IS full. Size = ${elements.length}/${MAX_ELEMENTS}.`
        : `✅ Queue is NOT full. Size = ${elements.length}/${MAX_ELEMENTS}. Can add ${MAX_ELEMENTS - elements.length} more.`,
    );
    setResult({
      success: true,
      message: isFull ? "True (Full)" : "False (Not Full)",
      value: isFull,
    });
    addToHistory("isFull", isFull, true);
  };

  const getSize = async () => {
    setExplanation(`📏 Calculating queue size...`);
    await sleep(speed * 0.3);

    setExplanation(
      `✅ Queue size: ${elements.length} element(s). Capacity: ${MAX_ELEMENTS}.`,
    );
    setResult({
      success: true,
      message: `Size: ${elements.length}`,
      value: elements.length,
    });
    addToHistory("size", elements.length, true);
  };

  // ============================================================================
  // EXECUTION HANDLER
  // ============================================================================

  const executeOperation = async () => {
    if (isAnimating) return;

    setIsAnimating(true);
    setResult(null);
    setSearchingIndex(-1);

    const value = inputValue ? parseInt(inputValue, 10) : null;
    const operation = OPERATIONS.find((op) => op.id === selectedOperation);

    try {
      // Validate input for operations that need it
      if (operation.needsInput && (value === null || isNaN(value))) {
        setExplanation(
          `⚠️ Please enter a valid number for ${operation.name} operation.`,
        );
        setResult({ success: false, message: "Invalid Input" });
        setIsAnimating(false);
        return;
      }

      switch (selectedOperation) {
        case "enqueue":
          await queueEnqueue(value);
          break;
        case "dequeue":
          await queueDequeue();
          break;
        case "front":
          await queueFront();
          break;
        case "rear":
          await queueRear();
          break;
        case "isEmpty":
          await checkIsEmpty();
          break;
        case "isFull":
          await checkIsFull();
          break;
        case "search":
          await queueSearch(value);
          break;
        case "size":
          await getSize();
          break;
        default:
          break;
      }
    } finally {
      setIsAnimating(false);
      setInputValue("");
    }
  };

  // Check if current operation needs input
  const currentOperation = OPERATIONS.find((op) => op.id === selectedOperation);
  const needsInput = currentOperation?.needsInput || false;
  const currentComplexity = COMPLEXITY[selectedOperation];

  // ============================================================================
  // STYLES
  // ============================================================================

  const styles = {
    container: {
      minHeight: "100vh",
      background:
        "linear-gradient(135deg, #ecfdf5 0%, #f0fdfa 50%, #f0f9ff 100%)",
      fontFamily:
        "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      padding: "24px",
      boxSizing: "border-box",
    },
    header: {
      textAlign: "center",
      marginBottom: "28px",
    },
    title: {
      fontSize: "2.8rem",
      fontWeight: "800",
      background:
        "linear-gradient(135deg, #10b981 0%, #06b6d4 50%, #3b82f6 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
      margin: "0 0 8px 0",
      letterSpacing: "-0.02em",
    },
    subtitle: {
      color: "#64748b",
      fontSize: "1.15rem",
      margin: 0,
      fontWeight: "500",
    },
    badge: {
      display: "inline-block",
      background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
      color: "white",
      padding: "6px 14px",
      borderRadius: "20px",
      fontSize: "0.8rem",
      fontWeight: "600",
      marginTop: "12px",
    },
    mainGrid: {
      display: "grid",
      gridTemplateColumns: "320px 1fr 340px",
      gap: "24px",
      maxWidth: "1700px",
      margin: "0 auto",
    },
    card: {
      background: "white",
      borderRadius: "20px",
      padding: "24px",
      boxShadow:
        "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      border: "1px solid rgba(16, 185, 129, 0.1)",
    },
    cardTitle: {
      fontSize: "1.15rem",
      fontWeight: "700",
      color: "#1e293b",
      marginBottom: "20px",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      paddingBottom: "12px",
      borderBottom: "2px solid #f1f5f9",
    },
    label: {
      fontSize: "0.85rem",
      fontWeight: "600",
      color: "#475569",
      marginBottom: "8px",
      display: "block",
    },
    input: {
      width: "100%",
      padding: "14px 18px",
      border: "2px solid #e2e8f0",
      borderRadius: "12px",
      fontSize: "1rem",
      outline: "none",
      transition: "all 0.3s ease",
      boxSizing: "border-box",
      marginBottom: "16px",
    },
    select: {
      width: "100%",
      padding: "14px 18px",
      border: "2px solid #e2e8f0",
      borderRadius: "12px",
      fontSize: "1rem",
      outline: "none",
      cursor: "pointer",
      background: "white",
      marginBottom: "16px",
      fontWeight: "500",
    },
    button: (color, disabled) => ({
      width: "100%",
      padding: "16px 24px",
      border: "none",
      borderRadius: "14px",
      fontSize: "1.05rem",
      fontWeight: "700",
      cursor: disabled ? "not-allowed" : "pointer",
      transition: "all 0.3s ease",
      background: disabled
        ? "#e2e8f0"
        : `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
      color: disabled ? "#94a3b8" : "white",
      boxShadow: disabled ? "none" : `0 4px 14px ${color}40`,
      marginBottom: "12px",
      letterSpacing: "0.02em",
    }),
    buttonGroup: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "12px",
      marginTop: "8px",
    },
    smallButton: (color) => ({
      padding: "12px 18px",
      border: "none",
      borderRadius: "12px",
      fontSize: "0.95rem",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
      background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
      color: "white",
      boxShadow: `0 2px 8px ${color}30`,
    }),
    speedControl: {
      marginTop: "20px",
      padding: "16px",
      background: "#f8fafc",
      borderRadius: "12px",
    },
    slider: {
      width: "100%",
      height: "8px",
      borderRadius: "4px",
      background: "linear-gradient(90deg, #10b981, #06b6d4)",
      outline: "none",
      WebkitAppearance: "none",
      cursor: "pointer",
      marginTop: "8px",
    },
    visualizationArea: {
      minHeight: "350px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      padding: "30px",
    },
    queueWrapper: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      width: "100%",
    },
    queueContainer: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "30px 20px",
      position: "relative",
      minHeight: "140px",
    },
    queueFrame: {
      position: "absolute",
      top: "50%",
      left: "0",
      right: "0",
      transform: "translateY(-50%)",
      height: "100px",
      border: "3px dashed #d1d5db",
      borderRadius: "16px",
      pointerEvents: "none",
    },
    element: (isHighlighted, isSearching) => ({
      width: "75px",
      height: "75px",
      borderRadius: "16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "1.5rem",
      fontWeight: "800",
      color: "white",
      background: isHighlighted
        ? "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)"
        : isSearching
          ? "linear-gradient(135deg, #f472b6 0%, #ec4899 100%)"
          : "linear-gradient(135deg, #34d399 0%, #10b981 50%, #059669 100%)",
      boxShadow: isHighlighted
        ? "0 8px 30px rgba(251, 191, 36, 0.5), 0 0 0 4px rgba(251, 191, 36, 0.3)"
        : isSearching
          ? "0 8px 30px rgba(236, 72, 153, 0.4)"
          : "0 6px 20px rgba(16, 185, 129, 0.35)",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      transform: isHighlighted ? "scale(1.15) translateY(-5px)" : "scale(1)",
      position: "relative",
      zIndex: isHighlighted ? 10 : 1,
    }),
    pointer: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "6px",
      position: "absolute",
      fontWeight: "700",
      fontSize: "0.8rem",
      letterSpacing: "0.05em",
    },
    frontPointer: {
      top: "-45px",
      left: "50%",
      transform: "translateX(-50%)",
      color: COLORS.primary,
    },
    rearPointer: {
      bottom: "-45px",
      left: "50%",
      transform: "translateX(-50%)",
      color: COLORS.info,
    },
    arrow: {
      width: 0,
      height: 0,
    },
    arrowDown: {
      borderLeft: "8px solid transparent",
      borderRight: "8px solid transparent",
      borderTop: "10px solid currentColor",
    },
    arrowUp: {
      borderLeft: "8px solid transparent",
      borderRight: "8px solid transparent",
      borderBottom: "10px solid currentColor",
    },
    emptyState: {
      textAlign: "center",
      color: "#94a3b8",
      padding: "50px 30px",
    },
    emptyIcon: {
      fontSize: "5rem",
      marginBottom: "20px",
      opacity: 0.6,
    },
    animatingElement: {
      position: "absolute",
      right: "-100px",
      width: "75px",
      height: "75px",
      borderRadius: "16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "1.5rem",
      fontWeight: "800",
      color: "white",
      background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
      boxShadow: "0 8px 30px rgba(251, 191, 36, 0.5)",
      zIndex: 20,
    },
    explanationBox: {
      background: "linear-gradient(135deg, #ecfdf5 0%, #f0fdfa 100%)",
      borderRadius: "14px",
      padding: "18px",
      marginTop: "20px",
      border: "2px solid #d1fae5",
    },
    resultBadge: (success) => ({
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      padding: "10px 18px",
      borderRadius: "25px",
      fontSize: "0.95rem",
      fontWeight: "700",
      background: success
        ? "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)"
        : "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
      color: success ? "#065f46" : "#991b1b",
      marginTop: "14px",
      boxShadow: success
        ? "0 2px 8px rgba(16, 185, 129, 0.2)"
        : "0 2px 8px rgba(239, 68, 68, 0.2)",
    }),
    legend: {
      display: "flex",
      flexWrap: "wrap",
      gap: "20px",
      marginTop: "20px",
      padding: "16px",
      background: "#f8fafc",
      borderRadius: "14px",
      justifyContent: "center",
    },
    legendItem: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      fontSize: "0.9rem",
      color: "#475569",
      fontWeight: "500",
    },
    legendColor: (gradient) => ({
      width: "24px",
      height: "24px",
      borderRadius: "8px",
      background: `linear-gradient(135deg, ${gradient[0]} 0%, ${gradient[1]} 100%)`,
      boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
    }),
    complexityBox: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "14px",
      marginBottom: "20px",
    },
    complexityItem: {
      background: "linear-gradient(135deg, #ecfdf5 0%, #f0fdfa 100%)",
      borderRadius: "12px",
      padding: "16px",
      textAlign: "center",
      border: "1px solid #d1fae5",
    },
    complexityLabel: {
      fontSize: "0.75rem",
      color: "#64748b",
      textTransform: "uppercase",
      letterSpacing: "0.1em",
      marginBottom: "6px",
      fontWeight: "600",
    },
    complexityValue: {
      fontSize: "1.4rem",
      fontWeight: "800",
      color: COLORS.primary,
    },
    eduSection: {
      marginBottom: "20px",
    },
    eduTitle: {
      fontSize: "0.95rem",
      fontWeight: "700",
      color: "#1e293b",
      marginBottom: "10px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    eduContent: {
      fontSize: "0.9rem",
      color: "#64748b",
      lineHeight: "1.7",
    },
    codeBlock: {
      background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
      borderRadius: "14px",
      padding: "18px",
      fontFamily: "'Fira Code', 'Consolas', 'Monaco', monospace",
      fontSize: "0.8rem",
      color: "#e2e8f0",
      overflow: "auto",
      lineHeight: "1.6",
      border: "1px solid #334155",
    },
    codeKeyword: { color: "#c084fc" },
    codeFunction: { color: "#67e8f9" },
    codeString: { color: "#86efac" },
    codeComment: { color: "#64748b" },
    historyList: {
      maxHeight: "200px",
      overflowY: "auto",
    },
    historyItem: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: "10px 14px",
      background: "#f8fafc",
      borderRadius: "10px",
      marginBottom: "8px",
      fontSize: "0.85rem",
      border: "1px solid #e2e8f0",
    },
    historyIcon: (success) => ({
      width: "10px",
      height: "10px",
      borderRadius: "50%",
      background: success ? COLORS.success : COLORS.danger,
      flexShrink: 0,
    }),
    tabButton: (active) => ({
      padding: "10px 18px",
      border: "none",
      background: active
        ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
        : "#f1f5f9",
      color: active ? "white" : "#64748b",
      borderRadius: "10px",
      cursor: "pointer",
      fontWeight: "600",
      fontSize: "0.85rem",
      transition: "all 0.3s ease",
      marginRight: "8px",
    }),
    indexLabel: {
      position: "absolute",
      bottom: "-25px",
      left: "50%",
      transform: "translateX(-50%)",
      fontSize: "0.7rem",
      color: "#94a3b8",
      fontWeight: "600",
    },
    capacityBar: {
      width: "100%",
      height: "8px",
      background: "#e2e8f0",
      borderRadius: "4px",
      overflow: "hidden",
      marginTop: "12px",
    },
    capacityFill: (percent) => ({
      height: "100%",
      width: `${percent}%`,
      background:
        percent > 80
          ? "linear-gradient(90deg, #f59e0b, #ef4444)"
          : "linear-gradient(90deg, #10b981, #06b6d4)",
      borderRadius: "4px",
      transition: "width 0.3s ease",
    }),
  };

  // Educational content
  const eduContent = {
    intuition:
      "A Queue follows the First-In-First-Out (FIFO) principle — like a line at a ticket counter. The first person who joins the line is the first to be served. Elements are added at the REAR and removed from the FRONT.",
    useCases: [
      "📋 Task scheduling in operating systems",
      "🖨️ Print job management",
      "🌐 Web server request handling",
      "🔍 Breadth-First Search (BFS) algorithm",
      "📬 Message queues in distributed systems",
      "⏳ Buffering in streaming applications",
    ],
    edgeCases: [
      "Queue Overflow: Enqueueing when full",
      "Queue Underflow: Dequeueing when empty",
      "Single element queue operations",
      "Circular queue wrap-around handling",
    ],
    implementations: [
      "Array-based (fixed size)",
      "Linked List-based (dynamic)",
      "Circular Queue (efficient space)",
      "Priority Queue (with ordering)",
      "Double-ended Queue (Deque)",
    ],
  };

  // Code snippets
  const codeSnippet = `class Queue {
  constructor(capacity = 10) {
    this.items = [];
    this.capacity = capacity;
  }

  enqueue(element) {
    if (this.isFull()) throw new Error("Queue Overflow");
    this.items.push(element);
  }

  dequeue() {
    if (this.isEmpty()) throw new Error("Queue Underflow");
    return this.items.shift();
  }

  front() {
    if (this.isEmpty()) return null;
    return this.items[0];
  }

  rear() {
    if (this.isEmpty()) return null;
    return this.items[this.items.length - 1];
  }

  isEmpty() { return this.items.length === 0; }
  isFull() { return this.items.length >= this.capacity; }
  size() { return this.items.length; }
}`;

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.title}>📋 Queue Visualizer</h1>
        <p style={styles.subtitle}>
          Master the First-In-First-Out (FIFO) data structure
        </p>
        <span style={styles.badge}>FAANG Interview Ready</span>
      </header>

      {/* Main Grid Layout */}
      <div style={styles.mainGrid}>
        {/* Left Panel - Controls */}
        <div>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>🎮 Control Panel</h2>

            {/* Input Field */}
            {needsInput && (
              <div>
                <label style={styles.label}>Enter Value (1-99)</label>
                <input
                  type="number"
                  placeholder="e.g., 42"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  style={styles.input}
                  min="1"
                  max="99"
                  disabled={isAnimating}
                />
              </div>
            )}

            {/* Operation Selector */}
            <label style={styles.label}>Select Operation</label>
            <select
              value={selectedOperation}
              onChange={(e) => setSelectedOperation(e.target.value)}
              style={styles.select}
              disabled={isAnimating}
            >
              {OPERATIONS.map((op) => (
                <option key={op.id} value={op.id}>
                  {op.name} — {op.description}
                </option>
              ))}
            </select>

            {/* Execute Button */}
            <button
              style={styles.button(COLORS.primary, isAnimating)}
              onClick={executeOperation}
              disabled={isAnimating}
            >
              {isAnimating ? "⏳ Executing..." : "▶️ Execute Operation"}
            </button>

            {/* Action Buttons */}
            <div style={styles.buttonGroup}>
              <button
                style={styles.smallButton(COLORS.secondary)}
                onClick={generateRandomData}
                disabled={isAnimating}
              >
                🎲 Random
              </button>
              <button
                style={styles.smallButton(COLORS.danger)}
                onClick={resetVisualization}
              >
                🔄 Reset
              </button>
            </div>

            {/* Speed Control */}
            <div style={styles.speedControl}>
              <label
                style={{
                  fontSize: "0.9rem",
                  color: "#475569",
                  display: "flex",
                  justifyContent: "space-between",
                  fontWeight: "600",
                }}
              >
                <span>⚡ Animation Speed</span>
                <span style={{ color: COLORS.primary }}>
                  {((2000 - speed) / 1000 + 0.5).toFixed(1)}x
                </span>
              </label>
              <input
                type="range"
                min="200"
                max="1800"
                value={2000 - speed}
                onChange={(e) => setSpeed(2000 - parseInt(e.target.value))}
                style={styles.slider}
              />
            </div>

            {/* Capacity Indicator */}
            <div style={{ marginTop: "16px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.85rem",
                  color: "#64748b",
                  fontWeight: "600",
                }}
              >
                <span>Capacity</span>
                <span>
                  {elements.length} / {MAX_ELEMENTS}
                </span>
              </div>
              <div style={styles.capacityBar}>
                <div
                  style={styles.capacityFill(
                    (elements.length / MAX_ELEMENTS) * 100,
                  )}
                />
              </div>
            </div>
          </div>

          {/* Complexity Card */}
          <div style={{ ...styles.card, marginTop: "20px" }}>
            <h2 style={styles.cardTitle}>⏱️ Operation Complexity</h2>
            <div style={styles.complexityBox}>
              <div style={styles.complexityItem}>
                <div style={styles.complexityLabel}>Time</div>
                <div style={styles.complexityValue}>
                  {currentComplexity.time}
                </div>
              </div>
              <div style={styles.complexityItem}>
                <div style={styles.complexityLabel}>Space</div>
                <div style={styles.complexityValue}>
                  {currentComplexity.space}
                </div>
              </div>
            </div>
            <p
              style={{
                fontSize: "0.85rem",
                color: "#64748b",
                margin: 0,
                textAlign: "center",
              }}
            >
              {currentComplexity.description}
            </p>
          </div>

          {/* History Card */}
          <div style={{ ...styles.card, marginTop: "20px" }}>
            <h2 style={styles.cardTitle}>📜 History</h2>
            <div style={styles.historyList}>
              {history.length === 0 ? (
                <p
                  style={{
                    color: "#94a3b8",
                    fontSize: "0.9rem",
                    textAlign: "center",
                    margin: 0,
                  }}
                >
                  No operations yet
                </p>
              ) : (
                history
                  .slice()
                  .reverse()
                  .map((h, i) => (
                    <div key={i} style={styles.historyItem}>
                      <span style={styles.historyIcon(h.success)} />
                      <span style={{ fontWeight: "600", color: "#1e293b" }}>
                        {h.operation}
                      </span>
                      {h.value !== null && h.value !== undefined && (
                        <span style={{ color: "#64748b" }}>
                          ({String(h.value)})
                        </span>
                      )}
                      <span
                        style={{
                          marginLeft: "auto",
                          fontSize: "0.75rem",
                          color: "#94a3b8",
                        }}
                      >
                        {h.timestamp}
                      </span>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>

        {/* Center Panel - Visualization */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>
            📋 Queue Visualization
            <span
              style={{
                marginLeft: "auto",
                fontSize: "0.9rem",
                color: "#64748b",
                fontWeight: "500",
                background: "#f1f5f9",
                padding: "6px 14px",
                borderRadius: "20px",
              }}
            >
              {elements.length === 0
                ? "Empty"
                : `${elements.length} element${elements.length > 1 ? "s" : ""}`}
            </span>
          </h2>

          <div style={styles.visualizationArea}>
            {elements.length === 0 && !animatingElement ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>📭</div>
                <p
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: "700",
                    color: "#64748b",
                    margin: "0 0 8px 0",
                  }}
                >
                  Queue is Empty
                </p>
                <p style={{ fontSize: "1rem", margin: 0 }}>
                  Use <strong>Enqueue</strong> to add elements or click{" "}
                  <strong>Random</strong>
                </p>
              </div>
            ) : (
              <div style={styles.queueWrapper}>
                {/* Direction Labels */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                    marginBottom: "10px",
                    padding: "0 20px",
                  }}
                >
                  <span
                    style={{
                      color: COLORS.primary,
                      fontWeight: "700",
                      fontSize: "0.85rem",
                      background: "#ecfdf5",
                      padding: "6px 14px",
                      borderRadius: "20px",
                    }}
                  >
                    ← DEQUEUE (Front)
                  </span>
                  <span
                    style={{
                      color: COLORS.info,
                      fontWeight: "700",
                      fontSize: "0.85rem",
                      background: "#eff6ff",
                      padding: "6px 14px",
                      borderRadius: "20px",
                    }}
                  >
                    ENQUEUE (Rear) →
                  </span>
                </div>

                {/* Queue Elements */}
                <div style={styles.queueContainer}>
                  <div style={styles.queueFrame} />

                  {elements.map((el, index) => (
                    <div
                      key={el.id}
                      style={{
                        ...styles.element(
                          highlightedIndex === index,
                          searchingIndex === index &&
                            highlightedIndex !== index,
                        ),
                        animation:
                          index === 0 && animationType === "dequeue"
                            ? "slideOutLeft 0.4s ease forwards"
                            : animationType === "shift"
                              ? "shiftLeft 0.3s ease"
                              : "fadeInScale 0.3s ease",
                      }}
                    >
                      {el.value}

                      {/* Index Label */}
                      <span style={styles.indexLabel}>[{index}]</span>

                      {/* Front Pointer */}
                      {index === 0 && (
                        <div
                          style={{ ...styles.pointer, ...styles.frontPointer }}
                        >
                          <span>FRONT</span>
                          <span
                            style={{
                              ...styles.arrow,
                              ...styles.arrowDown,
                              color: COLORS.primary,
                            }}
                          />
                        </div>
                      )}

                      {/* Rear Pointer */}
                      {index === elements.length - 1 && (
                        <div
                          style={{ ...styles.pointer, ...styles.rearPointer }}
                        >
                          <span
                            style={{
                              ...styles.arrow,
                              ...styles.arrowUp,
                              color: COLORS.info,
                            }}
                          />
                          <span>REAR</span>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Animating Element for Enqueue */}
                  {animatingElement && animationType?.startsWith("enqueue") && (
                    <div
                      style={{
                        ...styles.animatingElement,
                        animation:
                          animationType === "enqueue-prepare"
                            ? "slideInFromRight 0.4s ease forwards"
                            : animationType === "enqueue-insert"
                              ? "insertIntoQueue 0.4s ease forwards"
                              : "none",
                      }}
                    >
                      {animatingElement.value}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Legend */}
          <div style={styles.legend}>
            <div style={styles.legendItem}>
              <div style={styles.legendColor(["#34d399", "#059669"])} />
              <span>Normal Element</span>
            </div>
            <div style={styles.legendItem}>
              <div style={styles.legendColor(["#fbbf24", "#f59e0b"])} />
              <span>Active / Highlighted</span>
            </div>
            <div style={styles.legendItem}>
              <div style={styles.legendColor(["#f472b6", "#ec4899"])} />
              <span>Searching</span>
            </div>
            <div style={styles.legendItem}>
              <span style={{ fontWeight: "800", color: COLORS.primary }}>
                ●
              </span>
              <span>FRONT Pointer</span>
            </div>
            <div style={styles.legendItem}>
              <span style={{ fontWeight: "800", color: COLORS.info }}>●</span>
              <span>REAR Pointer</span>
            </div>
          </div>

          {/* Explanation Box */}
          <div style={styles.explanationBox}>
            <h3
              style={{
                margin: "0 0 10px 0",
                fontSize: "1rem",
                color: "#065f46",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              💡 Status
            </h3>
            <p
              style={{
                margin: 0,
                color: "#047857",
                fontSize: "1rem",
                lineHeight: "1.6",
              }}
            >
              {explanation}
            </p>
            {result && (
              <div style={styles.resultBadge(result.success)}>
                {result.success ? "✓" : "✗"} {result.message}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Educational Content */}
        <div>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>🎓 Learning Hub</h2>

            {/* Tab Buttons */}
            <div style={{ marginBottom: "20px" }}>
              <button
                style={styles.tabButton(!showCode)}
                onClick={() => setShowCode(false)}
              >
                📖 Concepts
              </button>
              <button
                style={styles.tabButton(showCode)}
                onClick={() => setShowCode(true)}
              >
                💻 Code
              </button>
            </div>

            {!showCode ? (
              <>
                {/* Intuition Section */}
                <div style={styles.eduSection}>
                  <h3 style={styles.eduTitle}>💭 Intuition</h3>
                  <p style={styles.eduContent}>{eduContent.intuition}</p>
                </div>

                {/* FIFO Visualization */}
                <div style={styles.eduSection}>
                  <h3 style={styles.eduTitle}>🔄 FIFO Principle</h3>
                  <div
                    style={{
                      background:
                        "linear-gradient(135deg, #ecfdf5 0%, #f0fdfa 100%)",
                      borderRadius: "12px",
                      padding: "16px",
                      textAlign: "center",
                      border: "2px solid #d1fae5",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "12px",
                      }}
                    >
                      <span style={{ fontSize: "1.5rem" }}>🚪</span>
                      <span
                        style={{ fontWeight: "700", color: COLORS.primary }}
                      >
                        FRONT
                      </span>
                      <span style={{ color: "#64748b" }}>
                        → Elements exit here
                      </span>
                    </div>
                    <div style={{ margin: "10px 0", color: "#94a3b8" }}>
                      • • •
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "12px",
                      }}
                    >
                      <span style={{ fontSize: "1.5rem" }}>📥</span>
                      <span style={{ fontWeight: "700", color: COLORS.info }}>
                        REAR
                      </span>
                      <span style={{ color: "#64748b" }}>
                        → Elements enter here
                      </span>
                    </div>
                  </div>
                </div>

                {/* Use Cases */}
                <div style={styles.eduSection}>
                  <h3 style={styles.eduTitle}>🎯 Real-World Applications</h3>
                  <ul
                    style={{
                      ...styles.eduContent,
                      paddingLeft: "0",
                      margin: 0,
                      listStyle: "none",
                    }}
                  >
                    {eduContent.useCases.map((useCase, i) => (
                      <li
                        key={i}
                        style={{
                          marginBottom: "8px",
                          padding: "8px 12px",
                          background: "#f8fafc",
                          borderRadius: "8px",
                        }}
                      >
                        {useCase}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Complexity Table */}
                <div style={styles.eduSection}>
                  <h3 style={styles.eduTitle}>📊 All Operations Complexity</h3>
                  <div style={{ overflowX: "auto" }}>
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: "0.85rem",
                      }}
                    >
                      <thead>
                        <tr>
                          <th
                            style={{
                              background:
                                "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                              color: "white",
                              padding: "12px 10px",
                              textAlign: "left",
                              borderRadius: "8px 0 0 0",
                            }}
                          >
                            Operation
                          </th>
                          <th
                            style={{
                              background:
                                "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                              color: "white",
                              padding: "12px 10px",
                              textAlign: "center",
                            }}
                          >
                            Time
                          </th>
                          <th
                            style={{
                              background:
                                "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                              color: "white",
                              padding: "12px 10px",
                              textAlign: "center",
                              borderRadius: "0 8px 0 0",
                            }}
                          >
                            Space
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(COMPLEXITY).map(([op, data], i) => (
                          <tr
                            key={op}
                            style={{
                              background: i % 2 === 0 ? "#f8fafc" : "white",
                            }}
                          >
                            <td
                              style={{
                                padding: "10px",
                                borderBottom: "1px solid #e2e8f0",
                                fontWeight: "600",
                              }}
                            >
                              {op.charAt(0).toUpperCase() + op.slice(1)}
                            </td>
                            <td
                              style={{
                                padding: "10px",
                                borderBottom: "1px solid #e2e8f0",
                                textAlign: "center",
                                fontFamily: "monospace",
                                fontWeight: "700",
                                color: COLORS.primary,
                              }}
                            >
                              {data.time}
                            </td>
                            <td
                              style={{
                                padding: "10px",
                                borderBottom: "1px solid #e2e8f0",
                                textAlign: "center",
                                fontFamily: "monospace",
                                fontWeight: "700",
                                color: COLORS.info,
                              }}
                            >
                              {data.space}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Edge Cases */}
                <div style={styles.eduSection}>
                  <h3 style={styles.eduTitle}>⚠️ Edge Cases to Handle</h3>
                  <ul
                    style={{
                      ...styles.eduContent,
                      paddingLeft: "0",
                      margin: 0,
                      listStyle: "none",
                    }}
                  >
                    {eduContent.edgeCases.map((ec, i) => (
                      <li
                        key={i}
                        style={{
                          marginBottom: "8px",
                          padding: "8px 12px",
                          background:
                            i === 0 || i === 1 ? "#fef2f2" : "#f8fafc",
                          borderRadius: "8px",
                          borderLeft: `3px solid ${i === 0 || i === 1 ? COLORS.danger : COLORS.info}`,
                        }}
                      >
                        {ec}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Implementation Types */}
                <div style={styles.eduSection}>
                  <h3 style={styles.eduTitle}>🏗️ Implementation Variants</h3>
                  <div
                    style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}
                  >
                    {eduContent.implementations.map((impl, i) => (
                      <span
                        key={i}
                        style={{
                          padding: "6px 12px",
                          background:
                            "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
                          borderRadius: "20px",
                          fontSize: "0.8rem",
                          fontWeight: "600",
                          color: "#065f46",
                        }}
                      >
                        {impl}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              /* Code Tab */
              <div style={styles.eduSection}>
                <h3 style={styles.eduTitle}>💻 JavaScript Implementation</h3>
                <pre style={styles.codeBlock}>{codeSnippet}</pre>

                <h3 style={{ ...styles.eduTitle, marginTop: "20px" }}>
                  📝 Usage Example
                </h3>
                <pre style={styles.codeBlock}>{`const queue = new Queue(10);

queue.enqueue(5);   // [5]
queue.enqueue(10);  // [5, 10]
queue.enqueue(15);  // [5, 10, 15]

queue.front();      // Returns 5
queue.rear();       // Returns 15
queue.dequeue();    // Returns 5, queue: [10, 15]
queue.size();       // Returns 2
queue.isEmpty();    // Returns false`}</pre>

                <h3 style={{ ...styles.eduTitle, marginTop: "20px" }}>
                  🔑 Key Points
                </h3>
                <ul
                  style={{
                    ...styles.eduContent,
                    paddingLeft: "20px",
                    margin: 0,
                  }}
                >
                  <li>
                    Array <code>shift()</code> is O(n) — use circular queue for
                    true O(1)
                  </li>
                  <li>Linked list implementation provides dynamic sizing</li>
                  <li>Always check for overflow/underflow conditions</li>
                  <li>
                    Consider using two stacks for queue (interview question!)
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes slideOutLeft {
          from {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
          to {
            opacity: 0;
            transform: translateX(-120px) scale(0.6);
          }
        }
        
        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes insertIntoQueue {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-83px);
          }
        }
        
        @keyframes shiftLeft {
          from {
            transform: translateX(83px);
          }
          to {
            transform: translateX(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        
        @keyframes glow {
          0%, 100% {
            box-shadow: 0 0 5px rgba(16, 185, 129, 0.5);
          }
          50% {
            box-shadow: 0 0 20px rgba(16, 185, 129, 0.8);
          }
        }
        
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
          border: 3px solid white;
        }
        
        input[type="range"]::-moz-range-thumb {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
        }
        
        input:focus {
          border-color: #10b981 !important;
          box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15) !important;
        }
        
        select:focus {
          border-color: #10b981 !important;
          box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15) !important;
        }
        
        button:hover:not(:disabled) {
          transform: translateY(-2px);
          filter: brightness(1.05);
        }
        
        button:active:not(:disabled) {
          transform: translateY(0);
        }
        
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
        }
        
        code {
          background: #f1f5f9;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'Fira Code', monospace;
          font-size: 0.85em;
          color: #0f766e;
        }
        
        @media (max-width: 1400px) {
          .mainGrid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        
        @media (max-width: 900px) {
          .mainGrid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
