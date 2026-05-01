import { AppStoreProvider, useAppStore } from './stores/appStore'
import AppShell from './components/Layout/AppShell'

function ThemedApp() {
  const { darkMode, fontSize } = useAppStore()

  return (
    <div
      data-theme={darkMode ? 'dark' : 'light'}
      style={{ fontSize: `${fontSize}px` }}
    >
      <AppShell />
    </div>
  )
}

export default function App() {
  return (
    <AppStoreProvider>
      <ThemedApp />
    </AppStoreProvider>
  )
}
