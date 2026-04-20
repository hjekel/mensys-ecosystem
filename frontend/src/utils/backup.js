// Backup / Restore voor de Mensys-app.
// Alle localStorage-keys die de app zelf schrijft worden in een JSON-bestand
// geserialiseerd. Prefix-keys (zoals de dagelijkse checklist per datum)
// worden via BACKUP_KEY_PREFIXES meegenomen.
//
// Het backup-bestand wordt NIET versleuteld. Het bevat de Anthropic-API-key
// als die is ingesteld; deel dit bestand dus niet met anderen.

const APP_ID = 'mensys-ecosystem';
const CURRENT_VERSION = 1;
const LAATSTE_BACKUP_KEY = 'mensys_laatste_backup';

export const BACKUP_KEYS = [
  'mensys_instellingen',
  'mensys_contacts',
  'mensys_ceo',
  'mensys_resellers',
  'mensys_activiteiten',
  'mensys_todos',
  'mensys_view_voorkeur',
  'mensys_distributeurs',
  'mensys_concurrenten',
  'mensys_concurrenten_migration_v2',
  'mensys_klantsignalen',
  'mensys_signalen',
  'mensys_signalen_lastFetch',
  'mensys_yalc_gewichten',
  'mensys_anthropic_api_key',
  'mensys_linkedin_tip_dismissed',
  'mensys_backup_banner_dismissed_tot',
  LAATSTE_BACKUP_KEY,
];

export const BACKUP_KEY_PREFIXES = [
  'mensys_dagelijkse_checklist_',
];

// Keys met persoonlijke of identiteit-gebonden data. Worden NIET
// meegenomen bij "Export voor delen". mensys_instellingen staat hier
// ook in omdat het een gebruikersnaam bevat, maar wordt bij een
// deelbare export wel gesaneerd teruggezet (zie sanitizeInstellingen).
export const GEVOELIGE_KEYS = [
  'mensys_anthropic_api_key',
  'mensys_instellingen',
  'mensys_view_voorkeur',
  'mensys_linkedin_tip_dismissed',
  'mensys_backup_banner_dismissed_tot',
  'mensys_laatste_backup',
];

export function getVeiligeKeys() {
  return BACKUP_KEYS.filter((k) => !GEVOELIGE_KEYS.includes(k));
}

// Whitelist-aanpak: alleen expliciet genoemde velden komen mee in een
// deelbare export. Alle andere velden (gebruikersnaam, bedrijfsnaam,
// propositie, logoKleur, etc.) worden weggelaten. gebruikersnaam wordt
// expliciet op leeg gezet zodat de ontvanger geen "Goedemorgen Henk"
// ziet via de default-fallback.
export function sanitizeInstellingen(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const veilig = {
    gebruikersnaam: '',
  };
  if (raw.doelen !== undefined) veilig.doelen = raw.doelen;
  if (raw.openerAfsluiter !== undefined) veilig.openerAfsluiter = raw.openerAfsluiter;
  return veilig;
}

// Categorieen die de gebruiker kan aan- of uitvinken tijdens restore.
// Elke categorie dekt een set keys. Resterende keys vallen onder 'overig'.
export const RESTORE_CATEGORIEEN = [
  {
    key: 'instellingen',
    label: 'Instellingen (propositie, doelen, opener-afsluiter, YALC-gewichten)',
    keys: ['mensys_instellingen', 'mensys_yalc_gewichten'],
  },
  {
    key: 'inkopers',
    label: 'Inkopers',
    keys: ['mensys_contacts'],
  },
  {
    key: 'ceo',
    label: 'CEO & MD',
    keys: ['mensys_ceo'],
  },
  {
    key: 'resellers',
    label: 'Resellers',
    keys: ['mensys_resellers'],
  },
  {
    key: 'activiteiten',
    label: 'Activiteiten-log',
    keys: ['mensys_activiteiten'],
  },
  {
    key: 'todos',
    label: "To-do's",
    keys: ['mensys_todos'],
  },
  {
    key: 'overig',
    label: 'Overige (concurrenten, distributeurs, klantsignalen, signalen-cache, view-voorkeur, checklist, tip-dismiss, banner-status)',
    keys: [
      'mensys_distributeurs',
      'mensys_concurrenten',
      'mensys_concurrenten_migration_v2',
      'mensys_klantsignalen',
      'mensys_signalen',
      'mensys_signalen_lastFetch',
      'mensys_view_voorkeur',
      'mensys_linkedin_tip_dismissed',
      'mensys_backup_banner_dismissed_tot',
      LAATSTE_BACKUP_KEY,
    ],
    prefixes: ['mensys_dagelijkse_checklist_'],
  },
  {
    key: 'apikey',
    label: 'Anthropic API-key',
    keys: ['mensys_anthropic_api_key'],
    defaultUit: true,
  },
];

