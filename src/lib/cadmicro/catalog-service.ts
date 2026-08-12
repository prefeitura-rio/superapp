import {
  getMobilidadeVehicleBrands,
  getMobilidadeVehicleColors,
  getMobilidadeVehicleModels,
} from '@/http/mobilidade/mobilidade'
import {
  mapVehicleBrandToOption,
  mapVehicleModelToOption,
} from '@/lib/cadmicro/mappers'
import type {
  VehicleBrandOption,
  VehicleModelOption,
} from '@/lib/cadmicro/types'

export async function listCadmicroVehicleBrands(): Promise<
  VehicleBrandOption[]
> {
  const response = await getMobilidadeVehicleBrands()
  if (response.status !== 200) {
    throw new Error('Falha ao listar marcas')
  }

  return (response.data.data ?? [])
    .map(mapVehicleBrandToOption)
    .filter((b): b is VehicleBrandOption => b !== null)
}

export async function listCadmicroVehicleModels(
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

export async function listCadmicroVehicleColors(): Promise<string[]> {
  const response = await getMobilidadeVehicleColors()
  if (response.status !== 200) {
    throw new Error('Falha ao listar cores')
  }

  return response.data.data ?? []
}
