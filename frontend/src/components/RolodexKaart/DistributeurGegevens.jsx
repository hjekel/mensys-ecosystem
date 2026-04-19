import { useEffect, useState } from 'react';
import styles from './RolodexKaart.module.css';

function statusClass(status) {
  if (status === 'actief') return styles.statusActief;
  if (status === 'inactief') return styles.statusInactief;
  return styles.statusOnderzocht;
}

function formatDate(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('nl-NL', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

export default function DistributeurGegevens({ record, onUpdate }) {
  const [notities, setNotities] = useState('');

  useEffect(() => {
    setNotities(record?.notities || '');
  }, [record?.id]);

  const dirty = (record?.notities || '') !== notities;
  const vendors = Array.isArray(record?.vendors_via_deze_distributeur)
    ? record.vendors_via_deze_distributeur
    : [];

  function bewaarNotities() {
    if (onUpdate) onUpdate(record.id, { notities });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {record.relatie_status && (
        <div>
          <span className={`${styles.statusPill} ${statusClass(record.relatie_status)}`}>
            {record.relatie_status}
          </span>
        </div>
      )}

      <dl className={styles.grid}>
        <Item label="Type" value={record.type} />
        <Item label="Website" value={record.website} href={record.website} external />
        <Item label="HQ" value={record.hq} />
        <Item label="Portal" value={record.portal_url} href={record.portal_url} external />
        <Item label="Account manager" value={record.account_manager_naam} />
        <Item label="E-mail" value={record.account_manager_email} href={record.account_manager_email ? `mailto:${record.account_manager_email}` : null} />
        <Item label="Telefoon" value={record.account_manager_telefoon} href={record.account_manager_telefoon ? `tel:${record.account_manager_telefoon}` : null} />
        <Item label="Laatste contact" value={formatDate(record.laatste_contact)} />
      </dl>

      {vendors.length > 0 && (
        <div className={styles.section}>
          <span className={styles.label}>Vendors via deze distributeur</span>
          <div className={styles.vendorChips}>
            {vendors.map((v) => (
              <span key={v} className={styles.vendorChip}>{v}</span>
            ))}
          </div>
        </div>
      )}

      <div className={styles.section}>
        <span className={styles.label}>Notities</span>
        <textarea
          className={`input ${styles.notitiesTextarea}`}
          rows={5}
          value={notities}
          onChange={(e) => setNotities(e.target.value)}
          placeholder="Aantekeningen over deze distributeur"
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
            href={href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')
              ? href
              : `https://${href.replace(/^https?:\/\//, '')}`}
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
