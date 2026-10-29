import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { BannerBase } from '../banner-base'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

const headingSelector = 'h1, h2, h3, h4, h5, h6, [role="heading"]'

describe('BannerBase', () => {
  it('mostra o título sem criar heading na página', () => {
    const { container } = render(
      <BannerBase title="Fique em dia!" subtitle="Saiba mais" color="#000" />
    )

    expect(screen.getByText('Fique em dia!')).toBeInTheDocument()
    expect(screen.getByText('Saiba mais')).toBeInTheDocument()
    expect(container.querySelectorAll(headingSelector)).toHaveLength(0)
  })

  it('não renderiza elemento de título vazio', () => {
    const { container } = render(
      <BannerBase
        title=""
        color="#000"
        logo={<span>Encontre seu trabalho</span>}
      />
    )

    expect(screen.getByText('Encontre seu trabalho')).toBeInTheDocument()
    expect(container.querySelectorAll(headingSelector)).toHaveLength(0)
    expect(container.querySelectorAll('p')).toHaveLength(0)
  })
})
