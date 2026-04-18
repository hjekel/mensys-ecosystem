import Papa from 'papaparse';
import { mapIndustryToSector } from '@shared/mappings.js';
import { CEO_FTE_CATEGORIES } from '@shared/constants.js';

const FIELD_ALIASES = {
  bedrijf: ['bedrijf', 'company', 'bedrijfsnaam', 'organisatie'],
  voornaam: ['voornaam', 'first name', 'firstname', 'first_name'],
  achternaam: ['achternaam', 'last name', 'lastname', 'last_name', 'surname'],
  functietitel: ['functietitel', 'functie', 'job title', 'jobtitle', 'job_title', 'title'],
  email: ['email', 'e-mail', 'email address', 'mail'],
  linkedin: ['linkedin', 'linkedin url', 'linkedinurl', 'linkedin_url', 'profile url'],
  fteCategorie: ['ftecategorie', 'fte categorie', 'fte_categorie', 'fte category', 'fte', 'ftecategory', 'fte_category', 'employee category'],
  sector: ['sector', 'industry', 'linkedin industry'],
  status: ['status', 'stage'],
  mensysFit: ['mensysfit', 'mensys fit', 'mensys_fit', 'fit'],
  bron: ['bron', 'source'],
  locatie: ['locatie', 'location', 'stad', 'regio', 'city', 'linkedin company location (hq)'],
  website: ['website', 'company website', 'corporate website', 'url', 'site'],
  keywords: ['keywords', 'keyword', 'tags'],
  notities: ['notities', 'notes', 'note', 'comment', 'commentaar'],
  country: ['country', 'land', 'company country'],
};

function normKey(k) {
  return String(k ?? '').replace(/^\uFEFF/, '').toLowerCase().trim();
}

function pickValue(row, key) {
  const aliases = FIELD_ALIASES[key] || [key.toLowerCase()];
  const aliasSet = new Set(aliases.map((a) => String(a).toLowerCase().trim()));
  for (const [k, v] of Object.entries(row)) {
    if (aliasSet.has(normKey(k))) {
      const s = String(v ?? '').trim();
      if (s !== '') return s;
    }
  }
  return '';
}

function mapFteToCeo(value) {
  if (!value) return '1-10';
  const v = String(value).trim().toLowerCase();
  if (v === '1-10' || v === '11-50') return v;
  if (v.includes('11') && v.includes('50')) return '11-50';
  if (v.includes('1-10') || v.includes('1 tot 10')) return '1-10';
  if (v.includes('small') || v.includes('micro')) return '1-10';
  return '1-10';
}

function normaliseEnum(value, allowed, fallback) {
  if (!value) return fallback;
  const v = String(value).toLowerCase().trim();
  const hit = allowed.find((a) => String(a).toLowerCase() === v);
  return hit || fallback;
}

const CEO_STATUSES = ['Nieuw', 'Warm', 'Benaderd', 'Gesprek gevoerd', 'Klant'];
const MENSYS_FIT_SCORES = ['Hoog', 'Midden', 'Onderzoeken', 'Onbekend'];

export function rowsToCeos(rows) {
  const result = [];
  if (rows && rows.length > 0) {
    try {
      console.log('[ceoCsv] rowsToCeos ontvangen:', rows.length, 'rijen');
      console.log('[ceoCsv] keys eerste rij:', Object.keys(rows[0]).map(normKey));
      console.log('[ceoCsv] eerste rij:', rows[0]);
    } catch {
      // ignore log failures
    }
  }
  for (const row of rows) {
    const bedrijf = pickValue(row, 'bedrijf');
    const voornaam = pickValue(row, 'voornaam');
    const achternaam = pickValue(row, 'achternaam');
    if (!bedrijf && !voornaam && !achternaam) continue;

    const sectorRaw = pickValue(row, 'sector');
    const knownSectors = new Set(['Zorg', 'Overheid', 'Maakindustrie', 'Tech/ICT', 'Bouw/Techniek', 'Finance', 'Onderwijs', 'Overig']);
    const sector = knownSectors.has(sectorRaw)
      ? sectorRaw
      : (sectorRaw ? mapIndustryToSector(sectorRaw) : 'Overig');
    const rawFte = pickValue(row, 'fteCategorie');
    const rawStatus = pickValue(row, 'status');
    const rawFit = pickValue(row, 'mensysFit');

    result.push({
      firstName: voornaam,
      lastName: achternaam,
      jobTitle: pickValue(row, 'functietitel'),
      company: bedrijf,
      sector,
      fteCategory: mapFteToCeo(rawFte),
      linkedinUrl: pickValue(row, 'linkedin'),
      email: pickValue(row, 'email'),
      phone: '',
      status: normaliseEnum(rawStatus, CEO_STATUSES, 'Nieuw'),
      priority: 'Middel',
      mensysFit: normaliseEnum(rawFit, MENSYS_FIT_SCORES, 'Hoog'),
      notes: pickValue(row, 'notities'),
      country: pickValue(row, 'country'),
      location: pickValue(row, 'locatie'),
      companyWebsite: pickValue(row, 'website'),
      source: pickValue(row, 'bron'),
      keywords: pickValue(row, 'keywords'),
    });
  }
  try {
    console.log('[ceoCsv] rowsToCeos resultaat:', result.length, 'records.', result[0] ? 'Eerste:' : '', result[0] || '');
  } catch {
    // ignore
  }
  return result;
}

export function ceosToCsv(ceos) {
  const fields = [
    'company',
    'firstName',
    'lastName',
    'jobTitle',
    'email',
    'linkedinUrl',
    'fteCategory',
    'sector',
    'status',
    'mensysFit',
    'source',
    'location',
    'companyWebsite',
    'keywords',
    'notes',
    'createdAt',
    'updatedAt',
  ];
  const header = [
    'bedrijf',
    'voornaam',
    'achternaam',
    'functietitel',
    'email',
    'linkedin',
    'fteCategorie',
    'sector',
    'status',
    'mensysFit',
    'bron',
    'locatie',
    'website',
    'keywords',
    'notities',
    'aangemaakt',
    'bijgewerkt',
  ];
  const data = ceos.map((c) => fields.map((f) => c[f] ?? ''));
  return Papa.unparse({ fields: header, data });
}

export const CEO_VALID_FTES = CEO_FTE_CATEGORIES;
