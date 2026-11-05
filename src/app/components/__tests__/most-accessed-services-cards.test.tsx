import { MOST_ACCESSED_SERVICES } from '@/constants/most-accessed-services'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import MostAccessedServiceCards from '../most-accessed-services-cards'

describe('MostAccessedServiceCards', () => {
  it('trata o ícone de cada card como decorativo (alt vazio), sem repetir o título visível', () => {
    const { container } = render(<MostAccessedServiceCards />)

    const images = container.querySelectorAll('img')
    expect(images).toHaveLength(MOST_ACCESSED_SERVICES.length)
    for (const image of images) {
      expect(image).toHaveAttribute('alt', '')
    }
  })

  it('nomeia cada link só pelo título visível, sem anunciá-lo duas vezes', () => {
    render(<MostAccessedServiceCards limit={4} />)

    const services = MOST_ACCESSED_SERVICES.slice(0, 4)
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(services.length)

    services.forEach((service, index) => {
      const link = links[index]
      expect(link).toHaveAccessibleName(service.title)
      expect(
        within(link).getByRole('heading', { level: 3, name: service.title })
      ).toBeInTheDocument()
      expect(within(link).queryByRole('img')).toBeNull()
    })
  })
})
