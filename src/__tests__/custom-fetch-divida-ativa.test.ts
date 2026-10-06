import { TEST_ENV } from '@/test/mocks/env'
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { customFetchDividaAtiva } from '../../custom-fetch-divida-ativa'

const DIVIDA_ATIVA = TEST_ENV.BASE_API_URL_DIVIDA_ATIVA

describe('customFetchDividaAtiva', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  test('lança erro explícito quando a base URL não está configurada', async () => {
    vi.stubEnv('BASE_API_URL_DIVIDA_ATIVA', undefined)

    await expect(
      customFetchDividaAtiva('/v1/imoveis', { method: 'GET' })
    ).rejects.toThrow(
      'BASE_API_URL_DIVIDA_ATIVA environment variable is not set.'
    )
  })

  test('resolve o caminho relativo contra a base URL configurada', async () => {
    let requestedUrl = ''
    server.use(
      http.get(`${DIVIDA_ATIVA}/v1/imoveis`, ({ request }) => {
        requestedUrl = request.url
        return HttpResponse.json({ data: [] }, { status: 200 })
      })
    )

    await customFetchDividaAtiva('/v1/imoveis', { method: 'GET' })

    expect(requestedUrl).toBe(`${DIVIDA_ATIVA}/v1/imoveis`)
  })

  test('envia o token do cidadão como Bearer', async () => {
    let authorization: string | null = null
    server.use(
      http.get(`${DIVIDA_ATIVA}/v1/imoveis`, ({ request }) => {
        authorization = request.headers.get('authorization')
        return HttpResponse.json({ data: [] }, { status: 200 })
      })
    )

    await customFetchDividaAtiva('/v1/imoveis', { method: 'GET' })

    expect(authorization).toBe('Bearer mock-access-token')
  })

  test('devolve status e dados no formato que o client gerado espera', async () => {
    server.use(
      http.get(`${DIVIDA_ATIVA}/v1/imoveis`, () =>
        HttpResponse.json({ data: [] }, { status: 200 })
      )
    )

    const response = await customFetchDividaAtiva<{
      status: number
      data: unknown
    }>('/v1/imoveis', { method: 'GET' })

    expect(response.status).toBe(200)
    expect(response.data).toEqual({ data: [] })
  })
})
