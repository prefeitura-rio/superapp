'use server'

import { putCitizenCpfFamilyIncome } from '@/http/citizen/citizen'
import type { HandlersErrorResponse } from '@/http/models'
import type { ModelsSelfDeclaredRendaFamiliarInput } from '@/http/models/modelsSelfDeclaredRendaFamiliarInput'
import { getUserInfoFromToken } from '@/lib/user-info'
import { revalidateTag } from 'next/cache'

export async function updateUserFamilyIncome(familyIncome: string) {
  const userInfo = await getUserInfoFromToken()
  
  if (!userInfo.cpf) {
    throw new Error('CPF do usuário não encontrado')
  }

  const modelsSelfDeclaredRendaFamiliarInput: ModelsSelfDeclaredRendaFamiliarInput = {
    valor: familyIncome,
  }
  
  try {
    const response = await putCitizenCpfFamilyIncome(
      userInfo.cpf,
      modelsSelfDeclaredRendaFamiliarInput
    )

    // Check if the response indicates an error
    if (response.status !== 200) {
      const errorData = response.data as HandlersErrorResponse
      throw new Error(errorData?.error || 'Erro ao atualizar renda familiar')
    }
    
    revalidateTag(`user-info-${userInfo.cpf}`)
    return { success: true, message: 'Renda familiar atualizada com sucesso.' }
  } catch (error: any) {
    // If it's an API error response, throw it to be handled by the component
    if (error?.status && error?.data) {
      const err = error as HandlersErrorResponse
      throw new Error(err?.error || 'Erro ao atualizar renda familiar')
    }
    
    // For other errors (network, etc.), throw as well
    throw error
  }
}

