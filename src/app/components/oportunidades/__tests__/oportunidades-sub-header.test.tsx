import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { OportunidadesSubHeader } from '../oportunidades-sub-header'

vi.mock('@/app/components/main-header', () => ({ default: () => null }))
vi.mock('@/providers/auth-header-provider', () => ({
  useAuthHeader: () => ({ data: { isLoggedIn: false }, isLoading: false }),
}))
vi.mock('next/navigation', () => ({
  usePathname: () => '/servicos/trabalho',
}))

describe('OportunidadesSubHeader', () => {
  it('mostra a lupa ao lado do logo quando recebe a busca', () => {
    render(
      <OportunidadesSubHeader
        menuHref="/servicos/trabalho/menu"
        logoHref="/servicos/trabalho"
        searchButtonUrl="/busca?tipo=empregos"
      />
    )

    expect(
      screen.getByRole('link', { name: 'Buscar oportunidades' })
    ).toHaveAttribute('href', '/busca?tipo=empregos')
  })

  it('sem a busca, não mostra a lupa', () => {
    render(
      <OportunidadesSubHeader
        menuHref="/servicos/trabalho/menu"
        logoHref="/servicos/trabalho"
      />
    )

    expect(
      screen.queryByRole('link', { name: 'Buscar oportunidades' })
    ).not.toBeInTheDocument()
  })
})
