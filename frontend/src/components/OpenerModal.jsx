import { useEffect, useMemo, useState } from 'react';
import Modal from './Modal.jsx';
import { generateOpenerDual, getApiKey, setApiKey } from '../utils/anthropic.js';
import styles from './OpenerModal.module.css';

function isWarmContextCompleet(context) {
  if (!context) return false;
  const hasAbout = Boolean(String(context.linkedinAbout || '').trim());
  const hasPosts = Boolean(String(context.linkedinPosts || '').trim());
  const jobs = Array.isArray(context.vorigeJobs) ? context.vorigeJobs.filter((j) => j && String(j).trim()) : [];
  const hasJobs = jobs.length > 0;
  return hasAbout && hasPosts && hasJobs;
}

export default function OpenerModal({ open, onClose, context, initialModus, onSaveAsNotitie }) {
  const [modus, setModus] = useState(() => (initialModus === 'warm' ? 'warm' : 'koud'));
  const [texts, setTexts] = useState({ nl: '', en: '' });
  const [errors, setErrors] = useState({ nl: null, en: null });
  const [loading, setLoading] = useState(false);
  const [activeLang, setActiveLang] = useState('nl');
  const [keyInput, setKeyInput] = useState('');
  const [hasKey, setHasKey] = useState(() => Boolean(getApiKey()));
  const [copied, setCopied] = useState({ nl: false, en: false });
  const [saved, setSaved] = useState(false);
  const [warmContextGedismist, setWarmContextGedismist] = useState(false);

  const warmContextCompleet = useMemo(() => isWarmContextCompleet(context), [context]);
  const moetContextWaarschuwing = modus === 'warm' && !warmContextCompleet && !warmContextGedismist;

  useEffect(() => {
    if (!open) {
      setTexts({ nl: '', en: '' });
      setErrors({ nl: null, en: null });
      setCopied({ nl: false, en: false });
      setSaved(false);
      setActiveLang('nl');
      setWarmContextGedismist(false);
      return;
    }
    setModus(initialModus === 'warm' ? 'warm' : 'koud');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialModus]);

  useEffect(() => {
    if (!open) return;
    if (!hasKey) return;
    if (!context) return;
    if (modus === 'warm' && !warmContextCompleet && !warmContextGedismist) return;
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, context, hasKey, modus, warmContextGedismist]);

  async function generate() {
    setLoading(true);
    setErrors({ nl: null, en: null });
    setTexts({ nl: '', en: '' });
    try {
      const result = await generateOpenerDual({ ...context, modus });
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
    const modusTag = modus === 'warm' ? '[Warm] ' : '[Koud] ';
    onSaveAsNotitie(modusTag + prefix + text);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function updateActive(value) {
    setTexts((t) => ({ ...t, [activeLang]: value }));
  }

  function kiesModus(next) {
    if (next === modus) return;
    setModus(next);
    setWarmContextGedismist(false);
    setTexts({ nl: '', en: '' });
    setErrors({ nl: null, en: null });
  }

  const activeText = texts[activeLang];
  const activeError = errors[activeLang];
  const titel = modus === 'warm' ? 'Warm bericht' : 'Koude opener';

  return (
    <Modal open={open} title={titel} onClose={onClose} size="lg">
      <div className={styles.modusTabs}>
        <button
          type="button"
          className={`${styles.modusTab} ${modus === 'koud' ? styles.modusTabActive : ''}`}
          onClick={() => kiesModus('koud')}
          aria-pressed={modus === 'koud'}
        >
          Koude opener
          <span className={styles.modusSub}>3 zinnen, generiek</span>
        </button>
        <button
          type="button"
          className={`${styles.modusTab} ${modus === 'warm' ? styles.modusTabActive : ''}`}
          onClick={() => kiesModus('warm')}
          aria-pressed={modus === 'warm'}
        >
          Warm bericht
          <span className={styles.modusSub}>4-5 zinnen, persoonlijk</span>
        </button>
      </div>

      <div className={styles.contextBlock}>
        <div><span className={styles.ctxLabel}>Voor:</span> <strong>{context?.naam || '-'}</strong></div>
        <div><span className={styles.ctxLabel}>Functie:</span> {context?.functie || '-'}</div>
        <div><span className={styles.ctxLabel}>Bedrijf:</span> {context?.bedrijf || '-'}</div>
        <div><span className={styles.ctxLabel}>Doelgroep:</span> {context?.doelgroep || '-'}</div>
        {context?.signaal && (
          <div className={styles.ctxSignal}><span className={styles.ctxLabel}>Signaal:</span> {context.signaal}</div>
        )}
      </div>

      {moetContextWaarschuwing && (
        <div className={styles.warnBlock}>
          <div className={styles.warnTitle}>Persoonlijke context is leeg of onvolledig</div>
          <p className={styles.warnText}>
            Voor een warm bericht is LinkedIn About, recente Posts en laatste
            jobtitles nodig. Vul die velden aan in het Rolodex-kaartje onder
            "Persoonlijke context". Of kies een van de opties hieronder.
          </p>
          <div className={styles.warnActions}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => kiesModus('koud')}
            >
              Schakel over naar Koud
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setWarmContextGedismist(true)}
            >
              Toch genereren in Warm
            </button>
          </div>
        </div>
      )}

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
      ) : moetContextWaarschuwing ? null : (
        <>
          <div className={styles.langTabs}>
            <button
              type="button"
              className={`${styles.langTab} ${activeLang === 'nl' ? styles.langTabActive : ''}`}
              onClick={() => setActiveLang('nl')}
              aria-pressed={activeLang === 'nl'}
            >
              <FlagNL />
              <span>Nederlands</span>
              {errors.nl && <span className={styles.tabDot} title={errors.nl} />}
            </button>
            <button
              type="button"
              className={`${styles.langTab} ${activeLang === 'en' ? styles.langTabActive : ''}`}
              onClick={() => setActiveLang('en')}
              aria-pressed={activeLang === 'en'}
            >
              <FlagGB />
              <span>English</span>
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
                  rows={modus === 'warm' ? 9 : 7}
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
            {modus === 'warm' && (
              <div><strong>Warm bericht:</strong> stuur handmatig vanuit Rolodex zodra iemand je connectie accepteert. Gaat niet via Dispatch.</div>
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

function FlagNL() {
  return (
    <svg viewBox="0 0 9 6" width="20" height="14" className={styles.flag} aria-hidden="true">
      <rect width="9" height="2" fill="#AE1C28" />
      <rect y="2" width="9" height="2" fill="#FFFFFF" />
      <rect y="4" width="9" height="2" fill="#21468B" />
      <rect x="0.25" y="0.25" width="8.5" height="5.5" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="0.5" />
    </svg>
  );
}

function FlagGB() {
  return (
    <svg viewBox="0 0 60 30" width="20" height="14" className={styles.flag} aria-hidden="true">
      <clipPath id="gb-clip">
        <path d="M0 0 v30 h60 v-30 z" />
      </clipPath>
      <path d="M0 0 v30 h60 v-30 z" fill="#012169" />
      <path d="M0 0 L60 30 M60 0 L0 30" stroke="#FFFFFF" strokeWidth="6" clipPath="url(#gb-clip)" />
      <path
        d="M0 0 L60 30 M60 0 L0 30"
        stroke="#C8102E"
        strokeWidth="4"
        clipPath="url(#gb-clip)"
        strokeDasharray="30 30"
        strokeDashoffset="0"
      />
      <path d="M30 0 v30 M0 15 h60" stroke="#FFFFFF" strokeWidth="10" />
      <path d="M30 0 v30 M0 15 h60" stroke="#C8102E" strokeWidth="6" />
    </svg>
  );
}
