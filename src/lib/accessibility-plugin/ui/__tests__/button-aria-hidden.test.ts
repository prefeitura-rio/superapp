import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { init } from '../../index'
import { BUTTON_ID } from '../button'
import { PANEL_ID } from '../panel'

/**
 * DEV-269 — o botão "Abrir painel de acessibilidade" é focável o tempo todo,
 * então nem ele nem nenhum ancestral pode ter aria-hidden="true" (axe-core
 * `aria-hidden-focus`, WCAG 4.1.2).
 */

function button(): HTMLButtonElement {
  const el = document.getElementById(BUTTON_ID)
  if (!(el instanceof HTMLButtonElement)) {
    throw new Error('botão do painel de acessibilidade não montado')
  }
  return el
}

function hiddenAncestors(el: Element): Element[] {
  const hidden: Element[] = []
  for (let node: Element | null = el; node; node = node.parentElement) {
    if (node.getAttribute('aria-hidden') === 'true') hidden.push(node)
  }
  return hidden
}

describe('botão do painel de acessibilidade exposto à tecnologia assistiva (DEV-269)', () => {
  beforeEach(() => {
    localStorage.clear()
    document.head.innerHTML = ''
    document.body.innerHTML = '<main><p>Conteúdo da página</p></main>'
    init()
  })

  afterEach(() => {
    document.body.innerHTML = ''
    document.head.innerHTML = ''
    localStorage.clear()
  })

  it('nasce sem aria-hidden no botão nem em nenhum ancestral', () => {
    expect(hiddenAncestors(button())).toEqual([])
    expect(button()).toHaveAccessibleName('Abrir painel de acessibilidade')
  })

  it('continua sem aria-hidden depois de receber e perder o foco', async () => {
    const user = userEvent.setup()
    button().focus()
    expect(hiddenAncestors(button())).toEqual([])
    await user.tab()
    expect(document.activeElement).not.toBe(button())
    expect(hiddenAncestors(button())).toEqual([])
  })

  it('continua sem aria-hidden ao abrir e ao fechar o painel', async () => {
    const user = userEvent.setup()
    await user.click(button())
    expect(document.getElementById(PANEL_ID)).toHaveClass('a11y-open')
    expect(hiddenAncestors(button())).toEqual([])

    await user.click(button())
    expect(document.getElementById(PANEL_ID)).not.toHaveClass('a11y-open')
    expect(hiddenAncestors(button())).toEqual([])
  })

  it('mantém o popup decorativo fora da árvore de acessibilidade', () => {
    expect(document.getElementById('a11y-btn-popup')).toHaveAttribute(
      'aria-hidden',
      'true'
    )
  })
})
