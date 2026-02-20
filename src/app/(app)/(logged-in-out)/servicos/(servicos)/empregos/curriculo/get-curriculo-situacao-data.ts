import {
  getApiV1EmpregabilidadeCurriculoCpfSituacaoInteresses,
} from '@/http-courses/empregabilidade-curriculo/empregabilidade-curriculo'
import type { CurriculoSituacaoFormValues } from './curriculo-situacao-schema'

export interface InitialSituacaoData {
  idSituacao: string
  tempoProcurandoEmprego: string
  idDisponibilidade: string
  idsTiposVinculo: string[]
}

const DEFAULT_SITUACAO: CurriculoSituacaoFormValues = {
  idSituacao: '',
  tempoProcurandoEmprego: '',
  idDisponibilidade: '',
  idsTiposVinculo: [],
}

/**
 * Busca situação e interesses do currículo por CPF no server.
 */
export async function getCurriculoSituacaoData(
  cpf: string
): Promise<InitialSituacaoData> {
  const normalizedCpf = cpf.replace(/\D/g, '')
  if (!normalizedCpf) {
    return { ...DEFAULT_SITUACAO, idsTiposVinculo: [] }
  }

  const res = await getApiV1EmpregabilidadeCurriculoCpfSituacaoInteresses(
    normalizedCpf
  )

  if (res.status !== 200 || !res.data) {
    return { ...DEFAULT_SITUACAO, idsTiposVinculo: [] }
  }

  const body = res.data as Record<string, unknown>
  const idsVinculo = body.ids_tipos_vinculo_preferencia
  const idsTiposVinculo = Array.isArray(idsVinculo)
    ? (idsVinculo as unknown[]).map((id) => String(id ?? '')).filter(Boolean)
    : []

  return {
    idSituacao: String(body.id_situacao ?? ''),
    tempoProcurandoEmprego: String(body.tempo_procurando_emprego ?? ''),
    idDisponibilidade: String(body.id_disponibilidade ?? ''),
    idsTiposVinculo,
  }
}
