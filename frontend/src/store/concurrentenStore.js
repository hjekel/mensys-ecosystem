import { generateId } from '../utils/storage.js';

const STORAGE_KEY = 'mensys_concurrenten';

const SEED = [
  {
    id: 'c1',
    naam: 'Actendo',
    website: 'actendo.com',
    linkedinUrl: '',
    hq: 'Haarlem',
    scope: 'NL',
    categorie: 'Directe concurrent',
    propositie: 'Merkonafhankelijk softwareleverancier en licentiespecialist. Ook software exoten. Tweedehands Microsoft licenties als extra propositie.',
    sterktes: ['Zelfde stad als Mensys', 'Ook exoten-focus', 'Gecertificeerd bij A-merk fabrikanten', 'Tweedehands licenties als goedkope optie'],
    zwaktes: ['Geen ChatGPT Teams / Claude / AI-tools focus', 'Website voelt B2B-oud', 'Minder persoonlijk dan Mensys volgens reviews', 'Tweedehands positionering roept compliance-vragen op'],
    klantsegment: 'Bedrijven, overheden, non-profit. Breed, niet specifiek MKB of exoten-first.',
    coopetitie: false,
    coopetitieIdee: '',
    notities: 'Directeur: Martin Nagtegaal. Omzet circa 2M USD. Frankestraat 40A Haarlem. Letterlijk om de hoek.',
  },
  {
    id: 'c2',
    naam: 'CloudLand (Enreach)',
    website: 'cloudland.store',
    linkedinUrl: '',
    hq: 'Zoetermeer',
    scope: 'Benelux',
    categorie: 'Coopetitie-kans',
    propositie: 'Software distributor voor resellers en MSPs in de Benelux. Platform met brede portfolio. Geen minimale afname. Automatisering van verlengingen.',
    sterktes: ['Platform voor resellers', 'Benelux-dekking', 'MAXQDA partner (overlap Mensys)', 'Deel van Enreach (telecom en IT)'],
    zwaktes: ['Niet direct aan eindklanten', 'Geen AI-tools (ChatGPT/Claude) focus', 'Reseller-only model, niet voor inkopers'],
    klantsegment: 'IT-resellers en MSPs in Benelux. Niet eindklanten direct.',
    coopetitie: true,
    coopetitieIdee: 'CloudLand bedient resellers, Mensys bedient eindklanten. Mensys kan CloudLand-resellers versterken met exoten die CloudLand niet heeft. Win-win zonder directe overlap.',
    notities: 'Voormalig DSD Europe dochter. Menso noemde dit als concurrent. Ex-Portland mensen volgens Menso.',
  },
  {
    id: 'c3',
    naam: 'Protinus IT',
    website: 'protinus.nl',
    linkedinUrl: '',
    hq: 'Amersfoort',
    scope: 'NL',
    categorie: 'Overheid-specialist',
    propositie: 'Software sourcing voor overheid en grote instellingen. Raamcontracten, aanbestedingen, 300+ vendoren.',
    sterktes: ['Dominant in overheid', 'Raamcontracten Politie, Justitie, Gemeenten', 'Breed vendor-netwerk'],
    zwaktes: ['Geen MKB-focus', 'Minimumomvang contracten', 'Niet geschikt voor 2-seats Figma', 'Trage procedures'],
    klantsegment: 'Rijksoverheid, gemeenten, politie, grote instellingen. Niet relevant voor Mensys sweet spot.',
    coopetitie: false,
    coopetitieIdee: '',
    notities: 'Domineert overheid volledig. Mensys vult gaten die Protinus laat liggen: MKB en exoten onder de aanbestedingsdrempel.',
  },
  {
    id: 'c4',
    naam: 'Centralpoint',
    website: 'centralpoint.nl',
    linkedinUrl: '',
    hq: 'Nijmegen',
    scope: 'NL',
    categorie: 'Directe concurrent',
    propositie: 'Breed IT-portfolio: hardware, software, licenties. Zowel MKB als enterprise. Webshop-gedreven.',
    sterktes: ['Grote naam', 'Breed portfolio', 'Snelle levering', 'Webshop met veel SKUs'],
    zwaktes: ['Generalist, geen exoten-focus', 'Weinig persoonlijk contact', 'Minder sterk in niche AI-tools', 'Creditcard en euro beide'],
    klantsegment: 'Breed: MKB tot enterprise. Hardware-gedreven.',
    coopetitie: false,
    coopetitieIdee: '',
    notities: 'Staat in aanbestedingen naast Protinus. Geen directe exoten-focus.',
  },
  {
    id: 'c5',
    naam: 'Scholten Awater',
    website: 'scholtenawater.com',
    linkedinUrl: '',
    hq: 'Amersfoort',
    scope: 'NL',
    categorie: 'Directe concurrent',
    propositie: 'Software licenties en IT-diensten. Microsoft-focus. Breed reseller-netwerk.',
    sterktes: ['Microsoft expertise', 'Groot reseller-netwerk', 'SAM-diensten'],
    zwaktes: ['Microsoft-dominant, minder sterk in exoten', 'Enterprise-first pricing', 'Geen duidelijke MKB-propositie'],
    klantsegment: 'MKB tot enterprise. Microsoft-heavy organisaties.',
    coopetitie: false,
    coopetitieIdee: '',
    notities: 'Staat regelmatig naast Protinus en Comparex in aanbestedingen.',
  },
  {
    id: 'c6',
    naam: 'SoftwareOne',
    website: 'softwareone.com',
    linkedinUrl: '',
    hq: 'Zug (CH) / NL-kantoor',
    scope: 'Internationaal',
    categorie: 'Enterprise',
    propositie: 'Global software lifecycle management. SAM, cloud, licentieoptimalisatie voor enterprise.',
    sterktes: ['Wereldwijde dekking', 'SAM en compliance expertise', 'Grote vendor-relaties'],
    zwaktes: ['Niet interessant voor MKB', 'Geen 2-seats leveringen', 'Hoge minimumcontracten', 'Geen persoonlijk MKB-contact'],
    klantsegment: 'Enterprise, 500+ FTE, internationaal actief.',
    coopetitie: false,
    coopetitieIdee: '',
    notities: 'Domineert enterprise samen met Crayon. Mensys vult gaten die zij laten liggen.',
  },
  {
    id: 'c7',
    naam: 'Crayon',
    website: 'crayon.com',
    linkedinUrl: '',
    hq: 'Oslo (NO) / NL-kantoor',
    scope: 'Europa',
    categorie: 'Enterprise',
    propositie: 'Cloud en software licensing optimalisatie. Microsoft, AWS, Google Cloud. Enterprise-focus.',
    sterktes: ['Cloud-expertise', 'Microsoft Gold Partner', 'Internationaal netwerk'],
    zwaktes: ['Niet voor MKB', 'Geen niche AI-tools', 'Hoge drempel'],
    klantsegment: 'Enterprise 200+ FTE, cloud-first organisaties.',
    coopetitie: true,
    coopetitieIdee: 'Crayon bedient enterprise die Mensys niet kan bedienen. Crayon-klanten hebben ook dochters of partners in MKB-segment. Potentieel voor referrals.',
    notities: 'Winnaar aanbesteding Politie samen met Protinus en SoftwareOne.',
  },
  {
    id: 'c8',
    naam: 'Comparex (NTT Data)',
    website: 'comparex.nl',
    linkedinUrl: '',
    hq: 'Utrecht',
    scope: 'Europa',
    categorie: 'Enterprise',
    propositie: 'Software asset management en licentie-inkoop voor grote organisaties. Onderdeel van NTT Data.',
    sterktes: ['Overheid-contracten', 'SAM-expertise', 'NTT Data-backing'],
    zwaktes: ['Te groot voor MKB', 'Bureaucratisch', 'Geen exoten'],
    klantsegment: 'Overheid, enterprise 500+ FTE.',
    coopetitie: false,
    coopetitieIdee: '',
    notities: 'Herhaaldelijk naast Protinus in aanbestedingen. Niet relevant als directe concurrent voor Mensys sweet spot.',
  },
  {
    id: 'c9',
    naam: 'Schogo Software',
    website: 'schogo.nl',
    linkedinUrl: '',
    hq: 'Online (NL)',
    scope: 'NL',
    categorie: 'Online/prijsvechter',
    propositie: 'Lage prijzen, brede catalogus, zelfbediening. Geen persoonlijk contact.',
    sterktes: ['Lage prijs', 'Breed aanbod', 'Snel online'],
    zwaktes: ['Geen persoonlijk contact', 'Geen factuur op bedrijfsnaam altijd', 'Geen exoten-expertise', 'Geen reseller-support'],
    klantsegment: 'Prijsbewuste klanten die zelf weten wat ze willen.',
    coopetitie: false,
    coopetitieIdee: '',
    notities: 'Prijsvechter onderaan. Mensys competeert hier niet op prijs maar op service en exoten.',
  },
  {
    id: 'c10',
    naam: 'Vendor-direct (OpenAI, Canva, Figma etc.)',
    website: '',
    linkedinUrl: '',
    hq: 'VS / internationaal',
    scope: 'Internationaal',
    categorie: 'Online/prijsvechter',
    propositie: 'Klant koopt rechtstreeks bij de vendor. USD, creditcard, consumentenproces.',
    sterktes: ['Laagste prijs soms', 'Direct bij de bron'],
    zwaktes: ['USD', 'Creditcard verplicht', 'Geen zakelijke factuur NL', 'Geen Nederlands contact', 'Minimumafname bij enterprise-tiers', 'Geen ondersteuning'],
    klantsegment: 'Iedereen die het zelf probeert te regelen. Dit is de situatie die Mensys oplost.',
    coopetitie: false,
    coopetitieIdee: '',
    notities: 'Dit is niet echt een concurrent maar de status quo die Mensys vervangt. Goed om hier expliciet in te benoemen.',
  },
];

