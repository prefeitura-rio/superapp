import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { GET } from '../route'

function base64Url(value: object): string {
  return Buffer.from(JSON.stringify(value)).toString('base64url')
}

function syntheticJwt(expOffsetSeconds: number): string {
  const exp = Math.floor(Date.now() / 1000) + expOffsetSeconds
  return `${base64Url({ alg: 'none', typ: 'JWT' })}.${base64Url({ exp })}.assinatura`
}

function autocompleteRequest(
  ip: string,
  accessToken?: string,
  query = 'q=Rua%20Sint%C3%A9tica'
): NextRequest {
  const headers: Record<string, string> = { 'x-forwarded-for': ip }
  if (accessToken) headers.cookie = `access_token=${accessToken}`
  return new NextRequest(
    new URL(`/api/address-autocomplete?${query}`, 'http://localhost:3000'),
    { headers }
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

  beforeEach(() => {
    vi.stubEnv('GOOGLE_MAPS_API_KEY', 'chave-de-teste')
    fetchMock.mockReset()
    fetchMock.mockImplementation(
      async () => new Response(JSON.stringify(googleResponse), { status: 200 })
    )
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('recusa chamada anônima com 401 sem chamar o Google', async () => {
    const response = await GET(autocompleteRequest('192.0.2.1'))

    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({ error: 'Not authenticated' })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('recusa token expirado ou malformado com 401 sem chamar o Google', async () => {
    for (const token of [syntheticJwt(-60), 'nao-e-jwt']) {
      const response = await GET(autocompleteRequest('192.0.2.2', token))
      expect(response.status).toBe(401)
    }
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('com sessão válida, repassa ao Google e devolve as sugestões', async () => {
    const response = await GET(
      autocompleteRequest('192.0.2.3', syntheticJwt(3600))
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
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(String(fetchMock.mock.calls[0][0])).toContain(
      'maps.googleapis.com/maps/api/place/autocomplete/json'
    )
  })

  it('com sessão válida e acima do limite por IP, responde 429 sem chamar o Google', async () => {
    const token = syntheticJwt(3600)
    for (let i = 0; i < 60; i++) {
      const ok = await GET(autocompleteRequest('192.0.2.4', token))
      expect(ok.status).toBe(200)
    }
    fetchMock.mockClear()

    const response = await GET(autocompleteRequest('192.0.2.4', token))

    expect(response.status).toBe(429)
    expect(response.headers.get('retry-after')).toBe('60')
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
