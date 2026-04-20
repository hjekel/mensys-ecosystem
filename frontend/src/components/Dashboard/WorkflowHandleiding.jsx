import { useState } from 'react';
import DagelijkseChecklist from '../DagelijkseChecklist.jsx';
import WorkflowSop from '../WorkflowSop.jsx';
import MarktpositieSection from '../MarktpositieSection.jsx';
import LinkedInRitmeTip from '../LinkedInRitmeTip.jsx';
import styles from './WorkflowHandleiding.module.css';

function FlowStep({ num, label, caption }) {
  return (
    <div className={styles.flowStep}>
      <div className={styles.flowNum}>{num}</div>
      <div className={styles.flowLabel}>{label}</div>
      <div className={styles.flowCaption}>{caption}</div>
    </div>
  );
}

function FlowArrow() {
  return (
    <div className={styles.flowArrow} aria-hidden="true">
      <svg width="20" height="12" viewBox="0 0 20 12" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M1 6h17m0 0l-5-5m5 5l-5 5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function InfoCard({ title, subtitle, items }) {
  return (
    <div className={styles.infoCard}>
      <h3 className={styles.infoTitle}>{title}</h3>
      <p className={styles.infoSubtitle}>{subtitle}</p>
      <ul className={styles.infoList}>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function TargetCard({ heading, detail, onClick }) {
  return (
    <button type="button" className={styles.targetCard} onClick={onClick}>
      <span className={styles.targetHeading}>
        {heading}
        <svg
          className={styles.targetArrow}
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M3 7h8m0 0l-3-3m3 3l-3 3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className={styles.targetDetail}>{detail}</span>
    </button>
  );
}

export default function WorkflowHandleiding({ onNavigate, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className={styles.wrap}>
      <button
        type="button"
        className={styles.toggleBtn}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`${styles.chev} ${open ? styles.chevOpen : ''}`}
          aria-hidden="true"
        >
          <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className={styles.toggleTitel}>Workflow handleiding</span>
        <span className={styles.toggleHint}>
          Dagelijkse checklist, SOP, bronnen, doelgroepen, marktpositie
        </span>
      </button>

      {open && (
        <div className={styles.body}>
          <DagelijkseChecklist onNavigate={onNavigate} />

          <LinkedInRitmeTip />

          <WorkflowSop />

          <section className={styles.card}>
            <h2 className={styles.sectionTitle}>Hoe werkt het?</h2>
            <div className={styles.flow}>
              <FlowStep num="1" label="Bronnen" caption="LinkedIn Sales Nav, Apollo, handmatig" />
              <FlowArrow />
              <FlowStep num="2" label="CSV import" caption="Dedup op LinkedIn URL" />
              <FlowArrow />
              <FlowStep num="3" label="Segmenteren" caption="Sector, FTE, status, functietitel" />
              <FlowArrow />
              <FlowStep num="4" label="Benaderen" caption="LinkedIn, e-mail, telefoon" />
              <FlowArrow />
              <FlowStep num="5" label="Pipeline" caption="Nieuw naar Klant via Kanban" />
            </div>
          </section>

          <section className={styles.grid}>
            <InfoCard
              title="Bronnen"
              subtitle="Waar komen de contacten vandaan"
              items={[
                'LinkedIn Sales Navigator export (Vayne)',
                'Apollo.io people search',
                'Opgeschoonde Excel: Mensys-Prospects-Clean-v2.xlsx',
                'Handmatige invoer via + Contact toevoegen',
                'Dedup op LinkedIn URL, anders op naam plus bedrijf',
              ]}
            />

            <InfoCard
              title="Modus Operandi"
              subtitle="Hoe de app werkt"
              items={[
                'Data staat lokaal in localStorage (max 5000 records)',
                'Kanban kolommen: Nieuw, Warm, Benaderd, Gesprek gevoerd, Klant',
                'Drag and drop kaart tussen statussen',
                'Filters op sector, FTE, status, functietitel, met live tellingen',
                'Opschonen knop: verwijdert gepensioneerden en kale domeinnamen, normaliseert bedrijfsnamen',
                'Detail panel rechts met LinkedIn, email, locatie',
              ]}
            />

            <InfoCard
              title="Standard Operating Procedure"
              subtitle="Werkwijze per week"
              items={[
                '1. Nieuwe prospects importeren via CSV',
                '2. Opschonen draaien om ruis te verwijderen',
                '3. Segmenteren met filters (sector plus FTE plus functietitel)',
                '4. LinkedIn connectieverzoek verstuurd, status naar Warm',
                '5. Na acceptatie bericht sturen, status naar Benaderd',
                '6. Gesprek gepland of gevoerd, status bijwerken',
                '7. Bij deal, verplaatsen naar Klant en noteren in notities',
              ]}
            />
          </section>

          <section className={styles.card}>
            <h2 className={styles.sectionTitle}>Doelgroepen</h2>
            <div className={styles.targetGrid}>
              <TargetCard
                heading="1. Procurement en inkoopmanagers"
                detail="Nederlandse organisaties met 150 of meer FTE. Sectoren: zorg, overheid, maakindustrie, tech, bouw, finance, onderwijs."
                onClick={() => onNavigate && onNavigate('inkopers')}
              />
              <TargetCard
                heading="2. Software resellers"
                detail="Nederlandse IT resellers die SaaS tools aan hun klanten aanbieden en op zoek zijn naar een NL distributeur."
                onClick={() => onNavigate && onNavigate('resellers')}
              />
            </div>
          </section>

          <MarktpositieSection />
        </div>
      )}
    </section>
  );
}
