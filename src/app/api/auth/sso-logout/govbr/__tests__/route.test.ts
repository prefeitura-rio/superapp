import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { GET } from '../route'

const KEYCLOAK_BASE =
  'https://auth.example.gov.br/realms/idrio/protocol/openid-connect'
const KEYCLOAK_REDIRECT_URI = 'https://app.example.rio/api/auth/callback'
const HOME_URL = 'https://app.example.rio/'
const GOVBR_BASE = 'https://sso.example.gov.br/'
const GOVBR_LOGOUT_URL = `${GOVBR_BASE}logout?post_logout_redirect_uri=${encodeURIComponent(
  `${KEYCLOAK_BASE}/auth?client_id=test-client&redirect_uri=${KEYCLOAK_REDIRECT_URI}&response_type=code`
)}`

function ssoLogoutGovbrRequest(
  query = '',
  cookies: Record<string, string> = {},
  extraHeaders: Record<string, string> = {}
): NextRequest {
  const cookieHeader = Object.entries(cookies)
    .map(([name, value]) => `${name}=${value}`)
    .join('; ')
  return new NextRequest(
    new URL(`/api/auth/sso-logout/govbr${query}`, 'http://localhost:3000'),
    {
      headers: {
        ...(cookieHeader ? { cookie: cookieHeader } : {}),
        ...extraHeaders,
      },
    }
  )
}

function expectCookiesCleared(response: Response) {
  const setCookie = response.headers.getSetCookie()
  for (const name of ['access_token', 'refresh_token']) {
    const cookie = setCookie.find(c => c.startsWith(`${name}=`))
    expect(cookie, `${name} deve ser apagado`).toBeDefined()
    expect(cookie).toMatch(new RegExp(`^${name}=;`))
    expect(cookie).toContain('Max-Age=0')
    expect(cookie).toContain('Path=/')
    expect(cookie).toContain('HttpOnly')
    expect(cookie?.toLowerCase()).toContain('samesite=lax')
  }
}

/** O 303 vai ao logout do Keycloak, que segue para `destination`. */
function expectKeycloakLogoutTo(response: Response, destination: string) {
  expect(response.status).toBe(303)
  const location = new URL(response.headers.get('location') ?? '')
  expect(`${location.origin}${location.pathname}`).toBe(
    `${KEYCLOAK_BASE}/logout`
  )
  expect(location.searchParams.get('client_id')).toBe('test-client')
  expect(location.searchParams.get('post_logout_redirect_uri')).toBe(
    destination
  )
}

const sessionCookies = {
  access_token: 'access-sintetico',
  refresh_token: 'refresh-sintetico',
}

describe('GET /api/auth/sso-logout/govbr', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_IDENTIDADE_CARIOCA_BASE_URL', KEYCLOAK_BASE)
    vi.stubEnv('NEXT_PUBLIC_IDENTIDADE_CARIOCA_CLIENT_ID', 'test-client')
    vi.stubEnv(
      'NEXT_PUBLIC_IDENTIDADE_CARIOCA_REDIRECT_URI',
      KEYCLOAK_REDIRECT_URI
    )
    vi.stubEnv('IDENTIDADE_CARIOCA_CLIENT_SECRET', 'segredo-de-teste')
    vi.stubEnv('NEXT_PUBLIC_HOME_URL', HOME_URL)
    vi.stubEnv('NEXT_PUBLIC_GOVBR_BASE_URL', GOVBR_BASE)
    fetchMock.mockReset()
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetchMock)
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('revoga o refresh token, apaga os cookies e vai ao logout do Keycloak, que segue para o logout do Gov.br', async () => {
    const response = await GET(ssoLogoutGovbrRequest('', sessionCookies))

    expectKeycloakLogoutTo(response, GOVBR_LOGOUT_URL)
    expect(response.headers.get('cache-control')).toBe('no-store')
    expectCookiesCleared(response)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe(`${KEYCLOAK_BASE}/logout`)
    expect(init.method).toBe('POST')
    expect(new URLSearchParams(init.body).get('refresh_token')).toBe(
      'refresh-sintetico'
    )
  })

  it('sem refresh_token, ainda passa pelo logout do Keycloak antes do Gov.br', async () => {
    const response = await GET(
      ssoLogoutGovbrRequest('', { access_token: 'access-sintetico' })
    )

    expectKeycloakLogoutTo(response, GOVBR_LOGOUT_URL)
    expectCookiesCleared(response)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('sem NEXT_PUBLIC_HOME_URL, ainda passa pelo Keycloak e segue para o Gov.br', async () => {
    vi.stubEnv('NEXT_PUBLIC_HOME_URL', '')

    const response = await GET(ssoLogoutGovbrRequest('', sessionCookies))

    expectKeycloakLogoutTo(response, GOVBR_LOGOUT_URL)
    expectCookiesCleared(response)
  })

  it('sem Gov.br configurado, termina na home como o /api/auth/sso-logout', async () => {
    vi.stubEnv('NEXT_PUBLIC_GOVBR_BASE_URL', '')

    const response = await GET(ssoLogoutGovbrRequest('', sessionCookies))

    expectKeycloakLogoutTo(response, HOME_URL)
    expectCookiesCleared(response)
  })

  it('sem Keycloak configurado, vai direto ao logout do Gov.br', async () => {
    vi.stubEnv('NEXT_PUBLIC_IDENTIDADE_CARIOCA_BASE_URL', '')

    const response = await GET(
      ssoLogoutGovbrRequest('', { access_token: 'access-sintetico' })
    )

    expect(response.status).toBe(303)
    expect(response.headers.get('location')).toMatch(
      new RegExp(`^${GOVBR_BASE}logout\\?post_logout_redirect_uri=`)
    )
    expectCookiesCleared(response)
  })

  it('ignora a query string, mesmo com redirect externo', async () => {
    const response = await GET(
      ssoLogoutGovbrRequest(
        '?redirect=https://evil.example&post_logout_redirect_uri=https://evil.example',
        sessionCookies
      )
    )

    expectKeycloakLogoutTo(response, GOVBR_LOGOUT_URL)
    expect(response.headers.get('location')).not.toContain('evil.example')
  })

  it('com o Keycloak indisponível no POST, ainda redireciona e apaga os cookies', async () => {
    fetchMock.mockRejectedValue(new Error('ECONNREFUSED'))

    const response = await GET(ssoLogoutGovbrRequest('', sessionCookies))

    expectKeycloakLogoutTo(response, GOVBR_LOGOUT_URL)
    expectCookiesCleared(response)
  })

  it.each([
    ['Sec-Purpose', 'prefetch'],
    ['Sec-Purpose', 'prefetch;prerender'],
    ['Purpose', 'prefetch'],
    ['X-Moz', 'prefetch'],
  ])(
    'pré-carregamento do navegador (%s: %s) não desloga ninguém',
    async (header, value) => {
      const response = await GET(
        ssoLogoutGovbrRequest('', sessionCookies, { [header]: value })
      )

      expect(response.status).toBe(503)
      expect(response.headers.get('location')).toBeNull()
      expect(response.headers.get('cache-control')).toBe('no-store')
      expect(response.headers.getSetCookie()).toHaveLength(0)
      expect(fetchMock).not.toHaveBeenCalled()
    }
  )
})
