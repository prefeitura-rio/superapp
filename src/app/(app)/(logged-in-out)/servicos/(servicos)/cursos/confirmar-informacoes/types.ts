import { z } from 'zod'

export interface CourseUserInfo {
  cpf: string
  name: string
  email: {
    principal?: {
      valor?: string
    }
  }
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

export const inscriptionSchema = z.object({
  unitId: z.string().min(1, 'Selecione uma unidade'),
  description: z.string().min(5, 'Descreva em pelo menos 5 caracteres'),
})

export type InscriptionFormData = z.infer<typeof inscriptionSchema>

export interface SlideData {
  id: string
  component: React.ComponentType<any>
  props?: any
  showPagination?: boolean
  showBackButton?: boolean
}
