'use server'

import { putApiV1EmpregabilidadeCurriculoCpfExperiencias } from '@/http-courses/empregabilidade-curriculo/empregabilidade-curriculo'
import type {
  EmpregabilidadeCurriculoConquista,
  EmpregabilidadeCurriculoExperiencia,
  EmpregabilidadeExperienciaProfissionalAccordionRequest,
} from '@/http-courses/models'
import type { CurriculoExperienciaFormValues } from './curriculo-experiencia-schema'
import { convertYearsAndMonthsToMonths } from '@/lib/experiencia-utils'

function buildExperiencias(
  empregos: CurriculoExperienciaFormValues['empregos']
): EmpregabilidadeCurriculoExperiencia[] {
  return empregos
    .filter(e => {
      const totalMonths = convertYearsAndMonthsToMonths(
        e.tempoExperienciaAnos,
        e.tempoExperienciaMeses
      )
      return (
        (e.cargo?.trim()?.length ?? 0) > 0 &&
        (e.empresa?.trim()?.length ?? 0) > 0 &&
        (e.descricaoAtividades?.trim()?.length ?? 0) > 0 &&
        totalMonths != null &&
        totalMonths >= 1 &&
        (e.experienciaComprovadaCarteira === 'Sim' ||
          e.experienciaComprovadaCarteira === 'Não')
      )
    })
    .map(e => ({
      cargo: e.cargo?.trim() || undefined,
      empresa: e.empresa?.trim() || undefined,
      descricao_atividades: e.descricaoAtividades?.trim() || undefined,
      eh_trabalho_atual: e.meuEmpregoAtual,
      experiencia_comprovada_ct: e.experienciaComprovadaCarteira === 'Sim',
      tempo_experiencia_meses: convertYearsAndMonthsToMonths(
        e.tempoExperienciaAnos,
        e.tempoExperienciaMeses
      ),
    }))
}

function buildConquistas(
  conquistas: CurriculoExperienciaFormValues['conquistas']
): EmpregabilidadeCurriculoConquista[] {
  return conquistas
    .filter(
      c =>
        (c.idTipoConquista?.trim()?.length ?? 0) > 0 &&
        (c.titulo?.trim()?.length ?? 0) > 0 &&
        (c.descricao?.trim()?.length ?? 0) > 0
    )
    .map(c => ({
      id_tipo_conquista: c.idTipoConquista?.trim() || undefined,
      titulo: c.titulo?.trim() || undefined,
      descricao: c.descricao?.trim() || undefined,
    }))
}

export async function saveExperienciaAction(
  cpf: string,
  formValues: CurriculoExperienciaFormValues
): Promise<{ success: boolean; status?: number; error?: string }> {
  try {
    const normalizedCpf = cpf.replace(/\D/g, '')
    const payload: EmpregabilidadeExperienciaProfissionalAccordionRequest = {
      experiencias: buildExperiencias(formValues.empregos),
      conquistas: buildConquistas(formValues.conquistas),
    }
    const response = await putApiV1EmpregabilidadeCurriculoCpfExperiencias(
      normalizedCpf,
      payload
    )
    if (response.status !== 200) {
      const errorData =
        typeof response.data === 'object' && response.data !== null
          ? JSON.stringify(response.data)
          : String(response.data)
      console.error(
        '[saveExperienciaAction] API respondeu com status',
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
    console.error('[saveExperienciaAction] Erro ao chamar API:', e)
    return {
      success: false,
      error: e instanceof Error ? e.message : String(e),
    }
  }
}
