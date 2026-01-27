'use server'

import { postApiV1CoursesCourseIdEnrollments } from '@/http-courses/inscricoes/inscricoes'
import type { ModelsInscricao } from '@/http-courses/models/modelsInscricao'
import type { ModelsInscricaoCustomFields } from '@/http-courses/models/modelsInscricaoCustomFields'
import { calculateAge } from '@/lib/calculate-age'
import { revalidateDalCourseEnrollment } from '@/lib/dal'
import { v4 as uuidv4 } from 'uuid'

// Generate a UUID v4 using crypto.randomUUID()
function generateUUID(): string {
  return crypto.randomUUID()
}

interface SubmitInscriptionData {
  courseId: string
  userInfo: {
    cpf: string
    name: string
    email?: string
    phone?: string
    birthDate?: string
  }
  unitId?: string
  scheduleId?: string
  enrolledUnit?: {
    id: string
    curso_id: number
    address: string
    neighborhood: string
    schedules: Array<{
      id: string
      location_id?: string
      vacancies: number
      class_start_date: string
      class_end_date: string
      class_time: string
      class_days: string
      created_at: string
      updated_at: string
    }>
    created_at: string
    updated_at: string
  }
  customFields?: ModelsInscricaoCustomFields
  reason: string
}

export async function submitCourseInscription(
  data: SubmitInscriptionData
): Promise<{
  success: boolean
  data?: any
  error?: string
}> {
  try {
    // Format the phone number if it exists
    let formattedPhone: string | undefined
    if (data.userInfo.phone) {
      // Assuming phone is already formatted from the UI
      formattedPhone = data.userInfo.phone
    }

    // Calculate age from birth date if available
    const age = calculateAge(data.userInfo.birthDate)

    // Create the inscription payload according to ModelsInscricao
    // For online courses without units, we should not send empty schedule_id or enrolled_unit
    const inscriptionPayload: ModelsInscricao = {
      id: uuidv4(),
      course_id: Number.parseInt(data.courseId),
      cpf: data.userInfo.cpf,
      name: data.userInfo.name,
      email: data.userInfo.email,
      phone: formattedPhone,
      reason: data.reason || '',
      enrolled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      custom_fields: data.customFields,
      // Only include age if it was successfully calculated
      ...(age !== null && { age }),
      // Only include enrolled_unit if it exists (for presencial/semipresencial courses)
      ...(data.enrolledUnit && { enrolled_unit: data.enrolledUnit }),
      // Only include schedule_id if it has a valid value (not empty string)
      ...(data.scheduleId &&
        data.scheduleId.trim() !== '' && { schedule_id: data.scheduleId }),
    }

    console.log('Submitting inscription with payload:', inscriptionPayload)

    // Submit to the API
    const response = await postApiV1CoursesCourseIdEnrollments(
      Number.parseInt(data.courseId),
      inscriptionPayload
    )

    if (response.status === 201) {
      console.log('Inscription submitted successfully:', response.data)

      // Revalidate the enrollment cache for this user and course
      // This ensures the UI updates automatically when the user returns to the course page
      await revalidateDalCourseEnrollment(
        Number.parseInt(data.courseId),
        data.userInfo.cpf
      )

      return {
        success: true,
        data: response.data,
      }
    }

    // Extract error message from API response
    let errorMessage = 'Erro ao inscrever-se no curso'
    if (
      response.status === 400 ||
      response.status === 409 ||
      response.status === 500
    ) {
      const errorData = 'data' in response ? response.data : null
      if (errorData && 'message' in errorData && errorData.message) {
        errorMessage = errorData.message
      }
    }

    console.error(`API returned status ${response.status}:`, errorMessage)
    return {
      success: false,
      error: errorMessage,
    }
  } catch (error) {
    console.error('Error submitting inscription:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}
