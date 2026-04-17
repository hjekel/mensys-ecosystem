import Papa from 'papaparse';
import {
  RESELLER_CSV_COLUMNS,
  RESELLER_STATUSES,
  RESELLER_TYPES,
  RESELLER_FTE_RANGES,
  MENSYS_FIT_SCORES,
} from '@shared/constants.js';

function pickValue(row, key) {
  const direct = row[key];
  if (direct !== undefined && direct !== null && String(direct).trim() !== '') {
    return String(direct).trim();
  }
  const lowerKey = key.toLowerCase();
  for (const [k, v] of Object.entries(row)) {
    if (String(k).toLowerCase().trim() === lowerKey) {
      return String(v ?? '').trim();
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
