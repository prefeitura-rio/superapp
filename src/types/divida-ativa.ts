/**
 * Tipos de visão do módulo Dívida Ativa.
 *
 * Esta é a fronteira entre o contrato da API e o produto. Componentes, páginas e testes de
 * UI conhecem apenas estes tipos; o que vem de `src/http-divida-ativa/` só é visto pelo DAL,
 * pelas Server Actions e por `src/lib/divida-ativa-mappers.ts`.
 *
 * O contrato da API ainda é provisório (ver `docs/divida-ativa.md`). Quando o contrato oficial
 * chegar, a correção deve se concentrar nos mappers — se precisar mudar um destes tipos, a
 * mudança é de produto, não de integração.
 */

export type SituacaoDebito =
  | 'em_aberto'
  | 'ajuizada'
  | 'parcelada'
  | 'quitada'
  | 'suspensa'
  | 'cancelada'
  | 'desconhecida'

export type SituacaoRequerimento =
  | 'em_analise'
  | 'aguardando_documentacao'
  | 'deferido'
  | 'indeferido'
  | 'cancelado'
  | 'desconhecida'

export interface ImovelDividaAtiva {
  /** Inscrição imobiliária somente com dígitos. A máscara de exibição é decisão de design. */
  inscricao: string
  endereco: string | null
  bairro: string | null
  possuiDebitos: boolean
  /** Data ISO (YYYY-MM-DD) em que o cidadão cadastrou o imóvel. */
  cadastradoEm: string | null
}

export interface DebitoDividaAtiva {
  numeroCda: string
  exercicio: number | null
  tributo: string | null
  situacao: SituacaoDebito
  /** Elegibilidade decidida pela API. Na dúvida é `false`: nunca oferecer parcelamento por conta própria. */
  parcelavel: boolean
  vencimento: string | null
  valorPrincipal: number | null
  valorAtualizado: number | null
  valorReferenciaEm: string | null
}

export interface ListaDebitos {
  debitos: DebitoDividaAtiva[]
  valorTotalAtualizado: number | null
}

export interface CondicaoParcelamento {
  quantidadeParcelas: number
  valorEntrada: number | null
  valorParcela: number | null
  valorTotal: number | null
  percentualDesconto: number | null
  vencimentoPrimeiraParcela: string | null
}

export interface SimulacaoParcelamento {
  inscricao: string | null
  /** Instante ISO até o qual as condições valem. Depois disso é preciso simular de novo. */
  validaAte: string | null
  condicoes: CondicaoParcelamento[]
}

export interface RequerimentoDividaAtiva {
  protocolo: string
  situacao: SituacaoRequerimento
  inscricao: string | null
  quantidadeParcelas: number | null
  valorTotal: number | null
  abertoEm: string | null
  atualizadoEm: string | null
  /** Texto institucional da API. Nunca escrever um motivo no front. */
  motivoIndeferimento: string | null
}
