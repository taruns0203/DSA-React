import { Link } from 'react-router-dom';
import styles from './NotFound.module.css';

export default function NotFound() {
  return (
    <div className={styles.root}>
      <div className={styles.card}>
        <div className={styles.emoji}>🧭</div>
        <h1>Page not found</h1>
        <p>The route you requested doesn’t exist in the new React app.</p>
        <Link className={styles.link} to="/">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
