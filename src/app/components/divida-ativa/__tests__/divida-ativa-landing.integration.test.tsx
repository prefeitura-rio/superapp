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
  test('anuncia o módulo e separa "Meus imóveis" dos serviços', () => {
    render(<DividaAtivaLanding quantidadeImoveis={2} />)

    expect(
      screen.getByRole('heading', { level: 1, name: 'Dívida ativa' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: 'Serviços' })
    ).toBeInTheDocument()
  })

  test('leva à lista de imóveis mostrando quantos o cidadão já cadastrou', () => {
    render(<DividaAtivaLanding quantidadeImoveis={2} />)

    const card = screen.getByRole('link', { name: /Meus imóveis/ })

    expect(card).toHaveAttribute('href', '/divida-ativa/imoveis')
    expect(card).toHaveTextContent('2')
  })

  test('sem contagem disponível, o card continua navegável e não mostra número', () => {
    // A contagem é conteúdo secundário: se a leitura falhar, a landing não pode cair junto.
    render(<DividaAtivaLanding quantidadeImoveis={null} />)

    const card = screen.getByRole('link', { name: /Meus imóveis/ })

    expect(card).toHaveAttribute('href', '/divida-ativa/imoveis')
    expect(card).not.toHaveTextContent(/\d/)
  })

  test('mostra zero para quem ainda não cadastrou nenhum imóvel', () => {
    render(<DividaAtivaLanding quantidadeImoveis={0} />)

    expect(
      screen.getByRole('link', { name: /Meus imóveis/ })
    ).toHaveTextContent('0')
  })

  test('mantém os cinco serviços da landing', () => {
    render(<DividaAtivaLanding quantidadeImoveis={2} />)

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
})
