import { useEffect, useState } from 'react';
import Modal from './Modal.jsx';
import { generateOpenerDual, getApiKey, setApiKey } from '../utils/anthropic.js';
import styles from './OpenerModal.module.css';

export default function OpenerModal({ open, onClose, context, onSaveAsNotitie }) {
  const [texts, setTexts] = useState({ nl: '', en: '' });
  const [errors, setErrors] = useState({ nl: null, en: null });
  const [loading, setLoading] = useState(false);
  const [activeLang, setActiveLang] = useState('nl');
  const [keyInput, setKeyInput] = useState('');
  const [hasKey, setHasKey] = useState(() => Boolean(getApiKey()));
  const [copied, setCopied] = useState({ nl: false, en: false });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!open) {
      setTexts({ nl: '', en: '' });
      setErrors({ nl: null, en: null });
      setCopied({ nl: false, en: false });
      setSaved(false);
      setActiveLang('nl');
      return;
    }
    if (!hasKey) return;
    if (!context) return;
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, context, hasKey]);

  async function generate() {
    setLoading(true);
    setErrors({ nl: null, en: null });
    setTexts({ nl: '', en: '' });
    try {
      const result = await generateOpenerDual(context);
      setTexts({ nl: result.nl || '', en: result.en || '' });
      setErrors({ nl: result.nlError, en: result.enError });
    } catch (err) {
      const msg = err.message || 'Onbekende fout';
      setErrors({ nl: msg, en: msg });
    }
    setLoading(false);
  }

  function saveKey() {
    const k = keyInput.trim();
    if (!k) return;
    setApiKey(k);
    setHasKey(true);
    setKeyInput('');
  }

  function clearKey() {
    setApiKey('');
    setHasKey(false);
    setTexts({ nl: '', en: '' });
    setErrors({ nl: null, en: null });
  }

  async function copyActive() {
    const text = texts[activeLang];
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied((c) => ({ ...c, [activeLang]: true }));
      setTimeout(() => setCopied((c) => ({ ...c, [activeLang]: false })), 2000);
    } catch {
      alert('Kon niet kopieren naar klembord');
    }
  }

  function saveActiveAsNotitie() {
    const text = texts[activeLang]?.trim();
    if (!text || !onSaveAsNotitie) return;
    const prefix = activeLang === 'nl' ? 'NL: ' : 'EN: ';
    onSaveAsNotitie(prefix + text);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function updateActive(value) {
    setTexts((t) => ({ ...t, [activeLang]: value }));
  }

  const activeText = texts[activeLang];
  const activeError = errors[activeLang];

  return (
    <Modal
      open={open}
      title="Opener schrijven"
      onClose={onClose}
      size="lg"
    >
      <div className={styles.contextBlock}>
        <div><span className={styles.ctxLabel}>Voor:</span> <strong>{context?.naam || '-'}</strong></div>
        <div><span className={styles.ctxLabel}>Functie:</span> {context?.functie || '-'}</div>
        <div><span className={styles.ctxLabel}>Bedrijf:</span> {context?.bedrijf || '-'}</div>
        <div><span className={styles.ctxLabel}>Doelgroep:</span> {context?.doelgroep || '-'}</div>
        {context?.signaal && (
          <div className={styles.ctxSignal}><span className={styles.ctxLabel}>Signaal:</span> {context.signaal}</div>
        )}
      </div>

      {!hasKey ? (
        <div className={styles.keySection}>
          <h3 className={styles.keyTitle}>Anthropic API-key nodig</h3>
          <p className={styles.keyIntro}>
            De opener-generator gebruikt Claude via de Anthropic API. Plak
            hieronder je API-key (begint met <code>sk-ant-</code>). De key
            wordt lokaal in je browser bewaard, niet naar een server
            gestuurd.
          </p>
          <div className={styles.keyRow}>
            <input
              type="password"
              className="input"
              placeholder="sk-ant-..."
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              autoFocus
            />
            <button
              type="button"
              className="btn btn-primary"
              onClick={saveKey}
              disabled={!keyInput.trim()}
            >
              Opslaan
            </button>
          </div>
          <p className={styles.keyNote}>
            API-key verkrijg je op <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer noopener">console.anthropic.com</a>.
          </p>
        </div>
      ) : (
        <>
          <div className={styles.tabBar}>
            <button
              type="button"
              className={`${styles.tab} ${activeLang === 'nl' ? styles.tabActive : ''}`}
              onClick={() => setActiveLang('nl')}
            >
              Nederlands
              {errors.nl && <span className={styles.tabDot} title={errors.nl} />}
            </button>
            <button
              type="button"
              className={`${styles.tab} ${activeLang === 'en' ? styles.tabActive : ''}`}
              onClick={() => setActiveLang('en')}
            >
              English
              {errors.en && <span className={styles.tabDot} title={errors.en} />}
            </button>
          </div>
          <div className={styles.tabHint}>
            <strong>Nederlands:</strong> voor Nederlandse contacten.{' '}
            <strong>English:</strong> voor internationale contacten of als je twijfelt over voorkeur.
          </div>

          <div className={styles.editorWrap}>
            {loading ? (
              <div className={styles.loading}>
                Beide versies worden geschreven door Claude (NL en EN parallel)...
              </div>
            ) : activeError && !activeText ? (
              <div className={styles.error}>
                <strong>Fout:</strong> {activeError}
              </div>
            ) : (
              <>
                <textarea
                  className={`input ${styles.editor}`}
                  value={activeText}
                  onChange={(e) => updateActive(e.target.value)}
                  rows={7}
                  placeholder="Opener verschijnt hier..."
                />
                {activeError && (
                  <div className={styles.warnInline}>
                    Let op: {activeError}
                  </div>
                )}
              </>
            )}
          </div>

          <div className={styles.actions}>
            <button type="button" className="btn btn-ghost" onClick={generate} disabled={loading}>
              Opnieuw genereren
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={copyActive}
              disabled={!activeText || loading}
            >
              {copied[activeLang] ? 'Gekopieerd' : `Kopieer ${activeLang === 'nl' ? 'NL' : 'EN'}`}
            </button>
            {onSaveAsNotitie && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={saveActiveAsNotitie}
                disabled={!activeText || loading}
              >
                {saved ? 'Opgeslagen' : 'Sla op als notitie'}
              </button>
            )}
          </div>

          <div className={styles.helpBlock}>
            <div><strong>Kopieer naar klembord:</strong> plak in LinkedIn DM.</div>
            <div><strong>Sla op als notitie:</strong> bewaar in contactdossier.</div>
            <div><strong>Opnieuw genereren:</strong> vraag nieuwe versies aan (NL en EN tegelijk).</div>
          </div>

          <div className={styles.keyFooter}>
            <button type="button" className={styles.linkBtn} onClick={clearKey}>
              API-key verwijderen
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}
