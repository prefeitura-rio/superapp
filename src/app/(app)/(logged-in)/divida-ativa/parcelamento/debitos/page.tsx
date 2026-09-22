import { DebitosErro } from '@/app/components/divida-ativa/debitos-erro'
import { DebitosSelecao } from '@/app/components/divida-ativa/debitos-selecao'
import { DebitosVazio } from '@/app/components/divida-ativa/debitos-vazio'
import { SecondaryHeader } from '@/app/components/secondary-header'
import {
  getDalDividaAtivaConsultaAvulsa,
  getDalDividaAtivaDebitos,
} from '@/lib/dal'
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
 * ### Por que dois endpoints, e não um
 *
 * O contrato tem `POST /divida-ativa/consultar`, que aceita qualquer um dos três critérios
 * e resolveria a tela com uma chamada só. **Ele não está deployado em homologação** — o
 * swagger de hom não o lista e a rota responde 404, enquanto o
 * `GET /imoveis/{inscricao}/divida-ativa` responde 401 sem token, ou seja, existe. Ele veio
 * para o `divida-ativa-api.yaml` deste repositório pela branch do backend, não pelo que está
 * no ar. É a única rota em que os dois divergem.
 *
 * Então o modo inscrição usa o GET, que funciona hoje, e os outros dois seguem no endpoint
 * do contrato — que falha até o backend subir. Trocar os três pelo GET não é opção: ele leva
 * a inscrição no path, e não há onde pôr uma CDA ou uma execução fiscal.
 *
 * O preço do GET é exigir o imóvel cadastrado em Meus Imóveis: inscrição de fora dela
 * responde 404. Enquanto a consulta avulsa não sobe, esse é o comportamento.
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
  const criterio = criterioDaUrl(await searchParams)

  // Sem critério não há o que consultar: volta para a escolha do modo em vez de mostrar uma
  // tela vazia. O endereço é compartilhável, e um link truncado não deve virar beco sem saída.
  if (!criterio) {
    redirect('/divida-ativa/parcelamento')
  }

  const { cpf } = await getUserInfoFromToken()

  const consulta =
    criterio.tipo === 'inscricao'
      ? await getDalDividaAtivaDebitos(criterio.valor, cpf)
      : await getDalDividaAtivaConsultaAvulsa(criterio, cpf)

  const temDebitos =
    consulta.situacao === 'ok' && consulta.debitos.cdas.length > 0

  return (
    <div className="mx-auto flex min-h-lvh max-w-4xl flex-col pt-20 pb-4 text-foreground">
      <SecondaryHeader
        title=""
        className="max-w-4xl"
        route="/divida-ativa/parcelamento"
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
