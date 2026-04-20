import styles from './HeroTile.module.css';

function progressKleur(percentage) {
  if (percentage >= 80) return '#003087';
  if (percentage >= 50) return '#E8A020';
  return '#DC2626';
}

export default function HeroTile({
  label,
  waarde,
  eenheid = '',
  subLabel,
  percentage,
  toonProgress = false,
  onClick,
  accentNeutraal = false,
}) {
  const toonProgressbar = toonProgress && typeof percentage === 'number';
  const pct = Math.max(0, Math.min(100, Number(percentage) || 0));
  const balkKleur = accentNeutraal ? '#9CA3AF' : progressKleur(pct);
  const className = `${styles.tile} ${onClick ? styles.tileClickable : ''}`;
  const Inhoud = (
    <>
      <div className={styles.waardeRij}>
        <span className={styles.waarde}>{waarde}</span>
        {eenheid && <span className={styles.eenheid}>{eenheid}</span>}
      </div>
      <div className={styles.label}>{label}</div>
      {subLabel && <div className={styles.subLabel}>{subLabel}</div>}
      {toonProgressbar && (
        <div className={styles.track} aria-hidden="true">
          <div
            className={styles.fill}
            style={{ width: `${pct}%`, background: balkKleur }}
          />
        </div>
      )}
    </>
  );
  if (onClick) {
    return (
      <button type="button" className={className} onClick={onClick}>
        {Inhoud}
      </button>
    );
  }
  return <div className={className}>{Inhoud}</div>;
}
