import type { ModelsVehicleBrand } from '@/http/models/modelsVehicleBrand'
import type { ModelsVehicleConductor } from '@/http/models/modelsVehicleConductor'
import type { ModelsVehicleDetail } from '@/http/models/modelsVehicleDetail'
import type { ModelsVehicleInvitationItem } from '@/http/models/modelsVehicleInvitationItem'
import type { ModelsVehicleListItem } from '@/http/models/modelsVehicleListItem'
import type { ModelsVehicleModel } from '@/http/models/modelsVehicleModel'
import type { ModelsVehicleRole } from '@/http/models/modelsVehicleRole'
import type { ModelsVehicleType } from '@/http/models/modelsVehicleType'
import type {
  AuthorizedConductor,
  PendingConductorInvite,
  VehicleBrandOption,
  VehicleCategory,
  VehicleDetail,
  VehicleDocument,
  VehicleModelOption,
  VehiclePhoto,
  VehicleType,
  WalletVehicle,
} from '@/lib/riomob/types'

const DEFAULT_VEHICLE_TYPE: VehicleType = 'autopropelido'

export function formatFileSizeLabel(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0B'
  if (bytes < 1024) return `${bytes}B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(kb < 10 ? 2 : 0)}KB`
  const mb = bytes / (1024 * 1024)
  return `${mb.toFixed(2)}MB`
}

function mapVehicleType(value: ModelsVehicleType | undefined): VehicleType {
  if (
    value === 'bicicleta_eletrica' ||
    value === 'autopropelido' ||
    value === 'ciclomotor'
  ) {
    return value
  }
  return DEFAULT_VEHICLE_TYPE
}

function mapRoleToCategory(
  role: ModelsVehicleRole | undefined
): VehicleCategory {
  return role === 'conductor' ? 'condutor' : 'proprietaria'
}

function buildBrandModelLabel(item: {
  brand_other?: string
  model_other?: string
  brand_id?: string
  model_id?: string
}): string {
  const brand = item.brand_other?.trim() || item.brand_id?.trim() || ''
  const model = item.model_other?.trim() || item.model_id?.trim() || ''
  if (brand && model) return `${brand} ${model}`
  return brand || model || '—'
}

function toDocument(
  url: string | undefined,
  fileName: string | undefined,
  fileSize: number | undefined
): VehicleDocument {
  const bytes = fileSize ?? 0
  return {
    url: url ?? '',
    fileName: fileName || 'documento',
    fileSizeBytes: bytes,
    fileSizeLabel: formatFileSizeLabel(bytes),
    verified: true,
  }
}

function toPhoto(
  url: string | undefined,
  fileName: string | undefined,
  fileSize: number | undefined
): VehiclePhoto {
  return {
    url: url ?? '',
    fileName: fileName || 'foto',
    fileSizeBytes: fileSize ?? 0,
  }
}

export function mapVehicleListItemToWalletVehicle(
  item: ModelsVehicleListItem
): WalletVehicle | null {
  if (!item.id) return null

  const category = mapRoleToCategory(item.role)

  return {
    id: item.id,
    displayName: item.display_name?.trim() || 'Veículo',
    vehicleType: mapVehicleType(item.vehicle_type),
    registrationNumber: item.registration_number?.trim() || '—',
    category,
    photoUrl: item.vehicle_photo_url ?? '',
    ...(category === 'condutor' && item.conductor_id
      ? { conductorId: item.conductor_id }
      : {}),
  }
}

export function mapVehicleConductorToAuthorized(
  conductor: ModelsVehicleConductor
): AuthorizedConductor | null {
  if (!conductor.id || conductor.status !== 'accepted') return null

  return {
    id: conductor.id,
    name: conductor.conductor_name?.trim() || 'Condutor',
    cpf: conductor.conductor_cpf?.trim() || '',
    phone: conductor.phone?.trim() || '',
    email: conductor.notify_email?.trim() || '',
  }
}

export function mapVehicleDetailToUi(
  detail: ModelsVehicleDetail,
  conductors: ModelsVehicleConductor[] = []
): VehicleDetail | null {
  if (!detail.id) return null

  const authorizedConductors = conductors
    .map(mapVehicleConductorToAuthorized)
    .filter((c): c is AuthorizedConductor => c !== null)

  const category = mapRoleToCategory(detail.role)

  return {
    id: detail.id,
    displayName: detail.display_name?.trim() || 'Veículo',
    vehicleType: mapVehicleType(detail.vehicle_type),
    registrationNumber: detail.registration_number?.trim() || '—',
    category,
    photoUrl: detail.vehicle_photo_url ?? '',
    ...(category === 'condutor' && detail.conductor_id
      ? { conductorId: detail.conductor_id }
      : {}),
    owner: {
      name: detail.owner_name?.trim() || '',
      cpf: detail.owner_cpf?.trim() || '',
      phone: detail.owner_phone?.trim() || '',
      email: detail.owner_email?.trim() || '',
    },
    brandModel: buildBrandModelLabel(detail),
    brandId: detail.brand_id ?? '',
    modelId: detail.model_id ?? '',
    color: detail.color?.trim() || '',
    serialNumber: detail.serial_number?.trim() || '',
    serialNumberDocument: toDocument(
      detail.serial_number_photo_url,
      detail.serial_number_photo_file_name,
      detail.serial_number_photo_file_size
    ),
    invoiceDocument: toDocument(
      detail.invoice_photo_url,
      detail.invoice_photo_file_name,
      detail.invoice_photo_file_size
    ),
    vehiclePhoto: toPhoto(
      detail.vehicle_photo_url,
      detail.vehicle_photo_file_name,
      detail.vehicle_photo_file_size
    ),
    authorizedConductors,
  }
}

