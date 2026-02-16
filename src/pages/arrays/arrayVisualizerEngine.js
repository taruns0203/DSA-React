/* ============================================================
   ARRAY VISUALIZER — CORE ENGINE
   ============================================================ */

// --- STATE ---
let arr = [];
let capacity = 16;
let animSpeed = 400; // ms per step
let steps = []; // queued animation steps
let stepIndex = 0;
let isPlaying = false;
let autoInterval = null;
let isBusy = false;

export function initArrayVisualizer() {
  generateRandom();
  onOperationChange();
}

export function cleanupArrayVisualizer() {
  stopAutoPlay();
}

// --- ARRAY MANAGEMENT ---
export function generateRandom() {
  const len = 6 + Math.floor(Math.random() * 5);
  arr = Array.from({ length: len }, () => Math.floor(Math.random() * 99) + 1);
  capacity = Math.max(16, nextPow2(arr.length));
  resetUI();
  renderArray();
}

export function generateSorted() {
  const len = 6 + Math.floor(Math.random() * 5);
  arr = Array.from({ length: len }, () => Math.floor(Math.random() * 99) + 1).sort((a, b) => a - b);
  capacity = Math.max(16, nextPow2(arr.length));
  resetUI();
  renderArray();
}

export function initFromInput() {
  const raw = document.getElementById('initInput').value;
  const parsed = raw
    .split(',')
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !Number.isNaN(n));
  if (parsed.length === 0) return;
  arr = parsed;
  capacity = Math.max(16, nextPow2(arr.length));
  resetUI();
  renderArray();
}

export function clearArray() {
  arr = [];
  capacity = 16;
  resetUI();
  renderArray();
}

