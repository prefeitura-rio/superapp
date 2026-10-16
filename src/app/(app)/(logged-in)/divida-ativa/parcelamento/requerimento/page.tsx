import { AnexarDocumentos } from '@/app/components/divida-ativa/anexar-documentos'
import { EscolhaTipoSolicitante } from '@/app/components/divida-ativa/escolha-tipo-solicitante'
import type { TipoSolicitante } from '@/app/components/divida-ativa/escolha-tipo-solicitante'
import { RevisarRequerimentoShell } from '@/app/components/divida-ativa/revisar-requerimento-shell'
import { SimulacaoAviso } from '@/app/components/divida-ativa/simulacao-aviso'
import { SecondaryHeader } from '@/app/components/secondary-header'
import {
  getDalDividaAtivaConsultaAvulsa,
  getDalDividaAtivaSimulacao,
} from '@/lib/dal'
import { criterioDaUrl } from '@/lib/divida-ativa-utils'
import { getUserInfoFromToken } from '@/lib/user-info'
import { redirect } from 'next/navigation'

/**
 * Conjunto de valores aceitos para `?tipo=`.
 * A page valida para não propagar lixo da URL para o componente.
 */
const TIPOS_VALIDOS: ReadonlySet<string> = new Set([
  'PESSOA_FISICA',
  'PESSOA_JURIDICA',
  'SOCIEDADE_ANONIMA',
  'PROCURADOR',
  'OUTRO',
])

type EtapaRequerimento = 'tipo' | 'documentos' | 'revisao'

/**
 * Requerimento de parcelamento — fluxo de três etapas na mesma rota.
 *
 * ### Etapa 1 — Tipo de solicitante (`?etapa=tipo` ou ausente)
 *
 * O cidadão escolhe o vínculo com o imóvel (Pessoa Física, Jurídica, Sociedade Anônima,
 * Procurador ou Outro). A escolha define quais documentos serão exigidos na etapa seguinte.
 *
 * ### Etapa 2 — Documentos (`?etapa=documentos&tipo=PESSOA_FISICA`)
 *
 * Lista de slots de upload dependente do tipo. O cidadão anexa os documentos obrigatórios
 * (e opcionalmente os extras). Os arquivos ficam em `?documentos=` como JSON + base64
 * serializado — não há server action aqui.
 *
 * ### Etapa 3 — Revisão e envio (`?etapa=revisao&tipo=...&documentos=...`)
 *
 * Exibe um resumo (valor total, nº de parcelas, dados da CDA, carrossel de parcelas) e o
 * botão "Requerer parcelamento", que dispara a server action.
 *
 * ### Navegação
 *
 * - Voltar da etapa 1 → revisão de pagamento (`/parcelamento/revisao`)
 * - Voltar da etapa 2 → etapa 1 (tipo)
 * - Voltar da etapa 3 → etapa 2 (documentos)
 *
 * ### Contexto da URL
 *
 * Os parâmetros do parcelamento (`cdas`, `data`, `parcelas`, critério da consulta) chegam
 * da etapa de seleção de parcelas e seguem na URL em todas as etapas para:
 * - Reconstruir a tela de revisão de pagamento ao voltar
 * - Chamar o DAL na etapa de revisão para buscar os dados das CDAs
 * - Montar o corpo da server action
 */
export default async function RequerimentoPage({
  searchParams,
}: {
  searchParams: Promise<{
    inscricao?: string
    cda?: string
    execucaoFiscal?: string
    cdas?: string
    data?: string
    parcelas?: string
    etapa?: string
    tipo?: string
  }>
}) {
  const params = await searchParams

  // Sem critério de busca: o cidadão chegou aqui sem passar pela entrada do parcelamento.
  const criterio = criterioDaUrl(params)
  if (!criterio) {
    redirect('/divida-ativa/parcelamento')
  }

  const cdas = (params.cdas ?? '').split(',').filter(Boolean)
  const data = params.data ?? ''
  const parcelas = Number(params.parcelas) || 0

  // Sem CDAs selecionadas nem data/parcelas: volta para a simulação.
  if (cdas.length === 0 || !data || parcelas === 0) {
    const searchParamsSimulacao = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params).filter(
          (e): e is [string, string] =>
            typeof e[1] === 'string' &&
            !['etapa', 'tipo', 'documentos'].includes(e[0])
        )
      )
    )
    redirect(`/divida-ativa/parcelamento/simulacao?${searchParamsSimulacao}`)
  }

  // Parâmetros correntes da URL — passados para os componentes filhos navegarem sem perder contexto.
  const searchParamsAtual: Record<string, string> = Object.fromEntries(
    Object.entries(params).filter(
      (entry): entry is [string, string] => typeof entry[1] === 'string'
    )
  )

  const etapa: EtapaRequerimento =
    params.etapa === 'documentos'
      ? 'documentos'
      : params.etapa === 'revisao'
        ? 'revisao'
        : 'tipo'

  // Rota de retorno para cada etapa.
  const semEtapaEtipo = new URLSearchParams(
    Object.fromEntries(
      Object.entries(searchParamsAtual).filter(
        ([k]) => !['etapa', 'tipo'].includes(k)
      )
    )
  )
  const rotaRevisaoPagamento = `/divida-ativa/parcelamento/revisao?${semEtapaEtipo}`
  const rotaTipo = `/divida-ativa/parcelamento/requerimento?${new URLSearchParams({ ...Object.fromEntries(semEtapaEtipo), etapa: 'tipo' })}`
  const rotaDocumentos = params.tipo
    ? `/divida-ativa/parcelamento/requerimento?${new URLSearchParams({ ...Object.fromEntries(semEtapaEtipo), etapa: 'documentos', tipo: params.tipo })}`
    : rotaTipo

  const rotaVoltar =
    etapa === 'tipo'
      ? rotaRevisaoPagamento
      : etapa === 'documentos'
        ? rotaTipo
        : rotaDocumentos

  return (
    <div className="mx-auto flex min-h-lvh max-w-4xl flex-col pt-20 pb-4 text-foreground">
      <SecondaryHeader
        title=""
        className="max-w-4xl"
        route={rotaVoltar}
        forceRoute
      />

      {etapa === 'tipo' && (
        <EscolhaTipoSolicitante searchParamsAtual={searchParamsAtual} />
      )}

      {etapa === 'documentos' && (
        <EtapaDocumentos
          tipo={params.tipo}
          searchParamsAtual={searchParamsAtual}
        />
      )}

      {etapa === 'revisao' && (
        <EtapaRevisao
          cdas={cdas}
          data={data}
          parcelas={parcelas}
          tipo={params.tipo}
          searchParamsAtual={searchParamsAtual}
          rotaVoltar={rotaDocumentos}
          rotaRevisaoPagamento={rotaRevisaoPagamento}
        />
      )}
    </div>
  )
}

