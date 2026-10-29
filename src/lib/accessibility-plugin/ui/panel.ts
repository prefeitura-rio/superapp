import { TTS, ttsAvailable } from '../features/tts'
import type { A11yState } from '../state'

export const PANEL_ID = 'a11y-panel'

type PanelCallbacks = {
  onFontSize: (level: 0 | 1 | 2) => void
  onLetterSpacing: (level: 0 | 1 | 2) => void
  onLineHeight: (level: 0 | 1 | 2) => void
  onDyslexiaFont: (enabled: boolean) => void
  onHighContrast: (enabled: boolean) => void
  onColorBlind: (enabled: boolean) => void
  onHighlightLinks: (enabled: boolean) => void
  onReduceMotion: (enabled: boolean) => void
  onSaturation: (level: 0 | 1 | 2) => void
  onReadingMask: (enabled: boolean) => void
  onMaskHeight: (level: 0 | 1 | 2) => void
  onMaskWidth: (level: 0 | 1 | 2) => void
  onMaskIntensity: (level: 0 | 1 | 2) => void
  onHideImages: (enabled: boolean) => void
  onTts: (enabled: boolean) => void
  onTtsSpeed: (level: 0 | 1 | 2) => void
  onReset: () => void
  onClose: () => void
}

function getFontLabels(): [string, string, string] {
  const probe = document.createElement('span')
  probe.style.cssText =
    'position:absolute;visibility:hidden;font-size:1rem;font-size:initial'
  document.body.appendChild(probe)
  const basePx = Number.parseFloat(getComputedStyle(probe).fontSize)
  probe.remove()
  if (Number.isNaN(basePx) || basePx === 0) return ['Padrão', 'Médio', 'Grande']
  const round = (n: number) => Math.round(n)
  return [
    `${round(basePx)}px`,
    `${round(basePx * 1.15)}px`,
    `${round(basePx * 1.3)}px`,
  ]
}

const SPACING_LABELS = ['Padrão', 'Médio', 'Alto']
const LINE_HEIGHT_LABELS = ['Padrão', 'Médio', 'Alto']
const SATURATION_LABELS = ['Normal', 'Baixa', 'Cinza']
const MASK_HEIGHT_LABELS = ['Estreita', 'Média', 'Ampla']
const MASK_WIDTH_LABELS = ['Coluna', 'Média', 'Total']
const MASK_INTENSITY_LABELS = ['Suave', 'Média', 'Total']
const TTS_SPEED_LABELS = ['Lenta', 'Normal', 'Rápida']

const CLOSE_SVG = `<svg viewBox="0 0 24 24" aria-hidden="true">
  <line x1="18" y1="6" x2="6" y2="18"/>
  <line x1="6" y1="6" x2="18" y2="18"/>
</svg>`

const RESET_SVG = `<svg viewBox="0 0 24 24" aria-hidden="true">
  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
  <path d="M3 3v5h5"/>
</svg>`

// SVG chevron para o accordion
const CHEVRON_SVG = `<svg viewBox="0 0 24 24" aria-hidden="true" class="a11y-chevron">
  <polyline points="6 9 12 15 18 9"/>
</svg>`

// SVGs dos grupos
const ICON_TEXT = `<svg viewBox="0 0 24 24" aria-hidden="true">
  <path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/>
</svg>`
const ICON_VISION = `<svg viewBox="0 0 24 24" aria-hidden="true">
  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
  <circle cx="12" cy="12" r="3"/>
</svg>`
const ICON_MOTION = `<svg viewBox="0 0 24 24" aria-hidden="true">
  <path d="M5 3l14 9-14 9V3z"/>
</svg>`
const TTS_ICON_PLAY = `<svg viewBox="0 0 24 24" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>`
const TTS_ICON_PAUSE = `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`
const TTS_ICON_STOP = `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>`

const ICON_TTS = `<svg viewBox="0 0 24 24" aria-hidden="true">
  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
  <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
</svg>`

