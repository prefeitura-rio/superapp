import CategoryServicesLoading from '@/app/(app)/(logged-in-out)/servicos/categoria/[category-slug]/(main)/loading'
import CategoryPage from '@/app/(app)/(logged-in-out)/servicos/categoria/[category-slug]/(main)/page'
import { PageClientWrapper } from '@/app/(app)/(logged-in-out)/servicos/categoria/[category-slug]/[...service-params]/(service-detail)/page-client-wrapper'
import { PreviewClient } from '@/app/(app)/(logged-in-out)/servicos/preview/preview-client'
import type { ModelsPrefRioService } from '@/http-busca-search/models/modelsPrefRioService'
import {
  PREVIEW_DATA_TYPE,
  PREVIEW_READY_TYPE,
} from '@/lib/carta-servicos/preview-protocol'
import type { ServicePreviewResponse } from '@/lib/carta-servicos/preview-service'
import {
  fetchServicesByCategory,
  fetchSubcategoriesByCategory,
} from '@/lib/services-utils'
import { act, render, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * DEV-235 — o layout comum de `(app)` não abre <main> e os layouts de
 * /servicos/categoria/* e /servicos/preview só repassam `children`, então
 * cada página precisa prover exatamente um landmark <main> (WCAG 1.3.1 /
 * 2.4.1). Páginas e wrappers são reais; só o que depende de sessão, rede ou
 * do navegador vira stub sem landmarks.
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
vi.mock('@/providers/auth-status-provider', () => ({
  AuthStatusProvider: ({ children }: { children: ReactNode }) => children,
  useAuthStatus: () => ({ isLoggedIn: false, isLoading: false }),
}))
vi.mock('@/lib/services-utils', () => ({
  getCategoryNameBySlug: vi.fn(async () => 'Saúde'),
  fetchServicesByCategory: vi.fn(async () => null),
  fetchSubcategoriesByCategory: vi.fn(async () => ({
    ok: true,
    data: { subcategories: [] },
  })),
}))

function expectSingleMain(container: HTMLElement) {
  expect(container.querySelectorAll('main, [role="main"]')).toHaveLength(1)
}

const service: ModelsPrefRioService = {
  autor: 'Autor sintético',
  custo_servico: 'Gratuito',
  descricao_completa: 'Descrição sintética do serviço.',
  nome_servico: 'Serviço sintético',
  orgao_gestor: ['Órgão Exemplo'],
  resultado_solicitacao: 'Resultado sintético.',
  resumo: 'Resumo sintético.',
  tema_geral: 'saude',
  tempo_atendimento: '5 dias',
}

async function renderCategoryPage() {
  const page = await CategoryPage({
    params: Promise.resolve({ 'category-slug': 'saude' }),
  })
  return render(page)
}

describe('DEV-235 — um único <main> em /servicos/categoria/[category-slug]', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('com serviços e subcategorias tem um único main com o H1 dentro', async () => {
    vi.mocked(fetchServicesByCategory).mockResolvedValueOnce({
      filtered_category: {
        services: [
          {
            id: 'svc-1',
            slug: 'servico-sintetico',
            title: 'Serviço sintético',
            description: 'Descrição sintética',
          },
        ],
      },
    })
    vi.mocked(fetchSubcategoriesByCategory).mockResolvedValueOnce({
      ok: true,
      data: { subcategories: [{ name: 'Atendimento', category: 'saude' }] },
    })

    const { container } = await renderCategoryPage()

    expectSingleMain(container)
    expect(container.querySelector('main h1')).toHaveTextContent('Saúde')
    expect(container.querySelector('main')).toHaveTextContent(
      'Serviço sintético'
    )
    expect(container.querySelector('main')).toHaveTextContent('Atendimento')
    expect(container.querySelector('main header')).toBeNull()
  })

  it('sem serviços (estado vazio) tem um único main', async () => {
    const { container } = await renderCategoryPage()

    expectSingleMain(container)
    expect(container.querySelector('main')).toHaveTextContent(
      'nenhum serviço encontrado nesta categoria'
    )
  })

  it('carregando (loading.tsx) tem um único main, sem o cabeçalho dentro', () => {
    const { container } = render(<CategoryServicesLoading />)

    expectSingleMain(container)
    expect(container.querySelector('main header')).toBeNull()
  })
})

describe('DEV-235 — um único <main> no detalhe de serviço', () => {
  it('tem um único main com o H1 do serviço, sem o cabeçalho dentro', () => {
    const { container } = render(
      <PageClientWrapper
        serviceData={service}
        orgaoGestorName="Órgão Exemplo"
        categorySlug="saude"
      />
    )

    expectSingleMain(container)
    expect(container.querySelector('main h1')).toHaveTextContent(
      'Serviço sintético'
    )
    expect(container.querySelector('main header')).toBeNull()
  })
})

describe('DEV-235 — um único <main> em /servicos/preview', () => {
  const origin = 'https://salesforce.example.com'
  const nonce = '00000000-0000-4000-8000-000000000000'

  afterEach(() => {
    window.location.hash = ''
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('aberta sem a Salesforce (mensagem de instrução) tem um único main', () => {
    const { container } = render(<PreviewClient allowedOrigins={[origin]} />)

    expectSingleMain(container)
    expect(container.querySelector('main')).toHaveTextContent(
      'Abra esta página pelo botão de pré-visualização na Salesforce.'
    )
    // O aviso de pré-visualização fica fora do landmark.
    expect(container.querySelector('main [role="status"]')).toBeNull()
  })

  it('sem origens configuradas tem um único main', () => {
    window.location.hash = `#${nonce}`
    const { container } = render(<PreviewClient allowedOrigins={[]} />)

    expectSingleMain(container)
    expect(container.querySelector('main')).toHaveTextContent(
      'A pré-visualização não está configurada neste ambiente.'
    )
  })

  it('aguardando e com o serviço montado tem um único main', async () => {
    const opener = { postMessage: vi.fn() }
    vi.stubGlobal('opener', opener)
    const preview: ServicePreviewResponse = {
      service,
      orgaoGestorName: 'Órgão Exemplo',
      categorySlug: 'saude',
    }
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(JSON.stringify(preview), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
      )
    )
    window.location.hash = `#${nonce}`

    const { container } = render(<PreviewClient allowedOrigins={[origin]} />)

    expect(opener.postMessage).toHaveBeenCalledWith(
      { type: PREVIEW_READY_TYPE, nonce },
      origin
    )
    expectSingleMain(container)
    expect(container.querySelector('main')).toHaveTextContent(
      'Carregando pré-visualização…'
    )

    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          origin,
          data: { type: PREVIEW_DATA_TYPE, nonce, payload: { id: 'svc-1' } },
        })
      )
    })

    await waitFor(() =>
      expect(container.querySelector('main h1')).toHaveTextContent(
        'Serviço sintético'
      )
    )
    expectSingleMain(container)
    expect(container.querySelector('main [role="status"]')).toBeNull()
  })
})
