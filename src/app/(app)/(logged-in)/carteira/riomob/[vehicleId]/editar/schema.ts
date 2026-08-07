import {
  type VehicleType,
  isOtherBrand,
  isOtherModel,
} from '../../adicionar-veiculo/mocks/vehicle-catalog'
import {
  type VehicleFormData,
  vehicleFormSchema,
} from '../../adicionar-veiculo/schema'
import type { VehicleDetail } from '../../mocks/vehicles'

export { vehicleFormSchema as vehicleEditFormSchema }
export type { VehicleFormData as VehicleEditFormData }

export function toEditFormDefaults(vehicle: VehicleDetail): VehicleFormData {
  return {
    display_name: vehicle.displayName,
    brand_id: vehicle.brandId,
    brand_other: '',
    model_id: vehicle.modelId,
    model_other: '',
    vehicle_type: vehicle.vehicleType,
    color: vehicle.color,
    serial_number: vehicle.serialNumber,
    serial_number_photo_url: vehicle.serialNumberDocument.url,
    serial_number_photo_name: vehicle.serialNumberDocument.fileName,
    serial_number_photo_size: vehicle.serialNumberDocument.fileSizeBytes,
    vehicle_photo_url: vehicle.vehiclePhoto.url,
    vehicle_photo_name: vehicle.vehiclePhoto.fileName,
    vehicle_photo_size: vehicle.vehiclePhoto.fileSizeBytes,
    has_invoice: true,
    invoice_photo_url: vehicle.invoiceDocument.url,
    invoice_photo_name: vehicle.invoiceDocument.fileName,
    invoice_photo_size: vehicle.invoiceDocument.fileSizeBytes,
    self_declaration: true,
  }
}

/** Shape alinhado ao PATCH /citizen/{cpf}/vehicles/{id} (handoff backend). */
export interface UpdateVehiclePayload {
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
}

export function toUpdateVehiclePayload(
  data: VehicleFormData
): UpdateVehiclePayload {
  const brandIsOther = isOtherBrand(data.brand_id)
  const modelIsOther = isOtherModel(data.model_id)

  return {
    display_name: data.display_name.trim(),
    brand_id: brandIsOther ? null : data.brand_id,
    brand_other: brandIsOther ? (data.brand_other?.trim() ?? null) : null,
    model_id: modelIsOther ? null : data.model_id,
    model_other: modelIsOther ? (data.model_other?.trim() ?? null) : null,
    ...(brandIsOther || modelIsOther
      ? { vehicle_type: data.vehicle_type }
      : {}),
    color: data.color,
    serial_number: data.serial_number.trim().toUpperCase(),
    serial_number_photo_url: data.serial_number_photo_url,
    vehicle_photo_url: data.vehicle_photo_url,
    has_invoice: Boolean(data.has_invoice),
    ...(data.has_invoice === true && data.invoice_photo_url
      ? { invoice_photo_url: data.invoice_photo_url }
      : {}),
  }
}
