import styles from './TopicColumn.module.css';

export default function TopicColumn({ title, icon, items, variant }) {
  const columnClass = `${styles.column} ${variant ? styles[variant] : ''}`.trim();
  const titleClass = `${styles.columnTitle} ${variant ? styles[`${variant}Title`] : ''}`.trim();

  return (
    <div className={columnClass}>
      <div className={styles.columnHeader}>
        <span className={styles.icon}>{icon}</span>
        <h2 className={titleClass}>{title}</h2>
      </div>
      <ul className={styles.list}>
        {items.map((item) => {
          const content = (
            <>
              <span className={styles.emoji}>{item.emoji}</span>
              {item.name}
              {item.difficulty ? (
                <span className={`${styles.difficulty} ${styles[item.difficulty.toLowerCase()]}`}>
                  {item.difficulty}
                </span>
              ) : null}
            </>
          );

          if (item.href) {
            return (
              <li key={item.name}>
                <a href={item.href}>{content}</a>
              </li>
            );
          }

          return (
            <li key={item.name}>
              <span className={styles.disabled}>{content}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
