// Configureerbare gewichten voor de YALC Low Hanging Fruit scoring
// van inkopers. De defaults komen overeen met de oorspronkelijke
// hardcoded waarden in lhf.js.

const STORAGE_KEY = 'mensys_yalc_gewichten';

export const DEFAULT_GEWICHTEN = {
  email: 20,
  linkedin: 20,
  status: 20,
  fte: 15,
  sector: 15,
  prioriteit: 10,
};

export const GEWICHT_LABELS = {
  email: 'E-mailadres aanwezig',
  linkedin: 'LinkedIn URL aanwezig',
  status: 'Status Warm of Gesprek gevoerd',
  fte: 'FTE 201+ (Mensys-doelgroep)',
  sector: 'Sector in Zorg, Overheid, Maakindustrie, Tech of Onderwijs',
  prioriteit: 'Prioriteit Hoog',
};

export const GEWICHT_UITLEG = {
  email: 'Punten als het contact een e-mailadres heeft. Zonder e-mail val je terug op alleen LinkedIn DM.',
  linkedin: 'Punten als er een LinkedIn profiel-URL beschikbaar is voor directe DM-outreach.',
  status: 'Punten als de status al op Warm of Gesprek gevoerd staat: het contact is al actief in de pipeline.',
  fte: 'Punten als het bedrijf minimaal 201 FTE heeft. Mensys richt zich op organisaties met 150+ FTE.',
  sector: 'Punten als de sector een Mensys-prioriteit is: Zorg, Overheid, Maakindustrie, Tech/ICT of Onderwijs.',
  prioriteit: 'Punten als de prioriteit handmatig op Hoog is gezet in het contactkaartje.',
};

export const GEWICHT_KEYS = ['email', 'linkedin', 'status', 'fte', 'sector', 'prioriteit'];

export function getGewichten() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_GEWICHTEN };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_GEWICHTEN, ...parsed };
  } catch {
    return { ...DEFAULT_GEWICHTEN };
  }
}

export function saveGewichten(values) {
  const merged = { ...DEFAULT_GEWICHTEN };
  for (const key of GEWICHT_KEYS) {
    if (values[key] !== undefined) {
      const n = Number(values[key]);
      merged[key] = Number.isFinite(n) ? Math.max(0, Math.min(30, Math.round(n))) : DEFAULT_GEWICHTEN[key];
    }
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch {
    // ignore
  }
  return merged;
}

export function resetGewichten() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  return { ...DEFAULT_GEWICHTEN };
}

export function totaalGewichten(values) {
  return GEWICHT_KEYS.reduce((sum, k) => sum + (Number(values[k]) || 0), 0);
}
