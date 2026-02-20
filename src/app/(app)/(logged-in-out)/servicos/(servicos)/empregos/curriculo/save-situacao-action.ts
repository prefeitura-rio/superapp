'use server'

import {
  putApiV1EmpregabilidadeCurriculoSituacaoInteresses,
} from '@/http-courses/empregabilidade-curriculo/empregabilidade-curriculo'
import type { EmpregabilidadeCurriculoSituacaoInteresses } from '@/http-courses/models'
import type { CurriculoSituacaoFormValues } from './curriculo-situacao-schema'

export async function saveSituacaoAction(
  cpf: string,
  values: CurriculoSituacaoFormValues
): Promise<{ success: boolean; status?: number; error?: string }> {
  try {
    const normalizedCpf = cpf.replace(/\D/g, '')
    const payload: EmpregabilidadeCurriculoSituacaoInteresses = {
      cpf: normalizedCpf || undefined,
      id_situacao: values.idSituacao?.trim() || undefined,
      tempo_procurando_emprego:
        values.tempoProcurandoEmprego?.trim() || undefined,
      id_disponibilidade: values.idDisponibilidade?.trim() || undefined,
      ids_tipos_vinculo_preferencia:
        values.idsTiposVinculo?.length &&
        values.idsTiposVinculo.every((id) => id?.trim())
          ? values.idsTiposVinculo.map((id) => id.trim())
          : undefined,
    }

    const response =
      await putApiV1EmpregabilidadeCurriculoSituacaoInteresses(payload)

    if (response.status !== 200) {
      const errorData =
        typeof response.data === 'object' && response.data !== null
          ? JSON.stringify(response.data)
          : String(response.data)
      console.error(
        '[saveSituacaoAction] API respondeu com status',
        response.status,
        errorData
      )
      return {
        success: false,
        status: response.status,
        error: errorData,
      }
    }
    return { success: true, status: 200 }
  } catch (e) {
    console.error('[saveSituacaoAction] Erro ao chamar API:', e)
    return {
      success: false,
      error: e instanceof Error ? e.message : String(e),
    }
  }
}
