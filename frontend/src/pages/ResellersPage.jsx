import styles from './ResellersPage.module.css';

export default function ResellersPage() {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.icon}>
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 9l2-5h14l2 5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 9v11a1 1 0 001 1h16a1 1 0 001-1V9" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M8 9a4 4 0 008 0" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2>Resellers</h2>
        <p className={styles.lead}>
          Hier komt de lijst met Nederlandse software resellers die Mensys
          inzet als indirect verkoopkanaal.
        </p>
        <p className={styles.sub}>
          Deze tab wordt gevuld in de volgende fase. Voor nu focussen we op de
          procurement managers.
        </p>

        <div className={styles.roadmap}>
          <div className={styles.roadmapItem}>
            <span className={styles.roadmapStep}>1</span>
            <div>
              <strong>Reseller kaart</strong>
              <p>Bedrijfsnaam, contactpersoon, regio, portfolio, status</p>
            </div>
          </div>
          <div className={styles.roadmapItem}>
            <span className={styles.roadmapStep}>2</span>
            <div>
              <strong>Pipeline tracking</strong>
              <p>Gesprekken, deals in uitvoering, doorverkochte licenties</p>
            </div>
          </div>
          <div className={styles.roadmapItem}>
            <span className={styles.roadmapStep}>3</span>
            <div>
              <strong>Commissie overzicht</strong>
              <p>Afgesproken tarieven per reseller en per product</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
