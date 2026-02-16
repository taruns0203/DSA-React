import HomeNav from '../components/HomeNav.jsx';
import Hero from '../components/Hero.jsx';
import SectionHeader from '../components/SectionHeader.jsx';
import TopicsGrid from '../components/TopicsGrid.jsx';
import { topics } from '../data/topics.js';
import styles from './Home.module.css';

export default function Home() {
  return (
    <div className={styles.homeRoot}>
      <HomeNav />
      <div className={styles.page}>
        <Hero />
        <section className={styles.section} id="topics-section">
          <SectionHeader label="Explore" title="All Topics" />
          <TopicsGrid topics={topics} />
        </section>
      </div>
    </div>
  );
}
