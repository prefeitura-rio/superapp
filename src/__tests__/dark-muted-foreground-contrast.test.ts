// @vitest-environment node
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * `text-muted-foreground` é o texto secundário do portal ("Faça seu login",
 * placeholder e sugestões da busca, descrições de card e de formulário). No
 * tema escuro (`.dark`, aplicado pelo `ThemeProvider` com `enableSystem`) ele
 * fica sobre os fundos escuros do tema, e a WCAG 2.1 AA (critério 1.4.3) pede
 * pelo menos 4.5:1 para texto normal.
 */

const GLOBALS_CSS = path.resolve(__dirname, '../app/globals.css')
const WCAG_AA_NORMAL_TEXT = 4.5

// Fundos escuros do tema sobre os quais o token aparece no modo escuro.
const DARK_SURFACES = ['background', 'card', 'popover', 'input', 'secondary']

function readDarkTokens(): Map<string, string> {
  const css = readFileSync(GLOBALS_CSS, 'utf8')
  const block = css.match(/^\.dark\s*\{([^}]*)\}/m)
  if (!block) throw new Error('bloco .dark não encontrado em globals.css')

  const tokens = new Map<string, string>()
  for (const [, name, value] of block[1].matchAll(
    /--([\w-]+):\s*(#[0-9a-fA-F]{6})\s*;/g
  )) {
    tokens.set(name, value)
  }
  return tokens
}

function darkToken(tokens: Map<string, string>, name: string): string {
  const value = tokens.get(name)
  if (!value) throw new Error(`--${name} sem cor hexadecimal no bloco .dark`)
  return value
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map(i => {
    const channel = Number.parseInt(hex.slice(i, i + 2), 16) / 255
    return channel <= 0.03928
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrastRatio(foreground: string, background: string): number {
  const [lighter, darker] = [
    relativeLuminance(foreground),
    relativeLuminance(background),
  ].sort((a, b) => b - a)
  return (lighter + 0.05) / (darker + 0.05)
}

describe('tema escuro: --muted-foreground', () => {
  const tokens = readDarkTokens()
  const mutedForeground = darkToken(tokens, 'muted-foreground')

  it('calcula o contraste pela fórmula da WCAG', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5)
    expect(contrastRatio('#737373', '#09090b')).toBeCloseTo(4.2, 2)
  })

  it.each(DARK_SURFACES)('tem pelo menos 4.5:1 sobre --%s', surface => {
    const ratio = contrastRatio(mutedForeground, darkToken(tokens, surface))
    expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT)
  })
})
