import { useAppStore } from '../../stores/appStore'
import { BUY_ME_COFFEE_URL, APP_NAME, APP_VERSION } from '../../utils/constants'

export default function SettingsView() {
  const {
    darkMode, setDarkMode,
    fontSize, setFontSize,
    gemmaEnabled, setGemmaEnabled,
    whisperReady,
  } = useAppStore()

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>⚙️ Settings</h2>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Appearance</h3>
        <label style={styles.row}>
          <span>Dark Mode</span>
          <input
            type="checkbox"
            checked={darkMode}
            onChange={() => setDarkMode(!darkMode)}
            style={styles.toggle}
          />
        </label>
        <div style={styles.row}>
          <span>Font Size: {fontSize}px</span>
          <input
            type="range"
            min={12}
            max={24}
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            style={styles.slider}
          />
        </div>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Models</h3>
        <div style={styles.row}>
          <span>🎤 Whisper (Speech Recognition)</span>
          <span style={whisperReady ? styles.statusOk : styles.statusPending}>
            {whisperReady ? 'Downloaded' : 'Not Downloaded'}
          </span>
        </div>
        <label style={styles.row}>
          <span>🤖 Gemma (AI Summarization) — ~1.2 GB</span>
          <input
            type="checkbox"
            checked={gemmaEnabled}
            onChange={() => setGemmaEnabled(!gemmaEnabled)}
            style={styles.toggle}
          />
        </label>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>About</h3>
        <div style={styles.row}>
          <span>App</span>
          <span style={styles.value}>{APP_NAME} v{APP_VERSION}</span>
        </div>
        <div style={styles.row}>
          <span>Privacy</span>
          <span style={styles.statusOk}>100% On-Device</span>
        </div>
        <a
          href={BUY_ME_COFFEE_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={styles.donateLink}
        >
          ☕️ Support SafeScribe
        </a>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  title: {
    fontSize: '18px',
    fontWeight: 700,
    margin: 0,
    color: 'var(--text)',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '14px',
    borderRadius: '12px',
    background: 'var(--card)',
    border: '1px solid var(--border)',
  },
  sectionTitle: {
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--muted)',
    margin: 0,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '14px',
    color: 'var(--text)',
    gap: '8px',
  },
  toggle: {
    width: '20px',
    height: '20px',
    cursor: 'pointer',
  },
  slider: {
    width: '120px',
  },
  statusOk: {
    fontSize: '12px',
    color: '#22c55e',
    fontWeight: 500,
  },
  statusPending: {
    fontSize: '12px',
    color: 'var(--muted)',
  },
  value: {
    fontSize: '12px',
    color: 'var(--muted)',
  },
  donateLink: {
    padding: '10px',
    borderRadius: '8px',
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    textAlign: 'center' as const,
    textDecoration: 'none',
    color: 'var(--text)',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
  },
}
