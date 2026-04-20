# Mensys Ecosystem App

## Project doel

Interne web-applicatie waarmee Menso en Thomas procurement managers
(inkopers) en software resellers beheren als onderdeel van de Mensys
outbound sales pipeline.

Fase 1: volledig frontend met localStorage persistentie. Backend is
minimaal (health check plus stub) en wordt later uitgebreid met
Airtable integratie.

## Stack

- Frontend: React 18, Vite, JavaScript (geen TypeScript), CSS modules
- Drag and drop: @hello-pangea/dnd
- Backend: Express.js (Node 18+), minimalistisch voor fase 1
- Deployment: Vercel (frontend static, backend als serverless)
- Package manager: npm workspaces
- Data: localStorage (key `mensys_contacts`), max 5000 records

Mappen:
```
mensys-ecosystem/
  frontend/   React SPA
  backend/    Express API
  shared/     Constanten en mappings
```

## Mensys waardepropositie

Mensys BV is een Nederlandse software distributeur. De propositie:
een Nederlandse factuur en persoonlijk contact voor niche SaaS tools
(Figma, Miro, Claude Teams, ChatGPT Teams, Copilot, Gemini, Canva,
Notion). Klanten hoeven geen creditcard te gebruiken en krijgen geen
USD facturatie. Dit lost het inkoop-probleem op bij organisaties met
strikte procurement regels.

Doelgroepen:
1. Procurement en inkoopmanagers bij NL organisaties met 150+ FTE.
2. Software resellers in Nederland.

## Kleurpalet (hard)

- Primair blauw: `#003087` (Koninklijk HFC). Dit is de ENIGE blauw in
  de app. Geen lichter, donkerder of alternatief blauw zonder
  expliciete toestemming van Henk.
- Accent oranje: `#E8500A` voor badges en CTA buttons
- Achtergrond: `#F4F6F9` lichtgrijs
- Wit: `#FFFFFF` voor cards
- Tekst: `#1A1A1A` primair, `#6B7280` secundair
- Sector badges:
  - Zorg: groen `#16A34A`
  - Overheid: blauw `#003087`
  - Maakindustrie: oranje `#E8500A`
  - Tech/ICT: paars `#7C3AED`
  - Bouw/Techniek: geel-bruin `#B45309`
  - Finance: donkergrijs `#374151`
  - Onderwijs: teal `#0D9488`
  - Overig: grijs `#6B7280`

Font: IBM Plex Sans (Google Fonts). Geen gradients, geen gimmicks.
Strak, professioneel, zakelijk.

## Datastructuur contact

```js
{
  id: string,
  firstName: string,
  lastName: string,
  jobTitle: string,
  company: string,
  sector: 'Zorg' | 'Overheid' | 'Maakindustrie' | 'Tech/ICT' |
          'Bouw/Techniek' | 'Finance' | 'Onderwijs' | 'Overig',
  fteCategory: '10.000+' | '5.001-10.000' | '1.001-5.000' |
               '501-1.000' | '201-500' | '51-200' | 'Onbekend',
  linkedinUrl: string,
  email: string,
  phone: string,
  status: 'Nieuw' | 'Warm' | 'Benaderd' | 'Gesprek gevoerd' | 'Klant',
  priority: 'Hoog' | 'Middel' | 'Laag',
  notes: string,
  country: string,
  location: string,
  companyWebsite: string,
  createdAt: ISO string,
  updatedAt: ISO string,
}
```

## CSV import kolommen (Mensys-Prospects-Clean-v2.xlsx)

Exacte kolomnamen die de parser herkent:
Company Country, LinkedIn Company Location (HQ), Location, Country,
LinkedIn Industry, LinkedIn Employees, Employee Category,
Revenue Range, Company, First Name, Last Name, Job Title,
LinkedIn URL, Email, Connections, Job Started,
Corporate LinkedIn URL, Corporate Website, Founded Year,
Company Employee Count, Certifications, Source.

Mapping zie [shared/mappings.js](shared/mappings.js).
Dedup op LinkedIn URL.

## Harde regels

1. Geen em dashes in tekst of comments. Nooit. Gebruik komma, punt of
   haakjes.
