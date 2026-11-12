import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import HeaderUserLink from '../header-user-link'

vi.mock('@next/third-parties/google', () => ({ sendGAEvent: vi.fn() }))

/**
 * Perfil e Menu do Header Global seguem o estado do handoff: default `bg-card`,
 * focused `bg-secondary` no hover (desktop) e enquanto pressionado (toque).
 */
const STATES = ['bg-card', 'hover:bg-secondary', 'active:bg-secondary']

beforeEach(() => {
  vi.stubEnv(
    'NEXT_PUBLIC_IDENTIDADE_CARIOCA_BASE_URL',
    'https://auth.example.gov.br/realms/idrio/protocol/openid-connect'
  )
  vi.stubEnv('NEXT_PUBLIC_IDENTIDADE_CARIOCA_CLIENT_ID', 'test-client')
  vi.stubEnv(
    'NEXT_PUBLIC_IDENTIDADE_CARIOCA_REDIRECT_URI',
    'http://localhost:3000/auth/callback'
  )
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('HeaderUserLink — estados default/focused', () => {
  it('visitante: o círculo do Perfil e o Menu têm hover e toque', () => {
    render(<HeaderUserLink userName="" isLoggedIn={false} />)

    const profileCircle = screen
      .getByRole('link', { name: 'Faça seu login' })
      .querySelector('div')
    expect(profileCircle).toHaveClass(...STATES)
    expect(screen.getByRole('button', { name: 'Menu' })).toHaveClass(...STATES)
  })

  it('logado: o Perfil e o Menu também têm hover e toque', () => {
    render(
      <HeaderUserLink
        userName="Maria"
        isLoggedIn
        userAvatarUrl="/avatar-maria.png"
        userAvatarName="Maria"
      />
    )

    const profileCircle = screen.getByRole('img', {
      name: 'Maria',
    }).parentElement
    expect(profileCircle).toHaveClass(...STATES)
    expect(screen.getByRole('button', { name: 'Menu' })).toHaveClass(...STATES)
  })
})

describe('HeaderUserLink — Menu global', () => {
  it.each([
    ['visitante', false],
    ['logado', true],
  ])('%s: o Menu é o botão que abre o menu global (diálogo)', (_, logado) => {
    render(<HeaderUserLink userName="Maria" isLoggedIn={logado} />)

    const menu = screen.getByRole('button', { name: 'Menu' })
    expect(menu).toHaveAttribute('aria-haspopup', 'dialog')
    expect(menu).toHaveAttribute('aria-expanded', 'false')
    // Não leva mais a menus por módulo nem ao login.
    expect(screen.queryByRole('link', { name: 'Menu' })).not.toBeInTheDocument()
  })
})
