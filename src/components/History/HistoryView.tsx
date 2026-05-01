import { useState, useEffect } from 'react'
import { useTranscriptHistory } from '../../hooks/useTranscriptHistory'

export default function HistoryView() {
  const { items, loaded, search, remove, refresh } = useTranscriptHistory()
  const [query, setQuery] = useState('')

  useEffect(() => {
    refresh()
  }, [])

  const handleSearch = (q: string) => {
    setQuery(q)
    search(q)
  }

  const formatDate = (ts: number) => {
    const d = new Date(ts)
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (!loaded) return <p style={styles.loading}>Loading...</p>

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📋 History</h2>

      <input
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search transcripts..."
        style={styles.search}
      />

      <div style={styles.list}>
        {items.length === 0 && (
          <p style={styles.empty}>
            {query ? 'No matching transcripts.' : 'No transcripts yet. Start transcribing!'}
          </p>
        )}

        {items.map((item) => (
          <div key={item.id} style={styles.card}>
            <div style={styles.cardTop}>
              <span style={styles.cardTitle}>{item.title || 'Untitled'}</span>
              <button
                onClick={() => item.id !== undefined && remove(item.id)}
                style={styles.deleteBtn}
                title="Delete"
              >
                🗑
              </button>
            </div>
            <span style={styles.cardDate}>{formatDate(item.createdAt)}</span>
            <p style={styles.cardPreview}>
              {item.text.slice(0, 120)}
              {item.text.length > 120 ? '...' : ''}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  title: {
    fontSize: '18px',
    fontWeight: 700,
    margin: 0,
    color: 'var(--text)',
  },
  search: {
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1px solid var(--border)',
    background: 'var(--card)',
    color: 'var(--text)',
    fontSize: '14px',
    outline: 'none',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  card: {
    padding: '12px',
    borderRadius: '10px',
    background: 'var(--card)',
    border: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: 'var(--text)',
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  cardDate: {
    fontSize: '11px',
    color: 'var(--muted)',
  },
  cardPreview: {
    fontSize: '12px',
    color: 'var(--muted)',
    margin: 0,
    lineHeight: 1.5,
  },
  deleteBtn: {
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '2px',
    opacity: 0.6,
  },
  loading: {
    color: 'var(--muted)',
    textAlign: 'center',
  },
  empty: {
    color: 'var(--muted)',
    textAlign: 'center',
    fontSize: '13px',
  },
}
