import FilterDropdown from './FilterDropdown.jsx';
import styles from './Filters.module.css';
import {
  RESELLER_TYPES,
  RESELLER_FTE_RANGES,
  MENSYS_FIT_SCORES,
  RESELLER_STATUSES,
} from '@shared/constants.js';

export default function ResellerFilters({
  query,
  onQueryChange,
  resellerType,
  onResellerTypeChange,
  fteRange,
  onFteRangeChange,
  mensysFit,
  onMensysFitChange,
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
  const typeCounts = facetCounts?.resellerType || {};
  const fteCounts = facetCounts?.fteRange || {};
  const fitCounts = facetCounts?.mensysFit || {};
  const statusCounts = facetCounts?.status || {};

  const typeOpts = RESELLER_TYPES.map((t) => ({ value: t, label: t, count: typeCounts[t] || 0 }));
  const fteOpts = RESELLER_FTE_RANGES.map((f) => ({ value: f, label: f, count: fteCounts[f] || 0 }));
  const fitOpts = MENSYS_FIT_SCORES.map((s) => ({ value: s, label: s, count: fitCounts[s] || 0 }));
  const statusOpts = RESELLER_STATUSES.map((s) => ({ value: s, label: s, count: statusCounts[s] || 0 }));

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
            placeholder="Zoek op bedrijf, naam of functietitel"
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
          + Reseller toevoegen
        </button>
      </div>

      <div className={styles.filterGrid}>
        <div className={styles.filterColumn}>
          <FilterDropdown
            allLabel="Alle typen"
            value={resellerType}
            onChange={onResellerTypeChange}
            options={typeOpts}
          />
          <FilterDropdown
            allLabel="Alle FTE"
            value={fteRange}
            onChange={onFteRangeChange}
            options={fteOpts}
          />
        </div>
        <div className={styles.filterColumn}>
          <FilterDropdown
            allLabel="Alle Mensys Fit scores"
            value={mensysFit}
            onChange={onMensysFitChange}
            options={fitOpts}
          />
          <FilterDropdown
            allLabel="Alle statussen"
            value={status}
            onChange={onStatusChange}
            options={statusOpts}
          />
        </div>
      </div>
    </div>
  );
}
