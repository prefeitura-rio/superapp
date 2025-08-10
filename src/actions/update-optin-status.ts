'use server'

import { putCitizenCpfOptin } from '@/http/citizen/citizen'
import type { HandlersErrorResponse } from '@/http/models/handlersErrorResponse'
import { getUserInfoFromToken } from '@/lib/user-info'
import { revalidatePath } from 'next/cache'

export async function updateOptInStatus(optin: boolean) {
  const user = await getUserInfoFromToken()
  if (!user.cpf) {
    return { success: false, error: 'Usuário não autenticado' }
  }

  try {
    await putCitizenCpfOptin(user.cpf, { opt_in: optin })
    revalidatePath('/(app)/(logged-in)/user-profile/user-authorizations')
    return { success: true }
  } catch (error: any) {
    const err = error as HandlersErrorResponse
    return { success: false, error: err?.error || 'Erro desconhecido' }
  }
}
