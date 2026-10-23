import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { RequerimentosErro } from '../requerimentos-erro'
import { RequerimentosVazio } from '../requerimentos-vazio'

const refresh = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh, push: vi.fn(), back: vi.fn() }),
}))

const toastError = vi.fn()
vi.mock('react-hot-toast', () => ({
  default: {
    error: (...args: unknown[]) => toastError(...args),
    success: vi.fn(),
  },
}))

describe('RequerimentosErro', () => {
  beforeEach(() => {
    refresh.mockClear()
    toastError.mockClear()
  })

  test('avisa com toast e mantém o texto na tela', () => {
    render(<RequerimentosErro />)

    expect(toastError).toHaveBeenCalledTimes(1)
    expect(
      screen.getByText('O serviço de dívida ativa está indisponível no momento')
    ).toBeInTheDocument()
  })

  test('"Tentar novamente" refaz a consulta sem sair da URL', async () => {
    const user = userEvent.setup()
    render(<RequerimentosErro />)

    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }))

    expect(refresh).toHaveBeenCalledTimes(1)
  })
})

describe('RequerimentosVazio', () => {
  test('mostra o título e a mensagem da API, com o caminho de volta', () => {
    render(
      <RequerimentosVazio
        titulo="Não encontramos requerimento para o protocolo informado"
        mensagem="Requerimento nao encontrado."
      />
    )

    expect(
      screen.getByText(
        'Não encontramos requerimento para o protocolo informado'
      )
    ).toBeInTheDocument()
    expect(screen.getByText('Requerimento nao encontrado.')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Pesquisar novamente' })
    ).toHaveAttribute('href', '/divida-ativa/acompanhamento')
  })
})
