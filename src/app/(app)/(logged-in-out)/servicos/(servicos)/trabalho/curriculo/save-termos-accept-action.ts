'use server'

import { putApiV1EmpregabilidadeTermosUsoCpfAccept } from '@/http-courses/empregabilidade-termos-uso/empregabilidade-termos-uso'

export async function saveTermosAcceptAction(
  cpf: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const normalizedCpf = cpf.replace(/\D/g, '')
    if (!normalizedCpf) {
      return { success: false, error: 'CPF não disponível' }
    }
    const response =
      await putApiV1EmpregabilidadeTermosUsoCpfAccept(normalizedCpf)
    if (response.status !== 200) {
      console.error(
        '[saveTermosAcceptAction] API respondeu com status',
        response.status
      )
      return { success: false }
    }
    return { success: true }
  } catch (e) {
    console.error('[saveTermosAcceptAction] Erro:', e)
    return {
      success: false,
      error: e instanceof Error ? e.message : String(e),
    }
  }
}
