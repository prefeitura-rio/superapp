import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { CatalogoItem } from '../catalogo'
import { HabilidadesAccordionMark } from '../habilidades-accordion-mark'
import { HabilidadesCompetencias } from '../index'

const areas: CatalogoItem[] = [
  { id: 10, nome: 'Engenharia Mecânica' },
  { id: 12, nome: 'Comunicação' },
]
const conhecimentosPorArea: Record<number, CatalogoItem[]> = {
  10: [{ id: 1, nome: 'Gestão de projetos' }],
  12: [{ id: 4, nome: 'Redação' }],
}
const comportamentos: CatalogoItem[] = [{ id: 4, nome: 'Proatividade' }]

function semAcento(valor: string) {
  return valor
    .normalize('NFD')
    .split('')
    .filter(char => {
      const codigo = char.charCodeAt(0)
      return codigo < 0x0300 || codigo > 0x036f
    })
    .join('')
    .toLowerCase()
}

const { mockToastSuccess, mockToastError, saveMock } = vi.hoisted(() => ({
  mockToastSuccess: vi.fn(),
  mockToastError: vi.fn(),
  saveMock: vi.fn(),
}))

vi.mock('react-hot-toast', () => ({
  default: {
    success: mockToastSuccess,
    error: mockToastError,
  },
}))

vi.mock('../habilidades-competencias-actions', () => ({
  getHabilidadesCompetenciasAction: vi.fn(async () => ({
    ok: true,
    data: { area: null, conhecimentos: [], comportamentos: [] },
  })),
  searchAreasAtuacaoAction: vi.fn(async (q?: string) => {
    const termo = semAcento(q ?? '')
    const data = termo
      ? areas.filter(area => semAcento(area.nome).includes(termo))
      : areas
    return { data, total: data.length, page: 1, pageSize: 20 }
  }),
  listConhecimentosDaAreaAction: vi.fn(async (areaId: number) => {
    const data = conhecimentosPorArea[areaId] ?? []
    return { data, total: data.length, page: 1, pageSize: 100 }
  }),
  listComportamentosAction: vi.fn(async () => ({
    data: comportamentos,
    total: comportamentos.length,
    page: 1,
    pageSize: 100,
  })),
  saveHabilidadesCompetenciasAction: saveMock,
}))

function salvo(body: {
  id_area_atuacao?: number | null
  comportamento_atitudes_ids?: number[]
}) {
  return {
    ok: true as const,
    data: {
      area: areas.find(area => area.id === body.id_area_atuacao) ?? null,
      conhecimentos: [],
      comportamentos: comportamentos.filter(item =>
        body.comportamento_atitudes_ids?.includes(item.id)
      ),
    },
  }
}

function Harness({
  onCancel = vi.fn(),
  onDirtyChange,
}: {
  onCancel?: () => void
  onDirtyChange?: (alterado: boolean) => void
}) {
  const [preenchida, setPreenchida] = useState(false)
  const [erro, setErro] = useState(false)

  return (
    <>
      <HabilidadesAccordionMark preenchida={preenchida} erro={erro} />
      <HabilidadesCompetencias
        onCancel={onCancel}
        onFilledChange={setPreenchida}
        onAreaErrorChange={setErro}
        onDirtyChange={onDirtyChange}
      />
    </>
  )
}

function renderSecao(
  onCancel = vi.fn(),
  onDirtyChange?: (alterado: boolean) => void
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }

  return render(<Harness onCancel={onCancel} onDirtyChange={onDirtyChange} />, {
    wrapper: Wrapper,
  })
}

async function escolherArea(nome: string) {
  const user = userEvent.setup()
  await user.click(await screen.findByRole('button', { name: /Selecionar/ }))
  await user.click(await screen.findByRole('radio', { name: nome }))
  return user
}

