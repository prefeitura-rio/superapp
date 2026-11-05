import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HabilidadesCompetencias } from '../index'

const { mockToastSuccess, mockToastError } = vi.hoisted(() => ({
  mockToastSuccess: vi.fn(),
  mockToastError: vi.fn(),
}))

vi.mock('react-hot-toast', () => ({
  default: {
    success: mockToastSuccess,
    error: mockToastError,
  },
}))

const initialData = {
  areasAtuacao: [
    { id: 10, nome: 'Área A' },
    { id: 20, nome: 'Área B' },
  ],
  areaAtuacaoSelecionada: { id: 10, nome: 'Área A' },
  conhecimentosSelecionados: [{ id: 1, nome: 'Conhecimento A' }],
  comportamentoAtitudes: [
    {
      id: 5,
      nome: 'Colaboração',
      clicked: true,
    },
    {
      id: 6,
      nome: 'Organização',
      clicked: false,
    },
  ],
}

const conhecimentosPorArea: Record<string, { id: number; nome: string }[]> = {
  '10': [
    { id: 1, nome: 'Conhecimento A' },
    { id: 2, nome: 'Conhecimento B' },
  ],
  '20': [
    { id: 1, nome: 'Conhecimento A' },
    { id: 3, nome: 'Conhecimento C' },
  ],
}

const URL_BASE = '/api/user/empregos/curriculo/habilidades-competencias'

const onCancel = vi.fn()

function renderHabilidadesCompetencias() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }

  return {
    queryClient,
    ...render(<HabilidadesCompetencias onCancel={onCancel} />, {
      wrapper: Wrapper,
    }),
  }
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

/** Responde às rotas do BFF; `put` define a resposta do Salvar. */
function mockFetch({
  dados = initialData,
  put = async () => jsonResponse({ area_atuacao: null }),
  area = async (id: string) =>
    conhecimentosPorArea[id]
      ? jsonResponse({ conhecimentos: conhecimentosPorArea[id] })
      : jsonResponse({ error: 'Área de atuação não encontrada' }, 404),
}: {
  dados?: unknown
  put?: () => Promise<Response>
  area?: (id: string) => Promise<Response>
} = {}) {
  vi.mocked(fetch).mockImplementation(async (input, init) => {
    const url = String(input)
    if (init?.method === 'PUT') return put()
    const areaMatch = url.match(/\/areas\/(\d+)\/habilidades$/)
    if (areaMatch) return area(areaMatch[1])
    if (url === URL_BASE) return jsonResponse(dados)
    throw new Error(`URL inesperada no teste: ${url}`)
  })
}

const chamadas = (filtro: (url: string, init?: RequestInit) => boolean) =>
  vi
    .mocked(fetch)
    .mock.calls.filter(([input, init]) => filtro(String(input), init))

const contarPuts = () => chamadas((_url, init) => init?.method === 'PUT').length

const corpoDoPut = () => {
  const [put] = chamadas((_url, init) => init?.method === 'PUT')
  expect(put).toBeDefined()
  return JSON.parse(String(put?.[1]?.body))
}

async function selecionarArea(
  user: ReturnType<typeof userEvent.setup>,
  nome: RegExp
) {
  const input = screen.getByRole('textbox', { name: 'Área de atuação' })
  await user.clear(input)
  await user.click(input)
  await user.click(screen.getByRole('button', { name: nome }))
}

