import type { EmailData } from '@/helpers/email-data-helpers'
import type { PhoneData } from '@/helpers/phone-data-helpers'
import { z } from 'zod'

export interface CourseUserInfo {
  cpf: string
  name: string
  email: EmailData
  phone: PhoneData
}

export interface Schedule {
  id: string
  location_id?: string
  vacancies: number
  class_start_date: string
  class_end_date: string
  class_time: string
  class_days: string
  created_at: string
  updated_at: string
}

export interface NearbyUnit {
  id: string
  curso_id: number
  address: string
  neighborhood: string
  schedules: Schedule[]
  created_at: string
  updated_at: string
}

export interface CustomFieldOption {
  id: string
  value: string
}

export interface CustomField {
  id: string
  curso_id: number
  title: string
  field_type: 'text' | 'radio' | 'select' | 'multiselect'
  required: boolean
  options?: CustomFieldOption[]
  created_at: string
  updated_at: string
}

export const inscriptionSchema = z.object({
  unitId: z.string().min(1, 'Selecione uma unidade'),
  description: z.string().min(5, 'Descreva em pelo menos 5 caracteres'),
})

// Dynamic schema that makes unitId optional when there are no nearby units
// and includes all custom fields dynamically
export const createInscriptionSchema = (
  hasNearbyUnits: boolean,
  hasMultipleSchedules: boolean,
  customFields: CustomField[] = []
) => {
  const baseSchema = {
    unitId: hasNearbyUnits
      ? z.string().min(1, 'Selecione uma unidade')
      : z.string().optional(),
    // Only require scheduleId if there are multiple schedules (when user needs to choose)
    // If there's only one schedule, it's auto-selected and sent to backend
    scheduleId: hasMultipleSchedules
      ? z.string().min(1, 'Selecione uma turma')
      : hasNearbyUnits
        ? z.string().optional() // Optional but will be auto-filled if only one schedule
        : z.string().optional(),
    description: z.string().optional(),
  }

  // Add custom fields dynamically
  const customFieldSchema: Record<string, any> = {}
  for (const field of customFields) {
    const fieldKey = `custom_${field.id}`

    if (field.field_type === 'multiselect') {
      // For multiselect, use array of strings
      if (field.required) {
        customFieldSchema[fieldKey] = z
          .array(z.string())
          .min(1, 'Selecione pelo menos uma opção')
      } else {
        customFieldSchema[fieldKey] = z.array(z.string()).optional()
      }
    } else {
      // For other field types, use string
      if (field.required) {
        customFieldSchema[fieldKey] = z
          .string()
          .min(1, 'Este campo é obrigatório')
      } else {
        customFieldSchema[fieldKey] = z.string().optional()
      }
    }
  }

  return z.object({
    ...baseSchema,
    ...customFieldSchema,
  })
}

// Use the dynamic schema type for InscriptionFormData
export type InscriptionFormData = z.infer<
  ReturnType<typeof createInscriptionSchema>
>

export interface SlideData {
  id: string
  component: React.ComponentType<any>
  props?: any
  showPagination?: boolean
  showBackButton?: boolean
}
