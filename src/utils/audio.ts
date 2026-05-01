export async function blobToFloat32Array(blob: Blob): Promise<Float32Array> {
  const arrayBuffer = await blob.arrayBuffer()
  const audioCtx = new AudioContext({ sampleRate: 16000 })
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer)
  await audioCtx.close()

  const channelData = audioBuffer.getChannelData(0)
  const targetSampleRate = 16000
  const sourceSampleRate = audioBuffer.sampleRate

  if (sourceSampleRate === targetSampleRate) {
    return channelData
  }

  const ratio = sourceSampleRate / targetSampleRate
  const newLength = Math.round(channelData.length / ratio)
  const result = new Float32Array(newLength)

  for (let i = 0; i < newLength; i++) {
    const srcIndex = Math.round(i * ratio)
    result[i] = channelData[Math.min(srcIndex, channelData.length - 1)]
  }

  return result
}

export function secondsToTimecode(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  const cs = Math.round((s - Math.floor(s)) * 100)
  const sf = Math.floor(s)
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sf.toString().padStart(2, '0')},${cs.toString().padStart(2, '0')}`
}
