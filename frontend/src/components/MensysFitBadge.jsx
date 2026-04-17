import { MENSYS_FIT_COLORS } from '@shared/constants.js';
import styles from './MensysFitBadge.module.css';

export default function MensysFitBadge({ fit }) {
  const value = fit || 'Onbekend';
  const colors = MENSYS_FIT_COLORS[value] || MENSYS_FIT_COLORS.Onbekend;
  return (
    <span
      className={styles.badge}
      style={{ backgroundColor: colors.bg, color: colors.fg }}
    >
      <span className={styles.dot} style={{ backgroundColor: colors.fg }} />
      {value}
    </span>
  );
}
