'use server'

import {
  actionErrorMessage,
  parseActionPayload,
  revalidateCadmicroPaths,
} from '@/actions/cadmicro/utils'
import { patchCitizenCpfVehicleInvitationsConductorId } from '@/http/mobilidade/mobilidade'
import type { ModelsInvitationResponseStatus } from '@/http/models/modelsInvitationResponseStatus'
import {
  conductorIdSchema,
  invitationResponseStatusSchema,
  vehicleIdSchema,
} from '@/lib/cadmicro/action-schemas'
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

    const response = await patchCitizenCpfVehicleInvitationsConductorId(
      user.cpf,
      conductorIdResult.data,
      { status: statusResult.data }
    )

    if (response.status === 200) {
      revalidateCadmicroPaths(resolvedVehicleId ?? response.data.vehicle_id)
      return { success: true }
    }

    return {
      success: false,
      error: actionErrorMessage(response, 'Erro ao responder convite'),
    }
  } catch (error) {
    console.error('[cadmicro] respondInvitation', error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Erro ao responder convite',
    }
  }
}
