'use server'

import {
  actionErrorMessage,
  revalidateRiomobPaths,
} from '@/actions/riomob/utils'
import { deleteCitizenCpfVehiclesVehicleIdConductorsConductorId } from '@/http/mobilidade/mobilidade'
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

    if (isRiomobMocksEnabled()) {
      revalidateRiomobPaths(vehicleId)
      return { success: true }
    }

    const response =
      await deleteCitizenCpfVehiclesVehicleIdConductorsConductorId(
        user.cpf,
        vehicleId,
        conductorId
      )

    if (response.status === 204) {
      revalidateRiomobPaths(vehicleId)
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