function nextPow2(n) {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

// --- UI RENDERING ---
function renderArray(cellStates = {}, pointers = {}) {
  const container = document.getElementById('arrayContainer');
  if (!container) return;
  if (arr.length === 0) {
    container.innerHTML =
      '<div class="empty-state"><div class="empty-icon">[ ]</div><p>Array is empty. Generate or load data to begin.</p></div>';
  } else {
    container.innerHTML = arr
      .map((val, i) => {
        const state = cellStates[i] || 'default';
        const ptrLabels = [];
        for (const [key, idx] of Object.entries(pointers)) {
          if (idx === i) ptrLabels.push(key);
        }
        const ptrHTML = ptrLabels
          .map((p) => {
            const cls =
              p === 'i'
                ? 'ptr-i'
                : p === 'j'
                  ? 'ptr-j'
                  : p === 'mid'
                    ? 'ptr-mid'
                    : p === 'lo'
                      ? 'ptr-lo'
                      : p === 'hi'
                        ? 'ptr-hi'
                        : 'ptr-i';
            return `<span class="pointer-label ${cls}">${p}</span>`;
          })
          .join('');
        return `<div class="array-cell" style="animation: cellAppear 0.3s ease ${i * 0.03}s both;">
        <div class="cell-value state-${state}" style="position:relative;">
          ${ptrHTML}
          ${val}
        </div>
        <div class="cell-index">${i}</div>
      </div>`;
      })
      .join('');
  }
  renderMemoryBar();
  const lenDisplay = document.getElementById('lenDisplay');
  const capDisplay = document.getElementById('capDisplay');
  if (lenDisplay) lenDisplay.textContent = arr.length;
  if (capDisplay) capDisplay.textContent = capacity;
}

function renderMemoryBar() {
  const bar = document.getElementById('memoryBar');
  if (!bar) return;
  let html = '';
  for (let i = 0; i < Math.min(capacity, 32); i++) {
    if (i < arr.length) {
      html += `<div class="mem-slot used">${arr[i]}</div>`;
    } else {
      html += '<div class="mem-slot empty">—</div>';
    }
  }
  if (capacity > 32) html += `<div class="mem-slot empty" style="min-width:50px;">…+${capacity - 32}</div>`;
  bar.innerHTML = html;
}

// --- OPERATION INPUT CONFIG ---
export function onOperationChange() {
  const op = document.getElementById('operationSelect').value;
  const valInput = document.getElementById('inputValue');
  const idxInput = document.getElementById('inputIndex');
  const label = document.getElementById('inputLabel');

  valInput.style.display = 'block';
  idxInput.style.display = 'none';
  label.textContent = 'Value';
  valInput.placeholder = 'Value';

  switch (op) {
    case 'insert_end':
      label.textContent = 'Value to push';
      valInput.placeholder = 'e.g. 42';
      break;
    case 'insert_at':
      label.textContent = 'Value & Index';
      valInput.placeholder = 'Value';
      idxInput.style.display = 'block';
      idxInput.placeholder = 'Index';
      break;
    case 'delete_end':
      valInput.style.display = 'none';
      label.textContent = 'No input needed';
      break;
    case 'delete_at':
      label.textContent = 'Index to delete';
      valInput.placeholder = 'Index';
      break;
    case 'access':
      label.textContent = 'Index to access';
      valInput.placeholder = 'Index';
      break;
    case 'update':
      label.textContent = 'Index & New Value';
      valInput.placeholder = 'Index';
      idxInput.style.display = 'block';
      idxInput.placeholder = 'New value';
      break;
    case 'linear_search':
      label.textContent = 'Value to search';
      valInput.placeholder = 'Target value';
      break;
    case 'binary_search':
      label.textContent = 'Value to search (sorted)';
      valInput.placeholder = 'Target value';
      break;
    case 'reverse':
    case 'find_min_max':
      valInput.style.display = 'none';
      label.textContent = 'No input needed';
      break;
  }
}

// --- SPEED ---
export function updateSpeed() {
  const val = parseInt(document.getElementById('speedSlider').value, 10);
  document.getElementById('speedLabel').textContent = `${val}x`;
  animSpeed = 900 - (val - 1) * 85; // range ~ 900ms to 135ms
}

// --- RESET UI ---
function resetUI() {
  stopAutoPlay();
  steps = [];
  stepIndex = 0;
  isBusy = false;
  document.getElementById('logPanel').innerHTML = '';
  document.getElementById('explanationText').innerHTML =
    'Select an operation and click <strong>Execute</strong> or <strong>Step</strong> to begin.';
  setStatus('Ready', false);
}

// --- STATUS ---
function setStatus(text, busy) {
  document.getElementById('statusText').textContent = text;
  const dot = document.getElementById('statusDot');
  if (busy) {
    dot.classList.add('busy');
  } else {
    dot.classList.remove('busy');
  }
}

function setComplexity(time, space, opName) {
  document.getElementById('timeComplexity').textContent = time;
  document.getElementById('spaceComplexity').textContent = space;
  document.getElementById('opName').textContent = opName;
}

function addLog(step, text) {
  const panel = document.getElementById('logPanel');
  const entry = document.createElement('div');
  entry.className = 'log-entry';
  entry.innerHTML = `<span class="log-step">${step}</span><span class="log-text">${text}</span>`;
  panel.prepend(entry);
}

function explain(html) {
  document.getElementById('explanationText').innerHTML = html;
}

// --- EDU TABS ---
export function switchEduTab(tab) {
  document.querySelectorAll('.edu-tab').forEach((t) => t.classList.remove('active'));
  document.querySelectorAll('.edu-content').forEach((c) => c.classList.remove('active'));
  document.querySelector(`.edu-tab[data-tab="${tab}"]`).classList.add('active');
  document.getElementById(`edu-${tab}`).classList.add('active');
}

/* ============================================================
   STEP GENERATION — Each operation builds a step queue
   ============================================================ */

function buildSteps() {
  const op = document.getElementById('operationSelect').value;
  const val = parseInt(document.getElementById('inputValue').value, 10);
  const idx = parseInt(document.getElementById('inputIndex').value, 10);
  steps = [];
  stepIndex = 0;

  switch (op) {
    case 'insert_end':
      buildInsertEnd(val);
      break;
    case 'insert_at':
      buildInsertAt(val, idx);
      break;
    case 'delete_end':
      buildDeleteEnd();
      break;
    case 'delete_at':
      buildDeleteAt(val);
      break;
    case 'access':
      buildAccess(val);
      break;
    case 'update':
      buildUpdate(val, idx);
      break;
    case 'linear_search':
      buildLinearSearch(val);
      break;
    case 'binary_search':
      buildBinarySearch(val);
      break;
    case 'reverse':
      buildReverse();
      break;
    case 'find_min_max':
      buildFindMinMax();
      break;
  }
}

// Helper: push a step
function addStep(arrSnapshot, cellStates, pointers, logStep, logText, explanationHTML) {
  steps.push({
    arr: [...arrSnapshot],
    cellStates: { ...cellStates },
    pointers: { ...pointers },
    logStep,
    logText,
    explanationHTML,
  });
}

// ---------- INSERT END (PUSH) ----------
function buildInsertEnd(val) {
  if (Number.isNaN(val)) {
    explain('⚠️ Please enter a valid number.');
    return;
  }
  setComplexity('O(1) amortized', 'O(1)', 'Push');

  // Step 1: highlight current state
  const states = {};
  addStep(
    arr,
    states,
    {},
    'INIT',
    `Array has ${arr.length} elements, capacity ${capacity}.`,
    `Pushing <span class="highlight">${val}</span> to the end. Current length: <span class="highlight">${arr.length}</span>, capacity: <span class="highlight">${capacity}</span>.`
  );

  // Check if resize needed
  if (arr.length >= capacity) {
    const oldCap = capacity;
    capacity *= 2;
    addStep(
      arr,
      {},
      {},
      'RESIZE',
      `Capacity full! Doubling from ${oldCap} to ${capacity}.`,
      `⚠️ Array is full. Allocating new block of size <span class="highlight">${capacity}</span>, copying all ${arr.length} elements. This single resize is O(n), but amortized over all pushes it's O(1).`
    );
  }

  // Step 2: insert
  arr.push(val);
  const endStates = {};
  endStates[arr.length - 1] = 'inserted';
  addStep(
    arr,
    endStates,
    { i: arr.length - 1 },
    'INSERT',
    `Placed ${val} at index ${arr.length - 1}.`,
    `Wrote <span class="highlight">${val}</span> at index <span class="highlight">${arr.length - 1}</span>. Length is now <span class="highlight">${arr.length}</span>. Direct address computation — O(1).`
  );

  // Step 3: done
  addStep(
    arr,
    {},
    {},
    'DONE',
    'Push complete.',
    `✅ Push complete. The element <span class="highlight">${val}</span> is now at the end of the array.`
  );
}

// ---------- INSERT AT INDEX ----------
function buildInsertAt(val, idx) {
  if (Number.isNaN(val) || Number.isNaN(idx)) {
    explain('⚠️ Enter both a value and an index.');
    return;
  }
  if (idx < 0 || idx > arr.length) {
    explain(`⚠️ Index <span class="highlight">${idx}</span> is out of bounds [0, ${arr.length}].`);
    return;
  }
  setComplexity('O(n)', 'O(1)', 'Insert at Index');

  addStep(
    arr,
    { [idx]: 'active' },
    { i: idx },
    'INIT',
    `Inserting ${val} at index ${idx}. Need to shift elements right.`,
    `Inserting <span class="highlight">${val}</span> at index <span class="highlight">${idx}</span>. Must shift elements [${idx}..${arr.length - 1}] one position right.`
  );

  // Shift elements right, from end to idx
  for (let i = arr.length - 1; i >= idx; i--) {
    const states = {};
    states[i] = 'shifting';
    if (i + 1 <= arr.length) states[i + 1] = 'shifting';
    addStep(
      arr,
      states,
      { i },
      'SHIFT',
      `Shifting arr[${i}] = ${arr[i]} → arr[${i + 1}].`,
      `Moving element <span class="highlight">${arr[i]}</span> from index <span class="highlight">${i}</span> to <span class="highlight">${i + 1}</span>.`
    );
  }

  // Perform the actual insert
  arr.splice(idx, 0, val);

  const insertStates = {};
  insertStates[idx] = 'inserted';
  addStep(
    arr,
    insertStates,
    { i: idx },
    'PLACE',
    `Placed ${val} at index ${idx}.`,
    `Wrote <span class="highlight">${val}</span> at index <span class="highlight">${idx}</span>. All subsequent elements have been shifted right.`
  );

  addStep(
    arr,
    {},
    {},
    'DONE',
    `Insert complete. Length: ${arr.length}.`,
    `✅ Insertion complete. Shifted <span class="highlight">${arr.length - 1 - idx}</span> elements. This is why mid-array insertion is O(n).`
  );
}

// ---------- DELETE END (POP) ----------
function buildDeleteEnd() {
  if (arr.length === 0) {
    explain('⚠️ Array is empty — nothing to pop.');
    return;
  }
  setComplexity('O(1)', 'O(1)', 'Pop');

  const removed = arr[arr.length - 1];
  addStep(
    arr,
    { [arr.length - 1]: 'removed' },
    { i: arr.length - 1 },
    'TARGET',
    `Removing last element: ${removed} at index ${arr.length - 1}.`,
    `Removing last element <span class="highlight">${removed}</span> at index <span class="highlight">${arr.length - 1}</span>. No shifting needed — O(1).`
  );

  arr.pop();
  addStep(
    arr,
    {},
    {},
    'DONE',
    `Pop complete. Removed ${removed}. Length: ${arr.length}.`,
    `✅ Popped <span class="highlight">${removed}</span>. Length is now <span class="highlight">${arr.length}</span>. This is always O(1) — just decrement the length counter.`
  );
}

// ---------- DELETE AT INDEX ----------
function buildDeleteAt(idx) {
  if (Number.isNaN(idx)) {
    explain('⚠️ Enter a valid index.');
    return;
  }
  if (idx < 0 || idx >= arr.length) {
    explain(`⚠️ Index <span class="highlight">${idx}</span> out of bounds [0, ${arr.length - 1}].`);
    return;
  }
  setComplexity('O(n)', 'O(1)', 'Delete at Index');

  const removed = arr[idx];
  addStep(
    arr,
    { [idx]: 'removed' },
    { i: idx },
    'TARGET',
    `Deleting arr[${idx}] = ${removed}. Will shift elements left.`,
    `Deleting <span class="highlight">${removed}</span> at index <span class="highlight">${idx}</span>. Must shift elements [${idx + 1}..${arr.length - 1}] one position left.`
  );

  // Show shifting
  for (let i = idx + 1; i < arr.length; i++) {
    const states = {};
    states[i] = 'shifting';
    states[i - 1] = 'shifting';
    addStep(
      arr,
      states,
      { i },
      'SHIFT',
      `Shifting arr[${i}] = ${arr[i]} → arr[${i - 1}].`,
      `Moving element <span class="highlight">${arr[i]}</span> from index <span class="highlight">${i}</span> to <span class="highlight">${i - 1}</span>.`
    );
  }

  arr.splice(idx, 1);
  addStep(
    arr,
    {},
    {},
    'DONE',
    `Deleted ${removed}. Length: ${arr.length}.`,
    `✅ Deleted <span class="highlight">${removed}</span>. Shifted <span class="highlight">${arr.length - idx}</span> elements left. This is O(n) in the worst case (deleting from index 0).`
  );
}

// ---------- ACCESS ----------
function buildAccess(idx) {
  if (Number.isNaN(idx)) {
    explain('⚠️ Enter a valid index.');
    return;
  }
  if (idx < 0 || idx >= arr.length) {
    explain(`⚠️ Index <span class="highlight">${idx}</span> out of bounds [0, ${arr.length - 1}].`);
    return;
  }
  setComplexity('O(1)', 'O(1)', 'Access');

  addStep(
    arr,
    {},
    {},
    'INIT',
    `Accessing index ${idx}. Computing address...`,
    `Computing address: <span class="highlight">base + ${idx} × elementSize</span>. This is pure arithmetic — O(1).`
  );

  addStep(
    arr,
    { [idx]: 'found' },
    { i: idx },
    'FOUND',
    `arr[${idx}] = ${arr[idx]}.`,
    `✅ Found <span class="highlight">${arr[idx]}</span> at index <span class="highlight">${idx}</span>. Direct memory address computation — no iteration needed. This is the superpower of arrays.`
  );
}

// ---------- UPDATE ----------
function buildUpdate(idx, newVal) {
  if (Number.isNaN(idx) || Number.isNaN(newVal)) {
    explain('⚠️ Enter both an index and a new value.');
    return;
  }
  if (idx < 0 || idx >= arr.length) {
    explain(`⚠️ Index <span class="highlight">${idx}</span> out of bounds.`);
    return;
  }
  setComplexity('O(1)', 'O(1)', 'Update');

  const oldVal = arr[idx];
  addStep(
    arr,
    { [idx]: 'comparing' },
    { i: idx },
    'TARGET',
    `Updating arr[${idx}] from ${oldVal} to ${newVal}.`,
    `Targeting index <span class="highlight">${idx}</span>. Current value: <span class="highlight">${oldVal}</span>. Will overwrite with <span class="highlight">${newVal}</span>.`
  );

  arr[idx] = newVal;
  addStep(
    arr,
    { [idx]: 'found' },
    { i: idx },
    'DONE',
    `Updated arr[${idx}] = ${newVal} (was ${oldVal}).`,
    `✅ Updated index <span class="highlight">${idx}</span> to <span class="highlight">${newVal}</span>. Same O(1) address computation as access.`
  );
}

// ---------- LINEAR SEARCH ----------
function buildLinearSearch(target) {
  if (Number.isNaN(target)) {
    explain('⚠️ Enter a valid target value.');
    return;
  }
  setComplexity('O(n)', 'O(1)', 'Linear Search');

  addStep(
    arr,
    {},
    {},
    'INIT',
    `Searching for ${target}. Scanning left to right...`,
    `Linear search for <span class="highlight">${target}</span>. Will check every element from index 0 to ${arr.length - 1}.`
  );

  let found = false;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) {
      addStep(
        arr,
        { [i]: 'found' },
        { i },
        `CMP[${i}]`,
        `arr[${i}] = ${arr[i]} === ${target} ✓ FOUND!`,
        `🎯 Found <span class="highlight">${target}</span> at index <span class="highlight">${i}</span>! Checked <span class="highlight">${i + 1}</span> element(s).`
      );
      found = true;
      break;
    } else {
      addStep(
        arr,
        { [i]: 'comparing' },
        { i },
        `CMP[${i}]`,
        `arr[${i}] = ${arr[i]} ≠ ${target}. Continue.`,
        `Comparing arr[<span class="highlight">${i}</span>] = <span class="highlight">${arr[i]}</span> with target <span class="highlight">${target}</span>. Not a match — move to next.`
      );
    }
  }

  if (!found) {
    addStep(
      arr,
      {},
      {},
      'DONE',
      `${target} not found in array.`,
      `❌ <span class="highlight">${target}</span> not found after scanning all <span class="highlight">${arr.length}</span> elements. Worst case: O(n).`
    );
  }
}

