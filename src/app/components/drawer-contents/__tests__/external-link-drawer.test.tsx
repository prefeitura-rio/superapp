import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test, vi } from 'vitest'

import { ExternalLinkDrawer } from '../external-link-drawer'

describe('ExternalLinkDrawer', () => {
  test('confirmar abre o link externo sem entregar window.opener ao destino', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
    const onOpenChange = vi.fn()
    const user = userEvent.setup()

    render(
      <ExternalLinkDrawer
        open
        onOpenChange={onOpenChange}
        externalUrl="https://exemplo.rio/servico"
      />
    )

    await user.click(await screen.findByRole('button', { name: 'Confirmar' }))

    expect(openSpy).toHaveBeenCalledWith(
      'https://exemplo.rio/servico',
      '_blank',
      'noopener,noreferrer'
    )
    expect(onOpenChange).toHaveBeenCalledWith(false)

    openSpy.mockRestore()
  })

  test('URL vazia apenas fecha o drawer', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
    const onOpenChange = vi.fn()
    const user = userEvent.setup()

    render(
      <ExternalLinkDrawer open onOpenChange={onOpenChange} externalUrl="" />
    )

    await user.click(await screen.findByRole('button', { name: 'Confirmar' }))

    expect(openSpy).not.toHaveBeenCalled()
    expect(onOpenChange).toHaveBeenCalledWith(false)

    openSpy.mockRestore()
  })

  test('a copy contextual é o nome e a descrição acessíveis do diálogo', async () => {
    render(
      <ExternalLinkDrawer
        open
        onOpenChange={vi.fn()}
        externalUrl="https://exemplo.rio/servico"
        title="Vamos lhe redirecionar para um link externo"
        description="Este recurso está disponível em outra página oficial da Prefeitura do Rio de Janeiro"
      />
    )

    const dialog = await screen.findByRole('dialog')

    expect(dialog).toHaveAccessibleName(
      'Vamos lhe redirecionar para um link externo'
    )
    expect(dialog).toHaveAccessibleDescription(
      'Este recurso está disponível em outra página oficial da Prefeitura do Rio de Janeiro'
    )
  })
})
