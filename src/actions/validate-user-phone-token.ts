'use server'
import { postCitizenCpfPhoneValidate } from '@/http/citizen/citizen'
import type { HandlersErrorResponse } from '@/http/models'
import type { ModelsPhoneVerificationValidateRequest } from '@/http/models/modelsPhoneVerificationValidateRequest'
import { getUserInfoFromToken } from '@/lib/user-info'

export async function validateUserPhoneToken(
  data: ModelsPhoneVerificationValidateRequest
) {
  const user = await getUserInfoFromToken()
  
  if (!user.cpf) {
    throw new Error('Usuário não autenticado')
  }
  
  try {
    const response = await postCitizenCpfPhoneValidate(user.cpf, data)
    
    // Check if the response indicates an error
    if (response.status !== 200) {
      const errorData = response.data as HandlersErrorResponse
      throw new Error(errorData?.error || 'Token inválido')
    }
    
    return { success: true }
  } catch (error: any) {
    // If it's an API error response, throw it to be handled by the component
    if (error?.status && error?.data) {
      const err = error as HandlersErrorResponse
      throw new Error(err?.error || 'Token inválido')
    }
    
    // For other errors (network, etc.), throw as well
    throw error
  }
}
