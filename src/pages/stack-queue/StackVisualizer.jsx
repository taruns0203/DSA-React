/**
 * Stack & Queue Complete Visualizer
 * A polished educational tool for understanding Stack and Queue data structures
 * Features: Interactive operations, step-by-step execution, auto-play, animations
 * Suitable for FAANG interview preparation
 */

import React, { useState, useEffect, useRef, useCallback } from "react";

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const MAX_ELEMENTS = 10;
const DEFAULT_SPEED = 1000;

// Color palette for vibrant UI
const COLORS = {
  primary: "#6366f1", // Indigo
  secondary: "#8b5cf6", // Purple
  success: "#10b981", // Emerald
  warning: "#f59e0b", // Amber
  danger: "#ef4444", // Red
  info: "#06b6d4", // Cyan
  highlight: "#fbbf24", // Yellow
  stackGradient: ["#818cf8", "#6366f1", "#4f46e5"],
  queueGradient: ["#34d399", "#10b981", "#059669"],
};

// Operations available for each data structure
const OPERATIONS = {
  stack: [
    { id: "push", name: "Push", description: "Add element to top" },
    { id: "pop", name: "Pop", description: "Remove element from top" },
    { id: "peek", name: "Peek", description: "View top element" },
    { id: "isEmpty", name: "Is Empty", description: "Check if stack is empty" },
    { id: "search", name: "Search", description: "Find element in stack" },
    { id: "size", name: "Size", description: "Get stack size" },
  ],
  queue: [
    { id: "enqueue", name: "Enqueue", description: "Add element to rear" },
    {
      id: "dequeue",
      name: "Dequeue",
      description: "Remove element from front",
    },
    { id: "front", name: "Front", description: "View front element" },
    { id: "rear", name: "Rear", description: "View rear element" },
    { id: "isEmpty", name: "Is Empty", description: "Check if queue is empty" },
    { id: "search", name: "Search", description: "Find element in queue" },
    { id: "size", name: "Size", description: "Get queue size" },
  ],
};

