import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { ConsultaProtocoloForm } from '../consulta-protocolo-form'

const push = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, back: vi.fn() }),
}))

describe('ConsultaProtocoloForm', () => {
  beforeEach(() => {
    push.mockClear()
  })

  test('leva o número do protocolo para a rota do requerimento', async () => {
    const user = userEvent.setup()
    render(<ConsultaProtocoloForm />)

    await user.type(
      screen.getByLabelText('Consultar pelo n° do protocolo (sem o ano)'),
      '146679'
    )
    await user.click(screen.getByRole('button', { name: 'Continuar' }))

    expect(push).toHaveBeenCalledWith(
      '/divida-ativa/acompanhamento/requerimentos/146679'
    )
  })

  test('só aceita dígitos: o ano colado com barra não entra', async () => {
    const user = userEvent.setup()
    render(<ConsultaProtocoloForm />)

    const campo = screen.getByLabelText(
      'Consultar pelo n° do protocolo (sem o ano)'
    )
    await user.type(campo, '14-66.79abc')

    expect(campo).toHaveValue('146679')
  })

  test('mantém o Continuar desabilitado enquanto o campo está vazio', async () => {
    const user = userEvent.setup()
    render(<ConsultaProtocoloForm />)

    const botao = screen.getByRole('button', { name: 'Continuar' })
    expect(botao).toBeDisabled()

    await user.click(botao)
    expect(push).not.toHaveBeenCalled()

    await user.type(
      screen.getByLabelText('Consultar pelo n° do protocolo (sem o ano)'),
      '1'
    )
    expect(botao).toBeEnabled()
  })
})
