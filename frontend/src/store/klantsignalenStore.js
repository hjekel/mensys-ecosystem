import { generateId } from '../utils/storage.js';

const STORAGE_KEY = 'mensys_klantsignalen';

export const KLANTSIGNAAL_STATUSES = ['Signaal', 'Benaderd', 'Gesprek', 'Gewonnen', 'Verloren'];

export const KLANTSIGNAAL_BRONNEN = [
  'LinkedIn post',
  'Doorverwijzing',
  'Gesprek',
  'Nieuws',
  'Anders',
];

export function getKlantsignalen() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveKlantsignalen(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    return true;
  } catch {
    return false;
  }
}

export function addKlantsignaal(existing, values) {
  const nowIso = new Date().toISOString();
  const record = {
    id: generateId(),
    bedrijfsnaam: '',
    concurrent: '',
    bron: 'LinkedIn post',
    bronDetail: '',
    redenOntevredenheid: '',
    contactpersoon: '',
    contactLinkedin: '',
    status: 'Signaal',
    datum: nowIso,
    notities: '',
    ...values,
    createdAt: nowIso,
    updatedAt: nowIso,
  };
  return [record, ...existing];
}

export function updateKlantsignaal(existing, id, values) {
  const nowIso = new Date().toISOString();
  return existing.map((s) => (s.id === id ? { ...s, ...values, updatedAt: nowIso } : s));
}

export function deleteKlantsignaal(existing, id) {
  return existing.filter((s) => s.id !== id);
}
