import { Link } from 'react-router-dom';
import styles from './ArrayFooter.module.css';

export default function ArrayFooter() {
  return (
    <footer className={styles.footer}>
      DSA Visualizer Platform — Built for learners. <Link to="/">Back to Dashboard</Link>
    </footer>
  );
}
