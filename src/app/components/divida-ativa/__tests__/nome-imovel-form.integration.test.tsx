import { adicionarImovel } from '@/actions/divida-ativa/adicionar-imovel'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { NomeImovelForm } from '../nome-imovel-form'

vi.mock('@/actions/divida-ativa/adicionar-imovel', () => ({
  adicionarImovel: vi.fn(),
}))

const push = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, back: vi.fn() }),
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

describe('NomeImovelForm', () => {
  beforeEach(() => {
    push.mockClear()
    toastError.mockClear()
    vi.mocked(adicionarImovel).mockClear()
    vi.mocked(adicionarImovel).mockResolvedValue({
      success: true,
      data: {
        id: 32,
        inscricao: '05217663',
        endereco: null,
        nome: null,
        bairro: null,
        proprietario: null,
        possuiDebitos: null,
        cadastradoEm: null,
      },
    })
  })

  /** O "Continuar" daqui é quem grava — a confirmação anterior só consultou. */
  test('grava o imóvel com o nome e leva à tela de sucesso', async () => {
    const user = userEvent.setup()
    render(<NomeImovelForm inscricao="05217663" />)

    await user.type(screen.getByLabelText('Nome do imóvel'), 'Casa de praia')
    await user.click(screen.getByRole('button', { name: 'Continuar' }))

    await waitFor(() =>
      expect(vi.mocked(adicionarImovel)).toHaveBeenCalledWith(
        '05217663',
        'Casa de praia'
      )
    )
    await waitFor(() =>
      expect(push).toHaveBeenCalledWith('/divida-ativa/imoveis/novo/sucesso')
    )
  })

  /** O nome é opcional: pular o passo grava mesmo assim, sem nome. */
  test('com o campo vazio, grava sem nome', async () => {
    const user = userEvent.setup()
    render(<NomeImovelForm inscricao="05217663" />)

    await user.click(screen.getByRole('button', { name: 'Continuar' }))

    await waitFor(() =>
      expect(vi.mocked(adicionarImovel)).toHaveBeenCalledWith(
        '05217663',
        undefined
      )
    )
  })

  test('mostra o motivo da API e permanece na tela quando o cadastro falha', async () => {
    vi.mocked(adicionarImovel).mockResolvedValue({
      success: false,
      error: 'Este imóvel já está na sua lista.',
      status: 409,
    })

    const user = userEvent.setup()
    render(<NomeImovelForm inscricao="05217663" />)

    await user.click(screen.getByRole('button', { name: 'Continuar' }))

    await waitFor(() =>
      expect(toastError).toHaveBeenCalledWith(
        'Este imóvel já está na sua lista.'
      )
    )
    expect(push).not.toHaveBeenCalled()
  })

  test('explica para que serve o nome', () => {
    render(<NomeImovelForm inscricao="05217663" />)

    expect(
      screen.getByText(/Para facilitar a exibição dos seus débitos/)
    ).toBeInTheDocument()
  })

  test('rejeita nome acima do tamanho máximo sem chamar a action', async () => {
    const user = userEvent.setup()
    render(<NomeImovelForm inscricao="05217663" />)

    await user.type(screen.getByLabelText('Nome do imóvel'), 'a'.repeat(61))
    await user.click(screen.getByRole('button', { name: 'Continuar' }))

    expect(
      await screen.findByText('O nome pode ter no máximo 60 caracteres.')
    ).toBeInTheDocument()
    expect(vi.mocked(adicionarImovel)).not.toHaveBeenCalled()
    expect(push).not.toHaveBeenCalled()
  })
})
