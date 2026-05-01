import { useRef, useState, useCallback } from 'react'
import { pipeline, type Pipeline } from '@xenova/transformers'
import { WHISPER_MODEL } from '../utils/constants'

export function useWhisper() {
  const pipeRef = useRef<Pipeline | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (onProgress?: (p: number) => void) => {
    if (pipeRef.current) return
    setIsLoading(true)
    setError(null)
    try {
      pipeRef.current = await pipeline('automatic-speech-recognition', WHISPER_MODEL, {
        progress_callback: (progress: { status?: string; progress?: number }) => {
          if (progress.status === 'progress' && progress.progress != null && onProgress) {
            onProgress(Math.round(progress.progress * 100))
          }
        },
      })
      setIsReady(true)
    } catch (e) {
      setError(String(e))
    } finally {
      setIsLoading(false)
    }
  }, [])

  const transcribe = useCallback(async (audio: Float32Array) => {
    if (!pipeRef.current) throw new Error('Whisper not loaded')
    const result = await pipeRef.current(audio, {
      return_timestamps: true,
      language: 'english',
    })
    return result as { text: string; chunks?: { timestamp: [number, number]; text: string }[] }
  }, [])

  const unload = useCallback(() => {
    pipeRef.current = null
    setIsReady(false)
  }, [])

  return { load, transcribe, unload, isReady, isLoading, error }
}