// ---------- BINARY SEARCH ----------
function buildBinarySearch(target) {
  if (Number.isNaN(target)) {
    explain('⚠️ Enter a valid target value.');
    return;
  }
  // Sort array for binary search
  arr.sort((a, b) => a - b);
  setComplexity('O(log n)', 'O(1)', 'Binary Search');

  addStep(
    arr,
    {},
    {},
    'INIT',
    `Binary search for ${target}. Array must be sorted.`,
    `Binary search for <span class="highlight">${target}</span>. Array is sorted. We halve the search space each step → O(log n).`
  );

  let lo = 0;
  let hi = arr.length - 1;
  let iteration = 1;
  let found = false;

  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    const states = {};
    states[mid] = 'comparing';
    for (let i = lo; i <= hi; i++) {
      if (i !== mid) states[i] = states[i] || 'active';
    }

    if (arr[mid] === target) {
      states[mid] = 'found';
      addStep(
        arr,
        states,
        { lo, mid, hi },
        `ITER ${iteration}`,
        `mid=${mid}, arr[${mid}]=${arr[mid]} === ${target} ✓`,
        `🎯 Found! <span class="highlight">arr[${mid}] = ${arr[mid]}</span> matches target. Binary search completed in <span class="highlight">${iteration}</span> iteration(s). log₂(${arr.length}) ≈ ${Math.ceil(Math.log2(arr.length))}.`
      );
      found = true;
      break;
    } else if (arr[mid] < target) {
      addStep(
        arr,
        states,
        { lo, mid, hi },
        `ITER ${iteration}`,
        `mid=${mid}, arr[${mid}]=${arr[mid]} < ${target} → search right half.`,
        `<span class="highlight">arr[${mid}] = ${arr[mid]}</span> &lt; <span class="highlight">${target}</span>. Target must be in right half. Moving lo to <span class="highlight">${mid + 1}</span>.`
      );
      lo = mid + 1;
    } else {
      addStep(
        arr,
        states,
        { lo, mid, hi },
        `ITER ${iteration}`,
        `mid=${mid}, arr[${mid}]=${arr[mid]} > ${target} → search left half.`,
        `<span class="highlight">arr[${mid}] = ${arr[mid]}</span> &gt; <span class="highlight">${target}</span>. Target must be in left half. Moving hi to <span class="highlight">${mid - 1}</span>.`
      );
      hi = mid - 1;
    }
    iteration++;
  }

  if (!found) {
    addStep(
      arr,
      {},
      {},
      'DONE',
      `${target} not found. Search space exhausted.`,
      `❌ <span class="highlight">${target}</span> not found. lo (${lo}) crossed hi (${hi}). Took <span class="highlight">${iteration - 1}</span> iterations.`
    );
  }
}

