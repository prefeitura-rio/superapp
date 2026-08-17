import { excluirImovel } from '@/actions/divida-ativa/excluir-imovel'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { ExcluirImovelButton } from '../excluir-imovel-button'

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

describe('ExcluirImovelButton', () => {
  beforeEach(() => {
    vi.mocked(excluirImovel).mockResolvedValue({ success: true, data: null })
    refresh.mockClear()
    toastError.mockClear()
  })

  test('pede confirmação antes de excluir', async () => {
    const user = userEvent.setup()
    render(<ExcluirImovelButton {...PROPS} />)

    expect(
      screen.queryByText(
        'Você tem certeza que gostaria de excluir esse imóvel?'
      )
    ).not.toBeInTheDocument()

    await user.click(
      screen.getByRole('button', {
        name: 'Excluir imóvel Rua Barata Ribeiro, 586 - A 501',
      })
    )

    expect(
      await screen.findByText(
        'Você tem certeza que gostaria de excluir esse imóvel?'
      )
    ).toBeInTheDocument()
    expect(vi.mocked(excluirImovel)).not.toHaveBeenCalled()
  })

  test('cancelar fecha o aviso sem excluir nada', async () => {
    const user = userEvent.setup()
    render(<ExcluirImovelButton {...PROPS} />)

    await user.click(
      screen.getByRole('button', {
        name: 'Excluir imóvel Rua Barata Ribeiro, 586 - A 501',
      })
    )
    await user.click(await screen.findByRole('button', { name: 'Cancelar' }))

    expect(vi.mocked(excluirImovel)).not.toHaveBeenCalled()
  })

  test('confirmar exclui o imóvel pelo id local', async () => {
    const user = userEvent.setup()
    render(<ExcluirImovelButton {...PROPS} />)

    await user.click(
      screen.getByRole('button', {
        name: 'Excluir imóvel Rua Barata Ribeiro, 586 - A 501',
      })
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
    render(<ExcluirImovelButton {...PROPS} />)

    await user.click(
      screen.getByRole('button', {
        name: 'Excluir imóvel Rua Barata Ribeiro, 586 - A 501',
      })
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
