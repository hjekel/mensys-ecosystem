import { useEffect, useMemo, useRef, useState } from 'react';
import FilterDropdown from '../components/FilterDropdown.jsx';
import ContactDetailPanel from '../components/ContactDetailPanel.jsx';
import ResellerDetailPanel from '../components/ResellerDetailPanel.jsx';
import OpenerModal from '../components/OpenerModal.jsx';
import { updateContact } from '../utils/storage.js';
import {
  fetchAllSignalen,
  matchCompanies,
  mergeSignalen,
  loadSignalen,
  saveSignalen,
  shouldRefetch,
  setLastFetch,
  loadLastFetch,
} from '../utils/signaalFetcher.js';
import { rankInkopers, rankResellers } from '../utils/lhf.js';
import { updateReseller, deleteReseller } from '../store/resellersStore.js';
import { getConcurrenten } from '../store/concurrentenStore.js';
import styles from './SignalenPage.module.css';

const TYPE_LABELS = {
  vakblad: 'Vakblad',
  'ai-tools': 'AI-tools',
  bedrijfsnieuws: 'Bedrijfsnieuws',
};

const TYPE_COLORS = {
  vakblad: { bg: '#e6f7f2', fg: '#00a878' },
  'ai-tools': { bg: '#fff3eb', fg: '#E8500A' },
  bedrijfsnieuws: { bg: '#f3eaf7', fg: '#7C3AED' },
};

