import 'server-only'

import { getCitizenCpfLegalEntities } from '@/http/citizen/citizen'
import type { ModelsLegalEntity } from '@/http/models'

/**
 * Resultado do helper getUserLegalEntity
 */
export interface UserLegalEntityResult {
  entity: ModelsLegalEntity
  cnpj: string
}

/**
 * Helper: Busca a primeira legal entity (MEI) do usuário pelo CPF
 * Centraliza a lógica de fetch que era repetida em vários arquivos
 *
 * IMPORTANTE: Esta função só pode ser usada em Server Components
 */
export async function getUserLegalEntity(
  cpf: string
): Promise<UserLegalEntityResult | null> {
  try {
    const response = await getCitizenCpfLegalEntities(cpf, {
      page: 1,
      per_page: 1,
    })

    if (response.status !== 200 || !response.data?.data?.length) {
      return null
    }

    const entity = response.data.data[0]
    return {
      entity,
      cnpj: entity.cnpj || '',
    }
  } catch (error) {
    console.error('[MEI] Error fetching user legal entity:', error)
    return null
  }
}
