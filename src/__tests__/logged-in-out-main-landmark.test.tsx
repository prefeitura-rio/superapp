import ConsultaProtocoloPage from '@/app/(app)/(logged-in-out)/consulta-protocolo/page'
import FaqPageCourses from '@/app/(app)/(logged-in-out)/faq/cursos/page'
import FaqPagePrefRio from '@/app/(app)/(logged-in-out)/faq/prefrio/page'
import EmpregosFaqPage from '@/app/(app)/(logged-in-out)/faq/trabalho/page'
import OuvidoriaPage from '@/app/(app)/(logged-in-out)/ouvidoria/page'
import ReclamacaoPage from '@/app/(app)/(logged-in-out)/ouvidoria/reclamacao/page'
import CookiesPolicy from '@/app/(app)/(logged-in-out)/politicas-de-uso-de-cookies/page'
import SolicitacaoOuvidoriaPage from '@/app/(app)/(logged-in-out)/solicitacoes/[id]/ouvidoria/page'
import RequestDetailPage from '@/app/(app)/(logged-in-out)/solicitacoes/[id]/page'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * DEV-234 — o layout comum de `(app)` não abre <main>, então cada página do
 * grupo `(logged-in-out)` precisa prover exatamente um landmark <main>
 * (WCAG 1.3.1 / 2.4.1). As páginas são reais; só o que depende de sessão, rede
 * ou do navegador vira stub sem landmarks.
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
  useParams: () => ({ id: 'RIO-2026-00000001' }),
  useSearchParams: () => searchParams.current,
  redirect: (url: string) => {
    throw new Error(`redirect:${url}`)
  },
}))

vi.mock('@/app/components/header-wrapper-client', () => ({
  default: () => <header data-testid="header" />,
}))
vi.mock('@/app/components/float-navigation-wrapper', () => ({
  FloatNavigationWrapper: () => null,
}))
vi.mock('@/lib/user-info', () => ({
  getUserInfoFromToken: vi.fn(async () => ({ cpf: '00000000000', name: '' })),
}))

function expectSingleMain(container: HTMLElement) {
  expect(container.querySelectorAll('main, [role="main"]')).toHaveLength(1)
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

const chamadoPublico = {
  protocolo: 'RIO-2026-00000001',
  status: 'Aberto',
  dataAbertura: '2026-01-02T10:00:00Z',
  ordens_de_servico: [
    {
      codigoOs: '00000001',
      servico: 'Reparo de iluminação',
      subtema: 'Iluminação',
      categoria: 'Serviço',
      status: 'Aberto',
    },
    {
      codigoOs: '00000002',
      servico: 'Poda de árvore',
      subtema: 'Árvores',
      categoria: 'Serviço',
      status: 'Aberto',
    },
  ],
}

describe('DEV-234 — um único <main> nas páginas de (logged-in-out)', () => {
  beforeEach(() => {
    searchParams.current = new URLSearchParams()
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
        takeRecords() {
          return []
        }
      }
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('/consulta-protocolo (formulário) tem um único main', () => {
    const { container } = render(<ConsultaProtocoloPage />)
    expectSingleMain(container)
    expect(container.querySelector('main h1')).toHaveTextContent(
      'Consulte seu protocolo'
    )
    expect(container.querySelector('main form')).not.toBeNull()
  })

  it('/consulta-protocolo (lista de solicitações) tem um único main', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse(chamadoPublico))
    )
    const { container } = render(<ConsultaProtocoloPage />)

    fireEvent.change(screen.getByLabelText('Número de protocolo'), {
      target: { value: 'RIO-2026-00000001' },
    })
    fireEvent.submit(container.querySelector('form') as HTMLFormElement)

    await waitFor(() => expect(container).toHaveTextContent('2 solicitações'))
    expectSingleMain(container)
    expect(container.querySelector('main')).toHaveTextContent('Poda de árvore')
  })

  it('/faq/cursos tem um único main', () => {
    const { container } = render(<FaqPageCourses />)
    expectSingleMain(container)
  })

  it('/faq/prefrio tem um único main', () => {
    const { container } = render(<FaqPagePrefRio />)
    expectSingleMain(container)
  })

  it('/faq/trabalho tem um único main', () => {
    const { container } = render(<EmpregosFaqPage />)
    expectSingleMain(container)
  })

  it('/ouvidoria tem um único main', () => {
    const { container } = render(<OuvidoriaPage />)
    expectSingleMain(container)
    expect(container.querySelector('main')).toHaveTextContent('Reclamação')
  })

  it('/ouvidoria/reclamacao tem um único main', () => {
    const { container } = render(<ReclamacaoPage />)
    expectSingleMain(container)
    expect(container.querySelector('main')).toHaveTextContent(
      'Primeira reclamação'
    )
  })

  it('/politicas-de-uso-de-cookies tem um único main', () => {
    const { container } = render(<CookiesPolicy />)
    expectSingleMain(container)
    expect(container.querySelector('main h1')).toHaveTextContent(
      'Política de Cookies'
    )
  })

  it('/solicitacoes/[id] tem um único main ao carregar, no detalhe e no erro', async () => {
    let resolveFetch: (r: Response) => void = () => {}
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (input: RequestInfo | URL) =>
          new Promise<Response>(resolve => {
            if (String(input).startsWith('/api/chamados-publico/')) {
              resolveFetch = resolve
            } else {
              resolve(jsonResponse({}, 401))
            }
          })
      )
    )
    const { container } = render(<RequestDetailPage />)
    // Carregando (skeleton).
    expectSingleMain(container)

    await waitFor(() =>
      expect(vi.mocked(fetch)).toHaveBeenCalledWith(
        '/api/chamados-publico/RIO-2026-00000001'
      )
    )
    resolveFetch(jsonResponse(chamadoPublico))

    await waitFor(() =>
      expect(container.querySelector('h1')).toHaveTextContent(
        'Reparo de iluminação'
      )
    )
    expectSingleMain(container)
    expect(container.querySelector('main h1')).not.toBeNull()
  })

  it('/solicitacoes/[id] com protocolo inexistente tem um único main', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse({}, 404))
    )
    const { container } = render(<RequestDetailPage />)

    await waitFor(() =>
      expect(container).toHaveTextContent(
        'Protocolo RIO-2026-00000001 não encontrado.'
      )
    )
    expectSingleMain(container)
  })

  it('/solicitacoes/[id]/ouvidoria tem um único main', async () => {
    const page = await SolicitacaoOuvidoriaPage({
      params: Promise.resolve({ id: 'RIO-2026-00000001' }),
      searchParams: Promise.resolve({ osId: 'os-1', elogio: 'cat-1' }),
    })
    const { container } = render(page)
    expectSingleMain(container)
    expect(container.querySelector('main h1')).toHaveTextContent(
      'Como foi o atendimento da sua solicitação?'
    )
  })
})
