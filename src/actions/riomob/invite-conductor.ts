'use server'

import {
  actionErrorMessage,
  parseActionPayload,
  revalidateRiomobPaths,
} from '@/actions/riomob/utils'
import type { InviteConductorPayload } from '@/app/(app)/(logged-in)/carteira/riomob/[vehicleId]/adicionar-condutor/schema'
import { postCitizenCpfVehiclesVehicleIdConductors } from '@/http/mobilidade/mobilidade'
import { inviteConductorPayloadSchema } from '@/lib/riomob/action-schemas'
import { isRiomobMocksEnabled } from '@/lib/riomob/mocks-gate'
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

    if (isRiomobMocksEnabled()) {
      revalidateRiomobPaths(validated.data.vehicle_id)
      return { success: true }
    }

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
      revalidateRiomobPaths(validated.data.vehicle_id)
      return { success: true }
    }

    return {
      success: false,
      error: actionErrorMessage(response, 'Erro ao convidar condutor'),
    }
  } catch (error) {
    console.error('[riomob] inviteConductor', error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Erro ao convidar condutor',
    }
  }
}
