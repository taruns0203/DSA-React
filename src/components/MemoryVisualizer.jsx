import { useEffect, useRef, useState } from 'react';
import styles from './MemoryVisualizer.module.css';

export default function MemoryVisualizer({ cells }) {
  const rowRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [cellWidth, setCellWidth] = useState(64);

  useEffect(() => {
    const updateWidth = () => {
      if (!rowRef.current) return;
      const firstCell = rowRef.current.querySelector('[data-cell]');
      if (firstCell) {
        setCellWidth(firstCell.getBoundingClientRect().width || 64);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % cells.length);
    }, 1200);
    return () => clearInterval(interval);
  }, [cells.length]);

  const pointerOffset = activeIndex * cellWidth + cellWidth / 2 - 6;
  const trackWidth = cellWidth * cells.length;

  return (
    <div className={styles.visual}>
      <div className={styles.label}>Contiguous Memory Block</div>
      <div className={styles.row} ref={rowRef}>
        {cells.map((cell, idx) => (
          <div
            key={cell.idx}
            className={`${styles.cell} ${idx === activeIndex ? styles.active : ''}`}
            data-cell
          >
            <span className={styles.addr}>{cell.addr}</span>
            <span className={styles.val}>{cell.val}</span>
            <span className={styles.idx}>[{cell.idx}]</span>
          </div>
        ))}
      </div>
      <div className={styles.pointerTrack} style={{ width: `${trackWidth}px` }}>
        <div className={styles.pointer} style={{ left: `${pointerOffset}px` }}>
          <div className={styles.pointerArrow} />
          <div className={styles.pointerLabel}>ptr</div>
        </div>
      </div>
      <div className={styles.complexityStrip}>
        <div className={styles.complexityChip}>
          <span className={styles.op}>Access</span>
          <span className={`${styles.bigO} ${styles.good}`}>O(1)</span>
        </div>
        <div className={styles.complexityChip}>
          <span className={styles.op}>Search</span>
          <span className={`${styles.bigO} ${styles.mid}`}>O(n)</span>
        </div>
        <div className={styles.complexityChip}>
          <span className={styles.op}>Insert</span>
          <span className={`${styles.bigO} ${styles.bad}`}>O(n)</span>
        </div>
        <div className={styles.complexityChip}>
          <span className={styles.op}>Delete</span>
          <span className={`${styles.bigO} ${styles.bad}`}>O(n)</span>
        </div>
      </div>
    </div>
  );
}
