import { useState } from 'react';
import styles from './EcosysteemPage.module.css';

const DISTRIBUTEURS = [
  { naam: 'ALSO', locatie: 'Straubenhardt (DE)' },
  { naam: 'Copaco', locatie: 'Eindhoven' },
  { naam: 'Ingram Micro', locatie: 'Utrecht' },
  { naam: 'TD SYNNEX', locatie: 'Utrecht' },
  { naam: 'DSD Europe', locatie: 'Zoetermeer' },
];

const VENDOR_SAMPLE = 'OpenAI · Canva · Figma · Miro · Anthropic · Kaspersky + 694 meer';

export default function EcosysteemPage({ contacts = [], resellers = [], onNavigate }) {
  const [showGeldstroom, setShowGeldstroom] = useState(true);
  const [showAantallen, setShowAantallen] = useState(true);
  const [tooltip, setTooltip] = useState(null);

  const inkopersCount = contacts.length;
  const resellersCount = resellers.length;

  function goTo(tab) {
    if (onNavigate) onNavigate(tab);
  }

  return (
    <div className={styles.page}>
      <section className={styles.header}>
        <div>
          <h1 className={styles.title}>Ecosysteem</h1>
          <p className={styles.subtitle}>
            Stroomdiagram van geld- en relatiestromen rondom Mensys: van
            vendors via distributeurs naar Mensys, en verder naar resellers
            en eindklanten.
          </p>
        </div>
        <div className={styles.toggles}>
          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={showGeldstroom}
              onChange={(e) => setShowGeldstroom(e.target.checked)}
            />
            Toon geldstroom
          </label>
          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={showAantallen}
              onChange={(e) => setShowAantallen(e.target.checked)}
            />
            Toon aantallen
          </label>
        </div>
      </section>

      <div className={styles.graphWrap}>
        <svg viewBox="0 0 1200 620" className={styles.svg} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <marker id="arrow-thick" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M0 0 L10 5 L0 10 z" fill="#003087" />
            </marker>
            <marker id="arrow-orange" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M0 0 L10 5 L0 10 z" fill="#E8500A" />
            </marker>
            <marker id="arrow-dashed" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
              <path d="M0 0 L10 5 L0 10 z" fill="#6B7280" />
            </marker>
            <marker id="arrow-thin" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
              <path d="M0 0 L10 5 L0 10 z" fill="#5c6a85" />
            </marker>
          </defs>

          <rect x="0" y="0" width="1200" height="620" fill="#FAFAF8" />

          {/* Distributeurs strip */}
          <g className={styles.distribStrip}>
            <text x="600" y="30" textAnchor="middle" className={styles.sectionLabel}>
              DISTRIBUTEURS
            </text>
            {DISTRIBUTEURS.map((d, i) => {
              const n = DISTRIBUTEURS.length;
              const totalWidth = n * 120 + (n - 1) * 12;
              const startX = 600 - totalWidth / 2;
              const x = startX + i * 132;
              return (
                <g
                  key={d.naam}
                  transform={`translate(${x}, 45)`}
                  className={styles.distribBlock}
                  onMouseEnter={(e) => setTooltip({ text: `${d.naam} · ${d.locatie}`, x: e.clientX, y: e.clientY })}
                  onMouseLeave={() => setTooltip(null)}
                >
                  <rect width="120" height="42" rx="8" fill="#F2F5FB" stroke="#E5E7EB" />
                  <text x="60" y="26" textAnchor="middle" className={styles.distribName}>
                    {d.naam}
                  </text>
                </g>
              );
            })}
          </g>

          {/* Vendors block (left) */}
          <g className={styles.nodeBlock}>
            <rect x="40" y="240" width="220" height="140" rx="14" fill="#E8EEF7" stroke="#c9d4ea" strokeWidth="1.5" />
            <text x="150" y="272" textAnchor="middle" className={styles.blockTitle} fill="#003087">
              Vendors
            </text>
            {showAantallen && (
              <text x="150" y="294" textAnchor="middle" className={styles.blockCount} fill="#003087">
                700+
              </text>
            )}
            <foreignObject x="54" y="304" width="192" height="70">
              <div className={styles.blockSubtle}>{VENDOR_SAMPLE}</div>
            </foreignObject>
          </g>

          {/* Mensys block (center) */}
          <g
            className={styles.mensysNode}
            transform="translate(510, 240)"
          >
            <rect width="180" height="140" rx="14" fill="#003087" stroke="#ffffff" strokeWidth="3" filter="url(#mensys-shadow)" />
            <text x="90" y="66" textAnchor="middle" className={styles.mensysM}>
              M
            </text>
            <text x="90" y="96" textAnchor="middle" className={styles.mensysLabel}>
              Mensys
            </text>
            <text x="90" y="116" textAnchor="middle" className={styles.mensysSub}>
              Haarlem · 25+ jaar
            </text>
          </g>

          {/* Resellers block */}
          <g
            className={`${styles.nodeBlock} ${styles.clickableBlock}`}
            onClick={() => goTo('resellers')}
          >
            <rect x="930" y="180" width="220" height="120" rx="14" fill="#E6F7F2" stroke="#a7e9cf" strokeWidth="1.5" />
            <text x="1040" y="212" textAnchor="middle" className={styles.blockTitle} fill="#00a878">
              IT Resellers · MSPs
            </text>
            {showAantallen && (
              <text x="1040" y="234" textAnchor="middle" className={styles.blockCount} fill="#00a878">
                {resellersCount.toLocaleString('nl-NL')} in DB
              </text>
            )}
            <foreignObject x="944" y="244" width="192" height="50">
              <div className={styles.blockSubtle}>Primaire doelgroep · 60% omzet</div>
            </foreignObject>
          </g>

          {/* Eindklanten block */}
          <g
            className={`${styles.nodeBlock} ${styles.clickableBlock}`}
            onClick={() => goTo('inkopers')}
          >
            <rect x="930" y="320" width="220" height="120" rx="14" fill="#FFF3EB" stroke="#fed7aa" strokeWidth="1.5" />
            <text x="1040" y="352" textAnchor="middle" className={styles.blockTitle} fill="#E8500A">
              Eindklanten · Inkopers
            </text>
            {showAantallen && (
              <text x="1040" y="374" textAnchor="middle" className={styles.blockCount} fill="#E8500A">
                {inkopersCount.toLocaleString('nl-NL')} in DB
              </text>
            )}
            <foreignObject x="944" y="384" width="192" height="50">
              <div className={styles.blockSubtle}>Margetechnisch interessant</div>
            </foreignObject>
          </g>

          {/* Arrows */}
          {/* Vendors -> Mensys (dashed) */}
          <line
            x1="260" y1="310" x2="510" y2="310"
            stroke="#6B7280" strokeWidth="1.5" strokeDasharray="6 5"
            markerEnd="url(#arrow-dashed)"
          />
          <text x="385" y="302" textAnchor="middle" className={styles.arrowLabel}>
            licenties inkopen
          </text>

          {/* Distributeurs -> Mensys (dashed, vertical) */}
          <line
            x1="600" y1="90" x2="600" y2="238"
            stroke="#6B7280" strokeWidth="1.5" strokeDasharray="6 5"
            markerEnd="url(#arrow-dashed)"
          />
          <text x="612" y="170" textAnchor="start" className={styles.arrowLabel}>
            doorleveren
          </text>

          {/* Mensys -> Resellers (thick blue) */}
          <path
            d="M 690 290 C 790 290, 860 230, 930 230"
            fill="none" stroke="#003087" strokeWidth="3"
            markerEnd="url(#arrow-thick)"
          />
          <text x="810" y="220" textAnchor="middle" className={styles.arrowLabelPrimary}>
            licenties op factuur · euro · geen creditcard
          </text>
          {showGeldstroom && (
            <text x="810" y="260" textAnchor="middle" className={styles.moneyLabel}>
              € factuur · voorfinancieren
            </text>
          )}

          {/* Mensys -> Eindklanten (thinner orange) */}
          <path
            d="M 690 330 C 790 340, 860 380, 930 380"
            fill="none" stroke="#E8500A" strokeWidth="2"
            markerEnd="url(#arrow-orange)"
          />
          <text x="810" y="370" textAnchor="middle" className={styles.arrowLabelOrange}>
            direct (secundair)
          </text>

          {/* Resellers -> Eindklanten (thin) */}
          <path
            d="M 1040 300 C 1050 340, 1050 320, 1040 320"
            fill="none" stroke="#5c6a85" strokeWidth="1.2"
            markerEnd="url(#arrow-thin)"
          />
          <text x="1070" y="310" textAnchor="start" className={styles.arrowLabelSmall}>
            implementatie + licenties
          </text>
          {showGeldstroom && (
            <text x="1070" y="326" textAnchor="start" className={styles.moneyLabelSmall}>
              € factuur + urentarief
            </text>
          )}

          {/* Concentratie-waarschuwing (bottom right) */}
          <g transform="translate(840, 490)">
            <rect
              x="0" y="0" width="320" height="110"
              rx="10" fill="#FFF3EB" stroke="#E8A020" strokeWidth="1.5"
            />
            <text x="14" y="26" className={styles.warnTitle} fill="#E8500A">
              ⚠ Concentratierisico
            </text>
            <foreignObject x="14" y="32" width="296" height="74">
              <div className={styles.warnBody}>
                Grootste reseller: <strong>60% van omzet</strong> (was 70% in 2025).<br />
                Doel: diversificeren naar meer resellers en directe eindklanten.
              </div>
            </foreignObject>
          </g>

          <filter id="mensys-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#003087" floodOpacity="0.25" />
          </filter>
        </svg>

        {tooltip && (
          <div
            className={styles.floatTooltip}
            style={{ left: tooltip.x + 8, top: tooltip.y + 8 }}
          >
            {tooltip.text}
          </div>
        )}
      </div>
    </div>
  );
}
