import { RequerimentosErro } from '@/app/components/divida-ativa/requerimentos-erro'
import { RequerimentosLista } from '@/app/components/divida-ativa/requerimentos-lista'
import { RequerimentosVazio } from '@/app/components/divida-ativa/requerimentos-vazio'
import { SecondaryHeader } from '@/app/components/secondary-header'
import { getDalDividaAtivaRequerimentos } from '@/lib/dal'
import { getUserInfoFromToken } from '@/lib/user-info'
import { redirect } from 'next/navigation'

/** O protocolo na URL é o número sem o ano, só dígitos — o que o formulário produz. */
const PROTOCOLO_VALIDO = /^\d{1,10}$/

/**
 * O requerimento de um protocolo.
 *
 * `GET /divida-ativa/requerimentos?protocolo=`: a API busca pelo número (sem o ano) e
 * confere se o requerente é o CPF do token — "não é seu" volta como 200 com mensagem, e
 * cai no mesmo estado vazio de "não existe". A lista tem um item e o protocolo em
 * destaque, porque foi ele que o cidadão digitou.
 *
 * Um protocolo fora do formato (link editado à mão) volta para o formulário, em vez de
 * virar chamada à toa.
 */
export default async function RequerimentoPage({
  params,
}: {
  params: Promise<{ protocolo: string }>
}) {
  const { protocolo } = await params

  if (!PROTOCOLO_VALIDO.test(protocolo)) {
    redirect('/divida-ativa/acompanhamento')
  }

  const { cpf } = await getUserInfoFromToken()
  const consulta = await getDalDividaAtivaRequerimentos(cpf, protocolo)

  return (
    <div className="mx-auto flex min-h-lvh max-w-4xl flex-col pt-20 pb-4 text-foreground">
      <SecondaryHeader
        title=""
        className="max-w-4xl"
        route="/divida-ativa/acompanhamento"
        forceRoute
      />

      {consulta.situacao === 'indisponivel' ? (
        <RequerimentosErro />
      ) : consulta.situacao === 'vazio' ? (
        <RequerimentosVazio
          titulo="Não encontramos requerimento para o protocolo informado"
          mensagem={consulta.mensagem}
        />
      ) : (
        <RequerimentosLista
          requerimentos={consulta.requerimentos}
          destaque="protocolo"
        />
      )}
    </div>
  )
}
