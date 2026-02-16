import { useTheme } from '../context/ThemeContext.jsx';
import styles from './ThemeToggle.module.css';

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme();
  const icon = theme === 'dark' ? '🌙' : '☀️';

  return (
    <button
      type="button"
      className={`${styles.toggle} ${className}`.trim()}
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      <span className={styles.knob}>
        <span className={styles.icon}>{icon}</span>
      </span>
    </button>
  );
}
