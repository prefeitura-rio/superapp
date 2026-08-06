import type {
  CondicaoParcelamento as CondicaoParcelamentoApi,
  Debito,
  DebitoListResponse,
  Imovel,
  Requerimento,
  Simulacao,
} from '@/http-divida-ativa/models'
import type {
  CondicaoParcelamento,
  DebitoDividaAtiva,
  ImovelDividaAtiva,
  ListaDebitos,
  RequerimentoDividaAtiva,
  SimulacaoParcelamento,
  SituacaoDebito,
  SituacaoRequerimento,
} from '@/types/divida-ativa'

/**
 * Camada anti-corrupção entre o contrato provisório da API de Dívida Ativa e os tipos de
 * visão do produto. O contrato ainda não foi ratificado (ver `docs/divida-ativa.md`), então
 * estes mappers são deliberadamente tolerantes: aceitam o formato que assumimos e também os
 * formatos que o legado costuma devolver, para que uma divergência de contrato custe um
 * ajuste aqui em vez de uma varredura pelas telas.
 */

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/
const BR_DATE = /^(\d{2})\/(\d{2})\/(\d{4})$/

/**
 * Aceita número, string decimal com ponto e string pt-BR com milhar e símbolo de moeda.
 * Devolve `null` quando o valor está ausente ou não é numérico — nunca `NaN`, que
 * atravessaria a formatação e chegaria à tela como "NaN".
 */
export function parseValorMonetario(valor: unknown): number | null {
  if (typeof valor === 'number') {
    return Number.isFinite(valor) ? valor : null
  }

  if (typeof valor !== 'string') {
    return null
  }

  const semMoeda = valor.replace(/[R$\s]/g, '')
  if (semMoeda === '') {
    return null
  }

  // "1.234,56" (pt-BR) vs "1234.56" (decimal com ponto)
  const normalizado = semMoeda.includes(',')
    ? semMoeda.replace(/\./g, '').replace(',', '.')
    : semMoeda

  const numero = Number(normalizado)

  return Number.isFinite(numero) ? numero : null
}

/**
 * Normaliza para data ISO (YYYY-MM-DD). Aceita ISO, date-time ISO e o formato brasileiro.
 * Compara os componentes depois de montar a data para rejeitar valores como 31/02.
 */
export function parseDataApi(valor: unknown): string | null {
  if (typeof valor !== 'string' || valor === '') {
    return null
  }

  const br = valor.match(BR_DATE)
  if (br) {
    const [, dia, mes, ano] = br
    return validarDataIso(`${ano}-${mes}-${dia}`)
  }

  const apenasData = valor.split('T')[0]
  if (ISO_DATE.test(apenasData)) {
    return validarDataIso(apenasData)
  }

  return null
}

function validarDataIso(iso: string): string | null {
  const data = new Date(`${iso}T00:00:00Z`)

  if (Number.isNaN(data.getTime())) {
    return null
  }

  // Rejeita datas que o Date "corrige" sozinho (ex.: 2023-02-31 vira 03/03).
  return data.toISOString().slice(0, 10) === iso ? iso : null
}

function apenasDigitos(valor: string): string {
  return valor.replace(/\D/g, '')
}

function textoOuNull(valor: string | undefined): string | null {
  return valor && valor !== '' ? valor : null
}

function numeroOuNull(valor: number | undefined): number | null {
  return typeof valor === 'number' && Number.isFinite(valor) ? valor : null
}

const SITUACOES_DEBITO: Record<string, SituacaoDebito> = {
  EM_ABERTO: 'em_aberto',
  AJUIZADA: 'ajuizada',
  PARCELADA: 'parcelada',
  QUITADA: 'quitada',
  SUSPENSA: 'suspensa',
  CANCELADA: 'cancelada',
}

const SITUACOES_REQUERIMENTO: Record<string, SituacaoRequerimento> = {
  EM_ANALISE: 'em_analise',
  AGUARDANDO_DOCUMENTACAO: 'aguardando_documentacao',
  DEFERIDO: 'deferido',
  INDEFERIDO: 'indeferido',
  CANCELADO: 'cancelado',
}

export function mapSituacaoDebito(
  situacao: string | undefined
): SituacaoDebito {
  return SITUACOES_DEBITO[situacao ?? ''] ?? 'desconhecida'
}

export function mapSituacaoRequerimento(
  situacao: string | undefined
): SituacaoRequerimento {
  return SITUACOES_REQUERIMENTO[situacao ?? ''] ?? 'desconhecida'
}

export function mapApiToImovel(api: Imovel): ImovelDividaAtiva {
  return {
    inscricao: apenasDigitos(api.inscricaoImobiliaria ?? ''),
    endereco: textoOuNull(api.endereco),
    bairro: textoOuNull(api.bairro),
    possuiDebitos: api.possuiDebitos === true,
    cadastradoEm: parseDataApi(api.cadastradoEm),
  }
}

export function mapApiToDebito(api: Debito): DebitoDividaAtiva {
  return {
    numeroCda: api.numeroCda ?? '',
    exercicio: numeroOuNull(api.exercicio),
    tributo: textoOuNull(api.tributo),
    situacao: mapSituacaoDebito(api.situacao),
    parcelavel: api.parcelavel === true,
    vencimento: parseDataApi(api.dataVencimento),
    valorPrincipal: parseValorMonetario(api.valorPrincipal),
    valorAtualizado: parseValorMonetario(api.valorAtualizado),
    valorReferenciaEm: parseDataApi(api.dataReferenciaValor),
  }
}

export function mapApiToListaDebitos(api: DebitoListResponse): ListaDebitos {
  return {
    debitos: (api.data ?? []).map(mapApiToDebito),
    valorTotalAtualizado: parseValorMonetario(api.valorTotalAtualizado),
  }
}

export function mapApiToCondicaoParcelamento(
  api: CondicaoParcelamentoApi
): CondicaoParcelamento {
  return {
    quantidadeParcelas: api.quantidadeParcelas ?? 0,
    valorEntrada: parseValorMonetario(api.valorEntrada),
    valorParcela: parseValorMonetario(api.valorParcela),
    valorTotal: parseValorMonetario(api.valorTotal),
    percentualDesconto: parseValorMonetario(api.percentualDesconto),
    vencimentoPrimeiraParcela: parseDataApi(api.vencimentoPrimeiraParcela),
  }
}

export function mapApiToSimulacao(api: Simulacao): SimulacaoParcelamento {
  return {
    inscricao: api.inscricaoImobiliaria
      ? apenasDigitos(api.inscricaoImobiliaria)
      : null,
    validaAte: textoOuNull(api.validaAte),
    condicoes: (api.condicoes ?? []).map(mapApiToCondicaoParcelamento),
  }
}

export function mapApiToRequerimento(
  api: Requerimento
): RequerimentoDividaAtiva {
  return {
    protocolo: api.protocolo ?? '',
    situacao: mapSituacaoRequerimento(api.situacao),
    inscricao: api.inscricaoImobiliaria
      ? apenasDigitos(api.inscricaoImobiliaria)
      : null,
    quantidadeParcelas: numeroOuNull(api.quantidadeParcelas),
    valorTotal: parseValorMonetario(api.valorTotal),
    abertoEm: parseDataApi(api.abertoEm),
    atualizadoEm: parseDataApi(api.atualizadoEm),
    motivoIndeferimento: textoOuNull(api.motivoIndeferimento),
  }
}
