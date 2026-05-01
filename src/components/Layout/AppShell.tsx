import { useAppStore } from '../../stores/appStore'
import Header from './Header'
import TabBar from './TabBar'
import ModelDownloader from '../ModelDownloader/ModelDownloader'
import Transcriber from '../Transcriber/Transcriber'
import HistoryView from '../History/HistoryView'
import SettingsView from '../Settings/SettingsView'
import DonateButton from '../common/DonateButton'

export default function AppShell() {
  const { activeTab, whisperReady } = useAppStore()

  if (!whisperReady) {
    return (
      <div style={{ ...styles.shell, ...(whisperReady ? {} : {}) } as React.CSSProperties}>
        <ModelDownloader />
      </div>
    )
  }

  return (
    <div style={styles.shell}>
      <Header />
      <main style={styles.main}>
        {activeTab === 'transcribe' && <Transcriber />}
        {activeTab === 'history' && <HistoryView />}
        {activeTab === 'settings' && <SettingsView />}
      </main>
      <DonateButton />
      <TabBar />
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  shell: {
    display: 'flex',
    flexDirection: 'column',
    height: '100dvh',
    maxWidth: '480px',
    margin: '0 auto',
    background: 'var(--bg)',
    color: 'var(--text)',
  },
  main: {
    flex: 1,
    overflow: 'auto',
    padding: '16px',
  },
}
