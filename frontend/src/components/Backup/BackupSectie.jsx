import { useRef, useState } from 'react';
import {
  exporteerBackup,
  getLaatsteBackupDatum,
  parseBackupBestand,
  valideerBackup,
} from '../../utils/backup.js';
import RestoreBevestigingModal from './RestoreBevestigingModal.jsx';
import styles from './BackupSectie.module.css';

function formatteerBackupDatum(iso) {
  if (!iso) return 'nog nooit';
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

export default function BackupSectie() {
  const [laatsteBackup, setLaatsteBackup] = useState(() => getLaatsteBackupDatum());
  const [melding, setMelding] = useState(null);
  const [fout, setFout] = useState(null);
  const [restoreModal, setRestoreModal] = useState(null);
  const fileInputRef = useRef(null);

  function toonMelding(tekst) {
    setMelding(tekst);
    setFout(null);
    setTimeout(() => setMelding((m) => (m === tekst ? null : m)), 4000);
  }

  function toonFout(tekst) {
    setFout(tekst);
    setMelding(null);
    setTimeout(() => setFout((f) => (f === tekst ? null : f)), 6000);
  }

  function handleExport() {
    try {
      const rapport = exporteerBackup();
      setLaatsteBackup(rapport.exportedAt);
      const extra = rapport.overgeslagen.length > 0
        ? ` (${rapport.overgeslagen.length} key(s) overgeslagen)`
        : '';
      toonMelding(`Backup geexporteerd: ${rapport.bestandsnaam}${extra}`);
    } catch (err) {
      console.error(err);
      toonFout(`Export faalde: ${err?.message || err}`);
    }
  }

  function kiesBestand() {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  }

  async function handleBestandGekozen(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const tekst = await file.text();
      const parse = parseBackupBestand(tekst);
      if (!parse.ok) {
        toonFout('Dit is geen geldig Mensys-backup bestand (JSON-parse faalde).');
        return;
      }
      const validatie = valideerBackup(parse.payload);
      if (!validatie.geldig) {
        console.error('[backup] validatie fouten', validatie.fouten);
        toonFout('Dit is geen geldig Mensys-backup bestand.');
        return;
      }
      setRestoreModal({ payload: parse.payload, validatie });
    } catch (err) {
      console.error(err);
      toonFout(`Kon bestand niet lezen: ${err?.message || err}`);
    }
  }

  return (
    <div className={styles.sectie}>
      <div className={styles.kop}>
        <span className={styles.titel}>Backup en Restore</span>
      </div>

      <p className={styles.uitleg}>
        Exporteer al je data (contacten, activiteiten, to-do&apos;s, instellingen) als JSON-bestand.
        Bewaar dit op een veilige plek. Importeer hetzelfde bestand op een andere laptop of na het wissen van je browser.
      </p>

      <div className={styles.laatste}>
        Laatste backup: <strong>{formatteerBackupDatum(laatsteBackup)}</strong>
      </div>

      <div className={styles.knoppen}>
        <button type="button" className={`btn btn-primary ${styles.btn}`} onClick={handleExport}>
          Export backup
        </button>
        <button type="button" className={`btn btn-ghost ${styles.btn}`} onClick={kiesBestand}>
          Import backup
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          className={styles.hiddenInput}
          onChange={handleBestandGekozen}
        />
      </div>

      <p className={styles.waarschuwing}>
        Let op: de backup bevat je Anthropic API-key als je die hebt ingesteld. Deel dit bestand niet met anderen.
      </p>

      {melding && <div className={styles.melding}>{melding}</div>}
      {fout && <div className={styles.fout}>{fout}</div>}

      {restoreModal && (
        <RestoreBevestigingModal
          open={Boolean(restoreModal)}
          payload={restoreModal.payload}
          versieOud={restoreModal.validatie.versieOud}
          onClose={() => setRestoreModal(null)}
          onImported={(rapport) => {
            setRestoreModal(null);
            if (!rapport.success) {
              toonFout('Import mislukt. Zie console voor details.');
              return;
            }
            const beschadigd = rapport.beschadigd.length;
            const extra = beschadigd > 0 ? ` (${beschadigd} items overgeslagen)` : '';
            toonMelding(`Backup geimporteerd${extra}. De pagina wordt herladen...`);
            setTimeout(() => {
              window.location.reload();
            }, 900);
          }}
        />
      )}
    </div>
  );
}