function makeStepper(
  initialValue: 0 | 1 | 2,
  labels: string[],
  ariaLabel: string,
  onChange: (v: 0 | 1 | 2) => void
): HTMLElement {
  let current = initialValue

  const wrap = document.createElement('div')
  wrap.className = 'a11y-stepper'
  wrap.setAttribute('role', 'group')
  wrap.setAttribute('aria-label', ariaLabel)

  const btnMinus = document.createElement('button')
  btnMinus.className = 'a11y-stepper-btn'
  btnMinus.type = 'button'
  btnMinus.setAttribute('aria-label', `Diminuir ${ariaLabel}`)
  btnMinus.textContent = '−'
  btnMinus.disabled = current === 0

  const display = document.createElement('span')
  display.className = 'a11y-stepper-val'
  display.setAttribute('aria-live', 'polite')
  display.setAttribute('aria-atomic', 'true')
  display.textContent = labels[current]

  const btnPlus = document.createElement('button')
  btnPlus.className = 'a11y-stepper-btn'
  btnPlus.type = 'button'
  btnPlus.setAttribute('aria-label', `Aumentar ${ariaLabel}`)
  btnPlus.textContent = '+'
  btnPlus.disabled = current === 2

  function update(next: 0 | 1 | 2) {
    current = next
    display.textContent = labels[current]
    btnMinus.disabled = current === 0
    btnPlus.disabled = current === 2
    onChange(current)
  }

  btnMinus.addEventListener('click', () =>
    update(Math.max(0, current - 1) as 0 | 1 | 2)
  )
  btnPlus.addEventListener('click', () =>
    update(Math.min(2, current + 1) as 0 | 1 | 2)
  )

  wrap.append(btnMinus, display, btnPlus)
  return wrap
}

function makeRow(
  label: string,
  sublabel: string | null,
  control: HTMLElement
): HTMLElement {
  const row = document.createElement('div')
  row.className = 'a11y-row'

  const labelWrap = document.createElement('span')
  labelWrap.className = 'a11y-row-label'
  labelWrap.textContent = label

  if (sublabel) {
    const sub = document.createElement('span')
    sub.className = 'a11y-row-sublabel'
    sub.textContent = sublabel
    labelWrap.appendChild(sub)
  }

  row.append(labelWrap, control)
  return row
}

function makeToggle(
  checked: boolean,
  id: string,
  ariaLabel: string,
  onChange: (v: boolean) => void
): HTMLElement {
  const toggle = document.createElement('label')
  toggle.className = 'a11y-toggle'

  const input = document.createElement('input')
  input.type = 'checkbox'
  input.id = id
  input.checked = checked
  input.setAttribute('aria-label', ariaLabel)
  input.addEventListener('change', () => onChange(input.checked))

  const track = document.createElement('span')
  track.className = 'a11y-toggle-track'
  track.setAttribute('aria-hidden', 'true')

  toggle.append(input, track)
  return toggle
}

// Conteúdo recolhido ou oculto sai da ordem do Tab e da árvore de
// acessibilidade enquanto fechado (WCAG 2.4.3 e 2.4.7). `inert` não mexe no
// layout, então a animação de expandir/recolher do CSS continua igual.
function setInert(el: HTMLElement, inert: boolean): void {
  el.toggleAttribute('inert', inert)
}

function setSubRowHidden(row: HTMLElement, hidden: boolean): void {
  row.classList.toggle('a11y-row-sub-hidden', hidden)
  setInert(row, hidden)
}

function countActive(values: (boolean | number)[]): number {
  return values.filter(v => (typeof v === 'boolean' ? v : v > 0)).length
}

type AccordionGroup = {
  el: HTMLElement
  updateBadge: (count: number) => void
}

