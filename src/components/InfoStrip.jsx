import styles from './InfoStrip.module.css';

export default function InfoStrip({ cards }) {
  return (
    <div className={styles.strip}>
      <div className={styles.inner}>
        {cards.map((card) => (
          <div className={styles.card} key={card.title}>
            <div className={styles.icon}>{card.icon}</div>
            <div className={styles.title}>{card.title}</div>
            <div className={styles.text}>{card.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
