import styles from './BadgeWithTooltip.module.css';

export default function BadgeWithTooltip({ tooltip, children, className = '', style }) {
  if (!tooltip) {
    return (
      <span className={className} style={style}>{children}</span>
    );
  }
  return (
    <span className={`${styles.wrap} ${className}`} style={style} tabIndex={0}>
      {children}
      <span className={styles.tooltip} role="tooltip">
        {tooltip}
      </span>
    </span>
  );
}
