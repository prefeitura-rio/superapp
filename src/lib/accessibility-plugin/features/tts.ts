export const ttsAvailable =
  typeof window !== 'undefined' && 'speechSynthesis' in window

const SPEEDS = [0.75, 1, 1.5] as const
const HIGHLIGHT_CLASS = 'a11y-tts-highlight'
const EXCLUDED = '#a11y-panel, #a11y-btn, #a11y-tts-widget'

type ReadNode = { el: Element; text: string }
type OnProgress = (current: number, total: number) => void
type OnEnd = () => void

let queue: ReadNode[] = []
let queueIndex = 0
let currentSpeed: 0 | 1 | 2 = 1
let onProgressCb: OnProgress | null = null
let onEndCb: OnEnd | null = null
let lastHighlighted: Element | null = null
let paused = false

function getVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices()
  return (
    voices.find(v => v.lang === 'pt-BR') ??
    voices.find(v => v.lang.startsWith('pt')) ??
    voices[0] ??
    null
  )
}

function clearHighlight(): void {
  if (lastHighlighted) {
    lastHighlighted.classList.remove(HIGHLIGHT_CLASS)
    lastHighlighted = null
  }
}

function buildQueue(): ReadNode[] {
  const root = document.querySelector('main') ?? document.body

  // Seletores semânticos nativos
  const semantic = Array.from(
    root.querySelectorAll<Element>(
      'p, h1, h2, h3, h4, h5, h6, li, dt, dd, caption, figcaption, blockquote, label'
    )
  )

  // Elementos folha com texto que escapam de marcação semântica (ex: InfoRow com div+span)
  // Pega apenas spans/divs que não contêm outros elementos de bloco e têm texto direto
  const leafDivs = Array.from(
    root.querySelectorAll<Element>('span, div')
  ).filter(el => {
    // Deve ter texto próprio (não só de filhos que já serão capturados)
    const ownText = Array.from(el.childNodes)
      .filter(n => n.nodeType === Node.TEXT_NODE)
      .map(n => n.textContent ?? '')
      .join('')
      .trim()
    if (ownText.length === 0) return false
    // Não deve conter elementos semânticos filhos (eles entram pela lista acima)
    if (el.querySelector('p, h1, h2, h3, h4, h5, h6, li, span, div'))
      return false
    return true
  })

  const seen = new Set<Element>()
  const nodes: Element[] = []
  for (const el of [...semantic, ...leafDivs]) {
    if (!seen.has(el)) {
      seen.add(el)
      nodes.push(el)
    }
  }

  // Ordena pela posição no DOM
  nodes.sort((a, b) => {
    const pos = a.compareDocumentPosition(b)
    return pos & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
  })

  return nodes
    .filter(el => !el.closest(EXCLUDED))
    .map(el => ({ el, text: (el.textContent ?? '').trim() }))
    .filter(n => n.text.length > 0)
}

function speakNode(index: number): void {
  if (index >= queue.length) {
    clearHighlight()
    onEndCb?.()
    return
  }

  queueIndex = index
  const { el, text } = queue[index]
  onProgressCb?.(index + 1, queue.length)

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'pt-BR'
  utterance.rate = SPEEDS[currentSpeed]
  utterance.voice = getVoice()

  utterance.onboundary = () => {
    clearHighlight()
    el.classList.add(HIGHLIGHT_CLASS)
    lastHighlighted = el
  }

  utterance.onend = () => {
    clearHighlight()
    if (!paused) speakNode(index + 1)
  }

  utterance.onerror = () => {
    clearHighlight()
    if (!paused) speakNode(index + 1)
  }

  window.speechSynthesis.speak(utterance)
}

export const TTS = {
  apply(
    enabled: boolean,
    speed: 0 | 1 | 2 = 1,
    onProgress?: OnProgress,
    onEnd?: OnEnd
  ): void {
    if (!ttsAvailable) return

    if (enabled) {
      currentSpeed = speed
      onProgressCb = onProgress ?? null
      onEndCb = onEnd ?? null
      paused = false
      window.speechSynthesis.cancel()
      queue = buildQueue()
      queueIndex = 0
      // getVoices() pode ser async na primeira chamada — espera evento se vazio
      if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
          window.speechSynthesis.onvoiceschanged = null
          speakNode(0)
        }
      } else {
        speakNode(0)
      }
    } else {
      this.reset()
    }
  },

  pause(): void {
    if (!ttsAvailable) return
    paused = true
    window.speechSynthesis.pause()
  },

  resume(): void {
    if (!ttsAvailable) return
    paused = false
    window.speechSynthesis.resume()
    // Chrome às vezes precisa de re-speak após resume
    if (!window.speechSynthesis.speaking) speakNode(queueIndex)
  },

  stop(): void {
    if (!ttsAvailable) return
    paused = false
    window.speechSynthesis.cancel()
    clearHighlight()
    queue = []
    queueIndex = 0
  },

  isPaused(): boolean {
    return paused
  },

  reset(): void {
    this.stop()
    onProgressCb = null
    onEndCb = null
  },
}
