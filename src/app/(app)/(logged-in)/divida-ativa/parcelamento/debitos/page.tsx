import { DebitosErro } from '@/app/components/divida-ativa/debitos-erro'
import { DebitosSelecao } from '@/app/components/divida-ativa/debitos-selecao'
import { DebitosVazio } from '@/app/components/divida-ativa/debitos-vazio'
import { SecondaryHeader } from '@/app/components/secondary-header'
import { getDalDividaAtivaConsultaAvulsa } from '@/lib/dal'
import { criterioDaUrl } from '@/lib/divida-ativa-utils'
import { getUserInfoFromToken } from '@/lib/user-info'
import { redirect } from 'next/navigation'

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
    cdas?: string
  }>
}) {
  const params = await searchParams
  const criterio = criterioDaUrl(params)

  // Sem critério não há o que consultar: volta para a escolha do modo em vez de mostrar uma
  // tela vazia. O endereço é compartilhável, e um link truncado não deve virar beco sem saída.
  if (!criterio) {
    redirect('/divida-ativa/parcelamento')
  }

  // Volta para o formulário do modo usado, com o número consultado e as escolhas já feitas
  // adiante (`cdas`, `data`...) — o campo reaparece preenchido e, se o cidadão consultar o
  // mesmo número, a seleção volta marcada.
  const paramsAtuais = Object.fromEntries(
    Object.entries(params).filter(
      (entry): entry is [string, string] => typeof entry[1] === 'string'
    )
  )
  const rotaVoltar = `/divida-ativa/parcelamento?${new URLSearchParams({
    modo: criterio.tipo,
    ...paramsAtuais,
  })}`

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
