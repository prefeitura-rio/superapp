import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { BancoCurriculosCard } from '../banco-curriculos-card'

function renderCard(
  props: Partial<Parameters<typeof BancoCurriculosCard>[0]> = {}
) {
  const onAlterar = vi.fn()
  render(
    <BancoCurriculosCard
      curriculoCompleto
      disponivel
      salvando={false}
      onAlterar={onAlterar}
      {...props}
    />
  )
  return { onAlterar, controle: screen.getByRole('switch') }
}

describe('BancoCurriculosCard', () => {
  it('sem o currículo mínimo, o controle fica bloqueado e desligado', () => {
    const { controle } = renderCard({ curriculoCompleto: false })

    expect(controle).toBeDisabled()
    expect(controle).not.toBeChecked()
    expect(
      screen.getByText('Disponível com o currículo atualizado')
    ).toBeInTheDocument()
  })

  it('com o currículo mínimo, o controle fica liberado e mostra a escolha', () => {
    const { controle } = renderCard()

    expect(controle).toBeEnabled()
    expect(controle).toBeChecked()
    expect(
      screen.getByText('Recrutadores podem consultar seu currículo')
    ).toBeInTheDocument()
  })

  it('desativar pede confirmação e só desliga ao confirmar', async () => {
    const user = userEvent.setup()
    const { onAlterar, controle } = renderCard()

    await user.click(controle)

    expect(
      screen.getByRole('dialog', { name: 'Sair do Banco de Currículos?' })
    ).toBeInTheDocument()
    expect(onAlterar).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Desativar' }))

    expect(onAlterar).toHaveBeenCalledWith(false)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('cancelar a confirmação mantém o currículo no banco', async () => {
    const user = userEvent.setup()
    const { onAlterar, controle } = renderCard()

    await user.click(controle)
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(onAlterar).not.toHaveBeenCalled()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('ativar liga direto, sem confirmação', async () => {
    const user = userEvent.setup()
    const { onAlterar, controle } = renderCard({ disponivel: false })

    expect(
      screen.getByText('Recrutadores não podem consultar seu currículo')
    ).toBeInTheDocument()

    await user.click(controle)

    expect(onAlterar).toHaveBeenCalledWith(true)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('enquanto salva, o controle fica bloqueado', () => {
    const { controle } = renderCard({ salvando: true })

    expect(controle).toBeDisabled()
  })
})
