import { useMemo, useState } from 'react';
import FilterDropdown from '../components/FilterDropdown.jsx';
import ContactDetailPanel from '../components/ContactDetailPanel.jsx';
import ResellerDetailPanel from '../components/ResellerDetailPanel.jsx';
import OpenerModal from '../components/OpenerModal.jsx';
import WeekGoals from '../components/WeekGoals.jsx';
import YalcGewichtenModal from '../components/YalcGewichtenModal.jsx';
import {
  rankInkopers,
  rankResellers,
  rankCeos,
  scoreBand,
  SCORE_BAND_COLORS,
} from '../utils/lhf.js';
import { contactsToCsv, downloadCsv } from '../utils/csvParser.js';
import { resellersToCsv } from '../utils/resellerCsv.js';
import { updateContact } from '../utils/storage.js';
import { updateReseller, deleteReseller } from '../store/resellersStore.js';
import { updateCeo, deleteCeo } from '../store/ceoStore.js';
import { loadSignalen } from '../utils/signaalFetcher.js';
import { getGewichten } from '../utils/yalcInstellingen.js';
import styles from './YalcPage.module.css';

const BANDS = ['Hot', 'Warm', 'Lauw', 'Koud'];

export default function YalcPage({ contacts, setContacts, resellers, setResellers, ceos = [], setCeos }) {
  const [source, setSource] = useState('inkopers');
  const [topN, setTopN] = useState(50);
  const [query, setQuery] = useState('');
  const [country, setCountry] = useState('');
  const [category, setCategory] = useState('');
  const [band, setBand] = useState('');

  const [detail, setDetail] = useState(null);
  const [openerContext, setOpenerContext] = useState(null);
  const [openerTargetId, setOpenerTargetId] = useState(null);
  const [gewichten, setGewichten] = useState(() => getGewichten());
  const [gewichtenOpen, setGewichtenOpen] = useState(false);

  const ranked = useMemo(() => {
    if (source === 'inkopers') return rankInkopers(contacts, gewichten);
    if (source === 'ceo') return rankCeos(ceos);
    return rankResellers(resellers);
  }, [source, contacts, resellers, ceos, gewichten]);

  const countryOptions = useMemo(() => {
    const counts = new Map();
    for (const row of ranked) {
      const rec = row.record;
      const value = source === 'resellers' ? rec.locatie : rec.country;
      if (!value) continue;
      counts.set(value, (counts.get(value) || 0) + 1);
    }
    return [...counts.entries()]
      .map(([k, v]) => ({ value: k, label: k, count: v }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  }, [ranked, source]);

  const categoryOptions = useMemo(() => {
    const counts = new Map();
    for (const row of ranked) {
      const rec = row.record;
      const value = source === 'resellers' ? rec.resellerType : rec.sector;
      if (!value) continue;
      counts.set(value, (counts.get(value) || 0) + 1);
    }
    return [...counts.entries()]
      .map(([k, v]) => ({ value: k, label: k, count: v }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  }, [ranked, source]);

  const distribution = useMemo(() => {
    const bands = { Hot: 0, Warm: 0, Lauw: 0, Koud: 0 };
    for (const row of ranked) {
      bands[scoreBand(row.score)] += 1;
    }
    return bands;
  }, [ranked]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ranked.filter((row) => {
      const rec = row.record;
      if (band && scoreBand(row.score) !== band) return false;
      if (country) {
        const val = source === 'resellers' ? rec.locatie : rec.country;
        if (val !== country) return false;
      }
      if (category) {
        const val = source === 'resellers' ? rec.resellerType : rec.sector;
        if (val !== category) return false;
      }
      if (q) {
        const hay = source === 'resellers'
          ? `${rec.bedrijf || ''} ${rec.voornaam || ''} ${rec.achternaam || ''} ${rec.functietitel || ''}`.toLowerCase()
          : `${rec.firstName || ''} ${rec.lastName || ''} ${rec.company || ''} ${rec.jobTitle || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [ranked, query, country, category, band, source]);

  const visible = filtered.slice(0, topN);

  const avg = ranked.length > 0
    ? Math.round(ranked.reduce((sum, r) => sum + r.score, 0) / ranked.length)
    : 0;

  function handleSourceChange(next) {
    setSource(next);
    setCountry('');
    setCategory('');
    setBand('');
    setDetail(null);
  }

  function handleExport() {
    const records = visible.map((row) => row.record);
    const stamp = new Date().toISOString().slice(0, 10);
    if (source === 'resellers') {
      const csv = resellersToCsv(records);
      downloadCsv(`mensys-yalc-resellers-${stamp}.csv`, csv);
    } else if (source === 'ceo') {
      const csv = contactsToCsv(records);
      downloadCsv(`mensys-yalc-ceo-${stamp}.csv`, csv);
    } else {
      const csv = contactsToCsv(records);
      downloadCsv(`mensys-yalc-inkopers-${stamp}.csv`, csv);
    }
  }

  // Inkopers detail panel handlers
  function handleInkoperStatusChange(contact, newStatus) {
    if (contact.status === newStatus) return;
    setContacts((prev) => updateContact(prev, contact.id, { status: newStatus }));
    setDetail((d) => (d && d.id === contact.id ? { ...d, status: newStatus } : d));
  }

  function handleInkoperDelete(contact) {
    const name = `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'dit contact';
    if (!confirm(`Verwijder ${name}?`)) return;
    setContacts((prev) => prev.filter((c) => c.id !== contact.id));
    setDetail(null);
  }

  // CEO detail panel handlers
  function handleCeoStatusChange(contact, newStatus) {
    if (contact.status === newStatus) return;
    if (!setCeos) return;
    setCeos((prev) => updateCeo(prev, contact.id, { status: newStatus }));
    setDetail((d) => (d && d.id === contact.id ? { ...d, status: newStatus } : d));
  }

  function handleCeoDelete(contact) {
    const name = `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'dit contact';
    if (!confirm(`Verwijder ${name}?`)) return;
    if (!setCeos) return;
    setCeos((prev) => deleteCeo(prev, contact.id));
    setDetail(null);
  }

  // Resellers detail panel handlers
  function handleResellerSave(id, values) {
    setResellers((prev) => updateReseller(prev, id, values));
    setDetail((d) => (d && d.id === id ? { ...d, ...values } : d));
  }

  function handleResellerDelete(reseller) {
    const label = reseller.bedrijf ||
      `${reseller.voornaam || ''} ${reseller.achternaam || ''}`.trim() ||
      'deze reseller';
    if (!confirm(`Verwijder ${label}?`)) return;
    setResellers((prev) => deleteReseller(prev, reseller.id));
    setDetail(null);
  }

  function findSignalForCompany(name) {
    if (!name) return null;
    const lower = name.toLowerCase();
    const all = loadSignalen();
    const match = all.find((s) => (s.gekoppeld || []).some((g) => String(g).toLowerCase() === lower));
    if (!match) return null;
    return `${match.titel}${match.samenvatting ? ' - ' + match.samenvatting : ''}`;
  }

  function openOpener(e, rec) {
    e.stopPropagation();
    const isReseller = source === 'resellers';
    const naam = isReseller
      ? `${rec.voornaam || ''} ${rec.achternaam || ''}`.trim()
      : `${rec.firstName || ''} ${rec.lastName || ''}`.trim();
    const functie = isReseller ? (rec.functietitel || '') : (rec.jobTitle || '');
    const bedrijf = isReseller ? (rec.bedrijf || '') : (rec.company || '');
    const signaal = findSignalForCompany(bedrijf);
    const doelgroep =
      source === 'resellers' ? 'reseller' : source === 'ceo' ? 'directeur/eigenaar' : 'inkoper';
    setOpenerContext({ naam, functie, bedrijf, signaal, doelgroep });
    setOpenerTargetId(rec.id);
  }

  function handleSaveOpenerAsNotitie(text) {
    if (!openerTargetId) return;
    const stamp = new Date().toLocaleDateString('nl-NL');
    const prefix = `Opener (${stamp}):\n`;
    if (source === 'resellers') {
      const r = resellers.find((x) => x.id === openerTargetId);
      if (!r) return;
      const combined = r.notities ? `${r.notities}\n\n${prefix}${text}` : `${prefix}${text}`;
      setResellers((prev) => updateReseller(prev, openerTargetId, { notities: combined }));
    } else if (source === 'ceo') {
      const c = ceos.find((x) => x.id === openerTargetId);
      if (!c || !setCeos) return;
      const combined = c.notes ? `${c.notes}\n\n${prefix}${text}` : `${prefix}${text}`;
      setCeos((prev) => updateCeo(prev, openerTargetId, { notes: combined }));
    } else {
      const c = contacts.find((x) => x.id === openerTargetId);
      if (!c) return;
      const combined = c.notes ? `${c.notes}\n\n${prefix}${text}` : `${prefix}${text}`;
      setContacts((prev) => updateContact(prev, openerTargetId, { notes: combined }));
    }
  }

  return (
    <div className={styles.page}>
      <WeekGoals contacts={contacts} resellers={resellers} />

      <section className={styles.hero}>
        <div className={styles.heroText}>
          <h1 className={styles.title}>YALC</h1>
          <p className={styles.subtitle}>
            Low Hanging Fruit index, geinspireerd op het YALC GTM OS concept.
            Elk contact krijgt een score uit 100 op basis van signalen van
            benaderbaarheid en Mensys-fit. Zo zie je direct met wie je als
            eerste contact moet opnemen deze week. Klik op een band om te
            filteren, of op een rij voor het detailkaartje.
          </p>
        </div>
        <div className={styles.heroStats}>
          <StatButton
            label="Gemiddelde score"
            value={avg}
            suffix="/100"
            active={false}
            onClick={null}
          />
          {BANDS.map((b) => (
            <StatButton
              key={b}
              label={labelForBand(b)}
              value={distribution[b]}
              active={band === b}
              onClick={() => setBand((v) => (v === b ? '' : b))}
            />
          ))}
          {band && (
            <button
              type="button"
              className={styles.clearBand}
              onClick={() => setBand('')}
              title="Band-filter wissen"
            >
              Wis filter
            </button>
          )}
        </div>
      </section>

      <section className={styles.controls}>
        <div className={styles.toggle}>
          <button
            type="button"
            className={`${styles.toggleBtn} ${source === 'inkopers' ? styles.toggleActive : ''}`}
            onClick={() => handleSourceChange('inkopers')}
          >
            Inkopers ({contacts.length.toLocaleString('nl-NL')})
          </button>
          <button
            type="button"
            className={`${styles.toggleBtn} ${source === 'resellers' ? styles.toggleActive : ''}`}
            onClick={() => handleSourceChange('resellers')}
          >
            Resellers ({resellers.length.toLocaleString('nl-NL')})
          </button>
          <button
            type="button"
            className={`${styles.toggleBtn} ${source === 'ceo' ? styles.toggleActive : ''}`}
            onClick={() => handleSourceChange('ceo')}
          >
            CEO & MD ({ceos.length.toLocaleString('nl-NL')})
          </button>
        </div>

        <input
          type="text"
          className={`input ${styles.search}`}
          placeholder={source === 'resellers' ? 'Zoek op bedrijf, naam of functietitel' : 'Zoek op naam, bedrijf of functie'}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <div className={styles.filterDrops}>
          <FilterDropdown
            allLabel={source === 'resellers' ? 'Alle locaties' : 'Alle landen'}
            value={country}
            onChange={setCountry}
            options={countryOptions}
          />
          <FilterDropdown
            allLabel={source === 'resellers' ? 'Alle reseller types' : 'Alle sectoren'}
            value={category}
            onChange={setCategory}
            options={categoryOptions}
          />
        </div>

        <div className={styles.topN}>
          <span className={styles.topLabel}>Top</span>
          {[25, 50, 100, 250].map((n) => (
            <button
              key={n}
              type="button"
              className={`${styles.topBtn} ${topN === n ? styles.topActive : ''}`}
              onClick={() => setTopN(n)}
            >
              {n}
            </button>
          ))}
        </div>

        {source === 'inkopers' && (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setGewichtenOpen(true)}
            title="Pas de YALC-scoringsgewichten aan"
          >
            Scoringsregels aanpassen
          </button>
        )}

        <button type="button" className="btn btn-ghost" onClick={handleExport}>
          Exporteer top {Math.min(topN, filtered.length)} CSV
        </button>
      </section>

      <section className={styles.legendWrap}>
        <h2 className={styles.sectionTitle}>Scoring regels</h2>
        {source === 'inkopers' && (
          <ul className={styles.legend}>
            <li><strong>20</strong> Email aanwezig</li>
            <li><strong>20</strong> LinkedIn URL aanwezig</li>
            <li><strong>20</strong> Status Warm of Gesprek gevoerd</li>
            <li><strong>15</strong> FTE 201+ (Mensys target)</li>
            <li><strong>15</strong> Sector in Zorg, Overheid, Maakindustrie, Tech of Onderwijs</li>
            <li><strong>10</strong> Prioriteit Hoog</li>
          </ul>
        )}
        {source === 'resellers' && (
          <ul className={styles.legend}>
            <li><strong>30</strong> Mensys Fit Hoog (15 bij Midden, 5 bij Onderzoeken)</li>
            <li><strong>20</strong> Email aanwezig</li>
            <li><strong>20</strong> LinkedIn URL aanwezig</li>
            <li><strong>15</strong> Status Warm of Gesprek gevoerd</li>
            <li><strong>10</strong> Reseller Type bepaald (niet Nader te bepalen)</li>
            <li><strong>5</strong> FTE 11-500 (ideale reseller schaal)</li>
          </ul>
        )}
        {source === 'ceo' && (
          <ul className={styles.legend}>
            <li><strong>25</strong> Martin-type (Mensys Fit altijd Hoog)</li>
            <li><strong>20</strong> Email aanwezig</li>
            <li><strong>20</strong> LinkedIn URL aanwezig</li>
            <li><strong>15</strong> FTE 1-10 of 11-50 (ideale doelgroep)</li>
            <li><strong>15</strong> Status Warm of Gesprek gevoerd</li>
            <li><strong>5</strong> Prioriteit Hoog</li>
          </ul>
        )}
      </section>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.numCol}>#</th>
              <th className={styles.scoreCol}>Score</th>
              <th>Band</th>
              <th>Bedrijf</th>
              <th>Naam</th>
              <th>Functietitel</th>
              <th>{source === 'resellers' ? 'Locatie' : 'Land'}</th>
              <th>{source === 'resellers' ? 'Type' : 'Sector'}</th>
              <th>Signalen</th>
              <th className={styles.actionCol}>Actie</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr>
                <td colSpan={10} className={styles.empty}>
                  Geen records. Wijzig filters of importeer data op de {source === 'resellers' ? 'Resellers' : source === 'ceo' ? 'CEO & MD' : 'Inkopers'} tab.
                </td>
              </tr>
            )}
            {visible.map((row, idx) => {
              const b = scoreBand(row.score);
              const colors = SCORE_BAND_COLORS[b];
              const rec = row.record;
              const isReseller = source === 'resellers';
              const company = isReseller ? rec.bedrijf : rec.company;
              const first = isReseller ? rec.voornaam : rec.firstName;
              const last = isReseller ? rec.achternaam : rec.lastName;
              const job = isReseller ? rec.functietitel : rec.jobTitle;
              const land = isReseller ? rec.locatie : rec.country;
              const cat = isReseller ? rec.resellerType : rec.sector;
              return (
                <tr key={rec.id} className={styles.row} onClick={() => setDetail(rec)}>
                  <td className={styles.rowNum}>{idx + 1}</td>
                  <td className={styles.scoreCell}>
                    <div className={styles.scoreBar}>
                      <div
                        className={styles.scoreFill}
                        style={{ width: `${row.score}%`, backgroundColor: colors.fg }}
                      />
                    </div>
                    <span className={styles.scoreNum}>{row.score}</span>
                  </td>
                  <td>
                    <span
                      className={styles.bandPill}
                      style={{ backgroundColor: colors.bg, color: colors.fg }}
                    >
                      {b}
                    </span>
                  </td>
                  <td className={styles.companyCell}>{company || '-'}</td>
                  <td>{`${first || ''} ${last || ''}`.trim() || '-'}</td>
                  <td className={styles.dim}>{job || '-'}</td>
                  <td className={styles.dim}>{land || '-'}</td>
                  <td className={styles.dim}>{cat || '-'}</td>
                  <td>
                    <div className={styles.signals}>
                      {row.signals.map((s) => (
                        <span key={s.label} className={styles.signalChip}>
                          {s.label}
                          <span className={styles.signalPts}>+{s.points}</span>
                        </span>
                      ))}
                      {row.signals.length === 0 && (
                        <span className={styles.dim}>Geen signalen</span>
                      )}
                    </div>
                  </td>
                  <td className={styles.actionCol} onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className={styles.openerBtn}
                      onClick={(e) => openOpener(e, rec)}
                      title="Genereer opener met Claude"
                    >
                      Opener
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {source === 'inkopers' && detail && (
        <ContactDetailPanel
          contact={detail}
          onClose={() => setDetail(null)}
          onEdit={() => setDetail(null)}
          onDelete={handleInkoperDelete}
          onStatusChange={handleInkoperStatusChange}
        />
      )}
      {source === 'resellers' && detail && (
        <ResellerDetailPanel
          reseller={detail}
          onClose={() => setDetail(null)}
          onDelete={handleResellerDelete}
          onSave={handleResellerSave}
        />
      )}
      {source === 'ceo' && detail && (
        <ContactDetailPanel
          contact={detail}
          onClose={() => setDetail(null)}
          onEdit={() => setDetail(null)}
          onDelete={handleCeoDelete}
          onStatusChange={handleCeoStatusChange}
        />
      )}

      <OpenerModal
        open={Boolean(openerContext)}
        context={openerContext}
        onClose={() => {
          setOpenerContext(null);
          setOpenerTargetId(null);
        }}
        onSaveAsNotitie={handleSaveOpenerAsNotitie}
      />

      <YalcGewichtenModal
        open={gewichtenOpen}
        gewichten={gewichten}
        onClose={() => setGewichtenOpen(false)}
        onSave={(next) => {
          setGewichten(next);
          setGewichtenOpen(false);
        }}
      />
    </div>
  );
}

function StatButton({ label, value, suffix, active, onClick }) {
  if (!onClick) {
    return (
      <div className={styles.stat}>
        <div className={styles.statValue}>
          {value.toLocaleString('nl-NL')}
          {suffix && <span className={styles.statSuffix}>{suffix}</span>}
        </div>
        <div className={styles.statLabel}>{label}</div>
      </div>
    );
  }
  return (
    <button
      type="button"
      className={`${styles.stat} ${styles.statClickable} ${active ? styles.statActive : ''}`}
      onClick={onClick}
    >
      <div className={styles.statValue}>{value.toLocaleString('nl-NL')}</div>
      <div className={styles.statLabel}>{label}</div>
    </button>
  );
}

function labelForBand(band) {
  switch (band) {
    case 'Hot': return 'Hot (80+)';
    case 'Warm': return 'Warm (60-79)';
    case 'Lauw': return 'Lauw (40-59)';
    case 'Koud': return 'Koud (<40)';
    default: return band;
  }
}
