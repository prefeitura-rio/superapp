'use server'

import { putCitizenCpfExhibitionName } from '@/http/citizen/citizen'
import type { HandlersErrorResponse } from '@/http/models'
import type { ModelsSelfDeclaredNomeExibicaoInput } from '@/http/models/modelsSelfDeclaredNomeExibicaoInput'
import { getUserInfoFromToken } from '@/lib/user-info'
import { revalidateTag } from 'next/cache'

export async function updateUserDisplayName(
  displayNameData: ModelsSelfDeclaredNomeExibicaoInput
) {
  const userAuthInfo = await getUserInfoFromToken()

  if (!userAuthInfo.cpf) {
    throw new Error('Usuário não autenticado')
  }

  try {
    const response = await putCitizenCpfExhibitionName(
      userAuthInfo.cpf,
      displayNameData
    )

    // Check if the response indicates an error
    if (response.status !== 200) {
      const errorData = response.data as HandlersErrorResponse
      // Return error with status so the component can handle it appropriately
      return {
        success: false,
        error: errorData?.error || 'Erro ao atualizar nome de exibição',
        status: response.status,
      }
    }

    revalidateTag(`user-info-${userAuthInfo.cpf}`)
    return { success: true, data: response.data }
  } catch (error: any) {
    // If it's an API error response, return it with error
    if (error?.status && error?.data) {
      const err = error as HandlersErrorResponse
      return {
        success: false,
        error: err?.error || 'Erro ao atualizar nome de exibição',
        status: error.status,
      }
    }

    // For other errors (network, etc.), throw as well
    throw error
  }
}
