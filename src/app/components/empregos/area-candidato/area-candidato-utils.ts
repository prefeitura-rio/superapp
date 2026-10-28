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
 * Subtítulo do controle do banco de currículos. O banco mostra o que a pessoa
 * conseguiu salvar, então o controle vale para qualquer currículo, completo ou
 * não.
 */
export function subtituloBancoCurriculos(
  status: Pick<BancoCurriculosStatus, 'temCurriculo' | 'disponivel'>
): string {
  if (!status.temCurriculo) return 'Disponível depois de criar o currículo'
  return status.disponivel
    ? 'Recrutadores podem ver seu currículo'
    : 'Recrutadores não podem ver seu currículo'
}
