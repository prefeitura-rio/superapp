import type { AddressData } from '@/helpers/address-data-helpers'
import type { EmailData } from '@/helpers/email-data-helpers'
import type { PhoneData } from '@/helpers/phone-data-helpers'

export interface EmpregosUserInfo {
  cpf: string
  name: string
  email: EmailData
  phone: PhoneData
  address?: AddressData | null
  genero?: string
  escolaridade?: string
  renda_familiar?: string
  deficiencia?: string
}

export interface ContactUpdateStatus {
  phoneNeedsUpdate: boolean
  emailNeedsUpdate: boolean
}
