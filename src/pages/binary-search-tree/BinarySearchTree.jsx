import React, { useState, useEffect, useCallback, useRef } from "react";

/**
 * Binary Search Tree (BST) Complete Visualizer
 * ============================================
 * A comprehensive educational tool for understanding BST data structure
 *
 * BST Property: For every node, all values in left subtree < node value < all values in right subtree
 *
 * Features:
 * - Insert, Delete, Search operations
 * - All traversal types (Inorder, Preorder, Postorder, Level Order)
 * - Find Min/Max, Validate BST, Find Successor/Predecessor
 * - Step-by-step animation with auto-play
 * - Educational content with complexity analysis
 */

// ============================================
// BST NODE CLASS
// ============================================
class BSTNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
    this.id = Math.random().toString(36).substr(2, 9);
  }
}

// ============================================
// BINARY SEARCH TREE CLASS
// ============================================
class BinarySearchTree {
  constructor() {
    this.root = null;
  }

  // Deep clone the tree
  clone() {
    const newTree = new BinarySearchTree();
    newTree.root = this.cloneNode(this.root);
    return newTree;
  }

  cloneNode(node) {
    if (!node) return null;
    const newNode = new BSTNode(node.value);
    newNode.id = node.id;
    newNode.left = this.cloneNode(node.left);
    newNode.right = this.cloneNode(node.right);
    return newNode;
  }

  // ==========================================
  // INSERT OPERATION
  // BST Property: left < parent < right
  // ==========================================
  insert(value) {
    const steps = [];
    const newNode = new BSTNode(value);

    if (!this.root) {
      this.root = newNode;
      steps.push({
        type: "insert",
        nodeId: newNode.id,
        message: `Tree is empty. Inserting ${value} as the root node.`,
        highlighted: [newNode.id],
        comparing: [],
        code: "if (root == null) root = new Node(value);",
      });
      return steps;
    }

    let current = this.root;
    let parent = null;

    while (current) {
      parent = current;

      steps.push({
        type: "compare",
        nodeId: current.id,
        message: `Comparing ${value} with ${current.value}`,
        highlighted: [],
        comparing: [current.id],
        code: `if (${value} < ${current.value}) go left; else go right;`,
      });

      if (value < current.value) {
        steps.push({
          type: "move",
          nodeId: current.id,
          message: `${value} < ${current.value} → Move to LEFT subtree (BST property)`,
          highlighted: [],
          comparing: [],
          path: [current.id],
          direction: "left",
          code: "current = current.left;",
        });
        current = current.left;
      } else if (value > current.value) {
        steps.push({
          type: "move",
          nodeId: current.id,
          message: `${value} > ${current.value} → Move to RIGHT subtree (BST property)`,
          highlighted: [],
          comparing: [],
          path: [current.id],
          direction: "right",
          code: "current = current.right;",
        });
        current = current.right;
      } else {
        // Duplicate value - in standard BST, we can skip or go right
        steps.push({
          type: "duplicate",
          nodeId: current.id,
          message: `${value} == ${current.value} → Duplicate found! Going RIGHT (convention)`,
          highlighted: [current.id],
          comparing: [],
          code: "// Duplicate: go right or skip",
        });
        current = current.right;
      }
    }

    // Insert the new node
    if (value < parent.value) {
      parent.left = newNode;
      steps.push({
        type: "insert",
        nodeId: newNode.id,
        message: `Inserted ${value} as LEFT child of ${parent.value}`,
        highlighted: [newNode.id],
        comparing: [],
        code: "parent.left = new Node(value);",
      });
    } else {
      parent.right = newNode;
      steps.push({
        type: "insert",
        nodeId: newNode.id,
        message: `Inserted ${value} as RIGHT child of ${parent.value}`,
        highlighted: [newNode.id],
        comparing: [],
        code: "parent.right = new Node(value);",
      });
    }

    return steps;
  }

  // ==========================================
  // SEARCH OPERATION
  // ==========================================
  search(value) {
    const steps = [];
    let current = this.root;
    let comparisons = 0;

    if (!current) {
      steps.push({
        type: "empty",
        message: "Tree is empty. Cannot search.",
        highlighted: [],
        comparing: [],
        code: "if (root == null) return NOT_FOUND;",
      });
      return { found: false, steps, comparisons };
    }

    while (current) {
      comparisons++;
      steps.push({
        type: "compare",
        nodeId: current.id,
        message: `Comparison #${comparisons}: Is ${value} == ${current.value}?`,
        highlighted: [],
        comparing: [current.id],
        code: `if (${value} == ${current.value}) return FOUND;`,
      });

      if (value === current.value) {
        steps.push({
          type: "found",
          nodeId: current.id,
          message: `✓ FOUND ${value} after ${comparisons} comparison(s)!`,
          highlighted: [current.id],
          comparing: [],
          code: "return current; // Found!",
        });
        return { found: true, steps, node: current, comparisons };
      }

      if (value < current.value) {
        if (!current.left) {
          steps.push({
            type: "not-found",
            message: `${value} < ${current.value}, but no left child exists. Value NOT FOUND.`,
            highlighted: [],
            comparing: [],
            code: "return NOT_FOUND; // No left child",
          });
          return { found: false, steps, comparisons };
        }
        steps.push({
          type: "move",
          nodeId: current.left.id,
          message: `${value} < ${current.value} → Search LEFT subtree`,
          highlighted: [],
          comparing: [],
          path: [current.id],
          direction: "left",
          code: "current = current.left;",
        });
        current = current.left;
      } else {
        if (!current.right) {
          steps.push({
            type: "not-found",
            message: `${value} > ${current.value}, but no right child exists. Value NOT FOUND.`,
            highlighted: [],
            comparing: [],
            code: "return NOT_FOUND; // No right child",
          });
          return { found: false, steps, comparisons };
        }
        steps.push({
          type: "move",
          nodeId: current.right.id,
          message: `${value} > ${current.value} → Search RIGHT subtree`,
          highlighted: [],
          comparing: [],
          path: [current.id],
          direction: "right",
          code: "current = current.right;",
        });
        current = current.right;
      }
    }

    return { found: false, steps, comparisons };
  }

