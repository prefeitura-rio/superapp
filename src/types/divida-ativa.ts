/**
 * Tipos de visão do módulo Dívida Ativa.
 *
 * Esta é a fronteira entre o contrato da API e o produto. Componentes, páginas e testes de
 * UI conhecem apenas estes tipos; o que vem de `src/http-divida-ativa/` só é visto pelo DAL,
 * pelas Server Actions e por `src/lib/divida-ativa-mappers.ts`.
 *
 * O contrato real (`api-imoveis`) substituiu o provisório em 17/08/2026. `ImovelDividaAtiva`
 * já reflete a API real.
 *
 * ⚠️ **Os tipos de Fase 3 abaixo ainda não.** Até 21/09/2026 a API não declarava schema de
 * resposta nas operações de dívida ativa, então eles foram escritos como vocabulário de
 * produto, sem contrato para conferir. As anotações `@APIResponse` entraram na `dam-api` e o
 * client gerado agora traz a forma real — e ela **diverge**. O caso mais claro é
 * `CondicaoParcelamento`: o que a API devolve é `ParcelaOpcaoResponse`
 * (`qtdeParcelas`, `valor1aParcela`, `valorJuros`, `valorDescontos`), sem `valorEntrada`,
 * `valorTotal` nem `vencimentoPrimeiraParcela`, e com desconto em reais, não em percentual
 * (o que confirma a decisão D4 de `docs/divida-ativa.md`).
 *
 * A reconciliação acontece na Fase 3, junto das telas que consomem cada tipo — reescrevê-los
 * agora, sem a tela, só trocaria um palpite por outro. Não há mapper para eles hoje.
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
  /**
   * Id do cadastro local do imóvel (`dbo.tbNC_Imovel`). É por ele que a exclusão
   * acontece — a API não remove pela inscrição. `null` quando a API o omite, e nesse
   * caso o imóvel não pode ser excluído.
   */
  id: number | null
  /** Inscrição imobiliária somente com dígitos. A máscara de exibição é decisão de design. */
  inscricao: string
  /**
   * Nome dado pelo cidadão ("Casa de praia"), gravado no cadastro. `null` quando o cidadão
   * pulou o passo, quando o registro é anterior ao campo no contrato (08/09/2026, premissa
   * P23) ou na consulta prévia à Fazenda, que acontece antes de o nome ser escolhido.
   */
  nome: string | null
  endereco: string | null
  /**
   * A API não separa o bairro: ele vem dentro de `endereco`. Sempre `null` hoje —
   * ver premissa P22 em `docs/divida-ativa.md`.
   */
  bairro: string | null
  /**
   * Nome como consta no sistema fiscal. Sempre `null` hoje: `ImovelResponse` não traz
   * proprietário (premissa P19, divergente).
   */
  proprietario: string | null
  /**
   * `null` significa "não sabemos". `GET /imoveis` lê só o banco local e não consulta a
   * Fazenda nem o ePortal, então não há indicador de débito na lista (premissa P12,
   * divergente). Nunca inferir `false` como "não tem débito".
   */
  possuiDebitos: boolean | null
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
