import { z } from 'zod'
import {
  type VehicleType,
  isOtherBrand,
  isOtherModel,
} from './mocks/vehicle-catalog'

const vehicleTypeSchema = z.enum([
  'bicicleta_eletrica',
  'autopropelido',
  'ciclomotor',
])

export const vehicleFormSchema = z
  .object({
    display_name: z
      .string()
      .min(1, 'Nome do veículo é obrigatório')
      .max(80, 'Máximo de 80 caracteres'),
    brand_id: z.string().min(1, 'Selecione a marca'),
    brand_other: z.string().optional(),
    model_id: z.string().min(1, 'Selecione o modelo'),
    model_other: z.string().optional(),
    vehicle_type: vehicleTypeSchema.optional(),
    color: z.string().min(1, 'Selecione a cor'),
    serial_number: z.string().min(1, 'Número de série é obrigatório'),
    serial_number_photo_url: z
      .string()
      .min(1, 'Envie a foto do número de série'),
    serial_number_photo_name: z.string().optional(),
    serial_number_photo_size: z.number().optional(),
    vehicle_photo_url: z.string().min(1, 'Envie a foto do veículo'),
    vehicle_photo_name: z.string().optional(),
    vehicle_photo_size: z.number().optional(),
    has_invoice: z.boolean().nullable(),
    invoice_photo_url: z.string().optional(),
    invoice_photo_name: z.string().optional(),
    invoice_photo_size: z.number().optional(),
    self_declaration: z.boolean(),
    owner_phone: z.string().optional(),
    owner_email: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (isOtherBrand(data.brand_id) && !data.brand_other?.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['brand_other'],
        message: 'Informe a marca do veículo',
      })
    }

    if (isOtherModel(data.model_id) && !data.model_other?.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['model_other'],
        message: 'Informe o modelo do veículo',
      })
    }

    if (
      (isOtherBrand(data.brand_id) || isOtherModel(data.model_id)) &&
      !data.vehicle_type
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['vehicle_type'],
        message: 'Selecione o tipo de veículo',
      })
    }

    if (data.has_invoice === null) {
      ctx.addIssue({
        code: 'custom',
        path: ['has_invoice'],
        message: 'Informe se possui a nota fiscal',
      })
    }

    if (data.has_invoice === true && !data.invoice_photo_url?.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['invoice_photo_url'],
        message: 'Envie a nota fiscal',
      })
    }

    if (!data.self_declaration) {
      ctx.addIssue({
        code: 'custom',
        path: ['self_declaration'],
        message: 'Confirme a autodeclaração',
      })
    }
  })

export type VehicleFormData = z.infer<typeof vehicleFormSchema>

/** Shape alinhado ao POST /citizen/{cpf}/vehicles (handoff backend). */
export interface CreateVehiclePayload {
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
  self_declaration: true
  owner_phone?: string
  owner_email?: string
}

export function toCreateVehiclePayload(
  data: VehicleFormData
): CreateVehiclePayload {
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
    serial_number: data.serial_number.trim(),
    serial_number_photo_url: data.serial_number_photo_url,
    vehicle_photo_url: data.vehicle_photo_url,
    has_invoice: Boolean(data.has_invoice),
    self_declaration: true,
    owner_phone: data.owner_phone,
    owner_email: data.owner_email,
  }
}
