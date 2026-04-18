// Anthropic API client voor de opener-generator.
// Levert twee versies parallel: Nederlands en Engels.

const API_KEY_STORAGE = 'mensys_anthropic_api_key';
const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';
const MAX_TOKENS = 500;

const SYSTEM_PROMPT_NL = `Je schrijft een LinkedIn DM voor Mensys BV, een software-licentieleverancier in Haarlem.
Mensys levert niche-software (ChatGPT Teams, Claude Teams, Figma, Miro, Canva, SketchUp etc.) op factuur in euro. Geen creditcard. Geen USD. Een aanspreekpunt.

Schrijf in het Nederlands. Spreektaal, direct, kort, intelligent.
Drie zinnen. Niet meer.
Begin met 'Beste [voornaam],'
Geen aannames over de situatie van de lezer ('bij organisaties als de jouwe' of vergelijkbaar is verboden).
Geen em-dashes.
Geen 'vereenvoudigen', 'optimaliseren', 'ontzorgen', 'binnenkort', of andere platgetreden termen.
Geen lijst van vijf problemen. Kies er een. De scherpste.
De eerste zin beschrijft een herkenbare situatie vanuit de lezer (niet vanuit Mensys).
De tweede zin legt het verband met wat Mensys doet.
De derde zin eindigt met een concrete, lage-drempel vraag. Geen 'even bellen?'. Formuleer als: 'Past een gesprek van 10 minuten?' of vergelijkbaar.
Schrijf alsof Harry Dry, Rory Sutherland en Alex Hormozi samen een DM schrijven: slim, direct, geen bullshit, je voelt je gezien.`;

const SYSTEM_PROMPT_EN = `You write a LinkedIn DM for Mensys BV, a software licence reseller based in Haarlem, the Netherlands.
Mensys supplies niche software (ChatGPT Teams, Claude Teams, Figma, Miro, Canva, SketchUp etc.) billed in euro. No credit card. No USD. One point of contact.

Write in English. Spoken tone, direct, short, intelligent.
Three sentences. No more.
Start with 'Dear [firstname],'
No assumptions about the reader's situation ('at organisations like yours' or similar is forbidden).
No em-dashes.
No 'simplify', 'optimise', 'streamline', 'soon', or other worn-out buzzwords.
No list of five problems. Pick one. The sharpest.
The first sentence describes a recognisable situation from the reader's perspective (not from Mensys's perspective).
The second sentence connects it to what Mensys does.
The third sentence ends with a concrete, low-threshold question. No 'quick call?'. Phrase as: 'Would a 10-minute conversation fit?' or similar.
Write as if Harry Dry, Rory Sutherland and Alex Hormozi wrote a DM together: sharp, direct, no bullshit, the reader feels seen.`;

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

function buildUserMessage({ naam, functie, bedrijf, signaal, doelgroep }) {
  return (
    `Naam: ${naam || '-'}\n` +
    `Functie: ${functie || '-'}\n` +
    `Bedrijf: ${bedrijf || '-'}\n` +
    `Signaal: ${signaal || 'geen signaal beschikbaar'}\n` +
    `Doelgroep: ${doelgroep || 'inkoper'}`
  );
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

export async function generateOpenerDual({ naam, functie, bedrijf, signaal, doelgroep }) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Geen Anthropic API-key ingesteld.');
  }
  const userMessage = buildUserMessage({ naam, functie, bedrijf, signaal, doelgroep });

  const [nlResult, enResult] = await Promise.allSettled([
    callAnthropic({ apiKey, systemPrompt: SYSTEM_PROMPT_NL, userMessage }),
    callAnthropic({ apiKey, systemPrompt: SYSTEM_PROMPT_EN, userMessage }),
  ]);

  return {
    nl: nlResult.status === 'fulfilled' ? nlResult.value : '',
    en: enResult.status === 'fulfilled' ? enResult.value : '',
    nlError: nlResult.status === 'rejected' ? (nlResult.reason?.message || 'NL-call faalde') : null,
    enError: enResult.status === 'rejected' ? (enResult.reason?.message || 'EN-call faalde') : null,
  };
}
