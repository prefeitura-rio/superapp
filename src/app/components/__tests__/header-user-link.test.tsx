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
    expect(screen.getByRole('link', { name: 'Menu' })).toHaveClass(...STATES)
  })

  it('logado: o Perfil e o botão de Menu (sem destino) também têm hover e toque', () => {
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

  it('logado com menuHref: o Menu vira link e mantém os estados', () => {
    render(<HeaderUserLink userName="Maria" isLoggedIn menuHref="/menu" />)

    const menu = screen.getByRole('link', { name: 'Menu' })
    expect(menu).toHaveAttribute('href', '/menu')
    expect(menu).toHaveClass(...STATES)
  })
})
