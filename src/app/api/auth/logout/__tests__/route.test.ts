import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { GET } from '../route'

const KEYCLOAK_BASE =
  'https://auth.example.gov.br/realms/idrio/protocol/openid-connect'

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

function expectLoggedOutResponse(response: Response) {
  expect(response.status).toBe(204)
  expect(response.headers.get('location')).toBeNull()

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
    vi.stubEnv('IDENTIDADE_CARIOCA_CLIENT_SECRET', 'segredo-de-teste')
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

  it('encerra a sessão no Keycloak, apaga os cookies e responde 204', async () => {
    const response = await GET(logoutRequest('', sessionCookies))

    expectLoggedOutResponse(response)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe(`${KEYCLOAK_BASE}/logout`)
    expect(init.method).toBe('POST')
    const body = new URLSearchParams(init.body)
    expect(body.get('refresh_token')).toBe('refresh-sintetico')
    expect(body.get('client_id')).toBe('test-client')
    expect(init.signal).toBeInstanceOf(AbortSignal)
  })

  it('com o Keycloak indisponível, ainda apaga os cookies', async () => {
    fetchMock.mockRejectedValue(new Error('ECONNREFUSED'))

    expectLoggedOutResponse(await GET(logoutRequest('', sessionCookies)))
  })

  it('com o Keycloak estourando o tempo limite, ainda apaga os cookies', async () => {
    fetchMock.mockRejectedValue(
      new DOMException('The operation timed out.', 'TimeoutError')
    )

    expectLoggedOutResponse(await GET(logoutRequest('', sessionCookies)))
  })

  it('com o Keycloak respondendo erro, ainda apaga os cookies', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 400 }))

    expectLoggedOutResponse(await GET(logoutRequest('', sessionCookies)))
  })

  it('sem credencial do Keycloak no servidor, não chama o Keycloak e apaga os cookies', async () => {
    vi.stubEnv('IDENTIDADE_CARIOCA_CLIENT_SECRET', '')

    expectLoggedOutResponse(await GET(logoutRequest('', sessionCookies)))
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('sem refresh_token, não chama o Keycloak e apaga os cookies', async () => {
    expectLoggedOutResponse(
      await GET(logoutRequest('', { access_token: 'access-sintetico' }))
    )
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('não redireciona, mesmo com parâmetros na query string', async () => {
    expectLoggedOutResponse(
      await GET(
        logoutRequest(
          '?sso=govbr&redirect=https://malicioso.example',
          sessionCookies
        )
      )
    )
  })
})
