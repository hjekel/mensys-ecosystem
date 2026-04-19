import { useState } from 'react';
import Modal from './Modal.jsx';
import styles from './DispatchHelpButton.module.css';

export default function DispatchHelpButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        className={styles.btn}
        onClick={() => setOpen(true)}
        aria-label="Hoe werkt Dispatch?"
        title="Hoe werkt Dispatch?"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round" />
        </svg>
      </button>
      <Modal open={open} title="Hoe werkt Dispatch?" onClose={() => setOpen(false)} size="md">
        <div className={styles.body}>
          <h3 className={styles.stepTitle}>Dispatch &rarr; Dripify in drie stappen</h3>

          <div className={styles.step}>
            <div className={styles.stepNum}>1</div>
            <div>
              <div className={styles.stepHead}>Export genereren</div>
              <p className={styles.stepBody}>
                Klik Dispatch. De app maakt een CSV met de YALC top-N, inclusief
                gegenereerde openers in kolom <code>custom_var_2</code>.
              </p>
            </div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepNum}>2</div>
            <div>
              <div className={styles.stepHead}>Upload in Dripify</div>
              <p className={styles.stepBody}>
                Open je Dripify-account, ga naar de juiste campagne
                (A = CEO/ChatGPT, B = Inkopers, C = Resellers), en upload de CSV.
              </p>
            </div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepNum}>3</div>
            <div>
              <div className={styles.stepHead}>Dripify verstuurt</div>
              <p className={styles.stepBody}>
                Dripify leest <code>custom_var_2</code> en gebruikt dat als
                gepersonaliseerde opener per contact. Je koude-openers komen dus
                live bij elke ontvanger.
              </p>
            </div>
          </div>

          <div className={styles.callout}>
            <strong>Let op:</strong> warme berichten (uit Modus 2) zijn NIET
            voor Dispatch. Die verstuur je handmatig vanuit Rolodex zodra iemand
            je connectie accepteert.
          </div>
        </div>
      </Modal>
    </>
  );
}