// ---------- REVERSE ----------
function buildReverse() {
  if (arr.length <= 1) {
    explain('⚠️ Array has 0 or 1 elements — already reversed.');
    return;
  }
  setComplexity('O(n)', 'O(1)', 'Reverse (Two-Pointer)');

  addStep(
    arr,
    {},
    {},
    'INIT',
    'Reversing array using two-pointer technique.',
    `Two pointers: <span class="highlight">left = 0</span>, <span class="highlight">right = ${arr.length - 1}</span>. Swap and move inward until they meet. O(n) time, O(1) space.`
  );

  let left = 0;
  let right = arr.length - 1;
  let step = 1;
  while (left < right) {
    addStep(
      arr,
      { [left]: 'active', [right]: 'active' },
      { lo: left, hi: right },
      `SWAP ${step}`,
      `Swapping arr[${left}]=${arr[left]} ↔ arr[${right}]=${arr[right]}.`,
      `Swapping <span class="highlight">${arr[left]}</span> (index ${left}) with <span class="highlight">${arr[right]}</span> (index ${right}).`
    );

    [arr[left], arr[right]] = [arr[right], arr[left]];

    addStep(
      arr,
      { [left]: 'found', [right]: 'found' },
      { lo: left, hi: right },
      `SWAP ${step}`,
      `Swapped! arr[${left}]=${arr[left]}, arr[${right}]=${arr[right]}.`,
      `After swap: arr[${left}] = <span class="highlight">${arr[left]}</span>, arr[${right}] = <span class="highlight">${arr[right]}</span>. Moving pointers inward.`
    );

    left++;
    right--;
    step++;
  }

  const allSorted = {};
  arr.forEach((_, i) => {
    allSorted[i] = 'sorted';
  });
  addStep(
    arr,
    allSorted,
    {},
    'DONE',
    `Reverse complete. ${step - 1} swaps performed.`,
    `✅ Array reversed in-place with <span class="highlight">${step - 1}</span> swaps. Two-pointer technique — O(n/2) = O(n) time, O(1) space.`
  );
}

