import { addMonths, format, isBefore } from 'date-fns'

/** Estado do currículo para o app, como o BFF devolve. */
export interface BancoCurriculosStatus {
  logado: boolean
  temCurriculo: boolean
  curriculoCompleto: boolean
  pendencias: string[]
  curriculoAtualizadoEm: string | null
  disponivel: boolean
}

/** Currículo atualizado há 6 meses ou mais pede revisão. */
const MESES_ATE_DESATUALIZAR = 6

/**
 * Subtítulo do card "Meu Currículo":
 * - incompleto: "Termine de preencher";
 * - completo e atualizado há menos de 6 meses: "Atualizado DD.MM.AA";
 * - completo e atualizado há 6 meses ou mais: "Atualizar".
 */
export function subtituloMeuCurriculo(
  status: Pick<
    BancoCurriculosStatus,
    'curriculoCompleto' | 'curriculoAtualizadoEm'
  >,
  agora: Date = new Date()
): string {
  if (!status.curriculoCompleto || !status.curriculoAtualizadoEm) {
    return 'Termine de preencher'
  }
  const atualizadoEm = new Date(status.curriculoAtualizadoEm)
  if (Number.isNaN(atualizadoEm.getTime())) return 'Termine de preencher'

  const desatualizaEm = addMonths(atualizadoEm, MESES_ATE_DESATUALIZAR)
  if (!isBefore(agora, desatualizaEm)) return 'Atualizar'
  return `Atualizado ${format(atualizadoEm, 'dd.MM.yy')}`
}

/**
 * Subtítulo do controle do banco de currículos. O banco segue a regra das
 * vagas: só entra o currículo com o mínimo para se candidatar (escolaridade,
 * situação atual e termos de uso aceitos).
 */
export function subtituloBancoCurriculos(
  status: Pick<BancoCurriculosStatus, 'curriculoCompleto' | 'disponivel'>
): string {
  if (!status.curriculoCompleto) return 'Disponível com o currículo atualizado'
  return status.disponivel
    ? 'Recrutadores podem consultar seu currículo'
    : 'Recrutadores não podem consultar seu currículo'
}

/**
 * Subtítulo do card "Minhas candidaturas": quantas candidaturas mudaram de
 * status ou de etapa desde a última vez que a pessoa abriu a lista.
 */
export function subtituloMinhasCandidaturas(atualizacoes: number): string {
  if (atualizacoes <= 0) return 'Sem atualizações'
  return `${atualizacoes} ${atualizacoes === 1 ? 'atualização' : 'atualizações'}`
}
