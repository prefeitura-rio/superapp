import FaqPagePrefRio from '@/app/(app)/(logged-in-out)/faq/prefrio/page'
import OuvidoriaPage from '@/app/(app)/(logged-in-out)/ouvidoria/page'
import ReclamacaoPage from '@/app/(app)/(logged-in-out)/ouvidoria/reclamacao/page'
import CookiesPolicy from '@/app/(app)/(logged-in-out)/politicas-de-uso-de-cookies/page'
import { faqSections } from '@/constants/faqs/pref-rio'
import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

/**
 * DEV-508 — Ouvidoria, FAQ PrefRio e Política de Cookies expõem exatamente um
 * H1 e uma hierarquia de headings sem saltos de nível (WCAG 1.3.1 / 2.4.6).
 * As páginas são reais; só o cabeçalho global (sessão e rede) vira stub sem
 * headings.
 */

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock('@/app/components/header-wrapper-client', () => ({
  default: () => <header data-testid="header" />,
}))

function headings(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'h1, h2, h3, h4, h5, h6, [role="heading"][aria-level]'
    )
  )
}

function level(el: HTMLElement): number {
  return el.getAttribute('role') === 'heading'
    ? Number(el.getAttribute('aria-level'))
    : Number(el.tagName.slice(1))
}

function expectSequentialOutline(container: HTMLElement, h1Text: string) {
  const h1s = container.querySelectorAll('h1, [role="heading"][aria-level="1"]')
  expect(h1s).toHaveLength(1)
  expect(h1s[0]).toHaveTextContent(h1Text)

  const levels = headings(container).map(level)
  expect(levels[0]).toBe(1)
  for (let i = 1; i < levels.length; i++) {
    // Descer mais de um nível de uma vez (h1 → h3, h2 → h4) quebra a hierarquia.
    expect(levels[i] - levels[i - 1]).toBeLessThanOrEqual(1)
  }
}

function levelOf(container: HTMLElement, text: string): number {
  const el = headings(container).find(h => h.textContent?.trim() === text)
  expect(el, `heading "${text}"`).toBeDefined()
  return level(el as HTMLElement)
}

describe('DEV-508 — H1 e hierarquia de headings em páginas institucionais', () => {
  it('/ouvidoria tem um único H1 e os cards são H2', () => {
    const { container } = render(<OuvidoriaPage />)

    expectSequentialOutline(container, 'Sua voz é importante')
    expect(levelOf(container, 'Elogio')).toBe(2)
    expect(levelOf(container, 'Sugestão')).toBe(2)
    expect(levelOf(container, 'Reclamação')).toBe(2)
  })

  it('/ouvidoria/reclamacao tem um único H1 e os cards são H2', () => {
    const { container } = render(<ReclamacaoPage />)

    expectSequentialOutline(container, 'Você já fez uma')
    expect(levelOf(container, 'Primeira reclamação')).toBe(2)
    expect(levelOf(container, 'Já fiz uma reclamação')).toBe(2)
  })

  it('/faq/prefrio não pula do H1 para H3 antes da primeira seção', () => {
    const { container } = render(<FaqPagePrefRio />)

    expectSequentialOutline(container, 'FAQ')
    // Perguntas da seção sem título ficam logo abaixo do H1.
    expect(levelOf(container, 'O que é a Plataforma PrefRio?')).toBe(2)
    // Seções com título seguem H2, e as perguntas delas, H3.
    expect(levelOf(container, 'Funcionalidades e Serviços')).toBe(2)
    expect(
      levelOf(container, 'Quais serviços estarão disponíveis no lançamento?')
    ).toBe(3)
    expect(faqSections[0].title).toBeUndefined()
  })

  it('/politicas-de-uso-de-cookies não pula de H2 para H4', () => {
    const { container } = render(<CookiesPolicy />)

    expectSequentialOutline(container, 'Política de Cookies')
    expect(levelOf(container, 'Cookies Essenciais')).toBe(3)
    expect(levelOf(container, 'Cookies de Análise')).toBe(3)
    expect(levelOf(container, 'Cookies Funcionais')).toBe(3)
    expect(levelOf(container, 'Configurações do Navegador')).toBe(3)
  })
})
