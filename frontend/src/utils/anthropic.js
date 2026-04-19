// Anthropic API client voor de opener-generator.
// Twee modi: Koude opener (Modus 1, 3 zinnen) en Warm bericht
// (Modus 2, 4-5 zinnen met persoonlijke LinkedIn-context).
// Per modus leveren we NL en EN parallel.

import { getAfsluiterTekst, loadInstellingen } from './instellingen.js';

const API_KEY_STORAGE = 'mensys_anthropic_api_key';
const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';
const MAX_TOKENS = 600;

export function getApiKey() {
  try {
    return localStorage.getItem(API_KEY_STORAGE) || '';
  } catch {
    return '';
  }
}

export function setApiKey(key) {
  try {
    if (key) localStorage.setItem(API_KEY_STORAGE, key);
    else localStorage.removeItem(API_KEY_STORAGE);
  } catch {
    // ignore
  }
}

export function hasApiKey() {
  return Boolean(getApiKey());
}

function buildSystemPrompt({ taal, modus, afsluiterTekst }) {
  const taalRegel = taal === 'en'
    ? "Schrijf in het Engels. Begin met 'Dear [firstname],'."
    : "Schrijf in het Nederlands. Begin met 'Beste [voornaam],'.";

  const lengteRegel = modus === 'warm'
    ? 'Vier of vijf zinnen totaal. Eerste zin verwijst naar iets specifieks uit de LinkedIn-context van de lezer.'
    : 'Drie zinnen totaal.';

  const structuurBlok = modus === 'warm'
    ? (
      'STRUCTUUR:\n' +
      'Zin 1: persoonlijke verwijzing naar recent werk, een post of een carrierestap van de lezer.\n' +
      'Zin 2: herkenbaar scenario dat direct raakt aan hun situatie.\n' +
      'Middenzin: brug naar wat Mensys doet, in een zin.\n' +
      `Slotzin: eindig met exact deze afsluiter: "${afsluiterTekst}"`
    )
    : (
      'STRUCTUUR:\n' +
      'Zin 1: herkenbaar scenario dat direct raakt aan hun situatie.\n' +
      'Zin 2: brug naar wat Mensys doet.\n' +
      `Zin 3: eindig met exact deze afsluiter: "${afsluiterTekst}"`
    );

  return (
    'Je schrijft een LinkedIn-bericht voor Mensys, een Nederlandse software-licentieleverancier.\n' +
    'Mensys levert niche-software zoals ChatGPT Teams, Figma, Canva, Claude Teams en 700+ andere titels op factuur in euro, zonder creditcard-gedoe.\n\n' +
    'REGELS:\n' +
    `- ${taalRegel}\n` +
    '- Geen em-dashes.\n' +
    '- Verboden woorden: "jij als [rol] weet als geen ander", "simpelweg", "eenvoudigweg", "in de juiste volgorde", "ontzorgen".\n' +
    '- Geen lijst van vijf problemen. Een herkenbaar scenario, zo specifiek dat de lezer denkt: hoe weet jij dat?\n' +
    '- Geen salesy direct-mail taal.\n' +
    '- Geen "Past een gesprek van 10 minuten?". Gebruik de opgegeven afsluiter.\n' +
    `- ${lengteRegel}\n\n` +
    structuurBlok
  );
}

function truncate(value, max) {
  const v = String(value || '').trim();
  if (v.length <= max) return v;
  return v.slice(0, max) + '...';
}

function buildUserMessage({ naam, functie, bedrijf, sector, signaal, modus, linkedinAbout, linkedinPosts, vorigeJobs }) {
  const lines = [
    'CONTEXT OVER DE ONTVANGER:',
    `Naam: ${naam || '-'}`,
    `Functie: ${functie || '-'}`,
    `Bedrijf: ${bedrijf || '-'}`,
    `Sector: ${sector || '-'}`,
  ];

  if (modus === 'warm') {
    lines.push(`LinkedIn About: ${truncate(linkedinAbout, 1200) || '-'}`);
    lines.push(`Recente Posts: ${truncate(linkedinPosts, 1500) || '-'}`);
    const jobs = Array.isArray(vorigeJobs)
      ? vorigeJobs.filter((j) => j && String(j).trim()).join(' | ')
      : '';
    lines.push(`Laatste jobtitles: ${jobs || '-'}`);
  }

  lines.push(`Signaal of aanleiding: ${signaal || 'geen signaal beschikbaar'}`);

  return lines.join('\n');
}

async function callAnthropic({ apiKey, systemPrompt, userMessage }) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });

  if (!res.ok) {
    let msg = `Anthropic API ${res.status}`;
    try {
      const errBody = await res.json();
      if (errBody.error?.message) msg += `: ${errBody.error.message}`;
    } catch {
      // ignore
    }
    throw new Error(msg);
  }

  const data = await res.json();
  const text = Array.isArray(data.content)
    ? data.content.map((b) => b.text || '').join('').trim()
    : '';
  return text || '(lege respons)';
}

export async function generateOpenerDual(context) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Geen Anthropic API-key ingesteld.');
  }

  const modus = context?.modus === 'warm' ? 'warm' : 'koud';
  const instellingen = loadInstellingen();
  const afsluiterTekst = getAfsluiterTekst(instellingen.openerAfsluiter);

  const systemNl = buildSystemPrompt({ taal: 'nl', modus, afsluiterTekst });
  const systemEn = buildSystemPrompt({ taal: 'en', modus, afsluiterTekst });
  const userMessage = buildUserMessage({ ...context, modus });

  const [nlResult, enResult] = await Promise.allSettled([
    callAnthropic({ apiKey, systemPrompt: systemNl, userMessage }),
    callAnthropic({ apiKey, systemPrompt: systemEn, userMessage }),
  ]);

  return {
    nl: nlResult.status === 'fulfilled' ? nlResult.value : '',
    en: enResult.status === 'fulfilled' ? enResult.value : '',
    nlError: nlResult.status === 'rejected' ? (nlResult.reason?.message || 'NL-call faalde') : null,
    enError: enResult.status === 'rejected' ? (enResult.reason?.message || 'EN-call faalde') : null,
  };
}
