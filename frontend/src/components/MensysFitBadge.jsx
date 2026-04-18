import { MENSYS_FIT_COLORS } from '@shared/constants.js';
import BadgeWithTooltip from './BadgeWithTooltip.jsx';
import styles from './MensysFitBadge.module.css';

const FIT_TOOLTIPS = {
  Hoog: 'FTE 1-50. Sweet spot Mensys. Eigenaar is beslisser.',
  Midden: 'FTE 51-200. Sales Manager of IT Manager is de ingang.',
  Onderzoeken: 'FTE 200+. Bespreken met Menso of dit interessant is.',
  Onbekend: 'FTE niet bekend. Check LinkedIn bedrijfspagina.',
};

export default function MensysFitBadge({ fit, yalcScore }) {
  const value = fit || 'Onbekend';
  const colors = MENSYS_FIT_COLORS[value] || MENSYS_FIT_COLORS.Onbekend;
  const base = FIT_TOOLTIPS[value] || FIT_TOOLTIPS.Onbekend;
  const tooltip = yalcScore !== undefined && yalcScore !== null
    ? `${base}\nYALC-score: ${yalcScore}`
    : base;
  return (
    <BadgeWithTooltip tooltip={tooltip}>
      <span
        className={styles.badge}
        style={{ backgroundColor: colors.bg, color: colors.fg }}
      >
        <span className={styles.dot} style={{ backgroundColor: colors.fg }} />
        {value}
      </span>
    </BadgeWithTooltip>
  );
}
