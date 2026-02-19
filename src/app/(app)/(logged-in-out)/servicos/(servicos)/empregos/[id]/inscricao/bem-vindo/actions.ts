'use server'

import { putApiV1EmpregabilidadeOnboardingCpfComplete } from '@/http-courses/empregabilidade-onboarding/empregabilidade-onboarding'
import { getUserInfoFromToken } from '@/lib/user-info'

interface CompleteOnboardingResult {
  success: boolean
  error?: string
}

export async function completeOnboarding(): Promise<CompleteOnboardingResult> {
  try {
    const userInfo = await getUserInfoFromToken()

    if (!userInfo.cpf) {
      return {
        success: false,
        error: 'CPF não encontrado',
      }
    }

    const response = await putApiV1EmpregabilidadeOnboardingCpfComplete(
      userInfo.cpf
    )

    if (response.status === 200) {
      return {
        success: true,
      }
    }

    return {
      success: false,
      error: 'Oops! Algo deu errado.',
    }
  } catch (error) {
    console.error('Erro ao completar onboarding:', error)
    return {
      success: false,
      error: 'Erro ao processar requisição',
    }
  }
}
