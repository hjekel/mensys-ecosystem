import Papa from 'papaparse';
import {
  RESELLER_CSV_COLUMNS,
  RESELLER_STATUSES,
  RESELLER_TYPES,
  RESELLER_FTE_RANGES,
  MENSYS_FIT_SCORES,
} from '@shared/constants.js';

const FIELD_ALIASES = {
  bedrijf: ['bedrijf', 'company', 'bedrijfsnaam', 'organisatie', 'reseller'],
  voornaam: ['voornaam', 'first name', 'firstname', 'first_name'],
  achternaam: ['achternaam', 'last name', 'lastname', 'last_name', 'surname'],
  functietitel: ['functietitel', 'functie', 'job title', 'jobtitle', 'job_title', 'title'],
  email: ['email', 'e-mail', 'email address', 'mail'],
  linkedin: ['linkedin', 'linkedin url', 'linkedinurl', 'linkedin_url', 'profile url', 'li url'],
  fteRange: ['fterange', 'fte range', 'fte', 'fte_range', 'employees'],
  resellerType: ['resellertype', 'reseller type', 'reseller_type', 'type'],
  mensysFit: ['mensysfit', 'mensys fit', 'mensys_fit', 'fit', 'fit_score'],
  bron: ['bron', 'source'],
  locatie: ['locatie', 'location', 'stad', 'regio', 'city'],
  website: ['website', 'url', 'site', 'company website'],
  status: ['status', 'stage'],
  keywords: ['keywords', 'keyword', 'tags'],
  notities: ['notities', 'notes', 'note', 'comment', 'commentaar'],
};

function pickValue(row, key) {
  const aliases = FIELD_ALIASES[key] || [key.toLowerCase()];
  const aliasSet = new Set(aliases.map((a) => a.toLowerCase().trim()));
  for (const [k, v] of Object.entries(row)) {
    if (aliasSet.has(String(k).toLowerCase().trim())) {
      const str = String(v ?? '').trim();
      if (str !== '') return str;
    }
  }
  return '';
}

function normaliseEnum(value, allowed, fallback) {
  if (!value) return fallback;
  const hit = allowed.find((a) => a.toLowerCase() === value.toLowerCase().trim());
  return hit || fallback;
}

export function rowsToResellers(rows) {
  const result = [];
  for (const row of rows) {
    const bedrijf = pickValue(row, RESELLER_CSV_COLUMNS.bedrijf);
    const voornaam = pickValue(row, RESELLER_CSV_COLUMNS.voornaam);
    const achternaam = pickValue(row, RESELLER_CSV_COLUMNS.achternaam);
    if (!bedrijf && !voornaam && !achternaam) continue;

    const rawStatus = pickValue(row, RESELLER_CSV_COLUMNS.status);
    const rawType = pickValue(row, RESELLER_CSV_COLUMNS.resellerType);
    const rawFit = pickValue(row, RESELLER_CSV_COLUMNS.mensysFit);
    const rawFte = pickValue(row, RESELLER_CSV_COLUMNS.fteRange);

    result.push({
      bedrijf,
      voornaam,
      achternaam,
      functietitel: pickValue(row, RESELLER_CSV_COLUMNS.functietitel),
      email: pickValue(row, RESELLER_CSV_COLUMNS.email),
      linkedin: pickValue(row, RESELLER_CSV_COLUMNS.linkedin),
      fteRange: normaliseEnum(rawFte, RESELLER_FTE_RANGES, rawFte),
      resellerType: normaliseEnum(rawType, RESELLER_TYPES, 'Nader te bepalen'),
      mensysFit: normaliseEnum(rawFit, MENSYS_FIT_SCORES, 'Onbekend'),
      bron: pickValue(row, RESELLER_CSV_COLUMNS.bron),
      locatie: pickValue(row, RESELLER_CSV_COLUMNS.locatie),
      website: pickValue(row, RESELLER_CSV_COLUMNS.website),
      status: normaliseEnum(rawStatus, RESELLER_STATUSES, 'Nieuw'),
      keywords: pickValue(row, RESELLER_CSV_COLUMNS.keywords).slice(0, 200),
      notities: pickValue(row, RESELLER_CSV_COLUMNS.notities),
    });
  }
  return result;
}

export function resellersToCsv(resellers) {
  const fields = [
    'bedrijf',
    'voornaam',
    'achternaam',
    'functietitel',
    'email',
    'linkedin',
    'fteRange',
    'resellerType',
    'mensysFit',
    'bron',
    'locatie',
    'website',
    'status',
    'keywords',
    'notities',
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
    'fteRange',
    'resellerType',
    'mensysFit',
    'bron',
    'locatie',
    'website',
    'status',
    'keywords',
    'notities',
    'aangemaakt',
    'bijgewerkt',
  ];
  const data = resellers.map((r) => fields.map((f) => r[f] ?? ''));
  return Papa.unparse({ fields: header, data });
}
