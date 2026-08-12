'use server'

import {
  actionErrorMessage,
  parseActionPayload,
  revalidateRiomobPaths,
} from '@/actions/riomob/utils'
import {
  deleteCitizenCpfVehiclesVehicleIdConductorsConductorId,
  getCitizenCpfVehiclesVehicleId,
} from '@/http/mobilidade/mobilidade'
import { vehicleIdSchema } from '@/lib/riomob/action-schemas'
import { isRiomobMocksEnabled } from '@/lib/riomob/mocks-gate'
import { getUserInfoFromToken } from '@/lib/user-info'

/**
 * Condutor sai do veículo: remove o próprio vínculo em
 * DELETE …/conductors/{conductorId} (não apaga o cadastro do dono).
 * O conductor_id vem do GET do veículo (role=conductor); o GET de
 * conductors é somente proprietário e não pode ser usado no self-leave.
 */
export async function leaveVehicle(
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

    const detailResponse = await getCitizenCpfVehiclesVehicleId(
      user.cpf,
      idResult.data
    )

    if (detailResponse.status !== 200) {
      return {
        success: false,
        error: actionErrorMessage(
          detailResponse,
          'Erro ao localizar vínculo de condutor'
        ),
      }
    }

    const { role, conductor_id: conductorId } = detailResponse.data

    if (role !== 'conductor') {
      return {
        success: false,
        error: 'Apenas condutores podem sair deste veículo',
      }
    }

    if (!conductorId) {
      return {
        success: false,
        error: 'Vínculo de condutor não encontrado neste veículo',
      }
    }

    const response =
      await deleteCitizenCpfVehiclesVehicleIdConductorsConductorId(
        user.cpf,
        idResult.data,
        conductorId
      )

    if (response.status === 204) {
      revalidateRiomobPaths(idResult.data)
      return { success: true }
    }

    return {
      success: false,
      error: actionErrorMessage(response, 'Erro ao sair do veículo'),
    }
  } catch (error) {
    console.error('[riomob] leaveVehicle', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao sair do veículo',
    }
  }
}
