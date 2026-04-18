import { useMemo, useState } from 'react';
import styles from './StatistiekenPage.module.css';
import {
  SECTORS,
  FTE_CATEGORIES,
  STATUSES,
  SECTOR_COLORS,
  MENSYS_FIT_SCORES,
  MENSYS_FIT_COLORS,
  RESELLER_TYPES,
  RESELLER_STATUSES,
} from '@shared/constants.js';

export default function StatistiekenPage({
  contacts,
  resellers = [],
  onNavigateInkopers,
  onNavigateResellers,
}) {
  const stats = useMemo(() => computeStats(contacts), [contacts]);
  const jobTitleStats = useMemo(() => computeJobTitles(contacts), [contacts]);
  const resellerStats = useMemo(() => computeResellerStats(resellers), [resellers]);

  const goInkopers = (filter) => onNavigateInkopers && onNavigateInkopers(filter);
  const goResellers = (filter) => onNavigateResellers && onNavigateResellers(filter);

  return (
    <div className={styles.page}>
      <div className={styles.tiles}>
        <Tile label="Totaal contacten" value={stats.total} onClick={() => goInkopers({})} />
        <Tile label="NL contacten" value={stats.nl} />
        <Tile label="Met email" value={stats.withEmail} />
        <Tile label="Met LinkedIn" value={stats.withLinkedin} />
      </div>

      <div className={styles.grid}>
        <BarCard
          title="Verdeling per sector"
          items={SECTORS.map((s) => ({
            label: s,
            value: stats.bySector[s] || 0,
            color: SECTOR_COLORS[s],
          }))}
          total={stats.total}
          onItemClick={(it) => goInkopers({ sector: it.label })}
        />

        <BarCard
          title="Verdeling per FTE"
          items={FTE_CATEGORIES.map((f) => ({
            label: f,
            value: stats.byFte[f] || 0,
            color: '#003087',
          }))}
          total={stats.total}
          onItemClick={(it) => goInkopers({ fte: it.label })}
        />

        <BarCard
          title="Pipeline (per status)"
          items={STATUSES.map((s) => ({
            label: s,
            value: stats.byStatus[s] || 0,
            color: statusColor(s),
          }))}
          total={stats.total}
          onItemClick={(it) => goInkopers({ status: it.label })}
        />
      </div>

      <JobTitlesCard
        items={jobTitleStats}
        onItemClick={(it) => goInkopers({ jobTitle: it.label })}
      />

      <div className={styles.sectionDivider}>
        <h2 className={styles.sectionTitle}>Resellers</h2>
      </div>

      <div className={styles.tiles}>
        <Tile label="Totaal resellers" value={resellerStats.total} onClick={() => goResellers({})} />
        <Tile
          label="Partners"
          value={resellerStats.partners}
          onClick={() => goResellers({ status: 'Partner' })}
        />
        <Tile label="Met email" value={resellerStats.withEmail} />
        <Tile
          label="Email dekking"
          value={resellerStats.total > 0
            ? Math.round((resellerStats.withEmail / resellerStats.total) * 100)
            : 0}
          suffix="%"
        />
      </div>

      {resellerStats.total > 0 && (
        <div className={styles.emailNote}>
          {resellerStats.withEmail.toLocaleString('nl-NL')} van {resellerStats.total.toLocaleString('nl-NL')} resellers heeft e-mail ({resellerStats.total > 0 ? Math.round((resellerStats.withEmail / resellerStats.total) * 100) : 0}%)
        </div>
      )}

      <div className={styles.grid}>
        <BarCard
          title="Verdeling Mensys Fit"
          items={MENSYS_FIT_SCORES.map((s) => ({
            label: s,
            value: resellerStats.byFit[s] || 0,
            color: MENSYS_FIT_COLORS[s].fg,
          }))}
          total={resellerStats.total}
          onItemClick={(it) => goResellers({ mensysFit: it.label })}
        />

        <BarCard
          title="Verdeling Reseller Type"
          items={RESELLER_TYPES.map((t) => ({
            label: t,
            value: resellerStats.byType[t] || 0,
            color: '#003087',
          }))}
          total={resellerStats.total}
          onItemClick={(it) => goResellers({ resellerType: it.label })}
        />

        <BarCard
          title="Pipeline resellers (per status)"
          items={RESELLER_STATUSES.map((s) => ({
            label: s,
            value: resellerStats.byStatus[s] || 0,
            color: resellerStatusColor(s),
          }))}
          total={resellerStats.total}
          onItemClick={(it) => goResellers({ status: it.label })}
        />
      </div>
    </div>
  );
}

