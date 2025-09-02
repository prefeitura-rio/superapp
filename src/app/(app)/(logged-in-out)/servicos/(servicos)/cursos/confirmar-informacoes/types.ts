import type { ModelsCitizen } from '@/http/models'
import { z } from 'zod'

export interface UserAuthInfo {
  cpf: string
  name: string
}

export interface EmptyUserInfo {
  cpf: ''
  name: ''
}

export type UserInfoComplete = UserAuthInfo & Partial<ModelsCitizen>
export type UserInfoObj = UserInfoComplete | EmptyUserInfo

export interface NearbyUnit {
  id: string
  name: string
  address: string
  neighborhood: string
  city: string
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
