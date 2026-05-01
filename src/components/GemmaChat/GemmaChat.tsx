import { useState } from 'react'
import { useGemma } from '../../hooks/useGemma'

interface Props {
  transcript: string
  gemma: ReturnType<typeof useGemma>
}

export default function GemmaChat({ transcript, gemma }: Props) {
  const [tab, setTab] = useState<'summary' | 'chat'>('summary')
  const [summary, setSummary] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)

  const handleSummarize = async () => {
    setIsGenerating(true)
    try {
      const result = await gemma.summarize(transcript)
      setSummary(result)
    } catch (e) {
      setSummary(`Error: ${e}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleChat = async () => {
    if (!chatInput.trim()) return
    const userMsg = chatInput.trim()
    setChatInput('')
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }])
    setChatLoading(true)
    try {
      const result = await gemma.chat(transcript, userMsg)
      setMessages((prev) => [...prev, { role: 'ai', text: result }])
    } catch (e) {
      setMessages((prev) => [...prev, { role: 'ai', text: `Error: ${e}` }])
    } finally {
      setChatLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.tabRow}>
        <button
          onClick={() => setTab('summary')}
          style={{ ...styles.tabBtn, ...(tab === 'summary' ? styles.tabActive : {}) }}
        >
          📋 Summary
        </button>
        <button
          onClick={() => setTab('chat')}
          style={{ ...styles.tabBtn, ...(tab === 'chat' ? styles.tabActive : {}) }}
        >
          💬 Chat
        </button>
      </div>

      {tab === 'summary' && (
        <div style={styles.summaryArea}>
          {!summary ? (
            <button onClick={handleSummarize} style={styles.genBtn} disabled={isGenerating}>
              {isGenerating ? '⏳ Generating...' : '✨ Generate Summary'}
            </button>
          ) : (
            <div style={styles.summaryText}>{summary}</div>
          )}
        </div>
      )}

      {tab === 'chat' && (
        <div style={styles.chatArea}>
          <div style={styles.chatMessages}>
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  ...styles.message,
                  ...(m.role === 'user' ? styles.userMsg : styles.aiMsg),
                }}
              >
                <span style={styles.msgLabel}>{m.role === 'user' ? 'You' : 'AI'}</span>
                <span>{m.text}</span>
              </div>
            ))}
            {chatLoading && <span style={styles.loading}>AI is thinking...</span>}
            {messages.length === 0 && (
              <p style={styles.chatEmpty}>Ask a question about the transcript</p>
            )}
          </div>
          <div style={styles.chatInputRow}>
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleChat()}
              placeholder="Ask about the transcript..."
              style={styles.chatInput}
              disabled={chatLoading}
            />
            <button onClick={handleChat} style={styles.sendBtn} disabled={chatLoading}>
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '16px',
    borderRadius: '12px',
    background: 'var(--card)',
    border: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  tabRow: {
    display: 'flex',
    gap: '4px',
    borderRadius: '8px',
    padding: '3px',
    background: 'var(--bg)',
  },
  tabBtn: {
    flex: 1,
    padding: '6px',
    border: 'none',
    borderRadius: '6px',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 500,
    color: 'var(--muted)',
  },
  tabActive: {
    background: 'var(--card)',
    color: 'var(--accent)',
  },
  summaryArea: {
    minHeight: '60px',
  },
  genBtn: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    background: 'var(--accent)',
    color: '#fff',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    width: '100%',
  },
  summaryText: {
    fontSize: '0.95em',
    color: 'var(--text)',
    lineHeight: 1.6,
    whiteSpace: 'pre-wrap',
  },
  chatArea: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    minHeight: '150px',
  },
  chatMessages: {
    flex: 1,
    maxHeight: '250px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  message: {
    padding: '8px 12px',
    borderRadius: '10px',
    fontSize: '0.9em',
    lineHeight: 1.5,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  userMsg: {
    background: 'var(--accent)',
    color: '#fff',
    alignSelf: 'flex-end',
    borderBottomRightRadius: '4px',
  },
  aiMsg: {
    background: 'var(--bg)',
    color: 'var(--text)',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: '4px',
  },
  msgLabel: {
    fontSize: '10px',
    fontWeight: 600,
    opacity: 0.7,
  },
  chatEmpty: {
    fontSize: '12px',
    color: 'var(--muted)',
    textAlign: 'center',
    margin: 'auto',
  },
  loading: {
    fontSize: '12px',
    color: 'var(--muted)',
    textAlign: 'center',
  },
  chatInputRow: {
    display: 'flex',
    gap: '6px',
  },
  chatInput: {
    flex: 1,
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    background: 'var(--bg)',
    color: 'var(--text)',
    fontSize: '13px',
    outline: 'none',
  },
  sendBtn: {
    padding: '8px 14px',
    borderRadius: '8px',
    border: 'none',
    background: 'var(--accent)',
    color: '#fff',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
  },
}
