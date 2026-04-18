# Mensys Ecosystem App

Interne web-applicatie voor Mensys om procurement managers (inkopers) en
software resellers te beheren binnen de outbound sales pipeline. Elke
medewerker werkt in de browser; data wordt lokaal opgeslagen in
localStorage. Geen backend nodig voor de basis-flow.

Live deploy: via Vercel (Git push naar `main` triggert automatische build).

## Propositie

Mensys BV is een Nederlandse software distributeur. De pitch aan inkopers
en resellers:

- Een Nederlandse factuur in euro, geen USD en geen creditcard
- Persoonlijk contact bij een Nederlands aanspreekpunt
- Niche SaaS tools geregeld via een partij die compliance, procurement
  en facturering snapt (Figma, Miro, ChatGPT Teams, Claude Teams,
  Copilot, Gemini, Canva, Notion, ...)

Doelgroepen:

1. Procurement en inkoopmanagers bij Nederlandse organisaties met
   minimaal 150 FTE
2. Software resellers in Nederland die SaaS tools aan hun klanten
   aanbieden

## Stack

| Laag | Tech |
|------|------|
| Frontend | React 18, Vite, JavaScript (geen TypeScript), CSS modules |
| Kanban drag-drop | `@hello-pangea/dnd` |
| CSV / Excel parsing | `papaparse`, `xlsx` |
| Backend stub | Express.js (minimaal, fase 1) |
| Deployment | Vercel (frontend static + optioneel serverless backend) |
| Data | `localStorage` keys `mensys_contacts` (max 5.000) en `mensys_resellers` |

## Mappenstructuur

```
mensys-ecosystem/
  frontend/
    public/
    src/
      components/         Kanban, List, filters, modals, badges
      pages/              Welkom, Inkopers, Resellers, YALC, Statistieken
      store/              resellersStore.js (localStorage CRUD)
      utils/              csvParser, cleanup, lhf, storage
      App.jsx             tabs + state
      main.jsx, index.css
    package.json, vite.config.js
  backend/                Express stub
  shared/
    constants.js          STATUSES, SECTORS, FTE, RESELLER_*, MENSYS_FIT_*
    mappings.js           CSV kolom-mapping + industry/FTE normalisatie
  CLAUDE.md               Project-instructies voor Claude Code
  YALC_GAPS.md            Gap-analyse YALC integratie (volledige YALC vs huidige LHF-view)
  README.md               Dit bestand
```

## Tabs

| Tab | Doel |
|-----|------|
| Welkom | Onboarding met uitleg, 5-stappen flow-schema, Bronnen/MO/SOP kaarten, CTA knoppen naar Inkopers en Resellers |
| Inkopers | Kanban (5 kolommen: Nieuw, Warm, Benaderd, Gesprek gevoerd, Klant) of Lijst. 4 filters (sector, FTE, status, functietitel) met live counts, CSV import/export, Opschonen, detail-panel |
| Resellers | Kanban (Nieuw, Warm, Benaderd, Gesprek gevoerd, Partner) of Lijst. 4 filters (reseller type, FTE range, Mensys Fit, status), zelfde flow als Inkopers |
| YALC | Low Hanging Fruit scoring uit 100 per record, bands Hot/Warm/Lauw/Koud, filters op bron + land + sector/type + band. Klikbare rijen openen detail-panel. Export top-N CSV |
| Statistieken | Dashboards voor Inkopers en Resellers, tiles + bar charts + functietitel-ranglijst. Alle tiles, bars en rows zijn klikbaar: filtert direct de respectievelijke tab |

## Datastructuur

### Inkoper

```js
{
  id, firstName, lastName, jobTitle, company,
  sector,         // Zorg | Overheid | Maakindustrie | Tech/ICT | ...
  fteCategory,    // 10.000+ | 5.001-10.000 | 1.001-5.000 | ...
  linkedinUrl, email, phone,
  status,         // Nieuw | Warm | Benaderd | Gesprek gevoerd | Klant
  priority,       // Hoog | Middel | Laag
  notes, country, location, companyWebsite,
  createdAt, updatedAt,
}
```

### Reseller

```js
{
  id, bedrijf, voornaam, achternaam, functietitel, email, linkedin,
  fteRange,       // 1-10 | 11-50 | 51-200 | 201-500 | 500+
  resellerType,   // MSP | Microsoft/Cloud Partner | Security Reseller | ...
  mensysFit,      // Hoog | Midden | Onderzoeken | Onbekend
  bron, locatie, website,
  status,         // Nieuw | Warm | Benaderd | Gesprek gevoerd | Partner
  keywords, notities,
  createdAt, updatedAt,
}
```

## CSV import

Inkopers-import herkent de kolomnamen uit `Mensys-Prospects-Clean-v2.xlsx`
(`Company Country`, `First Name`, `Last Name`, `Company`, `Job Title`,
`LinkedIn URL`, `Email`, `LinkedIn Industry`, `Employee Category`, ...).
Zie [shared/mappings.js](shared/mappings.js).

