import { BUY_ME_COFFEE_URL } from '../../utils/constants'
import { useAppStore } from '../../stores/appStore'

export default function DonateButton() {
  const { activeTab } = useAppStore()

  const isActive = activeTab === 'transcribe'
  if (!isActive) return null

  return (
    <a
      href={BUY_ME_COFFEE_URL}
      target="_blank"
      rel="noopener noreferrer"
      style={styles.link}
      title="Support SafeScribe"
    >
      <span style={styles.text}>☕️ Support SafeScribe</span>
    </a>
  )
}

const styles: Record<string, React.CSSProperties> = {
  link: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '8px',
    background: 'var(--card)',
    borderTop: '1px solid var(--border)',
    borderBottom: '1px solid var(--border)',
    textDecoration: 'none',
    fontSize: '12px',
    color: 'var(--muted)',
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'opacity 0.2s',
  },
  text: {
    opacity: 0.7,
  },
}
