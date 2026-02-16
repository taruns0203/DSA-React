import TopicCard from './TopicCard.jsx';
import styles from './TopicsGrid.module.css';

export default function TopicsGrid({ topics }) {
  return (
    <div className={styles.grid}>
      {topics.map((topic) => (
        <TopicCard key={topic.id} topic={topic} />
      ))}
    </div>
  );
}
