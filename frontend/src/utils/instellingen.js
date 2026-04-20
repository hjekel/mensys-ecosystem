// Configureerbare instellingen voor de app. Maakt de UI herbruikbaar
// voor andere proposities door bedrijfsnaam, tagline, gebruiker en
// hoofdkleur los te koppelen van de code.

const STORAGE_KEY = 'mensys_instellingen';

export const AFSLUITER_OPTIES = [
  { key: 'herkenbaar', label: 'Herkenbaar?' },
  { key: 'herken_je_dit', label: 'Herken je dit?' },
  { key: 'speelt_dit', label: 'Speelt dit bij jullie?' },
  { key: 'eigen', label: 'Eigen tekst...' },
];

export const DEFAULT_DOELEN = {
  invitesPerWerkdag: 40,
  contactmomentenPerWeek: 175,
  berichtenPerWeek: 100,
  reactiesPerWeek: 20,
  gesprekkenPerMaand: 10,
  nieuweKlantenPerKwartaal: 5,
  reactivatiesPerKwartaal: 10,
};

export const DEFAULT_INSTELLINGEN = {
  bedrijfsnaam: 'Mensys',
  propositie: 'Eén factuur, geen creditcard. Figma, Miro, ChatGPT Teams, Claude, Copilot, Canva: gewoon via ons geregeld.',
  gebruikersnaam: '',
  logoKleur: '#003087',
  openerAfsluiter: { keuze: 'herkenbaar', eigen: '' },
  doelen: { ...DEFAULT_DOELEN },
};

function mergeAfsluiter(raw) {
  const base = { ...DEFAULT_INSTELLINGEN.openerAfsluiter };
  if (!raw || typeof raw !== 'object') return base;
  if (typeof raw.keuze === 'string') base.keuze = raw.keuze;
  if (typeof raw.eigen === 'string') base.eigen = raw.eigen;
  return base;
}

function coerceGetal(waarde, fallback) {
  const n = Number(waarde);
  if (!Number.isFinite(n) || n < 0) return fallback;
  return Math.round(n);
}

function mergeDoelen(raw) {
  const base = { ...DEFAULT_DOELEN };
  if (!raw || typeof raw !== 'object') return base;
  for (const key of Object.keys(DEFAULT_DOELEN)) {
    base[key] = coerceGetal(raw[key], DEFAULT_DOELEN[key]);
  }
  return base;
}

export function loadInstellingen() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_INSTELLINGEN, doelen: { ...DEFAULT_DOELEN } };
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_INSTELLINGEN,
      ...parsed,
      openerAfsluiter: mergeAfsluiter(parsed.openerAfsluiter),
      doelen: mergeDoelen(parsed.doelen),
    };
  } catch {
    return { ...DEFAULT_INSTELLINGEN, doelen: { ...DEFAULT_DOELEN } };
  }
}

export function saveInstellingen(values) {
  try {
    const merged = {
      ...DEFAULT_INSTELLINGEN,
      ...values,
      openerAfsluiter: mergeAfsluiter(values.openerAfsluiter),
      doelen: mergeDoelen(values.doelen),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    return merged;
  } catch {
    return { ...DEFAULT_INSTELLINGEN, ...values, doelen: mergeDoelen(values.doelen) };
  }
}

export function getAfsluiterTekst(afsluiter) {
  const a = afsluiter || DEFAULT_INSTELLINGEN.openerAfsluiter;
  if (a.keuze === 'eigen') return (a.eigen || '').trim() || 'Herkenbaar?';
  const match = AFSLUITER_OPTIES.find((o) => o.key === a.keuze);
  return match ? match.label : 'Herkenbaar?';
}
