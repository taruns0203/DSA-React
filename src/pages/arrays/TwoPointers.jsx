import { useCallback, useEffect, useState } from 'react';
import './TwoPointers.css';

const defaultInputs = {
  twosum: { arr: '1, 3, 5, 7, 11, 15', target: '16' },
  palindrome: { str: 'racecar' },
  removeDups: { arr: '1, 1, 2, 2, 3, 4, 4, 5' },
};

const algoConfig = {
  twosum: {
    time: 'O(n)',
    space: 'O(1)',
    approach: 'Converging',
  },
  palindrome: {
    time: 'O(n)',
    space: 'O(1)',
    approach: 'Converging',
  },
  removeDups: {
    time: 'O(n)',
    space: 'O(1)',
    approach: 'Fast & Slow',
  },
};

const initialExplain =
  'Select an algorithm, enter your input, and click <b>Start</b> to begin the visualization.';

function parseNumberArray(raw) {
  return raw
    .split(',')
    .map((value) => parseInt(value.trim(), 10))
    .filter((value) => !Number.isNaN(value));
}

function generateTwoSumSteps(arr, target) {
  const steps = [];
  let left = 0;
  let right = arr.length - 1;
  const visited = new Set();

  steps.push({
    arr: [...arr],
    left,
    right,
    matched: new Set(),
    visited: new Set(),
    text: `Array is sorted. Place <strong>L</strong> at index 0 (value ${arr[0]}) and <em>R</em> at index ${right} (value ${arr[right]}). Target = ${target}.`,
    sum: null,
    done: false,
  });

  while (left < right) {
    const sum = arr[left] + arr[right];
    const vis = new Set(visited);

    if (sum === target) {
      steps.push({
        arr: [...arr],
        left,
        right,
        matched: new Set([left, right]),
        visited: vis,
        text: `🎉 <strong>${arr[left]}</strong> + <em>${arr[right]}</em> = ${sum} which equals target ${target}. <b>Match found!</b>`,
        sum: `<span class="val">${arr[left]}</span> <span class="op">+</span> <span class="res">${arr[right]}</span> <span class="op">=</span> <span class="eq">${sum} ✓</span>`,
        done: true,
      });
      return steps;
    }

    if (sum < target) {
      steps.push({
        arr: [...arr],
        left,
        right,
        matched: new Set(),
        visited: vis,
        text: `<strong>${arr[left]}</strong> + <em>${arr[right]}</em> = ${sum}, which is <b>less than</b> ${target}. Move <strong>L →</strong> right to increase the sum.`,
        sum: `<span class="val">${arr[left]}</span> <span class="op">+</span> <span class="res">${arr[right]}</span> <span class="op">=</span> ${sum} <span class="op">&lt; ${target}</span>`,
        done: false,
      });
      visited.add(left);
      left += 1;
    } else {
      steps.push({
        arr: [...arr],
        left,
        right,
        matched: new Set(),
        visited: vis,
        text: `<strong>${arr[left]}</strong> + <em>${arr[right]}</em> = ${sum}, which is <b>greater than</b> ${target}. Move <em>← R</em> left to decrease the sum.`,
        sum: `<span class="val">${arr[left]}</span> <span class="op">+</span> <span class="res">${arr[right]}</span> <span class="op">=</span> ${sum} <span class="op">&gt; ${target}</span>`,
        done: false,
      });
      visited.add(right);
      right -= 1;
    }
  }

  steps.push({
    arr: [...arr],
    left: null,
    right: null,
    matched: new Set(),
    visited: new Set(visited),
    text: `Pointers have crossed. <b>No pair found</b> that sums to ${target}.`,
    sum: 'No valid pair',
    done: true,
  });

  return steps;
}

