import { useEffect, useMemo, useState } from 'react';
import Filters from '../components/Filters.jsx';
import KanbanView from '../components/KanbanView.jsx';
import ListView from '../components/ListView.jsx';
import ContactDetailPanel from '../components/ContactDetailPanel.jsx';
import ContactFormModal from '../components/ContactFormModal.jsx';
import CSVImportModal from '../components/CSVImportModal.jsx';
import { ceosToCsv } from '../utils/ceoCsv.js';
import { downloadCsv } from '../utils/csvParser.js';
import { addCeo, updateCeo, deleteCeo } from '../store/ceoStore.js';
import { applyCleanup, planCleanup } from '../utils/cleanup.js';
import { detectAiTools, hasAiTool } from '../utils/aiTools.js';
import { voegActiviteitToe, bouwLaatsteActiviteitIndex } from '../store/activiteitenStore.js';
import { defaultUitvoerder } from '../utils/activiteitenUtils.js';
import { CEO_FTE_CATEGORIES } from '@shared/constants.js';
import listStyles from '../components/ListView.module.css';
import styles from './InkopersPage.module.css';

function resolveLand(c) {
  const existing = (c.country || '').trim();
  if (existing) {
    const low = existing.toLowerCase();
    if (low === 'netherlands' || low === 'the netherlands' || low === 'nederland' || low === 'nl') return 'NL';
    if (low === 'belgium' || low === 'belgie' || low === 'belgië' || low === 'be') return 'BE';
    return existing.length > 15 ? existing.slice(0, 14) + '…' : existing;
  }
  const loc = String(c.locatie || c.location || '').trim();
  if (!loc) return '';
  const lower = loc.toLowerCase();
  if (lower.includes('netherlands') || lower.includes('nederland')) return 'NL';
  if (lower.includes('belgium') || lower.includes('belgië') || lower.includes('belgie')) return 'BE';
  if (lower.includes('germany') || lower.includes('duitsland')) return 'DE';
  if (lower.includes('france') || lower.includes('frankrijk')) return 'FR';
  if (lower.includes('united kingdom') || lower.includes('england') || lower.includes('uk')) return 'UK';
  if (lower.includes('united states') || lower.includes('usa') || lower.includes(', us')) return 'US';
  return loc.length > 15 ? loc.slice(0, 14) + '…' : loc;
}

function isFirstDegree(c) {
  const src = String(c?.source || c?.bron || '').toLowerCase();
  return src.includes('1st degree') || src.includes('1e graads');
}

function FirstDegreeBadge() {
  return <span className={listStyles.firstDegreeBadge}>1e graads</span>;
}

