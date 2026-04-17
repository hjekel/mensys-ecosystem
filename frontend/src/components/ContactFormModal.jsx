import { useEffect, useState } from 'react';
import Modal from './Modal.jsx';
import styles from './ContactFormModal.module.css';
import { SECTORS, FTE_CATEGORIES, STATUSES, PRIORITIES } from '@shared/constants.js';

const EMPTY = {
  firstName: '',
  lastName: '',
  jobTitle: '',
  company: '',
  sector: 'Overig',
  fteCategory: 'Onbekend',
  linkedinUrl: '',
  email: '',
  phone: '',
  status: 'Nieuw',
  priority: 'Middel',
  notes: '',
};

export default function ContactFormModal({ open, initial, onClose, onSave }) {
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
    if (!form.firstName.trim() && !form.lastName.trim()) {
      errs.firstName = 'Vul een voor- of achternaam in';
    }
    if (!form.company.trim()) errs.company = 'Bedrijf is verplicht';
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) {
      errs.email = 'Ongeldig email adres';
    }
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    onSave(form);
  }

  return (
    <Modal
      open={open}
      title={initial?.id ? 'Contact bewerken' : 'Contact toevoegen'}
      onClose={onClose}
      size="lg"
    >
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.row2}>
          <Field label="Voornaam" error={errors.firstName}>
            <input
              className="input"
              value={form.firstName}
              onChange={(e) => update('firstName', e.target.value)}
            />
          </Field>
          <Field label="Achternaam">
            <input
              className="input"
              value={form.lastName}
              onChange={(e) => update('lastName', e.target.value)}
            />
          </Field>
        </div>

        <Field label="Functietitel">
          <input
            className="input"
            value={form.jobTitle}
            onChange={(e) => update('jobTitle', e.target.value)}
          />
        </Field>

        <Field label="Bedrijf" error={errors.company}>
          <input
            className="input"
            value={form.company}
            onChange={(e) => update('company', e.target.value)}
          />
        </Field>

        <div className={styles.row2}>
          <Field label="Sector">
            <select
              className="input select"
              value={form.sector}
              onChange={(e) => update('sector', e.target.value)}
            >
              {SECTORS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="FTE categorie">
            <select
              className="input select"
              value={form.fteCategory}
              onChange={(e) => update('fteCategory', e.target.value)}
            >
              {FTE_CATEGORIES.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="LinkedIn URL">
          <input
            className="input"
            placeholder="https://www.linkedin.com/in/..."
            value={form.linkedinUrl}
            onChange={(e) => update('linkedinUrl', e.target.value)}
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
          <Field label="Telefoon">
            <input
              className="input"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
            />
          </Field>
        </div>

        <div className={styles.row2}>
          <Field label="Status">
            <select
              className="input select"
              value={form.status}
              onChange={(e) => update('status', e.target.value)}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Prioriteit">
            <select
              className="input select"
              value={form.priority}
              onChange={(e) => update('priority', e.target.value)}
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Notities">
          <textarea
            className={`input ${styles.textarea}`}
            rows={4}
            value={form.notes}
            onChange={(e) => update('notes', e.target.value)}
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
