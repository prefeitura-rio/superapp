import { renderWithQuery } from '@/test/render-with-query'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * Integração da página: `?filtro=` da URL → página (server) → OrigemChamados →
 * RequestsList. É o destino de Ouvidoria e Lei de Acesso à Informação no menu
 * global logado. Só as APIs de chamados e o header são simulados.
 *
 * A página abre no histórico SGRC (só "Todos"); as abas do filtro existem na
 * origem Salesforce ("abertas a partir de 27/11/2026").
 */

const { listChamados } = vi.hoisted(() => ({ listChamados: vi.fn() }))

const { cookieStore } = vi.hoisted(() => ({
  cookieStore: new Map<string, string>(),
}))

vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (nome: string) =>
      cookieStore.has(nome) ? { value: cookieStore.get(nome) } : undefined,
  }),
}))
vi.mock('@/http-pref-rio-cidadao/default/default', () => ({ listChamados }))
vi.mock('@/app/components/profile-header-wrapper', () => ({
  ProfileHeaderWrapper: () => null,
}))
vi.mock('@/app/components/float-navigation-wrapper', () => ({
  FloatNavigationWrapper: () => null,
}))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}))

import MyRequestsPage from '../page'

const PROTOCOLOS = [
  {
    protocolo: 'RIO-1',
    status: 'Aberto',
    ordens_de_servico: [
      {
        codigoOs: 'a',
        servico: 'Remoção de entulho',
        categoria: 'Solicitação',
      },
    ],
  },
  {
    protocolo: 'RIO-2',
    status: 'Aberto',
    ordens_de_servico: [
      {
        codigoOs: 'b',
        servico: 'Reclamação de atendimento',
        categoria: 'Reclamação',
      },
    ],
  },
  {
    protocolo: 'RIO-3',
    status: 'Aberto',
    ordens_de_servico: [
      {
        codigoOs: 'c',
        servico: 'Pedido de dados de obras',
        categoria: 'Informação',
        isAcessoInformacao: true,
      },
    ],
  },
]

async function renderPage(filtro?: string, o?: string) {
  renderWithQuery(
    await MyRequestsPage({
      searchParams: Promise.resolve({
        ...(filtro ? { filtro } : {}),
        ...(o ? { o } : {}),
      }),
    })
  )
}

/** Troca para "abertas a partir de 27/11/2026" (Salesforce). */
async function abrirSalesforce() {
  fireEvent.click(screen.getByRole('button', { name: 'Data de abertura' }))
  fireEvent.click(
    screen.getByRole('radio', { name: 'abertas a partir de 27/11/2026' })
  )
  fireEvent.click(screen.getByRole('button', { name: 'Aplicar' }))
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Serviços' })).toBeInTheDocument()
  )
}

const TABS = ['Todos', 'Serviços', 'Ouvidoria', 'Acesso à informação']

/** Aba de filtro selecionada (a de borda), entre as quatro da lista. */
function activeTab() {
  const selected = TABS.filter(name =>
    screen.getByRole('button', { name }).className.includes('border-foreground')
  )
  expect(selected).toHaveLength(1)
  return selected[0]
}

beforeEach(() => {
  cookieStore.clear()
  vi.stubEnv('FEATURE_SGRC_HISTORICO', 'true')
  listChamados.mockResolvedValue({
    status: 200,
    data: { protocolos: PROTOCOLOS },
  })
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        protocolos: [
          {
            protocolo: 'RIO-10000000-0',
            status: 'Aberto',
            ordens_de_servico: [
              {
                codigoOs: 'sgrc-1',
                servico: 'Reclamação histórica',
                categoria: 'Reclamação',
              },
            ],
          },
        ],
        pagination: { page: 1, perPage: 10, total: 1, totalPages: 1 },
      }),
    })
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

