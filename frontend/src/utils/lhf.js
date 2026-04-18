// Low Hanging Fruit scoring, geinspireerd op YALC GTM OS.
// Elk contact/reseller krijgt een score uit 100, opgebouwd uit signalen.
// Signalen zijn bewijs van benaderbaarheid en Mensys-fit.
// Inkoper-gewichten zijn configureerbaar via yalcInstellingen.js.

import { getGewichten } from './yalcInstellingen.js';

const PRIORITY_SECTORS = new Set([
  'Zorg',
  'Overheid',
  'Maakindustrie',
  'Tech/ICT',
  'Onderwijs',
]);

const IDEAL_FTE_INKOPER = new Set([
  '10.000+',
  '5.001-10.000',
  '1.001-5.000',
  '501-1.000',
  '201-500',
]);

const IDEAL_FTE_RESELLER = new Set([
  '11-50',
  '51-200',
  '201-500',
]);

const WARM_STATUSES = new Set(['Warm', 'Gesprek gevoerd']);

export function scoreInkoper(c, gewichten) {
  const g = gewichten || getGewichten();
  const signals = [];
  let score = 0;

  if (c.email && g.email > 0) {
    score += g.email;
    signals.push({ label: 'Email aanwezig', points: g.email });
  }
  if (c.linkedinUrl && g.linkedin > 0) {
    score += g.linkedin;
    signals.push({ label: 'LinkedIn aanwezig', points: g.linkedin });
  }
  if (IDEAL_FTE_INKOPER.has(c.fteCategory) && g.fte > 0) {
    score += g.fte;
    signals.push({ label: `FTE ${c.fteCategory}`, points: g.fte });
  }
  if (PRIORITY_SECTORS.has(c.sector) && g.sector > 0) {
    score += g.sector;
    signals.push({ label: `Sector ${c.sector}`, points: g.sector });
  }
  if (WARM_STATUSES.has(c.status) && g.status > 0) {
    score += g.status;
    signals.push({ label: `Status ${c.status}`, points: g.status });
  }
  if (c.priority === 'Hoog' && g.prioriteit > 0) {
    score += g.prioriteit;
    signals.push({ label: 'Prioriteit Hoog', points: g.prioriteit });
  }

  return { score, signals };
}

export function scoreReseller(r) {
  const signals = [];
  let score = 0;

  if (r.mensysFit === 'Hoog') {
    score += 30;
    signals.push({ label: 'Mensys Fit Hoog', points: 30 });
  } else if (r.mensysFit === 'Midden') {
    score += 15;
    signals.push({ label: 'Mensys Fit Midden', points: 15 });
  } else if (r.mensysFit === 'Onderzoeken') {
    score += 5;
    signals.push({ label: 'Mensys Fit Onderzoeken', points: 5 });
  }
  if (r.email) {
    score += 20;
    signals.push({ label: 'Email aanwezig', points: 20 });
  }
  if (r.linkedin) {
    score += 20;
    signals.push({ label: 'LinkedIn aanwezig', points: 20 });
  }
  if (r.resellerType && r.resellerType !== 'Nader te bepalen') {
    score += 10;
    signals.push({ label: `Type ${r.resellerType}`, points: 10 });
  }
  if (WARM_STATUSES.has(r.status)) {
    score += 15;
    signals.push({ label: `Status ${r.status}`, points: 15 });
  }
  if (IDEAL_FTE_RESELLER.has(r.fteRange)) {
    score += 5;
    signals.push({ label: `FTE ${r.fteRange}`, points: 5 });
  }

  return { score, signals };
}

export function rankInkopers(contacts, gewichten) {
  const g = gewichten || getGewichten();
  return contacts
    .map((c) => ({ record: c, ...scoreInkoper(c, g) }))
    .sort((a, b) => b.score - a.score);
}

export function rankResellers(resellers) {
  return resellers
    .map((r) => ({ record: r, ...scoreReseller(r) }))
    .sort((a, b) => b.score - a.score);
}

export function scoreBand(score) {
  if (score >= 80) return 'Hot';
  if (score >= 60) return 'Warm';
  if (score >= 40) return 'Lauw';
  return 'Koud';
}

export const SCORE_BAND_COLORS = {
  Hot: { bg: '#e6f7f2', fg: '#00a878' },
  Warm: { bg: '#fff3eb', fg: '#E8500A' },
  Lauw: { bg: '#e8eef7', fg: '#003087' },
  Koud: { bg: '#f2f5fb', fg: '#5c6a85' },
};
