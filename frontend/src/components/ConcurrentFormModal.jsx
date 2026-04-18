import { useEffect, useState } from 'react';
import Modal from './Modal.jsx';
import { CONCURRENT_CATEGORIEEN, CONCURRENT_SCOPES } from '../store/concurrentenStore.js';
import styles from './ContactFormModal.module.css';

const EMPTY = {
  naam: '',
  website: '',
  linkedinUrl: '',
  hq: '',
  scope: 'NL',
  categorie: 'Directe concurrent',
  propositie: '',
  sterktes: '',
  zwaktes: '',
  klantsegment: '',
  coopetitie: false,
  coopetitieIdee: '',
  notities: '',
};

function toForm(c) {
  if (!c) return { ...EMPTY };
  return {
    ...EMPTY,
    ...c,
    sterktes: Array.isArray(c.sterktes) ? c.sterktes.join('\n') : (c.sterktes || ''),
    zwaktes: Array.isArray(c.zwaktes) ? c.zwaktes.join('\n') : (c.zwaktes || ''),
  };
}

function fromForm(f) {
  return {
    ...f,
    sterktes: String(f.sterktes || '').split('\n').map((s) => s.trim()).filter(Boolean),
    zwaktes: String(f.zwaktes || '').split('\n').map((s) => s.trim()).filter(Boolean),
  };
}

export default function ConcurrentFormModal({ open, initial, onClose, onSave }) {
  const [form, setForm] = useState(() => toForm(initial));
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(toForm(initial));
      setErrors({});
    }
  }, [open, initial]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = {};
    if (!form.naam.trim()) errs.naam = 'Naam is verplicht';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    onSave(fromForm(form));
  }

  return (
    <Modal
      open={open}
      title={initial?.id ? 'Concurrent bewerken' : 'Concurrent toevoegen'}
      onClose={onClose}
      size="lg"
    >
      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.field}>
          <span className={styles.label}>Naam</span>
          <input className="input" value={form.naam} onChange={(e) => update('naam', e.target.value)} />
          {errors.naam && <span className={styles.error}>{errors.naam}</span>}
        </label>

        <div className={styles.row2}>
          <label className={styles.field}>
            <span className={styles.label}>Website</span>
            <input className="input" value={form.website} onChange={(e) => update('website', e.target.value)} />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>LinkedIn URL</span>
            <input className="input" value={form.linkedinUrl} onChange={(e) => update('linkedinUrl', e.target.value)} />
          </label>
        </div>

        <div className={styles.row2}>
          <label className={styles.field}>
            <span className={styles.label}>HQ</span>
            <input className="input" value={form.hq} onChange={(e) => update('hq', e.target.value)} />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Scope</span>
            <select className="input select" value={form.scope} onChange={(e) => update('scope', e.target.value)}>
              {CONCURRENT_SCOPES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
        </div>

        <label className={styles.field}>
          <span className={styles.label}>Categorie</span>
          <select className="input select" value={form.categorie} onChange={(e) => update('categorie', e.target.value)}>
            {CONCURRENT_CATEGORIEEN.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Propositie (max 300 tekens)</span>
          <textarea
            className={`input ${styles.textarea}`}
            rows={3}
            maxLength={300}
            value={form.propositie}
            onChange={(e) => update('propositie', e.target.value)}
          />
        </label>

        <div className={styles.row2}>
          <label className={styles.field}>
            <span className={styles.label}>Sterktes (per regel)</span>
            <textarea
              className={`input ${styles.textarea}`}
              rows={4}
              value={form.sterktes}
              onChange={(e) => update('sterktes', e.target.value)}
            />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Zwaktes vs Mensys (per regel)</span>
            <textarea
              className={`input ${styles.textarea}`}
              rows={4}
              value={form.zwaktes}
              onChange={(e) => update('zwaktes', e.target.value)}
            />
          </label>
        </div>

        <label className={styles.field}>
          <span className={styles.label}>Klantsegment</span>
          <input className="input" value={form.klantsegment} onChange={(e) => update('klantsegment', e.target.value)} />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>
            <input
              type="checkbox"
              checked={form.coopetitie}
              onChange={(e) => update('coopetitie', e.target.checked)}
              style={{ marginRight: 6 }}
            />
            Coopetitie-kans
          </span>
        </label>

        {form.coopetitie && (
          <label className={styles.field}>
            <span className={styles.label}>Coopetitie-idee</span>
            <textarea
              className={`input ${styles.textarea}`}
              rows={3}
              value={form.coopetitieIdee}
              onChange={(e) => update('coopetitieIdee', e.target.value)}
            />
          </label>
        )}

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
