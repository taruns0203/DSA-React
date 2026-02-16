import React, { useState, useEffect, useCallback, useRef } from "react";

/**
 * Binary Tree Complete Visualizer
 * A comprehensive educational tool for understanding Binary Tree data structure
 * Features: Insert, Delete, Search, Traversals, and more
 */

// ============================================
// BINARY TREE NODE CLASS
// ============================================
class TreeNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
    this.id = Math.random().toString(36).substr(2, 9);
  }
}

// ============================================
// BINARY TREE CLASS WITH ALL OPERATIONS
// ============================================
class BinaryTree {
  constructor() {
    this.root = null;
  }

  // Deep clone the tree
  clone() {
    const newTree = new BinaryTree();
    newTree.root = this.cloneNode(this.root);
    return newTree;
  }

  cloneNode(node) {
    if (!node) return null;
    const newNode = new TreeNode(node.value);
    newNode.id = node.id;
    newNode.left = this.cloneNode(node.left);
    newNode.right = this.cloneNode(node.right);
    return newNode;
  }

  // Insert a value (BST style for organized structure)
  insert(value) {
    const steps = [];
    const newNode = new TreeNode(value);

    if (!this.root) {
      this.root = newNode;
      steps.push({
        type: "insert",
        nodeId: newNode.id,
        message: `Inserting ${value} as root node`,
        highlighted: [newNode.id],
        comparing: [],
      });
      return steps;
    }

    let current = this.root;
    while (true) {
      steps.push({
        type: "compare",
        nodeId: current.id,
        message: `Comparing ${value} with ${current.value}`,
        highlighted: [],
        comparing: [current.id],
      });

      if (value < current.value) {
        if (!current.left) {
          current.left = newNode;
          steps.push({
            type: "insert",
            nodeId: newNode.id,
            message: `${value} < ${current.value}, inserting as left child`,
            highlighted: [newNode.id],
            comparing: [],
          });
          break;
        }
        steps.push({
          type: "move",
          nodeId: current.left.id,
          message: `${value} < ${current.value}, moving to left subtree`,
          highlighted: [],
          comparing: [],
          path: [current.id],
        });
        current = current.left;
      } else {
        if (!current.right) {
          current.right = newNode;
          steps.push({
            type: "insert",
            nodeId: newNode.id,
            message: `${value} >= ${current.value}, inserting as right child`,
            highlighted: [newNode.id],
            comparing: [],
          });
          break;
        }
        steps.push({
          type: "move",
          nodeId: current.right.id,
          message: `${value} >= ${current.value}, moving to right subtree`,
          highlighted: [],
          comparing: [],
          path: [current.id],
        });
        current = current.right;
      }
    }
    return steps;
  }

  // Search for a value
  search(value) {
    const steps = [];
    let current = this.root;

    if (!current) {
      steps.push({
        type: "not-found",
        message: "Tree is empty",
        highlighted: [],
        comparing: [],
      });
      return { found: false, steps };
    }

    while (current) {
      steps.push({
        type: "compare",
        nodeId: current.id,
        message: `Comparing ${value} with ${current.value}`,
        highlighted: [],
        comparing: [current.id],
      });

      if (value === current.value) {
        steps.push({
          type: "found",
          nodeId: current.id,
          message: `Found ${value}!`,
          highlighted: [current.id],
          comparing: [],
        });
        return { found: true, steps, node: current };
      }

      if (value < current.value) {
        if (!current.left) {
          steps.push({
            type: "not-found",
            message: `${value} not found (no left child)`,
            highlighted: [],
            comparing: [],
          });
          return { found: false, steps };
        }
        steps.push({
          type: "move",
          message: `${value} < ${current.value}, moving left`,
          highlighted: [],
          comparing: [],
          path: [current.id],
        });
        current = current.left;
      } else {
        if (!current.right) {
          steps.push({
            type: "not-found",
            message: `${value} not found (no right child)`,
            highlighted: [],
            comparing: [],
          });
          return { found: false, steps };
        }
        steps.push({
          type: "move",
          message: `${value} > ${current.value}, moving right`,
          highlighted: [],
          comparing: [],
          path: [current.id],
        });
        current = current.right;
      }
    }
    return { found: false, steps };
  }

  // Delete a value
  delete(value) {
    const steps = [];
    this.root = this.deleteNode(this.root, value, steps);
    return steps;
  }

