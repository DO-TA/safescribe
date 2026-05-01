import PrivacyBadge from '../common/PrivacyBadge'

export default function Header() {
  return (
    <header style={styles.header}>
      <div style={styles.left}>
        <span style={styles.logo}>🛡️</span>
        <span style={styles.title}>SafeScribe</span>
      </div>
      <PrivacyBadge />
    </header>
  )
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    paddingTop: 'calc(env(safe-area-inset-top) + 12px)',
    borderBottom: '1px solid var(--border)',
    background: 'var(--card)',
    flexShrink: 0,
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  logo: {
    fontSize: '24px',
  },
  title: {
    fontSize: '18px',
    fontWeight: 700,
    color: 'var(--text)',
  },
}
