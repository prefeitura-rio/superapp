import { RevisaoPagamento } from '@/app/components/divida-ativa/revisao-pagamento'
import { SimulacaoAviso } from '@/app/components/divida-ativa/simulacao-aviso'
import { SecondaryHeader } from '@/app/components/secondary-header'
import { getDalDividaAtivaRevisaoPagamento } from '@/lib/dal'
import { criterioDaUrl } from '@/lib/divida-ativa-utils'
import { getUserInfoFromToken } from '@/lib/user-info'
import { redirect } from 'next/navigation'

/**
 * "Revise as informações de pagamento" — entre a seleção de débitos e a simulação.
 *
 * ### Simulação à vista, não a consulta de novo
 *
 * Descontos e GRERJ só existem depois de uma simulação à vista; a consulta de débitos não os
 * tem. Por isso esta rota chama `POST /divida-ativa/avista/simular` com as CDAs de `?cdas=`, e
 * a API simula com a primeira data à vista do DAM — o cidadão ainda não escolheu o vencimento
 * do parcelamento. É uma chamada só: a API já reconsulta as CDAs para validá-las e para
 * trazer contribuinte e natureza, então repetir a consulta aqui seria pagar os ~16 s duas vezes.
 *
 * A elegibilidade é da API, a mesma do parcelamento: uma CDA editada à mão em `?cdas=` que não
 * pode ser parcelada volta como recusa com motivo, e a tela a mostra.
 *
 * O critério da consulta (`inscricao`, `cda` ou `execucaoFiscal`) segue na URL só para o Voltar
 * reconstruir a tela de débitos.
 */
export default async function RevisaoPage({
  searchParams,
}: {
  searchParams: Promise<{
    inscricao?: string
    cda?: string
    execucaoFiscal?: string
    cdas?: string
  }>
}) {
  const params = await searchParams

  if (!criterioDaUrl(params)) {
    redirect('/divida-ativa/parcelamento')
  }

  const searchParamsAtual = Object.fromEntries(
    Object.entries(params).filter(
      (entry): entry is [string, string] => entry[1] !== undefined
    )
  )
  // Volta para a seleção de débitos, com o mesmo critério e a seleção marcada — o cidadão
  // pode querer ajustar as CDAs.
  const rotaDebitos = `/divida-ativa/parcelamento/debitos?${new URLSearchParams(searchParamsAtual)}`

  const cdas = (params.cdas ?? '').split(',').filter(Boolean)

  // Sem CDA selecionada não há o que revisar.
  if (cdas.length === 0) {
    redirect(rotaDebitos)
  }

  const { cpf } = await getUserInfoFromToken()
  const revisao = await getDalDividaAtivaRevisaoPagamento(cdas, cpf)

  return (
    <div className="mx-auto flex min-h-lvh max-w-4xl flex-col pt-20 pb-4 text-foreground">
      <SecondaryHeader
        title=""
        className="max-w-4xl"
        route={rotaDebitos}
        forceRoute
      />

      {revisao.situacao === 'recusada' ? (
        <SimulacaoAviso
          titulo="Não foi possível calcular o pagamento"
          descricao={revisao.mensagem}
          acao={{ rotulo: 'Voltar aos débitos', href: rotaDebitos }}
        />
      ) : revisao.situacao === 'indisponivel' ? (
        <SimulacaoAviso
          titulo="O serviço de dívida ativa está indisponível no momento"
          descricao="A sua seleção está correta — quem não respondeu foi o sistema da Procuradoria. Tente novamente em alguns minutos."
          acao={{ rotulo: 'Voltar aos débitos', href: rotaDebitos }}
        />
      ) : (
        <RevisaoPagamento
          revisao={revisao}
          cdas={cdas}
          rotaContinuar={`/divida-ativa/parcelamento/simulacao?${new URLSearchParams(searchParamsAtual)}`}
        />
      )}
    </div>
  )
}
