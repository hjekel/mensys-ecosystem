import { useEffect, useMemo, useState } from 'react';
import FilterDropdown from '../components/FilterDropdown.jsx';
import VerschilMatrix from '../components/VerschilMatrix.jsx';
import ConcurrentFormModal from '../components/ConcurrentFormModal.jsx';
import KlantSignaalModal from '../components/KlantSignaalModal.jsx';
import RolodexKaart from '../components/RolodexKaart/RolodexKaart.jsx';
import {
  getConcurrenten,
  saveConcurrenten,
  addConcurrent,
  updateConcurrent,
  deleteConcurrent,
  CONCURRENT_CATEGORIEEN,
  CONCURRENT_SCOPES,
} from '../store/concurrentenStore.js';
import {
  getKlantsignalen,
  saveKlantsignalen,
  addKlantsignaal,
  updateKlantsignaal,
  deleteKlantsignaal,
  KLANTSIGNAAL_STATUSES,
} from '../store/klantsignalenStore.js';
import styles from './ConcurrentenPage.module.css';

const CAT_COLORS = {
  'Directe concurrent': { bg: '#fef2f2', fg: '#991b1b' },
  'Overheid-specialist': { bg: '#e8eef7', fg: '#003087' },
  Enterprise: { bg: '#f2f5fb', fg: '#5c6a85' },
  Distributeur: { bg: '#f3eaf7', fg: '#7C3AED' },
  'Online/prijsvechter': { bg: '#fff3eb', fg: '#E8500A' },
  'Coopetitie-kans': { bg: '#e6f7f2', fg: '#00a878' },
};

const STATUS_COLORS = {
  Signaal: { bg: '#fff3eb', fg: '#E8500A' },
  Benaderd: { bg: '#e8eef7', fg: '#003087' },
  Gesprek: { bg: '#f3eaf7', fg: '#7C3AED' },
  Gewonnen: { bg: '#e6f7f2', fg: '#00a878' },
  Verloren: { bg: '#f2f5fb', fg: '#5c6a85' },
};

