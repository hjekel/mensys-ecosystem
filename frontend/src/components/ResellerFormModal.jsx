import { useEffect, useState } from 'react';
import Modal from './Modal.jsx';
import styles from './ContactFormModal.module.css';
import {
  RESELLER_STATUSES,
  RESELLER_TYPES,
  RESELLER_FTE_RANGES,
  MENSYS_FIT_SCORES,
} from '@shared/constants.js';

const EMPTY = {
  bedrijf: '',
  voornaam: '',
  achternaam: '',
  functietitel: '',
  email: '',
  linkedin: '',
  fteRange: '',
  resellerType: 'Nader te bepalen',
  mensysFit: 'Onbekend',
  bron: '',
  locatie: '',
  website: '',
  status: 'Nieuw',
  keywords: '',
  notities: '',
};

export default function ResellerFormModal({ open, initial, onClose, onSave }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...EMPTY, ...initial } : { ...EMPTY });
      setErrors({});
    }
  }, [open, initial]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = {};
    if (!form.bedrijf.trim()) errs.bedrijf = 'Bedrijf is verplicht';
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) {
      errs.email = 'Ongeldig email adres';
    }
    if (form.keywords && form.keywords.length > 200) {
      errs.keywords = 'Maximaal 200 tekens';
    }
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    onSave(form);
  }

  return (
    <Modal
      open={open}
      title={initial?.id ? 'Reseller bewerken' : 'Reseller toevoegen'}
      onClose={onClose}
      size="lg"
    >
      <form className={styles.form} onSubmit={handleSubmit}>
        <Field label="Bedrijf" error={errors.bedrijf}>
          <input
            className="input"
            value={form.bedrijf}
            onChange={(e) => update('bedrijf', e.target.value)}
          />
        </Field>

        <div className={styles.row2}>
          <Field label="Voornaam">
            <input
              className="input"
              value={form.voornaam}
              onChange={(e) => update('voornaam', e.target.value)}
            />
          </Field>
          <Field label="Achternaam">
            <input
              className="input"
              value={form.achternaam}
              onChange={(e) => update('achternaam', e.target.value)}
            />
          </Field>
        </div>

        <Field label="Functietitel">
          <input
            className="input"
            value={form.functietitel}
            onChange={(e) => update('functietitel', e.target.value)}
          />
        </Field>

        <div className={styles.row2}>
          <Field label="Email" error={errors.email}>
            <input
              type="email"
              className="input"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
            />
          </Field>
          <Field label="LinkedIn URL">
            <input
              className="input"
              placeholder="https://www.linkedin.com/in/..."
              value={form.linkedin}
              onChange={(e) => update('linkedin', e.target.value)}
            />
          </Field>
        </div>

        <div className={styles.row2}>
          <Field label="Reseller Type">
            <select
              className="input select"
              value={form.resellerType}
              onChange={(e) => update('resellerType', e.target.value)}
            >
              {RESELLER_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="FTE Range">
            <select
              className="input select"
              value={form.fteRange}
              onChange={(e) => update('fteRange', e.target.value)}
            >
              <option value="">Onbekend</option>
              {RESELLER_FTE_RANGES.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </Field>
        </div>

        <div className={styles.row2}>
          <Field label="Mensys Fit">
            <select
              className="input select"
              value={form.mensysFit}
              onChange={(e) => update('mensysFit', e.target.value)}
            >
              {MENSYS_FIT_SCORES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <select
              className="input select"
              value={form.status}
              onChange={(e) => update('status', e.target.value)}
            >
              {RESELLER_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
        </div>

        <div className={styles.row2}>
          <Field label="Locatie">
            <input
              className="input"
              value={form.locatie}
              onChange={(e) => update('locatie', e.target.value)}
            />
          </Field>
          <Field label="Website">
            <input
              className="input"
              value={form.website}
              onChange={(e) => update('website', e.target.value)}
            />
          </Field>
        </div>

        <Field label="Bron">
          <input
            className="input"
            value={form.bron}
            onChange={(e) => update('bron', e.target.value)}
          />
        </Field>

        <Field label="Keywords (max 200 tekens)" error={errors.keywords}>
          <input
            className="input"
            maxLength={200}
            value={form.keywords}
            onChange={(e) => update('keywords', e.target.value)}
          />
        </Field>

        <Field label="Notities">
          <textarea
            className={`input ${styles.textarea}`}
            rows={4}
            value={form.notities}
            onChange={(e) => update('notities', e.target.value)}
          />
        </Field>

        <div className={styles.footer}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Annuleren
          </button>
          <button type="submit" className="btn btn-primary">
            Opslaan
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Field({ label, error, children }) {
  return (
    <label className={styles.field}>
      <span className={styles.label}>{label}</span>
      {children}
      {error && <span className={styles.error}>{error}</span>}
    </label>
  );
}
