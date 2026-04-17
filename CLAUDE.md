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