// ---------- FIND MIN/MAX ----------
function buildFindMinMax() {
  if (arr.length === 0) {
    explain('⚠️ Array is empty.');
    return;
  }
  setComplexity('O(n)', 'O(1)', 'Find Min/Max');

  let min = arr[0];
  let minIdx = 0;
  let max = arr[0];
  let maxIdx = 0;

  addStep(
    arr,
    { 0: 'active' },
    { i: 0 },
    'INIT',
    `Starting with arr[0]=${arr[0]} as both min and max.`,
    `Initialize min = max = <span class="highlight">${arr[0]}</span>. Will scan entire array.`
  );

  for (let i = 1; i < arr.length; i++) {
    if (arr[i] < min) {
      min = arr[i];
      minIdx = i;
    } else if (arr[i] > max) {
      max = arr[i];
      maxIdx = i;
    }

    addStep(
      arr,
      { [minIdx]: 'found', [maxIdx]: 'active', [i]: 'comparing' },
      { i },
      `CMP[${i}]`,
      `arr[${i}]=${arr[i]}`,
      `Checking <span class="highlight">${arr[i]}</span>. Current min: <span class="highlight">${min}</span> (idx ${minIdx}), max: <span class="highlight">${max}</span> (idx ${maxIdx}).`
    );
  }

  addStep(
    arr,
    { [minIdx]: 'found', [maxIdx]: 'active' },
    {},
    'DONE',
    `Min=${min} at [${minIdx}], Max=${max} at [${maxIdx}].`,
    `✅ Min = <span class="highlight">${min}</span> at index <span class="highlight">${minIdx}</span>, Max = <span class="highlight">${max}</span> at index <span class="highlight">${maxIdx}</span>. Single pass — O(n).`
  );
}

