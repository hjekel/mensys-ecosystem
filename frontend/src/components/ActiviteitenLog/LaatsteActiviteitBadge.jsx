import { relatieveDatum } from '../../utils/activiteitenUtils.js';
import styles from './LaatsteActiviteitBadge.module.css';

export default function LaatsteActiviteitBadge({ activiteit }) {
  if (!activiteit) {
    return (
      <span className={styles.oranje}>Nog niet benaderd</span>
    );
  }
  return (
    <span className={styles.grijs}>
      Laatst: {relatieveDatum(activiteit.datum)}
    </span>
  );
}
