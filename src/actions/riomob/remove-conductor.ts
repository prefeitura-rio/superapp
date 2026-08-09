'use server'

import {
  actionErrorMessage,
  parseActionPayload,
  revalidateRiomobPaths,
} from '@/actions/riomob/utils'
import { deleteCitizenCpfVehiclesVehicleIdConductorsConductorId } from '@/http/mobilidade/mobilidade'
import { conductorIdSchema, vehicleIdSchema } from '@/lib/riomob/action-schemas'
import { isRiomobMocksEnabled } from '@/lib/riomob/mocks-gate'
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

    if (isRiomobMocksEnabled()) {
      revalidateRiomobPaths(vehicleIdResult.data)
      return { success: true }
    }

    const response =
      await deleteCitizenCpfVehiclesVehicleIdConductorsConductorId(
        user.cpf,
        vehicleIdResult.data,
        conductorIdResult.data
      )

    if (response.status === 204) {
      revalidateRiomobPaths(vehicleIdResult.data)
      return { success: true }
    }

    return {
      success: false,
      error: actionErrorMessage(response, 'Erro ao remover condutor'),
    }
  } catch (error) {
    console.error('[riomob] removeConductor', error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Erro ao remover condutor',
    }
  }
}
