'use server'

import { deleteApiV1CoursesCourseIdEnrollmentsEnrollmentId } from '@/http-courses/inscricoes/inscricoes'

export async function deleteEnrollment(courseId: number, enrollmentId: string) {
  try {
    const response = await deleteApiV1CoursesCourseIdEnrollmentsEnrollmentId(courseId, enrollmentId)
    
    if (response.status === 200) {
      return { success: true }
    } else {
      return { success: false, error: 'Failed to delete enrollment' }
    }
  } catch (error) {
    console.error('Error deleting enrollment:', error)
    return { success: false, error: 'An error occurred while deleting the enrollment' }
  }
}
