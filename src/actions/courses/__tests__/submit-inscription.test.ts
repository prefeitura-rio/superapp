import { TEST_ENV } from '@/test/mocks/env'
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'
import {
  type MockInstance,
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from 'vitest'
import { submitCourseInscription } from '../submit-inscription'

const COURSES_BASE_URL = TEST_ENV.COURSES_BASE_API_URL

describe('submitCourseInscription', () => {
  const baseUserInfo = {
    cpf: '12345678901',
    name: 'Test User',
    email: 'test@example.com',
    phone: '21999999999',
  }

  describe('success scenarios', () => {
    test('returns success with enrollment data for status 201', async () => {
      const data = {
        courseId: '123',
        userInfo: baseUserInfo,
        reason: 'Interesse em aprender',
      }

      const result = await submitCourseInscription(data)

      expect(result).toMatchObject({
        success: true,
        data: { id: 'enrollment-123', status: 'enrolled' },
      })
    })

    test('includes unit and schedule for presencial course', async () => {
      let capturedPayload: Record<string, unknown> | null = null

      server.use(
        http.post(
          `${COURSES_BASE_URL}/api/v1/courses/:id/enrollments`,
          async ({ request }) => {
            capturedPayload = (await request.json()) as Record<string, unknown>
            return HttpResponse.json(
              { id: 'enrollment-456', status: 'enrolled' },
              { status: 201 }
            )
          }
        )
      )

      const enrolledUnit = {
        id: 'unit-1',
        curso_id: 123,
        address: 'Rua Teste, 100',
        neighborhood: 'Centro',
        schedules: [
          {
            id: 'schedule-1',
            vacancies: 10,
            class_start_date: '2025-02-01',
            class_end_date: '2025-06-01',
            class_time: '09:00-12:00',
            class_days: 'Seg, Qua, Sex',
            created_at: '2025-01-01T00:00:00Z',
            updated_at: '2025-01-01T00:00:00Z',
          },
        ],
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      }

      const data = {
        courseId: '123',
        userInfo: baseUserInfo,
        unitId: 'unit-1',
        scheduleId: 'schedule-1',
        enrolledUnit,
        reason: 'Interesse em aprender',
      }

      const result = await submitCourseInscription(data)

      expect(result.success).toBe(true)
      expect(capturedPayload).toMatchObject({
        schedule_id: 'schedule-1',
        enrolled_unit: enrolledUnit,
      })
    })

    test('omits unit and schedule for online course', async () => {
      let capturedPayload: Record<string, unknown> | null = null

      server.use(
        http.post(
          `${COURSES_BASE_URL}/api/v1/courses/:id/enrollments`,
          async ({ request }) => {
            capturedPayload = (await request.json()) as Record<string, unknown>
            return HttpResponse.json(
              { id: 'enrollment-789', status: 'enrolled' },
              { status: 201 }
            )
          }
        )
      )

      const data = {
        courseId: '456',
        userInfo: baseUserInfo,
        reason: 'Curso online gratuito',
      }

      const result = await submitCourseInscription(data)

      expect(result.success).toBe(true)
      expect(capturedPayload).not.toHaveProperty('schedule_id')
      expect(capturedPayload).not.toHaveProperty('enrolled_unit')
    })
  })

  describe('error scenarios', () => {
    test('returns error for duplicate enrollment (status 409)', async () => {
      server.use(
        http.post(`${COURSES_BASE_URL}/api/v1/courses/:id/enrollments`, () => {
          return HttpResponse.json(
            { message: 'Usuário já inscrito neste curso' },
            { status: 409 }
          )
        })
      )

      const data = {
        courseId: '123',
        userInfo: baseUserInfo,
        reason: 'Tentativa duplicada',
      }

      const result = await submitCourseInscription(data)

      expect(result).toEqual({
        success: false,
        error: 'Usuário já inscrito neste curso',
      })
    })

    test('returns error for API failure (status 400)', async () => {
      server.use(
        http.post(`${COURSES_BASE_URL}/api/v1/courses/:id/enrollments`, () => {
          return HttpResponse.json(
            { message: 'Dados inválidos' },
            { status: 400 }
          )
        })
      )

      const data = {
        courseId: '123',
        userInfo: baseUserInfo,
        reason: '',
      }

      const result = await submitCourseInscription(data)

      expect(result).toEqual({
        success: false,
        error: 'Dados inválidos',
      })
    })

    // A API de cursos reporta regra de negócio no campo `error`, não em
    // `message`. Ler apenas `message` reduzia toda recusa ao texto genérico, e
    // o cidadão não descobria que a turma estava fora do período de inscrição.
    test('surfaces the reason from the API `error` field (status 500)', async () => {
      server.use(
        http.post(`${COURSES_BASE_URL}/api/v1/courses/:id/enrollments`, () => {
          return HttpResponse.json(
            { error: 'as inscrições desta turma já encerraram' },
            { status: 500 }
          )
        })
      )

      const result = await submitCourseInscription({
        courseId: '123',
        userInfo: baseUserInfo,
        scheduleId: 'turma-encerrada',
        reason: 'Turma fora da vigência',
      })

      expect(result).toEqual({
        success: false,
        error: 'as inscrições desta turma já encerraram',
      })
    })

    test('surfaces the reason from the API `error` field (status 400)', async () => {
      server.use(
        http.post(`${COURSES_BASE_URL}/api/v1/courses/:id/enrollments`, () => {
          return HttpResponse.json(
            { error: 'as inscrições desta turma ainda não iniciaram' },
            { status: 400 }
          )
        })
      )

      const result = await submitCourseInscription({
        courseId: '123',
        userInfo: baseUserInfo,
        scheduleId: 'turma-futura',
        reason: 'Turma ainda não aberta',
      })

      expect(result).toEqual({
        success: false,
        error: 'as inscrições desta turma ainda não iniciaram',
      })
    })

    test('falls back to the generic message when the body carries no reason', async () => {
      server.use(
        http.post(`${COURSES_BASE_URL}/api/v1/courses/:id/enrollments`, () => {
          return HttpResponse.json({ success: false }, { status: 500 })
        })
      )

      const result = await submitCourseInscription({
        courseId: '123',
        userInfo: baseUserInfo,
        reason: 'Sem motivo no corpo',
      })

      expect(result).toEqual({
        success: false,
        error: 'Erro ao inscrever-se no curso',
      })
    })

    test('returns generic error for network failure', async () => {
      server.use(
        http.post(`${COURSES_BASE_URL}/api/v1/courses/:id/enrollments`, () => {
          return HttpResponse.error()
        })
      )

      const data = {
        courseId: '123',
        userInfo: baseUserInfo,
        reason: 'Teste de erro',
      }

      const result = await submitCourseInscription(data)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  // LGPD: a inscrição carrega CPF, nome, e-mail, telefone, idade e respostas
  // do cidadão. Nada disso pode chegar ao log do servidor, em nenhum caminho.
  describe('logs sem dados pessoais', () => {
    // Dados sintéticos, usados só para conferir que não vazam nos logs
    const CPF = '00000000191'
    const NOME = 'Cidadã Sintética'
    const EMAIL = 'cidada.sintetica@example.com'
    const TELEFONE = '21900000000'
    const RESPOSTA_CUSTOM = 'Resposta sintética pessoal'
    const pessoal = {
      cpf: CPF,
      name: NOME,
      email: EMAIL,
      phone: TELEFONE,
      birthDate: '1990-05-17',
    }
    const customFields = [
      { id: 'campo-1', title: 'Pergunta', value: RESPOSTA_CUSTOM },
    ] as unknown as Parameters<
      typeof submitCourseInscription
    >[0]['customFields']

    type ConsoleMethod = 'log' | 'info' | 'warn' | 'error' | 'debug'
    const CONSOLE_METHODS: ConsoleMethod[] = [
      'log',
      'info',
      'warn',
      'error',
      'debug',
    ]
    const spies: MockInstance<(...args: unknown[]) => void>[] = []

    function loggedText(): string {
      return spies
        .flatMap(spy => spy.mock.calls)
        .map(args =>
          args
            .map((arg: unknown) => {
              if (typeof arg === 'string') return arg
              if (arg instanceof Error) {
                return `${arg.name} ${arg.message} ${arg.stack ?? ''}`
              }
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

    function expectNoPersonalData(): void {
      const text = loggedText()
      expect(text).not.toContain(CPF)
      expect(text).not.toContain(NOME)
      expect(text).not.toContain(EMAIL)
      expect(text).not.toContain(TELEFONE)
      expect(text).not.toContain(RESPOSTA_CUSTOM)
      expect(text).not.toContain('1990-05-17')
    }

    function inscricao() {
      return {
        courseId: '123',
        userInfo: pessoal,
        customFields,
        reason: 'Motivo sintético',
      }
    }

    beforeEach(() => {
      for (const method of CONSOLE_METHODS) {
        spies.push(vi.spyOn(console, method).mockImplementation(() => {}))
      }
    })

    afterEach(() => {
      for (const spy of spies) spy.mockRestore()
      spies.length = 0
    })

    test('não loga payload nem resposta da API em sucesso (201)', async () => {
      server.use(
        http.post(
          `${COURSES_BASE_URL}/api/v1/courses/:id/enrollments`,
          async ({ request }) => {
            // A API devolve a inscrição com os dados pessoais
            const body = (await request.json()) as Record<string, unknown>
            return HttpResponse.json(body, { status: 201 })
          }
        )
      )

      const result = await submitCourseInscription(inscricao())

      expect(result.success).toBe(true)
      expectNoPersonalData()
      // Continua registrando a inscrição, só com identificadores não pessoais
      expect(loggedText()).toContain('123')
    })

    test('não loga dados pessoais quando a API recusa (400)', async () => {
      server.use(
        http.post(`${COURSES_BASE_URL}/api/v1/courses/:id/enrollments`, () =>
          HttpResponse.json(
            { error: `CPF ${CPF} já inscrito (${EMAIL})` },
            { status: 400 }
          )
        )
      )

      const result = await submitCourseInscription(inscricao())

      expect(result.success).toBe(false)
      expectNoPersonalData()
      expect(loggedText()).toContain('400')
    })

    test('não loga dados pessoais em falha de rede', async () => {
      server.use(
        http.post(`${COURSES_BASE_URL}/api/v1/courses/:id/enrollments`, () =>
          HttpResponse.error()
        )
      )

      const result = await submitCourseInscription(inscricao())

      expect(result.success).toBe(false)
      expectNoPersonalData()
    })

    test('não loga o CPF quando a revalidação do cache falha', async () => {
      const { revalidateTag } = await import('next/cache')
      vi.mocked(revalidateTag).mockImplementationOnce(tag => {
        throw new Error(`falha ao revalidar ${tag}`)
      })

      const result = await submitCourseInscription(inscricao())

      expect(result.success).toBe(false)
      expectNoPersonalData()
    })
  })
})