export const DEFAULT_GEKOZEN_CATEGORIEEN = RESTORE_CATEGORIEEN
  .filter((c) => !c.defaultUit)
  .map((c) => c.key);

function vindPrefixKeys() {
  const gevonden = [];
  try {
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (!key) continue;
      if (BACKUP_KEY_PREFIXES.some((p) => key.startsWith(p))) {
        gevonden.push(key);
      }
    }
  } catch (err) {
    console.warn('[backup] kon localStorage niet itereren', err);
  }
  return gevonden;
}

function leesEnParse(key) {
  const raw = localStorage.getItem(key);
  if (raw === null) return { ok: false, waarde: null, aanwezig: false };
  try {
    // Sommige keys zijn geen JSON maar rauwe strings (bv. lastFetch timestamp).
    // We proberen JSON.parse; valt terug op de rauwe string.
    return { ok: true, waarde: JSON.parse(raw), aanwezig: true };
  } catch {
    return { ok: true, waarde: raw, aanwezig: true };
  }
}

function nuIso() {
  return new Date().toISOString();
}

function stempel(datum) {
  const pad = (n) => String(n).padStart(2, '0');
  const yyyy = datum.getFullYear();
  const mm = pad(datum.getMonth() + 1);
  const dd = pad(datum.getDate());
  const hh = pad(datum.getHours());
  const mi = pad(datum.getMinutes());
  return `${yyyy}-${mm}-${dd}-${hh}${mi}`;
}

