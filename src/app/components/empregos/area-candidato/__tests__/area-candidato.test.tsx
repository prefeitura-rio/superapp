import { server } from '@/test/mocks/server'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AreaCandidato } from '../area-candidato'
import type { BancoCurriculosStatus } from '../area-candidato-utils'

const { mockUseAuthHeader, mockToastError } = vi.hoisted(() => ({
  mockUseAuthHeader: vi.fn(),
  mockToastError: vi.fn(),
}))

vi.mock('@/providers/auth-header-provider', () => ({
  useAuthHeader: mockUseAuthHeader,
}))

vi.mock('sonner', () => ({
  toast: { error: mockToastError },
}))

const BANCO_URL = '/api/user/empregos/banco-curriculos'
const CANDIDATURAS_URL = '/api/user/empregos/candidaturas'

const incompletoVisivel: BancoCurriculosStatus = {
  logado: true,
  temCurriculo: true,
  curriculoCompleto: false,
  pendencias: ['Termos de uso não aceitos'],
  curriculoAtualizadoEm: '2026-10-28T17:32:19-03:00',
  disponivel: true,
}

function logado(isLoggedIn: boolean) {
  mockUseAuthHeader.mockReturnValue({
    data: { isLoggedIn },
    isLoading: false,
  })
}

function responder(status: BancoCurriculosStatus, totalCandidaturas = 0) {
  const puts: unknown[] = []
  server.use(
    http.get(BANCO_URL, () => HttpResponse.json(status)),
    http.put(BANCO_URL, async ({ request }) => {
      const body = (await request.json()) as { disponivel: boolean }
      puts.push(body)
      return HttpResponse.json({ ...status, disponivel: body.disponivel })
    }),
    http.get(CANDIDATURAS_URL, () =>
      HttpResponse.json({
        candidaturas: [],
        hasCandidaturas: totalCandidaturas > 0,
        total: totalCandidaturas,
      })
    )
  )
  return puts
}

function renderArea() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  render(
    <QueryClientProvider client={queryClient}>
      <AreaCandidato />
    </QueryClientProvider>
  )
}

describe('AreaCandidato', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deslogado vê o banner para criar o currículo', () => {
    logado(false)

    renderArea()

    expect(
      screen.getByRole('link', { name: /Faça seu currículo/ })
    ).toHaveAttribute('href', '/servicos/trabalho/curriculo')
    expect(screen.queryByRole('switch')).not.toBeInTheDocument()
  })

  it('logado vê os cards e o controle liberado mesmo com o currículo incompleto', async () => {
    logado(true)
    responder(incompletoVisivel, 3)

    renderArea()

    const controle = await screen.findByRole('switch')
    expect(controle).toBeEnabled()
    expect(controle).toBeChecked()
    expect(screen.getByRole('link', { name: /Meu Currículo/ })).toHaveAttribute(
      'href',
      '/servicos/trabalho/curriculo'
    )
    expect(screen.getByText('Termine de preencher')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /Minhas candidaturas/ })
    ).toHaveAttribute('href', '/servicos/trabalho/minhas-candidaturas')
    expect(await screen.findByLabelText('3 candidaturas')).toBeInTheDocument()
  })

  it('desativar confirmado grava a escolha e atualiza o card', async () => {
    const user = userEvent.setup()
    logado(true)
    const puts = responder(incompletoVisivel)

    renderArea()
    await user.click(await screen.findByRole('switch'))
    await user.click(screen.getByRole('button', { name: 'Desativar' }))

    expect(
      await screen.findByText('Recrutadores não podem ver seu currículo')
    ).toBeInTheDocument()
    expect(screen.getByRole('switch')).not.toBeChecked()
    expect(puts).toEqual([{ disponivel: false }])
  })

  it('avisa quando não consegue gravar a escolha', async () => {
    const user = userEvent.setup()
    logado(true)
    responder({ ...incompletoVisivel, disponivel: false })
    server.use(
      http.put(BANCO_URL, () =>
        HttpResponse.json({ error: 'falhou' }, { status: 502 })
      )
    )

    renderArea()
    await user.click(await screen.findByRole('switch'))

    await waitFor(() =>
      expect(mockToastError).toHaveBeenCalledWith(
        'Não foi possível atualizar o Banco de Currículos.'
      )
    )
    expect(screen.getByRole('switch')).not.toBeChecked()
  })
})
