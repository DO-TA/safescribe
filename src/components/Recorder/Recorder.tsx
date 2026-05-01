import { useState, useRef } from 'react'
import { useRecorder } from '../../hooks/useRecorder'
import { blobToFloat32Array } from '../../utils/audio'

interface RecorderProps {
  onAudioReady: (audio: Float32Array) => void
  isProcessing: boolean
}

type Mode = 'record' | 'import'

export default function Recorder({ onAudioReady, isProcessing }: RecorderProps) {
  const [mode, setMode] = useState<Mode>('record')
  const { startRecording, stopRecording, isRecording, error } = useRecorder()
  const [elapsed, setElapsed] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleStartRecord = async () => {
    try {
      setElapsed(0)
      await startRecording()
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000)
    } catch {}
  }

  const handleStopRecord = async () => {
    if (timerRef.current) clearInterval(timerRef.current)
    try {
      const blob = await stopRecording()
      const audio = await blobToFloat32Array(blob)
      onAudioReady(audio)
    } catch {}
  }

  const [decodeError, setDecodeError] = useState<string | null>(null)

  const handleFilePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setDecodeError(null)
    try {
      const audio = await blobToFloat32Array(file)
      onAudioReady(audio)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setDecodeError(msg)
    }
  }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <div style={styles.container}>
      <div style={styles.tabRow}>
        <button
          onClick={() => setMode('record')}
          style={{ ...styles.tabBtn, ...(mode === 'record' ? styles.tabActive : {}) }}
        >
          🎙 Record
        </button>
        <button
          onClick={() => setMode('import')}
          style={{ ...styles.tabBtn, ...(mode === 'import' ? styles.tabActive : {}) }}
        >
          📁 Import File
        </button>
      </div>

      {mode === 'record' ? (
        <div style={styles.recordArea}>
          {isRecording ? (
            <div style={styles.recordingActive}>
              <div style={styles.pulse} />
              <span style={styles.elapsed}>{formatTime(elapsed)}</span>
              <button onClick={handleStopRecord} style={styles.stopBtn} disabled={isProcessing}>
                ⏹ Stop
              </button>
            </div>
          ) : (
            <button onClick={handleStartRecord} style={styles.recordBtn} disabled={isProcessing}>
              🎤
            </button>
          )}
          {error && <p style={styles.error}>{error}</p>}
        </div>
      ) : (
        <div style={styles.importArea}>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,video/*"
            onChange={handleFilePick}
            style={{ display: 'none' }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            style={styles.importBtn}
            disabled={isProcessing}
          >
            📂 Choose Audio File
          </button>
          <p style={styles.formats}>
            MP3, M4A, WAV, MP4, MOV, OGG, WebM, AAC, FLAC
          </p>
          {fileName && (
            <p style={styles.fileName}>Selected: {fileName}</p>
          )}
          {decodeError && (
            <p style={styles.error}>{decodeError}</p>
          )}
        </div>
      )}

      {isProcessing && (
        <div style={styles.processing}>
          <span style={styles.spinner} />
          <span>Transcribing...</span>
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  tabRow: {
    display: 'flex',
    gap: '4px',
    borderRadius: '10px',
    padding: '4px',
    background: 'var(--card)',
  },
  tabBtn: {
    flex: 1,
    padding: '8px',
    border: 'none',
    borderRadius: '8px',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--muted)',
    transition: 'all 0.2s',
  },
  tabActive: {
    background: 'var(--bg)',
    color: 'var(--text)',
  },
  recordArea: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '16px 0',
  },
  recordBtn: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    border: '3px solid var(--accent)',
    background: 'var(--card)',
    fontSize: '32px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingActive: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  pulse: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    background: 'rgba(239, 68, 68, 0.2)',
    animation: 'pulse 1.5s infinite',
  },
  elapsed: {
    fontSize: '16px',
    fontWeight: 600,
    color: 'var(--text)',
  },
  stopBtn: {
    padding: '8px 24px',
    borderRadius: '8px',
    border: 'none',
    background: 'var(--accent)',
    color: '#fff',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  importArea: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    padding: '16px 0',
  },
  importBtn: {
    padding: '12px 24px',
    borderRadius: '10px',
    border: '2px dashed var(--border)',
    background: 'var(--card)',
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--text)',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'center' as const,
  },
  formats: {
    fontSize: '11px',
    color: 'var(--muted)',
    margin: 0,
  },
  fileName: {
    fontSize: '12px',
    color: 'var(--accent)',
    margin: 0,
  },
  error: {
    fontSize: '12px',
    color: '#ef4444',
    margin: 0,
    textAlign: 'center' as const,
  },
  processing: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontSize: '13px',
    color: 'var(--muted)',
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid var(--border)',
    borderTop: '2px solid var(--accent)',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    display: 'inline-block',
  },
}
