import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import MainHeader from '../main-header'

vi.mock('../header-user-link', () => ({ default: () => null }))

describe('MainHeader', () => {
  it('o link do logo para a Home tem nome acessível', () => {
    render(<MainHeader userName="" isLoggedIn={false} logoHref="/" />)

    expect(
      screen.getByRole('link', { name: 'PrefRio – página inicial' })
    ).toHaveAttribute('href', '/')
  })

  it('o link do logo para outro destino se identifica como PrefRio', () => {
    render(
      <MainHeader userName="" isLoggedIn={false} logoHref="/servicos/cursos" />
    )

    expect(screen.getByRole('link', { name: 'PrefRio' })).toHaveAttribute(
      'href',
      '/servicos/cursos'
    )
  })

  it('o SVG do logo fica fora da árvore de acessibilidade', () => {
    const { container } = render(
      <MainHeader userName="" isLoggedIn={false} logoHref="/" />
    )

    expect(container.querySelector('header a svg')).toHaveAttribute(
      'aria-hidden',
      'true'
    )
  })

  it('o link da lupa tem nome acessível', () => {
    render(
      <MainHeader
        userName=""
        isLoggedIn={false}
        logoHref="/"
        showSearchIcon
        searchUrl="/busca?tipo=cursos"
      />
    )

    expect(screen.getByRole('link', { name: 'Buscar' })).toHaveAttribute(
      'href',
      '/busca?tipo=cursos'
    )
  })

  it('sem logoHref, o logo não é link', () => {
    render(<MainHeader userName="" isLoggedIn={false} />)

    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})
