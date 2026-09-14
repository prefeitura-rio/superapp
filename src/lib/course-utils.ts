import type { ModelsCurso } from '@/http-courses/models'

interface CoursesListApiResponse {
  data?: {
    courses?: ModelsCurso[]
    pagination?: {
      limit: number
      page: number
      total: number
      total_pages: number
    }
  }
}

export function parseCoursesListResponse(data: unknown): ModelsCurso[] {
  if (!data || typeof data !== 'object') return []

  const response = data as CoursesListApiResponse
  return response.data?.courses ?? []
}

export function parseCoursesListPagination(data: unknown) {
  if (!data || typeof data !== 'object') return undefined

  const response = data as CoursesListApiResponse
  return response.data?.pagination
}

export function parseCourseDetailResponse(data: unknown): ModelsCurso | null {
  if (!data || typeof data !== 'object') return null

  const response = data as { data?: ModelsCurso } & Partial<ModelsCurso>

  if (
    response.data &&
    typeof response.data === 'object' &&
    response.data.id != null
  ) {
    return response.data
  }

  if (response.id != null) {
    return response as ModelsCurso
  }

  return null
}

export type EnrollmentStatus =
  | 'available'
  | 'coming_soon'
  | 'enrollment_closed'
  | 'course_ended'
  | 'not_available'
  | 'certificate_available'
  | 'certificate_pending'

export interface CourseEnrollmentInfo {
  status: EnrollmentStatus
  buttonText: string
  isDisabled: boolean
  canEnroll: boolean
  certificateUrl?: string
}

export interface UserEnrollmentExtended {
  id: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'concluded'
  course_id: number
  certificate_url?: string
  has_certificate?: boolean
}

/**
 * Get the latest class end date from either remote_class or locations (with schedules)
 *
 * For all courses (online, in-person, semi-in-person):
 * - New structure: Checks all remote_class.schedules[].class_end_date (for online courses)
 * - New structure: Checks all locations[].schedules[].class_end_date (for in-person/online courses)
 * - Legacy structure: Falls back to remote_class.class_end_date for backward compatibility
 * - Legacy structure: Falls back to locations[].class_end_date for backward compatibility
 *
 * Returns the latest end date among all schedules, or null if none found.
 */
function getLatestClassEndDate(course: ModelsCurso): Date | null {
  const endDates: Date[] = []
  const courseAny = course as any

  // Check remote_class schedules (online courses - new structure with multiple classes)
  if (
    courseAny?.remote_class?.schedules &&
    Array.isArray(courseAny.remote_class.schedules)
  ) {
    for (const schedule of courseAny.remote_class.schedules) {
      if (schedule?.class_end_date) {
        endDates.push(new Date(schedule.class_end_date))
      }
    }
  }
  // Check remote_class (online courses - legacy structure)
  else if (courseAny?.remote_class?.class_end_date) {
    endDates.push(new Date(courseAny.remote_class.class_end_date))
  }

  // Check locations and their schedules (works for all course types: online, in-person, semi-in-person)
  // Online courses can also have locations with schedules (multiple classes)
  if (
    courseAny?.locations &&
    Array.isArray(courseAny.locations) &&
    courseAny.locations.length > 0
  ) {
    for (const location of courseAny.locations) {
      // New structure: check schedules array (for courses with multiple classes)
      if (location?.schedules && Array.isArray(location.schedules)) {
        for (const schedule of location.schedules) {
          if (schedule?.class_end_date) {
            endDates.push(new Date(schedule.class_end_date))
          }
        }
      }
      // Legacy structure: check location directly (for backward compatibility)
      else if (location?.class_end_date) {
        endDates.push(new Date(location.class_end_date))
      }
    }
  }

  // Return the latest date if any exist
  if (endDates.length === 0) {
    return null
  }

  return endDates.reduce((latest, current) =>
    current.getTime() > latest.getTime() ? current : latest
  )
}

export const COURSE_LISTING_STATUSES = [
  'opened',
  'published',
  'scheduled',
  'accepting_enrollments',
  'in_progress',
] as const

export const COURSE_LISTING_STATUS_CSV = COURSE_LISTING_STATUSES.join(',')

const LISTING_STATUSES = new Set<string>(COURSE_LISTING_STATUSES)

const URL_STATUSES = new Set([
  ...COURSE_LISTING_STATUSES,
  'finished',
  'closed',
  'canceled',
])

export interface ShouldShowCourseProps {
  course: ModelsCurso
  renderByUrl?: boolean
}

