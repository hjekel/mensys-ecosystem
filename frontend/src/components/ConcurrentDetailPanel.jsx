import { useEffect, useState } from 'react';
import styles from './ContactDetailPanel.module.css';

export default function ConcurrentDetailPanel({ concurrent, onClose, onEdit, onDelete, onNotitiesChange }) {
  const [notities, setNotities] = useState('');

  useEffect(() => {
    if (concurrent) setNotities(concurrent.notities || '');
  }, [concurrent]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    if (concurrent) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [concurrent, onClose]);

  if (!concurrent) return null;

  const dirty = (concurrent.notities || '') !== notities;

  function save() {
    onNotitiesChange(concurrent.id, notities);
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <aside className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.name}>{concurrent.naam}</h2>
            <div className={styles.role}>{concurrent.categorie} · {concurrent.scope}</div>
            {concurrent.hq && <div className={styles.company}>{concurrent.hq}</div>}
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Sluiten">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {concurrent.coopetitie && (
          <div style={{ background: '#e6f7f2', color: '#00a878', padding: '10px 12px', borderRadius: 6, fontSize: 13, fontWeight: 500 }}>
            <strong>Coopetitie-kans:</strong> {concurrent.coopetitieIdee || 'geen beschrijving'}
          </div>
        )}

        {concurrent.propositie && (
          <div className={styles.section}>
            <label className={styles.label}>Propositie</label>
            <div style={{ fontSize: 13, lineHeight: 1.55 }}>{concurrent.propositie}</div>
          </div>
        )}

        {concurrent.sterktes && concurrent.sterktes.length > 0 && (
          <div className={styles.section}>
            <label className={styles.label}>Sterktes</label>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, lineHeight: 1.55, color: '#00a878' }}>
              {concurrent.sterktes.map((s) => <li key={s}>{s}</li>)}
            </ul>
          </div>
        )}

        {concurrent.zwaktes && concurrent.zwaktes.length > 0 && (
          <div className={styles.section}>
            <label className={styles.label}>Zwaktes vs Mensys</label>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, lineHeight: 1.55, color: '#991b1b' }}>
              {concurrent.zwaktes.map((s) => <li key={s}>{s}</li>)}
            </ul>
          </div>
        )}

        <dl className={styles.grid}>
          <Item label="Website" value={concurrent.website} href={concurrent.website ? `https://${concurrent.website.replace(/^https?:\/\//, '')}` : null} external />
          <Item label="LinkedIn" value={concurrent.linkedinUrl ? 'Open profiel' : ''} href={concurrent.linkedinUrl} external />
          <Item label="HQ" value={concurrent.hq} />
          <Item label="Scope" value={concurrent.scope} />
          <Item label="Categorie" value={concurrent.categorie} />
          <Item label="Klantsegment" value={concurrent.klantsegment} />
        </dl>

        <div className={styles.section}>
          <label className={styles.label}>Notities</label>
          <textarea
            className="input"
            rows={5}
            value={notities}
            onChange={(e) => setNotities(e.target.value)}
          />
        </div>

        <div className={styles.footer}>
          <button type="button" className="btn btn-danger" onClick={() => onDelete(concurrent)}>Verwijderen</button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn btn-ghost" onClick={() => onEdit(concurrent)}>Bewerken</button>
            <button type="button" className="btn btn-primary" onClick={save} disabled={!dirty}>
              Notities opslaan
            </button>
          </div>
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
        <dd className={styles.ddDim}>-</dd>
      </>
    );
  }
  return (
    <>
      <dt className={styles.dt}>{label}</dt>
      <dd className={styles.dd}>
        {href ? (
          <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer noopener' : undefined}>
            {value}
          </a>
        ) : value}
      </dd>
    </>
  );
}
