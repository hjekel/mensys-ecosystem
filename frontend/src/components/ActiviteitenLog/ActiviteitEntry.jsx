import { useState } from 'react';
import TypeIcon from './TypeIcon.jsx';
import { RICHTING_COLORS, TYPE_LABELS, relatieveDatum } from '../../utils/activiteitenUtils.js';
import styles from './ActiviteitEntry.module.css';

export default function ActiviteitEntry({ activiteit, onEdit, onDelete, readonly = false }) {
  const [open, setOpen] = useState(false);
  const kleur = RICHTING_COLORS[activiteit.richting] || RICHTING_COLORS.intern;
  const heeftLang = Boolean(activiteit.lang && activiteit.lang.trim());
  const typeLabel = TYPE_LABELS[activiteit.type] || activiteit.type;

  function vraagVerwijder() {
    if (readonly || !onDelete) return;
    const label = activiteit.kort || typeLabel;
    if (confirm(`Verwijder activiteit: ${label}?`)) onDelete(activiteit.id);
  }

  return (
    <article className={styles.entry}>
      <div className={styles.head}>
        <div className={styles.icon} style={{ color: kleur }} title={typeLabel}>
          <TypeIcon type={activiteit.type} size={20} />
        </div>
        <div className={styles.body}>
          <div className={styles.meta}>
            <span className={styles.datum}>{relatieveDatum(activiteit.datum)}</span>
            <span className={styles.typeLabel}>{typeLabel}</span>
          </div>
          <div className={styles.kort}>{activiteit.kort || '(geen omschrijving)'}</div>
          {activiteit.contactNaam && (
            <div className={styles.contactName}>{activiteit.contactNaam}</div>
          )}
        </div>
        <div className={styles.rightCol}>
          {activiteit.uitvoerder && (
            <span
              className={styles.uitvoerder}
              style={{ color: kleur, borderColor: kleur }}
            >
              {activiteit.uitvoerder}
            </span>
          )}
          {heeftLang && (
            <button
              type="button"
              className={`${styles.chev} ${open ? styles.chevOpen : ''}`}
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? 'Inklappen' : 'Uitklappen'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>
      </div>
      {open && heeftLang && (
        <div className={styles.expanded}>
          <div className={styles.lang}>{activiteit.lang}</div>
          {!readonly && (
            <div className={styles.actions}>
              {onEdit && (
                <button type="button" className={styles.actionBtn} onClick={() => onEdit(activiteit)}>
                  Bewerken
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  className={`${styles.actionBtn} ${styles.actionDanger}`}
                  onClick={vraagVerwijder}
                >
                  Verwijderen
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  );
}
