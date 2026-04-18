import { DEFAULT_INSTELLINGEN } from '../utils/instellingen.js';
import styles from './PropositionBanner.module.css';

export default function PropositionBanner({ instellingen }) {
  const s = instellingen || DEFAULT_INSTELLINGEN;
  return (
    <div className={styles.banner} style={{ background: s.logoKleur }}>
      <div className={styles.inner}>
        <span className={styles.logo}>{s.bedrijfsnaam}</span>
        <span className={styles.tagline}>{s.propositie}</span>
        {s.gebruikersnaam && (
          <span className={styles.user}>· {s.gebruikersnaam}</span>
        )}
      </div>
    </div>
  );
}
