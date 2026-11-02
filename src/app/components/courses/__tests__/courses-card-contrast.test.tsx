import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { CourseCard } from '@/app/components/courses/courses-card'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

/**
 * DEV-162 — nos cards de curso de /servicos/cursos, os selos (modalidade,
 * carga horária, bolsa, acessibilidade) e o status de inscrição precisam de
 * contraste de pelo menos 4.5:1 (WCAG 2.1 AA, texto de 12px) com o fundo em
 * que aparecem, nos temas claro e escuro e também no hover do card.
 *
 * O teste lê as classes Tailwind renderizadas, resolve cada token de cor em
 * `globals.css` (`:root` e `.dark`) e calcula a razão de contraste.
 */

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} />
  ),
}))

const MIN_CONTRAST = 4.5

type Theme = 'light' | 'dark'

function readThemeTokens(): Record<Theme, Record<string, string>> {
  const css = readFileSync(resolve(__dirname, '../../../globals.css'), 'utf-8')
  const block = (selector: string): Record<string, string> => {
    const start = css.indexOf(`${selector} {`)
    if (start === -1) throw new Error(`bloco ${selector} ausente`)
    const body = css.slice(start, css.indexOf('\n}', start))
    const tokens: Record<string, string> = {}
    for (const match of body.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)) {
      tokens[match[1]] = match[2]
    }
    return tokens
  }
  return { light: block(':root'), dark: block('.dark') }
}

const tokens = readThemeTokens()

function relativeLuminance(hex: string): number {
  const channels = [1, 3, 5].map(i => Number.parseInt(hex.slice(i, i + 2), 16))
  const [r, g, b] = channels.map(value => {
    const c = value / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrastRatio(foreground: string, background: string): number {
  const a = relativeLuminance(foreground)
  const b = relativeLuminance(background)
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}

function tokenColor(theme: Theme, token: string): string {
  const color = tokens[theme][token]
  if (!color) throw new Error(`token --${token} sem cor em ${theme}`)
  return color
}

/** Último utilitário `<prefix><token>` da lista (o que vence na cascata). */
function utilityToken(classList: string[], prefix: string): string | undefined {
  const matches = classList
    .filter(c => c.startsWith(prefix))
    .map(c => c.slice(prefix.length))
    .filter(token => !token.includes(':') && !token.includes('/'))
  return matches.at(-1)
}

/** Cor de texto do elemento no tema/estado, seguindo os variantes Tailwind. */
function textToken(el: Element, theme: Theme, hover: boolean): string {
  const classes = Array.from(el.classList)
  const candidates = [
    hover && theme === 'dark' ? 'dark:group-hover:text-' : null,
    hover ? 'group-hover:text-' : null,
    theme === 'dark' ? 'dark:text-' : null,
    'text-',
  ].filter((p): p is string => p !== null)
  for (const prefix of candidates) {
    const token = utilityToken(
      classes.filter(c => !/^text-(xs|sm|base|lg|xl|left|center)/.test(c)),
      prefix
    )
    if (token) return token
  }
  throw new Error(`sem cor de texto em: ${el.className}`)
}

function backgroundToken(el: Element, hover: boolean): string {
  const classes = Array.from(el.classList)
  const token =
    (hover ? utilityToken(classes, 'group-hover:bg-') : undefined) ??
    (hover ? utilityToken(classes, 'hover:bg-') : undefined) ??
    utilityToken(classes, 'bg-')
  if (!token) throw new Error(`sem fundo em: ${el.className}`)
  return token
}

const baseProps = {
  courseId: 1,
  title: 'Curso de Programação',
  modality: 'PRESENCIAL',
  workload: '40h',
  accessibility: 'ACESSIVEL',
  hasBolsa: true,
}

const BADGE_LABELS = ['Presencial', '40h', 'Bolsa', 'Acessível PcD']

const themes: Theme[] = ['light', 'dark']

describe.each(['vertical', 'horizontal'] as const)(
  'CourseCard %s — contraste AA',
  variant => {
    function renderCard(enrollmentEndDate: string) {
      const { container } = render(
        <CourseCard
          {...baseProps}
          variant={variant}
          enrollmentEndDate={enrollmentEndDate}
        />
      )
      const card = container.querySelector('a')
      if (!card) throw new Error('card não renderizado')
      return card
    }

    // Vertical muda o fundo no hover do card; horizontal não tem fundo próprio
    // e os selos ficam sobre `bg-card`.
    const states = variant === 'vertical' ? [false, true] : [false]

    it.each(themes.flatMap(theme => states.map(hover => [theme, hover])))(
      'selos têm contraste ≥ 4.5:1 (tema %s, hover %s)',
      (theme, hover) => {
        renderCard('2999-12-31')
        for (const label of BADGE_LABELS) {
          const badge = screen.getByText(label).closest('span')
          if (!badge) throw new Error(`selo ${label} ausente`)
          const fg = tokenColor(
            theme as Theme,
            textToken(badge, theme as Theme, hover as boolean)
          )
          const bg = tokenColor(
            theme as Theme,
            backgroundToken(badge, hover as boolean)
          )
          expect(
            contrastRatio(fg, bg),
            `${label}: ${fg} sobre ${bg}`
          ).toBeGreaterThanOrEqual(MIN_CONTRAST)
        }
      }
    )

    it.each(
      themes.flatMap(theme =>
        states.flatMap(hover => [
          [theme, hover, '2999-12-31', /^Inscrições até 31 DEZ$/],
          [theme, hover, '2000-01-01', /^Inscrições encerradas$/],
        ])
      )
    )(
      'status de inscrição tem contraste ≥ 4.5:1 (tema %s, hover %s, %s)',
      (theme, hover, date, text) => {
        const card = renderCard(date as string)
        const status = screen.getByText(text as RegExp)
        const fg = tokenColor(
          theme as Theme,
          textToken(status, theme as Theme, hover as boolean)
        )
        // Horizontal: o texto fica sobre o fundo da página.
        const bgToken =
          variant === 'vertical'
            ? backgroundToken(card, hover as boolean)
            : 'background'
        const bgs = [tokenColor(theme as Theme, bgToken)]
        // A listagem também aparece sobre `card` (seções em cartão).
        if (variant === 'horizontal')
          bgs.push(tokenColor(theme as Theme, 'card'))
        for (const bg of bgs) {
          expect(
            contrastRatio(fg, bg),
            `${fg} sobre ${bg}`
          ).toBeGreaterThanOrEqual(MIN_CONTRAST)
        }
      }
    )
  }
)
