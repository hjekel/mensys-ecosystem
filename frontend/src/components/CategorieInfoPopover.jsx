import { useEffect, useRef, useState } from 'react';
import styles from './CategorieInfoPopover.module.css';

const DEFINITIES = [
  {
    titel: 'Directe concurrent',
    tekst: 'Biedt dezelfde diensten als Mensys: euro-factuur, niche-software, persoonlijk contact.',
    voorbeelden: 'Actendo, Scholten Awater, Centralpoint',
  },
  {
    titel: 'Overheid-specialist',
    tekst: 'Richt zich primair op overheidsinkoop met specifieke contractvormen.',
    voorbeelden: 'Protinus IT',
  },
  {
    titel: 'Enterprise',
    tekst: 'Werkt met grote organisaties, vaak via tenders, schaal boven Mensys-sweet-spot.',
    voorbeelden: 'SoftwareOne, Comparex, Crayon',
  },
  {
    titel: 'Distributeur',
    tekst: 'Leveranciers die licenties groot inkopen en doorverkopen.',
    voorbeelden: 'ALSO, Copaco, Ingram Micro',
  },
  {
    titel: 'Online/prijsvechter',
    tekst: 'Automatische webshops, geen persoonlijke service, vaak prijs-leader.',
    voorbeelden: 'Schogo, vendor-direct shops',
  },
  {
    titel: 'Coopetitie-kans',
    tekst: 'Partij die op een deel concurrent is, op een ander deel partner kan zijn.',
    voorbeelden: 'CloudLand (Enreach)',
  },
];

export default function CategorieInfoPopover({ align = 'left', label = 'Categorie-definities' }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    function onClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  return (
    <span className={styles.wrap} ref={wrapRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        aria-label={label}
        aria-expanded={open}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" strokeLinecap="round" />
          <line x1="12" y1="8" x2="12.01" y2="8" strokeLinecap="round" />
        </svg>
      </button>
      {open && (
        <div
          className={`${styles.pop} ${align === 'right' ? styles.popRight : styles.popLeft}`}
          role="dialog"
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.popHeader}>Categorie-definities</div>
          <ul className={styles.list}>
            {DEFINITIES.map((d) => (
              <li key={d.titel} className={styles.item}>
                <div className={styles.itemTitel}>{d.titel}</div>
                <div className={styles.itemTekst}>{d.tekst}</div>
                <div className={styles.itemVoorbeeld}>
                  <span className={styles.voorbeeldLabel}>Voorbeelden:</span> {d.voorbeelden}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </span>
  );
}
