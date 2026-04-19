import { useEffect, useMemo, useState } from 'react';
import ActiviteitEntry from './ActiviteitEntry.jsx';
import ActiviteitToevoegModal from './ActiviteitToevoegModal.jsx';
import FilterDropdown from '../FilterDropdown.jsx';
import {
  getActiviteitenVoorContact,
  voegActiviteitToe,
  verwijderActiviteit,
  updateActiviteit,
} from '../../store/activiteitenStore.js';
import {
  ACTIVITEIT_TYPES,
  TYPE_LABELS,
  STANDAARD_UITVOERDERS,
} from '../../utils/activiteitenUtils.js';
import styles from './ActiviteitenLogTab.module.css';

export default function ActiviteitenLogTab({ contactId, contactType, contactNaam, onChange }) {
  const [tick, setTick] = useState(0);
  const [typeFilter, setTypeFilter] = useState('');
  const [uitvoerderFilter, setUitvoerderFilter] = useState('');
  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    setTypeFilter('');
    setUitvoerderFilter('');
    setQuery('');
  }, [contactId, contactType]);

  const lijst = useMemo(
    () => getActiviteitenVoorContact(contactId, contactType),
    [contactId, contactType, tick],
  );

  const typeOptions = useMemo(() => {
    const counts = {};
    for (const a of lijst) counts[a.type] = (counts[a.type] || 0) + 1;
    return ACTIVITEIT_TYPES
      .filter((t) => counts[t])
      .map((t) => ({ value: t, label: TYPE_LABELS[t], count: counts[t] }));
  }, [lijst]);

  const uitvoerderOptions = useMemo(() => {
    const counts = {};
    for (const a of lijst) {
      const u = a.uitvoerder || '';
      if (u) counts[u] = (counts[u] || 0) + 1;
    }
    const seen = new Set();
    const out = [];
    for (const name of [...STANDAARD_UITVOERDERS, ...Object.keys(counts)]) {
      if (seen.has(name)) continue;
      seen.add(name);
      if (counts[name]) out.push({ value: name, label: name, count: counts[name] });
    }
    return out;
  }, [lijst]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return lijst.filter((a) => {
      if (typeFilter && a.type !== typeFilter) return false;
      if (uitvoerderFilter && a.uitvoerder !== uitvoerderFilter) return false;
      if (q) {
        const hay = `${a.kort || ''} ${a.lang || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [lijst, typeFilter, uitvoerderFilter, query]);

  function handleSave(values) {
    if (editing?.id) {
      updateActiviteit(editing.id, values);
    } else {
      voegActiviteitToe({
        ...values,
        contactId,
        contactType,
        contactNaam,
      });
    }
    setModalOpen(false);
    setEditing(null);
    setTick((t) => t + 1);
    if (onChange) onChange();
  }

  function handleEdit(a) {
    setEditing(a);
    setModalOpen(true);
  }

  function handleDelete(id) {
    verwijderActiviteit(id);
    setTick((t) => t + 1);
    if (onChange) onChange();
  }

  function openNew() {
    setEditing(null);
    setModalOpen(true);
  }

  return (
    <div className={styles.wrap}>
      <button type="button" className={styles.newBtn} onClick={openNew}>
        + Nieuwe activiteit
      </button>

      {lijst.length > 0 && (
        <div className={styles.filterBar}>
          <div className={styles.filterDrop}>
            <FilterDropdown
              allLabel="Alle types"
              value={typeFilter}
              onChange={setTypeFilter}
              options={typeOptions}
            />
          </div>
          <div className={styles.filterDrop}>
            <FilterDropdown
              allLabel="Alle uitvoerders"
              value={uitvoerderFilter}
              onChange={setUitvoerderFilter}
              options={uitvoerderOptions}
            />
          </div>
          <input
            type="text"
            className={`input ${styles.search}`}
            placeholder="Zoek"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      )}

      {filtered.length === 0 ? (
        <div className={styles.empty}>
          {lijst.length === 0
            ? 'Nog geen activiteiten vastgelegd. Klik + Nieuwe activiteit om te beginnen.'
            : 'Geen activiteiten passen bij de huidige filters.'}
        </div>
      ) : (
        <div className={styles.list}>
          {filtered.map((a) => (
            <ActiviteitEntry
              key={a.id}
              activiteit={a}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <ActiviteitToevoegModal
        open={modalOpen}
        initial={editing}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSave={handleSave}
      />
    </div>
  );
}