export function shouldShowCourse({
  course,
  renderByUrl = false,
}: ShouldShowCourseProps): boolean {
  const status = course.status as string

  if (renderByUrl) {
    return URL_STATUSES.has(status)
  }

  if (!LISTING_STATUSES.has(status)) return false
  if (course.is_visible === false) return false

  return true
}

// A turma (schedule) is the unit the citizen actually enrolls into, and the
// backend validates its own enrollment window on POST /enrollments. The
// course-level window is the union [earliest start, latest end] across turmas,
// so it stays "open" over gaps where no turma accepts enrollments — never use it
// to decide whether a citizen can enroll.
export interface ScheduleEnrollmentFields {
  enrollment_start_date?: string | null
  enrollment_end_date?: string | null
  accepting_enrollments?: boolean | null
  remaining_vacancies?: number | null
}

export type ScheduleAvailability =
  | 'available'
  | 'enrollment_not_started'
  | 'enrollment_closed'
  | 'no_vacancies'

const SCHEDULE_UNAVAILABLE_LABELS: Record<
  Exclude<ScheduleAvailability, 'available'>,
  string
> = {
  enrollment_not_started: 'Inscrições ainda não abertas',
  enrollment_closed: 'Inscrições encerradas',
  no_vacancies: 'Sem vagas disponíveis',
}

// Dates arrive as ISO strings with an explicit offset ("Z" or "-03:00"), so
// comparing instants is timezone-safe. Never compare the YYYY-MM-DD portion.
function toTime(value?: string | null): number | null {
  if (!value) return null
  const time = new Date(value).getTime()
  return Number.isNaN(time) ? null : time
}

/**
 * Why a turma cannot be picked right now, or 'available' when it can.
 * The enrollment window takes precedence over vacancies: a turma whose window
 * closed reads as "Inscrições encerradas" even when seats remain.
 */
export function getScheduleAvailability(
  schedule: ScheduleEnrollmentFields | null | undefined,
  now: Date = new Date()
): ScheduleAvailability {
  if (!schedule) return 'no_vacancies'

  if (schedule.accepting_enrollments === false) return 'enrollment_closed'

  const nowTime = now.getTime()
  const start = toTime(schedule.enrollment_start_date)
  if (start !== null && nowTime < start) return 'enrollment_not_started'

  const end = toTime(schedule.enrollment_end_date)
  if (end !== null && nowTime > end) return 'enrollment_closed'

  const remaining = schedule.remaining_vacancies
  if (remaining === undefined || remaining === null || remaining <= 0) {
    return 'no_vacancies'
  }

  return 'available'
}

/** Whether the citizen can enroll into this turma right now. */
export function isScheduleSelectable(
  schedule: ScheduleEnrollmentFields | null | undefined,
  now?: Date
): boolean {
  return getScheduleAvailability(schedule, now) === 'available'
}

/** Marker shown next to an unavailable turma, or null when it is available. */
export function getScheduleUnavailableLabel(
  schedule: ScheduleEnrollmentFields | null | undefined,
  now?: Date
): string | null {
  const availability = getScheduleAvailability(schedule, now)
  if (availability === 'available') return null
  return SCHEDULE_UNAVAILABLE_LABELS[availability]
}

/**
 * Marker for a group of turmas (e.g. all turmas of a unidade), or null when at
 * least one is selectable. Reports the least final reason among them, so a
 * unidade with one closed turma and one that has not opened yet reads as
 * "ainda não abertas" rather than "encerradas".
 */
export function getSchedulesUnavailableLabel(
  schedules: ScheduleEnrollmentFields[] | null | undefined,
  now?: Date
): string | null {
  const list = schedules ?? []
  if (list.length === 0) return SCHEDULE_UNAVAILABLE_LABELS.no_vacancies

  const availabilities = list.map(schedule =>
    getScheduleAvailability(schedule, now)
  )
  if (availabilities.includes('available')) return null

  for (const reason of [
    'enrollment_not_started',
    'no_vacancies',
    'enrollment_closed',
  ] as const) {
    if (availabilities.includes(reason)) {
      return SCHEDULE_UNAVAILABLE_LABELS[reason]
    }
  }

  return SCHEDULE_UNAVAILABLE_LABELS.no_vacancies
}

/** Every turma of a course, across locations and the remote class. */
export function collectCourseSchedules(course: {
  locations?: Array<{ schedules?: ScheduleEnrollmentFields[] }> | null
  remote_class?: { schedules?: ScheduleEnrollmentFields[] } | null
}): ScheduleEnrollmentFields[] {
  const schedules: ScheduleEnrollmentFields[] = []
  for (const location of course.locations ?? []) {
    schedules.push(...(location?.schedules ?? []))
  }
  schedules.push(...(course.remote_class?.schedules ?? []))
  return schedules
}

