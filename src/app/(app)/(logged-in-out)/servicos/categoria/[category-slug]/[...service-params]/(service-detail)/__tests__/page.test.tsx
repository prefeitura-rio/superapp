import type { ModelsPrefRioService } from '@/http-busca-search/models/modelsPrefRioService'
import type { PrefRioServiceWithFlags } from '@/lib/carta-servicos/types'
import { fetchServiceBySlug } from '@/lib/services-utils'
import { render, screen, within } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ServicePage from '../page'
import { PageClientWrapper } from '../page-client-wrapper'

/**
 * Atualização da página de serviço: título de 24px com a data logo abaixo, em
 * `primary`, e "Este conteúdo foi útil?" no fim — só com a flag, com o
 * articleId da Carta e fora do preview.
 */

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => '/servicos/categoria/animais/adocao',
  useSearchParams: () => new URLSearchParams(),
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND')
  },
}))
vi.mock('@/app/components/header-wrapper-client', () => ({
  default: () => <header data-testid="header" />,
}))
vi.mock('@/providers/auth-status-provider', () => ({
  AuthStatusProvider: ({ children }: { children: ReactNode }) => children,
  useAuthStatus: () => ({ isLoggedIn: false, isLoading: false }),
}))
vi.mock('@/lib/services-utils', () => ({
  fetchServiceBySlug: vi.fn(),
  getCategoryNameBySlug: vi.fn(async () => 'Animais'),
}))
vi.mock('@/http/departments/departments', () => ({
  getDepartmentsCdUa: vi.fn(),
}))

const ARTICLE_ID = 'ka089000000BUO5AAO'
// 05/10/2026 ao meio-dia UTC: mesma data em qualquer fuso do Brasil.
const LAST_UPDATE = Date.parse('2026-10-05T15:00:00.000Z') / 1000

const service: PrefRioServiceWithFlags = {
  slug: 'adocao-de-animais-da-fazenda-modelo',
  articleId: ARTICLE_ID,
  nome_servico: 'Adoção de animais da Fazenda Modelo',
  resumo: 'Resumo sintético.',
  descricao_completa: 'Descrição sintética.',
  resultado_solicitacao: 'Resultado sintético.',
  tema_geral: 'animais',
  custo_servico: 'Gratuito',
  tempo_atendimento: '5 dias',
  orgao_gestor: ['Órgão Exemplo'],
  autor: '',
  last_update: LAST_UPDATE,
  legislacao_relacionada: ['Lei sintética nº 1'],
}

async function renderServicePage() {
  const page = await ServicePage({
    params: Promise.resolve({
      'category-slug': 'animais',
      'service-params': ['adocao-de-animais-da-fazenda-modelo'],
    }),
  })
  return render(page)
}

const ratingHeading = () =>
  screen.queryByRole('heading', { name: 'Este conteúdo foi útil?' })

describe('página de serviço — cabeçalho', () => {
  it('título de 24px seguido da data de atualização em primary', () => {
    render(
      <PageClientWrapper
        serviceData={service as ModelsPrefRioService}
        orgaoGestorName="Órgão Exemplo"
        categorySlug="animais"
      />
    )

    const title = screen.getByRole('heading', {
      level: 1,
      name: 'Adoção de animais da Fazenda Modelo',
    })
    expect(title).toHaveClass('text-2xl', 'leading-8', 'font-medium')
    expect(title).not.toHaveClass('text-4xl')

    const date = title.nextElementSibling
    expect(date?.tagName).toBe('P')
    expect(date).toHaveTextContent(/^Última atualização: 05\/10\/2026$/)
    expect(date).toHaveClass('text-sm', 'text-primary')
  })

  it('a data aparece uma vez só (saiu do fim da página)', () => {
    render(
      <PageClientWrapper
        serviceData={service as ModelsPrefRioService}
        orgaoGestorName="Órgão Exemplo"
        categorySlug="animais"
      />
    )

    expect(screen.getAllByText(/Última atualização/)).toHaveLength(1)
  })

  it('sem last_update não mostra a linha da data', () => {
    render(
      <PageClientWrapper
        serviceData={
          { ...service, last_update: undefined } as ModelsPrefRioService
        }
        orgaoGestorName="Órgão Exemplo"
        categorySlug="animais"
      />
    )

    expect(screen.queryByText(/Última atualização/)).not.toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 1 }).nextElementSibling
    ).not.toHaveTextContent(/Última atualização/)
  })
})

describe('página de serviço — "Este conteúdo foi útil?"', () => {
  beforeEach(() => {
    vi.stubEnv('FEATURE_SALESFORCE', 'true')
    vi.stubEnv('FEATURE_AVALIACAO_SERVICO', 'true')
    vi.mocked(fetchServiceBySlug).mockResolvedValue(service)
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.mocked(fetchServiceBySlug).mockReset()
  })

  it('com as flags e o articleId aparece no fim da página, depois da legislação', async () => {
    const { container } = await renderServicePage()

    const heading = ratingHeading()
    expect(heading).toBeInTheDocument()

    const main = container.querySelector('main') as HTMLElement
    const section = heading?.closest('section') as HTMLElement
    expect(main).toContainElement(section)
    expect(main.lastElementChild).toBe(section)
    expect(
      within(section).getByRole('button', { name: 'Sim, foi útil' })
    ).toBeVisible()
    expect(
      within(section).getByRole('button', { name: 'Não foi útil' })
    ).toBeVisible()
  })

  it('sem FEATURE_AVALIACAO_SERVICO não aparece', async () => {
    vi.stubEnv('FEATURE_AVALIACAO_SERVICO', 'false')

    await renderServicePage()

    expect(ratingHeading()).not.toBeInTheDocument()
  })

  it('sem FEATURE_SALESFORCE não aparece', async () => {
    vi.stubEnv('FEATURE_SALESFORCE', 'false')

    await renderServicePage()

    expect(ratingHeading()).not.toBeInTheDocument()
  })

  it('sem articleId (serviço fora da Carta) não aparece', async () => {
    vi.mocked(fetchServiceBySlug).mockResolvedValue({
      ...service,
      articleId: undefined,
    })

    await renderServicePage()

    expect(ratingHeading()).not.toBeInTheDocument()
  })

  it('no preview do backoffice não aparece mesmo com ratingTarget', () => {
    render(
      <PageClientWrapper
        serviceData={service as ModelsPrefRioService}
        orgaoGestorName="Órgão Exemplo"
        categorySlug="animais"
        ratingTarget={{ slug: service.slug ?? '', articleId: ARTICLE_ID }}
        isPreview
      />
    )

    expect(ratingHeading()).not.toBeInTheDocument()
  })
})
