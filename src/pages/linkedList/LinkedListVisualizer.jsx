import { useState, useEffect, useRef, useCallback } from "react";

/* ─────────────────────────────────────────────────────────────────────────────
   LinkedList Complete Visualizer
   A polished, self-contained educational tool for understanding Singly Linked
   Lists. Covers Insert (Head/Tail/Position), Delete (Head/Tail/Value/Position),
   Search, Reverse, and Traverse operations with step-by-step animations,
   auto-play, complexity info, and a full educational panel.
   ───────────────────────────────────────────────────────────────────────────── */

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 1 — Constants & Helpers
// ═══════════════════════════════════════════════════════════════════════════════

const OPERATIONS = [
  { id: "insertHead", label: "Insert at Head", group: "Insert" },
  { id: "insertTail", label: "Insert at Tail", group: "Insert" },
  { id: "insertAt", label: "Insert at Position", group: "Insert" },
  { id: "deleteHead", label: "Delete Head", group: "Delete" },
  { id: "deleteTail", label: "Delete Tail", group: "Delete" },
  { id: "deleteValue", label: "Delete by Value", group: "Delete" },
  { id: "deleteAt", label: "Delete at Position", group: "Delete" },
  { id: "search", label: "Search Value", group: "Search" },
  { id: "reverse", label: "Reverse List", group: "Transform" },
  { id: "traverse", label: "Traverse List", group: "Traverse" },
];

const COMPLEXITY = {
  insertHead: { time: "O(1)", space: "O(1)", best: "O(1)", worst: "O(1)" },
  insertTail: { time: "O(n)", space: "O(1)", best: "O(1)*", worst: "O(n)" },
  insertAt: { time: "O(n)", space: "O(1)", best: "O(1)", worst: "O(n)" },
  deleteHead: { time: "O(1)", space: "O(1)", best: "O(1)", worst: "O(1)" },
  deleteTail: { time: "O(n)", space: "O(1)", best: "O(1)*", worst: "O(n)" },
  deleteValue: { time: "O(n)", space: "O(1)", best: "O(1)", worst: "O(n)" },
  deleteAt: { time: "O(n)", space: "O(1)", best: "O(1)", worst: "O(n)" },
  search: { time: "O(n)", space: "O(1)", best: "O(1)", worst: "O(n)" },
  reverse: { time: "O(n)", space: "O(1)", best: "O(n)", worst: "O(n)" },
  traverse: { time: "O(n)", space: "O(1)", best: "O(n)", worst: "O(n)" },
};

const EDGE_CASES = {
  insertHead: ["Empty list", "Single node list"],
  insertTail: ["Empty list", "Single node list"],
  insertAt: [
    "Position 0 (becomes head)",
    "Position = length (becomes tail)",
    "Position out of bounds",
    "Empty list",
  ],
  deleteHead: ["Empty list", "Single node (list becomes empty)", "Two nodes"],
  deleteTail: ["Empty list", "Single node (list becomes empty)", "Two nodes"],
  deleteValue: [
    "Value not found",
    "Value at head",
    "Value at tail",
    "Duplicate values (deletes first)",
    "Empty list",
  ],
  deleteAt: [
    "Position 0 (delete head)",
    "Last position",
    "Position out of bounds",
    "Empty list",
  ],
  search: [
    "Value not found",
    "Value at head",
    "Value at tail",
    "Duplicate values (finds first)",
    "Empty list",
  ],
  reverse: ["Empty list", "Single node", "Two nodes", "Already reversed"],
  traverse: ["Empty list", "Single node"],
};

const INTUITIONS = {
  insertHead:
    "Inserting at the head is the fastest linked list operation — we simply create a new node, point it to the current head, and update head. No traversal needed!",
  insertTail:
    "To insert at the tail, we must walk the entire list to find the last node, then attach our new node. This is why arrays beat linked lists for append — unless we maintain a tail pointer.",
  insertAt:
    "Inserting at a position requires walking to the node just before the target position, then rewiring pointers: new node points to next, previous node points to new node.",
  deleteHead:
    "Deleting the head is instant — just move the head pointer to head.next. The old head gets garbage collected. This is a key advantage of linked lists over arrays.",
  deleteTail:
    "Deleting the tail requires finding the second-to-last node and setting its next to null. This O(n) traversal is a weakness — doubly linked lists solve this.",
  deleteValue:
    "We traverse the list looking for the target value. When found, we rewire the previous node's next pointer to skip the target. A 'prev' pointer tracks the node before current.",
  deleteAt:
    "Similar to insert-at, we walk to the node just before position, then rewire its next pointer to skip the target node. Position 0 is a special case (delete head).",
  search:
    "Linear search is the only option for unsorted linked lists — we walk node by node comparing values. Unlike arrays, we can't use binary search since there's no random access.",
  reverse:
    "The classic three-pointer technique: prev, current, and next. At each step, we reverse current's pointer to point backward, then advance all three pointers forward.",
  traverse:
    "Traversal visits every node exactly once by following next pointers from head to null. It's the foundation for most linked list operations.",
};

const randInt = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let nextId = 1;
const makeNode = (val) => ({ id: nextId++, val, next: null });

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 2 — Styles (all inline, no external CSS)
// ═══════════════════════════════════════════════════════════════════════════════

const palette = {
  bg: "#f5f0ff",
  card: "#ffffff",
  primary: "#6c5ce7",
  primaryLight: "#a29bfe",
  primaryGlow: "rgba(108,92,231,0.12)",
  accent: "#00cec9",
  accentLight: "#81ecec",
  danger: "#ff6b6b",
  dangerLight: "#ffa8a8",
  warning: "#fdcb6e",
  success: "#00b894",
  successLight: "#55efc4",
  text: "#2d3436",
  textLight: "#636e72",
  border: "#dfe6e9",
  shadow: "0 4px 24px rgba(108,92,231,0.10)",
  shadowHover: "0 8px 32px rgba(108,92,231,0.18)",
  nodeDefault: "linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)",
  nodeActive: "linear-gradient(135deg, #00cec9 0%, #81ecec 100%)",
  nodeFound: "linear-gradient(135deg, #00b894 0%, #55efc4 100%)",
  nodeDelete: "linear-gradient(135deg, #ff6b6b 0%, #ffa8a8 100%)",
  nodeNew: "linear-gradient(135deg, #fdcb6e 0%, #ffeaa7 100%)",
  nullNode: "linear-gradient(135deg, #b2bec3 0%, #dfe6e9 100%)",
};

