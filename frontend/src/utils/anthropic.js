// Anthropic API client voor de opener-generator.
// API-key wordt lokaal in localStorage bewaard omdat de app browser-only is.

const API_KEY_STORAGE = 'mensys_anthropic_api_key';
const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';
const MAX_TOKENS = 500;

const SYSTEM_PROMPT = `Je bent een outreach-specialist voor Mensys BV in Haarlem. Mensys is een software-licentieleverancier die IT-resellers en procurement managers ontzorgt bij het inkopen van niche-software (ChatGPT Teams, Claude Teams, Figma, Miro, Canva, SketchUp, MAXQDA etc.) op factuur in euro, zonder creditcard, persoonlijk contact.

Schrijf een kort, persoonlijk LinkedIn DM-bericht van maximaal 3 zinnen. Geen hoi, gebruik 'Beste [naam]'. Geen em-dashes. Geen exclamatiepunten. Geen 'graag', geen 'zou', geen 'wellicht'.

Het bericht begint met een haak op het signaal, noemt daarna het concrete Mensys-voordeel dat relevant is voor deze persoon, en eindigt met een concrete vraag of actie.

Toon: direct, zakelijk, mensgericht. Geen pitch-taal.`;

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

export async function generateOpener({ naam, functie, bedrijf, signaal, doelgroep }) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Geen Anthropic API-key ingesteld.');
  }

  const userMessage =
    `Naam: ${naam || '-'}\n` +
    `Functie: ${functie || '-'}\n` +
    `Bedrijf: ${bedrijf || '-'}\n` +
    `Signaal: ${signaal || 'geen signaal beschikbaar'}\n` +
    `Doelgroep: ${doelgroep || 'inkoper'}`;

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
      system: SYSTEM_PROMPT,
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
