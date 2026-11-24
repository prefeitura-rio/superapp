// @vitest-environment node
import { GET as getChamadoPublicoRoute } from '@/app/api/chamados-publico/[protocolo]/route'
import { GET as getChamadoDetailRoute } from '@/app/api/chamados/[protocolo]/route'
import { GET as listChamadosRoute } from '@/app/api/chamados/route'
import { TEST_ENV } from '@/test/mocks/env'
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

function jwt(claims: Record<string, unknown>): string {
  const parte = (valor: object) =>
    Buffer.from(JSON.stringify(valor)).toString('base64url')
  return `${parte({ alg: 'none', typ: 'JWT' })}.${parte(claims)}.assinatura`
}

const CPF = '12345678901'
const TOKEN = jwt({ cpf: CPF, name: 'Cidadã Sintética' })

const sessao = vi.hoisted(() => ({ token: null as string | null }))

vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) =>
      name === 'access_token' && sessao.token
        ? { value: sessao.token }
        : undefined,
  }),
}))

// O setup global devolve sempre um CPF; aqui o CPF sai do cookie de verdade.
vi.mock('@/lib/user-info', async () => await vi.importActual('@/lib/user-info'))

const RMI = `${TEST_ENV.BASE_API_URL_RMI}/v1`
const CIDADAO = TEST_ENV.BASE_API_URL_PREF_RIO_CIDADAO
const PUBLICO = TEST_ENV.BASE_API_URL_PREF_RIO_CHAMADOS_PUBLICO
const PROTOCOLO = 'RIO-48291037-6'
const ERRO_LISTA = { error: 'Não foi possível consultar os chamados' }
const ERRO_DETALHE = { error: 'Não foi possível consultar o chamado' }
const NAO_ENCONTRADO = { error: 'Chamado não encontrado' }

const CHAMADO_TITULAR = {
  id_chamado: '17469001',
  protocolos: [PROTOCOLO],
  categoria: 'Reclamação',
  tipo: 'Iluminação pública',
  subtipo: 'Lâmpada queimada',
  status: 'Em andamento',
  data_inicio: '2026-09-12T11:20:00Z',
  descricao: 'Poste apagado em frente ao número 180',
  logradouro: 'Rua Voluntários da Pátria',
  bairro: 'Botafogo',
  loaded_at: '2026-10-30T14:00:00Z',
  titular: true,
  andamentos: [
    {
      data: '2026-09-12T11:20:00Z',
      tipo: 'Solicitação recebida',
      descricao: 'Chamado registrado.',
    },
  ],
}

function listar(query = 'origem=sgrc') {
  return listChamadosRoute(
    new Request(`http://localhost/api/chamados?${query}`)
  )
}

function detalhe(protocolo: string) {
  return getChamadoDetailRoute(
    new Request(`http://localhost/api/chamados/${protocolo}`),
    { params: Promise.resolve({ protocolo }) }
  )
}

function consultaPublica(protocolo: string) {
  return getChamadoPublicoRoute(
    new Request(`http://localhost/api/chamados-publico/${protocolo}`),
    { params: Promise.resolve({ protocolo }) }
  )
}

function semVazamento(corpo: string) {
  expect(corpo).not.toContain('maintenance request')
  expect(corpo).not.toContain('ext_authz')
  expect(corpo).not.toContain('invalid protocolo')
  expect(corpo).not.toContain(CPF)
}

beforeEach(() => {
  vi.stubEnv('FEATURE_SALESFORCE', 'true')
  vi.stubEnv('FEATURE_SGRC_HISTORICO', 'true')
  sessao.token = TOKEN
})

afterEach(() => {
  vi.unstubAllEnvs()
  sessao.token = null
})

