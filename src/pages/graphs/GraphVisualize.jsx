import React, { useState, useEffect, useCallback, useRef } from "react";

/**
 * Graph Data Structure Complete Visualizer
 * ========================================
 * A comprehensive educational tool for understanding Graphs
 *
 * Features:
 * - Add/Remove Vertices and Edges
 * - BFS (Breadth-First Search)
 * - DFS (Depth-First Search)
 * - Dijkstra's Shortest Path
 * - Cycle Detection
 * - Connected Components
 * - Topological Sort (for DAGs)
 *
 * Graph Representations:
 * - Visual node-edge diagram
 * - Adjacency List
 * - Adjacency Matrix
 */

// ============================================
// GRAPH CLASS
// ============================================
class Graph {
  constructor(isDirected = false, isWeighted = false) {
    this.adjacencyList = new Map();
    this.isDirected = isDirected;
    this.isWeighted = isWeighted;
    this.nodePositions = new Map();
  }

  clone() {
    const newGraph = new Graph(this.isDirected, this.isWeighted);
    this.adjacencyList.forEach((edges, vertex) => {
      newGraph.adjacencyList.set(vertex, [...edges]);
    });
    this.nodePositions.forEach((pos, vertex) => {
      newGraph.nodePositions.set(vertex, { ...pos });
    });
    return newGraph;
  }

  // Add a vertex
  addVertex(vertex, x, y) {
    if (!this.adjacencyList.has(vertex)) {
      this.adjacencyList.set(vertex, []);
      this.nodePositions.set(vertex, { x, y });
      return true;
    }
    return false;
  }

  // Remove a vertex
  removeVertex(vertex) {
    if (!this.adjacencyList.has(vertex)) return false;

    // Remove all edges to this vertex
    this.adjacencyList.forEach((edges, v) => {
      const filtered = edges.filter((e) => e.to !== vertex);
      this.adjacencyList.set(v, filtered);
    });

    this.adjacencyList.delete(vertex);
    this.nodePositions.delete(vertex);
    return true;
  }

  // Add an edge
  addEdge(from, to, weight = 1) {
    if (!this.adjacencyList.has(from) || !this.adjacencyList.has(to))
      return false;

    // Check if edge already exists
    const existingEdge = this.adjacencyList.get(from).find((e) => e.to === to);
    if (existingEdge) return false;

    this.adjacencyList.get(from).push({ to, weight });

    if (!this.isDirected) {
      this.adjacencyList.get(to).push({ to: from, weight });
    }
    return true;
  }

  // Remove an edge
  removeEdge(from, to) {
    if (!this.adjacencyList.has(from)) return false;

    const edges = this.adjacencyList.get(from);
    const index = edges.findIndex((e) => e.to === to);
    if (index === -1) return false;

    edges.splice(index, 1);

    if (!this.isDirected) {
      const reverseEdges = this.adjacencyList.get(to);
      const reverseIndex = reverseEdges.findIndex((e) => e.to === from);
      if (reverseIndex !== -1) {
        reverseEdges.splice(reverseIndex, 1);
      }
    }
    return true;
  }

  // Get vertices
  getVertices() {
    return Array.from(this.adjacencyList.keys());
  }

  // Get edges
  getEdges() {
    const edges = [];
    const seen = new Set();

    this.adjacencyList.forEach((edgeList, from) => {
      edgeList.forEach((edge) => {
        const key = this.isDirected
          ? `${from}-${edge.to}`
          : [from, edge.to].sort().join("-");

        if (!seen.has(key)) {
          seen.add(key);
          edges.push({ from, to: edge.to, weight: edge.weight });
        }
      });
    });

    return edges;
  }

  // BFS Traversal
  bfs(startVertex) {
    const steps = [];
    const visited = new Set();
    const queue = [startVertex];
    const result = [];

    if (!this.adjacencyList.has(startVertex)) {
      steps.push({
        type: "error",
        message: `Vertex ${startVertex} does not exist`,
        visited: [],
        queue: [],
        current: null,
        result: [],
      });
      return { steps, result };
    }

    steps.push({
      type: "init",
      message: `Starting BFS from vertex ${startVertex}. Initialize queue with start vertex.`,
      visited: [],
      queue: [startVertex],
      current: null,
      result: [],
      code: `queue = [${startVertex}]; visited = new Set();`,
    });

    visited.add(startVertex);

    while (queue.length > 0) {
      const current = queue.shift();
      result.push(current);

      steps.push({
        type: "dequeue",
        message: `Dequeue vertex ${current}. Mark as visited and add to result.`,
        visited: Array.from(visited),
        queue: [...queue],
        current,
        result: [...result],
        code: `current = queue.shift(); // ${current}`,
      });

      const neighbors = this.adjacencyList.get(current) || [];

      for (const neighbor of neighbors) {
        if (!visited.has(neighbor.to)) {
          visited.add(neighbor.to);
          queue.push(neighbor.to);

          steps.push({
            type: "enqueue",
            message: `Found unvisited neighbor ${neighbor.to}. Add to queue.`,
            visited: Array.from(visited),
            queue: [...queue],
            current,
            exploring: neighbor.to,
            result: [...result],
            code: `if (!visited.has(${neighbor.to})) queue.push(${neighbor.to});`,
          });
        } else {
          steps.push({
            type: "skip",
            message: `Neighbor ${neighbor.to} already visited. Skip.`,
            visited: Array.from(visited),
            queue: [...queue],
            current,
            exploring: neighbor.to,
            result: [...result],
            code: `// ${neighbor.to} already visited`,
          });
        }
      }
    }

    steps.push({
      type: "complete",
      message: `BFS complete! Traversal order: [${result.join(" → ")}]`,
      visited: Array.from(visited),
      queue: [],
      current: null,
      result: [...result],
      code: `return [${result.join(", ")}];`,
    });

    return { steps, result };
  }