/**
 * Check if all online classes have no available vacancies
 * Returns true if there are no available classes (all have remaining_vacancies = 0 or undefined)
 */
function hasNoAvailableOnlineClasses(course: ModelsCurso): boolean {
  const courseAny = course as any
  const modality = course.modalidade?.toLowerCase()

  // Only check for online/remote courses
  if (modality !== 'online' && modality !== 'remoto') {
    return false
  }

  // Check remote_class schedules (new structure with multiple classes)
  if (
    courseAny?.remote_class?.schedules &&
    Array.isArray(courseAny.remote_class.schedules)
  ) {
    const schedules = courseAny.remote_class.schedules
    if (schedules.length === 0) {
      return true // No schedules means no available classes
    }

    // A turma only counts when it has seats AND its own enrollment window is open
    const hasAnyAvailable = schedules.some((schedule: any) =>
      isScheduleSelectable(schedule)
    )

    return !hasAnyAvailable // If no schedule is open for enrollment, return true
  }

  // Legacy structure: single remote_class
  if (courseAny?.remote_class) {
    const remainingVacancies = courseAny.remote_class.remaining_vacancies
    return (
      remainingVacancies === undefined ||
      remainingVacancies === null ||
      remainingVacancies === 0
    )
  }

  return false
}

/**
 * Check if all in-person/semi-in-person locations have no available vacancies
 * Returns true if there are no available locations (all have remaining_vacancies = 0 or undefined in all schedules)
 */
function hasNoAvailableInPersonClasses(course: ModelsCurso): boolean {
  const courseAny = course as any
  const modality = course.modalidade?.toLowerCase()

  // Only check for presencial/semipresencial courses
  if (modality !== 'presencial' && modality !== 'semipresencial') {
    return false
  }

  // Check locations and their schedules
  if (
    !courseAny?.locations ||
    !Array.isArray(courseAny.locations) ||
    courseAny.locations.length === 0
  ) {
    return true // No locations means no available classes
  }

  // Check if any location has any schedule open for enrollment (window + seats)
  const hasAnyAvailable = courseAny.locations.some((location: any) => {
    // New structure: check schedules array
    if (location?.schedules && Array.isArray(location.schedules)) {
      return location.schedules.some((schedule: any) =>
        isScheduleSelectable(schedule)
      )
    }
    // Legacy structure: check location directly
    if (location?.remaining_vacancies !== undefined) {
      return (
        location.remaining_vacancies !== null &&
        location.remaining_vacancies > 0
      )
    }
    return false
  })

  return !hasAnyAvailable // If no location has available vacancies, return true
}

/**
 * Get enrollment status and button configuration for a course
 */
// Course-level "Inscrições até": the latest enrollment closing date among the
// turmas that are still OPEN (enrollment_end_date >= now). Falls back to the
// course-level enrollment_end_date when no open turma dates are available
// (e.g. list payloads that don't include the schedules).
export function getCourseLatestOpenEnrollmentEnd(course: {
  enrollment_end_date?: string | null
  locations?: Array<{ schedules?: Array<{ enrollment_end_date?: string }> }>
  remote_class?: { schedules?: Array<{ enrollment_end_date?: string }> } | null
}): string | undefined {
  const now = new Date()
  const openEnds: number[] = []
  const collect = (schedules?: Array<{ enrollment_end_date?: string }>) => {
    for (const s of schedules ?? []) {
      if (s.enrollment_end_date) {
        const t = new Date(s.enrollment_end_date).getTime()
        if (new Date(t) >= now) openEnds.push(t)
      }
    }
  }
  for (const loc of course.locations ?? []) collect(loc.schedules)
  collect(course.remote_class?.schedules)
  if (openEnds.length > 0) {
    return new Date(Math.max(...openEnds)).toISOString()
  }
  return course.enrollment_end_date ?? undefined
}

