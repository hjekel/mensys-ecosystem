import { useEffect, useRef, useState } from 'react';
import styles from './FilterDropdown.module.css';

export default function FilterDropdown({
  allLabel,
  value,
  options,
  onChange,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const selected = value ? options.find((o) => o.value === value) : null;
  const buttonLabel = selected
    ? (selected.count !== undefined ? `${selected.label} (${selected.count})` : selected.label)
    : allLabel;

  return (
    <div className={styles.wrap} ref={ref}>
      <button
        type="button"
        className={styles.btn}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className={styles.btnLabel}>{buttonLabel}</span>
        <svg
          className={`${styles.chev} ${open ? styles.chevOpen : ''}`}
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M2 4.5l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className={styles.panel} role="listbox">
          <button
            type="button"
            className={`${styles.item} ${!value ? styles.selected : ''}`}
            onClick={() => {
              onChange('');
              setOpen(false);
            }}
          >
            <span className={styles.itemLabel}>{allLabel}</span>
          </button>
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`${styles.item} ${value === opt.value ? styles.selected : ''}`}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
            >
              <span className={styles.itemLabel}>{opt.label}</span>
              {opt.count !== undefined && (
                <span className={styles.itemCount}>({opt.count})</span>
              )}
            </button>
          ))}
          {options.length === 0 && (
            <div className={styles.empty}>Geen opties</div>
          )}
        </div>
      )}
    </div>
  );
}
