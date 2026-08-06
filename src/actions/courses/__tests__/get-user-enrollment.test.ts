import { getUserInfoFromToken } from '@/lib/user-info'
import { TEST_ENV } from '@/test/mocks/env'
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { getUserEnrollment } from '../get-user-enrollment'

const COURSES_BASE_URL = TEST_ENV.COURSES_BASE_API_URL

// GET /api/v1/courses/:courseId/enrollments?search=<cpf>&limit=1
const enrollmentsUrl = `${COURSES_BASE_URL}/api/v1/courses/:courseId/enrollments`

// setup.ts mocks getUserInfoFromToken to return cpf '12345678901'
const MOCK_CPF = '12345678901'

describe('getUserEnrollment', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  test('retorna a inscrição do usuário quando o CPF bate', async () => {
    const userEnrollment = {
      id: 'enrollment-1',
      cpf: MOCK_CPF,
      status: 'approved',
    }
    server.use(
      http.get(enrollmentsUrl, () =>
        HttpResponse.json(
          { data: { enrollments: [userEnrollment] } },
          { status: 200 }
        )
      )
    )

    const result = await getUserEnrollment(123)

    expect(result).toEqual(userEnrollment)
  })

  test('retorna null quando nenhuma inscrição bate com o CPF do usuário', async () => {
    server.use(
      http.get(enrollmentsUrl, () =>
        HttpResponse.json(
          {
            data: {
              enrollments: [
                { id: 'enrollment-x', cpf: '99999999999', status: 'pending' },
              ],
            },
          },
          { status: 200 }
        )
      )
    )

    const result = await getUserEnrollment(123)

    expect(result).toBeNull()
  })

  test('retorna null quando a lista de inscrições está vazia', async () => {
    server.use(
      http.get(enrollmentsUrl, () =>
        HttpResponse.json({ data: { enrollments: [] } }, { status: 200 })
      )
    )

    const result = await getUserEnrollment(123)

    expect(result).toBeNull()
  })

  test('retorna null quando a estrutura da resposta é inesperada', async () => {
    server.use(
      http.get(enrollmentsUrl, () =>
        HttpResponse.json({ unexpected: true }, { status: 200 })
      )
    )

    const result = await getUserEnrollment(123)

    expect(result).toBeNull()
  })

  test('retorna null quando a API responde com erro', async () => {
    server.use(
      http.get(enrollmentsUrl, () => HttpResponse.json({}, { status: 500 }))
    )

    const result = await getUserEnrollment(123)

    expect(result).toBeNull()
  })

  test('retorna null quando o usuário não está autenticado', async () => {
    vi.mocked(getUserInfoFromToken).mockResolvedValueOnce({ cpf: '', name: '' })

    const result = await getUserEnrollment(123)

    expect(result).toBeNull()
  })

  test('retorna null em falha de rede', async () => {
    server.use(http.get(enrollmentsUrl, () => HttpResponse.error()))

    const result = await getUserEnrollment(123)

    expect(result).toBeNull()
  })
})
