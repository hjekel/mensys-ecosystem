import { useEffect, useMemo, useState } from 'react';
import Filters from '../components/Filters.jsx';
import KanbanView from '../components/KanbanView.jsx';
import ListView from '../components/ListView.jsx';
import ContactDetailPanel from '../components/ContactDetailPanel.jsx';
import ContactFormModal from '../components/ContactFormModal.jsx';
import CSVImportModal from '../components/CSVImportModal.jsx';
import { contactsToCsv, downloadCsv } from '../utils/csvParser.js';
import { generateId } from '../utils/storage.js';
import { applyCleanup, planCleanup } from '../utils/cleanup.js';
import styles from './InkopersPage.module.css';

export default function InkopersPage({ contacts, setContacts, onFilteredCountChange }) {
  const [query, setQuery] = useState('');
  const [sector, setSector] = useState('');
  const [fte, setFte] = useState('');
  const [status, setStatus] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [view, setView] = useState('kanban');

  const [detail, setDetail] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formInitial, setFormInitial] = useState(null);
  const [importOpen, setImportOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return contacts.filter((c) => {
      if (sector && c.sector !== sector) return false;
      if (fte && c.fteCategory !== fte) return false;
      if (status && c.status !== status) return false;
      if (jobTitle && c.jobTitle !== jobTitle) return false;
      if (q) {
        const hay = `${c.firstName || ''} ${c.lastName || ''} ${c.company || ''} ${c.jobTitle || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [contacts, query, sector, fte, status, jobTitle]);

  useEffect(() => {
    if (onFilteredCountChange) onFilteredCountChange(filtered.length);
  }, [filtered.length, onFilteredCountChange]);

  const facetCounts = useMemo(() => {
    const q = query.trim().toLowerCase();
    function matchQuery(c) {
      if (!q) return true;
      const hay = `${c.firstName || ''} ${c.lastName || ''} ${c.company || ''} ${c.jobTitle || ''}`.toLowerCase();
      return hay.includes(q);
    }
    const sectorCounts = {};
    const fteCounts = {};
    const statusCounts = {};
    const jobTitleCounts = {};
    contacts.forEach((c) => {
      if (!matchQuery(c)) return;
      const passSector = !sector || c.sector === sector;
      const passFte = !fte || c.fteCategory === fte;
      const passStatus = !status || c.status === status;
      const passJobTitle = !jobTitle || c.jobTitle === jobTitle;
      if (passFte && passStatus && passJobTitle && c.sector) {
        sectorCounts[c.sector] = (sectorCounts[c.sector] || 0) + 1;
      }
      if (passSector && passStatus && passJobTitle && c.fteCategory) {
        fteCounts[c.fteCategory] = (fteCounts[c.fteCategory] || 0) + 1;
      }
      if (passSector && passFte && passJobTitle && c.status) {
        statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;
      }
      if (passSector && passFte && passStatus && c.jobTitle) {
        jobTitleCounts[c.jobTitle] = (jobTitleCounts[c.jobTitle] || 0) + 1;
      }
    });
    return { sector: sectorCounts, fte: fteCounts, status: statusCounts, jobTitle: jobTitleCounts };
  }, [contacts, query, sector, fte, status, jobTitle]);

  const jobTitleOptions = useMemo(() => {
    const counts = facetCounts.jobTitle || {};
    return Object.entries(counts)
      .map(([k, v]) => ({ value: k, label: k, count: v }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  }, [facetCounts]);

  function handleStatusChange(contact, newStatus) {
    if (contact.status === newStatus) return;
    setContacts((prev) =>
      prev.map((c) =>
        c.id === contact.id
          ? { ...c, status: newStatus, updatedAt: new Date().toISOString() }
          : c,
      ),
    );
    if (detail && detail.id === contact.id) {
      setDetail({ ...contact, status: newStatus });
    }
  }

  function handleDelete(contact) {
    setContacts((prev) => prev.filter((c) => c.id !== contact.id));
    if (detail && detail.id === contact.id) setDetail(null);
  }

  function handleDeleteFromDetail(contact) {
    const name = `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'dit contact';
    if (confirm(`Verwijder ${name}?`)) {
      handleDelete(contact);
    }
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
    const nowIso = new Date().toISOString();
    if (formInitial?.id) {
      setContacts((prev) =>
        prev.map((c) =>
          c.id === formInitial.id
            ? { ...c, ...formValues, updatedAt: nowIso }
            : c,
        ),
      );
    } else {
      const newContact = {
        id: generateId(),
        ...formValues,
        createdAt: nowIso,
        updatedAt: nowIso,
      };
      setContacts((prev) => [newContact, ...prev]);
    }
    setFormOpen(false);
    setFormInitial(null);
  }

  function handleExport() {
    const csv = contactsToCsv(filtered);
    const stamp = new Date().toISOString().slice(0, 10);
    downloadCsv(`mensys-inkopers-${stamp}.csv`, csv);
  }

  function handleCleanup() {
    const { toRemove, toRename } = planCleanup(contacts);
    if (toRemove.length === 0 && toRename.length === 0) {
      alert('Geen opschoon-acties nodig. De lijst is schoon.');
      return;
    }
    const msg =
      `Opschonen:\n` +
      `  ${toRemove.length} contact(en) verwijderen (gepensioneerd, leeg bedrijf, kale domeinnaam)\n` +
      `  ${toRename.length} bedrijfsna(a)m(en) normaliseren (Title Case, trimmen, B.V. normalisatie)\n\n` +
      `Doorgaan?`;
    if (!confirm(msg)) return;
    const { cleaned } = applyCleanup(contacts);
    setContacts(cleaned);
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
        view={view}
        onViewChange={setView}
        onAddClick={handleAdd}
        onImportClick={() => setImportOpen(true)}
        onExportClick={handleExport}
        onCleanupClick={handleCleanup}
        totalCount={filtered.length}
        facetCounts={facetCounts}
      />

      {contacts.length === 0 ? (
        <EmptyState onImport={() => setImportOpen(true)} onAdd={handleAdd} />
      ) : view === 'kanban' ? (
        <KanbanView
          contacts={filtered}
          onCardOpen={setDetail}
          onStatusChange={handleStatusChange}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ) : (
        <ListView
          contacts={filtered}
          onOpen={setDetail}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <ContactDetailPanel
        contact={detail}
        onClose={() => setDetail(null)}
        onEdit={handleEdit}
        onDelete={handleDeleteFromDetail}
        onStatusChange={handleStatusChange}
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
        existing={contacts}
        onClose={() => setImportOpen(false)}
        onImport={(merged) => setContacts(merged)}
      />
    </div>
  );
}

function EmptyState({ onImport, onAdd }) {
  return (
    <div className={styles.empty}>
      <div className={styles.emptyIcon}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeLinecap="round" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 00-3-3.87" strokeLinecap="round" />
          <path d="M16 3.13a4 4 0 010 7.75" strokeLinecap="round" />
        </svg>
      </div>
      <h3>Nog geen contacten</h3>
      <p>Importeer je eerste Mensys prospects lijst of voeg handmatig een contact toe.</p>
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
