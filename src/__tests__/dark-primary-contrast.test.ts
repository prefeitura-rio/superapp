// @vitest-environment node
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * `bg-primary text-primary-foreground` é o par dos elementos de destaque do
 * portal: aba ativa do alternador "Cursos"/"Trabalho", badge "Criar agora" do
 * banner de currículo, botão e badge padrão, tooltip e página atual da
 * paginação. No tema escuro (`.dark`) o `--primary` é um azul claro, então o
 * texto sobre ele precisa ser escuro: a WCAG 2.1 AA (critério 1.4.3) pede pelo
 * menos 4.5:1 para texto normal, inclusive no hover (`hover:bg-primary/90`).
 */

const GLOBALS_CSS = path.resolve(__dirname, '../app/globals.css')
const WCAG_AA_NORMAL_TEXT = 4.5

function readTokens(selector: ':root' | '.dark'): Map<string, string> {
  const css = readFileSync(GLOBALS_CSS, 'utf8')
  const escaped = selector.replace('.', '\\.')
  const block = css.match(new RegExp(`^${escaped}\\s*\\{([^}]*)\\}`, 'm'))
  if (!block) throw new Error(`bloco ${selector} não encontrado em globals.css`)

  const tokens = new Map<string, string>()
  for (const [, name, value] of block[1].matchAll(
    /--([\w-]+):\s*(#[0-9a-fA-F]{6})\s*;/g
  )) {
    tokens.set(name, value)
  }
  return tokens
}

function token(tokens: Map<string, string>, name: string): string {
  const value = tokens.get(name)
  if (!value) throw new Error(`--${name} sem cor hexadecimal`)
  return value
}

function channels(hex: string): number[] {
  return [1, 3, 5].map(i => Number.parseInt(hex.slice(i, i + 2), 16))
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = channels(hex).map(value => {
    const channel = value / 255
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

/** Cor resultante de `color` com opacidade `alpha` sobre `base`. */
function blend(color: string, base: string, alpha: number): string {
  const top = channels(color)
  const bottom = channels(base)
  return `#${top
    .map((value, i) =>
      Math.round(value * alpha + bottom[i] * (1 - alpha))
        .toString(16)
        .padStart(2, '0')
    )
    .join('')}`
}

describe('tema escuro: --primary-foreground sobre --primary', () => {
  const dark = readTokens('.dark')
  const primary = token(dark, 'primary')
  const primaryForeground = token(dark, 'primary-foreground')

  it('calcula o contraste pela fórmula da WCAG', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5)
    expect(contrastRatio('#f8fafc', '#8ec5ff')).toBeCloseTo(1.73, 2)
    expect(blend('#ffffff', '#000000', 0.5)).toBe('#808080')
  })

  it('tem pelo menos 4.5:1 sobre --primary', () => {
    expect(contrastRatio(primaryForeground, primary)).toBeGreaterThanOrEqual(
      WCAG_AA_NORMAL_TEXT
    )
  })

  it.each(['background', 'card'])(
    'tem pelo menos 4.5:1 no hover (bg-primary/90 sobre --%s)',
    surface => {
      const hover = blend(primary, token(dark, surface), 0.9)
      expect(contrastRatio(primaryForeground, hover)).toBeGreaterThanOrEqual(
        WCAG_AA_NORMAL_TEXT
      )
    }
  )
})

describe('tema claro: --primary-foreground sobre --primary', () => {
  it('continua com pelo menos 4.5:1', () => {
    const light = readTokens(':root')
    expect(
      contrastRatio(token(light, 'primary-foreground'), token(light, 'primary'))
    ).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT)
  })
})