2. `#003087` is de enige blauw. Geen varianten.
3. Drag and drop Kanban werkt echt met @hello-pangea/dnd.
4. CSV import werkt met de exacte kolomnamen hierboven.
5. Alle UI tekst is Nederlands.
6. JavaScript, geen TypeScript.
7. UK English in code comments en variabele namen waar relevant.
8. App werkt offline, geen externe API calls nodig voor basis flow.

## Scripts

```
npm run dev      # start frontend en backend parallel
npm run build    # build frontend
npm start        # start backend
```

## Volgende stappen (niet in fase 1)

- Airtable backend integratie
- Multi-user auth (Menso en Thomas)
- Reseller tab vullen met data
- Email template generator vanuit contact
- LinkedIn outreach tracking

## CEO & MD tab
- Store: frontend/src/store/ceoStore.js
- localStorage key: mensys_ceo
- Page: frontend/src/pages/CeoPage.jsx
- Datastructuur: identiek aan Inkopers, fteCategory uit {1-10, 11-50}
- Functietitels typisch: CEO, DGA, Directeur, Eigenaar, Founder, MD,
  Managing Director, Owner, Oprichter
- Mensys Fit altijd Hoog (Martin-type doelgroep)
- Kanban kolommen: Nieuw | Warm | Benaderd | Gesprek gevoerd | Klant
- CSV import: derde modus in CSVImportModal (mode=ceo)
- YALC: derde bron-toggle, scoreCeo geeft +25 bonus voor altijd-Hoog

## Resellers tab
- Store: frontend/src/store/resellersStore.js
- localStorage key: mensys_resellers
- Page: frontend/src/pages/ResellersPage.jsx
- Card: frontend/src/components/ResellerCard.jsx
- Kanban kolommen: Nieuw | Warm | Benaderd | Gesprek gevoerd | Partner
- Datastructuur: zie resellersStore.js

## Signalen tab
- Page: frontend/src/pages/SignalenPage.jsx
- Fetcher: frontend/src/utils/signaalFetcher.js
- localStorage keys: mensys_signalen, mensys_signalen_lastFetch
- Auto-refresh bij tab-open als laatste fetch meer dan 4 uur geleden
- Bronnen: TenderNed JSON, 4 vakblad RSS, 5 AI-tools RSS, Google News
  per top 20 bedrijven op YALC-score
- Alle fetches via https://api.allorigins.win/raw?url= als CORS proxy
- Matching: titel en samenvatting tegen alle bedrijven in inkopers en
  resellers (case-insensitive substring, min 4 chars)

## YALC tab
- Page: frontend/src/pages/YalcPage.jsx
- Scoring: frontend/src/utils/lhf.js
- Gewichten (inkopers): frontend/src/utils/yalcInstellingen.js,
  localStorage key mensys_yalc_gewichten, configureerbaar via
  YalcGewichtenModal (6 sliders 0-30 per criterium, totaalteller
  streeft naar 100)
- Low Hanging Fruit index uit 100 per Inkoper of Reseller
- Bands: Hot 80+, Warm 60-79, Lauw 40-59, Koud <40
- Signalen: email, LinkedIn, FTE-match, sector/priority, status Warm,
  prio Hoog (Inkopers, gewichten aanpasbaar) of Mensys Fit (Resellers,
  gewichten vast)
- Week-doelen widget bovenaan: connecties, DMs, reacties, gesprekken,
  partners van afgelopen 7 dagen (uit statusHistory)
- Opener-knop per rij: opent OpenerModal, roept Anthropic API aan
  (claude-sonnet-4-20250514, max_tokens 500)

## Opener-generator
- Component: frontend/src/components/OpenerModal.jsx
- API-client: frontend/src/utils/anthropic.js
- API-key bewaard in localStorage key mensys_anthropic_api_key
- Direct browser-access via anthropic-dangerous-direct-browser-access
  header. Alleen veilig voor single-user lokale app.
- Opslaan als notitie voegt met datum-prefix toe aan notes/notities

