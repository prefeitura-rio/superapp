import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import type { ModelsCurso } from '@/http-courses/models'
import {
  filterCoursesExcludingMyCourses,
  filterVisibleCourses,
  getCourseEnrollmentInfo,
  normalizeModalityDisplay,
  shouldShowCourse,
  sortCourses,
  type UserEnrollmentExtended,
} from '@/lib/course-utils'

function createCourse(overrides: Partial<ModelsCurso> = {}): ModelsCurso {
  return {
    id: 1,
    title: 'Test Course',
    status: 'opened',
    is_visible: true,
    modalidade: 'PRESENCIAL',
    has_certificate: false,
    created_at: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

function createEnrollment(
  overrides: Partial<UserEnrollmentExtended> = {}
): UserEnrollmentExtended {
  return {
    id: '1',
    status: 'pending',
    course_id: 1,
    ...overrides,
  }
}

describe('shouldShowCourse', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-11T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('returns false when status is not opened', () => {
    const course = createCourse({ status: 'closed' })

    const result = shouldShowCourse({ course })

    expect(result).toBe(false)
  })

  test('returns false when is_visible is false and not renderByUrl', () => {
    const course = createCourse({ is_visible: false })

    const result = shouldShowCourse({ course })

    expect(result).toBe(false)
  })

  test('returns true when is_visible is false but renderByUrl is true', () => {
    const course = createCourse({ is_visible: false })

    const result = shouldShowCourse({ course, renderByUrl: true })

    expect(result).toBe(true)
  })

  test('returns true for opened course with no end date', () => {
    const course = createCourse()

    const result = shouldShowCourse({ course })

    expect(result).toBe(true)
  })

  describe('LIVRE_FORMACAO_ONLINE courses', () => {
    test('returns true when within 30 days of enrollment end date', () => {
      const course = createCourse({
        modalidade: 'LIVRE_FORMACAO_ONLINE',
        enrollment_end_date: '2026-01-01T00:00:00Z',
      })

      const result = shouldShowCourse({ course })

      expect(result).toBe(true)
    })

    test('returns false when more than 30 days past enrollment end date', () => {
      const course = createCourse({
        modalidade: 'LIVRE_FORMACAO_ONLINE',
        enrollment_end_date: '2025-12-01T00:00:00Z',
      })

      const result = shouldShowCourse({ course })

      expect(result).toBe(false)
    })

    test('returns true when renderByUrl ignores 30 day rule', () => {
      const course = createCourse({
        modalidade: 'LIVRE_FORMACAO_ONLINE',
        enrollment_end_date: '2025-12-01T00:00:00Z',
      })

      const result = shouldShowCourse({ course, renderByUrl: true })

      expect(result).toBe(true)
    })
  })

  describe('regular courses with schedules', () => {
    test('returns true when within 30 days of class end date', () => {
      const course = createCourse({
        locations: [
          {
            schedules: [{ class_end_date: '2026-01-01T00:00:00Z' }],
          },
        ],
      } as any)

      const result = shouldShowCourse({ course })

      expect(result).toBe(true)
    })

    test('returns false when more than 30 days past class end date', () => {
      const course = createCourse({
        locations: [
          {
            schedules: [{ class_end_date: '2025-11-01T00:00:00Z' }],
          },
        ],
      } as any)

      const result = shouldShowCourse({ course })

      expect(result).toBe(false)
    })
  })
})

describe('getCourseEnrollmentInfo', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-11T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('returns certificate_available for concluded user with certificate', () => {
    const course = createCourse({ has_certificate: true })
    const enrollment = createEnrollment({
      status: 'concluded',
      certificate_url: 'https://example.com/cert',
    })

    const result = getCourseEnrollmentInfo(course, enrollment)

    expect(result.status).toBe('certificate_available')
    expect(result.buttonText).toBe('Acessar certificado')
    expect(result.certificateUrl).toBe('https://example.com/cert')
    expect(result.canEnroll).toBe(false)
  })

  test('returns available for concluded user without certificate', () => {
    const course = createCourse({ has_certificate: false })
    const enrollment = createEnrollment({ status: 'concluded' })

    const result = getCourseEnrollmentInfo(course, enrollment)

    expect(result.status).toBe('available')
  })

  test('returns certificate_pending for approved user with certificate', () => {
    const course = createCourse({ has_certificate: true })
    const enrollment = createEnrollment({ status: 'approved' })

    const result = getCourseEnrollmentInfo(course, enrollment)

    expect(result.status).toBe('certificate_pending')
    expect(result.buttonText).toBe('Aguardando certificado')
    expect(result.isDisabled).toBe(true)
  })

  test('returns coming_soon when enrollment not started', () => {
    const course = createCourse({
      enrollment_start_date: '2026-02-01T00:00:00Z',
    })

    const result = getCourseEnrollmentInfo(course)

    expect(result.status).toBe('coming_soon')
    expect(result.buttonText).toBe('Disponível em breve')
    expect(result.isDisabled).toBe(true)
  })

  test('returns course_ended when class end date passed', () => {
    const course = createCourse({
      locations: [
        {
          schedules: [{ class_end_date: '2026-01-01T00:00:00Z' }],
        },
      ],
    } as any)

    const result = getCourseEnrollmentInfo(course)

    expect(result.status).toBe('course_ended')
    expect(result.buttonText).toBe('Curso encerrado')
    expect(result.isDisabled).toBe(true)
  })

  test('returns enrollment_closed when enrollment end date passed', () => {
    const course = createCourse({
      enrollment_end_date: '2026-01-01T00:00:00Z',
    })

    const result = getCourseEnrollmentInfo(course)

    expect(result.status).toBe('enrollment_closed')
    expect(result.buttonText).toBe('Inscrições encerradas')
    expect(result.isDisabled).toBe(true)
  })

  test('returns available when no restrictions', () => {
    const course = createCourse()

    const result = getCourseEnrollmentInfo(course)

    expect(result.status).toBe('available')
    expect(result.buttonText).toBe('Inscreva-se')
    expect(result.isDisabled).toBe(false)
    expect(result.canEnroll).toBe(true)
  })

  test('returns available when enrollment dates are in range', () => {
    const course = createCourse({
      enrollment_start_date: '2026-01-01T00:00:00Z',
      enrollment_end_date: '2026-02-01T00:00:00Z',
    })

    const result = getCourseEnrollmentInfo(course)

    expect(result.status).toBe('available')
    expect(result.canEnroll).toBe(true)
  })
})

