// Cleanup helpers: detect bogus records and normalise company and person names.

const TUSSENVOEGSELS = new Set([
  'de', 'der', 'den', 'het', 'van', 'ten', 'ter', "'t", 'op', 'in', 'bij', 'aan',
  'onder', 'over', 'te', 'uit', 'voor', 'tot', 'en', 'of', 'the', 'of', 'a', 'an',
  'la', 'le', 'du', 'di', 'da',
]);

const PERSON_NAME_TUSSENVOEGSELS = new Set([
  'de', 'der', 'den', 'van', 'ten', 'ter', "'t", 'op', 'in', 'bij', 'aan', 'uit',
  'la', 'le', 'du', 'di', 'da', 'el',
]);

const SUFFIX_MAP = {
  'b.v.': 'B.V.',
  'bv': 'B.V.',
  'b.v': 'B.V.',
  'n.v.': 'N.V.',
  'nv': 'N.V.',
  'n.v': 'N.V.',
  'v.o.f.': 'V.O.F.',
  'vof': 'V.O.F.',
  'gmbh': 'GmbH',
  'ltd': 'Ltd',
  'ltd.': 'Ltd.',
  'llc': 'LLC',
  'inc': 'Inc.',
  'inc.': 'Inc.',
};

const BARE_DOMAIN = /^[a-z0-9][a-z0-9-]*\.(nl|com|be|de|eu|io|co|net|org|info|shop|store)$/i;
const DASH_OR_DOTS_ONLY = /^[-.\s\u2013\u2014]+$/;
const RETIRED = /\b(gepensioneerd|retired|pensioen)\b/i;

export function isBogus(contact) {
  const company = (contact.company || '').trim();
  const jobTitle = (contact.jobTitle || '').trim();
  if (!company) return true;
  if (DASH_OR_DOTS_ONLY.test(company)) return true;
  if (RETIRED.test(jobTitle)) return true;
  if (BARE_DOMAIN.test(company)) return true;
  return false;
}

export function normaliseCompany(raw) {
  if (!raw) return '';
  let s = String(raw).replace(/\s+/g, ' ').trim();
  s = s.replace(/\s*[-\u2013\u2014]+\s*$/, '').trim();
  if (!s) return '';
  const words = s.split(' ');
  const fixed = words.map((word, idx) => {
    if (!word) return word;
    const lower = word.toLowerCase();
    const suffix = SUFFIX_MAP[lower];
    if (suffix) return suffix;
    if (/^[A-Z0-9&+.\-/]{2,}$/.test(word)) return word;
    if (idx > 0 && TUSSENVOEGSELS.has(lower)) return lower;
    if (word.startsWith('(') && word.length > 1) {
      return '(' + titleCaseWord(word.slice(1));
    }
    return titleCaseWord(word);
  });
  return fixed.join(' ');
}

function titleCaseWord(word) {
  if (!word) return word;
  if (/^[A-Z0-9&+.\-/]{2,}$/.test(word)) return word;
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function titleCaseChunk(chunk) {
  if (!chunk) return chunk;
  return chunk.charAt(0).toUpperCase() + chunk.slice(1).toLowerCase();
}

export function normalisePersonName(raw) {
  if (!raw) return '';
  const s = String(raw).replace(/\s+/g, ' ').trim();
  if (!s) return '';
  const words = s.split(' ');
  const fixed = words.map((word, idx) => {
    if (!word) return word;
    const lower = word.toLowerCase();
    if (idx > 0 && PERSON_NAME_TUSSENVOEGSELS.has(lower)) return lower;
    if (word.includes('-')) {
      return word.split('-').map(titleCaseChunk).join('-');
    }
    if (word.includes("'") && word.length > 2) {
      return word.split("'").map(titleCaseChunk).join("'");
    }
    return titleCaseChunk(word);
  });
  return fixed.join(' ');
}

export function planCleanup(contacts) {
  const toRemove = [];
  const toRename = [];
  for (const c of contacts) {
    if (isBogus(c)) {
      toRemove.push(c);
      continue;
    }
    const changes = {};
    const nextCompany = normaliseCompany(c.company);
    if (nextCompany && nextCompany !== (c.company || '')) {
      changes.company = nextCompany;
    }
    const nextFirst = normalisePersonName(c.firstName);
    if (nextFirst && nextFirst !== (c.firstName || '')) {
      changes.firstName = nextFirst;
    }
    const nextLast = normalisePersonName(c.lastName);
    if (nextLast && nextLast !== (c.lastName || '')) {
      changes.lastName = nextLast;
    }
    if (Object.keys(changes).length > 0) {
      toRename.push({ contact: c, changes });
    }
  }
  return { toRemove, toRename };
}

export function applyCleanup(contacts) {
  const { toRemove, toRename } = planCleanup(contacts);
  const removeIds = new Set(toRemove.map((c) => c.id));
  const renameMap = new Map(toRename.map((r) => [r.contact.id, r.changes]));
  const nowIso = new Date().toISOString();
  const cleaned = contacts
    .filter((c) => !removeIds.has(c.id))
    .map((c) => {
      const changes = renameMap.get(c.id);
      if (!changes) return c;
      return { ...c, ...changes, updatedAt: nowIso };
    });
  return { cleaned, removedCount: toRemove.length, renamedCount: toRename.length };
}
