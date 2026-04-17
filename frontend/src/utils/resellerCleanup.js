import { normaliseCompany, normalisePersonName } from './cleanup.js';

const DASH_OR_DOTS_ONLY = /^[-.\s\u2013\u2014]+$/;
const RETIRED = /\b(gepensioneerd|retired|pensioen)\b/i;
const BARE_DOMAIN = /^[a-z0-9][a-z0-9-]*\.(nl|com|be|de|eu|io|co|net|org|info|shop|store)$/i;

export function isBogusReseller(r) {
  const bedrijf = (r.bedrijf || '').trim();
  const functie = (r.functietitel || '').trim();
  if (!bedrijf) return true;
  if (DASH_OR_DOTS_ONLY.test(bedrijf)) return true;
  if (RETIRED.test(functie)) return true;
  if (BARE_DOMAIN.test(bedrijf)) return true;
  return false;
}

export function planResellerCleanup(resellers) {
  const toRemove = [];
  const toRename = [];
  for (const r of resellers) {
    if (isBogusReseller(r)) {
      toRemove.push(r);
      continue;
    }
    const changes = {};
    const nextBedrijf = normaliseCompany(r.bedrijf);
    if (nextBedrijf && nextBedrijf !== (r.bedrijf || '')) {
      changes.bedrijf = nextBedrijf;
    }
    const nextVoornaam = normalisePersonName(r.voornaam);
    if (nextVoornaam && nextVoornaam !== (r.voornaam || '')) {
      changes.voornaam = nextVoornaam;
    }
    const nextAchternaam = normalisePersonName(r.achternaam);
    if (nextAchternaam && nextAchternaam !== (r.achternaam || '')) {
      changes.achternaam = nextAchternaam;
    }
    if (Object.keys(changes).length > 0) {
      toRename.push({ reseller: r, changes });
    }
  }
  return { toRemove, toRename };
}

export function applyResellerCleanup(resellers) {
  const { toRemove, toRename } = planResellerCleanup(resellers);
  const removeIds = new Set(toRemove.map((r) => r.id));
  const renameMap = new Map(toRename.map((x) => [x.reseller.id, x.changes]));
  const nowIso = new Date().toISOString();
  const cleaned = resellers
    .filter((r) => !removeIds.has(r.id))
    .map((r) => {
      const changes = renameMap.get(r.id);
      if (!changes) return r;
      return { ...r, ...changes, updatedAt: nowIso };
    });
  return { cleaned, removedCount: toRemove.length, renamedCount: toRename.length };
}