  // ==========================================
  // DELETE OPERATION
  // Three cases: Leaf, One child, Two children
  // ==========================================
  delete(value) {
    const steps = [];
    const result = this.deleteHelper(this.root, value, null, steps);
    this.root = result.node;
    return steps;
  }

  deleteHelper(node, value, parent, steps) {
    if (!node) {
      steps.push({
        type: "not-found",
        message: `Value ${value} not found in the BST.`,
        highlighted: [],
        comparing: [],
        code: "return null; // Value not found",
      });
      return { node: null, deleted: false };
    }

    steps.push({
      type: "compare",
      nodeId: node.id,
      message: `Searching: Comparing ${value} with ${node.value}`,
      highlighted: [],
      comparing: [node.id],
      code: `if (${value} < ${node.value}) searchLeft();`,
    });

    if (value < node.value) {
      const result = this.deleteHelper(node.left, value, node, steps);
      node.left = result.node;
      return { node, deleted: result.deleted };
    } else if (value > node.value) {
      const result = this.deleteHelper(node.right, value, node, steps);
      node.right = result.node;
      return { node, deleted: result.deleted };
    } else {
      // Found the node to delete
      steps.push({
        type: "found",
        nodeId: node.id,
        message: `Found node ${value} to delete. Analyzing case...`,
        highlighted: [node.id],
        comparing: [],
        code: "// Found node to delete",
      });

      // CASE 1: Leaf node (no children)
      if (!node.left && !node.right) {
        steps.push({
          type: "delete-leaf",
          nodeId: node.id,
          message: `CASE 1: Leaf node. Simply remove ${value}.`,
          highlighted: [],
          comparing: [],
          deleteCase: 1,
          code: "return null; // Remove leaf",
        });
        return { node: null, deleted: true };
      }

      // CASE 2: One child
      if (!node.left) {
        steps.push({
          type: "delete-one-child",
          nodeId: node.id,
          message: `CASE 2: One child (right). Replace ${value} with right child ${node.right.value}.`,
          highlighted: [node.right.id],
          comparing: [],
          deleteCase: 2,
          code: "return node.right; // Replace with right child",
        });
        return { node: node.right, deleted: true };
      }

      if (!node.right) {
        steps.push({
          type: "delete-one-child",
          nodeId: node.id,
          message: `CASE 2: One child (left). Replace ${value} with left child ${node.left.value}.`,
          highlighted: [node.left.id],
          comparing: [],
          deleteCase: 2,
          code: "return node.left; // Replace with left child",
        });
        return { node: node.left, deleted: true };
      }

      // CASE 3: Two children - find inorder successor
      steps.push({
        type: "delete-two-children",
        nodeId: node.id,
        message: `CASE 3: Two children. Finding inorder successor (smallest in right subtree)...`,
        highlighted: [],
        comparing: [node.id],
        deleteCase: 3,
        code: "// Find inorder successor",
      });

      let successor = node.right;
      let successorParent = node;

      while (successor.left) {
        steps.push({
          type: "find-successor",
          nodeId: successor.id,
          message: `Moving left to find minimum in right subtree...`,
          highlighted: [],
          comparing: [successor.id],
          code: "successor = successor.left;",
        });
        successorParent = successor;
        successor = successor.left;
      }

      steps.push({
        type: "successor-found",
        nodeId: successor.id,
        message: `Inorder successor found: ${successor.value}`,
        highlighted: [successor.id],
        comparing: [],
        code: `// Successor = ${successor.value}`,
      });

      // Copy successor value to current node
      const oldValue = node.value;
      node.value = successor.value;

      steps.push({
        type: "copy-value",
        nodeId: node.id,
        message: `Replace ${oldValue} with successor value ${successor.value}`,
        highlighted: [node.id],
        comparing: [],
        code: `node.value = ${successor.value};`,
      });

      // Delete the successor (which has at most one child)
      steps.push({
        type: "delete-successor",
        nodeId: successor.id,
        message: `Now delete the successor node ${successor.value} from right subtree`,
        highlighted: [],
        comparing: [successor.id],
        code: "deleteNode(successor);",
      });

      node.right = this.deleteSuccessor(node.right, successor.value, steps);

      return { node, deleted: true };
    }
  }

  deleteSuccessor(node, value, steps) {
    if (!node) return null;
    if (value < node.value) {
      node.left = this.deleteSuccessor(node.left, value, steps);
    } else if (value > node.value) {
      node.right = this.deleteSuccessor(node.right, value, steps);
    } else {
      if (!node.left) return node.right;
      if (!node.right) return node.left;
    }
    return node;
  }

  // ==========================================
  // TRAVERSAL OPERATIONS
  // ==========================================

  // Inorder: Left → Root → Right (gives SORTED order for BST!)
  inorderTraversal() {
    const steps = [];
    const result = [];

    steps.push({
      type: "start",
      message:
        "Starting INORDER traversal: Left → Root → Right. For BST, this gives SORTED order!",
      highlighted: [],
      comparing: [],
      result: [],
      code: "inorder(node.left); visit(node); inorder(node.right);",
    });

    this.inorderHelper(this.root, steps, result);

    steps.push({
      type: "complete",
      message: `Inorder traversal complete! Result is SORTED: [${result.join(", ")}]`,
      highlighted: [],
      comparing: [],
      result: [...result],
      code: "// Traversal complete",
    });

    return { steps, result };
  }

