import { SECTOR_COLORS } from '@shared/constants.js';
import BadgeWithTooltip from './BadgeWithTooltip.jsx';
import styles from './SectorBadge.module.css';

const SECTOR_TOOLTIPS = {
  Zorg: 'Zorginstellingen, ziekenhuizen, umc\'s en verzorgingsinstellingen. Raadsbesluiten en ICT-inkoop volgen strikte procurement.',
  Overheid: 'Rijksoverheid, gemeenten, provincies. Aanbestedingsgevoelig, vaak via Protinus of raamcontracten.',
  Maakindustrie: 'Fabrikanten en productiebedrijven. IT-inkoop loopt meestal via interne procurement.',
  'Tech/ICT': 'Software- en ICT-bedrijven. Vaak al leverancier bij resellers, cross-sell kansen.',
  'Bouw/Techniek': 'Bouwbedrijven en technische dienstverleners. Functietitels vaak gemengd tussen IT en operations.',
  Finance: 'Financiele dienstverleners, banken, verzekeraars. Strenge compliance-eisen.',
  Onderwijs: 'Onderwijsinstellingen van MBO tot universiteit. SIVON/SURF speelt vaak een rol.',
  Overig: 'Niet in een prioriteits-sector ingedeeld. Beoordeel case-by-case of Mensys aansluit.',
};

export default function SectorBadge({ sector }) {
  const value = sector || 'Overig';
  const color = SECTOR_COLORS[value] || SECTOR_COLORS.Overig;
  const tooltip = SECTOR_TOOLTIPS[value] || SECTOR_TOOLTIPS.Overig;
  return (
    <BadgeWithTooltip tooltip={tooltip}>
      <span
        className={styles.badge}
        style={{ backgroundColor: `${color}1A`, color }}
      >
        <span className={styles.dot} style={{ backgroundColor: color }} />
        {value}
      </span>
    </BadgeWithTooltip>
  );
}
