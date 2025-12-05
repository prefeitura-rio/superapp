'use server'

import { putCitizenCpfEducation } from '@/http/citizen/citizen'
import type { HandlersErrorResponse } from '@/http/models'
import type { ModelsSelfDeclaredEscolaridadeInput } from '@/http/models/modelsSelfDeclaredEscolaridadeInput'
import { getUserInfoFromToken } from '@/lib/user-info'
import { revalidatePath, revalidateTag } from 'next/cache'

export async function updateUserEducation(education: string) {
  const userInfo = await getUserInfoFromToken()
  
  if (!userInfo.cpf) {
    throw new Error('CPF do usuário não encontrado')
  }

  const modelsSelfDeclaredEscolaridadeInput: ModelsSelfDeclaredEscolaridadeInput = {
    valor: education,
  }
  
  try {
    const response = await putCitizenCpfEducation(
      userInfo.cpf,
      modelsSelfDeclaredEscolaridadeInput
    )

    // Check if the response indicates an error
    if (response.status !== 200) {
      const errorData = response.data as HandlersErrorResponse
      throw new Error(errorData?.error || 'Erro ao atualizar escolaridade')
    }
    
    revalidateTag(`user-info-${userInfo.cpf}`)
    revalidatePath('/servicos/cursos/confirmar-informacoes', 'page')
    return { success: true, message: 'Escolaridade atualizada com sucesso.' }
  } catch (error: any) {
    // If it's an API error response, throw it to be handled by the component
    if (error?.status && error?.data) {
      const err = error as HandlersErrorResponse
      throw new Error(err?.error || 'Erro ao atualizar escolaridade')
    }
    
    // For other errors (network, etc.), throw as well
    throw error
  }
}

