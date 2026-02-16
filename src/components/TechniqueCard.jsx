import { Link } from 'react-router-dom';
import styles from './TechniqueCard.module.css';

export default function TechniqueCard({ tech, isOpen, onToggle }) {
  const cardClass = `${styles.card} ${isOpen ? styles.open : ''}`.trim();
  const iconClass = `${styles.icon} ${styles[tech.iconClass] || ''}`.trim();
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onToggle();
    }
  };

  return (
    <div className={cardClass} data-tech={tech.id}>
      <div
        className={styles.header}
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={handleKeyDown}
      >
        <span className={iconClass}>{tech.icon}</span>
        <span className={styles.info}>
          {tech.link ? (
            <Link className={styles.name} to={tech.link} onClick={(event) => event.stopPropagation()}>
              {tech.title}
            </Link>
          ) : (
            <span className={styles.name}>{tech.title}</span>
          )}
          <span className={styles.desc}>{tech.desc}</span>
        </span>
        <span className={styles.count}>{tech.problems.length} problems</span>
        <svg className={styles.chevron} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="5 7.5 10 12.5 15 7.5" />
        </svg>
      </div>
      <div className={styles.body}>
        <div className={styles.bodyInner}>
          <div className={styles.divider} />
          <div className={styles.problemsList}>
            {tech.problems.map((problem, idx) => {
              const content = (
                <>
                  <span className={styles.problemNumber}>{String(idx + 1).padStart(2, '0')}</span>
                  <span className={styles.problemName}>{problem.name}</span>
                  <span className={styles.problemArrow}>→</span>
                </>
              );

              if (problem.href) {
                return (
                  <a key={problem.name} href={problem.href} className={styles.problemLink}>
                    {content}
                  </a>
                );
              }

              return (
                <div key={problem.name} className={`${styles.problemLink} ${styles.disabled}`}>
                  {content}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
