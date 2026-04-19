// Helpers en constanten voor de activiteiten-log UI.

export const ACTIVITEIT_TYPES = [
  'linkedin_connectie',
  'linkedin_geaccepteerd',
  'linkedin_bericht',
  'linkedin_reactie',
  'email_uitgaand',
  'email_inkomend',
  'telefoon',
  'meeting',
  'notitie',
  'status_wijziging',
];

export const TYPE_LABELS = {
  linkedin_connectie: 'Connectieverzoek verstuurd',
  linkedin_geaccepteerd: 'Connectie geaccepteerd',
  linkedin_bericht: 'LinkedIn DM verstuurd',
  linkedin_reactie: 'LinkedIn reactie ontvangen',
  email_uitgaand: 'E-mail verstuurd',
  email_inkomend: 'E-mail ontvangen',
  telefoon: 'Telefoongesprek',
  meeting: 'Meeting (fysiek of online)',
  notitie: 'Vrije notitie',
  status_wijziging: 'Status veranderd',
};

export const RICHTINGEN = ['uitgaand', 'inkomend', 'intern'];

export const RICHTING_LABELS = {
  uitgaand: 'Uitgaand',
  inkomend: 'Inkomend',
  intern: 'Intern',
};

export const RICHTING_COLORS = {
  uitgaand: '#003087',
  inkomend: '#00a878',
  intern: '#5c6a85',
};

export const STANDAARD_UITVOERDERS = ['Henk', 'Thomas', 'Menso'];

export function defaultUitvoerder() {
  try {
    const raw = localStorage.getItem('mensys_instellingen');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.gebruikersnaam) return parsed.gebruikersnaam;
    }
  } catch {
    // ignore
  }
  return 'Henk';
}

export function relatieveDatum(iso) {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const now = Date.now();
  const diff = now - then;
  if (diff < 0) {
    const future = Math.abs(diff);
    const min = Math.round(future / 60000);
    if (min < 60) return `over ${min} min`;
    const uur = Math.round(min / 60);
    if (uur < 24) return `over ${uur} uur`;
    const dag = Math.round(uur / 24);
    return `over ${dag} dag${dag === 1 ? '' : 'en'}`;
  }
  const min = Math.round(diff / 60000);
  if (min < 1) return 'zojuist';
  if (min < 60) return `${min} min geleden`;
  const uur = Math.round(min / 60);
  if (uur < 24) {
    const nuDag = new Date(now).setHours(0, 0, 0, 0);
    const thenDag = new Date(then).setHours(0, 0, 0, 0);
    if (nuDag === thenDag) return 'vandaag';
    if (nuDag - thenDag === 24 * 60 * 60 * 1000) return 'gisteren';
    return `${uur} uur geleden`;
  }
  const dag = Math.round(uur / 24);
  if (dag === 1) return 'gisteren';
  if (dag < 14) return `${dag} dagen geleden`;
  const weken = Math.round(dag / 7);
  if (weken < 9) return `${weken} weken geleden`;
  const maand = Math.round(dag / 30);
  if (maand < 12) return `${maand} maand${maand === 1 ? '' : 'en'} geleden`;
  const jaar = Math.round(dag / 365);
  return `${jaar} jaar${jaar === 1 ? '' : ''} geleden`;
}

export function daysAgo(iso) {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  const ms = Date.now() - t;
  return Math.floor(ms / (24 * 60 * 60 * 1000));
}

// TypeIcon staat in components/ActiviteitenLog/TypeIcon.jsx
// (JSX kan niet in .js bij Vite + plugin-react).
