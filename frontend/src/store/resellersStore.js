import { RESELLER_STORAGE_KEY, MAX_RECORDS } from '@shared/constants.js';
import { generateId } from '../utils/storage.js';

export function getResellers() {
  try {
    const raw = localStorage.getItem(RESELLER_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Kon resellers niet laden uit localStorage', err);
    return [];
  }
}

export function saveResellers(resellers) {
  try {
    const capped = resellers.slice(0, MAX_RECORDS);
    localStorage.setItem(RESELLER_STORAGE_KEY, JSON.stringify(capped));
    return true;
  } catch (err) {
    console.error('Kon resellers niet opslaan in localStorage', err);
    return false;
  }
}

export function addReseller(existing, values) {
  const nowIso = new Date().toISOString();
  const reseller = {
    id: generateId(),
    status: 'Nieuw',
    mensysFit: 'Onbekend',
    ...values,
    createdAt: nowIso,
    updatedAt: nowIso,
  };
  return [reseller, ...existing];
}

export function updateReseller(existing, id, values) {
  const nowIso = new Date().toISOString();
  return existing.map((r) => {
    if (r.id !== id) return r;
    const next = { ...r, ...values, updatedAt: nowIso };
    if (values.status && values.status !== r.status && !values.statusHistory) {
      const history = Array.isArray(r.statusHistory) ? r.statusHistory : [];
      next.statusHistory = [...history, { status: values.status, datum: nowIso }];
    }
    return next;
  });
}

export function deleteReseller(existing, id) {
  return existing.filter((r) => r.id !== id);
}

function normaliseUrl(url) {
  if (!url) return '';
  return String(url)
    .trim()
    .toLowerCase()
    .replace(/\/+$/, '')
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '');
}

function compositeKey(r) {
  return `${(r.bedrijf || '').toLowerCase().trim()}|${(r.voornaam || '').toLowerCase().trim()}|${(r.achternaam || '').toLowerCase().trim()}`;
}

export function importResellers(existing, incoming) {
  const nowIso = new Date().toISOString();
  const byLinkedin = new Map();
  const byKey = new Map();

  for (const r of existing) {
    if (r.linkedin) byLinkedin.set(normaliseUrl(r.linkedin), r);
    byKey.set(compositeKey(r), r);
  }

  const merged = [...existing];
  let added = 0;
  let skipped = 0;

  for (const raw of incoming) {
    const reseller = {
      id: generateId(),
      bedrijf: '',
      voornaam: '',
      achternaam: '',
      functietitel: '',
      email: '',
      linkedin: '',
      fteRange: '',
      resellerType: 'Nader te bepalen',
      mensysFit: 'Onbekend',
      bron: '',
      locatie: '',
      website: '',
      status: 'Nieuw',
      keywords: '',
      notities: '',
      ...raw,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    const urlKey = reseller.linkedin ? normaliseUrl(reseller.linkedin) : null;
    if (urlKey && byLinkedin.has(urlKey)) {
      skipped += 1;
      continue;
    }
    const compKey = compositeKey(reseller);
    if (!urlKey && byKey.has(compKey)) {
      skipped += 1;
      continue;
    }

    merged.push(reseller);
    if (urlKey) byLinkedin.set(urlKey, reseller);
    byKey.set(compKey, reseller);
    added += 1;
  }

  return { merged, added, skipped, total: incoming.length };
}
