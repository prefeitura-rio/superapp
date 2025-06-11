'use server'

import { putCitizenCpfFirstlogin } from '@/http/citizen/citizen'
import type { HandlersErrorResponse } from '@/http/models/handlersErrorResponse'

export async function setFirstLoginFalse(cpf: string) {
  try {
    await putCitizenCpfFirstlogin(cpf)
    return { success: true }
  } catch (error: unknown) {
    const err = error as HandlersErrorResponse
    return { success: false, error: err?.error || 'Erro desconhecido' }
  }
}
