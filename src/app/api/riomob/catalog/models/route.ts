import { listRiomobVehicleModels } from '@/lib/riomob/catalog-service'
import { NextResponse } from 'next/server'

const NO_CACHE_HEADERS = {
  'Cache-Control': 'private, no-cache, no-store, must-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
}

export async function GET(request: Request) {
  try {
    const brandId = new URL(request.url).searchParams.get('brand_id')
    if (!brandId) {
      return NextResponse.json(
        { error: 'brand_id é obrigatório' },
        { status: 400, headers: NO_CACHE_HEADERS }
      )
    }

    const models = await listRiomobVehicleModels(brandId)
    return NextResponse.json({ models }, { headers: NO_CACHE_HEADERS })
  } catch (error) {
    console.error('[riomob] GET /api/riomob/catalog/models', error)
    return NextResponse.json(
      { error: 'Falha ao listar modelos' },
      { status: 500, headers: NO_CACHE_HEADERS }
    )
  }
}
