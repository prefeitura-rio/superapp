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

function cepRequest(
  ip: string,
  accessToken?: string,
  query = 'place_id=place-sintetico'
): NextRequest {
  const headers: Record<string, string> = { 'x-forwarded-for': ip }
  if (accessToken) headers.cookie = `access_token=${accessToken}`
  return new NextRequest(
    new URL(`/api/cep-lookup?${query}`, 'http://localhost:3000'),
    { headers }
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

  beforeEach(() => {
    vi.stubEnv('GOOGLE_MAPS_API_KEY', 'chave-de-teste')
    fetchMock.mockReset()
    fetchMock.mockImplementation(
      async () => new Response(JSON.stringify(placeDetails), { status: 200 })
    )
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('recusa chamada anônima com 401 sem chamar o Google, nem com number', async () => {
    const response = await GET(
      cepRequest('192.0.2.21', undefined, 'place_id=place-sintetico&number=100')
    )

    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({ error: 'Not authenticated' })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('recusa token expirado com 401 sem chamar o Google', async () => {
    const response = await GET(cepRequest('192.0.2.22', syntheticJwt(-60)))

    expect(response.status).toBe(401)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('com sessão válida, consulta o Place Details e devolve o CEP formatado', async () => {
    const response = await GET(cepRequest('192.0.2.23', syntheticJwt(3600)))

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ cep: '20000-000' })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('codifica o place_id, sem deixar injetar parâmetros na URL do Google', async () => {
    await GET(
      cepRequest(
        '192.0.2.24',
        syntheticJwt(3600),
        `place_id=${encodeURIComponent('abc&fields=geometry')}`
      )
    )

    const url = new URL(String(fetchMock.mock.calls[0][0]))
    expect(url.searchParams.get('place_id')).toBe('abc&fields=geometry')
    expect(url.searchParams.getAll('fields')).toEqual(['address_components'])
  })

  it('com sessão válida e acima do limite por IP, responde 429 sem chamar o Google', async () => {
    const token = syntheticJwt(3600)
    for (let i = 0; i < 60; i++) {
      const ok = await GET(cepRequest('192.0.2.25', token))
      expect(ok.status).toBe(200)
    }
    fetchMock.mockClear()

    const response = await GET(cepRequest('192.0.2.25', token))

    expect(response.status).toBe(429)
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
