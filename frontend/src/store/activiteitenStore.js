// Activiteiten-log per contact. localStorage-only store, zelfde
// patroon als ceoStore / resellersStore. FIFO-cap op 10.000 items.

import { generateId } from '../utils/storage.js';

const STORAGE_KEY = 'mensys_activiteiten';
const MAX_ITEMS = 10000;

let versie = 0;
const subscribers = new Set();

export function getVersie() {
  return versie;
}

export function subscribe(cb) {
  if (typeof cb !== 'function') return () => {};
  subscribers.add(cb);
  return () => {
    subscribers.delete(cb);
  };
}

function notify() {
  versie += 1;
  for (const cb of subscribers) {
    try {
      cb(versie);
    } catch (err) {
      console.error('activiteitenStore subscriber fout', err);
    }
  }
}

export function loadActiviteiten() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Kon activiteiten niet laden', err);
    return [];
  }
}

export function saveActiviteiten(items) {
  try {
    const capped = items.length > MAX_ITEMS
      ? items.slice(items.length - MAX_ITEMS)
      : items;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(capped));
    return capped;
  } catch (err) {
    console.error('Kon activiteiten niet opslaan', err);
    return items;
  }
}

function sortByDatumDesc(list) {
  return [...list].sort((a, b) => {
    const da = new Date(a.datum || 0).getTime();
    const db = new Date(b.datum || 0).getTime();
    return db - da;
  });
}

export function voegActiviteitToe(activiteit) {
  const nowIso = new Date().toISOString();
  const record = {
    id: generateId(),
    contactId: '',
    contactType: 'inkoper',
    contactNaam: '',
    type: 'notitie',
    datum: nowIso,
    richting: 'intern',
    uitvoerder: '',
    kort: '',
    lang: '',
    ...activiteit,
    aangemaakt: nowIso,
  };
  const current = loadActiviteiten();
  const next = saveActiviteiten([...current, record]);
  notify();
  return { record, all: next };
}

export function verwijderActiviteit(id) {
  const current = loadActiviteiten();
  const next = current.filter((a) => a.id !== id);
  saveActiviteiten(next);
  notify();
  return next;
}

export function updateActiviteit(id, wijzigingen) {
  const current = loadActiviteiten();
  const next = current.map((a) => (a.id === id ? { ...a, ...wijzigingen } : a));
  saveActiviteiten(next);
  notify();
  return next;
}

export function getAlleActiviteiten(limiet) {
  const all = loadActiviteiten();
  const sorted = sortByDatumDesc(all);
  if (typeof limiet === 'number' && limiet > 0) {
    return sorted.slice(0, limiet);
  }
  return sorted;
}

export function getActiviteitenVoorContact(contactId, contactType) {
  if (!contactId) return [];
  const all = loadActiviteiten();
  const list = all.filter(
    (a) => a.contactId === contactId && (!contactType || a.contactType === contactType),
  );
  return sortByDatumDesc(list);
}

export function getLaatsteActiviteit(contactId, contactType) {
  const list = getActiviteitenVoorContact(contactId, contactType);
  return list.length > 0 ? list[0] : null;
}

export function getActiviteitenInPeriode(startDatum, eindDatum) {
  const start = new Date(startDatum).getTime();
  const eind = new Date(eindDatum).getTime();
  const all = loadActiviteiten();
  return sortByDatumDesc(
    all.filter((a) => {
      const t = new Date(a.datum || 0).getTime();
      return t >= start && t <= eind;
    }),
  );
}

export function bouwLaatsteActiviteitIndex(contactType) {
  const all = loadActiviteiten();
  const index = new Map();
  for (const a of all) {
    if (contactType && a.contactType !== contactType) continue;
    const existing = index.get(a.contactId);
    const t = new Date(a.datum || 0).getTime();
    if (!existing || t > existing._t) {
      index.set(a.contactId, { ...a, _t: t });
    }
  }
  return index;
}
