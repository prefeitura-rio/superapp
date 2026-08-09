import { isGcsObjectUrl } from '@/lib/riomob/file-types'
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

export const createVehiclePayloadSchema = z
  .object({
    ...vehicleMutationFields,
    self_declaration: z.literal(true),
    owner_phone: z.string().optional(),
    owner_email: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.has_invoice) {
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
  })

export const updateVehiclePayloadSchema = z
  .object(vehicleMutationFields)
  .superRefine((data, ctx) => {
    if (data.has_invoice) {
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
