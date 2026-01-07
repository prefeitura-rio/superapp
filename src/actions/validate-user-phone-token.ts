'use server'
import { postCitizenCpfPhoneValidate } from '@/http/citizen/citizen'
import type { HandlersErrorResponse } from '@/http/models'
import type { ModelsPhoneVerificationValidateRequest } from '@/http/models/modelsPhoneVerificationValidateRequest'
import { getUserInfoFromToken } from '@/lib/user-info'
import { revalidatePath, revalidateTag } from 'next/cache'

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
      // Return error with status so the component can handle it appropriately
      return {
        success: false,
        error: errorData?.error || 'Token inválido',
        status: response.status
      }
    }
    
    revalidateTag(`user-info-${user.cpf}`)
    // Revalidate MEI proposal pages that use citizen contact info
    revalidatePath('/servicos/mei', 'layout')
    return { success: true }
  } catch (error: any) {
    // If it's an API error response, return it with error
    if (error?.status && error?.data) {
      const err = error as HandlersErrorResponse
      return {
        success: false,
        error: err?.error || 'Token inválido',
      }
    }
    
    // For other errors (network, etc.), throw as well
    throw error
  }
}