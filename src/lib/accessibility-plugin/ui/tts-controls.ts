import { TTS } from '../features/tts'

/**
 * Botões de pausar/retomar da Leitura em Voz (painel e widget flutuante).
 * O valor do atributo é o contexto que diferencia o nome acessível de cada
 * botão ('' no painel, 'controle flutuante' no widget). O ícone e o rótulo
 * saem sempre de `TTS.isPaused()`, nunca do rótulo anterior do botão.
 */
export const TTS_PAUSE_ATTR = 'data-a11y-tts-pause'

const ICON_PAUSE = `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`
const ICON_PLAY = `<svg viewBox="0 0 24 24" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>`

export function ttsLabel(action: string, context: string): string {
  return context ? `${action} (${context})` : action
}

export function renderTTSPauseButton(btn: HTMLButtonElement): void {
  const context = btn.getAttribute(TTS_PAUSE_ATTR) ?? ''
  const paused = TTS.isPaused()
  btn.innerHTML = paused ? ICON_PLAY : ICON_PAUSE
  btn.setAttribute(
    'aria-label',
    ttsLabel(paused ? 'Retomar leitura' : 'Pausar leitura', context)
  )
}

export function syncTTSPauseButtons(): void {
  for (const btn of document.querySelectorAll<HTMLButtonElement>(
    `[${TTS_PAUSE_ATTR}]`
  )) {
    renderTTSPauseButton(btn)
  }
}

export function toggleTTSPause(): void {
  if (TTS.isPaused()) {
    TTS.resume()
  } else {
    TTS.pause()
  }
  syncTTSPauseButtons()
}
