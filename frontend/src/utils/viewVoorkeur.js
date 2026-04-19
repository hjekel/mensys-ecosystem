const STORAGE_KEY = 'mensys_view_voorkeur';
const ALLOWED = new Set(['kanban', 'lijst']);
const DEFAULT_VIEW = 'lijst';

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed;
  } catch {
    return {};
  }
}

export function leesVoorkeur(tab) {
  const all = readAll();
  const v = all[tab];
  return ALLOWED.has(v) ? v : DEFAULT_VIEW;
}

export function schrijfVoorkeur(tab, view) {
  if (!ALLOWED.has(view)) return;
  const all = readAll();
  all[tab] = view;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // localStorage kan vol zitten, stil falen
  }
}