describe('GET /api/chamados?origem=sgrc (histórico do 1746 no RMI)', () => {
  test('com a flag do Salesforce desligada responde 404 sem chamar o RMI', async () => {
    vi.stubEnv('FEATURE_SALESFORCE', 'false')
    const upstream = vi.fn(() => HttpResponse.json({ data: [] }))
    server.use(http.get(`${RMI}/citizen/:cpf/maintenance-request`, upstream))

    const response = await listar()

    expect(response.status).toBe(404)
    expect(upstream).not.toHaveBeenCalled()
  })

  test.each([
    ['sem sessão', null],
    ['token sem CPF', jwt({ name: 'Sem CPF' })],
    ['token que não é JWT', 'token-sintetico'],
  ])('%s responde 401 sem chamar o RMI', async (_caso, token) => {
    sessao.token = token
    const upstream = vi.fn(() => HttpResponse.json({ data: [] }))
    server.use(http.get(`${RMI}/citizen/:cpf/maintenance-request`, upstream))

    const response = await listar()

    expect(response.status).toBe(401)
    expect(response.headers.get('Cache-Control')).toBe('private, no-store')
    expect(upstream).not.toHaveBeenCalled()
  })

  test('busca a página pedida com o CPF da sessão e devolve só o necessário', async () => {
    let pedido: Request | undefined
    server.use(
      http.get(`${RMI}/citizen/:cpf/maintenance-request`, ({ request }) => {
        pedido = request
        return HttpResponse.json({
          data: [
            {
              ...CHAMADO_TITULAR,
              cpf: CPF,
              protocolo: PROTOCOLO,
              endereco: 'Rua Voluntários da Pátria, 180',
            },
          ],
          pagination: { page: 2, per_page: 10, total: 11, total_pages: 2 },
        })
      })
    )

    const response = await listar('origem=sgrc&page=2')
    const corpo = await response.json()

    expect(response.status).toBe(200)
    expect(response.headers.get('Cache-Control')).toBe('private, no-store')
    const url = new URL(pedido?.url ?? '')
    expect(url.pathname).toBe(`/v1/citizen/${CPF}/maintenance-request`)
    expect(url.searchParams.get('page')).toBe('2')
    expect(url.searchParams.get('per_page')).toBe('10')
    expect(pedido?.headers.get('Authorization')).toBe(`Bearer ${TOKEN}`)

    expect(corpo.pagination).toEqual({
      page: 2,
      perPage: 10,
      total: 11,
      totalPages: 2,
    })
    expect(corpo.protocolos[0].protocolo).toBe(PROTOCOLO)
    expect(corpo.protocolos[0].ordens_de_servico[0]).toMatchObject({
      codigoOs: '17469001',
      servico: 'Lâmpada queimada',
      status: 'Em andamento',
    })
    const json = JSON.stringify(corpo)
    expect(json).not.toContain(CPF)
    expect(json).not.toContain('Poste apagado')
    expect(json).not.toContain('Voluntários')
  })

  test('page inválido vira página 1', async () => {
    let page: string | null = null
    server.use(
      http.get(`${RMI}/citizen/:cpf/maintenance-request`, ({ request }) => {
        page = new URL(request.url).searchParams.get('page')
        return HttpResponse.json({ data: [] })
      })
    )

    await listar('origem=sgrc&page=../../admin')

    expect(page).toBe('1')
  })

  test.each([400, 401, 403, 429, 500, 503])(
    '%i do RMI mantém o status sem repassar o corpo',
    async status => {
      server.use(
        http.get(`${RMI}/citizen/:cpf/maintenance-request`, () =>
          HttpResponse.json(
            { error: 'denied by ext_authz: maintenance request' },
            { status }
          )
        )
      )

      const response = await listar()
      const corpo = JSON.stringify(await response.json())

      expect(response.status).toBe(status)
      expect(response.headers.get('Cache-Control')).toBe('private, no-store')
      expect(JSON.parse(corpo)).toEqual(ERRO_LISTA)
      semVazamento(corpo)
    }
  )

  test('corpo 200 que não é JSON vira 502 genérico', async () => {
    server.use(
      http.get(
        `${RMI}/citizen/:cpf/maintenance-request`,
        () =>
          new HttpResponse('<html>gateway</html>', {
            status: 200,
            headers: { 'Content-Type': 'text/html' },
          })
      )
    )

    const response = await listar()

    expect(response.status).toBe(502)
    expect(await response.json()).toEqual(ERRO_LISTA)
  })

  test('falha de rede vira 502 genérico', async () => {
    server.use(
      http.get(`${RMI}/citizen/:cpf/maintenance-request`, () =>
        HttpResponse.error()
      )
    )
    const erro = vi.spyOn(console, 'error').mockImplementation(() => {})

    const response = await listar()

    expect(response.status).toBe(502)
    expect(await response.json()).toEqual(ERRO_LISTA)
    expect(JSON.stringify(erro.mock.calls)).not.toContain(CPF)
    erro.mockRestore()
  })
})

