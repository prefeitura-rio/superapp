import { http, HttpResponse } from 'msw'
import { TEST_ENV } from './env'

// API base URLs for handlers
const RMI_BASE_URL = TEST_ENV.NEXT_PUBLIC_BASE_API_URL_RMI
const COURSES_BASE_URL = TEST_ENV.NEXT_PUBLIC_COURSES_BASE_API_URL

// Default success responses
const DEFAULT_SUCCESS_RESPONSE = { message: 'Success' }

export const handlers = [
  // RMI - Update phone
  http.put(`${RMI_BASE_URL}/v1/citizen/:cpf/phone`, () => {
    return HttpResponse.json(DEFAULT_SUCCESS_RESPONSE, { status: 200 })
  }),

  // RMI - Validate phone token
  http.post(`${RMI_BASE_URL}/v1/citizen/:cpf/phone/validate`, () => {
    return HttpResponse.json({ validated: true }, { status: 200 })
  }),

  // RMI - Update email
  http.put(`${RMI_BASE_URL}/v1/citizen/:cpf/email`, () => {
    return HttpResponse.json(DEFAULT_SUCCESS_RESPONSE, { status: 200 })
  }),

  // RMI - Update address
  http.put(`${RMI_BASE_URL}/v1/citizen/:cpf/address`, () => {
    return HttpResponse.json(DEFAULT_SUCCESS_RESPONSE, { status: 200 })
  }),

  // Courses - Enrollment
  http.post(`${COURSES_BASE_URL}/api/v1/courses/:id/enrollments`, () => {
    return HttpResponse.json(
      { id: 'enrollment-123', status: 'enrolled' },
      { status: 201 }
    )
  }),

  // MEI - Submit proposal
  http.post(
    `${COURSES_BASE_URL}/api/v1/oportunidades-mei/:id/propostas`,
    () => {
      return HttpResponse.json(
        { id: 'proposal-123', status: 'submitted' },
        { status: 201 }
      )
    }
  ),
]
