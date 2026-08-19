import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { NomeImovelForm } from '../nome-imovel-form'

const push = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, back: vi.fn() }),
}))

describe('NomeImovelForm', () => {
  beforeEach(() => {
    push.mockClear()
  })

  test('leva à confirmação com inscrição e nome na URL', async () => {
    const user = userEvent.setup()
    render(<NomeImovelForm inscricao="05217663" />)

    await user.type(screen.getByLabelText('Nome do imóvel'), 'Casa de praia')
    await user.click(screen.getByRole('button', { name: 'Continuar' }))

    await waitFor(() =>
      expect(push).toHaveBeenCalledWith(
        '/divida-ativa/imoveis/novo/confirmar?inscricao=05217663&nome=Casa+de+praia'
      )
    )
  })

  /** O nome é opcional: pular o passo segue para a confirmação sem o parâmetro. */
  test('com o campo vazio, segue sem o parâmetro de nome', async () => {
    const user = userEvent.setup()
    render(<NomeImovelForm inscricao="05217663" />)

    await user.click(screen.getByRole('button', { name: 'Continuar' }))

    await waitFor(() =>
      expect(push).toHaveBeenCalledWith(
        '/divida-ativa/imoveis/novo/confirmar?inscricao=05217663'
      )
    )
  })

  test('quem volta da confirmação reencontra o nome digitado', () => {
    render(<NomeImovelForm inscricao="05217663" nomeInicial="Minha Casa" />)

    expect(screen.getByLabelText('Nome do imóvel')).toHaveValue('Minha Casa')
  })

  test('explica para que serve o nome', () => {
    render(<NomeImovelForm inscricao="05217663" />)

    expect(
      screen.getByText(/Para facilitar a exibição dos seus débitos/)
    ).toBeInTheDocument()
  })

  test('rejeita nome acima do tamanho máximo', async () => {
    const user = userEvent.setup()
    render(<NomeImovelForm inscricao="05217663" />)

    await user.type(screen.getByLabelText('Nome do imóvel'), 'a'.repeat(61))
    await user.click(screen.getByRole('button', { name: 'Continuar' }))

    expect(
      await screen.findByText('O nome pode ter no máximo 60 caracteres.')
    ).toBeInTheDocument()
    expect(push).not.toHaveBeenCalled()
  })
})
