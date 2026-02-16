import MemoryVisualizer from './MemoryVisualizer.jsx';
import styles from './ArrayHero.module.css';

const memoryCells = [
  { idx: 0, addr: '0x04', val: 12 },
  { idx: 1, addr: '0x08', val: 5 },
  { idx: 2, addr: '0x0C', val: 23 },
  { idx: 3, addr: '0x10', val: 8 },
  { idx: 4, addr: '0x14', val: 41 },
  { idx: 5, addr: '0x18', val: 17 },
  { idx: 6, addr: '0x1C', val: 33 },
];

export default function ArrayHero() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroGradient} />
      <div className={`${styles.heroOrb} ${styles.orb1}`} />
      <div className={`${styles.heroOrb} ${styles.orb2}`} />
      <div className={`${styles.heroOrb} ${styles.orb3}`} />

      <div className={styles.content}>
        <div className={styles.text}>
          <div className={styles.breadcrumb}>
            <span>DSA</span>
            <span className={styles.sep}>›</span>
            <span>Data Structures</span>
            <span className={styles.sep}>›</span>
            <span className={styles.current}>Array</span>
          </div>

          <h1 className={styles.title}>
            Array<br />
            <span className={styles.thin}>Fundamentals</span>
          </h1>

          <p className={styles.desc}>
            The most primitive and essential data structure — a fixed-size, contiguous block
            of memory providing O(1) random access. Arrays are the backbone of nearly every
            algorithm and the foundation upon which all other structures are built.
          </p>

          <a className={styles.cta} href="/arrays/array-visualizer">
            Open Visualizer
            <span className={styles.arrow}>→</span>
          </a>
        </div>

        <MemoryVisualizer cells={memoryCells} />
      </div>
    </section>
  );
}
