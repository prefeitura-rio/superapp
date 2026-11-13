import { CookieConsent } from '@/components/cookie-consent'
import { setGlobalMenuOpen } from '@/hooks/use-global-menu-open'
import { server } from '@/test/mocks/server'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}))

import { GlobalMenuTrigger } from '../global-menu-trigger'

/**
 * O menu global é modal: com ele aberto, o resto da página não recebe
 * cliques. O banner de cookies fica por cima do menu e, visível, pareceria
 * clicável, mas o toque cairia no item do menu que está embaixo (em staging,
 * "Rejeitar" abria Perguntas frequentes). Por isso o banner some enquanto o
 * menu está aberto e volta ao fechar.
 */
function renderPage() {
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <GlobalMenuTrigger />
      <CookieConsent variant="mini" demo />
    </QueryClientProvider>
  )
  return userEvent.setup()
}

const banner = () =>
  screen.getByRole('region', { name: 'Consentimento de cookies', hidden: true })

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
  server.use(
    http.get('/api/user/header', () =>
      HttpResponse.json({
        isLoggedIn: false,
        userName: '',
        userCpf: '',
        userAvatarUrl: null,
        userAvatarName: null,
      })
    )
  )
})

afterEach(() => {
  vi.unstubAllEnvs()
  act(() => setGlobalMenuOpen(false))
})

describe('Menu global × banner de cookies', () => {
  it('o banner aparece com o menu fechado', async () => {
    renderPage()

    expect(
      await screen.findByRole('region', { name: 'Consentimento de cookies' })
    ).not.toHaveClass('hidden')
  })

  it('o banner some enquanto o menu está aberto e volta ao fechar', async () => {
    const user = renderPage()
    await screen.findByRole('region', { name: 'Consentimento de cookies' })

    await user.click(screen.getByRole('button', { name: 'Menu' }))
    const menu = await screen.findByRole('dialog', { name: 'Menu' })
    expect(banner()).toHaveClass('hidden')

    await user.click(within(menu).getByRole('button', { name: 'Fechar menu' }))
    expect(banner()).not.toHaveClass('hidden')
    expect(
      within(banner()).getAllByRole('button', { name: /Rejeitar/ }).length
    ).toBeGreaterThan(0)
  })

  it('se o header sai da tela com o menu aberto, o banner volta (não fica oculto até recarregar)', async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    const page = (comHeader: boolean) => (
      <QueryClientProvider client={client}>
        {comHeader && <GlobalMenuTrigger />}
        <CookieConsent variant="mini" demo />
      </QueryClientProvider>
    )
    const { rerender } = render(page(true))
    const user = userEvent.setup()
    await screen.findByRole('region', { name: 'Consentimento de cookies' })

    await user.click(screen.getByRole('button', { name: 'Menu' }))
    await screen.findByRole('dialog', { name: 'Menu' })
    expect(banner()).toHaveClass('hidden')

    // Ex.: navegação para uma tela sem o Header Global, com o menu aberto.
    rerender(page(false))

    expect(
      screen.queryByRole('dialog', { name: 'Menu', hidden: true })
    ).not.toBeInTheDocument()
    expect(banner()).not.toHaveClass('hidden')
  })

  it('o banner mantém o estado: recusado com o menu fechado, não volta ao abrir e fechar o menu', async () => {
    const user = renderPage()
    const region = await screen.findByRole('region', {
      name: 'Consentimento de cookies',
    })

    await user.click(
      within(region).getAllByRole('button', { name: /Rejeitar/ })[0]
    )
    await user.click(screen.getByRole('button', { name: 'Menu' }))
    const menu = await screen.findByRole('dialog', { name: 'Menu' })
    await user.click(within(menu).getByRole('button', { name: 'Fechar menu' }))

    // Recusado, o banner sai de cena (opacity-0) e é desmontado depois da
    // animação; abrir e fechar o menu não o traz de volta.
    const depois = screen.queryByRole('region', {
      name: 'Consentimento de cookies',
      hidden: true,
    })
    expect(depois === null || depois.classList.contains('opacity-0')).toBe(true)
  })
})
