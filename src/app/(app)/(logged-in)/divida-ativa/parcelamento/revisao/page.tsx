import { DebitosErro } from '@/app/components/divida-ativa/debitos-erro'
import { RevisaoPagamento } from '@/app/components/divida-ativa/revisao-pagamento'
import { SecondaryHeader } from '@/app/components/secondary-header'
import { getDalDividaAtivaConsultaAvulsa } from '@/lib/dal'
import { criterioDaUrl } from '@/lib/divida-ativa-utils'
import { getUserInfoFromToken } from '@/lib/user-info'
import { redirect } from 'next/navigation'

/**
 * "Revise as informações de pagamento" — entre a seleção de débitos e a simulação.
 *
 * ### Por que consulta de novo em vez de receber a seleção por navegação
 *
 * `DebitosSelecao` é Client Component: o estado de seleção vive só nele e some ao navegar.
 * A alternativa seria guardar os objetos completos em `sessionStorage`, mas isso quebraria a
 * convenção do módulo de que **a URL é a fonte da verdade** (um link compartilhado ou um
 * refresh teriam de funcionar sem o storage). Por isso esta rota repete a mesma consulta de
 * `/parcelamento/debitos` — ela já é `no-store` e o cidadão já pagou o mesmo custo de ~16 s
 * entre `/debitos` e `/simulacao` antes desta PR, então o padrão não piora a jornada.
 *
 * As CDAs exibidas são a interseção entre o que a consulta devolve agora e o que veio
 * marcado em `?cdas=` — a mesma defesa contra seleção fantasma que `DebitosSelecao` já faz.
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
  const criterio = criterioDaUrl(params)

  if (!criterio) {
    redirect('/divida-ativa/parcelamento')
  }

  const modoVoltar =
    criterio.tipo === 'inscricao'
      ? 'inscricao'
      : criterio.tipo === 'cda'
        ? 'cda'
        : 'execucao-fiscal'

  // Volta para a tela de seleção de débitos, com o mesmo critério — não para o formulário de
  // entrada, porque o cidadão já tinha escolhido as CDAs e precisa poder ajustá-las.
  const searchParamsAtual = Object.fromEntries(
    Object.entries(params).filter(
      (entry): entry is [string, string] =>
        entry[1] !== undefined && entry[0] !== 'cdas'
    )
  )
  const rotaDebitos = `/divida-ativa/parcelamento/debitos?${new URLSearchParams(searchParamsAtual)}`

  const cdasSelecionadas = (params.cdas ?? '').split(',').filter(Boolean)

  // Sem CDA selecionada não há o que revisar: volta para a seleção de débitos.
  if (cdasSelecionadas.length === 0) {
    redirect(rotaDebitos)
  }

  const { cpf } = await getUserInfoFromToken()
  const consulta = await getDalDividaAtivaConsultaAvulsa(criterio, cpf)

  if (consulta.situacao !== 'ok') {
    return (
      <div className="mx-auto flex min-h-lvh max-w-4xl flex-col pt-20 pb-4 text-foreground">
        <SecondaryHeader
          title=""
          className="max-w-4xl"
          route={rotaDebitos}
          forceRoute
        />
        <DebitosErro tipo={consulta.situacao} />
      </div>
    )
  }

  // Só o que existe nesta lista e segue marcado: uma CDA que deixou de vir na consulta (ex.:
  // já foi parcelada por outra via) não pode aparecer na revisão como se ainda estivesse lá.
  const existentes = new Set(consulta.debitos.cdas.map(cda => cda.numeroCda))
  const cdas = consulta.debitos.cdas.filter(
    cda =>
      cdasSelecionadas.includes(cda.numeroCda) && existentes.has(cda.numeroCda)
  )

  if (cdas.length === 0) {
    redirect(rotaDebitos)
  }

  const rotaContinuar = `/divida-ativa/parcelamento/simulacao?${new URLSearchParams(
    { ...searchParamsAtual, cdas: cdasSelecionadas.join(',') }
  )}`

  return (
    <div className="mx-auto flex min-h-lvh max-w-4xl flex-col pt-20 pb-4 text-foreground">
      <SecondaryHeader
        title=""
        className="max-w-4xl"
        route={rotaDebitos}
        forceRoute
      />

      <RevisaoPagamento cdas={cdas} rotaContinuar={rotaContinuar} />
    </div>
  )
}
