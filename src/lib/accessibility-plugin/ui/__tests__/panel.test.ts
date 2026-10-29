import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { init } from '../../index'
import { PANEL_ID } from '../panel'

/**
 * DEV-110 — o painel de acessibilidade é um diálogo modal
 * (`role="dialog"` + `aria-modal="true"`) e precisa reter o foco enquanto
 * aberto (WAI-ARIA APG, Dialog Modal): Tab no último focável volta ao
 * primeiro e Shift+Tab no primeiro vai ao último, até o painel fechar.
 */

function panel(): HTMLElement {
  const el = document.getElementById(PANEL_ID)
  if (!el) throw new Error('painel de acessibilidade não montado')
  return el
}

function closeButton(): HTMLElement {
  return byLabel('Fechar painel de acessibilidade')
}

function resetButton(): HTMLElement {
  const el = panel().querySelector<HTMLElement>('.a11y-reset-btn')
  if (!el) throw new Error('botão Restaurar padrões não encontrado')
  return el
}

function byLabel(label: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(`[aria-label="${label}"]`)
  if (!el) throw new Error(`elemento "${label}" não encontrado`)
  return el
}

function mountPage(): void {
  document.body.innerHTML = `
    <a href="/antes" id="link-antes">Link antes</a>
    <main><p>Conteúdo da página</p></main>
    <footer><a href="/rodape" id="link-rodape">Link do rodapé</a></footer>
  `
}

async function openWithKeyboard(user: ReturnType<typeof userEvent.setup>) {
  byLabel('Abrir painel de acessibilidade').focus()
  await user.keyboard('{Enter}')
  expect(panel()).toHaveClass('a11y-open')
  expect(document.activeElement).toBe(closeButton())
}

describe('painel de acessibilidade — focus-trap (DEV-110)', () => {
  beforeEach(() => {
    localStorage.clear()
    document.head.innerHTML = ''
    mountPage()
    init()
  })

  afterEach(() => {
    document.body.innerHTML = ''
    document.head.innerHTML = ''
    localStorage.clear()
  })

  it('Shift+Tab no primeiro elemento (fechar) leva ao último (Restaurar padrões)', async () => {
    const user = userEvent.setup()
    await openWithKeyboard(user)

    await user.tab({ shift: true })

    expect(document.activeElement).toBe(resetButton())
    expect(panel().contains(document.activeElement)).toBe(true)
  })

  it('Tab no último elemento (Restaurar padrões) volta ao primeiro (fechar)', async () => {
    const user = userEvent.setup()
    await openWithKeyboard(user)

    resetButton().focus()
    await user.tab()

    expect(document.activeElement).toBe(closeButton())
    expect(panel().contains(document.activeElement)).toBe(true)
  })

  it('Tab entre elementos do meio segue a ordem natural, sem desvio', async () => {
    const user = userEvent.setup()
    await openWithKeyboard(user)

    await user.tab()

    expect(document.activeElement).not.toBe(closeButton())
    expect(panel().contains(document.activeElement)).toBe(true)
  })

  it('nenhuma sequência de Tab ou Shift+Tab tira o foco do painel aberto', async () => {
    const user = userEvent.setup()
    await openWithKeyboard(user)
    const total = panel().querySelectorAll('button, input').length

    for (let i = 0; i < total + 2; i++) {
      await user.tab()
      expect(panel().contains(document.activeElement)).toBe(true)
    }
    for (let i = 0; i < total + 2; i++) {
      await user.tab({ shift: true })
      expect(panel().contains(document.activeElement)).toBe(true)
    }
  })

  it('com o painel fechado, Tab não é interceptado', async () => {
    const user = userEvent.setup()
    await openWithKeyboard(user)
    await user.keyboard('{Escape}')
    expect(panel()).not.toHaveClass('a11y-open')
    expect(document.activeElement).toBe(
      byLabel('Abrir painel de acessibilidade')
    )

    resetButton().focus()
    await user.tab()

    expect(document.activeElement).not.toBe(closeButton())
  })

  it('o focus-trap continua após Restaurar padrões (painel reconstruído)', async () => {
    const user = userEvent.setup()
    await openWithKeyboard(user)

    await user.click(resetButton())
    expect(panel()).toHaveClass('a11y-open')
    expect(document.querySelectorAll(`#${PANEL_ID}`)).toHaveLength(1)

    closeButton().focus()
    await user.tab({ shift: true })
    expect(document.activeElement).toBe(resetButton())

    await user.tab()
    expect(document.activeElement).toBe(closeButton())
  })
})
