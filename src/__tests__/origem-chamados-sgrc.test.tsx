import { OrigemChamados } from '@/app/(app)/(logged-in)/minhas-solicitacoes/components/origem-chamados'
import { renderWithQuery } from '@/test/render-with-query'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}))

const SALESFORCE = {
  protocolos: [
    {
      protocolo: 'RIO-2026-00000001',
      status: 'Aberto',
      ordens_de_servico: [
        {
          codigoOs: '00000001',
          servico: 'Reparo de iluminação pública',
          categoria: 'Solicitação',
          status: 'Aberto',
          dataAbertura: '2026-06-01T12:00:00Z',
        },
      ],
    },
  ],
}

function paginaSgrc(pagina: number, totalPages = 2) {
  return {
    ok: true,
    status: 200,
    json: async () => ({
      protocolos: [
        {
          protocolo: `RIO-1000000${pagina}-0`,
          status: 'Fechado com solução',
          dataAbertura: '2026-09-12T11:20:00Z',
          ordens_de_servico: [
            {
              codigoOs: `os-${pagina}`,
              servico: `Chamado histórico ${pagina}`,
              categoria: 'Reclamação',
              status: 'Fechado com solução',
              dataAbertura: '2026-09-12T11:20:00Z',
            },
          ],
        },
      ],
      pagination: { page: pagina, perPage: 10, total: 11, totalPages },
    }),
  }
}

const fetchMock = vi.fn()

