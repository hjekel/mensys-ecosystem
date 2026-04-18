import { useEffect, useMemo, useRef, useState } from 'react';
import FilterDropdown from '../components/FilterDropdown.jsx';
import ContactDetailPanel from '../components/ContactDetailPanel.jsx';
import ResellerDetailPanel from '../components/ResellerDetailPanel.jsx';
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
import styles from './SignalenPage.module.css';

const TYPE_LABELS = {
  tenderned: 'TenderNed',
  vakblad: 'Vakblad',
  'ai-tools': 'AI-tools',
  bedrijfsnieuws: 'Bedrijfsnieuws',
};

const TYPE_COLORS = {
  tenderned: { bg: '#e8eef7', fg: '#003087' },
  vakblad: { bg: '#e6f7f2', fg: '#00a878' },
  'ai-tools': { bg: '#fff3eb', fg: '#E8500A' },
  bedrijfsnieuws: { bg: '#f3eaf7', fg: '#7C3AED' },
};

export default function SignalenPage({ contacts, setContacts, resellers, setResellers }) {
  const [signalen, setSignalenState] = useState(() => loadSignalen());
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [typeFilter, setTypeFilter] = useState('');
  const [showLinkedOnly, setShowLinkedOnly] = useState(false);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [detail, setDetail] = useState(null);
  const [detailSource, setDetailSource] = useState(null);
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

  async function refresh() {
    if (loading) return;
    setLoading(true);
    setErrors({});
    try {
      const { items, errors: fetchErrors } = await fetchAllSignalen(topCompanies);
      setSignalenState((prev) => {
        const merged = mergeSignalen(prev, items);
        return matchCompanies(merged, allCompanies);
      });
      setErrors(fetchErrors);
      setLastFetch();
    } catch (err) {
      setErrors({ algemeen: err.message || 'Onbekende fout' });
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
    const counts = { tenderned: 0, vakblad: 0, 'ai-tools': 0, bedrijfsnieuws: 0 };
    for (const s of signalen) {
      if (!s.gelezen) counts[s.type] = (counts[s.type] || 0) + 1;
    }
    return counts;
  }, [signalen]);

  const totalUnread = Object.values(countsByType).reduce((a, b) => a + b, 0);

  const typeOptions = [
    { value: 'tenderned', label: `TenderNed`, count: countsByType.tenderned || 0 },
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
    const nowIso = new Date().toISOString();
    setContacts((prev) => prev.map((c) =>
      c.id === contact.id ? { ...c, status: newStatus, updatedAt: nowIso } : c,
    ));
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

      {Object.keys(errors).length > 0 && (
        <div className={styles.errorBox}>
          <strong>Sommige bronnen gaven een fout:</strong>
          <ul>
            {Object.entries(errors).map(([k, v]) => (
              <li key={k}>{TYPE_LABELS[k] || k}: {v}</li>
            ))}
          </ul>
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
    </div>
  );
}

function SignalCard({ signal, onToggleGelezen, onToggleOpgeslagen, onCompanyClick }) {
  const colors = TYPE_COLORS[signal.type] || TYPE_COLORS.bedrijfsnieuws;
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
        <span className={styles.actionDisabled} title="Beschikbaar in Fase 2">
          Gebruik als opener
        </span>
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
