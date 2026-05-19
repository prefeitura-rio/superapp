import type { EmailData } from '@/helpers/email-data-helpers'
import type { PhoneData } from '@/helpers/phone-data-helpers'

export interface EmpregosUserInfo {
  cpf: string
  name: string
  email: EmailData
  phone: PhoneData
  genero?: string
  escolaridade?: string
  renda_familiar?: string
  deficiencia?: string
}

export interface ContactUpdateStatus {
  phoneNeedsUpdate: boolean
  emailNeedsUpdate: boolean
}
