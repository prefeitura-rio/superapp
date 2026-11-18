import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { FormattedContent } from '@/lib/faq-utils'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

/**
 * DEV-581 — o texto das respostas de FAQ (`FormattedContent`) precisa de
 * contraste de pelo menos 4.5:1 com o fundo da página (WCAG 2.1 AA, 1.4.3,
 * texto normal), nos temas claro e escuro e em todas as chamadas do
 * componente. O contraste é calculado a partir das classes realmente
 * aplicadas no `<p>` e dos tokens de `globals.css`, compondo a opacidade do
 * Tailwind (`opacity-*`) sobre o fundo.
 */

const WCAG_AA_NORMAL_TEXT = 4.5
const SURFACES = ['background', 'card'] as const

type Rgb = readonly [number, number, number]
type Theme = 'light' | 'dark'

const SRC = path.resolve(__dirname, '..')
const css = readFileSync(path.join(SRC, 'app/globals.css'), 'utf8')

function themeTokens(theme: Theme): Map<string, string> {
  const selector = theme === 'light' ? ':root' : '\\.dark'
  const block = css.match(new RegExp(`(?:^|\\n)${selector}\\s*\\{([^}]*)\\}`))
  if (!block) throw new Error(`bloco ${selector} não encontrado em globals.css`)
  const tokens = new Map<string, string>()
  for (const [, name, value] of block[1].matchAll(/--([\w-]+):\s*([^;]+);/g)) {
    tokens.set(name, value.trim())
  }
  return tokens
}

function hexToRgb(hex: string): Rgb {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) throw new Error(`cor não hex: ${hex}`)
  return [1, 3, 5].map(i => Number.parseInt(hex.slice(i, i + 2), 16)) as [
    number,
    number,
    number,
  ]
}

function token(theme: Theme, name: string): Rgb {
  const value = themeTokens(theme).get(name)
  if (!value) throw new Error(`--${name} ausente no tema ${theme}`)
  return hexToRgb(value)
}

function relativeLuminance([r, g, b]: Rgb): number {
  const [lr, lg, lb] = [r, g, b].map(v => {
    const c = v / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb
}

function contrastRatio(a: Rgb, b: Rgb): number {
  const la = relativeLuminance(a)
  const lb = relativeLuminance(b)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

function composite(fg: Rgb, bg: Rgb, alpha: number): Rgb {
  return fg.map((c, i) => c * alpha + bg[i] * (1 - alpha)) as unknown as Rgb
}

/** Cor efetiva do texto do `<p>`: token `text-*` composto com `opacity-*`. */
function effectiveTextColor(classes: string[], theme: Theme, bg: Rgb): Rgb {
  const colorClass = classes.find(c =>
    /^text-(foreground|foreground-light)$/.test(c)
  )
  if (!colorClass) {
    throw new Error(`sem classe de cor de texto: ${classes.join(' ')}`)
  }
  const opacityClass = classes.find(c => /^opacity-\d+$/.test(c))
  const alpha = opacityClass ? Number(opacityClass.split('-')[1]) / 100 : 1
  return composite(token(theme, colorClass.slice('text-'.length)), bg, alpha)
}

function paragraphClasses(className?: string): string[] {
  const { container } = render(
    <FormattedContent
      content="Resposta com **negrito** e texto."
      className={className}
    />
  )
  const p = container.querySelector('p')
  if (!p) throw new Error('FormattedContent não renderizou <p>')
  return Array.from(p.classList)
}

function filesUnder(dir: string): string[] {
  return readdirSync(dir).flatMap(entry => {
    const full = path.join(dir, entry)
    if (statSync(full).isDirectory()) return filesUnder(full)
    return full.endsWith('.tsx') ? [full] : []
  })
}

/** `className` literal de cada chamada de `<FormattedContent>` em `src/app`. */
function callSiteClassNames(): Array<[string, string | undefined]> {
  const sites: Array<[string, string | undefined]> = []
  for (const file of filesUnder(path.join(SRC, 'app'))) {
    const source = readFileSync(file, 'utf8')
    for (const [tag] of source.matchAll(/<FormattedContent\b[^>]*?\/>/g)) {
      const className = tag.match(/className="([^"]*)"/)?.[1]
      sites.push([path.relative(SRC, file), className])
    }
  }
  return sites
}

describe('FormattedContent: contraste do texto das respostas de FAQ', () => {
  it('não aplica opacidade reduzida no texto por padrão', () => {
    const classes = paragraphClasses()
    expect(
      classes.filter(c => /^opacity-\d+$/.test(c) && c !== 'opacity-100')
    ).toEqual([])
  })

  const sites = callSiteClassNames()

  it('encontra as chamadas de FAQ do app', () => {
    expect(sites.length).toBeGreaterThanOrEqual(7)
  })

  for (const theme of ['light', 'dark'] as const) {
    for (const surface of SURFACES) {
      it(`tem pelo menos 4.5:1 sobre --${surface} no tema ${theme}, em todas as chamadas`, () => {
        const bg = token(theme, surface)
        for (const [file, className] of [
          ['padrão', undefined] as const,
          ...sites,
        ]) {
          const fg = effectiveTextColor(paragraphClasses(className), theme, bg)
          expect(
            contrastRatio(fg, bg),
            `${file} (${className ?? 'sem className'})`
          ).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT)
        }
      })
    }
  }
})
