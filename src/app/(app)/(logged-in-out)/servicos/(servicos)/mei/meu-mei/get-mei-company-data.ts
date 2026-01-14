import { mapLegalEntityToMeiCompanyFullData } from '@/lib/mei-utils'
import {
  getCitizenContactInfo,
  getUserLegalEntity,
} from '@/lib/mei-utils.server'
import { getUserInfoFromToken } from '@/lib/user-info'
import type { MeiCompanyFullData } from './types'

export async function getMeiCompanyData(): Promise<MeiCompanyFullData | null> {
  const userInfo = await getUserInfoFromToken()

  if (!userInfo.cpf) {
    return null
  }

  const result = await getUserLegalEntity(userInfo.cpf)
  if (!result) {
    return null
  }

  const companyData = mapLegalEntityToMeiCompanyFullData(result.entity)

  // Override contact info with citizen's personal data (see getCitizenContactInfo for details)
  const citizenContact = await getCitizenContactInfo(userInfo.cpf)
  if (citizenContact) {
    companyData.telefone = citizenContact.telefone
    companyData.email = citizenContact.email
  }

  return companyData
}
