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
    {
      nome: 'Área A',
      checked: true,
      vinculos: [
        {
          idTupla: 187,
          nome: 'Conhecimento A',
          checked: true,
        },
        {
          idTupla: 188,
          nome: 'Conhecimento B',
          checked: false,
        },
      ],
    },
    {
      nome: 'Área B',
      checked: false,
      vinculos: [
        {
          idTupla: 342,
          nome: 'Conhecimento A',
          checked: false,
        },
      ],
    },
  ],
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
    ...render(<HabilidadesCompetencias />, {
      wrapper: Wrapper,
    }),
  }
}

function mockFetchSuccess() {
  vi.mocked(fetch).mockImplementation(async (_input, init) => {
    if (init?.method === 'PUT') {
      return new Response(JSON.stringify({ message: 'Currículo atualizado' }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    }

    return new Response(JSON.stringify(initialData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  })
}

describe('HabilidadesCompetencias', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', vi.fn())
  })

  it('mantém Continuar desabilitado enquanto não houver alteração semântica', async () => {
    mockFetchSuccess()

    renderHabilidadesCompetencias()

    const continuar = await screen.findByRole('button', {
      name: 'Continuar',
    })

    expect(continuar).toBeDisabled()

    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('habilita ao alterar um conhecimento e desabilita novamente ao desfazer a alteração', async () => {
    mockFetchSuccess()
    const user = userEvent.setup()

    renderHabilidadesCompetencias()

    const continuar = await screen.findByRole('button', {
      name: 'Continuar',
    })

    expect(continuar).toBeDisabled()

    await user.click(
      screen.getByRole('button', {
        name: 'Abrir lista de áreas',
      })
    )

    await user.click(
      screen.getByRole('button', {
        name: /Área A/,
      })
    )

    const conhecimento = screen.getByRole('button', {
      name: 'Conhecimento A',
    })

    await user.click(conhecimento)

    expect(continuar).toBeEnabled()

    await user.click(conhecimento)

    expect(continuar).toBeDisabled()

    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('envia IDs das tuplas e comportamentos e transforma o estado salvo no novo snapshot', async () => {
    mockFetchSuccess()
    const user = userEvent.setup()

    renderHabilidadesCompetencias()

    const continuar = await screen.findByRole('button', {
      name: 'Continuar',
    })

    await user.click(
      screen.getByRole('button', {
        name: 'Abrir lista de áreas',
      })
    )

    await user.click(
      screen.getByRole('button', {
        name: /Área B/,
      })
    )

    await user.click(
      screen.getByRole('button', {
        name: 'Conhecimento A',
      })
    )

    await user.click(
      screen.getByRole('button', {
        name: 'Organização',
      })
    )

    expect(continuar).toBeEnabled()

    await user.click(continuar)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2)
    })

    const putCall = vi
      .mocked(fetch)
      .mock.calls.find(([, init]) => init?.method === 'PUT')

    expect(putCall).toBeDefined()

    expect(JSON.parse(String(putCall?.[1]?.body))).toEqual({
      area_atuacao_habilidade_ids: [187, 342],
      comportamento_atitudes_ids: [5, 6],
    })

    await waitFor(() => {
      expect(continuar).toBeDisabled()
    })

    expect(mockToastSuccess).toHaveBeenCalledWith(
      'Habilidades e competências salvas com sucesso'
    )
  })

  it('mantém a alteração pendente quando ocorre erro ao salvar', async () => {
    vi.mocked(fetch).mockImplementation(async (_input, init) => {
      if (init?.method === 'PUT') {
        return new Response(null, {
          status: 500,
        })
      }

      return new Response(JSON.stringify(initialData), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    })

    const user = userEvent.setup()

    renderHabilidadesCompetencias()

    const continuar = await screen.findByRole('button', {
      name: 'Continuar',
    })

    await user.click(
      screen.getByRole('button', {
        name: 'Organização',
      })
    )

    expect(continuar).toBeEnabled()

    await user.click(continuar)

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        'Não foi possível salvar. Tente novamente.'
      )
    })

    expect(continuar).toBeEnabled()

    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('abre e filtra as áreas de atuação ao interagir com o campo de busca', async () => {
    mockFetchSuccess()
    const user = userEvent.setup()

    renderHabilidadesCompetencias()

    const input = await screen.findByLabelText('Área de atuação')

    await user.click(input)

    expect(
      screen.getByRole('button', {
        name: /Área A/,
      })
    ).toBeInTheDocument()

    expect(
      screen.getByRole('button', {
        name: /Área B/,
      })
    ).toBeInTheDocument()

    await user.type(input, 'Área B')

    expect(
      screen.queryByRole('button', {
        name: /Área A/,
      })
    ).not.toBeInTheDocument()

    expect(
      screen.getByRole('button', {
        name: /Área B/,
      })
    ).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', {
        name: /Área B/,
      })
    )

    expect(input).toHaveValue('Área B')

    await user.clear(input)
    await user.type(input, 'Área')

    expect(
      screen.getByRole('button', {
        name: /Área A/,
      })
    ).toBeInTheDocument()

    expect(
      screen.getByRole('button', {
        name: /Área B/,
      })
    ).toBeInTheDocument()

    expect(fetch).toHaveBeenCalledTimes(1)
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
})