function JobTitlesCard({ items, onItemClick }) {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => it.label.toLowerCase().includes(q));
  }, [items, query]);
  const totalInList = filtered.reduce((sum, it) => sum + it.value, 0);

  return (
    <div className={styles.card}>
      <div className={styles.jobHeader}>
        <h3 className={styles.cardTitle}>Functietitels ({items.length} unieke, {totalInList.toLocaleString('nl-NL')} contacten)</h3>
        <input
          type="text"
          className={`input ${styles.jobSearch}`}
          placeholder="Zoek functietitel"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      {filtered.length === 0 ? (
        <div className={styles.empty}>Geen functietitels gevonden.</div>
      ) : (
        <div className={styles.jobTableWrap}>
          <table className={styles.jobTable}>
            <thead>
              <tr>
                <th className={styles.jobRank}>#</th>
                <th>Functietitel</th>
                <th className={styles.jobCount}>Aantal</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((it, idx) => (
                <tr
                  key={it.label}
                  className={onItemClick ? styles.jobRowClickable : ''}
                  onClick={onItemClick ? () => onItemClick(it) : undefined}
                >
                  <td className={styles.jobRank}>{idx + 1}</td>
                  <td>{it.label}</td>
                  <td className={styles.jobCount}>{it.value.toLocaleString('nl-NL')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Tile({ label, value, suffix, onClick }) {
  const content = (
    <>
      <div className={styles.tileValue}>
        {value.toLocaleString('nl-NL')}
        {suffix && <span className={styles.tileSuffix}>{suffix}</span>}
      </div>
      <div className={styles.tileLabel}>{label}</div>
    </>
  );
  if (onClick) {
    return (
      <button
        type="button"
        className={`${styles.tile} ${styles.tileClickable}`}
        onClick={onClick}
      >
        {content}
      </button>
    );
  }
  return <div className={styles.tile}>{content}</div>;
}

function BarCard({ title, items, total, onItemClick }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>{title}</h3>
      <div className={styles.bars}>
        {items.map((it) => {
          const pct = total > 0 ? Math.round((it.value / total) * 100) : 0;
          const width = max > 0 ? (it.value / max) * 100 : 0;
          const clickable = onItemClick && it.value > 0;
          return (
            <div
              className={`${styles.barRow} ${clickable ? styles.barRowClickable : ''}`}
              key={it.label}
              onClick={clickable ? () => onItemClick(it) : undefined}
              role={clickable ? 'button' : undefined}
              tabIndex={clickable ? 0 : undefined}
              onKeyDown={clickable
                ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onItemClick(it);
                    }
                  }
                : undefined}
            >
              <div className={styles.barLabel} title={it.label}>{it.label}</div>
              <div className={styles.barTrack}>
                <div
                  className={styles.barFill}
                  style={{
                    width: `${width}%`,
                    backgroundColor: it.color,
                  }}
                />
              </div>
              <div className={styles.barValue}>
                {it.value} <span className={styles.barPct}>({pct}%)</span>
              </div>
            </div>
          );
        })}
        {total === 0 && (
          <div className={styles.empty}>Nog geen data</div>
        )}
      </div>
    </div>
  );
}

function computeStats(contacts) {
  const bySector = {};
  const byFte = {};
  const byStatus = {};
  let nl = 0;
  let withEmail = 0;
  let withLinkedin = 0;

  for (const c of contacts) {
    bySector[c.sector] = (bySector[c.sector] || 0) + 1;
    byFte[c.fteCategory] = (byFte[c.fteCategory] || 0) + 1;
    byStatus[c.status] = (byStatus[c.status] || 0) + 1;
    if (isNetherlands(c.country)) nl += 1;
    if (c.email) withEmail += 1;
    if (c.linkedinUrl) withLinkedin += 1;
  }

  return {
    total: contacts.length,
    nl,
    withEmail,
    withLinkedin,
    bySector,
    byFte,
    byStatus,
  };
}

function computeJobTitles(contacts) {
  const counts = new Map();
  for (const c of contacts) {
    const raw = (c.jobTitle || '').trim();
    if (!raw) continue;
    const key = raw;
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return [...counts.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label));
}

function isNetherlands(country) {
  if (!country) return false;
  const v = String(country).toLowerCase().trim();
  return v === 'netherlands' || v === 'the netherlands' || v === 'nederland' || v === 'nl';
}

function statusColor(status) {
  switch (status) {
    case 'Nieuw': return '#4338CA';
    case 'Warm': return '#C2410C';
    case 'Benaderd': return '#854D0E';
    case 'Gesprek gevoerd': return '#075985';
    case 'Klant': return '#166534';
    default: return '#6B7280';
  }
}

function resellerStatusColor(status) {
  switch (status) {
    case 'Nieuw': return '#4338CA';
    case 'Warm': return '#C2410C';
    case 'Benaderd': return '#854D0E';
    case 'Gesprek gevoerd': return '#075985';
    case 'Partner': return '#00a878';
    default: return '#6B7280';
  }
}

function computeResellerStats(resellers) {
  const byFit = {};
  const byType = {};
  const byStatus = {};
  let partners = 0;
  let withEmail = 0;
  for (const r of resellers) {
    byFit[r.mensysFit] = (byFit[r.mensysFit] || 0) + 1;
    byType[r.resellerType] = (byType[r.resellerType] || 0) + 1;
    byStatus[r.status] = (byStatus[r.status] || 0) + 1;
    if (r.status === 'Partner') partners += 1;
    if (r.email) withEmail += 1;
  }
  return {
    total: resellers.length,
    partners,
    withEmail,
    byFit,
    byType,
    byStatus,
  };
}
