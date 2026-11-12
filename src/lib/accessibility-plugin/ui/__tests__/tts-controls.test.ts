import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * DEV-548 — com a Leitura em Voz ligada, o painel de acessibilidade e o
 * widget flutuante têm cada um um par de botões de pausar/retomar e parar.
 * Os dois pares precisam ter nomes acessíveis distintos e refletir sempre o
 * estado real (`TTS.isPaused()`), nunca o rótulo anterior do próprio botão.
 *
 * O jsdom não tem Web Speech API: `speechSynthesis` e `SpeechSynthesisUtterance`
 * são simulados antes de importar o plugin, porque `ttsAvailable` é avaliado
 * na carga do módulo.
 */

type FakeVoice = { lang: string }

const synth = vi.hoisted(() => {
  const fake = {
    speaking: false,
    voices: [] as FakeVoice[],
    onvoiceschanged: null as null | (() => void),
    getVoices(): FakeVoice[] {
      return fake.voices
    },
    speak: vi.fn(),
    cancel: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
  }
  Object.defineProperty(window, 'speechSynthesis', {
    configurable: true,
    value: fake,
  })
  class FakeUtterance {
    text: string
    lang = ''
    rate = 1
    voice: FakeVoice | null = null
    onboundary: null | (() => void) = null
    onend: null | (() => void) = null
    onerror: null | (() => void) = null
    constructor(text: string) {
      this.text = text
    }
  }
  Object.defineProperty(globalThis, 'SpeechSynthesisUtterance', {
    configurable: true,
    value: FakeUtterance,
  })
  return fake
})

import { TTS } from '../../features/tts'
import { init } from '../../index'
import { WIDGET_ID } from '../tts-widget'

function ttsToggle(): HTMLInputElement {
  const el = document.getElementById('a11y-toggle-tts')
  if (!(el instanceof HTMLInputElement)) {
    throw new Error('toggle "Ativar leitura em voz" não encontrado')
  }
  return el
}

function setTts(enabled: boolean): void {
  const input = ttsToggle()
  if (input.checked === enabled) return
  input.checked = enabled
  input.dispatchEvent(new Event('change'))
}

function panelControls(): HTMLElement {
  const el = document.querySelector<HTMLElement>('.a11y-tts-controls-row')
  if (!el) throw new Error('controles de leitura do painel não encontrados')
  return el
}

function widget(): HTMLElement {
  const el = document.getElementById(WIDGET_ID)
  if (!el) throw new Error('widget flutuante de leitura não montado')
  return el
}

function pauseButtonIn(container: HTMLElement): HTMLButtonElement {
  const el = container.querySelector<HTMLButtonElement>('button')
  if (!el) throw new Error('botão de pausar/retomar não encontrado')
  return el
}

function labelsOf(selector: string): string[] {
  return Array.from(document.querySelectorAll<HTMLElement>(selector)).map(
    el => el.getAttribute('aria-label') ?? ''
  )
}

