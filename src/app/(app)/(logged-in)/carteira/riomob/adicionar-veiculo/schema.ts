import { isGcsObjectUrl } from '@/lib/riomob/file-types'
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

const vehicleColorSchema = z.string().min(1, 'Selecione a cor')

/** Letras/números Unicode + espaço/hífen/apóstrofo/ponto/& — sem emoji/URL. */
const FREE_TEXT_50_RE = /^[\p{L}\p{N}](?:[\p{L}\p{N}\s\-'.&]*[\p{L}\p{N}])?$/u
const SERIAL_NUMBER_RE = /^[A-Za-z0-9-]+$/

function freeText50(requiredMessage: string) {
  return z
    .string()
    .trim()
    .min(1, requiredMessage)
    .max(50, 'Máximo de 50 caracteres')
    .regex(FREE_TEXT_50_RE, 'Use apenas letras, números e pontuação simples')
}

function serialNumberSchema() {
  return z
    .string()
    .trim()
    .min(1, 'Número de série é obrigatório')
    .min(4, 'Mínimo de 4 caracteres')
    .max(40, 'Máximo de 40 caracteres')
    .regex(SERIAL_NUMBER_RE, 'Use apenas letras, números e hífen (sem espaços)')
}

function isValidRiomobPhotoUrl(url: string): boolean {
  if (!url.trim()) return false
  if (url.startsWith('blob:')) return false
  return isGcsObjectUrl(url)
}

function gcsPhotoUrlSchema(requiredMessage: string) {
  return z.string().min(1, requiredMessage).refine(isValidRiomobPhotoUrl, {
    message: 'Envie um arquivo válido (upload para o armazenamento)',
  })
}

function refineVehicleInfoFields(
  data: {
    brand_id: string
    brand_other?: string
    model_id: string
    model_other?: string
    vehicle_type?: VehicleType
  },
  ctx: z.RefinementCtx
) {
  if (isOtherBrand(data.brand_id)) {
    const brandOther = freeText50('Informe a marca do veículo').safeParse(
      data.brand_other ?? ''
    )
    if (!brandOther.success) {
      for (const issue of brandOther.error.issues) {
        ctx.addIssue({ ...issue, path: ['brand_other'] })
      }
    }
  }

  if (isOtherModel(data.model_id)) {
    const modelOther = freeText50('Informe o modelo do veículo').safeParse(
      data.model_other ?? ''
    )
    if (!modelOther.success) {
      for (const issue of modelOther.error.issues) {
        ctx.addIssue({ ...issue, path: ['model_other'] })
      }
    }
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
}

function refineSerialPhotosFields(
  data: {
    has_invoice: boolean | null
    invoice_photo_url?: string
    self_declaration: boolean
  },
  ctx: z.RefinementCtx
) {
  if (data.has_invoice === null) {
    ctx.addIssue({
      code: 'custom',
      path: ['has_invoice'],
      message: 'Informe se possui a nota fiscal',
    })
  }

  if (data.has_invoice === true) {
    if (!data.invoice_photo_url?.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['invoice_photo_url'],
        message: 'Envie a nota fiscal',
      })
    } else if (!isValidRiomobPhotoUrl(data.invoice_photo_url)) {
      ctx.addIssue({
        code: 'custom',
        path: ['invoice_photo_url'],
        message: 'Envie um arquivo válido (upload para o armazenamento)',
      })
    }
  }

  if (!data.self_declaration) {
    ctx.addIssue({
      code: 'custom',
      path: ['self_declaration'],
      message: 'Confirme a autodeclaração',
    })
  }
}

const vehicleInfoFieldsObject = z.object({
  display_name: freeText50('Nome do veículo é obrigatório'),
  brand_id: z.string().min(1, 'Selecione a marca'),
  brand_other: z.string().optional(),
  model_id: z.string().min(1, 'Selecione o modelo'),
  model_other: z.string().optional(),
  vehicle_type: vehicleTypeSchema.optional(),
  color: vehicleColorSchema,
})

const serialPhotosFieldsObject = z.object({
  serial_number: serialNumberSchema(),
  serial_number_photo_url: gcsPhotoUrlSchema('Envie a foto do número de série'),
  serial_number_photo_name: z.string().optional(),
  serial_number_photo_size: z.number().optional(),
  vehicle_photo_url: gcsPhotoUrlSchema('Envie a foto do veículo'),
  vehicle_photo_name: z.string().optional(),
  vehicle_photo_size: z.number().optional(),
  has_invoice: z.boolean().nullable(),
  invoice_photo_url: z.string().optional(),
  invoice_photo_name: z.string().optional(),
  invoice_photo_size: z.number().optional(),
  self_declaration: z.boolean(),
})

export const vehicleInfoSlideSchema = vehicleInfoFieldsObject.superRefine(
  refineVehicleInfoFields
)

export const serialPhotosSlideSchema = serialPhotosFieldsObject.superRefine(
  refineSerialPhotosFields
)

export const vehicleFormSchema = vehicleInfoFieldsObject
  .merge(serialPhotosFieldsObject)
  .extend({
    owner_phone: z.string().optional(),
    owner_email: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    refineVehicleInfoFields(data, ctx)
    refineSerialPhotosFields(data, ctx)
  })

export type VehicleFormData = z.infer<typeof vehicleFormSchema>

export function isVehicleInfoSlideValid(
  values: Partial<VehicleFormData>
): boolean {
  return vehicleInfoSlideSchema.safeParse(values).success
}

export function isSerialPhotosSlideValid(
  values: Partial<VehicleFormData>
): boolean {
  return serialPhotosSlideSchema.safeParse(values).success
}

/** Shape alinhado ao POST /citizen/{cpf}/vehicles (handoff backend + proposta invoice_photo_url). */
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
  invoice_photo_url?: string
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
    serial_number: data.serial_number.trim().toUpperCase(),
    serial_number_photo_url: data.serial_number_photo_url,
    vehicle_photo_url: data.vehicle_photo_url,
    has_invoice: Boolean(data.has_invoice),
    ...(data.has_invoice === true && data.invoice_photo_url
      ? { invoice_photo_url: data.invoice_photo_url }
      : {}),
    self_declaration: true,
    owner_phone: data.owner_phone,
    owner_email: data.owner_email,
  }
}
