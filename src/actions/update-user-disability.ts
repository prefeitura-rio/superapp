'use server'

import { putCitizenCpfDisability } from '@/http/citizen/citizen'
import type { HandlersErrorResponse } from '@/http/models'
import type { ModelsSelfDeclaredDeficienciaInput } from '@/http/models/modelsSelfDeclaredDeficienciaInput'
import { getUserInfoFromToken } from '@/lib/user-info'
import { revalidatePath, revalidateTag } from 'next/cache'

export async function updateUserDisability(disability: string) {
  const userInfo = await getUserInfoFromToken()
  
  if (!userInfo.cpf) {
    throw new Error('CPF do usuário não encontrado')
  }

  const modelsSelfDeclaredDeficienciaInput: ModelsSelfDeclaredDeficienciaInput = {
    valor: disability,
  }
  
  try {
    const response = await putCitizenCpfDisability(
      userInfo.cpf,
      modelsSelfDeclaredDeficienciaInput
    )

    // Check if the response indicates an error
    if (response.status !== 200) {
      const errorData = response.data as HandlersErrorResponse
      throw new Error(errorData?.error || 'Erro ao atualizar deficiência')
    }
    
    revalidateTag(`user-info-${userInfo.cpf}`)
    revalidatePath('/servicos/cursos/confirmar-informacoes', 'page')
    return { success: true, message: 'Deficiência atualizada com sucesso.' }
  } catch (error: any) {
    // If it's an API error response, throw it to be handled by the component
    if (error?.status && error?.data) {
      const err = error as HandlersErrorResponse
      throw new Error(err?.error || 'Erro ao atualizar deficiência')
    }
    
    // For other errors (network, etc.), throw as well
    throw error
  }
}