Reseller-import accepteert de kolomnamen uit de spec (`bedrijf`,
`voornaam`, `achternaam`, `functietitel`, `email`, `linkedin`,
`fteRange`, `resellerType`, `mensysFit`, `bron`, `locatie`, `website`,
`status`, `keywords`, `notities`) en een aantal veelgebruikte varianten
(`LinkedIn URL`, `First Name`, `Job Title`, ...). Zie
[frontend/src/utils/resellerCsv.js](frontend/src/utils/resellerCsv.js).

Dedup:
- Inkopers: op LinkedIn URL; anders op `firstName+lastName+company`
- Resellers: op LinkedIn URL; anders op `bedrijf+voornaam+achternaam`

## Opschonen

Zowel Inkopers- als Resellers-tab hebben een "Opschonen" knop. Wat er
gebeurt:

1. Detecteert bogus records:
   - Leeg bedrijf / dash-only bedrijf (`---`)
   - Kale domeinnaam als bedrijf (`4gbewakingskamera.nl`)
   - Functietitel met `gepensioneerd` / `retired` / `pensioen`
2. Normaliseert namen:
   - Bedrijf: Title Case met Dutch tussenvoegsels, B.V./N.V./GmbH/Inc.
     suffix, hyphens (`Tolsma-grisnich` naar `Tolsma-Grisnich`) en
     ampersands (`Croonwolter&dros` naar `Croonwolter&Dros`). Acroniemen
     (IBM, MUMC+, R&D) blijven behouden
   - Voornaam + achternaam: Title Case met tussenvoegsels (`van de
     rovaart` naar `Van de Rovaart`), hyphen- en apostrof-namen correct

De knop toont eerst een preview (aantal te verwijderen + aantal te
normaliseren) en vraagt bevestiging.

## YALC Low Hanging Fruit index

Elke inkoper of reseller krijgt een score uit 100 gebaseerd op signalen.
Bands:

- Hot = 80+
- Warm = 60 tot 79
- Lauw = 40 tot 59
- Koud < 40

Signalen per type zie
[frontend/src/utils/lhf.js](frontend/src/utils/lhf.js). De YALC-tab laat
de top 25/50/100/250 zien, is filterbaar op bron (Inkopers/Resellers),
land, sector of reseller type, en band (klikbare tegels). Rijen openen
het detail-panel, export naar CSV werkt.

De huidige implementatie is bewust smal: een scoring-ranglijst in de
browser. Voor een volledige YALC-integratie (campagnes, A/B variants,
LinkedIn/email automation, Anthropic-gedreven AI planning, intelligence
store, enz.) zie [YALC_GAPS.md](YALC_GAPS.md).

## Kleurpalet

| Doel | Kleur |
|------|-------|
| Primair blauw (enige blauw in de app) | `#003087` |
| Accent oranje | `#E8500A` |
| Achtergrond | `#F4F6F9` |
| Border | `#E5E7EB` |
| Tekst primair / secundair | `#1A1A1A` / `#6B7280` |
| Sector-badges | groen zorg / blauw overheid / oranje maakindustrie / paars tech / ... |
| Mensys Fit-badges | groen Hoog / blauw Midden / oranje Onderzoeken / grijs Onbekend |

Font: IBM Plex Sans (Google Fonts). Geen gradients of gimmicks.

## Harde regels (zie ook CLAUDE.md)

1. `#003087` is de enige blauw. Geen varianten zonder expliciete
   toestemming
2. Geen em-dashes in tekst of code
3. Alle UI-tekst in het Nederlands
4. JavaScript, geen TypeScript
5. Drag-and-drop Kanban werkt echt met `@hello-pangea/dnd`
6. CSV-import werkt op de exacte kolomnamen uit de spec
7. App werkt offline, geen externe API-calls nodig voor basis-flow

## Scripts

Aangeroepen vanuit project-root:

```bash
npm run dev      # start frontend en backend parallel
npm run build    # build frontend (vite build in workspace=frontend)
npm start        # start backend
```

Of vanuit `frontend/`:

```bash
npm run dev      # vite dev server op :5173
npm run build    # productie-bundle naar frontend/dist
npm run preview  # preview productie-bundle lokaal
```

## Deployment

Vercel. Config in `vercel.json`:

```json
{
  "buildCommand": "npm run build --workspace=frontend",
  "outputDirectory": "frontend/dist",
  "framework": "vite",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Elke push naar `main` triggert een Vercel-build. Versienummer komt uit
`frontend/package.json`, build-timestamp wordt ten tijde van de build
door `vite.config.js` geinjecteerd als `__APP_VERSION__` en
`__APP_BUILD_DATE__`. Beide verschijnen in de footer van de app.

## Volgende stappen

- Airtable-backend (of Supabase) integratie
- Multi-user auth (Menso en Thomas)
- Email-template generator vanuit contact
- LinkedIn outreach tracking
- Uitbreiding YALC richting echte GTM-OS features (zie
  [YALC_GAPS.md](YALC_GAPS.md))

## Credits

Geen license gekozen, intern gebruik. Gebouwd met Claude Code.
