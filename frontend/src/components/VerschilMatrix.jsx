import styles from './VerschilMatrix.module.css';

const CRITERIA = [
  {
    label: 'AI-tools portfolio (ChatGPT Teams, Claude, Copilot)',
    mensys: 'win',
    perConcurrent: {
      Actendo: 'lose',
      Centralpoint: 'lose',
      'Scholten Awater': 'lose',
      'Protinus IT': 'lose',
      'Vendor-direct (OpenAI, Canva, Figma etc.)': 'equal',
    },
  },
  {
    label: 'Exoten-focus (niche software)',
    mensys: 'win',
    perConcurrent: {
      Actendo: 'equal',
      Centralpoint: 'lose',
      'Scholten Awater': 'lose',
      'Protinus IT': 'lose',
      'Vendor-direct (OpenAI, Canva, Figma etc.)': 'equal',
    },
  },
  {
    label: 'Geen minimumafname',
    mensys: 'win',
    perConcurrent: {
      Actendo: 'equal',
      Centralpoint: 'equal',
      'Scholten Awater': 'lose',
      'Protinus IT': 'lose',
      'Vendor-direct (OpenAI, Canva, Figma etc.)': 'lose',
    },
  },
  {
    label: 'Factuurvaluta (euro, zonder USD)',
    mensys: 'win',
    perConcurrent: {
      Actendo: 'equal',
      Centralpoint: 'equal',
      'Scholten Awater': 'equal',
      'Protinus IT': 'equal',
      'Vendor-direct (OpenAI, Canva, Figma etc.)': 'lose',
    },
  },
  {
    label: 'Persoonlijk contact',
    mensys: 'win',
    perConcurrent: {
      Actendo: 'equal',
      Centralpoint: 'lose',
      'Scholten Awater': 'lose',
      'Protinus IT': 'lose',
      'Vendor-direct (OpenAI, Canva, Figma etc.)': 'lose',
    },
  },
  {
    label: 'Levertijd (snelheid)',
    mensys: 'equal',
    perConcurrent: {
      Actendo: 'equal',
      Centralpoint: 'win',
      'Scholten Awater': 'equal',
      'Protinus IT': 'lose',
      'Vendor-direct (OpenAI, Canva, Figma etc.)': 'win',
    },
  },
  {
    label: 'Zakelijke factuur NL',
    mensys: 'win',
    perConcurrent: {
      Actendo: 'equal',
      Centralpoint: 'equal',
      'Scholten Awater': 'equal',
      'Protinus IT': 'equal',
      'Vendor-direct (OpenAI, Canva, Figma etc.)': 'lose',
    },
  },
  {
    label: 'MKB-focus (1-50 FTE)',
    mensys: 'win',
    perConcurrent: {
      Actendo: 'equal',
      Centralpoint: 'equal',
      'Scholten Awater': 'lose',
      'Protinus IT': 'lose',
      'Vendor-direct (OpenAI, Canva, Figma etc.)': 'equal',
    },
  },
  {
    label: 'Tweedehands licenties',
    mensys: 'lose',
    perConcurrent: {
      Actendo: 'win',
      Centralpoint: 'lose',
      'Scholten Awater': 'lose',
      'Protinus IT': 'lose',
      'Vendor-direct (OpenAI, Canva, Figma etc.)': 'lose',
    },
  },
  {
    label: 'Online self-service',
    mensys: 'equal',
    perConcurrent: {
      Actendo: 'equal',
      Centralpoint: 'win',
      'Scholten Awater': 'equal',
      'Protinus IT': 'lose',
      'Vendor-direct (OpenAI, Canva, Figma etc.)': 'win',
    },
  },
];

const COMPETITORS_ORDER = [
  'Actendo',
  'Centralpoint',
  'Scholten Awater',
  'Protinus IT',
  'Vendor-direct (OpenAI, Canva, Figma etc.)',
];

function classFor(value, isMensys) {
  // For Mensys column: 'win' = Mensys voordeel (green), 'lose' = nadeel (red), 'equal' = grijs
  if (value === 'win') return isMensys ? styles.cellWin : styles.cellLose;
  if (value === 'lose') return isMensys ? styles.cellLose : styles.cellWin;
  return styles.cellEqual;
}

function textFor(value) {
  if (value === 'win') return 'Sterk';
  if (value === 'lose') return 'Zwak';
  return 'Gelijk';
}

export default function VerschilMatrix() {
  return (
    <div className={styles.wrap}>
      <p className={styles.intro}>
        Groen = Mensys heeft voordeel. Rood = concurrent heeft voordeel.
        Grijs = gelijkwaardig.
      </p>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.critHead}>Criterium</th>
              <th className={styles.mensysHead}>Mensys</th>
              {COMPETITORS_ORDER.map((name) => (
                <th key={name}>{shortName(name)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CRITERIA.map((row) => (
              <tr key={row.label}>
                <td className={styles.critCell}>{row.label}</td>
                <td className={classFor(row.mensys, true)}>{textFor(row.mensys)}</td>
                {COMPETITORS_ORDER.map((name) => (
                  <td key={name} className={classFor(row.perConcurrent[name] || 'equal', false)}>
                    {textFor(row.perConcurrent[name] || 'equal')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function shortName(name) {
  if (name.length <= 16) return name;
  return name.split(' ')[0];
}
