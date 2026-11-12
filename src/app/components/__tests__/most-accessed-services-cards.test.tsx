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

  it('mostra só o título quando o destaque não tem ícone de tema', () => {
    const { container } = render(
      <MostAccessedServiceCards
        services={[
          {
            id: 'iptu-2026',
            href: '/servicos/categoria/tributos/iptu-2026',
            title: 'IPTU 2026',
            description: 'Tributos',
          },
          {
            id: 'outro',
            href: '/servicos/categoria/tributos/outro',
            icon: 'https://example.com/tributos.png',
            title: 'Outro serviço',
            description: 'Tributos',
          },
        ]}
      />
    )

    expect(
      screen.getByRole('heading', { level: 3, name: 'IPTU 2026' })
    ).toHaveClass('line-clamp-3')
    expect(screen.getByRole('link', { name: 'IPTU 2026' })).toHaveAttribute(
      'href',
      '/servicos/categoria/tributos/iptu-2026'
    )
    expect(container.querySelectorAll('img')).toHaveLength(1)
    expect(
      within(screen.getByRole('link', { name: 'IPTU 2026' })).queryByRole('img')
    ).toBeNull()
  })

  it('corta a lista injetada no mesmo limite da página de serviços', () => {
    render(
      <MostAccessedServiceCards
        limit={4}
        services={Array.from({ length: 6 }, (_, index) => ({
          id: `servico-${index}`,
          href: `/servicos/categoria/tributos/servico-${index}`,
          title: `Serviço ${index}`,
          description: 'Tributos',
        }))}
      />
    )

    expect(screen.getAllByRole('link')).toHaveLength(4)
  })
})
