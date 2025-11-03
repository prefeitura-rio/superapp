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

  // Check remote_class (online courses)
  if ((course.remote_class as any)?.class_end_date) {
    endDates.push(new Date((course.remote_class as any).class_end_date))
  }

  // Check locations and their schedules (in-person/semi-in-person courses)
  if ((course.locations as any) && (course.locations as any).length > 0) {
    for (const location of course.locations as any) {
      // New structure: check schedules array
      if ((location as any).schedules && Array.isArray((location as any).schedules)) {
        for (const schedule of (location as any).schedules) {
          if (schedule.class_end_date) {
            endDates.push(new Date(schedule.class_end_date))
          }
        }
      }
      // Legacy structure: check location directly (for backward compatibility)
      else if ((location as any).class_end_date) {
        endDates.push(new Date((location as any).class_end_date))
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
