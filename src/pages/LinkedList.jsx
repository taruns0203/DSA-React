import PageHeader from '../components/PageHeader.jsx';
import StatsStrip from '../components/StatsStrip.jsx';
import TopicColumn from '../components/TopicColumn.jsx';
import { linkedListColumns, linkedListStats } from '../data/linkedListTopics.js';
import styles from './LinkedList.module.css';

export default function LinkedList() {
  return (
    <div className={styles.root}>
      <PageHeader
        title="🧠💡 DSA Learning Hub 💡🧠"
        subtitle="🚀 Master Data Structures, Algorithms & Crack Coding Interviews! 🎯"
      />
      <StatsStrip stats={linkedListStats} />
      <div className={styles.container}>
        {linkedListColumns.map((column) => (
          <TopicColumn
            key={column.id}
            title={column.title}
            icon={column.icon}
            items={column.items}
            variant={column.variant}
          />
        ))}
      </div>
      <div className={styles.footer}>
        <span>💻</span> Code. <span>🧠</span> Think. <span>🏆</span> Conquer. <span>🚀</span>
      </div>
    </div>
  );
}
