import { isGcsObjectUrl } from '@/lib/cadmicro/file-types'
import { z } from 'zod'

const vehicleTypeSchema = z.enum([
  'bicicleta_eletrica',
  'autopropelido',
  'ciclomotor',
])

function gcsUrlSchema(message: string) {
  return z.string().min(1, message).refine(isGcsObjectUrl, {
    message: 'URL de arquivo inválida',
  })
}

const vehicleMutationFields = {
  display_name: z.string().trim().min(1).max(50),
  brand_id: z.string().nullable(),
  brand_other: z.string().nullable(),
  model_id: z.string().nullable(),
  model_other: z.string().nullable(),
  vehicle_type: vehicleTypeSchema.optional(),
  color: z.string().min(1),
  serial_number: z.string().trim().min(4).max(40),
  serial_number_photo_url: gcsUrlSchema('Foto do número de série obrigatória'),
  vehicle_photo_url: gcsUrlSchema('Foto do veículo obrigatória'),
  has_invoice: z.boolean(),
  invoice_photo_url: z.string().optional(),
  serial_number_photo_file_name: z.string().optional(),
  serial_number_photo_file_size: z.number().nonnegative().optional(),
  vehicle_photo_file_name: z.string().optional(),
  vehicle_photo_file_size: z.number().nonnegative().optional(),
  invoice_photo_file_name: z.string().optional(),
  invoice_photo_file_size: z.number().nonnegative().optional(),
}

function refineInvoiceFields(
  data: {
    has_invoice: boolean
    invoice_photo_url?: string
  },
  ctx: z.RefinementCtx
) {
  if (!data.has_invoice) return

  if (!data.invoice_photo_url?.trim()) {
    ctx.addIssue({
      code: 'custom',
      path: ['invoice_photo_url'],
      message: 'Nota fiscal obrigatória',
    })
  } else if (!isGcsObjectUrl(data.invoice_photo_url)) {
    ctx.addIssue({
      code: 'custom',
      path: ['invoice_photo_url'],
      message: 'URL de nota fiscal inválida',
    })
  }
}

/** Hybrid / Outro rules aligned with mobilidade API. */
function refineBrandModelFields(
  data: {
    brand_id: string | null
    brand_other: string | null
    model_id: string | null
    model_other: string | null
    vehicle_type?: z.infer<typeof vehicleTypeSchema>
  },
  ctx: z.RefinementCtx
) {
  const brandIsCatalog = Boolean(data.brand_id?.trim())
  const modelIsCatalog = Boolean(data.model_id?.trim())
  const brandOther = data.brand_other?.trim() ?? ''
  const modelOther = data.model_other?.trim() ?? ''

  if (!brandIsCatalog && !brandOther) {
    ctx.addIssue({
      code: 'custom',
      path: ['brand_other'],
      message: 'Informe a marca do veículo',
    })
  }

  if (!modelIsCatalog && !modelOther) {
    ctx.addIssue({
      code: 'custom',
      path: ['model_other'],
      message: 'Informe o modelo do veículo',
    })
  }

  if ((!brandIsCatalog || !modelIsCatalog) && !data.vehicle_type) {
    ctx.addIssue({
      code: 'custom',
      path: ['vehicle_type'],
      message: 'Selecione o tipo de veículo',
    })
  }
}

export const createVehiclePayloadSchema = z
  .object({
    ...vehicleMutationFields,
    self_declaration: z.literal(true),
    owner_phone: z.string().optional(),
    owner_email: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    refineInvoiceFields(data, ctx)
    refineBrandModelFields(data, ctx)
  })

export const updateVehiclePayloadSchema = z
  .object(vehicleMutationFields)
  .superRefine((data, ctx) => {
    refineInvoiceFields(data, ctx)
    refineBrandModelFields(data, ctx)
  })

export const inviteConductorPayloadSchema = z.object({
  vehicle_id: z.string().min(1),
  cpf: z.string().regex(/^\d{11}$/),
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email(),
})

export const invitationResponseStatusSchema = z.enum(['accepted', 'rejected'])

export const vehicleIdSchema = z.string().min(1, 'ID do veículo inválido')
export const conductorIdSchema = z.string().min(1, 'ID do condutor inválido')

export type CreateVehiclePayloadInput = z.infer<
  typeof createVehiclePayloadSchema
>
export type UpdateVehiclePayloadInput = z.infer<
  typeof updateVehiclePayloadSchema
>
