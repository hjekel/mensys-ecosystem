import { useMemo, useState } from 'react';
import SectorBadge from './SectorBadge.jsx';
import styles from './ListView.module.css';

const COLUMNS = [
  { key: 'country', label: 'Land' },
  { key: 'sector', label: 'Sector' },
  { key: 'fteCategory', label: 'FTE' },
  { key: 'company', label: 'Bedrijf' },
  { key: 'firstName', label: 'Voornaam' },
  { key: 'lastName', label: 'Achternaam' },
  { key: 'jobTitle', label: 'Functietitel' },
  { key: 'linkedinUrl', label: 'LinkedIn', sortable: false },
];

export default function ListView({ contacts, onOpen, badgeForContact }) {
  const [sortKey, setSortKey] = useState('company');
  const [sortDir, setSortDir] = useState('asc');

  const sorted = useMemo(() => {
    const copy = [...contacts];
    copy.sort((a, b) => {
      const va = String(a[sortKey] || '').toLowerCase();
      const vb = String(b[sortKey] || '').toLowerCase();
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return copy;
  }, [contacts, sortKey, sortDir]);

  function handleSort(key) {
    if (key === 'linkedinUrl') return;
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
                Geen contacten gevonden.
              </td>
            </tr>
          )}
          {sorted.map((c, idx) => (
            <tr key={c.id} onClick={() => onOpen(c)} className={styles.row}>
              <td className={styles.rowNum}>{idx + 1}</td>
              <td className={styles.dim}>{c.country || ''}</td>
              <td><SectorBadge sector={c.sector} /></td>
              <td className={styles.dim}>{c.fteCategory || ''}</td>
              <td className={styles.nameCell}>{c.company || ''}</td>
              <td>
                <span className={styles.nameInline}>
                  <span>{c.firstName || ''}</span>
                  {badgeForContact ? badgeForContact(c) : null}
                </span>
              </td>
              <td>{c.lastName || ''}</td>
              <td className={styles.dim}>{c.jobTitle || ''}</td>
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