export default function SignalenPage({ contacts, setContacts, resellers, setResellers }) {
  const [signalen, setSignalenState] = useState(() => loadSignalen());
  const [loading, setLoading] = useState(false);
  const [sourceStats, setSourceStats] = useState(null);
  const [typeFilter, setTypeFilter] = useState('');
  const [showLinkedOnly, setShowLinkedOnly] = useState(false);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [detail, setDetail] = useState(null);
  const [detailSource, setDetailSource] = useState(null);
  const [openerContext, setOpenerContext] = useState(null);
  const [openerTargetId, setOpenerTargetId] = useState(null);
  const [openerTargetSource, setOpenerTargetSource] = useState(null);
  const initRef = useRef(false);

  const topCompanies = useMemo(() => {
    const inkopersTop = rankInkopers(contacts).slice(0, 15).map((r) => r.record.company).filter(Boolean);
    const resellersTop = rankResellers(resellers).slice(0, 15).map((r) => r.record.bedrijf).filter(Boolean);
    return Array.from(new Set([...inkopersTop, ...resellersTop])).slice(0, 20);
  }, [contacts, resellers]);

  const allCompanies = useMemo(() => {
    const list = [];
    for (const c of contacts) if (c.company) list.push(c.company);
    for (const r of resellers) if (r.bedrijf) list.push(r.bedrijf);
    return Array.from(new Set(list));
  }, [contacts, resellers]);

  const concurrentenList = useMemo(() => getConcurrenten(), []);

  async function refresh() {
    if (loading) return;
    setLoading(true);
    try {
      const { items, stats } = await fetchAllSignalen(topCompanies);
      setSignalenState((prev) => {
        const merged = mergeSignalen(prev, items);
        return matchCompanies(merged, allCompanies);
      });
      setSourceStats(stats || null);
      setLastFetch();
    } catch {
      // stille foutafhandeling: toon alleen wat er is
      setSourceStats(null);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    if (shouldRefetch()) {
      refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    saveSignalen(signalen);
  }, [signalen]);

  function updateSignal(id, patch) {
    setSignalenState((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  function markAllRead() {
    setSignalenState((prev) => prev.map((s) => ({ ...s, gelezen: true })));
  }

  function openCompanyDetail(companyName) {
    const inkoper = contacts.find((c) => (c.company || '').toLowerCase() === companyName.toLowerCase());
    if (inkoper) {
      setDetail(inkoper);
      setDetailSource('inkopers');
      return;
    }
    const reseller = resellers.find((r) => (r.bedrijf || '').toLowerCase() === companyName.toLowerCase());
    if (reseller) {
      setDetail(reseller);
      setDetailSource('resellers');
    }
  }

  const countsByType = useMemo(() => {
    const counts = { vakblad: 0, 'ai-tools': 0, bedrijfsnieuws: 0 };
    for (const s of signalen) {
      if (!s.gelezen) counts[s.type] = (counts[s.type] || 0) + 1;
    }
    return counts;
  }, [signalen]);

  const totalUnread = Object.values(countsByType).reduce((a, b) => a + b, 0);

  const typeOptions = [
    { value: 'vakblad', label: `Vakblad`, count: countsByType.vakblad || 0 },
    { value: 'ai-tools', label: `AI-tools`, count: countsByType['ai-tools'] || 0 },
    { value: 'bedrijfsnieuws', label: `Bedrijfsnieuws`, count: countsByType.bedrijfsnieuws || 0 },
  ];

  const filtered = useMemo(() => {
    return signalen.filter((s) => {
      if (typeFilter && s.type !== typeFilter) return false;
      if (showLinkedOnly && (s.gekoppeld || []).length === 0) return false;
      if (showUnreadOnly && s.gelezen) return false;
      return true;
    });
  }, [signalen, typeFilter, showLinkedOnly, showUnreadOnly]);

  const lastFetch = loadLastFetch();

  // Inkoper detail handlers
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
    setDetailSource(null);
  }

  // Reseller detail handlers
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
    setDetailSource(null);
  }

  function openOpenerForSignal(signal) {
    const first = (signal.gekoppeld || [])[0];
    if (!first) return;
    const lower = first.toLowerCase();
    const inkoper = contacts.find((c) => (c.company || '').toLowerCase() === lower);
    if (inkoper) {
      const naam = `${inkoper.firstName || ''} ${inkoper.lastName || ''}`.trim();
      setOpenerContext({
        naam,
        functie: inkoper.jobTitle || '',
        bedrijf: inkoper.company || '',
        signaal: `${signal.titel}${signal.samenvatting ? ' - ' + signal.samenvatting : ''}`,
        doelgroep: 'inkoper',
      });
      setOpenerTargetId(inkoper.id);
      setOpenerTargetSource('inkopers');
      return;
    }
    const reseller = resellers.find((r) => (r.bedrijf || '').toLowerCase() === lower);
    if (reseller) {
      const naam = `${reseller.voornaam || ''} ${reseller.achternaam || ''}`.trim();
      setOpenerContext({
        naam,
        functie: reseller.functietitel || '',
        bedrijf: reseller.bedrijf || '',
        signaal: `${signal.titel}${signal.samenvatting ? ' - ' + signal.samenvatting : ''}`,
        doelgroep: 'reseller',
      });
      setOpenerTargetId(reseller.id);
      setOpenerTargetSource('resellers');
    }
  }

  function handleSaveOpenerAsNotitie(text) {
    if (!openerTargetId) return;
    const stamp = new Date().toLocaleDateString('nl-NL');
    const prefix = `Opener (${stamp}):\n`;
    if (openerTargetSource === 'inkopers') {
      const c = contacts.find((x) => x.id === openerTargetId);
      if (!c) return;
      const combined = c.notes ? `${c.notes}\n\n${prefix}${text}` : `${prefix}${text}`;
      setContacts((prev) => updateContact(prev, openerTargetId, { notes: combined }));
    } else if (openerTargetSource === 'resellers') {
      const r = resellers.find((x) => x.id === openerTargetId);
      if (!r) return;
      const combined = r.notities ? `${r.notities}\n\n${prefix}${text}` : `${prefix}${text}`;
      setResellers((prev) => updateReseller(prev, openerTargetId, { notities: combined }));
    }
  }

  return (
    <div className={styles.page}>
      <section className={styles.summary}>
        <div className={styles.summaryLeft}>
          <div className={styles.summaryTotal}>
            <span className={styles.totalValue}>{totalUnread}</span>
            <span className={styles.totalLabel}>ongelezen signalen</span>
          </div>
          <div className={styles.summaryBreakdown}>
            {Object.entries(TYPE_LABELS).map(([key, label]) => {
              const colors = TYPE_COLORS[key];
              return (
                <button
                  key={key}
                  type="button"
                  className={`${styles.typePill} ${typeFilter === key ? styles.typePillActive : ''}`}
                  style={{ backgroundColor: colors.bg, color: colors.fg }}
                  onClick={() => setTypeFilter((v) => (v === key ? '' : key))}
                >
                  {label} ({countsByType[key] || 0})
                </button>
              );
            })}
          </div>
        </div>
        <div className={styles.summaryRight}>
          {lastFetch && (
            <span className={styles.lastFetch}>
              Laatst opgehaald: {formatRelative(lastFetch)}
            </span>
          )}
          <button type="button" className="btn btn-ghost" onClick={markAllRead}>
            Markeer alles gelezen
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={refresh}
            disabled={loading}
          >
            {loading ? 'Bezig...' : 'Ververs nu'}
          </button>
        </div>
      </section>

      <section className={styles.filters}>
        <FilterDropdown
          allLabel="Alle typen"
          value={typeFilter}
          onChange={setTypeFilter}
          options={typeOptions}
        />
        <label className={styles.toggleLabel}>
          <input
            type="checkbox"
            checked={showLinkedOnly}
            onChange={(e) => setShowLinkedOnly(e.target.checked)}
          />
          Alleen gekoppeld aan database
        </label>
        <label className={styles.toggleLabel}>
          <input
            type="checkbox"
            checked={showUnreadOnly}
            onChange={(e) => setShowUnreadOnly(e.target.checked)}
          />
          Alleen ongelezen
        </label>
        <span className={styles.resultCount}>
          {filtered.length} van {signalen.length} signalen
        </span>
      </section>

      {sourceStats && partialLoad(sourceStats) && (
        <div className={styles.sourceNote}>
          {summariseStats(sourceStats)}
        </div>
      )}

      {filtered.length === 0 && !loading && (
        <div className={styles.empty}>
          {signalen.length === 0
            ? 'Geen signalen opgehaald. Klik "Ververs nu" om de bronnen op te halen.'
            : 'Geen signalen passen bij de huidige filters.'}
        </div>
      )}

      <div className={styles.list}>
        {filtered.map((s) => (
          <SignalCard
            key={s.id}
            signal={s}
            onToggleGelezen={() => updateSignal(s.id, { gelezen: !s.gelezen })}
            onToggleOpgeslagen={() => updateSignal(s.id, { opgeslagen: !s.opgeslagen })}
            onCompanyClick={openCompanyDetail}
            onOpenerClick={() => openOpenerForSignal(s)}
            canOpener={(s.gekoppeld || []).length > 0}
            concurrenten={concurrentenList}
          />
        ))}
      </div>

      {detailSource === 'inkopers' && detail && (
        <ContactDetailPanel
          contact={detail}
          onClose={() => { setDetail(null); setDetailSource(null); }}
          onEdit={() => { setDetail(null); setDetailSource(null); }}
          onDelete={handleInkoperDelete}
          onStatusChange={handleInkoperStatusChange}
        />
      )}
      {detailSource === 'resellers' && detail && (
        <ResellerDetailPanel
          reseller={detail}
          onClose={() => { setDetail(null); setDetailSource(null); }}
          onDelete={handleResellerDelete}
          onSave={handleResellerSave}
        />
      )}

      <OpenerModal
        open={Boolean(openerContext)}
        context={openerContext}
        onClose={() => {
          setOpenerContext(null);
          setOpenerTargetId(null);
          setOpenerTargetSource(null);
        }}
        onSaveAsNotitie={handleSaveOpenerAsNotitie}
      />
    </div>
  );
}

function SignalCard({ signal, onToggleGelezen, onToggleOpgeslagen, onCompanyClick, onOpenerClick, canOpener, concurrenten = [] }) {
  const colors = TYPE_COLORS[signal.type] || TYPE_COLORS.bedrijfsnieuws;
  const matchedConcurrenten = (() => {
    const hay = `${signal.titel || ''} ${signal.samenvatting || ''}`.toLowerCase();
    const hits = [];
    for (const c of concurrenten) {
      const naam = String(c.naam || '').trim();
      if (naam.length < 3) continue;
      if (hay.includes(naam.toLowerCase())) hits.push(naam);
    }
    return hits;
  })();
  return (
    <article className={`${styles.card} ${signal.gelezen ? styles.cardRead : ''}`}>
      <div className={styles.cardHeader}>
        <span className={styles.typeBadge} style={{ background: colors.bg, color: colors.fg }}>
          {TYPE_LABELS[signal.type] || signal.type}
        </span>
        <a
          href={signal.url}
          target="_blank"
          rel="noreferrer noopener"
          className={styles.titel}
        >
          {signal.titel}
        </a>
        <span className={styles.meta}>
          {signal.bron} · {formatDate(signal.datum)}
        </span>
      </div>
      {signal.samenvatting && (
        <p className={styles.samenvatting}>{signal.samenvatting}</p>
      )}
      {signal.gekoppeld && signal.gekoppeld.length > 0 && (
        <div className={styles.chips}>
          <span className={styles.chipsLabel}>Gekoppeld:</span>
          {signal.gekoppeld.map((c) => (
            <button
              key={c}
              type="button"
              className={styles.chip}
              onClick={() => onCompanyClick(c)}
              title={`Open ${c}`}
            >
              {c}
            </button>
          ))}
        </div>
      )}
      {matchedConcurrenten.length > 0 && (
        <div className={styles.chips}>
          <span className={styles.chipsLabel}>Concurrent:</span>
          {matchedConcurrenten.map((c) => (
            <span key={c} className={styles.chipConcurrent}>{c}</span>
          ))}
        </div>
      )}
      <div className={styles.actions}>
        <button
          type="button"
          className={`${styles.actionBtn} ${signal.gelezen ? styles.actionActive : ''}`}
          onClick={onToggleGelezen}
        >
          {signal.gelezen ? 'Ongelezen maken' : 'Gelezen'}
        </button>
        <button
          type="button"
          className={`${styles.actionBtn} ${signal.opgeslagen ? styles.actionActive : ''}`}
          onClick={onToggleOpgeslagen}
        >
          {signal.opgeslagen ? 'Opgeslagen' : 'Bewaar'}
        </button>
        {canOpener ? (
          <button
            type="button"
            className={styles.openerBtn}
            onClick={onOpenerClick}
            title="Genereer opener met Claude"
          >
            Gebruik als opener
          </button>
        ) : (
          <span className={styles.actionDisabled} title="Koppel eerst een bedrijf om een opener te kunnen genereren">
            Gebruik als opener
          </span>
        )}
      </div>
    </article>
  );
}

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('nl-NL', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return '';
  }
}

function partialLoad(stats) {
  if (!stats) return false;
  for (const v of Object.values(stats)) {
    if (v && typeof v.ok === 'number' && typeof v.total === 'number' && v.ok < v.total) return true;
  }
  return false;
}

function summariseStats(stats) {
  const parts = [];
  for (const [key, v] of Object.entries(stats)) {
    if (v && typeof v.ok === 'number') {
      const label = TYPE_LABELS[key] || key;
      parts.push(`${label}: ${v.ok}/${v.total} bronnen geladen`);
    }
  }
  return parts.join(' · ');
}

function formatRelative(ms) {
  const diff = Date.now() - ms;
  const min = Math.round(diff / 60000);
  if (min < 1) return 'zojuist';
  if (min < 60) return `${min} min geleden`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr} uur geleden`;
  const days = Math.round(hr / 24);
  return `${days} dag${days === 1 ? '' : 'en'} geleden`;
}
