import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { init } from '../../index'
import { PANEL_ID } from '../panel'

/**
 * DEV-111 — conteúdo recolhido ou oculto do painel de acessibilidade (corpo
 * dos grupos fechados e sub-opções desligadas) fica fora da ordem do Tab e da
 * árvore de acessibilidade enquanto fechado (WCAG 2.4.3 e 2.4.7).
 */

type User = ReturnType<typeof userEvent.setup>

function panel(): HTMLElement {
  const el = document.getElementById(PANEL_ID)
  if (!el) throw new Error('painel de acessibilidade não montado')
  return el
}

function byLabel(label: string): HTMLElement {
  const el = panel().querySelector<HTMLElement>(`[aria-label="${label}"]`)
  if (!el) throw new Error(`elemento "${label}" não encontrado`)
  return el
}

function trigger(title: string): HTMLButtonElement {
  const found = Array.from(
    panel().querySelectorAll<HTMLButtonElement>('.a11y-accordion-trigger')
  ).find(t => t.textContent?.includes(title))
  if (!found) throw new Error(`grupo "${title}" não encontrado`)
  return found
}

function accordionBody(title: string): HTMLElement {
  const id = trigger(title).getAttribute('aria-controls')
  const el = id ? document.getElementById(id) : null
  if (!el) throw new Error(`corpo do grupo "${title}" não encontrado`)
  return el
}

function resetButton(): HTMLElement {
  const el = panel().querySelector<HTMLElement>('.a11y-reset-btn')
  if (!el) throw new Error('botão Restaurar padrões não encontrado')
  return el
}

function maskSubRows(): HTMLElement[] {
  return ['Intensidade da máscara', 'Altura da máscara', 'Largura da máscara']
    .map(label => byLabel(label).closest<HTMLElement>('.a11y-row-sub'))
    .filter((row): row is HTMLElement => row !== null)
}

function isHiddenFromUser(el: Element): boolean {
  return el.closest('[inert]') !== null
}

async function openPanel(user: User): Promise<void> {
  const btn = document.getElementById('a11y-btn')
  if (!btn) throw new Error('botão do painel não montado')
  btn.focus()
  await user.keyboard('{Enter}')
  expect(panel()).toHaveClass('a11y-open')
}

/** Percorre o painel com Tab a partir do foco atual até "Restaurar padrões". */
async function tabSequence(user: User): Promise<HTMLElement[]> {
  const seen: HTMLElement[] = []
  const max = panel().querySelectorAll('button, input').length + 1
  for (let i = 0; i < max; i++) {
    await user.tab()
    const active = document.activeElement
    if (!(active instanceof HTMLElement) || !panel().contains(active)) break
    seen.push(active)
    if (active === resetButton()) break
  }
  return seen
}

