'use server'

import {
  actionErrorMessage,
  revalidateRiomobPaths,
} from '@/actions/riomob/utils'
import type { UpdateVehiclePayload } from '@/app/(app)/(logged-in)/carteira/riomob/[vehicleId]/editar/schema'
import { patchCitizenCpfVehiclesVehicleId } from '@/http/mobilidade/mobilidade'
import { toApiUpdateBody } from '@/lib/riomob/mappers'
import { isRiomobMocksEnabled } from '@/lib/riomob/mocks-gate'
import { getUserInfoFromToken } from '@/lib/user-info'

export async function updateVehicle(
  vehicleId: string,
  payload: UpdateVehiclePayload
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

    const body = toApiUpdateBody(payload)

    const response = await patchCitizenCpfVehiclesVehicleId(
      user.cpf,
      vehicleId,
      body
    )

    if (response.status === 200) {
      revalidateRiomobPaths(vehicleId)
      return { success: true }
    }

    return {
      success: false,
      error: actionErrorMessage(response, 'Erro ao atualizar veículo'),
    }
  } catch (error) {
    console.error('[riomob] updateVehicle', error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Erro ao atualizar veículo',
    }
  }
}