function generatePalindromeSteps(str) {
  const arr = str.split('');
  const steps = [];
  let left = 0;
  let right = arr.length - 1;
  const visited = new Set();
  const matched = new Set();

  steps.push({
    arr: [...arr],
    left,
    right,
    matched: new Set(),
    visited: new Set(),
    text: `Check if "<b>${str}</b>" is a palindrome. Place <strong>L</strong> at index 0 and <em>R</em> at index ${right}.`,
    sum: null,
    done: false,
  });

  while (left < right) {
    if (arr[left] === arr[right]) {
      matched.add(left);
      matched.add(right);
      steps.push({
        arr: [...arr],
        left,
        right,
        matched: new Set(matched),
        visited: new Set(visited),
        text: `<strong>'${arr[left]}'</strong> === <em>'${arr[right]}'</em> — characters match! ✓ Move both pointers inward.`,
        sum: `<span class="val">${arr[left]}</span> <span class="eq">===</span> <span class="res">${arr[right]}</span> <span class="eq">✓</span>`,
        done: false,
      });
      visited.add(left);
      visited.add(right);
      left += 1;
      right -= 1;
    } else {
      steps.push({
        arr: [...arr],
        left,
        right,
        matched: new Set(),
        visited: new Set(visited),
        text: `<strong>'${arr[left]}'</strong> ≠ <em>'${arr[right]}'</em> — mismatch! ✗ <b>Not a palindrome.</b>`,
        sum: `<span class="val">${arr[left]}</span> <span class="op">≠</span> <span class="res">${arr[right]}</span> <span class="op">✗</span>`,
        done: true,
      });
      return steps;
    }
  }

  if (left === right) {
    matched.add(left);
  }

  steps.push({
    arr: [...arr],
    left: null,
    right: null,
    matched: new Set(matched),
    visited: new Set(visited),
    text: `All characters matched. 🎉 <b>"${str}" is a palindrome!</b>`,
    sum: '<span class="eq">✓ Palindrome</span>',
    done: true,
  });

  return steps;
}

function generateRemoveDupsSteps(arr) {
  const steps = [];
  if (arr.length === 0) {
    steps.push({
      arr: [],
      left: null,
      right: null,
      matched: new Set(),
      visited: new Set(),
      text: 'Empty array — nothing to process.',
      sum: null,
      done: true,
    });
    return steps;
  }

  let slow = 0;
  let fast = 1;
  const result = [...arr];
  const kept = new Set([0]);

  steps.push({
    arr: [...result],
    left: slow,
    right: fast < result.length ? fast : null,
    matched: new Set(kept),
    visited: new Set(),
    text: '<strong>Slow</strong> pointer at index 0. <em>Fast</em> pointer starts scanning from index 1. Slow marks the write position for unique elements.',
    sum: null,
    done: false,
  });

  while (fast < result.length) {
    if (result[fast] !== result[slow]) {
      slow += 1;
      result[slow] = arr[fast];
      kept.add(slow);
      steps.push({
        arr: [...result],
        left: slow,
        right: fast,
        matched: new Set(kept),
        visited: new Set(),
        text: `arr[<em>${fast}</em>] = ${arr[fast]} ≠ arr[<strong>${slow - 1}</strong>] = ${result[slow - 1] !== undefined ? arr[slow - 1] : arr[slow]}. New unique value! Write ${arr[fast]} at position <strong>${slow}</strong>. Move both pointers.`,
        sum: `<span class="val">${arr[fast]}</span> <span class="op">→ written at index</span> <span class="eq">${slow}</span>`,
        done: false,
      });
    } else {
      steps.push({
        arr: [...result],
        left: slow,
        right: fast,
        matched: new Set(kept),
        visited: new Set(),
        text: `arr[<em>${fast}</em>] = ${arr[fast]} === arr[<strong>${slow}</strong>] = ${result[slow]}. Duplicate — skip. Move <em>Fast →</em> only.`,
        sum: `<span class="val">${arr[fast]}</span> <span class="op">=== duplicate, skip</span>`,
        done: false,
      });
    }
    fast += 1;
  }

  steps.push({
    arr: [...result],
    left: slow,
    right: null,
    matched: new Set(kept),
    visited: new Set(),
    text: `🎉 Done! <b>${slow + 1} unique elements</b> in first ${slow + 1} positions: [${[...kept]
      .map((i) => result[i])
      .join(', ')}].`,
    sum: `<span class="eq">Unique count: ${slow + 1}</span>`,
    done: true,
  });

  return steps;
}