describe('normalizeModalityDisplay', () => {
  test('returns "Remoto (Aulas Gravadas)" for LIVRE_FORMACAO_ONLINE', () => {
    const result = normalizeModalityDisplay('LIVRE_FORMACAO_ONLINE')

    expect(result).toBe('Remoto (Aulas Gravadas)')
  })

  test('returns "Não informado" for null', () => {
    const result = normalizeModalityDisplay(null)

    expect(result).toBe('Não informado')
  })

  test('returns "Não informado" for undefined', () => {
    const result = normalizeModalityDisplay(undefined)

    expect(result).toBe('Não informado')
  })

  test('returns original value for other modalities', () => {
    const result = normalizeModalityDisplay('PRESENCIAL')

    expect(result).toBe('PRESENCIAL')
  })
})

describe('filterVisibleCourses', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-11T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('filters out courses that should not be shown', () => {
    const courses = [
      createCourse({ id: 1, status: 'opened' }),
      createCourse({ id: 2, status: 'closed' }),
      createCourse({ id: 3, status: 'opened', is_visible: false }),
    ]

    const result = filterVisibleCourses(courses)

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(1)
  })

  test('returns empty array for empty input', () => {
    const result = filterVisibleCourses([])

    expect(result).toEqual([])
  })
})

describe('sortCourses', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-11T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('sorts available courses first', () => {
    const courses = [
      createCourse({
        id: 1,
        enrollment_end_date: '2026-01-01T00:00:00Z',
        created_at: '2026-01-01T00:00:00Z',
      }),
      createCourse({
        id: 2,
        created_at: '2026-01-01T00:00:00Z',
      }),
    ]

    const result = sortCourses(courses)

    expect(result[0].id).toBe(2)
  })

  test('sorts by created_at when both available', () => {
    const courses = [
      createCourse({ id: 1, created_at: '2026-01-01T00:00:00Z' }),
      createCourse({ id: 2, created_at: '2026-01-10T00:00:00Z' }),
    ]

    const result = sortCourses(courses)

    expect(result[0].id).toBe(2)
  })

  test('does not mutate original array', () => {
    const courses = [
      createCourse({ id: 1, created_at: '2026-01-01T00:00:00Z' }),
      createCourse({ id: 2, created_at: '2026-01-10T00:00:00Z' }),
    ]

    sortCourses(courses)

    expect(courses[0].id).toBe(1)
  })
})

describe('filterCoursesExcludingMyCourses', () => {
  test('returns all courses when myCourses is empty', () => {
    const courses = [createCourse({ id: 1 }), createCourse({ id: 2 })]

    const result = filterCoursesExcludingMyCourses(courses, [])

    expect(result).toHaveLength(2)
  })

  test('excludes courses that are in myCourses', () => {
    const courses = [
      createCourse({ id: 1 }),
      createCourse({ id: 2 }),
      createCourse({ id: 3 }),
    ]
    const myCourses = [createCourse({ id: 2 })]

    const result = filterCoursesExcludingMyCourses(courses, myCourses)

    expect(result).toHaveLength(2)
    expect(result.map(c => c.id)).toEqual([1, 3])
  })

  test('returns empty array when all courses are in myCourses', () => {
    const courses = [createCourse({ id: 1 })]
    const myCourses = [createCourse({ id: 1 })]

    const result = filterCoursesExcludingMyCourses(courses, myCourses)

    expect(result).toHaveLength(0)
  })
})
