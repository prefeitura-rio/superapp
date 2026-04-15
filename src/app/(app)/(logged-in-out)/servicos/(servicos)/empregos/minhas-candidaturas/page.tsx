import { buildAuthUrl } from '@/constants/url'
import { getApiV1EmpregabilidadeCandidaturasUsuarioCpf } from '@/http-courses/empregabilidade-candidaturas/empregabilidade-candidaturas'
import type { EmpregabilidadeCandidatura } from '@/http-courses/models'
import { getUserInfoFromToken } from '@/lib/user-info'
import { redirect } from 'next/navigation'
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

  if (!userAuthInfo.cpf) {
    return redirect(buildAuthUrl('/servicos/empregos/minhas-candidaturas'))
  }

  const cpf = userAuthInfo.cpf.replace(/\D/g, '')

  try {
    const res = await getApiV1EmpregabilidadeCandidaturasUsuarioCpf(cpf, {
      page: 1,
      pageSize: 50,
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

  return (
    <MinhasCandidaturasContent
      candidaturas={candidaturas}
      hasError={hasError}
    />
  )
}
