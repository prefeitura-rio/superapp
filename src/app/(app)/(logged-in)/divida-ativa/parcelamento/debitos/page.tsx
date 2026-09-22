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
 * Os três modos de entrada convergem nesta rota e numa única chamada —
 * `POST /divida-ativa/consultar`, que aceita qualquer um dos critérios e devolve a mesma
 * resposta. A alternativa, `GET /imoveis/{inscricao}/divida-ativa`, serviria só o modo
 * inscrição **e** responderia 404 para imóvel fora de Meus Imóveis: a tela de entrada aceita
 * qualquer inscrição digitada, então esse 404 seria o caminho comum, não a exceção.
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
  const debitos = await getDalDividaAtivaConsultaAvulsa(criterio, cpf)

  // `null` é falha da API — indisponibilidade do ePortal, token recusado. "Sem débito" é
  // outra coisa, e chega aqui como objeto com listas vazias.
  if (!debitos) {
    throw new Error('Não foi possível consultar os débitos de dívida ativa.')
  }

  const temDebitos = debitos.cdas.length > 0

  return (
    <div className="mx-auto flex min-h-lvh max-w-4xl flex-col pt-20 pb-4 text-foreground">
      <SecondaryHeader
        title=""
        className="max-w-4xl"
        route="/divida-ativa/parcelamento"
      />

      {temDebitos ? (
        <DebitosSelecao cdas={debitos.cdas} />
      ) : (
        <DebitosVazio mensagem={debitos.mensagem} />
      )}
    </div>
  )
}
