import styles from './PropositionBanner.module.css';

export default function PropositionBanner() {
  return (
    <div className={styles.banner}>
      <div className={styles.inner}>
        <span className={styles.logo}>Mensys</span>
        <span className={styles.tagline}>
          Eén factuur, geen creditcard. Figma, Miro, ChatGPT Teams, Claude,
          Copilot, Canva: gewoon via ons geregeld.
        </span>
      </div>
    </div>
  );
}
