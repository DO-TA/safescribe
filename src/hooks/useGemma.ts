import { useRef, useState, useCallback } from 'react'
import { GEMMA_MODEL } from '../utils/constants'

export function useGemma() {
  const engineRef = useRef<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (onProgress?: (p: number) => void) => {
    if (isLoaded) return
    setIsLoading(true)
    setError(null)
    try {
      const { CreateMLCEngine } = await import('@mlc-ai/web-llm')
      engineRef.current = await CreateMLCEngine(GEMMA_MODEL, {
        initProgressCallback: (progress: { progress?: number }) => {
          if (progress.progress != null && onProgress) {
            onProgress(Math.round(progress.progress * 100))
          }
        },
      })
      setIsLoaded(true)
    } catch (e) {
      setError(String(e))
    } finally {
      setIsLoading(false)
    }
  }, [isLoaded])

  const summarize = useCallback(async (transcript: string): Promise<string> => {
    if (!engineRef.current) throw new Error('Gemma not loaded')
    const reply = await engineRef.current.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant. Summarize the following transcript concisely. Focus on key points and action items.',
        },
        { role: 'user', content: `Summarize this transcript:\n\n${transcript}` },
      ],
    })
    return reply.choices[0].message.content
  }, [])

  const chat = useCallback(async (transcript: string, userMessage: string): Promise<string> => {
    if (!engineRef.current) throw new Error('Gemma not loaded')
    const reply = await engineRef.current.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant. The following is a transcript. Answer questions based on it.',
        },
        { role: 'user', content: `Transcript:\n${transcript}\n\nQuestion: ${userMessage}` },
      ],
    })
    return reply.choices[0].message.content
  }, [])

  const unload = useCallback(() => {
    engineRef.current?.unload?.()
    engineRef.current = null
    setIsLoaded(false)
  }, [])

  return { load, summarize, chat, unload, isLoaded, isLoading, error }
}
