import { TEST_ENV } from '@/test/mocks/env'
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { customFetch } from '../../custom-fetch-course'

const COURSES = TEST_ENV.COURSES_BASE_API_URL
const TOKEN = 'mock-access-token'
// CPF sintético, usado só para conferir que não vaza nos logs
const CPF = '00000000191'
const CURRICULO_PATH = `/api/v1/empregabilidade/curriculo/${CPF}`
const RESPOSTA_PESSOAL = {
  cpf: CPF,
  nome: 'Cidadã Sintética',
  formacoes: [{ curso: 'Formação sintética' }],
}
const CORPO_ENVIADO = JSON.stringify({ cpf: CPF, telefone: '21900000000' })

type ConsoleMethod = 'log' | 'info' | 'warn' | 'error' | 'debug'
const CONSOLE_METHODS: ConsoleMethod[] = [
  'log',
  'info',
  'warn',
  'error',
  'debug',
]

const spies: ReturnType<typeof vi.spyOn>[] = []

function loggedText(): string {
  return spies
    .flatMap(spy => spy.mock.calls)
    .map(args =>
      args
        .map(arg => {
          if (typeof arg === 'string') return arg
          try {
            return JSON.stringify(arg)
          } catch {
            return String(arg)
          }
        })
        .join(' ')
    )
    .join('\n')
}

function expectNoSensitiveData(): void {
  const text = loggedText()
  expect(text).not.toContain(TOKEN)
  expect(text).not.toContain('Bearer')
  expect(text).not.toContain('uthorization')
  expect(text).not.toContain(CPF)
  expect(text).not.toContain('Cidadã Sintética')
  expect(text).not.toContain('21900000000')
}

describe('customFetch (cursos/empregabilidade)', () => {
  beforeEach(() => {
    for (const method of CONSOLE_METHODS) {
      spies.push(vi.spyOn(console, method).mockImplementation(() => {}))
    }
  })

  afterEach(() => {
    for (const spy of spies) spy.mockRestore()
    spies.length = 0
  })

  test('não loga token, headers, corpo enviado nem corpo da resposta em sucesso', async () => {
    server.use(
      http.put(`${COURSES}${CURRICULO_PATH}`, () =>
        HttpResponse.json(RESPOSTA_PESSOAL, { status: 200 })
      )
    )

    await customFetch(CURRICULO_PATH, {
      method: 'PUT',
      body: CORPO_ENVIADO,
    })

    expectNoSensitiveData()
  })

  test('não loga token, CPF do caminho nem corpo da resposta em erro', async () => {
    server.use(
      http.get(`${COURSES}${CURRICULO_PATH}`, () =>
        HttpResponse.json(
          { error: 'não encontrado', cpf: CPF },
          { status: 404 }
        )
      )
    )

    const response = await customFetch<{ status: number }>(CURRICULO_PATH, {
      method: 'GET',
    })

    expect(response.status).toBe(404)
    expectNoSensitiveData()
  })

  test('continua enviando o token do cidadão como Bearer', async () => {
    let authorization: string | null = null
    server.use(
      http.get(`${COURSES}${CURRICULO_PATH}`, ({ request }) => {
        authorization = request.headers.get('authorization')
        return HttpResponse.json(RESPOSTA_PESSOAL, { status: 200 })
      })
    )

    await customFetch(CURRICULO_PATH, { method: 'GET' })

    expect(authorization).toBe(`Bearer ${TOKEN}`)
  })

  test('devolve status e dados no formato que o client gerado espera', async () => {
    server.use(
      http.get(`${COURSES}${CURRICULO_PATH}`, () =>
        HttpResponse.json(RESPOSTA_PESSOAL, { status: 200 })
      )
    )

    const response = await customFetch<{ status: number; data: unknown }>(
      CURRICULO_PATH,
      { method: 'GET' }
    )

    expect(response.status).toBe(200)
    expect(response.data).toEqual(RESPOSTA_PESSOAL)
  })
})
