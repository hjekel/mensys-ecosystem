import { useEffect, useState } from 'react';
import PropositionBanner from './components/PropositionBanner.jsx';
import Tabs from './components/Tabs.jsx';
import InkopersPage from './pages/InkopersPage.jsx';
import ResellersPage from './pages/ResellersPage.jsx';
import StatistiekenPage from './pages/StatistiekenPage.jsx';
import { loadContacts, saveContacts } from './utils/storage.js';
import styles from './App.module.css';

export default function App() {
  const [contacts, setContactsState] = useState(() => loadContacts());
  const [activeTab, setActiveTab] = useState('inkopers');

  useEffect(() => {
    saveContacts(contacts);
  }, [contacts]);

  const tabs = [
    { id: 'inkopers', label: 'Inkopers', count: contacts.length },
    { id: 'resellers', label: 'Resellers' },
    { id: 'statistieken', label: 'Statistieken' },
  ];

  return (
    <div className={styles.app}>
      <PropositionBanner />
      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      <main className={styles.main}>
        {activeTab === 'inkopers' && (
          <InkopersPage contacts={contacts} setContacts={setContactsState} />
        )}
        {activeTab === 'resellers' && <ResellersPage />}
        {activeTab === 'statistieken' && <StatistiekenPage contacts={contacts} />}
      </main>

      <footer className={styles.footer}>
        <span>Mensys Ecosystem App v1.0</span>
        <span className={styles.footerDot}>·</span>
        <span>Data opgeslagen in je browser</span>
      </footer>
    </div>
  );
}
