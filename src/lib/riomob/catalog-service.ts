import {
  getMobilidadeVehicleBrands,
  getMobilidadeVehicleColors,
  getMobilidadeVehicleModels,
} from '@/http/mobilidade/mobilidade'
import {
  mapVehicleBrandToOption,
  mapVehicleModelToOption,
} from '@/lib/riomob/mappers'
import type { VehicleBrandOption, VehicleModelOption } from '@/lib/riomob/types'

export async function listRiomobVehicleBrands(): Promise<VehicleBrandOption[]> {
  const response = await getMobilidadeVehicleBrands()
  if (response.status !== 200) {
    throw new Error('Falha ao listar marcas')
  }

  return (response.data.data ?? [])
    .map(mapVehicleBrandToOption)
    .filter((b): b is VehicleBrandOption => b !== null)
}

export async function listRiomobVehicleModels(
  brandId: string
): Promise<VehicleModelOption[]> {
  const response = await getMobilidadeVehicleModels({ brand_id: brandId })
  if (response.status !== 200) {
    throw new Error('Falha ao listar modelos')
  }

  return (response.data.data ?? [])
    .map(mapVehicleModelToOption)
    .filter((m): m is VehicleModelOption => m !== null)
}

export async function listRiomobVehicleColors(): Promise<string[]> {
  const response = await getMobilidadeVehicleColors()
  if (response.status !== 200) {
    throw new Error('Falha ao listar cores')
  }

  return response.data.data ?? []
}
