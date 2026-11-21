// @vitest-environment node
import { GET } from '@/app/api/chamados/route'
import { TEST_ENV } from '@/test/mocks/env'
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (nome: string) =>
      nome === 'access_token' ? { value: 'token-sintetico' } : undefined,
  }),
}))

const CIDADAO = TEST_ENV.BASE_API_URL_PREF_RIO_CIDADAO
const HOST_INTERNO = 'sandbox-sintetico.my.salesforce.com'
const ERRO_GENERICO = { error: 'Não foi possível consultar os chamados' }

function corpoBrutoMule(status: string) {
  return {
    error: 'JWT Token is required.',
    errors: [
      {
        code: 'INTERNAL_ERROR',
        message: 'Falha de comunicacao com Salesforce.',
        detalhe: `HTTP GET on resource 'https://${HOST_INTERNO}:443/services/apexrest/apis/private/chamados' failed: ${status}.`,
      },
    ],
  }
}

function listar() {
  return GET(new Request('http://localhost/api/chamados'))
}

function semDetalheDoBackend(corpo: string) {
  expect(corpo).not.toContain(HOST_INTERNO)
  expect(corpo).not.toContain('salesforce')
  expect(corpo).not.toContain('Salesforce')
  expect(corpo).not.toContain('apexrest')
  expect(corpo).not.toContain('INTERNAL_ERROR')
  expect(corpo).not.toContain('JWT')
  expect(corpo).not.toContain('detalhe')
}

describe('DEV-725: erro da lista autenticada de chamados não vaza o backend', () => {
  beforeEach(() => {
    vi.stubEnv('FEATURE_SALESFORCE', 'true')
    vi.stubEnv('USE_MOCK_CHAMADOS', 'false')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  test.each([400, 401, 403, 404, 500, 503])(
    '%i do upstream mantém o status sem repassar o corpo bruto',
    async status => {
      server.use(
        http.get(`${CIDADAO}chamados`, () =>
          HttpResponse.json(corpoBrutoMule(`erro (${status})`), { status })
        )
      )

      const response = await listar()
      const corpo = JSON.stringify(await response.json())

      expect(response.status).toBe(status)
      expect(JSON.parse(corpo)).toEqual(ERRO_GENERICO)
      semDetalheDoBackend(corpo)
    }
  )

  test('corpo de erro em texto (não JSON) não é repassado nem quebra a rota', async () => {
    server.use(
      http.get(
        `${CIDADAO}chamados`,
        () =>
          new HttpResponse(`<html>bad gateway ${HOST_INTERNO}</html>`, {
            status: 502,
            headers: { 'Content-Type': 'text/html' },
          })
      )
    )

    const response = await listar()
    const corpo = JSON.stringify(await response.json())

    expect(response.status).toBe(502)
    expect(JSON.parse(corpo)).toEqual(ERRO_GENERICO)
    semDetalheDoBackend(corpo)
  })

  test('falha de rede ao chamar o upstream vira 502 genérico', async () => {
    server.use(http.get(`${CIDADAO}chamados`, () => HttpResponse.error()))
    const erro = vi.spyOn(console, 'error').mockImplementation(() => {})

    const response = await listar()
    const corpo = JSON.stringify(await response.json())

    expect(response.status).toBe(502)
    expect(JSON.parse(corpo)).toEqual(ERRO_GENERICO)
    semDetalheDoBackend(corpo)
    erro.mockRestore()
  })

  test('sucesso continua repassando a lista de chamados', async () => {
    const lista = {
      protocolos: [
        {
          protocolo: '99999999',
          dataUltimaAtualizacao: '2026-11-20T10:00:00Z',
          ordens_de_servico: [{ codigoOs: 'OS-1', status: 'Aberto' }],
        },
      ],
    }
    server.use(
      http.get(`${CIDADAO}chamados`, () =>
        HttpResponse.json(lista, { status: 200 })
      )
    )

    const response = await listar()

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual(lista)
  })
})
