import { useState } from 'react'
import { useAppStore } from '../../stores/appStore'
import { useWhisper } from '../../hooks/useWhisper'
import PrivacyBadge from '../common/PrivacyBadge'

export default function ModelDownloader() {
  const { setWhisperReady, setWhisperProgress } = useAppStore()
  const whisper = useWhisper()
  const [progress, setProgress] = useState(0)
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const [hasStarted, setHasStarted] = useState(false)

  const startDownload = async () => {
    setDownloadError(null)
    setHasStarted(true)
    try {
      await whisper.load((p) => {
        setProgress(p)
        setWhisperProgress(p)
      })
      setProgress(100)
      setWhisperProgress(100)
      setWhisperReady(true)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      setDownloadError(msg)
    }
  }

  const handleSkip = () => {
    setWhisperReady(true)
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>🛡️</div>
        <h1 style={styles.title}>SafeScribe</h1>
        <p style={styles.subtitle}>Private on-device AI transcription</p>
        <PrivacyBadge />

        <div style={styles.section}>
          <div style={styles.row}>
            <span>🎤 Speech Recognition (Whisper)</span>
            <span style={styles.size}>~75 MB</span>
          </div>

          {hasStarted && (
            <>
              <div style={styles.barOuter}>
                <div style={{ ...styles.barInner, width: `${progress}%` }} />
              </div>
              <span style={styles.status}>
                {downloadError ? (
                  <span style={styles.errorText}>❌ {downloadError}</span>
                ) : whisper.isLoading ? (
                  <span>{whisper.statusText}</span>
                ) : progress >= 100 ? (
                  '✅ Ready'
                ) : (
                  'Starting...'
                )}
              </span>
            </>
          )}

          {downloadError && (
            <div style={styles.errorBox}>
              <p style={{ margin: '0 0 8px 0', fontSize: '12px' }}>
                The model failed to load. This usually happens because:
              </p>
              <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '11px' }}>
                <li>Your browser blocks large downloads (Brave, Safari)</li>
                <li>You're on a slow connection</li>
                <li>Your device doesn't support WebAssembly</li>
              </ul>
            </div>
          )}

          <div style={styles.buttonRow}>
            {!hasStarted ? (
              <button onClick={startDownload} style={styles.primaryBtn}>
                📥 Download Model
              </button>
            ) : downloadError ? (
              <>
                <button onClick={startDownload} style={styles.primaryBtn}>
                  🔄 Retry
                </button>
                <button onClick={handleSkip} style={styles.secondaryBtn}>
                  ⏭️ Skip for now
                </button>
              </>
            ) : whisper.isLoading ? (
              <button onClick={handleSkip} style={styles.secondaryBtn}>
                ⏭️ Skip for now
              </button>
            ) : null}
          </div>
        </div>

        <div style={styles.section}>
          <div style={styles.row}>
            <span>🤖 AI Summarization (Gemma 2B)</span>
            <span style={styles.size}>~1.2 GB</span>
          </div>
          <p style={styles.hint}>
            Optional. You can enable this later in Settings after Whisper is downloaded.
          </p>
        </div>

        <p style={styles.footer}>
          💡 Tip: The model downloads once and works offline forever.
        </p>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100dvh',
    padding: '24px 16px',
    background: 'var(--bg)',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    maxWidth: '400px',
    padding: '32px 24px',
    borderRadius: '16px',
    background: 'var(--card)',
    border: '1px solid var(--border)',
  },
  logo: { fontSize: '48px' },
  title: { fontSize: '24px', fontWeight: 700, margin: 0, color: 'var(--text)' },
  subtitle: { fontSize: '14px', color: 'var(--muted)', margin: 0 },
  section: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '12px 0',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '14px',
    color: 'var(--text)',
  },
  size: { fontSize: '12px', color: 'var(--muted)' },
  barOuter: {
    width: '100%',
    height: '6px',
    borderRadius: '3px',
    background: 'var(--bg)',
    overflow: 'hidden',
  },
  barInner: {
    height: '100%',
    borderRadius: '3px',
    background: 'var(--accent)',
    transition: 'width 0.3s',
  },
  status: { fontSize: '12px', color: 'var(--muted)' },
  errorText: { color: '#ef4444' },
  errorBox: {
    padding: '10px',
    borderRadius: '8px',
    background: 'rgba(239, 68, 68, 0.05)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    color: 'var(--text)',
  },
  buttonRow: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  primaryBtn: {
    flex: 1,
    padding: '12px',
    borderRadius: '10px',
    border: 'none',
    background: 'var(--accent)',
    color: '#fff',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    minWidth: '140px',
  },
  secondaryBtn: {
    flex: 1,
    padding: '12px',
    borderRadius: '10px',
    border: '1px solid var(--border)',
    background: 'var(--bg)',
    color: 'var(--text)',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    minWidth: '140px',
  },
  hint: {
    fontSize: '12px',
    color: 'var(--muted)',
    margin: 0,
  },
  footer: {
    fontSize: '11px',
    color: 'var(--muted)',
    textAlign: 'center',
    margin: 0,
  },
}
