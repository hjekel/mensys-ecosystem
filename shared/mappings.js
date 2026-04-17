// Mapping helpers used during CSV import

export function mapIndustryToSector(industry) {
  if (!industry) return 'Overig';
  const value = String(industry).trim();
  const map = {
    'Hospitals and Health Care': 'Zorg',
    'Government Administration': 'Overheid',
    'IT Services and IT Consulting': 'Tech/ICT',
    'Construction': 'Bouw/Techniek',
    'Financial Services': 'Finance',
    'Education': 'Onderwijs',
  };
  if (map[value]) return map[value];

  const lower = value.toLowerCase();
  if (lower.includes('health') || lower.includes('hospital') || lower.includes('zorg')) {
    return 'Zorg';
  }
  if (lower.includes('government') || lower.includes('public administration')) {
    return 'Overheid';
  }
  if (
    lower.includes('software') ||
    lower.includes('information technology') ||
    lower.includes('it service') ||
    lower.includes('computer') ||
    lower.includes('internet')
  ) {
    return 'Tech/ICT';
  }
  if (lower.includes('manufactur') || lower.includes('industrial')) {
    return 'Maakindustrie';
  }
  if (lower.includes('construction') || lower.includes('bouw') || lower.includes('engineering')) {
    return 'Bouw/Techniek';
  }
  if (lower.includes('financial') || lower.includes('bank') || lower.includes('insurance')) {
    return 'Finance';
  }
  if (
    lower.includes('education') ||
    lower.includes('school') ||
    lower.includes('university') ||
    lower.includes('higher education')
  ) {
    return 'Onderwijs';
  }
  return 'Overig';
}

export function mapEmployeeCategoryToFte(category) {
  if (!category) return 'Onbekend';
  const value = String(category).trim();
  const map = {
    'A. 10.000+': '10.000+',
    'B. 5.000-10.000': '5.001-10.000',
    'C. 1.000-5.000': '1.001-5.000',
    'D. 501-1.000': '501-1.000',
    'E. 201-500': '201-500',
    'F. 51-200': '51-200',
  };
  if (map[value]) return map[value];

  const lower = value.toLowerCase();
  if (lower.startsWith('a.') || lower.includes('10.000+') || lower.includes('10000+')) {
    return '10.000+';
  }
  if (lower.startsWith('b.') || lower.includes('5.000-10.000') || lower.includes('5000-10000')) {
    return '5.001-10.000';
  }
  if (lower.startsWith('c.') || lower.includes('1.000-5.000') || lower.includes('1000-5000')) {
    return '1.001-5.000';
  }
  if (lower.startsWith('d.') || lower.includes('501-1.000') || lower.includes('501-1000')) {
    return '501-1.000';
  }
  if (lower.startsWith('e.') || lower.includes('201-500')) {
    return '201-500';
  }
  if (lower.startsWith('f.') || lower.includes('51-200')) {
    return '51-200';
  }
  return 'Onbekend';
}

export const CSV_COLUMNS = {
  companyCountry: 'Company Country',
  linkedinCompanyLocation: 'LinkedIn Company Location (HQ)',
  location: 'Location',
  country: 'Country',
  linkedinIndustry: 'LinkedIn Industry',
  linkedinEmployees: 'LinkedIn Employees',
  employeeCategory: 'Employee Category',
  revenueRange: 'Revenue Range',
  company: 'Company',
  firstName: 'First Name',
  lastName: 'Last Name',
  jobTitle: 'Job Title',
  linkedinUrl: 'LinkedIn URL',
  email: 'Email',
  connections: 'Connections',
  jobStarted: 'Job Started',
  corporateLinkedinUrl: 'Corporate LinkedIn URL',
  corporateWebsite: 'Corporate Website',
  foundedYear: 'Founded Year',
  companyEmployeeCount: 'Company Employee Count',
  certifications: 'Certifications',
  source: 'Source',
};
