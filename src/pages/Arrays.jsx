import ArrayTopBar from '../components/ArrayTopBar.jsx';
import ArrayHero from '../components/ArrayHero.jsx';
import InfoStrip from '../components/InfoStrip.jsx';
import TechniqueAccordion from '../components/TechniqueAccordion.jsx';
import ArrayFooter from '../components/ArrayFooter.jsx';
import { arrayInfoCards } from '../data/arrayInfoCards.js';
import { arrayTechniques } from '../data/arrayTechniques.js';
import styles from './Arrays.module.css';

export default function Arrays() {
  return (
    <div className={styles.arraysRoot}>
      <ArrayTopBar />
      <ArrayHero />
      <InfoStrip cards={arrayInfoCards} />

      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <div className={styles.eyebrow}>Explore</div>
            <h2 className={styles.sectionTitle}>Array Techniques &amp; Patterns</h2>
            <p className={styles.sectionSubtitle}>
              Master these core patterns to solve the majority of array-based interview and competitive
              programming problems.
            </p>
          </div>
          <TechniqueAccordion techniques={arrayTechniques} />
        </div>
      </section>

      <ArrayFooter />
    </div>
  );
}
