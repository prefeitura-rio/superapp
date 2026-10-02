import { DebitosErro } from '@/app/components/divida-ativa/debitos-erro'
import { DebitosSelecao } from '@/app/components/divida-ativa/debitos-selecao'
import { DebitosVazio } from '@/app/components/divida-ativa/debitos-vazio'
import { SecondaryHeader } from '@/app/components/secondary-header'
import { getDalDividaAtivaConsultaAvulsa } from '@/lib/dal'
import { getUserInfoFromToken } from '@/lib/user-info'
import type { CriterioDebitos } from '@/types/divida-ativa'
import { redirect } from 'next/navigation'

/**
 * Traduz o que a tela de entrada pôs na URL no critério único da consulta.
 *
 * A ordem é a da lista de modos, e o primeiro preenchido vence: a API aceita **um** critério
 * por consulta (RN-001/RN-002), e um endereço editado à mão com dois parâmetros não pode
 * virar chamada ambígua.
 */
function criterioDaUrl(params: {
  inscricao?: string
  cda?: string
  execucaoFiscal?: string
}): CriterioDebitos | null {
  if (params.inscricao) return { tipo: 'inscricao', valor: params.inscricao }
  if (params.cda) return { tipo: 'cda', valor: params.cda }
  if (params.execucaoFiscal) {
    return { tipo: 'execucao-fiscal', valor: params.execucaoFiscal }
  }

  return null
}

/**
 * Débitos encontrados para o número consultado, e a seleção do que entra no parcelamento.
 *
 * ### Um endpoint para os três modos
 *
 * Inscrição, CDA e execução fiscal vão todos por `POST /divida-ativa/consultar`, que não
 * exige o imóvel em Meus Imóveis. Até 02/10/2026 o modo inscrição usava
 * `GET /imoveis/{inscricao}/divida-ativa`, porque a consulta avulsa ainda não estava em
 * homologação — e por isso a inscrição digitada só funcionava se o imóvel estivesse
 * cadastrado. O parcelamento também segue pelas CDAs, sem o cadastro.
 *
 * ⚠️ A chamada atravessa o ePortal e leva ~16 s — daí o `loading.tsx` com skeleton ao lado.
 *
 * Três saídas, e a distinção entre elas importa:
 * - **com débitos** → a lista com checkboxes;
 * - **sem débitos** → 200 com listas vazias, que é resposta legítima e tem tela própria;
 * - **falha** → `null` do DAL, que sobe para o `error.tsx` do módulo.
 */
export default async function DebitosPage({
  searchParams,
}: {
  searchParams: Promise<{
    inscricao?: string
    cda?: string
    execucaoFiscal?: string
  }>
}) {
  const params = await searchParams
  const criterio = criterioDaUrl(params)

  // Sem critério não há o que consultar: volta para a escolha do modo em vez de mostrar uma
  // tela vazia. O endereço é compartilhável, e um link truncado não deve virar beco sem saída.
  if (!criterio) {
    redirect('/divida-ativa/parcelamento')
  }

  // Volta para o formulário do modo usado — preserva o ?modo= para o cidadão não perder
  // o contexto (ex: voltou de débitos e ainda está na aba "Inscrição imobiliária").
  const modoVoltar =
    criterio.tipo === 'inscricao'
      ? 'inscricao'
      : criterio.tipo === 'cda'
        ? 'cda'
        : 'execucao-fiscal'
  const rotaVoltar = `/divida-ativa/parcelamento?modo=${modoVoltar}`

  const { cpf } = await getUserInfoFromToken()

  const consulta = await getDalDividaAtivaConsultaAvulsa(criterio, cpf)

  const temDebitos =
    consulta.situacao === 'ok' && consulta.debitos.cdas.length > 0

  return (
    <div className="mx-auto flex min-h-lvh max-w-4xl flex-col pt-20 pb-4 text-foreground">
      <SecondaryHeader
        title=""
        className="max-w-4xl"
        route={rotaVoltar}
        forceRoute
      />

      {consulta.situacao !== 'ok' ? (
        <DebitosErro tipo={consulta.situacao} />
      ) : temDebitos ? (
        <DebitosSelecao cdas={consulta.debitos.cdas} />
      ) : (
        <DebitosVazio mensagem={consulta.debitos.mensagem} />
      )}
    </div>
  )
}
