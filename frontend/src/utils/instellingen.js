// Configureerbare instellingen voor de app. Maakt de UI herbruikbaar
// voor andere proposities door bedrijfsnaam, tagline, gebruiker en
// hoofdkleur los te koppelen van de code.

const STORAGE_KEY = 'mensys_instellingen';

export const DEFAULT_INSTELLINGEN = {
  bedrijfsnaam: 'Mensys',
  propositie: 'Eén factuur, geen creditcard. Figma, Miro, ChatGPT Teams, Claude, Copilot, Canva: gewoon via ons geregeld.',
  gebruikersnaam: '',
  logoKleur: '#003087',
};

export function loadInstellingen() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_INSTELLINGEN };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_INSTELLINGEN, ...parsed };
  } catch {
    return { ...DEFAULT_INSTELLINGEN };
  }
}

export function saveInstellingen(values) {
  try {
    const merged = { ...DEFAULT_INSTELLINGEN, ...values };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    return merged;
  } catch {
    return { ...DEFAULT_INSTELLINGEN, ...values };
  }
}
