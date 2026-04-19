import { useEffect, useState } from 'react';
import styles from './LinkedInRitmeTip.module.css';

const STORAGE_KEY = 'mensys_linkedin_tip_dismissed';

export default function LinkedInRitmeTip() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === 'true') setHidden(true);
    } catch {
      // ignore
    }
  }, []);

  if (hidden) return null;

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // ignore
    }
    setHidden(true);
  }

  return (
    <div className={styles.tip}>
      <div className={styles.icon} aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" strokeLinecap="round" />
          <line x1="12" y1="8" x2="12.01" y2="8" strokeLinecap="round" />
        </svg>
      </div>
      <div className={styles.body}>
        <strong>LinkedIn-ritme:</strong> 35-50 connectieverzoeken per werkdag
        is voor een ervaren account met gezonde acceptatie-rate prima. Stuur
        niet in het weekend (patroon-detectie). Bij een jonger account of
        lagere acceptatie-rate: schaal terug naar 20-25/werkdag.
      </div>
      <button
        type="button"
        className={styles.closeBtn}
        onClick={dismiss}
        aria-label="Tip verbergen"
        title="Verbergen"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
