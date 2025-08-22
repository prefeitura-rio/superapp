'use server'

import { putCitizenCpfOptin } from '@/http/citizen/citizen'
import type { HandlersErrorResponse } from '@/http/models/handlersErrorResponse'
import { getUserInfoFromToken } from '@/lib/user-info'
import { revalidateTag } from 'next/cache'

export async function updateOptInStatus(optin: boolean) {
  const user = await getUserInfoFromToken()
  if (!user.cpf) {
    throw new Error('Usuário não autenticado')
  }

  try {
    const response = await putCitizenCpfOptin(user.cpf, { opt_in: optin })
    
    // Check if the response indicates an error
    if (response.status !== 200) {
      const errorData = response.data as HandlersErrorResponse
      throw new Error(errorData?.error || 'Erro ao atualizar status de autorização')
    }
    
    revalidateTag('user-authorizations')
    return { success: true }
  } catch (error: any) {
    // If it's an API error response, throw it to be handled by the component
    if (error?.status && error?.data) {
      const err = error as HandlersErrorResponse
      throw new Error(err?.error || 'Erro ao atualizar status de autorização')
    }
    
    // For other errors (network, etc.), throw as well
    throw error
  }
}
