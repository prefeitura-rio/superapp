'use server'

import {
  actionErrorMessage,
  parseActionPayload,
  revalidateCadmicroPaths,
} from '@/actions/cadmicro/utils'
import { deleteCitizenCpfVehiclesVehicleIdConductorsConductorId } from '@/http/mobilidade/mobilidade'
import {
  conductorIdSchema,
  vehicleIdSchema,
} from '@/lib/cadmicro/action-schemas'
import { getUserInfoFromToken } from '@/lib/user-info'

export async function removeConductor(
  vehicleId: string,
  conductorId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getUserInfoFromToken()
    if (!user.cpf) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const vehicleIdResult = parseActionPayload(vehicleIdSchema, vehicleId)
    if (!vehicleIdResult.success) return vehicleIdResult

    const conductorIdResult = parseActionPayload(conductorIdSchema, conductorId)
    if (!conductorIdResult.success) return conductorIdResult

    const response =
      await deleteCitizenCpfVehiclesVehicleIdConductorsConductorId(
        user.cpf,
        vehicleIdResult.data,
        conductorIdResult.data
      )

    if (response.status === 204) {
      revalidateCadmicroPaths(vehicleIdResult.data)
      return { success: true }
    }

    return {
      success: false,
      error: actionErrorMessage(response, 'Erro ao remover condutor'),
    }
  } catch (error) {
    console.error('[cadmicro] removeConductor', error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Erro ao remover condutor',
    }
  }
}
