import { listRiomobInvitations } from '@/lib/riomob/invitation-service'
import { getUserInfoFromToken } from '@/lib/user-info'
import { NextResponse } from 'next/server'

const NO_CACHE_HEADERS = {
  'Cache-Control': 'private, no-cache, no-store, must-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
}

export async function GET() {
  try {
    const user = await getUserInfoFromToken()
    if (!user.cpf) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401, headers: NO_CACHE_HEADERS }
      )
    }

    const invitations = await listRiomobInvitations(user.cpf)
    return NextResponse.json({ invitations }, { headers: NO_CACHE_HEADERS })
  } catch (error) {
    console.error('[riomob] GET /api/riomob/invitations', error)
    return NextResponse.json(
      { error: 'Falha ao listar convites' },
      { status: 500, headers: NO_CACHE_HEADERS }
    )
  }
}
