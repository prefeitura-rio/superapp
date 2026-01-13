import { http, HttpResponse } from 'msw'
import { describe, expect, test } from 'vitest'
import { server } from '@/test/mocks/server'
import { TEST_ENV } from '@/test/mocks/env'
import { submitCourseInscription } from '../submit-inscription'

const COURSES_BASE_URL = TEST_ENV.NEXT_PUBLIC_COURSES_BASE_API_URL

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
        http.post(
          `${COURSES_BASE_URL}/api/v1/courses/:id/enrollments`,
          () => {
            return HttpResponse.json(
              { message: 'Usuário já inscrito neste curso' },
              { status: 409 }
            )
          }
        )
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
        http.post(
          `${COURSES_BASE_URL}/api/v1/courses/:id/enrollments`,
          () => {
            return HttpResponse.json(
              { message: 'Dados inválidos' },
              { status: 400 }
            )
          }
        )
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

    test('returns generic error for network failure', async () => {
      server.use(
        http.post(
          `${COURSES_BASE_URL}/api/v1/courses/:id/enrollments`,
          () => {
            return HttpResponse.error()
          }
        )
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
})
