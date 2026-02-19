import type { ModelsCitizen } from '@/http/models'
import { getDalCitizenCpf } from '@/lib/dal'
import { getUserInfoFromToken } from '@/lib/user-info'
import { CurriculoContent } from './curriculo-content'

export default async function CurriculoPage() {
  const userAuthInfo = await getUserInfoFromToken()
  let initialEscolaridade: string | undefined
  if (userAuthInfo.cpf) {
    try {
      const response = await getDalCitizenCpf(userAuthInfo.cpf)
      if (response.status === 200 && response.data) {
        const userInfo = response.data as ModelsCitizen
        initialEscolaridade = userInfo.escolaridade?.trim() || undefined
      }
    } catch {
      // mantém undefined em caso de erro
    }
  }
  return <CurriculoContent initialEscolaridade={initialEscolaridade} />
}
