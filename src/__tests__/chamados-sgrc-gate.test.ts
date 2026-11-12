// @vitest-environment node
import { GET as getChamadoPublicoRoute } from '@/app/api/chamados-publico/[protocolo]/route'
import { GET as getChamadoDetailRoute } from '@/app/api/chamados/[protocolo]/route'
import { GET as listChamadosRoute } from '@/app/api/chamados/route'
import {
  PROTOCOLO_DONO_CONCLUIDO_SGRC,
  PROTOCOLO_DONO_SGRC,
  PROTOCOLO_TERCEIRO_SGRC,
} from '@/lib/chamados/mock-sgrc'
import { TEST_ENV } from '@/test/mocks/env'
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) =>
      name === 'access_token' ? { value: 'token-sintetico' } : undefined,
  }),
}))

const CIDADAO = TEST_ENV.BASE_API_URL_PREF_RIO_CIDADAO
const PUBLICO = TEST_ENV.BASE_API_URL_PREF_RIO_CHAMADOS_PUBLICO
const FICTICIOS = [
  PROTOCOLO_DONO_SGRC,
  PROTOCOLO_DONO_CONCLUIDO_SGRC,
  PROTOCOLO_TERCEIRO_SGRC,
]

function listarSgrc() {
  return listChamadosRoute(
    new Request('http://localhost/api/chamados?origem=sgrc')
  )
}

describe('DEV-568: histórico SGRC fictício fora do alcance do cidadão', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  describe('com a flag do Salesforce desligada', () => {
    beforeEach(() => {
      vi.stubEnv('NEXT_PUBLIC_FEATURE_SALESFORCE', 'false')
      vi.stubEnv('NEXT_PUBLIC_USE_MOCK_CHAMADOS', 'true')
    })

    test('GET /api/chamados?origem=sgrc responde 404, como o detalhe', async () => {
      const response = await listarSgrc()

      expect(response.status).toBe(404)
      expect(JSON.stringify(await response.json())).not.toContain(
        PROTOCOLO_DONO_SGRC
      )
    })
  })

  describe('com a flag do Salesforce ligada e sem o modo mock (staging e produção)', () => {
    beforeEach(() => {
      vi.stubEnv('NEXT_PUBLIC_FEATURE_SALESFORCE', 'true')
      vi.stubEnv('NEXT_PUBLIC_USE_MOCK_CHAMADOS', 'false')
    })

    test('GET /api/chamados?origem=sgrc responde 501 sem nenhum chamado fictício', async () => {
      const response = await listarSgrc()
      const corpo = JSON.stringify(await response.json())

      expect(response.status).toBe(501)
      expect(response.headers.get('Cache-Control')).toBe('private, no-store')
      expect(corpo).not.toContain('protocolos')
      for (const protocolo of FICTICIOS) {
        expect(corpo).not.toContain(protocolo)
      }
    })

    test('o detalhe logado de um protocolo do mock vai à API real, não ao mock', async () => {
      const upstream = vi.fn(() =>
        HttpResponse.json({ error: 'not found' }, { status: 404 })
      )
      server.use(
        http.get(`${CIDADAO}chamados/${PROTOCOLO_DONO_SGRC}`, upstream)
      )

      const response = await getChamadoDetailRoute(
        new Request(`http://localhost/api/chamados/${PROTOCOLO_DONO_SGRC}`),
        { params: Promise.resolve({ protocolo: PROTOCOLO_DONO_SGRC }) }
      )

      expect(upstream).toHaveBeenCalledTimes(1)
      expect(response.status).toBe(404)
      expect(JSON.stringify(await response.json())).not.toContain('RIOLUZ')
    })

    test('a consulta pública de um protocolo do mock vai à API real, não ao mock', async () => {
      const upstream = vi.fn(() =>
        HttpResponse.json({ error: 'not found' }, { status: 404 })
      )
      server.use(
        http.get(`${PUBLICO}chamados/${PROTOCOLO_TERCEIRO_SGRC}`, upstream)
      )

      const response = await getChamadoPublicoRoute(
        new Request(
          `http://localhost/api/chamados-publico/${PROTOCOLO_TERCEIRO_SGRC}`
        ),
        { params: Promise.resolve({ protocolo: PROTOCOLO_TERCEIRO_SGRC }) }
      )

      expect(upstream).toHaveBeenCalledTimes(1)
      expect(response.status).toBe(404)
      expect(JSON.stringify(await response.json())).not.toContain('Laranjeiras')
    })
  })

  describe('com o modo mock explícito (desenvolvimento)', () => {
    beforeEach(() => {
      vi.stubEnv('NEXT_PUBLIC_FEATURE_SALESFORCE', 'true')
      vi.stubEnv('NEXT_PUBLIC_USE_MOCK_CHAMADOS', 'true')
    })

    test('GET /api/chamados?origem=sgrc continua servindo o mock', async () => {
      const response = await listarSgrc()
      const corpo = (await response.json()) as {
        protocolos: { protocolo: string }[]
      }

      expect(response.status).toBe(200)
      expect(corpo.protocolos.map(item => item.protocolo)).toEqual([
        PROTOCOLO_DONO_SGRC,
        PROTOCOLO_DONO_CONCLUIDO_SGRC,
      ])
    })
  })
})