  deleteNode(node, value, steps) {
    if (!node) {
      steps.push({
        type: "not-found",
        message: `Value ${value} not found in tree`,
        highlighted: [],
        comparing: [],
      });
      return null;
    }

    steps.push({
      type: "compare",
      nodeId: node.id,
      message: `Comparing ${value} with ${node.value}`,
      highlighted: [],
      comparing: [node.id],
    });

    if (value < node.value) {
      node.left = this.deleteNode(node.left, value, steps);
    } else if (value > node.value) {
      node.right = this.deleteNode(node.right, value, steps);
    } else {
      steps.push({
        type: "found",
        nodeId: node.id,
        message: `Found ${value} to delete`,
        highlighted: [node.id],
        comparing: [],
      });

      // Node with no children
      if (!node.left && !node.right) {
        steps.push({
          type: "delete",
          nodeId: node.id,
          message: `Deleting leaf node ${value}`,
          highlighted: [],
          comparing: [],
        });
        return null;
      }

      // Node with one child
      if (!node.left) {
        steps.push({
          type: "delete",
          nodeId: node.id,
          message: `Replacing ${value} with right child`,
          highlighted: [node.right.id],
          comparing: [],
        });
        return node.right;
      }
      if (!node.right) {
        steps.push({
          type: "delete",
          nodeId: node.id,
          message: `Replacing ${value} with left child`,
          highlighted: [node.left.id],
          comparing: [],
        });
        return node.left;
      }

      // Node with two children
      let successor = node.right;
      while (successor.left) {
        successor = successor.left;
      }
      steps.push({
        type: "successor",
        nodeId: successor.id,
        message: `Found inorder successor: ${successor.value}`,
        highlighted: [successor.id],
        comparing: [],
      });

      node.value = successor.value;
      steps.push({
        type: "replace",
        nodeId: node.id,
        message: `Replaced ${value} with ${successor.value}`,
        highlighted: [node.id],
        comparing: [],
      });

      node.right = this.deleteNode(node.right, successor.value, steps);
    }
    return node;
  }

  // Inorder Traversal (Left -> Root -> Right)
  inorderTraversal() {
    const steps = [];
    const result = [];
    this.inorderHelper(this.root, steps, result);
    return { steps, result };
  }

  inorderHelper(node, steps, result) {
    if (!node) return;

    steps.push({
      type: "visit",
      nodeId: node.id,
      message: `Visiting left subtree of ${node.value}`,
      highlighted: [],
      comparing: [node.id],
    });

    this.inorderHelper(node.left, steps, result);

    result.push(node.value);
    steps.push({
      type: "process",
      nodeId: node.id,
      message: `Processing node ${node.value}`,
      highlighted: [node.id],
      comparing: [],
      result: [...result],
    });

    this.inorderHelper(node.right, steps, result);
  }

  // Preorder Traversal (Root -> Left -> Right)
  preorderTraversal() {
    const steps = [];
    const result = [];
    this.preorderHelper(this.root, steps, result);
    return { steps, result };
  }

  preorderHelper(node, steps, result) {
    if (!node) return;

    result.push(node.value);
    steps.push({
      type: "process",
      nodeId: node.id,
      message: `Processing node ${node.value}`,
      highlighted: [node.id],
      comparing: [],
      result: [...result],
    });

    this.preorderHelper(node.left, steps, result);
    this.preorderHelper(node.right, steps, result);
  }

  // Postorder Traversal (Left -> Right -> Root)
  postorderTraversal() {
    const steps = [];
    const result = [];
    this.postorderHelper(this.root, steps, result);
    return { steps, result };
  }

  postorderHelper(node, steps, result) {
    if (!node) return;

    steps.push({
      type: "visit",
      nodeId: node.id,
      message: `Visiting subtrees of ${node.value}`,
      highlighted: [],
      comparing: [node.id],
    });

    this.postorderHelper(node.left, steps, result);
    this.postorderHelper(node.right, steps, result);

    result.push(node.value);
    steps.push({
      type: "process",
      nodeId: node.id,
      message: `Processing node ${node.value}`,
      highlighted: [node.id],
      comparing: [],
      result: [...result],
    });
  }

