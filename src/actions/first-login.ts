'use server'

import { putCitizenCpfFirstlogin } from '@/http/citizen/citizen'
import { revalidateDalCitizenCpfFirstlogin } from '@/lib/dal'

export async function setFirstLoginFalse(cpf: string) {
  const result = await putCitizenCpfFirstlogin(cpf)

  // Revalidate the cached first login status
  if (result.status === 200) {
    await revalidateDalCitizenCpfFirstlogin(cpf)
  }

  return result
}
