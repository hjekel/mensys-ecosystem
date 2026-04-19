import { useEffect, useState } from 'react';
import styles from './PersoonlijkeContextSectie.module.css';

function valuesFromRecord(record) {
  return {
    linkedinAbout: record?.linkedinAbout || '',
    linkedinPosts: record?.linkedinPosts || '',
    vorigeJob1: record?.vorigeJob1 || '',
    vorigeJob2: record?.vorigeJob2 || '',
    vorigeJob3: record?.vorigeJob3 || '',
  };
}

function isDirty(a, b) {
  return (
    a.linkedinAbout !== b.linkedinAbout ||
    a.linkedinPosts !== b.linkedinPosts ||
    a.vorigeJob1 !== b.vorigeJob1 ||
    a.vorigeJob2 !== b.vorigeJob2 ||
    a.vorigeJob3 !== b.vorigeJob3
  );
}

export default function PersoonlijkeContextSectie({ record, onSave, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const [values, setValues] = useState(() => valuesFromRecord(record));
  const [opgeslagenTick, setOpgeslagenTick] = useState(false);

  useEffect(() => {
    setValues(valuesFromRecord(record));
    setOpgeslagenTick(false);
  }, [record?.id]);

  function update(field, value) {
    setValues((v) => ({ ...v, [field]: value }));
    setOpgeslagenTick(false);
  }

  function handleSave() {
    if (!onSave || !record?.id) return;
    onSave(record.id, values);
    setOpgeslagenTick(true);
    setTimeout(() => setOpgeslagenTick(false), 1600);
  }

  const dirty = isDirty(values, valuesFromRecord(record));

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={styles.toggleBtn}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`${styles.chev} ${open ? styles.chevOpen : ''}`}
          aria-hidden="true"
        >
          <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className={styles.toggleLabel}>Persoonlijke context</span>
        <span className={styles.toggleHint}>voor warm bericht</span>
      </button>

      {open && (
        <div className={styles.body}>
          <p className={styles.help}>
            Deze velden worden gebruikt voor warm-personalisatie in de
            opener-generator. Kopieer uit LinkedIn.
          </p>

          <label className={styles.field}>
            <span className={styles.label}>LinkedIn About</span>
            <textarea
              className="input"
              rows={4}
              value={values.linkedinAbout}
              onChange={(e) => update('linkedinAbout', e.target.value)}
              placeholder="Wat deze persoon over zichzelf schrijft"
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Recente Posts</span>
            <textarea
              className="input"
              rows={6}
              value={values.linkedinPosts}
              onChange={(e) => update('linkedinPosts', e.target.value)}
              placeholder="Kopie-plak uit LinkedIn: korte samenvattingen van 1 tot 3 recente posts"
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Laatste job</span>
            <input
              type="text"
              className="input"
              value={values.vorigeJob1}
              onChange={(e) => update('vorigeJob1', e.target.value)}
              placeholder="Bedrijf, functietitel, periode"
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Daarvoor</span>
            <input
              type="text"
              className="input"
              value={values.vorigeJob2}
              onChange={(e) => update('vorigeJob2', e.target.value)}
              placeholder="Bedrijf, functietitel, periode"
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>En daarvoor</span>
            <input
              type="text"
              className="input"
              value={values.vorigeJob3}
              onChange={(e) => update('vorigeJob3', e.target.value)}
              placeholder="Bedrijf, functietitel, periode"
            />
          </label>

          <div className={styles.actions}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSave}
              disabled={!dirty && !opgeslagenTick}
            >
              {opgeslagenTick ? 'Opgeslagen' : 'Persoonlijke context opslaan'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
