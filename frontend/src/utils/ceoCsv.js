import Papa from 'papaparse';
import { mapIndustryToSector, CSV_COLUMNS } from '@shared/mappings.js';
import { CEO_FTE_CATEGORIES } from '@shared/constants.js';

function pickRaw(row, key) {
  const direct = row[key];
  if (direct !== undefined && direct !== null && String(direct).trim() !== '') {
    return String(direct).trim();
  }
  const lowerKey = String(key).toLowerCase();
  for (const [k, v] of Object.entries(row)) {
    if (String(k).toLowerCase().trim() === lowerKey) {
      const s = String(v ?? '').trim();
      if (s !== '') return s;
    }
  }
  return '';
}

function mapFteToCeo(value) {
  if (!value) return '1-10';
  const v = String(value).trim().toLowerCase();
  if (v.includes('11') || v.includes('50')) return '11-50';
  if (v.includes('10') || v.includes('1-')) return '1-10';
  return '1-10';
}

export function rowsToCeos(rows) {
  const result = [];
  for (const row of rows) {
    const firstName = pickRaw(row, CSV_COLUMNS.firstName);
    const lastName = pickRaw(row, CSV_COLUMNS.lastName);
    const company = pickRaw(row, CSV_COLUMNS.company);
    if (!firstName && !lastName && !company) continue;

    const industry = pickRaw(row, CSV_COLUMNS.linkedinIndustry);
    const employeeCategory = pickRaw(row, CSV_COLUMNS.employeeCategory);

    result.push({
      firstName,
      lastName,
      jobTitle: pickRaw(row, CSV_COLUMNS.jobTitle),
      company,
      sector: mapIndustryToSector(industry),
      fteCategory: mapFteToCeo(employeeCategory),
      linkedinUrl: pickRaw(row, CSV_COLUMNS.linkedinUrl),
      email: pickRaw(row, CSV_COLUMNS.email),
      phone: '',
      status: 'Nieuw',
      priority: 'Middel',
      mensysFit: 'Hoog',
      notes: '',
      country: pickRaw(row, CSV_COLUMNS.country) || pickRaw(row, CSV_COLUMNS.companyCountry),
      location: pickRaw(row, CSV_COLUMNS.location) || pickRaw(row, CSV_COLUMNS.linkedinCompanyLocation),
      companyWebsite: pickRaw(row, CSV_COLUMNS.corporateWebsite),
      source: pickRaw(row, CSV_COLUMNS.source),
    });
  }
  return result;
}

export function ceosToCsv(ceos) {
  const fields = [
    'firstName',
    'lastName',
    'jobTitle',
    'company',
    'sector',
    'fteCategory',
    'linkedinUrl',
    'email',
    'phone',
    'status',
    'priority',
    'mensysFit',
    'country',
    'location',
    'companyWebsite',
    'notes',
    'createdAt',
    'updatedAt',
  ];
  const header = [
    'Voornaam',
    'Achternaam',
    'Functietitel',
    'Bedrijf',
    'Sector',
    'FTE',
    'LinkedIn URL',
    'Email',
    'Telefoon',
    'Status',
    'Prioriteit',
    'MensysFit',
    'Land',
    'Locatie',
    'Website',
    'Notities',
    'Aangemaakt',
    'Bijgewerkt',
  ];
  const data = ceos.map((c) => fields.map((f) => c[f] ?? ''));
  return Papa.unparse({ fields: header, data });
}

export const CEO_VALID_FTES = CEO_FTE_CATEGORIES;
