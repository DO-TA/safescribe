import { useState, useEffect } from 'react'
import { useAppStore } from '../../stores/appStore'
import Recorder from '../Recorder/Recorder'
import { useWhisper } from '../../hooks/useWhisper'
import { useGemma } from '../../hooks/useGemma'
import { useTranscriptHistory } from '../../hooks/useTranscriptHistory'
import { exportTXT, exportSRT } from '../../utils/export'
import GemmaChat from '../GemmaChat/GemmaChat'

export default function Transcriber() {
  const { fontSize, gemmaEnabled, gemmaReady, setGemmaReady, setGemmaProgress } = useAppStore()
  const whisper = useWhisper()
  const gemma = useGemma()
  const { save } = useTranscriptHistory()

  const [transcript, setTranscript] = useState('')
  const [segments, setSegments] = useState<{ start: number; end: number; text: string }[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [title, setTitle] = useState('')
  const [showGemma, setShowGemma] = useState(false)
  const [savedId, setSavedId] = useState<number | null>(null)

  // Load Gemma engine if enabled and not ready
  useEffect(() => {
    if (gemmaEnabled && !gemmaReady && !gemma.isLoaded && !gemma.isLoading) {
      gemma.load((p) => {
        setGemmaProgress(p)
        if (p >= 100) setGemmaReady(true)
      })
    }
  }, [gemmaEnabled])

  const handleAudioReady = async (audio: Float32Array) => {
    setIsProcessing(true)
    setTranscript('')
    setSegments([])
    setTitle('')
    setSavedId(null)
    setShowGemma(false)
    try {
      await whisper.load()
      const result = await whisper.transcribe(audio)
      setTranscript(result.text)
      const segs = (result.chunks || []).map((c) => ({
        start: c.timestamp[0],
        end: c.timestamp[1],
        text: c.text,
      }))
      setSegments(segs)
      const firstWords = result.text.slice(0, 50).replace(/\n/g, ' ')
      setTitle(firstWords.length > 50 ? firstWords + '...' : firstWords)
    } catch (e) {
      setTranscript(`Error: ${e}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSave = async () => {
    if (!transcript.trim()) return
    const id = await save({
      title: title || 'Untitled',
      text: transcript,
      segments: segments.length > 0 ? segments : undefined,
      createdAt: Date.now(),
    })
    setSavedId(id as number)
  }

  return (
    <div style={{ ...styles.container, fontSize: `${fontSize}px` }}>
      <Recorder onAudioReady={handleAudioReady} isProcessing={isProcessing} />

      {transcript && (
        <div style={styles.resultCard}>
          <div style={styles.resultHeader}>
            <span style={styles.badge}>📝 Transcript</span>
            <div style={styles.actions}>
              <button onClick={() => exportTXT(transcript, title)} style={styles.actionBtn} title="Download TXT">
                📄 TXT
              </button>
              {segments.length > 0 && (
                <button onClick={() => exportSRT(segments, title)} style={styles.actionBtn} title="Download SRT">
                  💬 SRT
                </button>
              )}
              <button onClick={handleSave} style={styles.actionBtn} title="Save to history">
                💾 Save
              </button>
            </div>
          </div>
          {savedId && <p style={styles.savedNote}>✅ Saved to history</p>}
          <div style={styles.transcriptText}>
            {transcript}
          </div>

          {gemmaEnabled && (
            <button onClick={() => setShowGemma(!showGemma)} style={styles.aiBtn}>
              {showGemma ? '🤖 Hide AI' : '🤖 AI Summarize & Chat'}
            </button>
          )}
        </div>
      )}

      {showGemma && gemmaEnabled && transcript && (
        <GemmaChat
          transcript={transcript}
          gemma={gemma}
        />
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    lineHeight: 1.6,
  },
  resultCard: {
    padding: '16px',
    borderRadius: '12px',
    background: 'var(--card)',
    border: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  resultHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '8px',
  },
  badge: {
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--accent)',
  },
  actions: {
    display: 'flex',
    gap: '6px',
  },
  actionBtn: {
    padding: '4px 10px',
    borderRadius: '6px',
    border: '1px solid var(--border)',
    background: 'var(--bg)',
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: 500,
    color: 'var(--text)',
  },
  savedNote: {
    fontSize: '12px',
    color: '#22c55e',
    margin: 0,
  },
  transcriptText: {
    fontSize: '1em',
    color: 'var(--text)',
    whiteSpace: 'pre-wrap',
    lineHeight: 1.7,
  },
  aiBtn: {
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid var(--accent)',
    background: 'transparent',
    color: 'var(--accent)',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
}
