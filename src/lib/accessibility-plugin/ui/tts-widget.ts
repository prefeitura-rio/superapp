import { TTS } from '../features/tts'

export const WIDGET_ID = 'a11y-tts-widget'

const ICON_PLAY = `<svg viewBox="0 0 24 24" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>`
const ICON_PAUSE = `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`
const ICON_STOP = `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>`

type WidgetCallbacks = {
  onStop: () => void
}

export function createTTSWidget(callbacks: WidgetCallbacks): HTMLElement {
  const widget = document.createElement('div')
  widget.id = WIDGET_ID
  widget.setAttribute('role', 'toolbar')
  widget.setAttribute('aria-label', 'Controles de leitura em voz')

  const playBtn = document.createElement('button')
  playBtn.id = 'a11y-tts-play'
  playBtn.className = 'a11y-tts-btn'
  playBtn.type = 'button'
  playBtn.setAttribute('aria-label', 'Pausar leitura')
  playBtn.innerHTML = ICON_PAUSE

  const stopBtn = document.createElement('button')
  stopBtn.id = 'a11y-tts-stop'
  stopBtn.className = 'a11y-tts-btn'
  stopBtn.type = 'button'
  stopBtn.setAttribute('aria-label', 'Parar leitura')
  stopBtn.innerHTML = ICON_STOP

  const progress = document.createElement('span')
  progress.id = 'a11y-tts-progress'
  progress.className = 'a11y-tts-progress'
  progress.setAttribute('aria-live', 'polite')
  progress.setAttribute('aria-atomic', 'true')

  playBtn.addEventListener('click', () => {
    if (TTS.isPaused()) {
      TTS.resume()
      playBtn.innerHTML = ICON_PAUSE
      playBtn.setAttribute('aria-label', 'Pausar leitura')
    } else {
      TTS.pause()
      playBtn.innerHTML = ICON_PLAY
      playBtn.setAttribute('aria-label', 'Retomar leitura')
    }
  })

  stopBtn.addEventListener('click', () => {
    callbacks.onStop()
  })

  widget.append(playBtn, stopBtn, progress)
  document.body.appendChild(widget)
  return widget
}

export function updateWidgetProgress(current: number, total: number): void {
  const el = document.getElementById('a11y-tts-progress')
  if (el) el.textContent = `${current} / ${total}`
}

export function removeTTSWidget(): void {
  document.getElementById(WIDGET_ID)?.remove()
}
