import { useEffect, useMemo, useState } from 'react';
import ResellerFilters from '../components/ResellerFilters.jsx';
import ResellerKanban from '../components/ResellerKanban.jsx';
import ResellerListView from '../components/ResellerListView.jsx';
import ResellerDetailPanel from '../components/ResellerDetailPanel.jsx';
import ResellerFormModal from '../components/ResellerFormModal.jsx';
import CSVImportModal from '../components/CSVImportModal.jsx';
import OpenerModal from '../components/OpenerModal.jsx';
import { resellersToCsv } from '../utils/resellerCsv.js';
import { downloadCsv } from '../utils/csvParser.js';
import {
  addReseller,
  updateReseller,
  deleteReseller,
} from '../store/resellersStore.js';
import { applyResellerCleanup, planResellerCleanup } from '../utils/resellerCleanup.js';
import { voegActiviteitToe, bouwLaatsteActiviteitIndex } from '../store/activiteitenStore.js';
import { defaultUitvoerder } from '../utils/activiteitenUtils.js';
import { leesVoorkeur, schrijfVoorkeur } from '../utils/viewVoorkeur.js';
import styles from './ResellersPage.module.css';

export default function ResellersPage({ resellers, setResellers, onFilteredCountChange, initialFilter }) {
  const [query, setQuery] = useState('');
  const [resellerType, setResellerType] = useState('');
  const [fteRange, setFteRange] = useState('');
  const [mensysFit, setMensysFit] = useState('');
  const [status, setStatus] = useState('');
  const [view, setView] = useState(() => leesVoorkeur('resellers'));

  function handleViewChange(next) {
    setView(next);
    schrijfVoorkeur('resellers', next);
  }

  const [detail, setDetail] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formInitial, setFormInitial] = useState(null);
  const [activiteitenTick, setActiviteitenTick] = useState(0);
  const [openerContext, setOpenerContext] = useState(null);
  const [openerInitialModus, setOpenerInitialModus] = useState('koud');
  const [openerTargetId, setOpenerTargetId] = useState(null);

  const laatsteActiviteitIndex = useMemo(
    () => bouwLaatsteActiviteitIndex('reseller'),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activiteitenTick, resellers.length],
  );
  const [importOpen, setImportOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return resellers.filter((r) => {
      if (resellerType && r.resellerType !== resellerType) return false;
      if (fteRange && r.fteRange !== fteRange) return false;
      if (mensysFit && r.mensysFit !== mensysFit) return false;
      if (status && r.status !== status) return false;
      if (q) {
        const hay = `${r.bedrijf || ''} ${r.voornaam || ''} ${r.achternaam || ''} ${r.functietitel || ''} ${r.keywords || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [resellers, query, resellerType, fteRange, mensysFit, status]);

  useEffect(() => {
    if (onFilteredCountChange) onFilteredCountChange(filtered.length);
  }, [filtered.length, onFilteredCountChange]);

  useEffect(() => {
    if (!initialFilter) return;
    if (initialFilter.resellerType !== undefined) setResellerType(initialFilter.resellerType);
    if (initialFilter.fteRange !== undefined) setFteRange(initialFilter.fteRange);
    if (initialFilter.mensysFit !== undefined) setMensysFit(initialFilter.mensysFit);
    if (initialFilter.status !== undefined) setStatus(initialFilter.status);
    if (initialFilter.query !== undefined) setQuery(initialFilter.query);
    if (initialFilter.view !== undefined) setView(initialFilter.view);
  }, [initialFilter]);

  const facetCounts = useMemo(() => {
    const q = query.trim().toLowerCase();
    function matchQuery(r) {
      if (!q) return true;
      const hay = `${r.bedrijf || ''} ${r.voornaam || ''} ${r.achternaam || ''} ${r.functietitel || ''} ${r.keywords || ''}`.toLowerCase();
      return hay.includes(q);
    }
    const typeCounts = {};
    const fteCounts = {};
    const fitCounts = {};
    const statusCounts = {};
    resellers.forEach((r) => {
      if (!matchQuery(r)) return;
      const passType = !resellerType || r.resellerType === resellerType;
      const passFte = !fteRange || r.fteRange === fteRange;
      const passFit = !mensysFit || r.mensysFit === mensysFit;
      const passStatus = !status || r.status === status;
      if (passFte && passFit && passStatus && r.resellerType) {
        typeCounts[r.resellerType] = (typeCounts[r.resellerType] || 0) + 1;
      }
      if (passType && passFit && passStatus && r.fteRange) {
        fteCounts[r.fteRange] = (fteCounts[r.fteRange] || 0) + 1;
      }
      if (passType && passFte && passStatus && r.mensysFit) {
        fitCounts[r.mensysFit] = (fitCounts[r.mensysFit] || 0) + 1;
      }
      if (passType && passFte && passFit && r.status) {
        statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
      }
    });
    return {
      resellerType: typeCounts,
      fteRange: fteCounts,
      mensysFit: fitCounts,
      status: statusCounts,
    };
  }, [resellers, query, resellerType, fteRange, mensysFit, status]);

  function handleStatusChange(reseller, newStatus) {
    if (reseller.status === newStatus) return;
    const oldStatus = reseller.status || 'Nieuw';
    setResellers((prev) => updateReseller(prev, reseller.id, { status: newStatus }));
    const naam = reseller.bedrijf
      || `${reseller.voornaam || ''} ${reseller.achternaam || ''}`.trim();
    voegActiviteitToe({
      contactId: reseller.id,
      contactType: 'reseller',
      contactNaam: naam,
      type: 'status_wijziging',
      richting: 'intern',
      uitvoerder: defaultUitvoerder(),
      kort: `Status: ${oldStatus} naar ${newStatus}`,
    });
    setActiviteitenTick((t) => t + 1);
    if (detail && detail.id === reseller.id) {
      setDetail({ ...reseller, status: newStatus });
    }
  }

  function handleDelete(reseller) {
    setResellers((prev) => deleteReseller(prev, reseller.id));
    if (detail && detail.id === reseller.id) setDetail(null);
  }

  function handleDeleteFromDetail(reseller) {
    const label = reseller.bedrijf ||
      `${reseller.voornaam || ''} ${reseller.achternaam || ''}`.trim() ||
      'deze reseller';
    if (confirm(`Verwijder ${label}?`)) {
      handleDelete(reseller);
    }
  }

  function handleSaveDetail(id, values) {
    setResellers((prev) => updateReseller(prev, id, values));
    setDetail((d) => (d && d.id === id ? { ...d, ...values } : d));
  }

  function handleEdit(reseller) {
    setFormInitial(reseller);
    setFormOpen(true);
    setDetail(null);
  }

  function handleAdd() {
    setFormInitial(null);
    setFormOpen(true);
  }

  function handleSaveForm(formValues) {
    if (formInitial?.id) {
      setResellers((prev) => updateReseller(prev, formInitial.id, formValues));
    } else {
      setResellers((prev) => addReseller(prev, formValues));
    }
    setFormOpen(false);
    setFormInitial(null);
  }

  function handleExport() {
    const csv = resellersToCsv(filtered);
    const stamp = new Date().toISOString().slice(0, 10);
    downloadCsv(`mensys-resellers-${stamp}.csv`, csv);
  }

  function openOpener(reseller, modus) {
    const naam = `${reseller.voornaam || ''} ${reseller.achternaam || ''}`.trim();
    setOpenerContext({
      naam,
      functie: reseller.functietitel || '',
      bedrijf: reseller.bedrijf || '',
      sector: reseller.resellerType || '',
      signaal: '',
      doelgroep: 'reseller',
      linkedinAbout: reseller.linkedinAbout || '',
      linkedinPosts: reseller.linkedinPosts || '',
      vorigeJobs: [reseller.vorigeJob1 || '', reseller.vorigeJob2 || '', reseller.vorigeJob3 || ''],
    });
    setOpenerInitialModus(modus === 'warm' ? 'warm' : 'koud');
    setOpenerTargetId(reseller.id);
  }

  function handleSaveOpenerAsNotitie(text) {
    if (!openerTargetId) return;
    const stamp = new Date().toLocaleDateString('nl-NL');
    const prefix = `Opener (${stamp}):\n`;
    const r = resellers.find((x) => x.id === openerTargetId);
    if (!r) return;
    const combined = r.notities ? `${r.notities}\n\n${prefix}${text}` : `${prefix}${text}`;
    setResellers((prev) => updateReseller(prev, openerTargetId, { notities: combined }));
  }

  function handleCleanup() {
    const { toRemove, toRename } = planResellerCleanup(resellers);
    if (toRemove.length === 0 && toRename.length === 0) {
      alert('Geen opschoon-acties nodig. De lijst is schoon.');
      return;
    }
    const msg =
      `Opschonen resellers:\n` +
      `  ${toRemove.length} reseller(s) verwijderen (leeg bedrijf, kale domeinnaam, gepensioneerd)\n` +
      `  ${toRename.length} naam/naamgeving normaliseren (Title Case voor bedrijf, voornaam en achternaam, B.V. normalisatie, tussenvoegsels)\n\n` +
      `Doorgaan?`;
    if (!confirm(msg)) return;
    const { cleaned } = applyResellerCleanup(resellers);
    setResellers(cleaned);
  }

  return (
    <div className={styles.page}>
      <ResellerFilters
        query={query}
        onQueryChange={setQuery}
        resellerType={resellerType}
        onResellerTypeChange={setResellerType}
        fteRange={fteRange}
        onFteRangeChange={setFteRange}
        mensysFit={mensysFit}
        onMensysFitChange={setMensysFit}
        status={status}
        onStatusChange={setStatus}
        view={view}
        onViewChange={handleViewChange}
        onAddClick={handleAdd}
        onImportClick={() => setImportOpen(true)}
        onExportClick={handleExport}
        onCleanupClick={handleCleanup}
        totalCount={filtered.length}
        facetCounts={facetCounts}
      />

      {resellers.length === 0 ? (
        <EmptyState onImport={() => setImportOpen(true)} onAdd={handleAdd} />
      ) : view === 'kanban' ? (
        <ResellerKanban
          resellers={filtered}
          onCardOpen={setDetail}
          laatsteActiviteitIndex={laatsteActiviteitIndex}
          onStatusChange={handleStatusChange}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ) : (
        <ResellerListView
          resellers={filtered}
          onOpen={setDetail}
          laatsteActiviteitIndex={laatsteActiviteitIndex}
        />
      )}

      <ResellerDetailPanel
        reseller={detail}
        onClose={() => setDetail(null)}
        onDelete={handleDeleteFromDetail}
        onSave={handleSaveDetail}
        onActiviteitenChange={() => setActiviteitenTick((t) => t + 1)}
        onUpdateContext={handleSaveDetail}
        onOpenOpener={openOpener}
      />

      <OpenerModal
        open={Boolean(openerContext)}
        context={openerContext}
        initialModus={openerInitialModus}
        onClose={() => {
          setOpenerContext(null);
          setOpenerTargetId(null);
        }}
        onSaveAsNotitie={handleSaveOpenerAsNotitie}
      />

      <ResellerFormModal
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
        mode="resellers"
        existing={resellers}
        onClose={() => setImportOpen(false)}
        onImport={(merged) => setResellers(merged)}
      />
    </div>
  );
}

function EmptyState({ onImport, onAdd }) {
  return (
    <div className={styles.empty}>
      <div className={styles.emptyIcon}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 9l2-5h14l2 5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M3 9v11a1 1 0 001 1h16a1 1 0 001-1V9" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8 9a4 4 0 008 0" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h3>Nog geen resellers</h3>
      <p>Importeer je eerste reseller-lijst of voeg handmatig een reseller toe.</p>
      <div className={styles.emptyActions}>
        <button type="button" className="btn btn-primary" onClick={onImport}>
          CSV importeren
        </button>
        <button type="button" className="btn btn-ghost" onClick={onAdd}>
          Handmatig toevoegen
        </button>
      </div>
    </div>
  );
}
