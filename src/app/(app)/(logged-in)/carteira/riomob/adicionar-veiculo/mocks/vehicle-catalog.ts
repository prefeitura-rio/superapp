export type VehicleType = 'bicicleta_eletrica' | 'autopropelido' | 'ciclomotor'

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

export const VEHICLE_COLORS = [
  'Amarelo',
  'Azul',
  'Azul Claro',
  'Azul Escuro',
  'Bege',
  'Branco',
  'Bronze',
  'Cereja',
  'Cinza',
  'Creme',
  'Dourado',
  'Laranja',
  'Lilás',
  'Marrom',
  'Preto',
  'Prata',
  'Rosa',
  'Roxo',
  'Verde',
  'Verde Claro',
  'Verde Escuro',
  'Vermelho',
  'Vinho',
] as const

export interface VehicleBrand {
  id: string
  name: string
}

export interface VehicleModel {
  id: string
  brand_id: string
  name: string
  vehicle_type: VehicleType
}

/** Catálogo mock — substituir por GET /riomob/vehicle-brands e /vehicle-models. */
export const VEHICLE_BRANDS: VehicleBrand[] = [
  { id: 'brand_caloi', name: 'Caloi' },
  { id: 'brand_oggi', name: 'Oggi' },
  { id: 'brand_sense', name: 'Sense' },
  { id: 'brand_xiaomi', name: 'Xiaomi' },
  { id: 'brand_segway', name: 'Segway' },
  { id: OTHER_BRAND_ID, name: 'Outro' },
]

export const VEHICLE_MODELS: VehicleModel[] = [
  {
    id: 'model_e_vibe',
    brand_id: 'brand_caloi',
    name: 'E-Vibe',
    vehicle_type: 'bicicleta_eletrica',
  },
  {
    id: 'model_easy_rider',
    brand_id: 'brand_caloi',
    name: 'Easy Rider',
    vehicle_type: 'bicicleta_eletrica',
  },
  {
    id: 'model_big_wheel',
    brand_id: 'brand_oggi',
    name: 'Big Wheel E-Bike',
    vehicle_type: 'bicicleta_eletrica',
  },
  {
    id: 'model_impulse',
    brand_id: 'brand_sense',
    name: 'Impulse Evo',
    vehicle_type: 'bicicleta_eletrica',
  },
  {
    id: 'model_mi_scooter_4',
    brand_id: 'brand_xiaomi',
    name: 'Mi Electric Scooter 4',
    vehicle_type: 'autopropelido',
  },
  {
    id: 'model_ninebot_max',
    brand_id: 'brand_segway',
    name: 'Ninebot Max G30',
    vehicle_type: 'autopropelido',
  },
  {
    id: 'model_ninebot_f40',
    brand_id: 'brand_segway',
    name: 'Ninebot F40',
    vehicle_type: 'ciclomotor',
  },
  {
    id: OTHER_MODEL_ID,
    brand_id: OTHER_BRAND_ID,
    name: 'Outro',
    vehicle_type: 'bicicleta_eletrica',
  },
]

export function getModelsByBrandId(brandId: string): VehicleModel[] {
  return VEHICLE_MODELS.filter(model => model.brand_id === brandId)
}

export function getBrandById(brandId: string | null | undefined) {
  if (!brandId) return undefined
  return VEHICLE_BRANDS.find(brand => brand.id === brandId)
}

export function getModelById(modelId: string | null | undefined) {
  if (!modelId) return undefined
  return VEHICLE_MODELS.find(model => model.id === modelId)
}

export function isOtherBrand(brandId: string | null | undefined) {
  return brandId === OTHER_BRAND_ID
}

export function isOtherModel(modelId: string | null | undefined) {
  return modelId === OTHER_MODEL_ID
}
