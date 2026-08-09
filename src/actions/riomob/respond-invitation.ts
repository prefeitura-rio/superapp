'use server'

import {
  actionErrorMessage,
  parseActionPayload,
  revalidateRiomobPaths,
} from '@/actions/riomob/utils'
import { patchCitizenCpfVehicleInvitationsConductorId } from '@/http/mobilidade/mobilidade'
import type { ModelsInvitationResponseStatus } from '@/http/models/modelsInvitationResponseStatus'
import {
  conductorIdSchema,
  invitationResponseStatusSchema,
  vehicleIdSchema,
} from '@/lib/riomob/action-schemas'
import { isRiomobMocksEnabled } from '@/lib/riomob/mocks-gate'
import { getUserInfoFromToken } from '@/lib/user-info'

export async function respondInvitation(
  conductorId: string,
  status: ModelsInvitationResponseStatus,
  vehicleId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getUserInfoFromToken()
    if (!user.cpf) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const conductorIdResult = parseActionPayload(conductorIdSchema, conductorId)
    if (!conductorIdResult.success) return conductorIdResult

    const statusResult = parseActionPayload(
      invitationResponseStatusSchema,
      status
    )
    if (!statusResult.success) return statusResult

    let resolvedVehicleId = vehicleId
    if (vehicleId !== undefined) {
      const vehicleIdResult = parseActionPayload(vehicleIdSchema, vehicleId)
      if (!vehicleIdResult.success) return vehicleIdResult
      resolvedVehicleId = vehicleIdResult.data
    }

    if (isRiomobMocksEnabled()) {
      revalidateRiomobPaths(resolvedVehicleId)
      return { success: true }
    }

    const response = await patchCitizenCpfVehicleInvitationsConductorId(
      user.cpf,
      conductorIdResult.data,
      { status: statusResult.data }
    )

    if (response.status === 200) {
      revalidateRiomobPaths(resolvedVehicleId ?? response.data.vehicle_id)
      return { success: true }
    }

    return {
      success: false,
      error: actionErrorMessage(response, 'Erro ao responder convite'),
    }
  } catch (error) {
    console.error('[riomob] respondInvitation', error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Erro ao responder convite',
    }
  }
}
