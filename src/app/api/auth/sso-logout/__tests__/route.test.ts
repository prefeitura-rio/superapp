import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { GET } from '../route'

const KEYCLOAK_BASE =
  'https://auth.example.gov.br/realms/idrio/protocol/openid-connect'
const HOME_URL = 'https://app.example.rio/'

function ssoLogoutRequest(
  query = '',
  cookies: Record<string, string> = {},
  extraHeaders: Record<string, string> = {}
): NextRequest {
  const cookieHeader = Object.entries(cookies)
    .map(([name, value]) => `${name}=${value}`)
    .join('; ')
  return new NextRequest(
    new URL(`/api/auth/sso-logout${query}`, 'http://localhost:3000'),
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
    // Mesmos atributos do login (`AUTH_COOKIE_CONFIG`).
    expect(cookie?.toLowerCase()).toContain('samesite=lax')
  }
}

const sessionCookies = {
  access_token: 'access-sintetico',
  refresh_token: 'refresh-sintetico',
}

describe('GET /api/auth/sso-logout', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_IDENTIDADE_CARIOCA_BASE_URL', KEYCLOAK_BASE)
    vi.stubEnv('NEXT_PUBLIC_IDENTIDADE_CARIOCA_CLIENT_ID', 'test-client')
    vi.stubEnv('IDENTIDADE_CARIOCA_CLIENT_SECRET', 'segredo-de-teste')
    vi.stubEnv('NEXT_PUBLIC_HOME_URL', HOME_URL)
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

  it('revoga o refresh token, apaga os cookies e redireciona 303 para o logout do Keycloak', async () => {
    const response = await GET(ssoLogoutRequest('', sessionCookies))

    expect(response.status).toBe(303)
    expect(response.headers.get('location')).toBe(
      `${KEYCLOAK_BASE}/logout?client_id=test-client&post_logout_redirect_uri=${encodeURIComponent(HOME_URL)}`
    )
    expect(response.headers.get('cache-control')).toBe('no-store')
    expectCookiesCleared(response)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe(`${KEYCLOAK_BASE}/logout`)
    expect(init.method).toBe('POST')
    const body = new URLSearchParams(init.body)
    expect(body.get('refresh_token')).toBe('refresh-sintetico')
  })

  it('sem refresh_token, ainda redireciona para o logout do Keycloak e apaga os cookies', async () => {
    const response = await GET(
      ssoLogoutRequest('', { access_token: 'access-sintetico' })
    )

    expect(response.status).toBe(303)
    expect(response.headers.get('location')).toContain(
      `${KEYCLOAK_BASE}/logout`
    )
    expectCookiesCleared(response)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('sem NEXT_PUBLIC_HOME_URL, redireciona para / e apaga os cookies', async () => {
    vi.stubEnv('NEXT_PUBLIC_HOME_URL', '')

    const response = await GET(ssoLogoutRequest('', sessionCookies))

    expect(response.status).toBe(303)
    expect(response.headers.get('location')).toBe('http://localhost:3000/')
    expectCookiesCleared(response)
  })

  it('ignora a query string, mesmo com redirect externo', async () => {
    const response = await GET(
      ssoLogoutRequest('?redirect=https://evil.example', sessionCookies)
    )

    expect(response.status).toBe(303)
    expect(response.headers.get('location')).toContain(
      `${KEYCLOAK_BASE}/logout`
    )
    expect(response.headers.get('location')).not.toContain('evil.example')
  })

  it('com o Keycloak indisponível no POST, ainda redireciona e apaga os cookies', async () => {
    fetchMock.mockRejectedValue(new Error('ECONNREFUSED'))

    const response = await GET(ssoLogoutRequest('', sessionCookies))

    expect(response.status).toBe(303)
    expect(response.headers.get('location')).toContain(
      `${KEYCLOAK_BASE}/logout`
    )
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
        ssoLogoutRequest('', sessionCookies, { [header]: value })
      )

      // Fora de 2xx: o Chrome descarta o prefetch em vez de reaproveitá-lo
      // no clique real (um 204 seria reaproveitado e o logout não ocorreria).
      expect(response.status).toBe(503)
      expect(response.headers.get('location')).toBeNull()
      expect(response.headers.get('cache-control')).toBe('no-store')
      expect(response.headers.getSetCookie()).toHaveLength(0)
      expect(fetchMock).not.toHaveBeenCalled()
    }
  )
})