describe('Leitura em Voz — controles do painel e do widget (DEV-548)', () => {
  beforeEach(() => {
    localStorage.clear()
    document.head.innerHTML = ''
    document.body.innerHTML =
      '<main><p>Primeiro parágrafo</p><p>Segundo parágrafo</p></main>'
    synth.voices = [{ lang: 'pt-BR' }]
    synth.onvoiceschanged = null
    synth.speak.mockClear()
    init()
  })

  afterEach(() => {
    TTS.reset()
    vi.useRealTimers()
    document.body.innerHTML = ''
    document.head.innerHTML = ''
    localStorage.clear()
  })

  it('cada botão de leitura tem um nome acessível único na página', () => {
    setTts(true)

    expect(
      document.querySelectorAll('[aria-label="Pausar leitura"]')
    ).toHaveLength(1)
    expect(
      document.querySelectorAll('[aria-label="Parar leitura"]')
    ).toHaveLength(1)

    const labels = labelsOf('.a11y-tts-btn')
    expect(labels).toHaveLength(4)
    expect(new Set(labels).size).toBe(4)
    expect(pauseButtonIn(panelControls())).toHaveAttribute(
      'aria-label',
      'Pausar leitura'
    )
    expect(pauseButtonIn(widget())).toHaveAttribute(
      'aria-label',
      'Pausar leitura (controle flutuante)'
    )
  })

  it('pausar pelo widget atualiza também o botão do painel', () => {
    setTts(true)

    pauseButtonIn(widget()).click()

    expect(TTS.isPaused()).toBe(true)
    expect(pauseButtonIn(widget())).toHaveAttribute(
      'aria-label',
      'Retomar leitura (controle flutuante)'
    )
    expect(pauseButtonIn(panelControls())).toHaveAttribute(
      'aria-label',
      'Retomar leitura'
    )
  })

  it('depois de pausar pelo widget, o botão do painel retoma e os dois mostram "Pausar"', () => {
    setTts(true)
    pauseButtonIn(widget()).click()

    pauseButtonIn(panelControls()).click()

    expect(TTS.isPaused()).toBe(false)
    expect(pauseButtonIn(panelControls())).toHaveAttribute(
      'aria-label',
      'Pausar leitura'
    )
    expect(pauseButtonIn(widget())).toHaveAttribute(
      'aria-label',
      'Pausar leitura (controle flutuante)'
    )
  })

  it('pausar pelo painel atualiza também o botão do widget', () => {
    setTts(true)

    pauseButtonIn(panelControls()).click()

    expect(TTS.isPaused()).toBe(true)
    expect(pauseButtonIn(widget())).toHaveAttribute(
      'aria-label',
      'Retomar leitura (controle flutuante)'
    )

    pauseButtonIn(widget()).click()

    expect(TTS.isPaused()).toBe(false)
    expect(pauseButtonIn(panelControls())).toHaveAttribute(
      'aria-label',
      'Pausar leitura'
    )
  })

  it('religar a leitura depois de uma pausa volta os dois botões a "Pausar"', () => {
    setTts(true)
    pauseButtonIn(widget()).click()

    setTts(false)
    expect(document.getElementById(WIDGET_ID)).toBeNull()
    setTts(true)

    expect(TTS.isPaused()).toBe(false)
    expect(pauseButtonIn(panelControls())).toHaveAttribute(
      'aria-label',
      'Pausar leitura'
    )
    expect(pauseButtonIn(widget())).toHaveAttribute(
      'aria-label',
      'Pausar leitura (controle flutuante)'
    )
  })

  it('"Parar leitura" do widget desliga a leitura e sincroniza o painel', () => {
    setTts(true)

    widget()
      .querySelector<HTMLButtonElement>(
        '[aria-label="Parar leitura (controle flutuante)"]'
      )
      ?.click()

    expect(ttsToggle().checked).toBe(false)
    expect(document.getElementById(WIDGET_ID)).toBeNull()
  })
})

describe('Leitura em Voz — navegador sem vozes carregadas (DEV-548)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    localStorage.clear()
    document.head.innerHTML = ''
    document.body.innerHTML = '<main><p>Conteúdo da página</p></main>'
    synth.voices = []
    synth.onvoiceschanged = null
    synth.speak.mockClear()
    init()
  })

  afterEach(() => {
    TTS.reset()
    vi.useRealTimers()
    document.body.innerHTML = ''
    document.head.innerHTML = ''
    localStorage.clear()
  })

  it('começa a ler com a voz padrão quando `voiceschanged` nunca dispara', () => {
    setTts(true)
    expect(synth.speak).not.toHaveBeenCalled()

    vi.advanceTimersByTime(3000)

    expect(synth.speak).toHaveBeenCalledTimes(1)
  })

  it('lê uma vez só quando `voiceschanged` dispara antes do prazo', () => {
    setTts(true)

    synth.voices = [{ lang: 'pt-BR' }]
    synth.onvoiceschanged?.()
    vi.advanceTimersByTime(3000)

    expect(synth.speak).toHaveBeenCalledTimes(1)
  })

  it('não começa a ler se a leitura foi desligada antes do prazo', () => {
    setTts(true)
    setTts(false)

    vi.advanceTimersByTime(3000)

    expect(synth.speak).not.toHaveBeenCalled()
    expect(synth.onvoiceschanged).toBeNull()
  })
})
