import { useEffect, useMemo, useState } from 'react';
import Modal from '../Modal.jsx';
import styles from './TodoModal.module.css';

const PRIO_OPTIES = [
  { key: 'hoog', label: 'Hoog' },
  { key: 'midden', label: 'Midden' },
  { key: 'laag', label: 'Laag' },
];

function naamVan(record, contactType) {
  if (contactType === 'reseller') {
    const naam = `${record.voornaam || ''} ${record.achternaam || ''}`.trim();
    return naam || record.bedrijf || '(zonder naam)';
  }
  const naam = `${record.firstName || ''} ${record.lastName || ''}`.trim();
  return naam || record.company || '(zonder naam)';
}

function bedrijfVan(record, contactType) {
  if (contactType === 'reseller') return record.bedrijf || '';
  return record.company || '';
}

export default function TodoModal({
  open,
  initial,
  onClose,
  onSave,
  onDelete,
  contactPools = { inkopers: [], ceos: [], resellers: [] },
}) {
  const [tekst, setTekst] = useState('');
  const [prioriteit, setPrioriteit] = useState('midden');
  const [deadline, setDeadline] = useState('');
  const [notities, setNotities] = useState('');
  const [gekoppeldAan, setGekoppeldAan] = useState(null);
  const [zoek, setZoek] = useState('');
  const [toonZoekResultaten, setToonZoekResultaten] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setTekst(initial.tekst || '');
      setPrioriteit(initial.prioriteit || 'midden');
      setDeadline(initial.deadline ? initial.deadline.slice(0, 10) : '');
      setNotities(initial.notities || '');
      setGekoppeldAan(initial.gekoppeldAan || null);
    } else {
      setTekst('');
      setPrioriteit('midden');
      setDeadline('');
      setNotities('');
      setGekoppeldAan(null);
    }
    setZoek('');
    setToonZoekResultaten(false);
  }, [open, initial]);

  const alleContacten = useMemo(() => {
    const uit = [];
    for (const c of contactPools.inkopers || []) {
      uit.push({
        id: c.id,
        contactType: 'inkoper',
        naam: naamVan(c, 'inkoper'),
        bedrijf: bedrijfVan(c, 'inkoper'),
      });
    }
    for (const c of contactPools.ceos || []) {
      uit.push({
        id: c.id,
        contactType: 'ceo',
        naam: naamVan(c, 'ceo'),
        bedrijf: bedrijfVan(c, 'ceo'),
      });
    }
    for (const c of contactPools.resellers || []) {
      uit.push({
        id: c.id,
        contactType: 'reseller',
        naam: naamVan(c, 'reseller'),
        bedrijf: bedrijfVan(c, 'reseller'),
      });
    }
    return uit;
  }, [contactPools.inkopers, contactPools.ceos, contactPools.resellers]);

  const zoekResultaten = useMemo(() => {
    const q = zoek.trim().toLowerCase();
    if (!q || q.length < 2) return [];
    return alleContacten
      .filter((c) => {
        const hay = `${c.naam} ${c.bedrijf}`.toLowerCase();
        return hay.includes(q);
      })
      .slice(0, 15);
  }, [alleContacten, zoek]);

  const gekoppeldLabel = useMemo(() => {
    if (!gekoppeldAan) return '';
    const match = alleContacten.find(
      (c) => c.id === gekoppeldAan.contactId && c.contactType === gekoppeldAan.contactType,
    );
    if (!match) return `${gekoppeldAan.contactType} (niet gevonden)`;
    return `${match.naam}${match.bedrijf ? ` — ${match.bedrijf}` : ''}`;
  }, [alleContacten, gekoppeldAan]);

  function kiesContact(c) {
    setGekoppeldAan({ contactType: c.contactType, contactId: c.id });
    setZoek('');
    setToonZoekResultaten(false);
  }

  function verwijderKoppeling() {
    setGekoppeldAan(null);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = tekst.trim();
    if (!trimmed) return;
    onSave({
      id: initial?.id,
      tekst: trimmed,
      prioriteit,
      deadline: deadline ? new Date(`${deadline}T12:00:00`).toISOString() : '',
      notities: notities.trim(),
      gekoppeldAan,
    });
  }

  return (
    <Modal
      open={open}
      title={initial?.id ? 'Actie bewerken' : 'Nieuwe actie'}
      onClose={onClose}
      size="md"
    >
      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.field}>
          <span className={styles.label}>Tekst *</span>
          <input
            type="text"
            className="input"
            value={tekst}
            onChange={(e) => setTekst(e.target.value)}
            placeholder="Bijv: Martin bellen over Figma-licenties"
            autoFocus
            required
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Prioriteit</span>
          <div className={styles.prioRij}>
            {PRIO_OPTIES.map((p) => (
              <button
                type="button"
                key={p.key}
                className={`${styles.prioBtn} ${prioriteit === p.key ? styles.prioBtnActief : ''} ${styles[`prio_${p.key}`] || ''}`}
                onClick={() => setPrioriteit(p.key)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Deadline (optioneel)</span>
          <input
            type="date"
            className="input"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </label>

        <div className={styles.field}>
          <span className={styles.label}>Koppelen aan contact (optioneel)</span>
          {gekoppeldAan ? (
            <div className={styles.gekoppeldRij}>
              <span className={styles.gekoppeldTekst}>{gekoppeldLabel}</span>
              <button type="button" className={styles.linkBtn} onClick={verwijderKoppeling}>
                Ontkoppelen
              </button>
            </div>
          ) : (
            <div className={styles.zoekWrap}>
              <input
                type="text"
                className="input"
                placeholder="Zoek op naam of bedrijf (min 2 tekens)"
                value={zoek}
                onChange={(e) => {
                  setZoek(e.target.value);
                  setToonZoekResultaten(true);
                }}
                onFocus={() => setToonZoekResultaten(true)}
              />
              {toonZoekResultaten && zoekResultaten.length > 0 && (
                <ul className={styles.zoekLijst}>
                  {zoekResultaten.map((c) => (
                    <li key={`${c.contactType}-${c.id}`}>
                      <button
                        type="button"
                        className={styles.zoekItem}
                        onClick={() => kiesContact(c)}
                      >
                        <span className={styles.zoekNaam}>{c.naam}</span>
                        <span className={styles.zoekMeta}>
                          {c.contactType}{c.bedrijf ? ` · ${c.bedrijf}` : ''}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <label className={styles.field}>
          <span className={styles.label}>Notities (optioneel)</span>
          <textarea
            className={`input ${styles.textarea}`}
            rows={3}
            value={notities}
            onChange={(e) => setNotities(e.target.value)}
            placeholder="Extra context"
          />
        </label>

        <div className={styles.footer}>
          {initial?.id && onDelete && (
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => {
                if (confirm('Actie verwijderen?')) onDelete(initial.id);
              }}
            >
              Verwijderen
            </button>
          )}
          <div className={styles.footerRechts}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Annuleren
            </button>
            <button type="submit" className="btn btn-primary" disabled={!tekst.trim()}>
              Opslaan
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
