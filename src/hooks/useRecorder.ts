import { useRef, useState, useCallback } from 'react'

export function useRecorder() {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startRecording = useCallback(async (): Promise<void> => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/mp4'
      const mediaRecorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (e) {
      const msg = e instanceof DOMException && e.name === 'NotAllowedError'
        ? 'Microphone access denied. Please enable microphone permissions in your device settings.'
        : String(e)
      setError(msg)
      throw new Error(msg)
    }
  }, [])

  const stopRecording = useCallback((): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const mediaRecorder = mediaRecorderRef.current
      if (!mediaRecorder) {
        reject(new Error('No active recording'))
        return
      }

      mediaRecorder.onstop = () => {
        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/mp4'
        const blob = new Blob(chunksRef.current, { type: mimeType })
        // stop tracks
        mediaRecorder.stream.getTracks().forEach((t) => t.stop())
        setIsRecording(false)
        resolve(blob)
      }

      mediaRecorder.stop()
    })
  }, [])

  const cancelRecording = useCallback(() => {
    const mr = mediaRecorderRef.current
    if (mr && mr.state !== 'inactive') {
      mr.stream.getTracks().forEach((t) => t.stop())
      mr.stop()
    }
    setIsRecording(false)
    chunksRef.current = []
  }, [])

  return { startRecording, stopRecording, cancelRecording, isRecording, error }
}
