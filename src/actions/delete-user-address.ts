// app/actions/delete-user-address.ts
'use server'

import { putCitizenCpfAddress } from '@/http/citizen/citizen'
import type { HandlersErrorResponse } from '@/http/models'
import { getUserInfoFromToken } from '@/lib/user-info'
import { revalidateTag } from 'next/cache'

export async function deleteUserAddress() {
  const userAuthInfo = await getUserInfoFromToken()
  // Send empty values to "delete" the address
  const emptyAddress = {
    bairro: 'null',
    cep: 'null',
    complemento: 'null',
    estado: 'null',
    logradouro: 'null',
    municipio: 'null',
    numero: 'null',
    tipo_logradouro: 'null',
  }
  try {
    const response = await putCitizenCpfAddress(userAuthInfo.cpf, emptyAddress)
    if (response.status !== 200) {
      console.error('Failed to delete address:', response.data)
      return {
        error: response.data.error || 'Failed to delete address',
        status: response.status,
      }
    }
    revalidateTag(`user-info-${userAuthInfo.cpf}`)
    console.log('Address deleted successfully:', response.data)
    return { success: true, data: response.data }
  } catch (error: unknown) {
    const err = error as HandlersErrorResponse
    return { success: false, error: err?.error || 'Erro desconhecido' }
  }
}
