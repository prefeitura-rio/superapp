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

function ttsSubRows(): HTMLElement[] {
  const controls = panel().querySelector<HTMLElement>('.a11y-tts-controls-row')
  const speed = byLabel('Velocidade da leitura').closest<HTMLElement>(
    '.a11y-row-sub'
  )
  return [controls, speed].filter((row): row is HTMLElement => row !== null)
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
    // os cabeçalhos dos grupos recolhidos continuam alcançáveis
    for (const title of [
      'Cores / Visão',
      'Movimento / Foco',
      'Leitura em Voz',
    ]) {
      expect(sequence).toContain(trigger(title))
    }
    // os controles de dentro dos grupos recolhidos, não
    for (const label of [
      'Ativar alto contraste',
      'Parar animações da página',
      'Ativar máscara de leitura',
      'Diminuir Intensidade da máscara',
      'Pausar leitura',
      'Parar leitura',
      'Diminuir Velocidade da leitura',
    ]) {
      expect(sequence).not.toContain(byLabel(label))
    }
    // o grupo aberto (Texto) segue no Tab
    expect(sequence).toContain(byLabel('Aumentar Tamanho de fonte'))
  })

  it('corpo do grupo é inerte enquanto recolhido e volta ao abrir', async () => {
    const user = userEvent.setup()
    await openPanel(user)

    expect(accordionBody('Texto')).not.toHaveAttribute('inert')
    for (const title of [
      'Cores / Visão',
      'Movimento / Foco',
      'Leitura em Voz',
    ]) {
      expect(trigger(title)).toHaveAttribute('aria-expanded', 'false')
      expect(accordionBody(title)).toHaveAttribute('inert')
    }

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
    expect(document.activeElement).toBe(trigger('Leitura em Voz'))

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

  it('controles e velocidade da leitura em voz ficam fora do Tab com o recurso desligado', async () => {
    const user = userEvent.setup()
    await openPanel(user)
    await user.click(trigger('Leitura em Voz'))

    for (const row of ttsSubRows()) {
      expect(row).toHaveClass('a11y-row-sub-hidden')
      expect(row).toHaveAttribute('inert')
    }
    trigger('Leitura em Voz').focus()
    const sequence = await tabSequence(user)

    expect(sequence.filter(isHiddenFromUser)).toEqual([])
    expect(sequence).not.toContain(byLabel('Pausar leitura'))
    expect(sequence).not.toContain(byLabel('Diminuir Velocidade da leitura'))
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
