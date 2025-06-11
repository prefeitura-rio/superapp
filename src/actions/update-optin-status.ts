'use server'

import { putCitizenCpfOptin } from '@/http/citizen/citizen'
import { getUserInfoFromToken } from '@/lib/user-info'
import { revalidatePath } from 'next/cache'

export async function updateOptInStatus(optin: boolean) {
  const user = await getUserInfoFromToken()
  if (!user.cpf) return

  await putCitizenCpfOptin(user.cpf, { optin })
  revalidatePath('/(private)/user-profile/user-authorizations')
}
