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

function cepRequest(
  accessToken?: string,
  query = 'place_id=place-sintetico'
): NextRequest {
  return new NextRequest(
    new URL(`/api/cep-lookup?${query}`, 'http://localhost:3000'),
    { headers: accessToken ? { cookie: `access_token=${accessToken}` } : {} }
  )
}

const placeDetails = {
  result: {
    address_components: [
      { long_name: '20000000', types: ['postal_code'] },
      { long_name: 'Rua Sintética', types: ['route'] },
      { long_name: 'Rio de Janeiro', types: ['administrative_area_level_2'] },
    ],
  },
}

describe('GET /api/cep-lookup', () => {
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
        : new Response(JSON.stringify(placeDetails), { status: 200 })
    )
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('recusa chamada anônima com 401 sem chamar o Google, nem com number', async () => {
    const response = await GET(
      cepRequest(undefined, 'place_id=place-sintetico&number=100')
    )

    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({ error: 'Not authenticated' })
    expect(googleCalls()).toHaveLength(0)
  })

  it('recusa token forjado ou expirado com 401 sem chamar o Google', async () => {
    for (const token of [
      unsignedAccessToken(),
      signAccessToken(realmKey, {}, { expiresIn: -60 }),
    ]) {
      const response = await GET(cepRequest(token))
      expect(response.status).toBe(401)
    }
    expect(googleCalls()).toHaveLength(0)
  })

  it('com sessão verificada, consulta o Place Details e devolve o CEP formatado', async () => {
    const response = await GET(
      cepRequest(signAccessToken(realmKey, { sub: 'sub-ok' }))
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ cep: '20000-000' })
    expect(googleCalls()).toHaveLength(1)
  })

  it('codifica o place_id, sem deixar injetar parâmetros na URL do Google', async () => {
    await GET(
      cepRequest(
        signAccessToken(realmKey, { sub: 'sub-injecao' }),
        `place_id=${encodeURIComponent('abc&fields=geometry')}`
      )
    )

    const url = new URL(String(googleCalls()[0][0]))
    expect(url.searchParams.get('place_id')).toBe('abc&fields=geometry')
    expect(url.searchParams.getAll('fields')).toEqual(['address_components'])
  })

  it('acima do limite do cidadão, responde 429 sem chamar o Google', async () => {
    const token = signAccessToken(realmKey, { sub: 'sub-limite' })
    for (let i = 0; i < 60; i++) {
      const ok = await GET(cepRequest(token))
      expect(ok.status).toBe(200)
    }
    fetchMock.mockClear()

    const response = await GET(cepRequest(token))

    expect(response.status).toBe(429)
    expect(googleCalls()).toHaveLength(0)
  })
})
