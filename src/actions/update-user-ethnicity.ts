'use server'

import { putCitizenCpfEthnicity } from '@/http/citizen/citizen'
import type { ModelsSelfDeclaredRacaInput } from '@/http/models/modelsSelfDeclaredRacaInput'
import { getUserInfoFromToken } from '@/lib/user-info'
import { revalidateTag } from 'next/cache'

export async function updateUserEthnicity(
  race: string
): Promise<{ success: boolean; message: string }> {
  try {
    const userInfo = await getUserInfoFromToken()
    if (!userInfo.cpf) {
      console.error('CPF not found in user info for ethnicity update')
      return {
        success: false,
        message: 'CPF do usuário não encontrado.',
      }
    }

    const modelsSelfDeclaredRacaInput: ModelsSelfDeclaredRacaInput = {
      valor: race,
    }
    const response = await putCitizenCpfEthnicity(
      userInfo.cpf,
      modelsSelfDeclaredRacaInput
    )

    if (response.status === 200) {
      revalidateTag('update-user-race')
      return { success: true, message: 'Etnia atualizada com sucesso.' }
    }
    return {
      success: false,
      message: response.data?.error || 'Falha ao atualizar a etnia.',
    }
  } catch (error) {
    console.error('Error updating ethnicity:', error)
    return {
      success: false,
      message: 'Ocorreu um erro ao tentar atualizar a etnia.',
    }
  }
}
