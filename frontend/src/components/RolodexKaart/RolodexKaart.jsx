import { useEffect, useState } from 'react';
import ActiviteitenLogTab from '../ActiviteitenLog/ActiviteitenLogTab.jsx';
import DistributeurGegevens from './DistributeurGegevens.jsx';
import ConcurrentGegevens from './ConcurrentGegevens.jsx';
import panelStyles from '../ContactDetailPanel.module.css';
import styles from './RolodexKaart.module.css';

const TYPE_COPY = {
  distributeur: { kind: 'Distributeur' },
  concurrent: { kind: 'Concurrent' },
};

export default function RolodexKaart({
  record,
  type,
  onClose,
  onUpdate,
  onActiviteitenChange,
}) {
  const [tab, setTab] = useState('gegevens');

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    if (record) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [record, onClose]);

  useEffect(() => {
    setTab('gegevens');
  }, [record?.id]);

  if (!record) return null;

  const kind = TYPE_COPY[type]?.kind || 'Kaart';
  const naam = record.naam || '(naamloos)';
  const subtitel = type === 'distributeur'
    ? [record.type, record.hq, record.relatie_status].filter(Boolean).join(' \u00b7 ')
    : [record.categorie, record.scope, record.hq].filter(Boolean).join(' \u00b7 ');

  return (
    <div className={panelStyles.overlay} onClick={onClose}>
      <aside
        className={panelStyles.panel}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={panelStyles.header}>
          <div>
            <div className={styles.kindLabel}>{kind}</div>
            <h2 className={panelStyles.name}>{naam}</h2>
            {subtitel && <div className={panelStyles.role}>{subtitel}</div>}
          </div>
          <button
            type="button"
            className={panelStyles.closeBtn}
            onClick={onClose}
            aria-label="Sluiten"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className={panelStyles.subnav}>
          <button
            type="button"
            className={`${panelStyles.subnavBtn} ${tab === 'gegevens' ? panelStyles.subnavActive : ''}`}
            onClick={() => setTab('gegevens')}
          >
            Gegevens
          </button>
          <button
            type="button"
            className={`${panelStyles.subnavBtn} ${tab === 'log' ? panelStyles.subnavActive : ''}`}
            onClick={() => setTab('log')}
          >
            Log
          </button>
        </div>

        {tab === 'log' ? (
          <ActiviteitenLogTab
            contactId={record.id}
            contactType={type}
            contactNaam={naam}
            onChange={onActiviteitenChange}
          />
        ) : type === 'distributeur' ? (
          <DistributeurGegevens record={record} onUpdate={onUpdate} />
        ) : (
          <ConcurrentGegevens record={record} onUpdate={onUpdate} />
        )}
      </aside>
    </div>
  );
}