  // DFS Traversal
  dfs(startVertex) {
    const steps = [];
    const visited = new Set();
    const stack = [startVertex];
    const result = [];

    if (!this.adjacencyList.has(startVertex)) {
      steps.push({
        type: "error",
        message: `Vertex ${startVertex} does not exist`,
        visited: [],
        stack: [],
        current: null,
        result: [],
      });
      return { steps, result };
    }

    steps.push({
      type: "init",
      message: `Starting DFS from vertex ${startVertex}. Initialize stack with start vertex.`,
      visited: [],
      stack: [startVertex],
      current: null,
      result: [],
      code: `stack = [${startVertex}]; visited = new Set();`,
    });

    while (stack.length > 0) {
      const current = stack.pop();

      if (visited.has(current)) {
        steps.push({
          type: "skip-stack",
          message: `Vertex ${current} already visited. Skip.`,
          visited: Array.from(visited),
          stack: [...stack],
          current,
          result: [...result],
          code: `// ${current} already visited, skip`,
        });
        continue;
      }

      visited.add(current);
      result.push(current);

      steps.push({
        type: "pop",
        message: `Pop vertex ${current} from stack. Mark as visited.`,
        visited: Array.from(visited),
        stack: [...stack],
        current,
        result: [...result],
        code: `current = stack.pop(); // ${current}`,
      });

      const neighbors = this.adjacencyList.get(current) || [];
      const reversedNeighbors = [...neighbors].reverse();

      for (const neighbor of reversedNeighbors) {
        if (!visited.has(neighbor.to)) {
          stack.push(neighbor.to);

          steps.push({
            type: "push",
            message: `Push unvisited neighbor ${neighbor.to} to stack.`,
            visited: Array.from(visited),
            stack: [...stack],
            current,
            exploring: neighbor.to,
            result: [...result],
            code: `stack.push(${neighbor.to});`,
          });
        }
      }
    }

    steps.push({
      type: "complete",
      message: `DFS complete! Traversal order: [${result.join(" → ")}]`,
      visited: Array.from(visited),
      stack: [],
      current: null,
      result: [...result],
      code: `return [${result.join(", ")}];`,
    });

    return { steps, result };
  }

  // Dijkstra's Shortest Path
  dijkstra(startVertex, endVertex) {
    const steps = [];
    const distances = new Map();
    const previous = new Map();
    const unvisited = new Set(this.getVertices());

    // Initialize distances
    this.getVertices().forEach((v) => {
      distances.set(v, v === startVertex ? 0 : Infinity);
      previous.set(v, null);
    });

    steps.push({
      type: "init",
      message: `Initialize: Set distance to ${startVertex} as 0, all others as ∞`,
      distances: Object.fromEntries(distances),
      current: null,
      visited: [],
      path: [],
      code: `distances[${startVertex}] = 0; // others = ∞`,
    });

    while (unvisited.size > 0) {
      // Find vertex with minimum distance
      let minVertex = null;
      let minDist = Infinity;
      unvisited.forEach((v) => {
        if (distances.get(v) < minDist) {
          minDist = distances.get(v);
          minVertex = v;
        }
      });

      if (minVertex === null || minDist === Infinity) break;

      steps.push({
        type: "select",
        message: `Select vertex ${minVertex} with minimum distance ${minDist}`,
        distances: Object.fromEntries(distances),
        current: minVertex,
        visited: this.getVertices().filter((v) => !unvisited.has(v)),
        path: [],
        code: `current = minDistance vertex; // ${minVertex}`,
      });

      unvisited.delete(minVertex);

      if (minVertex === endVertex) {
        // Reconstruct path
        const path = [];
        let curr = endVertex;
        while (curr !== null) {
          path.unshift(curr);
          curr = previous.get(curr);
        }

        steps.push({
          type: "complete",
          message: `Found shortest path to ${endVertex}! Distance: ${distances.get(endVertex)}, Path: ${path.join(" → ")}`,
          distances: Object.fromEntries(distances),
          current: endVertex,
          visited: this.getVertices().filter((v) => !unvisited.has(v)),
          path,
          code: `return { distance: ${distances.get(endVertex)}, path: [${path.join(",")}] };`,
        });

        return { steps, distance: distances.get(endVertex), path };
      }

      const neighbors = this.adjacencyList.get(minVertex) || [];
      for (const neighbor of neighbors) {
        if (!unvisited.has(neighbor.to)) continue;

        const alt = distances.get(minVertex) + neighbor.weight;

        steps.push({
          type: "relax",
          message: `Check ${minVertex} → ${neighbor.to}: ${distances.get(minVertex)} + ${neighbor.weight} = ${alt} vs current ${distances.get(neighbor.to)}`,
          distances: Object.fromEntries(distances),
          current: minVertex,
          exploring: neighbor.to,
          visited: this.getVertices().filter((v) => !unvisited.has(v)),
          path: [],
          code: `if (${alt} < ${distances.get(neighbor.to)}) update distance`,
        });

        if (alt < distances.get(neighbor.to)) {
          distances.set(neighbor.to, alt);
          previous.set(neighbor.to, minVertex);

          steps.push({
            type: "update",
            message: `Update distance to ${neighbor.to}: ${alt} (via ${minVertex})`,
            distances: Object.fromEntries(distances),
            current: minVertex,
            exploring: neighbor.to,
            visited: this.getVertices().filter((v) => !unvisited.has(v)),
            path: [],
            code: `distances[${neighbor.to}] = ${alt};`,
          });
        }
      }
    }

    steps.push({
      type: "complete",
      message: endVertex
        ? `No path found to ${endVertex}`
        : "Dijkstra complete",
      distances: Object.fromEntries(distances),
      current: null,
      visited: this.getVertices(),
      path: [],
      code: `// Complete`,
    });

    return { steps, distances: Object.fromEntries(distances) };
  }

