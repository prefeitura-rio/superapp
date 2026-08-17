import { adicionarImovel } from '@/actions/divida-ativa/adicionar-imovel'
import type { ImovelDividaAtiva } from '@/types/divida-ativa'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { ConfirmarImovel } from '../confirmar-imovel'

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

const IMOVEL: ImovelDividaAtiva = {
  inscricao: '05217663',
  endereco: 'Rua Barata Ribeiro, 586 - A 501',
  bairro: 'Copacabana',
  proprietario: 'Bruno Rocha Menezes',
  possuiDebitos: false,
  cadastradoEm: null,
}

describe('ConfirmarImovel', () => {
  beforeEach(() => {
    push.mockClear()
    toastError.mockClear()
    vi.mocked(adicionarImovel).mockResolvedValue({
      success: true,
      data: IMOVEL,
    })
  })

  test('mostra o que a consulta trouxe para o cidadão conferir', () => {
    render(<ConfirmarImovel imovel={IMOVEL} />)

    expect(
      screen.getByRole('heading', {
        name: 'Confirme sua inscrição imobiliária',
      })
    ).toBeInTheDocument()
    expect(
      screen.getByText('Rua Barata Ribeiro, 586 - A 501')
    ).toBeInTheDocument()
    expect(screen.getByText('Copacabana')).toBeInTheDocument()
    expect(screen.getByText('0.521.766-3')).toBeInTheDocument()
    expect(screen.getByText('Bruno Rocha Menezes')).toBeInTheDocument()
  })

  test('só cadastra o imóvel quando o cidadão confirma', async () => {
    const user = userEvent.setup()
    render(<ConfirmarImovel imovel={IMOVEL} />)

    expect(vi.mocked(adicionarImovel)).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Confirmar' }))

    await waitFor(() =>
      expect(vi.mocked(adicionarImovel)).toHaveBeenCalledWith('05217663')
    )
  })

  test('cadastrado com sucesso, leva à tela de confirmação', async () => {
    const user = userEvent.setup()
    render(<ConfirmarImovel imovel={IMOVEL} />)

    await user.click(screen.getByRole('button', { name: 'Confirmar' }))

    await waitFor(() =>
      expect(push).toHaveBeenCalledWith('/divida-ativa/imoveis/novo/sucesso')
    )
  })

  test('mostra o motivo da API e permanece na tela quando o cadastro falha', async () => {
    vi.mocked(adicionarImovel).mockResolvedValue({
      success: false,
      error: 'Este imóvel já está na sua lista.',
      status: 409,
    })

    const user = userEvent.setup()
    render(<ConfirmarImovel imovel={IMOVEL} />)

    await user.click(screen.getByRole('button', { name: 'Confirmar' }))

    await waitFor(() =>
      expect(toastError).toHaveBeenCalledWith(
        'Este imóvel já está na sua lista.'
      )
    )
    expect(push).not.toHaveBeenCalled()
  })

  test('voltar leva de novo ao campo da inscrição', () => {
    render(<ConfirmarImovel imovel={IMOVEL} />)

    expect(screen.getByRole('link', { name: 'Voltar' })).toHaveAttribute(
      'href',
      '/divida-ativa/imoveis/novo'
    )
  })
})
