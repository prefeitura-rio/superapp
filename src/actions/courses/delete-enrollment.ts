'use server'

import { deleteApiV1CoursesCourseIdEnrollmentsEnrollmentId } from '@/http-courses/inscricoes/inscricoes'
import { revalidateDalCourseEnrollment } from '@/lib/dal'
import { getUserInfoFromToken } from '@/lib/user-info'

export async function deleteEnrollment(courseId: number, enrollmentId: string) {
  try {
    const currentUser = await getUserInfoFromToken()

    if (!currentUser?.cpf) {
      return { success: false, error: 'User not authenticated' }
    }

    const response = await deleteApiV1CoursesCourseIdEnrollmentsEnrollmentId(
      courseId,
      enrollmentId
    )

    if (response.status === 200) {
      // Revalidate the cached enrollment data for this user and course
      await revalidateDalCourseEnrollment(courseId, currentUser.cpf)
      return { success: true }
    }

    return { success: false, error: 'Erro ao cancelar inscrição' }
  } catch (error) {
    console.error('Erro ao cancelar inscrição:', error)
    return {
      success: false,
      error: 'Erro ao cancelar inscrição',
    }
  }
}
