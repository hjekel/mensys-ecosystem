// Shared constants across frontend and backend

export const STATUSES = [
  'Nieuw',
  'Warm',
  'Benaderd',
  'Gesprek gevoerd',
  'Klant',
];

export const SECTORS = [
  'Zorg',
  'Overheid',
  'Maakindustrie',
  'Tech/ICT',
  'Bouw/Techniek',
  'Finance',
  'Onderwijs',
  'Overig',
];

export const FTE_CATEGORIES = [
  '10.000+',
  '5.001-10.000',
  '1.001-5.000',
  '501-1.000',
  '201-500',
  '51-200',
  'Onbekend',
];

export const PRIORITIES = ['Hoog', 'Middel', 'Laag'];

export const SECTOR_COLORS = {
  Zorg: '#16A34A',
  Overheid: '#003087',
  Maakindustrie: '#E8500A',
  'Tech/ICT': '#7C3AED',
  'Bouw/Techniek': '#B45309',
  Finance: '#374151',
  Onderwijs: '#0D9488',
  Overig: '#6B7280',
};

export const BRAND = {
  blue: '#003087',
  orange: '#E8500A',
  bgGrey: '#F4F6F9',
  white: '#FFFFFF',
  textPrimary: '#1A1A1A',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
};

export const STORAGE_KEY = 'mensys_contacts';
export const MAX_RECORDS = 5000;

export const RESELLER_STORAGE_KEY = 'mensys_resellers';

export const RESELLER_STATUSES = [
  'Nieuw',
  'Warm',
  'Benaderd',
  'Gesprek gevoerd',
  'Partner',
];

export const RESELLER_TYPES = [
  'MSP',
  'Microsoft/Cloud Partner',
  'Security Reseller',
  'Implementation Partner',
  'VAR / IT Reseller',
  'Nader te bepalen',
];

export const RESELLER_FTE_RANGES = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '500+',
];

export const MENSYS_FIT_SCORES = ['Hoog', 'Midden', 'Onderzoeken', 'Onbekend'];

export const MENSYS_FIT_COLORS = {
  Hoog: { bg: '#e6f7f2', fg: '#00a878' },
  Midden: { bg: '#e8eef7', fg: '#003087' },
  Onderzoeken: { bg: '#fff3eb', fg: '#E8A020' },
  Onbekend: { bg: '#f2f5fb', fg: '#5c6a85' },
};

export const CEO_STORAGE_KEY = 'mensys_ceo';

export const CEO_FTE_CATEGORIES = ['1-10', '11-50'];

export const CEO_FUNCTIETITELS = [
  'CEO',
  'DGA',
  'Directeur',
  'Eigenaar',
  'Founder',
  'MD',
  'Managing Director',
  'Owner',
  'Oprichter',
];

export const RESELLER_CSV_COLUMNS = {
  bedrijf: 'bedrijf',
  voornaam: 'voornaam',
  achternaam: 'achternaam',
  functietitel: 'functietitel',
  email: 'email',
  linkedin: 'linkedin',
  fteRange: 'fteRange',
  resellerType: 'resellerType',
  mensysFit: 'mensysFit',
  bron: 'bron',
  locatie: 'locatie',
  website: 'website',
  status: 'status',
  keywords: 'keywords',
  notities: 'notities',
};