export function mapInvitationItemToPending(
  item: ModelsVehicleInvitationItem
): PendingConductorInvite | null {
  if (!item.id || item.status !== 'pending' || !item.vehicle_id) return null

  const ownerFirstName =
    item.owner_name?.trim().split(/\s+/)[0] || 'Proprietário'

  return {
    id: item.id,
    inviterDisplayName: ownerFirstName,
    vehicleDisplayName: item.vehicle?.display_name?.trim() || 'Veículo',
    vehicleId: item.vehicle_id,
    invitedAt: item.created_at || new Date(0).toISOString(),
  }
}

export function mapVehicleBrandToOption(
  brand: ModelsVehicleBrand
): VehicleBrandOption | null {
  if (!brand.id || !brand.name) return null
  return {
    id: brand.id,
    name: brand.name,
    isOther: brand.is_other,
  }
}

export function mapVehicleModelToOption(
  model: ModelsVehicleModel
): VehicleModelOption | null {
  if (!model.id || !model.name || !model.brand_id) return null
  return {
    id: model.id,
    brand_id: model.brand_id,
    name: model.name,
    vehicle_type: mapVehicleType(model.vehicle_type),
    isOther: model.is_other,
  }
}

/** Strip UI-only fields before POST to Orval create model. */
export function toApiCreateBody(payload: {
  display_name: string
  brand_id: string | null
  brand_other: string | null
  model_id: string | null
  model_other: string | null
  vehicle_type?: VehicleType
  color: string
  serial_number: string
  serial_number_photo_url: string
  vehicle_photo_url: string
  has_invoice: boolean
  invoice_photo_url?: string
  self_declaration: true
  serial_number_photo_file_name?: string
  serial_number_photo_file_size?: number
  vehicle_photo_file_name?: string
  vehicle_photo_file_size?: number
  invoice_photo_file_name?: string
  invoice_photo_file_size?: number
}) {
  return {
    display_name: payload.display_name,
    color: payload.color,
    serial_number: payload.serial_number,
    serial_number_photo_url: payload.serial_number_photo_url,
    vehicle_photo_url: payload.vehicle_photo_url,
    has_invoice: payload.has_invoice,
    self_declaration: payload.self_declaration as true,
    ...optionalVehicleFields(payload),
  }
}

/** Strip UI-only fields before PATCH to Orval update model. */
export function toApiUpdateBody(payload: {
  display_name: string
  brand_id: string | null
  brand_other: string | null
  model_id: string | null
  model_other: string | null
  vehicle_type?: VehicleType
  color: string
  serial_number: string
  serial_number_photo_url: string
  vehicle_photo_url: string
  has_invoice: boolean
  invoice_photo_url?: string
  serial_number_photo_file_name?: string
  serial_number_photo_file_size?: number
  vehicle_photo_file_name?: string
  vehicle_photo_file_size?: number
  invoice_photo_file_name?: string
  invoice_photo_file_size?: number
}) {
  return {
    display_name: payload.display_name,
    color: payload.color,
    serial_number: payload.serial_number,
    serial_number_photo_url: payload.serial_number_photo_url,
    vehicle_photo_url: payload.vehicle_photo_url,
    has_invoice: payload.has_invoice,
    ...optionalVehicleFields(payload),
  }
}

function optionalVehicleFields(payload: {
  brand_id: string | null
  brand_other: string | null
  model_id: string | null
  model_other: string | null
  vehicle_type?: VehicleType
  invoice_photo_url?: string
  serial_number_photo_file_name?: string
  serial_number_photo_file_size?: number
  vehicle_photo_file_name?: string
  vehicle_photo_file_size?: number
  invoice_photo_file_name?: string
  invoice_photo_file_size?: number
}) {
  return {
    ...(payload.brand_id ? { brand_id: payload.brand_id } : {}),
    ...(payload.brand_other ? { brand_other: payload.brand_other } : {}),
    ...(payload.model_id ? { model_id: payload.model_id } : {}),
    ...(payload.model_other ? { model_other: payload.model_other } : {}),
    ...(payload.vehicle_type ? { vehicle_type: payload.vehicle_type } : {}),
    ...(payload.invoice_photo_url
      ? { invoice_photo_url: payload.invoice_photo_url }
      : {}),
    ...(payload.serial_number_photo_file_name
      ? { serial_number_photo_file_name: payload.serial_number_photo_file_name }
      : {}),
    ...(payload.serial_number_photo_file_size != null
      ? { serial_number_photo_file_size: payload.serial_number_photo_file_size }
      : {}),
    ...(payload.vehicle_photo_file_name
      ? { vehicle_photo_file_name: payload.vehicle_photo_file_name }
      : {}),
    ...(payload.vehicle_photo_file_size != null
      ? { vehicle_photo_file_size: payload.vehicle_photo_file_size }
      : {}),
    ...(payload.invoice_photo_file_name
      ? { invoice_photo_file_name: payload.invoice_photo_file_name }
      : {}),
    ...(payload.invoice_photo_file_size != null
      ? { invoice_photo_file_size: payload.invoice_photo_file_size }
      : {}),
  }
}
