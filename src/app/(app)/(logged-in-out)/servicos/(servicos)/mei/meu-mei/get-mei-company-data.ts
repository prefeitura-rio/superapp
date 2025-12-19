import { mapLegalEntityToMeiCompanyFullData } from '@/lib/mei-utils'
import { getUserLegalEntity } from '@/lib/mei-utils.server'
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

  return mapLegalEntityToMeiCompanyFullData(result.entity)
}
