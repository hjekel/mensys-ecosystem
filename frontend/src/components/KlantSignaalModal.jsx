import { useEffect, useState } from 'react';
import Modal from './Modal.jsx';
import {
  KLANTSIGNAAL_STATUSES,
  KLANTSIGNAAL_BRONNEN,
} from '../store/klantsignalenStore.js';
import styles from './ContactFormModal.module.css';

const EMPTY = {
  bedrijfsnaam: '',
  concurrent: '',
  bron: 'LinkedIn post',
  bronDetail: '',
  redenOntevredenheid: '',
  contactpersoon: '',
  contactLinkedin: '',
  status: 'Signaal',
  notities: '',
};

export default function KlantSignaalModal({ open, initial, concurrenten = [], onClose, onSave }) {
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
    if (!form.bedrijfsnaam.trim()) errs.bedrijfsnaam = 'Bedrijfsnaam is verplicht';
    if (!form.concurrent.trim()) errs.concurrent = 'Concurrent is verplicht';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    onSave(form);
  }

  return (
    <Modal
      open={open}
      title={initial?.id ? 'Klantsignaal bewerken' : 'Klantsignaal toevoegen'}
      onClose={onClose}
      size="md"
    >
      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.field}>
          <span className={styles.label}>Bedrijfsnaam</span>
          <input
            className="input"
            value={form.bedrijfsnaam}
            onChange={(e) => update('bedrijfsnaam', e.target.value)}
            placeholder="Bedrijf dat ontevreden is"
          />
          {errors.bedrijfsnaam && <span className={styles.error}>{errors.bedrijfsnaam}</span>}
        </label>

        <div className={styles.row2}>
          <label className={styles.field}>
            <span className={styles.label}>Concurrent</span>
            <select
              className="input select"
              value={form.concurrent}
              onChange={(e) => update('concurrent', e.target.value)}
            >
              <option value="">Kies concurrent</option>
              {concurrenten.map((c) => (
                <option key={c.id} value={c.naam}>{c.naam}</option>
              ))}
            </select>
            {errors.concurrent && <span className={styles.error}>{errors.concurrent}</span>}
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Bron</span>
            <select
              className="input select"
              value={form.bron}
              onChange={(e) => update('bron', e.target.value)}
            >
              {KLANTSIGNAAL_BRONNEN.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </label>
        </div>

        <label className={styles.field}>
          <span className={styles.label}>Bron detail</span>
          <input
            className="input"
            value={form.bronDetail}
            onChange={(e) => update('bronDetail', e.target.value)}
            placeholder="Bijvoorbeeld: via Jan de Vries bij ALSO"
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Reden ontevredenheid</span>
          <textarea
            className={`input ${styles.textarea}`}
            rows={3}
            value={form.redenOntevredenheid}
            onChange={(e) => update('redenOntevredenheid', e.target.value)}
          />
        </label>

        <div className={styles.row2}>
          <label className={styles.field}>
            <span className={styles.label}>Contactpersoon</span>
            <input
              className="input"
              value={form.contactpersoon}
              onChange={(e) => update('contactpersoon', e.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>LinkedIn URL</span>
            <input
              className="input"
              value={form.contactLinkedin}
              onChange={(e) => update('contactLinkedin', e.target.value)}
              placeholder="https://linkedin.com/in/..."
            />
          </label>
        </div>

        <label className={styles.field}>
          <span className={styles.label}>Status</span>
          <select
            className="input select"
            value={form.status}
            onChange={(e) => update('status', e.target.value)}
          >
            {KLANTSIGNAAL_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Notities</span>
          <textarea
            className={`input ${styles.textarea}`}
            rows={3}
            value={form.notities}
            onChange={(e) => update('notities', e.target.value)}
          />
        </label>

        <div className={styles.footer}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Annuleren</button>
          <button type="submit" className="btn btn-primary">Opslaan</button>
        </div>
      </form>
    </Modal>
  );
}