describe.each([
  ['ausente', undefined],
  ['"false"', 'false'],
])('/minhas-solicitacoes com FEATURE_SGRC_HISTORICO %s', (_caso, valor) => {
  beforeEach(() => {
    vi.stubEnv('FEATURE_SGRC_HISTORICO', valor)
  })

  it('mostra só o Salesforce, sem o seletor e sem buscar o histórico SGRC', async () => {
    await renderPage()

    expect(
      screen.queryByRole('button', { name: 'Data de abertura' })
    ).not.toBeInTheDocument()
    expect(activeTab()).toBe('Todos')
    expect(screen.getByText('Remoção de entulho')).toBeInTheDocument()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('?filtro=ouvidoria abre direto a aba Ouvidoria', async () => {
    await renderPage('ouvidoria')

    expect(activeTab()).toBe('Ouvidoria')
    expect(screen.getByText('Reclamação de atendimento')).toBeInTheDocument()
    expect(screen.queryByText('Remoção de entulho')).not.toBeInTheDocument()
  })
})

describe('/minhas-solicitacoes?filtro= (destino do menu global)', () => {
  it('sem filtro abre em Todos', async () => {
    await renderPage()
    await abrirSalesforce()

    expect(activeTab()).toBe('Todos')
    expect(screen.getByText('Remoção de entulho')).toBeInTheDocument()
    expect(screen.getByText('Reclamação de atendimento')).toBeInTheDocument()
    expect(screen.getByText('Pedido de dados de obras')).toBeInTheDocument()
  })

  it('?filtro=ouvidoria (menu → Ouvidoria) abre a aba Ouvidoria', async () => {
    await renderPage('ouvidoria')
    await abrirSalesforce()

    expect(activeTab()).toBe('Ouvidoria')
    expect(screen.getByText('Reclamação de atendimento')).toBeInTheDocument()
    expect(screen.queryByText('Remoção de entulho')).not.toBeInTheDocument()
    expect(
      screen.queryByText('Pedido de dados de obras')
    ).not.toBeInTheDocument()
  })

  it('?filtro=acesso-a-informacao (menu → LAI) abre a aba Acesso à informação', async () => {
    await renderPage('acesso-a-informacao')
    await abrirSalesforce()

    expect(activeTab()).toBe('Acesso à informação')
    expect(screen.getByText('Pedido de dados de obras')).toBeInTheDocument()
    expect(screen.queryByText('Remoção de entulho')).not.toBeInTheDocument()
  })

  it('filtro desconhecido é ignorado e abre em Todos', async () => {
    await renderPage('qualquer-coisa')
    await abrirSalesforce()

    expect(activeTab()).toBe('Todos')
    expect(screen.getByText('Remoção de entulho')).toBeInTheDocument()
  })
})

describe('/minhas-solicitacoes?filtro= no histórico SGRC (origem padrão)', () => {
  it('o seletor de data aparece e a lista SGRC abre em Todos', async () => {
    await renderPage('ouvidoria')

    expect(
      screen.getByRole('button', { name: 'Data de abertura' })
    ).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.getByText('Reclamação histórica')).toBeInTheDocument()
    )
    expect(screen.getByRole('button', { name: 'Todos' })).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Ouvidoria' })
    ).not.toBeInTheDocument()
  })
})

describe('/minhas-solicitacoes: origem aberta por padrão', () => {
  const rotuloSalesforce = 'abertas a partir de 27/11/2026'
  const rotuloSgrc = 'abertas até 26/11/2026'

  async function origemSelecionada() {
    fireEvent.click(screen.getByRole('button', { name: 'Data de abertura' }))
    const marcado = [rotuloSgrc, rotuloSalesforce].filter(
      nome =>
        screen
          .getByRole('radio', { name: nome })
          .getAttribute('aria-checked') === 'true' ||
        (screen.getByRole('radio', { name: nome }) as HTMLInputElement).checked
    )
    expect(marcado).toHaveLength(1)
    return marcado[0]
  }

  it('acesso direto abre o histórico legado (SGRC)', async () => {
    await renderPage()
    expect(await origemSelecionada()).toBe(rotuloSgrc)
    await waitFor(() => expect(fetch).toHaveBeenCalled())
  })

  it('?o=1 (banner da home) abre o novo 1746, sem buscar o SGRC', async () => {
    await renderPage(undefined, '1')
    expect(screen.getByText('Remoção de entulho')).toBeInTheDocument()
    expect(await origemSelecionada()).toBe(rotuloSalesforce)
    expect(fetch).not.toHaveBeenCalled()
  })

  it('voltando do formulário do 1746 (cookie de retorno), abre o novo 1746', async () => {
    cookieStore.set('chamados_formulario_aberto', String(Date.now()))
    await renderPage()
    expect(screen.getByText('Remoção de entulho')).toBeInTheDocument()
    expect(await origemSelecionada()).toBe(rotuloSalesforce)
    expect(fetch).not.toHaveBeenCalled()
  })

  it('?o=0 explícito vence o cookie de retorno', async () => {
    cookieStore.set('chamados_formulario_aberto', String(Date.now()))
    await renderPage(undefined, '0')
    expect(await origemSelecionada()).toBe(rotuloSgrc)
  })

  it('escolher a origem no seletor atualiza ?o= na URL, sem navegar', async () => {
    await renderPage()
    await abrirSalesforce()
    expect(new URL(window.location.href).searchParams.get('o')).toBe('1')
  })

  it('sem o histórico SGRC, lista vazia mantém o texto antigo, sem citar "Data de abertura"', async () => {
    vi.stubEnv('FEATURE_SGRC_HISTORICO', 'false')
    listChamados.mockResolvedValue({ status: 200, data: { protocolos: [] } })
    await renderPage()
    expect(
      screen.getByText('Você ainda não possui solicitações para acompanhar.')
    ).toBeInTheDocument()
    expect(screen.queryByText(/Data de abertura/)).not.toBeInTheDocument()
  })
})
