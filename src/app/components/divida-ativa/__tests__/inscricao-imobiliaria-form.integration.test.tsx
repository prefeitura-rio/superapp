import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { InscricaoImobiliariaForm } from '../inscricao-imobiliaria-form'

const push = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, back: vi.fn() }),
}))

describe('InscricaoImobiliariaForm', () => {
  beforeEach(() => {
    push.mockClear()
  })

  test('aplica a máscara enquanto o cidadão digita', async () => {
    const user = userEvent.setup()
    render(<InscricaoImobiliariaForm />)

    const campo = screen.getByLabelText('Inscrição imobiliária')

    await user.type(campo, '05217663')

    expect(campo).toHaveValue('0.521.766-3')
  })

  test('aceita inscrição de 7 dígitos', async () => {
    const user = userEvent.setup()
    render(<InscricaoImobiliariaForm />)

    const campo = screen.getByLabelText('Inscrição imobiliária')

    await user.type(campo, '5217663')

    expect(campo).toHaveValue('521.766-3')
  })

  test('ignora o que o cidadão digitar além do oitavo dígito', async () => {
    const user = userEvent.setup()
    render(<InscricaoImobiliariaForm />)

    const campo = screen.getByLabelText('Inscrição imobiliária')

    await user.type(campo, '0521766399999')

    expect(campo).toHaveValue('0.521.766-3')
  })

  test('não avança com menos de 7 dígitos', async () => {
    const user = userEvent.setup()
    render(<InscricaoImobiliariaForm />)

    await user.type(screen.getByLabelText('Inscrição imobiliária'), '12345')
    await user.click(screen.getByRole('button', { name: 'Continuar' }))

    expect(
      await screen.findByText('A inscrição imobiliária tem 7 ou 8 números.')
    ).toBeInTheDocument()
    expect(push).not.toHaveBeenCalled()
  })

  test('não avança com o campo vazio', async () => {
    const user = userEvent.setup()
    render(<InscricaoImobiliariaForm />)

    await user.click(screen.getByRole('button', { name: 'Continuar' }))

    expect(
      await screen.findByText('Digite a inscrição imobiliária.')
    ).toBeInTheDocument()
    expect(push).not.toHaveBeenCalled()
  })

  test('leva à confirmação carregando só os dígitos na URL', async () => {
    const user = userEvent.setup()
    render(<InscricaoImobiliariaForm />)

    await user.type(screen.getByLabelText('Inscrição imobiliária'), '05217663')
    await user.click(screen.getByRole('button', { name: 'Continuar' }))

    await waitFor(() =>
      expect(push).toHaveBeenCalledWith(
        '/divida-ativa/imoveis/novo/confirmar?inscricao=05217663'
      )
    )
  })

  test('explica onde encontrar o número', () => {
    render(<InscricaoImobiliariaForm />)

    expect(
      screen.getByText(/Ele está no canto superior direito do boleto/)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Digite somente números, sem pontos ou traços/)
    ).toBeInTheDocument()
  })
})
