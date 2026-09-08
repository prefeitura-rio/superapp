import { excluirImovel } from '@/actions/divida-ativa/excluir-imovel'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { ImovelAcoesButton } from '../imovel-acoes-button'

vi.mock('@/actions/divida-ativa/excluir-imovel', () => ({
  excluirImovel: vi.fn(),
}))

const refresh = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh, push: vi.fn() }),
}))

const toastError = vi.fn()
vi.mock('react-hot-toast', () => ({
  default: {
    error: (...args: unknown[]) => toastError(...args),
    success: vi.fn(),
  },
  toast: {
    error: (...args: unknown[]) => toastError(...args),
    success: vi.fn(),
  },
}))

const PROPS = {
  id: 32,
  descricao: 'Rua Barata Ribeiro, 586 - A 501',
}

const ABRIR_MENU = { name: 'Ações do imóvel Rua Barata Ribeiro, 586 - A 501' }

describe('ImovelAcoesButton', () => {
  beforeEach(() => {
    vi.mocked(excluirImovel).mockResolvedValue({ success: true, data: null })
    refresh.mockClear()
    toastError.mockClear()
  })

  test('os três pontinhos abrem o menu com as duas ações', async () => {
    const user = userEvent.setup()
    render(<ImovelAcoesButton {...PROPS} />)

    expect(screen.queryByText('Editar nome')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', ABRIR_MENU))

    expect(await screen.findByText('Editar nome')).toBeInTheDocument()
    expect(screen.getByText('Excluir imóvel')).toBeInTheDocument()
  })

  // O link carrega o id local, que é como a API identifica o registro — a inscrição não
  // serve nem para renomear nem para excluir.
  test('"Editar nome" leva para a edição daquele imóvel', async () => {
    const user = userEvent.setup()
    render(<ImovelAcoesButton {...PROPS} />)

    await user.click(screen.getByRole('button', ABRIR_MENU))

    expect(
      await screen.findByRole('link', { name: 'Editar nome' })
    ).toHaveAttribute('href', '/divida-ativa/imoveis/32/nome')
  })

  test('"Excluir imóvel" pede confirmação em vez de excluir', async () => {
    const user = userEvent.setup()
    render(<ImovelAcoesButton {...PROPS} />)

    await user.click(screen.getByRole('button', ABRIR_MENU))
    await user.click(
      await screen.findByRole('button', { name: 'Excluir imóvel' })
    )

    expect(
      await screen.findByText(
        'Você tem certeza que gostaria de excluir esse imóvel?'
      )
    ).toBeInTheDocument()

    // O aviso de irreversibilidade é o que dá conteúdo à pergunta — sem ele o cidadão
    // confirma sem saber que a exclusão não tem volta.
    expect(
      screen.getByText(
        'Essa ação é permanente e não poderá ser desfeita. Todos os dados desse imóvel serão excluídos.'
      )
    ).toBeInTheDocument()

    expect(vi.mocked(excluirImovel)).not.toHaveBeenCalled()
  })

  test('cancelar fecha o aviso sem excluir nada', async () => {
    const user = userEvent.setup()
    render(<ImovelAcoesButton {...PROPS} />)

    await user.click(screen.getByRole('button', ABRIR_MENU))
    await user.click(
      await screen.findByRole('button', { name: 'Excluir imóvel' })
    )
    await user.click(await screen.findByRole('button', { name: 'Cancelar' }))

    expect(vi.mocked(excluirImovel)).not.toHaveBeenCalled()
  })

  test('confirmar exclui o imóvel pelo id local', async () => {
    const user = userEvent.setup()
    render(<ImovelAcoesButton {...PROPS} />)

    await user.click(screen.getByRole('button', ABRIR_MENU))
    await user.click(
      await screen.findByRole('button', { name: 'Excluir imóvel' })
    )
    await user.click(
      await screen.findByRole('button', { name: 'Excluir imóvel' })
    )

    await waitFor(() =>
      expect(vi.mocked(excluirImovel)).toHaveBeenCalledWith(32)
    )
  })

  test('mostra o motivo da API quando a exclusão é recusada', async () => {
    vi.mocked(excluirImovel).mockResolvedValue({
      success: false,
      error: 'Não é possível excluir: há um requerimento em andamento.',
      status: 409,
    })

    const user = userEvent.setup()
    render(<ImovelAcoesButton {...PROPS} />)

    await user.click(screen.getByRole('button', ABRIR_MENU))
    await user.click(
      await screen.findByRole('button', { name: 'Excluir imóvel' })
    )
    await user.click(
      await screen.findByRole('button', { name: 'Excluir imóvel' })
    )

    await waitFor(() =>
      expect(toastError).toHaveBeenCalledWith(
        'Não é possível excluir: há um requerimento em andamento.'
      )
    )
  })
})
