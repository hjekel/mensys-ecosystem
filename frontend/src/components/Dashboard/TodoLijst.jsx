import styles from './TodoLijst.module.css';

const DAY = 24 * 60 * 60 * 1000;

const PRIO_KLEUR = {
  hoog: '#DC2626',
  midden: '#E8A020',
  laag: '#9CA3AF',
};

const STATUS_ICON = {
  todo: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="3" />
    </svg>
  ),
  doing: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M8 12h8" strokeLinecap="round" />
    </svg>
  ),
  done: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="3" fill="#003087" stroke="#003087" />
      <path d="M8 12l3 3 5-6" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

function binnenXDagen(deadlineIso, dagen) {
  if (!deadlineIso) return false;
  const t = new Date(deadlineIso).getTime();
  if (!Number.isFinite(t)) return false;
  const diff = t - Date.now();
  return diff <= dagen * DAY && diff > -DAY;
}

function formatDeadline(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('nl-NL', { day: '2-digit', month: 'short' });
  } catch {
    return '';
  }
}

function TodoRij({ todo, onCycle, onEdit }) {
  const prioKleur = PRIO_KLEUR[todo.prioriteit] || PRIO_KLEUR.midden;
  const deadlineBadge = binnenXDagen(todo.deadline, 7);
  return (
    <div className={`${styles.rij} ${todo.status === 'done' ? styles.rijKlaar : ''}`}>
      <button
        type="button"
        className={styles.checkbox}
        onClick={() => onCycle(todo.id)}
        aria-label={`Status: ${todo.status}, klik om te wijzigen`}
      >
        {STATUS_ICON[todo.status] || STATUS_ICON.todo}
      </button>
      <button
        type="button"
        className={styles.tekstBtn}
        onClick={() => onEdit(todo)}
      >
        <span className={styles.tekst}>{todo.tekst}</span>
        {todo.gekoppeldAan?.contactId && (
          <span className={styles.gekoppeld}>&middot; {todo.gekoppeldAan.contactType}</span>
        )}
      </button>
      <span
        className={styles.prioDot}
        style={{ background: prioKleur }}
        title={`Prioriteit: ${todo.prioriteit}`}
        aria-label={`Prioriteit: ${todo.prioriteit}`}
      />
      {deadlineBadge && (
        <span className={styles.deadlineBadge}>{formatDeadline(todo.deadline)}</span>
      )}
    </div>
  );
}

function Sectie({ titel, items, onCycle, onEdit, leegTekst }) {
  return (
    <div className={styles.sectie}>
      <div className={styles.sectieKop}>
        {titel} <span className={styles.sectieAantal}>({items.length})</span>
      </div>
      {items.length === 0 ? (
        leegTekst ? <div className={styles.sectieLeeg}>{leegTekst}</div> : null
      ) : (
        <div className={styles.sectieLijst}>
          {items.map((t) => (
            <TodoRij key={t.id} todo={t} onCycle={onCycle} onEdit={onEdit} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function TodoLijst({
  todos,
  onAdd,
  onCycleStatus,
  onEdit,
}) {
  const teDoen = todos.filter((t) => t.status === 'todo');
  const bezig = todos.filter((t) => t.status === 'doing');
  const klaarDezeWeek = todos.filter((t) => {
    if (t.status !== 'done') return false;
    const g = new Date(t.gewijzigd || t.aangemaakt || 0).getTime();
    return Number.isFinite(g) && Date.now() - g <= 7 * DAY;
  });

  const alleLeeg = teDoen.length === 0 && bezig.length === 0 && klaarDezeWeek.length === 0;

  return (
    <div className={styles.wrap}>
      <div className={styles.kop}>
        <h3 className={styles.titel}>Mijn acties</h3>
        <button type="button" className={styles.addBtn} onClick={onAdd}>
          + Nieuwe actie
        </button>
      </div>

      {alleLeeg ? (
        <div className={styles.leeg}>
          Nog geen acties. Klik <strong>+ Nieuwe actie</strong> om te beginnen.
        </div>
      ) : (
        <div className={styles.secties}>
          <Sectie titel="Te doen" items={teDoen} onCycle={onCycleStatus} onEdit={onEdit} />
          <Sectie titel="Bezig" items={bezig} onCycle={onCycleStatus} onEdit={onEdit} />
          <Sectie
            titel="Klaar deze week"
            items={klaarDezeWeek}
            onCycle={onCycleStatus}
            onEdit={onEdit}
          />
        </div>
      )}
    </div>
  );
}
