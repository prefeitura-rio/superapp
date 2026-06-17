import type { EmailData } from '@/helpers/email-data-helpers'
import type { PhoneData } from '@/helpers/phone-data-helpers'
import { z } from 'zod'

export interface CourseUserInfo {
  cpf: string
  name: string
  email: EmailData
  phone: PhoneData
  address?: {
    logradouro?: string
    numero?: string
    bairro?: string
    municipio?: string
    estado?: string
    tipo_logradouro?: string
    complemento?: string
    cep?: string
  } | null
  genero?: string
  escolaridade?: string
  renda_familiar?: string
  deficiencia?: string
  nascimento?: {
    data?: string
  }
  raca?: string
}

export interface Schedule {
  id: string
  location_id?: string
  vacancies: number
  remaining_vacancies?: number
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

export type FormatType =
  | 'free'
  | 'number'
  | 'date'
  | 'phone'
  | 'cpf'
  | 'cep'
  | 'email'

export interface CustomField {
  id: string
  curso_id: number
  title: string
  field_type: 'text' | 'radio' | 'select' | 'multiselect'
  format_type?: FormatType | string | null
  required: boolean
  options?: CustomFieldOption[]
  created_at: string
  updated_at: string
}

export const inscriptionSchema = z.object({
  unitId: z.string().min(1, 'Selecione uma unidade'),
  description: z.string().min(5, 'Descreva em pelo menos 5 caracteres'),
})

function buildTextFieldSchema(field: CustomField, required: boolean) {
  const fmt = field.format_type ?? 'free'
  let base: z.ZodString

  switch (fmt) {
    case 'cpf':
      base = z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido')
      break
    case 'phone':
      base = z.string().regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, 'Telefone inválido')
      break
    case 'cep':
      base = z.string().regex(/^\d{5}-\d{3}$/, 'CEP inválido')
      break
    case 'date':
      base = z
        .string()
        .regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Data inválida (DD/MM/AAAA)')
      break
    case 'number':
      base = z.string().regex(/^\d+$/, 'Somente números são permitidos')
      break
    case 'email':
      base = z.string().email('E-mail inválido')
      break
    default:
      base = z.string().max(50, 'O texto não pode ultrapassar 50 caracteres')
  }

  if (required) {
    return base.min(1, 'Este campo é obrigatório')
  }
  // When optional: allow empty string (user left it blank) but validate if something was typed
  return z.union([base, z.literal('')])
}

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
        ? z
            .string()
            .optional() // Optional but will be auto-filled if only one schedule
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
      if (field.field_type === 'text') {
        customFieldSchema[fieldKey] = buildTextFieldSchema(
          field,
          field.required
        )
      } else {
        // For radio and select fields
        if (field.required) {
          customFieldSchema[fieldKey] = z
            .string()
            .min(1, 'Este campo é obrigatório')
        } else {
          customFieldSchema[fieldKey] = z.string().optional()
        }
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