function parseInputs(algo, inputs) {
  if (algo === 'twosum') {
    const arr = parseNumberArray(inputs.arr);
    if (arr.length === 0) return null;
    const targetValue = parseInt(inputs.target, 10);
    const target = Number.isNaN(targetValue) ? 0 : targetValue;
    return { arr, target };
  }

  if (algo === 'palindrome') {
    const str = (inputs.str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!str) return null;
    return { arr: str.split(''), str };
  }

  if (algo === 'removeDups') {
    const arr = parseNumberArray(inputs.arr);
    if (arr.length === 0) return null;
    return { arr };
  }

  return null;
}

export default function TwoPointers() {
  const [algo, setAlgo] = useState('twosum');
  const [inputs, setInputs] = useState(defaultInputs);
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isRunning, setIsRunning] = useState(false);
  const [isAuto, setIsAuto] = useState(false);

  const activeConfig = algoConfig[algo];
  const activeInputs = inputs[algo];
  const activeStep = currentStep >= 0 ? steps[currentStep] : null;
  const hasSteps = steps.length > 0;

  const setInputValue = (field, value) => {
    setInputs((prev) => ({
      ...prev,
      [algo]: {
        ...prev[algo],
        [field]: value,
      },
    }));
  };

  const resetAll = useCallback(() => {
    setSteps([]);
    setCurrentStep(-1);
    setIsRunning(false);
    setIsAuto(false);
  }, []);

  useEffect(() => {
    resetAll();
  }, [algo, resetAll]);

  useEffect(() => {
    if (!isAuto || !isRunning || !hasSteps) return undefined;

    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) {
          setIsAuto(false);
          return prev;
        }
        return prev + 1;
      });
    }, 900);

    return () => clearInterval(timer);
  }, [hasSteps, isAuto, isRunning, steps.length]);

  const startVisualization = useCallback(() => {
    const parsed = parseInputs(algo, activeInputs);
    if (!parsed || !parsed.arr || parsed.arr.length === 0) return false;

    let generated = [];
    if (algo === 'twosum') {
      generated = generateTwoSumSteps(parsed.arr, parsed.target);
    } else if (algo === 'palindrome') {
      generated = generatePalindromeSteps(parsed.str);
    } else if (algo === 'removeDups') {
      generated = generateRemoveDupsSteps(parsed.arr);
    }

    if (!generated.length) return false;
    setSteps(generated);
    setCurrentStep(0);
    setIsRunning(true);
    setIsAuto(false);
    return true;
  }, [activeInputs, algo]);

  const handleStart = () => {
    startVisualization();
  };

  const handleStep = () => {
    if (!hasSteps) {
      const started = startVisualization();
      if (!started) return;
      return;
    }

    setIsRunning(true);
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleReset = () => {
    resetAll();
  };

  const handleAuto = () => {
    if (!hasSteps) {
      const started = startVisualization();
      if (!started) return;
      setIsAuto(true);
      return;
    }
    setIsAuto((prev) => !prev);
    setIsRunning(true);
  };

  const startDisabled = isRunning;
  const stepDisabled = !hasSteps || currentStep >= steps.length - 1 || activeStep?.done;
  const autoDisabled = !hasSteps || !isRunning;

  const handleInputKeyDown = (event) => {
    if (event.key === 'Enter' && !startDisabled) {
      handleStart();
    }
  };

  const stepCounterContent = (() => {
    if (!isRunning || !hasSteps || currentStep < 0) {
      return (
        <>
          Press <span>Start</span> to begin
        </>
      );
    }
    const total = steps.length;
    const cur = Math.min(currentStep + 1, total);
    const done = activeStep?.done;
    return (
      <>
        Step <span>{cur} / {total}</span>{done ? ' — Complete' : ''}
      </>
    );
  })();

  return (
    <div className="two-pointers">
      <div className="app">
        <header className="hero">
          <div className="hero__badge">DSA Pattern Visualizer</div>
          <h1><span>Two Pointers</span> Technique</h1>
          <p>
            Watch how two coordinated pointers traverse an array to solve problems in O(n) instead of O(n^2). Fully
            interactive, step-by-step.
          </p>
        </header>

        <div className="card" style={{ animationDelay: '.04s' }}>
          <div className="card__title">Choose Algorithm</div>
          <div className="algo-tabs" id="algoTabs">
            <button
              type="button"
              className={`algo-tab ${algo === 'twosum' ? 'active' : ''}`}
              data-algo="twosum"
              onClick={() => setAlgo('twosum')}
            >
              Two Sum (Sorted)
            </button>
            <button
              type="button"
              className={`algo-tab ${algo === 'palindrome' ? 'active' : ''}`}
              data-algo="palindrome"
              onClick={() => setAlgo('palindrome')}
            >
              Valid Palindrome
            </button>
            <button
              type="button"
              className={`algo-tab ${algo === 'removeDups' ? 'active' : ''}`}
              data-algo="removeDups"
              onClick={() => setAlgo('removeDups')}
            >
              Remove Duplicates
            </button>
          </div>

          <div className="input-row" id="inputArea" onKeyDown={handleInputKeyDown}>
            {algo === 'twosum' && (
              <>
                <div className="field">
                  <label>Sorted Array (comma-separated)</label>
                  <input
                    id="inArr"
                    value={activeInputs.arr}
                    onChange={(event) => setInputValue('arr', event.target.value)}
                    placeholder="e.g. 1,3,5,7,11,15"
                  />
                </div>
                <div className="field">
                  <label>Target Sum</label>
                  <input
                    id="inTarget"
                    value={activeInputs.target}
                    onChange={(event) => setInputValue('target', event.target.value)}
                    placeholder="e.g. 16"
                  />
                </div>
              </>
            )}
            {algo === 'palindrome' && (
              <div className="field">
                <label>String to Check</label>
                <input
                  id="inStr"
                  value={activeInputs.str}
                  onChange={(event) => setInputValue('str', event.target.value)}
                  placeholder="e.g. racecar"
                />
              </div>
            )}
            {algo === 'removeDups' && (
              <div className="field">
                <label>Sorted Array (comma-separated)</label>
                <input
                  id="inArr"
                  value={activeInputs.arr}
                  onChange={(event) => setInputValue('arr', event.target.value)}
                  placeholder="e.g. 1,1,2,2,3,4,4,5"
                />
              </div>
            )}
          </div>

          <div className="btn-group" style={{ marginTop: 14 }}>
            <button type="button" className="btn btn--primary" id="btnStart" onClick={handleStart} disabled={startDisabled}>
              ▶  Start
            </button>
            <button type="button" className="btn btn--step" id="btnStep" onClick={handleStep} disabled={stepDisabled}>
              Next Step →
            </button>
            <button type="button" className="btn btn--secondary" id="btnReset" onClick={handleReset}>
              ↺  Reset
            </button>
            <button
              type="button"
              className="btn btn--secondary"
              id="btnAutoPlay"
              onClick={handleAuto}
              disabled={autoDisabled}
            >
              {isAuto ? '⏸ Pause' : '⏩ Auto-Play'}
            </button>
          </div>
        </div>

        <div className="card" id="vizCard" style={{ animationDelay: '.12s' }}>
          <div className="card__title">Visualization</div>

          <div className="step-counter" id="stepCounter">
            {stepCounterContent}
          </div>

          <div className="array-stage" id="arrayStage">
            <div className="index-row" id="indexRow">
              {activeStep?.arr?.map((_, idx) => (
                <div key={`idx-${idx}`} className="index-cell">
                  {idx}
                </div>
              ))}
            </div>
            <div className="array-row" id="arrayRow">
              {activeStep?.arr?.map((value, idx) => {
                const isLeft = activeStep.left === idx;
                const isRight = activeStep.right === idx;
                const isMatched = activeStep.matched?.has(idx);
                const isVisited = activeStep.visited?.has(idx);

                let className = 'cell';
                if (isMatched) className += ' matched';
                else if (isLeft && isRight) className += ' both-ptr';
                else if (isLeft) className += ' left-ptr';
                else if (isRight) className += ' right-ptr';
                else if (isVisited) className += ' visited';

                return (
                  <div key={`val-${idx}`} className={className}>
                    {value}
                  </div>
                );
              })}
            </div>
            <div className="pointer-row" id="pointerRow">
              {activeStep?.arr?.map((_, idx) => {
                const isLeft = activeStep.left === idx;
                const isRight = activeStep.right === idx;
                const isRemoveDups = algo === 'removeDups';
                const leftLabel = isRemoveDups ? 'S' : 'L';
                const rightLabel = isRemoveDups ? 'F' : 'R';

                if (isLeft && isRight) {
                  return (
                    <span key={`ptr-${idx}`} className="ptr-label L">
                      {leftLabel}/{rightLabel}
                    </span>
                  );
                }
                if (isLeft) {
                  return (
                    <span key={`ptr-${idx}`} className="ptr-label L">
                      ▲ {leftLabel}
                    </span>
                  );
                }
                if (isRight) {
                  return (
                    <span key={`ptr-${idx}`} className="ptr-label R">
                      ▲ {rightLabel}
                    </span>
                  );
                }
                return <span key={`ptr-${idx}`} className="ptr-label" />;
              })}
            </div>
          </div>

          <div className="sum-display" id="sumDisplay" dangerouslySetInnerHTML={{ __html: activeStep?.sum || '' }} />

          <div className="explain" id="explainPanel">
            <div className="explain__icon">💡</div>
            <div
              className="explain__text"
              id="explainText"
              dangerouslySetInnerHTML={{ __html: activeStep?.text || initialExplain }}
            />
          </div>
        </div>

        <div className="card" style={{ animationDelay: '.2s' }}>
          <div className="card__title">Complexity Analysis</div>
          <div className="complexity-row" id="complexityRow">
            <div className="complexity-badge">
              <div className="complexity-badge__label">Time</div>
              <div className="complexity-badge__value" id="timeBadge">
                {activeConfig.time}
              </div>
            </div>
            <div className="complexity-badge">
              <div className="complexity-badge__label">Space</div>
              <div className="complexity-badge__value" id="spaceBadge">
                {activeConfig.space}
              </div>
            </div>
            <div className="complexity-badge">
              <div className="complexity-badge__label">Approach</div>
              <div className="complexity-badge__value" id="approachBadge" style={{ fontSize: '.85rem' }}>
                {activeConfig.approach}
              </div>
            </div>
          </div>
        </div>

        <div className="card" style={{ animationDelay: '.28s' }}>
          <div className="card__title">Legend</div>
          <div className="legend">
            <div className="legend-item">
              <div className="legend-swatch sw-left" />Left Pointer (L)
            </div>
            <div className="legend-item">
              <div className="legend-swatch sw-right" />Right Pointer (R)
            </div>
            <div className="legend-item">
              <div className="legend-swatch sw-match" />Match Found
            </div>
            <div className="legend-item">
              <div className="legend-swatch sw-visited" />Visited / Processed
            </div>
            <div className="legend-item">
              <div className="legend-swatch sw-default" />Unvisited
            </div>
          </div>
        </div>

        <div className="footer">Two Pointers Visualizer — FAANG Interview Prep</div>
      </div>
    </div>
  );
}
