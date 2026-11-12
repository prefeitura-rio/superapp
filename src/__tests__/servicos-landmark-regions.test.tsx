import ServicosLayout from '@/app/(app)/(logged-in-out)/servicos/(servicos)/layout'
import { render, screen, within } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

/**
 * DEV-402 — em /servicos/cursos e /servicos/trabalho, a Faixa 2 do
 * OportunidadesSubHeader (logo Oportunidades Cariocas), a busca "O que você
 * precisa?" e o seletor de tipo ficavam fora de qualquer landmark (axe
 * `region`). Layout, sub-header e cabeçalho são reais; só sessão e navegação
 * viram stub.
 */

const pathname = { current: '/servicos/cursos' }

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => pathname.current,
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock('@/providers/auth-header-provider', () => ({
  AuthHeaderProvider: ({ children }: { children: ReactNode }) => children,
  useAuthHeader: () => ({
    data: { isLoggedIn: false, userAvatarName: null, userAvatarUrl: null },
    isLoading: false,
    refetch: async () => {},
  }),
}))

vi.mock('@/lib/feature-flags', () => ({
  isFeatureEnabled: (feature: string) =>
    feature === 'cursos' || feature === 'empregos',
  isSalesforceServicesEnabled: () => false,
}))

vi.mock('@/app/components/float-navigation-wrapper', () => ({
  FloatNavigationWrapper: () => null,
}))

/**
 * Landmarks reconhecidos pela regra `region` do axe-core: `main`, `nav`,
 * `aside`, `header`/`footer` fora de conteúdo seccionado, e `section`/`form`
 * com nome acessível, além dos `role` equivalentes.
 */
const LANDMARK_SELECTOR = [
  'main',
  'nav',
  'aside',
  'header',
  'footer',
  'section[aria-label]',
  'section[aria-labelledby]',
  'form[aria-label]',
  'form[aria-labelledby]',
  '[role="main"]',
  '[role="navigation"]',
  '[role="banner"]',
  '[role="contentinfo"]',
  '[role="complementary"]',
  '[role="search"]',
  '[role="region"][aria-label]',
  '[role="region"][aria-labelledby]',
].join(', ')

/** Elementos com conteúdo perceptível (texto próprio ou imagem) fora de landmarks. */
function contentOutsideLandmarks(container: HTMLElement): string[] {
  const offenders: string[] = []
  for (const el of Array.from(container.querySelectorAll<HTMLElement>('*'))) {
    const ownText = Array.from(el.childNodes)
      .filter(node => node.nodeType === Node.TEXT_NODE)
      .map(node => node.textContent?.trim() ?? '')
      .join('')
    const isImage = el.matches('img, svg:not([aria-hidden="true"])')
    if (!ownText && !isImage) continue
    if (el.closest('[aria-hidden="true"]')) continue
    if (el.closest(LANDMARK_SELECTOR)) continue
    offenders.push(
      `<${el.tagName.toLowerCase()}> ${ownText || el.getAttribute('alt') || ''}`.trim()
    )
  }
  return offenders
}

function renderListing(route: string) {
  pathname.current = route
  return render(
    <ServicosLayout>
      <h1>Página</h1>
    </ServicosLayout>
  )
}

describe('DEV-402 — conteúdo de /servicos/(cursos|trabalho) dentro de landmarks', () => {
  it.each(['/servicos/cursos', '/servicos/trabalho'])(
    '%s não tem conteúdo fora de landmarks',
    route => {
      const { container } = renderListing(route)

      expect(contentOutsideLandmarks(container)).toEqual([])
    }
  )

  it.each(['/servicos/cursos', '/servicos/trabalho'])(
    '%s põe o logo Oportunidades Cariocas num nav nomeado',
    route => {
      renderListing(route)

      const nav = screen.getByRole('navigation', {
        name: 'Oportunidades Cariocas',
      })
      expect(
        within(nav).getAllByRole('img', { name: 'Oportunidades Cariocas' })
      ).toHaveLength(2)
    }
  )

  it.each(['/servicos/cursos', '/servicos/trabalho'])(
    '%s põe a busca e o seletor de tipo dentro do <main>',
    route => {
      renderListing(route)

      const main = screen.getByRole('main')
      expect(within(main).getByText('O que você precisa?')).toBeInTheDocument()
      expect(
        within(main).getByRole('link', { name: 'Cursos' })
      ).toBeInTheDocument()
      expect(
        within(main).getByRole('link', { name: 'Trabalho' })
      ).toBeInTheDocument()
    }
  )

  it.each(['/servicos/cursos', '/servicos/trabalho'])(
    '%s mantém um único <main> e um único banner',
    route => {
      renderListing(route)

      expect(screen.getAllByRole('main')).toHaveLength(1)
      expect(screen.getAllByRole('banner')).toHaveLength(1)
      expect(
        within(screen.getByRole('main')).getByRole('heading', { level: 1 })
      ).toHaveTextContent('Página')
    }
  )
})
