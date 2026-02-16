import { Link } from 'react-router-dom';
import styles from './TopicCard.module.css';

export default function TopicCard({ topic }) {
  const style = {
    '--card-accent': topic.accent,
    '--card-accent-bg': topic.accentBg,
  };

  const content = (
    <>
      <div className={styles.icon}>{topic.icon}</div>
      <div className={styles.title}>{topic.title}</div>
      <div className={styles.desc}>{topic.desc}</div>
      <div className={styles.meta}>
        <span className={styles.tag}>{topic.category}</span>
        <span>{topic.difficulty}</span>
      </div>
    </>
  );

  if (topic.linkType === 'route' || topic.linkType === 'legacy') {
    return (
      <Link className={styles.card} to={topic.link} style={style}>
        {content}
      </Link>
    );
  }

  return (
    <a className={styles.card} href={topic.link} style={style}>
      {content}
    </a>
  );
}
