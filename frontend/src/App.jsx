import { useEffect, useState } from 'react';
import PropositionBanner from './components/PropositionBanner.jsx';
import Tabs from './components/Tabs.jsx';
import WelkomPage from './pages/WelkomPage.jsx';
import InkopersPage from './pages/InkopersPage.jsx';
import ResellersPage from './pages/ResellersPage.jsx';
import StatistiekenPage from './pages/StatistiekenPage.jsx';
import { loadContacts, saveContacts } from './utils/storage.js';
import styles from './App.module.css';

export default function App() {
  const [contacts, setContactsState] = useState(() => loadContacts());
  const [activeTab, setActiveTab] = useState('welkom');
  const [inkopersFilteredCount, setInkopersFilteredCount] = useState(null);

  useEffect(() => {
    saveContacts(contacts);
  }, [contacts]);

  const tabs = [
    { id: 'welkom', label: 'Welkom' },
    { id: 'inkopers', label: 'Inkopers', count: inkopersFilteredCount ?? contacts.length },
    { id: 'resellers', label: 'Resellers' },
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
            onStart={() => setActiveTab('inkopers')}
            onNavigate={setActiveTab}
          />
        )}
        {activeTab === 'inkopers' && (
          <InkopersPage
            contacts={contacts}
            setContacts={setContactsState}
            onFilteredCountChange={setInkopersFilteredCount}
          />
        )}
        {activeTab === 'resellers' && <ResellersPage />}
        {activeTab === 'statistieken' && <StatistiekenPage contacts={contacts} />}
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
