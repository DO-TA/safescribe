import { createContext, useContext, useState, type ReactNode } from 'react'

interface AppState {
  whisperReady: boolean
  gemmaReady: boolean
  darkMode: boolean
  fontSize: number
  proLicense: string | null
  activeTab: string
  whisperProgress: number
  gemmaProgress: number
  gemmaEnabled: boolean
}

interface AppStore extends AppState {
  setWhisperReady: (v: boolean) => void
  setGemmaReady: (v: boolean) => void
  setDarkMode: (v: boolean) => void
  setFontSize: (v: number) => void
  setProLicense: (v: string | null) => void
  setActiveTab: (v: string) => void
  setWhisperProgress: (v: number) => void
  setGemmaProgress: (v: number) => void
  setGemmaEnabled: (v: boolean) => void
}

const Store = createContext<AppStore | null>(null)

function loadStored(key: string, def: unknown) {
  try {
    const v = localStorage.getItem(key)
    return v !== null ? JSON.parse(v) : def
  } catch {
    return def
  }
}

function saveStored(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [whisperReady, setWhisperReady] = useState(false)
  const [gemmaReady, setGemmaReady] = useState(false)
  const [darkMode, setDarkModeState] = useState(() => loadStored('darkMode', true))
  const [fontSize, setFontSizeState] = useState(() => loadStored('fontSize', 16))
  const [proLicense, setProLicenseState] = useState<string | null>(() => loadStored('proLicense', null))
  const [activeTab, setActiveTab] = useState('transcribe')
  const [whisperProgress, setWhisperProgress] = useState(0)
  const [gemmaProgress, setGemmaProgress] = useState(0)
  const [gemmaEnabled, setGemmaEnabledState] = useState(() => loadStored('gemmaEnabled', false))

  const setDarkMode = (v: boolean) => {
    setDarkModeState(v)
    saveStored('darkMode', v)
  }
  const setFontSize = (v: number) => {
    setFontSizeState(v)
    saveStored('fontSize', v)
  }
  const setProLicense = (v: string | null) => {
    setProLicenseState(v)
    saveStored('proLicense', v)
  }
  const setGemmaEnabled = (v: boolean) => {
    setGemmaEnabledState(v)
    saveStored('gemmaEnabled', v)
  }

  return (
    <Store.Provider
      value={{
        whisperReady, gemmaReady, darkMode, fontSize, proLicense, activeTab,
        whisperProgress, gemmaProgress, gemmaEnabled,
        setWhisperReady, setGemmaReady, setDarkMode, setFontSize, setProLicense,
        setActiveTab, setWhisperProgress, setGemmaProgress, setGemmaEnabled,
      }}
    >
      {children}
    </Store.Provider>
  )
}

export function useAppStore() {
  const ctx = useContext(Store)
  if (!ctx) throw new Error('useAppStore must be inside AppStoreProvider')
  return ctx
}
