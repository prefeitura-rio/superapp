import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { BottomSheet } from '../bottom-sheet'

function Pagina() {
  const [open, setOpen] = useState(false)

  return (
    <main>
      <button type="button" onClick={() => setOpen(true)}>
        Selecionar a área de atuação
      </button>
      <button type="button">Atenção a detalhes</button>
      <button type="button">Colaboração</button>
      <BottomSheet open={open} onOpenChange={setOpen} title="Área de atuação">
        <input aria-label="Buscar área" />
        <button type="button">Administração</button>
        <button type="button">Tecnologia</button>
      </BottomSheet>
    </main>
  )
}

async function abrirBottomSheet() {
  const user = userEvent.setup()
  render(<Pagina />)

  await user.click(
    screen.getByRole('button', { name: 'Selecionar a área de atuação' })
  )
  const dialog = await screen.findByRole('dialog')

  return { user, dialog }
}

describe('BottomSheet (Drawer) — diálogo modal', () => {
  it('marca o diálogo aberto como modal', async () => {
    const { dialog } = await abrirBottomSheet()

    expect(dialog).toHaveAttribute('aria-modal', 'true')
  })

  it('não move o foco inicial para o campo de busca', async () => {
    const { dialog } = await abrirBottomSheet()

    await waitFor(() => expect(document.activeElement).toBe(dialog))
  })

  it('mantém o foco dentro do diálogo com Tab', async () => {
    const { user, dialog } = await abrirBottomSheet()

    for (let i = 0; i < 6; i++) {
      await user.tab()
      expect(dialog.contains(document.activeElement)).toBe(true)
    }
    expect(
      screen.getByRole('button', { name: 'Atenção a detalhes', hidden: true })
    ).not.toHaveFocus()
  })

  it('mantém o foco dentro do diálogo com Shift+Tab', async () => {
    const { user, dialog } = await abrirBottomSheet()

    for (let i = 0; i < 6; i++) {
      await user.tab({ shift: true })
      expect(dialog.contains(document.activeElement)).toBe(true)
    }
  })

  it('percorre os elementos do diálogo em ciclo', async () => {
    const { user } = await abrirBottomSheet()

    await user.tab()
    expect(screen.getByRole('textbox', { name: 'Buscar área' })).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('button', { name: 'Administração' })).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('button', { name: 'Tecnologia' })).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('textbox', { name: 'Buscar área' })).toHaveFocus()
  })
})
