import { useMemo, useState } from 'react';
import FilterDropdown from '../components/FilterDropdown.jsx';
import Modal from '../components/Modal.jsx';
import ContactDetailPanel from '../components/ContactDetailPanel.jsx';
import ResellerDetailPanel from '../components/ResellerDetailPanel.jsx';
import { rankInkopers, rankResellers } from '../utils/lhf.js';
import { updateContact } from '../utils/storage.js';
import { updateReseller, deleteReseller } from '../store/resellersStore.js';
import {
  MENSYS_FIT_COLORS,
  MENSYS_FIT_SCORES,
  SECTOR_COLORS,
  SECTORS,
  STATUSES,
} from '@shared/constants.js';
import styles from './EcosysteemPage.module.css';

const DISTRIBUTEURS = ['ALSO', 'Copaco', 'Ingram Micro', 'TD SYNNEX', 'DSD Europe'];

const RING_R = {
  distributeurs: 200,
  resellers: 350,
  inkopers: 480,
};

export default function EcosysteemPage({ contacts, setContacts, resellers, setResellers }) {
  const [maxResellers, setMaxResellers] = useState(50);
  const [maxInkopers, setMaxInkopers] = useState(30);
  const [fitFilter, setFitFilter] = useState({
    Hoog: true,
    Midden: true,
    Onderzoeken: true,
    Onbekend: true,
  });
  const [showDistributeurs, setShowDistributeurs] = useState(true);
  const [sectorFilter, setSectorFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [configOpen, setConfigOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [detailSource, setDetailSource] = useState(null);
  const [hover, setHover] = useState(null);

  const resellerRanked = useMemo(() => rankResellers(resellers), [resellers]);
  const inkopersRanked = useMemo(() => rankInkopers(contacts), [contacts]);

  const resellerNodes = useMemo(() => {
    const filtered = resellerRanked.filter((row) => {
      const fit = row.record.mensysFit || 'Onbekend';
      if (!fitFilter[fit]) return false;
      if (statusFilter && row.record.status !== statusFilter) return false;
      return true;
    });
    const top = filtered.slice(0, maxResellers);
    const count = top.length;
    return top.map((row, i) => {
      const angle = count > 0 ? (i / count) * 2 * Math.PI - Math.PI / 2 : 0;
      const fit = row.record.mensysFit || 'Onbekend';
      const colors = MENSYS_FIT_COLORS[fit] || MENSYS_FIT_COLORS.Onbekend;
      const r = 7 + (row.score / 100) * 13;
      return {
        id: row.record.id,
        type: 'reseller',
        name: row.record.bedrijf || '(onbekend)',
        score: row.score,
        subLabel: fit,
        x: RING_R.resellers * Math.cos(angle),
        y: RING_R.resellers * Math.sin(angle),
        r,
        color: colors.fg,
        record: row.record,
      };
    });
  }, [resellerRanked, fitFilter, statusFilter, maxResellers]);

  const inkoperNodes = useMemo(() => {
    const filtered = inkopersRanked.filter((row) => {
      if (sectorFilter && row.record.sector !== sectorFilter) return false;
      if (statusFilter && row.record.status !== statusFilter) return false;
      return true;
    });
    const top = filtered.slice(0, maxInkopers);
    const count = top.length;
    return top.map((row, i) => {
      const angle = count > 0 ? (i / count) * 2 * Math.PI - Math.PI / 2 : 0;
      const color = SECTOR_COLORS[row.record.sector] || '#6B7280';
      const r = 6 + (row.score / 100) * 10;
      return {
        id: row.record.id,
        type: 'inkoper',
        name: row.record.company || '(onbekend)',
        score: row.score,
        subLabel: row.record.sector || 'Overig',
        x: RING_R.inkopers * Math.cos(angle),
        y: RING_R.inkopers * Math.sin(angle),
        r,
        color,
        record: row.record,
      };
    });
  }, [inkopersRanked, sectorFilter, statusFilter, maxInkopers]);

  const distribNodes = useMemo(() => {
    if (!showDistributeurs) return [];
    return DISTRIBUTEURS.map((name, i) => {
      const angle = (i / DISTRIBUTEURS.length) * 2 * Math.PI - Math.PI / 2;
      return {
        id: `d-${i}`,
        type: 'distributeur',
        name,
        subLabel: 'Distributeur',
        score: null,
        x: RING_R.distributeurs * Math.cos(angle),
        y: RING_R.distributeurs * Math.sin(angle),
        r: 24,
        color: '#5c6a85',
      };
    });
  }, [showDistributeurs]);

  function openNode(node) {
    if (node.type === 'distributeur') return;
    setDetail(node.record);
    setDetailSource(node.type === 'reseller' ? 'resellers' : 'inkopers');
  }

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

  const fitOptions = MENSYS_FIT_SCORES.map((s) => ({ value: s, label: s, count: 0 }));
  const sectorOptions = SECTORS.map((s) => ({ value: s, label: s, count: 0 }));
  const statusOptions = STATUSES.map((s) => ({ value: s, label: s, count: 0 }));

  return (
    <div className={styles.page}>
      <section className={styles.header}>
        <div>
          <h1 className={styles.title}>Ecosysteem</h1>
          <p className={styles.subtitle}>
            Klikbare marktvisualisatie van Mensys met distributeurs, resellers
            en procurement managers. Klik op een knooppunt om het detail-panel
            te openen. Hover voor naam en score.
          </p>
        </div>
        <button
          type="button"
          className={styles.cogBtn}
          onClick={() => setConfigOpen(true)}
          aria-label="Configuratie"
          title="Configuratie"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33h.01a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </section>

      <section className={styles.filters}>
        <FilterDropdown
          allLabel="Alle sectoren"
          value={sectorFilter}
          onChange={setSectorFilter}
          options={sectorOptions}
        />
        <FilterDropdown
          allLabel="Alle statussen"
          value={statusFilter}
          onChange={setStatusFilter}
          options={statusOptions}
        />
        <span className={styles.countNote}>
          {resellerNodes.length} resellers, {inkoperNodes.length} inkopers getoond
        </span>
      </section>

      <section className={styles.legend}>
        <h3 className={styles.legendTitle}>Legenda</h3>
        <div className={styles.legendRow}>
          <span className={styles.legendLabel}>Mensys Fit:</span>
          {MENSYS_FIT_SCORES.map((s) => {
            const c = MENSYS_FIT_COLORS[s];
            return (
              <span key={s} className={styles.legendItem}>
                <span className={styles.swatch} style={{ background: c.fg }} />
                {s}
              </span>
            );
          })}
        </div>
        <div className={styles.legendRow}>
          <span className={styles.legendLabel}>Sector:</span>
          {SECTORS.map((s) => (
            <span key={s} className={styles.legendItem}>
              <span className={styles.swatch} style={{ background: SECTOR_COLORS[s] }} />
              {s}
            </span>
          ))}
        </div>
      </section>

      <div className={styles.graphWrap}>
        <svg viewBox="-560 -560 1120 1120" className={styles.svg}>
          <circle cx="0" cy="0" r={RING_R.distributeurs} className={styles.ring} />
          <circle cx="0" cy="0" r={RING_R.resellers} className={styles.ring} />
          <circle cx="0" cy="0" r={RING_R.inkopers} className={styles.ring} />

          <g>
            {distribNodes.map((n) => (
              <line
                key={`l-${n.id}`}
                x1="0"
                y1="0"
                x2={n.x}
                y2={n.y}
                className={styles.linkDashed}
              />
            ))}
            {resellerNodes.map((n) => (
              <line
                key={`l-${n.id}`}
                x1="0"
                y1="0"
                x2={n.x}
                y2={n.y}
                className={styles.linkThin}
              />
            ))}
            {inkoperNodes.map((n) => (
              <line
                key={`l-${n.id}`}
                x1="0"
                y1="0"
                x2={n.x}
                y2={n.y}
                className={styles.linkThin}
                opacity="0.5"
              />
            ))}
          </g>

          <g>
            <circle cx="0" cy="0" r="48" fill="#003087" />
            <text
              x="0"
              y="0"
              dy="0.35em"
              textAnchor="middle"
              className={styles.mensysLabel}
            >
              M
            </text>
            <text x="0" y="64" textAnchor="middle" className={styles.nodeName}>
              Mensys
            </text>
          </g>

          {distribNodes.map((n) => (
            <NodeG
              key={n.id}
              node={n}
              onHover={setHover}
              onClick={openNode}
            />
          ))}
          {resellerNodes.map((n) => (
            <NodeG
              key={n.id}
              node={n}
              onHover={setHover}
              onClick={openNode}
            />
          ))}
          {inkoperNodes.map((n) => (
            <NodeG
              key={n.id}
              node={n}
              onHover={setHover}
              onClick={openNode}
            />
          ))}
        </svg>

        {hover && (
          <div className={styles.tooltip}>
            <div className={styles.ttName}>{hover.name}</div>
            <div className={styles.ttSub}>
              {hover.subLabel}
              {hover.score !== null ? ` · YALC ${hover.score}` : ''}
            </div>
          </div>
        )}
      </div>

      <Modal
        open={configOpen}
        title="Ecosysteem configuratie"
        onClose={() => setConfigOpen(false)}
        size="md"
      >
        <div className={styles.configForm}>
          <div className={styles.configRow}>
            <label>Hoeveel resellers tonen (max 50)</label>
            <div className={styles.sliderRow}>
              <input
                type="range"
                min="5"
                max="50"
                value={maxResellers}
                onChange={(e) => setMaxResellers(Number(e.target.value))}
              />
              <span className={styles.sliderValue}>{maxResellers}</span>
            </div>
          </div>

          <div className={styles.configRow}>
            <label>Hoeveel inkopers tonen (max 30)</label>
            <div className={styles.sliderRow}>
              <input
                type="range"
                min="5"
                max="30"
                value={maxInkopers}
                onChange={(e) => setMaxInkopers(Number(e.target.value))}
              />
              <span className={styles.sliderValue}>{maxInkopers}</span>
            </div>
          </div>

          <div className={styles.configRow}>
            <label>Filter op Mensys Fit</label>
            <div className={styles.fitChecks}>
              {MENSYS_FIT_SCORES.map((s) => (
                <label key={s} className={styles.checkLabel}>
                  <input
                    type="checkbox"
                    checked={fitFilter[s] ?? true}
                    onChange={(e) =>
                      setFitFilter((prev) => ({ ...prev, [s]: e.target.checked }))
                    }
                  />
                  <span>{s}</span>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.configRow}>
            <label className={styles.checkLabel}>
              <input
                type="checkbox"
                checked={showDistributeurs}
                onChange={(e) => setShowDistributeurs(e.target.checked)}
              />
              <span>Toon distributeurs</span>
            </label>
          </div>

          <div className={styles.configFooter}>
            <button type="button" className="btn btn-primary" onClick={() => setConfigOpen(false)}>
              Sluiten
            </button>
          </div>
        </div>
      </Modal>

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

function NodeG({ node, onHover, onClick }) {
  return (
    <g
      className={node.type === 'distributeur' ? styles.nodeDistrib : styles.nodeInteractive}
      onMouseEnter={() => onHover(node)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onClick(node)}
    >
      <circle cx={node.x} cy={node.y} r={node.r} fill={node.color} stroke="#ffffff" strokeWidth="1.5" />
      {node.type === 'distributeur' && (
        <text x={node.x} y={node.y + node.r + 14} textAnchor="middle" className={styles.distribLabel}>
          {node.name}
        </text>
      )}
    </g>
  );
}
