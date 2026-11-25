import { chamadosKeys } from '@/lib/chamados/query-keys'
import { AuthStatusContextForTest } from '@/test/auth-status-context'
import { makeTestQueryClient } from '@/test/render-with-query'
import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/providers/auth-status-provider', async () => {
  const { AuthStatusContextForTest } = await import(
    '@/test/auth-status-context'
  )
  return { useAuthStatus: () => AuthStatusContextForTest.current }
})

import RequestsInProgressBanner from '../requests-in-progress-banner'

const fetchMock = vi.fn()

const LISTA = {
  protocolos: [
    {
      protocolo: 'RIO-2026-1',
      dataUltimaAtualizacao: '2020-01-01T00:00:00Z',
      ordens_de_servico: [{ codigoOs: 'a', status: 'Aberto' }],
    },
    {
      protocolo: 'RIO-2026-2',
      dataUltimaAtualizacao: '2020-01-01T00:00:00Z',
      ordens_de_servico: [{ codigoOs: 'b', status: 'Fechado' }],
    },
  ],
}

beforeEach(() => {
  fetchMock.mockReset()
  fetchMock.mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => LISTA,
  })
  vi.stubGlobal('fetch', fetchMock)
  AuthStatusContextForTest.current = { isLoggedIn: true, isLoading: false }
})
afterEach(() => vi.unstubAllGlobals())

function montar(queryClient = makeTestQueryClient()) {
  return render(
    <QueryClientProvider client={queryClient}>
      <RequestsInProgressBanner />
    </QueryClientProvider>
  )
}

describe('RequestsInProgressBanner', () => {
  it('conta só as ordens abertas ou atualizadas nos últimos 15 dias', async () => {
    montar()
    expect(await screen.findByText('1 solicitação')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith('/api/chamados', expect.anything())
  })

  it('leva para Minhas Solicitações já nos chamados do novo 1746', async () => {
    montar()
    const link = await screen.findByRole('link')
    expect(link).toHaveAttribute('href', '/minhas-solicitacoes?o=1')
  })

  it('usa a lista já em cache, sem nova requisição', async () => {
    const queryClient = makeTestQueryClient()
    queryClient.setQueryData(chamadosKeys.salesforce(), LISTA)
    montar(queryClient)
    expect(await screen.findByText('1 solicitação')).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('deslogado: não chama o BFF e não mostra nada', async () => {
    AuthStatusContextForTest.current = { isLoggedIn: false, isLoading: false }
    const { container } = montar()
    await waitFor(() => expect(container).toBeEmptyDOMElement())
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('erro no BFF: o banner some em silêncio', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 401 })
    const { container } = montar()
    await waitFor(() => expect(container).toBeEmptyDOMElement())
  })
})