const S = {
  /* --- Page Shell --- */
  page: {
    minHeight: "100vh",
    background: `linear-gradient(160deg, ${palette.bg} 0%, #e8e0ff 40%, #dff5f4 100%)`,
    fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
    color: palette.text,
    padding: "24px 20px 48px",
    boxSizing: "border-box",
  },
  container: {
    maxWidth: 1260,
    margin: "0 auto",
  },
  /* --- Header --- */
  header: {
    textAlign: "center",
    marginBottom: 28,
  },
  title: {
    fontSize: 34,
    fontWeight: 800,
    background: "linear-gradient(135deg, #6c5ce7, #00cec9)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    margin: 0,
    letterSpacing: "-0.5px",
  },
  subtitle: {
    fontSize: 15,
    color: palette.textLight,
    marginTop: 4,
    fontWeight: 500,
  },
  /* --- Card --- */
  card: {
    background: palette.card,
    borderRadius: 16,
    boxShadow: palette.shadow,
    padding: "20px 24px",
    marginBottom: 18,
    border: `1px solid ${palette.border}`,
    transition: "box-shadow 0.2s",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: palette.primary,
    marginBottom: 14,
    textTransform: "uppercase",
    letterSpacing: "0.8px",
  },
  /* --- Controls Row --- */
  controlsRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    alignItems: "center",
  },
  select: {
    padding: "10px 14px",
    borderRadius: 10,
    border: `2px solid ${palette.primaryLight}`,
    fontSize: 14,
    fontWeight: 600,
    color: palette.text,
    background: "#fff",
    outline: "none",
    cursor: "pointer",
    minWidth: 170,
    transition: "border-color 0.2s",
  },
  input: {
    padding: "10px 14px",
    borderRadius: 10,
    border: `2px solid ${palette.border}`,
    fontSize: 14,
    width: 80,
    outline: "none",
    fontWeight: 600,
    transition: "border-color 0.2s",
  },
  btn: (bg, fg = "#fff") => ({
    padding: "10px 18px",
    borderRadius: 10,
    border: "none",
    fontSize: 13,
    fontWeight: 700,
    color: fg,
    background: bg,
    cursor: "pointer",
    transition: "transform 0.15s, box-shadow 0.15s",
    boxShadow: `0 2px 10px ${bg}44`,
    whiteSpace: "nowrap",
  }),
  btnDisabled: {
    opacity: 0.5,
    pointerEvents: "none",
  },
  /* --- Slider --- */
  sliderWrap: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 13,
    fontWeight: 600,
    color: palette.textLight,
  },
  slider: {
    width: 100,
    accentColor: palette.primary,
    cursor: "pointer",
  },
  /* --- Visualization --- */
  vizArea: {
    minHeight: 180,
    display: "flex",
    alignItems: "center",
    gap: 0,
    overflowX: "auto",
    padding: "24px 12px",
    position: "relative",
  },
  node: (gradient, scale = 1, glow = false) => ({
    width: 64,
    height: 64,
    borderRadius: 14,
    background: gradient,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: 800,
    fontSize: 20,
    flexShrink: 0,
    transition:
      "transform 0.35s cubic-bezier(.34,1.56,.64,1), opacity 0.35s, box-shadow 0.35s",
    transform: `scale(${scale})`,
    boxShadow: glow
      ? `0 0 0 4px rgba(108,92,231,0.25), 0 4px 20px rgba(0,0,0,0.15)`
      : "0 4px 14px rgba(0,0,0,0.12)",
    position: "relative",
    zIndex: glow ? 3 : 1,
  }),
  nodeLabel: {
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: "0.6px",
    opacity: 0.85,
    marginTop: 2,
  },
  arrow: {
    width: 36,
    height: 3,
    background: palette.primaryLight,
    position: "relative",
    flexShrink: 0,
    borderRadius: 2,
    transition: "background 0.3s",
  },
  arrowHead: {
    position: "absolute",
    right: -6,
    top: -5,
    width: 0,
    height: 0,
    borderTop: "6px solid transparent",
    borderBottom: "6px solid transparent",
    borderLeft: `8px solid ${palette.primaryLight}`,
    transition: "border-left-color 0.3s",
  },
  nullBox: {
    width: 50,
    height: 40,
    borderRadius: 10,
    background: palette.nullNode,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#636e72",
    fontSize: 12,
    fontWeight: 800,
    flexShrink: 0,
    letterSpacing: "0.5px",
  },
  headPointer: {
    position: "absolute",
    top: -22,
    left: "50%",
    transform: "translateX(-50%)",
    fontSize: 10,
    fontWeight: 800,
    color: palette.primary,
    background: palette.primaryGlow,
    padding: "2px 8px",
    borderRadius: 6,
    letterSpacing: "0.5px",
    whiteSpace: "nowrap",
  },
  /* --- Legend --- */
  legend: {
    display: "flex",
    flexWrap: "wrap",
    gap: 14,
    marginTop: 8,
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 12,
    fontWeight: 600,
    color: palette.textLight,
  },
  legendDot: (bg) => ({
    width: 14,
    height: 14,
    borderRadius: 5,
    background: bg,
    flexShrink: 0,
  }),
  /* --- Explanation Panel --- */
  explanation: {
    padding: "14px 18px",
    borderRadius: 12,
    background: "linear-gradient(135deg, #f5f0ff 0%, #eef9f9 100%)",
    border: `1px solid ${palette.border}`,
    fontSize: 14,
    lineHeight: 1.7,
    color: palette.text,
    minHeight: 48,
    fontWeight: 500,
  },
  stepBadge: {
    display: "inline-block",
    background: palette.primary,
    color: "#fff",
    borderRadius: 6,
    padding: "2px 10px",
    fontSize: 11,
    fontWeight: 800,
    marginRight: 8,
    letterSpacing: "0.4px",
  },
  /* --- Education --- */
  eduGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 16,
  },
  complexityTable: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,
    fontSize: 13,
    fontWeight: 600,
  },
  th: {
    textAlign: "left",
    padding: "8px 12px",
    background: palette.primaryGlow,
    color: palette.primary,
    borderRadius: "8px 8px 0 0",
    fontSize: 11,
    letterSpacing: "0.5px",
    textTransform: "uppercase",
  },
  td: {
    padding: "8px 12px",
    borderBottom: `1px solid ${palette.border}`,
    color: palette.text,
  },
  tag: (bg) => ({
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: 6,
    background: bg,
    color: "#fff",
    fontSize: 12,
    fontWeight: 700,
    marginRight: 6,
    marginBottom: 4,
  }),
  /* --- Pointers row below viz --- */
  pointerRow: {
    display: "flex",
    gap: 6,
    flexWrap: "wrap",
    marginTop: 6,
  },
  pointerLabel: (bg) => ({
    fontSize: 11,
    fontWeight: 700,
    padding: "3px 10px",
    borderRadius: 8,
    color: "#fff",
    background: bg,
    letterSpacing: "0.4px",
  }),
  /* --- Empty state --- */
  emptyState: {
    textAlign: "center",
    padding: "36px 0",
    color: palette.textLight,
    fontSize: 15,
    fontWeight: 600,
  },
  /* --- Responsive helpers --- */
  topGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 18,
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 3 — Core LinkedList Logic (immutable for React state)
// ═══════════════════════════════════════════════════════════════════════════════

