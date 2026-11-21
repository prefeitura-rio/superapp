// @vitest-environment node
import { GET } from '@/app/api/chamados-publico/[protocolo]/route'
import { TEST_ENV } from '@/test/mocks/env'
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

const PUBLICO = TEST_ENV.BASE_API_URL_PREF_RIO_CHAMADOS_PUBLICO
const PROTOCOLO = '99999999'
const HOST_INTERNO = 'sandbox-sintetico.my.salesforce.com'

function corpoBrutoMule(status: string) {
  return {
    errors: [
      {
        code: 'INTERNAL_ERROR',
        message: 'Falha de comunicacao com Salesforce.',
        detalhe: `HTTP GET on resource 'https://${HOST_INTERNO}:443/services/apexrest/apis/public/chamados/${PROTOCOLO}' failed: ${status}.`,
      },
    ],
  }
}

function consultar() {
  return GET(
    new Request(`http://localhost/api/chamados-publico/${PROTOCOLO}`),
    { params: Promise.resolve({ protocolo: PROTOCOLO }) }
  )
}

function semDetalheDeInfra(corpo: string) {
  expect(corpo).not.toContain(HOST_INTERNO)
  expect(corpo).not.toContain('salesforce')
  expect(corpo).not.toContain('apexrest')
  expect(corpo).not.toContain('Salesforce')
  expect(corpo).not.toContain('INTERNAL_ERROR')
  expect(corpo).not.toContain('detalhe')
}

describe('DEV-709: erro da consulta pública de chamado não vaza o backend', () => {
  beforeEach(() => {
    vi.stubEnv('FEATURE_SALESFORCE', 'true')
    vi.stubEnv('USE_MOCK_CHAMADOS', 'false')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  test('404 do upstream vira 404 com mensagem genérica de não encontrado', async () => {
    server.use(
      http.get(`${PUBLICO}chamados/${PROTOCOLO}`, () =>
        HttpResponse.json(corpoBrutoMule('not found (404)'), { status: 404 })
      )
    )

    const response = await consultar()
    const corpo = JSON.stringify(await response.json())

    expect(response.status).toBe(404)
    expect(JSON.parse(corpo)).toEqual({ error: 'Chamado não encontrado' })
    semDetalheDeInfra(corpo)
  })

  test.each([400, 401, 500, 503])(
    '%i do upstream mantém o status sem repassar o corpo bruto',
    async status => {
      server.use(
        http.get(`${PUBLICO}chamados/${PROTOCOLO}`, () =>
          HttpResponse.json(corpoBrutoMule(`erro (${status})`), { status })
        )
      )

      const response = await consultar()
      const corpo = JSON.stringify(await response.json())

      expect(response.status).toBe(status)
      expect(JSON.parse(corpo)).toEqual({
        error: 'Não foi possível consultar o chamado',
      })
      semDetalheDeInfra(corpo)
    }
  )

  test('corpo de erro em texto (não JSON) não é repassado nem quebra a rota', async () => {
    server.use(
      http.get(
        `${PUBLICO}chamados/${PROTOCOLO}`,
        () =>
          new HttpResponse(`<html>bad gateway ${HOST_INTERNO}</html>`, {
            status: 502,
            headers: { 'Content-Type': 'text/html' },
          })
      )
    )

    const response = await consultar()
    const corpo = JSON.stringify(await response.json())

    expect(response.status).toBe(502)
    semDetalheDeInfra(corpo)
  })

  test('falha de rede ao chamar o upstream vira 502 genérico', async () => {
    server.use(
      http.get(`${PUBLICO}chamados/${PROTOCOLO}`, () => HttpResponse.error())
    )
    const erro = vi.spyOn(console, 'error').mockImplementation(() => {})

    const response = await consultar()
    const corpo = JSON.stringify(await response.json())

    expect(response.status).toBe(502)
    expect(JSON.parse(corpo)).toEqual({
      error: 'Não foi possível consultar o chamado',
    })
    semDetalheDeInfra(corpo)
    erro.mockRestore()
  })

  test('sucesso continua repassando o corpo do chamado', async () => {
    const chamado = {
      protocolo: PROTOCOLO,
      status: 'Em andamento',
      ordens_de_servico: [{ codigoOs: 'OS-1', status: 'Em andamento' }],
    }
    server.use(
      http.get(`${PUBLICO}chamados/${PROTOCOLO}`, () =>
        HttpResponse.json(chamado, { status: 200 })
      )
    )

    const response = await consultar()

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual(chamado)
  })
})
