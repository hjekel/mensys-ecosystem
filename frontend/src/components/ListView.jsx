import { useMemo, useState } from 'react';
import SectorBadge from './SectorBadge.jsx';
import styles from './ListView.module.css';

const COLUMNS = [
  { key: 'name', label: 'Naam' },
  { key: 'jobTitle', label: 'Functie' },
  { key: 'company', label: 'Bedrijf' },
  { key: 'sector', label: 'Sector' },
  { key: 'fteCategory', label: 'FTE' },
  { key: 'status', label: 'Status' },
  { key: 'linkedinUrl', label: 'LinkedIn' },
  { key: 'actions', label: '', sortable: false },
];

export default function ListView({ contacts, onOpen, onEdit, onDelete }) {
  const [sortKey, setSortKey] = useState('name');
  const [sortDir, setSortDir] = useState('asc');

  const sorted = useMemo(() => {
    const copy = [...contacts];
    copy.sort((a, b) => {
      let va;
      let vb;
      if (sortKey === 'name') {
        va = `${a.lastName || ''} ${a.firstName || ''}`.toLowerCase();
        vb = `${b.lastName || ''} ${b.firstName || ''}`.toLowerCase();
      } else {
        va = String(a[sortKey] || '').toLowerCase();
        vb = String(b[sortKey] || '').toLowerCase();
      }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return copy;
  }, [contacts, sortKey, sortDir]);

  function handleSort(key) {
    if (key === 'actions' || key === 'linkedinUrl') return;
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                onClick={() => handleSort(col.key)}
                className={col.sortable === false ? styles.noSort : styles.sortable}
              >
                <span>{col.label}</span>
                {sortKey === col.key && (
                  <span className={styles.sortIcon}>{sortDir === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 && (
            <tr>
              <td colSpan={COLUMNS.length} className={styles.empty}>
                Geen contacten gevonden.
              </td>
            </tr>
          )}
          {sorted.map((c) => {
            const fullName = `${c.firstName || ''} ${c.lastName || ''}`.trim() || '(naamloos)';
            return (
              <tr key={c.id} onClick={() => onOpen(c)} className={styles.row}>
                <td className={styles.nameCell}>{fullName}</td>
                <td className={styles.dim}>{c.jobTitle || ''}</td>
                <td>{c.company || ''}</td>
                <td><SectorBadge sector={c.sector} /></td>
                <td className={styles.dim}>{c.fteCategory || ''}</td>
                <td>
                  <span className={`${styles.statusPill} ${statusClass(c.status)}`}>{c.status}</span>
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                  {c.linkedinUrl ? (
                    <a
                      href={c.linkedinUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className={styles.liLink}
                    >
                      Open
                    </a>
                  ) : (
                    <span className={styles.dim}>—</span>
                  )}
                </td>
                <td onClick={(e) => e.stopPropagation()} className={styles.actions}>
                  <button
                    type="button"
                    className={styles.actionBtn}
                    onClick={() => onEdit(c)}
                  >
                    Bewerken
                  </button>
                  <button
                    type="button"
                    className={`${styles.actionBtn} ${styles.actionDanger}`}
                    onClick={() => {
                      if (confirm(`Verwijder ${fullName}?`)) onDelete(c);
                    }}
                  >
                    Verwijder
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function statusClass(status) {
  switch (status) {
    case 'Nieuw': return styles.statusNieuw;
    case 'Warm': return styles.statusWarm;
    case 'Benaderd': return styles.statusBenaderd;
    case 'Gesprek gevoerd': return styles.statusGesprek;
    case 'Klant': return styles.statusKlant;
    default: return '';
  }
}
