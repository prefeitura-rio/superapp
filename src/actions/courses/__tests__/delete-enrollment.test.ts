import { getUserInfoFromToken } from '@/lib/user-info'
import { TEST_ENV } from '@/test/mocks/env'
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { deleteEnrollment } from '../delete-enrollment'

const COURSES_BASE_URL = TEST_ENV.COURSES_BASE_API_URL

// DELETE /api/v1/courses/:courseId/enrollments/:enrollmentId
const deleteUrl = `${COURSES_BASE_URL}/api/v1/courses/:courseId/enrollments/:enrollmentId`

describe('deleteEnrollment', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  test('retorna sucesso quando a API responde 200', async () => {
    let hit = false
    server.use(
      http.delete(deleteUrl, () => {
        hit = true
        return HttpResponse.json({ message: 'ok' }, { status: 200 })
      })
    )

    const result = await deleteEnrollment(123, 'enrollment-1')

    expect(result).toEqual({ success: true })
    expect(hit).toBe(true)
  })

  test('retorna erro quando usuário não está autenticado', async () => {
    vi.mocked(getUserInfoFromToken).mockResolvedValueOnce({ cpf: '', name: '' })

    const result = await deleteEnrollment(123, 'enrollment-1')

    expect(result).toEqual({ success: false, error: 'User not authenticated' })
  })

  test('retorna erro de cancelamento quando a API responde 404', async () => {
    server.use(
      http.delete(deleteUrl, () => HttpResponse.json({}, { status: 404 }))
    )

    const result = await deleteEnrollment(123, 'enrollment-inexistente')

    expect(result).toEqual({
      success: false,
      error: 'Erro ao cancelar inscrição',
    })
  })

  test('retorna erro de cancelamento quando a API responde 500', async () => {
    server.use(
      http.delete(deleteUrl, () => HttpResponse.json({}, { status: 500 }))
    )

    const result = await deleteEnrollment(123, 'enrollment-1')

    expect(result).toEqual({
      success: false,
      error: 'Erro ao cancelar inscrição',
    })
  })

  test('retorna erro genérico em falha de rede', async () => {
    server.use(http.delete(deleteUrl, () => HttpResponse.error()))

    const result = await deleteEnrollment(123, 'enrollment-1')

    expect(result).toEqual({
      success: false,
      error: 'Erro ao cancelar inscrição',
    })
  })
})
