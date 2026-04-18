import { useEffect, useState } from 'react';
import Modal from './Modal.jsx';
import { DEFAULT_INSTELLINGEN } from '../utils/instellingen.js';
import styles from './InstellingenModal.module.css';

export default function InstellingenModal({ open, instellingen, onClose, onSave }) {
  const [form, setForm] = useState(instellingen || DEFAULT_INSTELLINGEN);

  useEffect(() => {
    if (open) setForm(instellingen || DEFAULT_INSTELLINGEN);
  }, [open, instellingen]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave(form);
  }

  function resetDefaults() {
    setForm({ ...DEFAULT_INSTELLINGEN });
  }

  return (
    <Modal open={open} title="Instellingen" onClose={onClose} size="md">
      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.field}>
          <span className={styles.label}>Bedrijfsnaam</span>
          <input
            type="text"
            className="input"
            value={form.bedrijfsnaam}
            onChange={(e) => update('bedrijfsnaam', e.target.value)}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Propositie-zin</span>
          <textarea
            className={`input ${styles.textarea}`}
            rows={3}
            value={form.propositie}
            onChange={(e) => update('propositie', e.target.value)}
          />
          <span className={styles.hint}>Getoond in de banner bovenaan de app.</span>
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Gebruikersnaam</span>
          <input
            type="text"
            className="input"
            placeholder="Bijvoorbeeld Henk"
            value={form.gebruikersnaam}
            onChange={(e) => update('gebruikersnaam', e.target.value)}
          />
          <span className={styles.hint}>Voor personalisatie (optioneel).</span>
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Logo-kleur</span>
          <div className={styles.colorRow}>
            <input
              type="color"
              className={styles.colorPicker}
              value={form.logoKleur}
              onChange={(e) => update('logoKleur', e.target.value)}
            />
            <input
              type="text"
              className={`input ${styles.colorHex}`}
              value={form.logoKleur}
              onChange={(e) => update('logoKleur', e.target.value)}
              placeholder="#003087"
            />
          </div>
          <span className={styles.hint}>
            Default: #003087. Wijziging beinvloedt alleen de propositie-banner.
          </span>
        </label>

        <div className={styles.footer}>
          <button type="button" className="btn btn-ghost" onClick={resetDefaults}>
            Herstel naar standaard
          </button>
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
