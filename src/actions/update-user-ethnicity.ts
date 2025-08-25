'use server'

import { putCitizenCpfEthnicity } from '@/http/citizen/citizen'
import type { HandlersErrorResponse } from '@/http/models'
import type { ModelsSelfDeclaredRacaInput } from '@/http/models/modelsSelfDeclaredRacaInput'
import { getUserInfoFromToken } from '@/lib/user-info'
import { revalidateTag } from 'next/cache'

export async function updateUserEthnicity(race: string) {
  const userInfo = await getUserInfoFromToken()
  
  if (!userInfo.cpf) {
    throw new Error('CPF do usuário não encontrado')
  }

  const modelsSelfDeclaredRacaInput: ModelsSelfDeclaredRacaInput = {
    valor: race,
  }
  
  try {
    const response = await putCitizenCpfEthnicity(
      userInfo.cpf,
      modelsSelfDeclaredRacaInput
    )

    // Check if the response indicates an error
    if (response.status !== 200) {
      const errorData = response.data as HandlersErrorResponse
      throw new Error(errorData?.error || 'Erro ao atualizar etnia')
    }
    
    revalidateTag(`user-info-${userInfo.cpf}`)
    return { success: true, message: 'Etnia atualizada com sucesso.' }
  } catch (error: any) {
    // If it's an API error response, throw it to be handled by the component
    if (error?.status && error?.data) {
      const err = error as HandlersErrorResponse
      throw new Error(err?.error || 'Erro ao atualizar etnia')
    }
    
    // For other errors (network, etc.), throw as well
    throw error
  }
}
