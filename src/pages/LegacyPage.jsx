import { useLocation } from 'react-router-dom';
import styles from './LegacyPage.module.css';

export default function LegacyPage({ sourcePath }) {
  const { pathname } = useLocation();
  const resolvedPath = sourcePath
    ? `/legacy/${sourcePath.replace(/^\/?legacy\//, '').replace(/^\//, '')}`
    : `/legacy${pathname.replace(/^\/legacy/, '') || '/index.html'}`;

  return (
    <div className={styles.legacyRoot}>
      <div className={styles.noticeBar}>
        <div className={styles.noticeTitle}>Legacy View</div>
        <div className={styles.noticeText}>
          This page is served from the original static site for now.
        </div>
      </div>
      <iframe className={styles.legacyFrame} title="Legacy content" src={resolvedPath} />
    </div>
  );
}
