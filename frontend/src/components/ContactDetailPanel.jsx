import { useEffect } from 'react';
import SectorBadge from './SectorBadge.jsx';
import styles from './ContactDetailPanel.module.css';
import { STATUSES } from '@shared/constants.js';

export default function ContactDetailPanel({
  contact,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
}) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    if (contact) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [contact, onClose]);

  if (!contact) return null;

  const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || '(naamloos)';

  return (
    <div className={styles.overlay} onClick={onClose}>
      <aside className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.name}>{fullName}</h2>
            {contact.jobTitle && <div className={styles.role}>{contact.jobTitle}</div>}
            {contact.company && <div className={styles.company}>{contact.company}</div>}
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Sluiten"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className={styles.tags}>
          <SectorBadge sector={contact.sector} />
          {contact.fteCategory && contact.fteCategory !== 'Onbekend' && (
            <span className={styles.fte}>{contact.fteCategory} FTE</span>
          )}
          {contact.priority && (
            <span className={`${styles.priority} ${priorityClass(contact.priority)}`}>
              {contact.priority}
            </span>
          )}
        </div>

        {isFirstDegree(contact) && (
          <div className={styles.warmConnection}>
            <span className={styles.warmDot} />
            Warme connectie — 1e graads LinkedIn
          </div>
        )}

        <div className={styles.section}>
          <label className={styles.label}>Status</label>
          <div className={styles.statusRow}>
            {STATUSES.map((s) => (
              <button
                type="button"
                key={s}
                className={`${styles.statusBtn} ${contact.status === s ? styles.statusActive : ''}`}
                onClick={() => onStatusChange(contact, s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <dl className={styles.grid}>
          <Item label="Email" value={contact.email} href={contact.email ? `mailto:${contact.email}` : null} />
          <Item label="Telefoon" value={contact.phone} href={contact.phone ? `tel:${contact.phone}` : null} />
          <Item label="LinkedIn" value={contact.linkedinUrl ? 'Open profiel' : '—'} href={contact.linkedinUrl} external />
          <Item label="Website" value={contact.companyWebsite} href={contact.companyWebsite} external />
          <Item label="Locatie" value={contact.location} />
          <Item label="Land" value={contact.country} />
          <Item label="Bron" value={contact.source} />
          <Item label="Aangemaakt" value={formatDate(contact.createdAt)} />
        </dl>

        {contact.notes && (
          <div className={styles.section}>
            <label className={styles.label}>Notities</label>
            <div className={styles.notes}>{contact.notes}</div>
          </div>
        )}

        <div className={styles.footer}>
          <button type="button" className="btn btn-danger" onClick={() => onDelete(contact)}>
            Verwijderen
          </button>
          <button type="button" className="btn btn-primary" onClick={() => onEdit(contact)}>
            Bewerken
          </button>
        </div>
      </aside>
    </div>
  );
}

function Item({ label, value, href, external }) {
  if (!value) {
    return (
      <>
        <dt className={styles.dt}>{label}</dt>
        <dd className={styles.ddDim}>—</dd>
      </>
    );
  }
  return (
    <>
      <dt className={styles.dt}>{label}</dt>
      <dd className={styles.dd}>
        {href ? (
          <a
            href={href}
            target={external ? '_blank' : undefined}
            rel={external ? 'noreferrer noopener' : undefined}
          >
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </>
  );
}

function formatDate(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('nl-NL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

function priorityClass(p) {
  if (p === 'Hoog') return styles.priorityHigh;
  if (p === 'Laag') return styles.priorityLow;
  return styles.priorityMid;
}

function isFirstDegree(c) {
  const src = String(c?.source || c?.bron || '').toLowerCase();
  return src.includes('1st degree') || src.includes('1e graads');
}
