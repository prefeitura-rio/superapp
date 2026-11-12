import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { STYLES_ID, injectStyles } from '../styles'

/**
 * DEV-549 — os botões de pausar/parar e o progresso da Leitura em Voz (no
 * painel e no widget flutuante) ficavam com área clicável 0×0 porque a folha
 * de estilos do plugin não tinha nenhuma regra para `#a11y-tts-widget`,
 * `.a11y-tts-btn` e `.a11y-tts-progress`. As regras precisam existir na folha
 * injetada para que os controles sejam visíveis e operáveis por mouse/touch.
 */

function styleRules(): CSSStyleRule[] {
  const el = document.getElementById(STYLES_ID)
  if (!(el instanceof HTMLStyleElement) || !el.sheet) {
    throw new Error('folha de estilos do plugin não injetada')
  }
  return Array.from(el.sheet.cssRules).filter(
    (r): r is CSSStyleRule => r instanceof CSSStyleRule
  )
}

/** Regra cuja lista de seletores contém exatamente `selector`. */
function rule(selector: string): CSSStyleDeclaration {
  const found = styleRules().find(r =>
    r.selectorText.split(',').some(s => s.trim() === selector)
  )
  if (!found) throw new Error(`sem regra CSS para "${selector}"`)
  return found.style
}

describe('estilos da Leitura em Voz (DEV-549)', () => {
  beforeEach(() => {
    document.getElementById(STYLES_ID)?.remove()
    injectStyles()
  })

  afterEach(() => {
    document.getElementById(STYLES_ID)?.remove()
  })

  it('o widget flutuante é fixo na tela, acima do conteúdo', () => {
    const widget = rule('#a11y-tts-widget')
    expect(widget.position).toBe('fixed')
    expect(widget.display).toBe('flex')
    expect(Number(widget.zIndex)).toBeGreaterThan(0)
  })

  it('os botões de pausar/parar têm área clicável de 32×32', () => {
    const btn = rule('.a11y-tts-btn')
    expect(btn.width).toBe('32px')
    expect(btn.height).toBe('32px')
    expect(btn.cursor).toBe('pointer')
    expect(btn.display).toBe('flex')
  })

  it('o ícone dos botões é visível e os botões têm foco visível', () => {
    const icon = rule('.a11y-tts-btn svg')
    expect(icon.width).toBe('15px')
    expect(icon.height).toBe('15px')
    expect(icon.getPropertyValue('stroke').toLowerCase()).toBe('currentcolor')
    expect(rule('.a11y-tts-btn:focus-visible').outline).toMatch(/2px solid/)
  })

  it('o progresso tem largura mínima e texto legível', () => {
    const progress = rule('.a11y-tts-progress')
    expect(progress.minWidth).toBe('36px')
    expect(progress.fontSize).toBe('12px')
  })

  it('a linha de controles do painel dispõe os botões lado a lado', () => {
    const row = rule('.a11y-tts-controls-row')
    expect(row.display).toBe('flex')
    expect(row.alignItems).toBe('center')
  })

  it('o trecho lido recebe destaque visível', () => {
    expect(rule('.a11y-tts-highlight').background).not.toBe('')
  })
})
