import { useEffect, useState } from 'react';
import styles from './RolodexKaart.module.css';

export default function ConcurrentGegevens({ record, onUpdate }) {
  const [notities, setNotities] = useState('');

  useEffect(() => {
    setNotities(record?.notities || '');
  }, [record?.id]);

  const dirty = (record?.notities || '') !== notities;

  function bewaarNotities() {
    if (onUpdate) onUpdate(record.id, { notities });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {record.coopetitie && (
        <div className={styles.coopBanner}>
          <strong>Coopetitie-kans:</strong>{' '}
          {record.coopetitieNota || record.coopetitieIdee || 'Samenwerking verkennen.'}
        </div>
      )}

      {record.propositie && (
        <div className={styles.section}>
          <span className={styles.label}>Propositie</span>
          <div className={styles.propositie}>{record.propositie}</div>
        </div>
      )}

      {Array.isArray(record.sterktes) && record.sterktes.length > 0 && (
        <div className={styles.section}>
          <span className={styles.label}>Sterktes</span>
          <ul className={`${styles.list} ${styles.listSterk}`}>
            {record.sterktes.map((s) => <li key={s}>{s}</li>)}
          </ul>
        </div>
      )}

      {Array.isArray(record.zwaktes) && record.zwaktes.length > 0 && (
        <div className={styles.section}>
          <span className={styles.label}>Zwaktes vs Mensys</span>
          <ul className={`${styles.list} ${styles.listZwak}`}>
            {record.zwaktes.map((s) => <li key={s}>{s}</li>)}
          </ul>
        </div>
      )}

      {Array.isArray(record.portfolioGap) && record.portfolioGap.length > 0 && (
        <div className={styles.section}>
          <span className={styles.label}>Ontbrekend portfolio</span>
          <ul className={`${styles.list} ${styles.listZwak}`}>
            {record.portfolioGap.map((s) => <li key={s}>{s}</li>)}
          </ul>
          {record.kansNote && (
            <div style={{
              padding: '10px 12px',
              background: '#fff3eb',
              borderLeft: '3px solid #E8500A',
              borderRadius: 6,
              fontSize: 12,
              lineHeight: 1.55,
              color: 'var(--color-text)',
            }}>
              <strong>Kans voor Mensys:</strong> {record.kansNote}
            </div>
          )}
        </div>
      )}

      <dl className={styles.grid}>
        <Item label="Website" value={record.website} href={record.website ? `https://${record.website.replace(/^https?:\/\//, '')}` : null} external />
        <Item label="LinkedIn" value={record.linkedinUrl ? 'Open profiel' : ''} href={record.linkedinUrl} external />
        <Item label="HQ" value={record.hq} />
        <Item label="Scope" value={record.scope} />
        <Item label="Categorie" value={record.categorie} />
        <Item label="Klantsegment" value={record.klantsegment} />
      </dl>

      <div className={styles.section}>
        <span className={styles.label}>Notities</span>
        <textarea
          className={`input ${styles.notitiesTextarea}`}
          rows={5}
          value={notities}
          onChange={(e) => setNotities(e.target.value)}
          placeholder="Eigen aantekeningen over deze concurrent"
        />
      </div>

      <div className={styles.footer}>
        <button
          type="button"
          className="btn btn-primary"
          onClick={bewaarNotities}
          disabled={!dirty}
        >
          Notities opslaan
        </button>
      </div>
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
        ) : value}
      </dd>
    </>
  );
}
