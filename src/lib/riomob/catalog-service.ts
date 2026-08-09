import {
  OTHER_BRAND_ID,
  OTHER_MODEL_ID,
  VEHICLE_BRANDS,
  VEHICLE_COLORS,
  VEHICLE_MODELS,
  type VehicleBrand,
  type VehicleModel,
} from '@/app/(app)/(logged-in)/carteira/riomob/adicionar-veiculo/mocks/vehicle-catalog'
import {
  getMobilidadeVehicleBrands,
  getMobilidadeVehicleColors,
  getMobilidadeVehicleModels,
} from '@/http/mobilidade/mobilidade'
import {
  mapVehicleBrandToOption,
  mapVehicleModelToOption,
} from '@/lib/riomob/mappers'
import { isRiomobMocksEnabled } from '@/lib/riomob/mocks-gate'
import type { VehicleBrandOption, VehicleModelOption } from '@/lib/riomob/types'

export async function listRiomobVehicleBrands(): Promise<VehicleBrandOption[]> {
  if (isRiomobMocksEnabled()) {
    return VEHICLE_BRANDS.map((brand: VehicleBrand) => ({
      id: brand.id,
      name: brand.name,
      isOther: brand.id === OTHER_BRAND_ID,
    }))
  }

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
  if (isRiomobMocksEnabled()) {
    return VEHICLE_MODELS.filter(
      (model: VehicleModel) => model.brand_id === brandId
    ).map(model => ({
      id: model.id,
      brand_id: model.brand_id,
      name: model.name,
      vehicle_type: model.vehicle_type,
      isOther: model.id === OTHER_MODEL_ID,
    }))
  }

  const response = await getMobilidadeVehicleModels({ brand_id: brandId })
  if (response.status !== 200) {
    throw new Error('Falha ao listar modelos')
  }

  return (response.data.data ?? [])
    .map(mapVehicleModelToOption)
    .filter((m): m is VehicleModelOption => m !== null)
}

export async function listRiomobVehicleColors(): Promise<string[]> {
  if (isRiomobMocksEnabled()) {
    return [...VEHICLE_COLORS]
  }

  const response = await getMobilidadeVehicleColors()
  if (response.status !== 200) {
    throw new Error('Falha ao listar cores')
  }

  return response.data.data ?? []
}
