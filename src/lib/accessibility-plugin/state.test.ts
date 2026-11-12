import { afterEach, describe, expect, it } from 'vitest'
import { ColorBlind } from './features/color-blind'
import { getState, setState } from './state'

const STORAGE_KEY = 'a11y-preferences'

function savePreferences(value: unknown): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
}

describe('getState — colorBlind salvo antes do PR #769', () => {
  afterEach(() => {
    localStorage.clear()
    ColorBlind.reset()
    document.documentElement.classList.remove('a11y-cb-true', 'a11y-cb-false')
  })

  it('converte o boolean legado `true` em Deuteranopia (1) e aplica uma classe com filtro', () => {
    savePreferences({ colorBlind: true })

    const state = getState()
    expect(state.colorBlind).toBe(1)

    ColorBlind.apply(state.colorBlind)
    const html = document.documentElement
    expect(html.classList.contains('a11y-cb-1')).toBe(true)
    expect(html.classList.contains('a11y-cb-true')).toBe(false)
  })

  it('converte o boolean legado `false` em desligado (0)', () => {
    savePreferences({ colorBlind: false })

    expect(getState().colorBlind).toBe(0)
  })

  it.each([4, -1, 1.5, '1', null, {}])(
    'descarta valor inválido %j e volta a desligado (0)',
    value => {
      savePreferences({ colorBlind: value })

      expect(getState().colorBlind).toBe(0)
    }
  )

  it.each([0, 1, 2, 3] as const)('mantém o tipo válido %d', value => {
    savePreferences({ colorBlind: value })

    expect(getState().colorBlind).toBe(value)
  })

  it('preserva as demais preferências ao normalizar o valor legado', () => {
    savePreferences({ colorBlind: true, fontSize: 2, highContrast: true })

    const state = getState()
    expect(state.colorBlind).toBe(1)
    expect(state.fontSize).toBe(2)
    expect(state.highContrast).toBe(true)
  })

  it('a próxima gravação persiste o formato novo', () => {
    savePreferences({ colorBlind: true })

    setState({ fontSize: 1 })

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
    expect(saved.colorBlind).toBe(1)
    expect(saved.fontSize).toBe(1)
  })
})
