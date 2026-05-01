import { useState, useEffect } from 'react'
import { getModelStatus, setModelStatus } from '../utils/db'

export function useModelDownloader() {
  const [whisperProgress, setWhisperProgress] = useState(0)
  const [gemmaProgress, setGemmaProgress] = useState(0)
  const [whisperReady, setWhisperReady] = useState(false)
  const [gemmaReady, setGemmaReady] = useState(false)
  const [gemmaEnabled, setGemmaEnabled] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    (async () => {
      const w = await getModelStatus('whisper')
      const g = await getModelStatus('gemma')
      if (w) {
        setWhisperReady(w.downloaded)
        setWhisperProgress(w.progress)
      }
      if (g) {
        setGemmaReady(g.downloaded)
        setGemmaProgress(g.progress)
      }
      setLoaded(true)
    })()
  }, [])

  const updateWhisper = async (progress: number, ready?: boolean) => {
    const r = ready ?? (progress >= 100)
    setWhisperProgress(progress)
    setWhisperReady(r)
    await setModelStatus('whisper', { downloaded: r, progress })
  }

  const updateGemma = async (progress: number, ready?: boolean) => {
    const r = ready ?? (progress >= 100)
    setGemmaProgress(progress)
    setGemmaReady(r)
    await setModelStatus('gemma', { downloaded: r, progress })
  }

  const toggleGemma = (v: boolean) => {
    setGemmaEnabled(v)
    if (!v) {
      setGemmaProgress(0)
      setGemmaReady(false)
      setModelStatus('gemma', { downloaded: false, progress: 0 })
    }
  }

  return {
    whisperProgress, gemmaProgress,
    whisperReady, gemmaReady, gemmaEnabled,
    loaded,
    updateWhisper, updateGemma, toggleGemma,
  }
}