// Complexity information for each operation
const COMPLEXITY = {
  stack: {
    push: { time: "O(1)", space: "O(1)" },
    pop: { time: "O(1)", space: "O(1)" },
    peek: { time: "O(1)", space: "O(1)" },
    isEmpty: { time: "O(1)", space: "O(1)" },
    search: { time: "O(n)", space: "O(1)" },
    size: { time: "O(1)", space: "O(1)" },
  },
  queue: {
    enqueue: { time: "O(1)", space: "O(1)" },
    dequeue: { time: "O(1)", space: "O(1)" },
    front: { time: "O(1)", space: "O(1)" },
    rear: { time: "O(1)", space: "O(1)" },
    isEmpty: { time: "O(1)", space: "O(1)" },
    search: { time: "O(n)", space: "O(1)" },
    size: { time: "O(1)", space: "O(1)" },
  },
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function StackVisualizer() {
  // State management
  const [dataStructure, setDataStructure] = useState("stack"); // 'stack' or 'queue'
  const [elements, setElements] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [selectedOperation, setSelectedOperation] = useState("push");
  const [isAnimating, setIsAnimating] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [stepMode, setStepMode] = useState(false);
  const [speed, setSpeed] = useState(DEFAULT_SPEED);
  const [currentStep, setCurrentStep] = useState(null);
  const [explanation, setExplanation] = useState(
    "Select an operation and click Execute to begin.",
  );
  const [highlightedIndex, setHighlightedIndex] = useState(null);
  const [animatingElement, setAnimatingElement] = useState(null);
  const [animationType, setAnimationType] = useState(null);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [searchIndex, setSearchIndex] = useState(-1);

  // Refs for auto-play
  const autoPlayRef = useRef(null);
  const stepQueueRef = useRef([]);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  // Generate random value between 1 and 99
  const generateRandomValue = () => Math.floor(Math.random() * 99) + 1;

  // Generate random dataset
  const generateRandomData = () => {
    if (isAnimating) return;
    const count = Math.floor(Math.random() * 5) + 3; // 3-7 elements
    const newElements = Array.from({ length: count }, () => ({
      value: generateRandomValue(),
      id: Date.now() + Math.random(),
    }));
    setElements(newElements);
    setExplanation(`Generated ${count} random elements.`);
    setResult(null);
    setHighlightedIndex(null);
  };

  // Reset visualization
  const resetVisualization = () => {
    if (isAnimating) {
      setAutoPlay(false);
      clearTimeout(autoPlayRef.current);
    }
    setElements([]);
    setInputValue("");
    setCurrentStep(null);
    setExplanation("Visualization reset. Ready for new operations.");
    setHighlightedIndex(null);
    setAnimatingElement(null);
    setAnimationType(null);
    setResult(null);
    setHistory([]);
    setSearchIndex(-1);
    setIsAnimating(false);
  };

  // Add to history
  const addToHistory = (operation, value, success) => {
    setHistory((prev) => [
      ...prev.slice(-9),
      { operation, value, success, timestamp: Date.now() },
    ]);
  };

  // ============================================================================
  // STACK OPERATIONS
  // ============================================================================

  const stackPush = async (value) => {
    if (elements.length >= MAX_ELEMENTS) {
      setExplanation("❌ Stack Overflow! Cannot push - stack is full.");
      setResult({ success: false, message: "Stack Overflow" });
      addToHistory("push", value, false);
      return;
    }

    setExplanation(`📥 Pushing ${value} onto the stack...`);
    setAnimatingElement({ value, id: Date.now() });
    setAnimationType("push");

    await sleep(speed * 0.5);

    setElements((prev) => [...prev, { value, id: Date.now() }]);
    setAnimatingElement(null);
    setAnimationType(null);
    setHighlightedIndex(elements.length);

    await sleep(speed * 0.3);

    setExplanation(`✅ Successfully pushed ${value}. New top of stack.`);
    setResult({ success: true, message: `Pushed ${value}` });
    addToHistory("push", value, true);

    await sleep(speed * 0.2);
    setHighlightedIndex(null);
  };

  const stackPop = async () => {
    if (elements.length === 0) {
      setExplanation("❌ Stack Underflow! Cannot pop - stack is empty.");
      setResult({ success: false, message: "Stack Underflow" });
      addToHistory("pop", null, false);
      return;
    }

    const topElement = elements[elements.length - 1];
    setHighlightedIndex(elements.length - 1);
    setExplanation(`📤 Popping ${topElement.value} from the stack...`);

    await sleep(speed * 0.5);

    setAnimationType("pop");

    await sleep(speed * 0.3);

    setElements((prev) => prev.slice(0, -1));
    setAnimationType(null);
    setHighlightedIndex(null);

    setExplanation(`✅ Successfully popped ${topElement.value}.`);
    setResult({
      success: true,
      message: `Popped ${topElement.value}`,
      value: topElement.value,
    });
    addToHistory("pop", topElement.value, true);
  };

  const stackPeek = async () => {
    if (elements.length === 0) {
      setExplanation("❌ Stack is empty! Nothing to peek.");
      setResult({ success: false, message: "Stack Empty" });
      addToHistory("peek", null, false);
      return;
    }

    const topElement = elements[elements.length - 1];
    setHighlightedIndex(elements.length - 1);
    setExplanation(`👁️ Peeking at top element: ${topElement.value}`);

    await sleep(speed);

    setExplanation(`✅ Top element is ${topElement.value}. Stack unchanged.`);
    setResult({
      success: true,
      message: `Top: ${topElement.value}`,
      value: topElement.value,
    });
    addToHistory("peek", topElement.value, true);

    await sleep(speed * 0.5);
    setHighlightedIndex(null);
  };

  const stackSearch = async (value) => {
    if (elements.length === 0) {
      setExplanation("❌ Stack is empty! Nothing to search.");
      setResult({ success: false, message: "Stack Empty" });
      addToHistory("search", value, false);
      return;
    }

    setExplanation(`🔍 Searching for ${value} from top of stack...`);

    // Search from top to bottom
    for (let i = elements.length - 1; i >= 0; i--) {
      setHighlightedIndex(i);
      setSearchIndex(i);
      setExplanation(
        `🔍 Checking position ${elements.length - i} (value: ${elements[i].value})...`,
      );

      await sleep(speed * 0.5);

      if (elements[i].value === value) {
        setExplanation(
          `✅ Found ${value} at position ${elements.length - i} from top!`,
        );
        setResult({
          success: true,
          message: `Found at position ${elements.length - i}`,
          value,
        });
        addToHistory("search", value, true);

        await sleep(speed);
        setHighlightedIndex(null);
        setSearchIndex(-1);
        return;
      }
    }

    setHighlightedIndex(null);
    setSearchIndex(-1);
    setExplanation(`❌ ${value} not found in stack.`);
    setResult({ success: false, message: "Not Found" });
    addToHistory("search", value, false);
  };

  // ============================================================================
  // QUEUE OPERATIONS
  // ============================================================================

  const queueEnqueue = async (value) => {
    if (elements.length >= MAX_ELEMENTS) {
      setExplanation("❌ Queue Overflow! Cannot enqueue - queue is full.");
      setResult({ success: false, message: "Queue Overflow" });
      addToHistory("enqueue", value, false);
      return;
    }

    setExplanation(`📥 Enqueueing ${value} at the rear...`);
    setAnimatingElement({ value, id: Date.now() });
    setAnimationType("enqueue");

    await sleep(speed * 0.5);

    setElements((prev) => [...prev, { value, id: Date.now() }]);
    setAnimatingElement(null);
    setAnimationType(null);
    setHighlightedIndex(elements.length);

    await sleep(speed * 0.3);

    setExplanation(`✅ Successfully enqueued ${value} at rear.`);
    setResult({ success: true, message: `Enqueued ${value}` });
    addToHistory("enqueue", value, true);

    await sleep(speed * 0.2);
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
    setHighlightedIndex(0);
    setExplanation(`📤 Dequeueing ${frontElement.value} from front...`);

    await sleep(speed * 0.5);

    setAnimationType("dequeue");

    await sleep(speed * 0.3);

    setElements((prev) => prev.slice(1));
    setAnimationType(null);
    setHighlightedIndex(null);

    setExplanation(`✅ Successfully dequeued ${frontElement.value}.`);
    setResult({
      success: true,
      message: `Dequeued ${frontElement.value}`,
      value: frontElement.value,
    });
    addToHistory("dequeue", frontElement.value, true);
  };

  const queueFront = async () => {
    if (elements.length === 0) {
      setExplanation("❌ Queue is empty! No front element.");
      setResult({ success: false, message: "Queue Empty" });
      addToHistory("front", null, false);
      return;
    }

    const frontElement = elements[0];
    setHighlightedIndex(0);
    setExplanation(`👁️ Viewing front element: ${frontElement.value}`);

    await sleep(speed);

    setExplanation(
      `✅ Front element is ${frontElement.value}. Queue unchanged.`,
    );
    setResult({
      success: true,
      message: `Front: ${frontElement.value}`,
      value: frontElement.value,
    });
    addToHistory("front", frontElement.value, true);

    await sleep(speed * 0.5);
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
    setHighlightedIndex(elements.length - 1);
    setExplanation(`👁️ Viewing rear element: ${rearElement.value}`);

    await sleep(speed);

    setExplanation(`✅ Rear element is ${rearElement.value}. Queue unchanged.`);
    setResult({
      success: true,
      message: `Rear: ${rearElement.value}`,
      value: rearElement.value,
    });
    addToHistory("rear", rearElement.value, true);

    await sleep(speed * 0.5);
    setHighlightedIndex(null);
  };

  const queueSearch = async (value) => {
    if (elements.length === 0) {
      setExplanation("❌ Queue is empty! Nothing to search.");
      setResult({ success: false, message: "Queue Empty" });
      addToHistory("search", value, false);
      return;
    }

    setExplanation(`🔍 Searching for ${value} from front...`);

    for (let i = 0; i < elements.length; i++) {
      setHighlightedIndex(i);
      setSearchIndex(i);
      setExplanation(
        `🔍 Checking position ${i + 1} (value: ${elements[i].value})...`,
      );

      await sleep(speed * 0.5);

      if (elements[i].value === value) {
        setExplanation(`✅ Found ${value} at position ${i + 1} from front!`);
        setResult({
          success: true,
          message: `Found at position ${i + 1}`,
          value,
        });
        addToHistory("search", value, true);

        await sleep(speed);
        setHighlightedIndex(null);
        setSearchIndex(-1);
        return;
      }
    }

    setHighlightedIndex(null);
    setSearchIndex(-1);
    setExplanation(`❌ ${value} not found in queue.`);
    setResult({ success: false, message: "Not Found" });
    addToHistory("search", value, false);
  };

  // ============================================================================
  // COMMON OPERATIONS
  // ============================================================================

  const checkIsEmpty = async () => {
    const isEmpty = elements.length === 0;
    setExplanation(
      isEmpty
        ? `✅ ${dataStructure === "stack" ? "Stack" : "Queue"} is empty.`
        : `✅ ${dataStructure === "stack" ? "Stack" : "Queue"} is not empty. Contains ${elements.length} element(s).`,
    );
    setResult({
      success: true,
      message: isEmpty ? "Empty" : "Not Empty",
      value: isEmpty,
    });
    addToHistory("isEmpty", null, true);
  };

  const getSize = async () => {
    setExplanation(
      `✅ ${dataStructure === "stack" ? "Stack" : "Queue"} size: ${elements.length}`,
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

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const executeOperation = async () => {
    if (isAnimating) return;

    setIsAnimating(true);
    setResult(null);

    const value = inputValue ? parseInt(inputValue, 10) : null;

    try {
      if (dataStructure === "stack") {
        switch (selectedOperation) {
          case "push":
            if (value === null || isNaN(value)) {
              setExplanation("⚠️ Please enter a valid number to push.");
              setResult({ success: false, message: "Invalid Input" });
            } else {
              await stackPush(value);
            }
            break;
          case "pop":
            await stackPop();
            break;
          case "peek":
            await stackPeek();
            break;
          case "isEmpty":
            await checkIsEmpty();
            break;
          case "search":
            if (value === null || isNaN(value)) {
              setExplanation("⚠️ Please enter a valid number to search.");
              setResult({ success: false, message: "Invalid Input" });
            } else {
              await stackSearch(value);
            }
            break;
          case "size":
            await getSize();
            break;
          default:
            break;
        }
      } else {
        switch (selectedOperation) {
          case "enqueue":
            if (value === null || isNaN(value)) {
              setExplanation("⚠️ Please enter a valid number to enqueue.");
              setResult({ success: false, message: "Invalid Input" });
            } else {
              await queueEnqueue(value);
            }
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
          case "search":
            if (value === null || isNaN(value)) {
              setExplanation("⚠️ Please enter a valid number to search.");
              setResult({ success: false, message: "Invalid Input" });
            } else {
              await queueSearch(value);
            }
            break;
          case "size":
            await getSize();
            break;
          default:
            break;
        }
      }
    } finally {
      setIsAnimating(false);
      setInputValue("");
    }
  };

  // Update selected operation when data structure changes
  useEffect(() => {
    setSelectedOperation(dataStructure === "stack" ? "push" : "enqueue");
    setExplanation(
      `Switched to ${dataStructure === "stack" ? "Stack" : "Queue"} visualization.`,
    );
    setResult(null);
    setHighlightedIndex(null);
  }, [dataStructure]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const needsInput = ["push", "enqueue", "search"].includes(selectedOperation);
  const currentComplexity = COMPLEXITY[dataStructure][selectedOperation];

  // ============================================================================
  // COMPONENT STYLES (CSS-in-JS)
  // ============================================================================

  const styles = {
    container: {
      minHeight: "100vh",
      background:
        "linear-gradient(135deg, #f0f9ff 0%, #faf5ff 50%, #fff1f2 100%)",
      fontFamily:
        "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      padding: "20px",
      boxSizing: "border-box",
    },
    header: {
      textAlign: "center",
      marginBottom: "24px",
    },
    title: {
      fontSize: "2.5rem",
      fontWeight: "800",
      background:
        "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
      margin: "0 0 8px 0",
    },
    subtitle: {
      color: "#64748b",
      fontSize: "1.1rem",
      margin: 0,
    },
    mainGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1.5fr 1fr",
      gap: "20px",
      maxWidth: "1600px",
      margin: "0 auto",
    },
    card: {
      background: "white",
      borderRadius: "20px",
      padding: "24px",
      boxShadow:
        "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      border: "1px solid rgba(255, 255, 255, 0.8)",
    },
    cardTitle: {
      fontSize: "1.1rem",
      fontWeight: "700",
      color: "#1e293b",
      marginBottom: "16px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    dsSelector: {
      display: "flex",
      gap: "12px",
      marginBottom: "20px",
    },
    dsButton: (active, color) => ({
      flex: 1,
      padding: "14px 20px",
      border: "none",
      borderRadius: "12px",
      fontSize: "1rem",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
      background: active
        ? `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`
        : "#f1f5f9",
      color: active ? "white" : "#64748b",
      boxShadow: active ? `0 4px 14px ${color}40` : "none",
      transform: active ? "scale(1.02)" : "scale(1)",
    }),
    input: {
      width: "100%",
      padding: "12px 16px",
      border: "2px solid #e2e8f0",
      borderRadius: "10px",
      fontSize: "1rem",
      outline: "none",
      transition: "border-color 0.3s ease",
      boxSizing: "border-box",
      marginBottom: "12px",
    },
    select: {
      width: "100%",
      padding: "12px 16px",
      border: "2px solid #e2e8f0",
      borderRadius: "10px",
      fontSize: "1rem",
      outline: "none",
      cursor: "pointer",
      background: "white",
      marginBottom: "12px",
    },
    button: (color, disabled) => ({
      width: "100%",
      padding: "14px 20px",
      border: "none",
      borderRadius: "12px",
      fontSize: "1rem",
      fontWeight: "600",
      cursor: disabled ? "not-allowed" : "pointer",
      transition: "all 0.3s ease",
      background: disabled
        ? "#e2e8f0"
        : `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
      color: disabled ? "#94a3b8" : "white",
      boxShadow: disabled ? "none" : `0 4px 14px ${color}40`,
      marginBottom: "10px",
    }),
    buttonGroup: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "10px",
      marginTop: "12px",
    },
    smallButton: (color) => ({
      padding: "10px 16px",
      border: "none",
      borderRadius: "10px",
      fontSize: "0.9rem",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
      background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
      color: "white",
    }),
    speedControl: {
      marginTop: "16px",
    },
    slider: {
      width: "100%",
      height: "6px",
      borderRadius: "3px",
      background: "#e2e8f0",
      outline: "none",
      WebkitAppearance: "none",
      cursor: "pointer",
    },
    visualizationArea: {
      minHeight: "400px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    },
    stackContainer: {
      display: "flex",
      flexDirection: "column-reverse",
      alignItems: "center",
      gap: "4px",
      padding: "20px",
      minWidth: "200px",
    },
    queueContainer: {
      display: "flex",
      alignItems: "center",
      gap: "4px",
      padding: "20px",
      overflowX: "auto",
      maxWidth: "100%",
    },
    element: (index, isHighlighted, isStack, total) => ({
      width: isStack ? "120px" : "70px",
      height: isStack ? "50px" : "70px",
      borderRadius: "12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "1.3rem",
      fontWeight: "700",
      color: "white",
      background: isHighlighted
        ? `linear-gradient(135deg, ${COLORS.warning} 0%, ${COLORS.highlight} 100%)`
        : isStack
          ? `linear-gradient(135deg, ${COLORS.stackGradient[0]} 0%, ${COLORS.stackGradient[2]} 100%)`
          : `linear-gradient(135deg, ${COLORS.queueGradient[0]} 0%, ${COLORS.queueGradient[2]} 100%)`,
      boxShadow: isHighlighted
        ? `0 8px 25px ${COLORS.warning}60, 0 0 0 3px ${COLORS.highlight}`
        : "0 4px 15px rgba(0, 0, 0, 0.15)",
      transition: "all 0.3s ease",
      transform: isHighlighted ? "scale(1.1)" : "scale(1)",
      position: "relative",
    }),
    pointer: (color, position) => ({
      position: "absolute",
      [position]: "-40px",
      display: "flex",
      alignItems: "center",
      gap: "4px",
      color: color,
      fontWeight: "600",
      fontSize: "0.8rem",
    }),
    pointerArrow: {
      width: "0",
      height: "0",
    },
    emptyState: {
      textAlign: "center",
      color: "#94a3b8",
      padding: "40px",
    },
    emptyIcon: {
      fontSize: "4rem",
      marginBottom: "16px",
    },
    explanationBox: {
      background: "linear-gradient(135deg, #f0f9ff 0%, #faf5ff 100%)",
      borderRadius: "12px",
      padding: "16px",
      marginTop: "16px",
      border: "1px solid #e2e8f0",
    },
    resultBadge: (success) => ({
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      padding: "8px 16px",
      borderRadius: "20px",
      fontSize: "0.9rem",
      fontWeight: "600",
      background: success
        ? "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)"
        : "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
      color: success ? "#065f46" : "#991b1b",
      marginTop: "12px",
    }),
    complexityBox: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "12px",
      marginTop: "12px",
    },
    complexityItem: {
      background: "linear-gradient(135deg, #faf5ff 0%, #f0f9ff 100%)",
      borderRadius: "10px",
      padding: "12px",
      textAlign: "center",
    },
    complexityLabel: {
      fontSize: "0.75rem",
      color: "#64748b",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      marginBottom: "4px",
    },
    complexityValue: {
      fontSize: "1.2rem",
      fontWeight: "700",
      color: "#6366f1",
    },
    legend: {
      display: "flex",
      flexWrap: "wrap",
      gap: "16px",
      marginTop: "16px",
      padding: "12px",
      background: "#f8fafc",
      borderRadius: "10px",
    },
    legendItem: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontSize: "0.85rem",
      color: "#475569",
    },
    legendColor: (color) => ({
      width: "20px",
      height: "20px",
      borderRadius: "6px",
      background: `linear-gradient(135deg, ${color[0]} 0%, ${color[1]} 100%)`,
    }),
    eduSection: {
      marginTop: "16px",
    },
    eduTitle: {
      fontSize: "0.9rem",
      fontWeight: "700",
      color: "#1e293b",
      marginBottom: "8px",
      display: "flex",
      alignItems: "center",
      gap: "6px",
    },
    eduContent: {
      fontSize: "0.85rem",
      color: "#64748b",
      lineHeight: "1.6",
    },
    codeBlock: {
      background: "#1e293b",
      borderRadius: "10px",
      padding: "12px",
      marginTop: "12px",
      fontFamily: "'Fira Code', 'Consolas', monospace",
      fontSize: "0.8rem",
      color: "#e2e8f0",
      overflow: "auto",
    },
    complexityTable: {
      width: "100%",
      borderCollapse: "collapse",
      marginTop: "12px",
      fontSize: "0.85rem",
    },
    tableHeader: {
      background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
      color: "white",
      padding: "10px",
      textAlign: "left",
      fontWeight: "600",
    },
    tableCell: {
      padding: "10px",
      borderBottom: "1px solid #e2e8f0",
      color: "#475569",
    },
    historyItem: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "8px 12px",
      background: "#f8fafc",
      borderRadius: "8px",
      marginBottom: "6px",
      fontSize: "0.85rem",
    },
    historyIcon: (success) => ({
      width: "8px",
      height: "8px",
      borderRadius: "50%",
      background: success ? COLORS.success : COLORS.danger,
    }),
    tabContainer: {
      display: "flex",
      gap: "8px",
      marginBottom: "16px",
      borderBottom: "2px solid #e2e8f0",
      paddingBottom: "8px",
    },
    tab: (active) => ({
      padding: "8px 16px",
      border: "none",
      background: active ? "#6366f1" : "transparent",
      color: active ? "white" : "#64748b",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "600",
      fontSize: "0.85rem",
      transition: "all 0.3s ease",
    }),
  };

  // Educational content based on data structure
  const getEducationalContent = () => {
    if (dataStructure === "stack") {
      return {
        intuition:
          "A Stack is like a pile of plates - you can only add or remove from the top. This Last-In-First-Out (LIFO) principle makes stacks perfect for tracking function calls, undo operations, and parsing expressions.",
        useCases: [
          "Function call stack in programming",
          "Undo/Redo functionality",
          "Browser back button history",
          "Expression evaluation & parsing",
          "Depth-First Search (DFS)",
        ],
        edgeCases: [
          "Stack Overflow: Attempting to push when full",
          "Stack Underflow: Attempting to pop when empty",
          "Single element stack operations",
          "Memory allocation for dynamic stacks",
        ],
        code: `class Stack {
  constructor() {
    this.items = [];
  }
  push(item) { this.items.push(item); }
  pop() { return this.items.pop(); }
  peek() { return this.items[this.items.length - 1]; }
  isEmpty() { return this.items.length === 0; }
}`,
      };
    } else {
      return {
        intuition:
          "A Queue is like a line at a store - first person in line gets served first. This First-In-First-Out (FIFO) principle makes queues ideal for scheduling tasks, managing requests, and breadth-first traversals.",
        useCases: [
          "Task scheduling in OS",
          "Print job queue",
          "Request handling in servers",
          "Breadth-First Search (BFS)",
          "Message queues in distributed systems",
        ],
        edgeCases: [
          "Queue Overflow: Attempting to enqueue when full",
          "Queue Underflow: Attempting to dequeue when empty",
          "Circular queue wrap-around",
          "Priority queue ordering",
        ],
        code: `class Queue {
  constructor() {
    this.items = [];
  }
  enqueue(item) { this.items.push(item); }
  dequeue() { return this.items.shift(); }
  front() { return this.items[0]; }
  isEmpty() { return this.items.length === 0; }
}`,
      };
    }
  };

  const eduContent = getEducationalContent();

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.title}>📚 Stack & Queue Visualizer</h1>
        <p style={styles.subtitle}>
          Interactive learning tool for mastering fundamental data structures
        </p>
      </header>

      {/* Main Grid Layout */}
      <div style={styles.mainGrid}>
        {/* Left Panel - Controls */}
        <div>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>🎮 Control Panel</h2>

            {/* Data Structure Selector */}
            <div style={styles.dsSelector}>
              <button
                style={styles.dsButton(
                  dataStructure === "stack",
                  COLORS.primary,
                )}
                onClick={() => setDataStructure("stack")}
              >
                📚 Stack
              </button>
              <button
                style={styles.dsButton(
                  dataStructure === "queue",
                  COLORS.success,
                )}
                onClick={() => setDataStructure("queue")}
              >
                📋 Queue
              </button>
            </div>

            {/* Input Field */}
            {needsInput && (
              <input
                type="number"
                placeholder="Enter a value (1-99)"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                style={styles.input}
                min="1"
                max="99"
              />
            )}

            {/* Operation Selector */}
            <select
              value={selectedOperation}
              onChange={(e) => setSelectedOperation(e.target.value)}
              style={styles.select}
            >
              {OPERATIONS[dataStructure].map((op) => (
                <option key={op.id} value={op.id}>
                  {op.name} - {op.description}
                </option>
              ))}
            </select>

            {/* Execute Button */}
            <button
              style={styles.button(
                dataStructure === "stack" ? COLORS.primary : COLORS.success,
                isAnimating,
              )}
              onClick={executeOperation}
              disabled={isAnimating}
            >
              {isAnimating ? "⏳ Executing..." : "▶️ Execute Operation"}
            </button>

            {/* Action Buttons */}
            <div style={styles.buttonGroup}>
              <button
                style={styles.smallButton(COLORS.info)}
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
                  color: "#64748b",
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                ⚡ Animation Speed: {((2000 - speed) / 1000 + 0.5).toFixed(1)}x
              </label>
              <input
                type="range"
                min="200"
                max="2000"
                value={2200 - speed}
                onChange={(e) => setSpeed(2200 - parseInt(e.target.value))}
                style={styles.slider}
              />
            </div>
          </div>

          {/* Complexity Card */}
          <div style={{ ...styles.card, marginTop: "16px" }}>
            <h2 style={styles.cardTitle}>⏱️ Current Operation Complexity</h2>
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
          </div>

          {/* History Card */}
          <div style={{ ...styles.card, marginTop: "16px" }}>
            <h2 style={styles.cardTitle}>📜 Operation History</h2>
            <div style={{ maxHeight: "150px", overflowY: "auto" }}>
              {history.length === 0 ? (
                <p
                  style={{
                    color: "#94a3b8",
                    fontSize: "0.85rem",
                    textAlign: "center",
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
                      <span style={{ fontWeight: "600" }}>{h.operation}</span>
                      {h.value !== null && (
                        <span style={{ color: "#64748b" }}>({h.value})</span>
                      )}
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>

        {/* Center Panel - Visualization */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>
            {dataStructure === "stack" ? "📚" : "📋"}{" "}
            {dataStructure === "stack" ? "Stack" : "Queue"} Visualization
            <span
              style={{
                marginLeft: "auto",
                fontSize: "0.85rem",
                color: "#64748b",
                fontWeight: "500",
              }}
            >
              Size: {elements.length}/{MAX_ELEMENTS}
            </span>
          </h2>

          <div style={styles.visualizationArea}>
            {elements.length === 0 && !animatingElement ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>
                  {dataStructure === "stack" ? "📚" : "📋"}
                </div>
                <p
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: "600",
                    color: "#64748b",
                  }}
                >
                  {dataStructure === "stack" ? "Stack" : "Queue"} is empty
                </p>
                <p style={{ fontSize: "0.9rem" }}>
                  Use {dataStructure === "stack" ? "Push" : "Enqueue"} to add
                  elements
                </p>
              </div>
            ) : dataStructure === "stack" ? (
              /* Stack Visualization */
              <div style={styles.stackContainer}>
                {elements.map((el, index) => (
                  <div
                    key={el.id}
                    style={{
                      ...styles.element(
                        index,
                        highlightedIndex === index,
                        true,
                        elements.length,
                      ),
                      animation:
                        index === elements.length - 1 && animationType === "pop"
                          ? "slideOutRight 0.3s ease forwards"
                          : "none",
                    }}
                  >
                    {el.value}
                    {index === elements.length - 1 && (
                      <div style={styles.pointer(COLORS.danger, "right")}>
                        <span
                          style={{
                            borderTop: "6px solid transparent",
                            borderBottom: "6px solid transparent",
                            borderLeft: `8px solid ${COLORS.danger}`,
                          }}
                        />
                        TOP
                      </div>
                    )}
                    {index === 0 && elements.length > 1 && (
                      <div style={styles.pointer(COLORS.info, "left")}>
                        BOTTOM
                        <span
                          style={{
                            borderTop: "6px solid transparent",
                            borderBottom: "6px solid transparent",
                            borderRight: `8px solid ${COLORS.info}`,
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
                {animatingElement && animationType === "push" && (
                  <div
                    style={{
                      ...styles.element(0, true, true, 0),
                      animation: "slideInTop 0.3s ease forwards",
                    }}
                  >
                    {animatingElement.value}
                  </div>
                )}
              </div>
            ) : (
              /* Queue Visualization */
              <div style={styles.queueContainer}>
                {animatingElement && animationType === "enqueue" && (
                  <div
                    style={{
                      ...styles.element(0, true, false, 0),
                      animation: "slideInRight 0.3s ease forwards",
                      position: "absolute",
                      right: "20px",
                    }}
                  >
                    {animatingElement.value}
                  </div>
                )}
                {elements.map((el, index) => (
                  <div
                    key={el.id}
                    style={{
                      ...styles.element(
                        index,
                        highlightedIndex === index,
                        false,
                        elements.length,
                      ),
                      animation:
                        index === 0 && animationType === "dequeue"
                          ? "slideOutLeft 0.3s ease forwards"
                          : "none",
                    }}
                  >
                    {el.value}
                    {index === 0 && (
                      <div
                        style={{
                          ...styles.pointer(COLORS.success, "top"),
                          top: "-35px",
                          left: "50%",
                          transform: "translateX(-50%)",
                          flexDirection: "column",
                        }}
                      >
                        FRONT
                        <span
                          style={{
                            borderLeft: "6px solid transparent",
                            borderRight: "6px solid transparent",
                            borderTop: `8px solid ${COLORS.success}`,
                          }}
                        />
                      </div>
                    )}
                    {index === elements.length - 1 && (
                      <div
                        style={{
                          ...styles.pointer(COLORS.primary, "bottom"),
                          bottom: "-35px",
                          left: "50%",
                          transform: "translateX(-50%)",
                          flexDirection: "column-reverse",
                        }}
                      >
                        <span
                          style={{
                            borderLeft: "6px solid transparent",
                            borderRight: "6px solid transparent",
                            borderBottom: `8px solid ${COLORS.primary}`,
                          }}
                        />
                        REAR
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Legend */}
          <div style={styles.legend}>
            <div style={styles.legendItem}>
              <div
                style={styles.legendColor(
                  dataStructure === "stack"
                    ? [COLORS.stackGradient[0], COLORS.stackGradient[2]]
                    : [COLORS.queueGradient[0], COLORS.queueGradient[2]],
                )}
              />
              <span>Normal Element</span>
            </div>
            <div style={styles.legendItem}>
              <div
                style={styles.legendColor([COLORS.warning, COLORS.highlight])}
              />
              <span>Active/Highlighted</span>
            </div>
            <div style={styles.legendItem}>
              <span style={{ color: COLORS.danger, fontWeight: "700" }}>●</span>
              <span>
                {dataStructure === "stack" ? "TOP Pointer" : "FRONT Pointer"}
              </span>
            </div>
            <div style={styles.legendItem}>
              <span
                style={{
                  color:
                    dataStructure === "stack" ? COLORS.info : COLORS.primary,
                  fontWeight: "700",
                }}
              >
                ●
              </span>
              <span>
                {dataStructure === "stack" ? "BOTTOM" : "REAR Pointer"}
              </span>
            </div>
          </div>

          {/* Explanation Box */}
          <div style={styles.explanationBox}>
            <h3
              style={{
                margin: "0 0 8px 0",
                fontSize: "0.9rem",
                color: "#1e293b",
              }}
            >
              💡 Current Status
            </h3>
            <p style={{ margin: 0, color: "#475569", fontSize: "0.95rem" }}>
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

            {/* Intuition Section */}
            <div style={styles.eduSection}>
              <h3 style={styles.eduTitle}>💭 Intuition</h3>
              <p style={styles.eduContent}>{eduContent.intuition}</p>
            </div>

            {/* Use Cases */}
            <div style={styles.eduSection}>
              <h3 style={styles.eduTitle}>🎯 Common Use Cases</h3>
              <ul
                style={{ ...styles.eduContent, paddingLeft: "20px", margin: 0 }}
              >
                {eduContent.useCases.map((useCase, i) => (
                  <li key={i} style={{ marginBottom: "4px" }}>
                    {useCase}
                  </li>
                ))}
              </ul>
            </div>

            {/* Complexity Table */}
            <div style={styles.eduSection}>
              <h3 style={styles.eduTitle}>📊 Complexity Analysis</h3>
              <table style={styles.complexityTable}>
                <thead>
                  <tr>
                    <th
                      style={{
                        ...styles.tableHeader,
                        borderRadius: "8px 0 0 0",
                      }}
                    >
                      Operation
                    </th>
                    <th style={styles.tableHeader}>Time</th>
                    <th
                      style={{
                        ...styles.tableHeader,
                        borderRadius: "0 8px 0 0",
                      }}
                    >
                      Space
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {OPERATIONS[dataStructure].map((op, i) => (
                    <tr
                      key={op.id}
                      style={{
                        background: i % 2 === 0 ? "#f8fafc" : "white",
                      }}
                    >
                      <td style={styles.tableCell}>{op.name}</td>
                      <td
                        style={{
                          ...styles.tableCell,
                          fontFamily: "monospace",
                          fontWeight: "600",
                        }}
                      >
                        {COMPLEXITY[dataStructure][op.id].time}
                      </td>
                      <td
                        style={{
                          ...styles.tableCell,
                          fontFamily: "monospace",
                          fontWeight: "600",
                        }}
                      >
                        {COMPLEXITY[dataStructure][op.id].space}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Edge Cases */}
            <div style={styles.eduSection}>
              <h3 style={styles.eduTitle}>⚠️ Edge Cases</h3>
              <ul
                style={{ ...styles.eduContent, paddingLeft: "20px", margin: 0 }}
              >
                {eduContent.edgeCases.map((ec, i) => (
                  <li key={i} style={{ marginBottom: "4px" }}>
                    {ec}
                  </li>
                ))}
              </ul>
            </div>

            {/* Code Implementation */}
            <div style={styles.eduSection}>
              <h3 style={styles.eduTitle}>💻 Implementation</h3>
              <pre style={styles.codeBlock}>{eduContent.code}</pre>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes slideInTop {
          from {
            opacity: 0;
            transform: translateY(-50px) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes slideOutRight {
          from {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
          to {
            opacity: 0;
            transform: translateX(100px) scale(0.8);
          }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        
        @keyframes slideOutLeft {
          from {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
          to {
            opacity: 0;
            transform: translateX(-100px) scale(0.8);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
          }
          50% {
            transform: scale(1.08);
            box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
          }
        }
        
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(99, 102, 241, 0.4);
        }
        
        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 6px rgba(99, 102, 241, 0.4);
        }
        
        input:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }
        
        select:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
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
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
        }
        
        @media (max-width: 1200px) {
          .mainGrid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
