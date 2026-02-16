import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle.jsx';
import styles from './ArrayTopBar.module.css';

export default function ArrayTopBar() {
  return (
    <nav className={styles.topbar}>
      <Link className={styles.brand} to="/">
        <span className={styles.logo}>DS</span>
        <span>DSA Visualizer</span>
        <span className={styles.sep}>/</span>
        <span className={styles.topic}>Array</span>
      </Link>
      <div className={styles.actions}>
        <Link className={styles.backBtn} to="/">
          ← Dashboard
        </Link>
        <ThemeToggle className={styles.toggle} />
      </div>
    </nav>
  );
}
