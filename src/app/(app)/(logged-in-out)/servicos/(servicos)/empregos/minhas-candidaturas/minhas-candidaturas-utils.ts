import type { EmpregabilidadeCandidatura } from '@/http-courses/models'
import type { EmpregabilidadeStatusCandidatura } from '@/http-courses/models'

export type StatusUi =
  | 'vaga_encerrada'
  | 'vaga_descontinuada'
  | 'em_analise'
  | 'aprovado'
  | 'nao_selecionado'

export interface CandidaturaCardData {
  id: string
  idVaga: string
  titulo: string
  empresa: string
  status: StatusUi
  etapaAtual: number
  totalEtapas: number
}

function mapApiStatusToUi(
  status: EmpregabilidadeStatusCandidatura | undefined
): StatusUi {
  switch (status) {
    case 'candidatura_enviada':
      return 'em_analise'
    case 'aprovada':
      return 'aprovado'
    case 'reprovada':
      return 'nao_selecionado'
    case 'vaga_congelada':
      return 'vaga_encerrada'
    case 'vaga_descontinuada':
      return 'vaga_descontinuada'
    default:
      return 'em_analise'
  }
}

export function candidaturaToCardData(
  c: EmpregabilidadeCandidatura
): CandidaturaCardData {
  const etapas = c.vaga?.etapas ?? []
  const totalEtapas = etapas.length
  const ordemAtual = c.etapa_atual?.ordem
  const etapaAtual =
    typeof ordemAtual === 'number' && totalEtapas > 0
      ? Math.min(ordemAtual, totalEtapas)
      : 0

  return {
    id: c.id ?? '',
    idVaga: c.id_vaga ?? c.vaga?.id ?? '',
    titulo: c.vaga?.titulo ?? 'Vaga',
    empresa:
      c.vaga?.contratante?.nome_fantasia ||
      c.vaga?.contratante?.razao_social ||
      '',
    status: mapApiStatusToUi(c.status),
    etapaAtual,
    totalEtapas,
  }
}
