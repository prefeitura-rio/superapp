'use server'

import { postCitizenCpfPets } from '@/http/citizen/citizen'
import type { ModelsPetRegistrationRequestSexoSigla } from '@/http/models/modelsPetRegistrationRequestSexoSigla'
import { getUserInfoFromToken } from '@/lib/user-info'
import { revalidateTag } from 'next/cache'

interface RegisterPetData {
  nome: string
  especie: string
  sexo: 'M' | 'F'
  castrado: boolean
  nascimentoData: string
}

export async function registerPet(data: RegisterPetData): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const userInfo = await getUserInfoFromToken()

    if (!userInfo.cpf) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const response = await postCitizenCpfPets(userInfo.cpf, {
      animal_nome: data.nome,
      especie_nome: data.especie,
      sexo_sigla: data.sexo as ModelsPetRegistrationRequestSexoSigla,
      indicador_castrado: data.castrado,
      nascimento_data: data.nascimentoData,
      porte_nome: '',
      raca_nome: '',
    })

    if (response.status === 201) {
      revalidateTag(`user-info-${userInfo.cpf}`)
      return { success: true }
    }

    const errorData = 'data' in response ? response.data : null
    const errorMessage =
      errorData && 'message' in errorData
        ? (errorData as { message: string }).message
        : 'Erro ao cadastrar pet'

    return { success: false, error: errorMessage }
  } catch (error) {
    console.error('Error registering pet:', error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Erro desconhecido ocorreu',
    }
  }
}
