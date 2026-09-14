import { listCadmicroVehicleColors } from '@/lib/cadmicro/catalog-service'
import { NextResponse } from 'next/server'

const NO_CACHE_HEADERS = {
  'Cache-Control': 'private, no-cache, no-store, must-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
}

export async function GET() {
  try {
    const colors = await listCadmicroVehicleColors()
    return NextResponse.json({ colors }, { headers: NO_CACHE_HEADERS })
  } catch (error) {
    console.error('[cadmicro] GET /api/cadmicro/catalog/colors', error)
    return NextResponse.json(
      { error: 'Falha ao listar cores' },
      { status: 500, headers: NO_CACHE_HEADERS }
    )
  }
}
