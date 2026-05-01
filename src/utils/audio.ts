let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext()
  }
  return audioCtx
}

function linearResample(source: Float32Array, sourceRate: number, targetRate: number): Float32Array {
  if (sourceRate === targetRate) return source
  const ratio = sourceRate / targetRate
  const newLength = Math.round(source.length / ratio)
  const result = new Float32Array(newLength)
  for (let i = 0; i < newLength; i++) {
    const srcPos = i * ratio
    const srcIndex = Math.floor(srcPos)
    const frac = srcPos - srcIndex
    const a = source[Math.max(0, srcIndex)]
    const b = source[Math.min(source.length - 1, srcIndex + 1)]
    result[i] = a + frac * (b - a)
  }
  return result
}

export async function blobToFloat32Array(blob: Blob): Promise<Float32Array> {
  const arrayBuffer = await blob.arrayBuffer()
  const ctx = getAudioContext()
  let audioBuffer: AudioBuffer
  try {
    audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0))
  } catch {
    audioBuffer = await ctx.decodeAudioData(arrayBuffer)
  }
  const channelData = audioBuffer.getChannelData(0)
  const mono = audioBuffer.numberOfChannels > 1
    ? averageChannels(audioBuffer)
    : channelData
  return linearResample(mono, audioBuffer.sampleRate, 16000)
}

function averageChannels(buffer: AudioBuffer): Float32Array {
  const numChannels = buffer.numberOfChannels
  const length = buffer.length
  const result = new Float32Array(length)
  for (let i = 0; i < length; i++) {
    let sum = 0
    for (let ch = 0; ch < numChannels; ch++) {
      sum += buffer.getChannelData(ch)[i]
    }
    result[i] = sum / numChannels
  }
  return result
}

export function secondsToTimecode(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 1000)
  return `${pad(h)}:${pad(m)}:${pad(s)},${padMs(ms)}`
}

function pad(n: number): string {
  return n.toString().padStart(2, '0')
}

function padMs(n: number): string {
  return n.toString().padStart(3, '0')
}
