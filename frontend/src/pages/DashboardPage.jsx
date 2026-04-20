import { useCallback, useEffect, useMemo, useState } from 'react';
import Modal from '../components/Modal.jsx';
import HeroTile from '../components/Dashboard/HeroTile.jsx';
import PipelineFunnel from '../components/Dashboard/PipelineFunnel.jsx';
import VandaagBenaderen from '../components/Dashboard/VandaagBenaderen.jsx';
import TodoLijst from '../components/Dashboard/TodoLijst.jsx';
import TodoModal from '../components/Dashboard/TodoModal.jsx';
import ActiviteitFeed from '../components/Dashboard/ActiviteitFeed.jsx';
import WorkflowHandleiding from '../components/Dashboard/WorkflowHandleiding.jsx';
import BackupWaarschuwingBanner from '../components/Backup/BackupWaarschuwingBanner.jsx';
import ContactDetailPanel from '../components/ContactDetailPanel.jsx';
import ResellerDetailPanel from '../components/ResellerDetailPanel.jsx';
import ActiviteitEntry from '../components/ActiviteitenLog/ActiviteitEntry.jsx';
import {
  getVersie as getActiviteitenVersie,
  subscribe as subscribeActiviteiten,
  getActiviteitenInPeriode,
} from '../store/activiteitenStore.js';
import {
  getVersie as getTodosVersie,
  subscribe as subscribeTodos,
  loadTodos,
  voegTodoToe,
  updateTodo,
  verwijderTodo,
  cycleStatus,
} from '../store/todosStore.js';
import {
  getContactmomentenInPeriode,
  getConnectieStats,
  getReplyStats,
  getGesprekkenInMaand,
  getPipelineCounts,
  getVandaagBenaderen,
} from '../utils/dashboardUtils.js';
import { DEFAULT_DOELEN } from '../utils/instellingen.js';
import { updateContact } from '../utils/storage.js';
import { updateCeo, deleteCeo } from '../store/ceoStore.js';
import { updateReseller, deleteReseller } from '../store/resellersStore.js';
import styles from './DashboardPage.module.css';

const DAY_MS = 24 * 60 * 60 * 1000;

function begroeting(naam) {
  const uur = new Date().getHours();
  const voornaam = (naam && String(naam).trim()) || 'Henk';
  if (uur < 12) return `Goedemorgen ${voornaam}`;
  if (uur < 18) return `Goedemiddag ${voornaam}`;
  return `Goedenavond ${voornaam}`;
}