function downloadJson(bestandsnaam, jsonTekst) {
  const blob = new Blob([jsonTekst], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = bestandsnaam;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exporteerBackup() {
  const data = {};
  const overgeslagen = [];

  for (const key of BACKUP_KEYS) {
    if (key === LAATSTE_BACKUP_KEY) continue;
    const res = leesEnParse(key);
    if (!res.aanwezig) continue;
    if (!res.ok) {
      console.warn(`[backup] skip ${key}: kon niet parsen`);
      overgeslagen.push(key);
      continue;
    }
    data[key] = res.waarde;
  }

  for (const key of vindPrefixKeys()) {
    const res = leesEnParse(key);
    if (!res.aanwezig) continue;
    if (!res.ok) {
      overgeslagen.push(key);
      continue;
    }
    data[key] = res.waarde;
  }

  const exportedAt = nuIso();
  const payload = {
    version: CURRENT_VERSION,
    exportedAt,
    app: APP_ID,
    data,
  };

  const json = JSON.stringify(payload, null, 2);
  const bestandsnaam = `mensys-backup-${stempel(new Date())}.json`;
  downloadJson(bestandsnaam, json);

  try {
    localStorage.setItem(
      LAATSTE_BACKUP_KEY,
      JSON.stringify({ datum: exportedAt }),
    );
  } catch (err) {
    console.warn('[backup] kon laatste-backup timestamp niet opslaan', err);
  }

  return {
    bestandsnaam,
    exportedAt,
    aantalKeys: Object.keys(data).length,
    overgeslagen,
  };
}

// Deelbare export: geen API-key, geen gebruikersnaam, geen UI-voorkeuren,
// geen dagelijkse-checklist prefix-keys. Instellingen worden via whitelist
// gesaneerd (doelen, openerAfsluiter + lege gebruikersnaam).
// Update NIET mensys_laatste_backup (dit is een kopie om te delen, geen
// eigen backup-moment).
export function exporteerVoorDelen() {
  const data = {};
  const overgeslagen = [];

  for (const key of getVeiligeKeys()) {
    const res = leesEnParse(key);
    if (!res.aanwezig) continue;
    if (!res.ok) {
      console.warn(`[backup-delen] skip ${key}: kon niet parsen`);
      overgeslagen.push(key);
      continue;
    }
    data[key] = res.waarde;
  }

  // Gesaneerde instellingen apart toevoegen (whitelist-velden).
  try {
    const rawInst = localStorage.getItem('mensys_instellingen');
    if (rawInst !== null) {
      const parsed = JSON.parse(rawInst);
      const veilig = sanitizeInstellingen(parsed);
      if (veilig) data.mensys_instellingen = veilig;
    }
  } catch (err) {
    console.warn('[backup-delen] skip instellingen:', err);
    overgeslagen.push('mensys_instellingen');
  }

  // Prefix-keys (dagelijkse checklist) worden bewust overgeslagen.

  const exportedAt = nuIso();
  const payload = {
    version: CURRENT_VERSION,
    exportedAt,
    app: APP_ID,
    type: 'voor-delen',
    data,
  };

  const json = JSON.stringify(payload, null, 2);
  const bestandsnaam = `mensys-backup-delen-${stempel(new Date())}.json`;
  downloadJson(bestandsnaam, json);

  return {
    bestandsnaam,
    exportedAt,
    aantalKeys: Object.keys(data).length,
    overgeslagen,
  };
}

export function valideerBackup(payload) {
  const fouten = [];
  if (!payload || typeof payload !== 'object') {
    fouten.push('Bestand is geen geldige JSON of is leeg.');
    return { geldig: false, fouten, versieOud: false };
  }
  if (payload.app !== APP_ID) {
    fouten.push(`Dit is geen Mensys-backup (app = ${payload.app || 'onbekend'}).`);
  }
  if (!payload.data || typeof payload.data !== 'object' || Array.isArray(payload.data)) {
    fouten.push('Backup bevat geen geldig data-object.');
  }

  let versieOud = false;
  const versie = Number(payload.version);
  if (!Number.isFinite(versie)) {
    fouten.push('Backup heeft geen geldige version.');
  } else if (versie > CURRENT_VERSION) {
    fouten.push(`Backup versie ${versie} is nieuwer dan deze app (${CURRENT_VERSION}).`);
  } else if (versie < CURRENT_VERSION) {
    versieOud = true;
  }

  return { geldig: fouten.length === 0, fouten, versieOud, versie };
}

function telArrayItems(raw) {
  if (Array.isArray(raw)) return raw.length;
  return null;
}

export function analyseerBackup(payload) {
  const data = payload?.data || {};
  return {
    exportedAt: payload?.exportedAt || null,
    version: Number(payload?.version) || 0,
    type: payload?.type || 'volledig',
    aantalInkopers: telArrayItems(data.mensys_contacts) ?? 0,
    aantalCeos: telArrayItems(data.mensys_ceo) ?? 0,
    aantalResellers: telArrayItems(data.mensys_resellers) ?? 0,
    aantalActiviteiten: telArrayItems(data.mensys_activiteiten) ?? 0,
    aantalTodos: telArrayItems(data.mensys_todos) ?? 0,
    aantalConcurrenten: telArrayItems(data.mensys_concurrenten) ?? 0,
    heeftApiKey: Boolean(data.mensys_anthropic_api_key),
    totaalKeys: Object.keys(data).length,
  };
}

export function analyseerHuidigeData() {
  function tel(key) {
    const res = leesEnParse(key);
    if (!res.ok || !res.aanwezig) return 0;
    return telArrayItems(res.waarde) ?? 0;
  }
  return {
    aantalInkopers: tel('mensys_contacts'),
    aantalCeos: tel('mensys_ceo'),
    aantalResellers: tel('mensys_resellers'),
    aantalActiviteiten: tel('mensys_activiteiten'),
    aantalTodos: tel('mensys_todos'),
    aantalConcurrenten: tel('mensys_concurrenten'),
  };
}

function keysVoorCategorieen(categorieKeys) {
  const vaste = new Set();
  const prefixen = new Set();
  for (const cat of RESTORE_CATEGORIEEN) {
    if (!categorieKeys.includes(cat.key)) continue;
    for (const k of cat.keys) vaste.add(k);
    for (const p of cat.prefixes || []) prefixen.add(p);
  }
  return { vaste, prefixen };
}

function verwijderMatchendePrefixKeys(prefixen) {
  if (prefixen.size === 0) return;
  try {
    const teVerwijderen = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (!key) continue;
      for (const p of prefixen) {
        if (key.startsWith(p)) {
          teVerwijderen.push(key);
          break;
        }
      }
    }
    for (const key of teVerwijderen) {
      try {
        localStorage.removeItem(key);
      } catch (err) {
        console.warn(`[backup] kon ${key} niet verwijderen`, err);
      }
    }
  } catch (err) {
    console.warn('[backup] kon prefix-keys niet opruimen', err);
  }
}

function schrijfWaarde(key, waarde) {
  try {
    const tekst = typeof waarde === 'string' ? waarde : JSON.stringify(waarde);
    localStorage.setItem(key, tekst);
    return { ok: true };
  } catch (err) {
    console.error(`[backup] restore kon ${key} niet wegschrijven`, err);
    return { ok: false, fout: err?.message || String(err) };
  }
}

// Overschrijft localStorage met de geselecteerde categorieen uit de backup.
// gekozenCategorieen is een array met keys uit RESTORE_CATEGORIEEN.
// Retourneert een rapport. De aanroeper moet window.location.reload() doen.
// Bij een voor-delen backup (payload.type === 'voor-delen') wordt de
// prefix-purge overgeslagen (eigen dagelijkse-checklist blijft intact)
// en wordt mensys_laatste_backup NIET overschreven.
export function importeerBackup(payload, gekozenCategorieen) {
  const validatie = valideerBackup(payload);
  if (!validatie.geldig) {
    return { success: false, validatie, beschadigd: [], geschreven: [] };
  }

  const data = payload.data || {};
  const isVoorDelen = payload.type === 'voor-delen';
  const actieveCategorieen = Array.isArray(gekozenCategorieen) && gekozenCategorieen.length > 0
    ? gekozenCategorieen
    : DEFAULT_GEKOZEN_CATEGORIEEN;

  const { vaste, prefixen } = keysVoorCategorieen(actieveCategorieen);

  // Bij een deelbare backup heeft de afzender geen prefix-keys gestuurd;
  // we laten daarom de eigen dagelijkse checklist-keys met rust.
  if (!isVoorDelen) {
    verwijderMatchendePrefixKeys(prefixen);
  }

  const geschreven = [];
  const beschadigd = [];

  for (const [key, waarde] of Object.entries(data)) {
    const isPrefix = [...prefixen].some((p) => key.startsWith(p));
    const isVast = vaste.has(key);
    if (!isPrefix && !isVast) continue;

    const res = schrijfWaarde(key, waarde);
    if (res.ok) {
      geschreven.push(key);
    } else {
      beschadigd.push({ key, fout: res.fout });
    }
  }

  // Markeer import-tijdstip als laatste backup zodat banner weer rustig is.
  // Niet bij voor-delen imports: dat is content van iemand anders, geen
  // eigen backup-moment.
  if (!isVoorDelen && actieveCategorieen.includes('overig')) {
    try {
      localStorage.setItem(
        LAATSTE_BACKUP_KEY,
        JSON.stringify({ datum: nuIso(), bron: 'import' }),
      );
    } catch (err) {
      console.warn('[backup] kon laatste-backup timestamp na import niet zetten', err);
    }
  }

  return { success: true, validatie, beschadigd, geschreven, isVoorDelen };
}

export function getLaatsteBackupDatum() {
  const res = leesEnParse(LAATSTE_BACKUP_KEY);
  if (!res.ok || !res.aanwezig) return null;
  const v = res.waarde;
  if (!v || typeof v !== 'object') return null;
  const t = new Date(v.datum).getTime();
  if (!Number.isFinite(t)) return null;
  return v.datum;
}

export function parseBackupBestand(tekst) {
  try {
    const payload = JSON.parse(tekst);
    return { ok: true, payload };
  } catch (err) {
    return { ok: false, fout: err?.message || 'JSON-parse faalde' };
  }
}
