'use server'

import { putCitizenCpfBirthDate } from '@/http/citizen/citizen'
import type { HandlersErrorResponse } from '@/http/models'
import type { ModelsSelfDeclaredBirthDateInput } from '@/http/models/modelsSelfDeclaredBirthDateInput'
import { getUserInfoFromToken } from '@/lib/user-info'
import { revalidatePath, revalidateTag } from 'next/cache'

export async function updateUserBirthDate(birthDate: string) {
  const userInfo = await getUserInfoFromToken()

  if (!userInfo.cpf) {
    throw new Error('CPF do usuário não encontrado')
  }

  const modelsSelfDeclaredBirthDateInput: ModelsSelfDeclaredBirthDateInput = {
    data: birthDate,
  }

  try {
    const response = await putCitizenCpfBirthDate(
      userInfo.cpf,
      modelsSelfDeclaredBirthDateInput
    )

    if (response.status !== 200) {
      const errorData = response.data as HandlersErrorResponse
      throw new Error(
        errorData?.error || 'Erro ao atualizar data de nascimento'
      )
    }

    revalidateTag(`user-info-${userInfo.cpf}`, { expire: 0 })
    revalidatePath('/meu-perfil/informacoes-pessoais', 'page')
    revalidatePath('/servicos/trabalho', 'layout')
    return {
      success: true,
      message: 'Data de nascimento atualizada com sucesso.',
    }
  } catch (error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'status' in error &&
      'data' in error
    ) {
      const err = (error as { data?: HandlersErrorResponse }).data
      throw new Error(err?.error || 'Erro ao atualizar data de nascimento')
    }

    throw error
  }
}