/* ============================================================
   EXECUTION ENGINE
   ============================================================ */

export function execute() {
  if (isBusy) return;
  resetUI();
  buildSteps();
  if (steps.length === 0) return;
  isBusy = true;
  setStatus('Executing...', true);
  autoPlayAll();
}

function autoPlayAll() {
  stopAutoPlay();
  isPlaying = true;
  document.getElementById('autoBtn').textContent = '⏸ Pause';
  runNextStep();
}

function runNextStep() {
  if (stepIndex >= steps.length) {
    finishExecution();
    return;
  }
  applyStep(steps[stepIndex]);
  stepIndex++;
  autoInterval = setTimeout(runNextStep, animSpeed);
}

export function stepThrough() {
  if (steps.length === 0 || stepIndex >= steps.length) {
    // Build new steps if not already built
    if (steps.length === 0) {
      buildSteps();
      if (steps.length === 0) return;
      isBusy = true;
      setStatus('Stepping...', true);
    } else {
      finishExecution();
      return;
    }
  }
  stopAutoPlay();
  applyStep(steps[stepIndex]);
  stepIndex++;
  if (stepIndex >= steps.length) {
    setTimeout(finishExecution, 300);
  }
}

export function toggleAutoPlay() {
  if (isPlaying) {
    stopAutoPlay();
  } else {
    if (steps.length === 0) {
      buildSteps();
      if (steps.length === 0) return;
      isBusy = true;
      setStatus('Auto-playing...', true);
    }
    autoPlayAll();
  }
}

function stopAutoPlay() {
  isPlaying = false;
  if (autoInterval) clearTimeout(autoInterval);
  autoInterval = null;
  const autoBtn = document.getElementById('autoBtn');
  if (autoBtn) autoBtn.textContent = '⏯ Auto';
}

function applyStep(step) {
  arr = [...step.arr];
  renderArray(step.cellStates, step.pointers);
  addLog(step.logStep, step.logText);
  explain(step.explanationHTML);
}

function finishExecution() {
  stopAutoPlay();
  isBusy = false;
  setStatus('Complete', false);
  renderArray();
}

export function resetViz() {
  resetUI();
  renderArray();
}
