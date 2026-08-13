import { listCadmicroVehicleBrands } from '@/lib/cadmicro/catalog-service'
import { NextResponse } from 'next/server'

const NO_CACHE_HEADERS = {
  'Cache-Control': 'private, no-cache, no-store, must-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
}

export async function GET() {
  try {
    const brands = await listCadmicroVehicleBrands()
    return NextResponse.json({ brands }, { headers: NO_CACHE_HEADERS })
  } catch (error) {
    console.error('[cadmicro] GET /api/cadmicro/catalog/brands', error)
    return NextResponse.json(
      { error: 'Falha ao listar marcas' },
      { status: 500, headers: NO_CACHE_HEADERS }
    )
  }
}
