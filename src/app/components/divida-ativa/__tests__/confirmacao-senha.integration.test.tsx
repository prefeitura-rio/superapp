import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { ConfirmacaoSenhaForm, TEXTO_DECLARACAO } from '../confirmacao-senha'

const validarSenha = vi.fn()

vi.mock('@/actions/divida-ativa/validar-senha', () => ({
  validarSenha: (senha: string) => validarSenha(senha),
}))

// O Checkbox do Radix mede o próprio tamanho; o jsdom não tem ResizeObserver.
vi.stubGlobal(
  'ResizeObserver',
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
)

const onConfirmar = vi.fn()

function renderizar(provedorLogin: 'govbr' | null = null) {
  return render(
    <ConfirmacaoSenhaForm
      nome="Maria da Silva"
      cpf="52998224725"
      provedorLogin={provedorLogin}
      urlContaIdentidade="https://auth.exemplo/realms/idrio_cidadao/account"
      onConfirmar={onConfirmar}
    />
  )
}

async function preencher(senha = 'minha-senha') {
  const user = userEvent.setup()
  await user.click(screen.getByRole('checkbox'))
  await user.type(
    screen.getByLabelText(/Senha da conta Identidade Carioca/),
    senha
  )
  await user.click(screen.getByRole('button', { name: 'Assinar e enviar' }))
}

beforeEach(() => {
  validarSenha.mockReset()
  onConfirmar.mockReset()
})

describe('ConfirmacaoSenhaForm', () => {
  test('mostra a declaração do portal e quem está assinando', () => {
    renderizar()

    expect(screen.getByText(TEXTO_DECLARACAO)).toBeInTheDocument()
    expect(
      screen.getByText('Maria da Silva · CPF 529.982.247-25')
    ).toBeInTheDocument()
  })

  test('sem a declaração marcada, não envia', async () => {
    const user = userEvent.setup()
    renderizar()

    await user.type(
      screen.getByLabelText(/Senha da conta Identidade Carioca/),
      'minha-senha'
    )

    expect(
      screen.getByRole('button', { name: 'Assinar e enviar' })
    ).toBeDisabled()
  })

  test('senha recusada mostra a mensagem, limpa o campo e não envia', async () => {
    validarSenha.mockResolvedValue({
      success: true,
      data: { valida: false, mensagem: 'Senha inválida.' },
    })
    renderizar()

    await preencher('errada')

    expect(await screen.findByText('Senha inválida.')).toBeInTheDocument()
    expect(
      screen.getByLabelText(/Senha da conta Identidade Carioca/)
    ).toHaveValue('')
    expect(onConfirmar).not.toHaveBeenCalled()
  })

  test('senha válida segue para o envio com a senha digitada', async () => {
    validarSenha.mockResolvedValue({
      success: true,
      data: { valida: true, mensagem: null },
    })
    onConfirmar.mockResolvedValue(null)
    renderizar()

    await preencher('certa')

    await waitFor(() => expect(onConfirmar).toHaveBeenCalledWith('certa'))
    expect(validarSenha).toHaveBeenCalledWith('certa')
  })

  test('erro no envio aparece no próprio formulário', async () => {
    validarSenha.mockResolvedValue({
      success: true,
      data: { valida: true, mensagem: null },
    })
    onConfirmar.mockResolvedValue(
      'CDA já possui requerimento de parcelamento em aberto, de nº 123.'
    )
    renderizar()

    await preencher()

    expect(
      await screen.findByText(/já possui requerimento de parcelamento/)
    ).toBeInTheDocument()
  })

  test('quem entrou pelo gov.br é avisado a usar a senha da Identidade Carioca', () => {
    renderizar('govbr')

    expect(screen.getByText(/Você entrou pelo gov.br/)).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Minha conta Identidade Carioca' })
    ).toHaveAttribute(
      'href',
      'https://auth.exemplo/realms/idrio_cidadao/account'
    )
  })

  test('sem saber o tipo de login, a orientação para criar a senha aparece mesmo assim', () => {
    renderizar(null)

    expect(screen.queryByText(/Você entrou pelo gov.br/)).toBeNull()
    expect(screen.getByText(/ainda não tem essa senha/)).toBeInTheDocument()
  })
})
