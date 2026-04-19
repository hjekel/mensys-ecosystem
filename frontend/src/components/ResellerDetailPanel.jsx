import { useEffect, useState } from 'react';
import MensysFitBadge from './MensysFitBadge.jsx';
import ActiviteitenLogTab from './ActiviteitenLog/ActiviteitenLogTab.jsx';
import styles from './ContactDetailPanel.module.css';
import { RESELLER_STATUSES } from '@shared/constants.js';

export default function ResellerDetailPanel({
  reseller,
  onClose,
  onDelete,
  onSave,
  onActiviteitenChange,
}) {
  const [notities, setNotities] = useState('');
  const [status, setStatus] = useState('Nieuw');
  const [tab, setTab] = useState('gegevens');

  useEffect(() => {
    if (reseller) {
      setNotities(reseller.notities || '');
      setStatus(reseller.status || 'Nieuw');
      setTab('gegevens');
    }
  }, [reseller?.id]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    if (reseller) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [reseller, onClose]);

  if (!reseller) return null;

  const fullName = `${reseller.voornaam || ''} ${reseller.achternaam || ''}`.trim() || '(naamloos)';
  const displayTitle = reseller.bedrijf || fullName;

  function handleSave() {
    onSave(reseller.id, { status, notities });
  }

  const dirty =
    (reseller.notities || '') !== notities || (reseller.status || 'Nieuw') !== status;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <aside className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.name}>{displayTitle}</h2>
            {reseller.bedrijf && fullName !== '(naamloos)' && (
              <div className={styles.role}>{fullName}</div>
            )}
            {reseller.functietitel && (
              <div className={styles.company}>{reseller.functietitel}</div>
            )}
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

        <div className={styles.subnav}>
          <button
            type="button"
            className={`${styles.subnavBtn} ${tab === 'gegevens' ? styles.subnavActive : ''}`}
            onClick={() => setTab('gegevens')}
          >
            Gegevens
          </button>
          <button
            type="button"
            className={`${styles.subnavBtn} ${tab === 'log' ? styles.subnavActive : ''}`}
            onClick={() => setTab('log')}
          >
            Log
          </button>
        </div>

        {tab === 'log' ? (
          <ActiviteitenLogTab
            contactId={reseller.id}
            contactType="reseller"
            contactNaam={displayTitle}
            onChange={onActiviteitenChange}
          />
        ) : (
        <>
        <div className={styles.tags}>
          <MensysFitBadge fit={reseller.mensysFit} />
          {reseller.resellerType && (
            <span className={styles.fte}>{reseller.resellerType}</span>
          )}
          {reseller.fteRange && (
            <span className={styles.fte}>{reseller.fteRange} FTE</span>
          )}
        </div>

        <div className={styles.section}>
          <label className={styles.label}>Status</label>
          <div className={styles.statusRow}>
            {RESELLER_STATUSES.map((s) => (
              <button
                type="button"
                key={s}
                className={`${styles.statusBtn} ${status === s ? styles.statusActive : ''}`}
                onClick={() => setStatus(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <dl className={styles.grid}>
          <Item label="Bedrijf" value={reseller.bedrijf} />
          <Item label="Functietitel" value={reseller.functietitel} />
          <Item label="Email" value={reseller.email} href={reseller.email ? `mailto:${reseller.email}` : null} />
          <Item label="LinkedIn" value={reseller.linkedin ? 'Open profiel' : ''} href={reseller.linkedin} external />
          <Item label="Website" value={reseller.website} href={reseller.website} external />
          <Item label="Locatie" value={reseller.locatie} />
          <Item label="Reseller Type" value={reseller.resellerType} />
          <Item label="FTE Range" value={reseller.fteRange} />
          <Item label="Mensys Fit" value={reseller.mensysFit} />
          <Item label="Bron" value={reseller.bron} />
          <Item label="Keywords" value={reseller.keywords} />
          <Item label="Aangemaakt" value={formatDate(reseller.createdAt)} />
        </dl>

        <div className={styles.section}>
          <label className={styles.label}>Notities</label>
          <textarea
            className="input"
            value={notities}
            onChange={(e) => setNotities(e.target.value)}
            rows={5}
            placeholder="Aantekeningen over deze reseller"
          />
        </div>

        <div className={styles.footer}>
          <button type="button" className="btn btn-danger" onClick={() => onDelete(reseller)}>
            Verwijderen
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
            disabled={!dirty}
          >
            Opslaan
          </button>
        </div>
        </>
        )}
      </aside>
    </div>
  );
}

function Item({ label, value, href, external }) {
  if (!value) {
    return (
      <>
        <dt className={styles.dt}>{label}</dt>
        <dd className={styles.ddDim}>-</dd>
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
