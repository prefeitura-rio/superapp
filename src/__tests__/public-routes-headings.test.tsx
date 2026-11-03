import type { VagaCardData } from '@/app/components/empregos/vaga-card'
import type { CoursesPageResult } from '@/lib/courses-list-query'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, waitFor } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * DEV-78 — cada rota pública expõe exatamente um H1 e uma hierarquia de
 * headings sequencial (sem pular níveis). Os componentes que renderizam os
 * headings são reais; só o que depende de rede, sessão ou do layout é
 * substituído por stubs sem headings.
 */

const searchParams = { current: new URLSearchParams() }

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => searchParams.current,
}))

vi.mock('@/lib/categories', async importOriginal => {
  const actual = await importOriginal<typeof import('@/lib/categories')>()
  return {
    ...actual,
    fetchCategories: vi.fn(async () => [
      {
        name: 'Saúde',
        categorySlug: 'saude',
        icon: null,
        relevanciaMedia: 1,
        quantidadeServicos: 1,
      },
      {
        name: 'Educação',
        categorySlug: 'educacao',
        icon: null,
        relevanciaMedia: 1,
        quantidadeServicos: 1,
      },
    ]),
  }
})

// Componentes sem headings que dependem de sessão, rede ou APIs do navegador.
vi.mock('@/app/components/header-wrapper-client', () => ({
  default: () => <header data-testid="header" />,
}))
vi.mock('@/app/components/oportunidades/oportunidades-sub-header', () => ({
  OportunidadesSubHeader: () => <header data-testid="sub-header" />,
}))
vi.mock('@/app/components/float-navigation-wrapper', () => ({
  FloatNavigationWrapper: () => null,
}))
vi.mock('@/app/components/pending-invite-section', () => ({
  PendingInviteSection: () => null,
}))
vi.mock('@/app/components/wallet-section-client', () => ({
  default: () => null,
}))
// O ResponsiveWrapper escolhe a versão pela largura da janela; aqui as duas
// versões reais dos banners de sugestão (mobile e desktop) são renderizadas,
// para que os headings delas entrem na conferência da hierarquia.
vi.mock('@/components/ui/custom/responsive-wrapper', () => ({
  ResponsiveWrapper: ({
    mobileComponent,
    desktopComponent,
  }: {
    mobileComponent: ReactNode
    desktopComponent: ReactNode
  }) => (
    <>
      <div data-testid="responsive-mobile">{mobileComponent}</div>
      <div data-testid="responsive-desktop">{desktopComponent}</div>
    </>
  ),
}))
// Visitante sem login (as rotas públicas são verificadas sem sessão).
vi.mock('@/providers/auth-status-provider', () => ({
  AuthStatusProvider: ({ children }: { children: ReactNode }) => children,
  useAuthStatus: () => ({ isLoggedIn: false, isLoading: false }),
}))
vi.mock('@/app/components/empregos/area-candidato/area-candidato', () => ({
  AreaCandidato: () => null,
}))
vi.mock('@/hooks/courses/use-user-enrollments', () => ({
  useUserEnrollments: () => ({ data: undefined, isLoading: false }),
}))
function renderWithQuery(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  )
}

function headingLevels(container: HTMLElement): number[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'h1, h2, h3, h4, h5, h6, [role="heading"][aria-level]'
    )
  ).map(el =>
    el.getAttribute('role') === 'heading'
      ? Number(el.getAttribute('aria-level'))
      : Number(el.tagName.slice(1))
  )
}

function expectSequentialOutline(container: HTMLElement, h1Text: string) {
  const h1s = container.querySelectorAll('h1, [role="heading"][aria-level="1"]')
  expect(h1s).toHaveLength(1)
  expect(h1s[0]).toHaveTextContent(h1Text)

  const levels = headingLevels(container)
  expect(levels[0]).toBe(1)
  for (let i = 1; i < levels.length; i++) {
    // Descer mais de um nível de uma vez (h1 → h3) quebra a hierarquia.
    expect(levels[i] - levels[i - 1]).toBeLessThanOrEqual(1)
  }
}

