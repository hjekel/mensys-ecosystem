import FilterDropdown from './FilterDropdown.jsx';
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
  jobTitle,
  onJobTitleChange,
  jobTitleOptions,
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

  const sectorOpts = SECTORS.map((s) => ({ value: s, label: s, count: sectorCounts[s] || 0 }));
  const fteOpts = FTE_CATEGORIES.map((f) => ({ value: f, label: f, count: fteCounts[f] || 0 }));
  const statusOpts = STATUSES.map((s) => ({ value: s, label: s, count: statusCounts[s] || 0 }));
  const jobTitleOpts = jobTitleOptions || [];

  return (
    <div className={styles.bar}>
      <div className={styles.topRow}>
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

        <span className={styles.total}>{totalCount} resultaten</span>

        <div className={styles.spacer} />

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

      <div className={styles.filterGrid}>
        <div className={styles.filterColumn}>
          <FilterDropdown
            allLabel="Alle sectoren"
            value={sector}
            onChange={onSectorChange}
            options={sectorOpts}
          />
          <FilterDropdown
            allLabel="Alle FTE"
            value={fte}
            onChange={onFteChange}
            options={fteOpts}
          />
          <FilterDropdown
            allLabel="Alle statussen"
            value={status}
            onChange={onStatusChange}
            options={statusOpts}
          />
        </div>
        <div className={styles.filterColumn}>
          <FilterDropdown
            allLabel="Alle functietitels"
            value={jobTitle}
            onChange={onJobTitleChange}
            options={jobTitleOpts}
          />
        </div>
      </div>
    </div>
  );
}
