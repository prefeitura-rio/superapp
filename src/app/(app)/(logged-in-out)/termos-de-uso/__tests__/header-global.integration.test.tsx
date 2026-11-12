import { server } from '@/test/mocks/server'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * Integração das duas telas com o Header Global PrefRio de verdade
 * (HeaderWrapperClient → MainHeader → HeaderUserLink), só com a resposta de
 * /api/user/header simulada. Os testes de página trocam o header por um
 * substituto; este confere o que ele mostra.
 */

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
  usePathname: () => '/termos-de-uso',
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND')
  },
}))
vi.mock('@next/third-parties/google', () => ({ sendGAEvent: vi.fn() }))

import TermosDeUsoPlataformaPage from '../[plataforma]/page'
import TermosDeUsoPage from '../page'

const AUTH_BASE =
  'https://auth.example.gov.br/realms/idrio/protocol/openid-connect'

const VISITOR = {
  isLoggedIn: false,
  userName: '',
  userAvatarUrl: null,
  userAvatarName: null,
}
const CITIZEN = {
  isLoggedIn: true,
  userName: 'Maria da Silva',
  userAvatarUrl: '/avatar-maria.png',
  userAvatarName: 'Maria',
}

const SCREENS = [
  {
    name: 'lista',
    render: async () => <TermosDeUsoPage />,
    back: () => screen.getByRole('button', { name: 'Voltar' }),
  },
  {
    name: 'detalhe',
    render: async () =>
      TermosDeUsoPlataformaPage({
        params: Promise.resolve({ plataforma: 'prefrio-site' }),
      }),
    back: () => screen.getByRole('link', { name: 'Voltar para Termos de uso' }),
  },
] as const

function respondHeader(body: object, status = 200) {
  server.use(
    http.get('/api/user/header', () => HttpResponse.json(body, { status }))
  )
}

async function renderScreen(screenToRender: (typeof SCREENS)[number]) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const ui = await screenToRender.render()
  return render(ui, {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })
}

function headerControls(banner: HTMLElement) {
  return [...banner.querySelectorAll('a, button')].map(el => ({
    tag: el.tagName,
    text: (el.textContent ?? '').trim(),
    href: el.getAttribute('href'),
  }))
}

beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_IDENTIDADE_CARIOCA_BASE_URL', AUTH_BASE)
  vi.stubEnv('NEXT_PUBLIC_IDENTIDADE_CARIOCA_CLIENT_ID', 'test-client')
  vi.stubEnv(
    'NEXT_PUBLIC_IDENTIDADE_CARIOCA_REDIRECT_URI',
    'http://localhost:3000/auth/callback'
  )
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe.each(SCREENS)('Termos de uso ($name) com o Header Global', s => {
  it('visitante: logo → home, login → Identidade Carioca e Menu global, sem header próprio', async () => {
    respondHeader(VISITOR)
    await renderScreen(s)

    const login = await screen.findByRole('link', { name: 'Faça seu login' })
    const banners = screen.getAllByRole('banner')
    expect(banners).toHaveLength(1)
    const banner = banners[0]

    expect(
      within(banner).getByRole('link', { name: 'PrefRio – página inicial' })
    ).toHaveAttribute('href', '/')
    expect(login.getAttribute('href')).toMatch(
      new RegExp(`^${AUTH_BASE.replace(/[.]/g, '\\.')}/auth\\?`)
    )
    expect(
      within(banner).getByRole('button', { name: 'Menu' })
    ).toHaveAttribute('aria-haspopup', 'dialog')
    expect(
      screen.queryByRole('navigation', { name: 'Oportunidades Cariocas' })
    ).not.toBeInTheDocument()
  })

  it('cidadão logado: avatar → meu perfil e Menu, sem convite de login', async () => {
    respondHeader(CITIZEN)
    await renderScreen(s)

    const avatar = await screen.findByRole('img', { name: 'Maria' })
    const banner = screen.getByRole('banner')

    expect(avatar.closest('a')).toHaveAttribute('href', '/meu-perfil')
    expect(within(banner).queryByText('Faça seu login')).not.toBeInTheDocument()
    expect(within(banner).getByText('Menu')).toBeInTheDocument()
  })

  it('se /api/user/header falhar, o header cai no estado de visitante', async () => {
    respondHeader({ error: 'falhou' }, 500)
    await renderScreen(s)

    expect(
      await screen.findByRole('link', { name: 'Faça seu login' })
    ).toBeInTheDocument()
  })

  it('o voltar do handoff fica fora do header e depois dele', async () => {
    respondHeader(VISITOR)
    await renderScreen(s)
    await screen.findByRole('link', { name: 'Faça seu login' })

    const banner = screen.getByRole('banner')
    const back = s.back()
    expect(banner).not.toContainElement(back)
    expect(
      banner.compareDocumentPosition(back) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
  })
})

describe('Header Global igual nas duas telas', () => {
  it.each([
    ['visitante', VISITOR, 'Faça seu login'],
    ['cidadão logado', CITIZEN, 'Menu'],
  ])(
    '%s: mesmos controles e destinos na lista e no detalhe',
    async (_state, body, ready) => {
      const controls = []
      for (const s of SCREENS) {
        respondHeader(body)
        const { unmount } = await renderScreen(s)
        await screen.findAllByText(ready)
        if (body.isLoggedIn) await screen.findByRole('img', { name: 'Maria' })
        controls.push(headerControls(screen.getByRole('banner')))
        unmount()
      }

      expect(controls[0].length).toBe(3)
      expect(controls[1]).toEqual(controls[0])
    }
  )
})

/**
 * PREF-653: do menu global a pessoa chega à lista de Termos de uso. O Menu é
 * o mesmo nas duas telas (e em todas as outras), logado ou não.
 */
describe.each(SCREENS)('Menu global na tela $name', s => {
  it.each([
    ['visitante', VISITOR],
    ['cidadão logado', CITIZEN],
  ])(
    '%s: Menu → Outros → Termos de uso leva à lista e fecha o menu',
    async (_state, body) => {
      const user = userEvent.setup()
      respondHeader(body)
      await renderScreen(s)

      await user.click(
        await within(screen.getByRole('banner')).findByRole('button', {
          name: 'Menu',
        })
      )
      const menu = await screen.findByRole('dialog', { name: 'Menu' })
      await user.click(within(menu).getByRole('button', { name: 'Outros' }))

      const termos = within(menu).getByRole('link', { name: 'Termos de uso' })
      expect(termos).toHaveAttribute('href', '/termos-de-uso')
      // Termos e Política de Privacidade são um documento só.
      expect(
        within(menu).queryByRole('link', { name: 'Política de Privacidade' })
      ).not.toBeInTheDocument()

      await user.click(termos)
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    }
  )
})