export default function CeoPage({ ceos, setCeos, onFilteredCountChange }) {
  const [query, setQuery] = useState('');
  const [sector, setSector] = useState('');
  const [fte, setFte] = useState('');
  const [status, setStatus] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [aiTool, setAiTool] = useState('');
  const [bron, setBron] = useState('');
  const [view, setView] = useState('kanban');

  const [detail, setDetail] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formInitial, setFormInitial] = useState(null);
  const [importOpen, setImportOpen] = useState(false);
  const [activiteitenTick, setActiviteitenTick] = useState(0);

  const laatsteActiviteitIndex = useMemo(
    () => bouwLaatsteActiviteitIndex('ceo'),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activiteitenTick, ceos.length],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ceos.filter((c) => {
      if (sector && c.sector !== sector) return false;
      if (fte && c.fteCategory !== fte) return false;
      if (status && c.status !== status) return false;
      if (jobTitle && c.jobTitle !== jobTitle) return false;
      if (aiTool && !hasAiTool(c, aiTool)) return false;
      if (bron && (c.source || c.bron || '') !== bron) return false;
      if (q) {
        const hay = `${c.firstName || ''} ${c.lastName || ''} ${c.company || ''} ${c.jobTitle || ''} ${c.keywords || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [ceos, query, sector, fte, status, jobTitle, aiTool, bron]);

  useEffect(() => {
    if (onFilteredCountChange) onFilteredCountChange(filtered.length);
  }, [filtered.length, onFilteredCountChange]);

  const viewContacts = useMemo(
    () => filtered.map((c) => ({ ...c, country: resolveLand(c) })),
    [filtered],
  );

  const facetCounts = useMemo(() => {
    const q = query.trim().toLowerCase();
    function matchQuery(c) {
      if (!q) return true;
      const hay = `${c.firstName || ''} ${c.lastName || ''} ${c.company || ''} ${c.jobTitle || ''} ${c.keywords || ''}`.toLowerCase();
      return hay.includes(q);
    }
    const sectorCounts = {};
    const fteCounts = {};
    const statusCounts = {};
    const jobTitleCounts = {};
    const aiToolCounts = {};
    const bronCounts = {};
    ceos.forEach((c) => {
      if (!matchQuery(c)) return;
      const passSector = !sector || c.sector === sector;
      const passFte = !fte || c.fteCategory === fte;
      const passStatus = !status || c.status === status;
      const passJobTitle = !jobTitle || c.jobTitle === jobTitle;
      const passAiTool = !aiTool || hasAiTool(c, aiTool);
      const passBron = !bron || (c.source || c.bron || '') === bron;
      if (passFte && passStatus && passJobTitle && passAiTool && passBron && c.sector) {
        sectorCounts[c.sector] = (sectorCounts[c.sector] || 0) + 1;
      }
      if (passSector && passStatus && passJobTitle && passAiTool && passBron && c.fteCategory) {
        fteCounts[c.fteCategory] = (fteCounts[c.fteCategory] || 0) + 1;
      }
      if (passSector && passFte && passJobTitle && passAiTool && passBron && c.status) {
        statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;
      }
      if (passSector && passFte && passStatus && passAiTool && passBron && c.jobTitle) {
        jobTitleCounts[c.jobTitle] = (jobTitleCounts[c.jobTitle] || 0) + 1;
      }
      if (passSector && passFte && passStatus && passJobTitle && passBron) {
        const tools = detectAiTools(c);
        for (const t of tools) {
          aiToolCounts[t] = (aiToolCounts[t] || 0) + 1;
        }
      }
      if (passSector && passFte && passStatus && passJobTitle && passAiTool) {
        const b = c.source || c.bron || '';
        if (b) bronCounts[b] = (bronCounts[b] || 0) + 1;
      }
    });
    return {
      sector: sectorCounts,
      fte: fteCounts,
      status: statusCounts,
      jobTitle: jobTitleCounts,
      aiTool: aiToolCounts,
      bron: bronCounts,
    };
  }, [ceos, query, sector, fte, status, jobTitle, aiTool, bron]);

  const jobTitleOptions = useMemo(() => {
    const counts = facetCounts.jobTitle || {};
    return Object.entries(counts)
      .map(([k, v]) => ({ value: k, label: k, count: v }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  }, [facetCounts]);

  const aiToolOptions = useMemo(() => {
    const counts = facetCounts.aiTool || {};
    return Object.entries(counts)
      .map(([k, v]) => ({ value: k, label: k, count: v }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  }, [facetCounts]);

  const bronOptions = useMemo(() => {
    const counts = facetCounts.bron || {};
    return Object.entries(counts)
      .map(([k, v]) => ({ value: k, label: k, count: v }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  }, [facetCounts]);

  function handleStatusChange(contact, newStatus) {
    if (contact.status === newStatus) return;
    const oldStatus = contact.status || 'Nieuw';
    setCeos((prev) => updateCeo(prev, contact.id, { status: newStatus }));
    const naam = `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.company || '';
    voegActiviteitToe({
      contactId: contact.id,
      contactType: 'ceo',
      contactNaam: naam,
      type: 'status_wijziging',
      richting: 'intern',
      uitvoerder: defaultUitvoerder(),
      kort: `Status: ${oldStatus} naar ${newStatus}`,
    });
    setActiviteitenTick((t) => t + 1);
    if (detail && detail.id === contact.id) {
      setDetail({ ...contact, status: newStatus });
    }
  }

  function handleDelete(contact) {
    setCeos((prev) => deleteCeo(prev, contact.id));
    if (detail && detail.id === contact.id) setDetail(null);
  }

  function handleDeleteFromDetail(contact) {
    const name = `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'dit contact';
    if (confirm(`Verwijder ${name}?`)) handleDelete(contact);
  }

  function handleEdit(contact) {
    setFormInitial(contact);
    setFormOpen(true);
    setDetail(null);
  }

  function handleAdd() {
    setFormInitial(null);
    setFormOpen(true);
  }

  function handleSaveForm(formValues) {
    if (formInitial?.id) {
      setCeos((prev) => updateCeo(prev, formInitial.id, formValues));
    } else {
      setCeos((prev) => addCeo(prev, formValues));
    }
    setFormOpen(false);
    setFormInitial(null);
  }

  function handleExport() {
    const csv = ceosToCsv(filtered);
    const stamp = new Date().toISOString().slice(0, 10);
    downloadCsv(`mensys-ceo-md-${stamp}.csv`, csv);
  }

  function handleCleanup() {
    const { toRemove, toRename } = planCleanup(ceos);
    if (toRemove.length === 0 && toRename.length === 0) {
      alert('Geen opschoon-acties nodig. De lijst is schoon.');
      return;
    }
    const msg =
      `Opschonen CEO & MD:\n` +
      `  ${toRemove.length} contact(en) verwijderen\n` +
      `  ${toRename.length} naam/bedrijfsnaam normaliseren\n\nDoorgaan?`;
    if (!confirm(msg)) return;
    const { cleaned } = applyCleanup(ceos);
    setCeos(cleaned);
  }

  return (
    <div className={styles.page}>
      <Filters
        query={query}
        onQueryChange={setQuery}
        sector={sector}
        onSectorChange={setSector}
        fte={fte}
        onFteChange={setFte}
        status={status}
        onStatusChange={setStatus}
        jobTitle={jobTitle}
        onJobTitleChange={setJobTitle}
        jobTitleOptions={jobTitleOptions}
        aiTool={aiTool}
        onAiToolChange={setAiTool}
        aiToolOptions={aiToolOptions}
        bron={bron}
        onBronChange={setBron}
        bronOptions={bronOptions}
        view={view}
        onViewChange={setView}
        onAddClick={handleAdd}
        onImportClick={() => setImportOpen(true)}
        onExportClick={handleExport}
        onCleanupClick={handleCleanup}
        totalCount={filtered.length}
        facetCounts={facetCounts}
        fteCategories={CEO_FTE_CATEGORIES}
        searchPlaceholder="Zoek op naam, bedrijf of functie"
        addLabel="+ CEO toevoegen"
      />

      {ceos.length === 0 ? (
        <EmptyState onImport={() => setImportOpen(true)} onAdd={handleAdd} />
      ) : view === 'kanban' ? (
        <KanbanView
          contacts={filtered}
          onCardOpen={setDetail}
          onStatusChange={handleStatusChange}
          onEdit={handleEdit}
          onDelete={handleDelete}
          laatsteActiviteitIndex={laatsteActiviteitIndex}
        />
      ) : (
        <ListView
          contacts={viewContacts}
          onOpen={setDetail}
          onEdit={handleEdit}
          onDelete={handleDelete}
          badgeForContact={(c) => (isFirstDegree(c) ? <FirstDegreeBadge /> : null)}
          laatsteActiviteitIndex={laatsteActiviteitIndex}
        />
      )}

      <ContactDetailPanel
        contact={detail}
        onClose={() => setDetail(null)}
        onEdit={handleEdit}
        onDelete={handleDeleteFromDetail}
        onStatusChange={handleStatusChange}
        contactType="ceo"
        onActiviteitenChange={() => setActiviteitenTick((t) => t + 1)}
      />

      <ContactFormModal
        open={formOpen}
        initial={formInitial}
        onClose={() => {
          setFormOpen(false);
          setFormInitial(null);
        }}
        onSave={handleSaveForm}
      />

      <CSVImportModal
        open={importOpen}
        mode="ceo"
        existing={ceos}
        onClose={() => setImportOpen(false)}
        onImport={(merged) => setCeos(merged)}
      />
    </div>
  );
}

function EmptyState({ onImport, onAdd }) {
  return (
    <div className={styles.empty}>
      <div className={styles.emptyIcon}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21v-2a4 4 0 014-4h8a4 4 0 014 4v2" strokeLinecap="round" />
        </svg>
      </div>
      <h3>Nog geen CEOs of MDs</h3>
      <p>Importeer een lijst met kleine organisaties (1-50 FTE) en hun eindbeslissers.</p>
      <div className={styles.emptyActions}>
        <button type="button" className="btn btn-primary" onClick={onImport}>CSV importeren</button>
        <button type="button" className="btn btn-ghost" onClick={onAdd}>Handmatig toevoegen</button>
      </div>
    </div>
  );
}