export default function ConcurrentenPage() {
  const [concurrenten, setConcurrenten] = useState(() => getConcurrenten());
  const [klantsignalen, setKlantsignalen] = useState(() => getKlantsignalen());
  const [categorieFilter, setCategorieFilter] = useState('');
  const [scopeFilter, setScopeFilter] = useState('');
  const [detail, setDetail] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formInitial, setFormInitial] = useState(null);
  const [signaalOpen, setSignaalOpen] = useState(false);
  const [signaalInitial, setSignaalInitial] = useState(null);

  useEffect(() => { saveConcurrenten(concurrenten); }, [concurrenten]);
  useEffect(() => { saveKlantsignalen(klantsignalen); }, [klantsignalen]);

  const categorieOptions = useMemo(() => {
    const counts = {};
    for (const c of concurrenten) counts[c.categorie] = (counts[c.categorie] || 0) + 1;
    return CONCURRENT_CATEGORIEEN.map((c) => ({ value: c, label: c, count: counts[c] || 0 }));
  }, [concurrenten]);

  const scopeOptions = useMemo(() => {
    const counts = {};
    for (const c of concurrenten) counts[c.scope] = (counts[c.scope] || 0) + 1;
    return CONCURRENT_SCOPES.map((s) => ({ value: s, label: s, count: counts[s] || 0 }));
  }, [concurrenten]);

  const filtered = useMemo(() => {
    return concurrenten.filter((c) => {
      if (categorieFilter && c.categorie !== categorieFilter) return false;
      if (scopeFilter && c.scope !== scopeFilter) return false;
      return true;
    });
  }, [concurrenten, categorieFilter, scopeFilter]);

  function handleAddConcurrent() {
    setFormInitial(null);
    setFormOpen(true);
  }

  function handleEditConcurrent(c) {
    setFormInitial(c);
    setFormOpen(true);
    setDetail(null);
  }

  function handleSaveConcurrent(values) {
    if (formInitial?.id) {
      setConcurrenten((prev) => updateConcurrent(prev, formInitial.id, values));
    } else {
      setConcurrenten((prev) => addConcurrent(prev, values));
    }
    setFormOpen(false);
    setFormInitial(null);
  }

  function handleDeleteConcurrent(c) {
    if (!confirm(`Verwijder ${c.naam}?`)) return;
    setConcurrenten((prev) => deleteConcurrent(prev, c.id));
    setDetail(null);
  }

  function handleNotitiesChange(id, notities) {
    setConcurrenten((prev) => updateConcurrent(prev, id, { notities }));
    setDetail((d) => (d && d.id === id ? { ...d, notities } : d));
  }

  function handleAddSignaal() {
    setSignaalInitial(null);
    setSignaalOpen(true);
  }

  function handleSaveSignaal(values) {
    if (signaalInitial?.id) {
      setKlantsignalen((prev) => updateKlantsignaal(prev, signaalInitial.id, values));
    } else {
      setKlantsignalen((prev) => addKlantsignaal(prev, values));
    }
    setSignaalOpen(false);
    setSignaalInitial(null);
  }

  function handleEditSignaal(s) {
    setSignaalInitial(s);
    setSignaalOpen(true);
  }

  function handleDeleteSignaal(s) {
    if (!confirm(`Verwijder signaal voor ${s.bedrijfsnaam}?`)) return;
    setKlantsignalen((prev) => deleteKlantsignaal(prev, s.id));
  }

  return (
    <div className={styles.page}>
      <section className={styles.header}>
        <div>
          <h1 className={styles.title}>Concurrenten</h1>
          <p className={styles.subtitle}>
            Marktpositie van Mensys tegenover de Nederlandse en Europese spelers.
            Klik op een kaartje voor details. Gebruik de verschil-matrix om snel
            de sterke en zwakke punten te zien.
          </p>
        </div>
        <button type="button" className="btn btn-accent" onClick={handleAddConcurrent}>
          + Concurrent toevoegen
        </button>
      </section>

      <section className={styles.filters}>
        <FilterDropdown
          allLabel="Alle categorieen"
          value={categorieFilter}
          onChange={setCategorieFilter}
          options={categorieOptions}
        />
        <FilterDropdown
          allLabel="Alle scopes"
          value={scopeFilter}
          onChange={setScopeFilter}
          options={scopeOptions}
        />
        <span className={styles.resultCount}>{filtered.length} concurrenten</span>
      </section>

      <section className={styles.miniSection}>
        <h2 className={styles.miniTitle}>Snel openen</h2>
        <p className={styles.miniSub}>
          Klik op een concurrent om het Rolodex-kaartje rechts te openen
          (inclusief activiteiten-log).
        </p>
        <div className={styles.miniGrid}>
          {filtered.map((c) => {
            const catColors = CAT_COLORS[c.categorie] || CAT_COLORS.Enterprise;
            const samenvatting = firstSentence(c.propositie);
            return (
              <button
                key={`mini-${c.id}`}
                type="button"
                className={styles.miniCard}
                onClick={() => setDetail(c)}
              >
                <div className={styles.miniHead}>
                  <span className={styles.miniNaam}>{c.naam}</span>
                  <span
                    className={styles.miniBadge}
                    style={{ background: catColors.bg, color: catColors.fg }}
                  >
                    {c.categorie}
                  </span>
                </div>
                {samenvatting && <p className={styles.miniText}>{samenvatting}</p>}
              </button>
            );
          })}
        </div>
      </section>

      <div className={styles.grid}>
        {filtered.map((c) => {
          const catColors = CAT_COLORS[c.categorie] || CAT_COLORS.Enterprise;
          return (
            <article
              key={c.id}
              className={styles.card}
              onClick={() => setDetail(c)}
            >
              <div className={styles.cardHead}>
                <div className={styles.cardNaam}>{c.naam}</div>
                {c.website && (
                  <a
                    href={`https://${c.website.replace(/^https?:\/\//, '')}`}
                    target="_blank"
                    rel="noreferrer noopener"
                    className={styles.cardLink}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {c.website}
                  </a>
                )}
              </div>
              <div className={styles.badges}>
                <span
                  className={styles.badge}
                  style={{ background: catColors.bg, color: catColors.fg }}
                >
                  {c.categorie}
                </span>
                <span className={styles.badgeScope}>{c.scope}</span>
                {c.hq && <span className={styles.badgeHq}>{c.hq}</span>}
              </div>
              {c.propositie && <p className={styles.cardProp}>{c.propositie}</p>}
              {c.sterktes?.length > 0 && (
                <ul className={styles.sterkList}>
                  {c.sterktes.slice(0, 3).map((s) => <li key={s}>{s}</li>)}
                </ul>
              )}
              {c.zwaktes?.length > 0 && (
                <ul className={styles.zwakList}>
                  {c.zwaktes.slice(0, 3).map((s) => <li key={s}>{s}</li>)}
                </ul>
              )}
              {c.coopetitie && (
                <div className={styles.coopBanner}>
                  <strong>Coopetitie-kans:</strong> {c.coopetitieIdee || 'zie detail'}
                </div>
              )}
            </article>
          );
        })}
      </div>

      <section className={styles.matrixSection}>
        <h2 className={styles.sectionTitle}>Verschil-matrix</h2>
        <VerschilMatrix />
      </section>

      <section className={styles.signalenSection}>
        <div className={styles.signalenHeader}>
          <h2 className={styles.sectionTitle}>Klantsignalen</h2>
          <button type="button" className="btn btn-accent" onClick={handleAddSignaal}>
            + Signaal toevoegen
          </button>
        </div>
        <p className={styles.signalenSub}>
          Bedrijven die momenteel bij een concurrent zitten maar ontevreden zijn.
          Signalen met status "Signaal" verschijnen bovenaan de YALC-tab met score 85.
        </p>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Bedrijf</th>
                <th>Concurrent</th>
                <th>Bron</th>
                <th>Status</th>
                <th>Datum</th>
                <th>Contactpersoon</th>
                <th className={styles.actionsCol}></th>
              </tr>
            </thead>
            <tbody>
              {klantsignalen.length === 0 && (
                <tr>
                  <td colSpan={7} className={styles.emptyRow}>
                    Nog geen klantsignalen. Voeg je eerste toe.
                  </td>
                </tr>
              )}
              {klantsignalen.map((s) => {
                const sc = STATUS_COLORS[s.status] || STATUS_COLORS.Signaal;
                return (
                  <tr key={s.id} className={styles.row}>
                    <td className={styles.nameCell}>{s.bedrijfsnaam}</td>
                    <td>{s.concurrent}</td>
                    <td className={styles.dim}>{s.bron}{s.bronDetail ? ` · ${s.bronDetail}` : ''}</td>
                    <td>
                      <span className={styles.statusPill} style={{ background: sc.bg, color: sc.fg }}>
                        {s.status}
                      </span>
                    </td>
                    <td className={styles.dim}>{formatDate(s.datum)}</td>
                    <td>
                      {s.contactLinkedin ? (
                        <a
                          href={s.contactLinkedin}
                          target="_blank"
                          rel="noreferrer noopener"
                          className={styles.linkedInLink}
                        >
                          {s.contactpersoon || 'profiel'}
                        </a>
                      ) : (
                        s.contactpersoon || '-'
                      )}
                    </td>
                    <td className={styles.actionsCol}>
                      <button type="button" className={styles.actionBtn} onClick={() => handleEditSignaal(s)}>Bewerken</button>
                      <button type="button" className={styles.actionBtn} onClick={() => handleDeleteSignaal(s)}>Verwijder</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {detail && (
        <RolodexKaart
          record={detail}
          type="concurrent"
          onClose={() => setDetail(null)}
          onUpdate={(id, values) => handleNotitiesChange(id, values.notities)}
        />
      )}

      <ConcurrentFormModal
        open={formOpen}
        initial={formInitial}
        onClose={() => { setFormOpen(false); setFormInitial(null); }}
        onSave={handleSaveConcurrent}
      />

      <KlantSignaalModal
        open={signaalOpen}
        initial={signaalInitial}
        concurrenten={concurrenten}
        onClose={() => { setSignaalOpen(false); setSignaalInitial(null); }}
        onSave={handleSaveSignaal}
      />
    </div>
  );
}

function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('nl-NL', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return '';
  }
}

function firstSentence(text) {
  if (!text) return '';
  const clean = String(text).trim();
  const match = clean.match(/[^.!?]+[.!?]/);
  if (match) {
    const s = match[0].trim();
    return s.length > 140 ? s.slice(0, 137) + '...' : s;
  }
  return clean.length > 140 ? clean.slice(0, 137) + '...' : clean;
}
