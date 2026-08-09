'use server'

import {
  actionErrorMessage,
  revalidateRiomobPaths,
} from '@/actions/riomob/utils'
import type { InviteConductorPayload } from '@/app/(app)/(logged-in)/carteira/riomob/[vehicleId]/adicionar-condutor/schema'
import { postCitizenCpfVehiclesVehicleIdConductors } from '@/http/mobilidade/mobilidade'
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

    if (isRiomobMocksEnabled()) {
      revalidateRiomobPaths(payload.vehicle_id)
      return { success: true }
    }

    const response = await postCitizenCpfVehiclesVehicleIdConductors(
      user.cpf,
      payload.vehicle_id,
      {
        cpf: payload.cpf,
        email: payload.email,
        name: payload.name,
      }
    )

    if (response.status === 201) {
      revalidateRiomobPaths(payload.vehicle_id)
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
