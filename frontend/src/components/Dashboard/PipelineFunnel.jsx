import styles from './PipelineFunnel.module.css';

const STATUS_KLEUREN = {
  Nieuw: '#9CA3AF',
  Warm: '#E8EEF7',
  Benaderd: '#003087',
  'Gesprek gevoerd': '#E8500A',
  Klant: '#00a878',
};

const STATUS_TEKST_OP_BALK = {
  Nieuw: '#1A1A1A',
  Warm: '#003087',
  Benaderd: '#FFFFFF',
  'Gesprek gevoerd': '#FFFFFF',
  Klant: '#FFFFFF',
};

export default function PipelineFunnel({ statuses, counts, conversie, onStatusClick }) {
  const max = Math.max(1, ...statuses.map((s) => counts[s] || 0));

  return (
    <div className={styles.wrap}>
      <div className={styles.kop}>
        <h3 className={styles.titel}>Pipeline</h3>
        <div className={styles.conversie}>
          Conversie: <strong>{conversie}%</strong> van Nieuw naar Klant
        </div>
      </div>

      <div className={styles.rijen}>
        {statuses.map((status) => {
          const aantal = counts[status] || 0;
          const pct = (aantal / max) * 100;
          const achtergrond = STATUS_KLEUREN[status] || '#E8EEF7';
          const tekstKleur = STATUS_TEKST_OP_BALK[status] || '#1A1A1A';
          const klikbaar = Boolean(onStatusClick) && aantal > 0;
          return (
            <button
              key={status}
              type="button"
              className={`${styles.rij} ${klikbaar ? styles.rijKlikbaar : ''}`}
              onClick={klikbaar ? () => onStatusClick(status) : undefined}
              disabled={!klikbaar}
              aria-label={`${status}: ${aantal} contacten`}
            >
              <span className={styles.label}>{status}</span>
              <div className={styles.track}>
                <div
                  className={styles.balk}
                  style={{
                    width: `${Math.max(pct, aantal > 0 ? 4 : 0)}%`,
                    background: achtergrond,
                    color: tekstKleur,
                  }}
                >
                  {aantal > 0 && pct > 14 && (
                    <span className={styles.balkGetal}>{aantal.toLocaleString('nl-NL')}</span>
                  )}
                </div>
                {(pct <= 14 || aantal === 0) && (
                  <span className={styles.getalBuiten}>{aantal.toLocaleString('nl-NL')}</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
