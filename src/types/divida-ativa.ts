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
 * client gerado agora traz a forma real. Os tipos de **débito** (`DebitoDividaAtiva`,
 * `GuiaParceladaDividaAtiva`, `DebitosDividaAtiva`) já foram reconciliados contra ele e
 * têm mapper.
 *
 * ⚠️ **`CondicaoParcelamento` e `SimulacaoParcelamento` ainda não.** O que a API devolve é
 * `ParcelaOpcaoResponse` (`qtdeParcelas`, `valor1aParcela`, `valorJuros`,
 * `valorDescontos`), sem `valorEntrada`, `valorTotal` nem `vencimentoPrimeiraParcela`, e
 * com desconto em reais, não em percentual — o que confirma a decisão D4 de
 * `docs/divida-ativa.md`. Eles são reescritos junto da tela de simulação, porque decidir a
 * forma sem a tela seria trocar um palpite por outro. `RequerimentoDividaAtiva` está na
 * mesma situação, e espera a tela de acompanhamento.
 */

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

/**
 * Uma CDA não parcelada — o datagrid 1 da tela de débitos.
 *
 * As situações vêm como **texto livre da API**, não como enum nosso. A versão anterior
 * deste tipo traduzia para `'em_aberto' | 'ajuizada' | ...`, o que significaria decidir
 * aqui o que o DAM já decidiu: é a regra de ouro nº 9 do plano (situação de CDA é regra de
 * negócio da API; o UI exibe o que o contrato devolver).
 */
export interface DebitoDividaAtiva {
  /** `cdaId` no contrato. Identificador da CDA, e o que o parcelamento seleciona. */
  numeroCda: string
  exercicio: number | null
  /** `naturezaDivida` — IPTU, TCL etc. */
  natureza: string | null
  receita: string | null
  /** Texto da API, exibido como veio. */
  situacaoPrincipal: string | null
  situacaoHonorarios: string | null
  faseCobranca: string | null
  /**
   * Principal e honorários ficam **separados** por decisão D5: o cidadão precisa
   * identificar o que é o quê. Não somar num total aqui — a soma, se a tela quiser, é
   * apresentação.
   */
  valorPrincipal: number | null
  valorHonorarios: number | null
  /**
   * Elegibilidade decidida pela API (`selecionavelParcelamento`). Na dúvida é `false`:
   * nunca oferecer parcelamento por conta própria.
   */
  parcelavel: boolean
  /**
   * Protocolo de um requerimento já aberto para esta CDA, quando existe.
   *
   * Decisão D9: isto **informa e dá caminho** para o acompanhamento — nunca bloqueia. Quem
   * diz se pode parcelar é `parcelavel`, e os dois não se derivam um do outro.
   */
  protocoloRequerimentoAberto: string | null
  /** Inscrição a que a CDA pertence. Importa na busca por execução fiscal, que pode abranger mais de um imóvel. */
  inscricao: string | null
}

/**
 * Uma guia de parcelamento já existente — o datagrid 2 da tela de débitos.
 *
 * `GuiaDamResponse` tem ~30 campos; aqui estão só os que a tela de débitos mostra. `cotas`,
 * `grerjs` e `itens` ficam de fora até alguma tela pedir — mapear o que ninguém exibe só
 * cria superfície para o contrato quebrar sem ninguém notar.
 */
export interface GuiaParceladaDividaAtiva {
  numeroGuia: string
  /** `descricaoSituacaoGuia`, texto da API. */
  situacao: string | null
  tipoPagamento: string | null
  faseCobranca: string | null
  vencimento: string | null
  parcelasPagas: number | null
  totalParcelas: number | null
  valorTotal: number | null
  valorSaldo: number | null
  linhaDigitavel: string | null
  urlPdf: string | null
}

/** A tela de débitos inteira: o imóvel, os dois datagrids e os totais que a API calcula. */
export interface DebitosDividaAtiva {
  imovel: ImovelDividaAtiva | null
  /**
   * Falso só na consulta avulsa de imóvel não cadastrado, onde a resposta é somente
   * leitura. Nesse caso a tela mostra o CTA de cadastro, porque emitir guia e requerer
   * parcelamento exigem o cadastro.
   */
  imovelCadastrado: boolean
  cdas: DebitoDividaAtiva[]
  guiasParceladas: GuiaParceladaDividaAtiva[]
  /** Totais vêm da API, não de `.length`: ela desduplica número de guia. */
  totalCdas: number
  totalParcelado: number
  totalDebitos: number
  /** Texto institucional da API para "não há débitos" ou consulta parcial. */
  mensagem: string | null
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

/**
 * O critério único com que a tela de débitos consulta a API.
 *
 * "Único" é regra da API (RN-001/RN-002): `ConsultaFiltroRequest` aceita vários campos, mas
 * a consulta é por **um** deles. Modelar como união fechada em vez de objeto com três
 * opcionais impede, no tipo, a chamada ambígua que a API recusaria.
 *
 * Os três correspondem aos modos da tela de entrada — inscrição imobiliária (o imóvel), CDA
 * (a dívida inscrita) e execução fiscal (o processo judicial).
 */
export type CriterioDebitos =
  | { tipo: 'inscricao'; valor: string }
  | { tipo: 'cda'; valor: string }
  | { tipo: 'execucao-fiscal'; valor: string }

/**
 * Desfecho de uma consulta de débitos.
 *
 * Substitui o `DebitosDividaAtiva | null` que a fatia 1 devolvia. O `null` colapsava três
 * situações que a tela precisa distinguir, e a distinção não é cosmética — ela decide o que
 * o cidadão deve fazer a seguir:
 *
 * - `nao-cadastrado` (404): o imóvel não está em Meus Imóveis. Tentar de novo **não**
 *   resolve; cadastrar resolve.
 * - `indisponivel` (503 e demais): o serviço de dívida ativa do DAM está fora. O número
 *   digitado está certo e tentar de novo mais tarde resolve.
 *
 * Medido em homologação em 22/09/2026: inscrição cadastrada devolve 503
 * (`{"error":"Servico de Divida Ativa indisponivel no momento."}`) enquanto
 * `/imoveis/{inscricao}/consulta`, que atravessa o mesmo ePortal, devolve 200 — ou seja, os
 * dois desfechos acontecem de verdade e chegam pelo mesmo `null` de antes.
 *
 * "Sem débito" não está aqui: é `ok` com listas vazias, porque é resposta legítima da API.
 */
export type ConsultaDebitos =
  | { situacao: 'ok'; debitos: DebitosDividaAtiva }
  | { situacao: 'nao-cadastrado' }
  | { situacao: 'indisponivel' }
