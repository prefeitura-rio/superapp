import type { ModelsCurso } from '@/http-courses/models'

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
 */
function getLatestClassEndDate(course: ModelsCurso): Date | null {
  const endDates: Date[] = []
  const courseAny = course as any

  // Check remote_class (online courses)
  if (courseAny?.remote_class?.class_end_date) {
    endDates.push(new Date(courseAny.remote_class.class_end_date))
  }

  // Check locations and their schedules (in-person/semi-in-person courses)
  if (
    courseAny?.locations &&
    Array.isArray(courseAny.locations) &&
    courseAny.locations.length > 0
  ) {
    for (const location of courseAny.locations) {
      // New structure: check schedules array
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

/**
 * Check if a course should be visible in the course list
 * Only shows courses with status "opened" and handles class end date logic
 */
export interface ShouldShowCourseProps {
  course: ModelsCurso
  renderByUrl?: boolean
}
export function shouldShowCourse({
  course,
  renderByUrl = false,
}: ShouldShowCourseProps): boolean {
  // Only show courses with "opened" status
  if (course.status !== 'opened') {
    return false
  }

  // Check visibility flag; if false and not rendering by URL, hide the course
  if (course.is_visible === false && !renderByUrl) {
    return false
  }

  // Get the latest class end date from either remote_class or locations
  const latestClassEndDate = getLatestClassEndDate(course)

  // Check if class has ended and if it's been more than 30 days
  if (latestClassEndDate) {
    const thirtyDaysAfterEnd = new Date(latestClassEndDate)
    thirtyDaysAfterEnd.setDate(thirtyDaysAfterEnd.getDate() + 30)

    if (new Date() > thirtyDaysAfterEnd) {
      return false
    }
  }

  return true
}

/**
 * Get enrollment status and button configuration for a course
 */
export function getCourseEnrollmentInfo(
  course: ModelsCurso,
  userEnrollment?: UserEnrollmentExtended | null
): CourseEnrollmentInfo {
  const now = new Date()

  // Check if user has concluded the course
  if (userEnrollment?.status === 'concluded') {
    const latestClassEndDate = getLatestClassEndDate(course)

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

  // Check if enrollment start date is in the future
  if (course.enrollment_start_date) {
    const enrollmentStartDate = new Date(course.enrollment_start_date as string)
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

  // Course is available for enrollment
  return {
    status: 'available',
    buttonText: 'Inscreva-se',
    isDisabled: false,
    canEnroll: true,
  }
}

/**
 * Filter courses to only show those that should be visible
 */
export function filterVisibleCourses(courses: ModelsCurso[]): ModelsCurso[] {
  return courses.filter(course => shouldShowCourse({ course }))
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
