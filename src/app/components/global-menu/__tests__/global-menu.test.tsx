import { server } from '@/test/mocks/server'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('next/navigation', () => ({
  usePathname: () => '/termos-de-uso/empregos',
}))

import { GlobalMenuTrigger } from '../global-menu-trigger'

const VISITOR = {
  isLoggedIn: false,
  userName: '',
  userCpf: '',
  userAvatarUrl: null,
  userAvatarName: null,
}
const CITIZEN = {
  isLoggedIn: true,
  userName: 'Maria da Silva',
  userCpf: '12345678909',
  userAvatarUrl: null,
  userAvatarName: null,
}

function respondHeader(body: object) {
  server.use(http.get('/api/user/header', () => HttpResponse.json(body)))
}

async function openMenu() {
  const user = userEvent.setup()
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <GlobalMenuTrigger />
    </QueryClientProvider>
  )
  await user.click(screen.getByRole('button', { name: 'Menu' }))
  return { user, menu: await screen.findByRole('dialog', { name: 'Menu' }) }
}

const assign = vi.fn()
const originalLocation = window.location

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
  assign.mockReset()
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: { ...originalLocation, assign },
  })
})

afterEach(() => {
  vi.unstubAllEnvs()
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: originalLocation,
  })
})

describe('GlobalMenu', () => {
  it('o botão Menu abre o menu e o X fecha', async () => {
    respondHeader(VISITOR)
    const { user, menu } = await openMenu()

    // Com o diálogo aberto o resto da página fica oculto para leitores de tela.
    expect(
      screen.getByRole('button', { name: 'Menu', hidden: true })
    ).toHaveAttribute('aria-expanded', 'true')
    await user.click(within(menu).getByRole('button', { name: 'Fechar menu' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('visitante: convite de login volta para a página atual e não há Sair', async () => {
    respondHeader(VISITOR)
    const { menu } = await openMenu()

    const login = within(menu).getByRole('link', { name: 'Faça seu login' })
    const state = new URL(login.getAttribute('href') ?? '').searchParams.get(
      'state'
    )
    expect(decodeURIComponent(state ?? '')).toBe('/termos-de-uso/empregos')
    expect(
      within(menu).queryByRole('button', { name: 'Sair' })
    ).not.toBeInTheDocument()
  })

  it('logado: nome, CPF e Sair, que faz o logout encadeado com o Gov.br', async () => {
    respondHeader(CITIZEN)
    const { user, menu } = await openMenu()

    expect(await within(menu).findByText('Maria da Silva')).toBeInTheDocument()
    expect(within(menu).getByText('123.456.789-09')).toBeInTheDocument()

    await user.click(within(menu).getByRole('button', { name: 'Sair' }))
    expect(assign).toHaveBeenCalledWith('/api/auth/logout?sso=govbr')
    expect(
      within(menu).getByRole('button', { name: 'Saindo...' })
    ).toBeDisabled()
  })

  it('Termos de uso e política de privacidade é item de primeiro nível e leva à lista', async () => {
    respondHeader(VISITOR)
    const { menu } = await openMenu()

    expect(
      within(menu).getByRole('link', {
        name: 'Termos de uso e política de privacidade',
      })
    ).toHaveAttribute('href', '/termos-de-uso')
  })

  it('logado: subitens com o recuo do handoff (36px e 56px) e Tema claro + Sair no fim', async () => {
    respondHeader(CITIZEN)
    const { user, menu } = await openMenu()
    await within(menu).findByText('Maria da Silva')

    await user.click(
      within(menu).getByRole('button', { name: 'Oportunidades Cariocas' })
    )
    expect(within(menu).getByRole('link', { name: 'Ver cursos' })).toHaveClass(
      'pl-9'
    )
    expect(within(menu).getByRole('link', { name: 'Meus cursos' })).toHaveClass(
      'pl-14'
    )
    expect(
      within(menu).getByRole('link', { name: 'Meus certificados' })
    ).toHaveClass('pl-14')

    const rows = within(menu).getAllByRole('link')
    expect(rows.at(-1)).toHaveTextContent('Meu perfil')
    expect(within(menu).getByLabelText('Tema claro')).toBeInTheDocument()
    expect(
      within(menu).getByRole('button', { name: 'Sair' })
    ).toBeInTheDocument()
  })
})
