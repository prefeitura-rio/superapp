import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { DebitosErro } from '../debitos-erro'

const refresh = vi.fn()
const push = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh, push }),
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

beforeEach(() => {
  refresh.mockClear()
  push.mockClear()
  toastError.mockClear()
})

describe('DebitosErro — serviço indisponível', () => {
  /**
   * O caso medido em homologação: a API responde 503
   * `{"error":"Servico de Divida Ativa indisponivel no momento."}` para inscrição cadastrada
   * e válida. O cidadão não tem o que corrigir, e o número que ele digitou continua certo —
   * por isso a tela fica de pé em vez de devolvê-lo para `/servicos`.
   */
  test('explica que a falha é do serviço, não do número digitado', () => {
    render(<DebitosErro tipo="indisponivel" />)

    expect(
      screen.getByRole('heading', {
        name: 'O serviço de dívida ativa está indisponível no momento',
      })
    ).toBeInTheDocument()

    expect(
      screen.getByText(/O número que você informou está correto/)
    ).toBeInTheDocument()
  })

  test('avisa por toast além do texto na tela', () => {
    render(<DebitosErro tipo="indisponivel" />)

    expect(toastError).toHaveBeenCalledWith(
      'Serviço de dívida ativa indisponível. Tente novamente em alguns minutos.'
    )
  })

  /** Um toast por montagem: o StrictMode do dev monta duas vezes e duplicaria o aviso. */
  test('não repete o toast quando remonta', () => {
    const { rerender } = render(<DebitosErro tipo="indisponivel" />)
    rerender(<DebitosErro tipo="indisponivel" />)

    expect(toastError).toHaveBeenCalledTimes(1)
  })

  /**
   * `router.refresh()` e não `location.reload()`: refaz só a árvore do servidor, mantendo a
   * URL e o critério que o cidadão digitou. Recarregar a página inteira funcionaria, mas
   * descartaria o estado de navegação sem ganho nenhum.
   */
  test('"Tentar novamente" refaz a consulta sem perder o número', async () => {
    const user = userEvent.setup()
    render(<DebitosErro tipo="indisponivel" />)

    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }))

    expect(refresh).toHaveBeenCalledTimes(1)
    expect(push).not.toHaveBeenCalled()
  })

  test('oferece saída para outra consulta', () => {
    render(<DebitosErro tipo="indisponivel" />)

    expect(
      screen.getByRole('link', { name: 'Consultar outro número' })
    ).toHaveAttribute('href', '/divida-ativa/parcelamento')
  })
})

describe('DebitosErro — imóvel não cadastrado', () => {
  /**
   * 404 do `GET /imoveis/{inscricao}/divida-ativa`. Aqui tentar de novo **não** resolve, e
   * oferecer "Tentar novamente" seria convidar o cidadão a repetir o que já falhou.
   */
  test('diz o que fazer e não oferece nova tentativa', () => {
    render(<DebitosErro tipo="nao-cadastrado" />)

    expect(
      screen.getByRole('heading', {
        name: 'Este imóvel não está cadastrado no seu CPF',
      })
    ).toBeInTheDocument()

    expect(
      screen.queryByRole('button', { name: 'Tentar novamente' })
    ).not.toBeInTheDocument()

    expect(
      screen.getByRole('link', { name: 'Cadastrar imóvel' })
    ).toHaveAttribute('href', '/divida-ativa/imoveis/novo')
  })

  test('avisa por toast com a mensagem própria deste caso', () => {
    render(<DebitosErro tipo="nao-cadastrado" />)

    expect(toastError).toHaveBeenCalledWith(
      'Este imóvel não está cadastrado no seu CPF.'
    )
  })
})