  // Level Order Traversal (BFS)
  levelOrderTraversal() {
    const steps = [];
    const result = [];

    if (!this.root) return { steps, result };

    const queue = [this.root];
    let level = 0;

    while (queue.length > 0) {
      const levelSize = queue.length;
      const levelNodes = [];

      steps.push({
        type: "level",
        message: `Processing level ${level}`,
        highlighted: queue.map((n) => n.id),
        comparing: [],
      });

      for (let i = 0; i < levelSize; i++) {
        const node = queue.shift();
        result.push(node.value);
        levelNodes.push(node.value);

        steps.push({
          type: "process",
          nodeId: node.id,
          message: `Dequeued and processed ${node.value}`,
          highlighted: [node.id],
          comparing: [],
          result: [...result],
        });

        if (node.left) {
          queue.push(node.left);
          steps.push({
            type: "enqueue",
            nodeId: node.left.id,
            message: `Enqueued left child ${node.left.value}`,
            highlighted: [],
            comparing: [node.left.id],
          });
        }
        if (node.right) {
          queue.push(node.right);
          steps.push({
            type: "enqueue",
            nodeId: node.right.id,
            message: `Enqueued right child ${node.right.value}`,
            highlighted: [],
            comparing: [node.right.id],
          });
        }
      }
      level++;
    }
    return { steps, result };
  }

  // Find minimum value
  findMin() {
    const steps = [];
    if (!this.root) {
      steps.push({
        type: "empty",
        message: "Tree is empty",
        highlighted: [],
        comparing: [],
      });
      return { value: null, steps };
    }

    let current = this.root;
    while (current.left) {
      steps.push({
        type: "move",
        nodeId: current.id,
        message: `At ${current.value}, moving to left child`,
        highlighted: [],
        comparing: [current.id],
      });
      current = current.left;
    }

    steps.push({
      type: "found",
      nodeId: current.id,
      message: `Minimum value is ${current.value}`,
      highlighted: [current.id],
      comparing: [],
    });

    return { value: current.value, steps };
  }

  // Find maximum value
  findMax() {
    const steps = [];
    if (!this.root) {
      steps.push({
        type: "empty",
        message: "Tree is empty",
        highlighted: [],
        comparing: [],
      });
      return { value: null, steps };
    }

    let current = this.root;
    while (current.right) {
      steps.push({
        type: "move",
        nodeId: current.id,
        message: `At ${current.value}, moving to right child`,
        highlighted: [],
        comparing: [current.id],
      });
      current = current.right;
    }

    steps.push({
      type: "found",
      nodeId: current.id,
      message: `Maximum value is ${current.value}`,
      highlighted: [current.id],
      comparing: [],
    });

    return { value: current.value, steps };
  }

  // Get tree height
  getHeight() {
    const steps = [];
    const height = this.heightHelper(this.root, steps, 0);
    return { height, steps };
  }

  heightHelper(node, steps, depth) {
    if (!node) return -1;

    steps.push({
      type: "visit",
      nodeId: node.id,
      message: `Calculating height at ${node.value} (depth: ${depth})`,
      highlighted: [],
      comparing: [node.id],
    });

    const leftHeight = this.heightHelper(node.left, steps, depth + 1);
    const rightHeight = this.heightHelper(node.right, steps, depth + 1);
    const nodeHeight = Math.max(leftHeight, rightHeight) + 1;

    steps.push({
      type: "calculate",
      nodeId: node.id,
      message: `Height at ${node.value}: max(${leftHeight}, ${rightHeight}) + 1 = ${nodeHeight}`,
      highlighted: [node.id],
      comparing: [],
    });

    return nodeHeight;
  }

  // Convert tree to array for visualization
  toArray() {
    const nodes = [];
    this.collectNodes(this.root, nodes, 0, 0);
    return nodes;
  }

  collectNodes(node, nodes, level, position) {
    if (!node) return;
    nodes.push({ ...node, level, position });
    this.collectNodes(node.left, nodes, level + 1, position * 2);
    this.collectNodes(node.right, nodes, level + 1, position * 2 + 1);
  }
}

