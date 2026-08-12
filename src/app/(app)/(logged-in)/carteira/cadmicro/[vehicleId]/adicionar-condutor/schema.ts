import { z } from 'zod'

function digitsOnly(value: string) {
  return value.replace(/\D/g, '')
}

export const conductorInviteFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(120, 'Máximo de 120 caracteres'),
  cpf: z
    .string()
    .min(1, 'CPF é obrigatório')
    .refine(value => digitsOnly(value).length === 11, 'CPF inválido'),
  email: z.string().min(1, 'Email é obrigatório').email('Email inválido'),
})

export type ConductorInviteFormData = z.infer<typeof conductorInviteFormSchema>

/** Shape alinhado ao POST /citizen/{cpf}/vehicles/{vehicle_id}/conductors. */
export interface InviteConductorPayload {
  vehicle_id: string
  cpf: string
  name: string
  email: string
}

export function toInviteConductorPayload(
  data: ConductorInviteFormData,
  vehicleId: string
): InviteConductorPayload {
  return {
    vehicle_id: vehicleId,
    cpf: digitsOnly(data.cpf),
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
  }
}
