import styles from './Tabs.module.css';

export default function Tabs({ tabs, active, onChange }) {
  return (
    <div className={styles.tabs}>
      <div className={styles.inner}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tab} ${active === tab.id ? styles.active : ''}`}
            onClick={() => onChange(tab.id)}
            type="button"
          >
            <span>{tab.label}</span>
            {typeof tab.count === 'number' && (
              <span className={styles.count}>{tab.count}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
