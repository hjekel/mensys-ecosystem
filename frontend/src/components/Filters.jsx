import styles from './Filters.module.css';
import { SECTORS, FTE_CATEGORIES, STATUSES } from '@shared/constants.js';

export default function Filters({
  query,
  onQueryChange,
  sector,
  onSectorChange,
  fte,
  onFteChange,
  status,
  onStatusChange,
  view,
  onViewChange,
  onAddClick,
  onImportClick,
  onExportClick,
  onCleanupClick,
  totalCount,
  facetCounts,
}) {
  const sectorCounts = facetCounts?.sector || {};
  const fteCounts = facetCounts?.fte || {};
  const statusCounts = facetCounts?.status || {};
  return (
    <div className={styles.bar}>
      <div className={styles.left}>
        <div className={styles.searchWrap}>
          <svg
            className={styles.searchIcon}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            className={`input ${styles.search}`}
            placeholder="Zoek op naam, bedrijf of functie"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
          />
        </div>

        <select
          className={`input select ${styles.filterSelect}`}
          value={sector}
          onChange={(e) => onSectorChange(e.target.value)}
        >
          <option value="">Alle sectoren</option>
          {SECTORS.map((s) => (
            <option key={s} value={s}>{s} ({sectorCounts[s] || 0})</option>
          ))}
        </select>

        <select
          className={`input select ${styles.filterSelect}`}
          value={fte}
          onChange={(e) => onFteChange(e.target.value)}
        >
          <option value="">Alle FTE</option>
          {FTE_CATEGORIES.map((f) => (
            <option key={f} value={f}>{f} ({fteCounts[f] || 0})</option>
          ))}
        </select>

        <select
          className={`input select ${styles.filterSelect}`}
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <option value="">Alle statussen</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s} ({statusCounts[s] || 0})</option>
          ))}
        </select>

        <span className={styles.total}>{totalCount} resultaten</span>
      </div>

      <div className={styles.right}>
        <div className={styles.viewToggle}>
          <button
            type="button"
            className={`${styles.viewBtn} ${view === 'kanban' ? styles.viewActive : ''}`}
            onClick={() => onViewChange('kanban')}
          >
            Kanban
          </button>
          <button
            type="button"
            className={`${styles.viewBtn} ${view === 'list' ? styles.viewActive : ''}`}
            onClick={() => onViewChange('list')}
          >
            Lijst
          </button>
        </div>

        <button className="btn btn-ghost" type="button" onClick={onCleanupClick}>
          Opschonen
        </button>
        <button className="btn btn-ghost" type="button" onClick={onExportClick}>
          Exporteer CSV
        </button>
        <button className="btn btn-ghost" type="button" onClick={onImportClick}>
          CSV importeren
        </button>
        <button className="btn btn-accent" type="button" onClick={onAddClick}>
          + Contact toevoegen
        </button>
      </div>
    </div>
  );
}
