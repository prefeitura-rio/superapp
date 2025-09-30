'use server'

import { postApiV1CoursesCourseIdEnrollments } from '@/http-courses/inscricoes/inscricoes'
import type { ModelsInscricao } from '@/http-courses/models/modelsInscricao'
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
  }
  unitId?: string
  enrolledUnit?: {
    id: string
    curso_id: number
    address: string
    neighborhood: string
    vacancies: number
    class_start_date: string
    class_end_date: string
    class_time: string
    class_days: string
    created_at: string
    updated_at: string
  }
  customFields?: Array<{
    id: string
    title: string
    value: string
    required: boolean
  }>
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

    // Create the inscription payload according to ModelsInscricao
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
      enrolled_unit: data.enrolledUnit,
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

    console.error(`API returned status ${response.status}`)
    return {
      success: false,
      error: 'Erro ao inscrever-se no curso',
    }
  } catch (error) {
    console.error('Error submitting inscription:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}
