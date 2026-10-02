import { SelecaoDataVencimento } from '@/app/components/divida-ativa/selecao-data-vencimento'
import { SelecaoParcelas } from '@/app/components/divida-ativa/selecao-parcelas'
import { SimulacaoAviso } from '@/app/components/divida-ativa/simulacao-aviso'
import { SecondaryHeader } from '@/app/components/secondary-header'
import {
  getDalDividaAtivaDatasVencimento,
  getDalDividaAtivaSimulacao,
} from '@/lib/dal'
import { getUserInfoFromToken } from '@/lib/user-info'
import { redirect } from 'next/navigation'

/**
 * Simulação de parcelamento — duas etapas na mesma rota.
 *
 * ### Etapa 1 — Data de vencimento (sem `?data=`)
 *
 * O cidadão chega da tela de débitos com as CDAs selecionadas (`?cdas=`) e escolhe quando
 * vence a primeira parcela, entre as datas que o DAM oferece.
 *
 * ### Etapa 2 — Quantidade de parcelas (com `?data=`)
 *
 * Com a data escolhida, a simulação traz as opções de parcela e o valor da primeira. O
 * "Continuar" leva ao requerimento com `?data=` e `?parcelas=`.
 *
 * ### Por que a data vem antes
 *
 * O Figma desenha parcelas antes de data, mas o DAM calcula as opções **a partir da data**:
 * juros e descontos mudam com o vencimento, e a API recusa a simulação sem ela. Simular com
 * uma data provisória e trocá-la depois mostraria valores que deixam de valer — decidido
 * inverter as etapas em 02/10/2026.
 *
 * ### Sem inscrição
 *
 * Datas e simulação são pelas CDAs (`/divida-ativa/...`), sem exigir o imóvel em Meus
 * Imóveis: servem quem chegou pela inscrição, pela CDA ou pela execução fiscal. O critério
 * da consulta segue na URL só para o Voltar reconstruir a tela de débitos.
 */
export default async function SimulacaoPage({
  searchParams,
}: {
  searchParams: Promise<{
    inscricao?: string
    cda?: string
    execucaoFiscal?: string
    cdas?: string
    data?: string
  }>
}) {
  const params = await searchParams
  const { data, ...outrosParams } = params

  // Sem critério de busca: o cidadão chegou aqui sem passar pela entrada do parcelamento.
  const temCriterio = params.inscricao || params.cda || params.execucaoFiscal
  if (!temCriterio) {
    redirect('/divida-ativa/parcelamento')
  }

  // Filtra os undefined antes de montar o Record — searchParams tipado tem string | undefined.
  const searchParamsAtual = Object.fromEntries(
    Object.entries(outrosParams).filter(
      (entry): entry is [string, string] => entry[1] !== undefined
    )
  )
  const rotaDebitos = `/divida-ativa/parcelamento/debitos?${new URLSearchParams(
    Object.fromEntries(
      Object.entries(searchParamsAtual).filter(([chave]) => chave !== 'cdas')
    )
  )}`

  const cdas = (params.cdas ?? '').split(',').filter(Boolean)

  // Sem CDA selecionada não há o que simular: volta para a seleção de débitos.
  if (cdas.length === 0) {
    redirect(rotaDebitos)
  }

  // Rota de retorno:
  // - etapa 2 (com ?data=) volta à etapa 1 (sem ?data=)
  // - etapa 1 volta à tela de débitos
  const rotaVoltar = data
    ? `/divida-ativa/parcelamento/simulacao?${new URLSearchParams(searchParamsAtual)}`
    : rotaDebitos

  return (
    <div className="mx-auto flex min-h-lvh max-w-4xl flex-col pt-20 pb-4 text-foreground">
      <SecondaryHeader
        title=""
        className="max-w-4xl"
        route={rotaVoltar}
        forceRoute
      />

      {data ? (
        <EtapaParcelas
          cdas={cdas}
          data={data}
          searchParamsAtual={{ ...searchParamsAtual, data }}
          rotaVoltar={rotaVoltar}
        />
      ) : (
        <EtapaData
          searchParamsAtual={searchParamsAtual}
          rotaDebitos={rotaDebitos}
        />
      )}
    </div>
  )
}

async function EtapaData({
  searchParamsAtual,
  rotaDebitos,
}: {
  searchParamsAtual: Record<string, string>
  rotaDebitos: string
}) {
  const datas = await getDalDividaAtivaDatasVencimento()

  if (!datas || datas.length === 0) {
    return (
      <SimulacaoAviso
        titulo="Não há datas de vencimento disponíveis"
        descricao={
          datas
            ? 'O sistema da Procuradoria não ofereceu nenhuma data para a primeira parcela agora. Tente novamente mais tarde.'
            : 'O serviço de dívida ativa está indisponível no momento. Tente novamente em alguns minutos.'
        }
        acao={{ rotulo: 'Voltar aos débitos', href: rotaDebitos }}
      />
    )
  }

  return (
    <SelecaoDataVencimento
      datas={datas}
      searchParamsAtual={searchParamsAtual}
    />
  )
}

async function EtapaParcelas({
  cdas,
  data,
  searchParamsAtual,
  rotaVoltar,
}: {
  cdas: string[]
  data: string
  searchParamsAtual: Record<string, string>
  rotaVoltar: string
}) {
  const { cpf } = await getUserInfoFromToken()
  const simulacao = await getDalDividaAtivaSimulacao(cdas, data, cpf)

  if (simulacao.situacao === 'recusada') {
    return (
      <SimulacaoAviso
        titulo="Não foi possível simular o parcelamento"
        descricao={simulacao.mensagem}
        acao={{ rotulo: 'Escolher outra data', href: rotaVoltar }}
      />
    )
  }

  if (simulacao.situacao === 'indisponivel') {
    return (
      <SimulacaoAviso
        titulo="O serviço de dívida ativa está indisponível no momento"
        descricao="A sua seleção está correta — quem não respondeu foi o sistema da Procuradoria. Tente novamente em alguns minutos."
        acao={{ rotulo: 'Voltar', href: rotaVoltar }}
      />
    )
  }

  if (simulacao.opcoes.length === 0) {
    return (
      <SimulacaoAviso
        titulo="Não há opções de parcelamento para esta seleção"
        descricao="Tente outra data de vencimento ou outra combinação de débitos."
        acao={{ rotulo: 'Escolher outra data', href: rotaVoltar }}
      />
    )
  }

  return (
    <SelecaoParcelas
      opcoes={simulacao.opcoes}
      searchParamsAtual={searchParamsAtual}
    />
  )
}
