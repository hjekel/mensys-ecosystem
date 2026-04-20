import { useMemo, useState } from 'react';
import Modal from '../Modal.jsx';
import TypeIcon from '../ActiviteitenLog/TypeIcon.jsx';
import ActiviteitEntry from '../ActiviteitenLog/ActiviteitEntry.jsx';
import { RICHTING_COLORS, TYPE_LABELS, relatieveDatum } from '../../utils/activiteitenUtils.js';
import { getAlleActiviteiten } from '../../store/activiteitenStore.js';
import styles from './ActiviteitFeed.module.css';

function voornaamUit(naam) {
  if (!naam) return '';
  return String(naam).split(/\s+/)[0];
}

function Rij({ activiteit, onOpen }) {
  const kleur = RICHTING_COLORS[activiteit.richting] || RICHTING_COLORS.intern;
  const voornaam = voornaamUit(activiteit.contactNaam);
  const typeLabel = TYPE_LABELS[activiteit.type] || activiteit.type;
  const tekst = [voornaam, activiteit.kort || typeLabel].filter(Boolean).join(': ');
  return (
    <button
      type="button"
      className={styles.rij}
      onClick={() => onOpen(activiteit)}
    >
      <div className={styles.icoon} style={{ color: kleur }} title={typeLabel}>
        <TypeIcon type={activiteit.type} size={16} />
      </div>
      <div className={styles.tekst}>{tekst}</div>
      <div className={styles.datum}>{relatieveDatum(activiteit.datum)}</div>
    </button>
  );
}

export default function ActiviteitFeed({ tick, onOpenContact }) {
  const [alleOpen, setAlleOpen] = useState(false);

  const feed = useMemo(() => {
    // tick wordt bewust als dep gelezen
    void tick;
    return getAlleActiviteiten(20);
  }, [tick]);

  const volledig = useMemo(() => {
    if (!alleOpen) return [];
    void tick;
    return getAlleActiviteiten();
  }, [alleOpen, tick]);

  return (
    <div className={styles.wrap}>
      <div className={styles.kop}>
        <h3 className={styles.titel}>Recente activiteit</h3>
      </div>

      {feed.length === 0 ? (
        <div className={styles.leeg}>Nog geen activiteiten vastgelegd.</div>
      ) : (
        <div className={styles.lijst}>
          {feed.map((a) => (
            <Rij key={a.id} activiteit={a} onOpen={(act) => onOpenContact && onOpenContact(act)} />
          ))}
        </div>
      )}

      <button type="button" className={styles.alleBtn} onClick={() => setAlleOpen(true)}>
        Bekijk alle activiteiten
      </button>

      <Modal
        open={alleOpen}
        title={`Alle activiteiten (${volledig.length})`}
        onClose={() => setAlleOpen(false)}
        size="lg"
      >
        {volledig.length === 0 ? (
          <div className={styles.leeg}>Nog geen activiteiten vastgelegd.</div>
        ) : (
          <div className={styles.alleLijst}>
            {volledig.map((a) => (
              <ActiviteitEntry key={a.id} activiteit={a} readonly />
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
