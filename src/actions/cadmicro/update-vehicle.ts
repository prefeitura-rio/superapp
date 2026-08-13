'use server'

import {
  actionErrorMessage,
  parseActionPayload,
  revalidateCadmicroPaths,
} from '@/actions/cadmicro/utils'
import type { UpdateVehiclePayload } from '@/app/(app)/(logged-in)/carteira/cadmicro/[vehicleId]/editar/schema'
import { patchCitizenCpfVehiclesVehicleId } from '@/http/mobilidade/mobilidade'
import type { ModelsVehicleUpdateRequest } from '@/http/models/modelsVehicleUpdateRequest'
import {
  updateVehiclePayloadSchema,
  vehicleIdSchema,
} from '@/lib/cadmicro/action-schemas'
import { toApiUpdateBody } from '@/lib/cadmicro/mappers'
import { isCadmicroMocksEnabled } from '@/lib/cadmicro/mocks-gate'
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

    if (isCadmicroMocksEnabled()) {
      revalidateCadmicroPaths(idResult.data)
      return { success: true }
    }

    const body = toApiUpdateBody(validated.data)

    // Orval types omit `null`; API accepts null to clear catalog ids (hybrid/Outro).
    const response = await patchCitizenCpfVehiclesVehicleId(
      user.cpf,
      idResult.data,
      body as ModelsVehicleUpdateRequest
    )

    if (response.status === 200) {
      revalidateCadmicroPaths(idResult.data)
      return { success: true }
    }

    return {
      success: false,
      error: actionErrorMessage(response, 'Erro ao atualizar veículo'),
    }
  } catch (error) {
    console.error('[cadmicro] updateVehicle', error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Erro ao atualizar veículo',
    }
  }
}