describe('GET /api/chamados/[protocolo] com protocolo SGRC (titular)', () => {
  test('sem sessão responde 401 sem chamar o RMI', async () => {
    sessao.token = null
    const upstream = vi.fn(() => HttpResponse.json({ chamados: [] }))
    server.use(http.get(`${RMI}/maintenance-request/:protocolo`, upstream))

    const response = await detalhe(PROTOCOLO)

    expect(response.status).toBe(401)
    expect(upstream).not.toHaveBeenCalled()
  })

  test('o titular recebe rua, descrição e andamentos', async () => {
    let pedido: Request | undefined
    server.use(
      http.get(`${RMI}/maintenance-request/:protocolo`, ({ request }) => {
        pedido = request
        return HttpResponse.json({
          protocolo: PROTOCOLO,
          chamados: [CHAMADO_TITULAR],
        })
      })
    )

    const response = await detalhe(PROTOCOLO.toLowerCase())
    const corpo = await response.json()

    expect(response.status).toBe(200)
    expect(response.headers.get('Cache-Control')).toBe('private, no-store')
    expect(new URL(pedido?.url ?? '').pathname).toBe(
      `/v1/maintenance-request/${PROTOCOLO}`
    )
    expect(pedido?.headers.get('Authorization')).toBe(`Bearer ${TOKEN}`)
    expect(corpo.protocolo).toBe(PROTOCOLO)
    expect(corpo.loaded_at).toBe('2026-10-30T14:00:00Z')
    expect(corpo.ordens_de_servico[0]).toMatchObject({
      codigoOs: '17469001',
      descricao: 'Poste apagado em frente ao número 180',
      endereco: { logradouro: 'Rua Voluntários da Pátria', bairro: 'Botafogo' },
    })
    expect(corpo.ordens_de_servico[0].andamentos).toHaveLength(1)
  })

  test('protocolo sem chamado do titular responde 404 (a página cai na consulta pública)', async () => {
    server.use(
      http.get(`${RMI}/maintenance-request/:protocolo`, () =>
        HttpResponse.json({
          protocolo: PROTOCOLO,
          chamados: [{ ...CHAMADO_TITULAR, titular: false }],
        })
      )
    )

    const response = await detalhe(PROTOCOLO)

    expect(response.status).toBe(404)
    expect(await response.json()).toEqual(NAO_ENCONTRADO)
  })

  test.each([
    [404, 404, NAO_ENCONTRADO],
    [400, 404, NAO_ENCONTRADO],
    [500, 500, ERRO_DETALHE],
  ])('%i do RMI vira %i genérico', async (upstream, esperado, corpo) => {
    server.use(
      http.get(`${RMI}/maintenance-request/:protocolo`, () =>
        HttpResponse.json(
          { error: 'maintenance request not found' },
          { status: upstream }
        )
      )
    )

    const response = await detalhe(PROTOCOLO)
    const texto = JSON.stringify(await response.json())

    expect(response.status).toBe(esperado)
    expect(JSON.parse(texto)).toEqual(corpo)
    semVazamento(texto)
  })

  test('protocolo do Salesforce continua no Mule e nunca vai ao RMI', async () => {
    const rmi = vi.fn(() => HttpResponse.json({ chamados: [] }))
    const mule = vi.fn(() =>
      HttpResponse.json({ protocolo: 'RIO-2026-00000001' })
    )
    server.use(
      http.get(`${RMI}/maintenance-request/:protocolo`, rmi),
      http.get(`${CIDADAO}chamados/RIO-2026-00000001`, mule)
    )

    const response = await detalhe('RIO-2026-00000001')

    expect(response.status).toBe(200)
    expect(mule).toHaveBeenCalledTimes(1)
    expect(rmi).not.toHaveBeenCalled()
  })
})

