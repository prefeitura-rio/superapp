'use server'

import {
  actionErrorMessage,
  parseActionPayload,
  revalidateCadmicroPaths,
} from '@/actions/cadmicro/utils'
import type { InviteConductorPayload } from '@/app/(app)/(logged-in)/carteira/cadmicro/[vehicleId]/adicionar-condutor/schema'
import { postCitizenCpfVehiclesVehicleIdConductors } from '@/http/mobilidade/mobilidade'
import { inviteConductorPayloadSchema } from '@/lib/cadmicro/action-schemas'
import { getUserInfoFromToken } from '@/lib/user-info'

export async function inviteConductor(
  payload: InviteConductorPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getUserInfoFromToken()
    if (!user.cpf) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const validated = parseActionPayload(
      inviteConductorPayloadSchema,
      payload,
      'Dados do convite inválidos'
    )
    if (!validated.success) return validated

    const response = await postCitizenCpfVehiclesVehicleIdConductors(
      user.cpf,
      validated.data.vehicle_id,
      {
        cpf: validated.data.cpf,
        email: validated.data.email,
        name: validated.data.name,
      }
    )

    if (response.status === 201) {
      revalidateCadmicroPaths(validated.data.vehicle_id)
      return { success: true }
    }

    return {
      success: false,
      error: actionErrorMessage(response, 'Erro ao convidar condutor'),
    }
  } catch (error) {
    console.error('[cadmicro] inviteConductor', error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Erro ao convidar condutor',
    }
  }
}
