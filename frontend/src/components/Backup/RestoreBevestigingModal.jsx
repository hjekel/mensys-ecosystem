import { useMemo, useState } from 'react';
import Modal from '../Modal.jsx';
import {
  RESTORE_CATEGORIEEN,
  analyseerBackup,
  analyseerHuidigeData,
  importeerBackup,
} from '../../utils/backup.js';
import styles from './RestoreBevestigingModal.module.css';

function formatteerDatum(iso) {
  if (!iso) return 'onbekend';
  try {
    return new Date(iso).toLocaleString('nl-NL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function Rij({ label, backup, huidig, accent }) {
  return (
    <div className={styles.vergelijkRij}>
      <span className={styles.vergelijkLabel}>{label}</span>
      <span className={styles.vergelijkBackup}>
        {backup.toLocaleString('nl-NL')}
      </span>
      <span className={styles.vergelijkArrow} aria-hidden="true">&rarr;</span>
      <span className={`${styles.vergelijkHuidig} ${accent ? styles.vergelijkDiff : ''}`}>
        {huidig.toLocaleString('nl-NL')}
      </span>
    </div>
  );
}

export default function RestoreBevestigingModal({ open, payload, versieOud, onClose, onImported }) {
  const [gekozen, setGekozen] = useState(() => RESTORE_CATEGORIEEN.map((c) => c.key));
  const [bezig, setBezig] = useState(false);

  const stats = useMemo(() => analyseerBackup(payload), [payload]);
  const huidig = useMemo(() => analyseerHuidigeData(), []);

  function toggle(key) {
    setGekozen((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }

  function handleBevestig() {
    if (gekozen.length === 0) return;
    setBezig(true);
    try {
      const rapport = importeerBackup(payload, gekozen);
      onImported(rapport);
    } finally {
      setBezig(false);
    }
  }

  return (
    <Modal open={open} title="Backup importeren" onClose={bezig ? () => {} : onClose} size="lg">
      <div className={styles.body}>
        <div className={styles.waarschuwingKop}>
          Je staat op het punt de huidige data te overschrijven.
        </div>

        <div className={styles.datumRegel}>
          Backup geexporteerd op: <strong>{formatteerDatum(stats.exportedAt)}</strong>
          {versieOud && (
            <span className={styles.versieWaarschuwing}>
              Let op: dit is een backup van een oudere versie (v{stats.version}). Importeer op eigen risico.
            </span>
          )}
        </div>

        <div className={styles.vergelijk}>
          <div className={styles.vergelijkKop}>
            <span />
            <span>In backup</span>
            <span aria-hidden="true" />
            <span>Nu in app</span>
          </div>
          <Rij label="Inkopers" backup={stats.aantalInkopers} huidig={huidig.aantalInkopers} accent={stats.aantalInkopers !== huidig.aantalInkopers} />
          <Rij label="CEO & MD" backup={stats.aantalCeos} huidig={huidig.aantalCeos} accent={stats.aantalCeos !== huidig.aantalCeos} />
          <Rij label="Resellers" backup={stats.aantalResellers} huidig={huidig.aantalResellers} accent={stats.aantalResellers !== huidig.aantalResellers} />
          <Rij label="Activiteiten" backup={stats.aantalActiviteiten} huidig={huidig.aantalActiviteiten} accent={stats.aantalActiviteiten !== huidig.aantalActiviteiten} />
          <Rij label="To-do's" backup={stats.aantalTodos} huidig={huidig.aantalTodos} accent={stats.aantalTodos !== huidig.aantalTodos} />
          <Rij label="Concurrenten" backup={stats.aantalConcurrenten} huidig={huidig.aantalConcurrenten} accent={stats.aantalConcurrenten !== huidig.aantalConcurrenten} />
        </div>

        <div className={styles.categorieBlok}>
          <div className={styles.categorieTitel}>Wat wil je importeren?</div>
          <div className={styles.categorieLijst}>
            {RESTORE_CATEGORIEEN.map((cat) => (
              <label key={cat.key} className={styles.categorieRij}>
                <input
                  type="checkbox"
                  checked={gekozen.includes(cat.key)}
                  onChange={() => toggle(cat.key)}
                />
                <span>{cat.label}</span>
              </label>
            ))}
          </div>
          {stats.heeftApiKey && gekozen.includes('overig') && (
            <div className={styles.apiKeyInfo}>
              Backup bevat een Anthropic API-key. Door &quot;Overige&quot; aangevinkt te laten wordt deze geimporteerd.
            </div>
          )}
        </div>

        <div className={styles.destructief}>
          Deze actie kan niet ongedaan worden gemaakt. Exporteer eerst je huidige data als je niet zeker bent.
        </div>

        <div className={styles.voet}>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClose}
            disabled={bezig}
          >
            Annuleer
          </button>
          <button
            type="button"
            className={styles.destructiefBtn}
            onClick={handleBevestig}
            disabled={bezig || gekozen.length === 0}
          >
            {bezig ? 'Bezig...' : 'Importeer en overschrijf'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
