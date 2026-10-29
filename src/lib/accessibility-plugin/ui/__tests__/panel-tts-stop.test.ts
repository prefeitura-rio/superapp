import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { init } from '../../index'
import { PANEL_ID } from '../panel'

/**
 * DEV-113 — "Parar leitura" do painel e o fim natural da leitura em voz
 * precisam deixar o painel como o desligar manual do toggle: toggle
 * desmarcado, badge do grupo zerado e sub-opções (controles e velocidade)
 * ocultas.
 */

type FakeUtterance = {
  text: string
  onend: (() => void) | null
}

// O jsdom não tem síntese de voz e `ttsAvailable` é lido na carga do módulo:
// a síntese simulada precisa existir antes dos imports.
const synth = vi.hoisted(() => {
  const spoken: FakeUtterance[] = []
  class Utterance implements FakeUtterance {
    text: string
    lang = ''
    rate = 1
    voice: unknown = null
    onboundary: (() => void) | null = null
    onend: (() => void) | null = null
    onerror: (() => void) | null = null
    constructor(text: string) {
      this.text = text
    }
  }
  const fake = {
    speaking: false,
    onvoiceschanged: null,
    getVoices: () => [{ lang: 'pt-BR' }],
    speak: (u: FakeUtterance) => {
      spoken.push(u)
    },
    cancel: () => {},
    pause: () => {},
    resume: () => {},
  }
  Object.defineProperty(window, 'speechSynthesis', {
    value: fake,
    configurable: true,
  })
  Object.defineProperty(globalThis, 'SpeechSynthesisUtterance', {
    value: Utterance,
    configurable: true,
  })
  return { spoken }
})

function panel(): HTMLElement {
  const el = document.getElementById(PANEL_ID)
  if (!el) throw new Error('painel de acessibilidade não montado')
  return el
}

function ttsToggle(): HTMLInputElement {
  const el = panel().querySelector<HTMLInputElement>('#a11y-toggle-tts')
  if (!el) throw new Error('toggle de leitura em voz não encontrado')
  return el
}

function panelButton(label: string): HTMLElement {
  const el = panel().querySelector<HTMLElement>(`[aria-label="${label}"]`)
  if (!el) throw new Error(`botão "${label}" não encontrado no painel`)
  return el
}

function ttsBadge(): Element | null {
  return panel().querySelector(
    '[aria-controls="a11y-acc-tts"] .a11y-accordion-badge'
  )
}

function ttsSubRows(): HTMLElement[] {
  return Array.from(
    panel().querySelectorAll<HTMLElement>('#a11y-acc-tts .a11y-row-sub')
  )
}

function savedTts(): unknown {
  return JSON.parse(localStorage.getItem('a11y-preferences') ?? '{}').tts
}

async function startReading(user: ReturnType<typeof userEvent.setup>) {
  document
    .querySelector<HTMLElement>('[aria-label="Abrir painel de acessibilidade"]')
    ?.click()
  await user.click(ttsToggle())

  expect(ttsToggle().checked).toBe(true)
  expect(ttsBadge()?.textContent).toBe('1')
  expect(ttsSubRows()).toHaveLength(2)
  for (const row of ttsSubRows()) {
    expect(row).not.toHaveClass('a11y-row-sub-hidden')
  }
  expect(document.getElementById('a11y-tts-widget')).not.toBeNull()
  expect(synth.spoken.length).toBeGreaterThan(0)
}

function expectPanelTtsOff(): void {
  expect(ttsToggle().checked).toBe(false)
  expect(ttsBadge()).toBeNull()
  expect(ttsSubRows()).toHaveLength(2)
  for (const row of ttsSubRows()) {
    expect(row).toHaveClass('a11y-row-sub-hidden')
  }
  expect(panel().querySelector('#a11y-tts-progress-panel')?.textContent).toBe(
    ''
  )
  expect(savedTts()).toBe(false)
  expect(document.getElementById('a11y-tts-widget')).toBeNull()
}

describe('painel de acessibilidade — parar a leitura em voz (DEV-113)', () => {
  beforeEach(() => {
    synth.spoken.length = 0
    localStorage.clear()
    document.head.innerHTML = ''
    document.body.innerHTML =
      '<main><p>Primeiro parágrafo</p><p>Segundo parágrafo</p></main>'
    init()
  })

  afterEach(() => {
    document.body.innerHTML = ''
    document.head.innerHTML = ''
    localStorage.clear()
  })

  it('"Parar leitura" no painel desliga o toggle, zera o badge e oculta as sub-opções', async () => {
    const user = userEvent.setup()
    await startReading(user)

    await user.click(panelButton('Parar leitura'))

    expectPanelTtsOff()
  })

  it('"Parar leitura" no painel devolve o foco ao toggle de leitura', async () => {
    const user = userEvent.setup()
    await startReading(user)

    await user.click(panelButton('Parar leitura'))

    expect(document.activeElement).toBe(ttsToggle())
  })

  it('o fim natural da leitura deixa o painel no estado desligado', async () => {
    const user = userEvent.setup()
    await startReading(user)

    for (let i = 0; i < 10 && savedTts() !== false; i++) {
      synth.spoken.at(-1)?.onend?.()
    }

    expectPanelTtsOff()
  })

  it('depois de parar, ligar o toggle de novo volta a mostrar os controles', async () => {
    const user = userEvent.setup()
    await startReading(user)
    await user.click(panelButton('Parar leitura'))

    await user.click(ttsToggle())

    expect(ttsToggle().checked).toBe(true)
    expect(ttsBadge()?.textContent).toBe('1')
    for (const row of ttsSubRows()) {
      expect(row).not.toHaveClass('a11y-row-sub-hidden')
    }
    expect(savedTts()).toBe(true)
  })
})
