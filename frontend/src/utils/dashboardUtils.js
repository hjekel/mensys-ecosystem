// Pure read-functies voor het Dashboard. Lezen uit activiteitenStore
// en de drie contact-stores, zonder te schrijven. Altijd aanroepen
// binnen useMemo met versie-tick als dep.

import {
  getActiviteitenInPeriode,
  getLaatsteActiviteit,
  loadActiviteiten,
} from '../store/activiteitenStore.js';
import { rankInkopers, rankCeos, rankResellers } from './lhf.js';

const DAY = 24 * 60 * 60 * 1000;

const CONTACTMOMENT_TYPES = new Set([
  'linkedin_bericht',
  'linkedin_connectie',
  'email_uitgaand',
  'telefoon',
  'meeting',
]);

const UITGAAND_BERICHT_TYPES = new Set([
  'linkedin_bericht',
  'email_uitgaand',
]);

const INKOMEND_REACTIE_TYPES = new Set([
  'linkedin_reactie',
  'email_inkomend',
]);

function toIso(timestamp) {
  return new Date(timestamp).toISOString();
}

function filterByType(list, typeSet) {
  return list.filter((a) => typeSet.has(a.type));
}

export function getContactmomentenInPeriode(startDatum, eindDatum) {
  const items = getActiviteitenInPeriode(startDatum, eindDatum);
  return filterByType(items, CONTACTMOMENT_TYPES);
}

export function getConnectieStats(dagen = 30) {
  const nu = Date.now();
  const start = toIso(nu - dagen * DAY);
  const eind = toIso(nu);
  const items = getActiviteitenInPeriode(start, eind);
  const verzonden = items.filter((a) => a.type === 'linkedin_connectie').length;
  const geaccepteerd = items.filter((a) => a.type === 'linkedin_geaccepteerd').length;
  const percentage = verzonden > 0 ? Math.round((geaccepteerd / verzonden) * 100) : 0;
  return { verzonden, geaccepteerd, percentage };
}

export function getReplyStats(dagen = 30) {
  const nu = Date.now();
  const start = toIso(nu - dagen * DAY);
  const eind = toIso(nu);
  const items = getActiviteitenInPeriode(start, eind);
  const verstuurd = filterByType(items, UITGAAND_BERICHT_TYPES).length;
  const beantwoord = filterByType(items, INKOMEND_REACTIE_TYPES).length;
  const percentage = verstuurd > 0 ? Math.round((beantwoord / verstuurd) * 100) : 0;
  return { verstuurd, beantwoord, percentage };
}

export function getGesprekkenInMaand(jaar, maand) {
  const start = new Date(jaar, maand, 1).toISOString();
  const eind = new Date(jaar, maand + 1, 0, 23, 59, 59, 999).toISOString();
  const items = getActiviteitenInPeriode(start, eind);
  return items.filter((a) => a.type === 'meeting');
}

// Telt per status, gecombineerd over inkopers + ceos + resellers.
// Reseller-status 'Partner' wordt gemapt naar 'Klant'.
// Statussen zonder contacten krijgen waarde 0.
export function getPipelineCounts({ contacts = [], ceos = [], resellers = [] } = {}) {
  const STATUSES = ['Nieuw', 'Warm', 'Benaderd', 'Gesprek gevoerd', 'Klant'];
  const counts = {};
  for (const s of STATUSES) counts[s] = 0;

  for (const c of contacts) {
    const s = c.status || 'Nieuw';
    if (counts[s] !== undefined) counts[s] += 1;
  }
  for (const c of ceos) {
    const s = c.status || 'Nieuw';
    if (counts[s] !== undefined) counts[s] += 1;
  }
  for (const r of resellers) {
    let s = r.status || 'Nieuw';
    if (s === 'Partner') s = 'Klant';
    if (counts[s] !== undefined) counts[s] += 1;
  }

  const totaalNieuw = counts['Nieuw'] || 0;
  const totaalKlant = counts['Klant'] || 0;
  const conversie = totaalNieuw + totaalKlant > 0
    ? Math.round((totaalKlant / (totaalNieuw + totaalKlant)) * 100)
    : 0;

  return { counts, statuses: STATUSES, conversie };
}

function heeftGeenRecenteActiviteit(contactType, contactId, drempelMs) {
  const laatste = getLaatsteActiviteit(contactId, contactType);
  if (!laatste) return true;
  const t = new Date(laatste.datum || 0).getTime();
  return Date.now() - t > drempelMs;
}

function topPerPool({ items, contactType, limiet }) {
  const DREMPEL = 14 * DAY;
  const resultaat = [];
  for (const row of items) {
    if (resultaat.length >= limiet) break;
    const id = row.record?.id;
    if (!id) continue;
    if (!heeftGeenRecenteActiviteit(contactType, id, DREMPEL)) continue;
    resultaat.push({ ...row, contactType });
  }
  return resultaat;
}

// Vandaag benaderen: 2 inkopers + 2 CEO + 1 reseller. Als een pool
// niet vol is, vul aan met restanten uit de andere pools (gesorteerd
// op score). Filter: geen activiteit in laatste 14 dagen.
export function getVandaagBenaderen(limiet = 5, { contacts = [], ceos = [], resellers = [], gewichten } = {}) {
  const rankedInkopers = rankInkopers(contacts, gewichten);
  const rankedCeos = rankCeos(ceos);
  const rankedResellers = rankResellers(resellers);

  const quota = { inkoper: 2, ceo: 2, reseller: 1 };
  const inkoperTop = topPerPool({ items: rankedInkopers, contactType: 'inkoper', limiet: quota.inkoper });
  const ceoTop = topPerPool({ items: rankedCeos, contactType: 'ceo', limiet: quota.ceo });
  const resellerTop = topPerPool({ items: rankedResellers, contactType: 'reseller', limiet: quota.reseller });

  const gekozenIds = new Set([
    ...inkoperTop.map((r) => `inkoper:${r.record.id}`),
    ...ceoTop.map((r) => `ceo:${r.record.id}`),
    ...resellerTop.map((r) => `reseller:${r.record.id}`),
  ]);

  const resultaat = [...inkoperTop, ...ceoTop, ...resellerTop];

  if (resultaat.length >= limiet) {
    return resultaat.slice(0, limiet);
  }

  // Aanvullen uit elke pool (best score eerst), zonder duplicaten
  const DREMPEL = 14 * DAY;
  const rest = [
    ...rankedInkopers.map((r) => ({ ...r, contactType: 'inkoper' })),
    ...rankedCeos.map((r) => ({ ...r, contactType: 'ceo' })),
    ...rankedResellers.map((r) => ({ ...r, contactType: 'reseller' })),
  ]
    .filter((r) => !gekozenIds.has(`${r.contactType}:${r.record.id}`))
    .filter((r) => heeftGeenRecenteActiviteit(r.contactType, r.record.id, DREMPEL))
    .sort((a, b) => b.score - a.score);

  for (const row of rest) {
    if (resultaat.length >= limiet) break;
    resultaat.push(row);
  }

  return resultaat.slice(0, limiet);
}

export function getTotaalActiviteiten() {
  return loadActiviteiten().length;
}
