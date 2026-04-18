import { useRef, useState } from 'react';
import Modal from './Modal.jsx';
import styles from './CSVImportModal.module.css';
import { parseFile, rowsToContacts } from '../utils/csvParser.js';
import { rowsToResellers } from '../utils/resellerCsv.js';
import { rowsToCeos } from '../utils/ceoCsv.js';
import { mergeContacts } from '../utils/storage.js';
import { importResellers } from '../store/resellersStore.js';
import { importCeos } from '../store/ceoStore.js';
import { CSV_COLUMNS } from '@shared/mappings.js';
import { RESELLER_CSV_COLUMNS } from '@shared/constants.js';

const INKOPERS_EXPECTED = Object.values(CSV_COLUMNS);
const RESELLERS_EXPECTED = Object.values(RESELLER_CSV_COLUMNS);
const CEO_EXPECTED = [
  'bedrijf',
  'voornaam',
  'achternaam',
  'functietitel',
  'email',
  'linkedin',
  'fteCategorie',
  'sector',
  'status',
  'mensysFit',
  'bron',
  'locatie',
  'website',
  'keywords',
  'notities',
];

export default function CSVImportModal({ open, mode = 'inkopers', onClose, existing, onImport }) {
  const [stage, setStage] = useState('upload');
  const [fileName, setFileName] = useState('');
  const [headers, setHeaders] = useState([]);
  const [preview, setPreview] = useState([]);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [result, setResult] = useState(null);
  const fileRef = useRef(null);

  const isResellers = mode === 'resellers';
  const isCeo = mode === 'ceo';
  const expected = isResellers
    ? RESELLERS_EXPECTED
    : isCeo
      ? CEO_EXPECTED
      : INKOPERS_EXPECTED;
  const entityLabel = isResellers ? 'resellers' : isCeo ? 'CEOs' : 'inkopers';
  const entitySingular = isResellers ? 'reseller' : isCeo ? 'CEO' : 'contact';

  function reset() {
    setStage('upload');
    setFileName('');
    setHeaders([]);
    setPreview([]);
    setRows([]);
    setError('');
    setResult(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleFile(file) {
    if (!file) return;
    setError('');
    setFileName(file.name);
    try {
      const { headers: h, rows: r } = await parseFile(file);
      if (!r.length) {
        setError('Bestand bevat geen rijen.');
        return;
      }
      setHeaders(h);
      setRows(r);
      setPreview(r.slice(0, 5));
      setStage('preview');
    } catch (err) {
      console.error(err);
      setError('Kon bestand niet lezen. Gebruik .csv of .xlsx.');
    }
  }

  function handleImport() {
    if (isResellers) {
      const incoming = rowsToResellers(rows);
      const { merged, added, skipped, total } = importResellers(existing, incoming);
      onImport(merged);
      setResult({ total, added, skipped });
    } else if (isCeo) {
      const incoming = rowsToCeos(rows);
      const { merged, added, skipped, total } = importCeos(existing, incoming);
      onImport(merged);
      setResult({ total, added, skipped });
    } else {
      const contacts = rowsToContacts(rows);
      const { merged, added, skipped } = mergeContacts(existing, contacts);
      onImport(merged);
      setResult({ total: contacts.length, added, skipped });
    }
    setStage('done');
  }

  const matchedHeaders = headers.filter((h) =>
    expected.some((e) => String(e).toLowerCase() === String(h).toLowerCase()),
  );
  const unmatched = headers.filter(
    (h) => !expected.some((e) => String(e).toLowerCase() === String(h).toLowerCase()),
  );

  const previewRows = isResellers
    ? rowsToResellers(preview)
    : isCeo
      ? rowsToCeos(preview)
      : rowsToContacts(preview);

  const title = isResellers
    ? 'Resellers importeren'
    : isCeo
      ? 'CEO & MD importeren'
      : 'Inkopers importeren';

  const hint = isResellers
    ? 'Verwachte kolomnamen: bedrijf, voornaam, achternaam, functietitel, email, linkedin, fteRange, resellerType, mensysFit, bron, locatie, website, status, keywords, notities.'
    : isCeo
      ? 'Verwachte kolomnamen: bedrijf, voornaam, achternaam, functietitel, email, linkedin, fteCategorie, sector, status, mensysFit, bron, locatie, website, keywords, notities. Hoofdletters/kleine letters worden beide geaccepteerd.'
      : 'Verwachte kolomnamen: First Name, Last Name, Company, Job Title, LinkedIn URL, Email, LinkedIn Industry, Employee Category, Corporate Website, Location, Country, Source.';

  return (
    <Modal
      open={open}
      title={title}
      onClose={handleClose}
      size="lg"
    >
      {stage === 'upload' && (
        <div>
          <div
            className={`${styles.dropzone} ${dragOver ? styles.dropzoneActive : ''}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const f = e.dataTransfer.files?.[0];
              if (f) handleFile(f);
            }}
            onClick={() => fileRef.current?.click()}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" strokeLinecap="round" />
              <polyline points="17 8 12 3 7 8" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="12" y1="3" x2="12" y2="15" strokeLinecap="round" />
            </svg>
            <div className={styles.dropTitle}>Sleep hier een CSV of Excel bestand</div>
            <div className={styles.dropSub}>of klik om te bladeren</div>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              hidden
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </div>
          {error && <div className={styles.error}>{error}</div>}
          <div className={styles.hint}>{hint}</div>
        </div>
      )}

      {stage === 'preview' && (
        <div>
          <div className={styles.fileInfo}>
            <strong>{fileName}</strong>
            <span>{rows.length} rijen</span>
          </div>

          <div className={styles.mapping}>
            <div className={styles.mappingCol}>
              <div className={styles.mappingLabel}>Herkende kolommen ({matchedHeaders.length})</div>
              <div className={styles.chipList}>
                {matchedHeaders.length === 0 && <span className={styles.noMatch}>Geen kolommen herkend</span>}
                {matchedHeaders.map((h) => (
                  <span key={h} className={`${styles.chip} ${styles.chipOk}`}>{h}</span>
                ))}
              </div>
            </div>
            <div className={styles.mappingCol}>
              <div className={styles.mappingLabel}>Overige kolommen ({unmatched.length})</div>
              <div className={styles.chipList}>
                {unmatched.map((h) => (
                  <span key={h} className={styles.chip}>{h}</span>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.previewLabel}>Preview (eerste 5 rijen)</div>
          <div className={styles.previewTable}>
            {isResellers ? (
              <table>
                <thead>
                  <tr>
                    <th>Bedrijf</th>
                    <th>Naam</th>
                    <th>Functietitel</th>
                    <th>Type</th>
                    <th>Fit</th>
                    <th>Email</th>
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((r, i) => (
                    <tr key={i}>
                      <td>{r.bedrijf || '-'}</td>
                      <td>{`${r.voornaam} ${r.achternaam}`.trim() || '-'}</td>
                      <td>{r.functietitel || '-'}</td>
                      <td>{r.resellerType}</td>
                      <td>{r.mensysFit}</td>
                      <td>{r.email || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Naam</th>
                    <th>Functie</th>
                    <th>Bedrijf</th>
                    <th>Sector (geraden)</th>
                    <th>FTE (geraden)</th>
                    <th>Email</th>
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((c) => (
                    <tr key={c.id}>
                      <td>{`${c.firstName} ${c.lastName}`.trim() || '-'}</td>
                      <td>{c.jobTitle || '-'}</td>
                      <td>{c.company || '-'}</td>
                      <td>{c.sector}</td>
                      <td>{c.fteCategory}</td>
                      <td>{c.email || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className={styles.footer}>
            <button type="button" className="btn btn-ghost" onClick={reset}>
              Ander bestand kiezen
            </button>
            <button type="button" className="btn btn-primary" onClick={handleImport}>
              Importeren ({rows.length} rijen)
            </button>
          </div>
        </div>
      )}

      {stage === 'done' && result && (
        <div className={styles.doneWrap}>
          <div className={styles.doneIcon}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 12l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h3>Import voltooid</h3>
          <div className={styles.stats}>
            <div><strong>{result.added}</strong> nieuwe {entityLabel} toegevoegd</div>
            <div><strong>{result.skipped}</strong> duplicaten overgeslagen</div>
            <div><strong>{result.total}</strong> rijen verwerkt</div>
          </div>
          <div className={styles.footer}>
            <button type="button" className="btn btn-primary" onClick={handleClose}>
              Sluiten
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
