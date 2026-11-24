import {
  type ServerFeatureFlags,
  ServerFeatureFlagsProvider,
} from '@/providers/server-feature-flags-provider'
import { restoreBrowser, stubBrowser } from '@/test/browser-brands'
import { server } from '@/test/mocks/server'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
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

/**
 * A flag do Salesforce chega como no app: lida no servidor e entregue pelo
 * provider do root layout. Salesforce ligado por padrão.
 */
async function openMenu(
  flags: ServerFeatureFlags = { salesforce: true, sgrcHistorico: false }
) {
  const user = userEvent.setup()
  render(
    <ServerFeatureFlagsProvider flags={flags}>
      <QueryClientProvider
        client={
          new QueryClient({ defaultOptions: { queries: { retry: false } } })
        }
      >
        <GlobalMenuTrigger />
      </QueryClientProvider>
    </ServerFeatureFlagsProvider>
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
  // No navegador `FEATURE_SALESFORCE` (só de servidor) não existe. O menu tem
  // de ler a flag do provider, nunca do process.env.
  vi.stubEnv('FEATURE_SALESFORCE', '')
  assign.mockReset()
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: { ...originalLocation, assign },
  })
})

afterEach(() => {
  vi.unstubAllEnvs()
  restoreBrowser()
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

  it('logado no Google Chrome: nome, CPF e Sair, que encerra a sessão e faz o logout do Gov.br num iframe oculto', async () => {
    vi.stubEnv('NEXT_PUBLIC_GOVBR_BASE_URL', 'https://sso.example.gov.br/')
    vi.stubEnv('NEXT_PUBLIC_HOME_URL', 'https://app.example.rio/')
    stubBrowser('chrome')
    let logoutCalls = 0
    server.use(
      http.get('/api/auth/logout', () => {
        logoutCalls++
        return new HttpResponse(null, { status: 204 })
      })
    )
    respondHeader(CITIZEN)
    const { user, menu } = await openMenu()

    expect(await within(menu).findByText('Maria da Silva')).toBeInTheDocument()
    expect(within(menu).getByText('123.456.789-09')).toBeInTheDocument()

    await user.click(within(menu).getByRole('button', { name: 'Sair' }))
    expect(
      within(menu).getByRole('button', { name: 'Saindo...' })
    ).toBeDisabled()

    const iframe = await waitFor(() => {
      const found = document.querySelector<HTMLIFrameElement>(
        'iframe[src^="https://sso.example.gov.br/logout?"]'
      )
      expect(found).not.toBeNull()
      return found as HTMLIFrameElement
    })
    expect(logoutCalls).toBe(1)

    fireEvent.load(iframe)
    await waitFor(() =>
      expect(assign).toHaveBeenCalledWith('/api/auth/sso-logout')
    )
  })

  it('logado fora do Google Chrome: Sair encerra a sessão e vai para o logout do Gov.br por navegação de topo, sem iframe', async () => {
    vi.stubEnv('NEXT_PUBLIC_GOVBR_BASE_URL', 'https://sso.example.gov.br/')
    vi.stubEnv('NEXT_PUBLIC_HOME_URL', 'https://app.example.rio/')
    let logoutCalls = 0
    server.use(
      http.get('/api/auth/logout', () => {
        logoutCalls++
        return new HttpResponse(null, { status: 204 })
      })
    )
    respondHeader(CITIZEN)
    const { user, menu } = await openMenu()
    await within(menu).findByText('Maria da Silva')

    await user.click(within(menu).getByRole('button', { name: 'Sair' }))

    await waitFor(() =>
      expect(assign).toHaveBeenCalledWith('/api/auth/sso-logout/govbr')
    )
    expect(logoutCalls).toBe(1)
    expect(document.querySelector('iframe')).toBeNull()
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

  it('ícones do Lucide seguem o traço 1.4 do design system, não o 2 padrão', async () => {
    respondHeader(CITIZEN)
    const { menu } = await openMenu({ salesforce: true, sgrcHistorico: false })
    await within(menu).findByText('Maria da Silva')

    const rows = [
      within(menu).getByRole('button', { name: 'Oportunidades Cariocas' }),
      within(menu).getByRole('link', {
        name: 'Termos de uso e política de privacidade',
      }),
      within(menu).getByRole('link', { name: 'Carta de serviços' }),
    ]
    for (const row of rows) {
      // O primeiro svg da linha é o ícone; o chevron da seção vem depois.
      expect(row.querySelector('svg')).toHaveAttribute('stroke-width', '1.4')
    }
  })

  it.each([
    ['visitante', VISITOR],
    ['cidadão logado', CITIZEN],
  ])(
    '%s: com Salesforce ligado no servidor mostra Atendimentos, Termos de uso e Carta de serviços',
    async (_state, body) => {
      respondHeader(body)
      const { menu } = await openMenu({
        salesforce: true,
        sgrcHistorico: false,
      })
      if (body.isLoggedIn) await within(menu).findByText('Maria da Silva')

      expect(
        within(menu).getByRole('button', { name: 'Atendimentos' })
      ).toBeInTheDocument()
      expect(
        within(menu).getByRole('link', {
          name: 'Termos de uso e política de privacidade',
        })
      ).toHaveAttribute('href', '/termos-de-uso')
      expect(
        within(menu).getByRole('link', { name: 'Carta de serviços' })
      ).toHaveAttribute('href', '/carta-de-servicos')
    }
  )

  it.each([
    ['visitante', VISITOR],
    ['cidadão logado', CITIZEN],
  ])(
    '%s: com Salesforce desligado no servidor esconde os três itens',
    async (_state, body) => {
      // Mesmo que o env do bundle diga o contrário, vale o que o servidor mandou.
      vi.stubEnv('FEATURE_SALESFORCE', 'true')
      respondHeader(body)
      const { menu } = await openMenu({
        salesforce: false,
        sgrcHistorico: false,
      })
      if (body.isLoggedIn) await within(menu).findByText('Maria da Silva')

      expect(
        within(menu).queryByRole('button', { name: 'Atendimentos' })
      ).not.toBeInTheDocument()
      expect(
        within(menu).queryByRole('link', {
          name: 'Termos de uso e política de privacidade',
        })
      ).not.toBeInTheDocument()
      expect(
        within(menu).queryByRole('link', { name: 'Carta de serviços' })
      ).not.toBeInTheDocument()
      expect(
        within(menu).getByRole('link', { name: 'Perguntas frequentes' })
      ).toBeInTheDocument()
    }
  )

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

  it('o plugin de acessibilidade recebe o clique e o menu continua aberto', async () => {
    respondHeader(VISITOR)
    const onWidgetClick = vi.fn()
    const wrapper = document.createElement('div')
    wrapper.id = 'a11y-btn-wrapper'
    // O CSS global faz o mesmo: interrompe o pointer-events: none herdado do body.
    wrapper.style.pointerEvents = 'auto'
    const button = document.createElement('button')
    button.type = 'button'
    button.textContent = 'Recursos assistivos'
    button.addEventListener('click', onWidgetClick)
    wrapper.append(button)
    document.body.append(wrapper)

    try {
      const { user } = await openMenu()
      await user.click(button)
      expect(onWidgetClick).toHaveBeenCalledOnce()
      expect(screen.getByRole('dialog', { name: 'Menu' })).toBeInTheDocument()
    } finally {
      wrapper.remove()
    }
  })
})
