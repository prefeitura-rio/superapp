import { getApiV1EmpregabilidadeCandidaturaBloqueios } from '@/http-courses/empregabilidade-candidatura-bloqueios/empregabilidade-candidatura-bloqueios'
import { getUserInfoFromToken } from '@/lib/user-info'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const NO_CACHE_HEADERS = {
  'Cache-Control': 'private, no-cache, no-store, must-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
}

export async function GET(request: NextRequest) {
  try {
    const userAuthInfo = await getUserInfoFromToken()

    if (!userAuthInfo.cpf) {
      return NextResponse.json(
        { isBloqueado: false },
        { headers: NO_CACHE_HEADERS }
      )
    }

    const vagaId = request.nextUrl.searchParams.get('vagaId')
    if (!vagaId) {
      return NextResponse.json(
        { isBloqueado: false },
        { status: 400, headers: NO_CACHE_HEADERS }
      )
    }

    const cpfLimpo = userAuthInfo.cpf.replace(/\D/g, '')
    const res = await getApiV1EmpregabilidadeCandidaturaBloqueios({
      cpf: cpfLimpo,
      id_vaga: vagaId,
    })

    console.log(
      '[candidatura-bloqueios GET] status:',
      res.status,
      'data:',
      JSON.stringify(res.data)
    )

    if (res.status !== 200 || !res.data) {
      return NextResponse.json(
        { isBloqueado: false },
        { headers: NO_CACHE_HEADERS }
      )
    }

    const resData = res.data as { meta?: { total?: number } }
    const isBloqueado = (resData.meta?.total ?? 0) > 0

    console.log(
      '[candidatura-bloqueios GET] isBloqueado:',
      isBloqueado,
      'total:',
      resData.meta?.total
    )

    return NextResponse.json({ isBloqueado }, { headers: NO_CACHE_HEADERS })
  } catch (error) {
    console.error('[candidatura-bloqueios] Erro ao consultar bloqueio:', error)
    return NextResponse.json(
      { isBloqueado: false },
      { status: 500, headers: NO_CACHE_HEADERS }
    )
  }
}
