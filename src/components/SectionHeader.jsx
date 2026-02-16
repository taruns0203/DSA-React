import styles from './SectionHeader.module.css';

export default function SectionHeader({ label, title, subtitle }) {
  return (
    <div className={styles.header}>
      {label ? <div className={styles.label}>{label}</div> : null}
      <div className={styles.title}>{title}</div>
      {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
    </div>
  );
}
