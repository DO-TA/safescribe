export default function PrivacyBadge() {
  return (
    <div style={styles.badge}>
      <span style={styles.shield}>🔒</span>
      <span style={styles.text}>100% On-Device</span>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  badge: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 10px',
    borderRadius: '20px',
    background: 'rgba(34, 197, 94, 0.15)',
    border: '1px solid rgba(34, 197, 94, 0.3)',
    fontSize: '11px',
    fontWeight: 600,
    color: '#22c55e',
  },
  shield: {
    fontSize: '12px',
  },
  text: {
    whiteSpace: 'nowrap',
  },
}
