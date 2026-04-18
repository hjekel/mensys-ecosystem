import { useEffect, useRef, useState } from 'react';
import styles from './ContactCard.module.css';
import { STATUSES } from '@shared/constants.js';

export default function ContactCard({
  contact,
  onOpen,
  onStatusChange,
  onEdit,
  onDelete,
  dragHandleProps,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handler(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
        setStatusOpen(false);
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || '(naamloos)';
  const firstDegree = String(contact.source || contact.bron || '').toLowerCase().includes('1st degree')
    || String(contact.source || contact.bron || '').toLowerCase().includes('1e graads');

  return (
    <div className={styles.card} onClick={() => onOpen(contact)}>
      <div className={styles.topRow} {...(dragHandleProps || {})}>
        <div className={styles.nameBlock}>
          <div className={styles.name}>{fullName}</div>
          {firstDegree && (
            <div className={styles.firstDegree}>
              <span className={styles.firstDegreeDot} />
              1e graads
            </div>
          )}
          {contact.jobTitle && (
            <div className={styles.title}>{contact.jobTitle}</div>
          )}
        </div>
        <div className={styles.menuWrap} ref={menuRef}>
          <button
            className={styles.menuBtn}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((v) => !v);
              setStatusOpen(false);
            }}
            aria-label="Acties"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="5" cy="12" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="19" cy="12" r="2" />
            </svg>
          </button>
          {menuOpen && (
            <div className={styles.menu} onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className={styles.menuItem}
                onClick={() => setStatusOpen((v) => !v)}
              >
                Status wijzigen
              </button>
              {statusOpen && (
                <div className={styles.submenu}>
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={`${styles.menuItem} ${contact.status === s ? styles.current : ''}`}
                      onClick={() => {
                        onStatusChange(contact, s);
                        setMenuOpen(false);
                        setStatusOpen(false);
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
              <button
                type="button"
                className={styles.menuItem}
                onClick={() => {
                  onEdit(contact);
                  setMenuOpen(false);
                }}
              >
                Bewerken
              </button>
              <button
                type="button"
                className={`${styles.menuItem} ${styles.danger}`}
                onClick={() => {
                  if (confirm(`Verwijder ${fullName}?`)) onDelete(contact);
                  setMenuOpen(false);
                }}
              >
                Verwijderen
              </button>
            </div>
          )}
        </div>
      </div>

      {contact.company && <div className={styles.company}>{contact.company}</div>}

      {contact.linkedinUrl && (
        <div className={styles.icons} onClick={(e) => e.stopPropagation()}>
          <a
            href={contact.linkedinUrl}
            target="_blank"
            rel="noreferrer noopener"
            className={styles.linkedinBtn}
            title="LinkedIn profiel openen"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            <span>LinkedIn</span>
          </a>
        </div>
      )}
    </div>
  );
}
