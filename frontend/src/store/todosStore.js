// To-do lijst voor Dashboard. Plain JS, localStorage-only.
// Zelfde patroon als activiteitenStore. Max 1000 items (FIFO).

import { generateId } from '../utils/storage.js';

const STORAGE_KEY = 'mensys_todos';
const MAX_ITEMS = 1000;

export const TODO_STATUSES = ['todo', 'doing', 'done'];
export const TODO_PRIORITEITEN = ['hoog', 'midden', 'laag'];

let versie = 0;
const subscribers = new Set();

export function getVersie() {
  return versie;
}

export function subscribe(cb) {
  if (typeof cb !== 'function') return () => {};
  subscribers.add(cb);
  return () => {
    subscribers.delete(cb);
  };
}

function notify() {
  versie += 1;
  for (const cb of subscribers) {
    try {
      cb(versie);
    } catch (err) {
      console.error('todosStore subscriber fout', err);
    }
  }
}

export function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Kon todos niet laden', err);
    return [];
  }
}

export function saveTodos(items) {
  try {
    const capped = items.length > MAX_ITEMS
      ? items.slice(items.length - MAX_ITEMS)
      : items;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(capped));
    return capped;
  } catch (err) {
    console.error('Kon todos niet opslaan', err);
    return items;
  }
}

function normaliseer(todo, isNieuw) {
  const nowIso = new Date().toISOString();
  const base = {
    id: todo.id || generateId(),
    tekst: '',
    status: 'todo',
    prioriteit: 'midden',
    deadline: '',
    gekoppeldAan: null,
    notities: '',
    aangemaakt: isNieuw ? nowIso : todo.aangemaakt || nowIso,
    gewijzigd: nowIso,
    ...todo,
  };
  if (!TODO_STATUSES.includes(base.status)) base.status = 'todo';
  if (!TODO_PRIORITEITEN.includes(base.prioriteit)) base.prioriteit = 'midden';
  return base;
}

export function voegTodoToe(todo) {
  if (!todo || !todo.tekst || !String(todo.tekst).trim()) {
    return { record: null, all: loadTodos() };
  }
  const record = normaliseer({ ...todo, tekst: String(todo.tekst).trim() }, true);
  const current = loadTodos();
  const next = saveTodos([...current, record]);
  notify();
  return { record, all: next };
}

export function updateTodo(id, wijzigingen) {
  const current = loadTodos();
  const nowIso = new Date().toISOString();
  const next = current.map((t) => (t.id === id ? normaliseer({ ...t, ...wijzigingen, gewijzigd: nowIso }, false) : t));
  saveTodos(next);
  notify();
  return next;
}

export function verwijderTodo(id) {
  const current = loadTodos();
  const next = current.filter((t) => t.id !== id);
  saveTodos(next);
  notify();
  return next;
}

const NEXT_STATUS = { todo: 'doing', doing: 'done', done: 'todo' };

export function cycleStatus(id) {
  const current = loadTodos();
  const huidig = current.find((t) => t.id === id);
  if (!huidig) return current;
  const volgend = NEXT_STATUS[huidig.status] || 'todo';
  return updateTodo(id, { status: volgend });
}

export function getTodosByStatus(status) {
  const all = loadTodos();
  return all.filter((t) => t.status === status);
}

export function getOpenTodosGekoppeldAan(contactType, contactId) {
  if (!contactId) return [];
  const all = loadTodos();
  return all.filter((t) => {
    if (t.status === 'done') return false;
    const g = t.gekoppeldAan;
    if (!g) return false;
    return g.contactId === contactId && (!contactType || g.contactType === contactType);
  });
}

export function getTodosKlaarDezeWeek() {
  const nu = Date.now();
  const DAY = 24 * 60 * 60 * 1000;
  const zevenGeleden = nu - 7 * DAY;
  const all = loadTodos();
  return all.filter((t) => {
    if (t.status !== 'done') return false;
    const g = new Date(t.gewijzigd || t.aangemaakt || 0).getTime();
    return g >= zevenGeleden && g <= nu;
  });
}
