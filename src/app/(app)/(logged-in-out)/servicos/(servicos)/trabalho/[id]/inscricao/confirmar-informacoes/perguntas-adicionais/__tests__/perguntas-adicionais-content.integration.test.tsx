import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { PerguntasAdicionaisContent } from '../perguntas-adicionais-content'

const mockPush = vi.fn()
const mockToastError = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

vi.mock('react-hot-toast', () => ({
  default: { error: (msg: string) => mockToastError(msg) },
}))

vi.mock('canvas-confetti', () => ({ default: vi.fn() }))

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

const perguntaRespostaCurta = {
  id: 'p1',
  id_vaga: 'vaga-123',
  titulo: 'Por que você quer esta vaga?',
  obrigatorio: true,
  tipo_campo: 'resposta_curta' as const,
  valor_minimo: null,
  valor_maximo: null,
  opcoes: null,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
}

const perguntaNumerica = {
  id: 'p2',
  id_vaga: 'vaga-123',
  titulo: 'Quantos anos de experiência?',
  obrigatorio: true,
  tipo_campo: 'resposta_numerica' as const,
  valor_minimo: 0,
  valor_maximo: 40,
  opcoes: null,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
}

const perguntaSelecaoUnica = {
  id: 'p3',
  id_vaga: 'vaga-123',
  titulo: 'Disponibilidade de horário',
  obrigatorio: true,
  tipo_campo: 'selecao_unica' as const,
  valor_minimo: null,
  valor_maximo: null,
  opcoes: ['Manhã', 'Tarde', 'Noite'],
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
}

const perguntaSelecaoMultipla = {
  id: 'p4',
  id_vaga: 'vaga-123',
  titulo: 'Habilidades',
  obrigatorio: false,
  tipo_campo: 'selecao_multipla' as const,
  valor_minimo: null,
  valor_maximo: null,
  opcoes: ['Excel', 'Word', 'PowerPoint'],
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
}

