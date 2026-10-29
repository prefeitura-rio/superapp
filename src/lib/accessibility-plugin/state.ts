export type A11yState = {
  fontSize: 0 | 1 | 2
  letterSpacing: 0 | 1 | 2
  lineHeight: 0 | 1 | 2
  dyslexiaFont: boolean
  highContrast: boolean
  colorBlind: boolean
  highlightLinks: boolean
  reduceMotion: boolean
  saturation: 0 | 1 | 2
  readingMask: boolean
  maskHeight: 0 | 1 | 2
  maskWidth: 0 | 1 | 2
  maskIntensity: 0 | 1 | 2
  hideImages: boolean
  tts: boolean
  ttsSpeed: 0 | 1 | 2
}

const STORAGE_KEY = 'a11y-preferences'

const DEFAULT_STATE: A11yState = {
  fontSize: 0,
  letterSpacing: 0,
  lineHeight: 0,
  dyslexiaFont: false,
  highContrast: false,
  colorBlind: false,
  highlightLinks: false,
  reduceMotion: false,
  saturation: 0,
  readingMask: false,
  maskHeight: 1,
  maskWidth: 1,
  maskIntensity: 1,
  hideImages: false,
  tts: false,
  ttsSpeed: 1,
}

export function getState(): A11yState {
  if (typeof window === 'undefined') return { ...DEFAULT_STATE }

  const saved = localStorage.getItem(STORAGE_KEY)
  if (!saved) return { ...DEFAULT_STATE }

  try {
    return { ...DEFAULT_STATE, ...JSON.parse(saved) }
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return { ...DEFAULT_STATE }
  }
}

export function setState(patch: Partial<A11yState>): A11yState {
  if (typeof window === 'undefined') return { ...DEFAULT_STATE }

  const next = { ...getState(), ...patch }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  return next
}

export function resetState(): A11yState {
  if (typeof window === 'undefined') return { ...DEFAULT_STATE }

  localStorage.removeItem(STORAGE_KEY)
  return { ...DEFAULT_STATE }
}
