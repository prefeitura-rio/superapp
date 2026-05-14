'use server'

import { putApiV1EmpregabilidadeOnboardingCpfComplete } from '@/http-courses/empregabilidade-onboarding/empregabilidade-onboarding'
import { getUserInfoFromToken } from '@/lib/user-info'

interface CompleteOnboardingResult {
  success: boolean
  error?: string
}

/**
 * Marca o primeiro login do usuário no módulo de empregabilidade como concluído (PUT).
 *
 * Não chama revalidatePath aqui: a página de inscrição usa `force-dynamic`, portanto
 * o próximo acesso já buscará `is_first_login` atualizado do servidor sem necessidade
 * de revalidação. Chamar revalidatePath causava um re-render do Server Component
 * enquanto o Swiper ainda estava na tela de Bem-vindo, removendo aquele slide do DOM
 * e fazendo com que slideNext() avançasse para o slide errado (Meu Currículo em vez
 * de Confirmar Informações).
 */
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
