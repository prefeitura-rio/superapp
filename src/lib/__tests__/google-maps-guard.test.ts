import {
  allowGoogleMapsRequest,
  guardGoogleMapsRequest,
} from '@/lib/google-maps-guard'
import {
  KEYCLOAK_TEST_BASE,
  createRealmKey,
  jwksResponse,
  signAccessToken,
  unsignedAccessToken,
} from '@/test/keycloak-token-fixture'
import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const realmKey = createRealmKey('kid-realm')

function request(
  accessToken?: string,
  headers: Record<string, string> = {}
): NextRequest {
  return new NextRequest(
    new URL('/api/address-autocomplete?q=Rua', 'http://localhost:3000'),
    {
      headers: accessToken
        ? { ...headers, cookie: `access_token=${accessToken}` }
        : headers,
    }
  )
}

describe('allowGoogleMapsRequest', () => {
  it('permite 60 requisições por minuto por cliente e escopo, depois recusa', () => {
    const now = 1_000_000
    for (let i = 0; i < 60; i++) {
      expect(allowGoogleMapsRequest('address_autocomplete', 'sub-a', now)).toBe(
        true
      )
    }
    expect(allowGoogleMapsRequest('address_autocomplete', 'sub-a', now)).toBe(
      false
    )
    // outro cliente e outro escopo têm contadores próprios
    expect(allowGoogleMapsRequest('address_autocomplete', 'sub-b', now)).toBe(
      true
    )
    expect(allowGoogleMapsRequest('cep_lookup', 'sub-a', now)).toBe(true)
    // a janela expira
    expect(
      allowGoogleMapsRequest('address_autocomplete', 'sub-a', now + 60_001)
    ).toBe(true)
  })
})

describe('guardGoogleMapsRequest', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_IDENTIDADE_CARIOCA_BASE_URL', KEYCLOAK_TEST_BASE)
    fetchMock.mockReset()
    fetchMock.mockImplementation(async () => jwksResponse([realmKey]))
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('responde 401 sem sessão, sem consumir o limite', async () => {
    for (let i = 0; i < 70; i++) {
      const refused = await guardGoogleMapsRequest(request(), 'cep_lookup')
      expect(refused?.status).toBe(401)
    }
    const refused = await guardGoogleMapsRequest(request(), 'cep_lookup')
    expect(refused?.headers.get('cache-control')).toContain('no-store')
    expect(await refused?.json()).toEqual({ error: 'Not authenticated' })
  })

  it('responde 401 para token forjado sem assinatura', async () => {
    const refused = await guardGoogleMapsRequest(
      request(unsignedAccessToken()),
      'cep_lookup'
    )
    expect(refused?.status).toBe(401)
  })

  it('libera sessão verificada', async () => {
    const token = signAccessToken(realmKey, { sub: 'sub-libera' })
    expect(
      await guardGoogleMapsRequest(request(token), 'cep_lookup')
    ).toBeNull()
  })

  it('responde 429 com Retry-After quando o cidadão passa do limite, qualquer que seja o X-Forwarded-For', async () => {
    const token = signAccessToken(realmKey, { sub: 'sub-limite' })
    for (let i = 0; i < 60; i++) {
      const xff = { 'x-forwarded-for': `10.9.0.${i}` }
      expect(
        await guardGoogleMapsRequest(
          request(token, xff),
          'address_autocomplete'
        )
      ).toBeNull()
    }
    const refused = await guardGoogleMapsRequest(
      request(token, { 'x-forwarded-for': '10.9.1.1' }),
      'address_autocomplete'
    )
    expect(refused?.status).toBe(429)
    expect(refused?.headers.get('retry-after')).toBe('60')
    expect(await refused?.json()).toEqual({ error: 'Too many requests' })

    // outro cidadão no mesmo IP não é afetado
    const other = signAccessToken(realmKey, { sub: 'sub-vizinho' })
    expect(
      await guardGoogleMapsRequest(
        request(other, { 'x-forwarded-for': '10.9.1.1' }),
        'address_autocomplete'
      )
    ).toBeNull()
  })
})

describe('guardGoogleMapsRequest sem as chaves do realm', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('responde 503 sem liberar a chamada', async () => {
    vi.resetModules()
    vi.stubEnv('NEXT_PUBLIC_IDENTIDADE_CARIOCA_BASE_URL', KEYCLOAK_TEST_BASE)
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('erro', { status: 502 }))
    )
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const { guardGoogleMapsRequest: guard } = await import(
      '@/lib/google-maps-guard'
    )

    const refused = await guard(
      request(signAccessToken(realmKey)),
      'address_autocomplete'
    )

    expect(refused?.status).toBe(503)
    expect(await refused?.json()).toEqual({
      error: 'Authentication unavailable',
    })
  })
})

describe('allowGoogleMapsRequest com muitos clientes', () => {
  it('mantém o contador limitado, descartando o cliente visto há mais tempo', () => {
    const now = 5_000_000
    for (let i = 0; i < 60; i++) {
      allowGoogleMapsRequest('cep_lookup', 'sub-antigo', now)
    }
    expect(allowGoogleMapsRequest('cep_lookup', 'sub-antigo', now)).toBe(false)

    // 10 mil clientes distintos na mesma janela: o mais antigo sai do contador
    for (let i = 0; i < 10_000; i++) {
      allowGoogleMapsRequest('cep_lookup', `sub-${i}`, now)
    }

    expect(allowGoogleMapsRequest('cep_lookup', 'sub-antigo', now)).toBe(true)
  })
})
