import { useEffect, useState } from 'react'
import { useAppStore } from '../../stores/appStore'
import { useModelDownloader } from '../../hooks/useModelDownloader'
import { useWhisper } from '../../hooks/useWhisper'
import PrivacyBadge from '../common/PrivacyBadge'

export default function ModelDownloader() {
  const { setWhisperReady, setWhisperProgress, setGemmaEnabled, gemmaEnabled } = useAppStore()
  const whisper = useWhisper()
  const dl = useModelDownloader()
  const [downloadError, setDownloadError] = useState<string | null>(null)

  const startDownload = () => {
    setDownloadError(null)
    if (!dl.whisperReady) {
      whisper.load((p) => {
        dl.updateWhisper(p)
        setWhisperProgress(p)
      }).then(() => {
        dl.updateWhisper(100, true)
        setWhisperProgress(100)
        setWhisperReady(true)
      }).catch((e) => {
        setDownloadError(String(e))
      })
    }
  }

  useEffect(() => {
    if (dl.loaded && !dl.whisperReady) {
      startDownload()
    }
  }, [dl.loaded])

  const handleGemmaToggle = () => {
    setGemmaEnabled(!gemmaEnabled)
    dl.toggleGemma(!gemmaEnabled)
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
          <div style={styles.barOuter}>
            <div style={{ ...styles.barInner, width: `${dl.whisperProgress}%` }} />
          </div>
          <span style={styles.status}>
            {whisper.error || downloadError ? (
              <span style={styles.errorText}>
                ❌ Download failed. Check your internet connection.
              </span>
            ) : whisper.isLoading ? (
              `Downloading... ${dl.whisperProgress}%`
            ) : dl.whisperReady ? (
              '✅ Ready'
            ) : (
              'Starting download...'
            )}
          </span>
          {(whisper.error || downloadError) && (
            <button onClick={startDownload} style={styles.retryBtn}>
              🔄 Retry Download
            </button>
          )}
        </div>

        <div style={styles.section}>
          <div style={styles.row}>
            <span>🤖 AI Summarization (Gemma 2B)</span>
            <span style={styles.size}>~1.2 GB</span>
          </div>
          <label style={styles.toggleRow}>
            <span>Enable AI features (optional)</span>
            <input
              type="checkbox"
              checked={gemmaEnabled}
              onChange={handleGemmaToggle}
              style={styles.toggle}
            />
          </label>
          {gemmaEnabled && (
            <>
              <div style={styles.barOuter}>
                <div style={{ ...styles.barInner, width: `${dl.gemmaProgress}%` }} />
              </div>
              <span style={styles.status}>
                {dl.gemmaProgress > 0 && dl.gemmaProgress < 100
                  ? `Downloading... ${dl.gemmaProgress}%`
                  : dl.gemmaReady
                  ? '✅ Ready'
                  : 'Download will start automatically'}
              </span>
            </>
          )}
        </div>

        {dl.whisperReady && (
          <p style={styles.hint}>
            {gemmaEnabled && !dl.gemmaReady
              ? 'You can start transcribing while Gemma downloads in the background.'
              : 'Ready to transcribe!'}
          </p>
        )}
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
    gap: '6px',
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
  toggleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '13px',
    color: 'var(--text)',
    cursor: 'pointer',
  },
  toggle: { width: '20px', height: '20px', cursor: 'pointer' },
  hint: { fontSize: '12px', color: 'var(--muted)', textAlign: 'center', margin: 0 },
  retryBtn: {
    padding: '8px 16px',
    borderRadius: '8px',
    border: '1px solid var(--accent)',
    background: 'transparent',
    color: 'var(--accent)',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
  },
}
