import { useAppStore } from '../../stores/appStore'

const tabs = [
  { id: 'transcribe', label: 'Transcribe', icon: '🎤' },
  { id: 'history', label: 'History', icon: '📋' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
]

export default function TabBar() {
  const { activeTab, setActiveTab } = useAppStore()

  return (
    <nav style={styles.nav}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          style={{
            ...styles.tab,
            ...(activeTab === tab.id ? styles.tabActive : {}),
          }}
        >
          <span style={styles.icon}>{tab.icon}</span>
          <span style={styles.label}>{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}

const styles: Record<string, React.CSSProperties> = {
  nav: {
    display: 'flex',
    borderTop: '1px solid var(--border)',
    background: 'var(--card)',
    paddingBottom: 'env(safe-area-inset-bottom)',
    flexShrink: 0,
  },
  tab: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
    padding: '8px 0',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    color: 'var(--muted)',
    fontSize: '11px',
    transition: 'color 0.2s',
  },
  tabActive: {
    color: 'var(--accent)',
  },
  icon: {
    fontSize: '20px',
    lineHeight: 1,
  },
  label: {
    fontWeight: 500,
  },
}
