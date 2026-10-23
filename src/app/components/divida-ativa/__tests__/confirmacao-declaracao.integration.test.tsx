import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import {
  ConfirmacaoDeclaracaoForm,
  TEXTO_DECLARACAO,
} from '../confirmacao-declaracao'

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

function renderizar() {
  return render(
    <ConfirmacaoDeclaracaoForm
      nome="Maria da Silva"
      cpf="52998224725"
      onConfirmar={onConfirmar}
    />
  )
}

async function aceitarEEnviar() {
  const user = userEvent.setup()
  await user.click(screen.getByRole('checkbox'))
  await user.click(screen.getByRole('button', { name: 'Confirmar e enviar' }))
}

beforeEach(() => {
  onConfirmar.mockReset()
})

describe('ConfirmacaoDeclaracaoForm', () => {
  test('mostra a declaração do portal e quem está confirmando', () => {
    renderizar()

    expect(screen.getByText(TEXTO_DECLARACAO)).toBeInTheDocument()
    expect(
      screen.getByText('Maria da Silva · CPF 529.982.247-25')
    ).toBeInTheDocument()
  })

  /** Decisão de 20/10/2026: só a declaração confirma — nenhum campo de senha. */
  test('não pede senha', () => {
    renderizar()

    expect(screen.queryByLabelText(/senha/i)).toBeNull()
  })

  test('sem a declaração marcada, não envia', () => {
    renderizar()

    expect(
      screen.getByRole('button', { name: 'Confirmar e enviar' })
    ).toBeDisabled()
    expect(onConfirmar).not.toHaveBeenCalled()
  })

  test('com a declaração marcada, envia', async () => {
    onConfirmar.mockResolvedValue(null)
    renderizar()

    await aceitarEEnviar()

    await waitFor(() => expect(onConfirmar).toHaveBeenCalledTimes(1))
  })

  test('erro no envio aparece no próprio formulário', async () => {
    onConfirmar.mockResolvedValue(
      'CDA já possui requerimento de parcelamento em aberto, de nº 123.'
    )
    renderizar()

    await aceitarEEnviar()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /já possui requerimento de parcelamento/
    )
  })
})
