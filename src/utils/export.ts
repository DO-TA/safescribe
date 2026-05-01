export function exportTXT(text: string, title: string): void {
  const blob = new Blob([text], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

export function exportSRT(
  segments: { start: number; end: number; text: string }[],
  title: string
): void {
  let srt = ''
  segments.forEach((seg, i) => {
    srt += `${i + 1}\n`
    srt += `${formatTime(seg.start)} --> ${formatTime(seg.end)}\n`
    srt += `${seg.text}\n\n`
  })
  const blob = new Blob([srt], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.srt`
  a.click()
  URL.revokeObjectURL(url)
}

function formatTime(seconds: number): string {
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
