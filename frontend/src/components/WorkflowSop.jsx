import styles from './WorkflowSop.module.css';

const BLOCKS = [
  {
    titel: 'Dagelijks',
    tijd: '10 min',
    items: [
      'Signalen-tab openen en langs de vier bronnen scannen.',
      'Top 3 YALC-contacten bekijken en aantekeningen updaten.',
      'Opener-knop gebruiken om een LinkedIn DM te genereren. Kopieer naar klembord en plak in LinkedIn. Sla op als notitie als je de tekst wilt hergebruiken.',
    ],
  },
  {
    titel: 'Wekelijks',
    tijd: '1 uur',
    items: [
      'YALC top 25 exporteren als CSV.',
      'CSV in Vayne laden voor LinkedIn URL-validatie.',
      'Vayne-output in Dripify importeren als sequentie: connectie-verzoek (dag 1), DM (dag 3), follow-up (dag 7).',
      'Statussen in de app bijwerken op basis van Dripify-reacties. Een status-wijziging voedt automatisch de week-doelen teller op de YALC-tab.',
    ],
  },
  {
    titel: 'Maandelijks',
    tijd: '30 min',
    items: [
      'Nieuwe Sales Navigator export importeren via CSV.',
      'Opschonen-knop draaien om ruis en duplicaten weg te werken.',
      'Statistieken screenshotten voor rapportage aan het management.',
    ],
  },
];

export default function WorkflowSop() {
  return (
    <section className={styles.widget}>
      <h2 className={styles.title}>Workflow</h2>
      <p className={styles.intro}>
        Ritme voor outbound. Klap een blok open om de concrete stappen te zien.
      </p>
      <div className={styles.blocks}>
        {BLOCKS.map((b) => (
          <details key={b.titel} className={styles.block}>
            <summary className={styles.summary}>
              <span className={styles.blockTitle}>{b.titel}</span>
              <span className={styles.blockTime}>({b.tijd})</span>
              <svg
                className={styles.chev}
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M3 5l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </summary>
            <ol className={styles.list}>
              {b.items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ol>
          </details>
        ))}
      </div>
    </section>
  );
}
