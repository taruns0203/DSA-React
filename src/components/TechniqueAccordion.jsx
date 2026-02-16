import { useState } from 'react';
import TechniqueCard from './TechniqueCard.jsx';
import styles from './TechniqueAccordion.module.css';

export default function TechniqueAccordion({ techniques }) {
  const [openId, setOpenId] = useState(techniques[0]?.id || null);

  return (
    <div className={styles.list}>
      {techniques.map((tech) => (
        <TechniqueCard
          key={tech.id}
          tech={tech}
          isOpen={openId === tech.id}
          onToggle={() => setOpenId((prev) => (prev === tech.id ? null : tech.id))}
        />
      ))}
    </div>
  );
}
