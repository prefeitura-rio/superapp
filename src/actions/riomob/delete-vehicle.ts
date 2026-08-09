'use server'

import {
  actionErrorMessage,
  parseActionPayload,
  revalidateRiomobPaths,
} from '@/actions/riomob/utils'
import { deleteCitizenCpfVehiclesVehicleId } from '@/http/mobilidade/mobilidade'
import { vehicleIdSchema } from '@/lib/riomob/action-schemas'
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

    const idResult = parseActionPayload(vehicleIdSchema, vehicleId)
    if (!idResult.success) return idResult

    if (isRiomobMocksEnabled()) {
      revalidateRiomobPaths(idResult.data)
      return { success: true }
    }

    const response = await deleteCitizenCpfVehiclesVehicleId(
      user.cpf,
      idResult.data
    )

    if (response.status === 204) {
      revalidateRiomobPaths(idResult.data)
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
