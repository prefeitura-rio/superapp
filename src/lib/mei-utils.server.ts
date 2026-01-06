import 'server-only'

import { getCitizenCpfLegalEntities } from '@/http/citizen/citizen'
import type { ModelsLegalEntity } from '@/http/models'
import { getDalCitizenCpf } from './dal'

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

/**
 * Contact info from citizen (natural person) data
 */
export interface CitizenContactInfo {
  telefone: {
    ddi: string
    ddd: string
    valor: string
  }
  email: string
}

/**
 * Fetches citizen contact info (email and phone) from the citizen API.
 *
 * We use the citizen's personal contact data instead of the company's (Legal Entity)
 * contact data because:
 * 1. The contact info displayed in MEI screens is for PrefRio platform communication only
 * 2. Users can update their contact info through the existing profile update flow
 * 3. This keeps contact data consistent across the platform (profile and MEI screens)
 *
 * The company's original contact data (from Receita Federal) remains unchanged.
 */
export async function getCitizenContactInfo(
  cpf: string
): Promise<CitizenContactInfo | null> {
  try {
    const citizenResponse = await getDalCitizenCpf(cpf)

    if (citizenResponse.status !== 200 || !citizenResponse.data) {
      return null
    }

    const citizenData = citizenResponse.data

    return {
      telefone: {
        ddi: citizenData.telefone?.principal?.ddi || '55',
        ddd: citizenData.telefone?.principal?.ddd || '',
        valor: citizenData.telefone?.principal?.valor || '',
      },
      email: citizenData.email?.principal?.valor || '',
    }
  } catch (error) {
    console.error('[MEI] Error fetching citizen contact info:', error)
    return null
  }
}