/** Etapa 2 — Documentos: valida o tipo e renderiza o componente de upload. */
function EtapaDocumentos({
  tipo,
  searchParamsAtual,
}: {
  tipo: string | undefined
  searchParamsAtual: Record<string, string>
}) {
  if (!tipo || !TIPOS_VALIDOS.has(tipo)) {
    // Tipo inválido ou ausente: volta para a escolha.
    redirect(
      `/divida-ativa/parcelamento/requerimento?${new URLSearchParams({
        ...searchParamsAtual,
        etapa: 'tipo',
      })}`
    )
  }

  return (
    <AnexarDocumentos
      tipo={tipo as TipoSolicitante}
      searchParamsAtual={searchParamsAtual}
    />
  )
}

/**
 * Etapa 3 — Revisão: busca dados das CDAs e simulação no servidor, depois entrega ao
 * `RevisarRequerimentoShell` que lê os documentos do `sessionStorage` no cliente.
 *
 * Os documentos não trafegam na URL (evita HTTP 431 por base64 nos headers).
 */
async function EtapaRevisao({
  cdas,
  data,
  parcelas,
  tipo,
  searchParamsAtual,
  rotaVoltar,
  rotaRevisaoPagamento,
}: {
  cdas: string[]
  data: string
  parcelas: number
  tipo: string | undefined
  searchParamsAtual: Record<string, string>
  rotaVoltar: string
  rotaRevisaoPagamento: string
}) {
  // Tipo inválido: volta para a escolha.
  if (!tipo || !TIPOS_VALIDOS.has(tipo)) {
    redirect(
      `/divida-ativa/parcelamento/requerimento?${new URLSearchParams({
        ...searchParamsAtual,
        etapa: 'tipo',
      })}`
    )
  }

  const { cpf } = await getUserInfoFromToken()

  // Busca a simulação de parcelamento para obter valor total e valor da 1ª parcela.
  const simulacao = await getDalDividaAtivaSimulacao(cdas, data, cpf)

  if (simulacao.situacao !== 'ok') {
    const descricao =
      simulacao.situacao === 'recusada'
        ? simulacao.mensagem
        : 'O serviço de dívida ativa está indisponível no momento. Tente novamente em alguns minutos.'

    return (
      <SimulacaoAviso
        titulo="Não foi possível carregar o resumo do parcelamento"
        descricao={descricao}
        acao={{ rotulo: 'Voltar', href: rotaRevisaoPagamento }}
      />
    )
  }

  const opcaoEscolhida =
    simulacao.opcoes.find(o => o.qtdeParcelas === parcelas) ?? null

  // Calcula o valor total (mesmo cálculo de `SelecaoParcelas`).
  const valorTotal =
    simulacao.valorTotalAvista !== null
      ? (simulacao.valorTotalAvista ?? 0) + (opcaoEscolhida?.valorJuros ?? 0)
      : null

  // Busca os dados das CDAs para o card de informações fiscais.
  const criterio = criterioDaUrl(searchParamsAtual)
  let debitosCdas: import('@/types/divida-ativa').DebitoDividaAtiva[] = []

  if (criterio) {
    const consulta = await getDalDividaAtivaConsultaAvulsa(criterio, cpf)
    if (consulta.situacao === 'ok') {
      debitosCdas = consulta.debitos.cdas.filter(c =>
        cdas.includes(c.numeroCda)
      )
    }
  }

  // Rota de volta para o upload, usada pelo shell caso os documentos não sejam encontrados.
  const rotaDocumentos = `/divida-ativa/parcelamento/requerimento?${new URLSearchParams(
    {
      ...searchParamsAtual,
      etapa: 'documentos',
    }
  )}`

  return (
    <RevisarRequerimentoShell
      cdas={cdas}
      qtdeParcelas={parcelas}
      dtVencimento={data}
      valor1aParcela={opcaoEscolhida?.valor1aParcela ?? null}
      valorTotal={valorTotal}
      debitosCdas={debitosCdas}
      tipo={tipo as TipoSolicitante}
      rotaVoltar={rotaVoltar}
      rotaDocumentos={rotaDocumentos}
    />
  )
}
