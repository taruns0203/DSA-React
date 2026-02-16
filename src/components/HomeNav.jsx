import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle.jsx';
import styles from './HomeNav.module.css';

export default function HomeNav() {
  return (
    <nav className={styles.nav}>
      <Link className={styles.brand} to="/">
        <span className={styles.logo}>DS</span>
        <span>
          DSA Visualizer <span className={styles.muted}>Pro</span>
        </span>
      </Link>
      <div className={styles.actions}>
        <ThemeToggle className={styles.toggle} />
      </div>
    </nav>
  );
}
