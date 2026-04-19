// Distributeurs: software-distributeurs die Mensys inzet. Seed met de
// vijf die al op de Ecosysteem-tab staan. localStorage-only store,
// zelfde patroon als concurrentenStore.

const STORAGE_KEY = 'mensys_distributeurs';

const SEED = [
  {
    id: 'd-also',
    naam: 'ALSO',
    logo_url: '',
    website: 'https://www.also.com',
    hq: 'Straubenhardt (DE)',
    type: 'distributeur',
    relatie_status: 'onderzocht',
    account_manager_naam: '',
    account_manager_email: '',
    account_manager_telefoon: '',
    portal_url: '',
    vendors_via_deze_distributeur: [],
    laatste_contact: '',
    notities: 'Grote Duitse distributeur met NL-vestiging. Breed software- en hardware-portfolio.',
  },
  {
    id: 'd-copaco',
    naam: 'Copaco',
    logo_url: '',
    website: 'https://www.copaco.com',
    hq: 'Eindhoven',
    type: 'distributeur',
    relatie_status: 'onderzocht',
    account_manager_naam: '',
    account_manager_email: '',
    account_manager_telefoon: '',
    portal_url: '',
    vendors_via_deze_distributeur: [],
    laatste_contact: '',
    notities: 'Nederlandse distributeur, gevestigd in Eindhoven. Sterke Benelux-dekking.',
  },
  {
    id: 'd-ingram',
    naam: 'Ingram Micro',
    logo_url: '',
    website: 'https://nl.ingrammicro.com',
    hq: 'Utrecht',
    type: 'distributeur',
    relatie_status: 'onderzocht',
    account_manager_naam: '',
    account_manager_email: '',
    account_manager_telefoon: '',
    portal_url: '',
    vendors_via_deze_distributeur: [],
    laatste_contact: '',
    notities: 'Globale distributeur met stevige NL-vestiging in Utrecht. Veel cloud- en AI-vendoren via hun portfolio.',
  },
  {
    id: 'd-tdsynnex',
    naam: 'TD SYNNEX',
    logo_url: '',
    website: 'https://www.tdsynnex.com',
    hq: 'Utrecht',
    type: 'distributeur',
    relatie_status: 'onderzocht',
    account_manager_naam: '',
    account_manager_email: '',
    account_manager_telefoon: '',
    portal_url: '',
    vendors_via_deze_distributeur: [],
    laatste_contact: '',
    notities: 'Fusie van Tech Data en SYNNEX. Breed portfolio, gekend sterk bij enterprise software.',
  },
  {
    id: 'd-dsd',
    naam: 'DSD Europe',
    logo_url: '',
    website: 'https://www.dsdeurope.com',
    hq: 'Zoetermeer',
    type: 'distributeur',
    relatie_status: 'onderzocht',
    account_manager_naam: '',
    account_manager_email: '',
    account_manager_telefoon: '',
    portal_url: '',
    vendors_via_deze_distributeur: [],
    laatste_contact: '',
    notities: 'Software-distributeur met oorsprong in security. Sinds 2021 is dochter CloudLand onderdeel van Enreach.',
  },
];

const SEED_BY_ID = new Map(SEED.map((d) => [d.id, d]));

export function getDistributeurs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveDistributeurs(SEED);
      return [...SEED];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [...SEED];
    // Merge nieuwe seed-records erbij als ze ontbreken
    const byId = new Map(parsed.map((d) => [d.id, d]));
    let changed = false;
    for (const seed of SEED) {
      if (!byId.has(seed.id)) {
        byId.set(seed.id, seed);
        changed = true;
      }
    }
    const out = [...byId.values()];
    if (changed) saveDistributeurs(out);
    return out;
  } catch {
    return [...SEED];
  }
}

export function saveDistributeurs(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return true;
  } catch {
    return false;
  }
}

export function updateDistributeur(existing, id, values) {
  const nowIso = new Date().toISOString();
  return existing.map((d) => (d.id === id ? { ...d, ...values, gewijzigd: nowIso } : d));
}

export function getDistributeurById(id) {
  const list = getDistributeurs();
  return list.find((d) => d.id === id) || null;
}

export function getDistributeurByNaam(naam) {
  if (!naam) return null;
  const list = getDistributeurs();
  const lower = String(naam).toLowerCase();
  return list.find((d) => String(d.naam).toLowerCase() === lower) || null;
}
