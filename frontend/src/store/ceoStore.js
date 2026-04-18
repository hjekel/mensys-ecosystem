import { CEO_STORAGE_KEY, MAX_RECORDS } from '@shared/constants.js';
import { generateId } from '../utils/storage.js';

export function getCeos() {
  try {
    const raw = localStorage.getItem(CEO_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Kon CEOs niet laden', err);
    return [];
  }
}

export function saveCeos(ceos) {
  try {
    const capped = ceos.slice(0, MAX_RECORDS);
    localStorage.setItem(CEO_STORAGE_KEY, JSON.stringify(capped));
    return true;
  } catch (err) {
    console.error('Kon CEOs niet opslaan', err);
    return false;
  }
}

export function updateCeo(existing, id, values) {
  const nowIso = new Date().toISOString();
  return existing.map((c) => {
    if (c.id !== id) return c;
    const next = { ...c, ...values, updatedAt: nowIso };
    if (values.status && values.status !== c.status && !values.statusHistory) {
      const history = Array.isArray(c.statusHistory) ? c.statusHistory : [];
      next.statusHistory = [...history, { status: values.status, datum: nowIso }];
    }
    return next;
  });
}

export function addCeo(existing, values) {
  const nowIso = new Date().toISOString();
  const ceo = {
    id: generateId(),
    status: 'Nieuw',
    priority: 'Middel',
    mensysFit: 'Hoog',
    ...values,
    createdAt: nowIso,
    updatedAt: nowIso,
  };
  return [ceo, ...existing];
}

export function deleteCeo(existing, id) {
  return existing.filter((c) => c.id !== id);
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

function compositeKey(c) {
  return `${(c.firstName || '').toLowerCase().trim()}|${(c.lastName || '').toLowerCase().trim()}|${(c.company || '').toLowerCase().trim()}`;
}

export function importCeos(existing, incoming) {
  const nowIso = new Date().toISOString();
  const byLinkedin = new Map();
  const byKey = new Map();
  for (const c of existing) {
    if (c.linkedinUrl) byLinkedin.set(normaliseUrl(c.linkedinUrl), c);
    byKey.set(compositeKey(c), c);
  }

  const merged = [...existing];
  let added = 0;
  let skipped = 0;

  for (const raw of incoming) {
    const ceo = {
      id: generateId(),
      firstName: '',
      lastName: '',
      jobTitle: '',
      company: '',
      sector: 'Overig',
      fteCategory: '1-10',
      linkedinUrl: '',
      email: '',
      phone: '',
      status: 'Nieuw',
      priority: 'Middel',
      mensysFit: 'Hoog',
      notes: '',
      country: '',
      location: '',
      companyWebsite: '',
      source: '',
      ...raw,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    const urlKey = ceo.linkedinUrl ? normaliseUrl(ceo.linkedinUrl) : null;
    if (urlKey && byLinkedin.has(urlKey)) {
      skipped += 1;
      continue;
    }
    const compKey = compositeKey(ceo);
    if (!urlKey && byKey.has(compKey)) {
      skipped += 1;
      continue;
    }
    merged.push(ceo);
    if (urlKey) byLinkedin.set(urlKey, ceo);
    byKey.set(compKey, ceo);
    added += 1;
  }

  return { merged, added, skipped, total: incoming.length };
}