describe('PerguntasAdicionaisContent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('renderização', () => {
    test('exibe heading "Perguntas adicionais"', () => {
      render(
        <PerguntasAdicionaisContent
          vagaId="vaga-123"
          informacoesComplementares={[perguntaRespostaCurta]}
        />,
        { wrapper }
      )

      expect(
        screen.getByRole('heading', { name: 'Perguntas adicionais' })
      ).toBeInTheDocument()
    })

    test('renderiza campo de resposta curta com o título correto', () => {
      render(
        <PerguntasAdicionaisContent
          vagaId="vaga-123"
          informacoesComplementares={[perguntaRespostaCurta]}
        />,
        { wrapper }
      )

      expect(
        screen.getByText('Por que você quer esta vaga?')
      ).toBeInTheDocument()
    })

    test('renderiza campo numérico com o título correto', () => {
      render(
        <PerguntasAdicionaisContent
          vagaId="vaga-123"
          informacoesComplementares={[perguntaNumerica]}
        />,
        { wrapper }
      )

      expect(
        screen.getByText('Quantos anos de experiência?')
      ).toBeInTheDocument()
    })

    test('renderiza campo de seleção única com o título correto', () => {
      render(
        <PerguntasAdicionaisContent
          vagaId="vaga-123"
          informacoesComplementares={[perguntaSelecaoUnica]}
        />,
        { wrapper }
      )

      expect(screen.getByText('Disponibilidade de horário')).toBeInTheDocument()
    })

    test('renderiza campo de seleção múltipla com o título correto', () => {
      render(
        <PerguntasAdicionaisContent
          vagaId="vaga-123"
          informacoesComplementares={[perguntaSelecaoMultipla]}
        />,
        { wrapper }
      )

      expect(screen.getByText('Habilidades')).toBeInTheDocument()
    })

    test('renderiza mix de todos os tipos de campo', () => {
      render(
        <PerguntasAdicionaisContent
          vagaId="vaga-123"
          informacoesComplementares={[
            perguntaRespostaCurta,
            perguntaNumerica,
            perguntaSelecaoUnica,
            perguntaSelecaoMultipla,
          ]}
        />,
        { wrapper }
      )

      expect(
        screen.getByText('Por que você quer esta vaga?')
      ).toBeInTheDocument()
      expect(
        screen.getByText('Quantos anos de experiência?')
      ).toBeInTheDocument()
      expect(screen.getByText('Disponibilidade de horário')).toBeInTheDocument()
      expect(screen.getByText('Habilidades')).toBeInTheDocument()
    })

    test('exibe botão "Finalizar inscrição"', () => {
      render(
        <PerguntasAdicionaisContent
          vagaId="vaga-123"
          informacoesComplementares={[perguntaRespostaCurta]}
        />,
        { wrapper }
      )

      expect(
        screen.getByRole('button', { name: 'Finalizar inscrição' })
      ).toBeInTheDocument()
    })
  })

  describe('validação', () => {
    test('exibe toast de erro ao submeter com campo obrigatório vazio', async () => {
      const user = userEvent.setup()

      render(
        <PerguntasAdicionaisContent
          vagaId="vaga-123"
          informacoesComplementares={[perguntaRespostaCurta]}
        />,
        { wrapper }
      )

      await user.click(
        screen.getByRole('button', { name: 'Finalizar inscrição' })
      )

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith(
          'Por favor, preencha todos os campos obrigatórios.'
        )
      })
    })
  })

  describe('submit bem-sucedido', () => {
    test('chama onEnviarCandidatura com respostas formatadas corretamente', async () => {
      const user = userEvent.setup()
      const mockEnviarCandidatura = vi.fn().mockResolvedValue({ success: true })

      render(
        <PerguntasAdicionaisContent
          vagaId="vaga-123"
          informacoesComplementares={[perguntaRespostaCurta]}
          onEnviarCandidatura={mockEnviarCandidatura}
        />,
        { wrapper }
      )

      const input = screen.getByPlaceholderText('Escreva aqui')
      await user.type(input, 'Tenho muito interesse')

      await user.click(
        screen.getByRole('button', { name: 'Finalizar inscrição' })
      )

      await waitFor(() => {
        expect(mockEnviarCandidatura).toHaveBeenCalledWith('vaga-123', [
          { id_info: 'p1', resposta: 'Tenho muito interesse' },
        ])
      })
    })

    test('chama onEnviarCandidatura com vagaId correto', async () => {
      const user = userEvent.setup()
      const mockEnviarCandidatura = vi.fn().mockResolvedValue({ success: true })

      render(
        <PerguntasAdicionaisContent
          vagaId="vaga-xyz-789"
          informacoesComplementares={[perguntaRespostaCurta]}
          onEnviarCandidatura={mockEnviarCandidatura}
        />,
        { wrapper }
      )

      await user.type(screen.getByPlaceholderText('Escreva aqui'), 'Resposta')
      await user.click(
        screen.getByRole('button', { name: 'Finalizar inscrição' })
      )

      await waitFor(() => {
        expect(mockEnviarCandidatura).toHaveBeenCalledWith(
          'vaga-xyz-789',
          expect.any(Array)
        )
      })
    })
  })

  describe('erro na action', () => {
    test('exibe toast de erro quando onEnviarCandidatura retorna sucesso false', async () => {
      const user = userEvent.setup()
      const mockEnviarCandidatura = vi.fn().mockResolvedValue({
        success: false,
        error: 'Você já está inscrito nesta vaga',
      })

      render(
        <PerguntasAdicionaisContent
          vagaId="vaga-123"
          informacoesComplementares={[perguntaRespostaCurta]}
          onEnviarCandidatura={mockEnviarCandidatura}
        />,
        { wrapper }
      )

      await user.type(screen.getByPlaceholderText('Escreva aqui'), 'Resposta')
      await user.click(
        screen.getByRole('button', { name: 'Finalizar inscrição' })
      )

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith(
          'Você já está inscrito nesta vaga'
        )
      })
    })

    test('exibe toast genérico quando error não está definido', async () => {
      const user = userEvent.setup()
      const mockEnviarCandidatura = vi
        .fn()
        .mockResolvedValue({ success: false })

      render(
        <PerguntasAdicionaisContent
          vagaId="vaga-123"
          informacoesComplementares={[perguntaRespostaCurta]}
          onEnviarCandidatura={mockEnviarCandidatura}
        />,
        { wrapper }
      )

      await user.type(screen.getByPlaceholderText('Escreva aqui'), 'Resposta')
      await user.click(
        screen.getByRole('button', { name: 'Finalizar inscrição' })
      )

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith(
          'Erro ao finalizar inscrição. Tente novamente.'
        )
      })
    })
  })
})
