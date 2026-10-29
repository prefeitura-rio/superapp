import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import type { VagaCardData } from '@/app/components/empregos/vaga-card'
import type { CoursesPageResult } from '@/lib/courses-list-query'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, waitFor } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * DEV-80 — o layout de /servicos/(servicos) já envolve as páginas no landmark
 * <main>; as páginas renderizadas dentro dele não podem abrir outro <main>
 * (WCAG 1.3.1). Layout e páginas são reais; só o que depende de rede, sessão
 * ou APIs do navegador vira stub sem landmarks.
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
    data: { isLoggedIn: false, userName: '' },
    isLoading: false,
    refetch: async () => {},
  }),
}))
vi.mock('@/providers/auth-status-provider', () => ({
  AuthStatusProvider: ({ children }: { children: ReactNode }) => children,
  useAuthStatus: () => ({ isLoggedIn: false, isLoading: false }),
}))
vi.mock('@/app/components/oportunidades/oportunidades-sub-header', () => ({
  OportunidadesSubHeader: () => <header data-testid="sub-header" />,
}))
vi.mock('@/app/components/float-navigation-wrapper', () => ({
  FloatNavigationWrapper: () => null,
}))
vi.mock('@/app/components/empregos/area-candidato/area-candidato', () => ({
  AreaCandidato: () => null,
}))
vi.mock('@/hooks/courses/use-user-enrollments', () => ({
  useUserEnrollments: () => ({ data: undefined, isLoading: false }),
}))
vi.mock('@/lib/dal', () => ({
  getDalCategorias: vi.fn(async () => ({ status: 200, data: { data: [] } })),
  getDalCourses: vi.fn(async () => ({ status: 200, data: { data: [] } })),
}))
vi.mock(
  '@/http-courses/empregabilidade-vagas-public/empregabilidade-vagas-public',
  async importOriginal => {
    const actual =
      await importOriginal<
        typeof import(
          '@/http-courses/empregabilidade-vagas-public/empregabilidade-vagas-public'
        )
      >()
    return {
      ...actual,
      getApiPublicEmpregabilidadeVagas: vi.fn(async () => ({
        status: 200,
        data: { data: [] },
      })),
    }
  }
)

function renderWithQuery(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  )
}

async function renderInServicosLayout(route: string, page: ReactElement) {
  pathname.current = route
  const { default: ServicosLayout } = await import(
    '@/app/(app)/(logged-in-out)/servicos/(servicos)/layout'
  )
  return renderWithQuery(<ServicosLayout>{page}</ServicosLayout>)
}

function expectSingleMain(container: HTMLElement) {
  expect(container.querySelectorAll('main, [role="main"]')).toHaveLength(1)
}

describe('DEV-80 — um único landmark <main> em /servicos/cursos e /servicos/trabalho', () => {
  beforeEach(() => {
    // jsdom não implementa ResizeObserver (usado nos carrosséis).
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

  it('/servicos/cursos (página real, sem cursos) tem um único <main>', async () => {
    const { default: CoursesPage } = await import(
      '@/app/(app)/(logged-in-out)/servicos/(servicos)/cursos/(main)/page'
    )
    const { container } = await renderInServicosLayout(
      '/servicos/cursos',
      await CoursesPage()
    )

    expect(container.querySelector('h1')).toHaveTextContent('Cursos')
    expectSingleMain(container)
  })

  it('/servicos/cursos (com cursos) tem um único <main> e o H1 dentro dele', async () => {
    const { default: CoursePageClient } = await import(
      '@/app/components/courses/courses-client'
    )
    const initialCoursesPage: CoursesPageResult = {
      courses: [{ id: 1, title: 'Curso sintético' }],
      pagination: { page: 1, limit: 12, total: 1, total_pages: 1 },
    }
    const { container } = await renderInServicosLayout(
      '/servicos/cursos',
      <CoursePageClient
        initialCoursesPage={initialCoursesPage}
        categoryFilters={[]}
      />
    )

    await waitFor(() =>
      expect(container.querySelectorAll('h2').length).toBeGreaterThan(0)
    )
    expectSingleMain(container)
    expect(container.querySelector('main h1')).toHaveTextContent('Cursos')
  })

  it('/servicos/cursos (loading) tem um único <main>', async () => {
    const { default: Loading } = await import(
      '@/app/(app)/(logged-in-out)/servicos/(servicos)/cursos/(main)/loading'
    )
    const { container } = await renderInServicosLayout(
      '/servicos/cursos',
      <Loading />
    )

    expectSingleMain(container)
  })

  it('/servicos/trabalho (página real) tem um único <main> e o H1 dentro dele', async () => {
    const { default: EmpregosPage } = await import(
      '@/app/(app)/(logged-in-out)/servicos/(servicos)/trabalho/(main)/page'
    )
    const { container } = await renderInServicosLayout(
      '/servicos/trabalho',
      await EmpregosPage()
    )

    expectSingleMain(container)
    expect(container.querySelector('main h1')).toHaveTextContent('Trabalho')
  })

  it('/servicos/trabalho (com vagas) tem um único <main>', async () => {
    const { EmpregosPageClient } = await import(
      '@/app/components/empregos/empregos-page-client'
    )
    const vaga: VagaCardData = {
      id: 'vaga-1',
      titulo: 'Vaga sintética',
      empresaNome: 'Empresa Exemplo',
      badges: [],
    }
    const { container } = await renderInServicosLayout(
      '/servicos/trabalho',
      <EmpregosPageClient recentVagas={[vaga, { ...vaga, id: 'vaga-2' }]} />
    )

    await waitFor(() =>
      expect(container.querySelectorAll('h2').length).toBeGreaterThan(0)
    )
    expectSingleMain(container)
  })

  it('/servicos/trabalho (loading) tem um único <main>', async () => {
    const { default: Loading } = await import(
      '@/app/(app)/(logged-in-out)/servicos/(servicos)/trabalho/(main)/loading'
    )
    const { container } = await renderInServicosLayout(
      '/servicos/trabalho',
      <Loading />
    )

    expectSingleMain(container)
  })
})

describe('DEV-80 — nada renderizado sob o layout de /servicos/(servicos) abre outro <main>', () => {
  const root = path.resolve(__dirname, '..')
  const servicosDir = path.join(
    root,
    'app/(app)/(logged-in-out)/servicos/(servicos)'
  )
  const layoutFile = path.join(servicosDir, 'layout.tsx')
  // Componentes compartilhados que só são usados por páginas sob esse layout.
  const sharedComponents = [
    'app/components/courses/courses-client.tsx',
    'app/components/mei/mei-page-client.tsx',
    'app/components/empregos/minhas-candidaturas-page-client.tsx',
  ].map(file => path.join(root, file))

  function listTsx(dir: string): string[] {
    return readdirSync(dir).flatMap(entry => {
      const full = path.join(dir, entry)
      if (statSync(full).isDirectory()) return listTsx(full)
      return full.endsWith('.tsx') ? [full] : []
    })
  }

  it('o layout é o único com <main>', () => {
    expect(readFileSync(layoutFile, 'utf8')).toMatch(/<main[\s>]/)

    const offenders = [...listTsx(servicosDir), ...sharedComponents]
      .filter(file => file !== layoutFile)
      .filter(file =>
        /<main[\s>]|role=["']main["']/.test(readFileSync(file, 'utf8'))
      )
      .map(file => path.relative(root, file))

    expect(offenders).toEqual([])
  })
})
