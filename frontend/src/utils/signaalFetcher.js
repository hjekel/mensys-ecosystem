// Fetch-helpers voor de Signalen-tab. Alle externe calls lopen via
// api.allorigins.win als CORS-proxy.

import { generateId } from './storage.js';

const CORS_PROXY = 'https://api.allorigins.win/raw?url=';
export const SIGNALEN_STORAGE_KEY = 'mensys_signalen';
export const SIGNALEN_LAST_FETCH_KEY = 'mensys_signalen_lastFetch';
const MAX_ITEMS = 500;
const FETCH_INTERVAL_MS = 4 * 60 * 60 * 1000;
const MIN_COMPANY_LEN = 4;

const VAKBLAD_FEEDS = [
  { url: 'https://www.computable.nl/rss', bron: 'Computable' },
  { url: 'https://www.dutchitchannel.nl/rss/nieuws.rss', bron: 'Dutch IT Channel' },
  { url: 'https://www.channelconnect.nl/feed/', bron: 'ChannelConnect' },
  { url: 'https://www.agconnect.nl/rss.xml', bron: 'AG Connect' },
];

const AI_FEEDS = [
  { url: 'https://openai.com/blog/rss/', bron: 'OpenAI Blog' },
  { url: 'https://www.anthropic.com/news/rss.xml', bron: 'Anthropic' },
  { url: 'https://news.microsoft.com/feed/', bron: 'Microsoft News' },
  { url: 'https://blog.google/rss/', bron: 'Google Blog' },
  { url: 'https://huggingface.co/blog/feed.xml', bron: 'Hugging Face' },
];

const FEED_TIMEOUT_MS = 3000;

