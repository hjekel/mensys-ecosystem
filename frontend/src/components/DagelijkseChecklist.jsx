import { useEffect, useState } from 'react';
import styles from './DagelijkseChecklist.module.css';

const STORAGE_PREFIX = 'mensys_dagelijkse_checklist_';

const DEFAULT_STATE = {
  signalenChecked: false,
  yalcChecked: false,
  weekDoelen: false,
  linkedinMessages: '',
  statussenBijgewerkt: false,
  nieuweContacten: '',
};

function todayDateString() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function storageKey() {
  return `${STORAGE_PREFIX}${todayDateString()}`;
}

export default function DagelijkseChecklist({ onNavigate }) {
  const [state, setState] = useState(DEFAULT_STATE);
  const [dateKey, setDateKey] = useState(todayDateString());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey());
      if (raw) {
        setState({ ...DEFAULT_STATE, ...JSON.parse(raw) });
      } else {
        setState(DEFAULT_STATE);
      }
    } catch {
      setState(DEFAULT_STATE);
    }
  }, [dateKey]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey(), JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [state]);

  useEffect(() => {
    const id = setInterval(() => {
      const today = todayDateString();
      if (today !== dateKey) setDateKey(today);
    }, 60 * 1000);
    return () => clearInterval(id);
  }, [dateKey]);

  function set(field, value) {
    setState((s) => ({ ...s, [field]: value }));
  }

  const totalChecks = [
    state.signalenChecked,
    state.yalcChecked,
    state.weekDoelen,
    state.statussenBijgewerkt,
  ];
  const done = totalChecks.filter(Boolean).length;
  const total = totalChecks.length;

  const nl = new Date().toLocaleDateString('nl-NL', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  });

  return (
    <section className={styles.widget}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Vandaag</h2>
          <div className={styles.sub}>{nl}</div>
        </div>
        <div className={styles.progress}>
          <span className={styles.progressValue}>{done}/{total}</span>
          <span className={styles.progressLabel}>checks gedaan</span>
        </div>
      </div>

      <div className={styles.blocks}>
        <div className={styles.block}>
          <div className={styles.blockTitle}>Ochtend (10 min)</div>
          <CheckItem
            checked={state.signalenChecked}
            onChange={(v) => set('signalenChecked', v)}
            label="Signalen-tab gecheckt"
            actionLabel="Ga naar Signalen"
            onAction={() => onNavigate && onNavigate('signalen')}
          />
          <CheckItem
            checked={state.yalcChecked}
            onChange={(v) => set('yalcChecked', v)}
            label="Top 3 YALC-contacten bekeken"
            actionLabel="Ga naar YALC"
            onAction={() => onNavigate && onNavigate('yalc')}
          />
          <CheckItem
            checked={state.weekDoelen}
            onChange={(v) => set('weekDoelen', v)}
            label="Week-doelen bijgewerkt"
          />
        </div>

        <div className={styles.block}>
          <div className={styles.blockTitle}>Uitreik</div>
          <div className={styles.inputRow}>
            <span className={styles.inputLabel}>LinkedIn berichten verstuurd:</span>
            <input
              type="number"
              min="0"
              className={`input ${styles.numInput}`}
              value={state.linkedinMessages}
              onChange={(e) => set('linkedinMessages', e.target.value)}
              placeholder="0"
            />
          </div>
          <CheckItem
            checked={state.statussenBijgewerkt}
            onChange={(v) => set('statussenBijgewerkt', v)}
            label="Statussen bijgewerkt in app"
            actionLabel="Ga naar Inkopers"
            onAction={() => onNavigate && onNavigate('inkopers')}
          />
        </div>

        <div className={styles.block}>
          <div className={styles.blockTitle}>Einde dag</div>
          <div className={styles.inputRow}>
            <span className={styles.inputLabel}>Nieuwe contacten geimporteerd:</span>
            <select
              className={`input select ${styles.selectInput}`}
              value={state.nieuweContacten}
              onChange={(e) => set('nieuweContacten', e.target.value)}
            >
              <option value="">Kies</option>
              <option value="ja">Ja</option>
              <option value="nee">Nee</option>
            </select>
          </div>
        </div>
      </div>
    </section>
  );
}

function CheckItem({ checked, onChange, label, actionLabel, onAction }) {
  return (
    <div className={styles.item}>
      <label className={styles.itemLabel}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className={checked ? styles.checkedText : ''}>{label}</span>
      </label>
      {actionLabel && onAction && (
        <button
          type="button"
          className={styles.actionLink}
          onClick={onAction}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