  inorderHelper(node, steps, result) {
    if (!node) return;

    // Visit left subtree
    if (node.left) {
      steps.push({
        type: "recurse-left",
        nodeId: node.id,
        message: `At ${node.value}: First, recurse LEFT to ${node.left.value}`,
        highlighted: [],
        comparing: [node.id],
        result: [...result],
        code: "inorder(node.left);",
      });
    }

    this.inorderHelper(node.left, steps, result);

    // Process current node
    result.push(node.value);
    steps.push({
      type: "process",
      nodeId: node.id,
      message: `VISIT node ${node.value} → Add to result`,
      highlighted: [node.id],
      comparing: [],
      result: [...result],
      code: `visit(${node.value});`,
    });

    // Visit right subtree
    if (node.right) {
      steps.push({
        type: "recurse-right",
        nodeId: node.id,
        message: `At ${node.value}: Now, recurse RIGHT to ${node.right.value}`,
        highlighted: [],
        comparing: [node.id],
        result: [...result],
        code: "inorder(node.right);",
      });
    }

    this.inorderHelper(node.right, steps, result);
  }

  // Preorder: Root → Left → Right
  preorderTraversal() {
    const steps = [];
    const result = [];

    steps.push({
      type: "start",
      message:
        "Starting PREORDER traversal: Root → Left → Right. Used for tree copying/serialization.",
      highlighted: [],
      comparing: [],
      result: [],
      code: "visit(node); preorder(node.left); preorder(node.right);",
    });

    this.preorderHelper(this.root, steps, result);

    steps.push({
      type: "complete",
      message: `Preorder traversal complete! Result: [${result.join(", ")}]`,
      highlighted: [],
      comparing: [],
      result: [...result],
      code: "// Traversal complete",
    });

    return { steps, result };
  }

  preorderHelper(node, steps, result) {
    if (!node) return;

    // Process current node FIRST
    result.push(node.value);
    steps.push({
      type: "process",
      nodeId: node.id,
      message: `VISIT node ${node.value} FIRST → Add to result`,
      highlighted: [node.id],
      comparing: [],
      result: [...result],
      code: `visit(${node.value});`,
    });

    // Then visit left
    this.preorderHelper(node.left, steps, result);

    // Then visit right
    this.preorderHelper(node.right, steps, result);
  }

  // Postorder: Left → Right → Root
  postorderTraversal() {
    const steps = [];
    const result = [];

    steps.push({
      type: "start",
      message:
        "Starting POSTORDER traversal: Left → Right → Root. Used for tree deletion.",
      highlighted: [],
      comparing: [],
      result: [],
      code: "postorder(node.left); postorder(node.right); visit(node);",
    });

    this.postorderHelper(this.root, steps, result);

    steps.push({
      type: "complete",
      message: `Postorder traversal complete! Result: [${result.join(", ")}]`,
      highlighted: [],
      comparing: [],
      result: [...result],
      code: "// Traversal complete",
    });

    return { steps, result };
  }

  postorderHelper(node, steps, result) {
    if (!node) return;

    // Visit left subtree first
    this.postorderHelper(node.left, steps, result);

    // Visit right subtree
    this.postorderHelper(node.right, steps, result);

    // Process current node LAST
    result.push(node.value);
    steps.push({
      type: "process",
      nodeId: node.id,
      message: `VISIT node ${node.value} LAST → Add to result`,
      highlighted: [node.id],
      comparing: [],
      result: [...result],
      code: `visit(${node.value});`,
    });
  }

  // Level Order (BFS)
  levelOrderTraversal() {
    const steps = [];
    const result = [];

    if (!this.root) {
      steps.push({
        type: "empty",
        message: "Tree is empty. Nothing to traverse.",
        highlighted: [],
        comparing: [],
        result: [],
      });
      return { steps, result };
    }

    const queue = [this.root];
    let level = 0;

    steps.push({
      type: "start",
      message: "Starting LEVEL ORDER (BFS) traversal using a queue.",
      highlighted: [],
      comparing: [],
      result: [],
      code: "Queue queue; queue.enqueue(root);",
    });

    while (queue.length > 0) {
      const levelSize = queue.length;

      steps.push({
        type: "level-start",
        message: `Processing Level ${level} (${levelSize} node${levelSize > 1 ? "s" : ""})`,
        highlighted: queue.map((n) => n.id),
        comparing: [],
        result: [...result],
        code: `// Level ${level}`,
      });

      for (let i = 0; i < levelSize; i++) {
        const node = queue.shift();
        result.push(node.value);

        steps.push({
          type: "dequeue",
          nodeId: node.id,
          message: `Dequeue and visit ${node.value}`,
          highlighted: [node.id],
          comparing: [],
          result: [...result],
          code: `node = queue.dequeue(); visit(${node.value});`,
        });

        if (node.left) {
          queue.push(node.left);
          steps.push({
            type: "enqueue",
            nodeId: node.left.id,
            message: `Enqueue left child ${node.left.value}`,
            highlighted: [],
            comparing: [node.left.id],
            result: [...result],
            code: `queue.enqueue(${node.left.value});`,
          });
        }

        if (node.right) {
          queue.push(node.right);
          steps.push({
            type: "enqueue",
            nodeId: node.right.id,
            message: `Enqueue right child ${node.right.value}`,
            highlighted: [],
            comparing: [node.right.id],
            result: [...result],
            code: `queue.enqueue(${node.right.value});`,
          });
        }
      }
      level++;
    }

    steps.push({
      type: "complete",
      message: `Level order traversal complete! Result: [${result.join(", ")}]`,
      highlighted: [],
      comparing: [],
      result: [...result],
    });

    return { steps, result };
  }

  // ==========================================
  // UTILITY OPERATIONS
  // ==========================================