beforeEach(() => {
  fetchMock.mockReset()
  fetchMock.mockImplementation(async (url: string) => {
    const { searchParams } = new URL(url, 'http://localhost')
    if (searchParams.get('origem') !== 'sgrc') {
      return { ok: true, status: 200, json: async () => SALESFORCE }
    }
    return paginaSgrc(Number(searchParams.get('page')))
  })
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('DEV-568: histórico SGRC em Minhas Solicitações', () => {
  test('abre no histórico SGRC, buscando a página 1 no RMI', async () => {
    renderWithQuery(<OrigemChamados />)

    expect(
      screen.getByRole('button', { name: 'Data de abertura' })
    ).toBeInTheDocument()
    expect(await screen.findByText('Chamado histórico 1')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/chamados?origem=sgrc&page=1',
      expect.anything()
    )
    expect(screen.getByText('Concluído')).toBeInTheDocument()
    expect(
      screen.queryByText('Reparo de iluminação pública')
    ).not.toBeInTheDocument()
  })

  test('o campo de busca não aparece', async () => {
    renderWithQuery(<OrigemChamados />)
    await screen.findByText('Chamado histórico 1')

    expect(
      screen.queryByPlaceholderText('Encontre sua solicitação')
    ).not.toBeInTheDocument()
  })

  test('a paginação pede a página seguinte ao RMI', async () => {
    renderWithQuery(<OrigemChamados />)
    await screen.findByText('Chamado histórico 1')

    fireEvent.click(screen.getAllByRole('button', { name: 'Página 2' })[0])

    expect(await screen.findByText('Chamado histórico 2')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenLastCalledWith(
      '/api/chamados?origem=sgrc&page=2',
      expect.anything()
    )
  })

  test('erro do histórico mostra aviso e tenta de novo a mesma página', async () => {
    // 5xx é repetido uma vez antes de virar erro.
    fetchMock.mockResolvedValueOnce({ ok: false, status: 502 })
    fetchMock.mockResolvedValueOnce({ ok: false, status: 502 })
    renderWithQuery(<OrigemChamados />)

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível carregar o histórico de solicitações.'
    )
    expect(
      screen.queryByText('Você ainda não possui solicitações para acompanhar.')
    ).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))

    expect(await screen.findByText('Chamado histórico 1')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  test('a primeira carga mostra o skeleton da lista, sem texto de carregamento', () => {
    fetchMock.mockImplementation(() => new Promise(() => {}))
    renderWithQuery(<OrigemChamados />)

    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true')
    expect(screen.queryByText('Carregando histórico…')).not.toBeInTheDocument()
    expect(
      screen.queryByText('Você ainda não possui solicitações para acompanhar.')
    ).not.toBeInTheDocument()
  })

  test('ao trocar de página, a lista atual fica na tela até a próxima chegar', async () => {
    let liberarPagina2: () => void = () => {}
    fetchMock.mockImplementation((url: string) => {
      const pagina = Number(
        new URL(url, 'http://localhost').searchParams.get('page')
      )
      if (pagina === 1) return Promise.resolve(paginaSgrc(1))
      return new Promise(resolve => {
        liberarPagina2 = () => resolve(paginaSgrc(2))
      })
    })
    renderWithQuery(<OrigemChamados />)
    await screen.findByText('Chamado histórico 1')

    fireEvent.click(screen.getAllByRole('button', { name: 'Página 2' })[0])

    expect(screen.getByText('Chamado histórico 1')).toBeInTheDocument()
    expect(
      screen.getByText('Chamado histórico 1').closest('[aria-busy]')
    ).toHaveAttribute('aria-busy', 'true')
    expect(screen.queryByRole('status')).not.toBeInTheDocument()

    liberarPagina2()

    expect(await screen.findByText('Chamado histórico 2')).toBeInTheDocument()
    expect(
      screen.getByText('Chamado histórico 2').closest('[aria-busy]')
    ).toHaveAttribute('aria-busy', 'false')
  })

  test('ao voltar do Salesforce, a lista SGRC já carregada aparece na hora', async () => {
    renderWithQuery(<OrigemChamados />)
    await screen.findByText('Chamado histórico 1')

    function escolher(opcao: string) {
      fireEvent.click(screen.getByRole('button', { name: 'Data de abertura' }))
      fireEvent.click(screen.getByRole('radio', { name: opcao }))
      fireEvent.click(screen.getByRole('button', { name: 'Aplicar' }))
    }

    escolher('abertas a partir de 27/11/2026')
    await screen.findByText('Reparo de iluminação pública')

    fetchMock.mockImplementation(() => new Promise(() => {}))
    escolher('abertas até 26/11/2026')

    expect(screen.getByText('Chamado histórico 1')).toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  test('o seletor troca para os chamados do Salesforce', async () => {
    renderWithQuery(<OrigemChamados />)
    await screen.findByText('Chamado histórico 1')

    fireEvent.click(screen.getByRole('button', { name: 'Data de abertura' }))

    expect(
      screen.getByRole('radio', { name: 'abertas até 26/11/2026' })
    ).toBeChecked()
    fireEvent.click(
      screen.getByRole('radio', { name: 'abertas a partir de 27/11/2026' })
    )
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar' }))

    await waitFor(() =>
      expect(
        screen.getByText('Reparo de iluminação pública')
      ).toBeInTheDocument()
    )
    expect(screen.queryByText('Chamado histórico 1')).not.toBeInTheDocument()
    expect(
      screen.queryByPlaceholderText('Encontre sua solicitação')
    ).not.toBeInTheDocument()
  })

  describe('origem sem nenhum chamado', () => {
    const SEM_SGRC =
      'Você não possui solicitações abertas até 26/11/2026. Para ver as abertas a partir de 27/11/2026, selecione "Data de abertura" e escolha essa opção.'
    const SEM_SALESFORCE =
      'Você não possui solicitações abertas a partir de 27/11/2026. Para ver as abertas até 26/11/2026, selecione "Data de abertura" e escolha essa opção.'

    beforeEach(() => {
      fetchMock.mockImplementation(async (url: string) => {
        const { searchParams } = new URL(url, 'http://localhost')
        if (searchParams.get('origem') === 'sgrc') {
          return {
            ok: true,
            status: 200,
            json: async () => ({
              protocolos: [],
              pagination: { page: 1, perPage: 10, total: 0, totalPages: 1 },
            }),
          }
        }
        return { ok: true, status: 200, json: async () => ({ protocolos: [] }) }
      })
    })

    test('SGRC vazio diz que não há solicitações até 26/11 e sugere a outra data', async () => {
      renderWithQuery(<OrigemChamados />)
      expect(await screen.findByText(SEM_SGRC)).toBeInTheDocument()
    })

    test('Salesforce vazio diz que não há solicitações a partir de 27/11 e sugere a outra data', async () => {
      renderWithQuery(<OrigemChamados origemInicial="salesforce" />)
      expect(await screen.findByText(SEM_SALESFORCE)).toBeInTheDocument()
    })
  })
})
