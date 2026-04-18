import { useMemo } from 'react';
import { computeWeekStats } from '../utils/weekGoals.js';
import styles from './WeekGoals.module.css';

export default function WeekGoals({ contacts, resellers }) {
  const stats = useMemo(() => computeWeekStats(contacts, resellers), [contacts, resellers]);

  return (
    <section className={styles.widget}>
      <div className={styles.header}>
        <span className={styles.title}>Deze week</span>
        <span className={styles.sub}>Tellingen uit de laatste 7 dagen</span>
      </div>
      <div className={styles.counters}>
        <Counter label="Connecties verzonden" value={stats.connecties} target={15} />
        <Counter label="DMs verstuurd" value={stats.dms} target={10} />
        <Counter label="Reacties" value={stats.reacties} />
        <Counter label="Gesprekken" value={stats.gesprekken} />
        <Counter label="Partners" value={stats.partners} />
      </div>
    </section>
  );
}

function Counter({ label, value, target }) {
  const progress = target ? Math.min(100, Math.round((value / target) * 100)) : 0;
  return (
    <div className={styles.counter}>
      <div className={styles.valueRow}>
        <span className={styles.value}>{value}</span>
        {target ? <span className={styles.target}>/ {target}</span> : null}
      </div>
      <div className={styles.label}>{label}</div>
      {target ? (
        <div className={styles.bar}>
          <div className={styles.fill} style={{ width: `${progress}%` }} />
        </div>
      ) : (
        <div className={styles.spacer} />
      )}
    </div>
  );
}
