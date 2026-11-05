import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { init } from '../../index'
import { PANEL_ID } from '../panel'

/**
 * DEV-358 — o nome acessível do diálogo do painel precisa coincidir com o
 * título visível ("Recursos Assistivos"), como pede o WCAG 2.5.3 (Label in
 * Name): o leitor de tela anuncia ao abrir o diálogo o mesmo texto que a
 * pessoa vê no topo do painel.
 */

const VISIBLE_TITLE = 'Recursos Assistivos'

function panel(): HTMLElement {
  const el = document.getElementById(PANEL_ID)
  if (!el) throw new Error('painel de acessibilidade não montado')
  return el
}

function visibleTitle(): HTMLElement {
  const el = panel().querySelector<HTMLElement>('.a11y-panel-title')
  if (!el) throw new Error('título do painel não encontrado')
  return el
}

async function openPanel(): Promise<void> {
  const user = userEvent.setup()
  const openButton = document.querySelector<HTMLElement>(
    '[aria-label="Abrir painel de acessibilidade"]'
  )
  if (!openButton) throw new Error('botão de abrir o painel não encontrado')
  await user.click(openButton)
  expect(panel()).toHaveClass('a11y-open')
}

describe('painel de acessibilidade — nome acessível (DEV-358)', () => {
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

  it('o diálogo aberto tem como nome acessível o título visível', async () => {
    await openPanel()

    expect(visibleTitle()).toHaveTextContent(VISIBLE_TITLE)
    expect(screen.getByRole('dialog', { name: VISIBLE_TITLE })).toBe(panel())
  })

  it('o nome do diálogo vem do título visível, sem aria-label divergente', async () => {
    await openPanel()

    const title = visibleTitle()
    expect(title.id).not.toBe('')
    expect(panel()).toHaveAttribute('aria-labelledby', title.id)
    expect(panel()).not.toHaveAttribute('aria-label')
    expect(
      screen.queryByRole('dialog', { name: 'Painel de acessibilidade' })
    ).toBeNull()
  })

  it('o nome acessível se mantém após Restaurar padrões (painel reconstruído)', async () => {
    const user = userEvent.setup()
    await openPanel()

    const reset = panel().querySelector<HTMLElement>('.a11y-reset-btn')
    if (!reset) throw new Error('botão Restaurar padrões não encontrado')
    await user.click(reset)

    expect(document.querySelectorAll(`#${PANEL_ID}`)).toHaveLength(1)
    expect(screen.getByRole('dialog', { name: VISIBLE_TITLE })).toBe(panel())
  })
})
