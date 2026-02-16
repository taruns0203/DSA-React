import styles from './StatsStrip.module.css';

export default function StatsStrip({ stats }) {
  return (
    <div className={styles.stats}>
      {stats.map((stat) => (
        <div className={styles.card} key={stat.label}>
          <div className={styles.number}>{stat.value}</div>
          <div className={styles.label}>{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