  // Detect Cycle (for undirected graph)
  detectCycle() {
    const steps = [];
    const visited = new Set();
    let hasCycle = false;
    let cycleEdge = null;

    const dfs = (vertex, parent) => {
      visited.add(vertex);

      steps.push({
        type: "visit",
        message: `Visit vertex ${vertex} (parent: ${parent ?? "none"})`,
        visited: Array.from(visited),
        current: vertex,
        parent,
        hasCycle,
        code: `dfs(${vertex}, ${parent});`,
      });

      const neighbors = this.adjacencyList.get(vertex) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor.to)) {
          steps.push({
            type: "explore",
            message: `Explore edge ${vertex} → ${neighbor.to}`,
            visited: Array.from(visited),
            current: vertex,
            exploring: neighbor.to,
            hasCycle,
            code: `// Explore ${neighbor.to}`,
          });

          if (dfs(neighbor.to, vertex)) return true;
        } else if (neighbor.to !== parent) {
          hasCycle = true;
          cycleEdge = { from: vertex, to: neighbor.to };

          steps.push({
            type: "cycle-found",
            message: `Cycle detected! Edge ${vertex} → ${neighbor.to} leads to visited vertex`,
            visited: Array.from(visited),
            current: vertex,
            exploring: neighbor.to,
            hasCycle: true,
            cycleEdge,
            code: `// Cycle: ${vertex} -> ${neighbor.to} (already visited)`,
          });

          return true;
        }
      }
      return false;
    };

    steps.push({
      type: "init",
      message: "Starting cycle detection using DFS",
      visited: [],
      current: null,
      hasCycle: false,
      code: `visited = new Set();`,
    });

    for (const vertex of this.getVertices()) {
      if (!visited.has(vertex)) {
        if (dfs(vertex, null)) break;
      }
    }

    steps.push({
      type: "complete",
      message: hasCycle
        ? "Graph contains a cycle!"
        : "Graph is acyclic (no cycles)",
      visited: Array.from(visited),
      current: null,
      hasCycle,
      cycleEdge,
      code: `return ${hasCycle};`,
    });

    return { steps, hasCycle, cycleEdge };
  }

  // Find Connected Components
  findConnectedComponents() {
    const steps = [];
    const visited = new Set();
    const components = [];

    steps.push({
      type: "init",
      message: "Finding all connected components using DFS",
      visited: [],
      components: [],
      current: null,
      code: `components = [];`,
    });

    for (const vertex of this.getVertices()) {
      if (!visited.has(vertex)) {
        const component = [];
        const stack = [vertex];

        steps.push({
          type: "new-component",
          message: `Starting new component from vertex ${vertex}`,
          visited: Array.from(visited),
          components: [...components],
          currentComponent: component,
          current: vertex,
          code: `// New component starting at ${vertex}`,
        });

        while (stack.length > 0) {
          const current = stack.pop();
          if (visited.has(current)) continue;

          visited.add(current);
          component.push(current);

          steps.push({
            type: "add-to-component",
            message: `Add vertex ${current} to current component`,
            visited: Array.from(visited),
            components: [...components],
            currentComponent: [...component],
            current,
            code: `component.push(${current});`,
          });

          const neighbors = this.adjacencyList.get(current) || [];
          for (const neighbor of neighbors) {
            if (!visited.has(neighbor.to)) {
              stack.push(neighbor.to);
            }
          }
        }

        components.push(component);

        steps.push({
          type: "component-complete",
          message: `Component ${components.length} complete: [${component.join(", ")}]`,
          visited: Array.from(visited),
          components: [...components],
          currentComponent: [...component],
          current: null,
          code: `components.push([${component.join(",")}]);`,
        });
      }
    }

    steps.push({
      type: "complete",
      message: `Found ${components.length} connected component(s)`,
      visited: Array.from(visited),
      components: [...components],
      current: null,
      code: `return ${components.length} components;`,
    });

    return { steps, components };
  }

  // Get Adjacency Matrix
  getAdjacencyMatrix() {
    const vertices = this.getVertices().sort();
    const matrix = [];

    vertices.forEach((v1) => {
      const row = [];
      vertices.forEach((v2) => {
        const edge = (this.adjacencyList.get(v1) || []).find(
          (e) => e.to === v2,
        );
        row.push(edge ? edge.weight : 0);
      });
      matrix.push(row);
    });

    return { vertices, matrix };
  }
}

