// app/actions/delete-user-address.ts
'use server'

import { putCitizenCpfAddress } from '@/http/citizen/citizen'
import type { HandlersErrorResponse } from '@/http/models'
import { getUserInfoFromToken } from '@/lib/user-info'
import { revalidateTag } from 'next/cache'

export async function deleteUserAddress() {
  const userAuthInfo = await getUserInfoFromToken()
  
  if (!userAuthInfo.cpf) {
    throw new Error('Usuário não autenticado')
  }
  
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
    
    // Check if the response indicates an error
    if (response.status !== 200) {
      const errorData = response.data as HandlersErrorResponse
      throw new Error(errorData?.error || 'Erro ao excluir endereço')
    }
    
    revalidateTag(`user-info-${userAuthInfo.cpf}`)
    console.log('Address deleted successfully:', response.data)
    return { success: true, data: response.data }
  } catch (error: any) {
    // If it's an API error response, throw it to be handled by the component
    if (error?.status && error?.data) {
      const err = error as HandlersErrorResponse
      throw new Error(err?.error || 'Erro ao excluir endereço')
    }
    
    // For other errors (network, etc.), throw as well
    throw error
  }
}
