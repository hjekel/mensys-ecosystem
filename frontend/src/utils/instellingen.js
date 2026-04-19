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

export const DEFAULT_INSTELLINGEN = {
  bedrijfsnaam: 'Mensys',
  propositie: 'Eén factuur, geen creditcard. Figma, Miro, ChatGPT Teams, Claude, Copilot, Canva: gewoon via ons geregeld.',
  gebruikersnaam: '',
  logoKleur: '#003087',
  openerAfsluiter: { keuze: 'herkenbaar', eigen: '' },
};

function mergeAfsluiter(raw) {
  const base = { ...DEFAULT_INSTELLINGEN.openerAfsluiter };
  if (!raw || typeof raw !== 'object') return base;
  if (typeof raw.keuze === 'string') base.keuze = raw.keuze;
  if (typeof raw.eigen === 'string') base.eigen = raw.eigen;
  return base;
}

export function loadInstellingen() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_INSTELLINGEN };
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_INSTELLINGEN,
      ...parsed,
      openerAfsluiter: mergeAfsluiter(parsed.openerAfsluiter),
    };
  } catch {
    return { ...DEFAULT_INSTELLINGEN };
  }
}

export function saveInstellingen(values) {
  try {
    const merged = {
      ...DEFAULT_INSTELLINGEN,
      ...values,
      openerAfsluiter: mergeAfsluiter(values.openerAfsluiter),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    return merged;
  } catch {
    return { ...DEFAULT_INSTELLINGEN, ...values };
  }
}

export function getAfsluiterTekst(afsluiter) {
  const a = afsluiter || DEFAULT_INSTELLINGEN.openerAfsluiter;
  if (a.keuze === 'eigen') return (a.eigen || '').trim() || 'Herkenbaar?';
  const match = AFSLUITER_OPTIES.find((o) => o.key === a.keuze);
  return match ? match.label : 'Herkenbaar?';
}
