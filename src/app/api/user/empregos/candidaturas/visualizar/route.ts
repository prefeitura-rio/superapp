import { getUserInfoFromToken } from '@/lib/user-info'
import { NextResponse } from 'next/server'
import { customFetch } from '../../../../../../../custom-fetch-course'

const NO_CACHE_HEADERS = {
  'Cache-Control': 'private, no-cache, no-store, must-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
}

/**
 * Marca como vistas as atualizações das candidaturas do cidadão logado, o que
 * zera a contagem do card "Minhas candidaturas".
 *
 * O endpoint é novo no app-go-api e ainda não está no client Orval: até
 * regenerar `src/http-courses`, a rota usa direto o mutator do client.
 */
export async function PUT() {
  const { cpf } = await getUserInfoFromToken()
  if (!cpf) {
    return NextResponse.json(
      { error: 'Usuário não autenticado' },
      { status: 401, headers: NO_CACHE_HEADERS }
    )
  }

  try {
    const res = await customFetch<{ status: number }>(
      `/api/v1/empregabilidade/candidaturas/usuario/${cpf.replace(/\D/g, '')}/visualizar`,
      { method: 'PUT' }
    )
    if (res.status !== 204) {
      return NextResponse.json(
        { error: 'Não foi possível marcar as atualizações como vistas' },
        { status: 502, headers: NO_CACHE_HEADERS }
      )
    }
    return new NextResponse(null, { status: 204, headers: NO_CACHE_HEADERS })
  } catch {
    return NextResponse.json(
      { error: 'Não foi possível marcar as atualizações como vistas' },
      { status: 502, headers: NO_CACHE_HEADERS }
    )
  }
}
