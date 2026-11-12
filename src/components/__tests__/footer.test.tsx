import { CARTA_DE_SERVICOS_ROUTE } from '@/constants/carta-de-servicos'
import { render, within } from '@testing-library/react'
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
})
