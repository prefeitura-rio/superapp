'use server'
import { putCitizenCpfPhone } from '@/http/citizen/citizen'
import type { HandlersErrorResponse } from '@/http/models/handlersErrorResponse'
import type { ModelsSelfDeclaredPhoneInput } from '@/http/models/modelsSelfDeclaredPhoneInput'
import { getUserInfoFromToken } from '@/lib/user-info'
import { revalidateTag } from 'next/cache'

export async function updateUserPhone(data: ModelsSelfDeclaredPhoneInput) {
  const user = await getUserInfoFromToken()
  
  if (!user.cpf) {
    throw new Error('Usuário não autenticado')
  }
  
  try {
    const response = await putCitizenCpfPhone(user.cpf, data)
    
    // Check if the response indicates an error
    if (response.status !== 200) {
      const errorData = response.data as HandlersErrorResponse
      // Return error with status so the component can handle it appropriately
      return {
        success: false,
        error: errorData?.error || 'Erro ao atualizar número',
        status: response.status
      }
    }
    
    revalidateTag(`user-info-${user.cpf}`)
    return { success: true, data: response.data }
  } catch (error: any) {
    // If it's an API error response, return it with error
    if (error?.status && error?.data) {
      const err = error as HandlersErrorResponse
      return {
        success: false,
        error: err?.error || 'Erro ao atualizar número',
      }
    }
    
    // For other errors (network, etc.), throw as well
    throw error
  }
}
