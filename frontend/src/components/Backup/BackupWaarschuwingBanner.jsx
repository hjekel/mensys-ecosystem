import { useEffect, useState } from 'react';
import { exporteerBackup, getLaatsteBackupDatum } from '../../utils/backup.js';
import styles from './BackupWaarschuwingBanner.module.css';

const DISMISS_KEY = 'mensys_backup_banner_dismissed_tot';
const DAY_MS = 24 * 60 * 60 * 1000;

function leesDismissTot() {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return 0;
    const parsed = JSON.parse(raw);
    if (typeof parsed === 'number') return parsed;
    if (parsed && typeof parsed.tot === 'number') return parsed.tot;
    return 0;
  } catch {
    return 0;
  }
}

function schrijfDismissTot(timestamp) {
  try {
    localStorage.setItem(DISMISS_KEY, JSON.stringify({ tot: timestamp }));
  } catch (err) {
    console.warn('[backup] kon dismiss-timestamp niet opslaan', err);
  }
}

function dagenGeleden(iso) {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return null;
  return Math.floor((Date.now() - t) / DAY_MS);
}

export default function BackupWaarschuwingBanner() {
  const [laatsteBackup, setLaatsteBackup] = useState(() => getLaatsteBackupDatum());
  const [dismissedTot, setDismissedTot] = useState(() => leesDismissTot());
  const [melding, setMelding] = useState(null);

  useEffect(() => {
    if (melding) {
      const t = setTimeout(() => setMelding(null), 3500);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [melding]);

  const dagen = dagenGeleden(laatsteBackup);
  const nuMs = Date.now();
  const isGedismist = dismissedTot > nuMs;

  let niveau = null;
  if (dagen === null) {
    niveau = 'rood';
  } else if (dagen > 7) {
    niveau = 'amber';
  }

  if (melding) {
    return <div className={styles.melding}>{melding}</div>;
  }

  if (!niveau || isGedismist) return null;

  function handleExport() {
    try {
      const rapport = exporteerBackup();
      setLaatsteBackup(rapport.exportedAt);
      setMelding(`Backup geexporteerd: ${rapport.bestandsnaam}`);
    } catch (err) {
      console.error(err);
      setMelding(`Export faalde: ${err?.message || err}`);
    }
  }

  function handleDismiss() {
    const tot = nuMs + DAY_MS;
    schrijfDismissTot(tot);
    setDismissedTot(tot);
  }

  const bannerClass = niveau === 'rood' ? styles.rood : styles.amber;
  const tekst = niveau === 'rood'
    ? 'Je hebt nog geen backup gemaakt. Exporteer nu een backup om dataverlies te voorkomen.'
    : `Laatste backup is ${dagen} dagen geleden. Tijd voor een nieuwe backup.`;

  return (
    <div className={`${styles.banner} ${bannerClass}`} role="alert">
      <div className={styles.icoon} aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeLinejoin="round" />
          <line x1="12" y1="9" x2="12" y2="13" strokeLinecap="round" />
          <line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round" />
        </svg>
      </div>
      <div className={styles.tekst}>{tekst}</div>
      <button type="button" className={styles.actieBtn} onClick={handleExport}>
        Exporteer backup
      </button>
      <button
        type="button"
        className={styles.dismissBtn}
        onClick={handleDismiss}
        aria-label="Banner 24 uur verbergen"
        title="24 uur verbergen"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
