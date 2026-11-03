import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * DEV-81 — o layout das rotas logadas, `(logged-in)/layout.tsx`, já envolve as
 * páginas no landmark <main>; as páginas da carteira renderizadas dentro dele
 * não podem abrir outro <main> (WCAG 1.3.1). Layout e páginas são reais; só o
 * que depende de rede, sessão ou APIs do navegador vira stub sem landmarks.
 */

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/carteira',
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock('@/hooks/useTokenRefresh', () => ({
  useTokenRefresh: () => {},
}))
vi.mock('@/providers/auth-header-provider', () => ({
  AuthHeaderProvider: ({ children }: { children: ReactNode }) => children,
  useAuthHeader: () => ({
    data: { isLoggedIn: true, userName: '' },
    isLoading: false,
    refetch: async () => {},
  }),
}))
vi.mock('@/app/components/profile-header-wrapper', () => ({
  ProfileHeaderWrapper: () => <header data-testid="profile-header" />,
}))
vi.mock('@/app/components/float-navigation-wrapper', () => ({
  FloatNavigationWrapper: () => null,
}))

async function renderInLoggedInLayout(page: ReactElement) {
  const { default: PrivateLayout } = await import(
    '@/app/(app)/(logged-in)/layout'
  )
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      {await PrivateLayout({ children: page })}
    </QueryClientProvider>
  )
}

function expectSingleMain(container: HTMLElement) {
  expect(container.querySelectorAll('main, [role="main"]')).toHaveLength(1)
}

describe('DEV-81 — um único landmark <main> em /carteira', () => {
  beforeEach(() => {
    // A carteira busca os dados em /api/user/wallet; aqui a requisição fica
    // pendente e a página real renderiza o estado de carregamento.
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise<Response>(() => {}))
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('/carteira (página real) tem um único <main> com o conteúdo dentro dele', async () => {
    const { default: Wallet } = await import(
      '@/app/(app)/(logged-in)/carteira/(carteira)/page'
    )
    const { container } = await renderInLoggedInLayout(<Wallet />)

    expectSingleMain(container)
    expect(container.querySelector('main h2')).toHaveTextContent('Carteira')
  })

  it('/carteira (loading) tem um único <main>', async () => {
    const { default: WalletLoading } = await import(
      '@/app/(app)/(logged-in)/carteira/(carteira)/loading'
    )
    const { container } = await renderInLoggedInLayout(<WalletLoading />)

    expectSingleMain(container)
  })

  it('/carteira/pet/[slug] (pet não encontrado) tem um único <main>', async () => {
    const { PetNotFound } = await import(
      '@/app/(app)/(logged-in)/carteira/pet/[slug]/pet-not-found'
    )
    const { container } = await renderInLoggedInLayout(<PetNotFound />)

    expectSingleMain(container)
    expect(container.querySelector('main h2')).toHaveTextContent(
      'Pet não encontrado'
    )
  })
})

describe('DEV-81 — nada renderizado sob o layout logado abre outro <main>', () => {
  const root = path.resolve(__dirname, '..')
  const loggedInDir = path.join(root, 'app/(app)/(logged-in)')
  const layoutFile = path.join(loggedInDir, 'layout.tsx')
  // Componentes compartilhados que só são usados pela carteira.
  const sharedComponents = [
    'app/components/wallet-page-client.tsx',
    'app/components/wallet-page-loading-skeleton.tsx',
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

    const offenders = [...listTsx(loggedInDir), ...sharedComponents]
      .filter(file => file !== layoutFile)
      .filter(file =>
        /<main[\s>]|role=["']main["']/.test(readFileSync(file, 'utf8'))
      )
      .map(file => path.relative(root, file))

    expect(offenders).toEqual([])
  })
})