export const CONCURRENT_CATEGORIEEN = [
  'Directe concurrent',
  'Overheid-specialist',
  'Enterprise',
  'Distributeur',
  'Online/prijsvechter',
  'Coopetitie-kans',
];

export const CONCURRENT_SCOPES = ['NL', 'Benelux', 'Europa', 'Internationaal'];

export function getConcurrenten() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveConcurrenten(SEED);
      return [...SEED];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [...SEED];
  } catch {
    return [...SEED];
  }
}

export function saveConcurrenten(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    return true;
  } catch {
    return false;
  }
}

export function addConcurrent(existing, values) {
  const nowIso = new Date().toISOString();
  const record = {
    id: generateId(),
    naam: '',
    website: '',
    linkedinUrl: '',
    hq: '',
    scope: 'NL',
    categorie: 'Directe concurrent',
    propositie: '',
    sterktes: [],
    zwaktes: [],
    klantsegment: '',
    coopetitie: false,
    coopetitieIdee: '',
    notities: '',
    ...values,
    createdAt: nowIso,
    updatedAt: nowIso,
  };
  return [record, ...existing];
}

export function updateConcurrent(existing, id, values) {
  const nowIso = new Date().toISOString();
  return existing.map((c) => (c.id === id ? { ...c, ...values, updatedAt: nowIso } : c));
}

export function deleteConcurrent(existing, id) {
  return existing.filter((c) => c.id !== id);
}
