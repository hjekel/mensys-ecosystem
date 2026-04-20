import styles from './VandaagBenaderen.module.css';
import { getLaatsteActiviteit } from '../../store/activiteitenStore.js';

const POOL_LABEL = {
  inkoper: 'Inkoper',
  ceo: 'CEO',
  reseller: 'Reseller',
};

const POOL_KLEUR = {
  inkoper: { bg: '#e8eef7', fg: '#003087' },
  ceo: { bg: '#fff3eb', fg: '#E8500A' },
  reseller: { bg: '#e6f7f2', fg: '#00a878' },
};

function relatief(datum) {
  if (!datum) return 'Nog niet benaderd';
  const t = new Date(datum).getTime();
  if (!Number.isFinite(t)) return 'Nog niet benaderd';
  const diffMs = Date.now() - t;
  const dagen = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  if (dagen <= 0) return 'vandaag';
  if (dagen === 1) return 'gisteren';
  return `${dagen} dagen geleden`;
}

function naamVan(record, contactType) {
  if (contactType === 'reseller') {
    const voor = record.voornaam || '';
    const achter = record.achternaam || '';
    const naam = `${voor} ${achter}`.trim();
    return naam || record.bedrijf || '(zonder naam)';
  }
  const naam = `${record.firstName || ''} ${record.lastName || ''}`.trim();
  return naam || record.company || '(zonder naam)';
}

function bedrijfVan(record, contactType) {
  if (contactType === 'reseller') return record.bedrijf || '';
  return record.company || '';
}

export default function VandaagBenaderen({ rijen, onOpen, onMeerZien, tick }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.kop}>
        <h3 className={styles.titel}>Vandaag benaderen <span className={styles.kopSub}>(top 5)</span></h3>
      </div>

      {rijen.length === 0 ? (
        <div className={styles.leeg}>
          Nog geen matches. Voeg contacten toe of wacht op verse YALC-scores.
        </div>
      ) : (
        <ul className={styles.lijst}>
          {rijen.map((rij) => {
            const { record, score, contactType } = rij;
            const naam = naamVan(record, contactType);
            const bedrijf = bedrijfVan(record, contactType);
            const poolKleur = POOL_KLEUR[contactType] || POOL_KLEUR.inkoper;
            const laatste = (() => {
              // tick is alleen een dep-trigger voor de parent useMemo; hier
              // lezen we live om in sync te blijven bij subscribe-refreshes
              void tick;
              const l = getLaatsteActiviteit(record.id, contactType);
              return l ? l.datum : null;
            })();
            return (
              <li key={`${contactType}-${record.id}`}>
                <button
                  type="button"
                  className={styles.rij}
                  onClick={() => onOpen && onOpen(record, contactType)}
                >
                  <div className={styles.naamBlok}>
                    <div className={styles.naam}>{naam}</div>
                    <div className={styles.meta}>
                      <span
                        className={styles.poolBadge}
                        style={{ background: poolKleur.bg, color: poolKleur.fg }}
                      >
                        {POOL_LABEL[contactType] || contactType}
                      </span>
                      {bedrijf && <span className={styles.bedrijf}>{bedrijf}</span>}
                    </div>
                  </div>
                  <div className={styles.rechts}>
                    <span className={styles.score}>{score}</span>
                    <span className={styles.activiteit}>{relatief(laatste)}</span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {onMeerZien && (
        <button type="button" className={styles.meerBtn} onClick={onMeerZien}>
          Meer zien op YALC-tab
        </button>
      )}
    </div>
  );
}
