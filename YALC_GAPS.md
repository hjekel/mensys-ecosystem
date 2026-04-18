# YALC Gap-analyse

Overzicht van wat de YALC-tab in de Mensys Ecosystem App nu doet, wat
het originele YALC GTM Operating System
(<https://github.com/Othmane-Khadri/YALC-the-GTM-operating-system>) kan,
en welke functionaliteit nog ontbreekt. Gebruik dit document als
gespreksstuk voor Claude Chat om te bepalen welke onderdelen we wel
willen bouwen en welke niet.

---

## Wat is nu gebouwd (huidige "YALC"-tab)

Een browser-only Low Hanging Fruit scoringsweergave.

- Scoring per record uit 100, bands Hot/Warm/Lauw/Koud
- Regels vast gedefinieerd in [frontend/src/utils/lhf.js](frontend/src/utils/lhf.js)
  - Inkopers: email (20) + LinkedIn (20) + FTE 201+ (15) + priority
    sector (15) + status Warm/Gesprek (20) + priority Hoog (10)
  - Resellers: Mensys Fit (30/15/5) + email (20) + LinkedIn (20) +
    status (15) + reseller type (10) + FTE (5)
- Filters: bron (Inkopers/Resellers), zoek, land, sector/type, band,
  top N (25/50/100/250)
- Klikbare rij opent detail-panel, status en notities bewerkbaar
- Export top-N naar CSV (inkopers- of reseller-formaat)

Alles offline, geen AI, geen externe API-calls.

---

## Wat YALC GTM OS daarnaast doet

Het originele project is een Node CLI + database + multi-provider stack
met als kern: "AI plans your campaigns, qualifies your leads, and
learns from every interaction." De lagen:

1. **Service-laag**: API-wrappers voor externe providers
2. **Provider-laag**: StepExecutors per provider (Unipile, Crustdata,
   Firecrawl, Notion, FullEnrich, Instantly, Anthropic)
3. **Skills-laag**: 16 user-facing operaties
4. **CLI-laag**: `yalc-gtm <command>` (start, campaign:create,
   leads:qualify, orchestrate, ...)
5. **Data-laag**: Drizzle ORM op SQLite/Turso + intelligence store

---

## Gap-tabel (YALC GTM OS feature vs huidige Mensys-app)

| # | YALC feature | Status in Mensys-app | Mogelijk? | Scope / opmerking |
|---|-------------|----------------------|-----------|-------------------|
| 1 | **Lead qualification pipeline (7 gates)** | Er is nu alleen een enkel scoring-model (LHF). Geen gate-logica, geen configureerbare regels | Ja, prima browser-haalbaar | Uitbreiden `lhf.js` met meerdere gates (fit, intent, urgentie, reachability, authority, timing, budget). Gates definieerbaar in een aparte config-file of UI |
| 2 | **Kwalificatie regels (auto-generated, Markdown)** | Regels zijn nu hardcoded in JS | Ja, via een editor in de UI die JSON/Markdown opslaat in localStorage | Mooi als samen met AI-generatie |
| 3 | **Campagnes aanmaken** | Niet aanwezig | Ja, browser-kant kan | Nieuwe "Campagnes"-tab met campagne-object (naam, hypothese, target-segment, outreach-template, status, metrics). Persist in localStorage |
| 4 | **A/B variant testing** | Niet aanwezig | Ja | Variant-objecten per campagne, random-assigner bij outreach |
| 5 | **Statistische significantie (chi-squared)** | Niet aanwezig | Ja, kleine JS util | Pas betekenisvol met genoeg data (minstens 100+ sends per variant) |
| 6 | **Campaign dashboard** | Niet aanwezig | Ja, in browser | Funnel-view: N targets naar N connects naar N antwoorden naar N calls naar N klanten |
| 7 | **Intelligence store (learnings per outcome)** | Niet aanwezig | Ja, mits data-volume groot genoeg voor zinvolle learnings | localStorage is krap voor dit. Zou Supabase/Airtable backend vergen |
| 8 | **Cross-campaign monthly report** | Niet aanwezig | Ja | Markdown-rapport via UI genereren, download |
| 9 | **Natural language orchestration** ("find 10 companies matching my ICP") | Niet aanwezig | Alleen met Anthropic API-key in de browser. Kan, maar API-key in frontend is niet veilig | Vereist backend-proxy voor veilige key-opslag |
| 10 | **AI-gedreven plan-synthese vanuit ICP/website** | Niet aanwezig | Zie 9 | Idem, backend nodig voor veilige API-call |
| 11 | **LinkedIn automation (Unipile)** | Handmatig: knop opent LinkedIn profiel | Unipile API + daily limits + rate limiter. Integratie in browser niet mogelijk wegens CORS | Backend-proxy nodig (Node/Express). Past bij fase 2 |
| 12 | **Email sequences (Instantly, Unipile email)** | Niet aanwezig | Backend + provider-integratie | Fase 2 |
| 13 | **Email personalization via Anthropic** | Niet aanwezig | Backend + Anthropic | Fase 2 |
| 14 | **LinkedIn post comment scraping + reply** | Niet aanwezig | Unipile + backend | Nice-to-have, fase 3 |
| 15 | **Company/people search (Crustdata)** | Alleen wat in CSV geimporteerd wordt | Crustdata API + backend | Fase 3, waardevol voor prospecting |
| 16 | **Email/phone enrichment (FullEnrich)** | Niet aanwezig | FullEnrich API + backend | Fase 2. Zinvol voor dedup + contact-gegevens |
| 17 | **Website scraping voor ICP-synthese (Firecrawl)** | Niet aanwezig | Firecrawl + backend | Fase 2 |
| 18 | **Notion sync (campaigns, leads, variants)** | Niet aanwezig | Notion API + backend | Optioneel, als je Menso/Thomas sync via Notion wilt |
| 19 | **Outbound validation (hard blocks op violations)** | Niet aanwezig | Ja, browser-only | Regex-regels om bedreigende woorden, spam-trigger woorden, te lange berichten te blokken |
| 20 | **Rate limiting (token bucket, DB-backed)** | Niet aanwezig | Backend nodig | Past bij fase 2 wanneer echte sends plaatsvinden |
| 21 | **Background agents (launchd)** | Niet aanwezig | Alleen met backend + cron/scheduler | Desktop- of server-feature, niet browser |
| 22 | **Dry-run modus** | Elke "actie" in de app is nu al lokaal dus impliciet dry-run | N/A | Wordt relevant zodra externe sends geimplementeerd zijn |
| 23 | **Drizzle/SQLite persistence** | localStorage | Kan naar IndexedDB (browser) of Supabase/Airtable | Beslissing: wanneer stappen we over? |
| 24 | **Multi-tenant (meerdere bedrijven per installatie)** | Niet aanwezig | Browser single-tenant, prima voor Mensys alleen | Alleen relevant als tool doorverkocht wordt |
| 25 | **Per-tenant overrides in YAML** | Niet aanwezig | Zie 24 | N/A |
| 26 | **CLI-first workflow** | UI-first, geen CLI | N/A | Haalbaar met een aparte Node CLI, maar duidelijk scope creep |
| 27 | **Framework.yaml (ICP, positioning, signals)** | Nergens in de app | Ja, bouwen als UI-editor met YAML/JSON export | Mooi voor Menso om te onderhouden |
| 28 | **Competitive intelligence module** | Niet aanwezig | Ja, handmatige invoer + scrapers via backend | Fase 3 |
| 29 | **Search queries monitoring (keywords.txt)** | Niet aanwezig | Nice-to-have | Past in "Bronnen"-uitbreiding |
| 30 | **Campaign tracking: polling Unipile, advancing sequences** | Niet aanwezig | Backend-only (cron job) | Fase 2 |

---

## Aanbeveling voor prioritering

**Zonder backend uitbreidbaar (blijft browser-only)**:

- **Uitbreiden scoring naar 7-gate kwalificatie** (gap 1, 2)
- **Campagnes-tab met A/B variants** (gap 3, 4, 5)
- **Campaign dashboard / funnel-view** (gap 6)
- **Framework.yaml editor in UI** (gap 27)
- **Outbound validator** (gap 19) voor template-checks
- **Markdown rapport-generator** (gap 8)

**Vereist fase 2 (backend + provider-keys)**:

- LinkedIn automation, email sequences, enrichment, scraping,
  Anthropic-gedreven AI (gap 9, 10, 11, 12, 13, 15, 16, 17)
- Rate limiting, background agents, Drizzle persistence (gap 20, 21, 23)

**Waarschijnlijk niet nuttig voor Mensys**:

- Multi-tenant, per-tenant overrides (gap 24, 25)
- CLI-first workflow (gap 26)

---

## Vraag voor Claude Chat

Welke van de bovenstaande "browser-only" uitbreidingen hebben de meeste
waarde voor Menso en Thomas in fase 1? En wanneer wordt het tijd om een
echte backend (Supabase / Airtable / eigen Node-server) te starten zodat
we de LinkedIn- en email-automation in fase 2 kunnen bouwen?

---

*Laatst bijgewerkt: 2026-04-18 (commit d3acd2b + opvolgers). Voor de
actuele stand van de YALC-tab in deze app, zie
[frontend/src/pages/YalcPage.jsx](frontend/src/pages/YalcPage.jsx) en
[frontend/src/utils/lhf.js](frontend/src/utils/lhf.js).*
