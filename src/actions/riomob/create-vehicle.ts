'use server'

import {
  actionErrorMessage,
  parseActionPayload,
  revalidateRiomobPaths,
} from '@/actions/riomob/utils'
import type { CreateVehiclePayload } from '@/app/(app)/(logged-in)/carteira/riomob/adicionar-veiculo/schema'
import { postCitizenCpfVehicles } from '@/http/mobilidade/mobilidade'
import { createVehiclePayloadSchema } from '@/lib/riomob/action-schemas'
import { toApiCreateBody } from '@/lib/riomob/mappers'
import { isRiomobMocksEnabled } from '@/lib/riomob/mocks-gate'
import { getUserInfoFromToken } from '@/lib/user-info'

export async function createVehicle(payload: CreateVehiclePayload): Promise<{
  success: boolean
  error?: string
  data?: { id: string }
}> {
  try {
    const user = await getUserInfoFromToken()
    if (!user.cpf) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const validated = parseActionPayload(
      createVehiclePayloadSchema,
      payload,
      'Dados do veículo inválidos'
    )
    if (!validated.success) return validated

    if (isRiomobMocksEnabled()) {
      const id = `mock-vehicle-${Date.now()}`
      revalidateRiomobPaths(id)
      return { success: true, data: { id } }
    }

    const body = toApiCreateBody({
      ...validated.data,
      self_declaration: true,
    })

    const response = await postCitizenCpfVehicles(user.cpf, body)
    if (response.status === 201 && response.data.id) {
      revalidateRiomobPaths(response.data.id)
      return { success: true, data: { id: response.data.id } }
    }

    return {
      success: false,
      error: actionErrorMessage(response, 'Erro ao cadastrar veículo'),
    }
  } catch (error) {
    console.error('[riomob] createVehicle', error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Erro ao cadastrar veículo',
    }
  }
}
