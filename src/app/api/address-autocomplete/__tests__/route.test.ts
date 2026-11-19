import {
  KEYCLOAK_TEST_BASE,
  KEYCLOAK_TEST_JWKS_URL,
  createRealmKey,
  jwksResponse,
  signAccessToken,
  unsignedAccessToken,
} from '@/test/keycloak-token-fixture'
import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { GET } from '../route'

const realmKey = createRealmKey('kid-realm')
const otherKey = createRealmKey('kid-outro')

function autocompleteRequest(accessToken?: string): NextRequest {
  return new NextRequest(
    new URL(
      '/api/address-autocomplete?q=Rua%20Sint%C3%A9tica',
      'http://localhost:3000'
    ),
    { headers: accessToken ? { cookie: `access_token=${accessToken}` } : {} }
  )
}

const googleResponse = {
  predictions: [
    {
      description: 'Rua Sintética, Rio de Janeiro - RJ, Brasil',
      place_id: 'place-sintetico',
      structured_formatting: {
        main_text: 'Rua Sintética',
        secondary_text: 'Rio de Janeiro - RJ, Brasil',
      },
    },
  ],
}

describe('GET /api/address-autocomplete', () => {
  const fetchMock = vi.fn()
  const googleCalls = () =>
    fetchMock.mock.calls.filter(([url]) =>
      String(url).startsWith('https://maps.googleapis.com/')
    )

  beforeEach(() => {
    vi.stubEnv('GOOGLE_MAPS_API_KEY', 'chave-de-teste')
    vi.stubEnv('NEXT_PUBLIC_IDENTIDADE_CARIOCA_BASE_URL', KEYCLOAK_TEST_BASE)
    fetchMock.mockReset()
    fetchMock.mockImplementation(async (url: string) =>
      String(url) === KEYCLOAK_TEST_JWKS_URL
        ? jwksResponse([realmKey])
        : new Response(JSON.stringify(googleResponse), { status: 200 })
    )
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('recusa chamada anônima com 401 sem chamar o Google', async () => {
    const response = await GET(autocompleteRequest())

    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({ error: 'Not authenticated' })
    expect(googleCalls()).toHaveLength(0)
  })

  it('recusa token forjado, de outra chave, expirado ou malformado com 401 sem chamar o Google', async () => {
    for (const token of [
      unsignedAccessToken(),
      signAccessToken(otherKey, {}, { kid: realmKey.kid }),
      signAccessToken(realmKey, {}, { expiresIn: -60 }),
      'nao-e-jwt',
    ]) {
      const response = await GET(autocompleteRequest(token))
      expect(response.status).toBe(401)
    }
    expect(googleCalls()).toHaveLength(0)
  })

  it('com sessão verificada, repassa ao Google e devolve as sugestões', async () => {
    const response = await GET(
      autocompleteRequest(signAccessToken(realmKey, { sub: 'sub-ok' }))
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      results: [
        {
          main_text: 'Rua Sintética',
          secondary_text: 'Rio de Janeiro - RJ, Brasil',
          place_id: 'place-sintetico',
        },
      ],
    })
    expect(googleCalls()).toHaveLength(1)
    expect(String(googleCalls()[0][0])).toContain(
      'maps.googleapis.com/maps/api/place/autocomplete/json'
    )
  })

  it('acima do limite do cidadão, responde 429 sem chamar o Google', async () => {
    const token = signAccessToken(realmKey, { sub: 'sub-limite' })
    for (let i = 0; i < 60; i++) {
      const ok = await GET(autocompleteRequest(token))
      expect(ok.status).toBe(200)
    }
    fetchMock.mockClear()

    const response = await GET(autocompleteRequest(token))

    expect(response.status).toBe(429)
    expect(response.headers.get('retry-after')).toBe('60')
    expect(googleCalls()).toHaveLength(0)
  })
})
