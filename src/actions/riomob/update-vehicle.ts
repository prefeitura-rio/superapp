'use server'

import {
  actionErrorMessage,
  parseActionPayload,
  revalidateRiomobPaths,
} from '@/actions/riomob/utils'
import type { UpdateVehiclePayload } from '@/app/(app)/(logged-in)/carteira/riomob/[vehicleId]/editar/schema'
import { patchCitizenCpfVehiclesVehicleId } from '@/http/mobilidade/mobilidade'
import {
  updateVehiclePayloadSchema,
  vehicleIdSchema,
} from '@/lib/riomob/action-schemas'
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

    const idResult = parseActionPayload(vehicleIdSchema, vehicleId)
    if (!idResult.success) return idResult

    const validated = parseActionPayload(
      updateVehiclePayloadSchema,
      payload,
      'Dados do veículo inválidos'
    )
    if (!validated.success) return validated

    if (isRiomobMocksEnabled()) {
      revalidateRiomobPaths(idResult.data)
      return { success: true }
    }

    const body = toApiUpdateBody(validated.data)

    const response = await patchCitizenCpfVehiclesVehicleId(
      user.cpf,
      idResult.data,
      body
    )

    if (response.status === 200) {
      revalidateRiomobPaths(idResult.data)
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