function makeAccordionGroup(
  id: string,
  iconSvg: string,
  title: string,
  activeCount: number,
  rows: HTMLElement[],
  initiallyOpen: boolean
): AccordionGroup {
  const wrap = document.createElement('div')
  wrap.className = 'a11y-accordion'

  const trigger = document.createElement('button')
  trigger.className = 'a11y-accordion-trigger'
  trigger.type = 'button'
  trigger.setAttribute('aria-expanded', String(initiallyOpen))
  trigger.setAttribute('aria-controls', `a11y-acc-${id}`)

  const left = document.createElement('span')
  left.className = 'a11y-accordion-left'

  const iconWrap = document.createElement('span')
  iconWrap.className = 'a11y-accordion-icon'
  iconWrap.innerHTML = iconSvg

  const titleEl = document.createElement('span')
  titleEl.className = 'a11y-accordion-title'
  titleEl.textContent = title

  left.append(iconWrap, titleEl)

  const right = document.createElement('span')
  right.className = 'a11y-accordion-right'

  const badge = document.createElement('span')
  badge.className = 'a11y-accordion-badge'
  if (activeCount > 0) {
    badge.textContent = String(activeCount)
    right.appendChild(badge)
  }

  const chevronWrap = document.createElement('span')
  chevronWrap.className = 'a11y-accordion-chevron'
  chevronWrap.innerHTML = CHEVRON_SVG

  right.appendChild(chevronWrap)
  trigger.append(left, right)

  const body = document.createElement('div')
  body.id = `a11y-acc-${id}`
  body.className = 'a11y-accordion-body'
  if (initiallyOpen) body.classList.add('a11y-accordion-open')
  setInert(body, !initiallyOpen)

  const inner = document.createElement('div')
  inner.className = 'a11y-accordion-inner'
  rows.forEach(r => inner.appendChild(r))
  body.appendChild(inner)

  trigger.addEventListener('click', () => {
    const isOpen = body.classList.contains('a11y-accordion-open')
    const panel = wrap.closest('#a11y-panel')
    if (panel) {
      panel
        .querySelectorAll<HTMLElement>(
          '.a11y-accordion-body.a11y-accordion-open'
        )
        .forEach(el => {
          if (el !== body) {
            el.classList.remove('a11y-accordion-open')
            setInert(el, true)
            el.closest('.a11y-accordion')
              ?.querySelector('.a11y-accordion-trigger')
              ?.setAttribute('aria-expanded', 'false')
          }
        })
    }
    body.classList.toggle('a11y-accordion-open', !isOpen)
    setInert(body, isOpen)
    trigger.setAttribute('aria-expanded', String(!isOpen))
  })

  wrap.append(trigger, body)

  return {
    el: wrap,
    updateBadge(count: number) {
      if (count > 0) {
        badge.textContent = String(count)
        if (!badge.parentElement) right.insertBefore(badge, chevronWrap)
      } else {
        badge.remove()
      }
    },
  }
}

