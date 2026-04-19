import { useEffect, useMemo, useState } from 'react';
import Modal from '../Modal.jsx';
import {
  ACTIVITEIT_TYPES,
  TYPE_LABELS,
  RICHTINGEN,
  RICHTING_LABELS,
  STANDAARD_UITVOERDERS,
  defaultUitvoerder,
} from '../../utils/activiteitenUtils.js';
import styles from './ActiviteitToevoegModal.module.css';

const MAX_KORT = 80;

function nuDatetimeLocal() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toLocalInput(iso) {
  if (!iso) return nuDatetimeLocal();
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return nuDatetimeLocal();
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return nuDatetimeLocal();
  }
}

export default function ActiviteitToevoegModal({
  open,
  initial,
  onClose,
  onSave,
}) {
  const defaults = useMemo(() => ({
    type: 'linkedin_bericht',
    datum: nuDatetimeLocal(),
    richting: 'uitgaand',
    uitvoerder: defaultUitvoerder(),
    kort: '',
    lang: '',
  }), []);

  const [form, setForm] = useState(defaults);
  const [errors, setErrors] = useState({});
  const [custom, setCustom] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setForm({
        type: initial.type || 'linkedin_bericht',
        datum: toLocalInput(initial.datum),
        richting: initial.richting || 'uitgaand',
        uitvoerder: initial.uitvoerder || defaultUitvoerder(),
        kort: initial.kort || '',
        lang: initial.lang || '',
      });
      setCustom(Boolean(initial.uitvoerder) && !STANDAARD_UITVOERDERS.includes(initial.uitvoerder));
    } else {
      setForm({ ...defaults, uitvoerder: defaultUitvoerder() });
      setCustom(false);
    }
    setErrors({});
  }, [open, initial, defaults]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = {};
    const kort = form.kort.trim();
    if (!kort) errs.kort = 'Korte omschrijving is verplicht';
    if (kort.length > MAX_KORT) errs.kort = `Max ${MAX_KORT} tekens`;
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    const datumIso = form.datum
      ? new Date(form.datum).toISOString()
      : new Date().toISOString();
    onSave({
      ...form,
      kort,
      lang: form.lang.trim(),
      datum: datumIso,
    });
  }

  return (
    <Modal
      open={open}
      title={initial?.id ? 'Activiteit bewerken' : 'Nieuwe activiteit'}
      onClose={onClose}
      size="md"
    >
      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.field}>
          <span className={styles.label}>Type</span>
          <select
            className="input select"
            value={form.type}
            onChange={(e) => update('type', e.target.value)}
          >
            {ACTIVITEIT_TYPES.map((t) => (
              <option key={t} value={t}>{TYPE_LABELS[t]}</option>
            ))}
          </select>
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Datum en tijd</span>
          <input
            type="datetime-local"
            className="input"
            value={form.datum}
            onChange={(e) => update('datum', e.target.value)}
          />
        </label>

        <div className={styles.field}>
          <span className={styles.label}>Richting</span>
          <div className={styles.radioRow}>
            {RICHTINGEN.map((r) => (
              <label key={r} className={styles.radioLabel}>
                <input
                  type="radio"
                  name="richting"
                  value={r}
                  checked={form.richting === r}
                  onChange={() => update('richting', r)}
                />
                <span>{RICHTING_LABELS[r]}</span>
              </label>
            ))}
          </div>
        </div>

        <div className={styles.field}>
          <span className={styles.label}>Uitvoerder</span>
          <div className={styles.radioRow}>
            {STANDAARD_UITVOERDERS.map((u) => (
              <label key={u} className={styles.radioLabel}>
                <input
                  type="radio"
                  name="uitvoerder"
                  value={u}
                  checked={!custom && form.uitvoerder === u}
                  onChange={() => {
                    setCustom(false);
                    update('uitvoerder', u);
                  }}
                />
                <span>{u}</span>
              </label>
            ))}
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="uitvoerder"
                checked={custom}
                onChange={() => {
                  setCustom(true);
                  update('uitvoerder', '');
                }}
              />
              <span>Anders</span>
            </label>
          </div>
          {custom && (
            <input
              className={`input ${styles.customInput}`}
              placeholder="Naam uitvoerder"
              value={form.uitvoerder}
              onChange={(e) => update('uitvoerder', e.target.value)}
            />
          )}
        </div>

        <label className={styles.field}>
          <span className={styles.label}>
            Korte omschrijving
            <span className={styles.counter}>{form.kort.length}/{MAX_KORT}</span>
          </span>
          <input
            className="input"
            maxLength={MAX_KORT}
            placeholder="Bijv: DM verstuurd met opener over slapend M365-contract"
            value={form.kort}
            onChange={(e) => update('kort', e.target.value)}
          />
          {errors.kort && <span className={styles.error}>{errors.kort}</span>}
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Volledige tekst (optioneel)</span>
          <textarea
            className={`input ${styles.textarea}`}
            rows={5}
            placeholder="Volledige inhoud van het bericht, notities uit het gesprek, of extra context"
            value={form.lang}
            onChange={(e) => update('lang', e.target.value)}
          />
        </label>

        <div className={styles.footer}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Annuleer
          </button>
          <button type="submit" className="btn btn-primary">
            Opslaan
          </button>
        </div>
      </form>
    </Modal>
  );
}