async function fetchProxied(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FEED_TIMEOUT_MS);
  try {
    const res = await fetch(CORS_PROXY + encodeURIComponent(url), { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res;
  } finally {
    clearTimeout(timer);
  }
}

function stripHtml(s) {
  if (!s) return '';
  return s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function truncate(s, n) {
  if (!s) return '';
  const t = String(s).trim();
  if (t.length <= n) return t;
  return t.slice(0, n - 1).trimEnd() + '...';
}

function safeDate(raw) {
  if (!raw) return new Date().toISOString();
  try {
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return new Date().toISOString();
    return d.toISOString();
  } catch {
    return new Date().toISOString();
  }
}

async function parseFeed(url, bron, type, companyTag = null, maxItems = 10) {
  const res = await fetchProxied(url);
  const text = await res.text();
  const doc = new DOMParser().parseFromString(text, 'application/xml');
  if (doc.querySelector('parsererror')) throw new Error(`${bron} XML parse error`);
  let items = Array.from(doc.querySelectorAll('item'));
  let isAtom = false;
  if (items.length === 0) {
    items = Array.from(doc.querySelectorAll('entry'));
    isAtom = true;
  }
  items = items.slice(0, maxItems);
  return items.map((item) => {
    const title = item.querySelector('title')?.textContent?.trim() || '';
    const link = isAtom
      ? (item.querySelector('link')?.getAttribute('href') || '')
      : (item.querySelector('link')?.textContent?.trim() || '');
    const descEl = isAtom
      ? (item.querySelector('summary') || item.querySelector('content'))
      : item.querySelector('description');
    const desc = stripHtml(descEl?.textContent || '');
    const dateEl = isAtom
      ? (item.querySelector('published') || item.querySelector('updated'))
      : item.querySelector('pubDate');
    return {
      id: generateId(),
      type,
      titel: title || '(geen titel)',
      samenvatting: truncate(desc, 200),
      url: link,
      bron,
      datum: safeDate(dateEl?.textContent),
      gekoppeld: companyTag ? [companyTag] : [],
      gelezen: false,
      opgeslagen: false,
    };
  });
}

async function fetchFeedGroup(feeds, type) {
  const results = await Promise.allSettled(
    feeds.map((f) => parseFeed(f.url, f.bron, type, null, 10)),
  );
  const items = [];
  let okCount = 0;
  for (const r of results) {
    if (r.status === 'fulfilled') {
      items.push(...r.value);
      okCount += 1;
    }
  }
  return { items, okCount, total: feeds.length };
}

async function fetchBedrijfsnieuwsRaw(companies) {
  if (!companies || companies.length === 0) return [];
  const top = companies.slice(0, 20);
  const results = await Promise.allSettled(
    top.map((name) =>
      parseFeed(
        `https://news.google.com/rss/search?q=${encodeURIComponent(name)}&hl=nl&gl=NL&ceid=NL:nl`,
        'Google News',
        'bedrijfsnieuws',
        name,
        3,
      ),
    ),
  );
  const items = [];
  for (const r of results) {
    if (r.status === 'fulfilled') items.push(...r.value);
  }
  return items;
}

export async function fetchAllSignalen(topCompanies) {
  const [vakbladen, aitools, bedrijfsItems] = await Promise.all([
    fetchFeedGroup(VAKBLAD_FEEDS, 'vakblad'),
    fetchFeedGroup(AI_FEEDS, 'ai-tools'),
    fetchBedrijfsnieuwsRaw(topCompanies),
  ]);
  const items = [...vakbladen.items, ...aitools.items, ...bedrijfsItems];
  const stats = {
    vakblad: { ok: vakbladen.okCount, total: vakbladen.total },
    'ai-tools': { ok: aitools.okCount, total: aitools.total },
  };
  return { items, stats };
}

export function matchCompanies(signalen, companyNames) {
  const lower = companyNames
    .filter(Boolean)
    .map((n) => ({ name: n, lower: String(n).toLowerCase() }))
    .filter((n) => n.lower.length >= MIN_COMPANY_LEN);
  return signalen.map((s) => {
    const hay = `${s.titel || ''} ${s.samenvatting || ''}`.toLowerCase();
    const matches = new Set(s.gekoppeld || []);
    for (const cn of lower) {
      if (hay.includes(cn.lower)) matches.add(cn.name);
    }
    return { ...s, gekoppeld: Array.from(matches) };
  });
}

export function mergeSignalen(existing, incoming) {
  const byUrl = new Map();
  for (const s of existing) {
    if (s.url) byUrl.set(s.url, s);
  }
  const merged = [...existing];
  for (const s of incoming) {
    if (s.url && byUrl.has(s.url)) continue;
    merged.push(s);
    if (s.url) byUrl.set(s.url, s);
  }
  merged.sort((a, b) => {
    const da = new Date(a.datum).getTime() || 0;
    const db = new Date(b.datum).getTime() || 0;
    return db - da;
  });
  return merged.slice(0, MAX_ITEMS);
}

export function loadSignalen() {
  try {
    const raw = localStorage.getItem(SIGNALEN_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Kon signalen niet laden', err);
    return [];
  }
}

export function saveSignalen(items) {
  try {
    const capped = items.slice(0, MAX_ITEMS);
    localStorage.setItem(SIGNALEN_STORAGE_KEY, JSON.stringify(capped));
    return true;
  } catch (err) {
    console.error('Kon signalen niet opslaan', err);
    return false;
  }
}

export function shouldRefetch() {
  try {
    const last = localStorage.getItem(SIGNALEN_LAST_FETCH_KEY);
    if (!last) return true;
    return Date.now() - Number(last) > FETCH_INTERVAL_MS;
  } catch {
    return true;
  }
}

export function setLastFetch() {
  try {
    localStorage.setItem(SIGNALEN_LAST_FETCH_KEY, String(Date.now()));
  } catch {
    // ignore
  }
}

export function loadLastFetch() {
  try {
    const last = localStorage.getItem(SIGNALEN_LAST_FETCH_KEY);
    return last ? Number(last) : null;
  } catch {
    return null;
  }
}
