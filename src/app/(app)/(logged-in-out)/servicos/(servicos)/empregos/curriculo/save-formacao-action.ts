'use server'

import { putApiV1EmpregabilidadeCurriculoCpfFormacoes } from '@/http-courses/empregabilidade-curriculo/empregabilidade-curriculo'
import type { EmpregabilidadeFormacaoAccordionRequest } from '@/http-courses/models'

/** CPF vai na URL do PUT; o body enviado à API é apenas { formacoes, idiomas }. */
export async function saveFormacaoAccordion(
  cpf: string,
  payload: EmpregabilidadeFormacaoAccordionRequest
): Promise<{ success: boolean; status?: number; error?: string }> {
  console.log('🔄 [saveFormacaoAccordion] INICIANDO SERVER ACTION')
  console.log('👤 [saveFormacaoAccordion] CPF:', cpf)
  console.log(
    '📦 [saveFormacaoAccordion] PAYLOAD RECEBIDO:',
    JSON.stringify(payload, null, 2)
  )

  try {
    const normalizedCpf = cpf.replace(/\D/g, '')
    console.log('✂️ [saveFormacaoAccordion] CPF NORMALIZADO:', normalizedCpf)

    console.log(
      '🌐 [saveFormacaoAccordion] CHAMANDO API putApiV1EmpregabilidadeCurriculoCpfFormacoes...'
    )
    const response = await putApiV1EmpregabilidadeCurriculoCpfFormacoes(
      normalizedCpf,
      payload
    )

    console.log('📥 [saveFormacaoAccordion] RESPOSTA DA API:', {
      status: response.status,
      data: response.data,
      headers: response.headers,
    })

    if (response.status !== 200) {
      const errorData =
        typeof response.data === 'object' && response.data !== null
          ? JSON.stringify(response.data)
          : String(response.data)
      console.error(
        '❌ [saveFormacaoAccordion] API respondeu com status',
        response.status,
        errorData
      )
      return {
        success: false,
        status: response.status,
        error: errorData,
      }
    }

    console.log('✅ [saveFormacaoAccordion] SUCESSO!')
    return { success: true, status: 200 }
  } catch (e) {
    console.error('💥 [saveFormacaoAccordion] EXCEÇÃO ao chamar API:', e)
    return {
      success: false,
      error: e instanceof Error ? e.message : String(e),
    }
  }
}
