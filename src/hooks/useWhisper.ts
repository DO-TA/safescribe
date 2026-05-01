import { useRef, useState, useCallback } from 'react'
import { pipeline, env, type Pipeline } from '@xenova/transformers'
import { WHISPER_MODEL } from '../utils/constants'

// Configure ONNX for maximum compatibility
env.backends.onnx.wasm.numThreads = 1
env.backends.onnx.wasm.simd = false
env.backends.onnx.wasm.proxy = false
env.allowLocalModels = false

let globalPipeRef: Pipeline | null = null

function safeProgress(raw: unknown): number {
  if (raw == null) return 0
  const num = Number(raw)
  if (!isFinite(num) || num < 0) return 0
  if (num <= 1) return Math.min(100, Math.round(num * 100))
  return Math.min(100, Math.round(num))
}

const MAX_SAMPLES = 30 * 16000 // 30 seconds at 16kHz

export function useWhisper() {
  const pipeRef = useRef<Pipeline | null>(null)
  const [isReady, setIsReady] = useState(globalPipeRef !== null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [statusText, setStatusText] = useState('')

  const load = useCallback(async (onProgress?: (p: number) => void) => {
    if (globalPipeRef) {
      pipeRef.current = globalPipeRef
      setIsReady(true)
      return
    }
    if (isLoading) return
    setIsLoading(true)
    setError(null)
    setStatusText('Downloading model (~75 MB)...')

    try {
      globalPipeRef = await pipeline('automatic-speech-recognition', WHISPER_MODEL, {
        quantized: true,
        progress_callback: (progress: Record<string, unknown>) => {
          const p = safeProgress(progress.progress)
          if (onProgress) onProgress(p)
          if (p < 100) {
            setStatusText(`Downloading model... ${p}%`)
          } else {
            setStatusText('Loading model into memory...')
          }
        },
      })
      pipeRef.current = globalPipeRef
      setIsReady(true)
      setStatusText('Ready')
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      setError(msg)
      setStatusText('')
      throw e
    } finally {
      setIsLoading(false)
    }
  }, [isLoading])

  const transcribe = useCallback(async (audio: Float32Array): Promise<{ text: string; wasTruncated: boolean }> => {
    const p = pipeRef.current || globalPipeRef
    if (!p) throw new Error('Whisper not loaded')

    // Whisper has a 30-second context window
    const wasTruncated = audio.length > MAX_SAMPLES
    const audioToProcess = wasTruncated ? audio.slice(0, MAX_SAMPLES) : audio

    const result = await p(audioToProcess, {
      language: 'english',
      return_timestamps: false,
    })

    return {
      text: (result as { text: string }).text || '',
      wasTruncated,
    }
  }, [])

  const unload = useCallback(() => {
    globalPipeRef = null
    pipeRef.current = null
    setIsReady(false)
  }, [])

  return { load, transcribe, unload, isReady, isLoading, error, statusText }
}