describe('DEV-78 — H1 e hierarquia de headings nas rotas públicas', () => {
  beforeEach(() => {
    searchParams.current = new URLSearchParams()
    // jsdom não implementa ResizeObserver (usado nos carrosséis de vagas).
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      }
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('/ tem um único H1 e a seção Serviços é H2', async () => {
    const { default: Home } = await import(
      '@/app/(app)/(logged-in-out)/(home)/page'
    )
    const { container } = renderWithQuery(await Home())

    // HomeCategoriesGrid mostra um skeleton até montar no cliente.
    await waitFor(() =>
      expect(
        Array.from(container.querySelectorAll('h2')).map(h => h.textContent)
      ).toContain('Serviços')
    )
    // Os banners de sugestão (antes do H2 "Serviços") estão na árvore.
    const mobileBanners = container.querySelector(
      '[data-testid="responsive-mobile"]'
    )
    const desktopBanners = container.querySelector(
      '[data-testid="responsive-desktop"]'
    )
    expect(mobileBanners).toHaveTextContent('Encontre seu trabalho')
    expect(desktopBanners).toHaveTextContent('Encontre seu trabalho')
    expectSequentialOutline(
      container,
      'Portal de serviços da Prefeitura do Rio'
    )
    const h2Texts = Array.from(container.querySelectorAll('h2')).map(
      h => h.textContent
    )
    expect(h2Texts).toEqual(
      expect.arrayContaining(['Serviços', 'Mais acessados'])
    )
  })

  it('/busca tem landmark main e um único H1', async () => {
    const { SearchPage } = await import(
      '@/app/(app)/(logged-in-out)/busca/search-page'
    )
    const { container } = renderWithQuery(
      <SearchPage cartaServicosEnabled={false} />
    )

    const main = container.querySelector('main')
    expect(main).not.toBeNull()
    expect(main?.querySelector('h1')).not.toBeNull()
    expectSequentialOutline(container, 'Busca')
  })

  it('/servicos tem um único H1', async () => {
    const { default: ServicesPage } = await import(
      '@/app/(app)/(logged-in-out)/servicos/(main)/page'
    )
    const { container } = renderWithQuery(await ServicesPage())

    expectSequentialOutline(container, 'Serviços')
  })

  it('/servicos/cursos tem um único H1 e as seções são H2 (cards em H3)', async () => {
    const { default: CoursePageClient } = await import(
      '@/app/components/courses/courses-client'
    )
    const initialCoursesPage: CoursesPageResult = {
      courses: [{ id: 1, title: 'Curso sintético' }],
      pagination: { page: 1, limit: 12, total: 1, total_pages: 1 },
    }

    const { container } = renderWithQuery(
      <CoursePageClient
        initialCoursesPage={initialCoursesPage}
        categoryFilters={[]}
      />
    )

    await waitFor(() =>
      expect(container.querySelectorAll('h2').length).toBeGreaterThan(0)
    )
    expectSequentialOutline(container, 'Cursos')
    expect(headingLevels(container)).toContain(3)
  })

  it('/servicos/cursos sem cursos também tem o H1', async () => {
    const { default: CoursePageClient } = await import(
      '@/app/components/courses/courses-client'
    )
    const { container } = renderWithQuery(
      <CoursePageClient
        initialCoursesPage={{ courses: [] }}
        categoryFilters={[]}
      />
    )

    expectSequentialOutline(container, 'Cursos')
  })

  it('/servicos/trabalho tem um único H1 e as seções são H2 (cards em H3)', async () => {
    const { EmpregosPageClient } = await import(
      '@/app/components/empregos/empregos-page-client'
    )
    const vaga: VagaCardData = {
      id: 'vaga-1',
      titulo: 'Vaga sintética',
      empresaNome: 'Empresa Exemplo',
      badges: [],
    }

    const { container } = renderWithQuery(
      <EmpregosPageClient recentVagas={[vaga, { ...vaga, id: 'vaga-2' }]} />
    )

    await waitFor(() =>
      expect(container.querySelectorAll('h2').length).toBeGreaterThan(0)
    )
    expectSequentialOutline(container, 'Trabalho')
    expect(headingLevels(container)).toContain(3)
  })
})
