import { listCadmicroVehicles } from '@/lib/cadmicro/vehicle-service'
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

    const vehicles = await listCadmicroVehicles(user.cpf)
    return NextResponse.json({ vehicles }, { headers: NO_CACHE_HEADERS })
  } catch (error) {
    console.error('[cadmicro] GET /api/cadmicro/vehicles', error)
    return NextResponse.json(
      { error: 'Falha ao listar veículos' },
      { status: 500, headers: NO_CACHE_HEADERS }
    )
  }
}
