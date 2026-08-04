import { getUserInfoFromToken } from '@/lib/user-info'
import { TEST_ENV } from '@/test/mocks/env'
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { changeSchedule } from '../change-schedule'

const COURSES_BASE_URL = TEST_ENV.COURSES_BASE_API_URL

// PUT /api/v1/enrollments/:enrollmentId/schedule
const scheduleUrl = `${COURSES_BASE_URL}/api/v1/enrollments/:enrollmentId/schedule`

const baseParams = {
  enrollmentId: 'enrollment-1',
  courseId: 123,
  scheduleId: 'schedule-2',
  enrolledUnit: {
    id: 'unit-1',
    curso_id: 123,
    address: 'Rua Teste, 100',
    neighborhood: 'Centro',
    neighborhood_zone: 'centro',
    schedules: [
      {
        id: 'schedule-2',
        location_id: 'loc-1',
        vacancies: 10,
        class_start_date: '2026-03-01',
        class_end_date: '2026-06-01',
        class_time: '09:00-12:00',
        class_days: 'Seg, Qua, Sex',
        remaining_vacancies: 5,
      },
    ],
  },
}

describe('changeSchedule', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  test('retorna sucesso quando a API responde 200', async () => {
    let capturedPayload: Record<string, unknown> | null = null

    server.use(
      http.put(scheduleUrl, async ({ request }) => {
        capturedPayload = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({ id: 'enrollment-1' }, { status: 200 })
      })
    )

    const result = await changeSchedule(baseParams)

    expect(result).toEqual({ success: true })
    expect(capturedPayload).toMatchObject({
      schedule_id: 'schedule-2',
      enrolled_unit: {
        id: 'unit-1',
        curso_id: 123,
      },
    })
  })

  test('retorna erro quando usuário não está autenticado', async () => {
    vi.mocked(getUserInfoFromToken).mockResolvedValueOnce({ cpf: '', name: '' })

    const result = await changeSchedule(baseParams)

    expect(result).toEqual({ success: false, error: 'Usuário não autenticado' })
  })

  test('retorna a mensagem da API em erro 400', async () => {
    server.use(
      http.put(scheduleUrl, () =>
        HttpResponse.json(
          { message: 'Prazo mínimo de 72h não respeitado' },
          { status: 400 }
        )
      )
    )

    const result = await changeSchedule(baseParams)

    expect(result).toEqual({
      success: false,
      error: 'Prazo mínimo de 72h não respeitado',
    })
  })

  test('usa "Dados inválidos" quando 400 não traz mensagem', async () => {
    server.use(
      http.put(scheduleUrl, () => HttpResponse.json({}, { status: 400 }))
    )

    const result = await changeSchedule(baseParams)

    expect(result).toEqual({ success: false, error: 'Dados inválidos' })
  })

  test('mapeia 403 para mensagem de permissão', async () => {
    server.use(
      http.put(scheduleUrl, () => HttpResponse.json({}, { status: 403 }))
    )

    const result = await changeSchedule(baseParams)

    expect(result).toEqual({
      success: false,
      error: 'Você não tem permissão para esta ação',
    })
  })

  test('mapeia 404 para inscrição/turma não encontrada', async () => {
    server.use(
      http.put(scheduleUrl, () => HttpResponse.json({}, { status: 404 }))
    )

    const result = await changeSchedule(baseParams)

    expect(result).toEqual({
      success: false,
      error: 'Inscrição ou turma não encontrada',
    })
  })

  test('mapeia 500 para erro interno', async () => {
    server.use(
      http.put(scheduleUrl, () => HttpResponse.json({}, { status: 500 }))
    )

    const result = await changeSchedule(baseParams)

    expect(result).toEqual({
      success: false,
      error: 'Erro interno. Tente novamente.',
    })
  })

  test('retorna erro em falha de rede', async () => {
    server.use(http.put(scheduleUrl, () => HttpResponse.error()))

    const result = await changeSchedule(baseParams)

    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })
})