  // Find Minimum (leftmost node)
  findMin() {
    const steps = [];

    if (!this.root) {
      steps.push({
        type: "empty",
        message: "Tree is empty. No minimum exists.",
        highlighted: [],
        comparing: [],
        code: "if (root == null) return null;",
      });
      return { value: null, steps };
    }

    steps.push({
      type: "start",
      message: "Finding MINIMUM: Keep going LEFT until no left child exists.",
      highlighted: [],
      comparing: [],
      code: "while (current.left != null) current = current.left;",
    });

    let current = this.root;
    while (current.left) {
      steps.push({
        type: "move",
        nodeId: current.id,
        message: `At ${current.value}, has left child → Move LEFT`,
        highlighted: [],
        comparing: [current.id],
        code: "current = current.left;",
      });
      current = current.left;
    }

    steps.push({
      type: "found",
      nodeId: current.id,
      message: `MINIMUM found: ${current.value} (no left child)`,
      highlighted: [current.id],
      comparing: [],
      code: `return ${current.value}; // Minimum`,
    });

    return { value: current.value, steps };
  }

  // Find Maximum (rightmost node)
  findMax() {
    const steps = [];

    if (!this.root) {
      steps.push({
        type: "empty",
        message: "Tree is empty. No maximum exists.",
        highlighted: [],
        comparing: [],
        code: "if (root == null) return null;",
      });
      return { value: null, steps };
    }

    steps.push({
      type: "start",
      message: "Finding MAXIMUM: Keep going RIGHT until no right child exists.",
      highlighted: [],
      comparing: [],
      code: "while (current.right != null) current = current.right;",
    });

    let current = this.root;
    while (current.right) {
      steps.push({
        type: "move",
        nodeId: current.id,
        message: `At ${current.value}, has right child → Move RIGHT`,
        highlighted: [],
        comparing: [current.id],
        code: "current = current.right;",
      });
      current = current.right;
    }

    steps.push({
      type: "found",
      nodeId: current.id,
      message: `MAXIMUM found: ${current.value} (no right child)`,
      highlighted: [current.id],
      comparing: [],
      code: `return ${current.value}; // Maximum`,
    });

    return { value: current.value, steps };
  }

  // Validate BST
  validateBST() {
    const steps = [];

    steps.push({
      type: "start",
      message:
        "Validating BST property: Every node must satisfy left < node < right",
      highlighted: [],
      comparing: [],
      code: "validate(node, min, max)",
    });

    const isValid = this.validateHelper(this.root, -Infinity, Infinity, steps);

    steps.push({
      type: isValid ? "valid" : "invalid",
      message: isValid
        ? "✓ Tree is a VALID BST!"
        : "✗ Tree is NOT a valid BST!",
      highlighted: [],
      comparing: [],
      code: isValid ? "return true;" : "return false;",
    });

    return { isValid, steps };
  }

  validateHelper(node, min, max, steps) {
    if (!node) return true;

    steps.push({
      type: "check",
      nodeId: node.id,
      message: `Checking ${node.value}: Must be in range (${min === -Infinity ? "-∞" : min}, ${max === Infinity ? "∞" : max})`,
      highlighted: [],
      comparing: [node.id],
      code: `if (${node.value} <= ${min} || ${node.value} >= ${max}) return false;`,
    });

    if (node.value <= min || node.value >= max) {
      steps.push({
        type: "violation",
        nodeId: node.id,
        message: `✗ VIOLATION: ${node.value} is out of valid range!`,
        highlighted: [node.id],
        comparing: [],
        code: "return false; // BST violation",
      });
      return false;
    }

    steps.push({
      type: "valid-node",
      nodeId: node.id,
      message: `✓ ${node.value} is valid. Checking children...`,
      highlighted: [node.id],
      comparing: [],
      code: "validate(left, min, node.val) && validate(right, node.val, max)",
    });

    return (
      this.validateHelper(node.left, min, node.value, steps) &&
      this.validateHelper(node.right, node.value, max, steps)
    );
  }

  // Get Height
  getHeight() {
    const steps = [];

    steps.push({
      type: "start",
      message: "Calculating tree height (longest path from root to leaf)",
      highlighted: [],
      comparing: [],
      code: "height = max(height(left), height(right)) + 1",
    });

    const height = this.heightHelper(this.root, steps, 0);

    steps.push({
      type: "complete",
      message: `Tree height: ${height} (edges from root to deepest leaf)`,
      highlighted: [],
      comparing: [],
      code: `return ${height};`,
    });

    return { height, steps };
  }

  heightHelper(node, steps, depth) {
    if (!node) return -1;

    steps.push({
      type: "visit",
      nodeId: node.id,
      message: `At node ${node.value} (depth: ${depth})`,
      highlighted: [],
      comparing: [node.id],
      code: `// Processing ${node.value}`,
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
      code: `return max(${leftHeight}, ${rightHeight}) + 1;`,
    });

    return nodeHeight;
  }

  // Count Nodes
  countNodes() {
    const steps = [];
    const count = this.countHelper(this.root, steps);

    steps.push({
      type: "complete",
      message: `Total nodes in BST: ${count}`,
      highlighted: [],
      comparing: [],
    });

    return { count, steps };
  }

  countHelper(node, steps) {
    if (!node) return 0;

    steps.push({
      type: "count",
      nodeId: node.id,
      message: `Counting node ${node.value}`,
      highlighted: [node.id],
      comparing: [],
    });

    return (
      1 +
      this.countHelper(node.left, steps) +
      this.countHelper(node.right, steps)
    );
  }
}