describe('HabilidadesCompetencias', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', vi.fn())
  })

  it('mostra a área e os conhecimentos do currículo e mantém Salvar desabilitado sem alteração', async () => {
    mockFetch()

    renderHabilidadesCompetencias()

    const salvar = await screen.findByRole('button', { name: 'Salvar' })
    expect(salvar).toBeDisabled()
    expect(
      screen.getByRole('textbox', { name: 'Área de atuação' })
    ).toHaveValue('Área A')

    expect(
      await screen.findByRole('button', { name: 'Conhecimento A' })
    ).toHaveAttribute('aria-pressed', 'true')
    expect(
      screen.getByRole('button', { name: 'Conhecimento B' })
    ).toHaveAttribute('aria-pressed', 'false')

    expect(chamadas(url => url === URL_BASE)).toHaveLength(1)
    expect(
      chamadas(url => url === `${URL_BASE}/areas/10/habilidades`)
    ).toHaveLength(1)
  })

  it('habilita ao alterar um conhecimento e desabilita novamente ao desfazer a alteração', async () => {
    mockFetch()
    const user = userEvent.setup()

    renderHabilidadesCompetencias()

    const salvar = await screen.findByRole('button', { name: 'Salvar' })
    const conhecimento = await screen.findByRole('button', {
      name: 'Conhecimento B',
    })

    await user.click(conhecimento)
    expect(salvar).toBeEnabled()

    await user.click(conhecimento)
    expect(salvar).toBeDisabled()

    expect(contarPuts()).toBe(0)
  })

  it('ao trocar de área limpa os conhecimentos e envia a área nova com os conhecimentos dela', async () => {
    mockFetch()
    const user = userEvent.setup()

    renderHabilidadesCompetencias()

    const salvar = await screen.findByRole('button', { name: 'Salvar' })
    await screen.findByRole('button', { name: 'Conhecimento A' })

    await selecionarArea(user, /Área B/)

    // A área nova vem sem nenhum conhecimento marcado.
    expect(
      await screen.findByRole('button', { name: 'Conhecimento C' })
    ).toHaveAttribute('aria-pressed', 'false')
    expect(
      screen.getByRole('button', { name: 'Conhecimento A' })
    ).toHaveAttribute('aria-pressed', 'false')

    await user.click(screen.getByRole('button', { name: 'Conhecimento C' }))
    await user.click(screen.getByRole('button', { name: 'Organização' }))

    expect(salvar).toBeEnabled()
    await user.click(salvar)

    await waitFor(() => {
      expect(contarPuts()).toBe(1)
    })

    expect(corpoDoPut()).toEqual({
      id_area_atuacao: 20,
      habilidade_ids: [3],
      comportamento_atitudes_ids: [5, 6],
    })

    await waitFor(() => {
      expect(salvar).toBeDisabled()
    })

    expect(mockToastSuccess).toHaveBeenCalledWith(
      'Habilidades e competências salvas com sucesso'
    )
  })

  it('selecionar de novo a área atual não apaga os conhecimentos marcados', async () => {
    mockFetch()
    const user = userEvent.setup()

    renderHabilidadesCompetencias()

    const salvar = await screen.findByRole('button', { name: 'Salvar' })
    await screen.findByRole('button', { name: 'Conhecimento A' })

    await selecionarArea(user, /Área A/)

    expect(
      screen.getByRole('button', { name: 'Conhecimento A' })
    ).toHaveAttribute('aria-pressed', 'true')
    expect(salvar).toBeDisabled()
  })

  it('voltar para a área original depois de trocar exige marcar os conhecimentos de novo', async () => {
    mockFetch()
    const user = userEvent.setup()

    renderHabilidadesCompetencias()

    const salvar = await screen.findByRole('button', { name: 'Salvar' })
    await screen.findByRole('button', { name: 'Conhecimento A' })

    await selecionarArea(user, /Área B/)
    await screen.findByRole('button', { name: 'Conhecimento C' })
    await selecionarArea(user, /Área A/)

    expect(
      await screen.findByRole('button', { name: 'Conhecimento B' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Conhecimento A' })
    ).toHaveAttribute('aria-pressed', 'false')
    expect(salvar).toBeEnabled()

    await user.click(screen.getByRole('button', { name: 'Conhecimento A' }))
    expect(salvar).toBeDisabled()
  })

  it('sem área no currículo não busca conhecimentos até uma área ser escolhida', async () => {
    mockFetch({
      dados: {
        ...initialData,
        areaAtuacaoSelecionada: null,
        conhecimentosSelecionados: [],
      },
    })
    const user = userEvent.setup()

    renderHabilidadesCompetencias()

    const salvar = await screen.findByRole('button', { name: 'Salvar' })
    expect(
      screen.queryByText('Selecione conhecimentos')
    ).not.toBeInTheDocument()
    expect(chamadas(url => url.includes('/areas/'))).toHaveLength(0)

    await selecionarArea(user, /Área A/)
    await user.click(
      await screen.findByRole('button', { name: 'Conhecimento B' })
    )
    await user.click(salvar)

    await waitFor(() => {
      expect(contarPuts()).toBe(1)
    })
    expect(corpoDoPut()).toEqual({
      id_area_atuacao: 10,
      habilidade_ids: [2],
      comportamento_atitudes_ids: [5],
    })
  })

  it('exibe erro quando não consegue carregar os conhecimentos da área', async () => {
    mockFetch({ area: async () => new Response(null, { status: 502 }) })

    renderHabilidadesCompetencias()

    expect(
      await screen.findByText(
        'Não foi possível carregar os conhecimentos desta área.'
      )
    ).toBeInTheDocument()
  })

  it('mantém a alteração pendente quando ocorre erro ao salvar', async () => {
    mockFetch({ put: async () => new Response(null, { status: 500 }) })

    const user = userEvent.setup()

    renderHabilidadesCompetencias()

    const salvar = await screen.findByRole('button', { name: 'Salvar' })

    await user.click(screen.getByRole('button', { name: 'Organização' }))

    expect(salvar).toBeEnabled()

    await user.click(salvar)

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        'Não foi possível salvar. Tente novamente.'
      )
    })

    expect(salvar).toBeEnabled()
    expect(contarPuts()).toBe(1)
  })

  it('abre e filtra as áreas de atuação ao interagir com o campo de busca', async () => {
    mockFetch()
    const user = userEvent.setup()

    renderHabilidadesCompetencias()

    const input = await screen.findByLabelText('Área de atuação')

    await user.clear(input)
    await user.click(input)

    expect(screen.getByRole('button', { name: /Área A/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Área B/ })).toBeInTheDocument()

    await user.type(input, 'Área B')

    expect(
      screen.queryByRole('button', { name: /Área A/ })
    ).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Área B/ })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Área B/ }))

    expect(input).toHaveValue('Área B')

    await user.clear(input)
    await user.type(input, 'Área')

    expect(screen.getByRole('button', { name: /Área A/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Área B/ })).toBeInTheDocument()

    expect(contarPuts()).toBe(0)
  })

  it('com a área salva no campo, a lista abre com todas as áreas', async () => {
    mockFetch()
    const user = userEvent.setup()

    renderHabilidadesCompetencias()

    const input = await screen.findByRole('textbox', {
      name: 'Área de atuação',
    })
    expect(input).toHaveValue('Área A')

    await user.click(input)

    expect(screen.getByRole('button', { name: /Área A/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Área B/ })).toBeInTheDocument()
  })

  it('exibe mensagem de erro quando não consegue carregar habilidades e competências', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(null, {
        status: 500,
      })
    )

    renderHabilidadesCompetencias()

    expect(
      await screen.findByText(
        'Não foi possível carregar habilidades e competências.'
      )
    ).toBeInTheDocument()

    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('habilita Salvar ao selecionar um comportamento e desabilita ao desfazer', async () => {
    mockFetch()
    const user = userEvent.setup()

    renderHabilidadesCompetencias()

    const salvar = await screen.findByRole('button', { name: 'Salvar' })

    expect(salvar).toBeDisabled()

    const comportamento = screen.getByRole('button', { name: 'Organização' })

    await user.click(comportamento)
    expect(salvar).toBeEnabled()

    await user.click(comportamento)
    expect(salvar).toBeDisabled()

    expect(contarPuts()).toBe(0)
  })

  it('restaura os dados originais ao cancelar alterações', async () => {
    mockFetch()
    const user = userEvent.setup()

    const { queryClient } = renderHabilidadesCompetencias()

    await screen.findByRole('button', { name: 'Salvar' })

    await user.click(screen.getByRole('button', { name: 'Organização' }))

    expect(screen.getByRole('button', { name: 'Salvar' })).toBeEnabled()

    await user.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(onCancel).toHaveBeenCalledTimes(1)

    expect(queryClient.getQueryData(['habilidades-competencias'])).toEqual(
      initialData
    )

    expect(contarPuts()).toBe(0)
  })

  it('exibe mensagem quando a pesquisa não encontra áreas de atuação', async () => {
    mockFetch()
    const user = userEvent.setup()

    renderHabilidadesCompetencias()

    const input = await screen.findByRole('textbox', {
      name: 'Área de atuação',
    })

    await user.clear(input)
    await user.type(input, 'Área inexistente')

    expect(screen.getByText('Nenhuma área encontrada')).toBeInTheDocument()

    expect(
      screen.queryByRole('button', { name: /Área A|Área B/ })
    ).not.toBeInTheDocument()
  })

  it('impede múltiplos salvamentos enquanto uma requisição está em andamento', async () => {
    let resolverPut!: (response: Response) => void

    const putPendente = new Promise<Response>(resolve => {
      resolverPut = resolve
    })

    mockFetch({ put: () => putPendente })

    const user = userEvent.setup()

    renderHabilidadesCompetencias()

    const salvar = await screen.findByRole('button', { name: 'Salvar' })

    // Produz uma alteração.
    await user.click(screen.getByRole('button', { name: 'Organização' }))

    expect(salvar).toBeEnabled()

    // Inicia o salvamento, mas mantém a resposta pendente.
    await user.click(salvar)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Salvando...' })).toBeDisabled()
    })

    // Confirma que somente um PUT foi enviado.
    expect(contarPuts()).toBe(1)

    // O botão permanece desabilitado durante a requisição.
    expect(salvar).toBeDisabled()

    // Libera a resposta da API.
    resolverPut(jsonResponse({ area_atuacao: null }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Salvar' })).toBeDisabled()
    })

    expect(contarPuts()).toBe(1)

    expect(mockToastSuccess).toHaveBeenCalledWith(
      'Habilidades e competências salvas com sucesso'
    )
  })
})
