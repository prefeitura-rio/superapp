import { getCadmicroVehicle } from '@/lib/cadmicro/vehicle-service'
import { getUserInfoFromToken } from '@/lib/user-info'
import { NextResponse } from 'next/server'

const NO_CACHE_HEADERS = {
  'Cache-Control': 'private, no-cache, no-store, must-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
}

interface RouteParams {
  params: Promise<{ vehicleId: string }>
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const user = await getUserInfoFromToken()
    if (!user.cpf) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401, headers: NO_CACHE_HEADERS }
      )
    }

    const { vehicleId } = await params
    const vehicle = await getCadmicroVehicle(user.cpf, vehicleId)

    if (!vehicle) {
      return NextResponse.json(
        { error: 'Veículo não encontrado' },
        { status: 404, headers: NO_CACHE_HEADERS }
      )
    }

    return NextResponse.json({ vehicle }, { headers: NO_CACHE_HEADERS })
  } catch (error) {
    console.error('[cadmicro] GET /api/cadmicro/vehicles/[vehicleId]', error)
    return NextResponse.json(
      { error: 'Falha ao buscar veículo' },
      { status: 500, headers: NO_CACHE_HEADERS }
    )
  }
}