// ============================================
// MAIN VISUALIZER COMPONENT
// ============================================
export default function BSTVisualizer() {
  // State management
  const [tree, setTree] = useState(new BinarySearchTree());
  const [inputValue, setInputValue] = useState("");
  const [operation, setOperation] = useState("insert");
  const [animationSteps, setAnimationSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);
  const [highlightedNodes, setHighlightedNodes] = useState([]);
  const [comparingNodes, setComparingNodes] = useState([]);
  const [pathNodes, setPathNodes] = useState([]);
  const [explanation, setExplanation] = useState(
    "Welcome to BST Visualizer! Start by inserting nodes or generating a random tree.",
  );
  const [codeSnippet, setCodeSnippet] = useState("");
  const [traversalResult, setTraversalResult] = useState([]);
  const [showEducation, setShowEducation] = useState(true);
  const [deleteCase, setDeleteCase] = useState(null);

  const animationRef = useRef(null);

  // Operations configuration
  const operations = [
    {
      value: "insert",
      label: "➕ Insert",
      needsInput: true,
      category: "basic",
    },
    {
      value: "delete",
      label: "➖ Delete",
      needsInput: true,
      category: "basic",
    },
    {
      value: "search",
      label: "🔍 Search",
      needsInput: true,
      category: "basic",
    },
    {
      value: "inorder",
      label: "📋 Inorder (Sorted)",
      needsInput: false,
      category: "traversal",
    },
    {
      value: "preorder",
      label: "📋 Preorder",
      needsInput: false,
      category: "traversal",
    },
    {
      value: "postorder",
      label: "📋 Postorder",
      needsInput: false,
      category: "traversal",
    },
    {
      value: "levelorder",
      label: "📋 Level Order (BFS)",
      needsInput: false,
      category: "traversal",
    },
    {
      value: "findMin",
      label: "⬇️ Find Minimum",
      needsInput: false,
      category: "utility",
    },
    {
      value: "findMax",
      label: "⬆️ Find Maximum",
      needsInput: false,
      category: "utility",
    },
    {
      value: "validate",
      label: "✓ Validate BST",
      needsInput: false,
      category: "utility",
    },
    {
      value: "height",
      label: "📏 Get Height",
      needsInput: false,
      category: "utility",
    },
  ];

  // Complexity information
  const complexityInfo = {
    insert: {
      time: "O(h) → O(log n) avg, O(n) worst",
      space: "O(1) iterative, O(h) recursive",
      best: "Balanced tree",
      worst: "Skewed tree (linked list)",
    },
    delete: {
      time: "O(h) → O(log n) avg, O(n) worst",
      space: "O(h) recursive stack",
      best: "Leaf node deletion",
      worst: "Node with 2 children in skewed tree",
    },
    search: {
      time: "O(h) → O(log n) avg, O(n) worst",
      space: "O(1) iterative",
      best: "Root is target",
      worst: "Target at leaf of skewed tree",
    },
    inorder: {
      time: "O(n)",
      space: "O(h) recursive stack",
      best: "Gives sorted output",
      worst: "Same as average",
    },
    preorder: {
      time: "O(n)",
      space: "O(h) recursive stack",
      best: "Used for tree serialization",
      worst: "Same as average",
    },
    postorder: {
      time: "O(n)",
      space: "O(h) recursive stack",
      best: "Used for tree deletion",
      worst: "Same as average",
    },
    levelorder: {
      time: "O(n)",
      space: "O(w) where w = max width",
      best: "Narrow tree",
      worst: "Complete tree (w = n/2)",
    },
    findMin: {
      time: "O(h)",
      space: "O(1)",
      best: "Root has no left child",
      worst: "Leftmost path is longest",
    },
    findMax: {
      time: "O(h)",
      space: "O(1)",
      best: "Root has no right child",
      worst: "Rightmost path is longest",
    },
    validate: {
      time: "O(n)",
      space: "O(h) recursive stack",
      best: "Violation at root",
      worst: "Valid tree (check all nodes)",
    },
    height: {
      time: "O(n)",
      space: "O(h) recursive stack",
      best: "Single node",
      worst: "Full traversal needed",
    },
  };

  // Execute operation
  const executeOperation = useCallback(() => {
    const newTree = tree.clone();
    let steps = [];

    switch (operation) {
      case "insert": {
        const value = parseInt(inputValue);
        if (isNaN(value)) {
          setExplanation("⚠️ Please enter a valid integer");
          return;
        }
        steps = newTree.insert(value);
        setTree(newTree);
        break;
      }
      case "delete": {
        const value = parseInt(inputValue);
        if (isNaN(value)) {
          setExplanation("⚠️ Please enter a valid integer");
          return;
        }
        steps = newTree.delete(value);
        setTree(newTree);
        break;
      }
      case "search": {
        const value = parseInt(inputValue);
        if (isNaN(value)) {
          setExplanation("⚠️ Please enter a valid integer");
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
      case "validate": {
        const result = newTree.validateBST();
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
    setPathNodes([]);
    setDeleteCase(null);
    setCodeSnippet("");
    if (steps.length > 0) {
      setExplanation('🎬 Ready to animate. Click "Step" or "Play" to begin.');
    }
  }, [tree, operation, inputValue]);

  // Animation step handler
  useEffect(() => {
    if (currentStep >= 0 && currentStep < animationSteps.length) {
      const step = animationSteps[currentStep];
      setHighlightedNodes(step.highlighted || []);
      setComparingNodes(step.comparing || []);
      setPathNodes(step.path || []);
      setExplanation(step.message);
      setCodeSnippet(step.code || "");
      if (step.result) {
        setTraversalResult(step.result);
      }
      if (step.deleteCase) {
        setDeleteCase(step.deleteCase);
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
    setPathNodes([]);
    setTraversalResult([]);
    setDeleteCase(null);
    setCodeSnippet("");
    setExplanation("🔄 Animation reset. Ready for next operation.");
  };

  const handleClearTree = () => {
    setTree(new BinarySearchTree());
    setAnimationSteps([]);
    setCurrentStep(-1);
    setHighlightedNodes([]);
    setComparingNodes([]);
    setPathNodes([]);
    setTraversalResult([]);
    setDeleteCase(null);
    setCodeSnippet("");
    setExplanation("🗑️ Tree cleared. Start fresh by inserting nodes!");
  };

  const generateRandomBST = () => {
    const newTree = new BinarySearchTree();
    const count = Math.floor(Math.random() * 5) + 6; // 6-10 nodes
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
    setPathNodes([]);
    setTraversalResult([]);
    setDeleteCase(null);
    setCodeSnippet("");
    setExplanation(`🎲 Generated BST with ${count} random nodes!`);
  };

  const generateBalancedBST = () => {
    const newTree = new BinarySearchTree();
    // Create a balanced BST with values that will produce balanced structure
    const values = [50, 25, 75, 12, 37, 62, 87];
    values.forEach((value) => newTree.insert(value));
    setTree(newTree);
    setAnimationSteps([]);
    setCurrentStep(-1);
    setHighlightedNodes([]);
    setComparingNodes([]);
    setPathNodes([]);
    setTraversalResult([]);
    setDeleteCase(null);
    setCodeSnippet("");
    setExplanation("🌲 Generated a balanced BST for optimal operations!");
  };

  // Calculate node positions for SVG
  const calculateNodePositions = useCallback(() => {
    const nodes = [];
    const edges = [];

    if (!tree.root) return { nodes, edges };

    const positionNodes = (node, x, y, level, minX, maxX) => {
      if (!node) return;

      const nodeData = {
        id: node.id,
        value: node.value,
        x: x,
        y: y,
        isHighlighted: highlightedNodes.includes(node.id),
        isComparing: comparingNodes.includes(node.id),
        isPath: pathNodes.includes(node.id),
      };
      nodes.push(nodeData);

      const childY = y + 70;
      const spread = Math.max(40, (maxX - minX) / 4);

      if (node.left) {
        const leftX = x - spread;
        edges.push({
          id: `${node.id}-${node.left.id}`,
          x1: x,
          y1: y + 22,
          x2: leftX,
          y2: childY - 22,
          label: "<",
        });
        positionNodes(node.left, leftX, childY, level + 1, minX, x);
      }

      if (node.right) {
        const rightX = x + spread;
        edges.push({
          id: `${node.id}-${node.right.id}`,
          x1: x,
          y1: y + 22,
          x2: rightX,
          y2: childY - 22,
          label: ">",
        });
        positionNodes(node.right, rightX, childY, level + 1, x, maxX);
      }
    };

    positionNodes(tree.root, 400, 45, 0, 50, 750);
    return { nodes, edges };
  }, [tree, highlightedNodes, comparingNodes, pathNodes]);

  const { nodes: treeNodes, edges: treeEdges } = calculateNodePositions();
  const currentOp = operations.find((op) => op.value === operation);

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.title}>🌲 Binary Search Tree Visualizer</h1>
        <p style={styles.subtitle}>
          Master BST operations with interactive step-by-step animations
        </p>
      </header>

      <div style={styles.mainContent}>
        {/* Left Panel - Controls */}
        <div style={styles.leftPanel}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>
              <span>⚙️</span> Control Panel
            </h2>

            {/* Operation Selector */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Select Operation</label>
              <select
                style={styles.select}
                value={operation}
                onChange={(e) => {
                  setOperation(e.target.value);
                  setAnimationSteps([]);
                  setCurrentStep(-1);
                }}
              >
                <optgroup label="Basic Operations">
                  {operations
                    .filter((op) => op.category === "basic")
                    .map((op) => (
                      <option key={op.value} value={op.value}>
                        {op.label}
                      </option>
                    ))}
                </optgroup>
                <optgroup label="Traversals">
                  {operations
                    .filter((op) => op.category === "traversal")
                    .map((op) => (
                      <option key={op.value} value={op.value}>
                        {op.label}
                      </option>
                    ))}
                </optgroup>
                <optgroup label="Utility">
                  {operations
                    .filter((op) => op.category === "utility")
                    .map((op) => (
                      <option key={op.value} value={op.value}>
                        {op.label}
                      </option>
                    ))}
                </optgroup>
              </select>
            </div>

            {/* Value Input */}
            {currentOp?.needsInput && (
              <div style={styles.inputGroup}>
                <label style={styles.label}>Enter Value</label>
                <input
                  type="number"
                  style={styles.input}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Enter integer..."
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
                  onClick={handleClearTree}
                >
                  🗑 Clear
                </button>
              </div>
            </div>

            {/* Tree Generators */}
            <div style={styles.controlSection}>
              <label style={styles.label}>Generate Tree</label>
              <div style={styles.buttonGroup}>
                <button
                  style={{ ...styles.button, ...styles.accentButton, flex: 1 }}
                  onClick={generateRandomBST}
                >
                  🎲 Random
                </button>
                <button
                  style={{ ...styles.button, ...styles.accentButton, flex: 1 }}
                  onClick={generateBalancedBST}
                >
                  ⚖️ Balanced
                </button>
              </div>
            </div>

            {/* Speed Control */}
            <div style={styles.controlSection}>
              <label style={styles.label}>
                Speed:{" "}
                {speed <= 400 ? "Fast" : speed <= 800 ? "Medium" : "Slow"} (
                {Math.round((1000 / speed) * 10) / 10}x)
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
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
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
                <span>Found / Active</span>
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
                <span>Visited Path</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Panel - Visualization */}
        <div style={styles.centerPanel}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>
              <span>🎨</span> BST Visualization
              <span style={styles.bstBadge}>
                BST Property: left &lt; node &lt; right
              </span>
            </h2>

            <div style={styles.visualizationArea}>
              <svg style={styles.svg} viewBox="0 0 800 380">
                {/* Definitions */}
                <defs>
                  <linearGradient
                    id="normalGrad"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                  <linearGradient
                    id="highlightGrad"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                  <linearGradient
                    id="compareGrad"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#d97706" />
                  </linearGradient>
                  <linearGradient
                    id="pathGrad"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#ec4899" />
                    <stop offset="100%" stopColor="#db2777" />
                  </linearGradient>
                  <filter
                    id="nodeShadow"
                    x="-30%"
                    y="-30%"
                    width="160%"
                    height="160%"
                  >
                    <feDropShadow
                      dx="0"
                      dy="3"
                      stdDeviation="3"
                      floodOpacity="0.15"
                    />
                  </filter>
                  <filter
                    id="glowFilter"
                    x="-50%"
                    y="-50%"
                    width="200%"
                    height="200%"
                  >
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <pattern
                    id="gridPattern"
                    width="30"
                    height="30"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M 30 0 L 0 0 0 30"
                      fill="none"
                      stroke="#f1f5f9"
                      strokeWidth="0.5"
                    />
                  </pattern>
                </defs>

                {/* Background */}
                <rect width="100%" height="100%" fill="#fafbfc" />
                <rect width="100%" height="100%" fill="url(#gridPattern)" />

                {/* Edges */}
                {treeEdges.map((edge) => (
                  <g key={edge.id}>
                    <line
                      x1={edge.x1}
                      y1={edge.y1}
                      x2={edge.x2}
                      y2={edge.y2}
                      stroke="#cbd5e1"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    {/* Edge label showing BST comparison */}
                    <text
                      x={
                        (edge.x1 + edge.x2) / 2 +
                        (edge.label === "<" ? -12 : 12)
                      }
                      y={(edge.y1 + edge.y2) / 2}
                      fontSize="14"
                      fontWeight="bold"
                      fill="#94a3b8"
                      textAnchor="middle"
                    >
                      {edge.label}
                    </text>
                  </g>
                ))}

                {/* Nodes */}
                {treeNodes.map((node) => {
                  const gradient = node.isHighlighted
                    ? "url(#highlightGrad)"
                    : node.isComparing
                      ? "url(#compareGrad)"
                      : node.isPath
                        ? "url(#pathGrad)"
                        : "url(#normalGrad)";
                  const isActive = node.isHighlighted || node.isComparing;

                  return (
                    <g
                      key={node.id}
                      style={{ transition: "transform 0.3s ease" }}
                    >
                      {/* Node glow effect for active nodes */}
                      {isActive && (
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r="30"
                          fill={node.isHighlighted ? "#10b98133" : "#f59e0b33"}
                          style={{ animation: "pulse 1s ease-in-out infinite" }}
                        />
                      )}
                      {/* Main node circle */}
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r="22"
                        fill={gradient}
                        filter="url(#nodeShadow)"
                        style={{
                          transition: "all 0.3s ease",
                          transform: isActive ? "scale(1.1)" : "scale(1)",
                          transformOrigin: `${node.x}px ${node.y}px`,
                        }}
                      />
                      {/* Node value */}
                      <text
                        x={node.x}
                        y={node.y}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="white"
                        fontSize="14"
                        fontWeight="700"
                        style={{
                          pointerEvents: "none",
                          textShadow: "0 1px 2px rgba(0,0,0,0.2)",
                        }}
                      >
                        {node.value}
                      </text>
                    </g>
                  );
                })}

                {/* Empty tree message */}
                {treeNodes.length === 0 && (
                  <g>
                    <rect
                      x="250"
                      y="160"
                      width="300"
                      height="60"
                      rx="12"
                      fill="#f1f5f9"
                    />
                    <text
                      x="400"
                      y="195"
                      textAnchor="middle"
                      fill="#64748b"
                      fontSize="16"
                      fontWeight="500"
                    >
                      Tree is empty. Insert nodes to begin!
                    </text>
                  </g>
                )}
              </svg>

              {/* CSS Animation */}
              <style>{`
                @keyframes pulse {
                  0%, 100% { opacity: 0.6; }
                  50% { opacity: 1; }
                }
              `}</style>
            </div>

            {/* Explanation Box */}
            <div style={styles.explanationBox}>
              <div style={styles.explanationHeader}>
                <span style={styles.stepBadge}>
                  Step {Math.max(0, currentStep + 1)}
                </span>
                <span style={styles.operationBadge}>{currentOp?.label}</span>
              </div>
              <p style={styles.explanationText}>{explanation}</p>

              {/* Code Snippet */}
              {codeSnippet && (
                <div style={styles.codeBox}>
                  <code style={styles.codeText}>{codeSnippet}</code>
                </div>
              )}
            </div>

            {/* Traversal Result */}
            {traversalResult.length > 0 && (
              <div style={styles.resultBox}>
                <strong>📋 Result: </strong>
                <span style={styles.resultArray}>
                  [{traversalResult.join(" → ")}]
                </span>
              </div>
            )}

            {/* Delete Case Indicator */}
            {deleteCase && (
              <div style={styles.deleteCaseBox}>
                <strong>🗑️ Delete Case {deleteCase}:</strong>
                {deleteCase === 1 && " Leaf Node (no children)"}
                {deleteCase === 2 && " One Child"}
                {deleteCase === 3 && " Two Children (use inorder successor)"}
              </div>
            )}
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
                {/* BST Property */}
                <div style={styles.educationSection}>
                  <h3 style={styles.sectionTitle}>🔑 BST Property</h3>
                  <div style={styles.propertyBox}>
                    <p style={styles.propertyText}>
                      For every node N:
                      <br />• All values in{" "}
                      <strong style={{ color: "#ef4444" }}>
                        left subtree
                      </strong>{" "}
                      &lt; N<br />• All values in{" "}
                      <strong style={{ color: "#22c55e" }}>
                        right subtree
                      </strong>{" "}
                      &gt; N
                    </p>
                  </div>
                </div>

                {/* Current Operation */}
                <div style={styles.educationSection}>
                  <h3 style={styles.sectionTitle}>
                    🔧 {currentOp?.label.replace(/[^\w\s]/g, "").trim()}
                  </h3>
                  <p style={styles.sectionContent}>
                    {operation === "insert" &&
                      "Navigate using BST property: go left if value < current, right if value > current. Insert when you reach a null position."}
                    {operation === "delete" &&
                      "Three cases: (1) Leaf - remove directly. (2) One child - replace with child. (3) Two children - replace with inorder successor."}
                    {operation === "search" &&
                      "Use BST property to eliminate half the tree each step. Much faster than linear search!"}
                    {operation === "inorder" &&
                      "Visit left subtree, then root, then right. For BST, this produces SORTED output!"}
                    {operation === "preorder" &&
                      "Visit root first, then left, then right. Used for tree serialization/copying."}
                    {operation === "postorder" &&
                      "Visit left, then right, then root last. Used for tree deletion (children before parent)."}
                    {operation === "levelorder" &&
                      "Use a queue to visit nodes level by level (BFS). Useful for level-based operations."}
                    {operation === "findMin" &&
                      "In BST, minimum is always the leftmost node. Keep going left until no left child."}
                    {operation === "findMax" &&
                      "In BST, maximum is always the rightmost node. Keep going right until no right child."}
                    {operation === "validate" &&
                      "Check that every node satisfies: min < node.value < max. Pass constraints down recursively."}
                    {operation === "height" &&
                      "Height = longest path from root to leaf. Calculated as max(leftHeight, rightHeight) + 1."}
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
                        <td style={styles.tableLabel}>Best Case</td>
                        <td style={styles.tableValue}>
                          {complexityInfo[operation]?.best}
                        </td>
                      </tr>
                      <tr>
                        <td style={styles.tableLabel}>Worst Case</td>
                        <td style={styles.tableValue}>
                          {complexityInfo[operation]?.worst}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Edge Cases */}
                <div style={styles.educationSection}>
                  <h3 style={styles.sectionTitle}>⚠️ Edge Cases</h3>
                  <ul style={styles.edgeCaseList}>
                    <li>Empty tree (null root)</li>
                    <li>Single node tree</li>
                    <li>Skewed tree (all left or right)</li>
                    <li>Duplicate values</li>
                    <li>Delete root with two children</li>
                    <li>Search for non-existent value</li>
                  </ul>
                </div>

                {/* Interview Tips */}
                <div style={styles.educationSection}>
                  <h3 style={styles.sectionTitle}>💡 Interview Tips</h3>
                  <ul style={styles.tipsList}>
                    <li>Always clarify if BST or regular binary tree</li>
                    <li>BST enables O(log n) search when balanced</li>
                    <li>Inorder traversal = sorted array</li>
                    <li>Consider self-balancing trees (AVL, Red-Black)</li>
                    <li>Height h = log₂(n) for balanced, n for skewed</li>
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
    background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
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
      "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    margin: "0 0 6px 0",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    fontSize: "1rem",
    color: "#64748b",
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
    border: "1px solid #f1f5f9",
  },
  cardTitle: {
    fontSize: "1rem",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "14px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  bstBadge: {
    marginLeft: "auto",
    fontSize: "0.7rem",
    fontWeight: "600",
    color: "#6366f1",
    background: "#eef2ff",
    padding: "4px 8px",
    borderRadius: "6px",
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
    transition: "border-color 0.2s, box-shadow 0.2s",
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
    background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
    color: "white",
    boxShadow: "0 2px 8px rgba(99, 102, 241, 0.3)",
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
    background: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)",
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
    background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
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
  visualizationArea: {
    minHeight: "380px",
    position: "relative",
    background: "#fafbfc",
    borderRadius: "12px",
    overflow: "hidden",
    border: "1px solid #e2e8f0",
  },
  svg: {
    width: "100%",
    height: "380px",
  },
  explanationBox: {
    marginTop: "14px",
    padding: "14px",
    background: "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)",
    borderRadius: "12px",
    border: "1px solid #c7d2fe",
  },
  explanationHeader: {
    display: "flex",
    gap: "8px",
    marginBottom: "8px",
  },
  stepBadge: {
    fontSize: "0.75rem",
    fontWeight: "700",
    color: "#4f46e5",
    background: "white",
    padding: "3px 8px",
    borderRadius: "6px",
  },
  operationBadge: {
    fontSize: "0.75rem",
    fontWeight: "600",
    color: "#7c3aed",
    background: "rgba(255,255,255,0.7)",
    padding: "3px 8px",
    borderRadius: "6px",
  },
  explanationText: {
    fontSize: "0.9rem",
    color: "#3730a3",
    margin: 0,
    lineHeight: "1.5",
  },
  codeBox: {
    marginTop: "10px",
    padding: "10px",
    background: "#1e1e2e",
    borderRadius: "8px",
    overflow: "auto",
  },
  codeText: {
    fontSize: "0.8rem",
    color: "#a5f3fc",
    fontFamily: "'Fira Code', 'Consolas', monospace",
  },
  resultBox: {
    marginTop: "12px",
    padding: "12px",
    background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
    borderRadius: "10px",
    border: "1px solid #fcd34d",
    fontSize: "0.9rem",
    color: "#92400e",
  },
  resultArray: {
    fontFamily: "'Fira Code', monospace",
    fontWeight: "600",
  },
  deleteCaseBox: {
    marginTop: "12px",
    padding: "12px",
    background: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
    borderRadius: "10px",
    border: "1px solid #fca5a5",
    fontSize: "0.85rem",
    color: "#991b1b",
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
    background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
    borderRadius: "10px",
    padding: "12px",
    border: "1px solid #bbf7d0",
  },
  propertyText: {
    fontSize: "0.8rem",
    color: "#166534",
    margin: 0,
    lineHeight: "1.6",
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
    width: "35%",
  },
  tableValue: {
    padding: "8px",
    color: "#64748b",
    borderBottom: "1px solid #e2e8f0",
  },
  edgeCaseList: {
    fontSize: "0.8rem",
    color: "#64748b",
    paddingLeft: "18px",
    margin: "0",
    lineHeight: "1.8",
  },
  tipsList: {
    fontSize: "0.8rem",
    color: "#64748b",
    paddingLeft: "18px",
    margin: "0",
    lineHeight: "1.8",
  },
};