export function getCourseEnrollmentInfo(
  course: ModelsCurso,
  userEnrollment?: UserEnrollmentExtended | null
): CourseEnrollmentInfo {
  const now = new Date()

  // Check if user has concluded the course
  if (userEnrollment?.status === 'concluded') {
    // If user has concluded and course has certificate, show certificate available
    if (course.has_certificate) {
      return {
        status: 'certificate_available',
        buttonText: 'Acessar certificado',
        isDisabled: false,
        canEnroll: false,
        certificateUrl: userEnrollment.certificate_url, // Pode ser undefined
      }
    }
    // If user has concluded but course has no certificate, show concluded status without button
    return {
      status: 'course_ended',
      buttonText: '',
      isDisabled: true,
      canEnroll: false,
    }
  }

  // Check if user is approved and course has certificate (shows as pending until concluded)
  if (userEnrollment?.status === 'approved' && course.has_certificate) {
    return {
      status: 'certificate_pending',
      buttonText: 'Aguardando certificado',
      isDisabled: true,
      canEnroll: false,
    }
  }

  // Course is no longer available for new enrollments
  const courseStatus = course.status as string
  if (['finished', 'closed', 'canceled'].includes(courseStatus)) {
    return {
      status: 'not_available',
      buttonText: 'Curso não está mais disponível',
      isDisabled: true,
      canEnroll: false,
    }
  }

  // Backend explicitly says enrollment is scheduled — trust it over date math
  if (courseStatus === 'scheduled') {
    return {
      status: 'coming_soon',
      buttonText: 'Disponível em breve',
      isDisabled: true,
      canEnroll: false,
    }
  }

  // Per-turma enrollment window. This runs even for accepting_enrollments: the
  // backend derives that status from the course-level window, which is the union
  // [earliest start, latest end] across turmas and therefore stays open over gaps
  // where every individual turma is already closed or has not opened yet. The
  // POST /enrollments endpoint validates the turma window, so trusting the
  // course-level status here is what let citizens reach a guaranteed failure.
  const schedules = collectCourseSchedules(course as any)
  if (schedules.length > 0) {
    const availabilities = schedules.map(schedule =>
      getScheduleAvailability(schedule, now)
    )

    if (!availabilities.includes('available')) {
      // A turma that has not opened yet will become enrollable later; one that
      // only ran out of seats is still within its window.
      if (availabilities.includes('enrollment_not_started')) {
        return {
          status: 'coming_soon',
          buttonText: 'Disponível em breve',
          isDisabled: true,
          canEnroll: false,
        }
      }
      if (!availabilities.includes('no_vacancies')) {
        return {
          status: 'enrollment_closed',
          buttonText: 'Inscrições encerradas',
          isDisabled: true,
          canEnroll: false,
        }
      }
    }
  }

  // Course-level dates, for courses with no turmas of their own (the per-turma
  // check above already covers the rest). Skipped when the backend derived
  // accepting_enrollments, which it only does inside the course-level window.
  if (courseStatus !== 'accepting_enrollments') {
    // Check if enrollment start date is in the future
    if (course.enrollment_start_date) {
      const enrollmentStartDate = new Date(
        course.enrollment_start_date as string
      )
      if (now < enrollmentStartDate) {
        return {
          status: 'coming_soon',
          buttonText: 'Disponível em breve',
          isDisabled: true,
          canEnroll: false,
        }
      }
    }

    // Check if class has ended FIRST (this takes priority over enrollment status)
    const latestClassEndDate = getLatestClassEndDate(course)
    if (latestClassEndDate && now > latestClassEndDate) {
      return {
        status: 'course_ended',
        buttonText: 'Curso encerrado',
        isDisabled: true,
        canEnroll: false,
      }
    }

    // Check if enrollment end date has passed (only if class hasn't ended)
    if (course.enrollment_end_date) {
      const enrollmentEndDate = new Date(course.enrollment_end_date as string)
      if (now > enrollmentEndDate) {
        return {
          status: 'enrollment_closed',
          buttonText: 'Inscrições encerradas',
          isDisabled: true,
          canEnroll: false,
        }
      }
    }
  }

  // Check if all online classes have no available vacancies
  if (hasNoAvailableOnlineClasses(course)) {
    return {
      status: 'enrollment_closed',
      buttonText: 'Vagas encerradas',
      isDisabled: true,
      canEnroll: false,
    }
  }

  // Check if all in-person/semi-in-person locations have no available vacancies
  if (hasNoAvailableInPersonClasses(course)) {
    return {
      status: 'enrollment_closed',
      buttonText: 'Vagas encerradas',
      isDisabled: true,
      canEnroll: false,
    }
  }

  // Course is available for enrollment
  return {
    status: 'available',
    buttonText: 'Inscreva-se',
    isDisabled: false,
    canEnroll: true,
  }
}

/**
 * Whether the course cover should render in grayscale (unavailable for new enrollments).
 * Aligns with getCourseEnrollmentInfo when the citizen cannot enroll (vacancies, date, or final status).
 */
export function shouldGrayscaleCourseCover(course: ModelsCurso): boolean {
  const { status } = getCourseEnrollmentInfo(course)
  return (
    status === 'enrollment_closed' ||
    status === 'not_available' ||
    status === 'course_ended'
  )
}

