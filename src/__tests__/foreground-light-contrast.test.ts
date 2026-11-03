// @vitest-environment node
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * `text-foreground-light` é o texto secundário de Minhas Solicitações, do
 * detalhe da solicitação e da Ouvidoria (datas, protocolo, rótulos e timeline),
 * sobre `bg-card` e os demais fundos claros do tema. WCAG 2.1 AA (1.4.3) exige
 * contraste mínimo de 4.5:1 para texto normal.
 */

const MIN_CONTRAST = 4.5
const LIGHT_SURFACES = ['--background', '--card', '--muted', '--popover']

const css = readFileSync(path.resolve(__dirname, '../app/globals.css'), 'utf8')

function lightThemeToken(name: string): string {
  const root = css.match(/:root\s*\{([^}]*)\}/)
  if (!root) throw new Error('bloco :root não encontrado em globals.css')
  const value = root[1].match(
    new RegExp(`(?:^|\\s)${name}:\\s*(#[0-9a-fA-F]{6})\\s*;`)
  )
  if (!value) throw new Error(`token ${name} sem cor hex no :root`)
  return value[1]
}

function relativeLuminance(hex: string): number {
  const channels = [1, 3, 5].map(i => {
    const c = Number.parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
}

function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a)
  const lb = relativeLuminance(b)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

describe('contraste do token foreground-light (tema claro)', () => {
  it('calcula a razão de contraste como a WCAG', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5)
    expect(contrastRatio('#71717b', '#f1f1f4')).toBeCloseTo(4.28, 2)
  })

  it.each(LIGHT_SURFACES)('tem pelo menos 4.5:1 sobre %s', surface => {
    const foreground = lightThemeToken('--foreground-light')
    const background = lightThemeToken(surface)
    expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(
      MIN_CONTRAST
    )
  })
})
