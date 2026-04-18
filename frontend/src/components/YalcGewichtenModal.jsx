import { useEffect, useMemo, useState } from 'react';
import Modal from './Modal.jsx';
import {
  DEFAULT_GEWICHTEN,
  GEWICHT_KEYS,
  GEWICHT_LABELS,
  GEWICHT_UITLEG,
  resetGewichten,
  saveGewichten,
  totaalGewichten,
} from '../utils/yalcInstellingen.js';
import styles from './YalcGewichtenModal.module.css';

export default function YalcGewichtenModal({ open, gewichten, onClose, onSave }) {
  const [form, setForm] = useState(gewichten || DEFAULT_GEWICHTEN);

  useEffect(() => {
    if (open) setForm(gewichten || DEFAULT_GEWICHTEN);
  }, [open, gewichten]);

  const total = useMemo(() => totaalGewichten(form), [form]);
  const afwijking = total - 100;

  function update(key, value) {
    const n = Math.max(0, Math.min(30, Number(value) || 0));
    setForm((f) => ({ ...f, [key]: n }));
  }

  function handleSave() {
    const saved = saveGewichten(form);
    onSave(saved);
  }

  function handleReset() {
    const reset = resetGewichten();
    setForm(reset);
    onSave(reset);
  }

  return (
    <Modal
      open={open}
      title="Scoringsregels aanpassen"
      onClose={onClose}
      size="lg"
    >
      <p className={styles.intro}>
        Stel de punten per criterium in voor inkopers (0 tot 30 per
        criterium). Elk contact krijgt maximaal de som van alle gewichten
        aan punten. Streef naar een totaal van 100 zodat scores vergelijkbaar
        blijven met de standaard-YALC bands (Hot 80+, Warm 60-79, Lauw
        40-59, Koud onder 40).
      </p>

      <div className={styles.list}>
        {GEWICHT_KEYS.map((key) => (
          <div key={key} className={styles.row}>
            <div className={styles.rowHead}>
              <span className={styles.label}>{GEWICHT_LABELS[key]}</span>
              <span className={styles.value}>{form[key] ?? 0}</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              step="1"
              value={form[key] ?? 0}
              onChange={(e) => update(key, e.target.value)}
              className={styles.slider}
            />
            <div className={styles.uitleg}>{GEWICHT_UITLEG[key]}</div>
          </div>
        ))}
      </div>

      <div
        className={`${styles.totalBox} ${
          afwijking === 0
            ? styles.totalOk
            : Math.abs(afwijking) > 10
              ? styles.totalWarn
              : styles.totalNudge
        }`}
      >
        <div className={styles.totalValue}>
          Totaal: <strong>{total}</strong> / 100
        </div>
        {afwijking === 0 && <span className={styles.totalMsg}>Perfect in balans.</span>}
        {afwijking > 0 && afwijking <= 10 && (
          <span className={styles.totalMsg}>{afwijking} punten boven 100. Scores kunnen boven 100 uitkomen.</span>
        )}
        {afwijking < 0 && afwijking >= -10 && (
          <span className={styles.totalMsg}>{Math.abs(afwijking)} punten onder 100. Maximale score wordt lager dan 100.</span>
        )}
        {afwijking > 10 && (
          <span className={styles.totalMsg}>Totaal ver boven 100 ({afwijking} te veel). Overweeg de balans te herzien.</span>
        )}
        {afwijking < -10 && (
          <span className={styles.totalMsg}>Totaal ver onder 100 ({Math.abs(afwijking)} te weinig). Scores blijven laag.</span>
        )}
      </div>

      <div className={styles.footer}>
        <button type="button" className="btn btn-ghost" onClick={handleReset}>
          Reset naar standaard
        </button>
        <button type="button" className="btn btn-ghost" onClick={onClose}>
          Annuleren
        </button>
        <button type="button" className="btn btn-primary" onClick={handleSave}>
          Opslaan
        </button>
      </div>
    </Modal>
  );
}
