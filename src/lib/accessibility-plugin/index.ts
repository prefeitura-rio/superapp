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
import { getState, resetState, setState } from './state'
import { createButton, setButtonActive, setButtonExpanded } from './ui/button'
import {
  closePanel,
  createPanel,
  isPanelOpen,
  openPanel,
  rebuildPanel,
} from './ui/panel'
import { injectStyles } from './ui/styles'

function hasActiveFeature(state: ReturnType<typeof getState>): boolean {
  return (
    state.fontSize > 0 ||
    state.letterSpacing > 0 ||
    state.lineHeight > 0 ||
    state.dyslexiaFont ||
    state.highContrast ||
    state.colorBlind > 0 ||
    state.highlightLinks ||
    state.reduceMotion ||
    state.saturation > 0 ||
    state.readingMask ||
    state.hideImages
  )
}

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
  setButtonActive(hasActiveFeature(state))
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
    onColorBlind(type: 0 | 1 | 2 | 3) {
      applyState(setState({ colorBlind: type }))
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

const VLIBRAS_POPUP_IMG = `<img src="/familia-vlibras.webp" alt="" aria-hidden="true" class="a11y-vlibras-popup-img">`

const VLIBRAS_BTN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 258 265" aria-hidden="true" style="display:block"><path d="M69.85 0C68.2744 0.551431 66.845 1.45423 65.67 2.64C63.25 4.95 63.25 4.95 63.8 10.56L65.01 25.41C68.31 65.23 68.75 77.11 67.32 77.99C65.01 79.53 63.69 77.33 41.47 34.32C33.88 19.69 32.45 18.04 27.83 19.58C20.35 22.11 20.9 25.85 32.78 51.48L35.64 57.86C35.64 57.97 36.96 61.16 38.61 64.57C47.41 83.93 49.72 91.74 46.86 92.84C44.88 93.61 41.25 91.74 38.28 88.22C36.74 86.46 34.98 84.26 34.1 83.49C31.128 80.1001 28.2665 76.615 25.52 73.04L17.6 63.58C14.9369 60.1857 11.9932 57.0212 8.8 54.12C5.06 52.69 0 55.55 0 59.18C0 62.37 7.7 75.02 23.43 98.34C33.33 112.97 35.64 118.14 37.95 131.01C42.6433 158.143 49.17 175.01 57.53 181.61C63.14 186.01 63.36 186.01 76.78 185.46L88.99 185.02L98.34 172.48L108.57 158.95C112.2 154.22 121.44 137.83 121.44 136.18C121.44 135.96 116.6 135.96 110.77 136.18C103.583 136.547 98.34 136.4 95.04 135.74C89.32 134.64 82.06 131.34 77.99 128.04C74.918 125.526 72.8195 122.019 72.0564 118.123C71.2933 114.227 71.9135 110.187 73.81 106.7C76.78 101.75 80.85 99.55 89.32 98.56C96.25 97.68 103.62 95.7 114.29 91.74L119.9 89.65V80.63C119.9 71.39 121.66 39.05 123.09 23.87C124.19 11.88 124.19 11.99 121.22 9.13C119.13 7.04 117.92 6.49 115.72 6.49C110.22 6.49 110 7.26 104.5 34.76L98.56 65.56C97.24 73.04 96.25 75.79 94.49 76.56C92.29 77.33 90.2 73.81 89.21 67.54L86.24 49.06C84.15 35.97 80.08 11.66 79.2 7.26C78.65 4.62 75.24 0.660003 72.93 0.110003C71.9084 -0.0344421 70.8716 -0.0344421 69.85 0.110003M172.92 79.86C164.922 82.1584 157.123 85.1014 149.6 88.66L135.19 95.48C118.8 103.62 99.99 110.22 93.39 110.22C88.99 110.22 84.15 112.2 83.71 114.29C83.27 116.49 88.11 120.89 92.73 122.65C96.91 124.3 98.01 124.3 112.86 123.86C126.28 123.53 129.03 123.64 131.23 124.63C134.86 126.39 135.85 129.36 134.64 134.86C133.43 140.47 126.5 154.33 120.89 162.36C117.26 167.64 95.7 196.46 83.16 212.63C78.76 218.46 78.54 221.43 82.39 225.28C87.34 230.23 86.68 230.67 113.19 203.94C138.05 178.97 140.14 177.32 141.24 181.83C142.01 184.47 142.12 184.03 131.12 207.68C128.834 212.171 126.742 216.759 124.85 221.43C112.2 248.82 111.65 250.58 115.39 255.31C116.71 256.96 117.59 257.29 120.56 257.29C122.54 257.29 124.74 256.85 125.4 256.3C126.06 255.75 129.8 249.48 133.87 242.22C140.8 229.57 144.87 222.2 148.39 216.15C161.26 193.71 161.15 193.82 163.57 193.82C165 193.82 165 194.15 164.67 203.28C164.12 211.64 163.13 221.54 160.27 244.53C159.17 253.22 159.17 260.48 160.49 262.13C162.03 264.22 167.42 264.77 169.84 263.23C172.37 261.58 173.47 257.4 176.44 239.91C182.49 202.73 184.14 195.69 186.45 193.49C187.99 192.06 188.1 192.06 189.75 193.49C190.52 194.37 191.62 195.58 191.95 196.35C192.39 197.01 193.6 205.7 194.59 215.71C197.56 243.54 197.78 244.97 200.09 247.06C202.657 249.26 205.223 249.26 207.79 247.06C209.99 245.19 209.99 244.75 210.65 234.74C211.09 229.02 211.2 217.8 210.98 209.66C210.65 193.93 211.42 180.73 212.85 176.22L218.24 162.91C220.66 157.19 224.18 147.95 225.94 142.34C231.44 125.29 231.11 111.54 224.84 105.38C222.105 103.121 219.158 101.132 216.04 99.44C210.715 96.4621 205.828 92.7602 201.52 88.44C195.25 82.5 192.94 80.96 190.08 80.19C184.399 79.3336 178.63 79.2226 172.92 79.86ZM233.42 102.52C232.98 103.4 233.64 106.04 234.74 108.9C237.27 115.28 237.82 121 236.72 128.48C235.29 138.16 235.4 139.26 237.38 139.48C240.02 139.92 241.34 136.84 242.33 128.48C243.43 119.13 242.44 112.09 239.25 105.6C237.05 100.98 234.3 99.55 233.31 102.52M247.28 105.16C247.06 105.71 247.61 108.46 248.38 111.1C250.47 117.48 250.03 127.6 247.5 135.3C245.85 140.03 245.85 140.58 246.95 141.79C249.59 144.43 252.34 140.69 254.1 132.11C256.201 123.327 255.548 114.11 252.23 105.71C251.13 103.84 247.83 103.51 247.28 105.16ZM33.33 171.49C31.79 173.14 32.23 175.34 35.53 181.39C41.25 191.73 55 203.5 58.19 200.86C60.5 198.99 59.62 197.23 54.89 194.26C48.4035 189.981 43.1659 184.06 39.71 177.1C36.52 171.05 35.09 169.73 33.33 171.6M22.33 176.55C21.12 177.98 22.11 181.61 25.63 188.87C30.58 198.88 41.14 209.11 45.1 207.57C47.08 206.8 46.64 203.72 44.11 202.29C36.624 196.852 31.0428 189.192 28.16 180.4C26.3267 175.413 24.3833 174.13 22.33 176.55Z" fill-rule="evenodd" clip-rule="evenodd" fill="#FDFDFD"/></svg>`

function createVLibrasButton(): void {
  const tryInit = () => {
    const native = document.getElementById(
      'vlibras-access-wrapper'
    ) as HTMLElement | null
    if (!native) return

    native.style.visibility = 'hidden'

    if (document.getElementById('a11y-vlibras-wrapper')) return

    const wrapper = document.createElement('div')
    wrapper.id = 'a11y-vlibras-wrapper'

    const popup = document.createElement('span')
    popup.id = 'a11y-vlibras-popup'
    popup.setAttribute('aria-hidden', 'true')
    popup.innerHTML = `${VLIBRAS_POPUP_IMG}<span class="a11y-vlibras-popup-text"><span class="a11y-popup-sub">Acessível com</span><span class="a11y-popup-main">VLibras</span></span>`

    const btn = document.createElement('button')
    btn.id = 'a11y-vlibras-btn'
    btn.setAttribute('aria-label', 'Abrir VLibras — conteúdo em Libras')
    btn.setAttribute('type', 'button')
    btn.innerHTML = VLIBRAS_BTN_SVG

    btn.addEventListener('click', () => {
      const w = window as unknown as { VLibrasWidget?: { open?: () => void } }
      w.VLibrasWidget?.open?.()
    })

    wrapper.appendChild(popup)
    wrapper.appendChild(btn)
    document.body.appendChild(wrapper)
  }

  tryInit()
  if (document.getElementById('a11y-vlibras-wrapper')) return

  const observer = new MutationObserver(() => {
    if (document.getElementById('vlibras-access-wrapper')) {
      observer.disconnect()
      tryInit()
    }
  })
  observer.observe(document.body, { childList: true, subtree: true })
}

function setVLibrasVisible(visible: boolean): void {
  const custom = document.getElementById(
    'a11y-vlibras-wrapper'
  ) as HTMLElement | null
  if (custom) custom.style.visibility = visible ? '' : 'hidden'
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
  createVLibrasButton()

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
