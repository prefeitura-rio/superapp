// app/actions/update-address.ts
'use server'

import { putCitizenCpfAddress } from '@/http/citizen/citizen'
import type {
  HandlersErrorResponse,
  ModelsSelfDeclaredAddressInput,
} from '@/http/models'
import { getUserInfoFromToken } from '@/lib/user-info'
import { revalidateTag } from 'next/cache'

export async function updateAddress(
  addressData: ModelsSelfDeclaredAddressInput
) {
  const userAuthInfo = await getUserInfoFromToken()
  
  if (!userAuthInfo.cpf) {
    throw new Error('Usuário não autenticado')
  }
  
  try {
    const response = await putCitizenCpfAddress(userAuthInfo.cpf, addressData)

    // Check if the response indicates an error
    if (response.status !== 200) {
      const errorData = response.data as HandlersErrorResponse
      throw new Error(errorData?.error || 'Erro ao atualizar endereço')
    }
    
    revalidateTag(`user-info-${userAuthInfo.cpf}`)
    return { success: true, data: response.data }
  } catch (error: any) {
    // If it's an API error response, throw it to be handled by the component
    if (error?.status && error?.data) {
      const err = error as HandlersErrorResponse
      throw new Error(err?.error || 'Erro ao atualizar endereço')
    }
    
    // For other errors (network, etc.), throw as well
    throw error
  }
}