// ============================================
// MAIN VISUALIZER COMPONENT
// ============================================
export default function BinaryTreeVisualizer() {
  // State management
  const [tree, setTree] = useState(new BinaryTree());
  const [inputValue, setInputValue] = useState("");
  const [operation, setOperation] = useState("insert");
  const [animationSteps, setAnimationSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [highlightedNodes, setHighlightedNodes] = useState([]);
  const [comparingNodes, setComparingNodes] = useState([]);
  const [explanation, setExplanation] = useState(
    "Welcome! Start by inserting nodes or generating random data.",
  );
  const [traversalResult, setTraversalResult] = useState([]);
  const [showEducation, setShowEducation] = useState(true);

  const animationRef = useRef(null);

  // Operations configuration
  const operations = [
    { value: "insert", label: "Insert", needsInput: true },
    { value: "delete", label: "Delete", needsInput: true },
    { value: "search", label: "Search", needsInput: true },
    { value: "inorder", label: "Inorder Traversal", needsInput: false },
    { value: "preorder", label: "Preorder Traversal", needsInput: false },
    { value: "postorder", label: "Postorder Traversal", needsInput: false },
    { value: "levelorder", label: "Level Order (BFS)", needsInput: false },
    { value: "findMin", label: "Find Minimum", needsInput: false },
    { value: "findMax", label: "Find Maximum", needsInput: false },
    { value: "height", label: "Get Height", needsInput: false },
  ];

  // Complexity information
  const complexityInfo = {
    insert: {
      time: "O(h) → O(log n) avg, O(n) worst",
      space: "O(1) iterative",
    },
    delete: {
      time: "O(h) → O(log n) avg, O(n) worst",
      space: "O(h) recursive",
    },
    search: {
      time: "O(h) → O(log n) avg, O(n) worst",
      space: "O(1) iterative",
    },
    inorder: { time: "O(n)", space: "O(h) recursive stack" },
    preorder: { time: "O(n)", space: "O(h) recursive stack" },
    postorder: { time: "O(n)", space: "O(h) recursive stack" },
    levelorder: { time: "O(n)", space: "O(w) where w = max width" },
    findMin: { time: "O(h)", space: "O(1)" },
    findMax: { time: "O(h)", space: "O(1)" },
    height: { time: "O(n)", space: "O(h) recursive stack" },
  };

  // Execute operation
  const executeOperation = useCallback(() => {
    const newTree = tree.clone();
    let steps = [];

    switch (operation) {
      case "insert": {
        const value = parseInt(inputValue);
        if (isNaN(value)) {
          setExplanation("Please enter a valid number");
          return;
        }
        steps = newTree.insert(value);
        setTree(newTree);
        break;
      }
      case "delete": {
        const value = parseInt(inputValue);
        if (isNaN(value)) {
          setExplanation("Please enter a valid number");
          return;
        }
        steps = newTree.delete(value);
        setTree(newTree);
        break;
      }
      case "search": {
        const value = parseInt(inputValue);
        if (isNaN(value)) {
          setExplanation("Please enter a valid number");
          return;
        }
        const result = newTree.search(value);
        steps = result.steps;
        break;
      }
      case "inorder": {
        const result = newTree.inorderTraversal();
        steps = result.steps;
        setTraversalResult([]);
        break;
      }
      case "preorder": {
        const result = newTree.preorderTraversal();
        steps = result.steps;
        setTraversalResult([]);
        break;
      }
      case "postorder": {
        const result = newTree.postorderTraversal();
        steps = result.steps;
        setTraversalResult([]);
        break;
      }
      case "levelorder": {
        const result = newTree.levelOrderTraversal();
        steps = result.steps;
        setTraversalResult([]);
        break;
      }
      case "findMin": {
        const result = newTree.findMin();
        steps = result.steps;
        break;
      }
      case "findMax": {
        const result = newTree.findMax();
        steps = result.steps;
        break;
      }
      case "height": {
        const result = newTree.getHeight();
        steps = result.steps;
        break;
      }
      default:
        break;
    }

    setAnimationSteps(steps);
    setCurrentStep(-1);
    setHighlightedNodes([]);
    setComparingNodes([]);
    if (steps.length > 0) {
      setExplanation("Ready to animate. Use Step or Play to begin.");
    }
  }, [tree, operation, inputValue]);

  // Animation step handler
  useEffect(() => {
    if (currentStep >= 0 && currentStep < animationSteps.length) {
      const step = animationSteps[currentStep];
      setHighlightedNodes(step.highlighted || []);
      setComparingNodes(step.comparing || []);
      setExplanation(step.message);
      if (step.result) {
        setTraversalResult(step.result);
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
    setHighlightedNodes([]);
    setComparingNodes([]);
    setTraversalResult([]);
    setExplanation("Reset complete. Ready for next operation.");
  };

  const handleClearTree = () => {
    setTree(new BinaryTree());
    setAnimationSteps([]);
    setCurrentStep(-1);
    setHighlightedNodes([]);
    setComparingNodes([]);
    setTraversalResult([]);
    setExplanation("Tree cleared. Start fresh!");
  };

  const generateRandomTree = () => {
    const newTree = new BinaryTree();
    const count = Math.floor(Math.random() * 6) + 5; // 5-10 nodes
    const values = new Set();

    while (values.size < count) {
      values.add(Math.floor(Math.random() * 99) + 1);
    }

    values.forEach((value) => newTree.insert(value));
    setTree(newTree);
    setAnimationSteps([]);
    setCurrentStep(-1);
    setHighlightedNodes([]);
    setComparingNodes([]);
    setTraversalResult([]);
    setExplanation(`Generated tree with ${count} random nodes!`);
  };

  // Calculate node positions for SVG
  const calculateNodePositions = useCallback(() => {
    const nodes = [];
    const edges = [];

    if (!tree.root) return { nodes, edges };

    const getTreeWidth = (node) => {
      if (!node) return 0;
      return Math.max(1, getTreeWidth(node.left) + getTreeWidth(node.right));
    };

    const positionNodes = (node, x, y, level, minX, maxX) => {
      if (!node) return;

      const nodeData = {
        id: node.id,
        value: node.value,
        x: x,
        y: y,
        isHighlighted: highlightedNodes.includes(node.id),
        isComparing: comparingNodes.includes(node.id),
      };
      nodes.push(nodeData);

      const childY = y + 80;
      const spread = (maxX - minX) / 4;

      if (node.left) {
        const leftX = x - spread;
        edges.push({
          id: `${node.id}-${node.left.id}`,
          x1: x,
          y1: y + 20,
          x2: leftX,
          y2: childY - 20,
        });
        positionNodes(node.left, leftX, childY, level + 1, minX, x);
      }

      if (node.right) {
        const rightX = x + spread;
        edges.push({
          id: `${node.id}-${node.right.id}`,
          x1: x,
          y1: y + 20,
          x2: rightX,
          y2: childY - 20,
        });
        positionNodes(node.right, rightX, childY, level + 1, x, maxX);
      }
    };

    positionNodes(tree.root, 400, 50, 0, 0, 800);
    return { nodes, edges };
  }, [tree, highlightedNodes, comparingNodes]);

  const { nodes: treeNodes, edges: treeEdges } = calculateNodePositions();

  // Styles
  const styles = {
    container: {
      fontFamily:
        "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      background: "linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)",
      minHeight: "100vh",
      padding: "20px",
      boxSizing: "border-box",
    },
    header: {
      textAlign: "center",
      marginBottom: "24px",
    },
    title: {
      fontSize: "2.5rem",
      fontWeight: "700",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      margin: "0 0 8px 0",
    },
    subtitle: {
      fontSize: "1rem",
      color: "#64748b",
      margin: 0,
    },
    mainContent: {
      display: "grid",
      gridTemplateColumns: "320px 1fr 300px",
      gap: "20px",
      maxWidth: "1600px",
      margin: "0 auto",
    },
    card: {
      background: "white",
      borderRadius: "16px",
      padding: "20px",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
      border: "1px solid rgba(255, 255, 255, 0.8)",
    },
    cardTitle: {
      fontSize: "1.1rem",
      fontWeight: "600",
      color: "#1e293b",
      marginBottom: "16px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    inputGroup: {
      marginBottom: "16px",
    },
    label: {
      display: "block",
      fontSize: "0.875rem",
      fontWeight: "500",
      color: "#475569",
      marginBottom: "6px",
    },
    input: {
      width: "100%",
      padding: "10px 14px",
      fontSize: "1rem",
      border: "2px solid #e2e8f0",
      borderRadius: "10px",
      outline: "none",
      transition: "border-color 0.2s, box-shadow 0.2s",
      boxSizing: "border-box",
    },
    select: {
      width: "100%",
      padding: "10px 14px",
      fontSize: "1rem",
      border: "2px solid #e2e8f0",
      borderRadius: "10px",
      outline: "none",
      background: "white",
      cursor: "pointer",
      boxSizing: "border-box",
    },
    buttonGroup: {
      display: "flex",
      flexWrap: "wrap",
      gap: "8px",
      marginTop: "16px",
    },
    button: {
      padding: "10px 16px",
      fontSize: "0.875rem",
      fontWeight: "600",
      border: "none",
      borderRadius: "10px",
      cursor: "pointer",
      transition: "all 0.2s",
      display: "flex",
      alignItems: "center",
      gap: "6px",
    },
    primaryButton: {
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white",
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
    sliderContainer: {
      marginTop: "16px",
    },
    slider: {
      width: "100%",
      height: "6px",
      borderRadius: "3px",
      background: "#e2e8f0",
      outline: "none",
      cursor: "pointer",
    },
    visualizationArea: {
      minHeight: "500px",
      position: "relative",
      overflow: "hidden",
    },
    svg: {
      width: "100%",
      height: "450px",
    },
    explanationBox: {
      marginTop: "16px",
      padding: "16px",
      background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
      borderRadius: "12px",
      border: "1px solid #bae6fd",
    },
    explanationText: {
      fontSize: "0.95rem",
      color: "#0369a1",
      margin: 0,
      lineHeight: "1.5",
    },
    traversalResult: {
      marginTop: "12px",
      padding: "12px",
      background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
      borderRadius: "10px",
      border: "1px solid #fcd34d",
    },
    traversalText: {
      fontSize: "0.9rem",
      color: "#92400e",
      margin: 0,
      fontFamily: "monospace",
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
    legendColor: {
      width: "16px",
      height: "16px",
      borderRadius: "4px",
    },
    complexityTable: {
      width: "100%",
      borderCollapse: "collapse",
      fontSize: "0.85rem",
      marginTop: "12px",
    },
    tableHeader: {
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white",
      padding: "10px",
      textAlign: "left",
      borderRadius: "8px 8px 0 0",
    },
    tableCell: {
      padding: "10px",
      borderBottom: "1px solid #e2e8f0",
      color: "#475569",
    },
    educationSection: {
      marginTop: "16px",
    },
    sectionTitle: {
      fontSize: "0.95rem",
      fontWeight: "600",
      color: "#334155",
      marginBottom: "8px",
    },
    sectionContent: {
      fontSize: "0.85rem",
      color: "#64748b",
      lineHeight: "1.6",
    },
    progressBar: {
      height: "4px",
      background: "#e2e8f0",
      borderRadius: "2px",
      marginTop: "12px",
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      borderRadius: "2px",
      transition: "width 0.3s",
    },
    toggleButton: {
      padding: "8px 12px",
      fontSize: "0.8rem",
      fontWeight: "500",
      background: "#f1f5f9",
      border: "1px solid #e2e8f0",
      borderRadius: "8px",
      cursor: "pointer",
      marginBottom: "12px",
    },
  };

  const currentOp = operations.find((op) => op.value === operation);

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.title}>🌳 Binary Tree Visualizer</h1>
        <p style={styles.subtitle}>
          Interactive learning tool for mastering tree data structures
        </p>
      </header>

      <div style={styles.mainContent}>
        {/* Control Panel */}
        <div>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>
              <span>⚙️</span> Control Panel
            </h2>

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
            {currentOp?.needsInput && (
              <div style={styles.inputGroup}>
                <label style={styles.label}>Value</label>
                <input
                  type="number"
                  style={styles.input}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Enter a number"
                  onKeyDown={(e) => e.key === "Enter" && executeOperation()}
                />
              </div>
            )}

            {/* Execute Button */}
            <button
              style={{
                ...styles.button,
                ...styles.primaryButton,
                width: "100%",
                justifyContent: "center",
              }}
              onClick={executeOperation}
            >
              ▶ Execute Operation
            </button>

            {/* Animation Controls */}
            <div style={styles.buttonGroup}>
              <button
                style={{ ...styles.button, ...styles.secondaryButton, flex: 1 }}
                onClick={handleStep}
                disabled={currentStep >= animationSteps.length - 1}
              >
                ⏭ Step
              </button>
              {isPlaying ? (
                <button
                  style={{ ...styles.button, ...styles.warningButton, flex: 1 }}
                  onClick={handlePause}
                >
                  ⏸ Pause
                </button>
              ) : (
                <button
                  style={{ ...styles.button, ...styles.successButton, flex: 1 }}
                  onClick={handlePlay}
                  disabled={animationSteps.length === 0}
                >
                  ▶ Play
                </button>
              )}
            </div>

            <div style={styles.buttonGroup}>
              <button
                style={{ ...styles.button, ...styles.secondaryButton, flex: 1 }}
                onClick={handleReset}
              >
                ↺ Reset
              </button>
              <button
                style={{ ...styles.button, ...styles.dangerButton, flex: 1 }}
                onClick={handleClearTree}
              >
                🗑 Clear
              </button>
            </div>

            {/* Random Generator */}
            <button
              style={{
                ...styles.button,
                ...styles.successButton,
                width: "100%",
                marginTop: "12px",
                justifyContent: "center",
              }}
              onClick={generateRandomTree}
            >
              🎲 Generate Random Tree
            </button>

            {/* Speed Control */}
            <div style={styles.sliderContainer}>
              <label style={styles.label}>
                Animation Speed: {(2000 - speed) / 1000 + 0.5}x
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

            {/* Progress Bar */}
            {animationSteps.length > 0 && (
              <div style={styles.progressBar}>
                <div
                  style={{
                    ...styles.progressFill,
                    width: `${((currentStep + 1) / animationSteps.length) * 100}%`,
                  }}
                />
              </div>
            )}

            {/* Legend */}
            <div style={styles.legend}>
              <div style={styles.legendItem}>
                <div
                  style={{
                    ...styles.legendColor,
                    background: "linear-gradient(135deg, #667eea, #764ba2)",
                  }}
                />
                <span>Normal</span>
              </div>
              <div style={styles.legendItem}>
                <div
                  style={{
                    ...styles.legendColor,
                    background: "linear-gradient(135deg, #10b981, #059669)",
                  }}
                />
                <span>Found/Active</span>
              </div>
              <div style={styles.legendItem}>
                <div
                  style={{
                    ...styles.legendColor,
                    background: "linear-gradient(135deg, #f59e0b, #d97706)",
                  }}
                />
                <span>Comparing</span>
              </div>
            </div>
          </div>

          {/* Complexity Info */}
          <div style={{ ...styles.card, marginTop: "16px" }}>
            <h2 style={styles.cardTitle}>
              <span>📊</span> Complexity
            </h2>
            <table style={styles.complexityTable}>
              <thead>
                <tr>
                  <th
                    style={{ ...styles.tableHeader, borderRadius: "8px 0 0 0" }}
                  >
                    Metric
                  </th>
                  <th
                    style={{ ...styles.tableHeader, borderRadius: "0 8px 0 0" }}
                  >
                    Value
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={styles.tableCell}>Time</td>
                  <td style={styles.tableCell}>
                    {complexityInfo[operation]?.time}
                  </td>
                </tr>
                <tr>
                  <td style={styles.tableCell}>Space</td>
                  <td style={styles.tableCell}>
                    {complexityInfo[operation]?.space}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Visualization Area */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>
            <span>🎨</span> Tree Visualization
          </h2>

          <div style={styles.visualizationArea}>
            <svg style={styles.svg} viewBox="0 0 800 400">
              {/* Background grid */}
              <defs>
                <pattern
                  id="grid"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke="#f1f5f9"
                    strokeWidth="1"
                  />
                </pattern>
                <linearGradient
                  id="nodeGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#667eea" />
                  <stop offset="100%" stopColor="#764ba2" />
                </linearGradient>
                <linearGradient
                  id="highlightGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
                <linearGradient
                  id="compareGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#d97706" />
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
                    dy="4"
                    stdDeviation="4"
                    floodOpacity="0.2"
                  />
                </filter>
              </defs>

              <rect width="100%" height="100%" fill="url(#grid)" />

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
                  strokeLinecap="round"
                />
              ))}

              {/* Nodes */}
              {treeNodes.map((node) => (
                <g key={node.id}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="24"
                    fill={
                      node.isHighlighted
                        ? "url(#highlightGradient)"
                        : node.isComparing
                          ? "url(#compareGradient)"
                          : "url(#nodeGradient)"
                    }
                    filter="url(#shadow)"
                    style={{
                      transition: "all 0.3s ease",
                      transform:
                        node.isHighlighted || node.isComparing
                          ? "scale(1.15)"
                          : "scale(1)",
                      transformOrigin: `${node.x}px ${node.y}px`,
                    }}
                  />
                  <text
                    x={node.x}
                    y={node.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="white"
                    fontSize="14"
                    fontWeight="600"
                    style={{ pointerEvents: "none" }}
                  >
                    {node.value}
                  </text>
                </g>
              ))}

              {/* Empty tree message */}
              {treeNodes.length === 0 && (
                <text
                  x="400"
                  y="200"
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="16"
                >
                  Tree is empty. Insert nodes to begin!
                </text>
              )}
            </svg>
          </div>

          {/* Explanation Box */}
          <div style={styles.explanationBox}>
            <p style={styles.explanationText}>
              <strong>
                Step {Math.max(0, currentStep + 1)} of {animationSteps.length}:
              </strong>{" "}
              {explanation}
            </p>
          </div>

          {/* Traversal Result */}
          {traversalResult.length > 0 && (
            <div style={styles.traversalResult}>
              <p style={styles.traversalText}>
                <strong>Result:</strong> [{traversalResult.join(" → ")}]
              </p>
            </div>
          )}
        </div>

        {/* Educational Panel */}
        <div>
          <div style={styles.card}>
            <button
              style={styles.toggleButton}
              onClick={() => setShowEducation(!showEducation)}
            >
              {showEducation ? "▼ Hide" : "▶ Show"} Educational Content
            </button>

            {showEducation && (
              <>
                <h2 style={styles.cardTitle}>
                  <span>📚</span> Learning Center
                </h2>

                <div style={styles.educationSection}>
                  <h3 style={styles.sectionTitle}>💡 Intuition</h3>
                  <p style={styles.sectionContent}>
                    A Binary Tree is a hierarchical data structure where each
                    node has at most two children, referred to as left and
                    right. The topmost node is called the root.
                  </p>
                </div>

                <div style={styles.educationSection}>
                  <h3 style={styles.sectionTitle}>
                    🔧 Current Operation: {currentOp?.label}
                  </h3>
                  <p style={styles.sectionContent}>
                    {operation === "insert" &&
                      "Insert adds a new node. In a BST, values less than current go left, greater go right."}
                    {operation === "delete" &&
                      "Delete removes a node, handling three cases: leaf, one child, or two children (using inorder successor)."}
                    {operation === "search" &&
                      "Search traverses the tree comparing values to find the target node."}
                    {operation === "inorder" &&
                      "Inorder visits left subtree, then root, then right. For BST, this gives sorted order."}
                    {operation === "preorder" &&
                      "Preorder visits root first, then left subtree, then right. Used for tree copying."}
                    {operation === "postorder" &&
                      "Postorder visits left, then right, then root. Used for tree deletion."}
                    {operation === "levelorder" &&
                      "Level order uses BFS with a queue to visit nodes level by level."}
                    {operation === "findMin" &&
                      "In a BST, minimum is found by going left until no left child exists."}
                    {operation === "findMax" &&
                      "In a BST, maximum is found by going right until no right child exists."}
                    {operation === "height" &&
                      "Height is the number of edges on the longest path from root to leaf."}
                  </p>
                </div>

                <div style={styles.educationSection}>
                  <h3 style={styles.sectionTitle}>⚠️ Edge Cases</h3>
                  <ul
                    style={{
                      ...styles.sectionContent,
                      paddingLeft: "20px",
                      margin: "8px 0",
                    }}
                  >
                    <li>Empty tree (null root)</li>
                    <li>Single node tree</li>
                    <li>Skewed tree (all left or right)</li>
                    <li>Perfect binary tree</li>
                    <li>Deleting root with two children</li>
                  </ul>
                </div>

                <div style={styles.educationSection}>
                  <h3 style={styles.sectionTitle}>🎯 Interview Tips</h3>
                  <p style={styles.sectionContent}>
                    • Always clarify if it's a BST or general binary tree
                    <br />
                    • Consider iterative vs recursive solutions
                    <br />
                    • Watch for stack overflow with deep recursion
                    <br />• Practice Morris traversal for O(1) space
                  </p>
                </div>

                <div style={styles.educationSection}>
                  <h3 style={styles.sectionTitle}>📈 Key Properties</h3>
                  <p style={styles.sectionContent}>
                    • Max nodes at level L: 2^L
                    <br />
                    • Max nodes in tree of height h: 2^(h+1) - 1<br />
                    • Min height for n nodes: ⌊log₂(n)⌋
                    <br />• Leaves in full binary tree: (n+1)/2
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Quick Reference */}
          <div style={{ ...styles.card, marginTop: "16px" }}>
            <h2 style={styles.cardTitle}>
              <span>⌨️</span> Quick Reference
            </h2>
            <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
              <p>
                <strong>Insert:</strong> Enter value → Execute
              </p>
              <p>
                <strong>Search:</strong> Enter target → Execute
              </p>
              <p>
                <strong>Traversals:</strong> Select type → Execute
              </p>
              <p>
                <strong>Random:</strong> Click Generate button
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
