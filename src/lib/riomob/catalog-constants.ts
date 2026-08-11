import type { VehicleType } from '@/lib/riomob/types'

export type { VehicleType }

export const OTHER_BRAND_ID = 'brand_outro'
export const OTHER_MODEL_ID = 'model_outro'

export const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
  bicicleta_eletrica: 'Bicicleta elétrica',
  autopropelido: 'Autopropelido',
  ciclomotor: 'Ciclomotor',
}

export const VEHICLE_TYPE_OPTIONS = (
  Object.entries(VEHICLE_TYPE_LABELS) as [VehicleType, string][]
).map(([value, label]) => ({ value, label }))

export function isOtherBrand(brandId: string | null | undefined) {
  return brandId === OTHER_BRAND_ID
}

export function isOtherModel(modelId: string | null | undefined) {
  return modelId === OTHER_MODEL_ID
}
