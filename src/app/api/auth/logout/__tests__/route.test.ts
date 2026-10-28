import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { GET } from '../route'

const KEYCLOAK_BASE =
  'https://auth.example.gov.br/realms/idrio/protocol/openid-connect'
const APP_CALLBACK = 'https://app.example.rio/api/auth/callback/keycloak'
const POST_LOGOUT_REDIRECT_URI = `${KEYCLOAK_BASE}/auth?client_id=test-client&redirect_uri=${APP_CALLBACK}&response_type=code`
const GOVBR_LOGOUT_URL = `https://sso.example.gov.br/logout?post_logout_redirect_uri=${encodeURIComponent(POST_LOGOUT_REDIRECT_URI)}`

function logoutRequest(
  query = '',
  cookies: Record<string, string> = {}
): NextRequest {
  const cookieHeader = Object.entries(cookies)
    .map(([name, value]) => `${name}=${value}`)
    .join('; ')
  return new NextRequest(
    new URL(`/api/auth/logout${query}`, 'http://localhost:3000'),
    { headers: cookieHeader ? { cookie: cookieHeader } : {} }
  )
}

function expectAuthCookiesCleared(response: Response) {
  const setCookie = response.headers.getSetCookie()
  for (const name of ['access_token', 'refresh_token']) {
    const cookie = setCookie.find(c => c.startsWith(`${name}=`))
    expect(cookie, `${name} deve ser apagado`).toBeDefined()
    expect(cookie).toMatch(new RegExp(`^${name}=;`))
    expect(cookie).toContain('Max-Age=0')
    expect(cookie).toContain('Path=/')
    expect(cookie).toContain('HttpOnly')
  }
}

const sessionCookies = {
  access_token: 'access-sintetico',
  refresh_token: 'refresh-sintetico',
}

describe('GET /api/auth/logout', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_IDENTIDADE_CARIOCA_BASE_URL', KEYCLOAK_BASE)
    vi.stubEnv('NEXT_PUBLIC_IDENTIDADE_CARIOCA_CLIENT_ID', 'test-client')
    vi.stubEnv('NEXT_PUBLIC_IDENTIDADE_CARIOCA_REDIRECT_URI', APP_CALLBACK)
    vi.stubEnv('IDENTIDADE_CARIOCA_CLIENT_SECRET', 'segredo-de-teste')
    vi.stubEnv('NEXT_PUBLIC_GOVBR_BASE_URL', 'https://sso.example.gov.br/')
    vi.stubEnv('NEXT_PUBLIC_HOME_URL', 'https://app.example.rio/')
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

  describe('sem parâmetro (chamada via fetch)', () => {
    it('encerra a sessão no Keycloak, apaga os cookies e responde 204', async () => {
      const response = await GET(logoutRequest('', sessionCookies))

      expect(response.status).toBe(204)
      expect(response.headers.get('location')).toBeNull()
      expectAuthCookiesCleared(response)

      expect(fetchMock).toHaveBeenCalledTimes(1)
      const [url, init] = fetchMock.mock.calls[0]
      expect(url).toBe(`${KEYCLOAK_BASE}/logout`)
      expect(init.method).toBe('POST')
      const body = new URLSearchParams(init.body)
      expect(body.get('refresh_token')).toBe('refresh-sintetico')
      expect(body.get('client_id')).toBe('test-client')
      expect(init.signal).toBeInstanceOf(AbortSignal)
    })
  })

  describe('?sso=govbr (navegação de primeiro nível)', () => {
    it('redireciona (303) ao logout do Gov.br com o post_logout_redirect_uri de sempre e apaga os cookies', async () => {
      const response = await GET(logoutRequest('?sso=govbr', sessionCookies))

      expect(response.status).toBe(303)
      expect(response.headers.get('location')).toBe(GOVBR_LOGOUT_URL)
      expect(response.headers.get('cache-control')).toBe('no-store')
      expectAuthCookiesCleared(response)
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it('aceita NEXT_PUBLIC_GOVBR_BASE_URL sem barra final', async () => {
      vi.stubEnv('NEXT_PUBLIC_GOVBR_BASE_URL', 'https://sso.example.gov.br')

      const response = await GET(logoutRequest('?sso=govbr', sessionCookies))

      expect(response.headers.get('location')).toBe(GOVBR_LOGOUT_URL)
    })

    it('sem Gov.br configurado, apaga os cookies e vai para a home', async () => {
      vi.stubEnv('NEXT_PUBLIC_GOVBR_BASE_URL', '')

      const response = await GET(logoutRequest('?sso=govbr', sessionCookies))

      expect(response.status).toBe(303)
      expect(response.headers.get('location')).toBe('https://app.example.rio/')
      expectAuthCookiesCleared(response)
    })

    it('sem Gov.br nem home configurados, vai para a raiz da própria origem', async () => {
      vi.stubEnv('NEXT_PUBLIC_GOVBR_BASE_URL', '')
      vi.stubEnv('NEXT_PUBLIC_HOME_URL', '')

      const response = await GET(logoutRequest('?sso=govbr', sessionCookies))

      expect(response.headers.get('location')).toBe('http://localhost:3000/')
      expectAuthCookiesCleared(response)
    })

    it('com o Keycloak indisponível, segue para o Gov.br e apaga os cookies', async () => {
      fetchMock.mockRejectedValue(new Error('ECONNREFUSED'))

      const response = await GET(logoutRequest('?sso=govbr', sessionCookies))

      expect(response.status).toBe(303)
      expect(response.headers.get('location')).toBe(GOVBR_LOGOUT_URL)
      expectAuthCookiesCleared(response)
    })

    it('com o Keycloak estourando o tempo limite, segue para o Gov.br e apaga os cookies', async () => {
      fetchMock.mockRejectedValue(
        new DOMException('The operation timed out.', 'TimeoutError')
      )

      const response = await GET(logoutRequest('?sso=govbr', sessionCookies))

      expect(response.headers.get('location')).toBe(GOVBR_LOGOUT_URL)
      expectAuthCookiesCleared(response)
    })

    it('sem credencial do Keycloak no servidor, não chama o Keycloak e ainda encerra o Gov.br', async () => {
      vi.stubEnv('IDENTIDADE_CARIOCA_CLIENT_SECRET', '')

      const response = await GET(logoutRequest('?sso=govbr', sessionCookies))

      expect(fetchMock).not.toHaveBeenCalled()
      expect(response.headers.get('location')).toBe(GOVBR_LOGOUT_URL)
      expectAuthCookiesCleared(response)
    })

    it('sem sessão na aplicação, não chama o Keycloak e ainda encerra o Gov.br', async () => {
      const response = await GET(logoutRequest('?sso=govbr'))

      expect(fetchMock).not.toHaveBeenCalled()
      expect(response.status).toBe(303)
      expect(response.headers.get('location')).toBe(GOVBR_LOGOUT_URL)
      expectAuthCookiesCleared(response)
    })

    it('ignora destinos vindos da query string (sem open redirect)', async () => {
      const response = await GET(
        logoutRequest(
          '?sso=govbr&redirect=https://malicioso.example&post_logout_redirect_uri=https://malicioso.example',
          sessionCookies
        )
      )

      expect(response.headers.get('location')).toBe(GOVBR_LOGOUT_URL)
    })

    it('valor de sso diferente de govbr mantém a resposta 204', async () => {
      const response = await GET(logoutRequest('?sso=outro', sessionCookies))

      expect(response.status).toBe(204)
      expect(response.headers.get('location')).toBeNull()
      expectAuthCookiesCleared(response)
    })
  })
})
