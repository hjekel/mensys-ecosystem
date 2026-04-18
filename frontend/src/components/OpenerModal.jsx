import { useEffect, useState } from 'react';
import Modal from './Modal.jsx';
import { generateOpener, getApiKey, setApiKey } from '../utils/anthropic.js';
import styles from './OpenerModal.module.css';

export default function OpenerModal({ open, onClose, context, onSaveAsNotitie }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [keyInput, setKeyInput] = useState('');
  const [hasKey, setHasKey] = useState(() => Boolean(getApiKey()));
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!open) {
      setText('');
      setError('');
      setCopied(false);
      setSaved(false);
      return;
    }
    if (!hasKey) return;
    if (!context) return;
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, context, hasKey]);

  async function generate() {
    setLoading(true);
    setError('');
    setText('');
    try {
      const result = await generateOpener(context);
      setText(result);
    } catch (err) {
      setError(err.message || 'Onbekende fout');
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
    setText('');
    setError('');
  }

  async function copyText() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert('Kon niet kopieren naar klembord');
    }
  }

  function save() {
    if (!text.trim() || !onSaveAsNotitie) return;
    onSaveAsNotitie(text.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

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
          <div className={styles.editorWrap}>
            {loading ? (
              <div className={styles.loading}>Opener wordt geschreven door Claude...</div>
            ) : error ? (
              <div className={styles.error}>
                <strong>Fout:</strong> {error}
              </div>
            ) : (
              <textarea
                className={`input ${styles.editor}`}
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={7}
                placeholder="Opener verschijnt hier..."
              />
            )}
          </div>

          <div className={styles.actions}>
            <button type="button" className="btn btn-ghost" onClick={generate} disabled={loading}>
              Opnieuw genereren
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={copyText}
              disabled={!text || loading}
            >
              {copied ? 'Gekopieerd' : 'Kopieer naar klembord'}
            </button>
            {onSaveAsNotitie && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={save}
                disabled={!text || loading}
              >
                {saved ? 'Opgeslagen' : 'Sla op als notitie'}
              </button>
            )}
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
