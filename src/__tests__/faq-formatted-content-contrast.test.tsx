import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { FormattedContent } from '@/lib/faq-utils'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

/**
 * DEV-581 — o texto das respostas de FAQ (`FormattedContent`) precisa de
 * contraste de pelo menos 4.5:1 com o fundo da página (WCAG 2.1 AA, 1.4.3,
 * texto normal), nos temas claro e escuro e em todas as chamadas do
 * componente, inclusive no termo destacado pela busca (`<mark>`). O contraste é calculado a partir das classes realmente
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

/**
 * Fundo do termo destacado pela busca (`<mark>` de `highlightText`):
 * `bg-neutral-200` / `dark:bg-neutral-700` da paleta padrão do Tailwind 4
 * (`oklch(92.2% 0 0)` e `oklch(37.1% 0 0)`), convertidos para sRGB.
 */
const MARK_BACKGROUND: Record<Theme, Rgb> = {
  light: hexToRgb('#e5e5e5'),
  dark: hexToRgb('#404040'),
}

function colorToken(classes: string[]): string | undefined {
  return classes
    .find(c => /^text-(foreground|foreground-light)$/.test(c))
    ?.slice('text-'.length)
}

function opacityOf(classes: string[]): number {
  const opacityClass = classes.find(c => /^opacity-\d+$/.test(c))
  return opacityClass ? Number(opacityClass.split('-')[1]) / 100 : 1
}

type Rendered = { paragraph: string[]; mark: string[] }

function renderClasses(className?: string): Rendered {
  const { container, unmount } = render(
    <FormattedContent
      content="Resposta sobre o CPF com **negrito** e texto."
      className={className}
      query="cpf"
    />
  )
  const p = container.querySelector('p')
  const mark = container.querySelector('mark')
  if (!p) throw new Error('FormattedContent não renderizou <p>')
  if (!mark) throw new Error('FormattedContent não destacou o termo buscado')
  const rendered = {
    paragraph: Array.from(p.classList),
    mark: Array.from(mark.classList),
  }
  unmount()
  return rendered
}

/** Contraste do texto do `<p>` sobre o fundo da página, compondo `opacity-*`. */
function paragraphContrast(r: Rendered, theme: Theme, pageBg: Rgb): number {
  const name = colorToken(r.paragraph)
  if (!name) throw new Error(`sem cor de texto: ${r.paragraph.join(' ')}`)
  const fg = composite(token(theme, name), pageBg, opacityOf(r.paragraph))
  return contrastRatio(fg, pageBg)
}

/** Contraste do termo destacado sobre o fundo do `<mark>`. */
function markContrast(r: Rendered, theme: Theme, pageBg: Rgb): number {
  const name = colorToken(r.mark) ?? colorToken(r.paragraph)
  if (!name) throw new Error(`sem cor de texto: ${r.mark.join(' ')}`)
  const alpha = opacityOf(r.paragraph)
  const markBg = composite(MARK_BACKGROUND[theme], pageBg, alpha)
  const fg = composite(token(theme, name), pageBg, alpha)
  return contrastRatio(fg, markBg)
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
    for (const match of source.matchAll(/<FormattedContent\b/g)) {
      const end = source.indexOf('/>', match.index)
      if (end === -1)
        throw new Error(`<FormattedContent> sem fechamento em ${file}`)
      const tag = source.slice(match.index, end)
      if (/className=\{/.test(tag)) {
        throw new Error(`className dinâmico em ${file}: o teste só lê literais`)
      }
      const className = tag.match(/className="([^"]*)"/)?.[1]
      sites.push([path.relative(SRC, file), className])
    }
  }
  return sites
}

describe('FormattedContent: contraste do texto das respostas de FAQ', () => {
  it('não aplica opacidade reduzida no texto por padrão', () => {
    const classes = renderClasses().paragraph
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
          const label = `${file} (${className ?? 'sem className'})`
          const rendered = renderClasses(className)
          expect(
            paragraphContrast(rendered, theme, bg),
            `texto: ${label}`
          ).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT)
          expect(
            markContrast(rendered, theme, bg),
            `termo destacado: ${label}`
          ).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT)
        }
      })
    }
  }
})
