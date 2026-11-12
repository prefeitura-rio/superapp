// @vitest-environment node
import { GET as getChamadoDetailRoute } from '@/app/api/chamados/[protocolo]/route'
import { GET as listChamadosRoute } from '@/app/api/chamados/route'
import { TEST_ENV } from '@/test/mocks/env'
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { customFetchPrefRioCidadao } from '../../custom-fetch-pref-rio-cidadao'

const BASE = TEST_ENV.BASE_API_URL_PREF_RIO_CIDADAO
const CHAMADOS_URL = `${BASE}chamados`
const PROTOCOLO = 'RIO-2026-00000001'

type FetchResult = { status: number; data: unknown }

function emptyJsonResponse(status: number): Response {
  return new HttpResponse(null, {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('customFetchPrefRioCidadao: corpo da resposta', () => {
  test('corpo vazio com content-type JSON não lança e devolve data null', async () => {
    server.use(http.get(CHAMADOS_URL, () => emptyJsonResponse(401)))

    const response = await customFetchPrefRioCidadao<FetchResult>('/chamados', {
      method: 'GET',
    })

    expect(response.status).toBe(401)
    expect(response.data).toBeNull()
  })

  test('204 sem corpo não lança e devolve data null', async () => {
    server.use(
      http.get(CHAMADOS_URL, () => new HttpResponse(null, { status: 204 }))
    )

    const response = await customFetchPrefRioCidadao<FetchResult>('/chamados', {
      method: 'GET',
    })

    expect(response.status).toBe(204)
    expect(response.data).toBeNull()
  })

  test('corpo marcado como JSON que não é JSON volta como texto, sem lançar', async () => {
    server.use(
      http.get(
        CHAMADOS_URL,
        () =>
          new HttpResponse('<html>Bad Gateway</html>', {
            status: 502,
            headers: { 'Content-Type': 'application/json' },
          })
      )
    )

    const response = await customFetchPrefRioCidadao<FetchResult>('/chamados', {
      method: 'GET',
    })

    expect(response.status).toBe(502)
    expect(response.data).toBe('<html>Bad Gateway</html>')
  })

  test('JSON válido continua sendo devolvido como objeto', async () => {
    const corpo = { protocolos: [{ protocolo: PROTOCOLO }] }
    server.use(
      http.get(CHAMADOS_URL, () => HttpResponse.json(corpo, { status: 200 }))
    )

    const response = await customFetchPrefRioCidadao<FetchResult>('/chamados', {
      method: 'GET',
    })

    expect(response.status).toBe(200)
    expect(response.data).toEqual(corpo)
  })

  test('texto não JSON continua sendo devolvido como texto', async () => {
    server.use(
      http.get(CHAMADOS_URL, () => HttpResponse.text('ok', { status: 200 }))
    )

    const response = await customFetchPrefRioCidadao<FetchResult>('/chamados', {
      method: 'GET',
    })

    expect(response.data).toBe('ok')
  })
})

describe('rotas /api/chamados com resposta vazia do upstream', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_FEATURE_SALESFORCE', 'true')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  test('GET /api/chamados repassa o status sem lançar quando o corpo vem vazio', async () => {
    server.use(http.get(CHAMADOS_URL, () => emptyJsonResponse(401)))

    const response = await listChamadosRoute(
      new Request('http://localhost/api/chamados')
    )

    expect(response.status).toBe(401)
    expect(await response.json()).toBeNull()
  })

  test('GET /api/chamados não lança com corpo vazio sem content-type', async () => {
    server.use(
      http.get(CHAMADOS_URL, () => new HttpResponse('', { status: 500 }))
    )

    const response = await listChamadosRoute(
      new Request('http://localhost/api/chamados')
    )

    expect(response.status).toBe(500)
    expect(await response.json()).toBeNull()
  })

  test('GET /api/chamados/[protocolo] repassa o status sem lançar quando o corpo vem vazio', async () => {
    server.use(
      http.get(`${CHAMADOS_URL}/${PROTOCOLO}`, () => emptyJsonResponse(500))
    )

    const response = await getChamadoDetailRoute(
      new Request(`http://localhost/api/chamados/${PROTOCOLO}`),
      { params: Promise.resolve({ protocolo: PROTOCOLO }) }
    )

    expect(response.status).toBe(500)
    expect(await response.json()).toBeNull()
  })
})
