import {
  formatarExecucaoFiscal,
  formatarInscricaoImobiliaria,
  isCdaValida,
  isExecucaoFiscalValida,
  isInscricaoImobiliariaValida,
} from '@/lib/divida-ativa-utils'

/**
 * Os três modos de busca do parcelamento.
 *
 * **Não são sinônimos — são níveis diferentes.** A inscrição identifica o *imóvel*, a CDA
 * identifica uma *dívida* inscrita, e a execução fiscal identifica um *processo judicial*
 * que pode abranger várias CDAs. Cada um vem de um papel diferente na mão do cidadão: o
 * carnê de IPTU, a carta de cobrança da PGM e a citação da Justiça.
 *
 * O desenho é em dois passos — o cidadão escolhe o modo numa lista e só então digita o
 * número. A documentação do módulo descrevia "uma tela com três campos livres"; o Figma
 * entregue em 21/09/2026 mostrou outra coisa.
 */
export type ModoConsulta = 'inscricao' | 'cda' | 'execucao-fiscal'

export interface ModoConsultaConfig {
  /** Valor de `?modo=` na URL. */
  id: ModoConsulta
  /** Texto do item na lista de seleção. */
  rotuloLista: string
  /** Rótulo acima do campo, na tela seguinte. */
  rotuloCampo: string
  /**
   * Nome do parâmetro com que o critério chega à tela de débitos. A API aceita um critério
   * único por consulta (RN-001/RN-002), então a tela recebe exatamente um destes.
   */
  parametro: 'inscricao' | 'cda' | 'execucaoFiscal'
  /** Máscara de exibição. O que trafega são sempre só os dígitos. */
  formatar: (valor: string) => string
  /** Validação de **formato**. Existência e vínculo são regra de negócio da API. */
  validar: (valor: string) => boolean
  /** Mensagem de campo vazio. */
  mensagemVazio: string
  /** Mensagem de formato inválido. */
  mensagemFormato: string
}

export const MODOS_CONSULTA: Record<ModoConsulta, ModoConsultaConfig> = {
  inscricao: {
    id: 'inscricao',
    rotuloLista: 'N° da Inscrição Imobiliária',
    rotuloCampo: 'N° da Inscrição Imobiliária',
    parametro: 'inscricao',
    formatar: formatarInscricaoImobiliaria,
    validar: isInscricaoImobiliariaValida,
    mensagemVazio: 'Digite a inscrição imobiliária.',
    mensagemFormato: 'A inscrição imobiliária tem 7 ou 8 números.',
  },
  cda: {
    id: 'cda',
    rotuloLista: 'N° da Certidão de Dívida Ativa',
    rotuloCampo: 'N° da Certidão de Dívida Ativa',
    parametro: 'cda',
    // Sem máscara: o contrato não documenta contagem de dígitos da CDA, e formatar às cegas
    // atrapalharia quem cola o número da carta da PGM.
    formatar: valor => valor.replace(/\D/g, ''),
    validar: isCdaValida,
    mensagemVazio: 'Digite o número da certidão de dívida ativa.',
    mensagemFormato: 'Digite somente os números da certidão.',
  },
  'execucao-fiscal': {
    id: 'execucao-fiscal',
    rotuloLista: 'N° da Execução Fiscal',
    rotuloCampo: 'N° da Execução Fiscal',
    parametro: 'execucaoFiscal',
    formatar: formatarExecucaoFiscal,
    validar: isExecucaoFiscalValida,
    mensagemVazio: 'Digite o número da execução fiscal.',
    mensagemFormato: 'O número da execução fiscal tem 20 números.',
  },
}

/** Ordem de exibição na lista, como no Figma. */
export const ORDEM_MODOS_CONSULTA: ModoConsulta[] = [
  'inscricao',
  'cda',
  'execucao-fiscal',
]

/**
 * Converte `?modo=` em configuração. Devolve `null` para valor ausente ou desconhecido — a
 * página usa isso para mostrar a lista de seleção em vez de um campo sem rótulo.
 */
export function parseModoConsulta(
  valor: string | undefined
): ModoConsultaConfig | null {
  if (!valor) return null

  return MODOS_CONSULTA[valor as ModoConsulta] ?? null
}