/**
 * Filter courses to only show those that should be visible
 */
export function filterVisibleCourses(courses: ModelsCurso[]): ModelsCurso[] {
  return courses.filter(course => shouldShowCourse({ course }))
}

/**
 * Normalize modality display name
 * Maps technical modality values to user-friendly display names
 */
export function normalizeModalityDisplay(
  modality: string | null | undefined
): string {
  if (!modality) return 'Não informado'

  // Map LIVRE_FORMACAO_ONLINE to "Online" for display
  if (modality === 'LIVRE_FORMACAO_ONLINE') {
    return 'Remoto (Aulas Gravadas)'
  }

  return modality
}

/**
 * Sort courses prioritizing:
 * 1. Courses with open enrollments (status 'available')
 * 2. Then by created_at (most recent first)
 * 3. Consider enrollment_end_date (data_limite_inscricoes) for secondary sorting
 */
export function sortCourses(courses: ModelsCurso[]): ModelsCurso[] {
  return [...courses].sort((a, b) => {
    // Get enrollment info for both courses (without user enrollment for sorting)
    const enrollmentInfoA = getCourseEnrollmentInfo(a)
    const enrollmentInfoB = getCourseEnrollmentInfo(b)

    // Priority 1: Courses with open enrollments come first
    const isAvailableA = enrollmentInfoA.status === 'available'
    const isAvailableB = enrollmentInfoB.status === 'available'

    if (isAvailableA && !isAvailableB) {
      return -1 // A comes first
    }
    if (!isAvailableA && isAvailableB) {
      return 1 // B comes first
    }

    // Priority 2: If both have same enrollment status, sort by created_at (most recent first)
    const createdAtA = a.created_at ? new Date(a.created_at).getTime() : 0
    const createdAtB = b.created_at ? new Date(b.created_at).getTime() : 0

    if (createdAtA !== createdAtB) {
      return createdAtB - createdAtA // Most recent first (descending)
    }

    // Priority 3: If created_at is the same, use enrollment_end_date as tiebreaker
    // Courses with later enrollment_end_date come first (more time to enroll)
    const enrollmentEndA = a.enrollment_end_date || a.data_limite_inscricoes
    const enrollmentEndB = b.enrollment_end_date || b.data_limite_inscricoes

    if (enrollmentEndA && enrollmentEndB) {
      const dateA = new Date(enrollmentEndA).getTime()
      const dateB = new Date(enrollmentEndB).getTime()
      return dateB - dateA // Later date first
    }

    if (enrollmentEndA && !enrollmentEndB) {
      return -1 // A comes first (has enrollment end date)
    }
    if (!enrollmentEndA && enrollmentEndB) {
      return 1 // B comes first (has enrollment end date)
    }

    return 0 // Equal priority
  })
}

/**
 * Extract course IDs from myCourses array
 * Handles both direct id property and nested course_id
 */
function getMyCourseIds(myCourses: ModelsCurso[]): Set<number | string> {
  const ids = new Set<number | string>()
  for (const course of myCourses) {
    if (course.id != null) {
      ids.add(course.id)
    }
  }
  return ids
}

/**
 * Filter courses excluding those in myCourses
 * Used for "Mais recentes" section
 */
export function filterCoursesExcludingMyCourses(
  courses: ModelsCurso[],
  myCourses: ModelsCurso[]
): ModelsCurso[] {
  if (myCourses.length === 0) return courses

  const myCourseIds = getMyCourseIds(myCourses)
  return courses.filter(course => {
    if (course.id == null) return true
    return !myCourseIds.has(course.id)
  })
}

/**
 * Filter courses excluding those in myCourses and recentlyAddedCourses
 * Used for "Todos os cursos" section
 */
export function filterCoursesExcludingMyCoursesAndRecentlyAdded(
  courses: ModelsCurso[],
  myCourses: ModelsCurso[],
  recentlyAddedCourses: ModelsCurso[]
): ModelsCurso[] {
  const excludedIds = new Set<number | string>()

  // Add myCourses IDs
  const myCourseIds = getMyCourseIds(myCourses)
  myCourseIds.forEach(id => excludedIds.add(id))

  // Add recentlyAddedCourses IDs
  for (const course of recentlyAddedCourses) {
    if (course.id != null) {
      excludedIds.add(course.id)
    }
  }

  if (excludedIds.size === 0) return courses

  return courses.filter(course => {
    if (course.id == null) return true
    return !excludedIds.has(course.id)
  })
}
