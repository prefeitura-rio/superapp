import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test, vi } from 'vitest'

import { DividaAtivaServiceList } from '../divida-ativa-service-list'

vi.mock('@/constants/divida-ativa-links', () => ({
  DIVIDA_ATIVA_EXTERNAL_LINKS: {
    GUIA_A_VISTA: 'https://exemplo.rio/guia-a-vista',
    GUIA_PARCELA_EM_ATRASO: 'https://exemplo.rio/parcela-em-atraso',
    SEGUNDA_VIA_GUIA: 'https://exemplo.rio/segunda-via',
  },
}))

describe('DividaAtivaServiceList', () => {
  test('lista os cinco serviços do desenho', () => {
    render(<DividaAtivaServiceList />)

    expect(
      screen.getByRole('button', {
        name: 'Emitir guia à vista ou liquidar débitos',
      })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: 'Emitir guia – parcela em atraso (regularização)',
      })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: 'Emitir segunda via de guia de pagamento',
      })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Parcelar débitos' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', {
        name: 'Acompanhar requerimento de parcelamento',
      })
    ).toBeInTheDocument()
  })

  test('os serviços reconstruídos aqui navegam por link interno', () => {
    render(<DividaAtivaServiceList />)

    expect(
      screen.getByRole('link', { name: 'Parcelar débitos' })
    ).toHaveAttribute('href', '/divida-ativa/parcelamento')
    expect(
      screen.getByRole('link', {
        name: 'Acompanhar requerimento de parcelamento',
      })
    ).toHaveAttribute('href', '/divida-ativa/acompanhamento')
  })

  test('serviço externo pede confirmação antes de sair do app', async () => {
    const user = userEvent.setup()
    render(<DividaAtivaServiceList />)

    // Nada de bottom sheet antes da interação
    expect(
      screen.queryByText('Vamos lhe redirecionar para um link externo')
    ).not.toBeInTheDocument()

    await user.click(
      screen.getByRole('button', {
        name: 'Emitir segunda via de guia de pagamento',
      })
    )

    expect(
      await screen.findByText('Vamos lhe redirecionar para um link externo')
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'Este recurso está disponível em outra página oficial da Prefeitura do Rio de Janeiro'
      )
    ).toBeInTheDocument()
  })

  test('confirmar abre a página oficial do serviço em nova aba', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
    const user = userEvent.setup()

    render(<DividaAtivaServiceList />)

    await user.click(
      screen.getByRole('button', {
        name: 'Emitir guia à vista ou liquidar débitos',
      })
    )
    await user.click(await screen.findByRole('button', { name: 'Confirmar' }))

    expect(openSpy).toHaveBeenCalledWith(
      'https://exemplo.rio/guia-a-vista',
      '_blank',
      'noopener,noreferrer'
    )

    openSpy.mockRestore()
  })
})
