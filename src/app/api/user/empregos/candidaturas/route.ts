import { candidaturaToCardData } from '@/app/(app)/(logged-in-out)/servicos/(servicos)/trabalho/minhas-candidaturas/minhas-candidaturas-utils'
import { getApiV1EmpregabilidadeCandidaturasUsuarioCpf } from '@/http-courses/empregabilidade-candidaturas/empregabilidade-candidaturas'
import type { EmpregabilidadeCandidatura } from '@/http-courses/models'
import { getUserInfoFromToken } from '@/lib/user-info'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const NO_CACHE_HEADERS = {
  'Cache-Control': 'private, no-cache, no-store, must-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
}

interface CandidaturasListResponse {
  data: EmpregabilidadeCandidatura[]
  meta: { page: number; page_size: number; total: number }
}

export async function GET(request: NextRequest) {
  try {
    const userAuthInfo = await getUserInfoFromToken()

    if (!userAuthInfo.cpf) {
      return NextResponse.json(
        { candidaturas: [], hasCandidaturas: false },
        { headers: NO_CACHE_HEADERS }
      )
    }

    const cpf = userAuthInfo.cpf.replace(/\D/g, '')
    const vagaId = request.nextUrl.searchParams.get('vagaId')

    // Vaga-specific: returns candidatura status for a single vaga
    if (vagaId) {
      const res = await getApiV1EmpregabilidadeCandidaturasUsuarioCpf(cpf, {
        vagaId,
        page: 1,
        pageSize: 1,
      })

      if (res.status !== 200) {
        return NextResponse.json(
          { hasCandidatura: false },
          { headers: NO_CACHE_HEADERS }
        )
      }

      const body = res.data as unknown as CandidaturasListResponse
      const list = Array.isArray(body.data) ? body.data : []

      if (list.length === 0) {
        return NextResponse.json(
          { hasCandidatura: false },
          { headers: NO_CACHE_HEADERS }
        )
      }

      const candidatura = list[0]
      const ordem = candidatura.etapa_atual?.ordem
      const etapaAtualCandidatura =
        typeof ordem === 'number' && ordem >= 1 ? ordem - 1 : undefined

      return NextResponse.json(
        {
          hasCandidatura: true,
          etapaAtualCandidatura,
          statusCandidatura: candidatura.status ?? undefined,
        },
        { headers: NO_CACHE_HEADERS }
      )
    }

    // Full list: returns all candidaturas for the user
    const res = await getApiV1EmpregabilidadeCandidaturasUsuarioCpf(cpf, {
      page: 1,
      pageSize: 50,
    })

    if (res.status !== 200) {
      return NextResponse.json(
        { candidaturas: [], hasCandidaturas: false },
        { headers: NO_CACHE_HEADERS }
      )
    }

    const body = res.data as unknown as CandidaturasListResponse
    const list = Array.isArray(body.data) ? body.data : []
    const candidaturas = list.map(candidaturaToCardData)

    return NextResponse.json(
      { candidaturas, hasCandidaturas: candidaturas.length > 0 },
      { headers: NO_CACHE_HEADERS }
    )
  } catch (error) {
    console.error('Error in candidaturas API route:', error)
    return NextResponse.json(
      { candidaturas: [], hasCandidaturas: false },
      { status: 500, headers: NO_CACHE_HEADERS }
    )
  }
}
