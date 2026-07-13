import { z } from 'zod'

// Re-export types from confirmar-informacoes
export type {
  NearbyUnit,
  Schedule,
  SlideData,
} from '../../confirmar-informacoes/types'

// Dynamic schema that makes newUnitId required when there are multiple units
export const createChangeScheduleSchema = (hasMultipleUnits: boolean) => {
  return z.object({
    newUnitId: hasMultipleUnits
      ? z.string().min(1, 'Selecione uma unidade')
      : z.string().optional(),
    newScheduleId: z.string().min(1, 'Selecione uma turma'),
  })
}

export type ChangeScheduleFormData = z.infer<
  ReturnType<typeof createChangeScheduleSchema>
>

// Structure for future API request
export interface ChangeScheduleRequestData {
  enrollmentId: string
  newScheduleId: string
  newEnrolledUnit: {
    id: string
    curso_id: number
    address: string
    neighborhood: string
    neighborhood_zone?: string
    schedules: Array<{
      id: string
      location_id?: string
      vacancies: number
      class_start_date: string
      class_end_date: string
      class_time: string
      class_days: string
      remaining_vacancies?: number
    }>
  }
}
