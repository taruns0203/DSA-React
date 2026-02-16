import styles from './Hero.module.css';

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroOrb} />
      <div className={styles.heroOrb} />
      <div className={styles.heroOrb} />

      <div className={styles.badge}>
        <span className={styles.badgeDot} />
        Interactive Learning Platform
      </div>

      <h1 className={styles.title}>
        Master <span className={styles.gradientText}>Data Structures</span>
        <br />& Algorithms
      </h1>

      <p className={styles.subtitle}>
        Visualize, interact, and deeply understand every core DSA concept with step-by-step
        animated walkthroughs and real-time manipulation.
      </p>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <div className={styles.statNum}>9</div>
          <div className={styles.statLabel}>Topics</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statNum}>15+</div>
          <div className={styles.statLabel}>Algorithms</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statNum}>∞</div>
          <div className={styles.statLabel}>Visualizations</div>
        </div>
      </div>

      <div className={styles.scrollHint}>
        <span>Explore Topics</span>
        <div className={styles.scrollHintLine} />
      </div>
    </section>
  );
}
