'use server'

import { putApiV1EnrollmentsEnrollmentIdSchedule } from '@/http-courses/enrollments/enrollments'
import type {
  ModelsEnrolledUnit,
  ModelsScheduleChangeRequest,
} from '@/http-courses/models'
import { getUserInfoFromToken } from '@/lib/user-info'

interface EnrolledUnitSchedule {
  id: string
  location_id?: string
  vacancies: number
  class_start_date: string
  class_end_date: string
  class_time: string
  class_days: string
  remaining_vacancies?: number
}

interface EnrolledUnitData {
  id: string
  curso_id: number
  address: string
  neighborhood: string
  neighborhood_zone?: string
  schedules: EnrolledUnitSchedule[]
}

interface ChangeScheduleParams {
  enrollmentId: string
  courseId: number
  scheduleId: string
  enrolledUnit: EnrolledUnitData
}

export async function changeSchedule({
  enrollmentId,
  courseId,
  scheduleId,
  enrolledUnit,
}: ChangeScheduleParams): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const currentUser = await getUserInfoFromToken()

    if (!currentUser?.cpf) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const payload: ModelsScheduleChangeRequest = {
      schedule_id: scheduleId,
      enrolled_unit: {
        id: enrolledUnit.id,
        curso_id: enrolledUnit.curso_id,
        address: enrolledUnit.address,
        neighborhood: enrolledUnit.neighborhood,
        neighborhood_zone: enrolledUnit.neighborhood_zone,
        schedules: enrolledUnit.schedules.map(schedule => ({
          id: schedule.id,
          location_id: schedule.location_id,
          vacancies: schedule.vacancies,
          class_start_date: schedule.class_start_date,
          class_end_date: schedule.class_end_date,
          class_time: schedule.class_time,
          class_days: schedule.class_days,
          remaining_vacancies: schedule.remaining_vacancies,
        })),
      } as ModelsEnrolledUnit,
    }

    const response = await putApiV1EnrollmentsEnrollmentIdSchedule(
      enrollmentId,
      payload
    )

    if (response.status === 200) {
      // Cache revalidation happens via hard navigation when user clicks "Finalizar"
      // This prevents the Server Component from re-rendering and losing client state
      return { success: true }
    }

    // Extract error message from response
    let errorMessage = 'Erro ao trocar de turma'

    if (response.status === 400) {
      const errorData = response.data as { message?: string; error?: string }
      errorMessage =
        errorData?.message || errorData?.error || 'Dados inválidos'
    } else if (response.status === 403) {
      errorMessage = 'Você não tem permissão para esta ação'
    } else if (response.status === 404) {
      errorMessage = 'Inscrição ou turma não encontrada'
    } else if (response.status === 500) {
      errorMessage = 'Erro interno. Tente novamente.'
    }

    return { success: false, error: errorMessage }
  } catch (error) {
    console.error('Erro ao trocar de turma:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}