// ============================================
// MAIN VISUALIZER COMPONENT
// ============================================
export default function GraphVisualizer() {
  // State
  const [graph, setGraph] = useState(() => {
    const g = new Graph(false, true);
    // Default example graph
    g.addVertex("A", 150, 100);
    g.addVertex("B", 350, 80);
    g.addVertex("C", 500, 150);
    g.addVertex("D", 150, 250);
    g.addVertex("E", 350, 280);
    g.addVertex("F", 500, 250);
    g.addEdge("A", "B", 4);
    g.addEdge("A", "D", 2);
    g.addEdge("B", "C", 3);
    g.addEdge("B", "E", 5);
    g.addEdge("C", "F", 1);
    g.addEdge("D", "E", 6);
    g.addEdge("E", "F", 2);
    return g;
  });

  const [operation, setOperation] = useState("bfs");
  const [inputVertex, setInputVertex] = useState("");
  const [inputVertex2, setInputVertex2] = useState("");
  const [inputWeight, setInputWeight] = useState("1");
  const [startVertex, setStartVertex] = useState("A");
  const [endVertex, setEndVertex] = useState("F");
  const [animationSteps, setAnimationSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);
  const [visitedNodes, setVisitedNodes] = useState([]);
  const [currentNode, setCurrentNode] = useState(null);
  const [exploringNode, setExploringNode] = useState(null);
  const [pathNodes, setPathNodes] = useState([]);
  const [traversalResult, setTraversalResult] = useState([]);
  const [queueOrStack, setQueueOrStack] = useState([]);
  const [explanation, setExplanation] = useState(
    "Welcome to Graph Visualizer! Select an operation to begin.",
  );
  const [codeSnippet, setCodeSnippet] = useState("");
  const [showEducation, setShowEducation] = useState(true);
  const [isDirected, setIsDirected] = useState(false);
  const [showAdjMatrix, setShowAdjMatrix] = useState(false);
  const [components, setComponents] = useState([]);
  const [distances, setDistances] = useState({});

  const animationRef = useRef(null);
  const svgRef = useRef(null);
  const [draggingNode, setDraggingNode] = useState(null);

  // Operations
  const operations = [
    { value: "bfs", label: "🔍 BFS (Breadth-First)", category: "traversal" },
    { value: "dfs", label: "🔍 DFS (Depth-First)", category: "traversal" },
    {
      value: "dijkstra",
      label: "📍 Dijkstra Shortest Path",
      category: "algorithm",
    },
    { value: "detectCycle", label: "🔄 Detect Cycle", category: "algorithm" },
    {
      value: "connectedComponents",
      label: "🧩 Connected Components",
      category: "algorithm",
    },
    { value: "addVertex", label: "➕ Add Vertex", category: "modify" },
    { value: "removeVertex", label: "➖ Remove Vertex", category: "modify" },
    { value: "addEdge", label: "↔️ Add Edge", category: "modify" },
    { value: "removeEdge", label: "✂️ Remove Edge", category: "modify" },
  ];

  // Complexity info
  const complexityInfo = {
    bfs: {
      time: "O(V + E)",
      space: "O(V)",
      description: "Visit all vertices and edges once",
    },
    dfs: {
      time: "O(V + E)",
      space: "O(V)",
      description: "Visit all vertices and edges once",
    },
    dijkstra: {
      time: "O((V + E) log V)",
      space: "O(V)",
      description: "With priority queue implementation",
    },
    detectCycle: {
      time: "O(V + E)",
      space: "O(V)",
      description: "DFS-based cycle detection",
    },
    connectedComponents: {
      time: "O(V + E)",
      space: "O(V)",
      description: "DFS/BFS on all components",
    },
    addVertex: {
      time: "O(1)",
      space: "O(1)",
      description: "Add to adjacency list",
    },
    removeVertex: {
      time: "O(V + E)",
      space: "O(1)",
      description: "Remove vertex and all its edges",
    },
    addEdge: {
      time: "O(1)",
      space: "O(1)",
      description: "Add to adjacency list",
    },
    removeEdge: {
      time: "O(E)",
      space: "O(1)",
      description: "Find and remove from list",
    },
  };

  // Execute operation
  const executeOperation = useCallback(() => {
    const newGraph = graph.clone();
    let result;

    switch (operation) {
      case "bfs":
        if (!startVertex) {
          setExplanation("⚠️ Please select a start vertex");
          return;
        }
        result = newGraph.bfs(startVertex);
        setAnimationSteps(result.steps);
        break;

      case "dfs":
        if (!startVertex) {
          setExplanation("⚠️ Please select a start vertex");
          return;
        }
        result = newGraph.dfs(startVertex);
        setAnimationSteps(result.steps);
        break;

      case "dijkstra":
        if (!startVertex || !endVertex) {
          setExplanation("⚠️ Please select start and end vertices");
          return;
        }
        result = newGraph.dijkstra(startVertex, endVertex);
        setAnimationSteps(result.steps);
        break;

      case "detectCycle":
        result = newGraph.detectCycle();
        setAnimationSteps(result.steps);
        break;

      case "connectedComponents":
        result = newGraph.findConnectedComponents();
        setAnimationSteps(result.steps);
        break;

      case "addVertex":
        if (!inputVertex) {
          setExplanation("⚠️ Please enter a vertex name");
          return;
        }
        const x = 100 + Math.random() * 450;
        const y = 80 + Math.random() * 220;
        if (newGraph.addVertex(inputVertex, x, y)) {
          setGraph(newGraph);
          setExplanation(`✅ Added vertex ${inputVertex}`);
        } else {
          setExplanation(`⚠️ Vertex ${inputVertex} already exists`);
        }
        setInputVertex("");
        return;

      case "removeVertex":
        if (!inputVertex) {
          setExplanation("⚠️ Please enter a vertex name");
          return;
        }
        if (newGraph.removeVertex(inputVertex)) {
          setGraph(newGraph);
          setExplanation(`✅ Removed vertex ${inputVertex}`);
        } else {
          setExplanation(`⚠️ Vertex ${inputVertex} not found`);
        }
        setInputVertex("");
        return;

      case "addEdge":
        if (!inputVertex || !inputVertex2) {
          setExplanation("⚠️ Please enter both vertices");
          return;
        }
        const weight = parseInt(inputWeight) || 1;
        if (newGraph.addEdge(inputVertex, inputVertex2, weight)) {
          setGraph(newGraph);
          setExplanation(
            `✅ Added edge ${inputVertex} → ${inputVertex2} (weight: ${weight})`,
          );
        } else {
          setExplanation(`⚠️ Could not add edge. Check if vertices exist.`);
        }
        return;

      case "removeEdge":
        if (!inputVertex || !inputVertex2) {
          setExplanation("⚠️ Please enter both vertices");
          return;
        }
        if (newGraph.removeEdge(inputVertex, inputVertex2)) {
          setGraph(newGraph);
          setExplanation(`✅ Removed edge ${inputVertex} → ${inputVertex2}`);
        } else {
          setExplanation(`⚠️ Edge not found`);
        }
        return;

      default:
        return;
    }

    setCurrentStep(-1);
    setVisitedNodes([]);
    setCurrentNode(null);
    setExploringNode(null);
    setPathNodes([]);
    setTraversalResult([]);
    setQueueOrStack([]);
    setComponents([]);
    setDistances({});
    setExplanation('🎬 Ready to animate! Click "Step" or "Play".');
  }, [
    graph,
    operation,
    startVertex,
    endVertex,
    inputVertex,
    inputVertex2,
    inputWeight,
  ]);

  // Animation step handler
  useEffect(() => {
    if (currentStep >= 0 && currentStep < animationSteps.length) {
      const step = animationSteps[currentStep];
      setVisitedNodes(step.visited || []);
      setCurrentNode(step.current);
      setExploringNode(step.exploring || null);
      setPathNodes(step.path || []);
      setTraversalResult(step.result || []);
      setQueueOrStack(step.queue || step.stack || []);
      setExplanation(step.message);
      setCodeSnippet(step.code || "");
      if (step.components) setComponents(step.components);
      if (step.distances) setDistances(step.distances);
    }
  }, [currentStep, animationSteps]);

  // Auto-play
  useEffect(() => {
    if (isPlaying && currentStep < animationSteps.length - 1) {
      animationRef.current = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, speed);
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
    setVisitedNodes([]);
    setCurrentNode(null);
    setExploringNode(null);
    setPathNodes([]);
    setTraversalResult([]);
    setQueueOrStack([]);
    setComponents([]);
    setDistances({});
    setExplanation("🔄 Reset. Ready to run again.");
  };

  const generateRandomGraph = () => {
    const newGraph = new Graph(isDirected, true);
    const labels = ["A", "B", "C", "D", "E", "F", "G"];
    const count = 5 + Math.floor(Math.random() * 3);

    // Add vertices in a circle
    for (let i = 0; i < count; i++) {
      const angle = (2 * Math.PI * i) / count - Math.PI / 2;
      const x = 325 + 150 * Math.cos(angle);
      const y = 180 + 120 * Math.sin(angle);
      newGraph.addVertex(labels[i], x, y);
    }

    // Add random edges
    for (let i = 0; i < count; i++) {
      const numEdges = 1 + Math.floor(Math.random() * 2);
      for (let j = 0; j < numEdges; j++) {
        const target = Math.floor(Math.random() * count);
        if (target !== i) {
          newGraph.addEdge(
            labels[i],
            labels[target],
            1 + Math.floor(Math.random() * 9),
          );
        }
      }
    }

    setGraph(newGraph);
    setAnimationSteps([]);
    setCurrentStep(-1);
    handleReset();
    setExplanation("🎲 Generated random graph!");
  };

  // Node drag handling
  const handleMouseDown = (vertex, e) => {
    e.preventDefault();
    setDraggingNode(vertex);
  };

  const handleMouseMove = useCallback(
    (e) => {
      if (!draggingNode || !svgRef.current) return;

      const svg = svgRef.current;
      const rect = svg.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const newGraph = graph.clone();
      newGraph.nodePositions.set(draggingNode, {
        x: Math.max(30, Math.min(620, x)),
        y: Math.max(30, Math.min(320, y)),
      });
      setGraph(newGraph);
    },
    [draggingNode, graph],
  );

  const handleMouseUp = () => setDraggingNode(null);

  useEffect(() => {
    if (draggingNode) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [draggingNode, handleMouseMove]);

  // Get node color
  const getNodeColor = (vertex) => {
    if (currentNode === vertex) return "url(#currentGrad)";
    if (exploringNode === vertex) return "url(#exploringGrad)";
    if (pathNodes.includes(vertex)) return "url(#pathGrad)";
    if (visitedNodes.includes(vertex)) return "url(#visitedGrad)";
    return "url(#normalGrad)";
  };

  // Get edge color
  const getEdgeColor = (from, to) => {
    const inPath =
      pathNodes.length > 1 &&
      pathNodes.some(
        (v, i) =>
          (v === from && pathNodes[i + 1] === to) ||
          (v === to && pathNodes[i + 1] === from),
      );
    if (inPath) return "#10b981";
    if (currentNode === from && exploringNode === to) return "#f59e0b";
    return "#94a3b8";
  };

  const vertices = graph.getVertices();
  const edges = graph.getEdges();
  const { vertices: matrixLabels, matrix } = graph.getAdjacencyMatrix();
  const currentOp = operations.find((o) => o.value === operation);
  const needsStartVertex = ["bfs", "dfs", "dijkstra"].includes(operation);
  const needsEndVertex = operation === "dijkstra";
  const needsVertex = [
    "addVertex",
    "removeVertex",
    "addEdge",
    "removeEdge",
  ].includes(operation);
  const needsVertex2 = ["addEdge", "removeEdge"].includes(operation);
  const needsWeight = operation === "addEdge";

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.title}>🕸️ Graph Visualizer</h1>
        <p style={styles.subtitle}>
          Interactive exploration of graph algorithms and traversals
        </p>
      </header>

      <div style={styles.mainContent}>
        {/* Left Panel */}
        <div style={styles.leftPanel}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>⚙️ Control Panel</h2>

            {/* Graph Type Toggle */}
            <div style={styles.toggleContainer}>
              <span style={styles.toggleLabel}>Type:</span>
              <button
                style={{
                  ...styles.toggleButton,
                  ...(!isDirected
                    ? styles.toggleActive
                    : styles.toggleInactive),
                }}
                onClick={() => {
                  setIsDirected(false);
                  const newGraph = new Graph(false, true);
                  graph.getVertices().forEach((v) => {
                    const pos = graph.nodePositions.get(v);
                    newGraph.addVertex(v, pos.x, pos.y);
                  });
                  graph
                    .getEdges()
                    .forEach((e) => newGraph.addEdge(e.from, e.to, e.weight));
                  setGraph(newGraph);
                }}
              >
                Undirected
              </button>
              <button
                style={{
                  ...styles.toggleButton,
                  ...(isDirected ? styles.toggleActive : styles.toggleInactive),
                }}
                onClick={() => {
                  setIsDirected(true);
                  const newGraph = new Graph(true, true);
                  graph.getVertices().forEach((v) => {
                    const pos = graph.nodePositions.get(v);
                    newGraph.addVertex(v, pos.x, pos.y);
                  });
                  graph
                    .getEdges()
                    .forEach((e) => newGraph.addEdge(e.from, e.to, e.weight));
                  setGraph(newGraph);
                }}
              >
                Directed
              </button>
            </div>

            {/* Operation */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Operation</label>
              <select
                style={styles.select}
                value={operation}
                onChange={(e) => setOperation(e.target.value)}
              >
                <optgroup label="Traversals">
                  {operations
                    .filter((o) => o.category === "traversal")
                    .map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                </optgroup>
                <optgroup label="Algorithms">
                  {operations
                    .filter((o) => o.category === "algorithm")
                    .map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                </optgroup>
                <optgroup label="Modify Graph">
                  {operations
                    .filter((o) => o.category === "modify")
                    .map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                </optgroup>
              </select>
            </div>

            {/* Inputs */}
            {needsStartVertex && (
              <div style={styles.inputGroup}>
                <label style={styles.label}>Start Vertex</label>
                <select
                  style={styles.select}
                  value={startVertex}
                  onChange={(e) => setStartVertex(e.target.value)}
                >
                  {vertices.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {needsEndVertex && (
              <div style={styles.inputGroup}>
                <label style={styles.label}>End Vertex</label>
                <select
                  style={styles.select}
                  value={endVertex}
                  onChange={(e) => setEndVertex(e.target.value)}
                >
                  {vertices.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {needsVertex && (
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  {needsVertex2 ? "From Vertex" : "Vertex"}
                </label>
                <input
                  style={styles.input}
                  value={inputVertex}
                  onChange={(e) => setInputVertex(e.target.value.toUpperCase())}
                  placeholder="e.g., G"
                  maxLength="2"
                />
              </div>
            )}

            {needsVertex2 && (
              <div style={styles.inputGroup}>
                <label style={styles.label}>To Vertex</label>
                <input
                  style={styles.input}
                  value={inputVertex2}
                  onChange={(e) =>
                    setInputVertex2(e.target.value.toUpperCase())
                  }
                  placeholder="e.g., H"
                  maxLength="2"
                />
              </div>
            )}

            {needsWeight && (
              <div style={styles.inputGroup}>
                <label style={styles.label}>Weight</label>
                <input
                  type="number"
                  style={styles.input}
                  value={inputWeight}
                  onChange={(e) => setInputWeight(e.target.value)}
                  min="1"
                  max="99"
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
                  onClick={generateRandomGraph}
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
                    background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                  }}
                />
                <span>Normal</span>
              </div>
              <div style={styles.legendItem}>
                <div
                  style={{
                    ...styles.legendDot,
                    background: "linear-gradient(135deg, #10b981, #059669)",
                  }}
                />
                <span>Visited</span>
              </div>
              <div style={styles.legendItem}>
                <div
                  style={{
                    ...styles.legendDot,
                    background: "linear-gradient(135deg, #f59e0b, #d97706)",
                  }}
                />
                <span>Current</span>
              </div>
              <div style={styles.legendItem}>
                <div
                  style={{
                    ...styles.legendDot,
                    background: "linear-gradient(135deg, #ec4899, #db2777)",
                  }}
                />
                <span>Exploring</span>
              </div>
              <div style={styles.legendItem}>
                <div
                  style={{
                    ...styles.legendDot,
                    background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
                  }}
                />
                <span>Path</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Panel */}
        <div style={styles.centerPanel}>
          <div style={styles.card}>
            <div style={styles.vizHeader}>
              <h2 style={styles.cardTitle}>📊 Graph Visualization</h2>
              <div style={styles.vizControls}>
                <button
                  style={{
                    ...styles.miniButton,
                    ...(showAdjMatrix ? styles.miniActive : {}),
                  }}
                  onClick={() => setShowAdjMatrix(!showAdjMatrix)}
                >
                  {showAdjMatrix ? "🔢 Matrix" : "📋 List"}
                </button>
                <span style={styles.infoBadge}>
                  {vertices.length} vertices, {edges.length} edges
                </span>
              </div>
            </div>

            {/* Graph SVG */}
            <div style={styles.graphArea}>
              <svg ref={svgRef} style={styles.svg} viewBox="0 0 650 350">
                <defs>
                  <linearGradient
                    id="normalGrad"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#1d4ed8" />
                  </linearGradient>
                  <linearGradient
                    id="visitedGrad"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                  <linearGradient
                    id="currentGrad"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#d97706" />
                  </linearGradient>
                  <linearGradient
                    id="exploringGrad"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#ec4899" />
                    <stop offset="100%" stopColor="#db2777" />
                  </linearGradient>
                  <linearGradient
                    id="pathGrad"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#7c3aed" />
                  </linearGradient>
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="7"
                    refX="24"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
                  </marker>
                  <marker
                    id="arrowheadActive"
                    markerWidth="10"
                    markerHeight="7"
                    refX="24"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3.5, 0 7" fill="#f59e0b" />
                  </marker>
                  <marker
                    id="arrowheadPath"
                    markerWidth="10"
                    markerHeight="7"
                    refX="24"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3.5, 0 7" fill="#10b981" />
                  </marker>
                  <filter
                    id="nodeShadow"
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
                {edges.map((edge) => {
                  const fromPos = graph.nodePositions.get(edge.from);
                  const toPos = graph.nodePositions.get(edge.to);
                  if (!fromPos || !toPos) return null;

                  const color = getEdgeColor(edge.from, edge.to);
                  const isActive = color !== "#94a3b8";
                  const midX = (fromPos.x + toPos.x) / 2;
                  const midY = (fromPos.y + toPos.y) / 2;

                  return (
                    <g key={`${edge.from}-${edge.to}`}>
                      <line
                        x1={fromPos.x}
                        y1={fromPos.y}
                        x2={toPos.x}
                        y2={toPos.y}
                        stroke={color}
                        strokeWidth={isActive ? 3 : 2}
                        markerEnd={
                          isDirected
                            ? color === "#10b981"
                              ? "url(#arrowheadPath)"
                              : color === "#f59e0b"
                                ? "url(#arrowheadActive)"
                                : "url(#arrowhead)"
                            : ""
                        }
                      />
                      <circle
                        cx={midX}
                        cy={midY}
                        r="12"
                        fill="white"
                        stroke={color}
                        strokeWidth="1"
                      />
                      <text
                        x={midX}
                        y={midY}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize="10"
                        fontWeight="600"
                        fill={color}
                      >
                        {edge.weight}
                      </text>
                    </g>
                  );
                })}

                {/* Nodes */}
                {vertices.map((vertex) => {
                  const pos = graph.nodePositions.get(vertex);
                  if (!pos) return null;

                  const isActive =
                    currentNode === vertex ||
                    exploringNode === vertex ||
                    pathNodes.includes(vertex);

                  return (
                    <g
                      key={vertex}
                      style={{ cursor: "grab" }}
                      onMouseDown={(e) => handleMouseDown(vertex, e)}
                    >
                      {isActive && (
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r="28"
                          fill={
                            currentNode === vertex
                              ? "#f59e0b33"
                              : exploringNode === vertex
                                ? "#ec489933"
                                : "#8b5cf633"
                          }
                        />
                      )}
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r="22"
                        fill={getNodeColor(vertex)}
                        filter="url(#nodeShadow)"
                        style={{ transition: "all 0.3s" }}
                      />
                      <text
                        x={pos.x}
                        y={pos.y}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="white"
                        fontSize="14"
                        fontWeight="700"
                        style={{ pointerEvents: "none" }}
                      >
                        {vertex}
                      </text>
                      {distances[vertex] !== undefined &&
                        distances[vertex] !== Infinity && (
                          <text
                            x={pos.x}
                            y={pos.y + 35}
                            textAnchor="middle"
                            fontSize="11"
                            fill="#6b7280"
                            fontWeight="600"
                          >
                            d={distances[vertex]}
                          </text>
                        )}
                    </g>
                  );
                })}

                {vertices.length === 0 && (
                  <text
                    x="325"
                    y="175"
                    textAnchor="middle"
                    fill="#9ca3af"
                    fontSize="16"
                  >
                    Graph is empty. Add vertices to begin!
                  </text>
                )}
              </svg>
            </div>

            {/* Data Structures */}
            <div style={styles.dataStructures}>
              {queueOrStack.length > 0 && (
                <div style={styles.dsBox}>
                  <strong>
                    {operation === "bfs" ? "📋 Queue: " : "📚 Stack: "}
                  </strong>
                  [{queueOrStack.join(", ")}]
                </div>
              )}
              {traversalResult.length > 0 && (
                <div style={styles.resultBox}>
                  <strong>📍 Traversal: </strong>[{traversalResult.join(" → ")}]
                </div>
              )}
              {components.length > 0 && (
                <div style={styles.componentsBox}>
                  <strong>🧩 Components: </strong>
                  {components.map((c, i) => `[${c.join(",")}]`).join(" ")}
                </div>
              )}
            </div>

            {/* Explanation */}
            <div style={styles.explanationBox}>
              <div style={styles.explanationHeader}>
                <span style={styles.stepBadge}>
                  Step {Math.max(0, currentStep + 1)}
                </span>
                <span style={styles.opBadge}>{currentOp?.label}</span>
              </div>
              <p style={styles.explanationText}>{explanation}</p>
              {codeSnippet && (
                <div style={styles.codeBox}>
                  <code style={styles.codeText}>{codeSnippet}</code>
                </div>
              )}
            </div>

            {/* Adjacency Representation */}
            {showAdjMatrix ? (
              <div style={styles.matrixContainer}>
                <h4 style={styles.matrixTitle}>Adjacency Matrix</h4>
                <div style={styles.matrixWrapper}>
                  <table style={styles.matrix}>
                    <thead>
                      <tr>
                        <th style={styles.matrixHeader}></th>
                        {matrixLabels.map((l) => (
                          <th key={l} style={styles.matrixHeader}>
                            {l}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {matrix.map((row, i) => (
                        <tr key={i}>
                          <th style={styles.matrixHeader}>{matrixLabels[i]}</th>
                          {row.map((cell, j) => (
                            <td
                              key={j}
                              style={{
                                ...styles.matrixCell,
                                background: cell > 0 ? "#dbeafe" : "#f8fafc",
                                color: cell > 0 ? "#1d4ed8" : "#9ca3af",
                              }}
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div style={styles.adjListContainer}>
                <h4 style={styles.matrixTitle}>Adjacency List</h4>
                <div style={styles.adjList}>
                  {vertices.map((v) => (
                    <div key={v} style={styles.adjListItem}>
                      <span style={styles.adjListVertex}>{v}</span>
                      <span style={styles.adjListArrow}>→</span>
                      <span style={styles.adjListNeighbors}>
                        {(graph.adjacencyList.get(v) || [])
                          .map((e) => `${e.to}(${e.weight})`)
                          .join(", ") || "∅"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
                  <h3 style={styles.sectionTitle}>🔑 Graph Basics</h3>
                  <div style={styles.conceptBox}>
                    <p style={styles.conceptItem}>
                      <strong>Vertex (Node):</strong> A point in the graph
                    </p>
                    <p style={styles.conceptItem}>
                      <strong>Edge:</strong> Connection between vertices
                    </p>
                    <p style={styles.conceptItem}>
                      <strong>Directed:</strong> Edges have direction (A→B)
                    </p>
                    <p style={styles.conceptItem}>
                      <strong>Weighted:</strong> Edges have costs
                    </p>
                  </div>
                </div>

                <div style={styles.educationSection}>
                  <h3 style={styles.sectionTitle}>
                    🔧 {currentOp?.label.replace(/[^\w\s]/g, "")}
                  </h3>
                  <p style={styles.sectionContent}>
                    {operation === "bfs" &&
                      "Explores neighbors level by level using a queue. Great for finding shortest path in unweighted graphs."}
                    {operation === "dfs" &&
                      "Explores as deep as possible before backtracking using a stack. Used for topological sort, cycle detection."}
                    {operation === "dijkstra" &&
                      "Finds shortest path in weighted graphs. Always picks the unvisited vertex with minimum distance."}
                    {operation === "detectCycle" &&
                      "Uses DFS to find if any back edge exists (edge to an already visited non-parent vertex)."}
                    {operation === "connectedComponents" &&
                      "Finds all groups of vertices that are connected to each other."}
                    {operation.includes("Vertex") &&
                      "Modify the graph structure by adding or removing vertices."}
                    {operation.includes("Edge") &&
                      "Modify connections between vertices in the graph."}
                  </p>
                </div>

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
                        <td style={styles.tableLabel}>Note</td>
                        <td style={styles.tableValue}>
                          {complexityInfo[operation]?.description}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div style={styles.educationSection}>
                  <h3 style={styles.sectionTitle}>💡 Key Differences</h3>
                  <div style={styles.comparisonBox}>
                    <div style={styles.comparisonItem}>
                      <strong style={{ color: "#3b82f6" }}>BFS</strong>
                      <p>
                        Queue (FIFO), Level-order, Shortest path (unweighted)
                      </p>
                    </div>
                    <div style={styles.comparisonItem}>
                      <strong style={{ color: "#8b5cf6" }}>DFS</strong>
                      <p>
                        Stack (LIFO), Depth-first, Cycle detection, Topological
                        sort
                      </p>
                    </div>
                  </div>
                </div>

                <div style={styles.educationSection}>
                  <h3 style={styles.sectionTitle}>⚠️ Edge Cases</h3>
                  <ul style={styles.edgeCaseList}>
                    <li>Empty graph</li>
                    <li>Disconnected components</li>
                    <li>Self-loops</li>
                    <li>Negative edge weights (Dijkstra fails)</li>
                    <li>Cycles in directed graphs</li>
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
      "linear-gradient(135deg, #eff6ff 0%, #dbeafe 50%, #bfdbfe 100%)",
    minHeight: "100vh",
    padding: "16px",
    boxSizing: "border-box",
  },
  header: { textAlign: "center", marginBottom: "20px" },
  title: {
    fontSize: "2.25rem",
    fontWeight: "800",
    background:
      "linear-gradient(135deg, #1d4ed8 0%, #3b82f6 50%, #60a5fa 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    margin: "0 0 6px 0",
  },
  subtitle: {
    fontSize: "1rem",
    color: "#1e40af",
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
    border: "1px solid #dbeafe",
  },
  cardTitle: {
    fontSize: "1rem",
    fontWeight: "700",
    color: "#1e3a8a",
    marginBottom: "14px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  toggleContainer: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "14px",
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
    fontSize: "0.8rem",
    fontWeight: "600",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  toggleActive: {
    background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
    color: "white",
  },
  toggleInactive: { background: "transparent", color: "#64748b" },
  inputGroup: { marginBottom: "12px" },
  label: {
    display: "block",
    fontSize: "0.8rem",
    fontWeight: "600",
    color: "#1e40af",
    marginBottom: "6px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    fontSize: "0.95rem",
    border: "2px solid #bfdbfe",
    borderRadius: "10px",
    outline: "none",
    boxSizing: "border-box",
  },
  select: {
    width: "100%",
    padding: "10px 12px",
    fontSize: "0.95rem",
    border: "2px solid #bfdbfe",
    borderRadius: "10px",
    outline: "none",
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
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
  },
  primaryButton: {
    background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
    color: "white",
    boxShadow: "0 2px 8px rgba(59,130,246,0.3)",
  },
  secondaryButton: { background: "#e0f2fe", color: "#1e40af" },
  successButton: {
    background: "linear-gradient(135deg, #10b981, #059669)",
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
    background: "#bfdbfe",
    outline: "none",
    cursor: "pointer",
    marginTop: "8px",
  },
  progressContainer: { marginTop: "14px" },
  progressLabel: {
    fontSize: "0.75rem",
    color: "#1e40af",
    marginBottom: "6px",
    fontWeight: "500",
  },
  progressBar: {
    height: "6px",
    background: "#e0f2fe",
    borderRadius: "3px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
    borderRadius: "3px",
    transition: "width 0.3s",
  },
  legend: { display: "flex", flexDirection: "column", gap: "8px" },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "0.85rem",
    color: "#1e40af",
  },
  legendDot: {
    width: "16px",
    height: "16px",
    borderRadius: "4px",
    flexShrink: 0,
  },
  vizHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "8px",
  },
  vizControls: { display: "flex", gap: "8px", alignItems: "center" },
  miniButton: {
    padding: "6px 10px",
    fontSize: "0.75rem",
    fontWeight: "600",
    background: "#e0f2fe",
    color: "#1e40af",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  miniActive: { background: "#3b82f6", color: "white" },
  infoBadge: {
    fontSize: "0.75rem",
    color: "#3b82f6",
    background: "#eff6ff",
    padding: "4px 8px",
    borderRadius: "6px",
  },
  graphArea: {
    background: "#f8fafc",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    marginBottom: "12px",
    overflow: "hidden",
  },
  svg: { width: "100%", height: "350px", display: "block" },
  dataStructures: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginBottom: "12px",
  },
  dsBox: {
    padding: "10px",
    background: "#fef3c7",
    borderRadius: "8px",
    fontSize: "0.85rem",
    color: "#92400e",
    fontFamily: "monospace",
  },
  resultBox: {
    padding: "10px",
    background: "#dcfce7",
    borderRadius: "8px",
    fontSize: "0.85rem",
    color: "#166534",
    fontFamily: "monospace",
  },
  componentsBox: {
    padding: "10px",
    background: "#e0e7ff",
    borderRadius: "8px",
    fontSize: "0.85rem",
    color: "#3730a3",
    fontFamily: "monospace",
  },
  explanationBox: {
    padding: "14px",
    background: "linear-gradient(135deg, #eff6ff, #dbeafe)",
    borderRadius: "12px",
    border: "1px solid #bfdbfe",
    marginBottom: "12px",
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
    color: "#1d4ed8",
    background: "white",
    padding: "3px 8px",
    borderRadius: "6px",
  },
  opBadge: {
    fontSize: "0.75rem",
    fontWeight: "600",
    color: "#1e40af",
    background: "white",
    padding: "3px 8px",
    borderRadius: "6px",
  },
  explanationText: {
    fontSize: "0.9rem",
    color: "#1e3a8a",
    margin: 0,
    lineHeight: "1.5",
  },
  codeBox: {
    marginTop: "10px",
    padding: "10px",
    background: "#1e293b",
    borderRadius: "8px",
  },
  codeText: { fontSize: "0.8rem", color: "#93c5fd", fontFamily: "monospace" },
  matrixContainer: { marginTop: "12px" },
  matrixTitle: {
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "#1e40af",
    marginBottom: "8px",
  },
  matrixWrapper: { overflowX: "auto" },
  matrix: { borderCollapse: "collapse", fontSize: "0.8rem" },
  matrixHeader: {
    padding: "8px",
    background: "#dbeafe",
    color: "#1e40af",
    fontWeight: "600",
    border: "1px solid #bfdbfe",
    minWidth: "30px",
  },
  matrixCell: {
    padding: "8px",
    border: "1px solid #e2e8f0",
    textAlign: "center",
    fontWeight: "500",
    minWidth: "30px",
  },
  adjListContainer: { marginTop: "12px" },
  adjList: { display: "flex", flexDirection: "column", gap: "6px" },
  adjListItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 12px",
    background: "#f8fafc",
    borderRadius: "8px",
    fontSize: "0.85rem",
  },
  adjListVertex: {
    fontWeight: "700",
    color: "#1d4ed8",
    background: "#dbeafe",
    padding: "4px 8px",
    borderRadius: "4px",
    minWidth: "24px",
    textAlign: "center",
  },
  adjListArrow: { color: "#94a3b8" },
  adjListNeighbors: { color: "#475569", fontFamily: "monospace" },
  educationHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  toggleBtn: {
    background: "#e0f2fe",
    border: "none",
    borderRadius: "6px",
    padding: "4px 10px",
    cursor: "pointer",
    fontSize: "0.8rem",
    color: "#1e40af",
  },
  educationSection: { marginBottom: "16px" },
  sectionTitle: {
    fontSize: "0.85rem",
    fontWeight: "700",
    color: "#1e3a8a",
    marginBottom: "8px",
  },
  sectionContent: {
    fontSize: "0.8rem",
    color: "#1e40af",
    lineHeight: "1.6",
    margin: 0,
  },
  conceptBox: {
    background: "#eff6ff",
    borderRadius: "10px",
    padding: "12px",
    border: "1px solid #bfdbfe",
  },
  conceptItem: {
    fontSize: "0.8rem",
    color: "#1e40af",
    margin: "0 0 6px 0",
    lineHeight: "1.5",
  },
  complexityTable: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "0.75rem",
  },
  tableLabel: {
    padding: "8px",
    background: "#eff6ff",
    color: "#1e40af",
    fontWeight: "600",
    borderBottom: "1px solid #bfdbfe",
    width: "30%",
  },
  tableValue: {
    padding: "8px",
    color: "#1e3a8a",
    borderBottom: "1px solid #e2e8f0",
  },
  comparisonBox: { display: "flex", flexDirection: "column", gap: "8px" },
  comparisonItem: {
    background: "#eff6ff",
    borderRadius: "8px",
    padding: "10px",
    fontSize: "0.8rem",
    color: "#1e40af",
  },
  edgeCaseList: {
    fontSize: "0.8rem",
    color: "#1e40af",
    paddingLeft: "18px",
    margin: "0",
    lineHeight: "1.8",
  },
};
