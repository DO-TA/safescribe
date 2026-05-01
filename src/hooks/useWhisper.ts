import { useRef, useState, useCallback } from 'react'
import { pipeline, type Pipeline } from '@xenova/transformers'
import { WHISPER_MODEL } from '../utils/constants'

let globalPipeRef: Pipeline | null = null
let globalListeners: Array<(ready: boolean) => void> = []

function notifyListeners(ready: boolean) {
  for (const fn of globalListeners) fn(ready)
}

function safeProgress(raw: unknown): number {
  if (raw == null) return 0
  const num = Number(raw)
  if (!isFinite(num) || num <= 0) return 0
  if (num > 1) return Math.min(100, Math.round(num))
  return Math.min(100, Math.round(num * 100))
}

export function useWhisper() {
  const pipeRef = useRef<Pipeline | null>(null)
  const [isReady, setIsReady] = useState(globalPipeRef !== null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (onProgress?: (p: number) => void) => {
    if (globalPipeRef) {
      pipeRef.current = globalPipeRef
      if (!isReady) setIsReady(true)
      return
    }
    if (pipeRef.current) return
    setIsLoading(true)
    setError(null)

    const timeout = setTimeout(() => {
      if (!globalPipeRef) {
        setError('Download timed out. Check your internet connection and try again.')
        setIsLoading(false)
      }
    }, 120000)

    try {
      globalPipeRef = await pipeline('automatic-speech-recognition', WHISPER_MODEL, {
        progress_callback: (progress: Record<string, unknown>) => {
          if (onProgress && progress != null) {
            onProgress(safeProgress(progress.progress))
          }
        },
      })
      clearTimeout(timeout)
      pipeRef.current = globalPipeRef
      setIsReady(true)
      notifyListeners(true)
    } catch (e) {
      clearTimeout(timeout)
      const msg = String(e)
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }, [isReady])

  const transcribe = useCallback(async (audio: Float32Array) => {
    const p = pipeRef.current || globalPipeRef
    if (!p) throw new Error('Whisper not loaded')
    const result = await p(audio, {
      chunk_length_s: 30,
      stride_length_s: 5,
      language: 'english',
      return_timestamps: false,
    })
    return result as { text: string }
  }, [])

  const transcribeWithTimestamps = useCallback(async (audio: Float32Array): Promise<{ text: string; chunks: { timestamp: [number, number]; text: string }[] }> => {
    const p = pipeRef.current || globalPipeRef
    if (!p) return { text: '', chunks: [] }
    const result = await p(audio, {
      chunk_length_s: 30,
      stride_length_s: 5,
      language: 'english',
      return_timestamps: true,
    }) as { text: string; chunks?: { timestamp: [number, number]; text: string }[] }
    return { text: result.text, chunks: result.chunks || [] }
  }, [])

  const unload = useCallback(() => {
    globalPipeRef = null
    pipeRef.current = null
    setIsReady(false)
    notifyListeners(false)
  }, [])

  return { load, transcribe, transcribeWithTimestamps, unload, isReady, isLoading, error }
}
