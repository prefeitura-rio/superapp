import { getApiV1EmpregabilidadeCandidaturas } from '@/http-courses/empregabilidade-candidaturas/empregabilidade-candidaturas'
import type { EmpregabilidadeCandidatura } from '@/http-courses/models'
import { getUserInfoFromToken } from '@/lib/user-info'
import { MinhasCandidaturasContent } from './minhas-candidaturas-content'
import {
  type CandidaturaCardData,
  candidaturaToCardData,
} from './minhas-candidaturas-utils'

interface CandidaturasListResponse {
  data: EmpregabilidadeCandidatura[]
  meta: { page: number; page_size: number; total: number }
}

export default async function MinhasCandidaturasPage() {
  let candidaturas: CandidaturaCardData[] = []
  let hasError = false

  const userAuthInfo = await getUserInfoFromToken()
  const cpf = userAuthInfo.cpf?.replace(/\D/g, '') ?? ''

  if (!cpf) {
    hasError = true
  } else {
    try {
      const res = await getApiV1EmpregabilidadeCandidaturas({
        page: 1,
        pageSize: 50,
        cpf,
      })
      if (res.status === 200) {
        const body = res.data as unknown as CandidaturasListResponse
        const list = Array.isArray(body.data) ? body.data : []
        candidaturas = list.map(candidaturaToCardData)
      } else {
        hasError = true
      }
    } catch {
      hasError = true
    }
  }

  return (
    <MinhasCandidaturasContent
      candidaturas={candidaturas}
      hasError={hasError}
    />
  )
}
