import { readFileSync } from 'node:fs'
import path from 'node:path'
import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import RequestDetailPage from '../page'

/**
 * DEV-203 — o badge com o número do protocolo (ao lado do status, em
 * /solicitacoes/[id]) precisa de contraste de pelo menos 4.5:1 com o próprio
 * fundo (WCAG 2.1 AA, 1.4.3, texto normal) nos temas claro e escuro. A cor e
 * o fundo são lidos do estilo realmente aplicado no botão e resolvidos com os
 * tokens de `globals.css` de cada tema; `var(--x, fallback)` cai no fallback
 * quando o token não existe no tema, como no navegador.
 */

const PROTOCOLO = 'RIO-2026-00000001'

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: PROTOCOLO }),
  useSearchParams: () => new URLSearchParams(),
}))
vi.mock('@/app/components/header-wrapper-client', () => ({
  default: () => null,
}))
vi.mock('@/app/components/float-navigation-wrapper', () => ({
  FloatNavigationWrapper: () => null,
}))

const WCAG_AA_NORMAL_TEXT = 4.5

type Rgb = readonly [number, number, number]
type Theme = 'light' | 'dark'

const css = readFileSync(
  path.resolve(__dirname, '../../../../../globals.css'),
  'utf8'
)

function themeTokens(theme: Theme): Map<string, string> {
  const tokens = new Map<string, string>()
  // O tema escuro herda do :root o que não redefine.
  const selectors = theme === 'light' ? [':root'] : [':root', '.dark']
  for (const selector of selectors) {
    const block = css.match(
      new RegExp(`(?:^|\\n)${selector.replace('.', '\\.')}\\s*\\{([^}]*)\\}`)
    )
    if (!block) {
      throw new Error(`bloco ${selector} não encontrado em globals.css`)
    }
    for (const [, name, value] of block[1].matchAll(
      /--([\w-]+):\s*([^;]+);/g
    )) {
      tokens.set(name, value.trim())
    }
  }
  return tokens
}

function hexToRgb(hex: string): Rgb {
  const match = hex.trim().match(/^#([0-9a-f]{6})$/i)
  if (!match) throw new Error(`cor não suportada no teste: ${hex}`)
  const n = Number.parseInt(match[1], 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/** Resolve `#rrggbb`, `var(--token)` ou `var(--token, fallback)` no tema. */
function resolveColor(value: string, theme: Theme): Rgb {
  const trimmed = value.trim()
  const ref = trimmed.match(/^var\(\s*--([\w-]+)\s*(?:,\s*(.+))?\)$/)
  if (!ref) return hexToRgb(trimmed)
  const [, name, fallback] = ref
  const tokenValue = themeTokens(theme).get(name)
  if (tokenValue) return resolveColor(tokenValue, theme)
  if (fallback) return resolveColor(fallback, theme)
  throw new Error(`token --${name} ausente no tema ${theme} e sem fallback`)
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

function publicResponse() {
  return {
    protocolo: PROTOCOLO,
    status: 'Aberto',
    dataAbertura: '2026-11-01T10:00:00Z',
    ordens_de_servico: [{ servico: 'Remoção de entulho', status: 'Aberto' }],
  }
}

async function renderProtocoloBadge(): Promise<HTMLElement> {
  render(<RequestDetailPage />)
  return screen.findByRole('button', { name: PROTOCOLO })
}

describe('DEV-203 — contraste do badge do protocolo em /solicitacoes/[id]', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input)
        if (url.startsWith('/api/chamados-publico/')) {
          return new Response(JSON.stringify(publicResponse()), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        }
        return new Response('{}', { status: 401 })
      })
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  for (const theme of ['light', 'dark'] as const) {
    it(`texto do protocolo tem contraste >= 4.5:1 no tema ${theme}`, async () => {
      const badge = await renderProtocoloBadge()
      const color = badge.style.getPropertyValue('color')
      const background = badge.style.getPropertyValue('background')
      expect(color, 'badge sem cor de texto explícita').not.toBe('')
      expect(background, 'badge sem fundo explícito').not.toBe('')

      const ratio = contrastRatio(
        resolveColor(color, theme),
        resolveColor(background, theme)
      )
      expect(
        ratio,
        `${theme}: ${ratio.toFixed(2)}:1 (color: ${color}; background: ${background})`
      ).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT)
    })
  }

  it('reproduz a medição do QA para a cor antiga (var(--zinc-900, #18181B)) no escuro', () => {
    const ratio = contrastRatio(
      resolveColor('var(--zinc-900, #18181B)', 'dark'),
      resolveColor('var(--secondary, #E4E4E7)', 'dark')
    )
    expect(ratio).toBeLessThan(WCAG_AA_NORMAL_TEXT)
    expect(ratio).toBeCloseTo(1.18, 1)
  })
})
