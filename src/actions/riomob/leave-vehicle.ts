'use server'

import {
  actionErrorMessage,
  revalidateRiomobPaths,
} from '@/actions/riomob/utils'
import {
  deleteCitizenCpfVehiclesVehicleIdConductorsConductorId,
  getCitizenCpfVehiclesVehicleIdConductors,
} from '@/http/mobilidade/mobilidade'
import { isRiomobMocksEnabled } from '@/lib/riomob/mocks-gate'
import { getUserInfoFromToken } from '@/lib/user-info'

/**
 * Condutor sai do veículo: remove o próprio vínculo em
 * DELETE …/conductors/{conductorId} (não apaga o cadastro do dono).
 */
export async function leaveVehicle(
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

    const conductorsResponse = await getCitizenCpfVehiclesVehicleIdConductors(
      user.cpf,
      vehicleId
    )

    if (conductorsResponse.status !== 200) {
      return {
        success: false,
        error: actionErrorMessage(
          conductorsResponse,
          'Erro ao localizar vínculo de condutor'
        ),
      }
    }

    const self = (conductorsResponse.data.data ?? []).find(
      conductor =>
        conductor.conductor_cpf?.replace(/\D/g, '') ===
          user.cpf.replace(/\D/g, '') && conductor.status === 'accepted'
    )

    if (!self?.id) {
      return {
        success: false,
        error: 'Vínculo de condutor não encontrado neste veículo',
      }
    }

    const response =
      await deleteCitizenCpfVehiclesVehicleIdConductorsConductorId(
        user.cpf,
        vehicleId,
        self.id
      )

    if (response.status === 204) {
      revalidateRiomobPaths(vehicleId)
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
