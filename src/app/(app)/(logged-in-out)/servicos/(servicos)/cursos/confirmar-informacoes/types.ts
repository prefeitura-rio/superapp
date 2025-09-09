import type { EmailData } from '@/helpers/email-helpers'
import { z } from 'zod'

export interface CourseUserInfo {
  cpf: string
  name: string
  email: EmailData
  phone: {
    principal?: {
      ddi?: string
      ddd?: string
      valor?: string
    }
  }
}

export interface NearbyUnit {
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

export interface CustomField {
  id: string
  curso_id: number
  title: string
  field_type: string
  required: boolean
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
  customFields: CustomField[] = []
) => {
  const baseSchema = {
    unitId: hasNearbyUnits
      ? z.string().min(1, 'Selecione uma unidade')
      : z.string().optional(),
    description: z.string().optional(),
  }

  // Add custom fields dynamically
  const customFieldSchema: Record<string, any> = {}
  for (const field of customFields) {
    const fieldKey = `custom_${field.id}`
    if (field.required) {
      customFieldSchema[fieldKey] = z
        .string()
        .min(1, 'Este campo é obrigatório')
    } else {
      customFieldSchema[fieldKey] = z.string().optional()
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
