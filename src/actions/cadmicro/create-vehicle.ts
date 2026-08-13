'use server'

import {
  actionErrorMessage,
  parseActionPayload,
  revalidateCadmicroPaths,
} from '@/actions/cadmicro/utils'
import type { CreateVehiclePayload } from '@/app/(app)/(logged-in)/carteira/cadmicro/adicionar-veiculo/schema'
import { postCitizenCpfVehicles } from '@/http/mobilidade/mobilidade'
import type { ModelsVehicleCreateRequest } from '@/http/models/modelsVehicleCreateRequest'
import { createVehiclePayloadSchema } from '@/lib/cadmicro/action-schemas'
import { toApiCreateBody } from '@/lib/cadmicro/mappers'
import { isCadmicroMocksEnabled } from '@/lib/cadmicro/mocks-gate'
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

    if (isCadmicroMocksEnabled()) {
      const id = `mock-vehicle-${Date.now()}`
      revalidateCadmicroPaths(id)
      return { success: true, data: { id } }
    }

    const body = toApiCreateBody({
      ...validated.data,
      self_declaration: true,
    })

    // Orval types omit `null`; API accepts null to clear catalog ids (hybrid/Outro).
    const response = await postCitizenCpfVehicles(
      user.cpf,
      body as ModelsVehicleCreateRequest
    )
    if (response.status === 201 && response.data.id) {
      revalidateCadmicroPaths(response.data.id)
      return { success: true, data: { id: response.data.id } }
    }

    return {
      success: false,
      error: actionErrorMessage(response, 'Erro ao cadastrar veículo'),
    }
  } catch (error) {
    console.error('[cadmicro] createVehicle', error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Erro ao cadastrar veículo',
    }
  }
}
