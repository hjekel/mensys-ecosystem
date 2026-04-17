import { STORAGE_KEY, MAX_RECORDS } from '@shared/constants.js';

export function loadContacts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Kon contacten niet laden uit localStorage', err);
    return [];
  }
}

export function saveContacts(contacts) {
  try {
    const capped = contacts.slice(0, MAX_RECORDS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(capped));
    return true;
  } catch (err) {
    console.error('Kon contacten niet opslaan in localStorage', err);
    return false;
  }
}

export function generateId() {
  return `c_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function mergeContacts(existing, incoming) {
  const byLinkedIn = new Map();
  const byKey = new Map();

  const keyOf = (c) => `${(c.firstName || '').toLowerCase()}|${(c.lastName || '').toLowerCase()}|${(c.company || '').toLowerCase()}`;

  for (const c of existing) {
    if (c.linkedinUrl) byLinkedIn.set(normaliseUrl(c.linkedinUrl), c);
    byKey.set(keyOf(c), c);
  }

  const merged = [...existing];
  let added = 0;
  let skipped = 0;

  for (const c of incoming) {
    const urlKey = c.linkedinUrl ? normaliseUrl(c.linkedinUrl) : null;
    if (urlKey && byLinkedIn.has(urlKey)) {
      skipped += 1;
      continue;
    }
    if (!urlKey && byKey.has(keyOf(c))) {
      skipped += 1;
      continue;
    }
    merged.push(c);
    if (urlKey) byLinkedIn.set(urlKey, c);
    byKey.set(keyOf(c), c);
    added += 1;
  }

  return { merged, added, skipped };
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
