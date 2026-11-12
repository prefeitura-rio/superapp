import { readFileSync } from 'node:fs'
import path from 'node:path'
import { StatusBadge } from '@/app/(app)/(logged-in)/minhas-solicitacoes/components/status-badge'
import type { RequestStatus } from '@/app/(app)/(logged-in)/minhas-solicitacoes/types'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

/**
 * DEV-202 — os badges de status de Minhas Solicitações, do detalhe da
 * solicitação e da consulta de protocolo precisam de contraste de pelo menos
 * 4.5:1 entre o texto e o fundo (WCAG 2.1 AA, 1.4.3, texto normal), nos temas
 * claro e escuro. O contraste é calculado a partir das cores realmente
 * aplicadas no badge, resolvendo os `var(--token)` pelos blocos `:root` e
 * `.dark` de `globals.css` (o `.dark` herda do `:root` o que não redefine).
 */

const WCAG_AA_NORMAL_TEXT = 4.5
const STATUSES: RequestStatus[] = [
  'Aberto',
  'Em andamento',
  'Concluído',
  'Cancelado',
]

type Rgb = readonly [number, number, number]
type Theme = 'light' | 'dark'

const css = readFileSync(path.resolve(__dirname, '../app/globals.css'), 'utf8')

function blockTokens(selector: ':root' | '.dark'): Map<string, string> {
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

function themeTokens(theme: Theme): Map<string, string> {
  const root = blockTokens(':root')
  if (theme === 'light') return root
  return new Map([...root, ...blockTokens('.dark')])
}

function parseColor(value: string): Rgb {
  const rgb = value.match(/^rgb\(\s*(\d+),\s*(\d+),\s*(\d+)\s*\)$/i)
  if (rgb) return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])]
  const hex = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)
  if (!hex) throw new Error(`cor não suportada no teste: ${value}`)
  const digits =
    hex[1].length === 3 ? [...hex[1]].map(d => d + d).join('') : hex[1]
  const n = Number.parseInt(digits, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/** Cor de `var(--token[, fallback])` ou de um hex literal no tema informado. */
function resolveColor(value: string, theme: Theme): Rgb {
  const variable = value.trim().match(/^var\(\s*--([\w-]+)\s*(?:,[^)]*)?\)$/)
  if (!variable) return parseColor(value.trim())
  const tokenValue = themeTokens(theme).get(variable[1])
  if (!tokenValue) {
    throw new Error(`token --${variable[1]} ausente no tema ${theme}`)
  }
  return parseColor(tokenValue)
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

function badgeColors(status: RequestStatus) {
  render(<StatusBadge status={status} />)
  const badge = screen.getByText(status)
  const background = badge.style.getPropertyValue('background')
  const color = badge.style.getPropertyValue('color')
  if (!background || !color) {
    throw new Error(`badge ${status} sem cor de fundo ou de texto inline`)
  }
  return { background, color }
}

describe('DEV-202 — contraste dos badges de status das solicitações', () => {
  const themes: Theme[] = ['light', 'dark']

  for (const theme of themes) {
    for (const status of STATUSES) {
      it(`${status} tem contraste >= 4.5:1 no tema ${theme}`, () => {
        const { background, color } = badgeColors(status)
        const ratio = contrastRatio(
          resolveColor(color, theme),
          resolveColor(background, theme)
        )
        expect(
          ratio,
          `${status}: ${ratio.toFixed(2)}:1 (${color} sobre ${background})`
        ).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT)
      })
    }
  }

  it('reproduz a medição do QA para os fundos antigos (--card-2/5/3)', () => {
    const text = parseColor('#f9fafb')
    for (const token of ['card-2', 'card-5', 'card-3']) {
      for (const theme of themes) {
        const ratio = contrastRatio(
          text,
          resolveColor(`var(--${token})`, theme)
        )
        expect(ratio, `--${token} (${theme})`).toBeLessThan(WCAG_AA_NORMAL_TEXT)
      }
    }
  })
})
