import { ColorBlind } from './features/color-blind'
import { DyslexiaFont } from './features/dyslexia-font'
import { FontSize } from './features/font-size'
import { HideImages } from './features/hide-images'
import { HighContrast } from './features/high-contrast'
import { HighlightLinks } from './features/highlight-links'
import { LetterSpacing } from './features/letter-spacing'
import { ReadingMask } from './features/reading-mask'
import { ReduceMotion } from './features/reduce-motion'
import { Saturation } from './features/saturation'
import { TTS } from './features/tts'
import { getState, resetState, setState } from './state'
import { createButton, setButtonExpanded } from './ui/button'
import {
  closePanel,
  createPanel,
  isPanelOpen,
  openPanel,
  rebuildPanel,
  turnOffPanelTTS,
  updatePanelTTSProgress,
} from './ui/panel'
import { injectStyles } from './ui/styles'
import {
  createTTSWidget,
  removeTTSWidget,
  updateWidgetProgress,
} from './ui/tts-widget'

function applyState(state: ReturnType<typeof getState>): void {
  FontSize.apply(state.fontSize)
  LetterSpacing.applyLetterSpacing(state.letterSpacing)
  LetterSpacing.applyLineHeight(state.lineHeight)
  DyslexiaFont.apply(state.dyslexiaFont)
  HighContrast.apply(state.highContrast)
  ColorBlind.apply(state.colorBlind)
  HighlightLinks.apply(state.highlightLinks)
  ReduceMotion.apply(state.reduceMotion)
  Saturation.apply(state.saturation)
  ReadingMask.apply(
    state.readingMask,
    state.maskHeight,
    state.maskWidth,
    state.maskIntensity
  )
  HideImages.apply(state.hideImages)
  applyTTS(state.tts, state.ttsSpeed)
}

function applyTTS(enabled: boolean, speed: 0 | 1 | 2): void {
  if (enabled) {
    TTS.apply(
      true,
      speed,
      (current, total) => {
        updateWidgetProgress(current, total)
        updatePanelTTSProgress(current, total)
      },
      () => {
        // leitura terminou naturalmente: o painel volta ao estado desligado
        setState({ tts: false })
        removeTTSWidget()
        turnOffPanelTTS()
      }
    )
    if (!document.getElementById('a11y-tts-widget')) {
      createTTSWidget({
        onStop: () => {
          TTS.stop()
          setState({ tts: false })
          removeTTSWidget()
          rebuildPanel(getState(), makeCallbacks())
        },
      })
    }
  } else {
    TTS.reset()
    removeTTSWidget()
  }
}

function makeCallbacks() {
  return {
    onFontSize(level: 0 | 1 | 2) {
      applyState(setState({ fontSize: level }))
    },
    onLetterSpacing(level: 0 | 1 | 2) {
      applyState(setState({ letterSpacing: level }))
    },
    onLineHeight(level: 0 | 1 | 2) {
      applyState(setState({ lineHeight: level }))
    },
    onDyslexiaFont(enabled: boolean) {
      applyState(setState({ dyslexiaFont: enabled }))
    },
    onHighContrast(enabled: boolean) {
      applyState(setState({ highContrast: enabled }))
    },
    onColorBlind(enabled: boolean) {
      applyState(setState({ colorBlind: enabled }))
    },
    onHighlightLinks(enabled: boolean) {
      applyState(setState({ highlightLinks: enabled }))
    },
    onReduceMotion(enabled: boolean) {
      applyState(setState({ reduceMotion: enabled }))
    },
    onSaturation(level: 0 | 1 | 2) {
      applyState(setState({ saturation: level }))
    },
    onReadingMask(enabled: boolean) {
      applyState(setState({ readingMask: enabled }))
    },
    onMaskHeight(level: 0 | 1 | 2) {
      applyState(setState({ maskHeight: level }))
    },
    onMaskWidth(level: 0 | 1 | 2) {
      applyState(setState({ maskWidth: level }))
    },
    onMaskIntensity(level: 0 | 1 | 2) {
      applyState(setState({ maskIntensity: level }))
    },
    onHideImages(enabled: boolean) {
      applyState(setState({ hideImages: enabled }))
    },
    onTts(enabled: boolean) {
      applyState(setState({ tts: enabled }))
    },
    onTtsSpeed(level: 0 | 1 | 2) {
      applyState(setState({ ttsSpeed: level }))
    },
    onReset() {
      const next = resetState()
      applyState(next)
      rebuildPanel(next, makeCallbacks())
    },
    onClose() {
      closePanel()
      setButtonExpanded(false)
      setVLibrasVisible(true)
      setMobileOverlay(false)
      document.getElementById('a11y-btn')?.focus()
    },
  }
}

function setVLibrasVisible(visible: boolean): void {
  const el = document.getElementById(
    'vlibras-access-wrapper'
  ) as HTMLElement | null
  if (el) el.style.visibility = visible ? '' : 'hidden'
}

function isMobile(): boolean {
  return window.matchMedia('(max-width: 400px)').matches
}

function setMobileOverlay(visible: boolean): void {
  const existing = document.getElementById('a11y-mobile-overlay')
  if (visible && isMobile()) {
    if (existing) {
      existing.classList.add('a11y-overlay-visible')
      return
    }
    const overlay = document.createElement('div')
    overlay.id = 'a11y-mobile-overlay'
    overlay.classList.add('a11y-overlay-visible')
    document.body.appendChild(overlay)
  } else {
    existing?.classList.remove('a11y-overlay-visible')
  }
}

export function init(): void {
  if (typeof window === 'undefined') return
  if (document.getElementById('a11y-btn')) return

  injectStyles()

  const state = getState()
  applyState(state)

  createPanel(state, makeCallbacks())

  createButton(() => {
    if (isPanelOpen()) {
      closePanel()
      setButtonExpanded(false)
      setVLibrasVisible(true)
      setMobileOverlay(false)
    } else {
      openPanel()
      setButtonExpanded(true)
      setVLibrasVisible(false)
      setMobileOverlay(true)
    }
  })

  document.addEventListener('pointerdown', (e: PointerEvent) => {
    if (!isPanelOpen()) return
    const target = e.target as Node
    const panel = document.getElementById('a11y-panel')
    const btn = document.getElementById('a11y-btn-wrapper')
    // clique no overlay ou fora do painel/botão fecha
    if (panel?.contains(target) || btn?.contains(target)) return
    closePanel()
    setButtonExpanded(false)
    setVLibrasVisible(true)
    setMobileOverlay(false)
  })
}