## Dagelijkse checklist
- Component: frontend/src/components/DagelijkseChecklist.jsx
- localStorage key: mensys_dagelijkse_checklist_{YYYY-MM-DD}
- Reset elke dag automatisch (key verandert per datum)
- 3 blokken: Ochtend, Uitreik, Einde dag
- Navigeert naar Signalen/YALC/Inkopers tabs

## Instellingen
- Util: frontend/src/utils/instellingen.js
- Modal: frontend/src/components/InstellingenModal.jsx
- localStorage key: mensys_instellingen
- Configureerbaar: bedrijfsnaam, propositie, gebruikersnaam, logoKleur
- Wijzigt propositie-banner (kleur plus tekst), Welkom-titel en footer
- Te openen via tandwiel-icoon rechtsboven op Welkom-tab

## Marktpositie sectie
- Component: frontend/src/components/MarktpositieSection.jsx
- Twee uitklapbare blokken op Welkom-tab: Red Ocean (ingeklapt default)
  en Blue Ocean (uitgeklapt default)
- Red Ocean: twee-kolom tabel (De Red Ocean versus Mensys nu)
- Blue Ocean: vier kansen-kaartjes (AI-tools specialist, Pre-finance
  voor resellers, Martin-type directeur-segment, Coopetitie-model)

## Workflow SOP
- Component: frontend/src/components/WorkflowSop.jsx
- Drie uitklapbare blokken op Welkom-tab: Dagelijks (10 min),
  Wekelijks (1 uur), Maandelijks (30 min)
- Native <details>/<summary> voor expand/collapse
- Bevat opener-flow uitleg in Dagelijks-blok

## Concurrenten-tab
- Store concurrenten: frontend/src/store/concurrentenStore.js (localStorage: mensys_concurrenten)
- Store signalen: frontend/src/store/klantsignalenStore.js (localStorage: mensys_klantsignalen)
- Page: frontend/src/pages/ConcurrentenPage.jsx
- Componenten: VerschilMatrix.jsx, KlantSignaalModal.jsx, ConcurrentFormModal.jsx, ConcurrentDetailPanel.jsx
- Pre-gevuld: 10 concurrenten bij eerste load (Actendo, CloudLand, Protinus IT,
  Centralpoint, Scholten Awater, SoftwareOne, Crayon, Comparex, Schogo, Vendor-direct)
- Klantsignalen status 'Signaal' verschijnen in YALC-tab als prioriteit 85
- SignalenPage toont chip "Concurrent: [naam]" bij match in nieuws

## Ecosysteem tab
- Page: frontend/src/pages/EcosysteemPage.jsx
- SVG radiale visualisatie (geen D3, puur SVG + React) met drie ringen
- Centrum: Mensys node (48 radius, kleur #003087)
- Ring 1 (r=200): 5 distributeurs (ALSO, Copaco, Ingram Micro,
  TD SYNNEX, DSD Europe). Grijs #5c6a85, gestippelde verbindingslijnen
- Ring 2 (r=350): top N resellers (default 50, max 50) op YALC-score.
  Kleur per Mensys Fit, grootte proportioneel aan score
- Ring 3 (r=480): top N inkopers (default 30, max 30) op YALC-score.
  Kleur per sector
- Filter-balk: sector, status
- Config modal: sliders voor max nodes, Mensys Fit checkboxes,
  distributeurs-toggle
- Hover tooltip + klik opent detail-panel

## Status-history
- Elk contact en reseller heeft optioneel statusHistory array:
  [{ status, datum }]
- updateContact (utils/storage.js) en updateReseller (store/
  resellersStore.js) appenden automatisch bij status-wijziging
- Gebruikt door WeekGoals voor 7-daagse tellingen

## Fase A voltooid 2026-04-20

Fase A voltooid 2026-04-20: rebrand Mensys' EcoSystem, lijst-default,
UTF-8 dispatch fix, opener Modus 1 en 2, Rolodex persoonlijke context,
concurrent-categorie-tooltips, statistieken 4-koloms grid, help-popups.

Fase B voltooid 2026-04-20: Home-dashboard met KPIs, to-dos,
activiteit-feed.

Fase C voltooid 2026-04-20: backup/restore via JSON, waarschuwingsbanner.
