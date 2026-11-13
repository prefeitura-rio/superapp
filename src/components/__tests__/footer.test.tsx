import { CARTA_DE_SERVICOS_ROUTE } from '@/constants/carta-de-servicos'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Footer } from '../footer'

describe('Footer', () => {
  it('tem "Carta de serviços" como 3º item do Menu, no mobile e no desktop', () => {
    const { container } = render(<Footer />)
    const menus = [...container.querySelectorAll('p')]
      .filter(p => p.textContent === 'Menu')
      .map(p => p.nextElementSibling as HTMLElement)

    expect(menus).toHaveLength(2)
    for (const menu of menus) {
      const links = within(menu).getAllByRole('link')
      expect(links.map(link => link.textContent)).toEqual([
        'Página inicial',
        'Serviços',
        'Carta de serviços',
      ])
      expect(links[2].getAttribute('href')).toBe(CARTA_DE_SERVICOS_ROUTE)
    }
  })

  it('tem um só link "Termos de uso e Política de Privacidade" para a lista de Termos de uso', () => {
    render(<Footer />)

    // Mobile e desktop renderizam a linha do copyright: um link em cada.
    const links = screen.getAllByRole('link', {
      name: 'Termos de uso e Política de Privacidade',
    })
    expect(links).toHaveLength(2)
    for (const link of links) {
      expect(link).toHaveAttribute('href', '/termos-de-uso')
      expect(link).toHaveClass('text-foreground-light', 'hover:underline')
    }
  })

  it('não sobra item separado de "Termos de uso" nem de "Política de Privacidade"', () => {
    render(<Footer />)

    expect(screen.queryByText('Termos de uso', { exact: true })).toBeNull()
    expect(
      screen.queryByText('Política de Privacidade', { exact: true })
    ).toBeNull()
    expect(screen.getAllByText(/©2026 PrefRio/)).toHaveLength(2)
  })
})
