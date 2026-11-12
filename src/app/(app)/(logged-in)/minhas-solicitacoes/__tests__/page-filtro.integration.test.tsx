import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * Integração da página: `?filtro=` da URL → página (server) → OrigemChamados →
 * RequestsList. É o destino de Ouvidoria e Lei de Acesso à Informação no menu
 * global logado. Só a API de chamados e o header são simulados.
 */

const { listChamados } = vi.hoisted(() => ({ listChamados: vi.fn() }))

vi.mock('@/http-pref-rio-cidadao/default/default', () => ({ listChamados }))
vi.mock('@/mocks/chamados', () => ({
  IS_MOCK_ENABLED: false,
  MOCK_LIST: { protocolos: [] },
}))
vi.mock('@/app/components/profile-header-wrapper', () => ({
  ProfileHeaderWrapper: () => null,
}))
vi.mock('@/app/components/float-navigation-wrapper', () => ({
  FloatNavigationWrapper: () => null,
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

async function renderPage(filtro?: string) {
  render(
    await MyRequestsPage({
      searchParams: Promise.resolve(filtro ? { filtro } : {}),
    })
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
  listChamados.mockResolvedValue({
    status: 200,
    data: { protocolos: PROTOCOLOS },
  })
})

describe('/minhas-solicitacoes?filtro= (destino do menu global)', () => {
  it('sem filtro abre em Todos', async () => {
    await renderPage()

    expect(activeTab()).toBe('Todos')
    expect(screen.getByText('Remoção de entulho')).toBeInTheDocument()
    expect(screen.getByText('Reclamação de atendimento')).toBeInTheDocument()
    expect(screen.getByText('Pedido de dados de obras')).toBeInTheDocument()
  })

  it('?filtro=ouvidoria (menu → Ouvidoria) abre a aba Ouvidoria', async () => {
    await renderPage('ouvidoria')

    expect(activeTab()).toBe('Ouvidoria')
    expect(screen.getByText('Reclamação de atendimento')).toBeInTheDocument()
    expect(screen.queryByText('Remoção de entulho')).not.toBeInTheDocument()
    expect(
      screen.queryByText('Pedido de dados de obras')
    ).not.toBeInTheDocument()
  })

  it('?filtro=acesso-a-informacao (menu → LAI) abre a aba Acesso à informação', async () => {
    await renderPage('acesso-a-informacao')

    expect(activeTab()).toBe('Acesso à informação')
    expect(screen.getByText('Pedido de dados de obras')).toBeInTheDocument()
    expect(screen.queryByText('Remoção de entulho')).not.toBeInTheDocument()
  })

  it('filtro desconhecido é ignorado e abre em Todos', async () => {
    await renderPage('qualquer-coisa')

    expect(activeTab()).toBe('Todos')
    expect(screen.getByText('Remoção de entulho')).toBeInTheDocument()
  })
})
