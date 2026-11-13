import { readFileSync } from 'node:fs'
import path from 'node:path'
import { FloatNavigationClient } from '@/app/components/float-navigation-client'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

/**
 * DEV-161 — os rótulos da barra de navegação inferior (Home/Serviços/Documentos)
 * precisam de contraste de pelo menos 4.5:1 com o fundo da barra (WCAG 2.1 AA,
 * 1.4.3, texto normal), nos temas claro e escuro. O contraste é calculado a
 * partir da classe de cor realmente aplicada no rótulo e dos tokens de
 * `globals.css`, compondo a opacidade do Tailwind (`/80`) sobre o fundo.
 */

const pathname = { current: '/servicos/cursos' }

vi.mock('next/navigation', () => ({
  usePathname: () => pathname.current,
}))
vi.mock('@next/third-parties/google', () => ({
  sendGAEvent: vi.fn(),
}))

const WCAG_AA_NORMAL_TEXT = 4.5
const LABELS = ['Home', 'Serviços', 'Documentos'] as const

type Rgb = readonly [number, number, number]
type Theme = 'light' | 'dark'

const css = readFileSync(path.resolve(__dirname, '../app/globals.css'), 'utf8')

function themeTokens(theme: Theme): Map<string, string> {
  const selector = theme === 'light' ? ':root' : '.dark'
  const block = css.match(
    new RegExp(`(?:^|\\n)${selector.replace('.', '\\.')}\\s*\\{([^}]*)\\}`)
  )
  if (!block) throw new Error(`bloco ${selector} não encontrado em globals.css`)
  const tokens = new Map<string, string>()
  for (const [, name, value] of block[1].matchAll(/--([\w-]+):\s*([^;]+);/g)) {
    tokens.set(name, value.trim())
  }
  return tokens
}

function hexToRgb(hex: string): Rgb {
  const match = hex.match(/^#([0-9a-f]{6})$/i)
  if (!match) throw new Error(`cor não suportada no teste: ${hex}`)
  const n = Number.parseInt(match[1], 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function token(theme: Theme, name: string): Rgb {
  const value = themeTokens(theme).get(name)
  if (!value) throw new Error(`token --${name} ausente no tema ${theme}`)
  return hexToRgb(value)
}

function relativeLuminance([r, g, b]: Rgb): number {
  const [lr, lg, lb] = [r, g, b].map(channel => {
    const c = channel / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb
}

function contrastRatio(a: Rgb, b: Rgb): number {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort(
    (x, y) => y - x
  )
  return (hi + 0.05) / (lo + 0.05)
}

function composite(fg: Rgb, alpha: number, bg: Rgb): Rgb {
  const mix = (i: 0 | 1 | 2) => Math.round(fg[i] * alpha + bg[i] * (1 - alpha))
  return [mix(0), mix(1), mix(2)]
}

/** Cor efetiva de `text-<token>[/<opacidade>]` sobre o fundo informado. */
function labelColor(className: string, theme: Theme, background: Rgb): Rgb {
  const tokens = themeTokens(theme)
  const colorClasses = className
    .split(/\s+/)
    .map(cls => cls.match(/^text-([a-z-]+?)(?:\/(\d{1,3}))?$/))
    .filter((m): m is RegExpMatchArray => m !== null && tokens.has(m[1]))
  if (colorClasses.length !== 1) {
    throw new Error(`rótulo deve ter uma classe de cor: "${className}"`)
  }
  const [, name, opacity] = colorClasses[0]
  const alpha = opacity === undefined ? 1 : Number(opacity) / 100
  return composite(token(theme, name), alpha, background)
}

function renderLabels(currentPath: string) {
  pathname.current = currentPath
  render(<FloatNavigationClient walletUrl="/carteira" />)
  return LABELS.map(label => ({ label, element: screen.getByText(label) }))
}

describe('DEV-161 — contraste dos rótulos da navegação inferior', () => {
  const themes: Theme[] = ['light', 'dark']

  for (const theme of themes) {
    it(`rótulos inativos têm contraste >= 4.5:1 no tema ${theme}`, () => {
      const background = token(theme, 'background')
      for (const { label, element } of renderLabels('/servicos/cursos')) {
        const ratio = contrastRatio(
          labelColor(element.className, theme, background),
          background
        )
        expect(
          ratio,
          `${label}: ${ratio.toFixed(2)}:1 (${element.className})`
        ).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT)
      }
    })
  }

  it('rótulo ativo mantém contraste >= 4.5:1 nos dois temas', () => {
    const [home] = renderLabels('/')
    for (const theme of themes) {
      const background = token(theme, 'background')
      const ratio = contrastRatio(
        labelColor(home.element.className, theme, background),
        background
      )
      expect(ratio, `${theme}: ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(
        WCAG_AA_NORMAL_TEXT
      )
    }
  })

  it('reproduz a medição do QA para a classe antiga (text-foreground-light/80)', () => {
    const background = token('light', 'background')
    const ratio = contrastRatio(
      labelColor('text-foreground-light/80', 'light', background),
      background
    )
    expect(ratio).toBeLessThan(WCAG_AA_NORMAL_TEXT)
  })
})