describe('HabilidadesCompetencias', () => {
  beforeEach(() => {
    mockToastSuccess.mockReset()
    mockToastError.mockReset()
    saveMock.mockReset()
    saveMock.mockImplementation(salvo)
  })

  it('mostra o check só depois de escolher a área, e a lupa só dentro do sheet', async () => {
    renderSecao()

    expect(screen.queryByTestId('habilidades-check')).not.toBeInTheDocument()
    expect(
      screen.queryByTestId('area-atuacao-search-icon')
    ).not.toBeInTheDocument()

    await escolherArea('Engenharia Mecânica')

    expect(screen.getByTestId('habilidades-check')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Engenharia Mecânica' })
    ).toBeInTheDocument()
    expect(
      screen.queryByTestId('area-atuacao-search-icon')
    ).not.toBeInTheDocument()
  })

  it('avisa quando a seleção muda em relação ao que está salvo', async () => {
    const onDirtyChange = vi.fn()
    renderSecao(vi.fn(), onDirtyChange)

    await waitFor(() => {
      expect(onDirtyChange).toHaveBeenCalledWith(false)
    })

    await escolherArea('Engenharia Mecânica')

    await waitFor(() => {
      expect(onDirtyChange).toHaveBeenLastCalledWith(true)
    })
  })

  it('busca área sem acento e não deixa a lupa no gatilho', async () => {
    const user = userEvent.setup()
    renderSecao()

    await user.click(await screen.findByRole('button', { name: /Selecionar/ }))
    expect(screen.getByTestId('area-atuacao-search-icon')).toBeInTheDocument()

    await user.type(screen.getByRole('textbox', { name: 'Pesquisar' }), 'cao')

    await waitFor(
      () => {
        expect(
          screen.queryByRole('radio', { name: 'Engenharia Mecânica' })
        ).not.toBeInTheDocument()
        expect(
          screen.getByRole('radio', { name: 'Comunicação' })
        ).toBeInTheDocument()
      },
      { timeout: 2000 }
    )
  })

  it('troca de área limpa conhecimentos e o salvar manda os ids do catálogo', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    renderSecao(onCancel)

    await escolherArea('Engenharia Mecânica')
    await user.click(
      await screen.findByRole('button', { name: 'Gestão de projetos' })
    )
    expect(
      screen.getByRole('button', { name: 'Gestão de projetos' })
    ).toHaveAttribute('aria-pressed', 'true')

    await user.click(
      screen.getByRole('button', { name: 'Engenharia Mecânica' })
    )
    await user.click(await screen.findByRole('radio', { name: 'Comunicação' }))

    expect(
      screen.queryByRole('button', { name: 'Gestão de projetos' })
    ).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Redação' })).toHaveAttribute(
      'aria-pressed',
      'false'
    )

    await user.click(screen.getByRole('button', { name: 'Proatividade' }))
    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    await waitFor(() => {
      expect(saveMock).toHaveBeenCalledWith({
        id_area_atuacao: 12,
        habilidade_ids: [],
        comportamento_atitudes_ids: [4],
      })
    })
    expect(mockToastSuccess).toHaveBeenCalledWith(
      'Habilidades salvas com sucesso'
    )
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('mostra o X quando o salvar responde 400 e não troca o estado salvo', async () => {
    const user = userEvent.setup()
    saveMock.mockResolvedValue({
      ok: false,
      status: 400,
      error: 'conhecimento não pertence à área de atuação',
    })
    const onCancel = vi.fn()
    renderSecao(onCancel)

    await escolherArea('Engenharia Mecânica')
    await user.click(
      await screen.findByRole('button', { name: 'Gestão de projetos' })
    )
    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(await screen.findByTestId('habilidades-error')).toBeInTheDocument()
    expect(screen.queryByTestId('habilidades-check')).not.toBeInTheDocument()
    expect(
      screen.getByText('conhecimento não pertence à área de atuação')
    ).toBeInTheDocument()
    expect(mockToastError).toHaveBeenCalled()
    expect(onCancel).not.toHaveBeenCalled()
  })
})
