import { SECTOR_COLORS } from '@shared/constants.js';
import styles from './SectorBadge.module.css';

export default function SectorBadge({ sector }) {
  const color = SECTOR_COLORS[sector] || SECTOR_COLORS.Overig;
  return (
    <span
      className={styles.badge}
      style={{ backgroundColor: `${color}1A`, color }}
    >
      <span className={styles.dot} style={{ backgroundColor: color }} />
      {sector || 'Overig'}
    </span>
  );
}
