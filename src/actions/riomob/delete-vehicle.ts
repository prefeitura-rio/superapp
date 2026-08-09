'use server'

import {
  actionErrorMessage,
  revalidateRiomobPaths,
} from '@/actions/riomob/utils'
import { deleteCitizenCpfVehiclesVehicleId } from '@/http/mobilidade/mobilidade'
import { isRiomobMocksEnabled } from '@/lib/riomob/mocks-gate'
import { getUserInfoFromToken } from '@/lib/user-info'

export async function deleteVehicle(
  vehicleId: string
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

    const response = await deleteCitizenCpfVehiclesVehicleId(
      user.cpf,
      vehicleId
    )

    if (response.status === 204) {
      revalidateRiomobPaths(vehicleId)
      return { success: true }
    }

    return {
      success: false,
      error: actionErrorMessage(response, 'Erro ao excluir veículo'),
    }
  } catch (error) {
    console.error('[riomob] deleteVehicle', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao excluir veículo',
    }
  }
}
