import { render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { DividaAtivaLanding } from '../divida-ativa-landing'

vi.mock('@/constants/divida-ativa-links', () => ({
  DIVIDA_ATIVA_EXTERNAL_LINKS: {
    GUIA_A_VISTA: 'https://exemplo.rio/guia-a-vista',
    GUIA_PARCELA_EM_ATRASO: 'https://exemplo.rio/parcela-em-atraso',
    SEGUNDA_VIA_GUIA: 'https://exemplo.rio/segunda-via',
  },
}))

describe('DividaAtivaLanding', () => {
  test('anuncia o módulo e a lista de serviços', () => {
    render(<DividaAtivaLanding />)

    expect(
      screen.getByRole('heading', { level: 1, name: 'Dívida ativa' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: 'Serviços' })
    ).toBeInTheDocument()
  })

  test('mostra os cinco serviços da landing', () => {
    render(<DividaAtivaLanding />)

    expect(
      screen.getByRole('button', {
        name: 'Emitir guia à vista ou liquidar débitos',
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

  test('não oferece Meus Imóveis nesta entrega', () => {
    render(<DividaAtivaLanding />)

    expect(
      screen.queryByRole('link', { name: /Meus imóveis/ })
    ).not.toBeInTheDocument()
  })
})
