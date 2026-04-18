import { useEffect, useState } from 'react';
import PropositionBanner from './components/PropositionBanner.jsx';
import Tabs from './components/Tabs.jsx';
import WelkomPage from './pages/WelkomPage.jsx';
import InkopersPage from './pages/InkopersPage.jsx';
import ResellersPage from './pages/ResellersPage.jsx';
import SignalenPage from './pages/SignalenPage.jsx';
import YalcPage from './pages/YalcPage.jsx';
import EcosysteemPage from './pages/EcosysteemPage.jsx';
import StatistiekenPage from './pages/StatistiekenPage.jsx';
import { loadContacts, saveContacts } from './utils/storage.js';
import { getResellers, saveResellers } from './store/resellersStore.js';
import styles from './App.module.css';

export default function App() {
  const [contacts, setContactsState] = useState(() => loadContacts());
  const [resellers, setResellersState] = useState(() => getResellers());
  const [activeTab, setActiveTab] = useState('welkom');
  const [inkopersFilteredCount, setInkopersFilteredCount] = useState(null);
  const [resellersFilteredCount, setResellersFilteredCount] = useState(null);
  const [pendingInkopersFilter, setPendingInkopersFilter] = useState(null);
  const [pendingResellersFilter, setPendingResellersFilter] = useState(null);

  function navigateToInkopers(filter) {
    setPendingInkopersFilter(filter ? { ...filter, _ts: Date.now() } : null);
    setActiveTab('inkopers');
  }

  function navigateToResellers(filter) {
    setPendingResellersFilter(filter ? { ...filter, _ts: Date.now() } : null);
    setActiveTab('resellers');
  }

  useEffect(() => {
    saveContacts(contacts);
  }, [contacts]);

  useEffect(() => {
    saveResellers(resellers);
  }, [resellers]);

  const tabs = [
    { id: 'welkom', label: 'Welkom' },
    { id: 'signalen', label: 'Signalen' },
    { id: 'inkopers', label: 'Inkopers', count: inkopersFilteredCount ?? contacts.length },
    { id: 'resellers', label: 'Resellers', count: resellersFilteredCount ?? resellers.length },
    { id: 'yalc', label: 'YALC' },
    { id: 'ecosysteem', label: 'Ecosysteem' },
    { id: 'statistieken', label: 'Statistieken' },
  ];

  return (
    <div className={styles.app}>
      <PropositionBanner />
      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      <main className={styles.main}>
        {activeTab === 'welkom' && (
          <WelkomPage
            contactCount={contacts.length}
            resellerCount={resellers.length}
            onStart={() => setActiveTab('inkopers')}
            onNavigate={setActiveTab}
          />
        )}
        {activeTab === 'inkopers' && (
          <InkopersPage
            contacts={contacts}
            setContacts={setContactsState}
            onFilteredCountChange={setInkopersFilteredCount}
            initialFilter={pendingInkopersFilter}
          />
        )}
        {activeTab === 'resellers' && (
          <ResellersPage
            resellers={resellers}
            setResellers={setResellersState}
            onFilteredCountChange={setResellersFilteredCount}
            initialFilter={pendingResellersFilter}
          />
        )}
        {activeTab === 'signalen' && (
          <SignalenPage
            contacts={contacts}
            setContacts={setContactsState}
            resellers={resellers}
            setResellers={setResellersState}
          />
        )}
        {activeTab === 'yalc' && (
          <YalcPage
            contacts={contacts}
            setContacts={setContactsState}
            resellers={resellers}
            setResellers={setResellersState}
          />
        )}
        {activeTab === 'ecosysteem' && (
          <EcosysteemPage
            contacts={contacts}
            setContacts={setContactsState}
            resellers={resellers}
            setResellers={setResellersState}
          />
        )}
        {activeTab === 'statistieken' && (
          <StatistiekenPage
            contacts={contacts}
            resellers={resellers}
            onNavigateInkopers={navigateToInkopers}
            onNavigateResellers={navigateToResellers}
          />
        )}
      </main>

      <footer className={styles.footer}>
        <span>Mensys Ecosystem App v{__APP_VERSION__}</span>
        <span className={styles.footerDot}>·</span>
        <span title={__APP_BUILD_DATE__}>
          Laatst bijgewerkt: {formatBuildDate(__APP_BUILD_DATE__)}
        </span>
        <span className={styles.footerDot}>·</span>
        <span>Data opgeslagen in je browser</span>
      </footer>
    </div>
  );
}

function formatBuildDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString('nl-NL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}
