import styles from './MarktpositieSection.module.css';

const RED_OCEAN = [
  {
    kolom: 'De Red Ocean',
    items: [
      'Wie vecht in dezelfde ruimte: Actendo, Centralpoint, Scholten Awater',
      'Waarop wordt geconcurreerd: prijs, leveringssnelheid, vendor-certificeringen, breedte portfolio',
      'Wat dit voor klanten betekent: iedereen belooft hetzelfde, niemand onderscheidt zich',
      'Risico voor Mensys bij stilstand: race-to-the-bottom prijsvechter-model',
    ],
  },
  {
    kolom: 'Mensys nu',
    items: [
      'Haarlemse leverancier, persoonlijk contact, euro-factuur',
      'Ook actief in het Actendo-segment (exoten + Microsoft)',
      'Geen eigen onderscheidend aanbod buiten service-niveau',
      'Onbewust meegenomen in aanbestedingen die naar Protinus gaan',
    ],
  },
];

const BLUE_OCEAN = [
  {
    titel: 'Kans 1 - AI-tools specialist',
    beschrijving:
      'Mensys is de enige NL-leverancier die ChatGPT Teams, Claude Teams, Copilot, Gemini, Canva AI en vergelijkbare tools levert op factuur in euro. Niemand anders doet dit gestructureerd.',
    waarom: 'AI-budgetten groeien in 2026-2027 exponentieel en compliance-teams willen EU-facturen. Dit is een tijdelijk voordeel tot Protinus of Crayon het oppakken.',
    eerste: 'Landing page met top-10 AI-tools, case-study Claude Teams bij een MKB-klant, LinkedIn content reeks over euro-factuur versus USD-creditcard.',
  },
  {
    titel: 'Kans 2 - Pre-finance voor resellers',
    beschrijving:
      'Mensys voor-financiert licenties voor resellers zonder creditcard of USD-relatie met de vendor. Reseller houdt de klant, Mensys factureert de reseller in euro. Geen andere NL-speler biedt dit expliciet voor exoten.',
    waarom: 'Kleine resellers lopen deals mis omdat ze geen USD-bankrelatie hebben of de vendor geen NL-factuur geeft. Mensys lost dit op met een paar duizend euro aan voorfinanciering.',
    eerste: 'Pilot met 3 Dripify-resellers die MAXQDA of ChatGPT Teams aan hun klanten willen doorverkopen. Voorwaarde: Mensys betaalt de vendor, reseller betaalt Mensys binnen 30 dagen.',
  },
  {
    titel: 'Kans 3 - Martin-type directeur-segment',
    beschrijving:
      'CEO of eigenaar van een 2-25 FTE bedrijf die software zelf inkoopt op privekaart. Niemand bedient dit segment actief: te klein voor Protinus/SoftwareOne, te "gewoon" voor Actendo\'s licentie-focus.',
    waarom: 'Dit is je Martin-moment: iemand die al betaalt, maar de BTW niet kan aftrekken en geen zakelijke factuur op naam krijgt. Hormozi-offer (grand slam) werkt hier het best.',
    eerste: 'Target-lijst in de CEO & MD tab opbouwen. Eerste outreach: "Je betaalt Claude Teams nu op je privekaart. Wij sturen je morgen een factuur op bedrijfsnaam voor dezelfde prijs. 2 minuten werk."',
  },
  {
    titel: 'Kans 4 - Coopetitie-model met Europese spelers',
    beschrijving:
      'Samenwerken met CloudLand (Benelux-resellers), Crayon (enterprise-doorverwijzingen), of buitenlandse licentie-specialisten voor Nederlandse eindklanten die internationaal inkopen. Mensys als "NL-desk" voor partijen zonder lokale factuurentiteit.',
    waarom: 'Crayon en SoftwareOne bedienen enterprise. Hun klanten hebben dochterbedrijven in MKB-segment die ze niet kunnen bedienen. Mensys pakt dat segment over met een referral-fee.',
    eerste: 'Afspraak met CloudLand (Zoetermeer) en Crayon NL-kantoor. Voorstel: 10% referral-fee voor accounts die zij doorverwijzen met bedrag onder hun minimum-contract-omvang.',
  },
];

export default function MarktpositieSection() {
  return (
    <section className={styles.widget}>
      <div className={styles.header}>
        <h2 className={styles.title}>Marktpositie: Red Ocean vs Blue Ocean</h2>
        <p className={styles.intro}>
          Waar vecht Mensys in bloedig water met concurrenten, en waar is er
          open zee zonder tegenstand? Klap een blok open om de redenering te
          zien.
        </p>
      </div>

      <details className={styles.block}>
        <summary className={styles.summary}>
          <span className={styles.redDot} />
          <span className={styles.blockTitle}>Red Ocean</span>
          <span className={styles.blockSub}>waar iedereen hetzelfde belooft</span>
          <svg className={styles.chev} width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M3 5l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </summary>
        <div className={styles.redWrap}>
          {RED_OCEAN.map((col) => (
            <div key={col.kolom} className={col.kolom === 'De Red Ocean' ? styles.redCol : styles.mensysCol}>
              <h3 className={styles.colTitle}>{col.kolom}</h3>
              <ul className={styles.list}>
                {col.items.map((i) => <li key={i}>{i}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </details>

      <details className={styles.block} open>
        <summary className={styles.summary}>
          <span className={styles.blueDot} />
          <span className={styles.blockTitle}>Blue Ocean</span>
          <span className={styles.blockSub}>vier kansen die niemand anders pakt</span>
          <svg className={styles.chev} width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M3 5l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </summary>
        <div className={styles.blueGrid}>
          {BLUE_OCEAN.map((k) => (
            <article key={k.titel} className={styles.kans}>
              <h3 className={styles.kansTitle}>{k.titel}</h3>
              <p className={styles.kansText}>{k.beschrijving}</p>
              <div className={styles.kansRow}>
                <span className={styles.kansLabel}>Waarom nu?</span>
                <p className={styles.kansText}>{k.waarom}</p>
              </div>
              <div className={styles.kansRow}>
                <span className={styles.kansLabel}>Eerste stap</span>
                <p className={styles.kansText}>{k.eerste}</p>
              </div>
            </article>
          ))}
        </div>
      </details>
    </section>
  );
}
