// @vitest-environment node
import type { ModelsCurso } from '@/http-courses/models'
import {
  type UserEnrollmentExtended,
  filterCoursesExcludingMyCourses,
  filterVisibleCourses,
  getCourseEnrollmentInfo,
  isScheduleEnrollmentClosed,
  normalizeModalityDisplay,
  shouldGrayscaleCourseCover,
  shouldShowCourse,
  sortCourses,
} from '@/lib/course-utils'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

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
  test('returns true for listing statuses', () => {
    for (const status of [
      'opened',
      'published',
      'scheduled',
      'accepting_enrollments',
      'in_progress',
    ]) {
      const course = createCourse({ status: status as any })
      expect(shouldShowCourse({ course })).toBe(true)
    }
  })

  test('returns false for non-listing statuses', () => {
    for (const status of [
      'finished',
      'closed',
      'canceled',
      'draft',
      'needs_changes',
      'in_review',
      'pending_deletion',
    ]) {
      const course = createCourse({ status: status as any })
      expect(shouldShowCourse({ course })).toBe(false)
    }
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

  test('returns true for opened course', () => {
    const course = createCourse()

    const result = shouldShowCourse({ course })

    expect(result).toBe(true)
  })

  describe('renderByUrl', () => {
    test('returns true for finished, closed, canceled via direct URL', () => {
      for (const status of ['finished', 'closed', 'canceled']) {
        const course = createCourse({ status: status as any })
        expect(shouldShowCourse({ course, renderByUrl: true })).toBe(true)
      }
    })

    test('returns false for draft/review statuses even via direct URL', () => {
      for (const status of [
        'draft',
        'needs_changes',
        'in_review',
        'pending_deletion',
      ]) {
        const course = createCourse({ status: status as any })
        expect(shouldShowCourse({ course, renderByUrl: true })).toBe(false)
      }
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

  test('returns course_ended for concluded user without certificate', () => {
    const course = createCourse({
      has_certificate: false,
      modalidade: 'LIVRE_FORMACAO_ONLINE',
    })
    const enrollment = createEnrollment({ status: 'concluded' })

    const result = getCourseEnrollmentInfo(course, enrollment)

    expect(result.status).toBe('course_ended')
    expect(result.buttonText).toBe('')
    expect(result.isDisabled).toBe(true)
    expect(result.canEnroll).toBe(false)
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
    const course = createCourse({ modalidade: 'LIVRE_FORMACAO_ONLINE' })

    const result = getCourseEnrollmentInfo(course)

    expect(result.status).toBe('available')
    expect(result.buttonText).toBe('Inscreva-se')
    expect(result.isDisabled).toBe(false)
    expect(result.canEnroll).toBe(true)
  })

  test('returns not_available for finished, closed, canceled courses', () => {
    for (const status of ['finished', 'closed', 'canceled']) {
      const course = createCourse({ status: status as any })

      const result = getCourseEnrollmentInfo(course)

      expect(result.status).toBe('not_available')
      expect(result.buttonText).toBe('Curso não está mais disponível')
      expect(result.isDisabled).toBe(true)
      expect(result.canEnroll).toBe(false)
    }
  })

  test('returns available for accepting_enrollments even when class_end_date is in the past', () => {
    const course = createCourse({
      status: 'accepting_enrollments' as any,
      locations: [
        {
          schedules: [
            { class_end_date: '2026-01-01T00:00:00Z', remaining_vacancies: 1 },
          ],
        },
      ],
    } as any)

    const result = getCourseEnrollmentInfo(course)

    expect(result.status).toBe('available')
    expect(result.canEnroll).toBe(true)
  })

  test('returns coming_soon for scheduled status regardless of dates', () => {
    const course = createCourse({ status: 'scheduled' as any })

    const result = getCourseEnrollmentInfo(course)

    expect(result.status).toBe('coming_soon')
    expect(result.isDisabled).toBe(true)
  })

  test('returns certificate_available for concluded user even when course is finished', () => {
    const course = createCourse({
      status: 'finished' as any,
      has_certificate: true,
    })
    const enrollment = createEnrollment({
      status: 'concluded',
      certificate_url: 'https://example.com/cert',
    })

    const result = getCourseEnrollmentInfo(course, enrollment)

    expect(result.status).toBe('certificate_available')
  })

  test('returns available when enrollment dates are in range', () => {
    const course = createCourse({
      modalidade: 'LIVRE_FORMACAO_ONLINE',
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
  test('shows listing statuses and hides others', () => {
    const courses = [
      createCourse({ id: 1, status: 'opened' }),
      createCourse({ id: 2, status: 'published' as any }),
      createCourse({ id: 3, status: 'scheduled' as any }),
      createCourse({ id: 4, status: 'accepting_enrollments' as any }),
      createCourse({ id: 5, status: 'in_progress' as any }),
      createCourse({ id: 6, status: 'finished' as any }),
      createCourse({ id: 7, status: 'closed' }),
      createCourse({ id: 8, status: 'draft' }),
      createCourse({ id: 9, status: 'opened', is_visible: false }),
    ]

    const result = filterVisibleCourses(courses)

    expect(result.map(c => c.id)).toEqual([1, 2, 3, 4, 5])
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
        modalidade: 'LIVRE_FORMACAO_ONLINE',
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

// Edge cases derivados de docs/en-us/COURSE_FILTERING_LOGIC.md.
// Nota: a regra de "30 dias" descrita no doc para shouldShowCourse é legada — o
// shouldShowCourse atual só filtra por status/is_visible (o corte por data ocorre
// no backend/DAL). Aqui cobrimos o que a lógica ATUAL de course-utils implementa:
// prioridade de course_ended, "maior data" entre schedules e "Vagas encerradas".
describe('getCourseEnrollmentInfo — edge cases (COURSE_FILTERING_LOGIC)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-11T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // Cenário 2 do doc: class end no passado tem prioridade sobre enrollment end.
  test('course_ended tem prioridade sobre enrollment_closed quando ambas as datas passaram', () => {
    const course = createCourse({
      enrollment_end_date: '2026-01-01T00:00:00Z', // passado
      locations: [
        { schedules: [{ class_end_date: '2026-01-05T00:00:00Z' }] }, // passado
      ],
    } as any)

    const result = getCourseEnrollmentInfo(course)

    // course_ended vence — NÃO enrollment_closed
    expect(result.status).toBe('course_ended')
    expect(result.buttonText).toBe('Curso encerrado')
  })

  // Cenários 4/4b/11 do doc: usa a MAIOR data entre schedules; uma futura mantém ativo.
  test('usa a maior data de término — um schedule futuro mantém o curso available', () => {
    const course = createCourse({
      modalidade: 'PRESENCIAL',
      locations: [
        {
          schedules: [
            { class_end_date: '2026-01-05T00:00:00Z', remaining_vacancies: 1 }, // passado
            { class_end_date: '2026-02-20T00:00:00Z', remaining_vacancies: 1 }, // futuro
          ],
        },
      ],
    } as any)

    const result = getCourseEnrollmentInfo(course)

    expect(result.status).toBe('available')
    expect(result.canEnroll).toBe(true)
  })

  // Cenário 5 do doc: todos os schedules no passado → course_ended.
  test('todos os schedules no passado → course_ended', () => {
    const course = createCourse({
      modalidade: 'PRESENCIAL',
      locations: [
        {
          schedules: [
            { class_end_date: '2026-01-03T00:00:00Z', remaining_vacancies: 1 }, // passado
            { class_end_date: '2026-01-08T00:00:00Z', remaining_vacancies: 1 }, // passado (maior)
          ],
        },
      ],
    } as any)

    const result = getCourseEnrollmentInfo(course)

    expect(result.status).toBe('course_ended')
  })

  test('sem vagas em nenhum schedule presencial → "Vagas encerradas"', () => {
    const course = createCourse({
      modalidade: 'PRESENCIAL',
      locations: [
        {
          schedules: [
            { class_end_date: '2026-02-20T00:00:00Z', remaining_vacancies: 0 }, // futuro, sem vaga
          ],
        },
      ],
    } as any)

    const result = getCourseEnrollmentInfo(course)

    expect(result.status).toBe('enrollment_closed')
    expect(result.buttonText).toBe('Vagas encerradas')
  })

  test('sem vagas em nenhuma turma online → "Vagas encerradas"', () => {
    const course = createCourse({
      modalidade: 'Online',
      remote_class: {
        schedules: [
          { class_end_date: '2026-02-20T00:00:00Z', remaining_vacancies: 0 }, // futuro, sem vaga
        ],
      },
    } as any)

    const result = getCourseEnrollmentInfo(course)

    expect(result.status).toBe('enrollment_closed')
    expect(result.buttonText).toBe('Vagas encerradas')
  })
})

describe('shouldGrayscaleCourseCover', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-11T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('true quando o curso não pode receber inscrição (course_ended)', () => {
    const course = createCourse({
      locations: [
        { schedules: [{ class_end_date: '2026-01-01T00:00:00Z' }] }, // passado
      ],
    } as any)

    expect(shouldGrayscaleCourseCover(course)).toBe(true)
  })

  test('true para curso não disponível (closed)', () => {
    expect(shouldGrayscaleCourseCover(createCourse({ status: 'closed' }))).toBe(
      true
    )
  })

  test('false para curso available', () => {
    expect(
      shouldGrayscaleCourseCover(
        createCourse({ modalidade: 'LIVRE_FORMACAO_ONLINE' })
      )
    ).toBe(false)
  })
})

describe('isScheduleEnrollmentClosed', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-11T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('true quando enrollment_end_date do schedule já passou', () => {
    expect(
      isScheduleEnrollmentClosed({
        enrollment_end_date: '2026-01-01T00:00:00Z',
      })
    ).toBe(true)
  })

  test('false quando enrollment_end_date do schedule é futuro', () => {
    expect(
      isScheduleEnrollmentClosed({
        enrollment_end_date: '2026-02-01T00:00:00Z',
      })
    ).toBe(false)
  })

  test('false quando o schedule não tem enrollment_end_date', () => {
    expect(isScheduleEnrollmentClosed({})).toBe(false)
  })
})