describe('painel de acessibilidade — conteúdo recolhido fora do Tab (DEV-111)', () => {
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

  it('com as preferências padrão, o Tab passa só pelos controles visíveis', async () => {
    const user = userEvent.setup()
    await openPanel(user)

    const sequence = await tabSequence(user)

    expect(sequence.at(-1)).toBe(resetButton())
    expect(sequence.filter(isHiddenFromUser)).toEqual([])
    // sem recurso ativo, todos os grupos nascem recolhidos (PR #735), mas os
    // cabeçalhos continuam alcançáveis
    for (const title of ['Texto', 'Cores / Visão', 'Movimento / Foco']) {
      expect(sequence).toContain(trigger(title))
    }
    // os controles de dentro dos grupos recolhidos, não
    for (const label of [
      'Aumentar Tamanho de fonte',
      'Ativar alto contraste',
      'Parar animações da página',
      'Ativar máscara de leitura',
      'Diminuir Intensidade da máscara',
    ]) {
      expect(sequence).not.toContain(byLabel(label))
    }
  })

  it('corpo do grupo é inerte enquanto recolhido e volta ao abrir', async () => {
    const user = userEvent.setup()
    await openPanel(user)

    for (const title of ['Texto', 'Cores / Visão', 'Movimento / Foco']) {
      expect(trigger(title)).toHaveAttribute('aria-expanded', 'false')
      expect(accordionBody(title)).toHaveAttribute('inert')
    }

    await user.click(trigger('Texto'))

    expect(trigger('Texto')).toHaveAttribute('aria-expanded', 'true')
    expect(accordionBody('Texto')).not.toHaveAttribute('inert')
    await user.tab()
    expect(document.activeElement).toBe(byLabel('Aumentar Tamanho de fonte'))

    await user.click(trigger('Cores / Visão'))

    expect(trigger('Cores / Visão')).toHaveAttribute('aria-expanded', 'true')
    expect(accordionBody('Cores / Visão')).not.toHaveAttribute('inert')
    // abrir um grupo recolhe o anterior, que fica inerte
    expect(trigger('Texto')).toHaveAttribute('aria-expanded', 'false')
    expect(accordionBody('Texto')).toHaveAttribute('inert')

    await user.tab()
    expect(document.activeElement).toBe(byLabel('Ativar alto contraste'))

    await user.click(trigger('Cores / Visão'))
    expect(accordionBody('Cores / Visão')).toHaveAttribute('inert')
  })

  it('ao abrir um grupo, o Tab segue a ordem e pula o grupo recolhido', async () => {
    const user = userEvent.setup()
    await openPanel(user)
    await user.click(trigger('Cores / Visão'))

    trigger('Texto').focus()
    await user.tab()

    expect(document.activeElement).toBe(trigger('Cores / Visão'))
  })

  it('sub-opções da máscara saem do Tab com a máscara desligada e voltam ao ligar', async () => {
    const user = userEvent.setup()
    await openPanel(user)
    await user.click(trigger('Movimento / Foco'))

    for (const row of maskSubRows()) {
      expect(row).toHaveClass('a11y-row-sub-hidden')
      expect(row).toHaveAttribute('inert')
    }
    byLabel('Ativar máscara de leitura').focus()
    await user.tab()
    // "Movimento / Foco" é o último grupo: o próximo controle visível depois
    // da máscara desligada é o rodapé, sem passar pelas sub-opções ocultas
    expect(document.activeElement).toBe(resetButton())

    await user.click(byLabel('Ativar máscara de leitura'))

    for (const row of maskSubRows()) {
      expect(row).not.toHaveClass('a11y-row-sub-hidden')
      expect(row).not.toHaveAttribute('inert')
    }
    byLabel('Ativar máscara de leitura').focus()
    await user.tab()
    expect(document.activeElement).toBe(
      byLabel('Diminuir Intensidade da máscara')
    )

    await user.click(byLabel('Ativar máscara de leitura'))

    for (const row of maskSubRows()) {
      expect(row).toHaveClass('a11y-row-sub-hidden')
      expect(row).toHaveAttribute('inert')
    }
  })

  it('preferências salvas com a máscara ligada abrem o grupo com as sub-opções no Tab', async () => {
    document.getElementById(PANEL_ID)?.remove()
    document.getElementById('a11y-btn')?.remove()
    localStorage.setItem(
      'a11y-preferences',
      JSON.stringify({ readingMask: true })
    )
    init()
    const user = userEvent.setup()
    await openPanel(user)

    expect(accordionBody('Movimento / Foco')).not.toHaveAttribute('inert')
    for (const row of maskSubRows()) {
      expect(row).not.toHaveAttribute('inert')
    }
    expect(accordionBody('Texto')).toHaveAttribute('inert')

    const sequence = await tabSequence(user)
    expect(sequence).toContain(byLabel('Diminuir Intensidade da máscara'))
    expect(sequence).not.toContain(byLabel('Aumentar Tamanho de fonte'))
    expect(sequence.filter(isHiddenFromUser)).toEqual([])
  })
})