describe('GET /api/chamados-publico/[protocolo] com protocolo SGRC', () => {
  test('anônimo vê todos os chamados, só com bairro e último andamento', async () => {
    sessao.token = null
    let pedido: Request | undefined
    server.use(
      http.get(`${RMI}/maintenance-request/:protocolo`, ({ request }) => {
        pedido = request
        return HttpResponse.json({
          protocolo: PROTOCOLO,
          chamados: [{ ...CHAMADO_TITULAR, titular: false }],
        })
      })
    )

    const response = await consultaPublica(PROTOCOLO)
    const corpo = await response.json()

    expect(response.status).toBe(200)
    expect(response.headers.get('Cache-Control')).toBe('private, no-store')
    expect(pedido?.headers.get('Authorization')).toBeNull()
    expect(corpo.ordens_de_servico[0]).toMatchObject({
      codigoOs: '17469001',
      endereco: { bairro: 'Botafogo' },
      ultimoAndamento: { evento: 'Solicitação recebida' },
    })
  })

  test('mesmo com o titular logado, rua e descrição não saem da rota pública', async () => {
    server.use(
      http.get(`${RMI}/maintenance-request/:protocolo`, () =>
        HttpResponse.json({ protocolo: PROTOCOLO, chamados: [CHAMADO_TITULAR] })
      )
    )

    const response = await consultaPublica(PROTOCOLO)
    const json = JSON.stringify(await response.json())

    expect(response.status).toBe(200)
    expect(json).not.toContain('Voluntários')
    expect(json).not.toContain('Poste apagado')
  })

  test('404 do RMI vira "Chamado não encontrado"', async () => {
    server.use(
      http.get(`${RMI}/maintenance-request/:protocolo`, () =>
        HttpResponse.json(
          { error: 'maintenance request not found' },
          { status: 404 }
        )
      )
    )

    const response = await consultaPublica(PROTOCOLO)

    expect(response.status).toBe(404)
    expect(await response.json()).toEqual(NAO_ENCONTRADO)
  })

  test.each(['RIO-2026-00000001', '..%2F..%2Fhealth', '../../health'])(
    '%j nunca chega ao RMI',
    async protocolo => {
      const rmi = vi.fn(() => HttpResponse.json({ chamados: [] }))
      server.use(
        http.get(`${TEST_ENV.BASE_API_URL_RMI}/*`, rmi),
        http.get(`${PUBLICO}*`, () =>
          HttpResponse.json({ error: 'not found' }, { status: 404 })
        )
      )

      await consultaPublica(protocolo)

      expect(rmi).not.toHaveBeenCalled()
    }
  )
})

describe.each([
  ['ausente', undefined],
  ['"false"', 'false'],
])(
  'FEATURE_SGRC_HISTORICO %s (produção até o histórico ficar pronto)',
  (_caso, valor) => {
    beforeEach(() => {
      vi.stubEnv('FEATURE_SGRC_HISTORICO', valor)
    })

    function rmiNuncaChamado() {
      const rmi = vi.fn(() => HttpResponse.json({ data: [], chamados: [] }))
      server.use(http.get(`${TEST_ENV.BASE_API_URL_RMI}/*`, rmi))
      return rmi
    }

    test('a lista SGRC responde 404 sem chamar o RMI', async () => {
      const rmi = rmiNuncaChamado()

      const response = await listar()

      expect(response.status).toBe(404)
      expect(rmi).not.toHaveBeenCalled()
    })

    test('a lista SGRC responde 404 também sem sessão (a superfície não existe)', async () => {
      sessao.token = null
      const rmi = rmiNuncaChamado()

      const response = await listar()

      expect(response.status).toBe(404)
      expect(rmi).not.toHaveBeenCalled()
    })

    test.each([
      ['detalhe do titular', detalhe],
      ['consulta pública', consultaPublica],
    ])(
      '%s de protocolo SGRC responde 404 sem chamar o RMI nem o Mule',
      async (_rota, rota) => {
        const rmi = rmiNuncaChamado()
        const mule = vi.fn(() => HttpResponse.json({}))
        server.use(http.get(`${CIDADAO}*`, mule), http.get(`${PUBLICO}*`, mule))

        const response = await rota(PROTOCOLO)

        expect(response.status).toBe(404)
        expect(rmi).not.toHaveBeenCalled()
        expect(mule).not.toHaveBeenCalled()
      }
    )

    test('protocolo do Salesforce continua no Mule', async () => {
      const rmi = rmiNuncaChamado()
      const mule = vi.fn(() =>
        HttpResponse.json({ protocolo: 'RIO-2026-00000001' })
      )
      server.use(http.get(`${PUBLICO}chamados/RIO-2026-00000001`, mule))

      const response = await consultaPublica('RIO-2026-00000001')

      expect(response.status).toBe(200)
      expect(mule).toHaveBeenCalledTimes(1)
      expect(rmi).not.toHaveBeenCalled()
    })

    test('a lista do Salesforce (sem origem) continua funcionando', async () => {
      const rmi = rmiNuncaChamado()
      server.use(
        http.get(`${CIDADAO}chamados`, () =>
          HttpResponse.json({ protocolos: [] })
        )
      )

      const response = await listar('')

      expect(response.status).toBe(200)
      expect(await response.json()).toEqual({ protocolos: [] })
      expect(rmi).not.toHaveBeenCalled()
    })
  }
)
