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
  try {
    const response = await putCitizenCpfAddress(userAuthInfo.cpf, addressData)

    if (response.status !== 200) {
      return {
        error: response.data.error || 'Failed to update address',
        status: response.status,
      }
    }
    revalidateTag('update-user-address')
    return { success: true, data: response.data }
  } catch (error: any) {
    const err = error as HandlersErrorResponse
    return { success: false, error: err?.error || 'Erro desconhecido' }
  }
}