function datumNL(datum) {
  try {
    return datum.toLocaleDateString('nl-NL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

function isoStartVanWeek() {
  const nu = new Date();
  const weekGeleden = new Date(nu.getTime() - 7 * DAY_MS);
  return { start: weekGeleden.toISOString(), eind: nu.toISOString() };
}

export default function DashboardPage({
  contacts,
  setContacts,
  resellers,
  setResellers,
  ceos,
  setCeos,
  instellingen,
  onOpenSettings,
  onNavigate,
}) {
  const [activiteitenTick, setActiviteitenTick] = useState(() => getActiviteitenVersie());
  const [todosTick, setTodosTick] = useState(() => getTodosVersie());

  const [todoModalOpen, setTodoModalOpen] = useState(false);
  const [todoModalInitial, setTodoModalInitial] = useState(null);

  const [contactmomentenModalOpen, setContactmomentenModalOpen] = useState(false);
  const [connectiesModalOpen, setConnectiesModalOpen] = useState(false);
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [gesprekkenModalOpen, setGesprekkenModalOpen] = useState(false);

  const [inkoperDetail, setInkoperDetail] = useState(null);
  const [ceoDetail, setCeoDetail] = useState(null);
  const [resellerDetail, setResellerDetail] = useState(null);

  useEffect(() => {
    const unsubA = subscribeActiviteiten((v) => setActiviteitenTick(v));
    const unsubT = subscribeTodos((v) => setTodosTick(v));
    return () => {
      unsubA();
      unsubT();
    };
  }, []);

  const doelen = instellingen?.doelen || DEFAULT_DOELEN;
  const gebruiker = instellingen?.gebruikersnaam;
  const nu = new Date();
  const vandaagTekst = datumNL(nu);

  const contactmomentenLijst = useMemo(() => {
    void activiteitenTick;
    const { start, eind } = isoStartVanWeek();
    return getContactmomentenInPeriode(start, eind);
  }, [activiteitenTick]);

  const contactmomentenAantal = contactmomentenLijst.length;
  const contactmomentenPct = doelen.contactmomentenPerWeek > 0
    ? Math.round((contactmomentenAantal / doelen.contactmomentenPerWeek) * 100)
    : 0;

  const connectieStats = useMemo(() => {
    void activiteitenTick;
    return getConnectieStats(30);
  }, [activiteitenTick]);

  const connectiesLijst = useMemo(() => {
    if (!connectiesModalOpen) return [];
    void activiteitenTick;
    const start = new Date(Date.now() - 30 * DAY_MS).toISOString();
    const eind = new Date().toISOString();
    return getActiviteitenInPeriode(start, eind).filter(
      (a) => a.type === 'linkedin_connectie' || a.type === 'linkedin_geaccepteerd',
    );
  }, [connectiesModalOpen, activiteitenTick]);

  const replyStats = useMemo(() => {
    void activiteitenTick;
    return getReplyStats(30);
  }, [activiteitenTick]);

  const replyLijst = useMemo(() => {
    if (!replyModalOpen) return [];
    void activiteitenTick;
    const start = new Date(Date.now() - 30 * DAY_MS).toISOString();
    const eind = new Date().toISOString();
    return getActiviteitenInPeriode(start, eind).filter(
      (a) => a.type === 'linkedin_reactie' || a.type === 'email_inkomend',
    );
  }, [replyModalOpen, activiteitenTick]);

  const gesprekkenLijst = useMemo(() => {
    void activiteitenTick;
    return getGesprekkenInMaand(nu.getFullYear(), nu.getMonth());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activiteitenTick, nu.getFullYear(), nu.getMonth()]);

  const pipeline = useMemo(
    () => getPipelineCounts({ contacts, ceos, resellers }),
    [contacts, ceos, resellers],
  );

  const vandaagBenaderen = useMemo(
    () => getVandaagBenaderen(5, { contacts, ceos, resellers }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activiteitenTick, contacts.length, ceos.length, resellers.length],
  );

  const todos = useMemo(() => {
    void todosTick;
    return loadTodos();
  }, [todosTick]);

  function handleOpenTodoNieuw() {
    setTodoModalInitial(null);
    setTodoModalOpen(true);
  }

  function handleOpenTodoEdit(todo) {
    setTodoModalInitial(todo);
    setTodoModalOpen(true);
  }

  function handleSaveTodo(values) {
    if (values.id) {
      updateTodo(values.id, values);
    } else {
      voegTodoToe(values);
    }
    setTodoModalOpen(false);
    setTodoModalInitial(null);
  }

  function handleDeleteTodo(id) {
    verwijderTodo(id);
    setTodoModalOpen(false);
    setTodoModalInitial(null);
  }

  function handleCycleTodo(id) {
    cycleStatus(id);
  }

  function handleVandaagClick(record, contactType) {
    if (contactType === 'inkoper') setInkoperDetail(record);
    else if (contactType === 'ceo') setCeoDetail(record);
    else if (contactType === 'reseller') setResellerDetail(record);
  }

  function handlePipelineClick(status) {
    if (onNavigate) onNavigate('inkopers', { status });
  }

  function handleMeerZien() {
    if (onNavigate) onNavigate('yalc');
  }

  function handleActiviteitOpen(activiteit) {
    const { contactType, contactId } = activiteit;
    if (contactType === 'inkoper') {
      const c = contacts.find((x) => x.id === contactId);
      if (c) setInkoperDetail(c);
    } else if (contactType === 'ceo') {
      const c = ceos.find((x) => x.id === contactId);
      if (c) setCeoDetail(c);
    } else if (contactType === 'reseller') {
      const r = resellers.find((x) => x.id === contactId);
      if (r) setResellerDetail(r);
    }
  }

  const contactPools = useMemo(
    () => ({ inkopers: contacts, ceos, resellers }),
    [contacts, ceos, resellers],
  );

  const handleInkoperStatus = useCallback((c, newStatus) => {
    if (c.status === newStatus) return;
    setContacts((prev) => updateContact(prev, c.id, { status: newStatus }));
    setInkoperDetail((d) => (d && d.id === c.id ? { ...d, status: newStatus } : d));
  }, [setContacts]);

  const handleInkoperContext = useCallback((id, patch) => {
    setContacts((prev) => updateContact(prev, id, patch));
    setInkoperDetail((d) => (d && d.id === id ? { ...d, ...patch } : d));
  }, [setContacts]);

  const handleCeoStatus = useCallback((c, newStatus) => {
    if (c.status === newStatus || !setCeos) return;
    setCeos((prev) => updateCeo(prev, c.id, { status: newStatus }));
    setCeoDetail((d) => (d && d.id === c.id ? { ...d, status: newStatus } : d));
  }, [setCeos]);

  const handleCeoContext = useCallback((id, patch) => {
    if (!setCeos) return;
    setCeos((prev) => updateCeo(prev, id, patch));
    setCeoDetail((d) => (d && d.id === id ? { ...d, ...patch } : d));
  }, [setCeos]);

  const handleCeoDelete = useCallback((c) => {
    const naam = `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'dit contact';
    if (!confirm(`Verwijder ${naam}?`)) return;
    if (!setCeos) return;
    setCeos((prev) => deleteCeo(prev, c.id));
    setCeoDetail(null);
  }, [setCeos]);

  const handleInkoperDelete = useCallback((c) => {
    const naam = `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'dit contact';
    if (!confirm(`Verwijder ${naam}?`)) return;
    setContacts((prev) => prev.filter((x) => x.id !== c.id));
    setInkoperDetail(null);
  }, [setContacts]);

  const handleResellerSave = useCallback((id, values) => {
    setResellers((prev) => updateReseller(prev, id, values));
    setResellerDetail((d) => (d && d.id === id ? { ...d, ...values } : d));
  }, [setResellers]);

  const handleResellerDelete = useCallback((r) => {
    const label = r.bedrijf || `${r.voornaam || ''} ${r.achternaam || ''}`.trim() || 'deze reseller';
    if (!confirm(`Verwijder ${label}?`)) return;
    setResellers((prev) => deleteReseller(prev, r.id));
    setResellerDetail(null);
  }, [setResellers]);

  return (
    <div className={styles.page}>
      <section className={styles.header}>
        <div className={styles.headerLinks}>
          <h1 className={styles.paginaTitel}>Dashboard</h1>
          <div className={styles.begroeting}>{begroeting(gebruiker)}</div>
        </div>
        <div className={styles.headerRechts}>
          <div className={styles.datum}>{vandaagTekst}</div>
          {onOpenSettings && (
            <button
              type="button"
              className={styles.cogBtn}
              onClick={onOpenSettings}
              aria-label="Instellingen"
              title="Instellingen"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33h.01a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>
      </section>

      <BackupWaarschuwingBanner />

      <section className={styles.heroRij}>
        <HeroTile
          label="Contactmomenten deze week"
          waarde={contactmomentenAantal}
          subLabel={`${contactmomentenAantal} van ${doelen.contactmomentenPerWeek}, ${contactmomentenPct}%`}
          percentage={contactmomentenPct}
          toonProgress
          accentNeutraal={contactmomentenAantal === 0}
          onClick={() => setContactmomentenModalOpen(true)}
        />
        <HeroTile
          label="Connectie-acceptatie (30d)"
          waarde={connectieStats.percentage}
          eenheid="%"
          subLabel={`${connectieStats.geaccepteerd} van ${connectieStats.verzonden} verzonden`}
          onClick={() => setConnectiesModalOpen(true)}
        />
        <HeroTile
          label="Reply rate (30d)"
          waarde={replyStats.percentage}
          eenheid="%"
          subLabel={`${replyStats.beantwoord} reacties op ${replyStats.verstuurd} berichten`}
          onClick={() => setReplyModalOpen(true)}
        />
        <HeroTile
          label="Gesprekken deze maand"
          waarde={gesprekkenLijst.length}
          subLabel={`Doel: ${doelen.gesprekkenPerMaand} per maand`}
          onClick={() => setGesprekkenModalOpen(true)}
        />
      </section>

      <section className={styles.tweeKolom6040}>
        <PipelineFunnel
          statuses={pipeline.statuses}
          counts={pipeline.counts}
          conversie={pipeline.conversie}
          onStatusClick={handlePipelineClick}
        />
        <VandaagBenaderen
          rijen={vandaagBenaderen}
          onOpen={handleVandaagClick}
          onMeerZien={handleMeerZien}
          tick={activiteitenTick}
        />
      </section>

      <section className={styles.tweeKolom5050}>
        <TodoLijst
          todos={todos}
          onAdd={handleOpenTodoNieuw}
          onCycleStatus={handleCycleTodo}
          onEdit={handleOpenTodoEdit}
        />
        <ActiviteitFeed
          tick={activiteitenTick}
          onOpenContact={handleActiviteitOpen}
        />
      </section>

      <WorkflowHandleiding onNavigate={onNavigate} />

      <TodoModal
        open={todoModalOpen}
        initial={todoModalInitial}
        onClose={() => {
          setTodoModalOpen(false);
          setTodoModalInitial(null);
        }}
        onSave={handleSaveTodo}
        onDelete={handleDeleteTodo}
        contactPools={contactPools}
      />

      <Modal
        open={contactmomentenModalOpen}
        title={`Contactmomenten deze week (${contactmomentenAantal})`}
        onClose={() => setContactmomentenModalOpen(false)}
        size="lg"
      >
        {contactmomentenLijst.length === 0 ? (
          <div className={styles.modalLeeg}>Nog geen contactmomenten deze week.</div>
        ) : (
          <div className={styles.modalLijst}>
            {contactmomentenLijst.map((a) => (
              <ActiviteitEntry key={a.id} activiteit={a} readonly />
            ))}
          </div>
        )}
      </Modal>

      <Modal
        open={connectiesModalOpen}
        title={`Connecties laatste 30 dagen (${connectieStats.geaccepteerd}/${connectieStats.verzonden})`}
        onClose={() => setConnectiesModalOpen(false)}
        size="lg"
      >
        {connectiesLijst.length === 0 ? (
          <div className={styles.modalLeeg}>Geen connectie-activiteiten in de laatste 30 dagen.</div>
        ) : (
          <div className={styles.modalLijst}>
            {connectiesLijst.map((a) => (
              <ActiviteitEntry key={a.id} activiteit={a} readonly />
            ))}
          </div>
        )}
      </Modal>

      <Modal
        open={replyModalOpen}
        title={`Reacties laatste 30 dagen (${replyStats.beantwoord})`}
        onClose={() => setReplyModalOpen(false)}
        size="lg"
      >
        {replyLijst.length === 0 ? (
          <div className={styles.modalLeeg}>Geen reacties in de laatste 30 dagen.</div>
        ) : (
          <div className={styles.modalLijst}>
            {replyLijst.map((a) => (
              <ActiviteitEntry key={a.id} activiteit={a} readonly />
            ))}
          </div>
        )}
      </Modal>

      <Modal
        open={gesprekkenModalOpen}
        title={`Gesprekken deze maand (${gesprekkenLijst.length})`}
        onClose={() => setGesprekkenModalOpen(false)}
        size="lg"
      >
        {gesprekkenLijst.length === 0 ? (
          <div className={styles.modalLeeg}>Geen gesprekken deze maand.</div>
        ) : (
          <div className={styles.modalLijst}>
            {gesprekkenLijst.map((a) => (
              <ActiviteitEntry key={a.id} activiteit={a} readonly />
            ))}
          </div>
        )}
      </Modal>

      {inkoperDetail && (
        <ContactDetailPanel
          contact={inkoperDetail}
          onClose={() => setInkoperDetail(null)}
          onEdit={() => setInkoperDetail(null)}
          onDelete={handleInkoperDelete}
          onStatusChange={handleInkoperStatus}
          contactType="inkoper"
          onUpdateContext={handleInkoperContext}
        />
      )}

      {ceoDetail && (
        <ContactDetailPanel
          contact={ceoDetail}
          onClose={() => setCeoDetail(null)}
          onEdit={() => setCeoDetail(null)}
          onDelete={handleCeoDelete}
          onStatusChange={handleCeoStatus}
          contactType="ceo"
          onUpdateContext={handleCeoContext}
        />
      )}

      {resellerDetail && (
        <ResellerDetailPanel
          reseller={resellerDetail}
          onClose={() => setResellerDetail(null)}
          onDelete={handleResellerDelete}
          onSave={handleResellerSave}
          onUpdateContext={handleResellerSave}
        />
      )}
    </div>
  );
}
