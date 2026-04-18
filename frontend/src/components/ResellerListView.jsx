import { useMemo, useState } from 'react';
import MensysFitBadge from './MensysFitBadge.jsx';
import styles from './ListView.module.css';

const COLUMNS = [
  { key: 'bedrijf', label: 'Bedrijf' },
  { key: 'voornaam', label: 'Voornaam' },
  { key: 'achternaam', label: 'Achternaam' },
  { key: 'functietitel', label: 'Functietitel' },
  { key: 'resellerType', label: 'Reseller Type' },
  { key: 'mensysFit', label: 'Mensys Fit' },
  { key: 'fteRange', label: 'FTE' },
  { key: 'linkedin', label: 'LinkedIn', sortable: false },
];

export default function ResellerListView({ resellers, onOpen }) {
  const [sortKey, setSortKey] = useState('bedrijf');
  const [sortDir, setSortDir] = useState('asc');

  const sorted = useMemo(() => {
    const copy = [...resellers];
    copy.sort((a, b) => {
      const va = String(a[sortKey] || '').toLowerCase();
      const vb = String(b[sortKey] || '').toLowerCase();
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return copy;
  }, [resellers, sortKey, sortDir]);

  function handleSort(key) {
    if (key === 'linkedin') return;
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
            <th className={styles.noSort}><span>#</span></th>
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
              <td colSpan={COLUMNS.length + 1} className={styles.empty}>
                Geen resellers gevonden.
              </td>
            </tr>
          )}
          {sorted.map((r, idx) => (
            <tr key={r.id} onClick={() => onOpen(r)} className={styles.row}>
              <td className={styles.rowNum}>{idx + 1}</td>
              <td className={styles.nameCell}>{r.bedrijf || ''}</td>
              <td>{r.voornaam || ''}</td>
              <td>{r.achternaam || ''}</td>
              <td className={styles.dim}>{r.functietitel || ''}</td>
              <td className={styles.dim}>{r.resellerType || ''}</td>
              <td><MensysFitBadge fit={r.mensysFit} /></td>
              <td className={styles.dim}>{r.fteRange || ''}</td>
              <td onClick={(e) => e.stopPropagation()}>
                {r.linkedin ? (
                  <a
                    href={r.linkedin}
                    target="_blank"
                    rel="noreferrer noopener"
                    className={styles.liLink}
                  >
                    Open
                  </a>
                ) : (
                  <span className={styles.dim}></span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
