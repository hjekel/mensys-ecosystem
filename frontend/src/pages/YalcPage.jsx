import { useMemo, useState } from 'react';
import {
  rankInkopers,
  rankResellers,
  scoreBand,
  SCORE_BAND_COLORS,
} from '../utils/lhf.js';
import { contactsToCsv, downloadCsv } from '../utils/csvParser.js';
import { resellersToCsv } from '../utils/resellerCsv.js';
import styles from './YalcPage.module.css';

export default function YalcPage({ contacts, resellers }) {
  const [source, setSource] = useState('inkopers');
  const [topN, setTopN] = useState(50);
  const [query, setQuery] = useState('');

  const ranked = useMemo(() => {
    if (source === 'inkopers') return rankInkopers(contacts);
    return rankResellers(resellers);
  }, [source, contacts, resellers]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ranked;
    return ranked.filter((row) => {
      if (source === 'inkopers') {
        const c = row.record;
        const hay = `${c.firstName || ''} ${c.lastName || ''} ${c.company || ''} ${c.jobTitle || ''}`.toLowerCase();
        return hay.includes(q);
      }
      const r = row.record;
      const hay = `${r.bedrijf || ''} ${r.voornaam || ''} ${r.achternaam || ''} ${r.functietitel || ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [ranked, query, source]);

  const visible = filtered.slice(0, topN);

  const distribution = useMemo(() => {
    const bands = { Hot: 0, Warm: 0, Lauw: 0, Koud: 0 };
    for (const row of ranked) {
      bands[scoreBand(row.score)] += 1;
    }
    return bands;
  }, [ranked]);

  const avg = ranked.length > 0
    ? Math.round(ranked.reduce((sum, r) => sum + r.score, 0) / ranked.length)
    : 0;

  function handleExport() {
    const records = visible.map((row) => row.record);
    const stamp = new Date().toISOString().slice(0, 10);
    if (source === 'inkopers') {
      const csv = contactsToCsv(records);
      downloadCsv(`mensys-yalc-inkopers-${stamp}.csv`, csv);
    } else {
      const csv = resellersToCsv(records);
      downloadCsv(`mensys-yalc-resellers-${stamp}.csv`, csv);
    }
  }

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <h1 className={styles.title}>YALC</h1>
          <p className={styles.subtitle}>
            Low Hanging Fruit index, geinspireerd op het YALC GTM OS concept.
            Elk contact krijgt een score uit 100 op basis van signalen van
            benaderbaarheid en Mensys-fit. Zo zie je direct met wie je als
            eerste contact moet opnemen deze week.
          </p>
        </div>
        <div className={styles.heroStats}>
          <Stat label="Gemiddelde score" value={avg} suffix="/100" />
          <Stat label="Hot (80+)" value={distribution.Hot} />
          <Stat label="Warm (60-79)" value={distribution.Warm} />
          <Stat label="Lauw (40-59)" value={distribution.Lauw} />
        </div>
      </section>

      <section className={styles.controls}>
        <div className={styles.toggle}>
          <button
            type="button"
            className={`${styles.toggleBtn} ${source === 'inkopers' ? styles.toggleActive : ''}`}
            onClick={() => setSource('inkopers')}
          >
            Inkopers ({contacts.length.toLocaleString('nl-NL')})
          </button>
          <button
            type="button"
            className={`${styles.toggleBtn} ${source === 'resellers' ? styles.toggleActive : ''}`}
            onClick={() => setSource('resellers')}
          >
            Resellers ({resellers.length.toLocaleString('nl-NL')})
          </button>
        </div>

        <input
          type="text"
          className={`input ${styles.search}`}
          placeholder={source === 'inkopers' ? 'Zoek op naam, bedrijf of functie' : 'Zoek op bedrijf, naam of functietitel'}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

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

        <button type="button" className="btn btn-ghost" onClick={handleExport}>
          Exporteer top {Math.min(topN, filtered.length)} CSV
        </button>
      </section>

      <section className={styles.legendWrap}>
        <h2 className={styles.sectionTitle}>Scoring regels</h2>
        {source === 'inkopers' ? (
          <ul className={styles.legend}>
            <li><strong>20</strong> Email aanwezig</li>
            <li><strong>20</strong> LinkedIn URL aanwezig</li>
            <li><strong>20</strong> Status Warm of Gesprek gevoerd</li>
            <li><strong>15</strong> FTE 201+ (Mensys target)</li>
            <li><strong>15</strong> Sector in Zorg, Overheid, Maakindustrie, Tech of Onderwijs</li>
            <li><strong>10</strong> Prioriteit Hoog</li>
          </ul>
        ) : (
          <ul className={styles.legend}>
            <li><strong>30</strong> Mensys Fit Hoog (15 bij Midden, 5 bij Onderzoeken)</li>
            <li><strong>20</strong> Email aanwezig</li>
            <li><strong>20</strong> LinkedIn URL aanwezig</li>
            <li><strong>15</strong> Status Warm of Gesprek gevoerd</li>
            <li><strong>10</strong> Reseller Type bepaald (niet Nader te bepalen)</li>
            <li><strong>5</strong> FTE 11-500 (ideale reseller schaal)</li>
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
              <th>{source === 'inkopers' ? 'Bedrijf' : 'Bedrijf'}</th>
              <th>Naam</th>
              <th>Functietitel</th>
              <th>Signalen</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr>
                <td colSpan={7} className={styles.empty}>
                  Geen records. Importeer eerst data op de {source === 'inkopers' ? 'Inkopers' : 'Resellers'} tab.
                </td>
              </tr>
            )}
            {visible.map((row, idx) => {
              const band = scoreBand(row.score);
              const colors = SCORE_BAND_COLORS[band];
              const rec = row.record;
              const company = source === 'inkopers' ? rec.company : rec.bedrijf;
              const first = source === 'inkopers' ? rec.firstName : rec.voornaam;
              const last = source === 'inkopers' ? rec.lastName : rec.achternaam;
              const job = source === 'inkopers' ? rec.jobTitle : rec.functietitel;
              return (
                <tr key={rec.id}>
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
                      {band}
                    </span>
                  </td>
                  <td className={styles.companyCell}>{company || '-'}</td>
                  <td>{`${first || ''} ${last || ''}`.trim() || '-'}</td>
                  <td className={styles.dim}>{job || '-'}</td>
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
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ label, value, suffix }) {
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
