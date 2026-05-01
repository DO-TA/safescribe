const PRO_LICENSE_KEY = 'safescribe_pro_license'

export function getStoredLicense(): string | null {
  return localStorage.getItem(PRO_LICENSE_KEY)
}

export function setStoredLicense(key: string): void {
  localStorage.setItem(PRO_LICENSE_KEY, key)
}

export function clearLicense(): void {
  localStorage.removeItem(PRO_LICENSE_KEY)
}

export function isProUser(): boolean {
  const license = getStoredLicense()
  if (!license) return false
  return true
}

export function canUseFeature(feature: 'gemma' | 'exportPdf' | 'unlimitedHistory'): boolean {
  if (feature === 'gemma') return true
  return isProUser()
}

export const PRO_FEATURES = {
  gemma: { pro: false, label: 'AI Summarization & Chat' },
  exportPdf: { pro: true, label: 'PDF Export' },
  unlimitedHistory: { pro: true, label: 'Unlimited History' },
} as const