/** Convert linked list head to array of node objects for rendering */
const toArray = (head) => {
  const arr = [];
  let cur = head;
  const seen = new Set();
  while (cur && !seen.has(cur.id)) {
    seen.add(cur.id);
    arr.push(cur);
    cur = cur.next;
  }
  return arr;
};

/** Deep clone a linked list and return { head, map } where map is id->node */
const cloneList = (head) => {
  if (!head) return { head: null, map: {} };
  const map = {};
  let cur = head;
  const seen = new Set();
  while (cur && !seen.has(cur.id)) {
    seen.add(cur.id);
    map[cur.id] = makeNode(cur.val);
    map[cur.id].id = cur.id; // preserve id
    cur = cur.next;
  }
  cur = head;
  const seenLink = new Set();
  while (cur && !seenLink.has(cur.id)) {
    seenLink.add(cur.id);
    if (cur.next) map[cur.id].next = map[cur.next.id];
    cur = cur.next;
  }
  return { head: map[head.id], map };
};

/** Build list from array of values */
const buildList = (vals) => {
  if (!vals.length) return null;
  const nodes = vals.map((v) => makeNode(v));
  for (let i = 0; i < nodes.length - 1; i++) nodes[i].next = nodes[i + 1];
  return nodes[0];
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 4 — Step Generators (produce animation frames)
// ═══════════════════════════════════════════════════════════════════════════════

/** Each step: { nodes (id array), highlights: {id: type}, pointers: {name: id|null},
 *   explanation, head (id), newNodeId?, removedId? }  */

function* stepsInsertHead(head, val) {
  const arr = toArray(head);
  const ids = arr.map((n) => n.id);
  yield {
    nodes: ids,
    highlights: {},
    pointers: { head: ids[0] || null },
    explanation: `Starting insert at head. Current list has ${ids.length} node(s).`,
    head: ids[0],
  };

  const newNode = makeNode(val);
  yield {
    nodes: ids,
    highlights: {},
    pointers: { head: ids[0] || null },
    explanation: `Create new node with value ${val}.`,
    head: ids[0],
    newNodeId: newNode.id,
    newNodeVal: val,
    phase: "created",
  };

  yield {
    nodes: [newNode.id, ...ids],
    highlights: { [newNode.id]: "new" },
    pointers: { head: newNode.id },
    explanation: `Point new node's next to old head${ids[0] ? ` (node ${arr[0]?.val})` : " (null)"}. Update head to new node.`,
    head: newNode.id,
    newNodeId: newNode.id,
    newNodeVal: val,
    phase: "linked",
  };

  // Build result
  newNode.next = head;
  yield {
    nodes: [newNode.id, ...ids],
    highlights: { [newNode.id]: "found" },
    pointers: { head: newNode.id },
    explanation: `✅ Insertion complete! Node ${val} is the new head.`,
    head: newNode.id,
    newNodeId: newNode.id,
    newNodeVal: val,
    resultHead: newNode,
    done: true,
  };
}

function* stepsInsertTail(head, val) {
  const arr = toArray(head);
  const ids = arr.map((n) => n.id);
  yield {
    nodes: ids,
    highlights: {},
    pointers: { head: ids[0] || null },
    explanation: `Starting insert at tail with value ${val}. Traversing to find the last node.`,
    head: ids[0],
  };

  if (!head) {
    const newNode = makeNode(val);
    yield {
      nodes: [newNode.id],
      highlights: { [newNode.id]: "new" },
      pointers: { head: newNode.id },
      explanation: `List is empty — new node becomes the head.`,
      head: newNode.id,
      newNodeId: newNode.id,
      newNodeVal: val,
      resultHead: newNode,
      done: true,
    };
    return;
  }

  for (let i = 0; i < arr.length; i++) {
    yield {
      nodes: ids,
      highlights: { [arr[i].id]: "active" },
      pointers: { head: ids[0], current: arr[i].id },
      explanation: `Visiting node ${arr[i].val}${arr[i].next ? " → has next, keep going." : " → next is null. This is the tail!"}`,
      head: ids[0],
    };
  }

  const newNode = makeNode(val);
  yield {
    nodes: [...ids, newNode.id],
    highlights: { [newNode.id]: "new", [arr[arr.length - 1].id]: "active" },
    pointers: { head: ids[0], tail: arr[arr.length - 1].id },
    explanation: `Create node ${val} and link tail's next to it.`,
    head: ids[0],
    newNodeId: newNode.id,
    newNodeVal: val,
  };

  // Build result
  const { head: clonedHead } = cloneList(head);
  let cur = clonedHead;
  while (cur.next) cur = cur.next;
  cur.next = newNode;
  yield {
    nodes: [...ids, newNode.id],
    highlights: { [newNode.id]: "found" },
    pointers: { head: ids[0] },
    explanation: `✅ Node ${val} appended at tail successfully!`,
    head: ids[0],
    newNodeId: newNode.id,
    newNodeVal: val,
    resultHead: clonedHead,
    done: true,
  };
}

function* stepsInsertAt(head, val, pos) {
  const arr = toArray(head);
  const ids = arr.map((n) => n.id);
  yield {
    nodes: ids,
    highlights: {},
    pointers: { head: ids[0] || null },
    explanation: `Insert value ${val} at position ${pos}. List length = ${ids.length}.`,
    head: ids[0],
  };

  if (pos < 0 || pos > arr.length) {
    yield {
      nodes: ids,
      highlights: {},
      pointers: { head: ids[0] || null },
      explanation: `❌ Position ${pos} is out of bounds (valid: 0–${arr.length}).`,
      head: ids[0],
      done: true,
      resultHead: head,
    };
    return;
  }

  if (pos === 0) {
    yield* stepsInsertHead(head, val);
    return;
  }

  for (let i = 0; i < pos; i++) {
    yield {
      nodes: ids,
      highlights: { [arr[i].id]: i === pos - 1 ? "active" : "visited" },
      pointers: { head: ids[0], current: arr[i].id },
      explanation: `Traversing... at index ${i}${i === pos - 1 ? ` — this node is right before position ${pos}.` : "."}`,
      head: ids[0],
    };
  }

  const newNode = makeNode(val);
  const newIds = [...ids.slice(0, pos), newNode.id, ...ids.slice(pos)];
  yield {
    nodes: newIds,
    highlights: { [newNode.id]: "new", [arr[pos - 1].id]: "active" },
    pointers: { head: ids[0], prev: arr[pos - 1].id },
    explanation: `Insert node ${val}: prev.next → newNode → prev's old next.`,
    head: ids[0],
    newNodeId: newNode.id,
    newNodeVal: val,
  };

  const { head: clonedHead } = cloneList(head);
  let cur = clonedHead;
  for (let i = 0; i < pos - 1; i++) cur = cur.next;
  newNode.next = cur.next;
  cur.next = newNode;
  yield {
    nodes: newIds,
    highlights: { [newNode.id]: "found" },
    pointers: { head: ids[0] },
    explanation: `✅ Node ${val} inserted at position ${pos}!`,
    head: ids[0],
    newNodeId: newNode.id,
    newNodeVal: val,
    resultHead: clonedHead,
    done: true,
  };
}

function* stepsDeleteHead(head) {
  const arr = toArray(head);
  const ids = arr.map((n) => n.id);
  yield {
    nodes: ids,
    highlights: {},
    pointers: { head: ids[0] || null },
    explanation: `Delete head node. Current list has ${ids.length} node(s).`,
    head: ids[0],
  };

  if (!head) {
    yield {
      nodes: [],
      highlights: {},
      pointers: {},
      explanation: `❌ List is empty — nothing to delete.`,
      head: null,
      done: true,
      resultHead: null,
    };
    return;
  }

  yield {
    nodes: ids,
    highlights: { [ids[0]]: "delete" },
    pointers: { head: ids[0] },
    explanation: `Mark head node (${arr[0].val}) for deletion. Update head to next node${ids[1] ? ` (${arr[1].val}).` : " (null)."}`,
    head: ids[0],
    removedId: ids[0],
  };

  const newHead = head.next;
  const resultHead = newHead ? cloneList(newHead).head : null;
  yield {
    nodes: ids.slice(1),
    highlights: ids[1] ? { [ids[1]]: "found" } : {},
    pointers: { head: ids[1] || null },
    explanation: `✅ Head deleted! ${ids[1] ? `New head is ${arr[1].val}.` : "List is now empty."}`,
    head: ids[1] || null,
    resultHead,
    done: true,
  };
}

function* stepsDeleteTail(head) {
  const arr = toArray(head);
  const ids = arr.map((n) => n.id);
  yield {
    nodes: ids,
    highlights: {},
    pointers: { head: ids[0] || null },
    explanation: `Delete tail node. Traversing to find second-to-last node.`,
    head: ids[0],
  };

  if (!head) {
    yield {
      nodes: [],
      highlights: {},
      pointers: {},
      explanation: `❌ List is empty — nothing to delete.`,
      head: null,
      done: true,
      resultHead: null,
    };
    return;
  }
  if (!head.next) {
    yield {
      nodes: ids,
      highlights: { [ids[0]]: "delete" },
      pointers: { head: ids[0] },
      explanation: `Only one node — delete it. List becomes empty.`,
      head: ids[0],
      removedId: ids[0],
    };
    yield {
      nodes: [],
      highlights: {},
      pointers: {},
      explanation: `✅ Tail deleted! List is now empty.`,
      head: null,
      resultHead: null,
      done: true,
    };
    return;
  }

  for (let i = 0; i < arr.length - 1; i++) {
    yield {
      nodes: ids,
      highlights: { [arr[i].id]: "active" },
      pointers: { head: ids[0], current: arr[i].id },
      explanation: `Visiting node ${arr[i].val}${i === arr.length - 2 ? " — next node is the tail!" : "."}`,
      head: ids[0],
    };
  }

  yield {
    nodes: ids,
    highlights: {
      [ids[ids.length - 1]]: "delete",
      [ids[ids.length - 2]]: "active",
    },
    pointers: { head: ids[0], prev: ids[ids.length - 2] },
    explanation: `Mark tail (${arr[arr.length - 1].val}) for deletion. Set prev's next to null.`,
    head: ids[0],
    removedId: ids[ids.length - 1],
  };

  const { head: clonedHead } = cloneList(head);
  let cur = clonedHead;
  while (cur.next && cur.next.next) cur = cur.next;
  cur.next = null;
  yield {
    nodes: ids.slice(0, -1),
    highlights: {},
    pointers: { head: ids[0] },
    explanation: `✅ Tail node deleted! New tail is ${arr[arr.length - 2].val}.`,
    head: ids[0],
    resultHead: clonedHead,
    done: true,
  };
}

function* stepsDeleteValue(head, val) {
  const arr = toArray(head);
  const ids = arr.map((n) => n.id);
  yield {
    nodes: ids,
    highlights: {},
    pointers: { head: ids[0] || null },
    explanation: `Delete first node with value ${val}.`,
    head: ids[0],
  };

  if (!head) {
    yield {
      nodes: [],
      highlights: {},
      pointers: {},
      explanation: `❌ List is empty — value not found.`,
      head: null,
      done: true,
      resultHead: null,
    };
    return;
  }

  // Check head
  if (arr[0].val === val) {
    yield {
      nodes: ids,
      highlights: { [ids[0]]: "delete" },
      pointers: { head: ids[0] },
      explanation: `Head node has value ${val}! Deleting head.`,
      head: ids[0],
      removedId: ids[0],
    };
    const resultHead = head.next ? cloneList(head.next).head : null;
    yield {
      nodes: ids.slice(1),
      highlights: ids[1] ? { [ids[1]]: "found" } : {},
      pointers: { head: ids[1] || null },
      explanation: `✅ Deleted node with value ${val} (was head).`,
      head: ids[1] || null,
      resultHead,
      done: true,
    };
    return;
  }

  for (let i = 0; i < arr.length; i++) {
    const isTarget = arr[i].val === val;
    yield {
      nodes: ids,
      highlights: {
        [arr[i].id]: isTarget ? "delete" : "active",
        ...(i > 0 && !isTarget ? { [arr[i - 1].id]: "visited" } : {}),
      },
      pointers: {
        head: ids[0],
        current: arr[i].id,
        ...(i > 0 ? { prev: arr[i - 1].id } : {}),
      },
      explanation: isTarget
        ? `Found value ${val} at index ${i}! Rewiring prev.next to skip this node.`
        : `Node ${arr[i].val} ≠ ${val}. Moving forward.`,
      head: ids[0],
      ...(isTarget ? { removedId: arr[i].id } : {}),
    };

    if (isTarget) {
      const { head: clonedHead } = cloneList(head);
      let cur = clonedHead;
      for (let j = 0; j < i - 1; j++) cur = cur.next;
      cur.next = cur.next.next;
      const newIds = ids.filter((id) => id !== arr[i].id);
      yield {
        nodes: newIds,
        highlights: {},
        pointers: { head: ids[0] },
        explanation: `✅ Deleted node with value ${val}.`,
        head: ids[0],
        resultHead: clonedHead,
        done: true,
      };
      return;
    }
  }

  yield {
    nodes: ids,
    highlights: {},
    pointers: { head: ids[0] },
    explanation: `❌ Value ${val} not found in the list.`,
    head: ids[0],
    resultHead: head,
    done: true,
  };
}

function* stepsDeleteAt(head, pos) {
  const arr = toArray(head);
  const ids = arr.map((n) => n.id);
  yield {
    nodes: ids,
    highlights: {},
    pointers: { head: ids[0] || null },
    explanation: `Delete node at position ${pos}. List length = ${ids.length}.`,
    head: ids[0],
  };

  if (pos < 0 || pos >= arr.length) {
    yield {
      nodes: ids,
      highlights: {},
      pointers: { head: ids[0] || null },
      explanation: `❌ Position ${pos} is out of bounds (valid: 0–${arr.length - 1}).`,
      head: ids[0],
      done: true,
      resultHead: head,
    };
    return;
  }
  if (pos === 0) {
    yield* stepsDeleteHead(head);
    return;
  }

  for (let i = 0; i <= pos; i++) {
    const isTarget = i === pos;
    yield {
      nodes: ids,
      highlights: { [arr[i].id]: isTarget ? "delete" : "active" },
      pointers: {
        head: ids[0],
        current: arr[i].id,
        ...(i > 0 ? { prev: arr[i - 1].id } : {}),
      },
      explanation: isTarget
        ? `Reached position ${pos} (value ${arr[i].val}). Removing this node.`
        : `Traversing index ${i} (value ${arr[i].val}).`,
      head: ids[0],
      ...(isTarget ? { removedId: arr[i].id } : {}),
    };
  }

  const { head: clonedHead } = cloneList(head);
  let cur = clonedHead;
  for (let j = 0; j < pos - 1; j++) cur = cur.next;
  cur.next = cur.next?.next || null;
  const newIds = ids.filter((_, idx) => idx !== pos);
  yield {
    nodes: newIds,
    highlights: {},
    pointers: { head: ids[0] },
    explanation: `✅ Deleted node at position ${pos}.`,
    head: ids[0],
    resultHead: clonedHead,
    done: true,
  };
}

function* stepsSearch(head, val) {
  const arr = toArray(head);
  const ids = arr.map((n) => n.id);
  yield {
    nodes: ids,
    highlights: {},
    pointers: { head: ids[0] || null },
    explanation: `Search for value ${val}. Starting from head.`,
    head: ids[0],
  };

  for (let i = 0; i < arr.length; i++) {
    const found = arr[i].val === val;
    yield {
      nodes: ids,
      highlights: {
        [arr[i].id]: found ? "found" : "active",
        ...Object.fromEntries(arr.slice(0, i).map((n) => [n.id, "visited"])),
      },
      pointers: { head: ids[0], current: arr[i].id },
      explanation: found
        ? `✅ Found value ${val} at index ${i}!`
        : `Node ${arr[i].val} ≠ ${val}. Continue searching.`,
      head: ids[0],
      ...(found ? { done: true, resultHead: head } : {}),
    };
    if (found) return;
  }

  yield {
    nodes: ids,
    highlights: Object.fromEntries(ids.map((id) => [id, "visited"])),
    pointers: { head: ids[0] },
    explanation: `❌ Value ${val} not found in the list.`,
    head: ids[0],
    done: true,
    resultHead: head,
  };
}

function* stepsReverse(head) {
  const arr = toArray(head);
  const ids = arr.map((n) => n.id);
  yield {
    nodes: ids,
    highlights: {},
    pointers: { head: ids[0] || null },
    explanation: `Reverse the list using three pointers: prev, current, next.`,
    head: ids[0],
  };

  if (arr.length <= 1) {
    yield {
      nodes: ids,
      highlights: ids[0] ? { [ids[0]]: "found" } : {},
      pointers: { head: ids[0] || null },
      explanation: `✅ List has ${arr.length} node(s) — already reversed!`,
      head: ids[0],
      done: true,
      resultHead: head,
    };
    return;
  }

  const order = [...ids];
  for (let i = 0; i < arr.length; i++) {
    const prevId = i > 0 ? arr[i - 1].id : null;
    const nextId = i < arr.length - 1 ? arr[i + 1].id : null;
    yield {
      nodes: order,
      highlights: {
        [arr[i].id]: "active",
        ...(prevId ? { [prevId]: "found" } : {}),
        ...(nextId ? { [nextId]: "new" } : {}),
      },
      pointers: {
        ...(prevId ? { prev: prevId } : {}),
        current: arr[i].id,
        ...(nextId ? { next: nextId } : {}),
        head: ids[0],
      },
      explanation: `Step ${i + 1}: Save next = ${nextId ? arr[i + 1].val : "null"}. Reverse current (${arr[i].val}).next → prev${prevId ? ` (${arr[i - 1].val})` : " (null)"}. Advance pointers.`,
      head: ids[0],
    };
  }

  // Build reversed list
  const reversed = [...arr].reverse();
  const nodes = reversed.map((n) => makeNode(n.val));
  for (let i = 0; i < nodes.length - 1; i++) nodes[i].next = nodes[i + 1];
  // use original ids reversed for visual
  const revIds = [...ids].reverse();
  yield {
    nodes: revIds,
    highlights: { [revIds[0]]: "found" },
    pointers: { head: revIds[0] },
    explanation: `✅ List reversed! New head is ${reversed[0].val}.`,
    head: revIds[0],
    resultHead: nodes[0],
    done: true,
    reversedIds: revIds,
  };
}

function* stepsTraverse(head) {
  const arr = toArray(head);
  const ids = arr.map((n) => n.id);
  yield {
    nodes: ids,
    highlights: {},
    pointers: { head: ids[0] || null },
    explanation: `Traverse: visit every node from head to null.`,
    head: ids[0],
  };

  for (let i = 0; i < arr.length; i++) {
    yield {
      nodes: ids,
      highlights: {
        [arr[i].id]: "active",
        ...Object.fromEntries(arr.slice(0, i).map((n) => [n.id, "visited"])),
      },
      pointers: { head: ids[0], current: arr[i].id },
      explanation: `Visiting index ${i}: value = ${arr[i].val}. ${i < arr.length - 1 ? "Follow next pointer." : "Next is null — end of list."}`,
      head: ids[0],
    };
  }

  yield {
    nodes: ids,
    highlights: Object.fromEntries(ids.map((id) => [id, "visited"])),
    pointers: { head: ids[0] },
    explanation: `✅ Traversal complete! Visited ${ids.length} node(s).`,
    head: ids[0],
    done: true,
    resultHead: head,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 5 — Main Component
// ═══════════════════════════════════════════════════════════════════════════════

export default function LinkedListVisualizer() {
  // --- State ---
  const [listHead, setListHead] = useState(() => buildList([4, 8, 15, 16, 23]));
  const [operation, setOperation] = useState("insertHead");
  const [inputVal, setInputVal] = useState("42");
  const [inputPos, setInputPos] = useState("2");
  const [speed, setSpeed] = useState(600); // ms per step
  const [steps, setSteps] = useState([]);
  const [stepIdx, setStepIdx] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const playRef = useRef(false);
  const cancelRef = useRef(false);

  const currentStep =
    stepIdx >= 0 && stepIdx < steps.length ? steps[stepIdx] : null;

  // Node value map for rendering (includes originals + any new nodes)
  const nodeMap = useRef({});
  useEffect(() => {
    const arr = toArray(listHead);
    arr.forEach((n) => {
      nodeMap.current[n.id] = n.val;
    });
  }, [listHead]);

  // --- Helpers ---
  const needsValue = [
    "insertHead",
    "insertTail",
    "insertAt",
    "deleteValue",
    "search",
  ].includes(operation);
  const needsPos = ["insertAt", "deleteAt"].includes(operation);

  const generateRandom = () => {
    const len = randInt(3, 8);
    const vals = Array.from({ length: len }, () => randInt(1, 99));
    const newHead = buildList(vals);
    setListHead(newHead);
    resetViz();
  };

  const resetViz = useCallback(() => {
    cancelRef.current = true;
    playRef.current = false;
    setSteps([]);
    setStepIdx(-1);
    setIsPlaying(false);
    setIsRunning(false);
  }, []);

  const resetList = () => {
    setListHead(buildList([4, 8, 15, 16, 23]));
    resetViz();
  };

  // --- Execute Operation ---
  const executeOp = useCallback(() => {
    cancelRef.current = true;
    setTimeout(() => {
      cancelRef.current = false;
      const val = parseInt(inputVal) || 0;
      const pos = parseInt(inputPos) || 0;
      let gen;
      switch (operation) {
        case "insertHead":
          gen = stepsInsertHead(listHead, val);
          break;
        case "insertTail":
          gen = stepsInsertTail(listHead, val);
          break;
        case "insertAt":
          gen = stepsInsertAt(listHead, val, pos);
          break;
        case "deleteHead":
          gen = stepsDeleteHead(listHead);
          break;
        case "deleteTail":
          gen = stepsDeleteTail(listHead);
          break;
        case "deleteValue":
          gen = stepsDeleteValue(listHead, val);
          break;
        case "deleteAt":
          gen = stepsDeleteAt(listHead, pos);
          break;
        case "search":
          gen = stepsSearch(listHead, val);
          break;
        case "reverse":
          gen = stepsReverse(listHead);
          break;
        case "traverse":
          gen = stepsTraverse(listHead);
          break;
        default:
          return;
      }
      const allSteps = [...gen];
      // Register new node values
      allSteps.forEach((s) => {
        if (s.newNodeId && s.newNodeVal !== undefined) {
          nodeMap.current[s.newNodeId] = s.newNodeVal;
        }
      });
      setSteps(allSteps);
      setStepIdx(0);
      setIsRunning(true);
      setIsPlaying(false);
      playRef.current = false;
    }, 50);
  }, [listHead, operation, inputVal, inputPos]);

  // --- Step Navigation ---
  const stepForward = () => {
    setStepIdx((i) => {
      const next = Math.min(i + 1, steps.length - 1);
      if (steps[next]?.done && steps[next]?.resultHead !== undefined) {
        setListHead(steps[next].resultHead);
      }
      return next;
    });
  };
  const stepBackward = () => setStepIdx((i) => Math.max(i - 1, 0));

  // --- Auto-play ---
  useEffect(() => {
    if (!isPlaying) return;
    playRef.current = true;
    let timeout;
    const advance = () => {
      if (!playRef.current) return;
      setStepIdx((i) => {
        const next = i + 1;
        if (next >= steps.length) {
          playRef.current = false;
          setIsPlaying(false);
          // Apply final result
          const last = steps[steps.length - 1];
          if (last?.resultHead !== undefined) setListHead(last.resultHead);
          return i;
        }
        if (steps[next]?.done && steps[next]?.resultHead !== undefined) {
          setListHead(steps[next].resultHead);
        }
        timeout = setTimeout(advance, speed);
        return next;
      });
    };
    timeout = setTimeout(advance, speed);
    return () => {
      playRef.current = false;
      clearTimeout(timeout);
    };
  }, [isPlaying, steps, speed]);

  const togglePlay = () => {
    if (isPlaying) {
      playRef.current = false;
      setIsPlaying(false);
    } else {
      if (stepIdx >= steps.length - 1) setStepIdx(0);
      setIsPlaying(true);
    }
  };

  // --- Determine what nodes to render ---
  const displayNodes = (() => {
    if (!currentStep) {
      return toArray(listHead).map((n) => ({ id: n.id, val: n.val }));
    }
    return (currentStep.nodes || []).map((id) => ({
      id,
      val: nodeMap.current[id] ?? "?",
    }));
  })();

  const getNodeStyle = (id) => {
    if (!currentStep)
      return { gradient: palette.nodeDefault, scale: 1, glow: false };
    const hl = currentStep.highlights?.[id];
    switch (hl) {
      case "active":
        return { gradient: palette.nodeActive, scale: 1.08, glow: true };
      case "found":
        return { gradient: palette.nodeFound, scale: 1.1, glow: true };
      case "delete":
        return { gradient: palette.nodeDelete, scale: 1.05, glow: true };
      case "new":
        return { gradient: palette.nodeNew, scale: 1.12, glow: true };
      case "visited":
        return {
          gradient: "linear-gradient(135deg, #b2bec3 0%, #dfe6e9 100%)",
          scale: 0.95,
          glow: false,
        };
      default:
        return { gradient: palette.nodeDefault, scale: 1, glow: false };
    }
  };

  const getArrowColor = (fromId, toId) => {
    if (!currentStep) return palette.primaryLight;
    const hlFrom = currentStep.highlights?.[fromId];
    const hlTo = currentStep.highlights?.[toId];
    if (hlFrom === "active" || hlFrom === "found" || hlTo === "active")
      return palette.accent;
    if (hlFrom === "delete") return palette.danger;
    return palette.primaryLight;
  };

  const isHead = (id) => {
    if (currentStep?.pointers?.head === id) return true;
    if (!currentStep && displayNodes.length > 0 && displayNodes[0].id === id)
      return true;
    return false;
  };

  // --- Pointer labels ---
  const pointerLabels = currentStep?.pointers
    ? Object.entries(currentStep.pointers)
        .filter(([k, v]) => v != null && k !== "head")
        .map(([k, v]) => ({ name: k, nodeId: v }))
    : [];

  const pointerColors = {
    current: palette.accent,
    prev: palette.primary,
    next: "#e17055",
    tail: palette.success,
  };

  // --- Complexity for current op ---
  const cx = COMPLEXITY[operation];
  const edges = EDGE_CASES[operation];
  const intuition = INTUITIONS[operation];

  const isDone = currentStep?.done;

  return (
    <div style={S.page}>
      <div style={S.container}>
        {/* ───── Header ───── */}
        <div style={S.header}>
          <h1 style={S.title}>⛓️ Singly Linked List Visualizer</h1>
          <p style={S.subtitle}>
            Interactive step-by-step visualization — master every operation
          </p>
        </div>

        {/* ───── Controls Card ───── */}
        <div style={S.card}>
          <div style={S.cardTitle}>⚙️ Control Panel</div>
          <div style={S.controlsRow}>
            <select
              style={S.select}
              value={operation}
              onChange={(e) => {
                setOperation(e.target.value);
                resetViz();
              }}
            >
              {OPERATIONS.map((op) => (
                <option key={op.id} value={op.id}>
                  {op.group}: {op.label}
                </option>
              ))}
            </select>

            {needsValue && (
              <input
                style={S.input}
                type="number"
                placeholder="Value"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
              />
            )}
            {needsPos && (
              <input
                style={{ ...S.input, width: 72 }}
                type="number"
                placeholder="Pos"
                value={inputPos}
                onChange={(e) => setInputPos(e.target.value)}
                min={0}
              />
            )}

            <button
              style={S.btn(palette.primary)}
              onClick={executeOp}
              disabled={isPlaying}
            >
              ▶ Execute
            </button>
            <button style={S.btn("#636e72")} onClick={generateRandom}>
              🎲 Random
            </button>
            <button style={S.btn(palette.danger)} onClick={resetList}>
              ↻ Reset
            </button>

            <div style={S.sliderWrap}>
              <span>🐢</span>
              <input
                style={S.slider}
                type="range"
                min={100}
                max={1500}
                step={50}
                value={1600 - speed}
                onChange={(e) => setSpeed(1600 - +e.target.value)}
              />
              <span>🐇</span>
              <span style={{ minWidth: 50 }}>{speed}ms</span>
            </div>
          </div>

          {/* Step controls */}
          {isRunning && (
            <div style={{ ...S.controlsRow, marginTop: 12 }}>
              <button
                style={{
                  ...S.btn(palette.primary),
                  ...(stepIdx <= 0 ? S.btnDisabled : {}),
                }}
                onClick={stepBackward}
                disabled={stepIdx <= 0 || isPlaying}
              >
                ◀ Prev
              </button>
              <button
                style={S.btn(
                  isPlaying ? palette.warning : palette.success,
                  isPlaying ? "#333" : "#fff",
                )}
                onClick={togglePlay}
              >
                {isPlaying ? "⏸ Pause" : "⏵ Auto-play"}
              </button>
              <button
                style={{
                  ...S.btn(palette.primary),
                  ...(stepIdx >= steps.length - 1 ? S.btnDisabled : {}),
                }}
                onClick={stepForward}
                disabled={stepIdx >= steps.length - 1 || isPlaying}
              >
                Next ▶
              </button>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: palette.textLight,
                  marginLeft: 4,
                }}
              >
                Step {stepIdx + 1} / {steps.length}
              </span>
              {isDone && <span style={S.tag(palette.success)}>✓ DONE</span>}
            </div>
          )}
        </div>

        {/* ───── Visualization Card ───── */}
        <div style={S.card}>
          <div style={S.cardTitle}>🔗 Linked List</div>
          <div style={S.vizArea}>
            {displayNodes.length === 0 ? (
              <div style={S.emptyState}>
                <span style={{ fontSize: 40 }}>∅</span>
                <br />
                Empty List — head → null
              </div>
            ) : (
              <>
                {displayNodes.map((n, i) => {
                  const { gradient, scale, glow } = getNodeStyle(n.id);
                  const arrowColor =
                    i < displayNodes.length - 1
                      ? getArrowColor(n.id, displayNodes[i + 1]?.id)
                      : palette.primaryLight;
                  return (
                    <div
                      key={n.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        position: "relative",
                      }}
                    >
                      <div style={{ position: "relative" }}>
                        {isHead(n.id) && <div style={S.headPointer}>HEAD</div>}
                        {/* pointer labels below node */}
                        {pointerLabels
                          .filter((p) => p.nodeId === n.id)
                          .map((p) => (
                            <div
                              key={p.name}
                              style={{
                                ...S.headPointer,
                                top: "auto",
                                bottom: -22,
                                background:
                                  (pointerColors[p.name] || palette.accent) +
                                  "22",
                                color: pointerColors[p.name] || palette.accent,
                              }}
                            >
                              {p.name}
                            </div>
                          ))}
                        <div style={S.node(gradient, scale, glow)}>
                          <span>{n.val}</span>
                          <span style={S.nodeLabel}>idx {i}</span>
                        </div>
                      </div>
                      {i < displayNodes.length - 1 && (
                        <div style={{ ...S.arrow, background: arrowColor }}>
                          <div
                            style={{
                              ...S.arrowHead,
                              borderLeftColor: arrowColor,
                            }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
                {/* null terminator */}
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div
                    style={{
                      ...S.arrow,
                      background: palette.primaryLight,
                      width: 24,
                    }}
                  >
                    <div style={S.arrowHead} />
                  </div>
                  <div style={S.nullBox}>NULL</div>
                </div>
              </>
            )}
          </div>

          {/* Legend */}
          <div style={S.legend}>
            <div style={S.legendItem}>
              <div style={S.legendDot(palette.nodeDefault)} /> Default
            </div>
            <div style={S.legendItem}>
              <div style={S.legendDot(palette.nodeActive)} /> Active / Current
            </div>
            <div style={S.legendItem}>
              <div style={S.legendDot(palette.nodeFound)} /> Found / Success
            </div>
            <div style={S.legendItem}>
              <div style={S.legendDot(palette.nodeNew)} /> New Node
            </div>
            <div style={S.legendItem}>
              <div style={S.legendDot(palette.nodeDelete)} /> Marked for Delete
            </div>
            <div style={S.legendItem}>
              <div
                style={S.legendDot("linear-gradient(135deg, #b2bec3, #dfe6e9)")}
              />{" "}
              Visited
            </div>
          </div>
        </div>

        {/* ───── Explanation Panel ───── */}
        <div style={S.card}>
          <div style={S.cardTitle}>💬 Step Explanation</div>
          <div style={S.explanation}>
            {currentStep ? (
              <>
                <span style={S.stepBadge}>STEP {stepIdx + 1}</span>
                {currentStep.explanation}
              </>
            ) : (
              <span style={{ color: palette.textLight }}>
                Select an operation and press <strong>Execute</strong> to see
                step-by-step walkthrough.
              </span>
            )}
          </div>
        </div>

        {/* ───── Educational Panel ───── */}
        <div style={S.eduGrid}>
          {/* Intuition */}
          <div style={S.card}>
            <div style={S.cardTitle}>💡 Intuition</div>
            <p
              style={{
                fontSize: 14,
                lineHeight: 1.7,
                color: palette.text,
                margin: 0,
              }}
            >
              {intuition}
            </p>
          </div>

          {/* Complexity */}
          <div style={S.card}>
            <div style={S.cardTitle}>
              ⏱ Complexity — {OPERATIONS.find((o) => o.id === operation)?.label}
            </div>
            <table style={S.complexityTable}>
              <thead>
                <tr>
                  <th style={S.th}>Metric</th>
                  <th style={S.th}>Best</th>
                  <th style={S.th}>Average</th>
                  <th style={S.th}>Worst</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ ...S.td, fontWeight: 700 }}>Time</td>
                  <td style={S.td}>
                    <span style={S.tag(palette.success)}>{cx.best}</span>
                  </td>
                  <td style={S.td}>
                    <span style={S.tag(palette.primary)}>{cx.time}</span>
                  </td>
                  <td style={S.td}>
                    <span style={S.tag(palette.danger)}>{cx.worst}</span>
                  </td>
                </tr>
                <tr>
                  <td
                    style={{ ...S.td, fontWeight: 700, borderBottom: "none" }}
                  >
                    Space
                  </td>
                  <td style={{ ...S.td, borderBottom: "none" }} colSpan={3}>
                    <span style={S.tag(palette.accent)}>{cx.space}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Edge Cases */}
          <div style={S.card}>
            <div style={S.cardTitle}>⚠️ Edge Cases</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {edges.map((e, i) => (
                <span
                  key={i}
                  style={{
                    ...S.tag("linear-gradient(135deg, #636e72, #b2bec3)"),
                    fontSize: 12,
                  }}
                >
                  {e}
                </span>
              ))}
            </div>
          </div>

          {/* All Operations Complexity Table */}
          <div style={S.card}>
            <div style={S.cardTitle}>📊 Full Complexity Reference</div>
            <div style={{ overflowX: "auto" }}>
              <table style={S.complexityTable}>
                <thead>
                  <tr>
                    <th style={S.th}>Operation</th>
                    <th style={S.th}>Time</th>
                    <th style={S.th}>Space</th>
                  </tr>
                </thead>
                <tbody>
                  {OPERATIONS.map((op) => (
                    <tr
                      key={op.id}
                      style={
                        op.id === operation
                          ? { background: palette.primaryGlow }
                          : {}
                      }
                    >
                      <td
                        style={{
                          ...S.td,
                          fontWeight: op.id === operation ? 800 : 500,
                        }}
                      >
                        {op.label}
                      </td>
                      <td style={S.td}>{COMPLEXITY[op.id].time}</td>
                      <td style={S.td}>{COMPLEXITY[op.id].space}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ───── Footer ───── */}
        <div
          style={{
            textAlign: "center",
            marginTop: 24,
            fontSize: 12,
            color: palette.textLight,
            fontWeight: 600,
          }}
        >
          Singly Linked List Visualizer • Built for learning & interview prep
        </div>
      </div>
    </div>
  );
}