export function createPanel(
  state: A11yState,
  callbacks: PanelCallbacks
): HTMLElement {
  const panel = document.createElement('div')
  panel.id = PANEL_ID
  panel.setAttribute('role', 'dialog')
  panel.setAttribute('aria-modal', 'true')
  panel.setAttribute('aria-label', 'Painel de acessibilidade')

  // ── Header ──
  const header = document.createElement('div')
  header.className = 'a11y-panel-header'

  const title = document.createElement('p')
  title.className = 'a11y-panel-title'
  title.textContent = 'Painel de Acessibilidade'

  const closeBtn = document.createElement('button')
  closeBtn.className = 'a11y-panel-close'
  closeBtn.type = 'button'
  closeBtn.setAttribute('aria-label', 'Fechar painel de acessibilidade')
  closeBtn.innerHTML = CLOSE_SVG
  closeBtn.addEventListener('click', callbacks.onClose)

  header.append(title, closeBtn)

  // ── Body ──
  const body = document.createElement('div')
  body.className = 'a11y-panel-body'

  // Estado local mutável para recalcular badges em tempo real
  const live = {
    fontSize: state.fontSize,
    letterSpacing: state.letterSpacing,
    lineHeight: state.lineHeight,
    dyslexiaFont: state.dyslexiaFont,
    highContrast: state.highContrast,
    colorBlind: state.colorBlind,
    saturation: state.saturation,
    highlightLinks: state.highlightLinks,
    hideImages: state.hideImages,
    reduceMotion: state.reduceMotion,
    readingMask: state.readingMask,
    tts: state.tts,
  }

  const textActive = countActive([
    state.fontSize,
    state.letterSpacing,
    state.lineHeight,
    state.dyslexiaFont,
  ])
  const visionActive = countActive([
    state.highContrast,
    state.colorBlind,
    state.saturation,
    state.highlightLinks,
    state.hideImages,
  ])
  const motionActive = countActive([state.reduceMotion, state.readingMask])
  const ttsActive = countActive([state.tts])
  const firstOpen =
    ttsActive > 0
      ? 'tts'
      : motionActive > 0
        ? 'motion'
        : visionActive > 0
          ? 'vision'
          : 'text'

  // ── Máscara: sub-rows condicionais ──
  const maskSubRows = [
    makeRow(
      'Intensidade',
      null,
      makeStepper(
        state.maskIntensity,
        MASK_INTENSITY_LABELS,
        'Intensidade da máscara',
        callbacks.onMaskIntensity
      )
    ),
    makeRow(
      'Altura da janela',
      null,
      makeStepper(
        state.maskHeight,
        MASK_HEIGHT_LABELS,
        'Altura da máscara',
        callbacks.onMaskHeight
      )
    ),
    makeRow(
      'Largura da janela',
      null,
      makeStepper(
        state.maskWidth,
        MASK_WIDTH_LABELS,
        'Largura da máscara',
        callbacks.onMaskWidth
      )
    ),
  ]
  maskSubRows.forEach(r => {
    r.classList.add('a11y-row-sub')
    setSubRowHidden(r, !state.readingMask)
  })

  const textGroup = makeAccordionGroup(
    'text',
    ICON_TEXT,
    'Texto',
    textActive,
    [
      makeRow(
        'Tamanho de fonte',
        null,
        makeStepper(
          state.fontSize,
          getFontLabels(),
          'Tamanho de fonte',
          callbacks.onFontSize
        )
      ),
      makeRow(
        'Espaço entre letras',
        null,
        makeStepper(
          state.letterSpacing,
          SPACING_LABELS,
          'Espaço entre letras',
          callbacks.onLetterSpacing
        )
      ),
      makeRow(
        'Espaço entre linhas',
        null,
        makeStepper(
          state.lineHeight,
          LINE_HEIGHT_LABELS,
          'Espaço entre linhas',
          callbacks.onLineHeight
        )
      ),
      makeRow(
        'Fonte para dislexia',
        'OpenDyslexic',
        makeToggle(
          state.dyslexiaFont,
          'a11y-toggle-dyslexia',
          'Ativar fonte para dislexia',
          v => {
            live.dyslexiaFont = v
            textGroup.updateBadge(
              countActive([
                live.fontSize,
                live.letterSpacing,
                live.lineHeight,
                live.dyslexiaFont,
              ])
            )
            callbacks.onDyslexiaFont(v)
          }
        )
      ),
    ],
    firstOpen === 'text'
  )

  // Wrappers de stepper com badge update para o grupo Texto
  const textStepperRows =
    textGroup.el.querySelectorAll<HTMLElement>('.a11y-stepper')
  // reconecta os steppers de texto via substituição dos listeners seria complexo;
  // em vez disso os callbacks de stepper atualizam live + badge diretamente:
  const origFontSize = callbacks.onFontSize
  const origLetterSpacing = callbacks.onLetterSpacing
  const origLineHeight = callbacks.onLineHeight
  callbacks.onFontSize = v => {
    live.fontSize = v
    textGroup.updateBadge(
      countActive([
        live.fontSize,
        live.letterSpacing,
        live.lineHeight,
        live.dyslexiaFont,
      ])
    )
    origFontSize(v)
  }
  callbacks.onLetterSpacing = v => {
    live.letterSpacing = v
    textGroup.updateBadge(
      countActive([
        live.fontSize,
        live.letterSpacing,
        live.lineHeight,
        live.dyslexiaFont,
      ])
    )
    origLetterSpacing(v)
  }
  callbacks.onLineHeight = v => {
    live.lineHeight = v
    textGroup.updateBadge(
      countActive([
        live.fontSize,
        live.letterSpacing,
        live.lineHeight,
        live.dyslexiaFont,
      ])
    )
    origLineHeight(v)
  }
  // suprimir unused warning
  void textStepperRows

  const visionGroup = makeAccordionGroup(
    'vision',
    ICON_VISION,
    'Cores / Visão',
    visionActive,
    [
      makeRow(
        'Alto contraste',
        'Inverte as cores da página',
        makeToggle(
          state.highContrast,
          'a11y-toggle-contrast',
          'Ativar alto contraste',
          v => {
            live.highContrast = v
            visionGroup.updateBadge(
              countActive([
                live.highContrast,
                live.colorBlind,
                live.saturation,
                live.highlightLinks,
                live.hideImages,
              ])
            )
            callbacks.onHighContrast(v)
          }
        )
      ),
      makeRow(
        'Modo daltônico',
        'Filtro para deuteranopia',
        makeToggle(
          state.colorBlind,
          'a11y-toggle-colorblind',
          'Ativar modo daltônico',
          v => {
            live.colorBlind = v
            visionGroup.updateBadge(
              countActive([
                live.highContrast,
                live.colorBlind,
                live.saturation,
                live.highlightLinks,
                live.hideImages,
              ])
            )
            callbacks.onColorBlind(v)
          }
        )
      ),
      makeRow(
        'Saturação de cores',
        null,
        makeStepper(
          state.saturation,
          SATURATION_LABELS,
          'Saturação de cores',
          v => {
            live.saturation = v
            visionGroup.updateBadge(
              countActive([
                live.highContrast,
                live.colorBlind,
                live.saturation,
                live.highlightLinks,
                live.hideImages,
              ])
            )
            callbacks.onSaturation(v)
          }
        )
      ),
      makeRow(
        'Destacar links',
        'Sublinha links em texto corrido',
        makeToggle(
          state.highlightLinks,
          'a11y-toggle-links',
          'Ativar destaque de links',
          v => {
            live.highlightLinks = v
            visionGroup.updateBadge(
              countActive([
                live.highContrast,
                live.colorBlind,
                live.saturation,
                live.highlightLinks,
                live.hideImages,
              ])
            )
            callbacks.onHighlightLinks(v)
          }
        )
      ),
      makeRow(
        'Esconder imagens',
        'Preserva o espaço no layout',
        makeToggle(
          state.hideImages,
          'a11y-toggle-hide-images',
          'Esconder imagens da página',
          v => {
            live.hideImages = v
            visionGroup.updateBadge(
              countActive([
                live.highContrast,
                live.colorBlind,
                live.saturation,
                live.highlightLinks,
                live.hideImages,
              ])
            )
            callbacks.onHideImages(v)
          }
        )
      ),
    ],
    firstOpen === 'vision'
  )

  const motionGroup = makeAccordionGroup(
    'motion',
    ICON_MOTION,
    'Movimento / Foco',
    motionActive,
    [
      makeRow(
        'Parar animações',
        'Remove transições e efeitos',
        makeToggle(
          state.reduceMotion,
          'a11y-toggle-motion',
          'Parar animações da página',
          v => {
            live.reduceMotion = v
            motionGroup.updateBadge(
              countActive([live.reduceMotion, live.readingMask])
            )
            callbacks.onReduceMotion(v)
          }
        )
      ),
      makeRow(
        'Máscara de leitura',
        'Destaca a linha do cursor',
        makeToggle(
          state.readingMask,
          'a11y-toggle-mask',
          'Ativar máscara de leitura',
          v => {
            live.readingMask = v
            maskSubRows.forEach(r => setSubRowHidden(r, !v))
            motionGroup.updateBadge(
              countActive([live.reduceMotion, live.readingMask])
            )
            callbacks.onReadingMask(v)
          }
        )
      ),
      ...maskSubRows,
    ],
    firstOpen === 'motion'
  )

  // ── TTS: sub-row de controles (play/pause/stop + progresso) ──
  const ttsControlsRow = document.createElement('div')
  ttsControlsRow.className = 'a11y-row a11y-row-sub a11y-tts-controls-row'
  setSubRowHidden(ttsControlsRow, !state.tts)

  const ttsPlayBtn = document.createElement('button')
  ttsPlayBtn.type = 'button'
  ttsPlayBtn.className = 'a11y-tts-btn'
  ttsPlayBtn.setAttribute('aria-label', 'Pausar leitura')
  ttsPlayBtn.innerHTML = TTS_ICON_PAUSE
  ttsPlayBtn.addEventListener('click', () => {
    if (TTS.isPaused()) {
      TTS.resume()
      ttsPlayBtn.innerHTML = TTS_ICON_PAUSE
      ttsPlayBtn.setAttribute('aria-label', 'Pausar leitura')
    } else {
      TTS.pause()
      ttsPlayBtn.innerHTML = TTS_ICON_PLAY
      ttsPlayBtn.setAttribute('aria-label', 'Retomar leitura')
    }
  })

  const ttsStopBtn = document.createElement('button')
  ttsStopBtn.type = 'button'
  ttsStopBtn.className = 'a11y-tts-btn'
  ttsStopBtn.setAttribute('aria-label', 'Parar leitura')
  ttsStopBtn.innerHTML = TTS_ICON_STOP
  ttsStopBtn.addEventListener('click', () => {
    callbacks.onTts(false)
  })

  const ttsProgressPanel = document.createElement('span')
  ttsProgressPanel.id = 'a11y-tts-progress-panel'
  ttsProgressPanel.className = 'a11y-tts-progress'
  ttsProgressPanel.setAttribute('aria-live', 'polite')
  ttsProgressPanel.setAttribute('aria-atomic', 'true')

  const ttsControlsInner = document.createElement('div')
  ttsControlsInner.className = 'a11y-tts-controls-inner'
  ttsControlsInner.append(ttsPlayBtn, ttsStopBtn, ttsProgressPanel)
  ttsControlsRow.appendChild(ttsControlsInner)

  // ── TTS: sub-row condicional para velocidade ──
  const ttsSpeedSubRow = makeRow(
    'Velocidade',
    null,
    makeStepper(
      state.ttsSpeed,
      TTS_SPEED_LABELS,
      'Velocidade da leitura',
      v => {
        callbacks.onTtsSpeed(v)
      }
    )
  )
  ttsSpeedSubRow.classList.add('a11y-row-sub')
  setSubRowHidden(ttsSpeedSubRow, !state.tts)

  const ttsToggleRow = makeRow(
    'Leitura em voz alta',
    ttsAvailable ? 'Lê o conteúdo da página' : 'Não suportado neste navegador',
    makeToggle(
      state.tts,
      'a11y-toggle-tts',
      'Ativar leitura em voz alta',
      v => {
        live.tts = v
        setSubRowHidden(ttsControlsRow, !v)
        setSubRowHidden(ttsSpeedSubRow, !v)
        if (!v) {
          ttsPlayBtn.innerHTML = TTS_ICON_PAUSE
          ttsPlayBtn.setAttribute('aria-label', 'Pausar leitura')
          ttsProgressPanel.textContent = ''
        }
        ttsGroup.updateBadge(countActive([live.tts]))
        callbacks.onTts(v)
      }
    )
  )
  if (!ttsAvailable) {
    const input = ttsToggleRow.querySelector<HTMLInputElement>('input')
    if (input) input.disabled = true
  }

  const ttsGroup = makeAccordionGroup(
    'tts',
    ICON_TTS,
    'Leitura em Voz',
    ttsActive,
    [ttsToggleRow, ttsControlsRow, ttsSpeedSubRow],
    firstOpen === 'tts'
  )

  body.append(textGroup.el, visionGroup.el, motionGroup.el, ttsGroup.el)

  // ── Footer ──
  const footer = document.createElement('div')
  footer.className = 'a11y-panel-footer'

  const resetBtn = document.createElement('button')
  resetBtn.className = 'a11y-reset-btn'
  resetBtn.type = 'button'
  resetBtn.innerHTML = `${RESET_SVG} Restaurar padrões`
  resetBtn.addEventListener('click', callbacks.onReset)

  footer.appendChild(resetBtn)

  panel.append(header, body, footer)
  document.body.appendChild(panel)

  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape' && panel.classList.contains('a11y-open')) {
      callbacks.onClose()
    }
  })

  return panel
}

export function openPanel(): void {
  const panel = document.getElementById(PANEL_ID)
  if (!panel) return
  panel.classList.add('a11y-open')
  const first = panel.querySelector<HTMLElement>(
    'button:not(:disabled), input, [tabindex]:not([tabindex="-1"])'
  )
  first?.focus()
}

export function closePanel(): void {
  document.getElementById(PANEL_ID)?.classList.remove('a11y-open')
}

export function isPanelOpen(): boolean {
  return (
    document.getElementById(PANEL_ID)?.classList.contains('a11y-open') ?? false
  )
}

export function rebuildPanel(
  state: A11yState,
  callbacks: PanelCallbacks
): void {
  const wasOpen = isPanelOpen()
  document.getElementById(PANEL_ID)?.remove()
  createPanel(state, callbacks)
  if (wasOpen) openPanel()
}

export function updatePanelTTSProgress(current: number, total: number): void {
  const el = document.getElementById('a11y-tts-progress-panel')
  if (el) el.textContent = `${current} / ${total}`
}
