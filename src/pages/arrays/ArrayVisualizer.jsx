import { useEffect } from 'react';
import './ArrayVisualizer.css';
import {
  initArrayVisualizer,
  cleanupArrayVisualizer,
  onOperationChange,
  execute,
  stepThrough,
  toggleAutoPlay,
  resetViz,
  initFromInput,
  generateRandom,
  generateSorted,
  clearArray,
  updateSpeed,
  switchEduTab,
} from './arrayVisualizerEngine.js';

export default function ArrayVisualizer() {
  useEffect(() => {
    initArrayVisualizer();
    return () => cleanupArrayVisualizer();
  }, []);

  return (
    <div className="array-visualizer">
      <header className="header">
        <div className="header-content">
          <h1>
            <span className="icon">⟦⟧</span>
            Array Visualizer
          </h1>
          <div className="header-badges">
            <span className="badge">O(1) Access</span>
            <span className="badge">Contiguous Memory</span>
            <span className="badge">FAANG Ready</span>
          </div>
        </div>
      </header>

      <div className="main">
        <div className="left-panel">
          <div className="card">
            <div className="card-title">
              <span className="dot" />
              Operation
            </div>
            <div className="card-body">
              <div className="control-group">
                <label className="control-label">Select Operation</label>
                <select id="operationSelect" onChange={onOperationChange}>
                  <option value="insert_end">Push (Insert at End)</option>
                  <option value="insert_at">Insert at Index</option>
                  <option value="delete_end">Pop (Delete from End)</option>
                  <option value="delete_at">Delete at Index</option>
                  <option value="access">Access by Index</option>
                  <option value="update">Update at Index</option>
                  <option value="linear_search">Linear Search</option>
                  <option value="binary_search">Binary Search (sorted)</option>
                  <option value="reverse">Reverse Array</option>
                  <option value="find_min_max">Find Min / Max</option>
                </select>
              </div>

              <div className="control-group" id="inputGroup">
                <label className="control-label" id="inputLabel">
                  Value
                </label>
                <div className="input-row">
                  <input type="number" id="inputValue" placeholder="Value" />
                  <input type="number" id="inputIndex" placeholder="Index" style={{ display: 'none' }} />
                </div>
              </div>

              <div className="btn-group">
                <button className="btn btn-primary btn-full" id="executeBtn" type="button" onClick={execute}>
                  ▶ Execute
                </button>
              </div>
              <div className="btn-group" style={{ marginTop: '8px' }}>
                <button
                  className="btn btn-secondary"
                  id="stepBtn"
                  type="button"
                  onClick={stepThrough}
                  title="Step through one step at a time"
                >
                  ⏭ Step
                </button>
                <button className="btn btn-success" id="autoBtn" type="button" onClick={toggleAutoPlay}>
                  ⏯ Auto
                </button>
                <button className="btn btn-danger" type="button" onClick={resetViz}>
                  ↺ Reset
                </button>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-title">
              <span className="dot" />
              Array Setup
            </div>
            <div className="card-body">
              <div className="control-group">
                <label className="control-label">Initialize Array (comma-separated)</label>
                <input type="text" id="initInput" placeholder="e.g. 5, 12, 3, 8, 21, 7" />
              </div>
              <div className="btn-group">
                <button className="btn btn-secondary" type="button" onClick={initFromInput}>
                  Load
                </button>
                <button className="btn btn-secondary" type="button" onClick={generateRandom}>
                  🎲 Random
                </button>
                <button className="btn btn-secondary" type="button" onClick={generateSorted}>
                  📈 Sorted
                </button>
                <button className="btn btn-danger" type="button" onClick={clearArray}>
                  Clear
                </button>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-title">
              <span className="dot" />
              Animation Speed
            </div>
            <div className="card-body">
              <div className="speed-control">
                <span style={{ fontSize: '0.82rem' }}>🐢</span>
                <input type="range" id="speedSlider" min="1" max="10" defaultValue="5" onInput={updateSpeed} />
                <span style={{ fontSize: '0.82rem' }}>🐇</span>
                <span className="speed-label" id="speedLabel">
                  5x
                </span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-title">
              <span className="dot" />
              Color Legend
            </div>
            <div className="legend">
              <div className="legend-item">
                <div className="legend-dot l-default" />
                Default
              </div>
              <div className="legend-item">
                <div className="legend-dot l-active" />
                Active / Current
              </div>
              <div className="legend-item">
                <div className="legend-dot l-comparing" />
                Comparing
              </div>
              <div className="legend-item">
                <div className="legend-dot l-found" />
                Found / Inserted
              </div>
              <div className="legend-item">
                <div className="legend-dot l-shifting" />
                Shifting
              </div>
              <div className="legend-item">
                <div className="legend-dot l-removed" />
                Removed
              </div>
            </div>
          </div>
        </div>

        <div className="right-panel">
          <div className="card" style={{ flexShrink: 0 }}>
            <div className="card-title">
              <span className="dot" />
              Visualization
            </div>
            <div className="viz-area" id="vizArea">
              <div className="array-container" id="arrayContainer" />
            </div>
            <div style={{ padding: '0 20px' }}>
              <div className="mem-info">
                <span>
                  Memory Layout (capacity: <strong id="capDisplay">16</strong>)
                </span>
                <span>
                  Length: <strong id="lenDisplay">0</strong>
                </span>
              </div>
              <div className="memory-bar" id="memoryBar" />
            </div>
            <div className="complexity-display">
              <div className="complexity-chip">
                <span className="label">Time:</span>
                <span className="value time" id="timeComplexity">
                  O(1)
                </span>
              </div>
              <div className="complexity-chip">
                <span className="label">Space:</span>
                <span className="value space" id="spaceComplexity">
                  O(1)
                </span>
              </div>
              <div className="complexity-chip">
                <span className="label">Operation:</span>
                <span className="value time" id="opName" style={{ background: '#FFF0F0', color: '#E84393' }}>
                  —
                </span>
              </div>
            </div>
            <div className="status-bar">
              <div className="status-dot" id="statusDot" />
              <span className="status-text" id="statusText">
                Ready
              </span>
            </div>
          </div>

          <div className="card">
            <div className="card-title">
              <span className="dot" />
              Step Explanation
            </div>
            <div className="card-body">
              <div className="explanation-text" id="explanationText">
                Select an operation and click <strong>Execute</strong> or <strong>Step</strong> to begin. The visualizer
                will animate each step and explain what's happening internally.
              </div>
            </div>
            <div className="log-panel" id="logPanel" />
          </div>

          <div className="card">
            <div className="edu-tabs" id="eduTabs">
              <button
                className="edu-tab active"
                type="button"
                data-tab="intuition"
                onClick={() => switchEduTab('intuition')}
              >
                Intuition
              </button>
              <button
                className="edu-tab"
                type="button"
                data-tab="operations"
                onClick={() => switchEduTab('operations')}
              >
                Operations
              </button>
              <button
                className="edu-tab"
                type="button"
                data-tab="complexity"
                onClick={() => switchEduTab('complexity')}
              >
                Complexity
              </button>
              <button className="edu-tab" type="button" data-tab="edge" onClick={() => switchEduTab('edge')}>
                Edge Cases
              </button>
            </div>
            <div className="edu-content active" id="edu-intuition">
              <h4>What is an Array?</h4>
              A contiguous block of memory storing elements of the same type sequentially. The key power is{' '}
              <strong>O(1) random access</strong> — given an index, you can instantly compute the memory address:{' '}
              <code>base + index × size</code>.
              <h4>Why use Arrays?</h4>
              Arrays are the most cache-friendly data structure because elements sit next to each other in memory. This
              makes traversal blazingly fast on modern hardware. They are the building block of stacks, heaps, hash tables,
              and more.
              <h4>Real-World Analogy</h4>
              Numbered lockers in a hallway — go directly to any locker by number without checking others. All lockers are
              the same size, and the row has a fixed length.
            </div>
            <div className="edu-content" id="edu-operations">
              <h4>Core Operations</h4>
              <strong>Access / Update:</strong> O(1) — address arithmetic. The fundamental advantage of arrays.
              <br />
              <strong>Push (end):</strong> Amortized O(1) — append at length index. When capacity is full, the dynamic array
              doubles its size and copies all elements (O(n) worst case).
              <br />
              <strong>Insert at index:</strong> O(n) — must shift all elements after the index one position right to make room.
              <br />
              <strong>Delete at index:</strong> O(n) — must shift all elements after the deleted index one position left.
              <br />
              <strong>Search:</strong> O(n) linear for unsorted, O(log n) binary search for sorted arrays.
              <br />
              <strong>Reverse:</strong> O(n) — two-pointer swap from both ends.
            </div>
            <div className="edu-content" id="edu-complexity">
              <table className="edu-table">
                <thead>
                  <tr>
                    <th>Operation</th>
                    <th>Best</th>
                    <th>Average</th>
                    <th>Worst</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Access</td>
                    <td>O(1)</td>
                    <td>O(1)</td>
                    <td>O(1)</td>
                  </tr>
                  <tr>
                    <td>Search</td>
                    <td>O(1)</td>
                    <td>O(n)</td>
                    <td>O(n)</td>
                  </tr>
                  <tr>
                    <td>Binary Search</td>
                    <td>O(1)</td>
                    <td>O(log n)</td>
                    <td>O(log n)</td>
                  </tr>
                  <tr>
                    <td>Push</td>
                    <td>O(1)</td>
                    <td>O(1)*</td>
                    <td>O(n)†</td>
                  </tr>
                  <tr>
                    <td>Insert</td>
                    <td>O(1)</td>
                    <td>O(n)</td>
                    <td>O(n)</td>
                  </tr>
                  <tr>
                    <td>Delete</td>
                    <td>O(1)</td>
                    <td>O(n)</td>
                    <td>O(n)</td>
                  </tr>
                  <tr>
                    <td>Reverse</td>
                    <td>O(n)</td>
                    <td>O(n)</td>
                    <td>O(n)</td>
                  </tr>
                </tbody>
              </table>
              <p style={{ fontSize: '0.75rem', color: 'var(--text3)', marginTop: '6px' }}>
                * Amortized &nbsp; † When resize is triggered
              </p>
            </div>
            <div className="edu-content" id="edu-edge">
              <div className="edge-case">
                ⚠️ <strong>Empty Array:</strong> Accessing, deleting, or popping from an empty array. Always check{' '}
                <code>length === 0</code> first.
              </div>
              <div className="edge-case">
                ⚠️ <strong>Out of Bounds:</strong> Index &lt; 0 or index ≥ length. The #1 source of runtime errors.
              </div>
              <div className="edge-case">
                ⚠️ <strong>Single Element:</strong> Reverse, search, and min/max on a 1-element array. Ensure loops handle
                this.
              </div>
              <div className="edge-case">
                ⚠️ <strong>Duplicates:</strong> Search may return first occurrence only. Binary search needs variants for
                first/last.
              </div>
              <div className="edge-case">
                ⚠️ <strong>Integer Overflow:</strong> <code>(lo + hi) / 2</code> can overflow. Use{' '}
                <code>lo + (hi - lo) / 2</code>.
              </div>
              <div className="edge-case">
                ⚠️ <strong>Unsorted Binary Search:</strong> Applying binary search on unsorted data gives wrong results.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
