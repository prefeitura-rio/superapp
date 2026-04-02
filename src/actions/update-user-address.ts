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
      return {
        success: false,
        error: errorData?.error || 'Erro ao atualizar endereço',
        status: response.status,
      }
    }

    revalidateTag(`user-info-${userAuthInfo.cpf}`)
    return { success: true, data: response.data }
  } catch (error: any) {
    // If it's an API error response, return it so the component can handle it
    if (error?.status && error?.data) {
      const err = error as HandlersErrorResponse
      return {
        success: false,
        error: err?.error || 'Erro ao atualizar endereço',
        status: error.status,
      }
    }

    // For unexpected errors (network, etc.), throw so the caller can decide
    throw error
  }
}
