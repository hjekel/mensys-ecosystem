import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { mapIndustryToSector, mapEmployeeCategoryToFte, CSV_COLUMNS } from '@shared/mappings.js';
import { generateId } from './storage.js';

export async function parseFile(file) {
  const name = (file.name || '').toLowerCase();
  if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
    return parseExcel(file);
  }
  return parseCsv(file);
}

async function parseCsv(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve({
          headers: results.meta.fields || [],
          rows: results.data || [],
        });
      },
      error: (err) => reject(err),
    });
  });
}

async function parseExcel(file) {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array' });
  const sheetName = wb.SheetNames[0];
  const sheet = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
  return { headers, rows };
}

export function rowsToContacts(rows) {
  const nowIso = new Date().toISOString();
  const contacts = [];

  for (const row of rows) {
    const firstName = String(row[CSV_COLUMNS.firstName] || '').trim();
    const lastName = String(row[CSV_COLUMNS.lastName] || '').trim();
    const company = String(row[CSV_COLUMNS.company] || '').trim();

    if (!firstName && !lastName && !company) continue;

    const industry = row[CSV_COLUMNS.linkedinIndustry];
    const employeeCategory = row[CSV_COLUMNS.employeeCategory];

    contacts.push({
      id: generateId(),
      firstName,
      lastName,
      jobTitle: String(row[CSV_COLUMNS.jobTitle] || '').trim(),
      company,
      sector: mapIndustryToSector(industry),
      fteCategory: mapEmployeeCategoryToFte(employeeCategory),
      linkedinUrl: String(row[CSV_COLUMNS.linkedinUrl] || '').trim(),
      email: String(row[CSV_COLUMNS.email] || '').trim(),
      phone: '',
      status: 'Nieuw',
      priority: 'Middel',
      notes: '',
      country: String(row[CSV_COLUMNS.country] || row[CSV_COLUMNS.companyCountry] || '').trim(),
      location: String(row[CSV_COLUMNS.location] || row[CSV_COLUMNS.linkedinCompanyLocation] || '').trim(),
      companyWebsite: String(row[CSV_COLUMNS.corporateWebsite] || '').trim(),
      source: String(row[CSV_COLUMNS.source] || '').trim(),
      createdAt: nowIso,
      updatedAt: nowIso,
    });
  }

  return contacts;
}

export function contactsToCsv(contacts) {
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
    'Land',
    'Locatie',
    'Website',
    'Notities',
    'Aangemaakt',
    'Bijgewerkt',
  ];

  const data = contacts.map((c) => fields.map((f) => c[f] ?? ''));
  return Papa.unparse({ fields: header, data });
}

export function downloadCsv(filename, contents) {
  const blob = new Blob([contents], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
